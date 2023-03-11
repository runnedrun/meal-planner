import { range } from "lodash-es"
import { buildJourney } from "../buildJourney"

const sentenceForLang1 = "Test. "

const testText = range(0, 250).reduce((acc) => acc + sentenceForLang1, "")

export const SimpleCreateDocJourney = buildJourney({
  journeyName: "SimpleCreateDocJourney",
  journeySteps: {
    clickNewDocButton: {
      action: "click",
      actionParams: {},
    },
    landedOnPage: {
      action: "navigate",
      actionParams: { destinationRegex: /^\/edit_doc\/.*/ },
    },
    inputMainVersionText: {
      action: "textInput",
      actionParams: { testInput: testText },
    },
    clickLanguageSelector: {
      action: "click",
      actionParams: {},
    },
    selectLanguage: {
      action: "click",
      actionParams: {},
    },
    clickTranslateButton: {
      action: "click",
      actionParams: {},
    },
    clickReadDocButton: {
      action: "click",
      actionParams: {},
    },
    landedOnReadDocPage: {
      action: "navigate",
      actionParams: { destinationRegex: /^\/web_reader\/.*/ },
    },
  },
})
