import type {DerivativeAttributes} from '../../../tsTypes';

import composeSpecificActionName from '../../composeSpecificActionName';
import constants from '../constants';

const { fieldAttrCount, ordinaryActionTypes } = constants;

type Args = {
  columnGroupShift: number,
  columns: Array<{
    width: number
  }>,
  derivative: {
    readonly [derivativeKey: string]: DerivativeAttributes
  },
  firstThingName: string,
  derivativeKey: string,
  ws: any
};

const showDerivativeActions = (args: Args) => {
  const { columnGroupShift, columns, derivative, firstThingName, derivativeKey, ws } = args;
  const col = columnGroupShift + ((fieldAttrCount + 1) * 2 + 1);
  const col2 = col + 1;
  ws.mergeCells(1, col, 1, col2);
  ws.getCell(1, col).alignment = { horizontal: 'center' };
  ws.getCell(1, col).value = 'Actions';
  ws.getCell(1, col).style = {
    font: { bold: true, color: { argb: 'FFFFFFFF' } },
    alignment: { horizontal: 'center' },
  };
  ws.getCell(1, col).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF000000' },
  };

  columns.push({ width: 24 }, { width: 24 });

  const queryNames = [];
  const mutationNames = [];
  derivative[derivativeKey].allow[firstThingName].forEach((actionName) => {
    if (ordinaryActionTypes[actionName] === 'Query') {
      queryNames.push(actionName);
    } else {
      mutationNames.push(actionName);
    }
  });

  const actions = [...queryNames, ...mutationNames];

  actions.forEach((actionName, i) => {
    const actionNameWithDerivativeKey = `${actionName}${derivativeKey}`;
    ws.getCell(2 + i, col).value = actionNameWithDerivativeKey;
    ws.getCell(2 + i, col2).value = composeSpecificActionName({
      actionName: actionNameWithDerivativeKey,
      entityName: firstThingName,
    });
    const argb = ordinaryActionTypes[actionName] === 'Query' ? 'FFFFB266' : 'FF9999FF';
    ws.getCell(2 + i, col).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb },
    };
    ws.getCell(2 + i, col2).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb },
    };
  });
};

export default showDerivativeActions;
