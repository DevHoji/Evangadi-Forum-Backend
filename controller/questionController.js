const dbConnection = require("../db/dbConfig");
const { StatusCodes } = require("http-status-codes");
const { v4: uuidv4 } = require("uuid"); // Import UUID generator

async function getAllQuestions(req, res) {
  try {
    const [questions] = await dbConnection.query(
      `SELECT questions.id, questions.questionid, questions.title, questions.userid, users.username
       FROM questions
       JOIN users ON questions.userid = users.userid
       ORDER BY questions.id DESC`
    );
    return res.status(StatusCodes.OK).json({ questions });
  } catch (error) {
    console.error(error);
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ msg: "Failed to fetch questions", error: error.message });
  }
}

async function getQuestionById(req, res) {
  const { id } = req.params; // Get the *id* from the URL parameters (not questionid)

  try {
    const [question] = await dbConnection.query(
      "SELECT id, questionid, title, description, userid, tag FROM questions WHERE id = ?", // Use id in the query
      [id]
    );

    if (question.length === 0) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ msg: `No question found with id: ${id}` });
    }

    return res.status(StatusCodes.OK).json({ question: question[0] }); // Return the first (and only) question
  } catch (error) {
    console.error(error);
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ msg: "Failed to fetch question", error: error.message });
  }
}

async function createQuestion(req, res) {
  const { title, description, tag } = req.body;
  const userid = req.user.userid; // Get the user ID from the authenticated user
  const questionid = uuidv4(); // Generate a unique questionid

  if (!title || !description) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ msg: "Please provide title and description" });
  }

  try {
    await dbConnection.query(
      "INSERT INTO questions (questionid, userid, title, description, tag) VALUES (?, ?, ?, ?, ?)", // Include questionid in the insert
      [questionid, userid, title, description, tag]
    );
    return res
      .status(StatusCodes.CREATED)
      .json({ msg: "Question created successfully" });
  } catch (error) {
    console.error(error);
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ msg: "Failed to create question", error: error.message });
  }
}

module.exports = { getAllQuestions, getQuestionById, createQuestion };
