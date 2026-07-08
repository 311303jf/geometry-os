/**
 * Geometry OS
 * Instruction Sequencing Engine v0.2.6
 *
 * Responsibility:
 * Convert Dependency Analysis into a teachable instructional sequence.
 *
 * This engine does NOT generate questions.
 * It does NOT assess students.
 * It does NOT publish assignments.
 */

export class InstructionSequencingEngine {
  buildSequence(dependencyAnalysis) {
    this.validate(dependencyAnalysis);

    const sequence = dependencyAnalysis.instructionalOrder.map((nodeId, index) => {
      const dependencyItem = dependencyAnalysis.dependencyMap.find(
        (item) => item.nodeId === nodeId
      );

      return {
        step: index + 1,
        nodeId,
        type: dependencyItem?.type || "unknown",
        label: dependencyItem?.label || "Unknown instructional item",
        dependsOn: dependencyItem?.dependsOn || [],
        supports: dependencyItem?.supports || [],
        instructionalAction: this.determineInstructionalAction(dependencyItem),
        readinessStatus: this.determineReadinessStatus(dependencyItem)
      };
    });

    return {
      lessonId: dependencyAnalysis.lessonId,
      sequence,
      metadata: {
        sequenceVersion: "v0.2.6",
        generatedBy: "InstructionSequencingEngine",
        generatedAt: new Date().toISOString()
      }
    };
  }

  validate(dependencyAnalysis) {
    if (!dependencyAnalysis) {
      throw new Error(
        "Instruction Sequencing Engine requires Dependency Analysis."
      );
    }

    if (!dependencyAnalysis.lessonId) {
      throw new Error("Dependency Analysis is missing lessonId.");
    }

    if (!Array.isArray(dependencyAnalysis.dependencyMap)) {
      throw new Error("Dependency Analysis is missing dependencyMap array.");
    }

    if (!Array.isArray(dependencyAnalysis.instructionalOrder)) {
      throw new Error("Dependency Analysis is missing instructionalOrder array.");
    }
  }

  determineInstructionalAction(item) {
    if (!item) {
      return "review_before_instruction";
    }

    if (item.type === "prerequisite_skill") {
      return "verify_or_review";
    }

    if (item.type === "lesson_objective") {
      return "teach_explicitly";
    }

    if (item.type === "assessment_target") {
      return "check_for_understanding";
    }

    if (item.type === "recovery_trigger") {
      return "prepare_recovery_support";
    }

    return "review_before_instruction";
  }

  determineReadinessStatus(item) {
    if (!item) {
      return "unknown";
    }

    if (item.dependencyCount === 0) {
      return "ready";
    }

    return "depends_on_prior_steps";
  }
}

export const instructionSequencingEngine =
  new InstructionSequencingEngine();