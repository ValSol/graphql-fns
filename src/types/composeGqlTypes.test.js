// @flow
/* eslint-env jest */

import type {
  GeneralConfig,
  Inventory,
  ActionSignatureMethods,
  DerivativeAttributes,
  ObjectSignatureMethods,
  EntityConfig,
} from '../flowTypes';

import composeGqlTypes from './composeGqlTypes';

describe('composeGqlTypes', () => {
  test('should create entities types to copy with children', () => {
    const menuCloneConfig: EntityConfig = {};
    const menuSectionConfig: EntityConfig = {};
    const menuCloneSectionConfig: EntityConfig = {};
    const menuConfig: EntityConfig = {
      name: 'Menu',
      type: 'tangible',

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
      type: 'tangible',

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
      type: 'tangible',

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
      type: 'tangible',

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

    const entityConfigs = {
      Menu: menuConfig,
      MenuClone: menuCloneConfig,
      MenuSection: menuSectionConfig,
      MenuCloneSection: menuCloneSectionConfig,
    };

    const generalConfig: GeneralConfig = { entityConfigs };

    const expectedResult = `scalar DateTime
scalar Upload
interface Node {
  id: ID!
}
input RegExp {
  pattern: String!
  flags: String
}
input SliceInput {
  begin: Int
  end: Int
}
type PageInfo {
  hasNextPage: Boolean!
  hasPreviousPage: Boolean!
  startCursor: String
  endCursor: String
}
type Menu implements Node {
  id: ID!
  createdAt: DateTime!
  updatedAt: DateTime!
  name: String!
  clone: MenuClone
  sections(where: MenuSectionWhereInput, sort: MenuSectionSortInput, pagination: PaginationInput): [MenuSection!]!
}
type MenuEdge {
  node: Menu
  cursor: String!
}
type MenuConnection {
  pageInfo: PageInfo!
  edges: [MenuEdge!]
}
type MenuClone implements Node {
  id: ID!
  createdAt: DateTime!
  updatedAt: DateTime!
  name: String!
  original: Menu
  sections(where: MenuCloneSectionWhereInput, sort: MenuCloneSectionSortInput, pagination: PaginationInput): [MenuCloneSection!]!
}
type MenuCloneEdge {
  node: MenuClone
  cursor: String!
}
type MenuCloneConnection {
  pageInfo: PageInfo!
  edges: [MenuCloneEdge!]
}
type MenuSection implements Node {
  id: ID!
  createdAt: DateTime!
  updatedAt: DateTime!
  name: String!
  menu: Menu
}
type MenuSectionEdge {
  node: MenuSection
  cursor: String!
}
type MenuSectionConnection {
  pageInfo: PageInfo!
  edges: [MenuSectionEdge!]
}
type MenuCloneSection implements Node {
  id: ID!
  createdAt: DateTime!
  updatedAt: DateTime!
  name: String!
  menu: MenuClone
}
type MenuCloneSectionEdge {
  node: MenuCloneSection
  cursor: String!
}
type MenuCloneSectionConnection {
  pageInfo: PageInfo!
  edges: [MenuCloneSectionEdge!]
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
  node(id: ID!): Node
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
  MenusThroughConnection(where: MenuWhereInput, sort: MenuSortInput, after: String, before: String, first: Int, last: Int): MenuConnection
  MenuClonesThroughConnection(where: MenuCloneWhereInput, sort: MenuCloneSortInput, after: String, before: String, first: Int, last: Int): MenuCloneConnection
  MenuSectionsThroughConnection(where: MenuSectionWhereInput, sort: MenuSectionSortInput, after: String, before: String, first: Int, last: Int): MenuSectionConnection
  MenuCloneSectionsThroughConnection(where: MenuCloneSectionWhereInput, sort: MenuCloneSectionSortInput, after: String, before: String, first: Int, last: Int): MenuCloneSectionConnection
  MenusByUnique(where: MenuWhereByUniqueInput!, sort: MenuSortInput): [Menu!]!
  MenuClonesByUnique(where: MenuCloneWhereByUniqueInput!, sort: MenuCloneSortInput): [MenuClone!]!
  MenuSectionsByUnique(where: MenuSectionWhereByUniqueInput!, sort: MenuSectionSortInput): [MenuSection!]!
  MenuCloneSectionsByUnique(where: MenuCloneSectionWhereByUniqueInput!, sort: MenuCloneSectionSortInput): [MenuCloneSection!]!
}
type Mutation {
  copyManyMenus(whereOnes: [MenuCopyWhereOnesInput!]!, options: copyMenuOptionsInput): [Menu!]!
  copyManyMenuClones(whereOnes: [MenuCloneCopyWhereOnesInput!]!, options: copyMenuCloneOptionsInput): [MenuClone!]!
  copyManyMenuSections(whereOnes: [MenuSectionCopyWhereOnesInput!]!, options: copyMenuSectionOptionsInput, whereOne: [MenuSectionWhereOneToCopyInput!]): [MenuSection!]!
  copyManyMenuCloneSections(whereOnes: [MenuCloneSectionCopyWhereOnesInput!]!, options: copyMenuCloneSectionOptionsInput, whereOne: [MenuCloneSectionWhereOneToCopyInput!]): [MenuCloneSection!]!
  copyManyMenusWithChildren(whereOnes: [MenuCopyWhereOnesInput!]!, options: copyMenuOptionsInput): [Menu!]!
  copyManyMenuClonesWithChildren(whereOnes: [MenuCloneCopyWhereOnesInput!]!, options: copyMenuCloneOptionsInput): [MenuClone!]!
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

  test('should create entities types for one entity', () => {
    const imageConfig: EntityConfig = {
      name: 'Image',
      type: 'file',
      textFields: [
        {
          name: 'fileId',
          required: true,
          freeze: true,
        },
        {
          name: 'address',
          freeze: true,
        },
        {
          name: 'text',
        },
      ],
    };

    const rootImageConfig: EntityConfig = {
      name: 'RootImage',
      type: 'tangibleFile',
      textFields: [
        {
          name: 'fileId',
          required: true,
          freeze: true,
        },
        {
          name: 'address',
          freeze: true,
        },
      ],
    };

    const entityConfig: EntityConfig = {
      name: 'Example',
      type: 'tangible',

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
    const entityConfigs = { Example: entityConfig, Image: imageConfig, RootImage: rootImageConfig };
    const enums = [
      { name: 'Weekdays', enum: ['a0', 'a1', 'a2', 'a3', 'a4', 'a5', 'a6'] },
      { name: 'Cuisines', enum: ['ukrainian', 'italian', 'georgian', 'japanese', 'chinese'] },
    ];
    const generalConfig: GeneralConfig = { entityConfigs, enums };

    const expectedResult = `scalar DateTime
scalar Upload
interface Node {
  id: ID!
}
input RegExp {
  pattern: String!
  flags: String
}
input SliceInput {
  begin: Int
  end: Int
}
type PageInfo {
  hasNextPage: Boolean!
  hasPreviousPage: Boolean!
  startCursor: String
  endCursor: String
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
type Example implements Node {
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
type ExampleEdge {
  node: Example
  cursor: String!
}
type ExampleConnection {
  pageInfo: PageInfo!
  edges: [ExampleEdge!]
}
type Image {
  id: ID!
  fileId: String!
  address: String
  text: String
}
type RootImage implements Node {
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
  textField1_gt: String
  textField1_gte: String
  textField1_lt: String
  textField1_lte: String
  textField1_re: [RegExp!]
  textField2: String
  textField2_in: [String!]
  textField2_nin: [String!]
  textField2_ne: String
  textField2_gt: String
  textField2_gte: String
  textField2_lt: String
  textField2_lte: String
  textField2_re: [RegExp!]
  textField2_exists: Boolean
  textField3: String
  textField3_in: [String!]
  textField3_nin: [String!]
  textField3_ne: String
  textField3_gt: String
  textField3_gte: String
  textField3_lt: String
  textField3_lte: String
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
  textField1_gt: String
  textField1_gte: String
  textField1_lt: String
  textField1_lte: String
  textField1_re: [RegExp!]
  textField2: String
  textField2_in: [String!]
  textField2_nin: [String!]
  textField2_ne: String
  textField2_gt: String
  textField2_gte: String
  textField2_lt: String
  textField2_lte: String
  textField2_re: [RegExp!]
  textField2_exists: Boolean
  textField3: String
  textField3_in: [String!]
  textField3_nin: [String!]
  textField3_ne: String
  textField3_gt: String
  textField3_gte: String
  textField3_lt: String
  textField3_lte: String
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
  geospatialField: ExampleGeospatialFieldNamesEnum!
  coordinates: GeospatialPointInput!
  maxDistance: Float
  minDistance: Float
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
  text: String
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
  text: String
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
  node(id: ID!): Node
  childExample(whereOne: ExampleWhereOneInput!): Example!
  childExamples(where: ExampleWhereInput, sort: ExampleSortInput, pagination: PaginationInput, near: ExampleNearInput, search: String): [Example!]!
  ExampleCount(where: ExampleWhereInput, near: ExampleNearInput, search: String): Int!
  ExampleDistinctValues(where: ExampleWhereInput, options: ExampleDistinctValuesOptionsInput): [String!]!
  RootImageFileCount(where: FileWhereInput): Int!
  RootImageFile(whereOne: FileWhereOneInput!): RootImage!
  RootImageFiles(where: FileWhereInput): [RootImage!]!
  Example(whereOne: ExampleWhereOneInput!): Example!
  Examples(where: ExampleWhereInput, sort: ExampleSortInput, pagination: PaginationInput, near: ExampleNearInput, search: String): [Example!]!
  ExamplesThroughConnection(where: ExampleWhereInput, sort: ExampleSortInput, near: ExampleNearInput, search: String, after: String, before: String, first: Int, last: Int): ExampleConnection
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
  uploadRootImageFiles(files: [Upload!]!, hashes: [String!]!): [RootImage!]!
}
type Subscription {
  createdExample(where: ExampleWhereInput): Example!
  updatedExample(where: ExampleWhereInput): UpdatedExamplePayload!
  deletedExample(where: ExampleWhereInput): Example!
}`;

    const result = composeGqlTypes(generalConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should create entities types for two entities', () => {
    const entityConfig1: EntityConfig = {
      name: 'Example1',
      type: 'tangible',
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
    const entityConfig2: EntityConfig = {
      name: 'Example2',
      type: 'tangible',
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
    const entityConfigs = { Example1: entityConfig1, Example2: entityConfig2 };
    const generalConfig: GeneralConfig = { entityConfigs };

    const expectedResult = `scalar DateTime
scalar Upload
interface Node {
  id: ID!
}
input RegExp {
  pattern: String!
  flags: String
}
input SliceInput {
  begin: Int
  end: Int
}
type PageInfo {
  hasNextPage: Boolean!
  hasPreviousPage: Boolean!
  startCursor: String
  endCursor: String
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
type Example1 implements Node {
  id: ID!
  createdAt: DateTime!
  updatedAt: DateTime!
  textField1: String
  textField2: String
  textField3: String!
  position: GeospatialPoint
}
type Example1Edge {
  node: Example1
  cursor: String!
}
type Example1Connection {
  pageInfo: PageInfo!
  edges: [Example1Edge!]
}
type Example2 implements Node {
  id: ID!
  createdAt: DateTime!
  updatedAt: DateTime!
  textField1(slice: SliceInput): [String!]!
  textField2(slice: SliceInput): [String!]!
  area: GeospatialPolygon
}
type Example2Edge {
  node: Example2
  cursor: String!
}
type Example2Connection {
  pageInfo: PageInfo!
  edges: [Example2Edge!]
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
  geospatialField: Example1GeospatialFieldNamesEnum!
  coordinates: GeospatialPointInput!
  maxDistance: Float
  minDistance: Float
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
  node(id: ID!): Node
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
  Example1sThroughConnection(where: Example1WhereInput, sort: Example1SortInput, near: Example1NearInput, after: String, before: String, first: Int, last: Int): Example1Connection
  Example2sThroughConnection(where: Example2WhereInput, sort: Example2SortInput, after: String, before: String, first: Int, last: Int): Example2Connection
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
  test('should create entities types for two related fields', () => {
    const placeConfig: EntityConfig = {
      name: 'Place',
      type: 'tangible',
      textFields: [
        {
          name: 'title',
          required: true,
        },
      ],
    };
    const personConfig: EntityConfig = {};
    Object.assign(personConfig, {
      name: 'Person',
      type: 'tangible',
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
    const entityConfigs = { Person: personConfig, Place: placeConfig };
    const generalConfig: GeneralConfig = { entityConfigs };

    const expectedResult = `scalar DateTime
scalar Upload
interface Node {
  id: ID!
}
input RegExp {
  pattern: String!
  flags: String
}
input SliceInput {
  begin: Int
  end: Int
}
type PageInfo {
  hasNextPage: Boolean!
  hasPreviousPage: Boolean!
  startCursor: String
  endCursor: String
}
type Person implements Node {
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
type PersonEdge {
  node: Person
  cursor: String!
}
type PersonConnection {
  pageInfo: PageInfo!
  edges: [PersonEdge!]
}
type Place implements Node {
  id: ID!
  createdAt: DateTime!
  updatedAt: DateTime!
  title: String!
}
type PlaceEdge {
  node: Place
  cursor: String!
}
type PlaceConnection {
  pageInfo: PageInfo!
  edges: [PlaceEdge!]
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
  node(id: ID!): Node
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
  PeopleThroughConnection(where: PersonWhereInput, sort: PersonSortInput, after: String, before: String, first: Int, last: Int): PersonConnection
  PlacesThroughConnection(where: PlaceWhereInput, sort: PlaceSortInput, after: String, before: String, first: Int, last: Int): PlaceConnection
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

  test('should create entities types for regular and embedded fields', () => {
    const addressConfig: EntityConfig = {
      name: 'Address',
      type: 'embedded',
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
    const personConfig: EntityConfig = {
      name: 'Person',
      type: 'tangible',
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
    const entityConfigs = { Person: personConfig, Address: addressConfig };
    const generalConfig: GeneralConfig = { entityConfigs };

    const expectedResult = `scalar DateTime
scalar Upload
interface Node {
  id: ID!
}
input RegExp {
  pattern: String!
  flags: String
}
input SliceInput {
  begin: Int
  end: Int
}
type PageInfo {
  hasNextPage: Boolean!
  hasPreviousPage: Boolean!
  startCursor: String
  endCursor: String
}
type Person implements Node {
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
type PersonEdge {
  node: Person
  cursor: String!
}
type PersonConnection {
  pageInfo: PageInfo!
  edges: [PersonEdge!]
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
  node(id: ID!): Node
  childPerson(whereOne: PersonWhereOneInput!): Person!
  childPeople(where: PersonWhereInput, sort: PersonSortInput, pagination: PaginationInput): [Person!]!
  PersonCount(where: PersonWhereInput): Int!
  PersonDistinctValues(where: PersonWhereInput, options: PersonDistinctValuesOptionsInput): [String!]!
  Person(whereOne: PersonWhereOneInput!): Person!
  People(where: PersonWhereInput, sort: PersonSortInput, pagination: PaginationInput): [Person!]!
  PeopleThroughConnection(where: PersonWhereInput, sort: PersonSortInput, after: String, before: String, first: Int, last: Int): PersonConnection
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

  test('should create entities types for two duplex fields', () => {
    const personConfig: EntityConfig = {};
    const placeConfig: EntityConfig = {
      name: 'Place',
      type: 'tangible',
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
      type: 'tangible',
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
    const entityConfigs = { Person: personConfig, Place: placeConfig };
    const generalConfig: GeneralConfig = { entityConfigs };

    const expectedResult = `scalar DateTime
scalar Upload
interface Node {
  id: ID!
}
input RegExp {
  pattern: String!
  flags: String
}
input SliceInput {
  begin: Int
  end: Int
}
type PageInfo {
  hasNextPage: Boolean!
  hasPreviousPage: Boolean!
  startCursor: String
  endCursor: String
}
type Person implements Node {
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
type PersonEdge {
  node: Person
  cursor: String!
}
type PersonConnection {
  pageInfo: PageInfo!
  edges: [PersonEdge!]
}
type Place implements Node {
  id: ID!
  createdAt: DateTime!
  updatedAt: DateTime!
  name: String
  citizens(where: PersonWhereInput, sort: PersonSortInput, pagination: PaginationInput): [Person!]!
  visitors(where: PersonWhereInput, sort: PersonSortInput, pagination: PaginationInput): [Person!]!
}
type PlaceEdge {
  node: Place
  cursor: String!
}
type PlaceConnection {
  pageInfo: PageInfo!
  edges: [PlaceEdge!]
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
  node(id: ID!): Node
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
  PeopleThroughConnection(where: PersonWhereInput, sort: PersonSortInput, after: String, before: String, first: Int, last: Int): PersonConnection
  PlacesThroughConnection(where: PlaceWhereInput, sort: PlaceSortInput, after: String, before: String, first: Int, last: Int): PlaceConnection
  PeopleByUnique(where: PersonWhereByUniqueInput!, sort: PersonSortInput): [Person!]!
  PlacesByUnique(where: PlaceWhereByUniqueInput!, sort: PlaceSortInput): [Place!]!
}
type Mutation {
  copyManyPeople(whereOnes: [PersonCopyWhereOnesInput!]!, options: copyPersonOptionsInput, whereOne: [PersonWhereOneToCopyInput!]): [Person!]!
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

  test('should create entities types with inventory for only queries', () => {
    const entityConfig: EntityConfig = {
      name: 'Example',
      type: 'tangible',
      textFields: [
        {
          name: 'textField',
        },
      ],
    };
    const entityConfigs = { Example: entityConfig };
    const inventory: Inventory = { name: 'test', include: { Query: true } };
    const generalConfig: GeneralConfig = { entityConfigs, inventory };
    const expectedResult = `scalar DateTime
scalar Upload
interface Node {
  id: ID!
}
input RegExp {
  pattern: String!
  flags: String
}
input SliceInput {
  begin: Int
  end: Int
}
type PageInfo {
  hasNextPage: Boolean!
  hasPreviousPage: Boolean!
  startCursor: String
  endCursor: String
}
type Example implements Node {
  id: ID!
  createdAt: DateTime!
  updatedAt: DateTime!
  textField: String
}
type ExampleEdge {
  node: Example
  cursor: String!
}
type ExampleConnection {
  pageInfo: PageInfo!
  edges: [ExampleEdge!]
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
  node(id: ID!): Node
  childExample(whereOne: ExampleWhereOneInput!): Example!
  childExamples(where: ExampleWhereInput, sort: ExampleSortInput, pagination: PaginationInput): [Example!]!
  ExampleCount(where: ExampleWhereInput): Int!
  ExampleDistinctValues(where: ExampleWhereInput, options: ExampleDistinctValuesOptionsInput): [String!]!
  Example(whereOne: ExampleWhereOneInput!): Example!
  Examples(where: ExampleWhereInput, sort: ExampleSortInput, pagination: PaginationInput): [Example!]!
  ExamplesThroughConnection(where: ExampleWhereInput, sort: ExampleSortInput, after: String, before: String, first: Int, last: Int): ExampleConnection
  ExamplesByUnique(where: ExampleWhereByUniqueInput!, sort: ExampleSortInput): [Example!]!
}`;

    const result = composeGqlTypes(generalConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should create entities types with inventory for only mutations', () => {
    const entityConfig: EntityConfig = {
      name: 'Example',
      type: 'tangible',
      textFields: [
        {
          name: 'textField',
          index: true,
        },
      ],
    };
    const entityConfigs = { Example: entityConfig };
    const inventory: Inventory = { name: 'test', include: { Mutation: true } };
    const generalConfig: GeneralConfig = { entityConfigs, inventory };

    const expectedResult = `scalar DateTime
scalar Upload
interface Node {
  id: ID!
}
input RegExp {
  pattern: String!
  flags: String
}
input SliceInput {
  begin: Int
  end: Int
}
type PageInfo {
  hasNextPage: Boolean!
  hasPreviousPage: Boolean!
  startCursor: String
  endCursor: String
}
type Example implements Node {
  id: ID!
  createdAt: DateTime!
  updatedAt: DateTime!
  textField: String
}
type ExampleEdge {
  node: Example
  cursor: String!
}
type ExampleConnection {
  pageInfo: PageInfo!
  edges: [ExampleEdge!]
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
  textField_gt: String
  textField_gte: String
  textField_lt: String
  textField_lte: String
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
  textField_gt: String
  textField_gte: String
  textField_lt: String
  textField_lte: String
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

  test('should create entities types with inventory for only entities query', () => {
    const entityConfig: EntityConfig = {
      name: 'Example',
      type: 'tangible',
      textFields: [
        {
          name: 'textField',
        },
      ],
    };
    const entityConfigs = { Example: entityConfig };
    const inventory: Inventory = { name: 'test', include: { Query: { entities: true } } };
    const generalConfig: GeneralConfig = { entityConfigs, inventory };

    const expectedResult = `scalar DateTime
scalar Upload
interface Node {
  id: ID!
}
input RegExp {
  pattern: String!
  flags: String
}
input SliceInput {
  begin: Int
  end: Int
}
type PageInfo {
  hasNextPage: Boolean!
  hasPreviousPage: Boolean!
  startCursor: String
  endCursor: String
}
type Example implements Node {
  id: ID!
  createdAt: DateTime!
  updatedAt: DateTime!
  textField: String
}
type ExampleEdge {
  node: Example
  cursor: String!
}
type ExampleConnection {
  pageInfo: PageInfo!
  edges: [ExampleEdge!]
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
  node(id: ID!): Node
  Examples(where: ExampleWhereInput, sort: ExampleSortInput, pagination: PaginationInput): [Example!]!
}`;

    const result = composeGqlTypes(generalConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should create entities types with inventory for only entities query for Example config', () => {
    const entityConfig: EntityConfig = {
      name: 'Example',
      type: 'tangible',
      textFields: [
        {
          name: 'textField',
        },
      ],
    };
    const entityConfigs = { Example: entityConfig };
    const inventory: Inventory = { name: 'test', include: { Query: { entities: ['Example'] } } };
    const generalConfig: GeneralConfig = { entityConfigs, inventory };
    const expectedResult = `scalar DateTime
scalar Upload
interface Node {
  id: ID!
}
input RegExp {
  pattern: String!
  flags: String
}
input SliceInput {
  begin: Int
  end: Int
}
type PageInfo {
  hasNextPage: Boolean!
  hasPreviousPage: Boolean!
  startCursor: String
  endCursor: String
}
type Example implements Node {
  id: ID!
  createdAt: DateTime!
  updatedAt: DateTime!
  textField: String
}
type ExampleEdge {
  node: Example
  cursor: String!
}
type ExampleConnection {
  pageInfo: PageInfo!
  edges: [ExampleEdge!]
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
  node(id: ID!): Node
  Examples(where: ExampleWhereInput, sort: ExampleSortInput, pagination: PaginationInput): [Example!]!
}`;

    const result = composeGqlTypes(generalConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should create entities types with inventory for only create mutations', () => {
    const entityConfig: EntityConfig = {
      name: 'Example',
      type: 'tangible',
      textFields: [
        {
          name: 'textField',
          index: true,
        },
      ],
    };
    const entityConfigs = { Example: entityConfig };
    const inventory: Inventory = { name: 'test', include: { Mutation: { createEntity: true } } };
    const generalConfig: GeneralConfig = { entityConfigs, inventory };
    const expectedResult = `scalar DateTime
scalar Upload
interface Node {
  id: ID!
}
input RegExp {
  pattern: String!
  flags: String
}
input SliceInput {
  begin: Int
  end: Int
}
type PageInfo {
  hasNextPage: Boolean!
  hasPreviousPage: Boolean!
  startCursor: String
  endCursor: String
}
type Example implements Node {
  id: ID!
  createdAt: DateTime!
  updatedAt: DateTime!
  textField: String
}
type ExampleEdge {
  node: Example
  cursor: String!
}
type ExampleConnection {
  pageInfo: PageInfo!
  edges: [ExampleEdge!]
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

  test('should create entities types with inventory for only mutation cretateEntity', () => {
    const entityConfig: EntityConfig = {
      name: 'Example',
      type: 'tangible',
      textFields: [
        {
          name: 'textField',
          index: true,
        },
      ],
    };
    const entityConfigs = { Example: entityConfig };
    const inventory: Inventory = {
      name: 'test',
      include: { Mutation: { createEntity: ['Example'] } },
    };
    const generalConfig: GeneralConfig = { entityConfigs, inventory };
    const expectedResult = `scalar DateTime
scalar Upload
interface Node {
  id: ID!
}
input RegExp {
  pattern: String!
  flags: String
}
input SliceInput {
  begin: Int
  end: Int
}
type PageInfo {
  hasNextPage: Boolean!
  hasPreviousPage: Boolean!
  startCursor: String
  endCursor: String
}
type Example implements Node {
  id: ID!
  createdAt: DateTime!
  updatedAt: DateTime!
  textField: String
}
type ExampleEdge {
  node: Example
  cursor: String!
}
type ExampleConnection {
  pageInfo: PageInfo!
  edges: [ExampleEdge!]
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

  test('should create entities types with inventory for only one custom mutation loadEntity', () => {
    const signatureMethods: ActionSignatureMethods = {
      name: 'loadEntity',
      specificName: ({ name }) => `load${name}`,
      argNames: () => ['path'],
      argTypes: () => ['String!'],
      type: ({ name }) => name,
      config: (entityConfig) => entityConfig,
    };

    const entityConfig: EntityConfig = {
      name: 'Example',
      type: 'tangible',
      textFields: [
        {
          name: 'textField',
          index: true,
        },
      ],
    };

    const entityConfigs = { Example: entityConfig };
    const inventory: Inventory = { name: 'test', include: { Mutation: { loadEntity: true } } };
    const custom = { Mutation: { loadEntity: signatureMethods } };
    const generalConfig: GeneralConfig = { entityConfigs, custom, inventory };
    const expectedResult = `scalar DateTime
scalar Upload
interface Node {
  id: ID!
}
input RegExp {
  pattern: String!
  flags: String
}
input SliceInput {
  begin: Int
  end: Int
}
type PageInfo {
  hasNextPage: Boolean!
  hasPreviousPage: Boolean!
  startCursor: String
  endCursor: String
}
type Example implements Node {
  id: ID!
  createdAt: DateTime!
  updatedAt: DateTime!
  textField: String
}
type ExampleEdge {
  node: Example
  cursor: String!
}
type ExampleConnection {
  pageInfo: PageInfo!
  edges: [ExampleEdge!]
}
type Mutation {
  loadExample(path: String!): Example
}`;

    const result = composeGqlTypes(generalConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should create entities types with inventory for only one custom query getEntity', () => {
    const getEntity: ActionSignatureMethods = {
      name: 'getEntity',
      specificName: ({ name }) => `get${name}`,
      argNames: () => ['path'],
      argTypes: () => ['String!'],
      type: ({ name }) => name,
      config: (entityConfig) => entityConfig,
    };

    const entityConfig: EntityConfig = {
      name: 'Example',
      type: 'tangible',
      textFields: [
        {
          name: 'textField',
          index: true,
        },
      ],
    };

    const entityConfigs = { Example: entityConfig };
    const inventory: Inventory = { name: 'test', include: { Query: { getEntity: true } } };
    const custom = { Query: { getEntity } };
    const generalConfig: GeneralConfig = { entityConfigs, custom, inventory };
    const expectedResult = `scalar DateTime
scalar Upload
interface Node {
  id: ID!
}
input RegExp {
  pattern: String!
  flags: String
}
input SliceInput {
  begin: Int
  end: Int
}
type PageInfo {
  hasNextPage: Boolean!
  hasPreviousPage: Boolean!
  startCursor: String
  endCursor: String
}
type Example implements Node {
  id: ID!
  createdAt: DateTime!
  updatedAt: DateTime!
  textField: String
}
type ExampleEdge {
  node: Example
  cursor: String!
}
type ExampleConnection {
  pageInfo: PageInfo!
  edges: [ExampleEdge!]
}
type Query {
  node(id: ID!): Node
  getExample(path: String!): Example
}`;

    const result = composeGqlTypes(generalConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should create entities types with custom input and return objects', () => {
    const entityInTimeRangeInput: ObjectSignatureMethods = {
      name: 'entityTimeRangeInput',
      specificName: ({ name }) => `${name}TimeRangeInput`,
      fieldNames: () => ['start', 'end'],
      fieldTypes: () => ['DateTime!', 'DateTime!'],
    };

    const ForCatalogDerivative: DerivativeAttributes = {
      allow: { Example: ['entities', 'updateEntity'] },
      suffix: 'ForCatalog',
      addFields: {
        Example: {
          dateTimeFields: [{ name: 'start', required: true }, { name: 'end' }],
        },
      },
    };

    const entityInTimeRangeQuery: ActionSignatureMethods = {
      name: 'entityInTimeRangeQuery',
      specificName: ({ name }) => `${name}InTimeRangeQuery`,
      argNames: () => ['range'],
      argTypes: ({ name }) => [`${name}TimeRangeInput!`],
      type: ({ name }) => `${name}InTimeRange`,
      config: (entityConfig) => entityConfig,
    };

    const entityConfig: EntityConfig = {
      name: 'Example',
      type: 'tangible',
      textFields: [
        {
          name: 'textField',
          index: true,
        },
      ],
    };

    const entityConfigs = { Example: entityConfig };
    const inventory: Inventory = {
      name: 'test',
      include: {
        Query: { entitiesForCatalog: true, entities: true },
        Mutation: { updateEntityForCatalog: true },
      },
      // include: { Query: true, Mutation: true },
    };
    const custom = {
      Input: { entityInTimeRangeInput },
      Query: { entityInTimeRangeQuery },
    };
    const derivative = { ForCatalog: ForCatalogDerivative };
    const generalConfig: GeneralConfig = { entityConfigs, custom, derivative, inventory };
    const expectedResult = `scalar DateTime
scalar Upload
interface Node {
  id: ID!
}
input RegExp {
  pattern: String!
  flags: String
}
input SliceInput {
  begin: Int
  end: Int
}
type PageInfo {
  hasNextPage: Boolean!
  hasPreviousPage: Boolean!
  startCursor: String
  endCursor: String
}
type Example implements Node {
  id: ID!
  createdAt: DateTime!
  updatedAt: DateTime!
  textField: String
}
type ExampleEdge {
  node: Example
  cursor: String!
}
type ExampleConnection {
  pageInfo: PageInfo!
  edges: [ExampleEdge!]
}
type ExampleForCatalog implements Node {
  id: ID!
  createdAt: DateTime!
  updatedAt: DateTime!
  textField: String
  start: DateTime!
  end: DateTime
}
type ExampleForCatalogEdge {
  node: ExampleForCatalog
  cursor: String!
}
type ExampleForCatalogConnection {
  pageInfo: PageInfo!
  edges: [ExampleForCatalogEdge!]
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
  textField_gt: String
  textField_gte: String
  textField_lt: String
  textField_lte: String
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
  textField_gt: String
  textField_gte: String
  textField_lt: String
  textField_lte: String
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
  textField_gt: String
  textField_gte: String
  textField_lt: String
  textField_lte: String
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
  textField_gt: String
  textField_gte: String
  textField_lt: String
  textField_lte: String
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
  node(id: ID!): Node
  Examples(where: ExampleWhereInput, sort: ExampleSortInput, pagination: PaginationInput): [Example!]!
  ExamplesForCatalog(where: ExampleForCatalogWhereInput, sort: ExampleForCatalogSortInput, pagination: PaginationInput): [ExampleForCatalog!]!
}
type Mutation {
  updateExampleForCatalog(whereOne: ExampleForCatalogWhereOneInput!, data: ExampleForCatalogUpdateInput!): ExampleForCatalog!
}`;

    const result = composeGqlTypes(generalConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should create derivative inputs for custom types with inventory for only one custom query getEntity', () => {
    const childNameFromParenName = { Menu: 'MenuSection' };

    const updateEntityWithChildren: ActionSignatureMethods = {
      name: 'updateEntityWithChildren',
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
      config: (entityConfig) => entityConfig,
    };

    const menuSectionConfig: EntityConfig = {};
    const menuConfig: EntityConfig = {
      name: 'Menu',
      type: 'tangible',
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
      type: 'tangible',
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

    const entityConfigs = { Menu: menuConfig, MenuSection: menuSectionConfig };
    const inventory: Inventory = {
      name: 'test',
      include: { Mutation: { updateEntityWithChildren: ['Menu'] } },
    };
    const custom = { Mutation: { updateEntityWithChildren } };
    const derivativeInputs = {
      '': {
        suffix: '',
        allow: {
          Menu: ['entityWhereOneInput', 'entityUpdateInput'],
          MenuSection: ['entityWhereOneInput', 'entityUpdateInput'],
        },
      },
    };
    const generalConfig: GeneralConfig = { entityConfigs, custom, derivativeInputs, inventory };
    const expectedResult = `scalar DateTime
scalar Upload
interface Node {
  id: ID!
}
input RegExp {
  pattern: String!
  flags: String
}
input SliceInput {
  begin: Int
  end: Int
}
type PageInfo {
  hasNextPage: Boolean!
  hasPreviousPage: Boolean!
  startCursor: String
  endCursor: String
}
type Menu implements Node {
  id: ID!
  createdAt: DateTime!
  updatedAt: DateTime!
  menuName: String
  sections(where: MenuSectionWhereInput, sort: MenuSectionSortInput, pagination: PaginationInput): [MenuSection!]!
}
type MenuEdge {
  node: Menu
  cursor: String!
}
type MenuConnection {
  pageInfo: PageInfo!
  edges: [MenuEdge!]
}
type MenuSection implements Node {
  id: ID!
  createdAt: DateTime!
  updatedAt: DateTime!
  menuSectionName: String
  root: Menu
}
type MenuSectionEdge {
  node: MenuSection
  cursor: String!
}
type MenuSectionConnection {
  pageInfo: PageInfo!
  edges: [MenuSectionEdge!]
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
  menuSectionName_gt: String
  menuSectionName_gte: String
  menuSectionName_lt: String
  menuSectionName_lte: String
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
  menuSectionName_gt: String
  menuSectionName_gte: String
  menuSectionName_lt: String
  menuSectionName_lte: String
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
  menuName_gt: String
  menuName_gte: String
  menuName_lt: String
  menuName_lte: String
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
  menuName_gt: String
  menuName_gte: String
  menuName_lt: String
  menuName_lte: String
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
