// @flow
/* eslint-env jest */

import React from 'react';
import { Field } from 'formik';
import {
  TextField as FormikTextField,
  CheckboxWithLabel as FormikCheckbox,
} from 'formik-material-ui';
import Tooltip from '@material-ui/core/Tooltip';
import IconButton from '@material-ui/core/IconButton';
import AddIcon from '@material-ui/icons/Add';
import DeleteIcon from '@material-ui/icons/Delete';
import InputAdornment from '@material-ui/core/InputAdornment';

import composeFormikFieldArrayChild from './composeFormikFieldArrayChild';

describe('composeFormikFieldArrayChild', () => {
  test('should array of text fields', () => {
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
                  <Tooltip title="Delete email #1">
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
                  <Tooltip title="Delete email #2">
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
          <IconButton
            aria-label="Add email"
            onClick={() => {}}
            disabled={false}
            style={{ display: 'block' }}
          >
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

    const result = composeFormikFieldArrayChild('textFields', false)(props);

    const result2 = JSON.parse(JSON.stringify(result));
    const expectedResult2 = JSON.parse(JSON.stringify(expectedResult));

    expect(result2).toEqual(expectedResult2);
  });

  test('should array of int fields', () => {
    const values = {
      people: {
        friends: [{ name: 'Vasya', counts: [15, 23] }],
      },
    };
    const name = 'people.friends[0].counts';
    const expectedResult = (
      <React.Fragment>
        {[
          <Field
            key={0}
            component={FormikTextField}
            disabled={false}
            label="count #1"
            margin="normal"
            name="people.friends[0].counts[0]"
            style={{ marginRight: 8 }}
            type="number"
            variant="outlined"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <Tooltip title="Delete count #1">
                    <IconButton
                      aria-label="Delete count #1"
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
            label="count #2"
            margin="normal"
            name="people.friends[0].counts[1]"
            style={{ marginRight: 8 }}
            type="number"
            variant="outlined"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <Tooltip title="Delete count #2">
                    <IconButton
                      aria-label="Delete count #2"
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
        <Tooltip title="Add count" placement="right">
          <IconButton
            aria-label="Add count"
            onClick={() => {}}
            disabled={false}
            style={{ display: 'block' }}
          >
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

    const result = composeFormikFieldArrayChild('intFields', false)(props);

    const result2 = JSON.parse(JSON.stringify(result));
    const expectedResult2 = JSON.parse(JSON.stringify(expectedResult));

    expect(result2).toEqual(expectedResult2);
  });

  test('should array of float fields', () => {
    const values = {
      people: {
        friends: [{ name: 'Vasya', weights: [78.1, 73.5] }],
      },
    };
    const name = 'people.friends[0].weights';
    const expectedResult = (
      <React.Fragment>
        {[
          <Field
            key={0}
            component={FormikTextField}
            disabled={false}
            label="weight #1"
            margin="normal"
            name="people.friends[0].weights[0]"
            style={{ marginRight: 8 }}
            type="number"
            variant="outlined"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <Tooltip title="Delete weight #1">
                    <IconButton
                      aria-label="Delete weight #1"
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
            label="weight #2"
            margin="normal"
            name="people.friends[0].weights[1]"
            style={{ marginRight: 8 }}
            type="number"
            variant="outlined"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <Tooltip title="Delete weight #2">
                    <IconButton
                      aria-label="Delete weight #2"
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
        <Tooltip title="Add weight" placement="right">
          <IconButton
            aria-label="Add weight"
            onClick={() => {}}
            disabled={false}
            style={{ display: 'block' }}
          >
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

    const result = composeFormikFieldArrayChild('floatFields', false)(props);

    const result2 = JSON.parse(JSON.stringify(result));
    const expectedResult2 = JSON.parse(JSON.stringify(expectedResult));

    expect(result2).toEqual(expectedResult2);
  });

  test('should array of boolean fields', () => {
    const values = {
      people: {
        friends: [{ name: 'Vasya', bools: [78.1, 73.5] }],
      },
    };
    const name = 'people.friends[0].bools';
    const expectedResult = (
      <React.Fragment>
        {[
          <span key={0} style={{ display: 'inline-block', marginRight: 24 }}>
            <Field
              component={FormikCheckbox}
              disabled={false}
              Label={{ label: 'bool #1' }}
              name="people.friends[0].bools[0]"
            />
            <Tooltip title="Delete bool #1">
              <IconButton
                aria-label="Delete bool #1"
                disabled={false}
                edge="end"
                onClick={() => {}}
              >
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          </span>,

          <span key={1} style={{ display: 'inline-block', marginRight: 24 }}>
            <Field
              component={FormikCheckbox}
              disabled={false}
              Label={{ label: 'bool #2' }}
              name="people.friends[0].bools[1]"
            />
            <Tooltip title="Delete bool #2">
              <IconButton
                aria-label="Delete bool #2"
                disabled={false}
                edge="end"
                onClick={() => {}}
              >
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          </span>,
        ]}
        <Tooltip title="Add bool" placement="right">
          <IconButton
            aria-label="Add bool"
            onClick={() => {}}
            disabled={false}
            style={{ display: 'block' }}
          >
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

    const result = composeFormikFieldArrayChild('booleanFields', false)(props);

    const result2 = JSON.parse(JSON.stringify(result));
    const expectedResult2 = JSON.parse(JSON.stringify(expectedResult));

    expect(result2).toEqual(expectedResult2);
  });
});
