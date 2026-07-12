/**
 * Geometry OS
 * Geometry Distractor Engine v1.0.0
 *
 * Responsibility:
 * Generate exactly 3 plausible incorrect answers ("distractors") for
 * each certified Geometry template, grounded in real, predictable
 * student errors — not random noise.
 *
 * Design philosophy:
 * A good distractor lets a teacher diagnose WHICH misconception a
 * student has from WHICH wrong answer they picked. Every distractor
 * below traces back to a named, real error pattern (documented per
 * template below), matching the style of Florida FAST/EOC multiple
 * choice items.
 *
 * Error families used across templates:
 * - vertex/order misplacement (angle and ray naming)
 * - wrong geometric-object noun (point/line/segment/ray/plane mixups)
 * - neighboring-category confusion (acute vs right, comp vs supp)
 * - sign/arithmetic slip (forgot to subtract, added instead of
 *   subtracted, forgot a term)
 * - wrong total (used 180 instead of 90, 360 instead of 180)
 * - dimension/component drop or swap (x/y swapped, one axis dropped)
 * - reciprocal/magnitude confusion (scale factor treated as its
 *   inverse)
 *
 * This engine does NOT:
 * - calculate the correct answer (see geometrySolver.js)
 * - generate variables (see geometryVariableGenerator.js)
 * - render prompts or choice ordering/shuffling
 */

const DISTRACTOR_ENGINE_VERSION = "v1.10.0";

const DISTRACTOR_STATUS = Object.freeze({
  GENERATED: "geometry_distractors_generated",
  REJECTED: "geometry_distractors_rejected"
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
  "right_triangle_trig_ratio_from_sides",
  "polygon_interior_angle_sum_calculation",
  "regular_polygon_interior_angle_measure",
  "parallelogram_angle_relationship_measure",
  "quadrilateral_diagonal_bisection_length",
  "triangle_exterior_angle_measure",
  "identify_triangle_congruence_postulate",
  "isosceles_triangle_angle_measure",
  "triangle_inequality_check",
  "identify_triangle_similarity_postulate",
  "similar_polygon_scale_factor_calculation",
  "similar_polygon_missing_side_length",
  "triangle_proportionality_missing_segment",
  "inscribed_angle_arc_measure",
  "circle_equation_from_center_radius",
  "tangent_segment_length",
  "intersecting_chords_missing_segment",
  "circle_circumference_and_area_calculation",
  "arc_length_or_sector_area_calculation",
  "prism_or_cylinder_volume_calculation",
  "sphere_surface_area_or_volume_calculation",
  "identify_conditional_statement_transformation",
  "identify_conditional_statement_part",
  "identify_algebraic_reasoning_property",
  "pyramid_or_cone_volume_calculation",
  "cone_surface_area_calculation",
  "trapezoid_midsegment_calculation",
  "rhombus_diagonal_angle_measure",
  "circle_angle_two_chords_calculation",
  "circle_angle_exterior_calculation",
  "tangent_chord_angle_calculation",
  "right_triangle_altitude_geometric_mean_calculation"
]);

// Mirrored from geometryVariableGenerator.js — the generator only
// uses these side counts, so the distractor engine only needs to
// navigate within this same fixed list. If the generator's side
// count list ever changes, this must be updated to match.
const POLYGON_NAMES_BY_SIDES = Object.freeze({
  3: "triangle",
  4: "quadrilateral",
  5: "pentagon",
  6: "hexagon",
  7: "heptagon",
  8: "octagon",
  9: "nonagon",
  10: "decagon",
  12: "dodecagon"
});

const POLYGON_SIDE_COUNTS_SORTED = Object.freeze(
  Object.keys(POLYGON_NAMES_BY_SIDES)
    .map(Number)
    .sort((a, b) => a - b)
);

// Mirrored from geometryVariableGenerator.js — the generator only
// ever selects a polygonType from this fixed set for the
// identify_polygon_from_attributes template.
const POLYGON_ATTRIBUTE_TYPES = Object.freeze([
  "triangle",
  "quadrilateral",
  "pentagon",
  "hexagon",
  "octagon"
]);

function protectedCopy(value) {
  if (value === undefined) return undefined;
  return JSON.parse(JSON.stringify(value));
}

function normalizeString(value) {
  return typeof value === "string" ? value.trim() : "";
}

function uniqueExcluding(candidates, excluded = []) {
  const excludedSet = new Set(
    excluded.map((value) => JSON.stringify(value))
  );

  const seen = new Set();
  const result = [];

  candidates.forEach((candidate) => {
    const key = JSON.stringify(candidate);

    if (excludedSet.has(key) || seen.has(key)) {
      return;
    }

    seen.add(key);
    result.push(candidate);
  });

  return result;
}

/**
 * Builds exactly 3 numeric distractors from a pedagogically-grounded
 * candidate pool, padding with bounded perturbations of the correct
 * answer only if the grounded pool doesn't yield enough distinct,
 * in-range values.
 */
function buildNumericDistractors({
  correctAnswer,
  pool = [],
  min = -Infinity,
  max = Infinity
}) {
  const inRange = (value) =>
    Number.isFinite(value) && value >= min && value <= max;

  let candidates = uniqueExcluding(
    pool.filter(inRange),
    [correctAnswer]
  );

  const perturbations = [5, -5, 10, -10, 3, -3, 7, -7, 15, -15];
  let index = 0;

  while (candidates.length < 3 && index < perturbations.length) {
    const candidate = correctAnswer + perturbations[index];
    index += 1;

    if (!inRange(candidate)) continue;

    candidates = uniqueExcluding(
      [...candidates, candidate],
      [correctAnswer]
    );
  }

  if (candidates.length < 3) {
    throw new Error(
      "Unable to construct 3 distinct in-range numeric distractors."
    );
  }

  return candidates.slice(0, 3);
}

/**
 * Generic version of buildNumericDistractors for string/label
 * distractors: takes a pedagogically-grounded candidate pool, and if
 * it doesn't yield 3 distinct values (not equal to correctAnswer and
 * not duplicating each other — which can genuinely happen when two
 * different error formulas coincidentally produce the same wrong
 * text for particular variable values), calls fallbackGenerator(i)
 * for i = 0, 1, 2, ... to produce additional grounded candidates
 * until 3 distinct values are found.
 */
function buildFromPool({ pool = [], correctAnswer, fallbackGenerator }) {
  let candidates = uniqueExcluding(pool, [correctAnswer]);

  let i = 0;
  while (candidates.length < 3 && i < 25) {
    const extra = fallbackGenerator ? fallbackGenerator(i) : undefined;
    i += 1;

    if (extra === undefined) continue;

    candidates = uniqueExcluding([...candidates, extra], [correctAnswer]);
  }

  if (candidates.length < 3) {
    throw new Error(
      "Unable to construct 3 distinct distractors from the given pool."
    );
  }

  return candidates.slice(0, 3);
}

function anglePermutationsExcludingValid(vertex, a, b) {
  // The two mathematically valid names both place the vertex in the
  // middle: "a-vertex-b" and "b-vertex-a". Every other permutation
  // is a real vertex-misplacement error.
  const all = [
    [a, vertex, b],
    [b, vertex, a],
    [vertex, a, b],
    [a, b, vertex],
    [vertex, b, a],
    [b, a, vertex]
  ];

  return all
    .slice(2, 5)
    .map((points) => `angle ${points.join("")}`);
}

