// @flow

import ExcelJS from 'exceljs';

import type { GeneralConfig } from '../../flowTypes';

const composeWorksheetName = (name, wb) => {
  const name2 = name.length > 32 ? `${name.slice(0, 28)}...` : name;
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

const filterFields = ({ suffix, derivative, fields, firstThingName, fieldType }) => {
  if (!suffix) return fields;

  const fieldNames = fields.map(({ name }) => name);

  const filteredFields = fields.filter(({ name }) => {
    // eslint-disable-next-line no-nested-ternary
    const excludeFields = derivative
      ? derivative[suffix].excludeFields
        ? derivative[suffix].excludeFields[firstThingName] || []
        : []
      : [];

    // eslint-disable-next-line no-nested-ternary
    const includeFields = derivative
      ? derivative[suffix].includeFields
        ? derivative[suffix].includeFields[firstThingName] || fieldNames
        : fieldNames
      : [];

    return !excludeFields.includes(name) && includeFields.includes(name);
  });

  // eslint-disable-next-line no-nested-ternary
  const addFields = derivative
    ? // eslint-disable-next-line no-nested-ternary
      derivative[suffix].addFields
      ? derivative[suffix].addFields[firstThingName]
        ? derivative[suffix].addFields[firstThingName][fieldType] || []
        : []
      : []
    : [];

  return [...filteredFields, ...addFields];
};

const showField = (args) => (args2) => {
  const { argb, fieldType, usedNames, ws, i } = args;
  const { name, required, array } = args2;
  if (!usedNames[name]) {
    args.lastRow += 1; // eslint-disable-line no-param-reassign
    usedNames[name] = args.lastRow; // eslint-disable-line no-param-reassign
  }
  const row = ws.getRow(usedNames[name]);
  const col = i * 5 + 1;
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

    const ws = wb.addWorksheet(
      worksheetName,
      // firstThingName.length > 32 ? `${firstThingName.slice(0, 28)}...` : firstThingName,
      { views: [{ state: 'frozen', xSplit: 5, ySplit: 1 }] },
    );

    const thingNamesWithSuffixes = derivative
      ? Object.keys(derivative)
          .filter((key) => derivative[key].allow[firstThingName])
          .map((key) => [`${firstThingName}${key}`, key])
      : [];

    const wrappedThingNames = thingNamesCohort.map((thingName) => [thingName, '']);

    const combinedThingNames = [...wrappedThingNames, ...thingNamesWithSuffixes];

    const columns = [];
    let lastRow = 1;
    let usedNames = {};
    combinedThingNames.forEach(([thingName, suffix], i) => {
      ws.mergeCells(1, i * 5 + 1, 1, i * 5 + 5);
      ws.getCell(1, i * 5 + 1).alignment = { horizontal: 'center' };
      ws.getCell(1, i * 5 + 1).value = thingName;
      ws.getCell(1, i * 5 + 1).style = {
        font: { bold: true },
        alignment: { horizontal: 'center' },
      };

      columns.push({ width: 24 }, { width: 2.4 }, { width: 2.4 }, { width: 2.4 }, { width: 5 });

      if (suffix) {
        ws.getCell(1, i * 5 + 1).fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFE0E0E0' },
        };
      }

      const thingConfig = suffix ? thingConfigs[firstThingName] : thingConfigs[thingName];
      const fields = thingConfig.booleanFields || [];

      const booleanFields = filterFields({
        suffix,
        derivative,
        fields,
        firstThingName,
        fieldType: 'booleanFields',
      });

      const showFieldSettings = {
        argb: 'FFCCFFFF',
        fieldType: 'Boolean',
        usedNames,
        lastRow,
        ws,
        i,
      };
      (booleanFields || []).forEach(showField(showFieldSettings));
      lastRow = showFieldSettings.lastRow;
    });

    usedNames = {};
    combinedThingNames.forEach(([thingName, suffix], i) => {
      const thingConfig = suffix ? thingConfigs[firstThingName] : thingConfigs[thingName];
      const fields = thingConfig.dateTimeFields || [];

      const dateTimeFields = filterFields({
        suffix,
        derivative,
        fields,
        firstThingName,
        fieldType: 'dateTimeFields',
      });

      const showFieldSettings = {
        argb: 'FFFFB266',
        fieldType: 'DateTime',
        usedNames,
        lastRow,
        ws,
        i,
      };
      (dateTimeFields || []).forEach(showField(showFieldSettings));
      lastRow = showFieldSettings.lastRow;
    });

    usedNames = {};
    combinedThingNames.forEach(([thingName, suffix], i) => {
      const thingConfig = suffix ? thingConfigs[firstThingName] : thingConfigs[thingName];
      const fields = thingConfig.textFields || [];

      const textFields = filterFields({
        suffix,
        derivative,
        fields,
        firstThingName,
        fieldType: 'textFields',
      });

      const showFieldSettings = {
        argb: 'FFFFFFCC',
        fieldType: 'Text',
        usedNames,
        lastRow,
        ws,
        i,
      };
      (textFields || []).forEach(showField(showFieldSettings));
      lastRow = showFieldSettings.lastRow;
    });

    usedNames = {};
    combinedThingNames.forEach(([thingName, suffix], i) => {
      const thingConfig = suffix ? thingConfigs[firstThingName] : thingConfigs[thingName];
      const fields = thingConfig.intFields || [];

      const intFields = filterFields({
        suffix,
        derivative,
        fields,
        firstThingName,
        fieldType: 'intFields',
      });

      const showFieldSettings = {
        argb: 'FFADFF2F',
        fieldType: 'Int',
        usedNames,
        lastRow,
        ws,
        i,
      };
      (intFields || []).forEach(showField(showFieldSettings));
      lastRow = showFieldSettings.lastRow;
    });

    usedNames = {};
    combinedThingNames.forEach(([thingName, suffix], i) => {
      const thingConfig = suffix ? thingConfigs[firstThingName] : thingConfigs[thingName];
      const fields = thingConfig.floatFields || [];

      const floatFields = filterFields({
        suffix,
        derivative,
        fields,
        firstThingName,
        fieldType: 'floatFields',
      });

      const showFieldSettings = {
        argb: 'FF66FFFF',
        fieldType: 'Float',
        usedNames,
        lastRow,
        ws,
        i,
      };
      (floatFields || []).forEach(showField(showFieldSettings));
      lastRow = showFieldSettings.lastRow;
    });

    usedNames = {};
    combinedThingNames.forEach(([thingName, suffix], i) => {
      const thingConfig = suffix ? thingConfigs[firstThingName] : thingConfigs[thingName];
      const fields = thingConfig.enumFields || [];

      const enumFields = filterFields({
        suffix,
        derivative,
        fields,
        firstThingName,
        fieldType: 'enumFields',
      });

      const showFieldSettings = {
        argb: 'FFFFFF00',
        fieldType: 'Enum',
        usedNames,
        lastRow,
        ws,
        i,
      };
      (enumFields || []).forEach(showField(showFieldSettings));
      lastRow = showFieldSettings.lastRow;
    });

    usedNames = {};
    combinedThingNames.forEach(([thingName, suffix], i) => {
      const thingConfig = suffix ? thingConfigs[firstThingName] : thingConfigs[thingName];
      const fields = thingConfig.geospatialFields || [];

      const geospatialFields = filterFields({
        suffix,
        derivative,
        fields,
        firstThingName,
        fieldType: 'geospatialFields',
      });

      const showFieldSettings = {
        argb: 'FF00CC00',
        fieldType: 'Geospatial',
        usedNames,
        lastRow,
        ws,
        i,
      };
      (geospatialFields || []).forEach(showField(showFieldSettings));
      lastRow = showFieldSettings.lastRow;
    });

    usedNames = {};
    combinedThingNames.forEach(([thingName, suffix], i) => {
      const thingConfig = suffix ? thingConfigs[firstThingName] : thingConfigs[thingName];
      const fields = thingConfig.fileFields || [];

      const fileFields = filterFields({
        suffix,
        derivative,
        fields,
        firstThingName,
        fieldType: 'fileFields',
      });

      const showFieldSettings = {
        argb: 'FF9999FF',
        fieldType: 'File',
        usedNames,
        lastRow,
        ws,
        i,
      };
      (fileFields || []).forEach(showField(showFieldSettings));
      lastRow = showFieldSettings.lastRow;
    });

    usedNames = {};
    combinedThingNames.forEach(([thingName, suffix], i) => {
      const thingConfig = suffix ? thingConfigs[firstThingName] : thingConfigs[thingName];
      const fields = thingConfig.embeddedFields || [];

      const embeddedFields = filterFields({
        suffix,
        derivative,
        fields,
        firstThingName,
        fieldType: 'embeddedFields',
      });

      const showFieldSettings = {
        argb: 'FFFF99CC',
        fieldType: 'Embedded',
        usedNames,
        lastRow,
        ws,
        i,
      };
      (embeddedFields || []).forEach(showField(showFieldSettings));
      lastRow = showFieldSettings.lastRow;
    });

    usedNames = {};
    combinedThingNames.forEach(([thingName, suffix], i) => {
      const thingConfig = suffix ? thingConfigs[firstThingName] : thingConfigs[thingName];
      const fields = thingConfig.relationalFields || [];

      const relationalFields = filterFields({
        suffix,
        derivative,
        fields,
        firstThingName,
        fieldType: 'relationalFields',
      });

      const showFieldSettings = {
        argb: 'FF33FF33',
        fieldType: 'Relational',
        usedNames,
        lastRow,
        ws,
        i,
      };
      (relationalFields || []).forEach(showField(showFieldSettings));
      lastRow = showFieldSettings.lastRow;
    });

    usedNames = {};
    combinedThingNames.forEach(([thingName, suffix], i) => {
      const thingConfig = suffix ? thingConfigs[firstThingName] : thingConfigs[thingName];
      const fields = thingConfig.duplexFields || [];

      const duplexFields = filterFields({
        suffix,
        derivative,
        fields,
        firstThingName,
        fieldType: 'duplexFields',
      });

      const showFieldSettings = {
        argb: 'FFFF00FF',
        fieldType: 'Duplex',
        usedNames,
        lastRow,
        ws,
        i,
      };
      (duplexFields || []).forEach(showField(showFieldSettings));
      lastRow = showFieldSettings.lastRow;
    });

    ws.columns = columns;
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
