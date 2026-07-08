/**
 * Geometry OS
 * Content Generator Registry v0.3.1
 *
 * Responsibility:
 * Register and resolve future content generators dynamically.
 *
 * Important:
 * This registry does NOT generate instructional content.
 * It only stores generator contracts for the Content Generation Layer.
 */

export class ContentGeneratorRegistry {
  constructor() {
    this.generators = new Map();
  }

  register(generatorKey, generatorContract) {
    if (!generatorKey || typeof generatorKey !== "string") {
      throw new Error("Content Generator Registry requires a valid generator key.");
    }

    if (!generatorContract || typeof generatorContract !== "object") {
      throw new Error(`Invalid generator contract for: ${generatorKey}`);
    }

    const contract = {
      key: generatorKey,
      name: generatorContract.name || generatorKey,
      responsibility: generatorContract.responsibility || "Future content generator",
      status: generatorContract.status || "registered_placeholder",
      supportedAssetTypes: generatorContract.supportedAssetTypes || [],
      outputContract: generatorContract.outputContract || {},
      generate: generatorContract.generate || null
    };

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