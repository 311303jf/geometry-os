/**
 * Geometry OS
 * Learning Intelligence Engine v0.2.2
 *
 * Responsibility:
 * Transform a Lesson Model into an instructional sequence.
 *
 * This engine does NOT generate questions.
 * It decides HOW the lesson should be taught.
 */

export class LearningIntelligenceEngine {

  buildInstructionPlan(lessonModel){

    this.validate(lessonModel);

    return {

      lessonId: lessonModel.id,

      instructionalSequence:
        this.createInstructionalSequence(lessonModel),

      prerequisiteValidation:
        this.buildPrerequisiteValidation(lessonModel),

      assessmentFlow:
        this.buildAssessmentFlow(lessonModel),

      recoveryTriggers:
        this.buildRecoveryTriggers(lessonModel),

      masteryTargets:
        this.buildMasteryTargets(lessonModel)

    };

  }

  validate(model){

    if(!model){
      throw new Error("Learning Intelligence Engine requires Lesson Model.");
    }

  }

  createInstructionalSequence(model){

    return model.learningPath.map(step=>({

      ...step,

      instructionStatus:"planned"

    }));

  }

  buildPrerequisiteValidation(model){

    return model.prerequisiteSkills.map(skill=>({

      skill,

      required:true,

      verified:false

    }));

  }

  buildAssessmentFlow(model){

    return model.assessmentTargets.map(target=>({

      target,

      assessed:false

    }));

  }

  buildRecoveryTriggers(model){

    return model.recoveryPlan.map(item=>({

      misconception:item.misconception,

      trigger:"assessment_failure",

      recoveryReady:true

    }));

  }

  buildMasteryTargets(model){

    return model.assessmentTargets.map(target=>({

      target,

      masteryThreshold:0.80,

      status:"pending"

    }));

  }

}

export const learningIntelligenceEngine =
new LearningIntelligenceEngine();