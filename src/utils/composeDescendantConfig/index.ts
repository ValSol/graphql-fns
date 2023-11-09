import type {
  DescendantAttributes,
  GeneralConfig,
  EntityConfig,
  EntityConfigObject,
  SimplifiedEntityConfig,
  SimplifiedTangibleEntityConfig,
  SimplifiedVirtualEntityConfig,
  DescendantAttributesActionName,
} from '../../tsTypes';

import composeFieldsObject from '../composeFieldsObject';
import composeEntityConfig from '../composeEntityConfig';
import composeDescendantConfigName from './composeDescendantConfigName';

const store = Object.create(null);

const checkAnyEntityNames =
  (allowEntityNames: Array<string>, descendantKey: string) =>
  (EntityNamesObject, fieldType: string) => {
    Object.keys(EntityNamesObject).forEach((entityName) => {
      if (!allowEntityNames.includes(entityName)) {
        throw new TypeError(
          `Incorrect entityName key: "${entityName}" in ${fieldType} of "${descendantKey}" descendant!`,
        );
      }
    });
  };

const checkAnyFieldNames =
  (rootEntityName: string, fieldsObject: EntityConfigObject, descendantKey: string) =>
  (
    EntityNamesObject: {
      [entityName: string]: string[];
    },
    fieldType: string,
  ) => {
    if (EntityNamesObject[rootEntityName]) {
      EntityNamesObject[rootEntityName].forEach((fieldName) => {
        if (!fieldsObject[fieldName]) {
          throw new TypeError(
            `Incorrect ${fieldType} field name "${fieldName}" for "${rootEntityName}" in: "${descendantKey}" descendant!`,
          );
        }
      });
    }
  };

