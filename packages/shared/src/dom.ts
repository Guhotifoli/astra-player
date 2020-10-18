import { is } from './is';
import { swap } from './object';

function createElement(
  elementTagName: string,
  attributes?: Record<string, string>,
  innerText?: string
): HTMLElement {
  const element_ = document.createElement(elementTagName);

  if (is.isObject(attributes)) {
    for (const attr in attributes) {
      element_.setAttribute(attr, attributes[attr]);
    }
  }

  if (is.isString(innerText)) {
    element_.innerText = innerText;
  }

  return element_;
}

function createButton(
  attributes?: Record<string, string>,
  innerText?: string
): HTMLButtonElement {
  return createElement(
    'button',
    { class: 'astra-player-button', ...attributes },
    innerText
  ) as HTMLButtonElement;
}

function createPanel(
  attributes?: Record<string, string>,
  innerText?: string
): HTMLDivElement {
  return createElement(
    'div',
    { class: 'astra-player-panel', ...attributes },
    innerText
  ) as HTMLDivElement;
}

function createSlide(
  attributes?: Record<string, string>,
  innerText?: string
): HTMLDivElement {
  return createElement(
    'div',
    { class: 'astra-player-slide', ...attributes },
    innerText
  ) as HTMLDivElement;
}

function createCanvas(
  attributes?: Record<string, string>,
  innerText?: string
): HTMLCanvasElement {
  return createElement(
    'canvas',
    { class: 'astra-player-canvas', ...attributes },
    innerText
  ) as HTMLCanvasElement;
}

function createSVG<K extends keyof SVGElementTagNameMap>(
  tagName: K,
  attributes?: Record<string, string>
): SVGElementTagNameMap[K] {
  const element_ = document.createElementNS(
    'http://www.w3.org/2000/svg',
    tagName
  );

  if (is.isObject(attributes)) {
    for (const attr in attributes) {
      element_.setAttribute(attr, attributes[attr]);
    }
  }

  return element_;
}

function removeAllChildren(element: HTMLElement) {
  while (element.firstChild) {
    element.removeChild(element.firstChild);
  }
}

function toggleAriaLabel(
  el: HTMLElement,
  flag: boolean,
  label: string,
  vls: [string, string]
) {
  const slicevls = vls.slice();
  !flag && swap(slicevls);
  el.setAttribute(label, vls[1]);
}

function toggleTwoClass({
  el,
  flag,
  cls,
}: {
  el: HTMLElement;
  flag: boolean;
  cls: string[];
}) {
  const [first, second] = flag ? cls.slice() : swap(cls.slice());
  DOM.removeClass(el, first), DOM.addClass(el, second);
}

function toggleClass(element: HTMLElement, className: string) {
  element.classList.toggle(className);
}

function addClass(element: HTMLElement, className: string) {
  element.classList.add(className);
}

function removeClass(element: HTMLElement, className: string) {
  element.classList.remove(className);
}

function hasClass(element: HTMLElement, className: string) {
  return element.classList.contains(className);
}

export const DOM = {
  createElement,
  createButton,
  createPanel,
  createSlide,
  createCanvas,
  createSVG,
  toggleAriaLabel,
  toggleTwoClass,
  toggleClass,
  addClass,
  removeClass,
  hasClass,
  removeAllChildren,
};
