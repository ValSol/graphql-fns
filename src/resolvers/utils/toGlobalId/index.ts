const toGlobalId = (id: string, entityName: string, representationKey = ''): string =>
  Buffer.from(`${id}:${entityName}:${representationKey}`, 'binary').toString('base64');

export default toGlobalId;
