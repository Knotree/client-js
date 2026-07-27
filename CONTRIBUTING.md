# Contributing

Use Node.js 18 or newer. Install dependencies and run the complete local gate:

```bash
npm ci
npm test
npm run typecheck
npm run build
npm run verify:package
```

Open a pull request against `main` and describe any public API or behavior
change. Never commit TinyBase project keys, access tokens, refresh tokens, or
customer data.
