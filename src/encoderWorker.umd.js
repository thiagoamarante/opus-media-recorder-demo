(function OpusMediaWorkerUMD(root, factory) {
		if (typeof WorkerGlobalScope !== 'undefined' && self instanceof WorkerGlobalScope) {
			var initWorker = factory();
			initWorker();
		} else if (typeof exports === 'object' && typeof module === 'object')
			module.exports = factory();
		else if (typeof define === 'function' && define.amd)
			define([], factory);
		else if (typeof exports === 'object')
			exports["encoderWorker"] = factory();
		else
			root["encoderWorker"] = factory();
	}
)(typeof OpusMediaRecorder !== 'undefined' ? OpusMediaRecorder : typeof self !== 'undefined' ? self : this, function() {
	return function() {
		!function(e) {
			var t = {};
			function n(r) {
				if (t[r])
					return t[r].exports;
				var o = t[r] = {
					i: r,
					l: !1,
					exports: {}
				};
				return e[r].call(o.exports, o, o.exports, n),
					o.l = !0,
					o.exports
			}
			n.m = e,
				n.c = t,
				n.d = function(e, t, r) {
					n.o(e, t) || Object.defineProperty(e, t, {
						enumerable: !0,
						get: r
					})
				}
				,
				n.r = function(e) {
					"undefined" != typeof Symbol && Symbol.toStringTag && Object.defineProperty(e, Symbol.toStringTag, {
						value: "Module"
					}),
						Object.defineProperty(e, "__esModule", {
							value: !0
						})
				}
				,
				n.t = function(e, t) {
					if (1 & t && (e = n(e)),
					8 & t)
						return e;
					if (4 & t && "object" == typeof e && e && e.__esModule)
						return e;
					var r = Object.create(null);
					if (n.r(r),
						Object.defineProperty(r, "default", {
							enumerable: !0,
							value: e
						}),
					2 & t && "string" != typeof e)
						for (var o in e)
							n.d(r, o, function(t) {
								return e[t]
							}
								.bind(null, o));
					return r
				}
				,
				n.n = function(e) {
					var t = e && e.__esModule ? function() {
							return e.default
						}
						: function() {
							return e
						}
					;
					return n.d(t, "a", t),
						t
				}
				,
				n.o = function(e, t) {
					return Object.prototype.hasOwnProperty.call(e, t)
				}
				,
				n.p = "",
				n(n.s = 5)
		}([function(e, t) {
			function n(e) {
				return (n = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(e) {
							return typeof e
						}
						: function(e) {
							return e && "function" == typeof Symbol && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e
						}
				)(e)
			}
			function r(e, t) {
				return !t || "object" !== n(t) && "function" != typeof t ? function(e) {
					if (void 0 === e)
						throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
					return e
				}(e) : t
			}
			function o(e) {
				return (o = Object.setPrototypeOf ? Object.getPrototypeOf : function(e) {
						return e.__proto__ || Object.getPrototypeOf(e)
					}
				)(e)
			}
			function i(e, t) {
				if ("function" != typeof t && null !== t)
					throw new TypeError("Super expression must either be null or a function");
				e.prototype = Object.create(t && t.prototype, {
					constructor: {
						value: e,
						writable: !0,
						configurable: !0
					}
				}),
				t && u(e, t)
			}
			function u(e, t) {
				return (u = Object.setPrototypeOf || function(e, t) {
						return e.__proto__ = t,
							e
					}
				)(e, t)
			}
			function a(e, t) {
				if (!(e instanceof t))
					throw new TypeError("Cannot call a class as a function")
			}
			function s(e, t) {
				for (var n = 0; n < t.length; n++) {
					var r = t[n];
					r.enumerable = r.enumerable || !1,
						r.configurable = !0,
					"value"in r && (r.writable = !0),
						Object.defineProperty(e, r.key, r)
				}
			}
			function c(e, t, n) {
				return t && s(e.prototype, t),
				n && s(e, n),
					e
			}
			var f = function() {
				function e(t, n, r, o) {
					switch (a(this, e),
						this._size = n,
						this._module = t,
						this._size) {
						case 1:
							this._heapArray = r ? this._module.HEAP8 : this._module.HEAPU8;
							break;
						case 2:
							this._heapArray = r ? this._module.HEAP16 : this._module.HEAPU16;
							break;
						case 4:
							this._heapArray = r ? this._module.HEAP32 : this._module.HEAPU32;
							break;
						default:
							this._heapArray = this._module.HEAPU8
					}
					o && (this._size = 4,
						this._heapArray = this._module.HEAPF32),
						this._pointer = this._module._malloc(n)
				}
				return c(e, [{
					key: "free",
					value: function() {
						this._module._free(this.pointer)
					}
				}, {
					key: "pointer",
					get: function() {
						return this._pointer
					}
				}, {
					key: "value",
					get: function() {
						var e = 0;
						switch (this._size) {
							case 2:
								e = 1;
								break;
							case 4:
								e = 2;
								break;
							default:
								throw new Error("Pointer can be only deferenced as integer-sized")
						}
						return this._heapArray[this.pointer >> e]
					},
					set: function(e) {
						var t = 0;
						switch (this._size) {
							case 2:
								t = 1;
								break;
							case 4:
								t = 2;
								break;
							default:
								throw new Error("Pointer can be only deferenced as integer-sized")
						}
						this._heapArray[this.pointer >> t] = e
					}
				}]),
					e
			}()
				, l = function(e) {
				function t(e, n) {
					var i;
					return a(this, t),
						i = r(this, o(t).call(this, e, 4, !0, !1)),
					void 0 !== n && (i.value = n),
						i
				}
				return i(t, f),
					t
			}()
				, p = function(e) {
				function t(e, n) {
					var i;
					return a(this, t),
						i = r(this, o(t).call(this, e, 4, !1, !1)),
					void 0 !== n && (i.value = n),
						i
				}
				return i(t, f),
					t
			}()
				, d = function(e) {
				function t(e, n, i, u, s) {
					var c;
					a(this, t),
						c = r(this, o(t).call(this, e, n * i, u, s));
					var f = 0;
					switch (i) {
						case 1:
							c._heapArray = u ? c._module.HEAP8 : c._module.HEAPU8,
								f = 0;
							break;
						case 2:
							c._heapArray = u ? c._module.HEAP16 : c._module.HEAPU16,
								f = 1;
							break;
						case 4:
							c._heapArray = u ? c._module.HEAP32 : c._module.HEAPU32,
								f = 2;
							break;
						default:
							throw new Error("Unit size must be an integer-size")
					}
					s && (c._heapArray = c._module.HEAPF32,
						f = 2);
					var l = c._pointer >> f;
					return c._buffer = c._heapArray.subarray(l, l + n),
						c._length = n,
						c
				}
				return i(t, f),
					c(t, [{
						key: "set",
						value: function(e, t) {
							this._buffer.set(e, t)
						}
					}, {
						key: "subarray",
						value: function(e, t) {
							return this._buffer.subarray(e, t)
						}
					}, {
						key: "length",
						get: function() {
							return this._length
						}
					}]),
					t
			}()
				, h = function(e) {
				function t(e, n) {
					return a(this, t),
						r(this, o(t).call(this, e, n, 4, !0, !0))
				}
				return i(t, d),
					t
			}()
				, m = function(e) {
				function t(e, n) {
					return a(this, t),
						r(this, o(t).call(this, e, n, 1, !1, !1))
				}
				return i(t, d),
					t
			}()
				, y = function() {
				function e(t) {
					a(this, e),
						this._module = t
				}
				return c(e, [{
					key: "mallocInt32",
					value: function(e) {
						return new l(this._module,e)
					}
				}, {
					key: "mallocUint32",
					value: function(e) {
						return new p(this._module,e)
					}
				}, {
					key: "mallocUint8Buffer",
					value: function(e) {
						return new m(this._module,e)
					}
				}, {
					key: "mallocFloat32Buffer",
					value: function(e) {
						return new h(this._module,e)
					}
				}]),
					e
			}();
			e.exports = {
				writeString: function(e, t, n) {
					for (var r = 0; r < n.length; r++)
						e.setUint8(t + r, n.charCodeAt(r))
				},
				EmscriptenMemoryAllocator: y
			}
		}
			, function(e, t) {
				var n, r, o = e.exports = {};
				function i() {
					throw new Error("setTimeout has not been defined")
				}
				function u() {
					throw new Error("clearTimeout has not been defined")
				}
				function a(e) {
					if (n === setTimeout)
						return setTimeout(e, 0);
					if ((n === i || !n) && setTimeout)
						return n = setTimeout,
							setTimeout(e, 0);
					try {
						return n(e, 0)
					} catch (t) {
						try {
							return n.call(null, e, 0)
						} catch (t) {
							return n.call(this, e, 0)
						}
					}
				}
				!function() {
					try {
						n = "function" == typeof setTimeout ? setTimeout : i
					} catch (e) {
						n = i
					}
					try {
						r = "function" == typeof clearTimeout ? clearTimeout : u
					} catch (e) {
						r = u
					}
				}();
				var s, c = [], f = !1, l = -1;
				function p() {
					f && s && (f = !1,
						s.length ? c = s.concat(c) : l = -1,
					c.length && d())
				}
				function d() {
					if (!f) {
						var e = a(p);
						f = !0;
						for (var t = c.length; t; ) {
							for (s = c,
									 c = []; ++l < t; )
								s && s[l].run();
							l = -1,
								t = c.length
						}
						s = null,
							f = !1,
							function(e) {
								if (r === clearTimeout)
									return clearTimeout(e);
								if ((r === u || !r) && clearTimeout)
									return r = clearTimeout,
										clearTimeout(e);
								try {
									r(e)
								} catch (t) {
									try {
										return r.call(null, e)
									} catch (t) {
										return r.call(this, e)
									}
								}
							}(e)
					}
				}
				function h(e, t) {
					this.fun = e,
						this.array = t
				}
				function m() {}
				o.nextTick = function(e) {
					var t = new Array(arguments.length - 1);
					if (arguments.length > 1)
						for (var n = 1; n < arguments.length; n++)
							t[n - 1] = arguments[n];
					c.push(new h(e,t)),
					1 !== c.length || f || a(d)
				}
					,
					h.prototype.run = function() {
						this.fun.apply(null, this.array)
					}
					,
					o.title = "browser",
					o.browser = !0,
					o.env = {},
					o.argv = [],
					o.version = "",
					o.versions = {},
					o.on = m,
					o.addListener = m,
					o.once = m,
					o.off = m,
					o.removeListener = m,
					o.removeAllListeners = m,
					o.emit = m,
					o.prependListener = m,
					o.prependOnceListener = m,
					o.listeners = function(e) {
						return []
					}
					,
					o.binding = function(e) {
						throw new Error("process.binding is not supported")
					}
					,
					o.cwd = function() {
						return "/"
					}
					,
					o.chdir = function(e) {
						throw new Error("process.chdir is not supported")
					}
					,
					o.umask = function() {
						return 0
					}
			}
			, function(e, t) {
				e.exports = function(e) {
					return e.webpackPolyfill || (e.deprecate = function() {}
						,
						e.paths = [],
					e.children || (e.children = []),
						Object.defineProperty(e, "loaded", {
							enumerable: !0,
							get: function() {
								return e.l
							}
						}),
						Object.defineProperty(e, "id", {
							enumerable: !0,
							get: function() {
								return e.i
							}
						}),
						e.webpackPolyfill = 1),
						e
				}
			}
			, function(e, t) {}
			, function(e, t, n) {
				(function(e) {
						function n(e, t) {
							for (var n = 0, r = e.length - 1; r >= 0; r--) {
								var o = e[r];
								"." === o ? e.splice(r, 1) : ".." === o ? (e.splice(r, 1),
									n++) : n && (e.splice(r, 1),
									n--)
							}
							if (t)
								for (; n--; n)
									e.unshift("..");
							return e
						}
						var r = /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/
							, o = function(e) {
							return r.exec(e).slice(1)
						};
						function i(e, t) {
							if (e.filter)
								return e.filter(t);
							for (var n = [], r = 0; r < e.length; r++)
								t(e[r], r, e) && n.push(e[r]);
							return n
						}
						t.resolve = function() {
							for (var t = "", r = !1, o = arguments.length - 1; o >= -1 && !r; o--) {
								var u = o >= 0 ? arguments[o] : e.cwd();
								if ("string" != typeof u)
									throw new TypeError("Arguments to path.resolve must be strings");
								u && (t = u + "/" + t,
									r = "/" === u.charAt(0))
							}
							return (r ? "/" : "") + (t = n(i(t.split("/"), function(e) {
								return !!e
							}), !r).join("/")) || "."
						}
							,
							t.normalize = function(e) {
								var r = t.isAbsolute(e)
									, o = "/" === u(e, -1);
								return (e = n(i(e.split("/"), function(e) {
									return !!e
								}), !r).join("/")) || r || (e = "."),
								e && o && (e += "/"),
								(r ? "/" : "") + e
							}
							,
							t.isAbsolute = function(e) {
								return "/" === e.charAt(0)
							}
							,
							t.join = function() {
								var e = Array.prototype.slice.call(arguments, 0);
								return t.normalize(i(e, function(e, t) {
									if ("string" != typeof e)
										throw new TypeError("Arguments to path.join must be strings");
									return e
								}).join("/"))
							}
							,
							t.relative = function(e, n) {
								function r(e) {
									for (var t = 0; t < e.length && "" === e[t]; t++)
										;
									for (var n = e.length - 1; n >= 0 && "" === e[n]; n--)
										;
									return t > n ? [] : e.slice(t, n - t + 1)
								}
								e = t.resolve(e).substr(1),
									n = t.resolve(n).substr(1);
								for (var o = r(e.split("/")), i = r(n.split("/")), u = Math.min(o.length, i.length), a = u, s = 0; s < u; s++)
									if (o[s] !== i[s]) {
										a = s;
										break
									}
								var c = [];
								for (s = a; s < o.length; s++)
									c.push("..");
								return (c = c.concat(i.slice(a))).join("/")
							}
							,
							t.sep = "/",
							t.delimiter = ":",
							t.dirname = function(e) {
								var t = o(e)
									, n = t[0]
									, r = t[1];
								return n || r ? (r && (r = r.substr(0, r.length - 1)),
								n + r) : "."
							}
							,
							t.basename = function(e, t) {
								var n = o(e)[2];
								return t && n.substr(-1 * t.length) === t && (n = n.substr(0, n.length - t.length)),
									n
							}
							,
							t.extname = function(e) {
								return o(e)[3]
							}
						;
						var u = "b" === "ab".substr(-1) ? function(e, t, n) {
								return e.substr(t, n)
							}
							: function(e, t, n) {
								return t < 0 && (t = e.length + t),
									e.substr(t, n)
							}
					}
				).call(this, n(1))
			}
			, function(e, t, n) {
				function r(e) {
					var t, r = n(6), o = n(7), i = n(8);
					e.onmessage = function(e) {
						var n = e.data.command;
						switch (n) {
							case "loadEncoder":
								var u, a = e.data, s = a.mimeType, c = a.wasmPath;
								switch (s) {
									case "audio/wav":
									case "audio/wave":
										u = r;
										break;
									case "audio/webm":
										u = o;
										break;
									case "audio/ogg":
										u = i
								}
								var f = {};
								c && (f.locateFile = function(e, t) {
										return e.match(/.wasm/) ? c : t + e
									}
								),
									u(f).then(function(e) {
										t = e,
											self.postMessage({
												command: "readyToInit"
											})
									});
								break;
							case "init":
								var l = e.data
									, p = l.sampleRate
									, d = l.channelCount
									, h = l.bitsPerSecond;
								t.init(p, d, h);
								break;
							case "pushInputData":
								for (var m = e.data, y = m.channelBuffers, _ = (m.length,
									m.duration,
									0); _ < y.length; _++)
									y[_] = new Float32Array(y[_].buffer);
								t.encode(y);
								break;
							case "getEncodedData":
							case "done":
								"done" === n && t.close();
								var v = t.flush();
								self.postMessage({
									command: "done" === n ? "lastEncodedData" : "encodedData",
									buffers: v
								}, v),
								"done" === n && self.close()
						}
					}
				}
				"undefined" != typeof WorkerGlobalScope && self instanceof WorkerGlobalScope && r(self),
					e.exports = r
			}
			, function(e, t, n) {
				function r(e) {
					return function(e) {
						if (Array.isArray(e)) {
							for (var t = 0, n = new Array(e.length); t < e.length; t++)
								n[t] = e[t];
							return n
						}
					}(e) || function(e) {
						if (Symbol.iterator in Object(e) || "[object Arguments]" === Object.prototype.toString.call(e))
							return Array.from(e)
					}(e) || function() {
						throw new TypeError("Invalid attempt to spread non-iterable instance")
					}()
				}
				function o(e, t) {
					for (var n = 0; n < t.length; n++) {
						var r = t[n];
						r.enumerable = r.enumerable || !1,
							r.configurable = !0,
						"value"in r && (r.writable = !0),
							Object.defineProperty(e, r.key, r)
					}
				}
				var i = n(0).writeString
					, u = Int16Array.BYTES_PER_ELEMENT
					, a = function() {
					function e(t, n, r) {
						!function(e, t) {
							if (!(e instanceof t))
								throw new TypeError("Cannot call a class as a function")
						}(this, e),
							this.config = {
								inputSampleRate: t,
								channelCount: n
							},
							this.encodedBuffers = []
					}
					var t, n, r;
					return t = e,
					(n = [{
						key: "encode",
						value: function(e) {
							for (var t = e[0].length, n = new ArrayBuffer(t * u * this.config.channelCount), r = new DataView(n), o = 0; o < this.config.channelCount; o++)
								for (var i = e[o], a = 0; a < t; a++) {
									var s = 32767 * i[a] | 0;
									s > 32767 ? s = 32767 : s < -32768 && (s = -32768);
									var c = (a * this.config.channelCount + o) * u;
									r.setInt16(c, 0 | s, !0)
								}
							this.encodedBuffers.push(n)
						}
					}, {
						key: "getHeader",
						value: function() {
							var e = this.encodedBuffers.reduce(function(e, t) {
								return e + t.byteLength
							}, 0)
								, t = new ArrayBuffer(44)
								, n = new DataView(t);
							return i(n, 0, "RIFF"),
								n.setUint32(4, 36 + e, !0),
								i(n, 8, "WAVE"),
								i(n, 12, "fmt "),
								n.setUint32(16, 16, !0),
								n.setUint16(20, 1, !0),
								n.setUint16(22, this.config.channelCount, !0),
								n.setUint32(24, this.config.inputSampleRate, !0),
								n.setUint32(28, this.config.inputSampleRate * u * this.config.channelCount, !0),
								n.setUint16(32, u * this.config.channelCount, !0),
								n.setUint16(34, 8 * u, !0),
								i(n, 36, "data"),
								n.setUint32(40, e, !0),
								t
						}
					}]) && o(t.prototype, n),
					r && o(t, r),
						e
				}();
				e.exports = function(e) {
					return new Promise(function(t, n) {
							(e = void 0 !== e && e || {}).init = function(t, n, r) {
								e.encoder = new a(t,n,r)
							}
								,
								e.encode = function(t) {
									e.encoder.encode(t)
								}
								,
								e.flush = function() {
									var t = e.encoder.getHeader()
										, n = e.encoder.encodedBuffers.splice(0, e.encoder.encodedBuffers.length);
									return [t].concat(r(n))
								}
								,
								e.close = function() {}
								,
								t(e)
						}
					)
				}
			}
			, function(e, t, n) {
				(function(e, r, o) {
						var i;
						function u(e) {
							return (u = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(e) {
										return typeof e
									}
									: function(e) {
										return e && "function" == typeof Symbol && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e
									}
							)(e)
						}
						function a(e, t) {
							for (var n = 0; n < t.length; n++) {
								var r = t[n];
								r.enumerable = r.enumerable || !1,
									r.configurable = !0,
								"value"in r && (r.writable = !0),
									Object.defineProperty(e, r.key, r)
							}
						}
						var s, c = (s = "undefined" != typeof document && document.currentScript ? document.currentScript.src : void 0,
								function(t) {
									t = void 0 !== (t = t || {}) ? t : {};
									var o = n(0).EmscriptenMemoryAllocator
										, i = 48e3
										, c = 4e3
										, f = 20
										, l = 4096
										, p = function() {
										function e(n, r) {
											var u = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : void 0;
											!function(e, t) {
												if (!(e instanceof t))
													throw new TypeError("Cannot call a class as a function")
											}(this, e),
												this.config = {
													inputSampleRate: n,
													channelCount: r
												},
												this.memory = new o(t),
												this._opus_encoder_create = t._opus_encoder_create,
												this._opus_encoder_ctl = t._opus_encoder_ctl,
												this._opus_encode_float = t._opus_encode_float,
												this._opus_encoder_destroy = t._opus_encoder_destroy,
												this._speex_resampler_init = t._speex_resampler_init,
												this._speex_resampler_process_interleaved_float = t._speex_resampler_process_interleaved_float,
												this._speex_resampler_destroy = t._speex_resampler_destroy,
												this._container = new t.Container,
												this._container.init(i, r, Math.floor(4294967295 * Math.random())),
												this.OpusInitCodec(i, r, u),
												this.SpeexInitResampler(n, i, r),
												this.inputSamplesPerChannel = n * f / 1e3,
												this.outputSamplePerChannel = i * f / 1e3,
												this.inputBufferIndex = 0,
												this.mInputBuffer = this.memory.mallocFloat32Buffer(this.inputSamplesPerChannel * r),
												this.mResampledBuffer = this.memory.mallocFloat32Buffer(this.outputSamplePerChannel * r),
												this.mOutputBuffer = this.memory.mallocUint8Buffer(c),
												this.interleavedBuffers = 1 !== r ? new Float32Array(l * r) : void 0
										}
										var n, r, u;
										return n = e,
										(r = [{
											key: "encode",
											value: function(e) {
												for (var t = this.interleave(e), n = 0; n < t.length; ) {
													var r = Math.min(this.mInputBuffer.length - this.inputBufferIndex, t.length - n);
													if (this.mInputBuffer.set(t.subarray(n, n + r), this.inputBufferIndex),
														this.inputBufferIndex += r,
													this.inputBufferIndex >= this.mInputBuffer.length) {
														var o = this.memory.mallocUint32(this.inputSamplesPerChannel)
															, i = this.memory.mallocUint32(this.outputSamplePerChannel)
															, u = this._speex_resampler_process_interleaved_float(this.resampler, this.mInputBuffer.pointer, o.pointer, this.mResampledBuffer.pointer, i.pointer);
														if (o.free(),
															i.free(),
														0 !== u)
															throw new Error("Resampling error.");
														var a = this._opus_encode_float(this.encoder, this.mResampledBuffer.pointer, this.outputSamplePerChannel, this.mOutputBuffer.pointer, this.mOutputBuffer.length);
														if (a < 0)
															throw new Error("Opus encoding error.");
														this._container.writeFrame(this.mOutputBuffer.pointer, a, this.outputSamplePerChannel),
															this.inputBufferIndex = 0
													}
													n += r
												}
											}
										}, {
											key: "close",
											value: function() {
												for (var e = this.config.channelCount, n = [], r = 0; r < e; ++r)
													n.push(new Float32Array(l - this.inputBufferIndex / e));
												this.encode(n),
													t.destroy(this._container),
													this.mInputBuffer.free(),
													this.mResampledBuffer.free(),
													this.mOutputBuffer.free(),
													this._opus_encoder_destroy(this.encoder),
													this._speex_resampler_destroy(this.resampler)
											}
										}, {
											key: "interleave",
											value: function(e) {
												var t = e.length;
												if (1 === t)
													return e[0];
												for (var n = 0; n < t; n++)
													for (var r = e[n], o = 0; o < r.length; o++)
														this.interleavedBuffers[o * t + n] = r[o];
												return this.interleavedBuffers
											}
										}, {
											key: "OpusInitCodec",
											value: function(e, t) {
												var n = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : void 0
													, r = this.memory.mallocUint32(void 0);
												this.encoder = this._opus_encoder_create(e, t, 2049, r.pointer);
												var o = r.value;
												if (r.free(),
												0 !== o)
													throw new Error("Opus encodor initialization failed.");
												n && this.OpusSetOpusControl(4002, n)
											}
										}, {
											key: "OpusSetOpusControl",
											value: function(e, t) {
												var n = this.memory.mallocInt32(t);
												this._opus_encoder_ctl(this.encoder, e, n.pointer),
													n.free()
											}
										}, {
											key: "SpeexInitResampler",
											value: function(e, t, n) {
												var r = this.memory.mallocUint32(void 0);
												this.resampler = this._speex_resampler_init(n, e, t, 6, r.pointer);
												var o = r.value;
												if (r.free(),
												0 !== o)
													throw new Error("Initializing resampler failed.")
											}
										}]) && a(n.prototype, r),
										u && a(n, u),
											e
									}();
									t.init = function(e, n, r) {
										t.encodedBuffers = [],
											t.encoder = new p(e,n,r)
									}
										,
										t.encode = function(e) {
											t.encoder.encode(e)
										}
										,
										t.flush = function() {
											return t.encodedBuffers.splice(0, t.encodedBuffers.length)
										}
										,
										t.close = function() {
											t.encoder.close()
										}
									;
									var d, h = {};
									for (d in t)
										t.hasOwnProperty(d) && (h[d] = t[d]);
									t.arguments = [],
										t.thisProgram = "./this.program",
										t.quit = function(e, t) {
											throw t
										}
										,
										t.preRun = [],
										t.postRun = [];
									var m, y, _ = !1, v = !1;
									_ = "object" === ("undefined" == typeof window ? "undefined" : u(window)),
										v = "function" == typeof importScripts,
										m = "object" === (void 0 === e ? "undefined" : u(e)) && !_ && !v,
										y = !_ && !m && !v;
									var b, g, w = "";
									m ? (w = r + "/",
											t.read = function(e, t) {
												var r;
												return b || (b = n(3)),
												g || (g = n(4)),
													e = g.normalize(e),
													r = b.readFileSync(e),
													t ? r : r.toString()
											}
											,
											t.readBinary = function(e) {
												var n = t.read(e, !0);
												return n.buffer || (n = new Uint8Array(n)),
													R(n.buffer),
													n
											}
											,
										e.argv.length > 1 && (t.thisProgram = e.argv[1].replace(/\\/g, "/")),
											t.arguments = e.argv.slice(2),
											e.on("uncaughtException", function(e) {
												if (!(e instanceof pe))
													throw e
											}),
											e.on("unhandledRejection", he),
											t.quit = function(t) {
												e.exit(t)
											}
											,
											t.inspect = function() {
												return "[Emscripten Module object]"
											}
									) : y ? ("undefined" != typeof read && (t.read = function(e) {
											return read(e)
										}
									),
										t.readBinary = function(e) {
											var t;
											return "function" == typeof readbuffer ? new Uint8Array(readbuffer(e)) : (R("object" === u(t = read(e, "binary"))),
												t)
										}
										,
										"undefined" != typeof scriptArgs ? t.arguments = scriptArgs : void 0 !== arguments && (t.arguments = arguments),
									"function" == typeof quit && (t.quit = function(e) {
											quit(e)
										}
									)) : (_ || v) && (v ? w = self.location.href : document.currentScript && (w = document.currentScript.src),
										s && (w = s),
											w = 0 !== w.indexOf("blob:") ? w.substr(0, w.lastIndexOf("/") + 1) : "",
											t.read = function(e) {
												var t = new XMLHttpRequest;
												return t.open("GET", e, !1),
													t.send(null),
													t.responseText
											}
											,
										v && (t.readBinary = function(e) {
												var t = new XMLHttpRequest;
												return t.open("GET", e, !1),
													t.responseType = "arraybuffer",
													t.send(null),
													new Uint8Array(t.response)
											}
										),
											t.readAsync = function(e, t, n) {
												var r = new XMLHttpRequest;
												r.open("GET", e, !0),
													r.responseType = "arraybuffer",
													r.onload = function() {
														200 == r.status || 0 == r.status && r.response ? t(r.response) : n()
													}
													,
													r.onerror = n,
													r.send(null)
											}
											,
											t.setWindowTitle = function(e) {
												document.title = e
											}
									);
									var A, S = t.print || ("undefined" != typeof console ? console.log.bind(console) : "undefined" != typeof print ? print : null), E = t.printErr || ("undefined" != typeof printErr ? printErr : "undefined" != typeof console && console.warn.bind(console) || S);
									for (d in h)
										h.hasOwnProperty(d) && (t[d] = h[d]);
									h = void 0,
									"object" !== ("undefined" == typeof WebAssembly ? "undefined" : u(WebAssembly)) && E("no native wasm support detected");
									var B = !1;
									function R(e, t) {
										e || he("Assertion failed: " + t)
									}
									var P, x, O, C, I = "undefined" != typeof TextDecoder ? new TextDecoder("utf8") : void 0;
									function T(e, t, n) {
										for (var r = t + n, o = t; e[o] && !(o >= r); )
											++o;
										if (o - t > 16 && e.subarray && I)
											return I.decode(e.subarray(t, o));
										for (var i = ""; t < o; ) {
											var u = e[t++];
											if (128 & u) {
												var a = 63 & e[t++];
												if (192 != (224 & u)) {
													var s = 63 & e[t++];
													if ((u = 224 == (240 & u) ? (15 & u) << 12 | a << 6 | s : (7 & u) << 18 | a << 12 | s << 6 | 63 & e[t++]) < 65536)
														i += String.fromCharCode(u);
													else {
														var c = u - 65536;
														i += String.fromCharCode(55296 | c >> 10, 56320 | 1023 & c)
													}
												} else
													i += String.fromCharCode((31 & u) << 6 | a)
											} else
												i += String.fromCharCode(u)
										}
										return i
									}
									function j(e, t) {
										return e ? T(O, e, t) : ""
									}
									"undefined" != typeof TextDecoder && new TextDecoder("utf-16le");
									var k = 41104
										, F = t.TOTAL_MEMORY || 16777216;
									function U(e) {
										for (; e.length > 0; ) {
											var n = e.shift();
											if ("function" != typeof n) {
												var r = n.func;
												"number" == typeof r ? void 0 === n.arg ? t.dynCall_v(r) : t.dynCall_vi(r, n.arg) : r(void 0 === n.arg ? null : n.arg)
											} else
												n()
										}
									}
									F < 5242880 && E("TOTAL_MEMORY should be larger than TOTAL_STACK, was " + F + "! (TOTAL_STACK=5242880)"),
										t.buffer ? P = t.buffer : "object" === ("undefined" == typeof WebAssembly ? "undefined" : u(WebAssembly)) && "function" == typeof WebAssembly.Memory ? (A = new WebAssembly.Memory({
											initial: F / 65536,
											maximum: F / 65536
										}),
											P = A.buffer) : P = new ArrayBuffer(F),
										t.HEAP8 = x = new Int8Array(P),
										t.HEAP16 = new Int16Array(P),
										t.HEAP32 = C = new Int32Array(P),
										t.HEAPU8 = O = new Uint8Array(P),
										t.HEAPU16 = new Uint16Array(P),
										t.HEAPU32 = new Uint32Array(P),
										t.HEAPF32 = new Float32Array(P),
										t.HEAPF64 = new Float64Array(P),
										C[k >> 2] = 5284016;
									var M = []
										, H = []
										, W = []
										, D = []
										, z = !1
										, L = Math.abs
										, q = Math.sqrt
										, G = Math.ceil
										, V = Math.floor
										, X = 0
										, K = null
										, N = null;
									t.preloadedImages = {},
										t.preloadedAudios = {};
									var Y = "data:application/octet-stream;base64,";
									function J(e) {
										return String.prototype.startsWith ? e.startsWith(Y) : 0 === e.indexOf(Y)
									}
									var Z, $ = "WebMOpusEncoder.wasm";
									function Q() {
										try {
											if (t.wasmBinary)
												return new Uint8Array(t.wasmBinary);
											if (t.readBinary)
												return t.readBinary($);
											throw "both async and sync fetching of the wasm failed"
										} catch (e) {
											he(e)
										}
									}
									function ee(e) {
										var n = {
											env: e
										};
										function r(e, n) {
											var r = e.exports;
											t.asm = r,
												function(e) {
													if (X--,
													t.monitorRunDependencies && t.monitorRunDependencies(X),
													0 == X && (null !== K && (clearInterval(K),
														K = null),
														N)) {
														var n = N;
														N = null,
															n()
													}
												}()
										}
										function o(e) {
											r(e.instance)
										}
										function i(e) {
											return (t.wasmBinary || !_ && !v || "function" != typeof fetch ? new Promise(function(e, t) {
													e(Q())
												}
											) : fetch($, {
												credentials: "same-origin"
											}).then(function(e) {
												if (!e.ok)
													throw "failed to load wasm binary file at '" + $ + "'";
												return e.arrayBuffer()
											}).catch(function() {
												return Q()
											})).then(function(e) {
												return WebAssembly.instantiate(e, n)
											}).then(e, function(e) {
												E("failed to asynchronously prepare wasm: " + e),
													he(e)
											})
										}
										if (X++,
										t.monitorRunDependencies && t.monitorRunDependencies(X),
											t.instantiateWasm)
											try {
												return t.instantiateWasm(n, r)
											} catch (e) {
												return E("Module.instantiateWasm callback failed with error: " + e),
													!1
											}
										return function() {
											if (t.wasmBinary || "function" != typeof WebAssembly.instantiateStreaming || J($) || "function" != typeof fetch)
												return i(o);
											fetch($, {
												credentials: "same-origin"
											}).then(function(e) {
												return WebAssembly.instantiateStreaming(e, n).then(o, function(e) {
													E("wasm streaming compile failed: " + e),
														E("falling back to ArrayBuffer instantiation"),
														i(o)
												})
											})
										}(),
											{}
									}
									J($) || (Z = $,
										$ = t.locateFile ? t.locateFile(Z, w) : w + Z),
										t.asm = function(e, t, n) {
											return t.memory = A,
												t.table = new WebAssembly.Table({
													initial: 60,
													maximum: 60,
													element: "anyfunc"
												}),
												ee(t)
										}
									;
									var te = {
										buffers: [null, [], []],
										printChar: function(e, t) {
											var n = te.buffers[e];
											0 === t || 10 === t ? ((1 === e ? S : E)(T(n, 0)),
												n.length = 0) : n.push(t)
										},
										varargs: 0,
										get: function(e) {
											return te.varargs += 4,
												C[te.varargs - 4 >> 2]
										},
										getStr: function() {
											return j(te.get())
										},
										get64: function() {
											var e = te.get();
											return te.get(),
												e
										},
										getZero: function() {
											te.get()
										}
									};
									function ne(e) {
										return t.___errno_location && (C[t.___errno_location() >> 2] = e),
											e
									}
									function re(e) {
										return (e = +e) >= 0 ? +V(e + .5) : +G(e - .5)
									}
									function oe(e) {
										he("OOM")
									}
									var ie = {
										c: function(e, t, n, r) {
											he("Assertion failed: " + j(e) + ", at: " + [t ? j(t) : "unknown filename", n, r ? j(r) : "unknown function"])
										},
										m: function() {
											throw B = !0,
												"Pure virtual function called!"
										},
										i: function() {},
										h: function(e, t) {
											te.varargs = t;
											try {
												return te.getStreamFromFD(),
													te.get(),
													te.get(),
													te.get(),
													te.get(),
													0
											} catch (e) {
												return "undefined" != typeof FS && e instanceof FS.ErrnoError || he(e),
													-e.errno
											}
										},
										r: function(e, t) {
											te.varargs = t;
											try {
												var n = te.getStreamFromFD()
													, r = te.get()
													, o = te.get();
												return te.doReadv(n, r, o)
											} catch (e) {
												return "undefined" != typeof FS && e instanceof FS.ErrnoError || he(e),
													-e.errno
											}
										},
										f: function(e, t) {
											te.varargs = t;
											try {
												for (var n = te.get(), r = te.get(), o = te.get(), i = 0, u = 0; u < o; u++) {
													for (var a = C[r + 8 * u >> 2], s = C[r + (8 * u + 4) >> 2], c = 0; c < s; c++)
														te.printChar(n, O[a + c]);
													i += s
												}
												return i
											} catch (e) {
												return "undefined" != typeof FS && e instanceof FS.ErrnoError || he(e),
													-e.errno
											}
										},
										d: function(e, t) {
											te.varargs = t;
											try {
												return 0
											} catch (e) {
												return "undefined" != typeof FS && e instanceof FS.ErrnoError || he(e),
													-e.errno
											}
										},
										t: function(e, t) {
											te.varargs = t;
											try {
												var n = te.getStr()
													, r = te.get()
													, o = te.get();
												return FS.open(n, r, o).fd
											} catch (e) {
												return "undefined" != typeof FS && e instanceof FS.ErrnoError || he(e),
													-e.errno
											}
										},
										s: function(e, t) {
											te.varargs = t;
											try {
												return 0
											} catch (e) {
												return "undefined" != typeof FS && e instanceof FS.ErrnoError || he(e),
													-e.errno
											}
										},
										g: function(e, t) {
											te.varargs = t;
											try {
												return te.getStreamFromFD(),
													0
											} catch (e) {
												return "undefined" != typeof FS && e instanceof FS.ErrnoError || he(e),
													-e.errno
											}
										},
										e: function() {},
										j: function() {
											t.abort()
										},
										a: L,
										u: function(e, n) {
											var r = new Uint8Array(t.HEAPU8.buffer,e,n);
											t.encodedBuffers.push(new Uint8Array(r).buffer)
										},
										p: function(e, t, n) {
											O.set(O.subarray(t, t + n), e)
										},
										q: L,
										l: V,
										o: function(e) {
											return (e = +e) - +V(e) != .5 ? +re(e) : 2 * +re(e / 2)
										},
										b: function(e) {
											var t, n, r;
											return e |= 0,
												r = 0 | x.length,
												(0 | e) > 0 & (0 | (n = (t = 0 | C[k >> 2]) + e | 0)) < (0 | t) | (0 | n) < 0 ? (oe(),
													ne(12),
													-1) : (0 | n) > (0 | r) && !(0 | void oe()) ? (ne(12),
													-1) : (C[k >> 2] = 0 | n,
												0 | t)
										},
										n: q,
										k: function(e) {
											var t = Date.now() / 1e3 | 0;
											return e && (C[e >> 2] = t),
												t
										}
									}
										, ue = t.asm({}, ie, P);
									t.asm = ue,
										t.___wasm_call_ctors = function() {
											return t.asm.__wasm_call_ctors.apply(null, arguments)
										}
									;
									var ae = t._emscripten_bind_VoidPtr___destroy___0 = function() {
											return t.asm.v.apply(null, arguments)
										}
										, se = t._emscripten_bind_Container_Container_0 = function() {
											return t.asm.w.apply(null, arguments)
										}
										, ce = t._emscripten_bind_Container_init_3 = function() {
											return t.asm.x.apply(null, arguments)
										}
										, fe = t._emscripten_bind_Container_writeFrame_3 = function() {
											return t.asm.y.apply(null, arguments)
										}
										, le = t._emscripten_bind_Container___destroy___0 = function() {
											return t.asm.z.apply(null, arguments)
										}
									;
									function pe(e) {
										this.name = "ExitStatus",
											this.message = "Program terminated with exit(" + e + ")",
											this.status = e
									}
									function de(e) {
										function n() {
											t.calledRun || (t.calledRun = !0,
											B || (z || (z = !0,
												U(H)),
												U(W),
											t.onRuntimeInitialized && t.onRuntimeInitialized(),
												function() {
													if (t.postRun)
														for ("function" == typeof t.postRun && (t.postRun = [t.postRun]); t.postRun.length; )
															e = t.postRun.shift(),
																D.unshift(e);
													var e;
													U(D)
												}()))
										}
										e = e || t.arguments,
										X > 0 || (function() {
											if (t.preRun)
												for ("function" == typeof t.preRun && (t.preRun = [t.preRun]); t.preRun.length; )
													e = t.preRun.shift(),
														M.unshift(e);
											var e;
											U(M)
										}(),
										X > 0 || t.calledRun || (t.setStatus ? (t.setStatus("Running..."),
											setTimeout(function() {
												setTimeout(function() {
													t.setStatus("")
												}, 1),
													n()
											}, 1)) : n()))
									}
									function he(e) {
										throw t.onAbort && t.onAbort(e),
											void 0 !== e ? (S(e),
												E(e),
												e = '"' + e + '"') : e = "",
											B = !0,
										"abort(" + e + "). Build with -s ASSERTIONS=1 for more info."
									}
									if (t._opus_encoder_create = function() {
										return t.asm.A.apply(null, arguments)
									}
										,
										t._opus_encode_float = function() {
											return t.asm.B.apply(null, arguments)
										}
										,
										t._opus_encoder_ctl = function() {
											return t.asm.C.apply(null, arguments)
										}
										,
										t._opus_encoder_destroy = function() {
											return t.asm.D.apply(null, arguments)
										}
										,
										t._speex_resampler_init = function() {
											return t.asm.E.apply(null, arguments)
										}
										,
										t._speex_resampler_destroy = function() {
											return t.asm.F.apply(null, arguments)
										}
										,
										t._speex_resampler_process_interleaved_float = function() {
											return t.asm.G.apply(null, arguments)
										}
										,
										t._malloc = function() {
											return t.asm.H.apply(null, arguments)
										}
										,
										t._free = function() {
											return t.asm.I.apply(null, arguments)
										}
										,
										t.dynCall_vi = function() {
											return t.asm.J.apply(null, arguments)
										}
										,
										t.dynCall_v = function() {
											return t.asm.K.apply(null, arguments)
										}
										,
										t.asm = ue,
										t.then = function(e) {
											if (t.calledRun)
												e(t);
											else {
												var n = t.onRuntimeInitialized;
												t.onRuntimeInitialized = function() {
													n && n(),
														e(t)
												}
											}
											return t
										}
										,
										pe.prototype = new Error,
										pe.prototype.constructor = pe,
										N = function e() {
											t.calledRun || de(),
											t.calledRun || (N = e)
										}
										,
										t.run = de,
										t.abort = he,
										t.preInit)
										for ("function" == typeof t.preInit && (t.preInit = [t.preInit]); t.preInit.length > 0; )
											t.preInit.pop()();
									function me() {}
									function ye(e) {
										return (e || me).__cache__
									}
									function _e(e, t) {
										var n = ye(t)
											, r = n[e];
										return r || ((r = Object.create((t || me).prototype)).ptr = e,
											n[e] = r)
									}
									function ve() {
										throw "cannot construct a VoidPtr, no constructor in IDL"
									}
									function be() {
										this.ptr = se(),
											ye(be)[this.ptr] = this
									}
									return t.noExitRuntime = !0,
										de(),
										me.prototype = Object.create(me.prototype),
										me.prototype.constructor = me,
										me.prototype.__class__ = me,
										me.__cache__ = {},
										t.WrapperObject = me,
										t.getCache = ye,
										t.wrapPointer = _e,
										t.castObject = function(e, t) {
											return _e(e.ptr, t)
										}
										,
										t.NULL = _e(0),
										t.destroy = function(e) {
											if (!e.__destroy__)
												throw "Error: Cannot destroy object. (Did you create it yourself?)";
											e.__destroy__(),
												delete ye(e.__class__)[e.ptr]
										}
										,
										t.compare = function(e, t) {
											return e.ptr === t.ptr
										}
										,
										t.getPointer = function(e) {
											return e.ptr
										}
										,
										t.getClass = function(e) {
											return e.__class__
										}
										,
										ve.prototype = Object.create(me.prototype),
										ve.prototype.constructor = ve,
										ve.prototype.__class__ = ve,
										ve.__cache__ = {},
										t.VoidPtr = ve,
										ve.prototype.__destroy__ = ve.prototype.__destroy__ = function() {
											var e = this.ptr;
											ae(e)
										}
										,
										be.prototype = Object.create(me.prototype),
										be.prototype.constructor = be,
										be.prototype.__class__ = be,
										be.__cache__ = {},
										t.Container = be,
										be.prototype.init = be.prototype.init = function(e, t, n) {
											var r = this.ptr;
											e && "object" === u(e) && (e = e.ptr),
											t && "object" === u(t) && (t = t.ptr),
											n && "object" === u(n) && (n = n.ptr),
												ce(r, e, t, n)
										}
										,
										be.prototype.writeFrame = be.prototype.writeFrame = function(e, t, n) {
											var r = this.ptr;
											e && "object" === u(e) && (e = e.ptr),
											t && "object" === u(t) && (t = t.ptr),
											n && "object" === u(n) && (n = n.ptr),
												fe(r, e, t, n)
										}
										,
										be.prototype.__destroy__ = be.prototype.__destroy__ = function() {
											var e = this.ptr;
											le(e)
										}
										,
										function() {
											function e() {}
											var t;
											z || (t = e,
												W.unshift(t))
										}(),
										t
								}
						);
						"object" === u(t) && "object" === u(o) ? o.exports = c : void 0 === (i = function() {
							return c
						}
							.apply(t, [])) || (o.exports = i)
					}
				).call(this, n(1), "/", n(2)(e))
			}
			, function(e, t, n) {
				(function(e, r, o) {
						var i;
						function u(e) {
							return (u = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(e) {
										return typeof e
									}
									: function(e) {
										return e && "function" == typeof Symbol && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e
									}
							)(e)
						}
						function a(e, t) {
							for (var n = 0; n < t.length; n++) {
								var r = t[n];
								r.enumerable = r.enumerable || !1,
									r.configurable = !0,
								"value"in r && (r.writable = !0),
									Object.defineProperty(e, r.key, r)
							}
						}
						var s, c = (s = "undefined" != typeof document && document.currentScript ? document.currentScript.src : void 0,
								function(t) {
									t = void 0 !== (t = t || {}) ? t : {};
									var o = n(0).EmscriptenMemoryAllocator
										, i = 48e3
										, c = 4e3
										, f = 20
										, l = 4096
										, p = function() {
										function e(n, r) {
											var u = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : void 0;
											!function(e, t) {
												if (!(e instanceof t))
													throw new TypeError("Cannot call a class as a function")
											}(this, e),
												this.config = {
													inputSampleRate: n,
													channelCount: r
												},
												this.memory = new o(t),
												this._opus_encoder_create = t._opus_encoder_create,
												this._opus_encoder_ctl = t._opus_encoder_ctl,
												this._opus_encode_float = t._opus_encode_float,
												this._opus_encoder_destroy = t._opus_encoder_destroy,
												this._speex_resampler_init = t._speex_resampler_init,
												this._speex_resampler_process_interleaved_float = t._speex_resampler_process_interleaved_float,
												this._speex_resampler_destroy = t._speex_resampler_destroy,
												this._container = new t.Container,
												this._container.init(i, r, Math.floor(4294967295 * Math.random())),
												this.OpusInitCodec(i, r, u),
												this.SpeexInitResampler(n, i, r),
												this.inputSamplesPerChannel = n * f / 1e3,
												this.outputSamplePerChannel = i * f / 1e3,
												this.inputBufferIndex = 0,
												this.mInputBuffer = this.memory.mallocFloat32Buffer(this.inputSamplesPerChannel * r),
												this.mResampledBuffer = this.memory.mallocFloat32Buffer(this.outputSamplePerChannel * r),
												this.mOutputBuffer = this.memory.mallocUint8Buffer(c),
												this.interleavedBuffers = 1 !== r ? new Float32Array(l * r) : void 0
										}
										var n, r, u;
										return n = e,
										(r = [{
											key: "encode",
											value: function(e) {
												for (var t = this.interleave(e), n = 0; n < t.length; ) {
													var r = Math.min(this.mInputBuffer.length - this.inputBufferIndex, t.length - n);
													if (this.mInputBuffer.set(t.subarray(n, n + r), this.inputBufferIndex),
														this.inputBufferIndex += r,
													this.inputBufferIndex >= this.mInputBuffer.length) {
														var o = this.memory.mallocUint32(this.inputSamplesPerChannel)
															, i = this.memory.mallocUint32(this.outputSamplePerChannel)
															, u = this._speex_resampler_process_interleaved_float(this.resampler, this.mInputBuffer.pointer, o.pointer, this.mResampledBuffer.pointer, i.pointer);
														if (o.free(),
															i.free(),
														0 !== u)
															throw new Error("Resampling error.");
														var a = this._opus_encode_float(this.encoder, this.mResampledBuffer.pointer, this.outputSamplePerChannel, this.mOutputBuffer.pointer, this.mOutputBuffer.length);
														if (a < 0)
															throw new Error("Opus encoding error.");
														this._container.writeFrame(this.mOutputBuffer.pointer, a, this.outputSamplePerChannel),
															this.inputBufferIndex = 0
													}
													n += r
												}
											}
										}, {
											key: "close",
											value: function() {
												for (var e = this.config.channelCount, n = [], r = 0; r < e; ++r)
													n.push(new Float32Array(l - this.inputBufferIndex / e));
												this.encode(n),
													t.destroy(this._container),
													this.mInputBuffer.free(),
													this.mResampledBuffer.free(),
													this.mOutputBuffer.free(),
													this._opus_encoder_destroy(this.encoder),
													this._speex_resampler_destroy(this.resampler)
											}
										}, {
											key: "interleave",
											value: function(e) {
												var t = e.length;
												if (1 === t)
													return e[0];
												for (var n = 0; n < t; n++)
													for (var r = e[n], o = 0; o < r.length; o++)
														this.interleavedBuffers[o * t + n] = r[o];
												return this.interleavedBuffers
											}
										}, {
											key: "OpusInitCodec",
											value: function(e, t) {
												var n = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : void 0
													, r = this.memory.mallocUint32(void 0);
												this.encoder = this._opus_encoder_create(e, t, 2049, r.pointer);
												var o = r.value;
												if (r.free(),
												0 !== o)
													throw new Error("Opus encodor initialization failed.");
												n && this.OpusSetOpusControl(4002, n)
											}
										}, {
											key: "OpusSetOpusControl",
											value: function(e, t) {
												var n = this.memory.mallocInt32(t);
												this._opus_encoder_ctl(this.encoder, e, n.pointer),
													n.free()
											}
										}, {
											key: "SpeexInitResampler",
											value: function(e, t, n) {
												var r = this.memory.mallocUint32(void 0);
												this.resampler = this._speex_resampler_init(n, e, t, 6, r.pointer);
												var o = r.value;
												if (r.free(),
												0 !== o)
													throw new Error("Initializing resampler failed.")
											}
										}]) && a(n.prototype, r),
										u && a(n, u),
											e
									}();
									t.init = function(e, n, r) {
										t.encodedBuffers = [],
											t.encoder = new p(e,n,r)
									}
										,
										t.encode = function(e) {
											t.encoder.encode(e)
										}
										,
										t.flush = function() {
											return t.encodedBuffers.splice(0, t.encodedBuffers.length)
										}
										,
										t.close = function() {
											t.encoder.close()
										}
									;
									var d, h = {};
									for (d in t)
										t.hasOwnProperty(d) && (h[d] = t[d]);
									t.arguments = [],
										t.thisProgram = "./this.program",
										t.quit = function(e, t) {
											throw t
										}
										,
										t.preRun = [],
										t.postRun = [];
									var m, y, _ = !1, v = !1;
									_ = "object" === ("undefined" == typeof window ? "undefined" : u(window)),
										v = "function" == typeof importScripts,
										m = "object" === (void 0 === e ? "undefined" : u(e)) && !_ && !v,
										y = !_ && !m && !v;
									var b, g, w = "";
									m ? (w = r + "/",
											t.read = function(e, t) {
												var r;
												return b || (b = n(3)),
												g || (g = n(4)),
													e = g.normalize(e),
													r = b.readFileSync(e),
													t ? r : r.toString()
											}
											,
											t.readBinary = function(e) {
												var n = t.read(e, !0);
												return n.buffer || (n = new Uint8Array(n)),
													R(n.buffer),
													n
											}
											,
										e.argv.length > 1 && (t.thisProgram = e.argv[1].replace(/\\/g, "/")),
											t.arguments = e.argv.slice(2),
											e.on("uncaughtException", function(e) {
												if (!(e instanceof fe))
													throw e
											}),
											e.on("unhandledRejection", pe),
											t.quit = function(t) {
												e.exit(t)
											}
											,
											t.inspect = function() {
												return "[Emscripten Module object]"
											}
									) : y ? ("undefined" != typeof read && (t.read = function(e) {
											return read(e)
										}
									),
										t.readBinary = function(e) {
											var t;
											return "function" == typeof readbuffer ? new Uint8Array(readbuffer(e)) : (R("object" === u(t = read(e, "binary"))),
												t)
										}
										,
										"undefined" != typeof scriptArgs ? t.arguments = scriptArgs : void 0 !== arguments && (t.arguments = arguments),
									"function" == typeof quit && (t.quit = function(e) {
											quit(e)
										}
									)) : (_ || v) && (v ? w = self.location.href : document.currentScript && (w = document.currentScript.src),
										s && (w = s),
											w = 0 !== w.indexOf("blob:") ? w.substr(0, w.lastIndexOf("/") + 1) : "",
											t.read = function(e) {
												var t = new XMLHttpRequest;
												return t.open("GET", e, !1),
													t.send(null),
													t.responseText
											}
											,
										v && (t.readBinary = function(e) {
												var t = new XMLHttpRequest;
												return t.open("GET", e, !1),
													t.responseType = "arraybuffer",
													t.send(null),
													new Uint8Array(t.response)
											}
										),
											t.readAsync = function(e, t, n) {
												var r = new XMLHttpRequest;
												r.open("GET", e, !0),
													r.responseType = "arraybuffer",
													r.onload = function() {
														200 == r.status || 0 == r.status && r.response ? t(r.response) : n()
													}
													,
													r.onerror = n,
													r.send(null)
											}
											,
											t.setWindowTitle = function(e) {
												document.title = e
											}
									);
									var A, S = t.print || ("undefined" != typeof console ? console.log.bind(console) : "undefined" != typeof print ? print : null), E = t.printErr || ("undefined" != typeof printErr ? printErr : "undefined" != typeof console && console.warn.bind(console) || S);
									for (d in h)
										h.hasOwnProperty(d) && (t[d] = h[d]);
									h = void 0,
									"object" !== ("undefined" == typeof WebAssembly ? "undefined" : u(WebAssembly)) && E("no native wasm support detected");
									var B = !1;
									function R(e, t) {
										e || pe("Assertion failed: " + t)
									}
									var P, x, O, C, I = "undefined" != typeof TextDecoder ? new TextDecoder("utf8") : void 0;
									function T(e, t) {
										return e ? function(e, t, n) {
											for (var r = t + n, o = t; e[o] && !(o >= r); )
												++o;
											if (o - t > 16 && e.subarray && I)
												return I.decode(e.subarray(t, o));
											for (var i = ""; t < o; ) {
												var u = e[t++];
												if (128 & u) {
													var a = 63 & e[t++];
													if (192 != (224 & u)) {
														var s = 63 & e[t++];
														if ((u = 224 == (240 & u) ? (15 & u) << 12 | a << 6 | s : (7 & u) << 18 | a << 12 | s << 6 | 63 & e[t++]) < 65536)
															i += String.fromCharCode(u);
														else {
															var c = u - 65536;
															i += String.fromCharCode(55296 | c >> 10, 56320 | 1023 & c)
														}
													} else
														i += String.fromCharCode((31 & u) << 6 | a)
												} else
													i += String.fromCharCode(u)
											}
											return i
										}(O, e, t) : ""
									}
									"undefined" != typeof TextDecoder && new TextDecoder("utf-16le");
									var j = 40912
										, k = t.TOTAL_MEMORY || 16777216;
									function F(e) {
										for (; e.length > 0; ) {
											var n = e.shift();
											if ("function" != typeof n) {
												var r = n.func;
												"number" == typeof r ? void 0 === n.arg ? t.dynCall_v(r) : t.dynCall_vi(r, n.arg) : r(void 0 === n.arg ? null : n.arg)
											} else
												n()
										}
									}
									k < 5242880 && E("TOTAL_MEMORY should be larger than TOTAL_STACK, was " + k + "! (TOTAL_STACK=5242880)"),
										t.buffer ? P = t.buffer : "object" === ("undefined" == typeof WebAssembly ? "undefined" : u(WebAssembly)) && "function" == typeof WebAssembly.Memory ? (A = new WebAssembly.Memory({
											initial: k / 65536,
											maximum: k / 65536
										}),
											P = A.buffer) : P = new ArrayBuffer(k),
										t.HEAP8 = x = new Int8Array(P),
										t.HEAP16 = new Int16Array(P),
										t.HEAP32 = C = new Int32Array(P),
										t.HEAPU8 = O = new Uint8Array(P),
										t.HEAPU16 = new Uint16Array(P),
										t.HEAPU32 = new Uint32Array(P),
										t.HEAPF32 = new Float32Array(P),
										t.HEAPF64 = new Float64Array(P),
										C[j >> 2] = 5283824;
									var U = []
										, M = []
										, H = []
										, W = []
										, D = !1
										, z = Math.abs
										, L = Math.sqrt
										, q = Math.ceil
										, G = Math.floor
										, V = 0
										, X = null
										, K = null;
									t.preloadedImages = {},
										t.preloadedAudios = {};
									var N = "data:application/octet-stream;base64,";
									function Y(e) {
										return String.prototype.startsWith ? e.startsWith(N) : 0 === e.indexOf(N)
									}
									var J, Z = "OggOpusEncoder.wasm";
									function $() {
										try {
											if (t.wasmBinary)
												return new Uint8Array(t.wasmBinary);
											if (t.readBinary)
												return t.readBinary(Z);
											throw "both async and sync fetching of the wasm failed"
										} catch (e) {
											pe(e)
										}
									}
									function Q(e) {
										var n = {
											env: e
										};
										function r(e, n) {
											var r = e.exports;
											t.asm = r,
												function(e) {
													if (V--,
													t.monitorRunDependencies && t.monitorRunDependencies(V),
													0 == V && (null !== X && (clearInterval(X),
														X = null),
														K)) {
														var n = K;
														K = null,
															n()
													}
												}()
										}
										function o(e) {
											r(e.instance)
										}
										function i(e) {
											return (t.wasmBinary || !_ && !v || "function" != typeof fetch ? new Promise(function(e, t) {
													e($())
												}
											) : fetch(Z, {
												credentials: "same-origin"
											}).then(function(e) {
												if (!e.ok)
													throw "failed to load wasm binary file at '" + Z + "'";
												return e.arrayBuffer()
											}).catch(function() {
												return $()
											})).then(function(e) {
												return WebAssembly.instantiate(e, n)
											}).then(e, function(e) {
												E("failed to asynchronously prepare wasm: " + e),
													pe(e)
											})
										}
										if (V++,
										t.monitorRunDependencies && t.monitorRunDependencies(V),
											t.instantiateWasm)
											try {
												return t.instantiateWasm(n, r)
											} catch (e) {
												return E("Module.instantiateWasm callback failed with error: " + e),
													!1
											}
										return function() {
											if (t.wasmBinary || "function" != typeof WebAssembly.instantiateStreaming || Y(Z) || "function" != typeof fetch)
												return i(o);
											fetch(Z, {
												credentials: "same-origin"
											}).then(function(e) {
												return WebAssembly.instantiateStreaming(e, n).then(o, function(e) {
													E("wasm streaming compile failed: " + e),
														E("falling back to ArrayBuffer instantiation"),
														i(o)
												})
											})
										}(),
											{}
									}
									function ee(e) {
										return (e = +e) >= 0 ? +G(e + .5) : +q(e - .5)
									}
									function te(e) {
										return t.___errno_location && (C[t.___errno_location() >> 2] = e),
											e
									}
									function ne(e) {
										pe("OOM")
									}
									Y(Z) || (J = Z,
										Z = t.locateFile ? t.locateFile(J, w) : w + J),
										t.asm = function(e, t, n) {
											return t.memory = A,
												t.table = new WebAssembly.Table({
													initial: 31,
													maximum: 31,
													element: "anyfunc"
												}),
												Q(t)
										}
									;
									var re = {
										b: function(e, t, n, r) {
											pe("Assertion failed: " + T(e) + ", at: " + [t ? T(t) : "unknown filename", n, r ? T(r) : "unknown function"])
										},
										j: function() {
											throw B = !0,
												"Pure virtual function called!"
										},
										i: function() {
											t.abort()
										},
										a: z,
										d: function(e, n) {
											var r = new Uint8Array(t.HEAPU8.buffer,e,n);
											t.encodedBuffers.push(new Uint8Array(r).buffer)
										},
										g: function(e, t, n) {
											O.set(O.subarray(t, t + n), e)
										},
										h: z,
										k: G,
										f: function(e) {
											return (e = +e) - +G(e) != .5 ? +ee(e) : 2 * +ee(e / 2)
										},
										c: function(e) {
											var t, n, r;
											return e |= 0,
												r = 0 | x.length,
												(0 | e) > 0 & (0 | (n = (t = 0 | C[j >> 2]) + e | 0)) < (0 | t) | (0 | n) < 0 ? (ne(),
													te(12),
													-1) : (0 | n) > (0 | r) && !(0 | void ne()) ? (te(12),
													-1) : (C[j >> 2] = 0 | n,
												0 | t)
										},
										e: L
									}
										, oe = t.asm({}, re, P);
									t.asm = oe,
										t.___wasm_call_ctors = function() {
											return t.asm.__wasm_call_ctors.apply(null, arguments)
										}
									;
									var ie = t._emscripten_bind_VoidPtr___destroy___0 = function() {
											return t.asm.l.apply(null, arguments)
										}
										, ue = t._emscripten_bind_Container_Container_0 = function() {
											return t.asm.m.apply(null, arguments)
										}
										, ae = t._emscripten_bind_Container_init_3 = function() {
											return t.asm.n.apply(null, arguments)
										}
										, se = t._emscripten_bind_Container_writeFrame_3 = function() {
											return t.asm.o.apply(null, arguments)
										}
										, ce = t._emscripten_bind_Container___destroy___0 = function() {
											return t.asm.p.apply(null, arguments)
										}
									;
									function fe(e) {
										this.name = "ExitStatus",
											this.message = "Program terminated with exit(" + e + ")",
											this.status = e
									}
									function le(e) {
										function n() {
											t.calledRun || (t.calledRun = !0,
											B || (D || (D = !0,
												F(M)),
												F(H),
											t.onRuntimeInitialized && t.onRuntimeInitialized(),
												function() {
													if (t.postRun)
														for ("function" == typeof t.postRun && (t.postRun = [t.postRun]); t.postRun.length; )
															e = t.postRun.shift(),
																W.unshift(e);
													var e;
													F(W)
												}()))
										}
										e = e || t.arguments,
										V > 0 || (function() {
											if (t.preRun)
												for ("function" == typeof t.preRun && (t.preRun = [t.preRun]); t.preRun.length; )
													e = t.preRun.shift(),
														U.unshift(e);
											var e;
											F(U)
										}(),
										V > 0 || t.calledRun || (t.setStatus ? (t.setStatus("Running..."),
											setTimeout(function() {
												setTimeout(function() {
													t.setStatus("")
												}, 1),
													n()
											}, 1)) : n()))
									}
									function pe(e) {
										throw t.onAbort && t.onAbort(e),
											void 0 !== e ? (S(e),
												E(e),
												e = '"' + e + '"') : e = "",
											B = !0,
										"abort(" + e + "). Build with -s ASSERTIONS=1 for more info."
									}
									if (t._opus_encoder_create = function() {
										return t.asm.q.apply(null, arguments)
									}
										,
										t._opus_encode_float = function() {
											return t.asm.r.apply(null, arguments)
										}
										,
										t._opus_encoder_ctl = function() {
											return t.asm.s.apply(null, arguments)
										}
										,
										t._opus_encoder_destroy = function() {
											return t.asm.t.apply(null, arguments)
										}
										,
										t._malloc = function() {
											return t.asm.u.apply(null, arguments)
										}
										,
										t._free = function() {
											return t.asm.v.apply(null, arguments)
										}
										,
										t._speex_resampler_init = function() {
											return t.asm.w.apply(null, arguments)
										}
										,
										t._speex_resampler_destroy = function() {
											return t.asm.x.apply(null, arguments)
										}
										,
										t._speex_resampler_process_interleaved_float = function() {
											return t.asm.y.apply(null, arguments)
										}
										,
										t.dynCall_vi = function() {
											return t.asm.z.apply(null, arguments)
										}
										,
										t.dynCall_v = function() {
											return t.asm.A.apply(null, arguments)
										}
										,
										t.asm = oe,
										t.then = function(e) {
											if (t.calledRun)
												e(t);
											else {
												var n = t.onRuntimeInitialized;
												t.onRuntimeInitialized = function() {
													n && n(),
														e(t)
												}
											}
											return t
										}
										,
										fe.prototype = new Error,
										fe.prototype.constructor = fe,
										K = function e() {
											t.calledRun || le(),
											t.calledRun || (K = e)
										}
										,
										t.run = le,
										t.abort = pe,
										t.preInit)
										for ("function" == typeof t.preInit && (t.preInit = [t.preInit]); t.preInit.length > 0; )
											t.preInit.pop()();
									function de() {}
									function he(e) {
										return (e || de).__cache__
									}
									function me(e, t) {
										var n = he(t)
											, r = n[e];
										return r || ((r = Object.create((t || de).prototype)).ptr = e,
											n[e] = r)
									}
									function ye() {
										throw "cannot construct a VoidPtr, no constructor in IDL"
									}
									function _e() {
										this.ptr = ue(),
											he(_e)[this.ptr] = this
									}
									return t.noExitRuntime = !0,
										le(),
										de.prototype = Object.create(de.prototype),
										de.prototype.constructor = de,
										de.prototype.__class__ = de,
										de.__cache__ = {},
										t.WrapperObject = de,
										t.getCache = he,
										t.wrapPointer = me,
										t.castObject = function(e, t) {
											return me(e.ptr, t)
										}
										,
										t.NULL = me(0),
										t.destroy = function(e) {
											if (!e.__destroy__)
												throw "Error: Cannot destroy object. (Did you create it yourself?)";
											e.__destroy__(),
												delete he(e.__class__)[e.ptr]
										}
										,
										t.compare = function(e, t) {
											return e.ptr === t.ptr
										}
										,
										t.getPointer = function(e) {
											return e.ptr
										}
										,
										t.getClass = function(e) {
											return e.__class__
										}
										,
										ye.prototype = Object.create(de.prototype),
										ye.prototype.constructor = ye,
										ye.prototype.__class__ = ye,
										ye.__cache__ = {},
										t.VoidPtr = ye,
										ye.prototype.__destroy__ = ye.prototype.__destroy__ = function() {
											var e = this.ptr;
											ie(e)
										}
										,
										_e.prototype = Object.create(de.prototype),
										_e.prototype.constructor = _e,
										_e.prototype.__class__ = _e,
										_e.__cache__ = {},
										t.Container = _e,
										_e.prototype.init = _e.prototype.init = function(e, t, n) {
											var r = this.ptr;
											e && "object" === u(e) && (e = e.ptr),
											t && "object" === u(t) && (t = t.ptr),
											n && "object" === u(n) && (n = n.ptr),
												ae(r, e, t, n)
										}
										,
										_e.prototype.writeFrame = _e.prototype.writeFrame = function(e, t, n) {
											var r = this.ptr;
											e && "object" === u(e) && (e = e.ptr),
											t && "object" === u(t) && (t = t.ptr),
											n && "object" === u(n) && (n = n.ptr),
												se(r, e, t, n)
										}
										,
										_e.prototype.__destroy__ = _e.prototype.__destroy__ = function() {
											var e = this.ptr;
											ce(e)
										}
										,
										function() {
											function e() {}
											var t;
											D || (t = e,
												H.unshift(t))
										}(),
										t
								}
						);
						"object" === u(t) && "object" === u(o) ? o.exports = c : void 0 === (i = function() {
							return c
						}
							.apply(t, [])) || (o.exports = i)
					}
				).call(this, n(1), "/", n(2)(e))
			}
		]);
	}
});