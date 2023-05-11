const express = require("express");
const { urlencoded, json } = require("body-parser");
const { NotFoundError } = require("./notFoundError");
const makeRepositories = require("./middleware/repositories");
const { checkSchema, validationResult } = require("express-validator");

const STORAGE_FILE_PATH = "questions.json";
const PORT = 3000;

const app = express();

app.use(urlencoded({ extended: true }));
app.use(json());
app.use(makeRepositories(STORAGE_FILE_PATH));

app.get("/", (_, res) => {
  res.json({ message: "Welcome to responder!" });
});

app.get("/questions", async (req, res) => {
  const questions = await req.repositories.questionRepo.getQuestions();
  res.json(questions);
});

app.get("/questions/:questionId", async (req, res) => {
  try {
    const question = await req.repositories.questionRepo.getQuestionById(
      req.params.questionId
    );
    res.json(question);
  } catch (error) {
    handleError(error, res);
  }
});

app.post(
  "/questions",
  checkSchema({
    author: { notEmpty: true },
    summary: { notEmpty: true }
  }),
  async (req, res) => {
    const result = validationResult(req);
    if (!result.isEmpty()) {
      return res.json({ errors: result.array() });
    }

    try {
      const question = await req.repositories.questionRepo.addQuestion(
        req.body
      );
      res.json({
        id: question.id,
        author: question.author,
        summary: question.summary
      });
    } catch (error) {
      handleError(error, res);
    }
  }
);

app.get("/questions/:questionId/answers", async (req, res) => {
  try {
    res.json(
      await req.repositories.questionRepo.getAnswers(req.params.questionId)
    );
  } catch (error) {
    handleError(error, res);
  }
});

app.post(
  "/questions/:questionId/answers",
  checkSchema({
    author: { notEmpty: true },
    summary: { notEmpty: true }
  }),
  async (req, res) => {
    const result = validationResult(req);
    if (!result.isEmpty()) {
      return res.json({ errors: result.array() });
    }

    try {
      const answer = await req.repositories.questionRepo.addAnswer(
        req.params.questionId,
        req.body
      );
      res.json(answer);
    } catch (error) {
      handleError(error, res);
    }
  }
);

app.get("/questions/:questionId/answers/:answerId", async (req, res) => {
  try {
    const answer = await req.repositories.questionRepo.getAnswer(
      req.params.questionId,
      req.params.answerId
    );
    res.json(answer);
  } catch (error) {
    handleError(error, res);
  }
});

function handleError(error, res) {
  if (error instanceof NotFoundError) {
    return res.status(404).json({ error: error.message });
  } else {
    return res.sendStatus(500);
  }
}

app.listen(PORT, () => {
  console.log(`Responder app listening on port ${PORT}`);
});
