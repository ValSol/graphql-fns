import { Types } from 'mongoose';

import type {
  EmbeddedField,
  EntityConfig,
  EntityConfigObject,
  InvolvedFilter,
  LookupMongoDB,
  TangibleEntityConfig,
} from '@/tsTypes';

import composeFieldsObject, { FOR_MONGO_QUERY } from '@/utils/composeFieldsObject';
import pointFromGqlToMongo from '@/resolvers/mutations/processCreateInputData/pointFromGqlToMongo';
import composeRelationalKey from './composeRelationalKey';
import composeWithinPolygonInput from './composeWithinPolygonInput';
import composeWithinSphereInput from './composeWithinSphereInput';

const checkField = (
  keyWithoutSuffix: string,
  entityName: string,
  embeddedPrefix: string,
  fieldsObj: EntityConfigObject,
  entireWhere: string,
) => {
  if (!embeddedPrefix && ['createdAt', 'updatedAt'].includes(keyWithoutSuffix)) {
    return;
  }
  if (!fieldsObj[keyWithoutSuffix]) {
    throw new TypeError(
      `Field "${keyWithoutSuffix}" not found in "${entityName}" entity in filter: "${entireWhere}!`,
    );
  }
};

const processIdKey = (
  key: string,
  suffix: string,
  prefix: string,
  embeddedPrefix: string,
  where: InvolvedFilter,
  result: {
    _id: string;
  },
  notCreateObjectId: undefined | boolean,
) => {
  const keyWithoutSuffix = key.slice(0, -suffix.length);

  const key2 = keyWithoutSuffix === 'id' ? '_id' : keyWithoutSuffix;

  if (!result[`${prefix}${embeddedPrefix}${key2}`]) {
    result[`${prefix}${embeddedPrefix}${key2}`] = {};
  }

  result[`${prefix}${embeddedPrefix}${key2}`][`$${suffix.slice(1)}`] = (
    where[key] as unknown as string[]
  ).map((id) => id && (notCreateObjectId ? id : new Types.ObjectId(id)));
};

const processKey = (
  key: string,
  suffix: string,
  prefix: string,
  embeddedPrefix: string,
  where: InvolvedFilter,
  entityName: string,
  fieldsObj: EntityConfigObject,
  entireWhere: string,
  result: {
    _id: string;
  },
) => {
  const keyWithoutSuffix = key.slice(0, -suffix.length);

  checkField(keyWithoutSuffix, entityName, embeddedPrefix, fieldsObj, entireWhere);

  if (!result[`${prefix}${embeddedPrefix}${keyWithoutSuffix}`]) {
    result[`${prefix}${embeddedPrefix}${keyWithoutSuffix}`] = {};
  }

  result[`${prefix}${embeddedPrefix}${keyWithoutSuffix}`][`$${suffix.slice(1)}`] = where[key];
};

