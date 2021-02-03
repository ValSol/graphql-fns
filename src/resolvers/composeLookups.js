// @flow

import type { LookupMongodb } from '../flowTypes';

const composeLookups = (lookupsObject: { [fieldName: string]: string }): Array<LookupMongodb> =>
  Object.keys(lookupsObject).reduce((prev, parentFieldName) => {
    const thingName = lookupsObject[parentFieldName];

    prev.push({
      $lookup: {
        from: `${thingName.toLowerCase()}_things`,
        localField: parentFieldName,
        foreignField: '_id',
        as: `${parentFieldName}_`,
      },
    });

    return prev;
  }, []);

export default composeLookups;
