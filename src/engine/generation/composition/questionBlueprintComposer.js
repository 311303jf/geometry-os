/**
 * Geometry OS
 * Question Blueprint Composer v0.7.6
 *
 * Responsibility:
 * Compose question blueprints from lesson data.
 *
 * Important:
 * This composer does NOT generate final questions.
 * It does NOT create answer choices.
 * It does NOT publish.
 * It only creates structured question blueprints for future question generation.
 */

import { lessonDataResolver } from "./lessonDataResolver.js";

export class QuestionBlueprintComposer {
  constructor({ resolver = lessonDataResolver } = {}) {
    this.resolver = resolver;
  }

  composeBlueprints(generationContext = {}, options = {}) {
    const lesson = this.resolver.resolve(generationContext);

    const count = Number.isInteger(options.count) && options.count > 0
      ? options.count
      : 5;

    const resourceType = options.resourceType || "general_practice";

    const assessmentTargets = lesson.assessmentTargets.length
      ? lesson.assessmentTargets
      : [
          "Identify basic geometric figures.",
          "Use correct notation.",
          "Interpret diagrams using geometric vocabulary."
        ];

    const misconceptions = lesson.misconceptions.length
      ? lesson.misconceptions
      : [
          "Confusing lines, rays, and segments.",
          "Ignoring arrows or endpoints.",
          "Using informal language instead of geometric notation."
        ];

    const blueprints = Array.from({ length: count }, (_, index) => {
      const target = assessmentTargets[index % assessmentTargets.length];
      const misconception = misconceptions[index % misconceptions.length];

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
        composerVersion: "v0.7.6",
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
    return {
      blueprintId: `${resourceType}_blueprint_${index + 1}`,
      lessonId: lesson.lessonId,
      lessonTitle: lesson.lessonTitle,
      resourceType,
      skill: assessmentTarget,
      problemType: this.resolveProblemType(assessmentTarget),
      dokLevel: this.resolveDokLevel(index, resourceType),
      difficulty: this.resolveDifficulty(index, resourceType),
      requiresDiagram: this.resolveDiagramNeed(assessmentTarget),
      assessmentTarget,
      misconceptionFocus,
      answerFormat: "multiple_choice",
      choiceCount: 4,
      correctAnswerCount: 1,
      studentFacing: true,
      metadata: {
        generatedBy: "QuestionBlueprintComposer",
        blueprintVersion: "v0.7.6"
      }
    };
  }

  resolveProblemType(assessmentTarget = "") {
    const text = assessmentTarget.toLowerCase();

    if (text.includes("notation")) {
      return "geometric_notation";
    }

    if (text.includes("diagram")) {
      return "diagram_interpretation";
    }

    if (text.includes("identify")) {
      return "classification";
    }

    if (text.includes("difference") || text.includes("distinguish")) {
      return "compare_and_contrast";
    }

    return "conceptual_classification";
  }

  resolveDokLevel(index, resourceType) {
    if (resourceType === "exit_ticket") {
      return index === 0 ? 2 : 3;
    }

    if (resourceType === "quiz") {
      return index < 2 ? 1 : index < 4 ? 2 : 3;
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
      return index < 2 ? "easy" : index < 4 ? "medium" : "advanced";
    }

    if (resourceType === "exit_ticket") {
      return index === 0 ? "medium" : "advanced";
    }

    if (index < 2) {
      return "easy";
    }

    if (index < 4) {
      return "medium";
    }

    return "advanced";
  }

  resolveDiagramNeed(assessmentTarget = "") {
    const text = assessmentTarget.toLowerCase();

    return (
      text.includes("diagram") ||
      text.includes("identify") ||
      text.includes("figure") ||
      text.includes("geometric")
    );
  }
}

export const questionBlueprintComposer =
  new QuestionBlueprintComposer();