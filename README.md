# css-modules-snapshots

A comprehensive Jest plugin for CSS Modules snapshot testing. This package provides a transformer, serializer, and custom matchers to make testing CSS Modules easier and more reliable.

## Features

- **CSS Module Transformer**: Transform CSS/SCSS files during Jest tests
- **Snapshot Serializer**: Automatically include CSS module styles in your snapshots
- **Custom Matchers**: Additional Jest matchers for CSS-specific assertions

## Installation

```bash
npm install --save-dev css-modules-snapshots
```

## Usage

### 1. CSS Module Transformer

Add the transformer to your Jest configuration to handle CSS/SCSS imports:

**jest.config.js:**
```javascript
module.exports = {
  transform: {
    '\\.(css|scss)$': 'css-modules-snapshots/transformer',
  },
};
```

The transformer:
- Compiles SCSS files using Sass
- Processes CSS with PostCSS and postcss-modules
- Injects styles into the DOM for testing
- Exports CSS module class names

### 2. Snapshot Serializer

Add the serializer to your Jest configuration to include CSS module styles in snapshots:

**jest.config.js:**
```javascript
module.exports = {
  snapshotSerializers: ['css-modules-snapshots/serializer'],
};
```

The serializer will automatically:
- Find all CSS module styles in your rendered components
- Include them in your snapshot output
- Make your snapshots more comprehensive and easier to review

### 3. Custom Matchers

Import and extend Jest matchers in your test setup file:

**jest.setup.js:**
```javascript
import { matchers } from 'css-modules-snapshots/matchers';

expect.extend(matchers);
```

Then add to your Jest configuration:

**jest.config.js:**
```javascript
module.exports = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
};
```

## Complete Jest Configuration Example

**jest.config.js:**
```javascript
module.exports = {
  testEnvironment: 'jsdom',
  transform: {
    '\\.(css|scss)$': 'css-modules-snapshots/transformer',
    '\\.(js|jsx|ts|tsx)$': 'babel-jest',
  },
  snapshotSerializers: ['css-modules-snapshots/serializer'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
};
```

**jest.setup.js:**
```javascript
import { matchers } from 'css-modules-snapshots/matchers';

expect.extend(matchers);
```

## Example Test

```javascript
import React from 'react';
import { render } from '@testing-library/react';
import styles from './Button.module.scss';
import Button from './Button';

describe('Button', () => {
  it('renders with correct styles', () => {
    const { container } = render(<Button>Click me</Button>);
    
    // The snapshot will automatically include the CSS module styles
    expect(container).toMatchSnapshot();
  });
});
```

## How It Works

1. **Transform Phase**: When Jest encounters a CSS/SCSS import, the transformer compiles it and generates a JavaScript module that:
   - Injects the styles into the document head
   - Exports the CSS module class name mappings

2. **Render Phase**: Your components use the exported class names as usual

3. **Snapshot Phase**: The serializer finds all injected CSS module styles and includes them in the snapshot output

## Dependencies

This package requires:
- Jest >= 27.0.0
- Node.js >= 14.0.0

Peer dependencies are automatically installed:
- `sass`: For SCSS compilation
- `postcss` & `postcss-modules`: For CSS module processing
- `cross-spawn`: For synchronous PostCSS execution

## TypeScript Support

Full TypeScript definitions are included. For custom matchers, you may want to extend Jest types:

**types/jest.d.ts:**
```typescript
import 'css-modules-snapshots/matchers';

declare global {
  namespace jest {
    interface Matchers<R> {
      // Add custom matcher type definitions here if needed
    }
  }
}
```

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Repository

https://github.com/mattwca/css-module-snapshots
