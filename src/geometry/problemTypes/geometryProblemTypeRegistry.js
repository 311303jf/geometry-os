/**
 * Geometry OS
 * Geometry Problem Type Registry v1.0.3
 *
 * Responsibility:
 * Store reusable Geometry problem type metadata.
 *
 * Important:
 * This registry does NOT resolve blueprints.
 * It does NOT generate questions.
 * It does NOT replace the Question Factory.
 * It only defines reusable Geometry problem families for future engines.
 */

export class GeometryProblemTypeRegistry {
  constructor() {
    this.version = "v1.0.6";

    this.problemTypes = [
      {
        problemTypeId: "identify_point",
        conceptId: "points",
        family: "foundational_identification",
        description: "Identify or name a point in a geometric context.",
        expectedAnswerFormat: "geometry_object_name",
        requiresFigure: true
      },
      {
        problemTypeId: "identify_line",
        conceptId: "lines",
        family: "foundational_identification",
        description: "Identify or name a line in a geometric context.",
        expectedAnswerFormat: "geometry_object_name",
        requiresFigure: true
      },
      {
        problemTypeId: "identify_segment",
        conceptId: "segments",
        family: "foundational_identification",
        description: "Identify or name a segment in a geometric context.",
        expectedAnswerFormat: "geometry_object_name",
        requiresFigure: true
      },
      {
        problemTypeId: "identify_ray",
        conceptId: "rays",
        family: "foundational_identification",
        description: "Identify or name a ray in a geometric context.",
        expectedAnswerFormat: "geometry_object_name",
        requiresFigure: true
      },
      {
        problemTypeId: "identify_plane",
        conceptId: "planes",
        family: "foundational_identification",
        description: "Identify or name a plane in a geometric context.",
        expectedAnswerFormat: "geometry_object_name",
        requiresFigure: true
      },
      {
        problemTypeId: "identify_angle",
        conceptId: "angles",
        family: "angle_identification",
        description: "Identify or name an angle in a geometric context.",
        expectedAnswerFormat: "geometry_object_name",
        requiresFigure: true
      },
      {
        problemTypeId: "classify_angle",
        conceptId: "angles",
        family: "angle_classification",
        description: "Classify an angle by its measure.",
        expectedAnswerFormat: "classification_label",
        requiresFigure: false
      },
      {
        problemTypeId: "measure_angle",
        conceptId: "angles",
        family: "angle_measurement",
        description: "Determine the measure of an angle.",
        expectedAnswerFormat: "numeric_degrees",
        requiresFigure: true
      },
      {
        problemTypeId: "identify_complementary_angles",
        conceptId: "angle_relationships",
        family: "angle_relationships",
        description: "Identify complementary angles.",
        expectedAnswerFormat: "classification_label",
        requiresFigure: true
      },
      {
        problemTypeId: "identify_supplementary_angles",
        conceptId: "angle_relationships",
        family: "angle_relationships",
        description: "Identify supplementary angles.",
        expectedAnswerFormat: "classification_label",
        requiresFigure: true
      },
      {
        problemTypeId: "identify_vertical_angles",
        conceptId: "angle_relationships",
        family: "angle_relationships",
        description: "Identify vertical angles.",
        expectedAnswerFormat: "classification_label",
        requiresFigure: true
      },
      {
        problemTypeId: "identify_adjacent_angles",
        conceptId: "angle_relationships",
        family: "angle_relationships",
        description: "Identify adjacent angles.",
        expectedAnswerFormat: "classification_label",
        requiresFigure: true
      },
      {
        problemTypeId: "classify_polygon",
        conceptId: "polygons",
        family: "polygon_classification",
        description: "Classify a polygon based on its attributes.",
        expectedAnswerFormat: "classification_label",
        requiresFigure: true
      },
      {
        problemTypeId: "identify_polygon",
        conceptId: "polygons",
        family: "polygon_identification",
        description: "Identify whether a figure is a polygon.",
        expectedAnswerFormat: "classification_label",
        requiresFigure: true
      },
      {
        problemTypeId: "classify_triangle",
        conceptId: "triangles",
        family: "triangle_classification",
        description: "Classify a triangle by side lengths or angle measures.",
        expectedAnswerFormat: "classification_label",
        requiresFigure: true
      },
      {
        problemTypeId: "triangle_angle_sum",
        conceptId: "triangles",
        family: "triangle_measurement",
        description: "Use the triangle angle sum relationship to find or reason about angle measures.",
        expectedAnswerFormat: "numeric_degrees",
        requiresFigure: false
      },
      {
        problemTypeId: "distance_formula",
        conceptId: "coordinate_geometry",
        family: "coordinate_measurement",
        description: "Use the distance formula to find the distance between two points.",
        expectedAnswerFormat: "numeric_value",
        requiresFigure: false
      },
      {
        problemTypeId: "midpoint",
        conceptId: "coordinate_geometry",
        family: "coordinate_measurement",
        description: "Find the midpoint between two points.",
        expectedAnswerFormat: "ordered_pair",
        requiresFigure: false
      },
      {
        problemTypeId: "identify_translation",
        conceptId: "transformations",
        family: "transformation_identification",
        description: "Identify a translation from a transformation description or figure.",
        expectedAnswerFormat: "classification_label",
        requiresFigure: true
      },
      {
        problemTypeId: "identify_reflection",
        conceptId: "transformations",
        family: "transformation_identification",
        description: "Identify a reflection from a transformation description or figure.",
        expectedAnswerFormat: "classification_label",
        requiresFigure: true
      },
      {
        problemTypeId: "identify_rotation",
        conceptId: "transformations",
        family: "transformation_identification",
        description: "Identify a rotation from a transformation description or figure.",
        expectedAnswerFormat: "classification_label",
        requiresFigure: true
      },
      {
        problemTypeId: "identify_dilation",
        conceptId: "transformations",
        family: "transformation_identification",
        description: "Identify a dilation from a transformation description or figure.",
        expectedAnswerFormat: "classification_label",
        requiresFigure: true
      },
      {
        problemTypeId: "identify_transversal_angle_pair",
        conceptId: "parallel_lines",
        family: "parallel_lines_angle_relationships",
        description: "Identify the relationship between a pair of angles formed when a transversal crosses two lines.",
        expectedAnswerFormat: "classification_label",
        requiresFigure: false
      },
      {
        problemTypeId: "parallel_lines_angle_measure",
        conceptId: "parallel_lines",
        family: "parallel_lines_measurement",
        description: "Determine the measure of an angle formed when a transversal crosses two parallel lines, given a related known angle.",
        expectedAnswerFormat: "numeric_degrees",
        requiresFigure: false
      },
      {
        problemTypeId: "classify_line_relationship",
        conceptId: "parallel_lines",
        family: "line_relationship_classification",
        description: "Classify the relationship between two lines based on their slopes.",
        expectedAnswerFormat: "classification_label",
        requiresFigure: false
      },
      {
        problemTypeId: "pythagorean_theorem",
        conceptId: "right_triangles",
        family: "right_triangle_measurement",
        description: "Use the Pythagorean Theorem to find a missing side of a right triangle.",
        expectedAnswerFormat: "numeric_value",
        requiresFigure: false
      },
      {
        problemTypeId: "special_right_triangle_45_45_90",
        conceptId: "right_triangles",
        family: "special_right_triangles",
        description: "Use 45-45-90 triangle side ratios to find a missing side.",
        expectedAnswerFormat: "radical_value",
        requiresFigure: false
      },
      {
        problemTypeId: "special_right_triangle_30_60_90",
        conceptId: "right_triangles",
        family: "special_right_triangles",
        description: "Use 30-60-90 triangle side ratios to find a missing side.",
        expectedAnswerFormat: "radical_value",
        requiresFigure: false
      },
      {
        problemTypeId: "right_triangle_trig_ratio",
        conceptId: "right_triangles",
        family: "trigonometric_ratios",
        description: "Find the sine, cosine, or tangent ratio of an acute angle in a right triangle, expressed as an exact reduced fraction.",
        expectedAnswerFormat: "numeric_value",
        requiresFigure: false
      },
      {
        problemTypeId: "polygon_interior_angle_sum",
        conceptId: "quadrilaterals",
        family: "polygon_angle_measurement",
        description: "Find the sum of the interior angle measures of a polygon.",
        expectedAnswerFormat: "numeric_degrees",
        requiresFigure: false
      },
      {
        problemTypeId: "regular_polygon_interior_angle",
        conceptId: "quadrilaterals",
        family: "polygon_angle_measurement",
        description: "Find the measure of one interior angle of a regular polygon.",
        expectedAnswerFormat: "numeric_degrees",
        requiresFigure: false
      },
      {
        problemTypeId: "parallelogram_angle_relationship",
        conceptId: "quadrilaterals",
        family: "parallelogram_properties",
        description: "Find a related angle measure in a parallelogram using consecutive (supplementary) or opposite (congruent) angle relationships.",
        expectedAnswerFormat: "numeric_degrees",
        requiresFigure: false
      },
      {
        problemTypeId: "quadrilateral_diagonal_bisection",
        conceptId: "quadrilaterals",
        family: "parallelogram_properties",
        description: "Use the property that the diagonals of a parallelogram bisect each other to find a segment length.",
        expectedAnswerFormat: "numeric_value",
        requiresFigure: false
      }
    ];
  }

