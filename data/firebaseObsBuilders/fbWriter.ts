import { deepMapObj } from "@/helpers/deepMapObj"
import { objHasUndef } from "@/helpers/filterUndef"
import { mountOnceAndIgnore } from "@/helpers/mountOnceAndIgnore"
import { Paths, PathValue } from "@/helpers/ObjectPathHelpers"
import { objKeys } from "@/helpers/objKeys"
import { HydrationMapFromModelType } from "@/page_helpers/admin/buildDocumentDisplayFromFieldDisplays"
import { updateHydratedValues } from "@/page_helpers/admin/updateHydratedValues"
import { clone, isArray, isEqual, isUndefined, set } from "lodash-es"
import {
  BehaviorSubject,
  filter,
  map,
  pairwise,
  startWith,
  tap,
  withLatestFrom,
} from "rxjs"
import { ValuesType } from "utility-types"
import { ForeignKey, PathMapToCollectionName } from "../baseTypes/ForeignKey"
import { AnyGenericModel } from "../baseTypes/Model"
import { obsToNamedParamObs } from "../builders/obsToNamedParamObs"
import { creators, setters } from "../fb"
import {
  isParameterizedObservable,
  ParamaterizedObservable,
} from "../ParamaterizedObservable"
import { combine } from "../paramObsBuilders/combine"
import { ValueTypeFromParamObs } from "../paramObsBuilders/ParamObsTypeUtils"
import { CollectionModels } from "./CollectionModels"

export type KeyError = {
  message: string
}

export type ErrorStructure = Record<string, any>

type HydratedKeyErrorKeys<BaseValueType extends Record<string, any>> =
  keyof PathMapToCollectionName<BaseValueType>

export type ErrorType<ErrorStructureType extends ErrorStructure> = {
  named?: ErrorStructureType
  hasError: boolean
}

type BeforeWrite<
  DataType extends Record<string, any>,
  ErrorStructureType extends ErrorStructure
> = (args: { data: DataType; baseData: DataType }) => {
  data: DataType
  errors: ErrorStructureType
}

type ModifyWrite<
  DataType extends Record<string, any>,
  ErrorStructureType extends ErrorStructure
> = (args: {
  data: DataType
  baseData: DataType
  errors: ErrorType<ErrorStructureType>
}) => DataType

export enum EditingState {
  Editing,
  Saved,
  Cancelled,
}

const isKeyError = (
  errorOrString: string | KeyError
): errorOrString is KeyError => {
  return typeof errorOrString === "object"
}

type FbWriterOptions<
  BaseValueType extends ValuesType<CollectionModels>,
  CollectionNameType extends keyof CollectionModels,
  EditingStateOverrideArgs extends Record<string, any>,
  ErrorStructureType extends ErrorStructure
> = {
  beforeWrite?: BeforeWrite<BaseValueType, ErrorStructureType>
  afterWrite?: (data: BaseValueType, dataBeforeWrite: BaseValueType) => void
  modifyWrite?: ModifyWrite<BaseValueType, ErrorStructureType>
  autoSave?: boolean
  onCreate?: (arg: {
    id: ForeignKey<CollectionNameType>
    clearEditingData: () => void
  }) => void
  editingStateOverride?: ParamaterizedObservable<
    EditingStateOverrideArgs,
    EditingState,
    any
  >
}

export const fbWriter = <
  CollectionNameType extends keyof CollectionModels,
  BaseValueParamObs extends ParamaterizedObservable<any, any, any>,
  ErrorStructureType extends ErrorStructure,
  EditingStateOverrideArgs extends Record<string, any> = {}
