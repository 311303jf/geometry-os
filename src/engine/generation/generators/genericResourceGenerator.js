/**
 * Geometry OS
 * Generic Resource Generator v0.3.7
 *
 * Responsibility:
 * Generate a basic instructional resource draft from a generation task.
 *
 * Important:
 * This generator belongs to the Content Generation Layer.
 * It does NOT publish.
 * It does NOT write files.
 * It does NOT grade.
 */

export class GenericResourceGenerator {
  generate({ generationTask = {}, generationContext = {} } = {}) {
    if (!generationTask || typeof generationTask !== "object") {
      throw new Error("Generic Resource Generator requires a generation task.");
    }

    return {
      generatorId: "GenericResourceGenerator",
      contentGenerated: true,
      assetType: generationTask.assetType || "unknown_asset",
      lessonId: generationContext.lessonModel?.id || null,
      lessonTitle: generationContext.lessonModel?.lessonTitle || null,
      resource: {
        title: this.buildTitle(generationTask, generationContext),
        sections: [
          {
            heading: "Learning Focus",
            body: this.buildLearningFocus(generationContext)
          },
          {
            heading: "Instructional Purpose",
            body: "This draft resource is generated from the certified Geometry OS instructional pipeline."
          },
          {
            heading: "Generation Notes",
            body: "This is an early generic resource draft. Specialized generators will replace this output in future sprints."
          }
        ]
      },
      metadata: {
        generatorVersion: "v0.3.7",
        generatedBy: "GenericResourceGenerator",
        generatedAt: new Date().toISOString()
      }
    };
  }

  buildTitle(generationTask, generationContext) {
    const assetType = generationTask.assetType || "Generic Resource";
    const lessonTitle = generationContext.lessonModel?.lessonTitle || "Geometry Lesson";

    return `${lessonTitle} — ${assetType}`;
  }

  buildLearningFocus(generationContext) {
    const lessonModel = generationContext.lessonModel || {};

    if (lessonModel.lessonPurpose) {
      return lessonModel.lessonPurpose;
    }

    if (Array.isArray(lessonModel.objectives) && lessonModel.objectives.length > 0) {
      return lessonModel.objectives.join(" ");
    }

    return "Support student understanding of the lesson objectives.";
  }
}

export const genericResourceGenerator = new GenericResourceGenerator();