/**
 * Geometry OS
 * Quiz Composer v0.8.0
 *
 * Responsibility:
 * Build a classroom-ready Quiz resource from lesson data
 * and question blueprint metadata.
 *
 * Important:
 * This composer does NOT generate final questions.
 * It does NOT generate answer choices.
 * It consumes Question Blueprint Composer metadata only.
 */

import { lessonDataResolver } from "../composition/lessonDataResolver.js";
import { questionBlueprintComposer } from "../composition/questionBlueprintComposer.js";

export class QuizComposer {
  compose({
    lessonModel,
    generationContext = {},
    resourceType = "quiz",
    count = 20
  } = {}) {
    const lessonData = lessonDataResolver.resolve({
      lessonModel,
      ...generationContext
    });

    const blueprintResult = questionBlueprintComposer.composeBlueprints(
      {
        lessonModel,
        ...generationContext
      },
      {
        resourceType,
        count
      }
    );

    const questionBlueprints = blueprintResult.blueprints || [];

    return {
      composerId: "quiz_composer",
      composerVersion: "v0.8.0",
      assetType: "quiz",
      lessonId: lessonData.lessonId,
      lessonTitle: lessonData.lessonTitle,
      sections: [
        this.buildQuizDirectionsSection(lessonData),
        this.buildQuestionBlueprintsSection(questionBlueprints),
        this.buildAssessmentTargetsSection(questionBlueprints),
        this.buildMisconceptionFocusSection(questionBlueprints),
        this.buildCompletionCriteriaSection(questionBlueprints)
      ],
      metadata: {
        generatedBy: "QuizComposer",
        blueprintSource: "question_blueprint_composer",
        composerVersion: "v0.8.0",
        blueprintComposerVersion:
          blueprintResult.metadata?.composerVersion || blueprintResult.composerVersion,
        blueprintCount: questionBlueprints.length,
        answerFormat: "multiple_choice",
        choiceCount: 4,
        correctAnswerCount: 1,
        finalQuestionsGenerated: false,
        distractorsGenerated: false,
        questionFactoryConnected: false
      }
    };
  }

  buildQuizDirectionsSection(lessonData) {
    return {
      sectionId: "quiz_directions",
      title: "Quiz Directions",
      content: [
        `Complete the Quiz for ${lessonData.lessonTitle}.`,
        "Read each question carefully before choosing an answer.",
        "Each item is designed as a multiple-choice question with four answer choices and one correct answer.",
        "Use your understanding of the lesson objectives, vocabulary, and examples to choose the best answer."
      ]
    };
  }

  buildQuestionBlueprintsSection(questionBlueprints) {
    return {
      sectionId: "question_blueprints",
      title: "Question Blueprints",
      content: questionBlueprints.map((blueprint, index) => ({
        itemNumber: index + 1,
        blueprintId: blueprint.blueprintId,
        skill: blueprint.skill,
        problemType: blueprint.problemType,
        dokLevel: blueprint.dokLevel,
        difficulty: blueprint.difficulty,
        assessmentTarget: blueprint.assessmentTarget,
        misconceptionFocus: blueprint.misconceptionFocus,
        answerFormat: blueprint.answerFormat,
        choiceCount: blueprint.choiceCount,
        correctAnswerCount: blueprint.correctAnswerCount,
        studentFacing: blueprint.studentFacing
      }))
    };
  }

  buildAssessmentTargetsSection(questionBlueprints) {
    return {
      sectionId: "assessment_targets",
      title: "Assessment Targets",
      content: this.getUniqueValues(
        questionBlueprints.map((blueprint) => blueprint.assessmentTarget)
      )
    };
  }

  buildMisconceptionFocusSection(questionBlueprints) {
    return {
      sectionId: "misconception_focus",
      title: "Misconception Focus",
      content: this.getUniqueValues(
        questionBlueprints.map((blueprint) => blueprint.misconceptionFocus)
      )
    };
  }

  buildCompletionCriteriaSection(questionBlueprints) {
    return {
      sectionId: "completion_criteria",
      title: "Completion Criteria",
      content: [
        "Student completes all Quiz items.",
        "Student selects one answer for each multiple-choice item.",
        "Student demonstrates evidence of lesson understanding across multiple assessment targets.",
        `This resource currently contains ${questionBlueprints.length} question blueprints prepared for future question generation.`
      ]
    };
  }

  getUniqueValues(values = []) {
    return [...new Set(values.filter(Boolean))];
  }
}

export const quizComposer = new QuizComposer();