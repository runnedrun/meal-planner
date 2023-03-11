import { isDemoMode } from "@/helpers/isDemoMode"
import { isServerside } from "@/helpers/isServerside"
import { objKeys } from "@/helpers/objKeys"
import { getAnalytics, logEvent } from "firebase/analytics"
import { debounce, mapValues, pick } from "lodash-es"
import {
  FinalizedStep,
  JourneyHelpers,
  JourneyStep,
  PossibleSteps,
  StepsSpec,
} from "./JourneySteps"
import {
  AttachToElFn,
  attachToEls,
  getExtraDataFromEls,
} from "./LogActionMethods"
import {
  navigationActions,
  nonLoggableActions,
  StepForType,
} from "./LogActions"
import { getDefinedUserIdPromise } from "./loggerUser"
import { ModifyJourneyFns } from "./ModifyJourneyFns"
import { registerNavStep } from "./navigationSteps"
import { addTestLog } from "./testLogger"
import Cookies from "js-cookie"

export const withDefinedEl =
  (fn: (el: HTMLElement | Window) => void) => (el: HTMLElement) => {
    if (el) fn(el)
  }

export const isWindow = (el: HTMLElement | Window): el is Window => {
  return !isServerside() && el === window
}

export const getElDataAttributesForStep = (
  step: FinalizedStep<PossibleSteps>
) => {
  return {
    "data-analytics-name": step.eventName,
  }
}

export const TEST_ID_COOKIE_NAME = "_activeTestId"

export const getEventName = (journeyName: string, stepName: string) => {
  return `${journeyName}.${stepName}`
}

export type Logger<Step extends FinalizedStep<PossibleSteps>> = (
  dataSchema: Step["dataSchema"]
) => void

export const buildLogger = <StepType extends FinalizedStep<PossibleSteps>>(
  step: StepType
): Logger<StepType> => {
  let triggerCount = 0
  const triggerLimit = step.eventLimit || 1

  return async (stepData: Record<any, any>) => {
    const userId = await getDefinedUserIdPromise()

    const fullEventName = step.eventName
    if (isServerside()) return

    if (triggerCount === triggerLimit) return

    const forTest = Cookies.get(TEST_ID_COOKIE_NAME)

    if (forTest) {
      addTestLog(forTest, fullEventName, stepData, userId)
    } else if (isDemoMode()) {
      console.debug(`EVENT: ${fullEventName}`, stepData, "userId:", userId)
    } else {
      const analytics = getAnalytics()
      logEvent(analytics, String(fullEventName), stepData)
    }

    triggerCount++
  }
}

const isNavigationStep = (step: FinalizedStep<PossibleSteps>) => {
  return navigationActions.some((_) => step.action === _)
}

const isLoggableStep = (step: FinalizedStep<PossibleSteps>) => {
  return !nonLoggableActions.some((_) => step.action === _)
}

const finalizeStep = <Step extends JourneyStep<any, any>>(
  journeyName: string,
  name: string,
  step: Step
) => {
  return {
    ...step,
    eventName: getEventName(journeyName, name),
    name,
  } as FinalizedStep<Step>
}

const buildModifyStepsFn =
  <Steps extends StepsSpec>(
    steps: Steps
  ): ModifyJourneyFns<Steps>["modifySteps"] =>
  (...modifiers) => {
    const clone = { ...steps }
    return modifiers.reduce((acc, modifier) => modifier(acc), clone)
  }

export const buildJourney = <Steps extends StepsSpec>({
  journeySteps,
  journeyName,
}: {
  journeyName: string
  journeySteps: Steps
}): JourneyHelpers<Steps> => {
  const helpers = {
    loggers: {},
    elDecorators: {},
    steps: mapValues(journeySteps, (step, stepName) => {
      return finalizeStep(journeyName, stepName, step)
    }),
    journeyName,
    modifySteps: buildModifyStepsFn(journeySteps),
  } as JourneyHelpers<Steps>

  Object.values(helpers.steps).forEach((step) => {
    const logger = buildLogger(step)
    const attachMethod = attachToEls[step.action] as AttachToElFn

    const getExtraDataFn = getExtraDataFromEls[step.action] || (() => ({}))

    const refHandlerForStep = (data) => {
      return {
        ref: withDefinedEl((el) => {
          // we cant' set attribute if it's the window
          let elToModify: HTMLElement
          if (isWindow(el)) {
            elToModify = el.document.documentElement
          } else {
            elToModify = el
          }

          const dataAttrs = getElDataAttributesForStep(step)
          objKeys(dataAttrs).forEach((key) => {
            elToModify.setAttribute(key, dataAttrs[key])
          })

          attachMethod(({ el }) => {
            const extraData = getExtraDataFn(el)
            logger({ ...data, ...extraData })
          })(el as any)
        }),
      }
    }

    const refHandlerObjToSpread = attachMethod
      ? { [step.name]: refHandlerForStep }
      : {}

    const logHandlerObjToSpread = isLoggableStep(step)
      ? { [step.name]: logger }
      : {}

    if (isNavigationStep(step)) {
      registerNavStep({ step, logger })
    }

    helpers.loggers = { ...helpers.loggers, ...logHandlerObjToSpread }
    helpers.elDecorators = { ...helpers.elDecorators, ...refHandlerObjToSpread }
  })

  return helpers
}
