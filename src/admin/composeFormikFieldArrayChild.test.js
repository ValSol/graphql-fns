// @flow
/* eslint-env jest */

import React from 'react';
import { Field } from 'formik';
import { TextField as FormikTextField } from 'formik-material-ui';
import Tooltip from '@material-ui/core/Tooltip';
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
      <React.Fragment>
        {[
          <Field
            key={0}
            component={FormikTextField}
            disabled={false}
            fullWidth
            label="email #1"
            margin="normal"
            name="people.friends[0].emails[0]"
            variant="outlined"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <Tooltip title="Delete email #1" placement="left">
                    <IconButton
                      aria-label="Delete email #1"
                      disabled={false}
                      edge="end"
                      onClick={() => {}}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </InputAdornment>
              ),
            }}
          />,
          <Field
            key={1}
            component={FormikTextField}
            disabled={false}
            fullWidth
            label="email #2"
            margin="normal"
            name="people.friends[0].emails[1]"
            variant="outlined"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <Tooltip title="Delete email #2" placement="left">
                    <IconButton
                      aria-label="Delete email #2"
                      disabled={false}
                      edge="end"
                      onClick={() => {}}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </InputAdornment>
              ),
            }}
          />,
        ]}
        <Tooltip title="Add email" placement="right">
          <IconButton aria-label="Add email" onClick={() => {}} disabled={false}>
            <AddIcon />
          </IconButton>
        </Tooltip>
      </React.Fragment>
    );

    const props = {
      form: { values, isSubmitting: false },
      name,
      push() {},
      remove() {},
    };

    const result = composeFormikFieldArrayChild(false)(props);

    const result2 = JSON.parse(JSON.stringify(result));
    const expectedResult2 = JSON.parse(JSON.stringify(expectedResult));

    expect(result2).toEqual(expectedResult2);
  });
});
