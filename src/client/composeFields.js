// @flow
import type { ThingConfig, ClientFieldsOptions } from '../flowTypes';

// accessorial function
const includeField = (name: string, include: void | Object, exclude: void | Object): boolean =>
  (!include || Object.keys(include).includes(name)) &&
  (!exclude || !(Object.keys(exclude).includes(name) && exclude[name] === null));

const composeFields = (thingConfig: ThingConfig, options: ClientFieldsOptions): Array<string> => {
  const {
    booleanFields,
    dateTimeFields,
    duplexFields,
    embedded,
    embeddedFields,
    enumFields,
    floatFields,
    intFields,
    geospatialFields,
    relationalFields,
    textFields,
  } = thingConfig;
  const { shift, depth, include, exclude } = options;

  const result = [];

  if (!embedded) {
    if (includeField('id', include, exclude)) result.push(`${'  '.repeat(shift)}id`);
    if (includeField('createdAt', include, exclude)) result.push(`${'  '.repeat(shift)}createdAt`);
    if (includeField('updatedAt', include, exclude)) result.push(`${'  '.repeat(shift)}updatedAt`);
  }

  if (textFields) {
    textFields.reduce((prev, { name }) => {
      if (includeField(name, include, exclude)) {
        prev.push(`${'  '.repeat(shift)}${name}`);
      }
      return prev;
    }, result);
  }

  if (dateTimeFields) {
    dateTimeFields.reduce((prev, { name }) => {
      if (includeField(name, include, exclude)) {
        prev.push(`${'  '.repeat(shift)}${name}`);
      }
      return prev;
    }, result);
  }

  if (intFields) {
    intFields.reduce((prev, { name }) => {
      if (includeField(name, include, exclude)) {
        prev.push(`${'  '.repeat(shift)}${name}`);
      }
      return prev;
    }, result);
  }

  if (floatFields) {
    floatFields.reduce((prev, { name }) => {
      if (includeField(name, include, exclude)) {
        prev.push(`${'  '.repeat(shift)}${name}`);
      }
      return prev;
    }, result);
  }

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

  if (relationalFields && !depth) {
    relationalFields.reduce((prev, { name }) => {
      if (includeField(name, include, exclude)) {
        prev.push(`${'  '.repeat(shift)}${name} {`);
        prev.push(`${'  '.repeat(shift)}  id`);
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

  if (duplexFields && !depth) {
    duplexFields.reduce((prev, { name }) => {
      if (includeField(name, include, exclude)) {
        prev.push(`${'  '.repeat(shift)}${name} {`);
        prev.push(`${'  '.repeat(shift)}  id`);
        prev.push(`${'  '.repeat(shift)}}`);
      }
      return prev;
    }, result);
  }

  if (geospatialFields) {
    geospatialFields.reduce((prev, { name, geospatialType }) => {
      if (includeField(name, include, exclude)) {
        if (geospatialType === 'Point') {
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
        if (geospatialType === 'Polygon') {
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

export default composeFields;
