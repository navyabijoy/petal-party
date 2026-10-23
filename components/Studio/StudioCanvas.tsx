"use client";

import { useRef, type Dispatch, type KeyboardEvent, type PointerEvent } from "react";
import { BOX, type Arrangement, type Item } from "@/lib/arrangement";
import { RIBBONS, WRAPS } from "@/lib/catalog";
import { SIZE_MAX, SIZE_MIN, type Action } from "@/lib/studioState";
import { Foliage, ItemContent, Wrap, itemTransform } from "@/components/Bouquet";

type Pt = { x: number; y: number };
type Gesture =
  | { kind: "drag"; id: string; ox: number; oy: number; started: boolean }
  | { kind: "handle"; id: string; started: boolean }
  | { kind: "pinch"; id: string; d0: number; a0: number; s0: number; r0: number; started: boolean }
  | null;

/** Selection ring radius and handle distance, as a fraction of item size. */
const RING = 0.6;
const deg = (rad: number) => (rad * 180) / Math.PI;
const clamp = (n: number, lo: number, hi: number) => Math.min(Math.max(n, lo), hi);

type Props = {
  arrangement: Arrangement;
  selectedId: string | null;
  dispatch: Dispatch<Action>;
  halo?: string;
};

export function StudioCanvas({ arrangement, selectedId, dispatch, halo = "#F1F0D6" }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const pointers = useRef(new Map<number, Pt>());
  const gesture = useRef<Gesture>(null);

  const selected = arrangement.items.find((i) => i.id === selectedId) ?? null;

  const toBox = (e: { clientX: number; clientY: number }): Pt => {
    const svg = svgRef.current;
    const m = svg?.getScreenCTM();
    if (!svg || !m) return { x: 0, y: 0 };
    const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(m.inverse());
    return { x: p.x, y: p.y };
  };

  const beginChange = (g: NonNullable<Gesture>) => {
    // History is recorded on the first actual movement, so a plain tap adds no undo step.
    if (!g.started) {
      dispatch({ t: "checkpoint" });
      g.started = true;
    }
  };

  const onPointerDown = (e: PointerEvent<SVGSVGElement>) => {
    svgRef.current?.setPointerCapture(e.pointerId);
    const p = toBox(e);
    pointers.current.set(e.pointerId, p);

    if (pointers.current.size === 2 && selected) {
      const [a, b] = [...pointers.current.values()];
      gesture.current = {
        kind: "pinch", id: selected.id, started: false,
        d0: Math.hypot(b.x - a.x, b.y - a.y) || 1,
        a0: Math.atan2(b.y - a.y, b.x - a.x),
        s0: selected.s, r0: selected.r,
      };
      return;
    }

    const target = e.target as Element;
    if (selected && target.closest("[data-handle]")) {
      gesture.current = { kind: "handle", id: selected.id, started: false };
      return;
    }
    const hit = target.closest("[data-item]");
    const id = hit?.getAttribute("data-item");
    const item = id ? arrangement.items.find((i) => i.id === id) : undefined;
    if (item) {
      dispatch({ t: "select", id: item.id });
      gesture.current = { kind: "drag", id: item.id, ox: p.x - item.x, oy: p.y - item.y, started: false };
    } else {
      dispatch({ t: "select", id: null });
      gesture.current = null;
    }
  };

  const onPointerMove = (e: PointerEvent<SVGSVGElement>) => {
    if (!pointers.current.has(e.pointerId)) return;
    const p = toBox(e);
    pointers.current.set(e.pointerId, p);
    const g = gesture.current;
    if (!g) return;

    if (g.kind === "drag") {
      beginChange(g);
      dispatch({ t: "patch", id: g.id, patch: { x: p.x - g.ox, y: p.y - g.oy } });
    } else if (g.kind === "pinch" && pointers.current.size >= 2) {
      const [a, b] = [...pointers.current.values()];
      beginChange(g);
      const d = Math.hypot(b.x - a.x, b.y - a.y) || 1;
      dispatch({
        t: "patch", id: g.id,
        patch: { s: g.s0 * (d / g.d0), r: g.r0 + deg(Math.atan2(b.y - a.y, b.x - a.x) - g.a0) },
      });
    } else if (g.kind === "handle") {
      const item = arrangement.items.find((i) => i.id === g.id);
      if (!item) return;
      beginChange(g);
      const dx = p.x - item.x;
      const dy = p.y - item.y;
      // The handle sits at 45 degrees from the item's own axis.
      dispatch({ t: "patch", id: g.id, patch: { s: Math.hypot(dx, dy) / RING, r: deg(Math.atan2(dy, dx)) - 45 } });
    }
  };

  const onPointerUp = (e: PointerEvent<SVGSVGElement>) => {
    pointers.current.delete(e.pointerId);
    if (pointers.current.size < 2 && gesture.current?.kind === "pinch") gesture.current = null;
    if (pointers.current.size === 0) gesture.current = null;
  };

  const onKeyDown = (e: KeyboardEvent<SVGSVGElement>) => {
    if (!selected) return;
    const step = e.shiftKey ? 12 : 4;
    const move = (dx: number, dy: number) => {
      dispatch({ t: "checkpoint" });
      dispatch({ t: "patch", id: selected.id, patch: { x: selected.x + dx, y: selected.y + dy } });
    };
    const change = (patch: Partial<Pick<Item, "s" | "r">>) => {
      dispatch({ t: "checkpoint" });
      dispatch({ t: "patch", id: selected.id, patch });
    };
    const handled = (() => {
      switch (e.key) {
        case "ArrowLeft": move(-step, 0); return true;
        case "ArrowRight": move(step, 0); return true;
        case "ArrowUp": move(0, -step); return true;
        case "ArrowDown": move(0, step); return true;
        case "+": case "=": change({ s: clamp(selected.s * 1.08, SIZE_MIN, SIZE_MAX) }); return true;
        case "-": change({ s: clamp(selected.s * 0.92, SIZE_MIN, SIZE_MAX) }); return true;
        case "[": change({ r: selected.r - 8 }); return true;
        case "]": change({ r: selected.r + 8 }); return true;
        case "Delete": case "Backspace": dispatch({ t: "remove", id: selected.id }); return true;
        case "Escape": dispatch({ t: "select", id: null }); return true;
        default: return false;
      }
    })();
    if (handled) e.preventDefault();
  };

  const wrap = WRAPS.find((w) => w.id === arrangement.wrap) ?? WRAPS[0];
  const ribbon = RIBBONS.find((r) => r.id === arrangement.ribbon) ?? RIBBONS[0];
  const ring = selected ? selected.s * RING : 0;
  const handleAngle = selected ? ((selected.r + 45) * Math.PI) / 180 : 0;

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${BOX.w} ${BOX.h}`}
      role="group"
      aria-label="Bouquet canvas. Tap a flower to select it. With a flower selected: arrow keys move, plus and minus resize, brackets rotate, Delete removes."
      tabIndex={0}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onKeyDown={onKeyDown}
      style={{ width: "100%", height: "100%", touchAction: "none", userSelect: "none", outlineOffset: 4 }}
    >
      <circle cx={150} cy={150} r={138} fill={halo} />
      <Foliage />
      {arrangement.items.map((it) => (
        <g key={it.id} data-item={it.id} transform={itemTransform(it)} style={{ cursor: "grab" }}>
          <circle r={50} fill="transparent" />
          <ItemContent item={it} />
        </g>
      ))}
      <g style={{ pointerEvents: "none" }}>
        <Wrap color={wrap.color} ribbon={ribbon.color} />
      </g>
      {selected && (
        <g>
          <circle cx={selected.x} cy={selected.y} r={ring} fill="none" stroke="#1B1B1B" strokeWidth={1.6} strokeDasharray="5 4" style={{ pointerEvents: "none" }} />
          <circle
            data-handle
            cx={selected.x + Math.cos(handleAngle) * ring}
            cy={selected.y + Math.sin(handleAngle) * ring}
            r={9}
            fill="#F6C232"
            stroke="#1B1B1B"
            strokeWidth={2}
            style={{ cursor: "nwse-resize" }}
          />
        </g>
      )}
    </svg>
  );
}
