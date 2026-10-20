# Agnee 2026 Deployment & Security Headers Guide

This document specifies the deployment configuration, CDN caching strategies, Content Security Policy (CSP), and HTTP security headers for hosting Agnee 2026 across modern static platforms (Cloudflare Pages, Netlify, GitHub Pages, or Vercel).

---

## 1. Static Hosting Deployment

Agnee 2026 is designed as a high-performance, framework-free static web application. It requires zero compilation or server-side runtime to serve.

### Deploying to Cloudflare Pages (Recommended)
- **Framework Preset**: None (Static HTML)
- **Build Command**: *(None)*
- **Build Output Directory**: `.` (Root directory)

### Deploying to Netlify
- Create a `netlify.toml` in the repository root or configure via UI:
```toml
[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
    Permissions-Policy = "camera=(), microphone=(), geolocation=()"
    Content-Security-Policy = "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdnjs.cloudflare.com https://unpkg.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: blob: https:; frame-src 'self' https://www.youtube-nocookie.com https://www.youtube.com; connect-src 'self' https://cdnjs.cloudflare.com https://unpkg.com;"

[[headers]]
  for = "/sw.js"
  [headers.values]
    Cache-Control = "no-cache, no-store, must-revalidate"

[[headers]]
  for = "/data/*.json"
  [headers.values]
    Cache-Control = "public, max-age=60, stale-while-revalidate=600"

[[headers]]
  for = "/styles.css"
  [headers.values]
    Cache-Control = "public, max-age=86400"
```

### Deploying to GitHub Pages
1. Push to branch `main`.
2. Go to **Settings > Pages**.
3. Set Source to **Deploy from a branch**, Branch: `main`, Folder: `/ (root)`.
4. GitHub Pages serves static files directly with automated HTTPS certificate provisioning.

---

## 2. Security Headers & Content Security Policy (CSP)

```http
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdnjs.cloudflare.com https://unpkg.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: blob: https:; frame-src 'self' https://www.youtube-nocookie.com; connect-src 'self' https://cdnjs.cloudflare.com https://unpkg.com;
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=()
```

---

## 3. Cache Optimization Strategies
- **HTML (`index.html`, `404.html`)**: `Cache-Control: public, max-age=0, must-revalidate` (guarantees visitors always fetch updated metadata and script hashes).
- **Service Worker (`sw.js`)**: `Cache-Control: no-cache, no-store, must-revalidate` (ensures browser instantly detects service worker lifecycle updates).
- **Data Schemas (`/data/*.json`)**: `Cache-Control: public, max-age=60, stale-while-revalidate=600` (short cache with instantaneous background revalidation).
- **Static Assets (`*.css`, `*.js`, `*.png`, `*.svg`)**: `Cache-Control: public, max-age=86400` (1 day).
