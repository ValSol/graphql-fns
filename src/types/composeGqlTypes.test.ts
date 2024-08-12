/* eslint-env jest */

import type {
  ActionSignatureMethods,
  DescendantAttributes,
  TangibleEntityConfig,
  GeneralConfig,
  Inventory,
  ObjectSignatureMethods,
  SimplifiedEmbeddedEntityConfig,
  SimplifiedTangibleEntityConfig,
} from '../tsTypes';

import composeAllEntityConfigs from '../utils/composeAllEntityConfigs';
import composeGqlTypes from './composeGqlTypes';

describe('composeGqlTypes', () => {
  test('should create entities types to copy with children', () => {
    const menuConfig: SimplifiedTangibleEntityConfig = {
      name: 'Menu',
      type: 'tangible',

      uniqueCompoundIndexes: [['name', 'clone']],

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

      filterFields: [
        { name: 'selectedSections', array: true, configName: 'MenuSection', required: true },
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
  sectionsCount(where: MenuSectionWhereInput): Int!
  sectionsDistinctValues(where: MenuSectionWhereInput, options: MenuSectionDistinctValuesOptionsInput!): [String!]!
  selectedSections(where: MenuSectionWhereInput, sort: MenuSectionSortInput, pagination: PaginationInput): [MenuSection!]!
  selectedSectionsThroughConnection(where: MenuSectionWhereInput, sort: MenuSectionSortInput, after: String, before: String, first: Int, last: Int): MenuSectionConnection!
  selectedSectionsCount(where: MenuSectionWhereInput): Int!
  selectedSectionsDistinctValues(where: MenuSectionWhereInput, options: MenuSectionDistinctValuesOptionsInput!): [String!]!
  cloneGetOrCreate(data: MenuCloneCreateInput!): MenuClone
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
type PageInfo {
  startCursor: String
  endCursor: String
  hasNextPage: Boolean!
  hasPreviousPage: Boolean!
}
type MenuSectionEdge {
  cursor: String!
  node: MenuSection!
}
type MenuClone implements Node {
  id: ID!
  createdAt: DateTime!
  updatedAt: DateTime!
  name: String!
  original: Menu
  sections(where: MenuCloneSectionWhereInput, sort: MenuCloneSectionSortInput, pagination: PaginationInput): [MenuCloneSection!]!
  sectionsThroughConnection(where: MenuCloneSectionWhereInput, sort: MenuCloneSectionSortInput, after: String, before: String, first: Int, last: Int): MenuCloneSectionConnection!
  sectionsCount(where: MenuCloneSectionWhereInput): Int!
  sectionsDistinctValues(where: MenuCloneSectionWhereInput, options: MenuCloneSectionDistinctValuesOptionsInput!): [String!]!
  originalGetOrCreate(data: MenuCreateInput!): Menu
}
type MenuCloneSection implements Node {
  id: ID!
  createdAt: DateTime!
  updatedAt: DateTime!
  name: String!
  menu: MenuClone
}
type MenuCloneSectionConnection {
  pageInfo: PageInfo!
  edges: [MenuCloneSectionEdge!]!
}
type MenuCloneSectionEdge {
  cursor: String!
  node: MenuCloneSection!
}
type MenuConnection {
  pageInfo: PageInfo!
  edges: [MenuEdge!]!
}
type MenuEdge {
  cursor: String!
  node: Menu!
}
type MenuCloneConnection {
  pageInfo: PageInfo!
  edges: [MenuCloneEdge!]!
}
type MenuCloneEdge {
  cursor: String!
  node: MenuClone!
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
input MenuWhereCompoundOneInput {
  name: String
  name_exists: Boolean
  clone: ID
  clone_exists: Boolean
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
input MenuCloneWhereOneInput {
  id: ID!
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
input MenuCreateInput {
  id: ID
  clone: MenuCloneCreateChildInput
  sections: MenuSectionCreateOrPushChildrenInput
  selectedSections: MenuSectionWhereInput!
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
enum MenuCloneSectionSortEnum {
  createdAt_ASC
  createdAt_DESC
  updatedAt_ASC
  updatedAt_DESC
}
input MenuCloneSectionSortInput {
  sortBy: [MenuCloneSectionSortEnum]
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
  fieldsToCopy: [copyMenuThroughcloneOptionsEnum!]
  fieldsForbiddenToCopy: [copyMenuThroughcloneOptionsEnum!]
}
input copyMenuThroughsectionsOptionInput {
  fieldsToCopy: [copyMenuThroughsectionsOptionsEnum!]
  fieldsForbiddenToCopy: [copyMenuThroughsectionsOptionsEnum!]
}
input copyMenuOptionsInput {
  clone: copyMenuThroughcloneOptionInput
  sections: copyMenuThroughsectionsOptionInput
}
input MenuUpdateInput {
  name: String
  clone: MenuCloneCreateChildInput
  sections: MenuSectionCreateOrPushChildrenInput
  selectedSections: MenuSectionWhereInput
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
  fieldsToCopy: [copyMenuCloneThroughoriginalOptionsEnum!]
  fieldsForbiddenToCopy: [copyMenuCloneThroughoriginalOptionsEnum!]
}
input copyMenuCloneThroughsectionsOptionInput {
  fieldsToCopy: [copyMenuCloneThroughsectionsOptionsEnum!]
  fieldsForbiddenToCopy: [copyMenuCloneThroughsectionsOptionsEnum!]
}
input copyMenuCloneOptionsInput {
  original: copyMenuCloneThroughoriginalOptionInput
  sections: copyMenuCloneThroughsectionsOptionInput
}
input MenuCloneUpdateInput {
  name: String
  original: MenuCreateChildInput
  sections: MenuCloneSectionCreateOrPushChildrenInput
}
input MenuSectionCopyWhereOnesInput {
  menu: MenuWhereOneInput
}
enum copyMenuSectionThroughmenuOptionsEnum {
  name
}
input copyMenuSectionThroughmenuOptionInput {
  fieldsToCopy: [copyMenuSectionThroughmenuOptionsEnum!]
  fieldsForbiddenToCopy: [copyMenuSectionThroughmenuOptionsEnum!]
}
input copyMenuSectionOptionsInput {
  menu: copyMenuSectionThroughmenuOptionInput
}
input MenuSectionWhereOneToCopyInput {
  id: ID!
}
input MenuSectionUpdateInput {
  name: String
  menu: MenuCreateChildInput
}
input MenuCloneSectionCopyWhereOnesInput {
  menu: MenuCloneWhereOneInput
}
enum copyMenuCloneSectionThroughmenuOptionsEnum {
  name
}
input copyMenuCloneSectionThroughmenuOptionInput {
  fieldsToCopy: [copyMenuCloneSectionThroughmenuOptionsEnum!]
  fieldsForbiddenToCopy: [copyMenuCloneSectionThroughmenuOptionsEnum!]
}
input copyMenuCloneSectionOptionsInput {
  menu: copyMenuCloneSectionThroughmenuOptionInput
}
input MenuCloneSectionWhereOneToCopyInput {
  id: ID!
}
input MenuCloneSectionUpdateInput {
  name: String
  menu: MenuCloneCreateChildInput
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
input PushIntoMenuInput {
  sections: MenuSectionCreateOrPushChildrenInput
  selectedSections: MenuSectionWhereInput
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
  MenuDistinctValues(where: MenuWhereInput, options: MenuDistinctValuesOptionsInput!, token: String): [String!]!
  MenuCloneDistinctValues(where: MenuCloneWhereInput, options: MenuCloneDistinctValuesOptionsInput!, token: String): [String!]!
  MenuSectionDistinctValues(where: MenuSectionWhereInput, options: MenuSectionDistinctValuesOptionsInput!, token: String): [String!]!
  MenuCloneSectionDistinctValues(where: MenuCloneSectionWhereInput, options: MenuCloneSectionDistinctValuesOptionsInput!, token: String): [String!]!
  Menu(whereOne: MenuWhereOneInput, whereCompoundOne: MenuWhereCompoundOneInput, token: String): Menu
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
  copyManyMenus(whereOnes: [MenuCopyWhereOnesInput!]!, options: copyMenuOptionsInput, data: [MenuUpdateInput!], token: String): [Menu!]!
  copyManyMenuClones(whereOnes: [MenuCloneCopyWhereOnesInput!]!, options: copyMenuCloneOptionsInput, data: [MenuCloneUpdateInput!], token: String): [MenuClone!]!
  copyManyMenuSections(whereOnes: [MenuSectionCopyWhereOnesInput!]!, options: copyMenuSectionOptionsInput, whereOne: [MenuSectionWhereOneToCopyInput!], data: [MenuSectionUpdateInput!], token: String): [MenuSection!]!
  copyManyMenuCloneSections(whereOnes: [MenuCloneSectionCopyWhereOnesInput!]!, options: copyMenuCloneSectionOptionsInput, whereOne: [MenuCloneSectionWhereOneToCopyInput!], data: [MenuCloneSectionUpdateInput!], token: String): [MenuCloneSection!]!
  copyManyMenusWithChildren(whereOnes: [MenuCopyWhereOnesInput!]!, options: copyMenuOptionsInput, token: String): [Menu!]!
  copyManyMenuClonesWithChildren(whereOnes: [MenuCloneCopyWhereOnesInput!]!, options: copyMenuCloneOptionsInput, token: String): [MenuClone!]!
  copyMenu(whereOnes: MenuCopyWhereOnesInput!, options: copyMenuOptionsInput, data: MenuUpdateInput, token: String): Menu!
  copyMenuClone(whereOnes: MenuCloneCopyWhereOnesInput!, options: copyMenuCloneOptionsInput, data: MenuCloneUpdateInput, token: String): MenuClone!
  copyMenuSection(whereOnes: MenuSectionCopyWhereOnesInput!, options: copyMenuSectionOptionsInput, whereOne: MenuSectionWhereOneToCopyInput, data: MenuSectionUpdateInput, token: String): MenuSection!
  copyMenuCloneSection(whereOnes: MenuCloneSectionCopyWhereOnesInput!, options: copyMenuCloneSectionOptionsInput, whereOne: MenuCloneSectionWhereOneToCopyInput, data: MenuCloneSectionUpdateInput, token: String): MenuCloneSection!
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
input GeospatialPointInput {
  lng: Float!
  lat: Float!
}
input GeospatialSphereInput {
  center: GeospatialPointInput!
  radius: Float!
}
type GeospatialPolygonRing {
  ring: [GeospatialPoint!]!
}
type GeospatialPolygon {
  externalRing: GeospatialPolygonRing!
  internalRings: [GeospatialPolygonRing!]
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
  position_withinPolygon: [GeospatialPointInput!]
  position_withinSphere: GeospatialSphereInput
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
  position_withinPolygon: [GeospatialPointInput!]
  position_withinSphere: GeospatialSphereInput
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
  area_withinPolygon: [GeospatialPointInput!]
  area_withinSphere: GeospatialSphereInput
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
  area_withinPolygon: [GeospatialPointInput!]
  area_withinSphere: GeospatialSphereInput
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
enum Example1GeospatialFieldNamesEnum {
  position
}
input Example1NearInput {
  geospatialField: Example1GeospatialFieldNamesEnum!
  coordinates: GeospatialPointInput!
  maxDistance: Float
  minDistance: Float
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
  Example1Count(where: Example1WhereInput, token: String): Int!
  Example2Count(where: Example2WhereInput, token: String): Int!
  Example1DistinctValues(where: Example1WhereInput, options: Example1DistinctValuesOptionsInput!, token: String): [String!]!
  Example2DistinctValues(where: Example2WhereInput, options: Example2DistinctValuesOptionsInput!, token: String): [String!]!
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
  deleteFilteredExample1sReturnScalar(where: Example1WhereInput, token: String): Int!
  deleteFilteredExample2sReturnScalar(where: Example2WhereInput, token: String): Int!
  deleteManyExample1s(whereOne: [Example1WhereOneInput!]!, token: String): [Example1!]!
  deleteManyExample2s(whereOne: [Example2WhereOneInput!]!, token: String): [Example2!]!
  deleteExample1(whereOne: Example1WhereOneInput!, token: String): Example1!
  deleteExample2(whereOne: Example2WhereOneInput!, token: String): Example2!
  pushIntoExample2(whereOne: Example2WhereOneInput!, data: PushIntoExample2Input!, positions: Example2PushPositionsInput, token: String): Example2!
  updateFilteredExample1s(where: Example1WhereInput, near: Example1NearInput, data: Example1UpdateInput!, token: String): [Example1!]!
  updateFilteredExample2s(where: Example2WhereInput, data: Example2UpdateInput!, token: String): [Example2!]!
  updateFilteredExample1sReturnScalar(where: Example1WhereInput, data: Example1UpdateInput!, token: String): Int!
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
  friendsCount(where: PersonWhereInput): Int!
  friendsDistinctValues(where: PersonWhereInput, options: PersonDistinctValuesOptionsInput!): [String!]!
  enemies(where: PersonWhereInput, sort: PersonSortInput, pagination: PaginationInput): [Person!]!
  enemiesThroughConnection(where: PersonWhereInput, sort: PersonSortInput, after: String, before: String, first: Int, last: Int): PersonConnection!
  enemiesCount(where: PersonWhereInput): Int!
  enemiesDistinctValues(where: PersonWhereInput, options: PersonDistinctValuesOptionsInput!): [String!]!
  location: Place!
  favoritePlace: Place
  fellows(where: PersonWhereInput, sort: PersonSortInput, pagination: PaginationInput): [Person!]!
  fellowsThroughConnection(where: PersonWhereInput, sort: PersonSortInput, after: String, before: String, first: Int, last: Int): PersonConnection!
  fellowsCount(where: PersonWhereInput): Int!
  fellowsDistinctValues(where: PersonWhereInput, options: PersonDistinctValuesOptionsInput!): [String!]!
  opponents(where: PersonWhereInput, sort: PersonSortInput, pagination: PaginationInput): [Person!]!
  opponentsThroughConnection(where: PersonWhereInput, sort: PersonSortInput, after: String, before: String, first: Int, last: Int): PersonConnection!
  opponentsCount(where: PersonWhereInput): Int!
  opponentsDistinctValues(where: PersonWhereInput, options: PersonDistinctValuesOptionsInput!): [String!]!
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
type Place implements Node {
  id: ID!
  createdAt: DateTime!
  updatedAt: DateTime!
  title: String!
  citisens(where: PersonWhereInput, sort: PersonSortInput, pagination: PaginationInput): [Person!]!
  citisensThroughConnection(where: PersonWhereInput, sort: PersonSortInput, after: String, before: String, first: Int, last: Int): PersonConnection!
  citisensCount(where: PersonWhereInput): Int!
  citisensDistinctValues(where: PersonWhereInput, options: PersonDistinctValuesOptionsInput!): [String!]!
  customers(where: PersonWhereInput, sort: PersonSortInput, pagination: PaginationInput): [Person!]!
  customersThroughConnection(where: PersonWhereInput, sort: PersonSortInput, after: String, before: String, first: Int, last: Int): PersonConnection!
  customersCount(where: PersonWhereInput): Int!
  customersDistinctValues(where: PersonWhereInput, options: PersonDistinctValuesOptionsInput!): [String!]!
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
  PersonDistinctValues(where: PersonWhereInput, options: PersonDistinctValuesOptionsInput!, token: String): [String!]!
  PlaceDistinctValues(where: PlaceWhereInput, options: PlaceDistinctValuesOptionsInput!, token: String): [String!]!
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
          variants: ['plain', 'connection', 'count'],
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
          variants: ['plain', 'connection', 'count'],
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
  locationsCount: Int!
  place: Address
  places(slice: SliceInput): [Address!]!
  placesThroughConnection(after: String, before: String, first: Int, last: Int): AddressConnection!
  placesCount: Int!
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
type Address {
  id: ID!
  country: String!
  province: String
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
  _index: Int
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
  PersonDistinctValues(where: PersonWhereInput, options: PersonDistinctValuesOptionsInput!, token: String): [String!]!
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
  friendsCount(where: PersonWhereInput): Int!
  friendsDistinctValues(where: PersonWhereInput, options: PersonDistinctValuesOptionsInput!): [String!]!
  enemies(where: PersonWhereInput, sort: PersonSortInput, pagination: PaginationInput): [Person!]!
  enemiesThroughConnection(where: PersonWhereInput, sort: PersonSortInput, after: String, before: String, first: Int, last: Int): PersonConnection!
  enemiesCount(where: PersonWhereInput): Int!
  enemiesDistinctValues(where: PersonWhereInput, options: PersonDistinctValuesOptionsInput!): [String!]!
  location: Place!
  favoritePlace: Place
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
type Place implements Node {
  id: ID!
  createdAt: DateTime!
  updatedAt: DateTime!
  name: String
  citizens(where: PersonWhereInput, sort: PersonSortInput, pagination: PaginationInput): [Person!]!
  citizensThroughConnection(where: PersonWhereInput, sort: PersonSortInput, after: String, before: String, first: Int, last: Int): PersonConnection!
  citizensCount(where: PersonWhereInput): Int!
  citizensDistinctValues(where: PersonWhereInput, options: PersonDistinctValuesOptionsInput!): [String!]!
  visitors(where: PersonWhereInput, sort: PersonSortInput, pagination: PaginationInput): [Person!]!
  visitorsThroughConnection(where: PersonWhereInput, sort: PersonSortInput, after: String, before: String, first: Int, last: Int): PersonConnection!
  visitorsCount(where: PersonWhereInput): Int!
  visitorsDistinctValues(where: PersonWhereInput, options: PersonDistinctValuesOptionsInput!): [String!]!
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
  fieldsToCopy: [copyPersonThroughfriendsOptionsEnum!]
  fieldsForbiddenToCopy: [copyPersonThroughfriendsOptionsEnum!]
}
input copyPersonThroughenemiesOptionInput {
  fieldsToCopy: [copyPersonThroughenemiesOptionsEnum!]
  fieldsForbiddenToCopy: [copyPersonThroughenemiesOptionsEnum!]
}
input copyPersonOptionsInput {
  friends: copyPersonThroughfriendsOptionInput
  enemies: copyPersonThroughenemiesOptionInput
}
input PersonWhereOneToCopyInput {
  id: ID!
}
input PersonUpdateInput {
  firstName: String
  lastName: String
  friends: PersonCreateOrPushThru_friends_FieldChildrenInput
  enemies: PersonCreateOrPushChildrenInput
  location: PlaceCreateChildInput
  favoritePlace: PlaceCreateChildInput
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
  PersonDistinctValues(where: PersonWhereInput, options: PersonDistinctValuesOptionsInput!, token: String): [String!]!
  PlaceDistinctValues(where: PlaceWhereInput, options: PlaceDistinctValuesOptionsInput!, token: String): [String!]!
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
  copyManyPeople(whereOnes: [PersonCopyWhereOnesInput!]!, options: copyPersonOptionsInput, whereOne: [PersonWhereOneToCopyInput!], data: [PersonUpdateInput!], token: String): [Person!]!
  copyPerson(whereOnes: PersonCopyWhereOnesInput!, options: copyPersonOptionsInput, whereOne: PersonWhereOneToCopyInput, data: PersonUpdateInput, token: String): Person!
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
  ExampleDistinctValues(where: ExampleWhereInput, options: ExampleDistinctValuesOptionsInput!, token: String): [String!]!
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

      interfaces: ['ExampleInterface'],

      textFields: [
        {
          name: 'textField',
          index: true,
        },
      ],
    };

    const entityConfig2: SimplifiedTangibleEntityConfig = {
      name: 'Example2',
      type: 'tangible',

      interfaces: ['ExampleInterface'],

      textFields: [
        {
          name: 'textField',
          index: true,
        },
        {
          name: 'textField2',
          index: true,
        },
      ],
    };

    const simplifiedAllEntityConfigs = [entityConfig, entityConfig2];
    const allEntityConfigs = composeAllEntityConfigs(simplifiedAllEntityConfigs);
    const inventory: Inventory = {
      name: 'test',
      include: { Mutation: { createEntity: ['Example', 'Example2'] } },
    };
    const interfaces = { ExampleInterface: ['textField', 'updatedAt'] };
    const generalConfig: GeneralConfig = { allEntityConfigs, inventory, interfaces };
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
interface ExampleInterface {
  textField: String
  updatedAt: DateTime!
}
type Example implements Node & ExampleInterface {
  id: ID!
  createdAt: DateTime!
  updatedAt: DateTime!
  textField: String
}
type Example2 implements Node & ExampleInterface {
  id: ID!
  createdAt: DateTime!
  updatedAt: DateTime!
  textField: String
  textField2: String
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
input Example2CreateInput {
  id: ID
  textField: String
  textField2: String
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
type Query {
  node(id: ID!): Node
}
type Mutation {
  createExample(data: ExampleCreateInput!, token: String): Example!
  createExample2(data: Example2CreateInput!, token: String): Example2!
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
  ExampleDistinctValues(where: ExampleWhereInput, options: ExampleDistinctValuesOptionsInput!, token: String): [String!]!
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

      textFields: [{ name: 'textField' }, { name: 'textField2' }],
    };

    const ForCatalog: DescendantAttributes = {
      descendantKey: 'ForCatalog',
      allow: { Example: ['entitiesThroughConnection'] },
      involvedOutputDescendantKeys: { Example: { outputEntity: 'ForView' } },
    };

    const ForView: DescendantAttributes = {
      descendantKey: 'ForView',
      allow: { Example: [], ExampleEdge: [], ExampleConnection: [] },
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
