// "fieldName_ASC" → ["fieldName", 1], "id_DESC" → ["_id", -1]
const parseSortKey = (sortKey: string): [fieldName: string, direction: 1 | -1] => {
  const match = /^(.+)_(ASC|DESC)$/.exec(sortKey);

  if (!match) throw new TypeError(`Incorrect sort key: "${sortKey}"!`);

  const [, preFieldName, direction] = match;

  return [preFieldName === 'id' ? '_id' : preFieldName, direction === 'ASC' ? 1 : -1];
};

export default parseSortKey;
