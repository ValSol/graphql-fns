// @flow

import React from 'react';
import { Field } from 'formik';

import IconButton from '@material-ui/core/IconButton';
import AddIcon from '@material-ui/icons/Add';
import DeleteIcon from '@material-ui/icons/Delete';
import InputAdornment from '@material-ui/core/InputAdornment';
import Tooltip from '@material-ui/core/Tooltip';

import { TextField as FormikTextField } from 'formik-material-ui';

import { get as objectGet } from 'lodash/object';
import pluralize from 'pluralize';

type Props = {
  form: { isSubmitting: boolean, values: Object },
  name: string,
  push: Function,
  remove: Function,
};

const composeFormikFieldArrayChild = (disabled: boolean) => {
  const formikFieldArrayChild = (props: Props) => {
    const {
      form: { isSubmitting, values },
      name,
      push,
      remove,
    } = props;

    const label = name.split('.').slice(-1)[0];
    const itemLabel = pluralize.singular(label);

    return (
      <React.Fragment>
        {objectGet(values, name) &&
          objectGet(values, name).map((item, i) => (
            <Field
              // eslint-disable-next-line react/no-array-index-key
              key={i}
              component={FormikTextField}
              disabled={disabled}
              fullWidth
              label={`${itemLabel} #${i + 1}`}
              margin="normal"
              name={`${name}[${i}]`}
              variant="outlined"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <Tooltip title={`Delete ${itemLabel} #${i + 1}`} placement="left">
                      <IconButton
                        edge="end"
                        aria-label={`Delete ${itemLabel} #${i + 1}`}
                        onClick={() => remove(i)}
                        disabled={disabled || isSubmitting}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </InputAdornment>
                ),
              }}
            />
          ))}
        <Tooltip title={`Add ${itemLabel}`} placement="right">
          <IconButton
            aria-label={`Add ${itemLabel}`}
            onClick={() => push('')}
            disabled={disabled || isSubmitting}
          >
            <AddIcon />
          </IconButton>
        </Tooltip>
      </React.Fragment>
    );
  };
  return formikFieldArrayChild;
};

export default composeFormikFieldArrayChild;