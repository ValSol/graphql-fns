const toGlobalId = (id: string, entityName: string, descendantKey: string = ''): string =>
  Buffer.from(`${id}:${entityName}:${descendantKey}`, 'binary').toString('base64');

export default toGlobalId;
