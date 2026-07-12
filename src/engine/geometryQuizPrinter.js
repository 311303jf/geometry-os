/**
 * Geometry OS
 * Geometry Quiz Printer v1.0.0
 *
 * Responsibility:
 * Render a quiz produced by the Geometry Quiz Composer into a
 * complete, standalone, printable HTML document — a student version
 * (questions only) and, optionally, a teacher version with an answer
 * key appended.
 *
 * This exists because a composed quiz, on its own, is just an array
 * of JavaScript objects in memory — not something a teacher can hand
 * to a class. This is the final step from "certified question data"
 * to "thing you can print or open in a browser tomorrow morning."
 *
 * This is a NEW, self-contained exporter, not a wrapper around the
 * existing publisher stubs in src/engine/publishing/ (htmlPublisher.js
 * etc.), which are placeholders from a different, older architecture
 * that don't actually render content — they just echo back a config
 * object. Building on top of them would have meant implementing all
 * of the real rendering logic here anyway, so this is a direct,
 * simpler path from Quiz Composer output to an actual HTML file.
 *
 * This does NOT:
 * - compose the quiz itself (see geometryQuizComposer.js)
 * - export to PDF/DOCX directly (the output HTML is print-ready —
 *   a browser's own "Print to PDF" converts it losslessly)
 */

const PRINTER_VERSION = "v1.0.0";

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const BASE_STYLES = `
  body {
    font-family: Georgia, 'Times New Roman', serif;
    color: #1a1a1a;
    max-width: 800px;
    margin: 0 auto;
    padding: 40px 32px;
    line-height: 1.5;
  }
  .quiz-header {
    border-bottom: 2px solid #1a1a1a;
    padding-bottom: 12px;
    margin-bottom: 28px;
  }
  .quiz-header h1 {
    font-size: 22px;
    margin: 0 0 4px 0;
  }
  .quiz-meta {
    display: flex;
    justify-content: space-between;
    font-size: 14px;
    color: #333;
    margin-top: 10px;
  }
  .name-line {
    border-bottom: 1px solid #999;
    display: inline-block;
    min-width: 220px;
    margin-left: 6px;
  }
  .question {
    margin-bottom: 26px;
    page-break-inside: avoid;
  }
  .question-number {
    font-weight: bold;
    margin-right: 6px;
  }
  .question-prompt {
    margin: 0 0 10px 0;
  }
  .question-figure {
    margin: 10px 0;
    max-width: 360px;
  }
  .question-figure svg {
    max-width: 100%;
    height: auto;
    /* The Figure Renderer's SVGs reference this custom property for
       every stroke/fill (lines, points, text). Without it defined
       here, var(--text-primary) resolves to an INVALID value: stroke
       falls back to its initial value of "none" (rays/segments/
       arcs become invisible), while fill falls back to black (dots
       still show) — which is exactly the bug a real exported quiz
       revealed: points visible, lines and angle values not. */
    --text-primary: #1a1a1a;
  }
  .question-figure svg text.t {
    font-size: 16px;
    font-weight: 700;
    fill: var(--text-primary);
  }
  .question-figure svg text.ts {
    font-size: 14px;
    fill: var(--text-primary);
  }
  .choices {
    list-style: none;
    padding-left: 8px;
    margin: 0;
  }
  .choices li {
    margin-bottom: 6px;
  }
  .choice-label {
    display: inline-block;
    width: 22px;
    font-weight: bold;
  }
  .answer-key {
    page-break-before: always;
    margin-top: 24px;
  }
  .answer-key h2 {
    font-size: 18px;
    border-bottom: 1px solid #999;
    padding-bottom: 6px;
  }
  .answer-key-grid {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 8px;
    font-size: 14px;
  }
  @media print {
    body { padding: 0 24px; }
  }
`;

function renderQuestionHtml(question, { includeCorrectMarker }) {
  const choicesHtml = question.choices
    .map((choice) => {
      const marker =
        includeCorrectMarker && choice.isCorrect
          ? ' <strong>(correct)</strong>'
          : "";

      return `<li><span class="choice-label">${escapeHtml(choice.label)})</span>${escapeHtml(choice.text)}${marker}</li>`;
    })
    .join("\n");

  const figureHtml = question.figureSvg
    ? `<div class="question-figure">${question.figureSvg}</div>`
    : "";

  return `
    <div class="question">
      <p class="question-prompt"><span class="question-number">${question.questionNumber}.</span>${escapeHtml(question.promptText)}</p>
      ${figureHtml}
      <ul class="choices">
        ${choicesHtml}
      </ul>
    </div>
  `;
}

function renderAnswerKeyHtml(questions) {
  const entries = questions
    .map(
      (q) =>
        `<div>${q.questionNumber}. ${escapeHtml(q.correctChoiceLabel)}</div>`
    )
    .join("\n");

  return `
    <div class="answer-key">
      <h2>Answer Key</h2>
      <div class="answer-key-grid">
        ${entries}
      </div>
    </div>
  `;
}

function renderDocument({
  quiz,
  title,
  includeCorrectMarkers,
  includeAnswerKeyPage
}) {
  const questionsHtml = quiz.questions
    .map((q) =>
      renderQuestionHtml(q, { includeCorrectMarker: includeCorrectMarkers })
    )
    .join("\n");

  const answerKeyHtml = includeAnswerKeyPage
    ? renderAnswerKeyHtml(quiz.questions)
    : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<title>${escapeHtml(title)}</title>
<style>${BASE_STYLES}</style>
</head>
<body>
  <div class="quiz-header">
    <h1>${escapeHtml(title)}</h1>
    <div class="quiz-meta">
      <div>Name: <span class="name-line">&nbsp;</span></div>
      <div>Date: <span class="name-line">&nbsp;</span></div>
    </div>
  </div>

  ${questionsHtml}

  ${answerKeyHtml}
</body>
</html>`;
}

export class GeometryQuizPrinter {
  /**
   * @param {object} quiz - the `.quiz` object returned by a composed
   *   (`composed: true`) result from geometryQuizComposer.compose().
   * @param {object} [options]
   * @param {string} [options.title] - defaults to "Geometry Quiz".
   * @param {"student"|"teacher"|"both"} [options.version] - "student"
   *   omits correct-answer markers and the answer key page (default);
   *   "teacher" marks the correct choice inline; "both" produces the
   *   student version followed by a printed answer key page.
   */
  renderHtml(quiz, options = {}) {
    if (!quiz || !Array.isArray(quiz.questions) || quiz.questions.length === 0) {
      return {
        printerVersion: PRINTER_VERSION,
        rendered: false,
        html: null,
        errors: [
          "Geometry Quiz Printer requires a composed quiz object " +
          "(the `.quiz` property of a geometryQuizComposer.compose() result) " +
          "with at least one question."
        ]
      };
    }

    const title = options.title || "Geometry Quiz";
    const version = options.version || "student";

    const html = renderDocument({
      quiz,
      title,
      includeCorrectMarkers: version === "teacher",
      includeAnswerKeyPage: version === "both"
    });

    return {
      printerVersion: PRINTER_VERSION,
      rendered: true,
      html,
      errors: []
    };
  }

  getPrinterVersion() {
    return PRINTER_VERSION;
  }
}

export const geometryQuizPrinter = new GeometryQuizPrinter();

export { PRINTER_VERSION };
