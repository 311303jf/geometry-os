import { createLessonBlueprint } from "./lessonBlueprint.js";

const lessonMap = {
  "Geometry|Unit 1|1.1": "./geometry/unit1/lesson1-1.json"
};

export class CurriculumLoader {
  async loadLesson({ course, unit, lesson }) {
    const key = `${course}|${unit}|${lesson}`;
    const path = lessonMap[key];

    if (!path) {
      throw new Error(`Lesson not found in curriculum map: ${key}`);
    }

    const response = await fetch(new URL(path, import.meta.url));

    if (!response.ok) {
      throw new Error(`Failed to load curriculum file: ${path}`);
    }

    const rawLesson = await response.json();

    return createLessonBlueprint(rawLesson);
  }
}

export const curriculumLoader = new CurriculumLoader();