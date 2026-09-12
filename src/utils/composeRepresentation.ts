import type { RepresentationAttributes, EntityConfig, GeneralConfig } from '@/tsTypes';

import actionAttributes from '@/types/actionAttributes'; // import only to get all standard action NAMES
import isCommonlyAllowedTypeName from './isCommonlyAllowedTypeName';

type Result = {
  [representationName: string]: RepresentationAttributes;
};

const actionGenericNames = Object.keys(actionAttributes);

const composeRepresentation = (
  representationAttributesArray: Array<RepresentationAttributes>,
  allEntityConfigs: { [entityConfigName: string]: EntityConfig },
): Result => {
  const representationKeys = representationAttributesArray.reduce<Array<any>>((prev, item) => {
    const { representationKey } = item;

    if (!representationKey) {
      throw new TypeError('Representation attributes must have representationKey!');
    }

    if (prev.includes(representationKey)) {
      throw new TypeError(
        `Unique representation attributes representationKey: "${representationKey}" is used twice!`,
      );
    }

    if (!isCommonlyAllowedTypeName(representationKey)) {
      throw new TypeError(`Incorrect representationKey: "${representationKey}"!`);
    }

    prev.push(representationKey);

    return prev;
  }, []);

  const result = representationAttributesArray.reduce<Record<string, any>>((prev, rawItem) => {
    const { representationKey } = rawItem;

    const item = { ...rawItem } as const;

    prev[representationKey] = item;

    return prev;
  }, {});

  Object.keys(result).forEach((representationKey) => {
    const { allow, involvedOutputRepresentationKeys = {} } = result[representationKey];

    Object.keys(allow).forEach((entityName) => {
      if (!allEntityConfigs[entityName]) {
        throw new TypeError(`Entity config: "${entityName}" not found in allEntityConfigs!`);
      }

      const representationKey2 =
        involvedOutputRepresentationKeys?.[entityName]?.outputEntity || representationKey;

      if (
        representationKey2 === representationKey &&
        involvedOutputRepresentationKeys?.[entityName]
      ) {
        throw new TypeError(
          `involvedOutputRepresentationKeys attribute of representation "${representationKey}" has an incorrect keys: "${JSON.stringify(
            involvedOutputRepresentationKeys?.[entityName],
          )}"!`,
        );
      }

      const item = result[representationKey2];

      if (!item) {
        throw new TypeError(
          `Incorrect representationKey: "${representationKey2}" for involvedOutputRepresentationKeys in representation "${representationKey}"!`,
        );
      }

      allow[entityName].forEach((actionGenericName) => {
        actionAttributes[actionGenericName].actionRepresentationUpdater?.(
          allEntityConfigs[entityName],
          item,
        );
      });
    });
  }, {});

  return result;
};

export default composeRepresentation;
