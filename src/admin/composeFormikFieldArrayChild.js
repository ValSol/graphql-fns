// @flow

import React from 'react';
import { Field } from 'formik';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import AddIcon from '@material-ui/icons/Add';
import DeleteIcon from '@material-ui/icons/Delete';
import InputAdornment from '@material-ui/core/InputAdornment';
import { TextField as FormikTextField } from 'formik-material-ui';
import { get as objectGet } from 'lodash/object';
import pluralize from 'pluralize';

type Props = {
  form: { isSubmitting: boolean, values: Object },
  name: string,
  push: Function,
  remove: Function,
};

const composeFormikFieldArrayChild = (prefix2?: string) => {
  const formikFieldArrayChild = (props: Props) => {
    const {
      form: { isSubmitting, values },
      name,
      push,
      remove,
    } = props;

    const itemName = pluralize.singular(name.split('.').slice(-1)[0]);
    const fullItemName = prefix2 ? `${prefix2} ‣ ${itemName}` : itemName;

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
                  label={`${fullItemName} #${i + 1}`}
                  margin="normal"
                  name={`${name}[${i}]`}
                  variant="outlined"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          edge="end"
                          aria-label={`Delete ${itemName}`}
                          onClick={() => remove(i)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </div>
            ))}
        </div>
        <div>
          <Button disabled={isSubmitting} onClick={() => push('')}>
            <AddIcon />
            {itemName}
          </Button>
        </div>
      </div>
    );
  };
  return formikFieldArrayChild;
};

export default composeFormikFieldArrayChild;
