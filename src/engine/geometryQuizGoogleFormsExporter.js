/**
 * Geometry OS
 * Geometry Quiz Google Forms Exporter v2.0.0
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
 * FIGURE SUPPORT (v2.0.0):
 * Google Forms cannot render raw SVG markup, so every question whose
 * template requires a figure (21 of 61 certified templates — see
 * geometryFigureRenderer.getSupportedTemplateIds()) is rendered to a
 * PNG image (via @resvg/resvg-js) and base64-encoded directly into
 * the exported JSON payload as `imageBase64Png`. The companion .gs
 * script decodes this and attaches it as a standalone ImageItem
 * immediately before the corresponding question — Google Forms'
 * MultipleChoiceItem has no documented setImage() method (verified
 * against the official Apps Script reference before writing this,
 * not assumed), so an adjacent ImageItem is the correct, documented
 * pattern instead of attaching the image to the question item
 * itself.
 *
 * v1.0.0 EXCLUDED figure questions entirely from the export — a real
 * content-loss problem this version fixes, since roughly a third of
 * the certified template set requires a figure.
 *
 * If SVG-to-PNG conversion fails for a specific question (should not
 * happen for any certified figure template, but handled defensively
 * rather than silently swallowed), that single question is excluded
 * and reported in skippedQuestions with the failure reason, rather
 * than crashing the whole export or silently sending a broken image.
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
import { Resvg } from "@resvg/resvg-js";

const EXPORTER_VERSION = "v2.0.0";

// The generated SVGs use width="100%" (meant for a browser/HTML
// context), which a standalone SVG renderer can't resolve — the
// same fix applied throughout this session's visual-verification
// work. A fixed pixel width is substituted before rendering.
const PNG_RENDER_WIDTH = 520;

function protectedCopy(value) {
  if (value === undefined) return undefined;
  return JSON.parse(JSON.stringify(value));
}

function svgToBase64Png(svg) {
  const renderableSvg = svg.replace('width="100%"', `width="${PNG_RENDER_WIDTH}"`);
  const resvg = new Resvg(renderableSvg, { background: "white" });
  const pngBuffer = resvg.render().asPng();
  return pngBuffer.toString("base64");
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
    let imageQuestionCount = 0;

    quiz.questions.forEach((question) => {
      const hasFigure =
        figureTemplateIds.has(question.templateId) &&
        Boolean(question.figureSvg);

      let imageBase64Png = null;

      if (hasFigure) {
        try {
          imageBase64Png = svgToBase64Png(question.figureSvg);
          imageQuestionCount += 1;
        } catch (error) {
          skippedQuestions.push({
            questionNumber: question.questionNumber,
            templateId: question.templateId,
            reason: `SVG-to-PNG conversion failed: ${error.message}`
          });
          return;
        }
      }

      includedQuestions.push({
        promptText: question.promptText,
        choices: question.choices.map((choice) => ({
          text: String(choice.text),
          isCorrect: Boolean(choice.isCorrect)
        })),
        imageBase64Png
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
      imageQuestionCount,
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
