const composeDescendantConfigName = (
  name: string,
  descendantKey: string,
  slicePosition?: number,
): string =>
  typeof slicePosition === 'number'
    ? `${name.slice(0, slicePosition)}${descendantKey}${name.slice(slicePosition)}`
    : `${name}${descendantKey}`;

export default composeDescendantConfigName;
