/**
 * Geometry OS
 * Curriculum Engine v0.2.1
 *
 * Responsibility:
 * Transform a Lesson Blueprint into an intelligent Lesson Model.
 *
 * The Curriculum Engine does not generate questions.
 * It does not publish resources.
 * It prepares instructional intelligence for other engines.
 */

export class CurriculumEngine {
  buildLessonModel(lessonBlueprint) {
    this.validateBlueprint(lessonBlueprint);

    return {
      id: lessonBlueprint.id,
      course: lessonBlueprint.course,
      unit: lessonBlueprint.unit,
      lesson: lessonBlueprint.lesson,
      title: lessonBlueprint.lessonTitle,

      concepts: this.extractConcepts(lessonBlueprint),
      prerequisiteSkills: this.extractPrerequisiteSkills(lessonBlueprint),
      misconceptions: this.extractMisconceptions(lessonBlueprint),
      assessmentTargets: this.extractAssessmentTargets(lessonBlueprint),
      learningPath: this.buildLearningPath(lessonBlueprint),
      recoveryPlan: this.buildRecoveryPlan(lessonBlueprint),

      metadata: {
        modelVersion: "v0.2.1",
        sourceBlueprintId: lessonBlueprint.id,
        generatedBy: "CurriculumEngine",
        generatedAt: new Date().toISOString()
      }
    };
  }

  validateBlueprint(blueprint) {
    if (!blueprint) {
      throw new Error("Curriculum Engine requires a Lesson Blueprint.");
    }

    if (!blueprint.id) {
      throw new Error("Lesson Blueprint is missing id.");
    }

    if (!blueprint.lessonTitle) {
  throw new Error("Lesson Blueprint is missing lessonTitle.");
}
  }

  extractConcepts(blueprint) {
    return blueprint.concepts || [];
  }

  extractPrerequisiteSkills(blueprint) {
    return blueprint.requiredSkills || [];
}

  extractMisconceptions(blueprint) {
    return blueprint.misconceptions || [];
  }

  extractAssessmentTargets(blueprint) {
    return blueprint.assessmentTargets || [];
  }

buildLearningPath(blueprint) {
  const objectives = blueprint.objectives || [];
  const vocabulary = blueprint.vocabulary || [];

  return objectives.map((objective, index) => ({
    step: index + 1,
    objective,
    vocabularySupport: vocabulary,
    instructionalPurpose: "Develop understanding before assessment.",
    status: "planned"
  }));
}

  buildRecoveryPlan(blueprint) {
    const misconceptions = this.extractMisconceptions(blueprint);

    return misconceptions.map((misconception, index) => ({
      recoveryStep: index + 1,
      misconception,
      intervention: "Use targeted explanation, visual support, and guided practice.",
      status: "ready"
    }));
  }
}

export const curriculumEngine = new CurriculumEngine();