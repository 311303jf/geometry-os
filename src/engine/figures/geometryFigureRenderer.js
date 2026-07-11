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

const RENDERER_VERSION = "v1.0.0";

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
  "identify_polygon_from_attributes"
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

function polylineSvg(points) {
  return (
    `<polyline points="${pointsToSvgString(points)}" fill="none" ` +
    'stroke="var(--text-primary)" stroke-width="1.5"/>'
  );
}

function lineSvg(x1, y1, x2, y2, { arrowStart = false, arrowEnd = false } = {}) {
  const markers = [];
  if (arrowStart) markers.push('marker-start="url(#arrow)"');
  if (arrowEnd) markers.push('marker-end="url(#arrow)"');

  return (
    `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" ` +
    `stroke="var(--text-primary)" stroke-width="2" ${markers.join(" ")}/>`
  );
}

function dotSvg(x, y, r = 5) {
  return `<circle cx="${x}" cy="${y}" r="${r}" fill="var(--text-primary)"/>`;
}

function labelSvg(x, y, text, { size = "t", anchor = "middle" } = {}) {
  return (
    `<text class="${size}" x="${x}" y="${y}" text-anchor="${anchor}">` +
    `${escapeXml(text)}</text>`
  );
}

function svgWrap(width, height, title, desc, body) {
  return (
    `<svg width="100%" viewBox="0 0 ${width} ${height}" role="img">` +
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
    'stroke="var(--text-primary)" stroke-width="1.5" stroke-dasharray="4 3"/>';

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
    '" fill="none" stroke="var(--text-primary)" stroke-width="2"/>';

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
  identify_polygon_from_attributes: renderPolygonFromAttributes
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
