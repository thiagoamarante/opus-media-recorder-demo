/**
 * Private data for event wrappers.
 * @type {WeakMap<Event, PrivateData>}
 * @private
 */
const privateData = new WeakMap();

/**
 * Cache for wrapper classes.
 * @type {WeakMap<Object, Function>}
 * @private
 */
const wrappers = new WeakMap();

/**
 * Get private data.
 * @param {Event} event The event object to get private data.
 * @returns {PrivateData} The private data of the event.
 * @private
 */
function pd(event) {
    const retv = privateData.get(event);
    console.assert(retv != null, "'this' is expected an Event object, but got", event);
    return retv
}

/**
 * @see https://dom.spec.whatwg.org/#interface-event
 * @private
 */
/**
 * The event wrapper.
 * @constructor
 * @param {EventTarget} eventTarget The event target of this dispatching.
 * @param {EventWrapper|{type:string}} event The original event to wrap.
 */
function EventWrapper(eventTarget, event) {
    privateData.set(this, {
        eventTarget,
        event,
        eventPhase: 2,
        currentTarget: eventTarget,
        canceled: false,
        stopped: false,
        passiveListener: null,
        timeStamp: event.timeStamp || Date.now(),
    });

    // https://heycam.github.io/webidl/#Unforgeable
    Object.defineProperty(this, "isTrusted", { value: false, enumerable: true });

    // Define accessors
    const keys = Object.keys(event);
    for (let i = 0; i < keys.length; ++i) {
        const key = keys[i];
        if (!(key in this)) {
            Object.defineProperty(this, key, defineRedirectDescriptor(key));
        }
    }
}

// Should be enumerable, but class methods are not enumerable.
EventWrapper.prototype = {
    /**
     * The type of this event.
     * @type {string}
     */
    get type() {
        return pd(this).event.type
    },

    /**
     * The target of this event.
     * @type {EventTarget}
     */
    get target() {
        return pd(this).eventTarget
    },

    /**
     * The target of this event.
     * @type {EventTarget}
     */
    get currentTarget() {
        return pd(this).currentTarget
    },

    /**
     * @returns {EventTarget[]} The composed path of this event.
     */
    composedPath() {
        const currentTarget = pd(this).currentTarget;
        if (currentTarget == null) {
            return []
        }
        return [currentTarget]
    },

    /**
     * Constant of NONE.
     * @type {number}
     */
    get NONE() {
        return 0
    },

    /**
     * Constant of CAPTURING_PHASE.
     * @type {number}
     */
    get CAPTURING_PHASE() {
        return 1
    },

    /**
     * Constant of AT_TARGET.
     * @type {number}
     */
    get AT_TARGET() {
        return 2
    },

    /**
     * Constant of BUBBLING_PHASE.
     * @type {number}
     */
    get BUBBLING_PHASE() {
        return 3
    },

    /**
     * The target of this event.
     * @type {number}
     */
    get eventPhase() {
        return pd(this).eventPhase
    },

    /**
     * Stop event bubbling.
     * @returns {void}
     */
    stopPropagation() {
        const data = pd(this);
        if (typeof data.event.stopPropagation === "function") {
            data.event.stopPropagation();
        }
    },

    /**
     * Stop event bubbling.
     * @returns {void}
     */
    stopImmediatePropagation() {
        const data = pd(this);

        data.stopped = true;
        if (typeof data.event.stopImmediatePropagation === "function") {
            data.event.stopImmediatePropagation();
        }
    },

    /**
     * The flag to be bubbling.
     * @type {boolean}
     */
    get bubbles() {
        return Boolean(pd(this).event.bubbles)
    },

    /**
     * The flag to be cancelable.
     * @type {boolean}
     */
    get cancelable() {
        return Boolean(pd(this).event.cancelable)
    },

    /**
     * Cancel this event.
     * @returns {void}
     */
    preventDefault() {
        const data = pd(this);
        if (data.passiveListener != null) {
            console.warn("EventWrapper#preventDefault() was called from a passive listener:", data.passiveListener);
            return
        }
        if (!data.event.cancelable) {
            return
        }

        data.canceled = true;
        if (typeof data.event.preventDefault === "function") {
            data.event.preventDefault();
        }
    },

    /**
     * The flag to indicate cancellation state.
     * @type {boolean}
     */
    get defaultPrevented() {
        return pd(this).canceled
    },

    /**
     * The flag to be composed.
     * @type {boolean}
     */
    get composed() {
        return Boolean(pd(this).event.composed)
    },

    /**
     * The unix time of this event.
     * @type {number}
     */
    get timeStamp() {
        return pd(this).timeStamp
    },
};

// `constructor` is not enumerable.
Object.defineProperty(EventWrapper.prototype, "constructor", { value: EventWrapper, configurable: true, writable: true });

// Ensure `event instanceof window.EventWrapper` is `true`.
if (typeof window !== "undefined" && typeof window.Event !== "undefined") {
    Object.setPrototypeOf(EventWrapper.prototype, window.Event.prototype);

    // Make association for wrappers.
    wrappers.set(window.Event.prototype, EventWrapper);
}

/**
 * Get the property descriptor to redirect a given property.
 * @param {string} key Property name to define property descriptor.
 * @returns {PropertyDescriptor} The property descriptor to redirect the property.
 * @private
 */
function defineRedirectDescriptor(key) {
    return {
        get() {
            return pd(this).event[key]
        },
        set(value) {
            pd(this).event[key] = value;
        },
        configurable: true,
        enumerable: true,
    }
}

/**
 * Get the property descriptor to call a given method property.
 * @param {string} key Property name to define property descriptor.
 * @returns {PropertyDescriptor} The property descriptor to call the method property.
 * @private
 */
function defineCallDescriptor(key) {
    return {
        value() {
            const event = pd(this).event;
            return event[key].apply(event, arguments)
        },
        configurable: true,
        enumerable: true,
    }
}

/**
 * Define new wrapper class.
 * @param {Function} BaseEvent The base wrapper class.
 * @param {Object} proto The prototype of the original event.
 * @returns {Function} The defined wrapper class.
 * @private
 */
function defineWrapper(BaseEvent, proto) {
    const keys = Object.keys(proto);
    if (keys.length === 0) {
        return BaseEvent
    }

    /** CustomEvent */
    function CustomEvent(eventTarget, event) {
        BaseEvent.call(this, eventTarget, event);
    }

    CustomEvent.prototype = Object.create(BaseEvent.prototype, {
        constructor: { value: CustomEvent, configurable: true, writable: true },
    });

    // Define accessors.
    for (let i = 0; i < keys.length; ++i) {
        const key = keys[i];
        if (!(key in BaseEvent.prototype)) {
            const descriptor = Object.getOwnPropertyDescriptor(proto, key);
            const isFunc = (typeof descriptor.value === "function");
            Object.defineProperty(
                CustomEvent.prototype,
                key,
                isFunc ? defineCallDescriptor(key) : defineRedirectDescriptor(key)
            );
        }
    }

    return CustomEvent
}

/**
 * Get the wrapper class of a given prototype.
 * @param {Object} proto The prototype of the original event to get its wrapper.
 * @returns {Function} The wrapper class.
 * @private
 */
function getWrapper(proto) {
    if (proto == null || proto === Object.prototype) {
        return EventWrapper
    }

    let wrapper = wrappers.get(proto);
    if (wrapper == null) {
        wrapper = defineWrapper(getWrapper(Object.getPrototypeOf(proto)), proto);
        wrappers.set(proto, wrapper);
    }
    return wrapper
}

/**
 * Wrap a given event to management a dispatching.
 * @param {EventTarget} eventTarget The event target of this dispatching.
 * @param {Object} event The event to wrap.
 * @returns {EventWrapper} The wrapper instance.
 * @private
 */
function wrapEvent(eventTarget, event) {
    const Wrapper = getWrapper(Object.getPrototypeOf(event));
    return new Wrapper(eventTarget, event)
}

/**
 * Get the stopped flag of a given event.
 * @param {Event} event The event to get.
 * @returns {boolean} The flag to stop propagation immediately.
 * @private
 */
function isStopped(event) {
    return pd(event).stopped
}

/**
 * Set the current event phase of a given event.
 * @param {Event} event The event to set current target.
 * @param {number} eventPhase New event phase.
 * @returns {void}
 * @private
 */
function setEventPhase(event, eventPhase) {
    pd(event).eventPhase = eventPhase;
}

/**
 * Set the current target of a given event.
 * @param {Event} event The event to set current target.
 * @param {EventTarget|null} currentTarget New current target.
 * @returns {void}
 * @private
 */
function setCurrentTarget(event, currentTarget) {
    pd(event).currentTarget = currentTarget;
}

/**
 * Set a passive listener of a given event.
 * @param {Event} event The event to set current target.
 * @param {Function|null} passiveListener New passive listener.
 * @returns {void}
 * @private
 */
function setPassiveListener(event, passiveListener) {
    pd(event).passiveListener = passiveListener;
}

/**
 * @typedef {object} ListenerNode
 * @property {Function} listener
 * @property {1|2|3} listenerType
 * @property {boolean} passive
 * @property {boolean} once
 * @property {ListenerNode|null} next
 * @private
 */

/**
 * @type {WeakMap<object, Map<string, ListenerNode>>}
 * @private
 */
const listenersMap = new WeakMap();

// Listener types
const CAPTURE = 1;
const BUBBLE = 2;
const ATTRIBUTE = 3;

/**
 * Check whether a given value is an object or not.
 * @param {any} x The value to check.
 * @returns {boolean} `true` if the value is an object.
 */
function isObject(x) {
    return x !== null && typeof x === "object" //eslint-disable-line no-restricted-syntax
}

/**
 * Get listeners.
 * @param {EventTarget} eventTarget The event target to get.
 * @returns {Map<string, ListenerNode>} The listeners.
 * @private
 */
function getListeners(eventTarget) {
    const listeners = listenersMap.get(eventTarget);
    if (listeners == null) {
        throw new TypeError("'this' is expected an EventTarget object, but got another value.")
    }
    return listeners
}

/**
 * Get the property descriptor for the event attribute of a given event.
 * @param {string} eventName The event name to get property descriptor.
 * @returns {PropertyDescriptor} The property descriptor.
 * @private
 */
function defineEventAttributeDescriptor(eventName) {
    return {
        get() {
            const listeners = getListeners(this);
            let node = listeners.get(eventName);
            while (node != null) {
                if (node.listenerType === ATTRIBUTE) {
                    return node.listener
                }
                node = node.next;
            }
            return null
        },

        set(listener) {
            if (typeof listener !== "function" && !isObject(listener)) {
                listener = null; // eslint-disable-line no-param-reassign
            }
            const listeners = getListeners(this);

            // Traverse to the tail while removing old value.
            let prev = null;
            let node = listeners.get(eventName);
            while (node != null) {
                if (node.listenerType === ATTRIBUTE) {
                    // Remove old value.
                    if (prev !== null) {
                        prev.next = node.next;
                    }
                    else if (node.next !== null) {
                        listeners.set(eventName, node.next);
                    }
                    else {
                        listeners.delete(eventName);
                    }
                }
                else {
                    prev = node;
                }

                node = node.next;
            }

            // Add new value.
            if (listener !== null) {
                const newNode = {
                    listener,
                    listenerType: ATTRIBUTE,
                    passive: false,
                    once: false,
                    next: null,
                };
                if (prev === null) {
                    listeners.set(eventName, newNode);
                }
                else {
                    prev.next = newNode;
                }
            }
        },
        configurable: true,
        enumerable: true,
    }
}

/**
 * Define an event attribute (e.g. `eventTarget.onclick`).
 * @param {Object} eventTargetPrototype The event target prototype to define an event attrbite.
 * @param {string} eventName The event name to define.
 * @returns {void}
 */
function defineEventAttribute(eventTargetPrototype, eventName) {
    Object.defineProperty(eventTargetPrototype, `on${eventName}`, defineEventAttributeDescriptor(eventName));
}

