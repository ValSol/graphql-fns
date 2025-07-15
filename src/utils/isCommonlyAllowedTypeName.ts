const regex = /^[_A-Za-z][_0-9A-Za-z]*$/;

const isCommonlyAllowedTypeName = (name: string) => regex.test(name);

export default isCommonlyAllowedTypeName;
