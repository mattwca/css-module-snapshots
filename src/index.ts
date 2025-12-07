import { cssModuleSnapshotSerializer } from './serializer/cssModuleSnapshotSerializer';
import { toHaveCssStyle } from './matchers';

// Add snapshot serializer
expect.addSnapshotSerializer(cssModuleSnapshotSerializer);

// Add custom matchers
expect.extend({
  toHaveCssStyle,
});