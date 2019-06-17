// @flow

import React from 'react';
import { Field, FieldArray } from 'formik';
import FormControl from '@material-ui/core/FormControl';
import FormHelperText from '@material-ui/core/FormHelperText';
import IconButton from '@material-ui/core/IconButton';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Tooltip from '@material-ui/core/Tooltip';
import AddIcon from '@material-ui/icons/Add';
import DeleteIcon from '@material-ui/icons/Delete';
import {
  CheckboxWithLabel as FormikCheckbox,
  TextField as FormikTextField,
  Select as FormikSelect,
} from 'formik-material-ui';
import { get as objectGet } from 'lodash/object';
import pluralize from 'pluralize';

import type { GeneralConfig, FlatFormikFields, ThingConfig } from '../flowTypes';

import Outline from './components/Outline';
import composeFlatFormikFields from './composeFlatFormikFields';
import composeFormikFieldArrayChild from './composeFormikFieldArrayChild';
import composeInitialValues from './composeInitialValues';

const composeIndex = value => (value === -1 ? '' : `(${value + 1})`);

const composeFields = (
  formikProps: Object,
  flatFormikFields: FlatFormikFields,
  enumsObject: { [enumName: string]: Array<string> },
  disabled: boolean,
  prefix?: string,
) => {
  const { errors, values: allValues } = formikProps;
  return (
    <React.Fragment>
      {flatFormikFields.map(
        // $FlowFixMe
        ({ attributes: { array, config, enumName, name, required }, child, kind }, i) => {
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
                            {composeFields(
                              formikProps,
                              child,
                              enumsObject,
                              disabled,
                              `${path}[${j}]`,
                            )}
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
                              if (config) push(composeInitialValues(config, enumsObject));
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
                {composeFields(formikProps, child, enumsObject, disabled, path)}
              </Outline>
            );
          }

          if (array) {
            if (kind === 'enumFields') {
              const error = objectGet(errors, path);
              const value = objectGet(allValues, path);
              return (
                // eslint-disable-next-line react/no-array-index-key
                <FormControl key={i} error={!!error} style={{ marginRight: 16 }}>
                  <InputLabel shrink htmlFor={path}>
                    {name}
                  </InputLabel>
                  <Field
                    name={path}
                    disabled={disabled}
                    component={FormikSelect}
                    inputProps={{
                      name: path,
                    }}
                    multiple
                    renderValue={selected => (
                      <div>
                        {selected.map((menuItem, index) => {
                          return (
                            <span key={menuItem}>
                              {menuItem}
                              {index < selected.length - 1 ? ', ' : ''}
                            </span>
                          );
                        })}
                      </div>
                    )}
                  >
                    {enumsObject[enumName].map(item => {
                      return (
                        <MenuItem key={item} value={item}>
                          {`${item} ${composeIndex(value.indexOf(item))}`}
                        </MenuItem>
                      );
                    })}
                  </Field>
                  {!!error && <FormHelperText>{error}</FormHelperText>}
                </FormControl>
              );
            }
            return (
              // eslint-disable-next-line react/no-array-index-key
              <Outline key={i} label={name}>
                <FieldArray name={path}>{composeFormikFieldArrayChild(kind, disabled)}</FieldArray>
              </Outline>
            );
          }

          let fieldProps = {
            // eslint-disable-next-line react/no-array-index-key
            key: i,
            component: FormikTextField,
            disabled,
            label: name,
            margin: 'normal',
            name: path,
            variant: 'outlined',
          };

          if (kind === 'booleanFields') {
            fieldProps = {
              key: i,
              disabled,
              Label: { label: name },
              name: path,
              component: FormikCheckbox,
            };
          }

          switch (kind) {
            case 'textFields':
              return <Field {...fieldProps} fullWidth />;

            case 'intFields':
              return <Field {...fieldProps} type="number" />;

            case 'floatFields':
              return <Field {...fieldProps} type="number" />;

            case 'dateTimeFields':
              return (
                <Field
                  {...fieldProps}
                  InputLabelProps={{ shrink: true }}
                  style={{ marginRight: 16 }}
                  type="datetime-local"
                />
              );

            case 'booleanFields':
              return <Field {...fieldProps} />;

            case 'relationalFields':
              return <Field {...fieldProps} fullWidth />;

            case 'duplexFields':
              return <Field {...fieldProps} fullWidth />;

            case 'enumFields':
              // eslint-disable-next-line no-case-declarations
              const menuItems = required ? enumsObject[enumName] : ['', ...enumsObject[enumName]];
              const error = objectGet(errors, path); // eslint-disable-line no-case-declarations
              return (
                // eslint-disable-next-line react/no-array-index-key
                <FormControl key={i} error={!!error} style={{ marginRight: 16 }}>
                  <InputLabel shrink htmlFor={path}>
                    {name}
                  </InputLabel>
                  <Field
                    name={path}
                    disabled={disabled}
                    component={FormikSelect}
                    inputProps={{
                      name: path,
                    }}
                  >
                    {menuItems.map(item => (
                      <MenuItem key={item} value={item}>
                        {item}
                      </MenuItem>
                    ))}
                  </Field>
                  {!!error && <FormHelperText>{error}</FormHelperText>}
                </FormControl>
              );

            default:
              throw new TypeError(`Invalid formFields kind: "${kind}" of thing field!`);
          }
        },
      )}
    </React.Fragment>
  );
};

const composeFormikFragment = (
  formikProps: Object,
  thingConfig: ThingConfig,
  generalConfig: GeneralConfig,
  disabled?: boolean,
): Object => {
  const disabled2 = !!disabled;
  const flatFormikFields = composeFlatFormikFields(thingConfig);

  const { enums } = generalConfig;
  const enumsObject = enums
    ? enums.reduce((prev, { name, enum: enumArray }) => {
        prev[name] = enumArray; // eslint-disable-line no-param-reassign
        return prev;
      }, {})
    : {};

  return composeFields(formikProps, flatFormikFields, enumsObject, disabled2);
};

export default composeFormikFragment;