  listProblemTypes() {
    return [...this.problemTypes];
  }

  countProblemTypes() {
    return this.problemTypes.length;
  }

  getProblemType(problemTypeId) {
    return this.problemTypes.find((problemType) =>
      problemType.problemTypeId === problemTypeId
    ) || null;
  }

  hasProblemType(problemTypeId) {
    return Boolean(this.getProblemType(problemTypeId));
  }

  listProblemTypeIds() {
    return this.problemTypes.map((problemType) => problemType.problemTypeId);
  }

  listFamilies() {
    return [...new Set(this.problemTypes.map((problemType) => problemType.family))];
  }

  getProblemTypesByConcept(conceptId) {
    return this.problemTypes.filter((problemType) => problemType.conceptId === conceptId);
  }

  getProblemTypesByFamily(family) {
    return this.problemTypes.filter((problemType) => problemType.family === family);
  }

  getProblemTypesRequiringFigure() {
    return this.problemTypes.filter((problemType) => problemType.requiresFigure === true);
  }

  getProblemTypesNotRequiringFigure() {
    return this.problemTypes.filter((problemType) => problemType.requiresFigure === false);
  }

  validate() {
    const problemTypeIds = new Set();
    const errors = [];

    this.problemTypes.forEach((problemType) => {
      if (!problemType.problemTypeId) {
        errors.push("Problem type is missing problemTypeId.");
      }

      if (!problemType.conceptId) {
        errors.push(`Problem type ${problemType.problemTypeId || "unknown"} is missing conceptId.`);
      }

      if (!problemType.family) {
        errors.push(`Problem type ${problemType.problemTypeId || "unknown"} is missing family.`);
      }

      if (!problemType.description) {
        errors.push(`Problem type ${problemType.problemTypeId || "unknown"} is missing description.`);
      }

      if (!problemType.expectedAnswerFormat) {
        errors.push(`Problem type ${problemType.problemTypeId || "unknown"} is missing expectedAnswerFormat.`);
      }

      if (typeof problemType.requiresFigure !== "boolean") {
        errors.push(`Problem type ${problemType.problemTypeId || "unknown"} is missing requiresFigure boolean.`);
      }

      if (problemTypeIds.has(problemType.problemTypeId)) {
        errors.push(`Duplicate problemTypeId found: ${problemType.problemTypeId}`);
      }

      problemTypeIds.add(problemType.problemTypeId);
    });

    return {
      registryVersion: this.version,
      problemTypeCount: this.countProblemTypes(),
      familyCount: this.listFamilies().length,
      valid: errors.length === 0,
      errors
    };
  }
}

export const geometryProblemTypeRegistry = new GeometryProblemTypeRegistry();