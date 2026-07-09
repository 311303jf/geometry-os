/**
 * Geometry OS
 * Quiz Generator v0.8.0
 *
 * Responsibility:
 * Generate the quiz resource through the certified Quiz Composer.
 *
 * Important:
 * This generator does NOT generate final questions yet.
 * It delegates quiz structure to quizComposer.
 */

import { quizComposer } from "../composers/quizComposer.js";

export class QuizGenerator {
  generate(input = {}) {
    const generatedResource = quizComposer.compose(input);

    return {
      ...generatedResource,
      generatorId: "quiz_generator",
      generatorVersion: "v0.8.0",
      metadata: {
        ...generatedResource.metadata,
        composerVersion: generatedResource.composerVersion
      }
    };
  }
}

export const quizGenerator = new QuizGenerator();