type WhichUpdatedKey =
  | 'updatedFields'
  | 'updatedFields_ne'
  | 'updatedFields_in'
  | 'updatedFields_nin';

export type WhichUpdated = Record<WhichUpdatedKey, string | [string]>;

const filterWithWhichUpdatedKey = (
  whichUpdatedKey: WhichUpdatedKey,
  updatedFields: string[],
  whichUpdated: WhichUpdated,
) => {
  switch (whichUpdatedKey) {
    case 'updatedFields':
      return updatedFields.includes(whichUpdated[whichUpdatedKey] as string);

    case 'updatedFields_ne':
      return !updatedFields.includes(whichUpdated[whichUpdatedKey] as string);

    case 'updatedFields_in':
      return updatedFields.some((str) => (whichUpdated[whichUpdatedKey] as string[]).includes(str));

    case 'updatedFields_nin':
      return updatedFields.every(
        (str) => !(whichUpdated[whichUpdatedKey] as string[]).includes(str),
      );
  }
};

const filterUpdatedFields = (
  updatedFields: string[],
  subscriptionUpdatedFields: string[],
  whichUpdated: Record<WhichUpdatedKey, string | [string]>,
): string[] => {
  const filteredFields = updatedFields.filter((str) => subscriptionUpdatedFields.includes(str));

  if (filteredFields.length === 0) {
    return filteredFields;
  }

  if (Object.keys(whichUpdated).length === 0) {
    return filteredFields;
  }

  const whichUpdatedKeys = Object.keys(whichUpdated) as WhichUpdatedKey[];

  return whichUpdatedKeys.every((whichUpdatedKey) =>
    filterWithWhichUpdatedKey(whichUpdatedKey, updatedFields, whichUpdated),
  )
    ? filteredFields
    : [];
};

export default filterUpdatedFields;
