/**
 * Geometry OS
 * Geometry Prompt Renderer v1.0.0
 *
 * Responsibility:
 * Assemble a final, student-ready multiple-choice question from:
 * - the certified variables (Geometry Variable Generator)
 * - the correct answer (Geometry Solver)
 * - the 3 distractors (Geometry Distractor Engine)
 *
 * It expands each template's generic registry promptPattern (e.g.
 * "What is the distance between the two given points?") into a
 * fully-specified, standalone question that embeds the actual
 * generated values (e.g. "What is the distance between the points
 * (2, -3) and (5, 1)?") — so the question is readable and answerable
 * as text alone, without depending on a separate figure/diagram
 * engine that does not exist yet in this repo.
 *
 * It also shuffles the 4 choices (correct answer + 3 distractors)
 * deterministically per seed and assigns A/B/C/D labels.
 *
 * This renderer does NOT:
 * - generate variables, answers, or distractors
 * - render a visual figure/diagram
 * - certify or validate question quality (see questionQualityGate.js)
 */

const RENDERER_VERSION = "v1.3.0";

const RENDER_STATUS = Object.freeze({
  RENDERED: "geometry_prompt_rendered",
  REJECTED: "geometry_prompt_rejected"
});

const CHOICE_LABELS = Object.freeze(["A", "B", "C", "D"]);

const CERTIFIED_TEMPLATE_IDS = Object.freeze([
  "identify_point_from_description",
  "identify_line_from_labels",
  "identify_segment_from_endpoints",
  "identify_ray_from_endpoint",
  "identify_plane_from_points",
  "identify_angle_from_rays",
  "classify_angle_by_measure",
  "measure_angle_from_relationship",
  "identify_complementary_angle_pair",
  "identify_supplementary_angle_pair",
  "identify_vertical_angle_pair",
  "identify_adjacent_angle_pair",
  "classify_polygon_by_sides",
  "identify_polygon_from_attributes",
  "classify_triangle_by_sides",
  "classify_triangle_by_angles",
  "triangle_angle_sum_missing_angle",
  "distance_between_two_points",
  "midpoint_between_two_points",
  "identify_translation_from_rule",
  "identify_reflection_from_rule",
  "identify_rotation_from_rule",
  "identify_dilation_from_scale_factor",
  "identify_angle_pair_type_from_transversal",
  "angle_measure_from_parallel_lines",
  "classify_line_relationship_from_slopes",
  "pythagorean_theorem_missing_side",
  "special_right_triangle_45_45_90_missing_side",
  "special_right_triangle_30_60_90_missing_side",
  "right_triangle_trig_ratio_from_sides",
  "polygon_interior_angle_sum_calculation",
  "regular_polygon_interior_angle_measure",
  "parallelogram_angle_relationship_measure",
  "quadrilateral_diagonal_bisection_length"
]);

function protectedCopy(value) {
  if (value === undefined) return undefined;
  return JSON.parse(JSON.stringify(value));
}

function normalizeString(value) {
  return typeof value === "string" ? value.trim() : "";
}

function hashString(value = "") {
  let hash = 2166136261;

  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
}

function createSeededRandom(seedValue) {
  let state = hashString(String(seedValue)) || 1;

  return function random() {
    state += 0x6d2b79f5;

    let value = state;

    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);

    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle(random, values = []) {
  const result = [...values];

  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));

    [result[index], result[swapIndex]] = [
      result[swapIndex],
      result[index]
    ];
  }

  return result;
}

// --- Per-template prompt text expansion ---
// Each takes the variables object and returns a fully-specified,
// standalone question string that does not depend on a figure.

function renderIdentifyPoint(variables) {
  return `Which labeled object represents ${variables.description}?`;
}

function renderIdentifyLine(variables) {
  return `Which name correctly identifies the line through points ${variables.pointA} and ${variables.pointB}?`;
}

function renderIdentifySegment(variables) {
  return `Which name correctly identifies the segment with endpoints ${variables.endpointA} and ${variables.endpointB}?`;
}

function renderIdentifyRay(variables) {
  return `Which name correctly identifies the ray with endpoint ${variables.endpoint} that passes through point ${variables.directionPoint}?`;
}

function renderIdentifyPlane(variables) {
  return `Which name correctly identifies the plane containing points ${variables.pointA}, ${variables.pointB}, and ${variables.pointC}?`;
}

function renderIdentifyAngle(variables) {
  return `Which name correctly identifies the angle formed by ray ${variables.vertex}${variables.pointA} and ray ${variables.vertex}${variables.pointB}?`;
}

function renderClassifyAngleByMeasure(variables) {
  return `How should an angle measuring ${variables.angleMeasure}\u00B0 be classified?`;
}

