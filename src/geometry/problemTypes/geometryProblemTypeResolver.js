/**
 * Geometry OS
 * Geometry Problem Type Resolver v1.0.5
 *
 * Responsibility:
 * Resolve reusable Geometry problem types from blueprint/context metadata.
 *
 * Important:
 * This resolver does NOT generate questions.
 * It does NOT modify blueprints.
 * It does NOT replace the Question Factory.
 * It only selects a valid Geometry problem type for future generation.
 */

import { geometryProblemTypeRegistry } from "./geometryProblemTypeRegistry.js";
import { geometryProblemTypeValidationContract } from "./geometryProblemTypeValidationContract.js";

export class GeometryProblemTypeResolver {
  constructor({
    problemTypeRegistry = geometryProblemTypeRegistry,
    validationContract = geometryProblemTypeValidationContract
  } = {}) {
    this.version = "v1.0.5";
    this.problemTypeRegistry = problemTypeRegistry;
    this.validationContract = validationContract;
  }

  getVersion() {
    return this.version;
  }

  resolve(input = {}) {
    const normalizedInput = this.normalizeInput(input);

    const explicitProblemTypeResolution =
      this.resolveExplicitProblemType(normalizedInput);

    if (explicitProblemTypeResolution.resolved) {
      return explicitProblemTypeResolution;
    }

    const conceptProblemTypeResolution =
      this.resolveByConceptId(normalizedInput);

    if (conceptProblemTypeResolution.resolved) {
      return conceptProblemTypeResolution;
    }

    const familyProblemTypeResolution =
      this.resolveByFamily(normalizedInput);

    if (familyProblemTypeResolution.resolved) {
      return familyProblemTypeResolution;
    }

    return this.createUnresolvedResult(normalizedInput, [
      "No valid Geometry problem type could be resolved from the provided metadata."
    ]);
  }

  normalizeInput(input = {}) {
    return {
      blueprintId: input.blueprintId || null,
      conceptId: input.conceptId || input.geometryConceptId || null,
      problemTypeId: input.problemTypeId || input.problemType || null,
      family: input.family || input.problemFamily || null,
      targetSkill: input.targetSkill || null,
      assessmentTarget: input.assessmentTarget || null,
      dokLevel: input.dokLevel || null,
      rawInput: input
    };
  }

  resolveExplicitProblemType(normalizedInput) {
    if (!normalizedInput.problemTypeId) {
      return this.createUnresolvedResult(normalizedInput, [
        "No explicit problemTypeId provided."
      ]);
    }

    const problemType = this.problemTypeRegistry.getProblemType(
      normalizedInput.problemTypeId
    );

    if (!problemType) {
      return this.createUnresolvedResult(normalizedInput, [
        `Explicit problemTypeId not found: ${normalizedInput.problemTypeId}`
      ]);
    }

    const validation = this.validationContract.validateProblemType(problemType);

    if (!validation.valid) {
      return this.createUnresolvedResult(normalizedInput, validation.errors);
    }

    return this.createResolvedResult({
      normalizedInput,
      problemType,
      resolutionStrategy: "explicit_problem_type"
    });
  }

  resolveByConceptId(normalizedInput) {
    if (!normalizedInput.conceptId) {
      return this.createUnresolvedResult(normalizedInput, [
        "No conceptId provided."
      ]);
    }

    const matchingProblemTypes =
      this.problemTypeRegistry.getProblemTypesByConcept(normalizedInput.conceptId);

    if (matchingProblemTypes.length === 0) {
      return this.createUnresolvedResult(normalizedInput, [
        `No problem types found for conceptId: ${normalizedInput.conceptId}`
      ]);
    }

    const selectedProblemType =
      this.selectBestProblemType(matchingProblemTypes, normalizedInput);

    const validation = this.validationContract.validateProblemType(selectedProblemType);

    if (!validation.valid) {
      return this.createUnresolvedResult(normalizedInput, validation.errors);
    }

    return this.createResolvedResult({
      normalizedInput,
      problemType: selectedProblemType,
      resolutionStrategy: "concept_id"
    });
  }