/**
 * Define a custom EventTarget with event attributes.
 * @param {string[]} eventNames Event names for event attributes.
 * @returns {EventTarget} The custom EventTarget.
 * @private
 */
function defineCustomEventTarget(eventNames) {
    /** CustomEventTarget */
    function CustomEventTarget() {
        EventTargetWrapper.call(this);
    }

    CustomEventTarget.prototype = Object.create(EventTargetWrapper.prototype, {
        constructor: { value: CustomEventTarget, configurable: true, writable: true },
    });

    for (let i = 0; i < eventNames.length; ++i) {
        defineEventAttribute(CustomEventTarget.prototype, eventNames[i]);
    }

    return CustomEventTarget
}

/**
 * EventTargetWrapper.
 *
 * - This is constructor if no arguments.
 * - This is a function which returns a CustomEventTarget constructor if there are arguments.
 *
 * For css:
 *
 *     class A extends EventTargetWrapper {}
 *     class B extends EventTargetWrapper("message") {}
 *     class C extends EventTargetWrapper("message", "error") {}
 *     class D extends EventTargetWrapper(["message", "error"]) {}
 */
function EventTargetWrapper() {
    /*eslint-disable consistent-return */
    if (this instanceof EventTargetWrapper) {
        listenersMap.set(this, new Map());
        return
    }
    if (arguments.length === 1 && Array.isArray(arguments[0])) {
        return defineCustomEventTarget(arguments[0])
    }
    if (arguments.length > 0) {
        const types = new Array(arguments.length);
        for (let i = 0; i < arguments.length; ++i) {
            types[i] = arguments[i];
        }
        return defineCustomEventTarget(types)
    }
    throw new TypeError("Cannot call a class as a function")
    /*eslint-enable consistent-return */
}

// Should be enumerable, but class methods are not enumerable.
EventTargetWrapper.prototype = {
    /**
     * Add a given listener to this event target.
     * @param {string} eventName The event name to add.
     * @param {Function} listener The listener to add.
     * @param {boolean|{capture?:boolean,passive?:boolean,once?:boolean}} [options] The options for this listener.
     * @returns {boolean} `true` if the listener was added actually.
     */
    addEventListener(eventName, listener, options) {
        if (listener == null) {
            return false
        }
        if (typeof listener !== "function" && !isObject(listener)) {
            throw new TypeError("'listener' should be a function or an object.")
        }

        const listeners = getListeners(this);
        const optionsIsObj = isObject(options);
        const capture = optionsIsObj ? Boolean(options.capture) : Boolean(options);
        const listenerType = (capture ? CAPTURE : BUBBLE);
        const newNode = {
            listener,
            listenerType,
            passive: optionsIsObj && Boolean(options.passive),
            once: optionsIsObj && Boolean(options.once),
            next: null,
        };

        // Set it as the first node if the first node is null.
        let node = listeners.get(eventName);
        if (node === undefined) {
            listeners.set(eventName, newNode);
            return true
        }

        // Traverse to the tail while checking duplication..
        let prev = null;
        while (node != null) {
            if (node.listener === listener && node.listenerType === listenerType) {
                // Should ignore duplication.
                return false
            }
            prev = node;
            node = node.next;
        }

        // Add it.
        prev.next = newNode;
        return true
    },

    /**
     * Remove a given listener from this event target.
     * @param {string} eventName The event name to remove.
     * @param {Function} listener The listener to remove.
     * @param {boolean|{capture?:boolean,passive?:boolean,once?:boolean}} [options] The options for this listener.
     * @returns {boolean} `true` if the listener was removed actually.
     */
    removeEventListener(eventName, listener, options) {
        if (listener == null) {
            return false
        }

        const listeners = getListeners(this);
        const capture = isObject(options) ? Boolean(options.capture) : Boolean(options);
        const listenerType = (capture ? CAPTURE : BUBBLE);

        let prev = null;
        let node = listeners.get(eventName);
        while (node != null) {
            if (node.listener === listener && node.listenerType === listenerType) {
                if (prev !== null) {
                    prev.next = node.next;
                }
                else if (node.next !== null) {
                    listeners.set(eventName, node.next);
                }
                else {
                    listeners.delete(eventName);
                }
                return true
            }

            prev = node;
            node = node.next;
        }

        return false
    },

    /**
     * Dispatch a given event.
     * @param {Event|{type:string}} event The event to dispatch.
     * @returns {boolean} `false` if canceled.
     */
    dispatchEvent(event) { //eslint-disable-line complexity
        if (event == null || typeof event.type !== "string") {
            throw new TypeError("\"event.type\" should be a string.")
        }

        // If listeners aren't registered, terminate.
        const listeners = getListeners(this);
        const eventName = event.type;
        let node = listeners.get(eventName);
        if (node == null) {
            return true
        }

        // Since we cannot rewrite several properties, so wrap object.
        const wrappedEvent = wrapEvent(this, event);

        // This doesn't process capturing phase and bubbling phase.
        // This isn't participating in a tree.
        let prev = null;
        while (node != null) {
            // Remove this listener if it's once
            if (node.once) {
                if (prev !== null) {
                    prev.next = node.next;
                }
                else if (node.next !== null) {
                    listeners.set(eventName, node.next);
                }
                else {
                    listeners.delete(eventName);
                }
            }
            else {
                prev = node;
            }

            // Call this listener
            setPassiveListener(wrappedEvent, (node.passive ? node.listener : null));
            if (typeof node.listener === "function") {
                try {
                    node.listener.call(this, wrappedEvent);
                }
                catch (err) {
                    /*eslint-disable no-console */
                    if (typeof console !== "undefined" && typeof console.error === "function") {
                        console.error(err);
                    }
                    /*eslint-enable no-console */
                }
            }
            else if (node.listenerType !== ATTRIBUTE && typeof node.listener.handleEvent === "function") {
                node.listener.handleEvent(wrappedEvent);
            }

            // Break if `event.stopImmediatePropagation` was called.
            if (isStopped(wrappedEvent)) {
                break
            }

            node = node.next;
        }
        setPassiveListener(wrappedEvent, null);
        setEventPhase(wrappedEvent, 0);
        setCurrentTarget(wrappedEvent, null);

        return !wrappedEvent.defaultPrevented
    },
};

// `constructor` is not enumerable.
Object.defineProperty(EventTargetWrapper.prototype, "constructor", { value: EventTargetWrapper, configurable: true, writable: true });

// Ensure `eventTarget instanceof window.EventTarget` is `true`.
if (typeof window !== "undefined" && typeof window.EventTarget !== "undefined") {
    Object.setPrototypeOf(EventTargetWrapper.prototype, window.EventTarget.prototype);
}


var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
// Object.defineProperty(exports, "__esModule", { value: true });
var BrowserInfo = /** @class */ (function () {
    function BrowserInfo(name, version, os) {
        this.name = name;
        this.version = version;
        this.os = os;
    }

    return BrowserInfo;
}());

var NodeInfo = /** @class */ (function () {
    function NodeInfo(version) {
        this.version = version;
        this.name = 'node';
        this.os = process.platform;
    }

    return NodeInfo;
}());

var BotInfo = /** @class */ (function () {
    function BotInfo() {
        this.bot = true; // NOTE: deprecated test name instead
        this.name = 'bot';
        this.version = null;
        this.os = null;
    }

    return BotInfo;
}());

// tslint:disable-next-line:max-line-length
var SEARCHBOX_UA_REGEX = /alexa|bot|crawl(er|ing)|facebookexternalhit|feedburner|google web preview|nagios|postrank|pingdom|slurp|spider|yahoo!|yandex/;
var SEARCHBOT_OS_REGEX = /(nuhk)|(Googlebot)|(Yammybot)|(Openbot)|(Slurp)|(MSNBot)|(Ask Jeeves\/Teoma)|(ia_archiver)/;
var REQUIRED_VERSION_PARTS = 3;
var userAgentRules = [
    ['aol', /AOLShield\/([0-9\._]+)/],
    ['edge', /Edge\/([0-9\._]+)/],
    ['edge-ios', /EdgiOS\/([0-9\._]+)/],
    ['yandexbrowser', /YaBrowser\/([0-9\._]+)/],
    ['vivaldi', /Vivaldi\/([0-9\.]+)/],
    ['kakaotalk', /KAKAOTALK\s([0-9\.]+)/],
    ['samsung', /SamsungBrowser\/([0-9\.]+)/],
    ['silk', /\bSilk\/([0-9._-]+)\b/],
    ['miui', /MiuiBrowser\/([0-9\.]+)$/],
    ['beaker', /BeakerBrowser\/([0-9\.]+)/],
    ['edge-chromium', /Edg\/([0-9\.]+)/],
    [
        'chromium-webview',
        /(?!Chrom.*OPR)wv\).*Chrom(?:e|ium)\/([0-9\.]+)(:?\s|$)/,
    ],
    ['chrome', /(?!Chrom.*OPR)Chrom(?:e|ium)\/([0-9\.]+)(:?\s|$)/],
    ['phantomjs', /PhantomJS\/([0-9\.]+)(:?\s|$)/],
    ['crios', /CriOS\/([0-9\.]+)(:?\s|$)/],
    ['firefox', /Firefox\/([0-9\.]+)(?:\s|$)/],
    ['fxios', /FxiOS\/([0-9\.]+)/],
    ['opera-mini', /Opera Mini.*Version\/([0-9\.]+)/],
    ['opera', /Opera\/([0-9\.]+)(?:\s|$)/],
    ['opera', /OPR\/([0-9\.]+)(:?\s|$)/],
    ['ie', /Trident\/7\.0.*rv\:([0-9\.]+).*\).*Gecko$/],
    ['ie', /MSIE\s([0-9\.]+);.*Trident\/[4-7].0/],
    ['ie', /MSIE\s(7\.0)/],
    ['bb10', /BB10;\sTouch.*Version\/([0-9\.]+)/],
    ['android', /Android\s([0-9\.]+)/],
    ['ios', /Version\/([0-9\._]+).*Mobile.*Safari.*/],
    ['safari', /Version\/([0-9\._]+).*Safari/],
    ['facebook', /FBAV\/([0-9\.]+)/],
    ['instagram', /Instagram\s([0-9\.]+)/],
    ['ios-webview', /AppleWebKit\/([0-9\.]+).*Mobile/],
    ['ios-webview', /AppleWebKit\/([0-9\.]+).*Gecko\)$/],
    ['searchbot', SEARCHBOX_UA_REGEX],
];
var operatingSystemRules = [
    ['iOS', /iP(hone|od|ad)/],
    ['Android OS', /Android/],
    ['BlackBerry OS', /BlackBerry|BB10/],
    ['Windows Mobile', /IEMobile/],
    ['Amazon OS', /Kindle/],
    ['Windows 3.11', /Win16/],
    ['Windows 95', /(Windows 95)|(Win95)|(Windows_95)/],
    ['Windows 98', /(Windows 98)|(Win98)/],
    ['Windows 2000', /(Windows NT 5.0)|(Windows 2000)/],
    ['Windows XP', /(Windows NT 5.1)|(Windows XP)/],
    ['Windows Server 2003', /(Windows NT 5.2)/],
    ['Windows Vista', /(Windows NT 6.0)/],
    ['Windows 7', /(Windows NT 6.1)/],
    ['Windows 8', /(Windows NT 6.2)/],
    ['Windows 8.1', /(Windows NT 6.3)/],
    ['Windows 10', /(Windows NT 10.0)/],
    ['Windows ME', /Windows ME/],
    ['Open BSD', /OpenBSD/],
    ['Sun OS', /SunOS/],
    ['Chrome OS', /CrOS/],
    ['Linux', /(Linux)|(X11)/],
    ['Mac OS', /(Mac_PowerPC)|(Macintosh)/],
    ['QNX', /QNX/],
    ['BeOS', /BeOS/],
    ['OS/2', /OS\/2/],
    ['Search Bot', SEARCHBOT_OS_REGEX],
];

function detect(userAgent) {
    if (!!userAgent) {
        return parseUserAgent(userAgent);
    }
    if (typeof navigator !== 'undefined') {
        return parseUserAgent(navigator.userAgent);
    }
    return getNodeVersion();
}

