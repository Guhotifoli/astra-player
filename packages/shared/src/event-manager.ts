const $listenersMap = Symbol('$listenersMap');
import { NullableProp } from '@astra-player/shared';

// inspired by https://stackoverflow.com/a/62010854
type DOMEventMapDefinitions = [
  [HTMLElement, HTMLElementEventMap],
  [Document, DocumentEventMap],
  [Window, WindowEventMap],
  [FileReader, FileReaderEventMap],
  [Element, ElementEventMap],
  [Animation, AnimationEventMap],
  [EventSource, EventSourceEventMap],
  [AbortSignal, AbortSignalEventMap],
  [AbstractWorker, AbstractWorkerEventMap]
  // ...
];

type DOMEventSubscriber = DOMEventMapDefinitions[number][0];

type MapDefinitionToEventMap<D extends { [K: number]: any[] }, T> = {
  [K in keyof D]: D[K] extends any[]
    ? T extends D[K][0]
      ? D[K][1]
      : never
    : never;
};
type GetDOMEventMaps<T extends DOMEventSubscriber> = MapDefinitionToEventMap<
  DOMEventMapDefinitions,
  T
>;

type MapEventMapsToKeys<D extends { [K: number]: any }> = {
  [K in keyof D]: D[K] extends never ? never : keyof D[K];
};
type MapEventMapsToEvent<
  D extends { [K: number]: any },
  T extends PropertyKey
> = {
  [K in keyof D]: D[K] extends never
    ? never
    : T extends keyof D[K]
    ? D[K][T]
    : never;
};

class Binding<
  T extends DOMEventSubscriber,
  K extends MapEventMapsToKeys<GetDOMEventMaps<T>>[number] & string
> {
  target: NullableProp<T>;
  eventType: NullableProp<K>;
  listener: NullableProp<
    (ev: MapEventMapsToEvent<GetDOMEventMaps<T>, K>[number]) => any
  >;

  constructor(
    target: T,
    eventType: K,
    listener: (ev: MapEventMapsToEvent<GetDOMEventMaps<T>, K>[number]) => any
  ) {
    this.target = target;
    this.eventType = eventType;
    this.listener = listener;

    this.target.addEventListener(eventType, listener as () => any);
  }

  removeEventListener() {
    if (this.target && this.eventType) {
      this.target.removeEventListener(
        this.eventType,
        this.listener as () => any
      );

      this.target = null;
      this.listener = null;
    }
  }
}

export class EventManager {
  [$listenersMap]: { [K in string]: Binding<any, any>[] };

  constructor() {
    this[$listenersMap] = {};
  }

  on<
    T extends DOMEventSubscriber,
    K extends MapEventMapsToKeys<GetDOMEventMaps<T>>[number] & string
  >(
    target: T,
    eventType: K,
    listener: (ev: MapEventMapsToEvent<GetDOMEventMaps<T>, K>[number]) => any
  ) {
    if (!this[$listenersMap]) {
      return;
    }

    const binding = new Binding(target, eventType, listener);

    if (this[$listenersMap].hasOwnProperty(eventType)) {
      this[$listenersMap][eventType].push(binding);
    } else {
      this[$listenersMap][eventType] = [binding];
    }
  }

  once<
    T extends DOMEventSubscriber,
    K extends MapEventMapsToKeys<GetDOMEventMaps<T>>[number] & string
  >(
    target: T,
    eventType: K,
    listener: (ev: MapEventMapsToEvent<GetDOMEventMaps<T>, K>[number]) => any
  ) {
    const onceListener = (
      event: MapEventMapsToEvent<GetDOMEventMaps<T>, K>[number]
    ) => {
      this.off(target, eventType, onceListener);
      listener(event);
    };
    this.on(target, eventType, onceListener);
  }

  off<
    T extends DOMEventSubscriber,
    K extends MapEventMapsToKeys<GetDOMEventMaps<T>>[number] & string
  >(target: T, eventType: K, listener?: Function) {
    if (!this[$listenersMap]) {
      return;
    }

    const bindingList = this[$listenersMap][eventType] || [];

    for (const binding of bindingList) {
      if (target === binding.target) {
        if (listener === binding.listener || !listener) {
          binding.removeEventListener();
          this[$listenersMap][eventType] = bindingList.filter(
            (fn) => fn.listener !== listener
          );
        }
      }
    }
  }

  release() {
    if (this[$listenersMap]) return;

    Object.values(this[$listenersMap]).forEach((bindings) => {
      for (const binding of bindings) {
        this.off(binding.target, binding.eventType);
      }
    });

    this[$listenersMap] = {};
  }
}
