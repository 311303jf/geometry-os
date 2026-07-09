/**
 * Geometry OS
 * Lesson Package Export Contract Engine v0.5.2
 *
 * Responsibility:
 * Prepare a validated Lesson Content Package for future publishers.
 *
 * Important:
 * This engine does NOT write files.
 * It does NOT publish to Google Docs.
 * It does NOT publish to Google Classroom.
 * It does NOT create PDFs.
 * It only creates a structured export contract object.
 */

export class LessonPackageExportContractEngine {
  buildExportContract({ contentPackage, validationReport } = {}) {
    this.validateInputs({ contentPackage, validationReport });

    return {
      status: "export_contract_prepared",
      exportContractVersion: "v0.5.2",
      generatedBy: "LessonPackageExportContractEngine",
      generatedAt: new Date().toISOString(),

      lessonId:
        contentPackage.lessonId ||
        contentPackage.packageSummary?.lessonId ||
        null,

      packageStatus: contentPackage.status,
      validationStatus: validationReport.status,
      validationValid: validationReport.valid,

      supportedPublishers: [
        "google_docs_publisher",
        "google_classroom_publisher",
        "pdf_publisher",
        "html_publisher",
        "json_api_publisher"
      ],

      exportTargets: this.buildExportTargets(contentPackage),

      packageSummary: {
        totalSections: contentPackage.packageSummary?.totalSections ?? 0,
        requiredSections: contentPackage.packageSummary?.requiredSections ?? 0,
        sectionOrder: contentPackage.packageSummary?.sectionOrder || []
      },

      sections: this.buildSectionContracts(contentPackage),

      metadata: {
        sourcePackageGeneratedAt: contentPackage.generatedAt || null,
        sourcePackageGeneratedBy: contentPackage.generatedBy || null,
        validationErrorCount: validationReport.errorCount ?? 0,
        validationWarningCount: validationReport.warningCount ?? 0
      }
    };
  }

  validateInputs({ contentPackage, validationReport }) {
    if (!contentPackage || typeof contentPackage !== "object") {
      throw new Error("Lesson Package Export Contract Engine requires a contentPackage object.");
    }

    if (!validationReport || typeof validationReport !== "object") {
      throw new Error("Lesson Package Export Contract Engine requires a validationReport object.");
    }

    if (validationReport.valid !== true) {
      throw new Error("Cannot prepare export contract because validationReport.valid is not true.");
    }

    if (contentPackage.status !== "content_package_assembled") {
      throw new Error("Cannot prepare export contract because contentPackage is not assembled.");
    }

    if (!Array.isArray(contentPackage.sections)) {
      throw new Error("Lesson Package Export Contract Engine requires contentPackage.sections array.");
    }
  }

  buildExportTargets(contentPackage) {
    return {
      googleDocs: {
        enabled: true,
        format: "document",
        sectionCount: contentPackage.sections.length
      },
      googleClassroom: {
        enabled: true,
        format: "assignment_resources",
        sectionCount: contentPackage.sections.length
      },
      pdf: {
        enabled: true,
        format: "printable_packet",
        sectionCount: contentPackage.sections.length
      },
      html: {
        enabled: true,
        format: "web_lesson_package",
        sectionCount: contentPackage.sections.length
      },
      jsonApi: {
        enabled: true,
        format: "structured_json",
        sectionCount: contentPackage.sections.length
      }
    };
  }

  buildSectionContracts(contentPackage) {
    return contentPackage.sections.map((section, index) => {
      return {
        exportSectionId: this.createExportSectionId(index),
        order: section.order ?? index + 1,
        sectionId: section.sectionId || null,
        assetType: section.assetType || "unknown_asset",
        generatorId: section.generatorId || null,
        title: section.title || this.createFallbackTitle(section.assetType),
        status: section.status || "unknown_status",

        content: section.content || null,

        publisherHints: {
          includeInGoogleDocs: true,
          includeInGoogleClassroom: true,
          includeInPdf: true,
          includeInHtml: true,
          includeInJsonApi: true
        }
      };
    });
  }

  createExportSectionId(index) {
    return `export_section_${String(index + 1).padStart(2, "0")}`;
  }

  createFallbackTitle(assetType = "unknown_asset") {
    return String(assetType)
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }
}

export const lessonPackageExportContractEngine =
  new LessonPackageExportContractEngine();