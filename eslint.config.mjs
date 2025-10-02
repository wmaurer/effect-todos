import nx from "@nx/eslint-plugin";
import importPlugin from "eslint-plugin-import";

export default [
    ...nx.configs["flat/base"],
    ...nx.configs["flat/typescript"],
    ...nx.configs["flat/javascript"],
    importPlugin.flatConfigs.recommended,
    {
        ignores: ["**/dist", "**/vite.config.*.timestamp*", "**/vitest.config.*.timestamp*"],
    },
    {
        files: ["**/*.ts", "**/*.tsx", "**/*.js", "**/*.jsx"],
        rules: {
            "@nx/enforce-module-boundaries": [
                "error",
                {
                    enforceBuildableLibDependency: true,
                    allow: ["^.*/eslint(\\.base)?\\.config\\.[cm]?[jt]s$"],
                    depConstraints: [
                        {
                            sourceTag: "*",
                            onlyDependOnLibsWithTags: ["*"],
                        },
                    ],
                },
            ],
            "import/named": ["off"],
            "import/no-unresolved": ["off"],
            "import/no-duplicates": ["error", { "prefer-inline": true }],
            "import/order": [
                "error",
                {
                    groups: ["builtin", "external", "internal", "parent", "sibling", "index"],
                    "newlines-between": "always",
                    pathGroups: [{ pattern: "@rte/**", group: "external", position: "after" }],
                    pathGroupsExcludedImportTypes: ["builtin"],
                    alphabetize: { order: "asc", caseInsensitive: true },
                },
            ],
            "sort-imports": [
                "error",
                {
                    ignoreCase: false,
                    ignoreDeclarationSort: true,
                    ignoreMemberSort: false,
                    memberSyntaxSortOrder: ["none", "all", "multiple", "single"],
                    allowSeparatedGroups: false,
                },
            ],
        },
    },
    {
        files: ["**/*.ts", "**/*.tsx", "**/*.cts", "**/*.mts", "**/*.js", "**/*.jsx", "**/*.cjs", "**/*.mjs"],
        // Override or add rules here
        rules: {},
    },
];
