import nx from "@nx/eslint-plugin"
import baseConfig from "../../eslint.config.mjs"

const modifyConfig = (config) => {
    // delete rules defined globally
    // delete config.typescript.rules['@typescript-eslint/no-unused-vars']

    // delete import plugin
    for (const singleConfig of config) {
        if (singleConfig?.plugins?.["import"]) {
            console.log("eslint.config.js: Stripped import plugin")
            delete singleConfig.plugins["import"]
        }
    }
    return config
}

export default [
    ...baseConfig,
    ...modifyConfig(nx.configs["flat/react"]),
    {
        files: ["**/*.ts", "**/*.tsx", "**/*.js", "**/*.jsx"],
        // Override or add rules here
        rules: {
            "no-redeclare": ["off"],
        },
    },
]
