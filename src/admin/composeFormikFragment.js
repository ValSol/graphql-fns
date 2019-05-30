// @flow

import React from 'react';
import { Field, FieldArray } from 'formik';
import AddIcon from '@material-ui/icons/Add';
import DeleteIcon from '@material-ui/icons/Delete';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import { TextField as FormikTextField } from 'formik-material-ui';
import { get as objectGet } from 'lodash/object';
import pluralize from 'pluralize';

import type { ThingConfig, FlatFormikFields } from '../flowTypes';

import Outline from './components/Outline';
import composeFlatFormikFields from './composeFlatFormikFields';
import formikFieldArrayChild from './formikFieldArrayChild';
import composeInitialValues from './composeInitialValues';

const composeFields = (flatFormikFields: FlatFormikFields, prefix?: string) => (
  <React.Fragment>
    {flatFormikFields.map(({ array, config, child, name }, i) => {
      const path = prefix ? `${prefix}.${name}` : name;
      if (child) {
        return array ? (
          // eslint-disable-next-line react/no-array-index-key
          <FieldArray key={i} name={path}>
            {args => {
              const {
                form: { isSubmitting, values },
                push,
                remove,
              } = args;

              const itemName = pluralize.singular(name);

              return (
                <React.Fragment>
                  {objectGet(values, path) &&
                    objectGet(values, path).map((item, j) => (
                      <Outline
                        // eslint-disable-next-line react/no-array-index-key
                        key={j}
                        label={`${itemName} #${j + 1}`}
                      >
                        {composeFields(child, `${path}[${j}]`)}
                        <Tooltip title={`Delete ${itemName} #${j + 1}`} placement="right">
                          <IconButton
                            edge="end"
                            aria-label={`Delete ${itemName}`}
                            onClick={() => remove(j)}
                            disabled={isSubmitting}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </Outline>
                    ))}
                  <Tooltip title={`Add ${itemName}`} placement="right">
                    <IconButton
                      edge="end"
                      aria-label={`Add ${itemName}`}
                      onClick={() => {
                        if (config) push(composeInitialValues(config));
                      }}
                      disabled={isSubmitting}
                    >
                      <AddIcon />
                    </IconButton>
                  </Tooltip>
                </React.Fragment>
              );
            }}
          </FieldArray>
        ) : (
          // eslint-disable-next-line react/no-array-index-key
          <Outline key={i} label={name}>
            {composeFields(child, path)}
          </Outline>
        );
      }

      if (array) {
        return (
          // eslint-disable-next-line react/no-array-index-key
          <Outline key={i} label={name}>
            <FieldArray name={path}>{formikFieldArrayChild}</FieldArray>
          </Outline>
        );
      }

      return (
        <Field
          // eslint-disable-next-line react/no-array-index-key
          key={i}
          component={FormikTextField}
          fullWidth
          label={name}
          margin="normal"
          name={path}
          variant="outlined"
        />
      );
    })}
  </React.Fragment>
);
const composeFormikFragment = (thingConfig: ThingConfig): Object => {
  const flatFormikFields = composeFlatFormikFields(thingConfig);

  return composeFields(flatFormikFields);
};

export default composeFormikFragment;
