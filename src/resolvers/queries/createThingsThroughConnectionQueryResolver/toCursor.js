// @flow

const toCursor = (_id: string, shift: number): string => btoa(`${_id}:${shift}`);

export default toCursor;
