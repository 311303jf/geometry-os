/**
 * Geometry OS
 * Geometry Template Resolver v1.1.0
 *
 * Responsibility:
 * Resolve one certified Geometry template from a resolved problem type
 * or normalized problem type metadata.
 *
 * This resolver:
 * - reads templates only from Geometry Template Registry v1.0.9
 * - validates selected templates through Geometry Template
 *   Validation Contract v1.0.10
 * - supports explicit template selection
 * - supports deterministic problem-type resolution
 * - supports metadata-based selection when multiple templates exist
 * - returns protected copies
 *
 * This resolver does NOT:
 * - generate variables
 * - render prompts
 * - calculate answers
 * - generate distractors
 * - modify registry data
 */

import * as geometryTemplateRegistryModule
  from "./geometryTemplateRegistry.js";

import * as geometryTemplateValidationContractModule
  from "./geometryTemplateValidationContract.js";

const RESOLVER_VERSION = "v1.1.0";

const RESOLUTION_STATUS = Object.freeze({
  RESOLVED: "geometry_template_resolved",
  UNRESOLVED: "geometry_template_unresolved",
  REJECTED: "geometry_template_rejected"
});

const RESOLUTION_STRATEGY = Object.freeze({
  EXPLICIT_TEMPLATE: "explicit_template_id",
  PROBLEM_TYPE_SINGLE_MATCH: "problem_type_single_match",
  PROBLEM_TYPE_METADATA_MATCH: "problem_type_metadata_match",
  PROBLEM_TYPE_DETERMINISTIC_FALLBACK:
    "problem_type_deterministic_fallback",
  UNRESOLVED: "unresolved"
});

/**
 * Creates a JSON-safe protected copy.
 *
 * Geometry template records contain only plain serializable data.
 */
function protectedCopy(value) {
  if (value === undefined) {
    return undefined;
  }

  return JSON.parse(JSON.stringify(value));
}

function normalizeString(value) {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim().toLowerCase();
}

function normalizeStringArray(value) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((item) => typeof item === "string")
    .map((item) => normalizeString(item))
    .filter(Boolean);
}

function uniqueStrings(values = []) {
  return [...new Set(values.filter(Boolean))];
}

function getObjectValues(moduleObject = {}) {
  return Object.values(moduleObject).filter(
    (value) => value && typeof value === "object"
  );
}

function findRegistry() {
  const namedCandidates = [
    geometryTemplateRegistryModule.geometryTemplateRegistry,
    geometryTemplateRegistryModule.templateRegistry,
    geometryTemplateRegistryModule.default
  ].filter(Boolean);

  const moduleCandidates = getObjectValues(
    geometryTemplateRegistryModule
  );

  const candidates = [
    ...namedCandidates,
    ...moduleCandidates
  ];

  const registry = candidates.find((candidate) => {
    return (
      typeof candidate.getTemplateById === "function" ||
      typeof candidate.getById === "function" ||
      typeof candidate.findTemplateById === "function" ||
      typeof candidate.getTemplates === "function" ||
      typeof candidate.getAllTemplates === "function" ||
      typeof candidate.listTemplates === "function" ||
      Array.isArray(candidate.templates)
    );
  });

  if (!registry) {
    throw new Error(
      "Geometry Template Resolver could not locate the certified Geometry Template Registry."
    );
  }

  return registry;
}

function findValidationContract() {
  const namedCandidates = [
    geometryTemplateValidationContractModule
      .geometryTemplateValidationContract,
    geometryTemplateValidationContractModule
      .templateValidationContract,
    geometryTemplateValidationContractModule.default
  ].filter(Boolean);

  const moduleCandidates = getObjectValues(
    geometryTemplateValidationContractModule
  );

  const candidates = [
    ...namedCandidates,
    ...moduleCandidates
  ];

  const validationContract = candidates.find((candidate) => {
    return (
      typeof candidate.validateTemplate === "function" ||
      typeof candidate.validate === "function" ||
      typeof candidate.validateTemplates === "function" ||
      typeof candidate.assertValidTemplate === "function"
    );
  });

  if (!validationContract) {
    throw new Error(
      "Geometry Template Resolver could not locate the certified Geometry Template Validation Contract."
    );
  }

  return validationContract;
}

