const { readFile } = require("fs/promises");
const { v4: uuidv4 } = require("uuid");
const { NotFoundError } = require("../errors/notFoundError");
const { writeFileSync } = require("fs");

const makeQuestionRepository = (fileName) => {
  const getQuestions = async () => {
    const fileContent = await readFile(fileName, { encoding: "utf-8" });
    const questions = JSON.parse(fileContent);
    return questions;
  };

  const getQuestionById = async (questionId) => {
    const questions = await getQuestions();
    return findQuestionById(questions, questionId);
  };

  const addQuestion = async (question) => {
    const questions = await getQuestions();
    const newQuestion = {
      id: uuidv4(),
      author: question.author,
      summary: question.summary,
      answers: []
    };
    questions.push(newQuestion);
    await saveQuestions(questions);
    return newQuestion;
  };

  const getAnswers = async (questionId) => {
    const question = await getQuestionById(questionId);
    return question.answers;
  };

  const getAnswer = async (questionId, answerId) => {
    const answers = await getAnswers(questionId);
    const answer = await answers.find((answer) => answer.id === answerId);
    if (!answer) {
      throw new NotFoundError("answer not found");
    }
    return answer;
  };

  const addAnswer = async (questionId, answer) => {
    const questions = await getQuestions();
    const question = findQuestionById(questions, questionId);
    const newAnswer = {
      id: uuidv4(),
      author: answer.author,
      summary: answer.summary
    };
    question.answers.push(newAnswer);
    await saveQuestions(questions);
    return newAnswer;
  };

  const findQuestionById = (questions, questionId) => {
    const question = questions.find((question) => question.id === questionId);
    if (!question) {
      throw new NotFoundError("question not found");
    }
    return question;
  };

  const saveQuestions = async (questions) => {
    await writeFileSync(fileName, JSON.stringify(questions)); // I encountered several errors with reading file when using the asynchronous version so I decided to use synchronous.
  };

  return {
    getQuestions,
    getQuestionById,
    addQuestion,
    getAnswers,
    getAnswer,
    addAnswer
  };
};

module.exports = { makeQuestionRepository };
