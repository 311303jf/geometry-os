/**
 * Geometry OS
 * Geometry Quiz Google Forms Exporter v1.0.0
 *
 * Responsibility:
 * Convert a quiz produced by the Geometry Quiz Composer into a plain
 * JSON payload shaped for the companion Google Apps Script
 * (docs/scripts/geometryQuizToGoogleForm.gs) to consume and build a
 * real, self-grading Google Form quiz via the FormApp service —
 * mirroring the Google Apps Script-based Google Classroom delivery
 * pattern already used for Algebra 1 (Forms generation, Guided
 * Support Practice docs), since Google Classroom is this platform's
 * primary real-world delivery surface, not printed paper.
 *
 * IMPORTANT LIMITATION, BY DESIGN:
 * Google Forms cannot render raw SVG markup. Any question whose
 * template requires a figure (identify_point_from_description,
 * identify_line_from_labels, and the other 10 figure-required
 * templates — see geometryFigureRenderer.getSupportedTemplateIds())
 * is EXCLUDED from the export rather than silently sent as
 * text-only-and-therefore-unanswerable. The exact count and template
 * IDs of every excluded question are reported back to the caller, so
 * nothing is silently dropped without the caller knowing. Composing
 * a quiz with explicit templateIds/conceptIds that avoid figure
 * templates avoids this exclusion entirely. Image support (rendering
 * each figure to PNG and attaching it to the Form question) is a
 * known, not-yet-built follow-up — see the architecture doc.
 *
 * This does NOT:
 * - call any Google API directly (no network access from this
 *   Node.js pipeline to Google's services) — it only produces the
 *   JSON payload; the actual Form is created by running the
 *   companion .gs script inside Google Apps Script, under the
 *   teacher's own Google account
 * - compose the quiz itself (see geometryQuizComposer.js)
 */

import { geometryFigureRenderer } from "./figures/geometryFigureRenderer.js";

const EXPORTER_VERSION = "v1.0.0";

function protectedCopy(value) {
  if (value === undefined) return undefined;
  return JSON.parse(JSON.stringify(value));
}

export class GeometryQuizGoogleFormsExporter {
  /**
   * @param {object} quiz - the `.quiz` object returned by a composed
   *   (`composed: true`) result from geometryQuizComposer.compose().
   * @param {object} [options]
   * @param {string} [options.title] - defaults to "Geometry Quiz".
   * @param {string} [options.description] - optional form description.
   * @param {number} [options.pointsPerQuestion] - defaults to 1.
   */
  exportForGoogleForm(quiz, options = {}) {
    if (!quiz || !Array.isArray(quiz.questions) || quiz.questions.length === 0) {
      return {
        exporterVersion: EXPORTER_VERSION,
        exported: false,
        payload: null,
        errors: [
          "Geometry Quiz Google Forms Exporter requires a composed quiz object " +
          "(the `.quiz` property of a geometryQuizComposer.compose() result) " +
          "with at least one question."
        ]
      };
    }

    const figureTemplateIds = new Set(
      geometryFigureRenderer.getSupportedTemplateIds()
    );

    const includedQuestions = [];
    const skippedQuestions = [];

    quiz.questions.forEach((question) => {
      const requiresFigure =
        figureTemplateIds.has(question.templateId) ||
        Boolean(question.figureSvg);

      if (requiresFigure) {
        skippedQuestions.push({
          questionNumber: question.questionNumber,
          templateId: question.templateId
        });
        return;
      }

      includedQuestions.push({
        promptText: question.promptText,
        choices: question.choices.map((choice) => ({
          text: String(choice.text),
          isCorrect: Boolean(choice.isCorrect)
        }))
      });
    });

    const pointsPerQuestion = Number.isInteger(options.pointsPerQuestion)
      ? options.pointsPerQuestion
      : 1;

    const payload = {
      title: options.title || "Geometry Quiz",
      description: options.description || "",
      isQuiz: true,
      pointsPerQuestion,
      questions: includedQuestions
    };

    return {
      exporterVersion: EXPORTER_VERSION,
      exported: true,
      payload: protectedCopy(payload),
      totalQuestionsRequested: quiz.questions.length,
      includedQuestionCount: includedQuestions.length,
      skippedQuestionCount: skippedQuestions.length,
      skippedQuestions: protectedCopy(skippedQuestions),
      errors: []
    };
  }

  getExporterVersion() {
    return EXPORTER_VERSION;
  }
}

export const geometryQuizGoogleFormsExporter =
  new GeometryQuizGoogleFormsExporter();

export { EXPORTER_VERSION };