// --- Per-template distractor functions ---
// Each receives (variables, correctAnswer, acceptableAnswers) and
// must return an array of exactly 3 distractors.

function distractPoint(variables) {
  const label = variables.pointLabel;

  // Error family: wrong geometric-object noun. Tests whether the
  // student can distinguish a point from other undefined/defined
  // terms that share the same label.
  return [`line ${label}`, `ray ${label}`, `segment ${label}`];
}

function distractLine(variables) {
  const a = variables.pointLabelA;
  const b = variables.pointLabelB;

  return [`ray ${a}${b}`, `segment ${a}${b}`, `plane ${a}${b}`];
}

function distractSegment(variables) {
  const a = variables.endpointLabelA;
  const b = variables.endpointLabelB;

  // Error family: wrong noun, plus a direction-sensitivity trap
  // (ray YJ is wrong because segments have no direction, but a
  // student confusing segment/ray rules might pick it).
  return [`line ${a}${b}`, `ray ${a}${b}`, `ray ${b}${a}`];
}

function distractRay(variables) {
  const endpoint = variables.endpoint;
  const direction = variables.directionPoint;

  // Error family: reversed ray is THE classic ray-naming error —
  // students often don't realize the first letter must be the
  // endpoint.
  return [
    `ray ${direction}${endpoint}`,
    `segment ${endpoint}${direction}`,
    `line ${endpoint}${direction}`
  ];
}

function distractPlane(variables) {
  const a = variables.pointLabelA;
  const b = variables.pointLabelB;
  const c = variables.pointLabelC;

  // Error family: naming a plane with too few points (a real,
  // common error), plus wrong-noun confusion.
  return [`plane ${a}${b}`, `angle ${a}${b}${c}`, `plane ${a}`];
}

function distractAngle(variables) {
  const vertex = variables.vertexLabel;
  const a = variables.pointLabelA;
  const b = variables.pointLabelB;

  return anglePermutationsExcludingValid(vertex, a, b);
}

function distractClassifyAngleByMeasure(variables) {
  const allTypes = ["acute", "right", "obtuse", "straight"];

  return allTypes.filter((type) => type !== variables.angleType);
}

function distractMeasureAngleFromRelationship(variables, correctAnswer) {
  const known = variables.knownAngle;
  const type = variables.relationshipType;

  const asComplementary = 90 - known;
  const asSupplementary = 180 - known;
  const asVertical = known;

  const byType = {
    complementary: asComplementary,
    supplementary: asSupplementary,
    vertical: asVertical
  };

  const pool = Object.keys(byType)
    .filter((key) => key !== type)
    .map((key) => byType[key]);

  // "Forgot to solve and just repeated the given angle" — only a
  // valid distractor when it isn't already the correct answer
  // (which happens for the vertical case).
  if (known !== correctAnswer) {
    pool.push(known);
  }

  return buildNumericDistractors({
    correctAnswer,
    pool,
    min: 1,
    max: 179
  });
}

function distractRelationshipLabel(correctAnswer) {
  const all = ["complementary", "supplementary", "vertical", "adjacent"];

  return all.filter((label) => label !== correctAnswer);
}

function distractClassifyPolygonBySides(variables) {
  const sideCount = variables.sideCount;
  const index = POLYGON_SIDE_COUNTS_SORTED.indexOf(sideCount);

  // Expanding search outward from the current side count. Needed
  // because the two ends of the list (triangle=3, dodecagon=12)
  // only have 2 neighbors within a small fixed offset window — a
  // real edge case only a stress test across many seeds surfaces.
  const offsets = [-1, 1, -2, 2, -3, 3, -4, 4];
  const neighborSideCounts = [];

  offsets.forEach((offset) => {
    const neighborIndex = index + offset;

    if (
      neighborIndex >= 0 &&
      neighborIndex < POLYGON_SIDE_COUNTS_SORTED.length
    ) {
      neighborSideCounts.push(POLYGON_SIDE_COUNTS_SORTED[neighborIndex]);
    }
  });

  const distractors = uniqueExcluding(
    neighborSideCounts.map((count) => POLYGON_NAMES_BY_SIDES[count]),
    [variables.polygonName]
  );

  return distractors.slice(0, 3);
}

function distractIdentifyPolygonFromAttributes(variables) {
  return uniqueExcluding(
    POLYGON_ATTRIBUTE_TYPES,
    [variables.polygonClassification]
  ).slice(0, 3);
}

function distractClassifyTriangleBySides(variables) {
  const allSideTypes = ["equilateral", "isosceles", "scalene"];

  const otherSideTypes = allSideTypes.filter(
    (type) => type !== variables.triangleType
  );

  // Cross-category decoy: confusing side-classification with
  // angle-classification vocabulary is a real, common EOC-style
  // trap.
  return [...otherSideTypes, "right"];
}

function distractClassifyTriangleByAngles(variables) {
  const allAngleTypes = ["acute", "right", "obtuse"];

  const otherAngleTypes = allAngleTypes.filter(
    (type) => type !== variables.triangleType
  );

  return [...otherAngleTypes, "isosceles"];
}

function distractTriangleAngleSum(variables, correctAnswer) {
  const a = variables.angleA;
  const b = variables.angleB;

  const pool = [
    180 - a, // forgot to include the second angle
    a + b, // gave the sum instead of subtracting from 180
    360 - a - b // used 360 (quadrilateral total) instead of 180
  ];

  return buildNumericDistractors({
    correctAnswer,
    pool,
    min: 1,
    max: 179
  });
}

function distractDistance(variables, correctAnswer) {
  const dx = variables.x2 - variables.x1;
  const dy = variables.y2 - variables.y1;

  const pool = [
    dx ** 2 + dy ** 2, // forgot the square root
    Math.abs(dx) + Math.abs(dy), // taxicab/Manhattan distance error
    Math.abs(dx) // dropped the y-component entirely
  ];

  return buildNumericDistractors({
    correctAnswer,
    pool,
    min: 0
  });
}

function distractMidpoint(variables) {
  const { x1, y1, x2, y2, midpointX, midpointY } = variables;

  const correctAnswer = `(${midpointX}, ${midpointY})`;

  const pool = [
    `(${(x2 - x1) / 2}, ${(y2 - y1) / 2})`, // subtracted instead of added
    `(${x1 + x2}, ${y1 + y2})`, // forgot to divide by 2
    `(${midpointY}, ${midpointX})` // swapped x and y
  ];

  return buildFromPool({
    pool,
    correctAnswer,
    fallbackGenerator: (i) => {
      // Extra grounded fallbacks for edge cases where a pool formula
      // coincidentally matches the correct answer (e.g. when x1 or
      // y1 is 0): only moved one endpoint, or only averaged one axis.
      // A real, confirmed case found by stress testing: when the
      // midpoint is exactly the origin (0,0) with x1=-x2 and
      // y1=-y2, FOUR of the seven candidate formulas here
      // simultaneously collapse to (0,0) — not just one collision
      // like the earlier circle-equation bug, since the symmetry
      // affects the "forgot to divide" formula AND both
      // single-axis-divided fallbacks AND the coordinate swap all
      // at once. The last two fallbacks below are pure numeric
      // offsets of the correct midpoint with no dependence on
      // x1/y1/x2/y2 symmetry, guaranteeing they can never collide
      // via this failure mode.
      const fallbacks = [
        `(${x2}, ${y2})`, // used endpoint B instead of the midpoint
        `(${x1}, ${y1})`, // used endpoint A instead of the midpoint
        `(${(x1 + x2) / 2}, ${y1 + y2})`, // divided only the x-axis
        `(${x1 + x2}, ${(y1 + y2) / 2})`, // divided only the y-axis
        `(${midpointX + 1}, ${midpointY})`, // offset x by 1 (symmetry-proof)
        `(${midpointX}, ${midpointY + 1})`, // offset y by 1 (symmetry-proof)
        `(${midpointX + 1}, ${midpointY + 1})` // offset both by 1 (symmetry-proof)
      ];

      return fallbacks[i];
    }
  });
}

