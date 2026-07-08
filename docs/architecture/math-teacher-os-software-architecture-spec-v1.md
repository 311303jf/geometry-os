# Math Teacher OS
## Software Architecture Specification v1.0

---

# Purpose

This document defines the software architecture for Math Teacher OS.

This architecture applies to:

- Geometry OS
- Algebra OS
- Algebra 2 OS
- Precalculus OS
- Statistics OS

The course changes.

The platform architecture remains the same.

---

# Core Principle

AI generates candidate content.

Math Teacher OS certifies content.

Only certified content reaches students.

---

# Repository Structure

```text
src/
├── core/
│   ├── lessonOrchestrator.js
│   ├── engineRegistry.js
│   └── eventBus.js
│
├── engines/
│   ├── generation/
│   ├── certification/
│   ├── curriculum/
│   ├── standards/
│   ├── pedagogy/
│   ├── solver/
│   ├── distractors/
│   ├── quality/
│   ├── coverage/
│   ├── duplicates/
│   ├── recovery/
│   ├── publishing/
│   └── analytics/
│
├── curriculum/
│   └── geometry/
│
├── models/
│   ├── questionModel.js
│   ├── lessonModel.js
│   ├── resourceModel.js
│   └── certificationResultModel.js
│
├── services/
│   ├── googleFormsService.js
│   ├── googleClassroomService.js
│   └── storageService.js
│
├── shared/
│   ├── constants.js
│   ├── validators.js
│   └── helpers.js
│
├── ui/
│
└── tests/
