// kinds of fields that can be used in "uniqueCompoundIndexes" and "XWhereCompoundOneInput"
// (relational fields only not "parent")
const compoundIndexFieldKinds = [
  'textFields',
  'intFields',
  'floatFields',
  'dateTimeFields',
  'relationalFields',
  'duplexFields',
];

export default compoundIndexFieldKinds;