function distractTranslation(variables) {
  const h = variables.horizontalShift;
  const v = variables.verticalShift;
  const correctAnswer = variables.rule;

  const sign = (value) => (value >= 0 ? "+" : "−");
  const abs = (value) => Math.abs(value);

  const pool = [
    // both signs flipped
    `(x, y) → (x ${sign(-h)} ${abs(h)}, y ${sign(-v)} ${abs(v)})`,
    // horizontal/vertical shift amounts swapped
    `(x, y) → (x ${sign(v)} ${abs(v)}, y ${sign(h)} ${abs(h)})`,
    // only the vertical sign flipped
    `(x, y) → (x ${sign(h)} ${abs(h)}, y ${sign(-v)} ${abs(v)})`
  ];

  return buildFromPool({
    pool,
    correctAnswer,
    fallbackGenerator: (i) => {
      // Extra grounded fallbacks for edge cases where two pool
      // formulas coincidentally match (e.g. when h = -v, "both
      // signs flipped" and "components swapped" produce identical
      // text): forgot to apply the rule at all, or only shifted one
      // axis.
      const fallbacks = [
        "(x, y) → (x, y)", // forgot to apply any shift
        `(x, y) → (x ${sign(h)} ${abs(h)}, y)`, // only shifted x
        `(x, y) → (x, y ${sign(v)} ${abs(v)})` // only shifted y
      ];

      return fallbacks[i];
    }
  });
}

function distractReflection(variables) {
  const allRules = {
    "x-axis": "(x, y) → (x, -y)",
    "y-axis": "(x, y) → (-x, y)",
    "y = x": "(x, y) → (y, x)",
    "y = -x": "(x, y) → (-y, -x)"
  };

  return Object.keys(allRules)
    .filter((line) => line !== variables.reflectionLine)
    .map((line) => allRules[line]);
}

function distractRotation(variables) {
  const allRules = {
    90: "(x, y) → (-y, x)",
    180: "(x, y) → (-x, -y)",
    270: "(x, y) → (y, -x)"
  };

  const otherDegreeRules = Object.keys(allRules)
    .filter((degrees) => Number(degrees) !== variables.rotationDegrees)
    .map((degrees) => allRules[degrees]);

  // Partial-negation error: only flipping the sign of x, a
  // plausible arithmetic slip distinct from any valid rotation rule.
  const partialNegation = "(x, y) → (-x, y)";

  return uniqueExcluding(
    [...otherDegreeRules, partialNegation],
    [variables.rule]
  ).slice(0, 3);
}

function distractDilation(variables) {
  const allScaleFactors = [0.5, 2, 3, 4];

  return allScaleFactors
    .filter((factor) => factor !== variables.scaleFactor)
    .map((factor) => `(x, y) → (${factor}x, ${factor}y)`);
}

// --- Chapter 3: Parallel and Perpendicular Lines ---

function distractTransversalAnglePairType(variables) {
  const all = [
    "corresponding",
    "alternate interior",
    "alternate exterior",
    "consecutive interior"
  ];

  // Error family: neighboring-category confusion between the four
  // transversal angle relationships — the same pattern used for
  // complementary/supplementary/vertical/adjacent.
  return all.filter((type) => type !== variables.relationshipType);
}

function distractParallelLinesAngleMeasure(variables, correctAnswer) {
  const known = variables.knownAngleMeasure;

  // The single most valuable distractor: the answer a student would
  // get by applying the WRONG relationship rule (congruent vs.
  // supplementary) — mixing up which of the four relationships
  // requires which formula is the single most common real error
  // here.
  const wrongRuleAnswer =
    correctAnswer === known ? 180 - known : known;

  return buildNumericDistractors({
    correctAnswer,
    pool: [wrongRuleAnswer],
    min: 1,
    max: 179
  });
}

function distractClassifyLineRelationship(variables) {
  const all = ["parallel", "perpendicular", "neither"];

  const otherTwo = all.filter(
    (type) => type !== variables.relationshipType
  );

  // Cross-category decoy: confusing "parallel" with "the same
  // line" (coincident) is a real, common misconception distinct
  // from the three certified categories.
  return [...otherTwo, "coincident"];
}

// --- Chapter 9: Right Triangles and Trigonometry ---

function distractPythagoreanTheorem(variables, correctAnswer) {
  const { sideA, sideB, missingSideRole } = variables;

  const pool =
    missingSideRole === "hypotenuse"
      ? [
          sideA ** 2 + sideB ** 2, // forgot the square root
          Math.abs(sideA - sideB), // subtracted instead of added, no sqrt
          sideA + sideB // added the raw side lengths, no formula at all
        ]
      : [
          Math.round(Math.sqrt(sideA ** 2 + sideB ** 2)), // added instead of subtracted under the root
          sideA - sideB, // subtracted the raw side lengths, no formula
          sideA ** 2 - sideB ** 2 // forgot the square root
        ];

  return buildNumericDistractors({
    correctAnswer,
    pool,
    min: 1
  });
}

function distractSpecialRightTriangle454590(variables) {
  const leg = variables.legValue;

  if (variables.givenSideType === "leg") {
    // Correct answer is "{leg}√2". Errors: confusing with the
    // 30-60-90 radical, forgetting to multiply by √2 at all, and
    // doubling instead of multiplying by √2.
    return [`${leg}\u221A3`, String(leg), String(leg * 2)];
  }

  // Correct answer is the plain integer leg. Errors: forgetting to
  // cancel the radical (leaving it in the answer), confusing with
  // the 30-60-90 radical, and doubling instead of dividing out √2.
  return [`${leg}\u221A2`, `${leg}\u221A3`, String(leg * 2)];
}

function distractSpecialRightTriangle306090(variables) {
  const shortLeg = variables.shortLegValue;

  if (variables.askedSideType === "longLeg") {
    // Correct answer is "{shortLeg}√3". Errors: confusing with the
    // 45-45-90 radical, forgetting the multiplier entirely, and
    // confusing with the hypotenuse formula (doubling).
    return [
      `${shortLeg}\u221A2`,
      String(shortLeg),
      String(shortLeg * 2)
    ];
  }

  if (variables.askedSideType === "hypotenuse") {
    // Correct answer is shortLeg * 2 (plain integer). Errors:
    // forgetting to double, and tripling instead (a plausible
    // formula mix-up).
    return buildNumericDistractors({
      correctAnswer: shortLeg * 2,
      pool: [shortLeg, shortLeg * 3],
      min: 1
    });
  }

  // askedSideType === "shortLeg": correct answer is shortLeg (plain
  // integer, derived by halving the given hypotenuse). The single
  // highest-value error is forgetting to divide by 2 at all.
  return buildNumericDistractors({
    correctAnswer: shortLeg,
    pool: [shortLeg * 2],
    min: 1
  });
}