  resolveByFamily(normalizedInput) {
    if (!normalizedInput.family) {
      return this.createUnresolvedResult(normalizedInput, [
        "No family provided."
      ]);
    }

    const matchingProblemTypes =
      this.problemTypeRegistry.getProblemTypesByFamily(normalizedInput.family);

    if (matchingProblemTypes.length === 0) {
      return this.createUnresolvedResult(normalizedInput, [
        `No problem types found for family: ${normalizedInput.family}`
      ]);
    }

    const selectedProblemType =
      this.selectBestProblemType(matchingProblemTypes, normalizedInput);

    const validation = this.validationContract.validateProblemType(selectedProblemType);

    if (!validation.valid) {
      return this.createUnresolvedResult(normalizedInput, validation.errors);
    }

    return this.createResolvedResult({
      normalizedInput,
      problemType: selectedProblemType,
      resolutionStrategy: "family"
    });
  }

  selectBestProblemType(problemTypes, normalizedInput) {
    if (normalizedInput.targetSkill) {
      const normalizedTargetSkill = String(normalizedInput.targetSkill).toLowerCase();

      const targetSkillMatch = problemTypes.find((problemType) =>
        problemType.problemTypeId.toLowerCase().includes(normalizedTargetSkill)
      );

      if (targetSkillMatch) {
        return targetSkillMatch;
      }
    }

    if (normalizedInput.assessmentTarget) {
      const normalizedAssessmentTarget =
        String(normalizedInput.assessmentTarget).toLowerCase();

      const assessmentTargetMatch = problemTypes.find((problemType) =>
        problemType.description.toLowerCase().includes(normalizedAssessmentTarget) ||
        problemType.problemTypeId.toLowerCase().includes(normalizedAssessmentTarget)
      );

      if (assessmentTargetMatch) {
        return assessmentTargetMatch;
      }
    }

    return problemTypes[0];
  }

  createResolvedResult({
    normalizedInput,
    problemType,
    resolutionStrategy
  }) {
    return {
      resolverVersion: this.version,
      resolved: true,
      resolutionStrategy,
      blueprintId: normalizedInput.blueprintId,
      conceptId: problemType.conceptId,
      problemTypeId: problemType.problemTypeId,
      family: problemType.family,
      expectedAnswerFormat: problemType.expectedAnswerFormat,
      requiresFigure: problemType.requiresFigure,
      problemType,
      errors: []
    };
  }

  createUnresolvedResult(normalizedInput, errors = []) {
    return {
      resolverVersion: this.version,
      resolved: false,
      resolutionStrategy: "unresolved",
      blueprintId: normalizedInput.blueprintId,
      conceptId: normalizedInput.conceptId,
      problemTypeId: normalizedInput.problemTypeId,
      family: normalizedInput.family,
      expectedAnswerFormat: null,
      requiresFigure: null,
      problemType: null,
      errors
    };
  }

  validateResolver() {
    const registryValidation = this.validationContract.validateRegistry();
    const errors = [];

    if (this.version !== "v1.0.5") {
      errors.push("Resolver version mismatch.");
    }

    if (!registryValidation.valid) {
      registryValidation.errors.forEach((error) => errors.push(error));
    }

    const explicitResolution = this.resolve({
      problemTypeId: "classify_triangle"
    });

    if (!explicitResolution.resolved) {
      errors.push("Resolver failed explicit problem type resolution.");
    }

    const conceptResolution = this.resolve({
      conceptId: "angles"
    });

    if (!conceptResolution.resolved) {
      errors.push("Resolver failed conceptId resolution.");
    }

    const familyResolution = this.resolve({
      family: "foundational_identification"
    });

    if (!familyResolution.resolved) {
      errors.push("Resolver failed family resolution.");
    }

    const invalidResolution = this.resolve({
      problemTypeId: "missing_problem_type"
    });

    if (invalidResolution.resolved) {
      errors.push("Resolver should not resolve invalid problemTypeId.");
    }

    return {
      resolverVersion: this.version,
      registryVersion: registryValidation.registryVersion,
      problemTypeCount: registryValidation.problemTypeCount,
      valid: errors.length === 0,
      errors
    };
  }
}

export const geometryProblemTypeResolver = new GeometryProblemTypeResolver();