import type { InputCreator } from '../../tsTypes';

import createEntityCreateInputType from './createEntityCreateInputType';
import isOppositeRequired from './isOppositeRequired';

const createEntityCloneInputType: InputCreator = (entityConfig) => {
  const { name, type: configType } = entityConfig;

  const inputName = `${name}CloneInput`;

  if (configType !== 'tangible') {
    return [inputName, '', {}];
  }

  const {
    booleanFields = [],
    dateTimeFields = [],
    embeddedFields = [],
    enumFields = [],
    fileFields = [],
    floatFields = [],
    intFields = [],
    geospatialFields = [],
    textFields = [],
    duplexFields = [],
    relationalFields = [],
  } = entityConfig;

  const childChain: Record<string, any> = {};

  const entityTypeArray: Array<string> = [`input ${name}CloneInput {`];

  entityTypeArray.push('  id: ID');

  duplexFields.reduce(
    (
      prev,
      {
        array,
        name: name2,
        oppositeName,
        required,
        config,
        config: { name: relationalEntityName },
      },
    ) => {
      const oppositeRequired = isOppositeRequired(oppositeName, config);
      if (oppositeRequired) {
        prev.push(
          `  ${name2}: ${relationalEntityName}${
            array
              ? `CreateOrPushThru_${oppositeName}_FieldChildrenInput`
              : `CreateThru_${oppositeName}_FieldChildInput`
          }${required ? '!' : ''}`,
        );
      } else {
        prev.push(
          `  ${name2}: ${relationalEntityName}${
            array ? 'CreateOrPushChildrenInput' : 'CreateChildInput'
          }${required ? '!' : ''}`,
        );
      }

      childChain[`${config.name}CreateInput`] = [createEntityCreateInputType, config];

      return prev;
    },
    entityTypeArray,
  );

  relationalFields.reduce((prev, { array, name: name2, parent, required, config }) => {
    if (parent) {
      return prev;
    }

    const { name: relationalEntityName } = config;

    prev.push(
      `  ${name2}: ${relationalEntityName}${
        array ? 'CreateOrPushChildrenInput' : 'CreateChildInput'
      }${required ? '!' : ''}`,
    );

    childChain[`${config.name}CreateInput`] = [createEntityCreateInputType, config];

    return prev;
  }, entityTypeArray);

  textFields.reduce((prev, { array, name: name2 }) => {
    prev.push(`  ${name2}: ${array ? '[' : ''}String${array ? '!]' : ''}`);
    return prev;
  }, entityTypeArray);

  intFields.reduce((prev, { array, name: name2 }) => {
    prev.push(`  ${name2}: ${array ? '[' : ''}Int${array ? '!]' : ''}`);
    return prev;
  }, entityTypeArray);

  floatFields.reduce((prev, { array, name: name2 }) => {
    prev.push(`  ${name2}: ${array ? '[' : ''}Float${array ? '!]' : ''}`);
    return prev;
  }, entityTypeArray);

  dateTimeFields.reduce((prev, { array, name: name2 }) => {
    prev.push(`  ${name2}: ${array ? '[' : ''}DateTime${array ? '!]' : ''}`);
    return prev;
  }, entityTypeArray);

  booleanFields.reduce((prev, { array, name: name2 }) => {
    prev.push(`  ${name2}: ${array ? '[' : ''}Boolean${array ? '!]' : ''}`);
    return prev;
  }, entityTypeArray);

  enumFields.reduce((prev, { array, enumName, name: name2 }) => {
    prev.push(`  ${name2}: ${array ? '[' : ''}${enumName}Enumeration${array ? '!]' : ''}`);
    return prev;
  }, entityTypeArray);

  embeddedFields.reduce((prev, { array, name: name2, config, config: { name: embeddedName } }) => {
    prev.push(`  ${name2}: ${array ? '[' : ''}${embeddedName}CreateInput${array ? '!]' : ''}`);

    childChain[`${config.name}CreateInput`] = [createEntityCreateInputType, config];

    return prev;
  }, entityTypeArray);

  // the same code as for embeddedFields

  fileFields.reduce((prev, { array, name: name2, config, config: { name: embeddedName } }) => {
    prev.push(`  ${name2}: ${array ? '[' : ''}${embeddedName}CreateInput${array ? '!]' : ''}`);

    childChain[`${config.name}CreateInput`] = [createEntityCreateInputType, config];

    return prev;
  }, entityTypeArray);

  geospatialFields.reduce((prev, { array, name: name2, geospatialType }) => {
    prev.push(
      `  ${name2}: ${array ? '[' : ''}Geospatial${geospatialType}Input${array ? '!]' : ''}`,
    );
    return prev;
  }, entityTypeArray);

  entityTypeArray.push('}');

  const inputDefinition = entityTypeArray.join('\n');

  return [inputName, inputDefinition, childChain];
};

export default createEntityCloneInputType;
