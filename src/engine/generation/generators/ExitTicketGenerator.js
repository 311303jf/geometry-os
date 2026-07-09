/**
 * Geometry OS
 * Exit Ticket Generator v0.7.9
 *
 * Responsibility:
 * Generate an Exit Ticket resource using the
 * blueprint-driven Exit Ticket Composer.
 *
 * Important:
 * This generator does NOT generate final questions yet.
 * It does NOT generate answer choices yet.
 */

import { exitTicketComposer } from "../composers/exitTicketComposer.js";

export class ExitTicketGenerator {
  generate({
    lessonModel,
    generationContext = {},
    resourceType = "exit_ticket",
    count = 5
  } = {}) {
    const composedResource = exitTicketComposer.compose({
      lessonModel,
      generationContext,
      resourceType,
      count
    });

    return {
      generatorId: "exit_ticket_generator",
      generatorVersion: "v0.7.9",
      assetType: "exit_ticket",
      lessonId: composedResource.lessonId,
      lessonTitle: composedResource.lessonTitle,
      sections: composedResource.sections,
      metadata: {
        ...composedResource.metadata,
        composerId: composedResource.composerId,
        composerVersion: composedResource.composerVersion
      }
    };
  }
}

export const exitTicketGenerator = new ExitTicketGenerator();