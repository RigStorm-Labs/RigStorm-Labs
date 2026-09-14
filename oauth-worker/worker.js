/**
 * rigstorm-decap-oauth — minimal Decap CMS GitHub OAuth proxy (Cloudflare Worker).
 *
 * Architecture (per Decap docs "External OAuth Clients"):
 *   - GitHub remains the CMS backend.
 *   - GitHub Pages remains the website host.
 *   - This Worker ONLY handles GitHub OAuth (/auth + /callback).
 *
 * Secrets (NEVER commit these — set via `wrangler secret put` or the
 * Cloudflare dashboard > Worker > Settings > Variables):
 *   - OAUTH_CLIENT_ID       (public; from your GitHub OAuth App)
 *   - OAUTH_CLIENT_SECRET   (server-side only; never leaves this Worker)
 *
 * Public vars (safe in wrangler.toml [vars]):
 *   - ALLOWED_ORIGINS  comma-separated, e.g. "https://rigstorm-labs.github.io"
 *   - SCOPES           e.g. "repo,user" (Decap needs `repo` to read/write)
 */

const GITHUB_AUTHORIZE_URL = 'https://github.com/login/oauth/authorize';
const GITHUB_TOKEN_URL = 'https://github.com/login/oauth/access_token';

function randomState() {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return [...bytes].map((b) => b.toString(16).padStart(2, '0')).join('');
}

function jsonError(message, status) {
  return new Response(JSON.stringify({ error: message }), {
    status: status || 400,
    headers: { 'content-type': 'application/json' },
  });
}

// GET /auth — Decap opens: {worker}/auth?provider=github&scope=...&site_id=...
// We validate the provider (if supplied) and redirect to GitHub's authorize URL.
function handleAuth(request, env, workerOrigin) {
  const url = new URL(request.url);
  const provider = url.searchParams.get('provider');
  if (provider && provider !== 'github') {
    return jsonError(`unsupported provider "${provider}" (expected "github")`, 400);
  }
  if (!env.OAUTH_CLIENT_ID) {
    return jsonError('server misconfigured: OAUTH_CLIENT_ID is not set', 500);
  }
  const scope = url.searchParams.get('scope') || env.SCOPES || 'repo,user';
  const authorize = new URL(GITHUB_AUTHORIZE_URL);
  authorize.searchParams.set('client_id', env.OAUTH_CLIENT_ID);
  authorize.searchParams.set('redirect_uri', `${workerOrigin}/callback`);
  authorize.searchParams.set('scope', scope);
  authorize.searchParams.set('state', randomState());
  return Response.redirect(authorize.toString(), 302);
}

// GET /callback?code=... — GitHub redirects here. Exchange `code` for a token
// server-side, then return the handshake page Decap expects:
//   1. popup posts "authorizing:github" to its opener,
//   2. opener replies with a message,
//   3. popup verifies the opener origin against ALLOWED_ORIGINS and posts back
//      "authorization:github:success:{...}" (or "...:error:{...}") via postMessage.
async function handleCallback(request, env, workerOrigin) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  if (!code) {
    return jsonError('missing ?code= query parameter from GitHub', 400);
  }
  if (!env.OAUTH_CLIENT_ID || !env.OAUTH_CLIENT_SECRET) {
    return jsonError('server misconfigured: OAuth client id/secret are not set', 500);
  }

  let payload;
  try {
    const tokenRes = await fetch(GITHUB_TOKEN_URL, {
      method: 'POST',
      headers: { 'content-type': 'application/json', accept: 'application/json' },
      body: JSON.stringify({
        client_id: env.OAUTH_CLIENT_ID,
        client_secret: env.OAUTH_CLIENT_SECRET,
        code,
        redirect_uri: `${workerOrigin}/callback`,
      }),
    });
    const data = await tokenRes.json();
    if (!tokenRes.ok || !data.access_token) {
      throw new Error(data.error_description || data.error || 'token exchange failed');
    }
    payload = {
      message: 'success',
      content: { token: data.access_token, provider: 'github' },
    };
  } catch (err) {
    payload = { message: 'error', content: String((err && err.message) || err) };
  }
  return new Response(renderHandshakePage(env, payload), {
    headers: { 'content-type': 'text/html; charset=utf-8' },
  });
}

// Same handshake as the reference vencax/netlify-cms-github-oauth-provider
// login_script.js: origin allowlist (supports "*.example.com" wildcards).
function renderHandshakePage(env, payload) {
  const origins = (env.ALLOWED_ORIGINS || '').split(',').map((s) => s.trim()).filter(Boolean);
  const message = payload.message === 'success' ? 'success' : 'error';
  const content = JSON.stringify(payload.content);
  return `<!doctype html>
<html><head><meta charset="utf-8"><title>Authorizing…</title></head><body><script>
(function() {
  var allowed = ${JSON.stringify(origins)};
  function hostOf(u) { return String(u).replace(/^https?:\\/\\//, '').split('/')[0].toLowerCase(); }
  function originOk(origin) {
    var host = hostOf(origin);
    for (var i = 0; i < allowed.length; i++) {
      var rule = hostOf(allowed[i]);
      if (rule.charAt(0) === '*' && rule.slice(0, 2) === '*.') {
        var suffix = rule.slice(1);
        if (host.length > suffix.length && host.slice(-suffix.length) === suffix) return true;
      } else if (host === rule) {
        return true;
      }
    }
    return false;
  }
  function receiveMessage(e) {
    if (!originOk(e.origin)) { return; }
    window.opener.postMessage(
      'authorization:github:${message}:' + ${JSON.stringify(content)},
      e.origin
    );
  }
  window.addEventListener('message', receiveMessage, false);
  window.opener.postMessage('authorizing:github', '*');
})();
</scr` + `ipt></body></html>`;
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const workerOrigin = url.origin;
    if (request.method !== 'GET') {
      return jsonError('method not allowed (use GET)', 405);
    }
    if (url.pathname === '/auth') {
      return handleAuth(request, env, workerOrigin);
    }
    if (url.pathname === '/callback') {
      return handleCallback(request, env, workerOrigin);
    }
    if (url.pathname === '/' || url.pathname === '/health') {
      return new Response('rigstorm-decap-oauth: running. Endpoints: /auth, /callback', {
        headers: { 'content-type': 'text/plain' },
      });
    }
    return jsonError('not found (expected /auth or /callback)', 404);
  },
};
