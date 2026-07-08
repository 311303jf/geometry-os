/**
 * Geometry OS
 * Bell Ringer Generator v0.3.8
 *
 * Responsibility:
 * Generate Bell Ringer content from a generation task and generation context.
 *
 * This generator does NOT publish.
 * This generator does NOT grade.
 * This generator does NOT write Google Classroom files.
 * This generator does NOT bypass the generation pipeline.
 */

export class BellRingerGenerator {
  generate({ generationTask, generationContext } = {}) {
    this.validate({ generationTask, generationContext });

    const lessonModel = generationContext.lessonModel || {};
    const instructionPlan = generationContext.instructionPlan || {};

    return {
      generatorId: "bell_ringer_generator",
      generatorVersion: "v0.3.8",
      assetType: generationTask.assetType || "bell_ringer",
      lessonId:
        lessonModel.lessonId ||
        instructionPlan.lessonId ||
        generationContext.lessonId ||
        null,
      lessonTitle:
        lessonModel.lessonTitle ||
        instructionPlan.lessonTitle ||
        null,
      title: this.buildTitle({ lessonModel, instructionPlan }),
      purpose: "Activate prerequisite knowledge before the lesson begins.",
      format: {
        questionCount: 3,
        questionType: "multiple_choice",
        choices: ["A", "B", "C", "D"]
      },
      items: this.buildItems({ lessonModel, instructionPlan }),
      metadata: {
        generatedBy: "BellRingerGenerator",
        generatedAt: new Date().toISOString()
      }
    };
  }

  validate({ generationTask, generationContext }) {
    if (!generationTask) {
      throw new Error("Bell Ringer Generator requires a generation task.");
    }

    if (!generationContext) {
      throw new Error("Bell Ringer Generator requires a generation context.");
    }
  }

  buildTitle({ lessonModel, instructionPlan }) {
    const lessonTitle =
      lessonModel.lessonTitle ||
      instructionPlan.lessonTitle ||
      "Geometry Lesson";

    return `Bell Ringer — ${lessonTitle}`;
  }

  buildItems({ lessonModel, instructionPlan }) {
    const requiredSkills =
      instructionPlan.requiredSkills ||
      lessonModel.requiredSkills ||
      [];

    const vocabulary =
      lessonModel.vocabulary ||
      instructionPlan.vocabulary ||
      [];

    return [
      {
        itemNumber: 1,
        prompt: this.buildSkillPrompt(requiredSkills),
        choices: {
          A: "A previously learned geometry skill",
          B: "A new skill from today’s lesson",
          C: "An unrelated calculation",
          D: "A final assessment question"
        },
        correctAnswer: "A",
        rationale:
          "Bell Ringers should activate prerequisite knowledge, not introduce the new lesson."
      },
      {
        itemNumber: 2,
        prompt: this.buildVocabularyPrompt(vocabulary),
        choices: {
          A: "A point",
          B: "A line",
          C: "A plane",
          D: "An angle"
        },
        correctAnswer: "A",
        rationale:
          "This item checks basic geometric language before new instruction begins."
      },
      {
        itemNumber: 3,
        prompt:
          "Which type of question is most appropriate for the start of class?",
        choices: {
          A: "A short review question",
          B: "A full quiz",
          C: "A new multi-step proof",
          D: "A final unit assessment"
        },
        correctAnswer: "A",
        rationale:
          "A Bell Ringer should be short, accessible, and based on prior knowledge."
      }
    ];
  }

  buildSkillPrompt(requiredSkills) {
    if (requiredSkills.length > 0) {
      return `Which skill should students review before this lesson? ${requiredSkills[0]}`;
    }

    return "Which skill should students review before beginning a geometry lesson?";
  }

  buildVocabularyPrompt(vocabulary) {
    if (vocabulary.length > 0) {
      return `Which vocabulary term may help students prepare for today’s lesson? ${vocabulary[0]}`;
    }

    return "Which basic geometry term should students understand before starting?";
  }
}

export const bellRingerGenerator = new BellRingerGenerator();