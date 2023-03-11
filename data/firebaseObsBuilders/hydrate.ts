import { CountdownType } from "@/helpers/countdownType"
import { objKeys } from "@/helpers/objKeys"
import { clone, update } from "lodash-es"
import {
  BehaviorSubject,
  combineLatest,
  map,
  Observable,
  of,
  shareReplay,
  switchMap,
} from "rxjs"
import {
  PathMapToCollectionName,
  PathMapToForeignKeyData,
} from "../baseTypes/ForeignKey"
import { buildCacheFromCacheSubject } from "../builders/buildCacheFromCacheSubject"
import { buildObsForDoc } from "../builders/buildObsForDoc"
import { ParamaterizedObservable } from "../ParamaterizedObservable"
import {
  ArgsTypeFromParamObs,
  ValueTypeFromParamObs,
} from "../paramObsBuilders/ParamObsTypeUtils"
import { CollectionModels } from "./CollectionModels"

type RecordValueParamObs = ParamaterizedObservable<any, Record<any, any>, any>

type HydratedParamObs<
  ParamObs extends RecordValueParamObs,
  HydratedPaths extends Partial<
    PathMapToCollectionName<ValueTypeFromParamObs<ParamObs>>
  >
> = ParamaterizedObservable<
  ArgsTypeFromParamObs<ParamObs>,
  GetHydratedValue<ValueTypeFromParamObs<ParamObs>, HydratedPaths>,
  "hydrated"
>

export type GetHydratedValueForKey<
  HydratedPaths extends string,
  OriginalObj extends Record<any, any>,
  key extends string,
  Path extends string = "",
  I extends number = 5
> = `${Path}${key}` extends keyof PathMapToForeignKeyData<OriginalObj>
  ? PathMapToForeignKeyData<OriginalObj>[`${Path}${key}`] extends {
      _referenceType: any
      _model: any
    }
    ? PathMapToForeignKeyData<OriginalObj>[`${Path}${key}`]["_referenceType"] extends any[]
      ? RecursivelyGetHydratedValues<
          HydratedPaths,
          OriginalObj,
          PathMapToForeignKeyData<OriginalObj>[`${Path}${key}`]["_model"],
          `${Path}${key}.`,
          CountdownType[I]
        >[]
      : RecursivelyGetHydratedValues<
          HydratedPaths,
          OriginalObj,
          PathMapToForeignKeyData<OriginalObj>[`${Path}${key}`]["_model"],
          `${Path}${key}.`,
          CountdownType[I]
        >
    : never
  : never

export type RecursivelyGetHydratedValues<
  HydratedPaths extends string,
  OriginalObj extends Record<any, any>,
  Obj extends Record<any, any>,
  Path extends string = "",
  I extends number = 5
> = Obj & {
  hydrated: [I] extends [never]
    ? never
    : {
        [key in Extract<
          keyof Obj,
          string
        > as `${Path}${key}` extends keyof PathMapToForeignKeyData<OriginalObj> &
          HydratedPaths
          ? key
          : never]: GetHydratedValueForKey<
          HydratedPaths,
          OriginalObj,
          key,
          Path,
          I
        >
      }
}

export type GetHydratedValue<
  ObjType extends Record<string, any>,
  PathMap extends Partial<PathMapToCollectionName<ObjType>>
> = RecursivelyGetHydratedValues<
  Extract<keyof PathMap, string>,
  ObjType,
  ObjType
>

type ValueTypeFromObs<Obs extends Observable<any>> = Obs extends Observable<
  infer T
>
  ? T
  : never

type ReturnTypeMapFromObsFnMap<
  FnMap extends Record<
    string,
    (arg: any) => Observable<any> | ParamaterizedObservable<any, any, any>
  >
> = {
  [key in keyof FnMap]: ReturnType<FnMap[key]> extends ParamaterizedObservable<
    any,
    any,
    any
  >
    ? ValueTypeFromParamObs<ReturnType<FnMap[key]>>
    : ValueTypeFromObs<ReturnType<FnMap[key]>>
}

