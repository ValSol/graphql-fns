// @flow

type Fields = { [key: string]: null | Fields };

/** Supporting recursive fuction to compose fields hierarchy
 * @arg {Object} fields - tree / subtree of fields hierarchy
 * @arg {Object[]} resultArray - array where each item is sting line of fields hierarchy
 * @arg {number} [shift=2] - shift of current lines of fields hierarchy
 */
const composeFields = (fields: Fields, resultArray = [], shift: number = 2) => {
  if (fields === null) return [];
  Object.keys(fields).reduce((prev, fieldName) => {
    const field = fields[fieldName];

    if (field === null) {
      prev.push(`${'  '.repeat(shift)}${fieldName}`);
    } else {
      // if field is Object
      prev.push(`${'  '.repeat(shift)}${fieldName} {`);
      composeFields(field, prev, shift + 1);
      prev.push(`${'  '.repeat(shift)}}`);
    }
    return prev;
  }, resultArray);
  return resultArray;
};

/** Compose graphql query | mutation string by specified parameters
 * @arg {string} queryName - name of query or mutation
 * @arg {Object} fields - tree of graphql fields hierarchy
 * @arg {Object} [options] - optional parameters of graphql query | mutation
 * @arg {Object[]} [options.args] - args in query | mutation
 * @arg {Object[]} [options.argsForDirectives] - args for directives in query | mutation
 * @arg {boolean} [options.isMutation] - true to compose mutation
 * @arg {string} [options.operationName] - operationName of query | mutation
 */

const composeGql = (
  queryName: string,
  fields: Fields,
  options: {
    args?: Array<{ name: string, type?: string, value?: string }>,
    argsForDirectives?: Array<{ name: string, type: string }>,
    isMutation?: boolean,
    operationName?: string,
  } = {},
) => {
  const isMutation = !!options.isMutation;
  const args = options.args ? options.args : [];
  const argsForDirectives = options.argsForDirectives ? options.argsForDirectives : [];
  const operationName = options.operationName
    ? options.operationName
    : `${queryName}${isMutation ? 'Mutation' : 'Query'}`;
  const argsString = [...args, ...argsForDirectives]
    .map(({ name, type }) => (type ? `$${name}: ${type}` : ''))
    .filter(Boolean)
    .join(', ');
  const argsStringWhithParentheses = argsString ? `(${argsString})` : '';
  const argsString2 = args
    .map(({ name, value }) => (value ? `${name}: ${value}` : `${name}: $${name}`))
    .join(', ');
  const argsString2WhithParentheses = argsString2 ? `(${argsString2})` : '';
  const fieldsString = composeFields(fields).join('\n');
  const fieldsString2 = fieldsString
    ? ` {
${fieldsString}
  }
`
    : '\n';
  return `
${isMutation ? 'mutation' : 'query'} ${operationName}${argsStringWhithParentheses} {
  ${queryName}${argsString2WhithParentheses}${fieldsString2}}
`;
};

module.exports = composeGql;
