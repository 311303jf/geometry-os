/**
 * Geometry OS
 * Publisher Readiness Validator v0.5.3
 *
 * Responsibility:
 * Validate that an export contract is ready for future publishers.
 *
 * Important:
 * This validator does NOT publish.
 * It does NOT write files.
 * It does NOT create Docs, PDFs, Classroom assignments, HTML, or API responses.
 * It only checks readiness for future publisher engines.
 */

export class PublisherReadinessValidator {
  validate(exportContract = {}) {
    const errors = [];
    const warnings = [];

    this.validateContractShape(exportContract, errors);
    this.validatePublisherSupport(exportContract, errors, warnings);
    this.validateExportTargets(exportContract, errors, warnings);
    this.validateSections(exportContract, errors, warnings);

    return {
      status: errors.length === 0
        ? "publisher_readiness_valid"
        : "publisher_readiness_invalid",
      valid: errors.length === 0,
      validatorVersion: "v0.5.3",
      generatedBy: "PublisherReadinessValidator",
      generatedAt: new Date().toISOString(),
      errorCount: errors.length,
      warningCount: warnings.length,
      errors,
      warnings,
      readinessSummary: {
        supportedPublishers: Array.isArray(exportContract.supportedPublishers)
          ? exportContract.supportedPublishers.length
          : 0,
        exportTargets: exportContract.exportTargets
          ? Object.keys(exportContract.exportTargets).length
          : 0,
        sections: Array.isArray(exportContract.sections)
          ? exportContract.sections.length
          : 0
      }
    };
  }

  validateContractShape(exportContract, errors) {
    if (!exportContract || typeof exportContract !== "object") {
      errors.push("Publisher Readiness Validator requires an export contract object.");
      return;
    }

    if (exportContract.status !== "export_contract_prepared") {
      errors.push("Export contract status must be export_contract_prepared.");
    }

    if (!exportContract.exportContractVersion) {
      errors.push("Export contract is missing exportContractVersion.");
    }

    if (!Array.isArray(exportContract.sections)) {
      errors.push("Export contract must include sections array.");
    }

    if (!Array.isArray(exportContract.supportedPublishers)) {
      errors.push("Export contract must include supportedPublishers array.");
    }

    if (!exportContract.exportTargets || typeof exportContract.exportTargets !== "object") {
      errors.push("Export contract must include exportTargets object.");
    }
  }

  validatePublisherSupport(exportContract, errors, warnings) {
    const requiredPublishers = [
      "google_docs_publisher",
      "google_classroom_publisher",
      "pdf_publisher",
      "html_publisher",
      "json_api_publisher"
    ];

    const supportedPublishers = exportContract.supportedPublishers || [];

    requiredPublishers.forEach((publisherId) => {
      if (!supportedPublishers.includes(publisherId)) {
        errors.push(`Missing required supported publisher: ${publisherId}`);
      }
    });

    if (supportedPublishers.length > requiredPublishers.length) {
      warnings.push("Export contract includes additional publishers beyond the required publisher set.");
    }
  }

  validateExportTargets(exportContract, errors, warnings) {
    const requiredTargets = [
      "googleDocs",
      "googleClassroom",
      "pdf",
      "html",
      "jsonApi"
    ];

    const exportTargets = exportContract.exportTargets || {};

    requiredTargets.forEach((targetKey) => {
      const target = exportTargets[targetKey];

      if (!target) {
        errors.push(`Missing required export target: ${targetKey}`);
        return;
      }

      if (target.enabled !== true) {
        errors.push(`Export target must be enabled: ${targetKey}`);
      }

      if (!target.format) {
        errors.push(`Export target is missing format: ${targetKey}`);
      }

      if (typeof target.sectionCount !== "number") {
        errors.push(`Export target is missing numeric sectionCount: ${targetKey}`);
      }

      if (target.sectionCount === 0) {
        warnings.push(`Export target has zero sections: ${targetKey}`);
      }
    });
  }

  validateSections(exportContract, errors, warnings) {
    const sections = exportContract.sections || [];

    if (sections.length === 0) {
      errors.push("Export contract must include at least one section.");
      return;
    }

    sections.forEach((section, index) => {
      const label = `Section ${index + 1}`;

      if (!section.exportSectionId) {
        errors.push(`${label} is missing exportSectionId.`);
      }

      if (!section.sectionId) {
        errors.push(`${label} is missing sectionId.`);
      }

      if (!section.assetType) {
        errors.push(`${label} is missing assetType.`);
      }

      if (!section.generatorId) {
        errors.push(`${label} is missing generatorId.`);
      }

      if (!section.title) {
        errors.push(`${label} is missing title.`);
      }

      if (!section.content) {
        errors.push(`${label} is missing content.`);
      }

      if (!section.publisherHints || typeof section.publisherHints !== "object") {
        errors.push(`${label} is missing publisherHints.`);
      } else {
        this.validatePublisherHints(section.publisherHints, label, errors);
      }

      if (section.status === "unknown_status") {
        warnings.push(`${label} has unknown_status. Future publishers may require section-level content_generated status.`);
      }
    });
  }

  validatePublisherHints(publisherHints, label, errors) {
    const requiredHints = [
      "includeInGoogleDocs",
      "includeInGoogleClassroom",
      "includeInPdf",
      "includeInHtml",
      "includeInJsonApi"
    ];

    requiredHints.forEach((hintKey) => {
      if (publisherHints[hintKey] !== true) {
        errors.push(`${label} publisherHints.${hintKey} must be true.`);
      }
    });
  }
}

export const publisherReadinessValidator =
  new PublisherReadinessValidator();