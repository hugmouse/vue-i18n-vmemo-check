# vue-i18n-vmemo-check

A CLI tool to analyze Vue files, find `vue-i18n` functions, and check if there's a `v-memo` in the node or in the parent node.

## Usage

```bash
npx vue-i18n-vmemo-check [directory]
```

- `directory`: The directory to scan (default: `./src`).

## Example output

```bash
/vc-funding/src/views/error/InvestmentsNotFound.vue
  13:16   warning   t('errors.investments-not-found') used without v-memo directive
  14:32   warning   t('errors.go-home') used without v-memo directive

✖ 2 problems
```