function formatReducedFractionForDistractor(numerator, denominator) {
  const divisor = greatestCommonDivisorForDistractors(
    numerator,
    denominator
  );

  return `${numerator / divisor}/${denominator / divisor}`;
}

function greatestCommonDivisorForDistractors(a, b) {
  let x = Math.abs(a);
  let y = Math.abs(b);

  while (y !== 0) {
    [x, y] = [y, x % y];
  }

  return x || 1;
}

function distractRightTriangleTrigRatio(variables, correctAnswer) {
  const { legA, legB, hypotenuse, ratioType } = variables;

  // The two highest-value distractors: the values a student gets by
  // applying the WRONG trig ratio formula (mixing up sine, cosine,
  // and tangent is the single most common real error here).
  const sineValue = formatReducedFractionForDistractor(legA, hypotenuse);
  const cosineValue = formatReducedFractionForDistractor(legB, hypotenuse);
  const tangentValue = formatReducedFractionForDistractor(legA, legB);

  const wrongFormulaPool = [sineValue, cosineValue, tangentValue].filter(
    (value) => value !== correctAnswer
  );

  // Third distractor: the correct ratio's UNREDUCED form — forgetting
  // to simplify the fraction is an extremely common, real error.
  let unreducedNumerator;
  let unreducedDenominator;

  if (ratioType === "sine") {
    unreducedNumerator = legA;
    unreducedDenominator = hypotenuse;
  } else if (ratioType === "cosine") {
    unreducedNumerator = legB;
    unreducedDenominator = hypotenuse;
  } else {
    unreducedNumerator = legA;
    unreducedDenominator = legB;
  }

  const unreducedValue = `${unreducedNumerator}/${unreducedDenominator}`;

  const candidates = uniqueExcluding(
    [...wrongFormulaPool, unreducedValue],
    [correctAnswer]
  );

  if (candidates.length >= 3) {
    return candidates.slice(0, 3);
  }

  // Extremely rare fallback (only if a triple's ratios happen to
  // collide, e.g. an isosceles-like right triangle): pad with the
  // ratio's numerator/denominator swapped (a reciprocal error).
  const reciprocalValue = `${unreducedDenominator}/${unreducedNumerator}`;

  return uniqueExcluding(
    [...candidates, reciprocalValue],
    [correctAnswer]
  ).slice(0, 3);
}

// --- Chapter 7: Quadrilaterals and Other Polygons ---

function distractPolygonInteriorAngleSum(variables, correctAnswer) {
  const n = variables.numberOfSides;

  const pool = [
    n * 180, // forgot to subtract 2 from the number of sides
    (n - 1) * 180, // subtracted 1 instead of 2
    (n - 2) * 90 // used 90 instead of 180
  ];

  return buildNumericDistractors({
    correctAnswer,
    pool,
    min: 180
  });
}

function distractRegularPolygonInteriorAngle(variables, correctAnswer) {
  const n = variables.numberOfSides;

  const pool = [
    (n - 2) * 180, // forgot the final division by n (gave the angle SUM instead)
    360 / n // used the exterior-angle formula instead of the interior one
  ];

  return buildNumericDistractors({
    correctAnswer,
    pool,
    min: 1,
    max: 179
  });
}

function distractParallelogramAngleRelationship(variables, correctAnswer) {
  const known = variables.knownAngleMeasure;

  // The single highest-value distractor: the answer a student gets
  // by applying the WRONG relationship (treating consecutive angles
  // as congruent instead of supplementary, or vice versa).
  const wrongRuleAnswer =
    variables.relationshipType === "consecutive" ? known : 180 - known;

  return buildNumericDistractors({
    correctAnswer,
    pool: [wrongRuleAnswer],
    min: 1,
    max: 179
  });
}

function distractQuadrilateralDiagonalBisection(variables, correctAnswer) {
  const given = variables.givenSegmentLength;

  const pool = [
    given * 2, // confused "the other half" with "the whole diagonal"
    Math.round(given / 2) // divided by 2 again, a second time by mistake
  ];

  return buildNumericDistractors({
    correctAnswer,
    pool,
    min: 1
  });
}

// --- Chapters 5-6: Congruent Triangles and Relationships Within Triangles ---

function distractTriangleExteriorAngle(variables, correctAnswer) {
  const { remoteAngleA, remoteAngleB } = variables;

  const pool = [
    remoteAngleA, // used only one remote angle, forgot the other
    remoteAngleB, // used only the other remote angle
    180 - (remoteAngleA + remoteAngleB) // confused the exterior angle with the third INTERIOR angle
  ];

  return buildNumericDistractors({
    correctAnswer,
    pool,
    min: 1,
    max: 179
  });
}

function distractTriangleCongruencePostulate(variables) {
  const all = ["SSS", "SAS", "ASA", "AAS"];

  // Error family: neighboring-category confusion between the four
  // postulates, especially ASA vs AAS (the included-vs-non-included
  // side distinction), which the pool naturally includes since it's
  // one of the 3 "other" options every time.
  return all.filter((type) => type !== variables.postulateType);
}

function distractIsoscelesTriangleAngle(variables, correctAnswer) {
  const base = variables.baseAngleMeasure;

  if (variables.scenario === "find_other_base") {
    // Correct answer is simply `base` (base angles are congruent).
    // Errors: treating the base angles as supplementary or
    // complementary instead of congruent, or doubling.
    const pool = [180 - base, 90 - base, base * 2];

    return buildNumericDistractors({
      correctAnswer,
      pool,
      min: 1,
      max: 179
    });
  }

  // scenario === "find_vertex": correct answer is 180 - 2*base.
  // Errors: forgetting to compute anything and just repeating the
  // base angle, subtracting only once instead of twice (180-base),
  // and forgetting the "180 minus" part entirely (just doubling).
  const pool = [base, 180 - base, base * 2];

  return buildNumericDistractors({
    correctAnswer,
    pool,
    min: 1,
    max: 179
  });
}

function distractTriangleInequalityCheck(variables) {
  const otherValidityLabel =
    variables.validityLabel === "valid triangle"
      ? "not a valid triangle"
      : "valid triangle";

  // Cross-category decoys: confusing a validity JUDGMENT question
  // with a triangle-TYPE classification question (a real mix-up —
  // seeing "triangle" and reflexively answering with a shape
  // category instead of checking the inequality).
  return [otherValidityLabel, "acute triangle", "obtuse triangle"];
}

// --- Chapter 8: Similarity ---

function distractTriangleSimilarityPostulate(variables) {
  const all = ["AA~", "SSS~", "SAS~"];

  const otherTwo = all.filter(
    (type) => type !== variables.postulateType
  );

  // The single sharpest distractor: the matching CONGRUENCE
  // postulate name (same letters, no tilde) when one exists — this
  // directly tests whether a student confuses similarity's
  // proportional-sides requirement with congruence's equal-sides
  // requirement. AA~ has no congruence equivalent, so ASA (a real
  // congruence postulate) is used instead in that case.
  const congruenceCrossover =
    variables.postulateType === "AA~"
      ? "ASA"
      : variables.postulateType.replace("~", "");

  return [...otherTwo, congruenceCrossover];
}