function parseUserAgent(ua) {
    // opted for using reduce here rather than Array#first with a regex.test call
    // this is primarily because using the reduce we only perform the regex
    // execution once rather than once for the test and for the exec again below
    // probably something that needs to be benchmarked though
    var matchedRule = ua !== '' &&
        userAgentRules.reduce(function (matched, _a) {
            var browser = _a[0], regex = _a[1];
            if (matched) {
                return matched;
            }
            var uaMatch = regex.exec(ua);
            return !!uaMatch && [browser, uaMatch];
        }, false);
    if (!matchedRule) {
        return null;
    }
    var name = matchedRule[0], match = matchedRule[1];
    if (name === 'searchbot') {
        return new BotInfo();
    }
    var versionParts = match[1] && match[1].split(/[._]/).slice(0, 3);
    if (versionParts) {
        if (versionParts.length < REQUIRED_VERSION_PARTS) {
            versionParts = __spreadArrays(versionParts, createVersionParts(REQUIRED_VERSION_PARTS - versionParts.length));
        }
    } else {
        versionParts = [];
    }
    return new BrowserInfo(name, versionParts.join('.'), detectOS(ua));
}

function detectOS(ua) {
    for (var ii = 0, count = operatingSystemRules.length; ii < count; ii++) {
        var _a = operatingSystemRules[ii], os = _a[0], regex = _a[1];
        var match = regex.test(ua);
        if (match) {
            return os;
        }
    }
    return null;
}

function getNodeVersion() {
    var isNode = typeof process !== 'undefined' && process.version;
    return isNode ? new NodeInfo(process.version.slice(1)) : null;
}

function createVersionParts(count) {
    var output = [];
    for (var ii = 0; ii < count; ii++) {
        output.push('0');
    }
    return output;
}


const browser = detect();
const AudioContext = window.AudioContext || window.webkitAudioContext || false;
const BUFFER_SIZE = 4096;

/**
 * OpusMediaRecorder.js start
 * Reference: https://w3c.github.io/mediacapture-record/#mediarecorder-api
 * @extends EventTarget
 */
class OggOpusMediaRecorder extends EventTargetWrapper {
    /**
     * A function that returns the encoder web worker
     * @name workerFactory
     * @function
     * @returns {worker} An instance of ./encoderWorker.js web worker.
     */

    /**
     *
     * @param {MediaStream} stream - The MediaStream to be recorded. This will
     *          be the value of the stream attribute.
     * @param {options} [options] - A dictionary of options to for
     *          the UA instructing how the recording will take part.
     *          options.mimeType, if present, will become the value of mimeType
     *          attribute.
     * @param {Object} [workerOptions] This is a NON-STANDARD options to
     *          configure how to import the web worker .wasm compiled binaries
     *          used for encoding.
     * @param {number} [duration] set file recorder time
     * @param {workerFactory} [workerOptions.encoderWorkerFactory] A factory
     *          function that create a web worker instance of ./encoderWorker.js
     *          and returns it. function(){return new Worker('./encoderWorker.umd.js')}
     *          is used by default. This is NON-STANDARD.
     * @param {string} [workerOptions.OggOpusEncoderWasmPath]
     *          Path of ./OggOpusEncoder.wasm which is used for OGG Opus encoding
     *          by the encoder worker. This is NON-STANDARD.
     * @param {string} [workerOptions.WebMOpusEncoderWasmPath]
     *          Path of ./WebMOpusEncoder.wasm which is used for WebM Opus encoding
     *          by the encoder worker. This is NON-STANDARD.
     */
    constructor(stream, options = {}, workerOptions = {}, duration) {
        const {mimeType, audioBitsPerSecond, videoBitsPerSecond, bitsPerSecond} = options; // eslint-disable-line
        // NON-STANDARD options
        const {encoderWorkerFactory, OggOpusEncoderWasmPath, WebMOpusEncoderWasmPath} = workerOptions;

        super();
        // Attributes for the specification conformance. These have their own getters.
        this._stream = stream;
        this._state = 'inactive';
        this._mimeType = mimeType || 'audio/ogg';
        this._audioBitsPerSecond = audioBitsPerSecond || bitsPerSecond;
        /** @type {'inactive'|'readyToInit'|'encoding'|'closed'} */
        this.workerState = 'inactive';
        this.recordingDuration = duration || 30000;   // Auto-stop recording after specific interval using setRecordingDuration

        // Parse MIME Type
        if (!OggOpusMediaRecorder.isTypeSupported(this._mimeType)) {
            throw new TypeError('invalid arguments, a MIME Type is not supported');
        }
        switch (OggOpusMediaRecorder._parseType(this._mimeType).subtype) {
            case 'wave':
            case 'wav':
                this._mimeType = 'audio/wave';
                break;

            case 'webm':
                this._mimeType = 'audio/webm';
                break;

            case 'ogg':
                this._mimeType = 'audio/ogg';
                break;

            default:
                // Select a type depending on OS.
                switch (browser && browser.name) {
                    case 'chrome':
                        this._mimeType = 'audio/webm';
                        break;

                    case 'firefox':
                        this._mimeType = 'audio/ogg';
                        break;

                    case 'edge':
                        this._mimeType = 'audio/webm';
                        break;

                    case 'ios':
                    case 'safari':
                        this._mimeType = 'audio/wave';
                        break;

                    default:
                        this._mimeType = 'audio/webm';
                }
        }
        switch (this._mimeType) {
            case 'audio/wave':
                this._wasmPath = ''; // wasm is not used
                break;

            case 'audio/webm':
                this._wasmPath = WebMOpusEncoderWasmPath || '';
                break;

            case 'audio/ogg':
                this._wasmPath = OggOpusEncoderWasmPath || '';
                break;

            default:
                throw new Error(`Internal Error: Unexpected MIME Type: ${this._mimeType}`);
        }

        // Get current directory for worker
        let workerDir = '';
        if (document.currentScript) {
            workerDir = document.currentScript.src;
        } else if (self.location) {
            workerDir = self.location.href;
        }
        workerDir = workerDir.substr(0, workerDir.lastIndexOf('/')) + '/src/encoderWorker.js';
        // If worker function is imported via <script> tag, make it blob to get URL.
        if (typeof OggOpusMediaRecorder.encoderWorker === 'function') {
            workerDir = URL.createObjectURL(new Blob([`(${OggOpusMediaRecorder.encoderWorker})()`]));
        }

        // Spawn a encoder worker
        this._workerFactory = typeof encoderWorkerFactory === 'function'
            ? encoderWorkerFactory
            : _ => new Worker(workerDir);
        this._spawnWorker();
    }

    /**
     * The MediaStream [GETUSERMEDIA] to be recorded.
     * @return {MediaStream}
     */
    get stream() {
        return this._stream;
    }

    /**
     * The MIME type [RFC2046] that has been selected as the container for
     * recording. This entry includes all the parameters to the base
     * mimeType. The UA should be able to play back any of the MIME types
     * it supports for recording. For css, it should be able to display
     * a video recording in the HTML <video> tag. The default value for
     * this property is platform-specific.
     * @return {string}
     */
    get mimeType() {
        return this._mimeType;
    }

    /**
     * The current state of the OpusMediaRecorder object. When the OpusMediaRecorder
     * is created, the UA MUST set this attribute to inactive.
     * @return {"inactive"|"recording"|"paused"}
     */
    get state() {
        return this._state;
    }

    /**
     * The value of the Video encoding. Unsupported.
     * @return {undefined}
     */
    get videoBitsPerSecond() {
        // Video encoding is not supported
        return undefined;
    }

    /**
     * The value of the Audio encoding target bit rate that was passed to
     * the Platform (potentially truncated, rounded, etc), or the calculated one
     * if the user has specified bitsPerSecond.
     * @return {number|undefined}
     */
    get audioBitsPerSecond() {
        return this._audioBitsPerSecond;
    }

    /**
     * Initialize worker
     */
    _spawnWorker() {
        this.worker = this._workerFactory();
        this.worker.onmessage = (e) => this._onmessageFromWorker(e);
        this.worker.onerror = (e) => this._onerrorFromWorker(e);

        this._postMessageToWorker('loadEncoder',
            {
                mimeType: this._mimeType,
                wasmPath: this._wasmPath
            });
    }

    /**
     * Post message to the encoder web worker.
     * @param {"init"|"pushInputData"|"getEncodedData"|"done"} command - Type of message to send to the worker
     * @param {object} message - Payload to the worker
     */
    _postMessageToWorker(command, message = {}) {
        switch (command) {
            case 'loadEncoder':
                let {mimeType, wasmPath} = message;
                this.worker.postMessage({command, mimeType, wasmPath});
                break;

            case 'init':
                // Initialize the worker
                let {sampleRate, channelCount, bitsPerSecond} = message;
                this.worker.postMessage({command, sampleRate, channelCount, bitsPerSecond});
                this.workerState = 'encoding';

                // Start streaming
                this.source.connect(this.processor);
                this.processor.connect(this.context.destination);
                let eventToPush = new window.Event('start');
                this.dispatchEvent(eventToPush);
                break;

            case 'pushInputData':
                // Pass input audio buffer to the encoder to encode.
                // The worker MAY trigger 'encodedData'.
                let {channelBuffers, length, duration} = message;
                this.worker.postMessage({
                    command, channelBuffers, length, duration
                }, channelBuffers.map(a => a.buffer));
                break;

            case 'getEncodedData':
                // Request encoded result.
                // Expected 'encodedData' event from the worker
                this.worker.postMessage({command});
                break;

            case 'done':
                // Tell encoder finallize the job and destory itself.
                // Expected 'lastEncodedData' event from the worker.
                this.worker.postMessage({command});
                break;

            default:
                // This is an error case
                throw new Error('Internal Error: Incorrect postMessage requested.');
        }
    }

    /**
     * onmessage() callback from the worker.
     * @param {message} event - message from the worker
     */
    _onmessageFromWorker(event) {
        const {command, buffers} = event.data;
        let eventToPush;
        switch (command) {
            case 'readyToInit':
                const {sampleRate, channelCount} = this;
                this.workerState = 'readyToInit';

                // If start() is already called initialize worker
                if (this.state === 'recording') {
                    this._postMessageToWorker('init', {sampleRate, channelCount, bitsPerSecond: this.audioBitsPerSecond});
                }
                break;

            case 'encodedData':
            case 'lastEncodedData':
                let data = new Blob(buffers, {'type': this._mimeType});
                eventToPush = new window.Event('dataavailable');
                eventToPush.data = data;
                this.dispatchEvent(eventToPush);

                // Detect of stop() called before
                if (command === 'lastEncodedData') {
                    eventToPush = new window.Event('stop');
                    this.dispatchEvent(eventToPush);
                    this.workerState = 'closed';
                }
                break;

            default:
                break; // Ignore
        }
    }

    /**
     * onerror() callback from the worker.
     * @param {ErrorEvent} error - error object from the worker
     */
    _onerrorFromWorker(error) {
        // Stop stream first
        this.source.disconnect();
        this.processor.disconnect();

        this.worker.terminate();
        this.workerState = 'closed';

        // Send message to host
        let message = [
            'FileName: ' + error.filename,
            'LineNumber: ' + error.lineno,
            'Message: ' + error.message
        ].join(' - ');
        let errorToPush = new window.Event('error');
        errorToPush.name = 'UnknownError';
        errorToPush.message = message;
        this.dispatchEvent(errorToPush);
    }

