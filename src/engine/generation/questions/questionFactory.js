/**
 * Geometry OS
 * Question Factory v0.9.0
 *
 * Responsibility:
 * Convert Question Blueprint metadata into final classroom-ready
 * multiple-choice question objects.
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
 * This is the FIRST engine that creates actual questions.
 * This engine does NOT validate final question quality yet.
 * It does NOT replace the Question Blueprint Composer.
 */

export class QuestionFactory {
  buildQuestions({
    lessonModel,
    questionBlueprints = [],
    resourceType = "unknown_resource"
  } = {}) {
    if (!lessonModel) {
      throw new Error("Question Factory requires a lessonModel.");
    }

    if (!Array.isArray(questionBlueprints)) {
      throw new Error("Question Factory requires questionBlueprints array.");
    }

    return {
      factoryId: "question_factory",
      factoryVersion: "v0.9.0",
      lessonId: lessonModel.id,
      lessonTitle: lessonModel.lessonTitle,
      resourceType,
      questions: questionBlueprints.map((blueprint, index) =>
        this.buildQuestion({
          lessonModel,
          blueprint,
          index,
          resourceType
        })
      ),
      metadata: {
        generatedBy: "QuestionFactory",
        source: "question_blueprints",
        blueprintCount: questionBlueprints.length,
        questionCount: questionBlueprints.length,
        qualityGateApplied: false
      }
    };
  }

  buildQuestion({ lessonModel, blueprint, index, resourceType }) {
    const itemNumber = index + 1;
    const correctChoice = "A";

    return {
      questionId: `${resourceType}_question_${itemNumber}`,
      itemNumber,
      blueprintId: blueprint.blueprintId,
      lessonId: lessonModel.id,
      lessonTitle: lessonModel.lessonTitle,
      resourceType,
      prompt: this.buildPrompt({ lessonModel, blueprint, itemNumber }),
      answerFormat: "multiple_choice",
      choices: this.buildChoices(blueprint),
      correctChoice,
      correctAnswer: this.buildCorrectAnswer(blueprint),
      explanation: this.buildExplanation(blueprint),
      metadata: {
        generatedBy: "QuestionFactory",
        factoryVersion: "v0.9.0",
        skill: blueprint.skill,
        problemType: blueprint.problemType,
        dokLevel: blueprint.dokLevel,
        difficulty: blueprint.difficulty,
        assessmentTarget: blueprint.assessmentTarget,
        misconceptionFocus: blueprint.misconceptionFocus,
        sourceBlueprintId: blueprint.blueprintId,
        qualityGateApplied: false
      }
    };
  }

  buildPrompt({ lessonModel, blueprint, itemNumber }) {
    const lessonTitle = lessonModel.lessonTitle || "the lesson";
    const skill = blueprint.skill || "the target skill";
    const problemType = blueprint.problemType || "lesson understanding";

    return `Question ${itemNumber}: In ${lessonTitle}, which answer best demonstrates the skill "${skill}" for this ${problemType} task?`;
  }

  buildChoices(blueprint) {
    const correctAnswer = this.buildCorrectAnswer(blueprint);

    return [
      {
        label: "A",
        text: correctAnswer,
        isCorrect: true
      },
      {
        label: "B",
        text: this.buildDistractorOne(blueprint),
        isCorrect: false
      },
      {
        label: "C",
        text: this.buildDistractorTwo(blueprint),
        isCorrect: false
      },
      {
        label: "D",
        text: this.buildDistractorThree(blueprint),
        isCorrect: false
      }
    ];
  }

  buildCorrectAnswer(blueprint) {
    const skill = blueprint.skill || "the target skill";

    return `A correct response accurately applies ${skill}.`;
  }

  buildDistractorOne(blueprint) {
    const misconception =
      blueprint.misconceptionFocus || "a common misconception";

    return `This response shows ${misconception}.`;
  }

  buildDistractorTwo(blueprint) {
    return "This response uses unrelated information instead of the lesson target.";
  }

  buildDistractorThree(blueprint) {
    return "This response confuses vocabulary, notation, or classification from the lesson.";
  }

  buildExplanation(blueprint) {
    const assessmentTarget =
      blueprint.assessmentTarget || "the assessment target";

    return `The correct answer matches the intended assessment target: ${assessmentTarget}.`;
  }
}

export const questionFactory = new QuestionFactory();