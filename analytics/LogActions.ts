import {
  DetailedHTMLProps,
  HTMLAttributes,
  HtmlHTMLAttributes,
  HTMLProps,
} from "react"
import { Overwrite, UnionToIntersection } from "utility-types"
import { JourneyStep } from "./JourneySteps"

export type ElLevelActions = "click" | "textInput" | "scroll" | "view"

export const navigationActions = ["navigate"] as const

export type NonLoggableActions = "navigate"
export const nonLoggableActions = ["navigate"] as const

export type AllActions = ElLevelActions | NonLoggableActions

export type ActionParamsForType<T extends keyof ActionTypeParams> =
  UnionToIntersection<ActionTypeParams[T]>

export type StepForType<T extends keyof ActionTypeParams> = Overwrite<
  JourneyStep<T, any>,
  { actionParams: UnionToIntersection<JourneyStep<T, any>["actionParams"]> }
>

export interface ActionTypeParams {
  textInput: { testInput: string }
  click: {}
  navigate:
    | { forceNavigationInTest?: true; destination: string }
    | { destinationRegexNot: RegExp }
    | { destinationRegex: RegExp }
  scroll: { testScrollDistance?: number }
}
