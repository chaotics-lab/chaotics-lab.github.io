# Chaotics Lab Portfolio

A modern, interactive portfolio website showcasing projects from the Chaotics Lab community. Built with React, TypeScript, and Tailwind CSS.

## 🌟 Features

- **Project Showcase**: Browse a curated collection of projects with detailed descriptions, technologies, and links
- **Interactive UI**: Smooth animations and responsive design built with Shadcn/UI components
- **Dark Mode Support**: Theme switching capability using Next.js themes
- **Category Filtering**: Filter projects by categories (GUI, Backend, AI, Robotics, Embedded Systems, etc.)
- **Search Functionality**: Find projects quickly using integrated search
- **Responsive Design**: Fully responsive layout optimized for mobile, tablet, and desktop
- **Markdown Support**: Project descriptions support rich markdown formatting
- **Form Handling**: Built-in form validation and submission with React Hook Form

## 🚀 Quick Start

### Prerequisites

- Node.js (v18+)
- Bun package manager (or npm/yarn)

### Installation

```bash
# Install dependencies
bun install

# Start development server
bun run dev
```

The application will be available at `http://localhost:8080`

### Build for Production

```bash
# Build the project
bun run build

# Preview production build locally
bun run preview
```

### Development Commands

```bash
# Run development server with hot reload
bun run dev

# Build for development environment
bun run build:dev

# Lint code
bun run lint
```

## 📁 Project Structure

```
src/
├── components/
│   ├── portfolio/           # Portfolio-specific components
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   ├── SoftwareCard.tsx
│   │   ├── SoftwareGrid.tsx
│   │   └── SoftwarePage.tsx
│   ├── ui/                 # Shadcn/UI components library
│   └── Starfield.tsx       # Animated starfield background
├── pages/
│   ├── Index.tsx           # Home page
│   └── NotFound.tsx        # 404 page
├── hooks/                  # Custom React hooks
├── lib/                    # Utility functions
│   ├── parseMarkdown.ts
│   └── utils.ts
├── resources/
│   └── projects/           # Project metadata (JSON files)
├── styles/                 # Global styles
└── App.tsx                # Main app component
```

## 🛠️ Tech Stack

- **Framework**: React 18.3
- **Language**: TypeScript 5.8
- **Build Tool**: Vite 5.4
- **Styling**: Tailwind CSS 3.4
- **Components**: Shadcn/UI (Radix UI primitives)
- **Forms**: React Hook Form with Zod validation
- **Routing**: React Router v6
- **State Management**: TanStack React Query
- **Markdown**: React Markdown with GFM support
- **Charts**: Recharts
- **Icons**: Lucide React
- **Animations**: Tailwind CSS Animate

## 📦 Available Projects

The portfolio showcases 14+ projects including:

- **8-bit Calculator (FPGA)** - Hardware project
- **Ace Attorney Guide** - Interactive guide
- **Air Traffic Simulation** - Simulation software
- **Autonomous Racing Car** - AI & Robotics
- **Autonomous Robot Competition** - Competition entry
- **Cluedo Knight** - Game project
- **EceCopter (Remote-Controlled Drone)** - Embedded systems
- **Fintech App Development** - Financial technology
- **Game Logo Generator** - Generative tool
- **Le Saboteur (French Board Game)** - Game adaptation
- **PersonaPlay (Netflix Clone)** - Fullstack application
- **PoryPal** - Educational tool
- **Power Consumption Measurement Board** - Hardware
- **YouTube Video Tracker** - Web application

## 🎨 Customization

### Adding New Projects

1. Create a new JSON file in `src/resources/projects/`
2. Follow the project metadata structure:

```json
{
  "title": "Project Name",
  "date": "YYYY-MM-DD",
  "titleColor": "#FFFFFF",
  "description": "Project description",
  "imageUrl": "/img/project-folder",
  "logoUrl": "/img/project-folder/logo.png",
  "themeColor": "#000000",
  "logoBackgroundColor": "#FFFFFF",
  "category": ["category1", "category2"],
  "tags": ["Tech1", "Tech2"],
  "githubUrl": "https://github.com/...",
  "demoUrl": "https://demo.url"
}
```

3. Add project images to `public/img/`

### Theme Configuration

Customize Tailwind CSS in `tailwind.config.ts` and use dark mode support via the theme provider.

## 🔧 Configuration Files

- `vite.config.ts` - Vite build configuration
- `tailwind.config.ts` - Tailwind CSS customization
- `tsconfig.json` - TypeScript configuration
- `eslint.config.js` - Code linting rules
- `postcss.config.js` - PostCSS configuration
- `components.json` - Shadcn/UI configuration

## 📝 Scripts

Located in `src/scripts/`:
- `genIndex.js` - Generate project index
- `mdToOneLiner.py` - Convert markdown to single line format
- `test.md` - Test markdown file

## 🌐 Deployment

This project is designed to be deployed as a GitHub Pages site (username/org page).