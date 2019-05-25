// @flow
/* eslint-env jest */
import type { ThingConfig } from '../flowTypes';

const React = require('react');

const { Field, FieldArray } = require('formik');
const { TextField: FormikTextField } = require('formik-material-ui');

const composeFormikFragment = require('./composeFormikFragment');
const formikFieldArrayChild = require('./formikFieldArrayChild');

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
        <div key={0}>
          <Field
            component={FormikTextField}
            fullWidth
            label="textField1"
            margin="normal"
            name="textField1"
            variant="outlined"
          />
        </div>
        <div key={1}>
          <Field
            component={FormikTextField}
            fullWidth
            label="textField2"
            margin="normal"
            name="textField2"
            variant="outlined"
          />
        </div>
        <div key={2}>
          <Field
            component={FormikTextField}
            fullWidth
            label="textField3"
            margin="normal"
            name="textField3"
            variant="outlined"
          />
        </div>
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
        <div key={0}>
          <Field
            component={FormikTextField}
            fullWidth
            label="textField"
            margin="normal"
            name="textField"
            variant="outlined"
          />
        </div>
        <div key={1}>
          {[
            <div key={0}>
              <Field
                component={FormikTextField}
                fullWidth
                label="embedded1 ‣ textField1"
                margin="normal"
                name="embedded1.textField1"
                variant="outlined"
              />
            </div>,
            <div key={1}>
              {[
                <div key={0}>
                  <Field
                    component={FormikTextField}
                    fullWidth
                    label="embedded1 ‣ embedded2 ‣ textField2"
                    margin="normal"
                    name="embedded1.embedded2.textField2"
                    variant="outlined"
                  />
                </div>,
                <div key={1}>
                  {[
                    <div key={0}>
                      <Field
                        component={FormikTextField}
                        fullWidth
                        label="embedded1 ‣ embedded2 ‣ embedded3 ‣ textField3"
                        margin="normal"
                        name="embedded1.embedded2.embedded3.textField3"
                        variant="outlined"
                      />
                    </div>,
                  ]}
                </div>,
              ]}
            </div>,
          ]}
        </div>
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
        <div key={0}>
          <Field
            component={FormikTextField}
            fullWidth
            label="textField"
            margin="normal"
            name="textField"
            variant="outlined"
          />
        </div>
        <div key={1}>
          {[
            <div key={0}>
              <Field
                component={FormikTextField}
                fullWidth
                label="embedded1 ‣ textField1"
                margin="normal"
                name="embedded1.textField1"
                variant="outlined"
              />
            </div>,
            <div key={1}>
              {[
                <div key={0}>
                  <Field
                    component={FormikTextField}
                    fullWidth
                    label="embedded1 ‣ embedded2 ‣ textField2"
                    margin="normal"
                    name="embedded1.embedded2.textField2"
                    variant="outlined"
                  />
                </div>,
                <div key={1}>
                  <FieldArray name="embedded1.embedded2.embedded3">{() => {}}</FieldArray>
                </div>,
              ]}
            </div>,
          ]}
        </div>
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
        <div key={0}>
          <Field
            component={FormikTextField}
            fullWidth
            label="textField"
            margin="normal"
            name="textField"
            variant="outlined"
          />
        </div>
        <div key={1}>
          <FieldArray name="arrayTextFields">{formikFieldArrayChild}</FieldArray>
        </div>
      </React.Fragment>
    );

    const result = composeFormikFragment(thingConfig);

    expect(result).toEqual(expectedResult);
  });
});
