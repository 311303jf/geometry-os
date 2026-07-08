/**
 * Geometry OS
 * Independent Practice Generator v0.4.4
 *
 * Responsibility:
 * Generate Independent Practice content from a generation task and generation context.
 *
 * This generator does NOT bypass the generation pipeline.
 * It is executed only through the specialized generation system.
 */

export class IndependentPracticeGenerator {
  constructor() {
    this.generatorId = "independent_practice_generator";
    this.version = "v0.4.4";
    this.assetType = "independent_practice";
  }

   generate(generationTask = {}, generationContext = null) {
    const resolvedGenerationContext =
      generationContext ||
      generationTask.generationContext ||
      generationTask;

    this.validateContext(resolvedGenerationContext);

    const lesson =
      resolvedGenerationContext.lesson ||
      resolvedGenerationContext.lessonModel ||
      {};

    const lessonId =
      lesson.id ||
      lesson.lessonId ||
      resolvedGenerationContext.lessonId ||
      generationTask.lessonId ||
      null;

    const instructionPlan = resolvedGenerationContext.instructionPlan || {};
    const knowledgeGraph = resolvedGenerationContext.knowledgeGraph || {};
    const dependencyAnalysis = resolvedGenerationContext.dependencyAnalysis || {};
    const instructionSequence = resolvedGenerationContext.instructionSequence || {};
    const instructionDecisions = resolvedGenerationContext.instructionDecisions || {};

    return {
      generatorId: this.generatorId,
      generatorVersion: this.version,
      assetType: this.assetType,
      status: "content_generated",
      lessonId,
      title: this.buildTitle(lesson),
      purpose: this.buildPurpose(lesson),
      studentFacingInstructions: this.buildStudentFacingInstructions(),
      practiceStructure: this.buildPracticeStructure({
        lesson,
        lessonId,
        instructionPlan,
        knowledgeGraph,
        dependencyAnalysis,
        instructionSequence,
        instructionDecisions
      }),
      assessmentContract: this.buildAssessmentContract(),
      metadata: {
        generatedBy: "IndependentPracticeGenerator",
        generatedAt: new Date().toISOString(),
        pipelineStage: "specialized_generation",
        productionContract: "v1.0"
      }
    };
  }

  validateContext(generationContext) {
    if (!generationContext || typeof generationContext !== "object") {
      throw new Error("Independent Practice Generator requires a generation context object.");
    }

    if (
      !generationContext.lesson &&
      !generationContext.lessonModel &&
      !generationContext.lessonId
    ) {
      throw new Error("Independent Practice Generator requires lesson data or lessonId.");
    }
  }

  buildTitle(lesson = {}) {
    const lessonLabel = lesson.lesson || lesson.lessonId || lesson.id || "Lesson";
    const lessonTitle = lesson.lessonTitle || lesson.title || "Geometry Practice";

    return `${lessonLabel} Independent Practice — ${lessonTitle}`;
  }

  buildPurpose(lesson = {}) {
    return {
      studentPurpose:
        "Practice today’s geometry skill independently and demonstrate understanding through auto-gradable questions.",
      teacherPurpose:
        "Collect mastery evidence from independent student work using multiple-choice questions aligned to the lesson objective.",
      lessonFocus: lesson.lessonTitle || lesson.title || "Geometry lesson objective"
    };
  }

  buildStudentFacingInstructions() {
    return [
      "Read each question carefully.",
      "Choose the best answer from A, B, C, or D.",
      "Show work on paper when needed before selecting your answer.",
      "Use correct geometry vocabulary.",
      "Complete the practice independently."
    ];
  }

  buildPracticeStructure({
    lesson,
    lessonId,
    instructionPlan,
    knowledgeGraph,
    dependencyAnalysis,
    instructionSequence,
    instructionDecisions
  }) {
    return {
      totalQuestions: 15,
      format: "multiple_choice",
      choiceLabels: ["A", "B", "C", "D"],
      autoGradable: true,
      openResponseAllowed: false,
      requiresMissingVisuals: false,
      dokProgression: [
        {
          section: "Foundation Check",
          questionRange: "1-4",
          dokLevel: 1,
          purpose: "Confirm basic vocabulary, notation, and recognition."
        },
        {
          section: "Skill Practice",
          questionRange: "5-9",
          dokLevel: 2,
          purpose: "Apply the lesson skill in standard practice situations."
        },
        {
          section: "Reasoning Practice",
          questionRange: "10-13",
          dokLevel: 3,
          purpose: "Use reasoning to compare, classify, or justify relationships."
        },
        {
          section: "Challenge Application",
          questionRange: "14-15",
          dokLevel: 4,
          purpose: "Apply the skill in a more complex or unfamiliar situation."
        }
      ],
      alignmentSources: {
        lessonId,
        objectives: instructionPlan.objectives || lesson.objectives || [],
        graphVersion: knowledgeGraph.metadata?.graphVersion || null,
        dependencySummary: dependencyAnalysis.summary || null,
        sequenceVersion: instructionSequence.metadata?.sequenceVersion || null,
        decisionVersion: instructionDecisions.metadata?.decisionVersion || null
      },
      generationNotes: [
        "Questions must be multiple choice only.",
        "Each question must have exactly four answer choices.",
        "Only one answer choice may be correct.",
        "Distractors must represent realistic geometry misconceptions.",
        "No duplicate questions are allowed.",
        "No open-ended items are allowed in Independent Practice."
      ]
    };
  }

  buildAssessmentContract() {
    return {
      gradingType: "auto_gradable",
      allowedQuestionTypes: ["multiple_choice"],
      requiredChoicesPerQuestion: 4,
      requiredCorrectAnswersPerQuestion: 1,
      answerKeyRequired: true,
      classroomReady: true,
      googleFormsCompatible: true
    };
  }
}

export const independentPracticeGenerator = new IndependentPracticeGenerator();