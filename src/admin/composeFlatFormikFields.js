// @flow
import type { ThingConfig, FlatFormikFields } from '../flowTypes';

import arrangeFormFields from './arrangeFormFields';
import composeFieldsObject from './composeFieldsObject';

const composeFlatFormikFields = (thingConfig: ThingConfig): FlatFormikFields => {
  const { form } = thingConfig;

  const formFields = form || arrangeFormFields(thingConfig);
  const fieldsObject = composeFieldsObject(thingConfig);

  const result = formFields.reduce((prev, { name }) => {
    const { kind, ...attributes } = fieldsObject[name];

    if (kind === 'embeddedFields') {
      // $FlowFixMe
      const { config } = attributes; // eslint-disable-line no-case-declarations
      if (!config) {
        throw new TypeError(`Attribute: "config" have to be declared in embeddedFields!`);
      }
      prev.push({
        attributes,
        child: composeFlatFormikFields(config),
        kind,
      });
    } else {
      prev.push({
        attributes,
        kind,
      });
    }

    return prev;
  }, []);

  // $FlowFixMe
  return result;
};

export default composeFlatFormikFields;
