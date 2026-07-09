/**
 * Geometry OS
 * Learning Objectives Builder v0.7.2
 */

export class LearningObjectivesBuilder {
  build(lesson = {}) {
    const objectives = Array.isArray(lesson.objectives) && lesson.objectives.length
      ? lesson.objectives
      : [
          "Students will identify and describe basic geometric figures.",
          "Students will use correct geometric vocabulary and notation.",
          "Students will interpret diagrams using precise mathematical language."
        ];

    return {
      sectionId: "learning_objectives",
      title: "Learning Objectives",
      body: objectives
    };
  }
}

export const learningObjectivesBuilder = new LearningObjectivesBuilder();