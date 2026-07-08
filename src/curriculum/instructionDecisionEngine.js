/**
 * Geometry OS
 * Instruction Decision Engine v0.2.7
 *
 * Responsibility:
 * Convert an Instruction Sequence into instructional decisions.
 *
 * This engine does NOT generate questions.
 * This engine does NOT adapt to individual students yet.
 * This engine only creates pedagogical decisions for each instructional step.
 */

export const instructionDecisionEngine = {
  decide({ instructionSequence, dependencyAnalysis, knowledgeGraph } = {}) {
    if (!instructionSequence) {
      throw new Error("Instruction Decision Engine requires an instruction sequence.");
    }

    const steps = Array.isArray(instructionSequence.sequence)
  ? instructionSequence.sequence
  : Array.isArray(instructionSequence.steps)
    ? instructionSequence.steps
    : [];

    const decisions = steps.map((step, index) => {
      return this.createDecision({
        step,
        index,
        dependencyAnalysis,
        knowledgeGraph
      });
    });

    return {
      engine: "Instruction Decision Engine",
      version: "0.2.7",
      sourceSequenceId: instructionSequence.lessonId || instructionSequence.id || null,
      totalDecisions: decisions.length,
      decisions
    };
  },

  createDecision({ step, index, dependencyAnalysis, knowledgeGraph }) {
    const stepType = step.type || "instructional_step";
    const prerequisiteStatus = this.getPrerequisiteStatus(step, dependencyAnalysis);

    return {
      id: `decision-${index + 1}`,
      sequenceStepId: step.nodeId || step.id || `step-${index + 1}`,
stepTitle: step.label || step.title || `Instruction Step ${index + 1}`,
stepType,
instructionalAction: step.instructionalAction || "instructional_decision",
readinessStatus: step.readinessStatus || "unknown",

      teachExplicitly: this.shouldTeachExplicitly(stepType),
      reviewPrerequisite: prerequisiteStatus.needsReview,
      modelExample: this.shouldModelExample(stepType),
      guidedPractice: this.shouldUseGuidedPractice(stepType),
      independentPractice: this.shouldUseIndependentPractice(stepType),
      checkForUnderstanding: this.shouldCheckForUnderstanding(stepType),
      recoveryRecommendation: this.getRecoveryRecommendation(prerequisiteStatus),
      visualSupportRecommendation: this.getVisualSupportRecommendation(step, knowledgeGraph),

      rationale: this.createRationale({
        stepType,
        prerequisiteStatus
      })
    };
  },

  getPrerequisiteStatus(step, dependencyAnalysis) {
    const prerequisiteIds = Array.isArray(step.prerequisites)
      ? step.prerequisites
      : [];

    const missingPrerequisites = Array.isArray(dependencyAnalysis?.missingPrerequisites)
      ? dependencyAnalysis.missingPrerequisites
      : [];

    const matchedMissing = prerequisiteIds.filter((id) =>
      missingPrerequisites.includes(id)
    );

    return {
      totalPrerequisites: prerequisiteIds.length,
      missingPrerequisites: matchedMissing,
      needsReview: matchedMissing.length > 0
    };
  },

  shouldTeachExplicitly(stepType) {
    return [
      "new_concept",
      "definition",
      "core_instruction",
      "concept_development"
    ].includes(stepType);
  },

  shouldModelExample(stepType) {
    return [
      "new_concept",
      "core_instruction",
      "procedure",
      "example",
      "concept_development"
    ].includes(stepType);
  },

  shouldUseGuidedPractice(stepType) {
    return [
      "procedure",
      "example",
      "skill_development",
      "guided_application"
    ].includes(stepType);
  },

  shouldUseIndependentPractice(stepType) {
    return [
      "practice",
      "skill_development",
      "application",
      "independent_application"
    ].includes(stepType);
  },

  shouldCheckForUnderstanding(stepType) {
    return true;
  },

  getRecoveryRecommendation(prerequisiteStatus) {
    if (!prerequisiteStatus.needsReview) {
      return {
        recommended: false,
        reason: "No missing prerequisites detected."
      };
    }

    return {
      recommended: true,
      reason: "One or more prerequisites need review before this step.",
      prerequisiteTargets: prerequisiteStatus.missingPrerequisites
    };
  },

  getVisualSupportRecommendation(step, knowledgeGraph) {
    const keywords = [
      "point",
      "line",
      "plane",
      "ray",
      "segment",
      "angle",
      "diagram",
      "visual"
    ];

    const text = `${step.title || ""} ${step.description || ""}`.toLowerCase();

    const needsVisual = keywords.some((keyword) => text.includes(keyword));

    return {
      recommended: needsVisual,
      reason: needsVisual
        ? "Geometry concept benefits from visual representation."
        : "No required visual support detected for this step."
    };
  },

  createRationale({ stepType, prerequisiteStatus }) {
    if (prerequisiteStatus.needsReview) {
      return `Step type "${stepType}" requires prerequisite review before instruction.`;
    }

    return `Step type "${stepType}" is ready for instructional decision planning.`;
  }
};