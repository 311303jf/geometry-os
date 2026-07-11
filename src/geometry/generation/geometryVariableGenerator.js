/**
 * Geometry OS
 * Geometry Variable Generator v1.1.2
 *
 * Responsibility:
 * Generate valid variable sets for all certified Geometry templates.
 *
 * The generator uses internal semantic variable names and then maps
 * those values to the exact requiredFields declared by the certified
 * Geometry Template Registry.
 *
 * This generator does NOT:
 * - calculate final answers
 * - generate distractors
 * - render prompts
 * - generate explanations
 * - modify templates
 * - modify certified engines
 *
 * CHANGELOG v1.1.2:
 * - Fixed identify_vertical_angle_pair: added intersectionLabel and
 *   angleLabels directly to the generator output, plus fallback
 *   aliases in resolveRequiredFieldValue for robustness.
 *
 * CHANGELOG v1.1.3:
 * - Fixed identify_angle_from_rays: added rayPointA and rayPointB
 *   directly to the generator output, plus fallback aliases in
 *   resolveRequiredFieldValue for robustness.
 *
 * CHANGELOG v1.1.4:
 * - Fixed identify_polygon_from_attributes: added figureAttributes
 *   (composite object) directly to the generator output, plus
 *   fallback alias in resolveRequiredFieldValue. NOTE: exact shape
 *   of figureAttributes was inferred (not confirmed against the
 *   live registry schema) — verify against geometryTemplateResolver.js
 *   if certification still fails on this field.
 *
 * CHANGELOG v1.1.5:
 * - Cross-checked all 23 templates against the real
 *   geometryTemplateRegistry.js v1.0.9 requiredFields. Fixed:
 *   - identify_adjacent_angle_pair: added angleLabels array
 *   - distance_between_two_points: added pointA/pointB coordinate objects
 *   - midpoint_between_two_points: added pointA/pointB coordinate objects
 *   - identify_rotation_from_rule: added rotationCenter, rotationAngle,
 *     rotationDirection (registry names differ from internal semantic
 *     names center/rotationDegrees/direction)
 *   - identify_dilation_from_scale_factor: added dilationCenter
 */

const GENERATOR_VERSION = "v1.1.5";

const GENERATION_STATUS = Object.freeze({
  GENERATED: "geometry_variables_generated",
  REJECTED: "geometry_variables_rejected"
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
  "identify_dilation_from_scale_factor"
]);

const POINT_LABELS = Object.freeze([
  "A", "B", "C", "D", "E", "F", "G", "H",
  "J", "K", "L", "M", "N", "P", "Q", "R",
  "S", "T", "U", "V", "W", "X", "Y", "Z"
]);

const PLANE_LABELS = Object.freeze([
  "M", "N", "P", "R", "S", "T", "W"
]);

