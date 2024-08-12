import mongoose from 'mongoose';

export default async function () {
  (mongoose.connection as any).close(() => {
    process.exit(0);
  });
}
