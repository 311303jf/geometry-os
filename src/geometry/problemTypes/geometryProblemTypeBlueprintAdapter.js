/**
 * Geometry OS
 * Geometry Problem Type Blueprint Adapter v1.0.7
 *
 * Responsibility:
 * Adapt existing question blueprint metadata into a stable request
 * for the Geometry Problem Type Resolution Contract.
 *
 * Important:
 * This adapter does NOT compose blueprints.
 * It does NOT modify blueprints.
 * It does NOT generate questions.
 * It does NOT replace the Question Blueprint Composer.
 * It does NOT replace the Geometry Problem Type Resolver.
 * It only translates blueprint metadata into a resolution request.
 */

import {
  geometryProblemTypeResolutionContract
} from "./geometryProblemTypeResolutionContract.js";

export class GeometryProblemTypeBlueprintAdapter {
  constructor({
    resolutionContract = geometryProblemTypeResolutionContract
  } = {}) {
    this.version = "v1.0.7";
    this.resolutionContract = resolutionContract;
  }

  getVersion() {
    return this.version;
  }

  adaptBlueprint(blueprint = {}) {
    const validation = this.validateBlueprintInput(blueprint);

    if (!validation.valid) {
      return this.createRejectedAdapterResult({
        blueprint,
        errors: validation.errors
      });
    }

    const resolutionRequest = this.buildResolutionRequest(blueprint);

    return {
      adapterVersion: this.version,
      status: "blueprint_adapted",
      adapted: true,
      blueprintId: resolutionRequest.blueprintId,
      resolutionRequest,
      errors: []
    };
  }

  resolveBlueprint(blueprint = {}) {
    const adapterResult = this.adaptBlueprint(blueprint);

    if (!adapterResult.adapted) {
      return {
        adapterVersion: this.version,
        status: "blueprint_resolution_rejected",
        adapted: false,
        blueprintId: adapterResult.blueprintId,
        resolutionRequest: null,
        resolution: null,
        validation: {
          valid: false,
          errors: [...adapterResult.errors]
        },
        errors: [...adapterResult.errors]
      };
    }

    const contractResult =
      this.resolutionContract.buildAndValidate(
        adapterResult.resolutionRequest
      );

    return {
      adapterVersion: this.version,
      status: contractResult.resolution.resolved
        ? "blueprint_problem_type_resolved"
        : "blueprint_problem_type_unresolved",
      adapted: true,
      blueprintId: adapterResult.blueprintId,
      resolutionRequest: {
        ...adapterResult.resolutionRequest
      },
      resolution: this.cloneResolution(contractResult.resolution),
      validation: {
        valid: contractResult.validation.valid,
        errors: [...contractResult.validation.errors]
      },
      errors: contractResult.resolution.resolved
        ? []
        : [...contractResult.resolution.errors]
    };
  }

  buildResolutionRequest(blueprint = {}) {
    return {
      blueprintId: this.resolveBlueprintId(blueprint),
      conceptId: this.resolveConceptId(blueprint),
      problemTypeId: this.resolveProblemTypeId(blueprint),
      family: this.resolveFamily(blueprint),
      targetSkill: this.resolveTargetSkill(blueprint),
      assessmentTarget: this.resolveAssessmentTarget(blueprint),
      dokLevel: this.resolveDokLevel(blueprint),
      resourceType: this.resolveResourceType(blueprint)
    };
  }

  resolveBlueprintId(blueprint) {
    return (
      blueprint.blueprintId ||
      blueprint.questionBlueprintId ||
      blueprint.id ||
      null
    );
  }

  resolveConceptId(blueprint) {
    return (
      blueprint.conceptId ||
      blueprint.geometryConceptId ||
      blueprint.targetConceptId ||
      blueprint.metadata?.conceptId ||
      blueprint.metadata?.geometryConceptId ||
      null
    );
  }

  resolveProblemTypeId(blueprint) {
    return (
      blueprint.problemTypeId ||
      blueprint.problemType ||
      blueprint.questionType ||
      blueprint.metadata?.problemTypeId ||
      blueprint.metadata?.problemType ||
      null
    );
  }

  resolveFamily(blueprint) {
    return (
      blueprint.family ||
      blueprint.problemFamily ||
      blueprint.questionFamily ||
      blueprint.metadata?.family ||
      blueprint.metadata?.problemFamily ||
      null
    );
  }

  resolveTargetSkill(blueprint) {
    return (
      blueprint.targetSkill ||
      blueprint.skill ||
      blueprint.skillId ||
      blueprint.metadata?.targetSkill ||
      blueprint.metadata?.skill ||
      null
    );
  }

