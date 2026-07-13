/**
 * Geometry OS
 * Geometry Figure Renderer v1.0.0
 *
 * Responsibility:
 * Render an SVG diagram for each of the 12 certified Geometry
 * templates whose registry entry declares requiresFigure: true.
 *
 * Design approach:
 * Rather than deriving pixel positions from the certified variables
 * (which are abstract letter labels, not coordinates, for most
 * templates), this renderer uses FIXED canonical layouts per
 * template — only the text labels change per question. This keeps
 * every diagram geometrically honest (arcs are computed with real
 * trigonometry, not eyeballed) while avoiding the collision/overlap
 * risk of randomly-positioned labels.
 *
 * All arc paths are computed as polylines sampled from the true
 * circular arc between two ray directions (see arcPolylinePoints),
 * verified against the interior angle in degrees — not drawn with
 * the SVG elliptical-arc command, which requires fragile
 * large-arc/sweep flag reasoning that is easy to get wrong silently.
 *
 * This renderer does NOT:
 * - generate variables, answers, distractors, or prompt text
 * - decide which templates require a figure (see the certified
 *   Geometry Template Registry — this renderer trusts that decision)
 */

const RENDERER_VERSION = "v1.2.0";

const RENDER_STATUS = Object.freeze({
  RENDERED: "geometry_figure_rendered",
  REJECTED: "geometry_figure_rejected"
});

const CERTIFIED_TEMPLATE_IDS = Object.freeze([
  "identify_point_from_description",
  "identify_line_from_labels",
  "identify_segment_from_endpoints",
  "identify_ray_from_endpoint",
  "identify_plane_from_points",
  "identify_angle_from_rays",
  "measure_angle_from_relationship",
  "identify_complementary_angle_pair",
  "identify_supplementary_angle_pair",
  "identify_vertical_angle_pair",
  "identify_adjacent_angle_pair",
  "identify_polygon_from_attributes",
  "identify_angle_pair_type_from_transversal",
  "angle_measure_from_parallel_lines",
  "right_triangle_altitude_geometric_mean_calculation",
  "circle_angle_two_chords_calculation",
  "circle_angle_exterior_calculation",
  "tangent_chord_angle_calculation",
  "tangent_segment_length",
  "inscribed_angle_arc_measure",
  "intersecting_chords_missing_segment"
]);

const ARROW_MARKER_DEFS =
  '<defs><marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" ' +
  'markerWidth="6" markerHeight="6" orient="auto-start-reverse">' +
  '<path d="M2 1L8 5L2 9" fill="none" stroke="context-stroke" ' +
  'stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>' +
  "</marker></defs>";

function protectedCopy(value) {
  if (value === undefined) return undefined;
  return JSON.parse(JSON.stringify(value));
}

function normalizeString(value) {
  return typeof value === "string" ? value.trim() : "";
}

function escapeXml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/**
 * Computes the unit direction vector from `from` to `to`.
 */
function unitVector(from, to) {
  const dx = to[0] - from[0];
  const dy = to[1] - from[1];
  const mag = Math.hypot(dx, dy);

  return [dx / mag, dy / mag];
}

/**
 * Samples `steps + 1` points along the true circular arc of the
 * given radius, centered at `vertex`, sweeping from unit direction
 * `unitA` to unit direction `unitB` the SHORT way (the interior
 * angle, not the reflex angle). Returns both the point list (for an
 * SVG polyline) and the interior angle in degrees, so callers can
 * assert the arc is mathematically correct rather than trusting
 * hand-picked flags.
 */
function arcPolylinePoints(vertex, unitA, unitB, radius, steps = 10) {
  const angleA = Math.atan2(unitA[1], unitA[0]);
  const angleB = Math.atan2(unitB[1], unitB[0]);

  let diff = angleB - angleA;
  while (diff > Math.PI) diff -= 2 * Math.PI;
  while (diff <= -Math.PI) diff += 2 * Math.PI;

  const points = [];

  for (let i = 0; i <= steps; i += 1) {
    const t = i / steps;
    const angle = angleA + diff * t;

    points.push([
      vertex[0] + radius * Math.cos(angle),
      vertex[1] + radius * Math.sin(angle)
    ]);
  }

  return {
    points,
    interiorDegrees: Math.abs((diff * 180) / Math.PI)
  };
}

function pointsToSvgString(points) {
  return points.map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");
}

// A literal color, not a CSS custom property. The original version
// used var(--text-primary), which silently depends on whatever page
// embeds the SVG to define that variable — a real bug found when a
// generated quiz was actually opened in a browser: dots rendered
// (fill's invalid-var fallback is black) but every line/ray/arc did
// NOT (stroke's invalid-var fallback is "none", i.e. invisible).
// Every SVG this renderer produces must be self-contained and render
// correctly with zero external CSS, since it may be embedded in a
// browser page, pasted into a document, converted to PDF, or opened
// as a standalone .svg file.
const FIGURE_INK_COLOR = "#1a1a1a";

function polylineSvg(points) {
  return (
    `<polyline points="${pointsToSvgString(points)}" fill="none" ` +
    `stroke="${FIGURE_INK_COLOR}" stroke-width="1.5"/>`
  );
}

