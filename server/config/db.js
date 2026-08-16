import mongoose from "mongoose";

// Production runs against a standalone MongoDB instance on the VPS (no
// replica set), while local/pre-launch development points at an Atlas
// cluster (which is always a replica set). Multi-document transactions
// and sessions — mongoose.startSession(), session.withTransaction(),
// passing { session } to a query, and the native driver's
// returnDocument: "after" option — all require a replica set (or mongos)
// and fail outright on a standalone server ("Transaction numbers are
// only allowed on a replica set member or mongos"). Never introduce
// those here; every write in this codebase is a single-document
// operation (Model.create/save/findOneAndUpdate/deleteOne, etc.), which
// works identically on both topologies without any of the above.
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
