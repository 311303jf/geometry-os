/**
 * Geometry OS
 * Teacher Playbook Generator v0.7.0
 *
 * Responsibility:
 * Generate a real classroom-ready Teacher Playbook.
 *
 * Important:
 * This generator does NOT publish.
 * It does NOT write files.
 * It only returns structured instructional content.
 */

export class TeacherPlaybookGenerator {
  constructor() {
    this.generatorId = "teacher_playbook_generator";
    this.generatorName = "Teacher Playbook Generator";
    this.generatorVersion = "v0.7.0";
    this.assetType = "teacher_playbook";
  }

  generate(input = {}) {
    const lesson = this.resolveLesson(input);

    return {
      status: "content_generated",
      generatorId: this.generatorId,
      generatorName: this.generatorName,
      generatorVersion: this.generatorVersion,
      assetType: this.assetType,
      title: `Teacher Playbook — ${lesson.lessonTitle}`,
      lessonId: lesson.lessonId,
      lessonTitle: lesson.lessonTitle,
      content: {
        documentTitle: `Geometry Lesson ${lesson.lessonNumber} — ${lesson.lessonTitle}`,
        teacherFacing: true,
        sections: this.buildSections(lesson)
      },
      metadata: {
        generatedBy: this.generatorName,
        generatedAt: new Date().toISOString(),
        contentVersion: "v0.7.0-real-content"
      }
    };
  }

  execute(input = {}) {
    return this.generate(input);
  }

  buildSections(lesson) {
    return [
      {
        sectionId: "lesson_overview",
        title: "Lesson Overview",
        body: [
          `This lesson introduces students to the foundational language of Geometry. Students will learn how to identify and describe basic geometric figures using precise mathematical vocabulary.`,
          `The purpose of this lesson is to help students build confidence with points, lines, planes, rays, segments, and angles before they are asked to reason formally with diagrams and proofs.`
        ]
      },
      {
        sectionId: "learning_objectives",
        title: "Learning Objectives",
        body: [
          "Students will identify and name points, lines, planes, segments, rays, and angles.",
          "Students will use correct geometric notation to describe figures.",
          "Students will distinguish between undefined terms and defined geometric terms.",
          "Students will interpret simple diagrams using mathematical language."
        ]
      },
      {
        sectionId: "teacher_background",
        title: "Teacher Background Notes",
        body: [
          "This lesson is vocabulary-heavy, but it should not be taught as memorization only. Students need repeated opportunities to connect terms, symbols, diagrams, and verbal descriptions.",
          "The most important teacher move is to constantly ask: What do you see? How do you know? What is the correct notation?",
          "Students may think a line segment and a line are the same because both are drawn with straight marks. Emphasize endpoints, arrows, and naming conventions."
        ]
      },
      {
        sectionId: "vocabulary",
        title: "Essential Vocabulary",
        body: [
          "Point: an exact location in space.",
          "Line: a straight path that extends forever in both directions.",
          "Plane: a flat surface that extends forever in all directions.",
          "Segment: part of a line with two endpoints.",
          "Ray: part of a line with one endpoint that extends forever in one direction.",
          "Angle: a figure formed by two rays with a common endpoint.",
          "Endpoint: a point at the end of a segment or ray.",
          "Vertex: the common endpoint of the rays that form an angle."
        ]
      },
      {
        sectionId: "common_misconceptions",
        title: "Common Misconceptions",
        body: [
          "Students may name a line segment as a line. Redirect them to look for arrows or endpoints.",
          "Students may believe a plane is the same as a shape drawn on paper. Emphasize that a plane extends forever.",
          "Students may reverse ray notation. Remind them that the endpoint must be named first.",
          "Students may name an angle using only one point when multiple angles share the same vertex. In that case, three-letter angle notation is required."
        ]
      },
      {
        sectionId: "lesson_flow",
        title: "Suggested Lesson Flow",
        body: [
          "1. Bell Ringer: Review prior vocabulary or spatial reasoning without previewing the new skill too directly.",
          "2. Vocabulary Launch: Introduce point, line, and plane as undefined terms.",
          "3. Diagram Discussion: Show simple diagrams and ask students to identify what they see.",
          "4. Notation Practice: Model how to name lines, segments, rays, and angles.",
          "5. Guided Practice: Students classify figures and explain their reasoning.",
          "6. Independent Practice: Students answer multiple-choice questions aligned to the lesson objective.",
          "7. Exit Ticket: Students demonstrate whether they can identify and name basic geometric figures accurately."
        ]
      },
      {
        sectionId: "direct_instruction_script",
        title: "Direct Instruction Script",
        body: [
          "Today we are learning the language of Geometry. Geometry is not only about shapes; it is about describing figures with precision.",
          "A point tells us an exact location. A line extends forever in two directions. A plane is a flat surface that extends forever.",
          "When we look at a diagram, we must pay attention to the symbols. Arrows, endpoints, and labels all matter.",
          "If a figure has two endpoints, it is a segment. If it has one endpoint and continues forever in one direction, it is a ray. If it continues forever in both directions, it is a line.",
          "Our goal today is to describe figures the way mathematicians describe them: clearly, accurately, and with correct notation."
        ]
      },
      {
        sectionId: "checks_for_understanding",
        title: "Checks for Understanding",
        body: [
          "Ask: How do you know this figure is a ray and not a segment?",
          "Ask: Which point must be named first when naming a ray?",
          "Ask: What does the arrow tell us?",
          "Ask: Can this angle be named using only the vertex? Why or why not?",
          "Ask: What is the difference between a line and a segment?"
        ]
      },
      {
        sectionId: "differentiation",
        title: "Differentiation Supports",
        body: [
          "For students who need support: provide diagrams with arrows and endpoints highlighted.",
          "For English learners: pair each vocabulary word with a diagram and a short definition.",
          "For students with IEP accommodations: reduce visual clutter and present one figure at a time.",
          "For advanced students: ask them to create their own diagram and write three correct names for figures in the diagram."
        ]
      },
      {
        sectionId: "teacher_closure",
        title: "Closure",
        body: [
          "End the lesson by asking students to explain why notation matters in Geometry.",
          "A strong closing statement: In Geometry, small symbols change meaning. Arrows, endpoints, and order help us communicate exactly what figure we mean."
        ]
      }
    ];
  }

  resolveLesson(input = {}) {
    const context = input.generationContext || input.context || input;
    const lessonModel = context.lessonModel || context.lesson || {};

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
        "The Language of Geometry"
    };
  }
}

export const teacherPlaybookGenerator = new TeacherPlaybookGenerator();