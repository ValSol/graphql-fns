import mongoose from 'mongoose';

import syncModelIndexes from './syncModelIndexes';

const { Schema } = mongoose;

export const CounterVariable = 'Counter_Variable';

let counterSchema = null;

const createCounter = async (mongooseConn: any, force = false): Promise<any> => {
  if (!counterSchema) {
    const schemaProperties = {
      _id: { type: String, required: true },
      seq: { type: Number, default: 0 },
    } as const;

    // indexes are built only by "syncModelIndexes"
    counterSchema = new Schema(schemaProperties, { autoIndex: false });
  }

  const Counter =
    mongooseConn.models[CounterVariable] || mongooseConn.model(CounterVariable, counterSchema);

  await syncModelIndexes(mongooseConn, Counter, 'counters', force);

  return Counter;
};

export default createCounter;
