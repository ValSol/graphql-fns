// @flow

import ExcelJS from 'exceljs';

import type { GeneralConfig, ServersideConfig } from '../../../flowTypes';

// import only to get all standard action NAMES
import actionAttributes from '../../../types/actionAttributes';

import composeSpecificActionName from '../../composeSpecificActionName';
import composeWorksheetName from '../composeWorksheetName';
import constants from '../constants';
import fitWidth from '../fitWidth';
import createValidActionsMatrix from './createValidActionsMatrix';
import createValidDerivativeOrCustomActionsMatrix from './createValidDerivativeOrCustomActionsMatrix';
import extractDataFromCustom from './extractDataFromCustom';
import extractDataFromDerivative from './extractDataFromDerivative';
import squeezeMatrix from './squeezeMatrix';

const { ordinaryActionTypes } = constants;
const ordinaryActionNames = Object.keys(actionAttributes);

const actionTypeToArgb = {
  Query: 'FFFFFF00',
  Mutation: 'FF66FFFF',
  Subscription: 'FFFF00FF',
  DerivativeQuery: 'FFFFB266',
  DerivativeMutation: 'FF9999FF',
  CustomQuery: 'FFFFFFCC',
  CustomMutation: 'FFCCFFFF',
};

const generateExcel = async (
  generalConfig: GeneralConfig,
  serversideConfig: ServersideConfig,
  filePath: string = 'permissions.xlsx',
) => {
  const { custom, derivative, inventory, thingConfigs } = generalConfig;

  const inventoryByPermissions = serversideConfig.inventoryByPermissions || {
    'General Action List': undefined,
  };

  const thingNames = Object.keys(thingConfigs).filter(
    (key) => !thingConfigs[key].file && !thingConfigs[key].embedded,
  );

  const wb = new ExcelJS.Workbook();

  wb.creator = 'graphql-fns';
  wb.lastModifiedBy = 'graphql-fns';
  wb.created = new Date();
  wb.modified = new Date();

  const permissionNames = Object.keys(inventoryByPermissions);

  let dataFromDerivative = {
    derivativeActionNames: [],
    derivativeActionTypes: {},
    thingNamesByDerivativeActions: {},
  };
  if (derivative) {
    dataFromDerivative = extractDataFromDerivative({
      actionTypes: ordinaryActionTypes,
      // $FlowFixMe
      derivative,
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
    ...dataFromDerivative.derivativeActionNames,
    ...dataFromCustom.customActionNames,
  ];

  // $FlowFixMe
  const actionTypes = {
    ...ordinaryActionTypes,
    // $FlowFixMe
    ...dataFromDerivative.derivativeActionTypes,
    ...dataFromCustom.customActionTypes,
  };

  permissionNames.forEach((permissionName) => {
    const worksheetName = composeWorksheetName(permissionName, wb);

    const ws = wb.addWorksheet(worksheetName, {
      views: [{ state: 'frozen', xSplit: 1, ySplit: 1 }],
    });

    const validActionsMatrix = createValidActionsMatrix({
      actionNames: ordinaryActionNames,
      actionTypes: ordinaryActionTypes,
      inventory,
      inventory2: inventoryByPermissions[permissionName],
      thingNames,
    });

    let validDerivativeActionsMatrix = thingNames.map(() => []);
    if (derivative) {
      const {
        derivativeActionNames,
        derivativeActionTypes,
        thingNamesByDerivativeActions,
      } = dataFromDerivative;

      validDerivativeActionsMatrix = createValidDerivativeOrCustomActionsMatrix({
        actionNames: derivativeActionNames,
        actionTypes: derivativeActionTypes,
        inventory,
        inventory2: inventoryByPermissions[permissionName],
        thingNames,
        thingNamesByActions: thingNamesByDerivativeActions,
      });
    }

    let validCustomActionsMatrix = thingNames.map(() => []);
    if (custom) {
      const { customActionNames, customActionTypes, thingNamesByCustomActions } = dataFromCustom;

      validCustomActionsMatrix = createValidDerivativeOrCustomActionsMatrix({
        actionNames: customActionNames,
        actionTypes: customActionTypes,
        inventory,
        inventory2: inventoryByPermissions[permissionName],
        thingNames,
        thingNamesByActions: thingNamesByCustomActions,
      });
    }

    const combinedMatrix = validActionsMatrix.map((row, i) => [
      ...row,
      ...validDerivativeActionsMatrix[i].map((item) => item && [item[0], item[1] + row.length]),
      ...validCustomActionsMatrix[i].map(
        (item) => item && [item[0], item[1] + row.length + validDerivativeActionsMatrix[i].length],
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
            thingName: thingNames[row[j]],
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
