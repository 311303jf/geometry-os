/**
 * Geometry OS
 * Final Question Builder v0.9.2
 *
 * Responsibility:
 * Build final classroom-ready questions by running:
 *
 * Question Blueprint
 *      ↓
 * Question Factory
 *      ↓
 * Question Quality Gate
 *      ↓
 * Final Question
 *
 * Important:
 * This builder does NOT replace composers.
 * It does NOT modify blueprints.
 * It does NOT bypass the Question Factory.
 * It does NOT bypass the Question Quality Gate.
 */

import { questionFactory } from "./questionFactory.js";
import { questionQualityGate } from "./questionQualityGate.js";

export class FinalQuestionBuilder {
  build({
    lessonModel,
    questionBlueprints = [],
    resourceType = "unknown_resource"
  } = {}) {
    if (!lessonModel) {
      throw new Error("Final Question Builder requires a lessonModel.");
    }

    if (!Array.isArray(questionBlueprints)) {
      throw new Error("Final Question Builder requires questionBlueprints array.");
    }

    const factoryResult = questionFactory.buildQuestions({
      lessonModel,
      questionBlueprints,
      resourceType
    });

    const qualityGateResult = questionQualityGate.validate({
      lessonModel,
      resourceType,
      questions: factoryResult.questions
    });

    return {
      builderId: "final_question_builder",
      builderVersion: "v0.9.2",
      lessonId: lessonModel.id,
      lessonTitle: lessonModel.lessonTitle,
      resourceType,
      questions: qualityGateResult.pass ? factoryResult.questions : [],
      factoryResult,
      qualityGateResult,
      metadata: {
        generatedBy: "FinalQuestionBuilder",
        architecture:
          "Question Blueprint -> Question Factory -> Question Quality Gate -> Final Question",
        blueprintCount: questionBlueprints.length,
        questionCount: factoryResult.questions.length,
        finalQuestionCount: qualityGateResult.pass
          ? factoryResult.questions.length
          : 0,
        factoryVersion: factoryResult.factoryVersion,
        qualityGateVersion: qualityGateResult.gateVersion,
        qualityGateApplied: true,
        pass: qualityGateResult.pass
      }
    };
  }
}

export const finalQuestionBuilder = new FinalQuestionBuilder();