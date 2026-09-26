import mongoose from 'mongoose';

export default function () {
  (mongoose.connection as any).close(() => {
    process.exit(0);
  });
}
