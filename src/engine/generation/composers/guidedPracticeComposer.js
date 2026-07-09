/**
 * Geometry OS
 * Guided Practice Composer v0.7.4
 *
 * Responsibility:
 * Compose classroom-ready Guided Practice using shared lesson data.
 */

import { lessonDataResolver } from "../composition/lessonDataResolver.js";

export class GuidedPracticeComposer {
  constructor({ resolver = lessonDataResolver } = {}) {
    this.resolver = resolver;
  }

  compose(generationContext = {}) {
    const lesson = this.resolver.resolve(generationContext);

    return {
      documentTitle: `Guided Practice — ${lesson.lessonTitle}`,
      studentFacing: true,
      teacherSupported: true,

      lesson: {
        lessonId: lesson.lessonId,
        lessonNumber: lesson.lessonNumber,
        lessonTitle: lesson.lessonTitle,
        standardTag: lesson.standardTag
      },

      sections: [
        this.buildPracticePurpose(lesson),
        this.buildTeacherModel(),
        this.buildGuidedProblems(),
        this.buildTurnAndTalk(),
        this.buildQuickCheck()
      ],

      metadata: {
        composerVersion: "v0.7.4",
        generatedBy: "GuidedPracticeComposer",
        generatedAt: new Date().toISOString()
      }
    };
  }

  buildPracticePurpose(lesson) {
    return {
      sectionId: "practice_purpose",
      title: "Practice Purpose",
      body: [
        `In this guided practice, students apply the key ideas from ${lesson.lessonTitle}.`,
        "Students should explain their thinking while using correct vocabulary and notation."
      ]
    };
  }

  buildTeacherModel() {
    return {
      sectionId: "teacher_model",
      title: "Teacher Model",
      body: [
        "Model how to inspect the diagram before choosing an answer.",
        "Point out arrows, endpoints, labels, and shared vertices.",
        "Ask students to name the figure and explain the evidence."
      ]
    };
  }

  buildGuidedProblems() {
    return {
      sectionId: "guided_problems",
      title: "Guided Problems",
      body: [
        {
          problemId: "guided_problem_1",
          prompt: "A figure has two endpoints. What type of figure is it?",
          answer: "Segment",
          teacherPrompt: "Ask: What tells us the figure does not continue forever?"
        },
        {
          problemId: "guided_problem_2",
          prompt: "A figure has one endpoint and extends forever in one direction. What type of figure is it?",
          answer: "Ray",
          teacherPrompt: "Ask: Which point must be named first?"
        },
        {
          problemId: "guided_problem_3",
          prompt: "A straight path extends forever in both directions. What type of figure is it?",
          answer: "Line",
          teacherPrompt: "Ask: What do the arrows mean?"
        }
      ]
    };
  }

  buildTurnAndTalk() {
    return {
      sectionId: "turn_and_talk",
      title: "Turn and Talk",
      body: [
        "Explain to your partner how a line, ray, and segment are different.",
        "Use the words endpoint, arrow, and extends forever in your explanation."
      ]
    };
  }

  buildQuickCheck() {
    return {
      sectionId: "quick_check",
      title: "Quick Check",
      body: [
        "Students should be able to identify whether a diagram shows a line, segment, or ray.",
        "Students should justify their answer using visual evidence."
      ]
    };
  }
}

export const guidedPracticeComposer = new GuidedPracticeComposer();