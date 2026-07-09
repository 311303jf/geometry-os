/**
 * Geometry OS
 * Teacher Playbook Generator v0.7.1
 *
 * Responsibility:
 * Generate a classroom-ready Teacher Playbook using the Teacher Playbook Composer.
 *
 * Important:
 * This generator does NOT publish.
 * It does NOT write files.
 * It only returns structured instructional content.
 */

import { teacherPlaybookComposer } from "../composers/teacherPlaybookComposer.js";

export class TeacherPlaybookGenerator {
  constructor({ composer = teacherPlaybookComposer } = {}) {
    this.generatorId = "teacher_playbook_generator";
    this.generatorName = "Teacher Playbook Generator";
    this.generatorVersion = "v0.7.1";
    this.assetType = "teacher_playbook";
    this.composer = composer;
  }

  generate(input = {}) {
    const generationContext = this.resolveGenerationContext(input);
    const composedContent = this.composer.compose(generationContext);

    return {
      status: "content_generated",
      generatorId: this.generatorId,
      generatorName: this.generatorName,
      generatorVersion: this.generatorVersion,
      assetType: this.assetType,
      title: `Teacher Playbook — ${composedContent.lesson.lessonTitle}`,
      lessonId: composedContent.lesson.lessonId,
      lessonTitle: composedContent.lesson.lessonTitle,
      content: composedContent,
      metadata: {
        generatedBy: this.generatorName,
        generatedAt: new Date().toISOString(),
        contentVersion: "v0.7.1-composed-content"
      }
    };
  }

  execute(input = {}) {
    return this.generate(input);
  }

  resolveGenerationContext(input = {}) {
    return input.generationContext || input.context || input;
  }
}

export const teacherPlaybookGenerator = new TeacherPlaybookGenerator();