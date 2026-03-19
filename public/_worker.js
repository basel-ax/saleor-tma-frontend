/**
 * Cloudflare Pages SPA Routing Worker
 * 
 * This worker handles SPA routing by serving index.html for all
 * non-asset routes, avoiding the infinite loop detection issue
 * that affects _redirects files.
 */

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

    // Let static assets through directly
    if (
      path.startsWith('/assets/') ||
      path.match(/\.(js|css|svg|png|jpg|jpeg|gif|woff|woff2|ico|json|html)$/)
    ) {
      return fetch(request);
    }

    // For all other routes (SPA pages), serve index.html
    const indexUrl = new URL('/index.html', request.url);
    return fetch(indexUrl);
  }
};
