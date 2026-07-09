/**
 * Geometry OS
 * HTML Publisher v0.6.1
 */

export const htmlPublisher = {
  publisherId: "html_publisher",
  publisherName: "HTML Publisher",
  publisherVersion: "v0.6.1",
  publisherType: "document",

  prepare(normalizedExportContract = {}) {
    return {
      publisherId: this.publisherId,
      publisherName: this.publisherName,
      publisherVersion: this.publisherVersion,
      publisherType: this.publisherType,
      status: "publisher_contract_prepared",
      target: "html",
      exportContract: normalizedExportContract
    };
  }
};