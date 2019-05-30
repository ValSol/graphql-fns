// @flow
/* eslint-env jest */

import React from 'react';

import { Field, FieldArray } from 'formik';
import { TextField as FormikTextField } from 'formik-material-ui';
import type { ThingConfig } from '../flowTypes';

import Outline from './components/Outline';
import composeFormikFragment from './composeFormikFragment';
import formikFieldArrayChild from './formikFieldArrayChild';

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
      <React.Fragment>
        <Field
          key={0}
          component={FormikTextField}
          fullWidth
          label="textField1"
          margin="normal"
          name="textField1"
          variant="outlined"
        />
        <Field
          key={1}
          component={FormikTextField}
          fullWidth
          label="textField2"
          margin="normal"
          name="textField2"
          variant="outlined"
        />
        <Field
          key={2}
          component={FormikTextField}
          fullWidth
          label="textField3"
          margin="normal"
          name="textField3"
          variant="outlined"
        />
      </React.Fragment>
    );

    const result = composeFormikFragment(thingConfig);
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
      <React.Fragment>
        <Field
          key={0}
          component={FormikTextField}
          fullWidth
          label="textField"
          margin="normal"
          name="textField"
          variant="outlined"
        />
        <Outline key={1} label="embedded1">
          <React.Fragment>
            {[
              <Field
                key={0}
                component={FormikTextField}
                fullWidth
                label="textField1"
                margin="normal"
                name="embedded1.textField1"
                variant="outlined"
              />,
              <Outline key={1} label="embedded2">
                <React.Fragment>
                  {[
                    <Field
                      key={0}
                      component={FormikTextField}
                      fullWidth
                      label="textField2"
                      margin="normal"
                      name="embedded1.embedded2.textField2"
                      variant="outlined"
                    />,
                    <Outline key={1} label="embedded3">
                      <React.Fragment>
                        {[
                          <Field
                            key={0}
                            component={FormikTextField}
                            fullWidth
                            label="textField3"
                            margin="normal"
                            name="embedded1.embedded2.embedded3.textField3"
                            variant="outlined"
                          />,
                        ]}
                      </React.Fragment>
                    </Outline>,
                  ]}
                </React.Fragment>
              </Outline>,
            ]}
          </React.Fragment>
        </Outline>
      </React.Fragment>
    );

    const result = composeFormikFragment(thingConfig);
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
      <React.Fragment>
        <Field
          key={0}
          component={FormikTextField}
          fullWidth
          label="textField"
          margin="normal"
          name="textField"
          variant="outlined"
        />
        <Outline key={1} label="embedded1">
          <React.Fragment>
            {[
              <Field
                key={0}
                component={FormikTextField}
                fullWidth
                label="textField1"
                margin="normal"
                name="embedded1.textField1"
                variant="outlined"
              />,
              <Outline key={1} label="embedded2">
                <React.Fragment>
                  {[
                    <Field
                      key={0}
                      component={FormikTextField}
                      fullWidth
                      label="textField2"
                      margin="normal"
                      name="embedded1.embedded2.textField2"
                      variant="outlined"
                    />,
                    <FieldArray key={1} name="embedded1.embedded2.embedded3">
                      {() => {}}
                    </FieldArray>,
                  ]}
                </React.Fragment>
              </Outline>,
            ]}
          </React.Fragment>
        </Outline>
      </React.Fragment>
    );

    const result = composeFormikFragment(thingConfig);

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
      <React.Fragment>
        <Field
          key={0}
          component={FormikTextField}
          fullWidth
          label="textField"
          margin="normal"
          name="textField"
          variant="outlined"
        />
        <Outline key={1} label="arrayTextFields">
          <FieldArray name="arrayTextFields">{formikFieldArrayChild}</FieldArray>
        </Outline>
      </React.Fragment>
    );

    const result = composeFormikFragment(thingConfig);

    const result2 = JSON.parse(JSON.stringify(result));
    const expectedResult2 = JSON.parse(JSON.stringify(expectedResult));

    expect(result2).toEqual(expectedResult2);
  });
});
