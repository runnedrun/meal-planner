import { StepsSpec } from "./JourneySteps"
import { JourneyStepModifier } from "./journey_helpers/modifyJourney"

export type ModifyJourneyFns<JourneySteps extends StepsSpec> = {
  modifySteps<A extends StepsSpec>(op1: JourneyStepModifier<JourneySteps, A>): A

  modifySteps<A extends StepsSpec, B extends StepsSpec>(
    op1: JourneyStepModifier<JourneySteps, A>,
    op2: JourneyStepModifier<A, B>
  ): B

  modifySteps<A extends StepsSpec, B extends StepsSpec, C extends StepsSpec>(
    op1: JourneyStepModifier<JourneySteps, A>,
    op2: JourneyStepModifier<A, B>,
    op3: JourneyStepModifier<B, C>
  ): C

  modifySteps(...modifiers: [...JourneyStepModifier<any, any>[]]): StepsSpec
}
