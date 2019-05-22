// @flow
/* eslint-env jest */

const React = require('react');
const { Field } = require('formik');
const { TextField: FormikTextField } = require('formik-material-ui');

const formikFieldArrayChild = require('./formikFieldArrayChild');

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
              <Field name="people.friends[0].emails[0]" label="email" component={FormikTextField} />
              <button type="button" onClick={() => {}} disabled={false}>
                {`Delete the email`}
              </button>
            </div>,
            <div key={1}>
              <Field name="people.friends[0].emails[1]" label="email" component={FormikTextField} />
              <button type="button" onClick={() => {}} disabled={false}>
                {`Delete the email`}
              </button>
            </div>,
          ]}
        </div>
        <button type="button" onClick={() => {}} disabled={false}>
          Add a email
        </button>
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
