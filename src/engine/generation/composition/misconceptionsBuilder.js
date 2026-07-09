/**
 * Geometry OS
 * Misconceptions Builder v0.7.2
 */

export class MisconceptionsBuilder {
  build(lesson = {}) {
    const misconceptions = Array.isArray(lesson.misconceptions) && lesson.misconceptions.length
      ? lesson.misconceptions
      : [
          "Students may confuse a line, segment, and ray.",
          "Students may reverse ray notation.",
          "Students may ignore arrows or endpoints in diagrams.",
          "Students may use informal language instead of geometric notation."
        ];

    return {
      sectionId: "common_misconceptions",
      title: "Common Misconceptions",
      body: misconceptions
    };
  }
}

export const misconceptionsBuilder = new MisconceptionsBuilder();