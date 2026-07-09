/**
 * Geometry OS
 * Final Quiz Resource Builder v0.9.3
 *
 * Responsibility:
 * Build a final Quiz resource by combining:
 *
 * Quiz Composer
 *      ↓
 * Question Blueprints
 *      ↓
 * Final Question Builder
 *      ↓
 * Final Quiz Resource
 *
 * Important:
 * This builder does NOT bypass the composer.
 * It does NOT bypass the Question Factory.
 * It does NOT bypass the Question Quality Gate.
 */

import { quizGenerator } from "../generators/quizGenerator.js";
import { finalQuestionBuilder } from "./finalQuestionBuilder.js";

export class FinalQuizResourceBuilder {
  build({
    lessonModel,
    generationContext = {},
    resourceType = "quiz",
    count = 20
  } = {}) {
    if (!lessonModel) {
      throw new Error("Final Quiz Resource Builder requires a lessonModel.");
    }

    const quizResource = quizGenerator.generate({
      lessonModel,
      generationContext,
      resourceType,
      count
    });

    const questionBlueprintSection = quizResource.sections.find(
      (section) => section.sectionId === "question_blueprints"
    );

    const questionBlueprints = questionBlueprintSection?.content || [];

    const finalQuestionResult = finalQuestionBuilder.build({
      lessonModel,
      questionBlueprints,
      resourceType
    });

    return {
      builderId: "final_quiz_resource_builder",
      builderVersion: "v0.9.3",
      assetType: "quiz",
      lessonId: quizResource.lessonId,
      lessonTitle: quizResource.lessonTitle,
      sections: [
        ...quizResource.sections,
        this.buildFinalQuestionsSection(finalQuestionResult.questions)
      ],
      metadata: {
        generatedBy: "FinalQuizResourceBuilder",
        sourceComposer: quizResource.composerId,
        sourceComposerVersion: quizResource.composerVersion,
        sourceGenerator: quizResource.generatorId,
        sourceGeneratorVersion: quizResource.generatorVersion,
        finalQuestionBuilderVersion: finalQuestionResult.builderVersion,
        factoryVersion: finalQuestionResult.metadata.factoryVersion,
        qualityGateVersion: finalQuestionResult.metadata.qualityGateVersion,
        blueprintCount: questionBlueprints.length,
        finalQuestionCount: finalQuestionResult.questions.length,
        qualityGateApplied: true,
        pass: finalQuestionResult.metadata.pass
      }
    };
  }

  buildFinalQuestionsSection(questions = []) {
    return {
      sectionId: "final_questions",
      title: "Final Questions",
      content: questions
    };
  }
}

export const finalQuizResourceBuilder = new FinalQuizResourceBuilder();