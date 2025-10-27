import dotenv from "dotenv";
import app from "./app.js";
import connectDB from "./db/index.js";

dotenv.config({
  path: "./.env",
  //  debug: true ,
});

const PORT = process.env.PORT || 3000;

//this is also a good approach but
// app.listen(PORT, async () => {
//   try {
//     await connectDB();
//     console.log(`✅ Server is running on http://localhost:${PORT}`);
//   } catch (error) {
//     console.error("❌ Failed to connect to DBb", error);
//     process.exit(1);
//   }
// });

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`✅ Server is running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ Failed to connect to DBb", error);
  });
