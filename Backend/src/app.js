import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";


const app = express();

// ✅ CORS MUST be before routes
app.use(cors({
  origin: "http://localhost:5173",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true
}));



app.use(express.json({limit: "16kb"}));
app.use(express.urlencoded({extended: true, limit: "16kb"}));
app.use(express.static("public"));
app.use(cookieParser())

//routes

import userRoutes from './routes/user.routes.js';
import playlistsRoutes from './routes/playlist.routes.js';
import watchHistoryRoutes from "./routes/watchHistory.routes.js";
import errorHandler from "./middlewares/error.middleware.js";



//routes decleration

app.use("/users", userRoutes)
app.use("/history", watchHistoryRoutes);
app.use("/playlists", playlistsRoutes);


app.use(errorHandler)
export {app} 