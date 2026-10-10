/** @param {import('mongodb').Db} db */
module.exports.up = async (db) => {
  await db.collection("chatmessages").createIndex({ clubId: 1, createdAt: -1 });
};

/** @param {import('mongodb').Db} db */
module.exports.down = async (db) => {
  await db.collection("chatmessages").dropIndex("clubId_1_createdAt_-1");
};
