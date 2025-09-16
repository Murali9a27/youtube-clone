import mongoose from "mongoose";
import express from "express";
import { DB_NAME } from "./constants.js";
import dotenv from "dotenv";
dotenv.config();

 
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
