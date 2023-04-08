const fitWidth = (ws: any, minimalWidths: Array<number | null>) => {
  let shift = 0;
  ws.columns.forEach((column) => {
    const minimalWidth = minimalWidths[shift];
    if (minimalWidth !== null) {
      let maxColumnLength = 0;
      column.eachCell({ includeEmpty: true }, (cell) => {
        maxColumnLength = Math.max(
          maxColumnLength,
          minimalWidth,
          cell.value ? cell.value.toString().length : 0,
        );
      });
      column.width = maxColumnLength + 2; // eslint-disable-line no-param-reassign
    }
    shift = shift + 1 === minimalWidths.length ? 0 : shift + 1;
  });
};

export default fitWidth;
