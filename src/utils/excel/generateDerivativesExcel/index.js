// @flow

import ExcelJS from 'exceljs';

import type { GeneralConfig } from '../../../flowTypes';

import composeWorksheetName from '../composeWorksheetName';
import fitWidth from '../fitWidth';
import showColumnGroupOfFields from '../showColumnGroupOfFields';
import showDerivativeActions from './showDerivativeActions';

const generateDerivativesExcel = async (
  generalConfig: GeneralConfig,
  filePath: string = 'derivatives.xlsx',
) => {
  const wb = new ExcelJS.Workbook();

  wb.creator = 'graphql-fns';
  wb.lastModifiedBy = 'graphql-fns';
  wb.created = new Date();
  wb.modified = new Date();

  const { derivative } = generalConfig;

  if (!derivative) {
    throw new TypeError(`There is no derivative in generalConfig!`);
  }

  Object.keys(derivative).forEach((suffix) => {
    const worksheetName = composeWorksheetName(suffix, wb);

    const ws = wb.addWorksheet(worksheetName, {
      views: [{ state: 'frozen', ySplit: 1 }],
    });

    const columns = [];

    Object.keys(derivative[suffix].allow).forEach((firstThingName, i) => {
      const combinedThingNames = [
        [firstThingName, ''],
        [`${firstThingName}${suffix}`, suffix],
      ];

      const columnGroupShift = i * 12;

      showColumnGroupOfFields({
        columnGroupShift,
        columns,
        combinedThingNames,
        derivative,
        firstThingName,
        generalConfig,
        ws,
      });

      showDerivativeActions({ columnGroupShift, columns, derivative, firstThingName, suffix, ws });
    });

    ws.columns = columns;

    fitWidth(ws, [5, null, null, null, null, 5, null, null, null, null, 5, 5]);
  });

  await wb.xlsx.writeFile(filePath);
};

export default generateDerivativesExcel;
