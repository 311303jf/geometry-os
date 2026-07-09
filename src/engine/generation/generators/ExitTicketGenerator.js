/**
 * Geometry OS
 * Exit Ticket Generator v0.4.6
 *
 * Production Contract v1.0
 *
 * Responsibility:
 * Generate an exit ticket content package from a generation task
 * and resolved generation context.
 *
 * This generator does NOT write files.
 * It does NOT publish resources.
 * It only returns structured generated content.
 */

export class ExitTicketGenerator {
  constructor() {
    this.generatorId = "exit_ticket_generator";
    this.generatorName = "Exit Ticket Generator";
    this.version = "v0.4.6";
    this.assetType = "exit_ticket";
  }

  generate(generationTask = {}, generationContext = null) {
    const resolvedGenerationContext =
      generationContext ||
      generationTask.generationContext ||
      generationTask;

    const lesson =
      resolvedGenerationContext.lesson ||
      resolvedGenerationContext.lessonModel ||
      {};

    const lessonId =
      lesson.id ||
      lesson.lessonId ||
      resolvedGenerationContext.lessonId ||
      generationTask.lessonId ||
      "unknown_lesson";

    const lessonTitle =
      lesson.lessonTitle ||
      lesson.title ||
      resolvedGenerationContext.lessonTitle ||
      "Untitled Lesson";

    const objectives =
      lesson.objectives ||
      resolvedGenerationContext.objectives ||
      [];

    const assessmentTargets =
      lesson.assessmentTargets ||
      resolvedGenerationContext.assessmentTargets ||
      [];

    return {
      generatorId: this.generatorId,
      generatorName: this.generatorName,
      generatorVersion: this.version,
      assetType: this.assetType,
      lessonId,
      lessonTitle,
      contentGenerated: true,
      productionContract: "v1.0",
      sections: {
        title: `Exit Ticket — ${lessonTitle}`,
        purpose:
          "Quickly measure whether students can demonstrate the essential learning target before leaving the lesson.",
        studentDirections:
          "Answer each question independently. Choose the best answer.",
        teacherUse:
          "Use this exit ticket to determine whether students are ready to move forward, need targeted small-group support, or require recovery practice.",
        items: this.buildExitTicketItems({
          objectives,
          assessmentTargets,
          lessonTitle
        }),
        answerKey: this.buildAnswerKey(),
        masterySignal: {
          readyToAdvance: "3 out of 4 correct",
          needsReview: "2 out of 4 correct",
          recoveryRecommended: "0–1 out of 4 correct"
        }
      },
      metadata: {
        generatedBy: this.generatorName,
        generatedAt: new Date().toISOString()
      }
    };
  }

  buildExitTicketItems({ objectives = [], assessmentTargets = [], lessonTitle }) {
    const primaryObjective =
      objectives[0]?.description ||
      objectives[0] ||
      `Demonstrate understanding of ${lessonTitle}.`;

    const primaryAssessmentTarget =
      assessmentTargets[0]?.description ||
      assessmentTargets[0] ||
      "Show evidence of lesson mastery.";

    return [
      {
        itemNumber: 1,
        itemType: "multiple_choice",
        dokLevel: 1,
        prompt: `Which statement best matches the main goal of today's lesson?`,
        choices: {
          A: primaryObjective,
          B: "Memorize unrelated vocabulary without using it.",
          C: "Skip all reasoning and only guess an answer.",
          D: "Use a method that does not connect to the lesson."
        },
        correctAnswer: "A",
        skillFocus: "lesson_objective_recognition"
      },
      {
        itemNumber: 2,
        itemType: "multiple_choice",
        dokLevel: 2,
        prompt: `Which option best shows evidence of mastery for this lesson?`,
        choices: {
          A: primaryAssessmentTarget,
          B: "Leaving the problem blank.",
          C: "Choosing an answer without checking the reasoning.",
          D: "Copying a definition without applying it."
        },
        correctAnswer: "A",
        skillFocus: "assessment_target_alignment"
      },
      {
        itemNumber: 3,
        itemType: "multiple_choice",
        dokLevel: 2,
        prompt: `What should a student do before submitting an answer?`,
        choices: {
          A: "Check that the answer matches the question and reasoning.",
          B: "Pick the longest answer choice every time.",
          C: "Ignore units, labels, and diagrams.",
          D: "Change the answer randomly."
        },
        correctAnswer: "A",
        skillFocus: "mathematical_reasoning_check"
      },
      {
        itemNumber: 4,
        itemType: "multiple_choice",
        dokLevel: 3,
        prompt: `If a student is unsure, which strategy best supports learning?`,
        choices: {
          A: "Identify what the question is asking, use the lesson strategy, and eliminate unreasonable choices.",
          B: "Stop working immediately.",
          C: "Choose an answer without reading the problem.",
          D: "Use a strategy from a different topic even if it does not fit."
        },
        correctAnswer: "A",
        skillFocus: "independent_strategy_selection"
      }
    ];
  }

  buildAnswerKey() {
    return [
      { itemNumber: 1, correctAnswer: "A" },
      { itemNumber: 2, correctAnswer: "A" },
      { itemNumber: 3, correctAnswer: "A" },
      { itemNumber: 4, correctAnswer: "A" }
    ];
  }
}

export const exitTicketGenerator = new ExitTicketGenerator();