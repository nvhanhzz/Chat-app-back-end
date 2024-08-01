import express, { Application } from "express";
import cors from "cors";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import * as database from "./config/database";
// import route from "./api/v1/routes/index.route";

// Load environment variables from .env file
dotenv.config();

const app: Application = express();
const port: number | string = parseInt(process.env.PORT as string, 10) || 3456;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(cookieParser());

database.connect();
// route(app);

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});