import { objKeys } from "@/helpers/objKeys"
import { debounce } from "lodash-es"
import { isWindow } from "./buildJourney"
import { AllActions } from "./LogActions"

export type AttachToElFn = (
  logger: (args: { event: Event; el: HTMLElement }) => void
) => (ref: HTMLElement) => void
type AttachToElFns = {
  [key in AllActions]: AttachToElFn
}

type GetDataFromElFn = (el: HTMLElement) => Record<string, any>
type GetDataFromElFns = {
  [key in AllActions]: GetDataFromElFn
}

type ElWithAnalyticsIndicator = HTMLElement & { _analyticsAttached?: boolean }
const attachEventHandlerToEl = (
  el: ElWithAnalyticsIndicator,
  eventName: keyof HTMLElementEventMap,
  logAnalytics: (e: Event) => void
) => {
  const logAnalyticsName = `logAnalyticsOn${eventName}`
  el[logAnalyticsName] = logAnalytics

  const onName = `on${eventName}`
  const existingHandler = el[onName]?.bind(el)
  if (el._analyticsAttached) return

  el[onName] = (e) => {
    el[logAnalyticsName](e)
    existingHandler && existingHandler(e)
  }
  el._analyticsAttached = true
}

const buildLoggingForElEvent =
  (eventName: keyof HTMLElementEventMap): AttachToElFn =>
  (logger) =>
  (el) => {
    attachEventHandlerToEl(el, eventName, (event) => {
      logger({ event, el })
    })
  }

export const SCROLL_LOG_DEBOUNCE = 100

export const getExtraDataFromEls: Partial<GetDataFromElFns> = {
  scroll: (el) => {
    if (isWindow(el)) {
      return {
        top: window.scrollY,
        left: window.scrollX,
      }
    } else {
      return {
        top: el.scrollTop,
        left: el.scrollLeft,
      }
    }
  },
} as const

export const attachToEls: Partial<AttachToElFns> = {
  click: buildLoggingForElEvent("click"),
  textInput: buildLoggingForElEvent("keydown"),
  scroll: (logger) =>
    buildLoggingForElEvent("scroll")(debounce(logger, SCROLL_LOG_DEBOUNCE)),
  view: (logger) => () => {
    logger({} as any)
  },
} as const
