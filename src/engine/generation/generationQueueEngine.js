/**
 * Geometry OS
 * Generation Queue Engine v0.3.5
 *
 * Responsibility:
 * Convert a certified generation context into an executable generation queue.
 *
 * Important:
 * This engine does NOT generate instructional content.
 * It does NOT resolve generators directly.
 * It does NOT mutate the generation context.
 * It only prepares queued generation items for future execution engines.
 */

export class GenerationQueueEngine {
  buildQueue(generationContext = {}) {
    if (!generationContext || typeof generationContext !== "object") {
      throw new Error("Generation Queue Engine requires a generation context object.");
    }

    const generationPlan = generationContext.generationPlan || {};
    const generationTasks = generationPlan.generationTasks || [];

    if (!Array.isArray(generationTasks)) {
      throw new Error("Generation Queue Engine requires generationPlan.generationTasks array.");
    }

    const queueItems = generationTasks.map((task, index) => {
      return {
        queueId: this.createQueueId(index),
        order: index + 1,
        status: "queued",
        assetType: task.assetType || "unknown_asset",
        generatorId: task.generatorId || task.resolvedGenerator || null,
        generationTask: task,
        generationContextReference: {
          lessonId: generationContext.lessonModel?.id || null,
          lessonTitle: generationContext.lessonModel?.lessonTitle || null,
          generationStatus: generationContext.generationStatus || "planned_not_generated"
        }
      };
    });

    return {
      status: "queue_ready",
      contentGenerated: false,
      totalQueuedItems: queueItems.length,
      queueItems
    };
  }

  createQueueId(index) {
    return `generation_queue_item_${index + 1}`;
  }
}

export const generationQueueEngine = new GenerationQueueEngine();