# Serverless-template - AWS Node.js Typescript

A Serverless template using Typescript and Esbuild.

Based on `aws-nodejs` template from the [Serverless framework](https://www.serverless.com/).
## Modifications

- [Typescript](https://www.typescriptlang.org/).
- [Esbuild](https://esbuild.github.io/) as a bundler. Set up with [serverless-esbuild](https://www.npmjs.com/package/serverless-esbuild).
- [Pnpm](https://pnpm.io/) as a packager.
- [Serverless-offline](https://www.npmjs.com/package/serverless-offline) and [serverless-plugin-split-stacks](https://www.npmjs.com/package/serverless-plugin-split-stacks) plugins.
- Git hooks with [Husky](https://typicode.github.io/husky/) and [Lint-staged](https://www.npmjs.com/package/lint-staged), running [ESLint](https://eslint.org/) and [Prettier](https://prettier.io/) on every commit.
- [Middy](https://www.npmjs.com/package/@middy/core), middleware engine for Node.Js lambda.
- [Zod](https://www.npmjs.com/package/zod) validation.
---

## Get started with `serverless-template`
### Install template
Using serverless
```bash
serverless https://github.com/Maslowind/serverless-template --name serverless-template
```

Using git clone
```bash
git clone https://github.com/Maslowind/serverless-template serverless-template
cd serverless-template
```

### Environment
Create `.env.[STAGE]` file, using `.env.example`.
### Install dependencies
```bash
pnpm install
```
### Deploy
```bash
pnpm deploy:[STAGE]
```

### Deploy single function
```bash
pnpm deploy:function:[STAGE]
```


### Running locally
This template comes with `serverless-offline`.

```bash
pnpm offline:[STAGE]
```
