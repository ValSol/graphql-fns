/* eslint-env jest */

import type {
  ActionSignatureMethods,
  DescendantAttributes,
  TangibleEntityConfig,
  GeneralConfig,
  Inventory,
  ObjectSignatureMethods,
  SimplifiedEmbeddedEntityConfig,
  SimplifiedFileEntityConfig,
  SimplifiedTangibleEntityConfig,
} from '../tsTypes';

import composeAllEntityConfigs from '../utils/composeAllEntityConfigs';
import composeGqlTypes from './composeGqlTypes';

describe('composeGqlTypes', () => {
  test('should create entities types to copy with children', () => {
    const menuConfig: SimplifiedTangibleEntityConfig = {
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
          configName: 'MenuClone',
          parent: true,
        },

        {
          name: 'sections',
          oppositeName: 'menu',
          array: true,
          configName: 'MenuSection',
          parent: true,
        },
      ],
    };

    const menuCloneConfig: SimplifiedTangibleEntityConfig = {
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
          configName: 'Menu',
        },

        {
          name: 'sections',
          oppositeName: 'menu',
          array: true,
          configName: 'MenuCloneSection',
          parent: true,
        },
      ],
    };

    const menuSectionConfig: SimplifiedTangibleEntityConfig = {
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
          configName: 'Menu',
        },
      ],
    };

    const menuCloneSectionConfig: SimplifiedTangibleEntityConfig = {
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
          configName: 'MenuClone',
        },
      ],
    };

    const simplifiedAllEntityConfigs = [
      menuConfig,
      menuCloneConfig,
      menuSectionConfig,
      menuCloneSectionConfig,
    ];

    const allEntityConfigs = composeAllEntityConfigs(simplifiedAllEntityConfigs);

    const generalConfig: GeneralConfig = { allEntityConfigs };

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
type Menu implements Node {
  id: ID!
  createdAt: DateTime!
  updatedAt: DateTime!
  name: String!
  clone: MenuClone
  sections(where: MenuSectionWhereInput, sort: MenuSectionSortInput, pagination: PaginationInput): [MenuSection!]!
  sectionsThroughConnection(where: MenuSectionWhereInput, sort: MenuSectionSortInput, after: String, before: String, first: Int, last: Int): MenuSectionConnection!
}
type MenuClone implements Node {
  id: ID!
  createdAt: DateTime!
  updatedAt: DateTime!
  name: String!
  original: Menu
  sections(where: MenuCloneSectionWhereInput, sort: MenuCloneSectionSortInput, pagination: PaginationInput): [MenuCloneSection!]!
  sectionsThroughConnection(where: MenuCloneSectionWhereInput, sort: MenuCloneSectionSortInput, after: String, before: String, first: Int, last: Int): MenuCloneSectionConnection!
}
type MenuCloneSection implements Node {
  id: ID!
  createdAt: DateTime!
  updatedAt: DateTime!
  name: String!
  menu: MenuClone
}
type MenuCloneConnection {
  pageInfo: PageInfo!
  edges: [MenuCloneEdge!]!
}
type PageInfo {
  startCursor: String
  endCursor: String
  hasNextPage: Boolean!
  hasPreviousPage: Boolean!
}
type MenuCloneEdge {
  cursor: String!
  node: MenuClone!
}
type MenuConnection {
  pageInfo: PageInfo!
  edges: [MenuEdge!]!
}
type MenuEdge {
  cursor: String!
  node: Menu!
}
type MenuCloneSectionConnection {
  pageInfo: PageInfo!
  edges: [MenuCloneSectionEdge!]!
}
type MenuCloneSectionEdge {
  cursor: String!
  node: MenuCloneSection!
}
type MenuSection implements Node {
  id: ID!
  createdAt: DateTime!
  updatedAt: DateTime!
  name: String!
  menu: Menu
}
type MenuSectionConnection {
  pageInfo: PageInfo!
  edges: [MenuSectionEdge!]!
}
type MenuSectionEdge {
  cursor: String!
  node: MenuSection!
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
input MenuWhereOneInput {
  id: ID!
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
  MenuCount(where: MenuWhereInput, token: String): Int!
  MenuCloneCount(where: MenuCloneWhereInput, token: String): Int!
  MenuSectionCount(where: MenuSectionWhereInput, token: String): Int!
  MenuCloneSectionCount(where: MenuCloneSectionWhereInput, token: String): Int!
  MenuDistinctValues(where: MenuWhereInput, options: MenuDistinctValuesOptionsInput, token: String): [String!]!
  MenuCloneDistinctValues(where: MenuCloneWhereInput, options: MenuCloneDistinctValuesOptionsInput, token: String): [String!]!
  MenuSectionDistinctValues(where: MenuSectionWhereInput, options: MenuSectionDistinctValuesOptionsInput, token: String): [String!]!
  MenuCloneSectionDistinctValues(where: MenuCloneSectionWhereInput, options: MenuCloneSectionDistinctValuesOptionsInput, token: String): [String!]!
  Menu(whereOne: MenuWhereOneInput!, token: String): Menu
  MenuClone(whereOne: MenuCloneWhereOneInput!, token: String): MenuClone
  MenuSection(whereOne: MenuSectionWhereOneInput!, token: String): MenuSection
  MenuCloneSection(whereOne: MenuCloneSectionWhereOneInput!, token: String): MenuCloneSection
  Menus(where: MenuWhereInput, sort: MenuSortInput, pagination: PaginationInput, token: String): [Menu!]!
  MenuClones(where: MenuCloneWhereInput, sort: MenuCloneSortInput, pagination: PaginationInput, token: String): [MenuClone!]!
  MenuSections(where: MenuSectionWhereInput, sort: MenuSectionSortInput, pagination: PaginationInput, token: String): [MenuSection!]!
  MenuCloneSections(where: MenuCloneSectionWhereInput, sort: MenuCloneSectionSortInput, pagination: PaginationInput, token: String): [MenuCloneSection!]!
  MenusThroughConnection(where: MenuWhereInput, sort: MenuSortInput, after: String, before: String, first: Int, last: Int, token: String): MenuConnection!
  MenuClonesThroughConnection(where: MenuCloneWhereInput, sort: MenuCloneSortInput, after: String, before: String, first: Int, last: Int, token: String): MenuCloneConnection!
  MenuSectionsThroughConnection(where: MenuSectionWhereInput, sort: MenuSectionSortInput, after: String, before: String, first: Int, last: Int, token: String): MenuSectionConnection!
  MenuCloneSectionsThroughConnection(where: MenuCloneSectionWhereInput, sort: MenuCloneSectionSortInput, after: String, before: String, first: Int, last: Int, token: String): MenuCloneSectionConnection!
  MenusByUnique(where: MenuWhereByUniqueInput!, sort: MenuSortInput, token: String): [Menu!]!
  MenuClonesByUnique(where: MenuCloneWhereByUniqueInput!, sort: MenuCloneSortInput, token: String): [MenuClone!]!
  MenuSectionsByUnique(where: MenuSectionWhereByUniqueInput!, sort: MenuSectionSortInput, token: String): [MenuSection!]!
  MenuCloneSectionsByUnique(where: MenuCloneSectionWhereByUniqueInput!, sort: MenuCloneSectionSortInput, token: String): [MenuCloneSection!]!
}
type Mutation {
  copyManyMenus(whereOnes: [MenuCopyWhereOnesInput!]!, options: copyMenuOptionsInput, token: String): [Menu!]!
  copyManyMenuClones(whereOnes: [MenuCloneCopyWhereOnesInput!]!, options: copyMenuCloneOptionsInput, token: String): [MenuClone!]!
  copyManyMenuSections(whereOnes: [MenuSectionCopyWhereOnesInput!]!, options: copyMenuSectionOptionsInput, whereOne: [MenuSectionWhereOneToCopyInput!], token: String): [MenuSection!]!
  copyManyMenuCloneSections(whereOnes: [MenuCloneSectionCopyWhereOnesInput!]!, options: copyMenuCloneSectionOptionsInput, whereOne: [MenuCloneSectionWhereOneToCopyInput!], token: String): [MenuCloneSection!]!
  copyManyMenusWithChildren(whereOnes: [MenuCopyWhereOnesInput!]!, options: copyMenuOptionsInput, token: String): [Menu!]!
  copyManyMenuClonesWithChildren(whereOnes: [MenuCloneCopyWhereOnesInput!]!, options: copyMenuCloneOptionsInput, token: String): [MenuClone!]!
  copyMenu(whereOnes: MenuCopyWhereOnesInput!, options: copyMenuOptionsInput, token: String): Menu!
  copyMenuClone(whereOnes: MenuCloneCopyWhereOnesInput!, options: copyMenuCloneOptionsInput, token: String): MenuClone!
  copyMenuSection(whereOnes: MenuSectionCopyWhereOnesInput!, options: copyMenuSectionOptionsInput, whereOne: MenuSectionWhereOneToCopyInput, token: String): MenuSection!
  copyMenuCloneSection(whereOnes: MenuCloneSectionCopyWhereOnesInput!, options: copyMenuCloneSectionOptionsInput, whereOne: MenuCloneSectionWhereOneToCopyInput, token: String): MenuCloneSection!
  copyMenuWithChildren(whereOnes: MenuCopyWhereOnesInput!, options: copyMenuOptionsInput, token: String): Menu!
  copyMenuCloneWithChildren(whereOnes: MenuCloneCopyWhereOnesInput!, options: copyMenuCloneOptionsInput, token: String): MenuClone!
  createManyMenus(data: [MenuCreateInput!]!, token: String): [Menu!]!
  createManyMenuClones(data: [MenuCloneCreateInput!]!, token: String): [MenuClone!]!
  createManyMenuSections(data: [MenuSectionCreateInput!]!, token: String): [MenuSection!]!
  createManyMenuCloneSections(data: [MenuCloneSectionCreateInput!]!, token: String): [MenuCloneSection!]!
  createMenu(data: MenuCreateInput!, token: String): Menu!
  createMenuClone(data: MenuCloneCreateInput!, token: String): MenuClone!
  createMenuSection(data: MenuSectionCreateInput!, token: String): MenuSection!
  createMenuCloneSection(data: MenuCloneSectionCreateInput!, token: String): MenuCloneSection!
  deleteFilteredMenus(where: MenuWhereInput, token: String): [Menu!]!
  deleteFilteredMenuClones(where: MenuCloneWhereInput, token: String): [MenuClone!]!
  deleteFilteredMenuSections(where: MenuSectionWhereInput, token: String): [MenuSection!]!
  deleteFilteredMenuCloneSections(where: MenuCloneSectionWhereInput, token: String): [MenuCloneSection!]!
  deleteFilteredMenusReturnScalar(where: MenuWhereInput, token: String): Int!
  deleteFilteredMenuClonesReturnScalar(where: MenuCloneWhereInput, token: String): Int!
  deleteFilteredMenuSectionsReturnScalar(where: MenuSectionWhereInput, token: String): Int!
  deleteFilteredMenuCloneSectionsReturnScalar(where: MenuCloneSectionWhereInput, token: String): Int!
  deleteFilteredMenusWithChildren(where: MenuWhereInput, options: deleteMenuWithChildrenOptionsInput, token: String): [Menu!]!
  deleteFilteredMenuClonesWithChildren(where: MenuCloneWhereInput, options: deleteMenuCloneWithChildrenOptionsInput, token: String): [MenuClone!]!
  deleteFilteredMenusWithChildrenReturnScalar(where: MenuWhereInput, options: deleteMenuWithChildrenOptionsInput, token: String): Int!
  deleteFilteredMenuClonesWithChildrenReturnScalar(where: MenuCloneWhereInput, options: deleteMenuCloneWithChildrenOptionsInput, token: String): Int!
  deleteManyMenus(whereOne: [MenuWhereOneInput!]!, token: String): [Menu!]!
  deleteManyMenuClones(whereOne: [MenuCloneWhereOneInput!]!, token: String): [MenuClone!]!
  deleteManyMenuSections(whereOne: [MenuSectionWhereOneInput!]!, token: String): [MenuSection!]!
  deleteManyMenuCloneSections(whereOne: [MenuCloneSectionWhereOneInput!]!, token: String): [MenuCloneSection!]!
  deleteManyMenusWithChildren(whereOne: [MenuWhereOneInput!]!, options: deleteMenuWithChildrenOptionsInput, token: String): [Menu!]!
  deleteManyMenuClonesWithChildren(whereOne: [MenuCloneWhereOneInput!]!, options: deleteMenuCloneWithChildrenOptionsInput, token: String): [MenuClone!]!
  deleteMenu(whereOne: MenuWhereOneInput!, token: String): Menu!
  deleteMenuClone(whereOne: MenuCloneWhereOneInput!, token: String): MenuClone!
  deleteMenuSection(whereOne: MenuSectionWhereOneInput!, token: String): MenuSection!
  deleteMenuCloneSection(whereOne: MenuCloneSectionWhereOneInput!, token: String): MenuCloneSection!
  deleteMenuWithChildren(whereOne: MenuWhereOneInput!, options: deleteMenuWithChildrenOptionsInput, token: String): Menu!
  deleteMenuCloneWithChildren(whereOne: MenuCloneWhereOneInput!, options: deleteMenuCloneWithChildrenOptionsInput, token: String): MenuClone!
  importMenus(file: Upload!, options: ImportOptionsInput, token: String): [Menu!]!
  importMenuClones(file: Upload!, options: ImportOptionsInput, token: String): [MenuClone!]!
  importMenuSections(file: Upload!, options: ImportOptionsInput, token: String): [MenuSection!]!
  importMenuCloneSections(file: Upload!, options: ImportOptionsInput, token: String): [MenuCloneSection!]!
  pushIntoMenu(whereOne: MenuWhereOneInput!, data: PushIntoMenuInput!, positions: MenuPushPositionsInput, token: String): Menu!
  pushIntoMenuClone(whereOne: MenuCloneWhereOneInput!, data: PushIntoMenuCloneInput!, positions: MenuClonePushPositionsInput, token: String): MenuClone!
  updateFilteredMenus(where: MenuWhereInput, data: MenuUpdateInput!, token: String): [Menu!]!
  updateFilteredMenuClones(where: MenuCloneWhereInput, data: MenuCloneUpdateInput!, token: String): [MenuClone!]!
  updateFilteredMenuSections(where: MenuSectionWhereInput, data: MenuSectionUpdateInput!, token: String): [MenuSection!]!
  updateFilteredMenuCloneSections(where: MenuCloneSectionWhereInput, data: MenuCloneSectionUpdateInput!, token: String): [MenuCloneSection!]!
  updateFilteredMenusReturnScalar(where: MenuWhereInput, data: MenuUpdateInput!, token: String): Int!
  updateFilteredMenuClonesReturnScalar(where: MenuCloneWhereInput, data: MenuCloneUpdateInput!, token: String): Int!
  updateFilteredMenuSectionsReturnScalar(where: MenuSectionWhereInput, data: MenuSectionUpdateInput!, token: String): Int!
  updateFilteredMenuCloneSectionsReturnScalar(where: MenuCloneSectionWhereInput, data: MenuCloneSectionUpdateInput!, token: String): Int!
  updateManyMenus(whereOne: [MenuWhereOneInput!]!, data: [MenuUpdateInput!]!, token: String): [Menu!]!
  updateManyMenuClones(whereOne: [MenuCloneWhereOneInput!]!, data: [MenuCloneUpdateInput!]!, token: String): [MenuClone!]!
  updateManyMenuSections(whereOne: [MenuSectionWhereOneInput!]!, data: [MenuSectionUpdateInput!]!, token: String): [MenuSection!]!
  updateManyMenuCloneSections(whereOne: [MenuCloneSectionWhereOneInput!]!, data: [MenuCloneSectionUpdateInput!]!, token: String): [MenuCloneSection!]!
  updateMenu(whereOne: MenuWhereOneInput!, data: MenuUpdateInput!, token: String): Menu!
  updateMenuClone(whereOne: MenuCloneWhereOneInput!, data: MenuCloneUpdateInput!, token: String): MenuClone!
  updateMenuSection(whereOne: MenuSectionWhereOneInput!, data: MenuSectionUpdateInput!, token: String): MenuSection!
  updateMenuCloneSection(whereOne: MenuCloneSectionWhereOneInput!, data: MenuCloneSectionUpdateInput!, token: String): MenuCloneSection!
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
    expect(result.typeDefs).toBe(expectedResult);
  });

  test('should create entities types for one entity', () => {
    const imageConfig: SimplifiedFileEntityConfig = {
      name: 'Image',
      type: 'file',
      textFields: [
        {
          name: 'fileId',
          required: true,
          freeze: true,
          index: true,
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

    const entityConfig: SimplifiedTangibleEntityConfig = {
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
          configName: 'Image',
          required: true,
        },
        {
          name: 'hero',
          configName: 'Image',
        },
        {
          name: 'pictures',
          configName: 'Image',
          array: true,
          required: true,
        },
        {
          name: 'photos',
          configName: 'Image',
          array: true,
          index: true,
        },
      ],

      geospatialFields: [
        {
          name: 'position',
          geospatialType: 'Point',
        },
      ],
    };

    const simplifiedAllEntityConfigs = [entityConfig, imageConfig];

    const allEntityConfigs = composeAllEntityConfigs(simplifiedAllEntityConfigs);
    const enums = {
      Weekdays: ['a0', 'a1', 'a2', 'a3', 'a4', 'a5', 'a6'],
      Cuisines: ['ukrainian', 'italian', 'georgian', 'japanese', 'chinese'],
    };

    const generalConfig: GeneralConfig = { allEntityConfigs, enums };

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
type TangibleImage implements Node {
  id: ID!
  fileId: String!
  address: String
}
type TangibleImageConnection {
  pageInfo: PageInfo!
  edges: [TangibleImageEdge!]!
}
type PageInfo {
  startCursor: String
  endCursor: String
  hasNextPage: Boolean!
  hasPreviousPage: Boolean!
}
type TangibleImageEdge {
  cursor: String!
  node: TangibleImage!
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
  picturesThroughConnection(after: String, before: String, first: Int, last: Int): ImageConnection!
  photos(slice: SliceInput): [Image!]!
  photosThroughConnection(after: String, before: String, first: Int, last: Int): ImageConnection!
  position: GeospatialPoint
}
type Image {
  id: ID!
  fileId: String!
  address: String
  text: String
}
type ImageConnection {
  pageInfo: PageInfo!
  edges: [ImageEdge!]!
}
type ImageEdge {
  cursor: String!
  node: Image!
}
type ExampleConnection {
  pageInfo: PageInfo!
  edges: [ExampleEdge!]!
}
type ExampleEdge {
  cursor: String!
  node: Example!
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
  photos: ImageWhereInput
  photos_size: Int
  photos_notsize: Int
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
  photos: ImageWhereInput
  photos_size: Int
  photos_notsize: Int
}
input ImageWhereInput {
  id_in: [ID!]
  id_nin: [ID!]
  fileId: String
  fileId_in: [String!]
  fileId_nin: [String!]
  fileId_ne: String
  fileId_gt: String
  fileId_gte: String
  fileId_lt: String
  fileId_lte: String
  fileId_re: [RegExp!]
  fileId_exists: Boolean
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
input ExampleWhereOneInput {
  id: ID
  textField1: ID
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
  ExampleCount(where: ExampleWhereInput, near: ExampleNearInput, search: String, token: String): Int!
  ExampleDistinctValues(where: ExampleWhereInput, options: ExampleDistinctValuesOptionsInput, token: String): [String!]!
  TangibleImageFileCount(where: FileWhereInput, token: String): Int!
  TangibleImageFile(whereOne: FileWhereOneInput!, token: String): TangibleImage
  TangibleImageFiles(where: FileWhereInput, token: String): [TangibleImage!]!
  TangibleImageFilesThroughConnection(where: FileWhereInput, after: String, before: String, first: Int, last: Int, token: String): TangibleImageConnection!
  Example(whereOne: ExampleWhereOneInput!, token: String): Example
  Examples(where: ExampleWhereInput, sort: ExampleSortInput, pagination: PaginationInput, near: ExampleNearInput, search: String, token: String): [Example!]!
  ExamplesThroughConnection(where: ExampleWhereInput, sort: ExampleSortInput, near: ExampleNearInput, search: String, after: String, before: String, first: Int, last: Int, token: String): ExampleConnection!
  ExamplesByUnique(where: ExampleWhereByUniqueInput!, sort: ExampleSortInput, near: ExampleNearInput, search: String, token: String): [Example!]!
}
type Mutation {
  createManyExamples(data: [ExampleCreateInput!]!, token: String): [Example!]!
  createExample(data: ExampleCreateInput!, token: String): Example!
  deleteFilteredExamples(where: ExampleWhereInput, near: ExampleNearInput, search: String, token: String): [Example!]!
  deleteFilteredExamplesReturnScalar(where: ExampleWhereInput, near: ExampleNearInput, search: String, token: String): Int!
  deleteManyExamples(whereOne: [ExampleWhereOneInput!]!, token: String): [Example!]!
  deleteExample(whereOne: ExampleWhereOneInput!, token: String): Example!
  importExamples(file: Upload!, options: ImportOptionsInput, token: String): [Example!]!
  pushIntoExample(whereOne: ExampleWhereOneInput!, data: PushIntoExampleInput!, positions: ExamplePushPositionsInput, token: String): Example!
  updateFilteredExamples(where: ExampleWhereInput, near: ExampleNearInput, search: String, data: ExampleUpdateInput!, token: String): [Example!]!
  updateFilteredExamplesReturnScalar(where: ExampleWhereInput, near: ExampleNearInput, search: String, data: ExampleUpdateInput!, token: String): Int!
  updateManyExamples(whereOne: [ExampleWhereOneInput!]!, data: [ExampleUpdateInput!]!, token: String): [Example!]!
  updateExample(whereOne: ExampleWhereOneInput!, data: ExampleUpdateInput!, token: String): Example!
  uploadTangibleImageFiles(files: [Upload!]!, hashes: [String!]!, token: String): [TangibleImage!]!
}
type Subscription {
  createdExample(where: ExampleWhereInput): Example!
  updatedExample(where: ExampleWhereInput): UpdatedExamplePayload!
  deletedExample(where: ExampleWhereInput): Example!
}`;

    const result = composeGqlTypes(generalConfig);
    expect(result.typeDefs).toBe(expectedResult);
  });

  test('should create entities types for two entities', () => {
    const entityConfig1: SimplifiedTangibleEntityConfig = {
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
    const entityConfig2: SimplifiedTangibleEntityConfig = {
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

    const simplifiedAllEntityConfigs = [entityConfig1, entityConfig2];

    const allEntityConfigs = composeAllEntityConfigs(simplifiedAllEntityConfigs);
    const generalConfig: GeneralConfig = { allEntityConfigs };

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
type Example2 implements Node {
  id: ID!
  createdAt: DateTime!
  updatedAt: DateTime!
  textField1(slice: SliceInput): [String!]!
  textField2(slice: SliceInput): [String!]!
  area: GeospatialPolygon
}
type Example1Connection {
  pageInfo: PageInfo!
  edges: [Example1Edge!]!
}
type PageInfo {
  startCursor: String
  endCursor: String
  hasNextPage: Boolean!
  hasPreviousPage: Boolean!
}
type Example1Edge {
  cursor: String!
  node: Example1!
}
type Example2Connection {
  pageInfo: PageInfo!
  edges: [Example2Edge!]!
}
type Example2Edge {
  cursor: String!
  node: Example2!
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
input Example1WhereOneInput {
  id: ID!
}
input Example2WhereOneInput {
  id: ID!
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
enum Example2SortEnum {
  createdAt_ASC
  createdAt_DESC
  updatedAt_ASC
  updatedAt_DESC
}
input Example2SortInput {
  sortBy: [Example2SortEnum]
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
  Example1Count(where: Example1WhereInput, near: Example1NearInput, token: String): Int!
  Example2Count(where: Example2WhereInput, token: String): Int!
  Example1DistinctValues(where: Example1WhereInput, options: Example1DistinctValuesOptionsInput, token: String): [String!]!
  Example2DistinctValues(where: Example2WhereInput, options: Example2DistinctValuesOptionsInput, token: String): [String!]!
  Example1(whereOne: Example1WhereOneInput!, token: String): Example1
  Example2(whereOne: Example2WhereOneInput!, token: String): Example2
  Example1s(where: Example1WhereInput, sort: Example1SortInput, pagination: PaginationInput, near: Example1NearInput, token: String): [Example1!]!
  Example2s(where: Example2WhereInput, sort: Example2SortInput, pagination: PaginationInput, token: String): [Example2!]!
  Example1sThroughConnection(where: Example1WhereInput, sort: Example1SortInput, near: Example1NearInput, after: String, before: String, first: Int, last: Int, token: String): Example1Connection!
  Example2sThroughConnection(where: Example2WhereInput, sort: Example2SortInput, after: String, before: String, first: Int, last: Int, token: String): Example2Connection!
  Example1sByUnique(where: Example1WhereByUniqueInput!, sort: Example1SortInput, near: Example1NearInput, token: String): [Example1!]!
  Example2sByUnique(where: Example2WhereByUniqueInput!, sort: Example2SortInput, token: String): [Example2!]!
}
type Mutation {
  createManyExample1s(data: [Example1CreateInput!]!, token: String): [Example1!]!
  createManyExample2s(data: [Example2CreateInput!]!, token: String): [Example2!]!
  createExample1(data: Example1CreateInput!, token: String): Example1!
  createExample2(data: Example2CreateInput!, token: String): Example2!
  deleteFilteredExample1s(where: Example1WhereInput, near: Example1NearInput, token: String): [Example1!]!
  deleteFilteredExample2s(where: Example2WhereInput, token: String): [Example2!]!
  deleteFilteredExample1sReturnScalar(where: Example1WhereInput, near: Example1NearInput, token: String): Int!
  deleteFilteredExample2sReturnScalar(where: Example2WhereInput, token: String): Int!
  deleteManyExample1s(whereOne: [Example1WhereOneInput!]!, token: String): [Example1!]!
  deleteManyExample2s(whereOne: [Example2WhereOneInput!]!, token: String): [Example2!]!
  deleteExample1(whereOne: Example1WhereOneInput!, token: String): Example1!
  deleteExample2(whereOne: Example2WhereOneInput!, token: String): Example2!
  importExample1s(file: Upload!, options: ImportOptionsInput, token: String): [Example1!]!
  importExample2s(file: Upload!, options: ImportOptionsInput, token: String): [Example2!]!
  pushIntoExample2(whereOne: Example2WhereOneInput!, data: PushIntoExample2Input!, positions: Example2PushPositionsInput, token: String): Example2!
  updateFilteredExample1s(where: Example1WhereInput, near: Example1NearInput, data: Example1UpdateInput!, token: String): [Example1!]!
  updateFilteredExample2s(where: Example2WhereInput, data: Example2UpdateInput!, token: String): [Example2!]!
  updateFilteredExample1sReturnScalar(where: Example1WhereInput, near: Example1NearInput, data: Example1UpdateInput!, token: String): Int!
  updateFilteredExample2sReturnScalar(where: Example2WhereInput, data: Example2UpdateInput!, token: String): Int!
  updateManyExample1s(whereOne: [Example1WhereOneInput!]!, data: [Example1UpdateInput!]!, token: String): [Example1!]!
  updateManyExample2s(whereOne: [Example2WhereOneInput!]!, data: [Example2UpdateInput!]!, token: String): [Example2!]!
  updateExample1(whereOne: Example1WhereOneInput!, data: Example1UpdateInput!, token: String): Example1!
  updateExample2(whereOne: Example2WhereOneInput!, data: Example2UpdateInput!, token: String): Example2!
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
    expect(result.typeDefs).toBe(expectedResult);
  });

  test('should create entities types for two related fields', () => {
    const personConfig = {} as SimplifiedTangibleEntityConfig;
    const placeConfig: SimplifiedTangibleEntityConfig = {
      name: 'Place',
      type: 'tangible',
      textFields: [
        {
          name: 'title',
          required: true,
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
      relationalFields: [
        {
          name: 'friends',
          oppositeName: 'fellows',
          configName: 'Person',
          array: true,
          required: true,
        },
        {
          name: 'enemies',
          oppositeName: 'opponents',
          configName: 'Person',
          array: true,
        },
        {
          name: 'location',
          oppositeName: 'citisens',
          configName: 'Place',
          required: true,
        },
        {
          name: 'favoritePlace',
          oppositeName: 'customers',
          configName: 'Place',
        },
      ],
    });

    const simplifiedAllEntityConfigs = [personConfig, placeConfig];
    const allEntityConfigs = composeAllEntityConfigs(simplifiedAllEntityConfigs);
    const generalConfig: GeneralConfig = { allEntityConfigs };

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
type Person implements Node {
  id: ID!
  createdAt: DateTime!
  updatedAt: DateTime!
  firstName: String!
  lastName: String!
  friends(where: PersonWhereInput, sort: PersonSortInput, pagination: PaginationInput): [Person!]!
  friendsThroughConnection(where: PersonWhereInput, sort: PersonSortInput, after: String, before: String, first: Int, last: Int): PersonConnection!
  enemies(where: PersonWhereInput, sort: PersonSortInput, pagination: PaginationInput): [Person!]!
  enemiesThroughConnection(where: PersonWhereInput, sort: PersonSortInput, after: String, before: String, first: Int, last: Int): PersonConnection!
  location: Place!
  favoritePlace: Place
  fellows(where: PersonWhereInput, sort: PersonSortInput, pagination: PaginationInput): [Person!]!
  fellowsThroughConnection(where: PersonWhereInput, sort: PersonSortInput, after: String, before: String, first: Int, last: Int): PersonConnection!
  opponents(where: PersonWhereInput, sort: PersonSortInput, pagination: PaginationInput): [Person!]!
  opponentsThroughConnection(where: PersonWhereInput, sort: PersonSortInput, after: String, before: String, first: Int, last: Int): PersonConnection!
}
type Place implements Node {
  id: ID!
  createdAt: DateTime!
  updatedAt: DateTime!
  title: String!
  citisens(where: PersonWhereInput, sort: PersonSortInput, pagination: PaginationInput): [Person!]!
  citisensThroughConnection(where: PersonWhereInput, sort: PersonSortInput, after: String, before: String, first: Int, last: Int): PersonConnection!
  customers(where: PersonWhereInput, sort: PersonSortInput, pagination: PaginationInput): [Person!]!
  customersThroughConnection(where: PersonWhereInput, sort: PersonSortInput, after: String, before: String, first: Int, last: Int): PersonConnection!
}
type PersonConnection {
  pageInfo: PageInfo!
  edges: [PersonEdge!]!
}
type PageInfo {
  startCursor: String
  endCursor: String
  hasNextPage: Boolean!
  hasPreviousPage: Boolean!
}
type PersonEdge {
  cursor: String!
  node: Person!
}
type PlaceConnection {
  pageInfo: PageInfo!
  edges: [PlaceEdge!]!
}
type PlaceEdge {
  cursor: String!
  node: Place!
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
input PersonWhereOneInput {
  id: ID!
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
input PersonWhereByUniqueInput {
  id_in: [ID!]
}
input PlaceWhereByUniqueInput {
  id_in: [ID!]
}
input PersonCreateInput {
  id: ID
  friends: PersonCreateOrPushChildrenInput!
  enemies: PersonCreateOrPushChildrenInput
  location: PlaceCreateChildInput!
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
  PersonCount(where: PersonWhereInput, token: String): Int!
  PlaceCount(where: PlaceWhereInput, token: String): Int!
  PersonDistinctValues(where: PersonWhereInput, options: PersonDistinctValuesOptionsInput, token: String): [String!]!
  PlaceDistinctValues(where: PlaceWhereInput, options: PlaceDistinctValuesOptionsInput, token: String): [String!]!
  Person(whereOne: PersonWhereOneInput!, token: String): Person
  Place(whereOne: PlaceWhereOneInput!, token: String): Place
  People(where: PersonWhereInput, sort: PersonSortInput, pagination: PaginationInput, token: String): [Person!]!
  Places(where: PlaceWhereInput, sort: PlaceSortInput, pagination: PaginationInput, token: String): [Place!]!
  PeopleThroughConnection(where: PersonWhereInput, sort: PersonSortInput, after: String, before: String, first: Int, last: Int, token: String): PersonConnection!
  PlacesThroughConnection(where: PlaceWhereInput, sort: PlaceSortInput, after: String, before: String, first: Int, last: Int, token: String): PlaceConnection!
  PeopleByUnique(where: PersonWhereByUniqueInput!, sort: PersonSortInput, token: String): [Person!]!
  PlacesByUnique(where: PlaceWhereByUniqueInput!, sort: PlaceSortInput, token: String): [Place!]!
}
type Mutation {
  createManyPeople(data: [PersonCreateInput!]!, token: String): [Person!]!
  createManyPlaces(data: [PlaceCreateInput!]!, token: String): [Place!]!
  createPerson(data: PersonCreateInput!, token: String): Person!
  createPlace(data: PlaceCreateInput!, token: String): Place!
  deleteFilteredPeople(where: PersonWhereInput, token: String): [Person!]!
  deleteFilteredPlaces(where: PlaceWhereInput, token: String): [Place!]!
  deleteFilteredPeopleReturnScalar(where: PersonWhereInput, token: String): Int!
  deleteFilteredPlacesReturnScalar(where: PlaceWhereInput, token: String): Int!
  deleteManyPeople(whereOne: [PersonWhereOneInput!]!, token: String): [Person!]!
  deleteManyPlaces(whereOne: [PlaceWhereOneInput!]!, token: String): [Place!]!
  deletePerson(whereOne: PersonWhereOneInput!, token: String): Person!
  deletePlace(whereOne: PlaceWhereOneInput!, token: String): Place!
  importPeople(file: Upload!, options: ImportOptionsInput, token: String): [Person!]!
  importPlaces(file: Upload!, options: ImportOptionsInput, token: String): [Place!]!
  pushIntoPerson(whereOne: PersonWhereOneInput!, data: PushIntoPersonInput!, positions: PersonPushPositionsInput, token: String): Person!
  updateFilteredPeople(where: PersonWhereInput, data: PersonUpdateInput!, token: String): [Person!]!
  updateFilteredPlaces(where: PlaceWhereInput, data: PlaceUpdateInput!, token: String): [Place!]!
  updateFilteredPeopleReturnScalar(where: PersonWhereInput, data: PersonUpdateInput!, token: String): Int!
  updateFilteredPlacesReturnScalar(where: PlaceWhereInput, data: PlaceUpdateInput!, token: String): Int!
  updateManyPeople(whereOne: [PersonWhereOneInput!]!, data: [PersonUpdateInput!]!, token: String): [Person!]!
  updateManyPlaces(whereOne: [PlaceWhereOneInput!]!, data: [PlaceUpdateInput!]!, token: String): [Place!]!
  updatePerson(whereOne: PersonWhereOneInput!, data: PersonUpdateInput!, token: String): Person!
  updatePlace(whereOne: PlaceWhereOneInput!, data: PlaceUpdateInput!, token: String): Place!
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
    expect(result.typeDefs).toBe(expectedResult);
  });

  test('should create entities types for regular and embedded fields', () => {
    const addressConfig: SimplifiedEmbeddedEntityConfig = {
      name: 'Address',
      type: 'embedded',
      textFields: [
        {
          name: 'country',
          required: true,
          default: 'Ukraine',
          index: true,
        },
        {
          name: 'province',
        },
      ],
    };
    const personConfig: SimplifiedTangibleEntityConfig = {
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
          configName: 'Address',
          required: true,
        },
        {
          name: 'locations',
          array: true,
          configName: 'Address',
          required: true,
        },
        {
          name: 'place',
          configName: 'Address',
          index: true,
        },
        {
          name: 'places',
          array: true,
          configName: 'Address',
        },
      ],
    };

    const simplifiedAllEntityConfigs = [personConfig, addressConfig];
    const allEntityConfigs = composeAllEntityConfigs(simplifiedAllEntityConfigs);
    const generalConfig: GeneralConfig = { allEntityConfigs };

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
type Person implements Node {
  id: ID!
  createdAt: DateTime!
  updatedAt: DateTime!
  firstName: String!
  lastName: String!
  location: Address!
  locations(slice: SliceInput): [Address!]!
  locationsThroughConnection(after: String, before: String, first: Int, last: Int): AddressConnection!
  place: Address
  places(slice: SliceInput): [Address!]!
  placesThroughConnection(after: String, before: String, first: Int, last: Int): AddressConnection!
}
type Address {
  id: ID!
  country: String!
  province: String
}
type AddressConnection {
  pageInfo: PageInfo!
  edges: [AddressEdge!]!
}
type PageInfo {
  startCursor: String
  endCursor: String
  hasNextPage: Boolean!
  hasPreviousPage: Boolean!
}
type AddressEdge {
  cursor: String!
  node: Address!
}
type PersonConnection {
  pageInfo: PageInfo!
  edges: [PersonEdge!]!
}
type PersonEdge {
  cursor: String!
  node: Person!
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
  place: AddressWhereInput
  place_exists: Boolean
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
  place: AddressWhereInput
  place_exists: Boolean
}
input AddressWhereInput {
  id_in: [ID!]
  id_nin: [ID!]
  country: String
  country_in: [String!]
  country_nin: [String!]
  country_ne: String
  country_gt: String
  country_gte: String
  country_lt: String
  country_lte: String
  country_re: [RegExp!]
  country_exists: Boolean
}
enum PersonTextNamesEnum {
  firstName
  lastName
}
input PersonDistinctValuesOptionsInput {
  target: PersonTextNamesEnum!
}
input PersonWhereOneInput {
  id: ID!
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
  PersonCount(where: PersonWhereInput, token: String): Int!
  PersonDistinctValues(where: PersonWhereInput, options: PersonDistinctValuesOptionsInput, token: String): [String!]!
  Person(whereOne: PersonWhereOneInput!, token: String): Person
  People(where: PersonWhereInput, sort: PersonSortInput, pagination: PaginationInput, token: String): [Person!]!
  PeopleThroughConnection(where: PersonWhereInput, sort: PersonSortInput, after: String, before: String, first: Int, last: Int, token: String): PersonConnection!
  PeopleByUnique(where: PersonWhereByUniqueInput!, sort: PersonSortInput, token: String): [Person!]!
}
type Mutation {
  createManyPeople(data: [PersonCreateInput!]!, token: String): [Person!]!
  createPerson(data: PersonCreateInput!, token: String): Person!
  deleteFilteredPeople(where: PersonWhereInput, token: String): [Person!]!
  deleteFilteredPeopleReturnScalar(where: PersonWhereInput, token: String): Int!
  deleteManyPeople(whereOne: [PersonWhereOneInput!]!, token: String): [Person!]!
  deletePerson(whereOne: PersonWhereOneInput!, token: String): Person!
  importPeople(file: Upload!, options: ImportOptionsInput, token: String): [Person!]!
  pushIntoPerson(whereOne: PersonWhereOneInput!, data: PushIntoPersonInput!, positions: PersonPushPositionsInput, token: String): Person!
  updateFilteredPeople(where: PersonWhereInput, data: PersonUpdateInput!, token: String): [Person!]!
  updateFilteredPeopleReturnScalar(where: PersonWhereInput, data: PersonUpdateInput!, token: String): Int!
  updateManyPeople(whereOne: [PersonWhereOneInput!]!, data: [PersonUpdateInput!]!, token: String): [Person!]!
  updatePerson(whereOne: PersonWhereOneInput!, data: PersonUpdateInput!, token: String): Person!
}
type Subscription {
  createdPerson(where: PersonWhereInput): Person!
  updatedPerson(where: PersonWhereInput): UpdatedPersonPayload!
  deletedPerson(where: PersonWhereInput): Person!
}`;

    const result = composeGqlTypes(generalConfig);
    expect(result.typeDefs).toBe(expectedResult);
  });

  test('should create entities types for two duplex fields', () => {
    const placeConfig: SimplifiedTangibleEntityConfig = {
      name: 'Place',
      type: 'tangible',
      textFields: [{ name: 'name' }],
      duplexFields: [
        {
          name: 'citizens',
          oppositeName: 'location',
          array: true,
          configName: 'Person',
        },
        {
          name: 'visitors',
          oppositeName: 'favoritePlace',
          array: true,
          configName: 'Person',
        },
      ],
    };

    const personConfig: SimplifiedTangibleEntityConfig = {
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
          configName: 'Person',
          array: true,
          required: true,
        },
        {
          name: 'enemies',
          oppositeName: 'enemies',
          array: true,
          configName: 'Person',
        },
        {
          name: 'location',
          oppositeName: 'citizens',
          configName: 'Place',
          required: true,
        },
        {
          name: 'favoritePlace',
          oppositeName: 'visitors',
          configName: 'Place',
        },
      ],
    };

    const simplifiedAllEntityConfigs = [personConfig, placeConfig];
    const allEntityConfigs = composeAllEntityConfigs(simplifiedAllEntityConfigs);
    const generalConfig: GeneralConfig = { allEntityConfigs };

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
type Person implements Node {
  id: ID!
  createdAt: DateTime!
  updatedAt: DateTime!
  firstName: String!
  lastName: String!
  friends(where: PersonWhereInput, sort: PersonSortInput, pagination: PaginationInput): [Person!]!
  friendsThroughConnection(where: PersonWhereInput, sort: PersonSortInput, after: String, before: String, first: Int, last: Int): PersonConnection!
  enemies(where: PersonWhereInput, sort: PersonSortInput, pagination: PaginationInput): [Person!]!
  enemiesThroughConnection(where: PersonWhereInput, sort: PersonSortInput, after: String, before: String, first: Int, last: Int): PersonConnection!
  location: Place!
  favoritePlace: Place
}
type Place implements Node {
  id: ID!
  createdAt: DateTime!
  updatedAt: DateTime!
  name: String
  citizens(where: PersonWhereInput, sort: PersonSortInput, pagination: PaginationInput): [Person!]!
  citizensThroughConnection(where: PersonWhereInput, sort: PersonSortInput, after: String, before: String, first: Int, last: Int): PersonConnection!
  visitors(where: PersonWhereInput, sort: PersonSortInput, pagination: PaginationInput): [Person!]!
  visitorsThroughConnection(where: PersonWhereInput, sort: PersonSortInput, after: String, before: String, first: Int, last: Int): PersonConnection!
}
type PersonConnection {
  pageInfo: PageInfo!
  edges: [PersonEdge!]!
}
type PageInfo {
  startCursor: String
  endCursor: String
  hasNextPage: Boolean!
  hasPreviousPage: Boolean!
}
type PersonEdge {
  cursor: String!
  node: Person!
}
type PlaceConnection {
  pageInfo: PageInfo!
  edges: [PlaceEdge!]!
}
type PlaceEdge {
  cursor: String!
  node: Place!
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
input PersonWhereOneInput {
  id: ID!
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
  PersonCount(where: PersonWhereInput, token: String): Int!
  PlaceCount(where: PlaceWhereInput, token: String): Int!
  PersonDistinctValues(where: PersonWhereInput, options: PersonDistinctValuesOptionsInput, token: String): [String!]!
  PlaceDistinctValues(where: PlaceWhereInput, options: PlaceDistinctValuesOptionsInput, token: String): [String!]!
  Person(whereOne: PersonWhereOneInput!, token: String): Person
  Place(whereOne: PlaceWhereOneInput!, token: String): Place
  People(where: PersonWhereInput, sort: PersonSortInput, pagination: PaginationInput, token: String): [Person!]!
  Places(where: PlaceWhereInput, sort: PlaceSortInput, pagination: PaginationInput, token: String): [Place!]!
  PeopleThroughConnection(where: PersonWhereInput, sort: PersonSortInput, after: String, before: String, first: Int, last: Int, token: String): PersonConnection!
  PlacesThroughConnection(where: PlaceWhereInput, sort: PlaceSortInput, after: String, before: String, first: Int, last: Int, token: String): PlaceConnection!
  PeopleByUnique(where: PersonWhereByUniqueInput!, sort: PersonSortInput, token: String): [Person!]!
  PlacesByUnique(where: PlaceWhereByUniqueInput!, sort: PlaceSortInput, token: String): [Place!]!
}
type Mutation {
  copyManyPeople(whereOnes: [PersonCopyWhereOnesInput!]!, options: copyPersonOptionsInput, whereOne: [PersonWhereOneToCopyInput!], token: String): [Person!]!
  copyPerson(whereOnes: PersonCopyWhereOnesInput!, options: copyPersonOptionsInput, whereOne: PersonWhereOneToCopyInput, token: String): Person!
  createManyPeople(data: [PersonCreateInput!]!, token: String): [Person!]!
  createManyPlaces(data: [PlaceCreateInput!]!, token: String): [Place!]!
  createPerson(data: PersonCreateInput!, token: String): Person!
  createPlace(data: PlaceCreateInput!, token: String): Place!
  deleteFilteredPeople(where: PersonWhereInput, token: String): [Person!]!
  deleteFilteredPlaces(where: PlaceWhereInput, token: String): [Place!]!
  deleteFilteredPeopleReturnScalar(where: PersonWhereInput, token: String): Int!
  deleteFilteredPlacesReturnScalar(where: PlaceWhereInput, token: String): Int!
  deleteFilteredPlacesWithChildren(where: PlaceWhereInput, options: deletePlaceWithChildrenOptionsInput, token: String): [Place!]!
  deleteFilteredPlacesWithChildrenReturnScalar(where: PlaceWhereInput, options: deletePlaceWithChildrenOptionsInput, token: String): Int!
  deleteManyPeople(whereOne: [PersonWhereOneInput!]!, token: String): [Person!]!
  deleteManyPlaces(whereOne: [PlaceWhereOneInput!]!, token: String): [Place!]!
  deleteManyPlacesWithChildren(whereOne: [PlaceWhereOneInput!]!, options: deletePlaceWithChildrenOptionsInput, token: String): [Place!]!
  deletePerson(whereOne: PersonWhereOneInput!, token: String): Person!
  deletePlace(whereOne: PlaceWhereOneInput!, token: String): Place!
  deletePlaceWithChildren(whereOne: PlaceWhereOneInput!, options: deletePlaceWithChildrenOptionsInput, token: String): Place!
  importPeople(file: Upload!, options: ImportOptionsInput, token: String): [Person!]!
  importPlaces(file: Upload!, options: ImportOptionsInput, token: String): [Place!]!
  pushIntoPerson(whereOne: PersonWhereOneInput!, data: PushIntoPersonInput!, positions: PersonPushPositionsInput, token: String): Person!
  pushIntoPlace(whereOne: PlaceWhereOneInput!, data: PushIntoPlaceInput!, positions: PlacePushPositionsInput, token: String): Place!
  updateFilteredPeople(where: PersonWhereInput, data: PersonUpdateInput!, token: String): [Person!]!
  updateFilteredPlaces(where: PlaceWhereInput, data: PlaceUpdateInput!, token: String): [Place!]!
  updateFilteredPeopleReturnScalar(where: PersonWhereInput, data: PersonUpdateInput!, token: String): Int!
  updateFilteredPlacesReturnScalar(where: PlaceWhereInput, data: PlaceUpdateInput!, token: String): Int!
  updateManyPeople(whereOne: [PersonWhereOneInput!]!, data: [PersonUpdateInput!]!, token: String): [Person!]!
  updateManyPlaces(whereOne: [PlaceWhereOneInput!]!, data: [PlaceUpdateInput!]!, token: String): [Place!]!
  updatePerson(whereOne: PersonWhereOneInput!, data: PersonUpdateInput!, token: String): Person!
  updatePlace(whereOne: PlaceWhereOneInput!, data: PlaceUpdateInput!, token: String): Place!
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
    expect(result.typeDefs).toBe(expectedResult);
  });

  test('should create entities types with inventory for only queries', () => {
    const entityConfig: SimplifiedTangibleEntityConfig = {
      name: 'Example',
      type: 'tangible',
      textFields: [
        {
          name: 'textField',
        },
      ],
    };

    const simplifiedAllEntityConfigs = [entityConfig];
    const allEntityConfigs = composeAllEntityConfigs(simplifiedAllEntityConfigs);
    const inventory: Inventory = { name: 'test', include: { Query: true } };
    const generalConfig: GeneralConfig = { allEntityConfigs, inventory };
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
type Example implements Node {
  id: ID!
  createdAt: DateTime!
  updatedAt: DateTime!
  textField: String
}
type ExampleConnection {
  pageInfo: PageInfo!
  edges: [ExampleEdge!]!
}
type PageInfo {
  startCursor: String
  endCursor: String
  hasNextPage: Boolean!
  hasPreviousPage: Boolean!
}
type ExampleEdge {
  cursor: String!
  node: Example!
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
enum ExampleTextNamesEnum {
  textField
}
input ExampleDistinctValuesOptionsInput {
  target: ExampleTextNamesEnum!
}
input ExampleWhereOneInput {
  id: ID!
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
input ExampleWhereByUniqueInput {
  id_in: [ID!]
}
type Query {
  node(id: ID!): Node
  ExampleCount(where: ExampleWhereInput, token: String): Int!
  ExampleDistinctValues(where: ExampleWhereInput, options: ExampleDistinctValuesOptionsInput, token: String): [String!]!
  Example(whereOne: ExampleWhereOneInput!, token: String): Example
  Examples(where: ExampleWhereInput, sort: ExampleSortInput, pagination: PaginationInput, token: String): [Example!]!
  ExamplesThroughConnection(where: ExampleWhereInput, sort: ExampleSortInput, after: String, before: String, first: Int, last: Int, token: String): ExampleConnection!
  ExamplesByUnique(where: ExampleWhereByUniqueInput!, sort: ExampleSortInput, token: String): [Example!]!
}`;

    const result = composeGqlTypes(generalConfig);
    expect(result.typeDefs).toBe(expectedResult);
  });

  test('should create entities types with inventory for only mutations', () => {
    const entityConfig: SimplifiedTangibleEntityConfig = {
      name: 'Example',
      type: 'tangible',
      textFields: [
        {
          name: 'textField',
          index: true,
        },
      ],
    };

    const simplifiedAllEntityConfigs = [entityConfig];
    const allEntityConfigs = composeAllEntityConfigs(simplifiedAllEntityConfigs);
    const inventory: Inventory = { name: 'test', include: { Mutation: true } };
    const generalConfig: GeneralConfig = { allEntityConfigs, inventory };

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
type Example implements Node {
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
type Query {
  node(id: ID!): Node
}
type Mutation {
  createManyExamples(data: [ExampleCreateInput!]!, token: String): [Example!]!
  createExample(data: ExampleCreateInput!, token: String): Example!
  deleteFilteredExamples(where: ExampleWhereInput, token: String): [Example!]!
  deleteFilteredExamplesReturnScalar(where: ExampleWhereInput, token: String): Int!
  deleteManyExamples(whereOne: [ExampleWhereOneInput!]!, token: String): [Example!]!
  deleteExample(whereOne: ExampleWhereOneInput!, token: String): Example!
  importExamples(file: Upload!, options: ImportOptionsInput, token: String): [Example!]!
  updateFilteredExamples(where: ExampleWhereInput, data: ExampleUpdateInput!, token: String): [Example!]!
  updateFilteredExamplesReturnScalar(where: ExampleWhereInput, data: ExampleUpdateInput!, token: String): Int!
  updateManyExamples(whereOne: [ExampleWhereOneInput!]!, data: [ExampleUpdateInput!]!, token: String): [Example!]!
  updateExample(whereOne: ExampleWhereOneInput!, data: ExampleUpdateInput!, token: String): Example!
}`;

    const result = composeGqlTypes(generalConfig);
    expect(result.typeDefs).toBe(expectedResult);
  });

  test('should create entities types with inventory for only entities query', () => {
    const entityConfig: SimplifiedTangibleEntityConfig = {
      name: 'Example',
      type: 'tangible',
      textFields: [
        {
          name: 'textField',
        },
      ],
    };

    const simplifiedAllEntityConfigs = [entityConfig];
    const allEntityConfigs = composeAllEntityConfigs(simplifiedAllEntityConfigs);
    const inventory: Inventory = { name: 'test', include: { Query: { entities: true } } };
    const generalConfig: GeneralConfig = { allEntityConfigs, inventory };

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
type Example implements Node {
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
  node(id: ID!): Node
  Examples(where: ExampleWhereInput, sort: ExampleSortInput, pagination: PaginationInput, token: String): [Example!]!
}`;

    const result = composeGqlTypes(generalConfig);
    expect(result.typeDefs).toBe(expectedResult);
  });

  test('should create entities types with inventory for only entities query for Example config', () => {
    const entityConfig: SimplifiedTangibleEntityConfig = {
      name: 'Example',
      type: 'tangible',
      textFields: [
        {
          name: 'textField',
        },
      ],
    };

    const simplifiedAllEntityConfigs = [entityConfig];
    const allEntityConfigs = composeAllEntityConfigs(simplifiedAllEntityConfigs);
    const inventory: Inventory = { name: 'test', include: { Query: { entities: ['Example'] } } };
    const generalConfig: GeneralConfig = { allEntityConfigs, inventory };
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
type Example implements Node {
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
  node(id: ID!): Node
  Examples(where: ExampleWhereInput, sort: ExampleSortInput, pagination: PaginationInput, token: String): [Example!]!
}`;

    const result = composeGqlTypes(generalConfig);
    expect(result.typeDefs).toBe(expectedResult);
  });

  test('should create entities types with inventory for only create mutations', () => {
    const entityConfig: SimplifiedTangibleEntityConfig = {
      name: 'Example',
      type: 'tangible',
      textFields: [
        {
          name: 'textField',
          index: true,
        },
      ],
    };

    const simplifiedAllEntityConfigs = [entityConfig];
    const allEntityConfigs = composeAllEntityConfigs(simplifiedAllEntityConfigs);
    const inventory: Inventory = { name: 'test', include: { Mutation: { createEntity: true } } };
    const generalConfig: GeneralConfig = { allEntityConfigs, inventory };
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
type Example implements Node {
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
type Query {
  node(id: ID!): Node
}
type Mutation {
  createExample(data: ExampleCreateInput!, token: String): Example!
}`;

    const result = composeGqlTypes(generalConfig);
    expect(result.typeDefs).toBe(expectedResult);
  });

  test('should create entities types with inventory for only mutation cretateEntity', () => {
    const entityConfig: SimplifiedTangibleEntityConfig = {
      name: 'Example',
      type: 'tangible',
      textFields: [
        {
          name: 'textField',
          index: true,
        },
      ],
    };

    const simplifiedAllEntityConfigs = [entityConfig];
    const allEntityConfigs = composeAllEntityConfigs(simplifiedAllEntityConfigs);
    const inventory: Inventory = {
      name: 'test',
      include: { Mutation: { createEntity: ['Example'] } },
    };
    const generalConfig: GeneralConfig = { allEntityConfigs, inventory };
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
type Example implements Node {
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
type Query {
  node(id: ID!): Node
}
type Mutation {
  createExample(data: ExampleCreateInput!, token: String): Example!
}`;

    const result = composeGqlTypes(generalConfig);
    expect(result.typeDefs).toBe(expectedResult);
  });

  test('should create entities types with inventory for only one custom mutation loadEntity', () => {
    const signatureMethods: ActionSignatureMethods = {
      name: 'loadEntity',
      specificName: ({ name }: any) => (name === 'Example' ? `load${name}` : ''),
      argNames: () => ['path'],
      argTypes: () => ['String!'],
      involvedEntityNames: ({ name }: any) => ({ inputOutputEntity: name }),
      type: ({ name }: any) => name,
      config: (entityConfig: any) => entityConfig,
    };

    const entityConfig: SimplifiedTangibleEntityConfig = {
      name: 'Example',
      type: 'tangible',
      textFields: [
        {
          name: 'textField',
          index: true,
        },
      ],
    };

    const simplifiedAllEntityConfigs = [entityConfig];
    const allEntityConfigs = composeAllEntityConfigs(simplifiedAllEntityConfigs);
    const inventory: Inventory = { name: 'test', include: { Mutation: { loadEntity: true } } };
    const custom = { Mutation: { loadEntity: signatureMethods } };
    const generalConfig: GeneralConfig = { allEntityConfigs, custom, inventory };
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
type Example implements Node {
  id: ID!
  createdAt: DateTime!
  updatedAt: DateTime!
  textField: String
}
type Query {
  node(id: ID!): Node
}
type Mutation {
  loadExample(path: String!): Example
}`;

    const result = composeGqlTypes(generalConfig);
    expect(result.typeDefs).toBe(expectedResult);
  });

  test('should create entities types with inventory for only one custom query getEntity', () => {
    const getEntity: ActionSignatureMethods = {
      name: 'getEntity',
      specificName: ({ name }: any) => (name === 'Example' ? `get${name}` : ''),
      argNames: () => ['path'],
      argTypes: () => ['String!'],
      involvedEntityNames: ({ name }: any) => ({ inputOutputEntity: name }),
      type: ({ name }: any) => name,
      config: (entityConfig: any) => entityConfig,
    };

    const entityConfig: SimplifiedTangibleEntityConfig = {
      name: 'Example',
      type: 'tangible',
      textFields: [
        {
          name: 'textField',
          index: true,
        },
      ],
    };

    const simplifiedAllEntityConfigs = [entityConfig];
    const allEntityConfigs = composeAllEntityConfigs(simplifiedAllEntityConfigs);
    const inventory: Inventory = { name: 'test', include: { Query: { getEntity: true } } };
    const custom = { Query: { getEntity } };
    const generalConfig: GeneralConfig = { allEntityConfigs, custom, inventory };
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
type Example implements Node {
  id: ID!
  createdAt: DateTime!
  updatedAt: DateTime!
  textField: String
}
type Query {
  node(id: ID!): Node
  getExample(path: String!): Example
}`;

    const result = composeGqlTypes(generalConfig);
    expect(result.typeDefs).toBe(expectedResult);
  });

  test('should create entities types with custom input and return objects', () => {
    const entityInTimeRangeInput: ObjectSignatureMethods = {
      name: 'entityTimeRangeInput',
      specificName: ({ name }: any) => `${name}TimeRangeInput`,
      fieldNames: () => ['start', 'end'],
      fieldTypes: () => ['DateTime!', 'DateTime!'],
    };

    const ForCatalogDescendant: DescendantAttributes = {
      allow: { Example: ['entities', 'updateEntity'] },
      descendantKey: 'ForCatalog',
      addFields: {
        Example: {
          dateTimeFields: [{ name: 'start', required: true }, { name: 'end' }],
        },
      },
    };

    const entityInTimeRangeQuery: ActionSignatureMethods = {
      name: 'entityInTimeRangeQuery',
      specificName: ({ name }: any) => `${name}InTimeRangeQuery`,
      argNames: () => ['range'],
      argTypes: ({ name }: any) => [`${name}TimeRangeInput!`],
      involvedEntityNames: ({ name }: any) => ({ inputOutputEntity: name }),
      type: ({ name }: any) => `${name}!`,
      config: (entityConfig: any) => entityConfig,
    };

    const entityConfig: TangibleEntityConfig = {
      name: 'Example',
      type: 'tangible',
      textFields: [
        {
          name: 'textField',
          index: true,
          type: 'textFields',
        },
      ],
    };

    const allEntityConfigs = { Example: entityConfig };
    const inventory: Inventory = {
      name: 'test',
      include: {
        Query: { entitiesForCatalog: true, entities: true, entityInTimeRangeQuery: true },
        Mutation: { updateEntityForCatalog: true },
      },
      // include: { Query: true, Mutation: true },
    };
    const custom = {
      Input: { entityInTimeRangeInput },
      Query: { entityInTimeRangeQuery },
    };
    const descendant = { ForCatalog: ForCatalogDescendant };
    const generalConfig: GeneralConfig = { allEntityConfigs, custom, descendant, inventory };
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
type Example implements Node {
  id: ID!
  createdAt: DateTime!
  updatedAt: DateTime!
  textField: String
}
type ExampleForCatalog implements Node {
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
input ExampleTimeRangeInput {
  start: DateTime!
  end: DateTime!
}
input ExampleForCatalogWhereOneInput {
  id: ID!
}
input ExampleForCatalogUpdateInput {
  textField: String
  start: DateTime
  end: DateTime
}
type Query {
  node(id: ID!): Node
  Examples(where: ExampleWhereInput, sort: ExampleSortInput, pagination: PaginationInput, token: String): [Example!]!
  ExamplesForCatalog(where: ExampleForCatalogWhereInput, sort: ExampleForCatalogSortInput, pagination: PaginationInput, token: String): [ExampleForCatalog!]!
  ExampleInTimeRangeQuery(range: ExampleTimeRangeInput!): Example!
}
type Mutation {
  updateExampleForCatalog(whereOne: ExampleForCatalogWhereOneInput!, data: ExampleForCatalogUpdateInput!, token: String): ExampleForCatalog!
}`;

    const result = composeGqlTypes(generalConfig);
    expect(result.typeDefs).toBe(expectedResult);
  });

  test('should create descendant inputs for custom types with inventory for only one custom query getEntity', () => {
    const childNameFromParenName = { Menu: 'MenuSection' };

    const updateEntityWithChildren: ActionSignatureMethods = {
      name: 'updateEntityWithChildren',
      specificName: ({ name }: any) => (name === 'Menu' ? `update${name}WithChildren` : ''),
      argNames: () => ['whereOne', 'data', 'childWhereOne', 'childData', 'deleteWhereOne'],
      argTypes: ({ name }: any) => [
        `${name}WhereOneInput!`,
        `${name}UpdateInput`,
        `[${childNameFromParenName[name]}WhereOneInput!]!`,
        `[${childNameFromParenName[name]}UpdateInput!]!`,
        `[${childNameFromParenName[name]}WhereOneInput!]!`,
      ],
      involvedEntityNames: ({ name }: any) => ({ inputOutputEntity: name }),
      type: ({ name }: any) => name,
      config: (entityConfig: any) => entityConfig,
    };

    const menuSectionConfig = {} as TangibleEntityConfig;
    const menuConfig: TangibleEntityConfig = {
      name: 'Menu',
      type: 'tangible',
      textFields: [
        {
          name: 'menuName',
          index: true,
          type: 'textFields',
        },
      ],
      duplexFields: [
        {
          name: 'sections',
          config: menuSectionConfig,
          oppositeName: 'menu',
          array: true,
          type: 'duplexFields',
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
          name: 'menu',
          config: menuConfig,
          oppositeName: 'sections',
          type: 'duplexFields',
        },
      ],
    });

    const allEntityConfigs = { Menu: menuConfig, MenuSection: menuSectionConfig };
    const inventory: Inventory = {
      name: 'test',
      include: { Mutation: { updateEntityWithChildren: ['Menu'] } },
    };
    const custom = { Mutation: { updateEntityWithChildren } };

    const generalConfig: GeneralConfig = {
      allEntityConfigs,
      custom,
      inventory,
    };
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
type Menu implements Node {
  id: ID!
  createdAt: DateTime!
  updatedAt: DateTime!
  menuName: String
}
type MenuSection implements Node {
  id: ID!
  createdAt: DateTime!
  updatedAt: DateTime!
  menuSectionName: String
  menu: Menu
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
  menu: MenuCreateChildInput
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
  menu: MenuCreateChildInput
}
type Query {
  node(id: ID!): Node
}
type Mutation {
  updateMenuWithChildren(whereOne: MenuWhereOneInput!, data: MenuUpdateInput, childWhereOne: [MenuSectionWhereOneInput!]!, childData: [MenuSectionUpdateInput!]!, deleteWhereOne: [MenuSectionWhereOneInput!]!): Menu
}`;

    const result = composeGqlTypes(generalConfig);
    expect(result.typeDefs).toBe(expectedResult);
  });

  test('should create entities types with descendant & inventory for only queries', () => {
    const entityConfig: SimplifiedTangibleEntityConfig = {
      name: 'Example',
      type: 'tangible',
      textFields: [
        {
          name: 'textField',
        },
      ],
    };

    const ForCatalog: DescendantAttributes = {
      allow: { Example: ['entitiesThroughConnection'], ExampleEdge: [], ExampleConnection: [] },
      descendantKey: 'ForCatalog',
      descendantFields: {
        ExampleEdge: { node: 'ForCatalog' },
        ExampleConnection: { edges: 'ForCatalog' },
      },
    };

    const simplifiedAllEntityConfigs = [entityConfig];
    const allEntityConfigs = composeAllEntityConfigs(simplifiedAllEntityConfigs);
    const inventory: Inventory = { name: 'test', include: { Query: true } };
    const descendant = { ForCatalog };
    const generalConfig: GeneralConfig = { allEntityConfigs, descendant, inventory };
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
type Example implements Node {
  id: ID!
  createdAt: DateTime!
  updatedAt: DateTime!
  textField: String
}
type ExampleConnection {
  pageInfo: PageInfo!
  edges: [ExampleEdge!]!
}
type PageInfo {
  startCursor: String
  endCursor: String
  hasNextPage: Boolean!
  hasPreviousPage: Boolean!
}
type ExampleEdge {
  cursor: String!
  node: Example!
}
type ExampleForCatalogConnection {
  pageInfo: PageInfo!
  edges: [ExampleForCatalogEdge!]!
}
type ExampleForCatalogEdge {
  cursor: String!
  node: ExampleForCatalog!
}
type ExampleForCatalog implements Node {
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
enum ExampleTextNamesEnum {
  textField
}
input ExampleDistinctValuesOptionsInput {
  target: ExampleTextNamesEnum!
}
input ExampleWhereOneInput {
  id: ID!
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
input ExampleWhereByUniqueInput {
  id_in: [ID!]
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
}
enum ExampleForCatalogSortEnum {
  createdAt_ASC
  createdAt_DESC
  updatedAt_ASC
  updatedAt_DESC
}
input ExampleForCatalogSortInput {
  sortBy: [ExampleForCatalogSortEnum]
}
type Query {
  node(id: ID!): Node
  ExampleCount(where: ExampleWhereInput, token: String): Int!
  ExampleDistinctValues(where: ExampleWhereInput, options: ExampleDistinctValuesOptionsInput, token: String): [String!]!
  Example(whereOne: ExampleWhereOneInput!, token: String): Example
  Examples(where: ExampleWhereInput, sort: ExampleSortInput, pagination: PaginationInput, token: String): [Example!]!
  ExamplesThroughConnection(where: ExampleWhereInput, sort: ExampleSortInput, after: String, before: String, first: Int, last: Int, token: String): ExampleConnection!
  ExamplesByUnique(where: ExampleWhereByUniqueInput!, sort: ExampleSortInput, token: String): [Example!]!
  ExamplesThroughConnectionForCatalog(where: ExampleForCatalogWhereInput, sort: ExampleForCatalogSortInput, after: String, before: String, first: Int, last: Int, token: String): ExampleForCatalogConnection!
}`;

    const result = composeGqlTypes(generalConfig);
    expect(result.typeDefs).toBe(expectedResult);
  });

  test('should create entities types with descendant & inventory for only mutation where involed entities was split', () => {
    const entityConfig: SimplifiedTangibleEntityConfig = {
      name: 'Example',
      type: 'tangible',
      textFields: [
        {
          name: 'textField',
        },
      ],
    };

    const ForCatalog: DescendantAttributes = {
      allow: { Example: ['updateEntity'] },
      descendantKey: 'ForCatalog',
      involvedOutputDescendantKeys: { Example: { outputEntity: 'ForView' } },
    };

    const ForView: DescendantAttributes = {
      allow: { Example: [] },
      descendantKey: 'ForView',
    };

    const simplifiedAllEntityConfigs = [entityConfig];
    const allEntityConfigs = composeAllEntityConfigs(simplifiedAllEntityConfigs);
    const inventory: Inventory = {
      name: 'test',
      include: { Mutation: { updateEntityForCatalog: true } },
    };
    const descendant = { ForCatalog, ForView };
    const generalConfig: GeneralConfig = { allEntityConfigs, descendant, inventory };
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
type ExampleForView implements Node {
  id: ID!
  createdAt: DateTime!
  updatedAt: DateTime!
  textField: String
}
input ExampleForCatalogWhereOneInput {
  id: ID!
}
input ExampleForCatalogUpdateInput {
  textField: String
}
type Query {
  node(id: ID!): Node
}
type Mutation {
  updateExampleForCatalog(whereOne: ExampleForCatalogWhereOneInput!, data: ExampleForCatalogUpdateInput!, token: String): ExampleForView!
}`;

    const result = composeGqlTypes(generalConfig);
    expect(result.typeDefs).toBe(expectedResult);
  });

  test('should create entities types with descendant & inventory for only queries', () => {
    const entityConfig: SimplifiedTangibleEntityConfig = {
      name: 'Example',
      type: 'tangible',
      textFields: [
        {
          name: 'textField',
        },
      ],
    };

    const ForCatalog: DescendantAttributes = {
      descendantKey: 'ForCatalog',
      allow: { Example: ['entitiesThroughConnection'] },
      involvedOutputDescendantKeys: { Example: { outputEntity: 'ForView' } },
    };

    const ForView: DescendantAttributes = {
      descendantKey: 'ForView',
      allow: { Example: [], ExampleEdge: [], ExampleConnection: [] },
      descendantFields: {
        ExampleEdge: { node: 'ForView' },
        ExampleConnection: { edges: 'ForView' },
      },
      // "involvedOutputDescendantKeys" not change types that are returned by "ForCatalog" descendant actions
      involvedOutputDescendantKeys: { Example: { outputEntity: 'ForGuest' } },
    };

    const ForGuest: DescendantAttributes = {
      descendantKey: 'ForGuest',
      allow: { Example: [] },
    };

    const simplifiedAllEntityConfigs = [entityConfig];
    const allEntityConfigs = composeAllEntityConfigs(simplifiedAllEntityConfigs);
    const inventory: Inventory = {
      name: 'test',
      include: { Query: { entitiesThroughConnectionForCatalog: true } },
    };
    const descendant = { ForCatalog, ForView, ForGuest };
    const generalConfig: GeneralConfig = { allEntityConfigs, descendant, inventory };
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
type ExampleForViewConnection {
  pageInfo: PageInfo!
  edges: [ExampleForViewEdge!]!
}
type PageInfo {
  startCursor: String
  endCursor: String
  hasNextPage: Boolean!
  hasPreviousPage: Boolean!
}
type ExampleForViewEdge {
  cursor: String!
  node: ExampleForView!
}
type ExampleForView implements Node {
  id: ID!
  createdAt: DateTime!
  updatedAt: DateTime!
  textField: String
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
}
enum ExampleForCatalogSortEnum {
  createdAt_ASC
  createdAt_DESC
  updatedAt_ASC
  updatedAt_DESC
}
input ExampleForCatalogSortInput {
  sortBy: [ExampleForCatalogSortEnum]
}
type Query {
  node(id: ID!): Node
  ExamplesThroughConnectionForCatalog(where: ExampleForCatalogWhereInput, sort: ExampleForCatalogSortInput, after: String, before: String, first: Int, last: Int, token: String): ExampleForViewConnection!
}`;

    const result = composeGqlTypes(generalConfig);
    expect(result.typeDefs).toBe(expectedResult);
  });
});
