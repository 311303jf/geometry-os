/**
 * Geometry OS
 * Geometry Problem Type Validation Contract v1.0.4
 *
 * Responsibility:
 * Validate Geometry Problem Type Registry entries against the Geometry Concept Lookup Contract.
 *
 * Important:
 * This contract does NOT generate questions.
 * It does NOT resolve blueprints.
 * It does NOT modify the registry.
 * It only verifies that problem type metadata is structurally valid
 * and connected to real Geometry concepts.
 */

import { geometryProblemTypeRegistry } from "./geometryProblemTypeRegistry.js";
import { geometryConceptLookupContract } from "../knowledge/geometryConceptLookupContract.js";

export class GeometryProblemTypeValidationContract {
  constructor({
    problemTypeRegistry = geometryProblemTypeRegistry,
    conceptLookupContract = geometryConceptLookupContract
  } = {}) {
    this.version = "v1.0.4";
    this.problemTypeRegistry = problemTypeRegistry;
    this.conceptLookupContract = conceptLookupContract;
  }

  getVersion() {
    return this.version;
  }

  validateProblemType(problemType) {
    const errors = [];

    if (!problemType) {
      return {
        valid: false,
        errors: ["Problem type is required."]
      };
    }

    if (!problemType.problemTypeId) {
      errors.push("Problem type is missing problemTypeId.");
    }

    if (!problemType.conceptId) {
      errors.push(`Problem type ${problemType.problemTypeId || "unknown"} is missing conceptId.`);
    }

    if (
      problemType.conceptId &&
      !this.conceptLookupContract.hasConcept(problemType.conceptId)
    ) {
      errors.push(
        `Problem type ${problemType.problemTypeId} references missing conceptId: ${problemType.conceptId}`
      );
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

    return {
      valid: errors.length === 0,
      errors
    };
  }

  validateRegistry() {
    const registryValidation = this.problemTypeRegistry.validate();
    const problemTypes = this.problemTypeRegistry.listProblemTypes();
    const errors = [...registryValidation.errors];

    problemTypes.forEach((problemType) => {
      const validation = this.validateProblemType(problemType);

      validation.errors.forEach((error) => {
        errors.push(error);
      });
    });

    return {
      validationContractVersion: this.version,
      registryVersion: registryValidation.registryVersion,
      problemTypeCount: problemTypes.length,
      familyCount: this.problemTypeRegistry.listFamilies().length,
      conceptConnectionCount: problemTypes.filter((problemType) =>
        this.conceptLookupContract.hasConcept(problemType.conceptId)
      ).length,
      valid: errors.length === 0,
      errors
    };
  }

  getProblemTypesWithConcepts() {
    return this.problemTypeRegistry.listProblemTypes().map((problemType) => {
      return {
        ...problemType,
        concept: this.conceptLookupContract.getConceptById(problemType.conceptId)
      };
    });
  }

  getDisconnectedProblemTypes() {
    return this.problemTypeRegistry.listProblemTypes().filter((problemType) =>
      !this.conceptLookupContract.hasConcept(problemType.conceptId)
    );
  }
}

export const geometryProblemTypeValidationContract =
  new GeometryProblemTypeValidationContract();