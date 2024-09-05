# Electron Background and Theme Customizer

This is an Electron application built with React and TypeScript. It allows users to customize the UI by selecting themes, background colors, CSS animations, and video or image backgrounds. The user's preferences are persistent and saved between sessions using Electron's IPC and context management.

## Features

- **Background Customization:**
  - Upload custom images or videos to set as background.
  - Choose from predefined CSS animations, videos, or images.
  - Support for video backgrounds using local or blob URLs for optimized memory usage.
  
- **Theme Customization:**
  - Customize primary, secondary, accent, and text colors.
  - Predefined themes available for quick selection.
  
- **Persistence:**
  - User's customizations (theme, background) are saved and persisted between app restarts.

- **Electron IPC:**
  - Background and theme settings are managed using Electron's IPC communication, allowing data to be shared between the main and renderer processes.

## Project Structure

- `src/`: Main source folder containing the Electron app.
  - `components/`: Contains all React components such as `Menu`, `BackgroundSelector`, `ThemePicker`.
  - `hooks/`: Contains custom React hooks including `useAppContext` for managing global state.
  - `data/`: Contains predefined background themes and options.
  - `assets/`: Media assets (images, videos) that are used in the project.
  
- `main.ts`: Main process code that manages the Electron lifecycle and window creation.
- `preload.ts`: Preloads the IPC bridge for secure communication between Electron's renderer and main process.

## Installation and Setup

### Prerequisites

Ensure you have the following installed:

- [Node.js](https://nodejs.org/) (v14+)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

### Installation

1. Clone the repository:
    ```bash
    git clone <repository-url>
    cd <project-directory>
    ```

2. Install dependencies:
    ```bash
    npm install
    ```

3. Start the development environment:
    ```bash
    npm run dev
    ```

   This command starts both the Electron and React development servers.

### Build for Production

To build the application for production:

```bash
npm run build
npm run electron:build
```

## Available Commands

- `npm run dev`: Start the application in development mode with hot-reload.
- `npm run build`: Build the React application for production.
- `npm run electron:build`: Build the Electron application for production.
- `npm run lint`: Lint the project using ESLint.

## Usage

Upon launching the application, you can:

### Select a Background:

- Choose from predefined backgrounds (CSS animations, videos, or images).
- Upload custom images or videos as the background.

### Customize Theme:

- Change primary, secondary, accent, and text colors.
- Choose from predefined color themes.

All changes are saved automatically, and the app will remember your settings the next time you open it.
