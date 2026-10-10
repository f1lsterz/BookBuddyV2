/** @param {import('mongodb').Db} db */
module.exports.up = async (db) => {
  await db
    .collection("domain_event_outbox")
    .createIndex({ status: 1, nextRetryAt: 1, createdAt: 1 });
};

/** @param {import('mongodb').Db} db */
module.exports.down = async (db) => {
  await db.collection("domain_event_outbox").dropIndex("status_1_nextRetryAt_1_createdAt_1");
};