function lineSvg(x1, y1, x2, y2, { arrowStart = false, arrowEnd = false } = {}) {
  const markers = [];
  if (arrowStart) markers.push('marker-start="url(#arrow)"');
  if (arrowEnd) markers.push('marker-end="url(#arrow)"');

  return (
    `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" ` +
    `stroke="${FIGURE_INK_COLOR}" stroke-width="2" ${markers.join(" ")}/>`
  );
}

function dotSvg(x, y, r = 5) {
  return `<circle cx="${x}" cy="${y}" r="${r}" fill="${FIGURE_INK_COLOR}"/>`;
}

function labelSvg(x, y, text, { size = "t", anchor = "middle" } = {}) {
  // font-size/font-weight/fill are set directly as attributes, not
  // left to an external "t"/"ts" CSS class (the class is kept only
  // so an embedding page CAN optionally restyle labels, but nothing
  // here depends on that class existing).
  const fontSize = size === "ts" ? 14 : 16;
  const fontWeight = size === "ts" ? 400 : 700;

  return (
    `<text class="${size}" x="${x}" y="${y}" text-anchor="${anchor}" ` +
    `fill="${FIGURE_INK_COLOR}" font-size="${fontSize}" font-weight="${fontWeight}" ` +
    `font-family="Arial, Helvetica, sans-serif">` +
    `${escapeXml(text)}</text>`
  );
}

