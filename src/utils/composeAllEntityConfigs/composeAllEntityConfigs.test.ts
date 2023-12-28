/* eslint-env jest */
import type {
  FileEntityConfig,
  SimplifiedEmbeddedEntityConfig,
  SimplifiedFileEntityConfig,
  SimplifiedTangibleEntityConfig,
  TangibleEntityConfig,
} from '../../tsTypes';

import composeAllEntityConfigs from '.';
import PageInfo from './pageInfoConfig';

describe('composeAllEntityConfigs', () => {
  test('compose simple allEntityConfigs', () => {
    const simplifiedEntityConfig: SimplifiedTangibleEntityConfig = {
      name: 'Example',

      interfaces: ['ExampleInterface'],

      uniqueCompoundIndexes: [['intField', 'floatField']],

      intFields: [
        {
          name: 'intField',
        },
        {
          name: 'intFields',
          array: true,
        },
      ],
      floatFields: [
        {
          name: 'floatField',
        },
        {
          name: 'floatFields',
          array: true,
        },
      ],
    };

    // const exampleConfig = { ...simplifiedEntityConfig, type: 'tangible' };

    const exampleConfig: TangibleEntityConfig = {
      name: 'Example',
      type: 'tangible',

      interfaces: ['ExampleInterface'],

      intFields: [
        {
          name: 'intField',
          type: 'intFields',
        },
        {
          name: 'intFields',
          type: 'intFields',
          array: true,
        },
      ],
      floatFields: [
        {
          name: 'floatField',
          type: 'floatFields',
        },
        {
          name: 'floatFields',
          array: true,
          type: 'floatFields',
        },
      ],

      uniqueCompoundIndexes: [['intField', 'floatField']],
    };

    const exampleEdgeConfig = {
      name: 'ExampleEdge',
      descendantNameSlicePosition: -'Edge'.length,

      type: 'virtual',

      childFields: [{ name: 'node', config: exampleConfig, required: true, type: 'childFields' }],

      textFields: [{ name: 'cursor', required: true, type: 'textFields' }],
    };

    const exampleConnectionConfig = {
      name: 'ExampleConnection',
      type: 'virtual',
      descendantNameSlicePosition: -'Connection'.length,

      childFields: [
        { name: 'pageInfo', config: PageInfo, required: true, type: 'childFields' },
        { name: 'edges', config: exampleEdgeConfig, array: true, type: 'childFields' },
      ],
    };

    const simplifiedAllEntityConfigs = [simplifiedEntityConfig];

    const result = composeAllEntityConfigs(simplifiedAllEntityConfigs);
    const expectedResult = {
      PageInfo,
      Example: exampleConfig,
      ExampleEdge: exampleEdgeConfig,
      ExampleConnection: exampleConnectionConfig,
    };
    expect(result).toEqual(expectedResult);
  });

  test('compose duplex fields allEntityConfigs', () => {
    const simplifiedEntityConfig: SimplifiedTangibleEntityConfig = {
      name: 'Example',
      type: 'tangible',
      duplexFields: [
        {
          name: 'duplexField',
          configName: 'Example',
          oppositeName: 'duplexFields',
        },
        {
          name: 'duplexFields',
          array: true,
          configName: 'Example',
          oppositeName: 'duplexField',
        },
      ],
    };

    const simplifiedAllEntityConfigs = [simplifiedEntityConfig];

    const entityConfig = {} as TangibleEntityConfig;
    Object.assign(entityConfig, {
      name: 'Example',
      type: 'tangible',
      duplexFields: [
        {
          name: 'duplexField',
          config: entityConfig,
          oppositeName: 'duplexFields',
          type: 'duplexFields',
        },
        {
          name: 'duplexFields',
          array: true,
          config: entityConfig,
          oppositeName: 'duplexField',
          type: 'duplexFields',
        },
      ],
    });

    const exampleEdgeConfig = {
      name: 'ExampleEdge',
      type: 'virtual',
      descendantNameSlicePosition: -'Edge'.length,

      childFields: [{ name: 'node', config: entityConfig, required: true, type: 'childFields' }],

      textFields: [{ name: 'cursor', required: true, type: 'textFields' }],
    };

    const exampleConnectionConfig = {
      name: 'ExampleConnection',
      type: 'virtual',
      descendantNameSlicePosition: -'Connection'.length,

      childFields: [
        { name: 'pageInfo', config: PageInfo, required: true, type: 'childFields' },
        { name: 'edges', config: exampleEdgeConfig, array: true, type: 'childFields' },
      ],
    };

    const expectedResult = {
      PageInfo,
      Example: entityConfig,
      ExampleEdge: exampleEdgeConfig,
      ExampleConnection: exampleConnectionConfig,
    };

    const result = composeAllEntityConfigs(simplifiedAllEntityConfigs);
    expect(result).toEqual(expectedResult);
  });

  test('compose relation fields allEntityConfigs', () => {
    const simplifiedEntityConfig: SimplifiedTangibleEntityConfig = {
      name: 'Example',
      type: 'tangible',
      textFields: [{ name: 'textField' }],
      relationalFields: [
        {
          name: 'relationalField',
          oppositeName: 'relationalFields',
          configName: 'Example',
        },
        {
          name: 'relationalField2',
          oppositeName: 'relationalFields2',
          configName: 'Example2',
        },
      ],
    };

    const simplifiedEntityConfig2: SimplifiedTangibleEntityConfig = {
      name: 'Example2',
      type: 'tangible',
      textFields: [{ name: 'textField2' }],
    };

    const simplifiedAllEntityConfigs = [simplifiedEntityConfig, simplifiedEntityConfig2];

    const entityConfig = {} as TangibleEntityConfig;
    const entityConfig2 = {} as TangibleEntityConfig;
    Object.assign(entityConfig, {
      name: 'Example',
      type: 'tangible',
      textFields: [{ name: 'textField', type: 'textFields' }],
      relationalFields: [
        {
          name: 'relationalField',
          oppositeName: 'relationalFields',
          config: entityConfig,
          type: 'relationalFields',
        },
        {
          name: 'relationalField2',
          oppositeName: 'relationalFields2',
          config: entityConfig2,
          type: 'relationalFields',
        },
        {
          name: 'relationalFields',
          oppositeName: 'relationalField',
          config: entityConfig,
          array: true,
          parent: true,
          type: 'relationalFields',
        },
      ],
    });

    const exampleEdgeConfig = {
      name: 'ExampleEdge',
      type: 'virtual',
      descendantNameSlicePosition: -'Edge'.length,

      childFields: [{ name: 'node', config: entityConfig, required: true, type: 'childFields' }],

      textFields: [{ name: 'cursor', required: true, type: 'textFields' }],
    };

    const exampleConnectionConfig = {
      name: 'ExampleConnection',
      type: 'virtual',
      descendantNameSlicePosition: -'Connection'.length,

      childFields: [
        { name: 'pageInfo', config: PageInfo, required: true, type: 'childFields' },
        { name: 'edges', config: exampleEdgeConfig, array: true, type: 'childFields' },
      ],
    };

    Object.assign(entityConfig2, {
      name: 'Example2',
      type: 'tangible',
      textFields: [{ name: 'textField2', type: 'textFields' }],
      relationalFields: [
        {
          name: 'relationalFields2',
          oppositeName: 'relationalField2',
          config: entityConfig,
          array: true,
          parent: true,
          type: 'relationalFields',
        },
      ],
    });

    const exampleEdgeConfig2 = {
      name: 'Example2Edge',
      type: 'virtual',
      descendantNameSlicePosition: -'Edge'.length,

      childFields: [{ name: 'node', config: entityConfig2, required: true, type: 'childFields' }],

      textFields: [{ name: 'cursor', required: true, type: 'textFields' }],
    };

    const exampleConnectionConfig2 = {
      name: 'Example2Connection',
      type: 'virtual',
      descendantNameSlicePosition: -'Connection'.length,

      childFields: [
        { name: 'pageInfo', config: PageInfo, required: true, type: 'childFields' },
        { name: 'edges', config: exampleEdgeConfig2, array: true, type: 'childFields' },
      ],
    };

    const expectedResult = {
      PageInfo,
      Example: entityConfig,
      ExampleEdge: exampleEdgeConfig,
      ExampleConnection: exampleConnectionConfig,
      Example2: entityConfig2,
      Example2Edge: exampleEdgeConfig2,
      Example2Connection: exampleConnectionConfig2,
    };

    const result = composeAllEntityConfigs(simplifiedAllEntityConfigs);
    expect(result).toEqual(expectedResult);
  });

  test('compose file fields allEntityConfigs', () => {
    const simplifiedEntityConfig: SimplifiedTangibleEntityConfig = {
      name: 'Example',
      type: 'tangible',

      interfaces: ['ExampleInterface'],

      textFields: [
        {
          name: 'textField',
        },
      ],
      fileFields: [
        {
          name: 'logo',
          configName: 'Image',
        },
        {
          name: 'pictures',
          configName: 'Image',
          array: true,
        },
      ],
    };

    const simplifiedImageConfig: SimplifiedFileEntityConfig = {
      name: 'Image',
      type: 'file',

      interfaces: ['FileInterface'],

      textFields: [
        {
          name: 'fileId',
          freeze: true,
        },
        {
          name: 'address',
          freeze: true,
        },
        {
          name: 'title',
        },
      ],
    };

    const simplifiedAllEntityConfigs = [simplifiedEntityConfig, simplifiedImageConfig];

    const imageConfig: FileEntityConfig = {
      name: 'Image',
      type: 'file',

      interfaces: ['FileInterface'],

      textFields: [
        {
          name: 'fileId',
          freeze: true,
          type: 'textFields',
        },
        {
          name: 'address',
          freeze: true,
          type: 'textFields',
        },
        {
          name: 'title',
          type: 'textFields',
        },
      ],
    };

    const imageEdgeConfig = {
      name: 'ImageEdge',
      type: 'virtual',
      descendantNameSlicePosition: -'Edge'.length,

      childFields: [{ name: 'node', config: imageConfig, required: true, type: 'childFields' }],

      textFields: [{ name: 'cursor', required: true, type: 'textFields' }],
    };

    const imageConnectionConfig = {
      name: 'ImageConnection',
      type: 'virtual',
      descendantNameSlicePosition: -'Connection'.length,

      childFields: [
        { name: 'pageInfo', config: PageInfo, required: true, type: 'childFields' },
        { name: 'edges', config: imageEdgeConfig, array: true, type: 'childFields' },
      ],
    };

    const tangibleImageConfig = {
      name: 'TangibleImage',
      type: 'tangibleFile',
      textFields: [
        {
          name: 'fileId',
          freeze: true,
          type: 'textFields',
        },
        {
          name: 'address',
          freeze: true,
          type: 'textFields',
        },
      ],
    };

    const entityConfig = {
      name: 'Example',
      type: 'tangible',

      interfaces: ['ExampleInterface'],

      textFields: [
        {
          name: 'textField',
          type: 'textFields',
        },
      ],
      fileFields: [
        {
          name: 'logo',
          config: imageConfig,
          type: 'fileFields',
        },
        {
          name: 'pictures',
          config: imageConfig,
          array: true,
          type: 'fileFields',
          variants: ['plain'],
        },
      ],
    };

    const exampleEdgeConfig = {
      name: 'ExampleEdge',
      type: 'virtual',
      descendantNameSlicePosition: -'Edge'.length,

      childFields: [{ name: 'node', config: entityConfig, required: true, type: 'childFields' }],

      textFields: [{ name: 'cursor', required: true, type: 'textFields' }],
    };

    const exampleConnectionConfig = {
      name: 'ExampleConnection',
      type: 'virtual',
      descendantNameSlicePosition: -'Connection'.length,

      childFields: [
        { name: 'pageInfo', config: PageInfo, required: true, type: 'childFields' },
        { name: 'edges', config: exampleEdgeConfig, array: true, type: 'childFields' },
      ],
    };

    const tangibleImageEdgeConfig = {
      name: 'TangibleImageEdge',
      type: 'virtual',
      descendantNameSlicePosition: -'Edge'.length,

      childFields: [
        { name: 'node', config: tangibleImageConfig, required: true, type: 'childFields' },
      ],

      textFields: [{ name: 'cursor', required: true, type: 'textFields' }],
    };

    const tangibleImageConnectionConfig = {
      name: 'TangibleImageConnection',
      type: 'virtual',
      descendantNameSlicePosition: -'Connection'.length,

      childFields: [
        { name: 'pageInfo', config: PageInfo, required: true, type: 'childFields' },
        { name: 'edges', config: tangibleImageEdgeConfig, array: true, type: 'childFields' },
      ],
    };

    const expectedResult = {
      PageInfo,
      Example: entityConfig,
      ExampleEdge: exampleEdgeConfig,
      ExampleConnection: exampleConnectionConfig,
      Image: imageConfig,
      ImageEdge: imageEdgeConfig,
      ImageConnection: imageConnectionConfig,
      TangibleImage: tangibleImageConfig,
      TangibleImageEdge: tangibleImageEdgeConfig,
      TangibleImageConnection: tangibleImageConnectionConfig,
    };

    const result = composeAllEntityConfigs(simplifiedAllEntityConfigs);
    expect(result).toEqual(expectedResult);
  });

  test('compose allEntityConfigs from lingua usecase', () => {
    const simplifiedUserConfig: SimplifiedTangibleEntityConfig = {
      name: 'User',

      textFields: [
        { name: 'email', required: true, index: true },
        { name: 'hash', required: true },
      ],

      enumFields: [{ name: 'roles', enumName: 'Roles', array: true, index: true }],
    };

    const simplifiedTextbookConfig: SimplifiedTangibleEntityConfig = {
      name: 'Textbook',

      textFields: [{ name: 'title', required: true }],

      embeddedFields: [{ name: 'studyRules', configName: 'DifficultyLevelCount', required: true }],

      relationalFields: [
        {
          name: 'user',
          oppositeName: 'textbooks',
          configName: 'User',
          required: true,
          index: true,
        },
      ],
    };

    const simplifiedLessonConfig: SimplifiedTangibleEntityConfig = {
      name: 'Lesson',

      booleanFields: [{ name: 'ready', index: true }],

      textFields: [
        { name: 'title', required: true },
        // "original", "interpretation" & "wordRelations" arrays must have equal length
        { name: 'original', required: true, array: true },
        { name: 'interpretation', required: true, array: true },
        { name: 'wordIndex', required: true },
      ],

      enumFields: [{ name: 'difficultyLevel', enumName: 'DifficultyLevels', required: true }],

      embeddedFields: [
        { name: 'failureCount', configName: 'DifficultyLevelCount', required: true },
        { name: 'successCount', configName: 'DifficultyLevelCount', required: true },
      ],

      relationalFields: [
        {
          name: 'textbook',
          oppositeName: 'lessons',
          configName: 'Textbook',
          required: true,
          index: true,
        },
      ],
    };

    const simplifiedDifficultyLevelCountConfig: SimplifiedEmbeddedEntityConfig = {
      name: 'DifficultyLevelCount',
      type: 'embedded',

      intFields: [
        // all field names dirctly correspond to "difficultyLevels" items
        { name: 'Initial', required: true },
        { name: 'ByFirstLetters', required: true },
        { name: 'PlaceholdersInsteadOfWords', required: true },
        { name: 'NoPlaceholders', required: true },
        { name: 'NoHints', required: true },
      ],
    };

    const simplifiedAllEntityConfigs = [
      simplifiedLessonConfig,
      simplifiedTextbookConfig,
      simplifiedUserConfig,
      simplifiedDifficultyLevelCountConfig,
    ];

    const difficultyLevelCountConfig = {
      name: 'DifficultyLevelCount',
      type: 'embedded',

      intFields: [
        {
          name: 'Initial',
          required: true,
          type: 'intFields',
        },
        {
          name: 'ByFirstLetters',
          required: true,
          type: 'intFields',
        },
        {
          name: 'PlaceholdersInsteadOfWords',
          required: true,
          type: 'intFields',
        },
        {
          name: 'NoPlaceholders',
          required: true,
          type: 'intFields',
        },
        {
          name: 'NoHints',
          required: true,
          type: 'intFields',
        },
      ],
    };

    const difficultyLevelCountEdgeConfig = {
      name: 'DifficultyLevelCountEdge',
      type: 'virtual',
      descendantNameSlicePosition: -'Edge'.length,

      childFields: [
        { name: 'node', config: difficultyLevelCountConfig, required: true, type: 'childFields' },
      ],

      textFields: [{ name: 'cursor', required: true, type: 'textFields' }],
    };

    const difficultyLevelCountConnectionConfig = {
      name: 'DifficultyLevelCountConnection',
      type: 'virtual',
      descendantNameSlicePosition: -'Connection'.length,

      childFields: [
        { name: 'pageInfo', config: PageInfo, required: true, type: 'childFields' },
        { name: 'edges', config: difficultyLevelCountEdgeConfig, array: true, type: 'childFields' },
      ],
    };

    const userConfig = {} as TangibleEntityConfig;
    const textbookConfig = {} as TangibleEntityConfig;
    const lessonConfig = {} as TangibleEntityConfig;

    Object.assign(userConfig, {
      name: 'User',
      type: 'tangible',

      textFields: [
        { name: 'email', required: true, index: true, type: 'textFields' },
        { name: 'hash', required: true, type: 'textFields' },
      ],

      enumFields: [
        { name: 'roles', enumName: 'Roles', array: true, index: true, type: 'enumFields' },
      ],

      relationalFields: [
        {
          name: 'textbooks',
          oppositeName: 'user',
          config: textbookConfig,
          array: true,
          parent: true,
          type: 'relationalFields',
        },
      ],
    });

    Object.assign(textbookConfig, {
      name: 'Textbook',
      type: 'tangible',

      textFields: [{ name: 'title', required: true, type: 'textFields' }],

      embeddedFields: [
        {
          name: 'studyRules',
          config: difficultyLevelCountConfig,
          required: true,
          type: 'embeddedFields',
        },
      ],

      relationalFields: [
        {
          name: 'user',
          oppositeName: 'textbooks',
          config: userConfig,
          required: true,
          index: true,
          type: 'relationalFields',
        },
        {
          name: 'lessons',
          oppositeName: 'textbook',
          config: lessonConfig,
          array: true,
          parent: true,
          type: 'relationalFields',
        },
      ],
    });

    Object.assign(lessonConfig, {
      name: 'Lesson',
      type: 'tangible',

      booleanFields: [{ name: 'ready', index: true, type: 'booleanFields' }],

      textFields: [
        { name: 'title', required: true, type: 'textFields' },
        // "original", "interpretation" & "wordRelations" arrays must have equal length
        { name: 'original', required: true, array: true, type: 'textFields' },
        { name: 'interpretation', required: true, array: true, type: 'textFields' },
        { name: 'wordIndex', required: true, type: 'textFields' },
      ],

      enumFields: [
        {
          name: 'difficultyLevel',
          enumName: 'DifficultyLevels',
          required: true,
          type: 'enumFields',
        },
      ],

      embeddedFields: [
        {
          name: 'failureCount',
          config: difficultyLevelCountConfig,
          required: true,
          type: 'embeddedFields',
        },
        {
          name: 'successCount',
          config: difficultyLevelCountConfig,
          required: true,
          type: 'embeddedFields',
        },
      ],

      relationalFields: [
        {
          name: 'textbook',
          oppositeName: 'lessons',
          config: textbookConfig,
          required: true,
          index: true,
          type: 'relationalFields',
        },
      ],
    });

    const userEdgeConfig = {
      name: 'UserEdge',
      type: 'virtual',
      descendantNameSlicePosition: -'Edge'.length,

      childFields: [{ name: 'node', config: userConfig, required: true, type: 'childFields' }],

      textFields: [{ name: 'cursor', required: true, type: 'textFields' }],
    };

    const userConnectionConfig = {
      name: 'UserConnection',
      type: 'virtual',
      descendantNameSlicePosition: -'Connection'.length,

      childFields: [
        { name: 'pageInfo', config: PageInfo, required: true, type: 'childFields' },
        { name: 'edges', config: userEdgeConfig, array: true, type: 'childFields' },
      ],
    };

    const textbookEdgeConfig = {
      name: 'TextbookEdge',
      type: 'virtual',
      descendantNameSlicePosition: -'Edge'.length,

      childFields: [{ name: 'node', config: textbookConfig, required: true, type: 'childFields' }],

      textFields: [{ name: 'cursor', required: true, type: 'textFields' }],
    };

    const textConnectionConfig = {
      name: 'TextbookConnection',
      type: 'virtual',
      descendantNameSlicePosition: -'Connection'.length,

      childFields: [
        { name: 'pageInfo', config: PageInfo, required: true, type: 'childFields' },
        { name: 'edges', config: textbookEdgeConfig, array: true, type: 'childFields' },
      ],
    };

    const lessonEdgeConfig = {
      name: 'LessonEdge',
      type: 'virtual',
      descendantNameSlicePosition: -'Edge'.length,

      childFields: [{ name: 'node', config: lessonConfig, required: true, type: 'childFields' }],

      textFields: [{ name: 'cursor', required: true, type: 'textFields' }],
    };

    const lessonConnectionConfig = {
      name: 'LessonConnection',
      type: 'virtual',
      descendantNameSlicePosition: -'Connection'.length,

      childFields: [
        { name: 'pageInfo', config: PageInfo, required: true, type: 'childFields' },
        { name: 'edges', config: lessonEdgeConfig, array: true, type: 'childFields' },
      ],
    };

    const expectedResult = {
      PageInfo,
      User: userConfig,
      Textbook: textbookConfig,
      Lesson: lessonConfig,
      UserEdge: userEdgeConfig,
      UserConnection: userConnectionConfig,
      TextbookEdge: textbookEdgeConfig,
      TextbookConnection: textConnectionConfig,
      LessonEdge: lessonEdgeConfig,
      LessonConnection: lessonConnectionConfig,
      DifficultyLevelCount: difficultyLevelCountConfig,
      DifficultyLevelCountEdge: difficultyLevelCountEdgeConfig,
      DifficultyLevelCountConnection: difficultyLevelCountConnectionConfig,
    };

    const result = composeAllEntityConfigs(simplifiedAllEntityConfigs);
    expect(result).toEqual(expectedResult);
  });

  test('compose allEntityConfigs with short lingua usecase', () => {
    const simplifiedUserConfig: SimplifiedTangibleEntityConfig = {
      name: 'User',

      textFields: [
        { name: 'email', required: true, index: true },
        { name: 'hash', required: true },
      ],
    };

    const simplifiedTextbookConfig: SimplifiedTangibleEntityConfig = {
      name: 'Textbook',

      textFields: [{ name: 'title', required: true }],

      relationalFields: [
        {
          name: 'user',
          oppositeName: 'textbooks',
          configName: 'User',
          required: true,
          index: true,
        },
      ],
    };

    const simplifiedAllEntityConfigs = [simplifiedUserConfig, simplifiedTextbookConfig];

    const userConfig = {} as TangibleEntityConfig;
    const textbookConfig = {} as TangibleEntityConfig;

    Object.assign(userConfig, {
      name: 'User',
      type: 'tangible',

      textFields: [
        { name: 'email', required: true, index: true, type: 'textFields' },
        { name: 'hash', required: true, type: 'textFields' },
      ],

      relationalFields: [
        {
          name: 'textbooks',
          oppositeName: 'user',
          config: textbookConfig,
          array: true,
          parent: true,
          type: 'relationalFields',
        },
      ],
    });

    Object.assign(textbookConfig, {
      name: 'Textbook',
      type: 'tangible',

      textFields: [{ name: 'title', required: true, type: 'textFields' }],

      relationalFields: [
        {
          name: 'user',
          oppositeName: 'textbooks',
          config: userConfig,
          required: true,
          index: true,
          type: 'relationalFields',
        },
      ],
    });

    const userEdgeConfig = {
      name: 'UserEdge',
      type: 'virtual',
      descendantNameSlicePosition: -'Edge'.length,

      childFields: [{ name: 'node', config: userConfig, required: true, type: 'childFields' }],

      textFields: [{ name: 'cursor', required: true, type: 'textFields' }],
    };

    const userConnectionConfig = {
      name: 'UserConnection',
      type: 'virtual',
      descendantNameSlicePosition: -'Connection'.length,

      childFields: [
        { name: 'pageInfo', config: PageInfo, required: true, type: 'childFields' },
        { name: 'edges', config: userEdgeConfig, array: true, type: 'childFields' },
      ],
    };

    const textbookEdgeConfig = {
      name: 'TextbookEdge',
      type: 'virtual',
      descendantNameSlicePosition: -'Edge'.length,

      childFields: [{ name: 'node', config: textbookConfig, required: true, type: 'childFields' }],

      textFields: [{ name: 'cursor', required: true, type: 'textFields' }],
    };

    const textConnectionConfig = {
      name: 'TextbookConnection',
      type: 'virtual',
      descendantNameSlicePosition: -'Connection'.length,

      childFields: [
        { name: 'pageInfo', config: PageInfo, required: true, type: 'childFields' },
        { name: 'edges', config: textbookEdgeConfig, array: true, type: 'childFields' },
      ],
    };

    const expectedResult = {
      PageInfo,
      User: userConfig,
      Textbook: textbookConfig,
      UserEdge: userEdgeConfig,
      UserConnection: userConnectionConfig,
      TextbookEdge: textbookEdgeConfig,
      TextbookConnection: textConnectionConfig,
    };

    const result = composeAllEntityConfigs(simplifiedAllEntityConfigs);
    expect(result).toEqual(expectedResult);
  });
});
