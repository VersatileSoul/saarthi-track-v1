require("dotenv").config({ quiet: true });
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const compression = require("compression");
const http = require("http");
const socketIo = require("socket.io");

const connectDB = require("./config/db");
const { initializeSocket } = require("./config/socket");

const app = express();
const server = http.createServer(app);

// Initiate Socket.io
const io = socketIo(server, {
  cors: {
    origin: process.env.SOCKET_IO_CORS_ORIGIN?.split(",") || [
      "http://localhost:3000",
      "http://localhost:5173",
    ],
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Initialize Socket.io handlers
initializeSocket(io);

// Middleware
app.use(helmet());
app.use(compression());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN?.split(",") || [
      "http://localhost:3000",
      "http://localhost:5173",
    ],
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/v1/auth", require("./routes/auth.routes"));

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: err.message });
});

// Connect to MongoDB
connectDB();

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`'Server running on port ${PORT}`);
  console.log(` Environment : ${process.env.NODE_ENV || "development"}`);
});
