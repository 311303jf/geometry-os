/**
 * Geometry OS
 * Independent Practice Generator v0.7.7
 *
 * Responsibility:
 * Generate an Independent Practice resource using the
 * blueprint-driven Independent Practice Composer.
 *
 * Important:
 * This generator does NOT generate final questions yet.
 * It does NOT generate answer choices yet.
 */

import { independentPracticeComposer } from "../composers/independentPracticeComposer.js";

export class IndependentPracticeGenerator {
  generate({
    lessonModel,
    generationContext = {},
    resourceType = "independent_practice",
    count = 15
  } = {}) {
    const composedResource = independentPracticeComposer.compose({
      lessonModel,
      generationContext,
      resourceType,
      count
    });

    return {
      generatorId: "independent_practice_generator",
      generatorVersion: "v0.7.7",
      assetType: "independent_practice",
      lessonId: composedResource.lessonId,
      lessonTitle: composedResource.lessonTitle,
      sections: composedResource.sections,
      metadata: {
        ...composedResource.metadata,
        composerId: composedResource.composerId,
        composerVersion: composedResource.composerVersion
      }
    };
  }
}

export const independentPracticeGenerator = new IndependentPracticeGenerator();