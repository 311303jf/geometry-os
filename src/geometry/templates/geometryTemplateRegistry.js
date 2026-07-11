/**
 * Geometry OS
 * Geometry Template Registry v1.0.9
 *
 * Responsibility:
 * Store reusable Geometry question template metadata.
 *
 * Important:
 * This registry does NOT generate values.
 * It does NOT generate questions.
 * It does NOT resolve blueprints.
 * It does NOT replace the Question Factory.
 * It only defines reusable Geometry templates for future engines.
 */

import {
  geometryProblemTypeRegistry
} from "../problemTypes/geometryProblemTypeRegistry.js";

export class GeometryTemplateRegistry {
  constructor({
    problemTypeRegistry = geometryProblemTypeRegistry
  } = {}) {
    this.version = "v1.6.0";
    this.problemTypeRegistry = problemTypeRegistry;

    this.templates = [
      {
        templateId: "identify_point_from_description",
        problemTypeId: "identify_point",
        templateFamily: "foundational_identification",
        promptPattern:
          "Which labeled object represents the point described?",
        requiredFields: [
          "pointLabel"
        ],
        outputType: "multiple_choice",
        expectedAnswerFormat: "geometry_object_name",
        requiresFigure: true
      },
      {
        templateId: "identify_line_from_labels",
        problemTypeId: "identify_line",
        templateFamily: "foundational_identification",
        promptPattern:
          "Which name correctly identifies the line through the given points?",
        requiredFields: [
          "pointLabelA",
          "pointLabelB"
        ],
        outputType: "multiple_choice",
        expectedAnswerFormat: "geometry_object_name",
        requiresFigure: true
      },
      {
        templateId: "identify_segment_from_endpoints",
        problemTypeId: "identify_segment",
        templateFamily: "foundational_identification",
        promptPattern:
          "Which name correctly identifies the segment with the given endpoints?",
        requiredFields: [
          "endpointA",
          "endpointB"
        ],
        outputType: "multiple_choice",
        expectedAnswerFormat: "geometry_object_name",
        requiresFigure: true
      },
      {
        templateId: "identify_ray_from_endpoint",
        problemTypeId: "identify_ray",
        templateFamily: "foundational_identification",
        promptPattern:
          "Which name correctly identifies the ray with the given endpoint and direction point?",
        requiredFields: [
          "endpoint",
          "directionPoint"
        ],
        outputType: "multiple_choice",
        expectedAnswerFormat: "geometry_object_name",
        requiresFigure: true
      },
      {
        templateId: "identify_plane_from_points",
        problemTypeId: "identify_plane",
        templateFamily: "foundational_identification",
        promptPattern:
          "Which name correctly identifies the plane containing the given points?",
        requiredFields: [
          "pointLabelA",
          "pointLabelB",
          "pointLabelC"
        ],
        outputType: "multiple_choice",
        expectedAnswerFormat: "geometry_object_name",
        requiresFigure: true
      },
      {
        templateId: "identify_angle_from_rays",
        problemTypeId: "identify_angle",
        templateFamily: "angle_identification",
        promptPattern:
          "Which name correctly identifies the angle formed by the given rays?",
        requiredFields: [
          "rayPointA",
          "vertexLabel",
          "rayPointB"
        ],
        outputType: "multiple_choice",
        expectedAnswerFormat: "geometry_object_name",
        requiresFigure: true
      },
      {
        templateId: "classify_angle_by_measure",
        problemTypeId: "classify_angle",
        templateFamily: "angle_classification",
        promptPattern:
          "How should an angle with the given measure be classified?",
        requiredFields: [
          "angleMeasure"
        ],
        outputType: "multiple_choice",
        expectedAnswerFormat: "classification_label",
        requiresFigure: false
      },
      {
        templateId: "measure_angle_from_relationship",
        problemTypeId: "measure_angle",
        templateFamily: "angle_measurement",
        promptPattern:
          "What is the measure of the unknown angle?",
        requiredFields: [
          "knownAngleMeasure",
          "relationshipType"
        ],
        outputType: "multiple_choice",
        expectedAnswerFormat: "numeric_degrees",
        requiresFigure: true
      },
      {
        templateId: "identify_complementary_angle_pair",
        problemTypeId: "identify_complementary_angles",
        templateFamily: "angle_relationships",
        promptPattern:
          "Which pair of angles is complementary?",
        requiredFields: [
          "angleMeasureA",
          "angleMeasureB"
        ],
        outputType: "multiple_choice",
        expectedAnswerFormat: "classification_label",
        requiresFigure: true
      },
      {
        templateId: "identify_supplementary_angle_pair",
        problemTypeId: "identify_supplementary_angles",
        templateFamily: "angle_relationships",
        promptPattern:
          "Which pair of angles is supplementary?",
        requiredFields: [
          "angleMeasureA",
          "angleMeasureB"
        ],
        outputType: "multiple_choice",
        expectedAnswerFormat: "classification_label",
        requiresFigure: true
      },
      {
        templateId: "identify_vertical_angle_pair",
        problemTypeId: "identify_vertical_angles",
        templateFamily: "angle_relationships",
        promptPattern:
          "Which pair of angles is vertical?",
        requiredFields: [
          "intersectionLabel",
          "angleLabels"
        ],
        outputType: "multiple_choice",
        expectedAnswerFormat: "classification_label",
        requiresFigure: true
      },
      {
        templateId: "identify_adjacent_angle_pair",
        problemTypeId: "identify_adjacent_angles",
        templateFamily: "angle_relationships",
        promptPattern:
          "Which pair of angles is adjacent?",
        requiredFields: [
          "vertexLabel",
          "angleLabels"
        ],
        outputType: "multiple_choice",
        expectedAnswerFormat: "classification_label",
        requiresFigure: true
      },
      {
        templateId: "classify_polygon_by_sides",
        problemTypeId: "classify_polygon",
        templateFamily: "polygon_classification",
        promptPattern:
          "How should a polygon with the given number of sides be classified?",
        requiredFields: [
          "sideCount"
        ],
        outputType: "multiple_choice",
        expectedAnswerFormat: "classification_label",
        requiresFigure: false
      },
      {
        templateId: "identify_polygon_from_attributes",
        problemTypeId: "identify_polygon",
        templateFamily: "polygon_identification",
        promptPattern:
          "Which figure satisfies the definition of a polygon?",
        requiredFields: [
          "figureAttributes"
        ],
        outputType: "multiple_choice",
        expectedAnswerFormat: "classification_label",
        requiresFigure: true
      },
      {
        templateId: "classify_triangle_by_sides",
        problemTypeId: "classify_triangle",
        templateFamily: "triangle_classification",
        promptPattern:
          "How should the triangle be classified by its side lengths?",
        requiredFields: [
          "sideLengthA",
          "sideLengthB",
          "sideLengthC"
        ],
        outputType: "multiple_choice",
        expectedAnswerFormat: "classification_label",
        requiresFigure: false
      },
      {
        templateId: "classify_triangle_by_angles",
        problemTypeId: "classify_triangle",
        templateFamily: "triangle_classification",
        promptPattern:
          "How should the triangle be classified by its angle measures?",
        requiredFields: [
          "angleMeasureA",
          "angleMeasureB",
          "angleMeasureC"
        ],
        outputType: "multiple_choice",
        expectedAnswerFormat: "classification_label",
        requiresFigure: false
      },
      {
        templateId: "triangle_angle_sum_missing_angle",
        problemTypeId: "triangle_angle_sum",
        templateFamily: "triangle_measurement",
        promptPattern:
          "What is the measure of the missing angle in the triangle?",
        requiredFields: [
          "angleMeasureA",
          "angleMeasureB"
        ],
        outputType: "multiple_choice",
        expectedAnswerFormat: "numeric_degrees",
        requiresFigure: false
      },
      {
        templateId: "distance_between_two_points",
        problemTypeId: "distance_formula",
        templateFamily: "coordinate_measurement",
        promptPattern:
          "What is the distance between the two given points?",
        requiredFields: [
          "pointA",
          "pointB"
        ],
        outputType: "multiple_choice",
        expectedAnswerFormat: "numeric_value",
        requiresFigure: false
      },
      {
        templateId: "midpoint_between_two_points",
        problemTypeId: "midpoint",
        templateFamily: "coordinate_measurement",
        promptPattern:
          "What is the midpoint of the segment with the given endpoints?",
        requiredFields: [
          "pointA",
          "pointB"
        ],
        outputType: "multiple_choice",
        expectedAnswerFormat: "ordered_pair",
        requiresFigure: false
      },
      {
        templateId: "identify_translation_from_rule",
        problemTypeId: "identify_translation",
        templateFamily: "transformation_identification",
        promptPattern:
          "Which transformation rule represents the translation?",
        requiredFields: [
          "translationX",
          "translationY"
        ],
        outputType: "multiple_choice",
        expectedAnswerFormat: "classification_label",
        requiresFigure: false
      },
      {
        templateId: "identify_reflection_from_rule",
        problemTypeId: "identify_reflection",
        templateFamily: "transformation_identification",
        promptPattern:
          "Which transformation represents the reflection?",
        requiredFields: [
          "reflectionLine"
        ],
        outputType: "multiple_choice",
        expectedAnswerFormat: "classification_label",
        requiresFigure: false
      },
      {
        templateId: "identify_rotation_from_rule",
        problemTypeId: "identify_rotation",
        templateFamily: "transformation_identification",
        promptPattern:
          "Which transformation represents the rotation?",
        requiredFields: [
          "rotationCenter",
          "rotationAngle",
          "rotationDirection"
        ],
        outputType: "multiple_choice",
        expectedAnswerFormat: "classification_label",
        requiresFigure: false
      },
      {
        templateId: "identify_dilation_from_scale_factor",
        problemTypeId: "identify_dilation",
        templateFamily: "transformation_identification",
        promptPattern:
          "Which transformation represents the dilation?",
        requiredFields: [
          "scaleFactor",
          "dilationCenter"
        ],
        outputType: "multiple_choice",
        expectedAnswerFormat: "classification_label",
        requiresFigure: false
      },
      {
        templateId: "identify_angle_pair_type_from_transversal",
        problemTypeId: "identify_transversal_angle_pair",
        templateFamily: "parallel_lines_angle_relationships",
        promptPattern:
          "Two parallel lines are cut by a transversal. What is the relationship between the given pair of angles?",
        requiredFields: [
          "angleDescriptionA",
          "angleDescriptionB"
        ],
        outputType: "multiple_choice",
        expectedAnswerFormat: "classification_label",
        requiresFigure: false
      },
      {
        templateId: "angle_measure_from_parallel_lines",
        problemTypeId: "parallel_lines_angle_measure",
        templateFamily: "parallel_lines_measurement",
        promptPattern:
          "Two parallel lines are cut by a transversal. What is the measure of the related angle?",
        requiredFields: [
          "knownAngleMeasure",
          "relationshipType"
        ],
        outputType: "multiple_choice",
        expectedAnswerFormat: "numeric_degrees",
        requiresFigure: false
      },
      {
        templateId: "classify_line_relationship_from_slopes",
        problemTypeId: "classify_line_relationship",
        templateFamily: "line_relationship_classification",
        promptPattern:
          "Two lines have the given slopes. What is the relationship between the two lines?",
        requiredFields: [
          "slopeA",
          "slopeB"
        ],
        outputType: "multiple_choice",
        expectedAnswerFormat: "classification_label",
        requiresFigure: false
      },
      {
        templateId: "pythagorean_theorem_missing_side",
        problemTypeId: "pythagorean_theorem",
        templateFamily: "right_triangle_measurement",
        promptPattern:
          "A right triangle has the given side lengths. What is the length of the missing side?",
        requiredFields: [
          "sideA",
          "sideB",
          "missingSideRole"
        ],
        outputType: "multiple_choice",
        expectedAnswerFormat: "numeric_value",
        requiresFigure: false
      },
      {
        templateId: "special_right_triangle_45_45_90_missing_side",
        problemTypeId: "special_right_triangle_45_45_90",
        templateFamily: "special_right_triangles",
        promptPattern:
          "A 45-45-90 triangle has the given side length. What is the length of the missing side?",
        requiredFields: [
          "legValue",
          "givenSideType",
          "givenSideDisplay"
        ],
        outputType: "multiple_choice",
        expectedAnswerFormat: "radical_value",
        requiresFigure: false
      },
      {
        templateId: "special_right_triangle_30_60_90_missing_side",
        problemTypeId: "special_right_triangle_30_60_90",
        templateFamily: "special_right_triangles",
        promptPattern:
          "A 30-60-90 triangle has the given side length. What is the length of the missing side?",
        requiredFields: [
          "shortLegValue",
          "givenSideType",
          "givenSideDisplay",
          "askedSideType"
        ],
        outputType: "multiple_choice",
        expectedAnswerFormat: "radical_value",
        requiresFigure: false
      },
      {
        templateId: "right_triangle_trig_ratio_from_sides",
        problemTypeId: "right_triangle_trig_ratio",
        templateFamily: "trigonometric_ratios",
        promptPattern:
          "A right triangle has the given side lengths. What is the requested trigonometric ratio of the specified angle?",
        requiredFields: [
          "legA",
          "legB",
          "hypotenuse",
          "ratioType"
        ],
        outputType: "multiple_choice",
        expectedAnswerFormat: "numeric_value",
        requiresFigure: false
      },
      {
        templateId: "polygon_interior_angle_sum_calculation",
        problemTypeId: "polygon_interior_angle_sum",
        templateFamily: "polygon_angle_measurement",
        promptPattern:
          "What is the sum of the interior angle measures of a polygon with the given number of sides?",
        requiredFields: [
          "numberOfSides"
        ],
        outputType: "multiple_choice",
        expectedAnswerFormat: "numeric_degrees",
        requiresFigure: false
      },
      {
        templateId: "regular_polygon_interior_angle_measure",
        problemTypeId: "regular_polygon_interior_angle",
        templateFamily: "polygon_angle_measurement",
        promptPattern:
          "What is the measure of one interior angle of a regular polygon with the given number of sides?",
        requiredFields: [
          "numberOfSides"
        ],
        outputType: "multiple_choice",
        expectedAnswerFormat: "numeric_degrees",
        requiresFigure: false
      },
      {
        templateId: "parallelogram_angle_relationship_measure",
        problemTypeId: "parallelogram_angle_relationship",
        templateFamily: "parallelogram_properties",
        promptPattern:
          "In a parallelogram, one angle has the given measure. What is the measure of the related angle?",
        requiredFields: [
          "knownAngleMeasure",
          "relationshipType"
        ],
        outputType: "multiple_choice",
        expectedAnswerFormat: "numeric_degrees",
        requiresFigure: false
      },
      {
        templateId: "quadrilateral_diagonal_bisection_length",
        problemTypeId: "quadrilateral_diagonal_bisection",
        templateFamily: "parallelogram_properties",
        promptPattern:
          "In a parallelogram, the diagonals intersect at a point. Given the length of one half of a diagonal, what is the length of the other half?",
        requiredFields: [
          "givenSegmentLength"
        ],
        outputType: "multiple_choice",
        expectedAnswerFormat: "numeric_value",
        requiresFigure: false
      },
      {
        templateId: "triangle_exterior_angle_measure",
        problemTypeId: "triangle_exterior_angle",
        templateFamily: "triangle_measurement",
        promptPattern:
          "A triangle has two remote interior angles with the given measures. What is the measure of the exterior angle at the third vertex?",
        requiredFields: [
          "remoteAngleA",
          "remoteAngleB"
        ],
        outputType: "multiple_choice",
        expectedAnswerFormat: "numeric_degrees",
        requiresFigure: false
      },
      {
        templateId: "identify_triangle_congruence_postulate",
        problemTypeId: "triangle_congruence_postulate",
        templateFamily: "triangle_congruence",
        promptPattern:
          "Two triangles have the given corresponding parts marked congruent. Which postulate or theorem proves the triangles are congruent?",
        requiredFields: [
          "givenInformation",
          "postulateType"
        ],
        outputType: "multiple_choice",
        expectedAnswerFormat: "classification_label",
        requiresFigure: false
      },
      {
        templateId: "isosceles_triangle_angle_measure",
        problemTypeId: "isosceles_triangle_angle",
        templateFamily: "triangle_measurement",
        promptPattern:
          "An isosceles triangle has the given known angle measure. What is the measure of the requested angle?",
        requiredFields: [
          "baseAngleMeasure",
          "scenario"
        ],
        outputType: "multiple_choice",
        expectedAnswerFormat: "numeric_degrees",
        requiresFigure: false
      },
      {
        templateId: "triangle_inequality_check",
        problemTypeId: "triangle_inequality_validity",
        templateFamily: "triangle_inequality",
        promptPattern:
          "Three segments have the given lengths. Can they form a triangle?",
        requiredFields: [
          "sideA",
          "sideB",
          "sideC"
        ],
        outputType: "multiple_choice",
        expectedAnswerFormat: "classification_label",
        requiresFigure: false
      },
      {
        templateId: "identify_triangle_similarity_postulate",
        problemTypeId: "triangle_similarity_postulate",
        templateFamily: "triangle_similarity",
        promptPattern:
          "Two triangles have the given corresponding parts. Which postulate or theorem proves the triangles are similar?",
        requiredFields: [
          "givenInformation",
          "postulateType"
        ],
        outputType: "multiple_choice",
        expectedAnswerFormat: "classification_label",
        requiresFigure: false
      },
      {
        templateId: "similar_polygon_scale_factor_calculation",
        problemTypeId: "similar_polygon_scale_factor",
        templateFamily: "similar_polygons",
        promptPattern:
          "Two polygons are similar. Given the lengths of a pair of corresponding sides, what is the scale factor from the first polygon to the second?",
        requiredFields: [
          "sideLengthOriginal",
          "sideLengthImage"
        ],
        outputType: "multiple_choice",
        expectedAnswerFormat: "numeric_value",
        requiresFigure: false
      },
      {
        templateId: "similar_polygon_missing_side_length",
        problemTypeId: "similar_polygon_missing_side",
        templateFamily: "similar_polygons",
        promptPattern:
          "Two figures are similar with the given scale factor. Given one side length in the original figure, what is the length of the corresponding side in the image?",
        requiredFields: [
          "scaleFactorDisplay",
          "knownSideLength"
        ],
        outputType: "multiple_choice",
        expectedAnswerFormat: "numeric_value",
        requiresFigure: false
      },
      {
        templateId: "triangle_proportionality_missing_segment",
        problemTypeId: "triangle_proportionality",
        templateFamily: "proportionality_theorems",
        promptPattern:
          "In a triangle, a segment parallel to one side divides the other two sides proportionally. Given three of the four resulting segment lengths, what is the length of the fourth segment?",
        requiredFields: [
          "segmentAD",
          "segmentDB",
          "segmentAE"
        ],
        outputType: "multiple_choice",
        expectedAnswerFormat: "numeric_value",
        requiresFigure: false
      },
      {
        templateId: "inscribed_angle_arc_measure",
        problemTypeId: "inscribed_angle_arc_relationship",
        templateFamily: "circle_angle_measurement",
        promptPattern:
          "An inscribed angle and its intercepted arc are related by the Inscribed Angle Theorem. Given one known measure, what is the measure of the requested angle or arc?",
        requiredFields: [
          "knownMeasure",
          "scenario"
        ],
        outputType: "multiple_choice",
        expectedAnswerFormat: "numeric_degrees",
        requiresFigure: false
      },
      {
        templateId: "circle_equation_from_center_radius",
        problemTypeId: "circle_equation",
        templateFamily: "circles_in_coordinate_plane",
        promptPattern:
          "A circle has the given center and radius. Which equation represents this circle in standard form?",
        requiredFields: [
          "centerX",
          "centerY",
          "radius"
        ],
        outputType: "multiple_choice",
        expectedAnswerFormat: "classification_label",
        requiresFigure: false
      },
      {
        templateId: "tangent_segment_length",
        problemTypeId: "tangent_segment_congruence",
        templateFamily: "circle_segment_relationships",
        promptPattern:
          "Two tangent segments are drawn to a circle from the same external point. Given the length of one tangent segment, what is the length of the other?",
        requiredFields: [
          "givenTangentLength"
        ],
        outputType: "multiple_choice",
        expectedAnswerFormat: "numeric_value",
        requiresFigure: false
      },
      {
        templateId: "intersecting_chords_missing_segment",
        problemTypeId: "intersecting_chords_segments",
        templateFamily: "circle_segment_relationships",
        promptPattern:
          "Two chords intersect inside a circle. Given three of the four resulting segment lengths, what is the length of the fourth segment?",
        requiredFields: [
          "segmentP",
          "segmentQ",
          "segmentR"
        ],
        outputType: "multiple_choice",
        expectedAnswerFormat: "numeric_value",
        requiresFigure: false
      },
      {
        templateId: "circle_circumference_and_area_calculation",
        problemTypeId: "circle_circumference_and_area",
        templateFamily: "circle_measurement",
        promptPattern:
          "A circle has the given radius. What is the requested measurement, expressed exactly in terms of pi?",
        requiredFields: [
          "radius",
          "scenario"
        ],
        outputType: "multiple_choice",
        expectedAnswerFormat: "radical_value",
        requiresFigure: false
      },
      {
        templateId: "arc_length_or_sector_area_calculation",
        problemTypeId: "arc_length_and_sector_area",
        templateFamily: "circle_measurement",
        promptPattern:
          "A circle has the given radius, and a central angle intercepts an arc with the given measure. What is the requested measurement, expressed exactly in terms of pi?",
        requiredFields: [
          "radius",
          "centralAngle",
          "scenario"
        ],
        outputType: "multiple_choice",
        expectedAnswerFormat: "radical_value",
        requiresFigure: false
      },
      {
        templateId: "prism_or_cylinder_volume_calculation",
        problemTypeId: "prism_or_cylinder_volume",
        templateFamily: "volume_measurement",
        promptPattern:
          "A solid has the given dimensions. What is its volume?",
        requiredFields: [
          "scenario",
          "dimensionOne",
          "dimensionTwo",
          "dimensionThree"
        ],
        outputType: "multiple_choice",
        expectedAnswerFormat: "numeric_value",
        requiresFigure: false
      },
      {
        templateId: "sphere_surface_area_or_volume_calculation",
        problemTypeId: "sphere_surface_area_and_volume",
        templateFamily: "volume_measurement",
        promptPattern:
          "A sphere has the given radius. What is the requested measurement, expressed exactly in terms of pi?",
        requiredFields: [
          "radius",
          "scenario"
        ],
        outputType: "multiple_choice",
        expectedAnswerFormat: "radical_value",
        requiresFigure: false
      }
    ];
  }

