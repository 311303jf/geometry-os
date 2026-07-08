/**
 * Geometry OS
 * Generator Contract Engine v0.3.2
 *
 * Responsibility:
 * Define and validate the universal contract required by all future
 * content generators.
 *
 * Important:
 * This engine does NOT generate instructional content.
 * It only validates generator contracts.
 */

export class GeneratorContractEngine {
  createContract({
    key,
    name,
    responsibility,
    supportedAssetTypes = [],
    requiredInputFields = [],
    outputContract = {},
    status = "contract_defined"
  } = {}) {
    const contract = {
      key,
      name: name || key,
      responsibility,
      supportedAssetTypes,
      requiredInputFields,
      outputContract,
      status,
      generate: null
    };

    this.validateContract(contract);

    return contract;
  }

  validateContract(contract = {}) {
    const errors = [];

    if (!contract.key || typeof contract.key !== "string") {
      errors.push("Generator contract requires a valid key.");
    }

    if (!contract.name || typeof contract.name !== "string") {
      errors.push("Generator contract requires a valid name.");
    }

    if (!contract.responsibility || typeof contract.responsibility !== "string") {
      errors.push("Generator contract requires a responsibility.");
    }

    if (!Array.isArray(contract.supportedAssetTypes)) {
      errors.push("Generator contract supportedAssetTypes must be an array.");
    }

    if (!Array.isArray(contract.requiredInputFields)) {
      errors.push("Generator contract requiredInputFields must be an array.");
    }

    if (!contract.outputContract || typeof contract.outputContract !== "object") {
      errors.push("Generator contract outputContract must be an object.");
    }

    if (!("generate" in contract)) {
      errors.push("Generator contract must include generate property.");
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  assertValidContract(contract = {}) {
    const result = this.validateContract(contract);

    if (!result.valid) {
      throw new Error(
        `Invalid generator contract:\n${result.errors.join("\n")}`
      );
    }

    return true;
  }
}

export const generatorContractEngine = new GeneratorContractEngine();