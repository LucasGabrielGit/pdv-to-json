# ⚡ dev-kit.tech

<p align="center">
  <a href="https://dev-kit.tech">
    <img src="https://img.shields.io/badge/Website-dev--kit.tech-blue?style=for-the-badge&logo=googlechrome&logoColor=white" alt="Live Demo" />
  </a>
  <img src="https://img.shields.io/badge/Next.js_15-black?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js 15" />
  <img src="https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React 19" />
  <img src="https://img.shields.io/badge/TypeScript_Strict-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind_CSS_v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS v4" />
  <img src="https://img.shields.io/badge/Google_Gemini_AI-8E75C2?style=for-the-badge&logo=googlegemini&logoColor=white" alt="Gemini AI" />
  <img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge" alt="MIT License" />
</p>

> **The ultimate, unified suite of 35+ fast, privacy-first developer tools & AI-powered utilities.**  
> Everything runs **100% client-side** inside your browser memory — zero telemetry, zero server persistence. Features free daily AI usage and a **BYOK (Bring Your Own Key)** engine powered by Google Gemini.

🔗 **Try it live:** [https://dev-kit.tech](https://dev-kit.tech)

---

## 🌟 Why dev-kit.tech?

- 🔒 **100% Client-Side & Private:** Conversions, hashing, image optimizations, and parsing use Web Workers and the Web Crypto API. Your data and private credentials **never** touch a backend.
- ⚡ **Zero-Friction & Fast:** Built on Next.js 15 App Router and React 19 with instant keyboard shortcut access (`⌘ + K` / `Ctrl + K`). No mandatory sign-up required.
- 🤖 **AI-Powered with BYOK:** Smart developer tools powered by Google Gemini (Flash & Pro). Use your free Google AI Studio API key for unlimited generations.
- 📱 **Modern & Responsive:** Styled with Tailwind CSS v4, dark-mode first, glassmorphism UI, and accessible Radix primitives.

---

## 🛠️ Complete Tools Catalog (35+ Tools)

### 🔄 Converters & Code Generators
* **JSON ↔ CSV:** Bidirectional converter with automatic nested object flattening and array unnesting.
* **JSON ↔ YAML:** High-speed YAML/JSON parser with 2/4-space indentation settings and key ordering.
* **JSON to Types / Zod:** Instantly transforms JSON payloads into TypeScript Interfaces, Zod Schemas, Python Pydantic Models, or Go Structs.
* **SVG to JSX / React:** In-browser SVGO optimization and instant conversion to clean, typed TSX/JSX components.
* **cURL to Code:** Converts raw cURL commands into production-ready Fetch, Axios, Python Requests, Go, Rust, and PHP.
* **Base64 Encoder / Decoder:** Live encoding/decoding with URL-safe mode, MIME detection, and media preview (Images/PDFs/Audio).
* **Image Converter & Compressor:** Convert between PNG, JPEG, WebP, and AVIF with quality/scale controls via HTML5 Canvas.
* **Markdown ↔ HTML:** Live split-pane editor with GitHub Flavored Markdown (GFM) and table formatting.
* **CSS Units & Fluid `clamp()`:** PX, REM, EM, and VW calculators with fluid responsive typography generator.
* **HTML Entities & Escaper:** Real-time character escaping for HTML, Unicode, JSON, and JavaScript strings.

### 🧰 Developer Utilities & Cryptography
* **SQL Formatter:** Beautify and minify SQL queries for PostgreSQL, MySQL, SQLite, and BigQuery.
* **URL Encoder / Query Parser:** Interactive visual table to inspect and modify query string parameters.
* **Mock Data Generator:** Generates realistic datasets (Users, E-commerce, Transactions) exportable to JSON, CSV, or SQL.
* **JSON Formatter & Tree Validator:** Syntax checker, collapsible interactive node tree, and minifier.
* **Regex Tester:** Live regex engine with syntax highlighting, capture groups, and cheatsheets.
* **JWT Decoder:** Inspect header, payload, expiration timestamp, and signature algorithm locally.
* **Hash Generator:** Client-side MD5, SHA-1, SHA-256, and SHA-512 calculation from plain text or raw files.
* **Password & Token Generator:** High-entropy passwords, API keys, webhook secrets, and cryptographically secure tokens.
* **UUID / ULID Generator:** Instant batch generation of UUID v4, UUID v7, and ULID identifiers.
* **Diff Viewer:** Side-by-side and inline visual text/code comparator with additions/deletions highlighting.
* **Timestamp Converter:** Bidirectional epoch unix timestamp (seconds/ms) to human-readable ISO 8601 and UTC.
* **Color Palette & Harmonies:** Color space converter (HEX, RGB, HSL, Oklch) with WCAG contrast checker.
* **Cron Expression Builder:** Visual schedule builder with plain-English humanizer and upcoming execution previews.
* **CIDR & Subnet Calculator:** IPv4 subnet mask calculation, usable IP ranges, broadcast address, and CIDR breakdown.
* **User-Agent Inspector:** Decodes client User-Agent strings, browser engine, operating system, and bot status.
* **Bcrypt Hash & Verifier:** Generates salted Bcrypt hashes and tests password verification locally.

### ⚡ AI-Powered Developer Assistants
* **AI Error & Stack Trace Explainer:** Translates cryptic tracebacks into root cause analysis and verified fixes.
* **AI Git Commit & PR Generator:** Generates Conventional Commits and rich PR descriptions directly from your `git diff`.
* **AI Database Schema Mapper:** Converts SQL DDL to Prisma Schema, Drizzle ORM, TypeORM, and Zod.
* **AI Unit Test & Mock Generator:** Comprehensive test suite synthesizer with mocks for Vitest, Jest, PyTest, or Go.
* **AI Code Modernizer & Refactor:** Modernizes legacy code to React 19 / ES2024, optimizes Big-O complexity, and migrates JS to TypeScript.
* **AI SQL Generator:** Natural language to optimized SQL queries, joins, and indexing strategies.
* **AI Regex Studio:** Converts plain-English specifications into bulletproof regular expressions.
* **AI OpenAPI & Swagger Generator:** Synthesizes OpenAPI 3.0 specs (YAML/JSON) and Markdown API docs from endpoints.

---

## 💻 Tech Stack

- **Framework:** Next.js 15 (App Router)
- **UI & Reactivity:** React 19, Radix UI, Lucide Icons
- **Language:** TypeScript 5 (Strict Mode)
- **Styling:** Tailwind CSS v4
- **AI Engine:** Google Gemini via @google/genai (gemini-2.5-flash & gemini-2.5-pro)
- **Backend / Auth (Optional):** Supabase (PostgreSQL + RLS + Auth)
- **Notifications:** Sonner
- **Deployment:** Vercel

---

## 🔒 Privacy-First Guarantee

`dev-kit.tech` was built to address privacy concerns with online web utilities:
1. **Zero-Server Processing:** 100% of standard converters and utility computations occur in your browser's V8 engine.
2. **No Data Storage:** We do not save, record, or log any code, JSON, tokens, or text pasted into local tools.
3. **Bring Your Own Key (BYOK):** For AI tools, you can supply your own Google Gemini API key. Calls are authenticated directly without middleware storage.

---

## 🚀 Getting Started Locally

### Prerequisites
- Node.js 20+
- pnpm 9+

### Installation & Setup

1. Clone the repository:
   git clone https://github.com/LucasGabrielGit/pdv-to-json.git
   cd pdv-to-json

2. Install dependencies:
   pnpm install

3. Configure environment variables:
   cp .env.example .env.local
   (Add your GEMINI_API_KEY or configure via the UI with BYOK)

4. Run the development server:
   pnpm dev

Open http://localhost:3000 to view the application.

---

## 📄 License

This project is open-source and licensed under the MIT License.
