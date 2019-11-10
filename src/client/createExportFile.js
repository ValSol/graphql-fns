// @flow

import pluralize from 'pluralize';
import csvStringify from 'csv-stringify';

import type { ThingConfig } from '../flowTypes';

import coerceDataFromGql from '../utils/coerceDataFromGql';

const csvStringify2 = data => {
  return new Promise((resolve, reject) => {
    csvStringify(data, { header: true }, (err, output) => {
      if (err) reject(err);
      resolve(output);
    });
  });
};

const createExportFile = async (
  items: Array<Object>,
  thingConfig: ThingConfig,
  //  if returnBlob="true" return blob with items data, if returnBlob="false" create "downloaded" file and return null
  options?: { format: 'csv' | 'json', returnBlob?: boolean },
): Promise<Blob | null> => {
  const { name } = thingConfig;

  let type;
  let content = items.map(item => coerceDataFromGql(item, thingConfig, true));
  let fileExtension;
  if (options && options.format === 'csv') {
    type = 'text/csv';
    content = await csvStringify2(content);
    fileExtension = 'csv';
  } else {
    type = 'application/json';
    content = JSON.stringify(content, null, ' ');
    fileExtension = 'json';
  }

  const blob = new Blob([content], {
    type,
  });

  if (options && options.returnBlob) return blob;

  const objectURL = URL.createObjectURL(blob);

  const now = new Date();
  const fileName = `${pluralize(name)} ${now.toISOString()}`;

  const link = document.createElement('a');
  link.style.display = 'none';
  if (document.body === null) {
    // to prevent flowjs warning
    throw new TypeError('documnet body is null!');
  }
  document.body.appendChild(link);
  link.href = objectURL;
  link.href = URL.createObjectURL(blob);
  link.download = `${fileName}.${fileExtension}`;
  link.click();
  link.remove();
  URL.revokeObjectURL(objectURL);
  return null;
};

export default createExportFile;
