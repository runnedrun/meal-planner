import { jsonifyTimestamps } from "@/data/fetchHelpers/jsonifyTimestamps"
import {
  isParameterizedObservable,
  ParamaterizedObservable,
} from "@/data/ParamaterizedObservable"
import { isServerside } from "@/helpers/isServerside"
import { objKeys } from "@/helpers/objKeys"
import { redirectToQueryDestination } from "@/helpers/redirectToQueryDestination"
import { redirectWithDestination } from "@/helpers/redirectWithDestination"
import { User } from "firebase/auth"
import { GetServerSideProps, GetServerSidePropsContext, Redirect } from "next"
import { AuthUser, SSRPropsContext, withAuthUserSSR } from "next-firebase-auth"
import { redirect } from "next/dist/server/api-utils"
import { getSelectorsByUserAgent } from "react-device-detect"
import { v4 } from "uuid"
import { ComponentContext } from "./component"
import {
  getAllParamObsFromMap,
  getCurrentAgsMapForAllParams,
} from "./getInputsAndValuesFromMapToResolve"
import { possiblyHandleWarmupRequest } from "./possiblyHandleWarmupRequest"
import {
  processServersideSpecialArgs,
  processSpecialArgs,
} from "./processSpecialArgs"
import { queryObsCacheName } from "./queryObs"

type UserClaims = {
  admin: boolean
  contributor: boolean
}

export type BasicUser = {
  id: string
  email: string
  isAnonymous: boolean
  claims: UserClaims
  clientInitialized: boolean
}

type UserRequirementCheckResult = {
  allowed: boolean
  redirectTo?: string
}

const getClaims = (user: BasicUser | AuthUser) => {
  return (user?.claims || {}) as UserClaims
}

const UserRequirements = {
  requiresNoLoggedInUser: (
    user: BasicUser,
    ctx?: GetServerSidePropsContext
  ) => {
    const allowed = !user.id || user.isAnonymous
    return {
      allowed: allowed,
      redirectTo:
        !allowed && (redirectToQueryDestination({ ctx }) || "/my_docs"),
    } as UserRequirementCheckResult
  },
  requiresAtLeastAnonymousUser: (
    user: BasicUser,
    ctx?: GetServerSidePropsContext
  ) => {
    // we will log in the user anonymously on the client side
    return {
      allowed: true,
    } as UserRequirementCheckResult
  },
  requiresLoggedInUser: (user: BasicUser, ctx?: GetServerSidePropsContext) => {
    const allowed = !!user.id && !user.isAnonymous

    return {
      allowed,
      redirectTo: !allowed && redirectWithDestination("/sign_in")({ ctx: ctx }),
    } as UserRequirementCheckResult
  },
  requiresContributorUser: (
    user: BasicUser,
    ctx?: GetServerSidePropsContext
  ) => {
    const allowed = !!user.id && getClaims(user).contributor
    return {
      allowed,
      redirectTo: !allowed && "/my_docs",
    } as UserRequirementCheckResult
  },
  requiresAdminUser: (user: BasicUser, ctx?: GetServerSidePropsContext) => {
    const allowed = !!user.id && getClaims(user).admin
    return {
      allowed,
      redirectTo: !allowed && "/my_docs",
    } as UserRequirementCheckResult
  },
}

export const getUserRequirementChecker = (
  userRequirement: keyof typeof UserRequirements
) => {
  return (
    UserRequirements[userRequirement] ||
    (() =>
      ({
        allowed: true,
      } as UserRequirementCheckResult))
  )
}

export const addCachingToAllObs = (
  obsPathMap: Record<string, ParamaterizedObservable<any, any, any>>
) => {
  const newMap = { ...obsPathMap }
  objKeys(obsPathMap).forEach((path) => {
    const possibleObs = obsPathMap[path]
    newMap[path] = possibleObs
      .withName(`autoCaching_${path}`)
      .cloneWithCaching()
  })
  return newMap
}

export const getBasicUserFromAuthUser = (authUser: AuthUser) => {
  const isAnonymous = authUser?.firebaseUser
    ? authUser.firebaseUser?.isAnonymous
    : authUser?.claims?.provider_id === "anonymous"
  return {
    id: authUser?.id,
    email: authUser?.email || null,
    isAnonymous,
    claims: getClaims(authUser),
    clientInitialized: authUser.clientInitialized,
  } as BasicUser
}

