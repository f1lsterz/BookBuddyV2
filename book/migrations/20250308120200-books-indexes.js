/** @param {import('mongodb').Db} db */
module.exports.up = async (db) => {
  const books = db.collection("books");
  await books.createIndex({ title: "text", author: "text" });
};

/** @param {import('mongodb').Db} db */
module.exports.down = async (db) => {
  await db.collection("books").dropIndex("title_text_author_text");
};
