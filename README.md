# Hostito App

> The official frontend for [Hostito](https://github.com/webito-io/hostito-core) — open source hosting billing & management system.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](./CONTRIBUTING.md)
[![Made by Webito](https://img.shields.io/badge/made%20by-Webito-black)](https://webito.io)

---

## What is Hostito App?

Hostito App is the frontend interface for the Hostito billing system. It provides both a **client portal** and an **admin panel** for managing hosting services, invoices, domains, and support tickets.

Built with Next.js, React 19, TypeScript, and Tailwind CSS.

---

## Features

- Authentication — login, register, forgot password, email verification
- Client Portal — view invoices, manage services, open support tickets
- Shop — browse products, add to cart, checkout
- Payment Flow — Stripe, PayPal, and crypto payment support
- Admin Panel — manage users, products, orders, servers, and gateways
- Support Tickets — built-in helpdesk interface
- Dark mode

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 |
| UI | React 19, Tailwind CSS 4 |
| Language | TypeScript 5 |
| State | Zustand |
| API Client | TBD |

---

## Getting Started

```bash
# Clone the repo
git clone https://github.com/webito-io/hostito-app.git
cd hostito-app

# Install dependencies
pnpm install

# Setup environment
cp .env.example .env.local

# Start development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

> **Note:** This app requires [hostito-core](https://github.com/webito-io/hostito-core) to be running as the backend API.

---

## Environment Variables

Set these in your `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

---

## Project Structure

```
hostito-app/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   └── register/
│   ├── (client)/
│   │   ├── dashboard/
│   │   ├── services/
│   │   ├── invoices/
│   │   ├── domains/
│   │   ├── tickets/
│   │   └── shop/
│   └── (admin)/
│       ├── dashboard/
│       ├── users/
│       ├── products/
│       ├── orders/
│       ├── servers/
│       └── gateways/
├── components/
├── lib/
└── public/
```

---

## Roadmap

- [ ] Authentication (login, register, forgot password)
- [ ] Client dashboard
- [ ] Shop & checkout flow
- [ ] Invoice management
- [ ] Support tickets
- [ ] Admin panel
- [ ] Domain management
- [ ] Dark mode
- [ ] Multi-language support

---

## Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](./CONTRIBUTING.md) before submitting a PR.

---

## Related

- [hostito-core](https://github.com/webito-io/hostito-core) — the backend API

---

## Sponsorship

Hostito is part of the Webito open source ecosystem. If you find it useful, consider [sponsoring us](https://github.com/sponsors/webito-io).

---

## License

MIT — free to use, modify, and distribute.