import { setLoggerUserId } from "@/analytics/loggerUser"
import { hydrateTimestamps } from "@/data/fetchHelpers/jsonifyTimestamps"
import { isParameterizedObservable } from "@/data/ParamaterizedObservable"
import { deepMapObj, DeleteField } from "@/helpers/deepMapObj"
import { isServerside } from "@/helpers/isServerside"
import { objKeys } from "@/helpers/objKeys"
import { toTitleCase } from "@/helpers/toTitleCase"
import { getAuth, signInAnonymously } from "firebase/auth"
import { clone, get, isUndefined, merge } from "lodash-es"
import { AuthAction, useAuthUser, withAuthUser } from "next-firebase-auth"
import { useRouter } from "next/router"
import words from "random-words"
import React, { createContext, useContext, useEffect, useMemo } from "react"
import {
  addCachingToAllObs,
  BasicUser,
  getBasicUserFromAuthUser,
  getBasicUserFromFbUser,
  getUserRequirementChecker,
  PossiblePrefetchData,
  ServerValues,
} from "./buildPrefetchHandler"
import {
  getAllParamObsFromMap,
  getCurrentAgsMapForAllParams,
  getInputsAndValuesFromMapToResolve,
  InputsAndValuesFromMapToResolve,
  PropValuesForComponent,
} from "./getInputsAndValuesFromMapToResolve"
import { RenderIdContext } from "./RenderIdContext"

export type ComponentContext = {
  host: string
  origin: string
  userId: string
  user?: BasicUser
  serverValues: ServerValues
}

const PrefetchCacheContext = createContext(null as any)
export const ComponentContextContext = createContext(null as ComponentContext)

type RenderFn<MapToResolve extends Record<any, any>> = (
  props: InputsAndValuesFromMapToResolve<MapToResolve> & {
    _context: ComponentContext
  }
) => React.ReactElement<any, any>

type Config<MapToResolve extends Record<any, any>> = {
  name?: string
  forceRoot?: boolean
}

const isRender = (
  renderOrConfig: RenderFn<any> | Config<any>
): renderOrConfig is RenderFn<any> => {
  return typeof renderOrConfig === "function"
}

type BuiltComponent<MapToResolve> = React.ComponentType<
  PropValuesForComponent<MapToResolve>
>

export function component<MapToResolve extends Record<any, any>>(
  mapToResolveFn: (renderId: string) => MapToResolve,
  ChildComponent: RenderFn<MapToResolve>
): BuiltComponent<MapToResolve>

export function component<MapToResolve extends Record<any, any>>(
  mapToResolveFn: (renderId: string) => MapToResolve,
  config: Config<MapToResolve>,
  ChildComponent: RenderFn<MapToResolve>
): BuiltComponent<MapToResolve>

