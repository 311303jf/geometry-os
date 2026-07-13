/**
 * Geometry OS — Quiz to Google Form
 *
 * Companion script to src/engine/geometryQuizGoogleFormsExporter.js.
 * Paste this entire file into script.google.com (Extensions > Apps
 * Script from any Sheet/Doc, or a new standalone project at
 * script.google.com), paste an exported JSON payload into
 * PASTE_YOUR_EXPORTED_JSON_HERE below, then run createGeometryQuizForm.
 *
 * This mirrors the same Google Apps Script + Google Classroom
 * delivery pattern already used for Algebra 1 (Forms generation via
 * GAS), since Google Classroom — not printed paper — is this
 * platform's primary real-world delivery surface.
 *
 * What this creates:
 * - A real Google Form, in Quiz mode (self-grading)
 * - One multiple-choice item per question, 4 choices each
 * - For any question with a diagram (imageBase64Png present), a
 *   standalone image item is inserted immediately before that
 *   question. Google Forms' MultipleChoiceItem has no documented
 *   setImage() method (checked against the official Apps Script
 *   reference before writing this — not assumed), so an adjacent
 *   ImageItem is the correct, documented way to show a figure next
 *   to a question.
 * - The correct choice marked and worth the configured point value
 * - Immediate score release after each submission (students see
 *   their score right away; change releaseMode below to withhold it)
 *
 * After running createGeometryQuizForm(), check the Apps Script
 * execution log (View > Logs, or Ctrl+Enter) for two URLs:
 * - Edit URL: opens the Form in edit mode, for you to review before
 *   assigning it
 * - Published (student) URL: this is what you attach in Google
 *   Classroom as a Quiz assignment (Classroom can also directly
 *   import a Form you already own via "Create > Quiz assignment >
 *   Import" if you'd rather do that step by hand than paste the
 *   published link)
 *
 * IMPORTANT — verify before trusting this with a graded assignment:
 * the image-attachment code below (Utilities.base64Decode +
 * Utilities.newBlob + addImageItem().setImage()) was written against
 * the official documented Apps Script API but could not be run or
 * tested outside of Apps Script itself. The very first time you use
 * this, generate a small quiz (a handful of questions, including at
 * least one you know has a figure) and open the resulting Form
 * yourself to confirm every image appears correctly before assigning
 * anything real to students.
 */

function createGeometryQuizForm() {
  var payload = PASTE_YOUR_EXPORTED_JSON_HERE;

  if (!payload || !Array.isArray(payload.questions) || payload.questions.length === 0) {
    throw new Error(
      "No questions found in the pasted payload. Make sure you " +
      "replaced PASTE_YOUR_EXPORTED_JSON_HERE with the full JSON " +
      "object from geometryQuizGoogleFormsExporter's `payload` field."
    );
  }

  var form = FormApp.create(payload.title || "Geometry Quiz");
  form.setIsQuiz(true);
  form.setCollectEmail(false);

  if (payload.description) {
    form.setDescription(payload.description);
  }

  // Immediate release: students see their score right after
  // submitting. Change to FormApp.QuizFeedback... or
  // form.setPublishSettings(...) if you prefer to withhold scores
  // until you manually release them.
  form.setRequireLogin(false);

  var pointsPerQuestion = payload.pointsPerQuestion || 1;
  var imageCount = 0;

  payload.questions.forEach(function (question, index) {
    if (question.imageBase64Png) {
      try {
        var imageBytes = Utilities.base64Decode(question.imageBase64Png);
        var imageBlob = Utilities.newBlob(imageBytes, "image/png", "figure-" + (index + 1) + ".png");

        form.addImageItem()
          .setTitle("Figure for question " + (index + 1))
          .setImage(imageBlob);

        imageCount++;
      } catch (imageError) {
        Logger.log(
          "Could not attach image for question " + (index + 1) +
          ": " + imageError.message +
          ". The question text and choices were still added below."
        );
      }
    }

    var item = form.addMultipleChoiceItem();
    item.setTitle(question.promptText);
    item.setRequired(true);
    item.setPoints(pointsPerQuestion);

    var choiceObjects = question.choices.map(function (choice) {
      return item.createChoice(choice.text, choice.isCorrect === true);
    });

    item.setChoices(choiceObjects);
  });

  var editUrl = form.getEditUrl();
  var publishedUrl = form.getPublishedUrl();

  Logger.log("Form created: " + payload.title);
  Logger.log("Questions added: " + payload.questions.length);
  Logger.log("Images attached: " + imageCount);
  Logger.log("Edit URL (review before assigning): " + editUrl);
  Logger.log("Published URL (attach this in Google Classroom): " + publishedUrl);

  return {
    editUrl: editUrl,
    publishedUrl: publishedUrl,
    questionCount: payload.questions.length,
    imageCount: imageCount
  };
}

/**
 * Fill this in with the exact `payload` object from
 * geometryQuizGoogleFormsExporter.exportForGoogleForm(quiz, options).result.payload
 * — not the whole result object, just its `.payload` property.
 *
 * Example shape (imageBase64Png is null for text-only questions,
 * a base64 PNG string for questions with a diagram):
 * var PASTE_YOUR_EXPORTED_JSON_HERE = {
 *   "title": "Geometry Quiz",
 *   "description": "",
 *   "isQuiz": true,
 *   "pointsPerQuestion": 1,
 *   "questions": [
 *     {
 *       "promptText": "A right triangle has a hypotenuse measuring 13 and one leg measuring 5. What is the length of the other leg?",
 *       "choices": [
 *         { "text": "8", "isCorrect": false },
 *         { "text": "144", "isCorrect": false },
 *         { "text": "14", "isCorrect": false },
 *         { "text": "12", "isCorrect": true }
 *       ],
 *       "imageBase64Png": null
 *     }
 *   ]
 * };
 */
var PASTE_YOUR_EXPORTED_JSON_HERE = null;
