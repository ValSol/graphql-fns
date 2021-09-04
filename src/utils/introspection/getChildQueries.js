// @flow

import type {
  ThingConfig,
  ClientFieldsOptions,
  ClientOptions,
  GeneralConfig,
} from '../../flowTypes';
import type { ChildQueries } from './flowTypes';

import parseChildQueries from './parseChildQueries';

// accessorial function
const includeField = (name: string, include: void | Object, exclude: void | Object): boolean =>
  (include === undefined ||
    include === true ||
    Object.keys(include)
      .map((key) => key.trim().split(/\s+/).slice(-1)[0])
      .includes(name)) &&
  (exclude === undefined || exclude === true || !(exclude[name] === true));

const findNameWithAlias = (name: string, include: void | Object): string =>
  include && include !== true
    ? // $FlowFixMe - always have 'string' as a result of 'find', but 'flowjs doesn't know about that
      Object.keys(include).find((key) => key.trim().split(/\s+/).slice(-1)[0] === name)
    : name;

const getChildQueries = (
  thingConfig2: ThingConfig,
  generalConfig2: GeneralConfig,
  options2: ClientOptions,
): { childQueries: ChildQueries, maxShift: number } => {
  let maxShift = 0;

  const getChilds = (
    thingConfig: ThingConfig,
    generalConfig: GeneralConfig,
    options: ClientFieldsOptions,
    result?: Array<string> = [],
  ): Array<string> => {
    const { duplexFields, relationalFields } = thingConfig;
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
          };
          getChilds(config, generalConfig, nextOptions, result);
          const item = `${array ? 'childThings' : 'childThing'}:${config.name}`;
          if (!result.includes(item)) {
            result.push(item);
          }
        }
      });
    }

    if (relationalFields && !depth) {
      relationalFields.forEach(({ name, array, config }) => {
        if (includeField(name, include, exclude)) {
          const item = `${array ? 'childThings' : 'childThing'}:${config.name}`;
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
          };
          getChilds(config, generalConfig, nextOptions, result);
          const item = `${array ? 'childThings' : 'childThing'}:${config.name}`;
          if (!result.includes(item)) {
            result.push(item);
          }
        }
      });
    }

    if (duplexFields && !depth) {
      duplexFields.forEach(({ name, array, config }) => {
        if (includeField(name, include, exclude)) {
          const item = `${array ? 'childThings' : 'childThing'}:${config.name}`;
          if (!result.includes(item)) {
            result.push(item);
          }
        }
      });
    }

    return result;
  };

  const childQueries = parseChildQueries(
    getChilds(thingConfig2, generalConfig2, { ...options2, shift: 0 }),
    generalConfig2,
  );

  return { childQueries, maxShift };
};

export default getChildQueries;
