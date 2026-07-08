/**
 * Geometry OS
 * Content Generation Orchestrator v0.3.3
 *
 * Responsibility:
 * Convert asset specifications into a generation plan.
 *
 * Important:
 * This engine does NOT generate instructional content yet.
 * It only prepares generation tasks and resolves future generators
 * through the Generator Discovery Engine.
 */

import { generatorDiscoveryEngine } from "./generatorDiscoveryEngine.js";

export class ContentGenerationOrchestrator {
  constructor({ discoveryEngine = generatorDiscoveryEngine } = {}) {
    this.discoveryEngine = discoveryEngine;
  }

  buildGenerationPlan(assetSpecifications = []) {
    if (!Array.isArray(assetSpecifications)) {
      throw new Error("Content Generation Orchestrator requires asset specifications array.");
    }

    const generationTasks = assetSpecifications.map((specification, index) => {
      const assetType =
        specification.assetType ||
        specification.type ||
        "unknown_asset";

      const resolvedGenerator =
        this.discoveryEngine.resolvePrimaryGenerator(assetType);

      const futureGenerator =
        specification.futureGenerator ||
        specification.generator ||
        specification.generatorKey ||
        resolvedGenerator?.key ||
        `${assetType}Generator`;

      return {
        id: `generation-task-${index + 1}`,
        assetType,
        futureGenerator,
        generatorRegistered: Boolean(resolvedGenerator),
        generatorContract: resolvedGenerator
          ? {
              key: resolvedGenerator.key,
              name: resolvedGenerator.name,
              responsibility: resolvedGenerator.responsibility,
              status: resolvedGenerator.status
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
      registeredGeneratorsAvailable: this.discoveryEngine.discoverAll().length,
      generationTasks
    };
  }
}

export const contentGenerationOrchestrator = new ContentGenerationOrchestrator();