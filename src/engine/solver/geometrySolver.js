/**
 * Geometry OS
 * Geometry Solver v1.0.0
 *
 * Responsibility:
 * Calculate the correct answer for a certified Geometry template,
 * given the exact variables produced by the certified Geometry
 * Variable Generator.
 *
 * This solver does NOT:
 * - generate variables (see geometryVariableGenerator.js)
 * - generate distractors
 * - render prompts
 * - modify templates or certified engines
 *
 * Design note on "classification_label" answers:
 * For angle-relationship templates (complementary/supplementary/
 * vertical/adjacent), the correct answer is the relationship word
 * itself (e.g. "complementary"), since the generator already
 * constructs the pair to satisfy that relationship by definition.
 *
 * For the four transformation templates (translation/reflection/
 * rotation/dilation), this solver treats the correct answer as the
 * specific transformation RULE string generated for that problem
 * (e.g. "(x, y) → (x + 3, y − 2)"), not the transformation type name.
 * This is an inferred content decision — the registry's
 * expectedAnswerFormat of "classification_label" is ambiguous
 * between "classify the transformation type" and "classify the
 * correct rule among candidates." The rule-string interpretation
 * was chosen because it is the only option that uses the specific
 * generated numbers (shift amount, scale factor, etc.) rather than
 * producing a trivially circular answer. FLAG FOR REVIEW if this
 * doesn't match the intended question design.
 */

const SOLVER_VERSION = "v1.2.0";

const SOLVE_STATUS = Object.freeze({
  SOLVED: "geometry_answer_solved",
  REJECTED: "geometry_answer_rejected"
});

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
  "right_triangle_trig_ratio_from_sides"
]);

function protectedCopy(value) {
  if (value === undefined) {
    return undefined;
  }

  return JSON.parse(JSON.stringify(value));
}

function normalizeString(value) {
  return typeof value === "string" ? value.trim() : "";
}

function permutationsOfThree(a, b, c) {
  return [
    [a, b, c],
    [a, c, b],
    [b, a, c],
    [b, c, a],
    [c, a, b],
    [c, b, a]
  ];
}

function extractInput(input = {}) {
  if (!input || typeof input !== "object") {
    return {};
  }

  const nested = [
    input.resolvedTemplate,
    input.templateResolution,
    input.resolution
  ].filter(
    (candidate) =>
      candidate &&
      typeof candidate === "object" &&
      !Array.isArray(candidate)
  );

  return Object.assign({}, ...nested, input);
}

function resolveTemplateRecord(input = {}) {
  const normalized = extractInput(input);

  if (
    normalized.template &&
    typeof normalized.template === "object" &&
    !Array.isArray(normalized.template)
  ) {
    return normalized.template;
  }

  return normalized;
}

function resolveTemplateId(input = {}) {
  const record = resolveTemplateRecord(input);

  return normalizeString(
    record.templateId || extractInput(input).templateId
  );
}

function resolveProblemTypeId(input = {}) {
  const record = resolveTemplateRecord(input);

  return normalizeString(
    record.problemTypeId || extractInput(input).problemTypeId
  );
}

function resolveVariables(input = {}) {
  const normalized = extractInput(input);

  if (
    normalized.variables &&
    typeof normalized.variables === "object" &&
    !Array.isArray(normalized.variables)
  ) {
    return normalized.variables;
  }

  return null;
}

function createRejectedResult({
  templateId = null,
  problemTypeId = null,
  errors = []
}) {
  return {
    solverVersion: SOLVER_VERSION,
    status: SOLVE_STATUS.REJECTED,
    solved: false,
    templateId,
    problemTypeId,
    answerFormat: null,
    correctAnswer: null,
    acceptableAnswers: [],
    errors: protectedCopy(errors)
  };
}

function createSolvedResult({
  templateId,
  problemTypeId,
  answerFormat,
  correctAnswer,
  acceptableAnswers = []
}) {
  const normalizedAcceptable = protectedCopy(
    acceptableAnswers.length > 0
      ? [...new Set(acceptableAnswers)]
      : [correctAnswer]
  );

  return {
    solverVersion: SOLVER_VERSION,
    status: SOLVE_STATUS.SOLVED,
    solved: true,
    templateId,
    problemTypeId,
    answerFormat,
    correctAnswer: protectedCopy(correctAnswer),
    acceptableAnswers: normalizedAcceptable,
    errors: []
  };
}

// --- Per-template solve functions ---
// Each receives the exact `variables` object produced by the
// certified Geometry Variable Generator for that templateId.

function solveIdentifyPoint(variables) {
  const correctAnswer = `point ${variables.pointLabel}`;

  return { answerFormat: "geometry_object_name", correctAnswer };
}

