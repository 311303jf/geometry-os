/**
 * Geometry OS
 * Question Quality Gate v0.9.1
 *
 * Responsibility:
 * Validate final questions produced by the Question Factory.
 *
 * Architecture:
 * Question Blueprint
 *      ↓
 * Question Factory
 *      ↓
 * Question Quality Gate
 *      ↓
 * Final Question
 *
 * Important:
 * This engine validates question structure only.
 * It does NOT rewrite questions.
 * It does NOT generate distractors.
 * It does NOT modify certified composers.
 */

export class QuestionQualityGate {
  validate({
    lessonModel,
    resourceType = "unknown_resource",
    questions = []
  } = {}) {
    if (!lessonModel) {
      throw new Error("Question Quality Gate requires a lessonModel.");
    }

    if (!Array.isArray(questions)) {
      throw new Error("Question Quality Gate requires questions array.");
    }

    const validationResults = questions.map((question, index) =>
      this.validateQuestion(question, index)
    );

    const failures = validationResults.filter(
      (result) => result.valid === false
    );

    return {
      gateId: "question_quality_gate",
      gateVersion: "v0.9.1",
      lessonId: lessonModel.id,
      lessonTitle: lessonModel.lessonTitle,
      resourceType,
      questionCount: questions.length,
      passedCount: validationResults.length - failures.length,
      failedCount: failures.length,
      pass: failures.length === 0,
      results: validationResults,
      metadata: {
        generatedBy: "QuestionQualityGate",
        validationType: "structural_question_validation",
        requiresMultipleChoice: true,
        requiresFourChoices: true,
        requiresOneCorrectChoice: true,
        modifiesQuestions: false
      }
    };
  }

  validateQuestion(question, index) {
    const errors = [];

    if (!question || typeof question !== "object") {
      errors.push("Question must be an object.");
    }

    if (!question.questionId) {
      errors.push("Question is missing questionId.");
    }

    if (!question.blueprintId) {
      errors.push("Question is missing blueprintId.");
    }

    if (!question.prompt) {
      errors.push("Question is missing prompt.");
    }

    if (question.answerFormat !== "multiple_choice") {
      errors.push("Question must use multiple_choice answerFormat.");
    }

    if (!Array.isArray(question.choices)) {
      errors.push("Question choices must be an array.");
    }

    if (Array.isArray(question.choices) && question.choices.length !== 4) {
      errors.push("Question must contain exactly four choices.");
    }

    if (
      Array.isArray(question.choices) &&
      question.choices.filter((choice) => choice.isCorrect === true).length !== 1
    ) {
      errors.push("Question must contain exactly one correct choice.");
    }

    if (!question.correctAnswer) {
      errors.push("Question is missing correctAnswer.");
    }

    if (!question.explanation) {
      errors.push("Question is missing explanation.");
    }

    return {
      itemNumber: question?.itemNumber || index + 1,
      questionId: question?.questionId || null,
      blueprintId: question?.blueprintId || null,
      valid: errors.length === 0,
      errors
    };
  }
}

export const questionQualityGate = new QuestionQualityGate();