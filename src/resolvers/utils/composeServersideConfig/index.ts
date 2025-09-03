import type {
  EntityFilters,
  GeneralConfig,
  ServersideConfig,
  SimplifiedEntityFilters,
} from '@/tsTypes';

import checkFilterCorrectness from './checkFilterCorrectness';
import getAllEntityNames from './getAllEntityNames';

const checkFilter = (
  arg: any,
  entityName: string,
  filters: SimplifiedEntityFilters,
  generalConfig: GeneralConfig,
) => {
  let filterArr;

  try {
    filterArr = filters[entityName](arg);
  } catch (err) {
    console.error(
      `Incorrect expression "${filters[entityName]?.toString()}" with args: "${JSON.stringify(
        arg,
      )}" in "filters" for entity: "${entityName}"!`,
    );
    throw new TypeError(err);
  }

  if (!filterArr) return;

  filterArr.forEach((filter) => {
    checkFilterCorrectness(entityName, filter, generalConfig);
  });
};

const composeServersideConfig = (
  generalConfig: GeneralConfig,
  serversideConfig: ServersideConfig & {
    filters?: SimplifiedEntityFilters;
    subscribePayloadFilters?: SimplifiedEntityFilters;
  },
  filterDummyArgs?: Array<{
    [key: string]: any;
  }>,
): ServersideConfig => {
  const {
    containedRoles,
    getUserAttributes,
    inventoryByRoles,
    staticFilters,
    staticLimits,
    personalFilters,
    skipPersonalFilter,
  } = serversideConfig;
  const {
    filters: simplifiedEntityFilters,
    subscribePayloadFilters: simplifiedSubscribePayloadFilters,
    ...result
  } = serversideConfig;

  if (inventoryByRoles && !containedRoles) {
    throw new TypeError(`Not found "containedRoles" to use with "inventoryByRoles"!`);
  }

  if (inventoryByRoles && !getUserAttributes) {
    throw new TypeError(`Not found "getUserAttributes" to use with "inventoryByRoles"!`);
  }

  if (simplifiedEntityFilters && !getUserAttributes) {
    throw new TypeError(`Not found "getUserAttributes" to use with "filters"!`);
  }

  if (simplifiedSubscribePayloadFilters && !getUserAttributes) {
    throw new TypeError(`Not found "getUserAttributes" to use with "subscribePayloadFilters"!`);
  }

  if (personalFilters && !getUserAttributes) {
    throw new TypeError(`Not found "getUserAttributes" to use with "personalFilters"!`);
  }

  if (skipPersonalFilter && !personalFilters) {
    throw new TypeError(`Not found "personalFilters" to use with "skipPersonalFilter"!`);
  }

  const allEntityNames = getAllEntityNames(generalConfig, serversideConfig);

  if (staticLimits) {
    Object.keys(staticLimits).forEach((entityName) => {
      if (!allEntityNames[entityName]) {
        throw new TypeError(`Found redundant entity "${entityName}" in "staticLimits"!`);
      }
    });
  }

  if (staticFilters) {
    Object.keys(staticFilters).forEach((entityName) => {
      if (!allEntityNames[entityName]) {
        throw new TypeError(`Found redundant entity "${entityName}" in "staticFilters"!`);
      }
    });

    Object.keys(staticFilters).forEach((entityName) =>
      checkFilterCorrectness(entityName, staticFilters[entityName], generalConfig),
    );
  }

  if (personalFilters) {
    Object.keys(personalFilters).forEach((entityName) => {
      if (!allEntityNames[entityName]) {
        throw new TypeError(`Found redundant entity "${entityName}" in "personalFilters"!`);
      }

      const [userEntityName, filterEntityPointerName, filterFieldName] =
        personalFilters[entityName];

      const userEntity = generalConfig.allEntityConfigs[userEntityName];

      if (!userEntity) {
        throw new TypeError(
          `Not found user entity "${userEntityName}" for "personalFilters" key: "${entityName}"!`,
        );
      }

      if (userEntity.type !== 'tangible') {
        throw new TypeError(
          `User entity "${userEntityName}" type: "${userEntity.type}" for "personalFilters" key: "${entityName}", but have to be "tangible"!`,
        );
      }

      if (filterEntityPointerName === 'id') {
        const { filterFields = [] } = userEntity;

        const filterField = filterFields.find(({ name }) => name === filterFieldName);

        if (!filterField) {
          throw new TypeError(
            `Not found filter "${filterFieldName}" in filter entity: "${userEntity.name}" for "personalFilters" key: "${entityName}"!`,
          );
        }

        if (!filterField.array) {
          throw new TypeError(
            `"${filterFieldName}" filter field for "personalFilters" key: "${entityName}" is not array, but has to be!`,
          );
        }
      } else {
        const { relationalFields = [], duplexFields = [] } = userEntity;

        const filterEntityPointer = [...relationalFields, ...duplexFields].find(
          ({ name }) => name === filterEntityPointerName,
        );

        if (!filterEntityPointer) {
          throw new TypeError(
            `Not found filter entity pointer "${filterEntityPointerName}" in user entity: "${userEntityName}" for "personalFilters" key: "${entityName}"!`,
          );
        }

        if (filterEntityPointer.array) {
          throw new TypeError(
            `"${filterEntityPointerName}" filter entity pointer to user entity: "${userEntityName}" for "personalFilters" key: "${entityName}" is array!`,
          );
        }

        const {
          config: { filterFields = [] },
        } = filterEntityPointer;

        const filterField = filterFields.find(({ name }) => name === filterFieldName);

        if (!filterField) {
          throw new TypeError(
            `Not found filter "${filterFieldName}" in filter entity: "${filterEntityPointer.config.name}" for "personalFilters" key: "${entityName}"!`,
          );
        }

        if (!filterField.array) {
          throw new TypeError(
            `"${filterFieldName}" filter field for "personalFilters" key: "${entityName}" is not array, but has to be!`,
          );
        }
      }
    });
  }

  const allRoles = Object.keys(containedRoles || {});
  const rolesFromInventoryByRoles = Object.keys(inventoryByRoles || {});

  allRoles.forEach((role) => {
    if (inventoryByRoles && !inventoryByRoles[role]) {
      throw new TypeError(`Role "${role}" from "containedRoles" not found in "inventoryByRoles"!`);
    }
  });

  rolesFromInventoryByRoles.forEach((role) => {
    if (containedRoles && !containedRoles[role]) {
      throw new TypeError(`Role "${role}" from "inventoryByRoles" not found in "containedRoles"!`);
    }
  });

  if (simplifiedEntityFilters) {
    Object.keys(allEntityNames).forEach((entityName) => {
      if (!simplifiedEntityFilters[entityName]) {
        throw new TypeError(
          `Entity name "${entityName}" not found in "filters" but used in: ${allEntityNames[
            entityName
          ].descriptions.join('; ')}!`,
        );
      }
    });

    Object.keys(simplifiedEntityFilters).forEach((entityName) => {
      if (!allEntityNames[entityName]) {
        throw new TypeError(`Found redundant entity "${entityName}" in "filters"`);
      }
    });

    if (filterDummyArgs?.length) {
      Object.keys(simplifiedEntityFilters).forEach((entityName) => {
        filterDummyArgs.forEach((arg) => {
          checkFilter(arg, entityName, simplifiedEntityFilters, generalConfig);
        });
      });
    } else if (allRoles.length > 0) {
      const handler = {
        get(
          target: {
            role: string;
          },
          key: string,
        ) {
          if (key === 'role') return target.role;

          if (key === 'id') return '000000000000000000000000';

          return `${key}ForTest`;
        },
      } as const;

      Object.keys(simplifiedEntityFilters).forEach((entityName) => {
        allRoles.forEach((role) => {
          const arg = new Proxy({ role }, handler);

          checkFilter(arg, entityName, simplifiedEntityFilters, generalConfig);
        });
      });
    }

    const filters = Object.keys(simplifiedEntityFilters).reduce<Record<string, any>>(
      (prev, entityName) => {
        const { isOutput } = allEntityNames[entityName];

        prev[entityName] = [isOutput, simplifiedEntityFilters[entityName]];

        return prev;
      },
      {},
    ) as EntityFilters;

    (result as ServersideConfig).filters = filters;
  }

  if (simplifiedSubscribePayloadFilters) {
    Object.keys(allEntityNames).forEach((entityName) => {
      if (!simplifiedSubscribePayloadFilters[entityName]) {
        throw new TypeError(
          `Entity name "${entityName}" not found in "subscribePayloadFilters" but used in: ${allEntityNames[
            entityName
          ].descriptions.join('; ')}!`,
        );
      }
    });

    Object.keys(simplifiedSubscribePayloadFilters).forEach((entityName) => {
      if (!allEntityNames[entityName]) {
        throw new TypeError(`Found redundant entity "${entityName}" in "subscribePayloadFilters"`);
      }
    });

    // if (filterDummyArgs?.length) {
    //   Object.keys(simplifiedSubscribePayloadFilters).forEach((entityName) => {
    //     filterDummyArgs.forEach((arg) => {
    //       checkFilter(arg, (entityName), simplifiedSubscribePayloadFilters, generalConfig);
    //     });
    //   });
    // } else if (allRoles.length > 0) {
    //   const handler = {
    //     get(
    //       target: {
    //         role: string;
    //       },
    //       key: string,
    //     ) {
    //       if (key === 'role') return target.role;

    //       if (key === 'id') return '000000000000000000000000';

    //       return `${key}ForTest`;
    //     },
    //   } as const;

    //   Object.keys(simplifiedSubscribePayloadFilters).forEach((entityName) => {
    //     allRoles.forEach((role) => {
    //       const arg = new Proxy({ role }, handler);

    //       checkFilter(arg, entityName, simplifiedSubscribePayloadFilters, generalConfig);
    //     });
    //   });
    // }

    const subscribePayloadFilters = Object.keys(simplifiedSubscribePayloadFilters).reduce<
      Record<string, any>
    >((prev, entityName) => {
      const { isOutput } = allEntityNames[entityName];

      prev[entityName] = [isOutput, simplifiedSubscribePayloadFilters[entityName]];

      return prev;
    }, {}) as EntityFilters;

    (result as ServersideConfig).subscribePayloadFilters = subscribePayloadFilters;
  }

  return result;
};

export default composeServersideConfig;
