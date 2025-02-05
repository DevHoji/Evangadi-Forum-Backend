const express = require("express");
const router = express.Router();

const {
  getAllQuestions,
  getQuestionById,
  createQuestion,
} = require("../controller/questionController");

//GET all questions
router.get("/", getAllQuestions);

//GET a single question by ID
router.get("/:id", getQuestionById);

//POST a new question
router.post("/", createQuestion);

module.exports = router;