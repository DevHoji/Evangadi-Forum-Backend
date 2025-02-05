require("dotenv").config();
const express = require("express");
const cors = require("cors");
const dbConnection = require("./db/dbConfig"); // Import promise-based pool

// Import routes
const userRoute = require("./routes/userRoute");
const questionRoute = require("./routes/questionRoute");
const answerRoute = require("./routes/answerRoute")

// app.post("/api/users/question", (req,res)=>{
//   res.send("questions")
// })

// Import middleware
const authMiddleware = require("./middleware/authMiddleware");

// Initialize the Express app
const app = express();
const port = process.env.PORT || 5500; // Use environment variable for port, fallback to 5500

// Middleware
app.use(cors()); // Enable CORS
//json middleware  to extract data
app.use(express.json()); // Parse incoming JSON payloads

// Routes
app.use("/api/users", userRoute); // User routes
app.use("/api/questions", authMiddleware, questionRoute); // Question routes
app.use("/api/answers", authMiddleware, answerRoute);// Answer routes (Placeholder for future implementation)
// app.use("/api/answers", authMiddleware, answerRoute);

// Database connection check and server start
async function startServer() {
  try {
    // Test database connection
    await dbConnection.execute("SELECT 'test' AS TestQuery");
    console.log("Database connection established");

    // Start the server
    app.listen(port, () => {
      console.log(`Server is running on http://localhost:${port}`);
    });
  } catch (error) {
    console.error("Failed to connect to the database:", error.message);
    process.exit(1); // Exit the process if the database connection fails
  }
}

// Start the server
startServer();
