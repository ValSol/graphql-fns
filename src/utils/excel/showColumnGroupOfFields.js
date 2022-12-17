// @flow

import type { GeneralConfig } from '../../flowTypes';

import composeDerivativeFields from './composeDerivativeFields';
import showField from './showField';
import constants from './constants';

const { fieldAttrCount } = constants;

type Args = {
  columnGroupShift: number,
  columns: Array<{ width: number }>,
  combinedThingNames: Array<[string, string]>,
  firstThingName: string,
  generalConfig: GeneralConfig,
  ws: Object,
};

const showColumnGroupOfFields = (args: Args) => {
  const { columnGroupShift, columns, combinedThingNames, firstThingName, generalConfig, ws } = args;

  const { allEntityConfigs, derivative } = generalConfig;

  const lastRow = { current: 1 };

  {
    const usedNames = {};
    combinedThingNames.forEach(([entityName, derivativeKey], i) => {
      ws.mergeCells(
        1,
        columnGroupShift + i * (fieldAttrCount + 1) + 1,
        1,
        columnGroupShift + i * (fieldAttrCount + 1) + (fieldAttrCount + 1),
      );
      ws.getCell(1, columnGroupShift + i * (fieldAttrCount + 1) + 1).alignment = {
        horizontal: 'center',
      };
      ws.getCell(1, columnGroupShift + i * (fieldAttrCount + 1) + 1).value = entityName;
      ws.getCell(1, columnGroupShift + i * (fieldAttrCount + 1) + 1).style = {
        font: { bold: true },
        alignment: { horizontal: 'center' },
      };

      columns.push({ width: 24 });
      for (let j = 0; j < fieldAttrCount - 1; j += 1) {
        columns.push({ width: 2.4 });
      }
      columns.push({ width: 5 });

      if (derivativeKey) {
        ws.getCell(1, columnGroupShift + i * (fieldAttrCount + 1) + 1).fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFE0E0E0' },
        };
      }

      const entityConfig = derivativeKey
        ? allEntityConfigs[firstThingName]
        : allEntityConfigs[entityName];
      const fields = entityConfig.booleanFields || [];

      const booleanFields = composeDerivativeFields({
        derivativeKey,
        derivative,
        fields,
        firstThingName,
        fieldType: 'booleanFields',
      });

      const showFieldSettings = {
        argb: 'FFCCFFFF',
        columnGroupShift,
        fieldType: 'Boolean',
        usedNames,
        lastRow,
        ws,
        i,
      };
      (booleanFields || []).forEach(showField(showFieldSettings));
    });
  }

  {
    const usedNames = {};
    combinedThingNames.forEach(([entityName, derivativeKey], i) => {
      const entityConfig = derivativeKey
        ? allEntityConfigs[firstThingName]
        : allEntityConfigs[entityName];
      const fields = entityConfig.dateTimeFields || [];

      const dateTimeFields = composeDerivativeFields({
        derivativeKey,
        derivative,
        fields,
        firstThingName,
        fieldType: 'dateTimeFields',
      });

      const showFieldSettings = {
        argb: 'FFFFB266',
        columnGroupShift,
        fieldType: 'DateTime',
        usedNames,
        lastRow,
        ws,
        i,
      };
      (dateTimeFields || []).forEach(showField(showFieldSettings));
    });
  }

  {
    const usedNames = {};
    combinedThingNames.forEach(([entityName, derivativeKey], i) => {
      const entityConfig = derivativeKey
        ? allEntityConfigs[firstThingName]
        : allEntityConfigs[entityName];
      const fields = entityConfig.textFields || [];

      const textFields = composeDerivativeFields({
        derivativeKey,
        derivative,
        fields,
        firstThingName,
        fieldType: 'textFields',
      });

      const showFieldSettings = {
        argb: 'FFFFFFCC',
        columnGroupShift,
        fieldType: 'Text',
        usedNames,
        lastRow,
        ws,
        i,
      };
      (textFields || []).forEach(showField(showFieldSettings));
    });
  }

  {
    const usedNames = {};
    combinedThingNames.forEach(([entityName, derivativeKey], i) => {
      const entityConfig = derivativeKey
        ? allEntityConfigs[firstThingName]
        : allEntityConfigs[entityName];
      const fields = entityConfig.intFields || [];

      const intFields = composeDerivativeFields({
        derivativeKey,
        derivative,
        fields,
        firstThingName,
        fieldType: 'intFields',
      });

      const showFieldSettings = {
        argb: 'FFADFF2F',
        columnGroupShift,
        fieldType: 'Int',
        usedNames,
        lastRow,
        ws,
        i,
      };
      (intFields || []).forEach(showField(showFieldSettings));
    });
  }

  {
    const usedNames = {};
    combinedThingNames.forEach(([entityName, derivativeKey], i) => {
      const entityConfig = derivativeKey
        ? allEntityConfigs[firstThingName]
        : allEntityConfigs[entityName];
      const fields = entityConfig.floatFields || [];

      const floatFields = composeDerivativeFields({
        derivativeKey,
        derivative,
        fields,
        firstThingName,
        fieldType: 'floatFields',
      });

      const showFieldSettings = {
        argb: 'FF66FFFF',
        columnGroupShift,
        fieldType: 'Float',
        usedNames,
        lastRow,
        ws,
        i,
      };
      (floatFields || []).forEach(showField(showFieldSettings));
    });
  }

  {
    const usedNames = {};
    combinedThingNames.forEach(([entityName, derivativeKey], i) => {
      const entityConfig = derivativeKey
        ? allEntityConfigs[firstThingName]
        : allEntityConfigs[entityName];
      const fields = entityConfig.enumFields || [];

      const enumFields = composeDerivativeFields({
        derivativeKey,
        derivative,
        fields,
        firstThingName,
        fieldType: 'enumFields',
      });

      const showFieldSettings = {
        argb: 'FFFFFF00',
        columnGroupShift,
        fieldType: 'Enum',
        usedNames,
        lastRow,
        ws,
        i,
      };
      (enumFields || []).forEach(showField(showFieldSettings));
    });
  }

  {
    const usedNames = {};
    combinedThingNames.forEach(([entityName, derivativeKey], i) => {
      const entityConfig = derivativeKey
        ? allEntityConfigs[firstThingName]
        : allEntityConfigs[entityName];
      const fields = entityConfig.geospatialFields || [];

      const geospatialFields = composeDerivativeFields({
        derivativeKey,
        derivative,
        fields,
        firstThingName,
        fieldType: 'geospatialFields',
      });

      const showFieldSettings = {
        argb: 'FF00CC00',
        columnGroupShift,
        fieldType: 'Geospatial',
        usedNames,
        lastRow,
        ws,
        i,
      };
      (geospatialFields || []).forEach(showField(showFieldSettings));
    });
  }

  {
    const usedNames = {};
    combinedThingNames.forEach(([entityName, derivativeKey], i) => {
      const entityConfig = derivativeKey
        ? allEntityConfigs[firstThingName]
        : allEntityConfigs[entityName];
      const fields = entityConfig.fileFields || [];

      const fileFields = composeDerivativeFields({
        derivativeKey,
        derivative,
        // $FlowFixMe
        fields,
        firstThingName,
        fieldType: 'fileFields',
      });

      const showFieldSettings = {
        argb: 'FF9999FF',
        columnGroupShift,
        fieldType: 'File',
        usedNames,
        lastRow,
        ws,
        i,
      };
      (fileFields || []).forEach(showField(showFieldSettings));
    });
  }

  {
    const usedNames = {};
    combinedThingNames.forEach(([entityName, derivativeKey], i) => {
      const entityConfig = derivativeKey
        ? allEntityConfigs[firstThingName]
        : allEntityConfigs[entityName];
      const fields = entityConfig.embeddedFields || [];

      const embeddedFields = composeDerivativeFields({
        derivativeKey,
        derivative,
        // $FlowFixMe
        fields,
        firstThingName,
        fieldType: 'embeddedFields',
      });

      const showFieldSettings = {
        argb: 'FFFF99CC',
        columnGroupShift,
        fieldType: 'Embedded',
        usedNames,
        lastRow,
        ws,
        i,
      };
      (embeddedFields || []).forEach(showField(showFieldSettings));
    });
  }

  {
    const usedNames = {};
    combinedThingNames.forEach(([entityName, derivativeKey], i) => {
      const entityConfig = derivativeKey
        ? allEntityConfigs[firstThingName]
        : allEntityConfigs[entityName];
      const fields = entityConfig.relationalFields || [];

      const relationalFields = composeDerivativeFields({
        derivativeKey,
        derivative,
        // $FlowFixMe
        fields,
        firstThingName,
        fieldType: 'relationalFields',
      });

      const showFieldSettings = {
        argb: 'FF33FF33',
        columnGroupShift,
        fieldType: 'Relational',
        usedNames,
        lastRow,
        ws,
        i,
      };
      (relationalFields || []).forEach(showField(showFieldSettings));
    });
  }

  {
    const usedNames = {};
    combinedThingNames.forEach(([entityName, derivativeKey], i) => {
      const entityConfig = derivativeKey
        ? allEntityConfigs[firstThingName]
        : allEntityConfigs[entityName];
      const fields = entityConfig.duplexFields || [];

      const duplexFields = composeDerivativeFields({
        derivativeKey,
        derivative,
        // $FlowFixMe
        fields,
        firstThingName,
        fieldType: 'duplexFields',
      });

      const showFieldSettings = {
        argb: 'FFFF00FF',
        columnGroupShift,
        fieldType: 'Duplex',
        usedNames,
        lastRow,
        ws,
        i,
      };
      (duplexFields || []).forEach(showField(showFieldSettings));
    });
  }
};

export default showColumnGroupOfFields;
