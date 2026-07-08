/**
 * Geometry OS
 * Teacher Playbook Generator v0.4.1
 *
 * Responsibility:
 * Generate a teacher-facing lesson playbook from a generation task
 * and generation context.
 *
 * This generator does NOT publish.
 * This generator does NOT grade.
 * This generator does NOT write files.
 * This generator does NOT bypass the generation pipeline.
 */

export class TeacherPlaybookGenerator {
  generate({ generationTask, generationContext } = {}) {
    this.validate({ generationTask, generationContext });

    const lessonModel = generationContext.lessonModel || {};
    const instructionPlan = generationContext.instructionPlan || {};
    const instructionSequence = generationContext.instructionSequence || {};
    const instructionDecisions = generationContext.instructionDecisions || {};

    return {
      generatorId: "teacher_playbook_generator",
      generatorVersion: "v0.4.1",
      assetType: generationTask.assetType || "teacher_playbook",
      lessonId:
        lessonModel.lessonId ||
        instructionPlan.lessonId ||
        generationContext.lessonId ||
        null,
      lessonTitle:
        lessonModel.lessonTitle ||
        instructionPlan.lessonTitle ||
        "Geometry Lesson",
      title: this.buildTitle({ lessonModel, instructionPlan }),
      audience: "teacher",
      purpose:
        "Provide the teacher with a clear instructional guide for delivering the lesson.",
      sections: [
        this.buildLessonOverview({ lessonModel, instructionPlan }),
        this.buildInstructionalGoals({ lessonModel, instructionPlan }),
        this.buildTeachingSequence(instructionSequence),
        this.buildTeacherMoves(instructionDecisions),
        this.buildMisconceptionSupport({ lessonModel, instructionPlan }),
        this.buildAssessmentLookFors({ lessonModel, instructionPlan })
      ],
      metadata: {
        generatedBy: "TeacherPlaybookGenerator",
        generatedAt: new Date().toISOString()
      }
    };
  }

  validate({ generationTask, generationContext }) {
    if (!generationTask) {
      throw new Error("Teacher Playbook Generator requires a generation task.");
    }

    if (!generationContext) {
      throw new Error("Teacher Playbook Generator requires a generation context.");
    }
  }

  buildTitle({ lessonModel, instructionPlan }) {
    const lessonTitle =
      lessonModel.lessonTitle ||
      instructionPlan.lessonTitle ||
      "Geometry Lesson";

    return `Teacher Playbook — ${lessonTitle}`;
  }

  buildLessonOverview({ lessonModel, instructionPlan }) {
    return {
      sectionTitle: "Lesson Overview",
      content: {
        course: lessonModel.course || null,
        unit: lessonModel.unit || null,
        lesson: lessonModel.lesson || null,
        lessonTitle:
          lessonModel.lessonTitle ||
          instructionPlan.lessonTitle ||
          null,
        standardTag: lessonModel.standardTag || null,
        lessonPurpose:
          lessonModel.lessonPurpose ||
          instructionPlan.lessonPurpose ||
          "Guide students toward the lesson objective."
      }
    };
  }

  buildInstructionalGoals({ lessonModel, instructionPlan }) {
    return {
      sectionTitle: "Instructional Goals",
      content: {
        objectives:
          instructionPlan.objectives ||
          lessonModel.objectives ||
          [],
        requiredSkills:
          instructionPlan.requiredSkills ||
          lessonModel.requiredSkills ||
          [],
        vocabulary:
          lessonModel.vocabulary ||
          instructionPlan.vocabulary ||
          []
      }
    };
  }

  buildTeachingSequence(instructionSequence) {
    return {
      sectionTitle: "Teaching Sequence",
      content: {
        sequence:
          instructionSequence.sequence ||
          instructionSequence.steps ||
          [],
        teacherNote:
          "Use the sequence to move from prerequisite activation to guided instruction, practice, and evidence of learning."
      }
    };
  }

  buildTeacherMoves(instructionDecisions) {
    return {
      sectionTitle: "Teacher Moves",
      content: {
        decisions:
          instructionDecisions.decisions ||
          instructionDecisions.teacherMoves ||
          [],
        guidance:
          "Monitor student responses, pause for misconceptions, and adjust pacing based on evidence."
      }
    };
  }

  buildMisconceptionSupport({ lessonModel, instructionPlan }) {
    return {
      sectionTitle: "Misconception Support",
      content: {
        misconceptions:
          lessonModel.misconceptions ||
          instructionPlan.misconceptions ||
          [],
        teacherAction:
          "Address misconceptions through questioning, visual examples, and short corrective feedback."
      }
    };
  }

  buildAssessmentLookFors({ lessonModel, instructionPlan }) {
    return {
      sectionTitle: "Assessment Look-Fors",
      content: {
        assessmentTargets:
          lessonModel.assessmentTargets ||
          instructionPlan.assessmentTargets ||
          [],
        evidence:
          "Students should explain, identify, or apply the target geometry language accurately."
      }
    };
  }
}

export const teacherPlaybookGenerator = new TeacherPlaybookGenerator();