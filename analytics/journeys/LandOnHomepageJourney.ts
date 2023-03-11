import { buildJourney } from "../buildJourney"

export const LandOnHomepageAndScrollJourney = buildJourney({
  journeyName: "LandOnHomepageAndScroll",
  journeySteps: {
    landedOnPage: {
      action: "navigate",
      actionParams: { destinationRegex: /^\/$/ },
    },
    scrollPage: {
      action: "scroll",
      actionParams: { testScrollDistance: 1000 },
      eventLimit: -1,
    },
    clickBrowseEntireLibrary: {
      action: "click",
      actionParams: {},
    },
    landOnLibraryPage: {
      action: "navigate",
      actionParams: { destinationRegex: /^\/library/ },
    },
  },
})

export const LandOnHomepageAndClickHeroJourney = buildJourney({
  journeyName: "LandOnHomepageAndScroll",
  journeySteps: {
    landedOnPage: {
      action: "navigate",
      actionParams: { destinationRegex: /^\/$/ },
    },
    clickStartReading: {
      action: "click",
      actionParams: {},
    },
    landOnLibraryPage: {
      action: "navigate",
      actionParams: { destinationRegex: /^\/library/ },
    },
  },
})
