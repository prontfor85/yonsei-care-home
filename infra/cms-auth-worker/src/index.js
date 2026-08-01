// 연세노인전문요양원 관리자 페이지(Decap CMS) 로그인 중계 서버.
// GitHub OAuth 의 client_secret 은 브라우저에 둘 수 없으므로 이 Worker 가 대신 토큰을 교환한다.
// 흐름: CMS 팝업 → /auth (GitHub 로그인으로 이동) → GitHub → /callback (토큰 교환 후
// window.opener 에 postMessage 로 전달하는 Decap 표준 핸드셰이크).
//
// 환경변수 — wrangler.toml: GITHUB_CLIENT_ID, ALLOWED_ORIGIN
//           시크릿(wrangler secret put): GITHUB_CLIENT_SECRET

const GITHUB_AUTHORIZE = "https://github.com/login/oauth/authorize";
const GITHUB_TOKEN = "https://github.com/login/oauth/access_token";

const html = (body, status = 200) =>
  new Response(body, {
    status,
    headers: { "Content-Type": "text/html;charset=utf-8", "Cache-Control": "no-store" },
  });

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/auth") {
      // CSRF 방지: state 를 쿠키에 심어 두고 /callback 에서 대조한다
      const state = crypto.randomUUID();
      const authUrl = new URL(GITHUB_AUTHORIZE);
      authUrl.searchParams.set("client_id", env.GITHUB_CLIENT_ID);
      authUrl.searchParams.set("scope", "repo,user");
      authUrl.searchParams.set("state", state);
      return new Response(null, {
        status: 302,
        headers: {
          Location: authUrl.toString(),
          "Set-Cookie": `csrf=${state}; HttpOnly; Secure; Path=/; SameSite=Lax; Max-Age=600`,
        },
      });
    }

    if (url.pathname === "/callback") {
      const code = url.searchParams.get("code");
      const state = url.searchParams.get("state");
      const cookie = (request.headers.get("Cookie") || "").match(/csrf=([\w-]+)/);
      if (!code || !state || !cookie || cookie[1] !== state) {
        return html("<p>인증 상태가 유효하지 않습니다. 창을 닫고 다시 로그인해 주세요.</p>", 400);
      }

      const tokenRes = await fetch(GITHUB_TOKEN, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          client_id: env.GITHUB_CLIENT_ID,
          client_secret: env.GITHUB_CLIENT_SECRET,
          code,
        }),
      });
      const data = await tokenRes.json();
      const ok = Boolean(data.access_token);
      const payload = ok
        ? { token: data.access_token, provider: "github" }
        : { error: data.error_description || "토큰 교환에 실패했습니다" };
      const message = `authorization:github:${ok ? "success" : "error"}:${JSON.stringify(payload)}`;

      // Decap 핸드셰이크: 팝업이 "authorizing:github" 를 보내면 CMS 가 응답하고,
      // 그 응답을 받은 뒤에야 토큰을 전달한다. 두 방향 모두 허용된 origin 으로만 보낸다.
      return html(`<!doctype html><meta charset="utf-8"><p>로그인 처리 중…</p><script>
(function () {
  var allowed = ${JSON.stringify(env.ALLOWED_ORIGIN)};
  var message = ${JSON.stringify(message)};
  function receive(e) {
    if (e.origin !== allowed) return;
    window.removeEventListener("message", receive);
    window.opener.postMessage(message, allowed);
  }
  window.addEventListener("message", receive);
  window.opener.postMessage("authorizing:github", allowed);
})();
</script>`);
    }

    return html("<p>연세노인전문요양원 CMS 로그인 중계 서버입니다.</p>", 404);
  },
};
