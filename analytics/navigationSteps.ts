import { uniqBy } from "lodash-es"
import { UnionToIntersection } from "utility-types"
import { Logger } from "./buildJourney"
import { FinalizedStep, JourneyStep } from "./JourneySteps"

type NavigationStep = FinalizedStep<JourneyStep<"navigate", {}>>

type NavLoggers = Record<
  string,
  { logger: Logger<NavigationStep>; step: NavigationStep }[]
>
const navLoggers: NavLoggers = {}

const navLoggersWithNotRegex: {
  step: NavigationStep
  logger: Logger<NavigationStep>
}[] = []

const navLoggersWithRegex: {
  step: NavigationStep
  logger: Logger<NavigationStep>
}[] = []

export const registerNavStep = (stepAndLogger: {
  step: NavigationStep
  logger: Logger<NavigationStep>
}) => {
  const anyParam = stepAndLogger.step.actionParams as UnionToIntersection<
    JourneyStep<"navigate", any>["actionParams"]
  >

  if (anyParam.destinationRegexNot) {
    navLoggersWithNotRegex.push(stepAndLogger)
  } else if (anyParam.destinationRegex) {
    navLoggersWithRegex.push(stepAndLogger)
  } else {
    const path = anyParam.destination
    if (!navLoggers[path]) {
      navLoggers[path] = []
    }
    navLoggers[path].push(stepAndLogger)
  }
}

export const getNavLoggers = (path: string) => {
  return navLoggers[path] || []
}

export const logNavSteps = ({ path }: { path: string }) => {
  const fromNotRegex = navLoggersWithNotRegex.filter((logger) => {
    const anyParam = logger.step.actionParams as UnionToIntersection<
      JourneyStep<"navigate", any>["actionParams"]
    >

    return !anyParam.destinationRegexNot.test(path)
  })

  const fromRegex = navLoggersWithRegex.filter((logger) => {
    const anyParam = logger.step.actionParams as UnionToIntersection<
      JourneyStep<"navigate", any>["actionParams"]
    >

    return anyParam.destinationRegex.test(path)
  })

  const fromDirectMatch = getNavLoggers(path)

  const loggers = uniqBy(
    [...fromDirectMatch, ...fromNotRegex, ...fromRegex],
    (_) => _.step.eventName
  )

  loggers.forEach(({ logger }) => logger({}))
}
