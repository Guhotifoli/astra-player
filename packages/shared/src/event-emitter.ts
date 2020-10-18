import { EventKey, ListenerList, ParamType, Listener } from './util-types';

const $listenersMap = Symbol('$listenersMap');

export class EventEmitter<T> {
  [$listenersMap]: { [K in EventKey<T>]?: ListenerList<T, K> };

  constructor() {
    this[$listenersMap] = {};
  }

  emit<K extends EventKey<T>>(
    eventType: K,
    ...args: ParamType<T[K]>
  ): EventEmitter<T> {
    const listenerList = this[$listenersMap][eventType];

    setTimeout(() => {
      if (listenerList) {
        listenerList.forEach((listener) => listener.apply(this, args));
      }
    }, 0);

    return this;
  }

  on<K extends EventKey<T>>(
    eventType: K,
    listener: Listener<T, K>
  ): EventEmitter<T> {
    return this.addListener(eventType, listener);
  }

  once<K extends EventKey<T>>(
    eventType: K,
    listener: Listener<T, K>
  ): EventEmitter<T> {
    const onceListener = (...args: ParamType<T[K]>) => {
      listener.apply(this, args);
      this.off(eventType, onceListener);
    };
    return this.addListener(eventType, onceListener);
  }

  addListener<K extends EventKey<T>>(
    eventType: K,
    listener: Listener<T, K>
  ): EventEmitter<T> {
    if (this[$listenersMap].hasOwnProperty(eventType)) {
      (this[$listenersMap][eventType] as ListenerList<T, K>).push(listener);
    } else {
      (this[$listenersMap][eventType] as ListenerList<T, K>) = [listener];
    }

    return this;
  }

  off<K extends EventKey<T>>(
    eventType: K,
    listener?: Listener<T, K>
  ): EventEmitter<T> {
    return this.removeListener(eventType, listener);
  }

  removeListener<K extends EventKey<T>>(
    eventType: K | '*',
    listener?: Listener<T, K>
  ): EventEmitter<T> {
    if (eventType === '*') return this.removeAllListener();

    const listenerList = this[$listenersMap][eventType];

    if (listenerList) {
      if (!listener) {
        delete this[$listenersMap][eventType];
      } else {
        this[$listenersMap][eventType] = listenerList.filter(
          (fn) => fn !== listener
        );
      }
    }

    return this;
  }

  removeAllListener<K extends EventKey<T>>(): EventEmitter<T> {
    if (!this[$listenersMap]) return this;

    Object.keys(this[$listenersMap]).forEach((eventKey) => {
      this.removeListener(eventKey as K);
    });

    return this;
  }
}
