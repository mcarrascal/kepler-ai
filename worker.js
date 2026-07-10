/**
 * Cloudflare Worker entry point for the Kepler AI static site.
 *
 * Serves the static assets while enforcing:
 *  - HTTP → HTTPS redirect (Qualys: Insecure Transport)
 *  - Security headers on every response (Qualys: Clickjacking,
 *    missing CSP / X-Frame-Options / X-Content-Type-Options /
 *    Referrer-Policy / Permissions-Policy / HSTS, Cache-Control)
 */

const CSP = [
  "default-src 'self'",
  "script-src 'self'",
  // 'unsafe-inline' only for styles: the page uses a couple of inline
  // style attributes; scripts remain strictly same-origin.
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com",
  "img-src 'self' data:",
  "connect-src 'self' https://api.web3forms.com",
  "form-action 'self' https://api.web3forms.com",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "object-src 'none'",
  "upgrade-insecure-requests",
].join("; ");

const SECURITY_HEADERS = {
  "Content-Security-Policy": CSP,
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
  "X-Frame-Options": "DENY",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=(), payment=()",
};

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.protocol === "http:") {
      url.protocol = "https:";
      return Response.redirect(url.toString(), 301);
    }

    const assetResponse = await env.ASSETS.fetch(request);
    const response = new Response(assetResponse.body, assetResponse);

    for (const [name, value] of Object.entries(SECURITY_HEADERS)) {
      response.headers.set(name, value);
    }

    // The contact form collects PII — keep HTML out of shared caches and
    // avoid the "public" directive Qualys flags (QID 150249).
    const contentType = response.headers.get("Content-Type") || "";
    if (contentType.includes("text/html")) {
      response.headers.set("Cache-Control", "no-cache, must-revalidate");
    } else if (/(javascript|css|json)/.test(contentType)) {
      response.headers.set("Cache-Control", "max-age=3600, must-revalidate");
    } else if (/(image|font)/.test(contentType)) {
      response.headers.set("Cache-Control", "max-age=2592000");
    }

    return response;
  },
};
