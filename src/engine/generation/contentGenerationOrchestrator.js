/**
 * Geometry OS
 * Content Generation Orchestrator v0.3.1
 *
 * Responsibility:
 * Convert asset specifications into a generation plan.
 *
 * Important:
 * This engine does NOT generate instructional content yet.
 * It only prepares generation tasks and resolves future generators
 * through the Content Generator Registry.
 */

import { contentGeneratorRegistry } from "./contentGeneratorRegistry.js";

export class ContentGenerationOrchestrator {
  constructor({ registry = contentGeneratorRegistry } = {}) {
    this.registry = registry;
  }

  buildGenerationPlan(assetSpecifications = []) {
    if (!Array.isArray(assetSpecifications)) {
      throw new Error("Content Generation Orchestrator requires asset specifications array.");
    }

    const generationTasks = assetSpecifications.map((specification, index) => {
      const futureGenerator = this.resolveFutureGenerator(specification);
      const registeredGenerator = this.registry.resolve(futureGenerator);

      return {
        id: `generation-task-${index + 1}`,
        assetType: specification.assetType || specification.type || "unknown_asset",
        futureGenerator,
        generatorRegistered: Boolean(registeredGenerator),
        generatorContract: registeredGenerator
          ? {
              key: registeredGenerator.key,
              name: registeredGenerator.name,
              responsibility: registeredGenerator.responsibility,
              status: registeredGenerator.status
            }
          : null,
        outputContract: specification.outputContract || {},
        requiredFields: specification.requiredFields || [],
        estimatedDifficulty: specification.estimatedDifficulty || "medium",
        estimatedDuration: specification.estimatedDuration || "not_estimated",
        generationStatus: "planned_not_generated"
      };
    });

    return {
      status: "generation_plan_created",
      contentGenerated: false,
      totalGenerationTasks: generationTasks.length,
      registeredGeneratorsAvailable: this.registry.list().length,
      generationTasks
    };
  }

  resolveFutureGenerator(specification = {}) {
    return (
      specification.futureGenerator ||
      specification.generator ||
      specification.generatorKey ||
      `${specification.assetType || specification.type || "unknown"}Generator`
    );
  }
}

export const contentGenerationOrchestrator = new ContentGenerationOrchestrator();