function solveIdentifyLine(variables) {
  const correctAnswer = variables.lineName;
  const acceptableAnswers = [variables.lineName, variables.reverseLineName];

  return {
    answerFormat: "geometry_object_name",
    correctAnswer,
    acceptableAnswers
  };
}

function solveIdentifySegment(variables) {
  const correctAnswer = variables.segmentName;
  const acceptableAnswers = [
    variables.segmentName,
    variables.reverseSegmentName
  ];

  return {
    answerFormat: "geometry_object_name",
    correctAnswer,
    acceptableAnswers
  };
}

function solveIdentifyRay(variables) {
  // Rays are directional: ray AB !== ray BA. Only the exact
  // endpoint->direction order is correct.
  const correctAnswer = variables.rayName;

  return { answerFormat: "geometry_object_name", correctAnswer };
}

function solveIdentifyPlane(variables) {
  const { pointA, pointB, pointC } = variables;
  const correctAnswer = variables.planeName;

  const acceptableAnswers = permutationsOfThree(
    pointA,
    pointB,
    pointC
  ).map((points) => `plane ${points.join("")}`);

  return {
    answerFormat: "geometry_object_name",
    correctAnswer,
    acceptableAnswers
  };
}

function solveIdentifyAngle(variables) {
  const correctAnswer = variables.angleName;
  const acceptableAnswers = [
    variables.angleName,
    variables.reverseAngleName
  ];

  return {
    answerFormat: "geometry_object_name",
    correctAnswer,
    acceptableAnswers
  };
}

function solveClassifyAngleByMeasure(variables) {
  const correctAnswer = variables.angleType;

  return { answerFormat: "classification_label", correctAnswer };
}

function solveMeasureAngleFromRelationship(variables) {
  const correctAnswer = variables.unknownAngleMeasure;

  return { answerFormat: "numeric_degrees", correctAnswer };
}

function solveComplementaryPair(variables) {
  const correctAnswer = variables.relationshipType;

  return { answerFormat: "classification_label", correctAnswer };
}

function solveSupplementaryPair(variables) {
  const correctAnswer = variables.relationshipType;

  return { answerFormat: "classification_label", correctAnswer };
}

function solveVerticalPair(variables) {
  const correctAnswer = variables.relationshipType;

  return { answerFormat: "classification_label", correctAnswer };
}

function solveAdjacentPair(variables) {
  const correctAnswer = variables.relationshipType;

  return { answerFormat: "classification_label", correctAnswer };
}

function solveClassifyPolygonBySides(variables) {
  const correctAnswer = variables.polygonName;

  return { answerFormat: "classification_label", correctAnswer };
}

function solveIdentifyPolygonFromAttributes(variables) {
  const correctAnswer = variables.polygonClassification;

  return { answerFormat: "classification_label", correctAnswer };
}

function solveClassifyTriangleBySides(variables) {
  const correctAnswer = variables.triangleType;

  return { answerFormat: "classification_label", correctAnswer };
}

function solveClassifyTriangleByAngles(variables) {
  const correctAnswer = variables.triangleType;

  return { answerFormat: "classification_label", correctAnswer };
}

function solveTriangleAngleSum(variables) {
  const correctAnswer = variables.missingAngle;

  return { answerFormat: "numeric_degrees", correctAnswer };
}

function solveDistanceBetweenTwoPoints(variables) {
  const { x1, y1, x2, y2 } = variables;

  const horizontalChange = x2 - x1;
  const verticalChange = y2 - y1;

  const distance = Math.sqrt(
    horizontalChange ** 2 + verticalChange ** 2
  );

  // The variable generator only produces Pythagorean-triple pairs
  // (3-4-5, 5-12-13, etc.), so distance is always an exact integer.
  const correctAnswer = Number.isInteger(distance)
    ? distance
    : Number(distance.toFixed(2));

  return { answerFormat: "numeric_value", correctAnswer };
}

function solveMidpointBetweenTwoPoints(variables) {
  const correctAnswer =
    `(${variables.midpointX}, ${variables.midpointY})`;

  return { answerFormat: "ordered_pair", correctAnswer };
}

function solveIdentifyTranslation(variables) {
  const correctAnswer = variables.rule;

  return { answerFormat: "classification_label", correctAnswer };
}

function solveIdentifyReflection(variables) {
  const correctAnswer = variables.rule;

  return { answerFormat: "classification_label", correctAnswer };
}

function solveIdentifyRotation(variables) {
  const correctAnswer = variables.rule;

  return { answerFormat: "classification_label", correctAnswer };
}

function solveIdentifyDilation(variables) {
  const correctAnswer = variables.rule;

  return { answerFormat: "classification_label", correctAnswer };
}

// --- Chapter 3: Parallel and Perpendicular Lines ---

function solveTransversalAnglePairType(variables) {
  const correctAnswer = variables.relationshipType;

  return { answerFormat: "classification_label", correctAnswer };
}

