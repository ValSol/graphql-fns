// @flow
/* eslint-env jest */

import type {
  GeneralConfig,
  Inventory,
  ActionSignatureMethods,
  DerivativeAttributes,
  ObjectSignatureMethods,
  ThingConfig,
} from '../flowTypes';

import composeGqlTypes from './composeGqlTypes';

describe('composeGqlTypes', () => {
  test('should create things types for one thing', () => {
    const menuCloneConfig: ThingConfig = {};
    const menuSectionConfig: ThingConfig = {};
    const menuCloneSectionConfig: ThingConfig = {};
    const menuConfig: ThingConfig = {
      name: 'Menu',

      textFields: [
        {
          name: 'name',
          required: true,
        },
      ],

      duplexFields: [
        {
          name: 'clone',
          oppositeName: 'original',
          config: menuCloneConfig,
          parent: true,
        },

        {
          name: 'sections',
          oppositeName: 'menu',
          array: true,
          config: menuSectionConfig,
          parent: true,
        },
      ],
    };

    Object.assign(menuCloneConfig, {
      name: 'MenuClone',

      textFields: [
        {
          name: 'name',
          required: true,
        },
      ],

      duplexFields: [
        {
          name: 'original',
          oppositeName: 'clone',
          config: menuConfig,
        },

        {
          name: 'sections',
          oppositeName: 'menu',
          array: true,
          config: menuCloneSectionConfig,
          parent: true,
        },
      ],
    });

    Object.assign(menuSectionConfig, {
      name: 'MenuSection',

      textFields: [
        {
          name: 'name',
          required: true,
        },
      ],

      duplexFields: [
        {
          name: 'menu',
          oppositeName: 'sections',
          config: menuConfig,
        },
      ],
    });

    Object.assign(menuCloneSectionConfig, {
      name: 'MenuCloneSection',

      textFields: [
        {
          name: 'name',
          required: true,
        },
      ],

      duplexFields: [
        {
          name: 'menu',
          oppositeName: 'sections',
          config: menuCloneConfig,
        },
      ],
    });

    const thingConfigs = {
      Menu: menuConfig,
      MenuClone: menuCloneConfig,
      MenuSection: menuSectionConfig,
      MenuCloneSection: menuCloneSectionConfig,
    };

    const generalConfig: GeneralConfig = { thingConfigs };

    const expectedResult = `scalar DateTime
scalar Upload
input RegExp {
  pattern: String!
  flags: String
}
input SliceInput {
  begin: Int
  end: Int
}
type Menu {
  id: ID!
  createdAt: DateTime!
  updatedAt: DateTime!
  name: String!
  clone: MenuClone
  sections(where: MenuSectionWhereInput, sort: MenuSectionSortInput, pagination: PaginationInput): [MenuSection!]!
}
type MenuClone {
  id: ID!
  createdAt: DateTime!
  updatedAt: DateTime!
  name: String!
  original: Menu
  sections(where: MenuCloneSectionWhereInput, sort: MenuCloneSectionSortInput, pagination: PaginationInput): [MenuCloneSection!]!
}
type MenuSection {
  id: ID!
  createdAt: DateTime!
  updatedAt: DateTime!
  name: String!
  menu: Menu
}
type MenuCloneSection {
  id: ID!
  createdAt: DateTime!
  updatedAt: DateTime!
  name: String!
  menu: MenuClone
}
input MenuSectionWhereInput {
  id_in: [ID!]
  id_nin: [ID!]
  createdAt_in: [DateTime!]
  createdAt_nin: [DateTime!]
  createdAt_ne: DateTime
  createdAt_gt: DateTime
  createdAt_gte: DateTime
  createdAt_lt: DateTime
  createdAt_lte: DateTime
  updatedAt_in: [DateTime!]
  updatedAt_nin: [DateTime!]
  updatedAt_ne: DateTime
  updatedAt_gt: DateTime
  updatedAt_gte: DateTime
  updatedAt_lt: DateTime
  updatedAt_lte: DateTime
  AND: [MenuSectionWhereInput!]
  NOR: [MenuSectionWhereInput!]
  OR: [MenuSectionWhereInput!]
}
input MenuSectionWhereWithoutBooleanOperationsInput {
  id_in: [ID!]
  id_nin: [ID!]
  createdAt_in: [DateTime!]
  createdAt_nin: [DateTime!]
  createdAt_ne: DateTime
  createdAt_gt: DateTime
  createdAt_gte: DateTime
  createdAt_lt: DateTime
  createdAt_lte: DateTime
  updatedAt_in: [DateTime!]
  updatedAt_nin: [DateTime!]
  updatedAt_ne: DateTime
  updatedAt_gt: DateTime
  updatedAt_gte: DateTime
  updatedAt_lt: DateTime
  updatedAt_lte: DateTime
}
input MenuWhereInput {
  id_in: [ID!]
  id_nin: [ID!]
  createdAt_in: [DateTime!]
  createdAt_nin: [DateTime!]
  createdAt_ne: DateTime
  createdAt_gt: DateTime
  createdAt_gte: DateTime
  createdAt_lt: DateTime
  createdAt_lte: DateTime
  updatedAt_in: [DateTime!]
  updatedAt_nin: [DateTime!]
  updatedAt_ne: DateTime
  updatedAt_gt: DateTime
  updatedAt_gte: DateTime
  updatedAt_lt: DateTime
  updatedAt_lte: DateTime
  AND: [MenuWhereInput!]
  NOR: [MenuWhereInput!]
  OR: [MenuWhereInput!]
}
input MenuWhereWithoutBooleanOperationsInput {
  id_in: [ID!]
  id_nin: [ID!]
  createdAt_in: [DateTime!]
  createdAt_nin: [DateTime!]
  createdAt_ne: DateTime
  createdAt_gt: DateTime
  createdAt_gte: DateTime
  createdAt_lt: DateTime
  createdAt_lte: DateTime
  updatedAt_in: [DateTime!]
  updatedAt_nin: [DateTime!]
  updatedAt_ne: DateTime
  updatedAt_gt: DateTime
  updatedAt_gte: DateTime
  updatedAt_lt: DateTime
  updatedAt_lte: DateTime
}
input MenuCloneWhereInput {
  id_in: [ID!]
  id_nin: [ID!]
  createdAt_in: [DateTime!]
  createdAt_nin: [DateTime!]
  createdAt_ne: DateTime
  createdAt_gt: DateTime
  createdAt_gte: DateTime
  createdAt_lt: DateTime
  createdAt_lte: DateTime
  updatedAt_in: [DateTime!]
  updatedAt_nin: [DateTime!]
  updatedAt_ne: DateTime
  updatedAt_gt: DateTime
  updatedAt_gte: DateTime
  updatedAt_lt: DateTime
  updatedAt_lte: DateTime
  AND: [MenuCloneWhereInput!]
  NOR: [MenuCloneWhereInput!]
  OR: [MenuCloneWhereInput!]
}
input MenuCloneWhereWithoutBooleanOperationsInput {
  id_in: [ID!]
  id_nin: [ID!]
  createdAt_in: [DateTime!]
  createdAt_nin: [DateTime!]
  createdAt_ne: DateTime
  createdAt_gt: DateTime
  createdAt_gte: DateTime
  createdAt_lt: DateTime
  createdAt_lte: DateTime
  updatedAt_in: [DateTime!]
  updatedAt_nin: [DateTime!]
  updatedAt_ne: DateTime
  updatedAt_gt: DateTime
  updatedAt_gte: DateTime
  updatedAt_lt: DateTime
  updatedAt_lte: DateTime
}
input MenuCloneSectionWhereInput {
  id_in: [ID!]
  id_nin: [ID!]
  createdAt_in: [DateTime!]
  createdAt_nin: [DateTime!]
  createdAt_ne: DateTime
  createdAt_gt: DateTime
  createdAt_gte: DateTime
  createdAt_lt: DateTime
  createdAt_lte: DateTime
  updatedAt_in: [DateTime!]
  updatedAt_nin: [DateTime!]
  updatedAt_ne: DateTime
  updatedAt_gt: DateTime
  updatedAt_gte: DateTime
  updatedAt_lt: DateTime
  updatedAt_lte: DateTime
  AND: [MenuCloneSectionWhereInput!]
  NOR: [MenuCloneSectionWhereInput!]
  OR: [MenuCloneSectionWhereInput!]
}
input MenuCloneSectionWhereWithoutBooleanOperationsInput {
  id_in: [ID!]
  id_nin: [ID!]
  createdAt_in: [DateTime!]
  createdAt_nin: [DateTime!]
  createdAt_ne: DateTime
  createdAt_gt: DateTime
  createdAt_gte: DateTime
  createdAt_lt: DateTime
  createdAt_lte: DateTime
  updatedAt_in: [DateTime!]
  updatedAt_nin: [DateTime!]
  updatedAt_ne: DateTime
  updatedAt_gt: DateTime
  updatedAt_gte: DateTime
  updatedAt_lt: DateTime
  updatedAt_lte: DateTime
}
enum MenuSectionSortEnum {
  createdAt_ASC
  createdAt_DESC
  updatedAt_ASC
  updatedAt_DESC
}
input MenuSectionSortInput {
  sortBy: [MenuSectionSortEnum]
}
input PaginationInput {
  skip: Int
  first: Int
}
enum MenuCloneSectionSortEnum {
  createdAt_ASC
  createdAt_DESC
  updatedAt_ASC
  updatedAt_DESC
}
input MenuCloneSectionSortInput {
  sortBy: [MenuCloneSectionSortEnum]
}
input MenuWhereOneInput {
  id: ID!
}
input MenuCloneWhereOneInput {
  id: ID!
}
input MenuSectionWhereOneInput {
  id: ID!
}
input MenuCloneSectionWhereOneInput {
  id: ID!
}
enum MenuSortEnum {
  createdAt_ASC
  createdAt_DESC
  updatedAt_ASC
  updatedAt_DESC
}
input MenuSortInput {
  sortBy: [MenuSortEnum]
}
enum MenuCloneSortEnum {
  createdAt_ASC
  createdAt_DESC
  updatedAt_ASC
  updatedAt_DESC
}
input MenuCloneSortInput {
  sortBy: [MenuCloneSortEnum]
}
enum MenuTextNamesEnum {
  name
}
input MenuDistinctValuesOptionsInput {
  target: MenuTextNamesEnum!
}
enum MenuCloneTextNamesEnum {
  name
}
input MenuCloneDistinctValuesOptionsInput {
  target: MenuCloneTextNamesEnum!
}
enum MenuSectionTextNamesEnum {
  name
}
input MenuSectionDistinctValuesOptionsInput {
  target: MenuSectionTextNamesEnum!
}
enum MenuCloneSectionTextNamesEnum {
  name
}
input MenuCloneSectionDistinctValuesOptionsInput {
  target: MenuCloneSectionTextNamesEnum!
}
input MenuWhereByUniqueInput {
  id_in: [ID!]
}
input MenuCloneWhereByUniqueInput {
  id_in: [ID!]
}
input MenuSectionWhereByUniqueInput {
  id_in: [ID!]
}
input MenuCloneSectionWhereByUniqueInput {
  id_in: [ID!]
}
input MenuCopyWhereOnesInput {
  clone: MenuCloneWhereOneInput
  sections: MenuSectionWhereOneInput
}
enum copyMenuThroughcloneOptionsEnum {
  name
  sections
}
enum copyMenuThroughsectionsOptionsEnum {
  name
}
input copyMenuThroughcloneOptionInput {
  fieldsToCopy: [copyMenuThroughcloneOptionsEnum!]!
}
input copyMenuThroughsectionsOptionInput {
  fieldsToCopy: [copyMenuThroughsectionsOptionsEnum!]!
}
input copyMenuOptionsInput {
  clone: copyMenuThroughcloneOptionInput
  sections: copyMenuThroughsectionsOptionInput
}
input MenuCloneCopyWhereOnesInput {
  original: MenuWhereOneInput
  sections: MenuCloneSectionWhereOneInput
}
enum copyMenuCloneThroughoriginalOptionsEnum {
  name
  sections
}
enum copyMenuCloneThroughsectionsOptionsEnum {
  name
}
input copyMenuCloneThroughoriginalOptionInput {
  fieldsToCopy: [copyMenuCloneThroughoriginalOptionsEnum!]!
}
input copyMenuCloneThroughsectionsOptionInput {
  fieldsToCopy: [copyMenuCloneThroughsectionsOptionsEnum!]!
}
input copyMenuCloneOptionsInput {
  original: copyMenuCloneThroughoriginalOptionInput
  sections: copyMenuCloneThroughsectionsOptionInput
}
input MenuSectionCopyWhereOnesInput {
  menu: MenuWhereOneInput
}
enum copyMenuSectionThroughmenuOptionsEnum {
  name
}
input copyMenuSectionThroughmenuOptionInput {
  fieldsToCopy: [copyMenuSectionThroughmenuOptionsEnum!]!
}
input copyMenuSectionOptionsInput {
  menu: copyMenuSectionThroughmenuOptionInput
}
input MenuSectionWhereOneToCopyInput {
  id: ID!
}
input MenuCloneSectionCopyWhereOnesInput {
  menu: MenuCloneWhereOneInput
}
enum copyMenuCloneSectionThroughmenuOptionsEnum {
  name
}
input copyMenuCloneSectionThroughmenuOptionInput {
  fieldsToCopy: [copyMenuCloneSectionThroughmenuOptionsEnum!]!
}
input copyMenuCloneSectionOptionsInput {
  menu: copyMenuCloneSectionThroughmenuOptionInput
}
input MenuCloneSectionWhereOneToCopyInput {
  id: ID!
}
input MenuCreateInput {
  id: ID
  clone: MenuCloneCreateChildInput
  sections: MenuSectionCreateOrPushChildrenInput
  name: String!
}
input MenuCreateChildInput {
  connect: ID
  create: MenuCreateInput
}
input MenuCreateOrPushChildrenInput {
  connect: [ID!]
  create: [MenuCreateInput!]
  createPositions: [Int!]
}
input MenuCloneCreateInput {
  id: ID
  original: MenuCreateChildInput
  sections: MenuCloneSectionCreateOrPushChildrenInput
  name: String!
}
input MenuCloneCreateChildInput {
  connect: ID
  create: MenuCloneCreateInput
}
input MenuCloneCreateOrPushChildrenInput {
  connect: [ID!]
  create: [MenuCloneCreateInput!]
  createPositions: [Int!]
}
input MenuCloneSectionCreateInput {
  id: ID
  menu: MenuCloneCreateChildInput
  name: String!
}
input MenuCloneSectionCreateChildInput {
  connect: ID
  create: MenuCloneSectionCreateInput
}
input MenuCloneSectionCreateOrPushChildrenInput {
  connect: [ID!]
  create: [MenuCloneSectionCreateInput!]
  createPositions: [Int!]
}
input MenuSectionCreateInput {
  id: ID
  menu: MenuCreateChildInput
  name: String!
}
input MenuSectionCreateChildInput {
  connect: ID
  create: MenuSectionCreateInput
}
input MenuSectionCreateOrPushChildrenInput {
  connect: [ID!]
  create: [MenuSectionCreateInput!]
  createPositions: [Int!]
}
enum deleteMenuWithChildrenOptionsEnum {
  clone
  sections
}
input deleteMenuWithChildrenOptionsInput {
  fieldsToDelete: [deleteMenuWithChildrenOptionsEnum]
}
enum deleteMenuCloneWithChildrenOptionsEnum {
  sections
}
input deleteMenuCloneWithChildrenOptionsInput {
  fieldsToDelete: [deleteMenuCloneWithChildrenOptionsEnum]
}
enum ImportFormatEnum {
  csv
  json
}
input ImportOptionsInput {
  format: ImportFormatEnum
}
input PushIntoMenuInput {
  sections: MenuSectionCreateOrPushChildrenInput
}
input MenuPushPositionsInput {
  sections: [Int!]
}
input PushIntoMenuCloneInput {
  sections: MenuCloneSectionCreateOrPushChildrenInput
}
input MenuClonePushPositionsInput {
  sections: [Int!]
}
input MenuUpdateInput {
  name: String
  clone: MenuCloneCreateChildInput
  sections: MenuSectionCreateOrPushChildrenInput
}
input MenuCloneUpdateInput {
  name: String
  original: MenuCreateChildInput
  sections: MenuCloneSectionCreateOrPushChildrenInput
}
input MenuSectionUpdateInput {
  name: String
  menu: MenuCreateChildInput
}
input MenuCloneSectionUpdateInput {
  name: String
  menu: MenuCloneCreateChildInput
}
enum MenuFieldNamesEnum {
  name
  clone
  sections
}
type UpdatedMenuPayload {
  node: Menu
  previousNode: Menu
  updatedFields: [MenuFieldNamesEnum!]
}
enum MenuCloneFieldNamesEnum {
  name
  original
  sections
}
type UpdatedMenuClonePayload {
  node: MenuClone
  previousNode: MenuClone
  updatedFields: [MenuCloneFieldNamesEnum!]
}
enum MenuSectionFieldNamesEnum {
  name
  menu
}
type UpdatedMenuSectionPayload {
  node: MenuSection
  previousNode: MenuSection
  updatedFields: [MenuSectionFieldNamesEnum!]
}
enum MenuCloneSectionFieldNamesEnum {
  name
  menu
}
type UpdatedMenuCloneSectionPayload {
  node: MenuCloneSection
  previousNode: MenuCloneSection
  updatedFields: [MenuCloneSectionFieldNamesEnum!]
}
type Query {
  childMenu(whereOne: MenuWhereOneInput!): Menu!
  childMenuClone(whereOne: MenuCloneWhereOneInput!): MenuClone!
  childMenuSection(whereOne: MenuSectionWhereOneInput!): MenuSection!
  childMenuCloneSection(whereOne: MenuCloneSectionWhereOneInput!): MenuCloneSection!
  childMenus(where: MenuWhereInput, sort: MenuSortInput, pagination: PaginationInput): [Menu!]!
  childMenuClones(where: MenuCloneWhereInput, sort: MenuCloneSortInput, pagination: PaginationInput): [MenuClone!]!
  childMenuSections(where: MenuSectionWhereInput, sort: MenuSectionSortInput, pagination: PaginationInput): [MenuSection!]!
  childMenuCloneSections(where: MenuCloneSectionWhereInput, sort: MenuCloneSectionSortInput, pagination: PaginationInput): [MenuCloneSection!]!
  MenuCount(where: MenuWhereInput): Int!
  MenuCloneCount(where: MenuCloneWhereInput): Int!
  MenuSectionCount(where: MenuSectionWhereInput): Int!
  MenuCloneSectionCount(where: MenuCloneSectionWhereInput): Int!
  MenuDistinctValues(where: MenuWhereInput, options: MenuDistinctValuesOptionsInput): [String!]!
  MenuCloneDistinctValues(where: MenuCloneWhereInput, options: MenuCloneDistinctValuesOptionsInput): [String!]!
  MenuSectionDistinctValues(where: MenuSectionWhereInput, options: MenuSectionDistinctValuesOptionsInput): [String!]!
  MenuCloneSectionDistinctValues(where: MenuCloneSectionWhereInput, options: MenuCloneSectionDistinctValuesOptionsInput): [String!]!
  Menu(whereOne: MenuWhereOneInput!): Menu!
  MenuClone(whereOne: MenuCloneWhereOneInput!): MenuClone!
  MenuSection(whereOne: MenuSectionWhereOneInput!): MenuSection!
  MenuCloneSection(whereOne: MenuCloneSectionWhereOneInput!): MenuCloneSection!
  Menus(where: MenuWhereInput, sort: MenuSortInput, pagination: PaginationInput): [Menu!]!
  MenuClones(where: MenuCloneWhereInput, sort: MenuCloneSortInput, pagination: PaginationInput): [MenuClone!]!
  MenuSections(where: MenuSectionWhereInput, sort: MenuSectionSortInput, pagination: PaginationInput): [MenuSection!]!
  MenuCloneSections(where: MenuCloneSectionWhereInput, sort: MenuCloneSectionSortInput, pagination: PaginationInput): [MenuCloneSection!]!
  MenusByUnique(where: MenuWhereByUniqueInput!, sort: MenuSortInput): [Menu!]!
  MenuClonesByUnique(where: MenuCloneWhereByUniqueInput!, sort: MenuCloneSortInput): [MenuClone!]!
  MenuSectionsByUnique(where: MenuSectionWhereByUniqueInput!, sort: MenuSectionSortInput): [MenuSection!]!
  MenuCloneSectionsByUnique(where: MenuCloneSectionWhereByUniqueInput!, sort: MenuCloneSectionSortInput): [MenuCloneSection!]!
}
type Mutation {
  copyMenu(whereOnes: MenuCopyWhereOnesInput!, options: copyMenuOptionsInput): Menu!
  copyMenuClone(whereOnes: MenuCloneCopyWhereOnesInput!, options: copyMenuCloneOptionsInput): MenuClone!
  copyMenuSection(whereOnes: MenuSectionCopyWhereOnesInput!, options: copyMenuSectionOptionsInput, whereOne: MenuSectionWhereOneToCopyInput): MenuSection!
  copyMenuCloneSection(whereOnes: MenuCloneSectionCopyWhereOnesInput!, options: copyMenuCloneSectionOptionsInput, whereOne: MenuCloneSectionWhereOneToCopyInput): MenuCloneSection!
  copyMenuWithChildren(whereOnes: MenuCopyWhereOnesInput!, options: copyMenuOptionsInput): Menu!
  copyMenuCloneWithChildren(whereOnes: MenuCloneCopyWhereOnesInput!, options: copyMenuCloneOptionsInput): MenuClone!
  createManyMenus(data: [MenuCreateInput!]!): [Menu!]!
  createManyMenuClones(data: [MenuCloneCreateInput!]!): [MenuClone!]!
  createManyMenuSections(data: [MenuSectionCreateInput!]!): [MenuSection!]!
  createManyMenuCloneSections(data: [MenuCloneSectionCreateInput!]!): [MenuCloneSection!]!
  createMenu(data: MenuCreateInput!): Menu!
  createMenuClone(data: MenuCloneCreateInput!): MenuClone!
  createMenuSection(data: MenuSectionCreateInput!): MenuSection!
  createMenuCloneSection(data: MenuCloneSectionCreateInput!): MenuCloneSection!
  deleteFilteredMenus(where: MenuWhereInput): [Menu!]!
  deleteFilteredMenuClones(where: MenuCloneWhereInput): [MenuClone!]!
  deleteFilteredMenuSections(where: MenuSectionWhereInput): [MenuSection!]!
  deleteFilteredMenuCloneSections(where: MenuCloneSectionWhereInput): [MenuCloneSection!]!
  deleteFilteredMenusReturnScalar(where: MenuWhereInput): Int!
  deleteFilteredMenuClonesReturnScalar(where: MenuCloneWhereInput): Int!
  deleteFilteredMenuSectionsReturnScalar(where: MenuSectionWhereInput): Int!
  deleteFilteredMenuCloneSectionsReturnScalar(where: MenuCloneSectionWhereInput): Int!
  deleteFilteredMenusWithChildren(where: MenuWhereInput, options: deleteMenuWithChildrenOptionsInput): [Menu!]!
  deleteFilteredMenuClonesWithChildren(where: MenuCloneWhereInput, options: deleteMenuCloneWithChildrenOptionsInput): [MenuClone!]!
  deleteFilteredMenusWithChildrenReturnScalar(where: MenuWhereInput, options: deleteMenuWithChildrenOptionsInput): Int!
  deleteFilteredMenuClonesWithChildrenReturnScalar(where: MenuCloneWhereInput, options: deleteMenuCloneWithChildrenOptionsInput): Int!
  deleteManyMenus(whereOne: [MenuWhereOneInput!]!): [Menu!]!
  deleteManyMenuClones(whereOne: [MenuCloneWhereOneInput!]!): [MenuClone!]!
  deleteManyMenuSections(whereOne: [MenuSectionWhereOneInput!]!): [MenuSection!]!
  deleteManyMenuCloneSections(whereOne: [MenuCloneSectionWhereOneInput!]!): [MenuCloneSection!]!
  deleteManyMenusWithChildren(whereOne: [MenuWhereOneInput!]!, options: deleteMenuWithChildrenOptionsInput): [Menu!]!
  deleteManyMenuClonesWithChildren(whereOne: [MenuCloneWhereOneInput!]!, options: deleteMenuCloneWithChildrenOptionsInput): [MenuClone!]!
  deleteMenu(whereOne: MenuWhereOneInput!): Menu!
  deleteMenuClone(whereOne: MenuCloneWhereOneInput!): MenuClone!
  deleteMenuSection(whereOne: MenuSectionWhereOneInput!): MenuSection!
  deleteMenuCloneSection(whereOne: MenuCloneSectionWhereOneInput!): MenuCloneSection!
  deleteMenuWithChildren(whereOne: MenuWhereOneInput!, options: deleteMenuWithChildrenOptionsInput): Menu!
  deleteMenuCloneWithChildren(whereOne: MenuCloneWhereOneInput!, options: deleteMenuCloneWithChildrenOptionsInput): MenuClone!
  importMenus(file: Upload!, options: ImportOptionsInput): [Menu!]!
  importMenuClones(file: Upload!, options: ImportOptionsInput): [MenuClone!]!
  importMenuSections(file: Upload!, options: ImportOptionsInput): [MenuSection!]!
  importMenuCloneSections(file: Upload!, options: ImportOptionsInput): [MenuCloneSection!]!
  pushIntoMenu(whereOne: MenuWhereOneInput!, data: PushIntoMenuInput!, positions: MenuPushPositionsInput): Menu!
  pushIntoMenuClone(whereOne: MenuCloneWhereOneInput!, data: PushIntoMenuCloneInput!, positions: MenuClonePushPositionsInput): MenuClone!
  updateFilteredMenus(where: MenuWhereInput, data: MenuUpdateInput!): [Menu!]!
  updateFilteredMenuClones(where: MenuCloneWhereInput, data: MenuCloneUpdateInput!): [MenuClone!]!
  updateFilteredMenuSections(where: MenuSectionWhereInput, data: MenuSectionUpdateInput!): [MenuSection!]!
  updateFilteredMenuCloneSections(where: MenuCloneSectionWhereInput, data: MenuCloneSectionUpdateInput!): [MenuCloneSection!]!
  updateFilteredMenusReturnScalar(where: MenuWhereInput, data: MenuUpdateInput!): Int!
  updateFilteredMenuClonesReturnScalar(where: MenuCloneWhereInput, data: MenuCloneUpdateInput!): Int!
  updateFilteredMenuSectionsReturnScalar(where: MenuSectionWhereInput, data: MenuSectionUpdateInput!): Int!
  updateFilteredMenuCloneSectionsReturnScalar(where: MenuCloneSectionWhereInput, data: MenuCloneSectionUpdateInput!): Int!
  updateManyMenus(whereOne: [MenuWhereOneInput!]!, data: [MenuUpdateInput!]!): [Menu!]!
  updateManyMenuClones(whereOne: [MenuCloneWhereOneInput!]!, data: [MenuCloneUpdateInput!]!): [MenuClone!]!
  updateManyMenuSections(whereOne: [MenuSectionWhereOneInput!]!, data: [MenuSectionUpdateInput!]!): [MenuSection!]!
  updateManyMenuCloneSections(whereOne: [MenuCloneSectionWhereOneInput!]!, data: [MenuCloneSectionUpdateInput!]!): [MenuCloneSection!]!
  updateMenu(whereOne: MenuWhereOneInput!, data: MenuUpdateInput!): Menu!
  updateMenuClone(whereOne: MenuCloneWhereOneInput!, data: MenuCloneUpdateInput!): MenuClone!
  updateMenuSection(whereOne: MenuSectionWhereOneInput!, data: MenuSectionUpdateInput!): MenuSection!
  updateMenuCloneSection(whereOne: MenuCloneSectionWhereOneInput!, data: MenuCloneSectionUpdateInput!): MenuCloneSection!
}
type Subscription {
  createdMenu(where: MenuWhereInput): Menu!
  updatedMenu(where: MenuWhereInput): UpdatedMenuPayload!
  deletedMenu(where: MenuWhereInput): Menu!
  createdMenuClone(where: MenuCloneWhereInput): MenuClone!
  updatedMenuClone(where: MenuCloneWhereInput): UpdatedMenuClonePayload!
  deletedMenuClone(where: MenuCloneWhereInput): MenuClone!
  createdMenuSection(where: MenuSectionWhereInput): MenuSection!
  updatedMenuSection(where: MenuSectionWhereInput): UpdatedMenuSectionPayload!
  deletedMenuSection(where: MenuSectionWhereInput): MenuSection!
  createdMenuCloneSection(where: MenuCloneSectionWhereInput): MenuCloneSection!
  updatedMenuCloneSection(where: MenuCloneSectionWhereInput): UpdatedMenuCloneSectionPayload!
  deletedMenuCloneSection(where: MenuCloneSectionWhereInput): MenuCloneSection!
}`;

    const result = composeGqlTypes(generalConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should create things types for one thing', () => {
    const imageConfig: ThingConfig = {
      name: 'Image',
      file: true,
      textFields: [
        {
          name: 'fileId',
          required: true,
        },
        {
          name: 'address',
        },
      ],
    };

    const thingConfig: ThingConfig = {
      name: 'Example',

      textFields: [
        {
          name: 'textField1',
          unique: true,
          weight: 1,
        },
        {
          name: 'textField2',
          default: 'default text',
          index: true,
        },
        {
          name: 'textField3',
          required: true,
          index: true,
        },
        {
          name: 'textField4',
          array: true,
        },
        {
          name: 'textField5',
          default: ['default text'],
          required: true,
          array: true,
        },
      ],

      enumFields: [
        {
          name: 'day',
          enumName: 'Weekdays',
          index: true,
        },
        {
          name: 'cuisines',
          array: true,
          enumName: 'Cuisines',
          required: true,
          index: true,
        },
      ],

      fileFields: [
        {
          name: 'logo',
          config: imageConfig,
          required: true,
        },
        {
          name: 'hero',
          config: imageConfig,
        },
        {
          name: 'pictures',
          config: imageConfig,
          array: true,
          required: true,
        },
        {
          name: 'photos',
          config: imageConfig,
          array: true,
        },
      ],

      geospatialFields: [
        {
          name: 'position',
          geospatialType: 'Point',
        },
      ],
    };
    const thingConfigs = { Example: thingConfig, Image: imageConfig };
    const enums = [
      { name: 'Weekdays', enum: ['a0', 'a1', 'a2', 'a3', 'a4', 'a5', 'a6'] },
      { name: 'Cuisines', enum: ['ukrainian', 'italian', 'georgian', 'japanese', 'chinese'] },
    ];
    const generalConfig: GeneralConfig = { thingConfigs, enums };

    const expectedResult = `scalar DateTime
scalar Upload
input RegExp {
  pattern: String!
  flags: String
}
input SliceInput {
  begin: Int
  end: Int
}
enum WeekdaysEnumeration {
  a0
  a1
  a2
  a3
  a4
  a5
  a6
}
enum CuisinesEnumeration {
  ukrainian
  italian
  georgian
  japanese
  chinese
}
type GeospatialPoint {
  lng: Float!
  lat: Float!
}
input GeospatialPointInput {
  lng: Float!
  lat: Float!
}
type Example {
  id: ID!
  createdAt: DateTime!
  updatedAt: DateTime!
  textField1: String
  textField2: String
  textField3: String!
  textField4(slice: SliceInput): [String!]!
  textField5(slice: SliceInput): [String!]!
  day: WeekdaysEnumeration
  cuisines(slice: SliceInput): [CuisinesEnumeration!]!
  logo: Image!
  hero: Image
  pictures(slice: SliceInput): [Image!]!
  photos(slice: SliceInput): [Image!]!
  position: GeospatialPoint
}
type Image {
  id: ID!
  fileId: String!
  address: String
}
input ExampleWhereOneInput {
  id: ID
  textField1: ID
}
input ExampleWhereInput {
  id_in: [ID!]
  id_nin: [ID!]
  createdAt_in: [DateTime!]
  createdAt_nin: [DateTime!]
  createdAt_ne: DateTime
  createdAt_gt: DateTime
  createdAt_gte: DateTime
  createdAt_lt: DateTime
  createdAt_lte: DateTime
  updatedAt_in: [DateTime!]
  updatedAt_nin: [DateTime!]
  updatedAt_ne: DateTime
  updatedAt_gt: DateTime
  updatedAt_gte: DateTime
  updatedAt_lt: DateTime
  updatedAt_lte: DateTime
  textField1_in: [String!]
  textField1_nin: [String!]
  textField1_ne: String
  textField1_re: [RegExp!]
  textField2: String
  textField2_in: [String!]
  textField2_nin: [String!]
  textField2_ne: String
  textField2_re: [RegExp!]
  textField2_exists: Boolean
  textField3: String
  textField3_in: [String!]
  textField3_nin: [String!]
  textField3_ne: String
  textField3_re: [RegExp!]
  textField3_exists: Boolean
  day: WeekdaysEnumeration
  day_in: [WeekdaysEnumeration!]
  day_nin: [WeekdaysEnumeration!]
  day_ne: WeekdaysEnumeration
  day_re: [RegExp!]
  day_exists: Boolean
  cuisines: CuisinesEnumeration
  cuisines_in: [CuisinesEnumeration!]
  cuisines_nin: [CuisinesEnumeration!]
  cuisines_ne: CuisinesEnumeration
  cuisines_re: [RegExp!]
  cuisines_size: Int
  cuisines_notsize: Int
  AND: [ExampleWhereInput!]
  NOR: [ExampleWhereInput!]
  OR: [ExampleWhereInput!]
}
input ExampleWhereWithoutBooleanOperationsInput {
  id_in: [ID!]
  id_nin: [ID!]
  createdAt_in: [DateTime!]
  createdAt_nin: [DateTime!]
  createdAt_ne: DateTime
  createdAt_gt: DateTime
  createdAt_gte: DateTime
  createdAt_lt: DateTime
  createdAt_lte: DateTime
  updatedAt_in: [DateTime!]
  updatedAt_nin: [DateTime!]
  updatedAt_ne: DateTime
  updatedAt_gt: DateTime
  updatedAt_gte: DateTime
  updatedAt_lt: DateTime
  updatedAt_lte: DateTime
  textField1_in: [String!]
  textField1_nin: [String!]
  textField1_ne: String
  textField1_re: [RegExp!]
  textField2: String
  textField2_in: [String!]
  textField2_nin: [String!]
  textField2_ne: String
  textField2_re: [RegExp!]
  textField2_exists: Boolean
  textField3: String
  textField3_in: [String!]
  textField3_nin: [String!]
  textField3_ne: String
  textField3_re: [RegExp!]
  textField3_exists: Boolean
  day: WeekdaysEnumeration
  day_in: [WeekdaysEnumeration!]
  day_nin: [WeekdaysEnumeration!]
  day_ne: WeekdaysEnumeration
  day_re: [RegExp!]
  day_exists: Boolean
  cuisines: CuisinesEnumeration
  cuisines_in: [CuisinesEnumeration!]
  cuisines_nin: [CuisinesEnumeration!]
  cuisines_ne: CuisinesEnumeration
  cuisines_re: [RegExp!]
  cuisines_size: Int
  cuisines_notsize: Int
}
enum ExampleSortEnum {
  createdAt_ASC
  createdAt_DESC
  updatedAt_ASC
  updatedAt_DESC
  day_ASC
  day_DESC
  textField2_ASC
  textField2_DESC
  textField3_ASC
  textField3_DESC
}
input ExampleSortInput {
  sortBy: [ExampleSortEnum]
}
input PaginationInput {
  skip: Int
  first: Int
}
enum ExampleGeospatialFieldNamesEnum {
  position
}
input ExampleNearInput {
  geospatialField: ExampleGeospatialFieldNamesEnum
  coordinates: GeospatialPointInput
  maxDistance: Float
}
enum ExampleTextNamesEnum {
  textField1
  textField2
  textField3
  textField4
  textField5
}
input ExampleDistinctValuesOptionsInput {
  target: ExampleTextNamesEnum!
}
input FileWhereInput {
  id_in: [ID!]
  id_nin: [ID!]
  createdAt_in: [DateTime!]
  createdAt_nin: [DateTime!]
  createdAt_ne: DateTime
  createdAt_gt: DateTime
  createdAt_gte: DateTime
  createdAt_lt: DateTime
  createdAt_lte: DateTime
  updatedAt_in: [DateTime!]
  updatedAt_nin: [DateTime!]
  updatedAt_ne: DateTime
  updatedAt_gt: DateTime
  updatedAt_gte: DateTime
  updatedAt_lt: DateTime
  updatedAt_lte: DateTime
  uploadedAt: DateTime
  uploadedAt_in: [DateTime!]
  uploadedAt_nin: [DateTime!]
  uploadedAt_ne: DateTime
  uploadedAt_gt: DateTime
  uploadedAt_gte: DateTime
  uploadedAt_lt: DateTime
  uploadedAt_lte: DateTime
  filename_in: [String!]
  filename_nin: [String!]
  filename_ne: String
  mimetype_in: [String!]
  mimetype_nin: [String!]
  mimetype_ne: String
  encoding_in: [String!]
  encoding_nin: [String!]
  encoding_ne: String
  hash_in: [String!]
  hash_nin: [String!]
  hash_ne: String
  AND: [FileWhereInput!]
  NOR: [FileWhereInput!]
  OR: [FileWhereInput!]
}
input FileWhereOneInput {
  id: ID
  hash: String
}
input ExampleWhereByUniqueInput {
  id_in: [ID!]
  textField1_in: [String!]
}
input ExampleCreateInput {
  id: ID
  textField1: String
  textField2: String
  textField3: String!
  textField4: [String!]
  textField5: [String!]!
  day: WeekdaysEnumeration
  cuisines: [CuisinesEnumeration!]!
  logo: ImageCreateInput!
  hero: ImageCreateInput
  pictures: [ImageCreateInput!]!
  photos: [ImageCreateInput!]
  position: GeospatialPointInput
}
input ExampleCreateChildInput {
  connect: ID
  create: ExampleCreateInput
}
input ExampleCreateOrPushChildrenInput {
  connect: [ID!]
  create: [ExampleCreateInput!]
  createPositions: [Int!]
}
input ImageCreateInput {
  fileId: String!
  address: String
}
enum ImportFormatEnum {
  csv
  json
}
input ImportOptionsInput {
  format: ImportFormatEnum
}
input PushIntoExampleInput {
  textField4: [String!]
  textField5: [String!]
  cuisines: [CuisinesEnumeration!]
  pictures: [ImageCreateInput!]
  photos: [ImageCreateInput!]
}
input ExamplePushPositionsInput {
  textField4: [Int!]
  textField5: [Int!]
  cuisines: [Int!]
  pictures: [Int!]
  photos: [Int!]
}
input ExampleUpdateInput {
  textField1: String
  textField2: String
  textField3: String
  textField4: [String!]
  textField5: [String!]
  day: WeekdaysEnumeration
  cuisines: [CuisinesEnumeration!]
  logo: ImageUpdateInput
  hero: ImageUpdateInput
  pictures: [ImageUpdateInput!]
  photos: [ImageUpdateInput!]
  position: GeospatialPointInput
}
input ImageUpdateInput {
  fileId: String
  address: String
}
input UploadFilesToExampleInput {
  logo: ImageUpdateInput
  hero: ImageUpdateInput
  pictures: [ImageUpdateInput!]
  photos: [ImageUpdateInput!]
}
enum ExampleFileNamesEnum {
  logo
  hero
  pictures
  photos
}
input FilesOfExampleOptionsInput {
  targets: [ExampleFileNamesEnum!]!
  counts: [Int!]!
  hashes: [String!]!
}
input ExampleReorderUploadedInput {
  pictures: [Int!]
  photos: [Int!]
}
enum ExampleFieldNamesEnum {
  textField1
  textField2
  textField3
  textField4
  textField5
  logo
  hero
  pictures
  photos
  day
  cuisines
  position
}
type UpdatedExamplePayload {
  node: Example
  previousNode: Example
  updatedFields: [ExampleFieldNamesEnum!]
}
type Query {
  childExample(whereOne: ExampleWhereOneInput!): Example!
  childExamples(where: ExampleWhereInput, sort: ExampleSortInput, pagination: PaginationInput, near: ExampleNearInput, search: String): [Example!]!
  ExampleCount(where: ExampleWhereInput, near: ExampleNearInput, search: String): Int!
  ExampleDistinctValues(where: ExampleWhereInput, options: ExampleDistinctValuesOptionsInput): [String!]!
  ImageFileCount(where: FileWhereInput): Int!
  ImageFile(whereOne: FileWhereOneInput!): Image!
  ImageFiles(where: FileWhereInput): [Image!]!
  Example(whereOne: ExampleWhereOneInput!): Example!
  Examples(where: ExampleWhereInput, sort: ExampleSortInput, pagination: PaginationInput, near: ExampleNearInput, search: String): [Example!]!
  ExamplesByUnique(where: ExampleWhereByUniqueInput!, sort: ExampleSortInput, near: ExampleNearInput, search: String): [Example!]!
}
type Mutation {
  createManyExamples(data: [ExampleCreateInput!]!): [Example!]!
  createExample(data: ExampleCreateInput!): Example!
  deleteFilteredExamples(where: ExampleWhereInput, near: ExampleNearInput, search: String): [Example!]!
  deleteFilteredExamplesReturnScalar(where: ExampleWhereInput, near: ExampleNearInput, search: String): Int!
  deleteManyExamples(whereOne: [ExampleWhereOneInput!]!): [Example!]!
  deleteExample(whereOne: ExampleWhereOneInput!): Example!
  importExamples(file: Upload!, options: ImportOptionsInput): [Example!]!
  pushIntoExample(whereOne: ExampleWhereOneInput!, data: PushIntoExampleInput!, positions: ExamplePushPositionsInput): Example!
  updateFilteredExamples(where: ExampleWhereInput, near: ExampleNearInput, search: String, data: ExampleUpdateInput!): [Example!]!
  updateFilteredExamplesReturnScalar(where: ExampleWhereInput, near: ExampleNearInput, search: String, data: ExampleUpdateInput!): Int!
  updateManyExamples(whereOne: [ExampleWhereOneInput!]!, data: [ExampleUpdateInput!]!): [Example!]!
  updateExample(whereOne: ExampleWhereOneInput!, data: ExampleUpdateInput!): Example!
  uploadFilesToExample(whereOne: ExampleWhereOneInput!, data: UploadFilesToExampleInput, files: [Upload!]!, options: FilesOfExampleOptionsInput!, positions: ExampleReorderUploadedInput): Example!
  uploadImageFiles(files: [Upload!]!, hashes: [String!]!): [Image!]!
}
type Subscription {
  createdExample(where: ExampleWhereInput): Example!
  updatedExample(where: ExampleWhereInput): UpdatedExamplePayload!
  deletedExample(where: ExampleWhereInput): Example!
}`;

    const result = composeGqlTypes(generalConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should create things types for two things', () => {
    const thingConfig1: ThingConfig = {
      name: 'Example1',
      textFields: [
        {
          name: 'textField1',
        },
        {
          name: 'textField2',
          default: 'default text',
        },
        {
          name: 'textField3',
          required: true,
        },
      ],
      geospatialFields: [
        {
          name: 'position',
          geospatialType: 'Point',
        },
      ],
    };
    const thingConfig2: ThingConfig = {
      name: 'Example2',
      textFields: [
        {
          name: 'textField1',
          array: true,
        },
        {
          name: 'textField2',
          default: ['default text'],
          required: true,
          array: true,
        },
      ],
      geospatialFields: [
        {
          name: 'area',
          geospatialType: 'Polygon',
        },
      ],
    };
    const thingConfigs = { Example1: thingConfig1, Example2: thingConfig2 };
    const generalConfig: GeneralConfig = { thingConfigs };

    const expectedResult = `scalar DateTime
scalar Upload
input RegExp {
  pattern: String!
  flags: String
}
input SliceInput {
  begin: Int
  end: Int
}
type GeospatialPoint {
  lng: Float!
  lat: Float!
}
type GeospatialPolygonRing {
  ring: [GeospatialPoint!]!
}
type GeospatialPolygon {
  externalRing: GeospatialPolygonRing!
  internalRings: [GeospatialPolygonRing!]
}
input GeospatialPointInput {
  lng: Float!
  lat: Float!
}
input GeospatialPolygonRingInput {
  ring: [GeospatialPointInput!]!
}
input GeospatialPolygonInput {
  externalRing: GeospatialPolygonRingInput!
  internalRings: [GeospatialPolygonRingInput!]
}
type Example1 {
  id: ID!
  createdAt: DateTime!
  updatedAt: DateTime!
  textField1: String
  textField2: String
  textField3: String!
  position: GeospatialPoint
}
type Example2 {
  id: ID!
  createdAt: DateTime!
  updatedAt: DateTime!
  textField1(slice: SliceInput): [String!]!
  textField2(slice: SliceInput): [String!]!
  area: GeospatialPolygon
}
input Example1WhereOneInput {
  id: ID!
}
input Example2WhereOneInput {
  id: ID!
}
input Example1WhereInput {
  id_in: [ID!]
  id_nin: [ID!]
  createdAt_in: [DateTime!]
  createdAt_nin: [DateTime!]
  createdAt_ne: DateTime
  createdAt_gt: DateTime
  createdAt_gte: DateTime
  createdAt_lt: DateTime
  createdAt_lte: DateTime
  updatedAt_in: [DateTime!]
  updatedAt_nin: [DateTime!]
  updatedAt_ne: DateTime
  updatedAt_gt: DateTime
  updatedAt_gte: DateTime
  updatedAt_lt: DateTime
  updatedAt_lte: DateTime
  AND: [Example1WhereInput!]
  NOR: [Example1WhereInput!]
  OR: [Example1WhereInput!]
}
input Example1WhereWithoutBooleanOperationsInput {
  id_in: [ID!]
  id_nin: [ID!]
  createdAt_in: [DateTime!]
  createdAt_nin: [DateTime!]
  createdAt_ne: DateTime
  createdAt_gt: DateTime
  createdAt_gte: DateTime
  createdAt_lt: DateTime
  createdAt_lte: DateTime
  updatedAt_in: [DateTime!]
  updatedAt_nin: [DateTime!]
  updatedAt_ne: DateTime
  updatedAt_gt: DateTime
  updatedAt_gte: DateTime
  updatedAt_lt: DateTime
  updatedAt_lte: DateTime
}
enum Example1SortEnum {
  createdAt_ASC
  createdAt_DESC
  updatedAt_ASC
  updatedAt_DESC
}
input Example1SortInput {
  sortBy: [Example1SortEnum]
}
input PaginationInput {
  skip: Int
  first: Int
}
enum Example1GeospatialFieldNamesEnum {
  position
}
input Example1NearInput {
  geospatialField: Example1GeospatialFieldNamesEnum
  coordinates: GeospatialPointInput
  maxDistance: Float
}
input Example2WhereInput {
  id_in: [ID!]
  id_nin: [ID!]
  createdAt_in: [DateTime!]
  createdAt_nin: [DateTime!]
  createdAt_ne: DateTime
  createdAt_gt: DateTime
  createdAt_gte: DateTime
  createdAt_lt: DateTime
  createdAt_lte: DateTime
  updatedAt_in: [DateTime!]
  updatedAt_nin: [DateTime!]
  updatedAt_ne: DateTime
  updatedAt_gt: DateTime
  updatedAt_gte: DateTime
  updatedAt_lt: DateTime
  updatedAt_lte: DateTime
  AND: [Example2WhereInput!]
  NOR: [Example2WhereInput!]
  OR: [Example2WhereInput!]
}
input Example2WhereWithoutBooleanOperationsInput {
  id_in: [ID!]
  id_nin: [ID!]
  createdAt_in: [DateTime!]
  createdAt_nin: [DateTime!]
  createdAt_ne: DateTime
  createdAt_gt: DateTime
  createdAt_gte: DateTime
  createdAt_lt: DateTime
  createdAt_lte: DateTime
  updatedAt_in: [DateTime!]
  updatedAt_nin: [DateTime!]
  updatedAt_ne: DateTime
  updatedAt_gt: DateTime
  updatedAt_gte: DateTime
  updatedAt_lt: DateTime
  updatedAt_lte: DateTime
}
enum Example2SortEnum {
  createdAt_ASC
  createdAt_DESC
  updatedAt_ASC
  updatedAt_DESC
}
input Example2SortInput {
  sortBy: [Example2SortEnum]
}
enum Example1TextNamesEnum {
  textField1
  textField2
  textField3
}
input Example1DistinctValuesOptionsInput {
  target: Example1TextNamesEnum!
}
enum Example2TextNamesEnum {
  textField1
  textField2
}
input Example2DistinctValuesOptionsInput {
  target: Example2TextNamesEnum!
}
input Example1WhereByUniqueInput {
  id_in: [ID!]
}
input Example2WhereByUniqueInput {
  id_in: [ID!]
}
input Example1CreateInput {
  id: ID
  textField1: String
  textField2: String
  textField3: String!
  position: GeospatialPointInput
}
input Example1CreateChildInput {
  connect: ID
  create: Example1CreateInput
}
input Example1CreateOrPushChildrenInput {
  connect: [ID!]
  create: [Example1CreateInput!]
  createPositions: [Int!]
}
input Example2CreateInput {
  id: ID
  textField1: [String!]
  textField2: [String!]!
  area: GeospatialPolygonInput
}
input Example2CreateChildInput {
  connect: ID
  create: Example2CreateInput
}
input Example2CreateOrPushChildrenInput {
  connect: [ID!]
  create: [Example2CreateInput!]
  createPositions: [Int!]
}
enum ImportFormatEnum {
  csv
  json
}
input ImportOptionsInput {
  format: ImportFormatEnum
}
input PushIntoExample2Input {
  textField1: [String!]
  textField2: [String!]
}
input Example2PushPositionsInput {
  textField1: [Int!]
  textField2: [Int!]
}
input Example1UpdateInput {
  textField1: String
  textField2: String
  textField3: String
  position: GeospatialPointInput
}
input Example2UpdateInput {
  textField1: [String!]
  textField2: [String!]
  area: GeospatialPolygonInput
}
enum Example1FieldNamesEnum {
  textField1
  textField2
  textField3
  position
}
type UpdatedExample1Payload {
  node: Example1
  previousNode: Example1
  updatedFields: [Example1FieldNamesEnum!]
}
enum Example2FieldNamesEnum {
  textField1
  textField2
  area
}
type UpdatedExample2Payload {
  node: Example2
  previousNode: Example2
  updatedFields: [Example2FieldNamesEnum!]
}
type Query {
  childExample1(whereOne: Example1WhereOneInput!): Example1!
  childExample2(whereOne: Example2WhereOneInput!): Example2!
  childExample1s(where: Example1WhereInput, sort: Example1SortInput, pagination: PaginationInput, near: Example1NearInput): [Example1!]!
  childExample2s(where: Example2WhereInput, sort: Example2SortInput, pagination: PaginationInput): [Example2!]!
  Example1Count(where: Example1WhereInput, near: Example1NearInput): Int!
  Example2Count(where: Example2WhereInput): Int!
  Example1DistinctValues(where: Example1WhereInput, options: Example1DistinctValuesOptionsInput): [String!]!
  Example2DistinctValues(where: Example2WhereInput, options: Example2DistinctValuesOptionsInput): [String!]!
  Example1(whereOne: Example1WhereOneInput!): Example1!
  Example2(whereOne: Example2WhereOneInput!): Example2!
  Example1s(where: Example1WhereInput, sort: Example1SortInput, pagination: PaginationInput, near: Example1NearInput): [Example1!]!
  Example2s(where: Example2WhereInput, sort: Example2SortInput, pagination: PaginationInput): [Example2!]!
  Example1sByUnique(where: Example1WhereByUniqueInput!, sort: Example1SortInput, near: Example1NearInput): [Example1!]!
  Example2sByUnique(where: Example2WhereByUniqueInput!, sort: Example2SortInput): [Example2!]!
}
type Mutation {
  createManyExample1s(data: [Example1CreateInput!]!): [Example1!]!
  createManyExample2s(data: [Example2CreateInput!]!): [Example2!]!
  createExample1(data: Example1CreateInput!): Example1!
  createExample2(data: Example2CreateInput!): Example2!
  deleteFilteredExample1s(where: Example1WhereInput, near: Example1NearInput): [Example1!]!
  deleteFilteredExample2s(where: Example2WhereInput): [Example2!]!
  deleteFilteredExample1sReturnScalar(where: Example1WhereInput, near: Example1NearInput): Int!
  deleteFilteredExample2sReturnScalar(where: Example2WhereInput): Int!
  deleteManyExample1s(whereOne: [Example1WhereOneInput!]!): [Example1!]!
  deleteManyExample2s(whereOne: [Example2WhereOneInput!]!): [Example2!]!
  deleteExample1(whereOne: Example1WhereOneInput!): Example1!
  deleteExample2(whereOne: Example2WhereOneInput!): Example2!
  importExample1s(file: Upload!, options: ImportOptionsInput): [Example1!]!
  importExample2s(file: Upload!, options: ImportOptionsInput): [Example2!]!
  pushIntoExample2(whereOne: Example2WhereOneInput!, data: PushIntoExample2Input!, positions: Example2PushPositionsInput): Example2!
  updateFilteredExample1s(where: Example1WhereInput, near: Example1NearInput, data: Example1UpdateInput!): [Example1!]!
  updateFilteredExample2s(where: Example2WhereInput, data: Example2UpdateInput!): [Example2!]!
  updateFilteredExample1sReturnScalar(where: Example1WhereInput, near: Example1NearInput, data: Example1UpdateInput!): Int!
  updateFilteredExample2sReturnScalar(where: Example2WhereInput, data: Example2UpdateInput!): Int!
  updateManyExample1s(whereOne: [Example1WhereOneInput!]!, data: [Example1UpdateInput!]!): [Example1!]!
  updateManyExample2s(whereOne: [Example2WhereOneInput!]!, data: [Example2UpdateInput!]!): [Example2!]!
  updateExample1(whereOne: Example1WhereOneInput!, data: Example1UpdateInput!): Example1!
  updateExample2(whereOne: Example2WhereOneInput!, data: Example2UpdateInput!): Example2!
}
type Subscription {
  createdExample1(where: Example1WhereInput): Example1!
  updatedExample1(where: Example1WhereInput): UpdatedExample1Payload!
  deletedExample1(where: Example1WhereInput): Example1!
  createdExample2(where: Example2WhereInput): Example2!
  updatedExample2(where: Example2WhereInput): UpdatedExample2Payload!
  deletedExample2(where: Example2WhereInput): Example2!
}`;

    const result = composeGqlTypes(generalConfig);
    expect(result).toEqual(expectedResult);
  });
  test('should create things types for two related fields', () => {
    const placeConfig: ThingConfig = {
      name: 'Place',
      textFields: [
        {
          name: 'title',
          required: true,
        },
      ],
    };
    const personConfig: ThingConfig = {};
    Object.assign(personConfig, {
      name: 'Person',
      textFields: [
        {
          name: 'firstName',
          required: true,
        },
        {
          name: 'lastName',
          required: true,
        },
      ],
      relationalFields: [
        {
          name: 'friends',
          config: personConfig,
          array: true,
          required: true,
        },
        {
          name: 'enemies',
          config: personConfig,
          array: true,
        },
        {
          name: 'location',
          config: placeConfig,
          required: true,
        },
        {
          name: 'favoritePlace',
          config: placeConfig,
        },
      ],
    });
    const thingConfigs = { Person: personConfig, Place: placeConfig };
    const generalConfig: GeneralConfig = { thingConfigs };

    const expectedResult = `scalar DateTime
scalar Upload
input RegExp {
  pattern: String!
  flags: String
}
input SliceInput {
  begin: Int
  end: Int
}
type Person {
  id: ID!
  createdAt: DateTime!
  updatedAt: DateTime!
  firstName: String!
  lastName: String!
  friends(where: PersonWhereInput, sort: PersonSortInput, pagination: PaginationInput): [Person!]!
  enemies(where: PersonWhereInput, sort: PersonSortInput, pagination: PaginationInput): [Person!]!
  location: Place!
  favoritePlace: Place
}
type Place {
  id: ID!
  createdAt: DateTime!
  updatedAt: DateTime!
  title: String!
}
input PersonWhereInput {
  id_in: [ID!]
  id_nin: [ID!]
  createdAt_in: [DateTime!]
  createdAt_nin: [DateTime!]
  createdAt_ne: DateTime
  createdAt_gt: DateTime
  createdAt_gte: DateTime
  createdAt_lt: DateTime
  createdAt_lte: DateTime
  updatedAt_in: [DateTime!]
  updatedAt_nin: [DateTime!]
  updatedAt_ne: DateTime
  updatedAt_gt: DateTime
  updatedAt_gte: DateTime
  updatedAt_lt: DateTime
  updatedAt_lte: DateTime
  AND: [PersonWhereInput!]
  NOR: [PersonWhereInput!]
  OR: [PersonWhereInput!]
}
input PersonWhereWithoutBooleanOperationsInput {
  id_in: [ID!]
  id_nin: [ID!]
  createdAt_in: [DateTime!]
  createdAt_nin: [DateTime!]
  createdAt_ne: DateTime
  createdAt_gt: DateTime
  createdAt_gte: DateTime
  createdAt_lt: DateTime
  createdAt_lte: DateTime
  updatedAt_in: [DateTime!]
  updatedAt_nin: [DateTime!]
  updatedAt_ne: DateTime
  updatedAt_gt: DateTime
  updatedAt_gte: DateTime
  updatedAt_lt: DateTime
  updatedAt_lte: DateTime
}
input PlaceWhereInput {
  id_in: [ID!]
  id_nin: [ID!]
  createdAt_in: [DateTime!]
  createdAt_nin: [DateTime!]
  createdAt_ne: DateTime
  createdAt_gt: DateTime
  createdAt_gte: DateTime
  createdAt_lt: DateTime
  createdAt_lte: DateTime
  updatedAt_in: [DateTime!]
  updatedAt_nin: [DateTime!]
  updatedAt_ne: DateTime
  updatedAt_gt: DateTime
  updatedAt_gte: DateTime
  updatedAt_lt: DateTime
  updatedAt_lte: DateTime
  AND: [PlaceWhereInput!]
  NOR: [PlaceWhereInput!]
  OR: [PlaceWhereInput!]
}
input PlaceWhereWithoutBooleanOperationsInput {
  id_in: [ID!]
  id_nin: [ID!]
  createdAt_in: [DateTime!]
  createdAt_nin: [DateTime!]
  createdAt_ne: DateTime
  createdAt_gt: DateTime
  createdAt_gte: DateTime
  createdAt_lt: DateTime
  createdAt_lte: DateTime
  updatedAt_in: [DateTime!]
  updatedAt_nin: [DateTime!]
  updatedAt_ne: DateTime
  updatedAt_gt: DateTime
  updatedAt_gte: DateTime
  updatedAt_lt: DateTime
  updatedAt_lte: DateTime
}
enum PersonSortEnum {
  createdAt_ASC
  createdAt_DESC
  updatedAt_ASC
  updatedAt_DESC
}
input PersonSortInput {
  sortBy: [PersonSortEnum]
}
input PaginationInput {
  skip: Int
  first: Int
}
input PersonWhereOneInput {
  id: ID!
}
input PlaceWhereOneInput {
  id: ID!
}
enum PlaceSortEnum {
  createdAt_ASC
  createdAt_DESC
  updatedAt_ASC
  updatedAt_DESC
}
input PlaceSortInput {
  sortBy: [PlaceSortEnum]
}
enum PersonTextNamesEnum {
  firstName
  lastName
}
input PersonDistinctValuesOptionsInput {
  target: PersonTextNamesEnum!
}
enum PlaceTextNamesEnum {
  title
}
input PlaceDistinctValuesOptionsInput {
  target: PlaceTextNamesEnum!
}
input PersonWhereByUniqueInput {
  id_in: [ID!]
}
input PlaceWhereByUniqueInput {
  id_in: [ID!]
}
input PersonCreateInput {
  id: ID
  firstName: String!
  lastName: String!
  friends: PersonCreateOrPushChildrenInput!
  enemies: PersonCreateOrPushChildrenInput
  location: PlaceCreateChildInput!
  favoritePlace: PlaceCreateChildInput
}
input PersonCreateChildInput {
  connect: ID
  create: PersonCreateInput
}
input PersonCreateOrPushChildrenInput {
  connect: [ID!]
  create: [PersonCreateInput!]
  createPositions: [Int!]
}
input PlaceCreateInput {
  id: ID
  title: String!
}
input PlaceCreateChildInput {
  connect: ID
  create: PlaceCreateInput
}
input PlaceCreateOrPushChildrenInput {
  connect: [ID!]
  create: [PlaceCreateInput!]
  createPositions: [Int!]
}
enum ImportFormatEnum {
  csv
  json
}
input ImportOptionsInput {
  format: ImportFormatEnum
}
input PushIntoPersonInput {
  friends: PersonCreateOrPushChildrenInput
  enemies: PersonCreateOrPushChildrenInput
}
input PersonPushPositionsInput {
  friends: [Int!]
  enemies: [Int!]
}
input PersonUpdateInput {
  firstName: String
  lastName: String
  friends: PersonCreateOrPushChildrenInput
  enemies: PersonCreateOrPushChildrenInput
  location: PlaceCreateChildInput
  favoritePlace: PlaceCreateChildInput
}
input PlaceUpdateInput {
  title: String
}
enum PersonFieldNamesEnum {
  firstName
  lastName
  friends
  enemies
  location
  favoritePlace
}
type UpdatedPersonPayload {
  node: Person
  previousNode: Person
  updatedFields: [PersonFieldNamesEnum!]
}
enum PlaceFieldNamesEnum {
  title
}
type UpdatedPlacePayload {
  node: Place
  previousNode: Place
  updatedFields: [PlaceFieldNamesEnum!]
}
type Query {
  childPerson(whereOne: PersonWhereOneInput!): Person!
  childPlace(whereOne: PlaceWhereOneInput!): Place!
  childPeople(where: PersonWhereInput, sort: PersonSortInput, pagination: PaginationInput): [Person!]!
  childPlaces(where: PlaceWhereInput, sort: PlaceSortInput, pagination: PaginationInput): [Place!]!
  PersonCount(where: PersonWhereInput): Int!
  PlaceCount(where: PlaceWhereInput): Int!
  PersonDistinctValues(where: PersonWhereInput, options: PersonDistinctValuesOptionsInput): [String!]!
  PlaceDistinctValues(where: PlaceWhereInput, options: PlaceDistinctValuesOptionsInput): [String!]!
  Person(whereOne: PersonWhereOneInput!): Person!
  Place(whereOne: PlaceWhereOneInput!): Place!
  People(where: PersonWhereInput, sort: PersonSortInput, pagination: PaginationInput): [Person!]!
  Places(where: PlaceWhereInput, sort: PlaceSortInput, pagination: PaginationInput): [Place!]!
  PeopleByUnique(where: PersonWhereByUniqueInput!, sort: PersonSortInput): [Person!]!
  PlacesByUnique(where: PlaceWhereByUniqueInput!, sort: PlaceSortInput): [Place!]!
}
type Mutation {
  createManyPeople(data: [PersonCreateInput!]!): [Person!]!
  createManyPlaces(data: [PlaceCreateInput!]!): [Place!]!
  createPerson(data: PersonCreateInput!): Person!
  createPlace(data: PlaceCreateInput!): Place!
  deleteFilteredPeople(where: PersonWhereInput): [Person!]!
  deleteFilteredPlaces(where: PlaceWhereInput): [Place!]!
  deleteFilteredPeopleReturnScalar(where: PersonWhereInput): Int!
  deleteFilteredPlacesReturnScalar(where: PlaceWhereInput): Int!
  deleteManyPeople(whereOne: [PersonWhereOneInput!]!): [Person!]!
  deleteManyPlaces(whereOne: [PlaceWhereOneInput!]!): [Place!]!
  deletePerson(whereOne: PersonWhereOneInput!): Person!
  deletePlace(whereOne: PlaceWhereOneInput!): Place!
  importPeople(file: Upload!, options: ImportOptionsInput): [Person!]!
  importPlaces(file: Upload!, options: ImportOptionsInput): [Place!]!
  pushIntoPerson(whereOne: PersonWhereOneInput!, data: PushIntoPersonInput!, positions: PersonPushPositionsInput): Person!
  updateFilteredPeople(where: PersonWhereInput, data: PersonUpdateInput!): [Person!]!
  updateFilteredPlaces(where: PlaceWhereInput, data: PlaceUpdateInput!): [Place!]!
  updateFilteredPeopleReturnScalar(where: PersonWhereInput, data: PersonUpdateInput!): Int!
  updateFilteredPlacesReturnScalar(where: PlaceWhereInput, data: PlaceUpdateInput!): Int!
  updateManyPeople(whereOne: [PersonWhereOneInput!]!, data: [PersonUpdateInput!]!): [Person!]!
  updateManyPlaces(whereOne: [PlaceWhereOneInput!]!, data: [PlaceUpdateInput!]!): [Place!]!
  updatePerson(whereOne: PersonWhereOneInput!, data: PersonUpdateInput!): Person!
  updatePlace(whereOne: PlaceWhereOneInput!, data: PlaceUpdateInput!): Place!
}
type Subscription {
  createdPerson(where: PersonWhereInput): Person!
  updatedPerson(where: PersonWhereInput): UpdatedPersonPayload!
  deletedPerson(where: PersonWhereInput): Person!
  createdPlace(where: PlaceWhereInput): Place!
  updatedPlace(where: PlaceWhereInput): UpdatedPlacePayload!
  deletedPlace(where: PlaceWhereInput): Place!
}`;

    const result = composeGqlTypes(generalConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should create things types for regular and embedded fields', () => {
    const addressConfig: ThingConfig = {
      name: 'Address',
      embedded: true,
      textFields: [
        {
          name: 'country',
          required: true,
          default: 'Ukraine',
        },
        {
          name: 'province',
        },
      ],
    };
    const personConfig: ThingConfig = {
      name: 'Person',
      textFields: [
        {
          name: 'firstName',
          required: true,
        },
        {
          name: 'lastName',
          required: true,
        },
      ],
      embeddedFields: [
        {
          name: 'location',
          config: addressConfig,
          required: true,
        },
        {
          name: 'locations',
          array: true,
          config: addressConfig,
          required: true,
        },
        {
          name: 'place',
          config: addressConfig,
        },
        {
          name: 'places',
          array: true,
          config: addressConfig,
        },
      ],
    };
    const thingConfigs = { Person: personConfig, Address: addressConfig };
    const generalConfig: GeneralConfig = { thingConfigs };

    const expectedResult = `scalar DateTime
scalar Upload
input RegExp {
  pattern: String!
  flags: String
}
input SliceInput {
  begin: Int
  end: Int
}
type Person {
  id: ID!
  createdAt: DateTime!
  updatedAt: DateTime!
  firstName: String!
  lastName: String!
  location: Address!
  locations(slice: SliceInput): [Address!]!
  place: Address
  places(slice: SliceInput): [Address!]!
}
type Address {
  id: ID!
  country: String!
  province: String
}
input PersonWhereOneInput {
  id: ID!
}
input PersonWhereInput {
  id_in: [ID!]
  id_nin: [ID!]
  createdAt_in: [DateTime!]
  createdAt_nin: [DateTime!]
  createdAt_ne: DateTime
  createdAt_gt: DateTime
  createdAt_gte: DateTime
  createdAt_lt: DateTime
  createdAt_lte: DateTime
  updatedAt_in: [DateTime!]
  updatedAt_nin: [DateTime!]
  updatedAt_ne: DateTime
  updatedAt_gt: DateTime
  updatedAt_gte: DateTime
  updatedAt_lt: DateTime
  updatedAt_lte: DateTime
  AND: [PersonWhereInput!]
  NOR: [PersonWhereInput!]
  OR: [PersonWhereInput!]
}
input PersonWhereWithoutBooleanOperationsInput {
  id_in: [ID!]
  id_nin: [ID!]
  createdAt_in: [DateTime!]
  createdAt_nin: [DateTime!]
  createdAt_ne: DateTime
  createdAt_gt: DateTime
  createdAt_gte: DateTime
  createdAt_lt: DateTime
  createdAt_lte: DateTime
  updatedAt_in: [DateTime!]
  updatedAt_nin: [DateTime!]
  updatedAt_ne: DateTime
  updatedAt_gt: DateTime
  updatedAt_gte: DateTime
  updatedAt_lt: DateTime
  updatedAt_lte: DateTime
}
enum PersonSortEnum {
  createdAt_ASC
  createdAt_DESC
  updatedAt_ASC
  updatedAt_DESC
}
input PersonSortInput {
  sortBy: [PersonSortEnum]
}
input PaginationInput {
  skip: Int
  first: Int
}
enum PersonTextNamesEnum {
  firstName
  lastName
}
input PersonDistinctValuesOptionsInput {
  target: PersonTextNamesEnum!
}
input PersonWhereByUniqueInput {
  id_in: [ID!]
}
input PersonCreateInput {
  id: ID
  firstName: String!
  lastName: String!
  location: AddressCreateInput!
  locations: [AddressCreateInput!]!
  place: AddressCreateInput
  places: [AddressCreateInput!]
}
input PersonCreateChildInput {
  connect: ID
  create: PersonCreateInput
}
input PersonCreateOrPushChildrenInput {
  connect: [ID!]
  create: [PersonCreateInput!]
  createPositions: [Int!]
}
input AddressCreateInput {
  country: String!
  province: String
}
enum ImportFormatEnum {
  csv
  json
}
input ImportOptionsInput {
  format: ImportFormatEnum
}
input PushIntoPersonInput {
  locations: [AddressCreateInput!]
  places: [AddressCreateInput!]
}
input PersonPushPositionsInput {
  locations: [Int!]
  places: [Int!]
}
input PersonUpdateInput {
  firstName: String
  lastName: String
  location: AddressUpdateInput
  locations: [AddressUpdateInput!]
  place: AddressUpdateInput
  places: [AddressUpdateInput!]
}
input AddressUpdateInput {
  country: String
  province: String
}
enum PersonFieldNamesEnum {
  firstName
  lastName
  location
  locations
  place
  places
}
type UpdatedPersonPayload {
  node: Person
  previousNode: Person
  updatedFields: [PersonFieldNamesEnum!]
}
type Query {
  childPerson(whereOne: PersonWhereOneInput!): Person!
  childPeople(where: PersonWhereInput, sort: PersonSortInput, pagination: PaginationInput): [Person!]!
  PersonCount(where: PersonWhereInput): Int!
  PersonDistinctValues(where: PersonWhereInput, options: PersonDistinctValuesOptionsInput): [String!]!
  Person(whereOne: PersonWhereOneInput!): Person!
  People(where: PersonWhereInput, sort: PersonSortInput, pagination: PaginationInput): [Person!]!
  PeopleByUnique(where: PersonWhereByUniqueInput!, sort: PersonSortInput): [Person!]!
}
type Mutation {
  createManyPeople(data: [PersonCreateInput!]!): [Person!]!
  createPerson(data: PersonCreateInput!): Person!
  deleteFilteredPeople(where: PersonWhereInput): [Person!]!
  deleteFilteredPeopleReturnScalar(where: PersonWhereInput): Int!
  deleteManyPeople(whereOne: [PersonWhereOneInput!]!): [Person!]!
  deletePerson(whereOne: PersonWhereOneInput!): Person!
  importPeople(file: Upload!, options: ImportOptionsInput): [Person!]!
  pushIntoPerson(whereOne: PersonWhereOneInput!, data: PushIntoPersonInput!, positions: PersonPushPositionsInput): Person!
  updateFilteredPeople(where: PersonWhereInput, data: PersonUpdateInput!): [Person!]!
  updateFilteredPeopleReturnScalar(where: PersonWhereInput, data: PersonUpdateInput!): Int!
  updateManyPeople(whereOne: [PersonWhereOneInput!]!, data: [PersonUpdateInput!]!): [Person!]!
  updatePerson(whereOne: PersonWhereOneInput!, data: PersonUpdateInput!): Person!
}
type Subscription {
  createdPerson(where: PersonWhereInput): Person!
  updatedPerson(where: PersonWhereInput): UpdatedPersonPayload!
  deletedPerson(where: PersonWhereInput): Person!
}`;

    const result = composeGqlTypes(generalConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should create things types for two duplex fields', () => {
    const personConfig: ThingConfig = {};
    const placeConfig: ThingConfig = {
      name: 'Place',
      textFields: [{ name: 'name' }],
      duplexFields: [
        {
          name: 'citizens',
          oppositeName: 'location',
          array: true,
          config: personConfig,
        },
        {
          name: 'visitors',
          oppositeName: 'favoritePlace',
          array: true,
          config: personConfig,
        },
      ],
    };
    Object.assign(personConfig, {
      name: 'Person',
      textFields: [
        {
          name: 'firstName',
          required: true,
        },
        {
          name: 'lastName',
          required: true,
        },
      ],
      duplexFields: [
        {
          name: 'friends',
          oppositeName: 'friends',
          config: personConfig,
          array: true,
          required: true,
        },
        {
          name: 'enemies',
          oppositeName: 'enemies',
          array: true,
          config: personConfig,
        },
        {
          name: 'location',
          oppositeName: 'citizens',
          config: placeConfig,
          required: true,
        },
        {
          name: 'favoritePlace',
          oppositeName: 'visitors',
          config: placeConfig,
        },
      ],
    });
    const thingConfigs = { Person: personConfig, Place: placeConfig };
    const generalConfig: GeneralConfig = { thingConfigs };

    const expectedResult = `scalar DateTime
scalar Upload
input RegExp {
  pattern: String!
  flags: String
}
input SliceInput {
  begin: Int
  end: Int
}
type Person {
  id: ID!
  createdAt: DateTime!
  updatedAt: DateTime!
  firstName: String!
  lastName: String!
  friends(where: PersonWhereInput, sort: PersonSortInput, pagination: PaginationInput): [Person!]!
  enemies(where: PersonWhereInput, sort: PersonSortInput, pagination: PaginationInput): [Person!]!
  location: Place!
  favoritePlace: Place
}
type Place {
  id: ID!
  createdAt: DateTime!
  updatedAt: DateTime!
  name: String
  citizens(where: PersonWhereInput, sort: PersonSortInput, pagination: PaginationInput): [Person!]!
  visitors(where: PersonWhereInput, sort: PersonSortInput, pagination: PaginationInput): [Person!]!
}
input PersonWhereInput {
  id_in: [ID!]
  id_nin: [ID!]
  createdAt_in: [DateTime!]
  createdAt_nin: [DateTime!]
  createdAt_ne: DateTime
  createdAt_gt: DateTime
  createdAt_gte: DateTime
  createdAt_lt: DateTime
  createdAt_lte: DateTime
  updatedAt_in: [DateTime!]
  updatedAt_nin: [DateTime!]
  updatedAt_ne: DateTime
  updatedAt_gt: DateTime
  updatedAt_gte: DateTime
  updatedAt_lt: DateTime
  updatedAt_lte: DateTime
  AND: [PersonWhereInput!]
  NOR: [PersonWhereInput!]
  OR: [PersonWhereInput!]
}
input PersonWhereWithoutBooleanOperationsInput {
  id_in: [ID!]
  id_nin: [ID!]
  createdAt_in: [DateTime!]
  createdAt_nin: [DateTime!]
  createdAt_ne: DateTime
  createdAt_gt: DateTime
  createdAt_gte: DateTime
  createdAt_lt: DateTime
  createdAt_lte: DateTime
  updatedAt_in: [DateTime!]
  updatedAt_nin: [DateTime!]
  updatedAt_ne: DateTime
  updatedAt_gt: DateTime
  updatedAt_gte: DateTime
  updatedAt_lt: DateTime
  updatedAt_lte: DateTime
}
input PlaceWhereInput {
  id_in: [ID!]
  id_nin: [ID!]
  createdAt_in: [DateTime!]
  createdAt_nin: [DateTime!]
  createdAt_ne: DateTime
  createdAt_gt: DateTime
  createdAt_gte: DateTime
  createdAt_lt: DateTime
  createdAt_lte: DateTime
  updatedAt_in: [DateTime!]
  updatedAt_nin: [DateTime!]
  updatedAt_ne: DateTime
  updatedAt_gt: DateTime
  updatedAt_gte: DateTime
  updatedAt_lt: DateTime
  updatedAt_lte: DateTime
  AND: [PlaceWhereInput!]
  NOR: [PlaceWhereInput!]
  OR: [PlaceWhereInput!]
}
input PlaceWhereWithoutBooleanOperationsInput {
  id_in: [ID!]
  id_nin: [ID!]
  createdAt_in: [DateTime!]
  createdAt_nin: [DateTime!]
  createdAt_ne: DateTime
  createdAt_gt: DateTime
  createdAt_gte: DateTime
  createdAt_lt: DateTime
  createdAt_lte: DateTime
  updatedAt_in: [DateTime!]
  updatedAt_nin: [DateTime!]
  updatedAt_ne: DateTime
  updatedAt_gt: DateTime
  updatedAt_gte: DateTime
  updatedAt_lt: DateTime
  updatedAt_lte: DateTime
}
enum PersonSortEnum {
  createdAt_ASC
  createdAt_DESC
  updatedAt_ASC
  updatedAt_DESC
}
input PersonSortInput {
  sortBy: [PersonSortEnum]
}
input PaginationInput {
  skip: Int
  first: Int
}
input PersonWhereOneInput {
  id: ID!
}
input PlaceWhereOneInput {
  id: ID!
}
enum PlaceSortEnum {
  createdAt_ASC
  createdAt_DESC
  updatedAt_ASC
  updatedAt_DESC
}
input PlaceSortInput {
  sortBy: [PlaceSortEnum]
}
enum PersonTextNamesEnum {
  firstName
  lastName
}
input PersonDistinctValuesOptionsInput {
  target: PersonTextNamesEnum!
}
enum PlaceTextNamesEnum {
  name
}
input PlaceDistinctValuesOptionsInput {
  target: PlaceTextNamesEnum!
}
input PersonWhereByUniqueInput {
  id_in: [ID!]
}
input PlaceWhereByUniqueInput {
  id_in: [ID!]
}
input PersonCopyWhereOnesInput {
  friends: PersonWhereOneInput
  enemies: PersonWhereOneInput
}
enum copyPersonThroughfriendsOptionsEnum {
  firstName
  lastName
  enemies
  location
  favoritePlace
}
enum copyPersonThroughenemiesOptionsEnum {
  firstName
  lastName
  friends
  location
  favoritePlace
}
input copyPersonThroughfriendsOptionInput {
  fieldsToCopy: [copyPersonThroughfriendsOptionsEnum!]!
}
input copyPersonThroughenemiesOptionInput {
  fieldsToCopy: [copyPersonThroughenemiesOptionsEnum!]!
}
input copyPersonOptionsInput {
  friends: copyPersonThroughfriendsOptionInput
  enemies: copyPersonThroughenemiesOptionInput
}
input PersonWhereOneToCopyInput {
  id: ID!
}
input PersonCreateInput {
  id: ID
  friends: PersonCreateOrPushThru_friends_FieldChildrenInput!
  enemies: PersonCreateOrPushChildrenInput
  location: PlaceCreateChildInput!
  favoritePlace: PlaceCreateChildInput
  firstName: String!
  lastName: String!
}
input PersonCreateThru_friends_FieldInput {
  friends: PersonCreateOrPushThru_friends_FieldChildrenInput
  enemies: PersonCreateOrPushChildrenInput
  location: PlaceCreateChildInput!
  favoritePlace: PlaceCreateChildInput
  firstName: String!
  lastName: String!
}
input PersonCreateThru_location_FieldInput {
  friends: PersonCreateOrPushThru_friends_FieldChildrenInput!
  enemies: PersonCreateOrPushChildrenInput
  location: PlaceCreateChildInput
  favoritePlace: PlaceCreateChildInput
  firstName: String!
  lastName: String!
}
input PersonCreateChildInput {
  connect: ID
  create: PersonCreateInput
}
input PersonCreateOrPushChildrenInput {
  connect: [ID!]
  create: [PersonCreateInput!]
  createPositions: [Int!]
}
input PersonCreateThru_friends_FieldChildInput {
  connect: ID
  create: PersonCreateThru_friends_FieldInput
}
input PersonCreateOrPushThru_friends_FieldChildrenInput {
  connect: [ID!]
  create: [PersonCreateThru_friends_FieldInput!]
  createPositions: [Int!]
}
input PersonCreateThru_location_FieldChildInput {
  connect: ID
  create: PersonCreateThru_location_FieldInput
}
input PersonCreateOrPushThru_location_FieldChildrenInput {
  connect: [ID!]
  create: [PersonCreateThru_location_FieldInput!]
  createPositions: [Int!]
}
input PlaceCreateInput {
  id: ID
  citizens: PersonCreateOrPushThru_location_FieldChildrenInput
  visitors: PersonCreateOrPushChildrenInput
  name: String
}
input PlaceCreateChildInput {
  connect: ID
  create: PlaceCreateInput
}
input PlaceCreateOrPushChildrenInput {
  connect: [ID!]
  create: [PlaceCreateInput!]
  createPositions: [Int!]
}
enum deletePlaceWithChildrenOptionsEnum {
  citizens
  visitors
}
input deletePlaceWithChildrenOptionsInput {
  fieldsToDelete: [deletePlaceWithChildrenOptionsEnum]
}
enum ImportFormatEnum {
  csv
  json
}
input ImportOptionsInput {
  format: ImportFormatEnum
}
input PushIntoPersonInput {
  friends: PersonCreateOrPushChildrenInput
  enemies: PersonCreateOrPushChildrenInput
}
input PersonPushPositionsInput {
  friends: [Int!]
  enemies: [Int!]
}
input PushIntoPlaceInput {
  citizens: PersonCreateOrPushChildrenInput
  visitors: PersonCreateOrPushChildrenInput
}
input PlacePushPositionsInput {
  citizens: [Int!]
  visitors: [Int!]
}
input PersonUpdateInput {
  firstName: String
  lastName: String
  friends: PersonCreateOrPushThru_friends_FieldChildrenInput
  enemies: PersonCreateOrPushChildrenInput
  location: PlaceCreateChildInput
  favoritePlace: PlaceCreateChildInput
}
input PlaceUpdateInput {
  name: String
  citizens: PersonCreateOrPushThru_location_FieldChildrenInput
  visitors: PersonCreateOrPushChildrenInput
}
enum PersonFieldNamesEnum {
  firstName
  lastName
  friends
  enemies
  location
  favoritePlace
}
type UpdatedPersonPayload {
  node: Person
  previousNode: Person
  updatedFields: [PersonFieldNamesEnum!]
}
enum PlaceFieldNamesEnum {
  name
  citizens
  visitors
}
type UpdatedPlacePayload {
  node: Place
  previousNode: Place
  updatedFields: [PlaceFieldNamesEnum!]
}
type Query {
  childPerson(whereOne: PersonWhereOneInput!): Person!
  childPlace(whereOne: PlaceWhereOneInput!): Place!
  childPeople(where: PersonWhereInput, sort: PersonSortInput, pagination: PaginationInput): [Person!]!
  childPlaces(where: PlaceWhereInput, sort: PlaceSortInput, pagination: PaginationInput): [Place!]!
  PersonCount(where: PersonWhereInput): Int!
  PlaceCount(where: PlaceWhereInput): Int!
  PersonDistinctValues(where: PersonWhereInput, options: PersonDistinctValuesOptionsInput): [String!]!
  PlaceDistinctValues(where: PlaceWhereInput, options: PlaceDistinctValuesOptionsInput): [String!]!
  Person(whereOne: PersonWhereOneInput!): Person!
  Place(whereOne: PlaceWhereOneInput!): Place!
  People(where: PersonWhereInput, sort: PersonSortInput, pagination: PaginationInput): [Person!]!
  Places(where: PlaceWhereInput, sort: PlaceSortInput, pagination: PaginationInput): [Place!]!
  PeopleByUnique(where: PersonWhereByUniqueInput!, sort: PersonSortInput): [Person!]!
  PlacesByUnique(where: PlaceWhereByUniqueInput!, sort: PlaceSortInput): [Place!]!
}
type Mutation {
  copyPerson(whereOnes: PersonCopyWhereOnesInput!, options: copyPersonOptionsInput, whereOne: PersonWhereOneToCopyInput): Person!
  createManyPeople(data: [PersonCreateInput!]!): [Person!]!
  createManyPlaces(data: [PlaceCreateInput!]!): [Place!]!
  createPerson(data: PersonCreateInput!): Person!
  createPlace(data: PlaceCreateInput!): Place!
  deleteFilteredPeople(where: PersonWhereInput): [Person!]!
  deleteFilteredPlaces(where: PlaceWhereInput): [Place!]!
  deleteFilteredPeopleReturnScalar(where: PersonWhereInput): Int!
  deleteFilteredPlacesReturnScalar(where: PlaceWhereInput): Int!
  deleteFilteredPlacesWithChildren(where: PlaceWhereInput, options: deletePlaceWithChildrenOptionsInput): [Place!]!
  deleteFilteredPlacesWithChildrenReturnScalar(where: PlaceWhereInput, options: deletePlaceWithChildrenOptionsInput): Int!
  deleteManyPeople(whereOne: [PersonWhereOneInput!]!): [Person!]!
  deleteManyPlaces(whereOne: [PlaceWhereOneInput!]!): [Place!]!
  deleteManyPlacesWithChildren(whereOne: [PlaceWhereOneInput!]!, options: deletePlaceWithChildrenOptionsInput): [Place!]!
  deletePerson(whereOne: PersonWhereOneInput!): Person!
  deletePlace(whereOne: PlaceWhereOneInput!): Place!
  deletePlaceWithChildren(whereOne: PlaceWhereOneInput!, options: deletePlaceWithChildrenOptionsInput): Place!
  importPeople(file: Upload!, options: ImportOptionsInput): [Person!]!
  importPlaces(file: Upload!, options: ImportOptionsInput): [Place!]!
  pushIntoPerson(whereOne: PersonWhereOneInput!, data: PushIntoPersonInput!, positions: PersonPushPositionsInput): Person!
  pushIntoPlace(whereOne: PlaceWhereOneInput!, data: PushIntoPlaceInput!, positions: PlacePushPositionsInput): Place!
  updateFilteredPeople(where: PersonWhereInput, data: PersonUpdateInput!): [Person!]!
  updateFilteredPlaces(where: PlaceWhereInput, data: PlaceUpdateInput!): [Place!]!
  updateFilteredPeopleReturnScalar(where: PersonWhereInput, data: PersonUpdateInput!): Int!
  updateFilteredPlacesReturnScalar(where: PlaceWhereInput, data: PlaceUpdateInput!): Int!
  updateManyPeople(whereOne: [PersonWhereOneInput!]!, data: [PersonUpdateInput!]!): [Person!]!
  updateManyPlaces(whereOne: [PlaceWhereOneInput!]!, data: [PlaceUpdateInput!]!): [Place!]!
  updatePerson(whereOne: PersonWhereOneInput!, data: PersonUpdateInput!): Person!
  updatePlace(whereOne: PlaceWhereOneInput!, data: PlaceUpdateInput!): Place!
}
type Subscription {
  createdPerson(where: PersonWhereInput): Person!
  updatedPerson(where: PersonWhereInput): UpdatedPersonPayload!
  deletedPerson(where: PersonWhereInput): Person!
  createdPlace(where: PlaceWhereInput): Place!
  updatedPlace(where: PlaceWhereInput): UpdatedPlacePayload!
  deletedPlace(where: PlaceWhereInput): Place!
}`;

    const result = composeGqlTypes(generalConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should create things types with inventory for only queries', () => {
    const thingConfig: ThingConfig = {
      name: 'Example',
      textFields: [
        {
          name: 'textField',
        },
      ],
    };
    const thingConfigs = { Example: thingConfig };
    const inventory: Inventory = { name: 'test', include: { Query: true } };
    const generalConfig: GeneralConfig = { thingConfigs, inventory };
    const expectedResult = `scalar DateTime
scalar Upload
input RegExp {
  pattern: String!
  flags: String
}
input SliceInput {
  begin: Int
  end: Int
}
type Example {
  id: ID!
  createdAt: DateTime!
  updatedAt: DateTime!
  textField: String
}
input ExampleWhereOneInput {
  id: ID!
}
input ExampleWhereInput {
  id_in: [ID!]
  id_nin: [ID!]
  createdAt_in: [DateTime!]
  createdAt_nin: [DateTime!]
  createdAt_ne: DateTime
  createdAt_gt: DateTime
  createdAt_gte: DateTime
  createdAt_lt: DateTime
  createdAt_lte: DateTime
  updatedAt_in: [DateTime!]
  updatedAt_nin: [DateTime!]
  updatedAt_ne: DateTime
  updatedAt_gt: DateTime
  updatedAt_gte: DateTime
  updatedAt_lt: DateTime
  updatedAt_lte: DateTime
  AND: [ExampleWhereInput!]
  NOR: [ExampleWhereInput!]
  OR: [ExampleWhereInput!]
}
input ExampleWhereWithoutBooleanOperationsInput {
  id_in: [ID!]
  id_nin: [ID!]
  createdAt_in: [DateTime!]
  createdAt_nin: [DateTime!]
  createdAt_ne: DateTime
  createdAt_gt: DateTime
  createdAt_gte: DateTime
  createdAt_lt: DateTime
  createdAt_lte: DateTime
  updatedAt_in: [DateTime!]
  updatedAt_nin: [DateTime!]
  updatedAt_ne: DateTime
  updatedAt_gt: DateTime
  updatedAt_gte: DateTime
  updatedAt_lt: DateTime
  updatedAt_lte: DateTime
}
enum ExampleSortEnum {
  createdAt_ASC
  createdAt_DESC
  updatedAt_ASC
  updatedAt_DESC
}
input ExampleSortInput {
  sortBy: [ExampleSortEnum]
}
input PaginationInput {
  skip: Int
  first: Int
}
enum ExampleTextNamesEnum {
  textField
}
input ExampleDistinctValuesOptionsInput {
  target: ExampleTextNamesEnum!
}
input ExampleWhereByUniqueInput {
  id_in: [ID!]
}
type Query {
  childExample(whereOne: ExampleWhereOneInput!): Example!
  childExamples(where: ExampleWhereInput, sort: ExampleSortInput, pagination: PaginationInput): [Example!]!
  ExampleCount(where: ExampleWhereInput): Int!
  ExampleDistinctValues(where: ExampleWhereInput, options: ExampleDistinctValuesOptionsInput): [String!]!
  Example(whereOne: ExampleWhereOneInput!): Example!
  Examples(where: ExampleWhereInput, sort: ExampleSortInput, pagination: PaginationInput): [Example!]!
  ExamplesByUnique(where: ExampleWhereByUniqueInput!, sort: ExampleSortInput): [Example!]!
}`;

    const result = composeGqlTypes(generalConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should create things types with inventory for only mutations', () => {
    const thingConfig: ThingConfig = {
      name: 'Example',
      textFields: [
        {
          name: 'textField',
          index: true,
        },
      ],
    };
    const thingConfigs = { Example: thingConfig };
    const inventory: Inventory = { name: 'test', include: { Mutation: true } };
    const generalConfig: GeneralConfig = { thingConfigs, inventory };

    const expectedResult = `scalar DateTime
scalar Upload
input RegExp {
  pattern: String!
  flags: String
}
input SliceInput {
  begin: Int
  end: Int
}
type Example {
  id: ID!
  createdAt: DateTime!
  updatedAt: DateTime!
  textField: String
}
input ExampleCreateInput {
  id: ID
  textField: String
}
input ExampleCreateChildInput {
  connect: ID
  create: ExampleCreateInput
}
input ExampleCreateOrPushChildrenInput {
  connect: [ID!]
  create: [ExampleCreateInput!]
  createPositions: [Int!]
}
input ExampleWhereInput {
  id_in: [ID!]
  id_nin: [ID!]
  createdAt_in: [DateTime!]
  createdAt_nin: [DateTime!]
  createdAt_ne: DateTime
  createdAt_gt: DateTime
  createdAt_gte: DateTime
  createdAt_lt: DateTime
  createdAt_lte: DateTime
  updatedAt_in: [DateTime!]
  updatedAt_nin: [DateTime!]
  updatedAt_ne: DateTime
  updatedAt_gt: DateTime
  updatedAt_gte: DateTime
  updatedAt_lt: DateTime
  updatedAt_lte: DateTime
  textField: String
  textField_in: [String!]
  textField_nin: [String!]
  textField_ne: String
  textField_re: [RegExp!]
  textField_exists: Boolean
  AND: [ExampleWhereInput!]
  NOR: [ExampleWhereInput!]
  OR: [ExampleWhereInput!]
}
input ExampleWhereWithoutBooleanOperationsInput {
  id_in: [ID!]
  id_nin: [ID!]
  createdAt_in: [DateTime!]
  createdAt_nin: [DateTime!]
  createdAt_ne: DateTime
  createdAt_gt: DateTime
  createdAt_gte: DateTime
  createdAt_lt: DateTime
  createdAt_lte: DateTime
  updatedAt_in: [DateTime!]
  updatedAt_nin: [DateTime!]
  updatedAt_ne: DateTime
  updatedAt_gt: DateTime
  updatedAt_gte: DateTime
  updatedAt_lt: DateTime
  updatedAt_lte: DateTime
  textField: String
  textField_in: [String!]
  textField_nin: [String!]
  textField_ne: String
  textField_re: [RegExp!]
  textField_exists: Boolean
}
input ExampleWhereOneInput {
  id: ID!
}
enum ImportFormatEnum {
  csv
  json
}
input ImportOptionsInput {
  format: ImportFormatEnum
}
input ExampleUpdateInput {
  textField: String
}
type Mutation {
  createManyExamples(data: [ExampleCreateInput!]!): [Example!]!
  createExample(data: ExampleCreateInput!): Example!
  deleteFilteredExamples(where: ExampleWhereInput): [Example!]!
  deleteFilteredExamplesReturnScalar(where: ExampleWhereInput): Int!
  deleteManyExamples(whereOne: [ExampleWhereOneInput!]!): [Example!]!
  deleteExample(whereOne: ExampleWhereOneInput!): Example!
  importExamples(file: Upload!, options: ImportOptionsInput): [Example!]!
  updateFilteredExamples(where: ExampleWhereInput, data: ExampleUpdateInput!): [Example!]!
  updateFilteredExamplesReturnScalar(where: ExampleWhereInput, data: ExampleUpdateInput!): Int!
  updateManyExamples(whereOne: [ExampleWhereOneInput!]!, data: [ExampleUpdateInput!]!): [Example!]!
  updateExample(whereOne: ExampleWhereOneInput!, data: ExampleUpdateInput!): Example!
}`;

    const result = composeGqlTypes(generalConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should create things types with inventory for only things query', () => {
    const thingConfig: ThingConfig = {
      name: 'Example',
      textFields: [
        {
          name: 'textField',
        },
      ],
    };
    const thingConfigs = { Example: thingConfig };
    const inventory: Inventory = { name: 'test', include: { Query: { things: true } } };
    const generalConfig: GeneralConfig = { thingConfigs, inventory };

    const expectedResult = `scalar DateTime
scalar Upload
input RegExp {
  pattern: String!
  flags: String
}
input SliceInput {
  begin: Int
  end: Int
}
type Example {
  id: ID!
  createdAt: DateTime!
  updatedAt: DateTime!
  textField: String
}
input ExampleWhereInput {
  id_in: [ID!]
  id_nin: [ID!]
  createdAt_in: [DateTime!]
  createdAt_nin: [DateTime!]
  createdAt_ne: DateTime
  createdAt_gt: DateTime
  createdAt_gte: DateTime
  createdAt_lt: DateTime
  createdAt_lte: DateTime
  updatedAt_in: [DateTime!]
  updatedAt_nin: [DateTime!]
  updatedAt_ne: DateTime
  updatedAt_gt: DateTime
  updatedAt_gte: DateTime
  updatedAt_lt: DateTime
  updatedAt_lte: DateTime
  AND: [ExampleWhereInput!]
  NOR: [ExampleWhereInput!]
  OR: [ExampleWhereInput!]
}
input ExampleWhereWithoutBooleanOperationsInput {
  id_in: [ID!]
  id_nin: [ID!]
  createdAt_in: [DateTime!]
  createdAt_nin: [DateTime!]
  createdAt_ne: DateTime
  createdAt_gt: DateTime
  createdAt_gte: DateTime
  createdAt_lt: DateTime
  createdAt_lte: DateTime
  updatedAt_in: [DateTime!]
  updatedAt_nin: [DateTime!]
  updatedAt_ne: DateTime
  updatedAt_gt: DateTime
  updatedAt_gte: DateTime
  updatedAt_lt: DateTime
  updatedAt_lte: DateTime
}
enum ExampleSortEnum {
  createdAt_ASC
  createdAt_DESC
  updatedAt_ASC
  updatedAt_DESC
}
input ExampleSortInput {
  sortBy: [ExampleSortEnum]
}
input PaginationInput {
  skip: Int
  first: Int
}
type Query {
  Examples(where: ExampleWhereInput, sort: ExampleSortInput, pagination: PaginationInput): [Example!]!
}`;

    const result = composeGqlTypes(generalConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should create things types with inventory for only things query for Example config', () => {
    const thingConfig: ThingConfig = {
      name: 'Example',
      textFields: [
        {
          name: 'textField',
        },
      ],
    };
    const thingConfigs = { Example: thingConfig };
    const inventory: Inventory = { name: 'test', include: { Query: { things: ['Example'] } } };
    const generalConfig: GeneralConfig = { thingConfigs, inventory };
    const expectedResult = `scalar DateTime
scalar Upload
input RegExp {
  pattern: String!
  flags: String
}
input SliceInput {
  begin: Int
  end: Int
}
type Example {
  id: ID!
  createdAt: DateTime!
  updatedAt: DateTime!
  textField: String
}
input ExampleWhereInput {
  id_in: [ID!]
  id_nin: [ID!]
  createdAt_in: [DateTime!]
  createdAt_nin: [DateTime!]
  createdAt_ne: DateTime
  createdAt_gt: DateTime
  createdAt_gte: DateTime
  createdAt_lt: DateTime
  createdAt_lte: DateTime
  updatedAt_in: [DateTime!]
  updatedAt_nin: [DateTime!]
  updatedAt_ne: DateTime
  updatedAt_gt: DateTime
  updatedAt_gte: DateTime
  updatedAt_lt: DateTime
  updatedAt_lte: DateTime
  AND: [ExampleWhereInput!]
  NOR: [ExampleWhereInput!]
  OR: [ExampleWhereInput!]
}
input ExampleWhereWithoutBooleanOperationsInput {
  id_in: [ID!]
  id_nin: [ID!]
  createdAt_in: [DateTime!]
  createdAt_nin: [DateTime!]
  createdAt_ne: DateTime
  createdAt_gt: DateTime
  createdAt_gte: DateTime
  createdAt_lt: DateTime
  createdAt_lte: DateTime
  updatedAt_in: [DateTime!]
  updatedAt_nin: [DateTime!]
  updatedAt_ne: DateTime
  updatedAt_gt: DateTime
  updatedAt_gte: DateTime
  updatedAt_lt: DateTime
  updatedAt_lte: DateTime
}
enum ExampleSortEnum {
  createdAt_ASC
  createdAt_DESC
  updatedAt_ASC
  updatedAt_DESC
}
input ExampleSortInput {
  sortBy: [ExampleSortEnum]
}
input PaginationInput {
  skip: Int
  first: Int
}
type Query {
  Examples(where: ExampleWhereInput, sort: ExampleSortInput, pagination: PaginationInput): [Example!]!
}`;

    const result = composeGqlTypes(generalConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should create things types with inventory for only create mutations', () => {
    const thingConfig: ThingConfig = {
      name: 'Example',
      textFields: [
        {
          name: 'textField',
          index: true,
        },
      ],
    };
    const thingConfigs = { Example: thingConfig };
    const inventory: Inventory = { name: 'test', include: { Mutation: { createThing: true } } };
    const generalConfig: GeneralConfig = { thingConfigs, inventory };
    const expectedResult = `scalar DateTime
scalar Upload
input RegExp {
  pattern: String!
  flags: String
}
input SliceInput {
  begin: Int
  end: Int
}
type Example {
  id: ID!
  createdAt: DateTime!
  updatedAt: DateTime!
  textField: String
}
input ExampleCreateInput {
  id: ID
  textField: String
}
input ExampleCreateChildInput {
  connect: ID
  create: ExampleCreateInput
}
input ExampleCreateOrPushChildrenInput {
  connect: [ID!]
  create: [ExampleCreateInput!]
  createPositions: [Int!]
}
type Mutation {
  createExample(data: ExampleCreateInput!): Example!
}`;

    const result = composeGqlTypes(generalConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should create things types with inventory for only mutation cretateThing', () => {
    const thingConfig: ThingConfig = {
      name: 'Example',
      textFields: [
        {
          name: 'textField',
          index: true,
        },
      ],
    };
    const thingConfigs = { Example: thingConfig };
    const inventory: Inventory = {
      name: 'test',
      include: { Mutation: { createThing: ['Example'] } },
    };
    const generalConfig: GeneralConfig = { thingConfigs, inventory };
    const expectedResult = `scalar DateTime
scalar Upload
input RegExp {
  pattern: String!
  flags: String
}
input SliceInput {
  begin: Int
  end: Int
}
type Example {
  id: ID!
  createdAt: DateTime!
  updatedAt: DateTime!
  textField: String
}
input ExampleCreateInput {
  id: ID
  textField: String
}
input ExampleCreateChildInput {
  connect: ID
  create: ExampleCreateInput
}
input ExampleCreateOrPushChildrenInput {
  connect: [ID!]
  create: [ExampleCreateInput!]
  createPositions: [Int!]
}
type Mutation {
  createExample(data: ExampleCreateInput!): Example!
}`;

    const result = composeGqlTypes(generalConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should create things types with inventory for only one custom mutation loadThing', () => {
    const signatureMethods: ActionSignatureMethods = {
      name: 'loadThing',
      specificName: ({ name }) => `load${name}`,
      argNames: () => ['path'],
      argTypes: () => ['String!'],
      type: ({ name }) => name,
      config: (thingConfig) => thingConfig,
    };

    const thingConfig: ThingConfig = {
      name: 'Example',
      textFields: [
        {
          name: 'textField',
          index: true,
        },
      ],
    };

    const thingConfigs = { Example: thingConfig };
    const inventory: Inventory = { name: 'test', include: { Mutation: { loadThing: true } } };
    const custom = { Mutation: { loadThing: signatureMethods } };
    const generalConfig: GeneralConfig = { thingConfigs, custom, inventory };
    const expectedResult = `scalar DateTime
scalar Upload
input RegExp {
  pattern: String!
  flags: String
}
input SliceInput {
  begin: Int
  end: Int
}
type Example {
  id: ID!
  createdAt: DateTime!
  updatedAt: DateTime!
  textField: String
}
type Mutation {
  loadExample(path: String!): Example
}`;

    const result = composeGqlTypes(generalConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should create things types with inventory for only one custom query getThing', () => {
    const getThing: ActionSignatureMethods = {
      name: 'getThing',
      specificName: ({ name }) => `get${name}`,
      argNames: () => ['path'],
      argTypes: () => ['String!'],
      type: ({ name }) => name,
      config: (thingConfig) => thingConfig,
    };

    const thingConfig: ThingConfig = {
      name: 'Example',
      textFields: [
        {
          name: 'textField',
          index: true,
        },
      ],
    };

    const thingConfigs = { Example: thingConfig };
    const inventory: Inventory = { name: 'test', include: { Query: { getThing: true } } };
    const custom = { Query: { getThing } };
    const generalConfig: GeneralConfig = { thingConfigs, custom, inventory };
    const expectedResult = `scalar DateTime
scalar Upload
input RegExp {
  pattern: String!
  flags: String
}
input SliceInput {
  begin: Int
  end: Int
}
type Example {
  id: ID!
  createdAt: DateTime!
  updatedAt: DateTime!
  textField: String
}
type Query {
  getExample(path: String!): Example
}`;

    const result = composeGqlTypes(generalConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should create things types with custom input and return objects', () => {
    const thingInTimeRangeInput: ObjectSignatureMethods = {
      name: 'thingTimeRangeInput',
      specificName: ({ name }) => `${name}TimeRangeInput`,
      fieldNames: () => ['start', 'end'],
      fieldTypes: () => ['DateTime!', 'DateTime!'],
    };

    const ForCatalogDerivative: DerivativeAttributes = {
      allow: { Example: ['things', 'updateThing'] },
      suffix: 'ForCatalog',
      addFields: {
        Example: {
          dateTimeFields: [{ name: 'start', required: true }, { name: 'end' }],
        },
      },
    };

    const thingInTimeRangeQuery: ActionSignatureMethods = {
      name: 'thingInTimeRangeQuery',
      specificName: ({ name }) => `${name}InTimeRangeQuery`,
      argNames: () => ['range'],
      argTypes: ({ name }) => [`${name}TimeRangeInput!`],
      type: ({ name }) => `${name}InTimeRange`,
      config: (thingConfig) => thingConfig,
    };

    const thingConfig: ThingConfig = {
      name: 'Example',
      textFields: [
        {
          name: 'textField',
          index: true,
        },
      ],
    };

    const thingConfigs = { Example: thingConfig };
    const inventory: Inventory = {
      name: 'test',
      include: {
        Query: { thingsForCatalog: true, things: true },
        Mutation: { updateThingForCatalog: true },
      },
      // include: { Query: true, Mutation: true },
    };
    const custom = {
      Input: { thingInTimeRangeInput },
      Query: { thingInTimeRangeQuery },
    };
    const derivative = { ForCatalog: ForCatalogDerivative };
    const generalConfig: GeneralConfig = { thingConfigs, custom, derivative, inventory };
    const expectedResult = `scalar DateTime
scalar Upload
input RegExp {
  pattern: String!
  flags: String
}
input SliceInput {
  begin: Int
  end: Int
}
type Example {
  id: ID!
  createdAt: DateTime!
  updatedAt: DateTime!
  textField: String
}
type ExampleForCatalog {
  id: ID!
  createdAt: DateTime!
  updatedAt: DateTime!
  textField: String
  start: DateTime!
  end: DateTime
}
input ExampleWhereInput {
  id_in: [ID!]
  id_nin: [ID!]
  createdAt_in: [DateTime!]
  createdAt_nin: [DateTime!]
  createdAt_ne: DateTime
  createdAt_gt: DateTime
  createdAt_gte: DateTime
  createdAt_lt: DateTime
  createdAt_lte: DateTime
  updatedAt_in: [DateTime!]
  updatedAt_nin: [DateTime!]
  updatedAt_ne: DateTime
  updatedAt_gt: DateTime
  updatedAt_gte: DateTime
  updatedAt_lt: DateTime
  updatedAt_lte: DateTime
  textField: String
  textField_in: [String!]
  textField_nin: [String!]
  textField_ne: String
  textField_re: [RegExp!]
  textField_exists: Boolean
  AND: [ExampleWhereInput!]
  NOR: [ExampleWhereInput!]
  OR: [ExampleWhereInput!]
}
input ExampleWhereWithoutBooleanOperationsInput {
  id_in: [ID!]
  id_nin: [ID!]
  createdAt_in: [DateTime!]
  createdAt_nin: [DateTime!]
  createdAt_ne: DateTime
  createdAt_gt: DateTime
  createdAt_gte: DateTime
  createdAt_lt: DateTime
  createdAt_lte: DateTime
  updatedAt_in: [DateTime!]
  updatedAt_nin: [DateTime!]
  updatedAt_ne: DateTime
  updatedAt_gt: DateTime
  updatedAt_gte: DateTime
  updatedAt_lt: DateTime
  updatedAt_lte: DateTime
  textField: String
  textField_in: [String!]
  textField_nin: [String!]
  textField_ne: String
  textField_re: [RegExp!]
  textField_exists: Boolean
}
enum ExampleSortEnum {
  createdAt_ASC
  createdAt_DESC
  updatedAt_ASC
  updatedAt_DESC
  textField_ASC
  textField_DESC
}
input ExampleSortInput {
  sortBy: [ExampleSortEnum]
}
input PaginationInput {
  skip: Int
  first: Int
}
input ExampleForCatalogWhereInput {
  id_in: [ID!]
  id_nin: [ID!]
  createdAt_in: [DateTime!]
  createdAt_nin: [DateTime!]
  createdAt_ne: DateTime
  createdAt_gt: DateTime
  createdAt_gte: DateTime
  createdAt_lt: DateTime
  createdAt_lte: DateTime
  updatedAt_in: [DateTime!]
  updatedAt_nin: [DateTime!]
  updatedAt_ne: DateTime
  updatedAt_gt: DateTime
  updatedAt_gte: DateTime
  updatedAt_lt: DateTime
  updatedAt_lte: DateTime
  textField: String
  textField_in: [String!]
  textField_nin: [String!]
  textField_ne: String
  textField_re: [RegExp!]
  textField_exists: Boolean
  AND: [ExampleForCatalogWhereInput!]
  NOR: [ExampleForCatalogWhereInput!]
  OR: [ExampleForCatalogWhereInput!]
}
input ExampleForCatalogWhereWithoutBooleanOperationsInput {
  id_in: [ID!]
  id_nin: [ID!]
  createdAt_in: [DateTime!]
  createdAt_nin: [DateTime!]
  createdAt_ne: DateTime
  createdAt_gt: DateTime
  createdAt_gte: DateTime
  createdAt_lt: DateTime
  createdAt_lte: DateTime
  updatedAt_in: [DateTime!]
  updatedAt_nin: [DateTime!]
  updatedAt_ne: DateTime
  updatedAt_gt: DateTime
  updatedAt_gte: DateTime
  updatedAt_lt: DateTime
  updatedAt_lte: DateTime
  textField: String
  textField_in: [String!]
  textField_nin: [String!]
  textField_ne: String
  textField_re: [RegExp!]
  textField_exists: Boolean
}
enum ExampleForCatalogSortEnum {
  createdAt_ASC
  createdAt_DESC
  updatedAt_ASC
  updatedAt_DESC
  textField_ASC
  textField_DESC
}
input ExampleForCatalogSortInput {
  sortBy: [ExampleForCatalogSortEnum]
}
input ExampleForCatalogWhereOneInput {
  id: ID!
}
input ExampleForCatalogUpdateInput {
  textField: String
  start: DateTime
  end: DateTime
}
input ExampleTimeRangeInput {
  start: DateTime!
  end: DateTime!
}
type Query {
  Examples(where: ExampleWhereInput, sort: ExampleSortInput, pagination: PaginationInput): [Example!]!
  ExamplesForCatalog(where: ExampleForCatalogWhereInput, sort: ExampleForCatalogSortInput, pagination: PaginationInput): [ExampleForCatalog!]!
}
type Mutation {
  updateExampleForCatalog(whereOne: ExampleForCatalogWhereOneInput!, data: ExampleForCatalogUpdateInput!): ExampleForCatalog!
}`;

    const result = composeGqlTypes(generalConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should create derivative inputs for custom types with inventory for only one custom query getThing', () => {
    const childNameFromParenName = { Menu: 'MenuSection' };

    const updateThingWithChildren: ActionSignatureMethods = {
      name: 'updateThingWithChildren',
      specificName: ({ name }) => (name === 'Menu' ? `update${name}WithChildren` : ''),
      argNames: () => ['whereOne', 'data', 'childWhereOne', 'childData', 'deleteWhereOne'],
      argTypes: ({ name }) => [
        `${name}WhereOneInput!`,
        `${name}UpdateInput`,
        `[${childNameFromParenName[name]}WhereOneInput!]!`,
        `[${childNameFromParenName[name]}UpdateInput!]!`,
        `[${childNameFromParenName[name]}WhereOneInput!]!`,
      ],
      type: ({ name }) => name,
      config: (thingConfig) => thingConfig,
    };

    const menuSectionConfig: ThingConfig = {};
    const menuConfig: ThingConfig = {
      name: 'Menu',
      textFields: [
        {
          name: 'menuName',
          index: true,
        },
      ],
      duplexFields: [
        {
          name: 'sections',
          config: menuSectionConfig,
          oppositeName: 'root',
          array: true,
        },
      ],
    };

    Object.assign(menuSectionConfig, {
      name: 'MenuSection',
      textFields: [
        {
          name: 'menuSectionName',
          index: true,
        },
      ],
      duplexFields: [
        {
          name: 'root',
          config: menuConfig,
          oppositeName: 'sections',
        },
      ],
    });

    const thingConfigs = { Menu: menuConfig, MenuSection: menuSectionConfig };
    const inventory: Inventory = {
      name: 'test',
      include: { Mutation: { updateThingWithChildren: ['Menu'] } },
    };
    const custom = { Mutation: { updateThingWithChildren } };
    const derivativeInputs = {
      '': {
        suffix: '',
        allow: {
          Menu: ['thingWhereOneInput', 'thingUpdateInput'],
          MenuSection: ['thingWhereOneInput', 'thingUpdateInput'],
        },
      },
    };
    const generalConfig: GeneralConfig = { thingConfigs, custom, derivativeInputs, inventory };
    const expectedResult = `scalar DateTime
scalar Upload
input RegExp {
  pattern: String!
  flags: String
}
input SliceInput {
  begin: Int
  end: Int
}
type Menu {
  id: ID!
  createdAt: DateTime!
  updatedAt: DateTime!
  menuName: String
  sections(where: MenuSectionWhereInput, sort: MenuSectionSortInput, pagination: PaginationInput): [MenuSection!]!
}
type MenuSection {
  id: ID!
  createdAt: DateTime!
  updatedAt: DateTime!
  menuSectionName: String
  root: Menu
}
input MenuSectionWhereInput {
  id_in: [ID!]
  id_nin: [ID!]
  createdAt_in: [DateTime!]
  createdAt_nin: [DateTime!]
  createdAt_ne: DateTime
  createdAt_gt: DateTime
  createdAt_gte: DateTime
  createdAt_lt: DateTime
  createdAt_lte: DateTime
  updatedAt_in: [DateTime!]
  updatedAt_nin: [DateTime!]
  updatedAt_ne: DateTime
  updatedAt_gt: DateTime
  updatedAt_gte: DateTime
  updatedAt_lt: DateTime
  updatedAt_lte: DateTime
  menuSectionName: String
  menuSectionName_in: [String!]
  menuSectionName_nin: [String!]
  menuSectionName_ne: String
  menuSectionName_re: [RegExp!]
  menuSectionName_exists: Boolean
  AND: [MenuSectionWhereInput!]
  NOR: [MenuSectionWhereInput!]
  OR: [MenuSectionWhereInput!]
}
input MenuSectionWhereWithoutBooleanOperationsInput {
  id_in: [ID!]
  id_nin: [ID!]
  createdAt_in: [DateTime!]
  createdAt_nin: [DateTime!]
  createdAt_ne: DateTime
  createdAt_gt: DateTime
  createdAt_gte: DateTime
  createdAt_lt: DateTime
  createdAt_lte: DateTime
  updatedAt_in: [DateTime!]
  updatedAt_nin: [DateTime!]
  updatedAt_ne: DateTime
  updatedAt_gt: DateTime
  updatedAt_gte: DateTime
  updatedAt_lt: DateTime
  updatedAt_lte: DateTime
  menuSectionName: String
  menuSectionName_in: [String!]
  menuSectionName_nin: [String!]
  menuSectionName_ne: String
  menuSectionName_re: [RegExp!]
  menuSectionName_exists: Boolean
}
input MenuWhereInput {
  id_in: [ID!]
  id_nin: [ID!]
  createdAt_in: [DateTime!]
  createdAt_nin: [DateTime!]
  createdAt_ne: DateTime
  createdAt_gt: DateTime
  createdAt_gte: DateTime
  createdAt_lt: DateTime
  createdAt_lte: DateTime
  updatedAt_in: [DateTime!]
  updatedAt_nin: [DateTime!]
  updatedAt_ne: DateTime
  updatedAt_gt: DateTime
  updatedAt_gte: DateTime
  updatedAt_lt: DateTime
  updatedAt_lte: DateTime
  menuName: String
  menuName_in: [String!]
  menuName_nin: [String!]
  menuName_ne: String
  menuName_re: [RegExp!]
  menuName_exists: Boolean
  AND: [MenuWhereInput!]
  NOR: [MenuWhereInput!]
  OR: [MenuWhereInput!]
}
input MenuWhereWithoutBooleanOperationsInput {
  id_in: [ID!]
  id_nin: [ID!]
  createdAt_in: [DateTime!]
  createdAt_nin: [DateTime!]
  createdAt_ne: DateTime
  createdAt_gt: DateTime
  createdAt_gte: DateTime
  createdAt_lt: DateTime
  createdAt_lte: DateTime
  updatedAt_in: [DateTime!]
  updatedAt_nin: [DateTime!]
  updatedAt_ne: DateTime
  updatedAt_gt: DateTime
  updatedAt_gte: DateTime
  updatedAt_lt: DateTime
  updatedAt_lte: DateTime
  menuName: String
  menuName_in: [String!]
  menuName_nin: [String!]
  menuName_ne: String
  menuName_re: [RegExp!]
  menuName_exists: Boolean
}
enum MenuSectionSortEnum {
  createdAt_ASC
  createdAt_DESC
  updatedAt_ASC
  updatedAt_DESC
  menuSectionName_ASC
  menuSectionName_DESC
}
input MenuSectionSortInput {
  sortBy: [MenuSectionSortEnum]
}
input PaginationInput {
  skip: Int
  first: Int
}
input MenuWhereOneInput {
  id: ID!
}
input MenuUpdateInput {
  menuName: String
  sections: MenuSectionCreateOrPushChildrenInput
}
input MenuSectionCreateInput {
  id: ID
  root: MenuCreateChildInput
  menuSectionName: String
}
input MenuSectionCreateChildInput {
  connect: ID
  create: MenuSectionCreateInput
}
input MenuSectionCreateOrPushChildrenInput {
  connect: [ID!]
  create: [MenuSectionCreateInput!]
  createPositions: [Int!]
}
input MenuCreateInput {
  id: ID
  sections: MenuSectionCreateOrPushChildrenInput
  menuName: String
}
input MenuCreateChildInput {
  connect: ID
  create: MenuCreateInput
}
input MenuCreateOrPushChildrenInput {
  connect: [ID!]
  create: [MenuCreateInput!]
  createPositions: [Int!]
}
input MenuSectionWhereOneInput {
  id: ID!
}
input MenuSectionUpdateInput {
  menuSectionName: String
  root: MenuCreateChildInput
}
type Mutation {
  updateMenuWithChildren(whereOne: MenuWhereOneInput!, data: MenuUpdateInput, childWhereOne: [MenuSectionWhereOneInput!]!, childData: [MenuSectionUpdateInput!]!, deleteWhereOne: [MenuSectionWhereOneInput!]!): Menu
}`;

    const result = composeGqlTypes(generalConfig);
    expect(result).toEqual(expectedResult);
  });
});