function extractTemplateArray(value) {
  if (Array.isArray(value)) {
    return value;
  }

  if (!value || typeof value !== "object") {
    return [];
  }

  const possibleArrays = [
    value.templates,
    value.items,
    value.records,
    value.results,
    value.data
  ];

  const foundArray = possibleArrays.find(Array.isArray);

  return foundArray || [];
}

function readAllTemplates(registry) {
  const methodNames = [
    "getAllTemplates",
    "getTemplates",
    "listTemplates",
    "getRegisteredTemplates",
    "getTemplateRecords",
    "list"
  ];

  for (const methodName of methodNames) {
    if (typeof registry[methodName] === "function") {
      const result = registry[methodName]();
      const templates = extractTemplateArray(result);

      if (templates.length > 0) {
        return protectedCopy(templates);
      }
    }
  }

  if (Array.isArray(registry.templates)) {
    return protectedCopy(registry.templates);
  }

  if (
    registry.templateMap &&
    typeof registry.templateMap === "object"
  ) {
    return protectedCopy(Object.values(registry.templateMap));
  }

  if (
    registry.registry &&
    typeof registry.registry === "object"
  ) {
    if (Array.isArray(registry.registry)) {
      return protectedCopy(registry.registry);
    }

    return protectedCopy(Object.values(registry.registry));
  }

  throw new Error(
    "Geometry Template Registry does not expose a readable template collection."
  );
}

function readTemplateById(registry, templateId, allTemplates) {
  const methodNames = [
    "getTemplateById",
    "getById",
    "findTemplateById",
    "resolveTemplateById"
  ];

  for (const methodName of methodNames) {
    if (typeof registry[methodName] === "function") {
      const result = registry[methodName](templateId);

      if (result) {
        return protectedCopy(result.template || result);
      }
    }
  }

  return protectedCopy(
    allTemplates.find(
      (template) => template.templateId === templateId
    ) || null
  );
}

function readTemplatesByProblemType(
  registry,
  problemTypeId,
  allTemplates
) {
  const methodNames = [
    "getTemplatesByProblemType",
    "findTemplatesByProblemType",
    "getByProblemTypeId",
    "getTemplatesForProblemType"
  ];

  for (const methodName of methodNames) {
    if (typeof registry[methodName] === "function") {
      const result = registry[methodName](problemTypeId);
      const templates = extractTemplateArray(result);

      if (templates.length > 0) {
        return protectedCopy(templates);
      }
    }
  }

  return protectedCopy(
    allTemplates.filter(
      (template) => template.problemTypeId === problemTypeId
    )
  );
}

function normalizeValidationResult(result) {
  if (result === true || result === undefined) {
    return {
      valid: true,
      errors: []
    };
  }

  if (result === false) {
    return {
      valid: false,
      errors: ["Template validation returned false."]
    };
  }

  if (!result || typeof result !== "object") {
    return {
      valid: false,
      errors: ["Template validation returned an invalid result."]
    };
  }

  const valid =
    result.valid === true ||
    result.validationPassed === true ||
    result.pass === true ||
    result.accepted === true;

  const explicitInvalid =
    result.valid === false ||
    result.validationPassed === false ||
    result.pass === false ||
    result.accepted === false;

  const errors = Array.isArray(result.errors)
    ? result.errors.map(String)
    : [];

  return {
    valid: valid || (!explicitInvalid && errors.length === 0),
    errors
  };
}

function validateTemplate(validationContract, template) {
  const methodNames = [
    "validateTemplate",
    "validate",
    "assertValidTemplate"
  ];

  for (const methodName of methodNames) {
    if (typeof validationContract[methodName] === "function") {
      try {
        const result =
          validationContract[methodName](protectedCopy(template));

        return normalizeValidationResult(result);
      } catch (error) {
        return {
          valid: false,
          errors: [
            error instanceof Error
              ? error.message
              : String(error)
          ]
        };
      }
    }
  }

  if (
    typeof validationContract.validateTemplates === "function"
  ) {
    try {
      const result =
        validationContract.validateTemplates([
          protectedCopy(template)
        ]);

      return normalizeValidationResult(result);
    } catch (error) {
      return {
        valid: false,
        errors: [
          error instanceof Error
            ? error.message
            : String(error)
        ]
      };
    }
  }

  return {
    valid: false,
    errors: [
      "Geometry Template Validation Contract exposes no supported validation method."
    ]
  };
}

