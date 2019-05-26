// @flow

import React from 'react';
import { Field } from 'formik';
import { TextField as FormikTextField } from 'formik-material-ui';
import { get as objectGet } from 'lodash/object';
import pluralize from 'pluralize';

type Props = {
  form: { isSubmitting: boolean, values: Object },
  name: string,
  push: Function,
  remove: Function,
};

const formikFieldArrayChild = (props: Props) => {
  const {
    form: { isSubmitting, values },
    name,
    push,
    remove,
  } = props;

  const itemName = pluralize.singular(name.split('.').slice(-1)[0]);

  return (
    <div>
      <div>
        {objectGet(values, name) &&
          objectGet(values, name).map((item, i) => (
            // eslint-disable-next-line react/no-array-index-key
            <div key={i}>
              <Field
                component={FormikTextField}
                fullWidth
                label={`${itemName} #${i + 1}`}
                margin="normal"
                name={`${name}[${i}]`}
                variant="outlined"
              />
              <button
                disabled={isSubmitting}
                onClick={() => remove(i)}
                title={`Delete the ${itemName}`}
                type="button"
              >
                X
              </button>
            </div>
          ))}
      </div>
      <div>
        <br />
        <button type="button" onClick={() => push('')} disabled={isSubmitting}>
          {`Add ${itemName}`}
        </button>
      </div>
    </div>
  );
};

export default formikFieldArrayChild;
