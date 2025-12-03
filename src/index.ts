import { cssModuleSnapshotSerializer } from './serializer/cssModuleSnapshotSerializer';
import cssModuleTransformer from './transformer/cssModuleTransformer';

expect.addSnapshotSerializer(cssModuleSnapshotSerializer);

export { cssModuleSnapshotSerializer, cssModuleTransformer };