import { jsx as e, jsxs as i, Fragment as ce } from "react/jsx-runtime";
import st, { createContext as Ge, useMemo as j, useContext as Ke, useState as B, useCallback as W, useEffect as ee, memo as qe, useRef as ae } from "react";
import rt from "react-markdown";
import it from "remark-gfm";
import Me from "dagre";
import { applyNodeChanges as at, applyEdgeChanges as lt, addEdge as je, ReactFlow as Xe, Background as Qe, Controls as Ze, Handle as ye, Position as be, useNodesState as ct, useEdgesState as dt, BackgroundVariant as ut, MiniMap as pt, Panel as ht } from "@xyflow/react";
function mt(n) {
  const t = n.replace(/\/$/, "");
  async function o(a) {
    const d = await fetch(`${t}${a}`);
    if (!d.ok)
      throw new Error(`GET ${a} failed: ${d.status}`);
    return d.json();
  }
  async function s(a, d) {
    const y = await fetch(`${t}${a}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(d)
    });
    if (!y.ok)
      throw new Error(`POST ${a} failed: ${y.status}`);
    return y.json();
  }
  async function l(a, d) {
    const y = await fetch(`${t}${a}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(d)
    });
    if (!y.ok)
      throw new Error(`PUT ${a} failed: ${y.status}`);
    return y.json();
  }
  function c(a, d) {
    const y = new EventSource(`${t}/api/stream`);
    return y.onmessage = (S) => {
      try {
        const N = JSON.parse(S.data);
        a(N);
      } catch (N) {
        console.error("Failed to parse SSE message:", N);
      }
    }, y.onerror = (S) => {
      d && d(S);
    }, {
      close: () => y.close()
    };
  }
  return {
    // Simulation API
    spec: () => o("/api/spec"),
    status: () => o("/api/status"),
    state: () => o("/api/state"),
    events: (a, d = 200) => o(
      `/api/events?${new URLSearchParams({
        ...a != null ? { since_id: String(a) } : {},
        limit: String(d)
      }).toString()}`
    ),
    visuals: () => o("/api/visuals"),
    snapshot: () => o("/api/snapshot"),
    run: (a, d, y) => s("/api/run", { duration: a, tick_dt: d, ...y || {} }),
    pause: () => s("/api/pause", {}),
    resume: () => s("/api/resume", {}),
    reset: () => s("/api/reset", {}),
    subscribeSSE: c,
    // Editor API
    editor: {
      getModules: () => o("/api/editor/modules"),
      getConfig: (a) => o(`/api/editor/config?path=${encodeURIComponent(a)}`),
      getCurrent: () => o("/api/editor/current"),
      saveConfig: (a, d) => l("/api/editor/config", { path: a, graph: d }),
      applyConfig: (a, d) => s("/api/editor/apply", { graph: a, save_path: d }),
      validate: (a) => s("/api/editor/validate", a),
      layout: (a) => s("/api/editor/layout", a),
      toYaml: (a) => s("/api/editor/to-yaml", a),
      fromYaml: (a) => s("/api/editor/from-yaml", { yaml: a }),
      listFiles: (a) => o(`/api/editor/files${a ? `?path=${encodeURIComponent(a)}` : ""}`)
    }
  };
}
function ft() {
  var o;
  return { baseUrl: ((o = window.__BSIM_UI__) == null ? void 0 : o.mountPath) ?? "" };
}
const et = Ge(null), gt = ({
  api: n,
  children: t
}) => {
  const o = j(ft, []), s = j(() => n ?? mt(o.baseUrl), [o.baseUrl, n]);
  return /* @__PURE__ */ e(et.Provider, { value: s, children: t });
};
function Ne() {
  const n = Ke(et);
  if (!n) throw new Error("useApi must be used within ApiProvider");
  return n;
}
const tt = Ge(null);
function yt({ children: n }) {
  const [t, o] = B(null), [s, l] = B(null), [c, a] = B([]), [d, y] = B([]), [S, N] = B({ duration: 10, tick_dt: 0.1 }), [x, v] = B(/* @__PURE__ */ new Set()), g = st.useMemo(() => ({
    setSpec: o,
    setStatus: l,
    setVisuals: a,
    setEvents: y,
    appendEvent: (R) => y((k) => [...k, R]),
    setControls: (R) => N((k) => ({ ...k, ...R })),
    setControlsIfUnset: (R) => N((k) => {
      const u = { ...k };
      for (const [w, E] of Object.entries(R)) {
        const z = u[w];
        (!Object.prototype.hasOwnProperty.call(u, w) || z === void 0 || z === "" || typeof z == "number" && !Number.isFinite(z)) && (u[w] = E);
      }
      return u;
    }),
    setVisibleModules: v
  }), []), p = { spec: t, status: s, visuals: c, events: d, controls: S, visibleModules: x }, h = j(() => ({ state: p, actions: g }), [t, s, c, d, S, x, g]);
  return /* @__PURE__ */ e(tt.Provider, { value: h, children: n });
}
function re() {
  const n = Ke(tt);
  if (!n) throw new Error("useUi must be used within UiProvider");
  return n;
}
function Ae() {
  const { state: n } = re();
  return j(() => {
    var c;
    const t = Array.isArray((c = n.spec) == null ? void 0 : c.modules) ? n.spec.modules : [], o = n.visuals.map((a) => a.module), s = [], l = /* @__PURE__ */ new Set();
    for (const a of t)
      a && !l.has(a) && (s.push(a), l.add(a));
    for (const a of o)
      a && !l.has(a) && (s.push(a), l.add(a));
    return s;
  }, [n.spec, n.visuals]);
}
function bt() {
  const { state: n } = re();
  return j(() => {
    const t = /* @__PURE__ */ new Map();
    for (const o of n.visuals) {
      const s = t.get(o.module);
      s ? t.set(o.module, [...s, ...o.visuals || []]) : t.set(o.module, o.visuals || []);
    }
    return t;
  }, [n.visuals]);
}
function xe(n) {
  return n.type === "number";
}
function pe(n) {
  return n.type === "json";
}
function nt(n) {
  if (!Number.isFinite(n)) return "—";
  const t = Math.max(0, n), o = Math.floor(t / 3600), s = Math.floor(t % 3600 / 60), l = Math.floor(t % 60);
  return o > 0 ? `${o}h ${s}m ${l}s` : s > 0 ? `${s}m ${l}s` : `${l}s`;
}
function Oe({
  id: n,
  title: t,
  summary: o,
  open: s,
  onToggle: l,
  children: c
}) {
  return /* @__PURE__ */ i("section", { className: `sidebar-panel ${s ? "is-open" : "is-closed"}`, children: [
    /* @__PURE__ */ i(
      "button",
      {
        type: "button",
        className: "sidebar-panel-header",
        onClick: () => l(n),
        "aria-expanded": s,
        children: [
          /* @__PURE__ */ e("span", { className: `sidebar-panel-chevron ${s ? "open" : ""}`, "aria-hidden": "true", children: "▸" }),
          /* @__PURE__ */ e("span", { className: "sidebar-panel-title", children: t }),
          o && /* @__PURE__ */ e("span", { className: "sidebar-panel-summary", children: o })
        ]
      }
    ),
    s && /* @__PURE__ */ e("div", { className: "sidebar-panel-body", children: c })
  ] });
}
function vt() {
  var o;
  const { state: n } = re(), t = n.status;
  return t ? t.error ? /* @__PURE__ */ i("div", { className: "status-display", children: [
    /* @__PURE__ */ e("div", { className: "status-badge status-error", children: "Error" }),
    /* @__PURE__ */ e("div", { className: "status-message error", children: t.error.message })
  ] }) : t.running ? /* @__PURE__ */ i("div", { className: "status-display", children: [
    /* @__PURE__ */ e("div", { className: `status-badge ${t.paused ? "status-paused" : "status-running"}`, children: t.paused ? "Paused" : "Running" }),
    /* @__PURE__ */ i("div", { className: "status-info", children: [
      "Ticks: ",
      ((o = t.tick_count) == null ? void 0 : o.toLocaleString()) || 0
    ] })
  ] }) : /* @__PURE__ */ e("div", { className: "status-display", children: /* @__PURE__ */ e("div", { className: "status-badge status-idle", children: "Idle" }) }) : /* @__PURE__ */ e("div", { className: "status-display", children: /* @__PURE__ */ e("div", { className: "status-badge status-unknown", children: "Unknown" }) });
}
function xt() {
  var M, C, V;
  const { state: n, actions: t } = re(), o = n.status, s = (M = n.spec) == null ? void 0 : M.capabilities, l = (s == null ? void 0 : s.controls) ?? !0;
  l && (s == null || s.run), l && (s == null || s.pauseResume), l && (s == null || s.reset);
  const c = Ae(), a = (((C = n.spec) == null ? void 0 : C.controls) || []).filter(xe), d = /* @__PURE__ */ new Set(["wiring", "wiring_layout", "module_ports", "models"]), y = (((V = n.spec) == null ? void 0 : V.controls) || []).filter(pe).filter((b) => !d.has(b.name)), S = W((b, L) => t.setControls({ [b]: L }), [t]), N = (b) => {
    if (b === "" || b === null || b === void 0) return Number.NaN;
    const L = typeof b == "number" ? b : Number(String(b));
    return Number.isFinite(L) ? L : Number.NaN;
  }, x = (b) => {
    var L;
    return (L = a.find((A) => A.name === b)) == null ? void 0 : L.default;
  };
  N(n.controls.duration ?? x("duration"));
  const v = N(n.controls.tick_dt ?? x("tick_dt")), g = N(o == null ? void 0 : o.tick_count) * v, p = /* @__PURE__ */ new Set(["duration", "tick_dt"]), h = a.filter((b) => p.has(b.name)), R = a.filter((b) => !p.has(b.name)), k = new Set(c), u = /* @__PURE__ */ new Map(), w = [];
  for (const b of R) {
    const L = b.name.indexOf(".");
    if (L > 0) {
      const A = b.name.slice(0, L);
      if (k.has(A)) {
        const P = u.get(A) || [];
        P.push(b), u.set(A, P);
        continue;
      }
    }
    w.push(b);
  }
  const E = Array.from(u.keys()), [z, I] = B({});
  ee(() => {
    E.length !== 0 && I((b) => {
      const L = { ...b };
      for (const A of E)
        A in L || (L[A] = !1);
      return L;
    });
  }, [E.join("|")]);
  const [q, T] = B(!1);
  return /* @__PURE__ */ i("div", { className: "controls", children: [
    h.length > 0 && /* @__PURE__ */ e("div", { className: "control-fields", children: h.map((b) => /* @__PURE__ */ i("div", { className: "control-field", children: [
      /* @__PURE__ */ e("label", { htmlFor: `control-${b.name}`, className: "control-label", children: b.label || b.name }),
      /* @__PURE__ */ e("input", { id: `control-${b.name}`, type: "number", className: "control-input", value: String(n.controls[b.name] ?? b.default), min: b.min, max: b.max, step: b.step ?? "any", onChange: (L) => S(b.name, L.target.value), disabled: !!(o != null && o.running) || !l })
    ] }, b.name)) }),
    u.size > 0 && /* @__PURE__ */ e("div", { className: "control-fields", children: Array.from(u.entries()).map(([b, L]) => /* @__PURE__ */ i("div", { className: "control-group", children: [
      /* @__PURE__ */ i(
        "button",
        {
          type: "button",
          className: "control-group-header",
          onClick: () => I((A) => ({ ...A, [b]: !A[b] })),
          "aria-expanded": z[b] ?? !1,
          children: [
            /* @__PURE__ */ e("span", { className: `control-group-chevron ${z[b] ? "open" : ""}`, "aria-hidden": "true", children: "▸" }),
            /* @__PURE__ */ e("span", { className: "control-group-title", children: b }),
            /* @__PURE__ */ i("span", { className: "control-group-summary", children: [
              L.length,
              " params"
            ] })
          ]
        }
      ),
      z[b] && /* @__PURE__ */ e("div", { className: "control-group-body", children: /* @__PURE__ */ e("div", { className: "control-fields", style: { marginTop: 0 }, children: L.map((A) => {
        const P = A.name.indexOf("."), Q = P > 0 ? A.name.slice(P + 1) : A.name;
        return /* @__PURE__ */ i("div", { className: "control-field", children: [
          /* @__PURE__ */ e("label", { htmlFor: `control-${A.name}`, className: "control-label", children: A.label || Q }),
          /* @__PURE__ */ e("input", { id: `control-${A.name}`, type: "number", className: "control-input", value: String(n.controls[A.name] ?? A.default), min: A.min, max: A.max, step: A.step ?? "any", onChange: (te) => S(A.name, te.target.value), disabled: !!(o != null && o.running) || !l })
        ] }, A.name);
      }) }) })
    ] }, b)) }),
    w.length > 0 && /* @__PURE__ */ e("div", { className: "control-fields", children: w.map((b) => /* @__PURE__ */ i("div", { className: "control-field", children: [
      /* @__PURE__ */ e("label", { htmlFor: `control-${b.name}`, className: "control-label", children: b.label || b.name }),
      /* @__PURE__ */ e("input", { id: `control-${b.name}`, type: "number", className: "control-input", value: String(n.controls[b.name] ?? b.default), min: b.min, max: b.max, step: b.step ?? "any", onChange: (L) => S(b.name, L.target.value), disabled: !!(o != null && o.running) || !l })
    ] }, b.name)) }),
    y.length > 0 && /* @__PURE__ */ i("div", { className: "control-group", children: [
      /* @__PURE__ */ i(
        "button",
        {
          type: "button",
          className: "control-group-header",
          onClick: () => T((b) => !b),
          "aria-expanded": q,
          children: [
            /* @__PURE__ */ e("span", { className: `control-group-chevron ${q ? "open" : ""}`, "aria-hidden": "true", children: "▸" }),
            /* @__PURE__ */ e("span", { className: "control-group-title", children: "Advanced (JSON)" }),
            /* @__PURE__ */ i("span", { className: "control-group-summary", children: [
              y.length,
              " fields"
            ] })
          ]
        }
      ),
      q && /* @__PURE__ */ e("div", { className: "control-group-body", children: /* @__PURE__ */ e("div", { className: "control-fields", children: y.map((b) => /* @__PURE__ */ i("div", { className: "control-field", children: [
        /* @__PURE__ */ e("label", { htmlFor: `control-${b.name}`, className: "control-label", children: b.label || b.name }),
        /* @__PURE__ */ e(
          "textarea",
          {
            id: `control-${b.name}`,
            className: "control-input",
            value: String(n.controls[b.name] ?? b.default),
            placeholder: b.placeholder,
            rows: b.rows ?? 6,
            onChange: (L) => S(b.name, L.target.value),
            disabled: !!(o != null && o.running) || !l
          }
        )
      ] }, b.name)) }) })
    ] }),
    /* @__PURE__ */ e("div", { className: "control-derived", children: (o == null ? void 0 : o.running) && Number.isFinite(g) && /* @__PURE__ */ i("div", { className: "control-derived-row", children: [
      /* @__PURE__ */ e("span", { className: "control-derived-label", children: "Sim time" }),
      /* @__PURE__ */ e("span", { className: "control-derived-value", children: nt(g) })
    ] }) })
  ] });
}
function wt() {
  const { state: n, actions: t } = re(), o = Ae();
  ee(() => {
    o.length > 0 && n.visibleModules.size === 0 && t.setVisibleModules(new Set(o));
  }, [o, n.visibleModules.size, t]);
  const s = W((a) => {
    const d = new Set(n.visibleModules);
    d.has(a) ? d.delete(a) : d.add(a), t.setVisibleModules(d);
  }, [n.visibleModules, t]), l = W(() => t.setVisibleModules(new Set(o)), [o, t]), c = W(() => t.setVisibleModules(/* @__PURE__ */ new Set()), [t]);
  return o.length === 0 ? /* @__PURE__ */ e("div", { className: "modules", children: /* @__PURE__ */ e("div", { className: "empty-state", children: /* @__PURE__ */ e("p", { children: "No modules available" }) }) }) : /* @__PURE__ */ i("div", { className: "modules", children: [
    /* @__PURE__ */ e("div", { className: "module-list", children: o.map((a) => /* @__PURE__ */ i("label", { className: "module-item", children: [
      /* @__PURE__ */ e("input", { type: "checkbox", className: "module-checkbox", checked: n.visibleModules.has(a), onChange: () => s(a) }),
      /* @__PURE__ */ e("span", { className: "module-name", children: a })
    ] }, a)) }),
    /* @__PURE__ */ i("div", { className: "module-actions", children: [
      /* @__PURE__ */ e("button", { type: "button", className: "btn btn-small", onClick: l, children: "Show All" }),
      /* @__PURE__ */ e("button", { type: "button", className: "btn btn-small", onClick: c, children: "Hide All" })
    ] })
  ] });
}
function Nt(n) {
  const { state: t } = re(), s = Ae().length, l = t.visibleModules.size || s, [c, a] = B({
    controls: !1,
    status: !1,
    modules: !1
  }), d = W((x) => {
    a((v) => ({ ...v, [x]: !v[x] }));
  }, []), y = j(() => {
    var v;
    const x = t.status;
    return x ? x.error ? "Error" : x.running ? `${x.paused ? "Paused" : "Running"} · Ticks: ${((v = x.tick_count) == null ? void 0 : v.toLocaleString()) || 0}` : "Idle" : "Unknown";
  }, [t.status]), S = j(() => {
    var g;
    const v = (Array.isArray((g = t.spec) == null ? void 0 : g.controls) ? t.spec.controls : []).filter((p) => xe(p) || pe(p)).length;
    return v ? `${v} controls` : "No controls";
  }, [t.spec]), N = j(() => s === 0 ? "No modules" : `${l}/${s} shown`, [l, s]);
  return /* @__PURE__ */ e("div", { className: "sidebar", children: /* @__PURE__ */ i("div", { className: "sidebar-content", children: [
    /* @__PURE__ */ e(Oe, { id: "status", title: "Status", summary: y, open: c.status, onToggle: d, children: /* @__PURE__ */ e(vt, {}) }),
    /* @__PURE__ */ e(Oe, { id: "controls", title: "Controls", summary: S, open: c.controls, onToggle: d, children: /* @__PURE__ */ e(xt, {}) }),
    /* @__PURE__ */ e(Oe, { id: "modules", title: "Modules", summary: N, open: c.modules, onToggle: d, children: /* @__PURE__ */ e(wt, {}) }),
    /* @__PURE__ */ e(St, { ...n })
  ] }) });
}
function St({ onRun: n, onPause: t, onResume: o, onReset: s }) {
  var h, R;
  const { state: l } = re(), c = l.status, d = (Array.isArray((h = l.spec) == null ? void 0 : h.controls) ? l.spec.controls : []).find((k) => xe(k) && k.name === "duration"), y = d && xe(d) ? d.default : void 0, S = (() => {
    const k = l.controls.duration ?? y, u = typeof k == "number" ? k : Number(String(k));
    return Number.isFinite(u) ? u : NaN;
  })(), N = (R = l.spec) == null ? void 0 : R.capabilities, x = (N == null ? void 0 : N.controls) ?? !0, v = x && ((N == null ? void 0 : N.run) ?? !0), g = x && ((N == null ? void 0 : N.pauseResume) ?? !0), p = x && ((N == null ? void 0 : N.reset) ?? !0);
  return /* @__PURE__ */ i("div", { className: "sidebar-actions", children: [
    /* @__PURE__ */ i("div", { className: "sidebar-actions-row", children: [
      /* @__PURE__ */ e("div", { className: "sidebar-actions-label", children: "Duration" }),
      /* @__PURE__ */ e("div", { className: "sidebar-actions-value", children: Number.isFinite(S) ? nt(S) : "—" })
    ] }),
    v && /* @__PURE__ */ e("button", { type: "button", className: "btn btn-primary", onClick: n, disabled: !!(c != null && c.running), children: "Run Simulation" }),
    g && (c == null ? void 0 : c.running) && /* @__PURE__ */ e("button", { type: "button", className: "btn btn-secondary", onClick: c.paused ? o : t, children: c.paused ? "Resume" : "Pause" }),
    p && /* @__PURE__ */ e("button", { type: "button", className: "btn btn-outline", onClick: s, children: "Reset" })
  ] });
}
function Ct({ data: n, isFullscreen: t }) {
  const y = (n == null ? void 0 : n.series) || [], { xMin: S, xMax: N, yMin: x, yMax: v } = j(() => {
    let u = 0, w = 1, E = 0, z = 1;
    for (const I of y) {
      const q = Array.isArray(I == null ? void 0 : I.points) ? I.points : [];
      for (const T of q) {
        const M = Number(T == null ? void 0 : T[0]) || 0, C = Number(T == null ? void 0 : T[1]) || 0;
        M < u && (u = M), M > w && (w = M), C < E && (E = C), C > z && (z = C);
      }
    }
    return {
      xMin: u,
      xMax: w <= u ? u + 1 : w,
      yMin: E,
      yMax: z <= E ? E + 1 : z
    };
  }, [y]), g = (u) => 50 + (u - S) / (N - S) * 450, p = (u) => 20 + (1 - (u - x) / (v - x)) * 180, h = (u) => (u.points || []).map((w) => `${g(w[0])},${p(w[1])}`).join(" "), R = (u, w, E = 5) => Array.from({ length: E + 1 }, (z, I) => u + I * (w - u) / E);
  return /* @__PURE__ */ e("div", { style: t ? { width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" } : {}, className: t ? "fullscreen-renderer" : "", children: /* @__PURE__ */ i("svg", { viewBox: "0 0 520 240", width: "100%", height: t ? "100%" : 240, preserveAspectRatio: t ? "xMidYMid meet" : void 0, children: [
    /* @__PURE__ */ e("line", { x1: 50, y1: 200, x2: 500, y2: 200, className: "axis" }),
    /* @__PURE__ */ e("line", { x1: 50, y1: 20, x2: 50, y2: 200, className: "axis" }),
    R(S, N, 5).map((u) => /* @__PURE__ */ i("g", { children: [
      /* @__PURE__ */ e("line", { x1: g(u), y1: 200, x2: g(u), y2: 204, className: "tick" }),
      /* @__PURE__ */ e("text", { x: g(u), y: 234, className: "ticklbl", textAnchor: "middle", children: u.toFixed(2) })
    ] }, `tx-${u}`)),
    R(x, v, 4).map((u) => /* @__PURE__ */ i("g", { children: [
      /* @__PURE__ */ e("line", { x1: 46, y1: p(u), x2: 50, y2: p(u), className: "tick" }),
      /* @__PURE__ */ e("text", { x: 44, y: p(u) + 3, className: "ticklbl", textAnchor: "end", children: u.toFixed(2) })
    ] }, `ty-${u}`)),
    y.map((u, w) => /* @__PURE__ */ e("polyline", { points: h(u), fill: "none", stroke: w === 0 ? "var(--primary)" : w === 1 ? "var(--danger)" : "var(--accent)", strokeWidth: 2 }, w))
  ] }) });
}
function kt({ data: n, isFullscreen: t }) {
  const y = (n == null ? void 0 : n.items) || [], S = j(() => {
    let h = 1;
    for (const R of y) {
      const k = Number((R == null ? void 0 : R.value) || 0);
      Number.isFinite(k) && k > h && (h = k);
    }
    return h;
  }, [y]), N = (h, R) => 50 + (h + 0.5) * 450 / Math.max(1, R), x = (h) => Math.max(8, 0.8 * 450 / Math.max(1, h)), v = (h) => 20 + (1 - Math.min(1, Math.max(0, h / S))) * 180;
  return /* @__PURE__ */ e("div", { style: t ? { width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" } : {}, children: /* @__PURE__ */ i("svg", { viewBox: "0 0 520 240", width: "100%", height: t ? "100%" : 240, preserveAspectRatio: t ? "xMidYMid meet" : void 0, children: [
    /* @__PURE__ */ e("line", { x1: 50, y1: 200, x2: 500, y2: 200, className: "axis" }),
    /* @__PURE__ */ e("line", { x1: 50, y1: 20, x2: 50, y2: 200, className: "axis" }),
    ((h = 4) => Array.from({ length: h + 1 }, (R, k) => k * S / h))(4).map((h) => /* @__PURE__ */ i("g", { children: [
      /* @__PURE__ */ e("line", { x1: 46, y1: v(h), x2: 50, y2: v(h), className: "tick" }),
      /* @__PURE__ */ e("text", { x: 44, y: v(h) + 3, className: "ticklbl", textAnchor: "end", children: h.toFixed(0) })
    ] }, `ty-${h}`)),
    y.map((h, R) => /* @__PURE__ */ i("g", { children: [
      /* @__PURE__ */ e("rect", { x: N(R, y.length) - x(y.length) / 2, y: v(h.value), width: x(y.length), height: 200 - v(h.value), className: "bar" }),
      /* @__PURE__ */ e("text", { x: N(R, y.length), y: 234, className: "xlbl", textAnchor: "middle", children: h.label })
    ] }, R))
  ] }) });
}
function Mt({ data: n, isFullscreen: t }) {
  var y, S, N, x;
  const o = (y = n.columns) != null && y.length ? n.columns : (S = n.items) != null && S.length ? Object.keys(n.items[0]) : [], s = (N = n.rows) != null && N.length ? n.rows : ((x = n.items) == null ? void 0 : x.map((v) => o.map((g) => v[g]))) || [], l = t ? { width: "100%", height: "100%", overflow: "auto" } : { overflow: "auto" }, c = t ? { width: "100%", borderCollapse: "collapse", fontSize: "16px" } : { width: "100%", borderCollapse: "collapse" }, a = t ? { textAlign: "left", borderBottom: "1px solid var(--border)", padding: "12px 16px", fontWeight: 600, fontSize: "18px" } : { textAlign: "left", borderBottom: "1px solid var(--border)", padding: 8, fontWeight: 600 }, d = t ? { borderBottom: "1px solid var(--border)", padding: "10px 16px", fontSize: "16px" } : { borderBottom: "1px solid var(--border)", padding: "6px 8px" };
  return /* @__PURE__ */ i("div", { className: "table-container", style: l, children: [
    /* @__PURE__ */ i("table", { style: c, children: [
      /* @__PURE__ */ e("thead", { children: /* @__PURE__ */ e("tr", { children: o.map((v) => /* @__PURE__ */ e("th", { style: a, children: v }, v)) }) }),
      /* @__PURE__ */ e("tbody", { children: s.map((v, g) => /* @__PURE__ */ e("tr", { children: v.map((p, h) => /* @__PURE__ */ e("td", { style: d, children: String(p) }, h)) }, g)) })
    ] }),
    (!o || o.length === 0) && /* @__PURE__ */ e("div", { className: "empty", children: "No table data" })
  ] });
}
function $t({ data: n, isFullscreen: t }) {
  if (!(n != null && n.src)) return /* @__PURE__ */ e("div", { className: "empty-state", children: /* @__PURE__ */ e("p", { children: "No image" }) });
  const { src: o, alt: s, width: l, height: c } = n;
  return t ? /* @__PURE__ */ e("div", { style: { width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", overflow: "auto" }, children: /* @__PURE__ */ e(
    "img",
    {
      src: o,
      alt: s || "image",
      style: { maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }
    }
  ) }) : /* @__PURE__ */ e("div", { style: { overflow: "auto" }, children: /* @__PURE__ */ e("img", { src: o, alt: s || "image", width: l, height: c, style: { maxWidth: "100%" } }) });
}
function At({ data: n, isFullscreen: t }) {
  const o = n.nodes || [], s = n.edges || [], l = 520, c = 300, a = 110, d = l / 2, y = c / 2, S = j(() => {
    const x = Math.max(1, o.length), v = /* @__PURE__ */ new Map();
    return o.forEach((g, p) => {
      const h = 2 * Math.PI * p / x;
      v.set(g.id, { x: d + a * Math.cos(h), y: y + a * Math.sin(h) });
    }), v;
  }, [JSON.stringify(o)]);
  return /* @__PURE__ */ e("div", { style: t ? { width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" } : {}, children: /* @__PURE__ */ i("svg", { viewBox: `0 0 ${l} ${c}`, width: "100%", height: t ? "100%" : c, preserveAspectRatio: t ? "xMidYMid meet" : void 0, children: [
    s.map((x, v) => {
      const g = S.get(x.source), p = S.get(x.target);
      return !g || !p ? null : /* @__PURE__ */ e("line", { x1: g.x, y1: g.y, x2: p.x, y2: p.y, stroke: "#64748b", strokeWidth: 1 }, v);
    }),
    o.map((x, v) => {
      const g = S.get(x.id);
      return g ? /* @__PURE__ */ i("g", { children: [
        /* @__PURE__ */ e("circle", { cx: g.x, cy: g.y, r: 14, fill: "#22d3ee" }),
        /* @__PURE__ */ e("text", { x: g.x, y: g.y + 4, fontSize: 10, textAnchor: "middle", fill: "#0f172a", children: x.id })
      ] }, x.id) : null;
    })
  ] }) });
}
const Rt = {
  timeseries: Ct,
  bar: kt,
  table: Mt,
  image: $t,
  graph: At
};
function Et({ isFullscreen: n, onClick: t }) {
  return /* @__PURE__ */ e("button", { className: "btn btn-small btn-outline fullscreen-btn", onClick: t, title: n ? "Exit fullscreen" : "Fullscreen", children: n ? /* @__PURE__ */ e("svg", { width: "14", height: "14", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", children: /* @__PURE__ */ e("path", { d: "M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3" }) }) : /* @__PURE__ */ e("svg", { width: "14", height: "14", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", children: /* @__PURE__ */ e("path", { d: "M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" }) }) });
}
function Tt({ isActive: n, onClick: t }) {
  return /* @__PURE__ */ e(
    "button",
    {
      className: `btn btn-small btn-outline info-btn ${n ? "active" : ""}`,
      onClick: t,
      title: n ? "Hide description" : "Show description",
      children: /* @__PURE__ */ i("svg", { width: "14", height: "14", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", children: [
        /* @__PURE__ */ e("circle", { cx: "12", cy: "12", r: "10" }),
        /* @__PURE__ */ e("path", { d: "M12 16v-4" }),
        /* @__PURE__ */ e("path", { d: "M12 8h.01" })
      ] })
    }
  );
}
function Lt({ visual: n, index: t }) {
  var g;
  const [o, s] = B(!1), [l, c] = B(!1), a = Rt[n.render], d = W(() => {
    s((p) => !p);
  }, []), y = W(() => {
    c((p) => !p);
  }, []), S = W((p) => {
    p.key === "Escape" && o && s(!1);
  }, [o]);
  if (!a)
    return /* @__PURE__ */ i("div", { className: "visualization-card error", children: [
      /* @__PURE__ */ i("div", { className: "card-header", children: [
        /* @__PURE__ */ e("h4", { className: "card-title", children: "Unknown Renderer" }),
        /* @__PURE__ */ e("span", { className: "card-type error", children: n.render })
      ] }),
      /* @__PURE__ */ e("div", { className: "card-content", children: /* @__PURE__ */ e("div", { className: "error-message", children: /* @__PURE__ */ i("p", { children: [
        'Renderer type "',
        n.render,
        '" is not supported.'
      ] }) }) })
    ] });
  const N = ((g = n.data) == null ? void 0 : g.title) || `${n.render.charAt(0).toUpperCase() + n.render.slice(1)} #${t + 1}`, x = !!n.description, v = /* @__PURE__ */ i(ce, { children: [
    /* @__PURE__ */ i("div", { className: "card-header", children: [
      /* @__PURE__ */ e("h4", { className: "card-title", children: N }),
      /* @__PURE__ */ i("div", { className: "card-actions", children: [
        /* @__PURE__ */ e("span", { className: "card-type", children: n.render }),
        x && /* @__PURE__ */ e(Tt, { isActive: l, onClick: y }),
        /* @__PURE__ */ e(Et, { isFullscreen: o, onClick: d })
      ] })
    ] }),
    l && n.description && /* @__PURE__ */ e("div", { className: "card-description", children: n.description }),
    /* @__PURE__ */ e("div", { className: "card-content", children: /* @__PURE__ */ e(a, { data: n.data, isFullscreen: o }) })
  ] });
  return o ? /* @__PURE__ */ i(ce, { children: [
    /* @__PURE__ */ e("div", { className: "visualization-card placeholder" }),
    /* @__PURE__ */ e("div", { className: "fullscreen-overlay", onClick: d, onKeyDown: S, tabIndex: 0, children: /* @__PURE__ */ e("div", { className: "fullscreen-card", onClick: (p) => p.stopPropagation(), children: v }) })
  ] }) : /* @__PURE__ */ e("div", { className: "visualization-card", children: v });
}
function Fe({ moduleName: n, visualCount: t }) {
  return /* @__PURE__ */ e("header", { className: "module-header", children: /* @__PURE__ */ i("div", { className: "module-info", children: [
    /* @__PURE__ */ e("h3", { className: "module-title", children: n }),
    /* @__PURE__ */ i("span", { className: "module-meta", children: [
      t,
      " visualization",
      t !== 1 ? "s" : ""
    ] })
  ] }) });
}
function zt({ moduleName: n, visuals: t }) {
  return !t || t.length === 0 ? /* @__PURE__ */ i("div", { className: "module-visuals", children: [
    /* @__PURE__ */ e(Fe, { moduleName: n, visualCount: 0 }),
    /* @__PURE__ */ e("div", { className: "empty-state", children: /* @__PURE__ */ e("p", { children: "No visualizations available for this module" }) })
  ] }) : /* @__PURE__ */ i("div", { className: "module-visuals", children: [
    /* @__PURE__ */ e(Fe, { moduleName: n, visualCount: t.length }),
    /* @__PURE__ */ e("div", { className: "visualizations-grid", children: t.map((o, s) => /* @__PURE__ */ e(Lt, { visual: o, index: s }, `${n}-${o.render}-${s}`)) })
  ] });
}
const Dt = qe(zt);
function He({ description: n }) {
  const [t, o] = B(!1);
  if (!n) return null;
  const s = n.length > 300 || n.split(`
`).length > 5;
  return /* @__PURE__ */ i("div", { className: `description-panel ${t ? "expanded" : "collapsed"}`, children: [
    /* @__PURE__ */ i("div", { className: "description-header", onClick: () => s && o(!t), children: [
      /* @__PURE__ */ i("div", { className: "description-title", children: [
        /* @__PURE__ */ i("svg", { width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", children: [
          /* @__PURE__ */ e("path", { d: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" }),
          /* @__PURE__ */ e("polyline", { points: "14 2 14 8 20 8" }),
          /* @__PURE__ */ e("line", { x1: "16", y1: "13", x2: "8", y2: "13" }),
          /* @__PURE__ */ e("line", { x1: "16", y1: "17", x2: "8", y2: "17" }),
          /* @__PURE__ */ e("polyline", { points: "10 9 9 9 8 9" })
        ] }),
        /* @__PURE__ */ e("span", { children: "About this Simulation" })
      ] }),
      s && /* @__PURE__ */ i("button", { className: "expand-btn", onClick: (l) => {
        l.stopPropagation(), o(!t);
      }, children: [
        t ? /* @__PURE__ */ e("svg", { width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", children: /* @__PURE__ */ e("polyline", { points: "18 15 12 9 6 15" }) }) : /* @__PURE__ */ e("svg", { width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", children: /* @__PURE__ */ e("polyline", { points: "6 9 12 15 18 9" }) }),
        /* @__PURE__ */ e("span", { children: t ? "Collapse" : "Expand" })
      ] })
    ] }),
    /* @__PURE__ */ e("div", { className: "description-content", children: /* @__PURE__ */ e(rt, { remarkPlugins: [it], children: n }) })
  ] });
}
const ve = "__new__";
function $e(n) {
  const t = n.indexOf(".");
  return t <= 0 || t >= n.length - 1 ? null : { module: n.slice(0, t), port: n.slice(t + 1) };
}
function ot(n) {
  if (!Array.isArray(n)) throw new Error("Wiring must be a JSON array.");
  return n.filter((t) => t && typeof t == "object");
}
function Bt(n, t, o, s, l) {
  const c = /* @__PURE__ */ new Map(), a = /* @__PURE__ */ new Map(), d = /* @__PURE__ */ new Set([...t, ...Object.keys(o || {})]);
  for (const [g, p] of Object.entries(o || {})) {
    c.has(g) || c.set(g, /* @__PURE__ */ new Set()), a.has(g) || a.set(g, /* @__PURE__ */ new Set());
    for (const h of p.outputs || []) c.get(g).add(String(h));
    for (const h of p.inputs || []) a.get(g).add(String(h));
  }
  const y = [];
  let S = 0;
  for (const g of n) {
    const p = typeof g.from == "string" ? g.from : "", h = g.to ?? g.targets, R = typeof h == "string" ? [h] : Array.isArray(h) ? h : [], k = $e(p);
    if (k) {
      d.add(k.module), c.has(k.module) || c.set(k.module, /* @__PURE__ */ new Set()), c.get(k.module).add(k.port);
      for (const u of R) {
        if (typeof u != "string") continue;
        const w = $e(u);
        w && (d.add(w.module), a.has(w.module) || a.set(w.module, /* @__PURE__ */ new Set()), a.get(w.module).add(w.port), S += 1, y.push({
          id: `w-${S}-${p}->${u}`,
          source: k.module,
          sourceHandle: k.port,
          target: w.module,
          targetHandle: w.port,
          type: "smoothstep",
          style: { stroke: "#6b7280", strokeWidth: 2 }
        }));
      }
    }
  }
  for (const g of s) d.delete(g);
  const N = new Map(l.map((g) => [g.id, g])), x = Array.from(d).map((g) => {
    const p = N.get(g), h = Array.from(a.get(g) ?? []).sort(), R = Array.from(c.get(g) ?? []).sort();
    return {
      id: g,
      type: "wiringNode",
      position: (p == null ? void 0 : p.position) ?? { x: 0, y: 0 },
      data: { label: g, inputs: h, outputs: R }
    };
  }), v = x.length > 0 && x.every((g) => g.position.x === 0 && g.position.y === 0);
  return { nodes: x, edges: y, needsLayout: v };
}
function Je(n, t) {
  const o = new Me.graphlib.Graph();
  o.setDefaultEdgeLabel(() => ({}));
  const s = 220, l = 140;
  o.setGraph({ rankdir: "LR", nodesep: 40, ranksep: 80 });
  for (const c of n)
    o.setNode(c.id, { width: s, height: l });
  for (const c of t)
    o.setEdge(c.source, c.target);
  return Me.layout(o), n.map((c) => {
    const a = o.node(c.id);
    return {
      ...c,
      position: {
        x: a.x - s / 2,
        y: a.y - l / 2
      }
    };
  });
}
function _t(n) {
  const t = ot(n), o = [];
  let s = 0;
  for (const l of t) {
    const c = typeof l.from == "string" ? l.from : "", a = l.to ?? l.targets, d = typeof a == "string" ? [a] : Array.isArray(a) ? a : [], y = $e(c);
    if (y)
      for (const S of d) {
        if (typeof S != "string") continue;
        const N = $e(S);
        N && (s += 1, o.push({
          id: `w-${s}-${c}->${S}`,
          source: y.module,
          sourceHandle: y.port,
          target: N.module,
          targetHandle: N.port,
          type: "smoothstep",
          style: { stroke: "#6b7280", strokeWidth: 2 }
        }));
      }
  }
  return o;
}
function Ve(n) {
  const t = /* @__PURE__ */ new Map();
  for (const o of n) {
    if (!o.sourceHandle || !o.targetHandle) continue;
    const s = `${o.source}.${o.sourceHandle}`, l = `${o.target}.${o.targetHandle}`;
    t.has(s) || t.set(s, /* @__PURE__ */ new Set()), t.get(s).add(l);
  }
  return Array.from(t.entries()).sort(([o], [s]) => o.localeCompare(s)).map(([o, s]) => ({ from: o, to: Array.from(s).sort() }));
}
const Wt = ({ data: n, selected: t }) => /* @__PURE__ */ i(
  "div",
  {
    style: {
      background: "var(--surface-2)",
      border: `1px solid ${t ? "var(--warning)" : "var(--border)"}`,
      borderRadius: 10,
      minWidth: 200,
      boxShadow: t ? "0 0 0 2px rgba(234, 179, 8, 0.3)" : "var(--shadow)",
      overflow: "hidden",
      fontFamily: "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif"
    },
    children: [
      /* @__PURE__ */ e(
        "div",
        {
          style: {
            padding: "10px 12px",
            background: "var(--surface)",
            borderBottom: "1px solid var(--border)",
            fontWeight: 700,
            fontSize: 13,
            color: "var(--text)"
          },
          children: n.label
        }
      ),
      /* @__PURE__ */ i("div", { style: { display: "flex", justifyContent: "space-between", gap: 10, padding: "10px 8px 12px 8px" }, children: [
        /* @__PURE__ */ i("div", { style: { display: "flex", flexDirection: "column", gap: 6 }, children: [
          /* @__PURE__ */ e("div", { style: { paddingLeft: 6, fontSize: 11, color: "var(--muted)", fontWeight: 600 }, children: "Inputs" }),
          n.inputs.length === 0 ? /* @__PURE__ */ e("div", { style: { paddingLeft: 6, fontSize: 11, color: "var(--muted)", fontStyle: "italic" }, children: "none" }) : n.inputs.map((s) => /* @__PURE__ */ i("div", { style: { position: "relative", paddingLeft: 18 }, children: [
            /* @__PURE__ */ e(
              ye,
              {
                type: "target",
                position: be.Left,
                id: s,
                style: {
                  width: 10,
                  height: 10,
                  left: -5,
                  background: "#6b7280",
                  border: "2px solid var(--surface-2)"
                }
              }
            ),
            /* @__PURE__ */ e("span", { style: { fontSize: 12, color: "var(--text)", whiteSpace: "nowrap" }, children: s })
          ] }, s)),
          /* @__PURE__ */ i("div", { style: { position: "relative", paddingLeft: 18, opacity: 0.85 }, children: [
            /* @__PURE__ */ e(
              ye,
              {
                type: "target",
                position: be.Left,
                id: ve,
                style: {
                  width: 10,
                  height: 10,
                  left: -5,
                  background: "var(--warning)",
                  border: "2px solid var(--surface-2)"
                }
              }
            ),
            /* @__PURE__ */ e("span", { style: { fontSize: 12, color: "var(--muted)", whiteSpace: "nowrap" }, children: "+ add" })
          ] })
        ] }),
        /* @__PURE__ */ i("div", { style: { display: "flex", flexDirection: "column", gap: 6, alignItems: "flex-end" }, children: [
          /* @__PURE__ */ e("div", { style: { paddingRight: 6, fontSize: 11, color: "var(--muted)", fontWeight: 600 }, children: "Outputs" }),
          n.outputs.length === 0 ? /* @__PURE__ */ e("div", { style: { paddingRight: 6, fontSize: 11, color: "var(--muted)", fontStyle: "italic" }, children: "none" }) : n.outputs.map((s) => /* @__PURE__ */ i("div", { style: { position: "relative", paddingRight: 18 }, children: [
            /* @__PURE__ */ e("span", { style: { fontSize: 12, color: "var(--text)", whiteSpace: "nowrap" }, children: s }),
            /* @__PURE__ */ e(
              ye,
              {
                type: "source",
                position: be.Right,
                id: s,
                style: {
                  width: 10,
                  height: 10,
                  right: -5,
                  background: "var(--primary)",
                  border: "2px solid var(--surface-2)"
                }
              }
            )
          ] }, s)),
          /* @__PURE__ */ i("div", { style: { position: "relative", paddingRight: 18, opacity: 0.85 }, children: [
            /* @__PURE__ */ e("span", { style: { fontSize: 12, color: "var(--muted)", whiteSpace: "nowrap" }, children: "+ add" }),
            /* @__PURE__ */ e(
              ye,
              {
                type: "source",
                position: be.Right,
                id: ve,
                style: {
                  width: 10,
                  height: 10,
                  right: -5,
                  background: "var(--warning)",
                  border: "2px solid var(--surface-2)"
                }
              }
            )
          ] })
        ] })
      ] })
    ]
  }
);
function Ot() {
  var _, H, F, ne;
  const n = Ne(), { state: t, actions: o } = re(), s = j(() => {
    var m;
    return (((m = t.spec) == null ? void 0 : m.controls) ?? []).find((f) => pe(f) && f.name === "wiring");
  }, [t.spec]), l = j(() => {
    var m;
    return (((m = t.spec) == null ? void 0 : m.controls) ?? []).find((f) => pe(f) && f.name === "wiring_layout");
  }, [t.spec]), c = j(() => {
    var m;
    return (((m = t.spec) == null ? void 0 : m.controls) ?? []).find((f) => pe(f) && f.name === "module_ports");
  }, [t.spec]), a = j(() => {
    var m;
    return (((m = t.spec) == null ? void 0 : m.controls) ?? []).find((f) => pe(f) && f.name === "models");
  }, [t.spec]), [d, y] = B(!1), [S, N] = B(null), [x, v] = B(!1), [g, p] = B(""), [h, R] = B(null), k = ae(""), u = ae(""), w = !!((_ = t.status) != null && _.running), [E, z] = B("simui:wiring:default");
  ee(() => {
    let r = !0;
    return (async () => {
      var f, D, O;
      try {
        const J = await n.state();
        if (!r) return;
        const G = (f = J == null ? void 0 : J.run) == null ? void 0 : f.id;
        if (typeof G == "string" && G) {
          z(`simui:wiring:run:${G}`);
          return;
        }
        const K = J == null ? void 0 : J.target, X = K == null ? void 0 : K.spaceId, le = K == null ? void 0 : K.spaceCommit;
        if (typeof X == "string" && X) {
          z(`simui:wiring:draft:space:${X}:${le || "head"}`);
          return;
        }
        const se = K == null ? void 0 : K.modelId, ke = K == null ? void 0 : K.modelCommit;
        if (typeof se == "string" && se) {
          z(`simui:wiring:draft:model:${se}:${ke || "head"}`);
          return;
        }
        const ue = ((D = t.spec) == null ? void 0 : D.title) || "default";
        z(`simui:wiring:title:${ue}`);
      } catch {
        const J = ((O = t.spec) == null ? void 0 : O.title) || "default";
        z(`simui:wiring:title:${J}`);
      }
    })(), () => {
      r = !1;
    };
  }, [n, (H = t.spec) == null ? void 0 : H.title]);
  const I = j(() => {
    if (!s) return null;
    const r = t.controls.wiring;
    return r === void 0 ? String(s.default ?? "[]") : typeof r == "string" ? r : String(r);
  }, [t.controls.wiring, s]), q = j(() => {
    if (!l) return null;
    const r = t.controls.wiring_layout;
    return r === void 0 ? String(l.default ?? '{"version":1,"nodes":{},"hidden_modules":[]}') : typeof r == "string" ? r : String(r);
  }, [t.controls.wiring_layout, l]), T = j(() => {
    if (!c) return null;
    const r = t.controls.module_ports;
    return r === void 0 ? String(c.default ?? "{}") : typeof r == "string" ? r : String(r);
  }, [t.controls.module_ports, c]), M = j(() => {
    if (!a) return null;
    const r = t.controls.models;
    return r === void 0 ? String(a.default ?? "[]") : typeof r == "string" ? r : String(r);
  }, [t.controls.models, a]), C = j(() => {
    if (!T) return {};
    try {
      const r = JSON.parse(T);
      return !r || typeof r != "object" || Array.isArray(r) ? {} : r;
    } catch {
      return {};
    }
  }, [T]), V = ae(null);
  ee(() => {
    if (!a || V.current) return;
    const r = String(a.default ?? "[]");
    try {
      const m = JSON.parse(r);
      if (!Array.isArray(m)) return;
      const f = /* @__PURE__ */ new Map();
      m.forEach((D, O) => {
        if (!D || typeof D != "object") return;
        const J = String(D.alias ?? D.repo_full_name ?? D.repo ?? `module-${O + 1}`);
        J && f.set(J, D);
      }), V.current = f;
    } catch {
    }
  }, [a]);
  const b = j(() => {
    const r = /* @__PURE__ */ new Map();
    if (!M) return r;
    try {
      const m = JSON.parse(M);
      if (!Array.isArray(m)) return r;
      m.forEach((f, D) => {
        if (!f || typeof f != "object") return;
        const O = String(f.alias ?? f.repo_full_name ?? f.repo ?? `module-${D + 1}`);
        O && r.set(O, f);
      });
    } catch {
    }
    return r;
  }, [M]), L = j(() => {
    if (!a) return null;
    const r = V.current;
    return r ? Array.from(r.keys()).sort((m, f) => m.localeCompare(f)) : null;
  }, [a]), A = j(() => {
    const r = { version: 1, nodes: {}, hidden_modules: [] };
    if (!q) return r;
    try {
      const m = JSON.parse(q);
      if (!m || typeof m != "object" || Array.isArray(m)) return r;
      const f = m.nodes, D = m.hidden_modules;
      return {
        version: typeof m.version == "number" ? m.version : 1,
        nodes: f && typeof f == "object" && !Array.isArray(f) ? f : {},
        hidden_modules: Array.isArray(D) ? D.map(String) : []
      };
    } catch {
      return r;
    }
  }, [q]);
  ee(() => {
    if (!s) return;
    const r = {};
    if (t.controls.wiring === void 0) {
      const m = (() => {
        try {
          const f = localStorage.getItem(E);
          if (!f) return null;
          const D = JSON.parse(f);
          return !D || typeof D.wiring != "string" ? null : D.wiring;
        } catch {
          return null;
        }
      })();
      r.wiring = m ?? String(s.default ?? "[]");
    }
    l && t.controls.wiring_layout === void 0 && (r.wiring_layout = String(l.default ?? '{"version":1,"nodes":{},"hidden_modules":[]}')), c && t.controls.module_ports === void 0 && (r.module_ports = String(c.default ?? "{}")), a && t.controls.models === void 0 && (r.models = String(a.default ?? "[]")), Object.keys(r).length > 0 && o.setControls(r);
  }, [o, a, c, t.controls, E, s, l]);
  const [P, Q] = B([]), [te, U] = B([]), fe = j(() => ({ wiringNode: Wt }), []), Z = W((r) => {
    if (l)
      o.setControls({ wiring_layout: JSON.stringify(r, null, 2) });
    else
      try {
        localStorage.setItem(`${E}:layout`, JSON.stringify(r));
      } catch {
      }
  }, [o, E, l]), Y = W(() => {
    const r = { version: 1, nodes: {}, hidden_modules: [] };
    if (l) return A;
    try {
      const m = localStorage.getItem(`${E}:layout`);
      if (!m) return r;
      const f = JSON.parse(m);
      return !f || typeof f != "object" || Array.isArray(f) ? r : {
        version: typeof f.version == "number" ? f.version : 1,
        nodes: f.nodes && typeof f.nodes == "object" ? f.nodes : {},
        hidden_modules: Array.isArray(f.hidden_modules) ? f.hidden_modules.map(String) : []
      };
    } catch {
      return r;
    }
  }, [A, E, l]), he = j(
    () => l ? A : Y(),
    [A, Y, l]
  ), de = j(() => new Set(he.hidden_modules || []), [he.hidden_modules]), we = W((r) => {
    a && o.setControls({ models: JSON.stringify(r, null, 2) });
  }, [o, a]);
  ee(() => {
    if (!I) return;
    const r = `${I}@@${q ?? ""}@@${T ?? ""}`;
    if (r !== u.current) {
      u.current = r;
      try {
        const m = JSON.parse(I), f = ot(m);
        N(null), Q((D) => {
          var ke;
          const O = Y(), { nodes: J, edges: G, needsLayout: K } = Bt(
            f,
            Array.isArray((ke = t.spec) == null ? void 0 : ke.modules) ? t.spec.modules.map(String) : [],
            C,
            new Set(O.hidden_modules || []),
            D
          ), X = J.map((ue) => {
            const me = (O.nodes || {})[ue.id];
            return me ? { ...ue, position: { x: me.x, y: me.y } } : ue;
          });
          U(G);
          const le = K && Object.keys(O.nodes || {}).length === 0, se = le ? Je(X, G) : X;
          if (le) {
            const ue = {};
            for (const me of se) ue[me.id] = { x: me.position.x, y: me.position.y };
            Z({ ...O, nodes: ue, hidden_modules: O.hidden_modules || [], version: 1 });
          }
          return se;
        }), x || p(I);
      } catch (m) {
        const f = m instanceof Error ? m.message : String(m);
        N(f), p(I);
      }
    }
  }, [T, C, Y, x, t.spec, Z, q, I]);
  const ie = W((r) => {
    const m = Ve(r), f = JSON.stringify(m, null, 2);
    k.current = f, o.setControls({ wiring: f }), p(f), N(null);
    try {
      localStorage.setItem(E, JSON.stringify({ wiring: f, updatedAt: Date.now() }));
    } catch {
    }
  }, [o, E]), ge = W((r, m, f) => {
    if (Q((D) => D.map((O) => {
      if (O.id !== r) return O;
      const J = O.data, G = m === "input" ? "inputs" : "outputs", K = J[G];
      if (K.includes(f)) return O;
      const X = { ...J, [G]: [...K, f].sort() };
      return { ...O, data: X };
    })), !!c)
      try {
        const D = T ? JSON.parse(T) : {}, O = D && typeof D == "object" && !Array.isArray(D) ? D : {}, J = O[r], G = J && typeof J == "object" && !Array.isArray(J) ? { ...J } : {}, K = m === "input" ? "inputs" : "outputs", X = Array.isArray(G[K]) ? G[K].map(String) : [];
        X.includes(f) || X.push(f), X.sort((le, se) => le.localeCompare(se)), G[K] = X, O[r] = G, o.setControls({ module_ports: JSON.stringify(O, null, 2) });
      } catch {
      }
  }, [o, c, T]), Re = W((r) => {
    Q((m) => {
      const f = at(r, m);
      if (r.some((O) => O.type === "position" || O.type === "dimensions")) {
        const O = {};
        for (const G of f) O[G.id] = { x: G.position.x, y: G.position.y };
        const J = Y();
        Z({ ...J, nodes: { ...J.nodes || {}, ...O }, hidden_modules: J.hidden_modules || [], version: 1 });
      }
      return f;
    });
  }, [Y, Z]), Ee = W((r) => {
    const m = r.some((f) => f.type === "remove" || f.type === "add");
    U((f) => {
      const D = lt(r, f);
      return m && ie(D), D;
    });
  }, [ie]), Te = W(() => {
    if (!h) return;
    const r = h.sourcePort.trim(), m = h.targetPort.trim();
    if (r.includes(".") || m.includes(".")) {
      N('Port names must not include "."');
      return;
    }
    !r || !m || (ge(h.source, "output", r), ge(h.target, "input", m), U((f) => {
      const D = je(
        {
          id: `e-${Date.now()}`,
          source: h.source,
          sourceHandle: r,
          target: h.target,
          targetHandle: m,
          type: "smoothstep",
          style: { stroke: "#6b7280", strokeWidth: 2 }
        },
        f
      );
      return ie(D), D;
    }), R(null));
  }, [ge, h, ie]), Le = W((r) => {
    if (w || !r.source || !r.target) return;
    let m = r.sourceHandle, f = r.targetHandle;
    if (!(!m || !f)) {
      if (m === ve) {
        R({
          source: r.source,
          target: r.target,
          sourceHandle: m,
          targetHandle: f,
          sourcePort: "",
          targetPort: f === ve ? "" : String(f),
          mode: f === ve ? "both" : "from"
        });
        return;
      }
      if (f === ve) {
        R({
          source: r.source,
          target: r.target,
          sourceHandle: m,
          targetHandle: f,
          sourcePort: String(m),
          targetPort: "",
          mode: "to"
        });
        return;
      }
      U((D) => {
        const O = je(
          {
            ...r,
            sourceHandle: m,
            targetHandle: f,
            id: `e-${Date.now()}`,
            type: "smoothstep",
            style: { stroke: "#6b7280", strokeWidth: 2 }
          },
          D
        );
        return ie(O), O;
      });
    }
  }, [w, ge, ie]), ze = W(() => {
    try {
      const r = JSON.parse(g), m = JSON.stringify(Ve(_t(r)), null, 2);
      k.current = m, o.setControls({ wiring: m }), N(null), v(!1);
      try {
        localStorage.setItem(E, JSON.stringify({ wiring: m, updatedAt: Date.now() }));
      } catch {
      }
    } catch (r) {
      const m = r instanceof Error ? r.message : String(r);
      N(m), y(!0), v(!0);
    }
  }, [o, g, E]), De = W(() => {
    Q((r) => {
      const m = Je(r, te), f = {};
      for (const O of m) f[O.id] = { x: O.position.x, y: O.position.y };
      const D = Y();
      return Z({ ...D, nodes: { ...D.nodes || {}, ...f }, hidden_modules: D.hidden_modules || [], version: 1 }), m;
    });
  }, [te, Y, Z]), Be = W(() => {
    const r = Y();
    Z({ ...r, nodes: {}, hidden_modules: r.hidden_modules || [], version: 1 }), Q((m) => m.map((f) => ({ ...f, position: { x: 0, y: 0 } })));
  }, [Y, Z]), Se = j(
    () => te.filter((r) => !de.has(r.source) && !de.has(r.target)),
    [te, de]
  ), _e = P.length, We = Se.length, Ce = j(() => {
    var m;
    const r = /* @__PURE__ */ new Set();
    for (const f of Array.isArray((m = t.spec) == null ? void 0 : m.modules) ? t.spec.modules : []) r.add(String(f));
    for (const f of Object.keys(C || {})) r.add(String(f));
    for (const f of P) r.add(String(f.id));
    return Array.from(r).sort((f, D) => f.localeCompare(D));
  }, [P, C, t.spec]), oe = W((r) => {
    const m = Y(), f = new Set(m.hidden_modules || []);
    f.has(r) ? f.delete(r) : f.add(r), Z({ ...m, hidden_modules: Array.from(f).sort(), version: 1, nodes: m.nodes || {} });
  }, [Y, Z]), $ = W((r) => {
    if (!a) return;
    const m = V.current;
    if (!m) return;
    const f = Y(), D = new Set(f.hidden_modules || []);
    if (b.get(r)) {
      const K = Array.from(b.entries()).filter(([X]) => X !== r).map(([, X]) => X);
      we(K), D.add(r), Z({ ...f, hidden_modules: Array.from(D).sort(), nodes: f.nodes || {}, version: 1 }), U((X) => {
        const le = X.filter((se) => se.source !== r && se.target !== r);
        return ie(le), le;
      });
      return;
    }
    const J = m.get(r);
    if (!J) return;
    const G = [...Array.from(b.values()), J];
    we(G), D.delete(r), Z({ ...f, hidden_modules: Array.from(D).sort(), nodes: f.nodes || {}, version: 1 });
  }, [b, a, Y, we, ie, Z]);
  return s ? /* @__PURE__ */ i("div", { className: `wiring-panel ${d ? "expanded" : "collapsed"}`, children: [
    /* @__PURE__ */ i("div", { className: "wiring-header", onClick: () => y((r) => !r), children: [
      /* @__PURE__ */ i("div", { className: "wiring-title", children: [
        /* @__PURE__ */ i("svg", { width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", children: [
          /* @__PURE__ */ e("path", { d: "M9 18h6" }),
          /* @__PURE__ */ e("path", { d: "M10 22h4" }),
          /* @__PURE__ */ e("path", { d: "M12 2v10" }),
          /* @__PURE__ */ e("path", { d: "M5 12h14" }),
          /* @__PURE__ */ e("circle", { cx: "12", cy: "12", r: "3" })
        ] }),
        /* @__PURE__ */ e("span", { children: "Wiring" }),
        /* @__PURE__ */ i("span", { className: "wiring-meta", children: [
          _e,
          " modules · ",
          We,
          " connections"
        ] }),
        de.size > 0 && /* @__PURE__ */ i("span", { className: "wiring-meta", children: [
          de.size,
          " hidden"
        ] }),
        w && /* @__PURE__ */ e("span", { className: "wiring-locked", children: "locked while running" })
      ] }),
      /* @__PURE__ */ e("div", { className: "wiring-actions", children: /* @__PURE__ */ e(
        "button",
        {
          className: "expand-btn",
          onClick: (r) => {
            r.stopPropagation(), y((m) => !m);
          },
          children: d ? "Collapse" : "Expand"
        }
      ) })
    ] }),
    S && /* @__PURE__ */ i("div", { className: "wiring-error", children: [
      /* @__PURE__ */ i("span", { children: [
        "Invalid wiring JSON: ",
        S
      ] }),
      /* @__PURE__ */ e("button", { className: "btn btn-small btn-outline", onClick: () => {
        y(!0), v(!0);
      }, children: "Edit JSON" })
    ] }),
    d && /* @__PURE__ */ i("div", { className: "wiring-body", children: [
      /* @__PURE__ */ e("div", { className: "wiring-canvas", children: /* @__PURE__ */ i(
        Xe,
        {
          nodes: P,
          edges: Se,
          onNodesChange: Re,
          onEdgesChange: Ee,
          onConnect: Le,
          nodeTypes: fe,
          fitView: !0,
          snapToGrid: !0,
          snapGrid: [15, 15],
          nodesDraggable: !w,
          nodesConnectable: !w,
          elementsSelectable: !w,
          deleteKeyCode: w ? null : ["Backspace", "Delete"],
          style: { background: "var(--bg)" },
          children: [
            /* @__PURE__ */ e(Qe, { gap: 20, size: 1, color: "var(--border)" }),
            /* @__PURE__ */ e(Ze, { style: { background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 6 } })
          ]
        }
      ) }),
      /* @__PURE__ */ i("div", { className: "wiring-advanced", children: [
        /* @__PURE__ */ i("div", { style: { display: "flex", gap: 8, justifyContent: "space-between", flexWrap: "wrap" }, children: [
          /* @__PURE__ */ i("div", { style: { display: "flex", gap: 8 }, children: [
            /* @__PURE__ */ e("button", { className: "btn btn-small btn-outline", onClick: De, children: "Auto layout" }),
            /* @__PURE__ */ e("button", { className: "btn btn-small btn-outline", onClick: Be, children: "Reset layout" })
          ] }),
          /* @__PURE__ */ e("button", { className: "btn btn-small btn-outline", onClick: () => v((r) => !r), children: x ? "Hide JSON" : "Show JSON" })
        ] }),
        Ce.length > 0 && /* @__PURE__ */ i("div", { className: "wiring-palette", children: [
          /* @__PURE__ */ i("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }, children: [
            /* @__PURE__ */ e("div", { style: { fontSize: 12, color: "var(--muted)", fontWeight: 600 }, children: "Modules" }),
            /* @__PURE__ */ e("div", { style: { fontSize: 11, color: "var(--muted)" }, children: "diagram only" })
          ] }),
          /* @__PURE__ */ e("div", { className: "wiring-palette-list", children: Ce.map((r) => {
            const m = de.has(r);
            return /* @__PURE__ */ i("label", { className: "wiring-palette-item", children: [
              /* @__PURE__ */ e(
                "input",
                {
                  type: "checkbox",
                  checked: !m,
                  onChange: () => oe(r),
                  disabled: w
                }
              ),
              /* @__PURE__ */ e("span", { style: { color: m ? "var(--muted)" : "var(--text)" }, children: r })
            ] }, r);
          }) })
        ] }),
        L && L.length > 0 && /* @__PURE__ */ i("div", { className: "wiring-palette", children: [
          /* @__PURE__ */ i("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }, children: [
            /* @__PURE__ */ e("div", { style: { fontSize: 12, color: "var(--muted)", fontWeight: 600 }, children: "Run Composition" }),
            /* @__PURE__ */ e("div", { style: { fontSize: 11, color: "var(--muted)" }, children: "affects run" })
          ] }),
          /* @__PURE__ */ e("div", { className: "wiring-palette-list", children: L.map((r) => {
            const m = b.has(r);
            return /* @__PURE__ */ i("label", { className: "wiring-palette-item", children: [
              /* @__PURE__ */ e(
                "input",
                {
                  type: "checkbox",
                  checked: m,
                  onChange: () => $(r),
                  disabled: w
                }
              ),
              /* @__PURE__ */ e("span", { style: { color: m ? "var(--text)" : "var(--muted)" }, children: r })
            ] }, r);
          }) })
        ] }),
        x && /* @__PURE__ */ i("div", { className: "wiring-json", children: [
          /* @__PURE__ */ e(
            "textarea",
            {
              className: "control-input",
              value: g,
              onChange: (r) => p(r.target.value),
              rows: 10,
              disabled: w
            }
          ),
          /* @__PURE__ */ i("div", { className: "wiring-json-actions", children: [
            /* @__PURE__ */ e("button", { className: "btn btn-small btn-primary", onClick: ze, disabled: w, children: "Apply" }),
            /* @__PURE__ */ e("button", { className: "btn btn-small btn-outline", onClick: () => {
              p(I ?? "[]"), N(null);
            }, children: "Reset" })
          ] })
        ] })
      ] })
    ] }),
    h && /* @__PURE__ */ e(
      "div",
      {
        className: "wiring-modal-backdrop",
        onClick: () => R(null),
        role: "presentation",
        children: /* @__PURE__ */ i("div", { className: "wiring-modal", onClick: (r) => r.stopPropagation(), children: [
          /* @__PURE__ */ e("div", { className: "wiring-modal-title", children: "Add connection" }),
          /* @__PURE__ */ i("div", { className: "wiring-modal-subtitle", children: [
            h.source,
            " → ",
            h.target
          ] }),
          /* @__PURE__ */ i("div", { className: "wiring-modal-grid", children: [
            /* @__PURE__ */ i("label", { className: "wiring-modal-field", children: [
              /* @__PURE__ */ e("span", { children: "From (output port)" }),
              /* @__PURE__ */ e(
                "input",
                {
                  className: "control-input",
                  value: h.sourcePort,
                  onChange: (r) => R((m) => m && { ...m, sourcePort: r.target.value }),
                  placeholder: "e.g. population_state",
                  disabled: w || h.mode === "to",
                  list: `wiring-ports-out-${h.source}`
                }
              )
            ] }),
            /* @__PURE__ */ i("label", { className: "wiring-modal-field", children: [
              /* @__PURE__ */ e("span", { children: "To (input port)" }),
              /* @__PURE__ */ e(
                "input",
                {
                  className: "control-input",
                  value: h.targetPort,
                  onChange: (r) => R((m) => m && { ...m, targetPort: r.target.value }),
                  placeholder: "e.g. prey_state",
                  disabled: w || h.mode === "from",
                  list: `wiring-ports-in-${h.target}`
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ e("datalist", { id: `wiring-ports-out-${h.source}`, children: (((F = P.find((r) => r.id === h.source)) == null ? void 0 : F.data.outputs) ?? []).map((r) => /* @__PURE__ */ e("option", { value: String(r) }, String(r))) }),
          /* @__PURE__ */ e("datalist", { id: `wiring-ports-in-${h.target}`, children: (((ne = P.find((r) => r.id === h.target)) == null ? void 0 : ne.data.inputs) ?? []).map((r) => /* @__PURE__ */ e("option", { value: String(r) }, String(r))) }),
          /* @__PURE__ */ i("div", { className: "wiring-modal-actions", children: [
            /* @__PURE__ */ e("button", { className: "btn btn-outline", onClick: () => R(null), children: "Cancel" }),
            /* @__PURE__ */ e("button", { className: "btn btn-primary", onClick: Te, disabled: w, children: "Add" })
          ] })
        ] })
      }
    )
  ] }) : null;
}
function Ht(n) {
  const t = new Date(n);
  return Number.isNaN(t.getTime()) ? "" : t.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}
function Pt({ adapter: n }) {
  const [t, o] = B([]), [s, l] = B(!0), [c, a] = B(null), [d, y] = B(""), [S, N] = B(!1), x = ae(null);
  ee(() => {
    let p = !0;
    return l(!0), n.getThread().then((h) => {
      p && (o(h.messages ?? []), a(null));
    }).catch((h) => {
      p && a(h instanceof Error ? h.message : String(h));
    }).finally(() => {
      p && l(!1);
    }), () => {
      p = !1;
    };
  }, [n]), ee(() => {
    var p;
    (p = x.current) == null || p.scrollIntoView({ behavior: "smooth" });
  }, [t.length]);
  const v = async () => {
    const p = d.trim();
    if (!p || S) return;
    y(""), N(!0), a(null);
    const h = (/* @__PURE__ */ new Date()).toISOString(), R = {
      id: `local-user-${Date.now()}`,
      role: "user",
      content: p,
      createdAt: h
    }, k = `local-assistant-${Date.now()}`, u = {
      id: k,
      role: "assistant",
      content: "",
      createdAt: h
    };
    o((w) => [...w, R, u]);
    try {
      const w = await n.sendMessage({
        content: p,
        onChunk: (E) => {
          E && o(
            (z) => z.map(
              (I) => I.id === k ? { ...I, content: I.content + E } : I
            )
          );
        }
      });
      o((E) => E.map((z) => z.id === k ? w : z));
    } catch (w) {
      const E = w instanceof Error ? w.message : String(w);
      a(E), o((z) => z.filter((I) => I.id !== k));
    } finally {
      N(!1);
    }
  }, g = (p) => {
    p.key === "Enter" && !p.shiftKey && (p.preventDefault(), v());
  };
  return /* @__PURE__ */ i("div", { className: "chat-panel", children: [
    /* @__PURE__ */ e("div", { className: "chat-header", children: /* @__PURE__ */ i("div", { children: [
      /* @__PURE__ */ e("div", { className: "chat-title", children: "Simulation Chat" }),
      /* @__PURE__ */ e("div", { className: "chat-subtitle", children: "Shared across related runs." })
    ] }) }),
    s && /* @__PURE__ */ e("div", { className: "chat-loading", children: "Loading chat history…" }),
    c && /* @__PURE__ */ e("div", { className: "chat-error", children: c }),
    /* @__PURE__ */ i("div", { className: `chat-messages ${t.length === 0 ? "empty" : ""}`, children: [
      t.length === 0 && !s && /* @__PURE__ */ e("div", { className: "chat-empty", children: "Start a conversation about this simulation." }),
      t.map((p) => /* @__PURE__ */ i("div", { className: `chat-message ${p.role === "user" ? "user" : "assistant"}`, children: [
        /* @__PURE__ */ e("div", { className: "chat-bubble", children: p.content }),
        /* @__PURE__ */ e("div", { className: "chat-meta", children: Ht(p.createdAt) })
      ] }, p.id)),
      /* @__PURE__ */ e("div", { ref: x })
    ] }),
    /* @__PURE__ */ i("div", { className: "chat-input", children: [
      /* @__PURE__ */ e(
        "textarea",
        {
          className: "chat-textarea",
          placeholder: "Ask about parameters, outputs, or model behavior…",
          value: d,
          onChange: (p) => y(p.target.value),
          onKeyDown: g,
          rows: 2,
          disabled: S
        }
      ),
      /* @__PURE__ */ e("button", { type: "button", className: "btn btn-primary", onClick: v, disabled: S || !d.trim(), children: S ? "Sending…" : "Send" })
    ] })
  ] });
}
function Ue({ message: n, description: t }) {
  return /* @__PURE__ */ e("div", { className: "empty-state", children: /* @__PURE__ */ i("div", { className: "empty-content", children: [
    /* @__PURE__ */ e("h3", { children: n }),
    t && /* @__PURE__ */ e("p", { children: t })
  ] }) });
}
function It({ chatAdapter: n }) {
  var x;
  const { state: t } = re(), o = Ae(), s = j(
    () => t.visibleModules.size ? o.filter((v) => t.visibleModules.has(v)) : o,
    [o, t.visibleModules]
  ), l = bt(), c = (x = t.spec) == null ? void 0 : x.description, a = !!n, d = j(
    () => {
      var v, g;
      return !!((g = (v = t.spec) == null ? void 0 : v.controls) != null && g.some((p) => p.type === "json" && p.name === "wiring"));
    },
    [t.spec]
  ), [y, S] = B("visuals"), N = o.length === 0 ? /* @__PURE__ */ i(ce, { children: [
    c && /* @__PURE__ */ e(He, { description: c }),
    /* @__PURE__ */ e(Ue, { message: "No modules found", description: "The simulation doesn't have any modules to display yet." })
  ] }) : s.length === 0 ? /* @__PURE__ */ i(ce, { children: [
    c && /* @__PURE__ */ e(He, { description: c }),
    /* @__PURE__ */ e(Ue, { message: "No modules selected", description: "Select modules from the sidebar to view their visualizations." })
  ] }) : /* @__PURE__ */ i(ce, { children: [
    c && /* @__PURE__ */ e(He, { description: c }),
    /* @__PURE__ */ e("div", { className: "modules-grid", children: s.map((v) => /* @__PURE__ */ e(Dt, { moduleName: v, visuals: l.get(v) || [] }, v)) })
  ] });
  return /* @__PURE__ */ i("div", { className: "main-content", children: [
    /* @__PURE__ */ i("div", { className: "main-tabs", children: [
      /* @__PURE__ */ e(
        "button",
        {
          type: "button",
          className: `main-tab ${y === "visuals" ? "active" : ""}`,
          onClick: () => S("visuals"),
          children: "Visualizations"
        }
      ),
      d && /* @__PURE__ */ e(
        "button",
        {
          type: "button",
          className: `main-tab ${y === "wiring" ? "active" : ""}`,
          onClick: () => S("wiring"),
          children: "Wiring"
        }
      ),
      a && /* @__PURE__ */ e(
        "button",
        {
          type: "button",
          className: `main-tab ${y === "chat" ? "active" : ""}`,
          onClick: () => S("chat"),
          children: "Chat"
        }
      )
    ] }),
    y === "chat" && n && /* @__PURE__ */ e(Pt, { adapter: n }),
    y === "wiring" && d && /* @__PURE__ */ e(Ot, {}),
    y === "visuals" && N
  ] });
}
function jt() {
  var T, M;
  const n = Ne(), { state: t, actions: o } = re(), s = t.events || [], l = ((T = t.status) == null ? void 0 : T.running) ?? !1, [c, a] = B("events"), [d, y] = B([]), [S, N] = B(!1), x = ae(0), v = ae(null), g = ae(null), [p, h] = B(!0), [R, k] = B(!0);
  ee(() => {
    p && v.current && (v.current.scrollTop = v.current.scrollHeight);
  }, [s, p]), ee(() => {
    R && g.current && (g.current.scrollTop = g.current.scrollHeight);
  }, [d, R]);
  const u = W(() => {
    if (!v.current) return;
    const { scrollTop: C, scrollHeight: V, clientHeight: b } = v.current;
    h(C + b >= V - 10);
  }, []), w = W(() => {
    if (!g.current) return;
    const { scrollTop: C, scrollHeight: V, clientHeight: b } = g.current;
    k(C + b >= V - 10);
  }, []);
  ee(() => {
    if (c !== "logs" || !n.logs) return;
    let C = !1;
    const V = async () => {
      if (!C) {
        N(!0);
        try {
          const L = x.current > 0 ? x.current : void 0, A = await n.logs(L);
          if (C) return;
          A.items && A.items.length > 0 && y((P) => {
            var Z;
            const Q = new Set(P.map((Y) => Y.id)), te = A.items.filter((Y) => !Q.has(Y.id));
            if (te.length === 0) return P;
            const U = [...P, ...te].sort((Y, he) => Y.seq - he.seq), fe = ((Z = U[U.length - 1]) == null ? void 0 : Z.seq) ?? 0;
            return fe > x.current && (x.current = fe), U;
          });
        } catch (L) {
          console.error("Failed to fetch run logs:", L);
        } finally {
          C || N(!1);
        }
      }
    };
    V();
    const b = setInterval(V, 3e3);
    return () => {
      C = !0, clearInterval(b);
    };
  }, [c, n, l]);
  const E = !!n.logs, z = E ? c : "events", I = (C) => C === "error" ? "log-level log-level--error" : C === "warning" ? "log-level log-level--warning" : "log-level log-level--info", q = (C) => C === "sandbox" ? "SANDBOX" : C === "system" ? "SYSTEM" : C === "runstream" ? "STREAM" : C.toUpperCase();
  return /* @__PURE__ */ e("div", { className: "footer", children: /* @__PURE__ */ i("div", { className: "footer-content", children: [
    /* @__PURE__ */ i("header", { className: "footer-header", children: [
      /* @__PURE__ */ e("div", { className: "footer-title-section", children: E ? /* @__PURE__ */ i("div", { className: "footer-tabs", children: [
        /* @__PURE__ */ i(
          "button",
          {
            className: `footer-tab ${z === "events" ? "footer-tab--active" : ""}`,
            onClick: () => a("events"),
            children: [
              "Events",
              s.length > 0 && /* @__PURE__ */ e("span", { className: "footer-tab-badge", children: s.length })
            ]
          }
        ),
        /* @__PURE__ */ i(
          "button",
          {
            className: `footer-tab ${z === "logs" ? "footer-tab--active" : ""}`,
            onClick: () => a("logs"),
            children: [
              "Logs",
              d.length > 0 && /* @__PURE__ */ e("span", { className: "footer-tab-badge", children: d.length })
            ]
          }
        )
      ] }) : /* @__PURE__ */ i(ce, { children: [
        /* @__PURE__ */ e("h2", { className: "footer-title", children: "Event Log" }),
        /* @__PURE__ */ e("div", { className: "event-stats", children: /* @__PURE__ */ i("div", { className: "stat-item", children: [
          /* @__PURE__ */ e("span", { className: "stat-label", children: "Total:" }),
          /* @__PURE__ */ e("span", { className: "stat-value", children: s.length })
        ] }) })
      ] }) }),
      /* @__PURE__ */ i("div", { className: "footer-actions", children: [
        z === "events" && s.length > 0 && /* @__PURE__ */ e("button", { className: "btn btn-small btn-outline", onClick: () => o.setEvents([]), children: "Clear" }),
        z === "logs" && d.length > 0 && /* @__PURE__ */ e("button", { className: "btn btn-small btn-outline", onClick: () => {
          y([]), x.current = 0;
        }, children: "Clear" })
      ] })
    ] }),
    /* @__PURE__ */ i("div", { className: "footer-body", children: [
      z === "events" && /* @__PURE__ */ e(ce, { children: s.length === 0 ? /* @__PURE__ */ e("div", { className: "event-list empty", children: /* @__PURE__ */ i("div", { className: "empty-state", children: [
        /* @__PURE__ */ e("p", { children: "No events recorded yet" }),
        ((M = t.status) == null ? void 0 : M.phase_message) && /* @__PURE__ */ e("p", { className: "empty-state-phase", children: t.status.phase_message })
      ] }) }) : /* @__PURE__ */ i("div", { className: "event-list-container", children: [
        /* @__PURE__ */ i("div", { className: "event-list-header", children: [
          /* @__PURE__ */ i("span", { className: "event-count", children: [
            s.length,
            " event",
            s.length !== 1 ? "s" : ""
          ] }),
          /* @__PURE__ */ e("div", { className: "event-controls", children: /* @__PURE__ */ e("button", { className: `btn btn-small ${p ? "active" : ""}`, onClick: () => h(!p), title: p ? "Auto-scroll enabled" : "Auto-scroll disabled", children: "📌" }) })
        ] }),
        /* @__PURE__ */ e("div", { ref: v, className: "event-list", onScroll: u, children: s.slice().reverse().map((C) => {
          var V;
          return /* @__PURE__ */ i("div", { className: `event-item ${C.event === "phase" ? "event-item--phase" : ""}`, children: [
            /* @__PURE__ */ e("time", { className: "event-timestamp", dateTime: C.ts, children: C.ts }),
            /* @__PURE__ */ e("div", { className: "event-message", children: C.event === "phase" && ((V = C.payload) != null && V.message) ? String(C.payload.message) : C.event })
          ] }, C.id);
        }) })
      ] }) }),
      z === "logs" && /* @__PURE__ */ e(ce, { children: d.length === 0 ? /* @__PURE__ */ e("div", { className: "event-list empty", children: /* @__PURE__ */ e("div", { className: "empty-state", children: /* @__PURE__ */ e("p", { children: S ? "Loading logs..." : "No logs available yet" }) }) }) : /* @__PURE__ */ i("div", { className: "event-list-container", children: [
        /* @__PURE__ */ i("div", { className: "event-list-header", children: [
          /* @__PURE__ */ i("span", { className: "event-count", children: [
            d.length,
            " log entr",
            d.length !== 1 ? "ies" : "y"
          ] }),
          /* @__PURE__ */ e("div", { className: "event-controls", children: /* @__PURE__ */ e("button", { className: `btn btn-small ${R ? "active" : ""}`, onClick: () => k(!R), title: R ? "Auto-scroll enabled" : "Auto-scroll disabled", children: "📌" }) })
        ] }),
        /* @__PURE__ */ e("div", { ref: g, className: "event-list", onScroll: w, children: d.map((C) => /* @__PURE__ */ i("div", { className: `event-item log-item log-item--${C.level}`, children: [
          /* @__PURE__ */ i("div", { className: "log-item-header", children: [
            /* @__PURE__ */ e("time", { className: "event-timestamp", dateTime: C.ts, children: C.ts }),
            /* @__PURE__ */ e("span", { className: `log-source log-source--${C.source}`, children: q(C.source) }),
            /* @__PURE__ */ e("span", { className: I(C.level), children: C.level.toUpperCase() })
          ] }),
          C.message && /* @__PURE__ */ e("div", { className: "event-message", children: C.message })
        ] }, C.id)) })
      ] }) })
    ] })
  ] }) });
}
const Ft = ({ data: n, selected: t }) => {
  const o = n, { label: s, moduleType: l, inputs: c, outputs: a } = o, d = l.split(".").pop() || l, y = l.includes(".neuro.") ? "neuro" : l.includes(".ecology.") ? "ecology" : "custom", N = {
    neuro: { bg: "var(--primary-bg)", border: "var(--primary)", header: "var(--primary-dark)", text: "var(--primary-text)" },
    ecology: { bg: "#14352a", border: "#22c55e", header: "#16a34a", text: "#dcfce7" },
    custom: { bg: "#2e1a47", border: "#a855f7", header: "#9333ea", text: "#f3e8ff" }
  }[y];
  return /* @__PURE__ */ i(
    "div",
    {
      className: "module-node",
      style: {
        background: N.bg,
        border: `2px solid ${t ? "#fbbf24" : N.border}`,
        borderRadius: "10px",
        minWidth: "180px",
        boxShadow: t ? "0 0 0 2px #fbbf24" : "0 4px 16px rgba(0,0,0,0.5)",
        fontFamily: "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif"
      },
      children: [
        /* @__PURE__ */ e(
          "div",
          {
            style: {
              background: N.header,
              color: "#fff",
              padding: "10px 14px",
              borderRadius: "8px 8px 0 0",
              fontWeight: 600,
              fontSize: "14px",
              letterSpacing: "0.01em"
            },
            children: s
          }
        ),
        /* @__PURE__ */ e(
          "div",
          {
            style: {
              padding: "6px 14px",
              fontSize: "12px",
              color: N.text,
              borderBottom: `1px solid ${N.border}50`,
              opacity: 0.85
            },
            children: d
          }
        ),
        /* @__PURE__ */ i("div", { style: { display: "flex", justifyContent: "space-between", padding: "10px 0" }, children: [
          /* @__PURE__ */ i("div", { style: { display: "flex", flexDirection: "column", gap: "6px" }, children: [
            c.map((x) => /* @__PURE__ */ i("div", { style: { position: "relative", paddingLeft: "14px" }, children: [
              /* @__PURE__ */ e(
                ye,
                {
                  type: "target",
                  position: be.Left,
                  id: x,
                  style: {
                    width: "12px",
                    height: "12px",
                    background: "#6b7280",
                    border: "2px solid var(--primary-bg)",
                    left: "-6px"
                  }
                }
              ),
              /* @__PURE__ */ e("span", { style: { fontSize: "12px", color: N.text, fontWeight: 500 }, children: x })
            ] }, x)),
            c.length === 0 && /* @__PURE__ */ e("div", { style: { paddingLeft: "14px", fontSize: "12px", color: "#9aa6c1", fontStyle: "italic" }, children: "no inputs" })
          ] }),
          /* @__PURE__ */ i("div", { style: { display: "flex", flexDirection: "column", gap: "6px", alignItems: "flex-end" }, children: [
            a.map((x) => /* @__PURE__ */ i("div", { style: { position: "relative", paddingRight: "14px" }, children: [
              /* @__PURE__ */ e("span", { style: { fontSize: "12px", color: N.text, fontWeight: 500 }, children: x }),
              /* @__PURE__ */ e(
                ye,
                {
                  type: "source",
                  position: be.Right,
                  id: x,
                  style: {
                    width: "12px",
                    height: "12px",
                    background: N.header,
                    border: "2px solid var(--primary-bg)",
                    right: "-6px"
                  }
                }
              )
            ] }, x)),
            a.length === 0 && /* @__PURE__ */ e("div", { style: { paddingRight: "14px", fontSize: "12px", color: "#9aa6c1", fontStyle: "italic" }, children: "no outputs" })
          ] })
        ] })
      ]
    }
  );
}, Jt = qe(Ft), Vt = ({ registry: n, onDragStart: t }) => {
  const [o, s] = B(/* @__PURE__ */ new Set(["neuro", "ecology"])), [l, c] = B(""), a = "#0f1628", d = "#11182b", y = "#e6eaf2", S = "#9aa6c1", N = "#1e2a44";
  if (!n)
    return /* @__PURE__ */ e("div", { className: "module-palette", style: { padding: "16px", background: d, color: S }, children: /* @__PURE__ */ e("div", { children: "Loading modules..." }) });
  const x = (p) => {
    const h = new Set(o);
    h.has(p) ? h.delete(p) : h.add(p), s(h);
  }, v = {
    neuro: "var(--primary)",
    ecology: "#22c55e",
    custom: "#a855f7"
  }, g = Object.entries(n.categories).map(([p, h]) => {
    const R = h.map((k) => ({ path: k, spec: n.modules[k] })).filter(({ spec: k }) => {
      var w;
      if (!k) return !1;
      if (!l) return !0;
      const u = l.toLowerCase();
      return k.name.toLowerCase().includes(u) || ((w = k.description) == null ? void 0 : w.toLowerCase().includes(u)) || p.toLowerCase().includes(u);
    });
    return { category: p, modules: R };
  }).filter(({ modules: p }) => p.length > 0);
  return /* @__PURE__ */ i("div", { className: "module-palette", style: { height: "100%", display: "flex", flexDirection: "column", background: d, fontFamily: "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif" }, children: [
    /* @__PURE__ */ i("div", { style: { padding: "14px", borderBottom: `1px solid ${N}` }, children: [
      /* @__PURE__ */ e("h3", { style: { margin: "0 0 10px 0", fontSize: "14px", fontWeight: 600, color: y }, children: "Modules" }),
      /* @__PURE__ */ e(
        "input",
        {
          type: "text",
          placeholder: "Search modules...",
          value: l,
          onChange: (p) => c(p.target.value),
          style: {
            width: "100%",
            padding: "8px 12px",
            border: `1px solid ${N}`,
            borderRadius: "8px",
            fontSize: "13px",
            background: a,
            color: y
          }
        }
      )
    ] }),
    /* @__PURE__ */ i("div", { style: { flex: 1, overflow: "auto", padding: "8px" }, children: [
      g.map(({ category: p, modules: h }) => /* @__PURE__ */ i("div", { style: { marginBottom: "8px" }, children: [
        /* @__PURE__ */ i(
          "button",
          {
            onClick: () => x(p),
            style: {
              width: "100%",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px",
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: "13px",
              fontWeight: 600,
              color: y,
              textAlign: "left"
            },
            children: [
              /* @__PURE__ */ e("span", { style: { transform: o.has(p) ? "rotate(90deg)" : "rotate(0deg)", transition: "transform 0.2s", color: S }, children: "▶" }),
              /* @__PURE__ */ e(
                "span",
                {
                  style: {
                    width: "10px",
                    height: "10px",
                    borderRadius: "50%",
                    background: v[p] || "#666"
                  }
                }
              ),
              p.charAt(0).toUpperCase() + p.slice(1),
              /* @__PURE__ */ e("span", { style: { marginLeft: "auto", fontSize: "12px", color: S }, children: h.length })
            ]
          }
        ),
        o.has(p) && /* @__PURE__ */ e("div", { style: { paddingLeft: "16px" }, children: h.map(({ path: R, spec: k }) => /* @__PURE__ */ i(
          "div",
          {
            draggable: !0,
            onDragStart: (u) => t(u, R, k),
            style: {
              padding: "10px 12px",
              marginBottom: "6px",
              background: a,
              border: `1px solid ${N}`,
              borderRadius: "8px",
              cursor: "grab",
              fontSize: "13px"
            },
            title: k.description || R,
            children: [
              /* @__PURE__ */ e("div", { style: { fontWeight: 500, color: y }, children: k.name }),
              /* @__PURE__ */ i("div", { style: { fontSize: "11px", color: S, marginTop: "4px" }, children: [
                k.inputs.length > 0 && /* @__PURE__ */ i("span", { children: [
                  "in: ",
                  k.inputs.join(", ")
                ] }),
                k.inputs.length > 0 && k.outputs.length > 0 && " | ",
                k.outputs.length > 0 && /* @__PURE__ */ i("span", { children: [
                  "out: ",
                  k.outputs.join(", ")
                ] })
              ] })
            ]
          },
          R
        )) })
      ] }, p)),
      g.length === 0 && /* @__PURE__ */ e("div", { style: { padding: "16px", textAlign: "center", color: S, fontSize: "13px" }, children: "No modules found" })
    ] }),
    /* @__PURE__ */ e("div", { style: { padding: "10px 14px", borderTop: `1px solid ${N}`, fontSize: "12px", color: S }, children: "Drag modules to canvas" })
  ] });
}, Ut = ({
  selectedNode: n,
  registry: t,
  onUpdateNode: o,
  onDeleteNode: s,
  onRenameNode: l
}) => {
  const c = "#0f1628", a = "#11182b", d = "#e6eaf2", y = "#9aa6c1", S = "#1e2a44", N = "#22d3ee";
  if (!n)
    return /* @__PURE__ */ i("div", { className: "properties-panel", style: { padding: "16px", background: a, color: y, fontFamily: "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif" }, children: [
      /* @__PURE__ */ e("h3", { style: { margin: "0 0 10px 0", fontSize: "14px", fontWeight: 600, color: d }, children: "Properties" }),
      /* @__PURE__ */ e("p", { style: { fontSize: "13px", color: y }, children: "Select a node to edit its properties" })
    ] });
  const x = n.data, v = t == null ? void 0 : t.modules[x.moduleType], g = (u, w) => {
    const E = { ...x.args, [u]: w };
    o(n.id, E);
  }, p = (u) => {
    const w = u.target.value.trim();
    w && w !== n.id && l(n.id, w);
  }, h = (u, w) => {
    if (w === "int" || w === "float" || w === "number") {
      const E = parseFloat(u);
      return isNaN(E) ? 0 : E;
    }
    if (w === "bool" || w === "boolean")
      return u === "true" || u === "1";
    if (w === "list" || w === "List")
      try {
        return JSON.parse(u);
      } catch {
        return [];
      }
    return u;
  }, R = (u) => u == null ? "" : typeof u == "object" ? JSON.stringify(u) : String(u), k = {
    width: "100%",
    padding: "8px 12px",
    border: `1px solid ${S}`,
    borderRadius: "8px",
    fontSize: "13px",
    background: c,
    color: d
  };
  return /* @__PURE__ */ i("div", { className: "properties-panel", style: { height: "100%", display: "flex", flexDirection: "column", background: a, fontFamily: "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif" }, children: [
    /* @__PURE__ */ e("div", { style: { padding: "14px", borderBottom: `1px solid ${S}` }, children: /* @__PURE__ */ e("h3", { style: { margin: "0", fontSize: "14px", fontWeight: 600, color: d }, children: "Properties" }) }),
    /* @__PURE__ */ i("div", { style: { flex: 1, overflow: "auto", padding: "14px" }, children: [
      /* @__PURE__ */ i("div", { style: { marginBottom: "18px" }, children: [
        /* @__PURE__ */ e("label", { style: { display: "block", fontSize: "12px", fontWeight: 500, marginBottom: "6px", color: d }, children: "Node ID" }),
        /* @__PURE__ */ e(
          "input",
          {
            type: "text",
            defaultValue: n.id,
            onBlur: p,
            onKeyDown: (u) => {
              u.key === "Enter" && u.currentTarget.blur();
            },
            style: k
          }
        )
      ] }),
      /* @__PURE__ */ i("div", { style: { marginBottom: "18px" }, children: [
        /* @__PURE__ */ e("label", { style: { display: "block", fontSize: "12px", fontWeight: 500, marginBottom: "6px", color: d }, children: "Module Type" }),
        /* @__PURE__ */ e("div", { style: { padding: "8px 12px", background: c, borderRadius: "8px", fontSize: "12px", color: y, border: `1px solid ${S}` }, children: x.moduleType })
      ] }),
      (v == null ? void 0 : v.description) && /* @__PURE__ */ e("div", { style: { marginBottom: "18px", padding: "10px", background: "#0c2135", borderRadius: "8px", fontSize: "12px", color: N, border: `1px solid ${S}` }, children: v.description.split(`
`)[0] }),
      /* @__PURE__ */ i("div", { style: { marginBottom: "10px" }, children: [
        /* @__PURE__ */ e("label", { style: { display: "block", fontSize: "12px", fontWeight: 600, marginBottom: "10px", color: d }, children: "Arguments" }),
        v == null ? void 0 : v.args.map((u) => {
          const w = x.args[u.name] ?? u.default, E = u.type === "bool" || u.type === "boolean" ? "checkbox" : "text";
          return /* @__PURE__ */ i("div", { style: { marginBottom: "14px" }, children: [
            /* @__PURE__ */ i("label", { style: { display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", marginBottom: "6px", color: y }, children: [
              /* @__PURE__ */ e("span", { style: { fontWeight: 500, color: d }, children: u.name }),
              /* @__PURE__ */ i("span", { style: { color: y }, children: [
                "(",
                u.type,
                ")"
              ] }),
              u.required && /* @__PURE__ */ e("span", { style: { color: "#ef4444" }, children: "*" })
            ] }),
            E === "checkbox" ? /* @__PURE__ */ e(
              "input",
              {
                type: "checkbox",
                checked: !!w,
                onChange: (z) => g(u.name, z.target.checked),
                style: { width: "18px", height: "18px", accentColor: N }
              }
            ) : u.options ? /* @__PURE__ */ e(
              "select",
              {
                value: String(w),
                onChange: (z) => g(u.name, h(z.target.value, u.type)),
                style: k,
                children: u.options.map((z) => /* @__PURE__ */ e("option", { value: String(z), children: String(z) }, String(z)))
              }
            ) : /* @__PURE__ */ e(
              "input",
              {
                type: "text",
                value: R(w),
                onChange: (z) => g(u.name, h(z.target.value, u.type)),
                placeholder: u.default !== null ? `Default: ${R(u.default)}` : "",
                style: k
              }
            ),
            u.description && /* @__PURE__ */ e("div", { style: { fontSize: "11px", color: y, marginTop: "4px" }, children: u.description })
          ] }, u.name);
        }),
        (!v || v.args.length === 0) && /* @__PURE__ */ e("div", { style: { fontSize: "13px", color: y, fontStyle: "italic" }, children: "No configurable arguments" })
      ] }),
      /* @__PURE__ */ i("div", { style: { marginTop: "18px", paddingTop: "18px", borderTop: `1px solid ${S}` }, children: [
        /* @__PURE__ */ e("label", { style: { display: "block", fontSize: "12px", fontWeight: 600, marginBottom: "10px", color: d }, children: "Ports" }),
        /* @__PURE__ */ i("div", { style: { display: "flex", gap: "20px" }, children: [
          /* @__PURE__ */ i("div", { children: [
            /* @__PURE__ */ e("div", { style: { fontSize: "12px", color: y, marginBottom: "6px" }, children: "Inputs" }),
            x.inputs.length > 0 ? x.inputs.map((u) => /* @__PURE__ */ e("div", { style: { fontSize: "12px", color: d }, children: u }, u)) : /* @__PURE__ */ e("div", { style: { fontSize: "12px", color: y, fontStyle: "italic" }, children: "none" })
          ] }),
          /* @__PURE__ */ i("div", { children: [
            /* @__PURE__ */ e("div", { style: { fontSize: "12px", color: y, marginBottom: "6px" }, children: "Outputs" }),
            x.outputs.length > 0 ? x.outputs.map((u) => /* @__PURE__ */ e("div", { style: { fontSize: "12px", color: d }, children: u }, u)) : /* @__PURE__ */ e("div", { style: { fontSize: "12px", color: y, fontStyle: "italic" }, children: "none" })
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ e("div", { style: { padding: "14px", borderTop: `1px solid ${S}` }, children: /* @__PURE__ */ e(
      "button",
      {
        onClick: () => s(n.id),
        style: {
          width: "100%",
          padding: "10px",
          background: "#3b1c1c",
          border: "1px solid #7f1d1d",
          borderRadius: "8px",
          color: "#fca5a5",
          fontSize: "13px",
          fontWeight: 500,
          cursor: "pointer"
        },
        children: "Delete Node"
      }
    ) })
  ] });
}, Pe = (n, t, o = "LR") => {
  const s = new Me.graphlib.Graph();
  s.setDefaultEdgeLabel(() => ({}));
  const l = 200, c = 120;
  return s.setGraph({ rankdir: o, nodesep: 50, ranksep: 100 }), n.forEach((d) => {
    s.setNode(d.id, { width: l, height: c });
  }), t.forEach((d) => {
    s.setEdge(d.source, d.target);
  }), Me.layout(s), { nodes: n.map((d) => {
    const y = s.node(d.id);
    return {
      ...d,
      position: {
        x: y.x - l / 2,
        y: y.y - c / 2
      }
    };
  }), edges: t };
}, Ye = (n, t) => {
  const o = n.nodes.map((l) => {
    const c = t == null ? void 0 : t.modules[l.type];
    return {
      id: l.id,
      type: "moduleNode",
      position: l.position,
      data: {
        label: l.id,
        moduleType: l.type,
        args: l.data.args,
        inputs: l.data.inputs.length > 0 ? l.data.inputs : (c == null ? void 0 : c.inputs) || [],
        outputs: l.data.outputs.length > 0 ? l.data.outputs : (c == null ? void 0 : c.outputs) || []
      }
    };
  }), s = n.edges.map((l) => ({
    id: l.id,
    source: l.source,
    sourceHandle: l.sourceHandle,
    target: l.target,
    targetHandle: l.targetHandle,
    type: "smoothstep",
    animated: !1,
    style: { stroke: "var(--primary-muted)", strokeWidth: 2 }
  }));
  return { nodes: o, edges: s };
}, Ie = (n, t, o) => {
  const s = n.map((c) => {
    const a = c.data;
    return {
      id: c.id,
      type: a.moduleType,
      position: c.position,
      data: {
        args: a.args,
        inputs: a.inputs,
        outputs: a.outputs
      }
    };
  }), l = t.map((c) => ({
    id: c.id,
    source: c.source,
    sourceHandle: c.sourceHandle || "",
    target: c.target,
    targetHandle: c.targetHandle || ""
  }));
  return { nodes: s, edges: l, meta: o };
}, Yt = ({ api: n, initialConfigPath: t }) => {
  const o = n.editor, [s, l, c] = ct([]), [a, d, y] = dt([]), [S, N] = B(null), [x, v] = B(null), [g, p] = B(t || ""), [h, R] = B({}), [k, u] = B(!1), [w, E] = B(null), [z, I] = B([]), [q, T] = B(!t), [M, C] = B(!1), [V, b] = B(""), L = ae(null), A = "#0f1628", P = "#11182b", Q = "#e6eaf2", te = "#9aa6c1", U = "#1e2a44", fe = "var(--primary)", Z = j(() => ({ moduleNode: Jt }), []), [Y, he] = B(!1);
  ee(() => {
    (async () => {
      try {
        const [_, H] = await Promise.all([
          o.getModules(),
          o.getCurrent()
        ]);
        if (N(_), H.available && H.graph) {
          const { nodes: F, edges: ne } = Ye(H.graph, _);
          if (F.every((m) => m.position.x === 0 && m.position.y === 0) && F.length > 0) {
            const m = Pe(F, ne);
            l(m.nodes), d(m.edges);
          } else
            l(F), d(ne);
          R(H.graph.meta), p(H.path || ""), u(!1), T(!1);
        } else {
          const F = await o.listFiles();
          I(F), T(!0);
        }
      } catch (_) {
        console.error("Failed to initialize editor:", _), o.listFiles().then(I).catch(console.error);
      }
    })();
  }, [n, l, d]);
  const de = W(async ($) => {
    try {
      E(null);
      const _ = await o.getConfig($), { nodes: H, edges: F } = Ye(_, S);
      if (H.every((r) => r.position.x === 0 && r.position.y === 0) && H.length > 0) {
        const r = Pe(H, F);
        l(r.nodes), d(r.edges);
      } else
        l(H), d(F);
      R(_.meta), p($), u(!1), T(!1);
    } catch (_) {
      E(`Failed to load config: ${_}`);
    }
  }, [n, S, l, d]), we = W(async () => {
    if (!g) {
      E("No config path specified");
      return;
    }
    try {
      const $ = Ie(s, a, h);
      await o.saveConfig(g, $), u(!1), E(null);
    } catch ($) {
      E(`Failed to save: ${$}`);
    }
  }, [n, g, s, a, h]), ie = W(async () => {
    if (!g) {
      E("No config path specified");
      return;
    }
    he(!0);
    try {
      const $ = Ie(s, a, h), _ = await o.applyConfig($, g);
      _.ok ? (u(!1), E(null), E("Configuration applied successfully!"), setTimeout(() => E(null), 3e3)) : E(`Failed to apply: ${_.error || "Unknown error"}`);
    } catch ($) {
      E(`Failed to apply config: ${$}`);
    } finally {
      he(!1);
    }
  }, [n, g, s, a, h]), ge = W(() => {
    const $ = Pe(s, a);
    l($.nodes), d($.edges), u(!0);
  }, [s, a, l, d]), Re = W(
    ($) => {
      const _ = {
        ...$,
        id: `e${Date.now()}`,
        type: "smoothstep",
        style: { stroke: "var(--primary-muted)", strokeWidth: 2 }
      };
      d((H) => je(_, H)), u(!0);
    },
    [d]
  ), Ee = W(({ nodes: $ }) => {
    v($.length === 1 ? $[0] : null);
  }, []), Te = W(() => {
    u(!0);
  }, []), Le = W(($) => {
    $.preventDefault(), $.dataTransfer.dropEffect = "move";
  }, []), ze = W(
    ($) => {
      $.preventDefault();
      const _ = $.dataTransfer.getData("application/moduleType"), H = $.dataTransfer.getData("application/moduleSpec");
      if (!_ || !H) return;
      const F = JSON.parse(H), ne = L.current;
      if (!ne) return;
      const r = ne.getBoundingClientRect(), m = {
        x: $.clientX - r.left - 100,
        y: $.clientY - r.top - 50
      };
      let f = F.name.toLowerCase().replace(/[^a-z0-9]/g, "_"), D = 1, O = f;
      for (; s.some((G) => G.id === O); )
        O = `${f}_${D++}`;
      const J = {
        id: O,
        type: "moduleNode",
        position: m,
        data: {
          label: O,
          moduleType: _,
          args: {},
          inputs: F.inputs,
          outputs: F.outputs
        }
      };
      l((G) => [...G, J]), u(!0);
    },
    [s, l]
  ), De = W(
    ($, _, H) => {
      $.dataTransfer.setData("application/moduleType", _), $.dataTransfer.setData("application/moduleSpec", JSON.stringify(H)), $.dataTransfer.effectAllowed = "move";
    },
    []
  ), Be = W(
    ($, _) => {
      l(
        (H) => H.map((F) => F.id === $ ? { ...F, data: { ...F.data, args: _ } } : F)
      ), u(!0);
    },
    [l]
  ), Se = W(
    ($) => {
      l((_) => _.filter((H) => H.id !== $)), d((_) => _.filter((H) => H.source !== $ && H.target !== $)), v(null), u(!0);
    },
    [l, d]
  ), _e = W(
    ($, _) => {
      if (s.some((H) => H.id === _ && H.id !== $)) {
        E(`Node ID "${_}" already exists`);
        return;
      }
      l(
        (H) => H.map((F) => F.id === $ ? { ...F, id: _, data: { ...F.data, label: _ } } : F)
      ), d(
        (H) => H.map((F) => {
          const ne = { ...F };
          return F.source === $ && (ne.source = _), F.target === $ && (ne.target = _), ne;
        })
      ), v((H) => (H == null ? void 0 : H.id) === $ ? { ...H, id: _ } : H), u(!0);
    },
    [s, l, d]
  ), We = W(() => {
    l([]), d([]), R({ title: "New Configuration" }), p(""), u(!0), T(!1);
  }, [l, d]), Ce = W(async () => {
    try {
      const $ = Ie(s, a, h), _ = await o.toYaml($);
      b(_.yaml), C(!0);
    } catch ($) {
      E(`Failed to generate YAML: ${$}`);
    }
  }, [n, s, a, h]), oe = {
    padding: "6px 12px",
    border: `1px solid ${U}`,
    borderRadius: "6px",
    background: P,
    color: Q,
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: 500
  };
  return /* @__PURE__ */ i("div", { style: { display: "flex", height: "100vh", width: "100%", background: A }, children: [
    /* @__PURE__ */ e("div", { style: { width: "240px", borderRight: `1px solid ${U}`, background: P }, children: /* @__PURE__ */ e(Vt, { registry: S, onDragStart: De }) }),
    /* @__PURE__ */ i("div", { style: { flex: 1, display: "flex", flexDirection: "column" }, children: [
      /* @__PURE__ */ i(
        "div",
        {
          style: {
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "8px 12px",
            borderBottom: `1px solid ${U}`,
            background: P
          },
          children: [
            /* @__PURE__ */ e("button", { onClick: () => T(!0), style: oe, children: "Open" }),
            /* @__PURE__ */ e("button", { onClick: We, style: oe, children: "New" }),
            /* @__PURE__ */ e(
              "button",
              {
                onClick: we,
                disabled: !k || !g,
                style: {
                  ...oe,
                  background: k && g ? fe : U,
                  color: k && g ? "#fff" : te,
                  cursor: k && g ? "pointer" : "not-allowed"
                },
                children: "Save"
              }
            ),
            /* @__PURE__ */ e(
              "button",
              {
                onClick: ie,
                disabled: Y || !g,
                style: {
                  ...oe,
                  background: g && !Y ? "#22c55e" : U,
                  color: g && !Y ? "#fff" : te,
                  cursor: g && !Y ? "pointer" : "not-allowed"
                },
                children: Y ? "Applying..." : "Apply to Simulation"
              }
            ),
            /* @__PURE__ */ e("div", { style: { width: "1px", height: "20px", background: U } }),
            /* @__PURE__ */ e("button", { onClick: ge, style: oe, children: "Auto Layout" }),
            /* @__PURE__ */ e("button", { onClick: Ce, style: oe, children: "View YAML" }),
            /* @__PURE__ */ e("div", { style: { flex: 1 } }),
            g && /* @__PURE__ */ i("span", { style: { fontSize: "12px", color: te }, children: [
              g,
              k && /* @__PURE__ */ e("span", { style: { color: "#f59e0b" }, children: " (unsaved)" })
            ] })
          ]
        }
      ),
      w && /* @__PURE__ */ i(
        "div",
        {
          style: {
            padding: "8px 12px",
            background: w.includes("success") ? "#14352a" : "#3b1c1c",
            borderBottom: `1px solid ${w.includes("success") ? "#22c55e" : "#7f1d1d"}`,
            color: w.includes("success") ? "#86efac" : "#fca5a5",
            fontSize: "13px"
          },
          children: [
            w,
            /* @__PURE__ */ e(
              "button",
              {
                onClick: () => E(null),
                style: {
                  marginLeft: "8px",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: w.includes("success") ? "#86efac" : "#fca5a5"
                },
                children: "✕"
              }
            )
          ]
        }
      ),
      /* @__PURE__ */ e("div", { ref: L, style: { flex: 1, background: A }, onDragOver: Le, onDrop: ze, children: /* @__PURE__ */ i(
        Xe,
        {
          nodes: s,
          edges: a,
          onNodesChange: c,
          onEdgesChange: y,
          onConnect: Re,
          onSelectionChange: Ee,
          onNodeDragStop: Te,
          nodeTypes: Z,
          fitView: !0,
          snapToGrid: !0,
          snapGrid: [15, 15],
          deleteKeyCode: ["Backspace", "Delete"],
          onNodesDelete: () => u(!0),
          onEdgesDelete: () => u(!0),
          style: { background: A },
          children: [
            /* @__PURE__ */ e(Qe, { variant: ut.Dots, gap: 20, size: 1, color: U }),
            /* @__PURE__ */ e(Ze, { style: { background: P, border: `1px solid ${U}`, borderRadius: "6px" } }),
            /* @__PURE__ */ e(
              pt,
              {
                nodeColor: ($) => {
                  const _ = $.data;
                  return _.moduleType.includes(".neuro.") ? "var(--primary)" : _.moduleType.includes(".ecology.") ? "#22c55e" : "#a855f7";
                },
                maskColor: "rgba(11, 16, 32, 0.7)",
                style: { background: P, border: `1px solid ${U}`, borderRadius: "6px" }
              }
            ),
            h.title && /* @__PURE__ */ e(ht, { position: "top-center", children: /* @__PURE__ */ e("div", { style: { padding: "6px 14px", background: P, borderRadius: "6px", border: `1px solid ${U}`, fontSize: "14px", fontWeight: 600, color: Q }, children: h.title }) })
          ]
        }
      ) })
    ] }),
    /* @__PURE__ */ e("div", { style: { width: "280px", borderLeft: `1px solid ${U}`, background: P }, children: /* @__PURE__ */ e(
      Ut,
      {
        selectedNode: x,
        registry: S,
        onUpdateNode: Be,
        onDeleteNode: Se,
        onRenameNode: _e
      }
    ) }),
    q && /* @__PURE__ */ e(
      "div",
      {
        style: {
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.7)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1e3
        },
        onClick: () => T(!1),
        children: /* @__PURE__ */ i(
          "div",
          {
            style: {
              background: P,
              borderRadius: "10px",
              border: `1px solid ${U}`,
              width: "400px",
              maxHeight: "500px",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
              boxShadow: "0 8px 32px rgba(0,0,0,0.4)"
            },
            onClick: ($) => $.stopPropagation(),
            children: [
              /* @__PURE__ */ e("div", { style: { padding: "16px", borderBottom: `1px solid ${U}` }, children: /* @__PURE__ */ e("h3", { style: { margin: 0, fontSize: "16px", color: Q, fontWeight: 600 }, children: "Open Configuration" }) }),
              /* @__PURE__ */ i("div", { style: { flex: 1, overflow: "auto", padding: "8px" }, children: [
                z.map(($) => /* @__PURE__ */ i(
                  "div",
                  {
                    onClick: () => {
                      $.is_dir ? o.listFiles($.path).then(I) : de($.path);
                    },
                    style: {
                      padding: "10px 12px",
                      cursor: "pointer",
                      borderRadius: "6px",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      color: Q,
                      fontSize: "13px"
                    },
                    onMouseOver: (_) => _.currentTarget.style.background = A,
                    onMouseOut: (_) => _.currentTarget.style.background = "transparent",
                    children: [
                      /* @__PURE__ */ e("span", { children: $.is_dir ? "📁" : "📄" }),
                      /* @__PURE__ */ e("span", { children: $.name })
                    ]
                  },
                  $.path
                )),
                z.length === 0 && /* @__PURE__ */ e("div", { style: { padding: "16px", textAlign: "center", color: te, fontSize: "13px" }, children: "No config files found" })
              ] }),
              /* @__PURE__ */ e("div", { style: { padding: "12px", borderTop: `1px solid ${U}`, display: "flex", justifyContent: "flex-end" }, children: /* @__PURE__ */ e("button", { onClick: () => T(!1), style: oe, children: "Cancel" }) })
            ]
          }
        )
      }
    ),
    M && /* @__PURE__ */ e(
      "div",
      {
        style: {
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.7)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1e3
        },
        onClick: () => C(!1),
        children: /* @__PURE__ */ i(
          "div",
          {
            style: {
              background: P,
              borderRadius: "10px",
              border: `1px solid ${U}`,
              width: "600px",
              maxHeight: "80vh",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
              boxShadow: "0 8px 32px rgba(0,0,0,0.4)"
            },
            onClick: ($) => $.stopPropagation(),
            children: [
              /* @__PURE__ */ i("div", { style: { padding: "16px", borderBottom: `1px solid ${U}`, display: "flex", justifyContent: "space-between", alignItems: "center" }, children: [
                /* @__PURE__ */ e("h3", { style: { margin: 0, fontSize: "16px", color: Q, fontWeight: 600 }, children: "YAML Preview" }),
                /* @__PURE__ */ e(
                  "button",
                  {
                    onClick: () => {
                      navigator.clipboard.writeText(V);
                    },
                    style: {
                      ...oe,
                      padding: "4px 12px",
                      fontSize: "12px"
                    },
                    children: "Copy"
                  }
                )
              ] }),
              /* @__PURE__ */ e(
                "pre",
                {
                  style: {
                    flex: 1,
                    overflow: "auto",
                    padding: "16px",
                    margin: 0,
                    background: A,
                    color: Q,
                    fontSize: "12px",
                    fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
                    lineHeight: 1.5
                  },
                  children: V
                }
              ),
              /* @__PURE__ */ e("div", { style: { padding: "12px", borderTop: `1px solid ${U}`, display: "flex", justifyContent: "flex-end" }, children: /* @__PURE__ */ e("button", { onClick: () => C(!1), style: oe, children: "Close" }) })
            ]
          }
        )
      }
    )
  ] });
};
function Gt({
  headerLeft: n,
  headerRight: t,
  chatAdapter: o
}) {
  var q;
  const s = Ne(), { state: l, actions: c } = re(), [a, d] = B(!1), [y, S] = B(!1), [N, x] = B(!1), v = ae(null), g = ae(null), p = (T) => {
    if (typeof window > "u") return null;
    try {
      const M = window.sessionStorage.getItem(T);
      if (!M) return null;
      const C = JSON.parse(M);
      return !C || typeof C != "object" ? null : C;
    } catch {
      return null;
    }
  }, h = (T, M) => {
    if (!(typeof window > "u"))
      try {
        window.sessionStorage.setItem(T, JSON.stringify(M));
      } catch {
      }
  }, R = async () => {
    try {
      const T = await s.state(), M = T == null ? void 0 : T.target, C = T == null ? void 0 : T.run, V = (M == null ? void 0 : M.modelId) ?? (C == null ? void 0 : C.model_id) ?? (C == null ? void 0 : C.modelId), b = (M == null ? void 0 : M.spaceId) ?? (C == null ? void 0 : C.project_id) ?? (C == null ? void 0 : C.spaceId);
      if (V) return `simui-controls:model:${V}`;
      if (b) return `simui-controls:space:${b}`;
    } catch {
    }
    return "simui-controls:generic";
  }, k = W(async () => {
    const T = await s.spec();
    c.setSpec(T);
    const M = {}, C = /* @__PURE__ */ new Set();
    for (const A of T.controls || [])
      xe(A) && (C.add(A.name), M[A.name] = A.default), pe(A) && (C.add(A.name), M[A.name] = String(A.default ?? ""));
    const V = await R();
    g.current = V;
    const b = p(V), L = {};
    if (b)
      for (const [A, P] of Object.entries(b))
        C.has(A) && (L[A] = P);
    c.setControls({ ...M, ...L });
  }, [s, c]), u = W(
    (T) => {
      switch (T.type) {
        case "snapshot": {
          const M = T.data;
          M != null && M.status && c.setStatus(M.status), Array.isArray(M == null ? void 0 : M.visuals) && c.setVisuals(M.visuals), Array.isArray(M == null ? void 0 : M.events) && c.setEvents(M.events);
          break;
        }
        case "tick": {
          const M = T.data;
          M != null && M.status && c.setStatus(M.status), Array.isArray(M == null ? void 0 : M.visuals) && c.setVisuals(M.visuals), M != null && M.event && c.appendEvent(M.event);
          break;
        }
        case "event": {
          const M = T.data;
          c.appendEvent(M);
          break;
        }
        case "status":
        case "heartbeat": {
          const M = T.data;
          c.setStatus(M);
          break;
        }
      }
    },
    [c]
  );
  ee(() => ((async () => {
    await k(), v.current = s.subscribeSSE(
      u,
      (M) => {
        console.error("SSE error:", M), d(!1);
      }
    ), d(!0);
  })(), () => {
    v.current && (v.current.close(), v.current = null), d(!1);
  }), [s, u, k]), ee(() => {
    const T = g.current;
    T && h(T, l.controls);
  }, [l.controls]);
  const w = W(async () => {
    var V, b;
    const T = {};
    for (const L of ((V = l.spec) == null ? void 0 : V.controls) || []) {
      if (!xe(L)) continue;
      const A = l.controls[L.name] ?? L.default, P = typeof A == "number" ? A : Number(String(A));
      Number.isFinite(P) && (T[L.name] = P);
    }
    for (const L of ((b = l.spec) == null ? void 0 : b.controls) || []) {
      if (!pe(L)) continue;
      const A = l.controls[L.name] ?? L.default, P = typeof A == "string" ? A : String(A);
      if (P.trim() !== "")
        try {
          T[L.name] = JSON.parse(P);
        } catch (Q) {
          console.error("Invalid JSON control:", L.name, Q), alert(`Invalid JSON for "${L.label || L.name}". Please fix it and try again.`);
          return;
        }
    }
    const M = Number(T.duration), C = typeof T.tick_dt == "number" ? T.tick_dt : void 0;
    c.setVisuals([]), c.setEvents([]), await s.run(M, C, T);
  }, [s, l.controls, l.spec, c]), E = W(async () => {
    await s.pause();
  }, [s]), z = W(async () => {
    await s.resume();
  }, [s]), I = W(async () => {
    await s.reset(), c.setEvents([]);
  }, [s, c]);
  return /* @__PURE__ */ i(ce, { children: [
    /* @__PURE__ */ i("header", { className: "app-header", children: [
      /* @__PURE__ */ i("div", { className: "app-header-left", children: [
        /* @__PURE__ */ e(
          "button",
          {
            className: "btn btn-small lg:hidden",
            style: { display: window.innerWidth >= 1024 ? "none" : "flex", alignItems: "center", justifyContent: "center", padding: "8px" },
            onClick: () => S(!y),
            title: "Toggle controls",
            children: /* @__PURE__ */ i("svg", { width: "20", height: "20", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", children: [
              /* @__PURE__ */ e("line", { x1: "3", y1: "12", x2: "21", y2: "12" }),
              /* @__PURE__ */ e("line", { x1: "3", y1: "6", x2: "21", y2: "6" }),
              /* @__PURE__ */ e("line", { x1: "3", y1: "18", x2: "21", y2: "18" })
            ] })
          }
        ),
        n,
        /* @__PURE__ */ e("h1", { className: "app-title", children: ((q = l.spec) == null ? void 0 : q.title) || "BioSim UI" })
      ] }),
      /* @__PURE__ */ i("div", { className: "app-header-right", children: [
        t,
        /* @__PURE__ */ e("div", { className: "app-status", children: a && /* @__PURE__ */ e("div", { className: "sse-indicator", title: "Stream Connected" }) }),
        /* @__PURE__ */ e(
          "button",
          {
            className: "btn btn-small lg:hidden",
            style: { display: window.innerWidth >= 1024 ? "none" : "flex", alignItems: "center", justifyContent: "center", padding: "8px" },
            onClick: () => x(!N),
            title: "Toggle events",
            children: /* @__PURE__ */ i("svg", { width: "20", height: "20", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", children: [
              /* @__PURE__ */ e("circle", { cx: "12", cy: "12", r: "10" }),
              /* @__PURE__ */ e("line", { x1: "12", y1: "16", x2: "12", y2: "12" }),
              /* @__PURE__ */ e("line", { x1: "12", y1: "8", x2: "12.01", y2: "8" })
            ] })
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ e("aside", { className: `app-sidebar-left ${y ? "open" : ""}`, children: /* @__PURE__ */ e(Nt, { onRun: w, onPause: E, onResume: z, onReset: I }) }),
    /* @__PURE__ */ e("main", { className: "app-main", children: /* @__PURE__ */ e(It, { chatAdapter: o }) }),
    /* @__PURE__ */ e("aside", { className: `app-sidebar-right ${N ? "open" : ""}`, children: /* @__PURE__ */ e(jt, {}) }),
    (y || N) && /* @__PURE__ */ e(
      "div",
      {
        className: "drawer-backdrop",
        onClick: () => {
          S(!1), x(!1);
        }
      }
    )
  ] });
}
function Kt() {
  const n = Ne();
  return n.editor ? /* @__PURE__ */ e(Yt, { api: n }) : null;
}
function qt({
  initialMode: n,
  editorEnabled: t,
  headerLeft: o,
  headerRight: s,
  chatAdapter: l
}) {
  const [c, a] = B(n ?? "simulation");
  ee(() => {
    if (!t) {
      a("simulation");
      return;
    }
    window.location.hash.slice(1) === "editor" && a("editor");
    const S = () => {
      const N = window.location.hash.slice(1);
      a(N === "editor" ? "editor" : "simulation");
    };
    return window.addEventListener("hashchange", S), () => window.removeEventListener("hashchange", S);
  }, [t]);
  const d = () => {
    if (!t) return;
    const y = c === "simulation" ? "editor" : "simulation";
    window.location.hash = y === "editor" ? "editor" : "", a(y);
  };
  return c === "editor" && t ? /* @__PURE__ */ i("div", { className: "app", style: { height: "100%" }, children: [
    /* @__PURE__ */ e("div", { style: { position: "absolute", top: "8px", right: "8px", zIndex: 1001 }, children: /* @__PURE__ */ e(
      "button",
      {
        onClick: d,
        style: {
          padding: "6px 12px",
          background: "var(--primary)",
          color: "#fff",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
          fontSize: "13px",
          boxShadow: "0 2px 4px rgba(0,0,0,0.2)"
        },
        children: "Back to Simulation"
      }
    ) }),
    /* @__PURE__ */ e(Kt, {})
  ] }) : /* @__PURE__ */ i("div", { className: "app", children: [
    /* @__PURE__ */ e("div", { className: "app-layout", children: /* @__PURE__ */ e(Gt, { headerLeft: o, headerRight: s, chatAdapter: l }) }),
    t && /* @__PURE__ */ e("div", { style: { position: "fixed", bottom: "16px", right: "16px", zIndex: 1e3 }, children: /* @__PURE__ */ i(
      "button",
      {
        onClick: d,
        title: "Open Config Editor",
        style: {
          padding: "10px 16px",
          background: "var(--primary)",
          color: "#fff",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
          fontSize: "13px",
          fontWeight: 500,
          boxShadow: "0 2px 8px rgba(20, 184, 166, 0.4)",
          display: "flex",
          alignItems: "center",
          gap: "6px"
        },
        children: [
          /* @__PURE__ */ e("span", { style: { fontSize: "16px" }, children: "⚙" }),
          "Config Editor"
        ]
      }
    ) })
  ] });
}
function Xt({
  initialMode: n,
  headerLeft: t,
  headerRight: o,
  chatAdapter: s
}) {
  const c = !!Ne().editor;
  return /* @__PURE__ */ e(
    qt,
    {
      initialMode: n,
      editorEnabled: c,
      headerLeft: t,
      headerRight: o,
      chatAdapter: s
    }
  );
}
const sn = ({
  api: n,
  className: t,
  style: o,
  height: s = "100vh",
  initialMode: l,
  headerLeft: c,
  headerRight: a,
  chatAdapter: d
}) => {
  const y = t ? `simui-root ${t}` : "simui-root";
  return /* @__PURE__ */ e("div", { className: y, style: { height: s, ...o }, children: /* @__PURE__ */ e(gt, { api: n, children: /* @__PURE__ */ e(yt, { children: /* @__PURE__ */ e(Xt, { initialMode: l, headerLeft: c, headerRight: a, chatAdapter: d }) }) }) });
};
export {
  sn as SimuiApp,
  mt as createSimuiApi
};
