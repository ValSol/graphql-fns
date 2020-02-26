// @flow
import type { FlatFormikFields, ThingConfig } from '../../flowTypes';

import arrangeFormFields from '../utils/arrangeFormFields';
import composeFieldsObject from '../../utils/composeFieldsObject';

const composeFlatFormikFields = (thingConfig: ThingConfig): FlatFormikFields => {
  const { form } = thingConfig;

  const formFields = form || arrangeFormFields(thingConfig);
  const fieldsObject = composeFieldsObject(thingConfig);

  const result = formFields.reduce((prev, { name }) => {
    if (fieldsObject[name].kind === 'embeddedFields') {
      const {
        attributes,
        attributes: { config },
      } = fieldsObject[name];
      const flatFormikField = {
        attributes,
        child: composeFlatFormikFields(config),
        kind: 'embeddedFields',
      };
      prev.push(flatFormikField);
    } else if (fieldsObject[name].kind === 'fileFields') {
      const {
        attributes,
        attributes: { config },
      } = fieldsObject[name];
      const flatFormikField = {
        attributes,
        child: composeFlatFormikFields(config),
        kind: 'fileFields',
      };
      prev.push(flatFormikField);
    } else {
      prev.push(fieldsObject[name]);
    }

    return prev;
  }, []);

  return result;
};

export default composeFlatFormikFields;
