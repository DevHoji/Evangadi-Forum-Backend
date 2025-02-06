const dbConnection = require("../db/dbConfig");
const { StatusCodes } = require("http-status-codes");
const { v4: uuidv4 } = require("uuid");

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
  const { id } = req.params;

  try {
    const [question] = await dbConnection.query(
      "SELECT id, questionid, title, description, userid, tag FROM questions WHERE id = ?",
      [id]
    );

    if (question.length === 0) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ msg: `No question found with id: ${id}` });
    }

    return res.status(StatusCodes.OK).json({ question: question[0] });
  } catch (error) {
    console.error(error);
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ msg: "Failed to fetch question", error: error.message });
  }
}

async function createQuestion(req, res) {
  const { title, description, tag } = req.body;
  const userid = req.user.userid;
  const questionid = uuidv4();

  if (!title || !description) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ msg: "Please provide title and description" });
  }

  try {
    await dbConnection.query(
      "INSERT INTO questions (questionid, userid, title, description, tag) VALUES (?, ?, ?, ?, ?)",
      [questionid, userid, title, description, tag]
    );

    // Get the newly created question
    const [newQuestion] = await dbConnection.query(
      "SELECT id, questionid, title, description, userid, tag FROM questions WHERE questionid = ?",
      [questionid]
    );

    // Emit the 'newQuestion' event
    const emitNewQuestion = req.app.get("emitNewQuestion"); //Get the emit function
    emitNewQuestion(newQuestion[0]); // Send the new question data

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
