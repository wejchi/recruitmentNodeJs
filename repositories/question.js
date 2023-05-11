const { readFile } = require("fs/promises");
const { v4: uuidv4 } = require("uuid");
const { writeFile } = require("fs/promises");

const makeQuestionRepository = (fileName) => {
  const getQuestions = async () => {
    const fileContent = await readFile(fileName, { encoding: "utf-8" });
    const questions = JSON.parse(fileContent);
    return questions;
  };

  const getQuestionById = async (questionId) => {
    const questions = await getQuestions;
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
    return question;
  };

  const getAnswers = async (questionId) => {
    const question = await getQuestionById(questionId);
    return question.answers;
  };

  const getAnswer = async (questionId, answerId) => {
    const answers = getAnswers(questionId);
    return answers.find((answer) => answer.id === answerId);
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
    return questions.find((question) => question.id === questionId);
  };

  const saveQuestions = async (questions) => {
    await writeFile(fileName, JSON.stringify(questions));
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
