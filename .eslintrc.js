module.exports = {
	// https://eslint.org/docs/2.13.1/user-guide/configuring
	// https://github.com/Tampermonkey/tampermonkey/issues/865#issuecomment-589987608
	"env": {
		"browser": true,
		"es6": true,
		"greasemonkey": true,
		// "jquery": true,
		"mocha": true,
		"node": true
	},
	"extends": "eslint:recommended",
	"parserOptions": {  
		"ecmaVersion": 11,
		"sourceType": "script",
		"ecmaFeatures": {
			"globalReturn ": true,
			"impliedStrict": true
		}
	},
	"rules": {
		"eqeqeq": "warn",
		"indent": ["warn","tab", { "ignoreComments": true, "SwitchCase": 1 } ],
		"linebreak-style": ["warn","unix"],
		"no-alert": "error",
		"no-console": "warn"
	}
};
