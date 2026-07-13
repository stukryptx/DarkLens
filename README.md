<p align="center">
  <img src="frontend/public/darklens-banner.png" alt="DarkLens OSINT Hub" width="100%" />
</p>

<p align="center">
  <strong>An enterprise-grade, high-fidelity threat intelligence and reconnaissance platform.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/Playwright-45ba4b?style=for-the-badge&logo=Playwright&logoColor=white" alt="Playwright" />
  <img src="https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB" />
  <img src="https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge" alt="License" />
</p>

---

## 📖 Overview

**DarkLens** is a centralized intelligence hub designed for security researchers and OSINT analysts. It solves the friction of managing dozens of isolated sock-puppet accounts across various threat actor forums, Telegram channels, and dark web portals. 

By maintaining persistent, authenticated access via injected session cookies and local storage directly into a sandboxed Chromium instance, DarkLens enables instant, seamless access to gated intelligence sources without the need for repeated logins.

## ✨ Core Capabilities

### 🔐 Frictionless Authentication (Playwright + Chromium)
Launch an authenticated browsing session instantly. The platform serializes and securely stores your session state, injecting it directly into a sandboxed browser environment on demand. 

### 🎯 In-Browser Capture HUD
DarkLens injects a discreet, context-aware Floating Action Button (FAB) directly into your research sessions. 
- **Context Capture:** Instantly grab full-page screenshots and target metadata without leaving the browser.
- **Session Sync:** Update and save your authentication state back to the database directly from the HUD.

### 📝 Intelligence Scratchpad
A robust threat intelligence note-taking system built with rich Markdown support. Write full documentation, track target IOCs, clamp long-form text, and organize identities using a beautifully crafted glassmorphism interface.

### 📡 Infrastructure & Telemetry Monitoring
A background polling engine runs cron jobs to constantly track the infrastructure (A, NS, MX, TXT records) of all monitored targets. Shifts in proxies, DDoS protection, or backend hosting are logged historically to expose hidden infrastructure.

### ✈️ Native Telegram MTProto Integration
Connect directly to the Telegram network using MTProto (GramJS). Bypass fragile scraping blocks and pull live intelligence, media, and messages from private groups and channels seamlessly.

### 🧅 Tor Network (Onion) Routing
Targets can be configured with dual URLs (Surface and Onion). The launcher automatically detects `.onion` addresses and routes traffic through a local Tor proxy (`127.0.0.1:9050`) while retaining the speed and translation features of standard Chromium.

---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed on your system before proceeding:
- **Node.js** (v18 or higher)
- **MongoDB** (Local instance or MongoDB Atlas)
- **Tor Service** (Running locally on port `9050` for `.onion` access)
- **Google Chrome / Chromium** (Installed locally for Playwright functionality)

### Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/stukryptx/DarkLens.git
   cd DarkLens
   ```

2. **Configure the Environment:**
   Copy the example environment file and configure it with your database credentials.
   ```bash
   cp .env.example .env
   ```

3. **Install Dependencies & Launch:**
   We have provided a unified startup script that will automatically install all NPM dependencies for both the frontend and backend, and start the development servers concurrently.
   ```bash
   chmod +x start.sh
   ./start.sh
   ```

4. **Access the Dashboard:**
   Navigate your browser to `http://localhost:5173` to access the Command Center.

---

## 🏗️ Technical Architecture

| Layer | Technologies Used |
| :--- | :--- |
| **Frontend** | React, Vite, React Router, Lucide Icons, Glassmorphism UI |
| **Backend** | Node.js, Express.js, MongoDB (Mongoose) |
| **Browser Engine** | Playwright (Chromium orchestration, context injection) |
| **Integrations** | GramJS (Telegram MTProto), Node-Cron, DNS Resolve |

---

## ⚠️ Disclaimer

> [!WARNING]
> **Strictly for Authorized Research**
> DarkLens is built exclusively for authorized security research, Open Source Intelligence (OSINT) gathering, and threat intelligence analysis by cybersecurity professionals. Any usage for malicious purposes, unauthorized access, or illegal activities is strictly prohibited. The developers assume no liability for misuse.
