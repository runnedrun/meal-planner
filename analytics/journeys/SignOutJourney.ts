import { buildJourney } from "../buildJourney"

export const SignOutJourney = buildJourney({
  journeyName: "SignOutJourney",
  journeySteps: {
    clickSignOutButton: {
      action: "click",
      actionParams: {},
    },
  },
})
