import type { DescendantAttributes } from '../tsTypes';

import actionAttributes from '../types/actionAttributes'; // import only to get all standard action NAMES
import isCommonlyAllowedTypeName from './isCommonlyAllowedTypeName';

type Result = {
  [descendantName: string]: DescendantAttributes;
};

const actionGenericNames = Object.keys(actionAttributes);

const composeDescendant = (descendantAttributesArray: Array<DescendantAttributes>): Result => {
  const descendantKeys = descendantAttributesArray.reduce<Array<any>>((prev, item) => {
    const { descendantKey } = item;

    if (!descendantKey) {
      throw new TypeError('Descendant attributes must have descendantKey!');
    }

    if (prev.includes(descendantKey)) {
      throw new TypeError(
        `Unique descendant attributes descendantKey: "${descendantKey}" is used twice!`,
      );
    }

    if (!isCommonlyAllowedTypeName(descendantKey)) {
      throw new TypeError(`Incorrect descendantKey: "${descendantKey}"!`);
    }

    prev.push(descendantKey);

    return prev;
  }, []);

  const result = descendantAttributesArray.reduce<Record<string, any>>((prev, rawItem) => {
    const { descendantKey } = rawItem;

    const item = { ...rawItem } as const;

    prev[descendantKey] = item;

    return prev;
  }, {});

  Object.keys(result).forEach((descendantKey) => {
    const { allow, involvedOutputDescendantKeys = {} } = result[descendantKey];

    Object.keys(allow).forEach((entityName) => {
      const descendantKey2 =
        involvedOutputDescendantKeys?.[entityName]?.outputEntity || descendantKey;

      if (descendantKey2 === descendantKey && involvedOutputDescendantKeys?.[entityName]) {
        throw new TypeError(
          `involvedOutputDescendantKeys attribute of descendant "${descendantKey}" has an incorrect keys: "${JSON.stringify(
            involvedOutputDescendantKeys?.[entityName],
          )}"!`,
        );
      }

      const item = result[descendantKey2];

      if (!item) {
        throw new TypeError(
          `Incorrect descendantKey: "${descendantKey2}" for involvedOutputDescendantKeys in descendant "${descendantKey}"!`,
        );
      }

      allow[entityName].forEach((actionGenericName) => {
        actionAttributes[actionGenericName].actionDescendantUpdater?.(entityName, item);
      });
    });
  }, {});

  return result;
};

export default composeDescendant;
