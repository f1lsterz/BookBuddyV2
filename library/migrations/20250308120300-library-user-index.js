/** @param {import('mongodb').Db} db */
module.exports.up = async (db) => {
  await db.collection("libraries").createIndex({ userId: 1 });
};

/** @param {import('mongodb').Db} db */
module.exports.down = async (db) => {
  await db.collection("libraries").dropIndex("userId_1");
};
