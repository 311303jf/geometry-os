/**
 * Geometry OS
 * Teacher Playbook Composer v0.7.1
 *
 * Responsibility:
 * Compose a classroom-ready Teacher Playbook using real generation context.
 *
 * Important:
 * This composer does NOT publish.
 * It does NOT write files.
 * It only transforms lesson context into structured teacher-facing content.
 */

export class TeacherPlaybookComposer {
  compose(generationContext = {}) {
    if (!generationContext || typeof generationContext !== "object") {
      throw new Error("Teacher Playbook Composer requires a generation context object.");
    }

    const lesson = this.resolveLesson(generationContext);

    return {
      documentTitle: `Geometry Lesson ${lesson.lessonNumber} — ${lesson.lessonTitle}`,
      teacherFacing: true,
      lesson: {
        lessonId: lesson.lessonId,
        lessonNumber: lesson.lessonNumber,
        lessonTitle: lesson.lessonTitle,
        standardTag: lesson.standardTag,
        lessonPurpose: lesson.lessonPurpose
      },
      sections: [
        this.buildLessonOverview(lesson),
        this.buildLearningObjectives(lesson),
        this.buildEssentialVocabulary(lesson),
        this.buildPrerequisiteSkills(lesson),
        this.buildCommonMisconceptions(lesson),
        this.buildInstructionalFlow(lesson),
        this.buildTeacherMoves(lesson),
        this.buildChecksForUnderstanding(lesson),
        this.buildDifferentiationSupports(lesson),
        this.buildAssessmentGuidance(lesson),
        this.buildClosure(lesson)
      ],
      metadata: {
        composerVersion: "v0.7.1",
        generatedBy: "TeacherPlaybookComposer",
        generatedAt: new Date().toISOString()
      }
    };
  }

  resolveLesson(context = {}) {
    const lessonModel =
      context.lessonModel ||
      context.lesson ||
      context.curriculumLesson ||
      {};

    return {
      lessonId:
        lessonModel.lessonId ||
        lessonModel.id ||
        context.lessonId ||
        "Geometry-1.1",

      lessonNumber:
        lessonModel.lesson ||
        lessonModel.lessonNumber ||
        context.lessonNumber ||
        "1.1",

      lessonTitle:
        lessonModel.lessonTitle ||
        lessonModel.title ||
        context.lessonTitle ||
        "The Language of Geometry",

      standardTag:
        lessonModel.standardTag ||
        context.standardTag ||
        "Geometry",

      lessonPurpose:
        lessonModel.lessonPurpose ||
        context.lessonPurpose ||
        "Build foundational geometric language and notation.",

      objectives:
        Array.isArray(lessonModel.objectives)
          ? lessonModel.objectives
          : [],

      vocabulary:
        Array.isArray(lessonModel.vocabulary)
          ? lessonModel.vocabulary
          : [],

      requiredSkills:
        Array.isArray(lessonModel.requiredSkills)
          ? lessonModel.requiredSkills
          : [],

      misconceptions:
        Array.isArray(lessonModel.misconceptions)
          ? lessonModel.misconceptions
          : [],

      assessmentTargets:
        Array.isArray(lessonModel.assessmentTargets)
          ? lessonModel.assessmentTargets
          : []
    };
  }

  buildLessonOverview(lesson) {
    return {
      sectionId: "lesson_overview",
      title: "Lesson Overview",
      body: [
        `This lesson focuses on ${lesson.lessonTitle}.`,
        lesson.lessonPurpose,
        `Standard focus: ${lesson.standardTag}.`,
        "The goal is to help students connect diagrams, vocabulary, notation, and precise mathematical language."
      ]
    };
  }

  buildLearningObjectives(lesson) {
    const objectives = lesson.objectives.length
      ? lesson.objectives
      : [
          "Students will identify and describe basic geometric figures.",
          "Students will use correct geometric vocabulary and notation.",
          "Students will interpret diagrams using precise mathematical language."
        ];

    return {
      sectionId: "learning_objectives",
      title: "Learning Objectives",
      body: objectives
    };
  }

