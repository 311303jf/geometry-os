/**
 * Geometry OS
 * Student Notes Composer v0.7.3
 *
 * Responsibility:
 * Compose classroom-ready Student Notes using the shared Lesson Composition Library.
 */

import { lessonDataResolver } from "../composition/lessonDataResolver.js";
import { lessonOverviewBuilder } from "../composition/lessonOverviewBuilder.js";
import { learningObjectivesBuilder } from "../composition/learningObjectivesBuilder.js";
import { vocabularyBuilder } from "../composition/vocabularyBuilder.js";

export class StudentNotesComposer {
  constructor({
    resolver = lessonDataResolver,
    overviewBuilder = lessonOverviewBuilder,
    objectivesBuilder = learningObjectivesBuilder,
    vocabBuilder = vocabularyBuilder
  } = {}) {
    this.resolver = resolver;
    this.overviewBuilder = overviewBuilder;
    this.objectivesBuilder = objectivesBuilder;
    this.vocabBuilder = vocabBuilder;
  }

  compose(generationContext = {}) {
    const lesson = this.resolver.resolve(generationContext);

    return {
      documentTitle: `Student Notes — ${lesson.lessonTitle}`,
      studentFacing: true,

      lesson: {
        lessonId: lesson.lessonId,
        lessonNumber: lesson.lessonNumber,
        lessonTitle: lesson.lessonTitle,
        standardTag: lesson.standardTag
      },

      sections: [
        this.overviewBuilder.build(lesson),
        this.objectivesBuilder.build(lesson),
        this.vocabBuilder.build(lesson),
        this.buildKeyIdeas(),
        this.buildExamples(),
        this.buildSummary()
      ],

      metadata: {
        composerVersion: "v0.7.3",
        generatedBy: "StudentNotesComposer",
        generatedAt: new Date().toISOString()
      }
    };
  }

  buildKeyIdeas() {
    return {
      sectionId: "key_ideas",
      title: "Key Ideas",
      body: [
        "Points represent exact locations.",
        "Lines extend forever in two directions.",
        "Segments have two endpoints.",
        "Rays have one endpoint.",
        "Correct notation communicates mathematical meaning."
      ]
    };
  }

  buildExamples() {
    return {
      sectionId: "worked_examples",
      title: "Worked Examples",
      body: [
        "Example 1: Identify a line segment.",
        "Example 2: Name a ray correctly.",
        "Example 3: Distinguish a line from a segment."
      ]
    };
  }

  buildSummary() {
    return {
      sectionId: "lesson_summary",
      title: "Lesson Summary",
      body: [
        "Use precise vocabulary.",
        "Pay attention to arrows and endpoints.",
        "Always use correct notation."
      ]
    };
  }
}

export const studentNotesComposer = new StudentNotesComposer();