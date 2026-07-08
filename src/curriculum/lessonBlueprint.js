export function createLessonBlueprint(rawLesson) {
  return {
    id: `${rawLesson.course}-${rawLesson.lesson}`,
    course: rawLesson.course,
    unit: rawLesson.unit,
    unitTitle: rawLesson.unitTitle,
    lesson: rawLesson.lesson,
    lessonTitle: rawLesson.lessonTitle,
    standardTag: rawLesson.standardTag,
    lessonPurpose: rawLesson.lessonPurpose,
    objectives: rawLesson.objectives || [],
    vocabulary: rawLesson.vocabulary || [],
    requiredSkills: rawLesson.requiredSkills || [],
    misconceptions: rawLesson.misconceptions || [],
    assessmentTargets: rawLesson.assessmentTargets || [],
    resourceTypes: rawLesson.resourceTypes || [],
    certificationRequirements: rawLesson.certificationRequirements || {},
    blueprintStatus: "ready"
  };
}