/**
 * Geometry OS
 * Geometry Knowledge Library v1.0.1
 *
 * Responsibility:
 * Store reusable Geometry concepts independent of lessons.
 *
 * Important:
 * This library does NOT generate questions.
 * It does NOT create blueprints.
 * It does NOT replace the Question Factory.
 * It only provides reusable Geometry knowledge metadata
 * for future intelligent question generation.
 */

export class GeometryKnowledgeLibrary {
  constructor() {
    this.version = "v1.0.1";

    this.concepts = [
      {
        conceptId: "points",
        name: "Points",
        category: "foundational_geometry",
        description: "A point represents an exact location in space.",
        vocabulary: ["point", "location", "coordinate"],
        aliases: ["point"],
        floridaBestDomains: ["MA.912.GR"],
        relatedProblemTypes: ["identify_point", "name_point"],
        prerequisiteConcepts: []
      },
      {
        conceptId: "lines",
        name: "Lines",
        category: "foundational_geometry",
        description: "A line extends forever in both directions and contains infinitely many points.",
        vocabulary: ["line", "collinear", "opposite directions"],
        aliases: ["line"],
        floridaBestDomains: ["MA.912.GR"],
        relatedProblemTypes: ["identify_line", "name_line"],
        prerequisiteConcepts: ["points"]
      },
      {
        conceptId: "segments",
        name: "Segments",
        category: "foundational_geometry",
        description: "A segment is part of a line with two endpoints.",
        vocabulary: ["segment", "endpoint", "length"],
        aliases: ["line segment", "segment"],
        floridaBestDomains: ["MA.912.GR"],
        relatedProblemTypes: ["identify_segment", "name_segment"],
        prerequisiteConcepts: ["points", "lines"]
      },
      {
        conceptId: "rays",
        name: "Rays",
        category: "foundational_geometry",
        description: "A ray has one endpoint and extends forever in one direction.",
        vocabulary: ["ray", "endpoint", "direction"],
        aliases: ["ray"],
        floridaBestDomains: ["MA.912.GR"],
        relatedProblemTypes: ["identify_ray", "name_ray"],
        prerequisiteConcepts: ["points", "lines"]
      },
      {
        conceptId: "planes",
        name: "Planes",
        category: "foundational_geometry",
        description: "A plane is a flat surface that extends forever in all directions.",
        vocabulary: ["plane", "flat surface", "coplanar"],
        aliases: ["plane"],
        floridaBestDomains: ["MA.912.GR"],
        relatedProblemTypes: ["identify_plane", "name_plane"],
        prerequisiteConcepts: ["points", "lines"]
      },
      {
        conceptId: "angles",
        name: "Angles",
        category: "measurement_geometry",
        description: "An angle is formed by two rays that share a common endpoint.",
        vocabulary: ["angle", "vertex", "ray", "degree"],
        aliases: ["angle"],
        floridaBestDomains: ["MA.912.GR"],
        relatedProblemTypes: ["identify_angle", "classify_angle", "measure_angle"],
        prerequisiteConcepts: ["points", "rays"]
      },
      {
        conceptId: "angle_relationships",
        name: "Angle Relationships",
        category: "measurement_geometry",
        description: "Angle relationships describe how angles are connected, compared, or combined.",
        vocabulary: ["complementary", "supplementary", "vertical angles", "adjacent angles"],
        aliases: ["angle pairs", "angle relationships"],
        floridaBestDomains: ["MA.912.GR"],
        relatedProblemTypes: [
          "identify_complementary_angles",
          "identify_supplementary_angles",
          "identify_vertical_angles",
          "identify_adjacent_angles"
        ],
        prerequisiteConcepts: ["angles"]
      },
      {
        conceptId: "polygons",
        name: "Polygons",
        category: "two_dimensional_geometry",
        description: "A polygon is a closed two-dimensional figure made of straight sides.",
        vocabulary: ["polygon", "side", "vertex", "closed figure"],
        aliases: ["polygon"],
        floridaBestDomains: ["MA.912.GR"],
        relatedProblemTypes: ["classify_polygon", "identify_polygon"],
        prerequisiteConcepts: ["segments", "angles"]
      },
      {
        conceptId: "triangles",
        name: "Triangles",
        category: "two_dimensional_geometry",
        description: "A triangle is a polygon with exactly three sides and three angles.",
        vocabulary: ["triangle", "scalene", "isosceles", "equilateral", "acute", "right", "obtuse"],
        aliases: ["triangle"],
        floridaBestDomains: ["MA.912.GR"],
        relatedProblemTypes: ["classify_triangle", "triangle_angle_sum"],
        prerequisiteConcepts: ["polygons", "angles"]
      },
      {
        conceptId: "circles",
        name: "Circles",
        category: "two_dimensional_geometry",
        description: "A circle is the set of all points in a plane that are the same distance from a center point.",
        vocabulary: ["circle", "center", "radius", "diameter", "chord", "arc"],
        aliases: ["circle"],
        floridaBestDomains: ["MA.912.GR"],
        relatedProblemTypes: ["identify_radius", "identify_diameter", "identify_chord", "identify_arc"],
        prerequisiteConcepts: ["points", "segments", "planes"]
      },
      {
        conceptId: "coordinate_geometry",
        name: "Coordinate Geometry",
        category: "analytic_geometry",
        description: "Coordinate geometry uses ordered pairs and the coordinate plane to describe geometric figures.",
        vocabulary: ["coordinate plane", "ordered pair", "distance", "midpoint", "slope"],
        aliases: ["analytic geometry", "coordinate geometry"],
        floridaBestDomains: ["MA.912.GR"],
        relatedProblemTypes: ["distance_formula", "midpoint", "slope_from_points"],
        prerequisiteConcepts: ["points", "segments"]
      },
      {
        conceptId: "transformations",
        name: "Transformations",
        category: "transformation_geometry",
        description: "Transformations move or change figures in the coordinate plane.",
        vocabulary: ["translation", "reflection", "rotation", "dilation", "image", "preimage"],
        aliases: ["transformations"],
        floridaBestDomains: ["MA.912.GR"],
        relatedProblemTypes: [
          "identify_translation",
          "identify_reflection",
          "identify_rotation",
          "identify_dilation"
        ],
        prerequisiteConcepts: ["coordinate_geometry"]
      },
      {
        conceptId: "congruence",
        name: "Congruence",
        category: "proof_and_reasoning",
        description: "Congruent figures have the same size and shape.",
        vocabulary: ["congruent", "corresponding parts", "rigid motion"],
        aliases: ["congruence", "congruent figures"],
        floridaBestDomains: ["MA.912.GR"],
        relatedProblemTypes: ["identify_congruent_figures", "congruence_statement"],
        prerequisiteConcepts: ["transformations", "triangles"]
      },
      {
        conceptId: "similarity",
        name: "Similarity",
        category: "proof_and_reasoning",
        description: "Similar figures have the same shape and proportional side lengths.",
        vocabulary: ["similar", "scale factor", "proportional", "corresponding sides"],
        aliases: ["similarity", "similar figures"],
        floridaBestDomains: ["MA.912.GR"],
        relatedProblemTypes: ["identify_similar_figures", "similarity_statement", "scale_factor"],
        prerequisiteConcepts: ["triangles", "proportional_reasoning"]
      },
      {
        conceptId: "proof",
        name: "Proof",
        category: "proof_and_reasoning",
        description: "Proof uses logical reasoning to justify mathematical statements.",
        vocabulary: ["proof", "statement", "reason", "theorem", "postulate"],
        aliases: ["proof", "geometric proof"],
        floridaBestDomains: ["MA.912.GR"],
        relatedProblemTypes: ["identify_reasoning_step", "complete_proof_statement", "justify_conclusion"],
        prerequisiteConcepts: ["angles", "triangles", "congruence"]
      },
      {
        conceptId: "measurement",
        name: "Measurement",
        category: "measurement_geometry",
        description: "Measurement includes length, angle measure, perimeter, area, surface area, and volume.",
        vocabulary: ["length", "area", "perimeter", "surface area", "volume"],
        aliases: ["measurement"],
        floridaBestDomains: ["MA.912.GR"],
        relatedProblemTypes: ["find_length", "find_area", "find_perimeter", "find_volume"],
        prerequisiteConcepts: ["segments", "angles", "polygons", "circles"]
      }
    ];
  }

