// @flow
import getStream from 'get-stream';
import csvParse from 'csv-parse/lib/sync';

import type { PrepareBulkData } from '../../../flowTypes';

import coerceDataToGqlServerSide from '../../../../utils/coerceDataToGqlServerSide';
import processCreateInputData from '../../processCreateInputData';
import allocateFieldsForCSV from '../allocateFieldsForCSV';

const csvParse2 = (data, fieldsForCSV) =>
  csvParse(data, {
    columns: true,
    cast(value, context) {
      try {
        if (fieldsForCSV.object.includes(context.column)) {
          return value && JSON.parse(value);
        }
        if (fieldsForCSV.int.includes(context.column)) {
          return value && Number.parseInt(value, 10);
        }
        if (fieldsForCSV.float.includes(context.column)) {
          return value && Number.parseFloat(value);
        }
        if (fieldsForCSV.boolean.includes(context.column)) {
          return !!value && !!Number.parseInt(value, 10);
        }
      } catch (err) {
        throw new TypeError(`${err}\n for value="${value}" column="${context.column}"`);
      }
      return value;
    },
  });

const prepareBulkData: PrepareBulkData = async (
  resolverCreatorArg,
  resolverArg,
  prevPreparedData,
) => {
  const { entityConfig } = resolverCreatorArg;
  const { args } = resolverArg;

  const { file, options } = args;
  // const { filename, mimetype, encoding, createReadStream } = await file;
  const { createReadStream } = await file;
  const content = await getStream(createReadStream());

  let originalData;
  if (options && options.format === 'csv') {
    const fieldsForCSV = allocateFieldsForCSV(entityConfig);
    originalData = await csvParse2(content, fieldsForCSV);
  } else {
    originalData = JSON.parse(content);
  }

  const allFields = true;
  const skipUnusedFields = true;
  const data = originalData.map((item) =>
    coerceDataToGqlServerSide(item, null, entityConfig, allFields, skipUnusedFields),
  );

  let preparedData = prevPreparedData;

  data.forEach((dataItem) => {
    preparedData = processCreateInputData(dataItem, preparedData, entityConfig, 'create');
  });

  return preparedData;
};

export default prepareBulkData;
