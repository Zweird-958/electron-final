# Caisse Epicerie

Desktop point-of-sale (POS) application for a grocery store, built with Electron, React, and SQLite.

## Prerequisites

- [Node.js](https://nodejs.org/) (v22+)
- npm

## Getting started

```bash
# Install dependencies
npm install

# Start the app in development mode (hot-reload)
npm run dev
```

## Building for production

```bash
npm run build
```

This runs TypeScript compilation, Vite bundling, and electron-builder packaging in sequence. Installers are output to `release/<version>/`:

| Platform | Format        | Artifact                                      |
| -------- | ------------- | --------------------------------------------- |
| macOS    | `.dmg`        | `Caisse Epicerie-Mac-<version>-Installer.dmg` |
| Windows  | `.exe` (NSIS) | `Caisse Epicerie-Windows-<version>-Setup.exe` |
| Linux    | `.AppImage`   | `Caisse Epicerie-Linux-<version>.AppImage`    |

## macOS — unsigned app

The app is not notarized with Apple. macOS will block it on first launch. To fix this, run:

```bash
xattr -cr /Applications/Caisse\ Epicerie.app
```

Or right-click the app and select **Open** to bypass Gatekeeper.

## Other scripts

| Command           | Description                                       |
| ----------------- | ------------------------------------------------- |
| `npm run lint`    | Run ESLint on `.ts` and `.tsx` files              |
| `npm run knip`    | Detect unused exports, files, and dependencies    |
| `npm run preview` | Preview the Vite production build (renderer only) |

## Project structure

```
├── electron/                 # Main process (Electron / Node)
│   ├── main.ts               # App entry, window creation
│   ├── preload.ts            # Context-bridge (renderer ↔ main)
│   ├── channels/             # IPC channel name constants
│   ├── ipc/                  # IPC handlers (one file per domain)
│   ├── repositories/         # SQL queries (better-sqlite3)
│   ├── services/             # Business logic, external APIs
│   │   ├── db.ts             # Database init & migrations
│   │   ├── products.service.ts
│   │   ├── sales.service.ts
│   │   ├── dashboard.service.ts
│   │   ├── export.service.ts       # CSV & PDF export
│   │   ├── import.service.ts       # CSV import
│   │   ├── receipt.service.ts      # Receipt print & download
│   │   ├── openfoodfacts.service.ts # Barcode lookup API
│   │   ├── settings.service.ts
│   │   └── logger.ts
│   └── constants/
├── src/                      # Renderer process (React)
│   ├── App.tsx               # Router & theme init
│   ├── main.tsx              # React entry
│   ├── pages/                # Route-level components
│   ├── components/           # Shared & domain components
│   │   ├── ui/               # shadcn/ui primitives
│   │   ├── layout/           # App shell, sidebar
│   │   ├── pos/              # POS-specific (cart, product search)
│   │   ├── products/         # Product table, form dialog
│   │   ├── sales/            # Sale detail, summary cards
│   │   ├── dashboard/        # Stat cards, top products, recent sales
│   │   └── settings/         # Updater card
│   ├── hooks/                # React hooks (use-cart, use-products, …)
│   ├── lib/                  # api.ts (IPC wrapper), utils
│   ├── types/                # TypeScript type definitions
│   └── i18n/                 # i18next config & locale files (fr, en)
├── electron-builder.json5    # Packaging config
├── vite.config.ts            # Vite + Electron plugin config
└── package.json
```

## Tech stack

| Layer       | Technology                              |
| ----------- | --------------------------------------- |
| Framework   | Electron 30                             |
| Renderer    | React 19, React Router, Vite            |
| Styling     | Tailwind CSS 4, shadcn/ui, Lucide icons |
| Database    | SQLite via better-sqlite3 (WAL mode)    |
| Forms       | react-hook-form + Zod validation        |
| i18n        | i18next (French & English)              |
| State       | React hooks (no external state library) |
| Auto-update | electron-updater                        |

## Database

SQLite database stored at `<userData>/caisse.db`. Migrations run automatically on startup (versioned with `PRAGMA user_version`).

**Tables:**

- `products` — catalog (barcode, name, brand, price, stock, category, image URL)
- `sales` — sale header (total, items count, timestamp)
- `sale_items` — sale lines (product reference, quantity, unit price)

## Pages & features

### POS (`/`)

The main cash register view. Search or scan products, add them to a cart, adjust quantities, and check out. Completing a sale decrements stock and shows a system notification.

### Dashboard (`/dashboard`)

Overview of today's activity: revenue, number of sales, and items sold — with a comparison to yesterday. Displays a top-products table and a list of recent sales (click to view details).

### Products (`/products`)

Full CRUD on the product catalog. Features include:

- **Search** — filter products by name in real time
- **Barcode lookup** — enter a barcode and fetch product info from OpenFoodFacts to pre-fill the form
- **CSV import** — bulk-add products from a CSV file (auto-detects column names and `;`/`,` separators)
- **Stock tracking** — low-stock and out-of-stock badges

### Sales (`/sales`)

Browse all recorded sales with date filtering (today / all / specific date). Each sale can be expanded to view the full ticket. Daily summary cards show revenue, count, and top products.

- **Export CSV** — semicolon-separated file of all filtered sales
- **Export PDF** — formatted report with ticket details
- **Print / download receipt** — per-sale receipt as PDF

### Settings (`/settings`)

- **Language** — switch between French and English
- **Theme** — light, dark, or system
- **Updates** — check for updates, download, and restart to install (via electron-updater)

## CSV import

Products can be bulk-imported from a CSV file via **Products > Import CSV**. The importer auto-detects `;` or `,` as the separator and matches columns by header name (case-insensitive).

**Required columns:**

| Header (accepted names)                  | Description  |
| ---------------------------------------- | ------------ |
| `name`, `nom`, `product_name`, `produit` | Product name |
| `price`, `prix`, `unit_price`            | Unit price   |

**Optional columns:**

| Header (accepted names)                 | Description      |
| --------------------------------------- | ---------------- |
| `barcode`, `code_barres`, `ean`, `code` | Barcode (unique) |
| `brand`, `marque`, `brands`             | Brand            |
| `stock`, `quantity`, `quantite`         | Initial stock    |
| `category`, `categorie`, `categories`   | Category         |

An example file is included at [`data/exemple-import.csv`](data/exemple-import.csv) with 40 typical grocery products ready to import.

**Example file:**

```csv
name;price;barcode;brand;stock;category
Nutella 400g;3.50;3017620422003;Ferrero;25;Pâte à tartiner
Evian 1.5L;0.85;3068320114064;Evian;48;Eau
Baguette tradition;1.20;;;;Boulangerie
```

Lines with a missing name, invalid price, or duplicate barcode are skipped and reported at the end of the import.

## Internationalization

The app supports French (`fr`) and English (`en`). Locale files are in `src/i18n/locales/`. The selected language is persisted in electron-store and applied on startup.
