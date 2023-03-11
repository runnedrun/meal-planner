import { objKeys } from "@/helpers/objKeys"
import { Overwrite } from "utility-types"
import { StepsSpec, PossibleSteps } from "../JourneySteps"

export type JourneyStepModifier<
  InputSteps extends StepsSpec,
  OutputSteps extends StepsSpec
> = (steps: InputSteps) => OutputSteps

export const replaceStep =
  <
    JourneySteps extends StepsSpec,
    StepsToReplaceType extends Partial<
      Record<keyof JourneySteps, PossibleSteps>
    >
  >(
    stepsToReplace: StepsToReplaceType
  ): JourneyStepModifier<
    JourneySteps,
    Overwrite<JourneySteps, StepsToReplaceType>
  > =>
  (originalSteps) => {
    const cloned = { ...originalSteps } as any
    objKeys(stepsToReplace).forEach((stepNameToReplace) => {
      const newStep = stepsToReplace[stepNameToReplace]
      cloned[stepNameToReplace] = newStep
    })
    return cloned
  }

export const addStepsBefore =
  <
    JourneySteps extends StepsSpec,
    BeforeStepNameType extends keyof JourneySteps,
    NewStepsType extends StepsSpec
  >(
    beforeStepName: BeforeStepNameType,
    newSteps: NewStepsType
  ): JourneyStepModifier<JourneySteps, JourneySteps & NewStepsType> =>
  (originalSteps) => {
    const newObj = {} as any
    objKeys(originalSteps).forEach((originalStepName) => {
      const originalStep = originalSteps[originalStepName]
      if (originalStepName === beforeStepName) {
        objKeys(newSteps).forEach((newStepName) => {
          newObj[newStepName] = newSteps[newStepName]
        })
      }
      newObj[originalStepName] = originalStep
    })

    return newObj
  }