    /**
     * Enable onaudioprocess() callback.
     * @param {number} timeslice - In seconds. OpusMediaRecorder should request data
     *                              from the worker every timeslice seconds.
     */
    _enableAudioProcessCallback(timeslice) {
        // pass frame buffers to the worker
        let elapsedTime = 0;
        this.processor.onaudioprocess = (e) => {
            const {inputBuffer, playbackTime} = e; // eslint-disable-line
            const {sampleRate, length, duration, numberOfChannels} = inputBuffer; // eslint-disable-line

            // Create channel buffers to pass to the worker
            const channelBuffers = new Array(numberOfChannels);
            for (let i = 0; i < numberOfChannels; i++) {
                channelBuffers[i] = inputBuffer.getChannelData(i);
            }

            // Pass data to the worker
            const message = {channelBuffers, length, duration};
            this._postMessageToWorker('pushInputData', message);

            // Calculate time
            elapsedTime += duration;
            if (elapsedTime >= timeslice) {
                this._postMessageToWorker('getEncodedData');
                elapsedTime = 0;
            }
        };
    }

    /**
     * auto-stop the recording after certain minutes.
     * @method
     * @memberof RecordRTC
     * @instance
     * @example
     * @param counter
     */
    handleRecordingDuration(counter) {
        counter = counter || 0;
        let self = this

        if (self._state === 'paused') {
            setTimeout(function() {
                self.handleRecordingDuration(counter);
            }, 1000);
            return;
        }

        if (self._state === 'stopped') {
            return;
        }

        if (counter >= self.recordingDuration) {
            self.stopRecording();
            return;
        }

        counter += 1000; // 1-second

        setTimeout(function() {
            self.handleRecordingDuration(counter);
        }, 1000);
    }

    /**
     * Begins recording media; this method can optionally be passed a timeslice
     * argument with a value in milliseconds.
     * @param {number} timeslice - If this is specified, the media will be captured
     *        in separate chunks of that duration, rather than the default behavior
     *        of recording the media in a single large chunk. In other words, an
     *        undefined value of timeslice will be understood as the largest long value.
     */
    startRecording(timeslice = Number.MAX_SAFE_INTEGER) {
        if (this.state !== 'inactive') {
            throw new Error('DOMException: INVALID_STATE_ERR, state must be inactive.');
        }
        if (timeslice < 0) {
            throw new TypeError('invalid arguments, timeslice should be 0 or higher.');
        }
        timeslice /= 1000; // Convert milliseconds to seconds

        // Check worker is closed (usually by stop()) and init.
        if (this.workerState === 'closed') {
            this._spawnWorker();
        }

        // Get channel count and sampling rate
        // channelCount: https://www.w3.org/TR/mediacapture-streams/#media-track-settings
        // sampleRate: https://developer.mozilla.org/en-US/docs/Web/API/BaseAudioContext/sampleRate
        this.context = new AudioContext();
        let tracks = this.stream.getAudioTracks();
        if (!tracks[0]) {
            throw new Error('DOMException: UnkownError, media track not found.');
        }
        this.channelCount = 2;
        this.sampleRate = this.context.sampleRate;

        /** @type {MediaStreamAudioSourceNode} */
        this.source = this.context.createMediaStreamSource(this.stream);
        /** @type {ScriptProcessorNode} */
        this.processor = this.context.createScriptProcessor(BUFFER_SIZE, this.channelCount, this.channelCount);

        // Start recording
        this._state = 'recording';
        this._enableAudioProcessCallback(timeslice);

        // If the worker is already loaded then start
        if (this.workerState === 'readyToInit') {
            const {sampleRate, channelCount} = this;
            this._postMessageToWorker('init', {sampleRate, channelCount, bitsPerSecond: this.audioBitsPerSecond});
        }

        if (this.recordingDuration) {
            this.handleRecordingDuration();
        }
    }

    /**
     * Stops recording, at which point a dataavailable event containing
     * the final Blob of saved data is fired. No more recording occurs.
     */
    stopRecording() {
        if (this.state === 'inactive') {
            throw new Error('DOMException: INVALID_STATE_ERR, state must NOT be inactive.');
        }

        // Stop stream first
        this.source.disconnect();
        this.processor.disconnect();
        this.context.close();

        // Stop event will be triggered at _onmessageFromWorker(),
        this._postMessageToWorker('done');

        this._state = 'inactive';
    }

    /**
     * Pauses the recording of media.
     */
    pauseRecording() {
        if (this.state === 'inactive') {
            throw new Error('DOMException: INVALID_STATE_ERR, state must NOT be inactive.');
        }

        // Stop stream first
        this.source.disconnect();
        this.processor.disconnect();

        let event = new window.Event('pause');
        this.dispatchEvent(event);
        this._state = 'paused';
    }

    /**
     * Resumes recording of media after having been paused.
     */
    resumeRecording() {
        if (this.state === 'inactive') {
            throw new Error('DOMException: INVALID_STATE_ERR, state must NOT be inactive.');
        }

        // Restart streaming data
        this.source.connect(this.processor);
        this.processor.connect(this.context.destination);

        let event = new window.Event('resume');
        this.dispatchEvent(event);
        this._state = 'recording';
    }

    /**
     * Requests a Blob containing the saved data received thus far (or since
     * the last time requestData() was called. After calling this method,
     * recording continues, but in a new Blob.
     */
    requestData() {
        if (this.state === 'inactive') {
            throw new Error('DOMException: INVALID_STATE_ERR, state must NOT be inactive.');
        }

        // dataavailable event will be triggerd at _onmessageFromWorker()
        this._postMessageToWorker('getEncodedData');
    }

    /**
     * Returns a Boolean value indicating if the given MIME type is supported
     * by the current user agent .
     * @param {string} typeType - A MIME Type, including parameters when needed,
     *          specifying a container and/or codec formats for recording.
     * @return {boolean}
     */
    static isTypeSupported(mimeType) {
        // See: https://w3c.github.io/mediacapture-record/#dom-mediarecorder-istypesupported

        // 1. If empty string, return true.
        if (typeof mimeType === 'string' && !mimeType) {
            return true;
        }
        try {
            var {type, subtype, codec} = OggOpusMediaRecorder._parseType(mimeType);
        } catch (error) {
            // 2. If not a valid string, return false.
            return false;
        }
        if (type !== 'audio' ||
            !(subtype === 'ogg' || subtype === 'webm' ||
                subtype === 'wave' || subtype === 'wav')) {
            // 3,4. If type and subtype are unsupported the return false.
            return false;
        }
        // 5. If codec is unsupported then return false.
        // 6. If the specified combination of all is not supported than return false.
        switch (subtype) {
            case 'ogg':
                if (codec !== 'opus' && codec) {
                    return false;
                }
                break;
            case 'webm':
                if (codec !== 'opus' && codec) {
                    return false;
                }
                break;
            case 'wave':
            case 'wav':
                if (codec) {
                    return false; // Currently only supports signed 16 bits
                }
                break;
        }
        // 7. return true.
        return true;
    }

    /**
     * Parse MIME. A helper function for isTypeSupported() and etc.
     * @param {string} mimeType - typeType - A MIME Type, including parameters when needed,
     *          specifying a container and/or codec formats for recording.
     * @return {?object} - An object with type, subtype, codec attributes
     *          if parsed correctly. null is returned if parsing failed.
     *          If mimeType is an empty string then return an object with attributes
     *          are empty strings
     */
    static _parseType(mimeType) {
        try {
            const regex = /^(\w+)\/(\w+)(;\s*codecs=(\w+))?$/;
            var [, type, subtype, , codec] = mimeType.match(regex);
        } catch (error) {
            if (typeof mimeType === 'string' && !mimeType) {
                return {type: '', subtype: '', codec: ''};
            }
            return null;
        }
        return {type, subtype, codec};
    }
}

// EventHandler attributes.
// This code is a non-standard EventTarget but required by event-target-shim.
[
    'start', // Called to handle the {@link MediaRecorder#start} event.
    'stop', // Called to handle the stop event.
    'dataavailable', /* Called to handle the dataavailable event. The Blob of
                        recorded data is contained in this event and can be
                        accessed via its data attribute. */
    'pause', // Called to handle the pause event.
    'resume', // Called to handle the resume event.
    'error' // Called to handle a MediaRecorderErrorEvent.
].forEach(name => defineEventAttribute(OggOpusMediaRecorder.prototype, name));

// MS Edge specific monkey patching:
// onaudioprocess callback cannot be triggered more than twice when postMessage
// uses the seconde transfer argument. So disable the transfer argument only in Edge.
if (browser && browser.name === 'edge') {
    (function () {
        var original = Worker.prototype.postMessage;
        Worker.prototype.postMessage = function (message, transfer = null) {
            original.apply(this, [message]);
        };
    })();
}
/**
 ************************************************* commonFunctions.js begin *****************************************
 */

/**
 * Write a string to a DataView.
 * @param {DataView} dataView - dataView object to write a string.
 * @param {*} offset - offset in bytes
 * @param {*} string - string to write
 */
function writeString(dataView, offset, string) {
    for (let i = 0; i < string.length; i++) {
        dataView.setUint8(offset + i, string.charCodeAt(i));
    }
}

/**
 * C molloc class interface
 */
class _AllocatedPointer {
    /**
     * Allocate memory
     * @param {emModule} Module - Emscripten module object
     * @param {number} size - size of allocated memory in bytes.
     * @param {boolean} isSigned
     * @param {boolean} isFloat
     */
    constructor(emModule, size, isSigned, isFloat) {
        this._size = size;
        this._module = emModule;

        switch (this._size) {
            case 1:
                this._heapArray = isSigned ? this._module.HEAP8 : this._module.HEAPU8;
                break;
            case 2:
                this._heapArray = isSigned ? this._module.HEAP16 : this._module.HEAPU16;
                break;
            case 4:
                this._heapArray = isSigned ? this._module.HEAP32 : this._module.HEAPU32;
                break;
            default:
                // Pointer is treated as buffer
                this._heapArray = this._module.HEAPU8;
        }

        if (isFloat) {
            // When floating nuber set, override setting.
            this._size = 4;
            this._heapArray = this._module.HEAPF32;
        }

        // Note that is uses the original size parameter.
        this._pointer = this._module._malloc(size);
    }

    /**
     * Free memory
     */
    free() {
        this._module._free(this.pointer);
    }

    /**
     * Get pointer (reference). The pointer is meaningless in the JS context
     * so it is only useful when calling WASM functions.
     */
    get pointer() {
        return this._pointer;
    }

    /**
     * Dereference the pointer to get a value.
     */
    get value() {
        let bitsToShift = 0;
        switch (this._size) {
            case 2:
                bitsToShift = 1;
                break;
            case 4:
                bitsToShift = 2;
                break;
            default:
                throw new Error('Pointer can be only deferenced as integer-sized');
        }
        return this._heapArray[this.pointer >> bitsToShift];
    }

    /**
     * Dereference the pointer to set a value.
     */
    set value(valueToSet) {
        let bitsToShift = 0;
        switch (this._size) {
            case 2:
                bitsToShift = 1;
                break;
            case 4:
                bitsToShift = 2;
                break;
            default:
                throw new Error('Pointer can be only deferenced as integer-sized');
        }
        this._heapArray[this.pointer >> bitsToShift] = valueToSet;
    }
}

/**
 * C malloc allocated signed int32 object
 */
class _Int32Pointer extends _AllocatedPointer {
    /**
     * Allocate and assign number
     * @param {emModule} Module - Emscripten module object
     * @param {number|undefined} value - If undefined the value is not assigned to the memory.
     */
    constructor(emModule, value) {
        super(emModule, 4, true, false);
        if (typeof value !== 'undefined') {
            this.value = value;
        }
    }
}

/**
 * C malloc allocated unsigned int32 object
 */
class _Uint32Pointer extends _AllocatedPointer {
    /**
     * Allocate and assign number
     * @param {emModule} Module - Emscripten module object
     * @param {number|undefined} value - If undefined the value is not assigned to the memory.
     */
    constructor(emModule, value) {
        super(emModule, 4, false, false);
        if (typeof value !== 'undefined') {
            this.value = value;
        }
    }
}

/**
 * C malloc allocated float buffer object
 */
