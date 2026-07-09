/**
 * Geometry OS
 * Instructional Activity Composer v0.7.5
 *
 * Responsibility:
 * Compose reusable instructional activities from lesson data.
 *
 * Important:
 * This composer does NOT publish.
 * It does NOT write files.
 * It only creates structured activity blocks for generators and composers.
 */

import { lessonDataResolver } from "./lessonDataResolver.js";

export class InstructionalActivityComposer {
  constructor({ resolver = lessonDataResolver } = {}) {
    this.resolver = resolver;
  }

  composeActivities(generationContext = {}) {
    const lesson = this.resolver.resolve(generationContext);

    return {
      lesson: {
        lessonId: lesson.lessonId,
        lessonNumber: lesson.lessonNumber,
        lessonTitle: lesson.lessonTitle,
        standardTag: lesson.standardTag
      },

      activities: [
        this.buildLaunchActivity(lesson),
        this.buildTeacherModelActivity(lesson),
        this.buildGuidedPracticeActivity(lesson),
        this.buildPartnerTalkActivity(lesson),
        this.buildIndependentCheckActivity(lesson),
        this.buildExitReflectionActivity(lesson)
      ],

      metadata: {
        composerVersion: "v0.7.5",
        generatedBy: "InstructionalActivityComposer",
        generatedAt: new Date().toISOString()
      }
    };
  }

  buildLaunchActivity(lesson) {
    return {
      activityId: "launch_activity",
      activityType: "lesson_launch",
      title: "Launch Activity",
      purpose: "Activate prior knowledge and prepare students for the lesson focus.",
      studentPrompt: `What do you already know that may help you understand ${lesson.lessonTitle}?`,
      teacherMove: "Ask students to notice labels, symbols, diagrams, or vocabulary connected to the lesson.",
      supportLevel: "low_floor",
      dokLevel: 1
    };
  }

  buildTeacherModelActivity(lesson) {
    return {
      activityId: "teacher_model_activity",
      activityType: "teacher_model",
      title: "Teacher Model",
      purpose: "Model the thinking process students should use before practicing.",
      studentPrompt: "Watch how the diagram is analyzed before an answer is selected.",
      teacherMove: "Think aloud and point to the evidence that supports each decision.",
      supportLevel: "high_support",
      dokLevel: 1
    };
  }

  buildGuidedPracticeActivity(lesson) {
    return {
      activityId: "guided_practice_activity",
      activityType: "guided_practice",
      title: "Guided Practice",
      purpose: "Allow students to practice with teacher support.",
      studentPrompt: "Use the vocabulary and notation from the lesson to answer each question.",
      teacherMove: "Pause after each problem and ask students to justify their answer.",
      supportLevel: "medium_support",
      dokLevel: 2
    };
  }

  buildPartnerTalkActivity(lesson) {
    return {
      activityId: "partner_talk_activity",
      activityType: "student_discourse",
      title: "Partner Talk",
      purpose: "Build mathematical language through peer explanation.",
      studentPrompt: "Explain your reasoning to a partner using precise vocabulary.",
      teacherMove: "Listen for vocabulary accuracy and redirect informal language.",
      supportLevel: "collaborative_support",
      dokLevel: 2
    };
  }

  buildIndependentCheckActivity(lesson) {
    return {
      activityId: "independent_check_activity",
      activityType: "independent_check",
      title: "Independent Check",
      purpose: "Check whether students can apply the lesson independently.",
      studentPrompt: "Answer on your own and be ready to explain your reasoning.",
      teacherMove: "Use responses to decide whether students are ready for independent practice.",
      supportLevel: "independent",
      dokLevel: 2
    };
  }

  buildExitReflectionActivity(lesson) {
    return {
      activityId: "exit_reflection_activity",
      activityType: "lesson_closure",
      title: "Exit Reflection",
      purpose: "Summarize the key learning from the lesson.",
      studentPrompt: `What is one important idea you learned about ${lesson.lessonTitle}?`,
      teacherMove: "Look for evidence that students understand both vocabulary and meaning.",
      supportLevel: "independent",
      dokLevel: 3
    };
  }
}

export const instructionalActivityComposer =
  new InstructionalActivityComposer();