function renderMeasureAngleFromRelationship(variables) {
  const known = variables.knownAngle;

  if (variables.relationshipType === "complementary") {
    return `Angle A and Angle B are complementary. If Angle A measures ${known}\u00B0, what is the measure of Angle B?`;
  }

  if (variables.relationshipType === "supplementary") {
    return `Angle A and Angle B are supplementary. If Angle A measures ${known}\u00B0, what is the measure of Angle B?`;
  }

  return `Two angles are vertical angles. If one angle measures ${known}\u00B0, what is the measure of the other angle?`;
}

function renderComplementaryPair(variables) {
  return `Angle A measures ${variables.angleMeasureA}\u00B0 and Angle B measures ${variables.angleMeasureB}\u00B0. What is the relationship between these two angles?`;
}

function renderSupplementaryPair(variables) {
  return `Angle A measures ${variables.angleMeasureA}\u00B0 and Angle B measures ${variables.angleMeasureB}\u00B0. What is the relationship between these two angles?`;
}

function renderVerticalPair(variables) {
  return `Two angles formed by a pair of intersecting lines each measure ${variables.angleMeasure}\u00B0. What is the relationship between these two angles?`;
}

function renderAdjacentPair(variables) {
  return `Angle one measures ${variables.angleOneMeasure}\u00B0 and angle two measures ${variables.angleTwoMeasure}\u00B0. The two angles share a common vertex and a common ray. What is the relationship between these two angles?`;
}

function renderClassifyPolygonBySides(variables) {
  return `How should a polygon with ${variables.sideCount} sides be classified?`;
}

function renderIdentifyPolygonFromAttributes(variables) {
  return `A figure is closed, has only straight sides, and has ${variables.numberOfSides} sides. Which term correctly classifies it?`;
}

function renderClassifyTriangleBySides(variables) {
  return `A triangle has side lengths of ${variables.sideA}, ${variables.sideB}, and ${variables.sideC}. How should the triangle be classified by its side lengths?`;
}

function renderClassifyTriangleByAngles(variables) {
  return `A triangle has angle measures of ${variables.angleA}\u00B0, ${variables.angleB}\u00B0, and ${variables.angleC}\u00B0. How should the triangle be classified by its angle measures?`;
}

function renderTriangleAngleSum(variables) {
  return `A triangle has two angles measuring ${variables.angleA}\u00B0 and ${variables.angleB}\u00B0. What is the measure of the third angle?`;
}

function renderDistance(variables) {
  return `What is the distance between the points (${variables.x1}, ${variables.y1}) and (${variables.x2}, ${variables.y2})?`;
}

function renderMidpoint(variables) {
  return `What is the midpoint of the segment with endpoints (${variables.x1}, ${variables.y1}) and (${variables.x2}, ${variables.y2})?`;
}

function renderTranslation(variables) {
  const h = variables.horizontalShift;
  const v = variables.verticalShift;

  const horizontalText = `${Math.abs(h)} unit${Math.abs(h) === 1 ? "" : "s"} ${h >= 0 ? "right" : "left"}`;
  const verticalText = `${Math.abs(v)} unit${Math.abs(v) === 1 ? "" : "s"} ${v >= 0 ? "up" : "down"}`;

  return `A point is translated ${horizontalText} and ${verticalText}. Which rule represents this translation?`;
}

function renderReflection(variables) {
  return `A point is reflected across the ${variables.reflectionLine}. Which rule represents this reflection?`;
}

function renderRotation(variables) {
  return `A point is rotated ${variables.rotationDegrees}\u00B0 counterclockwise about the origin. Which rule represents this rotation?`;
}

function renderDilation(variables) {
  return `A point is dilated by a scale factor of ${variables.scaleFactor}, centered at the origin. Which rule represents this dilation?`;
}

// --- Chapter 3: Parallel and Perpendicular Lines ---

function renderTransversalAnglePairType(variables) {
  return `Two parallel lines are cut by a transversal. ${variables.angleDescriptionA[0].toUpperCase()}${variables.angleDescriptionA.slice(1)} and ${variables.angleDescriptionB} are a pair of angles formed by the intersections. What is the relationship between these two angles?`;
}

function renderParallelLinesAngleMeasure(variables) {
  const relationshipPhrase =
    variables.relationshipType === "consecutive interior"
      ? "consecutive interior (same-side interior) angles"
      : `${variables.relationshipType} angles`;

  return `Two parallel lines are cut by a transversal, forming a pair of ${relationshipPhrase}. If one angle measures ${variables.knownAngleMeasure}\u00B0, what is the measure of the other angle in the pair?`;
}

function renderClassifyLineRelationship(variables) {
  return `Line p has a slope of ${variables.slopeA}, and line q has a slope of ${variables.slopeB}. What is the relationship between line p and line q?`;
}

// --- Chapter 9: Right Triangles and Trigonometry ---

