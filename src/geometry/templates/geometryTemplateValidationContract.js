/**
 * Geometry OS
 * Geometry Template Validation Contract v1.0.10
 *
 * Responsibility:
 * Validate Geometry Template Registry entries against the certified
 * Geometry Problem Type Registry.
 *
 * Important:
 * This contract does NOT generate values.
 * It does NOT generate questions.
 * It does NOT select templates.
 * It does NOT modify the template registry.
 * It only validates template structure and problem type compatibility.
 *
 * Figure Requirement Rule:
 * Problem type requiresFigure metadata represents the general or default
 * figure expectation for that problem family.
 *
 * A specific template may override that expectation when the prompt is
 * self-contained through measures, coordinates, transformation rules,
 * or other explicit mathematical data.
 *
 * Therefore, template requiresFigure must be boolean, but it does not
 * need to equal the problem type requiresFigure value.
 */

import {
  geometryTemplateRegistry
} from "./geometryTemplateRegistry.js";

import {
  geometryProblemTypeRegistry
} from "../problemTypes/geometryProblemTypeRegistry.js";

export class GeometryTemplateValidationContract {
  constructor({
    templateRegistry = geometryTemplateRegistry,
    problemTypeRegistry = geometryProblemTypeRegistry
  } = {}) {
    this.version = "v1.0.10";
    this.templateRegistry = templateRegistry;
    this.problemTypeRegistry = problemTypeRegistry;
  }

  getVersion() {
    return this.version;
  }

  validateTemplate(template) {
    const errors = [];

    if (
      !template ||
      typeof template !== "object" ||
      Array.isArray(template)
    ) {
      return {
        valid: false,
        errors: ["Geometry template object is required."]
      };
    }

    if (!template.templateId) {
      errors.push(
        "Geometry template is missing templateId."
      );
    }

    if (!template.problemTypeId) {
      errors.push(
        `Template ${template.templateId || "unknown"} is missing problemTypeId.`
      );
    }

    const problemType = template.problemTypeId
      ? this.problemTypeRegistry.getProblemType(
          template.problemTypeId
        )
      : null;

    if (template.problemTypeId && !problemType) {
      errors.push(
        `Template ${template.templateId || "unknown"} references missing problemTypeId: ${template.problemTypeId}`
      );
    }

    if (!template.templateFamily) {
      errors.push(
        `Template ${template.templateId || "unknown"} is missing templateFamily.`
      );
    }

    if (!template.promptPattern) {
      errors.push(
        `Template ${template.templateId || "unknown"} is missing promptPattern.`
      );
    }

    if (
      !Array.isArray(template.requiredFields) ||
      template.requiredFields.length === 0
    ) {
      errors.push(
        `Template ${template.templateId || "unknown"} must contain requiredFields.`
      );
    }

    if (
      Array.isArray(template.requiredFields) &&
      template.requiredFields.some((field) =>
        typeof field !== "string" ||
        field.trim().length === 0
      )
    ) {
      errors.push(
        `Template ${template.templateId || "unknown"} contains an invalid required field.`
      );
    }

    if (
      Array.isArray(template.requiredFields) &&
      new Set(template.requiredFields).size !==
        template.requiredFields.length
    ) {
      errors.push(
        `Template ${template.templateId || "unknown"} contains duplicate required fields.`
      );
    }

    if (!template.outputType) {
      errors.push(
        `Template ${template.templateId || "unknown"} is missing outputType.`
      );
    }

    if (template.outputType !== "multiple_choice") {
      errors.push(
        `Template ${template.templateId || "unknown"} must use multiple_choice outputType.`
      );
    }

    if (!template.expectedAnswerFormat) {
      errors.push(
        `Template ${template.templateId || "unknown"} is missing expectedAnswerFormat.`
      );
    }

    if (
      problemType &&
      template.expectedAnswerFormat !==
        problemType.expectedAnswerFormat
    ) {
      errors.push(
        `Template ${template.templateId} expectedAnswerFormat does not match problem type ${problemType.problemTypeId}.`
      );
    }

    if (
      typeof template.requiresFigure !== "boolean"
    ) {
      errors.push(
        `Template ${template.templateId || "unknown"} is missing requiresFigure boolean.`
      );
    }

    return {
      valid: errors.length === 0,
      templateId: template.templateId || null,
      problemTypeId: template.problemTypeId || null,
      errors
    };
  }