class _AllocatedBuffer extends _AllocatedPointer {
    /**
     * Allocate buffer
     * @param {emModule} Module - Emscripten module object
     * @param {number} length - Size of buffer in the number of units, NOT in bytes
     * @param {number} unitSize - Size of a unit in bytes
     * @param {bool} isSigned
     * @param {bool} isFloat
     */
    constructor(emModule, length, unitSize, isSigned, isFloat) {
        super(emModule, length * unitSize, isSigned, isFloat);
        let bitsToShift = 0;
        switch (unitSize) {
            case 1:
                this._heapArray = isSigned ? this._module.HEAP8 : this._module.HEAPU8;
                bitsToShift = 0;
                break;
            case 2:
                this._heapArray = isSigned ? this._module.HEAP16 : this._module.HEAPU16;
                bitsToShift = 1;
                break;
            case 4:
                this._heapArray = isSigned ? this._module.HEAP32 : this._module.HEAPU32;
                bitsToShift = 2;
                break;
            default:
                throw new Error('Unit size must be an integer-size');
        }
        if (isFloat) {
            this._heapArray = this._module.HEAPF32;
            bitsToShift = 2;
        }
        let offset = this._pointer >> bitsToShift;
        this._buffer = this._heapArray.subarray(offset, offset + length);
        this._length = length;
    }

    set(array, offset) {
        this._buffer.set(array, offset);
    }

    subarray(begin, end) {
        return this._buffer.subarray(begin, end);
    }

    get length() {
        return this._length;
    }
}

/**
 * C malloc allocated float buffer object
 */
class _Float32Buffer extends _AllocatedBuffer {
    constructor(emModule, length) {
        super(emModule, length, 4, true, true);
    }
}

/**
 * C malloc allocated unsigned uint8 buffer object
 */
class _Uint8Buffer extends _AllocatedBuffer {
    /**
     * Allocate and assign number
     * @param {number|undefined} value - If undefined the value is not assigned to the memory.
     */
    constructor(emModule, length) {
        super(emModule, length, 1, false, false);
    }
}

/**
 * Abstracts C pointers and malloc for Emscripten modules.
 */
class EmscriptenMemoryAllocator {
    constructor(emModule) {
        this._module = emModule;
    }

    mallocInt32(value) {
        return new _Int32Pointer(this._module, value);
    }

    mallocUint32(value) {
        return new _Uint32Pointer(this._module, value);
    }

    mallocUint8Buffer(length) {
        return new _Uint8Buffer(this._module, length);
    }

    mallocFloat32Buffer(length) {
        return new _Float32Buffer(this._module, length);
    }
}

/**
 ********************************************* commonFunctions.js end ***********************************************
 ********************************************************************************************************************
 ********************************************* OggOpusEncoder.js begin **********************************************
 */
