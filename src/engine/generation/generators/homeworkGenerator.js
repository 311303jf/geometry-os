/**
 * Geometry OS
 * Homework Generator v0.4.5
 *
 * Responsibility:
 * Generate Homework content from a generation task and generation context.
 *
 * This generator does NOT bypass the generation pipeline.
 * It is executed only through the specialized generation system.
 */

export class HomeworkGenerator {
  constructor() {
    this.generatorId = "homework_generator";
    this.version = "v0.4.5";
    this.assetType = "homework";
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
      homeworkStructure: this.buildHomeworkStructure({
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
        generatedBy: "HomeworkGenerator",
        generatedAt: new Date().toISOString(),
        pipelineStage: "specialized_generation",
        productionContract: "v1.0"
      }
    };
  }

  validateContext(generationContext) {
    if (!generationContext || typeof generationContext !== "object") {
      throw new Error("Homework Generator requires a generation context object.");
    }

    if (
      !generationContext.lesson &&
      !generationContext.lessonModel &&
      !generationContext.lessonId
    ) {
      throw new Error("Homework Generator requires lesson data or lessonId.");
    }
  }

  buildTitle(lesson = {}) {
    const lessonLabel = lesson.lesson || lesson.lessonId || lesson.id || "Lesson";
    const lessonTitle = lesson.lessonTitle || lesson.title || "Geometry Homework";

    return `${lessonLabel} Homework — ${lessonTitle}`;
  }

  buildPurpose(lesson = {}) {
    return {
      studentPurpose:
        "Practice the lesson skill after class and strengthen independent mastery.",
      teacherPurpose:
        "Collect auto-gradable evidence of student practice after instruction.",
      lessonFocus: lesson.lessonTitle || lesson.title || "Geometry lesson objective"
    };
  }

  buildStudentFacingInstructions() {
    return [
      "Complete each question independently.",
      "Choose the best answer from A, B, C, or D.",
      "Use your notes and class examples when needed.",
      "Show work on paper before selecting your answer.",
      "Submit your answers by the assigned due date."
    ];
  }

  buildHomeworkStructure({
    lesson,
    lessonId,
    instructionPlan,
    knowledgeGraph,
    dependencyAnalysis,
    instructionSequence,
    instructionDecisions
  }) {
    return {
      totalQuestions: 12,
      format: "multiple_choice",
      choiceLabels: ["A", "B", "C", "D"],
      autoGradable: true,
      openResponseAllowed: false,
      requiresMissingVisuals: false,
      dokProgression: [
        {
          section: "Review",
          questionRange: "1-3",
          dokLevel: 1,
          purpose: "Review essential vocabulary, notation, and basic recognition."
        },
        {
          section: "Practice",
          questionRange: "4-8",
          dokLevel: 2,
          purpose: "Apply the lesson skill in standard homework situations."
        },
        {
          section: "Reasoning",
          questionRange: "9-11",
          dokLevel: 3,
          purpose: "Use reasoning to interpret or justify geometry relationships."
        },
        {
          section: "Challenge",
          questionRange: "12",
          dokLevel: 4,
          purpose: "Apply the lesson skill in a more complex homework task."
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
        "Homework must be multiple choice only.",
        "Each question must have exactly four answer choices.",
        "Only one answer choice may be correct.",
        "Distractors must represent realistic geometry misconceptions.",
        "No duplicate questions are allowed.",
        "No open-ended items are allowed in Homework.",
        "Homework should reinforce the lesson without introducing new instruction."
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

export const homeworkGenerator = new HomeworkGenerator();