const composeWhereInputRecursively = (
  where: InvolvedFilter,
  parentFieldName: string,
  embeddedPrefix: string,
  lookupArray: Array<string>,
  entityConfig: EntityConfig,
  entireWhere: string,
  notCreateObjectId?: boolean,
): any => {
  if (!where || Object.keys(where).length === 0) return {};

  const { name: entityName, type: entityType } = entityConfig;

  const { fieldsObject: fieldsObj } = composeFieldsObject(entityConfig, FOR_MONGO_QUERY);

  const idFields = ['id'];

  if (entityType === 'tangible') {
    const { duplexFields = [], relationalFields = [] } = entityConfig;

    duplexFields.reduce((prev, { name }) => {
      prev.push(name);
      return prev;
    }, idFields);

    relationalFields.reduce((prev, { name }) => {
      prev.push(name);
      return prev;
    }, idFields);
  }

  const prefix = parentFieldName ? `${parentFieldName}.` : '';

  const result = {} as { _id: string };

  Object.keys(where).forEach((key) => {
    if (key === '_index') {
      // do nothing
    } else if (key.endsWith('_in') && idFields.includes(key.slice(0, -'_in'.length))) {
      processIdKey(key, '_in', prefix, embeddedPrefix, where, result, notCreateObjectId);
    } else if (key.endsWith('_nin') && idFields.includes(key.slice(0, -'_nin'.length))) {
      processIdKey(key, '_nin', prefix, embeddedPrefix, where, result, notCreateObjectId);
    } else if (key.endsWith('_in')) {
      processKey(
        key,
        '_in',
        prefix,
        embeddedPrefix,
        where,
        entityName,
        fieldsObj,
        entireWhere,
        result,
      );
    } else if (key.endsWith('_lt')) {
      processKey(
        key,
        '_lt',
        prefix,
        embeddedPrefix,
        where,
        entityName,
        fieldsObj,
        entireWhere,
        result,
      );
    } else if (key.endsWith('_gt')) {
      processKey(
        key,
        '_gt',
        prefix,
        embeddedPrefix,
        where,
        entityName,
        fieldsObj,
        entireWhere,
        result,
      );
    } else if (key.endsWith('_ne')) {
      processKey(
        key,
        '_ne',
        prefix,
        embeddedPrefix,
        where,
        entityName,
        fieldsObj,
        entireWhere,
        result,
      );
    } else if (key.endsWith('_nin')) {
      processKey(
        key,
        '_nin',
        prefix,
        embeddedPrefix,
        where,
        entityName,
        fieldsObj,
        entireWhere,
        result,
      );
    } else if (key.endsWith('_lte')) {
      processKey(
        key,
        '_lte',
        prefix,
        embeddedPrefix,
        where,
        entityName,
        fieldsObj,
        entireWhere,
        result,
      );
    } else if (key.endsWith('_gte')) {
      processKey(
        key,
        '_gte',
        prefix,
        embeddedPrefix,
        where,
        entityName,
        fieldsObj,
        entireWhere,
        result,
      );
    } else if (key.endsWith('_exists')) {
      processKey(
        key,
        '_exists',
        prefix,
        embeddedPrefix,
        where,
        entityName,
        fieldsObj,
        entireWhere,
        result,
      );
    } else if (key.endsWith('_size')) {
      processKey(
        key,
        '_size',
        prefix,
        embeddedPrefix,
        where,
        entityName,
        fieldsObj,
        entireWhere,
        result,
      );
    } else if (key.endsWith('_re')) {
      const keyWithoutSuffix = key.slice(0, -'_re'.length);

      checkField(keyWithoutSuffix, entityName, embeddedPrefix, fieldsObj, entireWhere);

      if (!result[`${prefix}${embeddedPrefix}${keyWithoutSuffix}`]) {
        result[`${prefix}${embeddedPrefix}${keyWithoutSuffix}`] = {};
      }

      result[`${prefix}${embeddedPrefix}${keyWithoutSuffix}`].$in = (
        where[key] as unknown as { pattern: string; flags: string }[]
      ).map((item) => new RegExp(item.pattern, item.flags));
    } else if (key.endsWith('_notsize')) {
      const keyWithoutSuffix = key.slice(0, -'_notsize'.length);

      checkField(keyWithoutSuffix, entityName, embeddedPrefix, fieldsObj, entireWhere);

      if (!result[`${prefix}${embeddedPrefix}${keyWithoutSuffix}`]) {
        result[`${prefix}${embeddedPrefix}${keyWithoutSuffix}`] = {};
      }

      result[`${prefix}${embeddedPrefix}${keyWithoutSuffix}`].$not = { $size: where[key] };
    } else if (key.endsWith('_withinPolygon')) {
      const keyWithoutSuffix = key.slice(0, -'_withinPolygon'.length);

      checkField(keyWithoutSuffix, entityName, embeddedPrefix, fieldsObj, entireWhere);

      if (!result[`${prefix}${embeddedPrefix}${keyWithoutSuffix}`]) {
        result[`${prefix}${embeddedPrefix}${keyWithoutSuffix}`] = {};
      }

      if (!result[`${prefix}${embeddedPrefix}${keyWithoutSuffix}`].$geoWithin) {
        result[`${prefix}${embeddedPrefix}${keyWithoutSuffix}`].$geoWithin = {};
      }

      result[`${prefix}${embeddedPrefix}${keyWithoutSuffix}`].$geoWithin.$polygon =
        composeWithinPolygonInput(where[key] as { lat: number; lng: number }[]);
    } else if (key.endsWith('_withinSphere')) {
      const keyWithoutSuffix = key.slice(0, -'_withinSphere'.length);

      checkField(keyWithoutSuffix, entityName, embeddedPrefix, fieldsObj, entireWhere);

      if (!result[`${prefix}${embeddedPrefix}${keyWithoutSuffix}`]) {
        result[`${prefix}${embeddedPrefix}${keyWithoutSuffix}`] = {};
      }

      if (!result[`${prefix}${embeddedPrefix}${keyWithoutSuffix}`].$geoWithin) {
        result[`${prefix}${embeddedPrefix}${keyWithoutSuffix}`].$geoWithin = {};
      }

      result[`${prefix}${embeddedPrefix}${keyWithoutSuffix}`].$geoWithin.$centerSphere =
        composeWithinSphereInput(
          where[key] as { center: { lat: number; lng: number }; radius: number },
        );
    } else if (key.endsWith('_intersectsPoint')) {
      const keyWithoutSuffix = key.slice(0, -'_intersectsPoint'.length);

      checkField(keyWithoutSuffix, entityName, embeddedPrefix, fieldsObj, entireWhere);

      result[`${prefix}${embeddedPrefix}${keyWithoutSuffix}`] = {
        $geoIntersects: {
          $geometry: pointFromGqlToMongo(where[key] as { lat: number; lng: number }),
        },
      };
    } else if (key === 'AND' || key === 'OR' || key === 'NOR') {
      result[`$${key.toLowerCase()}`] = (where[key] as InvolvedFilter[]).map((where2) =>
        composeWhereInputRecursively(
          where2,
          parentFieldName,
          embeddedPrefix,
          lookupArray,
          entityConfig,
          entireWhere,
          notCreateObjectId,
        ),
      );
    } else if (idFields.includes(key)) {
      const key2 = key === 'id' ? '_id' : key;

      if (!result[`${prefix}${embeddedPrefix}${key2}`]) {
        result[`${prefix}${embeddedPrefix}${key2}`] = {};
      }

      result[`${prefix}${embeddedPrefix}${key2}`].$eq =
        where[key] &&
        (notCreateObjectId ? where[key] : new Types.ObjectId(where[key] as unknown as string));
    } else if (key.endsWith('_')) {
      checkField(key.slice(0, -1), entityName, embeddedPrefix, fieldsObj, entireWhere);

      if (parentFieldName) {
        throw new TypeError(
          `Restricted relational field: "${key}" becouse not empty "${parentFieldName}" parentField in filter: "${entireWhere}!`,
        );
      }

      const {
        relationalKey,
        entityConfig: entityConfig2,
        value,
      } = composeRelationalKey(
        { [key]: where[key] },
        lookupArray,
        entityConfig as TangibleEntityConfig,
      );

      const result2 = composeWhereInputRecursively(
        value,
        relationalKey,
        '', // embeddedPrefix begin from ""
        lookupArray,
        entityConfig2,
        entireWhere,
        notCreateObjectId,
      );

      Object.keys(result2).forEach((key2) => {
        result[key2] = result2[key2];
      });
    } else {
      checkField(key, entityName, embeddedPrefix, fieldsObj, entireWhere);

      if (fieldsObj[key].type === 'embeddedFields') {
        const attributes = fieldsObj[key];

        const { config } = attributes as EmbeddedField;

        const { _index } = where[key] as { _index?: number };

        if (fieldsObj[key].array !== true && _index !== undefined) {
          throw new TypeError(
            `Found "_index" property "${_index}" in "scalar" field "${key}" in "${entityName}" entity in filter: "${entireWhere}!`,
          );
        }

        const result2 = composeWhereInputRecursively(
          where[key] as InvolvedFilter,
          parentFieldName,
          `${embeddedPrefix}${key}.${_index === undefined ? '' : `${_index}.`}`,
          lookupArray,
          config,
          entireWhere,
          notCreateObjectId,
        );

        Object.keys(result2).forEach((key2) => {
          result[key2] = result2[key2];
        });
      } else {
        if (!result[`${prefix}${embeddedPrefix}${key}`]) {
          result[`${prefix}${embeddedPrefix}${key}`] = {};
        }

        result[`${prefix}${embeddedPrefix}${key}`].$eq = where[key];
      }
    }
  });
  return result;
};

