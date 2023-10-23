import type { GeneralConfig, ServersideConfig, SimplifiedEntityFilters } from '../../../tsTypes';

import checkFilterCorrectness from './checkFilterCorrectness';
import checkMiddlewaresCorrectness from './checkMiddlewaresCorrectness';
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
  },
  filterDummyArgs?: Array<{
    [key: string]: any;
  }>,
): ServersideConfig => {
  const {
    containedRoles,
    filters: simplifiedEntityFilters,
    getUserAttributes,
    inventoryByRoles,
    middlewares,
    staticFilters,
    staticLimits,
  } = serversideConfig;

  if (middlewares) {
    const { unfound, noFunc } = checkMiddlewaresCorrectness(middlewares, generalConfig);

    if (unfound.length > 0) {
      `Found in "middlewares" incorrect action name${unfound.length > 1 ? 's' : ''}: ${unfound
        .map((str) => `"${str}"`)
        .join(', ')}!`;
    }

    if (noFunc.length > 0) {
      `Found in "middlewares" incorrect (not "function") type${
        noFunc.length > 1 ? 's' : ''
      }: ${noFunc.map((str) => `"${str}"`).join(', ')}!`;
    }
  }

  if (inventoryByRoles && !containedRoles) {
    throw new TypeError(`Not found "containedRoles" to use with "inventoryByRoles"!`);
  }

  if (inventoryByRoles && !getUserAttributes) {
    throw new TypeError(`Not found "getUserAttributes" to use with "inventoryByRoles"!`);
  }

  if (simplifiedEntityFilters && !getUserAttributes) {
    throw new TypeError(`Not found "getUserAttributes" to use with "filters"!`);
  }

  const allEntityNames = getAllEntityNames(generalConfig, serversideConfig);

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

  if (staticLimits) {
    Object.keys(staticLimits).forEach((entityName) => {
      if (!allEntityNames[entityName]) {
        throw new TypeError(`Found redundant entity "${entityName}" in "staticLimits"!`);
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

  if (!simplifiedEntityFilters) {
    const { filters, ...rest } = serversideConfig; // explicetly remove filters to elimiante flowjs error
    return rest;
  }

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

      prev[entityName] = [isOutput, simplifiedEntityFilters[entityName]]; // eslint-disable-line no-param-reassign

      return prev;
    },
    {},
  );

  return { ...serversideConfig, filters };
};

export default composeServersideConfig;
