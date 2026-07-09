/**
 * Geometry OS
 * Publisher Registration Engine v0.6.1
 *
 * Responsibility:
 * Register all available publisher modules into the Publisher Registry.
 *
 * Important:
 * This engine does NOT publish content.
 * It does NOT write files.
 * It does NOT call external APIs.
 */

import { publisherRegistry } from "./publisherRegistry.js";

import { googleDocsPublisher } from "./publishers/googleDocsPublisher.js";
import { googleClassroomPublisher } from "./publishers/googleClassroomPublisher.js";
import { pdfPublisher } from "./publishers/pdfPublisher.js";
import { htmlPublisher } from "./publishers/htmlPublisher.js";
import { jsonApiPublisher } from "./publishers/jsonApiPublisher.js";

export function registerPublishers({ registry = publisherRegistry } = {}) {
  if (!registry || typeof registry.register !== "function") {
    throw new Error("Publisher Registration Engine requires a valid publisher registry.");
  }

  const publishers = [
    googleDocsPublisher,
    googleClassroomPublisher,
    pdfPublisher,
    htmlPublisher,
    jsonApiPublisher
  ];

  publishers.forEach((publisher) => {
    registry.register(publisher.publisherId, publisher);
  });

  return publishers;
}