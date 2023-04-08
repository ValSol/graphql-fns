import type {EmbeddedField, FileField, DerivativeAttributes, FlatField} from '../../tsTypes';

type AllFields = ReadonlyArray<FlatField | EmbeddedField | FileField>;

type Arg = {
  derivativeKey: string,
  derivative?: {
    readonly [derivativeKey: string]: DerivativeAttributes
  },
  fields: AllFields,
  firstThingName: string,
  fieldType: string
};

const composeDerivativeFields = (
  {
    derivativeKey,
    derivative,
    fields,
    firstThingName,
    fieldType,
  }: Arg,
): AllFields => {
  if (!derivativeKey) return fields;

  const fieldNames = fields.map(({ name }) => name);

  const filteredFields = fields.filter(({ name }) => {
    // eslint-disable-next-line no-nested-ternary
    const excludeFields = derivative
      ? derivative[derivativeKey].excludeFields
        ? derivative[derivativeKey].excludeFields[firstThingName] || []
        : []
      : [];

    // eslint-disable-next-line no-nested-ternary
    const includeFields = derivative
      ? derivative[derivativeKey].includeFields
        ? derivative[derivativeKey].includeFields[firstThingName] || fieldNames
        : fieldNames
      : [];

    return !excludeFields.includes(name) && includeFields.includes(name);
  });

  // eslint-disable-next-line no-nested-ternary
  const addFields = derivative
    ? // eslint-disable-next-line no-nested-ternary
      derivative[derivativeKey].addFields
      ? derivative[derivativeKey].addFields[firstThingName]
        ? derivative[derivativeKey].addFields[firstThingName][fieldType] || []
        : []
      : []
    : [];

  const allFields = [...filteredFields, ...addFields];

  // eslint-disable-next-line no-nested-ternary
  const freezedFields = derivative
    ? // eslint-disable-next-line no-nested-ternary
      derivative[derivativeKey].freezedFields
      ? derivative[derivativeKey].freezedFields[firstThingName] || []
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
      derivative[derivativeKey].unfreezedFields
      ? derivative[derivativeKey].unfreezedFields[firstThingName] || []
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
