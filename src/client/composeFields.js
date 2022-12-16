// @flow

import type { EntityConfig, ClientFieldsOptions, GeneralConfig } from '../flowTypes';

import composeChildActionSignature from '../types/composeChildActionSignature';

type ClientFieldsOptionsWithChildArgs = {
  ...ClientFieldsOptions,
  currentChild: string,
  childArgs: { [argName: string]: string },
};

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

const getNameOrAlias = (nameWithAlias) => nameWithAlias.split(': ')[0];

const composeChildArgs = (currentChild, entityConfig) =>
  composeChildActionSignature(entityConfig, 'childEntities')
    .split(', ')
    .filter(Boolean)
    .reduce((prev, item) => {
      const [argName, argType] = item.split(': ');
      prev[`${currentChild}_${argName}`] = argType; // eslint-disable-line no-param-reassign
      return prev;
    }, {});

const composeArrArgs = (currentChild) => ({ [`${currentChild}_slice`]: 'SliceInput' });

const composeChildArgsStr = (childArgs) =>
  Object.keys(childArgs)
    .map((key) => {
      const keyArr = key.split('_');
      const bareName = keyArr[keyArr.length - 1];
      return `${bareName}: $${key}`;
    })
    .join(', ');

const composeFieldsWithChildArgs = (
  entityConfig: EntityConfig,
  generalConfig: GeneralConfig,
  options: ClientFieldsOptionsWithChildArgs,
): Array<string> => {
  const {
    booleanFields,
    counter,
    dateTimeFields,
    duplexFields,
    embeddedFields,
    enumFields,
    fileFields,
    floatFields,
    intFields,
    geospatialFields,
    relationalFields,
    textFields,
    type: configType,
  } = entityConfig;
  const { childArgs, currentChild, depth, include, exclude, shift } = options;

  const result = [];

  if (configType !== 'virtual') {
    if (includeField('id', include, exclude)) result.push(`${'  '.repeat(shift)}id`);

    if (configType === 'tangible') {
      if (includeField('createdAt', include, exclude)) {
        result.push(`${'  '.repeat(shift)}createdAt`);
      }
      if (includeField('updatedAt', include, exclude)) {
        result.push(`${'  '.repeat(shift)}updatedAt`);
      }
      if (counter && includeField('counter', include, exclude)) {
        result.push(`${'  '.repeat(shift)}counter`);
      }
    }
  }

  if (textFields) {
    textFields.reduce((prev, { name, array }) => {
      if (includeField(name, include, exclude)) {
        const nameWithAlias = findNameWithAlias(name, include);
        if (array && configType !== 'embedded') {
          const nameOrAlias = getNameOrAlias(nameWithAlias);
          const newCurrentChild = currentChild ? `${currentChild}_${nameOrAlias}` : nameOrAlias;
          const currentChildArgs = composeArrArgs(newCurrentChild);
          Object.assign(childArgs, currentChildArgs);
          prev.push(
            `${'  '.repeat(shift)}${nameWithAlias}(${composeChildArgsStr(currentChildArgs)})`,
          );
        } else {
          prev.push(`${'  '.repeat(shift)}${nameWithAlias}`);
        }
      }
      return prev;
    }, result);
  }

  if (dateTimeFields) {
    dateTimeFields.reduce((prev, { name, array }) => {
      if (includeField(name, include, exclude)) {
        const nameWithAlias = findNameWithAlias(name, include);
        if (array && configType !== 'embedded') {
          const nameOrAlias = getNameOrAlias(nameWithAlias);
          const newCurrentChild = currentChild ? `${currentChild}_${nameOrAlias}` : nameOrAlias;
          const currentChildArgs = composeArrArgs(newCurrentChild);
          Object.assign(childArgs, currentChildArgs);
          prev.push(
            `${'  '.repeat(shift)}${nameWithAlias}(${composeChildArgsStr(currentChildArgs)})`,
          );
        } else {
          prev.push(`${'  '.repeat(shift)}${nameWithAlias}`);
        }
      }
      return prev;
    }, result);
  }

  if (intFields) {
    intFields.reduce((prev, { name, array }) => {
      if (includeField(name, include, exclude)) {
        const nameWithAlias = findNameWithAlias(name, include);
        if (array && configType !== 'embedded') {
          const nameOrAlias = getNameOrAlias(nameWithAlias);
          const newCurrentChild = currentChild ? `${currentChild}_${nameOrAlias}` : nameOrAlias;
          const currentChildArgs = composeArrArgs(newCurrentChild);
          Object.assign(childArgs, currentChildArgs);
          prev.push(
            `${'  '.repeat(shift)}${nameWithAlias}(${composeChildArgsStr(currentChildArgs)})`,
          );
        } else {
          prev.push(`${'  '.repeat(shift)}${nameWithAlias}`);
        }
      }
      return prev;
    }, result);
  }

  if (floatFields) {
    floatFields.reduce((prev, { name, array }) => {
      if (includeField(name, include, exclude)) {
        const nameWithAlias = findNameWithAlias(name, include);
        if (array && configType !== 'embedded') {
          const nameOrAlias = getNameOrAlias(nameWithAlias);
          const newCurrentChild = currentChild ? `${currentChild}_${nameOrAlias}` : nameOrAlias;
          const currentChildArgs = composeArrArgs(newCurrentChild);
          Object.assign(childArgs, currentChildArgs);
          prev.push(
            `${'  '.repeat(shift)}${nameWithAlias}(${composeChildArgsStr(currentChildArgs)})`,
          );
        } else {
          prev.push(`${'  '.repeat(shift)}${nameWithAlias}`);
        }
      }
      return prev;
    }, result);
  }

  if (booleanFields) {
    booleanFields.reduce((prev, { name, array }) => {
      if (includeField(name, include, exclude)) {
        const nameWithAlias = findNameWithAlias(name, include);
        if (array && configType !== 'embedded') {
          const nameOrAlias = getNameOrAlias(nameWithAlias);
          const newCurrentChild = currentChild ? `${currentChild}_${nameOrAlias}` : nameOrAlias;
          const currentChildArgs = composeArrArgs(newCurrentChild);
          Object.assign(childArgs, currentChildArgs);
          prev.push(
            `${'  '.repeat(shift)}${nameWithAlias}(${composeChildArgsStr(currentChildArgs)})`,
          );
        } else {
          prev.push(`${'  '.repeat(shift)}${nameWithAlias}`);
        }
      }
      return prev;
    }, result);
  }

  if (enumFields) {
    enumFields.reduce((prev, { name, array }) => {
      if (includeField(name, include, exclude)) {
        const nameWithAlias = findNameWithAlias(name, include);
        if (array && configType !== 'embedded') {
          const nameOrAlias = getNameOrAlias(nameWithAlias);
          const newCurrentChild = currentChild ? `${currentChild}_${nameOrAlias}` : nameOrAlias;
          const currentChildArgs = composeArrArgs(newCurrentChild);
          Object.assign(childArgs, currentChildArgs);
          prev.push(
            `${'  '.repeat(shift)}${nameWithAlias}(${composeChildArgsStr(currentChildArgs)})`,
          );
        } else {
          prev.push(`${'  '.repeat(shift)}${nameWithAlias}`);
        }
      }
      return prev;
    }, result);
  }

  if (embeddedFields) {
    embeddedFields.reduce((prev, { name, array, config }) => {
      if (includeField(name, include, exclude)) {
        const nameWithAlias = findNameWithAlias(name, include);

        if (array && configType !== 'embedded') {
          const nameOrAlias = getNameOrAlias(nameWithAlias);
          const newCurrentChild = currentChild ? `${currentChild}_${nameOrAlias}` : nameOrAlias;
          const currentChildArgs = composeArrArgs(newCurrentChild);
          Object.assign(childArgs, currentChildArgs);
          prev.push(
            `${'  '.repeat(shift)}${nameWithAlias}(${composeChildArgsStr(currentChildArgs)}) {`,
          );
        } else {
          prev.push(`${'  '.repeat(shift)}${nameWithAlias} {`);
        }

        const nextInclude = include && include[nameWithAlias];
        const nextExclude = exclude && exclude[name];
        const nextOptions = {
          childArgs,
          currentChild,
          shift: shift + 1,
          include: nextInclude,
          exclude: nextExclude,
        };
        // eslint-disable-next-line prefer-spread
        prev.push.apply(prev, composeFieldsWithChildArgs(config, generalConfig, nextOptions));
        prev.push(`${'  '.repeat(shift)}}`);
      }
      return prev;
    }, result);
  }

  if (fileFields) {
    fileFields.reduce((prev, { name, array, config }) => {
      if (includeField(name, include, exclude)) {
        const nameWithAlias = findNameWithAlias(name, include);

        if (array && configType !== 'embedded') {
          const nameOrAlias = getNameOrAlias(nameWithAlias);
          const newCurrentChild = currentChild ? `${currentChild}_${nameOrAlias}` : nameOrAlias;
          const currentChildArgs = composeArrArgs(newCurrentChild);
          Object.assign(childArgs, currentChildArgs);
          prev.push(
            `${'  '.repeat(shift)}${nameWithAlias}(${composeChildArgsStr(currentChildArgs)}) {`,
          );
        } else {
          prev.push(`${'  '.repeat(shift)}${nameWithAlias} {`);
        }

        const nextInclude = include && include[nameWithAlias];
        const nextExclude = exclude && exclude[name];
        const nextOptions = {
          childArgs,
          currentChild,
          shift: shift + 1,
          include: nextInclude,
          exclude: nextExclude,
        };
        // eslint-disable-next-line prefer-spread
        prev.push.apply(prev, composeFieldsWithChildArgs(config, generalConfig, nextOptions));
        prev.push(`${'  '.repeat(shift)}}`);
      }
      return prev;
    }, result);
  }

  if (relationalFields && depth) {
    relationalFields.reduce((prev, { name, array, config }) => {
      if (includeField(name, include, exclude)) {
        const nameWithAlias = findNameWithAlias(name, include);
        const nextInclude = include && include[nameWithAlias];
        const nextExclude = exclude && exclude[name];
        const nameOrAlias = getNameOrAlias(nameWithAlias);
        const newCurrentChild = currentChild ? `${currentChild}_${nameOrAlias}` : nameOrAlias;
        const nextOptions = {
          childArgs,
          currentChild: newCurrentChild,
          shift: shift + 1,
          depth: depth - 1,
          include: nextInclude,
          exclude: nextExclude,
        };
        if (array) {
          const currentChildArgs = composeChildArgs(newCurrentChild, config);
          Object.assign(childArgs, currentChildArgs);
          prev.push(
            `${'  '.repeat(shift)}${nameWithAlias}(${composeChildArgsStr(currentChildArgs)}) {`,
          );
        } else {
          prev.push(`${'  '.repeat(shift)}${nameWithAlias} {`);
        }
        // eslint-disable-next-line prefer-spread
        prev.push.apply(prev, composeFieldsWithChildArgs(config, generalConfig, nextOptions));
        prev.push(`${'  '.repeat(shift)}}`);
      }
      return prev;
    }, result);
  }

  if (relationalFields && !depth) {
    relationalFields.reduce((prev, { name, array, config }) => {
      if (includeField(name, include, exclude)) {
        const nameWithAlias = findNameWithAlias(name, include);
        if (array) {
          const nameOrAlias = getNameOrAlias(nameWithAlias);
          const newCurrentChild = currentChild ? `${currentChild}_${nameOrAlias}` : nameOrAlias;
          const currentChildArgs = composeChildArgs(newCurrentChild, config);
          Object.assign(childArgs, currentChildArgs);
          prev.push(
            `${'  '.repeat(shift)}${nameWithAlias}(${composeChildArgsStr(currentChildArgs)}) {`,
          );
        } else {
          prev.push(`${'  '.repeat(shift)}${nameWithAlias} {`);
        }
        prev.push(`${'  '.repeat(shift)}  id`);
        prev.push(`${'  '.repeat(shift)}}`);
      }
      return prev;
    }, result);
  }

  if (duplexFields && depth) {
    duplexFields.reduce((prev, { name, array, config }) => {
      if (includeField(name, include, exclude)) {
        const nameWithAlias = findNameWithAlias(name, include);
        const nextInclude = include && include[nameWithAlias];
        const nextExclude = exclude && exclude[name];
        const nameOrAlias = getNameOrAlias(nameWithAlias);
        const newCurrentChild = currentChild ? `${currentChild}_${nameOrAlias}` : nameOrAlias;
        const nextOptions = {
          childArgs,
          currentChild: newCurrentChild,
          shift: shift + 1,
          depth: depth - 1,
          include: nextInclude,
          exclude: nextExclude,
        };
        if (array) {
          const currentChildArgs = composeChildArgs(newCurrentChild, config);
          Object.assign(childArgs, currentChildArgs);
          prev.push(
            `${'  '.repeat(shift)}${nameWithAlias}(${composeChildArgsStr(currentChildArgs)}) {`,
          );
        } else {
          prev.push(`${'  '.repeat(shift)}${nameWithAlias} {`);
        }
        // eslint-disable-next-line prefer-spread
        prev.push.apply(prev, composeFieldsWithChildArgs(config, generalConfig, nextOptions));
        prev.push(`${'  '.repeat(shift)}}`);
      }
      return prev;
    }, result);
  }

  if (duplexFields && !depth) {
    duplexFields.reduce((prev, { name, array, config }) => {
      if (includeField(name, include, exclude)) {
        const nameWithAlias = findNameWithAlias(name, include);
        if (array) {
          const nameOrAlias = getNameOrAlias(nameWithAlias);
          const newCurrentChild = currentChild ? `${currentChild}_${nameOrAlias}` : nameOrAlias;
          const currentChildArgs = composeChildArgs(newCurrentChild, config);
          Object.assign(childArgs, currentChildArgs);
          prev.push(
            `${'  '.repeat(shift)}${nameWithAlias}(${composeChildArgsStr(currentChildArgs)}) {`,
          );
        } else {
          prev.push(`${'  '.repeat(shift)}${nameWithAlias} {`);
        }
        prev.push(`${'  '.repeat(shift)}  id`);
        prev.push(`${'  '.repeat(shift)}}`);
      }

      return prev;
    }, result);
  }

  if (geospatialFields) {
    geospatialFields.reduce((prev, { name, array, geospatialType }) => {
      if (includeField(name, include, exclude)) {
        const nameWithAlias = findNameWithAlias(name, include);
        if (geospatialType === 'Point') {
          if (array && configType !== 'embedded') {
            const nameOrAlias = getNameOrAlias(nameWithAlias);
            const newCurrentChild = currentChild ? `${currentChild}_${nameOrAlias}` : nameOrAlias;
            const currentChildArgs = composeArrArgs(newCurrentChild);
            Object.assign(childArgs, currentChildArgs);
            prev.push(
              `${'  '.repeat(shift)}${nameWithAlias}(${composeChildArgsStr(currentChildArgs)}) {`,
            );
          } else {
            prev.push(`${'  '.repeat(shift)}${nameWithAlias} {`);
          }

          const nestedInculde = include && include[nameWithAlias];
          const nestedExclude = exclude && exclude[name];
          if (includeField('lng', nestedInculde, nestedExclude)) {
            prev.push(`${'  '.repeat(shift + 1)}lng`);
          }
          if (includeField('lat', nestedInculde, nestedExclude)) {
            prev.push(`${'  '.repeat(shift + 1)}lat`);
          }
          prev.push(`${'  '.repeat(shift)}}`);
        }
        if (geospatialType === 'Polygon') {
          if (array && configType !== 'embedded') {
            const nameOrAlias = getNameOrAlias(nameWithAlias);
            const newCurrentChild = currentChild ? `${currentChild}_${nameOrAlias}` : nameOrAlias;
            const currentChildArgs = composeArrArgs(newCurrentChild);
            Object.assign(childArgs, currentChildArgs);
            prev.push(
              `${'  '.repeat(shift)}${nameWithAlias}(${composeChildArgsStr(currentChildArgs)}) {`,
            );
          } else {
            prev.push(`${'  '.repeat(shift)}${nameWithAlias} {`);
          }

          const includeExteralRing =
            includeField(
              'externalRing',
              include && include[nameWithAlias],
              exclude && exclude[name],
            ) &&
            includeField(
              'ring',
              include && include[name] && include[name].externalRing,
              exclude && exclude[name] && exclude[name].externalRing,
            );
          if (includeExteralRing) {
            prev.push(`${'  '.repeat(shift + 1)}externalRing {`);
            prev.push(`${'  '.repeat(shift + 2)}ring {`);
            if (
              includeField(
                'lng',
                include &&
                  include[name] &&
                  include[name].externalRing &&
                  include[name].externalRing.ring,
                exclude &&
                  exclude[name] &&
                  exclude[name].externalRing &&
                  exclude[name].externalRing.ring,
              )
            ) {
              prev.push(`${'  '.repeat(shift + 3)}lng`);
            }
            if (
              includeField(
                'lat',
                include &&
                  include[name] &&
                  include[name].externalRing &&
                  include[name].externalRing.ring,
                exclude &&
                  exclude[name] &&
                  exclude[name].externalRing &&
                  exclude[name].externalRing.ring,
              )
            ) {
              prev.push(`${'  '.repeat(shift + 3)}lat`);
            }
            prev.push(`${'  '.repeat(shift + 2)}}`);
            prev.push(`${'  '.repeat(shift + 1)}}`);
          }
          const includeInternalRings =
            includeField(
              'internalRings',
              include && include[nameWithAlias],
              exclude && exclude[name],
            ) &&
            includeField(
              'ring',
              include && include[name] && include[name].internalsRing,
              exclude && exclude[name] && exclude[name].internalsRing,
            );
          if (includeInternalRings) {
            prev.push(`${'  '.repeat(shift + 1)}internalRings {`);
            prev.push(`${'  '.repeat(shift + 2)}ring {`);
            if (
              includeField(
                'lng',
                include &&
                  include[name] &&
                  include[name].internalRings &&
                  include[name].internalRings.ring,
                exclude &&
                  exclude[name] &&
                  exclude[name].internalRings &&
                  exclude[name].internalRings.ring,
              )
            ) {
              prev.push(`${'  '.repeat(shift + 3)}lng`);
            }
            if (
              includeField(
                'lat',
                include &&
                  include[name] &&
                  include[name].internalRings &&
                  include[name].internalRings.ring,
                exclude &&
                  exclude[name] &&
                  exclude[name].internalRings &&
                  exclude[name].internalRings.ring,
              )
            ) {
              prev.push(`${'  '.repeat(shift + 3)}lat`);
            }
            prev.push(`${'  '.repeat(shift + 2)}}`);
            prev.push(`${'  '.repeat(shift + 1)}}`);
          }
          prev.push(`${'  '.repeat(shift)}}`);
        }
      }
      return prev;
    }, result);
  }

  return result;
};

const composeFields = (
  entityConfig: EntityConfig,
  generalConfig: GeneralConfig,
  options: ClientFieldsOptions,
): { fields: Array<string>, childArgs: { [argName: string]: string } } => {
  const childArgs = {};
  const fields = composeFieldsWithChildArgs(entityConfig, generalConfig, {
    ...options,
    currentChild: '',
    childArgs,
  });
  return { fields, childArgs };
};

export default composeFields;
