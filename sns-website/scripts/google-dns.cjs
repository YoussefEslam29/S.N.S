/**
 * scripts/google-dns.cjs — Pre-loads Google DNS before Next.js starts.
 *
 * Injected via `node --require ./scripts/google-dns.cjs` in dev/start scripts.
 * This sets Google DNS (8.8.8.8) for the entire Node.js process lifetime,
 * fixing ECONNREFUSED errors on networks where the ISP DNS can't resolve
 * MongoDB Atlas SRV records (_mongodb._tcp.*).
 *
 * Must be .cjs because --require only supports CommonJS.
 */
const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);
