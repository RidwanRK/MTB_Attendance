import mongoose from "mongoose";

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/attendance";

type MongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

declare global {
  var __mongooseCache: MongooseCache | undefined;
}

const cache: MongooseCache = global.__mongooseCache || { conn: null, promise: null };
global.__mongooseCache = cache;

export async function connectDB() {
  if (cache.conn) return cache.conn;
  if (!cache.promise) {
    cache.promise = mongoose.connect(MONGO_URI).then((m) => m);
  }
  cache.conn = await cache.promise;
  return cache.conn;
}
