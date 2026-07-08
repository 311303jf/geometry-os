/**
 * Geometry Question Generation Engine v1.0
 * Math Teacher OS
 *
 * Purpose:
 * Generate candidate Geometry questions for Lesson 1.1:
 * The Language of Geometry.
 *
 * Important:
 * This engine only creates structured candidate questions.
 * A question is NOT student-ready until it passes certification.
 */

export const GEOMETRY_QUESTION_ENGINE_VERSION = "1.0.0";

const LESSON_1_1 = {
  course: "Geometry",
  unit: "Unit 1",
  lesson: "1.1",
  title: "The Language of Geometry",
  floridaStandard: "MA.912.GR.1.1",
  focusSkills: [
    "Identify points, lines, planes, rays, segments, and angles",
    "Use correct geometric notation",
    "Recognize undefined terms in geometry",
    "Distinguish between collinear and coplanar points"
  ]
};

const lesson11Templates = [
  {
    skillTag: "undefined_terms",
    difficulty: "DOK 1",
    prompt: "Which list contains the three undefined terms in geometry?",
    choices: [
      "Point, line, and plane",
      "Ray, angle, and segment",
      "Circle, polygon, and triangle",
      "Vertex, endpoint, and midpoint"
    ],
    correctAnswer: "Point, line, and plane",
    feedback: "The three undefined terms in geometry are point, line, and plane.",
    recoveryMapping: "review_undefined_terms"
  },
  {
    skillTag: "geometric_notation",
    difficulty: "DOK 1",
    prompt: "Which notation correctly represents a line through points A and B?",
    choices: [
      "line AB",
      "ray AB",
      "segment AB",
      "angle AB"
    ],
    correctAnswer: "line AB",
    feedback: "A line through points A and B extends forever in both directions.",
    recoveryMapping: "review_line_notation"
  },
  {
    skillTag: "collinear_points",
    difficulty: "DOK 2",
    prompt: "Points A, B, and C lie on the same straight line. What term describes these points?",
    choices: [
      "Collinear",
      "Coplanar",
      "Concurrent",
      "Congruent"
    ],
    correctAnswer: "Collinear",
    feedback: "Collinear points are points that lie on the same line.",
    recoveryMapping: "review_collinear_points"
  },
  {
    skillTag: "coplanar_points",
    difficulty: "DOK 2",
    prompt: "Points that lie on the same flat surface are called what?",
    choices: [
      "Coplanar",
      "Collinear",
      "Congruent",
      "Parallel"
    ],
    correctAnswer: "Coplanar",
    feedback: "Coplanar points are points that lie in the same plane.",
    recoveryMapping: "review_coplanar_points"
  }
];

function shuffleArray(items) {
  const copy = [...items];

  for (let i = copy.length - 1; i > 0; i--) {
    const randomIndex = Math.floor(Math.random() * (i + 1));
    const temp = copy[i];
    copy[i] = copy[randomIndex];
    copy[randomIndex] = temp;
  }

  return copy;
}

function formatChoices(choices, correctAnswer) {
  const shuffledChoices = shuffleArray(choices);

  return shuffledChoices.map((choice, index) => {
    return {
      label: ["A", "B", "C", "D"][index],
      text: choice,
      isCorrect: choice === correctAnswer
    };
  });
}

function buildQuestionId() {
  const timestamp = Date.now();
  const randomPart = Math.random().toString(36).slice(2, 8);
  return `GEO-1-1-${timestamp}-${randomPart}`;
}

export function generateGeometryLesson11Question() {
  const template =
    lesson11Templates[Math.floor(Math.random() * lesson11Templates.length)];

  return {
    id: buildQuestionId(),
    engineVersion: GEOMETRY_QUESTION_ENGINE_VERSION,
    status: "candidate_not_certified",
    course: LESSON_1_1.course,
    unit: LESSON_1_1.unit,
    lesson: LESSON_1_1.lesson,
    lessonTitle: LESSON_1_1.title,
    standardTag: LESSON_1_1.floridaStandard,
    skillTag: template.skillTag,
    difficulty: template.difficulty,
    questionType: "multiple_choice",
    pointValue: 1,
    prompt: template.prompt,
    choices: formatChoices(template.choices, template.correctAnswer),
    correctAnswer: template.correctAnswer,
    feedback: template.feedback,
    recoveryMapping: template.recoveryMapping,
    certificationRequired: true,
    createdAt: new Date().toISOString()
  };
}

export function generateGeometryLesson11QuestionSet(count = 5) {
  const questions = [];

  for (let i = 0; i < count; i++) {
    questions.push(generateGeometryLesson11Question());
  }

  return questions;
}
