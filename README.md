# Frontend Project

A modern React + TypeScript frontend built with Vite, Tailwind CSS, and Radix UI components.

## Tech Stack

- **React 18+** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Radix UI** - Component library
- **React Router** - Routing

## Getting Started

### Prerequisites

- Node.js (v18+)
- npm or yarn

### Installation

1. Clone the repository

```bash
git clone <your-repo-url>
cd front-end
```

2. Install dependencies

```bash
npm install
```

3. Create environment variables file

```bash
cp .env.example .env.local
```

4. Start development server

```bash
npm run dev
```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## Project Structure

```
app/
├── components/      # React components
│   ├── figma/      # Figma-related components
│   ├── layout/     # Layout components
│   ├── posts/      # Post-related components
│   ├── shared/     # Shared components
│   ├── toasts/     # Toast notifications
│   └── ui/         # UI primitives
├── pages/          # Page components
├── store/          # Context/state management
└── routes.tsx      # Route definitions
```

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License

See ATTRIBUTIONS.md for attribution information.