function distractSimilarPolygonScaleFactor(variables, correctAnswer) {
  const { sideLengthOriginal, sideLengthImage } = variables;

  const reciprocal = formatScaleFactorForDistractor(
    sideLengthOriginal,
    sideLengthImage
  );

  const unreduced = `${sideLengthImage}/${sideLengthOriginal}`;

  const differenceAsRatio = String(
    Math.abs(sideLengthImage - sideLengthOriginal)
  );

  return buildFromPool({
    pool: [reciprocal, unreduced, differenceAsRatio],
    correctAnswer,
    fallbackGenerator: (i) => {
      // Extra grounded fallbacks for edge cases where the primary
      // pool doesn't yield 3 distinct values (e.g. when the
      // reciprocal happens to equal the unreduced form, or either
      // collides with the correct answer itself — a real collision
      // this stress-tested and found, not a hypothetical one).
      const fallbacks = [
        String(sideLengthOriginal + sideLengthImage),
        `${sideLengthOriginal}/${sideLengthImage}`,
        String(sideLengthImage),
        String(sideLengthOriginal)
      ];

      return fallbacks[i];
    }
  });
}

function formatScaleFactorForDistractor(numerator, denominator) {
  const divisor = greatestCommonDivisorForDistractors(
    numerator,
    denominator
  );
  const reducedNumerator = numerator / divisor;
  const reducedDenominator = denominator / divisor;

  return reducedDenominator === 1
    ? String(reducedNumerator)
    : `${reducedNumerator}/${reducedDenominator}`;
}

function distractSimilarPolygonMissingSide(variables, correctAnswer) {
  const { knownSideLength } = variables;

  return buildNumericDistractors({
    correctAnswer,
    pool: [
      knownSideLength, // forgot to apply the scale factor at all
      knownSideLength * 2 // doubled instead of scaling correctly
    ],
    min: 1
  });
}

function distractTriangleProportionality(variables, correctAnswer) {
  const { segmentAD, segmentDB, segmentAE } = variables;

  const pool = [
    Math.round((segmentAD * segmentDB) / segmentAE), // set up the proportion with AE and EC swapped
    Math.round((segmentAE * segmentAD) / segmentDB), // used the reciprocal ratio
    segmentAE + (segmentDB - segmentAD) // added the difference instead of using the proportion
  ];

  return buildNumericDistractors({
    correctAnswer,
    pool,
    min: 1
  });
}

// --- Chapter 10: Circles ---

function distractInscribedAngleArcMeasure(variables, correctAnswer) {
  const known = variables.knownMeasure;

  if (variables.scenario === "find_arc") {
    // Correct answer is known*2. Errors: forgetting to double at
    // all, halving instead of doubling (reciprocal error), and
    // confusing the arc with its reflex (major arc) counterpart.
    return buildNumericDistractors({
      correctAnswer,
      pool: [known, Math.round(known / 2), 360 - known * 2],
      min: 1,
      max: 359
    });
  }

  // find_inscribed_angle: correct answer is known/2. Errors:
  // forgetting to halve at all, doubling instead of halving, and a
  // generic 180-based formula confusion.
  return buildNumericDistractors({
    correctAnswer,
    pool: [known, known * 2, 180 - known / 2],
    min: 1,
    max: 179
  });
}

// Local copy of the circle-equation term formatter (mirrors
// formatCircleEquationTerm in the Variable Generator) — kept
// separate rather than imported, consistent with this file's
// existing pattern of small self-contained helpers (e.g.
// greatestCommonDivisorForDistractors) to avoid cross-file coupling
// between certified engines.
function formatCircleEquationTermForDistractor(variableName, value) {
  if (value === 0) {
    return `${variableName}\u00B2`;
  }

  const sign = value > 0 ? "-" : "+";

  return `(${variableName} ${sign} ${Math.abs(value)})\u00B2`;
}

function distractCircleEquation(variables, correctAnswer) {
  const { centerX, centerY, radius, radiusSquared } = variables;

  // Sign-flip error: forgetting that the standard form uses (x - h),
  // so both center coordinates get the wrong sign.
  const signFlipped =
    `${formatCircleEquationTermForDistractor("x", -centerX)} + ` +
    `${formatCircleEquationTermForDistractor("y", -centerY)} = ${radiusSquared}`;

  // Forgot to square the radius on the right-hand side.
  const radiusNotSquared =
    `${formatCircleEquationTermForDistractor("x", centerX)} + ` +
    `${formatCircleEquationTermForDistractor("y", centerY)} = ${radius}`;

  // Swapped which coordinate goes with x and which goes with y.
  const swappedCenters =
    `${formatCircleEquationTermForDistractor("x", centerY)} + ` +
    `${formatCircleEquationTermForDistractor("y", centerX)} = ${radiusSquared}`;

  return buildFromPool({
    pool: [signFlipped, radiusNotSquared, swappedCenters],
    correctAnswer,
    fallbackGenerator: (i) => {
      // Extra grounded fallbacks. Sign-flip variants (onlyXFlipped,
      // onlyYFlipped, signFlipped, swappedCenters) can silently
      // collide with each other or with the correct answer in two
      // real edge cases found by stress-testing: centerX === centerY
      // (swap becomes a no-op) and, more subtly, a center coordinate
      // of exactly 0 — JavaScript treats -0 === 0, so "flipping the
      // sign" of a 0 coordinate produces the same term as not
      // flipping it at all, silently degenerating several
      // "different" distractors into duplicates of the correct
      // answer when the circle is centered on an axis or the
      // origin. RHS-only variants (wrong radius value, keeping the
      // same center terms as the correct answer) can never degenerate
      // this way, so they're offered first as the more reliable
      // fallback source.
      const diameterSquared = (radius * 2) ** 2;

      const diameterSquaredOnRhs =
        `${formatCircleEquationTermForDistractor("x", centerX)} + ` +
        `${formatCircleEquationTermForDistractor("y", centerY)} = ${diameterSquared}`;

      const radiusSquaredMinusOne =
        `${formatCircleEquationTermForDistractor("x", centerX)} + ` +
        `${formatCircleEquationTermForDistractor("y", centerY)} = ${radiusSquared - 1}`;

      const radiusSquaredPlusOne =
        `${formatCircleEquationTermForDistractor("x", centerX)} + ` +
        `${formatCircleEquationTermForDistractor("y", centerY)} = ${radiusSquared + 1}`;

      const onlyXFlipped =
        `${formatCircleEquationTermForDistractor("x", -centerX)} + ` +
        `${formatCircleEquationTermForDistractor("y", centerY)} = ${radiusSquared}`;

      const onlyYFlipped =
        `${formatCircleEquationTermForDistractor("x", centerX)} + ` +
        `${formatCircleEquationTermForDistractor("y", -centerY)} = ${radiusSquared}`;

      const fallbacks = [
        diameterSquaredOnRhs,
        radiusSquaredPlusOne,
        radiusSquaredMinusOne,
        onlyXFlipped,
        onlyYFlipped
      ];

      return fallbacks[i];
    }
  });
}

function distractTangentSegmentLength(variables, correctAnswer) {
  const given = variables.givenTangentLength;

  return buildNumericDistractors({
    correctAnswer,
    pool: [given * 2, Math.round(given / 2)],
    min: 1
  });
}

function distractIntersectingChords(variables, correctAnswer) {
  const { segmentP, segmentQ, segmentR } = variables;

  const pool = [
    segmentP * segmentQ - segmentR, // subtracted instead of dividing
    segmentR, // repeated a known segment length
    segmentP + segmentQ // added instead of using the product relationship
  ];

  return buildNumericDistractors({
    correctAnswer,
    pool,
    min: 1
  });
}

