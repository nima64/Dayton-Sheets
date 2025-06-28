import { FlatCompat } from '@eslint/eslintrc'
import tseslint from "typescript-eslint"




const compat = new FlatCompat({
    // import.meta.dirname is available after Node.js v20.11.0
    baseDirectory: import.meta.dirname,
})

const eslintConfig = [
    { ignores: [".next/**", "public/**", "next.config.js", "postcss.config.js"] },
    { files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"] },
      ...tseslint.configs.recommended,
    ...compat.config({
        extends: [
            "plugin:react/recommended",
            "plugin:react-hooks/recommended",
            'next/core-web-vitals', 
            'next/typescript'
        ],
        "rules": {
            "@typescript-eslint/no-unused-vars": "warn",
            "@typescript-eslint/no-explicit-any": "warn",
            'no-undef': 'off', // TypeScript handles this better anyway
            "react/react-in-jsx-scope": "off",
            "tailwindcss/no-custom-classname": "off",
            "@typescript-eslint/no-empty-object-type": [
                "error",
                { "allowInterfaces": "with-single-extends" }
            ],
            // Only error on things that break at runtime
            "react-hooks/rules-of-hooks": "error",
            "react-hooks/exhaustive-deps": "warn", // Prevents useEffect bugs
            'react/prop-types': 'off',

        }
    }),
]

export default eslintConfig
