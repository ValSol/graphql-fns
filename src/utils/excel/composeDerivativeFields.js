// @flow

import type { EmbeddedField, FileField, DerivativeAttributes, FlatField } from '../../flowTypes';

type AllFields = $ReadOnlyArray<FlatField | EmbeddedField | FileField>;

type Arg = {
  suffix: string,
  derivative?: { +[suffix: string]: DerivativeAttributes },
  fields: AllFields,
  firstThingName: string,
  fieldType: string,
};

const composeDerivativeFields = ({
  suffix,
  derivative,
  fields,
  firstThingName,
  fieldType,
}: Arg): AllFields => {
  if (!suffix) return fields;

  const fieldNames = fields.map(({ name }) => name);

  const filteredFields = fields.filter(({ name }) => {
    // eslint-disable-next-line no-nested-ternary
    const excludeFields = derivative
      ? derivative[suffix].excludeFields
        ? derivative[suffix].excludeFields[firstThingName] || []
        : []
      : [];

    // eslint-disable-next-line no-nested-ternary
    const includeFields = derivative
      ? derivative[suffix].includeFields
        ? derivative[suffix].includeFields[firstThingName] || fieldNames
        : fieldNames
      : [];

    return !excludeFields.includes(name) && includeFields.includes(name);
  });

  // eslint-disable-next-line no-nested-ternary
  const addFields = derivative
    ? // eslint-disable-next-line no-nested-ternary
      derivative[suffix].addFields
      ? derivative[suffix].addFields[firstThingName]
        ? derivative[suffix].addFields[firstThingName][fieldType] || []
        : []
      : []
    : [];

  const allFields = [...filteredFields, ...addFields];

  // eslint-disable-next-line no-nested-ternary
  const freezedFields = derivative
    ? // eslint-disable-next-line no-nested-ternary
      derivative[suffix].freezedFields
      ? derivative[suffix].freezedFields[firstThingName] || []
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
  const unfreezedFields = derivative
    ? // eslint-disable-next-line no-nested-ternary
      derivative[suffix].unfreezedFields
      ? derivative[suffix].unfreezedFields[firstThingName] || []
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

export default composeDerivativeFields;
