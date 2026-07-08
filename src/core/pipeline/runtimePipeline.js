/**
 * Math Teacher OS
 * Runtime Pipeline v1.0
 *
 * Responsibility:
 * Execute registered engines in a controlled sequence.
 *
 * The pipeline does not create content directly.
 * It runs engines that are already registered in the Engine Registry.
 */

import { eventBus } from "../eventBus.js";
import { engineRegistry } from "../engineRegistry.js";

export class RuntimePipeline {
  constructor({ registry = engineRegistry, events = eventBus } = {}) {
    this.registry = registry;
    this.events = events;
  }

  run(engineSequence = [], initialContext = {}) {
    if (!Array.isArray(engineSequence)) {
      throw new Error("Runtime pipeline requires an engine sequence array.");
    }

    let context = {
      ...initialContext,
      pipelineStartedAt: new Date().toISOString(),
      pipelineResults: []
    };

    this.events.emit("RUNTIME_PIPELINE_STARTED", {
      engineSequence
    });

    for (const engineName of engineSequence) {
      if (!this.registry.has(engineName)) {
        const skippedResult = {
          engineName,
          status: "skipped",
          reason: "Engine not registered."
        };

        context.pipelineResults.push(skippedResult);

        this.events.emit("PIPELINE_ENGINE_SKIPPED", skippedResult);

        continue;
      }

      const engine = this.registry.get(engineName);

      this.events.emit("PIPELINE_ENGINE_STARTED", {
        engineName
      });

      const result = engine.run(context);

      context = {
        ...context,
        lastEngineResult: result,
        pipelineResults: [
          ...context.pipelineResults,
          {
            engineName,
            status: "completed",
            result
          }
        ]
      };

      this.events.emit("PIPELINE_ENGINE_COMPLETED", {
        engineName,
        result
      });
    }

    this.events.emit("RUNTIME_PIPELINE_COMPLETED", {
      totalEngines: engineSequence.length
    });

    return {
      success: true,
      context,
      events: this.events.getAllEvents()
    };
  }
}

export const runtimePipeline = new RuntimePipeline();