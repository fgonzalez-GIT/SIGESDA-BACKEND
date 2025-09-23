# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- **Start development server**: `npm run dev` (uses nodemon for auto-restart)
- **Start production server**: `npm start`
- **Install dependencies**: `npm install`

## Project Architecture

This is a Node.js/Express backend API for the SIGESDA system that provides a notes management service with MongoDB integration.

### Core Structure

- **Main entry point**: `index.js` - Contains all API routes and server configuration
- **Database**: MongoDB Atlas connection via both native MongoDB driver and Mongoose
- **API endpoints**:
  - `GET /api/notes` - Retrieve all notes (in-memory array)
  - `GET /api/notes/:id` - Retrieve specific note by ID
  - `DELETE /api/notes/:id` - Delete note by ID
  - `GET /api/mongo` - Test MongoDB connection
  - `GET /api/mongo/:content` - Create new note in MongoDB

### Key Dependencies

- **Express**: Web framework
- **MongoDB/Mongoose**: Database connectivity (dual implementation)
- **CORS**: Cross-origin resource sharing
- **dotenv**: Environment variables (configured but not actively used)

### Database Configuration

The project uses MongoDB Atlas with hardcoded connection strings in two formats:
- Native MongoDB driver connection in `/api/mongo` endpoint
- Mongoose connection in `/api/mongo/:content` endpoint

### Testing

- **REST client files**: Located in `requests/` directory for API testing
- **No automated tests configured** (package.json shows placeholder test command)

### Development Notes

- Server runs on PORT 3001 by default
- Uses both in-memory data storage (notes array) and MongoDB persistence
- CORS is enabled for cross-origin requests
- No environment variable loading is currently active despite dotenv dependency