// --- Chapters 11-12: Circumference, Area, Surface Area, and Volume ---

// Shared helper: builds pi-coefficient distractors from a pool of
// candidate coefficients (numbers), formatting each as "Nπ" and
// falling back to independent numeric offsets of the correct
// coefficient if the formula-confusion pool doesn't yield 3 distinct
// values — a real, confirmed risk here: e.g. the circumference
// formula (2r) and area formula (r²) coincide exactly at r=2,
// verified independently with a standalone Python check before
// writing this code, not assumed.
function buildPiCoefficientDistractors({
  correctAnswer,
  coefficientPool,
  correctCoefficient
}) {
  const pool = coefficientPool.map((coefficient) => `${coefficient}\u03C0`);

  return buildFromPool({
    pool,
    correctAnswer,
    fallbackGenerator: (i) => {
      const offsets = [1, -1, 2, -2, 3, -3, 5, -5];
      const offset = offsets[i];

      if (offset === undefined) {
        return undefined;
      }

      const candidateCoefficient = correctCoefficient + offset;

      if (candidateCoefficient <= 0) {
        return undefined;
      }

      return `${candidateCoefficient}\u03C0`;
    }
  });
}

function distractCircleCircumferenceAndArea(variables, correctAnswer) {
  const { radius, scenario } = variables;

  const correctCoefficient =
    scenario === "circumference" ? 2 * radius : radius * radius;

  const coefficientPool =
    scenario === "circumference"
      ? [radius * radius, radius, 4 * radius] // area formula; forgot the *2; used diameter instead of 2r
      : [2 * radius, 4 * radius * radius, radius]; // circumference formula; used diameter² instead of r²; forgot to square

  return buildPiCoefficientDistractors({
    correctAnswer,
    coefficientPool,
    correctCoefficient
  });
}

function distractArcLengthOrSectorArea(variables, correctAnswer) {
  const { radius, centralAngle, scenario } = variables;

  const fractionNumerator = centralAngle;
  const fractionDenominator = 360;

  const correctCoefficient =
    scenario === "arc_length"
      ? (fractionNumerator / fractionDenominator) * 2 * radius
      : (fractionNumerator / fractionDenominator) * radius * radius;

  // Error family: using the OTHER formula (arc length vs sector
  // area confusion), forgetting the angle fraction entirely (as if
  // the angle were the full 360 degrees), and using angle/180
  // instead of angle/360 (a common denominator mix-up, doubling the
  // fraction).
  const swappedFormula =
    scenario === "arc_length"
      ? (fractionNumerator / fractionDenominator) * radius * radius
      : (fractionNumerator / fractionDenominator) * 2 * radius;

  const forgotFraction =
    scenario === "arc_length" ? 2 * radius : radius * radius;

  const wrongDenominator =
    scenario === "arc_length"
      ? (fractionNumerator / 180) * 2 * radius
      : (fractionNumerator / 180) * radius * radius;

  return buildPiCoefficientDistractors({
    correctAnswer,
    coefficientPool: [swappedFormula, forgotFraction, wrongDenominator],
    correctCoefficient
  });
}

function distractPrismOrCylinderVolume(variables, correctAnswer) {
  const { scenario } = variables;

  if (scenario === "rectangular_prism") {
    const { dimensionOne, dimensionTwo, dimensionThree } = variables;

    const pool = [
      2 *
        (dimensionOne * dimensionTwo +
          dimensionOne * dimensionThree +
          dimensionTwo * dimensionThree), // used the surface area formula instead of volume
      dimensionOne + dimensionTwo + dimensionThree, // added instead of multiplying
      dimensionOne * dimensionTwo // forgot the third dimension entirely
    ];

    return buildNumericDistractors({
      correctAnswer,
      pool,
      min: 1
    });
  }

  // scenario === "cylinder"
  const cylinderRadius = variables.dimensionOne;
  const cylinderHeight = variables.dimensionTwo;
  const correctCoefficient = cylinderRadius * cylinderRadius * cylinderHeight;

  const coefficientPool = [
    4 * cylinderRadius * cylinderRadius * cylinderHeight, // used diameter (2r) squared instead of r squared
    cylinderRadius * cylinderHeight, // forgot to square the radius
    ((4 * cylinderRadius ** 3) / 3) // confused with the sphere volume formula
  ];

  return buildPiCoefficientDistractors({
    correctAnswer,
    coefficientPool,
    correctCoefficient
  });
}

function distractSphereSurfaceAreaOrVolume(variables, correctAnswer) {
  const { radius, scenario } = variables;

  const correctCoefficient =
    scenario === "surface_area"
      ? 4 * radius * radius
      : (4 * radius ** 3) / 3;

  // Error family: using the OTHER sphere formula (surface area vs
  // volume confusion), and forgetting the leading coefficient (4 or
  // 4/3) entirely.
  const swappedFormula =
    scenario === "surface_area"
      ? (4 * radius ** 3) / 3
      : 4 * radius * radius;

  const forgotLeadingCoefficient =
    scenario === "surface_area" ? radius * radius : radius ** 3 / 3;

  const coefficientPool = [
    swappedFormula,
    forgotLeadingCoefficient,
    2 * radius * radius // confused with a circle's area-adjacent formula
  ];

  return buildPiCoefficientDistractors({
    correctAnswer,
    coefficientPool,
    correctCoefficient
  });
}

// --- Chapter 2: Reasoning and Proofs ---

function distractConditionalStatementTransformation(variables) {
  const allTransformationTypes = ["converse", "inverse", "contrapositive"];

  const otherTransformations = allTransformationTypes.filter(
    (type) => type !== variables.transformationType
  );

  // Cross-category decoy: the fourth real category in this family
  // is "original" — a student who doesn't recognize any
  // transformation happened at all is a genuine, common error.
  return [...otherTransformations, "original"];
}

function distractConditionalStatementPart(variables) {
  const {
    scenario,
    hypothesis,
    conclusion,
    negatedHypothesis,
    negatedConclusion
  } = variables;

  // Error family: picking the other part of the conditional
  // (hypothesis instead of conclusion or vice versa), and confusing
  // either part with its negation.
  if (scenario === "hypothesis") {
    return [conclusion, negatedHypothesis, negatedConclusion];
  }

  return [hypothesis, negatedConclusion, negatedHypothesis];
}

function distractAlgebraicReasoningProperty(variables) {
  const allProperties = [
    "Addition Property of Equality",
    "Subtraction Property of Equality",
    "Multiplication Property of Equality",
    "Division Property of Equality",
    "Distributive Property"
  ];

  // Error family: confusing this property with one of the other
  // four — most valuably, mixing up the "opposite operation" pairs
  // (addition vs. subtraction, multiplication vs. division), which
  // this filter-based selection naturally includes since both
  // members of each pair remain in the candidate list whenever the
  // correct answer is the third or later property.
  return allProperties
    .filter((property) => property !== variables.propertyType)
    .slice(0, 3);
}

// --- Extended Chapter 7 / Chapter 12 coverage ---

