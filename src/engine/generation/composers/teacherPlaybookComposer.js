/**
 * Geometry OS
 * Teacher Playbook Composer v0.7.2
 *
 * Responsibility:
 * Compose a classroom-ready Teacher Playbook using shared lesson composition builders.
 */

import { lessonDataResolver } from "../composition/lessonDataResolver.js";
import { lessonOverviewBuilder } from "../composition/lessonOverviewBuilder.js";
import { learningObjectivesBuilder } from "../composition/learningObjectivesBuilder.js";
import { vocabularyBuilder } from "../composition/vocabularyBuilder.js";
import { misconceptionsBuilder } from "../composition/misconceptionsBuilder.js";

export class TeacherPlaybookComposer {
  constructor({
    resolver = lessonDataResolver,
    overviewBuilder = lessonOverviewBuilder,
    objectivesBuilder = learningObjectivesBuilder,
    vocabBuilder = vocabularyBuilder,
    misconceptionBuilder = misconceptionsBuilder
  } = {}) {
    this.resolver = resolver;
    this.overviewBuilder = overviewBuilder;
    this.objectivesBuilder = objectivesBuilder;
    this.vocabBuilder = vocabBuilder;
    this.misconceptionBuilder = misconceptionBuilder;
  }

  compose(generationContext = {}) {
    if (!generationContext || typeof generationContext !== "object") {
      throw new Error("Teacher Playbook Composer requires a generation context object.");
    }

    const lesson = this.resolver.resolve(generationContext);

    return {
      documentTitle: `Geometry Lesson ${lesson.lessonNumber} — ${lesson.lessonTitle}`,
      teacherFacing: true,
      lesson: {
        lessonId: lesson.lessonId,
        lessonNumber: lesson.lessonNumber,
        lessonTitle: lesson.lessonTitle,
        standardTag: lesson.standardTag,
        lessonPurpose: lesson.lessonPurpose
      },
      sections: [
        this.overviewBuilder.build(lesson),
        this.objectivesBuilder.build(lesson),
        this.vocabBuilder.build(lesson),
        this.buildPrerequisiteSkills(lesson),
        this.misconceptionBuilder.build(lesson),
        this.buildInstructionalFlow(),
        this.buildTeacherMoves(),
        this.buildChecksForUnderstanding(lesson),
        this.buildDifferentiationSupports(),
        this.buildAssessmentGuidance(),
        this.buildClosure()
      ],
      metadata: {
        composerVersion: "v0.7.2",
        generatedBy: "TeacherPlaybookComposer",
        generatedAt: new Date().toISOString()
      }
    };
  }

  buildPrerequisiteSkills(lesson) {
    const requiredSkills = Array.isArray(lesson.requiredSkills) && lesson.requiredSkills.length
      ? lesson.requiredSkills
      : [
          "Read and interpret simple diagrams.",
          "Use labels to identify parts of a figure.",
          "Follow multi-step visual directions."
        ];

    return {
      sectionId: "prerequisite_skills",
      title: "Prerequisite Skills",
      body: requiredSkills
    };
  }

  buildInstructionalFlow() {
    return {
      sectionId: "instructional_flow",
      title: "Suggested Instructional Flow",
      body: [
        "1. Launch with a short visual warm-up connected to prior knowledge.",
        "2. Introduce the key vocabulary using diagrams.",
        "3. Model how to name and describe figures accurately.",
        "4. Use guided practice to check understanding after each new term.",
        "5. Move students into independent practice once they can explain the difference between similar figures.",
        "6. Close with an exit ticket aligned to the lesson objectives."
      ]
    };
  }

  buildTeacherMoves() {
    return {
      sectionId: "teacher_moves",
      title: "High-Impact Teacher Moves",
      body: [
        "Ask students to justify how they know what type of figure they are seeing.",
        "Point students back to visual evidence: arrows, endpoints, labels, and shared vertices.",
        "Require students to use complete mathematical language rather than informal descriptions.",
        "When students make an error, ask which symbol or label changed the meaning.",
        "Use quick compare-and-contrast questions between similar figures."
      ]
    };
  }

  buildChecksForUnderstanding(lesson) {
    const assessmentTargets = Array.isArray(lesson.assessmentTargets) && lesson.assessmentTargets.length
      ? lesson.assessmentTargets
      : [
          "Identify geometric figures from diagrams.",
          "Use correct notation.",
          "Distinguish between related geometric terms."
        ];

    return {
      sectionId: "checks_for_understanding",
      title: "Checks for Understanding",
      body: assessmentTargets.map(
        (target) => `Check whether students can: ${target}`
      )
    };
  }

  buildDifferentiationSupports() {
    return {
      sectionId: "differentiation_supports",
      title: "Differentiation Supports",
      body: [
        "For students who need support: reduce visual clutter and present one figure at a time.",
        "For English learners: pair each vocabulary term with a diagram and a short definition.",
        "For students with IEP accommodations: provide guided notes and allow extended processing time.",
        "For advanced students: ask them to create their own diagram and write multiple valid names for the figures shown."
      ]
    };
  }

  buildAssessmentGuidance() {
    return {
      sectionId: "assessment_guidance",
      title: "Assessment Guidance",
      body: [
        "Students are ready to move forward when they can identify figures, explain their reasoning, and use correct notation.",
        "Watch for students who answer correctly by guessing from the diagram but cannot explain why.",
        "Use the exit ticket to determine whether students need recovery on vocabulary, notation, or diagram interpretation."
      ]
    };
  }

  buildClosure() {
    return {
      sectionId: "closure",
      title: "Closure",
      body: [
        "Ask students to explain why precise language matters in Geometry.",
        "Closing message: In Geometry, small symbols change meaning. Arrows, endpoints, labels, and order help us communicate exactly what figure we mean."
      ]
    };
  }
}

export const teacherPlaybookComposer = new TeacherPlaybookComposer();