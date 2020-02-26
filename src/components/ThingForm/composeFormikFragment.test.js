// @flow
/* eslint-env jest */

import React from 'react';

import FormControl from '@material-ui/core/FormControl';
import FormHelperText from '@material-ui/core/FormHelperText';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';

import { Field, FieldArray } from 'formik';
import {
  TextField as FormikTextField,
  CheckboxWithLabel as FormikCheckbox,
  Select as FormikSelect,
} from 'formik-material-ui';
import type { ThingConfig } from '../../flowTypes';

import Geospatial from '../Geospatial';
import Outline from '../Outline';
import composeFormikFragment from './composeFormikFragment';
import composeFormikFieldArrayChild from './composeFormikFieldArrayChild';

describe('composeFormikFragment', () => {
  test('should return fragment for a simple fields set', () => {
    const thingConfig: ThingConfig = {};
    Object.assign(thingConfig, {
      name: 'Example',
      textFields: [
        {
          name: 'textField1',
        },
        {
          name: 'textField2',
        },
        {
          name: 'textField3',
        },
      ],
    });

    const expectedResult = (
      <>
        <Field
          key={0}
          component={FormikTextField}
          disabled={false}
          fullWidth
          label="textField1"
          margin="normal"
          name="textField1"
          required={false}
          variant="outlined"
        />
        <Field
          key={1}
          component={FormikTextField}
          disabled={false}
          fullWidth
          label="textField2"
          margin="normal"
          name="textField2"
          required={false}
          variant="outlined"
        />
        <Field
          key={2}
          component={FormikTextField}
          disabled={false}
          fullWidth
          label="textField3"
          margin="normal"
          name="textField3"
          required={false}
          variant="outlined"
        />
      </>
    );

    const generalConfig = { thingConfigs: [thingConfig] };

    const result = composeFormikFragment({}, {}, thingConfig, generalConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should compose the flat embedded fields', () => {
    const embedded3Config: ThingConfig = {
      name: 'Embedded3',
      embedded: true,
      textFields: [
        {
          name: 'textField3',
        },
      ],
    };

    const embedded2Config: ThingConfig = {
      name: 'Embedded2',
      embedded: true,
      textFields: [
        {
          name: 'textField2',
        },
      ],
      embeddedFields: [
        {
          name: 'embedded3',
          config: embedded3Config,
        },
      ],
    };

    const embedded1Config: ThingConfig = {
      name: 'Embedded1',
      embedded: true,
      textFields: [
        {
          name: 'textField1',
        },
      ],
      embeddedFields: [
        {
          name: 'embedded2',
          config: embedded2Config,
        },
      ],
    };

    const thingConfig: ThingConfig = {
      name: 'Example',
      textFields: [
        {
          name: 'textField',
        },
      ],
      embeddedFields: [
        {
          name: 'embedded1',
          config: embedded1Config,
        },
      ],
    };

    const expectedResult = (
      <>
        <Field
          key={0}
          component={FormikTextField}
          disabled={false}
          fullWidth
          label="textField"
          margin="normal"
          name="textField"
          required={false}
          variant="outlined"
        />
        <Outline key={1} label="embedded1">
          <>
            {[
              <Field
                key={0}
                component={FormikTextField}
                disabled={false}
                fullWidth
                label="textField1"
                margin="normal"
                name="embedded1.textField1"
                required={false}
                variant="outlined"
              />,
              <Outline key={1} label="embedded2">
                <>
                  {[
                    <Field
                      key={0}
                      component={FormikTextField}
                      disabled={false}
                      fullWidth
                      label="textField2"
                      margin="normal"
                      name="embedded1.embedded2.textField2"
                      required={false}
                      variant="outlined"
                    />,
                    <Outline key={1} label="embedded3">
                      <>
                        {[
                          <Field
                            key={0}
                            component={FormikTextField}
                            disabled={false}
                            fullWidth
                            label="textField3"
                            margin="normal"
                            name="embedded1.embedded2.embedded3.textField3"
                            required={false}
                            variant="outlined"
                          />,
                        ]}
                      </>
                    </Outline>,
                  ]}
                </>
              </Outline>,
            ]}
          </>
        </Outline>
      </>
    );

    const generalConfig = { thingConfigs: [thingConfig] };

    const result = composeFormikFragment({}, {}, thingConfig, generalConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should compose the flat array of embedded fields', () => {
    const embedded3Config: ThingConfig = {
      name: 'Embedded3',
      embedded: true,
      textFields: [
        {
          name: 'textField3',
        },
      ],
    };

    const embedded2Config: ThingConfig = {
      name: 'Embedded2',
      embedded: true,
      textFields: [
        {
          name: 'textField2',
        },
      ],
      embeddedFields: [
        {
          name: 'embedded3',
          config: embedded3Config,
          array: true,
        },
      ],
    };

    const embedded1Config: ThingConfig = {
      name: 'Embedded1',
      embedded: true,
      textFields: [
        {
          name: 'textField1',
        },
      ],
      embeddedFields: [
        {
          name: 'embedded2',
          config: embedded2Config,
        },
      ],
    };

    const thingConfig: ThingConfig = {
      name: 'Example',
      textFields: [
        {
          name: 'textField',
        },
      ],
      embeddedFields: [
        {
          name: 'embedded1',
          config: embedded1Config,
        },
      ],
    };

    const expectedResult = (
      <>
        <Field
          key={0}
          component={FormikTextField}
          disabled={false}
          fullWidth
          label="textField"
          margin="normal"
          name="textField"
          required={false}
          variant="outlined"
        />
        <Outline key={1} label="embedded1">
          <>
            {[
              <Field
                key={0}
                component={FormikTextField}
                disabled={false}
                fullWidth
                label="textField1"
                margin="normal"
                name="embedded1.textField1"
                required={false}
                variant="outlined"
              />,
              <Outline key={1} label="embedded2">
                <>
                  {[
                    <Field
                      key={0}
                      component={FormikTextField}
                      disabled={false}
                      fullWidth
                      label="textField2"
                      margin="normal"
                      name="embedded1.embedded2.textField2"
                      required={false}
                      variant="outlined"
                    />,
                    <FieldArray key={1} name="embedded1.embedded2.embedded3">
                      {() => {}}
                    </FieldArray>,
                  ]}
                </>
              </Outline>,
            ]}
          </>
        </Outline>
      </>
    );

    const generalConfig = { thingConfigs: [thingConfig] };

    const result = composeFormikFragment({}, {}, thingConfig, generalConfig);

    const expectedResult2 = JSON.parse(JSON.stringify(expectedResult));
    const result2 = JSON.parse(JSON.stringify(result));

    expect(result2).toEqual(expectedResult2);
  });

  test('should return fragment for a simple fields set', () => {
    const thingConfig: ThingConfig = {};
    Object.assign(thingConfig, {
      name: 'Example',
      textFields: [
        {
          name: 'textField',
        },
        {
          name: 'arrayTextFields',
          array: true,
        },
      ],
    });

    const expectedResult = (
      <>
        <Field
          key={0}
          component={FormikTextField}
          disabled={false}
          fullWidth
          label="textField"
          margin="normal"
          name="textField"
          required={false}
          variant="outlined"
        />
        <Outline key={1} label="arrayTextFields">
          <FieldArray name="arrayTextFields">{composeFormikFieldArrayChild}</FieldArray>
        </Outline>
      </>
    );

    const generalConfig = { thingConfigs: [thingConfig] };

    const result = composeFormikFragment({}, {}, thingConfig, generalConfig);

    const result2 = JSON.parse(JSON.stringify(result));
    const expectedResult2 = JSON.parse(JSON.stringify(expectedResult));

    expect(result2).toEqual(expectedResult2);
  });

  test('should return fragment for int and float fields', () => {
    const thingConfig: ThingConfig = {};
    Object.assign(thingConfig, {
      name: 'Example',
      intFields: [
        {
          name: 'intField',
        },
      ],
      floatFields: [
        {
          name: 'floatField',
        },
      ],
    });

    const expectedResult = (
      <>
        <Field
          key={0}
          component={FormikTextField}
          disabled={false}
          label="intField"
          margin="normal"
          name="intField"
          required={false}
          style={{ marginRight: 16 }}
          type="number"
          variant="outlined"
        />
        <Field
          key={1}
          component={FormikTextField}
          disabled={false}
          label="floatField"
          margin="normal"
          name="floatField"
          required={false}
          style={{ marginRight: 16 }}
          type="number"
          variant="outlined"
        />
      </>
    );

    const generalConfig = { thingConfigs: [thingConfig] };

    const result = composeFormikFragment({}, {}, thingConfig, generalConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should return fragment for int and float fields', () => {
    const thingConfig: ThingConfig = {};
    Object.assign(thingConfig, {
      name: 'Example',
      intFields: [
        {
          name: 'intField',
        },
      ],
      floatFields: [
        {
          name: 'floatField',
        },
      ],
    });

    const expectedResult = (
      <>
        <Field
          key={0}
          component={FormikTextField}
          disabled={false}
          label="intField"
          margin="normal"
          name="intField"
          required={false}
          style={{ marginRight: 16 }}
          type="number"
          variant="outlined"
        />
        <Field
          key={1}
          component={FormikTextField}
          disabled={false}
          label="floatField"
          margin="normal"
          name="floatField"
          required={false}
          style={{ marginRight: 16 }}
          type="number"
          variant="outlined"
        />
      </>
    );

    const generalConfig = { thingConfigs: [thingConfig] };

    const result = composeFormikFragment({}, {}, thingConfig, generalConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should return fragment for boolean fields', () => {
    const thingConfig: ThingConfig = {};
    Object.assign(thingConfig, {
      name: 'Example',
      booleanFields: [
        {
          name: 'booleanField',
        },
      ],
    });

    const expectedResult = (
      <>
        {[
          <Field
            key={0}
            component={FormikCheckbox}
            disabled={false}
            Label={{ label: 'booleanField' }}
            name="booleanField"
          />,
        ]}
      </>
    );

    const generalConfig = { thingConfigs: [thingConfig] };

    const result = composeFormikFragment({}, {}, thingConfig, generalConfig);

    expect(result).toEqual(expectedResult);
  });

  test('should return fragment for a relational and duplex fields set', () => {
    const thingConfig: ThingConfig = {};
    Object.assign(thingConfig, {
      name: 'Example',
      relationalFields: [
        {
          name: 'relationalField',
          config: thingConfig,
        },
      ],
      duplexFields: [
        {
          name: 'duplexField',
          config: thingConfig,
          oppositeName: 'duplexField',
        },
      ],
    });

    const expectedResult = (
      <>
        {[
          <Field
            key={0}
            component={FormikTextField}
            disabled={false}
            fullWidth
            label="duplexField"
            margin="normal"
            name="duplexField"
            required={false}
            variant="outlined"
          />,
          <Field
            key={1}
            component={FormikTextField}
            disabled={false}
            fullWidth
            label="relationalField"
            margin="normal"
            name="relationalField"
            required={false}
            variant="outlined"
          />,
        ]}
      </>
    );

    const generalConfig = { thingConfigs: [thingConfig] };

    const result = composeFormikFragment({}, {}, thingConfig, generalConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should return fragment for a enum fields set', () => {
    const thingConfig: ThingConfig = {};
    Object.assign(thingConfig, {
      name: 'Example',
      enumFields: [
        {
          name: 'enumField',
          enumName: 'weekdays',
        },
      ],
    });

    const expectedResult = (
      <>
        {[
          <FormControl key={0} className="formControl" error required={false}>
            <InputLabel className="inputLabel" shrink htmlFor="enumField">
              enumField
            </InputLabel>
            <Field
              name="enumField"
              disabled={false}
              component={FormikSelect}
              inputProps={{
                name: 'enumField',
              }}
            >
              {[
                <MenuItem key={'\u00A0'} value="">
                  {'\u00A0'}
                </MenuItem>,
                <MenuItem key="Sunday" value="Sunday">
                  Sunday
                </MenuItem>,
                <MenuItem key="Monday" value="Monday">
                  Monday
                </MenuItem>,
                <MenuItem key="Tuesday" value="Tuesday">
                  Tuesday
                </MenuItem>,
                <MenuItem key="Wednesday" value="Wednesday">
                  Wednesday
                </MenuItem>,
                <MenuItem key="Thursday" value="Thursday">
                  Thursday
                </MenuItem>,
                <MenuItem key="Friday" value="Friday">
                  Friday
                </MenuItem>,
                <MenuItem key="Saturday" value="Saturday">
                  Saturday
                </MenuItem>,
              ]}
            </Field>
            <FormHelperText>Required</FormHelperText>
          </FormControl>,
        ]}
      </>
    );

    const enums = [
      {
        name: 'weekdays',
        enum: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      },
    ];
    const generalConfig = { thingConfigs: [thingConfig], enums };

    const result = composeFormikFragment(
      { errors: { enumField: 'Required' }, touched: { enumField: true }, values: {} },
      { formControl: 'formControl', inputLabel: 'inputLabel' },
      thingConfig,
      generalConfig,
    );

    expect(result).toEqual(expectedResult);
  });

  test('should return fragment for dateTime field', () => {
    const thingConfig: ThingConfig = {};
    Object.assign(thingConfig, {
      name: 'Example',
      dateTimeFields: [
        {
          name: 'dateTimeField',
        },
      ],
    });

    const expectedResult = (
      <>
        {[
          <Field
            key={0}
            component={FormikTextField}
            disabled={false}
            InputLabelProps={{
              shrink: true,
            }}
            label="dateTimeField"
            margin="normal"
            name="dateTimeField"
            required={false}
            style={{ marginRight: 16 }}
            type="datetime-local"
            variant="outlined"
          />,
        ]}
      </>
    );

    const generalConfig = { thingConfigs: [thingConfig] };

    const result = composeFormikFragment({}, {}, thingConfig, generalConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should return fragment for dateTime field', () => {
    const thingConfig: ThingConfig = {};
    Object.assign(thingConfig, {
      name: 'Example',
      geospatialFields: [
        {
          name: 'geospatialField',
          geospatialType: 'Point',
        },
      ],
    });

    const expectedResult = (
      <>
        {[
          <Geospatial
            key={0}
            disabled={false}
            label="geospatialField"
            name="geospatialField"
            required={false}
            type="Point"
          />,
        ]}
      </>
    );

    const generalConfig = { thingConfigs: [thingConfig] };

    const result = composeFormikFragment({}, {}, thingConfig, generalConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should compose the flat file fields', () => {
    const imageConfig: ThingConfig = {
      name: 'Image',
      embedded: true,
      textFields: [
        {
          name: 'fileId',
        },
      ],
    };

    const thingConfig: ThingConfig = {
      name: 'Example',
      textFields: [
        {
          name: 'textField',
        },
      ],
      fileFields: [
        {
          name: 'logo',
          config: imageConfig,
        },
      ],
    };

    const expectedResult = (
      <>
        <Field
          key={0}
          component={FormikTextField}
          disabled={false}
          fullWidth
          label="textField"
          margin="normal"
          name="textField"
          required={false}
          variant="outlined"
        />
        <Outline key={1} label="logo">
          <>
            {[
              <Field
                key={0}
                component={FormikTextField}
                disabled={false}
                fullWidth
                label="fileId"
                margin="normal"
                name="logo.fileId"
                required={false}
                variant="outlined"
              />,
            ]}
          </>
        </Outline>
      </>
    );

    const generalConfig = { thingConfigs: [thingConfig] };

    const result = composeFormikFragment({}, {}, thingConfig, generalConfig);
    expect(result).toEqual(expectedResult);
  });
});
