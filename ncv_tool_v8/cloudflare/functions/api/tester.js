// NCV V8 on Cloudflare Pages: this Function answers /api/tester and records testers in the Neon
// `testers` table; Pages serves the tool itself from public/. It takes one of three actions, all keyed
// by the browser's random tester id:
//   start  { id, email, answers, profile, version }  sign-up on the start page
//   step   { id, step, profile }                     the step a tester last opened
//   finish { id, answers, profile }                  the three questions on Export
// Only the tool's own origin may post. No draft text is accepted.
import { neon } from "@neondatabase/serverless";

const ID_RE = /^[0-9a-f-]{8,64}$/i;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const STEPS = ["start", "setup", "contrib", "mentor", "ps", "review", "export", "feedback"];
const START_KEYS = ["funding", "before", "want"];
const END_KEYS = ["useful", "stuck", "change"];

const json = (status, body) => new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } });
const str = (v, max) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const pick = (o, keys) => {
  const out = {};
  if (o && typeof o === "object") keys.forEach(k => { const v = str(o[k], 2000); if (v) out[k] = v; });
  return out;
};
const cleanProfile = (p) => {
  if (!p || typeof p !== "object") return {};
  return { agency: str(p.agency, 40), field: str(p.field, 40), stage: str(p.stage, 40),
    workMode: Array.isArray(p.workMode) ? p.workMode.slice(0, 6).map(v => str(v, 40)) : [] };
};

async function tester(request, env) {
  if (request.method !== "POST") return json(405, { error: "POST only" });
  const origin = request.headers.get("Origin");
  if (origin !== new URL(request.url).origin) return json(403, { error: "origin" });
  const len = Number(request.headers.get("Content-Length") || 0);
  if (len > 16000) return json(413, { error: "too large" });
  let b;
  try { b = JSON.parse(await request.text()); } catch (_) { return json(400, { error: "json" }); }
  if (!b || !ID_RE.test(b.id || "")) return json(400, { error: "id" });
  const sql = neon(env.DATABASE_URL);
  const profile = JSON.stringify(cleanProfile(b.profile));
  const ua = str(request.headers.get("User-Agent"), 300);
  if (b.action === "start") {
    const email = str(b.email, 254);
    if (!EMAIL_RE.test(email)) return json(400, { error: "email" });
    await sql`insert into testers (tester_id, email, start_answers, profile, last_step, tool_version, user_agent)
      values (${b.id}, ${email}, ${JSON.stringify(pick(b.answers, START_KEYS))}::jsonb, ${profile}::jsonb, 'start', ${str(b.version, 80)}, ${ua})
      on conflict (tester_id) do update set email = excluded.email, start_answers = excluded.start_answers,
        profile = excluded.profile, tool_version = excluded.tool_version, user_agent = excluded.user_agent`;
    return json(200, { ok: true });
  }
  if (b.action === "step") {
    if (!STEPS.includes(b.step)) return json(400, { error: "step" });
    const r = await sql`update testers set last_step = ${b.step}, profile = ${profile}::jsonb where tester_id = ${b.id} returning tester_id`;
    return r.length ? json(200, { ok: true }) : json(404, { error: "unknown tester" });
  }
  if (b.action === "finish") {
    const r = await sql`update testers set end_answers = ${JSON.stringify(pick(b.answers, END_KEYS))}::jsonb, finished_at = now(),
      last_step = 'export', profile = ${profile}::jsonb where tester_id = ${b.id} returning tester_id`;
    return r.length ? json(200, { ok: true }) : json(404, { error: "unknown tester" });
  }
  return json(400, { error: "action" });
}

export async function onRequest({ request, env }) {
  try { return await tester(request, env); }
  catch (e) { console.error(e); return json(500, { error: "server" }); }
}
