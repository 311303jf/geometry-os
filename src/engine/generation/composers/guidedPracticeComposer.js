/**
 * Geometry OS
 * Guided Practice Composer v0.7.5
 *
 * Responsibility:
 * Compose classroom-ready Guided Practice using shared lesson data and instructional activities.
 */

import { lessonDataResolver } from "../composition/lessonDataResolver.js";
import { instructionalActivityComposer } from "../composition/instructionalActivityComposer.js";

export class GuidedPracticeComposer {
  constructor({
    resolver = lessonDataResolver,
    activityComposer = instructionalActivityComposer
  } = {}) {
    this.resolver = resolver;
    this.activityComposer = activityComposer;
  }

  compose(generationContext = {}) {
    const lesson = this.resolver.resolve(generationContext);
    const activitySet = this.activityComposer.composeActivities(generationContext);

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
        this.buildActivitySequence(activitySet.activities),
        this.buildGuidedProblems(),
        this.buildTeacherPrompts(activitySet.activities),
        this.buildQuickCheck()
      ],

      metadata: {
        composerVersion: "v0.7.5",
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

  buildActivitySequence(activities = []) {
    return {
      sectionId: "activity_sequence",
      title: "Instructional Activity Sequence",
      body: activities.map((activity) => ({
        activityId: activity.activityId,
        title: activity.title,
        purpose: activity.purpose,
        supportLevel: activity.supportLevel,
        dokLevel: activity.dokLevel
      }))
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

  buildTeacherPrompts(activities = []) {
    return {
      sectionId: "teacher_prompts",
      title: "Teacher Prompts",
      body: activities.map((activity) => activity.teacherMove)
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