  getVersion() {
    return this.version;
  }

  listTemplates() {
    return this.templates.map((template) =>
      this.cloneTemplate(template)
    );
  }

  countTemplates() {
    return this.templates.length;
  }

  getTemplate(templateId) {
    const template = this.templates.find((item) =>
      item.templateId === templateId
    );

    return template
      ? this.cloneTemplate(template)
      : null;
  }

  hasTemplate(templateId) {
    return Boolean(this.getTemplate(templateId));
  }

  listTemplateIds() {
    return this.templates.map((template) =>
      template.templateId
    );
  }

  listTemplateFamilies() {
    return [
      ...new Set(
        this.templates.map((template) =>
          template.templateFamily
        )
      )
    ];
  }

  getTemplatesByProblemType(problemTypeId) {
    return this.templates
      .filter((template) =>
        template.problemTypeId === problemTypeId
      )
      .map((template) =>
        this.cloneTemplate(template)
      );
  }

  getTemplatesByFamily(templateFamily) {
    return this.templates
      .filter((template) =>
        template.templateFamily === templateFamily
      )
      .map((template) =>
        this.cloneTemplate(template)
      );
  }

  getTemplatesRequiringFigure() {
    return this.templates
      .filter((template) =>
        template.requiresFigure === true
      )
      .map((template) =>
        this.cloneTemplate(template)
      );
  }

