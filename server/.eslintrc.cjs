module.exports = {
	root: true,
	env: {
		es2021: true,
		node: true,
	},
	parser: '@typescript-eslint/parser',
	parserOptions: {
		ecmaVersion: 2021,
		sourceType: 'module',
		project: [ './tsconfig.json' ],
	},
	plugins: [ '@typescript-eslint' ],
	extends: [
		'plugin:@typescript-eslint/recommended',
	],
	rules: {
		'accessor-pairs': 2,
		'array-bracket-spacing': [ 2, 'always' ],
		'array-callback-return': 2,
		'arrow-body-style': 2,
		'arrow-parens': [ 2, 'as-needed' ],
		'arrow-spacing': 2,
		'block-scoped-var': 2,
		'block-spacing': 2,
		'brace-style': 2,
		'camelcase': [ 2, { properties: 'never', ignoreDestructuring: true } ],
		'comma-dangle': 0,
		'@typescript-eslint/comma-dangle': [ 2, 'always-multiline' ],
		'comma-spacing': 2,
		'comma-style': 2,
		'computed-property-spacing': 2,
		'consistent-return': 2,
		'consistent-this': [ 2, 'that' ],
		'curly': [ 2, 'multi-or-nest', 'consistent' ],
		'default-case': 2,
		'dot-notation': [ 2, { allowPattern: '^[a-z]+(_[a-z]+)+$' } ],
		'eol-last': 2,
		'eqeqeq': [ 2, 'allow-null' ],
		'func-names': 2,
		'func-style': [ 2, 'declaration', { allowArrowFunctions: true } ],
		'generator-star-spacing': [ 2, { before: false, after: true } ],
		'global-require': 2,
		'guard-for-in': 2,
		'handle-callback-err': 2,
		'indent': [ 2, 'tab' ],
		'jsx-quotes': 2,
		'key-spacing': 2,
		'keyword-spacing': 2,
		'linebreak-style': 2,
		'lines-around-comment': 2,
		'max-depth': 2,
		'max-len': [ 2, 160, 2 ],
		'max-nested-callbacks': [ 2, 3 ],
		'max-statements-per-line': 2,
		'new-parens': 2,
		'newline-per-chained-call': [ 2, { ignoreChainWithDepth: 3 } ],
		'no-alert': 2,
		'no-array-constructor': 2,
		'no-await-in-loop': 2,
		'no-bitwise': 2,
		'no-console': 2,
		'no-caller': 2,
		'no-catch-shadow': 2,
		'no-confusing-arrow': 2,
		'no-div-regex': 2,
		'no-duplicate-imports': 2,
		'no-else-return': 2,
		'no-empty-function': 2,
		'no-eval': 2,
		'no-extend-native': 2,
		'no-extra-bind': 2,
		'no-extra-label': 2,
		'no-floating-decimal': 2,
		'@typescript-eslint/no-floating-promises': 2,
		'no-implicit-coercion': 2,
		'no-implicit-globals': 2,
		'no-implied-eval': 2,
		'no-invalid-this': 2,
		'no-iterator': 2,
		'no-label-var': 2,
		'no-lone-blocks': 2,
		'no-lonely-if': 2,
		'no-loop-func': 2,
		'@typescript-eslint/no-misused-promises': 2,
		'no-mixed-requires': 2,
		'no-mixed-spaces-and-tabs': 2,
		'no-multi-spaces': 2,
		'no-multi-str': 2,
		'no-multiple-empty-lines': [ 2, { max: 1 } ],
		'no-native-reassign': 2,
		'no-negated-condition': 2,
		'no-nested-ternary': 2,
		'no-new': 2,
		'no-new-func': 2,
		'no-new-object': 2,
		'no-new-require': 2,
		'no-new-wrappers': 2,
		'no-octal-escape': 2,
		'no-param-reassign': [ 2, { props: true, ignorePropertyModificationsFor: [ 'ctx' ] } ],
		'no-path-concat': 2,
		'no-plusplus': [ 2, { allowForLoopAfterthoughts: true } ],
		'no-process-env': 2,
		'no-process-exit': 2,
		'no-proto': 2,
		'no-return-assign': 2,
		'no-script-url': 2,
		'no-self-compare': 2,
		'no-sequences': 2,
		'no-shadow-restricted-names': 2,
		'no-spaced-func': 2,
		'no-sync': 2,
		'no-throw-literal': 2,
		'no-trailing-spaces': 2,
		'no-undef-init': 2,
		'no-unmodified-loop-condition': 2,
		'no-unneeded-ternary': 2,
		'no-unsafe-finally': 2,
		'no-unused-expressions': 2,
		'no-unused-vars': 0,
		'@typescript-eslint/no-unused-vars': 2,
		'no-use-before-define': [ 2, { functions: false } ],
		'no-useless-call': 2,
		'no-useless-computed-key': 2,
		'no-useless-concat': 2,
		'no-useless-constructor': 2,
		'no-useless-escape': 2,
		'no-var': 2,
		'no-warning-comments': 0,
		'no-whitespace-before-property': 2,
		'no-with': 2,
		'object-curly-spacing': [ 2, 'always', { arraysInObjects: true, objectsInObjects: true } ],
		'object-shorthand': 2,
		'one-var': [ 2, 'never' ],
		'operator-assignment': 2,
		'operator-linebreak': [ 2, 'none' ],
		'prefer-arrow-callback': 2,
		'prefer-const': 2,
		'prefer-rest-params': 2,
		'prefer-spread': 2,
		'prefer-template': 2,
		'quote-props': [ 2, 'consistent-as-needed' ],
		'quotes': [ 2, 'single' ],
		'radix': 2,
		'require-yield': 2,
		'semi': [ 2, 'never' ],
		'sort-imports': [ 0, { memberSyntaxSortOrder: [ 'none', 'single', 'all', 'multiple' ] } ],
		'space-before-blocks': 2,
		'space-before-function-paren': [ 2, { anonymous: 'always', named: 'never' } ],
		'space-in-parens': 2,
		'space-infix-ops': 2,
		'space-unary-ops': 2,
		'spaced-comment': 2,
		'template-curly-spacing': 2,
		'vars-on-top': 2,
		'wrap-iife': 2,
		'wrap-regex': 2,
		'yield-star-spacing': 2,
		'yoda': 2,
		'padded-blocks': [
			2,
			{ blocks: 'never', classes: 'always' },
		],
		'padding-line-between-statements': [
			2,
			{ blankLine: 'any', prev: 'block-like', next: '*' },
			{ blankLine: 'always', prev: [ 'const', 'let', 'var' ], next: '*' },
			{ blankLine: 'any', prev: [ 'const', 'let', 'var' ], next: [ 'const', 'let', 'var' ] },
			{ blankLine: 'always', prev: 'expression', next: [ 'const', 'let', 'var' ] },
			{ blankLine: 'always', prev: '*', next: 'for' },
			{ blankLine: 'always', prev: '*', next: 'if' },
			{ blankLine: 'any', prev: [ 'const', 'let', 'var' ], next: 'if' },
			{ blankLine: 'always', prev: '*', next: 'export' },
			{ blankLine: 'always', prev: '*', next: 'function' },
			{ blankLine: 'always', prev: '*', next: 'return' },
			{ blankLine: 'always', prev: '*', next: 'try' },
			{ blankLine: 'always', prev: '*', next: 'throw' },
		],
	},
}
