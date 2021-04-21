// @flow

import type { DerivativeAttributes } from '../../../flowTypes';

import composeSpecificActionName from '../../composeSpecificActionName';
import ordinaryActionTypes from '../ordinaryActionTypes';

type Args = {
  columnGroupShift: number,
  columns: Array<{ width: number }>,
  derivative: { +[suffix: string]: DerivativeAttributes },
  firstThingName: string,
  suffix: string,
  ws: Object,
};

const showDerivativeActions = (args: Args) => {
  const { columnGroupShift, columns, derivative, firstThingName, suffix, ws } = args;
  const col = columnGroupShift + 11;
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
  derivative[suffix].allow[firstThingName].forEach((actionName) => {
    if (ordinaryActionTypes[actionName] === 'Query') {
      queryNames.push(actionName);
    } else {
      mutationNames.push(actionName);
    }
  });

  const actions = [...queryNames, ...mutationNames];

  actions.forEach((actionName, i) => {
    const actionNameWithSuffix = `${actionName}${suffix}`;
    ws.getCell(2 + i, col).value = actionNameWithSuffix;
    ws.getCell(2 + i, col2).value = composeSpecificActionName({
      actionName: actionNameWithSuffix,
      thingName: firstThingName,
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
