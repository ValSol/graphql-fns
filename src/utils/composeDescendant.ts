import type { DescendantAttributes } from '../tsTypes';

// import only to get all standard action NAMES
import actionAttributes from '../types/actionAttributes';

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

    prev.push(descendantKey);

    return prev;
  }, []);

  // *** check descendantFields correctness

  descendantAttributesArray.forEach(({ allow, descendantFields, descendantKey }) => {
    Object.keys(allow).forEach((key) => {
      allow[key].forEach((actionGenericName) => {
        if (!actionGenericNames.includes(actionGenericName)) {
          throw new TypeError(`Incorrect action generic name: "${actionGenericName}"!`);
        }
      });
    });
    if (descendantFields) {
      Object.keys(descendantFields).forEach((entityName) => {
        const entityDescendantFields = descendantFields[entityName];

        Object.keys(entityDescendantFields).forEach((fieldName) => {
          if (!descendantKeys.includes(entityDescendantFields[fieldName])) {
            throw new TypeError(
              `Incorrect descendant descendantKey: "${entityDescendantFields[fieldName]}" for descendantField: "${fieldName}" for entityName: "${entityName}" in descendant: "${descendantKey}"`,
            );
          }
        });
      });
    }
  });

  // ***

  const result = descendantAttributesArray.reduce<Record<string, any>>((prev, rawItem) => {
    const { descendantKey } = rawItem;

    const item = { ...rawItem } as const;

    prev[descendantKey] = item; // eslint-disable-line no-param-reassign

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
