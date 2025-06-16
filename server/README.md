# Server Documentation

This directory contains the backend server code for the LOPANGO application. It's built using Node.js and TypeScript.

## Structure

- **`config/`**: Contains configuration files for the server, database, authentication, etc.
- **`controllers/`**: Houses the controllers that handle incoming requests, process data, and interact with services and models.
- **`middleware/`**: Contains Express middleware for various tasks like authentication, input validation, and error handling.
- **`migrations/`**: Database migration files managed by Sequelize.
- **`models/`**: Sequelize models defining the database schema and relationships.
- **`routes/`**: Defines the API routes and maps them to controller actions.
- **`scripts/`**: Utility scripts for tasks like database initialization or synchronization.
- **`src/`**: Main source code for the application, including `app.ts` (Express app setup) and `index.ts` (server entry point).
- **`types/`**: TypeScript type definitions and interfaces.
- **`utils/`**: Utility functions, helper classes, and enums.
- **`validators/`**: Validation schemas and functions, often used with `express-validator`.
- **`tsconfig.json`**: TypeScript configuration file for the server project.

## Prerequisites

- Node.js (version specified in project's `.nvmrc` or `package.json`, e.g., v18+)
- npm or yarn

## Installation

1. Navigate to the root of the project.
2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

## Running the Server

### Development Mode

To run the server in development mode with automatic reloading on file changes (usually via `ts-node-dev` or similar):

```bash
npm run dev:server
# or yarn dev:server
# (Note: Adjust script name based on actual package.json)
```

If a specific `dev:server` script doesn't exist in the root `package.json`, you might need to navigate to the `server` directory or use a command like:
```bash
cd server
npm run dev
# or npx ts-node-dev src/index.ts
# (assuming ts-node-dev and server-specific scripts are configured)
```

### Production Build & Run

1.  **Build the TypeScript code:**
    Navigate to the `server` directory (if not already there) or ensure your build script handles it from the root.
    ```bash
    # From root (if package.json script is configured for it)
    npm run build:server
    # Or from server directory
    # cd server
    # npm run build
    # (This typically executes `tsc -p .` or `tsc -p tsconfig.json`)
    ```
    This will compile the TypeScript code into JavaScript, usually in a `dist` directory within the `server` folder.

2.  **Run the compiled code:**
    ```bash
    # From root (if package.json script is configured for it)
    npm run start:server
    # Or from server directory
    # cd server
    # npm start
    # (This typically executes `node dist/index.js`)
    ```

*(Please adapt the `npm run ...` commands above based on the actual scripts defined in your project's `package.json` files.)*

## Path Aliases

This server project uses TypeScript path aliases defined in `server/tsconfig.json` to simplify module imports. For example:

- `@/controllers/*` maps to `server/controllers/*`
- `@/middleware/*` maps to `server/middleware/*`
- etc.

These aliases help in avoiding long relative paths (e.g., `../../utils/someUtil`).

### IDE Integration for Path Aliases

Previously, there might have been issues with IDEs (like VS Code) not correctly recognizing these path aliases when the project was opened from the root directory. This was because the root `tsconfig.json` did not explicitly reference the `server/tsconfig.json` project.

This has been **fixed** by:
1.  Adding a project reference for `server/tsconfig.json` to the root `tsconfig.json`.
2.  Ensuring `server/tsconfig.json` has `composite: true` in its `compilerOptions`.

This change allows the TypeScript Language Service to correctly load the server's configuration and resolve path aliases, leading to a smoother development experience (e.g., correct auto-imports, go-to-definition).

## Database

The server uses Sequelize ORM to interact with the database.
- Migrations are located in `server/migrations/`.
- Models are in `server/models/`.
- Database configuration is in `server/config/database.ts` (or `.js`) and `config/config.json`.

Ensure your database is set up and the connection details in the configuration files are correct. To run migrations:
```bash
# Typically from the server directory or via a root package.json script
npx sequelize-cli db:migrate
```

## Linting and Formatting

This project should be configured with ESLint for linting and Prettier for code formatting.
```bash
# To lint (from root or server, depending on setup)
npm run lint
# To format (from root or server, depending on setup)
npm run format
```
