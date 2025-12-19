import dotenv from "dotenv";
import connectDB from "./db/db.js";
import { app } from "./app.js";
dotenv.config({
  path: './.env'
})

connectDB().then(() => {
  app.on('error', (error) => {
    console.error("App error:", error)
  })

  app.listen(process.env.PORT, ()=>{
    console.log("Server is running on PORT:", process.env.PORT)
  })
}).catch((err)=>{
  console.log(err);
  throw err;
})

/* 
const app = express();

(async () => {
  try {
    await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to MongoDB");

    app.on("error", (error) => {
      console.error("App Error:", error);
      throw error;
    });

    app.listen(process.env.PORT, () => {
      console.log(`App is running on port ${process.env.PORT}`);
    });
  } catch (error) {
    console.error("MongoDB Connection Error:", error);
    throw error;
  }
})();
*/
