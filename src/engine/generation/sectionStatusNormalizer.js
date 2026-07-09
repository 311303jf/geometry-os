/**
 * Geometry OS
 * Section Status Normalizer v0.5.4
 *
 * Responsibility:
 * Normalize section-level status inside an export contract.
 *
 * Important:
 * This engine does NOT generate content.
 * It does NOT modify generators.
 * It does NOT modify the content assembly engine.
 * It does NOT publish.
 * It returns a normalized export contract object.
 */

export class SectionStatusNormalizer {
  normalize(exportContract = {}) {
    this.validate(exportContract);

    const normalizedSections = exportContract.sections.map((section) => {
      return {
        ...section,
        status: this.resolveSectionStatus(section)
      };
    });

    return {
      ...exportContract,
      status: exportContract.status,
      normalizedBy: "SectionStatusNormalizer",
      normalizerVersion: "v0.5.4",
      normalizedAt: new Date().toISOString(),
      sections: normalizedSections
    };
  }

  validate(exportContract) {
    if (!exportContract || typeof exportContract !== "object") {
      throw new Error("Section Status Normalizer requires an export contract object.");
    }

    if (exportContract.status !== "export_contract_prepared") {
      throw new Error("Section Status Normalizer requires an export_contract_prepared contract.");
    }

    if (!Array.isArray(exportContract.sections)) {
      throw new Error("Section Status Normalizer requires exportContract.sections array.");
    }
  }

  resolveSectionStatus(section = {}) {
    if (section.status && section.status !== "unknown_status") {
      return section.status;
    }

    if (section.content?.status) {
      return section.content.status;
    }

    if (section.content?.contentGenerated === true) {
      return "content_generated";
    }

    if (section.content) {
      return "content_generated";
    }

    return "content_missing";
  }
}

export const sectionStatusNormalizer =
  new SectionStatusNormalizer();