const dbConnection = require("../db/dbConfig");
const { StatusCodes } = require("http-status-codes");

async function getAnswersByQuestionId(req, res) {
  const { questionid } = req.params;

  try {
    const [answers] = await dbConnection.query(
      `SELECT answer.answerid, answer.answer, answer.userid, answer.questionid, users.username
       FROM answer
       JOIN users ON answer.userid = users.userid
       WHERE answer.questionid = ?
       ORDER BY answer.answerid ASC`,
      [questionid]
    );

    return res.status(StatusCodes.OK).json({ answers });
  } catch (error) {
    console.error(error);
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ msg: "Failed to fetch answers", error: error.message });
  }
}

async function createAnswer(req, res) {
  const { questionid, answer } = req.body;
  const userid = req.user.userid;

  if (!questionid || !answer) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ msg: "Please provide questionid and answer" });
  }

  try {
    await dbConnection.query(
      "INSERT INTO answer (questionid, userid, answer) VALUES (?, ?, ?)",
      [questionid, userid, answer]
    );

    // Get the newly created answer
    const [newAnswer] = await dbConnection.query(
      `SELECT answer.answerid, answer.answer, answer.userid, answer.questionid, users.username
       FROM answer
       JOIN users ON answer.userid = users.userid
       WHERE answer.questionid = ? AND answer.userid = ? AND answer.answer = ?
       ORDER BY answer.answerid DESC
       LIMIT 1`, // Get the most recently created answer
      [questionid, userid, answer]
    );

    // Emit the 'newAnswer' event
    const emitNewAnswer = req.app.get("emitNewAnswer");
    emitNewAnswer(newAnswer[0]); // Send the new answer data

    return res
      .status(StatusCodes.CREATED)
      .json({ msg: "Answer created successfully" });
  } catch (error) {
    console.error(error);
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ msg: "Failed to create answer", error: error.message });
  }
}

module.exports = { getAnswersByQuestionId, createAnswer };
