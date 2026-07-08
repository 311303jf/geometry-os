/**
 * Geometry OS
 * Dependency Analysis Contract v0.2.5
 *
 * Responsibility:
 * Validate the output shape produced by KnowledgeDependencyEngine.
 *
 * This contract does NOT analyze dependencies.
 * It only validates structure.
 */

export class DependencyAnalysisContract {
  validate(dependencyAnalysis) {
    if (!dependencyAnalysis) {
      throw new Error(
        "DependencyAnalysisContract requires a Dependency Analysis."
      );
    }

    if (!dependencyAnalysis.lessonId) {
      throw new Error("Dependency Analysis Contract failed: missing lessonId.");
    }

    if (!Array.isArray(dependencyAnalysis.dependencyMap)) {
      throw new Error(
        "Dependency Analysis Contract failed: dependencyMap must be an array."
      );
    }

    if (!Array.isArray(dependencyAnalysis.instructionalOrder)) {
      throw new Error(
        "Dependency Analysis Contract failed: instructionalOrder must be an array."
      );
    }

    if (!dependencyAnalysis.metadata) {
      throw new Error("Dependency Analysis Contract failed: missing metadata.");
    }

    dependencyAnalysis.dependencyMap.forEach((item, index) => {
      this.validateDependencyItem(item, index);
    });

    return true;
  }

  validateDependencyItem(item, index) {
    if (!item.nodeId) {
      throw new Error(`Dependency item ${index + 1} is missing nodeId.`);
    }

    if (!item.type) {
      throw new Error(`Dependency item ${index + 1} is missing type.`);
    }

    if (!item.label) {
      throw new Error(`Dependency item ${index + 1} is missing label.`);
    }

    if (!Array.isArray(item.dependsOn)) {
      throw new Error(`Dependency item ${index + 1} dependsOn must be an array.`);
    }

    if (!Array.isArray(item.supports)) {
      throw new Error(`Dependency item ${index + 1} supports must be an array.`);
    }

    if (typeof item.dependencyCount !== "number") {
      throw new Error(
        `Dependency item ${index + 1} dependencyCount must be a number.`
      );
    }

    if (typeof item.supportCount !== "number") {
      throw new Error(
        `Dependency item ${index + 1} supportCount must be a number.`
      );
    }
  }
}

export const dependencyAnalysisContract = new DependencyAnalysisContract();