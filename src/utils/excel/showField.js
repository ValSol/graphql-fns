// @flow

type Args = {
  argb: string,
  columnGroupShift: number,
  fieldType: string,
  usedNames: { [name: string]: number },
  ws: Object,
  i: number,
  lastRow: { current: number },
};

type Args2 = {
  name: string,
  required?: boolean,
  array?: boolean,
  index?: boolean,
  unique?: boolean,
  weight?: number,
};

const showField = (args: Args): Function => (args2: Args2) => {
  const { argb, columnGroupShift, fieldType, lastRow, usedNames, ws, i } = args;
  const { name, required, array } = args2;
  if (!usedNames[name]) {
    lastRow.current += 1; // eslint-disable-line no-param-reassign
    usedNames[name] = lastRow.current; // eslint-disable-line no-param-reassign
  }
  const row = ws.getRow(usedNames[name]);
  const col = columnGroupShift + i * 5 + 1;
  row.getCell(col).value = name;
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
  if (args2.index) {
    row.getCell(col + 2).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF660000' },
    };
  }
  if (args2.unique) {
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
  if (args2.weight) {
    row.getCell(col + 4).value = args2.weight;
    row.getCell(col + 4).alignment = { horizontal: 'center' };
  }
};

export default showField;