var Module = (function () {
    var _scriptDir = typeof document !== 'undefined' && document.currentScript ? document.currentScript.src : undefined;
    return (
        function (Module) {
            Module = Module || {};

            var Module = typeof Module !== "undefined" ? Module : {};
            /**
             ********************************* OpusEncoder.js start ************************************************
             *******************************************************************************************************
             */

            /*** Configuration*/
            const OPUS_APPLICATION = 2049;
            /** Defined in opus_defines.h
             *  2048: OPUS_APPLICATION_VOIP = Voice (Lower fidelity)
             *  2049: OPUS_APPLICATION_AUDIO = Full Band Audio (Highest fidelity)
             *  2051: OPUS_APPLICATION_RESTRICTED_LOWDELAY = Restricted Low Delay (Lowest latency) */
            const OPUS_OUTPUT_SAMPLE_RATE = 48000; // Desired encoding sample rate. Audio will be resampled
            const OPUS_OUTPUT_MAX_LENGTH = 4000;
            const OPUS_FRAME_SIZE = 20; // Specified in ms.
            const SPEEX_RESAMPLE_QUALITY = 6; // Value between 0 and 10 inclusive. 10 being highest quality.
            const BUFFER_LENGTH = 4096;

            /*** Constants used for libraries*/
            // in opus_defines.h
            const OPUS_OK = 0;
            const OPUS_SET_BITRATE_REQUEST = 4002;
            // in speex_resampler.h
            const RESAMPLER_ERR_SUCCESS = 0;

            class _OpusEncoder {
                constructor(inputSampleRate, channelCount, bitsPerSecond = undefined) {
                    this.config = {
                        inputSampleRate, // Usually 44100Hz or 48000Hz
                        channelCount
                    };

                    // Emscripten memory allocator
                    this.memory = new EmscriptenMemoryAllocator(Module);
                    // libopus functions imported from WASM
                    this._opus_encoder_create = Module._opus_encoder_create;
                    this._opus_encoder_ctl = Module._opus_encoder_ctl;
                    this._opus_encode_float = Module._opus_encode_float;
                    this._opus_encoder_destroy = Module._opus_encoder_destroy;
                    // SpeexDSP functions
                    this._speex_resampler_init = Module._speex_resampler_init;
                    this._speex_resampler_process_interleaved_float = Module._speex_resampler_process_interleaved_float;
                    this._speex_resampler_destroy = Module._speex_resampler_destroy;
                    // Ogg container imported using WebIDL binding
                    this._container = new Module.Container();
                    this._container.init(OPUS_OUTPUT_SAMPLE_RATE, channelCount, Math.floor(Math.random() * 0xFFFFFFFF));

                    this.OpusInitCodec(OPUS_OUTPUT_SAMPLE_RATE, channelCount, bitsPerSecond);
                    this.SpeexInitResampler(inputSampleRate, OPUS_OUTPUT_SAMPLE_RATE, channelCount);

                    this.inputSamplesPerChannel = inputSampleRate * OPUS_FRAME_SIZE / 1000;
                    this.outputSamplePerChannel = OPUS_OUTPUT_SAMPLE_RATE * OPUS_FRAME_SIZE / 1000;

                    // Initialize all buffers
                    //  |input buffer| =={reampler}=> |resampled buffer| =={encoder}=> |output buffer|
                    this.inputBufferIndex = 0;
                    this.mInputBuffer = this.memory.mallocFloat32Buffer(this.inputSamplesPerChannel * channelCount);
                    this.mResampledBuffer = this.memory.mallocFloat32Buffer(this.outputSamplePerChannel * channelCount);
                    this.mOutputBuffer = this.memory.mallocUint8Buffer(OPUS_OUTPUT_MAX_LENGTH);

                    // TODO: Figure out how to delete this thing.
                    this.interleavedBuffers = (channelCount !== 1) ? new Float32Array(BUFFER_LENGTH * channelCount) : undefined;
                }

                encode(buffers) {
                    let samples = this.interleave(buffers);
                    let sampleIndex = 0;

                    while (sampleIndex < samples.length) {
                        // Copy samples to input buffer
                        let lengthToCopy = Math.min(this.mInputBuffer.length - this.inputBufferIndex, samples.length - sampleIndex);
                        this.mInputBuffer.set(samples.subarray(sampleIndex, sampleIndex + lengthToCopy), this.inputBufferIndex);
                        this.inputBufferIndex += lengthToCopy;

                        // When mInputBuffer is fill, then encode.
                        if (this.inputBufferIndex >= this.mInputBuffer.length) {
                            // Resampling
                            let mInputLength = this.memory.mallocUint32(this.inputSamplesPerChannel);
                            let mOutputLength = this.memory.mallocUint32(this.outputSamplePerChannel);
                            let err = this._speex_resampler_process_interleaved_float(
                                this.resampler,
                                this.mInputBuffer.pointer,
                                mInputLength.pointer,
                                this.mResampledBuffer.pointer,
                                mOutputLength.pointer
                            );
                            mInputLength.free();
                            mOutputLength.free();
                            if (err !== RESAMPLER_ERR_SUCCESS) {
                                throw new Error('Resampling error.');
                            }
                            // Encoding
                            let packetLength = this._opus_encode_float(this.encoder,
                                this.mResampledBuffer.pointer,
                                this.outputSamplePerChannel,
                                this.mOutputBuffer.pointer,
                                this.mOutputBuffer.length);
                            if (packetLength < 0) {
                                throw new Error('Opus encoding error.');
                            }
                            // Input packget to Ogg or WebM page generator
                            this._container.writeFrame(this.mOutputBuffer.pointer, packetLength, this.outputSamplePerChannel); // 960 samples
                            this.inputBufferIndex = 0;
                        }
                        sampleIndex += lengthToCopy;
                    }
                }

                /**
                 * Free up memory before close the web worker.
                 */
                close() {
                    // Encode the remaining buffers first.
                    const {channelCount} = this.config;
                    // Fill zero to buffers, size is the same as re rest of inputBuffer.
                    let finalFrameBuffers = [];
                    for (let i = 0; i < channelCount; ++i) {
                        finalFrameBuffers.push(new Float32Array(BUFFER_LENGTH - (this.inputBufferIndex / channelCount)));
                    }
                    this.encode(finalFrameBuffers);

                    // By destroying the container it may emit the remaining buffer.
                    Module.destroy(this._container);
                    this.mInputBuffer.free();
                    this.mResampledBuffer.free();
                    this.mOutputBuffer.free();
                    this._opus_encoder_destroy(this.encoder);
                    this._speex_resampler_destroy(this.resampler);
                }

                /**
                 * Interleave the channel buffer.
                 * @param {Float32Array[]} channelBuffers - An array of buffers to interleave.
                 */
                interleave(channelBuffers) {
                    const chCount = channelBuffers.length;

                    // if it only has one channel, no interleave needed.
                    if (chCount === 1) {
                        return channelBuffers[0];
                    }
                    // Format: | ch0 | ch1 | ch0 | ch1 | ch0 | ch1 | ch0 | ch1 | ...
                    for (let ch = 0; ch < chCount; ch++) {
                        let buffer = channelBuffers[ch];
                        for (let i = 0; i < buffer.length; i++) {
                            this.interleavedBuffers[i * chCount + ch] = buffer[i];
                        }
                    }
                    return this.interleavedBuffers;
                }

                OpusInitCodec(outRate, chCount, bitRate = undefined) {
                    let mErr = this.memory.mallocUint32(undefined);
                    this.encoder = this._opus_encoder_create(outRate, chCount, OPUS_APPLICATION, mErr.pointer);
                    let err = mErr.value;
                    mErr.free();
                    if (err !== OPUS_OK) {
                        throw new Error('Opus encodor initialization failed.');
                    }
                    /** Configures the bitrate in the encoder.
                     * Rates from 500 to 512000 bits per second are meaningful, as well as the
                     * special values #OPUS_AUTO (-1000) and #OPUS_BITRATE_MAX (-1).
                     * The value #OPUS_BITRATE_MAX can be used to cause the codec to use as much
                     * rate as it can, which is useful for controlling the rate by adjusting the
                     * output buffer size. The default is determined based on the number of
                     * channels and the input sampling rate.
                     */
                    if (bitRate) {
                        this.OpusSetOpusControl(OPUS_SET_BITRATE_REQUEST, bitRate);
                    }
                }

                OpusSetOpusControl(request, vaArg) {
                    let value = this.memory.mallocInt32(vaArg);
                    this._opus_encoder_ctl(this.encoder, request, value.pointer);
                    value.free();
                }

                SpeexInitResampler(inputRate, outputRate, chCount) {
                    let mErr = this.memory.mallocUint32(undefined);
                    this.resampler = this._speex_resampler_init(chCount, inputRate, outputRate,
                        SPEEX_RESAMPLE_QUALITY, mErr.pointer);
                    let err = mErr.value;
                    mErr.free();
                    if (err !== RESAMPLER_ERR_SUCCESS) {
                        throw new Error('Initializing resampler failed.');
                    }
                }
            }

            /**
             * Define the encoder module interface. The worker will interact with
             * the encoder via those functions only.
             */
            Module.init = function (inputSampleRate, channelCount, bitsPerSecond) {
                Module.encodedBuffers = [];
                Module.encoder = new _OpusEncoder(inputSampleRate, channelCount, bitsPerSecond);
            };

            Module.encode = function (buffers) {
                Module.encoder.encode(buffers);
            };

            Module.flush = function () {
                return Module.encodedBuffers.splice(0, Module.encodedBuffers.length);
            };

            Module.close = function () {
                Module.encoder.close();
            };
            /**
             ********************************** OpusEncoder.js end ************************************************
             * @type {{}}
             */

            var moduleOverrides = {};
            var key;
            for (key in Module) {
                if (Module.hasOwnProperty(key)) {
                    moduleOverrides[key] = Module[key]
                }
            }
            Module["arguments"] = [];
            Module["thisProgram"] = "./this.program";
            Module["quit"] = function (status, toThrow) {
                throw toThrow
            };
            Module["preRun"] = [];
            Module["postRun"] = [];
            var ENVIRONMENT_IS_WEB = true;
            var ENVIRONMENT_IS_WORKER = false;
            var ENVIRONMENT_IS_NODE = false;
            var ENVIRONMENT_HAS_NODE = false;
            var ENVIRONMENT_IS_SHELL = false;
            ENVIRONMENT_IS_WEB = typeof window === "object";
            ENVIRONMENT_IS_WORKER = typeof importScripts === "function";
            ENVIRONMENT_HAS_NODE = typeof process === "object" && typeof require === "function";
            ENVIRONMENT_IS_NODE = ENVIRONMENT_HAS_NODE && !ENVIRONMENT_IS_WEB && !ENVIRONMENT_IS_WORKER;
            var scriptDirectory = "";

            function locateFile(path) {
                if (Module["locateFile"]) {
                    return Module["locateFile"](path, scriptDirectory)
                } else {
                    return scriptDirectory + path
                }
            }

            if (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) {
                if (ENVIRONMENT_IS_WORKER) {
                    scriptDirectory = self.location.href
                } else if (document.currentScript) {
                    scriptDirectory = document.currentScript.src
                }
                if (_scriptDir) {
                    scriptDirectory = _scriptDir
                }
                if (scriptDirectory.indexOf("blob:") !== 0) {
                    scriptDirectory = scriptDirectory.substr(0, scriptDirectory.lastIndexOf("/") + 1)
                } else {
                    scriptDirectory = ""
                }
                Module["read"] = function shell_read(url) {
                    var xhr = new XMLHttpRequest;
                    xhr.open("GET", url, false);
                    xhr.send(null);
                    return xhr.responseText
                };
                if (ENVIRONMENT_IS_WORKER) {
                    Module["readBinary"] = function readBinary(url) {
                        var xhr = new XMLHttpRequest;
                        xhr.open("GET", url, false);
                        xhr.responseType = "arraybuffer";
                        xhr.send(null);
                        return new Uint8Array(xhr.response)
                    }
                }
                Module["readAsync"] = function readAsync(url, onload, onerror) {
                    var xhr = new XMLHttpRequest;
                    xhr.open("GET", url, true);
                    xhr.responseType = "arraybuffer";
                    xhr.onload = function xhr_onload() {
                        if (xhr.status == 200 || xhr.status == 0 && xhr.response) {
                            onload(xhr.response);
                            return
                        }
                        onerror()
                    };
                    xhr.onerror = onerror;
                    xhr.send(null)
                };
                Module["setWindowTitle"] = function (title) {
                    document.title = title
                }
            } else {
            }
            var out = Module["print"] || (typeof console !== "undefined" ? console.log.bind(console) : typeof print !== "undefined" ? print : null);
            var err = Module["printErr"] || (typeof printErr !== "undefined" ? printErr : typeof console !== "undefined" && console.warn.bind(console) || out);
            for (key in moduleOverrides) {
                if (moduleOverrides.hasOwnProperty(key)) {
                    Module[key] = moduleOverrides[key]
                }
            }
            moduleOverrides = undefined;
            if (typeof WebAssembly !== "object") {
                err("no native wasm support detected")
            }
            var wasmMemory;
            var wasmTable;
            var ABORT = false;
            var EXITSTATUS = 0;

            function assert(condition, text) {
                if (!condition) {
                    abort("Assertion failed: " + text)
                }
            }

            var UTF8Decoder = typeof TextDecoder !== "undefined" ? new TextDecoder("utf8") : undefined;

            function UTF8ArrayToString(u8Array, idx, maxBytesToRead) {
                var endIdx = idx + maxBytesToRead;
                var endPtr = idx;
                while (u8Array[endPtr] && !(endPtr >= endIdx)) ++endPtr;
                if (endPtr - idx > 16 && u8Array.subarray && UTF8Decoder) {
                    return UTF8Decoder.decode(u8Array.subarray(idx, endPtr))
                } else {
                    var str = "";
                    while (idx < endPtr) {
                        var u0 = u8Array[idx++];
                        if (!(u0 & 128)) {
                            str += String.fromCharCode(u0);
                            continue
                        }
                        var u1 = u8Array[idx++] & 63;
                        if ((u0 & 224) == 192) {
                            str += String.fromCharCode((u0 & 31) << 6 | u1);
                            continue
                        }
                        var u2 = u8Array[idx++] & 63;
                        if ((u0 & 240) == 224) {
                            u0 = (u0 & 15) << 12 | u1 << 6 | u2
                        } else {
                            u0 = (u0 & 7) << 18 | u1 << 12 | u2 << 6 | u8Array[idx++] & 63
                        }
                        if (u0 < 65536) {
                            str += String.fromCharCode(u0)
                        } else {
                            var ch = u0 - 65536;
                            str += String.fromCharCode(55296 | ch >> 10, 56320 | ch & 1023)
                        }
                    }
                }
                return str
            }

            function UTF8ToString(ptr, maxBytesToRead) {
                return ptr ? UTF8ArrayToString(HEAPU8, ptr, maxBytesToRead) : ""
            }

            var UTF16Decoder = typeof TextDecoder !== "undefined" ? new TextDecoder("utf-16le") : undefined;
            var WASM_PAGE_SIZE = 65536;
            var buffer, HEAP8, HEAPU8, HEAP16, HEAPU16, HEAP32, HEAPU32, HEAPF32, HEAPF64;

            function updateGlobalBufferViews() {
                Module["HEAP8"] = HEAP8 = new Int8Array(buffer);
                Module["HEAP16"] = HEAP16 = new Int16Array(buffer);
                Module["HEAP32"] = HEAP32 = new Int32Array(buffer);
                Module["HEAPU8"] = HEAPU8 = new Uint8Array(buffer);
                Module["HEAPU16"] = HEAPU16 = new Uint16Array(buffer);
                Module["HEAPU32"] = HEAPU32 = new Uint32Array(buffer);
                Module["HEAPF32"] = HEAPF32 = new Float32Array(buffer);
                Module["HEAPF64"] = HEAPF64 = new Float64Array(buffer)
            }

            var DYNAMIC_BASE = 5283824, DYNAMICTOP_PTR = 40912;
            var TOTAL_STACK = 5242880;
            var INITIAL_TOTAL_MEMORY = Module["TOTAL_MEMORY"] || 16777216;
            if (INITIAL_TOTAL_MEMORY < TOTAL_STACK) err("TOTAL_MEMORY should be larger than TOTAL_STACK, was " + INITIAL_TOTAL_MEMORY + "! (TOTAL_STACK=" + TOTAL_STACK + ")");
            if (Module["buffer"]) {
                buffer = Module["buffer"]
            } else {
                if (typeof WebAssembly === "object" && typeof WebAssembly.Memory === "function") {
                    wasmMemory = new WebAssembly.Memory({
                        "initial": INITIAL_TOTAL_MEMORY / WASM_PAGE_SIZE,
                        "maximum": INITIAL_TOTAL_MEMORY / WASM_PAGE_SIZE
                    });
                    buffer = wasmMemory.buffer
                } else {
                    buffer = new ArrayBuffer(INITIAL_TOTAL_MEMORY)
                }
            }
            updateGlobalBufferViews();
            HEAP32[DYNAMICTOP_PTR >> 2] = DYNAMIC_BASE;

            function callRuntimeCallbacks(callbacks) {
                while (callbacks.length > 0) {
                    var callback = callbacks.shift();
                    if (typeof callback == "function") {
                        callback();
                        continue
                    }
                    var func = callback.func;
                    if (typeof func === "number") {
                        if (callback.arg === undefined) {
                            Module["dynCall_v"](func)
                        } else {
                            Module["dynCall_vi"](func, callback.arg)
                        }
                    } else {
                        func(callback.arg === undefined ? null : callback.arg)
                    }
                }
            }

            var __ATPRERUN__ = [];
            var __ATINIT__ = [];
            var __ATMAIN__ = [];
            var __ATPOSTRUN__ = [];
            var runtimeInitialized = false;

            function preRun() {
                if (Module["preRun"]) {
                    if (typeof Module["preRun"] == "function") Module["preRun"] = [Module["preRun"]];
                    while (Module["preRun"].length) {
                        addOnPreRun(Module["preRun"].shift())
                    }
                }
                callRuntimeCallbacks(__ATPRERUN__)
            }

            function ensureInitRuntime() {
                if (runtimeInitialized) return;
                runtimeInitialized = true;
                callRuntimeCallbacks(__ATINIT__)
            }

            function preMain() {
                callRuntimeCallbacks(__ATMAIN__)
            }

            function postRun() {
                if (Module["postRun"]) {
                    if (typeof Module["postRun"] == "function") Module["postRun"] = [Module["postRun"]];
                    while (Module["postRun"].length) {
                        addOnPostRun(Module["postRun"].shift())
                    }
                }
                callRuntimeCallbacks(__ATPOSTRUN__)
            }

            function addOnPreRun(cb) {
                __ATPRERUN__.unshift(cb)
            }

            function addOnPreMain(cb) {
                __ATMAIN__.unshift(cb)
            }

            function addOnPostRun(cb) {
                __ATPOSTRUN__.unshift(cb)
            }

            var Math_abs = Math.abs;
            var Math_sqrt = Math.sqrt;
            var Math_ceil = Math.ceil;
            var Math_floor = Math.floor;
            var runDependencies = 0;
            var runDependencyWatcher = null;
            var dependenciesFulfilled = null;

            function addRunDependency(id) {
                runDependencies++;
                if (Module["monitorRunDependencies"]) {
                    Module["monitorRunDependencies"](runDependencies)
                }
            }

            function removeRunDependency(id) {
                runDependencies--;
                if (Module["monitorRunDependencies"]) {
                    Module["monitorRunDependencies"](runDependencies)
                }
                if (runDependencies == 0) {
                    if (runDependencyWatcher !== null) {
                        clearInterval(runDependencyWatcher);
                        runDependencyWatcher = null
                    }
                    if (dependenciesFulfilled) {
                        var callback = dependenciesFulfilled;
                        dependenciesFulfilled = null;
                        callback()
                    }
                }
            }

            Module["preloadedImages"] = {};
            Module["preloadedAudios"] = {};
            var dataURIPrefix = "data:application/octet-stream;base64,";

            function isDataURI(filename) {
                return String.prototype.startsWith ? filename.startsWith(dataURIPrefix) : filename.indexOf(dataURIPrefix) === 0
            }

            var wasmBinaryFile = "OggOpusEncoder.wasm";
            if (!isDataURI(wasmBinaryFile)) {
                wasmBinaryFile = locateFile(wasmBinaryFile)
            }

            function getBinary() {
                try {
                    if (Module["wasmBinary"]) {
                        return new Uint8Array(Module["wasmBinary"])
                    }
                    if (Module["readBinary"]) {
                        return Module["readBinary"](wasmBinaryFile)
                    } else {
                        throw"both async and sync fetching of the wasm failed"
                    }
                } catch (err) {
                    abort(err)
                }
            }

            function getBinaryPromise() {
                if (!Module["wasmBinary"] && (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) && typeof fetch === "function") {
                    return fetch(wasmBinaryFile, {credentials: "same-origin"}).then(function (response) {
                        if (!response["ok"]) {
                            throw"failed to load wasm binary file at '" + wasmBinaryFile + "'"
                        }
                        return response["arrayBuffer"]()
                    }).catch(function () {
                        return getBinary()
                    })
                }
                return new Promise(function (resolve, reject) {
                    resolve(getBinary())
                })
            }

            function createWasm(env) {
                var info = {"env": env};

                function receiveInstance(instance, module) {
                    var exports = instance.exports;
                    Module["asm"] = exports;
                    removeRunDependency("wasm-instantiate")
                }

                addRunDependency("wasm-instantiate");

                function receiveInstantiatedSource(output) {
                    receiveInstance(output["instance"])
                }

                function instantiateArrayBuffer(receiver) {
                    return getBinaryPromise().then(function (binary) {
                        return WebAssembly.instantiate(binary, info)
                    }).then(receiver, function (reason) {
                        err("failed to asynchronously prepare wasm: " + reason);
                        abort(reason)
                    })
                }

                function instantiateAsync() {
                    if (!Module["wasmBinary"] && typeof WebAssembly.instantiateStreaming === "function" && !isDataURI(wasmBinaryFile) && typeof fetch === "function") {
                        fetch(wasmBinaryFile, {credentials: "same-origin"}).then(function (response) {
                            return WebAssembly.instantiateStreaming(response, info).then(receiveInstantiatedSource, function (reason) {
                                err("wasm streaming compile failed: " + reason);
                                err("falling back to ArrayBuffer instantiation");
                                instantiateArrayBuffer(receiveInstantiatedSource)
                            })
                        })
                    } else {
                        return instantiateArrayBuffer(receiveInstantiatedSource)
                    }
                }

                if (Module["instantiateWasm"]) {
                    try {
                        return Module["instantiateWasm"](info, receiveInstance)
                    } catch (e) {
                        err("Module.instantiateWasm callback failed with error: " + e);
                        return false
                    }
                }
                instantiateAsync();
                return {}
            }

            Module["asm"] = function (global, env, providedBuffer) {
                env["memory"] = wasmMemory;
                env["table"] = wasmTable = new WebAssembly.Table({
                    "initial": 31,
                    "maximum": 31 + 0,
                    "element": "anyfunc"
                });
                var exports = createWasm(env);
                return exports
            };

            function emscriptenPushBuffer(buf, len) {
                let array = new Uint8Array(Module.HEAPU8.buffer, buf, len);
                Module.encodedBuffers.push(new Uint8Array(array).buffer)
            }

            function ___assert_fail(condition, filename, line, func) {
                abort("Assertion failed: " + UTF8ToString(condition) + ", at: " + [filename ? UTF8ToString(filename) : "unknown filename", line, func ? UTF8ToString(func) : "unknown function"])
            }

            function ___cxa_pure_virtual() {
                ABORT = true;
                throw"Pure virtual function called!"
            }

            function _abort() {
                Module["abort"]()
            }

            var _abs = Math_abs;

            function _emscripten_get_heap_size() {
                return HEAP8.length
            }

            function _emscripten_memcpy_big(dest, src, num) {
                HEAPU8.set(HEAPU8.subarray(src, src + num), dest)
            }

            var _fabs = Math_abs;
            var _floor = Math_floor;

            function _round(d) {
                d = +d;
                return d >= +0 ? +Math_floor(d + +.5) : +Math_ceil(d - +.5)
            }

            function _rintf(f) {
                f = +f;
                return f - +Math_floor(f) != .5 ? +_round(f) : +_round(f / +2) * +2
            }

            function ___setErrNo(value) {
                if (Module["___errno_location"]) HEAP32[Module["___errno_location"]() >> 2] = value;
                return value
            }

            function abortOnCannotGrowMemory(requestedSize) {
                abort("OOM")
            }

            function _emscripten_resize_heap(requestedSize) {
                abortOnCannotGrowMemory(requestedSize)
            }

            function _sbrk(increment) {
                increment = increment | 0;
                var oldDynamicTop = 0;
                var newDynamicTop = 0;
                var totalMemory = 0;
                totalMemory = _emscripten_get_heap_size() | 0;
                oldDynamicTop = HEAP32[DYNAMICTOP_PTR >> 2] | 0;
                newDynamicTop = oldDynamicTop + increment | 0;
                if ((increment | 0) > 0 & (newDynamicTop | 0) < (oldDynamicTop | 0) | (newDynamicTop | 0) < 0) {
                    abortOnCannotGrowMemory(newDynamicTop | 0) | 0;
                    ___setErrNo(12);
                    return -1
                }
                if ((newDynamicTop | 0) > (totalMemory | 0)) {
                    if (_emscripten_resize_heap(newDynamicTop | 0) | 0) {
                    } else {
                        ___setErrNo(12);
                        return -1
                    }
                }
                HEAP32[DYNAMICTOP_PTR >> 2] = newDynamicTop | 0;
                return oldDynamicTop | 0
            }

            var _sqrt = Math_sqrt;
            var asmGlobalArg = {};
            var asmLibraryArg = {
                "b": ___assert_fail,
                "j": ___cxa_pure_virtual,
                "i": _abort,
                "a": _abs,
                "d": emscriptenPushBuffer,
                "g": _emscripten_memcpy_big,
                "h": _fabs,
                "k": _floor,
                "f": _rintf,
                "c": _sbrk,
                "e": _sqrt
            };
            var asm = Module["asm"](asmGlobalArg, asmLibraryArg, buffer);
            Module["asm"] = asm;
            var ___wasm_call_ctors = Module["___wasm_call_ctors"] = function () {
                return Module["asm"]["__wasm_call_ctors"].apply(null, arguments)
            };
            var _emscripten_bind_VoidPtr___destroy___0 = Module["_emscripten_bind_VoidPtr___destroy___0"] = function () {
                return Module["asm"]["l"].apply(null, arguments)
            };
            var _emscripten_bind_Container_Container_0 = Module["_emscripten_bind_Container_Container_0"] = function () {
                return Module["asm"]["m"].apply(null, arguments)
            };
            var _emscripten_bind_Container_init_3 = Module["_emscripten_bind_Container_init_3"] = function () {
                return Module["asm"]["n"].apply(null, arguments)
            };
            var _emscripten_bind_Container_writeFrame_3 = Module["_emscripten_bind_Container_writeFrame_3"] = function () {
                return Module["asm"]["o"].apply(null, arguments)
            };
            var _emscripten_bind_Container___destroy___0 = Module["_emscripten_bind_Container___destroy___0"] = function () {
                return Module["asm"]["p"].apply(null, arguments)
            };
            var _opus_encoder_create = Module["_opus_encoder_create"] = function () {
                return Module["asm"]["q"].apply(null, arguments)
            };
            var _opus_encode_float = Module["_opus_encode_float"] = function () {
                return Module["asm"]["r"].apply(null, arguments)
            };
            var _opus_encoder_ctl = Module["_opus_encoder_ctl"] = function () {
                return Module["asm"]["s"].apply(null, arguments)
            };
            var _opus_encoder_destroy = Module["_opus_encoder_destroy"] = function () {
                return Module["asm"]["t"].apply(null, arguments)
            };
            var _malloc = Module["_malloc"] = function () {
                return Module["asm"]["u"].apply(null, arguments)
            };
            var _free = Module["_free"] = function () {
                return Module["asm"]["v"].apply(null, arguments)
            };
            var _speex_resampler_init = Module["_speex_resampler_init"] = function () {
                return Module["asm"]["w"].apply(null, arguments)
            };
            var _speex_resampler_destroy = Module["_speex_resampler_destroy"] = function () {
                return Module["asm"]["x"].apply(null, arguments)
            };
            var _speex_resampler_process_interleaved_float = Module["_speex_resampler_process_interleaved_float"] = function () {
                return Module["asm"]["y"].apply(null, arguments)
            };
            var dynCall_vi = Module["dynCall_vi"] = function () {
                return Module["asm"]["z"].apply(null, arguments)
            };
            var dynCall_v = Module["dynCall_v"] = function () {
                return Module["asm"]["A"].apply(null, arguments)
            };
            Module["asm"] = asm;
            Module["then"] = function (func) {
                if (Module["calledRun"]) {
                    func(Module)
                } else {
                    var old = Module["onRuntimeInitialized"];
                    Module["onRuntimeInitialized"] = function () {
                        if (old) old();
                        func(Module)
                    }
                }
                return Module
            };

            function ExitStatus(status) {
                this.name = "ExitStatus";
                this.message = "Program terminated with exit(" + status + ")";
                this.status = status
            }

            ExitStatus.prototype = new Error;
            ExitStatus.prototype.constructor = ExitStatus;
            dependenciesFulfilled = function runCaller() {
                if (!Module["calledRun"]) run();
                if (!Module["calledRun"]) dependenciesFulfilled = runCaller
            };

            function run(args) {
                args = args || Module["arguments"];
                if (runDependencies > 0) {
                    return
                }
                preRun();
                if (runDependencies > 0) return;
                if (Module["calledRun"]) return;

                function doRun() {
                    if (Module["calledRun"]) return;
                    Module["calledRun"] = true;
                    if (ABORT) return;
                    ensureInitRuntime();
                    preMain();
                    if (Module["onRuntimeInitialized"]) Module["onRuntimeInitialized"]();
                    postRun()
                }

                if (Module["setStatus"]) {
                    Module["setStatus"]("Running...");
                    setTimeout(function () {
                        setTimeout(function () {
                            Module["setStatus"]("")
                        }, 1);
                        doRun()
                    }, 1)
                } else {
                    doRun()
                }
            }

            Module["run"] = run;

            function abort(what) {
                if (Module["onAbort"]) {
                    Module["onAbort"](what)
                }
                if (what !== undefined) {
                    out(what);
                    err(what);
                    what = '"' + what + '"'
                } else {
                    what = ""
                }
                ABORT = true;
                EXITSTATUS = 1;
                throw"abort(" + what + "). Build with -s ASSERTIONS=1 for more info."
            }

            Module["abort"] = abort;
            if (Module["preInit"]) {
                if (typeof Module["preInit"] == "function") Module["preInit"] = [Module["preInit"]];
                while (Module["preInit"].length > 0) {
                    Module["preInit"].pop()()
                }
            }
            Module["noExitRuntime"] = true;
            run();

            function WrapperObject() {
            }

            WrapperObject.prototype = Object.create(WrapperObject.prototype);
            WrapperObject.prototype.constructor = WrapperObject;
            WrapperObject.prototype.__class__ = WrapperObject;
            WrapperObject.__cache__ = {};
            Module["WrapperObject"] = WrapperObject;

            function getCache(__class__) {
                return (__class__ || WrapperObject).__cache__
            }

            Module["getCache"] = getCache;

            function wrapPointer(ptr, __class__) {
                var cache = getCache(__class__);
                var ret = cache[ptr];
                if (ret) return ret;
                ret = Object.create((__class__ || WrapperObject).prototype);
                ret.ptr = ptr;
                return cache[ptr] = ret
            }

            Module["wrapPointer"] = wrapPointer;

            function castObject(obj, __class__) {
                return wrapPointer(obj.ptr, __class__)
            }

            Module["castObject"] = castObject;
            Module["NULL"] = wrapPointer(0);

            function destroy(obj) {
                if (!obj["__destroy__"]) throw"Error: Cannot destroy object. (Did you create it yourself?)";
                obj["__destroy__"]();
                delete getCache(obj.__class__)[obj.ptr]
            }

            Module["destroy"] = destroy;

            function compare(obj1, obj2) {
                return obj1.ptr === obj2.ptr
            }

            Module["compare"] = compare;

            function getPointer(obj) {
                return obj.ptr
            }

            Module["getPointer"] = getPointer;

            function getClass(obj) {
                return obj.__class__
            }

            Module["getClass"] = getClass;
            var ensureCache = {
                buffer: 0, size: 0, pos: 0, temps: [], needed: 0, prepare: function () {
                    if (ensureCache.needed) {
                        for (var i = 0; i < ensureCache.temps.length; i++) {
                            Module["_free"](ensureCache.temps[i])
                        }
                        ensureCache.temps.length = 0;
                        Module["_free"](ensureCache.buffer);
                        ensureCache.buffer = 0;
                        ensureCache.size += ensureCache.needed;
                        ensureCache.needed = 0
                    }
                    if (!ensureCache.buffer) {
                        ensureCache.size += 128;
                        ensureCache.buffer = Module["_malloc"](ensureCache.size);
                        assert(ensureCache.buffer)
                    }
                    ensureCache.pos = 0
                }, alloc: function (array, view) {
                    assert(ensureCache.buffer);
                    var bytes = view.BYTES_PER_ELEMENT;
                    var len = array.length * bytes;
                    len = len + 7 & -8;
                    var ret;
                    if (ensureCache.pos + len >= ensureCache.size) {
                        assert(len > 0);
                        ensureCache.needed += len;
                        ret = Module["_malloc"](len);
                        ensureCache.temps.push(ret)
                    } else {
                        ret = ensureCache.buffer + ensureCache.pos;
                        ensureCache.pos += len
                    }
                    return ret
                }, copy: function (array, view, offset) {
                    var offsetShifted = offset;
                    var bytes = view.BYTES_PER_ELEMENT;
                    switch (bytes) {
                        case 2:
                            offsetShifted >>= 1;
                            break;
                        case 4:
                            offsetShifted >>= 2;
                            break;
                        case 8:
                            offsetShifted >>= 3;
                            break
                    }
                    for (var i = 0; i < array.length; i++) {
                        view[offsetShifted + i] = array[i]
                    }
                }
            };

            function VoidPtr() {
                throw"cannot construct a VoidPtr, no constructor in IDL"
            }

            VoidPtr.prototype = Object.create(WrapperObject.prototype);
            VoidPtr.prototype.constructor = VoidPtr;
            VoidPtr.prototype.__class__ = VoidPtr;
            VoidPtr.__cache__ = {};
            Module["VoidPtr"] = VoidPtr;
            VoidPtr.prototype["__destroy__"] = VoidPtr.prototype.__destroy__ = function () {
                var self = this.ptr;
                _emscripten_bind_VoidPtr___destroy___0(self)
            };

            function Container() {
                this.ptr = _emscripten_bind_Container_Container_0();
                getCache(Container)[this.ptr] = this
            }

            Container.prototype = Object.create(WrapperObject.prototype);
            Container.prototype.constructor = Container;
            Container.prototype.__class__ = Container;
            Container.__cache__ = {};
            Module["Container"] = Container;
            Container.prototype["init"] = Container.prototype.init = function (arg0, arg1, arg2) {
                var self = this.ptr;
                if (arg0 && typeof arg0 === "object") arg0 = arg0.ptr;
                if (arg1 && typeof arg1 === "object") arg1 = arg1.ptr;
                if (arg2 && typeof arg2 === "object") arg2 = arg2.ptr;
                _emscripten_bind_Container_init_3(self, arg0, arg1, arg2)
            };
            Container.prototype["writeFrame"] = Container.prototype.writeFrame = function (arg0, arg1, arg2) {
                var self = this.ptr;
                if (arg0 && typeof arg0 === "object") arg0 = arg0.ptr;
                if (arg1 && typeof arg1 === "object") arg1 = arg1.ptr;
                if (arg2 && typeof arg2 === "object") arg2 = arg2.ptr;
                _emscripten_bind_Container_writeFrame_3(self, arg0, arg1, arg2)
            };
            Container.prototype["__destroy__"] = Container.prototype.__destroy__ = function () {
                var self = this.ptr;
                _emscripten_bind_Container___destroy___0(self)
            };
            (function () {
                function setupEnums() {
                }

                if (runtimeInitialized) setupEnums(); else addOnPreMain(setupEnums)
            })();


            return Module
        }
    );
})();

