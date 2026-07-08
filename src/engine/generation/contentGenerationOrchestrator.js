/**
 * Geometry OS
 * Content Generation Orchestrator v0.3.0
 *
 * Responsibility:
 * Convert Asset Specifications into a content generation plan.
 *
 * This engine does NOT generate instructional content.
 * It does NOT generate questions.
 * It does NOT publish resources.
 *
 * It prepares future generation tasks for specialized content generators.
 */

export class ContentGenerationOrchestrator {
  buildGenerationPlan(assetSpecifications) {
    this.validate(assetSpecifications);

    const generationTasks = assetSpecifications.specifications.map(
      (specification, index) =>
        this.createGenerationTask(specification, index, assetSpecifications)
    );

    return {
      lessonId: assetSpecifications.lessonId,
      generationPlanVersion: "v0.3.0",
      generatedBy: "ContentGenerationOrchestrator",
      totalTasks: generationTasks.length,
      generationTasks,
      metadata: {
        sourceSpecificationVersion: assetSpecifications.specificationVersion,
        generatedAt: new Date().toISOString()
      }
    };
  }

  validate(assetSpecifications) {
    if (!assetSpecifications) {
      throw new Error(
        "Content Generation Orchestrator requires Asset Specifications."
      );
    }

    if (!Array.isArray(assetSpecifications.specifications)) {
      throw new Error(
        "Asset Specifications must include a specifications array."
      );
    }
  }

  createGenerationTask(specification, index, assetSpecifications) {
    return {
      id: `generation-task-${index + 1}`,
      lessonId: assetSpecifications.lessonId,
      assetId: specification.assetId,
      resourceType: specification.resourceType,
      stepTitle: specification.stepTitle,
      futureGenerator: specification.futureGenerator,
      generationStatus: "queued",
      requiresVisual: specification.requiresVisual,
      requiresTeacherGuidance: specification.requiresTeacherGuidance,
      estimatedDifficulty: specification.estimatedDifficulty,
      estimatedDuration: specification.estimatedDuration,
      outputContract: this.createOutputContract(specification)
    };
  }

  createOutputContract(specification) {
    return {
      resourceType: specification.resourceType,
      requiredFields: this.getRequiredOutputFields(specification.resourceType),
      format: "structured_json",
      status: "defined"
    };
  }

  getRequiredOutputFields(resourceType) {
    switch (resourceType) {
      case "teacher_mini_lesson":
        return ["title", "teacherExplanation", "keyVocabulary", "teacherMoves"];

      case "worked_example":
        return ["title", "problemStatement", "solutionSteps", "finalAnswer"];

      case "guided_practice":
        return ["title", "practiceItems", "teacherPrompts", "successCriteria"];

      case "independent_practice":
        return ["title", "questions", "answerKey", "autoGradable"];

      case "check_for_understanding":
        return ["title", "questions", "answerKey", "masterySignal"];

      case "visual_support":
        return ["title", "visualDescription", "diagramRequirements", "teacherUse"];

      case "recovery_resource":
        return ["title", "misconceptionTarget", "reteachSteps", "recoveryPractice"];

      default:
        return ["title", "instructions", "contentBody"];
    }
  }
}

export const contentGenerationOrchestrator =
  new ContentGenerationOrchestrator();