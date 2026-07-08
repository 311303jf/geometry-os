/**
 * Geometry OS
 * Generation Context Engine v0.3.4
 *
 * Responsibility:
 * Build one unified Generation Context from the certified Foundation pipeline.
 *
 * Important:
 * This engine does NOT generate instructional content.
 * It only prepares the shared context future generators will consume.
 */

export class GenerationContextEngine {
  buildContext({
    lessonModel,
    instructionPlan,
    knowledgeGraph,
    dependencyAnalysis,
    instructionSequence,
    instructionDecisions,
    resourcePlan,
    assetSpecifications,
    generationPlan = null
  } = {}) {
    const contextParts = {
      lessonModel,
      instructionPlan,
      knowledgeGraph,
      dependencyAnalysis,
      instructionSequence,
      instructionDecisions,
      resourcePlan,
      assetSpecifications
    };

    this.validateContextParts(contextParts);

    return {
      id: this.createContextId(lessonModel),
      type: "generation_context",
      version: "0.3.4",

      lessonModel,
      instructionPlan,
      knowledgeGraph,
      dependencyAnalysis,
      instructionSequence,
      instructionDecisions,
      resourcePlan,
      assetSpecifications,

      generationPlan,

      generationStatus: "planned_not_generated",
      contentGenerated: false,

      metadata: {
        engine: "GenerationContextEngine",
        readyForGenerators: true,
        foundationPipelineComplete: true
      }
    };
  }

  validateContextParts(contextParts) {
    Object.entries(contextParts).forEach(([key, value]) => {
      if (!value) {
        throw new Error(`Generation Context Engine missing required context part: ${key}`);
      }
    });
  }

  createContextId(lessonModel) {
    const course = lessonModel.course || "unknown-course";
    const unit = lessonModel.unit || "unknown-unit";
    const lesson = lessonModel.lesson || "unknown-lesson";

    return `generation-context-${course}-${unit}-${lesson}`;
  }
}

export const generationContextEngine = new GenerationContextEngine();