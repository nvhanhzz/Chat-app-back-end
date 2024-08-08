import express, { Application } from "express";
import cors from "cors";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import http from 'http';
import { initSocket } from "./api/v1/socket/socket";
import * as database from "./config/database";
import clientRoutes from "./api/v1/routes/client/index.route";
import openSocket from "./api/v1/socket";

// Load environment variables from .env file
dotenv.config();

const app: Application = express();
const port: number | string = parseInt(process.env.PORT as string, 10) || 3456;
const origin: string = process.env.ORIGIN;

// Create HTTP server
const server = http.createServer(app);

// Initialize socket.io
initSocket(server);
openSocket();

// Middleware
app.use(cors({
    origin: origin,
    credentials: true
}));
app.use(bodyParser.json());
app.use(cookieParser());

// Connect to database
database.connect();

// Set up routes
clientRoutes(app);

// Start server
server.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});