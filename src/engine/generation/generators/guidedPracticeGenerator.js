/**
 * Geometry OS
 * Guided Practice Generator v0.7.4
 */

import { guidedPracticeComposer } from "../composers/guidedPracticeComposer.js";

export class GuidedPracticeGenerator {
  constructor({ composer = guidedPracticeComposer } = {}) {
    this.generatorId = "guided_practice_generator";
    this.generatorName = "Guided Practice Generator";
    this.generatorVersion = "v0.7.4";
    this.assetType = "guided_practice";
    this.composer = composer;
  }

  generate(input = {}) {
    const generationContext =
      input.generationContext ||
      input.context ||
      input;

    const content = this.composer.compose(generationContext);

    return {
      status: "content_generated",
      generatorId: this.generatorId,
      generatorVersion: this.generatorVersion,
      assetType: this.assetType,
      lessonId: content.lesson.lessonId,
      lessonTitle: content.lesson.lessonTitle,
      content,
      metadata: {
        generatedAt: new Date().toISOString()
      }
    };
  }

  execute(input = {}) {
    return this.generate(input);
  }
}

export const guidedPracticeGenerator = new GuidedPracticeGenerator();