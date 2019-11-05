// @flow

import React from 'react';
import FormControl from '@material-ui/core/FormControl';
import MenuItem from '@material-ui/core/MenuItem';
import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';
import { createBitwiseArray } from 'bitwise-array';

import type { AdminListContextState } from '../../flowTypes';

const menuItemToValue = (
  fieldVariant: 'booleanField' | 'enumField' | 'enumArrayField',
  item: string,
): string | boolean => {
  if (fieldVariant === 'booleanField') {
    return item === 'all' ? item : item === 'true';
  }
  return item.trim();
};

const composeFilters = (
  state: AdminListContextState,
  dispatch: Function,
  classes: { [key: string]: string },
) => {
  const { filters, masks } = state;
  if (!Object.keys(filters)) return null;
  return (
    <>
      {Object.keys(filters).map(key => {
        // $FlowFixMe
        const { enumeration, fieldVariant, value } = filters[key];
        if (!masks[key]) return null;
        if (fieldVariant === 'booleanField' && masks[key].count() === 1) return null;
        if (masks[key].count() === 1) return null;
        const menuItems =
          fieldVariant === 'booleanField'
            ? ['all', 'false', 'true']
            : // use non-breaking space instead empty string to correct show empty row in Select
              ['all', ...masks[key].select(['\u00A0', ...enumeration])];
        const currentValue =
          // $FlowFixMe
          fieldVariant === 'booleanField' || value === 'all' ? value : value.select(enumeration)[0];
        return (
          <FormControl key={key} className={classes.formControl}>
            <InputLabel className={classes.inputLabel} htmlFor={`${key}-filter`} shrink>
              {key}
            </InputLabel>
            <Select
              value={currentValue}
              inputProps={{
                name: key,
              }}
              name={`${key}-filter`}
              onChange={({ target: { value: newValue } }) => {
                if (newValue !== currentValue) {
                  if (fieldVariant === 'booleanField' || newValue === 'all') {
                    dispatch({ type: 'FILTER', value: { [key]: newValue } });
                  } else {
                    const newValue2 = newValue
                      ? createBitwiseArray([newValue], enumeration)
                      : createBitwiseArray(enumeration.length);
                    dispatch({ type: 'FILTER', value: { [key]: newValue2 } });
                  }
                }
              }}
            >
              {menuItems.map(item => (
                <MenuItem key={item} value={menuItemToValue(fieldVariant, item)}>
                  {item}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        );
      })}
    </>
  );
};

export default composeFilters;
