import { Config } from "jest"

const config: Config = {
    preset: "ts-jest",
    testEnvironment: "node",
    verbose: true,

    collectCoverage: true,
    coverageDirectory: "coverage",
    collectCoverageFrom: [
        '<rootDir>/src/**/*.ts'
    ],

    // Global setup and teardown for database
    globalSetup: '<rootDir>/__tests__/setup.ts',
    globalTeardown: '<rootDir>/__tests__/teardown.ts',

    // Set test environment
    setupFilesAfterEnv: ['<rootDir>/__tests__/testSetup.ts']
}

export default config