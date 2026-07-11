/**
 * Geometry OS
 * Geometry Certified Question Factory v1.0.0
 *
 * Responsibility:
 * Assemble one complete, classroom-ready multiple-choice question
 * for any of the certified Geometry templates, by orchestrating the
 * six certified engines in the correct order:
 *
 *   Geometry Template Resolver
 *        v
 *   Geometry Variable Generator
 *        v
 *   Geometry Solver
 *        v
 *   Geometry Distractor Engine
 *        v
 *   Geometry Prompt Renderer
 *        v
 *   Geometry Figure Renderer (only for the 12 templates that need one)
 *
 * This exists because, without it, every caller (a quiz composer, a
 * worksheet builder, a classroom app) has to manually chain all six
 * engines in the right order with the right field names every single
 * time a question is needed — a real integration burden and a real
 * source of subtle bugs (e.g. forgetting to pass acceptableAnswers
 * into the Distractor Engine). This factory is that chain, done once,
 * certified, and tested against all 50 certified templates.
 *
 * This factory is NOT a new source of truth: it does not compute
 * anything itself. Every value it returns was computed by one of the
 * six engines above. If a stage rejects, this factory reports exactly
 * which stage failed and why, rather than partially succeeding.
 *
 * This factory does NOT:
 * - certify final question quality (see questionQualityGate.js, a
 *   separate, not-yet-connected engine)
 * - shuffle/paginate a full quiz of multiple questions
 * - persist or cache generated questions
 */

import { geometryTemplateResolver } from "../geometry/templates/geometryTemplateResolver.js";
import { geometryVariableGenerator } from "../geometry/generation/geometryVariableGenerator.js";
import { geometrySolver } from "./solver/geometrySolver.js";
import { geometryDistractorEngine } from "./distractors/geometryDistractorEngine.js";
import { geometryPromptRenderer } from "./prompts/geometryPromptRenderer.js";
import { geometryFigureRenderer } from "./figures/geometryFigureRenderer.js";

const FACTORY_VERSION = "v1.0.0";

const FACTORY_STATUS = Object.freeze({
  CERTIFIED: "geometry_question_certified",
  REJECTED: "geometry_question_rejected"
});

const STAGE = Object.freeze({
  RESOLVER: "resolver",
  GENERATOR: "generator",
  SOLVER: "solver",
  DISTRACTORS: "distractors",
  RENDERER: "renderer",
  FIGURE: "figure"
});

function protectedCopy(value) {
  if (value === undefined) return undefined;
  return JSON.parse(JSON.stringify(value));
}

function normalizeString(value) {
  return typeof value === "string" ? value.trim() : "";
}

function createRejectedResult({
  stage,
  templateId = null,
  problemTypeId = null,
  errors = []
}) {
  return {
    factoryVersion: FACTORY_VERSION,
    status: FACTORY_STATUS.REJECTED,
    certified: false,
    failedStage: stage,
    templateId,
    problemTypeId,
    question: null,
    errors: protectedCopy(errors)
  };
}

function createCertifiedResult({
  templateId,
  problemTypeId,
  seed,
  variables,
  correctAnswer,
  acceptableAnswers,
  distractors,
  promptText,
  choices,
  correctChoiceLabel,
  figureSvg
}) {
  return {
    factoryVersion: FACTORY_VERSION,
    status: FACTORY_STATUS.CERTIFIED,
    certified: true,
    failedStage: null,
    templateId,
    problemTypeId,
    seed,
    question: {
      promptText,
      choices: protectedCopy(choices),
      correctChoiceLabel,
      figureSvg: figureSvg || null
    },
    // Full audit trail — every intermediate value that produced the
    // final question, in case a caller needs to inspect or log the
    // certification chain (e.g. for teacher-facing "show your work"
    // or for debugging a reported bad question).
    audit: {
      variables: protectedCopy(variables),
      correctAnswer: protectedCopy(correctAnswer),
      acceptableAnswers: protectedCopy(acceptableAnswers),
      distractors: protectedCopy(distractors)
    },
    errors: []
  };
}