  resolveAssessmentTarget(blueprint) {
    const assessmentTarget =
      blueprint.assessmentTarget ||
      blueprint.target ||
      blueprint.objective ||
      blueprint.metadata?.assessmentTarget ||
      blueprint.metadata?.target ||
      null;

    if (typeof assessmentTarget === "string") {
      return assessmentTarget;
    }

    if (
      assessmentTarget &&
      typeof assessmentTarget === "object"
    ) {
      return (
        assessmentTarget.description ||
        assessmentTarget.name ||
        assessmentTarget.target ||
        assessmentTarget.id ||
        null
      );
    }

    return null;
  }

  resolveDokLevel(blueprint) {
    return (
      blueprint.dokLevel ||
      blueprint.dok ||
      blueprint.depthOfKnowledge ||
      blueprint.metadata?.dokLevel ||
      blueprint.metadata?.dok ||
      null
    );
  }

  resolveResourceType(blueprint) {
    return (
      blueprint.resourceType ||
      blueprint.assetType ||
      blueprint.metadata?.resourceType ||
      blueprint.metadata?.assetType ||
      null
    );
  }

  validateBlueprintInput(blueprint) {
    const errors = [];

    if (
      !blueprint ||
      typeof blueprint !== "object" ||
      Array.isArray(blueprint)
    ) {
      return {
        valid: false,
        errors: ["Question blueprint object is required."]
      };
    }

    const blueprintId = this.resolveBlueprintId(blueprint);

    if (!blueprintId) {
      errors.push("Question blueprint is missing blueprintId.");
    }

    const hasResolutionMetadata = Boolean(
      this.resolveProblemTypeId(blueprint) ||
      this.resolveConceptId(blueprint) ||
      this.resolveFamily(blueprint)
    );

    if (!hasResolutionMetadata) {
      errors.push(
        "Question blueprint must provide problemTypeId, conceptId, or family metadata."
      );
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  validateAdapterResult(adapterResult) {
    const errors = [];

    if (
      !adapterResult ||
      typeof adapterResult !== "object"
    ) {
      return {
        valid: false,
        errors: ["Adapter result object is required."]
      };
    }

    if (adapterResult.adapterVersion !== this.version) {
      errors.push("Blueprint adapter version mismatch.");
    }

    if (typeof adapterResult.adapted !== "boolean") {
      errors.push("Adapter result is missing adapted boolean.");
    }

    if (!Array.isArray(adapterResult.errors)) {
      errors.push("Adapter result is missing errors array.");
    }

    if (adapterResult.adapted === true) {
      if (adapterResult.status !== "blueprint_adapted") {
        errors.push(
          "Adapted blueprint must use blueprint_adapted status."
        );
      }

      if (!adapterResult.blueprintId) {
        errors.push("Adapted blueprint is missing blueprintId.");
      }

      if (!adapterResult.resolutionRequest) {
        errors.push(
          "Adapted blueprint is missing resolutionRequest."
        );
      }

      if (adapterResult.errors.length > 0) {
        errors.push(
          "Adapted blueprint must not contain errors."
        );
      }
    }

    if (adapterResult.adapted === false) {
      if (adapterResult.status !== "blueprint_rejected") {
        errors.push(
          "Rejected blueprint must use blueprint_rejected status."
        );
      }

      if (adapterResult.resolutionRequest !== null) {
        errors.push(
          "Rejected blueprint must not contain resolutionRequest."
        );
      }

      if (adapterResult.errors.length === 0) {
        errors.push(
          "Rejected blueprint must contain at least one error."
        );
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  validateResolvedBlueprintResult(result) {
    const errors = [];

    if (!result || typeof result !== "object") {
      return {
        valid: false,
        errors: ["Resolved blueprint result object is required."]
      };
    }

    if (result.adapterVersion !== this.version) {
      errors.push("Resolved blueprint adapter version mismatch.");
    }

    if (typeof result.adapted !== "boolean") {
      errors.push(
        "Resolved blueprint result is missing adapted boolean."
      );
    }

    if (!Array.isArray(result.errors)) {
      errors.push(
        "Resolved blueprint result is missing errors array."
      );
    }

    if (result.adapted === true) {
      if (!result.resolutionRequest) {
        errors.push(
          "Resolved blueprint result is missing resolutionRequest."
        );
      }

      if (!result.resolution) {
        errors.push(
          "Resolved blueprint result is missing resolution."
        );
      }

      if (!result.validation) {
        errors.push(
          "Resolved blueprint result is missing validation."
        );
      }

      if (
        result.status !== "blueprint_problem_type_resolved" &&
        result.status !== "blueprint_problem_type_unresolved"
      ) {
        errors.push(
          `Invalid resolved blueprint status: ${result.status}`
        );
      }

      if (
        result.validation &&
        result.validation.valid !== true
      ) {
        errors.push(
          "Resolution contract validation must pass."
        );
      }
    }

    if (result.adapted === false) {
      if (result.status !== "blueprint_resolution_rejected") {
        errors.push(
          "Rejected resolution must use blueprint_resolution_rejected status."
        );
      }

      if (result.resolutionRequest !== null) {
        errors.push(
          "Rejected resolution must not contain resolutionRequest."
        );
      }

      if (result.resolution !== null) {
        errors.push(
          "Rejected resolution must not contain resolution."
        );
      }

      if (result.errors.length === 0) {
        errors.push(
          "Rejected resolution must contain at least one error."
        );
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  createRejectedAdapterResult({
    blueprint,
    errors
  }) {
    return {
      adapterVersion: this.version,
      status: "blueprint_rejected",
      adapted: false,
      blueprintId:
        blueprint && typeof blueprint === "object"
          ? this.resolveBlueprintId(blueprint)
          : null,
      resolutionRequest: null,
      errors: [...errors]
    };
  }

  cloneResolution(resolution) {
    return {
      contractVersion: resolution.contractVersion,
      resolverVersion: resolution.resolverVersion,
      status: resolution.status,
      resolved: resolution.resolved,
      resolutionStrategy: resolution.resolutionStrategy,
      blueprintId: resolution.blueprintId,
      conceptId: resolution.conceptId,
      problemTypeId: resolution.problemTypeId,
      family: resolution.family,
      expectedAnswerFormat: resolution.expectedAnswerFormat,
      requiresFigure: resolution.requiresFigure,
      problemType: resolution.problemType
        ? {
            ...resolution.problemType
          }
        : null,
      errors: [...resolution.errors]
    };
  }

  validateAdapter() {
    const errors = [];

    if (this.version !== "v1.0.7") {
      errors.push("Blueprint adapter version mismatch.");
    }

    const explicitBlueprint = {
      blueprintId: "adapter_validation_explicit",
      problemType: "classify_triangle",
      dokLevel: 1,
      resourceType: "quiz"
    };

    const explicitAdapterResult =
      this.adaptBlueprint(explicitBlueprint);

    const explicitAdapterValidation =
      this.validateAdapterResult(explicitAdapterResult);

    if (!explicitAdapterValidation.valid) {
      explicitAdapterValidation.errors.forEach((error) => {
        errors.push(
          `Explicit blueprint adaptation failed: ${error}`
        );
      });
    }

    const explicitResolutionResult =
      this.resolveBlueprint(explicitBlueprint);

    const explicitResolutionValidation =
      this.validateResolvedBlueprintResult(
        explicitResolutionResult
      );

    if (!explicitResolutionValidation.valid) {
      explicitResolutionValidation.errors.forEach((error) => {
        errors.push(
          `Explicit blueprint resolution failed: ${error}`
        );
      });
    }

    if (
      explicitResolutionResult.resolution?.problemTypeId !==
      "classify_triangle"
    ) {
      errors.push(
        "Explicit blueprint did not resolve classify_triangle."
      );
    }

    const conceptBlueprint = {
      blueprintId: "adapter_validation_concept",
      conceptId: "angles",
      targetSkill: "measure"
    };

    const conceptResolutionResult =
      this.resolveBlueprint(conceptBlueprint);

    if (
      conceptResolutionResult.resolution?.problemTypeId !==
      "measure_angle"
    ) {
      errors.push(
        "Concept blueprint did not resolve measure_angle."
      );
    }

    const invalidBlueprintResult =
      this.resolveBlueprint({
        blueprintId: "adapter_validation_invalid"
      });

    if (invalidBlueprintResult.adapted !== false) {
      errors.push(
        "Blueprint without resolution metadata should be rejected."
      );
    }

    return {
      adapterVersion: this.version,
      resolutionContractVersion:
        explicitResolutionResult.resolution?.contractVersion || null,
      resolverVersion:
        explicitResolutionResult.resolution?.resolverVersion || null,
      valid: errors.length === 0,
      errors
    };
  }
}

export const geometryProblemTypeBlueprintAdapter =
  new GeometryProblemTypeBlueprintAdapter();