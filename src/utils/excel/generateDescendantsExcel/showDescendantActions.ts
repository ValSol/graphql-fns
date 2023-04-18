import type { DescendantAttributes } from '../../../tsTypes';

import composeSpecificActionName from '../../composeSpecificActionName';
import constants from '../constants';

const { fieldAttrCount, ordinaryActionTypes } = constants;

type Args = {
  columnGroupShift: number;
  columns: Array<{
    width: number;
  }>;
  descendant: {
    readonly [descendantKey: string]: DescendantAttributes;
  };
  firstThingName: string;
  descendantKey: string;
  ws: any;
};

const showDescendantActions = (args: Args) => {
  const { columnGroupShift, columns, descendant, firstThingName, descendantKey, ws } = args;
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
  descendant[descendantKey].allow[firstThingName].forEach((actionName) => {
    if (ordinaryActionTypes[actionName] === 'Query') {
      queryNames.push(actionName);
    } else {
      mutationNames.push(actionName);
    }
  });

  const actions = [...queryNames, ...mutationNames];

  actions.forEach((actionName, i) => {
    const actionNameWithDescendantKey = `${actionName}${descendantKey}`;
    ws.getCell(2 + i, col).value = actionNameWithDescendantKey;
    ws.getCell(2 + i, col2).value = composeSpecificActionName({
      actionName: actionNameWithDescendantKey,
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

export default showDescendantActions;
