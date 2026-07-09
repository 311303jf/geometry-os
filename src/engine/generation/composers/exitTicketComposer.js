/**
 * Geometry OS
 * Exit Ticket Composer v0.7.9
 *
 * Responsibility:
 * Build a classroom-ready Exit Ticket resource from lesson data
 * and question blueprint metadata.
 *
 * Important:
 * This composer does NOT generate final questions.
 * It does NOT generate answer choices.
 * It consumes Question Blueprint Composer metadata only.
 */

import { lessonDataResolver } from "../composition/lessonDataResolver.js";
import { questionBlueprintComposer } from "../composition/questionBlueprintComposer.js";

export class ExitTicketComposer {
  compose({
    lessonModel,
    generationContext = {},
    resourceType = "exit_ticket",
    count = 5
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
      composerId: "exit_ticket_composer",
      composerVersion: "v0.7.9",
      assetType: "exit_ticket",
      lessonId: lessonData.lessonId,
      lessonTitle: lessonData.lessonTitle,
      sections: [
        this.buildExitTicketDirectionsSection(lessonData),
        this.buildQuestionBlueprintsSection(questionBlueprints),
        this.buildAssessmentTargetsSection(questionBlueprints),
        this.buildMisconceptionFocusSection(questionBlueprints),
        this.buildCompletionCriteriaSection(questionBlueprints)
      ],
      metadata: {
        generatedBy: "ExitTicketComposer",
        blueprintSource: "question_blueprint_composer",
        blueprintComposerVersion:
          blueprintResult.metadata?.composerVersion || blueprintResult.composerVersion,
        blueprintCount: questionBlueprints.length,
        answerFormat: "multiple_choice",
        choiceCount: 4,
        correctAnswerCount: 1
      }
    };
  }

  buildExitTicketDirectionsSection(lessonData) {
    return {
      sectionId: "exit_ticket_directions",
      title: "Exit Ticket Directions",
      content: [
        `Complete the Exit Ticket for ${lessonData.lessonTitle}.`,
        "Show what you understand from today’s lesson.",
        "Read each question carefully before choosing an answer.",
        "Each item is designed as a multiple-choice question with four answer choices and one correct answer."
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
        "Student completes all Exit Ticket items.",
        "Student selects one answer for each multiple-choice item.",
        "Student demonstrates evidence of lesson understanding.",
        `This resource currently contains ${questionBlueprints.length} question blueprints prepared for future question generation.`
      ]
    };
  }

  getUniqueValues(values = []) {
    return [...new Set(values.filter(Boolean))];
  }
}

export const exitTicketComposer = new ExitTicketComposer();