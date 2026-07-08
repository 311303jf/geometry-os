/**
 * Geometry OS
 * Generator Discovery Engine v0.3.3
 *
 * Responsibility:
 * Discover registered content generators and match them to asset types.
 *
 * Important:
 * This engine does NOT generate instructional content.
 * It only inspects generator registry contracts.
 */

import { contentGeneratorRegistry } from "./contentGeneratorRegistry.js";

export class GeneratorDiscoveryEngine {
  constructor({ registry = contentGeneratorRegistry } = {}) {
    this.registry = registry;
  }

  discoverAll() {
    return this.registry.list();
  }

  findByAssetType(assetType) {
    if (!assetType || typeof assetType !== "string") {
      throw new Error("Generator Discovery Engine requires a valid asset type.");
    }

    return this.registry
      .list()
      .filter((generator) =>
        Array.isArray(generator.supportedAssetTypes) &&
        generator.supportedAssetTypes.includes(assetType)
      );
  }

  resolvePrimaryGenerator(assetType) {
    const matches = this.findByAssetType(assetType);

    if (matches.length === 0) {
      return null;
    }

    return matches[0];
  }

  auditAssetCoverage(assetSpecifications = []) {
    if (!Array.isArray(assetSpecifications)) {
      throw new Error("Generator Discovery Engine requires asset specifications array.");
    }

    const coverage = assetSpecifications.map((specification, index) => {
      const assetType =
        specification.assetType ||
        specification.type ||
        `unknown_asset_${index + 1}`;

      const matchingGenerators = this.findByAssetType(assetType);

      return {
        assetType,
        covered: matchingGenerators.length > 0,
        matchingGeneratorCount: matchingGenerators.length,
        matchingGenerators: matchingGenerators.map((generator) => ({
          key: generator.key,
          name: generator.name,
          status: generator.status
        }))
      };
    });

    return {
      status: "asset_generator_coverage_audited",
      totalAssetsAudited: coverage.length,
      coveredAssets: coverage.filter((item) => item.covered).length,
      uncoveredAssets: coverage.filter((item) => !item.covered).length,
      coverage
    };
  }
}

export const generatorDiscoveryEngine = new GeneratorDiscoveryEngine();