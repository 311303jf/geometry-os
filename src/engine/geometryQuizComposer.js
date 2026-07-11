/**
 * Geometry OS
 * Geometry Quiz Composer v1.0.0
 *
 * Responsibility:
 * Assemble a full, classroom-ready quiz of N certified questions,
 * using the Geometry Certified Question Factory to produce each
 * individual question.
 *
 * This exists because the Factory (previous commit) produces exactly
 * ONE certified question at a time — the natural next need for any
 * real classroom use is "give me a 10-question quiz," which requires
 * choosing WHICH templates to use, avoiding accidental duplicates,
 * optionally restricting to specific concepts (e.g. only Chapter 10 /
 * circles), and producing deterministic, reproducible results from a
 * single quiz-level seed.
 *
 * This composer does NOT:
 * - invent any new question content (every question comes from the
 *   already-certified Factory)
 * - perform final quality-gate certification (see
 *   questionQualityGate.js, a separate, still-unconnected legacy
 *   engine)
 * - persist or export the quiz to any file format
 */

import { geometryCertifiedQuestionFactory } from "./geometryCertifiedQuestionFactory.js";
import { geometryTemplateRegistry } from "../geometry/templates/geometryTemplateRegistry.js";
import { geometryProblemTypeRegistry } from "../geometry/problemTypes/geometryProblemTypeRegistry.js";

const COMPOSER_VERSION = "v1.0.0";

const COMPOSER_STATUS = Object.freeze({
  COMPOSED: "geometry_quiz_composed",
  REJECTED: "geometry_quiz_rejected"
});

function protectedCopy(value) {
  if (value === undefined) return undefined;
  return JSON.parse(JSON.stringify(value));
}

function hashString(value = "") {
  let hash = 2166136261;

  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
}

function createSeededRandom(seedValue) {
  let state = hashString(String(seedValue)) || 1;

  return function random() {
    state += 0x6d2b79f5;

    let value = state;

    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);

    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle(random, values = []) {
  const result = [...values];

  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));

    [result[index], result[swapIndex]] = [
      result[swapIndex],
      result[index]
    ];
  }

  return result;
}

function createRejectedResult(errors) {
  return {
    composerVersion: COMPOSER_VERSION,
    status: COMPOSER_STATUS.REJECTED,
    composed: false,
    quiz: null,
    errors: protectedCopy(errors)
  };
}

function createComposedResult({ seed, questions, templateIdsUsed }) {
  return {
    composerVersion: COMPOSER_VERSION,
    status: COMPOSER_STATUS.COMPOSED,
    composed: true,
    quiz: {
      seed,
      questionCount: questions.length,
      questions: protectedCopy(questions),
      templateIdsUsed: protectedCopy(templateIdsUsed)
    },
    errors: []
  };
}

export class GeometryQuizComposer {
  /**
   * @param {object} input
   * @param {number} input.questionCount - how many questions to produce.
   * @param {string[]} [input.conceptIds] - restrict the template pool
   *   to these concept areas (e.g. ["circles", "similarity"]). If
   *   omitted, all certified templates are eligible.
   * @param {string[]} [input.templateIds] - restrict to these exact
   *   templateIds instead of filtering by concept. Takes precedence
   *   over conceptIds if both are given.
   * @param {boolean} [input.allowRepeatTemplates] - if false
   *   (default), no templateId is used more than once, and the
   *   composer rejects if questionCount exceeds the eligible pool
   *   size. If true, templates may repeat (each still gets an
   *   independent random seed, so repeated templates produce
   *   different variable values, not identical questions).
   * @param {string|number} [input.seed] - quiz-level seed; the same
   *   seed always produces the same quiz.
   */
  compose(input = {}) {
    const questionCount = Number(input.questionCount);
    const seed = input.seed ?? `quiz:${Date.now()}`;
    const allowRepeatTemplates = Boolean(input.allowRepeatTemplates);

    if (!Number.isInteger(questionCount) || questionCount <= 0) {
      return createRejectedResult([
        "Geometry Quiz Composer requires a positive integer questionCount."
      ]);
    }

    const allTemplates = geometryTemplateRegistry.listTemplates();

    let eligibleTemplateIds;

    if (Array.isArray(input.templateIds) && input.templateIds.length > 0) {
      const requestedSet = new Set(input.templateIds);
      eligibleTemplateIds = allTemplates
        .filter((template) => requestedSet.has(template.templateId))
        .map((template) => template.templateId);
    } else if (
      Array.isArray(input.conceptIds) &&
      input.conceptIds.length > 0
    ) {
      // Concept is stored on the problem type record, not the
      // template record directly, so we cross-reference: build a
      // templateId -> conceptId lookup from both certified
      // registries, then filter by it. This is the correct, exact
      // filter (not a substring guess against templateId text).
      const problemTypesById = new Map(
        geometryProblemTypeRegistry
          .listProblemTypes()
          .map((problemType) => [
            problemType.problemTypeId,
            problemType.conceptId
          ])
      );

      const requestedConcepts = new Set(input.conceptIds);

      eligibleTemplateIds = allTemplates
        .filter((template) =>
          requestedConcepts.has(problemTypesById.get(template.problemTypeId))
        )
        .map((template) => template.templateId);
    } else {
      eligibleTemplateIds = allTemplates.map(
        (template) => template.templateId
      );
    }

    if (eligibleTemplateIds.length === 0) {
      return createRejectedResult([
        "No certified templates matched the given templateIds/conceptIds filter."
      ]);
    }

    if (!allowRepeatTemplates && questionCount > eligibleTemplateIds.length) {
      return createRejectedResult([
        `Requested ${questionCount} questions with allowRepeatTemplates=false, but only ${eligibleTemplateIds.length} eligible templates are available. Either reduce questionCount, widen the filter, or set allowRepeatTemplates=true.`
      ]);
    }

    const random = createSeededRandom(seed);
    const shuffledPool = shuffle(random, eligibleTemplateIds);

    const chosenTemplateIds = [];

    if (allowRepeatTemplates) {
      for (let i = 0; i < questionCount; i += 1) {
        chosenTemplateIds.push(
          shuffledPool[i % shuffledPool.length]
        );
      }
    } else {
      chosenTemplateIds.push(...shuffledPool.slice(0, questionCount));
    }

    const questions = [];
    const errors = [];

    chosenTemplateIds.forEach((templateId, index) => {
      const questionSeed = `${seed}:q${index}:${templateId}`;

      const factoryResult = geometryCertifiedQuestionFactory.generate({
        templateId,
        seed: questionSeed,
        generationIndex: index
      });

      if (!factoryResult.certified) {
        errors.push(
          `Question ${index + 1} (${templateId}) failed at the ${factoryResult.failedStage} stage: ${(factoryResult.errors || []).join(" ")}`
        );
        return;
      }

      questions.push({
        questionNumber: index + 1,
        templateId,
        promptText: factoryResult.question.promptText,
        choices: factoryResult.question.choices,
        correctChoiceLabel: factoryResult.question.correctChoiceLabel,
        figureSvg: factoryResult.question.figureSvg
      });
    });

    if (errors.length > 0) {
      return createRejectedResult(errors);
    }

    return createComposedResult({
      seed,
      questions,
      templateIdsUsed: chosenTemplateIds
    });
  }

  getComposerVersion() {
    return COMPOSER_VERSION;
  }
}

export const geometryQuizComposer = new GeometryQuizComposer();

export { COMPOSER_VERSION, COMPOSER_STATUS };
