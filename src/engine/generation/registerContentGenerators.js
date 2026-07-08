/**
 * Geometry OS
 * Register Content Generators v0.4.0
 *
 * Responsibility:
 * Register specialized content generator contracts.
 *
 * This file does NOT generate content.
 * This file does NOT execute generators.
 * This file does NOT publish resources.
 */

import { contentGeneratorRegistry } from "./contentGeneratorRegistry.js";
import { bellRingerGenerator } from "./generators/bellRingerGenerator.js";

export function registerContentGenerators({
  registry = contentGeneratorRegistry
} = {}) {
  registry.register("bell_ringer_generator", {
    name: "Bell Ringer Generator",
    responsibility:
      "Generate Bell Ringer resources from generation tasks and generation context.",
    supportedAssetTypes: ["bell_ringer"],
    requiredInputFields: ["generationTask", "generationContext"],
    outputContract: {
      generatorId: "string",
      generatorVersion: "string",
      assetType: "string",
      lessonId: "string|null",
      lessonTitle: "string|null",
      title: "string",
      purpose: "string",
      format: "object",
      items: "array",
      metadata: "object"
    },
    status: "active",
    generate: bellRingerGenerator.generate.bind(bellRingerGenerator)
  });

  return registry.list();
}