const composeRepresentationConfigName = (
  name: string,
  representationKey: string,
  slicePosition?: number,
): string =>
  typeof slicePosition === 'number'
    ? `${name.slice(0, slicePosition)}${representationKey}${name.slice(slicePosition)}`
    : `${name}${representationKey}`;

export default composeRepresentationConfigName;
