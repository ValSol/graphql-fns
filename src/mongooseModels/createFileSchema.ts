import mongoose from 'mongoose';

import type { EntityConfig } from '../tsTypes';

const { Schema } = mongoose;

const fileSchemas: Record<string, any> = {};

const createFileSchema = (entityConfig: EntityConfig): any => {
  const { name } = entityConfig;

  if (fileSchemas[name]) return fileSchemas[name];

  const fileSchemaProperties = {
    filename: String,
    mimetype: String,
    encoding: String,
    uploadedAt: Date,
    hash: { type: String, unique: true },
  } as const;

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
