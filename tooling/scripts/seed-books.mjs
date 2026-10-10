import mongoose from "mongoose";

const uri = process.env.DATABASE_URL ?? "mongodb://localhost:27020/bookbuddy-book";

const books = [
  {
    title: "The Name of the Wind",
    author: "Patrick Rothfuss",
    genres: ["Fantasy"],
    description:
      "A gifted young man grows into the most notorious magician his world has ever seen.",
    pageCount: 662,
    averageRating: 0,
    commentCount: 0,
  },
  {
    title: "Project Hail Mary",
    author: "Andy Weir",
    genres: ["Science Fiction"],
    description: "A lone astronaut must save humanity from disaster.",
    pageCount: 496,
    averageRating: 0,
    commentCount: 0,
  },
  {
    title: "1984",
    author: "George Orwell",
    genres: ["Dystopia", "Classic"],
    description: "A chilling vision of totalitarian society.",
    pageCount: 328,
    averageRating: 0,
    commentCount: 0,
  },
];

async function main() {
  await mongoose.connect(uri);
  const db = mongoose.connection.db;
  const collection = db.collection("books");
  const count = await collection.countDocuments();
  if (count > 0) {
    console.log(`books collection already has ${count} document(s); skip seed`);
    await mongoose.disconnect();
    return;
  }
  await collection.insertMany(books);
  console.log(`Inserted ${books.length} books`);
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
