/** @type {import('lint-staged').Configuration} */
export default {
  "*.{ts,mjs,json,md}": ["prettier --write"],
};
