import { cssModuleSnapshotSerializer } from './serializer';
import cssModuleTransformer from './transformer/cssModuleTransformer';
import { toHaveCssStyle } from './matchers';

expect.addSnapshotSerializer(cssModuleSnapshotSerializer);
expect.extend({
  toHaveCssStyle,
});

export { cssModuleSnapshotSerializer as snapshotSerializer, cssModuleTransformer as transformer, toHaveCssStyle };