>(
  collectionName: CollectionNameType,
  baseValueObs: BaseValueParamObs,
  options: FbWriterOptions<
    ValueTypeFromParamObs<BaseValueParamObs>,
    CollectionNameType,
    EditingStateOverrideArgs,
    ErrorStructureType
  > & {
    persistHydratedFields?: Partial<
      HydrationMapFromModelType<ValueTypeFromParamObs<BaseValueParamObs>>
    >
  } = {}
) => {
  type ValueType = ValueTypeFromParamObs<BaseValueParamObs>

  const editinStateSubject =
    options.editingStateOverride || new BehaviorSubject(EditingState.Cancelled)
  const dataToWriteSubject = new BehaviorSubject(undefined as ValueType)

  const remoteUpdatePipeToSubject = baseValueObs.pipe(
    startWith(undefined as ValueType),
    withLatestFrom(
      editinStateSubject.pipe(startWith(undefined as EditingState))
    ),
    pairwise(),
    filter(([prev, current], i) => {
      const oldBaseValue = prev[0]
      const newBaseValue = current[0]
      const currentEditingState = current[1]

      return (
        !isEqual(oldBaseValue, newBaseValue) &&
        (currentEditingState !== EditingState.Editing || i == 0)
      )
    }),
    map(([prev, current]) => current[0]),
    tap((baseValue) => {
      dataToWriteSubject.next(baseValue)
    })
  )

  const editingStateParamObs = isParameterizedObservable(editinStateSubject)
    ? editinStateSubject
    : obsToNamedParamObs(editinStateSubject, "editingState")

  const resetDataToWriteOnCancelObs = editingStateParamObs.pipe(
    startWith(undefined as EditingState),
    withLatestFrom(baseValueObs.pipe(startWith(undefined as ValueType))),
    pairwise(),
    tap(([[prevEditingState], [currentEditingState, baseValue]]) => {
      if (
        !isUndefined(prevEditingState) &&
        prevEditingState !== EditingState.Cancelled &&
        currentEditingState === EditingState.Cancelled
      ) {
        dataToWriteSubject.next(baseValue)
      }
    })
  )

  const writeResultsObs = combine({
    editingState: editingStateParamObs,
    dataToWrite: obsToNamedParamObs(dataToWriteSubject, "dataToWrite"),
  }).pipe(
    withLatestFrom(baseValueObs),
    startWith([
      {
        editingState: undefined as EditingState,
        dataToWrite: undefined as ValueType,
      },
      undefined as ValueType,
    ] as const),
    map(([{ editingState, dataToWrite }, baseValue]) => {
      return [editingState, dataToWrite, baseValue as ValueType] as const
    }),
    pairwise(),
    map(([prev, current]) => {
      const prevState = prev[0]
      const currentState = current[0]
      const currentDataToWrite = current[1]

      const baseData = current[2] || ({} as ValueType)

      const updatedDataToWrite = { ...baseData, ...currentDataToWrite }

      const toWriteClone = clone(updatedDataToWrite)

      const beforeWrite =
        options.beforeWrite ||
        ((() => ({
          data: toWriteClone,
          errors: {} as ErrorStructureType,
        })) as typeof options.beforeWrite)

      const { data: processedToWrite, errors } = beforeWrite({
        data: toWriteClone,
        baseData: baseData,
      })

      let hasError = false
      deepMapObj(errors, (value) => {
        if (value) {
          hasError = true
        }
      })

      const editingComplete =
        currentState === EditingState.Saved &&
        prevState === EditingState.Editing

      const timeToSave =
        editingComplete || (options.autoSave && EditingState.Editing)

      return {
        errors: { named: errors, hasError } as ErrorType<ErrorStructureType>,
        data: processedToWrite,
        isEditing: currentState === EditingState.Editing,
        editingState: currentState,
        isCreate: !baseData?.createdAt,
        dataBeforeWrite: baseData,
        editingComplete,
        shouldWrite: !errors.hasError && !!processedToWrite && timeToSave,
      }
    }),
    tap(async (dataAndErrors) => {
      if (dataAndErrors.shouldWrite) {
        const uid = dataAndErrors.data.uid
        const modifyWriteFn =
          dataAndErrors.editingComplete && options.modifyWrite
            ? options.modifyWrite
            : ({ data }) => data as ModifyWrite<any, any>
        const cleanForWrite = modifyWriteFn({
          data: { ...dataAndErrors.data },
          baseData: dataAndErrors.dataBeforeWrite,
          errors: dataAndErrors.errors,
        })
        delete cleanForWrite["hydrated"]
        delete cleanForWrite["uid"]

        if (dataAndErrors.isCreate) {
          const newDataRef = await creators[collectionName](
            cleanForWrite as any,
            { id: uid }
          )

          if (options.onCreate) {
            options.onCreate({
              id: newDataRef.id as ForeignKey<CollectionNameType>,
              clearEditingData: () => {
                dataToWriteSubject.next({} as ValueType)
              },
            })
          }
        } else {
          await setters[collectionName](uid, cleanForWrite as any)
        }

        if (options.persistHydratedFields) {
          await updateHydratedValues(
            options.persistHydratedFields,
            cleanForWrite as any,
            {} as any
          )
        }

        options.afterWrite
          ? options.afterWrite(
              dataAndErrors.data,
              dataAndErrors.dataBeforeWrite
            )
          : null
      }
    }),
    map((dataAndErrors) => {
      return {
        editingState: dataAndErrors.editingState,
        data: dataAndErrors.data,
        errors: dataAndErrors.errors,
        isEditing: dataAndErrors.isEditing,
      }
    })
  )

  const baseDataAndWriteResultsObs = combine({
    baseValue: baseValueObs,
    writeResults: writeResultsObs,
  })
    .pipe(
      mountOnceAndIgnore(remoteUpdatePipeToSubject),
      filter((values) => !objHasUndef(values)),
      map(({ baseValue, writeResults }) => {
        const currentData = writeResults.data

        return {
          errors:
            writeResults.errors ||
            ({ hasError: false } as ErrorType<ErrorStructureType>),
          isEditing: writeResults.isEditing,
          baseData: baseValue,
          currentData: currentData as ValueType,
          editingState: writeResults.editingState,
        }
      })
    )
    .pipe(mountOnceAndIgnore(resetDataToWriteOnCancelObs))

  return {
    writeResults: baseDataAndWriteResultsObs,
    setEditingState: (editingState: EditingState) => {
      isParameterizedObservable(editinStateSubject)
        ? console.log(
            "The editing state subject is overridden, set the value directly using the override."
          )
        : editinStateSubject.next(editingState)
    },
    update(dataToWrite: Partial<ValueType>) {
      dataToWriteSubject.next({
        ...dataToWriteSubject.getValue(),
        ...dataToWrite,
      })
    },
    updateField<Path extends Paths<ValueType, 3>>(
      fieldName: Path,
      value: Partial<PathValue<ValueType, Path>>
    ) {
      const clone = {
        ...dataToWriteSubject.getValue(),
      }
      const afterSet = set(clone, fieldName, value)
      dataToWriteSubject.next(afterSet)
    },
  }
}
