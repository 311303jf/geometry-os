/**
 * Geometry OS
 * Lesson Data Resolver v0.7.2
 *
 * Responsibility:
 * Resolve normalized lesson data from generation context.
 */

export class LessonDataResolver {
  resolve(context = {}) {
    if (!context || typeof context !== "object") {
      throw new Error("Lesson Data Resolver requires a context object.");
    }

    const lessonModel =
      context.lessonModel ||
      context.lesson ||
      context.curriculumLesson ||
      {};

    return {
      lessonId:
        lessonModel.lessonId ||
        lessonModel.id ||
        context.lessonId ||
        "Geometry-1.1",

      lessonNumber:
        lessonModel.lesson ||
        lessonModel.lessonNumber ||
        context.lessonNumber ||
        "1.1",

      lessonTitle:
        lessonModel.lessonTitle ||
        lessonModel.title ||
        context.lessonTitle ||
        "The Language of Geometry",

      standardTag:
        lessonModel.standardTag ||
        context.standardTag ||
        "Geometry",

      lessonPurpose:
        lessonModel.lessonPurpose ||
        context.lessonPurpose ||
        "Build foundational geometric language and notation.",

      objectives: Array.isArray(lessonModel.objectives)
        ? lessonModel.objectives
        : [],

      vocabulary: Array.isArray(lessonModel.vocabulary)
        ? lessonModel.vocabulary
        : [],

      requiredSkills: Array.isArray(lessonModel.requiredSkills)
        ? lessonModel.requiredSkills
        : [],

      misconceptions: Array.isArray(lessonModel.misconceptions)
        ? lessonModel.misconceptions
        : [],

      assessmentTargets: Array.isArray(lessonModel.assessmentTargets)
        ? lessonModel.assessmentTargets
        : []
    };
  }
}

export const lessonDataResolver = new LessonDataResolver();