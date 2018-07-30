// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles

// eslint-disable-next-line no-global-assign
parcelRequire = (function (modules, cache, entry, globalName) {
  // Save the require from previous bundle to this closure if any
  var previousRequire = typeof parcelRequire === 'function' && parcelRequire;
  var nodeRequire = typeof require === 'function' && require;

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire = typeof parcelRequire === 'function' && parcelRequire;
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        // Try the node require function if it exists.
        if (nodeRequire && typeof name === 'string') {
          return nodeRequire(name);
        }

        var err = new Error('Cannot find module \'' + name + '\'');
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;

      var module = cache[name] = new newRequire.Module(name);

      modules[name][0].call(module.exports, localRequire, module, module.exports, this);
    }

    return cache[name].exports;

    function localRequire(x){
      return newRequire(localRequire.resolve(x));
    }

    function resolve(x){
      return modules[name][1][x] || x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;
  newRequire.register = function (id, exports) {
    modules[id] = [function (require, module) {
      module.exports = exports;
    }, {}];
  };

  for (var i = 0; i < entry.length; i++) {
    newRequire(entry[i]);
  }

  if (entry.length) {
    // Expose entry point to Node, AMD or browser globals
    // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
    var mainExports = newRequire(entry[entry.length - 1]);

    // CommonJS
    if (typeof exports === "object" && typeof module !== "undefined") {
      module.exports = mainExports;

    // RequireJS
    } else if (typeof define === "function" && define.amd) {
     define(function () {
       return mainExports;
     });

    // <script>
    } else if (globalName) {
      this[globalName] = mainExports;
    }
  }

  // Override the current require with this new one
  return newRequire;
})({"src/element.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createElement = createElement;
var TEXT_ELEMENT = exports.TEXT_ELEMENT = "TEXT ELEMENT";

function createElement(type, config) {
  var _ref;

  var props = Object.assign({}, config);

  for (var _len = arguments.length, args = Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
    args[_key - 2] = arguments[_key];
  }

  var hasChildren = args.length > 0;
  var rawChildren = hasChildren ? (_ref = []).concat.apply(_ref, args) : [];
  props.children = rawChildren.filter(function (c) {
    return c != null && c !== false;
  }).map(function (c) {
    return c instanceof Object ? c : createTextElement(c);
  });
  return { type: type, props: props };
}

function createTextElement(value) {
  return createElement(TEXT_ELEMENT, { nodeValue: value });
}
},{}],"src/reconciler.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.render = render;

var _element = require("./element");

var rootInstance = null;

function render(element, container) {
  var prevInstance = rootInstance;
  var nextInstance = reconcile(container, prevInstance, element);
  rootInstance = nextInstance;
}

function reconcile(parentDom, instance, element) {
  if (instance == null) {
    // Create instance
    var newInstance = instantiate(element);
    parentDom.appendChild(newInstance.dom);
    return newInstance;
  } else if (element == null) {
    // Remove instance
    parentDom.removeChild(instance.dom);
    return null;
  } else if (instance.element.type === element.type) {
    // Update instance
    updateDomProperties(instance.dom, instance.element.props, element.props);
    instance.childInstances = reconcileChildren(instance, element);
    instance.element = element;
    return instance;
  } else {
    // Replace instance
    var _newInstance = instantiate(element);
    parentDom.replaceChild(_newInstance.dom, instance.dom);
    return _newInstance;
  }
}

function reconcileChildren(instance, element) {
  var dom = instance.dom;
  var childInstances = instance.childInstances;
  var nextChildElements = element.props.children || [];
  var newChildInstances = [];
  var count = Math.max(childInstances.length, nextChildElements.length);
  for (var i = 0; i < count; i++) {
    var childInstance = childInstances[i];
    var childElement = nextChildElements[i];
    var newChildInstance = reconcile(dom, childInstance, childElement);
    newChildInstances.push(newChildInstance);
  }
  return newChildInstances.filter(function (instance) {
    return instance != null;
  });
}

