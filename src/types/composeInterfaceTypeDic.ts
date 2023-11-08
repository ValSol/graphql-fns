import pluralize from 'pluralize';

import { GeneralConfig } from '../tsTypes';

// alsow used in "composeInterfaceTypeDic" util
const forbiddenThingNames = ['File', 'DateTime', 'Node', 'node', 'PageInfo'];

const IMPLEMETNS = ' implements ';

const getIntefaces = (str: string) => {
  const [firstLine] = str.split('\n');

  const index = firstLine.indexOf(IMPLEMETNS);

  if (index === -1) {
    return [];
  }

  return firstLine
    .slice(index + IMPLEMETNS.length, -2)
    .split(' & ')
    .filter((item: string) => item !== 'Node');
};

const getFieldTypes = (str: string) =>
  str
    .split('\n')
    .slice(1, -1)
    .reduce((prev, nameAndRest) => {
      const colonIndex = nameAndRest.indexOf(':');
      const parenthesisIndex = nameAndRest.indexOf('(');

      const index =
        parenthesisIndex !== -1 && parenthesisIndex < colonIndex ? parenthesisIndex : colonIndex;

      const name = nameAndRest.slice(2, index);
      const rest = nameAndRest.slice(index);

      prev[name] = rest;
      return prev;
    }, {});

const composeInterfaceTypeDic = (
  entityTypeDic: { [entityName: string]: string },
  generalConfig: GeneralConfig,
) => {
  const { interfaces = {} } = generalConfig;

  // *** check interface names correctness

  Object.keys(interfaces).forEach((interfaceName) => {
    if (pluralize(interfaceName) === interfaceName) {
      throw new TypeError(`Forbidden interface name: "${interfaceName}" in plural form!`);
    }

    if (entityTypeDic[interfaceName] !== undefined) {
      throw new TypeError(`Interface name: "${interfaceName}" already used as entity name!`);
    }

    if (forbiddenThingNames.includes(interfaceName)) {
      throw new TypeError(`Forbidden interface name: "${interfaceName}"!`);
    }
  });

  // *** check end

  const interfaceTypeDic = Object.keys(entityTypeDic).reduce((prev, entityName) => {
    const entityInterfaces = getIntefaces(entityTypeDic[entityName]);

    if (entityInterfaces.length > 0) {
      const entityFields = getFieldTypes(entityTypeDic[entityName]);

      entityInterfaces.forEach((entityInterface: string) => {
        if (interfaces[entityInterface] === undefined) {
          throw new TypeError(
            `Not found "${entityInterface}" interface of "${entityName}" entity in "generalConfig"!`,
          );
        }

        const alreadySaved =
          prev[entityInterface] === undefined ? null : getFieldTypes(prev[entityInterface]);

        const fieldTypes = interfaces[entityInterface].reduce((prev2, interfaceField) => {
          if (entityFields[interfaceField] === undefined) {
            throw new TypeError(
              `Got not used field "${interfaceField}" of interface "${entityInterface}" in "${entityName}" entity!`,
            );
          }

          const fieldRest = entityFields[interfaceField];

          if (alreadySaved !== null && alreadySaved[interfaceField] !== fieldRest) {
            throw new TypeError(
              `Got not matching field "${interfaceField}${fieldRest}" of interface "${entityInterface}" in "${entityName}" entity!`,
            );
          }

          prev2.push(`  ${interfaceField}${fieldRest}`);

          return prev2;
        }, [] as string[]);

        if (alreadySaved === null) {
          prev[entityInterface] = [`interface ${entityInterface} {`, ...fieldTypes, '}'].join('\n');
        }
      });
    }

    return prev;
  }, {} as { [entityName: string]: string });

  return interfaceTypeDic;
};

export default composeInterfaceTypeDic;
