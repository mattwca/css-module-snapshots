/* eslint-disable import/no-default-export */
import fs from 'fs';
import crypto from 'crypto';

import crossSpawn from 'cross-spawn';
import sass from 'sass';

const THIS_FILE = fs.readFileSync(__filename);

/**
 * Code snippet that runs the PostCSS processor with the postcss-modules plugin for a given CSS string
 * and file name.
 *
 * Class names are left as they are (e.g. not scoped) to make testing classes repeatable.
 *
 * Returns a promise containing the processed CSS, source map, and exports.
 */
const runner = `
async function processCss({ css, fileName }) {
  const postcss = require('postcss');
  const postcssModules = require('postcss-modules');

  let exports = {};
  const postcssModuleResult = await postcss([
    postcssModules({
      getJSON: (_, json) => {
        exports = json;
      },
    }),
  ]).process(css, { from: fileName });

  return { css: postcssModuleResult.css, map: postcssModuleResult.map, exports };
}
`;

/**
 * Transforms the given CSS through our PostCSS pipeline, which includes the postcss-modules plugin.
 *
 * This is a bit hacky, but basically PostCSS is asynchronous, and we need it to run synchronously (thanks jest!), so we run our
 * postcss processor in a child process, wait for it to finish, and print the stringified result to stdout.
 *
 * As nasty as it is, it's the only workable approach, see https://x.com/kentcdodds/status/1043194634338324480.
 */
const runPostCss = (css: string, fileName: string) => {
  const result = crossSpawn.sync('node', [
    '-e',
    `(${runner})(${JSON.stringify({ css, fileName })}).then((result) => console.log(JSON.stringify(result)))`,
  ]);

  return result;
};

/**
 * Small utility function which builds a CSS module that injects the styles into the DOM, and exports
 * the CSS module class names.
 *
 * This is the exact same thing the 'rollup-plugin-sass' plugin does, but we do it ourselves here
 * since the CSS -> JS modules aren't built.
 */
const styleInjector = (css: string, hash: string, exports: Record<string, string>) => `
const styles = \`${css}\`;
const styleElement = document.createElement('style');
styleElement.innerHTML = styles;
styleElement.setAttribute('data-css-module', ${JSON.stringify(hash)});

document.head.appendChild(styleElement);

module.exports = ${JSON.stringify(exports)};
`;

/**
 * Jest transformer for SASS module files. It compiles the SASS file, processes it with PostCSS (and postcss-modules),
 * and returns transformed module code that injects the styles into the DOM and exports CSS module class names.
 */
const transformer = {
  getCacheKey: (fileData: string, fileName: string) => {
    // Generate a cache key for the given CSS module, using the file name, data, and the code for this transformer (since
    // transformers are cached globally by Jest).
    return crypto
      .createHash('md5')
      .update(THIS_FILE)
      .update('\0', 'utf8')
      .update(fileData)
      .update('\0', 'utf8')
      .update(fileName)
      .digest('hex');
  },
  process: (sourceText: string, sourcePath: string) => {
    // Compile the SASS file, passing the file URL to the compiler so it can resolve imports
    const compiledSass = sass.compileString(sourceText, {
      url: new URL(`file://${sourcePath}`),
      syntax: 'scss',
    });

    const result = runPostCss(compiledSass.css, sourcePath);

    // Parse the output result from the child process.
    const postCssResult = JSON.parse(result.stdout.toString().trim());

    // Hash the file path to create a unique identifier for the style element.
    const hash = crypto.createHash('md5').update(sourcePath).digest('hex');

    // Build the final module code that injects the styles into the DOM and exports the CSS module class names.
    const finalModuleCode = styleInjector(postCssResult.css, hash, postCssResult.exports);

    return {
      code: finalModuleCode,
      map: postCssResult.map,
    };
  },
};

export default transformer;