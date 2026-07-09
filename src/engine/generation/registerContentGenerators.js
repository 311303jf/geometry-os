/**
 * Geometry OS
 * Register Content Generators v0.4.7
 *
 * Responsibility:
 * Register all specialized content generators with the
 * Content Generator Registry.
 */

import { bellRingerGenerator } from "./generators/BellRingerGenerator.js";
import { teacherPlaybookGenerator } from "./generators/TeacherPlaybookGenerator.js";
import { studentNotesGenerator } from "./generators/StudentNotesGenerator.js";
import { guidedPracticeGenerator } from "./generators/GuidedPracticeGenerator.js";
import { independentPracticeGenerator } from "./generators/IndependentPracticeGenerator.js";
import { homeworkGenerator } from "./generators/HomeworkGenerator.js";
import { exitTicketGenerator } from "./generators/ExitTicketGenerator.js";
import { quizGenerator } from "./generators/QuizGenerator.js";

export function registerContentGenerators({ registry }) {
  if (!registry) {
    throw new Error("registerContentGenerators requires a registry.");
  }

  registry.register("bell_ringer_generator", {
    generatorId: "bell_ringer_generator",
    generatorName: "Bell Ringer Generator",
    generatorVersion: bellRingerGenerator.version,
    assetType: "bell_ringer",
    generate: bellRingerGenerator.generate.bind(bellRingerGenerator)
  });

  registry.register("teacher_playbook_generator", {
    generatorId: "teacher_playbook_generator",
    generatorName: "Teacher Playbook Generator",
    generatorVersion: teacherPlaybookGenerator.version,
    assetType: "teacher_playbook",
    generate: teacherPlaybookGenerator.generate.bind(teacherPlaybookGenerator)
  });

  registry.register("student_notes_generator", {
    generatorId: "student_notes_generator",
    generatorName: "Student Notes Generator",
    generatorVersion: studentNotesGenerator.version,
    assetType: "student_notes",
    generate: studentNotesGenerator.generate.bind(studentNotesGenerator)
  });

  registry.register("guided_practice_generator", {
    generatorId: "guided_practice_generator",
    generatorName: "Guided Practice Generator",
    generatorVersion: guidedPracticeGenerator.version,
    assetType: "guided_practice",
    generate: guidedPracticeGenerator.generate.bind(guidedPracticeGenerator)
  });

  registry.register("independent_practice_generator", {
    generatorId: "independent_practice_generator",
    generatorName: "Independent Practice Generator",
    generatorVersion: independentPracticeGenerator.version,
    assetType: "independent_practice",
    generate: independentPracticeGenerator.generate.bind(independentPracticeGenerator)
  });

  registry.register("homework_generator", {
    generatorId: "homework_generator",
    generatorName: "Homework Generator",
    generatorVersion: homeworkGenerator.version,
    assetType: "homework",
    generate: homeworkGenerator.generate.bind(homeworkGenerator)
  });

  registry.register("exit_ticket_generator", {
    generatorId: "exit_ticket_generator",
    generatorName: "Exit Ticket Generator",
    generatorVersion: exitTicketGenerator.version,
    assetType: "exit_ticket",
    generate: exitTicketGenerator.generate.bind(exitTicketGenerator)
  });

  registry.register("quiz_generator", {
    generatorId: "quiz_generator",
    generatorName: "Quiz Generator",
    generatorVersion: quizGenerator.version,
    assetType: "quiz",
    generate: quizGenerator.generate.bind(quizGenerator)
  });

  return registry.list();
}