function instantiate(element) {
  var type = element.type,
      props = element.props;

  // Create DOM element

  var isTextElement = type === "TEXT ELEMENT";
  var dom = isTextElement ? document.createTextNode("") : document.createElement(type);

  updateDomProperties(dom, [], props);

  // Instantiate and append children
  var childElements = props.children || [];
  var childInstances = childElements.map(instantiate);
  var childDoms = childInstances.map(function (childInstance) {
    return childInstance.dom;
  });
  childDoms.forEach(function (childDom) {
    return dom.appendChild(childDom);
  });

  var instance = { dom: dom, element: element, childInstances: childInstances };
  return instance;
}

function updateDomProperties(dom, prevProps, nextProps) {
  var isEvent = function isEvent(name) {
    return name.startsWith("on");
  };
  var isAttribute = function isAttribute(name) {
    return !isEvent(name) && name != "children";
  };

  // Remove event listeners
  Object.keys(prevProps).filter(isEvent).forEach(function (name) {
    var eventType = name.toLowerCase().substring(2);
    dom.removeEventListener(eventType, prevProps[name]);
  });

  // Remove attributes
  Object.keys(prevProps).filter(isAttribute).forEach(function (name) {
    dom[name] = null;
  });

  // Set attributes
  Object.keys(nextProps).filter(isAttribute).forEach(function (name) {
    dom[name] = nextProps[name];
  });

  // Add event listeners
  Object.keys(nextProps).filter(isEvent).forEach(function (name) {
    var eventType = name.toLowerCase().substring(2);
    dom.addEventListener(eventType, nextProps[name]);
  });
}
},{"./element":"src/element.js"}],"src/didact.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.render = exports.createElement = undefined;

var _element = require("./element");

var _reconciler = require("./reconciler");

exports.default = {
  createElement: _element.createElement,
  // Component,
  render: _reconciler.render
};
// import { Component } from "./component";

