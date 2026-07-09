/**
 * Geometry OS
 * Vocabulary Builder v0.7.2
 */

export class VocabularyBuilder {
  build(lesson = {}) {
    const vocabulary = Array.isArray(lesson.vocabulary) && lesson.vocabulary.length
      ? lesson.vocabulary
      : [
          "Point",
          "Line",
          "Plane",
          "Segment",
          "Ray",
          "Angle",
          "Endpoint",
          "Vertex"
        ];

    return {
      sectionId: "essential_vocabulary",
      title: "Essential Vocabulary",
      body: vocabulary.map((term) => `${term}`)
    };
  }
}

export const vocabularyBuilder = new VocabularyBuilder();