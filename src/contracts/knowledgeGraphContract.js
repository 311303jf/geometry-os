/**
 * Geometry OS
 * Knowledge Graph Contract v0.2.5
 *
 * Responsibility:
 * Validate the output shape produced by KnowledgeGraphEngine.
 *
 * This contract does NOT build graphs.
 * It only validates structure.
 */

export class KnowledgeGraphContract {
  validate(knowledgeGraph) {
    if (!knowledgeGraph) {
      throw new Error("KnowledgeGraphContract requires a Knowledge Graph.");
    }

    if (!knowledgeGraph.lessonId) {
      throw new Error("Knowledge Graph Contract failed: missing lessonId.");
    }

    if (!Array.isArray(knowledgeGraph.nodes)) {
      throw new Error("Knowledge Graph Contract failed: nodes must be an array.");
    }

    if (!Array.isArray(knowledgeGraph.edges)) {
      throw new Error("Knowledge Graph Contract failed: edges must be an array.");
    }

    if (!knowledgeGraph.metadata) {
      throw new Error("Knowledge Graph Contract failed: missing metadata.");
    }

    knowledgeGraph.nodes.forEach((node, index) => {
      this.validateNode(node, index);
    });

    knowledgeGraph.edges.forEach((edge, index) => {
      this.validateEdge(edge, index);
    });

    return true;
  }

  validateNode(node, index) {
    if (!node.id) {
      throw new Error(`Knowledge Graph node ${index + 1} is missing id.`);
    }

    if (!node.type) {
      throw new Error(`Knowledge Graph node ${index + 1} is missing type.`);
    }

    if (!node.label) {
      throw new Error(`Knowledge Graph node ${index + 1} is missing label.`);
    }

    if (!node.status) {
      throw new Error(`Knowledge Graph node ${index + 1} is missing status.`);
    }
  }

  validateEdge(edge, index) {
    if (!edge.from) {
      throw new Error(`Knowledge Graph edge ${index + 1} is missing from.`);
    }

    if (!edge.to) {
      throw new Error(`Knowledge Graph edge ${index + 1} is missing to.`);
    }

    if (!edge.relationship) {
      throw new Error(
        `Knowledge Graph edge ${index + 1} is missing relationship.`
      );
    }
  }
}

export const knowledgeGraphContract = new KnowledgeGraphContract();