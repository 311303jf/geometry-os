/**
 * Geometry OS
 * Lesson Package Validator v0.5.1
 *
 * Responsibility:
 * Validate an assembled Lesson Content Package before publication.
 *
 * Important:
 * This validator does NOT generate content.
 * It does NOT modify the package.
 * It does NOT publish resources.
 * It only returns a validation report.
 */

export class LessonPackageValidator {
  constructor() {
    this.validatorVersion = "v0.5.1";

    this.requiredAssetTypes = [
      "bell_ringer",
      "teacher_playbook",
      "student_notes",
      "guided_practice",
      "independent_practice",
      "homework",
      "exit_ticket",
      "quiz",
      "recovery"
    ];
  }

  validate(contentPackage = {}) {
    const errors = [];
    const warnings = [];

    if (!contentPackage || typeof contentPackage !== "object") {
      errors.push("Lesson Package Validator requires a content package object.");
      return this.buildReport({ contentPackage, errors, warnings });
    }

    if (contentPackage.status !== "content_package_assembled") {
      errors.push("Content package status must be content_package_assembled.");
    }

    if (contentPackage.contentAssembled !== true) {
      errors.push("Content package must have contentAssembled set to true.");
    }

    if (!Array.isArray(contentPackage.sections)) {
      errors.push("Content package must include a sections array.");
      return this.buildReport({ contentPackage, errors, warnings });
    }

    if (contentPackage.sections.length !== this.requiredAssetTypes.length) {
      errors.push(
        `Content package must contain ${this.requiredAssetTypes.length} sections.`
      );
    }

    const missingAssetTypes = this.requiredAssetTypes.filter((assetType) => {
      return !contentPackage.sections.some(
        (section) => section.assetType === assetType
      );
    });

    missingAssetTypes.forEach((assetType) => {
      errors.push(`Missing required section: ${assetType}.`);
    });

    contentPackage.sections.forEach((section, index) => {
      this.validateSection(section, index, errors, warnings);
    });

    if (!contentPackage.metadata) {
      warnings.push("Content package metadata is missing.");
    }

    return this.buildReport({ contentPackage, errors, warnings });
  }

  validateSection(section, index, errors, warnings) {
    if (!section || typeof section !== "object") {
      errors.push(`Section ${index + 1} is invalid.`);
      return;
    }

    if (!section.sectionId) {
      errors.push(`Section ${index + 1} is missing sectionId.`);
    }

    if (typeof section.order !== "number") {
      errors.push(`Section ${index + 1} is missing numeric order.`);
    }

    if (!section.assetType) {
      errors.push(`Section ${index + 1} is missing assetType.`);
    }

    if (!section.generatorId) {
      errors.push(`Section ${index + 1} is missing generatorId.`);
    }

    if (!section.executionId) {
      warnings.push(`Section ${index + 1} is missing executionId.`);
    }

    if (section.contentGenerated !== true) {
      errors.push(`Section ${index + 1} was not marked as generated.`);
    }

    if (!section.content) {
      errors.push(`Section ${index + 1} is missing content.`);
      return;
    }

    if (!section.content.generatorId) {
      warnings.push(
        `Section ${index + 1} content is missing generatorId metadata.`
      );
    }

    if (!section.content.assetType) {
      warnings.push(
        `Section ${index + 1} content is missing assetType metadata.`
      );
    }
  }

  buildReport({ contentPackage, errors, warnings }) {
    const isValid = errors.length === 0;

    return {
      validatorVersion: this.validatorVersion,
      status: isValid ? "lesson_package_valid" : "lesson_package_invalid",
      valid: isValid,
      errorCount: errors.length,
      warningCount: warnings.length,
      errors,
      warnings,
      packageSummary: {
        packageId: contentPackage?.packageId || null,
        totalSections: Array.isArray(contentPackage?.sections)
          ? contentPackage.sections.length
          : 0,
        requiredSections: this.requiredAssetTypes.length
      },
      metadata: {
        validatedBy: "LessonPackageValidator",
        validatedAt: new Date().toISOString()
      }
    };
  }
}

export const lessonPackageValidator = new LessonPackageValidator();