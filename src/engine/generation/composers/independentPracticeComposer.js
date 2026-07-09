/**
 * Geometry OS
 * Independent Practice Composer v0.7.7
 *
 * Responsibility:
 * Build a classroom-ready Independent Practice resource from lesson data
 * and question blueprint metadata.
 *
 * Important:
 * This composer does NOT generate final questions.
 * It does NOT generate answer choices.
 * It consumes Question Blueprint Composer metadata only.
 */

import { lessonDataResolver } from "../composition/lessonDataResolver.js";
import { questionBlueprintComposer } from "../composition/questionBlueprintComposer.js";

export class IndependentPracticeComposer {
  compose({
    lessonModel,
    generationContext = {},
    resourceType = "independent_practice",
    count = 15
  } = {}) {
    const lessonData = lessonDataResolver.resolve({
      lessonModel,
      generationContext
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
      composerId: "independent_practice_composer",
      composerVersion: "v0.7.7",
      assetType: "independent_practice",
      lessonId: lessonData.lessonId,
      lessonTitle: lessonData.lessonTitle,
      sections: [
        this.buildPracticeDirectionsSection(lessonData),
        this.buildQuestionBlueprintsSection(questionBlueprints),
        this.buildAssessmentTargetsSection(questionBlueprints),
        this.buildMisconceptionFocusSection(questionBlueprints),
        this.buildCompletionCriteriaSection(questionBlueprints)
      ],
      metadata: {
        generatedBy: "IndependentPracticeComposer",
        blueprintSource: blueprintResult.composerId || "question_blueprint_composer",
        blueprintComposerVersion: blueprintResult.composerVersion || "unknown",
        blueprintCount: questionBlueprints.length,
        answerFormat: "multiple_choice",
        choiceCount: 4,
        correctAnswerCount: 1
      }
    };
  }

  buildPracticeDirectionsSection(lessonData) {
    return {
      sectionId: "practice_directions",
      title: "Practice Directions",
      content: [
        `Complete the Independent Practice for ${lessonData.lessonTitle}.`,
        "Read each item carefully.",
        "Use precise geometric language and notation.",
        "Each item is designed as a multiple-choice question with four answer choices and one correct answer."
      ]
    };
  }

  buildQuestionBlueprintsSection(questionBlueprints) {
    return {
      sectionId: "question_blueprints",
      title: "Question Blueprints",
      content: questionBlueprints.map((blueprint, index) => {
        return {
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
        };
      })
    };
  }

  buildAssessmentTargetsSection(questionBlueprints) {
    const targets = this.getUniqueValues(
      questionBlueprints.map((blueprint) => blueprint.assessmentTarget)
    );

    return {
      sectionId: "assessment_targets",
      title: "Assessment Targets",
      content: targets
    };
  }

  buildMisconceptionFocusSection(questionBlueprints) {
    const misconceptions = this.getUniqueValues(
      questionBlueprints.map((blueprint) => blueprint.misconceptionFocus)
    );

    return {
      sectionId: "misconception_focus",
      title: "Misconception Focus",
      content: misconceptions
    };
  }

  buildCompletionCriteriaSection(questionBlueprints) {
    return {
      sectionId: "completion_criteria",
      title: "Completion Criteria",
      content: [
        "Student completes all assigned Independent Practice items.",
        "Student selects one answer for each multiple-choice item.",
        "Student demonstrates understanding across the listed assessment targets.",
        `This resource currently contains ${questionBlueprints.length} question blueprints prepared for future question generation.`
      ]
    };
  }

  getUniqueValues(values = []) {
    return [...new Set(values.filter((value) => Boolean(value)))];
  }
}

export const independentPracticeComposer = new IndependentPracticeComposer();