const composeDescendantConfig = (
  signatureMethods: DescendantAttributes,
  rootEntityConfig: EntityConfig,
  generalConfig: GeneralConfig,
): null | EntityConfig => {
  const { name: rootEntityName, descendantNameSlicePosition } = rootEntityConfig;

  const {
    descendantKey,
    allow,
    addFields = {},
    excludeFields = {},
    includeFields = {},
    interfaces = {},
    freezedFields = {},
    unfreezedFields = {},
  } = signatureMethods;

  const { descendant, allEntityConfigs } = generalConfig;

  if (!descendant) throw new TypeError('"descendant" attribute of generalConfig must be setted!');

  if (!allow[rootEntityName]) return null; // not error but negative result of function!

  const descendantEntityName = composeDescendantConfigName(
    rootEntityName,
    descendantKey,
    descendantNameSlicePosition,
  );

  // use cache if no jest test environment
  if (!process.env.JEST_WORKER_ID && store[descendantEntityName]) {
    return store[descendantEntityName];
  }

  const fieldsObject = composeFieldsObject(rootEntityConfig);

  const allowEntityNames = Object.keys(allow);

  const checkEntityNames = checkAnyEntityNames(allowEntityNames, descendantKey);
  const checkFieldNames = checkAnyFieldNames(rootEntityName, fieldsObject, descendantKey);

  // *** start check args correctness

  checkEntityNames(excludeFields, 'excludeFields');
  checkFieldNames(excludeFields, 'excludeFields');

  checkEntityNames(includeFields, 'includeFields');
  checkFieldNames(includeFields, 'includeFields');

  checkEntityNames(freezedFields, 'freezedFields');
  checkFieldNames(freezedFields, 'freezedFields');

  checkEntityNames(unfreezedFields, 'unfreezedFields');
  checkFieldNames(unfreezedFields, 'unfreezedFields');

  checkEntityNames(addFields, 'addFields');

  checkEntityNames(interfaces, 'interfaces');

  type TangibleFields = Omit<SimplifiedTangibleEntityConfig, 'name' | 'type' | 'counter'>;

  ((addFields[rootEntityName] as TangibleFields)?.relationalFields || []).forEach(({ name }) => {
    throw new TypeError(
      `Forbidden to put relationalFields into "addFields" but got "${name}" field!`,
    );
  });

  ((addFields[rootEntityName] as TangibleFields)?.duplexFields || []).forEach(({ name }) => {
    throw new TypeError(`Forbidden to put duplexFields into "addFields" but got "${name}" field!`);
  });

  const entityConfig = { ...rootEntityConfig, name: descendantEntityName };

  store[descendantEntityName] = entityConfig;

  if (interfaces[rootEntityName] !== undefined) {
    entityConfig.interfaces = interfaces[rootEntityName] as string[];
  } else {
    delete entityConfig.interfaces;
  }

  if (includeFields[rootEntityName]) {
    Object.keys(entityConfig).forEach((key) => {
      if (key.endsWith('Fields')) {
        entityConfig[key] = entityConfig[key].filter(({ name }) =>
          includeFields[rootEntityName].includes(name),
        );
      }
    });
  }

  if (excludeFields[rootEntityName]) {
    Object.keys(entityConfig).forEach((key) => {
      if (key.endsWith('Fields')) {
        entityConfig[key] = entityConfig[key].filter(
          ({ name }) => !excludeFields[rootEntityName].includes(name),
        );
      }
    });
  }

  if (addFields[rootEntityName]) {
    const addFields2 = {
      ...addFields[rootEntityName],
      // name used also for cache results in composeFieldsObject util
      name: `fieldsToAdd ${descendantEntityName}`,
    };

    composeEntityConfig(
      addFields[rootEntityName] as SimplifiedEntityConfig,
      addFields2 as unknown as EntityConfig,
      allEntityConfigs,
      { [descendantEntityName]: [] }, // TODO use correct relationalOppositeNames
    );

    const fieldsToAddObject = composeFieldsObject(addFields2 as unknown as EntityConfig);

    Object.keys(fieldsToAddObject).forEach((fieldName) => {
      if (fieldsObject[fieldName]) {
        const { type: fieldType } = fieldsObject[fieldName];
        entityConfig[fieldType] = entityConfig[fieldType].filter(({ name }) => name !== fieldName);
      }
      const fieldToAdd = fieldsToAddObject[fieldName];

      const { type: fieldType } = fieldToAdd;

      if (entityConfig[fieldType]) {
        entityConfig[fieldType].push(fieldToAdd);
      } else {
        entityConfig[fieldType] = [fieldToAdd];
      }
    });
  }

  Object.keys(entityConfig).forEach((key) => {
    if (key === 'relationalFields' || key === 'duplexFields' || key === 'childFields') {
      entityConfig[key] = entityConfig[key].map((item) => {
        const { name, oppositeName, array, config: currentConfig, required } = item;

        if (name === 'pageInfo') {
          // field "pageInfo" refers to standard child config "PageInfo" so skip it
          return item;
        }

        if (descendant[descendantKey].allow[currentConfig.name] === undefined) {
          throw new TypeError(
            `Have to include "${currentConfig.name}" entity as "allow" for descendantKey: "${descendantKey}"!`,
          );
        }

        const { array: oppositeArray } =
          key === 'duplexFields'
            ? composeFieldsObject(currentConfig)[oppositeName]
            : { array: false };

        const childQueries = array
          ? ['childEntities', 'childEntitiesThroughConnection', 'childEntityCount']
          : key !== 'duplexFields' || required || oppositeArray
          ? ['childEntity']
          : ['childEntity', 'childEntityGetOrCreate'];
        if (
          !childQueries.some((childQuery: DescendantAttributesActionName) =>
            descendant[descendantKey].allow[currentConfig.name].includes(childQuery),
          ) &&
          key !== 'childFields'
        ) {
          throw new TypeError(
            `Have to set ${childQueries
              .map((str) => `"${str}"`)
              .join(' or ')} as "allow" for descendantKey: "${descendantKey}" & entity: "${
              currentConfig.name
            }"!`,
          );
        }

        const config =
          store[`${currentConfig.name}${descendantKey}`] ||
          composeDescendantConfig(descendant[descendantKey], currentConfig, generalConfig);
        if (!config) {
          throw new TypeError(
            `Can not set descendant config for entityName: "${currentConfig.name}" & descendant descendantKey:"${descendantKey}"!`,
          );
        }

        return { ...item, config };
      });

      // *** check that the relational fields have opposite relational fields

      if (key === 'relationalFields') {
        // eslint-disable-next-line
        entityConfig[key]?.forEach(({ name, config, oppositeName }) => {
          const oppositeField = (config.relationalFields || []).find(
            ({ name: name2 }) => name2 === oppositeName,
          );

          if (!oppositeField) {
            console.log('oppositeName =', oppositeName);
            console.log('config.relationalFields =', config.relationalFields);

            throw new TypeError(
              `Expected a relationalField with name "${oppositeName}" in descendant config "${config.name}"!`,
            );
          }
        });
      }

      // ***

      // *** check that the duplex fields have opposite duplex fields

      if (key === 'duplexFields') {
        // eslint-disable-next-line
        entityConfig[key]?.forEach(({ config, oppositeName }) => {
          const oppositeField = (config.duplexFields || []).find(
            ({ name }) => name === oppositeName,
          );

          if (!oppositeField) {
            throw new TypeError(
              `Expected a duplexField with name "${oppositeName}" in descendant config "${config.name}"!`,
            );
          }
        });
      }

      // ***
    }
  });

  if (freezedFields[rootEntityName]) {
    Object.keys(entityConfig).forEach((key) => {
      if (key.endsWith('Fields')) {
        entityConfig[key] = entityConfig[key].map((field) =>
          freezedFields[rootEntityName].includes(field.name)
            ? { ...field, freeze: true }
            : { ...field, freeze: false },
        );
      }
    });
  }

  if (unfreezedFields[rootEntityName]) {
    Object.keys(entityConfig).forEach((key) => {
      if (key.endsWith('Fields')) {
        entityConfig[key] = entityConfig[key].map((field) =>
          unfreezedFields[rootEntityName].includes(field.name)
            ? { ...field, freeze: false }
            : { ...field, freeze: true },
        );
      }
    });
  }

  return store[descendantEntityName];
};

export default composeDescendantConfig;
