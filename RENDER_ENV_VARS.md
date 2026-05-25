# 🔧 NEXUS TRADE — Render Environment Variables

Complete reference for all environment variables to add in your
Render dashboard under **Environment → Environment Variables**.

---

## How to Add on Render

1. Go to **https://dashboard.render.com**
2. Select your **nexus-trade** service
3. Click **Environment** in the left sidebar
4. Click **Add Environment Variable**
5. Add each variable below as **Key** + **Value**
6. Click **Save Changes** → Render auto-deploys

---

## ✅ All Environment Variables

### SERVER VARIABLES

| Key | Value | Description |
|-----|-------|-------------|
| `NODE_ENV` | `production` | Node environment |
| `PORT` | `3000` | Port (Render overrides automatically) |
| `APP_NAME` | `NEXUS TRADE` | Application name shown in logs |
| `APP_ENV` | `production` | App environment label |

---

### DERIV API VARIABLES

| Key | Value | Description |
|-----|-------|-------------|
| `DERIV_APP_ID` | `1089` | Your Deriv App ID. **Replace with your own** from developers.deriv.com |
| `DERIV_WS_URL` | `wss://ws.derivws.com/websockets/v3` | Deriv WebSocket API URL (do not change) |
| `DERIV_OAUTH_URL` | `https://oauth.deriv.com/oauth2/authorize` | Deriv OAuth URL (do not change) |

> **Get your App ID:**
> 1. Go to https://developers.deriv.com
> 2. Sign in → My Apps → Register Application
> 3. Name: NEXUS TRADE
> 4. Redirect URI: your Render URL (e.g. https://nexus-trade.onrender.com)
> 5. Scopes: ✅ Read, ✅ Trade
> 6. Copy the app_id

---

### TRADING DEFAULT VARIABLES

| Key | Value | Description |
|-----|-------|-------------|
| `DEFAULT_STAKE` | `1.00` | Default stake per trade in USD |
| `DEFAULT_DURATION` | `5` | Default trade duration value |
| `DEFAULT_DURATION_UNIT` | `m` | Duration unit: `t`=ticks, `s`=seconds, `m`=minutes, `h`=hours |
| `MIN_CONFIDENCE_AUTO` | `72` | Minimum AI confidence % to execute auto-trades |
| `MAX_ACTIVE_TRADES` | `5` | Maximum simultaneous open trades |

---

### RISK MANAGEMENT VARIABLES

| Key | Value | Description |
|-----|-------|-------------|
| `DEFAULT_DAILY_TP` | `50` | Default daily take profit in USD — stops all trading when hit |
| `DEFAULT_DAILY_SL` | `20` | Default daily stop loss in USD — stops all trading when hit |
| `MAX_STAKE_PER_TRADE` | `50` | Hard cap on any single trade stake in USD |
| `ALLOWED_ACCOUNT_TYPES` | `demo,real` | Which account types are allowed: `demo`, `real`, or `demo,real` |

---

## 📋 Quick Copy — Paste These Exactly

```
NODE_ENV=production
PORT=3000
APP_NAME=NEXUS TRADE
APP_ENV=production
DERIV_APP_ID=1089
DERIV_WS_URL=wss://ws.derivws.com/websockets/v3
DERIV_OAUTH_URL=https://oauth.deriv.com/oauth2/authorize
DEFAULT_STAKE=1.00
DEFAULT_DURATION=5
DEFAULT_DURATION_UNIT=m
MIN_CONFIDENCE_AUTO=72
MAX_ACTIVE_TRADES=5
DEFAULT_DAILY_TP=50
DEFAULT_DAILY_SL=20
MAX_STAKE_PER_TRADE=50
ALLOWED_ACCOUNT_TYPES=demo,real
```

---

## 🔒 Security Notes

- **Never** add your Deriv API token as an environment variable
- API tokens are entered by the user in the browser — they never touch your server
- The server only injects non-sensitive configuration (App ID, defaults)
- All actual trading communication goes directly from the user's browser to Deriv

---

## 🌍 Changing Deriv Server Region

To use a different Deriv server region, change `DERIV_WS_URL`:

| Region | URL |
|--------|-----|
| Default (Global) | `wss://ws.derivws.com/websockets/v3` |
| Green (EU) | `wss://green.derivws.com/websockets/v3` |
| Blue (Asia) | `wss://blue.derivws.com/websockets/v3` |
| Red (Americas) | `wss://red.derivws.com/websockets/v3` |

---

## 🔄 Deploying to Render Step by Step

### Step 1 — Push to GitHub
```bash
cd nexus-trade-render
git init
git add .
git commit -m "NEXUS TRADE v2.0 — Render deployment"
git remote add origin https://github.com/YOUR_USERNAME/nexus-trade.git
git push -u origin main
```

### Step 2 — Create Render Service
1. Go to https://dashboard.render.com
2. Click **New +** → **Web Service**
3. Connect your GitHub account
4. Select **nexus-trade** repository
5. Render auto-detects `render.yaml` — confirm settings:
   - **Name:** nexus-trade
   - **Region:** Oregon (or closest to you)
   - **Branch:** main
   - **Runtime:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
6. Click **Create Web Service**

### Step 3 — Add Environment Variables
1. Service page → **Environment** tab
2. Add all variables from the table above
3. **IMPORTANT:** Change `DERIV_APP_ID` to your own App ID
4. Click **Save Changes**

### Step 4 — Access Your App
- Your app will be live at: `https://nexus-trade.onrender.com`
- Health check: `https://nexus-trade.onrender.com/health`
- Config check: `https://nexus-trade.onrender.com/config`

---

## 🐛 Troubleshooting on Render

| Problem | Solution |
|---------|----------|
| Build fails | Check Node version ≥18 in package.json engines |
| App crashes | Check Render logs → likely missing env var |
| "Cannot find module 'express'" | Run `npm install` locally first, check package.json |
| WebSocket not connecting | Ensure DERIV_APP_ID is valid |
| Health check fails | Verify PORT env var is set (Render sets it automatically) |
| Slow cold start | Free tier sleeps after 15min — upgrade to Starter ($7/mo) |

---

## 💰 Render Pricing

| Plan | Cost | Notes |
|------|------|-------|
| Free | $0/mo | Sleeps after 15min inactivity, 512MB RAM |
| Starter | $7/mo | Always-on, 512MB RAM — **Recommended** |
| Standard | $25/mo | Always-on, 2GB RAM |

For a trading app, **Starter ($7/mo)** is recommended so it never sleeps.

---

*NEXUS TRADE v2.0 — MIT License*
