import { buildJourney } from "../buildJourney"

export const ReadDocumentJourney = buildJourney({
  journeyName: "ReadDocument",
  journeySteps: {
    landedOnPage: {
      action: "navigate",
      actionParams: { destinationRegex: /^\/web_reader\/.*/ },
    },
    sawScrollingView: {
      action: "view",
    },
    openDocHeader: {
      action: "click",
      actionParams: {},
    },
    selectLayout: {
      action: "click",
      actionParams: {},
    },
    toggleVersion: {
      action: "click",
      actionParams: {},
      dataSchema: {
        versionId: "",
        isMachineTranslation: undefined as boolean,
        isPronunciation: undefined as boolean,
      },
    },
    scrollDocument: {
      action: "scroll",
      actionParams: { testScrollDistance: 15000 },
      eventLimit: -1,
    },
    toggleScrollMode: {
      action: "click",
      actionParams: {},
    },
    sawPagingView: {
      action: "view",
    },
    pressNextPageButton: {
      action: "click",
      actionParams: {},
    },
  },
})
