import type { EmbeddedField, FileField, DescendantAttributes, FlatField } from '../../tsTypes';

type AllFields = ReadonlyArray<FlatField | EmbeddedField | FileField>;

type Arg = {
  descendantKey: string;
  descendant?: {
    readonly [descendantKey: string]: DescendantAttributes;
  };
  fields: AllFields;
  firstThingName: string;
  fieldType: string;
};

const composeDescendantFields = ({
  descendantKey,
  descendant,
  fields,
  firstThingName,
  fieldType,
}: Arg): AllFields => {
  if (!descendantKey) return fields;

  const fieldNames = fields.map(({ name }) => name);

  const filteredFields = fields.filter(({ name }) => {
    // eslint-disable-next-line no-nested-ternary
    const excludeFields = descendant
      ? descendant[descendantKey].excludeFields
        ? descendant[descendantKey].excludeFields[firstThingName] || []
        : []
      : [];

    // eslint-disable-next-line no-nested-ternary
    const includeFields = descendant
      ? descendant[descendantKey].includeFields
        ? descendant[descendantKey].includeFields[firstThingName] || fieldNames
        : fieldNames
      : [];

    return !excludeFields.includes(name) && includeFields.includes(name);
  });

  // eslint-disable-next-line no-nested-ternary
  const addFields = descendant
    ? // eslint-disable-next-line no-nested-ternary
      descendant[descendantKey].addFields
      ? descendant[descendantKey].addFields[firstThingName]
        ? descendant[descendantKey].addFields[firstThingName][fieldType] || []
        : []
      : []
    : [];

  const allFields = [...filteredFields, ...addFields];

  // eslint-disable-next-line no-nested-ternary
  const freezedFields = descendant
    ? // eslint-disable-next-line no-nested-ternary
      descendant[descendantKey].freezedFields
      ? descendant[descendantKey].freezedFields[firstThingName] || []
      : []
    : [];

  const allFieldsFreezed = !freezedFields.length
    ? allFields
    : allFields.map((field) =>
        freezedFields.includes(field.name)
          ? // $FlowFixMe
            { ...field, freeze: true }
          : { ...field, freeze: false },
      );

  // eslint-disable-next-line no-nested-ternary
  const unfreezedFields = descendant
    ? // eslint-disable-next-line no-nested-ternary
      descendant[descendantKey].unfreezedFields
      ? descendant[descendantKey].unfreezedFields[firstThingName] || []
      : []
    : [];

  const allFieldsUnfreezed = !unfreezedFields.length
    ? allFieldsFreezed
    : allFieldsFreezed.map((field) =>
        unfreezedFields.includes(field.name)
          ? // $FlowFixMe
            { ...field, freeze: false }
          : { ...field, freeze: true },
      );

  return allFieldsUnfreezed;
};

export default composeDescendantFields;
