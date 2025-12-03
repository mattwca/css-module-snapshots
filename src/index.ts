import { cssModuleSnapshotSerializer } from './serializer/cssModuleSnapshotSerializer';
import cssModuleTransformer from './transformer/cssModuleTransformer';

// export * from './matchers';

expect.addSnapshotSerializer(cssModuleSnapshotSerializer);

export { cssModuleSnapshotSerializer, cssModuleTransformer };