  listConcepts() {
    return [...this.concepts];
  }

  countConcepts() {
    return this.concepts.length;
  }

  getConcept(conceptId) {
    return this.concepts.find((concept) => concept.conceptId === conceptId) || null;
  }

  hasConcept(conceptId) {
    return Boolean(this.getConcept(conceptId));
  }

  listCategories() {
    return [...new Set(this.concepts.map((concept) => concept.category))];
  }

  getConceptsByCategory(category) {
    return this.concepts.filter((concept) => concept.category === category);
  }

  getConceptsByProblemType(problemType) {
    return this.concepts.filter((concept) =>
      concept.relatedProblemTypes.includes(problemType)
    );
  }

  getConceptsByVocabularyTerm(term) {
    const normalizedTerm = String(term || "").toLowerCase();

    return this.concepts.filter((concept) =>
      concept.vocabulary.some((word) => word.toLowerCase() === normalizedTerm)
    );
  }

  getConceptsByFloridaBestDomain(domain) {
    return this.concepts.filter((concept) =>
      concept.floridaBestDomains.includes(domain)
    );
  }

  validate() {
    const conceptIds = new Set();
    const errors = [];

    this.concepts.forEach((concept) => {
      if (!concept.conceptId) errors.push("Concept is missing conceptId.");
      if (!concept.name) errors.push(`Concept ${concept.conceptId || "unknown"} is missing name.`);
      if (!concept.category) errors.push(`Concept ${concept.conceptId || "unknown"} is missing category.`);
      if (!concept.description) errors.push(`Concept ${concept.conceptId || "unknown"} is missing description.`);

      if (!Array.isArray(concept.vocabulary) || concept.vocabulary.length === 0) {
        errors.push(`Concept ${concept.conceptId || "unknown"} is missing vocabulary array.`);
      }

      if (!Array.isArray(concept.aliases) || concept.aliases.length === 0) {
        errors.push(`Concept ${concept.conceptId || "unknown"} is missing aliases array.`);
      }

      if (!Array.isArray(concept.floridaBestDomains) || concept.floridaBestDomains.length === 0) {
        errors.push(`Concept ${concept.conceptId || "unknown"} is missing floridaBestDomains array.`);
      }

      if (!Array.isArray(concept.relatedProblemTypes)) {
        errors.push(`Concept ${concept.conceptId || "unknown"} is missing relatedProblemTypes array.`);
      }

      if (!Array.isArray(concept.prerequisiteConcepts)) {
        errors.push(`Concept ${concept.conceptId || "unknown"} is missing prerequisiteConcepts array.`);
      }

      if (conceptIds.has(concept.conceptId)) {
        errors.push(`Duplicate conceptId found: ${concept.conceptId}`);
      }

      conceptIds.add(concept.conceptId);
    });

    this.concepts.forEach((concept) => {
      concept.prerequisiteConcepts.forEach((prerequisiteConceptId) => {
        if (
          prerequisiteConceptId !== "proportional_reasoning" &&
          !conceptIds.has(prerequisiteConceptId)
        ) {
          errors.push(
            `Concept ${concept.conceptId} references missing prerequisite concept: ${prerequisiteConceptId}`
          );
        }
      });
    });

    return {
      libraryVersion: this.version,
      conceptCount: this.countConcepts(),
      categoryCount: this.listCategories().length,
      valid: errors.length === 0,
      errors
    };
  }
}

export const geometryKnowledgeLibrary = new GeometryKnowledgeLibrary();