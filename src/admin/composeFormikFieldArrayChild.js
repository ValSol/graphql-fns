// @flow

import React from 'react';
import { Field } from 'formik';

import IconButton from '@material-ui/core/IconButton';
import AddIcon from '@material-ui/icons/Add';
import DeleteIcon from '@material-ui/icons/Delete';
import InputAdornment from '@material-ui/core/InputAdornment';
import Tooltip from '@material-ui/core/Tooltip';

import {
  TextField as FormikTextField,
  CheckboxWithLabel as FormikCheckbox,
} from 'formik-material-ui';

import { get as objectGet } from 'lodash/object';
import pluralize from 'pluralize';

import Geospatial from './components/Geospatial';

type Kind =
  | 'booleanFields'
  | 'dateTimeFields'
  | 'duplexFields'
  | 'embeddedFields'
  | 'enumFields'
  | 'floatFields'
  | 'geospatialFields'
  | 'intFields'
  | 'relationalFields'
  | 'textFields';

type GeospatialType = 'Point' | 'Polygon';
type Props = {
  form: { isSubmitting: boolean, values: Object },
  name: string,
  push: Function,
  remove: Function,
};

type FieldAttrs = {
  attributes: { geospatialType?: GeospatialType },
  kind: Kind,
};
const composeFormikFieldArrayChild = (
  { attributes: { geospatialType }, kind }: FieldAttrs,
  disabled: boolean,
) => {
  const formikFieldArrayChild = (props: Props) => {
    const {
      form: { isSubmitting, values },
      name,
      push,
      remove,
    } = props;

    const label = name.split('.').slice(-1)[0];
    const itemLabel = pluralize.singular(label);

    let itemForPush = '';
    if (kind === 'booleanFields') itemForPush = false;
    if (kind === 'geospatialFields' && geospatialType === 'Point') {
      itemForPush = {
        longitude: '',
        latitude: '',
      };
    }

    return (
      <React.Fragment>
        {objectGet(values, name) &&
          objectGet(values, name).map((item, i) => {
            const tooltip = (
              <Tooltip title={`Delete ${itemLabel} #${i + 1}`}>
                <IconButton
                  edge="end"
                  aria-label={`Delete ${itemLabel} #${i + 1}`}
                  onClick={() => remove(i)}
                  disabled={disabled || isSubmitting}
                >
                  <DeleteIcon />
                </IconButton>
              </Tooltip>
            );
            const InputProps = {
              endAdornment: <InputAdornment position="end">{tooltip}</InputAdornment>,
            };
            let fieldProps = {
              // eslint-disable-next-line react/no-array-index-key
              key: i,
              component: FormikTextField,
              disabled,
              label: `${itemLabel} #${i + 1}`,
              margin: 'normal',
              name: `${name}[${i}]`,
              variant: 'outlined',
              InputProps,
            };
            if (kind === 'booleanFields') {
              fieldProps = {
                // eslint-disable-next-line react/no-array-index-key
                component: FormikCheckbox,
                disabled,
                Label: { label: `${itemLabel} #${i + 1}` },
                name: `${name}[${i}]`,
              };
            }
            switch (kind) {
              case 'textFields':
                return <Field {...fieldProps} fullWidth />;
              case 'duplexFields':
                return <Field {...fieldProps} fullWidth />;
              case 'relationalFields':
                return <Field {...fieldProps} fullWidth />;
              case 'intFields':
                return <Field {...fieldProps} style={{ marginRight: 8 }} type="number" />;
              case 'floatFields':
                return <Field {...fieldProps} style={{ marginRight: 8 }} type="number" />;
              case 'dateTimeFields':
                return (
                  <Field
                    {...fieldProps}
                    InputLabelProps={{ shrink: true }}
                    style={{ marginRight: 8 }}
                    type="datetime-local"
                  />
                );
              case 'booleanFields':
                return (
                  // eslint-disable-next-line react/no-array-index-key
                  <span key={i} style={{ display: 'inline-block', marginRight: 24 }}>
                    <Field {...fieldProps} />
                    {tooltip}
                  </span>
                );
              case 'geospatialFields':
                if (geospatialType !== 'Point' && geospatialType !== 'Polygon') {
                  throw new TypeError(
                    `Invalid geospatialType: "${String(geospatialType)}" of field "${label}"!`,
                  );
                }
                return (
                  <Geospatial
                    // eslint-disable-next-line react/no-array-index-key
                    key={i}
                    disabled={disabled || isSubmitting}
                    label={`${itemLabel} #${i + 1}`}
                    name={`${name}[${i}]`}
                    type={geospatialType}
                    onDelete={index => remove(index)}
                  />
                );

              default:
                throw new TypeError(`Invalid formFields kind: "${kind}" of thing field!`);
            }
          })}
        <Tooltip title={`Add ${itemLabel}`} placement="right">
          <IconButton
            aria-label={`Add ${itemLabel}`}
            onClick={() => push(itemForPush)}
            disabled={disabled || isSubmitting}
            style={{ display: 'block' }}
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
