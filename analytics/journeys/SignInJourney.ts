import { buildJourney } from "../buildJourney"

export const SignInJourney = buildJourney({
  journeyName: "SignInJourney",
  journeySteps: {
    landedOnPage: {
      action: "navigate",
      actionParams: { destination: "/sign_in" },
    },
    startEmail: {
      action: "textInput",
      actionParams: { testInput: "test@test.com" },
    },
    startPassword: {
      action: "textInput",
      actionParams: { testInput: "123456" },
    },
    submit: { action: "click", actionParams: {} },
    redirectedToNextPageAfterSignin: {
      action: "navigate",
      actionParams: {
        destinationRegexNot: /(\/sign_in)|(\/sign_up)/,
      },
    },
  },
})
