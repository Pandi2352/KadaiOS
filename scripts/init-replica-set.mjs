// Turns a MongoDB started with replSetName into a working single-node replica set.
// Safe to run again. Usage: npm run db:init-replica -- [host:port] [replicaSetName]
import mongoose from 'mongoose';

const { MongoClient } = mongoose.mongo;
const host = process.argv[2] ?? 'localhost:27017';
const replicaSet = process.argv[3] ?? 'rs0';
const ALREADY_INITIALIZED = 23;
const NOT_STARTED_WITH_REPLICATION = 76;

const client = new MongoClient(`mongodb://${host}/?directConnection=true`, { serverSelectionTimeoutMS: 5000 });

try {
  await client.connect();
  const admin = client.db('admin');

  try {
    await admin.command({ replSetInitiate: { _id: replicaSet, members: [{ _id: 0, host }] } });
    console.log(`Initiated replica set "${replicaSet}" on ${host}.`);
  } catch (error) {
    if (error.code === NOT_STARTED_WITH_REPLICATION) {
      console.error(`MongoDB on ${host} was not started with a replica set name. Run the setup script first.`);
      process.exitCode = 1;
    } else if (error.code === ALREADY_INITIALIZED) {
      console.log(`Replica set on ${host} was already set up.`);
    } else {
      throw error;
    }
  }

  if (!process.exitCode) {
    for (let attempt = 0; attempt < 30; attempt += 1) {
      const { isWritablePrimary, setName } = await admin.command({ hello: 1 });
      if (isWritablePrimary) {
        console.log(`Ready: ${host} is the primary of "${setName}".`);
        break;
      }
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }
} finally {
  await client.close();
}
