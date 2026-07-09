/**
 * Geometry OS
 * Google Classroom Publisher v0.6.1
 */

export const googleClassroomPublisher = {
  publisherId: "google_classroom_publisher",
  publisherName: "Google Classroom Publisher",
  publisherVersion: "v0.6.1",
  publisherType: "assignment_resources",

  prepare(normalizedExportContract = {}) {
    return {
      publisherId: this.publisherId,
      publisherName: this.publisherName,
      publisherVersion: this.publisherVersion,
      publisherType: this.publisherType,
      status: "publisher_contract_prepared",
      target: "google_classroom",
      exportContract: normalizedExportContract
    };
  }
};