function flattenInput(input = {}) {
  if (!input || typeof input !== "object") {
    return {};
  }

  const nestedCandidates = [
    input.problemType,
    input.resolvedProblemType,
    input.problemTypeResult,
    input.resolution,
    input.metadata
  ].filter(
    (candidate) =>
      candidate &&
      typeof candidate === "object" &&
      !Array.isArray(candidate)
  );

  return Object.assign({}, ...nestedCandidates, input);
}

function collectSearchTerms(request = {}) {
  const terms = [];

  const stringFields = [
    request.targetSkill,
    request.assessmentTarget,
    request.templatePreference,
    request.skill,
    request.focus,
    request.problemFamily,
    request.family,
    request.outputType,
    request.expectedAnswerFormat
  ];

  stringFields.forEach((value) => {
    const normalizedValue = normalizeString(value);

    if (normalizedValue) {
      terms.push(normalizedValue);
    }
  });

  const arrayFields = [
    request.targetSkills,
    request.assessmentTargets,
    request.templatePreferences,
    request.requiredFields,
    request.keywords,
    request.tags
  ];

  arrayFields.forEach((value) => {
    terms.push(...normalizeStringArray(value));
  });

  return uniqueStrings(terms);
}

function collectTemplateSearchText(template = {}) {
  const values = [
    template.templateId,
    template.problemTypeId,
    template.templateFamily,
    template.family,
    template.targetSkill,
    template.assessmentTarget,
    template.templatePreference,
    template.promptPattern,
    template.outputType,
    template.expectedAnswerFormat
  ];

  const arrayValues = [
    template.requiredFields,
    template.targetSkills,
    template.assessmentTargets,
    template.keywords,
    template.tags,
    template.aliases
  ];

  const textValues = values
    .filter((value) => typeof value === "string")
    .map((value) => normalizeString(value));

  arrayValues.forEach((arrayValue) => {
    textValues.push(...normalizeStringArray(arrayValue));
  });

  return uniqueStrings(textValues).join(" ");
}

function scoreRequiredFields(request, template) {
  const requestedFields = normalizeStringArray(
    request.requiredFields
  );

  if (requestedFields.length === 0) {
    return 0;
  }

  const templateFields = normalizeStringArray(
    template.requiredFields
  );

  const matchingFields = requestedFields.filter((field) =>
    templateFields.includes(field)
  );

  if (matchingFields.length === requestedFields.length) {
    return 30;
  }

  return matchingFields.length * 5;
}

function scoreFigureRequirement(request, template) {
  if (typeof request.requiresFigure !== "boolean") {
    return 0;
  }

  return template.requiresFigure === request.requiresFigure
    ? 20
    : -5;
}

function scoreTemplatePreference(request, template) {
  const preference = normalizeString(
    request.templatePreference
  );

  if (!preference) {
    return 0;
  }

  const templateId = normalizeString(template.templateId);
  const templateFamily = normalizeString(
    template.templateFamily || template.family
  );

  if (preference === templateId) {
    return 100;
  }

  if (preference === templateFamily) {
    return 40;
  }

  if (templateId.includes(preference)) {
    return 35;
  }

  return 0;
}

function scoreMetadataTerms(request, template) {
  const searchTerms = collectSearchTerms(request);

  if (searchTerms.length === 0) {
    return 0;
  }

  const templateSearchText =
    collectTemplateSearchText(template);

  return searchTerms.reduce((score, term) => {
    if (templateSearchText.includes(term)) {
      return score + 10;
    }

    const termParts = term
      .split(/[\s_-]+/)
      .filter((part) => part.length > 2);

    const matchingParts = termParts.filter((part) =>
      templateSearchText.includes(part)
    );

    return score + matchingParts.length * 3;
  }, 0);
}

