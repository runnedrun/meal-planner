import { objKeys } from "@/helpers/objKeys"
import { uuidv4 } from "@firebase/util"
import { isArray, isTypedArray } from "lodash-es"
import { Page } from "puppeteer"
import { Optional, UnionToIntersection } from "utility-types"
import { getElDataAttributesForStep, TEST_ID_COOKIE_NAME } from "./buildJourney"
import {
  FinalizedStep,
  JourneyStep,
  FinalizedSteps,
  StepsSpec,
  PossibleSteps,
} from "./JourneySteps"
import { SCROLL_LOG_DEBOUNCE } from "./LogActionMethods"
import { AllActions } from "./LogActions"
import { getTestLogKey, TestLogEntry } from "./testLogger"

type ActionFn<ActionType extends AllActions> = (actionInfo: {
  page: Page
  step?: FinalizedStep<JourneyStep<ActionType, any>>
}) => Promise<any>

type ActionFns = {
  [key in AllActions]: ActionFn<key>
}

export const waitForPageUrlToMatch = (
  page: Page,
  navActionParams: Optional<
    UnionToIntersection<JourneyStep<"navigate", any>["actionParams"]>
  >
) => {
  return page.waitForFunction(
    async (destination, destinationRegexNot, destinationRegex) => {
      const RegexParser = function (input) {
        // Validate input
        if (typeof input !== "string") {
          throw new Error("Invalid input. Input must be a string")
        }

        // Parse input
        var m = input.match(/(\/?)(.+)\1([a-z]*)/i)

        // Invalid flags
        if (m[3] && !/^(?!.*?(.).*?\1)[gmixXsuUAJ]+$/.test(m[3])) {
          return RegExp(input)
        }

        // Create the regular expression
        return new RegExp(m[2], m[3])
      }

      if (window && window.location && window.location.hostname) {
        const notRegex = destinationRegexNot
          ? RegexParser(destinationRegexNot)
          : null

        const regex = destinationRegex ? RegexParser(destinationRegex) : null
        const path = window.location.pathname
        const destIsEqual = destination && destination === path

        const destMatchesNotRegex = notRegex && !notRegex.test(path)

        const destMatchesRegex = regex && regex.test(path)

        const pathWasLogged = (window as any)._previousLoggedPath === path

        return (
          (destIsEqual || destMatchesNotRegex || destMatchesRegex) &&
          pathWasLogged
        )
      }
    },
    {
      polling: 50,
      timeout: 0,
    },
    navActionParams.destination,
    navActionParams.destinationRegexNot?.toString(),
    navActionParams.destinationRegex?.toString()
  )
}

const buildActionFns = (host: string): ActionFns => {
  const getSelectorForStep = (step: FinalizedStep<JourneyStep<any, any>>) => {
    return `[data-analytics-name='${
      getElDataAttributesForStep(step)["data-analytics-name"]
    }']`
  }

  const actionFns: ActionFns = {
    click: async ({ page, step }) => {
      const selector = getSelectorForStep(step)
      await page.waitForSelector(`${selector}`)
      await page.waitForFunction(
        (selector) => {
          return (
            document.querySelector(
              `${selector} [disabled], ${selector}[disabled]`
            ) === null
          )
        },
        { polling: 200, timeout: 0 },
        selector
      )
      // wait for 300 ms to let the click bubble
      await new Promise((res) => setTimeout(res, 300))
      return page.click(selector)
    },
    navigate: async ({ page, step }) => {
      const anyParams = step.actionParams as UnionToIntersection<
        JourneyStep<"navigate", any>["actionParams"]
      >

      if (anyParams.forceNavigationInTest && anyParams.destination) {
        return navigateToPath(page, anyParams.destination, host)
      } else {
        return waitForPageUrlToMatch(page, anyParams)
      }
    },
    textInput: async ({ page, step }) => {
      const typedStep = step
      const selector = getSelectorForStep(typedStep)
      const selectorWithInput = `${selector} input, ${selector} textarea`
      await page.waitForSelector(selectorWithInput)
      const allButLastLetter = typedStep.actionParams.testInput.slice(0, -1)
      const lastLetter = typedStep.actionParams.testInput.slice(-1)
      await page.$eval(
        selectorWithInput,
        (el: HTMLInputElement, inputToSet) => {
          el.value = inputToSet
        },
        allButLastLetter
      )
      await page.type(selectorWithInput, lastLetter)

      return
    },
    view: async ({ page, step }) => {
      const selector = getSelectorForStep(step)
      await page.waitForSelector(selector)
      return
    },
    scroll: async ({ page, step }) => {
      const selector = getSelectorForStep(step)
      await page.waitForSelector(selector)
      await page.evaluate(
        (selector, testScrollDistance) => {
          const el = document.querySelector(selector)
          el.scrollTop = el.scrollTop + testScrollDistance
        },
        selector,
        step.actionParams.testScrollDistance
      )
      // wait for any scrolling logging debounces to finish
      await new Promise((res) => setTimeout(res, SCROLL_LOG_DEBOUNCE + 25))
    },
  }

  return actionFns
}

export const navigateToPath = async (
  page: Page,
  path: string,
  host = "http:localhost:3000"
) => {
  await page.goto(`${host}${path}`, { waitUntil: "networkidle2" })
}

export type FinalizeStepsMapOrArray =
  | FinalizedSteps<StepsSpec>
  | FinalizedStep<PossibleSteps>[]

export const runJourney = async ({
  journeySteps,
  journeyStart,
  page,
  host = "http://localhost:3000",
}: {
  journeySteps: FinalizeStepsMapOrArray
  journeyStart?: string
  page: Page
  host?: string
}) => {
  const testId = uuidv4()

  await page.setViewport({ width: 1080, height: 1024 })

  const actionFns = buildActionFns(host)

  const steps = isArray(journeySteps)
    ? journeySteps
    : Object.values(journeySteps)

  await page.setCookie({
    name: TEST_ID_COOKIE_NAME,
    value: testId,
    domain: "localhost",
    secure: false,
  })

  await (journeyStart
    ? navigateToPath(page, journeyStart, host)
    : Promise.resolve())

  for (let i = 0; i < steps.length; i++) {
    const step = steps[i]
    const actionFn = actionFns[step.action] as ActionFn<typeof step.action>
    await actionFn({ page, step: step })
  }

  const testLogsKey = getTestLogKey(testId)
  const logsToReview = await page.evaluate(
    (key) => window.localStorage.getItem(key) || "[]",
    testLogsKey
  )

  return JSON.parse(logsToReview) as TestLogEntry[]

  // Type into search box

  // const fullTitle = await textSelector.evaluate((el) => el.textContent)
}