function distractPyramidOrConeVolume(variables, correctAnswer) {
  const { dimensionOne, dimensionTwo } = variables;

  if (variables.scenario === "square_pyramid") {
    // Correct answer is (s^2 * h) / 3. Errors: forgot to divide by
    // 3 (used the rectangular PRISM volume formula instead — the
    // single most common real mix-up between pyramids and prisms),
    // forgot to square the side, and divided by 2 instead of 3.
    return buildNumericDistractors({
      correctAnswer,
      pool: [
        dimensionOne * dimensionOne * dimensionTwo,
        dimensionOne * dimensionTwo,
        (dimensionOne * dimensionOne * dimensionTwo) / 2
      ],
      min: 1
    });
  }

  // cone: correct answer is (pi * r^2 * h) / 3, as "Nπ". Errors:
  // forgot to divide by 3 (CYLINDER volume formula — the equivalent
  // common mix-up for cones), forgot to square the radius, divided
  // by 2 instead of 3.
  const correctCoefficient =
    (dimensionOne * dimensionOne * dimensionTwo) / 3;

  return buildPiCoefficientDistractors({
    correctAnswer,
    coefficientPool: [
      dimensionOne * dimensionOne * dimensionTwo,
      dimensionOne * dimensionTwo,
      (dimensionOne * dimensionOne * dimensionTwo) / 2
    ],
    correctCoefficient
  });
}

function distractConeSurfaceArea(variables, correctAnswer) {
  const { radius, height, slantHeight } = variables;

  const correctCoefficient = radius * (radius + slantHeight);

  // Error family: forgot the base circle (lateral surface area
  // only — a very real, common omission), forgot the lateral
  // surface (used only the base circle's area), and confused the
  // height with the slant height (a genuine, common mix-up between
  // the cone's vertical height and its slant height).
  return buildPiCoefficientDistractors({
    correctAnswer,
    coefficientPool: [
      radius * slantHeight,
      radius * radius,
      radius * (radius + height)
    ],
    correctCoefficient
  });
}

function distractTrapezoidMidsegment(variables, correctAnswer) {
  const { knownValueOne, knownValueTwo } = variables;

  if (variables.scenario === "find_midsegment") {
    // Correct answer is (b1 + b2) / 2. Errors: forgot to divide by
    // 2 (gave the raw sum), subtracted instead of added, subtracted
    // then divided by 2.
    return buildNumericDistractors({
      correctAnswer,
      pool: [
        knownValueOne + knownValueTwo,
        Math.abs(knownValueOne - knownValueTwo),
        Math.abs(knownValueOne - knownValueTwo) / 2
      ],
      min: 1
    });
  }

  // find_missing_base: correct answer is 2*midsegment - knownBase.
  // Errors: forgot to double the midsegment first, doubled the
  // midsegment but forgot to subtract the known base, and simply
  // repeated the known base value.
  return buildNumericDistractors({
    correctAnswer,
    pool: [
      knownValueOne - knownValueTwo,
      knownValueOne * 2,
      knownValueTwo
    ],
    min: 1
  });
}

function distractRhombusDiagonalAngle(variables, correctAnswer) {
  const { vertexAngleMeasure } = variables;

  // Correct answer is vertexAngleMeasure / 2. Errors: forgot to
  // halve at all, confused with a supplementary relationship
  // (180 - vertex angle), and doubled instead of halved.
  return buildNumericDistractors({
    correctAnswer,
    pool: [
      vertexAngleMeasure,
      180 - vertexAngleMeasure,
      vertexAngleMeasure * 2
    ],
    min: 1,
    max: 359
  });
}

// --- Advanced circle angle relationships and similar right triangles ---

function distractCircleAngleTwoChords(variables, correctAnswer) {
  const { arcOne, arcTwo } = variables;

  // The single highest-value distractor: the EXTERIOR-angle formula
  // (half the DIFFERENCE instead of half the SUM) — confusing the
  // two-chords-inside-the-circle theorem with the
  // secants-outside-the-circle theorem is the most common real
  // error for this topic, since both involve "half of something
  // with the two arcs." Also: forgetting to halve at all, and using
  // only one arc.
  return buildNumericDistractors({
    correctAnswer,
    pool: [
      Math.abs(arcOne - arcTwo) / 2,
      arcOne + arcTwo,
      arcOne
    ],
    min: 1,
    max: 179
  });
}

function distractCircleAngleExterior(variables, correctAnswer) {
  const { nearArc, farArc } = variables;

  // The companion confusion to the one above: using the
  // INTERIOR-angle formula (half the SUM instead of half the
  // DIFFERENCE). Also: forgetting to halve the difference, and
  // using only the far arc.
  return buildNumericDistractors({
    correctAnswer,
    pool: [
      (farArc + nearArc) / 2,
      farArc - nearArc,
      farArc
    ],
    min: 1,
    max: 179
  });
}

function distractTangentChordAngle(variables, correctAnswer) {
  const { interceptedArc } = variables;

  // Correct answer is interceptedArc / 2. Errors: forgot to halve,
  // used the OTHER (major) arc instead (360 - intercepted) then
  // halved it, and doubled instead of halved.
  return buildNumericDistractors({
    correctAnswer,
    pool: [
      interceptedArc,
      (360 - interceptedArc) / 2,
      interceptedArc * 2
    ],
    min: 1,
    max: 359
  });
}

function distractRightTriangleAltitudeGeometricMean(variables, correctAnswer) {
  const { segmentOne, segmentTwo } = variables;

  // Correct answer is sqrt(segmentOne * segmentTwo). Errors:
  // averaged the two segments instead of taking the geometric mean
  // (a very common real confusion between arithmetic and geometric
  // mean), multiplied without taking the square root, and simply
  // added the two segments.
  return buildNumericDistractors({
    correctAnswer,
    pool: [
      (segmentOne + segmentTwo) / 2,
      segmentOne * segmentTwo,
      segmentOne + segmentTwo
    ],
    min: 1
  });
}