function svgWrap(width, height, title, desc, body) {
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="100%" viewBox="0 0 ${width} ${height}" role="img">` +
    `<title>${escapeXml(title)}</title><desc>${escapeXml(desc)}</desc>` +
    ARROW_MARKER_DEFS +
    body +
    "</svg>"
  );
}

function generateRegularPolygonPoints(centerX, centerY, radius, sides) {
  const points = [];
  const startAngle = -Math.PI / 2;

  for (let i = 0; i < sides; i += 1) {
    const angle = startAngle + (i * 2 * Math.PI) / sides;

    points.push([
      centerX + radius * Math.cos(angle),
      centerY + radius * Math.sin(angle)
    ]);
  }

  return points;
}

// --- Per-template figure renderers ---

function renderPoint(variables) {
  const body =
    dotSvg(340, 130) + labelSvg(340, 108, variables.pointLabel);

  return svgWrap(
    680,
    200,
    `Point ${variables.pointLabel}`,
    `A single labeled point ${variables.pointLabel}.`,
    body
  );
}

function renderLine(variables) {
  const body =
    lineSvg(180, 130, 500, 130, { arrowStart: true, arrowEnd: true }) +
    dotSvg(220, 130) +
    dotSvg(460, 130) +
    labelSvg(220, 110, variables.pointA) +
    labelSvg(460, 110, variables.pointB);

  return svgWrap(
    680,
    200,
    `Line through ${variables.pointA} and ${variables.pointB}`,
    `A line extending infinitely through points ${variables.pointA} and ${variables.pointB}.`,
    body
  );
}

function renderSegment(variables) {
  const body =
    lineSvg(220, 130, 460, 130) +
    dotSvg(220, 130) +
    dotSvg(460, 130) +
    labelSvg(220, 110, variables.endpointA) +
    labelSvg(460, 110, variables.endpointB);

  return svgWrap(
    680,
    200,
    `Segment ${variables.endpointA}${variables.endpointB}`,
    `A segment with endpoints ${variables.endpointA} and ${variables.endpointB}.`,
    body
  );
}

function renderRay(variables) {
  const body =
    lineSvg(220, 130, 500, 130, { arrowEnd: true }) +
    dotSvg(220, 130) +
    labelSvg(220, 110, variables.endpoint) +
    labelSvg(460, 110, variables.directionPoint);

  return svgWrap(
    680,
    200,
    `Ray ${variables.endpoint}${variables.directionPoint}`,
    `A ray with endpoint ${variables.endpoint} passing through ${variables.directionPoint}.`,
    body
  );
}

function renderPlane(variables) {
  const poly =
    '<polygon points="140,80 400,105 365,225 105,200" fill="none" ' +
    `stroke="${FIGURE_INK_COLOR}" stroke-width="1.5" stroke-dasharray="4 3"/>`;

  const body =
    poly +
    dotSvg(210, 130, 4) +
    dotSvg(310, 150, 4) +
    dotSvg(220, 185, 4) +
    labelSvg(198, 118, variables.pointA) +
    labelSvg(325, 150, variables.pointB) +
    labelSvg(220, 205, variables.pointC);

  return svgWrap(
    680,
    260,
    `Plane ${variables.pointA}${variables.pointB}${variables.pointC}`,
    `A plane containing points ${variables.pointA}, ${variables.pointB}, and ${variables.pointC}.`,
    body
  );
}

function renderAngle(variables) {
  const K = [150, 260];
  const W = [150, 80];
  const G = [330, 140];

  const uW = unitVector(K, W);
  const uG = unitVector(K, G);
  const { points } = arcPolylinePoints(K, uW, uG, 40);

  const body =
    lineSvg(K[0], K[1], W[0], W[1], { arrowEnd: true }) +
    lineSvg(K[0], K[1], G[0], G[1], { arrowEnd: true }) +
    polylineSvg(points) +
    dotSvg(K[0], K[1]) +
    labelSvg(K[0], K[1] + 25, variables.vertex) +
    labelSvg(W[0], W[1] - 10, variables.pointA) +
    labelSvg(G[0] + 15, G[1], variables.pointB);

  return svgWrap(
    380,
    300,
    `Angle ${variables.pointA}${variables.vertex}${variables.pointB}`,
    `An angle with vertex ${variables.vertex} formed by rays to ${variables.pointA} and ${variables.pointB}.`,
    body
  );
}

/**
 * Shared renderer for the four angle-relationship figure families
 * (complementary, supplementary, vertical, adjacent), plus the
 * measure_angle_from_relationship template which reuses the same
 * three geometric archetypes (complementary/supplementary/vertical)
 * but labels one angle with its known measure and the other with
 * "?" since the unknown value is exactly what the question asks for.
 */
function renderComplementary(measureA, measureB) {
  const V = [150, 250];
  const uH = unitVector(V, [400, 250]);
  const uS = unitVector(V, [300, 130]);
  const uV = unitVector(V, [150, 60]);

  const arcA = arcPolylinePoints(V, uH, uS, 45).points;
  const arcB = arcPolylinePoints(V, uS, uV, 45).points;

  const body =
    lineSvg(V[0], V[1], 400, 250, { arrowEnd: true }) +
    lineSvg(V[0], V[1], 150, 60, { arrowEnd: true }) +
    lineSvg(V[0], V[1], 300, 130, { arrowEnd: true }) +
    polylineSvg(arcA) +
    polylineSvg(arcB) +
    dotSvg(V[0], V[1], 4) +
    labelSvg(230, 235, measureA) +
    labelSvg(178, 195, measureB);

  return svgWrap(
    460,
    300,
    "Complementary angles",
    `Two complementary angles measuring ${measureA} and ${measureB} degrees.`,
    body
  );
}

function renderSupplementary(measureA, measureB) {
  const V = [300, 180];
  const uSp = unitVector(V, [420, 70]);
  const uR = unitVector(V, [520, 180]);
  const uL = unitVector(V, [80, 180]);

  const arcA = arcPolylinePoints(V, uSp, uR, 45).points;
  const arcB = arcPolylinePoints(V, uL, uSp, 45).points;

  const body =
    lineSvg(80, 180, 520, 180, { arrowStart: true, arrowEnd: true }) +
    lineSvg(V[0], V[1], 420, 70, { arrowEnd: true }) +
    polylineSvg(arcA) +
    polylineSvg(arcB) +
    dotSvg(V[0], V[1], 4) +
    labelSvg(365, 150, measureA) +
    labelSvg(230, 150, measureB);

  return svgWrap(
    600,
    260,
    "Supplementary angles",
    `Two supplementary angles measuring ${measureA} and ${measureB} degrees.`,
    body
  );
}

function renderVertical(measureA, measureB) {
  const center = [340, 180];

  const u1 = unitVector(center, [250, 90]);
  const u2 = unitVector(center, [430, 90]);
  const u3 = unitVector(center, [250, 270]);
  const u4 = unitVector(center, [430, 270]);

  const topArc = arcPolylinePoints(center, u1, u2, 35).points;
  const bottomArc = arcPolylinePoints(center, u3, u4, 35).points;

  const body =
    lineSvg(250, 90, 430, 270, { arrowStart: true, arrowEnd: true }) +
    lineSvg(250, 270, 430, 90, { arrowStart: true, arrowEnd: true }) +
    polylineSvg(topArc) +
    polylineSvg(bottomArc) +
    labelSvg(340, 145, measureA) +
    labelSvg(340, 235, measureB);

  return svgWrap(
    680,
    340,
    "Vertical angles",
    `Two vertical angles measuring ${measureA} and ${measureB} degrees.`,
    body
  );
}

function renderAdjacent(measureOne, measureTwo) {
  const V = [300, 250];
  const uL = unitVector(V, [120, 140]);
  const uM = unitVector(V, [300, 60]);
  const uR = unitVector(V, [480, 140]);

  const arcOne = arcPolylinePoints(V, uL, uM, 45).points;
  const arcTwo = arcPolylinePoints(V, uM, uR, 45).points;

  const body =
    lineSvg(V[0], V[1], 120, 140, { arrowEnd: true }) +
    lineSvg(V[0], V[1], 300, 60, { arrowEnd: true }) +
    lineSvg(V[0], V[1], 480, 140, { arrowEnd: true }) +
    polylineSvg(arcOne) +
    polylineSvg(arcTwo) +
    dotSvg(V[0], V[1], 4) +
    labelSvg(240, 195, measureOne) +
    labelSvg(360, 195, measureTwo);

  return svgWrap(
    600,
    300,
    "Adjacent angles",
    `Two adjacent angles measuring ${measureOne} and ${measureTwo} degrees.`,
    body
  );
}

function renderComplementaryPair(variables) {
  return renderComplementary(
    `${variables.angleMeasureA}\u00B0`,
    `${variables.angleMeasureB}\u00B0`
  );
}

function renderSupplementaryPair(variables) {
  return renderSupplementary(
    `${variables.angleMeasureA}\u00B0`,
    `${variables.angleMeasureB}\u00B0`
  );
}

function renderVerticalPair(variables) {
  return renderVertical(
    `${variables.angleMeasure}\u00B0`,
    `${variables.angleMeasure}\u00B0`
  );
}

function renderAdjacentPair(variables) {
  return renderAdjacent(
    `${variables.angleOneMeasure}\u00B0`,
    `${variables.angleTwoMeasure}\u00B0`
  );
}

function renderMeasureAngleFromRelationship(variables) {
  const known = `${variables.knownAngle}\u00B0`;

  if (variables.relationshipType === "complementary") {
    return renderComplementary(known, "?");
  }

  if (variables.relationshipType === "supplementary") {
    return renderSupplementary(known, "?");
  }

  return renderVertical(known, "?");
}

function renderPolygonFromAttributes(variables) {
  const sides = variables.numberOfSides;
  const points = generateRegularPolygonPoints(340, 150, 100, sides);

  const polygonSvg =
    '<polygon points="' +
    pointsToSvgString(points) +
    `" fill="none" stroke="${FIGURE_INK_COLOR}" stroke-width="2"/>`;

  const dots = points.map((p) => dotSvg(p[0], p[1], 4)).join("");

  const caption = labelSvg(
    340,
    280,
    `Closed figure, ${sides} straight sides`,
    { size: "ts" }
  );

  return svgWrap(
    680,
    300,
    `Polygon with ${sides} sides`,
    `A closed figure with ${sides} straight sides.`,
    polygonSvg + dots + caption
  );
}

