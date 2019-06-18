// @flow

import React from 'react';
import { Field } from 'formik';

import { TextField as FormikTextField } from 'formik-material-ui';

import Outline from './Outline';

type Props = {
  disabled: boolean,
  error?: boolean,
  message?: string,
  name: string,
  path: string,
  type: 'Point' | 'Polygon',
};

const Geospatial = ({ disabled, error, message, name, path, type }: Props) => {
  const fieldProps = {
    // eslint-disable-next-line react/no-array-index-key
    component: FormikTextField,
    disabled,
    margin: 'normal',
    variant: 'outlined',
    type: 'number',
  };

  let control = null;

  if (type === 'Point') {
    control = (
      <React.Fragment>
        <Field
          {...fieldProps}
          label="longitude"
          name={`${path}.longitude`}
          style={{ marginRight: 16 }}
        />
        <Field {...fieldProps} label="latitude" name={`${path}.latitude`} />
      </React.Fragment>
    );
  } else if (type === 'Polygon') {
    control = <h1>TODO Polygon control</h1>;
  } else {
    throw new TypeError(`Invalid geospatialType: "${type}" of field "${name}"!`);
  }

  return (
    <Outline error={error} label={name} message={message}>
      {control}
    </Outline>
  );
};

Geospatial.defaultProps = {
  error: false,
  message: '',
};

export default Geospatial;
