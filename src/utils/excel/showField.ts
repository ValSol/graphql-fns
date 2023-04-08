import type { EntityConfig } from '../../tsTypes';

import constants from './constants';

const { fieldAttrCount } = constants;

type Args = {
  argb: string;
  columnGroupShift: number;
  fieldType: string;
  usedNames: {
    [name: string]: number;
  };
  ws: any;
  i: number;
  lastRow: {
    current: number;
  };
};

type Args2 = {
  name: string;
  required?: boolean;
  array?: boolean;
  index?: boolean;
  unique?: boolean;
  weight?: number;
  freeze?: boolean;
  config: EntityConfig;
  oppositeName?: string;
  enumName?: string;
};

const composeName = ({ name, config, enumName, oppositeName }: Args2) => {
  if (enumName) return `${name} - ${enumName}`;

  if (config) {
    if (oppositeName) return `${name} - ${config.name} - ${oppositeName}`;

    return `${name} - ${config.name}`;
  }
  return name;
};

const showField =
  (args: Args): any =>
  (args2: Args2) => {
    const { argb, columnGroupShift, fieldType, lastRow, usedNames, ws, i } = args;
    const { name, required, array, index, unique, freeze } = args2;
    if (!usedNames[name]) {
      lastRow.current += 1; // eslint-disable-line no-param-reassign
      usedNames[name] = lastRow.current; // eslint-disable-line no-param-reassign
    }
    const row = ws.getRow(usedNames[name]);
    const col = columnGroupShift + i * (fieldAttrCount + 1) + 1;
    row.getCell(col).value = composeName(args2);
    row.getCell(col).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb },
    };
    row.getCell(col).note = {
      texts: [{ font: { size: 8 }, text: fieldType }],
      margins: {
        insetmode: 'custom',
        inset: [0, 0, 0, 0],
      },
    };
    if (required) {
      row.getCell(col + 1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF006666' },
      };
    }
    if (index) {
      row.getCell(col + 2).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF660000' },
      };
    }
    if (unique) {
      row.getCell(col + 2).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFFF0000' },
      };
    }
    if (array) {
      row.getCell(col + 3).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF0000FF' },
      };
    }
    if (freeze) {
      row.getCell(col + 4).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'F666666F' },
      };
    }
    if (args2.weight) {
      row.getCell(col + fieldAttrCount).value = args2.weight;
      row.getCell(col + fieldAttrCount).alignment = { horizontal: 'center' };
    }
  };

export default showField;