if (typeof exports === 'object' && typeof module === 'object') {
    module.exports = Module;
} else if (typeof define === 'function' && define['amd']) {
    define([], function () {
        return Module;
    });
} else if (typeof exports === 'object') {
    exports["Module"] = Module;
}

/**
 ********************************************* OggOpusEncoder.js end ************************************************
 ********************************************************************************************************************
 */

/**
 * 初始化 Worker
 * @param workerGlobalScope
 */
function initWorker(workerGlobalScope) {
    // 引入 OggOpusEncoder 模块
    const OggOpusEncoder = Module;
    let encoder;

    workerGlobalScope.onmessage = function (e) {
        const {command} = e.data;
        switch (command) {
            case 'loadEncoder':
                const {mimeType, wasmPath} = e.data;
                // Setting encoder module
                let encoderModule;
                switch (mimeType) {
                    case 'audio/ogg':
                        encoderModule = OggOpusEncoder;
                        break;
                }
                // Override Emscripten configuration
                let moduleOverrides = {};
                if (wasmPath) {
                    moduleOverrides['locateFile'] = function (path, scriptDirectory) {
                        return path.match(/.wasm/) ? wasmPath : (scriptDirectory + path);
                    };
                }
                // Initialize the module
                encoderModule(moduleOverrides).then(Module => {
                    encoder = Module;
                    // Notify the host ready to accept 'init' message.
                    self.postMessage({command: 'readyToInit'});
                });
                break;

            case 'init':
                const {sampleRate, channelCount, bitsPerSecond} = e.data;
                encoder.init(sampleRate, channelCount, bitsPerSecond);
                break;

            case 'pushInputData':
                const {channelBuffers, length, duration} = e.data; // eslint-disable-line
                // On Chrome, Float32Array doesn't recognize its buffer after
                // being transferred, making the size of ArrayBuffer 0.
                // This bug is found in Chrome 66.0.3359.181 (2018).
                // It is fixed since 2019.
                // So re-create Float32Array right after a web worker received it.
                for (let i = 0; i < channelBuffers.length; i++) {
                    channelBuffers[i] = new Float32Array(channelBuffers[i].buffer);
                }

                encoder.encode(channelBuffers);
                break;

            case 'getEncodedData':
            case 'done':
                if (command === 'done') {
                    encoder.close();
                }

                const buffers = encoder.flush();
                self.postMessage({
                    command: command === 'done' ? 'lastEncodedData' : 'encodedData',
                    buffers
                }, buffers);

                if (command === 'done') {
                    self.close();
                }
                break;

            default:
                // Ignore
                break;
        }
    };
}

