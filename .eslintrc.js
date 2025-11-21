module.exports = {
  extends: "expo",
  ignorePatterns: ["/dist/*", "/node_modules/*"],
  rules: {
    "no-unused-vars": "warn",
    "react/react-in-jsx-scope": "off",
  },
};
