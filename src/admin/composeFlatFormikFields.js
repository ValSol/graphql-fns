// @flow
import type { ThingConfig, FlatFormikFields } from '../flowTypes';

import arrangeFormFields from './arrangeFormFields';
import composeFieldsObject from './composeFieldsObject';

const composeFlatFormikFields = (thingConfig: ThingConfig): FlatFormikFields => {
  const { form } = thingConfig;

  const formFields = form || arrangeFormFields(thingConfig);
  const fieldsObject = composeFieldsObject(thingConfig);

  const result = formFields.reduce((prev, { name }) => {
    const { array, config, kind } = fieldsObject[name];

    switch (kind) {
      case 'embeddedFields':
        if (array) {
          prev.push({
            array,
            child: composeFlatFormikFields(config),
            config,
            kind,
            name,
          });
        } else {
          prev.push({
            child: composeFlatFormikFields(config),
            kind,
            name,
          });
        }
        break;

      case 'textFields':
        prev.push(array ? { array, kind, name } : { kind, name });
        break;

      case 'intFields':
        prev.push(array ? { array, kind, name } : { kind, name });
        break;

      case 'floatFields':
        prev.push(array ? { array, kind, name } : { kind, name });
        break;

      case 'booleanFields':
        prev.push(array ? { array, kind, name } : { kind, name });
        break;

      case 'dateTimeFields':
        prev.push(array ? { array, kind, name } : { kind, name });
        break;

      case 'enumFields':
        prev.push(array ? { array, kind, name } : { kind, name });
        break;

      case 'relationalFields':
        prev.push(array ? { array, kind, name } : { kind, name });
        break;

      case 'duplexFields':
        prev.push(array ? { array, kind, name } : { kind, name });
        break;

      default:
        throw new TypeError(`Invalid formFields kind: "${kind}" of thing field!`);
    }

    return prev;
  }, []);

  return result;
};

export default composeFlatFormikFields;
