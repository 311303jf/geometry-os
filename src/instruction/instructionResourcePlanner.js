/**
 * Geometry OS
 * Instruction Resource Planner v0.2.8
 *
 * Responsibility:
 * Convert Instruction Decisions into a Resource Plan.
 *
 * This engine does NOT generate resources.
 * This engine does NOT generate questions.
 * This engine does NOT adapt to students yet.
 *
 * It only determines what instructional resources are needed.
 */

export class InstructionResourcePlanner {
  buildResourcePlan(instructionDecisions) {
    this.validate(instructionDecisions);

    const resources = instructionDecisions.decisions.flatMap((decision, index) =>
      this.planResourcesForDecision(decision, index)
    );

    return {
      lessonId: instructionDecisions.sourceSequenceId,
      resourcePlanVersion: "v0.2.8",
      generatedBy: "InstructionResourcePlanner",
      totalResources: resources.length,
      resources,
      metadata: {
        generatedAt: new Date().toISOString()
      }
    };
  }

  validate(instructionDecisions) {
    if (!instructionDecisions) {
      throw new Error(
        "Instruction Resource Planner requires Instruction Decisions."
      );
    }

    if (!Array.isArray(instructionDecisions.decisions)) {
      throw new Error(
        "Instruction Decisions must include a decisions array."
      );
    }
  }

  planResourcesForDecision(decision, index) {
    const resources = [];

    if (decision.teachExplicitly) {
      resources.push(
        this.createResource({
          decision,
          index,
          type: "teacher_mini_lesson",
          purpose: "Support explicit instruction for this step."
        })
      );
    }

    if (decision.reviewPrerequisite) {
      resources.push(
        this.createResource({
          decision,
          index,
          type: "prerequisite_review",
          purpose: "Review required prior knowledge before instruction."
        })
      );
    }

    if (decision.modelExample) {
      resources.push(
        this.createResource({
          decision,
          index,
          type: "worked_example",
          purpose: "Model how to approach this instructional step."
        })
      );
    }

    if (decision.guidedPractice) {
      resources.push(
        this.createResource({
          decision,
          index,
          type: "guided_practice",
          purpose: "Provide structured practice with teacher support."
        })
      );
    }

    if (decision.independentPractice) {
      resources.push(
        this.createResource({
          decision,
          index,
          type: "independent_practice",
          purpose: "Provide student practice without direct teacher support."
        })
      );
    }

    if (decision.checkForUnderstanding) {
      resources.push(
        this.createResource({
          decision,
          index,
          type: "check_for_understanding",
          purpose: "Verify whether students understand this step."
        })
      );
    }

    if (decision.recoveryRecommendation?.recommended) {
      resources.push(
        this.createResource({
          decision,
          index,
          type: "recovery_resource",
          purpose: "Support students who are not ready for this step."
        })
      );
    }

    if (decision.visualSupportRecommendation?.recommended) {
      resources.push(
        this.createResource({
          decision,
          index,
          type: "visual_support",
          purpose: "Provide visual representation for a geometry concept."
        })
      );
    }

    if (resources.length === 0) {
      resources.push(
        this.createResource({
          decision,
          index,
          type: "teacher_note",
          purpose: "Document instructional awareness for this step."
        })
      );
    }

    return resources;
  }

  createResource({ decision, index, type, purpose }) {
    return {
      id: `resource-${index + 1}-${type}`,
      decisionId: decision.id,
      sequenceStepId: decision.sequenceStepId,
      stepTitle: decision.stepTitle,
      resourceType: type,
      purpose,
      status: "planned"
    };
  }
}

export const instructionResourcePlanner =
  new InstructionResourcePlanner();