import mongoose, { Connection } from 'mongoose';

const { Schema } = mongoose;

let counterSchema = null;

const createCounter = (mongooseConn: Connection): any => {
  if (!counterSchema) {
    const schemaProperties = {
      _id: { type: String, required: true },
      seq: { type: Number, default: 0 },
    } as const;

    counterSchema = new Schema(schemaProperties);

    // to work dynamic adding fields
    mongoose.model('Counter_Variable', counterSchema);
  }

  return mongooseConn.model('Counter_Variable', counterSchema);
};

export default createCounter;
