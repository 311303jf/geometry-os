/**
 * Geometry OS
 * Geometry Concept Lookup Contract v1.0.2
 *
 * Responsibility:
 * Provide a stable contract for querying Geometry Knowledge Library concepts.
 *
 * Important:
 * This contract does NOT generate questions.
 * It does NOT modify the Geometry Knowledge Library.
 * It does NOT replace the Question Factory.
 * It protects future engines from depending directly on library internals.
 */

import { geometryKnowledgeLibrary } from "./geometryKnowledgeLibrary.js";

export class GeometryConceptLookupContract {
  constructor({ knowledgeLibrary = geometryKnowledgeLibrary } = {}) {
    this.version = "v1.0.2";
    this.knowledgeLibrary = knowledgeLibrary;
  }

  getVersion() {
    return this.version;
  }

  getConceptById(conceptId) {
    const concept = this.knowledgeLibrary.getConcept(conceptId);

    if (!concept) {
      return null;
    }

    return this.normalizeConcept(concept);
  }

  hasConcept(conceptId) {
    return Boolean(this.getConceptById(conceptId));
  }

  listConcepts() {
    return this.knowledgeLibrary.listConcepts().map((concept) =>
      this.normalizeConcept(concept)
    );
  }

  listConceptIds() {
    return this.listConcepts().map((concept) => concept.conceptId);
  }

  listCategories() {
    return this.knowledgeLibrary.listCategories();
  }

  findByCategory(category) {
    return this.knowledgeLibrary.getConceptsByCategory(category).map((concept) =>
      this.normalizeConcept(concept)
    );
  }

  findByProblemType(problemType) {
    return this.knowledgeLibrary.getConceptsByProblemType(problemType).map((concept) =>
      this.normalizeConcept(concept)
    );
  }

  findByVocabularyTerm(term) {
    return this.knowledgeLibrary.getConceptsByVocabularyTerm(term).map((concept) =>
      this.normalizeConcept(concept)
    );
  }

  findByFloridaBestDomain(domain) {
    return this.knowledgeLibrary.getConceptsByFloridaBestDomain(domain).map((concept) =>
      this.normalizeConcept(concept)
    );
  }

  normalizeConcept(concept) {
    return {
      conceptId: concept.conceptId,
      name: concept.name,
      category: concept.category,
      description: concept.description,
      vocabulary: [...concept.vocabulary],
      aliases: [...concept.aliases],
      floridaBestDomains: [...concept.floridaBestDomains],
      relatedProblemTypes: [...concept.relatedProblemTypes],
      prerequisiteConcepts: [...concept.prerequisiteConcepts]
    };
  }

  validateContract() {
    const concepts = this.listConcepts();
    const errors = [];

    if (this.getVersion() !== "v1.0.2") {
      errors.push("Lookup contract version mismatch.");
    }

    if (!Array.isArray(concepts)) {
      errors.push("Lookup contract listConcepts() must return an array.");
    }

    concepts.forEach((concept) => {
      if (!concept.conceptId) {
        errors.push("Normalized concept is missing conceptId.");
      }

      if (!concept.name) {
        errors.push(`Normalized concept ${concept.conceptId || "unknown"} is missing name.`);
      }

      if (!concept.category) {
        errors.push(`Normalized concept ${concept.conceptId || "unknown"} is missing category.`);
      }

      if (!concept.description) {
        errors.push(`Normalized concept ${concept.conceptId || "unknown"} is missing description.`);
      }

      if (!Array.isArray(concept.vocabulary)) {
        errors.push(`Normalized concept ${concept.conceptId || "unknown"} is missing vocabulary array.`);
      }

      if (!Array.isArray(concept.aliases)) {
        errors.push(`Normalized concept ${concept.conceptId || "unknown"} is missing aliases array.`);
      }

      if (!Array.isArray(concept.floridaBestDomains)) {
        errors.push(`Normalized concept ${concept.conceptId || "unknown"} is missing floridaBestDomains array.`);
      }

      if (!Array.isArray(concept.relatedProblemTypes)) {
        errors.push(`Normalized concept ${concept.conceptId || "unknown"} is missing relatedProblemTypes array.`);
      }

      if (!Array.isArray(concept.prerequisiteConcepts)) {
        errors.push(`Normalized concept ${concept.conceptId || "unknown"} is missing prerequisiteConcepts array.`);
      }
    });

    return {
      contractVersion: this.version,
      conceptCount: concepts.length,
      categoryCount: this.listCategories().length,
      valid: errors.length === 0,
      errors
    };
  }
}

export const geometryConceptLookupContract = new GeometryConceptLookupContract();