export const getBasicUserFromFbUser = async (user: User) => {
  const { claims } = await user.getIdTokenResult()
  const isAnonymous = user.isAnonymous
  return {
    id: user.uid,
    isAnonymous,
    claims: claims as UserClaims,
    clientInitialized: true,
  } as BasicUser
}

export type PossiblePrefetchData<> = {
  cache: any
  componentContext: ComponentContext
  renderOptions: RenderOptions
}

export type PrefetchFnType<> = (ctx: SSRPropsContext) => Promise<
  | {
      props: PossiblePrefetchData
    }
  | {
      redirect: Redirect
    }
>

export function buildPrefetchHandlerFromSingleObsFn<
  ParamObsType extends ParamaterizedObservable<any, any, any>
>(singleParamObsFn: (renderId?: string) => ParamObsType): PrefetchFnType {
  return prefetchDataWithAuthUser((renderId) => ({
    data: singleParamObsFn(renderId),
  }))
}

export type ServerValueNames = "isMobile"

type ServerValueGetters = {
  [key in ServerValueNames]: (context: SSRPropsContext) => any
}

export const ServerValueGetters: ServerValueGetters = {
  isMobile: (context) => {
    return getSelectorsByUserAgent(context.req.headers["user-agent"]).isMobile
  },
}

export type ServerValues = typeof ServerValueGetters

export type RenderOptions = {
  userRequirement?: keyof typeof UserRequirements
}

const prefetchDataWithAuthUser = <MapToResolve extends Record<any, any>>(
  mapToResolveFn: (renderId: string) => MapToResolve,
  options: RenderOptions = {}
): PrefetchFnType => {
  return async (context) => {
    if (await possiblyHandleWarmupRequest(context.query)) {
      return {
        redirect: {
          destination: "/_warmup",
          permanent: false,
        },
      }
    }
    const renderId = v4()
    console.log("starting request Id", renderId)
    const mapToResolve = mapToResolveFn(renderId)
    const allParamObs = getAllParamObsFromMap(mapToResolve)
    const cachedParamObs = addCachingToAllObs(allParamObs)

    const arrayOfParamObs = Object.values(cachedParamObs)
    const allParamObsPaths = objKeys(cachedParamObs)
    const allArgsForAllObs = getCurrentAgsMapForAllParams(arrayOfParamObs)

    const serverValues = {} as Record<ServerValueNames, any>
    objKeys(ServerValueGetters).forEach((key) => {
      serverValues[key] = ServerValueGetters[key](context)
    })

    if (context.AuthUser) {
      context.AuthUser.clientInitialized = true
    }

    const basicUser = getBasicUserFromAuthUser(context.AuthUser)

    const componentContext = {
      host: context.req.headers.host as string,
      userId: basicUser?.id || null,
      serverValues,
      user: basicUser,
    } as ComponentContext

    const contextForProcessor = {
      query: context.query,
      props: {},
      context: componentContext,
    }

    const userRequirementChecker = getUserRequirementChecker(
      options.userRequirement
    )

    const userCheckResult = userRequirementChecker(basicUser, context)

    if (userCheckResult.redirectTo) {
      return {
        redirect: {
          destination: userCheckResult.redirectTo,
          permanent: false,
        },
      }
    }

    const processedArgs = processServersideSpecialArgs(
      processSpecialArgs(allArgsForAllObs, contextForProcessor),
      contextForProcessor
    )

    const cache = {
      [queryObsCacheName]: { "{}": { ...context.query, ...context.params } },
    } as Record<string, any>

    await Promise.all(
      allParamObsPaths.map(async (path) => {
        const obs = cachedParamObs[path]
        obs.cacheBehaviorSubject.next(cache)
        const value = await obs.getWithArgs(processedArgs)
      })
    )

    const cleanCache = jsonifyTimestamps(cache)

    context.res.setHeader(
      "Cache-Control",
      "public, s-maxage=10, stale-while-revalidate"
    )

    return {
      props: {
        cache: cleanCache,
        componentContext,
        renderOptions: options,
      } as PossiblePrefetchData,
    }
  }
}

export const buildPrefetchHandler =
  (options: RenderOptions = {}) =>
  <MapToResolve extends Record<any, any>>(
    mapToResolveFn: (renderId: string) => MapToResolve = () =>
      ({} as MapToResolve)
  ): GetServerSideProps => {
    const prefetchHandler = prefetchDataWithAuthUser(mapToResolveFn, options)
    return withAuthUserSSR()(prefetchHandler)
  }
