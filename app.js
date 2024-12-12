// Express
import express from "express";
const app = express();

// Morgan
import morgan from "morgan";

// Cors
import cors from "cors";
//Setting up cors
app.use(cors());

// Serve static from public folder
app.use(express.static("public"));

// Express async errors
import "express-async-errors";

// Error handler
import { errorHandler } from "./middleware/errorHandler.js";

// dotenv
import dotenv from "dotenv";
dotenv.config();

// Model import
import cookieParser from "cookie-parser";

// Cookie parse
app.use(cookieParser());

// Parse json
app.use(express.json());

// Morgan
app.use(morgan("dev"));

// Middleware import

// Routes import
import userRoute from "./routes/user.js";
import sidangRoute from "./routes/sidang.js";
import koordinatorRoute from "./routes/koordinator.js";
import dosenRoute from "./routes/dosen.js";
import mahasiswaRoute from "./routes/mahasiswa.js";

// Routes
app.use("/api", userRoute);
app.use("/api/sidang", sidangRoute);
app.use("/api/koordinator", koordinatorRoute);
app.use("/api/dosen", dosenRoute);
app.use("/api/mahasiswa", mahasiswaRoute);

//Error handling
app.use(errorHandler);

// Run the server
const PORT = 5000;
const HOST = "0.0.0.0";
app.listen(PORT, HOST, async () => {
  try {
    console.log(`Server is running on port ${PORT}`);
  } catch (err) {
    console.log("Failed");
  }
});
