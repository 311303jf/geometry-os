/**
 * Geometry OS
 * Geometry Problem Type Resolution Contract v1.0.6
 *
 * Responsibility:
 * Normalize and validate Geometry Problem Type Resolver results.
 *
 * Important:
 * This contract does NOT resolve problem types independently.
 * It does NOT generate questions.
 * It does NOT modify blueprints.
 * It does NOT replace the Geometry Problem Type Resolver.
 * It provides a stable output contract for future generation engines.
 */

import { geometryProblemTypeResolver } from "./geometryProblemTypeResolver.js";

export class GeometryProblemTypeResolutionContract {
  constructor({
    problemTypeResolver = geometryProblemTypeResolver
  } = {}) {
    this.version = "v1.0.6";
    this.problemTypeResolver = problemTypeResolver;
  }

  getVersion() {
    return this.version;
  }

  buildResolution(input = {}) {
    const resolverResult = this.problemTypeResolver.resolve(input);

    return this.normalizeResolution(resolverResult);
  }

  normalizeResolution(resolverResult = {}) {
    const resolved = resolverResult.resolved === true;

    return {
      contractVersion: this.version,
      resolverVersion: resolverResult.resolverVersion || null,
      status: resolved ? "problem_type_resolved" : "problem_type_unresolved",
      resolved,
      resolutionStrategy: resolverResult.resolutionStrategy || "unresolved",
      blueprintId: resolverResult.blueprintId || null,
      conceptId: resolverResult.conceptId || null,
      problemTypeId: resolverResult.problemTypeId || null,
      family: resolverResult.family || null,
      expectedAnswerFormat: resolverResult.expectedAnswerFormat || null,
      requiresFigure:
        typeof resolverResult.requiresFigure === "boolean"
          ? resolverResult.requiresFigure
          : null,
      problemType: resolverResult.problemType
        ? this.normalizeProblemType(resolverResult.problemType)
        : null,
      errors: Array.isArray(resolverResult.errors)
        ? [...resolverResult.errors]
        : []
    };
  }

  normalizeProblemType(problemType) {
    return {
      problemTypeId: problemType.problemTypeId,
      conceptId: problemType.conceptId,
      family: problemType.family,
      description: problemType.description,
      expectedAnswerFormat: problemType.expectedAnswerFormat,
      requiresFigure: problemType.requiresFigure
    };
  }

  validateResolution(resolution) {
    const errors = [];

    if (!resolution || typeof resolution !== "object") {
      return {
        valid: false,
        errors: ["Resolution contract object is required."]
      };
    }

    if (resolution.contractVersion !== this.version) {
      errors.push("Resolution contract version mismatch.");
    }

    if (!resolution.resolverVersion) {
      errors.push("Resolution is missing resolverVersion.");
    }

    if (
      resolution.status !== "problem_type_resolved" &&
      resolution.status !== "problem_type_unresolved"
    ) {
      errors.push(`Invalid resolution status: ${resolution.status}`);
    }

    if (typeof resolution.resolved !== "boolean") {
      errors.push("Resolution is missing resolved boolean.");
    }

    if (!resolution.resolutionStrategy) {
      errors.push("Resolution is missing resolutionStrategy.");
    }

    if (!Array.isArray(resolution.errors)) {
      errors.push("Resolution is missing errors array.");
    }

    if (resolution.resolved === true) {
      if (resolution.status !== "problem_type_resolved") {
        errors.push("Resolved result must use problem_type_resolved status.");
      }

      if (!resolution.conceptId) {
        errors.push("Resolved result is missing conceptId.");
      }

      if (!resolution.problemTypeId) {
        errors.push("Resolved result is missing problemTypeId.");
      }

      if (!resolution.family) {
        errors.push("Resolved result is missing family.");
      }

      if (!resolution.expectedAnswerFormat) {
        errors.push("Resolved result is missing expectedAnswerFormat.");
      }

      if (typeof resolution.requiresFigure !== "boolean") {
        errors.push("Resolved result is missing requiresFigure boolean.");
      }

      if (!resolution.problemType) {
        errors.push("Resolved result is missing normalized problemType.");
      }

      if (resolution.errors.length > 0) {
        errors.push("Resolved result must not contain errors.");
      }
    }

    if (resolution.resolved === false) {
      if (resolution.status !== "problem_type_unresolved") {
        errors.push("Unresolved result must use problem_type_unresolved status.");
      }

      if (resolution.problemType !== null) {
        errors.push("Unresolved result must not contain problemType metadata.");
      }

      if (resolution.errors.length === 0) {
        errors.push("Unresolved result must contain at least one error.");
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  buildAndValidate(input = {}) {
    const resolution = this.buildResolution(input);
    const validation = this.validateResolution(resolution);

    return {
      resolution,
      validation
    };
  }

  validateContract() {
    const errors = [];

    if (this.version !== "v1.0.6") {
      errors.push("Resolution contract version mismatch.");
    }

    const explicitResult = this.buildAndValidate({
      blueprintId: "contract_validation_explicit",
      problemTypeId: "classify_triangle"
    });

    if (!explicitResult.validation.valid) {
      explicitResult.validation.errors.forEach((error) => {
        errors.push(`Explicit resolution validation failed: ${error}`);
      });
    }

    const conceptResult = this.buildAndValidate({
      blueprintId: "contract_validation_concept",
      conceptId: "angles",
      targetSkill: "measure"
    });

    if (!conceptResult.validation.valid) {
      conceptResult.validation.errors.forEach((error) => {
        errors.push(`Concept resolution validation failed: ${error}`);
      });
    }

    const invalidResult = this.buildAndValidate({
      blueprintId: "contract_validation_invalid",
      problemTypeId: "missing_problem_type"
    });

    if (!invalidResult.validation.valid) {
      invalidResult.validation.errors.forEach((error) => {
        errors.push(`Unresolved result validation failed: ${error}`);
      });
    }

    if (invalidResult.resolution.resolved !== false) {
      errors.push("Invalid problem type should produce an unresolved contract.");
    }

    return {
      contractVersion: this.version,
      resolverVersion: explicitResult.resolution.resolverVersion,
      valid: errors.length === 0,
      errors
    };
  }
}

export const geometryProblemTypeResolutionContract =
  new GeometryProblemTypeResolutionContract();