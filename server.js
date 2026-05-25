/**
 * NEXUS TRADE — Render Server
 * Serves the single-page trading app and injects
 * environment variables into the HTML at request time.
 */

const express = require('express');
const path    = require('path');
const fs      = require('fs');

const app  = express();
const PORT = process.env.PORT || 3000;

// ── Read the app HTML once at startup ─────────────────────
const htmlPath   = path.join(__dirname, 'public', 'index.html');
let   baseHTML   = fs.readFileSync(htmlPath, 'utf8');

// ── Build runtime config from environment variables ───────
function getRuntimeConfig() {
  return {
    // Deriv API
    DERIV_APP_ID:         process.env.DERIV_APP_ID         || '1089',
    DERIV_WS_URL:         process.env.DERIV_WS_URL         || 'wss://ws.derivws.com/websockets/v3',
    DERIV_OAUTH_URL:      process.env.DERIV_OAUTH_URL      || 'https://oauth.deriv.com/oauth2/authorize',

    // Trading defaults
    DEFAULT_STAKE:        process.env.DEFAULT_STAKE        || '1.00',
    DEFAULT_DURATION:     process.env.DEFAULT_DURATION     || '5',
    DEFAULT_DURATION_UNIT:process.env.DEFAULT_DURATION_UNIT|| 'm',
    MIN_CONFIDENCE_AUTO:  process.env.MIN_CONFIDENCE_AUTO  || '72',
    MAX_ACTIVE_TRADES:    process.env.MAX_ACTIVE_TRADES    || '5',

    // Risk limits
    DEFAULT_DAILY_TP:     process.env.DEFAULT_DAILY_TP     || '50',
    DEFAULT_DAILY_SL:     process.env.DEFAULT_DAILY_SL     || '20',
    MAX_STAKE_PER_TRADE:  process.env.MAX_STAKE_PER_TRADE  || '50',

    // App meta
    APP_NAME:             process.env.APP_NAME             || 'NEXUS TRADE',
    APP_ENV:              process.env.APP_ENV              || 'production',
    ALLOWED_ACCOUNT_TYPES:process.env.ALLOWED_ACCOUNT_TYPES|| 'demo,real',
  };
}

// ── Inject env vars as a <script> block into <head> ───────
function injectConfig(html) {
  const cfg    = getRuntimeConfig();
  const wsUrl  = `${cfg.DERIV_WS_URL}?app_id=${cfg.DERIV_APP_ID}`;
  const oaUrl  = `${cfg.DERIV_OAUTH_URL}?app_id=${cfg.DERIV_APP_ID}&l=EN&brand=deriv`;

  const injection = `
<script>
/* ── NEXUS TRADE — Runtime Config (injected by server) ── */
window.__NEXUS_ENV__ = ${JSON.stringify(cfg, null, 2)};

/* Override CFG before app scripts run */
window.__NEXUS_OVERRIDES__ = {
  WS_URL:              ${JSON.stringify(wsUrl)},
  APP_ID:              ${parseInt(cfg.DERIV_APP_ID) || 1089},
  OAUTH_URL:           ${JSON.stringify(oaUrl)},
  DEFAULT_STAKE:       ${parseFloat(cfg.DEFAULT_STAKE)},
  DEFAULT_DURATION:    ${parseInt(cfg.DEFAULT_DURATION)},
  DEFAULT_DURATION_UNIT:${JSON.stringify(cfg.DEFAULT_DURATION_UNIT)},
  MIN_CONF_AUTO:       ${parseInt(cfg.MIN_CONFIDENCE_AUTO)},
  MAX_ACTIVE:          ${parseInt(cfg.MAX_ACTIVE_TRADES)},
  DEFAULT_DAILY_TP:    ${parseFloat(cfg.DEFAULT_DAILY_TP)},
  DEFAULT_DAILY_SL:    ${parseFloat(cfg.DEFAULT_DAILY_SL)},
  MAX_STAKE:           ${parseFloat(cfg.MAX_STAKE_PER_TRADE)},
  APP_ENV:             ${JSON.stringify(cfg.APP_ENV)},
};

/* Apply overrides to CFG as soon as it loads */
document.addEventListener('DOMContentLoaded', function() {
  if (window.CFG && window.__NEXUS_OVERRIDES__) {
    Object.assign(window.CFG, window.__NEXUS_OVERRIDES__);
  }
});
</script>`;

  // Inject right before </head>
  return html.replace('</head>', injection + '\n</head>');
}

// ── Health check ───────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({
    status:  'ok',
    app:     process.env.APP_NAME || 'NEXUS TRADE',
    env:     process.env.APP_ENV  || 'production',
    version: '2.0.0',
    uptime:  Math.floor(process.uptime()) + 's',
    time:    new Date().toISOString(),
  });
});

// ── Config endpoint (non-sensitive values only) ────────────
app.get('/config', (req, res) => {
  const cfg = getRuntimeConfig();
  // Never expose tokens or secrets — only trading config
  res.json({
    appId:           cfg.DERIV_APP_ID,
    defaultStake:    cfg.DEFAULT_STAKE,
    minConfidence:   cfg.MIN_CONFIDENCE_AUTO,
    maxActiveTrades: cfg.MAX_ACTIVE_TRADES,
    defaultDailyTP:  cfg.DEFAULT_DAILY_TP,
    defaultDailySL:  cfg.DEFAULT_DAILY_SL,
    env:             cfg.APP_ENV,
  });
});

// ── Serve static files (CSS, images, etc. if any) ─────────
app.use(express.static(path.join(__dirname, 'public'), {
  index: false, // We handle index.html manually below
}));

// ── Main app route — inject config and serve ──────────────
app.get('*', (req, res) => {
  try {
    const html = injectConfig(baseHTML);
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.send(html);
  } catch (err) {
    console.error('[Server] Error serving app:', err);
    res.status(500).send('Internal server error');
  }
});

// ── Start ──────────────────────────────────────────────────
app.listen(PORT, '0.0.0.0', () => {
  const cfg = getRuntimeConfig();
  console.log('');
  console.log('╔══════════════════════════════════════════════╗');
  console.log('║        ⚡ NEXUS TRADE v2.0 — LIVE            ║');
  console.log('╚══════════════════════════════════════════════╝');
  console.log(`  Port:       ${PORT}`);
  console.log(`  Env:        ${cfg.APP_ENV}`);
  console.log(`  Deriv AppID:${cfg.DERIV_APP_ID}`);
  console.log(`  Min Conf:   ${cfg.MIN_CONFIDENCE_AUTO}%`);
  console.log(`  Max Active: ${cfg.MAX_ACTIVE_TRADES} trades`);
  console.log(`  Daily TP:   $${cfg.DEFAULT_DAILY_TP}`);
  console.log(`  Daily SL:   $${cfg.DEFAULT_DAILY_SL}`);
  console.log('');
  console.log(`  Health:     http://localhost:${PORT}/health`);
  console.log(`  Config:     http://localhost:${PORT}/config`);
  console.log('');
});
