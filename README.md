# Jovem Nerd - Jornada do Baralho

A digital card collection management system inspired by the Jovem Nerd podcast, allowing users to collect, manage, and track signed cards.

Inspired by https://www.jornadadobaralho.com.br/

## 🎯 Overview

This application provides a gamified experience for collecting digital cards featuring Jovem Nerd personalities. Users can:

- **Collect Cards**: Browse and manage a collection of digital cards
- **Track Signatures**: Mark cards as signed with comments and dates
- **View Rankings**: See leaderboards based on signed card counts
- **Social Features**: Compare collections with other users

## 🛠️ Tech Stack

### Core Framework

- **Next.js 14.2.25** - React framework with App Router
- **React 19** - UI library with hooks and context
- **TypeScript** - Type-safe development

### Backend & Database

- **Prisma** - Type-safe ORM
- **PostgreSQL** - Primary database
- **Redis** - Caching and session storage
- **NextAuth.js** - Authentication with Google OAuth

### UI & Styling

- **Tailwind CSS** - Utility-first CSS framework
- **Radix UI** - Accessible component primitives
- **Lucide React** - Icon library
- **Geist Font** - Typography

### Development Tools

- **Bun** - Package manager and runtime
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Husky** - Git hooks
- **Docker Compose** - Local development environment

### Testing

- **Bun Test** - Testing framework
- **Faker.js** - Test data generation

## 🚀 Getting Started

### Prerequisites

- Bun 1.2.12+
- Docker & Docker Compose

### Installation

1. **Clone and install dependencies**

   ```bash
   git clone <repository>
   cd jornada-do-baralho
   bun install
   ```

2. **Environment setup**

   ```bash
   cp .env.example .env
   # Configure your environment variables
   ```

3. **Run the application**
   ```bash
   bun dev
   ```

### Scripts

- `bun dev` - Start development server
- `bun test` - Run test suite

---

Built with ❤️ for the Jovem Nerd community
