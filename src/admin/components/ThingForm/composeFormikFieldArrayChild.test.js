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

import Geospatial from '../Geospatial';
import composeFormikFieldArrayChild from './composeFormikFieldArrayChild';

describe('composeFormikFieldArrayChild', () => {
  test('should return array of text fields', () => {
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
            required
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
            required
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
          <IconButton aria-label="Add email" onClick={() => {}} style={{ display: 'block' }}>
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

    const result = composeFormikFieldArrayChild({ attributes: {}, kind: 'textFields' }, false)(
      props,
    );

    const result2 = JSON.parse(JSON.stringify(result));
    const expectedResult2 = JSON.parse(JSON.stringify(expectedResult));

    expect(result2).toEqual(expectedResult2);
  });

  test('should return array of int fields', () => {
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
            required
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
            required
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
          <IconButton aria-label="Add count" onClick={() => {}} style={{ display: 'block' }}>
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

    const result = composeFormikFieldArrayChild({ attributes: {}, kind: 'intFields' }, false)(
      props,
    );

    const result2 = JSON.parse(JSON.stringify(result));
    const expectedResult2 = JSON.parse(JSON.stringify(expectedResult));

    expect(result2).toEqual(expectedResult2);
  });

  test('should return array of float fields', () => {
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
            required
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
            required
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
          <IconButton aria-label="Add weight" onClick={() => {}} style={{ display: 'block' }}>
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

    const result = composeFormikFieldArrayChild({ attributes: {}, kind: 'floatFields' }, false)(
      props,
    );

    const result2 = JSON.parse(JSON.stringify(result));
    const expectedResult2 = JSON.parse(JSON.stringify(expectedResult));

    expect(result2).toEqual(expectedResult2);
  });

  test('should return array of boolean fields', () => {
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
          <IconButton aria-label="Add bool" onClick={() => {}} style={{ display: 'block' }}>
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

    const result = composeFormikFieldArrayChild({ attributes: {}, kind: 'booleanFields' }, false)(
      props,
    );

    const result2 = JSON.parse(JSON.stringify(result));
    const expectedResult2 = JSON.parse(JSON.stringify(expectedResult));

    expect(result2).toEqual(expectedResult2);
  });

  test('should return array of relational fields', () => {
    const values = {
      people: {
        friends: [
          { name: 'Vasya', coworkers: ['5cefb33f05d6be4b7b598421', '5cefb33f05d6be4b7b598422'] },
        ],
      },
    };
    const name = 'people.friends[0].coworkers';
    const expectedResult = (
      <React.Fragment>
        {[
          <Field
            key={0}
            component={FormikTextField}
            disabled={false}
            fullWidth
            label="coworker #1"
            margin="normal"
            name="people.friends[0].coworkers[0]"
            required
            variant="outlined"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <Tooltip title="Delete coworker #1">
                    <IconButton
                      aria-label="Delete coworker #1"
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
            label="coworker #2"
            margin="normal"
            name="people.friends[0].coworkers[1]"
            required
            variant="outlined"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <Tooltip title="Delete coworker #2">
                    <IconButton
                      aria-label="Delete coworker #2"
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
        <Tooltip title="Add coworker" placement="right">
          <IconButton aria-label="Add coworker" onClick={() => {}} style={{ display: 'block' }}>
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

    const result = composeFormikFieldArrayChild(
      { attributes: {}, kind: 'relationalFields' },
      false,
    )(props);

    const result2 = JSON.parse(JSON.stringify(result));
    const expectedResult2 = JSON.parse(JSON.stringify(expectedResult));

    expect(result2).toEqual(expectedResult2);
  });

  test('should return array of duplex fields', () => {
    const values = {
      people: {
        friends: [
          { name: 'Vasya', coworkers: ['5cefb33f05d6be4b7b598421', '5cefb33f05d6be4b7b598422'] },
        ],
      },
    };
    const name = 'people.friends[0].coworkers';
    const expectedResult = (
      <React.Fragment>
        {[
          <Field
            key={0}
            component={FormikTextField}
            disabled={false}
            fullWidth
            label="coworker #1"
            margin="normal"
            name="people.friends[0].coworkers[0]"
            required
            variant="outlined"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <Tooltip title="Delete coworker #1">
                    <IconButton
                      aria-label="Delete coworker #1"
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
            label="coworker #2"
            margin="normal"
            name="people.friends[0].coworkers[1]"
            required
            variant="outlined"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <Tooltip title="Delete coworker #2">
                    <IconButton
                      aria-label="Delete coworker #2"
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
        <Tooltip title="Add coworker" placement="right">
          <IconButton aria-label="Add coworker" onClick={() => {}} style={{ display: 'block' }}>
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

    const result = composeFormikFieldArrayChild({ attributes: {}, kind: 'duplexFields' }, false)(
      props,
    );

    const result2 = JSON.parse(JSON.stringify(result));
    const expectedResult2 = JSON.parse(JSON.stringify(expectedResult));

    expect(result2).toEqual(expectedResult2);
  });

  test('should return array of dateTime fields', () => {
    const values = {
      people: {
        friends: [
          { name: 'Vasya', dates: ['2018-12-15T22:00:00.000Z', '2018-12-23T22:00:00.000Z'] },
        ],
      },
    };
    const name = 'people.friends[0].dates';
    const expectedResult = (
      <React.Fragment>
        {[
          <Field
            key={0}
            component={FormikTextField}
            disabled={false}
            InputLabelProps={{
              shrink: true,
            }}
            label="date #1"
            margin="normal"
            name="people.friends[0].dates[0]"
            style={{ marginRight: 8 }}
            required
            type="datetime-local"
            variant="outlined"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <Tooltip title="Delete date #1">
                    <IconButton
                      aria-label="Delete date #1"
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
            InputLabelProps={{
              shrink: true,
            }}
            label="date #2"
            margin="normal"
            name="people.friends[0].dates[1]"
            required
            style={{ marginRight: 8 }}
            type="datetime-local"
            variant="outlined"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <Tooltip title="Delete date #2">
                    <IconButton
                      aria-label="Delete date #2"
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
        <Tooltip title="Add date" placement="right">
          <IconButton aria-label="Add date" onClick={() => {}} style={{ display: 'block' }}>
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

    const result = composeFormikFieldArrayChild({ attributes: {}, kind: 'dateTimeFields' }, false)(
      props,
    );

    const result2 = JSON.parse(JSON.stringify(result));
    const expectedResult2 = JSON.parse(JSON.stringify(expectedResult));

    expect(result2).toEqual(expectedResult2);
  });

  test('should return array of geospatial fields', () => {
    const values = {
      people: {
        friends: [
          {
            name: 'Vasya',
            positions: [
              {
                longitude: 50.426982,
                latitude: 30.615328,
              },
              {
                longitude: 50.426983,
                latitude: 30.615329,
              },
            ],
          },
        ],
      },
    };
    const name = 'people.friends[0].positions';
    const expectedResult = (
      <React.Fragment>
        {[
          <Geospatial
            key={0}
            disabled={false}
            label="position #1"
            name="people.friends[0].positions[0]"
            onDelete={() => {}}
            required
            type="Point"
          />,
          <Geospatial
            key={1}
            disabled={false}
            label="position #2"
            name="people.friends[0].positions[1]"
            onDelete={() => {}}
            required
            type="Point"
          />,
        ]}
        <Tooltip title="Add position" placement="right">
          <IconButton aria-label="Add position" onClick={() => {}} style={{ display: 'block' }}>
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

    const result = composeFormikFieldArrayChild(
      { attributes: { geospatialType: 'Point' }, kind: 'geospatialFields' },
      false,
    )(props);

    const result2 = JSON.parse(JSON.stringify(result));
    const expectedResult2 = JSON.parse(JSON.stringify(expectedResult));

    expect(result2).toEqual(expectedResult2);
  });
});
