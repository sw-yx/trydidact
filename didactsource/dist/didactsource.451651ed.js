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
},{}],"src/dom-utils.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.updateDomProperties = updateDomProperties;
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
},{}],"src/reconciler.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.render = render;
exports.reconcile = reconcile;

var _domUtils = require("./dom-utils");

var _element = require("./element");

var _component = require("./component");

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
  } else if (instance.element.type !== element.type) {
    // Replace instance
    var _newInstance = instantiate(element);
    parentDom.replaceChild(_newInstance.dom, instance.dom);
    return _newInstance;
  } else if (typeof element.type === "string") {
    // Update dom instance
    (0, _domUtils.updateDomProperties)(instance.dom, instance.element.props, element.props);
    instance.childInstances = reconcileChildren(instance, element);
    instance.element = element;
    return instance;
  } else {
    //Update composite instance
    instance.publicInstance.props = element.props;
    var childElement = instance.publicInstance.render();
    var oldChildInstance = instance.childInstance;
    var childInstance = reconcile(parentDom, oldChildInstance, childElement);
    instance.dom = childInstance.dom;
    instance.childInstance = childInstance;
    instance.element = element;
    return instance;
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

  var isDomElement = typeof type === "string";

  if (isDomElement) {
    // Instantiate DOM element
    var isTextElement = type === _element.TEXT_ELEMENT;
    var dom = isTextElement ? document.createTextNode("") : document.createElement(type);

    (0, _domUtils.updateDomProperties)(dom, [], props);

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
  } else {
    // Instantiate component element
    var _instance = {};
    var publicInstance = (0, _component.createPublicInstance)(element, _instance);
    var childElement = publicInstance.render();
    var childInstance = instantiate(childElement);
    var _dom = childInstance.dom;

    Object.assign(_instance, { dom: _dom, element: element, childInstance: childInstance, publicInstance: publicInstance });
    return _instance;
  }
}
},{"./dom-utils":"src/dom-utils.js","./element":"src/element.js","./component":"src/component.js"}],"src/component.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Component = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

exports.createPublicInstance = createPublicInstance;

var _reconciler = require("./reconciler");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Component = exports.Component = function () {
  function Component(props) {
    _classCallCheck(this, Component);

    this.props = props;
    this.state = this.state || {};
  }

  _createClass(Component, [{
    key: "setState",
    value: function setState(partialState) {
      this.state = Object.assign({}, this.state, partialState);
      updateInstance(this.__internalInstance);
    }
  }]);

  return Component;
}();

function updateInstance(internalInstance) {
  var parentDom = internalInstance.dom.parentNode;
  var element = internalInstance.element;
  (0, _reconciler.reconcile)(parentDom, internalInstance, element);
}

function createPublicInstance(element, internalInstance) {
  var type = element.type,
      props = element.props;

  var publicInstance = new type(props);
  publicInstance.__internalInstance = internalInstance;
  return publicInstance;
}
},{"./reconciler":"src/reconciler.js"}],"src/didact.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.render = exports.Component = exports.createElement = undefined;

var _element = require("./element");

var _component = require("./component");

var _reconciler = require("./reconciler");

exports.default = {
  createElement: _element.createElement,
  Component: _component.Component,
  render: _reconciler.render
};
exports.createElement = _element.createElement;
exports.Component = _component.Component;
exports.render = _reconciler.render;
},{"./element":"src/element.js","./component":"src/component.js","./reconciler":"src/reconciler.js"}],"index.js":[function(require,module,exports) {
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _didact = require("./src/didact");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /** @jsx createElement */


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

  function App() {
    _classCallCheck(this, App);

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

  return App;
}(_didact.Component);

(0, _didact.render)((0, _didact.createElement)(App, null), document.getElementById("app"));
},{"./src/didact":"src/didact.js"}],"node_modules/parcel-bundler/src/builtins/hmr-runtime.js":[function(require,module,exports) {
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
  var ws = new WebSocket(protocol + '://' + hostname + ':' + '58974' + '/');
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