  buildEssentialVocabulary(lesson) {
    const vocabulary = lesson.vocabulary.length
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

  buildPrerequisiteSkills(lesson) {
    const requiredSkills = lesson.requiredSkills.length
      ? lesson.requiredSkills
      : [
          "Read and interpret simple diagrams.",
          "Use labels to identify parts of a figure.",
          "Follow multi-step visual directions."
        ];

    return {
      sectionId: "prerequisite_skills",
      title: "Prerequisite Skills",
      body: requiredSkills
    };
  }

  buildCommonMisconceptions(lesson) {
    const misconceptions = lesson.misconceptions.length
      ? lesson.misconceptions
      : [
          "Students may confuse a line, segment, and ray.",
          "Students may reverse ray notation.",
          "Students may ignore arrows or endpoints in diagrams.",
          "Students may use informal language instead of geometric notation."
        ];

    return {
      sectionId: "common_misconceptions",
      title: "Common Misconceptions",
      body: misconceptions
    };
  }

  buildInstructionalFlow(lesson) {
    return {
      sectionId: "instructional_flow",
      title: "Suggested Instructional Flow",
      body: [
        "1. Launch with a short visual warm-up connected to prior knowledge.",
        "2. Introduce the key vocabulary using diagrams.",
        "3. Model how to name and describe figures accurately.",
        "4. Use guided practice to check understanding after each new term.",
        "5. Move students into independent practice once they can explain the difference between similar figures.",
        "6. Close with an exit ticket aligned to the lesson objectives."
      ]
    };
  }

  buildTeacherMoves(lesson) {
    return {
      sectionId: "teacher_moves",
      title: "High-Impact Teacher Moves",
      body: [
        "Ask students to justify how they know what type of figure they are seeing.",
        "Point students back to visual evidence: arrows, endpoints, labels, and shared vertices.",
        "Require students to use complete mathematical language rather than informal descriptions.",
        "When students make an error, ask which symbol or label changed the meaning.",
        "Use quick compare-and-contrast questions between similar figures."
      ]
    };
  }

  buildChecksForUnderstanding(lesson) {
    const assessmentTargets = lesson.assessmentTargets.length
      ? lesson.assessmentTargets
      : [
          "Identify geometric figures from diagrams.",
          "Use correct notation.",
          "Distinguish between related geometric terms."
        ];

    return {
      sectionId: "checks_for_understanding",
      title: "Checks for Understanding",
      body: assessmentTargets.map(
        (target) => `Check whether students can: ${target}`
      )
    };
  }

  buildDifferentiationSupports(lesson) {
    return {
      sectionId: "differentiation_supports",
      title: "Differentiation Supports",
      body: [
        "For students who need support: reduce visual clutter and present one figure at a time.",
        "For English learners: pair each vocabulary term with a diagram and a short definition.",
        "For students with IEP accommodations: provide guided notes and allow extended processing time.",
        "For advanced students: ask them to create their own diagram and write multiple valid names for the figures shown."
      ]
    };
  }

  buildAssessmentGuidance(lesson) {
    return {
      sectionId: "assessment_guidance",
      title: "Assessment Guidance",
      body: [
        "Students are ready to move forward when they can identify figures, explain their reasoning, and use correct notation.",
        "Watch for students who answer correctly by guessing from the diagram but cannot explain why.",
        "Use the exit ticket to determine whether students need recovery on vocabulary, notation, or diagram interpretation."
      ]
    };
  }

  buildClosure(lesson) {
    return {
      sectionId: "closure",
      title: "Closure",
      body: [
        "Ask students to explain why precise language matters in Geometry.",
        "Closing message: In Geometry, small symbols change meaning. Arrows, endpoints, labels, and order help us communicate exactly what figure we mean."
      ]
    };
  }
}

export const teacherPlaybookComposer = new TeacherPlaybookComposer();