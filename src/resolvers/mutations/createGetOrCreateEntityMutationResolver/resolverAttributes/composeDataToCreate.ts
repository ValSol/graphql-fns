import type { EntityConfig, GraphqlObject } from '@/tsTypes';

type FieldKind = { pointer: boolean; array: boolean; dateTime: boolean };

const getFieldKind = (fieldName: string, entityConfig: EntityConfig): null | FieldKind => {
  const { dateTimeFields = [], floatFields = [], intFields = [], textFields = [] } = entityConfig;

  if (entityConfig.type === 'tangible') {
    const { duplexFields = [], relationalFields = [] } = entityConfig;

    const pointerField = [...duplexFields, ...relationalFields].find(
      ({ name }) => name === fieldName,
    );

    if (pointerField) {
      return { pointer: true, array: Boolean(pointerField.array), dateTime: false };
    }
  }

  const dateTimeField = dateTimeFields.find(({ name }) => name === fieldName);

  if (dateTimeField) {
    return { pointer: false, array: Boolean(dateTimeField.array), dateTime: true };
  }

  const scalarField = [...textFields, ...intFields, ...floatFields].find(
    ({ name }) => name === fieldName,
  );

  return scalarField
    ? { pointer: false, array: Boolean(scalarField.array), dateTime: false }
    : null;
};

const isNil = (value: any) => value === undefined || value === null;

const isSameValue = (a: any, b: any, dateTime: boolean) =>
  dateTime ? new Date(a).getTime() === new Date(b).getTime() : String(a) === String(b);

// "value" from "whereOne" / "whereCompoundOne" is compatible with "dataValue" (or "dataValue" is...
// ... not set) & return value to save in the created entity, or throw error on conflict
const mergeValue = (
  fieldName: string,
  value: any,
  dataValue: any,
  kind: FieldKind,
  argName: string,
) => {
  const throwConflict = () => {
    throw new TypeError(
      `Value of field "${fieldName}" in "data" arg conflicts with "${argName}" arg: ${JSON.stringify(
        value,
      )}!`,
    );
  };

  if (value === null) {
    if (!isNil(dataValue)) throwConflict();

    return dataValue;
  }

  if (kind.pointer) {
    if (isNil(dataValue)) {
      return { connect: kind.array ? [value] : value };
    }

    const { connect, create } = dataValue;

    if (kind.array) {
      if (!Array.isArray(connect) || !connect.some((id) => String(id) === String(value))) {
        throwConflict();
      }
    } else if (create || isNil(connect) || String(connect) !== String(value)) {
      throwConflict();
    }

    return dataValue;
  }

  if (isNil(dataValue)) {
    return kind.array ? [value] : value;
  }

  if (kind.array) {
    if (
      !Array.isArray(dataValue) ||
      !dataValue.some((item) => isSameValue(item, value, kind.dateTime))
    ) {
      throwConflict();
    }
  } else if (!isSameValue(dataValue, value, kind.dateTime)) {
    throwConflict();
  }

  return dataValue;
};

// add to "data" of the created entity values of "whereOne" / "whereCompoundOne" fields, so the...
// ... created entity is found by the same args next time ("id" is not transferred)
const composeDataToCreate = (args: GraphqlObject, entityConfig: EntityConfig): GraphqlObject => {
  const { data = {}, whereOne, whereCompoundOne } = args as Record<string, any>;

  const argName = whereOne ? 'whereOne' : 'whereCompoundOne';
  const where: Record<string, any> = whereOne || whereCompoundOne || {};

  const result = { ...data };

  Object.keys(where).forEach((key) => {
    if (key === 'id') return;

    const kind = getFieldKind(key, entityConfig);

    if (!kind) {
      throw new TypeError(
        `Not found field "${key}" of "${argName}" arg in "${entityConfig.name}"!`,
      );
    }

    const value = mergeValue(key, where[key], result[key], kind, argName);

    if (!isNil(value)) {
      result[key] = value;
    }
  });

  return result;
};

export default composeDataToCreate;