// --- Real-exam-fidelity figures: transversal, circle angles, altitude ---
// Added after comparing against actual released Florida B.E.S.T.
// Geometry EOC items, which showed these categories are typically
// presented with a labeled diagram, not just prose.

// Matches the exact 8 position phrases produced by
// TRANSVERSAL_ANGLE_PAIRS in the Variable Generator. Standard
// textbook/EOC numbering convention: 1-4 at the first intersection
// (upper-left, upper-right, lower-left, lower-right), 5-8 at the
// second, same quadrant order.
const TRANSVERSAL_POSITION_TO_NUMBER = Object.freeze({
  "the upper-left angle at the first intersection": 1,
  "the upper-right angle at the first intersection": 2,
  "the lower-left angle at the first intersection": 3,
  "the lower-right angle at the first intersection": 4,
  "the upper-left angle at the second intersection": 5,
  "the upper-right angle at the second intersection": 6,
  "the lower-left angle at the second intersection": 7,
  "the lower-right angle at the second intersection": 8
});

function drawTransversalDiagram(highlightedNumbers = []) {
  const line1Y = 110;
  const line2Y = 270;
  const transversalTop = [260, 30];
  const transversalBottom = [420, 350];

  const t1 =
    (line1Y - transversalTop[1]) /
    (transversalBottom[1] - transversalTop[1]);
  const intersection1 = [
    transversalTop[0] + t1 * (transversalBottom[0] - transversalTop[0]),
    line1Y
  ];

  const t2 =
    (line2Y - transversalTop[1]) /
    (transversalBottom[1] - transversalTop[1]);
  const intersection2 = [
    transversalTop[0] + t2 * (transversalBottom[0] - transversalTop[0]),
    line2Y
  ];

  const lines =
    lineSvg(60, line1Y, 620, line1Y, { arrowStart: true, arrowEnd: true }) +
    lineSvg(60, line2Y, 620, line2Y, { arrowStart: true, arrowEnd: true }) +
    lineSvg(
      transversalTop[0],
      transversalTop[1],
      transversalBottom[0],
      transversalBottom[1],
      { arrowStart: true, arrowEnd: true }
    );

  const offsets = {
    1: [-38, -18],
    2: [38, -18],
    3: [-38, 22],
    4: [38, 22],
    5: [-38, -18],
    6: [38, -18],
    7: [-38, 22],
    8: [38, 22]
  };

  const centers = {
    1: intersection1,
    2: intersection1,
    3: intersection1,
    4: intersection1,
    5: intersection2,
    6: intersection2,
    7: intersection2,
    8: intersection2
  };

  const highlightedSet = new Set(highlightedNumbers);

  let numberLabels = "";

  for (let number = 1; number <= 8; number += 1) {
    const center = centers[number];
    const offset = offsets[number];
    const labelX = center[0] + offset[0];
    const labelY = center[1] + offset[1];

    if (highlightedSet.has(number)) {
      numberLabels += `<circle cx="${labelX}" cy="${labelY - 5}" r="15" fill="none" stroke="${FIGURE_INK_COLOR}" stroke-width="1.5"/>`;
    }

    numberLabels += labelSvg(labelX, labelY, String(number));
  }

  return {
    body: lines + dotSvg(intersection1[0], intersection1[1], 4) +
      dotSvg(intersection2[0], intersection2[1], 4) + numberLabels,
    intersection1,
    intersection2
  };
}

