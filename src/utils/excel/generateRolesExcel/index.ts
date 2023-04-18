import ExcelJS from 'exceljs';

import type { GeneralConfig, ServersideConfig } from '../../../tsTypes';

// import only to get all standard action NAMES
import actionAttributes from '../../../types/actionAttributes';

import composeSpecificActionName from '../../composeSpecificActionName';
import composeWorksheetName from '../composeWorksheetName';
import constants from '../constants';
import fitWidth from '../fitWidth';
import createValidActionsMatrix from './createValidActionsMatrix';
import createValidDescendantOrCustomActionsMatrix from './createValidDescendantOrCustomActionsMatrix';
import extractDataFromCustom from './extractDataFromCustom';
import extractDataFromDescendant from './extractDataFromDescendant';
import squeezeMatrix from './squeezeMatrix';

const { ordinaryActionTypes } = constants;
const ordinaryActionNames = Object.keys(actionAttributes);

const actionTypeToArgb = {
  Query: 'FFFFFF00',
  Mutation: 'FF66FFFF',
  Subscription: 'FFFF00FF',
  DescendantQuery: 'FFFFB266',
  DescendantMutation: 'FF9999FF',
  CustomQuery: 'FFFFFFCC',
  CustomMutation: 'FFCCFFFF',
} as const;

const generateExcel = async (
  generalConfig: GeneralConfig,
  serversideConfig: ServersideConfig,
  filePath: string = 'roles.xlsx',
) => {
  const { custom, descendant, inventory, allEntityConfigs } = generalConfig;

  const inventoryByRoles = serversideConfig.inventoryByRoles || {
    'General Action List': undefined,
  };

  const thingNames = Object.keys(allEntityConfigs).filter(
    (key) => allEntityConfigs[key].type === 'tangible',
  );

  const wb = new ExcelJS.Workbook();

  wb.creator = 'graphql-fns';
  wb.lastModifiedBy = 'graphql-fns';
  wb.created = new Date();
  wb.modified = new Date();

  const permissionNames = Object.keys(inventoryByRoles);

  let dataFromDescendant = {
    descendantActionNames: [],
    descendantActionTypes: {},
    thingNamesByDescendantActions: {},
  };
  if (descendant) {
    dataFromDescendant = extractDataFromDescendant({
      actionTypes: ordinaryActionTypes,
      // $FlowFixMe
      descendant,
    });
  }

  let dataFromCustom = {
    customActionNames: [],
    customActionTypes: {},
    thingNamesByCustomActions: {},
  };
  if (custom) {
    dataFromCustom = extractDataFromCustom({
      thingNames,
      custom,
    });
  }

  const actionNames = [
    ...ordinaryActionNames,
    ...dataFromDescendant.descendantActionNames,
    ...dataFromCustom.customActionNames,
  ];

  const actionTypes = {
    ...ordinaryActionTypes,
    ...dataFromDescendant.descendantActionTypes,
    ...dataFromCustom.customActionTypes,
  } as const;

  permissionNames.forEach((permissionName) => {
    const worksheetName = composeWorksheetName(permissionName, wb);

    const ws = wb.addWorksheet(worksheetName, {
      views: [{ state: 'frozen', xSplit: 1, ySplit: 1 }],
    });

    const validActionsMatrix = createValidActionsMatrix({
      actionNames: ordinaryActionNames,
      actionTypes: ordinaryActionTypes,
      inventory,
      inventory2: inventoryByRoles[permissionName],
      thingNames,
    });

    let validDescendantActionsMatrix = thingNames.map(() => []);
    if (descendant) {
      const { descendantActionNames, descendantActionTypes, thingNamesByDescendantActions } =
        dataFromDescendant;

      validDescendantActionsMatrix = createValidDescendantOrCustomActionsMatrix({
        actionNames: descendantActionNames,
        actionTypes: descendantActionTypes,
        inventory,
        inventory2: inventoryByRoles[permissionName],
        thingNames,
        thingNamesByActions: thingNamesByDescendantActions,
      });
    }

    let validCustomActionsMatrix = thingNames.map(() => []);
    if (custom) {
      const { customActionNames, customActionTypes, thingNamesByCustomActions } = dataFromCustom;

      validCustomActionsMatrix = createValidDescendantOrCustomActionsMatrix({
        actionNames: customActionNames,
        actionTypes: customActionTypes,
        inventory,
        inventory2: inventoryByRoles[permissionName],
        thingNames,
        thingNamesByActions: thingNamesByCustomActions,
      });
    }

    const combinedMatrix = validActionsMatrix.map((row, i) => [
      ...row,
      ...validDescendantActionsMatrix[i].map((item) => item && [item[0], item[1] + row.length]),
      ...validCustomActionsMatrix[i].map(
        (item) => item && [item[0], item[1] + row.length + validDescendantActionsMatrix[i].length],
      ),
    ]);

    const { column, row, matrix } = squeezeMatrix(combinedMatrix);

    if (!matrix.length) return;

    const columns = [
      { width: 24 },
      ...row.map((index) => ({ header: thingNames[index], width: 24 })),
    ];

    ws.columns = columns;

    for (let i = 0; i < column.length; i += 1) {
      const wsRow = ws.getRow(i + 2);
      const actionName = actionNames[column[i]];
      const argb = actionTypeToArgb[actionTypes[actionName]];
      wsRow.getCell(1).value = actionName;
      wsRow.getCell(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb },
      };

      for (let j = 0; j < row.length; j += 1) {
        if (matrix[i][j]) {
          wsRow.getCell(j + 2).value = composeSpecificActionName({
            actionName,
            entityName: thingNames[row[j]],
          });
          wsRow.getCell(j + 2).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb },
          };
        }
      }
    }

    fitWidth(ws, [10]);
  });

  await wb.xlsx.writeFile(filePath);
};

export default generateExcel;
