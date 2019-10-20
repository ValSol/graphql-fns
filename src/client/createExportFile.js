// @flow

import pluralize from 'pluralize';
import csvStringify from 'csv-stringify';

import type { ThingConfig } from '../flowTypes';

const csvStringify2 = data => {
  return new Promise((resolve, reject) => {
    csvStringify(data, { header: true }, (err, output) => {
      if (err) reject(err);
      resolve(output);
    });
  });
};

function clearObj(obj) {
  return Object.keys(obj).reduce((prev, key) => {
    const value = obj[key];
    if (Array.isArray(value)) {
      prev[key] = clearArr(value); // eslint-disable-line no-param-reassign, no-use-before-define
    } else if (typeof value === 'object' && value !== null) {
      prev[key] = clearObj(value); // eslint-disable-line no-param-reassign
    } else if (key !== '__typename') {
      prev[key] = value; // eslint-disable-line no-param-reassign
    }
    return prev;
  }, {});
}

function clearArr(arr) {
  return arr.map(item => {
    if (Array.isArray(item)) {
      return clearArr(item);
    }
    if (typeof item === 'object' && item !== null) {
      return clearObj(item);
    }
    return item;
  });
}

const createExportFile = async (
  items: Array<Object>,
  thingConfig: ThingConfig,
  options?: { format: 'csv' | 'json' },
): Promise<void> => {
  const { name } = thingConfig;

  let type;
  let content = clearArr(items);
  let fileExtension = 'json';
  if (options && options.format === 'csv') {
    type = 'text/csv';
    content = await csvStringify2(clearArr(items));
    fileExtension = 'csv';
  } else {
    type = 'application/json';
    content = JSON.stringify(clearArr(items), null, ' ');
    fileExtension = 'json';
  }

  const blob = new Blob([content], {
    type,
  });

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
};

export default createExportFile;
