/**
 * Math Teacher OS
 * Lesson Orchestrator v1.0
 *
 * Responsibility:
 * Coordinate lesson generation workflows.
 *
 * Important:
 * The orchestrator does not generate questions.
 * It does not certify questions.
 * It does not publish to Google Classroom.
 *
 * It coordinates engines that perform those jobs.
 */

import { eventBus } from "./eventBus.js";
import { engineRegistry } from "./engineRegistry.js";

export class LessonOrchestrator {
  constructor({ registry = engineRegistry, events = eventBus } = {}) {
    this.registry = registry;
    this.events = events;
  }

  generateLesson(request) {
    this.validateRequest(request);

    this.events.emit("LESSON_GENERATION_REQUESTED", {
      course: request.course,
      unit: request.unit,
      lesson: request.lesson,
      resourceTypes: request.resourceTypes
    });

    const lessonPlan = {
      id: this.createLessonRunId(),
      status: "orchestration_started",
      course: request.course,
      unit: request.unit,
      lesson: request.lesson,
      resourceTypes: request.resourceTypes,
      requiredEngines: this.getRequiredEngines(),
      availableEngines: this.registry.list(),
      createdAt: new Date().toISOString()
    };

    this.events.emit("LESSON_ORCHESTRATION_STARTED", lessonPlan);

    return {
      success: true,
      message: "Lesson orchestration started successfully.",
      lessonPlan,
      events: this.events.getAllEvents()
    };
  }

  validateRequest(request) {
    if (!request || typeof request !== "object") {
      throw new Error("Lesson generation request must be an object.");
    }

    if (!request.course) {
      throw new Error("Lesson generation request requires a course.");
    }

    if (!request.unit) {
      throw new Error("Lesson generation request requires a unit.");
    }

    if (!request.lesson) {
      throw new Error("Lesson generation request requires a lesson.");
    }

    if (
      !Array.isArray(request.resourceTypes) ||
      request.resourceTypes.length === 0
    ) {
      throw new Error(
        "Lesson generation request requires at least one resource type."
      );
    }
  }

  getRequiredEngines() {
    return [
      "curriculumEngine",
      "generationEngine",
      "standardsEngine",
      "pedagogyEngine",
      "solverEngine",
      "distractorEngine",
      "qualityEngine",
      "coverageEngine",
      "duplicateEngine",
      "recoveryEngine",
      "finalCertificationEngine",
      "publishingEngine"
    ];
  }

  createLessonRunId() {
    const timestamp = Date.now();
    const randomPart = Math.random().toString(36).slice(2, 8);
    return `LESSON-RUN-${timestamp}-${randomPart}`;
  }
}

export const lessonOrchestrator = new LessonOrchestrator();