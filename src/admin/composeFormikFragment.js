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
import composeFormikFieldArrayChild from './composeFormikFieldArrayChild';
import composeInitialValues from './composeInitialValues';

const composeFields = (flatFormikFields: FlatFormikFields, disabled: boolean, prefix?: string) => (
  <React.Fragment>
    {flatFormikFields.map(({ array, config, child, kind, name }, i) => {
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
                        {composeFields(child, disabled, `${path}[${j}]`)}
                        <Tooltip title={`Delete ${itemName} #${j + 1}`} placement="right">
                          <IconButton
                            edge="end"
                            aria-label={`Delete ${itemName}`}
                            onClick={() => remove(j)}
                            disabled={disabled || isSubmitting}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </Outline>
                    ))}
                  <div>
                    <Tooltip title={`Add ${itemName}`} placement="right">
                      <IconButton
                        edge="end"
                        aria-label={`Add ${itemName}`}
                        onClick={() => {
                          if (config) push(composeInitialValues(config));
                        }}
                        disabled={disabled || isSubmitting}
                      >
                        <AddIcon />
                      </IconButton>
                    </Tooltip>
                  </div>
                </React.Fragment>
              );
            }}
          </FieldArray>
        ) : (
          // eslint-disable-next-line react/no-array-index-key
          <Outline key={i} label={name}>
            {composeFields(child, disabled, path)}
          </Outline>
        );
      }

      if (array) {
        return (
          // eslint-disable-next-line react/no-array-index-key
          <Outline key={i} label={name}>
            <FieldArray name={path}>{composeFormikFieldArrayChild(kind, disabled)}</FieldArray>
          </Outline>
        );
      }

      const fieldProps = {
        // eslint-disable-next-line react/no-array-index-key
        key: i,
        component: FormikTextField,
        disabled,
        fullWidth: true,
        label: name,
        margin: 'normal',
        name: path,
        variant: 'outlined',
      };
      switch (kind) {
        case 'textFields':
          return <Field {...fieldProps} />;

        case 'intFields':
          return <Field {...fieldProps} fullWidth={false} type="number" />;

        case 'floatFields':
          return <Field {...fieldProps} fullWidth={false} type="number" />;

        default:
          throw new TypeError(`Invalid formFields kind: "${kind}" of thing field!`);
      }
    })}
  </React.Fragment>
);
const composeFormikFragment = (thingConfig: ThingConfig, disabled?: boolean): Object => {
  const disabled2 = !!disabled;
  const flatFormikFields = composeFlatFormikFields(thingConfig);

  return composeFields(flatFormikFields, disabled2);
};

export default composeFormikFragment;
