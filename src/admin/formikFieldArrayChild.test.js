// @flow
/* eslint-env jest */

import React from 'react';
import { Field } from 'formik';

import { TextField as FormikTextField } from 'formik-material-ui';

import formikFieldArrayChild from './formikFieldArrayChild';

describe('formikFieldArrayChild', () => {
  test('should return fragment for a simple fields set', () => {
    const values = {
      people: {
        friends: [{ name: 'Vasya', emails: ['vasya@gmail.com', 'vasya@ukr.net'] }],
      },
    };
    const name = 'people.friends[0].emails';
    const expectedResult = (
      <div>
        <div>
          {[
            <div key={0}>
              <Field
                component={FormikTextField}
                fullWidth
                label="email #1"
                margin="normal"
                name="people.friends[0].emails[0]"
                variant="outlined"
              />
              <button type="button" onClick={() => {}} disabled={false} title="Delete the email">
                X
              </button>
            </div>,
            <div key={1}>
              <Field
                component={FormikTextField}
                fullWidth
                label="email #2"
                margin="normal"
                name="people.friends[0].emails[1]"
                variant="outlined"
              />
              <button type="button" onClick={() => {}} disabled={false} title="Delete the email">
                X
              </button>
            </div>,
          ]}
        </div>
        <div>
          <br />
          <button type="button" onClick={() => {}} disabled={false}>
            Add email
          </button>
        </div>
      </div>
    );

    const props = {
      form: { values, isSubmitting: false },
      name,
      push() {},
      remove() {},
    };
    const result = formikFieldArrayChild(props);

    const result2 = JSON.parse(JSON.stringify(result));
    const expectedResult2 = JSON.parse(JSON.stringify(expectedResult));

    expect(result2).toEqual(expectedResult2);
  });
});
