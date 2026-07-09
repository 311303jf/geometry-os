/**
 * Geometry OS
 * Lesson Overview Builder v0.7.2
 */

export class LessonOverviewBuilder {
  build(lesson = {}) {
    return {
      sectionId: "lesson_overview",
      title: "Lesson Overview",
      body: [
        `This lesson focuses on ${lesson.lessonTitle}.`,
        lesson.lessonPurpose,
        `Standard focus: ${lesson.standardTag}.`,
        "The goal is to help students connect diagrams, vocabulary, notation, and precise mathematical language."
      ]
    };
  }
}

export const lessonOverviewBuilder = new LessonOverviewBuilder();