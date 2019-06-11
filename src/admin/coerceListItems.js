// @flow
import type { ThingConfig, ListColumn } from '../flowTypes';

import composeFieldsObject from '../utils/composeFieldsObject';

const coerceListItems = (items: Object, thingConfig: ThingConfig): Array<ListColumn> => {
  const fieldsObject = composeFieldsObject(thingConfig);

  return items.map(item =>
    Object.keys(item).reduce((prev, key) => {
      if (key === '__typename') return prev;

      if (['id', 'createdAt', 'updatedAt'].includes(key)) {
        prev[key] = item[key]; // eslint-disable-line no-param-reassign
        return prev;
      }

      const { kind, array, geospatialType } = fieldsObject[key];
      if (array && !item[key].length) {
        prev[key] = ''; // eslint-disable-line no-param-reassign
        return prev;
      }

      if (item[key] === undefined || item[key] === null) {
        prev[key] = ''; // eslint-disable-line no-param-reassign
        return prev;
      }
      switch (kind) {
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
          if (array) {
            prev[key] = item[key].join(', '); // eslint-disable-line no-param-reassign
          } else {
            prev[key] = item[key]; // eslint-disable-line no-param-reassign
          }
          break;

        case 'geospatialFields':
          if (geospatialType === 'Point') {
            if (array) {
              // eslint-disable-next-line no-param-reassign
              prev[key] = item[key]
                .map(({ longitude, latitude }) => `(${longitude}, ${latitude})`)
                .join(', ');
            } else {
              const { longitude, latitude } = item[key];
              prev[key] = `(${longitude}, ${latitude})`; // eslint-disable-line no-param-reassign
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
            prev[key] = item[key].join(', '); // eslint-disable-line no-param-reassign
          } else {
            prev[key] = item[key]; // eslint-disable-line no-param-reassign
          }
          break;

        case 'relationalFields':
          if (array) {
            prev[key] = item[key].join(', '); // eslint-disable-line no-param-reassign
          } else {
            prev[key] = item[key]; // eslint-disable-line no-param-reassign
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