function renderTransversalAnglePairType(variables) {
  const numberA =
    TRANSVERSAL_POSITION_TO_NUMBER[variables.angleDescriptionA];
  const numberB =
    TRANSVERSAL_POSITION_TO_NUMBER[variables.angleDescriptionB];

  const diagram = drawTransversalDiagram([numberA, numberB]);

  return svgWrap(
    680,
    380,
    "Transversal crossing two parallel lines",
    `Two parallel lines are cut by a transversal, forming eight numbered angles. Angles ${numberA} and ${numberB} are highlighted.`,
    diagram.body
  );
}

function renderParallelLinesAngleMeasure() {
  const diagram = drawTransversalDiagram([]);

  return svgWrap(
    680,
    380,
    "Transversal crossing two parallel lines",
    "Two parallel lines are cut by a transversal, forming eight numbered angles.",
    diagram.body
  );
}

function intersectLines(p1, p2, p3, p4) {
  const [x1, y1] = p1;
  const [x2, y2] = p2;
  const [x3, y3] = p3;
  const [x4, y4] = p4;

  const denom = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);

  if (denom === 0) {
    return null;
  }

  const t =
    ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / denom;

  return [x1 + t * (x2 - x1), y1 + t * (y2 - y1)];
}

function pointOnCircle(cx, cy, radius, degrees) {
  const rad = (degrees * Math.PI) / 180;

  return [cx + radius * Math.cos(rad), cy + radius * Math.sin(rad)];
}

function renderCircleAngleTwoChords(variables) {
  const { arcOne, arcTwo } = variables;
  const cx = 340;
  const cy = 180;
  const radius = 120;

  const remainingArc = 360 - arcOne - arcTwo;
  const gap = remainingArc / 2;

  const thetaA = -90;
  const thetaB = thetaA + arcOne;
  const thetaC = thetaB + gap;
  const thetaD = thetaC + arcTwo;

  const A = pointOnCircle(cx, cy, radius, thetaA);
  const B = pointOnCircle(cx, cy, radius, thetaB);
  const C = pointOnCircle(cx, cy, radius, thetaC);
  const D = pointOnCircle(cx, cy, radius, thetaD);

  const midAB = pointOnCircle(cx, cy, radius + 24, (thetaA + thetaB) / 2);
  const midCD = pointOnCircle(cx, cy, radius + 24, (thetaC + thetaD) / 2);

  const vertex = intersectLines(A, C, B, D);

  const circleSvg = `<circle cx="${cx}" cy="${cy}" r="${radius}" fill="none" stroke="${FIGURE_INK_COLOR}" stroke-width="2"/>`;

  const body =
    circleSvg +
    lineSvg(A[0], A[1], C[0], C[1]) +
    lineSvg(B[0], B[1], D[0], D[1]) +
    dotSvg(A[0], A[1], 3) +
    dotSvg(B[0], B[1], 3) +
    dotSvg(C[0], C[1], 3) +
    dotSvg(D[0], D[1], 3) +
    (vertex ? dotSvg(vertex[0], vertex[1], 3) : "") +
    labelSvg(midAB[0], midAB[1], `${arcOne}\u00B0`, { size: "ts" }) +
    labelSvg(midCD[0], midCD[1], `${arcTwo}\u00B0`, { size: "ts" });

  return svgWrap(
    680,
    380,
    "Two chords intersecting inside a circle",
    `Two chords intersect inside a circle, intercepting arcs of ${arcOne} and ${arcTwo} degrees.`,
    body
  );
}

function renderCircleAngleExterior(variables) {
  const { nearArc, farArc } = variables;
  const cx = 340;
  const cy = 170;
  const radius = 95;

  const N1 = pointOnCircle(cx, cy, radius, 90 - nearArc / 2);
  const N2 = pointOnCircle(cx, cy, radius, 90 + nearArc / 2);
  // Paired on the SAME side as their corresponding near point (N1 is
  // on the right, so its far point F1 must also be on the right;
  // pairing opposite sides was a real bug found by verification —
  // it put the "external" point inside the circle in 200 of 200
  // stress-test cases, since a secant's near and far intersection
  // must lie on the same side of the axis of symmetry for the two
  // secant lines to actually converge outside the circle.
  const F1 = pointOnCircle(cx, cy, radius, -90 + farArc / 2);
  const F2 = pointOnCircle(cx, cy, radius, -90 - farArc / 2);

  const externalPoint = intersectLines(F1, N1, F2, N2);

  const midNear = pointOnCircle(cx, cy, radius + 22, 90);
  const midFar = pointOnCircle(cx, cy, radius + 22, -90);

  const circleSvg = `<circle cx="${cx}" cy="${cy}" r="${radius}" fill="none" stroke="${FIGURE_INK_COLOR}" stroke-width="2"/>`;

  const secantLines = externalPoint
    ? lineSvg(externalPoint[0], externalPoint[1], F1[0], F1[1]) +
      lineSvg(externalPoint[0], externalPoint[1], F2[0], F2[1])
    : lineSvg(N1[0], N1[1], F1[0], F1[1]) +
      lineSvg(N2[0], N2[1], F2[0], F2[1]);

  const body =
    circleSvg +
    secantLines +
    dotSvg(N1[0], N1[1], 3) +
    dotSvg(N2[0], N2[1], 3) +
    dotSvg(F1[0], F1[1], 3) +
    dotSvg(F2[0], F2[1], 3) +
    (externalPoint
      ? dotSvg(externalPoint[0], externalPoint[1], 3)
      : "") +
    labelSvg(midNear[0], midNear[1], `${nearArc}\u00B0`, { size: "ts" }) +
    labelSvg(midFar[0], midFar[1], `${farArc}\u00B0`, { size: "ts" });

  return svgWrap(
    680,
    380,
    "Two secants meeting outside a circle",
    `Two secants meet at a point outside a circle, intercepting a near arc of ${nearArc} degrees and a far arc of ${farArc} degrees.`,
    body
  );
}

