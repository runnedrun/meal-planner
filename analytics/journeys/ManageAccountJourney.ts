import { buildJourney } from "../buildJourney"

export const ManageAccountJourney = buildJourney({
  journeyName: "ManageAccountJourney",
  journeySteps: {
    clickAccountButton: {
      action: "click",
      actionParams: {},
    },
  },
})