  validateRegistry() {
    const registryValidation =
      this.templateRegistry.validate();

    const templates =
      this.templateRegistry.listTemplates();

    const errors = [
      ...registryValidation.errors
    ];

    const templateIds = new Set();

    templates.forEach((template) => {
      if (templateIds.has(template.templateId)) {
        errors.push(
          `Duplicate templateId found: ${template.templateId}`
        );
      }

      templateIds.add(template.templateId);

      const templateValidation =
        this.validateTemplate(template);

      templateValidation.errors.forEach((error) => {
        errors.push(error);
      });
    });

    const connectedTemplateCount =
      templates.filter((template) =>
        this.problemTypeRegistry.hasProblemType(
          template.problemTypeId
        )
      ).length;

    const compatibleAnswerFormatCount =
      templates.filter((template) => {
        const problemType =
          this.problemTypeRegistry.getProblemType(
            template.problemTypeId
          );

        return (
          problemType &&
          problemType.expectedAnswerFormat ===
            template.expectedAnswerFormat
        );
      }).length;

    const validFigureMetadataCount =
      templates.filter((template) =>
        typeof template.requiresFigure === "boolean"
      ).length;

    const templateFigureOverrideCount =
      templates.filter((template) => {
        const problemType =
          this.problemTypeRegistry.getProblemType(
            template.problemTypeId
          );

        return (
          problemType &&
          problemType.requiresFigure !==
            template.requiresFigure
        );
      }).length;

    return {
      validationContractVersion: this.version,
      templateRegistryVersion:
        registryValidation.registryVersion,
      problemTypeRegistryVersion:
        registryValidation.problemTypeRegistryVersion,
      templateCount: templates.length,
      templateFamilyCount:
        registryValidation.templateFamilyCount,
      connectedTemplateCount,
      compatibleAnswerFormatCount,
      validFigureMetadataCount,
      templateFigureOverrideCount,
      valid: errors.length === 0,
      errors
    };
  }

  getTemplatesWithProblemTypes() {
    return this.templateRegistry
      .listTemplates()
      .map((template) => {
        return {
          template: this.cloneTemplate(template),
          problemType:
            this.cloneProblemType(
              this.problemTypeRegistry.getProblemType(
                template.problemTypeId
              )
            )
        };
      });
  }

  getDisconnectedTemplates() {
    return this.templateRegistry
      .listTemplates()
      .filter((template) =>
        !this.problemTypeRegistry.hasProblemType(
          template.problemTypeId
        )
      );
  }

  getAnswerFormatMismatches() {
    return this.templateRegistry
      .listTemplates()
      .filter((template) => {
        const problemType =
          this.problemTypeRegistry.getProblemType(
            template.problemTypeId
          );

        return (
          problemType &&
          template.expectedAnswerFormat !==
            problemType.expectedAnswerFormat
        );
      });
  }

  getInvalidFigureMetadataTemplates() {
    return this.templateRegistry
      .listTemplates()
      .filter((template) =>
        typeof template.requiresFigure !== "boolean"
      );
  }

  getFigureRequirementOverrides() {
    return this.templateRegistry
      .listTemplates()
      .filter((template) => {
        const problemType =
          this.problemTypeRegistry.getProblemType(
            template.problemTypeId
          );

        return (
          problemType &&
          problemType.requiresFigure !==
            template.requiresFigure
        );
      });
  }