function renderRightTriangleAltitudeGeometricMean(variables) {
  const { segmentOne, segmentTwo } = variables;

  const Y = [130, 260];
  const Z = [570, 260];
  const totalWidth = Z[0] - Y[0];
  const ratio = segmentOne / (segmentOne + segmentTwo);

  const W = [Y[0] + ratio * totalWidth, 260];
  const X = [W[0], 260 - 150];

  const rightAngleMarkerSize = 14;
  const rightAngleMarker =
    `<polyline points="${W[0] - rightAngleMarkerSize},${W[1]} ` +
    `${W[0] - rightAngleMarkerSize},${W[1] - rightAngleMarkerSize} ` +
    `${W[0]},${W[1] - rightAngleMarkerSize}" fill="none" ` +
    `stroke="${FIGURE_INK_COLOR}" stroke-width="1.5"/>`;

  const body =
    lineSvg(Y[0], Y[1], Z[0], Z[1]) +
    lineSvg(Y[0], Y[1], X[0], X[1]) +
    lineSvg(X[0], X[1], Z[0], Z[1]) +
    lineSvg(X[0], X[1], W[0], W[1]) +
    rightAngleMarker +
    dotSvg(Y[0], Y[1], 4) +
    dotSvg(Z[0], Z[1], 4) +
    dotSvg(X[0], X[1], 4) +
    dotSvg(W[0], W[1], 3) +
    labelSvg(Y[0] - 15, Y[1] + 5, "Y") +
    labelSvg(Z[0] + 15, Z[1] + 5, "Z") +
    labelSvg(X[0], X[1] - 15, "X") +
    labelSvg(W[0], W[1] + 20, "W", { size: "ts" }) +
    labelSvg((Y[0] + W[0]) / 2, Y[1] + 20, String(segmentOne), {
      size: "ts"
    }) +
    labelSvg((W[0] + Z[0]) / 2, Z[1] + 20, String(segmentTwo), {
      size: "ts"
    });

  return svgWrap(
    680,
    340,
    "Right triangle with altitude to the hypotenuse",
    `Right triangle XYZ with altitude XW drawn to the hypotenuse, dividing it into segments of ${segmentOne} and ${segmentTwo}.`,
    body
  );
}

function renderTangentChordAngle(variables) {
  const { interceptedArc } = variables;
  const cx = 340;
  const cy = 160;
  const radius = 100;

  const T = pointOnCircle(cx, cy, radius, 90);
  const C = pointOnCircle(cx, cy, radius, 90 - interceptedArc);
  const midArc = pointOnCircle(cx, cy, radius + 22, 90 - interceptedArc / 2);

  const tangentLeft = [T[0] - 140, T[1]];
  const tangentRight = [T[0] + 140, T[1]];

  const circleSvg = `<circle cx="${cx}" cy="${cy}" r="${radius}" fill="none" stroke="${FIGURE_INK_COLOR}" stroke-width="2"/>`;

  const body =
    circleSvg +
    lineSvg(tangentLeft[0], tangentLeft[1], tangentRight[0], tangentRight[1]) +
    lineSvg(T[0], T[1], C[0], C[1]) +
    dotSvg(T[0], T[1], 4) +
    dotSvg(C[0], C[1], 3) +
    labelSvg(T[0], T[1] + 22, "T", { size: "ts" }) +
    labelSvg(C[0] - 15, C[1] - 8, "C", { size: "ts" }) +
    labelSvg(midArc[0], midArc[1], `${interceptedArc}\u00B0`, {
      size: "ts"
    });

  return svgWrap(
    680,
    380,
    "Tangent and chord meeting at the point of tangency",
    `A tangent line and a chord meet at point T on a circle, intercepting an arc of ${interceptedArc} degrees.`,
    body
  );
}