const POLYGON_NAMES = Object.freeze({
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

function protectedCopy(value) {
  if (value === undefined) {
    return undefined;
  }

  return JSON.parse(JSON.stringify(value));
}

function normalizeString(value) {
  return typeof value === "string"
    ? value.trim()
    : "";
}

function normalizeInteger(value, fallback = 0) {
  const numericValue = Number(value);

  return Number.isFinite(numericValue)
    ? Math.trunc(numericValue)
    : fallback;
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
    state += 0x6D2B79F5;

    let value = state;

    value = Math.imul(
      value ^ (value >>> 15),
      value | 1
    );

    value ^= value + Math.imul(
      value ^ (value >>> 7),
      value | 61
    );

    return (
      ((value ^ (value >>> 14)) >>> 0) /
      4294967296
    );
  };
}

function randomInteger(random, minimum, maximum) {
  return Math.floor(
    random() * (maximum - minimum + 1)
  ) + minimum;
}

function randomChoice(random, values = []) {
  if (!Array.isArray(values) || values.length === 0) {
    return null;
  }

  return values[
    randomInteger(random, 0, values.length - 1)
  ];
}

function shuffle(random, values = []) {
  const result = [...values];

  for (
    let index = result.length - 1;
    index > 0;
    index -= 1
  ) {
    const replacementIndex =
      randomInteger(random, 0, index);

    [
      result[index],
      result[replacementIndex]
    ] = [
      result[replacementIndex],
      result[index]
    ];
  }

  return result;
}

function chooseDistinctLabels(random, count) {
  return shuffle(
    random,
    POINT_LABELS
  ).slice(0, count);
}

function chooseNonZeroInteger(
  random,
  minimum = -10,
  maximum = 10
) {
  const values = [];

  for (
    let value = minimum;
    value <= maximum;
    value += 1
  ) {
    if (value !== 0) {
      values.push(value);
    }
  }

  return randomChoice(random, values);
}

function extractTemplateInput(input = {}) {
  if (!input || typeof input !== "object") {
    return {};
  }

  const nestedObjects = [
    input.resolvedTemplate,
    input.templateResolution,
    input.resolution
  ].filter(
    (candidate) =>
      candidate &&
      typeof candidate === "object" &&
      !Array.isArray(candidate)
  );

  return Object.assign({}, ...nestedObjects, input);
}

function resolveTemplateRecord(input = {}) {
  const normalizedInput =
    extractTemplateInput(input);

  if (
    normalizedInput.template &&
    typeof normalizedInput.template === "object" &&
    !Array.isArray(normalizedInput.template)
  ) {
    return normalizedInput.template;
  }

  return normalizedInput;
}

function resolveTemplateId(input = {}) {
  const record = resolveTemplateRecord(input);

  return normalizeString(
    record.templateId ||
    extractTemplateInput(input).templateId
  );
}

function resolveProblemTypeId(input = {}) {
  const record = resolveTemplateRecord(input);

  return normalizeString(
    record.problemTypeId ||
    extractTemplateInput(input).problemTypeId
  );
}

function resolveRequiredFields(input = {}) {
  const record = resolveTemplateRecord(input);

  if (Array.isArray(record.requiredFields)) {
    return protectedCopy(record.requiredFields);
  }

  const normalizedInput =
    extractTemplateInput(input);

  return Array.isArray(
    normalizedInput.requiredFields
  )
    ? protectedCopy(
        normalizedInput.requiredFields
      )
    : [];
}

function resolveGenerationIndex(
  input = {},
  options = {}
) {
  return normalizeInteger(
    options.generationIndex ??
    input.generationIndex,
    0
  );
}

function resolveSeed(
  templateId,
  generationIndex,
  input = {},
  options = {}
) {
  return String(
    options.seed ??
    input.seed ??
    `${templateId}:${generationIndex}`
  );
}

function firstDefined(...values) {
  return values.find(
    (value) =>
      value !== undefined &&
      value !== null
  );
}

/**
 * Maps internal semantic names to possible certified required-field
 * names. The requiredFields array remains the source of truth.
 */
function resolveRequiredFieldValue(
  field,
  variables
) {
  const aliases = {
    pointLabel:
      variables.pointLabel,

    pointLabelA:
      firstDefined(
        variables.pointLabelA,
        variables.pointA,
        variables.endpointA,
        variables.vertex
      ),

    pointLabelB:
      firstDefined(
        variables.pointLabelB,
        variables.pointB,
        variables.endpointB,
        variables.throughPoint
      ),

    pointLabelC:
      firstDefined(
        variables.pointLabelC,
        variables.pointC,
        variables.sharedPoint
      ),

    pointLabelD:
      firstDefined(
        variables.pointLabelD,
        variables.pointD
      ),

    endpointLabel:
      firstDefined(
        variables.endpointLabel,
        variables.endpoint
      ),

    endpointLabelA:
      firstDefined(
        variables.endpointLabelA,
        variables.endpointA,
        variables.pointA
      ),

    endpointLabelB:
      firstDefined(
        variables.endpointLabelB,
        variables.endpointB,
        variables.pointB
      ),

    throughPointLabel:
      firstDefined(
        variables.throughPointLabel,
        variables.throughPoint,
        variables.directionPoint,
        variables.pointB
      ),

    directionPoint:
      firstDefined(
        variables.directionPoint,
        variables.throughPoint,
        variables.throughPointLabel,
        variables.pointB
      ),

    vertexLabel:
      firstDefined(
        variables.vertexLabel,
        variables.vertex
      ),

    rayPointLabelA:
      firstDefined(
        variables.rayPointLabelA,
        variables.rayPointA,
        variables.pointA
      ),

    rayPointLabelB:
      firstDefined(
        variables.rayPointLabelB,
        variables.rayPointB,
        variables.pointB
      ),

    // NUEVO — requerido por el registry certificado para
    // identify_angle_from_rays (variante corta sin "Label").
    rayPointA:
      firstDefined(
        variables.rayPointA,
        variables.rayPointLabelA,
        variables.pointA
      ),

    rayPointB:
      firstDefined(
        variables.rayPointB,
        variables.rayPointLabelB,
        variables.pointB
      ),

    planeLabel:
      variables.planeLabel,

    description:
      variables.description,

    angleMeasure:
      firstDefined(
        variables.angleMeasure,
        variables.knownAngle
      ),

    knownAngleMeasure:
      firstDefined(
        variables.knownAngleMeasure,
        variables.knownAngle
      ),

    unknownAngleMeasure:
      firstDefined(
        variables.unknownAngleMeasure,
        variables.unknownAngle
      ),

    angleMeasureA:
      firstDefined(
        variables.angleMeasureA,
        variables.angleA,
        variables.angleOneMeasure
      ),

    angleMeasureB:
      firstDefined(
        variables.angleMeasureB,
        variables.angleB,
        variables.angleTwoMeasure
      ),

    angleMeasureC:
      firstDefined(
        variables.angleMeasureC,
        variables.angleC
      ),

    missingAngleMeasure:
      firstDefined(
        variables.missingAngleMeasure,
        variables.missingAngle,
        variables.unknownAngle
      ),

    totalMeasure:
      firstDefined(
        variables.totalMeasure,
        variables.sum
      ),

    relationshipType:
      variables.relationshipType,

    angleLabelA:
      firstDefined(
        variables.angleLabelA,
        variables.angleOne
      ),

    angleLabelB:
      firstDefined(
        variables.angleLabelB,
        variables.angleTwo
      ),

    // NUEVO — requerido por el registry certificado para
    // identify_vertical_angle_pair. Usa el vértice como
    // etiqueta de intersección si no viene ya definido.
    intersectionLabel:
      firstDefined(
        variables.intersectionLabel,
        variables.vertex,
        variables.vertexLabel
      ),

    // NUEVO — requerido por el registry certificado para
    // identify_vertical_angle_pair. Construye el array a partir
    // de angleOne/angleTwo (o angleLabelA/angleLabelB) si no
    // viene ya definido explícitamente.
    angleLabels:
      firstDefined(
        variables.angleLabels,
        variables.angleOne && variables.angleTwo
          ? [variables.angleOne, variables.angleTwo]
          : undefined,
        variables.angleLabelA && variables.angleLabelB
          ? [variables.angleLabelA, variables.angleLabelB]
          : undefined
      ),

    numberOfSides:
      firstDefined(
        variables.numberOfSides,
        variables.sideCount
      ),

    sideCount:
      firstDefined(
        variables.sideCount,
        variables.numberOfSides
      ),

    numberOfVertices:
      firstDefined(
        variables.numberOfVertices,
        variables.vertexCount
      ),

    vertexCount:
      firstDefined(
        variables.vertexCount,
        variables.numberOfVertices
      ),

    polygonName:
      firstDefined(
        variables.polygonName,
        variables.polygonType
      ),

    polygonType:
      firstDefined(
        variables.polygonType,
        variables.polygonName
      ),

    polygonClassification:
      firstDefined(
        variables.polygonClassification,
        variables.polygonName,
        variables.polygonType
      ),

    isClosed:
      variables.isClosed,

    hasStraightSides:
      variables.hasStraightSides,

    // NUEVO — requerido por el registry certificado para
    // identify_polygon_from_attributes. Shape inferido: objeto
    // compuesto con los atributos conocidos de la figura.
    figureAttributes:
      firstDefined(
        variables.figureAttributes,
        (variables.sideCount !== undefined ||
          variables.isClosed !== undefined)
          ? {
              sideCount: variables.sideCount,
              numberOfSides: variables.numberOfSides,
              vertexCount: variables.vertexCount,
              isClosed: variables.isClosed,
              hasStraightSides: variables.hasStraightSides
            }
          : undefined
      ),

    sideLengthA:
      firstDefined(
        variables.sideLengthA,
        variables.sideA
      ),

    sideLengthB:
      firstDefined(
        variables.sideLengthB,
        variables.sideB
      ),

    sideLengthC:
      firstDefined(
        variables.sideLengthC,
        variables.sideC
      ),

    triangleType:
      variables.triangleType,

    triangleClassification:
      firstDefined(
        variables.triangleClassification,
        variables.triangleType
      ),

    x1:
      variables.x1,

    y1:
      variables.y1,

    x2:
      variables.x2,

    y2:
      variables.y2,

    pointAX:
      variables.x1,

    pointAY:
      variables.y1,

    pointBX:
      variables.x2,

    pointBY:
      variables.y2,

    // NUEVO — requerido por distance_between_two_points y
    // midpoint_between_two_points (objetos de coordenadas).
    pointA:
      firstDefined(
        variables.pointA,
        (variables.x1 !== undefined && variables.y1 !== undefined)
          ? { x: variables.x1, y: variables.y1 }
          : undefined
      ),

    pointB:
      firstDefined(
        variables.pointB,
        (variables.x2 !== undefined && variables.y2 !== undefined)
          ? { x: variables.x2, y: variables.y2 }
          : undefined
      ),

    midpointX:
      variables.midpointX,

    midpointY:
      variables.midpointY,

    horizontalChange:
      variables.horizontalChange,

    verticalChange:
      variables.verticalChange,

    x:
      variables.x,

    y:
      variables.y,

    originalX:
      variables.x,

    originalY:
      variables.y,

    imageX:
      variables.imageX,

    imageY:
      variables.imageY,

    horizontalShift:
      variables.horizontalShift,

    verticalShift:
      variables.verticalShift,

    translationX:
      variables.horizontalShift,

    translationY:
      variables.verticalShift,

    reflectionLine:
      variables.reflectionLine,

    rotationDegrees:
      variables.rotationDegrees,

    direction:
      variables.direction,

    center:
      variables.center,

    // NUEVO — requerido por identify_rotation_from_rule
    // (nombres distintos a los semánticos internos).
    rotationCenter:
      firstDefined(
        variables.rotationCenter,
        variables.center
      ),

    rotationAngle:
      firstDefined(
        variables.rotationAngle,
        variables.rotationDegrees
      ),

    rotationDirection:
      firstDefined(
        variables.rotationDirection,
        variables.direction
      ),

    scaleFactor:
      variables.scaleFactor,

    // NUEVO — requerido por identify_dilation_from_scale_factor.
    dilationCenter:
      firstDefined(
        variables.dilationCenter,
        variables.center
      ),

    rule:
      variables.rule,

    transformationRule:
      variables.rule
  };

  return aliases[field];
}

/**
 * Adds exact registry-declared required-field names while preserving
 * the richer semantic fields generated by each template generator.
 */
function satisfyRequiredFields(
  requiredFields,
  variables
) {
  const normalizedVariables = {
    ...variables
  };

  requiredFields.forEach((field) => {
    if (
      typeof field !== "string" ||
      Object.prototype.hasOwnProperty.call(
        normalizedVariables,
        field
      )
    ) {
      return;
    }

    const resolvedValue =
      resolveRequiredFieldValue(
        field,
        normalizedVariables
      );

    if (
      resolvedValue !== undefined &&
      resolvedValue !== null
    ) {
      normalizedVariables[field] =
        resolvedValue;
    }
  });

  return normalizedVariables;
}

function getMissingRequiredFields(
  requiredFields = [],
  variables = {}
) {
  return requiredFields.filter((field) => {
    if (typeof field !== "string") {
      return true;
    }

    if (
      !Object.prototype.hasOwnProperty.call(
        variables,
        field
      )
    ) {
      return true;
    }

    return (
      variables[field] === undefined ||
      variables[field] === null
    );
  });
}

function createRejectedResult({
  templateId = null,
  problemTypeId = null,
  requiredFields = [],
  errors = []
}) {
  return {
    generatorVersion: GENERATOR_VERSION,
    status: GENERATION_STATUS.REJECTED,
    generated: false,
    templateId,
    problemTypeId,
    generationIndex: null,
    seed: null,
    requiredFields:
      protectedCopy(requiredFields),
    generatedFieldCount: 0,
    requiredFieldsSatisfied: false,
    variables: null,
    errors: protectedCopy(errors)
  };
}

function createGeneratedResult({
  templateId,
  problemTypeId,
  generationIndex,
  seed,
  requiredFields,
  variables
}) {
  const normalizedVariables =
    satisfyRequiredFields(
      requiredFields,
      variables
    );

  const missingRequiredFields =
    getMissingRequiredFields(
      requiredFields,
      normalizedVariables
    );

  if (missingRequiredFields.length > 0) {
    return createRejectedResult({
      templateId,
      problemTypeId,
      requiredFields,
      errors: [
        `Generated variables are missing required fields: ${missingRequiredFields.join(", ")}.`
      ]
    });
  }

  return {
    generatorVersion: GENERATOR_VERSION,
    status: GENERATION_STATUS.GENERATED,
    generated: true,
    templateId,
    problemTypeId,
    generationIndex,
    seed,
    requiredFields:
      protectedCopy(requiredFields),
    generatedFieldCount:
      Object.keys(normalizedVariables).length,
    requiredFieldsSatisfied: true,
    variables:
      protectedCopy(normalizedVariables),
    errors: []
  };
}

function generatePointDescriptionVariables(random) {
  const [pointLabel] =
    chooseDistinctLabels(random, 1);

  return {
    pointLabel,
    description: randomChoice(random, [
      "a location with no size",
      "an exact position in space",
      "a geometric figure represented by a dot",
      "a location named with a capital letter"
    ])
  };
}

function generateLineVariables(random) {
  const [pointA, pointB] =
    chooseDistinctLabels(random, 2);

  return {
    pointA,
    pointB,
    pointLabelA: pointA,
    pointLabelB: pointB,
    lineName: `line ${pointA}${pointB}`,
    reverseLineName: `line ${pointB}${pointA}`
  };
}

function generateSegmentVariables(random) {
  const [endpointA, endpointB] =
    chooseDistinctLabels(random, 2);

  return {
    endpointA,
    endpointB,
    endpointLabelA: endpointA,
    endpointLabelB: endpointB,
    pointLabelA: endpointA,
    pointLabelB: endpointB,
    segmentName:
      `segment ${endpointA}${endpointB}`,
    reverseSegmentName:
      `segment ${endpointB}${endpointA}`
  };
}

function generateRayVariables(random) {
  const [endpoint, directionPoint] =
    chooseDistinctLabels(random, 2);

  return {
    endpoint,
    endpointLabel: endpoint,

    directionPoint,

    throughPoint: directionPoint,
    throughPointLabel: directionPoint,

    pointLabelA: endpoint,
    pointLabelB: directionPoint,

    rayName:
      `ray ${endpoint}${directionPoint}`,

    reverseOrder:
      `ray ${directionPoint}${endpoint}`
  };
}

function generatePlaneVariables(random) {
  const [pointA, pointB, pointC] =
    chooseDistinctLabels(random, 3);

  const planeLabel =
    randomChoice(random, PLANE_LABELS);

  return {
    pointA,
    pointB,
    pointC,
    pointLabelA: pointA,
    pointLabelB: pointB,
    pointLabelC: pointC,
    planeLabel,
    planeName:
      `plane ${pointA}${pointB}${pointC}`
  };
}

function generateAngleVariables(random) {
  const [vertex, pointA, pointB] =
    chooseDistinctLabels(random, 3);

  return {
    vertex,
    vertexLabel: vertex,
    pointA,
    pointB,
    pointLabelA: pointA,
    pointLabelB: pointB,
    rayPointLabelA: pointA,
    rayPointLabelB: pointB,

    // NUEVO — el registry certificado exige estos dos campos
    // exactos (sin "Label") para identify_angle_from_rays.
    rayPointA: pointA,
    rayPointB: pointB,

    rayA: `ray ${vertex}${pointA}`,
    rayB: `ray ${vertex}${pointB}`,
    angleName:
      `angle ${pointA}${vertex}${pointB}`,
    reverseAngleName:
      `angle ${pointB}${vertex}${pointA}`
  };
}

function generateClassifyAngleVariables(random) {
  const angleType =
    randomChoice(random, [
      "acute",
      "right",
      "obtuse",
      "straight"
    ]);

  let angleMeasure;

  if (angleType === "acute") {
    angleMeasure =
      randomInteger(random, 15, 85);
  } else if (angleType === "right") {
    angleMeasure = 90;
  } else if (angleType === "obtuse") {
    angleMeasure =
      randomInteger(random, 95, 175);
  } else {
    angleMeasure = 180;
  }

  return {
    angleMeasure,
    angleType
  };
}

function generateMeasureAngleRelationshipVariables(
  random
) {
  const relationshipType =
    randomChoice(random, [
      "complementary",
      "supplementary",
      "vertical"
    ]);

  if (relationshipType === "complementary") {
    const knownAngle =
      randomInteger(random, 15, 75);

    return {
      relationshipType,
      totalMeasure: 90,
      knownAngle,
      knownAngleMeasure: knownAngle,
      unknownAngle: 90 - knownAngle,
      unknownAngleMeasure: 90 - knownAngle
    };
  }

  if (relationshipType === "supplementary") {
    const knownAngle =
      randomInteger(random, 25, 155);

    return {
      relationshipType,
      totalMeasure: 180,
      knownAngle,
      knownAngleMeasure: knownAngle,
      unknownAngle: 180 - knownAngle,
      unknownAngleMeasure: 180 - knownAngle
    };
  }

  const knownAngle =
    randomInteger(random, 20, 160);

  return {
    relationshipType,
    totalMeasure: null,
    knownAngle,
    knownAngleMeasure: knownAngle,
    unknownAngle: knownAngle,
    unknownAngleMeasure: knownAngle
  };
}

function generateComplementaryVariables(random) {
  const angleA =
    randomInteger(random, 10, 80);

  const angleB = 90 - angleA;

  return {
    angleA,
    angleB,
    angleMeasureA: angleA,
    angleMeasureB: angleB,
    sum: 90,
    totalMeasure: 90,
    relationshipType: "complementary"
  };
}

function generateSupplementaryVariables(random) {
  const angleA =
    randomInteger(random, 20, 160);

  const angleB = 180 - angleA;

  return {
    angleA,
    angleB,
    angleMeasureA: angleA,
    angleMeasureB: angleB,
    sum: 180,
    totalMeasure: 180,
    relationshipType: "supplementary"
  };
}

function generateVerticalAngleVariables(random) {
  const [
    vertex,
    pointA,
    pointB,
    pointC,
    pointD
  ] = chooseDistinctLabels(random, 5);

  const angleMeasure =
    randomInteger(random, 20, 160);

  const angleOne =
    `angle ${pointA}${vertex}${pointB}`;

  const angleTwo =
    `angle ${pointC}${vertex}${pointD}`;

  return {
    vertex,
    vertexLabel: vertex,
    pointA,
    pointB,
    pointC,
    pointD,
    pointLabelA: pointA,
    pointLabelB: pointB,
    pointLabelC: pointC,
    pointLabelD: pointD,
    angleMeasure,
    verticalAngleMeasure: angleMeasure,
    angleMeasureA: angleMeasure,
    angleMeasureB: angleMeasure,
    angleOne,
    angleTwo,
    angleLabelA: angleOne,
    angleLabelB: angleTwo,
    relationshipType: "vertical",

    // NUEVO — el registry certificado exige estos dos campos
    // exactos para identify_vertical_angle_pair.
    intersectionLabel: vertex,
    angleLabels: [angleOne, angleTwo]
  };
}

function generateAdjacentAngleVariables(random) {
  const [
    vertex,
    pointA,
    sharedPoint,
    pointB
  ] = chooseDistinctLabels(random, 4);

  const angleOneMeasure =
    randomInteger(random, 20, 70);

  const angleTwoMeasure =
    randomInteger(random, 20, 70);

  const angleOne =
    `angle ${pointA}${vertex}${sharedPoint}`;

  const angleTwo =
    `angle ${sharedPoint}${vertex}${pointB}`;

  return {
    vertex,
    vertexLabel: vertex,
    pointA,
    sharedPoint,
    pointB,
    pointLabelA: pointA,
    pointLabelB: sharedPoint,
    pointLabelC: pointB,
    angleOne,
    angleTwo,
    angleLabelA: angleOne,
    angleLabelB: angleTwo,

    // NUEVO — el registry certificado exige este campo exacto
    // para identify_adjacent_angle_pair.
    angleLabels: [angleOne, angleTwo],

    angleOneMeasure,
    angleTwoMeasure,
    angleMeasureA: angleOneMeasure,
    angleMeasureB: angleTwoMeasure,
    relationshipType: "adjacent"
  };
}

function generatePolygonBySidesVariables(random) {
  const sideCount =
    randomChoice(random, [
      3, 4, 5, 6, 7, 8, 9, 10, 12
    ]);

  return {
    sideCount,
    numberOfSides: sideCount,
    polygonName:
      POLYGON_NAMES[sideCount],
    polygonClassification:
      POLYGON_NAMES[sideCount]
  };
}

function generatePolygonAttributeVariables(random) {
  const polygonType =
    randomChoice(random, [
      "triangle",
      "quadrilateral",
      "pentagon",
      "hexagon",
      "octagon"
    ]);

  const sideCounts = {
    triangle: 3,
    quadrilateral: 4,
    pentagon: 5,
    hexagon: 6,
    octagon: 8
  };

  const sideCount =
    sideCounts[polygonType];

  return {
    polygonType,
    polygonName: polygonType,
    polygonClassification: polygonType,
    sideCount,
    numberOfSides: sideCount,
    vertexCount: sideCount,
    numberOfVertices: sideCount,
    isClosed: true,
    hasStraightSides: true,

    // NUEVO — el registry certificado exige este campo compuesto
    // para identify_polygon_from_attributes. Shape inferido.
    figureAttributes: {
      sideCount,
      numberOfSides: sideCount,
      vertexCount: sideCount,
      isClosed: true,
      hasStraightSides: true
    }
  };
}

function generateTriangleBySidesVariables(random) {
  const triangleType =
    randomChoice(random, [
      "equilateral",
      "isosceles",
      "scalene"
    ]);

  let sideA;
  let sideB;
  let sideC;

  if (triangleType === "equilateral") {
    const side =
      randomInteger(random, 4, 15);

    sideA = side;
    sideB = side;
    sideC = side;
  } else if (triangleType === "isosceles") {
    const equalSide =
      randomInteger(random, 5, 15);

    let base =
      randomInteger(random, 3, 15);

    while (
      base === equalSide ||
      base >= equalSide * 2
    ) {
      base = randomInteger(random, 3, 15);
    }

    sideA = equalSide;
    sideB = equalSide;
    sideC = base;
  } else {
    const sets = [
      [4, 5, 6],
      [5, 6, 8],
      [6, 7, 9],
      [7, 8, 10],
      [8, 9, 12],
      [9, 11, 13]
    ];

    [
      sideA,
      sideB,
      sideC
    ] = randomChoice(random, sets);
  }

  return {
    sideA,
    sideB,
    sideC,
    sideLengthA: sideA,
    sideLengthB: sideB,
    sideLengthC: sideC,
    triangleType,
    triangleClassification: triangleType
  };
}

function generateTriangleByAnglesVariables(random) {
  const triangleType =
    randomChoice(random, [
      "acute",
      "right",
      "obtuse"
    ]);

  let angleA;
  let angleB;
  let angleC;

  if (triangleType === "right") {
    angleA =
      randomInteger(random, 25, 65);

    angleB = 90 - angleA;
    angleC = 90;
  } else if (triangleType === "obtuse") {
    angleC =
      randomInteger(random, 95, 125);

    const remaining =
      180 - angleC;

    angleA =
      randomInteger(
        random,
        20,
        remaining - 20
      );

    angleB =
      remaining - angleA;
  } else {
    const sets = [
      [60, 60, 60],
      [50, 60, 70],
      [55, 55, 70],
      [45, 65, 70],
      [50, 50, 80]
    ];

    [
      angleA,
      angleB,
      angleC
    ] = randomChoice(random, sets);
  }

  return {
    angleA,
    angleB,
    angleC,
    angleMeasureA: angleA,
    angleMeasureB: angleB,
    angleMeasureC: angleC,
    triangleType,
    triangleClassification: triangleType
  };
}

function generateTriangleAngleSumVariables(random) {
  const angleA =
    randomInteger(random, 25, 85);

  const maximumAngleB =
    Math.min(120, 155 - angleA);

  const angleB =
    randomInteger(
      random,
      20,
      maximumAngleB
    );

  const missingAngle =
    180 - angleA - angleB;

  return {
    angleA,
    angleB,
    angleMeasureA: angleA,
    angleMeasureB: angleB,
    missingAngle,
    missingAngleMeasure: missingAngle,
    totalMeasure: 180
  };
}

function generateDistanceVariables(random) {
  const triples = [
    [3, 4, 5],
    [5, 12, 13],
    [6, 8, 10],
    [8, 15, 17],
    [7, 24, 25]
  ];

  const [
    horizontalMagnitude,
    verticalMagnitude
  ] = randomChoice(random, triples);

  const x1 =
    randomInteger(random, -8, 3);

  const y1 =
    randomInteger(random, -8, 3);

  const x2 =
    x1 +
    randomChoice(random, [-1, 1]) *
    horizontalMagnitude;

  const y2 =
    y1 +
    randomChoice(random, [-1, 1]) *
    verticalMagnitude;

  return {
    x1,
    y1,
    x2,
    y2,
    pointAX: x1,
    pointAY: y1,
    pointBX: x2,
    pointBY: y2,

    // NUEVO — el registry certificado exige estos dos campos
    // exactos (objetos de coordenadas) para distance_between_two_points.
    pointA: { x: x1, y: y1 },
    pointB: { x: x2, y: y2 },

    horizontalChange: x2 - x1,
    verticalChange: y2 - y1
  };
}

function generateMidpointVariables(random) {
  const midpointX =
    randomInteger(random, -6, 6);

  const midpointY =
    randomInteger(random, -6, 6);

  const horizontalOffset =
    randomInteger(random, 1, 6);

  const verticalOffset =
    randomInteger(random, 1, 6);

  const x1 =
    midpointX - horizontalOffset;

  const y1 =
    midpointY - verticalOffset;

  const x2 =
    midpointX + horizontalOffset;

  const y2 =
    midpointY + verticalOffset;

  return {
    x1,
    y1,
    x2,
    y2,
    pointAX: x1,
    pointAY: y1,
    pointBX: x2,
    pointBY: y2,

    // NUEVO — el registry certificado exige estos dos campos
    // exactos (objetos de coordenadas) para midpoint_between_two_points.
    pointA: { x: x1, y: y1 },
    pointB: { x: x2, y: y2 },

    midpointX,
    midpointY
  };
}

function generateTranslationVariables(random) {
  const x =
    randomInteger(random, -8, 8);

  const y =
    randomInteger(random, -8, 8);

  const horizontalShift =
    chooseNonZeroInteger(random, -7, 7);

  const verticalShift =
    chooseNonZeroInteger(random, -7, 7);

  const imageX =
    x + horizontalShift;

  const imageY =
    y + verticalShift;

  const rule =
    `(x, y) → (x ${horizontalShift >= 0 ? "+" : "−"} ${Math.abs(horizontalShift)}, y ${verticalShift >= 0 ? "+" : "−"} ${Math.abs(verticalShift)})`;

  return {
    x,
    y,
    originalX: x,
    originalY: y,
    horizontalShift,
    verticalShift,
    translationX: horizontalShift,
    translationY: verticalShift,
    imageX,
    imageY,
    rule,
    transformationRule: rule
  };
}

function generateReflectionVariables(random) {
  const x =
    chooseNonZeroInteger(random, -8, 8);

  const y =
    chooseNonZeroInteger(random, -8, 8);

  const reflectionLine =
    randomChoice(random, [
      "x-axis",
      "y-axis",
      "y = x",
      "y = -x"
    ]);

  let imageX;
  let imageY;
  let rule;

  if (reflectionLine === "x-axis") {
    imageX = x;
    imageY = -y;
    rule = "(x, y) → (x, -y)";
  } else if (reflectionLine === "y-axis") {
    imageX = -x;
    imageY = y;
    rule = "(x, y) → (-x, y)";
  } else if (reflectionLine === "y = x") {
    imageX = y;
    imageY = x;
    rule = "(x, y) → (y, x)";
  } else {
    imageX = -y;
    imageY = -x;
    rule = "(x, y) → (-y, -x)";
  }

  return {
    x,
    y,
    originalX: x,
    originalY: y,
    reflectionLine,
    imageX,
    imageY,
    rule,
    transformationRule: rule
  };
}

function generateRotationVariables(random) {
  const x =
    chooseNonZeroInteger(random, -8, 8);

  const y =
    chooseNonZeroInteger(random, -8, 8);

  const rotationDegrees =
    randomChoice(random, [
      90,
      180,
      270
    ]);

  let imageX;
  let imageY;
  let rule;

  if (rotationDegrees === 90) {
    imageX = -y;
    imageY = x;
    rule = "(x, y) → (-y, x)";
  } else if (rotationDegrees === 180) {
    imageX = -x;
    imageY = -y;
    rule = "(x, y) → (-x, -y)";
  } else {
    imageX = y;
    imageY = -x;
    rule = "(x, y) → (y, -x)";
  }

  return {
    x,
    y,
    originalX: x,
    originalY: y,
    rotationDegrees,
    direction: "counterclockwise",
    center: "origin",

    // NUEVO — el registry certificado exige estos tres campos
    // exactos (nombres distintos a los semánticos internos)
    // para identify_rotation_from_rule.
    rotationCenter: "origin",
    rotationAngle: rotationDegrees,
    rotationDirection: "counterclockwise",

    imageX,
    imageY,
    rule,
    transformationRule: rule
  };
}

function generateDilationVariables(random) {
  const scaleFactor =
    randomChoice(random, [
      0.5,
      2,
      3,
      4
    ]);

  let x;
  let y;

  if (scaleFactor === 0.5) {
    x =
      randomInteger(random, -5, 5) * 2;

    y =
      randomInteger(random, -5, 5) * 2;
  } else {
    x =
      randomInteger(random, -6, 6);

    y =
      randomInteger(random, -6, 6);
  }

  const imageX =
    x * scaleFactor;

  const imageY =
    y * scaleFactor;

  const rule =
    `(x, y) → (${scaleFactor}x, ${scaleFactor}y)`;

  return {
    x,
    y,
    originalX: x,
    originalY: y,
    scaleFactor,
    center: "origin",

    // NUEVO — el registry certificado exige este campo exacto
    // para identify_dilation_from_scale_factor.
    dilationCenter: "origin",

    imageX,
    imageY,
    rule,
    transformationRule: rule
  };
}

const TEMPLATE_GENERATORS = Object.freeze({
  identify_point_from_description:
    generatePointDescriptionVariables,

  identify_line_from_labels:
    generateLineVariables,

  identify_segment_from_endpoints:
    generateSegmentVariables,

  identify_ray_from_endpoint:
    generateRayVariables,

  identify_plane_from_points:
    generatePlaneVariables,

  identify_angle_from_rays:
    generateAngleVariables,

  classify_angle_by_measure:
    generateClassifyAngleVariables,

  measure_angle_from_relationship:
    generateMeasureAngleRelationshipVariables,

  identify_complementary_angle_pair:
    generateComplementaryVariables,

  identify_supplementary_angle_pair:
    generateSupplementaryVariables,

  identify_vertical_angle_pair:
    generateVerticalAngleVariables,

  identify_adjacent_angle_pair:
    generateAdjacentAngleVariables,

  classify_polygon_by_sides:
    generatePolygonBySidesVariables,

  identify_polygon_from_attributes:
    generatePolygonAttributeVariables,

  classify_triangle_by_sides:
    generateTriangleBySidesVariables,

  classify_triangle_by_angles:
    generateTriangleByAnglesVariables,

  triangle_angle_sum_missing_angle:
    generateTriangleAngleSumVariables,

  distance_between_two_points:
    generateDistanceVariables,

  midpoint_between_two_points:
    generateMidpointVariables,

  identify_translation_from_rule:
    generateTranslationVariables,

  identify_reflection_from_rule:
    generateReflectionVariables,

  identify_rotation_from_rule:
    generateRotationVariables,

  identify_dilation_from_scale_factor:
    generateDilationVariables
});

export class GeometryVariableGenerator {
  generate(input = {}, options = {}) {
    const templateId =
      resolveTemplateId(input);

    const problemTypeId =
      resolveProblemTypeId(input);

    const requiredFields =
      resolveRequiredFields(input);

    if (!templateId) {
      return createRejectedResult({
        problemTypeId,
        requiredFields,
        errors: [
          "Geometry Variable Generator requires a templateId."
        ]
      });
    }

    if (
      !CERTIFIED_TEMPLATE_IDS.includes(
        templateId
      )
    ) {
      return createRejectedResult({
        templateId,
        problemTypeId,
        requiredFields,
        errors: [
          `Unsupported certified Geometry templateId: ${templateId}.`
        ]
      });
    }

    const generator =
      TEMPLATE_GENERATORS[templateId];

    if (typeof generator !== "function") {
      return createRejectedResult({
        templateId,
        problemTypeId,
        requiredFields,
        errors: [
          `No Geometry variable generator is registered for templateId ${templateId}.`
        ]
      });
    }

    const generationIndex =
      resolveGenerationIndex(
        input,
        options
      );

    const seed =
      resolveSeed(
        templateId,
        generationIndex,
        input,
        options
      );

    const random =
      createSeededRandom(seed);

    try {
      const variables =
        generator(random, {
          templateId,
          problemTypeId,
          generationIndex,
          seed
        });

      if (
        !variables ||
        typeof variables !== "object" ||
        Array.isArray(variables)
      ) {
        return createRejectedResult({
          templateId,
          problemTypeId,
          requiredFields,
          errors: [
            `Template generator ${templateId} did not return a variable object.`
          ]
        });
      }

      return createGeneratedResult({
        templateId,
        problemTypeId,
        generationIndex,
        seed,
        requiredFields,
        variables
      });
    } catch (error) {
      return createRejectedResult({
        templateId,
        problemTypeId,
        requiredFields,
        errors: [
          error instanceof Error
            ? error.message
            : String(error)
        ]
      });
    }
  }

  generateVariables(
    input = {},
    options = {}
  ) {
    return this.generate(
      input,
      options
    );
  }

  supportsTemplate(templateId) {
    return CERTIFIED_TEMPLATE_IDS.includes(
      normalizeString(templateId)
    );
  }

  getSupportedTemplateIds() {
    return protectedCopy(
      CERTIFIED_TEMPLATE_IDS
    );
  }

  getGeneratorVersion() {
    return GENERATOR_VERSION;
  }
}

export const geometryVariableGenerator =
  new GeometryVariableGenerator();

export {
  GENERATOR_VERSION,
  GENERATION_STATUS,
  CERTIFIED_TEMPLATE_IDS
};
