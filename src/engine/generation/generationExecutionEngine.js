/**
 * Geometry OS
 * Generation Execution Engine v0.4.0
 *
 * Responsibility:
 * Execute a prepared generation queue in a controlled way.
 *
 * Important:
 * This engine does NOT write files.
 * It does NOT publish resources.
 * It executes registered content generators when available.
 */

import { contentGeneratorRegistry } from "./contentGeneratorRegistry.js";

export class GenerationExecutionEngine {
  constructor({ registry = contentGeneratorRegistry } = {}) {
    this.registry = registry;
  }

  executeQueue(generationQueue = {}) {
    if (!generationQueue || typeof generationQueue !== "object") {
      throw new Error("Generation Execution Engine requires a generation queue object.");
    }

    if (!Array.isArray(generationQueue.queueItems)) {
      throw new Error("Generation Execution Engine requires generationQueue.queueItems array.");
    }

    const executionRecords = generationQueue.queueItems.map((queueItem, index) => {
      const generatorContract = this.registry.resolve(queueItem.generatorId);

      if (generatorContract && typeof generatorContract.generate === "function") {
        const output = generatorContract.generate({
          generationTask: queueItem,
          generationContext:
            generationQueue.generationContext ||
            queueItem.generationContext ||
            {}
        });

        return {
          executionId: this.createExecutionId(index),
          queueId: queueItem.queueId,
          order: queueItem.order,
          assetType: queueItem.assetType || "unknown_asset",
          generatorId: queueItem.generatorId || null,
          status: "content_generated",
          contentGenerated: true,
          output,
          queueItem
        };
      }

      return {
        executionId: this.createExecutionId(index),
        queueId: queueItem.queueId,
        order: queueItem.order,
        assetType: queueItem.assetType || "unknown_asset",
        generatorId: queueItem.generatorId || null,
        status: "execution_prepared",
        contentGenerated: false,
        output: null,
        queueItem
      };
    });

    const generatedCount = executionRecords.filter(
      record => record.contentGenerated
    ).length;

    return {
      status: generatedCount > 0 ? "content_generated" : "execution_ready",
      contentGenerated: generatedCount > 0,
      totalExecutionRecords: executionRecords.length,
      generatedCount,
      executionRecords
    };
  }

  createExecutionId(index) {
    return `generation_execution_${index + 1}`;
  }
}

export const generationExecutionEngine = new GenerationExecutionEngine();