# Overview

This is a modern Point of Sale (POS) system for restaurants built as a full-stack web application. The system provides comprehensive restaurant management capabilities including order management, table tracking, menu administration, staff management, and real-time analytics. It features a clean, neumorphic design with a focus on usability for restaurant staff.

The application follows a monorepo structure with a React frontend, Express.js backend, and PostgreSQL database using Drizzle ORM for type-safe database operations.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management and caching
- **UI Framework**: Shadcn/UI components built on Radix UI primitives with Tailwind CSS
- **Design System**: Custom neumorphic design with CSS variables for theming
- **Build Tool**: Vite for fast development and optimized production builds

## Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Design**: RESTful API with JSON responses
- **Database ORM**: Drizzle ORM for type-safe database operations
- **Session Management**: Basic in-memory authentication (production would use proper session stores)
- **Error Handling**: Centralized error handling middleware

## Data Storage
- **Database**: PostgreSQL with Drizzle ORM
- **Schema Management**: Drizzle migrations for version control
- **Connection**: Neon Database serverless PostgreSQL
- **Data Models**: Staff, Menu Categories/Items, Tables, Orders, and Order Items with proper relationships

## Authentication & Authorization
- **Authentication**: Simple username/password login system
- **Session Storage**: localStorage for client-side session persistence
- **Role-based Access**: Staff roles (server, manager, admin, kitchen) defined in database
- **Security**: Basic credential validation (production would implement proper hashing and JWT)

## Key Features & Components
- **Dashboard**: Real-time statistics, active orders overview, and table status
- **Order Management**: Complete order lifecycle from creation to completion
- **Table Management**: Visual table layout with status tracking
- **Menu Management**: Dynamic menu with categories and item management
- **Staff Management**: User account administration
- **Receipt System**: Digital receipt generation and printing capabilities

## Development Environment
- **Hot Reload**: Vite dev server with HMR for fast development
- **Type Checking**: Comprehensive TypeScript configuration
- **Code Quality**: ESLint and Prettier integration
- **Path Aliases**: Organized imports with @ aliases for cleaner code structure

# External Dependencies

## Database & ORM
- **@neondatabase/serverless**: Serverless PostgreSQL database connection
- **drizzle-orm**: Type-safe ORM for database operations
- **drizzle-kit**: Database migration and schema management tools

## UI & Styling
- **@radix-ui/***: Comprehensive set of accessible UI primitives
- **tailwindcss**: Utility-first CSS framework for styling
- **class-variance-authority**: Type-safe variant API for component styling
- **lucide-react**: Modern icon library

## State Management & API
- **@tanstack/react-query**: Server state management and caching
- **react-hook-form**: Form state management and validation
- **@hookform/resolvers**: Form validation resolvers

## Development Tools
- **vite**: Fast build tool and development server
- **typescript**: Static type checking
- **@replit/vite-plugin-runtime-error-modal**: Development error handling
- **@replit/vite-plugin-cartographer**: Replit integration for development

## Utilities & Enhancements
- **date-fns**: Date manipulation and formatting
- **clsx**: Conditional CSS class composition
- **embla-carousel-react**: Carousel component for UI
- **cmdk**: Command palette component
- **zod**: Runtime type validation and schema definition