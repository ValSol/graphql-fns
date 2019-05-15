// @flow
import type { ThingConfig, ClientOptions } from '../flowTypes';

// accessorial function
const includeField = (name: string, include: void | Object, exclude: void | Object): boolean =>
  (!include || Object.keys(include).includes(name)) &&
  (!exclude || !(Object.keys(exclude).includes(name) && exclude[name] === null));

const composeFields = (thingConfig: ThingConfig, options: ClientOptions): Array<string> => {
  const {
    booleanFields,
    duplexFields,
    embedded,
    embeddedFields,
    enumFields,
    geospatialFields,
    relationalFields,
  } = thingConfig;
  const { shift, depth, include, exclude } = options;

  const result =
    embedded || !includeField('id', include, exclude) ? [] : [`${'  '.repeat(shift)}id`];

  const scalarFields = ['textFields', 'dateTimeFields', 'intFields', 'floatFields'];

  scalarFields.reduce((prev, fieldTypeName) => {
    if (thingConfig[fieldTypeName]) {
      thingConfig[fieldTypeName].forEach(({ name }) => {
        if (includeField(name, include, exclude)) {
          // eslint-disable-next-line no-param-reassign
          prev.push(`${'  '.repeat(shift)}${name}`);
        }
      });
    }
    return prev;
  }, result);

  if (booleanFields) {
    booleanFields.reduce((prev, { name }) => {
      if (includeField(name, include, exclude)) {
        prev.push(`${'  '.repeat(shift)}${name}`);
      }
      return prev;
    }, result);
  }

  if (enumFields) {
    enumFields.reduce((prev, { name }) => {
      if (includeField(name, include, exclude)) {
        prev.push(`${'  '.repeat(shift)}${name}`);
      }
      return prev;
    }, result);
  }

  if (embeddedFields) {
    embeddedFields.reduce((prev, { name, config }) => {
      if (includeField(name, include, exclude)) {
        prev.push(`${'  '.repeat(shift)}${name} {`);
        const nextInclude = include && include[name];
        const nextExclude = exclude && exclude[name];
        const nextOptions = { shift: shift + 1, include: nextInclude, exclude: nextExclude };
        // eslint-disable-next-line prefer-spread
        prev.push.apply(prev, composeFields(config, nextOptions));
        prev.push(`${'  '.repeat(shift)}}`);
      }
      return prev;
    }, result);
  }

  if (relationalFields && depth) {
    relationalFields.reduce((prev, { name, config }) => {
      if (includeField(name, include, exclude)) {
        prev.push(`${'  '.repeat(shift)}${name} {`);
        const nextInclude = include && include[name];
        const nextExclude = exclude && exclude[name];
        const nextOptions = {
          shift: shift + 1,
          depth: depth - 1,
          include: nextInclude,
          exclude: nextExclude,
        };
        // eslint-disable-next-line prefer-spread
        prev.push.apply(prev, composeFields(config, nextOptions));
        prev.push(`${'  '.repeat(shift)}}`);
      }
      return prev;
    }, result);
  }

  if (duplexFields && depth) {
    duplexFields.reduce((prev, { name, config }) => {
      if (includeField(name, include, exclude)) {
        prev.push(`${'  '.repeat(shift)}${name} {`);
        const nextInclude = include && include[name];
        const nextExclude = exclude && exclude[name];
        const nextOptions = {
          shift: shift + 1,
          depth: depth - 1,
          include: nextInclude,
          exclude: nextExclude,
        };
        // eslint-disable-next-line prefer-spread
        prev.push.apply(prev, composeFields(config, nextOptions));
        prev.push(`${'  '.repeat(shift)}}`);
      }
      return prev;
    }, result);
  }

  if (geospatialFields) {
    geospatialFields.reduce((prev, { name, type }) => {
      if (includeField(name, include, exclude)) {
        if (type === 'Point') {
          prev.push(`${'  '.repeat(shift)}${name} {`);
          const nestedInculde = include && include[name];
          const nestedExclude = exclude && exclude[name];
          if (includeField('longitude', nestedInculde, nestedExclude)) {
            prev.push(`${'  '.repeat(shift + 1)}longitude`);
          }
          if (includeField('latitude', nestedInculde, nestedExclude)) {
            prev.push(`${'  '.repeat(shift + 1)}latitude`);
          }
          prev.push(`${'  '.repeat(shift)}}`);
        }
        if (type === 'Polygon') {
          prev.push(`${'  '.repeat(shift)}${name} {`);
          const includeExteralRing =
            includeField('externalRing', include && include[name], exclude && exclude[name]) &&
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
                'longitude',
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
              prev.push(`${'  '.repeat(shift + 3)}longitude`);
            }
            if (
              includeField(
                'latitude',
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
              prev.push(`${'  '.repeat(shift + 3)}latitude`);
            }
            prev.push(`${'  '.repeat(shift + 2)}}`);
            prev.push(`${'  '.repeat(shift + 1)}}`);
          }
          const includeInternalRings =
            includeField('internalRings', include && include[name], exclude && exclude[name]) &&
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
                'longitude',
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
              prev.push(`${'  '.repeat(shift + 3)}longitude`);
            }
            if (
              includeField(
                'latitude',
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
              prev.push(`${'  '.repeat(shift + 3)}latitude`);
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

module.exports = composeFields;
