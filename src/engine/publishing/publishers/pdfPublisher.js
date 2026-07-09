/**
 * Geometry OS
 * PDF Publisher v0.6.1
 */

export const pdfPublisher = {
  publisherId: "pdf_publisher",
  publisherName: "PDF Publisher",
  publisherVersion: "v0.6.1",
  publisherType: "document",

  prepare(normalizedExportContract = {}) {
    return {
      publisherId: this.publisherId,
      publisherName: this.publisherName,
      publisherVersion: this.publisherVersion,
      publisherType: this.publisherType,
      status: "publisher_contract_prepared",
      target: "pdf",
      exportContract: normalizedExportContract
    };
  }
};