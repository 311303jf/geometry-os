/**
 * Geometry OS
 * Content Generator Registry v0.3.2
 *
 * Responsibility:
 * Register and resolve future content generators dynamically.
 *
 * Important:
 * This registry does NOT generate instructional content.
 * It only stores generator contracts for the Content Generation Layer.
 */

import { generatorContractEngine } from "./generatorContractEngine.js";

export class ContentGeneratorRegistry {
  constructor({ contractEngine = generatorContractEngine } = {}) {
    this.generators = new Map();
    this.contractEngine = contractEngine;
  }

  register(generatorKey, generatorContract) {
    if (!generatorKey || typeof generatorKey !== "string") {
      throw new Error("Content Generator Registry requires a valid generator key.");
    }

    const contract = this.contractEngine.createContract({
      key: generatorKey,
      name: generatorContract?.name || generatorKey,
      responsibility:
        generatorContract?.responsibility || "Future content generator",
      supportedAssetTypes: generatorContract?.supportedAssetTypes || [],
      requiredInputFields: generatorContract?.requiredInputFields || [],
      outputContract: generatorContract?.outputContract || {},
      status: generatorContract?.status || "registered_placeholder"
    });

    this.generators.set(generatorKey, contract);

    return contract;
  }

  resolve(generatorKey) {
    if (!this.generators.has(generatorKey)) {
      return null;
    }

    return this.generators.get(generatorKey);
  }

  has(generatorKey) {
    return this.generators.has(generatorKey);
  }

  list() {
    return Array.from(this.generators.values());
  }

  clear() {
    this.generators.clear();
  }
}

export const contentGeneratorRegistry = new ContentGeneratorRegistry();