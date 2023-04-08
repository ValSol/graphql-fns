/* eslint-env jest */

import type { EntityConfig } from '../../../tsTypes';

import addIdsToEntity from './index';

describe('addIdsToEntity', () => {
  test('shoud replace _ids by ids', () => {
    const embedded3Config: EntityConfig = {
      name: 'Embedded3',
      type: 'embedded',
      textFields: [
        {
          name: 'textField3',
        },
      ],
    };

    const embedded2Config: EntityConfig = {
      name: 'Embedded2',
      type: 'embedded',
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

    const embedded1Config: EntityConfig = {
      name: 'Embedded1',
      type: 'embedded',
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

    const entityConfig: EntityConfig = {
      name: 'Example',
      type: 'tangible',
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

    const data = {
      _id: '0',
      textField: 'textField TEXT',

      embedded1: {
        _id: '1',
        textField1: 'textField1 TEXT',
        embedded2: {
          _id: '2',
          textField2: 'textField2 TEXT',
          embedded3: [
            {
              _id: '3-0',
              textField3: 'textField3 TEXT-0',
            },
            {
              _id: '3-1',
              textField3: 'textField3 TEXT-1',
            },
          ],
        },
      },
    };

    const result = addIdsToEntity(data, entityConfig);
    const expectedResult = {
      id: '0',
      textField: 'textField TEXT',

      embedded1: {
        id: '1',
        textField1: 'textField1 TEXT',
        embedded2: {
          id: '2',
          textField2: 'textField2 TEXT',
          embedded3: [
            {
              id: '3-0',
              textField3: 'textField3 TEXT-0',
            },
            {
              id: '3-1',
              textField3: 'textField3 TEXT-1',
            },
          ],
        },
      },
    };
    expect(result).toEqual(expectedResult);
  });

  test('shoud replace _ids by ids in fileFields', () => {
    const imageConfig: EntityConfig = {
      name: 'Image',
      type: 'file',
      textFields: [
        {
          name: 'fileId',
        },
        {
          name: 'desktop',
        },
        {
          name: 'tablet',
        },
        {
          name: 'mobile',
        },
      ],
    };
    const exampleConfig: EntityConfig = {
      name: 'Example',
      type: 'tangible',
      fileFields: [
        {
          name: 'logo',
          config: imageConfig,
        },
        {
          name: 'photos',
          array: true,
          config: imageConfig,
        },
      ],
    };

    const data = {
      _id: '0',
      textField: 'textField TEXT',

      logo: {
        _id: '1',
        desktop: '/logo_desktop',
        tablet: '/logo_tablet',
        mobile: '/logo_mobile',
      },
      photos: [
        {
          _id: '2-1',
          desktop: '/poto_1_desktop',
          tablet: '/poto_1_tablet',
          mobile: '/poto_1_mobile',
        },
        {
          _id: '2-2',
          desktop: '/poto_2_desktop',
          tablet: '/poto_2_tablet',
          mobile: '/poto_2_mobile',
        },
      ],
    };

    const result = addIdsToEntity(data, exampleConfig);
    const expectedResult = {
      id: '0',
      textField: 'textField TEXT',

      logo: {
        id: '1',
        desktop: '/logo_desktop',
        tablet: '/logo_tablet',
        mobile: '/logo_mobile',
      },
      photos: [
        {
          id: '2-1',
          desktop: '/poto_1_desktop',
          tablet: '/poto_1_tablet',
          mobile: '/poto_1_mobile',
        },
        {
          id: '2-2',
          desktop: '/poto_2_desktop',
          tablet: '/poto_2_tablet',
          mobile: '/poto_2_mobile',
        },
      ],
    };
    expect(result).toEqual(expectedResult);
  });
});
