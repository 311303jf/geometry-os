/**
 * Math Teacher OS
 * Event Bus v1.0
 *
 * Responsibility:
 * Record system events during lesson generation, certification,
 * publishing, analytics, and recovery workflows.
 */

export class EventBus {
  constructor() {
    this.events = [];
  }

  emit(eventType, payload = {}) {
    const event = {
      id: this.createEventId(),
      type: eventType,
      payload,
      createdAt: new Date().toISOString()
    };

    this.events.push(event);

    return event;
  }

  getAllEvents() {
    return [...this.events];
  }

  getEventsByType(eventType) {
    return this.events.filter((event) => event.type === eventType);
  }

  clear() {
    this.events = [];
  }

  createEventId() {
    const timestamp = Date.now();
    const randomPart = Math.random().toString(36).slice(2, 8);
    return `EVENT-${timestamp}-${randomPart}`;
  }
}

export const eventBus = new EventBus();