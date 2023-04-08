import ExcelJS from 'exceljs';
import { StringSchema } from 'yup';

import type { GeneralConfig } from '../../../tsTypes';

import composeWorksheetName from '../composeWorksheetName';
import constants from '../constants';
import fitWidth from '../fitWidth';
import showColumnGroupOfFields from '../showColumnGroupOfFields';

const { fieldAttrCount } = constants;

const generateEntitiesExcel = async (
  generalConfig: GeneralConfig,
  thingNames: string[][],
  filePath: string = 'entities.xlsx',
) => {
  const wb = new ExcelJS.Workbook();

  wb.creator = 'graphql-fns';
  wb.lastModifiedBy = 'graphql-fns';
  wb.created = new Date();
  wb.modified = new Date();

  const { allEntityConfigs, derivative } = generalConfig;

  thingNames.forEach((thingNamesCohort) =>
    // test correctness of thingNames
    thingNamesCohort.forEach((entityName) => {
      const entity = allEntityConfigs[entityName];
      if (!entity) {
        throw new TypeError(`Found unused "${entityName}" entity name!`);
      }
    }),
  );

  thingNames.forEach((thingNamesCohort) => {
    const [firstThingName] = thingNamesCohort;

    const worksheetName = composeWorksheetName(firstThingName, wb);

    const ws = wb.addWorksheet(worksheetName, {
      views: [{ state: 'frozen', xSplit: fieldAttrCount + 1, ySplit: 1 }],
    });

    const thingNamesWithDerivativeKeys = derivative
      ? Object.keys(derivative)
          .filter((key) => derivative[key].allow[firstThingName])
          .map((key) => [`${firstThingName}${key}`, key])
      : [];

    const wrappedThingNames = thingNamesCohort.map((entityName) => [entityName, '']);

    const combinedThingNames = [...wrappedThingNames, ...thingNamesWithDerivativeKeys] as [
      string,
      string,
    ][];

    const columns: Array<{
      width: number;
    }> = [];
    const columnGroupShift = 0;

    showColumnGroupOfFields({
      columnGroupShift,
      columns,
      combinedThingNames,
      derivative,
      firstThingName,
      generalConfig,
      ws,
    });

    ws.columns = columns;

    const widths = new Array(fieldAttrCount).fill(null);
    widths.unshift(10);
    fitWidth(ws, widths);
  });

  await wb.xlsx.writeFile(filePath);

  const allThingNames = Object.keys(allEntityConfigs);

  const flatThingNames = thingNames.flatMap((name) => name);

  const restOfThingNames = { file: [], embedded: [], ordinary: [] };

  allThingNames.forEach((name) => {
    if (!flatThingNames.includes(name)) {
      if (allEntityConfigs[name].type === 'file') {
        restOfThingNames.file.push(name);
      } else if (allEntityConfigs[name].type === 'embedded') {
        restOfThingNames.embedded.push(name);
      } else {
        restOfThingNames.ordinary.push(name);
      }
    }
  });

  if (restOfThingNames.ordinary.length) {
    // eslint-disable-next-line no-console
    console.warn(
      `Warning: there are unused ordinary entities: ${restOfThingNames.ordinary
        .map((item) => `"${item}"`)
        .join(', ')}!`,
    );
  }

  if (restOfThingNames.embedded.length) {
    // eslint-disable-next-line no-console
    console.warn(
      `Warning: there are unused embedded entities: ${restOfThingNames.embedded
        .map((item) => `"${item}"`)
        .join(', ')}!`,
    );
  }

  if (restOfThingNames.file.length) {
    // eslint-disable-next-line no-console
    console.warn(
      `Warning: there are unused file entities: ${restOfThingNames.file
        .map((item) => `"${item}"`)
        .join(', ')}!`,
    );
  }
};

export default generateEntitiesExcel;