function renderTangentSegmentLength(variables) {
  const { givenTangentLength } = variables;
  const cx = 340;
  const cy = 130;
  const radius = 85;
  const distanceToExternalPoint = 200;

  const P = [cx, cy + distanceToExternalPoint];

  // Thales' theorem construction: the point of tangency lies where
  // the radius is perpendicular to the tangent segment, i.e. on the
  // circle with diameter OP. The half-angle at the center between
  // the line to P and each tangent point is arccos(radius/distance).
  const alphaDegrees =
    (Math.acos(radius / distanceToExternalPoint) * 180) / Math.PI;

  const T1 = pointOnCircle(cx, cy, radius, 90 - alphaDegrees);
  const T2 = pointOnCircle(cx, cy, radius, 90 + alphaDegrees);

  const midPT1 = [(P[0] + T1[0]) / 2, (P[1] + T1[1]) / 2];
  const midPT2 = [(P[0] + T2[0]) / 2, (P[1] + T2[1]) / 2];

  const circleSvg = `<circle cx="${cx}" cy="${cy}" r="${radius}" fill="none" stroke="${FIGURE_INK_COLOR}" stroke-width="2"/>`;

  const body =
    circleSvg +
    lineSvg(P[0], P[1], T1[0], T1[1]) +
    lineSvg(P[0], P[1], T2[0], T2[1]) +
    dotSvg(P[0], P[1], 4) +
    dotSvg(T1[0], T1[1], 3) +
    dotSvg(T2[0], T2[1], 3) +
    labelSvg(P[0], P[1] + 20, "P", { size: "ts" }) +
    labelSvg(midPT1[0] - 28, midPT1[1], String(givenTangentLength), {
      size: "ts"
    }) +
    labelSvg(midPT2[0] + 20, midPT2[1], "?", { size: "ts" });

  return svgWrap(
    680,
    400,
    "Two tangent segments from an external point",
    `Two tangent segments are drawn from external point P to a circle. One tangent segment measures ${givenTangentLength}.`,
    body
  );
}

function renderInscribedAngleArcMeasure(variables) {
  const { scenario, knownMeasure, answerValue } = variables;
  const arcMeasure = scenario === "find_arc" ? answerValue : knownMeasure;
  const inscribedAngleDisplay =
    scenario === "find_arc" ? String(knownMeasure) : "?";
  const arcDisplay = scenario === "find_arc" ? "?" : String(knownMeasure);

  const cx = 340;
  const cy = 170;
  const radius = 110;

  const V = pointOnCircle(cx, cy, radius, 90);
  const A = pointOnCircle(cx, cy, radius, -90 - arcMeasure / 2);
  const B = pointOnCircle(cx, cy, radius, -90 + arcMeasure / 2);
  const midArc = pointOnCircle(cx, cy, radius + 22, -90);

  const circleSvg = `<circle cx="${cx}" cy="${cy}" r="${radius}" fill="none" stroke="${FIGURE_INK_COLOR}" stroke-width="2"/>`;

  const body =
    circleSvg +
    lineSvg(V[0], V[1], A[0], A[1]) +
    lineSvg(V[0], V[1], B[0], B[1]) +
    dotSvg(V[0], V[1], 4) +
    dotSvg(A[0], A[1], 3) +
    dotSvg(B[0], B[1], 3) +
    labelSvg(V[0], V[1] + 20, "V", { size: "ts" }) +
    labelSvg(A[0] - 15, A[1] - 8, "A", { size: "ts" }) +
    labelSvg(B[0] + 15, B[1] - 8, "B", { size: "ts" }) +
    labelSvg(V[0], V[1] - 28, inscribedAngleDisplay, { size: "ts" }) +
    labelSvg(midArc[0], midArc[1], arcDisplay, { size: "ts" });

  return svgWrap(
    680,
    400,
    "Inscribed angle and its intercepted arc",
    "Inscribed angle V intercepts arc AB.",
    body
  );
}

function renderIntersectingChordsMissingSegment(variables) {
  const { segmentP, segmentQ, segmentR, segmentS } = variables;
  const cx = 340;
  const cy = 170;
  const radius = 110;

  // Four points spaced 90 degrees apart (a square inscribed in the
  // circle), so the two "diagonal" chords always cross exactly at
  // the center with clean, even separation between every point —
  // regardless of the actual segment length values, which don't
  // need to visually correspond to angular position for this
  // theorem (only the products of lengths matter, not the arcs).
  // The original angles (-150, -40, 40, 200) put two points only 10
  // degrees apart, collapsing them together visually — a real bug
  // reported directly from an opened exported quiz, where the
  // figure looked like two lines radiating from nearly the same
  // corner point instead of a proper X crossing near the center.
  const A = pointOnCircle(cx, cy, radius, 135);
  const B = pointOnCircle(cx, cy, radius, 45);
  const C = pointOnCircle(cx, cy, radius, -45);
  const D = pointOnCircle(cx, cy, radius, -135);

  const X = intersectLines(A, C, B, D);

  const midAX = X ? [(A[0] + X[0]) / 2, (A[1] + X[1]) / 2] : A;
  const midXC = X ? [(X[0] + C[0]) / 2, (X[1] + C[1]) / 2] : C;
  const midBX = X ? [(B[0] + X[0]) / 2, (B[1] + X[1]) / 2] : B;
  const midXD = X ? [(X[0] + D[0]) / 2, (X[1] + D[1]) / 2] : D;

  const circleSvg = `<circle cx="${cx}" cy="${cy}" r="${radius}" fill="none" stroke="${FIGURE_INK_COLOR}" stroke-width="2"/>`;

  const body =
    circleSvg +
    lineSvg(A[0], A[1], C[0], C[1]) +
    lineSvg(B[0], B[1], D[0], D[1]) +
    dotSvg(A[0], A[1], 3) +
    dotSvg(B[0], B[1], 3) +
    dotSvg(C[0], C[1], 3) +
    dotSvg(D[0], D[1], 3) +
    (X ? dotSvg(X[0], X[1], 3) : "") +
    labelSvg(midAX[0] - 12, midAX[1] - 8, String(segmentP), {
      size: "ts"
    }) +
    labelSvg(midXC[0] + 12, midXC[1] - 8, String(segmentQ), {
      size: "ts"
    }) +
    labelSvg(midBX[0] - 12, midBX[1] + 14, String(segmentR), {
      size: "ts"
    }) +
    labelSvg(midXD[0] + 12, midXD[1] + 14, "?", { size: "ts" });

  return svgWrap(
    680,
    400,
    "Two chords intersecting inside a circle",
    `Two chords intersect inside a circle, dividing each other into segments of ${segmentP}, ${segmentQ}, ${segmentR}, and an unknown length.`,
    body
  );
}

