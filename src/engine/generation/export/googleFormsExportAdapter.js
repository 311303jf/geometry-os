/**
 * Geometry OS
 * Google Forms Export Adapter v0.9.5
 *
 * Responsibility:
 * Convert a Final Question Export Contract into a Google Forms-ready
 * payload structure.
 *
 * Important:
 * This adapter does NOT publish to Google Forms.
 * It does NOT call Google APIs.
 * It does NOT generate questions.
 * It only prepares a stable payload for future publishing.
 */

export class GoogleFormsExportAdapter {
  adapt({
    exportContract
  } = {}) {
    if (!exportContract) {
      throw new Error("Google Forms Export Adapter requires exportContract.");
    }

    const questions = exportContract.questions || [];

    return {
      adapterId: "google_forms_export_adapter",
      adapterVersion: "v0.9.5",
      exportTarget: "google_forms",
      sourceContractId: exportContract.contractId,
      sourceContractVersion: exportContract.contractVersion,
      form: {
        title: this.buildTitle(exportContract),
        description: this.buildDescription(exportContract),
        settings: {
          isQuiz: true,
          collectEmail: false,
          shuffleQuestions: false,
          showMissedQuestions: false,
          showCorrectAnswers: false,
          showPointValues: true
        },
        items: questions.map((question) =>
          this.buildMultipleChoiceItem(question)
        )
      },
      answerKey: questions.map((question) =>
        this.buildAnswerKeyItem(question)
      ),
      metadata: {
        generatedBy: "GoogleFormsExportAdapter",
        questionCount: questions.length,
        readyForPublishing: questions.length > 0,
        callsGoogleApi: false,
        publishesResource: false
      }
    };
  }

  buildTitle(exportContract) {
    return `${exportContract.lessonTitle} Quiz`;
  }

  buildDescription(exportContract) {
    return [
      `Lesson: ${exportContract.lessonId}`,
      "Answer all multiple-choice questions.",
      "Each question has four answer choices and one correct answer."
    ].join("\n");
  }

  buildMultipleChoiceItem(question) {
    return {
      itemId: question.questionId,
      title: question.prompt,
      type: "multiple_choice",
      required: true,
      choices: question.choices.map((choice) => ({
        label: choice.label,
        text: choice.text
      })),
      points: 1,
      feedback: {
        correct: question.explanation,
        incorrect: "Review the lesson and try again."
      },
      metadata: {
        itemNumber: question.itemNumber,
        blueprintId: question.blueprintId,
        skill: question.metadata?.skill,
        problemType: question.metadata?.problemType,
        dokLevel: question.metadata?.dokLevel,
        difficulty: question.metadata?.difficulty
      }
    };
  }

  buildAnswerKeyItem(question) {
    return {
      itemId: question.questionId,
      itemNumber: question.itemNumber,
      correctChoice: question.answerKey.correctChoice,
      correctAnswer: question.answerKey.correctAnswer
    };
  }
}

export const googleFormsExportAdapter =
  new GoogleFormsExportAdapter();