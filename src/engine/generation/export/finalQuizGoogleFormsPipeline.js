/**
 * Geometry OS
 * Final Quiz Google Forms Pipeline v0.9.6
 *
 * Responsibility:
 * Build the complete Google Forms-ready payload for a final Quiz resource.
 *
 * Pipeline:
 * Final Quiz Resource Builder
 *      ↓
 * Final Question Export Contract
 *      ↓
 * Google Forms Export Adapter
 *
 * Important:
 * This pipeline does NOT publish to Google Forms.
 * It does NOT call Google APIs.
 * It does NOT generate questions directly.
 * It only orchestrates certified builders and adapters.
 */

import { finalQuizResourceBuilder } from "../questions/finalQuizResourceBuilder.js";
import { finalQuestionExportContract } from "../questions/finalQuestionExportContract.js";
import { googleFormsExportAdapter } from "./googleFormsExportAdapter.js";

export class FinalQuizGoogleFormsPipeline {
  build({
    lessonModel,
    generationContext = {},
    resourceType = "quiz",
    count = 20
  } = {}) {
    if (!lessonModel) {
      throw new Error("Final Quiz Google Forms Pipeline requires a lessonModel.");
    }

    const finalResource = finalQuizResourceBuilder.build({
      lessonModel,
      generationContext,
      resourceType,
      count
    });

    const exportContract = finalQuestionExportContract.buildContract({
      finalResource,
      exportTarget: "google_forms"
    });

    const googleFormsPayload = googleFormsExportAdapter.adapt({
      exportContract
    });

    return {
      pipelineId: "final_quiz_google_forms_pipeline",
      pipelineVersion: "v0.9.6",
      lessonId: lessonModel.id,
      lessonTitle: lessonModel.lessonTitle,
      resourceType,
      exportTarget: "google_forms",
      finalResource,
      exportContract,
      googleFormsPayload,
      metadata: {
        generatedBy: "FinalQuizGoogleFormsPipeline",
        finalQuizResourceBuilderVersion: finalResource.builderVersion,
        exportContractVersion: exportContract.contractVersion,
        googleFormsExportAdapterVersion: googleFormsPayload.adapterVersion,
        finalQuestionCount: finalResource.metadata.finalQuestionCount,
        contractQuestionCount: exportContract.questionCount,
        payloadItemCount: googleFormsPayload.form.items.length,
        answerKeyCount: googleFormsPayload.answerKey.length,
        callsGoogleApi: false,
        publishesResource: false,
        readyForPublishing: googleFormsPayload.metadata.readyForPublishing
      }
    };
  }
}

export const finalQuizGoogleFormsPipeline =
  new FinalQuizGoogleFormsPipeline();