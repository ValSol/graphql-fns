// @flow

import BitwiseArray, { createBitwiseArray } from 'bitwise-array';

import type { AdminFilters } from '../../flowTypes';

const booleanArr = [false, true];

const decorateItems = (
  items: Array<Object>,
  filters: AdminFilters,
): { decorated: Array<Object>, masks: { [fieldName: string]: BitwiseArray } } => {
  const masks = Object.keys(filters).reduce((prev, key) => {
    // $FlowFixMe
    const { fieldVariant, enumeration: currentEnum } = filters[key];
    if (fieldVariant === 'booleanField') {
      prev[key] = createBitwiseArray(booleanArr, []); // eslint-disable-line no-param-reassign
    } else {
      prev[key] = createBitwiseArray([...currentEnum, ''], []); // eslint-disable-line no-param-reassign
    }
    return prev;
  }, {});

  const decorated = items.reduce((prev, item) => {
    const { id } = item;
    const decoratedItem = { id };
    Object.keys(filters).forEach((key) => {
      // $FlowFixMe
      const { fieldVariant, enumeration: currentEnum } = filters[key];
      switch (fieldVariant) {
        case 'booleanField':
          decoratedItem[key] = !!item[key];

          // eslint-disable-next-line no-unused-expressions
          masks[key] = decoratedItem[key]
            ? masks[key].or(createBitwiseArray(booleanArr, [true]))
            : masks[key].or(createBitwiseArray(booleanArr, [false]));

          break;

        case 'enumField':
          decoratedItem[key] = item[key]
            ? createBitwiseArray(currentEnum, [item[key]])
            : createBitwiseArray(currentEnum.length);

          // eslint-disable-next-line no-unused-expressions
          masks[key] = decoratedItem[key].count()
            ? masks[key].or(createBitwiseArray(['', ...currentEnum], [item[key]]))
            : masks[key].or(createBitwiseArray(['', ...currentEnum], ['']));

          break;

        case 'enumArrayField':
          decoratedItem[key] = item[key]
            ? createBitwiseArray(currentEnum, item[key]) // item[key] is array
            : createBitwiseArray(currentEnum.length); // item[key] is NOT array, but empty string

          // eslint-disable-next-line no-unused-expressions
          masks[key] = decoratedItem[key].count()
            ? masks[key].or(createBitwiseArray(['', ...currentEnum], item[key]))
            : masks[key].or(createBitwiseArray(['', ...currentEnum], ['']));

          break;

        default:
          throw new TypeError(`Invalid filtered field type: "${fieldVariant}"`);
      }
    });
    prev.push(decoratedItem);
    return prev;
  }, []);

  return { decorated, masks };
};

export default decorateItems;
