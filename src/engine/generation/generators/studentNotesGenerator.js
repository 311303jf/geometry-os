/**
 * Geometry OS
 * Student Notes Generator v0.7.3
 */

import { studentNotesComposer } from "../composers/studentNotesComposer.js";

export class StudentNotesGenerator {
  constructor({
    composer = studentNotesComposer
  } = {}) {
    this.generatorId = "student_notes_generator";
    this.generatorName = "Student Notes Generator";
    this.generatorVersion = "v0.7.3";
    this.assetType = "student_notes";
    this.composer = composer;
  }

  generate(input = {}) {
    const generationContext =
      input.generationContext ||
      input.context ||
      input;

    const content = this.composer.compose(generationContext);

    return {
      status: "content_generated",
      generatorId: this.generatorId,
      generatorVersion: this.generatorVersion,
      assetType: this.assetType,
      lessonId: content.lesson.lessonId,
      lessonTitle: content.lesson.lessonTitle,
      content,
      metadata: {
        generatedAt: new Date().toISOString()
      }
    };
  }

  execute(input = {}) {
    return this.generate(input);
  }
}

export const studentNotesGenerator =
  new StudentNotesGenerator();