# @mattwca/css-module-snapshots

A comprehensive Jest plugin for CSS Modules snapshot testing. This package provides a transformer, serializer, and a custom matcher to make testing CSS Modules easier and more reliable.

## Features

- **CSS Module Transformer**: Transforms CSS/SCSS files during Jest tests.
- **Snapshot Serializer**: Automatically includes CSS module styles in your testing snapshots.
- **Custom Matchers**: Adds a `expect(...).toHaveCssStyle` matcher, that allows you to verify a style rule is applied to an element.

## Installation

```bash
npm install --save-dev @mattwca/css-module-snapshots
```

## Usage

### 1. CSS Module Transformer (required)

Add the transformer to your Jest configuration to handle CSS/SCSS imports:

**jest.config.js:**
```javascript
module.exports = {
  transform: {
    '\\.(css|scss)$': '@mattwca/css-module-snapshots/transformer',
  },
};
```

The transformer:
- Compiles SCSS files using Sass
- Processes CSS with PostCSS and postcss-modules
- Injects styles into the DOM for testing

### 2. Snapshot Serializer and Custom Matcher

Add the serializer and `toHaveCssStyle` matcher to your Jest configuration:

In your jest config:

**jest.config.js:**
```javascript
module.exports = {
  testEnvironment: 'jsdom',
  transform: {
    '\\.(css|scss)$': '@mattwca/css-module-snapshots/transformer'
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
};
```

In your jest setup:

**jest.setup.js:**
```javascript
require('@mattwca/css-module-snapshots');
```

The serializer will automatically:
- Find all CSS module styles in your rendered components
- Include them in your snapshot output

The `toHaveCssStyle` matcher:
- Allows you to verify that a given element has a set of expected style properties to be applied.

## Complete Jest Configuration Example

**jest.config.js:**
```javascript
module.exports = {
  testEnvironment: 'jsdom',
  transform: {
    '\\.(css|scss)$': '@mattwca/css-module-snapshots/transformer'
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
};
```

**jest.setup.js:**
```javascript
require('@mattwca/css-module-snapshots');
```

## Example Test

**Button.module.css:**
```css
.button {
  background-color: blue;
}
```

**Button.jsx:**
```javascript
import styles from './Button.module.css';

export const Button = ({children)) => {
  return (<button className={styles.button}>{children}</button>);
};
```

**Button.test.jsx:**
```javascript
import React from 'react';
import { render } from '@testing-library/react';
import styles from './Button.module.scss';
import Button from './Button';

describe('Button', () => {
  it('renders with correct styles', () => {
    const { getByRole, asFragment } = render(<Button>Click me</Button>);
    
    // The snapshot will automatically include the CSS module styles
    expect(asFragment()).toMatchSnapshot();

    expect(getByRole('button')).toHaveCssStyle({ backgroundColor: 'blue' });
  });
});
```

## How It Works

1. **Transform Phase**: When Jest encounters a CSS/SCSS import, the transformer compiles it and generates a JavaScript module that:
   - Injects the styles into the document head
   - Exports the CSS module class name mappings

2. **Render Phase**: Your components use the exported class names as usual

3. **Snapshot Phase**: The serializer finds all injected CSS module styles and includes them in the snapshot output

4. **Matcher**: The matcher will find all CSS module style definitions, parse them, and locate all rules which apply to the given element. The declarations within the matching rules are checked to see whether they contain all of the expected style rules.

## Dependencies

This package requires:
- Jest >= 27.0.0
- Node.js >= 14.0.0

Peer dependencies are automatically installed:
- `sass`: For SCSS compilation
- `postcss` & `postcss-modules`: For CSS module processing
- `cross-spawn`: For synchronous PostCSS execution

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Repository

https://github.com/mattwca/css-module-snapshots
