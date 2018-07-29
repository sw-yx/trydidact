import Observable from 'zen-observable'
import {fromEvent, scan, merge} from './swyxjs'
import { updateDomProperties } from "./updateProperties";
import { TEXT_ELEMENT } from "./element";
import { createPublicInstance } from "./component";

export function mount(element, container) {
  const source$ = constructStream(element)
  return scan(source$, RECONCILER_RENDERER).subscribe()
  // returns an unsubscribe method you can use to unmount
}

// // listen
// scan(
//   fromEvent(btn, 'click'),
//   (prev, cur) => {
//     document.getElementById('div2').innerText = prev + 1
//     return prev + 1
//   },
//   0
// ).subscribe(x => console.log('Clicked! ' + x));

const INITIALSOURCE = Symbol('initial source')

// traverse all children and progressively build up a stream of all sources
function constructStream(rootEl) {
  // this is the first ping of data throughout the app
  let data$ = Observable.of(INITIALSOURCE) 
  // start with null view
  let view$ = Observable.of(null) 
  traverse(source => {
    // visit each source and merge with sourceStream
    return sourceStream = merge(source, sourceStream)
  })(rootEl)
  return {data$, view$}
}

function traverse(addToStream) {
  return function traverseWithStream(element){
    const { type, props } = element;
    const isDomElement = typeof type === "string";
  
    if (isDomElement) {
      // Instantiate DOM element
      const isTextElement = type === TEXT_ELEMENT;
      const dom = isTextElement
        ? document.createTextNode("")
        : document.createElement(type);
  
      updateDomProperties(dom, [], props);
  
      const childElements = props.children || [];
      const childInstances = childElements.map(traverseWithStream); // recursion
      // const childDoms = childInstances.map(childInstance => childInstance.dom);
      // childDoms.forEach(childDom => dom.appendChild(childDom));
      const instance = { dom, element, childInstances };
      return instance;
    } else {
      // Instantiate component element
      const instance = {};
      const publicInstance = createPublicInstance(element, instance);
      const childElement = publicInstance.render();
      const childInstance = traverseWithStream(childElement);
      const dom = childInstance.dom;
  
      Object.assign(instance, { dom, element, childInstance, publicInstance });
      return instance;
    }
  }
}