exports.createElement = _element.createElement;
exports.render = _reconciler.render;
},{"./element":"src/element.js","./reconciler":"src/reconciler.js"}],"node_modules/parcel-bundler/src/builtins/bundle-url.js":[function(require,module,exports) {
var bundleURL = null;
function getBundleURLCached() {
  if (!bundleURL) {
    bundleURL = getBundleURL();
  }

  return bundleURL;
}

function getBundleURL() {
  // Attempt to find the URL of the current script and use that as the base URL
  try {
    throw new Error();
  } catch (err) {
    var matches = ('' + err.stack).match(/(https?|file|ftp):\/\/[^)\n]+/g);
    if (matches) {
      return getBaseURL(matches[0]);
    }
  }

  return '/';
}

function getBaseURL(url) {
  return ('' + url).replace(/^((?:https?|file|ftp):\/\/.+)\/[^/]+$/, '$1') + '/';
}

exports.getBundleURL = getBundleURLCached;
exports.getBaseURL = getBaseURL;
},{}],"node_modules/parcel-bundler/src/builtins/css-loader.js":[function(require,module,exports) {
var bundle = require('./bundle-url');

function updateLink(link) {
  var newLink = link.cloneNode();
  newLink.onload = function () {
    link.remove();
  };
  newLink.href = link.href.split('?')[0] + '?' + Date.now();
  link.parentNode.insertBefore(newLink, link.nextSibling);
}

var cssTimeout = null;
function reloadCSS() {
  if (cssTimeout) {
    return;
  }

<<<<<<< HEAD
  cssTimeout = setTimeout(function () {
    var links = document.querySelectorAll('link[rel="stylesheet"]');
    for (var i = 0; i < links.length; i++) {
      if (bundle.getBaseURL(links[i].href) === bundle.getBundleURL()) {
        updateLink(links[i]);
      }
    }
=======
var LabeledSlider = function (_Component) {
  _inherits(LabeledSlider, _Component);

  function LabeledSlider() {
    _classCallCheck(this, LabeledSlider);

    return _possibleConstructorReturn(this, (LabeledSlider.__proto__ || Object.getPrototypeOf(LabeledSlider)).apply(this, arguments));
  }

  _createClass(LabeledSlider, [{
    key: "render",
    value: function render() {
      var _props = this.props,
          value = _props.value,
          onInput = _props.onInput;

      return (0, _didact.createElement)("input", { type: "range", onInput: onInput, min: 20, max: 80, value: value });
    }
  }]);

  return LabeledSlider;
}(_didact.Component);

var App = function (_Component2) {
  _inherits(App, _Component2);
>>>>>>> DidactObservable2

    cssTimeout = null;
  }, 50);
}

<<<<<<< HEAD
module.exports = reloadCSS;
},{"./bundle-url":"node_modules/parcel-bundler/src/builtins/bundle-url.js"}],"index.css":[function(require,module,exports) {

var reloadCSS = require('_css_loader');
module.hot.dispose(reloadCSS);
module.hot.accept(reloadCSS);
},{"_css_loader":"node_modules/parcel-bundler/src/builtins/css-loader.js"}],"index.js":[function(require,module,exports) {
"use strict";

var _didact = require("./src/didact");
=======
    var _this2 = _possibleConstructorReturn(this, (App.__proto__ || Object.getPrototypeOf(App)).call(this));

    _this2.state = { value: '40' };
    return _this2;
  }

  _createClass(App, [{
    key: "onInput",
    value: function onInput(e) {
      this.setState({ value: e.target.value });
    }
  }, {
    key: "render",
    value: function render() {
      var value = this.state.value;

      console.log({ value: value });
      return (0, _didact.createElement)(
        "div",
        null,
        (0, _didact.createElement)(LabeledSlider, { onInput: this.onInput.bind(this), value: value }),
        value
      );
    }
  }]);
>>>>>>> DidactObservable2

require("./index.css");

// // this is cyclejs https://jsbin.com/yojoho/embed?js,output
/** @jsx createElement */
var state = 50;
var appElement = function appElement() {
  return (0, _didact.createElement)(
    "div",
    null,
    LabeledSlider(),
    (0, _didact.createElement)(
      "div",
      null,
      state
    )
  );
};
function LabeledSlider() {
  return (0, _didact.createElement)("input", { type: "range", min: 20, max: 80, value: state,
    onInput: function onInput(e) {
      state = e.target.value;
      (0, _didact.render)(appElement(), document.getElementById("app"));
    } });
}

// //  this is didact

// const randomLikes = () => Math.ceil(Math.random() * 100);

// const stories = [
//   {
//     name: "Didact introduction",
//     likes: randomLikes()
//   },
//   {
//     name: "Rendering DOM elements ",
//     likes: randomLikes()
//   },
//   {
//     name: "Element creation and JSX",
//     likes: randomLikes()
//   },
//   {
//     name: "Instances and reconciliation",
//     likes: randomLikes()
//   },
//   {
//     name: "Components and state",
//     likes: randomLikes()
//   }
// ];

// const appElement = () => <div><ul>{stories.map(storyElement)}</ul></div>;

// function storyElement(story) {
//   return (
//     <li>
//       <button onClick={e => handleClick(story)}>{story.likes}<b>❤️</b></button>
//       {story.name}
//     </li>
//   );
// }

// function handleClick(story) {
//   story.likes += 1;
//   render(appElement(), document.getElementById("app"));
// }

(0, _didact.render)(appElement(), document.getElementById("app"));

// class App extends Component {
//   constructor() {
//     super();
//     this.state = { test: 123 };
//   }
//   click() {
//     this.setState({ test: this.state.test + 1 });
//   }
//   render() {
//     return (
//       <div>
//         {" "}
//         hello boop, this is didact.js {this.state.test} running in parcel{" "}
//         <button onClick={this.click.bind(this)}>test </button>
//       </div>
//     );
//   }
// }

// render(<App />, document.getElementById("app"));
},{"./src/didact":"src/didact.js","./index.css":"index.css"}],"node_modules/parcel-bundler/src/builtins/hmr-runtime.js":[function(require,module,exports) {
var global = arguments[3];
var OVERLAY_ID = '__parcel__error__overlay__';

var OldModule = module.bundle.Module;

function Module(moduleName) {
  OldModule.call(this, moduleName);
  this.hot = {
    data: module.bundle.hotData,
    _acceptCallbacks: [],
    _disposeCallbacks: [],
    accept: function (fn) {
      this._acceptCallbacks.push(fn || function () {});
    },
    dispose: function (fn) {
      this._disposeCallbacks.push(fn);
    }
  };

  module.bundle.hotData = null;
}

module.bundle.Module = Module;

var parent = module.bundle.parent;
if ((!parent || !parent.isParcelRequire) && typeof WebSocket !== 'undefined') {
  var hostname = '' || location.hostname;
  var protocol = location.protocol === 'https:' ? 'wss' : 'ws';
<<<<<<< HEAD
  var ws = new WebSocket(protocol + '://' + hostname + ':' + '59046' + '/');
=======
  var ws = new WebSocket(protocol + '://' + hostname + ':' + '58974' + '/');
>>>>>>> DidactObservable2
  ws.onmessage = function (event) {
    var data = JSON.parse(event.data);

    if (data.type === 'update') {
      console.clear();

      data.assets.forEach(function (asset) {
        hmrApply(global.parcelRequire, asset);
      });

      data.assets.forEach(function (asset) {
        if (!asset.isNew) {
          hmrAccept(global.parcelRequire, asset.id);
        }
      });
    }

    if (data.type === 'reload') {
      ws.close();
      ws.onclose = function () {
        location.reload();
      };
    }

    if (data.type === 'error-resolved') {
      console.log('[parcel] ✨ Error resolved');

      removeErrorOverlay();
    }

    if (data.type === 'error') {
      console.error('[parcel] 🚨  ' + data.error.message + '\n' + data.error.stack);

      removeErrorOverlay();

      var overlay = createErrorOverlay(data);
      document.body.appendChild(overlay);
    }
  };
}

function removeErrorOverlay() {
  var overlay = document.getElementById(OVERLAY_ID);
  if (overlay) {
    overlay.remove();
  }
}

function createErrorOverlay(data) {
  var overlay = document.createElement('div');
  overlay.id = OVERLAY_ID;

  // html encode message and stack trace
  var message = document.createElement('div');
  var stackTrace = document.createElement('pre');
  message.innerText = data.error.message;
  stackTrace.innerText = data.error.stack;

  overlay.innerHTML = '<div style="background: black; font-size: 16px; color: white; position: fixed; height: 100%; width: 100%; top: 0px; left: 0px; padding: 30px; opacity: 0.85; font-family: Menlo, Consolas, monospace; z-index: 9999;">' + '<span style="background: red; padding: 2px 4px; border-radius: 2px;">ERROR</span>' + '<span style="top: 2px; margin-left: 5px; position: relative;">🚨</span>' + '<div style="font-size: 18px; font-weight: bold; margin-top: 20px;">' + message.innerHTML + '</div>' + '<pre>' + stackTrace.innerHTML + '</pre>' + '</div>';

  return overlay;
}

function getParents(bundle, id) {
  var modules = bundle.modules;
  if (!modules) {
    return [];
  }

  var parents = [];
  var k, d, dep;

  for (k in modules) {
    for (d in modules[k][1]) {
      dep = modules[k][1][d];
      if (dep === id || Array.isArray(dep) && dep[dep.length - 1] === id) {
        parents.push(k);
      }
    }
  }

  if (bundle.parent) {
    parents = parents.concat(getParents(bundle.parent, id));
  }

  return parents;
}

function hmrApply(bundle, asset) {
  var modules = bundle.modules;
  if (!modules) {
    return;
  }

  if (modules[asset.id] || !bundle.parent) {
    var fn = new Function('require', 'module', 'exports', asset.generated.js);
    asset.isNew = !modules[asset.id];
    modules[asset.id] = [fn, asset.deps];
  } else if (bundle.parent) {
    hmrApply(bundle.parent, asset);
  }
}

function hmrAccept(bundle, id) {
  var modules = bundle.modules;
  if (!modules) {
    return;
  }

  if (!modules[id] && bundle.parent) {
    return hmrAccept(bundle.parent, id);
  }

  var cached = bundle.cache[id];
  bundle.hotData = {};
  if (cached) {
    cached.hot.data = bundle.hotData;
  }

  if (cached && cached.hot && cached.hot._disposeCallbacks.length) {
    cached.hot._disposeCallbacks.forEach(function (cb) {
      cb(bundle.hotData);
    });
  }

  delete bundle.cache[id];
  bundle(id);

  cached = bundle.cache[id];
  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    cached.hot._acceptCallbacks.forEach(function (cb) {
      cb();
    });
    return true;
  }

  return getParents(global.parcelRequire, id).some(function (id) {
    return hmrAccept(global.parcelRequire, id);
  });
}
},{}]},{},["node_modules/parcel-bundler/src/builtins/hmr-runtime.js","index.js"], null)
//# sourceMappingURL=/didactsource.451651ed.map