/**
 * Geometry OS
 * Geometry Problem Type Blueprint Resolution Pipeline v1.0.8
 *
 * Responsibility:
 * Resolve one or more question blueprints through the certified
 * Geometry Problem Type Blueprint Adapter.
 *
 * Important:
 * This pipeline does NOT compose blueprints.
 * It does NOT modify source blueprints.
 * It does NOT generate questions.
 * It does NOT replace the Question Factory.
 * It only coordinates blueprint-to-problem-type resolution.
 */

import {
  geometryProblemTypeBlueprintAdapter
} from "./geometryProblemTypeBlueprintAdapter.js";

export class GeometryProblemTypeBlueprintResolutionPipeline {
  constructor({
    blueprintAdapter = geometryProblemTypeBlueprintAdapter
  } = {}) {
    this.version = "v1.0.8";
    this.blueprintAdapter = blueprintAdapter;
  }

  getVersion() {
    return this.version;
  }

  execute(blueprints = []) {
    const inputValidation = this.validateInput(blueprints);

    if (!inputValidation.valid) {
      return this.createRejectedPipelineResult(inputValidation.errors);
    }

    const results = blueprints.map((blueprint, index) =>
      this.resolveBlueprintRecord(blueprint, index)
    );

    const summary = this.buildSummary(results);

    return {
      pipelineVersion: this.version,
      adapterVersion: this.blueprintAdapter.getVersion(),
      status: summary.allProcessed
        ? "blueprint_resolution_pipeline_complete"
        : "blueprint_resolution_pipeline_incomplete",
      accepted: true,
      inputBlueprintCount: blueprints.length,
      processedBlueprintCount: results.length,
      resolvedBlueprintCount: summary.resolvedBlueprintCount,
      unresolvedBlueprintCount: summary.unresolvedBlueprintCount,
      rejectedBlueprintCount: summary.rejectedBlueprintCount,
      allProcessed: summary.allProcessed,
      allResolved: summary.allResolved,
      results,
      errors: []
    };
  }

  resolveBlueprintRecord(blueprint, index) {
    const sourceBlueprint = this.cloneValue(blueprint);

    const adapterResult =
      this.blueprintAdapter.resolveBlueprint(sourceBlueprint);

    const classification =
      this.classifyAdapterResult(adapterResult);

    return {
      recordId: this.createRecordId(index),
      order: index + 1,
      blueprintId:
        adapterResult.blueprintId ||
        this.resolveBlueprintId(sourceBlueprint),
      classification,
      sourceBlueprint,
      adapterResult: this.cloneValue(adapterResult)
    };
  }

  classifyAdapterResult(adapterResult) {
    if (!adapterResult || adapterResult.adapted !== true) {
      return "rejected";
    }

    if (adapterResult.resolution?.resolved === true) {
      return "resolved";
    }

    return "unresolved";
  }

  buildSummary(results = []) {
    const resolvedBlueprintCount =
      results.filter((result) =>
        result.classification === "resolved"
      ).length;

    const unresolvedBlueprintCount =
      results.filter((result) =>
        result.classification === "unresolved"
      ).length;

    const rejectedBlueprintCount =
      results.filter((result) =>
        result.classification === "rejected"
      ).length;

    return {
      resolvedBlueprintCount,
      unresolvedBlueprintCount,
      rejectedBlueprintCount,
      allProcessed:
        results.length ===
        resolvedBlueprintCount +
          unresolvedBlueprintCount +
          rejectedBlueprintCount,
      allResolved:
        results.length > 0 &&
        resolvedBlueprintCount === results.length
    };
  }

  getResolvedResults(pipelineResult) {
    if (!pipelineResult || !Array.isArray(pipelineResult.results)) {
      return [];
    }

    return pipelineResult.results.filter((result) =>
      result.classification === "resolved"
    );
  }

  getUnresolvedResults(pipelineResult) {
    if (!pipelineResult || !Array.isArray(pipelineResult.results)) {
      return [];
    }

    return pipelineResult.results.filter((result) =>
      result.classification === "unresolved"
    );
  }

  getRejectedResults(pipelineResult) {
    if (!pipelineResult || !Array.isArray(pipelineResult.results)) {
      return [];
    }

    return pipelineResult.results.filter((result) =>
      result.classification === "rejected"
    );
  }

