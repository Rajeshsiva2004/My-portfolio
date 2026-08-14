# Rajesh S — Data Analyst Portfolio

A static, no-code-editable portfolio site. All content is real — nothing invented.

Stack: **HTML5 + CSS3 + vanilla JavaScript** for the site, **Decap CMS** for the visual admin, deployed on **Vercel** with a **GitHub** repo as the source of truth. No database, no Netlify, no custom backend beyond two tiny login-only functions.

---

## 1. What's in this project

```
portfolio/
├── index.html              # The site (single page, all sections)
├── css/style.css           # Design system + layout (unchanged)
├── js/script.js            # Renders content.json into the page; nav, modal, animations
├── content/content.json    # ALL editable text/data lives here (this is what the admin edits)
├── assets/
│   ├── favicon.svg
│   ├── profile/profile.jpg # Your photo
│   ├── resume/resume.pdf   # Your resume
│   └── uploads/            # New files uploaded from the admin land here
├── admin/
│   ├── index.html          # Decap CMS admin app
│   └── config.yml          # Defines every editable field in the admin UI
├── api/
│   ├── auth.js             # Step 1 of GitHub login (redirects to GitHub)
│   └── callback.js         # Step 2 of GitHub login (exchanges code for a token)
├── .env.example
└── README.md
```

The page never has hard-coded text in HTML — `js/script.js` fetches `content/content.json` at load time and builds every section from it. Editing content in the admin means editing that one JSON file through a friendly form; the live site picks it up on the next deploy.

---

## 2. How editing works now (no Netlify, no database)

1. You open `yourdomain.vercel.app/admin/` and click **Login with GitHub**.
2. GitHub asks you to authorize the app once. `api/auth.js` and `api/callback.js` handle this — they only ever touch a login token, nothing about your content.
3. You edit fields in a normal form (name, tagline, skills, projects, etc.) or drag-and-drop a new photo/PDF.
4. You click **Publish**.
5. Decap CMS commits the change directly to `content/content.json` (and uploads any new image/PDF into `assets/uploads/`) in your GitHub repo, using the GitHub API with your own account's permissions.
6. Vercel detects the new commit and redeploys automatically — usually under a minute.
7. Your live portfolio shows the new content. No code was touched, and there's still no database anywhere — GitHub *is* the storage.

Only people with write access to your GitHub repo (i.e. you) can log in and publish, so this stays admin-only.

---

## 3. Deployment — step by step

### Step 1 — Push this project to GitHub
Create a repo (e.g. `rajesh-portfolio`) and push everything in this folder, keeping the structure as-is.

### Step 2 — Deploy to Vercel
1. Go to [vercel.com](https://vercel.com) → **Add New... → Project** → import your GitHub repo.
2. Framework preset: **Other**. Build command: leave empty. Output directory: leave as root (`.`).
3. Click **Deploy**. Vercel gives you a URL like `https://rajesh-portfolio.vercel.app`.

### Step 3 — Create a GitHub OAuth App (this powers admin login)
1. Go to [github.com/settings/developers](https://github.com/settings/developers) → **OAuth Apps → New OAuth App**.
2. Fill in:
   - **Homepage URL**: `https://rajesh-portfolio.vercel.app`
   - **Authorization callback URL**: `https://rajesh-portfolio.vercel.app/api/callback`
3. Click **Register application**, then **Generate a new client secret**.
4. Copy the **Client ID** and **Client Secret**.

### Step 4 — Add environment variables in Vercel
In your Vercel project: **Settings → Environment Variables**, add:

| Name | Value |
|---|---|
| `GITHUB_CLIENT_ID` | from Step 3 |
| `GITHUB_CLIENT_SECRET` | from Step 3 |

Redeploy after adding them (Vercel → Deployments → ⋯ → Redeploy).

### Step 5 — Point the CMS at your repo
Open `admin/config.yml` and set:
```yaml
backend:
  name: github
  repo: YOUR_GITHUB_USERNAME/rajesh-portfolio
  branch: main
  base_url: https://rajesh-portfolio.vercel.app
  auth_endpoint: api/auth
```
Commit and push — this redeploys automatically.

### Step 6 — Log in to the admin
Visit `https://rajesh-portfolio.vercel.app/admin/`, click **Login with GitHub**, authorize once. You'll see the **Portfolio Content** collection: Personal Info & Links, Skills, Experience, Projects, Education, Certifications, Additional Information.

---

## 4. Editing content after deployment

All of this happens visually inside `/admin/` — no code editor needed.

| Task | Where in admin |
|---|---|
| Change name, title, tagline, summary, email, phone, location | Personal Info & Links |
| Replace profile photo | Personal Info & Links → Profile Image |
| Replace resume PDF | Personal Info & Links → Resume PDF |
| Change LinkedIn / GitHub URLs | Personal Info & Links → LinkedIn URL / GitHub URL |
| Add / edit / remove a skill or category | Skills |
| Add / edit / remove an internship | Internship Experience |
| Add / edit / remove a project, add GitHub/Live Demo links, mark Featured | Projects |
| Edit education details | Education |
| Add / edit / remove certifications, add credential links | Certifications |
| Edit languages, DSA, open source, availability | Additional Information |

Every change requires clicking **Publish** in the CMS before it goes live (and a short Vercel redeploy, usually well under a minute).

---

## 5. Running locally (optional, to preview before deploying)

Because the page uses `fetch()` to load `content/content.json`, opening `index.html` directly from your file system (`file://`) will be blocked by the browser. Serve it with a simple local server instead:

```bash
cd portfolio
python3 -m http.server 8080
```

Then open `http://localhost:8080`. The `/admin/` login only works once deployed (it needs the real Vercel URL registered with GitHub's OAuth app and the `/api` functions running).

---

## 6. Why this setup, and what changed from the Netlify version

- **No Netlify.** The old version relied on Netlify Identity + Git Gateway, which only work on Netlify. That's been replaced with GitHub's own OAuth login, handled by two tiny functions in `/api`.
- **No database.** Content still lives in `content/content.json` inside your GitHub repo — the same file, edited the same way, just committed via GitHub's API instead of Netlify's.
- **`/api/auth.js` and `/api/callback.js` are the only server-side code in this project**, and they only ever see a login token — never your portfolio content, images, or resume. Nothing is stored in a database or session store.
- Everything else — design, layout, animations, sections, the JSON-driven rendering in `js/script.js` — is untouched from the original.

---

## 7. Notes on the content itself

- Every skill, internship, project, education entry, and certification shown comes directly from `Data_Analyst_Resume_rajesh.pdf`.
- The resume lists the same GitHub link under every project, since no per-project repository URLs were given.
- No project in the resume had a live demo URL, so those fields are empty and editable from **Projects → Live Demo URL** whenever you have one.
- No certification credential links were listed, so those are editable from **Certifications → Credential URL** whenever you have them.
- LinkedIn is set to `https://www.linkedin.com/in/rajeshsiva2404` per your correction (the resume text listed `linkedin.com/in/sivarajesh`).

## 8. Design system reference

- Fonts: **Manrope** (headings), **Inter** (body), **IBM Plex Mono** (labels, tags, dates).
- Colors: warm-gray background, dark ink text, single amber/gold accent, muted teal used sparingly for featured states.
- Signature element: a dashed "axis" outline behind the hero photo and dotted tick-mark dividers between sections, echoing chart axes.
- Respects `prefers-reduced-motion`; all interactive elements have visible focus states for keyboard users.
