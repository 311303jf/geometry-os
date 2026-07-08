/**
 * Geometry OS
 * Instruction Asset Specification Engine v0.2.9
 *
 * Responsibility:
 * Convert a Resource Plan into detailed Asset Specifications.
 *
 * This engine does NOT generate resources.
 * It defines how future generators should build them.
 */

export class InstructionAssetSpecificationEngine {

  buildSpecifications(resourcePlan) {

    this.validate(resourcePlan);

    const specifications =
      resourcePlan.resources.map(resource =>
        this.buildSpecification(resource)
      );

    return {

      lessonId: resourcePlan.lessonId,

      specificationVersion: "v0.2.9",

      generatedBy:
        "InstructionAssetSpecificationEngine",

      totalSpecifications:
        specifications.length,

      specifications

    };

  }

  validate(resourcePlan){

    if(!resourcePlan){
      throw new Error(
        "Instruction Asset Specification Engine requires a Resource Plan."
      );
    }

    if(!Array.isArray(resourcePlan.resources)){
      throw new Error(
        "Resource Plan must contain a resources array."
      );
    }

  }

  buildSpecification(resource){

    return {

      assetId:
        resource.id,

      resourceType:
        resource.resourceType,

      stepTitle:
        resource.stepTitle,

      generationStatus:
        "pending",

      estimatedDifficulty:
        this.getDifficulty(resource),

      estimatedDuration:
        this.getDuration(resource),

      requiresVisual:
        this.requiresVisual(resource),

      requiresTeacherGuidance:
        this.requiresTeacherGuidance(resource),

      futureGenerator:
        this.getFutureGenerator(resource)

    };

  }

  getDifficulty(resource){

    switch(resource.resourceType){

      case "teacher_mini_lesson":
        return "medium";

      case "worked_example":
        return "medium";

      case "guided_practice":
        return "medium";

      case "independent_practice":
        return "high";

      case "recovery_resource":
        return "medium";

      default:
        return "low";

    }

  }

  getDuration(resource){

    switch(resource.resourceType){

      case "teacher_mini_lesson":
        return 10;

      case "worked_example":
        return 8;

      case "guided_practice":
        return 12;

      case "independent_practice":
        return 15;

      case "check_for_understanding":
        return 3;

      default:
        return 5;

    }

  }

  requiresVisual(resource){

    return [
      "teacher_mini_lesson",
      "worked_example",
      "visual_support"
    ].includes(resource.resourceType);

  }

  requiresTeacherGuidance(resource){

    return [
      "teacher_mini_lesson",
      "worked_example",
      "guided_practice"
    ].includes(resource.resourceType);

  }

  getFutureGenerator(resource){

    switch(resource.resourceType){

      case "teacher_mini_lesson":
        return "TeacherLessonGenerator";

      case "worked_example":
        return "WorkedExampleGenerator";

      case "guided_practice":
        return "GuidedPracticeGenerator";

      case "independent_practice":
        return "IndependentPracticeGenerator";

      case "visual_support":
        return "DiagramGenerator";

      case "recovery_resource":
        return "RecoveryGenerator";

      default:
        return "GenericResourceGenerator";

    }

  }

}

export const instructionAssetSpecificationEngine =
  new InstructionAssetSpecificationEngine();