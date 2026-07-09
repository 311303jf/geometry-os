/**
 * Geometry OS
 * Quiz Generator v0.4.7
 *
 * Production Contract v1.0
 *
 * Responsibility:
 * Generate a quiz content package from a generation task
 * and resolved generation context.
 *
 * This generator does NOT write files.
 * It does NOT publish resources.
 * It only returns structured generated content.
 */

export class QuizGenerator {
  constructor() {
    this.generatorId = "quiz_generator";
    this.generatorName = "Quiz Generator";
    this.version = "v0.4.7";
    this.assetType = "quiz";
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
      resolvedGenerationContext.instructionPlan?.objectives ||
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
      status: "content_generated",
      lessonId,
      lessonTitle,
      contentGenerated: true,
      productionContract: "v1.0",
      title: `Quiz — ${lessonTitle}`,
      purpose: {
        studentPurpose:
          "Demonstrate mastery of the lesson skill using auto-gradable multiple-choice questions.",
        teacherPurpose:
          "Collect quiz-level evidence of student mastery aligned to the lesson objectives.",
        lessonFocus: lessonTitle
      },
      quizStructure: {
        totalQuestions: 10,
        format: "multiple_choice",
        choiceLabels: ["A", "B", "C", "D"],
        autoGradable: true,
        openResponseAllowed: false,
        requiresMissingVisuals: false,
        dokProgression: [
          {
            section: "Foundation",
            questionRange: "1-2",
            dokLevel: 1,
            purpose: "Check essential vocabulary and recognition."
          },
          {
            section: "Application",
            questionRange: "3-6",
            dokLevel: 2,
            purpose: "Apply the lesson skill in standard quiz situations."
          },
          {
            section: "Reasoning",
            questionRange: "7-9",
            dokLevel: 3,
            purpose: "Use reasoning to interpret, compare, or justify geometry relationships."
          },
          {
            section: "Challenge",
            questionRange: "10",
            dokLevel: 4,
            purpose: "Apply the skill in a more complex assessment situation."
          }
        ],
        alignmentSources: {
          lessonId,
          objectives,
          assessmentTargets,
          graphVersion:
            resolvedGenerationContext.knowledgeGraph?.metadata?.graphVersion ||
            null,
          dependencySummary:
            resolvedGenerationContext.dependencyAnalysis?.summary || null,
          sequenceVersion:
            resolvedGenerationContext.instructionSequence?.metadata
              ?.sequenceVersion || null,
          decisionVersion:
            resolvedGenerationContext.instructionDecisions?.metadata
              ?.decisionVersion || null
        },
        generationNotes: [
          "Quiz must be multiple choice only.",
          "Each question must have exactly four answer choices.",
          "Only one answer choice may be correct.",
          "Distractors must represent realistic geometry misconceptions.",
          "No duplicate questions are allowed.",
          "No open-ended items are allowed in Quiz.",
          "Questions must be appropriate for auto-grading in Google Forms or Google Classroom."
        ]
      },
      assessmentContract: {
        gradingType: "auto_gradable",
        allowedQuestionTypes: ["multiple_choice"],
        requiredChoicesPerQuestion: 4,
        requiredCorrectAnswersPerQuestion: 1,
        answerKeyRequired: true,
        classroomReady: true,
        googleFormsCompatible: true
      },
      sampleItems: this.buildSampleItems({
        objectives,
        assessmentTargets,
        lessonTitle
      }),
      answerKey: this.buildAnswerKey(),
      metadata: {
        generatedBy: this.generatorName,
        generatedAt: new Date().toISOString(),
        pipelineStage: "specialized_generation",
        productionContract: "v1.0"
      }
    };
  }

  buildSampleItems({ objectives = [], assessmentTargets = [], lessonTitle }) {
    const primaryObjective =
      objectives[0]?.description ||
      objectives[0] ||
      `Demonstrate understanding of ${lessonTitle}.`;

    const secondaryObjective =
      objectives[1]?.description ||
      objectives[1] ||
      primaryObjective;

    const primaryAssessmentTarget =
      assessmentTargets[0]?.description ||
      assessmentTargets[0] ||
      primaryObjective;

    return [
      {
        itemNumber: 1,
        itemType: "multiple_choice",
        dokLevel: 1,
        prompt: "Which answer best represents the main lesson objective?",
        choices: {
          A: primaryObjective,
          B: "Use unrelated information to guess.",
          C: "Ignore mathematical vocabulary.",
          D: "Avoid checking the answer."
        },
        correctAnswer: "A",
        skillFocus: "objective_recognition"
      },
      {
        itemNumber: 2,
        itemType: "multiple_choice",
        dokLevel: 1,
        prompt: "Which student action best supports success on this quiz?",
        choices: {
          A: "Read the question carefully and use precise geometry language.",
          B: "Choose the first answer every time.",
          C: "Skip all diagrams and labels.",
          D: "Answer without using the lesson strategy."
        },
        correctAnswer: "A",
        skillFocus: "assessment_readiness"
      },
      {
        itemNumber: 3,
        itemType: "multiple_choice",
        dokLevel: 2,
        prompt: "Which option best shows the lesson skill being applied?",
        choices: {
          A: secondaryObjective,
          B: "Writing an unrelated sentence.",
          C: "Selecting a choice without reasoning.",
          D: "Using notation that does not match the figure."
        },
        correctAnswer: "A",
        skillFocus: "skill_application"
      },
      {
        itemNumber: 4,
        itemType: "multiple_choice",
        dokLevel: 3,
        prompt: "Which evidence best shows mastery of this lesson?",
        choices: {
          A: primaryAssessmentTarget,
          B: "A blank response.",
          C: "A guess with no connection to the lesson.",
          D: "A response that uses incorrect notation."
        },
        correctAnswer: "A",
        skillFocus: "mastery_evidence"
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

export const quizGenerator = new QuizGenerator();