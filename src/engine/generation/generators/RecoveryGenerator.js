/**
 * Geometry OS
 * Recovery Generator v0.4.8
 *
 * Production Contract v1.0
 *
 * Responsibility:
 * Generate a recovery content package from a generation task
 * and resolved generation context.
 *
 * This generator does NOT write files.
 * It does NOT publish resources.
 * It only returns structured generated content.
 */

export class RecoveryGenerator {
  constructor() {
    this.generatorId = "recovery_generator";
    this.generatorName = "Recovery Generator";
    this.version = "v0.4.8";
    this.assetType = "recovery";
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
      title: `Recovery — ${lessonTitle}`,
      purpose: {
        studentPurpose:
          "Review the key lesson skill, correct misunderstandings, and rebuild confidence before trying again.",
        teacherPurpose:
          "Provide targeted reteaching and practice for students who need additional support after evidence of difficulty.",
        lessonFocus: lessonTitle
      },
      recoveryStructure: {
        recoveryType: "targeted_reteaching",
        autoGradablePracticeIncluded: true,
        openResponseAllowed: false,
        format: "reteach_then_multiple_choice_practice",
        recommendedUse: [
          "Assign after low exit ticket performance.",
          "Assign after low quiz performance.",
          "Use during small-group intervention.",
          "Use before reassessment."
        ],
        masteryGoal: "Student can retry the target skill with improved accuracy and confidence.",
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
        }
      },
      reteachPlan: this.buildReteachPlan({
        objectives,
        lessonTitle
      }),
      recoveryPractice: this.buildRecoveryPractice({
        objectives,
        assessmentTargets,
        lessonTitle
      }),
      assessmentContract: {
        gradingType: "auto_gradable_practice",
        allowedQuestionTypes: ["multiple_choice"],
        requiredChoicesPerQuestion: 4,
        requiredCorrectAnswersPerQuestion: 1,
        answerKeyRequired: true,
        classroomReady: true,
        googleFormsCompatible: true
      },
      metadata: {
        generatedBy: this.generatorName,
        generatedAt: new Date().toISOString(),
        pipelineStage: "specialized_generation",
        productionContract: "v1.0"
      }
    };
  }

  buildReteachPlan({ objectives = [], lessonTitle }) {
    const primaryObjective =
      objectives[0]?.description ||
      objectives[0] ||
      `Understand the main idea of ${lessonTitle}.`;

    return {
      reteachFocus: primaryObjective,
      teacherGuidance: [
        "Begin with the vocabulary or notation students need most.",
        "Model one simple example using clear language.",
        "Ask students to identify what the problem is asking.",
        "Have students explain why the correct answer fits.",
        "Use incorrect options as misconception checks."
      ],
      studentSupportSteps: [
        "Review the key vocabulary.",
        "Look at the example carefully.",
        "Identify what the question is asking.",
        "Eliminate answer choices that do not match the lesson idea.",
        "Choose the best answer and check your reasoning."
      ],
      misconceptionRepair: [
        {
          misconception: "Student guesses without connecting to the lesson skill.",
          repairMove: "Ask the student to underline the key term or notation before selecting an answer."
        },
        {
          misconception: "Student confuses related geometry terms.",
          repairMove: "Compare two terms side by side and ask what makes them different."
        },
        {
          misconception: "Student chooses an answer that sounds familiar but does not answer the question.",
          repairMove: "Have the student restate the question in their own words before choosing."
        }
      ]
    };
  }

  buildRecoveryPractice({ objectives = [], assessmentTargets = [], lessonTitle }) {
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

    return {
      totalQuestions: 6,
      format: "multiple_choice",
      choiceLabels: ["A", "B", "C", "D"],
      autoGradable: true,
      openResponseAllowed: false,
      items: [
        {
          itemNumber: 1,
          itemType: "multiple_choice",
          dokLevel: 1,
          prompt: "Which statement best matches the skill you are reviewing?",
          choices: {
            A: primaryObjective,
            B: "Ignore the lesson vocabulary.",
            C: "Use unrelated information.",
            D: "Choose randomly without checking."
          },
          correctAnswer: "A",
          skillFocus: "recovery_objective_recognition"
        },
        {
          itemNumber: 2,
          itemType: "multiple_choice",
          dokLevel: 1,
          prompt: "Which action helps repair a misunderstanding?",
          choices: {
            A: "Review the key vocabulary and connect it to the question.",
            B: "Skip the problem immediately.",
            C: "Pick the answer that looks longest.",
            D: "Avoid reading the question."
          },
          correctAnswer: "A",
          skillFocus: "recovery_strategy"
        },
        {
          itemNumber: 3,
          itemType: "multiple_choice",
          dokLevel: 2,
          prompt: "Which option best shows the lesson skill being used correctly?",
          choices: {
            A: secondaryObjective,
            B: "A response with unrelated vocabulary.",
            C: "A response that ignores notation.",
            D: "A response that does not answer the question."
          },
          correctAnswer: "A",
          skillFocus: "skill_reapplication"
        },
        {
          itemNumber: 4,
          itemType: "multiple_choice",
          dokLevel: 2,
          prompt: "Which evidence shows the student is improving?",
          choices: {
            A: primaryAssessmentTarget,
            B: "The student leaves the work blank.",
            C: "The student repeats the same mistake without checking.",
            D: "The student changes answers randomly."
          },
          correctAnswer: "A",
          skillFocus: "mastery_evidence"
        },
        {
          itemNumber: 5,
          itemType: "multiple_choice",
          dokLevel: 3,
          prompt: "If two answer choices seem similar, what should the student do?",
          choices: {
            A: "Compare both choices to the exact vocabulary and meaning of the question.",
            B: "Choose whichever choice appears first.",
            C: "Ignore the difference between the choices.",
            D: "Skip all reasoning."
          },
          correctAnswer: "A",
          skillFocus: "misconception_check"
        },
        {
          itemNumber: 6,
          itemType: "multiple_choice",
          dokLevel: 3,
          prompt: "What is the best sign that recovery practice was successful?",
          choices: {
            A: "The student can explain why the correct answer fits the lesson skill.",
            B: "The student guesses faster.",
            C: "The student avoids the lesson vocabulary.",
            D: "The student selects an answer without reading."
          },
          correctAnswer: "A",
          skillFocus: "recovery_mastery_signal"
        }
      ],
      answerKey: [
        { itemNumber: 1, correctAnswer: "A" },
        { itemNumber: 2, correctAnswer: "A" },
        { itemNumber: 3, correctAnswer: "A" },
        { itemNumber: 4, correctAnswer: "A" },
        { itemNumber: 5, correctAnswer: "A" },
        { itemNumber: 6, correctAnswer: "A" }
      ]
    };
  }
}

export const recoveryGenerator = new RecoveryGenerator();