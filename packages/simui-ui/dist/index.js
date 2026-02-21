import { jsx as e, jsxs as i, Fragment as ye } from "react/jsx-runtime";
import st, { createContext as Ye, useMemo as H, useContext as Ke, useState as B, useCallback as T, useEffect as te, memo as qe, useRef as ue } from "react";
import rt from "react-markdown";
import it from "remark-gfm";
import Ce from "dagre";
import { applyNodeChanges as at, applyEdgeChanges as lt, addEdge as je, ReactFlow as Xe, Background as Qe, Controls as Ze, Handle as me, Position as fe, useNodesState as ct, useEdgesState as dt, BackgroundVariant as ut, MiniMap as pt, Panel as ht } from "@xyflow/react";
function mt(n) {
  const t = n.replace(/\/$/, "");
  async function o(l) {
    const d = await fetch(`${t}${l}`);
    if (!d.ok)
      throw new Error(`GET ${l} failed: ${d.status}`);
    return d.json();
  }
  async function s(l, d) {
    const f = await fetch(`${t}${l}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(d)
    });
    if (!f.ok)
      throw new Error(`POST ${l} failed: ${f.status}`);
    return f.json();
  }
  async function a(l, d) {
    const f = await fetch(`${t}${l}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(d)
    });
    if (!f.ok)
      throw new Error(`PUT ${l} failed: ${f.status}`);
    return f.json();
  }
  function c(l, d) {
    const f = new EventSource(`${t}/api/stream`);
    return f.onmessage = (N) => {
      try {
        const w = JSON.parse(N.data);
        l(w);
      } catch (w) {
        console.error("Failed to parse SSE message:", w);
      }
    }, f.onerror = (N) => {
      d && d(N);
    }, {
      close: () => f.close()
    };
  }
  return {
    // Simulation API
    spec: () => o("/api/spec"),
    status: () => o("/api/status"),
    state: () => o("/api/state"),
    events: (l, d = 200) => o(
      `/api/events?${new URLSearchParams({
        ...l != null ? { since_id: String(l) } : {},
        limit: String(d)
      }).toString()}`
    ),
    visuals: () => o("/api/visuals"),
    snapshot: () => o("/api/snapshot"),
    run: (l, d, f) => s("/api/run", { duration: l, tick_dt: d, ...f || {} }),
    pause: () => s("/api/pause", {}),
    resume: () => s("/api/resume", {}),
    reset: () => s("/api/reset", {}),
    subscribeSSE: c,
    // Editor API
    editor: {
      getModules: () => o("/api/editor/modules"),
      getConfig: (l) => o(`/api/editor/config?path=${encodeURIComponent(l)}`),
      getCurrent: () => o("/api/editor/current"),
      saveConfig: (l, d) => a("/api/editor/config", { path: l, graph: d }),
      applyConfig: (l, d) => s("/api/editor/apply", { graph: l, save_path: d }),
      validate: (l) => s("/api/editor/validate", l),
      layout: (l) => s("/api/editor/layout", l),
      toYaml: (l) => s("/api/editor/to-yaml", l),
      fromYaml: (l) => s("/api/editor/from-yaml", { yaml: l }),
      listFiles: (l) => o(`/api/editor/files${l ? `?path=${encodeURIComponent(l)}` : ""}`)
    }
  };
}
function ft() {
  var o;
  return { baseUrl: ((o = window.__BSIM_UI__) == null ? void 0 : o.mountPath) ?? "" };
}
const et = Ye(null), gt = ({
  api: n,
  children: t
}) => {
  const o = H(ft, []), s = H(() => n ?? mt(o.baseUrl), [o.baseUrl, n]);
  return /* @__PURE__ */ e(et.Provider, { value: s, children: t });
};
function Me() {
  const n = Ke(et);
  if (!n) throw new Error("useApi must be used within ApiProvider");
  return n;
}
const tt = Ye(null);
function yt({ children: n }) {
  const [t, o] = B(null), [s, a] = B(null), [c, l] = B([]), [d, f] = B([]), [N, w] = B({ duration: 10, tick_dt: 0.1 }), [S, k] = B(/* @__PURE__ */ new Set()), y = st.useMemo(() => ({
    setSpec: o,
    setStatus: a,
    setVisuals: l,
    setEvents: f,
    appendEvent: (A) => f((M) => [...M, A]),
    setControls: (A) => w((M) => ({ ...M, ...A })),
    setControlsIfUnset: (A) => w((M) => {
      const u = { ...M };
      for (const [v, x] of Object.entries(A)) {
        const b = u[v];
        (!Object.prototype.hasOwnProperty.call(u, v) || b === void 0 || b === "" || typeof b == "number" && !Number.isFinite(b)) && (u[v] = x);
      }
      return u;
    }),
    setVisibleModules: k
  }), []), g = { spec: t, status: s, visuals: c, events: d, controls: N, visibleModules: S }, m = H(() => ({ state: g, actions: y }), [t, s, c, d, N, S, y]);
  return /* @__PURE__ */ e(tt.Provider, { value: m, children: n });
}
function re() {
  const n = Ke(tt);
  if (!n) throw new Error("useUi must be used within UiProvider");
  return n;
}
function $e() {
  const { state: n } = re();
  return H(() => {
    var c;
    const t = Array.isArray((c = n.spec) == null ? void 0 : c.modules) ? n.spec.modules : [], o = n.visuals.map((l) => l.module), s = [], a = /* @__PURE__ */ new Set();
    for (const l of t)
      l && !a.has(l) && (s.push(l), a.add(l));
    for (const l of o)
      l && !a.has(l) && (s.push(l), a.add(l));
    return s;
  }, [n.spec, n.visuals]);
}
function bt() {
  const { state: n } = re();
  return H(() => {
    const t = /* @__PURE__ */ new Map();
    for (const o of n.visuals) {
      const s = t.get(o.module);
      s ? t.set(o.module, [...s, ...o.visuals || []]) : t.set(o.module, o.visuals || []);
    }
    return t;
  }, [n.visuals]);
}
function be(n) {
  return n.type === "number";
}
function de(n) {
  return n.type === "json";
}
function nt(n) {
  if (!Number.isFinite(n)) return "—";
  const t = Math.max(0, n), o = Math.floor(t / 3600), s = Math.floor(t % 3600 / 60), a = Math.floor(t % 60);
  return o > 0 ? `${o}h ${s}m ${a}s` : s > 0 ? `${s}m ${a}s` : `${a}s`;
}
function Pe({
  id: n,
  title: t,
  summary: o,
  open: s,
  onToggle: a,
  children: c
}) {
  return /* @__PURE__ */ i("section", { className: `sidebar-panel ${s ? "is-open" : "is-closed"}`, children: [
    /* @__PURE__ */ i(
      "button",
      {
        type: "button",
        className: "sidebar-panel-header",
        onClick: () => a(n),
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
function xt() {
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
function vt() {
  var F, D, X;
  const { state: n, actions: t } = re(), o = n.status, s = (F = n.spec) == null ? void 0 : F.capabilities, a = (s == null ? void 0 : s.controls) ?? !0;
  a && (s == null || s.run), a && (s == null || s.pauseResume), a && (s == null || s.reset);
  const c = $e(), l = (((D = n.spec) == null ? void 0 : D.controls) || []).filter(be), d = /* @__PURE__ */ new Set(["wiring", "wiring_layout", "module_ports", "models"]), f = (((X = n.spec) == null ? void 0 : X.controls) || []).filter(de).filter((C) => !d.has(C.name)), N = T((C, O) => t.setControls({ [C]: O }), [t]), w = (C) => {
    if (C === "" || C === null || C === void 0) return Number.NaN;
    const O = typeof C == "number" ? C : Number(String(C));
    return Number.isFinite(O) ? O : Number.NaN;
  }, S = (C) => {
    var O;
    return (O = l.find((W) => W.name === C)) == null ? void 0 : O.default;
  };
  w(n.controls.duration ?? S("duration"));
  const k = w(n.controls.tick_dt ?? S("tick_dt")), y = w(o == null ? void 0 : o.tick_count) * k, g = /* @__PURE__ */ new Set(["duration", "tick_dt"]), m = l.filter((C) => g.has(C.name)), A = l.filter((C) => !g.has(C.name)), M = new Set(c), u = /* @__PURE__ */ new Map(), v = [];
  for (const C of A) {
    const O = C.name.indexOf(".");
    if (O > 0) {
      const W = C.name.slice(0, O);
      if (M.has(W)) {
        const Y = u.get(W) || [];
        Y.push(C), u.set(W, Y);
        continue;
      }
    }
    v.push(C);
  }
  const x = Array.from(u.keys()), [b, R] = B({});
  te(() => {
    x.length !== 0 && R((C) => {
      const O = { ...C };
      for (const W of x)
        W in O || (O[W] = !1);
      return O;
    });
  }, [x.join("|")]);
  const [V, P] = B(!1);
  return /* @__PURE__ */ i("div", { className: "controls", children: [
    m.length > 0 && /* @__PURE__ */ e("div", { className: "control-fields", children: m.map((C) => /* @__PURE__ */ i("div", { className: "control-field", children: [
      /* @__PURE__ */ e("label", { htmlFor: `control-${C.name}`, className: "control-label", children: C.label || C.name }),
      /* @__PURE__ */ e("input", { id: `control-${C.name}`, type: "number", className: "control-input", value: String(n.controls[C.name] ?? C.default), min: C.min, max: C.max, step: C.step ?? "any", onChange: (O) => N(C.name, O.target.value), disabled: !!(o != null && o.running) || !a })
    ] }, C.name)) }),
    u.size > 0 && /* @__PURE__ */ e("div", { className: "control-fields", children: Array.from(u.entries()).map(([C, O]) => /* @__PURE__ */ i("div", { className: "control-group", children: [
      /* @__PURE__ */ i(
        "button",
        {
          type: "button",
          className: "control-group-header",
          onClick: () => R((W) => ({ ...W, [C]: !W[C] })),
          "aria-expanded": b[C] ?? !1,
          children: [
            /* @__PURE__ */ e("span", { className: `control-group-chevron ${b[C] ? "open" : ""}`, "aria-hidden": "true", children: "▸" }),
            /* @__PURE__ */ e("span", { className: "control-group-title", children: C }),
            /* @__PURE__ */ i("span", { className: "control-group-summary", children: [
              O.length,
              " params"
            ] })
          ]
        }
      ),
      b[C] && /* @__PURE__ */ e("div", { className: "control-group-body", children: /* @__PURE__ */ e("div", { className: "control-fields", style: { marginTop: 0 }, children: O.map((W) => {
        const Y = W.name.indexOf("."), Z = Y > 0 ? W.name.slice(Y + 1) : W.name;
        return /* @__PURE__ */ i("div", { className: "control-field", children: [
          /* @__PURE__ */ e("label", { htmlFor: `control-${W.name}`, className: "control-label", children: W.label || Z }),
          /* @__PURE__ */ e("input", { id: `control-${W.name}`, type: "number", className: "control-input", value: String(n.controls[W.name] ?? W.default), min: W.min, max: W.max, step: W.step ?? "any", onChange: (ne) => N(W.name, ne.target.value), disabled: !!(o != null && o.running) || !a })
        ] }, W.name);
      }) }) })
    ] }, C)) }),
    v.length > 0 && /* @__PURE__ */ e("div", { className: "control-fields", children: v.map((C) => /* @__PURE__ */ i("div", { className: "control-field", children: [
      /* @__PURE__ */ e("label", { htmlFor: `control-${C.name}`, className: "control-label", children: C.label || C.name }),
      /* @__PURE__ */ e("input", { id: `control-${C.name}`, type: "number", className: "control-input", value: String(n.controls[C.name] ?? C.default), min: C.min, max: C.max, step: C.step ?? "any", onChange: (O) => N(C.name, O.target.value), disabled: !!(o != null && o.running) || !a })
    ] }, C.name)) }),
    f.length > 0 && /* @__PURE__ */ i("div", { className: "control-group", children: [
      /* @__PURE__ */ i(
        "button",
        {
          type: "button",
          className: "control-group-header",
          onClick: () => P((C) => !C),
          "aria-expanded": V,
          children: [
            /* @__PURE__ */ e("span", { className: `control-group-chevron ${V ? "open" : ""}`, "aria-hidden": "true", children: "▸" }),
            /* @__PURE__ */ e("span", { className: "control-group-title", children: "Advanced (JSON)" }),
            /* @__PURE__ */ i("span", { className: "control-group-summary", children: [
              f.length,
              " fields"
            ] })
          ]
        }
      ),
      V && /* @__PURE__ */ e("div", { className: "control-group-body", children: /* @__PURE__ */ e("div", { className: "control-fields", children: f.map((C) => /* @__PURE__ */ i("div", { className: "control-field", children: [
        /* @__PURE__ */ e("label", { htmlFor: `control-${C.name}`, className: "control-label", children: C.label || C.name }),
        /* @__PURE__ */ e(
          "textarea",
          {
            id: `control-${C.name}`,
            className: "control-input",
            value: String(n.controls[C.name] ?? C.default),
            placeholder: C.placeholder,
            rows: C.rows ?? 6,
            onChange: (O) => N(C.name, O.target.value),
            disabled: !!(o != null && o.running) || !a
          }
        )
      ] }, C.name)) }) })
    ] }),
    /* @__PURE__ */ e("div", { className: "control-derived", children: (o == null ? void 0 : o.running) && Number.isFinite(y) && /* @__PURE__ */ i("div", { className: "control-derived-row", children: [
      /* @__PURE__ */ e("span", { className: "control-derived-label", children: "Sim time" }),
      /* @__PURE__ */ e("span", { className: "control-derived-value", children: nt(y) })
    ] }) })
  ] });
}
function wt() {
  const { state: n, actions: t } = re(), o = $e();
  te(() => {
    o.length > 0 && n.visibleModules.size === 0 && t.setVisibleModules(new Set(o));
  }, [o, n.visibleModules.size, t]);
  const s = T((l) => {
    const d = new Set(n.visibleModules);
    d.has(l) ? d.delete(l) : d.add(l), t.setVisibleModules(d);
  }, [n.visibleModules, t]), a = T(() => t.setVisibleModules(new Set(o)), [o, t]), c = T(() => t.setVisibleModules(/* @__PURE__ */ new Set()), [t]);
  return o.length === 0 ? /* @__PURE__ */ e("div", { className: "modules", children: /* @__PURE__ */ e("div", { className: "empty-state", children: /* @__PURE__ */ e("p", { children: "No modules available" }) }) }) : /* @__PURE__ */ i("div", { className: "modules", children: [
    /* @__PURE__ */ e("div", { className: "module-list", children: o.map((l) => /* @__PURE__ */ i("label", { className: "module-item", children: [
      /* @__PURE__ */ e("input", { type: "checkbox", className: "module-checkbox", checked: n.visibleModules.has(l), onChange: () => s(l) }),
      /* @__PURE__ */ e("span", { className: "module-name", children: l })
    ] }, l)) }),
    /* @__PURE__ */ i("div", { className: "module-actions", children: [
      /* @__PURE__ */ e("button", { type: "button", className: "btn btn-small", onClick: a, children: "Show All" }),
      /* @__PURE__ */ e("button", { type: "button", className: "btn btn-small", onClick: c, children: "Hide All" })
    ] })
  ] });
}
function Nt(n) {
  const { state: t } = re(), s = $e().length, a = t.visibleModules.size || s, [c, l] = B({
    controls: !1,
    status: !1,
    modules: !1
  }), d = T((S) => {
    l((k) => ({ ...k, [S]: !k[S] }));
  }, []), f = H(() => {
    var k;
    const S = t.status;
    return S ? S.error ? "Error" : S.running ? `${S.paused ? "Paused" : "Running"} · Ticks: ${((k = S.tick_count) == null ? void 0 : k.toLocaleString()) || 0}` : "Idle" : "Unknown";
  }, [t.status]), N = H(() => {
    var y;
    const k = (Array.isArray((y = t.spec) == null ? void 0 : y.controls) ? t.spec.controls : []).filter((g) => be(g) || de(g)).length;
    return k ? `${k} controls` : "No controls";
  }, [t.spec]), w = H(() => s === 0 ? "No modules" : `${a}/${s} shown`, [a, s]);
  return /* @__PURE__ */ e("div", { className: "sidebar", children: /* @__PURE__ */ i("div", { className: "sidebar-content", children: [
    /* @__PURE__ */ e(Pe, { id: "status", title: "Status", summary: f, open: c.status, onToggle: d, children: /* @__PURE__ */ e(xt, {}) }),
    /* @__PURE__ */ e(Pe, { id: "controls", title: "Controls", summary: N, open: c.controls, onToggle: d, children: /* @__PURE__ */ e(vt, {}) }),
    /* @__PURE__ */ e(Pe, { id: "modules", title: "Modules", summary: w, open: c.modules, onToggle: d, children: /* @__PURE__ */ e(wt, {}) }),
    /* @__PURE__ */ e(St, { ...n })
  ] }) });
}
function St({ onRun: n, onPause: t, onResume: o, onReset: s }) {
  var m, A;
  const { state: a } = re(), c = a.status, d = (Array.isArray((m = a.spec) == null ? void 0 : m.controls) ? a.spec.controls : []).find((M) => be(M) && M.name === "duration"), f = d && be(d) ? d.default : void 0, N = (() => {
    const M = a.controls.duration ?? f, u = typeof M == "number" ? M : Number(String(M));
    return Number.isFinite(u) ? u : NaN;
  })(), w = (A = a.spec) == null ? void 0 : A.capabilities, S = (w == null ? void 0 : w.controls) ?? !0, k = S && ((w == null ? void 0 : w.run) ?? !0), y = S && ((w == null ? void 0 : w.pauseResume) ?? !0), g = S && ((w == null ? void 0 : w.reset) ?? !0);
  return /* @__PURE__ */ i("div", { className: "sidebar-actions", children: [
    /* @__PURE__ */ i("div", { className: "sidebar-actions-row", children: [
      /* @__PURE__ */ e("div", { className: "sidebar-actions-label", children: "Duration" }),
      /* @__PURE__ */ e("div", { className: "sidebar-actions-value", children: Number.isFinite(N) ? nt(N) : "—" })
    ] }),
    k && /* @__PURE__ */ e("button", { type: "button", className: "btn btn-primary", onClick: n, disabled: !!(c != null && c.running), children: "Run Simulation" }),
    y && (c == null ? void 0 : c.running) && /* @__PURE__ */ e("button", { type: "button", className: "btn btn-secondary", onClick: c.paused ? o : t, children: c.paused ? "Resume" : "Pause" }),
    g && /* @__PURE__ */ e("button", { type: "button", className: "btn btn-outline", onClick: s, children: "Reset" })
  ] });
}
function Ct({ data: n, isFullscreen: t }) {
  const f = (n == null ? void 0 : n.series) || [], { xMin: N, xMax: w, yMin: S, yMax: k } = H(() => {
    let u = 0, v = 1, x = 0, b = 1;
    for (const R of f) {
      const V = Array.isArray(R == null ? void 0 : R.points) ? R.points : [];
      for (const P of V) {
        const F = Number(P == null ? void 0 : P[0]) || 0, D = Number(P == null ? void 0 : P[1]) || 0;
        F < u && (u = F), F > v && (v = F), D < x && (x = D), D > b && (b = D);
      }
    }
    return {
      xMin: u,
      xMax: v <= u ? u + 1 : v,
      yMin: x,
      yMax: b <= x ? x + 1 : b
    };
  }, [f]), y = (u) => 50 + (u - N) / (w - N) * 450, g = (u) => 20 + (1 - (u - S) / (k - S)) * 180, m = (u) => (u.points || []).map((v) => `${y(v[0])},${g(v[1])}`).join(" "), A = (u, v, x = 5) => Array.from({ length: x + 1 }, (b, R) => u + R * (v - u) / x);
  return /* @__PURE__ */ e("div", { style: t ? { width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" } : {}, className: t ? "fullscreen-renderer" : "", children: /* @__PURE__ */ i("svg", { viewBox: "0 0 520 240", width: "100%", height: t ? "100%" : 240, preserveAspectRatio: t ? "xMidYMid meet" : void 0, children: [
    /* @__PURE__ */ e("line", { x1: 50, y1: 200, x2: 500, y2: 200, className: "axis" }),
    /* @__PURE__ */ e("line", { x1: 50, y1: 20, x2: 50, y2: 200, className: "axis" }),
    A(N, w, 5).map((u) => /* @__PURE__ */ i("g", { children: [
      /* @__PURE__ */ e("line", { x1: y(u), y1: 200, x2: y(u), y2: 204, className: "tick" }),
      /* @__PURE__ */ e("text", { x: y(u), y: 234, className: "ticklbl", textAnchor: "middle", children: u.toFixed(2) })
    ] }, `tx-${u}`)),
    A(S, k, 4).map((u) => /* @__PURE__ */ i("g", { children: [
      /* @__PURE__ */ e("line", { x1: 46, y1: g(u), x2: 50, y2: g(u), className: "tick" }),
      /* @__PURE__ */ e("text", { x: 44, y: g(u) + 3, className: "ticklbl", textAnchor: "end", children: u.toFixed(2) })
    ] }, `ty-${u}`)),
    f.map((u, v) => /* @__PURE__ */ e("polyline", { points: m(u), fill: "none", stroke: v === 0 ? "var(--primary)" : v === 1 ? "var(--danger)" : "var(--accent)", strokeWidth: 2 }, v))
  ] }) });
}
function kt({ data: n, isFullscreen: t }) {
  const f = (n == null ? void 0 : n.items) || [], N = H(() => {
    let m = 1;
    for (const A of f) {
      const M = Number((A == null ? void 0 : A.value) || 0);
      Number.isFinite(M) && M > m && (m = M);
    }
    return m;
  }, [f]), w = (m, A) => 50 + (m + 0.5) * 450 / Math.max(1, A), S = (m) => Math.max(8, 0.8 * 450 / Math.max(1, m)), k = (m) => 20 + (1 - Math.min(1, Math.max(0, m / N))) * 180;
  return /* @__PURE__ */ e("div", { style: t ? { width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" } : {}, children: /* @__PURE__ */ i("svg", { viewBox: "0 0 520 240", width: "100%", height: t ? "100%" : 240, preserveAspectRatio: t ? "xMidYMid meet" : void 0, children: [
    /* @__PURE__ */ e("line", { x1: 50, y1: 200, x2: 500, y2: 200, className: "axis" }),
    /* @__PURE__ */ e("line", { x1: 50, y1: 20, x2: 50, y2: 200, className: "axis" }),
    ((m = 4) => Array.from({ length: m + 1 }, (A, M) => M * N / m))(4).map((m) => /* @__PURE__ */ i("g", { children: [
      /* @__PURE__ */ e("line", { x1: 46, y1: k(m), x2: 50, y2: k(m), className: "tick" }),
      /* @__PURE__ */ e("text", { x: 44, y: k(m) + 3, className: "ticklbl", textAnchor: "end", children: m.toFixed(0) })
    ] }, `ty-${m}`)),
    f.map((m, A) => /* @__PURE__ */ i("g", { children: [
      /* @__PURE__ */ e("rect", { x: w(A, f.length) - S(f.length) / 2, y: k(m.value), width: S(f.length), height: 200 - k(m.value), className: "bar" }),
      /* @__PURE__ */ e("text", { x: w(A, f.length), y: 234, className: "xlbl", textAnchor: "middle", children: m.label })
    ] }, A))
  ] }) });
}
function Mt({ data: n, isFullscreen: t }) {
  var f, N, w, S;
  const o = (f = n.columns) != null && f.length ? n.columns : (N = n.items) != null && N.length ? Object.keys(n.items[0]) : [], s = (w = n.rows) != null && w.length ? n.rows : ((S = n.items) == null ? void 0 : S.map((k) => o.map((y) => k[y]))) || [], a = t ? { width: "100%", height: "100%", overflow: "auto" } : { overflow: "auto" }, c = t ? { width: "100%", borderCollapse: "collapse", fontSize: "16px" } : { width: "100%", borderCollapse: "collapse" }, l = t ? { textAlign: "left", borderBottom: "1px solid var(--border)", padding: "12px 16px", fontWeight: 600, fontSize: "18px" } : { textAlign: "left", borderBottom: "1px solid var(--border)", padding: 8, fontWeight: 600 }, d = t ? { borderBottom: "1px solid var(--border)", padding: "10px 16px", fontSize: "16px" } : { borderBottom: "1px solid var(--border)", padding: "6px 8px" };
  return /* @__PURE__ */ i("div", { className: "table-container", style: a, children: [
    /* @__PURE__ */ i("table", { style: c, children: [
      /* @__PURE__ */ e("thead", { children: /* @__PURE__ */ e("tr", { children: o.map((k) => /* @__PURE__ */ e("th", { style: l, children: k }, k)) }) }),
      /* @__PURE__ */ e("tbody", { children: s.map((k, y) => /* @__PURE__ */ e("tr", { children: k.map((g, m) => /* @__PURE__ */ e("td", { style: d, children: String(g) }, m)) }, y)) })
    ] }),
    (!o || o.length === 0) && /* @__PURE__ */ e("div", { className: "empty", children: "No table data" })
  ] });
}
function $t({ data: n, isFullscreen: t }) {
  if (!(n != null && n.src)) return /* @__PURE__ */ e("div", { className: "empty-state", children: /* @__PURE__ */ e("p", { children: "No image" }) });
  const { src: o, alt: s, width: a, height: c } = n;
  return t ? /* @__PURE__ */ e("div", { style: { width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", overflow: "auto" }, children: /* @__PURE__ */ e(
    "img",
    {
      src: o,
      alt: s || "image",
      style: { maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }
    }
  ) }) : /* @__PURE__ */ e("div", { style: { overflow: "auto" }, children: /* @__PURE__ */ e("img", { src: o, alt: s || "image", width: a, height: c, style: { maxWidth: "100%" } }) });
}
function At({ data: n, isFullscreen: t }) {
  const o = n.nodes || [], s = n.edges || [], a = 520, c = 300, l = 110, d = a / 2, f = c / 2, N = H(() => {
    const S = Math.max(1, o.length), k = /* @__PURE__ */ new Map();
    return o.forEach((y, g) => {
      const m = 2 * Math.PI * g / S;
      k.set(y.id, { x: d + l * Math.cos(m), y: f + l * Math.sin(m) });
    }), k;
  }, [JSON.stringify(o)]);
  return /* @__PURE__ */ e("div", { style: t ? { width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" } : {}, children: /* @__PURE__ */ i("svg", { viewBox: `0 0 ${a} ${c}`, width: "100%", height: t ? "100%" : c, preserveAspectRatio: t ? "xMidYMid meet" : void 0, children: [
    s.map((S, k) => {
      const y = N.get(S.source), g = N.get(S.target);
      return !y || !g ? null : /* @__PURE__ */ e("line", { x1: y.x, y1: y.y, x2: g.x, y2: g.y, stroke: "#64748b", strokeWidth: 1 }, k);
    }),
    o.map((S, k) => {
      const y = N.get(S.id);
      return y ? /* @__PURE__ */ i("g", { children: [
        /* @__PURE__ */ e("circle", { cx: y.x, cy: y.y, r: 14, fill: "#22d3ee" }),
        /* @__PURE__ */ e("text", { x: y.x, y: y.y + 4, fontSize: 10, textAnchor: "middle", fill: "#0f172a", children: S.id })
      ] }, S.id) : null;
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
function zt({ isFullscreen: n, onClick: t }) {
  return /* @__PURE__ */ e("button", { className: "btn btn-small btn-outline fullscreen-btn", onClick: t, title: n ? "Exit fullscreen" : "Fullscreen", children: n ? /* @__PURE__ */ e("svg", { width: "14", height: "14", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", children: /* @__PURE__ */ e("path", { d: "M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3" }) }) : /* @__PURE__ */ e("svg", { width: "14", height: "14", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", children: /* @__PURE__ */ e("path", { d: "M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" }) }) });
}
function Et({ isActive: n, onClick: t }) {
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
function Tt({ visual: n, index: t }) {
  var y;
  const [o, s] = B(!1), [a, c] = B(!1), l = Rt[n.render], d = T(() => {
    s((g) => !g);
  }, []), f = T(() => {
    c((g) => !g);
  }, []), N = T((g) => {
    g.key === "Escape" && o && s(!1);
  }, [o]);
  if (!l)
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
  const w = ((y = n.data) == null ? void 0 : y.title) || `${n.render.charAt(0).toUpperCase() + n.render.slice(1)} #${t + 1}`, S = !!n.description, k = /* @__PURE__ */ i(ye, { children: [
    /* @__PURE__ */ i("div", { className: "card-header", children: [
      /* @__PURE__ */ e("h4", { className: "card-title", children: w }),
      /* @__PURE__ */ i("div", { className: "card-actions", children: [
        /* @__PURE__ */ e("span", { className: "card-type", children: n.render }),
        S && /* @__PURE__ */ e(Et, { isActive: a, onClick: f }),
        /* @__PURE__ */ e(zt, { isFullscreen: o, onClick: d })
      ] })
    ] }),
    a && n.description && /* @__PURE__ */ e("div", { className: "card-description", children: n.description }),
    /* @__PURE__ */ e("div", { className: "card-content", children: /* @__PURE__ */ e(l, { data: n.data, isFullscreen: o }) })
  ] });
  return o ? /* @__PURE__ */ i(ye, { children: [
    /* @__PURE__ */ e("div", { className: "visualization-card placeholder" }),
    /* @__PURE__ */ e("div", { className: "fullscreen-overlay", onClick: d, onKeyDown: N, tabIndex: 0, children: /* @__PURE__ */ e("div", { className: "fullscreen-card", onClick: (g) => g.stopPropagation(), children: k }) })
  ] }) : /* @__PURE__ */ e("div", { className: "visualization-card", children: k });
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
function Lt({ moduleName: n, visuals: t }) {
  return !t || t.length === 0 ? /* @__PURE__ */ i("div", { className: "module-visuals", children: [
    /* @__PURE__ */ e(Fe, { moduleName: n, visualCount: 0 }),
    /* @__PURE__ */ e("div", { className: "empty-state", children: /* @__PURE__ */ e("p", { children: "No visualizations available for this module" }) })
  ] }) : /* @__PURE__ */ i("div", { className: "module-visuals", children: [
    /* @__PURE__ */ e(Fe, { moduleName: n, visualCount: t.length }),
    /* @__PURE__ */ e("div", { className: "visualizations-grid", children: t.map((o, s) => /* @__PURE__ */ e(Tt, { visual: o, index: s }, `${n}-${o.render}-${s}`)) })
  ] });
}
const Bt = qe(Lt);
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
      s && /* @__PURE__ */ i("button", { className: "expand-btn", onClick: (a) => {
        a.stopPropagation(), o(!t);
      }, children: [
        t ? /* @__PURE__ */ e("svg", { width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", children: /* @__PURE__ */ e("polyline", { points: "18 15 12 9 6 15" }) }) : /* @__PURE__ */ e("svg", { width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", children: /* @__PURE__ */ e("polyline", { points: "6 9 12 15 18 9" }) }),
        /* @__PURE__ */ e("span", { children: t ? "Collapse" : "Expand" })
      ] })
    ] }),
    /* @__PURE__ */ e("div", { className: "description-content", children: /* @__PURE__ */ e(rt, { remarkPlugins: [it], children: n }) })
  ] });
}
const ge = "__new__";
function ke(n) {
  const t = n.indexOf(".");
  return t <= 0 || t >= n.length - 1 ? null : { module: n.slice(0, t), port: n.slice(t + 1) };
}
function ot(n) {
  if (!Array.isArray(n)) throw new Error("Wiring must be a JSON array.");
  return n.filter((t) => t && typeof t == "object");
}
function _t(n, t, o, s, a) {
  const c = /* @__PURE__ */ new Map(), l = /* @__PURE__ */ new Map(), d = /* @__PURE__ */ new Set([...t, ...Object.keys(o || {})]);
  for (const [y, g] of Object.entries(o || {})) {
    c.has(y) || c.set(y, /* @__PURE__ */ new Set()), l.has(y) || l.set(y, /* @__PURE__ */ new Set());
    for (const m of g.outputs || []) c.get(y).add(String(m));
    for (const m of g.inputs || []) l.get(y).add(String(m));
  }
  const f = [];
  let N = 0;
  for (const y of n) {
    const g = typeof y.from == "string" ? y.from : "", m = y.to ?? y.targets, A = typeof m == "string" ? [m] : Array.isArray(m) ? m : [], M = ke(g);
    if (M) {
      d.add(M.module), c.has(M.module) || c.set(M.module, /* @__PURE__ */ new Set()), c.get(M.module).add(M.port);
      for (const u of A) {
        if (typeof u != "string") continue;
        const v = ke(u);
        v && (d.add(v.module), l.has(v.module) || l.set(v.module, /* @__PURE__ */ new Set()), l.get(v.module).add(v.port), N += 1, f.push({
          id: `w-${N}-${g}->${u}`,
          source: M.module,
          sourceHandle: M.port,
          target: v.module,
          targetHandle: v.port,
          type: "smoothstep",
          style: { stroke: "#6b7280", strokeWidth: 2 }
        }));
      }
    }
  }
  for (const y of s) d.delete(y);
  const w = new Map(a.map((y) => [y.id, y])), S = Array.from(d).map((y) => {
    const g = w.get(y), m = Array.from(l.get(y) ?? []).sort(), A = Array.from(c.get(y) ?? []).sort();
    return {
      id: y,
      type: "wiringNode",
      position: (g == null ? void 0 : g.position) ?? { x: 0, y: 0 },
      data: { label: y, inputs: m, outputs: A }
    };
  }), k = S.length > 0 && S.every((y) => y.position.x === 0 && y.position.y === 0);
  return { nodes: S, edges: f, needsLayout: k };
}
function Je(n, t) {
  const o = new Ce.graphlib.Graph();
  o.setDefaultEdgeLabel(() => ({}));
  const s = 220, a = 140;
  o.setGraph({ rankdir: "LR", nodesep: 40, ranksep: 80 });
  for (const c of n)
    o.setNode(c.id, { width: s, height: a });
  for (const c of t)
    o.setEdge(c.source, c.target);
  return Ce.layout(o), n.map((c) => {
    const l = o.node(c.id);
    return {
      ...c,
      position: {
        x: l.x - s / 2,
        y: l.y - a / 2
      }
    };
  });
}
function Dt(n) {
  const t = ot(n), o = [];
  let s = 0;
  for (const a of t) {
    const c = typeof a.from == "string" ? a.from : "", l = a.to ?? a.targets, d = typeof l == "string" ? [l] : Array.isArray(l) ? l : [], f = ke(c);
    if (f)
      for (const N of d) {
        if (typeof N != "string") continue;
        const w = ke(N);
        w && (s += 1, o.push({
          id: `w-${s}-${c}->${N}`,
          source: f.module,
          sourceHandle: f.port,
          target: w.module,
          targetHandle: w.port,
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
    const s = `${o.source}.${o.sourceHandle}`, a = `${o.target}.${o.targetHandle}`;
    t.has(s) || t.set(s, /* @__PURE__ */ new Set()), t.get(s).add(a);
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
              me,
              {
                type: "target",
                position: fe.Left,
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
              me,
              {
                type: "target",
                position: fe.Left,
                id: ge,
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
              me,
              {
                type: "source",
                position: fe.Right,
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
              me,
              {
                type: "source",
                position: fe.Right,
                id: ge,
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
function Pt() {
  var E, _, I, ee;
  const n = Me(), { state: t, actions: o } = re(), s = H(() => {
    var p;
    return (((p = t.spec) == null ? void 0 : p.controls) ?? []).find((h) => de(h) && h.name === "wiring");
  }, [t.spec]), a = H(() => {
    var p;
    return (((p = t.spec) == null ? void 0 : p.controls) ?? []).find((h) => de(h) && h.name === "wiring_layout");
  }, [t.spec]), c = H(() => {
    var p;
    return (((p = t.spec) == null ? void 0 : p.controls) ?? []).find((h) => de(h) && h.name === "module_ports");
  }, [t.spec]), l = H(() => {
    var p;
    return (((p = t.spec) == null ? void 0 : p.controls) ?? []).find((h) => de(h) && h.name === "models");
  }, [t.spec]), [d, f] = B(!1), [N, w] = B(null), [S, k] = B(!1), [y, g] = B(""), [m, A] = B(null), M = ue(""), u = ue(""), v = !!((E = t.status) != null && E.running), [x, b] = B("simui:wiring:default");
  te(() => {
    let r = !0;
    return (async () => {
      var h, z, L;
      try {
        const j = await n.state();
        if (!r) return;
        const J = (h = j == null ? void 0 : j.run) == null ? void 0 : h.id;
        if (typeof J == "string" && J) {
          b(`simui:wiring:run:${J}`);
          return;
        }
        const G = j == null ? void 0 : j.target, q = G == null ? void 0 : G.spaceId, ae = G == null ? void 0 : G.spaceCommit;
        if (typeof q == "string" && q) {
          b(`simui:wiring:draft:space:${q}:${ae || "head"}`);
          return;
        }
        const se = G == null ? void 0 : G.modelId, Se = G == null ? void 0 : G.modelCommit;
        if (typeof se == "string" && se) {
          b(`simui:wiring:draft:model:${se}:${Se || "head"}`);
          return;
        }
        const ce = ((z = t.spec) == null ? void 0 : z.title) || "default";
        b(`simui:wiring:title:${ce}`);
      } catch {
        const j = ((L = t.spec) == null ? void 0 : L.title) || "default";
        b(`simui:wiring:title:${j}`);
      }
    })(), () => {
      r = !1;
    };
  }, [n, (_ = t.spec) == null ? void 0 : _.title]);
  const R = H(() => {
    if (!s) return null;
    const r = t.controls.wiring;
    return r === void 0 ? String(s.default ?? "[]") : typeof r == "string" ? r : String(r);
  }, [t.controls.wiring, s]), V = H(() => {
    if (!a) return null;
    const r = t.controls.wiring_layout;
    return r === void 0 ? String(a.default ?? '{"version":1,"nodes":{},"hidden_modules":[]}') : typeof r == "string" ? r : String(r);
  }, [t.controls.wiring_layout, a]), P = H(() => {
    if (!c) return null;
    const r = t.controls.module_ports;
    return r === void 0 ? String(c.default ?? "{}") : typeof r == "string" ? r : String(r);
  }, [t.controls.module_ports, c]), F = H(() => {
    if (!l) return null;
    const r = t.controls.models;
    return r === void 0 ? String(l.default ?? "[]") : typeof r == "string" ? r : String(r);
  }, [t.controls.models, l]), D = H(() => {
    if (!P) return {};
    try {
      const r = JSON.parse(P);
      return !r || typeof r != "object" || Array.isArray(r) ? {} : r;
    } catch {
      return {};
    }
  }, [P]), X = ue(null);
  te(() => {
    if (!l || X.current) return;
    const r = String(l.default ?? "[]");
    try {
      const p = JSON.parse(r);
      if (!Array.isArray(p)) return;
      const h = /* @__PURE__ */ new Map();
      p.forEach((z, L) => {
        if (!z || typeof z != "object") return;
        const j = String(z.alias ?? z.repo_full_name ?? z.repo ?? `module-${L + 1}`);
        j && h.set(j, z);
      }), X.current = h;
    } catch {
    }
  }, [l]);
  const C = H(() => {
    const r = /* @__PURE__ */ new Map();
    if (!F) return r;
    try {
      const p = JSON.parse(F);
      if (!Array.isArray(p)) return r;
      p.forEach((h, z) => {
        if (!h || typeof h != "object") return;
        const L = String(h.alias ?? h.repo_full_name ?? h.repo ?? `module-${z + 1}`);
        L && r.set(L, h);
      });
    } catch {
    }
    return r;
  }, [F]), O = H(() => {
    if (!l) return null;
    const r = X.current;
    return r ? Array.from(r.keys()).sort((p, h) => p.localeCompare(h)) : null;
  }, [l]), W = H(() => {
    const r = { version: 1, nodes: {}, hidden_modules: [] };
    if (!V) return r;
    try {
      const p = JSON.parse(V);
      if (!p || typeof p != "object" || Array.isArray(p)) return r;
      const h = p.nodes, z = p.hidden_modules;
      return {
        version: typeof p.version == "number" ? p.version : 1,
        nodes: h && typeof h == "object" && !Array.isArray(h) ? h : {},
        hidden_modules: Array.isArray(z) ? z.map(String) : []
      };
    } catch {
      return r;
    }
  }, [V]);
  te(() => {
    if (!s) return;
    const r = {};
    if (t.controls.wiring === void 0) {
      const p = (() => {
        try {
          const h = localStorage.getItem(x);
          if (!h) return null;
          const z = JSON.parse(h);
          return !z || typeof z.wiring != "string" ? null : z.wiring;
        } catch {
          return null;
        }
      })();
      r.wiring = p ?? String(s.default ?? "[]");
    }
    a && t.controls.wiring_layout === void 0 && (r.wiring_layout = String(a.default ?? '{"version":1,"nodes":{},"hidden_modules":[]}')), c && t.controls.module_ports === void 0 && (r.module_ports = String(c.default ?? "{}")), l && t.controls.models === void 0 && (r.models = String(l.default ?? "[]")), Object.keys(r).length > 0 && o.setControls(r);
  }, [o, l, c, t.controls, x, s, a]);
  const [Y, Z] = B([]), [ne, U] = B([]), Ae = H(() => ({ wiringNode: Wt }), []), Q = T((r) => {
    if (a)
      o.setControls({ wiring_layout: JSON.stringify(r, null, 2) });
    else
      try {
        localStorage.setItem(`${x}:layout`, JSON.stringify(r));
      } catch {
      }
  }, [o, x, a]), K = T(() => {
    const r = { version: 1, nodes: {}, hidden_modules: [] };
    if (a) return W;
    try {
      const p = localStorage.getItem(`${x}:layout`);
      if (!p) return r;
      const h = JSON.parse(p);
      return !h || typeof h != "object" || Array.isArray(h) ? r : {
        version: typeof h.version == "number" ? h.version : 1,
        nodes: h.nodes && typeof h.nodes == "object" ? h.nodes : {},
        hidden_modules: Array.isArray(h.hidden_modules) ? h.hidden_modules.map(String) : []
      };
    } catch {
      return r;
    }
  }, [W, x, a]), xe = H(
    () => a ? W : K(),
    [W, K, a]
  ), le = H(() => new Set(xe.hidden_modules || []), [xe.hidden_modules]), ve = T((r) => {
    l && o.setControls({ models: JSON.stringify(r, null, 2) });
  }, [o, l]);
  te(() => {
    if (!R) return;
    const r = `${R}@@${V ?? ""}@@${P ?? ""}`;
    if (r !== u.current) {
      u.current = r;
      try {
        const p = JSON.parse(R), h = ot(p);
        w(null), Z((z) => {
          var Se;
          const L = K(), { nodes: j, edges: J, needsLayout: G } = _t(
            h,
            Array.isArray((Se = t.spec) == null ? void 0 : Se.modules) ? t.spec.modules.map(String) : [],
            D,
            new Set(L.hidden_modules || []),
            z
          ), q = j.map((ce) => {
            const pe = (L.nodes || {})[ce.id];
            return pe ? { ...ce, position: { x: pe.x, y: pe.y } } : ce;
          });
          U(J);
          const ae = G && Object.keys(L.nodes || {}).length === 0, se = ae ? Je(q, J) : q;
          if (ae) {
            const ce = {};
            for (const pe of se) ce[pe.id] = { x: pe.position.x, y: pe.position.y };
            Q({ ...L, nodes: ce, hidden_modules: L.hidden_modules || [], version: 1 });
          }
          return se;
        }), S || g(R);
      } catch (p) {
        const h = p instanceof Error ? p.message : String(p);
        w(h), g(R);
      }
    }
  }, [P, D, K, S, t.spec, Q, V, R]);
  const ie = T((r) => {
    const p = Ve(r), h = JSON.stringify(p, null, 2);
    M.current = h, o.setControls({ wiring: h }), g(h), w(null);
    try {
      localStorage.setItem(x, JSON.stringify({ wiring: h, updatedAt: Date.now() }));
    } catch {
    }
  }, [o, x]), he = T((r, p, h) => {
    if (Z((z) => z.map((L) => {
      if (L.id !== r) return L;
      const j = L.data, J = p === "input" ? "inputs" : "outputs", G = j[J];
      if (G.includes(h)) return L;
      const q = { ...j, [J]: [...G, h].sort() };
      return { ...L, data: q };
    })), !!c)
      try {
        const z = P ? JSON.parse(P) : {}, L = z && typeof z == "object" && !Array.isArray(z) ? z : {}, j = L[r], J = j && typeof j == "object" && !Array.isArray(j) ? { ...j } : {}, G = p === "input" ? "inputs" : "outputs", q = Array.isArray(J[G]) ? J[G].map(String) : [];
        q.includes(h) || q.push(h), q.sort((ae, se) => ae.localeCompare(se)), J[G] = q, L[r] = J, o.setControls({ module_ports: JSON.stringify(L, null, 2) });
      } catch {
      }
  }, [o, c, P]), Re = T((r) => {
    Z((p) => {
      const h = at(r, p);
      if (r.some((L) => L.type === "position" || L.type === "dimensions")) {
        const L = {};
        for (const J of h) L[J.id] = { x: J.position.x, y: J.position.y };
        const j = K();
        Q({ ...j, nodes: { ...j.nodes || {}, ...L }, hidden_modules: j.hidden_modules || [], version: 1 });
      }
      return h;
    });
  }, [K, Q]), ze = T((r) => {
    const p = r.some((h) => h.type === "remove" || h.type === "add");
    U((h) => {
      const z = lt(r, h);
      return p && ie(z), z;
    });
  }, [ie]), Ee = T(() => {
    if (!m) return;
    const r = m.sourcePort.trim(), p = m.targetPort.trim();
    if (r.includes(".") || p.includes(".")) {
      w('Port names must not include "."');
      return;
    }
    !r || !p || (he(m.source, "output", r), he(m.target, "input", p), U((h) => {
      const z = je(
        {
          id: `e-${Date.now()}`,
          source: m.source,
          sourceHandle: r,
          target: m.target,
          targetHandle: p,
          type: "smoothstep",
          style: { stroke: "#6b7280", strokeWidth: 2 }
        },
        h
      );
      return ie(z), z;
    }), A(null));
  }, [he, m, ie]), Te = T((r) => {
    if (v || !r.source || !r.target) return;
    let p = r.sourceHandle, h = r.targetHandle;
    if (!(!p || !h)) {
      if (p === ge) {
        A({
          source: r.source,
          target: r.target,
          sourceHandle: p,
          targetHandle: h,
          sourcePort: "",
          targetPort: h === ge ? "" : String(h),
          mode: h === ge ? "both" : "from"
        });
        return;
      }
      if (h === ge) {
        A({
          source: r.source,
          target: r.target,
          sourceHandle: p,
          targetHandle: h,
          sourcePort: String(p),
          targetPort: "",
          mode: "to"
        });
        return;
      }
      U((z) => {
        const L = je(
          {
            ...r,
            sourceHandle: p,
            targetHandle: h,
            id: `e-${Date.now()}`,
            type: "smoothstep",
            style: { stroke: "#6b7280", strokeWidth: 2 }
          },
          z
        );
        return ie(L), L;
      });
    }
  }, [v, he, ie]), Le = T(() => {
    try {
      const r = JSON.parse(y), p = JSON.stringify(Ve(Dt(r)), null, 2);
      M.current = p, o.setControls({ wiring: p }), w(null), k(!1);
      try {
        localStorage.setItem(x, JSON.stringify({ wiring: p, updatedAt: Date.now() }));
      } catch {
      }
    } catch (r) {
      const p = r instanceof Error ? r.message : String(r);
      w(p), f(!0), k(!0);
    }
  }, [o, y, x]), Be = T(() => {
    Z((r) => {
      const p = Je(r, ne), h = {};
      for (const L of p) h[L.id] = { x: L.position.x, y: L.position.y };
      const z = K();
      return Q({ ...z, nodes: { ...z.nodes || {}, ...h }, hidden_modules: z.hidden_modules || [], version: 1 }), p;
    });
  }, [ne, K, Q]), _e = T(() => {
    const r = K();
    Q({ ...r, nodes: {}, hidden_modules: r.hidden_modules || [], version: 1 }), Z((p) => p.map((h) => ({ ...h, position: { x: 0, y: 0 } })));
  }, [K, Q]), we = H(
    () => ne.filter((r) => !le.has(r.source) && !le.has(r.target)),
    [ne, le]
  ), De = Y.length, We = we.length, Ne = H(() => {
    var p;
    const r = /* @__PURE__ */ new Set();
    for (const h of Array.isArray((p = t.spec) == null ? void 0 : p.modules) ? t.spec.modules : []) r.add(String(h));
    for (const h of Object.keys(D || {})) r.add(String(h));
    for (const h of Y) r.add(String(h.id));
    return Array.from(r).sort((h, z) => h.localeCompare(z));
  }, [Y, D, t.spec]), oe = T((r) => {
    const p = K(), h = new Set(p.hidden_modules || []);
    h.has(r) ? h.delete(r) : h.add(r), Q({ ...p, hidden_modules: Array.from(h).sort(), version: 1, nodes: p.nodes || {} });
  }, [K, Q]), $ = T((r) => {
    if (!l) return;
    const p = X.current;
    if (!p) return;
    const h = K(), z = new Set(h.hidden_modules || []);
    if (C.get(r)) {
      const G = Array.from(C.entries()).filter(([q]) => q !== r).map(([, q]) => q);
      ve(G), z.add(r), Q({ ...h, hidden_modules: Array.from(z).sort(), nodes: h.nodes || {}, version: 1 }), U((q) => {
        const ae = q.filter((se) => se.source !== r && se.target !== r);
        return ie(ae), ae;
      });
      return;
    }
    const j = p.get(r);
    if (!j) return;
    const J = [...Array.from(C.values()), j];
    ve(J), z.delete(r), Q({ ...h, hidden_modules: Array.from(z).sort(), nodes: h.nodes || {}, version: 1 });
  }, [C, l, K, ve, ie, Q]);
  return s ? /* @__PURE__ */ i("div", { className: `wiring-panel ${d ? "expanded" : "collapsed"}`, children: [
    /* @__PURE__ */ i("div", { className: "wiring-header", onClick: () => f((r) => !r), children: [
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
          De,
          " modules · ",
          We,
          " connections"
        ] }),
        le.size > 0 && /* @__PURE__ */ i("span", { className: "wiring-meta", children: [
          le.size,
          " hidden"
        ] }),
        v && /* @__PURE__ */ e("span", { className: "wiring-locked", children: "locked while running" })
      ] }),
      /* @__PURE__ */ e("div", { className: "wiring-actions", children: /* @__PURE__ */ e(
        "button",
        {
          className: "expand-btn",
          onClick: (r) => {
            r.stopPropagation(), f((p) => !p);
          },
          children: d ? "Collapse" : "Expand"
        }
      ) })
    ] }),
    N && /* @__PURE__ */ i("div", { className: "wiring-error", children: [
      /* @__PURE__ */ i("span", { children: [
        "Invalid wiring JSON: ",
        N
      ] }),
      /* @__PURE__ */ e("button", { className: "btn btn-small btn-outline", onClick: () => {
        f(!0), k(!0);
      }, children: "Edit JSON" })
    ] }),
    d && /* @__PURE__ */ i("div", { className: "wiring-body", children: [
      /* @__PURE__ */ e("div", { className: "wiring-canvas", children: /* @__PURE__ */ i(
        Xe,
        {
          nodes: Y,
          edges: we,
          onNodesChange: Re,
          onEdgesChange: ze,
          onConnect: Te,
          nodeTypes: Ae,
          fitView: !0,
          snapToGrid: !0,
          snapGrid: [15, 15],
          nodesDraggable: !v,
          nodesConnectable: !v,
          elementsSelectable: !v,
          deleteKeyCode: v ? null : ["Backspace", "Delete"],
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
            /* @__PURE__ */ e("button", { className: "btn btn-small btn-outline", onClick: Be, children: "Auto layout" }),
            /* @__PURE__ */ e("button", { className: "btn btn-small btn-outline", onClick: _e, children: "Reset layout" })
          ] }),
          /* @__PURE__ */ e("button", { className: "btn btn-small btn-outline", onClick: () => k((r) => !r), children: S ? "Hide JSON" : "Show JSON" })
        ] }),
        Ne.length > 0 && /* @__PURE__ */ i("div", { className: "wiring-palette", children: [
          /* @__PURE__ */ i("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }, children: [
            /* @__PURE__ */ e("div", { style: { fontSize: 12, color: "var(--muted)", fontWeight: 600 }, children: "Modules" }),
            /* @__PURE__ */ e("div", { style: { fontSize: 11, color: "var(--muted)" }, children: "diagram only" })
          ] }),
          /* @__PURE__ */ e("div", { className: "wiring-palette-list", children: Ne.map((r) => {
            const p = le.has(r);
            return /* @__PURE__ */ i("label", { className: "wiring-palette-item", children: [
              /* @__PURE__ */ e(
                "input",
                {
                  type: "checkbox",
                  checked: !p,
                  onChange: () => oe(r),
                  disabled: v
                }
              ),
              /* @__PURE__ */ e("span", { style: { color: p ? "var(--muted)" : "var(--text)" }, children: r })
            ] }, r);
          }) })
        ] }),
        O && O.length > 0 && /* @__PURE__ */ i("div", { className: "wiring-palette", children: [
          /* @__PURE__ */ i("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }, children: [
            /* @__PURE__ */ e("div", { style: { fontSize: 12, color: "var(--muted)", fontWeight: 600 }, children: "Run Composition" }),
            /* @__PURE__ */ e("div", { style: { fontSize: 11, color: "var(--muted)" }, children: "affects run" })
          ] }),
          /* @__PURE__ */ e("div", { className: "wiring-palette-list", children: O.map((r) => {
            const p = C.has(r);
            return /* @__PURE__ */ i("label", { className: "wiring-palette-item", children: [
              /* @__PURE__ */ e(
                "input",
                {
                  type: "checkbox",
                  checked: p,
                  onChange: () => $(r),
                  disabled: v
                }
              ),
              /* @__PURE__ */ e("span", { style: { color: p ? "var(--text)" : "var(--muted)" }, children: r })
            ] }, r);
          }) })
        ] }),
        S && /* @__PURE__ */ i("div", { className: "wiring-json", children: [
          /* @__PURE__ */ e(
            "textarea",
            {
              className: "control-input",
              value: y,
              onChange: (r) => g(r.target.value),
              rows: 10,
              disabled: v
            }
          ),
          /* @__PURE__ */ i("div", { className: "wiring-json-actions", children: [
            /* @__PURE__ */ e("button", { className: "btn btn-small btn-primary", onClick: Le, disabled: v, children: "Apply" }),
            /* @__PURE__ */ e("button", { className: "btn btn-small btn-outline", onClick: () => {
              g(R ?? "[]"), w(null);
            }, children: "Reset" })
          ] })
        ] })
      ] })
    ] }),
    m && /* @__PURE__ */ e(
      "div",
      {
        className: "wiring-modal-backdrop",
        onClick: () => A(null),
        role: "presentation",
        children: /* @__PURE__ */ i("div", { className: "wiring-modal", onClick: (r) => r.stopPropagation(), children: [
          /* @__PURE__ */ e("div", { className: "wiring-modal-title", children: "Add connection" }),
          /* @__PURE__ */ i("div", { className: "wiring-modal-subtitle", children: [
            m.source,
            " → ",
            m.target
          ] }),
          /* @__PURE__ */ i("div", { className: "wiring-modal-grid", children: [
            /* @__PURE__ */ i("label", { className: "wiring-modal-field", children: [
              /* @__PURE__ */ e("span", { children: "From (output port)" }),
              /* @__PURE__ */ e(
                "input",
                {
                  className: "control-input",
                  value: m.sourcePort,
                  onChange: (r) => A((p) => p && { ...p, sourcePort: r.target.value }),
                  placeholder: "e.g. population_state",
                  disabled: v || m.mode === "to",
                  list: `wiring-ports-out-${m.source}`
                }
              )
            ] }),
            /* @__PURE__ */ i("label", { className: "wiring-modal-field", children: [
              /* @__PURE__ */ e("span", { children: "To (input port)" }),
              /* @__PURE__ */ e(
                "input",
                {
                  className: "control-input",
                  value: m.targetPort,
                  onChange: (r) => A((p) => p && { ...p, targetPort: r.target.value }),
                  placeholder: "e.g. prey_state",
                  disabled: v || m.mode === "from",
                  list: `wiring-ports-in-${m.target}`
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ e("datalist", { id: `wiring-ports-out-${m.source}`, children: (((I = Y.find((r) => r.id === m.source)) == null ? void 0 : I.data.outputs) ?? []).map((r) => /* @__PURE__ */ e("option", { value: String(r) }, String(r))) }),
          /* @__PURE__ */ e("datalist", { id: `wiring-ports-in-${m.target}`, children: (((ee = Y.find((r) => r.id === m.target)) == null ? void 0 : ee.data.inputs) ?? []).map((r) => /* @__PURE__ */ e("option", { value: String(r) }, String(r))) }),
          /* @__PURE__ */ i("div", { className: "wiring-modal-actions", children: [
            /* @__PURE__ */ e("button", { className: "btn btn-outline", onClick: () => A(null), children: "Cancel" }),
            /* @__PURE__ */ e("button", { className: "btn btn-primary", onClick: Ee, disabled: v, children: "Add" })
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
function Ot({ adapter: n }) {
  const [t, o] = B([]), [s, a] = B(!0), [c, l] = B(null), [d, f] = B(""), [N, w] = B(!1), S = ue(null);
  te(() => {
    let g = !0;
    return a(!0), n.getThread().then((m) => {
      g && (o(m.messages ?? []), l(null));
    }).catch((m) => {
      g && l(m instanceof Error ? m.message : String(m));
    }).finally(() => {
      g && a(!1);
    }), () => {
      g = !1;
    };
  }, [n]), te(() => {
    var g;
    (g = S.current) == null || g.scrollIntoView({ behavior: "smooth" });
  }, [t.length]);
  const k = async () => {
    const g = d.trim();
    if (!g || N) return;
    f(""), w(!0), l(null);
    const m = (/* @__PURE__ */ new Date()).toISOString(), A = {
      id: `local-user-${Date.now()}`,
      role: "user",
      content: g,
      createdAt: m
    }, M = `local-assistant-${Date.now()}`, u = {
      id: M,
      role: "assistant",
      content: "",
      createdAt: m
    };
    o((v) => [...v, A, u]);
    try {
      const v = await n.sendMessage({
        content: g,
        onChunk: (x) => {
          x && o(
            (b) => b.map(
              (R) => R.id === M ? { ...R, content: R.content + x } : R
            )
          );
        }
      });
      o((x) => x.map((b) => b.id === M ? v : b));
    } catch (v) {
      const x = v instanceof Error ? v.message : String(v);
      l(x), o((b) => b.filter((R) => R.id !== M));
    } finally {
      w(!1);
    }
  }, y = (g) => {
    g.key === "Enter" && !g.shiftKey && (g.preventDefault(), k());
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
      t.map((g) => /* @__PURE__ */ i("div", { className: `chat-message ${g.role === "user" ? "user" : "assistant"}`, children: [
        /* @__PURE__ */ e("div", { className: "chat-bubble", children: g.content }),
        /* @__PURE__ */ e("div", { className: "chat-meta", children: Ht(g.createdAt) })
      ] }, g.id)),
      /* @__PURE__ */ e("div", { ref: S })
    ] }),
    /* @__PURE__ */ i("div", { className: "chat-input", children: [
      /* @__PURE__ */ e(
        "textarea",
        {
          className: "chat-textarea",
          placeholder: "Ask about parameters, outputs, or model behavior…",
          value: d,
          onChange: (g) => f(g.target.value),
          onKeyDown: y,
          rows: 2,
          disabled: N
        }
      ),
      /* @__PURE__ */ e("button", { type: "button", className: "btn btn-primary", onClick: k, disabled: N || !d.trim(), children: N ? "Sending…" : "Send" })
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
  var S;
  const { state: t } = re(), o = $e(), s = H(
    () => t.visibleModules.size ? o.filter((k) => t.visibleModules.has(k)) : o,
    [o, t.visibleModules]
  ), a = bt(), c = (S = t.spec) == null ? void 0 : S.description, l = !!n, d = H(
    () => {
      var k, y;
      return !!((y = (k = t.spec) == null ? void 0 : k.controls) != null && y.some((g) => g.type === "json" && g.name === "wiring"));
    },
    [t.spec]
  ), [f, N] = B("visuals"), w = o.length === 0 ? /* @__PURE__ */ i(ye, { children: [
    c && /* @__PURE__ */ e(He, { description: c }),
    /* @__PURE__ */ e(Ue, { message: "No modules found", description: "The simulation doesn't have any modules to display yet." })
  ] }) : s.length === 0 ? /* @__PURE__ */ i(ye, { children: [
    c && /* @__PURE__ */ e(He, { description: c }),
    /* @__PURE__ */ e(Ue, { message: "No modules selected", description: "Select modules from the sidebar to view their visualizations." })
  ] }) : /* @__PURE__ */ i(ye, { children: [
    c && /* @__PURE__ */ e(He, { description: c }),
    /* @__PURE__ */ e("div", { className: "modules-grid", children: s.map((k) => /* @__PURE__ */ e(Bt, { moduleName: k, visuals: a.get(k) || [] }, k)) })
  ] });
  return /* @__PURE__ */ i("div", { className: "main-content", children: [
    /* @__PURE__ */ i("div", { className: "main-tabs", children: [
      /* @__PURE__ */ e(
        "button",
        {
          type: "button",
          className: `main-tab ${f === "visuals" ? "active" : ""}`,
          onClick: () => N("visuals"),
          children: "Visualizations"
        }
      ),
      d && /* @__PURE__ */ e(
        "button",
        {
          type: "button",
          className: `main-tab ${f === "wiring" ? "active" : ""}`,
          onClick: () => N("wiring"),
          children: "Wiring"
        }
      ),
      l && /* @__PURE__ */ e(
        "button",
        {
          type: "button",
          className: `main-tab ${f === "chat" ? "active" : ""}`,
          onClick: () => N("chat"),
          children: "Chat"
        }
      )
    ] }),
    f === "chat" && n && /* @__PURE__ */ e(Ot, { adapter: n }),
    f === "wiring" && d && /* @__PURE__ */ e(Pt, {}),
    f === "visuals" && w
  ] });
}
function jt() {
  const { state: n, actions: t } = re(), o = n.events || [], s = ue(null), [a, c] = B(!0);
  te(() => {
    a && s.current && (s.current.scrollTop = s.current.scrollHeight);
  }, [o, a]);
  const l = () => {
    if (!s.current) return;
    const { scrollTop: d, scrollHeight: f, clientHeight: N } = s.current, w = d + N >= f - 10;
    c(w);
  };
  return /* @__PURE__ */ e("div", { className: "footer", children: /* @__PURE__ */ i("div", { className: "footer-content", children: [
    /* @__PURE__ */ i("header", { className: "footer-header", children: [
      /* @__PURE__ */ i("div", { className: "footer-title-section", children: [
        /* @__PURE__ */ e("h2", { className: "footer-title", children: "Event Log" }),
        /* @__PURE__ */ e("div", { className: "event-stats", children: /* @__PURE__ */ i("div", { className: "stat-item", children: [
          /* @__PURE__ */ e("span", { className: "stat-label", children: "Total:" }),
          /* @__PURE__ */ e("span", { className: "stat-value", children: o.length })
        ] }) })
      ] }),
      /* @__PURE__ */ e("div", { className: "footer-actions", children: o.length > 0 && /* @__PURE__ */ e("button", { className: "btn btn-small btn-outline", onClick: () => t.setEvents([]), children: "Clear" }) })
    ] }),
    /* @__PURE__ */ e("div", { className: "footer-body", children: o.length === 0 ? /* @__PURE__ */ e("div", { className: "event-list empty", children: /* @__PURE__ */ e("div", { className: "empty-state", children: /* @__PURE__ */ e("p", { children: "No events recorded yet" }) }) }) : /* @__PURE__ */ i("div", { className: "event-list-container", children: [
      /* @__PURE__ */ i("div", { className: "event-list-header", children: [
        /* @__PURE__ */ i("span", { className: "event-count", children: [
          o.length,
          " event",
          o.length !== 1 ? "s" : ""
        ] }),
        /* @__PURE__ */ i("div", { className: "event-controls", children: [
          /* @__PURE__ */ e("button", { className: `btn btn-small ${a ? "active" : ""}`, onClick: () => c(!a), title: a ? "Auto-scroll enabled" : "Auto-scroll disabled", children: "📌" }),
          /* @__PURE__ */ e("button", { className: "btn btn-small", onClick: () => {
            s.current && (s.current.scrollTop = s.current.scrollHeight, c(!0));
          }, title: "Scroll to bottom", children: "⬇️" })
        ] })
      ] }),
      /* @__PURE__ */ e("div", { ref: s, className: "event-list", onScroll: l, children: o.slice().reverse().map((d) => /* @__PURE__ */ i("div", { className: "event-item", children: [
        /* @__PURE__ */ e("time", { className: "event-timestamp", dateTime: d.ts, children: d.ts }),
        /* @__PURE__ */ e("div", { className: "event-message", children: d.event })
      ] }, d.id)) })
    ] }) })
  ] }) });
}
const Ft = ({ data: n, selected: t }) => {
  const o = n, { label: s, moduleType: a, inputs: c, outputs: l } = o, d = a.split(".").pop() || a, f = a.includes(".neuro.") ? "neuro" : a.includes(".ecology.") ? "ecology" : "custom", w = {
    neuro: { bg: "var(--primary-bg)", border: "var(--primary)", header: "var(--primary-dark)", text: "var(--primary-text)" },
    ecology: { bg: "#14352a", border: "#22c55e", header: "#16a34a", text: "#dcfce7" },
    custom: { bg: "#2e1a47", border: "#a855f7", header: "#9333ea", text: "#f3e8ff" }
  }[f];
  return /* @__PURE__ */ i(
    "div",
    {
      className: "module-node",
      style: {
        background: w.bg,
        border: `2px solid ${t ? "#fbbf24" : w.border}`,
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
              background: w.header,
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
              color: w.text,
              borderBottom: `1px solid ${w.border}50`,
              opacity: 0.85
            },
            children: d
          }
        ),
        /* @__PURE__ */ i("div", { style: { display: "flex", justifyContent: "space-between", padding: "10px 0" }, children: [
          /* @__PURE__ */ i("div", { style: { display: "flex", flexDirection: "column", gap: "6px" }, children: [
            c.map((S) => /* @__PURE__ */ i("div", { style: { position: "relative", paddingLeft: "14px" }, children: [
              /* @__PURE__ */ e(
                me,
                {
                  type: "target",
                  position: fe.Left,
                  id: S,
                  style: {
                    width: "12px",
                    height: "12px",
                    background: "#6b7280",
                    border: "2px solid var(--primary-bg)",
                    left: "-6px"
                  }
                }
              ),
              /* @__PURE__ */ e("span", { style: { fontSize: "12px", color: w.text, fontWeight: 500 }, children: S })
            ] }, S)),
            c.length === 0 && /* @__PURE__ */ e("div", { style: { paddingLeft: "14px", fontSize: "12px", color: "#9aa6c1", fontStyle: "italic" }, children: "no inputs" })
          ] }),
          /* @__PURE__ */ i("div", { style: { display: "flex", flexDirection: "column", gap: "6px", alignItems: "flex-end" }, children: [
            l.map((S) => /* @__PURE__ */ i("div", { style: { position: "relative", paddingRight: "14px" }, children: [
              /* @__PURE__ */ e("span", { style: { fontSize: "12px", color: w.text, fontWeight: 500 }, children: S }),
              /* @__PURE__ */ e(
                me,
                {
                  type: "source",
                  position: fe.Right,
                  id: S,
                  style: {
                    width: "12px",
                    height: "12px",
                    background: w.header,
                    border: "2px solid var(--primary-bg)",
                    right: "-6px"
                  }
                }
              )
            ] }, S)),
            l.length === 0 && /* @__PURE__ */ e("div", { style: { paddingRight: "14px", fontSize: "12px", color: "#9aa6c1", fontStyle: "italic" }, children: "no outputs" })
          ] })
        ] })
      ]
    }
  );
}, Jt = qe(Ft), Vt = ({ registry: n, onDragStart: t }) => {
  const [o, s] = B(/* @__PURE__ */ new Set(["neuro", "ecology"])), [a, c] = B(""), l = "#0f1628", d = "#11182b", f = "#e6eaf2", N = "#9aa6c1", w = "#1e2a44";
  if (!n)
    return /* @__PURE__ */ e("div", { className: "module-palette", style: { padding: "16px", background: d, color: N }, children: /* @__PURE__ */ e("div", { children: "Loading modules..." }) });
  const S = (g) => {
    const m = new Set(o);
    m.has(g) ? m.delete(g) : m.add(g), s(m);
  }, k = {
    neuro: "var(--primary)",
    ecology: "#22c55e",
    custom: "#a855f7"
  }, y = Object.entries(n.categories).map(([g, m]) => {
    const A = m.map((M) => ({ path: M, spec: n.modules[M] })).filter(({ spec: M }) => {
      var v;
      if (!M) return !1;
      if (!a) return !0;
      const u = a.toLowerCase();
      return M.name.toLowerCase().includes(u) || ((v = M.description) == null ? void 0 : v.toLowerCase().includes(u)) || g.toLowerCase().includes(u);
    });
    return { category: g, modules: A };
  }).filter(({ modules: g }) => g.length > 0);
  return /* @__PURE__ */ i("div", { className: "module-palette", style: { height: "100%", display: "flex", flexDirection: "column", background: d, fontFamily: "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif" }, children: [
    /* @__PURE__ */ i("div", { style: { padding: "14px", borderBottom: `1px solid ${w}` }, children: [
      /* @__PURE__ */ e("h3", { style: { margin: "0 0 10px 0", fontSize: "14px", fontWeight: 600, color: f }, children: "Modules" }),
      /* @__PURE__ */ e(
        "input",
        {
          type: "text",
          placeholder: "Search modules...",
          value: a,
          onChange: (g) => c(g.target.value),
          style: {
            width: "100%",
            padding: "8px 12px",
            border: `1px solid ${w}`,
            borderRadius: "8px",
            fontSize: "13px",
            background: l,
            color: f
          }
        }
      )
    ] }),
    /* @__PURE__ */ i("div", { style: { flex: 1, overflow: "auto", padding: "8px" }, children: [
      y.map(({ category: g, modules: m }) => /* @__PURE__ */ i("div", { style: { marginBottom: "8px" }, children: [
        /* @__PURE__ */ i(
          "button",
          {
            onClick: () => S(g),
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
              color: f,
              textAlign: "left"
            },
            children: [
              /* @__PURE__ */ e("span", { style: { transform: o.has(g) ? "rotate(90deg)" : "rotate(0deg)", transition: "transform 0.2s", color: N }, children: "▶" }),
              /* @__PURE__ */ e(
                "span",
                {
                  style: {
                    width: "10px",
                    height: "10px",
                    borderRadius: "50%",
                    background: k[g] || "#666"
                  }
                }
              ),
              g.charAt(0).toUpperCase() + g.slice(1),
              /* @__PURE__ */ e("span", { style: { marginLeft: "auto", fontSize: "12px", color: N }, children: m.length })
            ]
          }
        ),
        o.has(g) && /* @__PURE__ */ e("div", { style: { paddingLeft: "16px" }, children: m.map(({ path: A, spec: M }) => /* @__PURE__ */ i(
          "div",
          {
            draggable: !0,
            onDragStart: (u) => t(u, A, M),
            style: {
              padding: "10px 12px",
              marginBottom: "6px",
              background: l,
              border: `1px solid ${w}`,
              borderRadius: "8px",
              cursor: "grab",
              fontSize: "13px"
            },
            title: M.description || A,
            children: [
              /* @__PURE__ */ e("div", { style: { fontWeight: 500, color: f }, children: M.name }),
              /* @__PURE__ */ i("div", { style: { fontSize: "11px", color: N, marginTop: "4px" }, children: [
                M.inputs.length > 0 && /* @__PURE__ */ i("span", { children: [
                  "in: ",
                  M.inputs.join(", ")
                ] }),
                M.inputs.length > 0 && M.outputs.length > 0 && " | ",
                M.outputs.length > 0 && /* @__PURE__ */ i("span", { children: [
                  "out: ",
                  M.outputs.join(", ")
                ] })
              ] })
            ]
          },
          A
        )) })
      ] }, g)),
      y.length === 0 && /* @__PURE__ */ e("div", { style: { padding: "16px", textAlign: "center", color: N, fontSize: "13px" }, children: "No modules found" })
    ] }),
    /* @__PURE__ */ e("div", { style: { padding: "10px 14px", borderTop: `1px solid ${w}`, fontSize: "12px", color: N }, children: "Drag modules to canvas" })
  ] });
}, Ut = ({
  selectedNode: n,
  registry: t,
  onUpdateNode: o,
  onDeleteNode: s,
  onRenameNode: a
}) => {
  const c = "#0f1628", l = "#11182b", d = "#e6eaf2", f = "#9aa6c1", N = "#1e2a44", w = "#22d3ee";
  if (!n)
    return /* @__PURE__ */ i("div", { className: "properties-panel", style: { padding: "16px", background: l, color: f, fontFamily: "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif" }, children: [
      /* @__PURE__ */ e("h3", { style: { margin: "0 0 10px 0", fontSize: "14px", fontWeight: 600, color: d }, children: "Properties" }),
      /* @__PURE__ */ e("p", { style: { fontSize: "13px", color: f }, children: "Select a node to edit its properties" })
    ] });
  const S = n.data, k = t == null ? void 0 : t.modules[S.moduleType], y = (u, v) => {
    const x = { ...S.args, [u]: v };
    o(n.id, x);
  }, g = (u) => {
    const v = u.target.value.trim();
    v && v !== n.id && a(n.id, v);
  }, m = (u, v) => {
    if (v === "int" || v === "float" || v === "number") {
      const x = parseFloat(u);
      return isNaN(x) ? 0 : x;
    }
    if (v === "bool" || v === "boolean")
      return u === "true" || u === "1";
    if (v === "list" || v === "List")
      try {
        return JSON.parse(u);
      } catch {
        return [];
      }
    return u;
  }, A = (u) => u == null ? "" : typeof u == "object" ? JSON.stringify(u) : String(u), M = {
    width: "100%",
    padding: "8px 12px",
    border: `1px solid ${N}`,
    borderRadius: "8px",
    fontSize: "13px",
    background: c,
    color: d
  };
  return /* @__PURE__ */ i("div", { className: "properties-panel", style: { height: "100%", display: "flex", flexDirection: "column", background: l, fontFamily: "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif" }, children: [
    /* @__PURE__ */ e("div", { style: { padding: "14px", borderBottom: `1px solid ${N}` }, children: /* @__PURE__ */ e("h3", { style: { margin: "0", fontSize: "14px", fontWeight: 600, color: d }, children: "Properties" }) }),
    /* @__PURE__ */ i("div", { style: { flex: 1, overflow: "auto", padding: "14px" }, children: [
      /* @__PURE__ */ i("div", { style: { marginBottom: "18px" }, children: [
        /* @__PURE__ */ e("label", { style: { display: "block", fontSize: "12px", fontWeight: 500, marginBottom: "6px", color: d }, children: "Node ID" }),
        /* @__PURE__ */ e(
          "input",
          {
            type: "text",
            defaultValue: n.id,
            onBlur: g,
            onKeyDown: (u) => {
              u.key === "Enter" && u.currentTarget.blur();
            },
            style: M
          }
        )
      ] }),
      /* @__PURE__ */ i("div", { style: { marginBottom: "18px" }, children: [
        /* @__PURE__ */ e("label", { style: { display: "block", fontSize: "12px", fontWeight: 500, marginBottom: "6px", color: d }, children: "Module Type" }),
        /* @__PURE__ */ e("div", { style: { padding: "8px 12px", background: c, borderRadius: "8px", fontSize: "12px", color: f, border: `1px solid ${N}` }, children: S.moduleType })
      ] }),
      (k == null ? void 0 : k.description) && /* @__PURE__ */ e("div", { style: { marginBottom: "18px", padding: "10px", background: "#0c2135", borderRadius: "8px", fontSize: "12px", color: w, border: `1px solid ${N}` }, children: k.description.split(`
`)[0] }),
      /* @__PURE__ */ i("div", { style: { marginBottom: "10px" }, children: [
        /* @__PURE__ */ e("label", { style: { display: "block", fontSize: "12px", fontWeight: 600, marginBottom: "10px", color: d }, children: "Arguments" }),
        k == null ? void 0 : k.args.map((u) => {
          const v = S.args[u.name] ?? u.default, x = u.type === "bool" || u.type === "boolean" ? "checkbox" : "text";
          return /* @__PURE__ */ i("div", { style: { marginBottom: "14px" }, children: [
            /* @__PURE__ */ i("label", { style: { display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", marginBottom: "6px", color: f }, children: [
              /* @__PURE__ */ e("span", { style: { fontWeight: 500, color: d }, children: u.name }),
              /* @__PURE__ */ i("span", { style: { color: f }, children: [
                "(",
                u.type,
                ")"
              ] }),
              u.required && /* @__PURE__ */ e("span", { style: { color: "#ef4444" }, children: "*" })
            ] }),
            x === "checkbox" ? /* @__PURE__ */ e(
              "input",
              {
                type: "checkbox",
                checked: !!v,
                onChange: (b) => y(u.name, b.target.checked),
                style: { width: "18px", height: "18px", accentColor: w }
              }
            ) : u.options ? /* @__PURE__ */ e(
              "select",
              {
                value: String(v),
                onChange: (b) => y(u.name, m(b.target.value, u.type)),
                style: M,
                children: u.options.map((b) => /* @__PURE__ */ e("option", { value: String(b), children: String(b) }, String(b)))
              }
            ) : /* @__PURE__ */ e(
              "input",
              {
                type: "text",
                value: A(v),
                onChange: (b) => y(u.name, m(b.target.value, u.type)),
                placeholder: u.default !== null ? `Default: ${A(u.default)}` : "",
                style: M
              }
            ),
            u.description && /* @__PURE__ */ e("div", { style: { fontSize: "11px", color: f, marginTop: "4px" }, children: u.description })
          ] }, u.name);
        }),
        (!k || k.args.length === 0) && /* @__PURE__ */ e("div", { style: { fontSize: "13px", color: f, fontStyle: "italic" }, children: "No configurable arguments" })
      ] }),
      /* @__PURE__ */ i("div", { style: { marginTop: "18px", paddingTop: "18px", borderTop: `1px solid ${N}` }, children: [
        /* @__PURE__ */ e("label", { style: { display: "block", fontSize: "12px", fontWeight: 600, marginBottom: "10px", color: d }, children: "Ports" }),
        /* @__PURE__ */ i("div", { style: { display: "flex", gap: "20px" }, children: [
          /* @__PURE__ */ i("div", { children: [
            /* @__PURE__ */ e("div", { style: { fontSize: "12px", color: f, marginBottom: "6px" }, children: "Inputs" }),
            S.inputs.length > 0 ? S.inputs.map((u) => /* @__PURE__ */ e("div", { style: { fontSize: "12px", color: d }, children: u }, u)) : /* @__PURE__ */ e("div", { style: { fontSize: "12px", color: f, fontStyle: "italic" }, children: "none" })
          ] }),
          /* @__PURE__ */ i("div", { children: [
            /* @__PURE__ */ e("div", { style: { fontSize: "12px", color: f, marginBottom: "6px" }, children: "Outputs" }),
            S.outputs.length > 0 ? S.outputs.map((u) => /* @__PURE__ */ e("div", { style: { fontSize: "12px", color: d }, children: u }, u)) : /* @__PURE__ */ e("div", { style: { fontSize: "12px", color: f, fontStyle: "italic" }, children: "none" })
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ e("div", { style: { padding: "14px", borderTop: `1px solid ${N}` }, children: /* @__PURE__ */ e(
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
}, Oe = (n, t, o = "LR") => {
  const s = new Ce.graphlib.Graph();
  s.setDefaultEdgeLabel(() => ({}));
  const a = 200, c = 120;
  return s.setGraph({ rankdir: o, nodesep: 50, ranksep: 100 }), n.forEach((d) => {
    s.setNode(d.id, { width: a, height: c });
  }), t.forEach((d) => {
    s.setEdge(d.source, d.target);
  }), Ce.layout(s), { nodes: n.map((d) => {
    const f = s.node(d.id);
    return {
      ...d,
      position: {
        x: f.x - a / 2,
        y: f.y - c / 2
      }
    };
  }), edges: t };
}, Ge = (n, t) => {
  const o = n.nodes.map((a) => {
    const c = t == null ? void 0 : t.modules[a.type];
    return {
      id: a.id,
      type: "moduleNode",
      position: a.position,
      data: {
        label: a.id,
        moduleType: a.type,
        args: a.data.args,
        inputs: a.data.inputs.length > 0 ? a.data.inputs : (c == null ? void 0 : c.inputs) || [],
        outputs: a.data.outputs.length > 0 ? a.data.outputs : (c == null ? void 0 : c.outputs) || []
      }
    };
  }), s = n.edges.map((a) => ({
    id: a.id,
    source: a.source,
    sourceHandle: a.sourceHandle,
    target: a.target,
    targetHandle: a.targetHandle,
    type: "smoothstep",
    animated: !1,
    style: { stroke: "var(--primary-muted)", strokeWidth: 2 }
  }));
  return { nodes: o, edges: s };
}, Ie = (n, t, o) => {
  const s = n.map((c) => {
    const l = c.data;
    return {
      id: c.id,
      type: l.moduleType,
      position: c.position,
      data: {
        args: l.args,
        inputs: l.inputs,
        outputs: l.outputs
      }
    };
  }), a = t.map((c) => ({
    id: c.id,
    source: c.source,
    sourceHandle: c.sourceHandle || "",
    target: c.target,
    targetHandle: c.targetHandle || ""
  }));
  return { nodes: s, edges: a, meta: o };
}, Gt = ({ api: n, initialConfigPath: t }) => {
  const o = n.editor, [s, a, c] = ct([]), [l, d, f] = dt([]), [N, w] = B(null), [S, k] = B(null), [y, g] = B(t || ""), [m, A] = B({}), [M, u] = B(!1), [v, x] = B(null), [b, R] = B([]), [V, P] = B(!t), [F, D] = B(!1), [X, C] = B(""), O = ue(null), W = "#0f1628", Y = "#11182b", Z = "#e6eaf2", ne = "#9aa6c1", U = "#1e2a44", Ae = "var(--primary)", Q = H(() => ({ moduleNode: Jt }), []), [K, xe] = B(!1);
  te(() => {
    (async () => {
      try {
        const [E, _] = await Promise.all([
          o.getModules(),
          o.getCurrent()
        ]);
        if (w(E), _.available && _.graph) {
          const { nodes: I, edges: ee } = Ge(_.graph, E);
          if (I.every((p) => p.position.x === 0 && p.position.y === 0) && I.length > 0) {
            const p = Oe(I, ee);
            a(p.nodes), d(p.edges);
          } else
            a(I), d(ee);
          A(_.graph.meta), g(_.path || ""), u(!1), P(!1);
        } else {
          const I = await o.listFiles();
          R(I), P(!0);
        }
      } catch (E) {
        console.error("Failed to initialize editor:", E), o.listFiles().then(R).catch(console.error);
      }
    })();
  }, [n, a, d]);
  const le = T(async ($) => {
    try {
      x(null);
      const E = await o.getConfig($), { nodes: _, edges: I } = Ge(E, N);
      if (_.every((r) => r.position.x === 0 && r.position.y === 0) && _.length > 0) {
        const r = Oe(_, I);
        a(r.nodes), d(r.edges);
      } else
        a(_), d(I);
      A(E.meta), g($), u(!1), P(!1);
    } catch (E) {
      x(`Failed to load config: ${E}`);
    }
  }, [n, N, a, d]), ve = T(async () => {
    if (!y) {
      x("No config path specified");
      return;
    }
    try {
      const $ = Ie(s, l, m);
      await o.saveConfig(y, $), u(!1), x(null);
    } catch ($) {
      x(`Failed to save: ${$}`);
    }
  }, [n, y, s, l, m]), ie = T(async () => {
    if (!y) {
      x("No config path specified");
      return;
    }
    xe(!0);
    try {
      const $ = Ie(s, l, m), E = await o.applyConfig($, y);
      E.ok ? (u(!1), x(null), x("Configuration applied successfully!"), setTimeout(() => x(null), 3e3)) : x(`Failed to apply: ${E.error || "Unknown error"}`);
    } catch ($) {
      x(`Failed to apply config: ${$}`);
    } finally {
      xe(!1);
    }
  }, [n, y, s, l, m]), he = T(() => {
    const $ = Oe(s, l);
    a($.nodes), d($.edges), u(!0);
  }, [s, l, a, d]), Re = T(
    ($) => {
      const E = {
        ...$,
        id: `e${Date.now()}`,
        type: "smoothstep",
        style: { stroke: "var(--primary-muted)", strokeWidth: 2 }
      };
      d((_) => je(E, _)), u(!0);
    },
    [d]
  ), ze = T(({ nodes: $ }) => {
    k($.length === 1 ? $[0] : null);
  }, []), Ee = T(() => {
    u(!0);
  }, []), Te = T(($) => {
    $.preventDefault(), $.dataTransfer.dropEffect = "move";
  }, []), Le = T(
    ($) => {
      $.preventDefault();
      const E = $.dataTransfer.getData("application/moduleType"), _ = $.dataTransfer.getData("application/moduleSpec");
      if (!E || !_) return;
      const I = JSON.parse(_), ee = O.current;
      if (!ee) return;
      const r = ee.getBoundingClientRect(), p = {
        x: $.clientX - r.left - 100,
        y: $.clientY - r.top - 50
      };
      let h = I.name.toLowerCase().replace(/[^a-z0-9]/g, "_"), z = 1, L = h;
      for (; s.some((J) => J.id === L); )
        L = `${h}_${z++}`;
      const j = {
        id: L,
        type: "moduleNode",
        position: p,
        data: {
          label: L,
          moduleType: E,
          args: {},
          inputs: I.inputs,
          outputs: I.outputs
        }
      };
      a((J) => [...J, j]), u(!0);
    },
    [s, a]
  ), Be = T(
    ($, E, _) => {
      $.dataTransfer.setData("application/moduleType", E), $.dataTransfer.setData("application/moduleSpec", JSON.stringify(_)), $.dataTransfer.effectAllowed = "move";
    },
    []
  ), _e = T(
    ($, E) => {
      a(
        (_) => _.map((I) => I.id === $ ? { ...I, data: { ...I.data, args: E } } : I)
      ), u(!0);
    },
    [a]
  ), we = T(
    ($) => {
      a((E) => E.filter((_) => _.id !== $)), d((E) => E.filter((_) => _.source !== $ && _.target !== $)), k(null), u(!0);
    },
    [a, d]
  ), De = T(
    ($, E) => {
      if (s.some((_) => _.id === E && _.id !== $)) {
        x(`Node ID "${E}" already exists`);
        return;
      }
      a(
        (_) => _.map((I) => I.id === $ ? { ...I, id: E, data: { ...I.data, label: E } } : I)
      ), d(
        (_) => _.map((I) => {
          const ee = { ...I };
          return I.source === $ && (ee.source = E), I.target === $ && (ee.target = E), ee;
        })
      ), k((_) => (_ == null ? void 0 : _.id) === $ ? { ..._, id: E } : _), u(!0);
    },
    [s, a, d]
  ), We = T(() => {
    a([]), d([]), A({ title: "New Configuration" }), g(""), u(!0), P(!1);
  }, [a, d]), Ne = T(async () => {
    try {
      const $ = Ie(s, l, m), E = await o.toYaml($);
      C(E.yaml), D(!0);
    } catch ($) {
      x(`Failed to generate YAML: ${$}`);
    }
  }, [n, s, l, m]), oe = {
    padding: "6px 12px",
    border: `1px solid ${U}`,
    borderRadius: "6px",
    background: Y,
    color: Z,
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: 500
  };
  return /* @__PURE__ */ i("div", { style: { display: "flex", height: "100vh", width: "100%", background: W }, children: [
    /* @__PURE__ */ e("div", { style: { width: "240px", borderRight: `1px solid ${U}`, background: Y }, children: /* @__PURE__ */ e(Vt, { registry: N, onDragStart: Be }) }),
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
            background: Y
          },
          children: [
            /* @__PURE__ */ e("button", { onClick: () => P(!0), style: oe, children: "Open" }),
            /* @__PURE__ */ e("button", { onClick: We, style: oe, children: "New" }),
            /* @__PURE__ */ e(
              "button",
              {
                onClick: ve,
                disabled: !M || !y,
                style: {
                  ...oe,
                  background: M && y ? Ae : U,
                  color: M && y ? "#fff" : ne,
                  cursor: M && y ? "pointer" : "not-allowed"
                },
                children: "Save"
              }
            ),
            /* @__PURE__ */ e(
              "button",
              {
                onClick: ie,
                disabled: K || !y,
                style: {
                  ...oe,
                  background: y && !K ? "#22c55e" : U,
                  color: y && !K ? "#fff" : ne,
                  cursor: y && !K ? "pointer" : "not-allowed"
                },
                children: K ? "Applying..." : "Apply to Simulation"
              }
            ),
            /* @__PURE__ */ e("div", { style: { width: "1px", height: "20px", background: U } }),
            /* @__PURE__ */ e("button", { onClick: he, style: oe, children: "Auto Layout" }),
            /* @__PURE__ */ e("button", { onClick: Ne, style: oe, children: "View YAML" }),
            /* @__PURE__ */ e("div", { style: { flex: 1 } }),
            y && /* @__PURE__ */ i("span", { style: { fontSize: "12px", color: ne }, children: [
              y,
              M && /* @__PURE__ */ e("span", { style: { color: "#f59e0b" }, children: " (unsaved)" })
            ] })
          ]
        }
      ),
      v && /* @__PURE__ */ i(
        "div",
        {
          style: {
            padding: "8px 12px",
            background: v.includes("success") ? "#14352a" : "#3b1c1c",
            borderBottom: `1px solid ${v.includes("success") ? "#22c55e" : "#7f1d1d"}`,
            color: v.includes("success") ? "#86efac" : "#fca5a5",
            fontSize: "13px"
          },
          children: [
            v,
            /* @__PURE__ */ e(
              "button",
              {
                onClick: () => x(null),
                style: {
                  marginLeft: "8px",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: v.includes("success") ? "#86efac" : "#fca5a5"
                },
                children: "✕"
              }
            )
          ]
        }
      ),
      /* @__PURE__ */ e("div", { ref: O, style: { flex: 1, background: W }, onDragOver: Te, onDrop: Le, children: /* @__PURE__ */ i(
        Xe,
        {
          nodes: s,
          edges: l,
          onNodesChange: c,
          onEdgesChange: f,
          onConnect: Re,
          onSelectionChange: ze,
          onNodeDragStop: Ee,
          nodeTypes: Q,
          fitView: !0,
          snapToGrid: !0,
          snapGrid: [15, 15],
          deleteKeyCode: ["Backspace", "Delete"],
          onNodesDelete: () => u(!0),
          onEdgesDelete: () => u(!0),
          style: { background: W },
          children: [
            /* @__PURE__ */ e(Qe, { variant: ut.Dots, gap: 20, size: 1, color: U }),
            /* @__PURE__ */ e(Ze, { style: { background: Y, border: `1px solid ${U}`, borderRadius: "6px" } }),
            /* @__PURE__ */ e(
              pt,
              {
                nodeColor: ($) => {
                  const E = $.data;
                  return E.moduleType.includes(".neuro.") ? "var(--primary)" : E.moduleType.includes(".ecology.") ? "#22c55e" : "#a855f7";
                },
                maskColor: "rgba(11, 16, 32, 0.7)",
                style: { background: Y, border: `1px solid ${U}`, borderRadius: "6px" }
              }
            ),
            m.title && /* @__PURE__ */ e(ht, { position: "top-center", children: /* @__PURE__ */ e("div", { style: { padding: "6px 14px", background: Y, borderRadius: "6px", border: `1px solid ${U}`, fontSize: "14px", fontWeight: 600, color: Z }, children: m.title }) })
          ]
        }
      ) })
    ] }),
    /* @__PURE__ */ e("div", { style: { width: "280px", borderLeft: `1px solid ${U}`, background: Y }, children: /* @__PURE__ */ e(
      Ut,
      {
        selectedNode: S,
        registry: N,
        onUpdateNode: _e,
        onDeleteNode: we,
        onRenameNode: De
      }
    ) }),
    V && /* @__PURE__ */ e(
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
        onClick: () => P(!1),
        children: /* @__PURE__ */ i(
          "div",
          {
            style: {
              background: Y,
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
              /* @__PURE__ */ e("div", { style: { padding: "16px", borderBottom: `1px solid ${U}` }, children: /* @__PURE__ */ e("h3", { style: { margin: 0, fontSize: "16px", color: Z, fontWeight: 600 }, children: "Open Configuration" }) }),
              /* @__PURE__ */ i("div", { style: { flex: 1, overflow: "auto", padding: "8px" }, children: [
                b.map(($) => /* @__PURE__ */ i(
                  "div",
                  {
                    onClick: () => {
                      $.is_dir ? o.listFiles($.path).then(R) : le($.path);
                    },
                    style: {
                      padding: "10px 12px",
                      cursor: "pointer",
                      borderRadius: "6px",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      color: Z,
                      fontSize: "13px"
                    },
                    onMouseOver: (E) => E.currentTarget.style.background = W,
                    onMouseOut: (E) => E.currentTarget.style.background = "transparent",
                    children: [
                      /* @__PURE__ */ e("span", { children: $.is_dir ? "📁" : "📄" }),
                      /* @__PURE__ */ e("span", { children: $.name })
                    ]
                  },
                  $.path
                )),
                b.length === 0 && /* @__PURE__ */ e("div", { style: { padding: "16px", textAlign: "center", color: ne, fontSize: "13px" }, children: "No config files found" })
              ] }),
              /* @__PURE__ */ e("div", { style: { padding: "12px", borderTop: `1px solid ${U}`, display: "flex", justifyContent: "flex-end" }, children: /* @__PURE__ */ e("button", { onClick: () => P(!1), style: oe, children: "Cancel" }) })
            ]
          }
        )
      }
    ),
    F && /* @__PURE__ */ e(
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
        onClick: () => D(!1),
        children: /* @__PURE__ */ i(
          "div",
          {
            style: {
              background: Y,
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
                /* @__PURE__ */ e("h3", { style: { margin: 0, fontSize: "16px", color: Z, fontWeight: 600 }, children: "YAML Preview" }),
                /* @__PURE__ */ e(
                  "button",
                  {
                    onClick: () => {
                      navigator.clipboard.writeText(X);
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
                    background: W,
                    color: Z,
                    fontSize: "12px",
                    fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
                    lineHeight: 1.5
                  },
                  children: X
                }
              ),
              /* @__PURE__ */ e("div", { style: { padding: "12px", borderTop: `1px solid ${U}`, display: "flex", justifyContent: "flex-end" }, children: /* @__PURE__ */ e("button", { onClick: () => D(!1), style: oe, children: "Close" }) })
            ]
          }
        )
      }
    )
  ] });
};
function Yt({
  headerLeft: n,
  headerRight: t,
  chatAdapter: o
}) {
  var v;
  const s = Me(), { state: a, actions: c } = re(), [l, d] = B(!1), f = ue(null), N = ue(null), w = (x) => {
    if (typeof window > "u") return null;
    try {
      const b = window.sessionStorage.getItem(x);
      if (!b) return null;
      const R = JSON.parse(b);
      return !R || typeof R != "object" ? null : R;
    } catch {
      return null;
    }
  }, S = (x, b) => {
    if (!(typeof window > "u"))
      try {
        window.sessionStorage.setItem(x, JSON.stringify(b));
      } catch {
      }
  }, k = async () => {
    try {
      const x = await s.state(), b = x == null ? void 0 : x.target, R = x == null ? void 0 : x.run, V = (b == null ? void 0 : b.modelId) ?? (R == null ? void 0 : R.model_id) ?? (R == null ? void 0 : R.modelId), P = (b == null ? void 0 : b.spaceId) ?? (R == null ? void 0 : R.project_id) ?? (R == null ? void 0 : R.spaceId);
      if (V) return `simui-controls:model:${V}`;
      if (P) return `simui-controls:space:${P}`;
    } catch {
    }
    return "simui-controls:generic";
  }, y = T(async () => {
    const x = await s.spec();
    c.setSpec(x);
    const b = {}, R = /* @__PURE__ */ new Set();
    for (const D of x.controls || [])
      be(D) && (R.add(D.name), b[D.name] = D.default), de(D) && (R.add(D.name), b[D.name] = String(D.default ?? ""));
    const V = await k();
    N.current = V;
    const P = w(V), F = {};
    if (P)
      for (const [D, X] of Object.entries(P))
        R.has(D) && (F[D] = X);
    c.setControls({ ...b, ...F });
  }, [s, c]), g = T(
    (x) => {
      switch (x.type) {
        case "snapshot": {
          const b = x.data;
          b != null && b.status && c.setStatus(b.status), Array.isArray(b == null ? void 0 : b.visuals) && c.setVisuals(b.visuals), Array.isArray(b == null ? void 0 : b.events) && c.setEvents(b.events);
          break;
        }
        case "tick": {
          const b = x.data;
          b != null && b.status && c.setStatus(b.status), Array.isArray(b == null ? void 0 : b.visuals) && c.setVisuals(b.visuals), b != null && b.event && c.appendEvent(b.event);
          break;
        }
        case "event": {
          const b = x.data;
          c.appendEvent(b);
          break;
        }
        case "status":
        case "heartbeat": {
          const b = x.data;
          c.setStatus(b);
          break;
        }
      }
    },
    [c]
  );
  te(() => ((async () => {
    await y(), f.current = s.subscribeSSE(
      g,
      (b) => {
        console.error("SSE error:", b), d(!1);
      }
    ), d(!0);
  })(), () => {
    f.current && (f.current.close(), f.current = null), d(!1);
  }), [s, g, y]), te(() => {
    const x = N.current;
    x && S(x, a.controls);
  }, [a.controls]);
  const m = T(async () => {
    var V, P;
    const x = {};
    for (const F of ((V = a.spec) == null ? void 0 : V.controls) || []) {
      if (!be(F)) continue;
      const D = a.controls[F.name] ?? F.default, X = typeof D == "number" ? D : Number(String(D));
      Number.isFinite(X) && (x[F.name] = X);
    }
    for (const F of ((P = a.spec) == null ? void 0 : P.controls) || []) {
      if (!de(F)) continue;
      const D = a.controls[F.name] ?? F.default, X = typeof D == "string" ? D : String(D);
      if (X.trim() !== "")
        try {
          x[F.name] = JSON.parse(X);
        } catch (C) {
          console.error("Invalid JSON control:", F.name, C), alert(`Invalid JSON for "${F.label || F.name}". Please fix it and try again.`);
          return;
        }
    }
    const b = Number(x.duration), R = typeof x.tick_dt == "number" ? x.tick_dt : void 0;
    c.setVisuals([]), c.setEvents([]), await s.run(b, R, x);
  }, [s, a.controls, a.spec, c]), A = T(async () => {
    await s.pause();
  }, [s]), M = T(async () => {
    await s.resume();
  }, [s]), u = T(async () => {
    await s.reset(), c.setEvents([]);
  }, [s, c]);
  return /* @__PURE__ */ i(ye, { children: [
    /* @__PURE__ */ i("header", { className: "app-header", children: [
      /* @__PURE__ */ i("div", { className: "app-header-left", children: [
        n,
        /* @__PURE__ */ e("h1", { className: "app-title", children: ((v = a.spec) == null ? void 0 : v.title) || "BioSim UI" })
      ] }),
      /* @__PURE__ */ i("div", { className: "app-header-right", children: [
        t,
        /* @__PURE__ */ e("div", { className: "app-status", children: l && /* @__PURE__ */ e("div", { className: "sse-indicator", title: "Stream Connected" }) })
      ] })
    ] }),
    /* @__PURE__ */ e("aside", { className: "app-sidebar-left", children: /* @__PURE__ */ e(Nt, { onRun: m, onPause: A, onResume: M, onReset: u }) }),
    /* @__PURE__ */ e("main", { className: "app-main", children: /* @__PURE__ */ e(It, { chatAdapter: o }) }),
    /* @__PURE__ */ e("aside", { className: "app-sidebar-right", children: /* @__PURE__ */ e(jt, {}) })
  ] });
}
function Kt() {
  const n = Me();
  return n.editor ? /* @__PURE__ */ e(Gt, { api: n }) : null;
}
function qt({
  initialMode: n,
  editorEnabled: t,
  headerLeft: o,
  headerRight: s,
  chatAdapter: a
}) {
  const [c, l] = B(n ?? "simulation");
  te(() => {
    if (!t) {
      l("simulation");
      return;
    }
    window.location.hash.slice(1) === "editor" && l("editor");
    const N = () => {
      const w = window.location.hash.slice(1);
      l(w === "editor" ? "editor" : "simulation");
    };
    return window.addEventListener("hashchange", N), () => window.removeEventListener("hashchange", N);
  }, [t]);
  const d = () => {
    if (!t) return;
    const f = c === "simulation" ? "editor" : "simulation";
    window.location.hash = f === "editor" ? "editor" : "", l(f);
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
    /* @__PURE__ */ e("div", { className: "app-layout", children: /* @__PURE__ */ e(Yt, { headerLeft: o, headerRight: s, chatAdapter: a }) }),
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
  const c = !!Me().editor;
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
  initialMode: a,
  headerLeft: c,
  headerRight: l,
  chatAdapter: d
}) => {
  const f = t ? `simui-root ${t}` : "simui-root";
  return /* @__PURE__ */ e("div", { className: f, style: { height: s, ...o }, children: /* @__PURE__ */ e(gt, { api: n, children: /* @__PURE__ */ e(yt, { children: /* @__PURE__ */ e(Xt, { initialMode: a, headerLeft: c, headerRight: l, chatAdapter: d }) }) }) });
};
export {
  sn as SimuiApp,
  mt as createSimuiApi
};
