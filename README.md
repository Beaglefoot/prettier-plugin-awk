# Prettier AWK Plugin

[![tests](https://github.com/Beaglefoot/prettier-plugin-awk/actions/workflows/tests.yml/badge.svg)](https://github.com/Beaglefoot/prettier-plugin-awk/actions/workflows/tests.yml)
[![npm](https://img.shields.io/npm/v/prettier-plugin-awk)](https://www.npmjs.com/package/prettier-plugin-awk)

An opinionated formatter for AWK language built as a plugin for [Prettier](https://github.com/prettier/prettier) with help of [tree-sitter](https://github.com/tree-sitter/tree-sitter) and [tree-sitter-awk](https://github.com/Beaglefoot/tree-sitter-awk).


## How to install and use

### Globally
```
npm install --global prettier@^2 prettier-plugin-awk
```

Then run:
```
prettier --write /path/to/your/awesome_script.awk
```

### Per project

First you need to init new node project with:
```
npm init -y
```

Then add development dependencies:
```
npm add --save-dev prettier prettier-plugin-awk
```

Then run with:
```
npx prettier --write ./awesome_script.awk
```

You can then create pre-commit hook with something like [husky](https://github.com/typicode/husky) or incorporate such check as CI step.


## Ignoring Code

To ignore node in a syntax tree prepend it with `# prettier-ignore` comment like this:
```awk
# prettier-ignore
BEGIN{x=12}
```

[More in official docs](https://prettier.io/docs/en/ignore.html)

## Configuring

Although most of the options are unsupported or make no sense in regard to AWK you can still configure tab or print width.

To do so create `.prettierrc` in your project directory with following content:
```
{
  "printWidth": 80,
  "tabWidth": 4
}
```

[More in official docs](https://prettier.io/docs/en/options.html)
