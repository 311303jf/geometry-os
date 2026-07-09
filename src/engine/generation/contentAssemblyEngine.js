/**
 * Geometry OS
 * Content Assembly Engine v0.5.0
 *
 * Responsibility:
 * Assemble generated specialized content outputs into a single
 * Lesson Content Package.
 *
 * Important:
 * This engine does NOT generate new instructional content.
 * It does NOT write files.
 * It does NOT publish resources.
 * It only assembles execution outputs into a structured package.
 */

export class ContentAssemblyEngine {
  assemble(executionResult = {}) {
    this.validate(executionResult);

    const executionRecords = executionResult.executionRecords;

    return {
      packageId: this.createPackageId(executionResult),
      status: "content_package_assembled",
      contentAssembled: true,
      totalSections: executionRecords.length,
      sections: this.buildSections(executionRecords),
      metadata: {
        assemblyVersion: "v0.5.0",
        generatedCount: executionResult.generatedCount,
        totalExecutionRecords: executionResult.totalExecutionRecords,
        sourceStatus: executionResult.status,
        assembledAt: new Date().toISOString(),
        generatedBy: "ContentAssemblyEngine"
      }
    };
  }

  validate(executionResult) {
    if (!executionResult || typeof executionResult !== "object") {
      throw new Error("Content Assembly Engine requires an execution result object.");
    }

    if (!Array.isArray(executionResult.executionRecords)) {
      throw new Error("Content Assembly Engine requires executionResult.executionRecords array.");
    }

    if (executionResult.executionRecords.length === 0) {
      throw new Error("Content Assembly Engine requires at least one execution record.");
    }

    const invalidRecords = executionResult.executionRecords.filter((record) => {
      return (
        !record ||
        record.status !== "content_generated" ||
        record.contentGenerated !== true ||
        !record.output
      );
    });

    if (invalidRecords.length > 0) {
      throw new Error(
        "Content Assembly Engine cannot assemble incomplete execution records."
      );
    }
  }

  buildSections(executionRecords) {
    return executionRecords
      .slice()
      .sort((a, b) => a.order - b.order)
      .map((record) => {
        return {
          sectionId: this.createSectionId(record),
          order: record.order,
          assetType: record.assetType,
          generatorId: record.generatorId,
          executionId: record.executionId,
          contentGenerated: record.contentGenerated,
          content: record.output
        };
      });
  }

  createPackageId(executionResult) {
    const firstRecord = executionResult.executionRecords[0];
    const lessonId =
      firstRecord?.output?.lessonId ||
      firstRecord?.queueItem?.lessonId ||
      "unknown_lesson";

    return `lesson_content_package_${lessonId}`;
  }

  createSectionId(record) {
    return `section_${record.order}_${record.assetType}`;
  }
}

export const contentAssemblyEngine = new ContentAssemblyEngine();