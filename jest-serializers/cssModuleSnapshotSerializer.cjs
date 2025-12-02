// Set of visited nodes used to avoid this serializer being called for any nodes other than the root node.
const visitedNodes = new Set();

/**
 * Helper function to get all nodes in the DOM tree, given a root node.
 * @param {*} node The root node to start searching from.
 * @param {*} nodes The array of nodes to add to.
 * @returns {Array} The array of nodes.
 */
const getNodes = (node, nodes = []) => {
  if (typeof node === 'object') {
    nodes.push(node);
  }

  if (node.children) {
    Array.from(node.children).forEach((child) => getNodes(child, nodes));
  }

  return nodes;
};

/**
 * Custom jest serializer for CSS modules. Similar to jest-styled-components, it traverses the DOM,
 * finds all elements which are using CSS module class names, and serializes the associated styles
 * into the snapshot.
 */
const cssModuleSnapshotSerializer = {
  test: (val) => {
    // Skip any nodes which have already been 'visited'.
    if (visitedNodes.has(val)) {
      return false;
    }

    // Skip any non-HTML element nodes.
    if (!(val instanceof HTMLElement)) {
      return false;
    }

    return true;
  },
  serialize: (val, config, indentation, depth, refs, printer) => {
    // Get all nodes that are children of the root node and add them to the visited nodes set.
    const nodes = getNodes(val);
    nodes.forEach((node) => visitedNodes.add(node));

    // Find all style elements in the document head which have the `data-css-module` attribute added by our CSS module transformer.
    const styleElements = Array.from(document.head.querySelectorAll('style[data-css-module]'));

    // Serialize the DOM elements using the default jest serializer(s).
    const code = printer(val, config, indentation, depth, refs);

    // TODO - Unused class removal

    // Cleanup
    nodes.forEach((node) => visitedNodes.delete(node));

    if (styleElements.size === 0) {
      return code;
    }

    const styleElementsArray = Array.from(styleElements);
    const serializedStyleElements = styleElementsArray.reduce((acc, style) => {
      return `${!acc.length ? '' : `${acc}\n`}${style.innerHTML.trim()}\n`;
    }, '');

    return `${!serializedStyleElements.length ? '' : `${serializedStyleElements}\n`}${code.trim()}`;
  },
};

module.exports = { cssModuleSnapshotSerializer };
