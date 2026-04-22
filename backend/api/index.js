// Vercel serverless entry point.
// TypeScript source is compiled to dist/src/lambda.js by `npm run build`.
// eslint-disable-next-line @typescript-eslint/no-require-imports
module.exports = require("../dist/lambda.js").default;
