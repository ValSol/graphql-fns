// @flow
import type { ThingConfig, FlatFormikFields } from '../flowTypes';

const React = require('react');
const { Field, FieldArray } = require('formik');
// const IconButton = require('@material-ui/core/IconButton');
// const DeleteIcon = require('@material-ui/icons/Delete');
const { TextField: FormikTextField } = require('formik-material-ui');
const { get: objectGet } = require('lodash/object');
const pluralize = require('pluralize');

const composeFlatFormikFields = require('./composeFlatFormikFields');
const formikFieldArrayChild = require('./formikFieldArrayChild');
const composeInitialValues = require('./composeInitialValues');

const composeFields = (flatFormikFields: FlatFormikFields, prefix?: string, prefix2?: string) =>
  flatFormikFields.map(({ array, config, child, name }, i) => {
    const name2 = prefix2 ? `${prefix2} ‣ ${name}` : name;
    const path = prefix ? `${prefix}.${name}` : name;
    if (child) {
      return array ? (
        // eslint-disable-next-line react/no-array-index-key
        <div key={i}>
          <FieldArray name={path}>
            {args => {
              const {
                form: { isSubmitting, values },
                push,
                remove,
              } = args;

              const itemName = pluralize.singular(name);
              const name3 = prefix2 ? `${prefix2} ‣ ${itemName}` : itemName;

              return (
                <div>
                  <div>
                    {objectGet(values, path) &&
                      objectGet(values, path).map((item, j) => (
                        // eslint-disable-next-line react/no-array-index-key
                        <div key={j}>
                          {composeFields(child, `${path}[${j}]`, `${name3} #${j + 1}`)}
                          <button type="button" onClick={() => remove(j)} disabled={isSubmitting}>
                            X
                          </button>
                        </div>
                      ))}
                  </div>
                  <br />
                  <button
                    type="button"
                    onClick={() => {
                      if (config) push(composeInitialValues(config));
                    }}
                    disabled={isSubmitting}
                  >
                    {`Add ${name3}`}
                  </button>
                </div>
              );
            }}
          </FieldArray>
        </div>
      ) : (
        // eslint-disable-next-line react/no-array-index-key
        <div key={i}>{composeFields(child, path, name2)}</div>
      );
    }

    if (array) {
      return (
        // eslint-disable-next-line react/no-array-index-key
        <div key={i}>
          <FieldArray name={path}>{formikFieldArrayChild}</FieldArray>
        </div>
      );
    }

    return (
      // eslint-disable-next-line react/no-array-index-key
      <div key={i}>
        <Field
          component={FormikTextField}
          fullWidth
          label={name2}
          margin="normal"
          name={path}
          variant="outlined"
        />
      </div>
    );
  });

const composeFormikFragment = (thingConfig: ThingConfig): Object => {
  const flatFormikFields = composeFlatFormikFields(thingConfig);

  return <React.Fragment>{composeFields(flatFormikFields)}</React.Fragment>;
};

module.exports = composeFormikFragment;
