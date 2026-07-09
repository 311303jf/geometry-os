/**
 * Geometry OS
 * Question Blueprint Composer v0.7.7
 *
 * Responsibility:
 * Compose question blueprints from lesson data.
 *
 * Important:
 * This composer does NOT generate final questions.
 * It does NOT create answer choices.
 * It only creates blueprint metadata.
 */

import { lessonDataResolver } from "./lessonDataResolver.js";

export class QuestionBlueprintComposer {
  constructor({ resolver = lessonDataResolver } = {}) {
    this.resolver = resolver;
  }

  composeBlueprints(generationContext = {}, options = {}) {
    const lesson = this.resolver.resolve(generationContext);

    const count =
      Number.isInteger(options.count) && options.count > 0
        ? options.count
        : 5;

    const resourceType = options.resourceType || "general_practice";

    const assessmentTargets =
      lesson.assessmentTargets?.length
        ? lesson.assessmentTargets
        : [
            "Identify basic geometric figures.",
            "Use correct notation.",
            "Compare geometric figures."
          ];

    const misconceptions =
      lesson.misconceptions?.length
        ? lesson.misconceptions
        : [
            "Confusing lines, rays, and segments.",
            "Ignoring arrows or endpoints.",
            "Using informal language instead of geometric notation."
          ];

    const blueprints = Array.from({ length: count }, (_, index) => {
      const target =
        assessmentTargets[index % assessmentTargets.length];

      const misconception =
        misconceptions[index % misconceptions.length];

      return this.buildBlueprint({
        lesson,
        index,
        resourceType,
        assessmentTarget: target,
        misconceptionFocus: misconception
      });
    });

    return {
      status: "question_blueprints_composed",
      composerVersion: "v0.7.7",
      lesson: {
        lessonId: lesson.lessonId,
        lessonNumber: lesson.lessonNumber,
        lessonTitle: lesson.lessonTitle,
        standardTag: lesson.standardTag
      },
      resourceType,
      blueprintCount: blueprints.length,
      blueprints,
      metadata: {
        composerVersion: "v0.7.7",
        generatedBy: "QuestionBlueprintComposer",
        generatedAt: new Date().toISOString()
      }
    };
  }

  buildBlueprint({
    lesson,
    index,
    resourceType,
    assessmentTarget,
    misconceptionFocus
  }) {
    const target = this.normalizeTextValue(assessmentTarget);
    const misconception = this.normalizeTextValue(misconceptionFocus);

    return {
      blueprintId: `${resourceType}_blueprint_${index + 1}`,
      lessonId: lesson.lessonId,
      lessonTitle: lesson.lessonTitle,
      resourceType,
      skill: target,
      problemType: this.resolveProblemType(target),
      dokLevel: this.resolveDokLevel(index, resourceType),
      difficulty: this.resolveDifficulty(index, resourceType),
      requiresDiagram: this.resolveDiagramNeed(target),
      assessmentTarget: target,
      misconceptionFocus: misconception,
      answerFormat: "multiple_choice",
      choiceCount: 4,
      correctAnswerCount: 1,
      studentFacing: true,
      metadata: {
        generatedBy: "QuestionBlueprintComposer",
        blueprintVersion: "v0.7.7"
      }
    };
  }

  resolveProblemType(target = "") {
    const text = this.normalizeTextValue(target).toLowerCase();

    /* ---------- Highest priority ---------- */

    if (
      text.includes("compare") ||
      text.includes("contrast") ||
      text.includes("different") ||
      text.includes("difference") ||
      text.includes("between") ||
      text.includes("distinguish")
    ) {
      return "compare_and_contrast";
    }

    if (
      text.includes("notation") ||
      text.includes("symbol") ||
      text.includes("name")
    ) {
      return "geometric_notation";
    }

    if (
      text.includes("identify") ||
      text.includes("classify") ||
      text.includes("classification") ||
      text.includes("point") ||
      text.includes("line") ||
      text.includes("ray") ||
      text.includes("segment") ||
      text.includes("plane") ||
      text.includes("figure")
    ) {
      return "classification";
    }

    if (text.includes("diagram")) {
      return "diagram_interpretation";
    }

    return "conceptual_classification";
  }

  resolveDokLevel(index, resourceType) {
    if (resourceType === "quiz") {
      if (index < 2) return 1;
      if (index < 4) return 2;
      return 3;
    }

    if (resourceType === "exit_ticket") {
      return index === 0 ? 2 : 3;
    }

    if (resourceType === "independent_practice") {
      return index < 2 ? 1 : 2;
    }

    if (resourceType === "homework") {
      return index < 3 ? 1 : 2;
    }

    return index < 2 ? 1 : 2;
  }

  resolveDifficulty(index, resourceType) {
    if (resourceType === "quiz") {
      if (index < 2) return "easy";
      if (index < 4) return "medium";
      return "advanced";
    }

    if (resourceType === "exit_ticket") {
      return index === 0 ? "medium" : "advanced";
    }

    if (index < 2) return "easy";
    if (index < 4) return "medium";

    return "advanced";
  }

  resolveDiagramNeed(target = "") {
    const text = this.normalizeTextValue(target).toLowerCase();

    return (
      text.includes("diagram") ||
      text.includes("figure") ||
      text.includes("point") ||
      text.includes("line") ||
      text.includes("ray") ||
      text.includes("segment") ||
      text.includes("plane") ||
      text.includes("geometric")
    );
  }

  normalizeTextValue(value = "") {
    if (typeof value === "string") {
      return value;
    }

    if (Array.isArray(value)) {
      return value
        .map((v) => this.normalizeTextValue(v))
        .filter(Boolean)
        .join(" ");
    }

    if (value && typeof value === "object") {
      return Object.values(value)
        .map((v) => this.normalizeTextValue(v))
        .filter(Boolean)
        .join(" ");
    }

    return "";
  }
}

export const questionBlueprintComposer =
  new QuestionBlueprintComposer();