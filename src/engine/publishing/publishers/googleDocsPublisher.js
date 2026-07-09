/**
 * Geometry OS
 * Google Docs Publisher v0.6.1
 *
 * Responsibility:
 * Prepare a structured publisher contract for future Google Docs publishing.
 *
 * Important:
 * This publisher does NOT call Google APIs yet.
 * It does NOT write files.
 * It only prepares metadata for the publishing layer.
 */

export const googleDocsPublisher = {
  publisherId: "google_docs_publisher",
  publisherName: "Google Docs Publisher",
  publisherVersion: "v0.6.1",
  publisherType: "document",

  prepare(normalizedExportContract = {}) {
    return {
      publisherId: this.publisherId,
      publisherName: this.publisherName,
      publisherVersion: this.publisherVersion,
      publisherType: this.publisherType,
      status: "publisher_contract_prepared",
      target: "google_docs",
      exportContract: normalizedExportContract
    };
  }
};