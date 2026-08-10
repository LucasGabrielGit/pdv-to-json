# ⚡ dev-kit.tech

> **Free, High-Performance & 100% Private Developer Tools Platform.**
> Built with **Next.js 15 (App Router)**, **React 19**, **TypeScript**, and **Tailwind CSS v4**. All processing runs 100% client-side inside your browser — zero data ever leaves your device.

🔗 **Live Platform:** [dev-kit.tech](https://dev-kit.tech) (also hosted on Vercel)

---

## 🛠️ Active Tools

| Tool | Status | Key Features |
|---|---|---|
| 🔄 **JSON ↔ CSV** | ✅ Active | Bidirectional conversion, nested object flattening (`address.city`), and smart type casting. |
| 📜 **JSON ↔ YAML** | ✅ Active | Bidirectional JSON ↔ YAML, 2 or 4 space indentation, and key alphabetization. |
| 🔑 **Base64 Encoder / Decoder** | ✅ Active | Real-time conversion, URL-safe mode, automatic MIME & magic byte detection, HTML `<img src="...">` & CSS `url(...)` Data URI extraction, and live previews for Images, PDFs, and Audio. |
| 🖼️ **Image Converter** | ✅ Active | PNG ↔ JPEG ↔ WebP 100% client-side HTML5 Canvas conversion, compression quality slider (10–100%), resolution scaling (25–100%), and file size savings calculation. |
| 🛠️ **Regex Tester** | ⏳ Coming Soon | Live regular expression tester with regex syntax highlighting & cheat sheet. |
| 🔓 **JWT Decoder** | ⏳ Coming Soon | Instant JWT payload & header decoder with token expiration checking. |

---

## 🖥️ Tech Stack

- **[Next.js 15 (App Router)](https://nextjs.org/)** — React framework with file-based routing and static generation
- **[React 19](https://react.dev/)** + **TypeScript** — UI library and strict type safety
- **[Tailwind CSS v4](https://tailwindcss.com/)** — Utility-first CSS framework with modern CSS variables
- **[shadcn/ui](https://ui.shadcn.com/)** — Accessible UI primitives
- **[js-yaml](https://github.com/nodeca/js-yaml)** — Client-side YAML parser & dumper
- **[Sonner](https://sonner.emilkowal.ski/)** — Smooth toast notification system
- **[Lucide React](https://lucide.dev/)** — Icon library
- **[Vercel](https://vercel.com/)** — Zero-config deployment & edge network

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v20+
- [pnpm](https://pnpm.io/) v9+

### Installation

```bash
git clone https://github.com/LucasGabrielGit/pdv-to-json.git
cd pdv-to-json
pnpm install
```

### Run Locally

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
pnpm build
```

---

## 📁 Project Structure

```
src/
├── app/                        # Next.js App Router
│   ├── layout.tsx              # Root layout shell & SEO metadata
│   ├── page.tsx                # Platform homepage with tool grid
│   └── tools/                  # Dedicated tool page routes
│       ├── json-csv/
│       ├── json-yaml/
│       ├── base64/
│       └── image-converter/
├── components/
│   ├── converter/              # Shared tool headers & privacy banner
│   ├── layout/                 # Sidebar, Header, Footer, AppShell
│   ├── tools/                  # Individual interactive tool components
│   │   ├── JsonYamlConverter.tsx
│   │   ├── Base64Converter.tsx
│   │   └── ImageConverter.tsx
│   ├── ui/                     # shadcn/ui components
│   ├── AdSense.tsx             # Google AdSense ad unit component
│   └── FileDropZone.tsx        # Universal drag & drop file uploader
├── lib/
│   ├── tools-registry.ts       # Central tool registry (sidebar & grid)
│   └── utils.ts                # Tailwind class merger (cn)
└── utils/                      # Core conversion engines
    ├── jsonToCsv.ts
    ├── csvToJson.ts
    ├── yamlConverter.ts
    ├── base64Converter.ts
    └── imageConverter.ts
```

---

## 🔒 Privacy & Security

`dev-kit.tech` is built with a strict **Privacy-First Architecture**:
- All conversions, file reads, image processing, and encoding run **100% locally in your browser memory**.
- **No data is transmitted to external servers**.
- Safe for processing sensitive credentials, private JSON configs, images, and API keys.

---

## 📄 License

MIT — feel free to use, modify, and distribute.