function scoreTemplate(request, template) {
  return (
    scoreTemplatePreference(request, template) +
    scoreRequiredFields(request, template) +
    scoreFigureRequirement(request, template) +
    scoreMetadataTerms(request, template)
  );
}

function chooseDeterministically(templates = []) {
  return [...templates].sort((first, second) => {
    const firstId = first.templateId || "";
    const secondId = second.templateId || "";

    return firstId.localeCompare(secondId);
  })[0] || null;
}

function chooseByMetadata(request, templates = []) {
  const rankedTemplates = templates
    .map((template) => ({
      template,
      score: scoreTemplate(request, template)
    }))
    .sort((first, second) => {
      if (second.score !== first.score) {
        return second.score - first.score;
      }

      const firstId = first.template.templateId || "";
      const secondId = second.template.templateId || "";

      return firstId.localeCompare(secondId);
    });

  if (
    rankedTemplates.length === 0 ||
    rankedTemplates[0].score <= 0
  ) {
    return {
      template: chooseDeterministically(templates),
      matchedByMetadata: false,
      score: 0
    };
  }

  return {
    template: rankedTemplates[0].template,
    matchedByMetadata: true,
    score: rankedTemplates[0].score
  };
}

function createBaseResult({
  status,
  resolved,
  resolutionStrategy,
  errors = []
}) {
  return {
    resolverVersion: RESOLVER_VERSION,
    status,
    resolved,
    resolutionStrategy,
    templateId: null,
    problemTypeId: null,
    templateFamily: null,
    promptPattern: null,
    requiredFields: [],
    outputType: null,
    expectedAnswerFormat: null,
    requiresFigure: null,
    template: null,
    errors: protectedCopy(errors)
  };
}

function createRejectedResult(errors, problemTypeId = null) {
  return {
    ...createBaseResult({
      status: RESOLUTION_STATUS.REJECTED,
      resolved: false,
      resolutionStrategy: RESOLUTION_STRATEGY.UNRESOLVED,
      errors
    }),
    problemTypeId
  };
}

function createUnresolvedResult(errors, problemTypeId = null) {
  return {
    ...createBaseResult({
      status: RESOLUTION_STATUS.UNRESOLVED,
      resolved: false,
      resolutionStrategy: RESOLUTION_STRATEGY.UNRESOLVED,
      errors
    }),
    problemTypeId
  };
}

function createResolvedResult({
  template,
  problemTypeId,
  resolutionStrategy
}) {
  const protectedTemplate = protectedCopy(template);

  return {
    resolverVersion: RESOLVER_VERSION,
    status: RESOLUTION_STATUS.RESOLVED,
    resolved: true,
    resolutionStrategy,
    templateId: protectedTemplate.templateId,
    problemTypeId:
      protectedTemplate.problemTypeId || problemTypeId,
    templateFamily:
      protectedTemplate.templateFamily ||
      protectedTemplate.family ||
      null,
    promptPattern: protectedTemplate.promptPattern || null,
    requiredFields: Array.isArray(
      protectedTemplate.requiredFields
    )
      ? protectedCopy(protectedTemplate.requiredFields)
      : [],
    outputType: protectedTemplate.outputType || null,
    expectedAnswerFormat:
      protectedTemplate.expectedAnswerFormat || null,
    requiresFigure:
      typeof protectedTemplate.requiresFigure === "boolean"
        ? protectedTemplate.requiresFigure
        : null,
    template: protectedTemplate,
    errors: []
  };
}

export class GeometryTemplateResolver {
  constructor({
    registry = null,
    validationContract = null
  } = {}) {
    this.registry = registry || findRegistry();
    this.validationContract =
      validationContract || findValidationContract();
  }

