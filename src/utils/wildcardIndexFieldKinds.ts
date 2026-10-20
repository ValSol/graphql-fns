// kinds of fields that can have "wildcardIndex" (relational fields only not "parent")
const wildcardIndexFieldKinds = [
  'textFields',
  'intFields',
  'floatFields',
  'dateTimeFields',
  'booleanFields',
  'enumFields',
  'relationalFields',
  'duplexFields',
];

export default wildcardIndexFieldKinds;
