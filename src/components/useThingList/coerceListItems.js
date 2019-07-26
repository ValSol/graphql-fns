// @flow
import type { ThingConfig, ListColumn } from '../../flowTypes';

import composeFieldsObject from '../../utils/composeFieldsObject';

const coerceDateTime = (value: string | Array<string>, array?: boolean): string => {
  if (array) {
    if (!Array.isArray(value)) {
      throw new TypeError(`Value have to be array!`);
    }
    return value.map(item => `${item.slice(0, 10)} ${item.slice(11, 16)}`).join(', ');
  }
  if (!(typeof value === 'string')) {
    throw new TypeError(`Value have to be string!`);
  }
  return `${value.slice(0, 10)} ${value.slice(11, 16)}`;
};

const coerceListItems = (items: Object, thingConfig: ThingConfig): Array<ListColumn> => {
  const fieldsObject = composeFieldsObject(thingConfig);

  return items.map(item =>
    Object.keys(item).reduce((prev, key) => {
      if (key === '__typename') return prev;

      if (['createdAt', 'updatedAt'].includes(key)) {
        prev[key] = item[key] && coerceDateTime(item[key]); // eslint-disable-line no-param-reassign
        return prev;
      }

      if (key === 'id') {
        prev[key] = item[key]; // eslint-disable-line no-param-reassign
        return prev;
      }

      const { array } = fieldsObject[key].attributes;
      if (array && !item[key].length) {
        prev[key] = ''; // eslint-disable-line no-param-reassign
        return prev;
      }

      if (item[key] === undefined || item[key] === null) {
        prev[key] = ''; // eslint-disable-line no-param-reassign
        return prev;
      }
      switch (fieldsObject[key].kind) {
        case 'textFields':
          if (array) {
            prev[key] = item[key].join(', '); // eslint-disable-line no-param-reassign
          } else {
            prev[key] = item[key]; // eslint-disable-line no-param-reassign
          }
          break;

        case 'booleanFields':
          if (array) {
            // eslint-disable-next-line no-param-reassign
            prev[key] = item[key].map(value => (value ? 'true' : 'false')).join(', ');
          } else {
            prev[key] = item[key] ? 'true' : 'false'; // eslint-disable-line no-param-reassign
          }
          break;

        case 'intFields':
          if (array) {
            // eslint-disable-next-line no-param-reassign
            prev[key] = item[key].join(', ');
          } else {
            prev[key] = item[key]; // eslint-disable-line no-param-reassign
          }
          break;

        case 'floatFields':
          if (array) {
            // eslint-disable-next-line no-param-reassign
            prev[key] = item[key].join(', ');
          } else {
            prev[key] = item[key]; // eslint-disable-line no-param-reassign
          }
          break;

        case 'enumFields':
          if (array) {
            prev[key] = item[key].join(', '); // eslint-disable-line no-param-reassign
          } else {
            prev[key] = item[key]; // eslint-disable-line no-param-reassign
          }
          break;

        case 'dateTimeFields':
          prev[key] = coerceDateTime(item[key], array); // eslint-disable-line no-param-reassign
          break;

        case 'geospatialFields':
          const { geospatialType } = fieldsObject[key].attributes; // eslint-disable-line no-case-declarations
          if (geospatialType === 'Point') {
            if (array) {
              // eslint-disable-next-line no-param-reassign
              prev[key] = item[key]
                .map(({ latitude, longitude }) => `(${latitude}, ${longitude})`)
                .join(', ');
            } else {
              const { latitude, longitude } = item[key];
              prev[key] = `(${latitude}, ${longitude})`; // eslint-disable-line no-param-reassign
            }
          } else if (array) {
            // eslint-disable-next-line no-param-reassign
            prev[key] = item[key].map(() => 'polygon').join(', ');
          } else {
            prev[key] = 'polygon'; // eslint-disable-line no-param-reassign
          }
          break;

        case 'duplexFields':
          if (array) {
            prev[key] = item[key].map(item2 => item2 && item2.id).join(', '); // eslint-disable-line no-param-reassign
          } else {
            prev[key] = item[key] && item[key].id; // eslint-disable-line no-param-reassign
          }
          break;

        case 'relationalFields':
          if (array) {
            prev[key] = item[key].map(item2 => item2 && item2.id).join(', '); // eslint-disable-line no-param-reassign
          } else {
            prev[key] = item[key] && item[key].id; // eslint-disable-line no-param-reassign
          }
          break;

        case 'embeddedFields':
          if (array) {
            // eslint-disable-next-line no-param-reassign
            prev[key] = item[key].map(() => 'embedded').join(', ');
          } else {
            prev[key] = 'embedded'; // eslint-disable-line no-param-reassign
          }
          break;

        default:
          break;
      }
      return prev;
    }, {}),
  );
};

export default coerceListItems;
