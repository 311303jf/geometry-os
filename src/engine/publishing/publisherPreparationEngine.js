/**
 * Geometry OS
 * Publisher Preparation Engine v0.6.3
 *
 * Responsibility:
 * Prepare publisher contracts from a normalized export contract.
 *
 * Important:
 * This engine does NOT publish content.
 * It does NOT write files.
 * It does NOT call Google APIs.
 */

import { publisherRegistry } from "./publisherRegistry.js";
import { publisherContractBuilder } from "./publisherContractBuilder.js";

export class PublisherPreparationEngine {
  constructor({
    registry = publisherRegistry,
    contractBuilder = publisherContractBuilder
  } = {}) {
    this.registry = registry;
    this.contractBuilder = contractBuilder;
  }

  prepare(normalizedExportContract = {}) {
    if (!normalizedExportContract || typeof normalizedExportContract !== "object") {
      throw new Error("Publisher Preparation Engine requires a normalized export contract object.");
    }

    if (!this.registry || typeof this.registry.list !== "function") {
      throw new Error("Publisher Preparation Engine requires a valid publisher registry.");
    }

    if (typeof this.registry.get !== "function") {
      throw new Error("Publisher Preparation Engine requires registry.get().");
    }

    if (!this.contractBuilder || typeof this.contractBuilder.buildContract !== "function") {
      throw new Error("Publisher Preparation Engine requires a valid publisher contract builder.");
    }

    const registeredPublisherSummaries = this.registry.list();

    if (!Array.isArray(registeredPublisherSummaries)) {
      throw new Error("Publisher Registry list() must return an array.");
    }

    const preparedPublisherContracts = registeredPublisherSummaries.map((publisherSummary) => {
      if (!publisherSummary.publisherKey) {
        throw new Error("Publisher Preparation Engine found publisher summary missing publisherKey.");
      }

      const publisher = this.registry.get(publisherSummary.publisherKey);

      return this.contractBuilder.buildContract({
        publisher,
        normalizedExportContract
      });
    });

    return {
      status: "publisher_preparation_complete",
      preparedPublisherCount: preparedPublisherContracts.length,
      preparedPublisherContracts,
      metadata: {
        engineVersion: "v0.6.3",
        generatedBy: "PublisherPreparationEngine",
        generatedAt: new Date().toISOString()
      }
    };
  }
}

export const publisherPreparationEngine = new PublisherPreparationEngine();