var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// contractor-v003-2-afo.js
var __defProp2 = Object.defineProperty;
var __name2 = /* @__PURE__ */ __name((target, value) => __defProp2(target, "name", { value, configurable: true }), "__name");
var VERSION = "0.6.0";
var WORKER = "contractor-v004-template";
var COMPANY = "CCS Services Group";
var PHONE = "(818) 624-7212";
var PHONE_URL = "tel:+18186247212";
var LICENSE = "CSLB #890991";
async function getContactConstants(env) {
  try {
    const row = await env.V003_2_DB.prepare("SELECT data FROM site_content WHERE section='contact'").first();
    if (row && row.data) {
      const c = JSON.parse(row.data);
      return {
        phone: c.phone || PHONE,
        phone_url: c.phone_url || PHONE_URL,
        license: c.license || LICENSE,
        company: c.company || COMPANY
      };
    }
  } catch (e) {
  }
  return { phone: PHONE, phone_url: PHONE_URL, license: LICENSE, company: COMPANY };
}
__name(getContactConstants, "getContactConstants");
__name2(getContactConstants, "getContactConstants");
var EMBED_MODEL = "@cf/baai/bge-base-en-v1.5";
var CHAT_MODEL = "@cf/meta/llama-3.1-8b-instruct";
var ADMIN_PASS = "demo";
var R2_PREFIX = "contractor-v003-2/";
function uid() {
  return "v2-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 6);
}
__name(uid, "uid");
__name2(uid, "uid");
function now() {
  return (/* @__PURE__ */ new Date()).toISOString();
}
__name(now, "now");
__name2(now, "now");
function esc(s) {
  return String(s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
__name(esc, "esc");
__name2(esc, "esc");
function imgSrc(item) {
  return (item && item.image_r2_key ? "/media/serve/" + encodeURIComponent(item.image_r2_key) : item && item.image_url) || "";
}
__name(imgSrc, "imgSrc");
__name2(imgSrc, "imgSrc");
function j(data, status = 200) {
  return new Response(JSON.stringify(data, null, 2), { status, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } });
}
__name(j, "j");
__name2(j, "j");
function h(html) {
  return new Response(html, { headers: { "Content-Type": "text/html;charset=UTF-8" } });
}
__name(h, "h");
__name2(h, "h");
async function body(req) {
  try {
    return await req.json();
  } catch {
    return {};
  }
}
__name(body, "body");
__name2(body, "body");
async function dbRun(env, sql, p = []) {
  return env.V003_2_DB.prepare(sql).bind(...p).run();
}
__name(dbRun, "dbRun");
__name2(dbRun, "dbRun");
async function dbAll(env, sql, p = []) {
  const r = await env.V003_2_DB.prepare(sql).bind(...p).all();
  return r.results || [];
}
__name(dbAll, "dbAll");
__name2(dbAll, "dbAll");
async function dbFirst(env, sql, p = []) {
  return env.V003_2_DB.prepare(sql).bind(...p).first();
}
__name(dbFirst, "dbFirst");
__name2(dbFirst, "dbFirst");
async function embed(env, text) {
  const r = await env.AI.run(EMBED_MODEL, { text: [text.slice(0, 2e3)] });
  return r.data[0];
}
__name(embed, "embed");
__name2(embed, "embed");
async function vecSearch(env, query, topK = 5) {
  const vec = await embed(env, query);
  const r = await env.V003_2_VECTORIZE.query(vec, { topK, returnMetadata: "all" });
  return r.matches || [];
}
__name(vecSearch, "vecSearch");
__name2(vecSearch, "vecSearch");
function csvCell(v) {
  return '"' + String(v == null ? "" : v).replace(/"/g, '""') + '"';
}
__name(csvCell, "csvCell");
__name2(csvCell, "csvCell");
function csvRes(filename, text) {
  return new Response(text, { headers: { "Content-Type": "text/csv;charset=utf-8", "Content-Disposition": 'attachment; filename="' + filename + '"' } });
}
__name(csvRes, "csvRes");
__name2(csvRes, "csvRes");
function validLeadStatus(s) {
  return ["new", "contacted", "quoted", "won", "lost"].includes(String(s || "").toLowerCase());
}
__name(validLeadStatus, "validLeadStatus");
__name2(validLeadStatus, "validLeadStatus");
function validCallbackStatus(s) {
  return ["pending", "called", "no_answer", "scheduled"].includes(String(s || "").toLowerCase());
}
__name(validCallbackStatus, "validCallbackStatus");
__name2(validCallbackStatus, "validCallbackStatus");
async function loadContent(env) {
  const rows = await dbAll(env, "SELECT section,data FROM site_content");
  const c = {};
  for (const row of rows) {
    try {
      c[row.section] = JSON.parse(row.data);
    } catch (e) {
      c[row.section] = {};
    }
  }
  return c;
}
__name(loadContent, "loadContent");
__name2(loadContent, "loadContent");
var SITE_CSS = ':root{--primary:#1a2744;--accent:#c8a84b;--bg:#f8f7f5;--dark:#0f1a2e;--text:#1c1c1e;--muted:#666;--border:#e4e4e4;--r:8px;--shadow:0 2px 12px rgba(0,0,0,.08)}*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}html{scroll-behavior:smooth}body{font-family:"Inter",system-ui,sans-serif;background:var(--bg);color:var(--text);line-height:1.65;-webkit-font-smoothing:antialiased}h1,h2,h3,h4{font-family:"Oswald",sans-serif;letter-spacing:.02em}a{color:inherit;text-decoration:none}img{display:block;width:100%;height:auto}.container{max-width:1100px;margin:0 auto;padding:0 1.5rem}.section{padding:5rem 0}.section-alt{background:#fff}.section-dark{background:var(--primary)}.section-darker{background:var(--dark)}.section-head{margin-bottom:3rem}.section-head h2{font-size:2.2rem;color:var(--primary);margin-bottom:.4rem}.section-dark .section-head h2,.section-darker .section-head h2{color:#fff}.section-sub{color:var(--muted);font-size:.97rem}.section-dark .section-sub,.section-darker .section-sub{color:rgba(255,255,255,.65)}nav{position:sticky;top:0;z-index:200;background:var(--primary);border-bottom:3px solid var(--accent)}.nav-inner{display:flex;align-items:center;justify-content:space-between;padding:.8rem 1.5rem}.logo{font-family:"Oswald",sans-serif;color:#fff;font-size:1.4rem;letter-spacing:.06em}.logo span{color:var(--accent)}.nav-menu{display:flex;align-items:center;gap:1.5rem}.nav-menu a{color:rgba(255,255,255,.8);font-size:.84rem;transition:color .15s}.nav-menu a:hover{color:var(--accent)}.nav-phone{color:var(--accent)!important;font-weight:600!important}.nav-cta{background:var(--accent);color:#fff!important;padding:.38rem .9rem;border-radius:3px;font-weight:600!important}.hamburger{display:none;flex-direction:column;gap:5px;cursor:pointer;padding:4px}.hamburger span{display:block;width:22px;height:2px;background:#fff;border-radius:2px}.mobile-menu{display:none;flex-direction:column;background:var(--primary);border-top:1px solid rgba(255,255,255,.1)}.mobile-menu a{padding:.85rem 1.5rem;color:rgba(255,255,255,.85);font-size:.92rem;border-bottom:1px solid rgba(255,255,255,.07)}.trust-bar{background:var(--dark);padding:.55rem 0}.trust-inner{display:flex;flex-wrap:wrap;gap:.6rem 2rem;align-items:center;justify-content:center}.trust-item{color:rgba(255,255,255,.75);font-size:.78rem}.trust-item a{color:var(--accent);font-weight:700}.btn{display:inline-block;padding:.72rem 1.6rem;border-radius:3px;font-weight:600;cursor:pointer;border:none;font-size:.93rem;font-family:"Inter",sans-serif;transition:opacity .15s,transform .1s;text-align:center}.btn:hover{opacity:.88;transform:translateY(-1px)}.btn-primary{background:var(--accent);color:#fff}.btn-ghost{background:transparent;color:#fff;border:2px solid rgba(255,255,255,.55)}.hero{position:relative;min-height:92vh;display:flex;align-items:center;overflow:hidden}.hero-bg{position:absolute;inset:0}.hero-bg img{width:100%;height:100%;object-fit:cover}.hero-grad{position:absolute;inset:0;background:linear-gradient(115deg,rgba(15,26,46,.96) 40%,rgba(15,26,46,.5) 75%,rgba(15,26,46,.2) 100%)}.hero-content{position:relative;z-index:2;padding:2rem 2rem 2rem 2.5rem;max-width:660px;color:#fff}.hero-eyebrow{display:inline-flex;gap:.6rem;align-items:center;background:rgba(200,168,75,.18);border:1px solid rgba(200,168,75,.4);color:var(--accent);font-size:.72rem;letter-spacing:.16em;text-transform:uppercase;padding:.35rem .85rem;border-radius:20px;margin-bottom:1.2rem;font-weight:500}.hero h1{font-size:clamp(2.2rem,4.5vw,3.6rem);line-height:1.06;margin-bottom:1.1rem}.hero h1 span{color:var(--accent)}.hero-sub{font-size:clamp(.95rem,1.8vw,1.1rem);opacity:.85;margin-bottom:2rem;line-height:1.65;font-weight:300;max-width:520px}.hero-ctas{display:flex;gap:1rem;flex-wrap:wrap;margin-bottom:1.75rem}.hero-stats{display:flex;gap:2rem;flex-wrap:wrap;margin-top:2.5rem;padding-top:2rem;border-top:1px solid rgba(255,255,255,.15)}.stat-num{font-family:"Oswald",sans-serif;font-size:2rem;color:var(--accent);line-height:1}.stat-label{font-size:.75rem;color:rgba(255,255,255,.6);margin-top:.2rem}.svc-tabs{display:flex;flex-wrap:wrap;gap:.5rem;margin-bottom:2rem;border-bottom:2px solid var(--border);padding-bottom:.5rem}.svc-tab{background:transparent;border:none;font-family:"Inter",sans-serif;font-size:.85rem;font-weight:500;color:var(--muted);cursor:pointer;padding:.5rem .9rem;border-radius:4px 4px 0 0;transition:all .2s;white-space:nowrap}.svc-tab.active{color:var(--accent);border-bottom:2px solid var(--accent);margin-bottom:-2px;font-weight:600}.svc-panel{display:none}.svc-panel.active{display:block}.svc-panel-inner{display:grid;grid-template-columns:1fr 1fr;gap:2.5rem;align-items:start}.svc-img-wrap{border-radius:var(--r);overflow:hidden;aspect-ratio:4/3;box-shadow:var(--shadow)}.svc-img{width:100%;height:100%;object-fit:cover;transition:transform .4s ease}.svc-img-wrap:hover .svc-img{transform:scale(1.04)}.svc-panel-body h3{font-size:1.6rem;color:var(--primary);margin-bottom:.75rem}.svc-desc{color:#555;font-size:.94rem;line-height:1.7;margin-bottom:1.25rem}.svc-hi{list-style:none;display:grid;grid-template-columns:1fr 1fr;gap:.35rem .75rem;margin-bottom:1.5rem}.svc-hi li{font-size:.85rem;color:#444;padding-left:1.1rem;position:relative;line-height:1.45}.svc-hi li::before{content:"\\2713";position:absolute;left:0;color:var(--accent);font-weight:700}.proj-filter{display:flex;flex-wrap:wrap;gap:.5rem;margin-bottom:2rem}.proj-filter-btn{background:transparent;border:1px solid var(--border);color:var(--muted);font-family:"Inter",sans-serif;font-size:.82rem;padding:.38rem .85rem;border-radius:20px;cursor:pointer;transition:all .2s}.proj-filter-btn.active{background:var(--accent);border-color:var(--accent);color:#fff}.proj-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:1.25rem}.proj-card{border-radius:var(--r);overflow:hidden;background:#fff;box-shadow:var(--shadow);cursor:pointer;transition:transform .2s,box-shadow .2s}.proj-card:hover{transform:translateY(-3px);box-shadow:0 8px 24px rgba(0,0,0,.13)}.proj-img-wrap{position:relative;aspect-ratio:4/3;overflow:hidden}.proj-img{width:100%;height:100%;object-fit:cover;transition:transform .35s}.proj-card:hover .proj-img{transform:scale(1.06)}.proj-overlay{position:absolute;inset:0;background:linear-gradient(to top,rgba(15,26,46,.85) 30%,transparent 70%);display:flex;align-items:flex-end;padding:1rem}.proj-type{font-size:.72rem;font-weight:600;text-transform:uppercase;letter-spacing:.1em;color:var(--accent);background:rgba(0,0,0,.4);padding:.25rem .6rem;border-radius:10px}.proj-body{padding:1.1rem 1.25rem 1.25rem}.proj-body h3{font-size:1rem;color:var(--primary);margin-bottom:.25rem}.proj-loc{font-size:.78rem;color:var(--muted);margin-bottom:.4rem}.proj-desc{font-size:.82rem;color:#555;line-height:1.55;margin-bottom:.6rem}.proj-more{font-size:.82rem;color:var(--accent);font-weight:600}.rev-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:1.25rem}.rev-card{background:#fff;border-radius:var(--r);padding:1.5rem;box-shadow:var(--shadow);border-top:3px solid var(--accent)}.rev-stars{color:var(--accent);font-size:1.05rem;margin-bottom:.6rem}.rev-text{color:#444;font-size:.88rem;line-height:1.65;font-style:italic;margin-bottom:.85rem}.rev-footer{display:flex;justify-content:space-between;align-items:center}.rev-name{font-size:.82rem;font-weight:600;color:var(--primary)}.rev-proj{font-size:.75rem;color:var(--muted)}.proc-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:1.1rem}.proc-step{background:rgba(255,255,255,.07);border-radius:var(--r);padding:1.5rem;border-left:3px solid var(--accent)}.proc-num{font-family:"Oswald",sans-serif;font-size:2.2rem;color:var(--accent);line-height:1;margin-bottom:.6rem}.proc-step h3{font-size:.97rem;color:#fff;margin-bottom:.35rem}.proc-step p{font-size:.83rem;color:rgba(255,255,255,.65);line-height:1.55}.art-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:1.25rem}.art-card{display:block;border-radius:var(--r);overflow:hidden;background:#fff;box-shadow:var(--shadow);transition:transform .2s,box-shadow .2s;color:inherit;text-decoration:none}.art-card:hover{transform:translateY(-3px);box-shadow:0 8px 24px rgba(0,0,0,.13)}.art-body{padding:1.1rem 1.25rem 1.25rem}.art-body h3{font-size:1rem;color:var(--primary);margin-bottom:.4rem;line-height:1.3}.art-body p{font-size:.82rem;color:#555;line-height:1.55;margin-bottom:.6rem}.art-more{font-size:.82rem;color:var(--accent);font-weight:600}.leads-grid{display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin-bottom:1rem}.leads-input,.leads-select,.leads-textarea{width:100%;padding:.72rem .9rem;border:1px solid var(--border);border-radius:var(--r);font-family:"Inter",sans-serif;font-size:16px;background:#fff;color:var(--text);outline:none;-webkit-appearance:none}.leads-input:focus,.leads-select:focus,.leads-textarea:focus{border-color:var(--accent)}.leads-textarea{resize:vertical;min-height:90px;grid-column:1/-1}.leads-select-half{grid-column:span 1}.lfr{margin-top:1rem;font-size:.88rem;padding:.6rem .9rem;border-radius:var(--r);display:none}.lfr.ok{background:#dcfce7;color:#15803d}.lfr.err{background:#fee2e2;color:#b91c1c}.cb-widget{background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.12);border-radius:12px;padding:2rem;margin-top:2.5rem}.cb-widget h3{font-family:"Oswald",sans-serif;font-size:1.3rem;color:#fff;margin-bottom:.4rem}.cb-widget p{font-size:.86rem;color:rgba(255,255,255,.6);margin-bottom:1.25rem}.cb-grid{display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin-bottom:1rem}.cb-input,.cb-select{width:100%;padding:.7rem .9rem;border:1px solid rgba(255,255,255,.15);border-radius:var(--r);font-family:"Inter",sans-serif;font-size:16px;background:rgba(255,255,255,.07);color:#fff;outline:none;-webkit-appearance:none}.cb-input:focus,.cb-select:focus{border-color:var(--accent)}.cb-input::placeholder{color:rgba(255,255,255,.35)}.cb-select option{background:#1a2744;color:#fff}footer{background:#060d18;color:rgba(255,255,255,.42);padding:2rem 0;font-size:.81rem;text-align:center}#chatFab{position:fixed;bottom:1.5rem;right:1.5rem;z-index:500;background:var(--accent);color:#fff;font-family:"Oswald",sans-serif;font-size:.95rem;font-weight:600;letter-spacing:.06em;padding:.75rem 1.35rem;border-radius:50px;border:none;cursor:pointer;box-shadow:0 4px 20px rgba(200,168,75,.45);display:flex;align-items:center;gap:.5rem;transition:transform .2s}#chatFab:hover{transform:translateY(-2px)}#chatDrawer{position:fixed;bottom:0;right:0;width:100%;max-width:420px;z-index:600;transform:translateY(110%);transition:transform .3s cubic-bezier(.4,0,.2,1);border-radius:16px 16px 0 0;overflow:hidden;box-shadow:0 -8px 40px rgba(0,0,0,.25)}#chatDrawer.open{transform:translateY(0)}.chat-phone-bar{background:var(--dark);padding:.65rem 1.25rem;display:flex;align-items:center;justify-content:space-between}.chat-phone-bar a{color:var(--accent);font-family:"Oswald",sans-serif;font-size:1rem;font-weight:600;letter-spacing:.04em;display:flex;align-items:center;gap:.5rem}.chat-close-btn{background:transparent;border:none;color:rgba(255,255,255,.5);cursor:pointer;font-size:1.3rem;line-height:1}.chat-header{background:var(--primary);padding:1rem 1.25rem;display:flex;align-items:center;gap:.75rem;border-bottom:1px solid rgba(255,255,255,.08)}.chat-avatar{width:36px;height:36px;border-radius:50%;background:var(--accent);display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:1rem}.chat-title{color:#fff;font-family:"Oswald",sans-serif;font-size:1rem;letter-spacing:.04em}.chat-sub{color:rgba(255,255,255,.5);font-size:.75rem;margin-top:.1rem}.chat-msgs{background:#fff;height:320px;overflow-y:auto;padding:1rem;display:flex;flex-direction:column;gap:.75rem}.cmsg{max-width:88%}.cmsg.user{align-self:flex-end}.cmsg.user .bubble{background:var(--primary);color:#fff;border-radius:16px 16px 3px 16px}.cmsg.bot .bubble{background:#f1f1f1;color:var(--text);border-radius:16px 16px 16px 3px}.bubble{padding:.6rem 1rem;font-size:.88rem;line-height:1.55}.actions{display:flex;gap:.4rem;flex-wrap:wrap;margin-top:.4rem}.chip{font-size:.78rem;padding:.28rem .7rem;border:1.5px solid var(--accent);color:var(--accent);border-radius:10px;cursor:pointer;background:transparent;font-family:"Inter",sans-serif;text-decoration:none;display:inline-block;transition:all .15s}.chip:hover,.chip.call{background:var(--accent);color:#fff;border-color:var(--accent)}.chat-input-row{background:#f8f7f5;border-top:1px solid var(--border);display:flex;align-items:center;gap:.5rem;padding:.75rem 1rem}.chat-text{flex:1;border:1.5px solid var(--border);border-radius:20px;padding:.55rem 1rem;font-size:16px;font-family:"Inter",sans-serif;outline:none;background:#fff;-webkit-appearance:none}.chat-text:focus{border-color:var(--accent)}.chat-send{background:var(--accent);color:#fff;border:none;border-radius:50%;width:36px;height:36px;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0}.upload-area{padding:.75rem 1rem;background:#f8f7f5;border-top:1px solid var(--border)}.upload-label{display:flex;align-items:center;gap:.5rem;cursor:pointer;font-size:.83rem;color:var(--accent);font-weight:600;padding:.5rem .9rem;border:1.5px dashed var(--accent);border-radius:var(--r);justify-content:center}.upload-label input{display:none}@media(max-width:768px){.nav-menu{display:none}.hamburger{display:flex}.svc-panel-inner,.proj-grid,.rev-grid,.proc-grid,.leads-grid,.cb-grid,.art-grid{grid-template-columns:1fr}.svc-hi{grid-template-columns:1fr}#chatDrawer{max-width:100%;border-radius:16px 16px 0 0}}';