const TEMPLATE_DISTRACTORS = Object.freeze({
  identify_point_from_description: (v) => distractPoint(v),
  identify_line_from_labels: (v) => distractLine(v),
  identify_segment_from_endpoints: (v) => distractSegment(v),
  identify_ray_from_endpoint: (v) => distractRay(v),
  identify_plane_from_points: (v) => distractPlane(v),
  identify_angle_from_rays: (v) => distractAngle(v),
  classify_angle_by_measure: (v) => distractClassifyAngleByMeasure(v),
  measure_angle_from_relationship: (v, correct) =>
    distractMeasureAngleFromRelationship(v, correct),
  identify_complementary_angle_pair: (v, correct) =>
    distractRelationshipLabel(correct),
  identify_supplementary_angle_pair: (v, correct) =>
    distractRelationshipLabel(correct),
  identify_vertical_angle_pair: (v, correct) =>
    distractRelationshipLabel(correct),
  identify_adjacent_angle_pair: (v, correct) =>
    distractRelationshipLabel(correct),
  classify_polygon_by_sides: (v) => distractClassifyPolygonBySides(v),
  identify_polygon_from_attributes: (v) =>
    distractIdentifyPolygonFromAttributes(v),
  classify_triangle_by_sides: (v) => distractClassifyTriangleBySides(v),
  classify_triangle_by_angles: (v) => distractClassifyTriangleByAngles(v),
  triangle_angle_sum_missing_angle: (v, correct) =>
    distractTriangleAngleSum(v, correct),
  distance_between_two_points: (v, correct) =>
    distractDistance(v, correct),
  midpoint_between_two_points: (v) => distractMidpoint(v),
  identify_translation_from_rule: (v) => distractTranslation(v),
  identify_reflection_from_rule: (v) => distractReflection(v),
  identify_rotation_from_rule: (v) => distractRotation(v),
  identify_dilation_from_scale_factor: (v) => distractDilation(v),

  identify_angle_pair_type_from_transversal: (v) =>
    distractTransversalAnglePairType(v),

  angle_measure_from_parallel_lines: (v, correct) =>
    distractParallelLinesAngleMeasure(v, correct),

  classify_line_relationship_from_slopes: (v) =>
    distractClassifyLineRelationship(v),

  pythagorean_theorem_missing_side: (v, correct) =>
    distractPythagoreanTheorem(v, correct),

  special_right_triangle_45_45_90_missing_side: (v) =>
    distractSpecialRightTriangle454590(v),

  special_right_triangle_30_60_90_missing_side: (v) =>
    distractSpecialRightTriangle306090(v),

  right_triangle_trig_ratio_from_sides: (v, correct) =>
    distractRightTriangleTrigRatio(v, correct),

  polygon_interior_angle_sum_calculation: (v, correct) =>
    distractPolygonInteriorAngleSum(v, correct),

  regular_polygon_interior_angle_measure: (v, correct) =>
    distractRegularPolygonInteriorAngle(v, correct),

  parallelogram_angle_relationship_measure: (v, correct) =>
    distractParallelogramAngleRelationship(v, correct),

  quadrilateral_diagonal_bisection_length: (v, correct) =>
    distractQuadrilateralDiagonalBisection(v, correct),

  triangle_exterior_angle_measure: (v, correct) =>
    distractTriangleExteriorAngle(v, correct),

  identify_triangle_congruence_postulate: (v) =>
    distractTriangleCongruencePostulate(v),

  isosceles_triangle_angle_measure: (v, correct) =>
    distractIsoscelesTriangleAngle(v, correct),

  triangle_inequality_check: (v) =>
    distractTriangleInequalityCheck(v),

  identify_triangle_similarity_postulate: (v) =>
    distractTriangleSimilarityPostulate(v),

  similar_polygon_scale_factor_calculation: (v, correct) =>
    distractSimilarPolygonScaleFactor(v, correct),

  similar_polygon_missing_side_length: (v, correct) =>
    distractSimilarPolygonMissingSide(v, correct),

  triangle_proportionality_missing_segment: (v, correct) =>
    distractTriangleProportionality(v, correct),

  inscribed_angle_arc_measure: (v, correct) =>
    distractInscribedAngleArcMeasure(v, correct),

  circle_equation_from_center_radius: (v, correct) =>
    distractCircleEquation(v, correct),

  tangent_segment_length: (v, correct) =>
    distractTangentSegmentLength(v, correct),

  intersecting_chords_missing_segment: (v, correct) =>
    distractIntersectingChords(v, correct),

  circle_circumference_and_area_calculation: (v, correct) =>
    distractCircleCircumferenceAndArea(v, correct),

  arc_length_or_sector_area_calculation: (v, correct) =>
    distractArcLengthOrSectorArea(v, correct),

  prism_or_cylinder_volume_calculation: (v, correct) =>
    distractPrismOrCylinderVolume(v, correct),

  sphere_surface_area_or_volume_calculation: (v, correct) =>
    distractSphereSurfaceAreaOrVolume(v, correct),

  identify_conditional_statement_transformation: (v) =>
    distractConditionalStatementTransformation(v),

  identify_conditional_statement_part: (v) =>
    distractConditionalStatementPart(v),

  identify_algebraic_reasoning_property: (v) =>
    distractAlgebraicReasoningProperty(v),

  pyramid_or_cone_volume_calculation: (v, correct) =>
    distractPyramidOrConeVolume(v, correct),

  cone_surface_area_calculation: (v, correct) =>
    distractConeSurfaceArea(v, correct),

  trapezoid_midsegment_calculation: (v, correct) =>
    distractTrapezoidMidsegment(v, correct),

  rhombus_diagonal_angle_measure: (v, correct) =>
    distractRhombusDiagonalAngle(v, correct),

  circle_angle_two_chords_calculation: (v, correct) =>
    distractCircleAngleTwoChords(v, correct),

  circle_angle_exterior_calculation: (v, correct) =>
    distractCircleAngleExterior(v, correct),

  tangent_chord_angle_calculation: (v, correct) =>
    distractTangentChordAngle(v, correct),

  right_triangle_altitude_geometric_mean_calculation: (v, correct) =>
    distractRightTriangleAltitudeGeometricMean(v, correct)
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
    engineVersion: DISTRACTOR_ENGINE_VERSION,
    status: DISTRACTOR_STATUS.REJECTED,
    generated: false,
    templateId,
    problemTypeId,
    distractors: [],
    errors: protectedCopy(errors)
  };
}

function createGeneratedResult({
  templateId,
  problemTypeId,
  distractors
}) {
  return {
    engineVersion: DISTRACTOR_ENGINE_VERSION,
    status: DISTRACTOR_STATUS.GENERATED,
    generated: true,
    templateId,
    problemTypeId,
    distractors: protectedCopy(distractors),
    errors: []
  };
}

export class GeometryDistractorEngine {
  generate(input = {}) {
    const normalized = extractInput(input);
    const templateId = normalizeString(normalized.templateId);
    const problemTypeId = normalizeString(normalized.problemTypeId);
    const variables = normalized.variables;
    const correctAnswer = normalized.correctAnswer;
    const acceptableAnswers = Array.isArray(normalized.acceptableAnswers)
      ? normalized.acceptableAnswers
      : [correctAnswer];

    if (!templateId) {
      return createRejectedResult({
        problemTypeId,
        errors: ["Geometry Distractor Engine requires a templateId."]
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
          "Geometry Distractor Engine requires the variables object " +
          "produced by the certified Geometry Variable Generator."
        ]
      });
    }

    if (correctAnswer === undefined || correctAnswer === null) {
      return createRejectedResult({
        templateId,
        problemTypeId,
        errors: [
          "Geometry Distractor Engine requires the correctAnswer " +
          "produced by the certified Geometry Solver."
        ]
      });
    }

    const distractorFn = TEMPLATE_DISTRACTORS[templateId];

    if (typeof distractorFn !== "function") {
      return createRejectedResult({
        templateId,
        problemTypeId,
        errors: [
          `No Geometry distractor generator is registered for templateId ${templateId}.`
        ]
      });
    }

    try {
      const distractors = distractorFn(variables, correctAnswer);

      if (!Array.isArray(distractors) || distractors.length !== 3) {
        return createRejectedResult({
          templateId,
          problemTypeId,
          errors: [
            `Distractor generator for ${templateId} did not produce exactly 3 distractors.`
          ]
        });
      }

      const distinctFromAnswer = uniqueExcluding(
        distractors,
        acceptableAnswers
      );

      if (distinctFromAnswer.length !== 3) {
        return createRejectedResult({
          templateId,
          problemTypeId,
          errors: [
            `Distractor generator for ${templateId} produced a distractor matching an acceptable answer.`
          ]
        });
      }

      return createGeneratedResult({
        templateId,
        problemTypeId,
        distractors: distinctFromAnswer
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

  getEngineVersion() {
    return DISTRACTOR_ENGINE_VERSION;
  }
}

export const geometryDistractorEngine = new GeometryDistractorEngine();

export {
  DISTRACTOR_ENGINE_VERSION,
  DISTRACTOR_STATUS,
  CERTIFIED_TEMPLATE_IDS
};
