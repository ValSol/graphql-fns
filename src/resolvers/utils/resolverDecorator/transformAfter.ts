import type { EntityConfig, GeneralConfig } from '../../../tsTypes';

import parseEntityName from '../../../utils/parseEntityName';
import toGlobalId from '../toGlobalId';

const transformAfter = (
  item: any,
  entityConfig: null | EntityConfig,
  generalConfig: null | GeneralConfig,
  isChild: boolean = false,
): any => {
  if (!entityConfig) {
    return item;
  }

  if (!item) {
    return item;
  }

  if (typeof item !== 'object') {
    return item;
  }

  const {
    childFields = [],
    duplexFields = [],
    embeddedFields = [],
    fileFields = [],
    relationalFields = [],
    type: configType,
  } = entityConfig as any;

  const transformedFields = [...duplexFields, ...relationalFields].reduce<Record<string, any>>(
    (prev, { array, config, name }) => {
      if (!item[name]) return prev;

      if (!generalConfig) {
        if (array) {
          prev[name] = item[name].map((item2) => toGlobalId(item2, config.name)); // eslint-disable-line no-param-reassign
        } else {
          prev[name] = toGlobalId(item[name], config.name); // eslint-disable-line no-param-reassign
        }
      } else {
        const { root: rootName, descendantKey } = parseEntityName(config.name, generalConfig);

        if (array) {
          prev[name] = item[name].map((item2) => toGlobalId(item2, rootName, descendantKey)); // eslint-disable-line no-param-reassign
        } else {
          prev[name] = toGlobalId(item[name], rootName, descendantKey); // eslint-disable-line no-param-reassign
        }
      }

      return prev;
    },
    {},
  );

  const recursiveFields = [...childFields, ...embeddedFields, ...fileFields].reduce<
    Record<string, any>
  >((prev, { array, config, name }) => {
    if (!item[name]) return prev;

    if (array) {
      // eslint-disable-next-line no-param-reassign
      prev[name] = item[name].map(
        (item2) => item2 && transformAfter(item2, config, generalConfig, true),
      );
    } else {
      prev[name] = transformAfter(item[name], config, generalConfig, true); // eslint-disable-line no-param-reassign
    }

    return prev;
  }, {});

  const { id, ...rest } = item;

  let globalId;

  if (isChild && configType !== 'tangible') {
    globalId = id;
  } else if (generalConfig) {
    const { root: rootName, descendantKey } = parseEntityName(entityConfig.name, generalConfig);

    globalId = toGlobalId(id, rootName, descendantKey); // eslint-disable-line no-param-reassign
  } else {
    globalId = toGlobalId(id, entityConfig.name); // eslint-disable-line no-param-reassign
  }

  return {
    ...rest,
    ...recursiveFields,
    ...transformedFields,
    id: globalId,
  };
};

export default transformAfter;