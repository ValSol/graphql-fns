import type { EntityConfig } from '../tsTypes';

// kinds of fields that can be used in "XSortInput" (besides "id", "createdAt" & "updatedAt")
const sortableFieldKinds = [
  'enumFields',
  'dateTimeFields',
  'textFields',
  'intFields',
  'floatFields',
  'booleanFields',
] as const;

// names of the fields that can be used in "XSortInput": indexed scalar (not array) fields
const getSortableFieldNames = (entityConfig: EntityConfig): string[] =>
  sortableFieldKinds.reduce<string[]>((prev, fieldKind) => {
    const fields = (entityConfig[fieldKind] || []) as {
      array?: boolean;
      index?: boolean;
      name: string;
    }[];

    fields.filter(({ array, index }) => !array && index).forEach(({ name }) => prev.push(name));

    return prev;
  }, []);

export default getSortableFieldNames;
