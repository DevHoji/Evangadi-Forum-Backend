const express = require("express");
const router = express.Router();

const {
  getAnswersByQuestionId,
  createAnswer,
} = require("../controller/answerController");

//GET answers for a specific question
router.get("/:questionid", getAnswersByQuestionId);

//POST a new answer
router.post("/", createAnswer);

module.exports = router;