function renderPythagoreanTheorem(variables) {
  if (variables.missingSideRole === "hypotenuse") {
    return `A right triangle has legs measuring ${variables.sideA} and ${variables.sideB}. What is the length of the hypotenuse?`;
  }

  return `A right triangle has a hypotenuse measuring ${variables.sideA} and one leg measuring ${variables.sideB}. What is the length of the other leg?`;
}

function renderSpecialRightTriangle454590(variables) {
  if (variables.givenSideType === "leg") {
    return `A 45-45-90 triangle has a leg measuring ${variables.givenSideDisplay}. What is the length of the hypotenuse?`;
  }

  return `A 45-45-90 triangle has a hypotenuse measuring ${variables.givenSideDisplay}. What is the length of each leg?`;
}

function renderSpecialRightTriangle306090(variables) {
  const givenLabel =
    variables.givenSideType === "shortLeg"
      ? "short leg"
      : "hypotenuse";

  const askedLabel = {
    longLeg: "long leg",
    hypotenuse: "hypotenuse",
    shortLeg: "short leg"
  }[variables.askedSideType];

  return `A 30-60-90 triangle has a ${givenLabel} measuring ${variables.givenSideDisplay}. What is the length of the ${askedLabel}?`;
}

function renderRightTriangleTrigRatio(variables) {
  const ratioLabel = {
    sine: "sine",
    cosine: "cosine",
    tangent: "tangent"
  }[variables.ratioType];

  return `A right triangle has legs measuring ${variables.legA} and ${variables.legB}, and a hypotenuse measuring ${variables.hypotenuse}. Angle A is opposite the side measuring ${variables.legA}. What is the ${ratioLabel} of angle A, expressed as a reduced fraction?`;
}

// --- Chapter 7: Quadrilaterals and Other Polygons ---

function renderPolygonInteriorAngleSum(variables) {
  return `What is the sum of the interior angle measures of a polygon with ${variables.numberOfSides} sides?`;
}

function renderRegularPolygonInteriorAngle(variables) {
  return `What is the measure of one interior angle of a regular polygon with ${variables.numberOfSides} sides?`;
}

function renderParallelogramAngleRelationship(variables) {
  const relationshipPhrase =
    variables.relationshipType === "consecutive"
      ? "consecutive angle (the angle sharing a side with it)"
      : "opposite angle (the angle across the parallelogram from it)";

  return `In a parallelogram, one angle measures ${variables.knownAngleMeasure}\u00B0. What is the measure of its ${relationshipPhrase}?`;
}

function renderQuadrilateralDiagonalBisection(variables) {
  return `In parallelogram ABCD, the diagonals intersect at point E. If one half of a diagonal measures ${variables.givenSegmentLength}, what is the length of the other half of that same diagonal?`;
}

const TEMPLATE_RENDERERS = Object.freeze({
  identify_point_from_description: renderIdentifyPoint,
  identify_line_from_labels: renderIdentifyLine,
  identify_segment_from_endpoints: renderIdentifySegment,
  identify_ray_from_endpoint: renderIdentifyRay,
  identify_plane_from_points: renderIdentifyPlane,
  identify_angle_from_rays: renderIdentifyAngle,
  classify_angle_by_measure: renderClassifyAngleByMeasure,
  measure_angle_from_relationship: renderMeasureAngleFromRelationship,
  identify_complementary_angle_pair: renderComplementaryPair,
  identify_supplementary_angle_pair: renderSupplementaryPair,
  identify_vertical_angle_pair: renderVerticalPair,
  identify_adjacent_angle_pair: renderAdjacentPair,
  classify_polygon_by_sides: renderClassifyPolygonBySides,
  identify_polygon_from_attributes: renderIdentifyPolygonFromAttributes,
  classify_triangle_by_sides: renderClassifyTriangleBySides,
  classify_triangle_by_angles: renderClassifyTriangleByAngles,
  triangle_angle_sum_missing_angle: renderTriangleAngleSum,
  distance_between_two_points: renderDistance,
  midpoint_between_two_points: renderMidpoint,
  identify_translation_from_rule: renderTranslation,
  identify_reflection_from_rule: renderReflection,
  identify_rotation_from_rule: renderRotation,
  identify_dilation_from_scale_factor: renderDilation,

  identify_angle_pair_type_from_transversal:
    renderTransversalAnglePairType,

  angle_measure_from_parallel_lines:
    renderParallelLinesAngleMeasure,

  classify_line_relationship_from_slopes:
    renderClassifyLineRelationship,

  pythagorean_theorem_missing_side:
    renderPythagoreanTheorem,

  special_right_triangle_45_45_90_missing_side:
    renderSpecialRightTriangle454590,

  special_right_triangle_30_60_90_missing_side:
    renderSpecialRightTriangle306090,

  right_triangle_trig_ratio_from_sides:
    renderRightTriangleTrigRatio,

  polygon_interior_angle_sum_calculation:
    renderPolygonInteriorAngleSum,

  regular_polygon_interior_angle_measure:
    renderRegularPolygonInteriorAngle,

  parallelogram_angle_relationship_measure:
    renderParallelogramAngleRelationship,

  quadrilateral_diagonal_bisection_length:
    renderQuadrilateralDiagonalBisection
});

