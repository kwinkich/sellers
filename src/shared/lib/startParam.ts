export type DeepLinkTarget =
  | { type: "practice"; id: number }
  | { type: "course"; id: number }
  | { type: "lesson"; id: number }
  | { type: "unknown" };

export function parseStartParam(sp: string | null | undefined): DeepLinkTarget {
  if (!sp) return { type: "unknown" };
  const m = sp.match(/^(practice|course|lesson)_(\d+)$/i);
  if (!m) return { type: "unknown" };
  const [, kind, idStr] = m;
  const id = Number(idStr);
  if (!Number.isFinite(id)) return { type: "unknown" };
  if (kind.toLowerCase() === "practice") return { type: "practice", id };
  if (kind.toLowerCase() === "course") return { type: "course", id };
  if (kind.toLowerCase() === "lesson") return { type: "lesson", id };
  return { type: "unknown" };
}
