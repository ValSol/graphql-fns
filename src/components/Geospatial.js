// @flow

import * as React from 'react';
import { Field } from 'formik';

import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import DeleteIcon from '@material-ui/icons/Delete';

import { TextField as FormikTextField } from 'formik-material-ui';

import Outline from './Outline';

type Props = {
  disabled: boolean,
  error?: boolean,
  label: string,
  message?: string,
  name: string,
  onDelete?: Function,
  required?: boolean,
  type: 'Point' | 'Polygon',
};

const Geospatial: React.StatelessFunctionalComponent<Props> = ({
  disabled,
  error,
  label,
  message,
  name,
  onDelete,
  required,
  type,
}: Props) => {
  const fieldProps = {
    // eslint-disable-next-line react/no-array-index-key
    component: FormikTextField,
    disabled,
    margin: 'normal',
    type: 'number',
    variant: 'outlined',
    required,
    style: { marginRight: 8 },
  };

  let control = null;

  if (type === 'Point') {
    control = (
      <>
        {onDelete &&
          (disabled ? null : (
            <Tooltip
              style={{ float: 'right', marginTop: 16, marginRight: 8 }}
              title={disabled ? '' : `Delete ${label}`}
            >
              <IconButton
                edge="end"
                aria-label={`Delete ${label}`}
                onClick={onDelete}
                disabled={disabled}
              >
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          ))}
        {/* eslint-disable-next-line react/jsx-props-no-spreading */}
        <Field {...fieldProps} label="latitude" name={`${name}.lat`} />
        {/* eslint-disable-next-line react/jsx-props-no-spreading */}
        <Field {...fieldProps} label="longitude" name={`${name}.lng`} />
      </>
    );
  } else if (type === 'Polygon') {
    control = <h1>TODO Polygon control</h1>;
  } else {
    throw new TypeError(`Invalid geospatialType: "${type}" of field "${label}"!`);
  }

  return (
    <Outline error={error} label={label} message={message} required={required}>
      {control}
    </Outline>
  );
};

// $FlowFixMe
Geospatial.defaultProps = {
  error: false,
  onDelete: null,
  message: '',
  required: false,
};

export default Geospatial;