  getTemplatesNotRequiringFigure() {
    return this.templates
      .filter((template) =>
        template.requiresFigure === false
      )
      .map((template) =>
        this.cloneTemplate(template)
      );
  }

  validate() {
    const templateIds = new Set();
    const errors = [];

    this.templates.forEach((template) => {
      if (!template.templateId) {
        errors.push(
          "Template is missing templateId."
        );
      }

      if (!template.problemTypeId) {
        errors.push(
          `Template ${template.templateId || "unknown"} is missing problemTypeId.`
        );
      }

      if (
        template.problemTypeId &&
        !this.problemTypeRegistry.hasProblemType(
          template.problemTypeId
        )
      ) {
        errors.push(
          `Template ${template.templateId} references missing problemTypeId: ${template.problemTypeId}`
        );
      }

      if (!template.templateFamily) {
        errors.push(
          `Template ${template.templateId || "unknown"} is missing templateFamily.`
        );
      }

      if (!template.promptPattern) {
        errors.push(
          `Template ${template.templateId || "unknown"} is missing promptPattern.`
        );
      }

      if (
        !Array.isArray(template.requiredFields) ||
        template.requiredFields.length === 0
      ) {
        errors.push(
          `Template ${template.templateId || "unknown"} is missing requiredFields.`
        );
      }

      if (!template.outputType) {
        errors.push(
          `Template ${template.templateId || "unknown"} is missing outputType.`
        );
      }

      if (!template.expectedAnswerFormat) {
        errors.push(
          `Template ${template.templateId || "unknown"} is missing expectedAnswerFormat.`
        );
      }

      if (
        typeof template.requiresFigure !== "boolean"
      ) {
        errors.push(
          `Template ${template.templateId || "unknown"} is missing requiresFigure boolean.`
        );
      }

      if (templateIds.has(template.templateId)) {
        errors.push(
          `Duplicate templateId found: ${template.templateId}`
        );
      }

      templateIds.add(template.templateId);
    });

    return {
      registryVersion: this.version,
      problemTypeRegistryVersion:
        this.problemTypeRegistry.version,
      templateCount: this.countTemplates(),
      templateFamilyCount:
        this.listTemplateFamilies().length,
      connectedProblemTypeCount:
        new Set(
          this.templates.map((template) =>
            template.problemTypeId
          )
        ).size,
      valid: errors.length === 0,
      errors
    };
  }

  cloneTemplate(template) {
    return {
      templateId: template.templateId,
      problemTypeId: template.problemTypeId,
      templateFamily: template.templateFamily,
      promptPattern: template.promptPattern,
      requiredFields: [
        ...template.requiredFields
      ],
      outputType: template.outputType,
      expectedAnswerFormat:
        template.expectedAnswerFormat,
      requiresFigure: template.requiresFigure
    };
  }
}

export const geometryTemplateRegistry =
  new GeometryTemplateRegistry();