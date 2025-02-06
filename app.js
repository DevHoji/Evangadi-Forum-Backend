require("dotenv").config();
const express = require("express");
const cors = require("cors");
const dbConnection = require("./db/dbConfig");

// Import routes
const userRoute = require("./routes/userRoute");
const questionRoute = require("./routes/questionRoute");
const answerRoute = require("./routes/answerRoute");

// Import middleware
const authMiddleware = require("./middleware/authMiddleware");

// Initialize the Express app
const app = express();
const port = process.env.PORT || 5500;

// Socket.IO setup
const http = require("http"); // Import http module
const { Server } = require("socket.io"); //Import socket io

// Create an HTTP server using Express app
const server = http.createServer(app);
const io = new Server(server, {
  // Pass the HTTP server to Socket.IO
  cors: {
    origin: "*", // VERY permissive - configure this properly in production!
    methods: ["GET", "POST"],
  },
});

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/users", userRoute);
app.use("/api/questions", authMiddleware, questionRoute);
app.use("/api/answers", authMiddleware, answerRoute);

// Socket.IO event handling
io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });

  // Add other socket event listeners here (e.g., new question, new answer)
});

// Function to emit a new question event
function emitNewQuestion(question) {
  io.emit("newQuestion", question); // Broadcast to all connected clients
}

// Function to emit a new answer event
function emitNewAnswer(answer) {
  io.emit("newAnswer", answer); // Broadcast to all connected clients
}

// Make emit functions globally available (or export them)
app.set("socketio", io); // Make io object accessible in routes
app.set("emitNewQuestion", emitNewQuestion);
app.set("emitNewAnswer", emitNewAnswer);

// Database connection check and server start
async function startServer() {
  try {
    await dbConnection.execute("SELECT 'test' AS TestQuery");
    console.log("Database connection established");

    // Start the HTTP server (instead of just the Express app)
    server.listen(port, () => {
      console.log(`Server is running on http://localhost:${port}`);
    });
  } catch (error) {
    console.error("Failed to connect to the database:", error.message);
    process.exit(1);
  }
}

startServer();
