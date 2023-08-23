import mongoose from 'mongoose';

export default async function () {
  mongoose.connection.close(() => {
    process.exit(0);
  });
}
