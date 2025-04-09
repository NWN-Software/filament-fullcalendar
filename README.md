# Filament FullCalendar

[![Latest Version on Packagist](https://img.shields.io/packagist/v/saade/filament-fullcalendar.svg?style=flat-square)](https://packagist.org/packages/saade/filament-fullcalendar)


## Original Documentation
[Filament Fullcalendar](https://github.com/saade/filament-fullcalendar)

# Modify Package

# Prerequisites for Filament FullCalendar Package

## Required Tools and Packages

- Node.js
- npm
- npx (comes with npm)
- npm-run-all
- TailwindCSS
- PostCSS

## Setup Instructions

1. Install Node.js and npm (if not already installed)

2. Run the following command to install all required dependencies:
   ```bash
   npm install
   ```

## Development and Build Scripts

The Filament FullCalendar package includes several scripts to help you develop and build the package efficiently. These scripts handle CSS processing with Tailwind, JavaScript compilation, and optimization for production use.

### Available Scripts

- **Development Scripts**
  - `npm run dev` - Runs all development scripts in parallel
  - `npm run dev:styles` - Watches and compiles CSS using Tailwind with PostCSS
  - `npm run dev:scripts` - Builds JavaScript in development mode

- **Build Scripts**
  - `npm run build` - Runs all build scripts sequentially
  - `npm run build:styles` - Compiles and minifies CSS with Tailwind and PostCSS
  - `npm run build:scripts` - Builds JavaScript for production
  - `npm run purge` - Runs the Filament purge tool to optimize CSS for Filament v3.x

### Usage

During development, you can use `npm run dev` to start watching for changes in both CSS and JavaScript files. For production builds, use `npm run build` to generate optimized assets.

The package uses Tailwind CSS for styling and includes specific optimizations for compatibility with Filament v3.x through the purge process.