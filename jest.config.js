import nextJest from "next/jest.js"

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: "./",
})

const esModules = [
  "@firebase",
  "rxjs",
  "firebase",
  "observable-webworker",
  "franc",
  "lodash-es",
  "trigram-utils",
  "n-gram",
  "collapse-white-space",
  "iso-639-3",
]

// Add any custom config to be passed to Jest
/** @type {import('jest').Config} */
const customJestConfig = {
  // Add more setup options before each test is run
  // setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  // if using TypeScript with a baseUrl set to the root directory then you need the below for alias' to work
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
  },
  moduleDirectories: ["node_modules", "<rootDir>/"],
  testEnvironment: "node",
  testMatch: ["**/__tests__/**/*.test.[jt]s?(x)"],
  transformIgnorePatterns: [`/node_modules/(?!(${esModules.join("|")})/)`],
  // setupFiles: ["<rootDir>/.jest/setupTests.js"],
}

export default async () => {
  const jestConfig = await createJestConfig(customJestConfig)()
  return {
    displayName: "Unit Tests",
    roots: ["<rootDir>"],
    ...jestConfig,
    transformIgnorePatterns: jestConfig.transformIgnorePatterns.filter(
      (ptn) => ptn !== "/node_modules/"
    ),
    setupFilesAfterEnv: ["jest-expect-message"],
  }
}
