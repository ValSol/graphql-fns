// @flow

import React from 'react';
import { Field, FieldArray } from 'formik';
import Button from '@material-ui/core/Button';
// const IconButton = require('@material-ui/core/IconButton');
// const IconButton = require('@material-ui/core/IconButton');
// const DeleteIcon = require('@material-ui/icons/Delete');
import { TextField as FormikTextField } from 'formik-material-ui';
import { get as objectGet } from 'lodash/object';
import pluralize from 'pluralize';

import type { ThingConfig, FlatFormikFields } from '../flowTypes';

import composeFlatFormikFields from './composeFlatFormikFields';
import formikFieldArrayChild from './formikFieldArrayChild';
import composeInitialValues from './composeInitialValues';

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
                  <Button
                    color="primary"
                    disabled={isSubmitting}
                    onClick={() => {
                      if (config) push(composeInitialValues(config));
                    }}
                    variant="contained"
                  >
                    {`Add ${name3}`}
                  </Button>
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

  return <div>{composeFields(flatFormikFields)}</div>;
};

export default composeFormikFragment;