function extractInput(input = {}) {
  if (!input || typeof input !== "object") return {};
  return input;
}

function createRejectedResult({
  templateId = null,
  problemTypeId = null,
  errors = []
}) {
  return {
    rendererVersion: RENDERER_VERSION,
    status: RENDER_STATUS.REJECTED,
    rendered: false,
    templateId,
    problemTypeId,
    promptText: null,
    choices: [],
    correctChoiceLabel: null,
    errors: protectedCopy(errors)
  };
}

function createRenderedResult({
  templateId,
  problemTypeId,
  promptText,
  choices,
  correctChoiceLabel,
  seed
}) {
  return {
    rendererVersion: RENDERER_VERSION,
    status: RENDER_STATUS.RENDERED,
    rendered: true,
    templateId,
    problemTypeId,
    seed,
    promptText,
    choices: protectedCopy(choices),
    correctChoiceLabel,
    errors: []
  };
}

export class GeometryPromptRenderer {
  render(input = {}) {
    const normalized = extractInput(input);
    const templateId = normalizeString(normalized.templateId);
    const problemTypeId = normalizeString(normalized.problemTypeId);
    const variables = normalized.variables;
    const correctAnswer = normalized.correctAnswer;
    const distractors = normalized.distractors;
    const seed = normalized.seed ?? `${templateId}:render`;

    if (!templateId) {
      return createRejectedResult({
        problemTypeId,
        errors: ["Geometry Prompt Renderer requires a templateId."]
      });
    }

    if (!CERTIFIED_TEMPLATE_IDS.includes(templateId)) {
      return createRejectedResult({
        templateId,
        problemTypeId,
        errors: [
          `Unsupported certified Geometry templateId: ${templateId}.`
        ]
      });
    }

    if (!variables || typeof variables !== "object") {
      return createRejectedResult({
        templateId,
        problemTypeId,
        errors: [
          "Geometry Prompt Renderer requires the variables object " +
          "produced by the certified Geometry Variable Generator."
        ]
      });
    }

    if (correctAnswer === undefined || correctAnswer === null) {
      return createRejectedResult({
        templateId,
        problemTypeId,
        errors: [
          "Geometry Prompt Renderer requires the correctAnswer " +
          "produced by the certified Geometry Solver."
        ]
      });
    }

    if (!Array.isArray(distractors) || distractors.length !== 3) {
      return createRejectedResult({
        templateId,
        problemTypeId,
        errors: [
          "Geometry Prompt Renderer requires exactly 3 distractors " +
          "produced by the certified Geometry Distractor Engine."
        ]
      });
    }

    const renderFn = TEMPLATE_RENDERERS[templateId];

    if (typeof renderFn !== "function") {
      return createRejectedResult({
        templateId,
        problemTypeId,
        errors: [
          `No Geometry prompt renderer is registered for templateId ${templateId}.`
        ]
      });
    }

    try {
      const promptText = renderFn(variables);

      if (!promptText || typeof promptText !== "string") {
        return createRejectedResult({
          templateId,
          problemTypeId,
          errors: [
            `Prompt renderer for ${templateId} did not produce valid prompt text.`
          ]
        });
      }

      const random = createSeededRandom(seed);

      const rawOptions = [
        { text: correctAnswer, isCorrect: true },
        ...distractors.map((text) => ({ text, isCorrect: false }))
      ];

      const shuffledOptions = shuffle(random, rawOptions);

      const choices = shuffledOptions.map((option, index) => ({
        label: CHOICE_LABELS[index],
        text: option.text,
        isCorrect: option.isCorrect
      }));

      const correctChoice = choices.find((choice) => choice.isCorrect);

      return createRenderedResult({
        templateId,
        problemTypeId,
        promptText,
        choices,
        correctChoiceLabel: correctChoice.label,
        seed
      });
    } catch (error) {
      return createRejectedResult({
        templateId,
        problemTypeId,
        errors: [
          error instanceof Error ? error.message : String(error)
        ]
      });
    }
  }

  supportsTemplate(templateId) {
    return CERTIFIED_TEMPLATE_IDS.includes(normalizeString(templateId));
  }

  getSupportedTemplateIds() {
    return protectedCopy(CERTIFIED_TEMPLATE_IDS);
  }

  getRendererVersion() {
    return RENDERER_VERSION;
  }
}

export const geometryPromptRenderer = new GeometryPromptRenderer();

export { RENDERER_VERSION, RENDER_STATUS, CERTIFIED_TEMPLATE_IDS };
