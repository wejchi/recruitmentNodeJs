const { rm } = require("fs/promises");
const { faker } = require("@faker-js/faker");
const { makeQuestionRepository } = require("./question");
const { NotFoundError } = require("../errors/notFoundError");
const { writeFileSync } = require("fs");

describe("question repository", () => {
  const TEST_QUESTIONS_FILE_PATH = "test-questions.json";
  let questionRepo;

  beforeAll(async () => {
    questionRepo = makeQuestionRepository(TEST_QUESTIONS_FILE_PATH);
  });

  afterAll(async () => {
    await rm(TEST_QUESTIONS_FILE_PATH);
  });

  test("should return a list of 0 questions", async () => {
    writeFileSync(TEST_QUESTIONS_FILE_PATH, JSON.stringify([]));
    expect(await questionRepo.getQuestions()).toHaveLength(0);
  });

  test("should return a list of 2 questions", async () => {
    const testQuestions = [
      {
        id: faker.datatype.uuid(),
        summary: "What is my name?",
        author: "Jack London",
        answers: []
      },
      {
        id: faker.datatype.uuid(),
        summary: "Who are you?",
        author: "Tim Doods",
        answers: []
      }
    ];

    writeFileSync(TEST_QUESTIONS_FILE_PATH, JSON.stringify(testQuestions));

    expect(await questionRepo.getQuestions()).toHaveLength(2);
  });

  test("should return question by id", async () => {
    const testQuestions = [
      {
        id: faker.datatype.uuid(),
        summary: "What is my name?",
        author: "Jack London",
        answers: []
      },
      {
        id: faker.datatype.uuid(),
        summary: "Who are you?",
        author: "Tim Doods",
        answers: []
      }
    ];

    await writeFileSync(
      TEST_QUESTIONS_FILE_PATH,
      JSON.stringify(testQuestions)
    );
    const question = await questionRepo.getQuestionById(testQuestions[0].id);
    expect(question.summary).toEqual(testQuestions[0].summary);
    expect(question.author).toEqual(testQuestions[0].author);
    expect(question.answers).toEqual(testQuestions[0].answers);
  });

  test("should throw error because question with specified id doesn't exists", async () => {
    const testQuestions = [
      {
        id: faker.datatype.uuid(),
        summary: "What is my name?",
        author: "Jack London",
        answers: []
      },
      {
        id: faker.datatype.uuid(),
        summary: "Who are you?",
        author: "Tim Doods",
        answers: []
      }
    ];

    await writeFileSync(
      TEST_QUESTIONS_FILE_PATH,
      JSON.stringify(testQuestions)
    );
    expect(async () => {
      await questionRepo.getQuestionById(faker.datatype.uuid());
    }).rejects.toThrow(NotFoundError);
  });

  test("should add new question", async () => {
    const testQuestions = [
      {
        id: faker.datatype.uuid(),
        summary: "What is my name?",
        author: "Jack London",
        answers: []
      },
      {
        id: faker.datatype.uuid(),
        summary: "Who are you?",
        author: "Tim Doods",
        answers: []
      }
    ];
    writeFileSync(TEST_QUESTIONS_FILE_PATH, JSON.stringify(testQuestions));
    const questionCommand = {
      author: faker.name.firstName(),
      summary: faker.random.words(10)
    };
    const previousQuestions = await questionRepo.getQuestions();
    const question = await questionRepo.addQuestion(questionCommand);

    expect(question.id).toBeDefined();
    expect(question.answers).toEqual([]);
    expect(
      previousQuestions.find((q) => q.id == question.id)
    ).not.toBeDefined();

    const newQuestions = await questionRepo.getQuestions();
    expect(newQuestions.find((q) => q.id == question.id)).toMatchObject(
      question
    );
  });

  test("should return answers to question", async () => {
    const testQuestions = [
      {
        id: faker.datatype.uuid(),
        summary: "What is my name?",
        author: "Jack London",
        answers: [
          {
            id: faker.datatype.uuid(),
            author: "Brian McKenzie",
            summary: "Jack"
          },
          {
            id: faker.datatype.uuid(),
            author: "Dr Strange",
            summary: "John"
          }
        ]
      },
      {
        id: faker.datatype.uuid(),
        summary: "Who are you?",
        author: "Tim Doods",
        answers: []
      }
    ];
    writeFileSync(TEST_QUESTIONS_FILE_PATH, JSON.stringify(testQuestions));

    expect(await questionRepo.getAnswers(testQuestions[0].id)).toEqual(
      testQuestions[0].answers
    );
    expect(await questionRepo.getAnswers(testQuestions[1].id)).toEqual([]);
  });

  test("should return answer", async () => {
    const testQuestions = [
      {
        id: faker.datatype.uuid(),
        summary: "What is my name?",
        author: "Jack London",
        answers: [
          {
            id: faker.datatype.uuid(),
            author: "Brian McKenzie",
            summary: "Jack"
          },
          {
            id: faker.datatype.uuid(),
            author: "Dr Strange",
            summary: "John"
          }
        ]
      },
      {
        id: faker.datatype.uuid(),
        summary: "Who are you?",
        author: "Tim Doods",
        answers: []
      }
    ];
    writeFileSync(TEST_QUESTIONS_FILE_PATH, JSON.stringify(testQuestions));
    expect(
      await questionRepo.getAnswer(
        testQuestions[0].id,
        testQuestions[0].answers[1].id
      )
    ).toEqual(testQuestions[0].answers[1]);

    expect(async () => {
      await questionRepo.getAnswer(testQuestions[0].id, faker.datatype.uuid());
    }).rejects.toThrow(NotFoundError);

    expect(async () => {
      await questionRepo.getAnswer(
        faker.datatype.uuid(),
        testQuestions[0].answers[1].id
      );
    }).rejects.toThrow(NotFoundError);
  });

  test("should add new answer", async () => {
    const testQuestions = [
      {
        id: faker.datatype.uuid(),
        summary: "What is my name?",
        author: "Jack London",
        answers: [
          {
            id: faker.datatype.uuid(),
            author: "Brian McKenzie",
            summary: "Jack"
          },
          {
            id: faker.datatype.uuid(),
            author: "Dr Strange",
            summary: "John"
          }
        ]
      },
      {
        id: faker.datatype.uuid(),
        summary: "Who are you?",
        author: "Tim Doods",
        answers: []
      }
    ];
    writeFileSync(TEST_QUESTIONS_FILE_PATH, JSON.stringify(testQuestions));

    const answerCommand = {
      author: "Andrew",
      summary: "Michael"
    };
    const newAnswer = await questionRepo.addAnswer(
      testQuestions[0].id,
      answerCommand
    );
    expect(newAnswer.id).toBeDefined();
    expect(newAnswer).toMatchObject(answerCommand);
    expect(
      await questionRepo.getAnswer(testQuestions[0].id, newAnswer.id)
    ).toEqual(newAnswer);
    expect(await questionRepo.getAnswers(testQuestions[0].id)).toHaveLength(3);
  });
});
