// @flow
import mongoose from 'mongoose';

import type { ThingConfig } from '../flowTypes';

const { Schema } = mongoose;

const fileSchemas = {};

const createFileSchema = (thingConfig: ThingConfig): Object => {
  const { name } = thingConfig;

  if (fileSchemas[name]) return fileSchemas[name];

  const fileSchemaProperties = {
    filename: String,
    mimetype: String,
    encoding: String,
    uploadedAt: Date,
    hash: { type: String, unique: true },
  };

  const FileSchema = new Schema(fileSchemaProperties, { timestamps: true });

  // to work dynamic adding fields
  mongoose.model(`${name}_File`, FileSchema);

  // to supplement cache
  fileSchemas[name] = FileSchema;

  return FileSchema;
};

export default createFileSchema;
