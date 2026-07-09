/**
 * Geometry OS
 * JSON API Publisher v0.6.1
 */

export const jsonApiPublisher = {
  publisherId: "json_api_publisher",
  publisherName: "JSON API Publisher",
  publisherVersion: "v0.6.1",
  publisherType: "api_payload",

  prepare(normalizedExportContract = {}) {
    return {
      publisherId: this.publisherId,
      publisherName: this.publisherName,
      publisherVersion: this.publisherVersion,
      publisherType: this.publisherType,
      status: "publisher_contract_prepared",
      target: "json_api",
      exportContract: normalizedExportContract
    };
  }
};