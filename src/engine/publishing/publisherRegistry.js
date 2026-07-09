/**
 * Geometry OS
 * Publisher Registry v0.6.0
 *
 * Responsibility:
 * Register, retrieve, and list publisher modules.
 *
 * Important:
 * This registry does NOT publish.
 * It does NOT write files.
 * It does NOT call Google APIs.
 * It only manages publisher registration.
 */

export class PublisherRegistry {
  constructor() {
    this.publishers = new Map();
  }

  register(publisherKey, publisherDefinition = {}) {
    if (!publisherKey || typeof publisherKey !== "string") {
      throw new Error("Publisher Registry requires a valid publisher key.");
    }

    if (!publisherDefinition || typeof publisherDefinition !== "object") {
      throw new Error("Publisher Registry requires a publisher definition object.");
    }

    if (!publisherDefinition.publisherId) {
      throw new Error("Publisher definition requires publisherId.");
    }

    if (!publisherDefinition.publisherName) {
      throw new Error("Publisher definition requires publisherName.");
    }

    if (!publisherDefinition.publisherVersion) {
      throw new Error("Publisher definition requires publisherVersion.");
    }

    if (typeof publisherDefinition.prepare !== "function") {
      throw new Error("Publisher definition requires prepare function.");
    }

    this.publishers.set(publisherKey, {
      publisherKey,
      ...publisherDefinition
    });

    return this.publishers.get(publisherKey);
  }

  get(publisherKey) {
    if (!this.publishers.has(publisherKey)) {
      throw new Error(`Publisher not found: ${publisherKey}`);
    }

    return this.publishers.get(publisherKey);
  }

  has(publisherKey) {
    return this.publishers.has(publisherKey);
  }

  list() {
    return Array.from(this.publishers.values()).map((publisher) => {
      return {
        publisherKey: publisher.publisherKey,
        publisherId: publisher.publisherId,
        publisherName: publisher.publisherName,
        publisherVersion: publisher.publisherVersion,
        publisherType: publisher.publisherType || "unknown_publisher"
      };
    });
  }

  clear() {
    this.publishers.clear();
  }

  count() {
    return this.publishers.size;
  }
}

export const publisherRegistry = new PublisherRegistry();