const TEMPLATE_RENDERERS = Object.freeze({
  identify_point_from_description: renderPoint,
  identify_line_from_labels: renderLine,
  identify_segment_from_endpoints: renderSegment,
  identify_ray_from_endpoint: renderRay,
  identify_plane_from_points: renderPlane,
  identify_angle_from_rays: renderAngle,
  measure_angle_from_relationship: renderMeasureAngleFromRelationship,
  identify_complementary_angle_pair: renderComplementaryPair,
  identify_supplementary_angle_pair: renderSupplementaryPair,
  identify_vertical_angle_pair: renderVerticalPair,
  identify_adjacent_angle_pair: renderAdjacentPair,
  identify_polygon_from_attributes: renderPolygonFromAttributes,
  identify_angle_pair_type_from_transversal: renderTransversalAnglePairType,
  angle_measure_from_parallel_lines: renderParallelLinesAngleMeasure,
  right_triangle_altitude_geometric_mean_calculation:
    renderRightTriangleAltitudeGeometricMean,
  circle_angle_two_chords_calculation: renderCircleAngleTwoChords,
  circle_angle_exterior_calculation: renderCircleAngleExterior,
  tangent_chord_angle_calculation: renderTangentChordAngle,
  tangent_segment_length: renderTangentSegmentLength,
  inscribed_angle_arc_measure: renderInscribedAngleArcMeasure,
  intersecting_chords_missing_segment:
    renderIntersectingChordsMissingSegment
});

function extractInput(input = {}) {
  if (!input || typeof input !== "object") return {};
  return input;
}

function createRejectedResult({ templateId = null, errors = [] }) {
  return {
    rendererVersion: RENDERER_VERSION,
    status: RENDER_STATUS.REJECTED,
    rendered: false,
    templateId,
    svg: null,
    errors: protectedCopy(errors)
  };
}

function createRenderedResult({ templateId, svg }) {
  return {
    rendererVersion: RENDERER_VERSION,
    status: RENDER_STATUS.RENDERED,
    rendered: true,
    templateId,
    svg,
    errors: []
  };
}

export class GeometryFigureRenderer {
  render(input = {}) {
    const normalized = extractInput(input);
    const templateId = normalizeString(normalized.templateId);
    const variables = normalized.variables;

    if (!templateId) {
      return createRejectedResult({
        errors: ["Geometry Figure Renderer requires a templateId."]
      });
    }

    if (!CERTIFIED_TEMPLATE_IDS.includes(templateId)) {
      return createRejectedResult({
        templateId,
        errors: [
          `Template ${templateId} does not require a figure, or is not certified for figure rendering.`
        ]
      });
    }

    if (!variables || typeof variables !== "object") {
      return createRejectedResult({
        templateId,
        errors: [
          "Geometry Figure Renderer requires the variables object " +
          "produced by the certified Geometry Variable Generator."
        ]
      });
    }

    const renderFn = TEMPLATE_RENDERERS[templateId];

    if (typeof renderFn !== "function") {
      return createRejectedResult({
        templateId,
        errors: [
          `No Geometry figure renderer is registered for templateId ${templateId}.`
        ]
      });
    }

    try {
      const svg = renderFn(variables);

      if (
        !svg ||
        typeof svg !== "string" ||
        !svg.startsWith("<svg") ||
        svg.includes("undefined") ||
        svg.includes("NaN")
      ) {
        return createRejectedResult({
          templateId,
          errors: [
            `Figure renderer for ${templateId} produced invalid SVG output.`
          ]
        });
      }

      return createRenderedResult({ templateId, svg });
    } catch (error) {
      return createRejectedResult({
        templateId,
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

export const geometryFigureRenderer = new GeometryFigureRenderer();

export { RENDERER_VERSION, RENDER_STATUS, CERTIFIED_TEMPLATE_IDS };