  resolve(input = {}) {
    const request = flattenInput(input);

    const explicitTemplateId =
      typeof request.templateId === "string"
        ? request.templateId.trim()
        : "";

    const problemTypeId =
      typeof request.problemTypeId === "string"
        ? request.problemTypeId.trim()
        : "";

    if (!explicitTemplateId && !problemTypeId) {
      return createUnresolvedResult([
        "Geometry Template Resolver requires templateId or problemTypeId."
      ]);
    }

    let allTemplates;

    try {
      allTemplates = readAllTemplates(this.registry);
    } catch (error) {
      return createRejectedResult([
        error instanceof Error
          ? error.message
          : String(error)
      ], problemTypeId || null);
    }

    if (explicitTemplateId) {
      return this.resolveExplicitTemplate({
        explicitTemplateId,
        problemTypeId,
        allTemplates
      });
    }

    return this.resolveByProblemType({
      request,
      problemTypeId,
      allTemplates
    });
  }

  resolveExplicitTemplate({
    explicitTemplateId,
    problemTypeId,
    allTemplates
  }) {
    const template = readTemplateById(
      this.registry,
      explicitTemplateId,
      allTemplates
    );

    if (!template) {
      return createRejectedResult(
        [
          `Unknown Geometry templateId: ${explicitTemplateId}.`
        ],
        problemTypeId || null
      );
    }

    if (
      problemTypeId &&
      template.problemTypeId !== problemTypeId
    ) {
      return createRejectedResult(
        [
          `Template ${explicitTemplateId} belongs to problemTypeId ${template.problemTypeId}, not ${problemTypeId}.`
        ],
        problemTypeId
      );
    }

    const validation = validateTemplate(
      this.validationContract,
      template
    );

    if (!validation.valid) {
      return createRejectedResult(
        [
          `Template ${explicitTemplateId} failed certified validation.`,
          ...validation.errors
        ],
        problemTypeId || template.problemTypeId || null
      );
    }

    return createResolvedResult({
      template,
      problemTypeId:
        problemTypeId || template.problemTypeId,
      resolutionStrategy:
        RESOLUTION_STRATEGY.EXPLICIT_TEMPLATE
    });
  }

  resolveByProblemType({
    request,
    problemTypeId,
    allTemplates
  }) {
    const matchingTemplates =
      readTemplatesByProblemType(
        this.registry,
        problemTypeId,
        allTemplates
      );

    if (matchingTemplates.length === 0) {
      return createUnresolvedResult(
        [
          `No certified Geometry template is connected to problemTypeId ${problemTypeId}.`
        ],
        problemTypeId
      );
    }

    const validTemplates = [];
    const validationErrors = [];

    matchingTemplates.forEach((template) => {
      const validation = validateTemplate(
        this.validationContract,
        template
      );

      if (validation.valid) {
        validTemplates.push(template);
      } else {
        validationErrors.push(
          `Template ${template.templateId || "unknown_template"} failed validation.`
        );

        validationErrors.push(...validation.errors);
      }
    });

    if (validTemplates.length === 0) {
      return createRejectedResult(
        [
          `No valid certified Geometry template is available for problemTypeId ${problemTypeId}.`,
          ...validationErrors
        ],
        problemTypeId
      );
    }

    if (validTemplates.length === 1) {
      return createResolvedResult({
        template: validTemplates[0],
        problemTypeId,
        resolutionStrategy:
          RESOLUTION_STRATEGY.PROBLEM_TYPE_SINGLE_MATCH
      });
    }

    const metadataResolution = chooseByMetadata(
      request,
      validTemplates
    );

    return createResolvedResult({
      template: metadataResolution.template,
      problemTypeId,
      resolutionStrategy:
        metadataResolution.matchedByMetadata
          ? RESOLUTION_STRATEGY
              .PROBLEM_TYPE_METADATA_MATCH
          : RESOLUTION_STRATEGY
              .PROBLEM_TYPE_DETERMINISTIC_FALLBACK
    });
  }

  resolveTemplate(input = {}) {
    return this.resolve(input);
  }

  getResolverVersion() {
    return RESOLVER_VERSION;
  }
}

export const geometryTemplateResolver =
  new GeometryTemplateResolver();

export {
  RESOLVER_VERSION,
  RESOLUTION_STATUS,
  RESOLUTION_STRATEGY
};