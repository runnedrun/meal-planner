import { buildJourney } from "../buildJourney"

export const SignUpJourney = buildJourney({
  journeyName: "SignUpJourney",
  journeySteps: {
    landedOnPage: {
      action: "navigate",
      actionParams: { destination: "/sign_up" },
    },
    startEmail: {
      action: "textInput",
      actionParams: { testInput: "test_create@test.com" },
    },
    startPassword: {
      action: "textInput",
      actionParams: { testInput: "123456" },
    },
    startConfirmPassword: {
      action: "textInput",
      actionParams: { testInput: "123456" },
    },
    acceptTerms: { action: "click", actionParams: {} },
    submit: { action: "click", actionParams: {} },
    redirectedToNextPageAfterSignin: {
      action: "navigate",
      actionParams: {
        destinationRegexNot: /(\/sign_in)|(\/sign_up)/,
      },
    },
  },
})
