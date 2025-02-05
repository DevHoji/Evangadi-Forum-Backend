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
  const { questionid, answer } = req.body; // Corrected to 'answer'
  const userid = req.user.userid;

  if (!questionid || !answer) {
    //Corrected to 'answer'
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ msg: "Please provide questionid and answer" });
  }

  try {
    await dbConnection.query(
      "INSERT INTO answer (questionid, userid, answer) VALUES (?, ?, ?)", // Corrected table name and answer column
      [questionid, userid, answer]
    );
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
