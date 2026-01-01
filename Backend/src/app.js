import express from "express";
import cors from "cors"
import cookieParser from "cookie-parser";

const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials:true
}))


app.use(express.json({limit: "16kb"}));
app.use(express.urlencoded({extended: true, limit: "16kb"}));
app.use(express.static("public"));
app.use(cookieParser())

//routes

import userRoutes from './routes/user.routes.js';
import playlistsRoutes from './routes/playlist.routes.js';
import watchHistoryRoutes from "./routes/watchHistory.routes.js";



//routes decleration

app.use("/users", userRoutes)
app.use("/history", watchHistoryRoutes);
app.use("/playlists", playlistsRoutes);
export {app} 