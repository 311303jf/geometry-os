/**
 * Geometry OS
 * Homework Generator v0.7.8
 *
 * Responsibility:
 * Generate a Homework resource using the
 * blueprint-driven Homework Composer.
 *
 * Important:
 * This generator does NOT generate final questions yet.
 * It does NOT generate answer choices yet.
 */

import { homeworkComposer } from "../composers/homeworkComposer.js";

export class HomeworkGenerator {
  generate({
    lessonModel,
    generationContext = {},
    resourceType = "homework",
    count = 12
  } = {}) {
    const composedResource = homeworkComposer.compose({
      lessonModel,
      generationContext,
      resourceType,
      count
    });

    return {
      generatorId: "homework_generator",
      generatorVersion: "v0.7.8",
      assetType: "homework",
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

export const homeworkGenerator = new HomeworkGenerator();