  validateInput(blueprints) {
    const errors = [];

    if (!Array.isArray(blueprints)) {
      return {
        valid: false,
        errors: ["Blueprint resolution pipeline requires an array."]
      };
    }

    if (blueprints.length === 0) {
      errors.push(
        "Blueprint resolution pipeline requires at least one blueprint."
      );
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  validatePipelineResult(pipelineResult) {
    const errors = [];

    if (!pipelineResult || typeof pipelineResult !== "object") {
      return {
        valid: false,
        errors: ["Pipeline result object is required."]
      };
    }

    if (pipelineResult.pipelineVersion !== this.version) {
      errors.push("Blueprint resolution pipeline version mismatch.");
    }

    if (typeof pipelineResult.accepted !== "boolean") {
      errors.push("Pipeline result is missing accepted boolean.");
    }

    if (!Array.isArray(pipelineResult.results)) {
      errors.push("Pipeline result is missing results array.");
    }

    if (!Array.isArray(pipelineResult.errors)) {
      errors.push("Pipeline result is missing errors array.");
    }

    if (pipelineResult.accepted === true) {
      if (
        pipelineResult.status !==
          "blueprint_resolution_pipeline_complete" &&
        pipelineResult.status !==
          "blueprint_resolution_pipeline_incomplete"
      ) {
        errors.push(
          `Invalid accepted pipeline status: ${pipelineResult.status}`
        );
      }

      if (
        pipelineResult.inputBlueprintCount !==
        pipelineResult.processedBlueprintCount
      ) {
        errors.push(
          "Accepted pipeline must process every input blueprint."
        );
      }

      const classifiedCount =
        pipelineResult.resolvedBlueprintCount +
        pipelineResult.unresolvedBlueprintCount +
        pipelineResult.rejectedBlueprintCount;

      if (
        classifiedCount !==
        pipelineResult.processedBlueprintCount
      ) {
        errors.push(
          "Pipeline classification counts do not match processed count."
        );
      }

      if (pipelineResult.allProcessed !== true) {
        errors.push(
          "Accepted pipeline must report allProcessed true."
        );
      }

      if (pipelineResult.errors.length > 0) {
        errors.push(
          "Accepted pipeline must not contain pipeline-level errors."
        );
      }

      pipelineResult.results.forEach((result, index) => {
        if (!result.recordId) {
          errors.push(
            `Pipeline result at index ${index} is missing recordId.`
          );
        }

        if (result.order !== index + 1) {
          errors.push(
            `Pipeline result at index ${index} has invalid order.`
          );
        }

        if (
          result.classification !== "resolved" &&
          result.classification !== "unresolved" &&
          result.classification !== "rejected"
        ) {
          errors.push(
            `Pipeline result at index ${index} has invalid classification.`
          );
        }

        if (!result.sourceBlueprint) {
          errors.push(
            `Pipeline result at index ${index} is missing sourceBlueprint.`
          );
        }

        if (!result.adapterResult) {
          errors.push(
            `Pipeline result at index ${index} is missing adapterResult.`
          );
        }
      });
    }

    if (pipelineResult.accepted === false) {
      if (
        pipelineResult.status !==
        "blueprint_resolution_pipeline_rejected"
      ) {
        errors.push(
          "Rejected pipeline must use blueprint_resolution_pipeline_rejected status."
        );
      }

      if (pipelineResult.results.length !== 0) {
        errors.push(
          "Rejected pipeline must not contain results."
        );
      }

      if (pipelineResult.errors.length === 0) {
        errors.push(
          "Rejected pipeline must contain at least one error."
        );
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  createRejectedPipelineResult(errors = []) {
    return {
      pipelineVersion: this.version,
      adapterVersion: this.blueprintAdapter.getVersion(),
      status: "blueprint_resolution_pipeline_rejected",
      accepted: false,
      inputBlueprintCount: 0,
      processedBlueprintCount: 0,
      resolvedBlueprintCount: 0,
      unresolvedBlueprintCount: 0,
      rejectedBlueprintCount: 0,
      allProcessed: false,
      allResolved: false,
      results: [],
      errors: [...errors]
    };
  }

  createRecordId(index) {
    return `geometry_problem_type_resolution_${index + 1}`;
  }

  resolveBlueprintId(blueprint = {}) {
    return (
      blueprint.blueprintId ||
      blueprint.questionBlueprintId ||
      blueprint.id ||
      null
    );
  }

  cloneValue(value) {
    if (value === null || value === undefined) {
      return value;
    }

    return JSON.parse(JSON.stringify(value));
  }

  validatePipeline() {
    const errors = [];

    if (this.version !== "v1.0.8") {
      errors.push("Blueprint resolution pipeline version mismatch.");
    }

    const certificationBlueprints = [
      {
        blueprintId: "pipeline_validation_explicit",
        problemType: "classify_triangle",
        dokLevel: 1
      },
      {
        blueprintId: "pipeline_validation_concept",
        conceptId: "angles",
        targetSkill: "measure",
        dokLevel: 2
      },
      {
        blueprintId: "pipeline_validation_family",
        problemFamily: "foundational_identification",
        dokLevel: 1
      },
      {
        blueprintId: "pipeline_validation_unresolved",
        problemType: "missing_problem_type",
        dokLevel: 1
      },
      {
        blueprintId: "pipeline_validation_rejected",
        dokLevel: 1
      }
    ];

    const pipelineResult =
      this.execute(certificationBlueprints);

    const pipelineValidation =
      this.validatePipelineResult(pipelineResult);

    if (!pipelineValidation.valid) {
      pipelineValidation.errors.forEach((error) => {
        errors.push(`Pipeline validation failed: ${error}`);
      });
    }

    if (pipelineResult.resolvedBlueprintCount !== 3) {
      errors.push(
        "Certification pipeline must resolve exactly 3 blueprints."
      );
    }

    if (pipelineResult.unresolvedBlueprintCount !== 1) {
      errors.push(
        "Certification pipeline must contain exactly 1 unresolved blueprint."
      );
    }

    if (pipelineResult.rejectedBlueprintCount !== 1) {
      errors.push(
        "Certification pipeline must reject exactly 1 blueprint."
      );
    }

    const invalidInputResult = this.execute({});

    const invalidInputValidation =
      this.validatePipelineResult(invalidInputResult);

    if (!invalidInputValidation.valid) {
      invalidInputValidation.errors.forEach((error) => {
        errors.push(
          `Rejected pipeline validation failed: ${error}`
        );
      });
    }

    return {
      pipelineVersion: this.version,
      adapterVersion: this.blueprintAdapter.getVersion(),
      certificationBlueprintCount:
        certificationBlueprints.length,
      valid: errors.length === 0,
      errors
    };
  }
}

export const geometryProblemTypeBlueprintResolutionPipeline =
  new GeometryProblemTypeBlueprintResolutionPipeline();