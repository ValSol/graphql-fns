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

import type { GeneralConfig, FlatFormikFields, ThingConfig } from '../../flowTypes';

import Geospatial from '../Geospatial';
import Outline from '../Outline';
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
  const { errors, touched, values: allValues } = formikProps;
  return (
    <React.Fragment>
      {flatFormikFields.map((flatFormikField, i) => {
        const {
          attributes,
          attributes: { array, name, required },
          kind,
        } = flatFormikField;
        const path = prefix ? `${prefix}.${name}` : name;
        const touch = objectGet(touched, path);
        const error = objectGet(errors, path);
        const error2 = typeof error === 'string' ? error : undefined; // for embedded fields
        if (flatFormikField.kind === 'embeddedFields') {
          const {
            attributes: { config },
            child,
          } = flatFormikField;
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
                      objectGet(values, path).map((item, j) => {
                        const error3 = error && typeof error[j] === 'string' ? error[j] : undefined;
                        const touch2 = touch && touch[j];
                        return (
                          <Outline
                            // eslint-disable-next-line react/no-array-index-key
                            key={j}
                            error={!!error3 && !!touch2}
                            label={`${itemName} #${j + 1}`}
                            message={touch2 ? error3 : ''}
                          >
                            {composeFields(
                              formikProps,
                              child,
                              enumsObject,
                              disabled,
                              `${path}[${j}]`,
                            )}
                            <div>
                              {disabled || isSubmitting ? (
                                <IconButton edge="end" aria-label={`Delete ${itemName}`} disabled>
                                  <DeleteIcon />
                                </IconButton>
                              ) : (
                                <Tooltip title={`Delete ${itemName} #${j + 1}`} placement="right">
                                  <IconButton
                                    edge="end"
                                    aria-label={`Delete ${itemName}`}
                                    onClick={() => remove(j)}
                                  >
                                    <DeleteIcon />
                                  </IconButton>
                                </Tooltip>
                              )}
                            </div>
                          </Outline>
                        );
                      })}
                    <div>
                      {disabled || isSubmitting ? (
                        <IconButton edge="end" aria-label={`Add ${itemName}`} disabled>
                          <AddIcon />
                        </IconButton>
                      ) : (
                        <Tooltip title={`Add ${itemName}`} placement="right">
                          <IconButton
                            edge="end"
                            aria-label={`Add ${itemName}`}
                            onClick={() => {
                              if (config) push(composeInitialValues(config, enumsObject));
                            }}
                          >
                            <AddIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                    </div>
                  </React.Fragment>
                );
              }}
            </FieldArray>
          ) : (
            // eslint-disable-next-line react/no-array-index-key
            <Outline key={i} error={!!error2 && touch} label={name} message={touch ? error2 : ''}>
              {composeFields(formikProps, child, enumsObject, disabled, path)}
            </Outline>
          );
        }

        if (array) {
          if (flatFormikField.kind === 'enumFields') {
            const {
              attributes: { enumName },
            } = flatFormikField;
            const value = objectGet(allValues, path);
            return (
              <FormControl
                // eslint-disable-next-line react/no-array-index-key
                key={i}
                error={!!error && !!touch}
                required={!!required}
                style={{ marginRight: 16 }}
              >
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
                {!!error && !!touch && <FormHelperText>{error}</FormHelperText>}
              </FormControl>
            );
          }
          return (
            <Outline
              // eslint-disable-next-line react/no-array-index-key
              key={i}
              error={!!error2 && !!touch}
              label={name}
              message={touch ? error2 : ''}
              required={required}
            >
              <FieldArray name={path}>
                {composeFormikFieldArrayChild({ attributes, kind }, disabled)}
              </FieldArray>
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
          required: !!required,
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

        switch (flatFormikField.kind) {
          case 'textFields':
            return <Field {...fieldProps} fullWidth />;

          case 'intFields':
            return <Field {...fieldProps} style={{ marginRight: 16 }} type="number" />;

          case 'floatFields':
            return <Field {...fieldProps} style={{ marginRight: 16 }} type="number" />;

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

          case 'geospatialFields':
            // eslint-disable-next-line no-case-declarations
            const {
              attributes: { geospatialType },
            } = flatFormikField;
            return (
              <Geospatial
                // eslint-disable-next-line react/no-array-index-key
                key={i}
                error={!!error2 && !!touch}
                disabled={disabled}
                label={name}
                message={touch ? error2 : ''}
                name={path}
                required={required}
                type={geospatialType}
              />
            );

          case 'enumFields':
            // eslint-disable-next-line no-case-declarations
            const {
              attributes: { enumName },
            } = flatFormikField;
            // eslint-disable-next-line no-case-declarations
            const menuItems = required ? enumsObject[enumName] : ['', ...enumsObject[enumName]];
            return (
              <FormControl
                // eslint-disable-next-line react/no-array-index-key
                key={i}
                error={!!error && !!touch}
                required={!!required}
                style={{ marginRight: 16 }}
              >
                <InputLabel shrink htmlFor={path}>
                  {name}
                </InputLabel>
                <Field
                  component={FormikSelect}
                  disabled={disabled}
                  inputProps={{
                    name: path,
                  }}
                  name={path}
                >
                  {menuItems.map(item => (
                    <MenuItem key={item} value={item}>
                      {item}
                    </MenuItem>
                  ))}
                </Field>
                {!!error && !!touch && <FormHelperText>{error}</FormHelperText>}
              </FormControl>
            );

          default:
            throw new TypeError(`Invalid formFields kind: "${kind}" of thing field!`);
        }
      })}
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
