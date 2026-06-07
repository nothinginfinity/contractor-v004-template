import app from "./contractor-v004-template.js";

const ADMIN_PASS = "demo";

function injectAdminRescue(html) {
  const rescue = `<script id="admin-login-rescue">
(function(){
  var PASS=${JSON.stringify(ADMIN_PASS)};
  function byId(id){ return document.getElementById(id); }
  function show(el, value){ if(el) el.style.display=value; }
  function safeSessionSet(k,v){ try { sessionStorage.setItem(k,v); } catch(e) {} }
  function safeSessionGet(k){ try { return sessionStorage.getItem(k); } catch(e) { return null; } }
  function safeSessionRemove(k){ try { sessionStorage.removeItem(k); } catch(e) {} }
  function unlockAdmin(){
    show(byId("lock"), "none");
    show(byId("app"), "block");
    try { if (typeof loadAll === "function") loadAll(); else if (typeof loadStatus === "function") loadStatus(); } catch(e) { console.error("Admin load failed", e); }
  }
  function attemptLogin(){
    var pwEl=byId("pw");
    var err=byId("pwErr");
    var pw=pwEl ? pwEl.value : "";
    if(pw===PASS){
      safeSessionSet("ccs_admin_v2", "1");
      unlockAdmin();
    } else {
      show(err, "block");
      if(pwEl) pwEl.value="";
    }
  }
  function bindLogin(){
    try {
      window.tryLogin = attemptLogin;
      window.unlock = unlockAdmin;
      var btn=byId("pwBtn");
      var pw=byId("pw");
      var logout=byId("logoutBtn");
      if(btn){ btn.onclick=function(e){ if(e) e.preventDefault(); attemptLogin(); }; }
      if(pw){ pw.onkeydown=function(e){ if(e.key==="Enter"){ e.preventDefault(); attemptLogin(); } }; }
      if(logout){ logout.onclick=function(){ safeSessionRemove("ccs_admin_v2"); show(byId("app"), "none"); show(byId("lock"), "flex"); if(pw) pw.value=""; }; }
      if(safeSessionGet("ccs_admin_v2")==="1") unlockAdmin();
    } catch(e) { console.error("Admin login rescue failed", e); }
  }
  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded", bindLogin); else bindLogin();
})();
</script>`;
  if (html.includes("</body>")) return html.replace("</body>", rescue + "</body>");
  return html + rescue;
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname.replace(/\/+$/, "") || "/";
    const response = await app.fetch(request, env, ctx);
    if (request.method === "GET" && path === "/admin") {
      const html = await response.text();
      const headers = new Headers(response.headers);
      headers.set("Content-Type", "text/html;charset=UTF-8");
      headers.set("Cache-Control", "no-store");
      return new Response(injectAdminRescue(html), { status: response.status, headers });
    }
    return response;
  }
};
