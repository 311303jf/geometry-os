/**
 * Geometry OS
 * Student Notes Generator v0.4.2
 *
 * Responsibility:
 * Generate structured student-facing lesson notes from generation tasks
 * and generation context.
 */

export class StudentNotesGenerator {
  generate({ generationTask, generationContext } = {}) {
    if (!generationTask) {
      throw new Error("Student Notes Generator requires a generation task.");
    }

    if (!generationContext || typeof generationContext !== "object") {
      throw new Error("Student Notes Generator requires a generation context.");
    }

    const lesson =
      generationContext.lessonModel ||
      generationContext.lesson ||
      {};

    const instructionPlan = generationContext.instructionPlan || {};

    return {
      generatorId: "student_notes_generator",
      generatorVersion: "v0.4.2",
      assetType: generationTask.assetType || "student_notes",
      lessonId: lesson.lessonId || instructionPlan.lessonId || null,
      lessonTitle: lesson.lessonTitle || null,
      content: {
        title: this.buildTitle(lesson),
        lessonOverview: this.buildLessonOverview(lesson),
        learningGoals: this.buildLearningGoals(instructionPlan),
        vocabulary: this.buildVocabulary(lesson),
        prerequisiteReview: this.buildPrerequisiteReview(instructionPlan),
        guidedNotes: this.buildGuidedNotes(instructionPlan),
        keyTakeaways: this.buildKeyTakeaways(lesson, instructionPlan),
        studentReflection: this.buildStudentReflection()
      },
      metadata: {
        generatedBy: "StudentNotesGenerator",
        generatedAt: new Date().toISOString()
      }
    };
  }

  buildTitle(lesson) {
    return `Student Notes — ${lesson.lessonTitle || "Geometry Lesson"}`;
  }

  buildLessonOverview(lesson) {
    return {
      purpose:
        lesson.lessonPurpose ||
        "Build understanding of the lesson concept through vocabulary, examples, and guided notes.",
      studentFriendlyDescription:
        "In this lesson, you will record important ideas, study examples, and prepare to explain your reasoning clearly."
    };
  }

  buildLearningGoals(instructionPlan) {
    const objectives = instructionPlan.objectives || [];

    if (!Array.isArray(objectives) || objectives.length === 0) {
      return [
        {
          goal: "Understand the main concept of the lesson.",
          successCriteria:
            "I can explain the idea and use it correctly in a problem."
        }
      ];
    }

    return objectives.map((objective) => ({
      goal: objective,
      successCriteria:
        "I can show my work, explain my reasoning, and choose the correct answer."
    }));
  }

  buildVocabulary(lesson) {
    const vocabulary = lesson.vocabulary || [];

    return vocabulary.map((term) => ({
      term,
      studentDefinition: "",
      example: ""
    }));
  }

  buildPrerequisiteReview(instructionPlan) {
    const requiredSkills = instructionPlan.requiredSkills || [];

    return {
      heading: "Before You Begin",
      prompts:
        requiredSkills.length > 0
          ? requiredSkills.map((skill) => `Review: ${skill}`)
          : [
              "What do you already know that can help you in this lesson?",
              "What vocabulary or skills should you review first?"
            ]
    };
  }

  buildGuidedNotes(instructionPlan) {
    const requiredSkills = instructionPlan.requiredSkills || [];

    if (requiredSkills.length === 0) {
      return [
        {
          sectionTitle: "Main Idea",
          notesPrompt:
            "Write the main idea of the lesson in your own words.",
          examplePrompt:
            "Copy one example and explain each step."
        }
      ];
    }

    return requiredSkills.map((skill, index) => ({
      sectionTitle: `Part ${index + 1}: ${skill}`,
      notesPrompt:
        "Write the important idea from this part of the lesson.",
      examplePrompt:
        "Record one example and explain why each step is correct."
    }));
  }

  buildKeyTakeaways(lesson, instructionPlan) {
    const vocabulary = lesson.vocabulary || [];
    const objectives = instructionPlan.objectives || [];

    return [
      ...objectives.slice(0, 2),
      ...vocabulary.slice(0, 3).map((term) => `Use the term "${term}" correctly.`)
    ];
  }

  buildStudentReflection() {
    return {
      prompts: [
        "One thing I understand well is:",
        "One thing I still need to practice is:",
        "One question I have is:"
      ]
    };
  }
}

export const studentNotesGenerator = new StudentNotesGenerator();