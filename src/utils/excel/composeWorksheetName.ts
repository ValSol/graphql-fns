const composeWorksheetName = (name: string, wb: any): string => {
  // eslint-disable-next-line no-nested-ternary
  const name2 = name.length ? (name.length > 32 ? `${name.slice(0, 28)}...` : name) : '< Empty >';
  const ws = wb.getWorksheet(name2);
  if (!ws) {
    return name2;
  }

  const num = ` (${(parseInt(name2.split(' (')[1], 10) || 1) + 1})`;
  const prefix = name2.split(' (')[0];
  const name3 =
    prefix.length + num.length > 32 ? `${prefix.slice(0, 28 - num.length)}...` : `${prefix}${num}`;
  return composeWorksheetName(name3, wb);
};

export default composeWorksheetName;
