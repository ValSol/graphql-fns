import ExcelJS from 'exceljs';

import type { GeneralConfig } from '../../../tsTypes';

import composeWorksheetName from '../composeWorksheetName';
import constants from '../constants';
import fitWidth from '../fitWidth';
import showColumnGroupOfFields from '../showColumnGroupOfFields';
import showDescendantActions from './showDescendantActions';

const { fieldAttrCount } = constants;

const generateDescendantsExcel = async (
  generalConfig: GeneralConfig,
  filePath: string = 'descendants.xlsx',
) => {
  const wb = new ExcelJS.Workbook();

  wb.creator = 'graphql-fns';
  wb.lastModifiedBy = 'graphql-fns';
  wb.created = new Date();
  wb.modified = new Date();

  const { descendant } = generalConfig;

  if (!descendant) {
    throw new TypeError(`There is no descendant in generalConfig!`);
  }

  Object.keys(descendant).forEach((descendantKey) => {
    const worksheetName = composeWorksheetName(descendantKey, wb);

    const ws = wb.addWorksheet(worksheetName, {
      views: [{ state: 'frozen', ySplit: 1 }],
    });

    const columns: Array<{
      width: number;
    }> = [];

    Object.keys(descendant[descendantKey].allow).forEach((firstThingName, i) => {
      const combinedThingNames = [
        [firstThingName, ''],
        [`${firstThingName}${descendantKey}`, descendantKey],
      ] as [string, string][];

      const columnGroupShift = i * (2 * (fieldAttrCount + 1) + 2);

      showColumnGroupOfFields({
        columnGroupShift,
        columns,
        combinedThingNames,
        descendant,
        firstThingName,
        generalConfig,
        ws,
      });

      showDescendantActions({
        columnGroupShift,
        columns,
        descendant,
        firstThingName,
        descendantKey,
        ws,
      });
    });

    ws.columns = columns;

    // to compose array: [5, null, null, null, null, null, 5, null, null, null, null, null, 5, 5]
    const fieldAttrWidths = new Array(fieldAttrCount).fill(null);
    const widths = [5, ...fieldAttrWidths, 5, ...fieldAttrWidths, 5, 5];

    fitWidth(ws, widths);
  });

  await wb.xlsx.writeFile(filePath);
};

export default generateDescendantsExcel;
