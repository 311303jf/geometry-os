/**
 * Geometry OS
 * Final Question Export Contract v0.9.4
 *
 * Responsibility:
 * Convert a final question resource into a stable export contract.
 *
 * Important:
 * This engine does NOT generate questions.
 * It does NOT validate question quality.
 * It does NOT publish resources.
 * It only prepares final question data for future export.
 */

export class FinalQuestionExportContract {
  buildContract({
    finalResource,
    exportTarget = "generic_export"
  } = {}) {
    if (!finalResource) {
      throw new Error("Final Question Export Contract requires finalResource.");
    }

    const finalQuestionsSection = finalResource.sections?.find(
      (section) => section.sectionId === "final_questions"
    );

    const finalQuestions = finalQuestionsSection?.content || [];

    return {
      contractId: this.createContractId(finalResource, exportTarget),
      contractVersion: "v0.9.4",
      exportTarget,
      assetType: finalResource.assetType,
      lessonId: finalResource.lessonId,
      lessonTitle: finalResource.lessonTitle,
      questionCount: finalQuestions.length,
      sections: this.buildSections(finalResource),
      questions: finalQuestions.map((question) =>
        this.buildQuestionContract(question)
      ),
      metadata: {
        generatedBy: "FinalQuestionExportContract",
        sourceBuilder: finalResource.builderId,
        sourceBuilderVersion: finalResource.builderVersion,
        qualityGateApplied: finalResource.metadata?.qualityGateApplied === true,
        pipelinePass: finalResource.metadata?.pass === true,
        readyForExport: finalQuestions.length > 0
      }
    };
  }

  buildSections(finalResource) {
    return (finalResource.sections || []).map((section) => ({
      sectionId: section.sectionId,
      title: section.title,
      itemCount: Array.isArray(section.content) ? section.content.length : 0
    }));
  }

  buildQuestionContract(question) {
    return {
      questionId: question.questionId,
      itemNumber: question.itemNumber,
      blueprintId: question.blueprintId,
      prompt: question.prompt,
      answerFormat: question.answerFormat,
      choices: question.choices.map((choice) => ({
        label: choice.label,
        text: choice.text
      })),
      answerKey: {
        correctChoice: question.correctChoice,
        correctAnswer: question.correctAnswer
      },
      explanation: question.explanation,
      metadata: {
        skill: question.metadata?.skill,
        problemType: question.metadata?.problemType,
        dokLevel: question.metadata?.dokLevel,
        difficulty: question.metadata?.difficulty,
        assessmentTarget: question.metadata?.assessmentTarget,
        misconceptionFocus: question.metadata?.misconceptionFocus,
        sourceBlueprintId: question.metadata?.sourceBlueprintId
      }
    };
  }

  createContractId(finalResource, exportTarget) {
    return `${finalResource.lessonId}_${finalResource.assetType}_${exportTarget}_contract`;
  }
}

export const finalQuestionExportContract =
  new FinalQuestionExportContract();