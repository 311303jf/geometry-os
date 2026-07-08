/**
 * Math Teacher OS
 * Engine Registry v1.0
 *
 * Responsibility:
 * Store and retrieve platform engines by name.
 *
 * The Lesson Orchestrator should call engines through this registry
 * instead of importing every engine directly.
 */

export class EngineRegistry {
  constructor() {
    this.engines = new Map();
  }

  register(engineName, engine) {
    if (!engineName || typeof engineName !== "string") {
      throw new Error("Engine name must be a non-empty string.");
    }

    if (!engine) {
      throw new Error(`Cannot register empty engine: ${engineName}`);
    }

    this.engines.set(engineName, engine);

    return {
      registered: true,
      engineName
    };
  }

  get(engineName) {
    if (!this.engines.has(engineName)) {
      throw new Error(`Engine not found: ${engineName}`);
    }

    return this.engines.get(engineName);
  }

  has(engineName) {
    return this.engines.has(engineName);
  }

  list() {
    return Array.from(this.engines.keys());
  }

  clear() {
    this.engines.clear();
  }
}

export const engineRegistry = new EngineRegistry();