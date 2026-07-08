/**
 * Geometry OS
 * Knowledge Dependency Engine v0.2.4
 *
 * Responsibility:
 * Analyze a Knowledge Graph and identify instructional dependencies.
 *
 * This engine does NOT generate questions.
 * It does NOT modify the graph.
 * It reads nodes and edges and produces a dependency map.
 */

export class KnowledgeDependencyEngine {
  analyzeDependencies(knowledgeGraph) {
    this.validate(knowledgeGraph);

    return {
      lessonId: knowledgeGraph.lessonId,
      dependencyMap: this.buildDependencyMap(knowledgeGraph),
      instructionalOrder: this.buildInstructionalOrder(knowledgeGraph),
      metadata: {
        dependencyVersion: "v0.2.4",
        generatedBy: "KnowledgeDependencyEngine",
        generatedAt: new Date().toISOString()
      }
    };
  }

  validate(graph) {
    if (!graph) {
      throw new Error("Knowledge Dependency Engine requires a Knowledge Graph.");
    }

    if (!graph.lessonId) {
      throw new Error("Knowledge Graph is missing lessonId.");
    }

    if (!Array.isArray(graph.nodes)) {
      throw new Error("Knowledge Graph is missing nodes array.");
    }

    if (!Array.isArray(graph.edges)) {
      throw new Error("Knowledge Graph is missing edges array.");
    }
  }

  buildDependencyMap(graph) {
    return graph.nodes.map((node) => {
      const incomingEdges = graph.edges.filter((edge) => edge.to === node.id);
      const outgoingEdges = graph.edges.filter((edge) => edge.from === node.id);

      return {
        nodeId: node.id,
        type: node.type,
        label: node.label,
        dependsOn: incomingEdges.map((edge) => edge.from),
        supports: outgoingEdges.map((edge) => edge.to),
        dependencyCount: incomingEdges.length,
        supportCount: outgoingEdges.length
      };
    });
  }

  buildInstructionalOrder(graph) {
    const prerequisiteNodes = graph.nodes.filter(
      (node) => node.type === "prerequisite_skill"
    );

    const objectiveNodes = graph.nodes.filter(
      (node) => node.type === "lesson_objective"
    );

    const assessmentNodes = graph.nodes.filter(
      (node) => node.type === "assessment_target"
    );

    const recoveryNodes = graph.nodes.filter(
      (node) => node.type === "recovery_trigger"
    );

    return [
      ...prerequisiteNodes.map((node) => node.id),
      ...objectiveNodes.map((node) => node.id),
      ...assessmentNodes.map((node) => node.id),
      ...recoveryNodes.map((node) => node.id)
    ];
  }
}

export const knowledgeDependencyEngine = new KnowledgeDependencyEngine();