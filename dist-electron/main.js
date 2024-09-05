var Lu = Object.defineProperty;
var ni = (e) => {
  throw TypeError(e);
};
var Fu = (e, t, r) => t in e ? Lu(e, t, { enumerable: !0, configurable: !0, writable: !0, value: r }) : e[t] = r;
var jr = (e, t, r) => Fu(e, typeof t != "symbol" ? t + "" : t, r), si = (e, t, r) => t.has(e) || ni("Cannot " + r);
var ue = (e, t, r) => (si(e, t, "read from private field"), r ? r.call(e) : t.get(e)), kr = (e, t, r) => t.has(e) ? ni("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, r), Ar = (e, t, r, n) => (si(e, t, "write to private field"), n ? n.call(e, r) : t.set(e, r), r);
import zu, { ipcMain as en, app as Nt, shell as Uu, BrowserWindow as Dc } from "electron";
import { fileURLToPath as qu } from "node:url";
import ne from "node:path";
import _e from "node:process";
import { promisify as be, isDeepStrictEqual as Gu } from "node:util";
import Z from "node:fs";
import Cr from "node:crypto";
import Ku from "node:assert";
import Xn from "node:os";
const Zt = (e) => {
  const t = typeof e;
  return e !== null && (t === "object" || t === "function");
}, ms = /* @__PURE__ */ new Set([
  "__proto__",
  "prototype",
  "constructor"
]), Hu = new Set("0123456789");
function Bn(e) {
  const t = [];
  let r = "", n = "start", s = !1;
  for (const a of e)
    switch (a) {
      case "\\": {
        if (n === "index")
          throw new Error("Invalid character in an index");
        if (n === "indexEnd")
          throw new Error("Invalid character after an index");
        s && (r += a), n = "property", s = !s;
        break;
      }
      case ".": {
        if (n === "index")
          throw new Error("Invalid character in an index");
        if (n === "indexEnd") {
          n = "property";
          break;
        }
        if (s) {
          s = !1, r += a;
          break;
        }
        if (ms.has(r))
          return [];
        t.push(r), r = "", n = "property";
        break;
      }
      case "[": {
        if (n === "index")
          throw new Error("Invalid character in an index");
        if (n === "indexEnd") {
          n = "index";
          break;
        }
        if (s) {
          s = !1, r += a;
          break;
        }
        if (n === "property") {
          if (ms.has(r))
            return [];
          t.push(r), r = "";
        }
        n = "index";
        break;
      }
      case "]": {
        if (n === "index") {
          t.push(Number.parseInt(r, 10)), r = "", n = "indexEnd";
          break;
        }
        if (n === "indexEnd")
          throw new Error("Invalid character after an index");
      }
      default: {
        if (n === "index" && !Hu.has(a))
          throw new Error("Invalid character in an index");
        if (n === "indexEnd")
          throw new Error("Invalid character after an index");
        n === "start" && (n = "property"), s && (s = !1, r += "\\"), r += a;
      }
    }
  switch (s && (r += "\\"), n) {
    case "property": {
      if (ms.has(r))
        return [];
      t.push(r);
      break;
    }
    case "index":
      throw new Error("Index was not closed");
    case "start": {
      t.push("");
      break;
    }
  }
  return t;
}
function ta(e, t) {
  if (typeof t != "number" && Array.isArray(e)) {
    const r = Number.parseInt(t, 10);
    return Number.isInteger(r) && e[r] === e[t];
  }
  return !1;
}
function Mc(e, t) {
  if (ta(e, t))
    throw new Error("Cannot use string index");
}
function Ju(e, t, r) {
  if (!Zt(e) || typeof t != "string")
    return r === void 0 ? e : r;
  const n = Bn(t);
  if (n.length === 0)
    return r;
  for (let s = 0; s < n.length; s++) {
    const a = n[s];
    if (ta(e, a) ? e = s === n.length - 1 ? void 0 : null : e = e[a], e == null) {
      if (s !== n.length - 1)
        return r;
      break;
    }
  }
  return e === void 0 ? r : e;
}
function ai(e, t, r) {
  if (!Zt(e) || typeof t != "string")
    return e;
  const n = e, s = Bn(t);
  for (let a = 0; a < s.length; a++) {
    const o = s[a];
    Mc(e, o), a === s.length - 1 ? e[o] = r : Zt(e[o]) || (e[o] = typeof s[a + 1] == "number" ? [] : {}), e = e[o];
  }
  return n;
}
function Xu(e, t) {
  if (!Zt(e) || typeof t != "string")
    return !1;
  const r = Bn(t);
  for (let n = 0; n < r.length; n++) {
    const s = r[n];
    if (Mc(e, s), n === r.length - 1)
      return delete e[s], !0;
    if (e = e[s], !Zt(e))
      return !1;
  }
}
function Bu(e, t) {
  if (!Zt(e) || typeof t != "string")
    return !1;
  const r = Bn(t);
  if (r.length === 0)
    return !1;
  for (const n of r) {
    if (!Zt(e) || !(n in e) || ta(e, n))
      return !1;
    e = e[n];
  }
  return !0;
}
const Et = Xn.homedir(), ra = Xn.tmpdir(), { env: dr } = _e, Wu = (e) => {
  const t = ne.join(Et, "Library");
  return {
    data: ne.join(t, "Application Support", e),
    config: ne.join(t, "Preferences", e),
    cache: ne.join(t, "Caches", e),
    log: ne.join(t, "Logs", e),
    temp: ne.join(ra, e)
  };
}, Yu = (e) => {
  const t = dr.APPDATA || ne.join(Et, "AppData", "Roaming"), r = dr.LOCALAPPDATA || ne.join(Et, "AppData", "Local");
  return {
    // Data/config/cache/log are invented by me as Windows isn't opinionated about this
    data: ne.join(r, e, "Data"),
    config: ne.join(t, e, "Config"),
    cache: ne.join(r, e, "Cache"),
    log: ne.join(r, e, "Log"),
    temp: ne.join(ra, e)
  };
}, Qu = (e) => {
  const t = ne.basename(Et);
  return {
    data: ne.join(dr.XDG_DATA_HOME || ne.join(Et, ".local", "share"), e),
    config: ne.join(dr.XDG_CONFIG_HOME || ne.join(Et, ".config"), e),
    cache: ne.join(dr.XDG_CACHE_HOME || ne.join(Et, ".cache"), e),
    // https://wiki.debian.org/XDGBaseDirectorySpecification#state
    log: ne.join(dr.XDG_STATE_HOME || ne.join(Et, ".local", "state"), e),
    temp: ne.join(ra, t, e)
  };
};
function Zu(e, { suffix: t = "nodejs" } = {}) {
  if (typeof e != "string")
    throw new TypeError(`Expected a string, got ${typeof e}`);
  return t && (e += `-${t}`), _e.platform === "darwin" ? Wu(e) : _e.platform === "win32" ? Yu(e) : Qu(e);
}
const mt = (e, t) => function(...n) {
  return e.apply(void 0, n).catch(t);
}, at = (e, t) => function(...n) {
  try {
    return e.apply(void 0, n);
  } catch (s) {
    return t(s);
  }
}, xu = _e.getuid ? !_e.getuid() : !1, ed = 1e4, Me = () => {
}, de = {
  /* API */
  isChangeErrorOk: (e) => {
    if (!de.isNodeError(e))
      return !1;
    const { code: t } = e;
    return t === "ENOSYS" || !xu && (t === "EINVAL" || t === "EPERM");
  },
  isNodeError: (e) => e instanceof Error,
  isRetriableError: (e) => {
    if (!de.isNodeError(e))
      return !1;
    const { code: t } = e;
    return t === "EMFILE" || t === "ENFILE" || t === "EAGAIN" || t === "EBUSY" || t === "EACCESS" || t === "EACCES" || t === "EACCS" || t === "EPERM";
  },
  onChangeError: (e) => {
    if (!de.isNodeError(e))
      throw e;
    if (!de.isChangeErrorOk(e))
      throw e;
  }
};
class td {
  constructor() {
    this.interval = 25, this.intervalId = void 0, this.limit = ed, this.queueActive = /* @__PURE__ */ new Set(), this.queueWaiting = /* @__PURE__ */ new Set(), this.init = () => {
      this.intervalId || (this.intervalId = setInterval(this.tick, this.interval));
    }, this.reset = () => {
      this.intervalId && (clearInterval(this.intervalId), delete this.intervalId);
    }, this.add = (t) => {
      this.queueWaiting.add(t), this.queueActive.size < this.limit / 2 ? this.tick() : this.init();
    }, this.remove = (t) => {
      this.queueWaiting.delete(t), this.queueActive.delete(t);
    }, this.schedule = () => new Promise((t) => {
      const r = () => this.remove(n), n = () => t(r);
      this.add(n);
    }), this.tick = () => {
      if (!(this.queueActive.size >= this.limit)) {
        if (!this.queueWaiting.size)
          return this.reset();
        for (const t of this.queueWaiting) {
          if (this.queueActive.size >= this.limit)
            break;
          this.queueWaiting.delete(t), this.queueActive.add(t), t();
        }
      }
    };
  }
}
const rd = new td(), pt = (e, t) => function(n) {
  return function s(...a) {
    return rd.schedule().then((o) => {
      const u = (c) => (o(), c), l = (c) => {
        if (o(), Date.now() >= n)
          throw c;
        if (t(c)) {
          const d = Math.round(100 * Math.random());
          return new Promise((b) => setTimeout(b, d)).then(() => s.apply(void 0, a));
        }
        throw c;
      };
      return e.apply(void 0, a).then(u, l);
    });
  };
}, $t = (e, t) => function(n) {
  return function s(...a) {
    try {
      return e.apply(void 0, a);
    } catch (o) {
      if (Date.now() > n)
        throw o;
      if (t(o))
        return s.apply(void 0, a);
      throw o;
    }
  };
}, Ne = {
  attempt: {
    /* ASYNC */
    chmod: mt(be(Z.chmod), de.onChangeError),
    chown: mt(be(Z.chown), de.onChangeError),
    close: mt(be(Z.close), Me),
    fsync: mt(be(Z.fsync), Me),
    mkdir: mt(be(Z.mkdir), Me),
    realpath: mt(be(Z.realpath), Me),
    stat: mt(be(Z.stat), Me),
    unlink: mt(be(Z.unlink), Me),
    /* SYNC */
    chmodSync: at(Z.chmodSync, de.onChangeError),
    chownSync: at(Z.chownSync, de.onChangeError),
    closeSync: at(Z.closeSync, Me),
    existsSync: at(Z.existsSync, Me),
    fsyncSync: at(Z.fsync, Me),
    mkdirSync: at(Z.mkdirSync, Me),
    realpathSync: at(Z.realpathSync, Me),
    statSync: at(Z.statSync, Me),
    unlinkSync: at(Z.unlinkSync, Me)
  },
  retry: {
    /* ASYNC */
    close: pt(be(Z.close), de.isRetriableError),
    fsync: pt(be(Z.fsync), de.isRetriableError),
    open: pt(be(Z.open), de.isRetriableError),
    readFile: pt(be(Z.readFile), de.isRetriableError),
    rename: pt(be(Z.rename), de.isRetriableError),
    stat: pt(be(Z.stat), de.isRetriableError),
    write: pt(be(Z.write), de.isRetriableError),
    writeFile: pt(be(Z.writeFile), de.isRetriableError),
    /* SYNC */
    closeSync: $t(Z.closeSync, de.isRetriableError),
    fsyncSync: $t(Z.fsyncSync, de.isRetriableError),
    openSync: $t(Z.openSync, de.isRetriableError),
    readFileSync: $t(Z.readFileSync, de.isRetriableError),
    renameSync: $t(Z.renameSync, de.isRetriableError),
    statSync: $t(Z.statSync, de.isRetriableError),
    writeSync: $t(Z.writeSync, de.isRetriableError),
    writeFileSync: $t(Z.writeFileSync, de.isRetriableError)
  }
}, nd = "utf8", oi = 438, sd = 511, ad = {}, od = Xn.userInfo().uid, id = Xn.userInfo().gid, cd = 1e3, ld = !!_e.getuid;
_e.getuid && _e.getuid();
const ii = 128, ud = (e) => e instanceof Error && "code" in e, ci = (e) => typeof e == "string", ps = (e) => e === void 0, dd = _e.platform === "linux", Vc = _e.platform === "win32", na = ["SIGABRT", "SIGALRM", "SIGHUP", "SIGINT", "SIGTERM"];
Vc || na.push("SIGVTALRM", "SIGXCPU", "SIGXFSZ", "SIGUSR2", "SIGTRAP", "SIGSYS", "SIGQUIT", "SIGIOT");
dd && na.push("SIGIO", "SIGPOLL", "SIGPWR", "SIGSTKFLT", "SIGUNUSED");
class fd {
  /* CONSTRUCTOR */
  constructor() {
    this.callbacks = /* @__PURE__ */ new Set(), this.exited = !1, this.exit = (t) => {
      if (!this.exited) {
        this.exited = !0;
        for (const r of this.callbacks)
          r();
        t && (Vc && t !== "SIGINT" && t !== "SIGTERM" && t !== "SIGKILL" ? _e.kill(_e.pid, "SIGTERM") : _e.kill(_e.pid, t));
      }
    }, this.hook = () => {
      _e.once("exit", () => this.exit());
      for (const t of na)
        try {
          _e.once(t, () => this.exit(t));
        } catch {
        }
    }, this.register = (t) => (this.callbacks.add(t), () => {
      this.callbacks.delete(t);
    }), this.hook();
  }
}
const hd = new fd(), md = hd.register, Re = {
  /* VARIABLES */
  store: {},
  /* API */
  create: (e) => {
    const t = `000000${Math.floor(Math.random() * 16777215).toString(16)}`.slice(-6), s = `.tmp-${Date.now().toString().slice(-10)}${t}`;
    return `${e}${s}`;
  },
  get: (e, t, r = !0) => {
    const n = Re.truncate(t(e));
    return n in Re.store ? Re.get(e, t, r) : (Re.store[n] = r, [n, () => delete Re.store[n]]);
  },
  purge: (e) => {
    Re.store[e] && (delete Re.store[e], Ne.attempt.unlink(e));
  },
  purgeSync: (e) => {
    Re.store[e] && (delete Re.store[e], Ne.attempt.unlinkSync(e));
  },
  purgeSyncAll: () => {
    for (const e in Re.store)
      Re.purgeSync(e);
  },
  truncate: (e) => {
    const t = ne.basename(e);
    if (t.length <= ii)
      return e;
    const r = /^(\.?)(.*?)((?:\.[^.]+)?(?:\.tmp-\d{10}[a-f0-9]{6})?)$/.exec(t);
    if (!r)
      return e;
    const n = t.length - ii;
    return `${e.slice(0, -t.length)}${r[1]}${r[2].slice(0, -n)}${r[3]}`;
  }
};
md(Re.purgeSyncAll);
function Lc(e, t, r = ad) {
  if (ci(r))
    return Lc(e, t, { encoding: r });
  const n = Date.now() + ((r.timeout ?? cd) || -1);
  let s = null, a = null, o = null;
  try {
    const u = Ne.attempt.realpathSync(e), l = !!u;
    e = u || e, [a, s] = Re.get(e, r.tmpCreate || Re.create, r.tmpPurge !== !1);
    const c = ld && ps(r.chown), d = ps(r.mode);
    if (l && (c || d)) {
      const h = Ne.attempt.statSync(e);
      h && (r = { ...r }, c && (r.chown = { uid: h.uid, gid: h.gid }), d && (r.mode = h.mode));
    }
    if (!l) {
      const h = ne.dirname(e);
      Ne.attempt.mkdirSync(h, {
        mode: sd,
        recursive: !0
      });
    }
    o = Ne.retry.openSync(n)(a, "w", r.mode || oi), r.tmpCreated && r.tmpCreated(a), ci(t) ? Ne.retry.writeSync(n)(o, t, 0, r.encoding || nd) : ps(t) || Ne.retry.writeSync(n)(o, t, 0, t.length, 0), r.fsync !== !1 && (r.fsyncWait !== !1 ? Ne.retry.fsyncSync(n)(o) : Ne.attempt.fsync(o)), Ne.retry.closeSync(n)(o), o = null, r.chown && (r.chown.uid !== od || r.chown.gid !== id) && Ne.attempt.chownSync(a, r.chown.uid, r.chown.gid), r.mode && r.mode !== oi && Ne.attempt.chmodSync(a, r.mode);
    try {
      Ne.retry.renameSync(n)(a, e);
    } catch (h) {
      if (!ud(h) || h.code !== "ENAMETOOLONG")
        throw h;
      Ne.retry.renameSync(n)(a, Re.truncate(e));
    }
    s(), a = null;
  } finally {
    o && Ne.attempt.closeSync(o), a && Re.purge(a);
  }
}
function Fc(e) {
  return e && e.__esModule && Object.prototype.hasOwnProperty.call(e, "default") ? e.default : e;
}
var Cs = { exports: {} }, zc = {}, Be = {}, $r = {}, nn = {}, W = {}, tn = {};
(function(e) {
  Object.defineProperty(e, "__esModule", { value: !0 }), e.regexpCode = e.getEsmExportName = e.getProperty = e.safeStringify = e.stringify = e.strConcat = e.addCodeArg = e.str = e._ = e.nil = e._Code = e.Name = e.IDENTIFIER = e._CodeOrName = void 0;
  class t {
  }
  e._CodeOrName = t, e.IDENTIFIER = /^[a-z$_][a-z$_0-9]*$/i;
  class r extends t {
    constructor(v) {
      if (super(), !e.IDENTIFIER.test(v))
        throw new Error("CodeGen: name must be a valid identifier");
      this.str = v;
    }
    toString() {
      return this.str;
    }
    emptyStr() {
      return !1;
    }
    get names() {
      return { [this.str]: 1 };
    }
  }
  e.Name = r;
  class n extends t {
    constructor(v) {
      super(), this._items = typeof v == "string" ? [v] : v;
    }
    toString() {
      return this.str;
    }
    emptyStr() {
      if (this._items.length > 1)
        return !1;
      const v = this._items[0];
      return v === "" || v === '""';
    }
    get str() {
      var v;
      return (v = this._str) !== null && v !== void 0 ? v : this._str = this._items.reduce((N, R) => `${N}${R}`, "");
    }
    get names() {
      var v;
      return (v = this._names) !== null && v !== void 0 ? v : this._names = this._items.reduce((N, R) => (R instanceof r && (N[R.str] = (N[R.str] || 0) + 1), N), {});
    }
  }
  e._Code = n, e.nil = new n("");
  function s(m, ...v) {
    const N = [m[0]];
    let R = 0;
    for (; R < v.length; )
      u(N, v[R]), N.push(m[++R]);
    return new n(N);
  }
  e._ = s;
  const a = new n("+");
  function o(m, ...v) {
    const N = [g(m[0])];
    let R = 0;
    for (; R < v.length; )
      N.push(a), u(N, v[R]), N.push(a, g(m[++R]));
    return l(N), new n(N);
  }
  e.str = o;
  function u(m, v) {
    v instanceof n ? m.push(...v._items) : v instanceof r ? m.push(v) : m.push(h(v));
  }
  e.addCodeArg = u;
  function l(m) {
    let v = 1;
    for (; v < m.length - 1; ) {
      if (m[v] === a) {
        const N = c(m[v - 1], m[v + 1]);
        if (N !== void 0) {
          m.splice(v - 1, 3, N);
          continue;
        }
        m[v++] = "+";
      }
      v++;
    }
  }
  function c(m, v) {
    if (v === '""')
      return m;
    if (m === '""')
      return v;
    if (typeof m == "string")
      return v instanceof r || m[m.length - 1] !== '"' ? void 0 : typeof v != "string" ? `${m.slice(0, -1)}${v}"` : v[0] === '"' ? m.slice(0, -1) + v.slice(1) : void 0;
    if (typeof v == "string" && v[0] === '"' && !(m instanceof r))
      return `"${m}${v.slice(1)}`;
  }
  function d(m, v) {
    return v.emptyStr() ? m : m.emptyStr() ? v : o`${m}${v}`;
  }
  e.strConcat = d;
  function h(m) {
    return typeof m == "number" || typeof m == "boolean" || m === null ? m : g(Array.isArray(m) ? m.join(",") : m);
  }
  function b(m) {
    return new n(g(m));
  }
  e.stringify = b;
  function g(m) {
    return JSON.stringify(m).replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029");
  }
  e.safeStringify = g;
  function y(m) {
    return typeof m == "string" && e.IDENTIFIER.test(m) ? new n(`.${m}`) : s`[${m}]`;
  }
  e.getProperty = y;
  function w(m) {
    if (typeof m == "string" && e.IDENTIFIER.test(m))
      return new n(`${m}`);
    throw new Error(`CodeGen: invalid export name: ${m}, use explicit $id name mapping`);
  }
  e.getEsmExportName = w;
  function _(m) {
    return new n(m.toString());
  }
  e.regexpCode = _;
})(tn);
var Ds = {};
(function(e) {
  Object.defineProperty(e, "__esModule", { value: !0 }), e.ValueScope = e.ValueScopeName = e.Scope = e.varKinds = e.UsedValueState = void 0;
  const t = tn;
  class r extends Error {
    constructor(c) {
      super(`CodeGen: "code" for ${c} not defined`), this.value = c.value;
    }
  }
  var n;
  (function(l) {
    l[l.Started = 0] = "Started", l[l.Completed = 1] = "Completed";
  })(n || (e.UsedValueState = n = {})), e.varKinds = {
    const: new t.Name("const"),
    let: new t.Name("let"),
    var: new t.Name("var")
  };
  class s {
    constructor({ prefixes: c, parent: d } = {}) {
      this._names = {}, this._prefixes = c, this._parent = d;
    }
    toName(c) {
      return c instanceof t.Name ? c : this.name(c);
    }
    name(c) {
      return new t.Name(this._newName(c));
    }
    _newName(c) {
      const d = this._names[c] || this._nameGroup(c);
      return `${c}${d.index++}`;
    }
    _nameGroup(c) {
      var d, h;
      if (!((h = (d = this._parent) === null || d === void 0 ? void 0 : d._prefixes) === null || h === void 0) && h.has(c) || this._prefixes && !this._prefixes.has(c))
        throw new Error(`CodeGen: prefix "${c}" is not allowed in this scope`);
      return this._names[c] = { prefix: c, index: 0 };
    }
  }
  e.Scope = s;
  class a extends t.Name {
    constructor(c, d) {
      super(d), this.prefix = c;
    }
    setValue(c, { property: d, itemIndex: h }) {
      this.value = c, this.scopePath = (0, t._)`.${new t.Name(d)}[${h}]`;
    }
  }
  e.ValueScopeName = a;
  const o = (0, t._)`\n`;
  class u extends s {
    constructor(c) {
      super(c), this._values = {}, this._scope = c.scope, this.opts = { ...c, _n: c.lines ? o : t.nil };
    }
    get() {
      return this._scope;
    }
    name(c) {
      return new a(c, this._newName(c));
    }
    value(c, d) {
      var h;
      if (d.ref === void 0)
        throw new Error("CodeGen: ref must be passed in value");
      const b = this.toName(c), { prefix: g } = b, y = (h = d.key) !== null && h !== void 0 ? h : d.ref;
      let w = this._values[g];
      if (w) {
        const v = w.get(y);
        if (v)
          return v;
      } else
        w = this._values[g] = /* @__PURE__ */ new Map();
      w.set(y, b);
      const _ = this._scope[g] || (this._scope[g] = []), m = _.length;
      return _[m] = d.ref, b.setValue(d, { property: g, itemIndex: m }), b;
    }
    getValue(c, d) {
      const h = this._values[c];
      if (h)
        return h.get(d);
    }
    scopeRefs(c, d = this._values) {
      return this._reduceValues(d, (h) => {
        if (h.scopePath === void 0)
          throw new Error(`CodeGen: name "${h}" has no value`);
        return (0, t._)`${c}${h.scopePath}`;
      });
    }
    scopeCode(c = this._values, d, h) {
      return this._reduceValues(c, (b) => {
        if (b.value === void 0)
          throw new Error(`CodeGen: name "${b}" has no value`);
        return b.value.code;
      }, d, h);
    }
    _reduceValues(c, d, h = {}, b) {
      let g = t.nil;
      for (const y in c) {
        const w = c[y];
        if (!w)
          continue;
        const _ = h[y] = h[y] || /* @__PURE__ */ new Map();
        w.forEach((m) => {
          if (_.has(m))
            return;
          _.set(m, n.Started);
          let v = d(m);
          if (v) {
            const N = this.opts.es5 ? e.varKinds.var : e.varKinds.const;
            g = (0, t._)`${g}${N} ${m} = ${v};${this.opts._n}`;
          } else if (v = b == null ? void 0 : b(m))
            g = (0, t._)`${g}${v}${this.opts._n}`;
          else
            throw new r(m);
          _.set(m, n.Completed);
        });
      }
      return g;
    }
  }
  e.ValueScope = u;
})(Ds);
(function(e) {
  Object.defineProperty(e, "__esModule", { value: !0 }), e.or = e.and = e.not = e.CodeGen = e.operators = e.varKinds = e.ValueScopeName = e.ValueScope = e.Scope = e.Name = e.regexpCode = e.stringify = e.getProperty = e.nil = e.strConcat = e.str = e._ = void 0;
  const t = tn, r = Ds;
  var n = tn;
  Object.defineProperty(e, "_", { enumerable: !0, get: function() {
    return n._;
  } }), Object.defineProperty(e, "str", { enumerable: !0, get: function() {
    return n.str;
  } }), Object.defineProperty(e, "strConcat", { enumerable: !0, get: function() {
    return n.strConcat;
  } }), Object.defineProperty(e, "nil", { enumerable: !0, get: function() {
    return n.nil;
  } }), Object.defineProperty(e, "getProperty", { enumerable: !0, get: function() {
    return n.getProperty;
  } }), Object.defineProperty(e, "stringify", { enumerable: !0, get: function() {
    return n.stringify;
  } }), Object.defineProperty(e, "regexpCode", { enumerable: !0, get: function() {
    return n.regexpCode;
  } }), Object.defineProperty(e, "Name", { enumerable: !0, get: function() {
    return n.Name;
  } });
  var s = Ds;
  Object.defineProperty(e, "Scope", { enumerable: !0, get: function() {
    return s.Scope;
  } }), Object.defineProperty(e, "ValueScope", { enumerable: !0, get: function() {
    return s.ValueScope;
  } }), Object.defineProperty(e, "ValueScopeName", { enumerable: !0, get: function() {
    return s.ValueScopeName;
  } }), Object.defineProperty(e, "varKinds", { enumerable: !0, get: function() {
    return s.varKinds;
  } }), e.operators = {
    GT: new t._Code(">"),
    GTE: new t._Code(">="),
    LT: new t._Code("<"),
    LTE: new t._Code("<="),
    EQ: new t._Code("==="),
    NEQ: new t._Code("!=="),
    NOT: new t._Code("!"),
    OR: new t._Code("||"),
    AND: new t._Code("&&"),
    ADD: new t._Code("+")
  };
  class a {
    optimizeNodes() {
      return this;
    }
    optimizeNames(i, f) {
      return this;
    }
  }
  class o extends a {
    constructor(i, f, E) {
      super(), this.varKind = i, this.name = f, this.rhs = E;
    }
    render({ es5: i, _n: f }) {
      const E = i ? r.varKinds.var : this.varKind, I = this.rhs === void 0 ? "" : ` = ${this.rhs}`;
      return `${E} ${this.name}${I};` + f;
    }
    optimizeNames(i, f) {
      if (i[this.name.str])
        return this.rhs && (this.rhs = T(this.rhs, i, f)), this;
    }
    get names() {
      return this.rhs instanceof t._CodeOrName ? this.rhs.names : {};
    }
  }
  class u extends a {
    constructor(i, f, E) {
      super(), this.lhs = i, this.rhs = f, this.sideEffects = E;
    }
    render({ _n: i }) {
      return `${this.lhs} = ${this.rhs};` + i;
    }
    optimizeNames(i, f) {
      if (!(this.lhs instanceof t.Name && !i[this.lhs.str] && !this.sideEffects))
        return this.rhs = T(this.rhs, i, f), this;
    }
    get names() {
      const i = this.lhs instanceof t.Name ? {} : { ...this.lhs.names };
      return se(i, this.rhs);
    }
  }
  class l extends u {
    constructor(i, f, E, I) {
      super(i, E, I), this.op = f;
    }
    render({ _n: i }) {
      return `${this.lhs} ${this.op}= ${this.rhs};` + i;
    }
  }
  class c extends a {
    constructor(i) {
      super(), this.label = i, this.names = {};
    }
    render({ _n: i }) {
      return `${this.label}:` + i;
    }
  }
  class d extends a {
    constructor(i) {
      super(), this.label = i, this.names = {};
    }
    render({ _n: i }) {
      return `break${this.label ? ` ${this.label}` : ""};` + i;
    }
  }
  class h extends a {
    constructor(i) {
      super(), this.error = i;
    }
    render({ _n: i }) {
      return `throw ${this.error};` + i;
    }
    get names() {
      return this.error.names;
    }
  }
  class b extends a {
    constructor(i) {
      super(), this.code = i;
    }
    render({ _n: i }) {
      return `${this.code};` + i;
    }
    optimizeNodes() {
      return `${this.code}` ? this : void 0;
    }
    optimizeNames(i, f) {
      return this.code = T(this.code, i, f), this;
    }
    get names() {
      return this.code instanceof t._CodeOrName ? this.code.names : {};
    }
  }
  class g extends a {
    constructor(i = []) {
      super(), this.nodes = i;
    }
    render(i) {
      return this.nodes.reduce((f, E) => f + E.render(i), "");
    }
    optimizeNodes() {
      const { nodes: i } = this;
      let f = i.length;
      for (; f--; ) {
        const E = i[f].optimizeNodes();
        Array.isArray(E) ? i.splice(f, 1, ...E) : E ? i[f] = E : i.splice(f, 1);
      }
      return i.length > 0 ? this : void 0;
    }
    optimizeNames(i, f) {
      const { nodes: E } = this;
      let I = E.length;
      for (; I--; ) {
        const j = E[I];
        j.optimizeNames(i, f) || (k(i, j.names), E.splice(I, 1));
      }
      return E.length > 0 ? this : void 0;
    }
    get names() {
      return this.nodes.reduce((i, f) => H(i, f.names), {});
    }
  }
  class y extends g {
    render(i) {
      return "{" + i._n + super.render(i) + "}" + i._n;
    }
  }
  class w extends g {
  }
  class _ extends y {
  }
  _.kind = "else";
  class m extends y {
    constructor(i, f) {
      super(f), this.condition = i;
    }
    render(i) {
      let f = `if(${this.condition})` + super.render(i);
      return this.else && (f += "else " + this.else.render(i)), f;
    }
    optimizeNodes() {
      super.optimizeNodes();
      const i = this.condition;
      if (i === !0)
        return this.nodes;
      let f = this.else;
      if (f) {
        const E = f.optimizeNodes();
        f = this.else = Array.isArray(E) ? new _(E) : E;
      }
      if (f)
        return i === !1 ? f instanceof m ? f : f.nodes : this.nodes.length ? this : new m(V(i), f instanceof m ? [f] : f.nodes);
      if (!(i === !1 || !this.nodes.length))
        return this;
    }
    optimizeNames(i, f) {
      var E;
      if (this.else = (E = this.else) === null || E === void 0 ? void 0 : E.optimizeNames(i, f), !!(super.optimizeNames(i, f) || this.else))
        return this.condition = T(this.condition, i, f), this;
    }
    get names() {
      const i = super.names;
      return se(i, this.condition), this.else && H(i, this.else.names), i;
    }
  }
  m.kind = "if";
  class v extends y {
  }
  v.kind = "for";
  class N extends v {
    constructor(i) {
      super(), this.iteration = i;
    }
    render(i) {
      return `for(${this.iteration})` + super.render(i);
    }
    optimizeNames(i, f) {
      if (super.optimizeNames(i, f))
        return this.iteration = T(this.iteration, i, f), this;
    }
    get names() {
      return H(super.names, this.iteration.names);
    }
  }
  class R extends v {
    constructor(i, f, E, I) {
      super(), this.varKind = i, this.name = f, this.from = E, this.to = I;
    }
    render(i) {
      const f = i.es5 ? r.varKinds.var : this.varKind, { name: E, from: I, to: j } = this;
      return `for(${f} ${E}=${I}; ${E}<${j}; ${E}++)` + super.render(i);
    }
    get names() {
      const i = se(super.names, this.from);
      return se(i, this.to);
    }
  }
  class O extends v {
    constructor(i, f, E, I) {
      super(), this.loop = i, this.varKind = f, this.name = E, this.iterable = I;
    }
    render(i) {
      return `for(${this.varKind} ${this.name} ${this.loop} ${this.iterable})` + super.render(i);
    }
    optimizeNames(i, f) {
      if (super.optimizeNames(i, f))
        return this.iterable = T(this.iterable, i, f), this;
    }
    get names() {
      return H(super.names, this.iterable.names);
    }
  }
  class G extends y {
    constructor(i, f, E) {
      super(), this.name = i, this.args = f, this.async = E;
    }
    render(i) {
      return `${this.async ? "async " : ""}function ${this.name}(${this.args})` + super.render(i);
    }
  }
  G.kind = "func";
  class B extends g {
    render(i) {
      return "return " + super.render(i);
    }
  }
  B.kind = "return";
  class le extends y {
    render(i) {
      let f = "try" + super.render(i);
      return this.catch && (f += this.catch.render(i)), this.finally && (f += this.finally.render(i)), f;
    }
    optimizeNodes() {
      var i, f;
      return super.optimizeNodes(), (i = this.catch) === null || i === void 0 || i.optimizeNodes(), (f = this.finally) === null || f === void 0 || f.optimizeNodes(), this;
    }
    optimizeNames(i, f) {
      var E, I;
      return super.optimizeNames(i, f), (E = this.catch) === null || E === void 0 || E.optimizeNames(i, f), (I = this.finally) === null || I === void 0 || I.optimizeNames(i, f), this;
    }
    get names() {
      const i = super.names;
      return this.catch && H(i, this.catch.names), this.finally && H(i, this.finally.names), i;
    }
  }
  class fe extends y {
    constructor(i) {
      super(), this.error = i;
    }
    render(i) {
      return `catch(${this.error})` + super.render(i);
    }
  }
  fe.kind = "catch";
  class pe extends y {
    render(i) {
      return "finally" + super.render(i);
    }
  }
  pe.kind = "finally";
  class z {
    constructor(i, f = {}) {
      this._values = {}, this._blockStarts = [], this._constants = {}, this.opts = { ...f, _n: f.lines ? `
` : "" }, this._extScope = i, this._scope = new r.Scope({ parent: i }), this._nodes = [new w()];
    }
    toString() {
      return this._root.render(this.opts);
    }
    // returns unique name in the internal scope
    name(i) {
      return this._scope.name(i);
    }
    // reserves unique name in the external scope
    scopeName(i) {
      return this._extScope.name(i);
    }
    // reserves unique name in the external scope and assigns value to it
    scopeValue(i, f) {
      const E = this._extScope.value(i, f);
      return (this._values[E.prefix] || (this._values[E.prefix] = /* @__PURE__ */ new Set())).add(E), E;
    }
    getScopeValue(i, f) {
      return this._extScope.getValue(i, f);
    }
    // return code that assigns values in the external scope to the names that are used internally
    // (same names that were returned by gen.scopeName or gen.scopeValue)
    scopeRefs(i) {
      return this._extScope.scopeRefs(i, this._values);
    }
    scopeCode() {
      return this._extScope.scopeCode(this._values);
    }
    _def(i, f, E, I) {
      const j = this._scope.toName(f);
      return E !== void 0 && I && (this._constants[j.str] = E), this._leafNode(new o(i, j, E)), j;
    }
    // `const` declaration (`var` in es5 mode)
    const(i, f, E) {
      return this._def(r.varKinds.const, i, f, E);
    }
    // `let` declaration with optional assignment (`var` in es5 mode)
    let(i, f, E) {
      return this._def(r.varKinds.let, i, f, E);
    }
    // `var` declaration with optional assignment
    var(i, f, E) {
      return this._def(r.varKinds.var, i, f, E);
    }
    // assignment code
    assign(i, f, E) {
      return this._leafNode(new u(i, f, E));
    }
    // `+=` code
    add(i, f) {
      return this._leafNode(new l(i, e.operators.ADD, f));
    }
    // appends passed SafeExpr to code or executes Block
    code(i) {
      return typeof i == "function" ? i() : i !== t.nil && this._leafNode(new b(i)), this;
    }
    // returns code for object literal for the passed argument list of key-value pairs
    object(...i) {
      const f = ["{"];
      for (const [E, I] of i)
        f.length > 1 && f.push(","), f.push(E), (E !== I || this.opts.es5) && (f.push(":"), (0, t.addCodeArg)(f, I));
      return f.push("}"), new t._Code(f);
    }
    // `if` clause (or statement if `thenBody` and, optionally, `elseBody` are passed)
    if(i, f, E) {
      if (this._blockNode(new m(i)), f && E)
        this.code(f).else().code(E).endIf();
      else if (f)
        this.code(f).endIf();
      else if (E)
        throw new Error('CodeGen: "else" body without "then" body');
      return this;
    }
    // `else if` clause - invalid without `if` or after `else` clauses
    elseIf(i) {
      return this._elseNode(new m(i));
    }
    // `else` clause - only valid after `if` or `else if` clauses
    else() {
      return this._elseNode(new _());
    }
    // end `if` statement (needed if gen.if was used only with condition)
    endIf() {
      return this._endBlockNode(m, _);
    }
    _for(i, f) {
      return this._blockNode(i), f && this.code(f).endFor(), this;
    }
    // a generic `for` clause (or statement if `forBody` is passed)
    for(i, f) {
      return this._for(new N(i), f);
    }
    // `for` statement for a range of values
    forRange(i, f, E, I, j = this.opts.es5 ? r.varKinds.var : r.varKinds.let) {
      const F = this._scope.toName(i);
      return this._for(new R(j, F, f, E), () => I(F));
    }
    // `for-of` statement (in es5 mode replace with a normal for loop)
    forOf(i, f, E, I = r.varKinds.const) {
      const j = this._scope.toName(i);
      if (this.opts.es5) {
        const F = f instanceof t.Name ? f : this.var("_arr", f);
        return this.forRange("_i", 0, (0, t._)`${F}.length`, (L) => {
          this.var(j, (0, t._)`${F}[${L}]`), E(j);
        });
      }
      return this._for(new O("of", I, j, f), () => E(j));
    }
    // `for-in` statement.
    // With option `ownProperties` replaced with a `for-of` loop for object keys
    forIn(i, f, E, I = this.opts.es5 ? r.varKinds.var : r.varKinds.const) {
      if (this.opts.ownProperties)
        return this.forOf(i, (0, t._)`Object.keys(${f})`, E);
      const j = this._scope.toName(i);
      return this._for(new O("in", I, j, f), () => E(j));
    }
    // end `for` loop
    endFor() {
      return this._endBlockNode(v);
    }
    // `label` statement
    label(i) {
      return this._leafNode(new c(i));
    }
    // `break` statement
    break(i) {
      return this._leafNode(new d(i));
    }
    // `return` statement
    return(i) {
      const f = new B();
      if (this._blockNode(f), this.code(i), f.nodes.length !== 1)
        throw new Error('CodeGen: "return" should have one node');
      return this._endBlockNode(B);
    }
    // `try` statement
    try(i, f, E) {
      if (!f && !E)
        throw new Error('CodeGen: "try" without "catch" and "finally"');
      const I = new le();
      if (this._blockNode(I), this.code(i), f) {
        const j = this.name("e");
        this._currNode = I.catch = new fe(j), f(j);
      }
      return E && (this._currNode = I.finally = new pe(), this.code(E)), this._endBlockNode(fe, pe);
    }
    // `throw` statement
    throw(i) {
      return this._leafNode(new h(i));
    }
    // start self-balancing block
    block(i, f) {
      return this._blockStarts.push(this._nodes.length), i && this.code(i).endBlock(f), this;
    }
    // end the current self-balancing block
    endBlock(i) {
      const f = this._blockStarts.pop();
      if (f === void 0)
        throw new Error("CodeGen: not in self-balancing block");
      const E = this._nodes.length - f;
      if (E < 0 || i !== void 0 && E !== i)
        throw new Error(`CodeGen: wrong number of nodes: ${E} vs ${i} expected`);
      return this._nodes.length = f, this;
    }
    // `function` heading (or definition if funcBody is passed)
    func(i, f = t.nil, E, I) {
      return this._blockNode(new G(i, f, E)), I && this.code(I).endFunc(), this;
    }
    // end function definition
    endFunc() {
      return this._endBlockNode(G);
    }
    optimize(i = 1) {
      for (; i-- > 0; )
        this._root.optimizeNodes(), this._root.optimizeNames(this._root.names, this._constants);
    }
    _leafNode(i) {
      return this._currNode.nodes.push(i), this;
    }
    _blockNode(i) {
      this._currNode.nodes.push(i), this._nodes.push(i);
    }
    _endBlockNode(i, f) {
      const E = this._currNode;
      if (E instanceof i || f && E instanceof f)
        return this._nodes.pop(), this;
      throw new Error(`CodeGen: not in block "${f ? `${i.kind}/${f.kind}` : i.kind}"`);
    }
    _elseNode(i) {
      const f = this._currNode;
      if (!(f instanceof m))
        throw new Error('CodeGen: "else" without "if"');
      return this._currNode = f.else = i, this;
    }
    get _root() {
      return this._nodes[0];
    }
    get _currNode() {
      const i = this._nodes;
      return i[i.length - 1];
    }
    set _currNode(i) {
      const f = this._nodes;
      f[f.length - 1] = i;
    }
  }
  e.CodeGen = z;
  function H($, i) {
    for (const f in i)
      $[f] = ($[f] || 0) + (i[f] || 0);
    return $;
  }
  function se($, i) {
    return i instanceof t._CodeOrName ? H($, i.names) : $;
  }
  function T($, i, f) {
    if ($ instanceof t.Name)
      return E($);
    if (!I($))
      return $;
    return new t._Code($._items.reduce((j, F) => (F instanceof t.Name && (F = E(F)), F instanceof t._Code ? j.push(...F._items) : j.push(F), j), []));
    function E(j) {
      const F = f[j.str];
      return F === void 0 || i[j.str] !== 1 ? j : (delete i[j.str], F);
    }
    function I(j) {
      return j instanceof t._Code && j._items.some((F) => F instanceof t.Name && i[F.str] === 1 && f[F.str] !== void 0);
    }
  }
  function k($, i) {
    for (const f in i)
      $[f] = ($[f] || 0) - (i[f] || 0);
  }
  function V($) {
    return typeof $ == "boolean" || typeof $ == "number" || $ === null ? !$ : (0, t._)`!${S($)}`;
  }
  e.not = V;
  const D = p(e.operators.AND);
  function K(...$) {
    return $.reduce(D);
  }
  e.and = K;
  const M = p(e.operators.OR);
  function P(...$) {
    return $.reduce(M);
  }
  e.or = P;
  function p($) {
    return (i, f) => i === t.nil ? f : f === t.nil ? i : (0, t._)`${S(i)} ${$} ${S(f)}`;
  }
  function S($) {
    return $ instanceof t.Name ? $ : (0, t._)`(${$})`;
  }
})(W);
var A = {};
Object.defineProperty(A, "__esModule", { value: !0 });
A.checkStrictMode = A.getErrorPath = A.Type = A.useFunc = A.setEvaluated = A.evaluatedPropsToName = A.mergeEvaluated = A.eachItem = A.unescapeJsonPointer = A.escapeJsonPointer = A.escapeFragment = A.unescapeFragment = A.schemaRefOrVal = A.schemaHasRulesButRef = A.schemaHasRules = A.checkUnknownRules = A.alwaysValidSchema = A.toHash = void 0;
const ae = W, pd = tn;
function $d(e) {
  const t = {};
  for (const r of e)
    t[r] = !0;
  return t;
}
A.toHash = $d;
function yd(e, t) {
  return typeof t == "boolean" ? t : Object.keys(t).length === 0 ? !0 : (Uc(e, t), !qc(t, e.self.RULES.all));
}
A.alwaysValidSchema = yd;
function Uc(e, t = e.schema) {
  const { opts: r, self: n } = e;
  if (!r.strictSchema || typeof t == "boolean")
    return;
  const s = n.RULES.keywords;
  for (const a in t)
    s[a] || Hc(e, `unknown keyword: "${a}"`);
}
A.checkUnknownRules = Uc;
function qc(e, t) {
  if (typeof e == "boolean")
    return !e;
  for (const r in e)
    if (t[r])
      return !0;
  return !1;
}
A.schemaHasRules = qc;
function _d(e, t) {
  if (typeof e == "boolean")
    return !e;
  for (const r in e)
    if (r !== "$ref" && t.all[r])
      return !0;
  return !1;
}
A.schemaHasRulesButRef = _d;
function gd({ topSchemaRef: e, schemaPath: t }, r, n, s) {
  if (!s) {
    if (typeof r == "number" || typeof r == "boolean")
      return r;
    if (typeof r == "string")
      return (0, ae._)`${r}`;
  }
  return (0, ae._)`${e}${t}${(0, ae.getProperty)(n)}`;
}
A.schemaRefOrVal = gd;
function vd(e) {
  return Gc(decodeURIComponent(e));
}
A.unescapeFragment = vd;
function wd(e) {
  return encodeURIComponent(sa(e));
}
A.escapeFragment = wd;
function sa(e) {
  return typeof e == "number" ? `${e}` : e.replace(/~/g, "~0").replace(/\//g, "~1");
}
A.escapeJsonPointer = sa;
function Gc(e) {
  return e.replace(/~1/g, "/").replace(/~0/g, "~");
}
A.unescapeJsonPointer = Gc;
function Ed(e, t) {
  if (Array.isArray(e))
    for (const r of e)
      t(r);
  else
    t(e);
}
A.eachItem = Ed;
function li({ mergeNames: e, mergeToName: t, mergeValues: r, resultToName: n }) {
  return (s, a, o, u) => {
    const l = o === void 0 ? a : o instanceof ae.Name ? (a instanceof ae.Name ? e(s, a, o) : t(s, a, o), o) : a instanceof ae.Name ? (t(s, o, a), a) : r(a, o);
    return u === ae.Name && !(l instanceof ae.Name) ? n(s, l) : l;
  };
}
A.mergeEvaluated = {
  props: li({
    mergeNames: (e, t, r) => e.if((0, ae._)`${r} !== true && ${t} !== undefined`, () => {
      e.if((0, ae._)`${t} === true`, () => e.assign(r, !0), () => e.assign(r, (0, ae._)`${r} || {}`).code((0, ae._)`Object.assign(${r}, ${t})`));
    }),
    mergeToName: (e, t, r) => e.if((0, ae._)`${r} !== true`, () => {
      t === !0 ? e.assign(r, !0) : (e.assign(r, (0, ae._)`${r} || {}`), aa(e, r, t));
    }),
    mergeValues: (e, t) => e === !0 ? !0 : { ...e, ...t },
    resultToName: Kc
  }),
  items: li({
    mergeNames: (e, t, r) => e.if((0, ae._)`${r} !== true && ${t} !== undefined`, () => e.assign(r, (0, ae._)`${t} === true ? true : ${r} > ${t} ? ${r} : ${t}`)),
    mergeToName: (e, t, r) => e.if((0, ae._)`${r} !== true`, () => e.assign(r, t === !0 ? !0 : (0, ae._)`${r} > ${t} ? ${r} : ${t}`)),
    mergeValues: (e, t) => e === !0 ? !0 : Math.max(e, t),
    resultToName: (e, t) => e.var("items", t)
  })
};
function Kc(e, t) {
  if (t === !0)
    return e.var("props", !0);
  const r = e.var("props", (0, ae._)`{}`);
  return t !== void 0 && aa(e, r, t), r;
}
A.evaluatedPropsToName = Kc;
function aa(e, t, r) {
  Object.keys(r).forEach((n) => e.assign((0, ae._)`${t}${(0, ae.getProperty)(n)}`, !0));
}
A.setEvaluated = aa;
const ui = {};
function bd(e, t) {
  return e.scopeValue("func", {
    ref: t,
    code: ui[t.code] || (ui[t.code] = new pd._Code(t.code))
  });
}
A.useFunc = bd;
var Ms;
(function(e) {
  e[e.Num = 0] = "Num", e[e.Str = 1] = "Str";
})(Ms || (A.Type = Ms = {}));
function Sd(e, t, r) {
  if (e instanceof ae.Name) {
    const n = t === Ms.Num;
    return r ? n ? (0, ae._)`"[" + ${e} + "]"` : (0, ae._)`"['" + ${e} + "']"` : n ? (0, ae._)`"/" + ${e}` : (0, ae._)`"/" + ${e}.replace(/~/g, "~0").replace(/\\//g, "~1")`;
  }
  return r ? (0, ae.getProperty)(e).toString() : "/" + sa(e);
}
A.getErrorPath = Sd;
function Hc(e, t, r = e.opts.strictSchema) {
  if (r) {
    if (t = `strict mode: ${t}`, r === !0)
      throw new Error(t);
    e.self.logger.warn(t);
  }
}
A.checkStrictMode = Hc;
var Le = {};
Object.defineProperty(Le, "__esModule", { value: !0 });
const Se = W, Pd = {
  // validation function arguments
  data: new Se.Name("data"),
  // data passed to validation function
  // args passed from referencing schema
  valCxt: new Se.Name("valCxt"),
  // validation/data context - should not be used directly, it is destructured to the names below
  instancePath: new Se.Name("instancePath"),
  parentData: new Se.Name("parentData"),
  parentDataProperty: new Se.Name("parentDataProperty"),
  rootData: new Se.Name("rootData"),
  // root data - same as the data passed to the first/top validation function
  dynamicAnchors: new Se.Name("dynamicAnchors"),
  // used to support recursiveRef and dynamicRef
  // function scoped variables
  vErrors: new Se.Name("vErrors"),
  // null or array of validation errors
  errors: new Se.Name("errors"),
  // counter of validation errors
  this: new Se.Name("this"),
  // "globals"
  self: new Se.Name("self"),
  scope: new Se.Name("scope"),
  // JTD serialize/parse name for JSON string and position
  json: new Se.Name("json"),
  jsonPos: new Se.Name("jsonPos"),
  jsonLen: new Se.Name("jsonLen"),
  jsonPart: new Se.Name("jsonPart")
};
Le.default = Pd;
(function(e) {
  Object.defineProperty(e, "__esModule", { value: !0 }), e.extendErrors = e.resetErrorsCount = e.reportExtraError = e.reportError = e.keyword$DataError = e.keywordError = void 0;
  const t = W, r = A, n = Le;
  e.keywordError = {
    message: ({ keyword: _ }) => (0, t.str)`must pass "${_}" keyword validation`
  }, e.keyword$DataError = {
    message: ({ keyword: _, schemaType: m }) => m ? (0, t.str)`"${_}" keyword must be ${m} ($data)` : (0, t.str)`"${_}" keyword is invalid ($data)`
  };
  function s(_, m = e.keywordError, v, N) {
    const { it: R } = _, { gen: O, compositeRule: G, allErrors: B } = R, le = h(_, m, v);
    N ?? (G || B) ? l(O, le) : c(R, (0, t._)`[${le}]`);
  }
  e.reportError = s;
  function a(_, m = e.keywordError, v) {
    const { it: N } = _, { gen: R, compositeRule: O, allErrors: G } = N, B = h(_, m, v);
    l(R, B), O || G || c(N, n.default.vErrors);
  }
  e.reportExtraError = a;
  function o(_, m) {
    _.assign(n.default.errors, m), _.if((0, t._)`${n.default.vErrors} !== null`, () => _.if(m, () => _.assign((0, t._)`${n.default.vErrors}.length`, m), () => _.assign(n.default.vErrors, null)));
  }
  e.resetErrorsCount = o;
  function u({ gen: _, keyword: m, schemaValue: v, data: N, errsCount: R, it: O }) {
    if (R === void 0)
      throw new Error("ajv implementation error");
    const G = _.name("err");
    _.forRange("i", R, n.default.errors, (B) => {
      _.const(G, (0, t._)`${n.default.vErrors}[${B}]`), _.if((0, t._)`${G}.instancePath === undefined`, () => _.assign((0, t._)`${G}.instancePath`, (0, t.strConcat)(n.default.instancePath, O.errorPath))), _.assign((0, t._)`${G}.schemaPath`, (0, t.str)`${O.errSchemaPath}/${m}`), O.opts.verbose && (_.assign((0, t._)`${G}.schema`, v), _.assign((0, t._)`${G}.data`, N));
    });
  }
  e.extendErrors = u;
  function l(_, m) {
    const v = _.const("err", m);
    _.if((0, t._)`${n.default.vErrors} === null`, () => _.assign(n.default.vErrors, (0, t._)`[${v}]`), (0, t._)`${n.default.vErrors}.push(${v})`), _.code((0, t._)`${n.default.errors}++`);
  }
  function c(_, m) {
    const { gen: v, validateName: N, schemaEnv: R } = _;
    R.$async ? v.throw((0, t._)`new ${_.ValidationError}(${m})`) : (v.assign((0, t._)`${N}.errors`, m), v.return(!1));
  }
  const d = {
    keyword: new t.Name("keyword"),
    schemaPath: new t.Name("schemaPath"),
    // also used in JTD errors
    params: new t.Name("params"),
    propertyName: new t.Name("propertyName"),
    message: new t.Name("message"),
    schema: new t.Name("schema"),
    parentSchema: new t.Name("parentSchema")
  };
  function h(_, m, v) {
    const { createErrors: N } = _.it;
    return N === !1 ? (0, t._)`{}` : b(_, m, v);
  }
  function b(_, m, v = {}) {
    const { gen: N, it: R } = _, O = [
      g(R, v),
      y(_, v)
    ];
    return w(_, m, O), N.object(...O);
  }
  function g({ errorPath: _ }, { instancePath: m }) {
    const v = m ? (0, t.str)`${_}${(0, r.getErrorPath)(m, r.Type.Str)}` : _;
    return [n.default.instancePath, (0, t.strConcat)(n.default.instancePath, v)];
  }
  function y({ keyword: _, it: { errSchemaPath: m } }, { schemaPath: v, parentSchema: N }) {
    let R = N ? m : (0, t.str)`${m}/${_}`;
    return v && (R = (0, t.str)`${R}${(0, r.getErrorPath)(v, r.Type.Str)}`), [d.schemaPath, R];
  }
  function w(_, { params: m, message: v }, N) {
    const { keyword: R, data: O, schemaValue: G, it: B } = _, { opts: le, propertyName: fe, topSchemaRef: pe, schemaPath: z } = B;
    N.push([d.keyword, R], [d.params, typeof m == "function" ? m(_) : m || (0, t._)`{}`]), le.messages && N.push([d.message, typeof v == "function" ? v(_) : v]), le.verbose && N.push([d.schema, G], [d.parentSchema, (0, t._)`${pe}${z}`], [n.default.data, O]), fe && N.push([d.propertyName, fe]);
  }
})(nn);
Object.defineProperty($r, "__esModule", { value: !0 });
$r.boolOrEmptySchema = $r.topBoolOrEmptySchema = void 0;
const Nd = nn, Rd = W, Od = Le, Id = {
  message: "boolean schema is false"
};
function Td(e) {
  const { gen: t, schema: r, validateName: n } = e;
  r === !1 ? Jc(e, !1) : typeof r == "object" && r.$async === !0 ? t.return(Od.default.data) : (t.assign((0, Rd._)`${n}.errors`, null), t.return(!0));
}
$r.topBoolOrEmptySchema = Td;
function jd(e, t) {
  const { gen: r, schema: n } = e;
  n === !1 ? (r.var(t, !1), Jc(e)) : r.var(t, !0);
}
$r.boolOrEmptySchema = jd;
function Jc(e, t) {
  const { gen: r, data: n } = e, s = {
    gen: r,
    keyword: "false schema",
    data: n,
    schema: !1,
    schemaCode: !1,
    schemaValue: !1,
    params: {},
    it: e
  };
  (0, Nd.reportError)(s, Id, void 0, t);
}
var $e = {}, xt = {};
Object.defineProperty(xt, "__esModule", { value: !0 });
xt.getRules = xt.isJSONType = void 0;
const kd = ["string", "number", "integer", "boolean", "null", "object", "array"], Ad = new Set(kd);
function Cd(e) {
  return typeof e == "string" && Ad.has(e);
}
xt.isJSONType = Cd;
function Dd() {
  const e = {
    number: { type: "number", rules: [] },
    string: { type: "string", rules: [] },
    array: { type: "array", rules: [] },
    object: { type: "object", rules: [] }
  };
  return {
    types: { ...e, integer: !0, boolean: !0, null: !0 },
    rules: [{ rules: [] }, e.number, e.string, e.array, e.object],
    post: { rules: [] },
    all: {},
    keywords: {}
  };
}
xt.getRules = Dd;
var ct = {};
Object.defineProperty(ct, "__esModule", { value: !0 });
ct.shouldUseRule = ct.shouldUseGroup = ct.schemaHasRulesForType = void 0;
function Md({ schema: e, self: t }, r) {
  const n = t.RULES.types[r];
  return n && n !== !0 && Xc(e, n);
}
ct.schemaHasRulesForType = Md;
function Xc(e, t) {
  return t.rules.some((r) => Bc(e, r));
}
ct.shouldUseGroup = Xc;
function Bc(e, t) {
  var r;
  return e[t.keyword] !== void 0 || ((r = t.definition.implements) === null || r === void 0 ? void 0 : r.some((n) => e[n] !== void 0));
}
ct.shouldUseRule = Bc;
Object.defineProperty($e, "__esModule", { value: !0 });
$e.reportTypeError = $e.checkDataTypes = $e.checkDataType = $e.coerceAndCheckDataType = $e.getJSONTypes = $e.getSchemaTypes = $e.DataType = void 0;
const Vd = xt, Ld = ct, Fd = nn, Y = W, Wc = A;
var fr;
(function(e) {
  e[e.Correct = 0] = "Correct", e[e.Wrong = 1] = "Wrong";
})(fr || ($e.DataType = fr = {}));
function zd(e) {
  const t = Yc(e.type);
  if (t.includes("null")) {
    if (e.nullable === !1)
      throw new Error("type: null contradicts nullable: false");
  } else {
    if (!t.length && e.nullable !== void 0)
      throw new Error('"nullable" cannot be used without "type"');
    e.nullable === !0 && t.push("null");
  }
  return t;
}
$e.getSchemaTypes = zd;
function Yc(e) {
  const t = Array.isArray(e) ? e : e ? [e] : [];
  if (t.every(Vd.isJSONType))
    return t;
  throw new Error("type must be JSONType or JSONType[]: " + t.join(","));
}
$e.getJSONTypes = Yc;
function Ud(e, t) {
  const { gen: r, data: n, opts: s } = e, a = qd(t, s.coerceTypes), o = t.length > 0 && !(a.length === 0 && t.length === 1 && (0, Ld.schemaHasRulesForType)(e, t[0]));
  if (o) {
    const u = oa(t, n, s.strictNumbers, fr.Wrong);
    r.if(u, () => {
      a.length ? Gd(e, t, a) : ia(e);
    });
  }
  return o;
}
$e.coerceAndCheckDataType = Ud;
const Qc = /* @__PURE__ */ new Set(["string", "number", "integer", "boolean", "null"]);
function qd(e, t) {
  return t ? e.filter((r) => Qc.has(r) || t === "array" && r === "array") : [];
}
function Gd(e, t, r) {
  const { gen: n, data: s, opts: a } = e, o = n.let("dataType", (0, Y._)`typeof ${s}`), u = n.let("coerced", (0, Y._)`undefined`);
  a.coerceTypes === "array" && n.if((0, Y._)`${o} == 'object' && Array.isArray(${s}) && ${s}.length == 1`, () => n.assign(s, (0, Y._)`${s}[0]`).assign(o, (0, Y._)`typeof ${s}`).if(oa(t, s, a.strictNumbers), () => n.assign(u, s))), n.if((0, Y._)`${u} !== undefined`);
  for (const c of r)
    (Qc.has(c) || c === "array" && a.coerceTypes === "array") && l(c);
  n.else(), ia(e), n.endIf(), n.if((0, Y._)`${u} !== undefined`, () => {
    n.assign(s, u), Kd(e, u);
  });
  function l(c) {
    switch (c) {
      case "string":
        n.elseIf((0, Y._)`${o} == "number" || ${o} == "boolean"`).assign(u, (0, Y._)`"" + ${s}`).elseIf((0, Y._)`${s} === null`).assign(u, (0, Y._)`""`);
        return;
      case "number":
        n.elseIf((0, Y._)`${o} == "boolean" || ${s} === null
              || (${o} == "string" && ${s} && ${s} == +${s})`).assign(u, (0, Y._)`+${s}`);
        return;
      case "integer":
        n.elseIf((0, Y._)`${o} === "boolean" || ${s} === null
              || (${o} === "string" && ${s} && ${s} == +${s} && !(${s} % 1))`).assign(u, (0, Y._)`+${s}`);
        return;
      case "boolean":
        n.elseIf((0, Y._)`${s} === "false" || ${s} === 0 || ${s} === null`).assign(u, !1).elseIf((0, Y._)`${s} === "true" || ${s} === 1`).assign(u, !0);
        return;
      case "null":
        n.elseIf((0, Y._)`${s} === "" || ${s} === 0 || ${s} === false`), n.assign(u, null);
        return;
      case "array":
        n.elseIf((0, Y._)`${o} === "string" || ${o} === "number"
              || ${o} === "boolean" || ${s} === null`).assign(u, (0, Y._)`[${s}]`);
    }
  }
}
function Kd({ gen: e, parentData: t, parentDataProperty: r }, n) {
  e.if((0, Y._)`${t} !== undefined`, () => e.assign((0, Y._)`${t}[${r}]`, n));
}
function Vs(e, t, r, n = fr.Correct) {
  const s = n === fr.Correct ? Y.operators.EQ : Y.operators.NEQ;
  let a;
  switch (e) {
    case "null":
      return (0, Y._)`${t} ${s} null`;
    case "array":
      a = (0, Y._)`Array.isArray(${t})`;
      break;
    case "object":
      a = (0, Y._)`${t} && typeof ${t} == "object" && !Array.isArray(${t})`;
      break;
    case "integer":
      a = o((0, Y._)`!(${t} % 1) && !isNaN(${t})`);
      break;
    case "number":
      a = o();
      break;
    default:
      return (0, Y._)`typeof ${t} ${s} ${e}`;
  }
  return n === fr.Correct ? a : (0, Y.not)(a);
  function o(u = Y.nil) {
    return (0, Y.and)((0, Y._)`typeof ${t} == "number"`, u, r ? (0, Y._)`isFinite(${t})` : Y.nil);
  }
}
$e.checkDataType = Vs;
function oa(e, t, r, n) {
  if (e.length === 1)
    return Vs(e[0], t, r, n);
  let s;
  const a = (0, Wc.toHash)(e);
  if (a.array && a.object) {
    const o = (0, Y._)`typeof ${t} != "object"`;
    s = a.null ? o : (0, Y._)`!${t} || ${o}`, delete a.null, delete a.array, delete a.object;
  } else
    s = Y.nil;
  a.number && delete a.integer;
  for (const o in a)
    s = (0, Y.and)(s, Vs(o, t, r, n));
  return s;
}
$e.checkDataTypes = oa;
const Hd = {
  message: ({ schema: e }) => `must be ${e}`,
  params: ({ schema: e, schemaValue: t }) => typeof e == "string" ? (0, Y._)`{type: ${e}}` : (0, Y._)`{type: ${t}}`
};
function ia(e) {
  const t = Jd(e);
  (0, Fd.reportError)(t, Hd);
}
$e.reportTypeError = ia;
function Jd(e) {
  const { gen: t, data: r, schema: n } = e, s = (0, Wc.schemaRefOrVal)(e, n, "type");
  return {
    gen: t,
    keyword: "type",
    data: r,
    schema: n.type,
    schemaCode: s,
    schemaValue: s,
    parentSchema: n,
    params: {},
    it: e
  };
}
var Wn = {};
Object.defineProperty(Wn, "__esModule", { value: !0 });
Wn.assignDefaults = void 0;
const rr = W, Xd = A;
function Bd(e, t) {
  const { properties: r, items: n } = e.schema;
  if (t === "object" && r)
    for (const s in r)
      di(e, s, r[s].default);
  else t === "array" && Array.isArray(n) && n.forEach((s, a) => di(e, a, s.default));
}
Wn.assignDefaults = Bd;
function di(e, t, r) {
  const { gen: n, compositeRule: s, data: a, opts: o } = e;
  if (r === void 0)
    return;
  const u = (0, rr._)`${a}${(0, rr.getProperty)(t)}`;
  if (s) {
    (0, Xd.checkStrictMode)(e, `default is ignored for: ${u}`);
    return;
  }
  let l = (0, rr._)`${u} === undefined`;
  o.useDefaults === "empty" && (l = (0, rr._)`${l} || ${u} === null || ${u} === ""`), n.if(l, (0, rr._)`${u} = ${(0, rr.stringify)(r)}`);
}
var tt = {}, ee = {};
Object.defineProperty(ee, "__esModule", { value: !0 });
ee.validateUnion = ee.validateArray = ee.usePattern = ee.callValidateCode = ee.schemaProperties = ee.allSchemaProperties = ee.noPropertyInData = ee.propertyInData = ee.isOwnProperty = ee.hasPropFunc = ee.reportMissingProp = ee.checkMissingProp = ee.checkReportMissingProp = void 0;
const ie = W, ca = A, yt = Le, Wd = A;
function Yd(e, t) {
  const { gen: r, data: n, it: s } = e;
  r.if(ua(r, n, t, s.opts.ownProperties), () => {
    e.setParams({ missingProperty: (0, ie._)`${t}` }, !0), e.error();
  });
}
ee.checkReportMissingProp = Yd;
function Qd({ gen: e, data: t, it: { opts: r } }, n, s) {
  return (0, ie.or)(...n.map((a) => (0, ie.and)(ua(e, t, a, r.ownProperties), (0, ie._)`${s} = ${a}`)));
}
ee.checkMissingProp = Qd;
function Zd(e, t) {
  e.setParams({ missingProperty: t }, !0), e.error();
}
ee.reportMissingProp = Zd;
function Zc(e) {
  return e.scopeValue("func", {
    // eslint-disable-next-line @typescript-eslint/unbound-method
    ref: Object.prototype.hasOwnProperty,
    code: (0, ie._)`Object.prototype.hasOwnProperty`
  });
}
ee.hasPropFunc = Zc;
function la(e, t, r) {
  return (0, ie._)`${Zc(e)}.call(${t}, ${r})`;
}
ee.isOwnProperty = la;
function xd(e, t, r, n) {
  const s = (0, ie._)`${t}${(0, ie.getProperty)(r)} !== undefined`;
  return n ? (0, ie._)`${s} && ${la(e, t, r)}` : s;
}
ee.propertyInData = xd;
function ua(e, t, r, n) {
  const s = (0, ie._)`${t}${(0, ie.getProperty)(r)} === undefined`;
  return n ? (0, ie.or)(s, (0, ie.not)(la(e, t, r))) : s;
}
ee.noPropertyInData = ua;
function xc(e) {
  return e ? Object.keys(e).filter((t) => t !== "__proto__") : [];
}
ee.allSchemaProperties = xc;
function ef(e, t) {
  return xc(t).filter((r) => !(0, ca.alwaysValidSchema)(e, t[r]));
}
ee.schemaProperties = ef;
function tf({ schemaCode: e, data: t, it: { gen: r, topSchemaRef: n, schemaPath: s, errorPath: a }, it: o }, u, l, c) {
  const d = c ? (0, ie._)`${e}, ${t}, ${n}${s}` : t, h = [
    [yt.default.instancePath, (0, ie.strConcat)(yt.default.instancePath, a)],
    [yt.default.parentData, o.parentData],
    [yt.default.parentDataProperty, o.parentDataProperty],
    [yt.default.rootData, yt.default.rootData]
  ];
  o.opts.dynamicRef && h.push([yt.default.dynamicAnchors, yt.default.dynamicAnchors]);
  const b = (0, ie._)`${d}, ${r.object(...h)}`;
  return l !== ie.nil ? (0, ie._)`${u}.call(${l}, ${b})` : (0, ie._)`${u}(${b})`;
}
ee.callValidateCode = tf;
const rf = (0, ie._)`new RegExp`;
function nf({ gen: e, it: { opts: t } }, r) {
  const n = t.unicodeRegExp ? "u" : "", { regExp: s } = t.code, a = s(r, n);
  return e.scopeValue("pattern", {
    key: a.toString(),
    ref: a,
    code: (0, ie._)`${s.code === "new RegExp" ? rf : (0, Wd.useFunc)(e, s)}(${r}, ${n})`
  });
}
ee.usePattern = nf;
function sf(e) {
  const { gen: t, data: r, keyword: n, it: s } = e, a = t.name("valid");
  if (s.allErrors) {
    const u = t.let("valid", !0);
    return o(() => t.assign(u, !1)), u;
  }
  return t.var(a, !0), o(() => t.break()), a;
  function o(u) {
    const l = t.const("len", (0, ie._)`${r}.length`);
    t.forRange("i", 0, l, (c) => {
      e.subschema({
        keyword: n,
        dataProp: c,
        dataPropType: ca.Type.Num
      }, a), t.if((0, ie.not)(a), u);
    });
  }
}
ee.validateArray = sf;
function af(e) {
  const { gen: t, schema: r, keyword: n, it: s } = e;
  if (!Array.isArray(r))
    throw new Error("ajv implementation error");
  if (r.some((l) => (0, ca.alwaysValidSchema)(s, l)) && !s.opts.unevaluated)
    return;
  const o = t.let("valid", !1), u = t.name("_valid");
  t.block(() => r.forEach((l, c) => {
    const d = e.subschema({
      keyword: n,
      schemaProp: c,
      compositeRule: !0
    }, u);
    t.assign(o, (0, ie._)`${o} || ${u}`), e.mergeValidEvaluated(d, u) || t.if((0, ie.not)(o));
  })), e.result(o, () => e.reset(), () => e.error(!0));
}
ee.validateUnion = af;
Object.defineProperty(tt, "__esModule", { value: !0 });
tt.validateKeywordUsage = tt.validSchemaType = tt.funcKeywordCode = tt.macroKeywordCode = void 0;
const Oe = W, Ht = Le, of = ee, cf = nn;
function lf(e, t) {
  const { gen: r, keyword: n, schema: s, parentSchema: a, it: o } = e, u = t.macro.call(o.self, s, a, o), l = el(r, n, u);
  o.opts.validateSchema !== !1 && o.self.validateSchema(u, !0);
  const c = r.name("valid");
  e.subschema({
    schema: u,
    schemaPath: Oe.nil,
    errSchemaPath: `${o.errSchemaPath}/${n}`,
    topSchemaRef: l,
    compositeRule: !0
  }, c), e.pass(c, () => e.error(!0));
}
tt.macroKeywordCode = lf;
function uf(e, t) {
  var r;
  const { gen: n, keyword: s, schema: a, parentSchema: o, $data: u, it: l } = e;
  ff(l, t);
  const c = !u && t.compile ? t.compile.call(l.self, a, o, l) : t.validate, d = el(n, s, c), h = n.let("valid");
  e.block$data(h, b), e.ok((r = t.valid) !== null && r !== void 0 ? r : h);
  function b() {
    if (t.errors === !1)
      w(), t.modifying && fi(e), _(() => e.error());
    else {
      const m = t.async ? g() : y();
      t.modifying && fi(e), _(() => df(e, m));
    }
  }
  function g() {
    const m = n.let("ruleErrs", null);
    return n.try(() => w((0, Oe._)`await `), (v) => n.assign(h, !1).if((0, Oe._)`${v} instanceof ${l.ValidationError}`, () => n.assign(m, (0, Oe._)`${v}.errors`), () => n.throw(v))), m;
  }
  function y() {
    const m = (0, Oe._)`${d}.errors`;
    return n.assign(m, null), w(Oe.nil), m;
  }
  function w(m = t.async ? (0, Oe._)`await ` : Oe.nil) {
    const v = l.opts.passContext ? Ht.default.this : Ht.default.self, N = !("compile" in t && !u || t.schema === !1);
    n.assign(h, (0, Oe._)`${m}${(0, of.callValidateCode)(e, d, v, N)}`, t.modifying);
  }
  function _(m) {
    var v;
    n.if((0, Oe.not)((v = t.valid) !== null && v !== void 0 ? v : h), m);
  }
}
tt.funcKeywordCode = uf;
function fi(e) {
  const { gen: t, data: r, it: n } = e;
  t.if(n.parentData, () => t.assign(r, (0, Oe._)`${n.parentData}[${n.parentDataProperty}]`));
}
function df(e, t) {
  const { gen: r } = e;
  r.if((0, Oe._)`Array.isArray(${t})`, () => {
    r.assign(Ht.default.vErrors, (0, Oe._)`${Ht.default.vErrors} === null ? ${t} : ${Ht.default.vErrors}.concat(${t})`).assign(Ht.default.errors, (0, Oe._)`${Ht.default.vErrors}.length`), (0, cf.extendErrors)(e);
  }, () => e.error());
}
function ff({ schemaEnv: e }, t) {
  if (t.async && !e.$async)
    throw new Error("async keyword in sync schema");
}
function el(e, t, r) {
  if (r === void 0)
    throw new Error(`keyword "${t}" failed to compile`);
  return e.scopeValue("keyword", typeof r == "function" ? { ref: r } : { ref: r, code: (0, Oe.stringify)(r) });
}
function hf(e, t, r = !1) {
  return !t.length || t.some((n) => n === "array" ? Array.isArray(e) : n === "object" ? e && typeof e == "object" && !Array.isArray(e) : typeof e == n || r && typeof e > "u");
}
tt.validSchemaType = hf;
function mf({ schema: e, opts: t, self: r, errSchemaPath: n }, s, a) {
  if (Array.isArray(s.keyword) ? !s.keyword.includes(a) : s.keyword !== a)
    throw new Error("ajv implementation error");
  const o = s.dependencies;
  if (o != null && o.some((u) => !Object.prototype.hasOwnProperty.call(e, u)))
    throw new Error(`parent schema must have dependencies of ${a}: ${o.join(",")}`);
  if (s.validateSchema && !s.validateSchema(e[a])) {
    const l = `keyword "${a}" value is invalid at path "${n}": ` + r.errorsText(s.validateSchema.errors);
    if (t.validateSchema === "log")
      r.logger.error(l);
    else
      throw new Error(l);
  }
}
tt.validateKeywordUsage = mf;
var Rt = {};
Object.defineProperty(Rt, "__esModule", { value: !0 });
Rt.extendSubschemaMode = Rt.extendSubschemaData = Rt.getSubschema = void 0;
const xe = W, tl = A;
function pf(e, { keyword: t, schemaProp: r, schema: n, schemaPath: s, errSchemaPath: a, topSchemaRef: o }) {
  if (t !== void 0 && n !== void 0)
    throw new Error('both "keyword" and "schema" passed, only one allowed');
  if (t !== void 0) {
    const u = e.schema[t];
    return r === void 0 ? {
      schema: u,
      schemaPath: (0, xe._)`${e.schemaPath}${(0, xe.getProperty)(t)}`,
      errSchemaPath: `${e.errSchemaPath}/${t}`
    } : {
      schema: u[r],
      schemaPath: (0, xe._)`${e.schemaPath}${(0, xe.getProperty)(t)}${(0, xe.getProperty)(r)}`,
      errSchemaPath: `${e.errSchemaPath}/${t}/${(0, tl.escapeFragment)(r)}`
    };
  }
  if (n !== void 0) {
    if (s === void 0 || a === void 0 || o === void 0)
      throw new Error('"schemaPath", "errSchemaPath" and "topSchemaRef" are required with "schema"');
    return {
      schema: n,
      schemaPath: s,
      topSchemaRef: o,
      errSchemaPath: a
    };
  }
  throw new Error('either "keyword" or "schema" must be passed');
}
Rt.getSubschema = pf;
function $f(e, t, { dataProp: r, dataPropType: n, data: s, dataTypes: a, propertyName: o }) {
  if (s !== void 0 && r !== void 0)
    throw new Error('both "data" and "dataProp" passed, only one allowed');
  const { gen: u } = t;
  if (r !== void 0) {
    const { errorPath: c, dataPathArr: d, opts: h } = t, b = u.let("data", (0, xe._)`${t.data}${(0, xe.getProperty)(r)}`, !0);
    l(b), e.errorPath = (0, xe.str)`${c}${(0, tl.getErrorPath)(r, n, h.jsPropertySyntax)}`, e.parentDataProperty = (0, xe._)`${r}`, e.dataPathArr = [...d, e.parentDataProperty];
  }
  if (s !== void 0) {
    const c = s instanceof xe.Name ? s : u.let("data", s, !0);
    l(c), o !== void 0 && (e.propertyName = o);
  }
  a && (e.dataTypes = a);
  function l(c) {
    e.data = c, e.dataLevel = t.dataLevel + 1, e.dataTypes = [], t.definedProperties = /* @__PURE__ */ new Set(), e.parentData = t.data, e.dataNames = [...t.dataNames, c];
  }
}
Rt.extendSubschemaData = $f;
function yf(e, { jtdDiscriminator: t, jtdMetadata: r, compositeRule: n, createErrors: s, allErrors: a }) {
  n !== void 0 && (e.compositeRule = n), s !== void 0 && (e.createErrors = s), a !== void 0 && (e.allErrors = a), e.jtdDiscriminator = t, e.jtdMetadata = r;
}
Rt.extendSubschemaMode = yf;
var we = {}, Yn = function e(t, r) {
  if (t === r) return !0;
  if (t && r && typeof t == "object" && typeof r == "object") {
    if (t.constructor !== r.constructor) return !1;
    var n, s, a;
    if (Array.isArray(t)) {
      if (n = t.length, n != r.length) return !1;
      for (s = n; s-- !== 0; )
        if (!e(t[s], r[s])) return !1;
      return !0;
    }
    if (t.constructor === RegExp) return t.source === r.source && t.flags === r.flags;
    if (t.valueOf !== Object.prototype.valueOf) return t.valueOf() === r.valueOf();
    if (t.toString !== Object.prototype.toString) return t.toString() === r.toString();
    if (a = Object.keys(t), n = a.length, n !== Object.keys(r).length) return !1;
    for (s = n; s-- !== 0; )
      if (!Object.prototype.hasOwnProperty.call(r, a[s])) return !1;
    for (s = n; s-- !== 0; ) {
      var o = a[s];
      if (!e(t[o], r[o])) return !1;
    }
    return !0;
  }
  return t !== t && r !== r;
}, rl = { exports: {} }, St = rl.exports = function(e, t, r) {
  typeof t == "function" && (r = t, t = {}), r = t.cb || r;
  var n = typeof r == "function" ? r : r.pre || function() {
  }, s = r.post || function() {
  };
  Rn(t, n, s, e, "", e);
};
St.keywords = {
  additionalItems: !0,
  items: !0,
  contains: !0,
  additionalProperties: !0,
  propertyNames: !0,
  not: !0,
  if: !0,
  then: !0,
  else: !0
};
St.arrayKeywords = {
  items: !0,
  allOf: !0,
  anyOf: !0,
  oneOf: !0
};
St.propsKeywords = {
  $defs: !0,
  definitions: !0,
  properties: !0,
  patternProperties: !0,
  dependencies: !0
};
St.skipKeywords = {
  default: !0,
  enum: !0,
  const: !0,
  required: !0,
  maximum: !0,
  minimum: !0,
  exclusiveMaximum: !0,
  exclusiveMinimum: !0,
  multipleOf: !0,
  maxLength: !0,
  minLength: !0,
  pattern: !0,
  format: !0,
  maxItems: !0,
  minItems: !0,
  uniqueItems: !0,
  maxProperties: !0,
  minProperties: !0
};
function Rn(e, t, r, n, s, a, o, u, l, c) {
  if (n && typeof n == "object" && !Array.isArray(n)) {
    t(n, s, a, o, u, l, c);
    for (var d in n) {
      var h = n[d];
      if (Array.isArray(h)) {
        if (d in St.arrayKeywords)
          for (var b = 0; b < h.length; b++)
            Rn(e, t, r, h[b], s + "/" + d + "/" + b, a, s, d, n, b);
      } else if (d in St.propsKeywords) {
        if (h && typeof h == "object")
          for (var g in h)
            Rn(e, t, r, h[g], s + "/" + d + "/" + _f(g), a, s, d, n, g);
      } else (d in St.keywords || e.allKeys && !(d in St.skipKeywords)) && Rn(e, t, r, h, s + "/" + d, a, s, d, n);
    }
    r(n, s, a, o, u, l, c);
  }
}
function _f(e) {
  return e.replace(/~/g, "~0").replace(/\//g, "~1");
}
var gf = rl.exports;
Object.defineProperty(we, "__esModule", { value: !0 });
we.getSchemaRefs = we.resolveUrl = we.normalizeId = we._getFullPath = we.getFullPath = we.inlineRef = void 0;
const vf = A, wf = Yn, Ef = gf, bf = /* @__PURE__ */ new Set([
  "type",
  "format",
  "pattern",
  "maxLength",
  "minLength",
  "maxProperties",
  "minProperties",
  "maxItems",
  "minItems",
  "maximum",
  "minimum",
  "uniqueItems",
  "multipleOf",
  "required",
  "enum",
  "const"
]);
function Sf(e, t = !0) {
  return typeof e == "boolean" ? !0 : t === !0 ? !Ls(e) : t ? nl(e) <= t : !1;
}
we.inlineRef = Sf;
const Pf = /* @__PURE__ */ new Set([
  "$ref",
  "$recursiveRef",
  "$recursiveAnchor",
  "$dynamicRef",
  "$dynamicAnchor"
]);
function Ls(e) {
  for (const t in e) {
    if (Pf.has(t))
      return !0;
    const r = e[t];
    if (Array.isArray(r) && r.some(Ls) || typeof r == "object" && Ls(r))
      return !0;
  }
  return !1;
}
function nl(e) {
  let t = 0;
  for (const r in e) {
    if (r === "$ref")
      return 1 / 0;
    if (t++, !bf.has(r) && (typeof e[r] == "object" && (0, vf.eachItem)(e[r], (n) => t += nl(n)), t === 1 / 0))
      return 1 / 0;
  }
  return t;
}
function sl(e, t = "", r) {
  r !== !1 && (t = hr(t));
  const n = e.parse(t);
  return al(e, n);
}
we.getFullPath = sl;
function al(e, t) {
  return e.serialize(t).split("#")[0] + "#";
}
we._getFullPath = al;
const Nf = /#\/?$/;
function hr(e) {
  return e ? e.replace(Nf, "") : "";
}
we.normalizeId = hr;
function Rf(e, t, r) {
  return r = hr(r), e.resolve(t, r);
}
we.resolveUrl = Rf;
const Of = /^[a-z_][-a-z0-9._]*$/i;
function If(e, t) {
  if (typeof e == "boolean")
    return {};
  const { schemaId: r, uriResolver: n } = this.opts, s = hr(e[r] || t), a = { "": s }, o = sl(n, s, !1), u = {}, l = /* @__PURE__ */ new Set();
  return Ef(e, { allKeys: !0 }, (h, b, g, y) => {
    if (y === void 0)
      return;
    const w = o + b;
    let _ = a[y];
    typeof h[r] == "string" && (_ = m.call(this, h[r])), v.call(this, h.$anchor), v.call(this, h.$dynamicAnchor), a[b] = _;
    function m(N) {
      const R = this.opts.uriResolver.resolve;
      if (N = hr(_ ? R(_, N) : N), l.has(N))
        throw d(N);
      l.add(N);
      let O = this.refs[N];
      return typeof O == "string" && (O = this.refs[O]), typeof O == "object" ? c(h, O.schema, N) : N !== hr(w) && (N[0] === "#" ? (c(h, u[N], N), u[N] = h) : this.refs[N] = w), N;
    }
    function v(N) {
      if (typeof N == "string") {
        if (!Of.test(N))
          throw new Error(`invalid anchor "${N}"`);
        m.call(this, `#${N}`);
      }
    }
  }), u;
  function c(h, b, g) {
    if (b !== void 0 && !wf(h, b))
      throw d(g);
  }
  function d(h) {
    return new Error(`reference "${h}" resolves to more than one schema`);
  }
}
we.getSchemaRefs = If;
Object.defineProperty(Be, "__esModule", { value: !0 });
Be.getData = Be.KeywordCxt = Be.validateFunctionCode = void 0;
const ol = $r, hi = $e, da = ct, Vn = $e, Tf = Wn, Kr = tt, $s = Rt, U = W, J = Le, jf = we, lt = A, Dr = nn;
function kf(e) {
  if (ll(e) && (ul(e), cl(e))) {
    Df(e);
    return;
  }
  il(e, () => (0, ol.topBoolOrEmptySchema)(e));
}
Be.validateFunctionCode = kf;
function il({ gen: e, validateName: t, schema: r, schemaEnv: n, opts: s }, a) {
  s.code.es5 ? e.func(t, (0, U._)`${J.default.data}, ${J.default.valCxt}`, n.$async, () => {
    e.code((0, U._)`"use strict"; ${mi(r, s)}`), Cf(e, s), e.code(a);
  }) : e.func(t, (0, U._)`${J.default.data}, ${Af(s)}`, n.$async, () => e.code(mi(r, s)).code(a));
}
function Af(e) {
  return (0, U._)`{${J.default.instancePath}="", ${J.default.parentData}, ${J.default.parentDataProperty}, ${J.default.rootData}=${J.default.data}${e.dynamicRef ? (0, U._)`, ${J.default.dynamicAnchors}={}` : U.nil}}={}`;
}
function Cf(e, t) {
  e.if(J.default.valCxt, () => {
    e.var(J.default.instancePath, (0, U._)`${J.default.valCxt}.${J.default.instancePath}`), e.var(J.default.parentData, (0, U._)`${J.default.valCxt}.${J.default.parentData}`), e.var(J.default.parentDataProperty, (0, U._)`${J.default.valCxt}.${J.default.parentDataProperty}`), e.var(J.default.rootData, (0, U._)`${J.default.valCxt}.${J.default.rootData}`), t.dynamicRef && e.var(J.default.dynamicAnchors, (0, U._)`${J.default.valCxt}.${J.default.dynamicAnchors}`);
  }, () => {
    e.var(J.default.instancePath, (0, U._)`""`), e.var(J.default.parentData, (0, U._)`undefined`), e.var(J.default.parentDataProperty, (0, U._)`undefined`), e.var(J.default.rootData, J.default.data), t.dynamicRef && e.var(J.default.dynamicAnchors, (0, U._)`{}`);
  });
}
function Df(e) {
  const { schema: t, opts: r, gen: n } = e;
  il(e, () => {
    r.$comment && t.$comment && fl(e), zf(e), n.let(J.default.vErrors, null), n.let(J.default.errors, 0), r.unevaluated && Mf(e), dl(e), Gf(e);
  });
}
function Mf(e) {
  const { gen: t, validateName: r } = e;
  e.evaluated = t.const("evaluated", (0, U._)`${r}.evaluated`), t.if((0, U._)`${e.evaluated}.dynamicProps`, () => t.assign((0, U._)`${e.evaluated}.props`, (0, U._)`undefined`)), t.if((0, U._)`${e.evaluated}.dynamicItems`, () => t.assign((0, U._)`${e.evaluated}.items`, (0, U._)`undefined`));
}
function mi(e, t) {
  const r = typeof e == "object" && e[t.schemaId];
  return r && (t.code.source || t.code.process) ? (0, U._)`/*# sourceURL=${r} */` : U.nil;
}
function Vf(e, t) {
  if (ll(e) && (ul(e), cl(e))) {
    Lf(e, t);
    return;
  }
  (0, ol.boolOrEmptySchema)(e, t);
}
function cl({ schema: e, self: t }) {
  if (typeof e == "boolean")
    return !e;
  for (const r in e)
    if (t.RULES.all[r])
      return !0;
  return !1;
}
function ll(e) {
  return typeof e.schema != "boolean";
}
function Lf(e, t) {
  const { schema: r, gen: n, opts: s } = e;
  s.$comment && r.$comment && fl(e), Uf(e), qf(e);
  const a = n.const("_errs", J.default.errors);
  dl(e, a), n.var(t, (0, U._)`${a} === ${J.default.errors}`);
}
function ul(e) {
  (0, lt.checkUnknownRules)(e), Ff(e);
}
function dl(e, t) {
  if (e.opts.jtd)
    return pi(e, [], !1, t);
  const r = (0, hi.getSchemaTypes)(e.schema), n = (0, hi.coerceAndCheckDataType)(e, r);
  pi(e, r, !n, t);
}
function Ff(e) {
  const { schema: t, errSchemaPath: r, opts: n, self: s } = e;
  t.$ref && n.ignoreKeywordsWithRef && (0, lt.schemaHasRulesButRef)(t, s.RULES) && s.logger.warn(`$ref: keywords ignored in schema at path "${r}"`);
}
function zf(e) {
  const { schema: t, opts: r } = e;
  t.default !== void 0 && r.useDefaults && r.strictSchema && (0, lt.checkStrictMode)(e, "default is ignored in the schema root");
}
function Uf(e) {
  const t = e.schema[e.opts.schemaId];
  t && (e.baseId = (0, jf.resolveUrl)(e.opts.uriResolver, e.baseId, t));
}
function qf(e) {
  if (e.schema.$async && !e.schemaEnv.$async)
    throw new Error("async schema in sync schema");
}
function fl({ gen: e, schemaEnv: t, schema: r, errSchemaPath: n, opts: s }) {
  const a = r.$comment;
  if (s.$comment === !0)
    e.code((0, U._)`${J.default.self}.logger.log(${a})`);
  else if (typeof s.$comment == "function") {
    const o = (0, U.str)`${n}/$comment`, u = e.scopeValue("root", { ref: t.root });
    e.code((0, U._)`${J.default.self}.opts.$comment(${a}, ${o}, ${u}.schema)`);
  }
}
function Gf(e) {
  const { gen: t, schemaEnv: r, validateName: n, ValidationError: s, opts: a } = e;
  r.$async ? t.if((0, U._)`${J.default.errors} === 0`, () => t.return(J.default.data), () => t.throw((0, U._)`new ${s}(${J.default.vErrors})`)) : (t.assign((0, U._)`${n}.errors`, J.default.vErrors), a.unevaluated && Kf(e), t.return((0, U._)`${J.default.errors} === 0`));
}
function Kf({ gen: e, evaluated: t, props: r, items: n }) {
  r instanceof U.Name && e.assign((0, U._)`${t}.props`, r), n instanceof U.Name && e.assign((0, U._)`${t}.items`, n);
}
function pi(e, t, r, n) {
  const { gen: s, schema: a, data: o, allErrors: u, opts: l, self: c } = e, { RULES: d } = c;
  if (a.$ref && (l.ignoreKeywordsWithRef || !(0, lt.schemaHasRulesButRef)(a, d))) {
    s.block(() => pl(e, "$ref", d.all.$ref.definition));
    return;
  }
  l.jtd || Hf(e, t), s.block(() => {
    for (const b of d.rules)
      h(b);
    h(d.post);
  });
  function h(b) {
    (0, da.shouldUseGroup)(a, b) && (b.type ? (s.if((0, Vn.checkDataType)(b.type, o, l.strictNumbers)), $i(e, b), t.length === 1 && t[0] === b.type && r && (s.else(), (0, Vn.reportTypeError)(e)), s.endIf()) : $i(e, b), u || s.if((0, U._)`${J.default.errors} === ${n || 0}`));
  }
}
function $i(e, t) {
  const { gen: r, schema: n, opts: { useDefaults: s } } = e;
  s && (0, Tf.assignDefaults)(e, t.type), r.block(() => {
    for (const a of t.rules)
      (0, da.shouldUseRule)(n, a) && pl(e, a.keyword, a.definition, t.type);
  });
}
function Hf(e, t) {
  e.schemaEnv.meta || !e.opts.strictTypes || (Jf(e, t), e.opts.allowUnionTypes || Xf(e, t), Bf(e, e.dataTypes));
}
function Jf(e, t) {
  if (t.length) {
    if (!e.dataTypes.length) {
      e.dataTypes = t;
      return;
    }
    t.forEach((r) => {
      hl(e.dataTypes, r) || fa(e, `type "${r}" not allowed by context "${e.dataTypes.join(",")}"`);
    }), Yf(e, t);
  }
}
function Xf(e, t) {
  t.length > 1 && !(t.length === 2 && t.includes("null")) && fa(e, "use allowUnionTypes to allow union type keyword");
}
function Bf(e, t) {
  const r = e.self.RULES.all;
  for (const n in r) {
    const s = r[n];
    if (typeof s == "object" && (0, da.shouldUseRule)(e.schema, s)) {
      const { type: a } = s.definition;
      a.length && !a.some((o) => Wf(t, o)) && fa(e, `missing type "${a.join(",")}" for keyword "${n}"`);
    }
  }
}
function Wf(e, t) {
  return e.includes(t) || t === "number" && e.includes("integer");
}
function hl(e, t) {
  return e.includes(t) || t === "integer" && e.includes("number");
}
function Yf(e, t) {
  const r = [];
  for (const n of e.dataTypes)
    hl(t, n) ? r.push(n) : t.includes("integer") && n === "number" && r.push("integer");
  e.dataTypes = r;
}
function fa(e, t) {
  const r = e.schemaEnv.baseId + e.errSchemaPath;
  t += ` at "${r}" (strictTypes)`, (0, lt.checkStrictMode)(e, t, e.opts.strictTypes);
}
let ml = class {
  constructor(t, r, n) {
    if ((0, Kr.validateKeywordUsage)(t, r, n), this.gen = t.gen, this.allErrors = t.allErrors, this.keyword = n, this.data = t.data, this.schema = t.schema[n], this.$data = r.$data && t.opts.$data && this.schema && this.schema.$data, this.schemaValue = (0, lt.schemaRefOrVal)(t, this.schema, n, this.$data), this.schemaType = r.schemaType, this.parentSchema = t.schema, this.params = {}, this.it = t, this.def = r, this.$data)
      this.schemaCode = t.gen.const("vSchema", $l(this.$data, t));
    else if (this.schemaCode = this.schemaValue, !(0, Kr.validSchemaType)(this.schema, r.schemaType, r.allowUndefined))
      throw new Error(`${n} value must be ${JSON.stringify(r.schemaType)}`);
    ("code" in r ? r.trackErrors : r.errors !== !1) && (this.errsCount = t.gen.const("_errs", J.default.errors));
  }
  result(t, r, n) {
    this.failResult((0, U.not)(t), r, n);
  }
  failResult(t, r, n) {
    this.gen.if(t), n ? n() : this.error(), r ? (this.gen.else(), r(), this.allErrors && this.gen.endIf()) : this.allErrors ? this.gen.endIf() : this.gen.else();
  }
  pass(t, r) {
    this.failResult((0, U.not)(t), void 0, r);
  }
  fail(t) {
    if (t === void 0) {
      this.error(), this.allErrors || this.gen.if(!1);
      return;
    }
    this.gen.if(t), this.error(), this.allErrors ? this.gen.endIf() : this.gen.else();
  }
  fail$data(t) {
    if (!this.$data)
      return this.fail(t);
    const { schemaCode: r } = this;
    this.fail((0, U._)`${r} !== undefined && (${(0, U.or)(this.invalid$data(), t)})`);
  }
  error(t, r, n) {
    if (r) {
      this.setParams(r), this._error(t, n), this.setParams({});
      return;
    }
    this._error(t, n);
  }
  _error(t, r) {
    (t ? Dr.reportExtraError : Dr.reportError)(this, this.def.error, r);
  }
  $dataError() {
    (0, Dr.reportError)(this, this.def.$dataError || Dr.keyword$DataError);
  }
  reset() {
    if (this.errsCount === void 0)
      throw new Error('add "trackErrors" to keyword definition');
    (0, Dr.resetErrorsCount)(this.gen, this.errsCount);
  }
  ok(t) {
    this.allErrors || this.gen.if(t);
  }
  setParams(t, r) {
    r ? Object.assign(this.params, t) : this.params = t;
  }
  block$data(t, r, n = U.nil) {
    this.gen.block(() => {
      this.check$data(t, n), r();
    });
  }
  check$data(t = U.nil, r = U.nil) {
    if (!this.$data)
      return;
    const { gen: n, schemaCode: s, schemaType: a, def: o } = this;
    n.if((0, U.or)((0, U._)`${s} === undefined`, r)), t !== U.nil && n.assign(t, !0), (a.length || o.validateSchema) && (n.elseIf(this.invalid$data()), this.$dataError(), t !== U.nil && n.assign(t, !1)), n.else();
  }
  invalid$data() {
    const { gen: t, schemaCode: r, schemaType: n, def: s, it: a } = this;
    return (0, U.or)(o(), u());
    function o() {
      if (n.length) {
        if (!(r instanceof U.Name))
          throw new Error("ajv implementation error");
        const l = Array.isArray(n) ? n : [n];
        return (0, U._)`${(0, Vn.checkDataTypes)(l, r, a.opts.strictNumbers, Vn.DataType.Wrong)}`;
      }
      return U.nil;
    }
    function u() {
      if (s.validateSchema) {
        const l = t.scopeValue("validate$data", { ref: s.validateSchema });
        return (0, U._)`!${l}(${r})`;
      }
      return U.nil;
    }
  }
  subschema(t, r) {
    const n = (0, $s.getSubschema)(this.it, t);
    (0, $s.extendSubschemaData)(n, this.it, t), (0, $s.extendSubschemaMode)(n, t);
    const s = { ...this.it, ...n, items: void 0, props: void 0 };
    return Vf(s, r), s;
  }
  mergeEvaluated(t, r) {
    const { it: n, gen: s } = this;
    n.opts.unevaluated && (n.props !== !0 && t.props !== void 0 && (n.props = lt.mergeEvaluated.props(s, t.props, n.props, r)), n.items !== !0 && t.items !== void 0 && (n.items = lt.mergeEvaluated.items(s, t.items, n.items, r)));
  }
  mergeValidEvaluated(t, r) {
    const { it: n, gen: s } = this;
    if (n.opts.unevaluated && (n.props !== !0 || n.items !== !0))
      return s.if(r, () => this.mergeEvaluated(t, U.Name)), !0;
  }
};
Be.KeywordCxt = ml;
function pl(e, t, r, n) {
  const s = new ml(e, r, t);
  "code" in r ? r.code(s, n) : s.$data && r.validate ? (0, Kr.funcKeywordCode)(s, r) : "macro" in r ? (0, Kr.macroKeywordCode)(s, r) : (r.compile || r.validate) && (0, Kr.funcKeywordCode)(s, r);
}
const Qf = /^\/(?:[^~]|~0|~1)*$/, Zf = /^([0-9]+)(#|\/(?:[^~]|~0|~1)*)?$/;
function $l(e, { dataLevel: t, dataNames: r, dataPathArr: n }) {
  let s, a;
  if (e === "")
    return J.default.rootData;
  if (e[0] === "/") {
    if (!Qf.test(e))
      throw new Error(`Invalid JSON-pointer: ${e}`);
    s = e, a = J.default.rootData;
  } else {
    const c = Zf.exec(e);
    if (!c)
      throw new Error(`Invalid JSON-pointer: ${e}`);
    const d = +c[1];
    if (s = c[2], s === "#") {
      if (d >= t)
        throw new Error(l("property/index", d));
      return n[t - d];
    }
    if (d > t)
      throw new Error(l("data", d));
    if (a = r[t - d], !s)
      return a;
  }
  let o = a;
  const u = s.split("/");
  for (const c of u)
    c && (a = (0, U._)`${a}${(0, U.getProperty)((0, lt.unescapeJsonPointer)(c))}`, o = (0, U._)`${o} && ${a}`);
  return o;
  function l(c, d) {
    return `Cannot access ${c} ${d} levels up, current level is ${t}`;
  }
}
Be.getData = $l;
var sn = {};
Object.defineProperty(sn, "__esModule", { value: !0 });
let xf = class extends Error {
  constructor(t) {
    super("validation failed"), this.errors = t, this.ajv = this.validation = !0;
  }
};
sn.default = xf;
var vr = {};
Object.defineProperty(vr, "__esModule", { value: !0 });
const ys = we;
let eh = class extends Error {
  constructor(t, r, n, s) {
    super(s || `can't resolve reference ${n} from id ${r}`), this.missingRef = (0, ys.resolveUrl)(t, r, n), this.missingSchema = (0, ys.normalizeId)((0, ys.getFullPath)(t, this.missingRef));
  }
};
vr.default = eh;
var Te = {};
Object.defineProperty(Te, "__esModule", { value: !0 });
Te.resolveSchema = Te.getCompilingSchema = Te.resolveRef = Te.compileSchema = Te.SchemaEnv = void 0;
const qe = W, th = sn, Gt = Le, Je = we, yi = A, rh = Be;
let Qn = class {
  constructor(t) {
    var r;
    this.refs = {}, this.dynamicAnchors = {};
    let n;
    typeof t.schema == "object" && (n = t.schema), this.schema = t.schema, this.schemaId = t.schemaId, this.root = t.root || this, this.baseId = (r = t.baseId) !== null && r !== void 0 ? r : (0, Je.normalizeId)(n == null ? void 0 : n[t.schemaId || "$id"]), this.schemaPath = t.schemaPath, this.localRefs = t.localRefs, this.meta = t.meta, this.$async = n == null ? void 0 : n.$async, this.refs = {};
  }
};
Te.SchemaEnv = Qn;
function ha(e) {
  const t = yl.call(this, e);
  if (t)
    return t;
  const r = (0, Je.getFullPath)(this.opts.uriResolver, e.root.baseId), { es5: n, lines: s } = this.opts.code, { ownProperties: a } = this.opts, o = new qe.CodeGen(this.scope, { es5: n, lines: s, ownProperties: a });
  let u;
  e.$async && (u = o.scopeValue("Error", {
    ref: th.default,
    code: (0, qe._)`require("ajv/dist/runtime/validation_error").default`
  }));
  const l = o.scopeName("validate");
  e.validateName = l;
  const c = {
    gen: o,
    allErrors: this.opts.allErrors,
    data: Gt.default.data,
    parentData: Gt.default.parentData,
    parentDataProperty: Gt.default.parentDataProperty,
    dataNames: [Gt.default.data],
    dataPathArr: [qe.nil],
    // TODO can its length be used as dataLevel if nil is removed?
    dataLevel: 0,
    dataTypes: [],
    definedProperties: /* @__PURE__ */ new Set(),
    topSchemaRef: o.scopeValue("schema", this.opts.code.source === !0 ? { ref: e.schema, code: (0, qe.stringify)(e.schema) } : { ref: e.schema }),
    validateName: l,
    ValidationError: u,
    schema: e.schema,
    schemaEnv: e,
    rootId: r,
    baseId: e.baseId || r,
    schemaPath: qe.nil,
    errSchemaPath: e.schemaPath || (this.opts.jtd ? "" : "#"),
    errorPath: (0, qe._)`""`,
    opts: this.opts,
    self: this
  };
  let d;
  try {
    this._compilations.add(e), (0, rh.validateFunctionCode)(c), o.optimize(this.opts.code.optimize);
    const h = o.toString();
    d = `${o.scopeRefs(Gt.default.scope)}return ${h}`, this.opts.code.process && (d = this.opts.code.process(d, e));
    const g = new Function(`${Gt.default.self}`, `${Gt.default.scope}`, d)(this, this.scope.get());
    if (this.scope.value(l, { ref: g }), g.errors = null, g.schema = e.schema, g.schemaEnv = e, e.$async && (g.$async = !0), this.opts.code.source === !0 && (g.source = { validateName: l, validateCode: h, scopeValues: o._values }), this.opts.unevaluated) {
      const { props: y, items: w } = c;
      g.evaluated = {
        props: y instanceof qe.Name ? void 0 : y,
        items: w instanceof qe.Name ? void 0 : w,
        dynamicProps: y instanceof qe.Name,
        dynamicItems: w instanceof qe.Name
      }, g.source && (g.source.evaluated = (0, qe.stringify)(g.evaluated));
    }
    return e.validate = g, e;
  } catch (h) {
    throw delete e.validate, delete e.validateName, d && this.logger.error("Error compiling schema, function code:", d), h;
  } finally {
    this._compilations.delete(e);
  }
}
Te.compileSchema = ha;
function nh(e, t, r) {
  var n;
  r = (0, Je.resolveUrl)(this.opts.uriResolver, t, r);
  const s = e.refs[r];
  if (s)
    return s;
  let a = oh.call(this, e, r);
  if (a === void 0) {
    const o = (n = e.localRefs) === null || n === void 0 ? void 0 : n[r], { schemaId: u } = this.opts;
    o && (a = new Qn({ schema: o, schemaId: u, root: e, baseId: t }));
  }
  if (a !== void 0)
    return e.refs[r] = sh.call(this, a);
}
Te.resolveRef = nh;
function sh(e) {
  return (0, Je.inlineRef)(e.schema, this.opts.inlineRefs) ? e.schema : e.validate ? e : ha.call(this, e);
}
function yl(e) {
  for (const t of this._compilations)
    if (ah(t, e))
      return t;
}
Te.getCompilingSchema = yl;
function ah(e, t) {
  return e.schema === t.schema && e.root === t.root && e.baseId === t.baseId;
}
function oh(e, t) {
  let r;
  for (; typeof (r = this.refs[t]) == "string"; )
    t = r;
  return r || this.schemas[t] || Zn.call(this, e, t);
}
function Zn(e, t) {
  const r = this.opts.uriResolver.parse(t), n = (0, Je._getFullPath)(this.opts.uriResolver, r);
  let s = (0, Je.getFullPath)(this.opts.uriResolver, e.baseId, void 0);
  if (Object.keys(e.schema).length > 0 && n === s)
    return _s.call(this, r, e);
  const a = (0, Je.normalizeId)(n), o = this.refs[a] || this.schemas[a];
  if (typeof o == "string") {
    const u = Zn.call(this, e, o);
    return typeof (u == null ? void 0 : u.schema) != "object" ? void 0 : _s.call(this, r, u);
  }
  if (typeof (o == null ? void 0 : o.schema) == "object") {
    if (o.validate || ha.call(this, o), a === (0, Je.normalizeId)(t)) {
      const { schema: u } = o, { schemaId: l } = this.opts, c = u[l];
      return c && (s = (0, Je.resolveUrl)(this.opts.uriResolver, s, c)), new Qn({ schema: u, schemaId: l, root: e, baseId: s });
    }
    return _s.call(this, r, o);
  }
}
Te.resolveSchema = Zn;
const ih = /* @__PURE__ */ new Set([
  "properties",
  "patternProperties",
  "enum",
  "dependencies",
  "definitions"
]);
function _s(e, { baseId: t, schema: r, root: n }) {
  var s;
  if (((s = e.fragment) === null || s === void 0 ? void 0 : s[0]) !== "/")
    return;
  for (const u of e.fragment.slice(1).split("/")) {
    if (typeof r == "boolean")
      return;
    const l = r[(0, yi.unescapeFragment)(u)];
    if (l === void 0)
      return;
    r = l;
    const c = typeof r == "object" && r[this.opts.schemaId];
    !ih.has(u) && c && (t = (0, Je.resolveUrl)(this.opts.uriResolver, t, c));
  }
  let a;
  if (typeof r != "boolean" && r.$ref && !(0, yi.schemaHasRulesButRef)(r, this.RULES)) {
    const u = (0, Je.resolveUrl)(this.opts.uriResolver, t, r.$ref);
    a = Zn.call(this, n, u);
  }
  const { schemaId: o } = this.opts;
  if (a = a || new Qn({ schema: r, schemaId: o, root: n, baseId: t }), a.schema !== a.root.schema)
    return a;
}
const ch = "https://raw.githubusercontent.com/ajv-validator/ajv/master/lib/refs/data.json#", lh = "Meta-schema for $data reference (JSON AnySchema extension proposal)", uh = "object", dh = [
  "$data"
], fh = {
  $data: {
    type: "string",
    anyOf: [
      {
        format: "relative-json-pointer"
      },
      {
        format: "json-pointer"
      }
    ]
  }
}, hh = !1, mh = {
  $id: ch,
  description: lh,
  type: uh,
  required: dh,
  properties: fh,
  additionalProperties: hh
};
var ma = {}, xn = { exports: {} };
const ph = {
  0: 0,
  1: 1,
  2: 2,
  3: 3,
  4: 4,
  5: 5,
  6: 6,
  7: 7,
  8: 8,
  9: 9,
  a: 10,
  A: 10,
  b: 11,
  B: 11,
  c: 12,
  C: 12,
  d: 13,
  D: 13,
  e: 14,
  E: 14,
  f: 15,
  F: 15
};
var $h = {
  HEX: ph
};
const { HEX: yh } = $h;
function _l(e) {
  if (vl(e, ".") < 3)
    return { host: e, isIPV4: !1 };
  const t = e.match(/^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])$/u) || [], [r] = t;
  return r ? { host: gh(r, "."), isIPV4: !0 } : { host: e, isIPV4: !1 };
}
function Fs(e, t = !1) {
  let r = "", n = !0;
  for (const s of e) {
    if (yh[s] === void 0) return;
    s !== "0" && n === !0 && (n = !1), n || (r += s);
  }
  return t && r.length === 0 && (r = "0"), r;
}
function _h(e) {
  let t = 0;
  const r = { error: !1, address: "", zone: "" }, n = [], s = [];
  let a = !1, o = !1, u = !1;
  function l() {
    if (s.length) {
      if (a === !1) {
        const c = Fs(s);
        if (c !== void 0)
          n.push(c);
        else
          return r.error = !0, !1;
      }
      s.length = 0;
    }
    return !0;
  }
  for (let c = 0; c < e.length; c++) {
    const d = e[c];
    if (!(d === "[" || d === "]"))
      if (d === ":") {
        if (o === !0 && (u = !0), !l())
          break;
        if (t++, n.push(":"), t > 7) {
          r.error = !0;
          break;
        }
        c - 1 >= 0 && e[c - 1] === ":" && (o = !0);
        continue;
      } else if (d === "%") {
        if (!l())
          break;
        a = !0;
      } else {
        s.push(d);
        continue;
      }
  }
  return s.length && (a ? r.zone = s.join("") : u ? n.push(s.join("")) : n.push(Fs(s))), r.address = n.join(""), r;
}
function gl(e, t = {}) {
  if (vl(e, ":") < 2)
    return { host: e, isIPV6: !1 };
  const r = _h(e);
  if (r.error)
    return { host: e, isIPV6: !1 };
  {
    let n = r.address, s = r.address;
    return r.zone && (n += "%" + r.zone, s += "%25" + r.zone), { host: n, escapedHost: s, isIPV6: !0 };
  }
}
function gh(e, t) {
  let r = "", n = !0;
  const s = e.length;
  for (let a = 0; a < s; a++) {
    const o = e[a];
    o === "0" && n ? (a + 1 <= s && e[a + 1] === t || a + 1 === s) && (r += o, n = !1) : (o === t ? n = !0 : n = !1, r += o);
  }
  return r;
}
function vl(e, t) {
  let r = 0;
  for (let n = 0; n < e.length; n++)
    e[n] === t && r++;
  return r;
}
const _i = /^\.\.?\//u, gi = /^\/\.(?:\/|$)/u, vi = /^\/\.\.(?:\/|$)/u, vh = /^\/?(?:.|\n)*?(?=\/|$)/u;
function wh(e) {
  const t = [];
  for (; e.length; )
    if (e.match(_i))
      e = e.replace(_i, "");
    else if (e.match(gi))
      e = e.replace(gi, "/");
    else if (e.match(vi))
      e = e.replace(vi, "/"), t.pop();
    else if (e === "." || e === "..")
      e = "";
    else {
      const r = e.match(vh);
      if (r) {
        const n = r[0];
        e = e.slice(n.length), t.push(n);
      } else
        throw new Error("Unexpected dot segment condition");
    }
  return t.join("");
}
function Eh(e, t) {
  const r = t !== !0 ? escape : unescape;
  return e.scheme !== void 0 && (e.scheme = r(e.scheme)), e.userinfo !== void 0 && (e.userinfo = r(e.userinfo)), e.host !== void 0 && (e.host = r(e.host)), e.path !== void 0 && (e.path = r(e.path)), e.query !== void 0 && (e.query = r(e.query)), e.fragment !== void 0 && (e.fragment = r(e.fragment)), e;
}
function bh(e, t) {
  const r = [];
  if (e.userinfo !== void 0 && (r.push(e.userinfo), r.push("@")), e.host !== void 0) {
    let n = unescape(e.host);
    const s = _l(n);
    if (s.isIPV4)
      n = s.host;
    else {
      const a = gl(s.host, { isIPV4: !1 });
      a.isIPV6 === !0 ? n = `[${a.escapedHost}]` : n = e.host;
    }
    r.push(n);
  }
  return (typeof e.port == "number" || typeof e.port == "string") && (r.push(":"), r.push(String(e.port))), r.length ? r.join("") : void 0;
}
var Sh = {
  recomposeAuthority: bh,
  normalizeComponentEncoding: Eh,
  removeDotSegments: wh,
  normalizeIPv4: _l,
  normalizeIPv6: gl,
  stringArrayToHexStripped: Fs
};
const Ph = /^[\da-f]{8}\b-[\da-f]{4}\b-[\da-f]{4}\b-[\da-f]{4}\b-[\da-f]{12}$/iu, Nh = /([\da-z][\d\-a-z]{0,31}):((?:[\w!$'()*+,\-.:;=@]|%[\da-f]{2})+)/iu;
function wl(e) {
  return typeof e.secure == "boolean" ? e.secure : String(e.scheme).toLowerCase() === "wss";
}
function El(e) {
  return e.host || (e.error = e.error || "HTTP URIs must have a host."), e;
}
function bl(e) {
  const t = String(e.scheme).toLowerCase() === "https";
  return (e.port === (t ? 443 : 80) || e.port === "") && (e.port = void 0), e.path || (e.path = "/"), e;
}
function Rh(e) {
  return e.secure = wl(e), e.resourceName = (e.path || "/") + (e.query ? "?" + e.query : ""), e.path = void 0, e.query = void 0, e;
}
function Oh(e) {
  if ((e.port === (wl(e) ? 443 : 80) || e.port === "") && (e.port = void 0), typeof e.secure == "boolean" && (e.scheme = e.secure ? "wss" : "ws", e.secure = void 0), e.resourceName) {
    const [t, r] = e.resourceName.split("?");
    e.path = t && t !== "/" ? t : void 0, e.query = r, e.resourceName = void 0;
  }
  return e.fragment = void 0, e;
}
function Ih(e, t) {
  if (!e.path)
    return e.error = "URN can not be parsed", e;
  const r = e.path.match(Nh);
  if (r) {
    const n = t.scheme || e.scheme || "urn";
    e.nid = r[1].toLowerCase(), e.nss = r[2];
    const s = `${n}:${t.nid || e.nid}`, a = pa[s];
    e.path = void 0, a && (e = a.parse(e, t));
  } else
    e.error = e.error || "URN can not be parsed.";
  return e;
}
function Th(e, t) {
  const r = t.scheme || e.scheme || "urn", n = e.nid.toLowerCase(), s = `${r}:${t.nid || n}`, a = pa[s];
  a && (e = a.serialize(e, t));
  const o = e, u = e.nss;
  return o.path = `${n || t.nid}:${u}`, t.skipEscape = !0, o;
}
function jh(e, t) {
  const r = e;
  return r.uuid = r.nss, r.nss = void 0, !t.tolerant && (!r.uuid || !Ph.test(r.uuid)) && (r.error = r.error || "UUID is not valid."), r;
}
function kh(e) {
  const t = e;
  return t.nss = (e.uuid || "").toLowerCase(), t;
}
const Sl = {
  scheme: "http",
  domainHost: !0,
  parse: El,
  serialize: bl
}, Ah = {
  scheme: "https",
  domainHost: Sl.domainHost,
  parse: El,
  serialize: bl
}, On = {
  scheme: "ws",
  domainHost: !0,
  parse: Rh,
  serialize: Oh
}, Ch = {
  scheme: "wss",
  domainHost: On.domainHost,
  parse: On.parse,
  serialize: On.serialize
}, Dh = {
  scheme: "urn",
  parse: Ih,
  serialize: Th,
  skipNormalize: !0
}, Mh = {
  scheme: "urn:uuid",
  parse: jh,
  serialize: kh,
  skipNormalize: !0
}, pa = {
  http: Sl,
  https: Ah,
  ws: On,
  wss: Ch,
  urn: Dh,
  "urn:uuid": Mh
};
var Vh = pa;
const { normalizeIPv6: Lh, normalizeIPv4: Fh, removeDotSegments: zr, recomposeAuthority: zh, normalizeComponentEncoding: dn } = Sh, $a = Vh;
function Uh(e, t) {
  return typeof e == "string" ? e = rt(ft(e, t), t) : typeof e == "object" && (e = ft(rt(e, t), t)), e;
}
function qh(e, t, r) {
  const n = Object.assign({ scheme: "null" }, r), s = Pl(ft(e, n), ft(t, n), n, !0);
  return rt(s, { ...n, skipEscape: !0 });
}
function Pl(e, t, r, n) {
  const s = {};
  return n || (e = ft(rt(e, r), r), t = ft(rt(t, r), r)), r = r || {}, !r.tolerant && t.scheme ? (s.scheme = t.scheme, s.userinfo = t.userinfo, s.host = t.host, s.port = t.port, s.path = zr(t.path || ""), s.query = t.query) : (t.userinfo !== void 0 || t.host !== void 0 || t.port !== void 0 ? (s.userinfo = t.userinfo, s.host = t.host, s.port = t.port, s.path = zr(t.path || ""), s.query = t.query) : (t.path ? (t.path.charAt(0) === "/" ? s.path = zr(t.path) : ((e.userinfo !== void 0 || e.host !== void 0 || e.port !== void 0) && !e.path ? s.path = "/" + t.path : e.path ? s.path = e.path.slice(0, e.path.lastIndexOf("/") + 1) + t.path : s.path = t.path, s.path = zr(s.path)), s.query = t.query) : (s.path = e.path, t.query !== void 0 ? s.query = t.query : s.query = e.query), s.userinfo = e.userinfo, s.host = e.host, s.port = e.port), s.scheme = e.scheme), s.fragment = t.fragment, s;
}
function Gh(e, t, r) {
  return typeof e == "string" ? (e = unescape(e), e = rt(dn(ft(e, r), !0), { ...r, skipEscape: !0 })) : typeof e == "object" && (e = rt(dn(e, !0), { ...r, skipEscape: !0 })), typeof t == "string" ? (t = unescape(t), t = rt(dn(ft(t, r), !0), { ...r, skipEscape: !0 })) : typeof t == "object" && (t = rt(dn(t, !0), { ...r, skipEscape: !0 })), e.toLowerCase() === t.toLowerCase();
}
function rt(e, t) {
  const r = {
    host: e.host,
    scheme: e.scheme,
    userinfo: e.userinfo,
    port: e.port,
    path: e.path,
    query: e.query,
    nid: e.nid,
    nss: e.nss,
    uuid: e.uuid,
    fragment: e.fragment,
    reference: e.reference,
    resourceName: e.resourceName,
    secure: e.secure,
    error: ""
  }, n = Object.assign({}, t), s = [], a = $a[(n.scheme || r.scheme || "").toLowerCase()];
  a && a.serialize && a.serialize(r, n), r.path !== void 0 && (n.skipEscape ? r.path = unescape(r.path) : (r.path = escape(r.path), r.scheme !== void 0 && (r.path = r.path.split("%3A").join(":")))), n.reference !== "suffix" && r.scheme && (s.push(r.scheme), s.push(":"));
  const o = zh(r, n);
  if (o !== void 0 && (n.reference !== "suffix" && s.push("//"), s.push(o), r.path && r.path.charAt(0) !== "/" && s.push("/")), r.path !== void 0) {
    let u = r.path;
    !n.absolutePath && (!a || !a.absolutePath) && (u = zr(u)), o === void 0 && (u = u.replace(/^\/\//u, "/%2F")), s.push(u);
  }
  return r.query !== void 0 && (s.push("?"), s.push(r.query)), r.fragment !== void 0 && (s.push("#"), s.push(r.fragment)), s.join("");
}
const Kh = Array.from({ length: 127 }, (e, t) => /[^!"$&'()*+,\-.;=_`a-z{}~]/u.test(String.fromCharCode(t)));
function Hh(e) {
  let t = 0;
  for (let r = 0, n = e.length; r < n; ++r)
    if (t = e.charCodeAt(r), t > 126 || Kh[t])
      return !0;
  return !1;
}
const Jh = /^(?:([^#/:?]+):)?(?:\/\/((?:([^#/?@]*)@)?(\[[^#/?\]]+\]|[^#/:?]*)(?::(\d*))?))?([^#?]*)(?:\?([^#]*))?(?:#((?:.|[\n\r])*))?/u;
function ft(e, t) {
  const r = Object.assign({}, t), n = {
    scheme: void 0,
    userinfo: void 0,
    host: "",
    port: void 0,
    path: "",
    query: void 0,
    fragment: void 0
  }, s = e.indexOf("%") !== -1;
  let a = !1;
  r.reference === "suffix" && (e = (r.scheme ? r.scheme + ":" : "") + "//" + e);
  const o = e.match(Jh);
  if (o) {
    if (n.scheme = o[1], n.userinfo = o[3], n.host = o[4], n.port = parseInt(o[5], 10), n.path = o[6] || "", n.query = o[7], n.fragment = o[8], isNaN(n.port) && (n.port = o[5]), n.host) {
      const l = Fh(n.host);
      if (l.isIPV4 === !1) {
        const c = Lh(l.host, { isIPV4: !1 });
        n.host = c.host.toLowerCase(), a = c.isIPV6;
      } else
        n.host = l.host, a = !0;
    }
    n.scheme === void 0 && n.userinfo === void 0 && n.host === void 0 && n.port === void 0 && !n.path && n.query === void 0 ? n.reference = "same-document" : n.scheme === void 0 ? n.reference = "relative" : n.fragment === void 0 ? n.reference = "absolute" : n.reference = "uri", r.reference && r.reference !== "suffix" && r.reference !== n.reference && (n.error = n.error || "URI is not a " + r.reference + " reference.");
    const u = $a[(r.scheme || n.scheme || "").toLowerCase()];
    if (!r.unicodeSupport && (!u || !u.unicodeSupport) && n.host && (r.domainHost || u && u.domainHost) && a === !1 && Hh(n.host))
      try {
        n.host = URL.domainToASCII(n.host.toLowerCase());
      } catch (l) {
        n.error = n.error || "Host's domain name can not be converted to ASCII: " + l;
      }
    (!u || u && !u.skipNormalize) && (s && n.scheme !== void 0 && (n.scheme = unescape(n.scheme)), s && n.userinfo !== void 0 && (n.userinfo = unescape(n.userinfo)), s && n.host !== void 0 && (n.host = unescape(n.host)), n.path !== void 0 && n.path.length && (n.path = escape(unescape(n.path))), n.fragment !== void 0 && n.fragment.length && (n.fragment = encodeURI(decodeURIComponent(n.fragment)))), u && u.parse && u.parse(n, r);
  } else
    n.error = n.error || "URI can not be parsed.";
  return n;
}
const ya = {
  SCHEMES: $a,
  normalize: Uh,
  resolve: qh,
  resolveComponents: Pl,
  equal: Gh,
  serialize: rt,
  parse: ft
};
xn.exports = ya;
xn.exports.default = ya;
xn.exports.fastUri = ya;
var Nl = xn.exports;
Object.defineProperty(ma, "__esModule", { value: !0 });
const Rl = Nl;
Rl.code = 'require("ajv/dist/runtime/uri").default';
ma.default = Rl;
(function(e) {
  Object.defineProperty(e, "__esModule", { value: !0 }), e.CodeGen = e.Name = e.nil = e.stringify = e.str = e._ = e.KeywordCxt = void 0;
  var t = Be;
  Object.defineProperty(e, "KeywordCxt", { enumerable: !0, get: function() {
    return t.KeywordCxt;
  } });
  var r = W;
  Object.defineProperty(e, "_", { enumerable: !0, get: function() {
    return r._;
  } }), Object.defineProperty(e, "str", { enumerable: !0, get: function() {
    return r.str;
  } }), Object.defineProperty(e, "stringify", { enumerable: !0, get: function() {
    return r.stringify;
  } }), Object.defineProperty(e, "nil", { enumerable: !0, get: function() {
    return r.nil;
  } }), Object.defineProperty(e, "Name", { enumerable: !0, get: function() {
    return r.Name;
  } }), Object.defineProperty(e, "CodeGen", { enumerable: !0, get: function() {
    return r.CodeGen;
  } });
  const n = sn, s = vr, a = xt, o = Te, u = W, l = we, c = $e, d = A, h = mh, b = ma, g = (P, p) => new RegExp(P, p);
  g.code = "new RegExp";
  const y = ["removeAdditional", "useDefaults", "coerceTypes"], w = /* @__PURE__ */ new Set([
    "validate",
    "serialize",
    "parse",
    "wrapper",
    "root",
    "schema",
    "keyword",
    "pattern",
    "formats",
    "validate$data",
    "func",
    "obj",
    "Error"
  ]), _ = {
    errorDataPath: "",
    format: "`validateFormats: false` can be used instead.",
    nullable: '"nullable" keyword is supported by default.',
    jsonPointers: "Deprecated jsPropertySyntax can be used instead.",
    extendRefs: "Deprecated ignoreKeywordsWithRef can be used instead.",
    missingRefs: "Pass empty schema with $id that should be ignored to ajv.addSchema.",
    processCode: "Use option `code: {process: (code, schemaEnv: object) => string}`",
    sourceCode: "Use option `code: {source: true}`",
    strictDefaults: "It is default now, see option `strict`.",
    strictKeywords: "It is default now, see option `strict`.",
    uniqueItems: '"uniqueItems" keyword is always validated.',
    unknownFormats: "Disable strict mode or pass `true` to `ajv.addFormat` (or `formats` option).",
    cache: "Map is used as cache, schema object as key.",
    serialize: "Map is used as cache, schema object as key.",
    ajvErrors: "It is default now."
  }, m = {
    ignoreKeywordsWithRef: "",
    jsPropertySyntax: "",
    unicode: '"minLength"/"maxLength" account for unicode characters by default.'
  }, v = 200;
  function N(P) {
    var p, S, $, i, f, E, I, j, F, L, re, De, It, Tt, jt, kt, At, Ct, Dt, Mt, Vt, Lt, Ft, zt, Ut;
    const Ue = P.strict, qt = (p = P.code) === null || p === void 0 ? void 0 : p.optimize, Ir = qt === !0 || qt === void 0 ? 1 : qt || 0, Tr = ($ = (S = P.code) === null || S === void 0 ? void 0 : S.regExp) !== null && $ !== void 0 ? $ : g, hs = (i = P.uriResolver) !== null && i !== void 0 ? i : b.default;
    return {
      strictSchema: (E = (f = P.strictSchema) !== null && f !== void 0 ? f : Ue) !== null && E !== void 0 ? E : !0,
      strictNumbers: (j = (I = P.strictNumbers) !== null && I !== void 0 ? I : Ue) !== null && j !== void 0 ? j : !0,
      strictTypes: (L = (F = P.strictTypes) !== null && F !== void 0 ? F : Ue) !== null && L !== void 0 ? L : "log",
      strictTuples: (De = (re = P.strictTuples) !== null && re !== void 0 ? re : Ue) !== null && De !== void 0 ? De : "log",
      strictRequired: (Tt = (It = P.strictRequired) !== null && It !== void 0 ? It : Ue) !== null && Tt !== void 0 ? Tt : !1,
      code: P.code ? { ...P.code, optimize: Ir, regExp: Tr } : { optimize: Ir, regExp: Tr },
      loopRequired: (jt = P.loopRequired) !== null && jt !== void 0 ? jt : v,
      loopEnum: (kt = P.loopEnum) !== null && kt !== void 0 ? kt : v,
      meta: (At = P.meta) !== null && At !== void 0 ? At : !0,
      messages: (Ct = P.messages) !== null && Ct !== void 0 ? Ct : !0,
      inlineRefs: (Dt = P.inlineRefs) !== null && Dt !== void 0 ? Dt : !0,
      schemaId: (Mt = P.schemaId) !== null && Mt !== void 0 ? Mt : "$id",
      addUsedSchema: (Vt = P.addUsedSchema) !== null && Vt !== void 0 ? Vt : !0,
      validateSchema: (Lt = P.validateSchema) !== null && Lt !== void 0 ? Lt : !0,
      validateFormats: (Ft = P.validateFormats) !== null && Ft !== void 0 ? Ft : !0,
      unicodeRegExp: (zt = P.unicodeRegExp) !== null && zt !== void 0 ? zt : !0,
      int32range: (Ut = P.int32range) !== null && Ut !== void 0 ? Ut : !0,
      uriResolver: hs
    };
  }
  class R {
    constructor(p = {}) {
      this.schemas = {}, this.refs = {}, this.formats = {}, this._compilations = /* @__PURE__ */ new Set(), this._loading = {}, this._cache = /* @__PURE__ */ new Map(), p = this.opts = { ...p, ...N(p) };
      const { es5: S, lines: $ } = this.opts.code;
      this.scope = new u.ValueScope({ scope: {}, prefixes: w, es5: S, lines: $ }), this.logger = H(p.logger);
      const i = p.validateFormats;
      p.validateFormats = !1, this.RULES = (0, a.getRules)(), O.call(this, _, p, "NOT SUPPORTED"), O.call(this, m, p, "DEPRECATED", "warn"), this._metaOpts = pe.call(this), p.formats && le.call(this), this._addVocabularies(), this._addDefaultMetaSchema(), p.keywords && fe.call(this, p.keywords), typeof p.meta == "object" && this.addMetaSchema(p.meta), B.call(this), p.validateFormats = i;
    }
    _addVocabularies() {
      this.addKeyword("$async");
    }
    _addDefaultMetaSchema() {
      const { $data: p, meta: S, schemaId: $ } = this.opts;
      let i = h;
      $ === "id" && (i = { ...h }, i.id = i.$id, delete i.$id), S && p && this.addMetaSchema(i, i[$], !1);
    }
    defaultMeta() {
      const { meta: p, schemaId: S } = this.opts;
      return this.opts.defaultMeta = typeof p == "object" ? p[S] || p : void 0;
    }
    validate(p, S) {
      let $;
      if (typeof p == "string") {
        if ($ = this.getSchema(p), !$)
          throw new Error(`no schema with key or ref "${p}"`);
      } else
        $ = this.compile(p);
      const i = $(S);
      return "$async" in $ || (this.errors = $.errors), i;
    }
    compile(p, S) {
      const $ = this._addSchema(p, S);
      return $.validate || this._compileSchemaEnv($);
    }
    compileAsync(p, S) {
      if (typeof this.opts.loadSchema != "function")
        throw new Error("options.loadSchema should be a function");
      const { loadSchema: $ } = this.opts;
      return i.call(this, p, S);
      async function i(L, re) {
        await f.call(this, L.$schema);
        const De = this._addSchema(L, re);
        return De.validate || E.call(this, De);
      }
      async function f(L) {
        L && !this.getSchema(L) && await i.call(this, { $ref: L }, !0);
      }
      async function E(L) {
        try {
          return this._compileSchemaEnv(L);
        } catch (re) {
          if (!(re instanceof s.default))
            throw re;
          return I.call(this, re), await j.call(this, re.missingSchema), E.call(this, L);
        }
      }
      function I({ missingSchema: L, missingRef: re }) {
        if (this.refs[L])
          throw new Error(`AnySchema ${L} is loaded but ${re} cannot be resolved`);
      }
      async function j(L) {
        const re = await F.call(this, L);
        this.refs[L] || await f.call(this, re.$schema), this.refs[L] || this.addSchema(re, L, S);
      }
      async function F(L) {
        const re = this._loading[L];
        if (re)
          return re;
        try {
          return await (this._loading[L] = $(L));
        } finally {
          delete this._loading[L];
        }
      }
    }
    // Adds schema to the instance
    addSchema(p, S, $, i = this.opts.validateSchema) {
      if (Array.isArray(p)) {
        for (const E of p)
          this.addSchema(E, void 0, $, i);
        return this;
      }
      let f;
      if (typeof p == "object") {
        const { schemaId: E } = this.opts;
        if (f = p[E], f !== void 0 && typeof f != "string")
          throw new Error(`schema ${E} must be string`);
      }
      return S = (0, l.normalizeId)(S || f), this._checkUnique(S), this.schemas[S] = this._addSchema(p, $, S, i, !0), this;
    }
    // Add schema that will be used to validate other schemas
    // options in META_IGNORE_OPTIONS are alway set to false
    addMetaSchema(p, S, $ = this.opts.validateSchema) {
      return this.addSchema(p, S, !0, $), this;
    }
    //  Validate schema against its meta-schema
    validateSchema(p, S) {
      if (typeof p == "boolean")
        return !0;
      let $;
      if ($ = p.$schema, $ !== void 0 && typeof $ != "string")
        throw new Error("$schema must be a string");
      if ($ = $ || this.opts.defaultMeta || this.defaultMeta(), !$)
        return this.logger.warn("meta-schema not available"), this.errors = null, !0;
      const i = this.validate($, p);
      if (!i && S) {
        const f = "schema is invalid: " + this.errorsText();
        if (this.opts.validateSchema === "log")
          this.logger.error(f);
        else
          throw new Error(f);
      }
      return i;
    }
    // Get compiled schema by `key` or `ref`.
    // (`key` that was passed to `addSchema` or full schema reference - `schema.$id` or resolved id)
    getSchema(p) {
      let S;
      for (; typeof (S = G.call(this, p)) == "string"; )
        p = S;
      if (S === void 0) {
        const { schemaId: $ } = this.opts, i = new o.SchemaEnv({ schema: {}, schemaId: $ });
        if (S = o.resolveSchema.call(this, i, p), !S)
          return;
        this.refs[p] = S;
      }
      return S.validate || this._compileSchemaEnv(S);
    }
    // Remove cached schema(s).
    // If no parameter is passed all schemas but meta-schemas are removed.
    // If RegExp is passed all schemas with key/id matching pattern but meta-schemas are removed.
    // Even if schema is referenced by other schemas it still can be removed as other schemas have local references.
    removeSchema(p) {
      if (p instanceof RegExp)
        return this._removeAllSchemas(this.schemas, p), this._removeAllSchemas(this.refs, p), this;
      switch (typeof p) {
        case "undefined":
          return this._removeAllSchemas(this.schemas), this._removeAllSchemas(this.refs), this._cache.clear(), this;
        case "string": {
          const S = G.call(this, p);
          return typeof S == "object" && this._cache.delete(S.schema), delete this.schemas[p], delete this.refs[p], this;
        }
        case "object": {
          const S = p;
          this._cache.delete(S);
          let $ = p[this.opts.schemaId];
          return $ && ($ = (0, l.normalizeId)($), delete this.schemas[$], delete this.refs[$]), this;
        }
        default:
          throw new Error("ajv.removeSchema: invalid parameter");
      }
    }
    // add "vocabulary" - a collection of keywords
    addVocabulary(p) {
      for (const S of p)
        this.addKeyword(S);
      return this;
    }
    addKeyword(p, S) {
      let $;
      if (typeof p == "string")
        $ = p, typeof S == "object" && (this.logger.warn("these parameters are deprecated, see docs for addKeyword"), S.keyword = $);
      else if (typeof p == "object" && S === void 0) {
        if (S = p, $ = S.keyword, Array.isArray($) && !$.length)
          throw new Error("addKeywords: keyword must be string or non-empty array");
      } else
        throw new Error("invalid addKeywords parameters");
      if (T.call(this, $, S), !S)
        return (0, d.eachItem)($, (f) => k.call(this, f)), this;
      D.call(this, S);
      const i = {
        ...S,
        type: (0, c.getJSONTypes)(S.type),
        schemaType: (0, c.getJSONTypes)(S.schemaType)
      };
      return (0, d.eachItem)($, i.type.length === 0 ? (f) => k.call(this, f, i) : (f) => i.type.forEach((E) => k.call(this, f, i, E))), this;
    }
    getKeyword(p) {
      const S = this.RULES.all[p];
      return typeof S == "object" ? S.definition : !!S;
    }
    // Remove keyword
    removeKeyword(p) {
      const { RULES: S } = this;
      delete S.keywords[p], delete S.all[p];
      for (const $ of S.rules) {
        const i = $.rules.findIndex((f) => f.keyword === p);
        i >= 0 && $.rules.splice(i, 1);
      }
      return this;
    }
    // Add format
    addFormat(p, S) {
      return typeof S == "string" && (S = new RegExp(S)), this.formats[p] = S, this;
    }
    errorsText(p = this.errors, { separator: S = ", ", dataVar: $ = "data" } = {}) {
      return !p || p.length === 0 ? "No errors" : p.map((i) => `${$}${i.instancePath} ${i.message}`).reduce((i, f) => i + S + f);
    }
    $dataMetaSchema(p, S) {
      const $ = this.RULES.all;
      p = JSON.parse(JSON.stringify(p));
      for (const i of S) {
        const f = i.split("/").slice(1);
        let E = p;
        for (const I of f)
          E = E[I];
        for (const I in $) {
          const j = $[I];
          if (typeof j != "object")
            continue;
          const { $data: F } = j.definition, L = E[I];
          F && L && (E[I] = M(L));
        }
      }
      return p;
    }
    _removeAllSchemas(p, S) {
      for (const $ in p) {
        const i = p[$];
        (!S || S.test($)) && (typeof i == "string" ? delete p[$] : i && !i.meta && (this._cache.delete(i.schema), delete p[$]));
      }
    }
    _addSchema(p, S, $, i = this.opts.validateSchema, f = this.opts.addUsedSchema) {
      let E;
      const { schemaId: I } = this.opts;
      if (typeof p == "object")
        E = p[I];
      else {
        if (this.opts.jtd)
          throw new Error("schema must be object");
        if (typeof p != "boolean")
          throw new Error("schema must be object or boolean");
      }
      let j = this._cache.get(p);
      if (j !== void 0)
        return j;
      $ = (0, l.normalizeId)(E || $);
      const F = l.getSchemaRefs.call(this, p, $);
      return j = new o.SchemaEnv({ schema: p, schemaId: I, meta: S, baseId: $, localRefs: F }), this._cache.set(j.schema, j), f && !$.startsWith("#") && ($ && this._checkUnique($), this.refs[$] = j), i && this.validateSchema(p, !0), j;
    }
    _checkUnique(p) {
      if (this.schemas[p] || this.refs[p])
        throw new Error(`schema with key or id "${p}" already exists`);
    }
    _compileSchemaEnv(p) {
      if (p.meta ? this._compileMetaSchema(p) : o.compileSchema.call(this, p), !p.validate)
        throw new Error("ajv implementation error");
      return p.validate;
    }
    _compileMetaSchema(p) {
      const S = this.opts;
      this.opts = this._metaOpts;
      try {
        o.compileSchema.call(this, p);
      } finally {
        this.opts = S;
      }
    }
  }
  R.ValidationError = n.default, R.MissingRefError = s.default, e.default = R;
  function O(P, p, S, $ = "error") {
    for (const i in P) {
      const f = i;
      f in p && this.logger[$](`${S}: option ${i}. ${P[f]}`);
    }
  }
  function G(P) {
    return P = (0, l.normalizeId)(P), this.schemas[P] || this.refs[P];
  }
  function B() {
    const P = this.opts.schemas;
    if (P)
      if (Array.isArray(P))
        this.addSchema(P);
      else
        for (const p in P)
          this.addSchema(P[p], p);
  }
  function le() {
    for (const P in this.opts.formats) {
      const p = this.opts.formats[P];
      p && this.addFormat(P, p);
    }
  }
  function fe(P) {
    if (Array.isArray(P)) {
      this.addVocabulary(P);
      return;
    }
    this.logger.warn("keywords option as map is deprecated, pass array");
    for (const p in P) {
      const S = P[p];
      S.keyword || (S.keyword = p), this.addKeyword(S);
    }
  }
  function pe() {
    const P = { ...this.opts };
    for (const p of y)
      delete P[p];
    return P;
  }
  const z = { log() {
  }, warn() {
  }, error() {
  } };
  function H(P) {
    if (P === !1)
      return z;
    if (P === void 0)
      return console;
    if (P.log && P.warn && P.error)
      return P;
    throw new Error("logger must implement log, warn and error methods");
  }
  const se = /^[a-z_$][a-z0-9_$:-]*$/i;
  function T(P, p) {
    const { RULES: S } = this;
    if ((0, d.eachItem)(P, ($) => {
      if (S.keywords[$])
        throw new Error(`Keyword ${$} is already defined`);
      if (!se.test($))
        throw new Error(`Keyword ${$} has invalid name`);
    }), !!p && p.$data && !("code" in p || "validate" in p))
      throw new Error('$data keyword must have "code" or "validate" function');
  }
  function k(P, p, S) {
    var $;
    const i = p == null ? void 0 : p.post;
    if (S && i)
      throw new Error('keyword with "post" flag cannot have "type"');
    const { RULES: f } = this;
    let E = i ? f.post : f.rules.find(({ type: j }) => j === S);
    if (E || (E = { type: S, rules: [] }, f.rules.push(E)), f.keywords[P] = !0, !p)
      return;
    const I = {
      keyword: P,
      definition: {
        ...p,
        type: (0, c.getJSONTypes)(p.type),
        schemaType: (0, c.getJSONTypes)(p.schemaType)
      }
    };
    p.before ? V.call(this, E, I, p.before) : E.rules.push(I), f.all[P] = I, ($ = p.implements) === null || $ === void 0 || $.forEach((j) => this.addKeyword(j));
  }
  function V(P, p, S) {
    const $ = P.rules.findIndex((i) => i.keyword === S);
    $ >= 0 ? P.rules.splice($, 0, p) : (P.rules.push(p), this.logger.warn(`rule ${S} is not defined`));
  }
  function D(P) {
    let { metaSchema: p } = P;
    p !== void 0 && (P.$data && this.opts.$data && (p = M(p)), P.validateSchema = this.compile(p, !0));
  }
  const K = {
    $ref: "https://raw.githubusercontent.com/ajv-validator/ajv/master/lib/refs/data.json#"
  };
  function M(P) {
    return { anyOf: [P, K] };
  }
})(zc);
var _a = {}, ga = {}, va = {};
Object.defineProperty(va, "__esModule", { value: !0 });
const Xh = {
  keyword: "id",
  code() {
    throw new Error('NOT SUPPORTED: keyword "id", use "$id" for schema ID');
  }
};
va.default = Xh;
var ht = {};
Object.defineProperty(ht, "__esModule", { value: !0 });
ht.callRef = ht.getValidate = void 0;
const Bh = vr, wi = ee, ke = W, nr = Le, Ei = Te, fn = A, Wh = {
  keyword: "$ref",
  schemaType: "string",
  code(e) {
    const { gen: t, schema: r, it: n } = e, { baseId: s, schemaEnv: a, validateName: o, opts: u, self: l } = n, { root: c } = a;
    if ((r === "#" || r === "#/") && s === c.baseId)
      return h();
    const d = Ei.resolveRef.call(l, c, s, r);
    if (d === void 0)
      throw new Bh.default(n.opts.uriResolver, s, r);
    if (d instanceof Ei.SchemaEnv)
      return b(d);
    return g(d);
    function h() {
      if (a === c)
        return In(e, o, a, a.$async);
      const y = t.scopeValue("root", { ref: c });
      return In(e, (0, ke._)`${y}.validate`, c, c.$async);
    }
    function b(y) {
      const w = Ol(e, y);
      In(e, w, y, y.$async);
    }
    function g(y) {
      const w = t.scopeValue("schema", u.code.source === !0 ? { ref: y, code: (0, ke.stringify)(y) } : { ref: y }), _ = t.name("valid"), m = e.subschema({
        schema: y,
        dataTypes: [],
        schemaPath: ke.nil,
        topSchemaRef: w,
        errSchemaPath: r
      }, _);
      e.mergeEvaluated(m), e.ok(_);
    }
  }
};
function Ol(e, t) {
  const { gen: r } = e;
  return t.validate ? r.scopeValue("validate", { ref: t.validate }) : (0, ke._)`${r.scopeValue("wrapper", { ref: t })}.validate`;
}
ht.getValidate = Ol;
function In(e, t, r, n) {
  const { gen: s, it: a } = e, { allErrors: o, schemaEnv: u, opts: l } = a, c = l.passContext ? nr.default.this : ke.nil;
  n ? d() : h();
  function d() {
    if (!u.$async)
      throw new Error("async schema referenced by sync schema");
    const y = s.let("valid");
    s.try(() => {
      s.code((0, ke._)`await ${(0, wi.callValidateCode)(e, t, c)}`), g(t), o || s.assign(y, !0);
    }, (w) => {
      s.if((0, ke._)`!(${w} instanceof ${a.ValidationError})`, () => s.throw(w)), b(w), o || s.assign(y, !1);
    }), e.ok(y);
  }
  function h() {
    e.result((0, wi.callValidateCode)(e, t, c), () => g(t), () => b(t));
  }
  function b(y) {
    const w = (0, ke._)`${y}.errors`;
    s.assign(nr.default.vErrors, (0, ke._)`${nr.default.vErrors} === null ? ${w} : ${nr.default.vErrors}.concat(${w})`), s.assign(nr.default.errors, (0, ke._)`${nr.default.vErrors}.length`);
  }
  function g(y) {
    var w;
    if (!a.opts.unevaluated)
      return;
    const _ = (w = r == null ? void 0 : r.validate) === null || w === void 0 ? void 0 : w.evaluated;
    if (a.props !== !0)
      if (_ && !_.dynamicProps)
        _.props !== void 0 && (a.props = fn.mergeEvaluated.props(s, _.props, a.props));
      else {
        const m = s.var("props", (0, ke._)`${y}.evaluated.props`);
        a.props = fn.mergeEvaluated.props(s, m, a.props, ke.Name);
      }
    if (a.items !== !0)
      if (_ && !_.dynamicItems)
        _.items !== void 0 && (a.items = fn.mergeEvaluated.items(s, _.items, a.items));
      else {
        const m = s.var("items", (0, ke._)`${y}.evaluated.items`);
        a.items = fn.mergeEvaluated.items(s, m, a.items, ke.Name);
      }
  }
}
ht.callRef = In;
ht.default = Wh;
Object.defineProperty(ga, "__esModule", { value: !0 });
const Yh = va, Qh = ht, Zh = [
  "$schema",
  "$id",
  "$defs",
  "$vocabulary",
  { keyword: "$comment" },
  "definitions",
  Yh.default,
  Qh.default
];
ga.default = Zh;
var wa = {}, Ea = {};
Object.defineProperty(Ea, "__esModule", { value: !0 });
const Ln = W, _t = Ln.operators, Fn = {
  maximum: { okStr: "<=", ok: _t.LTE, fail: _t.GT },
  minimum: { okStr: ">=", ok: _t.GTE, fail: _t.LT },
  exclusiveMaximum: { okStr: "<", ok: _t.LT, fail: _t.GTE },
  exclusiveMinimum: { okStr: ">", ok: _t.GT, fail: _t.LTE }
}, xh = {
  message: ({ keyword: e, schemaCode: t }) => (0, Ln.str)`must be ${Fn[e].okStr} ${t}`,
  params: ({ keyword: e, schemaCode: t }) => (0, Ln._)`{comparison: ${Fn[e].okStr}, limit: ${t}}`
}, em = {
  keyword: Object.keys(Fn),
  type: "number",
  schemaType: "number",
  $data: !0,
  error: xh,
  code(e) {
    const { keyword: t, data: r, schemaCode: n } = e;
    e.fail$data((0, Ln._)`${r} ${Fn[t].fail} ${n} || isNaN(${r})`);
  }
};
Ea.default = em;
var ba = {};
Object.defineProperty(ba, "__esModule", { value: !0 });
const Hr = W, tm = {
  message: ({ schemaCode: e }) => (0, Hr.str)`must be multiple of ${e}`,
  params: ({ schemaCode: e }) => (0, Hr._)`{multipleOf: ${e}}`
}, rm = {
  keyword: "multipleOf",
  type: "number",
  schemaType: "number",
  $data: !0,
  error: tm,
  code(e) {
    const { gen: t, data: r, schemaCode: n, it: s } = e, a = s.opts.multipleOfPrecision, o = t.let("res"), u = a ? (0, Hr._)`Math.abs(Math.round(${o}) - ${o}) > 1e-${a}` : (0, Hr._)`${o} !== parseInt(${o})`;
    e.fail$data((0, Hr._)`(${n} === 0 || (${o} = ${r}/${n}, ${u}))`);
  }
};
ba.default = rm;
var Sa = {}, Pa = {};
Object.defineProperty(Pa, "__esModule", { value: !0 });
function Il(e) {
  const t = e.length;
  let r = 0, n = 0, s;
  for (; n < t; )
    r++, s = e.charCodeAt(n++), s >= 55296 && s <= 56319 && n < t && (s = e.charCodeAt(n), (s & 64512) === 56320 && n++);
  return r;
}
Pa.default = Il;
Il.code = 'require("ajv/dist/runtime/ucs2length").default';
Object.defineProperty(Sa, "__esModule", { value: !0 });
const Jt = W, nm = A, sm = Pa, am = {
  message({ keyword: e, schemaCode: t }) {
    const r = e === "maxLength" ? "more" : "fewer";
    return (0, Jt.str)`must NOT have ${r} than ${t} characters`;
  },
  params: ({ schemaCode: e }) => (0, Jt._)`{limit: ${e}}`
}, om = {
  keyword: ["maxLength", "minLength"],
  type: "string",
  schemaType: "number",
  $data: !0,
  error: am,
  code(e) {
    const { keyword: t, data: r, schemaCode: n, it: s } = e, a = t === "maxLength" ? Jt.operators.GT : Jt.operators.LT, o = s.opts.unicode === !1 ? (0, Jt._)`${r}.length` : (0, Jt._)`${(0, nm.useFunc)(e.gen, sm.default)}(${r})`;
    e.fail$data((0, Jt._)`${o} ${a} ${n}`);
  }
};
Sa.default = om;
var Na = {};
Object.defineProperty(Na, "__esModule", { value: !0 });
const im = ee, zn = W, cm = {
  message: ({ schemaCode: e }) => (0, zn.str)`must match pattern "${e}"`,
  params: ({ schemaCode: e }) => (0, zn._)`{pattern: ${e}}`
}, lm = {
  keyword: "pattern",
  type: "string",
  schemaType: "string",
  $data: !0,
  error: cm,
  code(e) {
    const { data: t, $data: r, schema: n, schemaCode: s, it: a } = e, o = a.opts.unicodeRegExp ? "u" : "", u = r ? (0, zn._)`(new RegExp(${s}, ${o}))` : (0, im.usePattern)(e, n);
    e.fail$data((0, zn._)`!${u}.test(${t})`);
  }
};
Na.default = lm;
var Ra = {};
Object.defineProperty(Ra, "__esModule", { value: !0 });
const Jr = W, um = {
  message({ keyword: e, schemaCode: t }) {
    const r = e === "maxProperties" ? "more" : "fewer";
    return (0, Jr.str)`must NOT have ${r} than ${t} properties`;
  },
  params: ({ schemaCode: e }) => (0, Jr._)`{limit: ${e}}`
}, dm = {
  keyword: ["maxProperties", "minProperties"],
  type: "object",
  schemaType: "number",
  $data: !0,
  error: um,
  code(e) {
    const { keyword: t, data: r, schemaCode: n } = e, s = t === "maxProperties" ? Jr.operators.GT : Jr.operators.LT;
    e.fail$data((0, Jr._)`Object.keys(${r}).length ${s} ${n}`);
  }
};
Ra.default = dm;
var Oa = {};
Object.defineProperty(Oa, "__esModule", { value: !0 });
const Mr = ee, Xr = W, fm = A, hm = {
  message: ({ params: { missingProperty: e } }) => (0, Xr.str)`must have required property '${e}'`,
  params: ({ params: { missingProperty: e } }) => (0, Xr._)`{missingProperty: ${e}}`
}, mm = {
  keyword: "required",
  type: "object",
  schemaType: "array",
  $data: !0,
  error: hm,
  code(e) {
    const { gen: t, schema: r, schemaCode: n, data: s, $data: a, it: o } = e, { opts: u } = o;
    if (!a && r.length === 0)
      return;
    const l = r.length >= u.loopRequired;
    if (o.allErrors ? c() : d(), u.strictRequired) {
      const g = e.parentSchema.properties, { definedProperties: y } = e.it;
      for (const w of r)
        if ((g == null ? void 0 : g[w]) === void 0 && !y.has(w)) {
          const _ = o.schemaEnv.baseId + o.errSchemaPath, m = `required property "${w}" is not defined at "${_}" (strictRequired)`;
          (0, fm.checkStrictMode)(o, m, o.opts.strictRequired);
        }
    }
    function c() {
      if (l || a)
        e.block$data(Xr.nil, h);
      else
        for (const g of r)
          (0, Mr.checkReportMissingProp)(e, g);
    }
    function d() {
      const g = t.let("missing");
      if (l || a) {
        const y = t.let("valid", !0);
        e.block$data(y, () => b(g, y)), e.ok(y);
      } else
        t.if((0, Mr.checkMissingProp)(e, r, g)), (0, Mr.reportMissingProp)(e, g), t.else();
    }
    function h() {
      t.forOf("prop", n, (g) => {
        e.setParams({ missingProperty: g }), t.if((0, Mr.noPropertyInData)(t, s, g, u.ownProperties), () => e.error());
      });
    }
    function b(g, y) {
      e.setParams({ missingProperty: g }), t.forOf(g, n, () => {
        t.assign(y, (0, Mr.propertyInData)(t, s, g, u.ownProperties)), t.if((0, Xr.not)(y), () => {
          e.error(), t.break();
        });
      }, Xr.nil);
    }
  }
};
Oa.default = mm;
var Ia = {};
Object.defineProperty(Ia, "__esModule", { value: !0 });
const Br = W, pm = {
  message({ keyword: e, schemaCode: t }) {
    const r = e === "maxItems" ? "more" : "fewer";
    return (0, Br.str)`must NOT have ${r} than ${t} items`;
  },
  params: ({ schemaCode: e }) => (0, Br._)`{limit: ${e}}`
}, $m = {
  keyword: ["maxItems", "minItems"],
  type: "array",
  schemaType: "number",
  $data: !0,
  error: pm,
  code(e) {
    const { keyword: t, data: r, schemaCode: n } = e, s = t === "maxItems" ? Br.operators.GT : Br.operators.LT;
    e.fail$data((0, Br._)`${r}.length ${s} ${n}`);
  }
};
Ia.default = $m;
var Ta = {}, an = {};
Object.defineProperty(an, "__esModule", { value: !0 });
const Tl = Yn;
Tl.code = 'require("ajv/dist/runtime/equal").default';
an.default = Tl;
Object.defineProperty(Ta, "__esModule", { value: !0 });
const gs = $e, ge = W, ym = A, _m = an, gm = {
  message: ({ params: { i: e, j: t } }) => (0, ge.str)`must NOT have duplicate items (items ## ${t} and ${e} are identical)`,
  params: ({ params: { i: e, j: t } }) => (0, ge._)`{i: ${e}, j: ${t}}`
}, vm = {
  keyword: "uniqueItems",
  type: "array",
  schemaType: "boolean",
  $data: !0,
  error: gm,
  code(e) {
    const { gen: t, data: r, $data: n, schema: s, parentSchema: a, schemaCode: o, it: u } = e;
    if (!n && !s)
      return;
    const l = t.let("valid"), c = a.items ? (0, gs.getSchemaTypes)(a.items) : [];
    e.block$data(l, d, (0, ge._)`${o} === false`), e.ok(l);
    function d() {
      const y = t.let("i", (0, ge._)`${r}.length`), w = t.let("j");
      e.setParams({ i: y, j: w }), t.assign(l, !0), t.if((0, ge._)`${y} > 1`, () => (h() ? b : g)(y, w));
    }
    function h() {
      return c.length > 0 && !c.some((y) => y === "object" || y === "array");
    }
    function b(y, w) {
      const _ = t.name("item"), m = (0, gs.checkDataTypes)(c, _, u.opts.strictNumbers, gs.DataType.Wrong), v = t.const("indices", (0, ge._)`{}`);
      t.for((0, ge._)`;${y}--;`, () => {
        t.let(_, (0, ge._)`${r}[${y}]`), t.if(m, (0, ge._)`continue`), c.length > 1 && t.if((0, ge._)`typeof ${_} == "string"`, (0, ge._)`${_} += "_"`), t.if((0, ge._)`typeof ${v}[${_}] == "number"`, () => {
          t.assign(w, (0, ge._)`${v}[${_}]`), e.error(), t.assign(l, !1).break();
        }).code((0, ge._)`${v}[${_}] = ${y}`);
      });
    }
    function g(y, w) {
      const _ = (0, ym.useFunc)(t, _m.default), m = t.name("outer");
      t.label(m).for((0, ge._)`;${y}--;`, () => t.for((0, ge._)`${w} = ${y}; ${w}--;`, () => t.if((0, ge._)`${_}(${r}[${y}], ${r}[${w}])`, () => {
        e.error(), t.assign(l, !1).break(m);
      })));
    }
  }
};
Ta.default = vm;
var ja = {};
Object.defineProperty(ja, "__esModule", { value: !0 });
const zs = W, wm = A, Em = an, bm = {
  message: "must be equal to constant",
  params: ({ schemaCode: e }) => (0, zs._)`{allowedValue: ${e}}`
}, Sm = {
  keyword: "const",
  $data: !0,
  error: bm,
  code(e) {
    const { gen: t, data: r, $data: n, schemaCode: s, schema: a } = e;
    n || a && typeof a == "object" ? e.fail$data((0, zs._)`!${(0, wm.useFunc)(t, Em.default)}(${r}, ${s})`) : e.fail((0, zs._)`${a} !== ${r}`);
  }
};
ja.default = Sm;
var ka = {};
Object.defineProperty(ka, "__esModule", { value: !0 });
const Ur = W, Pm = A, Nm = an, Rm = {
  message: "must be equal to one of the allowed values",
  params: ({ schemaCode: e }) => (0, Ur._)`{allowedValues: ${e}}`
}, Om = {
  keyword: "enum",
  schemaType: "array",
  $data: !0,
  error: Rm,
  code(e) {
    const { gen: t, data: r, $data: n, schema: s, schemaCode: a, it: o } = e;
    if (!n && s.length === 0)
      throw new Error("enum must have non-empty array");
    const u = s.length >= o.opts.loopEnum;
    let l;
    const c = () => l ?? (l = (0, Pm.useFunc)(t, Nm.default));
    let d;
    if (u || n)
      d = t.let("valid"), e.block$data(d, h);
    else {
      if (!Array.isArray(s))
        throw new Error("ajv implementation error");
      const g = t.const("vSchema", a);
      d = (0, Ur.or)(...s.map((y, w) => b(g, w)));
    }
    e.pass(d);
    function h() {
      t.assign(d, !1), t.forOf("v", a, (g) => t.if((0, Ur._)`${c()}(${r}, ${g})`, () => t.assign(d, !0).break()));
    }
    function b(g, y) {
      const w = s[y];
      return typeof w == "object" && w !== null ? (0, Ur._)`${c()}(${r}, ${g}[${y}])` : (0, Ur._)`${r} === ${w}`;
    }
  }
};
ka.default = Om;
Object.defineProperty(wa, "__esModule", { value: !0 });
const Im = Ea, Tm = ba, jm = Sa, km = Na, Am = Ra, Cm = Oa, Dm = Ia, Mm = Ta, Vm = ja, Lm = ka, Fm = [
  // number
  Im.default,
  Tm.default,
  // string
  jm.default,
  km.default,
  // object
  Am.default,
  Cm.default,
  // array
  Dm.default,
  Mm.default,
  // any
  { keyword: "type", schemaType: ["string", "array"] },
  { keyword: "nullable", schemaType: "boolean" },
  Vm.default,
  Lm.default
];
wa.default = Fm;
var Aa = {}, wr = {};
Object.defineProperty(wr, "__esModule", { value: !0 });
wr.validateAdditionalItems = void 0;
const Xt = W, Us = A, zm = {
  message: ({ params: { len: e } }) => (0, Xt.str)`must NOT have more than ${e} items`,
  params: ({ params: { len: e } }) => (0, Xt._)`{limit: ${e}}`
}, Um = {
  keyword: "additionalItems",
  type: "array",
  schemaType: ["boolean", "object"],
  before: "uniqueItems",
  error: zm,
  code(e) {
    const { parentSchema: t, it: r } = e, { items: n } = t;
    if (!Array.isArray(n)) {
      (0, Us.checkStrictMode)(r, '"additionalItems" is ignored when "items" is not an array of schemas');
      return;
    }
    jl(e, n);
  }
};
function jl(e, t) {
  const { gen: r, schema: n, data: s, keyword: a, it: o } = e;
  o.items = !0;
  const u = r.const("len", (0, Xt._)`${s}.length`);
  if (n === !1)
    e.setParams({ len: t.length }), e.pass((0, Xt._)`${u} <= ${t.length}`);
  else if (typeof n == "object" && !(0, Us.alwaysValidSchema)(o, n)) {
    const c = r.var("valid", (0, Xt._)`${u} <= ${t.length}`);
    r.if((0, Xt.not)(c), () => l(c)), e.ok(c);
  }
  function l(c) {
    r.forRange("i", t.length, u, (d) => {
      e.subschema({ keyword: a, dataProp: d, dataPropType: Us.Type.Num }, c), o.allErrors || r.if((0, Xt.not)(c), () => r.break());
    });
  }
}
wr.validateAdditionalItems = jl;
wr.default = Um;
var Ca = {}, Er = {};
Object.defineProperty(Er, "__esModule", { value: !0 });
Er.validateTuple = void 0;
const bi = W, Tn = A, qm = ee, Gm = {
  keyword: "items",
  type: "array",
  schemaType: ["object", "array", "boolean"],
  before: "uniqueItems",
  code(e) {
    const { schema: t, it: r } = e;
    if (Array.isArray(t))
      return kl(e, "additionalItems", t);
    r.items = !0, !(0, Tn.alwaysValidSchema)(r, t) && e.ok((0, qm.validateArray)(e));
  }
};
function kl(e, t, r = e.schema) {
  const { gen: n, parentSchema: s, data: a, keyword: o, it: u } = e;
  d(s), u.opts.unevaluated && r.length && u.items !== !0 && (u.items = Tn.mergeEvaluated.items(n, r.length, u.items));
  const l = n.name("valid"), c = n.const("len", (0, bi._)`${a}.length`);
  r.forEach((h, b) => {
    (0, Tn.alwaysValidSchema)(u, h) || (n.if((0, bi._)`${c} > ${b}`, () => e.subschema({
      keyword: o,
      schemaProp: b,
      dataProp: b
    }, l)), e.ok(l));
  });
  function d(h) {
    const { opts: b, errSchemaPath: g } = u, y = r.length, w = y === h.minItems && (y === h.maxItems || h[t] === !1);
    if (b.strictTuples && !w) {
      const _ = `"${o}" is ${y}-tuple, but minItems or maxItems/${t} are not specified or different at path "${g}"`;
      (0, Tn.checkStrictMode)(u, _, b.strictTuples);
    }
  }
}
Er.validateTuple = kl;
Er.default = Gm;
Object.defineProperty(Ca, "__esModule", { value: !0 });
const Km = Er, Hm = {
  keyword: "prefixItems",
  type: "array",
  schemaType: ["array"],
  before: "uniqueItems",
  code: (e) => (0, Km.validateTuple)(e, "items")
};
Ca.default = Hm;
var Da = {};
Object.defineProperty(Da, "__esModule", { value: !0 });
const Si = W, Jm = A, Xm = ee, Bm = wr, Wm = {
  message: ({ params: { len: e } }) => (0, Si.str)`must NOT have more than ${e} items`,
  params: ({ params: { len: e } }) => (0, Si._)`{limit: ${e}}`
}, Ym = {
  keyword: "items",
  type: "array",
  schemaType: ["object", "boolean"],
  before: "uniqueItems",
  error: Wm,
  code(e) {
    const { schema: t, parentSchema: r, it: n } = e, { prefixItems: s } = r;
    n.items = !0, !(0, Jm.alwaysValidSchema)(n, t) && (s ? (0, Bm.validateAdditionalItems)(e, s) : e.ok((0, Xm.validateArray)(e)));
  }
};
Da.default = Ym;
var Ma = {};
Object.defineProperty(Ma, "__esModule", { value: !0 });
const Fe = W, hn = A, Qm = {
  message: ({ params: { min: e, max: t } }) => t === void 0 ? (0, Fe.str)`must contain at least ${e} valid item(s)` : (0, Fe.str)`must contain at least ${e} and no more than ${t} valid item(s)`,
  params: ({ params: { min: e, max: t } }) => t === void 0 ? (0, Fe._)`{minContains: ${e}}` : (0, Fe._)`{minContains: ${e}, maxContains: ${t}}`
}, Zm = {
  keyword: "contains",
  type: "array",
  schemaType: ["object", "boolean"],
  before: "uniqueItems",
  trackErrors: !0,
  error: Qm,
  code(e) {
    const { gen: t, schema: r, parentSchema: n, data: s, it: a } = e;
    let o, u;
    const { minContains: l, maxContains: c } = n;
    a.opts.next ? (o = l === void 0 ? 1 : l, u = c) : o = 1;
    const d = t.const("len", (0, Fe._)`${s}.length`);
    if (e.setParams({ min: o, max: u }), u === void 0 && o === 0) {
      (0, hn.checkStrictMode)(a, '"minContains" == 0 without "maxContains": "contains" keyword ignored');
      return;
    }
    if (u !== void 0 && o > u) {
      (0, hn.checkStrictMode)(a, '"minContains" > "maxContains" is always invalid'), e.fail();
      return;
    }
    if ((0, hn.alwaysValidSchema)(a, r)) {
      let w = (0, Fe._)`${d} >= ${o}`;
      u !== void 0 && (w = (0, Fe._)`${w} && ${d} <= ${u}`), e.pass(w);
      return;
    }
    a.items = !0;
    const h = t.name("valid");
    u === void 0 && o === 1 ? g(h, () => t.if(h, () => t.break())) : o === 0 ? (t.let(h, !0), u !== void 0 && t.if((0, Fe._)`${s}.length > 0`, b)) : (t.let(h, !1), b()), e.result(h, () => e.reset());
    function b() {
      const w = t.name("_valid"), _ = t.let("count", 0);
      g(w, () => t.if(w, () => y(_)));
    }
    function g(w, _) {
      t.forRange("i", 0, d, (m) => {
        e.subschema({
          keyword: "contains",
          dataProp: m,
          dataPropType: hn.Type.Num,
          compositeRule: !0
        }, w), _();
      });
    }
    function y(w) {
      t.code((0, Fe._)`${w}++`), u === void 0 ? t.if((0, Fe._)`${w} >= ${o}`, () => t.assign(h, !0).break()) : (t.if((0, Fe._)`${w} > ${u}`, () => t.assign(h, !1).break()), o === 1 ? t.assign(h, !0) : t.if((0, Fe._)`${w} >= ${o}`, () => t.assign(h, !0)));
    }
  }
};
Ma.default = Zm;
var es = {};
(function(e) {
  Object.defineProperty(e, "__esModule", { value: !0 }), e.validateSchemaDeps = e.validatePropertyDeps = e.error = void 0;
  const t = W, r = A, n = ee;
  e.error = {
    message: ({ params: { property: l, depsCount: c, deps: d } }) => {
      const h = c === 1 ? "property" : "properties";
      return (0, t.str)`must have ${h} ${d} when property ${l} is present`;
    },
    params: ({ params: { property: l, depsCount: c, deps: d, missingProperty: h } }) => (0, t._)`{property: ${l},
    missingProperty: ${h},
    depsCount: ${c},
    deps: ${d}}`
    // TODO change to reference
  };
  const s = {
    keyword: "dependencies",
    type: "object",
    schemaType: "object",
    error: e.error,
    code(l) {
      const [c, d] = a(l);
      o(l, c), u(l, d);
    }
  };
  function a({ schema: l }) {
    const c = {}, d = {};
    for (const h in l) {
      if (h === "__proto__")
        continue;
      const b = Array.isArray(l[h]) ? c : d;
      b[h] = l[h];
    }
    return [c, d];
  }
  function o(l, c = l.schema) {
    const { gen: d, data: h, it: b } = l;
    if (Object.keys(c).length === 0)
      return;
    const g = d.let("missing");
    for (const y in c) {
      const w = c[y];
      if (w.length === 0)
        continue;
      const _ = (0, n.propertyInData)(d, h, y, b.opts.ownProperties);
      l.setParams({
        property: y,
        depsCount: w.length,
        deps: w.join(", ")
      }), b.allErrors ? d.if(_, () => {
        for (const m of w)
          (0, n.checkReportMissingProp)(l, m);
      }) : (d.if((0, t._)`${_} && (${(0, n.checkMissingProp)(l, w, g)})`), (0, n.reportMissingProp)(l, g), d.else());
    }
  }
  e.validatePropertyDeps = o;
  function u(l, c = l.schema) {
    const { gen: d, data: h, keyword: b, it: g } = l, y = d.name("valid");
    for (const w in c)
      (0, r.alwaysValidSchema)(g, c[w]) || (d.if(
        (0, n.propertyInData)(d, h, w, g.opts.ownProperties),
        () => {
          const _ = l.subschema({ keyword: b, schemaProp: w }, y);
          l.mergeValidEvaluated(_, y);
        },
        () => d.var(y, !0)
        // TODO var
      ), l.ok(y));
  }
  e.validateSchemaDeps = u, e.default = s;
})(es);
var Va = {};
Object.defineProperty(Va, "__esModule", { value: !0 });
const Al = W, xm = A, ep = {
  message: "property name must be valid",
  params: ({ params: e }) => (0, Al._)`{propertyName: ${e.propertyName}}`
}, tp = {
  keyword: "propertyNames",
  type: "object",
  schemaType: ["object", "boolean"],
  error: ep,
  code(e) {
    const { gen: t, schema: r, data: n, it: s } = e;
    if ((0, xm.alwaysValidSchema)(s, r))
      return;
    const a = t.name("valid");
    t.forIn("key", n, (o) => {
      e.setParams({ propertyName: o }), e.subschema({
        keyword: "propertyNames",
        data: o,
        dataTypes: ["string"],
        propertyName: o,
        compositeRule: !0
      }, a), t.if((0, Al.not)(a), () => {
        e.error(!0), s.allErrors || t.break();
      });
    }), e.ok(a);
  }
};
Va.default = tp;
var ts = {};
Object.defineProperty(ts, "__esModule", { value: !0 });
const mn = ee, Ke = W, rp = Le, pn = A, np = {
  message: "must NOT have additional properties",
  params: ({ params: e }) => (0, Ke._)`{additionalProperty: ${e.additionalProperty}}`
}, sp = {
  keyword: "additionalProperties",
  type: ["object"],
  schemaType: ["boolean", "object"],
  allowUndefined: !0,
  trackErrors: !0,
  error: np,
  code(e) {
    const { gen: t, schema: r, parentSchema: n, data: s, errsCount: a, it: o } = e;
    if (!a)
      throw new Error("ajv implementation error");
    const { allErrors: u, opts: l } = o;
    if (o.props = !0, l.removeAdditional !== "all" && (0, pn.alwaysValidSchema)(o, r))
      return;
    const c = (0, mn.allSchemaProperties)(n.properties), d = (0, mn.allSchemaProperties)(n.patternProperties);
    h(), e.ok((0, Ke._)`${a} === ${rp.default.errors}`);
    function h() {
      t.forIn("key", s, (_) => {
        !c.length && !d.length ? y(_) : t.if(b(_), () => y(_));
      });
    }
    function b(_) {
      let m;
      if (c.length > 8) {
        const v = (0, pn.schemaRefOrVal)(o, n.properties, "properties");
        m = (0, mn.isOwnProperty)(t, v, _);
      } else c.length ? m = (0, Ke.or)(...c.map((v) => (0, Ke._)`${_} === ${v}`)) : m = Ke.nil;
      return d.length && (m = (0, Ke.or)(m, ...d.map((v) => (0, Ke._)`${(0, mn.usePattern)(e, v)}.test(${_})`))), (0, Ke.not)(m);
    }
    function g(_) {
      t.code((0, Ke._)`delete ${s}[${_}]`);
    }
    function y(_) {
      if (l.removeAdditional === "all" || l.removeAdditional && r === !1) {
        g(_);
        return;
      }
      if (r === !1) {
        e.setParams({ additionalProperty: _ }), e.error(), u || t.break();
        return;
      }
      if (typeof r == "object" && !(0, pn.alwaysValidSchema)(o, r)) {
        const m = t.name("valid");
        l.removeAdditional === "failing" ? (w(_, m, !1), t.if((0, Ke.not)(m), () => {
          e.reset(), g(_);
        })) : (w(_, m), u || t.if((0, Ke.not)(m), () => t.break()));
      }
    }
    function w(_, m, v) {
      const N = {
        keyword: "additionalProperties",
        dataProp: _,
        dataPropType: pn.Type.Str
      };
      v === !1 && Object.assign(N, {
        compositeRule: !0,
        createErrors: !1,
        allErrors: !1
      }), e.subschema(N, m);
    }
  }
};
ts.default = sp;
var La = {};
Object.defineProperty(La, "__esModule", { value: !0 });
const ap = Be, Pi = ee, vs = A, Ni = ts, op = {
  keyword: "properties",
  type: "object",
  schemaType: "object",
  code(e) {
    const { gen: t, schema: r, parentSchema: n, data: s, it: a } = e;
    a.opts.removeAdditional === "all" && n.additionalProperties === void 0 && Ni.default.code(new ap.KeywordCxt(a, Ni.default, "additionalProperties"));
    const o = (0, Pi.allSchemaProperties)(r);
    for (const h of o)
      a.definedProperties.add(h);
    a.opts.unevaluated && o.length && a.props !== !0 && (a.props = vs.mergeEvaluated.props(t, (0, vs.toHash)(o), a.props));
    const u = o.filter((h) => !(0, vs.alwaysValidSchema)(a, r[h]));
    if (u.length === 0)
      return;
    const l = t.name("valid");
    for (const h of u)
      c(h) ? d(h) : (t.if((0, Pi.propertyInData)(t, s, h, a.opts.ownProperties)), d(h), a.allErrors || t.else().var(l, !0), t.endIf()), e.it.definedProperties.add(h), e.ok(l);
    function c(h) {
      return a.opts.useDefaults && !a.compositeRule && r[h].default !== void 0;
    }
    function d(h) {
      e.subschema({
        keyword: "properties",
        schemaProp: h,
        dataProp: h
      }, l);
    }
  }
};
La.default = op;
var Fa = {};
Object.defineProperty(Fa, "__esModule", { value: !0 });
const Ri = ee, $n = W, Oi = A, Ii = A, ip = {
  keyword: "patternProperties",
  type: "object",
  schemaType: "object",
  code(e) {
    const { gen: t, schema: r, data: n, parentSchema: s, it: a } = e, { opts: o } = a, u = (0, Ri.allSchemaProperties)(r), l = u.filter((w) => (0, Oi.alwaysValidSchema)(a, r[w]));
    if (u.length === 0 || l.length === u.length && (!a.opts.unevaluated || a.props === !0))
      return;
    const c = o.strictSchema && !o.allowMatchingProperties && s.properties, d = t.name("valid");
    a.props !== !0 && !(a.props instanceof $n.Name) && (a.props = (0, Ii.evaluatedPropsToName)(t, a.props));
    const { props: h } = a;
    b();
    function b() {
      for (const w of u)
        c && g(w), a.allErrors ? y(w) : (t.var(d, !0), y(w), t.if(d));
    }
    function g(w) {
      for (const _ in c)
        new RegExp(w).test(_) && (0, Oi.checkStrictMode)(a, `property ${_} matches pattern ${w} (use allowMatchingProperties)`);
    }
    function y(w) {
      t.forIn("key", n, (_) => {
        t.if((0, $n._)`${(0, Ri.usePattern)(e, w)}.test(${_})`, () => {
          const m = l.includes(w);
          m || e.subschema({
            keyword: "patternProperties",
            schemaProp: w,
            dataProp: _,
            dataPropType: Ii.Type.Str
          }, d), a.opts.unevaluated && h !== !0 ? t.assign((0, $n._)`${h}[${_}]`, !0) : !m && !a.allErrors && t.if((0, $n.not)(d), () => t.break());
        });
      });
    }
  }
};
Fa.default = ip;
var za = {};
Object.defineProperty(za, "__esModule", { value: !0 });
const cp = A, lp = {
  keyword: "not",
  schemaType: ["object", "boolean"],
  trackErrors: !0,
  code(e) {
    const { gen: t, schema: r, it: n } = e;
    if ((0, cp.alwaysValidSchema)(n, r)) {
      e.fail();
      return;
    }
    const s = t.name("valid");
    e.subschema({
      keyword: "not",
      compositeRule: !0,
      createErrors: !1,
      allErrors: !1
    }, s), e.failResult(s, () => e.reset(), () => e.error());
  },
  error: { message: "must NOT be valid" }
};
za.default = lp;
var Ua = {};
Object.defineProperty(Ua, "__esModule", { value: !0 });
const up = ee, dp = {
  keyword: "anyOf",
  schemaType: "array",
  trackErrors: !0,
  code: up.validateUnion,
  error: { message: "must match a schema in anyOf" }
};
Ua.default = dp;
var qa = {};
Object.defineProperty(qa, "__esModule", { value: !0 });
const jn = W, fp = A, hp = {
  message: "must match exactly one schema in oneOf",
  params: ({ params: e }) => (0, jn._)`{passingSchemas: ${e.passing}}`
}, mp = {
  keyword: "oneOf",
  schemaType: "array",
  trackErrors: !0,
  error: hp,
  code(e) {
    const { gen: t, schema: r, parentSchema: n, it: s } = e;
    if (!Array.isArray(r))
      throw new Error("ajv implementation error");
    if (s.opts.discriminator && n.discriminator)
      return;
    const a = r, o = t.let("valid", !1), u = t.let("passing", null), l = t.name("_valid");
    e.setParams({ passing: u }), t.block(c), e.result(o, () => e.reset(), () => e.error(!0));
    function c() {
      a.forEach((d, h) => {
        let b;
        (0, fp.alwaysValidSchema)(s, d) ? t.var(l, !0) : b = e.subschema({
          keyword: "oneOf",
          schemaProp: h,
          compositeRule: !0
        }, l), h > 0 && t.if((0, jn._)`${l} && ${o}`).assign(o, !1).assign(u, (0, jn._)`[${u}, ${h}]`).else(), t.if(l, () => {
          t.assign(o, !0), t.assign(u, h), b && e.mergeEvaluated(b, jn.Name);
        });
      });
    }
  }
};
qa.default = mp;
var Ga = {};
Object.defineProperty(Ga, "__esModule", { value: !0 });
const pp = A, $p = {
  keyword: "allOf",
  schemaType: "array",
  code(e) {
    const { gen: t, schema: r, it: n } = e;
    if (!Array.isArray(r))
      throw new Error("ajv implementation error");
    const s = t.name("valid");
    r.forEach((a, o) => {
      if ((0, pp.alwaysValidSchema)(n, a))
        return;
      const u = e.subschema({ keyword: "allOf", schemaProp: o }, s);
      e.ok(s), e.mergeEvaluated(u);
    });
  }
};
Ga.default = $p;
var Ka = {};
Object.defineProperty(Ka, "__esModule", { value: !0 });
const Un = W, Cl = A, yp = {
  message: ({ params: e }) => (0, Un.str)`must match "${e.ifClause}" schema`,
  params: ({ params: e }) => (0, Un._)`{failingKeyword: ${e.ifClause}}`
}, _p = {
  keyword: "if",
  schemaType: ["object", "boolean"],
  trackErrors: !0,
  error: yp,
  code(e) {
    const { gen: t, parentSchema: r, it: n } = e;
    r.then === void 0 && r.else === void 0 && (0, Cl.checkStrictMode)(n, '"if" without "then" and "else" is ignored');
    const s = Ti(n, "then"), a = Ti(n, "else");
    if (!s && !a)
      return;
    const o = t.let("valid", !0), u = t.name("_valid");
    if (l(), e.reset(), s && a) {
      const d = t.let("ifClause");
      e.setParams({ ifClause: d }), t.if(u, c("then", d), c("else", d));
    } else s ? t.if(u, c("then")) : t.if((0, Un.not)(u), c("else"));
    e.pass(o, () => e.error(!0));
    function l() {
      const d = e.subschema({
        keyword: "if",
        compositeRule: !0,
        createErrors: !1,
        allErrors: !1
      }, u);
      e.mergeEvaluated(d);
    }
    function c(d, h) {
      return () => {
        const b = e.subschema({ keyword: d }, u);
        t.assign(o, u), e.mergeValidEvaluated(b, o), h ? t.assign(h, (0, Un._)`${d}`) : e.setParams({ ifClause: d });
      };
    }
  }
};
function Ti(e, t) {
  const r = e.schema[t];
  return r !== void 0 && !(0, Cl.alwaysValidSchema)(e, r);
}
Ka.default = _p;
var Ha = {};
Object.defineProperty(Ha, "__esModule", { value: !0 });
const gp = A, vp = {
  keyword: ["then", "else"],
  schemaType: ["object", "boolean"],
  code({ keyword: e, parentSchema: t, it: r }) {
    t.if === void 0 && (0, gp.checkStrictMode)(r, `"${e}" without "if" is ignored`);
  }
};
Ha.default = vp;
Object.defineProperty(Aa, "__esModule", { value: !0 });
const wp = wr, Ep = Ca, bp = Er, Sp = Da, Pp = Ma, Np = es, Rp = Va, Op = ts, Ip = La, Tp = Fa, jp = za, kp = Ua, Ap = qa, Cp = Ga, Dp = Ka, Mp = Ha;
function Vp(e = !1) {
  const t = [
    // any
    jp.default,
    kp.default,
    Ap.default,
    Cp.default,
    Dp.default,
    Mp.default,
    // object
    Rp.default,
    Op.default,
    Np.default,
    Ip.default,
    Tp.default
  ];
  return e ? t.push(Ep.default, Sp.default) : t.push(wp.default, bp.default), t.push(Pp.default), t;
}
Aa.default = Vp;
var Ja = {}, br = {};
Object.defineProperty(br, "__esModule", { value: !0 });
br.dynamicAnchor = void 0;
const ws = W, Lp = Le, ji = Te, Fp = ht, zp = {
  keyword: "$dynamicAnchor",
  schemaType: "string",
  code: (e) => Dl(e, e.schema)
};
function Dl(e, t) {
  const { gen: r, it: n } = e;
  n.schemaEnv.root.dynamicAnchors[t] = !0;
  const s = (0, ws._)`${Lp.default.dynamicAnchors}${(0, ws.getProperty)(t)}`, a = n.errSchemaPath === "#" ? n.validateName : Up(e);
  r.if((0, ws._)`!${s}`, () => r.assign(s, a));
}
br.dynamicAnchor = Dl;
function Up(e) {
  const { schemaEnv: t, schema: r, self: n } = e.it, { root: s, baseId: a, localRefs: o, meta: u } = t.root, { schemaId: l } = n.opts, c = new ji.SchemaEnv({ schema: r, schemaId: l, root: s, baseId: a, localRefs: o, meta: u });
  return ji.compileSchema.call(n, c), (0, Fp.getValidate)(e, c);
}
br.default = zp;
var Sr = {};
Object.defineProperty(Sr, "__esModule", { value: !0 });
Sr.dynamicRef = void 0;
const ki = W, qp = Le, Ai = ht, Gp = {
  keyword: "$dynamicRef",
  schemaType: "string",
  code: (e) => Ml(e, e.schema)
};
function Ml(e, t) {
  const { gen: r, keyword: n, it: s } = e;
  if (t[0] !== "#")
    throw new Error(`"${n}" only supports hash fragment reference`);
  const a = t.slice(1);
  if (s.allErrors)
    o();
  else {
    const l = r.let("valid", !1);
    o(l), e.ok(l);
  }
  function o(l) {
    if (s.schemaEnv.root.dynamicAnchors[a]) {
      const c = r.let("_v", (0, ki._)`${qp.default.dynamicAnchors}${(0, ki.getProperty)(a)}`);
      r.if(c, u(c, l), u(s.validateName, l));
    } else
      u(s.validateName, l)();
  }
  function u(l, c) {
    return c ? () => r.block(() => {
      (0, Ai.callRef)(e, l), r.let(c, !0);
    }) : () => (0, Ai.callRef)(e, l);
  }
}
Sr.dynamicRef = Ml;
Sr.default = Gp;
var Xa = {};
Object.defineProperty(Xa, "__esModule", { value: !0 });
const Kp = br, Hp = A, Jp = {
  keyword: "$recursiveAnchor",
  schemaType: "boolean",
  code(e) {
    e.schema ? (0, Kp.dynamicAnchor)(e, "") : (0, Hp.checkStrictMode)(e.it, "$recursiveAnchor: false is ignored");
  }
};
Xa.default = Jp;
var Ba = {};
Object.defineProperty(Ba, "__esModule", { value: !0 });
const Xp = Sr, Bp = {
  keyword: "$recursiveRef",
  schemaType: "string",
  code: (e) => (0, Xp.dynamicRef)(e, e.schema)
};
Ba.default = Bp;
Object.defineProperty(Ja, "__esModule", { value: !0 });
const Wp = br, Yp = Sr, Qp = Xa, Zp = Ba, xp = [Wp.default, Yp.default, Qp.default, Zp.default];
Ja.default = xp;
var Wa = {}, Ya = {};
Object.defineProperty(Ya, "__esModule", { value: !0 });
const Ci = es, e$ = {
  keyword: "dependentRequired",
  type: "object",
  schemaType: "object",
  error: Ci.error,
  code: (e) => (0, Ci.validatePropertyDeps)(e)
};
Ya.default = e$;
var Qa = {};
Object.defineProperty(Qa, "__esModule", { value: !0 });
const t$ = es, r$ = {
  keyword: "dependentSchemas",
  type: "object",
  schemaType: "object",
  code: (e) => (0, t$.validateSchemaDeps)(e)
};
Qa.default = r$;
var Za = {};
Object.defineProperty(Za, "__esModule", { value: !0 });
const n$ = A, s$ = {
  keyword: ["maxContains", "minContains"],
  type: "array",
  schemaType: "number",
  code({ keyword: e, parentSchema: t, it: r }) {
    t.contains === void 0 && (0, n$.checkStrictMode)(r, `"${e}" without "contains" is ignored`);
  }
};
Za.default = s$;
Object.defineProperty(Wa, "__esModule", { value: !0 });
const a$ = Ya, o$ = Qa, i$ = Za, c$ = [a$.default, o$.default, i$.default];
Wa.default = c$;
var xa = {}, eo = {};
Object.defineProperty(eo, "__esModule", { value: !0 });
const wt = W, Di = A, l$ = Le, u$ = {
  message: "must NOT have unevaluated properties",
  params: ({ params: e }) => (0, wt._)`{unevaluatedProperty: ${e.unevaluatedProperty}}`
}, d$ = {
  keyword: "unevaluatedProperties",
  type: "object",
  schemaType: ["boolean", "object"],
  trackErrors: !0,
  error: u$,
  code(e) {
    const { gen: t, schema: r, data: n, errsCount: s, it: a } = e;
    if (!s)
      throw new Error("ajv implementation error");
    const { allErrors: o, props: u } = a;
    u instanceof wt.Name ? t.if((0, wt._)`${u} !== true`, () => t.forIn("key", n, (h) => t.if(c(u, h), () => l(h)))) : u !== !0 && t.forIn("key", n, (h) => u === void 0 ? l(h) : t.if(d(u, h), () => l(h))), a.props = !0, e.ok((0, wt._)`${s} === ${l$.default.errors}`);
    function l(h) {
      if (r === !1) {
        e.setParams({ unevaluatedProperty: h }), e.error(), o || t.break();
        return;
      }
      if (!(0, Di.alwaysValidSchema)(a, r)) {
        const b = t.name("valid");
        e.subschema({
          keyword: "unevaluatedProperties",
          dataProp: h,
          dataPropType: Di.Type.Str
        }, b), o || t.if((0, wt.not)(b), () => t.break());
      }
    }
    function c(h, b) {
      return (0, wt._)`!${h} || !${h}[${b}]`;
    }
    function d(h, b) {
      const g = [];
      for (const y in h)
        h[y] === !0 && g.push((0, wt._)`${b} !== ${y}`);
      return (0, wt.and)(...g);
    }
  }
};
eo.default = d$;
var to = {};
Object.defineProperty(to, "__esModule", { value: !0 });
const Bt = W, Mi = A, f$ = {
  message: ({ params: { len: e } }) => (0, Bt.str)`must NOT have more than ${e} items`,
  params: ({ params: { len: e } }) => (0, Bt._)`{limit: ${e}}`
}, h$ = {
  keyword: "unevaluatedItems",
  type: "array",
  schemaType: ["boolean", "object"],
  error: f$,
  code(e) {
    const { gen: t, schema: r, data: n, it: s } = e, a = s.items || 0;
    if (a === !0)
      return;
    const o = t.const("len", (0, Bt._)`${n}.length`);
    if (r === !1)
      e.setParams({ len: a }), e.fail((0, Bt._)`${o} > ${a}`);
    else if (typeof r == "object" && !(0, Mi.alwaysValidSchema)(s, r)) {
      const l = t.var("valid", (0, Bt._)`${o} <= ${a}`);
      t.if((0, Bt.not)(l), () => u(l, a)), e.ok(l);
    }
    s.items = !0;
    function u(l, c) {
      t.forRange("i", c, o, (d) => {
        e.subschema({ keyword: "unevaluatedItems", dataProp: d, dataPropType: Mi.Type.Num }, l), s.allErrors || t.if((0, Bt.not)(l), () => t.break());
      });
    }
  }
};
to.default = h$;
Object.defineProperty(xa, "__esModule", { value: !0 });
const m$ = eo, p$ = to, $$ = [m$.default, p$.default];
xa.default = $$;
var ro = {}, no = {};
Object.defineProperty(no, "__esModule", { value: !0 });
const he = W, y$ = {
  message: ({ schemaCode: e }) => (0, he.str)`must match format "${e}"`,
  params: ({ schemaCode: e }) => (0, he._)`{format: ${e}}`
}, _$ = {
  keyword: "format",
  type: ["number", "string"],
  schemaType: "string",
  $data: !0,
  error: y$,
  code(e, t) {
    const { gen: r, data: n, $data: s, schema: a, schemaCode: o, it: u } = e, { opts: l, errSchemaPath: c, schemaEnv: d, self: h } = u;
    if (!l.validateFormats)
      return;
    s ? b() : g();
    function b() {
      const y = r.scopeValue("formats", {
        ref: h.formats,
        code: l.code.formats
      }), w = r.const("fDef", (0, he._)`${y}[${o}]`), _ = r.let("fType"), m = r.let("format");
      r.if((0, he._)`typeof ${w} == "object" && !(${w} instanceof RegExp)`, () => r.assign(_, (0, he._)`${w}.type || "string"`).assign(m, (0, he._)`${w}.validate`), () => r.assign(_, (0, he._)`"string"`).assign(m, w)), e.fail$data((0, he.or)(v(), N()));
      function v() {
        return l.strictSchema === !1 ? he.nil : (0, he._)`${o} && !${m}`;
      }
      function N() {
        const R = d.$async ? (0, he._)`(${w}.async ? await ${m}(${n}) : ${m}(${n}))` : (0, he._)`${m}(${n})`, O = (0, he._)`(typeof ${m} == "function" ? ${R} : ${m}.test(${n}))`;
        return (0, he._)`${m} && ${m} !== true && ${_} === ${t} && !${O}`;
      }
    }
    function g() {
      const y = h.formats[a];
      if (!y) {
        v();
        return;
      }
      if (y === !0)
        return;
      const [w, _, m] = N(y);
      w === t && e.pass(R());
      function v() {
        if (l.strictSchema === !1) {
          h.logger.warn(O());
          return;
        }
        throw new Error(O());
        function O() {
          return `unknown format "${a}" ignored in schema at path "${c}"`;
        }
      }
      function N(O) {
        const G = O instanceof RegExp ? (0, he.regexpCode)(O) : l.code.formats ? (0, he._)`${l.code.formats}${(0, he.getProperty)(a)}` : void 0, B = r.scopeValue("formats", { key: a, ref: O, code: G });
        return typeof O == "object" && !(O instanceof RegExp) ? [O.type || "string", O.validate, (0, he._)`${B}.validate`] : ["string", O, B];
      }
      function R() {
        if (typeof y == "object" && !(y instanceof RegExp) && y.async) {
          if (!d.$async)
            throw new Error("async format in sync schema");
          return (0, he._)`await ${m}(${n})`;
        }
        return typeof _ == "function" ? (0, he._)`${m}(${n})` : (0, he._)`${m}.test(${n})`;
      }
    }
  }
};
no.default = _$;
Object.defineProperty(ro, "__esModule", { value: !0 });
const g$ = no, v$ = [g$.default];
ro.default = v$;
var yr = {};
Object.defineProperty(yr, "__esModule", { value: !0 });
yr.contentVocabulary = yr.metadataVocabulary = void 0;
yr.metadataVocabulary = [
  "title",
  "description",
  "default",
  "deprecated",
  "readOnly",
  "writeOnly",
  "examples"
];
yr.contentVocabulary = [
  "contentMediaType",
  "contentEncoding",
  "contentSchema"
];
Object.defineProperty(_a, "__esModule", { value: !0 });
const w$ = ga, E$ = wa, b$ = Aa, S$ = Ja, P$ = Wa, N$ = xa, R$ = ro, Vi = yr, O$ = [
  S$.default,
  w$.default,
  E$.default,
  (0, b$.default)(!0),
  R$.default,
  Vi.metadataVocabulary,
  Vi.contentVocabulary,
  P$.default,
  N$.default
];
_a.default = O$;
var so = {}, rs = {};
Object.defineProperty(rs, "__esModule", { value: !0 });
rs.DiscrError = void 0;
var Li;
(function(e) {
  e.Tag = "tag", e.Mapping = "mapping";
})(Li || (rs.DiscrError = Li = {}));
Object.defineProperty(so, "__esModule", { value: !0 });
const lr = W, qs = rs, Fi = Te, I$ = vr, T$ = A, j$ = {
  message: ({ params: { discrError: e, tagName: t } }) => e === qs.DiscrError.Tag ? `tag "${t}" must be string` : `value of tag "${t}" must be in oneOf`,
  params: ({ params: { discrError: e, tag: t, tagName: r } }) => (0, lr._)`{error: ${e}, tag: ${r}, tagValue: ${t}}`
}, k$ = {
  keyword: "discriminator",
  type: "object",
  schemaType: "object",
  error: j$,
  code(e) {
    const { gen: t, data: r, schema: n, parentSchema: s, it: a } = e, { oneOf: o } = s;
    if (!a.opts.discriminator)
      throw new Error("discriminator: requires discriminator option");
    const u = n.propertyName;
    if (typeof u != "string")
      throw new Error("discriminator: requires propertyName");
    if (n.mapping)
      throw new Error("discriminator: mapping is not supported");
    if (!o)
      throw new Error("discriminator: requires oneOf keyword");
    const l = t.let("valid", !1), c = t.const("tag", (0, lr._)`${r}${(0, lr.getProperty)(u)}`);
    t.if((0, lr._)`typeof ${c} == "string"`, () => d(), () => e.error(!1, { discrError: qs.DiscrError.Tag, tag: c, tagName: u })), e.ok(l);
    function d() {
      const g = b();
      t.if(!1);
      for (const y in g)
        t.elseIf((0, lr._)`${c} === ${y}`), t.assign(l, h(g[y]));
      t.else(), e.error(!1, { discrError: qs.DiscrError.Mapping, tag: c, tagName: u }), t.endIf();
    }
    function h(g) {
      const y = t.name("valid"), w = e.subschema({ keyword: "oneOf", schemaProp: g }, y);
      return e.mergeEvaluated(w, lr.Name), y;
    }
    function b() {
      var g;
      const y = {}, w = m(s);
      let _ = !0;
      for (let R = 0; R < o.length; R++) {
        let O = o[R];
        if (O != null && O.$ref && !(0, T$.schemaHasRulesButRef)(O, a.self.RULES)) {
          const B = O.$ref;
          if (O = Fi.resolveRef.call(a.self, a.schemaEnv.root, a.baseId, B), O instanceof Fi.SchemaEnv && (O = O.schema), O === void 0)
            throw new I$.default(a.opts.uriResolver, a.baseId, B);
        }
        const G = (g = O == null ? void 0 : O.properties) === null || g === void 0 ? void 0 : g[u];
        if (typeof G != "object")
          throw new Error(`discriminator: oneOf subschemas (or referenced schemas) must have "properties/${u}"`);
        _ = _ && (w || m(O)), v(G, R);
      }
      if (!_)
        throw new Error(`discriminator: "${u}" must be required`);
      return y;
      function m({ required: R }) {
        return Array.isArray(R) && R.includes(u);
      }
      function v(R, O) {
        if (R.const)
          N(R.const, O);
        else if (R.enum)
          for (const G of R.enum)
            N(G, O);
        else
          throw new Error(`discriminator: "properties/${u}" must have "const" or "enum"`);
      }
      function N(R, O) {
        if (typeof R != "string" || R in y)
          throw new Error(`discriminator: "${u}" values must be unique strings`);
        y[R] = O;
      }
    }
  }
};
so.default = k$;
var ao = {};
const A$ = "https://json-schema.org/draft/2020-12/schema", C$ = "https://json-schema.org/draft/2020-12/schema", D$ = {
  "https://json-schema.org/draft/2020-12/vocab/core": !0,
  "https://json-schema.org/draft/2020-12/vocab/applicator": !0,
  "https://json-schema.org/draft/2020-12/vocab/unevaluated": !0,
  "https://json-schema.org/draft/2020-12/vocab/validation": !0,
  "https://json-schema.org/draft/2020-12/vocab/meta-data": !0,
  "https://json-schema.org/draft/2020-12/vocab/format-annotation": !0,
  "https://json-schema.org/draft/2020-12/vocab/content": !0
}, M$ = "meta", V$ = "Core and Validation specifications meta-schema", L$ = [
  {
    $ref: "meta/core"
  },
  {
    $ref: "meta/applicator"
  },
  {
    $ref: "meta/unevaluated"
  },
  {
    $ref: "meta/validation"
  },
  {
    $ref: "meta/meta-data"
  },
  {
    $ref: "meta/format-annotation"
  },
  {
    $ref: "meta/content"
  }
], F$ = [
  "object",
  "boolean"
], z$ = "This meta-schema also defines keywords that have appeared in previous drafts in order to prevent incompatible extensions as they remain in common use.", U$ = {
  definitions: {
    $comment: '"definitions" has been replaced by "$defs".',
    type: "object",
    additionalProperties: {
      $dynamicRef: "#meta"
    },
    deprecated: !0,
    default: {}
  },
  dependencies: {
    $comment: '"dependencies" has been split and replaced by "dependentSchemas" and "dependentRequired" in order to serve their differing semantics.',
    type: "object",
    additionalProperties: {
      anyOf: [
        {
          $dynamicRef: "#meta"
        },
        {
          $ref: "meta/validation#/$defs/stringArray"
        }
      ]
    },
    deprecated: !0,
    default: {}
  },
  $recursiveAnchor: {
    $comment: '"$recursiveAnchor" has been replaced by "$dynamicAnchor".',
    $ref: "meta/core#/$defs/anchorString",
    deprecated: !0
  },
  $recursiveRef: {
    $comment: '"$recursiveRef" has been replaced by "$dynamicRef".',
    $ref: "meta/core#/$defs/uriReferenceString",
    deprecated: !0
  }
}, q$ = {
  $schema: A$,
  $id: C$,
  $vocabulary: D$,
  $dynamicAnchor: M$,
  title: V$,
  allOf: L$,
  type: F$,
  $comment: z$,
  properties: U$
}, G$ = "https://json-schema.org/draft/2020-12/schema", K$ = "https://json-schema.org/draft/2020-12/meta/applicator", H$ = {
  "https://json-schema.org/draft/2020-12/vocab/applicator": !0
}, J$ = "meta", X$ = "Applicator vocabulary meta-schema", B$ = [
  "object",
  "boolean"
], W$ = {
  prefixItems: {
    $ref: "#/$defs/schemaArray"
  },
  items: {
    $dynamicRef: "#meta"
  },
  contains: {
    $dynamicRef: "#meta"
  },
  additionalProperties: {
    $dynamicRef: "#meta"
  },
  properties: {
    type: "object",
    additionalProperties: {
      $dynamicRef: "#meta"
    },
    default: {}
  },
  patternProperties: {
    type: "object",
    additionalProperties: {
      $dynamicRef: "#meta"
    },
    propertyNames: {
      format: "regex"
    },
    default: {}
  },
  dependentSchemas: {
    type: "object",
    additionalProperties: {
      $dynamicRef: "#meta"
    },
    default: {}
  },
  propertyNames: {
    $dynamicRef: "#meta"
  },
  if: {
    $dynamicRef: "#meta"
  },
  then: {
    $dynamicRef: "#meta"
  },
  else: {
    $dynamicRef: "#meta"
  },
  allOf: {
    $ref: "#/$defs/schemaArray"
  },
  anyOf: {
    $ref: "#/$defs/schemaArray"
  },
  oneOf: {
    $ref: "#/$defs/schemaArray"
  },
  not: {
    $dynamicRef: "#meta"
  }
}, Y$ = {
  schemaArray: {
    type: "array",
    minItems: 1,
    items: {
      $dynamicRef: "#meta"
    }
  }
}, Q$ = {
  $schema: G$,
  $id: K$,
  $vocabulary: H$,
  $dynamicAnchor: J$,
  title: X$,
  type: B$,
  properties: W$,
  $defs: Y$
}, Z$ = "https://json-schema.org/draft/2020-12/schema", x$ = "https://json-schema.org/draft/2020-12/meta/unevaluated", ey = {
  "https://json-schema.org/draft/2020-12/vocab/unevaluated": !0
}, ty = "meta", ry = "Unevaluated applicator vocabulary meta-schema", ny = [
  "object",
  "boolean"
], sy = {
  unevaluatedItems: {
    $dynamicRef: "#meta"
  },
  unevaluatedProperties: {
    $dynamicRef: "#meta"
  }
}, ay = {
  $schema: Z$,
  $id: x$,
  $vocabulary: ey,
  $dynamicAnchor: ty,
  title: ry,
  type: ny,
  properties: sy
}, oy = "https://json-schema.org/draft/2020-12/schema", iy = "https://json-schema.org/draft/2020-12/meta/content", cy = {
  "https://json-schema.org/draft/2020-12/vocab/content": !0
}, ly = "meta", uy = "Content vocabulary meta-schema", dy = [
  "object",
  "boolean"
], fy = {
  contentEncoding: {
    type: "string"
  },
  contentMediaType: {
    type: "string"
  },
  contentSchema: {
    $dynamicRef: "#meta"
  }
}, hy = {
  $schema: oy,
  $id: iy,
  $vocabulary: cy,
  $dynamicAnchor: ly,
  title: uy,
  type: dy,
  properties: fy
}, my = "https://json-schema.org/draft/2020-12/schema", py = "https://json-schema.org/draft/2020-12/meta/core", $y = {
  "https://json-schema.org/draft/2020-12/vocab/core": !0
}, yy = "meta", _y = "Core vocabulary meta-schema", gy = [
  "object",
  "boolean"
], vy = {
  $id: {
    $ref: "#/$defs/uriReferenceString",
    $comment: "Non-empty fragments not allowed.",
    pattern: "^[^#]*#?$"
  },
  $schema: {
    $ref: "#/$defs/uriString"
  },
  $ref: {
    $ref: "#/$defs/uriReferenceString"
  },
  $anchor: {
    $ref: "#/$defs/anchorString"
  },
  $dynamicRef: {
    $ref: "#/$defs/uriReferenceString"
  },
  $dynamicAnchor: {
    $ref: "#/$defs/anchorString"
  },
  $vocabulary: {
    type: "object",
    propertyNames: {
      $ref: "#/$defs/uriString"
    },
    additionalProperties: {
      type: "boolean"
    }
  },
  $comment: {
    type: "string"
  },
  $defs: {
    type: "object",
    additionalProperties: {
      $dynamicRef: "#meta"
    }
  }
}, wy = {
  anchorString: {
    type: "string",
    pattern: "^[A-Za-z_][-A-Za-z0-9._]*$"
  },
  uriString: {
    type: "string",
    format: "uri"
  },
  uriReferenceString: {
    type: "string",
    format: "uri-reference"
  }
}, Ey = {
  $schema: my,
  $id: py,
  $vocabulary: $y,
  $dynamicAnchor: yy,
  title: _y,
  type: gy,
  properties: vy,
  $defs: wy
}, by = "https://json-schema.org/draft/2020-12/schema", Sy = "https://json-schema.org/draft/2020-12/meta/format-annotation", Py = {
  "https://json-schema.org/draft/2020-12/vocab/format-annotation": !0
}, Ny = "meta", Ry = "Format vocabulary meta-schema for annotation results", Oy = [
  "object",
  "boolean"
], Iy = {
  format: {
    type: "string"
  }
}, Ty = {
  $schema: by,
  $id: Sy,
  $vocabulary: Py,
  $dynamicAnchor: Ny,
  title: Ry,
  type: Oy,
  properties: Iy
}, jy = "https://json-schema.org/draft/2020-12/schema", ky = "https://json-schema.org/draft/2020-12/meta/meta-data", Ay = {
  "https://json-schema.org/draft/2020-12/vocab/meta-data": !0
}, Cy = "meta", Dy = "Meta-data vocabulary meta-schema", My = [
  "object",
  "boolean"
], Vy = {
  title: {
    type: "string"
  },
  description: {
    type: "string"
  },
  default: !0,
  deprecated: {
    type: "boolean",
    default: !1
  },
  readOnly: {
    type: "boolean",
    default: !1
  },
  writeOnly: {
    type: "boolean",
    default: !1
  },
  examples: {
    type: "array",
    items: !0
  }
}, Ly = {
  $schema: jy,
  $id: ky,
  $vocabulary: Ay,
  $dynamicAnchor: Cy,
  title: Dy,
  type: My,
  properties: Vy
}, Fy = "https://json-schema.org/draft/2020-12/schema", zy = "https://json-schema.org/draft/2020-12/meta/validation", Uy = {
  "https://json-schema.org/draft/2020-12/vocab/validation": !0
}, qy = "meta", Gy = "Validation vocabulary meta-schema", Ky = [
  "object",
  "boolean"
], Hy = {
  type: {
    anyOf: [
      {
        $ref: "#/$defs/simpleTypes"
      },
      {
        type: "array",
        items: {
          $ref: "#/$defs/simpleTypes"
        },
        minItems: 1,
        uniqueItems: !0
      }
    ]
  },
  const: !0,
  enum: {
    type: "array",
    items: !0
  },
  multipleOf: {
    type: "number",
    exclusiveMinimum: 0
  },
  maximum: {
    type: "number"
  },
  exclusiveMaximum: {
    type: "number"
  },
  minimum: {
    type: "number"
  },
  exclusiveMinimum: {
    type: "number"
  },
  maxLength: {
    $ref: "#/$defs/nonNegativeInteger"
  },
  minLength: {
    $ref: "#/$defs/nonNegativeIntegerDefault0"
  },
  pattern: {
    type: "string",
    format: "regex"
  },
  maxItems: {
    $ref: "#/$defs/nonNegativeInteger"
  },
  minItems: {
    $ref: "#/$defs/nonNegativeIntegerDefault0"
  },
  uniqueItems: {
    type: "boolean",
    default: !1
  },
  maxContains: {
    $ref: "#/$defs/nonNegativeInteger"
  },
  minContains: {
    $ref: "#/$defs/nonNegativeInteger",
    default: 1
  },
  maxProperties: {
    $ref: "#/$defs/nonNegativeInteger"
  },
  minProperties: {
    $ref: "#/$defs/nonNegativeIntegerDefault0"
  },
  required: {
    $ref: "#/$defs/stringArray"
  },
  dependentRequired: {
    type: "object",
    additionalProperties: {
      $ref: "#/$defs/stringArray"
    }
  }
}, Jy = {
  nonNegativeInteger: {
    type: "integer",
    minimum: 0
  },
  nonNegativeIntegerDefault0: {
    $ref: "#/$defs/nonNegativeInteger",
    default: 0
  },
  simpleTypes: {
    enum: [
      "array",
      "boolean",
      "integer",
      "null",
      "number",
      "object",
      "string"
    ]
  },
  stringArray: {
    type: "array",
    items: {
      type: "string"
    },
    uniqueItems: !0,
    default: []
  }
}, Xy = {
  $schema: Fy,
  $id: zy,
  $vocabulary: Uy,
  $dynamicAnchor: qy,
  title: Gy,
  type: Ky,
  properties: Hy,
  $defs: Jy
};
Object.defineProperty(ao, "__esModule", { value: !0 });
const By = q$, Wy = Q$, Yy = ay, Qy = hy, Zy = Ey, xy = Ty, e0 = Ly, t0 = Xy, r0 = ["/properties"];
function n0(e) {
  return [
    By,
    Wy,
    Yy,
    Qy,
    Zy,
    t(this, xy),
    e0,
    t(this, t0)
  ].forEach((r) => this.addMetaSchema(r, void 0, !1)), this;
  function t(r, n) {
    return e ? r.$dataMetaSchema(n, r0) : n;
  }
}
ao.default = n0;
(function(e, t) {
  Object.defineProperty(t, "__esModule", { value: !0 }), t.MissingRefError = t.ValidationError = t.CodeGen = t.Name = t.nil = t.stringify = t.str = t._ = t.KeywordCxt = t.Ajv2020 = void 0;
  const r = zc, n = _a, s = so, a = ao, o = "https://json-schema.org/draft/2020-12/schema";
  class u extends r.default {
    constructor(g = {}) {
      super({
        ...g,
        dynamicRef: !0,
        next: !0,
        unevaluated: !0
      });
    }
    _addVocabularies() {
      super._addVocabularies(), n.default.forEach((g) => this.addVocabulary(g)), this.opts.discriminator && this.addKeyword(s.default);
    }
    _addDefaultMetaSchema() {
      super._addDefaultMetaSchema();
      const { $data: g, meta: y } = this.opts;
      y && (a.default.call(this, g), this.refs["http://json-schema.org/schema"] = o);
    }
    defaultMeta() {
      return this.opts.defaultMeta = super.defaultMeta() || (this.getSchema(o) ? o : void 0);
    }
  }
  t.Ajv2020 = u, e.exports = t = u, e.exports.Ajv2020 = u, Object.defineProperty(t, "__esModule", { value: !0 }), t.default = u;
  var l = Be;
  Object.defineProperty(t, "KeywordCxt", { enumerable: !0, get: function() {
    return l.KeywordCxt;
  } });
  var c = W;
  Object.defineProperty(t, "_", { enumerable: !0, get: function() {
    return c._;
  } }), Object.defineProperty(t, "str", { enumerable: !0, get: function() {
    return c.str;
  } }), Object.defineProperty(t, "stringify", { enumerable: !0, get: function() {
    return c.stringify;
  } }), Object.defineProperty(t, "nil", { enumerable: !0, get: function() {
    return c.nil;
  } }), Object.defineProperty(t, "Name", { enumerable: !0, get: function() {
    return c.Name;
  } }), Object.defineProperty(t, "CodeGen", { enumerable: !0, get: function() {
    return c.CodeGen;
  } });
  var d = sn;
  Object.defineProperty(t, "ValidationError", { enumerable: !0, get: function() {
    return d.default;
  } });
  var h = vr;
  Object.defineProperty(t, "MissingRefError", { enumerable: !0, get: function() {
    return h.default;
  } });
})(Cs, Cs.exports);
var s0 = Cs.exports, Gs = { exports: {} }, Vl = {};
(function(e) {
  Object.defineProperty(e, "__esModule", { value: !0 }), e.formatNames = e.fastFormats = e.fullFormats = void 0;
  function t(z, H) {
    return { validate: z, compare: H };
  }
  e.fullFormats = {
    // date: http://tools.ietf.org/html/rfc3339#section-5.6
    date: t(a, o),
    // date-time: http://tools.ietf.org/html/rfc3339#section-5.6
    time: t(l(!0), c),
    "date-time": t(b(!0), g),
    "iso-time": t(l(), d),
    "iso-date-time": t(b(), y),
    // duration: https://tools.ietf.org/html/rfc3339#appendix-A
    duration: /^P(?!$)((\d+Y)?(\d+M)?(\d+D)?(T(?=\d)(\d+H)?(\d+M)?(\d+S)?)?|(\d+W)?)$/,
    uri: m,
    "uri-reference": /^(?:[a-z][a-z0-9+\-.]*:)?(?:\/?\/(?:(?:[a-z0-9\-._~!$&'()*+,;=:]|%[0-9a-f]{2})*@)?(?:\[(?:(?:(?:(?:[0-9a-f]{1,4}:){6}|::(?:[0-9a-f]{1,4}:){5}|(?:[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){4}|(?:(?:[0-9a-f]{1,4}:){0,1}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){3}|(?:(?:[0-9a-f]{1,4}:){0,2}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){2}|(?:(?:[0-9a-f]{1,4}:){0,3}[0-9a-f]{1,4})?::[0-9a-f]{1,4}:|(?:(?:[0-9a-f]{1,4}:){0,4}[0-9a-f]{1,4})?::)(?:[0-9a-f]{1,4}:[0-9a-f]{1,4}|(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?))|(?:(?:[0-9a-f]{1,4}:){0,5}[0-9a-f]{1,4})?::[0-9a-f]{1,4}|(?:(?:[0-9a-f]{1,4}:){0,6}[0-9a-f]{1,4})?::)|[Vv][0-9a-f]+\.[a-z0-9\-._~!$&'()*+,;=:]+)\]|(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)|(?:[a-z0-9\-._~!$&'"()*+,;=]|%[0-9a-f]{2})*)(?::\d*)?(?:\/(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[0-9a-f]{2})*)*|\/(?:(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[0-9a-f]{2})+(?:\/(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[0-9a-f]{2})*)*)?|(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[0-9a-f]{2})+(?:\/(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[0-9a-f]{2})*)*)?(?:\?(?:[a-z0-9\-._~!$&'"()*+,;=:@/?]|%[0-9a-f]{2})*)?(?:#(?:[a-z0-9\-._~!$&'"()*+,;=:@/?]|%[0-9a-f]{2})*)?$/i,
    // uri-template: https://tools.ietf.org/html/rfc6570
    "uri-template": /^(?:(?:[^\x00-\x20"'<>%\\^`{|}]|%[0-9a-f]{2})|\{[+#./;?&=,!@|]?(?:[a-z0-9_]|%[0-9a-f]{2})+(?::[1-9][0-9]{0,3}|\*)?(?:,(?:[a-z0-9_]|%[0-9a-f]{2})+(?::[1-9][0-9]{0,3}|\*)?)*\})*$/i,
    // For the source: https://gist.github.com/dperini/729294
    // For test cases: https://mathiasbynens.be/demo/url-regex
    url: /^(?:https?|ftp):\/\/(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z0-9\u{00a1}-\u{ffff}]+-)*[a-z0-9\u{00a1}-\u{ffff}]+)(?:\.(?:[a-z0-9\u{00a1}-\u{ffff}]+-)*[a-z0-9\u{00a1}-\u{ffff}]+)*(?:\.(?:[a-z\u{00a1}-\u{ffff}]{2,})))(?::\d{2,5})?(?:\/[^\s]*)?$/iu,
    email: /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/i,
    hostname: /^(?=.{1,253}\.?$)[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[-0-9a-z]{0,61}[0-9a-z])?)*\.?$/i,
    // optimized https://www.safaribooksonline.com/library/view/regular-expressions-cookbook/9780596802837/ch07s16.html
    ipv4: /^(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)\.){3}(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)$/,
    ipv6: /^((([0-9a-f]{1,4}:){7}([0-9a-f]{1,4}|:))|(([0-9a-f]{1,4}:){6}(:[0-9a-f]{1,4}|((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9a-f]{1,4}:){5}(((:[0-9a-f]{1,4}){1,2})|:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9a-f]{1,4}:){4}(((:[0-9a-f]{1,4}){1,3})|((:[0-9a-f]{1,4})?:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9a-f]{1,4}:){3}(((:[0-9a-f]{1,4}){1,4})|((:[0-9a-f]{1,4}){0,2}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9a-f]{1,4}:){2}(((:[0-9a-f]{1,4}){1,5})|((:[0-9a-f]{1,4}){0,3}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9a-f]{1,4}:){1}(((:[0-9a-f]{1,4}){1,6})|((:[0-9a-f]{1,4}){0,4}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(:(((:[0-9a-f]{1,4}){1,7})|((:[0-9a-f]{1,4}){0,5}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:)))$/i,
    regex: pe,
    // uuid: http://tools.ietf.org/html/rfc4122
    uuid: /^(?:urn:uuid:)?[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i,
    // JSON-pointer: https://tools.ietf.org/html/rfc6901
    // uri fragment: https://tools.ietf.org/html/rfc3986#appendix-A
    "json-pointer": /^(?:\/(?:[^~/]|~0|~1)*)*$/,
    "json-pointer-uri-fragment": /^#(?:\/(?:[a-z0-9_\-.!$&'()*+,;:=@]|%[0-9a-f]{2}|~0|~1)*)*$/i,
    // relative JSON-pointer: http://tools.ietf.org/html/draft-luff-relative-json-pointer-00
    "relative-json-pointer": /^(?:0|[1-9][0-9]*)(?:#|(?:\/(?:[^~/]|~0|~1)*)*)$/,
    // the following formats are used by the openapi specification: https://spec.openapis.org/oas/v3.0.0#data-types
    // byte: https://github.com/miguelmota/is-base64
    byte: N,
    // signed 32 bit integer
    int32: { type: "number", validate: G },
    // signed 64 bit integer
    int64: { type: "number", validate: B },
    // C-type float
    float: { type: "number", validate: le },
    // C-type double
    double: { type: "number", validate: le },
    // hint to the UI to hide input strings
    password: !0,
    // unchecked string payload
    binary: !0
  }, e.fastFormats = {
    ...e.fullFormats,
    date: t(/^\d\d\d\d-[0-1]\d-[0-3]\d$/, o),
    time: t(/^(?:[0-2]\d:[0-5]\d:[0-5]\d|23:59:60)(?:\.\d+)?(?:z|[+-]\d\d(?::?\d\d)?)$/i, c),
    "date-time": t(/^\d\d\d\d-[0-1]\d-[0-3]\dt(?:[0-2]\d:[0-5]\d:[0-5]\d|23:59:60)(?:\.\d+)?(?:z|[+-]\d\d(?::?\d\d)?)$/i, g),
    "iso-time": t(/^(?:[0-2]\d:[0-5]\d:[0-5]\d|23:59:60)(?:\.\d+)?(?:z|[+-]\d\d(?::?\d\d)?)?$/i, d),
    "iso-date-time": t(/^\d\d\d\d-[0-1]\d-[0-3]\d[t\s](?:[0-2]\d:[0-5]\d:[0-5]\d|23:59:60)(?:\.\d+)?(?:z|[+-]\d\d(?::?\d\d)?)?$/i, y),
    // uri: https://github.com/mafintosh/is-my-json-valid/blob/master/formats.js
    uri: /^(?:[a-z][a-z0-9+\-.]*:)(?:\/?\/)?[^\s]*$/i,
    "uri-reference": /^(?:(?:[a-z][a-z0-9+\-.]*:)?\/?\/)?(?:[^\\\s#][^\s#]*)?(?:#[^\\\s]*)?$/i,
    // email (sources from jsen validator):
    // http://stackoverflow.com/questions/201323/using-a-regular-expression-to-validate-an-email-address#answer-8829363
    // http://www.w3.org/TR/html5/forms.html#valid-e-mail-address (search for 'wilful violation')
    email: /^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)*$/i
  }, e.formatNames = Object.keys(e.fullFormats);
  function r(z) {
    return z % 4 === 0 && (z % 100 !== 0 || z % 400 === 0);
  }
  const n = /^(\d\d\d\d)-(\d\d)-(\d\d)$/, s = [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  function a(z) {
    const H = n.exec(z);
    if (!H)
      return !1;
    const se = +H[1], T = +H[2], k = +H[3];
    return T >= 1 && T <= 12 && k >= 1 && k <= (T === 2 && r(se) ? 29 : s[T]);
  }
  function o(z, H) {
    if (z && H)
      return z > H ? 1 : z < H ? -1 : 0;
  }
  const u = /^(\d\d):(\d\d):(\d\d(?:\.\d+)?)(z|([+-])(\d\d)(?::?(\d\d))?)?$/i;
  function l(z) {
    return function(se) {
      const T = u.exec(se);
      if (!T)
        return !1;
      const k = +T[1], V = +T[2], D = +T[3], K = T[4], M = T[5] === "-" ? -1 : 1, P = +(T[6] || 0), p = +(T[7] || 0);
      if (P > 23 || p > 59 || z && !K)
        return !1;
      if (k <= 23 && V <= 59 && D < 60)
        return !0;
      const S = V - p * M, $ = k - P * M - (S < 0 ? 1 : 0);
      return ($ === 23 || $ === -1) && (S === 59 || S === -1) && D < 61;
    };
  }
  function c(z, H) {
    if (!(z && H))
      return;
    const se = (/* @__PURE__ */ new Date("2020-01-01T" + z)).valueOf(), T = (/* @__PURE__ */ new Date("2020-01-01T" + H)).valueOf();
    if (se && T)
      return se - T;
  }
  function d(z, H) {
    if (!(z && H))
      return;
    const se = u.exec(z), T = u.exec(H);
    if (se && T)
      return z = se[1] + se[2] + se[3], H = T[1] + T[2] + T[3], z > H ? 1 : z < H ? -1 : 0;
  }
  const h = /t|\s/i;
  function b(z) {
    const H = l(z);
    return function(T) {
      const k = T.split(h);
      return k.length === 2 && a(k[0]) && H(k[1]);
    };
  }
  function g(z, H) {
    if (!(z && H))
      return;
    const se = new Date(z).valueOf(), T = new Date(H).valueOf();
    if (se && T)
      return se - T;
  }
  function y(z, H) {
    if (!(z && H))
      return;
    const [se, T] = z.split(h), [k, V] = H.split(h), D = o(se, k);
    if (D !== void 0)
      return D || c(T, V);
  }
  const w = /\/|:/, _ = /^(?:[a-z][a-z0-9+\-.]*:)(?:\/?\/(?:(?:[a-z0-9\-._~!$&'()*+,;=:]|%[0-9a-f]{2})*@)?(?:\[(?:(?:(?:(?:[0-9a-f]{1,4}:){6}|::(?:[0-9a-f]{1,4}:){5}|(?:[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){4}|(?:(?:[0-9a-f]{1,4}:){0,1}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){3}|(?:(?:[0-9a-f]{1,4}:){0,2}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){2}|(?:(?:[0-9a-f]{1,4}:){0,3}[0-9a-f]{1,4})?::[0-9a-f]{1,4}:|(?:(?:[0-9a-f]{1,4}:){0,4}[0-9a-f]{1,4})?::)(?:[0-9a-f]{1,4}:[0-9a-f]{1,4}|(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?))|(?:(?:[0-9a-f]{1,4}:){0,5}[0-9a-f]{1,4})?::[0-9a-f]{1,4}|(?:(?:[0-9a-f]{1,4}:){0,6}[0-9a-f]{1,4})?::)|[Vv][0-9a-f]+\.[a-z0-9\-._~!$&'()*+,;=:]+)\]|(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)|(?:[a-z0-9\-._~!$&'()*+,;=]|%[0-9a-f]{2})*)(?::\d*)?(?:\/(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})*)*|\/(?:(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})+(?:\/(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})*)*)?|(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})+(?:\/(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})*)*)(?:\?(?:[a-z0-9\-._~!$&'()*+,;=:@/?]|%[0-9a-f]{2})*)?(?:#(?:[a-z0-9\-._~!$&'()*+,;=:@/?]|%[0-9a-f]{2})*)?$/i;
  function m(z) {
    return w.test(z) && _.test(z);
  }
  const v = /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/gm;
  function N(z) {
    return v.lastIndex = 0, v.test(z);
  }
  const R = -(2 ** 31), O = 2 ** 31 - 1;
  function G(z) {
    return Number.isInteger(z) && z <= O && z >= R;
  }
  function B(z) {
    return Number.isInteger(z);
  }
  function le() {
    return !0;
  }
  const fe = /[^\\]\\Z/;
  function pe(z) {
    if (fe.test(z))
      return !1;
    try {
      return new RegExp(z), !0;
    } catch {
      return !1;
    }
  }
})(Vl);
var Ll = {}, Ks = { exports: {} }, Fl = {}, We = {}, _r = {}, on = {}, x = {}, rn = {};
(function(e) {
  Object.defineProperty(e, "__esModule", { value: !0 }), e.regexpCode = e.getEsmExportName = e.getProperty = e.safeStringify = e.stringify = e.strConcat = e.addCodeArg = e.str = e._ = e.nil = e._Code = e.Name = e.IDENTIFIER = e._CodeOrName = void 0;
  class t {
  }
  e._CodeOrName = t, e.IDENTIFIER = /^[a-z$_][a-z$_0-9]*$/i;
  class r extends t {
    constructor(v) {
      if (super(), !e.IDENTIFIER.test(v))
        throw new Error("CodeGen: name must be a valid identifier");
      this.str = v;
    }
    toString() {
      return this.str;
    }
    emptyStr() {
      return !1;
    }
    get names() {
      return { [this.str]: 1 };
    }
  }
  e.Name = r;
  class n extends t {
    constructor(v) {
      super(), this._items = typeof v == "string" ? [v] : v;
    }
    toString() {
      return this.str;
    }
    emptyStr() {
      if (this._items.length > 1)
        return !1;
      const v = this._items[0];
      return v === "" || v === '""';
    }
    get str() {
      var v;
      return (v = this._str) !== null && v !== void 0 ? v : this._str = this._items.reduce((N, R) => `${N}${R}`, "");
    }
    get names() {
      var v;
      return (v = this._names) !== null && v !== void 0 ? v : this._names = this._items.reduce((N, R) => (R instanceof r && (N[R.str] = (N[R.str] || 0) + 1), N), {});
    }
  }
  e._Code = n, e.nil = new n("");
  function s(m, ...v) {
    const N = [m[0]];
    let R = 0;
    for (; R < v.length; )
      u(N, v[R]), N.push(m[++R]);
    return new n(N);
  }
  e._ = s;
  const a = new n("+");
  function o(m, ...v) {
    const N = [g(m[0])];
    let R = 0;
    for (; R < v.length; )
      N.push(a), u(N, v[R]), N.push(a, g(m[++R]));
    return l(N), new n(N);
  }
  e.str = o;
  function u(m, v) {
    v instanceof n ? m.push(...v._items) : v instanceof r ? m.push(v) : m.push(h(v));
  }
  e.addCodeArg = u;
  function l(m) {
    let v = 1;
    for (; v < m.length - 1; ) {
      if (m[v] === a) {
        const N = c(m[v - 1], m[v + 1]);
        if (N !== void 0) {
          m.splice(v - 1, 3, N);
          continue;
        }
        m[v++] = "+";
      }
      v++;
    }
  }
  function c(m, v) {
    if (v === '""')
      return m;
    if (m === '""')
      return v;
    if (typeof m == "string")
      return v instanceof r || m[m.length - 1] !== '"' ? void 0 : typeof v != "string" ? `${m.slice(0, -1)}${v}"` : v[0] === '"' ? m.slice(0, -1) + v.slice(1) : void 0;
    if (typeof v == "string" && v[0] === '"' && !(m instanceof r))
      return `"${m}${v.slice(1)}`;
  }
  function d(m, v) {
    return v.emptyStr() ? m : m.emptyStr() ? v : o`${m}${v}`;
  }
  e.strConcat = d;
  function h(m) {
    return typeof m == "number" || typeof m == "boolean" || m === null ? m : g(Array.isArray(m) ? m.join(",") : m);
  }
  function b(m) {
    return new n(g(m));
  }
  e.stringify = b;
  function g(m) {
    return JSON.stringify(m).replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029");
  }
  e.safeStringify = g;
  function y(m) {
    return typeof m == "string" && e.IDENTIFIER.test(m) ? new n(`.${m}`) : s`[${m}]`;
  }
  e.getProperty = y;
  function w(m) {
    if (typeof m == "string" && e.IDENTIFIER.test(m))
      return new n(`${m}`);
    throw new Error(`CodeGen: invalid export name: ${m}, use explicit $id name mapping`);
  }
  e.getEsmExportName = w;
  function _(m) {
    return new n(m.toString());
  }
  e.regexpCode = _;
})(rn);
var Hs = {};
(function(e) {
  Object.defineProperty(e, "__esModule", { value: !0 }), e.ValueScope = e.ValueScopeName = e.Scope = e.varKinds = e.UsedValueState = void 0;
  const t = rn;
  class r extends Error {
    constructor(c) {
      super(`CodeGen: "code" for ${c} not defined`), this.value = c.value;
    }
  }
  var n;
  (function(l) {
    l[l.Started = 0] = "Started", l[l.Completed = 1] = "Completed";
  })(n || (e.UsedValueState = n = {})), e.varKinds = {
    const: new t.Name("const"),
    let: new t.Name("let"),
    var: new t.Name("var")
  };
  class s {
    constructor({ prefixes: c, parent: d } = {}) {
      this._names = {}, this._prefixes = c, this._parent = d;
    }
    toName(c) {
      return c instanceof t.Name ? c : this.name(c);
    }
    name(c) {
      return new t.Name(this._newName(c));
    }
    _newName(c) {
      const d = this._names[c] || this._nameGroup(c);
      return `${c}${d.index++}`;
    }
    _nameGroup(c) {
      var d, h;
      if (!((h = (d = this._parent) === null || d === void 0 ? void 0 : d._prefixes) === null || h === void 0) && h.has(c) || this._prefixes && !this._prefixes.has(c))
        throw new Error(`CodeGen: prefix "${c}" is not allowed in this scope`);
      return this._names[c] = { prefix: c, index: 0 };
    }
  }
  e.Scope = s;
  class a extends t.Name {
    constructor(c, d) {
      super(d), this.prefix = c;
    }
    setValue(c, { property: d, itemIndex: h }) {
      this.value = c, this.scopePath = (0, t._)`.${new t.Name(d)}[${h}]`;
    }
  }
  e.ValueScopeName = a;
  const o = (0, t._)`\n`;
  class u extends s {
    constructor(c) {
      super(c), this._values = {}, this._scope = c.scope, this.opts = { ...c, _n: c.lines ? o : t.nil };
    }
    get() {
      return this._scope;
    }
    name(c) {
      return new a(c, this._newName(c));
    }
    value(c, d) {
      var h;
      if (d.ref === void 0)
        throw new Error("CodeGen: ref must be passed in value");
      const b = this.toName(c), { prefix: g } = b, y = (h = d.key) !== null && h !== void 0 ? h : d.ref;
      let w = this._values[g];
      if (w) {
        const v = w.get(y);
        if (v)
          return v;
      } else
        w = this._values[g] = /* @__PURE__ */ new Map();
      w.set(y, b);
      const _ = this._scope[g] || (this._scope[g] = []), m = _.length;
      return _[m] = d.ref, b.setValue(d, { property: g, itemIndex: m }), b;
    }
    getValue(c, d) {
      const h = this._values[c];
      if (h)
        return h.get(d);
    }
    scopeRefs(c, d = this._values) {
      return this._reduceValues(d, (h) => {
        if (h.scopePath === void 0)
          throw new Error(`CodeGen: name "${h}" has no value`);
        return (0, t._)`${c}${h.scopePath}`;
      });
    }
    scopeCode(c = this._values, d, h) {
      return this._reduceValues(c, (b) => {
        if (b.value === void 0)
          throw new Error(`CodeGen: name "${b}" has no value`);
        return b.value.code;
      }, d, h);
    }
    _reduceValues(c, d, h = {}, b) {
      let g = t.nil;
      for (const y in c) {
        const w = c[y];
        if (!w)
          continue;
        const _ = h[y] = h[y] || /* @__PURE__ */ new Map();
        w.forEach((m) => {
          if (_.has(m))
            return;
          _.set(m, n.Started);
          let v = d(m);
          if (v) {
            const N = this.opts.es5 ? e.varKinds.var : e.varKinds.const;
            g = (0, t._)`${g}${N} ${m} = ${v};${this.opts._n}`;
          } else if (v = b == null ? void 0 : b(m))
            g = (0, t._)`${g}${v}${this.opts._n}`;
          else
            throw new r(m);
          _.set(m, n.Completed);
        });
      }
      return g;
    }
  }
  e.ValueScope = u;
})(Hs);
(function(e) {
  Object.defineProperty(e, "__esModule", { value: !0 }), e.or = e.and = e.not = e.CodeGen = e.operators = e.varKinds = e.ValueScopeName = e.ValueScope = e.Scope = e.Name = e.regexpCode = e.stringify = e.getProperty = e.nil = e.strConcat = e.str = e._ = void 0;
  const t = rn, r = Hs;
  var n = rn;
  Object.defineProperty(e, "_", { enumerable: !0, get: function() {
    return n._;
  } }), Object.defineProperty(e, "str", { enumerable: !0, get: function() {
    return n.str;
  } }), Object.defineProperty(e, "strConcat", { enumerable: !0, get: function() {
    return n.strConcat;
  } }), Object.defineProperty(e, "nil", { enumerable: !0, get: function() {
    return n.nil;
  } }), Object.defineProperty(e, "getProperty", { enumerable: !0, get: function() {
    return n.getProperty;
  } }), Object.defineProperty(e, "stringify", { enumerable: !0, get: function() {
    return n.stringify;
  } }), Object.defineProperty(e, "regexpCode", { enumerable: !0, get: function() {
    return n.regexpCode;
  } }), Object.defineProperty(e, "Name", { enumerable: !0, get: function() {
    return n.Name;
  } });
  var s = Hs;
  Object.defineProperty(e, "Scope", { enumerable: !0, get: function() {
    return s.Scope;
  } }), Object.defineProperty(e, "ValueScope", { enumerable: !0, get: function() {
    return s.ValueScope;
  } }), Object.defineProperty(e, "ValueScopeName", { enumerable: !0, get: function() {
    return s.ValueScopeName;
  } }), Object.defineProperty(e, "varKinds", { enumerable: !0, get: function() {
    return s.varKinds;
  } }), e.operators = {
    GT: new t._Code(">"),
    GTE: new t._Code(">="),
    LT: new t._Code("<"),
    LTE: new t._Code("<="),
    EQ: new t._Code("==="),
    NEQ: new t._Code("!=="),
    NOT: new t._Code("!"),
    OR: new t._Code("||"),
    AND: new t._Code("&&"),
    ADD: new t._Code("+")
  };
  class a {
    optimizeNodes() {
      return this;
    }
    optimizeNames(i, f) {
      return this;
    }
  }
  class o extends a {
    constructor(i, f, E) {
      super(), this.varKind = i, this.name = f, this.rhs = E;
    }
    render({ es5: i, _n: f }) {
      const E = i ? r.varKinds.var : this.varKind, I = this.rhs === void 0 ? "" : ` = ${this.rhs}`;
      return `${E} ${this.name}${I};` + f;
    }
    optimizeNames(i, f) {
      if (i[this.name.str])
        return this.rhs && (this.rhs = T(this.rhs, i, f)), this;
    }
    get names() {
      return this.rhs instanceof t._CodeOrName ? this.rhs.names : {};
    }
  }
  class u extends a {
    constructor(i, f, E) {
      super(), this.lhs = i, this.rhs = f, this.sideEffects = E;
    }
    render({ _n: i }) {
      return `${this.lhs} = ${this.rhs};` + i;
    }
    optimizeNames(i, f) {
      if (!(this.lhs instanceof t.Name && !i[this.lhs.str] && !this.sideEffects))
        return this.rhs = T(this.rhs, i, f), this;
    }
    get names() {
      const i = this.lhs instanceof t.Name ? {} : { ...this.lhs.names };
      return se(i, this.rhs);
    }
  }
  class l extends u {
    constructor(i, f, E, I) {
      super(i, E, I), this.op = f;
    }
    render({ _n: i }) {
      return `${this.lhs} ${this.op}= ${this.rhs};` + i;
    }
  }
  class c extends a {
    constructor(i) {
      super(), this.label = i, this.names = {};
    }
    render({ _n: i }) {
      return `${this.label}:` + i;
    }
  }
  class d extends a {
    constructor(i) {
      super(), this.label = i, this.names = {};
    }
    render({ _n: i }) {
      return `break${this.label ? ` ${this.label}` : ""};` + i;
    }
  }
  class h extends a {
    constructor(i) {
      super(), this.error = i;
    }
    render({ _n: i }) {
      return `throw ${this.error};` + i;
    }
    get names() {
      return this.error.names;
    }
  }
  class b extends a {
    constructor(i) {
      super(), this.code = i;
    }
    render({ _n: i }) {
      return `${this.code};` + i;
    }
    optimizeNodes() {
      return `${this.code}` ? this : void 0;
    }
    optimizeNames(i, f) {
      return this.code = T(this.code, i, f), this;
    }
    get names() {
      return this.code instanceof t._CodeOrName ? this.code.names : {};
    }
  }
  class g extends a {
    constructor(i = []) {
      super(), this.nodes = i;
    }
    render(i) {
      return this.nodes.reduce((f, E) => f + E.render(i), "");
    }
    optimizeNodes() {
      const { nodes: i } = this;
      let f = i.length;
      for (; f--; ) {
        const E = i[f].optimizeNodes();
        Array.isArray(E) ? i.splice(f, 1, ...E) : E ? i[f] = E : i.splice(f, 1);
      }
      return i.length > 0 ? this : void 0;
    }
    optimizeNames(i, f) {
      const { nodes: E } = this;
      let I = E.length;
      for (; I--; ) {
        const j = E[I];
        j.optimizeNames(i, f) || (k(i, j.names), E.splice(I, 1));
      }
      return E.length > 0 ? this : void 0;
    }
    get names() {
      return this.nodes.reduce((i, f) => H(i, f.names), {});
    }
  }
  class y extends g {
    render(i) {
      return "{" + i._n + super.render(i) + "}" + i._n;
    }
  }
  class w extends g {
  }
  class _ extends y {
  }
  _.kind = "else";
  class m extends y {
    constructor(i, f) {
      super(f), this.condition = i;
    }
    render(i) {
      let f = `if(${this.condition})` + super.render(i);
      return this.else && (f += "else " + this.else.render(i)), f;
    }
    optimizeNodes() {
      super.optimizeNodes();
      const i = this.condition;
      if (i === !0)
        return this.nodes;
      let f = this.else;
      if (f) {
        const E = f.optimizeNodes();
        f = this.else = Array.isArray(E) ? new _(E) : E;
      }
      if (f)
        return i === !1 ? f instanceof m ? f : f.nodes : this.nodes.length ? this : new m(V(i), f instanceof m ? [f] : f.nodes);
      if (!(i === !1 || !this.nodes.length))
        return this;
    }
    optimizeNames(i, f) {
      var E;
      if (this.else = (E = this.else) === null || E === void 0 ? void 0 : E.optimizeNames(i, f), !!(super.optimizeNames(i, f) || this.else))
        return this.condition = T(this.condition, i, f), this;
    }
    get names() {
      const i = super.names;
      return se(i, this.condition), this.else && H(i, this.else.names), i;
    }
  }
  m.kind = "if";
  class v extends y {
  }
  v.kind = "for";
  class N extends v {
    constructor(i) {
      super(), this.iteration = i;
    }
    render(i) {
      return `for(${this.iteration})` + super.render(i);
    }
    optimizeNames(i, f) {
      if (super.optimizeNames(i, f))
        return this.iteration = T(this.iteration, i, f), this;
    }
    get names() {
      return H(super.names, this.iteration.names);
    }
  }
  class R extends v {
    constructor(i, f, E, I) {
      super(), this.varKind = i, this.name = f, this.from = E, this.to = I;
    }
    render(i) {
      const f = i.es5 ? r.varKinds.var : this.varKind, { name: E, from: I, to: j } = this;
      return `for(${f} ${E}=${I}; ${E}<${j}; ${E}++)` + super.render(i);
    }
    get names() {
      const i = se(super.names, this.from);
      return se(i, this.to);
    }
  }
  class O extends v {
    constructor(i, f, E, I) {
      super(), this.loop = i, this.varKind = f, this.name = E, this.iterable = I;
    }
    render(i) {
      return `for(${this.varKind} ${this.name} ${this.loop} ${this.iterable})` + super.render(i);
    }
    optimizeNames(i, f) {
      if (super.optimizeNames(i, f))
        return this.iterable = T(this.iterable, i, f), this;
    }
    get names() {
      return H(super.names, this.iterable.names);
    }
  }
  class G extends y {
    constructor(i, f, E) {
      super(), this.name = i, this.args = f, this.async = E;
    }
    render(i) {
      return `${this.async ? "async " : ""}function ${this.name}(${this.args})` + super.render(i);
    }
  }
  G.kind = "func";
  class B extends g {
    render(i) {
      return "return " + super.render(i);
    }
  }
  B.kind = "return";
  class le extends y {
    render(i) {
      let f = "try" + super.render(i);
      return this.catch && (f += this.catch.render(i)), this.finally && (f += this.finally.render(i)), f;
    }
    optimizeNodes() {
      var i, f;
      return super.optimizeNodes(), (i = this.catch) === null || i === void 0 || i.optimizeNodes(), (f = this.finally) === null || f === void 0 || f.optimizeNodes(), this;
    }
    optimizeNames(i, f) {
      var E, I;
      return super.optimizeNames(i, f), (E = this.catch) === null || E === void 0 || E.optimizeNames(i, f), (I = this.finally) === null || I === void 0 || I.optimizeNames(i, f), this;
    }
    get names() {
      const i = super.names;
      return this.catch && H(i, this.catch.names), this.finally && H(i, this.finally.names), i;
    }
  }
  class fe extends y {
    constructor(i) {
      super(), this.error = i;
    }
    render(i) {
      return `catch(${this.error})` + super.render(i);
    }
  }
  fe.kind = "catch";
  class pe extends y {
    render(i) {
      return "finally" + super.render(i);
    }
  }
  pe.kind = "finally";
  class z {
    constructor(i, f = {}) {
      this._values = {}, this._blockStarts = [], this._constants = {}, this.opts = { ...f, _n: f.lines ? `
` : "" }, this._extScope = i, this._scope = new r.Scope({ parent: i }), this._nodes = [new w()];
    }
    toString() {
      return this._root.render(this.opts);
    }
    // returns unique name in the internal scope
    name(i) {
      return this._scope.name(i);
    }
    // reserves unique name in the external scope
    scopeName(i) {
      return this._extScope.name(i);
    }
    // reserves unique name in the external scope and assigns value to it
    scopeValue(i, f) {
      const E = this._extScope.value(i, f);
      return (this._values[E.prefix] || (this._values[E.prefix] = /* @__PURE__ */ new Set())).add(E), E;
    }
    getScopeValue(i, f) {
      return this._extScope.getValue(i, f);
    }
    // return code that assigns values in the external scope to the names that are used internally
    // (same names that were returned by gen.scopeName or gen.scopeValue)
    scopeRefs(i) {
      return this._extScope.scopeRefs(i, this._values);
    }
    scopeCode() {
      return this._extScope.scopeCode(this._values);
    }
    _def(i, f, E, I) {
      const j = this._scope.toName(f);
      return E !== void 0 && I && (this._constants[j.str] = E), this._leafNode(new o(i, j, E)), j;
    }
    // `const` declaration (`var` in es5 mode)
    const(i, f, E) {
      return this._def(r.varKinds.const, i, f, E);
    }
    // `let` declaration with optional assignment (`var` in es5 mode)
    let(i, f, E) {
      return this._def(r.varKinds.let, i, f, E);
    }
    // `var` declaration with optional assignment
    var(i, f, E) {
      return this._def(r.varKinds.var, i, f, E);
    }
    // assignment code
    assign(i, f, E) {
      return this._leafNode(new u(i, f, E));
    }
    // `+=` code
    add(i, f) {
      return this._leafNode(new l(i, e.operators.ADD, f));
    }
    // appends passed SafeExpr to code or executes Block
    code(i) {
      return typeof i == "function" ? i() : i !== t.nil && this._leafNode(new b(i)), this;
    }
    // returns code for object literal for the passed argument list of key-value pairs
    object(...i) {
      const f = ["{"];
      for (const [E, I] of i)
        f.length > 1 && f.push(","), f.push(E), (E !== I || this.opts.es5) && (f.push(":"), (0, t.addCodeArg)(f, I));
      return f.push("}"), new t._Code(f);
    }
    // `if` clause (or statement if `thenBody` and, optionally, `elseBody` are passed)
    if(i, f, E) {
      if (this._blockNode(new m(i)), f && E)
        this.code(f).else().code(E).endIf();
      else if (f)
        this.code(f).endIf();
      else if (E)
        throw new Error('CodeGen: "else" body without "then" body');
      return this;
    }
    // `else if` clause - invalid without `if` or after `else` clauses
    elseIf(i) {
      return this._elseNode(new m(i));
    }
    // `else` clause - only valid after `if` or `else if` clauses
    else() {
      return this._elseNode(new _());
    }
    // end `if` statement (needed if gen.if was used only with condition)
    endIf() {
      return this._endBlockNode(m, _);
    }
    _for(i, f) {
      return this._blockNode(i), f && this.code(f).endFor(), this;
    }
    // a generic `for` clause (or statement if `forBody` is passed)
    for(i, f) {
      return this._for(new N(i), f);
    }
    // `for` statement for a range of values
    forRange(i, f, E, I, j = this.opts.es5 ? r.varKinds.var : r.varKinds.let) {
      const F = this._scope.toName(i);
      return this._for(new R(j, F, f, E), () => I(F));
    }
    // `for-of` statement (in es5 mode replace with a normal for loop)
    forOf(i, f, E, I = r.varKinds.const) {
      const j = this._scope.toName(i);
      if (this.opts.es5) {
        const F = f instanceof t.Name ? f : this.var("_arr", f);
        return this.forRange("_i", 0, (0, t._)`${F}.length`, (L) => {
          this.var(j, (0, t._)`${F}[${L}]`), E(j);
        });
      }
      return this._for(new O("of", I, j, f), () => E(j));
    }
    // `for-in` statement.
    // With option `ownProperties` replaced with a `for-of` loop for object keys
    forIn(i, f, E, I = this.opts.es5 ? r.varKinds.var : r.varKinds.const) {
      if (this.opts.ownProperties)
        return this.forOf(i, (0, t._)`Object.keys(${f})`, E);
      const j = this._scope.toName(i);
      return this._for(new O("in", I, j, f), () => E(j));
    }
    // end `for` loop
    endFor() {
      return this._endBlockNode(v);
    }
    // `label` statement
    label(i) {
      return this._leafNode(new c(i));
    }
    // `break` statement
    break(i) {
      return this._leafNode(new d(i));
    }
    // `return` statement
    return(i) {
      const f = new B();
      if (this._blockNode(f), this.code(i), f.nodes.length !== 1)
        throw new Error('CodeGen: "return" should have one node');
      return this._endBlockNode(B);
    }
    // `try` statement
    try(i, f, E) {
      if (!f && !E)
        throw new Error('CodeGen: "try" without "catch" and "finally"');
      const I = new le();
      if (this._blockNode(I), this.code(i), f) {
        const j = this.name("e");
        this._currNode = I.catch = new fe(j), f(j);
      }
      return E && (this._currNode = I.finally = new pe(), this.code(E)), this._endBlockNode(fe, pe);
    }
    // `throw` statement
    throw(i) {
      return this._leafNode(new h(i));
    }
    // start self-balancing block
    block(i, f) {
      return this._blockStarts.push(this._nodes.length), i && this.code(i).endBlock(f), this;
    }
    // end the current self-balancing block
    endBlock(i) {
      const f = this._blockStarts.pop();
      if (f === void 0)
        throw new Error("CodeGen: not in self-balancing block");
      const E = this._nodes.length - f;
      if (E < 0 || i !== void 0 && E !== i)
        throw new Error(`CodeGen: wrong number of nodes: ${E} vs ${i} expected`);
      return this._nodes.length = f, this;
    }
    // `function` heading (or definition if funcBody is passed)
    func(i, f = t.nil, E, I) {
      return this._blockNode(new G(i, f, E)), I && this.code(I).endFunc(), this;
    }
    // end function definition
    endFunc() {
      return this._endBlockNode(G);
    }
    optimize(i = 1) {
      for (; i-- > 0; )
        this._root.optimizeNodes(), this._root.optimizeNames(this._root.names, this._constants);
    }
    _leafNode(i) {
      return this._currNode.nodes.push(i), this;
    }
    _blockNode(i) {
      this._currNode.nodes.push(i), this._nodes.push(i);
    }
    _endBlockNode(i, f) {
      const E = this._currNode;
      if (E instanceof i || f && E instanceof f)
        return this._nodes.pop(), this;
      throw new Error(`CodeGen: not in block "${f ? `${i.kind}/${f.kind}` : i.kind}"`);
    }
    _elseNode(i) {
      const f = this._currNode;
      if (!(f instanceof m))
        throw new Error('CodeGen: "else" without "if"');
      return this._currNode = f.else = i, this;
    }
    get _root() {
      return this._nodes[0];
    }
    get _currNode() {
      const i = this._nodes;
      return i[i.length - 1];
    }
    set _currNode(i) {
      const f = this._nodes;
      f[f.length - 1] = i;
    }
  }
  e.CodeGen = z;
  function H($, i) {
    for (const f in i)
      $[f] = ($[f] || 0) + (i[f] || 0);
    return $;
  }
  function se($, i) {
    return i instanceof t._CodeOrName ? H($, i.names) : $;
  }
  function T($, i, f) {
    if ($ instanceof t.Name)
      return E($);
    if (!I($))
      return $;
    return new t._Code($._items.reduce((j, F) => (F instanceof t.Name && (F = E(F)), F instanceof t._Code ? j.push(...F._items) : j.push(F), j), []));
    function E(j) {
      const F = f[j.str];
      return F === void 0 || i[j.str] !== 1 ? j : (delete i[j.str], F);
    }
    function I(j) {
      return j instanceof t._Code && j._items.some((F) => F instanceof t.Name && i[F.str] === 1 && f[F.str] !== void 0);
    }
  }
  function k($, i) {
    for (const f in i)
      $[f] = ($[f] || 0) - (i[f] || 0);
  }
  function V($) {
    return typeof $ == "boolean" || typeof $ == "number" || $ === null ? !$ : (0, t._)`!${S($)}`;
  }
  e.not = V;
  const D = p(e.operators.AND);
  function K(...$) {
    return $.reduce(D);
  }
  e.and = K;
  const M = p(e.operators.OR);
  function P(...$) {
    return $.reduce(M);
  }
  e.or = P;
  function p($) {
    return (i, f) => i === t.nil ? f : f === t.nil ? i : (0, t._)`${S(i)} ${$} ${S(f)}`;
  }
  function S($) {
    return $ instanceof t.Name ? $ : (0, t._)`(${$})`;
  }
})(x);
var C = {};
Object.defineProperty(C, "__esModule", { value: !0 });
C.checkStrictMode = C.getErrorPath = C.Type = C.useFunc = C.setEvaluated = C.evaluatedPropsToName = C.mergeEvaluated = C.eachItem = C.unescapeJsonPointer = C.escapeJsonPointer = C.escapeFragment = C.unescapeFragment = C.schemaRefOrVal = C.schemaHasRulesButRef = C.schemaHasRules = C.checkUnknownRules = C.alwaysValidSchema = C.toHash = void 0;
const oe = x, a0 = rn;
function o0(e) {
  const t = {};
  for (const r of e)
    t[r] = !0;
  return t;
}
C.toHash = o0;
function i0(e, t) {
  return typeof t == "boolean" ? t : Object.keys(t).length === 0 ? !0 : (zl(e, t), !Ul(t, e.self.RULES.all));
}
C.alwaysValidSchema = i0;
function zl(e, t = e.schema) {
  const { opts: r, self: n } = e;
  if (!r.strictSchema || typeof t == "boolean")
    return;
  const s = n.RULES.keywords;
  for (const a in t)
    s[a] || Kl(e, `unknown keyword: "${a}"`);
}
C.checkUnknownRules = zl;
function Ul(e, t) {
  if (typeof e == "boolean")
    return !e;
  for (const r in e)
    if (t[r])
      return !0;
  return !1;
}
C.schemaHasRules = Ul;
function c0(e, t) {
  if (typeof e == "boolean")
    return !e;
  for (const r in e)
    if (r !== "$ref" && t.all[r])
      return !0;
  return !1;
}
C.schemaHasRulesButRef = c0;
function l0({ topSchemaRef: e, schemaPath: t }, r, n, s) {
  if (!s) {
    if (typeof r == "number" || typeof r == "boolean")
      return r;
    if (typeof r == "string")
      return (0, oe._)`${r}`;
  }
  return (0, oe._)`${e}${t}${(0, oe.getProperty)(n)}`;
}
C.schemaRefOrVal = l0;
function u0(e) {
  return ql(decodeURIComponent(e));
}
C.unescapeFragment = u0;
function d0(e) {
  return encodeURIComponent(oo(e));
}
C.escapeFragment = d0;
function oo(e) {
  return typeof e == "number" ? `${e}` : e.replace(/~/g, "~0").replace(/\//g, "~1");
}
C.escapeJsonPointer = oo;
function ql(e) {
  return e.replace(/~1/g, "/").replace(/~0/g, "~");
}
C.unescapeJsonPointer = ql;
function f0(e, t) {
  if (Array.isArray(e))
    for (const r of e)
      t(r);
  else
    t(e);
}
C.eachItem = f0;
function zi({ mergeNames: e, mergeToName: t, mergeValues: r, resultToName: n }) {
  return (s, a, o, u) => {
    const l = o === void 0 ? a : o instanceof oe.Name ? (a instanceof oe.Name ? e(s, a, o) : t(s, a, o), o) : a instanceof oe.Name ? (t(s, o, a), a) : r(a, o);
    return u === oe.Name && !(l instanceof oe.Name) ? n(s, l) : l;
  };
}
C.mergeEvaluated = {
  props: zi({
    mergeNames: (e, t, r) => e.if((0, oe._)`${r} !== true && ${t} !== undefined`, () => {
      e.if((0, oe._)`${t} === true`, () => e.assign(r, !0), () => e.assign(r, (0, oe._)`${r} || {}`).code((0, oe._)`Object.assign(${r}, ${t})`));
    }),
    mergeToName: (e, t, r) => e.if((0, oe._)`${r} !== true`, () => {
      t === !0 ? e.assign(r, !0) : (e.assign(r, (0, oe._)`${r} || {}`), io(e, r, t));
    }),
    mergeValues: (e, t) => e === !0 ? !0 : { ...e, ...t },
    resultToName: Gl
  }),
  items: zi({
    mergeNames: (e, t, r) => e.if((0, oe._)`${r} !== true && ${t} !== undefined`, () => e.assign(r, (0, oe._)`${t} === true ? true : ${r} > ${t} ? ${r} : ${t}`)),
    mergeToName: (e, t, r) => e.if((0, oe._)`${r} !== true`, () => e.assign(r, t === !0 ? !0 : (0, oe._)`${r} > ${t} ? ${r} : ${t}`)),
    mergeValues: (e, t) => e === !0 ? !0 : Math.max(e, t),
    resultToName: (e, t) => e.var("items", t)
  })
};
function Gl(e, t) {
  if (t === !0)
    return e.var("props", !0);
  const r = e.var("props", (0, oe._)`{}`);
  return t !== void 0 && io(e, r, t), r;
}
C.evaluatedPropsToName = Gl;
function io(e, t, r) {
  Object.keys(r).forEach((n) => e.assign((0, oe._)`${t}${(0, oe.getProperty)(n)}`, !0));
}
C.setEvaluated = io;
const Ui = {};
function h0(e, t) {
  return e.scopeValue("func", {
    ref: t,
    code: Ui[t.code] || (Ui[t.code] = new a0._Code(t.code))
  });
}
C.useFunc = h0;
var Js;
(function(e) {
  e[e.Num = 0] = "Num", e[e.Str = 1] = "Str";
})(Js || (C.Type = Js = {}));
function m0(e, t, r) {
  if (e instanceof oe.Name) {
    const n = t === Js.Num;
    return r ? n ? (0, oe._)`"[" + ${e} + "]"` : (0, oe._)`"['" + ${e} + "']"` : n ? (0, oe._)`"/" + ${e}` : (0, oe._)`"/" + ${e}.replace(/~/g, "~0").replace(/\\//g, "~1")`;
  }
  return r ? (0, oe.getProperty)(e).toString() : "/" + oo(e);
}
C.getErrorPath = m0;
function Kl(e, t, r = e.opts.strictSchema) {
  if (r) {
    if (t = `strict mode: ${t}`, r === !0)
      throw new Error(t);
    e.self.logger.warn(t);
  }
}
C.checkStrictMode = Kl;
var st = {};
Object.defineProperty(st, "__esModule", { value: !0 });
const Pe = x, p0 = {
  // validation function arguments
  data: new Pe.Name("data"),
  // data passed to validation function
  // args passed from referencing schema
  valCxt: new Pe.Name("valCxt"),
  // validation/data context - should not be used directly, it is destructured to the names below
  instancePath: new Pe.Name("instancePath"),
  parentData: new Pe.Name("parentData"),
  parentDataProperty: new Pe.Name("parentDataProperty"),
  rootData: new Pe.Name("rootData"),
  // root data - same as the data passed to the first/top validation function
  dynamicAnchors: new Pe.Name("dynamicAnchors"),
  // used to support recursiveRef and dynamicRef
  // function scoped variables
  vErrors: new Pe.Name("vErrors"),
  // null or array of validation errors
  errors: new Pe.Name("errors"),
  // counter of validation errors
  this: new Pe.Name("this"),
  // "globals"
  self: new Pe.Name("self"),
  scope: new Pe.Name("scope"),
  // JTD serialize/parse name for JSON string and position
  json: new Pe.Name("json"),
  jsonPos: new Pe.Name("jsonPos"),
  jsonLen: new Pe.Name("jsonLen"),
  jsonPart: new Pe.Name("jsonPart")
};
st.default = p0;
(function(e) {
  Object.defineProperty(e, "__esModule", { value: !0 }), e.extendErrors = e.resetErrorsCount = e.reportExtraError = e.reportError = e.keyword$DataError = e.keywordError = void 0;
  const t = x, r = C, n = st;
  e.keywordError = {
    message: ({ keyword: _ }) => (0, t.str)`must pass "${_}" keyword validation`
  }, e.keyword$DataError = {
    message: ({ keyword: _, schemaType: m }) => m ? (0, t.str)`"${_}" keyword must be ${m} ($data)` : (0, t.str)`"${_}" keyword is invalid ($data)`
  };
  function s(_, m = e.keywordError, v, N) {
    const { it: R } = _, { gen: O, compositeRule: G, allErrors: B } = R, le = h(_, m, v);
    N ?? (G || B) ? l(O, le) : c(R, (0, t._)`[${le}]`);
  }
  e.reportError = s;
  function a(_, m = e.keywordError, v) {
    const { it: N } = _, { gen: R, compositeRule: O, allErrors: G } = N, B = h(_, m, v);
    l(R, B), O || G || c(N, n.default.vErrors);
  }
  e.reportExtraError = a;
  function o(_, m) {
    _.assign(n.default.errors, m), _.if((0, t._)`${n.default.vErrors} !== null`, () => _.if(m, () => _.assign((0, t._)`${n.default.vErrors}.length`, m), () => _.assign(n.default.vErrors, null)));
  }
  e.resetErrorsCount = o;
  function u({ gen: _, keyword: m, schemaValue: v, data: N, errsCount: R, it: O }) {
    if (R === void 0)
      throw new Error("ajv implementation error");
    const G = _.name("err");
    _.forRange("i", R, n.default.errors, (B) => {
      _.const(G, (0, t._)`${n.default.vErrors}[${B}]`), _.if((0, t._)`${G}.instancePath === undefined`, () => _.assign((0, t._)`${G}.instancePath`, (0, t.strConcat)(n.default.instancePath, O.errorPath))), _.assign((0, t._)`${G}.schemaPath`, (0, t.str)`${O.errSchemaPath}/${m}`), O.opts.verbose && (_.assign((0, t._)`${G}.schema`, v), _.assign((0, t._)`${G}.data`, N));
    });
  }
  e.extendErrors = u;
  function l(_, m) {
    const v = _.const("err", m);
    _.if((0, t._)`${n.default.vErrors} === null`, () => _.assign(n.default.vErrors, (0, t._)`[${v}]`), (0, t._)`${n.default.vErrors}.push(${v})`), _.code((0, t._)`${n.default.errors}++`);
  }
  function c(_, m) {
    const { gen: v, validateName: N, schemaEnv: R } = _;
    R.$async ? v.throw((0, t._)`new ${_.ValidationError}(${m})`) : (v.assign((0, t._)`${N}.errors`, m), v.return(!1));
  }
  const d = {
    keyword: new t.Name("keyword"),
    schemaPath: new t.Name("schemaPath"),
    // also used in JTD errors
    params: new t.Name("params"),
    propertyName: new t.Name("propertyName"),
    message: new t.Name("message"),
    schema: new t.Name("schema"),
    parentSchema: new t.Name("parentSchema")
  };
  function h(_, m, v) {
    const { createErrors: N } = _.it;
    return N === !1 ? (0, t._)`{}` : b(_, m, v);
  }
  function b(_, m, v = {}) {
    const { gen: N, it: R } = _, O = [
      g(R, v),
      y(_, v)
    ];
    return w(_, m, O), N.object(...O);
  }
  function g({ errorPath: _ }, { instancePath: m }) {
    const v = m ? (0, t.str)`${_}${(0, r.getErrorPath)(m, r.Type.Str)}` : _;
    return [n.default.instancePath, (0, t.strConcat)(n.default.instancePath, v)];
  }
  function y({ keyword: _, it: { errSchemaPath: m } }, { schemaPath: v, parentSchema: N }) {
    let R = N ? m : (0, t.str)`${m}/${_}`;
    return v && (R = (0, t.str)`${R}${(0, r.getErrorPath)(v, r.Type.Str)}`), [d.schemaPath, R];
  }
  function w(_, { params: m, message: v }, N) {
    const { keyword: R, data: O, schemaValue: G, it: B } = _, { opts: le, propertyName: fe, topSchemaRef: pe, schemaPath: z } = B;
    N.push([d.keyword, R], [d.params, typeof m == "function" ? m(_) : m || (0, t._)`{}`]), le.messages && N.push([d.message, typeof v == "function" ? v(_) : v]), le.verbose && N.push([d.schema, G], [d.parentSchema, (0, t._)`${pe}${z}`], [n.default.data, O]), fe && N.push([d.propertyName, fe]);
  }
})(on);
Object.defineProperty(_r, "__esModule", { value: !0 });
_r.boolOrEmptySchema = _r.topBoolOrEmptySchema = void 0;
const $0 = on, y0 = x, _0 = st, g0 = {
  message: "boolean schema is false"
};
function v0(e) {
  const { gen: t, schema: r, validateName: n } = e;
  r === !1 ? Hl(e, !1) : typeof r == "object" && r.$async === !0 ? t.return(_0.default.data) : (t.assign((0, y0._)`${n}.errors`, null), t.return(!0));
}
_r.topBoolOrEmptySchema = v0;
function w0(e, t) {
  const { gen: r, schema: n } = e;
  n === !1 ? (r.var(t, !1), Hl(e)) : r.var(t, !0);
}
_r.boolOrEmptySchema = w0;
function Hl(e, t) {
  const { gen: r, data: n } = e, s = {
    gen: r,
    keyword: "false schema",
    data: n,
    schema: !1,
    schemaCode: !1,
    schemaValue: !1,
    params: {},
    it: e
  };
  (0, $0.reportError)(s, g0, void 0, t);
}
var ye = {}, er = {};
Object.defineProperty(er, "__esModule", { value: !0 });
er.getRules = er.isJSONType = void 0;
const E0 = ["string", "number", "integer", "boolean", "null", "object", "array"], b0 = new Set(E0);
function S0(e) {
  return typeof e == "string" && b0.has(e);
}
er.isJSONType = S0;
function P0() {
  const e = {
    number: { type: "number", rules: [] },
    string: { type: "string", rules: [] },
    array: { type: "array", rules: [] },
    object: { type: "object", rules: [] }
  };
  return {
    types: { ...e, integer: !0, boolean: !0, null: !0 },
    rules: [{ rules: [] }, e.number, e.string, e.array, e.object],
    post: { rules: [] },
    all: {},
    keywords: {}
  };
}
er.getRules = P0;
var ut = {};
Object.defineProperty(ut, "__esModule", { value: !0 });
ut.shouldUseRule = ut.shouldUseGroup = ut.schemaHasRulesForType = void 0;
function N0({ schema: e, self: t }, r) {
  const n = t.RULES.types[r];
  return n && n !== !0 && Jl(e, n);
}
ut.schemaHasRulesForType = N0;
function Jl(e, t) {
  return t.rules.some((r) => Xl(e, r));
}
ut.shouldUseGroup = Jl;
function Xl(e, t) {
  var r;
  return e[t.keyword] !== void 0 || ((r = t.definition.implements) === null || r === void 0 ? void 0 : r.some((n) => e[n] !== void 0));
}
ut.shouldUseRule = Xl;
Object.defineProperty(ye, "__esModule", { value: !0 });
ye.reportTypeError = ye.checkDataTypes = ye.checkDataType = ye.coerceAndCheckDataType = ye.getJSONTypes = ye.getSchemaTypes = ye.DataType = void 0;
const R0 = er, O0 = ut, I0 = on, Q = x, Bl = C;
var mr;
(function(e) {
  e[e.Correct = 0] = "Correct", e[e.Wrong = 1] = "Wrong";
})(mr || (ye.DataType = mr = {}));
function T0(e) {
  const t = Wl(e.type);
  if (t.includes("null")) {
    if (e.nullable === !1)
      throw new Error("type: null contradicts nullable: false");
  } else {
    if (!t.length && e.nullable !== void 0)
      throw new Error('"nullable" cannot be used without "type"');
    e.nullable === !0 && t.push("null");
  }
  return t;
}
ye.getSchemaTypes = T0;
function Wl(e) {
  const t = Array.isArray(e) ? e : e ? [e] : [];
  if (t.every(R0.isJSONType))
    return t;
  throw new Error("type must be JSONType or JSONType[]: " + t.join(","));
}
ye.getJSONTypes = Wl;
function j0(e, t) {
  const { gen: r, data: n, opts: s } = e, a = k0(t, s.coerceTypes), o = t.length > 0 && !(a.length === 0 && t.length === 1 && (0, O0.schemaHasRulesForType)(e, t[0]));
  if (o) {
    const u = co(t, n, s.strictNumbers, mr.Wrong);
    r.if(u, () => {
      a.length ? A0(e, t, a) : lo(e);
    });
  }
  return o;
}
ye.coerceAndCheckDataType = j0;
const Yl = /* @__PURE__ */ new Set(["string", "number", "integer", "boolean", "null"]);
function k0(e, t) {
  return t ? e.filter((r) => Yl.has(r) || t === "array" && r === "array") : [];
}
function A0(e, t, r) {
  const { gen: n, data: s, opts: a } = e, o = n.let("dataType", (0, Q._)`typeof ${s}`), u = n.let("coerced", (0, Q._)`undefined`);
  a.coerceTypes === "array" && n.if((0, Q._)`${o} == 'object' && Array.isArray(${s}) && ${s}.length == 1`, () => n.assign(s, (0, Q._)`${s}[0]`).assign(o, (0, Q._)`typeof ${s}`).if(co(t, s, a.strictNumbers), () => n.assign(u, s))), n.if((0, Q._)`${u} !== undefined`);
  for (const c of r)
    (Yl.has(c) || c === "array" && a.coerceTypes === "array") && l(c);
  n.else(), lo(e), n.endIf(), n.if((0, Q._)`${u} !== undefined`, () => {
    n.assign(s, u), C0(e, u);
  });
  function l(c) {
    switch (c) {
      case "string":
        n.elseIf((0, Q._)`${o} == "number" || ${o} == "boolean"`).assign(u, (0, Q._)`"" + ${s}`).elseIf((0, Q._)`${s} === null`).assign(u, (0, Q._)`""`);
        return;
      case "number":
        n.elseIf((0, Q._)`${o} == "boolean" || ${s} === null
              || (${o} == "string" && ${s} && ${s} == +${s})`).assign(u, (0, Q._)`+${s}`);
        return;
      case "integer":
        n.elseIf((0, Q._)`${o} === "boolean" || ${s} === null
              || (${o} === "string" && ${s} && ${s} == +${s} && !(${s} % 1))`).assign(u, (0, Q._)`+${s}`);
        return;
      case "boolean":
        n.elseIf((0, Q._)`${s} === "false" || ${s} === 0 || ${s} === null`).assign(u, !1).elseIf((0, Q._)`${s} === "true" || ${s} === 1`).assign(u, !0);
        return;
      case "null":
        n.elseIf((0, Q._)`${s} === "" || ${s} === 0 || ${s} === false`), n.assign(u, null);
        return;
      case "array":
        n.elseIf((0, Q._)`${o} === "string" || ${o} === "number"
              || ${o} === "boolean" || ${s} === null`).assign(u, (0, Q._)`[${s}]`);
    }
  }
}
function C0({ gen: e, parentData: t, parentDataProperty: r }, n) {
  e.if((0, Q._)`${t} !== undefined`, () => e.assign((0, Q._)`${t}[${r}]`, n));
}
function Xs(e, t, r, n = mr.Correct) {
  const s = n === mr.Correct ? Q.operators.EQ : Q.operators.NEQ;
  let a;
  switch (e) {
    case "null":
      return (0, Q._)`${t} ${s} null`;
    case "array":
      a = (0, Q._)`Array.isArray(${t})`;
      break;
    case "object":
      a = (0, Q._)`${t} && typeof ${t} == "object" && !Array.isArray(${t})`;
      break;
    case "integer":
      a = o((0, Q._)`!(${t} % 1) && !isNaN(${t})`);
      break;
    case "number":
      a = o();
      break;
    default:
      return (0, Q._)`typeof ${t} ${s} ${e}`;
  }
  return n === mr.Correct ? a : (0, Q.not)(a);
  function o(u = Q.nil) {
    return (0, Q.and)((0, Q._)`typeof ${t} == "number"`, u, r ? (0, Q._)`isFinite(${t})` : Q.nil);
  }
}
ye.checkDataType = Xs;
function co(e, t, r, n) {
  if (e.length === 1)
    return Xs(e[0], t, r, n);
  let s;
  const a = (0, Bl.toHash)(e);
  if (a.array && a.object) {
    const o = (0, Q._)`typeof ${t} != "object"`;
    s = a.null ? o : (0, Q._)`!${t} || ${o}`, delete a.null, delete a.array, delete a.object;
  } else
    s = Q.nil;
  a.number && delete a.integer;
  for (const o in a)
    s = (0, Q.and)(s, Xs(o, t, r, n));
  return s;
}
ye.checkDataTypes = co;
const D0 = {
  message: ({ schema: e }) => `must be ${e}`,
  params: ({ schema: e, schemaValue: t }) => typeof e == "string" ? (0, Q._)`{type: ${e}}` : (0, Q._)`{type: ${t}}`
};
function lo(e) {
  const t = M0(e);
  (0, I0.reportError)(t, D0);
}
ye.reportTypeError = lo;
function M0(e) {
  const { gen: t, data: r, schema: n } = e, s = (0, Bl.schemaRefOrVal)(e, n, "type");
  return {
    gen: t,
    keyword: "type",
    data: r,
    schema: n.type,
    schemaCode: s,
    schemaValue: s,
    parentSchema: n,
    params: {},
    it: e
  };
}
var ns = {};
Object.defineProperty(ns, "__esModule", { value: !0 });
ns.assignDefaults = void 0;
const sr = x, V0 = C;
function L0(e, t) {
  const { properties: r, items: n } = e.schema;
  if (t === "object" && r)
    for (const s in r)
      qi(e, s, r[s].default);
  else t === "array" && Array.isArray(n) && n.forEach((s, a) => qi(e, a, s.default));
}
ns.assignDefaults = L0;
function qi(e, t, r) {
  const { gen: n, compositeRule: s, data: a, opts: o } = e;
  if (r === void 0)
    return;
  const u = (0, sr._)`${a}${(0, sr.getProperty)(t)}`;
  if (s) {
    (0, V0.checkStrictMode)(e, `default is ignored for: ${u}`);
    return;
  }
  let l = (0, sr._)`${u} === undefined`;
  o.useDefaults === "empty" && (l = (0, sr._)`${l} || ${u} === null || ${u} === ""`), n.if(l, (0, sr._)`${u} = ${(0, sr.stringify)(r)}`);
}
var nt = {}, te = {};
Object.defineProperty(te, "__esModule", { value: !0 });
te.validateUnion = te.validateArray = te.usePattern = te.callValidateCode = te.schemaProperties = te.allSchemaProperties = te.noPropertyInData = te.propertyInData = te.isOwnProperty = te.hasPropFunc = te.reportMissingProp = te.checkMissingProp = te.checkReportMissingProp = void 0;
const ce = x, uo = C, gt = st, F0 = C;
function z0(e, t) {
  const { gen: r, data: n, it: s } = e;
  r.if(ho(r, n, t, s.opts.ownProperties), () => {
    e.setParams({ missingProperty: (0, ce._)`${t}` }, !0), e.error();
  });
}
te.checkReportMissingProp = z0;
function U0({ gen: e, data: t, it: { opts: r } }, n, s) {
  return (0, ce.or)(...n.map((a) => (0, ce.and)(ho(e, t, a, r.ownProperties), (0, ce._)`${s} = ${a}`)));
}
te.checkMissingProp = U0;
function q0(e, t) {
  e.setParams({ missingProperty: t }, !0), e.error();
}
te.reportMissingProp = q0;
function Ql(e) {
  return e.scopeValue("func", {
    // eslint-disable-next-line @typescript-eslint/unbound-method
    ref: Object.prototype.hasOwnProperty,
    code: (0, ce._)`Object.prototype.hasOwnProperty`
  });
}
te.hasPropFunc = Ql;
function fo(e, t, r) {
  return (0, ce._)`${Ql(e)}.call(${t}, ${r})`;
}
te.isOwnProperty = fo;
function G0(e, t, r, n) {
  const s = (0, ce._)`${t}${(0, ce.getProperty)(r)} !== undefined`;
  return n ? (0, ce._)`${s} && ${fo(e, t, r)}` : s;
}
te.propertyInData = G0;
function ho(e, t, r, n) {
  const s = (0, ce._)`${t}${(0, ce.getProperty)(r)} === undefined`;
  return n ? (0, ce.or)(s, (0, ce.not)(fo(e, t, r))) : s;
}
te.noPropertyInData = ho;
function Zl(e) {
  return e ? Object.keys(e).filter((t) => t !== "__proto__") : [];
}
te.allSchemaProperties = Zl;
function K0(e, t) {
  return Zl(t).filter((r) => !(0, uo.alwaysValidSchema)(e, t[r]));
}
te.schemaProperties = K0;
function H0({ schemaCode: e, data: t, it: { gen: r, topSchemaRef: n, schemaPath: s, errorPath: a }, it: o }, u, l, c) {
  const d = c ? (0, ce._)`${e}, ${t}, ${n}${s}` : t, h = [
    [gt.default.instancePath, (0, ce.strConcat)(gt.default.instancePath, a)],
    [gt.default.parentData, o.parentData],
    [gt.default.parentDataProperty, o.parentDataProperty],
    [gt.default.rootData, gt.default.rootData]
  ];
  o.opts.dynamicRef && h.push([gt.default.dynamicAnchors, gt.default.dynamicAnchors]);
  const b = (0, ce._)`${d}, ${r.object(...h)}`;
  return l !== ce.nil ? (0, ce._)`${u}.call(${l}, ${b})` : (0, ce._)`${u}(${b})`;
}
te.callValidateCode = H0;
const J0 = (0, ce._)`new RegExp`;
function X0({ gen: e, it: { opts: t } }, r) {
  const n = t.unicodeRegExp ? "u" : "", { regExp: s } = t.code, a = s(r, n);
  return e.scopeValue("pattern", {
    key: a.toString(),
    ref: a,
    code: (0, ce._)`${s.code === "new RegExp" ? J0 : (0, F0.useFunc)(e, s)}(${r}, ${n})`
  });
}
te.usePattern = X0;
function B0(e) {
  const { gen: t, data: r, keyword: n, it: s } = e, a = t.name("valid");
  if (s.allErrors) {
    const u = t.let("valid", !0);
    return o(() => t.assign(u, !1)), u;
  }
  return t.var(a, !0), o(() => t.break()), a;
  function o(u) {
    const l = t.const("len", (0, ce._)`${r}.length`);
    t.forRange("i", 0, l, (c) => {
      e.subschema({
        keyword: n,
        dataProp: c,
        dataPropType: uo.Type.Num
      }, a), t.if((0, ce.not)(a), u);
    });
  }
}
te.validateArray = B0;
function W0(e) {
  const { gen: t, schema: r, keyword: n, it: s } = e;
  if (!Array.isArray(r))
    throw new Error("ajv implementation error");
  if (r.some((l) => (0, uo.alwaysValidSchema)(s, l)) && !s.opts.unevaluated)
    return;
  const o = t.let("valid", !1), u = t.name("_valid");
  t.block(() => r.forEach((l, c) => {
    const d = e.subschema({
      keyword: n,
      schemaProp: c,
      compositeRule: !0
    }, u);
    t.assign(o, (0, ce._)`${o} || ${u}`), e.mergeValidEvaluated(d, u) || t.if((0, ce.not)(o));
  })), e.result(o, () => e.reset(), () => e.error(!0));
}
te.validateUnion = W0;
Object.defineProperty(nt, "__esModule", { value: !0 });
nt.validateKeywordUsage = nt.validSchemaType = nt.funcKeywordCode = nt.macroKeywordCode = void 0;
const Ie = x, Wt = st, Y0 = te, Q0 = on;
function Z0(e, t) {
  const { gen: r, keyword: n, schema: s, parentSchema: a, it: o } = e, u = t.macro.call(o.self, s, a, o), l = xl(r, n, u);
  o.opts.validateSchema !== !1 && o.self.validateSchema(u, !0);
  const c = r.name("valid");
  e.subschema({
    schema: u,
    schemaPath: Ie.nil,
    errSchemaPath: `${o.errSchemaPath}/${n}`,
    topSchemaRef: l,
    compositeRule: !0
  }, c), e.pass(c, () => e.error(!0));
}
nt.macroKeywordCode = Z0;
function x0(e, t) {
  var r;
  const { gen: n, keyword: s, schema: a, parentSchema: o, $data: u, it: l } = e;
  t_(l, t);
  const c = !u && t.compile ? t.compile.call(l.self, a, o, l) : t.validate, d = xl(n, s, c), h = n.let("valid");
  e.block$data(h, b), e.ok((r = t.valid) !== null && r !== void 0 ? r : h);
  function b() {
    if (t.errors === !1)
      w(), t.modifying && Gi(e), _(() => e.error());
    else {
      const m = t.async ? g() : y();
      t.modifying && Gi(e), _(() => e_(e, m));
    }
  }
  function g() {
    const m = n.let("ruleErrs", null);
    return n.try(() => w((0, Ie._)`await `), (v) => n.assign(h, !1).if((0, Ie._)`${v} instanceof ${l.ValidationError}`, () => n.assign(m, (0, Ie._)`${v}.errors`), () => n.throw(v))), m;
  }
  function y() {
    const m = (0, Ie._)`${d}.errors`;
    return n.assign(m, null), w(Ie.nil), m;
  }
  function w(m = t.async ? (0, Ie._)`await ` : Ie.nil) {
    const v = l.opts.passContext ? Wt.default.this : Wt.default.self, N = !("compile" in t && !u || t.schema === !1);
    n.assign(h, (0, Ie._)`${m}${(0, Y0.callValidateCode)(e, d, v, N)}`, t.modifying);
  }
  function _(m) {
    var v;
    n.if((0, Ie.not)((v = t.valid) !== null && v !== void 0 ? v : h), m);
  }
}
nt.funcKeywordCode = x0;
function Gi(e) {
  const { gen: t, data: r, it: n } = e;
  t.if(n.parentData, () => t.assign(r, (0, Ie._)`${n.parentData}[${n.parentDataProperty}]`));
}
function e_(e, t) {
  const { gen: r } = e;
  r.if((0, Ie._)`Array.isArray(${t})`, () => {
    r.assign(Wt.default.vErrors, (0, Ie._)`${Wt.default.vErrors} === null ? ${t} : ${Wt.default.vErrors}.concat(${t})`).assign(Wt.default.errors, (0, Ie._)`${Wt.default.vErrors}.length`), (0, Q0.extendErrors)(e);
  }, () => e.error());
}
function t_({ schemaEnv: e }, t) {
  if (t.async && !e.$async)
    throw new Error("async keyword in sync schema");
}
function xl(e, t, r) {
  if (r === void 0)
    throw new Error(`keyword "${t}" failed to compile`);
  return e.scopeValue("keyword", typeof r == "function" ? { ref: r } : { ref: r, code: (0, Ie.stringify)(r) });
}
function r_(e, t, r = !1) {
  return !t.length || t.some((n) => n === "array" ? Array.isArray(e) : n === "object" ? e && typeof e == "object" && !Array.isArray(e) : typeof e == n || r && typeof e > "u");
}
nt.validSchemaType = r_;
function n_({ schema: e, opts: t, self: r, errSchemaPath: n }, s, a) {
  if (Array.isArray(s.keyword) ? !s.keyword.includes(a) : s.keyword !== a)
    throw new Error("ajv implementation error");
  const o = s.dependencies;
  if (o != null && o.some((u) => !Object.prototype.hasOwnProperty.call(e, u)))
    throw new Error(`parent schema must have dependencies of ${a}: ${o.join(",")}`);
  if (s.validateSchema && !s.validateSchema(e[a])) {
    const l = `keyword "${a}" value is invalid at path "${n}": ` + r.errorsText(s.validateSchema.errors);
    if (t.validateSchema === "log")
      r.logger.error(l);
    else
      throw new Error(l);
  }
}
nt.validateKeywordUsage = n_;
var Ot = {};
Object.defineProperty(Ot, "__esModule", { value: !0 });
Ot.extendSubschemaMode = Ot.extendSubschemaData = Ot.getSubschema = void 0;
const et = x, eu = C;
function s_(e, { keyword: t, schemaProp: r, schema: n, schemaPath: s, errSchemaPath: a, topSchemaRef: o }) {
  if (t !== void 0 && n !== void 0)
    throw new Error('both "keyword" and "schema" passed, only one allowed');
  if (t !== void 0) {
    const u = e.schema[t];
    return r === void 0 ? {
      schema: u,
      schemaPath: (0, et._)`${e.schemaPath}${(0, et.getProperty)(t)}`,
      errSchemaPath: `${e.errSchemaPath}/${t}`
    } : {
      schema: u[r],
      schemaPath: (0, et._)`${e.schemaPath}${(0, et.getProperty)(t)}${(0, et.getProperty)(r)}`,
      errSchemaPath: `${e.errSchemaPath}/${t}/${(0, eu.escapeFragment)(r)}`
    };
  }
  if (n !== void 0) {
    if (s === void 0 || a === void 0 || o === void 0)
      throw new Error('"schemaPath", "errSchemaPath" and "topSchemaRef" are required with "schema"');
    return {
      schema: n,
      schemaPath: s,
      topSchemaRef: o,
      errSchemaPath: a
    };
  }
  throw new Error('either "keyword" or "schema" must be passed');
}
Ot.getSubschema = s_;
function a_(e, t, { dataProp: r, dataPropType: n, data: s, dataTypes: a, propertyName: o }) {
  if (s !== void 0 && r !== void 0)
    throw new Error('both "data" and "dataProp" passed, only one allowed');
  const { gen: u } = t;
  if (r !== void 0) {
    const { errorPath: c, dataPathArr: d, opts: h } = t, b = u.let("data", (0, et._)`${t.data}${(0, et.getProperty)(r)}`, !0);
    l(b), e.errorPath = (0, et.str)`${c}${(0, eu.getErrorPath)(r, n, h.jsPropertySyntax)}`, e.parentDataProperty = (0, et._)`${r}`, e.dataPathArr = [...d, e.parentDataProperty];
  }
  if (s !== void 0) {
    const c = s instanceof et.Name ? s : u.let("data", s, !0);
    l(c), o !== void 0 && (e.propertyName = o);
  }
  a && (e.dataTypes = a);
  function l(c) {
    e.data = c, e.dataLevel = t.dataLevel + 1, e.dataTypes = [], t.definedProperties = /* @__PURE__ */ new Set(), e.parentData = t.data, e.dataNames = [...t.dataNames, c];
  }
}
Ot.extendSubschemaData = a_;
function o_(e, { jtdDiscriminator: t, jtdMetadata: r, compositeRule: n, createErrors: s, allErrors: a }) {
  n !== void 0 && (e.compositeRule = n), s !== void 0 && (e.createErrors = s), a !== void 0 && (e.allErrors = a), e.jtdDiscriminator = t, e.jtdMetadata = r;
}
Ot.extendSubschemaMode = o_;
var Ee = {}, tu = { exports: {} }, Pt = tu.exports = function(e, t, r) {
  typeof t == "function" && (r = t, t = {}), r = t.cb || r;
  var n = typeof r == "function" ? r : r.pre || function() {
  }, s = r.post || function() {
  };
  kn(t, n, s, e, "", e);
};
Pt.keywords = {
  additionalItems: !0,
  items: !0,
  contains: !0,
  additionalProperties: !0,
  propertyNames: !0,
  not: !0,
  if: !0,
  then: !0,
  else: !0
};
Pt.arrayKeywords = {
  items: !0,
  allOf: !0,
  anyOf: !0,
  oneOf: !0
};
Pt.propsKeywords = {
  $defs: !0,
  definitions: !0,
  properties: !0,
  patternProperties: !0,
  dependencies: !0
};
Pt.skipKeywords = {
  default: !0,
  enum: !0,
  const: !0,
  required: !0,
  maximum: !0,
  minimum: !0,
  exclusiveMaximum: !0,
  exclusiveMinimum: !0,
  multipleOf: !0,
  maxLength: !0,
  minLength: !0,
  pattern: !0,
  format: !0,
  maxItems: !0,
  minItems: !0,
  uniqueItems: !0,
  maxProperties: !0,
  minProperties: !0
};
function kn(e, t, r, n, s, a, o, u, l, c) {
  if (n && typeof n == "object" && !Array.isArray(n)) {
    t(n, s, a, o, u, l, c);
    for (var d in n) {
      var h = n[d];
      if (Array.isArray(h)) {
        if (d in Pt.arrayKeywords)
          for (var b = 0; b < h.length; b++)
            kn(e, t, r, h[b], s + "/" + d + "/" + b, a, s, d, n, b);
      } else if (d in Pt.propsKeywords) {
        if (h && typeof h == "object")
          for (var g in h)
            kn(e, t, r, h[g], s + "/" + d + "/" + i_(g), a, s, d, n, g);
      } else (d in Pt.keywords || e.allKeys && !(d in Pt.skipKeywords)) && kn(e, t, r, h, s + "/" + d, a, s, d, n);
    }
    r(n, s, a, o, u, l, c);
  }
}
function i_(e) {
  return e.replace(/~/g, "~0").replace(/\//g, "~1");
}
var c_ = tu.exports;
Object.defineProperty(Ee, "__esModule", { value: !0 });
Ee.getSchemaRefs = Ee.resolveUrl = Ee.normalizeId = Ee._getFullPath = Ee.getFullPath = Ee.inlineRef = void 0;
const l_ = C, u_ = Yn, d_ = c_, f_ = /* @__PURE__ */ new Set([
  "type",
  "format",
  "pattern",
  "maxLength",
  "minLength",
  "maxProperties",
  "minProperties",
  "maxItems",
  "minItems",
  "maximum",
  "minimum",
  "uniqueItems",
  "multipleOf",
  "required",
  "enum",
  "const"
]);
function h_(e, t = !0) {
  return typeof e == "boolean" ? !0 : t === !0 ? !Bs(e) : t ? ru(e) <= t : !1;
}
Ee.inlineRef = h_;
const m_ = /* @__PURE__ */ new Set([
  "$ref",
  "$recursiveRef",
  "$recursiveAnchor",
  "$dynamicRef",
  "$dynamicAnchor"
]);
function Bs(e) {
  for (const t in e) {
    if (m_.has(t))
      return !0;
    const r = e[t];
    if (Array.isArray(r) && r.some(Bs) || typeof r == "object" && Bs(r))
      return !0;
  }
  return !1;
}
function ru(e) {
  let t = 0;
  for (const r in e) {
    if (r === "$ref")
      return 1 / 0;
    if (t++, !f_.has(r) && (typeof e[r] == "object" && (0, l_.eachItem)(e[r], (n) => t += ru(n)), t === 1 / 0))
      return 1 / 0;
  }
  return t;
}
function nu(e, t = "", r) {
  r !== !1 && (t = pr(t));
  const n = e.parse(t);
  return su(e, n);
}
Ee.getFullPath = nu;
function su(e, t) {
  return e.serialize(t).split("#")[0] + "#";
}
Ee._getFullPath = su;
const p_ = /#\/?$/;
function pr(e) {
  return e ? e.replace(p_, "") : "";
}
Ee.normalizeId = pr;
function $_(e, t, r) {
  return r = pr(r), e.resolve(t, r);
}
Ee.resolveUrl = $_;
const y_ = /^[a-z_][-a-z0-9._]*$/i;
function __(e, t) {
  if (typeof e == "boolean")
    return {};
  const { schemaId: r, uriResolver: n } = this.opts, s = pr(e[r] || t), a = { "": s }, o = nu(n, s, !1), u = {}, l = /* @__PURE__ */ new Set();
  return d_(e, { allKeys: !0 }, (h, b, g, y) => {
    if (y === void 0)
      return;
    const w = o + b;
    let _ = a[y];
    typeof h[r] == "string" && (_ = m.call(this, h[r])), v.call(this, h.$anchor), v.call(this, h.$dynamicAnchor), a[b] = _;
    function m(N) {
      const R = this.opts.uriResolver.resolve;
      if (N = pr(_ ? R(_, N) : N), l.has(N))
        throw d(N);
      l.add(N);
      let O = this.refs[N];
      return typeof O == "string" && (O = this.refs[O]), typeof O == "object" ? c(h, O.schema, N) : N !== pr(w) && (N[0] === "#" ? (c(h, u[N], N), u[N] = h) : this.refs[N] = w), N;
    }
    function v(N) {
      if (typeof N == "string") {
        if (!y_.test(N))
          throw new Error(`invalid anchor "${N}"`);
        m.call(this, `#${N}`);
      }
    }
  }), u;
  function c(h, b, g) {
    if (b !== void 0 && !u_(h, b))
      throw d(g);
  }
  function d(h) {
    return new Error(`reference "${h}" resolves to more than one schema`);
  }
}
Ee.getSchemaRefs = __;
Object.defineProperty(We, "__esModule", { value: !0 });
We.getData = We.KeywordCxt = We.validateFunctionCode = void 0;
const au = _r, Ki = ye, mo = ut, qn = ye, g_ = ns, Wr = nt, Es = Ot, q = x, X = st, v_ = Ee, dt = C, Vr = on;
function w_(e) {
  if (cu(e) && (lu(e), iu(e))) {
    S_(e);
    return;
  }
  ou(e, () => (0, au.topBoolOrEmptySchema)(e));
}
We.validateFunctionCode = w_;
function ou({ gen: e, validateName: t, schema: r, schemaEnv: n, opts: s }, a) {
  s.code.es5 ? e.func(t, (0, q._)`${X.default.data}, ${X.default.valCxt}`, n.$async, () => {
    e.code((0, q._)`"use strict"; ${Hi(r, s)}`), b_(e, s), e.code(a);
  }) : e.func(t, (0, q._)`${X.default.data}, ${E_(s)}`, n.$async, () => e.code(Hi(r, s)).code(a));
}
function E_(e) {
  return (0, q._)`{${X.default.instancePath}="", ${X.default.parentData}, ${X.default.parentDataProperty}, ${X.default.rootData}=${X.default.data}${e.dynamicRef ? (0, q._)`, ${X.default.dynamicAnchors}={}` : q.nil}}={}`;
}
function b_(e, t) {
  e.if(X.default.valCxt, () => {
    e.var(X.default.instancePath, (0, q._)`${X.default.valCxt}.${X.default.instancePath}`), e.var(X.default.parentData, (0, q._)`${X.default.valCxt}.${X.default.parentData}`), e.var(X.default.parentDataProperty, (0, q._)`${X.default.valCxt}.${X.default.parentDataProperty}`), e.var(X.default.rootData, (0, q._)`${X.default.valCxt}.${X.default.rootData}`), t.dynamicRef && e.var(X.default.dynamicAnchors, (0, q._)`${X.default.valCxt}.${X.default.dynamicAnchors}`);
  }, () => {
    e.var(X.default.instancePath, (0, q._)`""`), e.var(X.default.parentData, (0, q._)`undefined`), e.var(X.default.parentDataProperty, (0, q._)`undefined`), e.var(X.default.rootData, X.default.data), t.dynamicRef && e.var(X.default.dynamicAnchors, (0, q._)`{}`);
  });
}
function S_(e) {
  const { schema: t, opts: r, gen: n } = e;
  ou(e, () => {
    r.$comment && t.$comment && du(e), I_(e), n.let(X.default.vErrors, null), n.let(X.default.errors, 0), r.unevaluated && P_(e), uu(e), k_(e);
  });
}
function P_(e) {
  const { gen: t, validateName: r } = e;
  e.evaluated = t.const("evaluated", (0, q._)`${r}.evaluated`), t.if((0, q._)`${e.evaluated}.dynamicProps`, () => t.assign((0, q._)`${e.evaluated}.props`, (0, q._)`undefined`)), t.if((0, q._)`${e.evaluated}.dynamicItems`, () => t.assign((0, q._)`${e.evaluated}.items`, (0, q._)`undefined`));
}
function Hi(e, t) {
  const r = typeof e == "object" && e[t.schemaId];
  return r && (t.code.source || t.code.process) ? (0, q._)`/*# sourceURL=${r} */` : q.nil;
}
function N_(e, t) {
  if (cu(e) && (lu(e), iu(e))) {
    R_(e, t);
    return;
  }
  (0, au.boolOrEmptySchema)(e, t);
}
function iu({ schema: e, self: t }) {
  if (typeof e == "boolean")
    return !e;
  for (const r in e)
    if (t.RULES.all[r])
      return !0;
  return !1;
}
function cu(e) {
  return typeof e.schema != "boolean";
}
function R_(e, t) {
  const { schema: r, gen: n, opts: s } = e;
  s.$comment && r.$comment && du(e), T_(e), j_(e);
  const a = n.const("_errs", X.default.errors);
  uu(e, a), n.var(t, (0, q._)`${a} === ${X.default.errors}`);
}
function lu(e) {
  (0, dt.checkUnknownRules)(e), O_(e);
}
function uu(e, t) {
  if (e.opts.jtd)
    return Ji(e, [], !1, t);
  const r = (0, Ki.getSchemaTypes)(e.schema), n = (0, Ki.coerceAndCheckDataType)(e, r);
  Ji(e, r, !n, t);
}
function O_(e) {
  const { schema: t, errSchemaPath: r, opts: n, self: s } = e;
  t.$ref && n.ignoreKeywordsWithRef && (0, dt.schemaHasRulesButRef)(t, s.RULES) && s.logger.warn(`$ref: keywords ignored in schema at path "${r}"`);
}
function I_(e) {
  const { schema: t, opts: r } = e;
  t.default !== void 0 && r.useDefaults && r.strictSchema && (0, dt.checkStrictMode)(e, "default is ignored in the schema root");
}
function T_(e) {
  const t = e.schema[e.opts.schemaId];
  t && (e.baseId = (0, v_.resolveUrl)(e.opts.uriResolver, e.baseId, t));
}
function j_(e) {
  if (e.schema.$async && !e.schemaEnv.$async)
    throw new Error("async schema in sync schema");
}
function du({ gen: e, schemaEnv: t, schema: r, errSchemaPath: n, opts: s }) {
  const a = r.$comment;
  if (s.$comment === !0)
    e.code((0, q._)`${X.default.self}.logger.log(${a})`);
  else if (typeof s.$comment == "function") {
    const o = (0, q.str)`${n}/$comment`, u = e.scopeValue("root", { ref: t.root });
    e.code((0, q._)`${X.default.self}.opts.$comment(${a}, ${o}, ${u}.schema)`);
  }
}
function k_(e) {
  const { gen: t, schemaEnv: r, validateName: n, ValidationError: s, opts: a } = e;
  r.$async ? t.if((0, q._)`${X.default.errors} === 0`, () => t.return(X.default.data), () => t.throw((0, q._)`new ${s}(${X.default.vErrors})`)) : (t.assign((0, q._)`${n}.errors`, X.default.vErrors), a.unevaluated && A_(e), t.return((0, q._)`${X.default.errors} === 0`));
}
function A_({ gen: e, evaluated: t, props: r, items: n }) {
  r instanceof q.Name && e.assign((0, q._)`${t}.props`, r), n instanceof q.Name && e.assign((0, q._)`${t}.items`, n);
}
function Ji(e, t, r, n) {
  const { gen: s, schema: a, data: o, allErrors: u, opts: l, self: c } = e, { RULES: d } = c;
  if (a.$ref && (l.ignoreKeywordsWithRef || !(0, dt.schemaHasRulesButRef)(a, d))) {
    s.block(() => mu(e, "$ref", d.all.$ref.definition));
    return;
  }
  l.jtd || C_(e, t), s.block(() => {
    for (const b of d.rules)
      h(b);
    h(d.post);
  });
  function h(b) {
    (0, mo.shouldUseGroup)(a, b) && (b.type ? (s.if((0, qn.checkDataType)(b.type, o, l.strictNumbers)), Xi(e, b), t.length === 1 && t[0] === b.type && r && (s.else(), (0, qn.reportTypeError)(e)), s.endIf()) : Xi(e, b), u || s.if((0, q._)`${X.default.errors} === ${n || 0}`));
  }
}
function Xi(e, t) {
  const { gen: r, schema: n, opts: { useDefaults: s } } = e;
  s && (0, g_.assignDefaults)(e, t.type), r.block(() => {
    for (const a of t.rules)
      (0, mo.shouldUseRule)(n, a) && mu(e, a.keyword, a.definition, t.type);
  });
}
function C_(e, t) {
  e.schemaEnv.meta || !e.opts.strictTypes || (D_(e, t), e.opts.allowUnionTypes || M_(e, t), V_(e, e.dataTypes));
}
function D_(e, t) {
  if (t.length) {
    if (!e.dataTypes.length) {
      e.dataTypes = t;
      return;
    }
    t.forEach((r) => {
      fu(e.dataTypes, r) || po(e, `type "${r}" not allowed by context "${e.dataTypes.join(",")}"`);
    }), F_(e, t);
  }
}
function M_(e, t) {
  t.length > 1 && !(t.length === 2 && t.includes("null")) && po(e, "use allowUnionTypes to allow union type keyword");
}
function V_(e, t) {
  const r = e.self.RULES.all;
  for (const n in r) {
    const s = r[n];
    if (typeof s == "object" && (0, mo.shouldUseRule)(e.schema, s)) {
      const { type: a } = s.definition;
      a.length && !a.some((o) => L_(t, o)) && po(e, `missing type "${a.join(",")}" for keyword "${n}"`);
    }
  }
}
function L_(e, t) {
  return e.includes(t) || t === "number" && e.includes("integer");
}
function fu(e, t) {
  return e.includes(t) || t === "integer" && e.includes("number");
}
function F_(e, t) {
  const r = [];
  for (const n of e.dataTypes)
    fu(t, n) ? r.push(n) : t.includes("integer") && n === "number" && r.push("integer");
  e.dataTypes = r;
}
function po(e, t) {
  const r = e.schemaEnv.baseId + e.errSchemaPath;
  t += ` at "${r}" (strictTypes)`, (0, dt.checkStrictMode)(e, t, e.opts.strictTypes);
}
class hu {
  constructor(t, r, n) {
    if ((0, Wr.validateKeywordUsage)(t, r, n), this.gen = t.gen, this.allErrors = t.allErrors, this.keyword = n, this.data = t.data, this.schema = t.schema[n], this.$data = r.$data && t.opts.$data && this.schema && this.schema.$data, this.schemaValue = (0, dt.schemaRefOrVal)(t, this.schema, n, this.$data), this.schemaType = r.schemaType, this.parentSchema = t.schema, this.params = {}, this.it = t, this.def = r, this.$data)
      this.schemaCode = t.gen.const("vSchema", pu(this.$data, t));
    else if (this.schemaCode = this.schemaValue, !(0, Wr.validSchemaType)(this.schema, r.schemaType, r.allowUndefined))
      throw new Error(`${n} value must be ${JSON.stringify(r.schemaType)}`);
    ("code" in r ? r.trackErrors : r.errors !== !1) && (this.errsCount = t.gen.const("_errs", X.default.errors));
  }
  result(t, r, n) {
    this.failResult((0, q.not)(t), r, n);
  }
  failResult(t, r, n) {
    this.gen.if(t), n ? n() : this.error(), r ? (this.gen.else(), r(), this.allErrors && this.gen.endIf()) : this.allErrors ? this.gen.endIf() : this.gen.else();
  }
  pass(t, r) {
    this.failResult((0, q.not)(t), void 0, r);
  }
  fail(t) {
    if (t === void 0) {
      this.error(), this.allErrors || this.gen.if(!1);
      return;
    }
    this.gen.if(t), this.error(), this.allErrors ? this.gen.endIf() : this.gen.else();
  }
  fail$data(t) {
    if (!this.$data)
      return this.fail(t);
    const { schemaCode: r } = this;
    this.fail((0, q._)`${r} !== undefined && (${(0, q.or)(this.invalid$data(), t)})`);
  }
  error(t, r, n) {
    if (r) {
      this.setParams(r), this._error(t, n), this.setParams({});
      return;
    }
    this._error(t, n);
  }
  _error(t, r) {
    (t ? Vr.reportExtraError : Vr.reportError)(this, this.def.error, r);
  }
  $dataError() {
    (0, Vr.reportError)(this, this.def.$dataError || Vr.keyword$DataError);
  }
  reset() {
    if (this.errsCount === void 0)
      throw new Error('add "trackErrors" to keyword definition');
    (0, Vr.resetErrorsCount)(this.gen, this.errsCount);
  }
  ok(t) {
    this.allErrors || this.gen.if(t);
  }
  setParams(t, r) {
    r ? Object.assign(this.params, t) : this.params = t;
  }
  block$data(t, r, n = q.nil) {
    this.gen.block(() => {
      this.check$data(t, n), r();
    });
  }
  check$data(t = q.nil, r = q.nil) {
    if (!this.$data)
      return;
    const { gen: n, schemaCode: s, schemaType: a, def: o } = this;
    n.if((0, q.or)((0, q._)`${s} === undefined`, r)), t !== q.nil && n.assign(t, !0), (a.length || o.validateSchema) && (n.elseIf(this.invalid$data()), this.$dataError(), t !== q.nil && n.assign(t, !1)), n.else();
  }
  invalid$data() {
    const { gen: t, schemaCode: r, schemaType: n, def: s, it: a } = this;
    return (0, q.or)(o(), u());
    function o() {
      if (n.length) {
        if (!(r instanceof q.Name))
          throw new Error("ajv implementation error");
        const l = Array.isArray(n) ? n : [n];
        return (0, q._)`${(0, qn.checkDataTypes)(l, r, a.opts.strictNumbers, qn.DataType.Wrong)}`;
      }
      return q.nil;
    }
    function u() {
      if (s.validateSchema) {
        const l = t.scopeValue("validate$data", { ref: s.validateSchema });
        return (0, q._)`!${l}(${r})`;
      }
      return q.nil;
    }
  }
  subschema(t, r) {
    const n = (0, Es.getSubschema)(this.it, t);
    (0, Es.extendSubschemaData)(n, this.it, t), (0, Es.extendSubschemaMode)(n, t);
    const s = { ...this.it, ...n, items: void 0, props: void 0 };
    return N_(s, r), s;
  }
  mergeEvaluated(t, r) {
    const { it: n, gen: s } = this;
    n.opts.unevaluated && (n.props !== !0 && t.props !== void 0 && (n.props = dt.mergeEvaluated.props(s, t.props, n.props, r)), n.items !== !0 && t.items !== void 0 && (n.items = dt.mergeEvaluated.items(s, t.items, n.items, r)));
  }
  mergeValidEvaluated(t, r) {
    const { it: n, gen: s } = this;
    if (n.opts.unevaluated && (n.props !== !0 || n.items !== !0))
      return s.if(r, () => this.mergeEvaluated(t, q.Name)), !0;
  }
}
We.KeywordCxt = hu;
function mu(e, t, r, n) {
  const s = new hu(e, r, t);
  "code" in r ? r.code(s, n) : s.$data && r.validate ? (0, Wr.funcKeywordCode)(s, r) : "macro" in r ? (0, Wr.macroKeywordCode)(s, r) : (r.compile || r.validate) && (0, Wr.funcKeywordCode)(s, r);
}
const z_ = /^\/(?:[^~]|~0|~1)*$/, U_ = /^([0-9]+)(#|\/(?:[^~]|~0|~1)*)?$/;
function pu(e, { dataLevel: t, dataNames: r, dataPathArr: n }) {
  let s, a;
  if (e === "")
    return X.default.rootData;
  if (e[0] === "/") {
    if (!z_.test(e))
      throw new Error(`Invalid JSON-pointer: ${e}`);
    s = e, a = X.default.rootData;
  } else {
    const c = U_.exec(e);
    if (!c)
      throw new Error(`Invalid JSON-pointer: ${e}`);
    const d = +c[1];
    if (s = c[2], s === "#") {
      if (d >= t)
        throw new Error(l("property/index", d));
      return n[t - d];
    }
    if (d > t)
      throw new Error(l("data", d));
    if (a = r[t - d], !s)
      return a;
  }
  let o = a;
  const u = s.split("/");
  for (const c of u)
    c && (a = (0, q._)`${a}${(0, q.getProperty)((0, dt.unescapeJsonPointer)(c))}`, o = (0, q._)`${o} && ${a}`);
  return o;
  function l(c, d) {
    return `Cannot access ${c} ${d} levels up, current level is ${t}`;
  }
}
We.getData = pu;
var cn = {};
Object.defineProperty(cn, "__esModule", { value: !0 });
class q_ extends Error {
  constructor(t) {
    super("validation failed"), this.errors = t, this.ajv = this.validation = !0;
  }
}
cn.default = q_;
var Pr = {};
Object.defineProperty(Pr, "__esModule", { value: !0 });
const bs = Ee;
class G_ extends Error {
  constructor(t, r, n, s) {
    super(s || `can't resolve reference ${n} from id ${r}`), this.missingRef = (0, bs.resolveUrl)(t, r, n), this.missingSchema = (0, bs.normalizeId)((0, bs.getFullPath)(t, this.missingRef));
  }
}
Pr.default = G_;
var Ce = {};
Object.defineProperty(Ce, "__esModule", { value: !0 });
Ce.resolveSchema = Ce.getCompilingSchema = Ce.resolveRef = Ce.compileSchema = Ce.SchemaEnv = void 0;
const Ge = x, K_ = cn, Kt = st, Xe = Ee, Bi = C, H_ = We;
class ss {
  constructor(t) {
    var r;
    this.refs = {}, this.dynamicAnchors = {};
    let n;
    typeof t.schema == "object" && (n = t.schema), this.schema = t.schema, this.schemaId = t.schemaId, this.root = t.root || this, this.baseId = (r = t.baseId) !== null && r !== void 0 ? r : (0, Xe.normalizeId)(n == null ? void 0 : n[t.schemaId || "$id"]), this.schemaPath = t.schemaPath, this.localRefs = t.localRefs, this.meta = t.meta, this.$async = n == null ? void 0 : n.$async, this.refs = {};
  }
}
Ce.SchemaEnv = ss;
function $o(e) {
  const t = $u.call(this, e);
  if (t)
    return t;
  const r = (0, Xe.getFullPath)(this.opts.uriResolver, e.root.baseId), { es5: n, lines: s } = this.opts.code, { ownProperties: a } = this.opts, o = new Ge.CodeGen(this.scope, { es5: n, lines: s, ownProperties: a });
  let u;
  e.$async && (u = o.scopeValue("Error", {
    ref: K_.default,
    code: (0, Ge._)`require("ajv/dist/runtime/validation_error").default`
  }));
  const l = o.scopeName("validate");
  e.validateName = l;
  const c = {
    gen: o,
    allErrors: this.opts.allErrors,
    data: Kt.default.data,
    parentData: Kt.default.parentData,
    parentDataProperty: Kt.default.parentDataProperty,
    dataNames: [Kt.default.data],
    dataPathArr: [Ge.nil],
    // TODO can its length be used as dataLevel if nil is removed?
    dataLevel: 0,
    dataTypes: [],
    definedProperties: /* @__PURE__ */ new Set(),
    topSchemaRef: o.scopeValue("schema", this.opts.code.source === !0 ? { ref: e.schema, code: (0, Ge.stringify)(e.schema) } : { ref: e.schema }),
    validateName: l,
    ValidationError: u,
    schema: e.schema,
    schemaEnv: e,
    rootId: r,
    baseId: e.baseId || r,
    schemaPath: Ge.nil,
    errSchemaPath: e.schemaPath || (this.opts.jtd ? "" : "#"),
    errorPath: (0, Ge._)`""`,
    opts: this.opts,
    self: this
  };
  let d;
  try {
    this._compilations.add(e), (0, H_.validateFunctionCode)(c), o.optimize(this.opts.code.optimize);
    const h = o.toString();
    d = `${o.scopeRefs(Kt.default.scope)}return ${h}`, this.opts.code.process && (d = this.opts.code.process(d, e));
    const g = new Function(`${Kt.default.self}`, `${Kt.default.scope}`, d)(this, this.scope.get());
    if (this.scope.value(l, { ref: g }), g.errors = null, g.schema = e.schema, g.schemaEnv = e, e.$async && (g.$async = !0), this.opts.code.source === !0 && (g.source = { validateName: l, validateCode: h, scopeValues: o._values }), this.opts.unevaluated) {
      const { props: y, items: w } = c;
      g.evaluated = {
        props: y instanceof Ge.Name ? void 0 : y,
        items: w instanceof Ge.Name ? void 0 : w,
        dynamicProps: y instanceof Ge.Name,
        dynamicItems: w instanceof Ge.Name
      }, g.source && (g.source.evaluated = (0, Ge.stringify)(g.evaluated));
    }
    return e.validate = g, e;
  } catch (h) {
    throw delete e.validate, delete e.validateName, d && this.logger.error("Error compiling schema, function code:", d), h;
  } finally {
    this._compilations.delete(e);
  }
}
Ce.compileSchema = $o;
function J_(e, t, r) {
  var n;
  r = (0, Xe.resolveUrl)(this.opts.uriResolver, t, r);
  const s = e.refs[r];
  if (s)
    return s;
  let a = W_.call(this, e, r);
  if (a === void 0) {
    const o = (n = e.localRefs) === null || n === void 0 ? void 0 : n[r], { schemaId: u } = this.opts;
    o && (a = new ss({ schema: o, schemaId: u, root: e, baseId: t }));
  }
  if (a !== void 0)
    return e.refs[r] = X_.call(this, a);
}
Ce.resolveRef = J_;
function X_(e) {
  return (0, Xe.inlineRef)(e.schema, this.opts.inlineRefs) ? e.schema : e.validate ? e : $o.call(this, e);
}
function $u(e) {
  for (const t of this._compilations)
    if (B_(t, e))
      return t;
}
Ce.getCompilingSchema = $u;
function B_(e, t) {
  return e.schema === t.schema && e.root === t.root && e.baseId === t.baseId;
}
function W_(e, t) {
  let r;
  for (; typeof (r = this.refs[t]) == "string"; )
    t = r;
  return r || this.schemas[t] || as.call(this, e, t);
}
function as(e, t) {
  const r = this.opts.uriResolver.parse(t), n = (0, Xe._getFullPath)(this.opts.uriResolver, r);
  let s = (0, Xe.getFullPath)(this.opts.uriResolver, e.baseId, void 0);
  if (Object.keys(e.schema).length > 0 && n === s)
    return Ss.call(this, r, e);
  const a = (0, Xe.normalizeId)(n), o = this.refs[a] || this.schemas[a];
  if (typeof o == "string") {
    const u = as.call(this, e, o);
    return typeof (u == null ? void 0 : u.schema) != "object" ? void 0 : Ss.call(this, r, u);
  }
  if (typeof (o == null ? void 0 : o.schema) == "object") {
    if (o.validate || $o.call(this, o), a === (0, Xe.normalizeId)(t)) {
      const { schema: u } = o, { schemaId: l } = this.opts, c = u[l];
      return c && (s = (0, Xe.resolveUrl)(this.opts.uriResolver, s, c)), new ss({ schema: u, schemaId: l, root: e, baseId: s });
    }
    return Ss.call(this, r, o);
  }
}
Ce.resolveSchema = as;
const Y_ = /* @__PURE__ */ new Set([
  "properties",
  "patternProperties",
  "enum",
  "dependencies",
  "definitions"
]);
function Ss(e, { baseId: t, schema: r, root: n }) {
  var s;
  if (((s = e.fragment) === null || s === void 0 ? void 0 : s[0]) !== "/")
    return;
  for (const u of e.fragment.slice(1).split("/")) {
    if (typeof r == "boolean")
      return;
    const l = r[(0, Bi.unescapeFragment)(u)];
    if (l === void 0)
      return;
    r = l;
    const c = typeof r == "object" && r[this.opts.schemaId];
    !Y_.has(u) && c && (t = (0, Xe.resolveUrl)(this.opts.uriResolver, t, c));
  }
  let a;
  if (typeof r != "boolean" && r.$ref && !(0, Bi.schemaHasRulesButRef)(r, this.RULES)) {
    const u = (0, Xe.resolveUrl)(this.opts.uriResolver, t, r.$ref);
    a = as.call(this, n, u);
  }
  const { schemaId: o } = this.opts;
  if (a = a || new ss({ schema: r, schemaId: o, root: n, baseId: t }), a.schema !== a.root.schema)
    return a;
}
const Q_ = "https://raw.githubusercontent.com/ajv-validator/ajv/master/lib/refs/data.json#", Z_ = "Meta-schema for $data reference (JSON AnySchema extension proposal)", x_ = "object", eg = [
  "$data"
], tg = {
  $data: {
    type: "string",
    anyOf: [
      {
        format: "relative-json-pointer"
      },
      {
        format: "json-pointer"
      }
    ]
  }
}, rg = !1, ng = {
  $id: Q_,
  description: Z_,
  type: x_,
  required: eg,
  properties: tg,
  additionalProperties: rg
};
var yo = {};
Object.defineProperty(yo, "__esModule", { value: !0 });
const yu = Nl;
yu.code = 'require("ajv/dist/runtime/uri").default';
yo.default = yu;
(function(e) {
  Object.defineProperty(e, "__esModule", { value: !0 }), e.CodeGen = e.Name = e.nil = e.stringify = e.str = e._ = e.KeywordCxt = void 0;
  var t = We;
  Object.defineProperty(e, "KeywordCxt", { enumerable: !0, get: function() {
    return t.KeywordCxt;
  } });
  var r = x;
  Object.defineProperty(e, "_", { enumerable: !0, get: function() {
    return r._;
  } }), Object.defineProperty(e, "str", { enumerable: !0, get: function() {
    return r.str;
  } }), Object.defineProperty(e, "stringify", { enumerable: !0, get: function() {
    return r.stringify;
  } }), Object.defineProperty(e, "nil", { enumerable: !0, get: function() {
    return r.nil;
  } }), Object.defineProperty(e, "Name", { enumerable: !0, get: function() {
    return r.Name;
  } }), Object.defineProperty(e, "CodeGen", { enumerable: !0, get: function() {
    return r.CodeGen;
  } });
  const n = cn, s = Pr, a = er, o = Ce, u = x, l = Ee, c = ye, d = C, h = ng, b = yo, g = (P, p) => new RegExp(P, p);
  g.code = "new RegExp";
  const y = ["removeAdditional", "useDefaults", "coerceTypes"], w = /* @__PURE__ */ new Set([
    "validate",
    "serialize",
    "parse",
    "wrapper",
    "root",
    "schema",
    "keyword",
    "pattern",
    "formats",
    "validate$data",
    "func",
    "obj",
    "Error"
  ]), _ = {
    errorDataPath: "",
    format: "`validateFormats: false` can be used instead.",
    nullable: '"nullable" keyword is supported by default.',
    jsonPointers: "Deprecated jsPropertySyntax can be used instead.",
    extendRefs: "Deprecated ignoreKeywordsWithRef can be used instead.",
    missingRefs: "Pass empty schema with $id that should be ignored to ajv.addSchema.",
    processCode: "Use option `code: {process: (code, schemaEnv: object) => string}`",
    sourceCode: "Use option `code: {source: true}`",
    strictDefaults: "It is default now, see option `strict`.",
    strictKeywords: "It is default now, see option `strict`.",
    uniqueItems: '"uniqueItems" keyword is always validated.',
    unknownFormats: "Disable strict mode or pass `true` to `ajv.addFormat` (or `formats` option).",
    cache: "Map is used as cache, schema object as key.",
    serialize: "Map is used as cache, schema object as key.",
    ajvErrors: "It is default now."
  }, m = {
    ignoreKeywordsWithRef: "",
    jsPropertySyntax: "",
    unicode: '"minLength"/"maxLength" account for unicode characters by default.'
  }, v = 200;
  function N(P) {
    var p, S, $, i, f, E, I, j, F, L, re, De, It, Tt, jt, kt, At, Ct, Dt, Mt, Vt, Lt, Ft, zt, Ut;
    const Ue = P.strict, qt = (p = P.code) === null || p === void 0 ? void 0 : p.optimize, Ir = qt === !0 || qt === void 0 ? 1 : qt || 0, Tr = ($ = (S = P.code) === null || S === void 0 ? void 0 : S.regExp) !== null && $ !== void 0 ? $ : g, hs = (i = P.uriResolver) !== null && i !== void 0 ? i : b.default;
    return {
      strictSchema: (E = (f = P.strictSchema) !== null && f !== void 0 ? f : Ue) !== null && E !== void 0 ? E : !0,
      strictNumbers: (j = (I = P.strictNumbers) !== null && I !== void 0 ? I : Ue) !== null && j !== void 0 ? j : !0,
      strictTypes: (L = (F = P.strictTypes) !== null && F !== void 0 ? F : Ue) !== null && L !== void 0 ? L : "log",
      strictTuples: (De = (re = P.strictTuples) !== null && re !== void 0 ? re : Ue) !== null && De !== void 0 ? De : "log",
      strictRequired: (Tt = (It = P.strictRequired) !== null && It !== void 0 ? It : Ue) !== null && Tt !== void 0 ? Tt : !1,
      code: P.code ? { ...P.code, optimize: Ir, regExp: Tr } : { optimize: Ir, regExp: Tr },
      loopRequired: (jt = P.loopRequired) !== null && jt !== void 0 ? jt : v,
      loopEnum: (kt = P.loopEnum) !== null && kt !== void 0 ? kt : v,
      meta: (At = P.meta) !== null && At !== void 0 ? At : !0,
      messages: (Ct = P.messages) !== null && Ct !== void 0 ? Ct : !0,
      inlineRefs: (Dt = P.inlineRefs) !== null && Dt !== void 0 ? Dt : !0,
      schemaId: (Mt = P.schemaId) !== null && Mt !== void 0 ? Mt : "$id",
      addUsedSchema: (Vt = P.addUsedSchema) !== null && Vt !== void 0 ? Vt : !0,
      validateSchema: (Lt = P.validateSchema) !== null && Lt !== void 0 ? Lt : !0,
      validateFormats: (Ft = P.validateFormats) !== null && Ft !== void 0 ? Ft : !0,
      unicodeRegExp: (zt = P.unicodeRegExp) !== null && zt !== void 0 ? zt : !0,
      int32range: (Ut = P.int32range) !== null && Ut !== void 0 ? Ut : !0,
      uriResolver: hs
    };
  }
  class R {
    constructor(p = {}) {
      this.schemas = {}, this.refs = {}, this.formats = {}, this._compilations = /* @__PURE__ */ new Set(), this._loading = {}, this._cache = /* @__PURE__ */ new Map(), p = this.opts = { ...p, ...N(p) };
      const { es5: S, lines: $ } = this.opts.code;
      this.scope = new u.ValueScope({ scope: {}, prefixes: w, es5: S, lines: $ }), this.logger = H(p.logger);
      const i = p.validateFormats;
      p.validateFormats = !1, this.RULES = (0, a.getRules)(), O.call(this, _, p, "NOT SUPPORTED"), O.call(this, m, p, "DEPRECATED", "warn"), this._metaOpts = pe.call(this), p.formats && le.call(this), this._addVocabularies(), this._addDefaultMetaSchema(), p.keywords && fe.call(this, p.keywords), typeof p.meta == "object" && this.addMetaSchema(p.meta), B.call(this), p.validateFormats = i;
    }
    _addVocabularies() {
      this.addKeyword("$async");
    }
    _addDefaultMetaSchema() {
      const { $data: p, meta: S, schemaId: $ } = this.opts;
      let i = h;
      $ === "id" && (i = { ...h }, i.id = i.$id, delete i.$id), S && p && this.addMetaSchema(i, i[$], !1);
    }
    defaultMeta() {
      const { meta: p, schemaId: S } = this.opts;
      return this.opts.defaultMeta = typeof p == "object" ? p[S] || p : void 0;
    }
    validate(p, S) {
      let $;
      if (typeof p == "string") {
        if ($ = this.getSchema(p), !$)
          throw new Error(`no schema with key or ref "${p}"`);
      } else
        $ = this.compile(p);
      const i = $(S);
      return "$async" in $ || (this.errors = $.errors), i;
    }
    compile(p, S) {
      const $ = this._addSchema(p, S);
      return $.validate || this._compileSchemaEnv($);
    }
    compileAsync(p, S) {
      if (typeof this.opts.loadSchema != "function")
        throw new Error("options.loadSchema should be a function");
      const { loadSchema: $ } = this.opts;
      return i.call(this, p, S);
      async function i(L, re) {
        await f.call(this, L.$schema);
        const De = this._addSchema(L, re);
        return De.validate || E.call(this, De);
      }
      async function f(L) {
        L && !this.getSchema(L) && await i.call(this, { $ref: L }, !0);
      }
      async function E(L) {
        try {
          return this._compileSchemaEnv(L);
        } catch (re) {
          if (!(re instanceof s.default))
            throw re;
          return I.call(this, re), await j.call(this, re.missingSchema), E.call(this, L);
        }
      }
      function I({ missingSchema: L, missingRef: re }) {
        if (this.refs[L])
          throw new Error(`AnySchema ${L} is loaded but ${re} cannot be resolved`);
      }
      async function j(L) {
        const re = await F.call(this, L);
        this.refs[L] || await f.call(this, re.$schema), this.refs[L] || this.addSchema(re, L, S);
      }
      async function F(L) {
        const re = this._loading[L];
        if (re)
          return re;
        try {
          return await (this._loading[L] = $(L));
        } finally {
          delete this._loading[L];
        }
      }
    }
    // Adds schema to the instance
    addSchema(p, S, $, i = this.opts.validateSchema) {
      if (Array.isArray(p)) {
        for (const E of p)
          this.addSchema(E, void 0, $, i);
        return this;
      }
      let f;
      if (typeof p == "object") {
        const { schemaId: E } = this.opts;
        if (f = p[E], f !== void 0 && typeof f != "string")
          throw new Error(`schema ${E} must be string`);
      }
      return S = (0, l.normalizeId)(S || f), this._checkUnique(S), this.schemas[S] = this._addSchema(p, $, S, i, !0), this;
    }
    // Add schema that will be used to validate other schemas
    // options in META_IGNORE_OPTIONS are alway set to false
    addMetaSchema(p, S, $ = this.opts.validateSchema) {
      return this.addSchema(p, S, !0, $), this;
    }
    //  Validate schema against its meta-schema
    validateSchema(p, S) {
      if (typeof p == "boolean")
        return !0;
      let $;
      if ($ = p.$schema, $ !== void 0 && typeof $ != "string")
        throw new Error("$schema must be a string");
      if ($ = $ || this.opts.defaultMeta || this.defaultMeta(), !$)
        return this.logger.warn("meta-schema not available"), this.errors = null, !0;
      const i = this.validate($, p);
      if (!i && S) {
        const f = "schema is invalid: " + this.errorsText();
        if (this.opts.validateSchema === "log")
          this.logger.error(f);
        else
          throw new Error(f);
      }
      return i;
    }
    // Get compiled schema by `key` or `ref`.
    // (`key` that was passed to `addSchema` or full schema reference - `schema.$id` or resolved id)
    getSchema(p) {
      let S;
      for (; typeof (S = G.call(this, p)) == "string"; )
        p = S;
      if (S === void 0) {
        const { schemaId: $ } = this.opts, i = new o.SchemaEnv({ schema: {}, schemaId: $ });
        if (S = o.resolveSchema.call(this, i, p), !S)
          return;
        this.refs[p] = S;
      }
      return S.validate || this._compileSchemaEnv(S);
    }
    // Remove cached schema(s).
    // If no parameter is passed all schemas but meta-schemas are removed.
    // If RegExp is passed all schemas with key/id matching pattern but meta-schemas are removed.
    // Even if schema is referenced by other schemas it still can be removed as other schemas have local references.
    removeSchema(p) {
      if (p instanceof RegExp)
        return this._removeAllSchemas(this.schemas, p), this._removeAllSchemas(this.refs, p), this;
      switch (typeof p) {
        case "undefined":
          return this._removeAllSchemas(this.schemas), this._removeAllSchemas(this.refs), this._cache.clear(), this;
        case "string": {
          const S = G.call(this, p);
          return typeof S == "object" && this._cache.delete(S.schema), delete this.schemas[p], delete this.refs[p], this;
        }
        case "object": {
          const S = p;
          this._cache.delete(S);
          let $ = p[this.opts.schemaId];
          return $ && ($ = (0, l.normalizeId)($), delete this.schemas[$], delete this.refs[$]), this;
        }
        default:
          throw new Error("ajv.removeSchema: invalid parameter");
      }
    }
    // add "vocabulary" - a collection of keywords
    addVocabulary(p) {
      for (const S of p)
        this.addKeyword(S);
      return this;
    }
    addKeyword(p, S) {
      let $;
      if (typeof p == "string")
        $ = p, typeof S == "object" && (this.logger.warn("these parameters are deprecated, see docs for addKeyword"), S.keyword = $);
      else if (typeof p == "object" && S === void 0) {
        if (S = p, $ = S.keyword, Array.isArray($) && !$.length)
          throw new Error("addKeywords: keyword must be string or non-empty array");
      } else
        throw new Error("invalid addKeywords parameters");
      if (T.call(this, $, S), !S)
        return (0, d.eachItem)($, (f) => k.call(this, f)), this;
      D.call(this, S);
      const i = {
        ...S,
        type: (0, c.getJSONTypes)(S.type),
        schemaType: (0, c.getJSONTypes)(S.schemaType)
      };
      return (0, d.eachItem)($, i.type.length === 0 ? (f) => k.call(this, f, i) : (f) => i.type.forEach((E) => k.call(this, f, i, E))), this;
    }
    getKeyword(p) {
      const S = this.RULES.all[p];
      return typeof S == "object" ? S.definition : !!S;
    }
    // Remove keyword
    removeKeyword(p) {
      const { RULES: S } = this;
      delete S.keywords[p], delete S.all[p];
      for (const $ of S.rules) {
        const i = $.rules.findIndex((f) => f.keyword === p);
        i >= 0 && $.rules.splice(i, 1);
      }
      return this;
    }
    // Add format
    addFormat(p, S) {
      return typeof S == "string" && (S = new RegExp(S)), this.formats[p] = S, this;
    }
    errorsText(p = this.errors, { separator: S = ", ", dataVar: $ = "data" } = {}) {
      return !p || p.length === 0 ? "No errors" : p.map((i) => `${$}${i.instancePath} ${i.message}`).reduce((i, f) => i + S + f);
    }
    $dataMetaSchema(p, S) {
      const $ = this.RULES.all;
      p = JSON.parse(JSON.stringify(p));
      for (const i of S) {
        const f = i.split("/").slice(1);
        let E = p;
        for (const I of f)
          E = E[I];
        for (const I in $) {
          const j = $[I];
          if (typeof j != "object")
            continue;
          const { $data: F } = j.definition, L = E[I];
          F && L && (E[I] = M(L));
        }
      }
      return p;
    }
    _removeAllSchemas(p, S) {
      for (const $ in p) {
        const i = p[$];
        (!S || S.test($)) && (typeof i == "string" ? delete p[$] : i && !i.meta && (this._cache.delete(i.schema), delete p[$]));
      }
    }
    _addSchema(p, S, $, i = this.opts.validateSchema, f = this.opts.addUsedSchema) {
      let E;
      const { schemaId: I } = this.opts;
      if (typeof p == "object")
        E = p[I];
      else {
        if (this.opts.jtd)
          throw new Error("schema must be object");
        if (typeof p != "boolean")
          throw new Error("schema must be object or boolean");
      }
      let j = this._cache.get(p);
      if (j !== void 0)
        return j;
      $ = (0, l.normalizeId)(E || $);
      const F = l.getSchemaRefs.call(this, p, $);
      return j = new o.SchemaEnv({ schema: p, schemaId: I, meta: S, baseId: $, localRefs: F }), this._cache.set(j.schema, j), f && !$.startsWith("#") && ($ && this._checkUnique($), this.refs[$] = j), i && this.validateSchema(p, !0), j;
    }
    _checkUnique(p) {
      if (this.schemas[p] || this.refs[p])
        throw new Error(`schema with key or id "${p}" already exists`);
    }
    _compileSchemaEnv(p) {
      if (p.meta ? this._compileMetaSchema(p) : o.compileSchema.call(this, p), !p.validate)
        throw new Error("ajv implementation error");
      return p.validate;
    }
    _compileMetaSchema(p) {
      const S = this.opts;
      this.opts = this._metaOpts;
      try {
        o.compileSchema.call(this, p);
      } finally {
        this.opts = S;
      }
    }
  }
  R.ValidationError = n.default, R.MissingRefError = s.default, e.default = R;
  function O(P, p, S, $ = "error") {
    for (const i in P) {
      const f = i;
      f in p && this.logger[$](`${S}: option ${i}. ${P[f]}`);
    }
  }
  function G(P) {
    return P = (0, l.normalizeId)(P), this.schemas[P] || this.refs[P];
  }
  function B() {
    const P = this.opts.schemas;
    if (P)
      if (Array.isArray(P))
        this.addSchema(P);
      else
        for (const p in P)
          this.addSchema(P[p], p);
  }
  function le() {
    for (const P in this.opts.formats) {
      const p = this.opts.formats[P];
      p && this.addFormat(P, p);
    }
  }
  function fe(P) {
    if (Array.isArray(P)) {
      this.addVocabulary(P);
      return;
    }
    this.logger.warn("keywords option as map is deprecated, pass array");
    for (const p in P) {
      const S = P[p];
      S.keyword || (S.keyword = p), this.addKeyword(S);
    }
  }
  function pe() {
    const P = { ...this.opts };
    for (const p of y)
      delete P[p];
    return P;
  }
  const z = { log() {
  }, warn() {
  }, error() {
  } };
  function H(P) {
    if (P === !1)
      return z;
    if (P === void 0)
      return console;
    if (P.log && P.warn && P.error)
      return P;
    throw new Error("logger must implement log, warn and error methods");
  }
  const se = /^[a-z_$][a-z0-9_$:-]*$/i;
  function T(P, p) {
    const { RULES: S } = this;
    if ((0, d.eachItem)(P, ($) => {
      if (S.keywords[$])
        throw new Error(`Keyword ${$} is already defined`);
      if (!se.test($))
        throw new Error(`Keyword ${$} has invalid name`);
    }), !!p && p.$data && !("code" in p || "validate" in p))
      throw new Error('$data keyword must have "code" or "validate" function');
  }
  function k(P, p, S) {
    var $;
    const i = p == null ? void 0 : p.post;
    if (S && i)
      throw new Error('keyword with "post" flag cannot have "type"');
    const { RULES: f } = this;
    let E = i ? f.post : f.rules.find(({ type: j }) => j === S);
    if (E || (E = { type: S, rules: [] }, f.rules.push(E)), f.keywords[P] = !0, !p)
      return;
    const I = {
      keyword: P,
      definition: {
        ...p,
        type: (0, c.getJSONTypes)(p.type),
        schemaType: (0, c.getJSONTypes)(p.schemaType)
      }
    };
    p.before ? V.call(this, E, I, p.before) : E.rules.push(I), f.all[P] = I, ($ = p.implements) === null || $ === void 0 || $.forEach((j) => this.addKeyword(j));
  }
  function V(P, p, S) {
    const $ = P.rules.findIndex((i) => i.keyword === S);
    $ >= 0 ? P.rules.splice($, 0, p) : (P.rules.push(p), this.logger.warn(`rule ${S} is not defined`));
  }
  function D(P) {
    let { metaSchema: p } = P;
    p !== void 0 && (P.$data && this.opts.$data && (p = M(p)), P.validateSchema = this.compile(p, !0));
  }
  const K = {
    $ref: "https://raw.githubusercontent.com/ajv-validator/ajv/master/lib/refs/data.json#"
  };
  function M(P) {
    return { anyOf: [P, K] };
  }
})(Fl);
var _o = {}, go = {}, vo = {};
Object.defineProperty(vo, "__esModule", { value: !0 });
const sg = {
  keyword: "id",
  code() {
    throw new Error('NOT SUPPORTED: keyword "id", use "$id" for schema ID');
  }
};
vo.default = sg;
var tr = {};
Object.defineProperty(tr, "__esModule", { value: !0 });
tr.callRef = tr.getValidate = void 0;
const ag = Pr, Wi = te, Ae = x, ar = st, Yi = Ce, yn = C, og = {
  keyword: "$ref",
  schemaType: "string",
  code(e) {
    const { gen: t, schema: r, it: n } = e, { baseId: s, schemaEnv: a, validateName: o, opts: u, self: l } = n, { root: c } = a;
    if ((r === "#" || r === "#/") && s === c.baseId)
      return h();
    const d = Yi.resolveRef.call(l, c, s, r);
    if (d === void 0)
      throw new ag.default(n.opts.uriResolver, s, r);
    if (d instanceof Yi.SchemaEnv)
      return b(d);
    return g(d);
    function h() {
      if (a === c)
        return An(e, o, a, a.$async);
      const y = t.scopeValue("root", { ref: c });
      return An(e, (0, Ae._)`${y}.validate`, c, c.$async);
    }
    function b(y) {
      const w = _u(e, y);
      An(e, w, y, y.$async);
    }
    function g(y) {
      const w = t.scopeValue("schema", u.code.source === !0 ? { ref: y, code: (0, Ae.stringify)(y) } : { ref: y }), _ = t.name("valid"), m = e.subschema({
        schema: y,
        dataTypes: [],
        schemaPath: Ae.nil,
        topSchemaRef: w,
        errSchemaPath: r
      }, _);
      e.mergeEvaluated(m), e.ok(_);
    }
  }
};
function _u(e, t) {
  const { gen: r } = e;
  return t.validate ? r.scopeValue("validate", { ref: t.validate }) : (0, Ae._)`${r.scopeValue("wrapper", { ref: t })}.validate`;
}
tr.getValidate = _u;
function An(e, t, r, n) {
  const { gen: s, it: a } = e, { allErrors: o, schemaEnv: u, opts: l } = a, c = l.passContext ? ar.default.this : Ae.nil;
  n ? d() : h();
  function d() {
    if (!u.$async)
      throw new Error("async schema referenced by sync schema");
    const y = s.let("valid");
    s.try(() => {
      s.code((0, Ae._)`await ${(0, Wi.callValidateCode)(e, t, c)}`), g(t), o || s.assign(y, !0);
    }, (w) => {
      s.if((0, Ae._)`!(${w} instanceof ${a.ValidationError})`, () => s.throw(w)), b(w), o || s.assign(y, !1);
    }), e.ok(y);
  }
  function h() {
    e.result((0, Wi.callValidateCode)(e, t, c), () => g(t), () => b(t));
  }
  function b(y) {
    const w = (0, Ae._)`${y}.errors`;
    s.assign(ar.default.vErrors, (0, Ae._)`${ar.default.vErrors} === null ? ${w} : ${ar.default.vErrors}.concat(${w})`), s.assign(ar.default.errors, (0, Ae._)`${ar.default.vErrors}.length`);
  }
  function g(y) {
    var w;
    if (!a.opts.unevaluated)
      return;
    const _ = (w = r == null ? void 0 : r.validate) === null || w === void 0 ? void 0 : w.evaluated;
    if (a.props !== !0)
      if (_ && !_.dynamicProps)
        _.props !== void 0 && (a.props = yn.mergeEvaluated.props(s, _.props, a.props));
      else {
        const m = s.var("props", (0, Ae._)`${y}.evaluated.props`);
        a.props = yn.mergeEvaluated.props(s, m, a.props, Ae.Name);
      }
    if (a.items !== !0)
      if (_ && !_.dynamicItems)
        _.items !== void 0 && (a.items = yn.mergeEvaluated.items(s, _.items, a.items));
      else {
        const m = s.var("items", (0, Ae._)`${y}.evaluated.items`);
        a.items = yn.mergeEvaluated.items(s, m, a.items, Ae.Name);
      }
  }
}
tr.callRef = An;
tr.default = og;
Object.defineProperty(go, "__esModule", { value: !0 });
const ig = vo, cg = tr, lg = [
  "$schema",
  "$id",
  "$defs",
  "$vocabulary",
  { keyword: "$comment" },
  "definitions",
  ig.default,
  cg.default
];
go.default = lg;
var wo = {}, Eo = {};
Object.defineProperty(Eo, "__esModule", { value: !0 });
const Gn = x, vt = Gn.operators, Kn = {
  maximum: { okStr: "<=", ok: vt.LTE, fail: vt.GT },
  minimum: { okStr: ">=", ok: vt.GTE, fail: vt.LT },
  exclusiveMaximum: { okStr: "<", ok: vt.LT, fail: vt.GTE },
  exclusiveMinimum: { okStr: ">", ok: vt.GT, fail: vt.LTE }
}, ug = {
  message: ({ keyword: e, schemaCode: t }) => (0, Gn.str)`must be ${Kn[e].okStr} ${t}`,
  params: ({ keyword: e, schemaCode: t }) => (0, Gn._)`{comparison: ${Kn[e].okStr}, limit: ${t}}`
}, dg = {
  keyword: Object.keys(Kn),
  type: "number",
  schemaType: "number",
  $data: !0,
  error: ug,
  code(e) {
    const { keyword: t, data: r, schemaCode: n } = e;
    e.fail$data((0, Gn._)`${r} ${Kn[t].fail} ${n} || isNaN(${r})`);
  }
};
Eo.default = dg;
var bo = {};
Object.defineProperty(bo, "__esModule", { value: !0 });
const Yr = x, fg = {
  message: ({ schemaCode: e }) => (0, Yr.str)`must be multiple of ${e}`,
  params: ({ schemaCode: e }) => (0, Yr._)`{multipleOf: ${e}}`
}, hg = {
  keyword: "multipleOf",
  type: "number",
  schemaType: "number",
  $data: !0,
  error: fg,
  code(e) {
    const { gen: t, data: r, schemaCode: n, it: s } = e, a = s.opts.multipleOfPrecision, o = t.let("res"), u = a ? (0, Yr._)`Math.abs(Math.round(${o}) - ${o}) > 1e-${a}` : (0, Yr._)`${o} !== parseInt(${o})`;
    e.fail$data((0, Yr._)`(${n} === 0 || (${o} = ${r}/${n}, ${u}))`);
  }
};
bo.default = hg;
var So = {}, Po = {};
Object.defineProperty(Po, "__esModule", { value: !0 });
function gu(e) {
  const t = e.length;
  let r = 0, n = 0, s;
  for (; n < t; )
    r++, s = e.charCodeAt(n++), s >= 55296 && s <= 56319 && n < t && (s = e.charCodeAt(n), (s & 64512) === 56320 && n++);
  return r;
}
Po.default = gu;
gu.code = 'require("ajv/dist/runtime/ucs2length").default';
Object.defineProperty(So, "__esModule", { value: !0 });
const Yt = x, mg = C, pg = Po, $g = {
  message({ keyword: e, schemaCode: t }) {
    const r = e === "maxLength" ? "more" : "fewer";
    return (0, Yt.str)`must NOT have ${r} than ${t} characters`;
  },
  params: ({ schemaCode: e }) => (0, Yt._)`{limit: ${e}}`
}, yg = {
  keyword: ["maxLength", "minLength"],
  type: "string",
  schemaType: "number",
  $data: !0,
  error: $g,
  code(e) {
    const { keyword: t, data: r, schemaCode: n, it: s } = e, a = t === "maxLength" ? Yt.operators.GT : Yt.operators.LT, o = s.opts.unicode === !1 ? (0, Yt._)`${r}.length` : (0, Yt._)`${(0, mg.useFunc)(e.gen, pg.default)}(${r})`;
    e.fail$data((0, Yt._)`${o} ${a} ${n}`);
  }
};
So.default = yg;
var No = {};
Object.defineProperty(No, "__esModule", { value: !0 });
const _g = te, Hn = x, gg = {
  message: ({ schemaCode: e }) => (0, Hn.str)`must match pattern "${e}"`,
  params: ({ schemaCode: e }) => (0, Hn._)`{pattern: ${e}}`
}, vg = {
  keyword: "pattern",
  type: "string",
  schemaType: "string",
  $data: !0,
  error: gg,
  code(e) {
    const { data: t, $data: r, schema: n, schemaCode: s, it: a } = e, o = a.opts.unicodeRegExp ? "u" : "", u = r ? (0, Hn._)`(new RegExp(${s}, ${o}))` : (0, _g.usePattern)(e, n);
    e.fail$data((0, Hn._)`!${u}.test(${t})`);
  }
};
No.default = vg;
var Ro = {};
Object.defineProperty(Ro, "__esModule", { value: !0 });
const Qr = x, wg = {
  message({ keyword: e, schemaCode: t }) {
    const r = e === "maxProperties" ? "more" : "fewer";
    return (0, Qr.str)`must NOT have ${r} than ${t} properties`;
  },
  params: ({ schemaCode: e }) => (0, Qr._)`{limit: ${e}}`
}, Eg = {
  keyword: ["maxProperties", "minProperties"],
  type: "object",
  schemaType: "number",
  $data: !0,
  error: wg,
  code(e) {
    const { keyword: t, data: r, schemaCode: n } = e, s = t === "maxProperties" ? Qr.operators.GT : Qr.operators.LT;
    e.fail$data((0, Qr._)`Object.keys(${r}).length ${s} ${n}`);
  }
};
Ro.default = Eg;
var Oo = {};
Object.defineProperty(Oo, "__esModule", { value: !0 });
const Lr = te, Zr = x, bg = C, Sg = {
  message: ({ params: { missingProperty: e } }) => (0, Zr.str)`must have required property '${e}'`,
  params: ({ params: { missingProperty: e } }) => (0, Zr._)`{missingProperty: ${e}}`
}, Pg = {
  keyword: "required",
  type: "object",
  schemaType: "array",
  $data: !0,
  error: Sg,
  code(e) {
    const { gen: t, schema: r, schemaCode: n, data: s, $data: a, it: o } = e, { opts: u } = o;
    if (!a && r.length === 0)
      return;
    const l = r.length >= u.loopRequired;
    if (o.allErrors ? c() : d(), u.strictRequired) {
      const g = e.parentSchema.properties, { definedProperties: y } = e.it;
      for (const w of r)
        if ((g == null ? void 0 : g[w]) === void 0 && !y.has(w)) {
          const _ = o.schemaEnv.baseId + o.errSchemaPath, m = `required property "${w}" is not defined at "${_}" (strictRequired)`;
          (0, bg.checkStrictMode)(o, m, o.opts.strictRequired);
        }
    }
    function c() {
      if (l || a)
        e.block$data(Zr.nil, h);
      else
        for (const g of r)
          (0, Lr.checkReportMissingProp)(e, g);
    }
    function d() {
      const g = t.let("missing");
      if (l || a) {
        const y = t.let("valid", !0);
        e.block$data(y, () => b(g, y)), e.ok(y);
      } else
        t.if((0, Lr.checkMissingProp)(e, r, g)), (0, Lr.reportMissingProp)(e, g), t.else();
    }
    function h() {
      t.forOf("prop", n, (g) => {
        e.setParams({ missingProperty: g }), t.if((0, Lr.noPropertyInData)(t, s, g, u.ownProperties), () => e.error());
      });
    }
    function b(g, y) {
      e.setParams({ missingProperty: g }), t.forOf(g, n, () => {
        t.assign(y, (0, Lr.propertyInData)(t, s, g, u.ownProperties)), t.if((0, Zr.not)(y), () => {
          e.error(), t.break();
        });
      }, Zr.nil);
    }
  }
};
Oo.default = Pg;
var Io = {};
Object.defineProperty(Io, "__esModule", { value: !0 });
const xr = x, Ng = {
  message({ keyword: e, schemaCode: t }) {
    const r = e === "maxItems" ? "more" : "fewer";
    return (0, xr.str)`must NOT have ${r} than ${t} items`;
  },
  params: ({ schemaCode: e }) => (0, xr._)`{limit: ${e}}`
}, Rg = {
  keyword: ["maxItems", "minItems"],
  type: "array",
  schemaType: "number",
  $data: !0,
  error: Ng,
  code(e) {
    const { keyword: t, data: r, schemaCode: n } = e, s = t === "maxItems" ? xr.operators.GT : xr.operators.LT;
    e.fail$data((0, xr._)`${r}.length ${s} ${n}`);
  }
};
Io.default = Rg;
var To = {}, ln = {};
Object.defineProperty(ln, "__esModule", { value: !0 });
const vu = Yn;
vu.code = 'require("ajv/dist/runtime/equal").default';
ln.default = vu;
Object.defineProperty(To, "__esModule", { value: !0 });
const Ps = ye, ve = x, Og = C, Ig = ln, Tg = {
  message: ({ params: { i: e, j: t } }) => (0, ve.str)`must NOT have duplicate items (items ## ${t} and ${e} are identical)`,
  params: ({ params: { i: e, j: t } }) => (0, ve._)`{i: ${e}, j: ${t}}`
}, jg = {
  keyword: "uniqueItems",
  type: "array",
  schemaType: "boolean",
  $data: !0,
  error: Tg,
  code(e) {
    const { gen: t, data: r, $data: n, schema: s, parentSchema: a, schemaCode: o, it: u } = e;
    if (!n && !s)
      return;
    const l = t.let("valid"), c = a.items ? (0, Ps.getSchemaTypes)(a.items) : [];
    e.block$data(l, d, (0, ve._)`${o} === false`), e.ok(l);
    function d() {
      const y = t.let("i", (0, ve._)`${r}.length`), w = t.let("j");
      e.setParams({ i: y, j: w }), t.assign(l, !0), t.if((0, ve._)`${y} > 1`, () => (h() ? b : g)(y, w));
    }
    function h() {
      return c.length > 0 && !c.some((y) => y === "object" || y === "array");
    }
    function b(y, w) {
      const _ = t.name("item"), m = (0, Ps.checkDataTypes)(c, _, u.opts.strictNumbers, Ps.DataType.Wrong), v = t.const("indices", (0, ve._)`{}`);
      t.for((0, ve._)`;${y}--;`, () => {
        t.let(_, (0, ve._)`${r}[${y}]`), t.if(m, (0, ve._)`continue`), c.length > 1 && t.if((0, ve._)`typeof ${_} == "string"`, (0, ve._)`${_} += "_"`), t.if((0, ve._)`typeof ${v}[${_}] == "number"`, () => {
          t.assign(w, (0, ve._)`${v}[${_}]`), e.error(), t.assign(l, !1).break();
        }).code((0, ve._)`${v}[${_}] = ${y}`);
      });
    }
    function g(y, w) {
      const _ = (0, Og.useFunc)(t, Ig.default), m = t.name("outer");
      t.label(m).for((0, ve._)`;${y}--;`, () => t.for((0, ve._)`${w} = ${y}; ${w}--;`, () => t.if((0, ve._)`${_}(${r}[${y}], ${r}[${w}])`, () => {
        e.error(), t.assign(l, !1).break(m);
      })));
    }
  }
};
To.default = jg;
var jo = {};
Object.defineProperty(jo, "__esModule", { value: !0 });
const Ws = x, kg = C, Ag = ln, Cg = {
  message: "must be equal to constant",
  params: ({ schemaCode: e }) => (0, Ws._)`{allowedValue: ${e}}`
}, Dg = {
  keyword: "const",
  $data: !0,
  error: Cg,
  code(e) {
    const { gen: t, data: r, $data: n, schemaCode: s, schema: a } = e;
    n || a && typeof a == "object" ? e.fail$data((0, Ws._)`!${(0, kg.useFunc)(t, Ag.default)}(${r}, ${s})`) : e.fail((0, Ws._)`${a} !== ${r}`);
  }
};
jo.default = Dg;
var ko = {};
Object.defineProperty(ko, "__esModule", { value: !0 });
const qr = x, Mg = C, Vg = ln, Lg = {
  message: "must be equal to one of the allowed values",
  params: ({ schemaCode: e }) => (0, qr._)`{allowedValues: ${e}}`
}, Fg = {
  keyword: "enum",
  schemaType: "array",
  $data: !0,
  error: Lg,
  code(e) {
    const { gen: t, data: r, $data: n, schema: s, schemaCode: a, it: o } = e;
    if (!n && s.length === 0)
      throw new Error("enum must have non-empty array");
    const u = s.length >= o.opts.loopEnum;
    let l;
    const c = () => l ?? (l = (0, Mg.useFunc)(t, Vg.default));
    let d;
    if (u || n)
      d = t.let("valid"), e.block$data(d, h);
    else {
      if (!Array.isArray(s))
        throw new Error("ajv implementation error");
      const g = t.const("vSchema", a);
      d = (0, qr.or)(...s.map((y, w) => b(g, w)));
    }
    e.pass(d);
    function h() {
      t.assign(d, !1), t.forOf("v", a, (g) => t.if((0, qr._)`${c()}(${r}, ${g})`, () => t.assign(d, !0).break()));
    }
    function b(g, y) {
      const w = s[y];
      return typeof w == "object" && w !== null ? (0, qr._)`${c()}(${r}, ${g}[${y}])` : (0, qr._)`${r} === ${w}`;
    }
  }
};
ko.default = Fg;
Object.defineProperty(wo, "__esModule", { value: !0 });
const zg = Eo, Ug = bo, qg = So, Gg = No, Kg = Ro, Hg = Oo, Jg = Io, Xg = To, Bg = jo, Wg = ko, Yg = [
  // number
  zg.default,
  Ug.default,
  // string
  qg.default,
  Gg.default,
  // object
  Kg.default,
  Hg.default,
  // array
  Jg.default,
  Xg.default,
  // any
  { keyword: "type", schemaType: ["string", "array"] },
  { keyword: "nullable", schemaType: "boolean" },
  Bg.default,
  Wg.default
];
wo.default = Yg;
var Ao = {}, Nr = {};
Object.defineProperty(Nr, "__esModule", { value: !0 });
Nr.validateAdditionalItems = void 0;
const Qt = x, Ys = C, Qg = {
  message: ({ params: { len: e } }) => (0, Qt.str)`must NOT have more than ${e} items`,
  params: ({ params: { len: e } }) => (0, Qt._)`{limit: ${e}}`
}, Zg = {
  keyword: "additionalItems",
  type: "array",
  schemaType: ["boolean", "object"],
  before: "uniqueItems",
  error: Qg,
  code(e) {
    const { parentSchema: t, it: r } = e, { items: n } = t;
    if (!Array.isArray(n)) {
      (0, Ys.checkStrictMode)(r, '"additionalItems" is ignored when "items" is not an array of schemas');
      return;
    }
    wu(e, n);
  }
};
function wu(e, t) {
  const { gen: r, schema: n, data: s, keyword: a, it: o } = e;
  o.items = !0;
  const u = r.const("len", (0, Qt._)`${s}.length`);
  if (n === !1)
    e.setParams({ len: t.length }), e.pass((0, Qt._)`${u} <= ${t.length}`);
  else if (typeof n == "object" && !(0, Ys.alwaysValidSchema)(o, n)) {
    const c = r.var("valid", (0, Qt._)`${u} <= ${t.length}`);
    r.if((0, Qt.not)(c), () => l(c)), e.ok(c);
  }
  function l(c) {
    r.forRange("i", t.length, u, (d) => {
      e.subschema({ keyword: a, dataProp: d, dataPropType: Ys.Type.Num }, c), o.allErrors || r.if((0, Qt.not)(c), () => r.break());
    });
  }
}
Nr.validateAdditionalItems = wu;
Nr.default = Zg;
var Co = {}, Rr = {};
Object.defineProperty(Rr, "__esModule", { value: !0 });
Rr.validateTuple = void 0;
const Qi = x, Cn = C, xg = te, ev = {
  keyword: "items",
  type: "array",
  schemaType: ["object", "array", "boolean"],
  before: "uniqueItems",
  code(e) {
    const { schema: t, it: r } = e;
    if (Array.isArray(t))
      return Eu(e, "additionalItems", t);
    r.items = !0, !(0, Cn.alwaysValidSchema)(r, t) && e.ok((0, xg.validateArray)(e));
  }
};
function Eu(e, t, r = e.schema) {
  const { gen: n, parentSchema: s, data: a, keyword: o, it: u } = e;
  d(s), u.opts.unevaluated && r.length && u.items !== !0 && (u.items = Cn.mergeEvaluated.items(n, r.length, u.items));
  const l = n.name("valid"), c = n.const("len", (0, Qi._)`${a}.length`);
  r.forEach((h, b) => {
    (0, Cn.alwaysValidSchema)(u, h) || (n.if((0, Qi._)`${c} > ${b}`, () => e.subschema({
      keyword: o,
      schemaProp: b,
      dataProp: b
    }, l)), e.ok(l));
  });
  function d(h) {
    const { opts: b, errSchemaPath: g } = u, y = r.length, w = y === h.minItems && (y === h.maxItems || h[t] === !1);
    if (b.strictTuples && !w) {
      const _ = `"${o}" is ${y}-tuple, but minItems or maxItems/${t} are not specified or different at path "${g}"`;
      (0, Cn.checkStrictMode)(u, _, b.strictTuples);
    }
  }
}
Rr.validateTuple = Eu;
Rr.default = ev;
Object.defineProperty(Co, "__esModule", { value: !0 });
const tv = Rr, rv = {
  keyword: "prefixItems",
  type: "array",
  schemaType: ["array"],
  before: "uniqueItems",
  code: (e) => (0, tv.validateTuple)(e, "items")
};
Co.default = rv;
var Do = {};
Object.defineProperty(Do, "__esModule", { value: !0 });
const Zi = x, nv = C, sv = te, av = Nr, ov = {
  message: ({ params: { len: e } }) => (0, Zi.str)`must NOT have more than ${e} items`,
  params: ({ params: { len: e } }) => (0, Zi._)`{limit: ${e}}`
}, iv = {
  keyword: "items",
  type: "array",
  schemaType: ["object", "boolean"],
  before: "uniqueItems",
  error: ov,
  code(e) {
    const { schema: t, parentSchema: r, it: n } = e, { prefixItems: s } = r;
    n.items = !0, !(0, nv.alwaysValidSchema)(n, t) && (s ? (0, av.validateAdditionalItems)(e, s) : e.ok((0, sv.validateArray)(e)));
  }
};
Do.default = iv;
var Mo = {};
Object.defineProperty(Mo, "__esModule", { value: !0 });
const ze = x, _n = C, cv = {
  message: ({ params: { min: e, max: t } }) => t === void 0 ? (0, ze.str)`must contain at least ${e} valid item(s)` : (0, ze.str)`must contain at least ${e} and no more than ${t} valid item(s)`,
  params: ({ params: { min: e, max: t } }) => t === void 0 ? (0, ze._)`{minContains: ${e}}` : (0, ze._)`{minContains: ${e}, maxContains: ${t}}`
}, lv = {
  keyword: "contains",
  type: "array",
  schemaType: ["object", "boolean"],
  before: "uniqueItems",
  trackErrors: !0,
  error: cv,
  code(e) {
    const { gen: t, schema: r, parentSchema: n, data: s, it: a } = e;
    let o, u;
    const { minContains: l, maxContains: c } = n;
    a.opts.next ? (o = l === void 0 ? 1 : l, u = c) : o = 1;
    const d = t.const("len", (0, ze._)`${s}.length`);
    if (e.setParams({ min: o, max: u }), u === void 0 && o === 0) {
      (0, _n.checkStrictMode)(a, '"minContains" == 0 without "maxContains": "contains" keyword ignored');
      return;
    }
    if (u !== void 0 && o > u) {
      (0, _n.checkStrictMode)(a, '"minContains" > "maxContains" is always invalid'), e.fail();
      return;
    }
    if ((0, _n.alwaysValidSchema)(a, r)) {
      let w = (0, ze._)`${d} >= ${o}`;
      u !== void 0 && (w = (0, ze._)`${w} && ${d} <= ${u}`), e.pass(w);
      return;
    }
    a.items = !0;
    const h = t.name("valid");
    u === void 0 && o === 1 ? g(h, () => t.if(h, () => t.break())) : o === 0 ? (t.let(h, !0), u !== void 0 && t.if((0, ze._)`${s}.length > 0`, b)) : (t.let(h, !1), b()), e.result(h, () => e.reset());
    function b() {
      const w = t.name("_valid"), _ = t.let("count", 0);
      g(w, () => t.if(w, () => y(_)));
    }
    function g(w, _) {
      t.forRange("i", 0, d, (m) => {
        e.subschema({
          keyword: "contains",
          dataProp: m,
          dataPropType: _n.Type.Num,
          compositeRule: !0
        }, w), _();
      });
    }
    function y(w) {
      t.code((0, ze._)`${w}++`), u === void 0 ? t.if((0, ze._)`${w} >= ${o}`, () => t.assign(h, !0).break()) : (t.if((0, ze._)`${w} > ${u}`, () => t.assign(h, !1).break()), o === 1 ? t.assign(h, !0) : t.if((0, ze._)`${w} >= ${o}`, () => t.assign(h, !0)));
    }
  }
};
Mo.default = lv;
var bu = {};
(function(e) {
  Object.defineProperty(e, "__esModule", { value: !0 }), e.validateSchemaDeps = e.validatePropertyDeps = e.error = void 0;
  const t = x, r = C, n = te;
  e.error = {
    message: ({ params: { property: l, depsCount: c, deps: d } }) => {
      const h = c === 1 ? "property" : "properties";
      return (0, t.str)`must have ${h} ${d} when property ${l} is present`;
    },
    params: ({ params: { property: l, depsCount: c, deps: d, missingProperty: h } }) => (0, t._)`{property: ${l},
    missingProperty: ${h},
    depsCount: ${c},
    deps: ${d}}`
    // TODO change to reference
  };
  const s = {
    keyword: "dependencies",
    type: "object",
    schemaType: "object",
    error: e.error,
    code(l) {
      const [c, d] = a(l);
      o(l, c), u(l, d);
    }
  };
  function a({ schema: l }) {
    const c = {}, d = {};
    for (const h in l) {
      if (h === "__proto__")
        continue;
      const b = Array.isArray(l[h]) ? c : d;
      b[h] = l[h];
    }
    return [c, d];
  }
  function o(l, c = l.schema) {
    const { gen: d, data: h, it: b } = l;
    if (Object.keys(c).length === 0)
      return;
    const g = d.let("missing");
    for (const y in c) {
      const w = c[y];
      if (w.length === 0)
        continue;
      const _ = (0, n.propertyInData)(d, h, y, b.opts.ownProperties);
      l.setParams({
        property: y,
        depsCount: w.length,
        deps: w.join(", ")
      }), b.allErrors ? d.if(_, () => {
        for (const m of w)
          (0, n.checkReportMissingProp)(l, m);
      }) : (d.if((0, t._)`${_} && (${(0, n.checkMissingProp)(l, w, g)})`), (0, n.reportMissingProp)(l, g), d.else());
    }
  }
  e.validatePropertyDeps = o;
  function u(l, c = l.schema) {
    const { gen: d, data: h, keyword: b, it: g } = l, y = d.name("valid");
    for (const w in c)
      (0, r.alwaysValidSchema)(g, c[w]) || (d.if(
        (0, n.propertyInData)(d, h, w, g.opts.ownProperties),
        () => {
          const _ = l.subschema({ keyword: b, schemaProp: w }, y);
          l.mergeValidEvaluated(_, y);
        },
        () => d.var(y, !0)
        // TODO var
      ), l.ok(y));
  }
  e.validateSchemaDeps = u, e.default = s;
})(bu);
var Vo = {};
Object.defineProperty(Vo, "__esModule", { value: !0 });
const Su = x, uv = C, dv = {
  message: "property name must be valid",
  params: ({ params: e }) => (0, Su._)`{propertyName: ${e.propertyName}}`
}, fv = {
  keyword: "propertyNames",
  type: "object",
  schemaType: ["object", "boolean"],
  error: dv,
  code(e) {
    const { gen: t, schema: r, data: n, it: s } = e;
    if ((0, uv.alwaysValidSchema)(s, r))
      return;
    const a = t.name("valid");
    t.forIn("key", n, (o) => {
      e.setParams({ propertyName: o }), e.subschema({
        keyword: "propertyNames",
        data: o,
        dataTypes: ["string"],
        propertyName: o,
        compositeRule: !0
      }, a), t.if((0, Su.not)(a), () => {
        e.error(!0), s.allErrors || t.break();
      });
    }), e.ok(a);
  }
};
Vo.default = fv;
var os = {};
Object.defineProperty(os, "__esModule", { value: !0 });
const gn = te, He = x, hv = st, vn = C, mv = {
  message: "must NOT have additional properties",
  params: ({ params: e }) => (0, He._)`{additionalProperty: ${e.additionalProperty}}`
}, pv = {
  keyword: "additionalProperties",
  type: ["object"],
  schemaType: ["boolean", "object"],
  allowUndefined: !0,
  trackErrors: !0,
  error: mv,
  code(e) {
    const { gen: t, schema: r, parentSchema: n, data: s, errsCount: a, it: o } = e;
    if (!a)
      throw new Error("ajv implementation error");
    const { allErrors: u, opts: l } = o;
    if (o.props = !0, l.removeAdditional !== "all" && (0, vn.alwaysValidSchema)(o, r))
      return;
    const c = (0, gn.allSchemaProperties)(n.properties), d = (0, gn.allSchemaProperties)(n.patternProperties);
    h(), e.ok((0, He._)`${a} === ${hv.default.errors}`);
    function h() {
      t.forIn("key", s, (_) => {
        !c.length && !d.length ? y(_) : t.if(b(_), () => y(_));
      });
    }
    function b(_) {
      let m;
      if (c.length > 8) {
        const v = (0, vn.schemaRefOrVal)(o, n.properties, "properties");
        m = (0, gn.isOwnProperty)(t, v, _);
      } else c.length ? m = (0, He.or)(...c.map((v) => (0, He._)`${_} === ${v}`)) : m = He.nil;
      return d.length && (m = (0, He.or)(m, ...d.map((v) => (0, He._)`${(0, gn.usePattern)(e, v)}.test(${_})`))), (0, He.not)(m);
    }
    function g(_) {
      t.code((0, He._)`delete ${s}[${_}]`);
    }
    function y(_) {
      if (l.removeAdditional === "all" || l.removeAdditional && r === !1) {
        g(_);
        return;
      }
      if (r === !1) {
        e.setParams({ additionalProperty: _ }), e.error(), u || t.break();
        return;
      }
      if (typeof r == "object" && !(0, vn.alwaysValidSchema)(o, r)) {
        const m = t.name("valid");
        l.removeAdditional === "failing" ? (w(_, m, !1), t.if((0, He.not)(m), () => {
          e.reset(), g(_);
        })) : (w(_, m), u || t.if((0, He.not)(m), () => t.break()));
      }
    }
    function w(_, m, v) {
      const N = {
        keyword: "additionalProperties",
        dataProp: _,
        dataPropType: vn.Type.Str
      };
      v === !1 && Object.assign(N, {
        compositeRule: !0,
        createErrors: !1,
        allErrors: !1
      }), e.subschema(N, m);
    }
  }
};
os.default = pv;
var Lo = {};
Object.defineProperty(Lo, "__esModule", { value: !0 });
const $v = We, xi = te, Ns = C, ec = os, yv = {
  keyword: "properties",
  type: "object",
  schemaType: "object",
  code(e) {
    const { gen: t, schema: r, parentSchema: n, data: s, it: a } = e;
    a.opts.removeAdditional === "all" && n.additionalProperties === void 0 && ec.default.code(new $v.KeywordCxt(a, ec.default, "additionalProperties"));
    const o = (0, xi.allSchemaProperties)(r);
    for (const h of o)
      a.definedProperties.add(h);
    a.opts.unevaluated && o.length && a.props !== !0 && (a.props = Ns.mergeEvaluated.props(t, (0, Ns.toHash)(o), a.props));
    const u = o.filter((h) => !(0, Ns.alwaysValidSchema)(a, r[h]));
    if (u.length === 0)
      return;
    const l = t.name("valid");
    for (const h of u)
      c(h) ? d(h) : (t.if((0, xi.propertyInData)(t, s, h, a.opts.ownProperties)), d(h), a.allErrors || t.else().var(l, !0), t.endIf()), e.it.definedProperties.add(h), e.ok(l);
    function c(h) {
      return a.opts.useDefaults && !a.compositeRule && r[h].default !== void 0;
    }
    function d(h) {
      e.subschema({
        keyword: "properties",
        schemaProp: h,
        dataProp: h
      }, l);
    }
  }
};
Lo.default = yv;
var Fo = {};
Object.defineProperty(Fo, "__esModule", { value: !0 });
const tc = te, wn = x, rc = C, nc = C, _v = {
  keyword: "patternProperties",
  type: "object",
  schemaType: "object",
  code(e) {
    const { gen: t, schema: r, data: n, parentSchema: s, it: a } = e, { opts: o } = a, u = (0, tc.allSchemaProperties)(r), l = u.filter((w) => (0, rc.alwaysValidSchema)(a, r[w]));
    if (u.length === 0 || l.length === u.length && (!a.opts.unevaluated || a.props === !0))
      return;
    const c = o.strictSchema && !o.allowMatchingProperties && s.properties, d = t.name("valid");
    a.props !== !0 && !(a.props instanceof wn.Name) && (a.props = (0, nc.evaluatedPropsToName)(t, a.props));
    const { props: h } = a;
    b();
    function b() {
      for (const w of u)
        c && g(w), a.allErrors ? y(w) : (t.var(d, !0), y(w), t.if(d));
    }
    function g(w) {
      for (const _ in c)
        new RegExp(w).test(_) && (0, rc.checkStrictMode)(a, `property ${_} matches pattern ${w} (use allowMatchingProperties)`);
    }
    function y(w) {
      t.forIn("key", n, (_) => {
        t.if((0, wn._)`${(0, tc.usePattern)(e, w)}.test(${_})`, () => {
          const m = l.includes(w);
          m || e.subschema({
            keyword: "patternProperties",
            schemaProp: w,
            dataProp: _,
            dataPropType: nc.Type.Str
          }, d), a.opts.unevaluated && h !== !0 ? t.assign((0, wn._)`${h}[${_}]`, !0) : !m && !a.allErrors && t.if((0, wn.not)(d), () => t.break());
        });
      });
    }
  }
};
Fo.default = _v;
var zo = {};
Object.defineProperty(zo, "__esModule", { value: !0 });
const gv = C, vv = {
  keyword: "not",
  schemaType: ["object", "boolean"],
  trackErrors: !0,
  code(e) {
    const { gen: t, schema: r, it: n } = e;
    if ((0, gv.alwaysValidSchema)(n, r)) {
      e.fail();
      return;
    }
    const s = t.name("valid");
    e.subschema({
      keyword: "not",
      compositeRule: !0,
      createErrors: !1,
      allErrors: !1
    }, s), e.failResult(s, () => e.reset(), () => e.error());
  },
  error: { message: "must NOT be valid" }
};
zo.default = vv;
var Uo = {};
Object.defineProperty(Uo, "__esModule", { value: !0 });
const wv = te, Ev = {
  keyword: "anyOf",
  schemaType: "array",
  trackErrors: !0,
  code: wv.validateUnion,
  error: { message: "must match a schema in anyOf" }
};
Uo.default = Ev;
var qo = {};
Object.defineProperty(qo, "__esModule", { value: !0 });
const Dn = x, bv = C, Sv = {
  message: "must match exactly one schema in oneOf",
  params: ({ params: e }) => (0, Dn._)`{passingSchemas: ${e.passing}}`
}, Pv = {
  keyword: "oneOf",
  schemaType: "array",
  trackErrors: !0,
  error: Sv,
  code(e) {
    const { gen: t, schema: r, parentSchema: n, it: s } = e;
    if (!Array.isArray(r))
      throw new Error("ajv implementation error");
    if (s.opts.discriminator && n.discriminator)
      return;
    const a = r, o = t.let("valid", !1), u = t.let("passing", null), l = t.name("_valid");
    e.setParams({ passing: u }), t.block(c), e.result(o, () => e.reset(), () => e.error(!0));
    function c() {
      a.forEach((d, h) => {
        let b;
        (0, bv.alwaysValidSchema)(s, d) ? t.var(l, !0) : b = e.subschema({
          keyword: "oneOf",
          schemaProp: h,
          compositeRule: !0
        }, l), h > 0 && t.if((0, Dn._)`${l} && ${o}`).assign(o, !1).assign(u, (0, Dn._)`[${u}, ${h}]`).else(), t.if(l, () => {
          t.assign(o, !0), t.assign(u, h), b && e.mergeEvaluated(b, Dn.Name);
        });
      });
    }
  }
};
qo.default = Pv;
var Go = {};
Object.defineProperty(Go, "__esModule", { value: !0 });
const Nv = C, Rv = {
  keyword: "allOf",
  schemaType: "array",
  code(e) {
    const { gen: t, schema: r, it: n } = e;
    if (!Array.isArray(r))
      throw new Error("ajv implementation error");
    const s = t.name("valid");
    r.forEach((a, o) => {
      if ((0, Nv.alwaysValidSchema)(n, a))
        return;
      const u = e.subschema({ keyword: "allOf", schemaProp: o }, s);
      e.ok(s), e.mergeEvaluated(u);
    });
  }
};
Go.default = Rv;
var Ko = {};
Object.defineProperty(Ko, "__esModule", { value: !0 });
const Jn = x, Pu = C, Ov = {
  message: ({ params: e }) => (0, Jn.str)`must match "${e.ifClause}" schema`,
  params: ({ params: e }) => (0, Jn._)`{failingKeyword: ${e.ifClause}}`
}, Iv = {
  keyword: "if",
  schemaType: ["object", "boolean"],
  trackErrors: !0,
  error: Ov,
  code(e) {
    const { gen: t, parentSchema: r, it: n } = e;
    r.then === void 0 && r.else === void 0 && (0, Pu.checkStrictMode)(n, '"if" without "then" and "else" is ignored');
    const s = sc(n, "then"), a = sc(n, "else");
    if (!s && !a)
      return;
    const o = t.let("valid", !0), u = t.name("_valid");
    if (l(), e.reset(), s && a) {
      const d = t.let("ifClause");
      e.setParams({ ifClause: d }), t.if(u, c("then", d), c("else", d));
    } else s ? t.if(u, c("then")) : t.if((0, Jn.not)(u), c("else"));
    e.pass(o, () => e.error(!0));
    function l() {
      const d = e.subschema({
        keyword: "if",
        compositeRule: !0,
        createErrors: !1,
        allErrors: !1
      }, u);
      e.mergeEvaluated(d);
    }
    function c(d, h) {
      return () => {
        const b = e.subschema({ keyword: d }, u);
        t.assign(o, u), e.mergeValidEvaluated(b, o), h ? t.assign(h, (0, Jn._)`${d}`) : e.setParams({ ifClause: d });
      };
    }
  }
};
function sc(e, t) {
  const r = e.schema[t];
  return r !== void 0 && !(0, Pu.alwaysValidSchema)(e, r);
}
Ko.default = Iv;
var Ho = {};
Object.defineProperty(Ho, "__esModule", { value: !0 });
const Tv = C, jv = {
  keyword: ["then", "else"],
  schemaType: ["object", "boolean"],
  code({ keyword: e, parentSchema: t, it: r }) {
    t.if === void 0 && (0, Tv.checkStrictMode)(r, `"${e}" without "if" is ignored`);
  }
};
Ho.default = jv;
Object.defineProperty(Ao, "__esModule", { value: !0 });
const kv = Nr, Av = Co, Cv = Rr, Dv = Do, Mv = Mo, Vv = bu, Lv = Vo, Fv = os, zv = Lo, Uv = Fo, qv = zo, Gv = Uo, Kv = qo, Hv = Go, Jv = Ko, Xv = Ho;
function Bv(e = !1) {
  const t = [
    // any
    qv.default,
    Gv.default,
    Kv.default,
    Hv.default,
    Jv.default,
    Xv.default,
    // object
    Lv.default,
    Fv.default,
    Vv.default,
    zv.default,
    Uv.default
  ];
  return e ? t.push(Av.default, Dv.default) : t.push(kv.default, Cv.default), t.push(Mv.default), t;
}
Ao.default = Bv;
var Jo = {}, Xo = {};
Object.defineProperty(Xo, "__esModule", { value: !0 });
const me = x, Wv = {
  message: ({ schemaCode: e }) => (0, me.str)`must match format "${e}"`,
  params: ({ schemaCode: e }) => (0, me._)`{format: ${e}}`
}, Yv = {
  keyword: "format",
  type: ["number", "string"],
  schemaType: "string",
  $data: !0,
  error: Wv,
  code(e, t) {
    const { gen: r, data: n, $data: s, schema: a, schemaCode: o, it: u } = e, { opts: l, errSchemaPath: c, schemaEnv: d, self: h } = u;
    if (!l.validateFormats)
      return;
    s ? b() : g();
    function b() {
      const y = r.scopeValue("formats", {
        ref: h.formats,
        code: l.code.formats
      }), w = r.const("fDef", (0, me._)`${y}[${o}]`), _ = r.let("fType"), m = r.let("format");
      r.if((0, me._)`typeof ${w} == "object" && !(${w} instanceof RegExp)`, () => r.assign(_, (0, me._)`${w}.type || "string"`).assign(m, (0, me._)`${w}.validate`), () => r.assign(_, (0, me._)`"string"`).assign(m, w)), e.fail$data((0, me.or)(v(), N()));
      function v() {
        return l.strictSchema === !1 ? me.nil : (0, me._)`${o} && !${m}`;
      }
      function N() {
        const R = d.$async ? (0, me._)`(${w}.async ? await ${m}(${n}) : ${m}(${n}))` : (0, me._)`${m}(${n})`, O = (0, me._)`(typeof ${m} == "function" ? ${R} : ${m}.test(${n}))`;
        return (0, me._)`${m} && ${m} !== true && ${_} === ${t} && !${O}`;
      }
    }
    function g() {
      const y = h.formats[a];
      if (!y) {
        v();
        return;
      }
      if (y === !0)
        return;
      const [w, _, m] = N(y);
      w === t && e.pass(R());
      function v() {
        if (l.strictSchema === !1) {
          h.logger.warn(O());
          return;
        }
        throw new Error(O());
        function O() {
          return `unknown format "${a}" ignored in schema at path "${c}"`;
        }
      }
      function N(O) {
        const G = O instanceof RegExp ? (0, me.regexpCode)(O) : l.code.formats ? (0, me._)`${l.code.formats}${(0, me.getProperty)(a)}` : void 0, B = r.scopeValue("formats", { key: a, ref: O, code: G });
        return typeof O == "object" && !(O instanceof RegExp) ? [O.type || "string", O.validate, (0, me._)`${B}.validate`] : ["string", O, B];
      }
      function R() {
        if (typeof y == "object" && !(y instanceof RegExp) && y.async) {
          if (!d.$async)
            throw new Error("async format in sync schema");
          return (0, me._)`await ${m}(${n})`;
        }
        return typeof _ == "function" ? (0, me._)`${m}(${n})` : (0, me._)`${m}.test(${n})`;
      }
    }
  }
};
Xo.default = Yv;
Object.defineProperty(Jo, "__esModule", { value: !0 });
const Qv = Xo, Zv = [Qv.default];
Jo.default = Zv;
var gr = {};
Object.defineProperty(gr, "__esModule", { value: !0 });
gr.contentVocabulary = gr.metadataVocabulary = void 0;
gr.metadataVocabulary = [
  "title",
  "description",
  "default",
  "deprecated",
  "readOnly",
  "writeOnly",
  "examples"
];
gr.contentVocabulary = [
  "contentMediaType",
  "contentEncoding",
  "contentSchema"
];
Object.defineProperty(_o, "__esModule", { value: !0 });
const xv = go, ew = wo, tw = Ao, rw = Jo, ac = gr, nw = [
  xv.default,
  ew.default,
  (0, tw.default)(),
  rw.default,
  ac.metadataVocabulary,
  ac.contentVocabulary
];
_o.default = nw;
var Bo = {}, is = {};
Object.defineProperty(is, "__esModule", { value: !0 });
is.DiscrError = void 0;
var oc;
(function(e) {
  e.Tag = "tag", e.Mapping = "mapping";
})(oc || (is.DiscrError = oc = {}));
Object.defineProperty(Bo, "__esModule", { value: !0 });
const ur = x, Qs = is, ic = Ce, sw = Pr, aw = C, ow = {
  message: ({ params: { discrError: e, tagName: t } }) => e === Qs.DiscrError.Tag ? `tag "${t}" must be string` : `value of tag "${t}" must be in oneOf`,
  params: ({ params: { discrError: e, tag: t, tagName: r } }) => (0, ur._)`{error: ${e}, tag: ${r}, tagValue: ${t}}`
}, iw = {
  keyword: "discriminator",
  type: "object",
  schemaType: "object",
  error: ow,
  code(e) {
    const { gen: t, data: r, schema: n, parentSchema: s, it: a } = e, { oneOf: o } = s;
    if (!a.opts.discriminator)
      throw new Error("discriminator: requires discriminator option");
    const u = n.propertyName;
    if (typeof u != "string")
      throw new Error("discriminator: requires propertyName");
    if (n.mapping)
      throw new Error("discriminator: mapping is not supported");
    if (!o)
      throw new Error("discriminator: requires oneOf keyword");
    const l = t.let("valid", !1), c = t.const("tag", (0, ur._)`${r}${(0, ur.getProperty)(u)}`);
    t.if((0, ur._)`typeof ${c} == "string"`, () => d(), () => e.error(!1, { discrError: Qs.DiscrError.Tag, tag: c, tagName: u })), e.ok(l);
    function d() {
      const g = b();
      t.if(!1);
      for (const y in g)
        t.elseIf((0, ur._)`${c} === ${y}`), t.assign(l, h(g[y]));
      t.else(), e.error(!1, { discrError: Qs.DiscrError.Mapping, tag: c, tagName: u }), t.endIf();
    }
    function h(g) {
      const y = t.name("valid"), w = e.subschema({ keyword: "oneOf", schemaProp: g }, y);
      return e.mergeEvaluated(w, ur.Name), y;
    }
    function b() {
      var g;
      const y = {}, w = m(s);
      let _ = !0;
      for (let R = 0; R < o.length; R++) {
        let O = o[R];
        if (O != null && O.$ref && !(0, aw.schemaHasRulesButRef)(O, a.self.RULES)) {
          const B = O.$ref;
          if (O = ic.resolveRef.call(a.self, a.schemaEnv.root, a.baseId, B), O instanceof ic.SchemaEnv && (O = O.schema), O === void 0)
            throw new sw.default(a.opts.uriResolver, a.baseId, B);
        }
        const G = (g = O == null ? void 0 : O.properties) === null || g === void 0 ? void 0 : g[u];
        if (typeof G != "object")
          throw new Error(`discriminator: oneOf subschemas (or referenced schemas) must have "properties/${u}"`);
        _ = _ && (w || m(O)), v(G, R);
      }
      if (!_)
        throw new Error(`discriminator: "${u}" must be required`);
      return y;
      function m({ required: R }) {
        return Array.isArray(R) && R.includes(u);
      }
      function v(R, O) {
        if (R.const)
          N(R.const, O);
        else if (R.enum)
          for (const G of R.enum)
            N(G, O);
        else
          throw new Error(`discriminator: "properties/${u}" must have "const" or "enum"`);
      }
      function N(R, O) {
        if (typeof R != "string" || R in y)
          throw new Error(`discriminator: "${u}" values must be unique strings`);
        y[R] = O;
      }
    }
  }
};
Bo.default = iw;
const cw = "http://json-schema.org/draft-07/schema#", lw = "http://json-schema.org/draft-07/schema#", uw = "Core schema meta-schema", dw = {
  schemaArray: {
    type: "array",
    minItems: 1,
    items: {
      $ref: "#"
    }
  },
  nonNegativeInteger: {
    type: "integer",
    minimum: 0
  },
  nonNegativeIntegerDefault0: {
    allOf: [
      {
        $ref: "#/definitions/nonNegativeInteger"
      },
      {
        default: 0
      }
    ]
  },
  simpleTypes: {
    enum: [
      "array",
      "boolean",
      "integer",
      "null",
      "number",
      "object",
      "string"
    ]
  },
  stringArray: {
    type: "array",
    items: {
      type: "string"
    },
    uniqueItems: !0,
    default: []
  }
}, fw = [
  "object",
  "boolean"
], hw = {
  $id: {
    type: "string",
    format: "uri-reference"
  },
  $schema: {
    type: "string",
    format: "uri"
  },
  $ref: {
    type: "string",
    format: "uri-reference"
  },
  $comment: {
    type: "string"
  },
  title: {
    type: "string"
  },
  description: {
    type: "string"
  },
  default: !0,
  readOnly: {
    type: "boolean",
    default: !1
  },
  examples: {
    type: "array",
    items: !0
  },
  multipleOf: {
    type: "number",
    exclusiveMinimum: 0
  },
  maximum: {
    type: "number"
  },
  exclusiveMaximum: {
    type: "number"
  },
  minimum: {
    type: "number"
  },
  exclusiveMinimum: {
    type: "number"
  },
  maxLength: {
    $ref: "#/definitions/nonNegativeInteger"
  },
  minLength: {
    $ref: "#/definitions/nonNegativeIntegerDefault0"
  },
  pattern: {
    type: "string",
    format: "regex"
  },
  additionalItems: {
    $ref: "#"
  },
  items: {
    anyOf: [
      {
        $ref: "#"
      },
      {
        $ref: "#/definitions/schemaArray"
      }
    ],
    default: !0
  },
  maxItems: {
    $ref: "#/definitions/nonNegativeInteger"
  },
  minItems: {
    $ref: "#/definitions/nonNegativeIntegerDefault0"
  },
  uniqueItems: {
    type: "boolean",
    default: !1
  },
  contains: {
    $ref: "#"
  },
  maxProperties: {
    $ref: "#/definitions/nonNegativeInteger"
  },
  minProperties: {
    $ref: "#/definitions/nonNegativeIntegerDefault0"
  },
  required: {
    $ref: "#/definitions/stringArray"
  },
  additionalProperties: {
    $ref: "#"
  },
  definitions: {
    type: "object",
    additionalProperties: {
      $ref: "#"
    },
    default: {}
  },
  properties: {
    type: "object",
    additionalProperties: {
      $ref: "#"
    },
    default: {}
  },
  patternProperties: {
    type: "object",
    additionalProperties: {
      $ref: "#"
    },
    propertyNames: {
      format: "regex"
    },
    default: {}
  },
  dependencies: {
    type: "object",
    additionalProperties: {
      anyOf: [
        {
          $ref: "#"
        },
        {
          $ref: "#/definitions/stringArray"
        }
      ]
    }
  },
  propertyNames: {
    $ref: "#"
  },
  const: !0,
  enum: {
    type: "array",
    items: !0,
    minItems: 1,
    uniqueItems: !0
  },
  type: {
    anyOf: [
      {
        $ref: "#/definitions/simpleTypes"
      },
      {
        type: "array",
        items: {
          $ref: "#/definitions/simpleTypes"
        },
        minItems: 1,
        uniqueItems: !0
      }
    ]
  },
  format: {
    type: "string"
  },
  contentMediaType: {
    type: "string"
  },
  contentEncoding: {
    type: "string"
  },
  if: {
    $ref: "#"
  },
  then: {
    $ref: "#"
  },
  else: {
    $ref: "#"
  },
  allOf: {
    $ref: "#/definitions/schemaArray"
  },
  anyOf: {
    $ref: "#/definitions/schemaArray"
  },
  oneOf: {
    $ref: "#/definitions/schemaArray"
  },
  not: {
    $ref: "#"
  }
}, mw = {
  $schema: cw,
  $id: lw,
  title: uw,
  definitions: dw,
  type: fw,
  properties: hw,
  default: !0
};
(function(e, t) {
  Object.defineProperty(t, "__esModule", { value: !0 }), t.MissingRefError = t.ValidationError = t.CodeGen = t.Name = t.nil = t.stringify = t.str = t._ = t.KeywordCxt = t.Ajv = void 0;
  const r = Fl, n = _o, s = Bo, a = mw, o = ["/properties"], u = "http://json-schema.org/draft-07/schema";
  class l extends r.default {
    _addVocabularies() {
      super._addVocabularies(), n.default.forEach((y) => this.addVocabulary(y)), this.opts.discriminator && this.addKeyword(s.default);
    }
    _addDefaultMetaSchema() {
      if (super._addDefaultMetaSchema(), !this.opts.meta)
        return;
      const y = this.opts.$data ? this.$dataMetaSchema(a, o) : a;
      this.addMetaSchema(y, u, !1), this.refs["http://json-schema.org/schema"] = u;
    }
    defaultMeta() {
      return this.opts.defaultMeta = super.defaultMeta() || (this.getSchema(u) ? u : void 0);
    }
  }
  t.Ajv = l, e.exports = t = l, e.exports.Ajv = l, Object.defineProperty(t, "__esModule", { value: !0 }), t.default = l;
  var c = We;
  Object.defineProperty(t, "KeywordCxt", { enumerable: !0, get: function() {
    return c.KeywordCxt;
  } });
  var d = x;
  Object.defineProperty(t, "_", { enumerable: !0, get: function() {
    return d._;
  } }), Object.defineProperty(t, "str", { enumerable: !0, get: function() {
    return d.str;
  } }), Object.defineProperty(t, "stringify", { enumerable: !0, get: function() {
    return d.stringify;
  } }), Object.defineProperty(t, "nil", { enumerable: !0, get: function() {
    return d.nil;
  } }), Object.defineProperty(t, "Name", { enumerable: !0, get: function() {
    return d.Name;
  } }), Object.defineProperty(t, "CodeGen", { enumerable: !0, get: function() {
    return d.CodeGen;
  } });
  var h = cn;
  Object.defineProperty(t, "ValidationError", { enumerable: !0, get: function() {
    return h.default;
  } });
  var b = Pr;
  Object.defineProperty(t, "MissingRefError", { enumerable: !0, get: function() {
    return b.default;
  } });
})(Ks, Ks.exports);
var pw = Ks.exports;
(function(e) {
  Object.defineProperty(e, "__esModule", { value: !0 }), e.formatLimitDefinition = void 0;
  const t = pw, r = x, n = r.operators, s = {
    formatMaximum: { okStr: "<=", ok: n.LTE, fail: n.GT },
    formatMinimum: { okStr: ">=", ok: n.GTE, fail: n.LT },
    formatExclusiveMaximum: { okStr: "<", ok: n.LT, fail: n.GTE },
    formatExclusiveMinimum: { okStr: ">", ok: n.GT, fail: n.LTE }
  }, a = {
    message: ({ keyword: u, schemaCode: l }) => (0, r.str)`should be ${s[u].okStr} ${l}`,
    params: ({ keyword: u, schemaCode: l }) => (0, r._)`{comparison: ${s[u].okStr}, limit: ${l}}`
  };
  e.formatLimitDefinition = {
    keyword: Object.keys(s),
    type: "string",
    schemaType: "string",
    $data: !0,
    error: a,
    code(u) {
      const { gen: l, data: c, schemaCode: d, keyword: h, it: b } = u, { opts: g, self: y } = b;
      if (!g.validateFormats)
        return;
      const w = new t.KeywordCxt(b, y.RULES.all.format.definition, "format");
      w.$data ? _() : m();
      function _() {
        const N = l.scopeValue("formats", {
          ref: y.formats,
          code: g.code.formats
        }), R = l.const("fmt", (0, r._)`${N}[${w.schemaCode}]`);
        u.fail$data((0, r.or)((0, r._)`typeof ${R} != "object"`, (0, r._)`${R} instanceof RegExp`, (0, r._)`typeof ${R}.compare != "function"`, v(R)));
      }
      function m() {
        const N = w.schema, R = y.formats[N];
        if (!R || R === !0)
          return;
        if (typeof R != "object" || R instanceof RegExp || typeof R.compare != "function")
          throw new Error(`"${h}": format "${N}" does not define "compare" function`);
        const O = l.scopeValue("formats", {
          key: N,
          ref: R,
          code: g.code.formats ? (0, r._)`${g.code.formats}${(0, r.getProperty)(N)}` : void 0
        });
        u.fail$data(v(O));
      }
      function v(N) {
        return (0, r._)`${N}.compare(${c}, ${d}) ${s[h].fail} 0`;
      }
    },
    dependencies: ["format"]
  };
  const o = (u) => (u.addKeyword(e.formatLimitDefinition), u);
  e.default = o;
})(Ll);
(function(e, t) {
  Object.defineProperty(t, "__esModule", { value: !0 });
  const r = Vl, n = Ll, s = x, a = new s.Name("fullFormats"), o = new s.Name("fastFormats"), u = (c, d = { keywords: !0 }) => {
    if (Array.isArray(d))
      return l(c, d, r.fullFormats, a), c;
    const [h, b] = d.mode === "fast" ? [r.fastFormats, o] : [r.fullFormats, a], g = d.formats || r.formatNames;
    return l(c, g, h, b), d.keywords && (0, n.default)(c), c;
  };
  u.get = (c, d = "full") => {
    const b = (d === "fast" ? r.fastFormats : r.fullFormats)[c];
    if (!b)
      throw new Error(`Unknown format "${c}"`);
    return b;
  };
  function l(c, d, h, b) {
    var g, y;
    (g = (y = c.opts.code).formats) !== null && g !== void 0 || (y.formats = (0, s._)`require("ajv-formats/dist/formats").${b}`);
    for (const w of d)
      c.addFormat(w, h[w]);
  }
  e.exports = t = u, Object.defineProperty(t, "__esModule", { value: !0 }), t.default = u;
})(Gs, Gs.exports);
var $w = Gs.exports;
const yw = /* @__PURE__ */ Fc($w), _w = (e, t, r, n) => {
  if (r === "length" || r === "prototype" || r === "arguments" || r === "caller")
    return;
  const s = Object.getOwnPropertyDescriptor(e, r), a = Object.getOwnPropertyDescriptor(t, r);
  !gw(s, a) && n || Object.defineProperty(e, r, a);
}, gw = function(e, t) {
  return e === void 0 || e.configurable || e.writable === t.writable && e.enumerable === t.enumerable && e.configurable === t.configurable && (e.writable || e.value === t.value);
}, vw = (e, t) => {
  const r = Object.getPrototypeOf(t);
  r !== Object.getPrototypeOf(e) && Object.setPrototypeOf(e, r);
}, ww = (e, t) => `/* Wrapped ${e}*/
${t}`, Ew = Object.getOwnPropertyDescriptor(Function.prototype, "toString"), bw = Object.getOwnPropertyDescriptor(Function.prototype.toString, "name"), Sw = (e, t, r) => {
  const n = r === "" ? "" : `with ${r.trim()}() `, s = ww.bind(null, n, t.toString());
  Object.defineProperty(s, "name", bw);
  const { writable: a, enumerable: o, configurable: u } = Ew;
  Object.defineProperty(e, "toString", { value: s, writable: a, enumerable: o, configurable: u });
};
function Pw(e, t, { ignoreNonConfigurable: r = !1 } = {}) {
  const { name: n } = e;
  for (const s of Reflect.ownKeys(t))
    _w(e, t, s, r);
  return vw(e, t), Sw(e, t, n), e;
}
const cc = (e, t = {}) => {
  if (typeof e != "function")
    throw new TypeError(`Expected the first argument to be a function, got \`${typeof e}\``);
  const {
    wait: r = 0,
    maxWait: n = Number.POSITIVE_INFINITY,
    before: s = !1,
    after: a = !0
  } = t;
  if (r < 0 || n < 0)
    throw new RangeError("`wait` and `maxWait` must not be negative.");
  if (!s && !a)
    throw new Error("Both `before` and `after` are false, function wouldn't be called.");
  let o, u, l;
  const c = function(...d) {
    const h = this, b = () => {
      o = void 0, u && (clearTimeout(u), u = void 0), a && (l = e.apply(h, d));
    }, g = () => {
      u = void 0, o && (clearTimeout(o), o = void 0), a && (l = e.apply(h, d));
    }, y = s && !o;
    return clearTimeout(o), o = setTimeout(b, r), n > 0 && n !== Number.POSITIVE_INFINITY && !u && (u = setTimeout(g, n)), y && (l = e.apply(h, d)), l;
  };
  return Pw(c, e), c.cancel = () => {
    o && (clearTimeout(o), o = void 0), u && (clearTimeout(u), u = void 0);
  }, c;
};
var Zs = { exports: {} };
const Nw = "2.0.0", Nu = 256, Rw = Number.MAX_SAFE_INTEGER || /* istanbul ignore next */
9007199254740991, Ow = 16, Iw = Nu - 6, Tw = [
  "major",
  "premajor",
  "minor",
  "preminor",
  "patch",
  "prepatch",
  "prerelease"
];
var cs = {
  MAX_LENGTH: Nu,
  MAX_SAFE_COMPONENT_LENGTH: Ow,
  MAX_SAFE_BUILD_LENGTH: Iw,
  MAX_SAFE_INTEGER: Rw,
  RELEASE_TYPES: Tw,
  SEMVER_SPEC_VERSION: Nw,
  FLAG_INCLUDE_PRERELEASE: 1,
  FLAG_LOOSE: 2
};
const jw = typeof process == "object" && process.env && process.env.NODE_DEBUG && /\bsemver\b/i.test(process.env.NODE_DEBUG) ? (...e) => console.error("SEMVER", ...e) : () => {
};
var ls = jw;
(function(e, t) {
  const {
    MAX_SAFE_COMPONENT_LENGTH: r,
    MAX_SAFE_BUILD_LENGTH: n,
    MAX_LENGTH: s
  } = cs, a = ls;
  t = e.exports = {};
  const o = t.re = [], u = t.safeRe = [], l = t.src = [], c = t.t = {};
  let d = 0;
  const h = "[a-zA-Z0-9-]", b = [
    ["\\s", 1],
    ["\\d", s],
    [h, n]
  ], g = (w) => {
    for (const [_, m] of b)
      w = w.split(`${_}*`).join(`${_}{0,${m}}`).split(`${_}+`).join(`${_}{1,${m}}`);
    return w;
  }, y = (w, _, m) => {
    const v = g(_), N = d++;
    a(w, N, _), c[w] = N, l[N] = _, o[N] = new RegExp(_, m ? "g" : void 0), u[N] = new RegExp(v, m ? "g" : void 0);
  };
  y("NUMERICIDENTIFIER", "0|[1-9]\\d*"), y("NUMERICIDENTIFIERLOOSE", "\\d+"), y("NONNUMERICIDENTIFIER", `\\d*[a-zA-Z-]${h}*`), y("MAINVERSION", `(${l[c.NUMERICIDENTIFIER]})\\.(${l[c.NUMERICIDENTIFIER]})\\.(${l[c.NUMERICIDENTIFIER]})`), y("MAINVERSIONLOOSE", `(${l[c.NUMERICIDENTIFIERLOOSE]})\\.(${l[c.NUMERICIDENTIFIERLOOSE]})\\.(${l[c.NUMERICIDENTIFIERLOOSE]})`), y("PRERELEASEIDENTIFIER", `(?:${l[c.NUMERICIDENTIFIER]}|${l[c.NONNUMERICIDENTIFIER]})`), y("PRERELEASEIDENTIFIERLOOSE", `(?:${l[c.NUMERICIDENTIFIERLOOSE]}|${l[c.NONNUMERICIDENTIFIER]})`), y("PRERELEASE", `(?:-(${l[c.PRERELEASEIDENTIFIER]}(?:\\.${l[c.PRERELEASEIDENTIFIER]})*))`), y("PRERELEASELOOSE", `(?:-?(${l[c.PRERELEASEIDENTIFIERLOOSE]}(?:\\.${l[c.PRERELEASEIDENTIFIERLOOSE]})*))`), y("BUILDIDENTIFIER", `${h}+`), y("BUILD", `(?:\\+(${l[c.BUILDIDENTIFIER]}(?:\\.${l[c.BUILDIDENTIFIER]})*))`), y("FULLPLAIN", `v?${l[c.MAINVERSION]}${l[c.PRERELEASE]}?${l[c.BUILD]}?`), y("FULL", `^${l[c.FULLPLAIN]}$`), y("LOOSEPLAIN", `[v=\\s]*${l[c.MAINVERSIONLOOSE]}${l[c.PRERELEASELOOSE]}?${l[c.BUILD]}?`), y("LOOSE", `^${l[c.LOOSEPLAIN]}$`), y("GTLT", "((?:<|>)?=?)"), y("XRANGEIDENTIFIERLOOSE", `${l[c.NUMERICIDENTIFIERLOOSE]}|x|X|\\*`), y("XRANGEIDENTIFIER", `${l[c.NUMERICIDENTIFIER]}|x|X|\\*`), y("XRANGEPLAIN", `[v=\\s]*(${l[c.XRANGEIDENTIFIER]})(?:\\.(${l[c.XRANGEIDENTIFIER]})(?:\\.(${l[c.XRANGEIDENTIFIER]})(?:${l[c.PRERELEASE]})?${l[c.BUILD]}?)?)?`), y("XRANGEPLAINLOOSE", `[v=\\s]*(${l[c.XRANGEIDENTIFIERLOOSE]})(?:\\.(${l[c.XRANGEIDENTIFIERLOOSE]})(?:\\.(${l[c.XRANGEIDENTIFIERLOOSE]})(?:${l[c.PRERELEASELOOSE]})?${l[c.BUILD]}?)?)?`), y("XRANGE", `^${l[c.GTLT]}\\s*${l[c.XRANGEPLAIN]}$`), y("XRANGELOOSE", `^${l[c.GTLT]}\\s*${l[c.XRANGEPLAINLOOSE]}$`), y("COERCEPLAIN", `(^|[^\\d])(\\d{1,${r}})(?:\\.(\\d{1,${r}}))?(?:\\.(\\d{1,${r}}))?`), y("COERCE", `${l[c.COERCEPLAIN]}(?:$|[^\\d])`), y("COERCEFULL", l[c.COERCEPLAIN] + `(?:${l[c.PRERELEASE]})?(?:${l[c.BUILD]})?(?:$|[^\\d])`), y("COERCERTL", l[c.COERCE], !0), y("COERCERTLFULL", l[c.COERCEFULL], !0), y("LONETILDE", "(?:~>?)"), y("TILDETRIM", `(\\s*)${l[c.LONETILDE]}\\s+`, !0), t.tildeTrimReplace = "$1~", y("TILDE", `^${l[c.LONETILDE]}${l[c.XRANGEPLAIN]}$`), y("TILDELOOSE", `^${l[c.LONETILDE]}${l[c.XRANGEPLAINLOOSE]}$`), y("LONECARET", "(?:\\^)"), y("CARETTRIM", `(\\s*)${l[c.LONECARET]}\\s+`, !0), t.caretTrimReplace = "$1^", y("CARET", `^${l[c.LONECARET]}${l[c.XRANGEPLAIN]}$`), y("CARETLOOSE", `^${l[c.LONECARET]}${l[c.XRANGEPLAINLOOSE]}$`), y("COMPARATORLOOSE", `^${l[c.GTLT]}\\s*(${l[c.LOOSEPLAIN]})$|^$`), y("COMPARATOR", `^${l[c.GTLT]}\\s*(${l[c.FULLPLAIN]})$|^$`), y("COMPARATORTRIM", `(\\s*)${l[c.GTLT]}\\s*(${l[c.LOOSEPLAIN]}|${l[c.XRANGEPLAIN]})`, !0), t.comparatorTrimReplace = "$1$2$3", y("HYPHENRANGE", `^\\s*(${l[c.XRANGEPLAIN]})\\s+-\\s+(${l[c.XRANGEPLAIN]})\\s*$`), y("HYPHENRANGELOOSE", `^\\s*(${l[c.XRANGEPLAINLOOSE]})\\s+-\\s+(${l[c.XRANGEPLAINLOOSE]})\\s*$`), y("STAR", "(<|>)?=?\\s*\\*"), y("GTE0", "^\\s*>=\\s*0\\.0\\.0\\s*$"), y("GTE0PRE", "^\\s*>=\\s*0\\.0\\.0-0\\s*$");
})(Zs, Zs.exports);
var un = Zs.exports;
const kw = Object.freeze({ loose: !0 }), Aw = Object.freeze({}), Cw = (e) => e ? typeof e != "object" ? kw : e : Aw;
var Wo = Cw;
const lc = /^[0-9]+$/, Ru = (e, t) => {
  const r = lc.test(e), n = lc.test(t);
  return r && n && (e = +e, t = +t), e === t ? 0 : r && !n ? -1 : n && !r ? 1 : e < t ? -1 : 1;
}, Dw = (e, t) => Ru(t, e);
var Ou = {
  compareIdentifiers: Ru,
  rcompareIdentifiers: Dw
};
const En = ls, { MAX_LENGTH: uc, MAX_SAFE_INTEGER: bn } = cs, { safeRe: dc, t: fc } = un, Mw = Wo, { compareIdentifiers: or } = Ou;
let Vw = class Ze {
  constructor(t, r) {
    if (r = Mw(r), t instanceof Ze) {
      if (t.loose === !!r.loose && t.includePrerelease === !!r.includePrerelease)
        return t;
      t = t.version;
    } else if (typeof t != "string")
      throw new TypeError(`Invalid version. Must be a string. Got type "${typeof t}".`);
    if (t.length > uc)
      throw new TypeError(
        `version is longer than ${uc} characters`
      );
    En("SemVer", t, r), this.options = r, this.loose = !!r.loose, this.includePrerelease = !!r.includePrerelease;
    const n = t.trim().match(r.loose ? dc[fc.LOOSE] : dc[fc.FULL]);
    if (!n)
      throw new TypeError(`Invalid Version: ${t}`);
    if (this.raw = t, this.major = +n[1], this.minor = +n[2], this.patch = +n[3], this.major > bn || this.major < 0)
      throw new TypeError("Invalid major version");
    if (this.minor > bn || this.minor < 0)
      throw new TypeError("Invalid minor version");
    if (this.patch > bn || this.patch < 0)
      throw new TypeError("Invalid patch version");
    n[4] ? this.prerelease = n[4].split(".").map((s) => {
      if (/^[0-9]+$/.test(s)) {
        const a = +s;
        if (a >= 0 && a < bn)
          return a;
      }
      return s;
    }) : this.prerelease = [], this.build = n[5] ? n[5].split(".") : [], this.format();
  }
  format() {
    return this.version = `${this.major}.${this.minor}.${this.patch}`, this.prerelease.length && (this.version += `-${this.prerelease.join(".")}`), this.version;
  }
  toString() {
    return this.version;
  }
  compare(t) {
    if (En("SemVer.compare", this.version, this.options, t), !(t instanceof Ze)) {
      if (typeof t == "string" && t === this.version)
        return 0;
      t = new Ze(t, this.options);
    }
    return t.version === this.version ? 0 : this.compareMain(t) || this.comparePre(t);
  }
  compareMain(t) {
    return t instanceof Ze || (t = new Ze(t, this.options)), or(this.major, t.major) || or(this.minor, t.minor) || or(this.patch, t.patch);
  }
  comparePre(t) {
    if (t instanceof Ze || (t = new Ze(t, this.options)), this.prerelease.length && !t.prerelease.length)
      return -1;
    if (!this.prerelease.length && t.prerelease.length)
      return 1;
    if (!this.prerelease.length && !t.prerelease.length)
      return 0;
    let r = 0;
    do {
      const n = this.prerelease[r], s = t.prerelease[r];
      if (En("prerelease compare", r, n, s), n === void 0 && s === void 0)
        return 0;
      if (s === void 0)
        return 1;
      if (n === void 0)
        return -1;
      if (n === s)
        continue;
      return or(n, s);
    } while (++r);
  }
  compareBuild(t) {
    t instanceof Ze || (t = new Ze(t, this.options));
    let r = 0;
    do {
      const n = this.build[r], s = t.build[r];
      if (En("build compare", r, n, s), n === void 0 && s === void 0)
        return 0;
      if (s === void 0)
        return 1;
      if (n === void 0)
        return -1;
      if (n === s)
        continue;
      return or(n, s);
    } while (++r);
  }
  // preminor will bump the version up to the next minor release, and immediately
  // down to pre-release. premajor and prepatch work the same way.
  inc(t, r, n) {
    switch (t) {
      case "premajor":
        this.prerelease.length = 0, this.patch = 0, this.minor = 0, this.major++, this.inc("pre", r, n);
        break;
      case "preminor":
        this.prerelease.length = 0, this.patch = 0, this.minor++, this.inc("pre", r, n);
        break;
      case "prepatch":
        this.prerelease.length = 0, this.inc("patch", r, n), this.inc("pre", r, n);
        break;
      case "prerelease":
        this.prerelease.length === 0 && this.inc("patch", r, n), this.inc("pre", r, n);
        break;
      case "major":
        (this.minor !== 0 || this.patch !== 0 || this.prerelease.length === 0) && this.major++, this.minor = 0, this.patch = 0, this.prerelease = [];
        break;
      case "minor":
        (this.patch !== 0 || this.prerelease.length === 0) && this.minor++, this.patch = 0, this.prerelease = [];
        break;
      case "patch":
        this.prerelease.length === 0 && this.patch++, this.prerelease = [];
        break;
      case "pre": {
        const s = Number(n) ? 1 : 0;
        if (!r && n === !1)
          throw new Error("invalid increment argument: identifier is empty");
        if (this.prerelease.length === 0)
          this.prerelease = [s];
        else {
          let a = this.prerelease.length;
          for (; --a >= 0; )
            typeof this.prerelease[a] == "number" && (this.prerelease[a]++, a = -2);
          if (a === -1) {
            if (r === this.prerelease.join(".") && n === !1)
              throw new Error("invalid increment argument: identifier already exists");
            this.prerelease.push(s);
          }
        }
        if (r) {
          let a = [r, s];
          n === !1 && (a = [r]), or(this.prerelease[0], r) === 0 ? isNaN(this.prerelease[1]) && (this.prerelease = a) : this.prerelease = a;
        }
        break;
      }
      default:
        throw new Error(`invalid increment argument: ${t}`);
    }
    return this.raw = this.format(), this.build.length && (this.raw += `+${this.build.join(".")}`), this;
  }
};
var je = Vw;
const hc = je, Lw = (e, t, r = !1) => {
  if (e instanceof hc)
    return e;
  try {
    return new hc(e, t);
  } catch (n) {
    if (!r)
      return null;
    throw n;
  }
};
var Or = Lw;
const Fw = Or, zw = (e, t) => {
  const r = Fw(e, t);
  return r ? r.version : null;
};
var Uw = zw;
const qw = Or, Gw = (e, t) => {
  const r = qw(e.trim().replace(/^[=v]+/, ""), t);
  return r ? r.version : null;
};
var Kw = Gw;
const mc = je, Hw = (e, t, r, n, s) => {
  typeof r == "string" && (s = n, n = r, r = void 0);
  try {
    return new mc(
      e instanceof mc ? e.version : e,
      r
    ).inc(t, n, s).version;
  } catch {
    return null;
  }
};
var Jw = Hw;
const pc = Or, Xw = (e, t) => {
  const r = pc(e, null, !0), n = pc(t, null, !0), s = r.compare(n);
  if (s === 0)
    return null;
  const a = s > 0, o = a ? r : n, u = a ? n : r, l = !!o.prerelease.length;
  if (!!u.prerelease.length && !l)
    return !u.patch && !u.minor ? "major" : o.patch ? "patch" : o.minor ? "minor" : "major";
  const d = l ? "pre" : "";
  return r.major !== n.major ? d + "major" : r.minor !== n.minor ? d + "minor" : r.patch !== n.patch ? d + "patch" : "prerelease";
};
var Bw = Xw;
const Ww = je, Yw = (e, t) => new Ww(e, t).major;
var Qw = Yw;
const Zw = je, xw = (e, t) => new Zw(e, t).minor;
var eE = xw;
const tE = je, rE = (e, t) => new tE(e, t).patch;
var nE = rE;
const sE = Or, aE = (e, t) => {
  const r = sE(e, t);
  return r && r.prerelease.length ? r.prerelease : null;
};
var oE = aE;
const $c = je, iE = (e, t, r) => new $c(e, r).compare(new $c(t, r));
var Ye = iE;
const cE = Ye, lE = (e, t, r) => cE(t, e, r);
var uE = lE;
const dE = Ye, fE = (e, t) => dE(e, t, !0);
var hE = fE;
const yc = je, mE = (e, t, r) => {
  const n = new yc(e, r), s = new yc(t, r);
  return n.compare(s) || n.compareBuild(s);
};
var Yo = mE;
const pE = Yo, $E = (e, t) => e.sort((r, n) => pE(r, n, t));
var yE = $E;
const _E = Yo, gE = (e, t) => e.sort((r, n) => _E(n, r, t));
var vE = gE;
const wE = Ye, EE = (e, t, r) => wE(e, t, r) > 0;
var us = EE;
const bE = Ye, SE = (e, t, r) => bE(e, t, r) < 0;
var Qo = SE;
const PE = Ye, NE = (e, t, r) => PE(e, t, r) === 0;
var Iu = NE;
const RE = Ye, OE = (e, t, r) => RE(e, t, r) !== 0;
var Tu = OE;
const IE = Ye, TE = (e, t, r) => IE(e, t, r) >= 0;
var Zo = TE;
const jE = Ye, kE = (e, t, r) => jE(e, t, r) <= 0;
var xo = kE;
const AE = Iu, CE = Tu, DE = us, ME = Zo, VE = Qo, LE = xo, FE = (e, t, r, n) => {
  switch (t) {
    case "===":
      return typeof e == "object" && (e = e.version), typeof r == "object" && (r = r.version), e === r;
    case "!==":
      return typeof e == "object" && (e = e.version), typeof r == "object" && (r = r.version), e !== r;
    case "":
    case "=":
    case "==":
      return AE(e, r, n);
    case "!=":
      return CE(e, r, n);
    case ">":
      return DE(e, r, n);
    case ">=":
      return ME(e, r, n);
    case "<":
      return VE(e, r, n);
    case "<=":
      return LE(e, r, n);
    default:
      throw new TypeError(`Invalid operator: ${t}`);
  }
};
var ju = FE;
const zE = je, UE = Or, { safeRe: Sn, t: Pn } = un, qE = (e, t) => {
  if (e instanceof zE)
    return e;
  if (typeof e == "number" && (e = String(e)), typeof e != "string")
    return null;
  t = t || {};
  let r = null;
  if (!t.rtl)
    r = e.match(t.includePrerelease ? Sn[Pn.COERCEFULL] : Sn[Pn.COERCE]);
  else {
    const l = t.includePrerelease ? Sn[Pn.COERCERTLFULL] : Sn[Pn.COERCERTL];
    let c;
    for (; (c = l.exec(e)) && (!r || r.index + r[0].length !== e.length); )
      (!r || c.index + c[0].length !== r.index + r[0].length) && (r = c), l.lastIndex = c.index + c[1].length + c[2].length;
    l.lastIndex = -1;
  }
  if (r === null)
    return null;
  const n = r[2], s = r[3] || "0", a = r[4] || "0", o = t.includePrerelease && r[5] ? `-${r[5]}` : "", u = t.includePrerelease && r[6] ? `+${r[6]}` : "";
  return UE(`${n}.${s}.${a}${o}${u}`, t);
};
var GE = qE;
class KE {
  constructor() {
    this.max = 1e3, this.map = /* @__PURE__ */ new Map();
  }
  get(t) {
    const r = this.map.get(t);
    if (r !== void 0)
      return this.map.delete(t), this.map.set(t, r), r;
  }
  delete(t) {
    return this.map.delete(t);
  }
  set(t, r) {
    if (!this.delete(t) && r !== void 0) {
      if (this.map.size >= this.max) {
        const s = this.map.keys().next().value;
        this.delete(s);
      }
      this.map.set(t, r);
    }
    return this;
  }
}
var HE = KE, Rs, _c;
function Qe() {
  if (_c) return Rs;
  _c = 1;
  const e = /\s+/g;
  class t {
    constructor(k, V) {
      if (V = s(V), k instanceof t)
        return k.loose === !!V.loose && k.includePrerelease === !!V.includePrerelease ? k : new t(k.raw, V);
      if (k instanceof a)
        return this.raw = k.value, this.set = [[k]], this.formatted = void 0, this;
      if (this.options = V, this.loose = !!V.loose, this.includePrerelease = !!V.includePrerelease, this.raw = k.trim().replace(e, " "), this.set = this.raw.split("||").map((D) => this.parseRange(D.trim())).filter((D) => D.length), !this.set.length)
        throw new TypeError(`Invalid SemVer Range: ${this.raw}`);
      if (this.set.length > 1) {
        const D = this.set[0];
        if (this.set = this.set.filter((K) => !w(K[0])), this.set.length === 0)
          this.set = [D];
        else if (this.set.length > 1) {
          for (const K of this.set)
            if (K.length === 1 && _(K[0])) {
              this.set = [K];
              break;
            }
        }
      }
      this.formatted = void 0;
    }
    get range() {
      if (this.formatted === void 0) {
        this.formatted = "";
        for (let k = 0; k < this.set.length; k++) {
          k > 0 && (this.formatted += "||");
          const V = this.set[k];
          for (let D = 0; D < V.length; D++)
            D > 0 && (this.formatted += " "), this.formatted += V[D].toString().trim();
        }
      }
      return this.formatted;
    }
    format() {
      return this.range;
    }
    toString() {
      return this.range;
    }
    parseRange(k) {
      const D = ((this.options.includePrerelease && g) | (this.options.loose && y)) + ":" + k, K = n.get(D);
      if (K)
        return K;
      const M = this.options.loose, P = M ? l[c.HYPHENRANGELOOSE] : l[c.HYPHENRANGE];
      k = k.replace(P, H(this.options.includePrerelease)), o("hyphen replace", k), k = k.replace(l[c.COMPARATORTRIM], d), o("comparator trim", k), k = k.replace(l[c.TILDETRIM], h), o("tilde trim", k), k = k.replace(l[c.CARETTRIM], b), o("caret trim", k);
      let p = k.split(" ").map((f) => v(f, this.options)).join(" ").split(/\s+/).map((f) => z(f, this.options));
      M && (p = p.filter((f) => (o("loose invalid filter", f, this.options), !!f.match(l[c.COMPARATORLOOSE])))), o("range list", p);
      const S = /* @__PURE__ */ new Map(), $ = p.map((f) => new a(f, this.options));
      for (const f of $) {
        if (w(f))
          return [f];
        S.set(f.value, f);
      }
      S.size > 1 && S.has("") && S.delete("");
      const i = [...S.values()];
      return n.set(D, i), i;
    }
    intersects(k, V) {
      if (!(k instanceof t))
        throw new TypeError("a Range is required");
      return this.set.some((D) => m(D, V) && k.set.some((K) => m(K, V) && D.every((M) => K.every((P) => M.intersects(P, V)))));
    }
    // if ANY of the sets match ALL of its comparators, then pass
    test(k) {
      if (!k)
        return !1;
      if (typeof k == "string")
        try {
          k = new u(k, this.options);
        } catch {
          return !1;
        }
      for (let V = 0; V < this.set.length; V++)
        if (se(this.set[V], k, this.options))
          return !0;
      return !1;
    }
  }
  Rs = t;
  const r = HE, n = new r(), s = Wo, a = ds(), o = ls, u = je, {
    safeRe: l,
    t: c,
    comparatorTrimReplace: d,
    tildeTrimReplace: h,
    caretTrimReplace: b
  } = un, { FLAG_INCLUDE_PRERELEASE: g, FLAG_LOOSE: y } = cs, w = (T) => T.value === "<0.0.0-0", _ = (T) => T.value === "", m = (T, k) => {
    let V = !0;
    const D = T.slice();
    let K = D.pop();
    for (; V && D.length; )
      V = D.every((M) => K.intersects(M, k)), K = D.pop();
    return V;
  }, v = (T, k) => (o("comp", T, k), T = G(T, k), o("caret", T), T = R(T, k), o("tildes", T), T = le(T, k), o("xrange", T), T = pe(T, k), o("stars", T), T), N = (T) => !T || T.toLowerCase() === "x" || T === "*", R = (T, k) => T.trim().split(/\s+/).map((V) => O(V, k)).join(" "), O = (T, k) => {
    const V = k.loose ? l[c.TILDELOOSE] : l[c.TILDE];
    return T.replace(V, (D, K, M, P, p) => {
      o("tilde", T, D, K, M, P, p);
      let S;
      return N(K) ? S = "" : N(M) ? S = `>=${K}.0.0 <${+K + 1}.0.0-0` : N(P) ? S = `>=${K}.${M}.0 <${K}.${+M + 1}.0-0` : p ? (o("replaceTilde pr", p), S = `>=${K}.${M}.${P}-${p} <${K}.${+M + 1}.0-0`) : S = `>=${K}.${M}.${P} <${K}.${+M + 1}.0-0`, o("tilde return", S), S;
    });
  }, G = (T, k) => T.trim().split(/\s+/).map((V) => B(V, k)).join(" "), B = (T, k) => {
    o("caret", T, k);
    const V = k.loose ? l[c.CARETLOOSE] : l[c.CARET], D = k.includePrerelease ? "-0" : "";
    return T.replace(V, (K, M, P, p, S) => {
      o("caret", T, K, M, P, p, S);
      let $;
      return N(M) ? $ = "" : N(P) ? $ = `>=${M}.0.0${D} <${+M + 1}.0.0-0` : N(p) ? M === "0" ? $ = `>=${M}.${P}.0${D} <${M}.${+P + 1}.0-0` : $ = `>=${M}.${P}.0${D} <${+M + 1}.0.0-0` : S ? (o("replaceCaret pr", S), M === "0" ? P === "0" ? $ = `>=${M}.${P}.${p}-${S} <${M}.${P}.${+p + 1}-0` : $ = `>=${M}.${P}.${p}-${S} <${M}.${+P + 1}.0-0` : $ = `>=${M}.${P}.${p}-${S} <${+M + 1}.0.0-0`) : (o("no pr"), M === "0" ? P === "0" ? $ = `>=${M}.${P}.${p}${D} <${M}.${P}.${+p + 1}-0` : $ = `>=${M}.${P}.${p}${D} <${M}.${+P + 1}.0-0` : $ = `>=${M}.${P}.${p} <${+M + 1}.0.0-0`), o("caret return", $), $;
    });
  }, le = (T, k) => (o("replaceXRanges", T, k), T.split(/\s+/).map((V) => fe(V, k)).join(" ")), fe = (T, k) => {
    T = T.trim();
    const V = k.loose ? l[c.XRANGELOOSE] : l[c.XRANGE];
    return T.replace(V, (D, K, M, P, p, S) => {
      o("xRange", T, D, K, M, P, p, S);
      const $ = N(M), i = $ || N(P), f = i || N(p), E = f;
      return K === "=" && E && (K = ""), S = k.includePrerelease ? "-0" : "", $ ? K === ">" || K === "<" ? D = "<0.0.0-0" : D = "*" : K && E ? (i && (P = 0), p = 0, K === ">" ? (K = ">=", i ? (M = +M + 1, P = 0, p = 0) : (P = +P + 1, p = 0)) : K === "<=" && (K = "<", i ? M = +M + 1 : P = +P + 1), K === "<" && (S = "-0"), D = `${K + M}.${P}.${p}${S}`) : i ? D = `>=${M}.0.0${S} <${+M + 1}.0.0-0` : f && (D = `>=${M}.${P}.0${S} <${M}.${+P + 1}.0-0`), o("xRange return", D), D;
    });
  }, pe = (T, k) => (o("replaceStars", T, k), T.trim().replace(l[c.STAR], "")), z = (T, k) => (o("replaceGTE0", T, k), T.trim().replace(l[k.includePrerelease ? c.GTE0PRE : c.GTE0], "")), H = (T) => (k, V, D, K, M, P, p, S, $, i, f, E) => (N(D) ? V = "" : N(K) ? V = `>=${D}.0.0${T ? "-0" : ""}` : N(M) ? V = `>=${D}.${K}.0${T ? "-0" : ""}` : P ? V = `>=${V}` : V = `>=${V}${T ? "-0" : ""}`, N($) ? S = "" : N(i) ? S = `<${+$ + 1}.0.0-0` : N(f) ? S = `<${$}.${+i + 1}.0-0` : E ? S = `<=${$}.${i}.${f}-${E}` : T ? S = `<${$}.${i}.${+f + 1}-0` : S = `<=${S}`, `${V} ${S}`.trim()), se = (T, k, V) => {
    for (let D = 0; D < T.length; D++)
      if (!T[D].test(k))
        return !1;
    if (k.prerelease.length && !V.includePrerelease) {
      for (let D = 0; D < T.length; D++)
        if (o(T[D].semver), T[D].semver !== a.ANY && T[D].semver.prerelease.length > 0) {
          const K = T[D].semver;
          if (K.major === k.major && K.minor === k.minor && K.patch === k.patch)
            return !0;
        }
      return !1;
    }
    return !0;
  };
  return Rs;
}
var Os, gc;
function ds() {
  if (gc) return Os;
  gc = 1;
  const e = Symbol("SemVer ANY");
  class t {
    static get ANY() {
      return e;
    }
    constructor(d, h) {
      if (h = r(h), d instanceof t) {
        if (d.loose === !!h.loose)
          return d;
        d = d.value;
      }
      d = d.trim().split(/\s+/).join(" "), o("comparator", d, h), this.options = h, this.loose = !!h.loose, this.parse(d), this.semver === e ? this.value = "" : this.value = this.operator + this.semver.version, o("comp", this);
    }
    parse(d) {
      const h = this.options.loose ? n[s.COMPARATORLOOSE] : n[s.COMPARATOR], b = d.match(h);
      if (!b)
        throw new TypeError(`Invalid comparator: ${d}`);
      this.operator = b[1] !== void 0 ? b[1] : "", this.operator === "=" && (this.operator = ""), b[2] ? this.semver = new u(b[2], this.options.loose) : this.semver = e;
    }
    toString() {
      return this.value;
    }
    test(d) {
      if (o("Comparator.test", d, this.options.loose), this.semver === e || d === e)
        return !0;
      if (typeof d == "string")
        try {
          d = new u(d, this.options);
        } catch {
          return !1;
        }
      return a(d, this.operator, this.semver, this.options);
    }
    intersects(d, h) {
      if (!(d instanceof t))
        throw new TypeError("a Comparator is required");
      return this.operator === "" ? this.value === "" ? !0 : new l(d.value, h).test(this.value) : d.operator === "" ? d.value === "" ? !0 : new l(this.value, h).test(d.semver) : (h = r(h), h.includePrerelease && (this.value === "<0.0.0-0" || d.value === "<0.0.0-0") || !h.includePrerelease && (this.value.startsWith("<0.0.0") || d.value.startsWith("<0.0.0")) ? !1 : !!(this.operator.startsWith(">") && d.operator.startsWith(">") || this.operator.startsWith("<") && d.operator.startsWith("<") || this.semver.version === d.semver.version && this.operator.includes("=") && d.operator.includes("=") || a(this.semver, "<", d.semver, h) && this.operator.startsWith(">") && d.operator.startsWith("<") || a(this.semver, ">", d.semver, h) && this.operator.startsWith("<") && d.operator.startsWith(">")));
    }
  }
  Os = t;
  const r = Wo, { safeRe: n, t: s } = un, a = ju, o = ls, u = je, l = Qe();
  return Os;
}
const JE = Qe(), XE = (e, t, r) => {
  try {
    t = new JE(t, r);
  } catch {
    return !1;
  }
  return t.test(e);
};
var fs = XE;
const BE = Qe(), WE = (e, t) => new BE(e, t).set.map((r) => r.map((n) => n.value).join(" ").trim().split(" "));
var YE = WE;
const QE = je, ZE = Qe(), xE = (e, t, r) => {
  let n = null, s = null, a = null;
  try {
    a = new ZE(t, r);
  } catch {
    return null;
  }
  return e.forEach((o) => {
    a.test(o) && (!n || s.compare(o) === -1) && (n = o, s = new QE(n, r));
  }), n;
};
var e1 = xE;
const t1 = je, r1 = Qe(), n1 = (e, t, r) => {
  let n = null, s = null, a = null;
  try {
    a = new r1(t, r);
  } catch {
    return null;
  }
  return e.forEach((o) => {
    a.test(o) && (!n || s.compare(o) === 1) && (n = o, s = new t1(n, r));
  }), n;
};
var s1 = n1;
const Is = je, a1 = Qe(), vc = us, o1 = (e, t) => {
  e = new a1(e, t);
  let r = new Is("0.0.0");
  if (e.test(r) || (r = new Is("0.0.0-0"), e.test(r)))
    return r;
  r = null;
  for (let n = 0; n < e.set.length; ++n) {
    const s = e.set[n];
    let a = null;
    s.forEach((o) => {
      const u = new Is(o.semver.version);
      switch (o.operator) {
        case ">":
          u.prerelease.length === 0 ? u.patch++ : u.prerelease.push(0), u.raw = u.format();
        case "":
        case ">=":
          (!a || vc(u, a)) && (a = u);
          break;
        case "<":
        case "<=":
          break;
        default:
          throw new Error(`Unexpected operation: ${o.operator}`);
      }
    }), a && (!r || vc(r, a)) && (r = a);
  }
  return r && e.test(r) ? r : null;
};
var i1 = o1;
const c1 = Qe(), l1 = (e, t) => {
  try {
    return new c1(e, t).range || "*";
  } catch {
    return null;
  }
};
var u1 = l1;
const d1 = je, ku = ds(), { ANY: f1 } = ku, h1 = Qe(), m1 = fs, wc = us, Ec = Qo, p1 = xo, $1 = Zo, y1 = (e, t, r, n) => {
  e = new d1(e, n), t = new h1(t, n);
  let s, a, o, u, l;
  switch (r) {
    case ">":
      s = wc, a = p1, o = Ec, u = ">", l = ">=";
      break;
    case "<":
      s = Ec, a = $1, o = wc, u = "<", l = "<=";
      break;
    default:
      throw new TypeError('Must provide a hilo val of "<" or ">"');
  }
  if (m1(e, t, n))
    return !1;
  for (let c = 0; c < t.set.length; ++c) {
    const d = t.set[c];
    let h = null, b = null;
    if (d.forEach((g) => {
      g.semver === f1 && (g = new ku(">=0.0.0")), h = h || g, b = b || g, s(g.semver, h.semver, n) ? h = g : o(g.semver, b.semver, n) && (b = g);
    }), h.operator === u || h.operator === l || (!b.operator || b.operator === u) && a(e, b.semver))
      return !1;
    if (b.operator === l && o(e, b.semver))
      return !1;
  }
  return !0;
};
var ei = y1;
const _1 = ei, g1 = (e, t, r) => _1(e, t, ">", r);
var v1 = g1;
const w1 = ei, E1 = (e, t, r) => w1(e, t, "<", r);
var b1 = E1;
const bc = Qe(), S1 = (e, t, r) => (e = new bc(e, r), t = new bc(t, r), e.intersects(t, r));
var P1 = S1;
const N1 = fs, R1 = Ye;
var O1 = (e, t, r) => {
  const n = [];
  let s = null, a = null;
  const o = e.sort((d, h) => R1(d, h, r));
  for (const d of o)
    N1(d, t, r) ? (a = d, s || (s = d)) : (a && n.push([s, a]), a = null, s = null);
  s && n.push([s, null]);
  const u = [];
  for (const [d, h] of n)
    d === h ? u.push(d) : !h && d === o[0] ? u.push("*") : h ? d === o[0] ? u.push(`<=${h}`) : u.push(`${d} - ${h}`) : u.push(`>=${d}`);
  const l = u.join(" || "), c = typeof t.raw == "string" ? t.raw : String(t);
  return l.length < c.length ? l : t;
};
const Sc = Qe(), ti = ds(), { ANY: Ts } = ti, Fr = fs, ri = Ye, I1 = (e, t, r = {}) => {
  if (e === t)
    return !0;
  e = new Sc(e, r), t = new Sc(t, r);
  let n = !1;
  e: for (const s of e.set) {
    for (const a of t.set) {
      const o = j1(s, a, r);
      if (n = n || o !== null, o)
        continue e;
    }
    if (n)
      return !1;
  }
  return !0;
}, T1 = [new ti(">=0.0.0-0")], Pc = [new ti(">=0.0.0")], j1 = (e, t, r) => {
  if (e === t)
    return !0;
  if (e.length === 1 && e[0].semver === Ts) {
    if (t.length === 1 && t[0].semver === Ts)
      return !0;
    r.includePrerelease ? e = T1 : e = Pc;
  }
  if (t.length === 1 && t[0].semver === Ts) {
    if (r.includePrerelease)
      return !0;
    t = Pc;
  }
  const n = /* @__PURE__ */ new Set();
  let s, a;
  for (const g of e)
    g.operator === ">" || g.operator === ">=" ? s = Nc(s, g, r) : g.operator === "<" || g.operator === "<=" ? a = Rc(a, g, r) : n.add(g.semver);
  if (n.size > 1)
    return null;
  let o;
  if (s && a) {
    if (o = ri(s.semver, a.semver, r), o > 0)
      return null;
    if (o === 0 && (s.operator !== ">=" || a.operator !== "<="))
      return null;
  }
  for (const g of n) {
    if (s && !Fr(g, String(s), r) || a && !Fr(g, String(a), r))
      return null;
    for (const y of t)
      if (!Fr(g, String(y), r))
        return !1;
    return !0;
  }
  let u, l, c, d, h = a && !r.includePrerelease && a.semver.prerelease.length ? a.semver : !1, b = s && !r.includePrerelease && s.semver.prerelease.length ? s.semver : !1;
  h && h.prerelease.length === 1 && a.operator === "<" && h.prerelease[0] === 0 && (h = !1);
  for (const g of t) {
    if (d = d || g.operator === ">" || g.operator === ">=", c = c || g.operator === "<" || g.operator === "<=", s) {
      if (b && g.semver.prerelease && g.semver.prerelease.length && g.semver.major === b.major && g.semver.minor === b.minor && g.semver.patch === b.patch && (b = !1), g.operator === ">" || g.operator === ">=") {
        if (u = Nc(s, g, r), u === g && u !== s)
          return !1;
      } else if (s.operator === ">=" && !Fr(s.semver, String(g), r))
        return !1;
    }
    if (a) {
      if (h && g.semver.prerelease && g.semver.prerelease.length && g.semver.major === h.major && g.semver.minor === h.minor && g.semver.patch === h.patch && (h = !1), g.operator === "<" || g.operator === "<=") {
        if (l = Rc(a, g, r), l === g && l !== a)
          return !1;
      } else if (a.operator === "<=" && !Fr(a.semver, String(g), r))
        return !1;
    }
    if (!g.operator && (a || s) && o !== 0)
      return !1;
  }
  return !(s && c && !a && o !== 0 || a && d && !s && o !== 0 || b || h);
}, Nc = (e, t, r) => {
  if (!e)
    return t;
  const n = ri(e.semver, t.semver, r);
  return n > 0 ? e : n < 0 || t.operator === ">" && e.operator === ">=" ? t : e;
}, Rc = (e, t, r) => {
  if (!e)
    return t;
  const n = ri(e.semver, t.semver, r);
  return n < 0 ? e : n > 0 || t.operator === "<" && e.operator === "<=" ? t : e;
};
var k1 = I1;
const js = un, Oc = cs, A1 = je, Ic = Ou, C1 = Or, D1 = Uw, M1 = Kw, V1 = Jw, L1 = Bw, F1 = Qw, z1 = eE, U1 = nE, q1 = oE, G1 = Ye, K1 = uE, H1 = hE, J1 = Yo, X1 = yE, B1 = vE, W1 = us, Y1 = Qo, Q1 = Iu, Z1 = Tu, x1 = Zo, eb = xo, tb = ju, rb = GE, nb = ds(), sb = Qe(), ab = fs, ob = YE, ib = e1, cb = s1, lb = i1, ub = u1, db = ei, fb = v1, hb = b1, mb = P1, pb = O1, $b = k1;
var yb = {
  parse: C1,
  valid: D1,
  clean: M1,
  inc: V1,
  diff: L1,
  major: F1,
  minor: z1,
  patch: U1,
  prerelease: q1,
  compare: G1,
  rcompare: K1,
  compareLoose: H1,
  compareBuild: J1,
  sort: X1,
  rsort: B1,
  gt: W1,
  lt: Y1,
  eq: Q1,
  neq: Z1,
  gte: x1,
  lte: eb,
  cmp: tb,
  coerce: rb,
  Comparator: nb,
  Range: sb,
  satisfies: ab,
  toComparators: ob,
  maxSatisfying: ib,
  minSatisfying: cb,
  minVersion: lb,
  validRange: ub,
  outside: db,
  gtr: fb,
  ltr: hb,
  intersects: mb,
  simplifyRange: pb,
  subset: $b,
  SemVer: A1,
  re: js.re,
  src: js.src,
  tokens: js.t,
  SEMVER_SPEC_VERSION: Oc.SEMVER_SPEC_VERSION,
  RELEASE_TYPES: Oc.RELEASE_TYPES,
  compareIdentifiers: Ic.compareIdentifiers,
  rcompareIdentifiers: Ic.rcompareIdentifiers
};
const ir = /* @__PURE__ */ Fc(yb), _b = Object.prototype.toString, gb = "[object Uint8Array]", vb = "[object ArrayBuffer]";
function Au(e, t, r) {
  return e ? e.constructor === t ? !0 : _b.call(e) === r : !1;
}
function Cu(e) {
  return Au(e, Uint8Array, gb);
}
function wb(e) {
  return Au(e, ArrayBuffer, vb);
}
function Eb(e) {
  return Cu(e) || wb(e);
}
function bb(e) {
  if (!Cu(e))
    throw new TypeError(`Expected \`Uint8Array\`, got \`${typeof e}\``);
}
function Sb(e) {
  if (!Eb(e))
    throw new TypeError(`Expected \`Uint8Array\` or \`ArrayBuffer\`, got \`${typeof e}\``);
}
function Tc(e, t) {
  if (e.length === 0)
    return new Uint8Array(0);
  t ?? (t = e.reduce((s, a) => s + a.length, 0));
  const r = new Uint8Array(t);
  let n = 0;
  for (const s of e)
    bb(s), r.set(s, n), n += s.length;
  return r;
}
const Nn = {
  utf8: new globalThis.TextDecoder("utf8")
};
function jc(e, t = "utf8") {
  return Sb(e), Nn[t] ?? (Nn[t] = new globalThis.TextDecoder(t)), Nn[t].decode(e);
}
function Pb(e) {
  if (typeof e != "string")
    throw new TypeError(`Expected \`string\`, got \`${typeof e}\``);
}
const Nb = new globalThis.TextEncoder();
function ks(e) {
  return Pb(e), Nb.encode(e);
}
Array.from({ length: 256 }, (e, t) => t.toString(16).padStart(2, "0"));
const Rb = yw.default, kc = "aes-256-cbc", cr = () => /* @__PURE__ */ Object.create(null), Ob = (e) => e != null, Ib = (e, t) => {
  const r = /* @__PURE__ */ new Set([
    "undefined",
    "symbol",
    "function"
  ]), n = typeof t;
  if (r.has(n))
    throw new TypeError(`Setting a value of type \`${n}\` for key \`${e}\` is not allowed as it's not supported by JSON`);
}, Mn = "__internal__", As = `${Mn}.migrations.version`;
var bt, ot, Ve, it;
class Tb {
  constructor(t = {}) {
    jr(this, "path");
    jr(this, "events");
    kr(this, bt);
    kr(this, ot);
    kr(this, Ve);
    kr(this, it, {});
    jr(this, "_deserialize", (t) => JSON.parse(t));
    jr(this, "_serialize", (t) => JSON.stringify(t, void 0, "	"));
    const r = {
      configName: "config",
      fileExtension: "json",
      projectSuffix: "nodejs",
      clearInvalidConfig: !1,
      accessPropertiesByDotNotation: !0,
      configFileMode: 438,
      ...t
    };
    if (!r.cwd) {
      if (!r.projectName)
        throw new Error("Please specify the `projectName` option.");
      r.cwd = Zu(r.projectName, { suffix: r.projectSuffix }).config;
    }
    if (Ar(this, Ve, r), r.schema) {
      if (typeof r.schema != "object")
        throw new TypeError("The `schema` option must be an object.");
      const o = new s0.Ajv2020({
        allErrors: !0,
        useDefaults: !0
      });
      Rb(o);
      const u = {
        type: "object",
        properties: r.schema
      };
      Ar(this, bt, o.compile(u));
      for (const [l, c] of Object.entries(r.schema))
        c != null && c.default && (ue(this, it)[l] = c.default);
    }
    r.defaults && Ar(this, it, {
      ...ue(this, it),
      ...r.defaults
    }), r.serialize && (this._serialize = r.serialize), r.deserialize && (this._deserialize = r.deserialize), this.events = new EventTarget(), Ar(this, ot, r.encryptionKey);
    const n = r.fileExtension ? `.${r.fileExtension}` : "";
    this.path = ne.resolve(r.cwd, `${r.configName ?? "config"}${n}`);
    const s = this.store, a = Object.assign(cr(), r.defaults, s);
    if (r.migrations) {
      if (!r.projectVersion)
        throw new Error("Please specify the `projectVersion` option.");
      this._migrate(r.migrations, r.projectVersion, r.beforeEachMigration);
    }
    this._validate(a);
    try {
      Ku.deepEqual(s, a);
    } catch {
      this.store = a;
    }
    r.watch && this._watch();
  }
  get(t, r) {
    if (ue(this, Ve).accessPropertiesByDotNotation)
      return this._get(t, r);
    const { store: n } = this;
    return t in n ? n[t] : r;
  }
  set(t, r) {
    if (typeof t != "string" && typeof t != "object")
      throw new TypeError(`Expected \`key\` to be of type \`string\` or \`object\`, got ${typeof t}`);
    if (typeof t != "object" && r === void 0)
      throw new TypeError("Use `delete()` to clear values");
    if (this._containsReservedKey(t))
      throw new TypeError(`Please don't use the ${Mn} key, as it's used to manage this module internal operations.`);
    const { store: n } = this, s = (a, o) => {
      Ib(a, o), ue(this, Ve).accessPropertiesByDotNotation ? ai(n, a, o) : n[a] = o;
    };
    if (typeof t == "object") {
      const a = t;
      for (const [o, u] of Object.entries(a))
        s(o, u);
    } else
      s(t, r);
    this.store = n;
  }
  /**
      Check if an item exists.
  
      @param key - The key of the item to check.
      */
  has(t) {
    return ue(this, Ve).accessPropertiesByDotNotation ? Bu(this.store, t) : t in this.store;
  }
  /**
      Reset items to their default values, as defined by the `defaults` or `schema` option.
  
      @see `clear()` to reset all items.
  
      @param keys - The keys of the items to reset.
      */
  reset(...t) {
    for (const r of t)
      Ob(ue(this, it)[r]) && this.set(r, ue(this, it)[r]);
  }
  delete(t) {
    const { store: r } = this;
    ue(this, Ve).accessPropertiesByDotNotation ? Xu(r, t) : delete r[t], this.store = r;
  }
  /**
      Delete all items.
  
      This resets known items to their default values, if defined by the `defaults` or `schema` option.
      */
  clear() {
    this.store = cr();
    for (const t of Object.keys(ue(this, it)))
      this.reset(t);
  }
  /**
      Watches the given `key`, calling `callback` on any changes.
  
      @param key - The key to watch.
      @param callback - A callback function that is called on any changes. When a `key` is first set `oldValue` will be `undefined`, and when a key is deleted `newValue` will be `undefined`.
      @returns A function, that when called, will unsubscribe.
      */
  onDidChange(t, r) {
    if (typeof t != "string")
      throw new TypeError(`Expected \`key\` to be of type \`string\`, got ${typeof t}`);
    if (typeof r != "function")
      throw new TypeError(`Expected \`callback\` to be of type \`function\`, got ${typeof r}`);
    return this._handleChange(() => this.get(t), r);
  }
  /**
      Watches the whole config object, calling `callback` on any changes.
  
      @param callback - A callback function that is called on any changes. When a `key` is first set `oldValue` will be `undefined`, and when a key is deleted `newValue` will be `undefined`.
      @returns A function, that when called, will unsubscribe.
      */
  onDidAnyChange(t) {
    if (typeof t != "function")
      throw new TypeError(`Expected \`callback\` to be of type \`function\`, got ${typeof t}`);
    return this._handleChange(() => this.store, t);
  }
  get size() {
    return Object.keys(this.store).length;
  }
  get store() {
    try {
      const t = Z.readFileSync(this.path, ue(this, ot) ? null : "utf8"), r = this._encryptData(t), n = this._deserialize(r);
      return this._validate(n), Object.assign(cr(), n);
    } catch (t) {
      if ((t == null ? void 0 : t.code) === "ENOENT")
        return this._ensureDirectory(), cr();
      if (ue(this, Ve).clearInvalidConfig && t.name === "SyntaxError")
        return cr();
      throw t;
    }
  }
  set store(t) {
    this._ensureDirectory(), this._validate(t), this._write(t), this.events.dispatchEvent(new Event("change"));
  }
  *[Symbol.iterator]() {
    for (const [t, r] of Object.entries(this.store))
      yield [t, r];
  }
  _encryptData(t) {
    if (!ue(this, ot))
      return typeof t == "string" ? t : jc(t);
    try {
      const r = t.slice(0, 16), n = Cr.pbkdf2Sync(ue(this, ot), r.toString(), 1e4, 32, "sha512"), s = Cr.createDecipheriv(kc, n, r), a = t.slice(17), o = typeof a == "string" ? ks(a) : a;
      return jc(Tc([s.update(o), s.final()]));
    } catch {
    }
    return t.toString();
  }
  _handleChange(t, r) {
    let n = t();
    const s = () => {
      const a = n, o = t();
      Gu(o, a) || (n = o, r.call(this, o, a));
    };
    return this.events.addEventListener("change", s), () => {
      this.events.removeEventListener("change", s);
    };
  }
  _validate(t) {
    if (!ue(this, bt) || ue(this, bt).call(this, t) || !ue(this, bt).errors)
      return;
    const n = ue(this, bt).errors.map(({ instancePath: s, message: a = "" }) => `\`${s.slice(1)}\` ${a}`);
    throw new Error("Config schema violation: " + n.join("; "));
  }
  _ensureDirectory() {
    Z.mkdirSync(ne.dirname(this.path), { recursive: !0 });
  }
  _write(t) {
    let r = this._serialize(t);
    if (ue(this, ot)) {
      const n = Cr.randomBytes(16), s = Cr.pbkdf2Sync(ue(this, ot), n.toString(), 1e4, 32, "sha512"), a = Cr.createCipheriv(kc, s, n);
      r = Tc([n, ks(":"), a.update(ks(r)), a.final()]);
    }
    if (_e.env.SNAP)
      Z.writeFileSync(this.path, r, { mode: ue(this, Ve).configFileMode });
    else
      try {
        Lc(this.path, r, { mode: ue(this, Ve).configFileMode });
      } catch (n) {
        if ((n == null ? void 0 : n.code) === "EXDEV") {
          Z.writeFileSync(this.path, r, { mode: ue(this, Ve).configFileMode });
          return;
        }
        throw n;
      }
  }
  _watch() {
    this._ensureDirectory(), Z.existsSync(this.path) || this._write(cr()), _e.platform === "win32" ? Z.watch(this.path, { persistent: !1 }, cc(() => {
      this.events.dispatchEvent(new Event("change"));
    }, { wait: 100 })) : Z.watchFile(this.path, { persistent: !1 }, cc(() => {
      this.events.dispatchEvent(new Event("change"));
    }, { wait: 5e3 }));
  }
  _migrate(t, r, n) {
    let s = this._get(As, "0.0.0");
    const a = Object.keys(t).filter((u) => this._shouldPerformMigration(u, s, r));
    let o = { ...this.store };
    for (const u of a)
      try {
        n && n(this, {
          fromVersion: s,
          toVersion: u,
          finalVersion: r,
          versions: a
        });
        const l = t[u];
        l == null || l(this), this._set(As, u), s = u, o = { ...this.store };
      } catch (l) {
        throw this.store = o, new Error(`Something went wrong during the migration! Changes applied to the store until this failed migration will be restored. ${l}`);
      }
    (this._isVersionInRangeFormat(s) || !ir.eq(s, r)) && this._set(As, r);
  }
  _containsReservedKey(t) {
    return typeof t == "object" && Object.keys(t)[0] === Mn ? !0 : typeof t != "string" ? !1 : ue(this, Ve).accessPropertiesByDotNotation ? !!t.startsWith(`${Mn}.`) : !1;
  }
  _isVersionInRangeFormat(t) {
    return ir.clean(t) === null;
  }
  _shouldPerformMigration(t, r, n) {
    return this._isVersionInRangeFormat(t) ? r !== "0.0.0" && ir.satisfies(r, t) ? !1 : ir.satisfies(n, t) : !(ir.lte(t, r) || ir.gt(t, n));
  }
  _get(t, r) {
    return Ju(this.store, t, r);
  }
  _set(t, r) {
    const { store: n } = this;
    ai(n, t, r), this.store = n;
  }
}
bt = new WeakMap(), ot = new WeakMap(), Ve = new WeakMap(), it = new WeakMap();
let Ac = !1;
const Cc = () => {
  if (!en || !Nt)
    throw new Error("Electron Store: You need to call `.initRenderer()` from the main process.");
  const e = {
    defaultCwd: Nt.getPath("userData"),
    appVersion: Nt.getVersion()
  };
  return Ac || (en.on("electron-store-get-data", (t) => {
    t.returnValue = e;
  }), Ac = !0), e;
};
class jb extends Tb {
  constructor(t) {
    let r, n;
    if (_e.type === "renderer") {
      const s = zu.ipcRenderer.sendSync("electron-store-get-data");
      if (!s)
        throw new Error("Electron Store: You need to call `.initRenderer()` from the main process.");
      ({ defaultCwd: r, appVersion: n } = s);
    } else en && Nt && ({ defaultCwd: r, appVersion: n } = Cc());
    t = {
      name: "config",
      ...t
    }, t.projectVersion || (t.projectVersion = n), t.cwd ? t.cwd = ne.isAbsolute(t.cwd) ? t.cwd : ne.join(r, t.cwd) : t.cwd = r, t.configName = t.name, delete t.name, super(t);
  }
  static initRenderer() {
    Cc();
  }
  async openInEditor() {
    const t = await Uu.openPath(this.path);
    if (t)
      throw new Error(t);
  }
}
const Du = ne.dirname(qu(import.meta.url));
process.env.APP_ROOT = ne.join(Du, "..");
const xs = process.env.VITE_DEV_SERVER_URL, Jb = ne.join(process.env.APP_ROOT, "dist-electron"), Mu = ne.join(process.env.APP_ROOT, "dist");
process.env.VITE_PUBLIC = xs ? ne.join(process.env.APP_ROOT, "public") : Mu;
let Gr;
const ea = new jb();
function Vu() {
  Gr = new Dc({
    icon: ne.join(process.env.VITE_PUBLIC, "electron-vite.svg"),
    width: 1200,
    height: 800,
    minWidth: 1200,
    minHeight: 800,
    title: "",
    titleBarStyle: "hiddenInset",
    autoHideMenuBar: !0,
    webPreferences: {
      preload: ne.join(Du, "preload.mjs")
    }
  }), process.env.NODE_ENV === "development" && Gr.webContents.openDevTools(), xs ? Gr.loadURL(xs) : Gr.loadFile(ne.join(Mu, "index.html"));
}
Nt.on("window-all-closed", () => {
  process.platform !== "darwin" && (Nt.quit(), Gr = null);
});
Nt.on("activate", () => {
  Dc.getAllWindows().length === 0 && Vu();
});
Nt.whenReady().then(Vu);
en.handle("get-settings", () => ea.get("userSettings"));
en.on("update-settings", (e, t) => {
  const r = ea.get("userSettings", {});
  ea.set("userSettings", { ...r, ...t }), e.sender.send("settings-updated", t);
});
export {
  Jb as MAIN_DIST,
  Mu as RENDERER_DIST,
  xs as VITE_DEV_SERVER_URL
};
