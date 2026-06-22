# Deployment – WertApp auf Cloudflare

**Ziel-Setup:**
- Frontend → Cloudflare Pages (`mitmachen.pitsuchtpot.net`)
- Backend API → Cloudflare Worker (`mitmachen.pitsuchtpot.net/api/*`)
- Datenbank → Cloudflare D1 (SQLite-kompatibel)
- Domain-Zone: `pitsuchtpot.net` (bereits bei Cloudflare)

---

## Voraussetzungen

```bash
npm install -g wrangler
wrangler login   # öffnet Browser → Cloudflare-Login
```

---

## Schritt 1 – D1-Datenbank anlegen

```bash
cd worker
wrangler d1 create wertapp
```

Die Ausgabe zeigt die `database_id`. Diese in `worker/wrangler.toml` eintragen:

```toml
[[d1_databases]]
binding       = "DB"
database_name = "wertapp"
database_id   = "HIER_DIE_ECHTE_ID_EINTRAGEN"
```

---

## Schritt 2 – Migrationen ausführen (Tabellen anlegen)

```bash
# Tabellen in der Remote-D1-Datenbank erstellen:
cd worker
npm run db:migrate:remote

# Optional: Demo-Projekte einspielen
npm run db:seed:remote
```

---

## Schritt 3 – Secrets setzen

```bash
cd worker
wrangler secret put ADMIN_PASSWORD
# Prompt erscheint → sicheres Passwort eingeben (nicht "admin"!)
```

Das Passwort wird **niemals** im Repository gespeichert — nur als Cloudflare-Secret.

---

## Schritt 4 – Worker deployen

```bash
cd worker
npm install
npm run deploy
```

Erfolgreich, wenn die Ausgabe zeigt:
```
Published wertapp-api (...)
  mitmachen.pitsuchtpot.net/api/*
```

Test:
```
curl https://mitmachen.pitsuchtpot.net/api/health
# → {"ok":true,"ts":...}
```

---

## Schritt 5 – Frontend auf Cloudflare Pages deployen

### 5a – Neues Pages-Projekt anlegen (einmalig)

Im Cloudflare Dashboard → **Workers & Pages → Create → Pages → Connect to Git**:

- Repository: `querkobdoppellol/Evaluation-partizipativer-Kulturprojekte`
- **Build settings:**
  - Root directory: `frontend`
  - Build command: `npm run build`
  - Build output directory: `dist`
- Projekt-Name z.B. `wertapp`

Cloudflare baut automatisch bei jedem Push auf `main`.

### 5b – Custom Domain verbinden

Im Cloudflare Dashboard → Pages-Projekt → **Custom Domains → Add custom domain**:

```
mitmachen.pitsuchtpot.net
```

Cloudflare legt den DNS-CNAME-Eintrag automatisch an (da die Zone bereits bei Cloudflare ist).

---

## Schritt 6 – DNS-Routing prüfen

Nach dem Verbinden der Custom Domain sollte der Routing-Flow sein:

```
mitmachen.pitsuchtpot.net/api/*  →  Worker (wertapp-api)
mitmachen.pitsuchtpot.net/*      →  Pages  (wertapp)
```

Der Worker-Route `mitmachen.pitsuchtpot.net/api/*` hat Vorrang vor Pages.

Test im Browser:
- `https://mitmachen.pitsuchtpot.net/` → React-App
- `https://mitmachen.pitsuchtpot.net/admin` → Admin-UI
- `https://mitmachen.pitsuchtpot.net/api/health` → `{"ok":true}`
- `https://mitmachen.pitsuchtpot.net/api/projekte` → `[]` (leer bis Projekte angelegt)

---

## Lokale Entwicklung (nach dem Deployment)

```bash
# Terminal 1 – Worker
cd worker
cp .dev.vars.example .dev.vars   # einmalig, dann ADMIN_PASSWORD=... setzen
npm install
npm run db:migrate:local         # lokale D1-Datenbank anlegen
npm run db:seed:local            # Demo-Projekte (optional)
npm run dev                      # Worker auf http://localhost:8787

# Terminal 2 – Frontend
cd frontend
npm run dev                      # Vite auf http://localhost:5173
                                 # /api wird automatisch an :8787 proxied
```

---

## Subdomain-Änderung

Falls die Subdomain nicht `mitmachen` sein soll:

1. `worker/wrangler.toml` → `pattern` anpassen
2. Cloudflare Pages → Custom Domain entfernen und neue hinzufügen

---

## Sicherheitshinweise

- `ADMIN_PASSWORD` niemals im Repository; immer als Cloudflare-Secret
- `worker/.dev.vars` ist gitignored — gehört **nicht** in das Repo
- HTTPS wird von Cloudflare automatisch bereitgestellt
- Keine personenbezogenen Daten im `antworten`-Datensatz (Consent-Text beachten)
- Hinweis in Freitext-Feldern: „Bitte keine Namen"