export function component<MapToResolve extends Record<any, any>>(
  mapToResolveFn: (renderId: string) => MapToResolve,
  renderOrConfig: RenderFn<MapToResolve> | Config<MapToResolve>,
  optChildComponent?: RenderFn<MapToResolve>
): BuiltComponent<MapToResolve> {
  const ChildComponent = isRender(renderOrConfig)
    ? renderOrConfig
    : optChildComponent
  const config = (isRender(renderOrConfig) ? {} : renderOrConfig) as Config<any>

  const Component = (
    possiblePrefetchData: PossiblePrefetchData &
      PropValuesForComponent<MapToResolve>
  ) => {
    const renderId = useContext(RenderIdContext)
    const mapToResolve = useMemo(
      () => addCachingToAllObs(mapToResolveFn(renderId)),
      []
    )

    const onlyStaticValues = useMemo(
      () =>
        deepMapObj(mapToResolve, (_) =>
          isParameterizedObservable(_) || isUndefined(_)
            ? DeleteField
            : undefined
        ),
      []
    )
    const paramObsMap = useMemo(() => getAllParamObsFromMap(mapToResolve), [])
    const paramObsPaths = objKeys(paramObsMap)
    const allParamObs = Object.values(paramObsMap)
    const paramsMap = getCurrentAgsMapForAllParams(allParamObs)
    const user = useAuthUser()

    const shouldHideComponent = (componentProps) => {
      const shouldHideBasedOnMissingData = [
        ...paramObsPaths,
        ...objKeys(paramsMap),
      ].some((path) => {
        return isUndefined(get(componentProps, path))
      })

      return shouldHideBasedOnMissingData
    }

    const getComponentContextForRoot = () => {
      const basicUser =
        getBasicUserFromAuthUser(user) ||
        possiblePrefetchData.componentContext?.user

      return {
        host: possiblePrefetchData.componentContext?.host
          ? possiblePrefetchData.componentContext?.host
          : typeof window === "undefined"
          ? null
          : window.location.hostname,
        userId: basicUser?.id,
        user: basicUser,
        serverValues: possiblePrefetchData.componentContext?.serverValues,
      } as ComponentContext
    }

    const getComponentPropsWithDefault = (context: ComponentContext) => {
      const resolvedDataInputsAndSetters = getInputsAndValuesFromMapToResolve(
        paramObsMap,
        {
          props: possiblePrefetchData,
          context,
        }
      )

      return merge(
        {
          ...resolvedDataInputsAndSetters,
        },
        onlyStaticValues
      ) as InputsAndValuesFromMapToResolve<MapToResolve>
    }

    const attachPrefetchCacheToAllObs = (cache: Record<string, any>) => {
      allParamObs.forEach((obs) => {
        obs.cacheBehaviorSubject.next(cache)
      })
    }

    const isRoot = config.forceRoot || possiblePrefetchData.cache

    const router = useRouter()

    if (isRoot) {
      const componentContext = getComponentContextForRoot()

      const userChecker = getUserRequirementChecker(
        possiblePrefetchData?.renderOptions?.userRequirement
      )

      useEffect(() => {
        // don't bother to redirect if we are sigining in anonymously,
        // otherwise we'll redirect when a user logs out
        const userToCheck = clone(componentContext.user)

        let userToCheckPromise = Promise.resolve(userToCheck)

        // sign in anonymously if we are not signed in
        if (userToCheck?.clientInitialized && !userToCheck.id) {
          const auth = getAuth()
          userToCheckPromise = signInAnonymously(auth).then((resp) => {
            return getBasicUserFromFbUser(resp.user)
          })
        }

        // decide if we redirect or not
        userToCheckPromise.then((userToCheck) => {
          // setup analytics user
          const userId = componentContext.user.isAnonymous
            ? null
            : componentContext.user.id
          setLoggerUserId(userId)

          const userCheckResult = userChecker(userToCheck)
          if (userCheckResult.redirectTo) {
            router.push(userCheckResult.redirectTo)
          }
        })
      }, [componentContext.user])

      const dataCache = useMemo(
        () => hydrateTimestamps(possiblePrefetchData.cache),
        []
      )

      attachPrefetchCacheToAllObs(dataCache)

      const componentProps = getComponentPropsWithDefault(componentContext)

      if (shouldHideComponent(componentProps) && isServerside()) {
        console.warn(
          "Not able to render this component serverside. Ensure there is caching set up for all obs. Props are:",
          componentProps
        )
      }

      const component = shouldHideComponent(componentProps) ? (
        <div></div>
      ) : (
        <ChildComponent
          {...componentProps}
          {...possiblePrefetchData}
          _context={componentContext}
        ></ChildComponent>
      )

      return (
        <ComponentContextContext.Provider value={componentContext}>
          <PrefetchCacheContext.Provider value={dataCache}>
            {component}
          </PrefetchCacheContext.Provider>
        </ComponentContextContext.Provider>
      )
    } else {
      const prefetchDataCache = useContext(PrefetchCacheContext)

      const componentContext =
        useContext(ComponentContextContext) || getComponentContextForRoot()

      attachPrefetchCacheToAllObs(prefetchDataCache)

      const componentProps = getComponentPropsWithDefault(componentContext)

      console.log("data", componentProps, componentContext)

      return shouldHideComponent(componentProps) ? (
        <span></span>
      ) : (
        <ChildComponent
          {...componentProps}
          {...possiblePrefetchData}
          _context={componentContext}
        />
      )
    }
  }
  Component.displayName =
    config.name ||
    toTitleCase(words({ exactly: 2, join: " " })).replace(" ", "")

  return withAuthUser({
    whenUnauthedBeforeInit: AuthAction.RENDER,
    whenUnauthedAfterInit: AuthAction.RENDER,
  })(Component as any) as typeof Component
}

export const rootComponent = <MapToResolve extends Record<any, any>>(
  ChildComponent: RenderFn<MapToResolve>
) => component(() => ({}), { forceRoot: true }, ChildComponent)
