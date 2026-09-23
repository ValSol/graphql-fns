import type { DataObject } from '@/tsTypes';
import type { PreparedData } from '@/resolvers/tsTypes';

// "prepareBulkData" functions, "unwindCore", "addPeripheryToCore" & mongoose "bulkWrite" mutate
// containers they get (push / splice / unshift into arrays, reassign "insertOne.document" etc.)
// so every transaction attempt has to start from its own copy of containers
const copyBulkItem = (bulkItem: DataObject): DataObject =>
  Object.keys(bulkItem).reduce<DataObject>((prev, operation) => {
    prev[operation] = { ...bulkItem[operation] };

    return prev;
  }, {});

const copyPreparedData = ({ core, periphery, mains }: PreparedData): PreparedData => ({
  core: new Map(
    Array.from(core.entries(), ([config, bulkItems]) => [config, bulkItems.map(copyBulkItem)]),
  ),

  periphery: new Map(
    Array.from(periphery.entries(), ([config, obj]) => [
      config,
      Object.keys(obj).reduce<typeof obj>((prev, oppositeName) => {
        prev[oppositeName] = {
          ...obj[oppositeName],
          oppositeIds: [...obj[oppositeName].oppositeIds],
        };

        return prev;
      }, {}),
    ]),
  ),

  mains: [...mains],
});

export default copyPreparedData;
