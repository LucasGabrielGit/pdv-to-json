# JSON ↔ CSV Converter

> A fast, elegant, bidirectional converter between JSON and CSV — running entirely in your browser. No data ever leaves your machine.

🔗 **Live demo:** [json-to-csv-umber.vercel.app](https://json-to-csv-umber.vercel.app)

---

## ✨ Features

| Feature | Details |
|---|---|
| 🔄 **Bidirectional** | Convert JSON → CSV **and** CSV → JSON with a single toggle |
| 🗂️ **Nested objects** | JSON nested objects are flattened with dot-notation (`address.city`) and re-expanded on the way back |
| 🔢 **Type casting** | CSV → JSON automatically detects numbers, booleans and nulls |
| 📁 **File & text input** | Drag-and-drop file upload or paste text directly |
| 🔧 **Custom delimiter** | Comma, semicolon, tab or pipe |
| 📋 **Copy & download** | One-click copy to clipboard or download the output file |
| 🔒 **100% client-side** | All processing happens in the browser — zero server calls |
| 🔔 **Rich feedback** | Sonner toast notifications for every action |

---

## 🖥️ Tech Stack

- **[Vite](https://vitejs.dev/)** — lightning-fast dev server and build tool
- **[React 19](https://react.dev/)** + **TypeScript** — UI and type safety
- **[Tailwind CSS v4](https://tailwindcss.com/)** — utility-first styling
- **[shadcn/ui](https://ui.shadcn.com/)** (base-nova style) — accessible component primitives
- **[@base-ui/react](https://base-ui.com/)** — headless UI primitives used by shadcn
- **[Sonner](https://sonner.emilkowal.ski/)** — toast notification system
- **[Lucide React](https://lucide.dev/)** — icon library
- **[Vercel](https://vercel.com/)** — deployment

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v20+
- [pnpm](https://pnpm.io/) v8+

### Install

```bash
git clone https://github.com/your-username/json-to-csv.git
cd json-to-csv
pnpm install
```

### Run locally

```bash
pnpm dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build for production

```bash
pnpm build
```

The output is placed in the `dist/` directory.

---

## 📁 Project Structure

```
src/
├── components/
│   ├── ui/             # shadcn/ui component library (auto-generated)
│   ├── AdSense.tsx     # Google AdSense ad unit component
│   ├── Converter.tsx   # Main converter UI
│   ├── FileDropZone.tsx# Drag-and-drop file upload
│   └── StatsBar.tsx    # Conversion stats (rows, columns, headers)
├── config/
│   └── ads.ts          # AdSense publisher ID & slot IDs
├── lib/
│   └── utils.ts        # Tailwind class merge utility (cn)
├── utils/
│   ├── jsonToCsv.ts    # JSON → CSV conversion logic
│   └── csvToJson.ts    # CSV → JSON conversion logic
├── App.tsx
├── main.tsx
└── index.css           # Global styles + shadcn/ui design tokens
```

---

## 🔄 How conversion works

### JSON → CSV

1. Parses the JSON input (array of objects or a single object)
2. Flattens nested objects using dot-notation keys (`address.city`)
3. Collects the union of all keys across rows as headers
4. Builds CSV lines, escaping cells that contain commas, newlines or quotes

### CSV → JSON

1. Splits rows correctly, respecting quoted multi-line fields
2. Parses each row's cells against the header row
3. Optionally casts values to native types (numbers, booleans, `null`)
4. Optionally expands dot-notation headers back into nested objects

---

## 💰 AdSense

Ad configuration lives in [`src/config/ads.ts`](src/config/ads.ts):

```ts
export const ADS_CONFIG = {
  PUBLISHER_ID: 'ca-pub-XXXXXXXXXXXXXXXX', // ← your AdSense publisher ID
  slots: {
    betweenIO: 'XXXXXXXXXX',               // ← ad unit slot ID
  },
  enabled: true, // set to false to disable during development
}
```

> **Note:** AdSense will not load on `localhost`. Deploy to a verified domain first.

---

## 🌐 Deploy to Vercel

The project includes a [`vercel.json`](vercel.json) for zero-config deploys.

```bash
# First time (login + create project)
vercel deploy --prod

# Subsequent deploys
vercel deploy --prod
```

Or connect the GitHub repository in the [Vercel dashboard](https://vercel.com) for automatic deploys on every push.

---

## 📄 License

MIT — feel free to use, modify and distribute.
