// @flow

import type { GeneralConfig, ServersideConfig } from '../../../flowTypes';

import checkFilterCorrectness from './checkFilterCorrectness';
import getAllEntityNames from './getAllEntityNames';

const checkFilter = (arg, entityName, filters, generalConfig) => {
  const filterArr = filters[entityName](arg);

  if (!filterArr) return;

  filterArr.forEach((filter) => {
    checkFilterCorrectness(entityName, filter, generalConfig);
  });
};

const checkFilters = (
  generalConfig: GeneralConfig,
  serversideConfig: ServersideConfig,
  args: Array<{ [key: string]: any }>,
): true => {
  const { containedRoles, getUserAttributes, inventoryByRoles, filters, staticFilters } =
    serversideConfig;

  if (inventoryByRoles && !containedRoles) {
    throw new TypeError(`Not found "containedRoles" to use with "inventoryByRoles"!`);
  }

  if (inventoryByRoles && !getUserAttributes) {
    throw new TypeError(`Not found "getUserAttributes" to use with "inventoryByRoles"!`);
  }

  if (filters && !getUserAttributes) {
    throw new TypeError(`Not found "getUserAttributes" to use with "filters"!`);
  }

  if (staticFilters) {
    Object.keys(staticFilters).forEach((entityName) =>
      checkFilterCorrectness(entityName, staticFilters[entityName], generalConfig),
    );
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

  if (!filters) {
    return true;
  }

  const allEntityNames = getAllEntityNames(generalConfig);

  allEntityNames.forEach((entityName) => {
    if (!filters[entityName]) {
      throw new TypeError(`Entity name "${entityName}" not found in "filters"!`);
    }
  });

  if (!allRoles.length && !args?.length) {
    return true;
  }

  const handler = {
    get(target, key) {
      if (key === 'role') return target.role;
      return `${key}ForTest`;
    },
  };

  if (args?.length) {
    Object.keys(filters).forEach((entityName) => {
      args.forEach((arg) => {
        checkFilter(arg, entityName, filters, generalConfig);
      });
    });

    return true;
  }

  Object.keys(filters).forEach((entityName) => {
    allRoles.forEach((role) => {
      const arg = new Proxy({ role }, handler);

      checkFilter(arg, entityName, filters, generalConfig);
    });
  });

  return true;
};

export default checkFilters;
