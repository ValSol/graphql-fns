import type {
  EntityConfig,
  ClientFieldsOptions,
  ClientOptions,
  GeneralConfig,
  TangibleEntityConfig,
  GraphqlObject,
} from '../../tsTypes';
import type { ChildQueries } from './tsTypes';

import parseChildQueries from './parseChildQueries';

// accessorial function
const includeField = (name: string, include?: any, exclude?: any): boolean =>
  (include === undefined ||
    include === true ||
    Object.keys(include)
      .map((key) => key.trim().split(/\s+/).slice(-1)[0])
      .includes(name)) &&
  (exclude === undefined || exclude === true || !(exclude[name] === true));

const findNameWithAlias = (name: string, include?: any): string =>
  include && include !== true
    ? // $FlowFixMe - always have 'string' as a result of 'find', but 'flowjs doesn't know about that
      Object.keys(include).find((key) => key.trim().split(/\s+/).slice(-1)[0] === name)
    : name;

const getChildQueries = (
  entityConfig2: EntityConfig,
  generalConfig2: GeneralConfig,
  options2: ClientOptions,
): {
  childQueries: ChildQueries;
  maxShift: number;
} => {
  let maxShift = 0;

  const getChilds = (
    entityConfig: EntityConfig,
    generalConfig: GeneralConfig,
    options: ClientFieldsOptions,
    result: Array<string> = [],
  ): Array<string> => {
    const { duplexFields, relationalFields } = entityConfig as TangibleEntityConfig;
    const { shift, depth, include, exclude } = options;

    if (shift > maxShift) maxShift = shift;

    if (relationalFields && depth) {
      relationalFields.forEach(({ name, array, config }) => {
        if (includeField(name, include, exclude)) {
          const nameWithAlias = findNameWithAlias(name, include);
          const nextInclude = include && include[nameWithAlias];
          const nextExclude = exclude && exclude[name];
          const nextOptions = {
            shift: shift + 1,
            depth: depth - 1,
            include: nextInclude,
            exclude: nextExclude,
          } as any;
          getChilds(config, generalConfig, nextOptions, result);
          const item = `${array ? 'childEntities' : 'childEntity'}:${config.name}`;
          if (!result.includes(item)) {
            result.push(item);
          }
        }
      });
    }

    if (relationalFields && !depth) {
      relationalFields.forEach(({ name, array, config }) => {
        if (includeField(name, include, exclude)) {
          const item = `${array ? 'childEntities' : 'childEntity'}:${config.name}`;
          if (!result.includes(item)) {
            result.push(item);
          }
        }
      });
    }

    if (duplexFields && depth) {
      duplexFields.forEach(({ name, array, config }) => {
        if (includeField(name, include, exclude)) {
          const nameWithAlias = findNameWithAlias(name, include);
          const nextInclude = include && include[nameWithAlias];
          const nextExclude = exclude && exclude[name];
          const nextOptions = {
            shift: shift + 1,
            depth: depth - 1,
            include: nextInclude,
            exclude: nextExclude,
          } as any;
          getChilds(config, generalConfig, nextOptions, result);
          const item = `${array ? 'childEntities' : 'childEntity'}:${config.name}`;
          if (!result.includes(item)) {
            result.push(item);
          }
        }
      });
    }

    if (duplexFields && !depth) {
      duplexFields.forEach(({ name, array, config }) => {
        if (includeField(name, include, exclude)) {
          const item = `${array ? 'childEntities' : 'childEntity'}:${config.name}`;
          if (!result.includes(item)) {
            result.push(item);
          }
        }
      });
    }

    return result;
  };

  const childQueries = parseChildQueries(
    getChilds(entityConfig2, generalConfig2, { ...options2, shift: 0 }),
    generalConfig2,
  );

  return { childQueries, maxShift };
};

export default getChildQueries;
