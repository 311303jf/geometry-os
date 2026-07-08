/**
 * Geometry OS
 * Knowledge Graph Engine v0.2.3
 *
 * Responsibility:
 * Build a dependency graph from an Instruction Plan.
 *
 * This engine does NOT generate questions.
 * It identifies instructional dependencies between objectives,
 * prerequisite skills, assessment targets, and recovery needs.
 */

export class KnowledgeGraphEngine {
  buildGraph(instructionPlan) {
    this.validate(instructionPlan);

    return {
      lessonId: instructionPlan.lessonId,
      nodes: this.buildNodes(instructionPlan),
      edges: this.buildEdges(instructionPlan),
      metadata: {
        graphVersion: "v0.2.3",
        generatedBy: "KnowledgeGraphEngine",
        generatedAt: new Date().toISOString()
      }
    };
  }

  validate(plan) {
    if (!plan) {
      throw new Error("Knowledge Graph Engine requires an Instruction Plan.");
    }

    if (!plan.lessonId) {
      throw new Error("Instruction Plan is missing lessonId.");
    }
  }

  buildNodes(plan) {
    const nodes = [];

    plan.prerequisiteValidation.forEach((item, index) => {
      nodes.push({
        id: `prerequisite-${index + 1}`,
        type: "prerequisite_skill",
        label: item.skill,
        status: item.verified ? "verified" : "unverified"
      });
    });

    plan.instructionalSequence.forEach((item, index) => {
      nodes.push({
        id: `objective-${index + 1}`,
        type: "lesson_objective",
        label: item.objective,
        status: item.instructionStatus
      });
    });

    plan.assessmentFlow.forEach((item, index) => {
      nodes.push({
        id: `assessment-${index + 1}`,
        type: "assessment_target",
        label: item.target.description || item.target.skillTag || "Assessment Target",
        status: item.assessed ? "assessed" : "unassessed"
      });
    });

    plan.recoveryTriggers.forEach((item, index) => {
      nodes.push({
        id: `recovery-${index + 1}`,
        type: "recovery_trigger",
        label: item.misconception.description || "Recovery Trigger",
        status: item.recoveryReady ? "ready" : "not_ready"
      });
    });

    return nodes;
  }

  buildEdges(plan) {
    const edges = [];

    plan.prerequisiteValidation.forEach((item, index) => {
      edges.push({
        from: `prerequisite-${index + 1}`,
        to: "objective-1",
        relationship: "supports"
      });
    });

    plan.instructionalSequence.forEach((item, index) => {
      if (index < plan.instructionalSequence.length - 1) {
        edges.push({
          from: `objective-${index + 1}`,
          to: `objective-${index + 2}`,
          relationship: "precedes"
        });
      }
    });

    plan.assessmentFlow.forEach((item, index) => {
      edges.push({
        from: `objective-${Math.min(index + 1, plan.instructionalSequence.length)}`,
        to: `assessment-${index + 1}`,
        relationship: "assessed_by"
      });
    });

    plan.recoveryTriggers.forEach((item, index) => {
      edges.push({
        from: `assessment-${Math.min(index + 1, plan.assessmentFlow.length)}`,
        to: `recovery-${index + 1}`,
        relationship: "triggers"
      });
    });

    return edges;
  }
}

export const knowledgeGraphEngine = new KnowledgeGraphEngine();