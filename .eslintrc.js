module.exports = {
    "env": {
        "node": true,
        "es2021": true,
        "jest/globals": true
    },
    "extends": "eslint:recommended",
    "parserOptions": {
        "ecmaVersion": 12,
        "sourceType": "module"
    },
    "rules": {
    },
    "plugins": [
        "prettier",
        "jest"
    ],
    "parser": "babel-eslint"
};
