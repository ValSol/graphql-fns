// @flow
import mongoose from 'mongoose';

import type { EntityConfig } from '../flowTypes';

const { Schema } = mongoose;

const fileSchemas = {};

const createFileSchema = (entityConfig: EntityConfig): Object => {
  const { name } = entityConfig;

  if (fileSchemas[name]) return fileSchemas[name];

  const fileSchemaProperties = {
    filename: String,
    mimetype: String,
    encoding: String,
    uploadedAt: Date,
    hash: { type: String, unique: true },
  };

  const FileSchema = new Schema(fileSchemaProperties, { timestamps: true });
  FileSchema.index({ createdAt: 1 });
  FileSchema.index({ updatedAt: 1 });

  // to work dynamic adding fields
  mongoose.model(`${name}_File`, FileSchema);

  // to supplement cache
  fileSchemas[name] = FileSchema;

  return FileSchema;
};

export default createFileSchema;