export class GeometryCertifiedQuestionFactory {
  generate(input = {}) {
    const templateId = normalizeString(input.templateId);
    const problemTypeId = normalizeString(input.problemTypeId);
    const seed = input.seed ?? `${templateId}:factory`;
    const generationIndex = input.generationIndex ?? 0;

    if (!templateId) {
      return createRejectedResult({
        stage: STAGE.RESOLVER,
        problemTypeId,
        errors: [
          "Geometry Certified Question Factory requires a templateId."
        ]
      });
    }

    const resolution = geometryTemplateResolver.resolve({
      templateId,
      problemTypeId
    });

    if (!resolution.resolved) {
      return createRejectedResult({
        stage: STAGE.RESOLVER,
        templateId,
        problemTypeId,
        errors: resolution.errors
      });
    }

    const generation = geometryVariableGenerator.generate(resolution, {
      seed,
      generationIndex
    });

    if (!generation.generated) {
      return createRejectedResult({
        stage: STAGE.GENERATOR,
        templateId,
        problemTypeId: resolution.problemTypeId,
        errors: generation.errors
      });
    }

    const solved = geometrySolver.solve({
      templateId,
      problemTypeId: resolution.problemTypeId,
      variables: generation.variables
    });

    if (!solved.solved) {
      return createRejectedResult({
        stage: STAGE.SOLVER,
        templateId,
        problemTypeId: resolution.problemTypeId,
        errors: solved.errors
      });
    }

    const distractorResult = geometryDistractorEngine.generate({
      templateId,
      problemTypeId: resolution.problemTypeId,
      variables: generation.variables,
      correctAnswer: solved.correctAnswer,
      acceptableAnswers: solved.acceptableAnswers
    });

    if (
      !distractorResult.generated ||
      !Array.isArray(distractorResult.distractors) ||
      distractorResult.distractors.length !== 3
    ) {
      return createRejectedResult({
        stage: STAGE.DISTRACTORS,
        templateId,
        problemTypeId: resolution.problemTypeId,
        errors: distractorResult.errors
      });
    }

    const rendered = geometryPromptRenderer.render({
      templateId,
      problemTypeId: resolution.problemTypeId,
      variables: generation.variables,
      correctAnswer: solved.correctAnswer,
      distractors: distractorResult.distractors,
      seed
    });

    if (
      !rendered.rendered ||
      !Array.isArray(rendered.choices) ||
      rendered.choices.length !== 4
    ) {
      return createRejectedResult({
        stage: STAGE.RENDERER,
        templateId,
        problemTypeId: resolution.problemTypeId,
        errors: rendered.errors
      });
    }

    let figureSvg = null;

    if (geometryFigureRenderer.supportsTemplate(templateId)) {
      const figureResult = geometryFigureRenderer.render({
        templateId,
        variables: generation.variables
      });

      if (!figureResult.rendered) {
        return createRejectedResult({
          stage: STAGE.FIGURE,
          templateId,
          problemTypeId: resolution.problemTypeId,
          errors: figureResult.errors
        });
      }

      figureSvg = figureResult.svg;
    }

    return createCertifiedResult({
      templateId,
      problemTypeId: resolution.problemTypeId,
      seed,
      variables: generation.variables,
      correctAnswer: solved.correctAnswer,
      acceptableAnswers: solved.acceptableAnswers,
      distractors: distractorResult.distractors,
      promptText: rendered.promptText,
      choices: rendered.choices,
      correctChoiceLabel: rendered.correctChoiceLabel,
      figureSvg
    });
  }

  supportsTemplate(templateId) {
    return geometryVariableGenerator.supportsTemplate(
      normalizeString(templateId)
    );
  }

  getSupportedTemplateIds() {
    return geometryVariableGenerator.getSupportedTemplateIds();
  }

  getFactoryVersion() {
    return FACTORY_VERSION;
  }
}

export const geometryCertifiedQuestionFactory =
  new GeometryCertifiedQuestionFactory();

export { FACTORY_VERSION, FACTORY_STATUS };