  validateContract() {
    const errors = [];

    if (this.version !== "v1.0.10") {
      errors.push(
        "Geometry Template Validation Contract version mismatch."
      );
    }

    const registryValidation =
      this.validateRegistry();

    if (!registryValidation.valid) {
      registryValidation.errors.forEach((error) => {
        errors.push(
          `Template registry validation failed: ${error}`
        );
      });
    }

    const validTemplate =
      this.templateRegistry.getTemplate(
        "classify_angle_by_measure"
      );

    const validTemplateValidation =
      this.validateTemplate(validTemplate);

    if (!validTemplateValidation.valid) {
      validTemplateValidation.errors.forEach((error) => {
        errors.push(
          `Valid template rejected: ${error}`
        );
      });
    }

    const validFigureOverrideValidation =
      this.validateTemplate({
        templateId: "valid_figure_override_template",
        problemTypeId: "classify_triangle",
        templateFamily: "triangle_classification",
        promptPattern:
          "Classify the triangle with side lengths 5, 5, and 8.",
        requiredFields: [
          "sideLengthA",
          "sideLengthB",
          "sideLengthC"
        ],
        outputType: "multiple_choice",
        expectedAnswerFormat:
          "classification_label",
        requiresFigure: false
      });

    if (!validFigureOverrideValidation.valid) {
      validFigureOverrideValidation.errors.forEach((error) => {
        errors.push(
          `Valid figure override rejected: ${error}`
        );
      });
    }

    const invalidProblemTypeValidation =
      this.validateTemplate({
        templateId: "invalid_problem_type_template",
        problemTypeId: "missing_problem_type",
        templateFamily: "test_family",
        promptPattern: "Test prompt.",
        requiredFields: ["testField"],
        outputType: "multiple_choice",
        expectedAnswerFormat:
          "classification_label",
        requiresFigure: false
      });

    if (invalidProblemTypeValidation.valid) {
      errors.push(
        "Template with missing problem type should be rejected."
      );
    }

    const invalidAnswerFormatValidation =
      this.validateTemplate({
        templateId:
          "invalid_answer_format_template",
        problemTypeId: "classify_angle",
        templateFamily:
          "angle_classification",
        promptPattern: "Test prompt.",
        requiredFields: ["angleMeasure"],
        outputType: "multiple_choice",
        expectedAnswerFormat:
          "numeric_value",
        requiresFigure: false
      });

    if (invalidAnswerFormatValidation.valid) {
      errors.push(
        "Template with incompatible answer format should be rejected."
      );
    }

    const invalidFigureMetadataValidation =
      this.validateTemplate({
        templateId:
          "invalid_figure_metadata_template",
        problemTypeId: "identify_point",
        templateFamily:
          "foundational_identification",
        promptPattern: "Test prompt.",
        requiredFields: ["pointLabel"],
        outputType: "multiple_choice",
        expectedAnswerFormat:
          "geometry_object_name",
        requiresFigure: "yes"
      });

    if (invalidFigureMetadataValidation.valid) {
      errors.push(
        "Template with invalid figure metadata should be rejected."
      );
    }

    return {
      validationContractVersion: this.version,
      templateRegistryVersion:
        registryValidation.templateRegistryVersion,
      problemTypeRegistryVersion:
        registryValidation.problemTypeRegistryVersion,
      templateCount:
        registryValidation.templateCount,
      valid: errors.length === 0,
      errors
    };
  }

  cloneTemplate(template) {
    if (!template) {
      return null;
    }

    return {
      templateId: template.templateId,
      problemTypeId: template.problemTypeId,
      templateFamily:
        template.templateFamily,
      promptPattern:
        template.promptPattern,
      requiredFields: [
        ...template.requiredFields
      ],
      outputType:
        template.outputType,
      expectedAnswerFormat:
        template.expectedAnswerFormat,
      requiresFigure:
        template.requiresFigure
    };
  }

  cloneProblemType(problemType) {
    if (!problemType) {
      return null;
    }

    return {
      problemTypeId:
        problemType.problemTypeId,
      conceptId:
        problemType.conceptId,
      family:
        problemType.family,
      description:
        problemType.description,
      expectedAnswerFormat:
        problemType.expectedAnswerFormat,
      requiresFigure:
        problemType.requiresFigure
    };
  }
}

export const geometryTemplateValidationContract =
  new GeometryTemplateValidationContract();