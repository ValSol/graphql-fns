import type { EntityConfig, GeneralConfig, GraphqlObject } from '../../../tsTypes';

import parseEntityName from '../../../utils/parseEntityName';
import toGlobalId from '../toGlobalId';

const transformAfter = (
  args: GraphqlObject,
  item: any,
  entityConfig: null | EntityConfig,
  generalConfig: null | GeneralConfig,
  isChild = false,
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
    relationalFields = [],
    type: configType,
  } = entityConfig as any;

  const transformedFields = [...duplexFields, ...relationalFields].reduce<Record<string, any>>(
    (prev, { array, config, name }) => {
      if (!item[name]) return prev;

      if (!generalConfig) {
        if (array) {
          prev[name] = item[name].map((item2) => toGlobalId(item2, config.name));
        } else {
          prev[name] = toGlobalId(item[name], config.name);
        }
      } else {
        const { root: rootName, descendantKey } = parseEntityName(config.name, generalConfig);

        if (array) {
          prev[name] = item[name].map((item2) => toGlobalId(item2, rootName, descendantKey));
        } else {
          prev[name] = toGlobalId(item[name], rootName, descendantKey);
        }
      }

      return prev;
    },
    {},
  );

  const recursiveFields = [...childFields, ...embeddedFields].reduce<Record<string, any>>(
    (prev, { array, config, name }) => {
      if (!item[name]) return prev;

      if (array) {
        prev[name] = item[name].map(
          (item2) => item2 && transformAfter(args, item2, config, generalConfig, true),
        );
      } else {
        prev[name] = transformAfter(args, item[name], config, generalConfig, true);
      }

      return prev;
    },
    {},
  );

  const { id, ...rest } = item;

  let globalId;

  if (isChild && configType !== 'tangible') {
    globalId = id;
  } else if (generalConfig) {
    const { root: rootName, descendantKey } = parseEntityName(entityConfig.name, generalConfig);

    globalId = toGlobalId(id, rootName, descendantKey);
  } else {
    globalId = toGlobalId(id, entityConfig.name);
  }

  const { token } = args;

  return {
    ...rest,
    ...recursiveFields,
    ...transformedFields,
    id: globalId,
    _token: token,
  };
};

export default transformAfter;
