/**
 * Geometry OS
 * Publisher Contract Builder v0.6.3
 *
 * Responsibility:
 * Build normalized publisher-specific contracts.
 *
 * Important:
 * This engine does NOT publish content.
 * It does NOT write files.
 * It does NOT call Google APIs.
 */

export class PublisherContractBuilder {
  buildContract({ publisher = {}, normalizedExportContract = {} } = {}) {
    if (!publisher || typeof publisher !== "object") {
      throw new Error("Publisher Contract Builder requires a publisher object.");
    }

    if (!publisher.publisherId) {
      throw new Error("Publisher Contract Builder requires publisher.publisherId.");
    }

    if (!publisher.publisherName) {
      throw new Error("Publisher Contract Builder requires publisher.publisherName.");
    }

    if (!publisher.publisherVersion) {
      throw new Error("Publisher Contract Builder requires publisher.publisherVersion.");
    }

    if (!normalizedExportContract || typeof normalizedExportContract !== "object") {
      throw new Error("Publisher Contract Builder requires a normalized export contract object.");
    }

    return {
      publisherId: publisher.publisherId,
      publisherName: publisher.publisherName,
      publisherVersion: publisher.publisherVersion,
      publisherType: publisher.publisherType || "unknown_publisher",
      target: this.resolveTarget(publisher.publisherId),
      contractStatus: "publisher_contract_built",

      lesson: {
        lessonId: normalizedExportContract.lessonId || null,
        lessonTitle: normalizedExportContract.lessonTitle || null
      },

      sections: Array.isArray(normalizedExportContract.sections)
        ? normalizedExportContract.sections
        : [],

      sourceExportContractStatus: normalizedExportContract.status || null,

      metadata: {
        engineVersion: "v0.6.3",
        generatedBy: "PublisherContractBuilder",
        generatedAt: new Date().toISOString()
      }
    };
  }

  resolveTarget(publisherId) {
    const targetMap = {
      google_docs_publisher: "google_docs",
      google_classroom_publisher: "google_classroom",
      pdf_publisher: "pdf",
      html_publisher: "html",
      json_api_publisher: "json_api"
    };

    return targetMap[publisherId] || "unknown_target";
  }
}

export const publisherContractBuilder = new PublisherContractBuilder();