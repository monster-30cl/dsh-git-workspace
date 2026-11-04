window.__ModuleLoader__.load({
	id: "@deepseek-ai/dsh-client-ui-sidebar-git-history",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let react_jsx_runtime = require("react/jsx-runtime");
		let react = require("react");
		let _deepseek_ai_dsh_client_ui_primitives = require("@deepseek-ai/dsh-client-ui-primitives");
		let _deepseek_ai_dsh_client_store = require("@deepseek-ai/dsh-client-store");
		//#region ../../../vendor/cosmokit/lib/index.js
		/** Return true when a value is `null` or `undefined`. */
		function isNullable(value) {
			return value === null || value === void 0;
		}
		/** Return true for non-array object values. */
		function isPlainObject(data) {
			return data && typeof data === "object" && !Array.isArray(data);
		}
		/** Filter object entries and return a new object. */
		function filterKeys(object, filter) {
			return Object.fromEntries(Object.entries(object).filter(([key, value]) => filter(key, value)));
		}
		/** Map object values while preserving the original key set. */
		function mapValues(object, transform) {
			return Object.fromEntries(Object.entries(object).map(([key, value]) => [key, transform(value, key)]));
		}
		/** Pick selected keys from an object, optionally including `undefined` values. */
		function pick(source, keys, forced) {
			if (!keys) return { ...source };
			const result = {};
			for (const key of keys) if (forced || source[key] !== void 0) result[key] = source[key];
			return result;
		}
		/** Test values using `instanceof` with a `toStringTag` fallback. */
		function is(type, value) {
			if (arguments.length === 1) return (value) => is(type, value);
			return type in globalThis && value instanceof globalThis[type] || Object.prototype.toString.call(value).slice(8, -1) === type;
		}
		function isArrayBufferLike(value) {
			return is("ArrayBuffer", value) || is("SharedArrayBuffer", value);
		}
		function isArrayBufferSource(value) {
			return isArrayBufferLike(value) || ArrayBuffer.isView(value);
		}
		/** Binary source detection and base64/hex conversion helpers. */
		var Binary;
		(function(Binary) {
			Binary.is = isArrayBufferLike;
			Binary.isSource = isArrayBufferSource;
			function fromSource(source) {
				if (ArrayBuffer.isView(source)) return source.buffer.slice(source.byteOffset, source.byteOffset + source.byteLength);
				else return source;
			}
			Binary.fromSource = fromSource;
			function toBase64(source) {
				source = fromSource(source);
				if (typeof Buffer !== "undefined") return Buffer.from(source).toString("base64");
				let binary = "";
				const bytes = new Uint8Array(source);
				for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
				return btoa(binary);
			}
			Binary.toBase64 = toBase64;
			function fromBase64(source) {
				if (typeof Buffer !== "undefined") return fromSource(Buffer.from(source, "base64"));
				return Uint8Array.from(atob(source), (c) => c.charCodeAt(0));
			}
			Binary.fromBase64 = fromBase64;
			function toHex(source) {
				source = fromSource(source);
				if (typeof Buffer !== "undefined") return Buffer.from(source).toString("hex");
				return Array.from(new Uint8Array(source), (byte) => byte.toString(16).padStart(2, "0")).join("");
			}
			Binary.toHex = toHex;
			function fromHex(source) {
				if (typeof Buffer !== "undefined") return fromSource(Buffer.from(source, "hex"));
				const hex = source.length % 2 === 0 ? source : source.slice(0, source.length - 1);
				const buffer = [];
				for (let i = 0; i < hex.length; i += 2) buffer.push(parseInt(`${hex[i]}${hex[i + 1]}`, 16));
				return Uint8Array.from(buffer).buffer;
			}
			Binary.fromHex = fromHex;
		})(Binary || (Binary = {}));
		Binary.fromBase64;
		Binary.toBase64;
		Binary.fromHex;
		Binary.toHex;
		/** Deep-clone common JavaScript values while preserving prototypes and cycles. */
		function clone(source, refs = /* @__PURE__ */ new Map()) {
			if (!source || typeof source !== "object") return source;
			if (is("Date", source)) return new Date(source.valueOf());
			if (is("RegExp", source)) return new RegExp(source.source, source.flags);
			if (isArrayBufferLike(source)) return source.slice(0);
			if (ArrayBuffer.isView(source)) return source.buffer.slice(source.byteOffset, source.byteOffset + source.byteLength);
			const cached = refs.get(source);
			if (cached) return cached;
			if (Array.isArray(source)) {
				const result = [];
				refs.set(source, result);
				source.forEach((value, index) => {
					result[index] = Reflect.apply(clone, null, [value, refs]);
				});
				return result;
			}
			const result = Object.create(Object.getPrototypeOf(source));
			refs.set(source, result);
			for (const key of Reflect.ownKeys(source)) {
				const descriptor = { ...Reflect.getOwnPropertyDescriptor(source, key) };
				if ("value" in descriptor) descriptor.value = Reflect.apply(clone, null, [descriptor.value, refs]);
				Reflect.defineProperty(result, key, descriptor);
			}
			return result;
		}
		/** Deeply compare arrays, dates, regexps, buffers, and plain object fields. */
		function deepEqual(a, b, strict) {
			if (a === b) return true;
			if (!strict && isNullable(a) && isNullable(b)) return true;
			if (typeof a !== typeof b) return false;
			if (typeof a !== "object") return false;
			if (!a || !b) return false;
			function check(test, then) {
				return test(a) ? test(b) ? then(a, b) : false : test(b) ? false : void 0;
			}
			return check(Array.isArray, (a, b) => a.length === b.length && a.every((item, index) => deepEqual(item, b[index]))) ?? check(is("Date"), (a, b) => a.valueOf() === b.valueOf()) ?? check(is("RegExp"), (a, b) => a.source === b.source && a.flags === b.flags) ?? check(isArrayBufferLike, (a, b) => {
				if (a.byteLength !== b.byteLength) return false;
				const viewA = new Uint8Array(a);
				const viewB = new Uint8Array(b);
				for (let i = 0; i < viewA.length; i++) if (viewA[i] !== viewB[i]) return false;
				return true;
			}) ?? Object.keys({
				...a,
				...b
			}).every((key) => deepEqual(a[key], b[key], strict));
		}
		/** Time constants plus parsing and formatting helpers. */
		var Time;
		(function(Time) {
			Time.millisecond = 1;
			Time.second = 1e3;
			Time.minute = Time.second * 60;
			Time.hour = Time.minute * 60;
			Time.day = Time.hour * 24;
			Time.week = Time.day * 7;
			let timezoneOffset = (/* @__PURE__ */ new Date()).getTimezoneOffset();
			function setTimezoneOffset(offset) {
				timezoneOffset = offset;
			}
			Time.setTimezoneOffset = setTimezoneOffset;
			function getTimezoneOffset() {
				return timezoneOffset;
			}
			Time.getTimezoneOffset = getTimezoneOffset;
			function getDateNumber(date = /* @__PURE__ */ new Date(), offset) {
				if (typeof date === "number") date = new Date(date);
				if (offset === void 0) offset = timezoneOffset;
				return Math.floor((date.valueOf() / Time.minute - offset) / 1440);
			}
			Time.getDateNumber = getDateNumber;
			function fromDateNumber(value, offset) {
				const date = new Date(value * Time.day);
				if (offset === void 0) offset = timezoneOffset;
				return new Date(+date + offset * Time.minute);
			}
			Time.fromDateNumber = fromDateNumber;
			const numeric = /\d+(?:\.\d+)?/.source;
			const timeRegExp = new RegExp(`^${[
				"w(?:eek(?:s)?)?",
				"d(?:ay(?:s)?)?",
				"h(?:our(?:s)?)?",
				"m(?:in(?:ute)?(?:s)?)?",
				"s(?:ec(?:ond)?(?:s)?)?"
			].map((unit) => `(${numeric}${unit})?`).join("")}$`);
			function parseTime(source) {
				const capture = timeRegExp.exec(source);
				if (!capture) return 0;
				return (parseFloat(capture[1]) * Time.week || 0) + (parseFloat(capture[2]) * Time.day || 0) + (parseFloat(capture[3]) * Time.hour || 0) + (parseFloat(capture[4]) * Time.minute || 0) + (parseFloat(capture[5]) * Time.second || 0);
			}
			Time.parseTime = parseTime;
			function parseDate(date) {
				const parsed = parseTime(date);
				if (parsed) date = Date.now() + parsed;
				else if (/^\d{1,2}(:\d{1,2}){1,2}$/.test(date)) date = `${(/* @__PURE__ */ new Date()).toLocaleDateString()}-${date}`;
				else if (/^\d{1,2}-\d{1,2}-\d{1,2}(:\d{1,2}){1,2}$/.test(date)) date = `${(/* @__PURE__ */ new Date()).getFullYear()}-${date}`;
				return date ? new Date(date) : /* @__PURE__ */ new Date();
			}
			Time.parseDate = parseDate;
			function format(ms) {
				const abs = Math.abs(ms);
				if (abs >= Time.day - Time.hour / 2) return Math.round(ms / Time.day) + "d";
				else if (abs >= Time.hour - Time.minute / 2) return Math.round(ms / Time.hour) + "h";
				else if (abs >= Time.minute - Time.second / 2) return Math.round(ms / Time.minute) + "m";
				else if (abs >= Time.second) return Math.round(ms / Time.second) + "s";
				return ms + "ms";
			}
			Time.format = format;
			function toDigits(source, length = 2) {
				return source.toString().padStart(length, "0");
			}
			Time.toDigits = toDigits;
			function template(template, time = /* @__PURE__ */ new Date()) {
				return template.replace("yyyy", time.getFullYear().toString()).replace("yy", time.getFullYear().toString().slice(2)).replace("MM", toDigits(time.getMonth() + 1)).replace("dd", toDigits(time.getDate())).replace("hh", toDigits(time.getHours())).replace("mm", toDigits(time.getMinutes())).replace("ss", toDigits(time.getSeconds())).replace("SSS", toDigits(time.getMilliseconds(), 3));
			}
			Time.template = template;
		})(Time || (Time = {}));
		//#endregion
		//#region ../../../vendor/schemastery/src/index.ts
		const kSchema = Symbol.for("schemastery");
		const kValidationError = Symbol.for("ValidationError");
		globalThis.__schemastery_index__ ??= 0;
		globalThis.__schemastery_refs__ = void 0;
		var ValidationError = class extends TypeError {
			constructor(message, options) {
				let prefix = "$";
				for (const segment of options.path || []) if (typeof segment === "string") prefix += "." + segment;
				else if (typeof segment === "number") prefix += "[" + segment + "]";
				else if (typeof segment === "symbol") prefix += `[Symbol(${segment.toString()})]`;
				if (prefix.startsWith(".")) prefix = prefix.slice(1);
				super((prefix === "$" ? "" : `${prefix} `) + message);
				this.options = options;
				this.name = "ValidationError";
			}
			static is(error) {
				return !!error?.[kValidationError];
			}
		};
		Object.defineProperty(ValidationError.prototype, kValidationError, { value: true });
		const Schema = function(options) {
			const schema = function(data, options = {}) {
				return Schema.resolve(data, schema, options)[0];
			};
			if (options.refs) {
				const refs = mapValues(options.refs, (options) => new Schema(options));
				const getRef = (uid) => refs[uid];
				for (const key in refs) {
					const options = refs[key];
					options.sKey = getRef(options.sKey);
					options.inner = getRef(options.inner);
					options.list = options.list && options.list.map(getRef);
					options.dict = options.dict && mapValues(options.dict, getRef);
				}
				return refs[options.uid];
			}
			Object.assign(schema, options);
			if (typeof schema.callback === "string") try {
				schema.callback = new Function("return " + schema.callback)();
			} catch {}
			Object.defineProperty(schema, "uid", { value: globalThis.__schemastery_index__++ });
			Object.setPrototypeOf(schema, Schema.prototype);
			schema.meta ||= {};
			schema.toString = schema.toString.bind(schema);
			return schema;
		};
		Schema.prototype = Object.create(Function.prototype);
		Schema.prototype[kSchema] = true;
		Object.defineProperty(Schema.prototype, "~standard", { get() {
			return {
				version: 1,
				vendor: "schemastery",
				validate: (value) => {
					try {
						return { value: Schema.resolve(value, this, {})[0] };
					} catch (error) {
						if (ValidationError.is(error)) return { issues: [{
							message: error.message,
							path: error.options.path
						}] };
						throw error;
					}
				}
			};
		} });
		Schema.ValidationError = ValidationError;
		Schema.prototype.toJSON = function toJSON() {
			if (globalThis.__schemastery_refs__) {
				globalThis.__schemastery_refs__[this.uid] ??= JSON.parse(JSON.stringify({ ...this }));
				return this.uid;
			}
			globalThis.__schemastery_refs__ = { [this.uid]: { ...this } };
			globalThis.__schemastery_refs__[this.uid] = JSON.parse(JSON.stringify({ ...this }));
			const result = {
				uid: this.uid,
				refs: globalThis.__schemastery_refs__
			};
			globalThis.__schemastery_refs__ = void 0;
			return result;
		};
		Schema.prototype.set = function set(key, value) {
			this.dict[key] = value;
			return this;
		};
		Schema.prototype.push = function push(value) {
			this.list.push(value);
			return this;
		};
		function mergeDesc(original, messages) {
			const result = typeof original === "string" ? { "": original } : { ...original };
			for (const locale in messages) {
				const value = messages[locale];
				if (value?.$description || value?.$desc) result[locale] = value.$description || value.$desc;
				else if (typeof value === "string") result[locale] = value;
			}
			return result;
		}
		function getInner(value) {
			return value?.$value ?? value?.$inner;
		}
		function extractKeys(data) {
			return filterKeys(data ?? {}, (key) => !key.startsWith("$"));
		}
		Schema.prototype.i18n = function i18n(messages) {
			const schema = Schema(this);
			const desc = mergeDesc(schema.meta.description, messages);
			if (Object.keys(desc).length) schema.meta.description = desc;
			if (schema.dict) schema.dict = mapValues(schema.dict, (inner, key) => {
				return inner.i18n(mapValues(messages, (data) => getInner(data)?.[key] ?? data?.[key]));
			});
			if (schema.list) schema.list = schema.list.map((inner, index) => {
				return inner.i18n(mapValues(messages, (data = {}) => {
					if (Array.isArray(getInner(data))) return getInner(data)[index];
					if (Array.isArray(data)) return data[index];
					return extractKeys(data);
				}));
			});
			if (schema.inner) schema.inner = schema.inner.i18n(mapValues(messages, (data) => {
				if (getInner(data)) return getInner(data);
				return extractKeys(data);
			}));
			if (schema.sKey) schema.sKey = schema.sKey.i18n(mapValues(messages, (data) => data?.$key));
			return schema;
		};
		Schema.prototype.extra = function extra(key, value) {
			const schema = Schema(this);
			schema.meta = {
				...schema.meta,
				[key]: value
			};
			return schema;
		};
		for (const key of [
			"required",
			"disabled",
			"collapse",
			"hidden",
			"loose"
		]) Object.assign(Schema.prototype, { [key](value = true) {
			const schema = Schema(this);
			schema.meta = {
				...schema.meta,
				[key]: value
			};
			return schema;
		} });
		Schema.prototype.deprecated = function deprecated() {
			const schema = Schema(this);
			schema.meta.badges ||= [];
			schema.meta.badges.push({
				text: "deprecated",
				type: "danger"
			});
			return schema;
		};
		Schema.prototype.experimental = function experimental() {
			const schema = Schema(this);
			schema.meta.badges ||= [];
			schema.meta.badges.push({
				text: "experimental",
				type: "warning"
			});
			return schema;
		};
		Schema.prototype.pattern = function pattern(regexp) {
			const schema = Schema(this);
			const pattern = pick(regexp, ["source", "flags"]);
			schema.meta = {
				...schema.meta,
				pattern
			};
			return schema;
		};
		Schema.prototype.simplify = function simplify(value) {
			if (deepEqual(value, this.meta.default, this.type === "dict")) return null;
			if (isNullable(value)) return value;
			if (this.type === "object" || this.type === "dict") {
				const result = {};
				for (const key in value) {
					const item = (this.type === "object" ? this.dict[key] : this.inner)?.simplify(value[key]);
					if (this.type === "dict" || !isNullable(item)) result[key] = item;
				}
				if (deepEqual(result, this.meta.default, this.type === "dict")) return null;
				return result;
			} else if (this.type === "array" || this.type === "tuple") {
				const result = [];
				value.forEach((value, index) => {
					const schema = this.type === "array" ? this.inner : this.list[index];
					const item = schema ? schema.simplify(value) : value;
					result.push(item);
				});
				return result;
			} else if (this.type === "intersect") {
				const result = {};
				for (const item of this.list) Object.assign(result, item.simplify(value));
				return result;
			} else if (this.type === "union") for (const schema of this.list) try {
				Schema.resolve(value, schema, {});
				return schema.simplify(value);
			} catch {}
			return value;
		};
		Schema.prototype.toString = function toString(inline) {
			return formatters[this.type]?.(this, inline) ?? `Schema<${this.type}>`;
		};
		Schema.prototype.role = function role(role, extra) {
			const schema = Schema(this);
			schema.meta = {
				...schema.meta,
				role,
				extra
			};
			return schema;
		};
		for (const key of [
			"default",
			"link",
			"comment",
			"description",
			"max",
			"min",
			"step"
		]) Object.assign(Schema.prototype, { [key](value) {
			const schema = Schema(this);
			schema.meta = {
				...schema.meta,
				[key]: value
			};
			return schema;
		} });
		const resolvers = {};
		Schema.extend = function extend(type, resolve) {
			resolvers[type] = resolve;
		};
		Schema.resolve = function resolve(data, schema, options = {}, strict = false) {
			if (!schema) return [data];
			if (options.ignore?.(data, schema)) return [data];
			if (isNullable(data) && schema.type !== "lazy") {
				if (schema.meta.required) throw new ValidationError(`missing required value`, options);
				let current = schema;
				let fallback = schema.meta.default;
				while (current?.type === "intersect" && isNullable(fallback)) {
					current = current.list[0];
					fallback = current?.meta.default;
				}
				if (isNullable(fallback)) return [data];
				data = clone(fallback);
			}
			const callback = resolvers[schema.type];
			if (!callback) throw new ValidationError(`unsupported type "${schema.type}"`, options);
			try {
				return callback(data, schema, options, strict);
			} catch (error) {
				if (!schema.meta.loose) throw error;
				return [schema.meta.default];
			}
		};
		Schema.from = function from(source) {
			if (isNullable(source)) return Schema.any();
			else if ([
				"string",
				"number",
				"boolean"
			].includes(typeof source)) return Schema.const(source).required();
			else if (source[kSchema]) return source;
			else if (typeof source === "function") switch (source) {
				case String: return Schema.string().required();
				case Number: return Schema.number().required();
				case Boolean: return Schema.boolean().required();
				case Function: return Schema.function().required();
				default: return Schema.is(source).required();
			}
			else throw new TypeError(`cannot infer schema from ${source}`);
		};
		Schema.lazy = function lazy(builder) {
			const toJSON = () => {
				if (!schema.inner[kSchema]) {
					schema.inner = schema.builder();
					schema.inner.meta = {
						...schema.meta,
						...schema.inner.meta
					};
				}
				return schema.inner.toJSON();
			};
			const schema = new Schema({
				type: "lazy",
				builder,
				inner: { toJSON }
			});
			return schema;
		};
		Schema.natural = function natural() {
			return Schema.number().step(1).min(0);
		};
		Schema.percent = function percent() {
			return Schema.number().step(.01).min(0).max(1).role("slider");
		};
		Schema.date = function date() {
			return Schema.union([Schema.is(Date), Schema.transform(Schema.string().role("datetime"), (value, options) => {
				const date = new Date(value);
				if (isNaN(+date)) throw new ValidationError(`invalid date "${value}"`, options);
				return date;
			}, true)]);
		};
		Schema.regExp = function regExp(flag = "") {
			return Schema.union([Schema.is(RegExp), Schema.transform(Schema.string().role("regexp", { flag }), (value, options) => {
				try {
					return new RegExp(value, flag);
				} catch (e) {
					throw new ValidationError(e.message, options);
				}
			}, true)]);
		};
		Schema.arrayBuffer = function arrayBuffer(encoding) {
			return Schema.union([
				Schema.is(ArrayBuffer),
				Schema.is(SharedArrayBuffer),
				Schema.transform(Schema.any(), (value, options) => {
					if (Binary.isSource(value)) return Binary.fromSource(value);
					throw new ValidationError(`expected ArrayBufferSource but got ${value}`, options);
				}, true),
				...encoding ? [Schema.transform(Schema.string(), (value, options) => {
					try {
						return encoding === "base64" ? Binary.fromBase64(value) : Binary.fromHex(value);
					} catch (e) {
						throw new ValidationError(e.message, options);
					}
				}, true)] : []
			]);
		};
		Schema.extend("lazy", (data, schema, options, strict) => {
			if (!schema.inner[kSchema]) {
				schema.inner = schema.builder();
				schema.inner.meta = {
					...schema.meta,
					...schema.inner.meta
				};
			}
			return Schema.resolve(data, schema.inner, options, strict);
		});
		Schema.extend("any", (data) => {
			return [data];
		});
		Schema.extend("never", (data, _, options) => {
			throw new ValidationError(`expected nullable but got ${data}`, options);
		});
		Schema.extend("const", (data, { value }, options) => {
			if (deepEqual(data, value)) return [value];
			throw new ValidationError(`expected ${value} but got ${data}`, options);
		});
		function checkWithinRange(data, meta, description, options, skipMin = false) {
			const { max = Infinity, min = -Infinity } = meta;
			if (data > max) throw new ValidationError(`expected ${description} <= ${max} but got ${data}`, options);
			if (data < min && !skipMin) throw new ValidationError(`expected ${description} >= ${min} but got ${data}`, options);
		}
		Schema.extend("string", (data, { meta }, options) => {
			if (typeof data !== "string") throw new ValidationError(`expected string but got ${data}`, options);
			if (meta.pattern) {
				const regexp = new RegExp(meta.pattern.source, meta.pattern.flags);
				if (!regexp.test(data)) throw new ValidationError(`expect string to match regexp ${regexp}`, options);
			}
			checkWithinRange(data.length, meta, "string length", options);
			return [data];
		});
		function decimalShift(data, digits) {
			const str = data.toString();
			if (str.includes("e")) return data * Math.pow(10, digits);
			const index = str.indexOf(".");
			if (index === -1) return data * Math.pow(10, digits);
			const frac = str.slice(index + 1);
			const integer = str.slice(0, index);
			if (frac.length <= digits) return +(integer + frac.padEnd(digits, "0"));
			return +(integer + frac.slice(0, digits) + "." + frac.slice(digits));
		}
		function isMultipleOf(data, min, step) {
			step = Math.abs(step);
			if (!/^\d+\.\d+$/.test(step.toString())) return (data - min) % step === 0;
			const index = step.toString().indexOf(".");
			const digits = step.toString().slice(index + 1).length;
			return Math.abs(decimalShift(data, digits) - decimalShift(min, digits)) % decimalShift(step, digits) === 0;
		}
		Schema.extend("number", (data, { meta }, options) => {
			if (typeof data !== "number") throw new ValidationError(`expected number but got ${data}`, options);
			checkWithinRange(data, meta, "number", options);
			const { step } = meta;
			if (step && !isMultipleOf(data, meta.min ?? 0, step)) throw new ValidationError(`expected number multiple of ${step} but got ${data}`, options);
			return [data];
		});
		Schema.extend("boolean", (data, _, options) => {
			if (typeof data === "boolean") return [data];
			throw new ValidationError(`expected boolean but got ${data}`, options);
		});
		Schema.extend("bitset", (data, { bits, meta }, options) => {
			let value = 0, keys = [];
			if (typeof data === "number") {
				value = data;
				for (const key in bits) if (data & bits[key]) keys.push(key);
			} else if (Array.isArray(data)) {
				keys = data;
				for (const key of keys) {
					if (typeof key !== "string") throw new ValidationError(`expected string but got ${key}`, options);
					if (key in bits) value |= bits[key];
				}
			} else throw new ValidationError(`expected number or array but got ${data}`, options);
			if (value === meta.default) return [value];
			return [value, keys];
		});
		Schema.extend("function", (data, _, options) => {
			if (typeof data === "function") return [data];
			throw new ValidationError(`expected function but got ${data}`, options);
		});
		Schema.extend("is", (data, { constructor }, options) => {
			if (typeof constructor === "function") {
				if (data instanceof constructor) return [data];
				throw new ValidationError(`expected ${constructor.name} but got ${data}`, options);
			} else {
				if (isNullable(data)) throw new ValidationError(`expected ${constructor} but got ${data}`, options);
				let prototype = Object.getPrototypeOf(data);
				while (prototype) {
					if (prototype.constructor?.name === constructor) return [data];
					prototype = Object.getPrototypeOf(prototype);
				}
				throw new ValidationError(`expected ${constructor} but got ${data}`, options);
			}
		});
		function property(data, key, schema, options) {
			try {
				const [value, adapted] = Schema.resolve(data[key], schema, {
					...options,
					path: [...options.path || [], key]
				});
				if (adapted !== void 0) data[key] = adapted;
				return value;
			} catch (e) {
				if (!options?.autofix) throw e;
				delete data[key];
				return schema.meta.default;
			}
		}
		Schema.extend("array", (data, { inner, meta }, options) => {
			if (!Array.isArray(data)) throw new ValidationError(`expected array but got ${data}`, options);
			checkWithinRange(data.length, meta, "array length", options, !isNullable(inner.meta.default));
			return [data.map((_, index) => property(data, index, inner, options))];
		});
		Schema.extend("dict", (data, { inner, sKey }, options, strict) => {
			if (!isPlainObject(data)) throw new ValidationError(`expected object but got ${data}`, options);
			const result = {};
			for (const key in data) {
				let rKey;
				try {
					rKey = Schema.resolve(key, sKey, options)[0];
				} catch (error) {
					if (strict) continue;
					throw error;
				}
				result[rKey] = property(data, key, inner, options);
				data[rKey] = data[key];
				if (key !== rKey) delete data[key];
			}
			return [result];
		});
		Schema.extend("tuple", (data, { list }, options, strict) => {
			if (!Array.isArray(data)) throw new ValidationError(`expected array but got ${data}`, options);
			const result = list.map((inner, index) => property(data, index, inner, options));
			if (strict) return [result];
			result.push(...data.slice(list.length));
			return [result];
		});
		function merge(result, data) {
			for (const key in data) {
				if (key in result) continue;
				result[key] = data[key];
			}
		}
		Schema.extend("object", (data, { dict }, options, strict) => {
			if (!isPlainObject(data)) throw new ValidationError(`expected object but got ${data}`, options);
			const result = {};
			for (const key in dict) {
				const value = property(data, key, dict[key], options);
				if (!isNullable(value) || key in data) result[key] = value;
			}
			if (!strict) merge(result, data);
			return [result];
		});
		Schema.extend("union", (data, { list, toString }, options, strict) => {
			const messages = [];
			for (const inner of list) try {
				return Schema.resolve(data, inner, options, strict);
			} catch (error) {
				messages.push(error);
			}
			throw new ValidationError(`expected ${toString()} but got ${JSON.stringify(data)}`, options);
		});
		Schema.extend("intersect", (data, { list, toString }, options, strict) => {
			if (!list.length) return [data];
			let result;
			for (const inner of list) {
				const value = Schema.resolve(data, inner, options, true)[0];
				if (isNullable(value)) continue;
				if (isNullable(result)) result = value;
				else if (typeof result !== typeof value) throw new ValidationError(`expected ${toString()} but got ${JSON.stringify(data)}`, options);
				else if (typeof value === "object") merge(result ??= {}, value);
				else if (result !== value) throw new ValidationError(`expected ${toString()} but got ${JSON.stringify(data)}`, options);
			}
			if (!strict && isPlainObject(data)) merge(result, data);
			return [result];
		});
		Schema.extend("transform", (data, { inner, callback, preserve }, options) => {
			const [result, adapted = data] = Schema.resolve(data, inner, options, true);
			if (preserve) return [callback(result)];
			else return [callback(result), callback(adapted)];
		});
		const formatters = {};
		function defineMethod(name, keys, format) {
			formatters[name] = format;
			Object.assign(Schema, { [name](...args) {
				const schema = new Schema({ type: name });
				keys.forEach((key, index) => {
					switch (key) {
						case "sKey":
							schema.sKey = args[index] ?? Schema.string();
							break;
						case "inner":
							schema.inner = Schema.from(args[index]);
							break;
						case "list":
							schema.list = args[index].map(Schema.from);
							break;
						case "dict":
							schema.dict = mapValues(args[index], Schema.from);
							break;
						case "bits":
							schema.bits = {};
							for (const key in args[index]) {
								if (typeof args[index][key] !== "number") continue;
								schema.bits[key] = args[index][key];
							}
							break;
						case "callback": {
							const callback = schema.callback = args[index];
							callback["toJSON"] ||= () => callback.toString();
							break;
						}
						case "constructor": {
							const constructor = schema.constructor = args[index];
							if (typeof constructor === "function") constructor["toJSON"] ||= () => constructor["name"];
							break;
						}
						default: schema[key] = args[index];
					}
				});
				if (name === "object" || name === "dict") schema.meta.default = {};
				else if (name === "array" || name === "tuple") schema.meta.default = [];
				else if (name === "bitset") schema.meta.default = 0;
				return schema;
			} });
		}
		defineMethod("is", ["constructor"], ({ constructor }) => {
			if (typeof constructor === "function") return constructor.name;
			else return constructor;
		});
		defineMethod("any", [], () => "any");
		defineMethod("never", [], () => "never");
		defineMethod("const", ["value"], ({ value }) => typeof value === "string" ? JSON.stringify(value) : value);
		defineMethod("string", [], () => "string");
		defineMethod("number", [], () => "number");
		defineMethod("boolean", [], () => "boolean");
		defineMethod("bitset", ["bits"], () => "bitset");
		defineMethod("function", [], () => "function");
		defineMethod("array", ["inner"], ({ inner }) => `${inner.toString(true)}[]`);
		defineMethod("dict", ["inner", "sKey"], ({ inner, sKey }) => `{ [key: ${sKey.toString()}]: ${inner.toString()} }`);
		defineMethod("tuple", ["list"], ({ list }) => `[${list.map((inner) => inner.toString()).join(", ")}]`);
		defineMethod("object", ["dict"], ({ dict }) => {
			if (Object.keys(dict).length === 0) return "{}";
			return `{ ${Object.entries(dict).map(([key, inner]) => {
				return `${key}${inner.meta.required ? "" : "?"}: ${inner.toString()}`;
			}).join(", ")} }`;
		});
		defineMethod("union", ["list"], ({ list }, inline) => {
			const result = list.map(({ toString: format }) => format()).join(" | ");
			return inline ? `(${result})` : result;
		});
		defineMethod("intersect", ["list"], ({ list }) => {
			return `${list.map((inner) => inner.toString(true)).join(" & ")}`;
		});
		defineMethod("transform", [
			"inner",
			"callback",
			"preserve"
		], ({ inner }, isInner) => inner.toString(isInner));
		//#endregion
		//#region src/diff-zoom-settings.ts
		/** Code-comparison zoom preference stored in the Host user-settings document. */
		/** Settings namespace owned by the Git review feature. */
		const GIT_HISTORY_SETTINGS_NAMESPACE = "ui-sidebar-git-history";
		/** Field carrying the modifier used with the mouse wheel. */
		const DIFF_ZOOM_MODIFIER_FIELD = "diffZoomModifier";
		/** Keyboard modifiers accepted by the code-comparison zoom gesture. */
		const DIFF_ZOOM_MODIFIERS = [
			"alt",
			"control",
			"shift"
		];
		Schema.object({ [DIFF_ZOOM_MODIFIER_FIELD]: Schema.union([...DIFF_ZOOM_MODIFIERS]).default("alt") });
		/** Whether a wheel event carries the configured modifier. */
		function matchesDiffZoomModifier(event, modifier) {
			switch (modifier) {
				case "alt": return event.altKey;
				case "control": return event.ctrlKey;
				case "shift": return event.shiftKey;
			}
		}
		//#endregion
		//#region src/client/changes.ts
		/**
		* Bind the read to one Remote face.
		* @param remote - the Client Remote face carrying the `gitWorkspace` namespace.
		* @returns the read the working-changes region performs.
		*/
		function createReadChanges(remote) {
			return async (workspaceId, signal) => {
				const [status, stash, pending] = await Promise.all([
					remote.gitWorkspace.status({ workspaceId }, signal),
					remote.gitWorkspace.stash({ workspaceId }, signal),
					remote.gitWorkspace.pendingPush({ workspaceId }, signal)
				]);
				if (!status.ok) return {
					repository: false,
					files: [],
					stashes: [],
					pendingPush: [],
					hasUpstream: false,
					pendingMore: false,
					failure: status.error,
					pendingFailure: void 0,
					stashFailure: void 0
				};
				if (!status.value.repository) return {
					repository: false,
					files: [],
					stashes: [],
					pendingPush: [],
					hasUpstream: false,
					pendingMore: false,
					failure: void 0,
					pendingFailure: void 0,
					stashFailure: void 0
				};
				return {
					repository: true,
					files: status.value.files,
					stashes: stash.ok && stash.value.repository ? stash.value.entries : [],
					pendingPush: pending.ok && pending.value.repository ? pending.value.commits : [],
					hasUpstream: pending.ok && pending.value.repository ? pending.value.upstream : false,
					pendingMore: pending.ok && pending.value.repository ? pending.value.more : false,
					failure: void 0,
					pendingFailure: pending.ok ? void 0 : pending.error,
					stashFailure: stash.ok ? void 0 : stash.error
				};
			};
		}
		//#endregion
		//#region src/client/GitReviewIcon.tsx
		/**
		* Render the tile: an indigo rounded square carrying a white branch glyph.
		* @returns the 20px mark the guide's 26px icon box centres.
		*/
		function GitReviewIcon() {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("svg", {
				viewBox: "0 0 64 64",
				width: 20,
				height: 20,
				"aria-hidden": "true",
				focusable: "false",
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("rect", {
						width: "64",
						height: "64",
						rx: "14",
						fill: "#4C5BD4"
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("g", {
						fill: "none",
						stroke: "#FFFFFF",
						strokeWidth: "4",
						strokeLinecap: "round",
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M22 22.5v19" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M22 32c0-5.5 4.5-6 9-6h5.5" })]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("g", {
						fill: "#FFFFFF",
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("circle", {
								cx: "22",
								cy: "17",
								r: "5.5"
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("circle", {
								cx: "22",
								cy: "47",
								r: "5.5"
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("circle", {
								cx: "42",
								cy: "26",
								r: "5.5"
							})
						]
					})
				]
			});
		}
		//#endregion
		//#region src/client/definition.ts
		/** The tab kind this package owns. */
		const GIT_HISTORY_KIND = "gitHistory";
		/** This implementation's identity in the tab system, and the key its body registers under. */
		const GIT_HISTORY_ID = "@deepseek-ai/dsh-client-ui-sidebar-git-history";
		/**
		* The commit-history type's registry definition.
		* @param t - namespace-bound translate, read fresh on every label call.
		* @returns the definition to register.
		*/
		function gitHistoryDefinition(t) {
			return {
				id: GIT_HISTORY_ID,
				kind: GIT_HISTORY_KIND,
				priority: "builtin",
				title: () => t("type.label"),
				guide: [{
					order: 20,
					title: () => t("guide.title"),
					description: () => t("guide.description"),
					icon: GitReviewIcon
				}]
			};
		}
		//#endregion
		//#region dsh-css:source/git-review/client/DiffZoomShortcutRow.module.css.mjs
		const css$3 = ".NYjLYG_row{border-bottom:.5px solid var(--dsw-alias-border-l2);align-items:center;gap:8px;padding:16px 0;display:flex}.NYjLYG_rowText{flex-direction:column;flex:1;gap:4px;min-width:0;padding-right:48px;display:flex}.NYjLYG_title{color:var(--dsw-alias-label-primary);font-size:14px;font-weight:400;line-height:22px}.NYjLYG_desc{color:var(--dsw-alias-label-tertiary);font-size:12px;font-weight:400;line-height:18px}.NYjLYG_selector{height:36px;color:var(--dsw-alias-label-primary);font:inherit;white-space:nowrap;cursor:pointer;background:var(--dsw-alias-bg-module-platform);border:none;border-radius:18px;align-items:center;gap:12px;padding:0 14px;font-size:14px;line-height:22px;display:inline-flex}.NYjLYG_selector:hover{background:var(--dsw-alias-interactive-bg-hover)}.NYjLYG_chevron{flex:none}";
		const tagId$3 = "@deepseek-ai/dsh-client-ui-sidebar-git-history/DiffZoomShortcutRow.module.css";
		if (typeof document !== "undefined") {
			const sheet = css$3;
			const existing = document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId$3) + "]");
			if (existing === null) {
				const tag = document.createElement("style");
				tag.dataset.plugin = "@deepseek-ai/dsh-client-ui-sidebar-git-history";
				tag.dataset.pluginCss = tagId$3;
				tag.textContent = sheet;
				document.head.appendChild(tag);
			} else if (existing.textContent !== sheet) existing.textContent = sheet;
			}
		var DiffZoomShortcutRow_module_css_default = {
			"chevron": "NYjLYG_chevron",
			"desc": "NYjLYG_desc",
			"row": "NYjLYG_row",
			"rowText": "NYjLYG_rowText",
			"selector": "NYjLYG_selector",
			"title": "NYjLYG_title"
		};
		//#endregion
		//#region src/client/DiffZoomShortcutRow.tsx
		/** General Settings row for the code-comparison zoom modifier. */
		const DEFAULT_OPTION = {
			id: "alt",
			label: "settings.diffZoom.alt"
		};
		const OPTIONS = [
			DEFAULT_OPTION,
			{
				id: "control",
				label: "settings.diffZoom.control"
			},
			{
				id: "shift",
				label: "settings.diffZoom.shift"
			}
		];
		/** Render the code-comparison zoom shortcut selector. */
		function DiffZoomShortcutRow({ useDiffZoomModifier, setDiffZoomModifier, t }) {
			const modifier = useDiffZoomModifier((value) => value);
			const [open, setOpen] = (0, react.useState)(false);
			const selected = OPTIONS.find((option) => option.id === modifier) ?? DEFAULT_OPTION;
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: DiffZoomShortcutRow_module_css_default.row,
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: DiffZoomShortcutRow_module_css_default.rowText,
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: DiffZoomShortcutRow_module_css_default.title,
						children: t("settings.diffZoom.title")
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: DiffZoomShortcutRow_module_css_default.desc,
						children: t("settings.diffZoom.description")
					})]
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Menu, {
					open,
					onClose: () => {
						setOpen(false);
					},
					items: OPTIONS.map((option) => ({
						id: option.id,
						label: t(option.label)
					})),
					selectedId: modifier,
					onSelect: (id) => {
						setOpen(false);
						setDiffZoomModifier(id);
					},
					align: "end",
					portal: true,
					anchor: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
						type: "button",
						className: DiffZoomShortcutRow_module_css_default.selector,
						"aria-haspopup": "menu",
						"aria-expanded": open,
						onClick: () => {
							setOpen((value) => !value);
						},
						children: [t(selected.label), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconChevronDownOutline14, { className: DiffZoomShortcutRow_module_css_default.chevron })]
					})
				})]
			});
		}
		//#endregion
		//#region src/client/diff-zoom-preference.ts
		/** Live code-comparison zoom preference shared by review surfaces and Settings. */
		/** Owns the live zoom modifier and its durable settings write. */
		var DiffZoomPreferenceController = class {
			host;
			/** Reactive modifier shared by all mounted review surfaces. */
			diffZoomModifier = (0, _deepseek_ai_dsh_client_store.createSnapshotStore)("alt");
			/** @param host - durable Git review settings scope. */
			constructor(host) {
				this.host = host;
				host.subscribe(() => {
					this.adopt();
				});
				this.adopt();
			}
			/** Persist and publish the modifier selected in Settings. */
			setDiffZoomModifier(modifier) {
				if (this.diffZoomModifier.getSnapshot() === modifier) return;
				this.diffZoomModifier.set(modifier);
				this.host.set(DIFF_ZOOM_MODIFIER_FIELD, modifier);
			}
			/** Adopt the latest accepted durable setting without writing it back. */
			adopt() {
				const modifier = this.host.getSnapshot().value?.diffZoomModifier;
				if (modifier === void 0 || modifier === this.diffZoomModifier.getSnapshot()) return;
				this.diffZoomModifier.set(modifier);
			}
		};
		/**
		* Bind the read to one Remote face.
		* @param remote - the Client Remote face carrying the `gitWorkspace` namespace.
		* @returns the read the history's face performs.
		*/
		function createLog(remote) {
			return (workspaceId, page, signal) => remote.gitWorkspace.log({
				workspaceId,
				...page
			}, signal);
		}
		/** Bind commit-detail reads to one Remote face. */
		function createCommitReaders(remote) {
			return {
				readCommitFiles: (workspaceId, commit, signal) => remote.gitWorkspace.commitFiles({
					workspaceId,
					commit
				}, signal),
				readCommitDiff: (workspaceId, commit, file, signal) => remote.gitWorkspace.commitDiff({
					workspaceId,
					commit,
					path: file.path,
					...file.renamedFrom === void 0 ? {} : { previousPath: file.renamedFrom }
				}, signal)
			};
		}
		/** Reduce one settled state to the page the store keeps. */
		function pageOf(state) {
			if (!state.repository) return {
				commits: [],
				more: false,
				repository: false
			};
			return {
				commits: state.commits,
				more: state.more,
				...state.branch === void 0 ? {} : { branch: state.branch },
				...state.authors === void 0 ? {} : { authors: state.authors },
				repository: true
			};
		}
		/** The filter a first read carries: nothing typed, every author, no date bounds. */
		const NO_FILTER = {
			search: "",
			author: "",
			since: "",
			until: ""
		};
		/**
		* Bind the history's face to one commit read.
		* @param log - the bound `gitWorkspace.log` call.
		* @returns the Slot `inject` factory: session and bound actions in, face out.
		*/
		function gitHistoryFace(log, readers) {
			return (_sessionId, actions) => {
				/** Per tab: the read generation a settlement must match; the latest request wins. */
				const generations = /* @__PURE__ */ new Map();
				const nextGeneration = (tabId) => {
					const generation = (generations.get(tabId) ?? 0) + 1;
					generations.set(tabId, generation);
					return generation;
				};
				const read = (tabId, workspaceId, filter, skip, signal) => {
					if (signal.aborted) return;
					const generation = nextGeneration(tabId);
					if (skip === 0) actions.loading(tabId, filter);
					else actions.moreLoading(tabId);
					log(workspaceId, {
						skip,
						limit: 50,
						...filter
					}, signal).then((result) => {
						if (generations.get(tabId) !== generation) return;
						if (result.ok) if (skip === 0) actions.loaded(tabId, pageOf(result.value));
						else actions.appended(tabId, pageOf(result.value));
						else actions.failed(tabId, result.error);
					});
				};
				return {
					...readers,
					start(tabId, workspaceId, signal) {
						actions.start(tabId, workspaceId);
						signal.addEventListener("abort", () => {
							generations.delete(tabId);
							actions.forget(tabId);
						}, { once: true });
						read(tabId, workspaceId, NO_FILTER, 0, signal);
					},
					reload(tabId, workspaceId, filter, signal) {
						read(tabId, workspaceId, filter, 0, signal);
					},
					loadMore(tabId, workspaceId, filter, skip, signal) {
						read(tabId, workspaceId, filter, skip, signal);
					}
				};
			};
		}
		//#endregion
		//#region ../../../node_modules/.pnpm/clsx@2.1.1/node_modules/clsx/dist/clsx.mjs
		function r(e) {
			var t, f, n = "";
			if ("string" == typeof e || "number" == typeof e) n += e;
			else if ("object" == typeof e) if (Array.isArray(e)) {
				var o = e.length;
				for (t = 0; t < o; t++) e[t] && (f = r(e[t])) && (n && (n += " "), n += f);
			} else for (f in e) e[f] && (n && (n += " "), n += f);
			return n;
		}
		function clsx() {
			for (var e, t, f = 0, n = "", o = arguments.length; f < o; f++) (e = arguments[f]) && (t = r(e)) && (n && (n += " "), n += t);
			return n;
		}
		//#endregion
		//#region src/client/changes-visibility.ts
		/** Session-local visibility shared by the Git history page and its changes region. */
		/**
		* A session with no recorded choice shows the region: the Git page opens with
		* the working changes and its commit controls in view, and the history header's
		* control hides them again.
		*/
		const DEFAULT_VISIBLE = true;
		const visible = /* @__PURE__ */ new Map();
		const listeners = /* @__PURE__ */ new Map();
		const historyListeners = /* @__PURE__ */ new Map();
		/** Notify the history tab after this session successfully changes repository history. */
		function notifyGitHistoryRefresh(sessionId) {
			for (const listener of historyListeners.get(sessionId) ?? []) listener();
		}
		/** Follow successful mutations from the session's working-changes region. */
		function subscribeGitHistoryRefresh(sessionId, listener) {
			const sessionListeners = historyListeners.get(sessionId) ?? /* @__PURE__ */ new Set();
			sessionListeners.add(listener);
			historyListeners.set(sessionId, sessionListeners);
			return () => {
				sessionListeners.delete(listener);
				if (sessionListeners.size === 0) historyListeners.delete(sessionId);
			};
		}
		function subscribe(sessionId, listener) {
			const sessionListeners = listeners.get(sessionId) ?? /* @__PURE__ */ new Set();
			sessionListeners.add(listener);
			listeners.set(sessionId, sessionListeners);
			return () => {
				sessionListeners.delete(listener);
				if (sessionListeners.size === 0) {
					listeners.delete(sessionId);
					visible.delete(sessionId);
				}
			};
		}
		/** Set whether the working-changes region is visible for one session. */
		function setGitChangesVisible(sessionId, next) {
			if ((visible.get(sessionId) ?? DEFAULT_VISIBLE) === next) return;
			visible.set(sessionId, next);
			for (const listener of listeners.get(sessionId) ?? []) listener();
		}
		/** Read and follow the working-changes region's visibility for one session. */
		function useGitChangesVisible(sessionId) {
			return (0, react.useSyncExternalStore)((0, react.useCallback)((listener) => subscribe(sessionId, listener), [sessionId]), (0, react.useCallback)(() => visible.get(sessionId) ?? DEFAULT_VISIBLE, [sessionId]), () => DEFAULT_VISIBLE);
		}
		//#endregion
		//#region ../../util/workspace-path/src/index.ts
		/**
		* Read the final non-empty segment of a Workspace path for display.
		* Workspace-label surfaces use this helper instead of deriving another basename.
		* @param path - Workspace directory path using POSIX or Windows separators.
		* @returns the final segment, or an empty string for a separator-only path.
		*/
		function workspaceTitleOf(path) {
			const trimmed = path.replace(/[/\\]+$/, "");
			const separator = Math.max(trimmed.lastIndexOf("/"), trimmed.lastIndexOf("\\"));
			return trimmed.slice(separator + 1);
		}
		//#endregion
		//#region dsh-css:source/git-review/client/GitHistoryBody.module.css.mjs
		const css$2 = "._7gOSaa_root{height:100%;min-height:0;color:var(--dsw-alias-label-primary);font-size:var(--dsh-content-font-size-secondary,13px);flex-direction:column;flex:auto;padding:4px 0 0;line-height:1.5;display:flex;overflow:hidden}._7gOSaa_chrome{z-index:2;background:color-mix(in srgb, var(--dsw-alias-bg-base) 68%, transparent);backdrop-filter:blur(18px)saturate(130%);flex:none;position:relative}body[data-dsh-background-media] ._7gOSaa_chrome{background:color-mix(in srgb, var(--dsw-alias-bg-base) 46%, transparent)}._7gOSaa_body{flex-direction:column;flex:auto;min-height:0;padding-bottom:8px;display:flex;overflow:auto}._7gOSaa_header{color:var(--dsw-alias-label-secondary);flex:none;align-items:center;gap:6px;padding:4px 10px;font-weight:500;display:flex}._7gOSaa_icon{color:var(--dsw-alias-label-secondary);flex:none}._7gOSaa_name{white-space:nowrap;text-overflow:ellipsis;min-width:0;overflow:hidden}._7gOSaa_changesTool{color:var(--dsw-alias-label-secondary);font:inherit;border:.5px solid var(--dsw-alias-border-l2);cursor:pointer;background:0 0;border-radius:6px;flex:none;padding:3px 8px}._7gOSaa_changesTool:hover,._7gOSaa_changesTool[aria-pressed=true]{color:var(--dsw-alias-label-primary);background:var(--dsw-alias-interactive-bg-hover)}._7gOSaa_tool{width:24px;height:24px;color:var(--dsw-alias-label-secondary);cursor:pointer;background:0 0;border:0;border-radius:6px;flex:none;justify-content:center;align-items:center;margin-left:auto;padding:0;display:inline-flex}._7gOSaa_tool:hover{background:var(--dsw-alias-interactive-bg-hover)}._7gOSaa_search{flex:none;align-items:center;gap:6px;padding:2px 10px 6px;display:flex}._7gOSaa_input{flex:auto;min-width:0}._7gOSaa_searchTool{height:32px;color:var(--dsw-alias-label-primary);font:inherit;background:color-mix(in srgb, var(--dsw-alias-bg-layer-1) 64%, transparent);border:.5px solid color-mix(in srgb, var(--dsw-alias-border-l4) 72%, transparent);backdrop-filter:blur(16px)saturate(125%);cursor:pointer;border-radius:16px;flex:none;padding:0 14px}._7gOSaa_searchTool:hover{background:color-mix(in srgb, var(--dsw-alias-interactive-bg-hover) 72%, transparent)}._7gOSaa_level{margin:0;padding:0;list-style:none}._7gOSaa_item{margin:0;padding:0 4px}._7gOSaa_commitButton{width:100%;color:inherit;font:inherit;text-align:start;cursor:pointer;background:0 0;border:0;border-radius:6px;padding:3px 6px;display:block}._7gOSaa_commitButton:hover{background:var(--dsw-alias-interactive-bg-hover)}._7gOSaa_row{align-items:baseline;gap:6px;min-width:0;display:flex}._7gOSaa_hash{color:var(--dsw-alias-link);font-family:var(--ds-font-family-code);flex:none;font-size:12px}._7gOSaa_subject{white-space:nowrap;text-overflow:ellipsis;min-width:0;overflow:hidden}._7gOSaa_meta{min-width:0;color:var(--dsw-alias-label-tertiary);align-items:baseline;gap:8px;font-size:12px;display:flex}._7gOSaa_author{white-space:nowrap;text-overflow:ellipsis;overflow:hidden}._7gOSaa_date{flex:none}._7gOSaa_note{color:var(--dsw-alias-label-tertiary);margin:0;padding:3px 10px;font-size:12px}._7gOSaa_error{color:var(--dsw-alias-state-error-primary);margin:0;padding:3px 10px;font-size:12px}._7gOSaa_more{color:var(--dsw-alias-label-secondary);font:inherit;border:1px solid var(--dsw-alias-border-l2);cursor:pointer;background:0 0;border-radius:6px;align-self:center;margin:6px 0 0;padding:3px 12px}._7gOSaa_more:hover{background:var(--dsw-alias-interactive-bg-hover)}._7gOSaa_moreBusy{cursor:default;opacity:.6}._7gOSaa_status{flex-direction:column;padding:12px 10px;display:flex}._7gOSaa_statusLine{color:var(--dsw-alias-label-secondary);font-size:var(--dsh-content-font-size-secondary,13px);margin:0;line-height:1.6}._7gOSaa_detailDialog{background:var(--dsw-alias-bg-layer-2);width:min(1120px,100vw - 48px);height:min(760px,100vh - 48px);padding-bottom:18px}._7gOSaa_detailDialogFullscreen{position:relative;inset:auto;width:100%;height:100%;max-height:100%;border-radius:10px}body[data-dsh-background-media] ._7gOSaa_detailDialog{background:color-mix(in srgb, var(--dsw-alias-bg-layer-2) 72%, transparent);backdrop-filter:blur(16px)saturate(125%)}._7gOSaa_detailMeta{min-height:30px;color:var(--dsw-alias-label-secondary);font-family:var(--ds-font-family-code);justify-content:space-between;align-items:center;padding:0 24px;font-size:12px;display:flex}._7gOSaa_detailMetaFullscreen{justify-content:flex-end}._7gOSaa_detailTools{flex:none;align-items:center;gap:4px;display:flex}._7gOSaa_detailLayout{border-top:.5px solid var(--dsw-alias-border-l2);height:min(620px,100vh - 180px);margin-top:12px;display:grid}._7gOSaa_detailLayoutFullscreen{height:calc(100vh - 126px);margin-top:4px}._7gOSaa_detailLayoutFullscreen ._7gOSaa_fileList,._7gOSaa_detailLayoutFullscreen ._7gOSaa_filePaneResize{display:none}._7gOSaa_detailLayoutFullscreen ._7gOSaa_diff{contain:layout paint style}._7gOSaa_workingDiffLayout{grid-template-columns:minmax(0,1fr)}._7gOSaa_fileList{min-width:0;padding:8px;overflow:auto}._7gOSaa_fileList,._7gOSaa_diffPane{scrollbar-color:color-mix(in srgb, var(--dsw-alias-label-secondary) 62%, transparent) color-mix(in srgb, var(--dsw-alias-bg-layer-1) 78%, transparent);scrollbar-width:auto}._7gOSaa_fileList::-webkit-scrollbar,._7gOSaa_diffPane::-webkit-scrollbar{width:12px;height:12px}._7gOSaa_fileList::-webkit-scrollbar-track,._7gOSaa_diffPane::-webkit-scrollbar-track{background:color-mix(in srgb, var(--dsw-alias-bg-layer-1) 82%, transparent);border:1px solid color-mix(in srgb, var(--dsw-alias-border-l2) 78%, transparent);border-radius:8px}._7gOSaa_fileList::-webkit-scrollbar-thumb,._7gOSaa_diffPane::-webkit-scrollbar-thumb{background:color-mix(in srgb, var(--dsw-alias-label-secondary) 66%, transparent);background-clip:content-box;border:3px solid #0000;border-radius:8px;min-width:32px;min-height:32px}._7gOSaa_fileList::-webkit-scrollbar-thumb:hover,._7gOSaa_diffPane::-webkit-scrollbar-thumb:hover{background:color-mix(in srgb, var(--dsw-alias-label-primary) 82%, transparent);background-clip:content-box}._7gOSaa_fileList::-webkit-scrollbar-corner,._7gOSaa_diffPane::-webkit-scrollbar-corner{background:0 0}body[data-dsh-background-media] ._7gOSaa_fileList,body[data-dsh-background-media] ._7gOSaa_diffPane{scrollbar-color:color-mix(in srgb, var(--dsw-alias-label-primary) 72%, transparent) color-mix(in srgb, var(--dsw-alias-bg-layer-1) 46%, transparent)}._7gOSaa_treeLevel{min-width:max-content;margin:0;padding:0;list-style:none}._7gOSaa_treeRow{width:100%;min-width:max-content;color:var(--dsw-alias-label-secondary);font:inherit;text-align:start;cursor:pointer;background:0 0;border:0;border-radius:6px;align-items:center;gap:7px;padding:6px 8px;display:flex}._7gOSaa_treeRow:hover,._7gOSaa_detailFileSelected{color:var(--dsw-alias-label-primary);background:var(--dsw-alias-interactive-bg-hover)}._7gOSaa_treeFile{padding-right:16px}._7gOSaa_fileName{min-width:0}._7gOSaa_fileTypeIcon{width:18px;height:18px;color:var(--dsw-alias-label-secondary);font:600 6px/1 var(--ds-font-family-code);flex:0 0 18px;justify-content:center;align-items:center;display:inline-flex;position:relative}._7gOSaa_fileTypeIcon svg{width:18px;height:18px;position:absolute;inset:0}._7gOSaa_fileTypeMark{letter-spacing:-.35px;white-space:nowrap;max-width:13px;position:relative;top:2px;overflow:hidden}._7gOSaa_fileType_java ._7gOSaa_fileTypeMark:after{content:\"J\"}._7gOSaa_fileType_xml ._7gOSaa_fileTypeMark:after{content:\"<>\"}._7gOSaa_fileType_text ._7gOSaa_fileTypeMark:after{content:\"TXT\"}._7gOSaa_fileType_python ._7gOSaa_fileTypeMark:after{content:\"PY\"}._7gOSaa_fileType_typescript ._7gOSaa_fileTypeMark:after{content:\"TS\"}._7gOSaa_fileType_javascript ._7gOSaa_fileTypeMark:after{content:\"JS\"}._7gOSaa_fileType_json ._7gOSaa_fileTypeMark:after{content:\"{}\"}._7gOSaa_fileType_markdown ._7gOSaa_fileTypeMark:after{content:\"MD\"}._7gOSaa_fileType_style ._7gOSaa_fileTypeMark:after{content:\"#\"}._7gOSaa_fileType_html ._7gOSaa_fileTypeMark:after{content:\"</>\"}._7gOSaa_fileType_shell ._7gOSaa_fileTypeMark:after{content:\"$_\"}._7gOSaa_fileType_generic ._7gOSaa_fileTypeMark:after{content:\"—\"}._7gOSaa_fileType_java{color:#c96b3b}._7gOSaa_fileType_xml,._7gOSaa_fileType_html{color:#d57b2d}._7gOSaa_fileType_text,._7gOSaa_fileType_markdown{color:#66737f}._7gOSaa_fileType_python{color:#3572a5}._7gOSaa_fileType_typescript{color:#3178c6}._7gOSaa_fileType_javascript{color:#a78300}._7gOSaa_fileType_json{color:#7b7f28}._7gOSaa_fileType_style{color:#8a55b5}._7gOSaa_fileType_shell{color:#438b57}._7gOSaa_treeChevron{flex:none;transition:transform .12s}._7gOSaa_treeChevronExpanded{transform:rotate(90deg)}._7gOSaa_filePaneResize{cursor:col-resize;touch-action:none;position:relative}._7gOSaa_filePaneResize:after{content:\"\";background:var(--dsw-alias-border-l2);width:1px;position:absolute;top:0;bottom:0;left:2px}._7gOSaa_filePaneResize:hover:after{background:var(--dsw-alias-label-tertiary);width:2px}._7gOSaa_fileStatus{color:var(--dsw-alias-label-tertiary);font-size:11px;font-family:var(--ds-font-family-code);flex:none;margin-left:auto;padding-left:8px}._7gOSaa_diff{background:var(--dsw-alias-bg-base);flex-direction:column;min-width:0;display:flex;overflow:hidden}._7gOSaa_diffHint{color:var(--dsw-alias-label-tertiary);margin:0;padding:12px 16px}._7gOSaa_diffTable{width:100%;min-height:0;color:var(--dsw-alias-label-secondary);font-family:var(--ds-font-family-code);flex:auto;grid-template-columns:minmax(0,1fr) minmax(0,1fr);font-size:12px;line-height:20px;display:grid;position:relative}._7gOSaa_syntax_comment{color:var(--dsw-alias-label-tertiary);font-style:italic}._7gOSaa_syntax_string{color:#2f8a57}._7gOSaa_syntax_number{color:#b56a2b}._7gOSaa_syntax_keyword{color:#8750b4;font-weight:500}._7gOSaa_syntax_tag{color:#167f8c}._7gOSaa_syntax_attribute{color:#a65b2e}._7gOSaa_searchMatch{color:inherit;background:#f2c94cad;border-radius:2px;padding:0 1px}._7gOSaa_searchActiveRow ._7gOSaa_searchMatch{background:#ff9f2fd1;box-shadow:0 0 0 1px #9b5b006b}._7gOSaa_zoomIndicator{z-index:4;min-width:48px;color:var(--dsw-alias-label-primary);font:12px/1 var(--ds-font-family-code);text-align:center;pointer-events:none;background:color-mix(in srgb, var(--dsw-alias-bg-layer-1) 92%, transparent);border:1px solid var(--dsw-alias-border-l2);opacity:0;border-radius:7px;padding:5px 9px;transition:opacity .16s,transform .16s;position:absolute;bottom:16px;right:16px;transform:translateY(4px);box-shadow:0 4px 14px #00000029}._7gOSaa_zoomIndicatorVisible{opacity:1;transform:translateY(0)}body[data-dsh-background-media] ._7gOSaa_zoomIndicator{background:color-mix(in srgb, var(--dsw-alias-bg-layer-1) 68%, transparent);backdrop-filter:blur(16px)saturate(125%)}._7gOSaa_diffHeader{color:var(--dsw-alias-label-secondary);background:var(--dsw-alias-bg-layer-1);border-bottom:.5px solid var(--dsw-alias-border-l2);flex:none;grid-template-columns:minmax(0,1fr) minmax(0,1fr);font-size:12px;display:grid}._7gOSaa_diffHeaderSide{grid-template-columns:minmax(80px,1fr) minmax(150px,220px);align-items:center;min-width:0;padding:5px 8px 5px 12px;display:grid}._7gOSaa_diffHeaderSide:first-child{border-right:.5px solid var(--dsw-alias-border-l2)}._7gOSaa_diffHeaderSide>span{text-align:center;min-width:0}._7gOSaa_diffSearch{background:var(--dsw-alias-bg-base);border:1px solid var(--dsw-alias-border-l2);border-radius:7px;justify-self:end;align-items:center;width:100%;min-width:0;height:28px;display:flex;overflow:hidden}._7gOSaa_diffSearch:focus-within{border-color:var(--dsw-alias-label-secondary);box-shadow:0 0 0 2px color-mix(in srgb, var(--dsw-alias-label-secondary) 14%, transparent)}._7gOSaa_diffSearch input{min-width:0;height:100%;color:var(--dsw-alias-label-primary);font:12px/1 var(--ds-font-family);background:0 0;border:0;outline:0;padding:0 7px}._7gOSaa_diffSearch input::placeholder{color:var(--dsw-alias-label-tertiary)}._7gOSaa_diffSearch output{color:var(--dsw-alias-label-tertiary);font:10px/1 var(--ds-font-family-code);flex:none}._7gOSaa_diffSearch button{width:28px;height:26px;color:var(--dsw-alias-label-secondary);cursor:pointer;background:0 0;border:0;flex:0 0 28px;justify-content:center;align-items:center;padding:0;display:inline-flex}._7gOSaa_diffSearch button:hover{color:var(--dsw-alias-label-primary);background:var(--dsw-alias-interactive-bg-hover)}._7gOSaa_diffSearch ._7gOSaa_diffSearchClear{width:24px;color:var(--dsw-alias-label-tertiary);flex-basis:24px}._7gOSaa_diffSearch ._7gOSaa_diffSearchSubmit{border-left:1px solid color-mix(in srgb, var(--dsw-alias-border-l2) 72%, transparent);margin-left:0}body[data-dsh-background-media] ._7gOSaa_diffSearch{background:color-mix(in srgb, var(--dsw-alias-bg-layer-1) 52%, transparent);backdrop-filter:blur(12px)saturate(125%)}body[data-dsh-background-media] ._7gOSaa_diffHeader{background:color-mix(in srgb, var(--dsw-alias-bg-layer-1) 60%, transparent);backdrop-filter:blur(16px)saturate(125%)}._7gOSaa_iconTool{width:28px;height:28px;color:var(--dsw-alias-label-secondary);cursor:pointer;background:0 0;border:1px solid #0000;border-radius:6px;flex:none;justify-content:center;align-items:center;padding:0;display:inline-flex}._7gOSaa_iconTool:hover{color:var(--dsw-alias-label-primary);background:var(--dsw-alias-interactive-bg-hover)}._7gOSaa_iconTool[aria-pressed=true]{color:var(--dsw-alias-label-primary);background:var(--dsw-alias-interactive-bg-active);border-color:color-mix(in srgb, var(--dsw-alias-label-primary) 48%, transparent);box-shadow:inset 0 0 0 1px color-mix(in srgb, var(--dsw-alias-label-primary) 12%, transparent)}._7gOSaa_iconTool[aria-pressed=false]{color:var(--dsw-alias-label-tertiary)}body[data-dsh-background-media] ._7gOSaa_iconTool{background:color-mix(in srgb, var(--dsw-alias-bg-layer-1) 60%, transparent);backdrop-filter:blur(16px)saturate(125%)}body[data-dsh-background-media] ._7gOSaa_iconTool[aria-pressed=true]{background:color-mix(in srgb, var(--dsw-alias-interactive-bg-active) 76%, transparent)}body[data-dsh-background-media] ._7gOSaa_diff{background:0 0}._7gOSaa_binaryNotice{color:var(--dsw-alias-label-secondary);margin:0;padding:18px}._7gOSaa_diffPane{border-right:.5px solid var(--dsw-alias-border-l2);min-width:0;overflow:auto}._7gOSaa_diffPane:last-child{border-right:0}._7gOSaa_diffCanvas{min-height:100%}._7gOSaa_diffCell{white-space:pre;grid-template-columns:48px minmax(max-content,1fr);min-width:max-content;min-height:20px;display:grid}._7gOSaa_diffPane[data-git-diff-pane=old] ._7gOSaa_diffCell{grid-template-columns:minmax(max-content,1fr) 48px}._7gOSaa_diffCell code{font:inherit;padding:0 12px}._7gOSaa_lineNumber{z-index:1;color:var(--dsw-alias-label-tertiary);text-align:end;user-select:none;background:color-mix(in srgb, var(--dsw-alias-bg-base) 84%, var(--dsw-alias-border-l2));border-right:.5px solid var(--dsw-alias-border-l2);padding:0 8px;position:sticky;left:0}._7gOSaa_diffPane[data-git-diff-pane=old] ._7gOSaa_lineNumber{border-right:0;border-left:.5px solid var(--dsw-alias-border-l2);left:auto;right:0}._7gOSaa_added{color:var(--dsw-alias-state-success-primary);background:color-mix(in srgb, var(--dsw-alias-state-success-primary) 16%, transparent)}._7gOSaa_removed{color:var(--dsw-alias-state-error-primary);background:color-mix(in srgb, var(--dsw-alias-state-error-primary) 16%, transparent)}";
		const tagId$2 = "@deepseek-ai/dsh-client-ui-sidebar-git-history/GitHistoryBody.module.css";
		/** The author dropdown beside the subject search: one applied filter each. */
		const cssAuthorSelect$2 = "._7gOSaa_authorSelect{flex:0 1 auto;min-width:0;max-width:46%;height:32px;padding:0 8px;color:var(--dsw-alias-label-primary);font:inherit;text-overflow:ellipsis;background:color-mix(in srgb, var(--dsw-alias-bg-layer-1) 64%, transparent);border:.5px solid color-mix(in srgb, var(--dsw-alias-border-l4) 72%, transparent);border-radius:16px;backdrop-filter:blur(16px)saturate(125%);cursor:pointer}._7gOSaa_authorSelect:hover{background:color-mix(in srgb, var(--dsw-alias-interactive-bg-hover) 72%, transparent)}._7gOSaa_authorSelect:focus-visible{outline:2px solid var(--dsw-alias-border-l4);outline-offset:1px}._7gOSaa_authorSelect option{color:var(--dsw-alias-label-primary);background:var(--dsw-alias-bg-layer-1)}._7gOSaa_dateToolActive{color:var(--dsw-alias-label-primary);background:var(--dsw-alias-interactive-bg-active);border-color:color-mix(in srgb, var(--dsw-alias-label-primary) 48%, transparent)}._7gOSaa_dateRow{display:flex;flex:0 0 auto;align-items:center;gap:6px;padding:0 10px 6px}._7gOSaa_dateInput{flex:1 1 auto;min-width:0;height:32px;padding:0 10px;color:var(--dsw-alias-label-primary);font:inherit;background:color-mix(in srgb, var(--dsw-alias-bg-layer-1) 64%, transparent);border:.5px solid color-mix(in srgb, var(--dsw-alias-border-l4) 72%, transparent);border-radius:16px}._7gOSaa_dateInput:focus-visible{outline:2px solid var(--dsw-alias-border-l4);outline-offset:1px}._7gOSaa_dateDash{flex:0 0 auto;color:var(--dsw-alias-label-tertiary)}._7gOSaa_dateClear{display:inline-flex;flex:0 0 auto;align-items:center;justify-content:center;width:24px;height:24px;padding:0;color:var(--dsw-alias-label-tertiary);background:0 0;border:0;border-radius:6px;cursor:pointer}._7gOSaa_dateClear:hover{color:var(--dsw-alias-label-primary);background:var(--dsw-alias-interactive-bg-hover)}";
		if (typeof document !== "undefined") {
			const sheet = css$2 + cssAuthorSelect$2;
			const existing = document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId$2) + "]");
			if (existing === null) {
				const tag = document.createElement("style");
				tag.dataset.plugin = "@deepseek-ai/dsh-client-ui-sidebar-git-history";
				tag.dataset.pluginCss = tagId$2;
				tag.textContent = sheet;
				document.head.appendChild(tag);
			} else if (existing.textContent !== sheet) existing.textContent = sheet;
			}
		var GitHistoryBody_module_css_default = {
			"added": "_7gOSaa_added",
			"author": "_7gOSaa_author",
			"authorSelect": "_7gOSaa_authorSelect",
			"binaryNotice": "_7gOSaa_binaryNotice",
			"body": "_7gOSaa_body",
			"changesTool": "_7gOSaa_changesTool",
			"chrome": "_7gOSaa_chrome",
			"commitButton": "_7gOSaa_commitButton",
			"date": "_7gOSaa_date",
			"dateClear": "_7gOSaa_dateClear",
			"dateDash": "_7gOSaa_dateDash",
			"dateInput": "_7gOSaa_dateInput",
			"dateRow": "_7gOSaa_dateRow",
			"dateToolActive": "_7gOSaa_dateToolActive",
			"detailDialog": "_7gOSaa_detailDialog",
			"detailDialogFullscreen": "_7gOSaa_detailDialogFullscreen",
			"detailFileSelected": "_7gOSaa_detailFileSelected",
			"detailLayout": "_7gOSaa_detailLayout",
			"detailLayoutFullscreen": "_7gOSaa_detailLayoutFullscreen",
			"detailMeta": "_7gOSaa_detailMeta",
			"detailMetaFullscreen": "_7gOSaa_detailMetaFullscreen",
			"detailTools": "_7gOSaa_detailTools",
			"diff": "_7gOSaa_diff",
			"diffCanvas": "_7gOSaa_diffCanvas",
			"diffCell": "_7gOSaa_diffCell",
			"diffHeader": "_7gOSaa_diffHeader",
			"diffHeaderSide": "_7gOSaa_diffHeaderSide",
			"diffHint": "_7gOSaa_diffHint",
			"diffPane": "_7gOSaa_diffPane",
			"diffSearch": "_7gOSaa_diffSearch",
			"diffSearchClear": "_7gOSaa_diffSearchClear",
			"diffSearchSubmit": "_7gOSaa_diffSearchSubmit",
			"diffTable": "_7gOSaa_diffTable",
			"error": "_7gOSaa_error",
			"fileList": "_7gOSaa_fileList",
			"fileName": "_7gOSaa_fileName",
			"filePaneResize": "_7gOSaa_filePaneResize",
			"fileStatus": "_7gOSaa_fileStatus",
			"fileTypeIcon": "_7gOSaa_fileTypeIcon",
			"fileTypeMark": "_7gOSaa_fileTypeMark",
			"fileType_generic": "_7gOSaa_fileType_generic",
			"fileType_html": "_7gOSaa_fileType_html",
			"fileType_java": "_7gOSaa_fileType_java",
			"fileType_javascript": "_7gOSaa_fileType_javascript",
			"fileType_json": "_7gOSaa_fileType_json",
			"fileType_markdown": "_7gOSaa_fileType_markdown",
			"fileType_python": "_7gOSaa_fileType_python",
			"fileType_shell": "_7gOSaa_fileType_shell",
			"fileType_style": "_7gOSaa_fileType_style",
			"fileType_text": "_7gOSaa_fileType_text",
			"fileType_typescript": "_7gOSaa_fileType_typescript",
			"fileType_xml": "_7gOSaa_fileType_xml",
			"hash": "_7gOSaa_hash",
			"header": "_7gOSaa_header",
			"icon": "_7gOSaa_icon",
			"iconTool": "_7gOSaa_iconTool",
			"input": "_7gOSaa_input",
			"item": "_7gOSaa_item",
			"level": "_7gOSaa_level",
			"lineNumber": "_7gOSaa_lineNumber",
			"meta": "_7gOSaa_meta",
			"more": "_7gOSaa_more",
			"moreBusy": "_7gOSaa_moreBusy",
			"name": "_7gOSaa_name",
			"note": "_7gOSaa_note",
			"removed": "_7gOSaa_removed",
			"root": "_7gOSaa_root",
			"row": "_7gOSaa_row",
			"search": "_7gOSaa_search",
			"searchActiveRow": "_7gOSaa_searchActiveRow",
			"searchMatch": "_7gOSaa_searchMatch",
			"searchTool": "_7gOSaa_searchTool",
			"status": "_7gOSaa_status",
			"statusLine": "_7gOSaa_statusLine",
			"subject": "_7gOSaa_subject",
			"syntax_attribute": "_7gOSaa_syntax_attribute",
			"syntax_comment": "_7gOSaa_syntax_comment",
			"syntax_keyword": "_7gOSaa_syntax_keyword",
			"syntax_number": "_7gOSaa_syntax_number",
			"syntax_string": "_7gOSaa_syntax_string",
			"syntax_tag": "_7gOSaa_syntax_tag",
			"tool": "_7gOSaa_tool",
			"treeChevron": "_7gOSaa_treeChevron",
			"treeChevronExpanded": "_7gOSaa_treeChevronExpanded",
			"treeFile": "_7gOSaa_treeFile",
			"treeLevel": "_7gOSaa_treeLevel",
			"treeRow": "_7gOSaa_treeRow",
			"workingDiffLayout": "_7gOSaa_workingDiffLayout",
			"zoomIndicator": "_7gOSaa_zoomIndicator",
			"zoomIndicatorVisible": "_7gOSaa_zoomIndicatorVisible"
		};
		//#endregion
		//#region src/client/GitHistoryBody.tsx
		/**
		* The commit history's body: one workspace's commits, newest first, paged.
		*
		* Everything the history keeps lives in its store, keyed by tab; everything it
		* asks for goes through its injected face. The component decides only what to
		* draw and what a control means: reload re-reads the window, the search box
		* replaces it, and load-more appends the next page. The workspace is named from
		* the framework's Workspace hook (by session membership, else by the session's
		* working directory), never by a path the reader types.
		*/
		/**
		* Say why the history could not be read, in terms of the read.
		* @param t - namespace-bound translate.
		* @param failure - the settled Remote failure.
		* @returns the line to show in place of the list.
		*/
		function failureLine(t, failure) {
			switch (failure.code) {
				case "git/unavailable": return t("error.gitUnavailable");
				case "workspace/not-found": return t("error.workspaceNotFound");
				case "git/operation-failed": return t("error.operationFailed", { message: failure.message });
				default: return t("error.unavailable", { message: failure.message });
			}
		}
		/**
		* Render an ISO-8601 author date as `YYYY-MM-DD HH:mm`, the minute the commit
		* was made. The date is wire data, so it is formatted, never translated.
		* @param iso - the commit's strict ISO author date.
		* @returns the readable date, or the input unchanged when it does not parse.
		*/
		function formatCommitDate(iso) {
			const match = /^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2})/u.exec(iso);
			if (match === null) return iso;
			const [, date = "", time = ""] = match;
			return `${date} ${time}`;
		}
		/** One commit's row: short hash, subject, author, and date. */
		function CommitRow({ commit, onOpen }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("li", {
				className: GitHistoryBody_module_css_default.item,
				"data-git-commit": commit.hash,
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
					type: "button",
					className: GitHistoryBody_module_css_default.commitButton,
					onClick: onOpen,
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: GitHistoryBody_module_css_default.row,
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("code", {
							className: GitHistoryBody_module_css_default.hash,
							children: commit.shortHash
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: GitHistoryBody_module_css_default.subject,
							title: commit.subject,
							children: commit.subject
						})]
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: GitHistoryBody_module_css_default.meta,
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: GitHistoryBody_module_css_default.author,
							children: commit.authorName
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: GitHistoryBody_module_css_default.date,
							children: formatCommitDate(commit.date)
						})]
					})]
				})
			});
		}
		/** The list body for a loaded window, or the line that replaces it. */
		function HistoryList({ state, onOpen, t }) {
			if (!state.repository) return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
				className: GitHistoryBody_module_css_default.note,
				"data-git-row": "not-repository",
				children: t("notRepository")
			});
			if (state.commits.length === 0) return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
				className: GitHistoryBody_module_css_default.note,
				"data-git-row": "empty",
				children: state.search === "" && state.author === "" && state.since === "" && state.until === "" ? t("empty") : t("emptySearch")
			});
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("ul", {
				className: GitHistoryBody_module_css_default.level,
				children: state.commits.map((commit) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)(CommitRow, {
					commit,
					onOpen: () => {
						onOpen(commit);
					}
				}, commit.hash))
			});
		}
		const DIFF_LINE_HEIGHT = 20;
		const DIFF_VIEWPORT_FALLBACK = 600;
		const DIFF_OVERSCAN_ROWS = 20;
		const DIFF_FONT_MIN = 9;
		const DIFF_FONT_MAX = 20;
		const DIFF_FONT_DEFAULT = 12;
		/** Select the bounded row window around one pane's current viewport. */
		function diffRenderWindow(scrollTop, clientHeight, rowCount, lineHeight = DIFF_LINE_HEIGHT) {
			const visibleRows = Math.max(1, Math.ceil((clientHeight || DIFF_VIEWPORT_FALLBACK) / lineHeight));
			const firstVisible = Math.max(0, Math.floor(scrollTop / lineHeight));
			return {
				start: Math.max(0, firstVisible - DIFF_OVERSCAN_ROWS),
				end: Math.min(rowCount, firstVisible + visibleRows + DIFF_OVERSCAN_ROWS)
			};
		}
		/** Resolve syntax colors from the selected file's extension. */
		function diffLanguage(path) {
			switch (path.toLocaleLowerCase().split(".").at(-1) ?? "") {
				case "java": return "java";
				case "xml":
				case "xsd":
				case "xsl":
				case "xslt":
				case "pom": return "xml";
				case "txt":
				case "log": return "text";
				case "py":
				case "pyw": return "python";
				case "ts":
				case "tsx":
				case "mts":
				case "cts": return "typescript";
				case "js":
				case "jsx":
				case "mjs":
				case "cjs": return "javascript";
				case "json":
				case "jsonc": return "json";
				case "md":
				case "mdx": return "markdown";
				case "css":
				case "scss":
				case "sass":
				case "less": return "css";
				case "html":
				case "htm":
				case "vue":
				case "svelte": return "html";
				case "sh":
				case "bash":
				case "zsh":
				case "ps1":
				case "bat":
				case "cmd": return "shell";
				case "sql": return "sql";
				default: return "generic";
			}
		}
		const LANGUAGE_KEYWORDS = {
			java: new Set([
				"abstract",
				"boolean",
				"break",
				"case",
				"catch",
				"class",
				"const",
				"continue",
				"default",
				"do",
				"else",
				"enum",
				"extends",
				"final",
				"finally",
				"for",
				"if",
				"implements",
				"import",
				"instanceof",
				"interface",
				"new",
				"null",
				"package",
				"private",
				"protected",
				"public",
				"return",
				"static",
				"super",
				"switch",
				"this",
				"throw",
				"throws",
				"true",
				"try",
				"void",
				"while"
			]),
			python: new Set([
				"and",
				"as",
				"assert",
				"async",
				"await",
				"break",
				"class",
				"continue",
				"def",
				"del",
				"elif",
				"else",
				"except",
				"False",
				"finally",
				"for",
				"from",
				"global",
				"if",
				"import",
				"in",
				"is",
				"lambda",
				"None",
				"not",
				"or",
				"pass",
				"raise",
				"return",
				"True",
				"try",
				"while",
				"with",
				"yield"
			]),
			typescript: new Set([
				"as",
				"async",
				"await",
				"break",
				"case",
				"catch",
				"class",
				"const",
				"continue",
				"default",
				"delete",
				"do",
				"else",
				"enum",
				"export",
				"extends",
				"false",
				"finally",
				"for",
				"from",
				"function",
				"if",
				"implements",
				"import",
				"in",
				"instanceof",
				"interface",
				"let",
				"new",
				"null",
				"of",
				"private",
				"protected",
				"public",
				"readonly",
				"return",
				"static",
				"super",
				"switch",
				"this",
				"throw",
				"true",
				"try",
				"type",
				"typeof",
				"undefined",
				"void",
				"while"
			]),
			javascript: new Set([
				"async",
				"await",
				"break",
				"case",
				"catch",
				"class",
				"const",
				"continue",
				"default",
				"delete",
				"do",
				"else",
				"export",
				"extends",
				"false",
				"finally",
				"for",
				"from",
				"function",
				"if",
				"import",
				"in",
				"instanceof",
				"let",
				"new",
				"null",
				"of",
				"return",
				"static",
				"super",
				"switch",
				"this",
				"throw",
				"true",
				"try",
				"typeof",
				"undefined",
				"var",
				"void",
				"while"
			]),
			sql: new Set([
				"and",
				"as",
				"asc",
				"by",
				"case",
				"create",
				"delete",
				"desc",
				"distinct",
				"else",
				"end",
				"from",
				"group",
				"having",
				"in",
				"insert",
				"into",
				"is",
				"join",
				"left",
				"like",
				"limit",
				"not",
				"null",
				"on",
				"or",
				"order",
				"outer",
				"right",
				"select",
				"set",
				"then",
				"union",
				"update",
				"values",
				"when",
				"where"
			]),
			shell: new Set([
				"case",
				"do",
				"done",
				"elif",
				"else",
				"esac",
				"fi",
				"for",
				"function",
				"if",
				"in",
				"then",
				"until",
				"while"
			])
		};
		/** Tokenize one visible line without retaining a full-file syntax tree. */
		function tokenizeDiffLine(text, language) {
			if (language === "text" || language === "generic") return [{
				text,
				kind: "plain"
			}];
			const markup = language === "xml" || language === "html";
			const pattern = markup ? /(<!--.*?-->|<\/?[\w:-]+|\/?>|[\w:-]+(?=\s*=)|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')/gu : /(\/\/.*$|#(?!\{).*?$|\/\*.*?\*\/|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`|\b\d+(?:\.\d+)?\b|\b[A-Za-z_$][\w$]*\b)/gu;
			const tokens = [];
			let cursor = 0;
			for (const match of text.matchAll(pattern)) {
				const index = match.index;
				if (index > cursor) tokens.push({
					text: text.slice(cursor, index),
					kind: "plain"
				});
				const value = match[0];
				let kind = "plain";
				if (value.startsWith("<!--") || value.startsWith("//") || value.startsWith("/*") || value.startsWith("#") && language !== "css") kind = "comment";
				else if (/^["'`]/u.test(value)) kind = "string";
				else if (/^\d/u.test(value)) kind = "number";
				else if (markup && value.startsWith("<")) kind = "tag";
				else if (markup && /^[\w:-]+$/u.test(value)) kind = "attribute";
				else if (LANGUAGE_KEYWORDS[language]?.has(value) === true || LANGUAGE_KEYWORDS[language]?.has(value.toLocaleLowerCase()) === true) kind = "keyword";
				tokens.push({
					text: value,
					kind
				});
				cursor = index + value.length;
				if (kind === "comment" && !markup) break;
			}
			if (cursor < text.length) tokens.push({
				text: text.slice(cursor),
				kind: "plain"
			});
			return tokens;
		}
		function SyntaxCode({ text, language, search }) {
			const query = search.trim().toLocaleLowerCase();
			const ranges = [];
			if (query !== "") {
				const haystack = text.toLocaleLowerCase();
				let index = haystack.indexOf(query);
				while (index >= 0) {
					ranges.push([index, index + query.length]);
					index = haystack.indexOf(query, index + Math.max(1, query.length));
				}
			}
			let offset = 0;
			return tokenizeDiffLine(text, language).flatMap((token, tokenIndex) => {
				const start = offset;
				const end = start + token.text.length;
				offset = end;
				const cuts = new Set([start, end]);
				for (const [rangeStart, rangeEnd] of ranges) if (rangeStart < end && rangeEnd > start) {
					cuts.add(Math.max(start, rangeStart));
					cuts.add(Math.min(end, rangeEnd));
				}
				const points = [...cuts].sort((left, right) => left - right);
				return points.slice(0, -1).map((point, partIndex) => {
					const next = points[partIndex + 1] ?? point;
					const value = token.text.slice(point - start, next - start);
					if (ranges.some(([rangeStart, rangeEnd]) => point >= rangeStart && next <= rangeEnd)) return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("mark", {
						className: GitHistoryBody_module_css_default.searchMatch,
						children: value
					}, `${tokenIndex}-${partIndex}`);
					return token.kind === "plain" ? value : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						className: GitHistoryBody_module_css_default[`syntax_${token.kind}`],
						children: value
					}, `${tokenIndex}-${partIndex}`);
				});
			});
		}
		/** Find aligned row indexes containing one side's case-insensitive search text. */
		function diffSearchRows(rows, side, search) {
			const query = search.trim().toLocaleLowerCase();
			if (query === "") return [];
			return rows.flatMap((row, index) => {
				return (side === "old" ? row.oldText : row.newText)?.toLocaleLowerCase().includes(query) === true ? [index] : [];
			});
		}
		/** Convert a unified patch into aligned before-and-after rows without patch metadata. */
		function parseSideBySideDiff(patch) {
			const rows = [];
			let oldLine = 0;
			let newLine = 0;
			let inHunk = false;
			let removed = [];
			let added = [];
			const flushChanges = () => {
				const length = Math.max(removed.length, added.length);
				for (let index = 0; index < length; index += 1) {
					const before = removed[index];
					const after = added[index];
					rows.push({
						oldLine: before?.line,
						oldText: before?.text,
						newLine: after?.line,
						newText: after?.text,
						kind: "changed"
					});
				}
				removed = [];
				added = [];
			};
			const patchLines = patch.split(/\r?\n/u);
			if (patchLines.at(-1) === "") patchLines.pop();
			for (const line of patchLines) {
				const hunk = /^@@ -(\d+)(?:,\d+)? \+(\d+)(?:,\d+)? @@/u.exec(line);
				if (hunk !== null) {
					flushChanges();
					oldLine = Number(hunk[1]);
					newLine = Number(hunk[2]);
					inHunk = true;
					continue;
				}
				if (!inHunk || line.startsWith("\\ No newline at end of file")) continue;
				if (line.startsWith("-")) {
					removed.push({
						line: oldLine,
						text: line.slice(1)
					});
					oldLine += 1;
					continue;
				}
				if (line.startsWith("+")) {
					added.push({
						line: newLine,
						text: line.slice(1)
					});
					newLine += 1;
					continue;
				}
				flushChanges();
				const text = line.startsWith(" ") ? line.slice(1) : line;
				rows.push({
					oldLine,
					oldText: text,
					newLine,
					newText: text,
					kind: "context"
				});
				oldLine += 1;
				newLine += 1;
			}
			flushChanges();
			return rows;
		}
		function contentLines(content) {
			if (content === "") return [];
			const lines = content.split(/\r?\n/u);
			if (lines.at(-1) === "") lines.pop();
			return lines;
		}
		/** Expand patch rows with every unchanged line from the complete before and after files. */
		function parseFullSideBySideDiff(before, after, patch) {
			const oldLines = contentLines(before);
			const newLines = contentLines(after);
			const changedRows = parseSideBySideDiff(patch);
			const rows = [];
			let oldCursor = 1;
			let newCursor = 1;
			const appendContext = () => {
				rows.push({
					oldLine: oldCursor,
					oldText: oldLines[oldCursor - 1] ?? "",
					newLine: newCursor,
					newText: newLines[newCursor - 1] ?? "",
					kind: "context"
				});
				oldCursor += 1;
				newCursor += 1;
			};
			for (const row of changedRows) {
				const oldGap = row.oldLine === void 0 ? Number.POSITIVE_INFINITY : row.oldLine - oldCursor;
				const newGap = row.newLine === void 0 ? Number.POSITIVE_INFINITY : row.newLine - newCursor;
				const gap = Math.min(oldGap, newGap);
				for (let index = 0; index < gap; index += 1) appendContext();
				rows.push(row);
				if (row.oldLine !== void 0) oldCursor = row.oldLine + 1;
				if (row.newLine !== void 0) newCursor = row.newLine + 1;
			}
			while (oldCursor <= oldLines.length && newCursor <= newLines.length) appendContext();
			while (oldCursor <= oldLines.length) {
				rows.push({
					oldLine: oldCursor,
					oldText: oldLines[oldCursor - 1],
					newLine: void 0,
					newText: void 0,
					kind: "changed"
				});
				oldCursor += 1;
			}
			while (newCursor <= newLines.length) {
				rows.push({
					oldLine: void 0,
					oldText: void 0,
					newLine: newCursor,
					newText: newLines[newCursor - 1],
					kind: "changed"
				});
				newCursor += 1;
			}
			return rows;
		}
		/** One complete side of the aligned comparison. */
		function DiffPane({ rows, side, paneRef, renderWindow, canvasColumns, language, lineHeight, search, activeRow, onScroll }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				ref: paneRef,
				className: GitHistoryBody_module_css_default.diffPane,
				"data-git-diff-pane": side,
				onScroll: (event) => {
					onScroll(side, event);
				},
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: GitHistoryBody_module_css_default.diffCanvas,
					style: { width: `max(100%, ${canvasColumns}ch)` },
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							style: { height: renderWindow.start * lineHeight },
							"aria-hidden": "true"
						}),
						rows.slice(renderWindow.start, renderWindow.end).map((row, index) => {
							const rowIndex = renderWindow.start + index;
							const line = side === "old" ? row.oldLine : row.newLine;
							const content = side === "old" ? row.oldText : row.newText;
							const changed = row.kind === "changed" && content !== void 0;
							const change = changed ? side === "old" ? "removed" : "added" : side;
							return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: clsx(GitHistoryBody_module_css_default.diffCell, changed && (side === "old" ? GitHistoryBody_module_css_default.removed : GitHistoryBody_module_css_default.added), rowIndex === activeRow && GitHistoryBody_module_css_default.searchActiveRow),
								"data-git-diff-side": change,
								style: { height: lineHeight },
								children: [
									side === "old" && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("code", { children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(SyntaxCode, {
										text: content ?? "",
										language,
										search
									}) }),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
										className: GitHistoryBody_module_css_default.lineNumber,
										"data-git-line-number": side,
										children: line ?? ""
									}),
									side === "new" && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("code", { children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(SyntaxCode, {
										text: content ?? "",
										language,
										search
									}) })
								]
							}, rowIndex);
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							style: { height: (rows.length - renderWindow.end) * lineHeight },
							"aria-hidden": "true"
						})
					]
				})
			});
		}
		/** The complete two-pane comparison, initially positioned at its first changed row. */
		const FullDiff = (0, react.memo)(function FullDiff({ comparison, path, synchronized, zoomModifier, t }) {
			const table = (0, react.useRef)(null);
			const oldPane = (0, react.useRef)(null);
			const newPane = (0, react.useRef)(null);
			const synchronizing = (0, react.useRef)(false);
			const zoomTimer = (0, react.useRef)(void 0);
			const [fontSize, setFontSize] = (0, react.useState)(DIFF_FONT_DEFAULT);
			const [zoomVisible, setZoomVisible] = (0, react.useState)(false);
			const [searches, setSearches] = (0, react.useState)({
				old: "",
				new: ""
			});
			const [searchPositions, setSearchPositions] = (0, react.useState)({
				old: -1,
				new: -1
			});
			const language = (0, react.useMemo)(() => diffLanguage(path), [path]);
			const lineHeight = fontSize + 8;
			const rows = (0, react.useMemo)(() => parseFullSideBySideDiff(comparison.before, comparison.after, comparison.patch), [
				comparison.after,
				comparison.before,
				comparison.patch
			]);
			const firstChange = rows.findIndex((row) => row.kind === "changed");
			const initialWindow = diffRenderWindow(Math.max(0, firstChange * DIFF_LINE_HEIGHT - Math.floor(DIFF_VIEWPORT_FALLBACK / 3)), DIFF_VIEWPORT_FALLBACK, rows.length);
			const [renderWindows, setRenderWindows] = (0, react.useState)({
				old: initialWindow,
				new: initialWindow
			});
			const canvasColumns = (0, react.useMemo)(() => rows.reduce((longest, row) => Math.max(longest, row.oldText?.length ?? 0, row.newText?.length ?? 0), 1) + 8, [rows]);
			const searchMatches = (0, react.useMemo)(() => ({
				old: diffSearchRows(rows, "old", searches.old),
				new: diffSearchRows(rows, "new", searches.new)
			}), [rows, searches]);
			(0, react.useEffect)(() => {
				setFontSize(DIFF_FONT_DEFAULT);
				setSearches({
					old: "",
					new: ""
				});
				setSearchPositions({
					old: -1,
					new: -1
				});
				if (firstChange < 0) return;
				const top = firstChange * DIFF_LINE_HEIGHT;
				for (const pane of [oldPane.current, newPane.current]) {
					if (pane === null) continue;
					pane.scrollTop = Math.max(0, top - Math.floor(pane.clientHeight / 3));
				}
				const height = oldPane.current?.clientHeight || DIFF_VIEWPORT_FALLBACK;
				const next = diffRenderWindow(Math.max(0, top - Math.floor(height / 3)), height, rows.length);
				setRenderWindows({
					old: next,
					new: next
				});
			}, [
				comparison,
				firstChange,
				path,
				rows.length
			]);
			(0, react.useEffect)(() => () => {
				if (zoomTimer.current !== void 0) window.clearTimeout(zoomTimer.current);
			}, []);
			(0, react.useEffect)(() => {
				const target = table.current;
				if (target === null) return;
				const zoom = (event) => {
					if (!matchesDiffZoomModifier(event, zoomModifier) || event.deltaY === 0) return;
					event.preventDefault();
					setFontSize((value) => {
						const next = Math.max(DIFF_FONT_MIN, Math.min(DIFF_FONT_MAX, value + (event.deltaY < 0 ? 1 : -1)));
						if (next === value) return value;
						const ratio = (next + 8) / (value + 8);
						for (const pane of [oldPane.current, newPane.current]) if (pane !== null) pane.scrollTop *= ratio;
						return next;
					});
					setZoomVisible(true);
					if (zoomTimer.current !== void 0) window.clearTimeout(zoomTimer.current);
					zoomTimer.current = window.setTimeout(() => {
						setZoomVisible(false);
					}, 1200);
				};
				target.addEventListener("wheel", zoom, { passive: false });
				return () => {
					target.removeEventListener("wheel", zoom);
				};
			}, [zoomModifier]);
			const findNext = (side) => {
				const matches = searchMatches[side];
				if (matches.length === 0) {
					setSearchPositions((current) => ({
						...current,
						[side]: -1
					}));
					return;
				}
				const position = (searchPositions[side] + 1) % matches.length;
				const row = matches[position];
				if (row === void 0) return;
				const top = row * lineHeight;
				const pane = side === "old" ? oldPane.current : newPane.current;
				const other = side === "old" ? newPane.current : oldPane.current;
				if (pane !== null) pane.scrollTop = Math.max(0, top - Math.floor(pane.clientHeight / 3));
				if (synchronized && other !== null && pane !== null) other.scrollTop = pane.scrollTop;
				const height = pane?.clientHeight || DIFF_VIEWPORT_FALLBACK;
				const next = diffRenderWindow(Math.max(0, top - Math.floor(height / 3)), height, rows.length, lineHeight);
				setRenderWindows((current) => synchronized ? {
					old: next,
					new: next
				} : {
					...current,
					[side]: next
				});
				setSearchPositions((current) => ({
					...current,
					[side]: position
				}));
			};
			const scroll = (side, event) => {
				const next = diffRenderWindow(event.currentTarget.scrollTop, event.currentTarget.clientHeight, rows.length, lineHeight);
				setRenderWindows((current) => {
					const same = (value) => value.start === next.start && value.end === next.end;
					if (synchronized) return same(current.old) && same(current.new) ? current : {
						old: next,
						new: next
					};
					return same(current[side]) ? current : {
						...current,
						[side]: next
					};
				});
				if (!synchronized || synchronizing.current) return;
				const other = event.currentTarget === oldPane.current ? newPane.current : oldPane.current;
				if (other === null) return;
				synchronizing.current = true;
				other.scrollTop = event.currentTarget.scrollTop;
				window.requestAnimationFrame(() => {
					synchronizing.current = false;
				});
			};
			if (rows.length === 0) return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
				className: GitHistoryBody_module_css_default.diffHint,
				"data-git-diff-empty": true,
				children: t("detail.noTextChanges")
			});
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				className: GitHistoryBody_module_css_default.diffHeader,
				children: ["old", "new"].map((side) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: GitHistoryBody_module_css_default.diffHeaderSide,
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						"data-git-diff-header": side,
						children: t(side === "old" ? "detail.source" : "detail.modified")
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("form", {
						className: GitHistoryBody_module_css_default.diffSearch,
						onSubmit: (event) => {
							event.preventDefault();
							findNext(side);
						},
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
								value: searches[side],
								"aria-label": t(side === "old" ? "detail.search.source" : "detail.search.modified"),
								placeholder: t("detail.search.placeholder"),
								onChange: (event) => {
									const value = event.currentTarget.value;
									setSearches((current) => ({
										...current,
										[side]: value
									}));
									setSearchPositions((current) => ({
										...current,
										[side]: -1
									}));
								}
							}),
							searchMatches[side].length > 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("output", {
								"aria-live": "polite",
								children: [
									Math.max(0, searchPositions[side] + 1),
									"/",
									searchMatches[side].length
								]
							}),
							searches[side] !== "" && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Tooltip, {
								label: t("detail.search.clear"),
								side: "bottom",
								children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
									type: "button",
									className: GitHistoryBody_module_css_default.diffSearchClear,
									"aria-label": t("detail.search.clear"),
									onClick: () => {
										setSearches((current) => ({
											...current,
											[side]: ""
										}));
										setSearchPositions((current) => ({
											...current,
											[side]: -1
										}));
									},
									children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconCloseOutline16, { size: 13 })
								})
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Tooltip, {
								label: t("detail.search.next"),
								side: "bottom",
								children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
									type: "submit",
									className: GitHistoryBody_module_css_default.diffSearchSubmit,
									"aria-label": t("detail.search.next"),
									children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconSearchOutline16, { size: 14 })
								})
							})
						]
					})]
				}, side))
			}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				ref: table,
				className: GitHistoryBody_module_css_default.diffTable,
				"data-git-first-change": firstChange,
				style: {
					fontSize,
					lineHeight: `${lineHeight}px`
				},
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)(DiffPane, {
						rows,
						side: "old",
						paneRef: oldPane,
						renderWindow: renderWindows.old,
						canvasColumns,
						language,
						lineHeight,
						search: searches.old,
						activeRow: searchMatches.old[searchPositions.old],
						onScroll: scroll
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)(DiffPane, {
						rows,
						side: "new",
						paneRef: newPane,
						renderWindow: renderWindows.new,
						canvasColumns,
						language,
						lineHeight,
						search: searches.new,
						activeRow: searchMatches.new[searchPositions.new],
						onScroll: scroll
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("output", {
						className: clsx(GitHistoryBody_module_css_default.zoomIndicator, zoomVisible && GitHistoryBody_module_css_default.zoomIndicatorVisible),
						"data-git-diff-zoom": true,
						"aria-live": "polite",
						children: [Math.round(fontSize / DIFF_FONT_DEFAULT * 100), "%"]
					})
				]
			})] });
		});
		/** Restore a fullscreen commit comparison to its dialog size. */
		function ExitFullscreenGlyph() {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("svg", {
				width: "16",
				height: "16",
				viewBox: "0 0 16 16",
				fill: "none",
				"aria-hidden": "true",
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
					d: "M2 6h4V2M10 2v4h4M2 10h4v4M10 14v-4h4",
					stroke: "currentColor",
					strokeWidth: "1.25",
					strokeLinecap: "round",
					strokeLinejoin: "round"
				})
			});
		}
		/** Parallel vertical arrows used by the synchronized-scroll toggle. */
		function SynchronizedScrollGlyph() {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("svg", {
				width: "16",
				height: "16",
				viewBox: "0 0 16 16",
				fill: "none",
				"aria-hidden": "true",
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
					d: "M5 13V3m0 0L2.5 5.5M5 3l2.5 2.5M11 3v10m0 0l-2.5-2.5M11 13l2.5-2.5",
					stroke: "currentColor",
					strokeWidth: "1.25",
					strokeLinecap: "round",
					strokeLinejoin: "round"
				})
			});
		}
		function ComparisonTools({ comparison, synchronized, fullscreen, setSynchronized, setFullscreen, t }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: GitHistoryBody_module_css_default.detailTools,
				children: [comparison?.binary === false && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Tooltip, {
					label: synchronized ? t("detail.sync.disable") : t("detail.sync.enable"),
					side: "bottom",
					delayMs: 400,
					children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
						type: "button",
						className: GitHistoryBody_module_css_default.iconTool,
						"aria-label": synchronized ? t("detail.sync.disable") : t("detail.sync.enable"),
						"aria-pressed": synchronized,
						"data-git-diff-sync": true,
						onClick: () => {
							setSynchronized((value) => !value);
						},
						children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(SynchronizedScrollGlyph, {})
					})
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Tooltip, {
					label: fullscreen ? t("detail.fullscreen.exit") : t("detail.fullscreen.enter"),
					side: "bottom",
					delayMs: 400,
					children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
						type: "button",
						className: GitHistoryBody_module_css_default.iconTool,
						"aria-label": fullscreen ? t("detail.fullscreen.exit") : t("detail.fullscreen.enter"),
						"aria-pressed": fullscreen,
						"data-git-detail-fullscreen": true,
						onClick: () => {
							setFullscreen((value) => !value);
						},
						children: fullscreen ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(ExitFullscreenGlyph, {}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconFullscreenOutline16, {})
					})
				})]
			});
		}
		/** Map a changed file name to the compact language mark shown in the commit tree. */
		function commitFileIconKind(name) {
			switch (name.toLocaleLowerCase().split(".").at(-1) ?? "") {
				case "java": return "java";
				case "xml": return "xml";
				case "txt":
				case "log": return "text";
				case "py":
				case "pyw": return "python";
				case "ts":
				case "tsx":
				case "mts":
				case "cts": return "typescript";
				case "js":
				case "jsx":
				case "mjs":
				case "cjs": return "javascript";
				case "json":
				case "jsonc": return "json";
				case "md":
				case "mdx": return "markdown";
				case "css":
				case "scss":
				case "sass":
				case "less": return "style";
				case "html":
				case "htm":
				case "vue":
				case "svelte": return "html";
				case "sh":
				case "bash":
				case "zsh":
				case "ps1":
				case "bat":
				case "cmd": return "shell";
				default: return "generic";
			}
		}
		/** A system-sized document glyph with a format-specific language mark. */
		function CommitFileIcon({ name }) {
			const kind = commitFileIconKind(name);
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
				className: clsx(GitHistoryBody_module_css_default.fileTypeIcon, GitHistoryBody_module_css_default[`fileType_${kind}`]),
				"data-git-file-icon": kind,
				"aria-hidden": "true",
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("svg", {
					viewBox: "0 0 16 16",
					fill: "none",
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
						d: "M3.5 1.75h5.25l3.75 3.75v8.75h-9z",
						stroke: "currentColor",
						strokeWidth: "1.15",
						strokeLinejoin: "round"
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
						d: "M8.75 1.75V5.5h3.75",
						stroke: "currentColor",
						strokeWidth: "1.15",
						strokeLinejoin: "round"
					})]
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { className: GitHistoryBody_module_css_default.fileTypeMark })]
			});
		}
		/** Build a stable directory tree from the commit's Workspace-relative paths. */
		function buildCommitTree(files) {
			const root = /* @__PURE__ */ new Map();
			for (const file of files) {
				let level = root;
				let currentPath = "";
				const parts = file.path.split("/").filter(Boolean);
				parts.forEach((name, index) => {
					currentPath = currentPath === "" ? name : `${currentPath}/${name}`;
					let node = level.get(name);
					if (node === void 0) {
						node = {
							name,
							path: currentPath,
							children: /* @__PURE__ */ new Map()
						};
						level.set(name, node);
					}
					if (index === parts.length - 1) node.file = file;
					level = node.children;
				});
			}
			const freeze = (nodes) => [...nodes.values()].sort((left, right) => {
				const leftFile = left.file !== void 0;
				if (leftFile !== (right.file !== void 0)) return leftFile ? 1 : -1;
				if (left.name === right.name) return 0;
				return left.name < right.name ? -1 : 1;
			}).map((node) => ({
				...node,
				children: freeze(node.children)
			}));
			return freeze(root);
		}
		/** One expandable directory or selectable changed file in the commit tree. */
		function CommitTreeRow({ node, depth, selectedPath, onOpen }) {
			const [expanded, setExpanded] = (0, react.useState)(true);
			const file = node.file;
			if (file !== void 0) return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
				type: "button",
				className: clsx(GitHistoryBody_module_css_default.treeRow, GitHistoryBody_module_css_default.treeFile, selectedPath === file.path && GitHistoryBody_module_css_default.detailFileSelected),
				style: { paddingLeft: `${8 + depth * 16}px` },
				title: file.path,
				"data-git-commit-file": file.path,
				onClick: () => {
					onOpen(file);
				},
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)(CommitFileIcon, { name: node.name }),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						className: GitHistoryBody_module_css_default.fileName,
						children: node.name
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						className: GitHistoryBody_module_css_default.fileStatus,
						children: file.status
					})
				]
			}) });
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
				type: "button",
				className: GitHistoryBody_module_css_default.treeRow,
				style: { paddingLeft: `${8 + depth * 16}px` },
				title: node.path,
				"aria-expanded": expanded,
				onClick: () => {
					setExpanded((value) => !value);
				},
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconChevronRightOutline14, { className: clsx(GitHistoryBody_module_css_default.treeChevron, expanded && GitHistoryBody_module_css_default.treeChevronExpanded) }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: node.name })]
			}), expanded && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("ul", {
				className: GitHistoryBody_module_css_default.treeLevel,
				children: node.children.map((child) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)(CommitTreeRow, {
					node: child,
					depth: depth + 1,
					selectedPath,
					onOpen
				}, child.path))
			})] });
		}
		/** Shared commit-review modal used by history and pending-push rows. */
		function CommitDetailModal({ commit, workspaceId, readCommitFiles, readCommitDiff, zoomModifier, onClose, t }) {
			const request = (0, react.useRef)(void 0);
			const layoutRef = (0, react.useRef)(null);
			const stopResizeRef = (0, react.useRef)(void 0);
			const [files, setFiles] = (0, react.useState)(void 0);
			const [selectedPath, setSelectedPath] = (0, react.useState)(void 0);
			const [comparison, setComparison] = (0, react.useState)(void 0);
			const [synchronized, setSynchronized] = (0, react.useState)(true);
			const [fullscreen, setFullscreen] = (0, react.useState)(false);
			const [failure, setFailure] = (0, react.useState)(void 0);
			const [filePaneWidth, setFilePaneWidth] = (0, react.useState)(320);
			const fileTree = (0, react.useMemo)(() => files === void 0 ? void 0 : buildCommitTree(files), [files]);
			(0, react.useEffect)(() => {
				request.current?.abort();
				if (commit === void 0) return;
				const controller = new AbortController();
				request.current = controller;
				setFiles(void 0);
				setSelectedPath(void 0);
				setComparison(void 0);
				setFullscreen(false);
				setFailure(void 0);
				readCommitFiles(workspaceId, commit.hash.trim(), controller.signal).then((result) => {
					if (controller.signal.aborted) return;
					if (result.ok) setFiles(result.value.files);
					else setFailure(failureLine(t, result.error));
				});
				return () => {
					controller.abort();
				};
			}, [
				commit,
				readCommitFiles,
				t,
				workspaceId
			]);
			(0, react.useEffect)(() => () => {
				request.current?.abort();
				stopResizeRef.current?.();
			}, []);
			const openDiff = (file) => {
				if (commit === void 0) return;
				request.current?.abort();
				const controller = new AbortController();
				request.current = controller;
				setSelectedPath(file.path);
				setComparison(void 0);
				setFailure(void 0);
				readCommitDiff(workspaceId, commit.hash.trim(), file, controller.signal).then((result) => {
					if (controller.signal.aborted) return;
					if (result.ok) setComparison(result.value);
					else setFailure(failureLine(t, result.error));
				});
			};
			const close = () => {
				request.current?.abort();
				stopResizeRef.current?.();
				onClose();
			};
			const beginResize = (event) => {
				const layout = layoutRef.current;
				if (layout === null) return;
				event.preventDefault();
				stopResizeRef.current?.();
				const rect = layout.getBoundingClientRect();
				const previousUserSelect = document.body.style.userSelect;
				const maximum = Math.max(180, rect.width - 320);
				let pendingWidth = filePaneWidth;
				let frame;
				document.body.style.userSelect = "none";
				const apply = () => {
					frame = void 0;
					layout.style.gridTemplateColumns = `${pendingWidth}px 6px minmax(0, 1fr)`;
				};
				const move = (moveEvent) => {
					pendingWidth = Math.max(180, Math.min(maximum, moveEvent.clientX - rect.left));
					if (frame === void 0) frame = window.requestAnimationFrame(apply);
				};
				const stop = () => {
					window.removeEventListener("mousemove", move);
					window.removeEventListener("mouseup", stop);
					if (frame !== void 0) window.cancelAnimationFrame(frame);
					apply();
					setFilePaneWidth(pendingWidth);
					document.body.style.userSelect = previousUserSelect;
					stopResizeRef.current = void 0;
				};
				stopResizeRef.current = stop;
				window.addEventListener("mousemove", move);
				window.addEventListener("mouseup", stop);
			};
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(ComparisonDialog, { fullscreen,
				open: commit !== void 0,
				className: clsx(GitHistoryBody_module_css_default.detailDialog, fullscreen && GitHistoryBody_module_css_default.detailDialogFullscreen),
				title: commit?.subject ?? t("detail.title"),
				closeLabel: t("detail.close"),
				onClose: close,
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: clsx(GitHistoryBody_module_css_default.detailMeta, fullscreen && GitHistoryBody_module_css_default.detailMetaFullscreen),
					children: [!fullscreen && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
						"data-git-detail-meta": true,
						children: [
							commit?.shortHash,
							" · ",
							commit?.authorName
						]
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(ComparisonTools, {
						comparison,
						synchronized,
						fullscreen,
						setSynchronized,
						setFullscreen,
						t
					})]
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					ref: layoutRef,
					className: clsx(GitHistoryBody_module_css_default.detailLayout, fullscreen && GitHistoryBody_module_css_default.detailLayoutFullscreen),
					style: { gridTemplateColumns: fullscreen ? "minmax(0, 1fr)" : `${filePaneWidth}px 6px minmax(0, 1fr)` },
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("aside", {
							className: GitHistoryBody_module_css_default.fileList,
							"aria-label": t("detail.files"),
							"aria-hidden": fullscreen || void 0,
							children: [files === void 0 && failure === void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
								className: GitHistoryBody_module_css_default.note,
								children: t("detail.loadingFiles")
							}), fileTree !== void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("ul", {
								className: GitHistoryBody_module_css_default.treeLevel,
								children: fileTree.map((node) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)(CommitTreeRow, {
									node,
									depth: 0,
									selectedPath,
									onOpen: openDiff
								}, node.path))
							})]
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							className: GitHistoryBody_module_css_default.filePaneResize,
							role: "separator",
							"aria-label": t("detail.resize"),
							"aria-orientation": "vertical",
							"aria-hidden": fullscreen || void 0,
							"data-git-detail-resize": true,
							onMouseDown: beginResize
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
							className: GitHistoryBody_module_css_default.diff,
							"aria-label": t("detail.diff"),
							children: [
								selectedPath === void 0 && failure === void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
									className: GitHistoryBody_module_css_default.diffHint,
									children: t("detail.selectFile")
								}),
								selectedPath !== void 0 && comparison === void 0 && failure === void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
									className: GitHistoryBody_module_css_default.diffHint,
									children: t("detail.loadingDiff")
								}),
								comparison?.binary === true && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
									className: GitHistoryBody_module_css_default.binaryNotice,
									children: t("detail.binary")
								}),
								comparison?.binary === false && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(FullDiff, {
									comparison,
									path: selectedPath ?? "",
									synchronized,
									zoomModifier,
									t
								}),
								failure !== void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
									className: GitHistoryBody_module_css_default.error,
									role: "alert",
									children: failure
								})
							]
						})
					]
				})]
			});
		}
		/** Working-tree comparison that reuses the commit review's diff renderer and controls. */
		function WorkingTreeDiffModal({ file, workspaceId, readWorkingDiff, zoomModifier, onClose, t }) {
			const request = (0, react.useRef)(void 0);
			const [comparison, setComparison] = (0, react.useState)(void 0);
			const [synchronized, setSynchronized] = (0, react.useState)(true);
			const [fullscreen, setFullscreen] = (0, react.useState)(false);
			const [failure, setFailure] = (0, react.useState)(void 0);
			(0, react.useEffect)(() => {
				request.current?.abort();
				if (file === void 0) return;
				const controller = new AbortController();
				request.current = controller;
				setComparison(void 0);
				setSynchronized(true);
				setFullscreen(false);
				setFailure(void 0);
				readWorkingDiff(workspaceId, file, controller.signal).then((result) => {
					if (controller.signal.aborted) return;
					if (result.ok) setComparison(result.value);
					else setFailure(failureLine(t, result.error));
				});
				return () => {
					controller.abort();
				};
			}, [
				file,
				readWorkingDiff,
				t,
				workspaceId
			]);
			const close = () => {
				request.current?.abort();
				onClose();
			};
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(ComparisonDialog, { fullscreen,
				open: file !== void 0,
				className: clsx(GitHistoryBody_module_css_default.detailDialog, fullscreen && GitHistoryBody_module_css_default.detailDialogFullscreen),
				title: file?.path ?? t("detail.title"),
				closeLabel: t("detail.close"),
				onClose: close,
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: clsx(GitHistoryBody_module_css_default.detailMeta, fullscreen && GitHistoryBody_module_css_default.detailMetaFullscreen),
					children: [!fullscreen && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						"data-git-working-detail-meta": true,
						children: t("detail.workingTree")
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(ComparisonTools, {
						comparison,
						synchronized,
						fullscreen,
						setSynchronized,
						setFullscreen,
						t
					})]
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					className: clsx(GitHistoryBody_module_css_default.detailLayout, GitHistoryBody_module_css_default.workingDiffLayout, fullscreen && GitHistoryBody_module_css_default.detailLayoutFullscreen),
					children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
						className: GitHistoryBody_module_css_default.diff,
						"aria-label": t("detail.diff"),
						children: [
							comparison === void 0 && failure === void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
								className: GitHistoryBody_module_css_default.diffHint,
								children: t("detail.loadingDiff")
							}),
							comparison?.binary === true && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
								className: GitHistoryBody_module_css_default.binaryNotice,
								children: t("detail.binary")
							}),
							comparison?.binary === false && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(FullDiff, {
								comparison,
								path: file?.path ?? "",
								synchronized,
								zoomModifier,
								t
							}),
							failure !== void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
								className: GitHistoryBody_module_css_default.error,
								role: "alert",
								children: failure
							})
						]
					})
				})]
			});
		}
		/** The commit history's body: the workspace's commits and the controls over them. */
		function GitHistoryBody({ useTabInfo, sessionId, useSessions, useWorkspaces, useStore, start, reload, loadMore, readCommitFiles, readCommitDiff, useDiffZoomModifier, t }) {
			const zoomModifier = useDiffZoomModifier((value) => value);
			const { tab } = useTabInfo();
			const { signal } = tab;
			const cwd = useSessions((sessions) => sessions.byId[sessionId]?.cwd);
			const workspaceId = useWorkspaces((workspaces) => {
				const owned = workspaces.items.find((workspace) => workspace.sessionIds.includes(sessionId));
				if (owned !== void 0) return owned.workspaceId;
				return workspaces.items.find((workspace) => workspace.path === cwd)?.workspaceId;
			});
			const state = useStore((store) => store.byTab[tab.id]);
			const [query, setQuery] = (0, react.useState)("");
			const [selectedCommit, setSelectedCommit] = (0, react.useState)(void 0);
			const [dateOpen, setDateOpen] = (0, react.useState)(false);
			const changesVisible = useGitChangesVisible(sessionId);
			(0, react.useEffect)(() => {
				if (state !== void 0 || workspaceId === void 0 || signal.aborted) return;
				start(tab.id, workspaceId, signal);
			}, [
				state,
				workspaceId,
				tab.id,
				signal,
				start
			]);
			const historySearch = state?.search;
			const historyAuthor = state?.author;
			const historySince = state?.since;
			const historyUntil = state?.until;
			(0, react.useEffect)(() => {
				if (workspaceId === void 0 || historySearch === void 0 || historyAuthor === void 0 || historySince === void 0 || historyUntil === void 0) return;
				return subscribeGitHistoryRefresh(sessionId, () => {
					if (!signal.aborted) reload(tab.id, workspaceId, {
						search: historySearch,
						author: historyAuthor,
						since: historySince,
						until: historyUntil
					}, signal);
				});
			}, [
				historyAuthor,
				historySearch,
				historySince,
				historyUntil,
				reload,
				sessionId,
				signal,
				tab.id,
				workspaceId
			]);
			if (workspaceId === void 0) return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				className: GitHistoryBody_module_css_default.status,
				"data-git-state": "no-workspace",
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
					className: GitHistoryBody_module_css_default.statusLine,
					"data-git-row": "no-workspace",
					children: t("noWorkspace")
				})
			});
			if (state === void 0) return null;
			/** The filter one read carries: the window's applied bounds, plus what the reader just typed. */
			const filterOf = (overrides = {}) => ({
				search: query.trim(),
				author: state.author,
				since: state.since,
				until: state.until,
				...overrides
			});
			const submit = (event) => {
				event.preventDefault();
				reload(tab.id, workspaceId, filterOf({ search: query.trim() }), signal);
			};
			/** Apply one author choice at once: a dropdown choice is the filter itself. */
			const chooseAuthor = (author) => {
				if (author === state.author) return;
				reload(tab.id, workspaceId, filterOf({ author }), signal);
			};
			/** Apply one date bound at once; a cleared field simply drops that bound. */
			const chooseDate = (bound, value) => {
				if (state[bound] === value) return;
				const next = filterOf();
				reload(tab.id, workspaceId, bound === "since" ? {
					...next,
					since: value
				} : {
					...next,
					until: value
				}, signal);
			};
			const clearDates = () => {
				setDateOpen(true);
				if (state.since === '' && state.until === '') return;
				reload(tab.id, workspaceId, filterOf({
					since: "",
					until: ""
				}), signal);
			};
			const dateFiltered = state.since !== "" || state.until !== "";
			const dateTitle = state.since !== "" && state.until !== "" ? t("search.date.range", {
				since: state.since,
				until: state.until
			}) : state.since !== "" ? t("search.date.sinceRange", { since: state.since }) : state.until !== "" ? t("search.date.untilRange", { until: state.until }) : t("search.date.toggle");
			const title = state.branch === void 0 ? t("header.detached") : t("header.branch", { branch: state.branch });
			const workspaceTitle = cwd === void 0 ? "" : workspaceTitleOf(cwd);
			const failed = state.failure === void 0 ? void 0 : failureLine(t, state.failure);
			const openCommit = (commit) => {
				setSelectedCommit(commit);
			};
			const pending = state.status === "loading" && state.commits.length === 0;
			const replacesList = state.status === "failed" && state.commits.length === 0;
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: GitHistoryBody_module_css_default.root,
				"data-git-state": "list",
				"data-git-workspace": workspaceId,
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: GitHistoryBody_module_css_default.chrome,
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: GitHistoryBody_module_css_default.header,
							children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconBranchOutline16, { className: GitHistoryBody_module_css_default.icon }),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: GitHistoryBody_module_css_default.name,
									"data-git-branch": state.branch ?? "",
									title: workspaceTitle || void 0,
									children: title
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
									type: "button",
									className: GitHistoryBody_module_css_default.changesTool,
									"aria-label": changesVisible ? t("changes.hide") : t("changes.show"),
									title: changesVisible ? t("changes.hide") : t("changes.show"),
									"aria-pressed": changesVisible,
									"data-git-changes-toggle": true,
									onClick: () => {
										setGitChangesVisible(sessionId, !changesVisible);
									},
									children: t("changes.trigger")
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
									type: "button",
									className: GitHistoryBody_module_css_default.tool,
									"aria-label": t("reload"),
									title: t("reload"),
									"data-git-reload": true,
									onClick: () => {
										reload(tab.id, workspaceId, {
											search: state.search,
											author: state.author,
											since: state.since,
											until: state.until
										}, signal);
									},
									children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconRefreshOutline16, {})
								})
							]
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("form", {
							className: GitHistoryBody_module_css_default.search,
							onSubmit: submit,
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("select", {
								className: GitHistoryBody_module_css_default.authorSelect,
								value: state.author,
								"aria-label": t("search.author.label"),
								title: t("search.author.label"),
								"data-git-author": true,
								onChange: (event) => {
									chooseAuthor(event.currentTarget.value);
								},
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("option", {
									value: "",
									children: t("search.author.all")
								}), state.authors.map((author) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("option", {
									value: author,
									children: author
								}, author))]
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: clsx(GitHistoryBody_module_css_default.searchTool, dateFiltered && GitHistoryBody_module_css_default.dateToolActive),
								"aria-label": dateTitle,
								title: dateTitle,
								"aria-pressed": dateFiltered,
								"data-git-date-toggle": true,
								onClick: () => {
									setDateOpen((value) => !value);
								},
								children: t("search.date.toggle")
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Input, {
								className: GitHistoryBody_module_css_default.input,
								type: "search",
								value: query,
								placeholder: t("search.placeholder"),
								"aria-label": t("search.placeholder"),
								onChange: (event) => {
									setQuery(event.target.value);
								}
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								type: "submit",
								className: GitHistoryBody_module_css_default.searchTool,
								"data-git-search": true,
								children: t("search.submit")
							})]
						}), (dateOpen || dateFiltered) && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: GitHistoryBody_module_css_default.dateRow,
							"data-git-date-row": true,
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(HistoryDatePicker, {
								value: state.since,
								max: state.until === "" ? void 0 : state.until,
								"aria-label": t("search.date.since"),
								title: t("search.date.since"),
								"data-git-since": true,
								onChange: (value) => { chooseDate("since", value); }
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: GitHistoryBody_module_css_default.dateDash,
								"aria-hidden": "true",
								children: "–"
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(HistoryDatePicker, {
								value: state.until,
								min: state.since === "" ? void 0 : state.since,
								"aria-label": t("search.date.until"),
								title: t("search.date.until"),
								"data-git-until": true,
								onChange: (value) => { chooseDate("until", value); }
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: GitHistoryBody_module_css_default.dateClear,
								"aria-label": t("search.date.clear"),
								title: t("search.date.clear"),
								"data-git-date-clear": true,
								onClick: clearDates,
								children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconCloseOutline16, { size: 13 })
							})]
						})]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: GitHistoryBody_module_css_default.body,
						children: [
							pending && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
								className: GitHistoryBody_module_css_default.note,
								"data-git-row": "loading",
								children: t("loading")
							}),
							replacesList && failed !== void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
								className: GitHistoryBody_module_css_default.error,
								"data-git-row": "failed",
								children: failed
							}),
							!pending && !replacesList && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(HistoryList, {
								state,
								onOpen: openCommit,
								t
							}),
							!replacesList && failed !== void 0 && state.commits.length > 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
								className: GitHistoryBody_module_css_default.error,
								"data-git-row": "failed",
								children: failed
							}),
							!pending && state.more && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: clsx(GitHistoryBody_module_css_default.more, state.loadingMore && GitHistoryBody_module_css_default.moreBusy),
								"data-git-more": true,
								disabled: state.loadingMore,
								onClick: () => {
									loadMore(tab.id, workspaceId, {
										search: state.search,
										author: state.author,
										since: state.since,
										until: state.until
									}, state.skip, signal);
								},
								children: state.loadingMore ? t("loadingMore") : t("more")
							})
						]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)(CommitDetailModal, {
						commit: selectedCommit,
						workspaceId,
						readCommitFiles,
						readCommitDiff,
						zoomModifier,
						onClose: () => {
							setSelectedCommit(void 0);
						},
						t
					})
				]
			});
		}
		//#endregion
		//#region src/client/last-messages.ts
		const STORAGE_KEY = "dsh.gitWorkspace.lastMessages";
		/**
		* Read one previously successful message; unavailable storage behaves as empty.
		* @param workspaceId - Workspace that owns the message history.
		* @param kind - Commit or stash message slot.
		* @returns the stored message, or undefined when none is available.
		*/
		function readLastGitMessage(workspaceId, kind) {
			if (typeof localStorage === "undefined") return void 0;
			try {
				const raw = localStorage.getItem(STORAGE_KEY);
				if (raw === null) return void 0;
				const value = JSON.parse(raw)[workspaceId]?.[kind];
				return typeof value === "string" && value !== "" ? value : void 0;
			} catch {
				return;
			}
		}
		/**
		* Save one successful message; storage failure never changes the Git result.
		* @param workspaceId - Workspace that owns the message history.
		* @param kind - Commit or stash message slot.
		* @param message - successful mutation message to remember.
		*/
		function writeLastGitMessage(workspaceId, kind, message) {
			if (typeof localStorage === "undefined") return;
			try {
				const raw = localStorage.getItem(STORAGE_KEY);
				const stored = raw === null ? {} : JSON.parse(raw);
				localStorage.setItem(STORAGE_KEY, JSON.stringify({
					...stored,
					[workspaceId]: {
						...stored[workspaceId],
						[kind]: message
					}
				}));
			} catch {}
		}
		//#endregion
		//#region dsh-css:source/git-review/client/GitChangesBody.module.css.mjs
		const css$1 = ".jdsH1W_root{height:50%;min-height:0;color:var(--dsw-alias-label-primary);font-size:var(--dsh-content-font-size-secondary,13px);border-bottom:.5px solid var(--dsw-alias-border-l2);flex-direction:column;flex:none;line-height:1.5;display:flex;position:relative;overflow:hidden}.jdsH1W_content{min-height:0;padding:4px 0 8px;overflow:auto}.jdsH1W_resizeHandle{z-index:3;cursor:row-resize;touch-action:none;height:6px;position:absolute;bottom:-3px;left:0;right:0}.jdsH1W_resizeHandle:after{content:\"\";background:var(--dsw-alias-border-l2);height:1px;position:absolute;top:2px;left:0;right:0}.jdsH1W_resizeHandle:hover:after{background:var(--dsw-alias-label-tertiary);height:2px}.jdsH1W_reviewToolbar{flex:none;justify-content:space-between;align-items:center;min-height:28px;padding:0 10px 10px;display:flex}.jdsH1W_reviewTitle{color:var(--dsw-alias-label-primary);font-size:14px}.jdsH1W_header{color:var(--dsw-alias-label-secondary);flex:none;align-items:center;gap:6px;padding:3px 10px;display:flex}.jdsH1W_sectionToggle{min-width:0;color:var(--dsw-alias-label-primary);font:inherit;text-align:start;background:color-mix(in srgb, var(--dsw-alias-bg-base) 68%, transparent);border:.5px solid var(--dsw-alias-border-l2);backdrop-filter:blur(18px)saturate(130%);cursor:pointer;border-radius:7px;flex:auto;align-items:center;gap:5px;padding:4px 8px;font-size:14px;display:flex}.jdsH1W_sectionToggle:hover{background:var(--dsw-alias-interactive-bg-hover)}.jdsH1W_sectionToggle .jdsH1W_count{color:var(--dsw-alias-label-secondary);font-size:13px}body[data-dsh-background-media] .jdsH1W_sectionToggle{background:color-mix(in srgb, var(--dsw-alias-bg-base) 46%, transparent)}.jdsH1W_sectionChevron{flex:none;transition:transform .12s;transform:rotate(-90deg)}.jdsH1W_sectionChevronExpanded{transform:rotate(0)}.jdsH1W_subsectionHeader{width:100%;font:inherit;text-align:start;background:transparent;border:0;border-radius:6px;cursor:pointer;color:var(--dsw-alias-label-secondary);align-items:center;gap:5px;padding:5px 18px 2px;display:flex}.jdsH1W_subsectionHeader:hover{background:var(--dsw-alias-interactive-bg-hover)}.jdsH1W_headerActions{align-items:center;gap:2px;margin-left:auto;display:inline-flex}.jdsH1W_operationStatus{max-width:180px;color:var(--dsw-alias-label-secondary);white-space:nowrap;text-overflow:ellipsis;align-items:center;gap:6px;margin-right:4px;font-size:12px;display:inline-flex;overflow:hidden}.jdsH1W_operationSpinner{border:1.5px solid color-mix(in srgb, currentColor 28%, transparent);border-top-color:currentColor;border-radius:50%;width:12px;height:12px;animation:.72s linear infinite jdsH1W_git-operation-spin}@keyframes jdsH1W_git-operation-spin{to{transform:rotate(360deg)}}@media (prefers-reduced-motion:reduce){.jdsH1W_operationSpinner{animation-duration:1.8s}}.jdsH1W_actionButton{height:24px;color:var(--dsw-alias-label-secondary);font:inherit;background:color-mix(in srgb, var(--dsw-alias-bg-base) 68%, transparent);border:.5px solid var(--dsw-alias-border-l2);cursor:pointer;border-radius:6px;align-items:center;gap:3px;padding:0 8px;display:inline-flex}.jdsH1W_actionButton:hover:not(:disabled){color:var(--dsw-alias-label-primary);background:var(--dsw-alias-interactive-bg-hover)}.jdsH1W_actionButton:disabled{cursor:default;opacity:.5}.jdsH1W_rollbackButton{color:var(--dsw-alias-state-error-primary)}.jdsH1W_rollbackWarning{color:var(--dsw-alias-label-secondary);margin:0}.jdsH1W_actionIcon{stroke:currentColor;stroke-width:1.25px;stroke-linecap:round;stroke-linejoin:round;width:16px;height:16px;display:block}.jdsH1W_actionError{border:1px solid var(--dsw-alias-state-error-primary);color:var(--dsw-alias-state-error-primary);overflow-wrap:anywhere;white-space:pre-wrap;border-radius:8px;margin:0 10px 8px;padding:6px 10px;font-size:12px}body[data-dsh-background-media] .jdsH1W_actionDialog{background:color-mix(in srgb, var(--dsw-alias-bg-layer-2) 72%, transparent);backdrop-filter:blur(16px)saturate(125%)}.jdsH1W_lastMessage{color:var(--dsw-alias-label-secondary);background:var(--dsw-alias-bg-layer-1);border:.5px solid var(--dsw-alias-border-l2);border-radius:8px;grid-template-columns:auto minmax(0,1fr) auto;align-items:center;gap:8px;margin-top:10px;padding:7px 9px;font-size:12px;display:grid}body[data-dsh-background-media] .jdsH1W_lastMessage{background:color-mix(in srgb, var(--dsw-alias-bg-layer-1) 60%, transparent);backdrop-filter:blur(16px)saturate(125%)}.jdsH1W_lastMessageLabel{white-space:nowrap}.jdsH1W_lastMessageText{min-width:0;color:var(--dsw-alias-label-primary);white-space:nowrap;text-overflow:ellipsis;overflow:hidden}.jdsH1W_fillMessageButton{color:var(--dsw-alias-label-secondary);font:inherit;background:var(--dsw-alias-interactive-bg-hover);border:.5px solid var(--dsw-alias-border-l2);cursor:pointer;border-radius:5px;padding:2px 7px}.jdsH1W_fillMessageButton:hover{color:var(--dsw-alias-label-primary)}.jdsH1W_name{white-space:nowrap;text-overflow:ellipsis;min-width:0;overflow:hidden}.jdsH1W_count{color:var(--dsw-alias-label-tertiary);flex:none;font-size:12px}.jdsH1W_tool{width:24px;height:24px;color:var(--dsw-alias-label-secondary);cursor:pointer;background:0 0;border:0;border-radius:6px;flex:none;justify-content:center;align-items:center;padding:0;display:inline-flex}.jdsH1W_tool:hover{background:var(--dsw-alias-interactive-bg-hover)}.jdsH1W_closeFloating{position:absolute;top:4px;right:10px}.jdsH1W_list{flex-direction:column;flex:none;display:flex}.jdsH1W_level{margin:0;padding:0;list-style:none}.jdsH1W_pendingCommit{padding:0 10px}.jdsH1W_pendingCommitButton{width:100%;color:inherit;font:inherit;text-align:start;cursor:pointer;background:0 0;border:0;border-radius:6px;grid-template-columns:auto minmax(0,1fr);align-items:baseline;gap:0 7px;padding:3px 8px;display:grid}.jdsH1W_pendingCommitButton:hover{background:var(--dsw-alias-interactive-bg-hover)}.jdsH1W_pendingHash{color:var(--dsw-alias-link);font-family:var(--ds-font-family-code);grid-row:1/span 2;font-size:12px}.jdsH1W_pendingSubject{white-space:nowrap;text-overflow:ellipsis;min-width:0;overflow:hidden}.jdsH1W_pendingMeta{min-width:0;color:var(--dsw-alias-label-tertiary);white-space:nowrap;text-overflow:ellipsis;font-size:12px;overflow:hidden}.jdsH1W_item{align-items:center;margin:0;padding:0 4px;display:flex}.jdsH1W_fileCheckbox{width:14px;height:14px;accent-color:var(--dsw-alias-brand-primary);cursor:pointer;flex:none;margin:0 2px}.jdsH1W_fileRow{width:100%;color:inherit;font:inherit;text-align:start;cursor:pointer;background:0 0;border:0;border-radius:6px;align-items:baseline;gap:6px;padding:3px 6px;display:flex}.jdsH1W_fileRow:hover{background:var(--dsw-alias-interactive-bg-hover)}.jdsH1W_rowAction{width:24px;height:24px;color:var(--dsw-alias-label-tertiary);cursor:pointer;background:0 0;border:0;border-radius:6px;flex:none;justify-content:center;align-items:center;padding:0;display:inline-flex}.jdsH1W_rowAction:hover:not(:disabled){color:var(--dsw-alias-state-error-primary);background:var(--dsw-alias-interactive-bg-hover)}.jdsH1W_rowAction:disabled{cursor:default;opacity:.5}.jdsH1W_badge{color:var(--dsw-alias-label-secondary);font-family:var(--ds-font-family-code);flex:none;font-size:12px}.jdsH1W_badgeModified{color:var(--dsw-alias-state-warn-primary)}.jdsH1W_badgeAdded{color:var(--dsw-alias-state-success-primary)}.jdsH1W_badgeDeleted{color:var(--dsw-alias-state-error-primary)}.jdsH1W_badgeRenamed{color:var(--dsw-alias-link)}.jdsH1W_badgeConflict{color:var(--dsw-alias-state-error-primary)}.jdsH1W_fileName{white-space:nowrap;text-overflow:ellipsis;min-width:0;overflow:hidden}.jdsH1W_fileDir{min-width:0;color:var(--dsw-alias-label-tertiary);white-space:nowrap;text-overflow:ellipsis;flex:0 auto;font-size:12px;overflow:hidden}.jdsH1W_stashRow{align-items:center;gap:6px;padding:2px 6px;display:flex}.jdsH1W_stashCollection{background:color-mix(in srgb, var(--dsw-alias-bg-base) 52%, transparent);border:.5px solid var(--dsw-alias-border-l2);border-radius:7px;margin:0 4px 4px;overflow:hidden}.jdsH1W_stashToggle{min-width:0;color:inherit;font:inherit;text-align:start;cursor:pointer;background:0 0;border:0;flex:auto;align-items:center;gap:5px;padding:4px 2px;display:flex}.jdsH1W_stashChevron{flex:none;transition:transform .12s;transform:rotate(-90deg)}.jdsH1W_stashChevronExpanded{transform:rotate(0)}.jdsH1W_stashSubject{white-space:nowrap;text-overflow:ellipsis;min-width:0;overflow:hidden}.jdsH1W_stashDate{color:var(--dsw-alias-label-tertiary);flex:none;margin-left:auto;font-size:12px}.jdsH1W_restoreButton{color:var(--dsw-alias-label-secondary);font:inherit;background:var(--dsw-alias-interactive-bg-hover);border:.5px solid var(--dsw-alias-border-l2);cursor:pointer;border-radius:5px;flex:none;padding:2px 7px}.jdsH1W_stashActions{flex:none;gap:4px;display:inline-flex}.jdsH1W_deleteButton{color:var(--dsw-alias-state-error-primary)}.jdsH1W_restoreButton:disabled{cursor:default;opacity:.5}.jdsH1W_stashDetails{border-top:.5px solid var(--dsw-alias-border-l2);padding:2px 4px 5px 19px}.jdsH1W_stashFile{align-items:baseline;gap:6px;min-width:0;padding:2px 6px;display:flex}.jdsH1W_note{color:var(--dsw-alias-label-tertiary);margin:0;padding:3px 10px;font-size:12px}.jdsH1W_ignoreNote{color:var(--dsw-alias-label-secondary);background:color-mix(in srgb, var(--dsw-alias-bg-layer-1) 76%, transparent);border:.5px solid var(--dsw-alias-border-l2);border-radius:6px;margin:3px 8px 5px;padding:6px 9px;font-size:12px}body[data-dsh-background-media] .jdsH1W_ignoreNote{background:color-mix(in srgb, var(--dsw-alias-bg-layer-1) 48%, transparent);backdrop-filter:blur(12px)saturate(125%)}.jdsH1W_error{color:var(--dsw-alias-state-error-primary);margin:0;padding:3px 10px;font-size:12px}";
		const tagId$1 = "@deepseek-ai/dsh-client-ui-sidebar-git-history/GitChangesBody.module.css";
		if (typeof document !== "undefined") {
			const sheet = css$1;
			const existing = document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId$1) + "]");
			if (existing === null) {
				const tag = document.createElement("style");
				tag.dataset.plugin = "@deepseek-ai/dsh-client-ui-sidebar-git-history";
				tag.dataset.pluginCss = tagId$1;
				tag.textContent = sheet;
				document.head.appendChild(tag);
			} else if (existing.textContent !== sheet) existing.textContent = sheet;
			}
		var GitChangesBody_module_css_default = {
			"actionButton": "jdsH1W_actionButton",
			"actionDialog": "jdsH1W_actionDialog",
			"actionError": "jdsH1W_actionError",
			"actionIcon": "jdsH1W_actionIcon",
			"badge": "jdsH1W_badge",
			"badgeAdded": "jdsH1W_badgeAdded",
			"badgeConflict": "jdsH1W_badgeConflict",
			"badgeDeleted": "jdsH1W_badgeDeleted",
			"badgeModified": "jdsH1W_badgeModified",
			"badgeRenamed": "jdsH1W_badgeRenamed",
			"closeFloating": "jdsH1W_closeFloating",
			"content": "jdsH1W_content",
			"count": "jdsH1W_count",
			"deleteButton": "jdsH1W_deleteButton",
			"error": "jdsH1W_error",
			"fileCheckbox": "jdsH1W_fileCheckbox",
			"fileDir": "jdsH1W_fileDir",
			"fileName": "jdsH1W_fileName",
			"fileRow": "jdsH1W_fileRow",
			"fillMessageButton": "jdsH1W_fillMessageButton",
			"git-operation-spin": "jdsH1W_git-operation-spin",
			"header": "jdsH1W_header",
			"headerActions": "jdsH1W_headerActions",
			"ignoreNote": "jdsH1W_ignoreNote",
			"item": "jdsH1W_item",
			"lastMessage": "jdsH1W_lastMessage",
			"lastMessageLabel": "jdsH1W_lastMessageLabel",
			"lastMessageText": "jdsH1W_lastMessageText",
			"level": "jdsH1W_level",
			"list": "jdsH1W_list",
			"name": "jdsH1W_name",
			"note": "jdsH1W_note",
			"operationSpinner": "jdsH1W_operationSpinner",
			"operationStatus": "jdsH1W_operationStatus",
			"pendingCommit": "jdsH1W_pendingCommit",
			"pendingCommitButton": "jdsH1W_pendingCommitButton",
			"pendingHash": "jdsH1W_pendingHash",
			"pendingMeta": "jdsH1W_pendingMeta",
			"pendingSubject": "jdsH1W_pendingSubject",
			"resizeHandle": "jdsH1W_resizeHandle",
			"restoreButton": "jdsH1W_restoreButton",
			"reviewTitle": "jdsH1W_reviewTitle",
			"reviewToolbar": "jdsH1W_reviewToolbar",
			"rollbackButton": "jdsH1W_rollbackButton",
			"rollbackWarning": "jdsH1W_rollbackWarning",
			"root": "jdsH1W_root",
			"rowAction": "jdsH1W_rowAction",
			"sectionChevron": "jdsH1W_sectionChevron",
			"sectionChevronExpanded": "jdsH1W_sectionChevronExpanded",
			"sectionToggle": "jdsH1W_sectionToggle",
			"stashActions": "jdsH1W_stashActions",
			"stashChevron": "jdsH1W_stashChevron",
			"stashChevronExpanded": "jdsH1W_stashChevronExpanded",
			"stashCollection": "jdsH1W_stashCollection",
			"stashDate": "jdsH1W_stashDate",
			"stashDetails": "jdsH1W_stashDetails",
			"stashFile": "jdsH1W_stashFile",
			"stashRow": "jdsH1W_stashRow",
			"stashSubject": "jdsH1W_stashSubject",
			"stashToggle": "jdsH1W_stashToggle",
			"subsectionHeader": "jdsH1W_subsectionHeader",
			"tool": "jdsH1W_tool"
		};
		//#endregion
		//#region src/client/GitChangesBody.tsx
		/**
		* The code-review region: pending commits, uncommitted files, and stash entries
		* drawn above the docked panes in the right Sidebar panel.
		*
		* The region reads only while the history header's session-local Changes
		* control reveals it. Each reveal and reload press starts a read, and everything
		* it shows lives in local component state — the region is not a tab, so it
		* declares no store. The workspace is named from the framework's Workspace
		* hooks exactly as the commit history names it (by session membership, else by
		* the session's working directory), never by a path the reader types. A file row opens the
		* file in the dock through the panel's own navigation. Each stash expands into
		* a lazy file read and can restore its index and working-tree state.
		*/
		const MIN_REGION_HEIGHT = 96;
		/**
		* The badge a file row shows: the side that carries the change. An untracked
		* file reads as `?`; otherwise the work-tree letter wins, then the index one.
		* @param file - one settled status row.
		* @returns the single-letter badge text.
		*/
		function statusBadgeOf(file) {
			if (file.untracked) return "?";
			return file.worktreeStatus !== "." ? file.worktreeStatus : file.indexStatus;
		}
		/** Whether a status path is a repository ignore-rules file hidden from code actions. */
		function isGitIgnorePath(path) {
			return /(^|\/)\.gitignore$/u.test(path);
		}
		/**
		* Split a workspace-relative path into its basename and parent directory for
		* display; the name carries the row, the directory only disambiguates it.
		* @param path - a `/`-separated workspace-relative path.
		* @returns the last segment and everything before it (empty for a root file).
		*/
		function pathSegments(path) {
			const slash = path.lastIndexOf("/");
			if (slash < 0) return {
				name: path,
				dir: ""
			};
			return {
				name: path.slice(slash + 1),
				dir: path.slice(0, slash)
			};
		}
		/** The badge tints, one per status letter; an unlisted letter stays neutral. */
		const BADGE_CLASS = {
			M: GitChangesBody_module_css_default.badgeModified,
			A: GitChangesBody_module_css_default.badgeAdded,
			D: GitChangesBody_module_css_default.badgeDeleted,
			R: GitChangesBody_module_css_default.badgeRenamed,
			C: GitChangesBody_module_css_default.badgeRenamed,
			U: GitChangesBody_module_css_default.badgeConflict,
			"?": GitChangesBody_module_css_default.badgeAdded
		};
		/** One file row: badge, name, and dimmed directory; pressing it opens the file. */
		function FileRow({ file, selected, disabled, onSelect, onOpen, onRollback, t }) {
			const badge = statusBadgeOf(file);
			const { name, dir } = pathSegments(file.path);
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("li", {
				className: GitChangesBody_module_css_default.item,
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
						type: "checkbox",
						className: GitChangesBody_module_css_default.fileCheckbox,
						checked: selected,
						"aria-label": t("changes.selectFile", { path: file.path }),
						"data-git-file-select": file.path,
						onChange: (event) => {
							onSelect(event.target.checked);
						}
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
						type: "button",
						className: GitChangesBody_module_css_default.fileRow,
						title: file.renamedFrom === void 0 ? file.path : `${file.renamedFrom} → ${file.path}`,
						"data-git-file": file.path,
						onClick: () => {
							onOpen(file);
						},
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: clsx(GitChangesBody_module_css_default.badge, BADGE_CLASS[badge]),
								"data-git-status": badge,
								children: badge
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: GitChangesBody_module_css_default.fileName,
								children: name
							}),
							dir !== "" && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: GitChangesBody_module_css_default.fileDir,
								children: dir
							})
						]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
						type: "button",
						className: GitChangesBody_module_css_default.rowAction,
						disabled,
						"aria-label": t("rollback.single", { path: file.path }),
						title: t("rollback.single", { path: file.path }),
						"data-git-rollback-file": file.path,
						onClick: () => {
							onRollback(file);
						},
						children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(RollbackIcon, {})
					})
				]
			});
		}
		/** One file stored inside an expanded stash collection. */
		function StashFileRow({ file }) {
			const { name, dir } = pathSegments(file.path);
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("li", {
				className: GitChangesBody_module_css_default.stashFile,
				"data-git-stash-file": file.path,
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						className: clsx(GitChangesBody_module_css_default.badge, BADGE_CLASS[file.status]),
						children: file.status
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						className: GitChangesBody_module_css_default.fileName,
						children: name
					}),
					dir !== "" && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						className: GitChangesBody_module_css_default.fileDir,
						children: dir
					})
				]
			});
		}
		function operationLabel(t, kind) {
			return t(`operations.${kind}`);
		}
		function RollbackIcon() {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("svg", {
				className: GitChangesBody_module_css_default.actionIcon,
				viewBox: "0 0 16 16",
				fill: "none",
				"aria-hidden": "true",
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M5.5 4H2.25v3.25M2.5 6.75A5.5 5.5 0 1 1 3.75 12" })
			});
		}
		function StashIcon() {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("svg", {
				className: GitChangesBody_module_css_default.actionIcon,
				viewBox: "0 0 16 16",
				fill: "none",
				"aria-hidden": "true",
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M8 2.25v6.5M5.25 6 8 8.75 10.75 6M2.75 9.5v3.25h10.5V9.5" })
			});
		}
		function RollbackDialog({ workspaceId, files, rollback, operation, setOperation, onClose, onDone, t }) {
			const operationRef = (0, react.useRef)(void 0);
			const [failure, setFailure] = (0, react.useState)(void 0);
			(0, react.useEffect)(() => () => {
				operationRef.current?.abort();
			}, []);
			const confirm = () => {
				if (files === void 0 || files.length === 0 || operation !== void 0) return;
				const controller = new AbortController();
				operationRef.current?.abort();
				operationRef.current = controller;
				setFailure(void 0);
				setOperation({ kind: "rollback" });
				rollback(workspaceId, controller.signal, files).then((result) => {
					if (controller.signal.aborted) return;
					operationRef.current = void 0;
					setOperation(void 0);
					if (result !== void 0) {
						setFailure(failureLine(t, result));
						return;
					}
					onClose();
					onDone();
				});
			};
			const includesUntracked = files?.some((file) => file.untracked) === true;
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(_deepseek_ai_dsh_client_ui_primitives.Modal, {
				open: files !== void 0,
				...GitChangesBody_module_css_default.actionDialog === void 0 ? {} : { className: GitChangesBody_module_css_default.actionDialog },
				onClose,
				title: t(files?.length === 1 ? "rollback.titleSingle" : "rollback.titleBatch"),
				closeLabel: t("actions.cancel"),
				footer: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
					variant: "outline",
					onClick: onClose,
					children: t("actions.cancel")
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
					disabled: operation !== void 0,
					onClick: confirm,
					children: t("rollback.confirm")
				})] }),
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
						className: GitChangesBody_module_css_default.rollbackWarning,
						children: t("rollback.warning", { count: files?.length ?? 0 })
					}),
					includesUntracked && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
						className: GitChangesBody_module_css_default.error,
						children: t("rollback.untrackedWarning")
					}),
					failure !== void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
						className: GitChangesBody_module_css_default.error,
						role: "alert",
						children: failure
					})
				]
			});
		}
		/** One expandable stash collection with lazy file loading and restore. */
		function StashRow({ entry, workspaceId, readFiles, restore, drop, operation, setOperation, onDone, t }) {
			const mutationRef = (0, react.useRef)(void 0);
			const [expanded, setExpanded] = (0, react.useState)(false);
			const [files, setFiles] = (0, react.useState)(void 0);
			const [failure, setFailure] = (0, react.useState)(void 0);
			const [deleteOpen, setDeleteOpen] = (0, react.useState)(false);
			(0, react.useEffect)(() => () => {
				mutationRef.current?.abort();
			}, []);
			(0, react.useEffect)(() => {
				if (!expanded || files !== void 0) return;
				const controller = new AbortController();
				readFiles(workspaceId, entry.selector, controller.signal).then((result) => {
					if (controller.signal.aborted) return;
					setFiles(result.files);
					setFailure(result.failure === void 0 ? void 0 : failureLine(t, result.failure));
				});
				return () => {
					controller.abort();
				};
			}, [
				entry.selector,
				expanded,
				files,
				readFiles,
				t,
				workspaceId
			]);
			const restoreEntry = () => {
				if (operation !== void 0) return;
				const controller = new AbortController();
				mutationRef.current?.abort();
				mutationRef.current = controller;
				setOperation({ kind: "stash-restore" });
				setFailure(void 0);
				restore(workspaceId, entry.selector, controller.signal).then((result) => {
					if (controller.signal.aborted) return;
					mutationRef.current = void 0;
					setOperation(void 0);
					if (result !== void 0) {
						setFailure(failureLine(t, result));
						return;
					}
					onDone();
				});
			};
			const dropEntry = () => {
				if (operation !== void 0) return;
				const controller = new AbortController();
				mutationRef.current?.abort();
				mutationRef.current = controller;
				setDeleteOpen(false);
				setOperation({ kind: "stash-delete" });
				setFailure(void 0);
				drop(workspaceId, entry.selector, controller.signal).then((result) => {
					if (controller.signal.aborted) return;
					mutationRef.current = void 0;
					setOperation(void 0);
					if (result !== void 0) {
						setFailure(failureLine(t, result));
						return;
					}
					onDone();
				});
			};
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("li", {
				className: GitChangesBody_module_css_default.stashCollection,
				"data-git-stash": entry.selector,
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: GitChangesBody_module_css_default.stashRow,
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
							type: "button",
							className: GitChangesBody_module_css_default.stashToggle,
							"aria-expanded": expanded,
							onClick: () => {
								setExpanded((value) => !value);
							},
							children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconChevronDownOutline14, { className: clsx(GitChangesBody_module_css_default.stashChevron, expanded && GitChangesBody_module_css_default.stashChevronExpanded) }),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: GitChangesBody_module_css_default.stashSubject,
									title: entry.subject,
									children: entry.subject
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: GitChangesBody_module_css_default.stashDate,
									children: formatCommitDate(entry.date)
								})
							]
						}), expanded && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
							className: GitChangesBody_module_css_default.stashActions,
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: GitChangesBody_module_css_default.restoreButton,
								disabled: operation !== void 0,
								onClick: restoreEntry,
								children: t("stash.restore")
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: clsx(GitChangesBody_module_css_default.restoreButton, GitChangesBody_module_css_default.deleteButton),
								disabled: operation !== void 0,
								onClick: () => {
									setDeleteOpen(true);
								},
								children: t("stash.delete")
							})]
						})]
					}),
					expanded && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: GitChangesBody_module_css_default.stashDetails,
						children: [
							files === void 0 && failure === void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
								className: GitChangesBody_module_css_default.note,
								children: t("stash.loadingFiles")
							}),
							files?.length === 0 && failure === void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
								className: GitChangesBody_module_css_default.note,
								children: t("stash.noFiles")
							}),
							files !== void 0 && files.length > 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("ul", {
								className: GitChangesBody_module_css_default.level,
								children: files.map((file) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)(StashFileRow, { file }, `${file.status}:${file.path}`))
							}),
							failure !== void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
								className: GitChangesBody_module_css_default.error,
								role: "alert",
								children: failure
							})
						]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Modal, {
						open: deleteOpen,
						onClose: () => {
							setDeleteOpen(false);
						},
						title: t("stash.delete"),
						closeLabel: t("actions.cancel"),
						footer: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
							variant: "outline",
							onClick: () => {
								setDeleteOpen(false);
							},
							children: t("actions.cancel")
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
							variant: "primary",
							onClick: dropEntry,
							children: t("stash.confirmDelete")
						})] }),
						children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: t("stash.deleteConfirm", { subject: entry.subject }) })
					})
				]
			});
		}
		/** One pending-push commit row. */
		function PendingCommitRow({ commit, onOpen }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("li", {
				className: GitChangesBody_module_css_default.pendingCommit,
				"data-git-pending-push": commit.hash,
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
					type: "button",
					className: GitChangesBody_module_css_default.pendingCommitButton,
					onClick: onOpen,
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: GitChangesBody_module_css_default.pendingHash,
							children: commit.shortHash
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: GitChangesBody_module_css_default.pendingSubject,
							title: commit.subject,
							children: commit.subject
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
							className: GitChangesBody_module_css_default.pendingMeta,
							children: [
								commit.authorName,
								" · ",
								formatCommitDate(commit.date)
							]
						})
					]
				})
			});
		}
		/** One independently collapsible review section header. */
		function SectionHeader({ section, title, count, expanded, onToggle, selection }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: GitChangesBody_module_css_default.header,
				"data-git-changes-header": section,
				children: [selection, /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
					type: "button",
					className: GitChangesBody_module_css_default.sectionToggle,
					"aria-expanded": expanded,
					onClick: onToggle,
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconChevronDownOutline14, { className: clsx(GitChangesBody_module_css_default.sectionChevron, expanded && GitChangesBody_module_css_default.sectionChevronExpanded) }),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: GitChangesBody_module_css_default.name,
							children: title
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: GitChangesBody_module_css_default.count,
							children: count
						})
					]
				})]
			});
		}
		/** Persistent operations above all collapsible review sections. */
		function ReviewToolbar({ operations, operation, onReload, onClose, t }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: GitChangesBody_module_css_default.reviewToolbar,
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
					className: GitChangesBody_module_css_default.reviewTitle,
					"data-git-review-title": true,
					children: t("changes.title")
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
					className: GitChangesBody_module_css_default.headerActions,
					children: [
						operation !== void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
							className: GitChangesBody_module_css_default.operationStatus,
							role: "status",
							"data-git-operation": operation.kind,
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: GitChangesBody_module_css_default.operationSpinner,
								"aria-hidden": "true"
							}), operationLabel(t, operation.kind)]
						}),
						operations,
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							className: GitChangesBody_module_css_default.tool,
							disabled: operation !== void 0,
							"aria-label": t("reload"),
							title: t("reload"),
							"data-git-changes-reload": true,
							onClick: onReload,
							children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconRefreshOutline16, {})
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							className: GitChangesBody_module_css_default.tool,
							"aria-label": t("changes.close"),
							title: t("changes.close"),
							"data-git-changes-close": true,
							onClick: onClose,
							children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconCloseOutline16, {})
						})
					]
				})]
			});
		}
		/** A matched 16px outline icon from the Git action menu's visual set. */
		function GitActionIcon({ action }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("svg", {
				className: GitChangesBody_module_css_default.actionIcon,
				viewBox: "0 0 16 16",
				fill: "none",
				"aria-hidden": "true",
				children: [
					action === "commit" && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M1.75 8h4M10.25 8h4" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("circle", {
						cx: "8",
						cy: "8",
						r: "2.25"
					})] }),
					action === "commit-push" && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M2 11.75h3.75M10.25 11.75H14M8 10V2.5M4.75 5.75 8 2.5l3.25 3.25" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("circle", {
						cx: "8",
						cy: "11.75",
						r: "2.25"
					})] }),
					action === "push" && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M8 13.5v-11M3.75 6.75 8 2.5l4.25 4.25" }),
					action === "pull" && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M8 2.5v11m-4.25-4.25L8 13.5l4.25-4.25" })
				]
			});
		}
		function actionFailureLine(t, failure) {
			return t("actions.failedWithReason", { message: failure.message });
		}
		/** Mutation controls shown in the working-changes header. */
		function GitActionControls({ workspaceId, paths, generateCommitMessage, commit, commitAndPush, push, pull, stash, onRollback, operation, setOperation, error, setError, onDone, t }) {
			const operationRef = (0, react.useRef)(void 0);
			const [menuOpen, setMenuOpen] = (0, react.useState)(false);
			const [mode, setMode] = (0, react.useState)(void 0);
			const [message, setMessage] = (0, react.useState)("");
			const [lastCommitMessage, setLastCommitMessage] = (0, react.useState)(() => readLastGitMessage(workspaceId, "commit"));
			const [lastStashMessage, setLastStashMessage] = (0, react.useState)(() => readLastGitMessage(workspaceId, "stash"));
			(0, react.useEffect)(() => () => {
				operationRef.current?.abort();
			}, []);
			(0, react.useEffect)(() => {
				setLastCommitMessage(readLastGitMessage(workspaceId, "commit"));
				setLastStashMessage(readLastGitMessage(workspaceId, "stash"));
			}, [workspaceId]);
			const startOperation = () => {
				operationRef.current?.abort();
				const controller = new AbortController();
				operationRef.current = controller;
				return controller;
			};
			const runCommit = () => {
				if (mode === void 0 || message.trim() === "" || operation !== void 0) return;
				const selectedMode = mode;
				const selectedMessage = message.trim();
				setMode(void 0);
				setOperation({ kind: selectedMode });
				setError(void 0);
				const controller = startOperation();
				(selectedMode === "commit" ? commit : selectedMode === "commit-push" ? commitAndPush : stash)(workspaceId, controller.signal, paths, selectedMessage).then((failure) => {
					if (controller.signal.aborted) return;
					operationRef.current = void 0;
					setOperation(void 0);
					if (failure !== void 0) {
						setError(actionFailureLine(t, failure));
						return;
					}
					const kind = selectedMode === "stash" ? "stash" : "commit";
					writeLastGitMessage(workspaceId, kind, selectedMessage);
					if (kind === "stash") setLastStashMessage(selectedMessage);
					else setLastCommitMessage(selectedMessage);
					setMessage("");
					onDone(selectedMode);
				});
			};
			const openMessageDialog = (nextMode) => {
				setError(void 0);
				setMessage("");
				setMode(nextMode);
			};
			const lastMessage = mode === "stash" ? lastStashMessage : lastCommitMessage;
			const runSync = (kind) => {
				if (operation !== void 0) return;
				setOperation({ kind });
				setError(void 0);
				const controller = startOperation();
				(kind === "push" ? push : pull)(workspaceId, controller.signal).then((failure) => {
					if (controller.signal.aborted) return;
					operationRef.current = void 0;
					setOperation(void 0);
					if (failure !== void 0) {
						setError(actionFailureLine(t, failure));
						if (kind === "pull") onDone(kind);
						return;
					}
					onDone(kind);
				});
			};
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Menu, {
					open: menuOpen,
					portal: true,
					align: "end",
					anchor: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
						type: "button",
						className: GitChangesBody_module_css_default.actionButton,
						disabled: operation !== void 0,
						"data-git-commit-menu": true,
						onClick: () => {
							setMenuOpen((open) => !open);
						},
						children: [
							t("actions.commit"),
							" ",
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconChevronDownOutline14, {})
						]
					}),
					items: [
						{
							id: "commit",
							label: t("actions.commit"),
							icon: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(GitActionIcon, { action: "commit" }),
							disabled: paths.length === 0
						},
						{
							id: "commit-push",
							label: t("actions.commitPush"),
							icon: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(GitActionIcon, { action: "commit-push" }),
							disabled: paths.length === 0
						},
						{
							id: "push",
							label: t("actions.push"),
							icon: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(GitActionIcon, { action: "push" })
						},
						{
							id: "pull",
							label: t("actions.pull"),
							icon: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(GitActionIcon, { action: "pull" })
						}
					],
					onSelect: (id) => {
						setMenuOpen(false);
						setError(void 0);
						if (id === "push" || id === "pull") runSync(id);
						else openMessageDialog(id);
					},
					onClose: () => {
						setMenuOpen(false);
					}
				}),
				/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
					type: "button",
					className: GitChangesBody_module_css_default.actionButton,
					disabled: operation !== void 0 || paths.length === 0,
					"data-git-stash-create": true,
					onClick: () => {
						openMessageDialog("stash");
					},
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(StashIcon, {}), t("actions.stash")]
				}),
				/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
					type: "button",
					className: clsx(GitChangesBody_module_css_default.actionButton, GitChangesBody_module_css_default.rollbackButton),
					disabled: operation !== void 0 || paths.length === 0,
					"data-git-rollback-selected": true,
					onClick: onRollback,
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(RollbackIcon, {}), t("rollback.batch")]
				}),
				/* @__PURE__ */ (0, react_jsx_runtime.jsxs)(CommitMessageDialog, {
					open: mode !== void 0,
          ai: mode !== void 0 && mode !== "stash" ? { workspaceId, paths, message, generate: generateCommitMessage, onMessage: setMessage, onError: setError } : void 0,
					className: clsx(GitChangesBody_module_css_default.actionDialog),
					onClose: () => {
						setMode(void 0);
					},
					title: mode === "stash" ? t("actions.stash") : mode === "commit-push" ? t("actions.commitPush") : t("actions.commit"),
					closeLabel: t("actions.cancel"),
					footer: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
						variant: "outline",
						onClick: () => {
							setMode(void 0);
						},
						children: t("actions.cancel")
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
						disabled: message.trim() === "",
						onClick: runCommit,
						children: mode === "stash" ? t("stash.confirm") : t("actions.confirm")
					})] }),
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Input, {
							autoFocus: true,
							value: message,
							placeholder: mode === "stash" ? t("stash.messagePlaceholder") : t("actions.messagePlaceholder"),
							onChange: (event) => {
								setMessage(event.target.value);
							}
						}),
						lastMessage !== void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: GitChangesBody_module_css_default.lastMessage,
							"data-git-last-message": true,
							children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: GitChangesBody_module_css_default.lastMessageLabel,
									children: t("actions.lastMessage")
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: GitChangesBody_module_css_default.lastMessageText,
									title: lastMessage,
									children: lastMessage
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
									type: "button",
									className: GitChangesBody_module_css_default.fillMessageButton,
									onClick: () => {
										setMessage(lastMessage);
									},
									children: t("actions.fillMessage")
								})
							]
						}),
						error !== void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
							className: GitChangesBody_module_css_default.error,
							role: "alert",
							children: error
						})
					]
				})
			] });
		}
		/** The code-review region and its independently collapsible Git sections. */
		function GitChangesBody({ sessionId, useSessions, useWorkspaces, readChanges, commitChanges, commitAndPushChanges, pushChanges, pullChanges, stashChanges, rollbackChanges, readStashFiles, restoreStash, dropStash, readWorkingDiff, readCommitFiles, readCommitDiff, useDiffZoomModifier, t , generateCommitMessage }) {
			const zoomModifier = useDiffZoomModifier((value) => value);
			const visible = useGitChangesVisible(sessionId);
			const rootRef = (0, react.useRef)(null);
			const stopResizeRef = (0, react.useRef)(void 0);
			const cwd = useSessions((sessions) => sessions.byId[sessionId]?.cwd);
			const workspaceId = useWorkspaces((workspaces) => {
				const owned = workspaces.items.find((workspace) => workspace.sessionIds.includes(sessionId));
				if (owned !== void 0) return owned.workspaceId;
				return workspaces.items.find((workspace) => workspace.path === cwd)?.workspaceId;
			});
			const [read, setRead] = (0, react.useState)(void 0);
			const [selected, setSelected] = (0, react.useState)(/* @__PURE__ */ new Set());
			const [revision, setRevision] = (0, react.useState)(0);
			const [pendingExpanded, setPendingExpanded] = (0, react.useState)(true);
			const [changesExpanded, setChangesExpanded] = (0, react.useState)(true);
			const [untrackedExpanded, setUntrackedExpanded] = (0, react.useState)(false);
			const [stashExpanded, setStashExpanded] = (0, react.useState)(true);
			const [selectedCommit, setSelectedCommit] = (0, react.useState)(void 0);
			const [selectedWorkingFile, setSelectedWorkingFile] = (0, react.useState)(void 0);
			const [operation, setOperation] = (0, react.useState)(void 0);
			const [actionError, setActionError] = (0, react.useState)(void 0);
			const [rollbackFiles, setRollbackFiles] = (0, react.useState)(void 0);
			(0, react.useEffect)(() => {
				if (!visible || workspaceId === void 0) return;
				const controller = new AbortController();
				let alive = true;
				readChanges(workspaceId, controller.signal).then((next) => {
					if (!alive || controller.signal.aborted) return;
					setRead(next);
					setSelected(new Set(next.files.filter((file) => !isGitIgnorePath(file.path)).map((file) => file.path)));
				});
				return () => {
					alive = false;
					controller.abort();
				};
			}, [
				visible,
				workspaceId,
				revision,
				readChanges
			]);
			(0, react.useEffect)(() => () => {
				stopResizeRef.current?.();
			}, []);
			if (!visible) return null;
			const beginResize = (event) => {
				const root = rootRef.current;
				if (root === null) return;
				let panel = root.parentElement;
				while (panel !== null && panel.getBoundingClientRect().height < MIN_REGION_HEIGHT * 2) panel = panel.parentElement;
				if (panel === null) return;
				event.preventDefault();
				stopResizeRef.current?.();
				let nextY = event.clientY;
				let frame;
				const previousUserSelect = document.body.style.userSelect;
				document.body.style.userSelect = "none";
				const applyHeight = () => {
					frame = void 0;
					const panelRect = panel.getBoundingClientRect();
					const next = Math.max(MIN_REGION_HEIGHT, Math.min(panelRect.height - MIN_REGION_HEIGHT, nextY - panelRect.top));
					root.style.height = `${next}px`;
				};
				const move = (moveEvent) => {
					nextY = moveEvent.clientY;
					if (frame === void 0) frame = requestAnimationFrame(applyHeight);
				};
				const stop = () => {
					if (frame !== void 0) cancelAnimationFrame(frame);
					applyHeight();
					window.removeEventListener("mousemove", move);
					window.removeEventListener("mouseup", stop);
					document.body.style.userSelect = previousUserSelect;
					stopResizeRef.current = void 0;
				};
				stopResizeRef.current = stop;
				window.addEventListener("mousemove", move);
				window.addEventListener("mouseup", stop);
			};
			const close = () => {
				setGitChangesVisible(sessionId, false);
			};
			if (workspaceId === void 0) return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				ref: rootRef,
				className: GitChangesBody_module_css_default.root,
				"data-git-changes": "no-workspace",
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: GitChangesBody_module_css_default.content,
						children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
							className: GitChangesBody_module_css_default.note,
							"data-git-changes-row": "no-workspace",
							children: t("noWorkspace")
						})
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
						type: "button",
						className: clsx(GitChangesBody_module_css_default.tool, GitChangesBody_module_css_default.closeFloating),
						"aria-label": t("changes.close"),
						title: t("changes.close"),
						"data-git-changes-close": true,
						onClick: close,
						children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconCloseOutline16, {})
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: GitChangesBody_module_css_default.resizeHandle,
						role: "separator",
						"aria-label": t("changes.resize"),
						"aria-orientation": "horizontal",
						"data-git-changes-resize": true,
						onMouseDown: beginResize
					})
				]
			});
			const repository = read?.repository ?? false;
			const reportedFiles = read?.files ?? [];
			const gitIgnoreHidden = reportedFiles.some((file) => isGitIgnorePath(file.path));
			const files = reportedFiles.filter((file) => !isGitIgnorePath(file.path));
			const tracked = files.filter((file) => !file.untracked);
			const untracked = files.filter((file) => file.untracked);
			const stashes = read?.stashes ?? [];
			const pendingPush = read?.pendingPush ?? [];
			const failed = read?.failure === void 0 ? void 0 : failureLine(t, read.failure);
			const pendingFailed = read?.pendingFailure === void 0 ? void 0 : failureLine(t, read.pendingFailure);
			const stashFailed = read?.stashFailure === void 0 ? void 0 : failureLine(t, read.stashFailure);
			const open = (file) => {
				setSelectedWorkingFile(file);
			};
			const allSelected = files.length > 0 && files.every((file) => selected.has(file.path));
			const operationPaths = files.flatMap((file) => selected.has(file.path) ? [file.path, ...file.renamedFrom === void 0 ? [] : [file.renamedFrom]] : []);
			const selectedFiles = files.filter((file) => selected.has(file.path));
			const setFileSelected = (path, checked) => {
				setSelected((current) => {
					const next = new Set(current);
					if (checked) next.add(path);
					else next.delete(path);
					return next;
				});
			};
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				ref: rootRef,
				className: GitChangesBody_module_css_default.root,
				"data-git-changes": workspaceId,
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: GitChangesBody_module_css_default.content,
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)(ReviewToolbar, {
								operation,
								operations: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(GitActionControls, {
									workspaceId,
									paths: operationPaths,
									generateCommitMessage,
								commit: commitChanges,
									commitAndPush: commitAndPushChanges,
									push: pushChanges,
									pull: pullChanges,
									stash: stashChanges,
									onRollback: () => {
										setRollbackFiles(selectedFiles);
									},
									operation,
									setOperation,
									error: actionError,
									setError: setActionError,
									onDone: (completed) => {
										if (completed === "push") {
											setRead((current) => current === void 0 ? current : {
												...current,
												pendingPush: [],
												pendingMore: false,
												pendingFailure: void 0
											});
											return;
										}
										if (completed === "pull") notifyGitHistoryRefresh(sessionId);
										setRevision((current) => current + 1);
									},
									t
								}),
								onReload: () => {
									if (operation === void 0) setRevision((current) => current + 1);
								},
								onClose: close,
								t
							}),
							actionError !== void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
								className: GitChangesBody_module_css_default.actionError,
								role: "alert",
								"data-git-action-error": true,
								children: actionError
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)(SectionHeader, {
								section: "pending",
								title: t("pending.title"),
								count: pendingPush.length,
								expanded: pendingExpanded,
								onToggle: () => {
									setPendingExpanded((value) => !value);
								}
							}),
							pendingExpanded && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: GitChangesBody_module_css_default.list,
								"data-git-review-section-body": "pending",
								children: [
									read !== void 0 && pendingFailed !== void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
										className: GitChangesBody_module_css_default.error,
										"data-git-changes-row": "pending-failed",
										children: pendingFailed
									}),
									read !== void 0 && repository && pendingFailed === void 0 && !read.hasUpstream && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
										className: GitChangesBody_module_css_default.note,
										"data-git-changes-row": "pending-no-upstream",
										children: t("pending.noUpstream")
									}),
									read !== void 0 && repository && pendingFailed === void 0 && read.hasUpstream && pendingPush.length === 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
										className: GitChangesBody_module_css_default.note,
										"data-git-changes-row": "pending-empty",
										children: t("pending.empty")
									}),
									pendingPush.length > 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("ul", {
										className: GitChangesBody_module_css_default.level,
										children: pendingPush.map((commit) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)(PendingCommitRow, {
											commit,
											onOpen: () => {
												setSelectedCommit(commit);
											}
										}, commit.hash))
									}),
									read?.pendingMore === true && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
										className: GitChangesBody_module_css_default.note,
										"data-git-changes-row": "pending-more",
										children: t("pending.more")
									})
								]
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)(SectionHeader, {
								section: "changes",
								title: t("changes.sectionTitle"),
								count: read === void 0 ? 0 : tracked.length + untracked.length,
								expanded: changesExpanded,
								onToggle: () => {
									setChangesExpanded((value) => !value);
								},
								selection: files.length > 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
									type: "checkbox",
									className: GitChangesBody_module_css_default.fileCheckbox,
									checked: allSelected,
									"aria-label": t("changes.selectAll"),
									"data-git-select-all": true,
									onChange: (event) => {
										setSelected(event.target.checked ? new Set(files.map((file) => file.path)) : /* @__PURE__ */ new Set());
									}
								}) : void 0
							}),
							changesExpanded && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: GitChangesBody_module_css_default.list,
								"data-git-review-section-body": "changes",
								children: [
									read === void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
										className: GitChangesBody_module_css_default.note,
										"data-git-changes-row": "loading",
										children: t("loading")
									}),
									read !== void 0 && !repository && failed === void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
										className: GitChangesBody_module_css_default.note,
										"data-git-changes-row": "not-repository",
										children: t("notRepository")
									}),
									read !== void 0 && failed !== void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
										className: GitChangesBody_module_css_default.error,
										"data-git-changes-row": "failed",
										children: failed
									}),
									read !== void 0 && repository && gitIgnoreHidden && failed === void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
										className: GitChangesBody_module_css_default.ignoreNote,
										"data-git-changes-row": "gitignore-filtered",
										children: t("changes.gitignoreFiltered")
									}),
									read !== void 0 && repository && tracked.length === 0 && untracked.length === 0 && failed === void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
										className: GitChangesBody_module_css_default.note,
										"data-git-changes-row": "empty",
										children: t("changes.empty")
									}),
									tracked.length > 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("ul", {
										className: GitChangesBody_module_css_default.level,
										children: tracked.map((file) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)(FileRow, {
											file,
											selected: selected.has(file.path),
											disabled: operation !== void 0,
											onSelect: (checked) => {
												setFileSelected(file.path, checked);
											},
											onOpen: open,
											onRollback: (target) => {
												setRollbackFiles([target]);
											},
											t
										}, file.path))
									}),
									repository && untracked.length > 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ react.createElement("button", { type: "button", className: GitChangesBody_module_css_default.subsectionHeader, "data-git-changes-header": "untracked", "aria-expanded": untrackedExpanded, onClick: () => {
  setUntrackedExpanded((value) => !value);
} }, /* @__PURE__ */ react.createElement(_deepseek_ai_dsh_client_ui_primitives.IconChevronDownOutline14, { className: clsx(GitChangesBody_module_css_default.sectionChevron, untrackedExpanded && GitChangesBody_module_css_default.sectionChevronExpanded) }), /* @__PURE__ */ react.createElement("span", null, t("changes.untrackedTitle")), /* @__PURE__ */ react.createElement("span", { className: GitChangesBody_module_css_default.count }, untracked.length)), untrackedExpanded && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("ul", {
										className: GitChangesBody_module_css_default.level,
										children: untracked.map((file) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)(FileRow, {
											file,
											selected: selected.has(file.path),
											disabled: operation !== void 0,
											onSelect: (checked) => {
												setFileSelected(file.path, checked);
											},
											onOpen: open,
											onRollback: (target) => {
												setRollbackFiles([target]);
											},
											t
										}, file.path))
									})] })
								]
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)(SectionHeader, {
								section: "stash",
								title: t("stash.title"),
								count: stashes.length,
								expanded: stashExpanded,
								onToggle: () => {
									setStashExpanded((value) => !value);
								}
							}),
							stashExpanded && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: GitChangesBody_module_css_default.list,
								"data-git-review-section-body": "stash",
								children: [
									read !== void 0 && stashFailed !== void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
										className: GitChangesBody_module_css_default.error,
										"data-git-changes-row": "stash-failed",
										children: stashFailed
									}),
									read !== void 0 && repository && stashFailed === void 0 && stashes.length === 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
										className: GitChangesBody_module_css_default.note,
										"data-git-changes-row": "stash-empty",
										children: t("stash.empty")
									}),
									stashes.length > 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("ul", {
										className: GitChangesBody_module_css_default.level,
										children: stashes.map((entry) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)(StashRow, {
											entry,
											workspaceId,
											readFiles: readStashFiles,
											restore: restoreStash,
											drop: dropStash,
											operation,
											setOperation,
											onDone: () => {
												setRevision((current) => current + 1);
											},
											t
										}, entry.selector))
									})
								]
							})
						]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)(CommitDetailModal, {
						commit: selectedCommit,
						workspaceId,
						readCommitFiles,
						readCommitDiff,
						zoomModifier,
						onClose: () => {
							setSelectedCommit(void 0);
						},
						t
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)(WorkingTreeDiffModal, {
						file: selectedWorkingFile,
						workspaceId,
						readWorkingDiff,
						zoomModifier,
						onClose: () => {
							setSelectedWorkingFile(void 0);
						},
						t
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)(RollbackDialog, {
						workspaceId,
						files: rollbackFiles,
						rollback: rollbackChanges,
						operation,
						setOperation,
						onClose: () => {
							if (operation === void 0) setRollbackFiles(void 0);
						},
						onDone: () => {
							setRevision((current) => current + 1);
						},
						t
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: GitChangesBody_module_css_default.resizeHandle,
						role: "separator",
						"aria-label": t("changes.resize"),
						"aria-orientation": "horizontal",
						"data-git-changes-resize": true,
						onMouseDown: beginResize
					})
				]
			});
		}
		//#endregion
		//#region dsh-css:source/git-review/client/GitReviewPage.module.css.mjs
		const css = ".VpfCBq_page{height:100%;min-height:0;color:var(--dsw-alias-label-primary);flex-direction:column;flex:auto;display:flex;overflow:hidden}";
		const tagId = "@deepseek-ai/dsh-client-ui-sidebar-git-history/GitReviewPage.module.css";
		if (typeof document !== "undefined") {
			const sheet = css;
			const existing = document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId) + "]");
			if (existing === null) {
				const tag = document.createElement("style");
				tag.dataset.plugin = "@deepseek-ai/dsh-client-ui-sidebar-git-history";
				tag.dataset.pluginCss = tagId;
				tag.textContent = sheet;
				document.head.appendChild(tag);
			} else if (existing.textContent !== sheet) existing.textContent = sheet;
			}
		var GitReviewPage_module_css_default = { "page": "VpfCBq_page" };
		//#endregion
		//#region src/client/GitReviewPage.tsx
		/**
		* Render the commit history with the working-changes region docked beneath it.
		* @param props - the tab's runtime props plus both bodies' faces.
		* @returns the composed page.
		*/
		function GitReviewPage(props) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: GitReviewPage_module_css_default.page,
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(GitHistoryBody, { ...props }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(GitChangesBody, { ...props })]
			});
		}
		//#endregion
		//#region src/client/locales.ts
		/** Simplified Chinese dictionary and key-set source of truth. */
		const zh = {
			"type.label": "审查",
			"guide.title": "审查",
			"guide.description": "审查待推送提交和工作区更改，并选择提交、推送或搁置。",
			"header.branch": "分支：{branch}",
			"header.detached": "游离提交",
			loading: "正在读取…",
			loadingMore: "正在加载更多…",
			empty: "这个仓库还没有提交。",
			emptySearch: "没有匹配的提交。",
			reload: "重新读取",
			more: "加载更多",
			"search.placeholder": "搜索提交说明…",
			"search.submit": "搜索",
			"search.author.all": "全部作者",
			"search.author.label": "按提交作者筛选",
			"search.date.toggle": "日期",
			"search.date.since": "起始日期（含当天）",
			"search.date.until": "结束日期（含当天）",
			"search.date.clear": "清除日期",
			"search.date.range": "提交日期：{since} 至 {until}",
			"search.date.sinceRange": "提交日期：{since} 之后",
			"search.date.untilRange": "提交日期：{until} 之前",
			"detail.title": "提交详情",
			"detail.close": "关闭提交详情",
			"detail.files": "提交文件",
			"detail.diff": "代码差异",
			"detail.source": "源文件",
			"detail.modified": "修改文件",
			"detail.workingTree": "工作区修改",
			"detail.loadingFiles": "正在读取提交文件…",
			"detail.selectFile": "选择一个文件查看代码差异。",
			"detail.loadingDiff": "正在读取代码差异…",
			"detail.noTextChanges": "这个更改没有可显示的文本差异。",
			"detail.resize": "调整文件目录宽度",
			"detail.binary": "这是二进制或不支持的文件，无法以代码形式对比。",
			"detail.sync": "同步滚动",
			"detail.sync.enable": "开启左右同步滚动",
			"detail.sync.disable": "关闭左右同步滚动",
			"detail.fullscreen.enter": "全屏显示提交详情",
			"detail.fullscreen.exit": "退出提交详情全屏",
			"detail.search.placeholder": "搜索代码…",
			"detail.search.source": "搜索源文件",
			"detail.search.modified": "搜索修改文件",
			"detail.search.next": "查找下一处",
			"detail.search.clear": "清空搜索",
			"settings.diffZoom.title": "代码对比缩放",
			"settings.diffZoom.description": "按住选择的按键并在代码对比区滚动；默认为 Alt，避免与浏览器 Ctrl + 滚轮缩放冲突。",
			"settings.diffZoom.alt": "Alt + 滚轮",
			"settings.diffZoom.control": "Ctrl + 滚轮",
			"settings.diffZoom.shift": "Shift + 滚轮",
			"error.gitUnavailable": "这台机器上没有找到 Git，无法读取仓库信息。",
			"error.workspaceNotFound": "这个工作区已经不在了。",
			"error.operationFailed": "读取失败：{message}",
			"error.unavailable": "读取失败：{message}",
			noWorkspace: "这个会话还没有关联的工作区。",
			notRepository: "这个工作区不是一个 Git 仓库。",
			"changes.title": "代码提交",
			"changes.sectionTitle": "更改",
			"changes.trigger": "代码提交",
			"changes.show": "显示代码提交",
			"changes.hide": "隐藏代码提交",
			"changes.resize": "调整 Git 更改区域高度",
			"changes.close": "关闭代码提交",
			"pending.title": "待推送",
			"pending.empty": "没有待推送的提交。",
			"pending.noUpstream": "当前分支尚未配置上游。",
			"pending.more": "还有更多待推送提交未显示。",
			"actions.commit": "提交",
			"actions.commitPush": "提交并推送",
			"actions.push": "推送",
			"actions.pull": "拉取",
			"actions.stash": "搁置",
			"actions.messagePlaceholder": "输入提交说明…",
			"actions.cancel": "取消",
			"actions.confirm": "确认提交",
			"actions.failed": "操作失败",
			"actions.failedWithReason": "操作失败：{message}",
			"actions.lastMessage": "上次备注",
			"actions.fillMessage": "填入",
			"operations.commit": "正在提交…",
			"operations.commit-push": "正在提交并推送…",
			"operations.push": "正在推送…",
			"operations.pull": "正在拉取…",
			"operations.stash": "正在搁置…",
			"operations.stash-restore": "正在恢复搁置…",
			"operations.stash-delete": "正在删除搁置…",
			"operations.rollback": "正在回滚…",
			"changes.untrackedTitle": "未进行版本管理的文件",
			"changes.empty": "没有未提交的更改。",
			"changes.selectAll": "选择全部更改",
			"changes.selectFile": "选择 {path}",
			"changes.gitignoreFiltered": "已按 .gitignore 过滤忽略项；.gitignore 文件本身也已从更改列表隐藏。",
			"rollback.batch": "回滚",
			"rollback.single": "回滚 {path}",
			"rollback.titleSingle": "回滚文件",
			"rollback.titleBatch": "批量回滚",
			"rollback.warning": "将放弃所选的 {count} 项工作区更改，恢复后无法撤销。",
			"rollback.untrackedWarning": "所选内容包含未跟踪文件；这些文件将被永久删除。",
			"rollback.confirm": "确认回滚",
			"stash.title": "搁置",
			"stash.empty": "没有已搁置的更改。",
			"stash.messagePlaceholder": "输入搁置备注…",
			"stash.confirm": "确认搁置",
			"stash.restore": "恢复",
			"stash.delete": "删除",
			"stash.confirmDelete": "确认删除",
			"stash.deleteConfirm": "确定永久删除搁置“{subject}”吗？此操作无法撤销。",
			"stash.loadingFiles": "正在读取搁置内容…",
			"stash.noFiles": "这个搁置没有文件更改。"
		};
		/** English dictionary, checked against the Chinese key set. */
		const en = {
			"type.label": "Review",
			"guide.title": "Review",
			"guide.description": "Review pending commits and workspace changes, then commit, push, or stash selected files.",
			"header.branch": "Branch: {branch}",
			"header.detached": "Detached HEAD",
			loading: "Reading…",
			loadingMore: "Loading more…",
			empty: "This repository has no commits yet.",
			emptySearch: "No commits match the search.",
			reload: "Reload",
			more: "Load more",
			"search.placeholder": "Search commit messages…",
			"search.submit": "Search",
			"search.author.all": "All authors",
			"search.author.label": "Filter by commit author",
			"search.date.toggle": "Date",
			"search.date.since": "Start date (inclusive)",
			"search.date.until": "End date (inclusive)",
			"search.date.clear": "Clear dates",
			"search.date.range": "Commit date: {since} to {until}",
			"search.date.sinceRange": "Commit date: from {since}",
			"search.date.untilRange": "Commit date: up to {until}",
			"detail.title": "Commit details",
			"detail.close": "Close commit details",
			"detail.files": "Commit files",
			"detail.diff": "Code diff",
			"detail.source": "Source file",
			"detail.modified": "Modified file",
			"detail.workingTree": "Workspace change",
			"detail.loadingFiles": "Reading commit files…",
			"detail.selectFile": "Select a file to view its code diff.",
			"detail.loadingDiff": "Reading code diff…",
			"detail.noTextChanges": "This change has no displayable text differences.",
			"detail.resize": "Resize the file tree",
			"detail.binary": "This binary or unsupported file cannot be compared as code.",
			"detail.sync": "Sync scrolling",
			"detail.sync.enable": "Enable synchronized scrolling",
			"detail.sync.disable": "Disable synchronized scrolling",
			"detail.fullscreen.enter": "Show commit details fullscreen",
			"detail.fullscreen.exit": "Exit commit details fullscreen",
			"detail.search.placeholder": "Search code…",
			"detail.search.source": "Search source file",
			"detail.search.modified": "Search modified file",
			"detail.search.next": "Find next match",
			"detail.search.clear": "Clear search",
			"settings.diffZoom.title": "Code comparison zoom",
			"settings.diffZoom.description": "Hold the selected key while scrolling over a comparison. Alt is the default to avoid the browser Ctrl+wheel gesture.",
			"settings.diffZoom.alt": "Alt + wheel",
			"settings.diffZoom.control": "Ctrl + wheel",
			"settings.diffZoom.shift": "Shift + wheel",
			"error.gitUnavailable": "Git was not found on this machine, so repository state cannot be read.",
			"error.workspaceNotFound": "That workspace is gone.",
			"error.operationFailed": "Read failed: {message}",
			"error.unavailable": "Read failed: {message}",
			noWorkspace: "This session has no workspace yet.",
			notRepository: "This workspace is not a Git repository.",
			"changes.title": "Code commit",
			"changes.sectionTitle": "Changes",
			"changes.trigger": "Code commit",
			"changes.show": "Show code commit",
			"changes.hide": "Hide code commit",
			"changes.resize": "Resize Git changes region",
			"changes.close": "Close code commit",
			"pending.title": "Pending push",
			"pending.empty": "No commits are waiting to be pushed.",
			"pending.noUpstream": "The current branch has no configured upstream.",
			"pending.more": "More pending commits are not shown.",
			"actions.commit": "Commit",
			"actions.commitPush": "Commit and push",
			"actions.push": "Push",
			"actions.pull": "Pull",
			"actions.stash": "Stash",
			"actions.messagePlaceholder": "Enter a commit message…",
			"actions.cancel": "Cancel",
			"actions.confirm": "Commit",
			"actions.failed": "Operation failed",
			"actions.failedWithReason": "Operation failed: {message}",
			"actions.lastMessage": "Previous note",
			"actions.fillMessage": "Fill",
			"operations.commit": "Committing…",
			"operations.commit-push": "Committing and pushing…",
			"operations.push": "Pushing…",
			"operations.pull": "Pulling…",
			"operations.stash": "Stashing…",
			"operations.stash-restore": "Restoring stash…",
			"operations.stash-delete": "Deleting stash…",
			"operations.rollback": "Rolling back…",
			"changes.untrackedTitle": "Untracked Files",
			"changes.empty": "No uncommitted changes.",
			"changes.selectAll": "Select all changes",
			"changes.selectFile": "Select {path}",
			"changes.gitignoreFiltered": "Ignored paths follow .gitignore; .gitignore files are also hidden from this changes list.",
			"rollback.batch": "Rollback",
			"rollback.single": "Rollback {path}",
			"rollback.titleSingle": "Rollback file",
			"rollback.titleBatch": "Rollback selected files",
			"rollback.warning": "Discard {count} selected workspace change(s). This cannot be undone.",
			"rollback.untrackedWarning": "The selection contains untracked files. Those files will be permanently deleted.",
			"rollback.confirm": "Rollback",
			"stash.title": "Shelves",
			"stash.empty": "No shelved changes.",
			"stash.messagePlaceholder": "Enter a stash note…",
			"stash.confirm": "Stash",
			"stash.restore": "Restore",
			"stash.delete": "Delete",
			"stash.confirmDelete": "Delete stash",
			"stash.deleteConfirm": "Permanently delete the stash “{subject}”? This action cannot be undone.",
			"stash.loadingFiles": "Reading stashed files…",
			"stash.noFiles": "This stash has no file changes."
		};
		//#endregion
		//#region src/client/store.ts
		/**
		* The commit history's view state: the loaded page, the search that produced it,
		* and how far the paging has walked.
		*
		* One tab shows one workspace's history, so a tab's bucket is one page window,
		* not a per-path map like the file tree. The bucket is keyed by tab id because
		* two tabs of this kind in one session search and page independently.
		*
		* Writers run between `start` and `forget`: the owner's `signal` ends a bucket's
		* life, and the face stops dispatching once it aborts.
		*/
		/**
		* One tab's bucket, which every writer after `start` relies on.
		* @param state - the draft.
		* @param tabId - the tab being written.
		* @returns the tab's history window.
		*/
		function bucket(state, tabId) {
			const history = state.byTab[tabId];
			if (history === void 0) throw new Error(`ui-sidebar-git-history: no history for tab "${tabId}"`);
			return history;
		}
		/** Apply one settled page to a bucket; `append` keeps what is already loaded. */
		function applyPage(draft, page, append) {
			draft.repository = page.repository;
			draft.branch = page.branch;
			draft.failure = void 0;
			draft.loadingMore = false;
			draft.status = "ready";
			if (page.repository) {
				draft.commits = append ? [...draft.commits, ...page.commits] : [...page.commits];
				draft.skip = append ? draft.skip + page.commits.length : page.commits.length;
				draft.more = page.more;
				// Only a first page carries the author list; a later page keeps what the
				// window already offers so the dropdown does not empty while paging.
				if (page.authors !== void 0) draft.authors = [...page.authors];
			} else {
				draft.commits = [];
				draft.skip = 0;
				draft.more = false;
				draft.authors = [];
			}
		}
		/**
		* Declare the commit history's store.
		* @returns the store handle to declare on the registration.
		*/
		function createGitHistoryStore() {
			return (0, _deepseek_ai_dsh_client_store.defineStore)({
				init: () => ({ byTab: {} }),
				actions: {
					/**
					* Seed one tab's history window as loading its first page.
					* @param d - draft state.
					* @param tabId - the tab being drawn.
					* @param workspaceId - the workspace whose history is shown.
					*/
					start: (d, tabId, workspaceId) => {
						d.byTab[tabId] = {
							workspaceId,
							branch: void 0,
							repository: true,
							commits: [],
							search: "",
							author: "",
							since: "",
							until: "",
							authors: [],
							skip: 0,
							more: false,
							status: "loading",
							loadingMore: false,
							failure: void 0
						};
					},
					/**
					* Mark a first-page read (open, reload, or a new filter) as in flight.
					* @param d - draft state.
					* @param tabId - the tab being drawn.
					* @param filter - the subject, author, and date filters the read carries.
					*/
					loading: (d, tabId, filter) => {
						const state = bucket(d, tabId);
						state.search = filter.search;
						state.author = filter.author;
						state.since = filter.since;
						state.until = filter.until;
						state.status = "loading";
						state.failure = void 0;
					},
					/**
					* Record a settled first page, replacing the window.
					* @param d - draft state.
					* @param tabId - the tab being drawn.
					* @param page - the settled page.
					*/
					loaded: (d, tabId, page) => {
						applyPage(bucket(d, tabId), page, false);
					},
					/**
					* Mark a later page as in flight, keeping the loaded window on screen.
					* @param d - draft state.
					* @param tabId - the tab being drawn.
					*/
					moreLoading: (d, tabId) => {
						bucket(d, tabId).loadingMore = true;
					},
					/**
					* Append a settled later page to the window.
					* @param d - draft state.
					* @param tabId - the tab being drawn.
					* @param page - the settled page.
					*/
					appended: (d, tabId, page) => {
						applyPage(bucket(d, tabId), page, true);
					},
					/**
					* Record why a read failed, for either page kind.
					* @param d - draft state.
					* @param tabId - the tab being drawn.
					* @param failure - the settled Remote failure.
					*/
					failed: (d, tabId, failure) => {
						const state = bucket(d, tabId);
						state.status = "failed";
						state.loadingMore = false;
						state.failure = failure;
					},
					/**
					* Forget one tab's history, for a tab record that is gone.
					* @param d - draft state.
					* @param tabId - the tab that went away.
					*/
					forget: (d, tabId) => {
						d.byTab = Object.fromEntries(Object.entries(d.byTab).filter(([id]) => id !== tabId));
					}
				}
			});
		}
		//#endregion
		//#region src/client/index.ts
		/** This package's copy namespace. */
		const NS = "sidebarGitHistory";
		/**
		* Required browser services: the tab registry, the keyed seat, the Remote
		* carrier and its namespace, the settings scope, and copy.
		*/
		const inject = [
			"slots",
			"locale",
			"sidebarRightTabs",
			"sidebarRight",
			"remote",
			"remote.gitWorkspace",
			"settingsScope"
		];
		/**
		* Client plugin body: register the type, its dictionaries, then its page.
		* @param ctx - client root context carrying the registry, the slots, and the Remote face.
		*/
		function apply(ctx) {
			const t = ctx.locale.bind(NS);
			ctx.effect(() => ctx.sidebarRightTabs.register(gitHistoryDefinition(t)), "ui-sidebar-git-history: gitHistory type");
			ctx.effect(() => ctx.locale.register(NS, {
				zh,
				en
			}), "ui-sidebar-git-history: dictionaries");
			const store = createGitHistoryStore();
			const historyFace = gitHistoryFace(createLog(ctx.remote), createCommitReaders(ctx.remote));
			const zoomPreference = new DiffZoomPreferenceController(ctx.settingsScope.bind({ namespace: GIT_HISTORY_SETTINGS_NAMESPACE }));
			const zoomHooks = { diffZoomModifier: zoomPreference.diffZoomModifier };
			const changesFace = {
generateCommitMessage: async (workspaceId, signal, paths) => {
      const result = await ctx.remote.gitWorkspace.generateCommitMessage({ workspaceId, paths }, signal)
      if (!result.ok) throw new Error(result.error.message)
      return result.value.message
    },
				readChanges: createReadChanges(ctx.remote),
				commitChanges: async (workspaceId, signal, paths, message) => {
					const result = await ctx.remote.gitWorkspace.commit({
						workspaceId,
						message: message ?? "",
						paths
					}, signal);
					return result.ok ? void 0 : result.error;
				},
				commitAndPushChanges: async (workspaceId, signal, paths, message) => {
					const result = await ctx.remote.gitWorkspace.commit({
						workspaceId,
						message: message ?? "",
						paths,
						push: true
					}, signal);
					return result.ok ? void 0 : result.error;
				},
				pushChanges: async (workspaceId, signal) => {
					const result = await ctx.remote.gitWorkspace.push({ workspaceId }, signal);
					return result.ok ? void 0 : result.error;
				},
				pullChanges: async (workspaceId, signal) => {
					const result = await ctx.remote.gitWorkspace.pull({ workspaceId }, signal);
					return result.ok ? void 0 : result.error;
				},
				stashChanges: async (workspaceId, signal, paths, message) => {
					const result = await ctx.remote.gitWorkspace.stashCreate({
						workspaceId,
						message: message ?? "",
						paths
					}, signal);
					return result.ok ? void 0 : result.error;
				},
				rollbackChanges: async (workspaceId, signal, files) => {
					const trackedPaths = files.filter((file) => !file.untracked).flatMap((file) => [file.path, ...file.renamedFrom === void 0 ? [] : [file.renamedFrom]]);
					const untrackedPaths = files.filter((file) => file.untracked).map((file) => file.path);
					const result = await ctx.remote.gitWorkspace.rollback({
						workspaceId,
						trackedPaths,
						untrackedPaths
					}, signal);
					return result.ok ? void 0 : result.error;
				},
				readStashFiles: async (workspaceId, selector, signal) => {
					const result = await ctx.remote.gitWorkspace.stashFiles({
						workspaceId,
						selector
					}, signal);
					return result.ok ? { files: result.value.files } : {
						files: [],
						failure: result.error
					};
				},
				restoreStash: async (workspaceId, selector, signal) => {
					const result = await ctx.remote.gitWorkspace.stashPop({
						workspaceId,
						selector
					}, signal);
					return result.ok ? void 0 : result.error;
				},
				dropStash: async (workspaceId, selector, signal) => {
					const result = await ctx.remote.gitWorkspace.stashDrop({
						workspaceId,
						selector
					}, signal);
					return result.ok ? void 0 : result.error;
				},
				readWorkingDiff: (workspaceId, file, signal) => ctx.remote.gitWorkspace.workingDiff({
					workspaceId,
					path: file.path,
					...file.renamedFrom === void 0 ? {} : { previousPath: file.renamedFrom },
					untracked: file.untracked
				}, signal),
				...createCommitReaders(ctx.remote)
			};
			ctx.effect(() => ctx.slots.inject("sidebar.right.pane.tab", () => ctx.slots.register({
				name: "sidebar.right.pane.tab",
				key: GIT_HISTORY_ID,
				locale: NS,
				store,
				inject: (sessionId, actions) => ({
					...historyFace(sessionId, actions),
					...changesFace,
					hooks: zoomHooks
				})
			}, GitReviewPage)), "ui-sidebar-git-history: review page body");
			ctx.slots.inject("settings.general.item", () => ctx.slots.register({
				name: "settings.general.item",
				id: "git-diff-zoom-shortcut",
				order: 25,
				locale: NS,
				inject: () => ({
					hooks: zoomHooks,
					setDiffZoomModifier: (modifier) => {
						zoomPreference.setDiffZoomModifier(modifier);
					}
				})
			}, DiffZoomShortcutRow));
		}
		//#endregion
		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});

//# sourceMappingURL=client.js.map
