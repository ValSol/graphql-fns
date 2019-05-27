// @flow
/* eslint-env jest */

import React from 'react';
import { Field } from 'formik';

import { TextField as FormikTextField } from 'formik-material-ui';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import AddIcon from '@material-ui/icons/Add';
import DeleteIcon from '@material-ui/icons/Delete';
import InputAdornment from '@material-ui/core/InputAdornment';

import composeFormikFieldArrayChild from './composeFormikFieldArrayChild';

describe('composeFormikFieldArrayChild', () => {
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
                label="people ‣ friends #1 ‣ email #1"
                margin="normal"
                name="people.friends[0].emails[0]"
                variant="outlined"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="Delete email"
                        disabled={false}
                        edge="end"
                        onClick={() => {}}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </div>,
            <div key={1}>
              <Field
                component={FormikTextField}
                fullWidth
                label="people ‣ friends #1 ‣ email #2"
                margin="normal"
                name="people.friends[0].emails[1]"
                variant="outlined"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="Delete email"
                        disabled={false}
                        edge="end"
                        onClick={() => {}}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </div>,
          ]}
        </div>
        <div>
          <Button onClick={() => {}} disabled={false}>
            <AddIcon />
            email
          </Button>
        </div>
      </div>
    );

    const props = {
      form: { values, isSubmitting: false },
      name,
      push() {},
      remove() {},
    };
    const result = composeFormikFieldArrayChild('people ‣ friends #1')(props);

    const result2 = JSON.parse(JSON.stringify(result));
    const expectedResult2 = JSON.parse(JSON.stringify(expectedResult));

    expect(result2).toEqual(expectedResult2);
  });
});
