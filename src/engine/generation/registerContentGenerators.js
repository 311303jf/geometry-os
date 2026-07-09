/**
 * Geometry OS
 * Register Content Generators v0.4.4
 *
 * Responsibility:
 * Register specialized content generator contracts.
 *
 * This file does NOT generate content.
 * This file does NOT execute generators.
 * This file does NOT publish resources.
 */

import { contentGeneratorRegistry } from "./contentGeneratorRegistry.js";
import { bellRingerGenerator } from "./generators/bellRingerGenerator.js";
import { teacherPlaybookGenerator } from "./generators/teacherPlaybookGenerator.js";
import { studentNotesGenerator } from "./generators/studentNotesGenerator.js";
import { guidedPracticeGenerator } from "./generators/guidedPracticeGenerator.js";
import { independentPracticeGenerator } from "./generators/independentPracticeGenerator.js";
import { homeworkGenerator } from "./generators/homeworkGenerator.js";

export function registerContentGenerators({
  registry = contentGeneratorRegistry
} = {}) {
  registry.register("bell_ringer_generator", {
    name: "Bell Ringer Generator",
    responsibility:
      "Generate Bell Ringer resources from generation tasks and generation context.",
    supportedAssetTypes: ["bell_ringer"],
    requiredInputFields: ["generationTask", "generationContext"],
    outputContract: {
      generatorId: "string",
      generatorVersion: "string",
      assetType: "string",
      lessonId: "string|null",
      lessonTitle: "string|null",
      title: "string",
      purpose: "string",
      format: "object",
      items: "array",
      metadata: "object"
    },
    status: "active",
    generate: bellRingerGenerator.generate.bind(bellRingerGenerator)
  });

  registry.register("teacher_playbook_generator", {
    name: "Teacher Playbook Generator",
    responsibility:
      "Generate teacher-facing lesson playbooks from generation tasks and generation context.",
    supportedAssetTypes: ["teacher_playbook"],
    requiredInputFields: ["generationTask", "generationContext"],
    outputContract: {
      generatorId: "string",
      generatorVersion: "string",
      assetType: "string",
      lessonId: "string|null",
      lessonTitle: "string|null",
      title: "string",
      audience: "string",
      purpose: "string",
      sections: "array",
      metadata: "object"
    },
    status: "active",
    generate: teacherPlaybookGenerator.generate.bind(teacherPlaybookGenerator)
  });

  registry.register("student_notes_generator", {
    name: "Student Notes Generator",
    responsibility:
      "Generate student-facing lesson notes from generation tasks and generation context.",
    supportedAssetTypes: ["student_notes"],
    requiredInputFields: ["generationTask", "generationContext"],
    outputContract: {
      generatorId: "string",
      generatorVersion: "string",
      assetType: "string",
      executionId: "string",
      queueId: "string",
      status: "string",
      content: "object",
      metadata: "object"
    },
    status: "active",
    generate: studentNotesGenerator.generate.bind(studentNotesGenerator)
  });

  registry.register("guided_practice_generator", {
    name: "Guided Practice Generator",
    responsibility:
      "Generate guided practice resources from generation tasks and generation context.",
    supportedAssetTypes: ["guided_practice"],
    requiredInputFields: ["generationTask", "generationContext"],
    outputContract: {
      generatorId: "string",
      generatorVersion: "string",
      assetType: "string",
      lessonId: "string|null",
      lessonTitle: "string|null",
      title: "string",
      purpose: "string",
      format: "object",
      sections: "array",
      metadata: "object"
    },
    status: "active",
    generate: guidedPracticeGenerator.generate.bind(guidedPracticeGenerator)
  });

  registry.register("independent_practice_generator", {
    name: "Independent Practice Generator",
    responsibility:
      "Generate independent practice resources from generation tasks and generation context.",
    supportedAssetTypes: ["independent_practice"],
    requiredInputFields: ["generationTask", "generationContext"],
    outputContract: {
      generatorId: "string",
      generatorVersion: "string",
      assetType: "string",
      lessonId: "string|null",
      title: "string",
      purpose: "object",
      studentFacingInstructions: "array",
      practiceStructure: "object",
      assessmentContract: "object",
      metadata: "object"
    },
    status: "active",
    generate: independentPracticeGenerator.generate.bind(independentPracticeGenerator)
  });
  registry.register("homework_generator", {
    name: "Homework Generator",
    responsibility:
      "Generate homework resources from generation tasks and generation context.",
    supportedAssetTypes: ["homework"],
    requiredInputFields: ["generationTask", "generationContext"],
    outputContract: {
      generatorId: "string",
      generatorVersion: "string",
      assetType: "string",
      lessonId: "string|null",
      title: "string",
      purpose: "object",
      studentFacingInstructions: "array",
      homeworkStructure: "object",
      assessmentContract: "object",
      metadata: "object"
    },
    status: "active",
    generate: homeworkGenerator.generate.bind(homeworkGenerator)
  });
  return registry.list();
}