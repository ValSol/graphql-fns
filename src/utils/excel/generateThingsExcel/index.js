// @flow

import ExcelJS from 'exceljs';

import type { GeneralConfig } from '../../../flowTypes';

import composeWorksheetName from '../composeWorksheetName';
import fitWidth from '../fitWidth';
import showColumnGroupOfFields from '../showColumnGroupOfFields';

const generateThingsExcel = async (
  generalConfig: GeneralConfig,
  thingNames: Array<Array<string>>,
  filePath: string = 'things.xlsx',
) => {
  const wb = new ExcelJS.Workbook();

  wb.creator = 'graphql-fns';
  wb.lastModifiedBy = 'graphql-fns';
  wb.created = new Date();
  wb.modified = new Date();

  const { thingConfigs, derivative } = generalConfig;

  thingNames.forEach((thingNamesCohort) =>
    // test correctness of thingNames
    thingNamesCohort.forEach((thingName) => {
      const thing = thingConfigs[thingName];
      if (!thing) {
        throw new TypeError(`Found unused "${thingName}" thing name!`);
      }
    }),
  );

  thingNames.forEach((thingNamesCohort) => {
    const [firstThingName] = thingNamesCohort;

    const worksheetName = composeWorksheetName(firstThingName, wb);

    const ws = wb.addWorksheet(worksheetName, {
      views: [{ state: 'frozen', xSplit: 5, ySplit: 1 }],
    });

    const thingNamesWithSuffixes = derivative
      ? Object.keys(derivative)
          .filter((key) => derivative[key].allow[firstThingName])
          .map((key) => [`${firstThingName}${key}`, key])
      : [];

    const wrappedThingNames = thingNamesCohort.map((thingName) => [thingName, '']);

    const combinedThingNames = [...wrappedThingNames, ...thingNamesWithSuffixes];

    const columns = [];
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

    fitWidth(ws, [10, null, null, null, null]);
  });

  await wb.xlsx.writeFile(filePath);

  const allThingNames = Object.keys(thingConfigs);

  const flatThingNames = thingNames.flatMap((name) => name);

  const restOfThingNames = { file: [], embedded: [], ordinary: [] };

  allThingNames.forEach((name) => {
    if (!flatThingNames.includes(name)) {
      if (thingConfigs[name].file) {
        restOfThingNames.file.push(name);
      } else if (thingConfigs[name].embedded) {
        restOfThingNames.embedded.push(name);
      } else {
        restOfThingNames.ordinary.push(name);
      }
    }
  });

  if (restOfThingNames.ordinary.length) {
    // eslint-disable-next-line no-console
    console.warn(
      `Warning: there are unused ordinary things: ${restOfThingNames.ordinary
        .map((item) => `"${item}"`)
        .join(', ')}!`,
    );
  }

  if (restOfThingNames.embedded.length) {
    // eslint-disable-next-line no-console
    console.warn(
      `Warning: there are unused embedded things: ${restOfThingNames.embedded
        .map((item) => `"${item}"`)
        .join(', ')}!`,
    );
  }

  if (restOfThingNames.file.length) {
    // eslint-disable-next-line no-console
    console.warn(
      `Warning: there are unused file things: ${restOfThingNames.file
        .map((item) => `"${item}"`)
        .join(', ')}!`,
    );
  }
};

export default generateThingsExcel;
