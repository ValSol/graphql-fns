const toGlobalId = (id: string, entityName: string, derivativeKey: string = ''): string =>
  Buffer.from(`${id}:${entityName}:${derivativeKey}`, 'binary').toString('base64');

export default toGlobalId;
