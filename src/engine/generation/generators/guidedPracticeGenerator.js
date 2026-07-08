/**
 * Geometry OS
 * Guided Practice Generator v0.4.3
 *
 * Responsibility:
 * Generate student-facing guided practice from generation tasks
 * and generation context.
 */

export class GuidedPracticeGenerator {
  generate({ generationTask, generationContext } = {}) {
    if (!generationTask) {
      throw new Error("Guided Practice Generator requires a generation task.");
    }

    if (!generationContext || typeof generationContext !== "object") {
      throw new Error("Guided Practice Generator requires a generation context.");
    }

    const lesson =
      generationContext.lessonModel ||
      generationContext.lesson ||
      {};

    const instructionPlan = generationContext.instructionPlan || {};
    const requiredSkills = instructionPlan.requiredSkills || [];
    const objectives = instructionPlan.objectives || [];

    return {
      generatorId: "guided_practice_generator",
      generatorVersion: "v0.4.3",
      assetType: generationTask.assetType || "guided_practice",
      lessonId: lesson.lessonId || instructionPlan.lessonId || null,
      lessonTitle: lesson.lessonTitle || null,
      title: `Guided Practice — ${lesson.lessonTitle || "Geometry Lesson"}`,
      purpose:
        "Help students practice the lesson concept with structured support before independent work.",
      format: {
        practiceType: "guided",
        teacherLed: true,
        studentResponseRequired: true,
        includesScaffolding: true
      },
      sections: this.buildSections({
        lesson,
        requiredSkills,
        objectives
      }),
      metadata: {
        generatedBy: "GuidedPracticeGenerator",
        generatedAt: new Date().toISOString()
      }
    };
  }

  buildSections({ lesson, requiredSkills, objectives }) {
    const skills =
      requiredSkills.length > 0
        ? requiredSkills
        : objectives.length > 0
          ? objectives
          : ["Use lesson vocabulary and reasoning to solve geometry problems."];

    return skills.map((skill, index) => ({
      sectionNumber: index + 1,
      skillFocus: skill,
      teacherPrompt:
        "Guide students through the problem by asking what information is given, what is being asked, and what vocabulary applies.",
      studentTask:
        "Work through the example. Write each step and be ready to explain your reasoning.",
      scaffoldedExample: this.buildExample(skill, lesson, index),
      guidedQuestions: [
        "What information is given?",
        "What vocabulary term or idea connects to this problem?",
        "What is the next logical step?",
        "How can you justify your answer?"
      ],
      checkForUnderstanding:
        "Students should be able to explain the answer using precise geometric language."
    }));
  }

  buildExample(skill, lesson, index) {
    const vocabulary = lesson.vocabulary || [];
    const term = vocabulary[index] || vocabulary[0] || "geometric figure";

    return {
      problem:
        `Example ${index + 1}: Use the term "${term}" correctly in a geometry statement related to ${skill}.`,
      steps: [
        "Identify the key vocabulary in the problem.",
        "Match the vocabulary to the correct geometric idea.",
        "Write a clear statement using precise mathematical language.",
        "Check that the statement answers the question."
      ],
      answerFrame:
        `A correct response should use "${term}" accurately and explain the idea clearly.`
    };
  }
}

export const guidedPracticeGenerator = new GuidedPracticeGenerator();