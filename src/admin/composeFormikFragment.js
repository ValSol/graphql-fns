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

const composeFields = (flatFormikFields: FlatFormikFields, shift?: number = 0, prefix?: string) =>
  flatFormikFields.map(({ array, config, child, name }, i) => {
    const name2 = `${'• '.repeat(shift)}${name}`;
    const path = prefix ? `${prefix}.${name}` : name;
    if (child) {
      return array ? (
        // eslint-disable-next-line react/no-array-index-key
        <div key={i}>
          <div>{name2}</div>
          <FieldArray name={path}>
            {args => {
              const {
                form: { isSubmitting, values },
                push,
                remove,
              } = args;

              const itemName = pluralize.singular(name);

              return (
                <div>
                  <div>
                    {objectGet(values, path) &&
                      objectGet(values, path).map((item, j) => (
                        // eslint-disable-next-line react/no-array-index-key
                        <div key={j}>
                          {composeFields(child, shift + 1, `${path}[${j}]`)}
                          <button type="button" onClick={() => remove(j)} disabled={isSubmitting}>
                            {`Delete the ${itemName}`}
                          </button>
                        </div>
                      ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (config) push(composeInitialValues(config));
                    }}
                    disabled={isSubmitting}
                  >
                    {`Add a ${itemName}`}
                  </button>
                </div>
              );
            }}
          </FieldArray>
        </div>
      ) : (
        // eslint-disable-next-line react/no-array-index-key
        <div key={i}>
          <div>{name2}</div>
          {composeFields(child, shift + 1, path)}
        </div>
      );
    }

    if (array) {
      return (
        // eslint-disable-next-line react/no-array-index-key
        <div key={i}>
          <div>{name2}</div>
          <FieldArray name={path}>{formikFieldArrayChild}</FieldArray>
        </div>
      );
    }

    return (
      // eslint-disable-next-line react/no-array-index-key
      <div key={i}>
        <Field name={path} label={name2} component={FormikTextField} />
      </div>
    );
  });

const composeFormikFragment = (thingConfig: ThingConfig): Object => {
  const flatFormikFields = composeFlatFormikFields(thingConfig);

  return <React.Fragment>{composeFields(flatFormikFields)}</React.Fragment>;
};

module.exports = composeFormikFragment;