export const hydrateObjArray =
  <ArgsType extends any, ValueType extends any>(
    objObs: ParamaterizedObservable<ArgsType, ValueType[], any>
  ) =>
  <
    ProcessMapType extends Record<string, (input: ValueType) => Observable<any>>
  >(
    processMap: ProcessMapType
  ): ParamaterizedObservable<
    ArgsType,
    (ValueType & ReturnTypeMapFromObsFnMap<ProcessMapType>)[],
    any
  > => {
    return objObs.pipe(
      switchMap((objs) => {
        const hydratedObs = objs.map((obj) => {
          const processorObs = objKeys(processMap).map((key) => {
            const processor = processMap[key]
            return processor(obj).pipe(
              map((res) => {
                const objClone = clone(obj) as ValueType &
                  ReturnTypeMapFromObsFnMap<ProcessMapType>
                objClone[key] = res as any
                return objClone
              })
            )
          })
          const combinedProcessorResults = processorObs.length
            ? combineLatest(processorObs)
            : of(
                [] as (ValueType & ReturnTypeMapFromObsFnMap<ProcessMapType>)[]
              )
          return combinedProcessorResults.pipe(
            map((vals) => {
              return vals.reduce((acc, value) => {
                return { ...acc, ...value }
              }, {})
            })
          )
        })
        return hydratedObs.length
          ? combineLatest(hydratedObs)
          : of(
              [] as ParamaterizedObservable<
                ArgsType,
                (ValueType & ReturnTypeMapFromObsFnMap<ProcessMapType>)[],
                any
              >[]
            )
      })
    ) as ParamaterizedObservable<
      ArgsType,
      (ValueType & ReturnTypeMapFromObsFnMap<ProcessMapType>)[],
      any
    >
  }

export const hydrateObj =
  <ObjType extends Record<string, any>>(
    obj: ObjType,
    cacheSubject: BehaviorSubject<any>
  ) =>
  <PathMapToHydrate extends Partial<PathMapToCollectionName<ObjType>>>(
    hydrationPathMap: PathMapToHydrate
  ): Observable<GetHydratedValue<ObjType, PathMapToHydrate>> => {
    const hydrationMap = {}
    objKeys(hydrationPathMap).forEach((key) => {
      update(hydrationMap, key, () => false)
    })

    const hydrateTree = (
      objToHydrate: Record<string, any>,
      treeOfKeysToHydrate: Record<string, any>,
      basePath = ""
    ) => {
      const keysToHydrate = objKeys(treeOfKeysToHydrate)
      const obsForHydratedKeys = keysToHydrate.map((keyToHydrate) => {
        const pathToHydrate = `${basePath}${keyToHydrate}`
        const collectionName = hydrationPathMap[
          pathToHydrate
        ] as keyof CollectionModels

        const hydrateForeignKey = (
          keyToHydrateName: string,
          foreignKeyValue: string
        ): Observable<any> => {
          const cache = buildCacheFromCacheSubject(
            cacheSubject,
            `hydration-${collectionName}`
          )
          return buildObsForDoc(collectionName, foreignKeyValue, cache).pipe(
            switchMap((hydratedValue) => {
              const nextTreeToHydrate = treeOfKeysToHydrate[keyToHydrateName]
              if (nextTreeToHydrate) {
                return hydrateTree(
                  hydratedValue,
                  nextTreeToHydrate,
                  `${basePath}${keyToHydrate}.`
                )
              } else {
                return of(hydratedValue)
              }
            })
          )
        }

        const foreignKeyOrKeys = objToHydrate[keyToHydrate]

        if (Array.isArray(foreignKeyOrKeys)) {
          return foreignKeyOrKeys.length
            ? combineLatest(
                foreignKeyOrKeys.map((foreignKey) => {
                  return hydrateForeignKey(keyToHydrate, foreignKey)
                })
              )
            : of([])
        } else {
          return hydrateForeignKey(keyToHydrate, foreignKeyOrKeys)
        }
      })

      const allHydrationComplete = obsForHydratedKeys.length
        ? combineLatest(obsForHydratedKeys)
        : of([])

      return allHydrationComplete.pipe(
        map((hydratedValues: any[]) => {
          const objWithHydratedValues = { ...objToHydrate } as GetHydratedValue<
            ObjType,
            PathMapToHydrate
          >
          hydratedValues.forEach((hydratedValue, i) => {
            const keyForThisValue = keysToHydrate[i]
            objWithHydratedValues["hydrated"] =
              objWithHydratedValues["hydrated"] ||
              ({} as GetHydratedValue<ObjType, PathMapToHydrate>["hydrated"])
            objWithHydratedValues["hydrated"][keyForThisValue] = hydratedValue
          })
          return objWithHydratedValues
        })
      )
    }

    return obj
      ? hydrateTree({ ...obj }, hydrationMap)
      : (of(obj) as Observable<GetHydratedValue<ObjType, PathMapToHydrate>>)
  }

export const hydrateForeignKeys =
  <ParamObsType extends RecordValueParamObs>(obs: ParamObsType) =>
  <
    PathMapToHydrate extends Partial<
      PathMapToCollectionName<ValueTypeFromParamObs<ParamObsType>>
    >
  >(
    hydrationPathMap: PathMapToHydrate
  ): HydratedParamObs<ParamObsType, PathMapToHydrate> => {
    const hydratedObs = obs
      .pipe(
        switchMap((value) =>
          hydrateObj(value, obs.cacheBehaviorSubject)(hydrationPathMap)
        )
      )
      .pipeWithLoading(shareReplay({ bufferSize: 1, refCount: true }))
    return hydratedObs as unknown as HydratedParamObs<
      ParamObsType,
      PathMapToHydrate
    >
  }