const composeWhereInput = (
  where: InvolvedFilter,
  entityConfig: EntityConfig,
  notCreateObjectId?: boolean,
): {
  where: InvolvedFilter;
  lookups: LookupMongoDB[];
} => {
  const lookupArray: Array<string> = [];
  const where2 = composeWhereInputRecursively(
    where,
    '',
    '',
    lookupArray,
    entityConfig,
    `"${entityConfig.name}": "${JSON.stringify(where)}"`,
    notCreateObjectId,
  );

  const lookups = lookupArray.reduce<Array<LookupMongoDB>>((prev, fieldEntityPair) => {
    const [parentFieldName, fieldName, entityName, parentRelationalOppositeName] =
      fieldEntityPair.split(':');

    if (parentRelationalOppositeName) {
      prev.push({
        $lookup: {
          from: `${entityName.toLowerCase()}_things`,
          localField: `${parentFieldName}${parentFieldName ? '.' : ''}_id`,
          foreignField: parentRelationalOppositeName,
          as: `${parentFieldName}${fieldName}`,
        },
      });
    } else {
      prev.push({
        $lookup: {
          from: `${entityName.toLowerCase()}_things`,
          localField: `${parentFieldName}${parentFieldName ? '.' : ''}${fieldName.slice(0, -1)}`,
          foreignField: '_id',
          as: `${parentFieldName}${fieldName}`,
        },
      });
    }

    return prev;
  }, []);

  return { where: where2, lookups };
};

export default composeWhereInput;
