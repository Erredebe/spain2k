import type { DomainEventHandler, DomainEventMap, DomainEventName } from './events';

export class EventBus {
  private readonly handlers = new Map<DomainEventName, Set<(payload: unknown) => void>>();

  on<K extends DomainEventName>(eventName: K, handler: DomainEventHandler<K>): () => void {
    if (!this.handlers.has(eventName)) {
      this.handlers.set(eventName, new Set());
    }
    this.handlers.get(eventName)?.add(handler as (payload: unknown) => void);
    return () => {
      this.handlers.get(eventName)?.delete(handler as (payload: unknown) => void);
    };
  }

  emit<K extends DomainEventName>(eventName: K, payload: DomainEventMap[K]): void {
    this.handlers.get(eventName)?.forEach((handler) => {
      handler(payload);
    });
  }

  clear(): void {
    this.handlers.forEach((value) => value.clear());
  }
}
