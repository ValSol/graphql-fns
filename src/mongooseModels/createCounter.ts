import mongoose, { Connection } from 'mongoose';

const { Schema } = mongoose;

const CounterVariable = 'Counter_Variable';

let counterSchema = null;

const createCounter = (mongooseConn: Connection): any => {
  if (!counterSchema) {
    const schemaProperties = {
      _id: { type: String, required: true },
      seq: { type: Number, default: 0 },
    } as const;

    counterSchema = new Schema(schemaProperties);

    // to work dynamic adding fields
    mongoose.model(CounterVariable, counterSchema);
  }

  return mongooseConn.models[CounterVariable] || mongooseConn.model(CounterVariable, counterSchema);
};

export default createCounter;
