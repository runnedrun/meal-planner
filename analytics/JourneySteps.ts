import { ValuesType } from "utility-types"
import {
  ActionTypeParams,
  AllActions,
  ElLevelActions,
  NonLoggableActions,
} from "./LogActions"
import { ModifyJourneyFns } from "./ModifyJourneyFns"

export type JourneyStep<
  ActionType extends AllActions,
  DataSchema = Record<any, any>
> = ActionType extends keyof ActionTypeParams
  ? {
      action: ActionType
      actionParams: ActionTypeParams[ActionType]
      dataSchema?: DataSchema
      eventLimit?: number
    }
  : {
      action: ActionType
      dataSchema?: DataSchema
      eventLimit?: number
    }

export type PossibleSteps = ValuesType<{
  [key in AllActions]: JourneyStep<key, any>
}>

export type StepsSpec = Record<string, PossibleSteps>

export type FinalizedStep<Step extends JourneyStep<any, any>> = Step & {
  eventName: string
  name: string
}

export type FinalizedSteps<StepsType extends StepsSpec> = {
  [key in keyof StepsType]: FinalizedStep<StepsType[key]>
}

export type RefHandler = { ref: (el: HTMLElement | Window) => void }
export type JourneyHelpers<Steps extends StepsSpec> = {
  elDecorators: {
    [key in keyof Steps as Steps[key]["action"] extends ElLevelActions
      ? key
      : never]: "dataSchema" extends keyof Steps[key]
      ? (args: Steps[key]["dataSchema"]) => RefHandler
      : () => RefHandler
  }
  loggers: {
    [key in keyof Steps as Steps[key]["action"] extends NonLoggableActions
      ? never
      : key]: "dataSchema" extends keyof Steps[key]
      ? (args: Steps[key]["dataSchema"]) => void
      : () => void
  }
  steps: FinalizedSteps<Steps>
  journeyName: string
} & ModifyJourneyFns<Steps>