function solveParallelLinesAngleMeasure(variables) {
  const correctAnswer = variables.unknownAngleMeasure;

  return { answerFormat: "numeric_degrees", correctAnswer };
}

function solveClassifyLineRelationship(variables) {
  const correctAnswer = variables.relationshipType;

  return { answerFormat: "classification_label", correctAnswer };
}

// --- Chapter 9: Right Triangles and Trigonometry ---

function solvePythagoreanTheorem(variables) {
  const correctAnswer = variables.missingSideValue;

  return { answerFormat: "numeric_value", correctAnswer };
}

function solveSpecialRightTriangle454590(variables) {
  const correctAnswer = variables.missingSideValue;

  return { answerFormat: "radical_value", correctAnswer };
}

function solveSpecialRightTriangle306090(variables) {
  const correctAnswer = variables.missingSideValue;

  return { answerFormat: "radical_value", correctAnswer };
}

function solveRightTriangleTrigRatio(variables) {
  const correctAnswer = variables.ratioValue;

  return { answerFormat: "numeric_value", correctAnswer };
}

const TEMPLATE_SOLVERS = Object.freeze({
  identify_point_from_description: solveIdentifyPoint,
  identify_line_from_labels: solveIdentifyLine,
  identify_segment_from_endpoints: solveIdentifySegment,
  identify_ray_from_endpoint: solveIdentifyRay,
  identify_plane_from_points: solveIdentifyPlane,
  identify_angle_from_rays: solveIdentifyAngle,
  classify_angle_by_measure: solveClassifyAngleByMeasure,
  measure_angle_from_relationship: solveMeasureAngleFromRelationship,
  identify_complementary_angle_pair: solveComplementaryPair,
  identify_supplementary_angle_pair: solveSupplementaryPair,
  identify_vertical_angle_pair: solveVerticalPair,
  identify_adjacent_angle_pair: solveAdjacentPair,
  classify_polygon_by_sides: solveClassifyPolygonBySides,
  identify_polygon_from_attributes: solveIdentifyPolygonFromAttributes,
  classify_triangle_by_sides: solveClassifyTriangleBySides,
  classify_triangle_by_angles: solveClassifyTriangleByAngles,
  triangle_angle_sum_missing_angle: solveTriangleAngleSum,
  distance_between_two_points: solveDistanceBetweenTwoPoints,
  midpoint_between_two_points: solveMidpointBetweenTwoPoints,
  identify_translation_from_rule: solveIdentifyTranslation,
  identify_reflection_from_rule: solveIdentifyReflection,
  identify_rotation_from_rule: solveIdentifyRotation,
  identify_dilation_from_scale_factor: solveIdentifyDilation,

  identify_angle_pair_type_from_transversal:
    solveTransversalAnglePairType,

  angle_measure_from_parallel_lines:
    solveParallelLinesAngleMeasure,

  classify_line_relationship_from_slopes:
    solveClassifyLineRelationship,

  pythagorean_theorem_missing_side:
    solvePythagoreanTheorem,

  special_right_triangle_45_45_90_missing_side:
    solveSpecialRightTriangle454590,

  special_right_triangle_30_60_90_missing_side:
    solveSpecialRightTriangle306090,

  right_triangle_trig_ratio_from_sides:
    solveRightTriangleTrigRatio
});

export class GeometrySolver {
  solve(input = {}) {
    const templateId = resolveTemplateId(input);
    const problemTypeId = resolveProblemTypeId(input);
    const variables = resolveVariables(input);

    if (!templateId) {
      return createRejectedResult({
        problemTypeId,
        errors: ["Geometry Solver requires a templateId."]
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
          "Geometry Solver requires the variables object produced by " +
          "the certified Geometry Variable Generator."
        ]
      });
    }

    const solver = TEMPLATE_SOLVERS[templateId];

    if (typeof solver !== "function") {
      return createRejectedResult({
        templateId,
        problemTypeId,
        errors: [
          `No Geometry solver is registered for templateId ${templateId}.`
        ]
      });
    }

    try {
      const { answerFormat, correctAnswer, acceptableAnswers } =
        solver(variables);

      if (correctAnswer === undefined || correctAnswer === null) {
        return createRejectedResult({
          templateId,
          problemTypeId,
          errors: [
            `Solver for ${templateId} could not produce a correct answer from the given variables.`
          ]
        });
      }

      return createSolvedResult({
        templateId,
        problemTypeId,
        answerFormat,
        correctAnswer,
        acceptableAnswers
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

  getSolverVersion() {
    return SOLVER_VERSION;
  }
}

export const geometrySolver = new GeometrySolver();

export { SOLVER_VERSION, SOLVE_STATUS, CERTIFIED_TEMPLATE_IDS };