/* global WorkerGlobalScope */
// Run only if it is in web worker environment
if (typeof WorkerGlobalScope !== 'undefined' && self instanceof WorkerGlobalScope) {
    initWorker(self);
}

/**
 * create audio element
 * @type {HTMLElement}
 */
let localAudio = document.createElement('audio');
localAudio.muted = true
localAudio.hidden = true
localAudio.autoplay = true
document.body.appendChild(localAudio)

let stream = null
let fileName = null;
let audioCtx = null
let audioRecorder = {}
let recordingDuration = 30000;   // 文件录制时间 30s
let recorderCallback = null

/**
 *  Non-standard options
 * @type {{OggOpusEncoderWasmPath: string}}
 */
const workerOptions = {
    OggOpusEncoderWasmPath: './OggOpusEncoder.wasm',
    // OggOpusEncoderWasmPath: 'https://cdn.jsdelivr.net/npm/opus-media-recorder@0.7.19/OggOpusEncoder.wasm'
};
window.MediaRecorder = OggOpusMediaRecorder;

/**
 * create MediaRecorder instance
 * @param stream
 * @param duration
 * @returns {*}
 */
function createMediaRecorder(stream, duration) {
    let options = {mimeType: 'audio/ogg'};
    let recorder = new MediaRecorder(stream, options, workerOptions, duration);
    let dataChunks = [];

    recorder.onstart = function(){
        dataChunks = [];
        console.log('Recorder started');
    }

    recorder.ondataavailable = function(e){
        dataChunks.push(e.data);
        console.log('Recorder data available ');
    }

    recorder.onstop = function(){
        console.log('recorder complete!')
        let blob = new Blob(dataChunks, {'type': recorder.mimeType});
        dataChunks = [];
        if(!blob.size){
            throw new Error('Exception: Blob is empty')
        }

        if(recorderCallback){
            recorderCallback(blob)
            audioRecorder = null
            audioCtx = null
            stream = null
            recorderCallback = null
        }
    }

    recorder.onpause = function(){
        console.log('Recorder paused')
    }

    recorder.onresume = function(){
        console.log('Recorder resumed')
    }

    recorder.onerror = function (error) {
        if (!error) {
            return;
        }

        if (!error.name) {
            error.name = 'UnknownError';
        }

        if (error.name.toString().toLowerCase().indexOf('invalidstate') !== -1) {
            console.error('The MediaRecorder is not in a state in which the proposed operation is allowed to be executed.', error);
        } else if (error.name.toString().toLowerCase().indexOf('notsupported') !== -1) {
            console.error('MIME type (', options.mimeType, ') is not supported.', error);
        } else if (error.name.toString().toLowerCase().indexOf('security') !== -1) {
            console.error('MediaRecorder security error', error);
        }

        // older code below
        else if (error.name === 'OutOfMemory') {
            console.error('The UA has exhaused the available memory. User agents SHOULD provide as much additional information as possible in the message attribute.', error);
        } else if (error.name === 'IllegalStreamModification') {
            console.error('A modification to the stream has occurred that makes it impossible to continue recording. An example would be the addition of a Track while recording is occurring. User agents SHOULD provide as much additional information as possible in the message attribute.', error);
        } else if (error.name === 'OtherRecordingError') {
            console.error('Used for an fatal error other than those listed above. User agents SHOULD provide as much additional information as possible in the message attribute.', error);
        } else if (error.name === 'GenericError') {
            console.error('The UA cannot provide the codec or recording option that has been requested.', error);
        } else {
            console.error('MediaRecorder Error', error);
        }

        console.error('Recorder encounters error:' + error.message)
        if (recorder._state !== 'inactive' && recorder._state !== 'stopped') {
            recorder.stop();
        }
    };

    return recorder
}

/**
 * 通过AudioContext.createMediaStreamDestination 生成文件流
 * @param buffer
 */
function createSoundSource(buffer) {
    let soundSource = audioCtx.createBufferSource();
    soundSource.buffer = buffer;
    let destination = audioCtx.createMediaStreamDestination();
    soundSource.connect(destination);
    soundSource.start();

    localAudio.srcObject = destination.stream
    stream = destination.stream
}

/**
 * Audio is ready to start playing
 */
localAudio.addEventListener('canplay', function () {
    try {
        localAudio.play()
        audioRecorder = createMediaRecorder(stream, recordingDuration)
        console.log('Creating MediaRecorder is successful, Start recorder...')
        audioRecorder.startRecording()
    }catch (e) {
        console.log(`MediaRecorder is failed: ${e.message}`);
        Promise.reject(new Error());
    }
})

/**
 * When the uploaded file is less than 30s, after audio playback ends, stop the recorder
 */
localAudio.addEventListener("ended", function () {
    if(audioRecorder._state !== 'inactive' && audioRecorder._state !== 'stopped'){
        audioRecorder.stopRecording()
    }
});

/**
 * Check available content types compatibility
 */
window.addEventListener('load', function() {
    if (OggOpusMediaRecorder === undefined) {
        console.error('No OpusMediaRecorder found');
    } else {
        let contentTypes = [
            'audio/wave',
            'audio/wav',
            'audio/ogg',
            'audio/ogg;codecs=opus',
            'audio/webm',
            'audio/webm;codecs=opus'
        ];
        contentTypes.forEach(function (type) {
            console.log(type + ' is ' + (MediaRecorder.isTypeSupported(type) ? 'supported' : 'NOT supported'));
        });
    }
}, false);

/**
 * Upload local audio file
 * 使用FileReader读取上传文件，转换为stream
 */
function recordToOgg (file, callback){
    console.log('Recorder audio file to ogg')
    fileName = file.name.replace(/\.[^\.]+$/, '')
    audioCtx = new AudioContext();
    let fileReader = new FileReader()
    fileReader.file = file;
    recorderCallback = callback

    fileReader.onload = function(e){
        console.log('file reade onload...')
        audioCtx.decodeAudioData(e.target.result).then(createSoundSource).catch(function (error) {
            console.error(error.toString())
        })
    }
    fileReader.readAsArrayBuffer(fileReader.file);
}