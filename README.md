
# Task Management REST API

A REST API built with Node.js, Express.js, and PostgreSQL.

## Features
- User registration and login
- JWT authentication
- Projects CRUD operations
- Tasks CRUD operations
- PostgreSQL JOIN queries
- Task search and filtering
- Pagination and sorting
- Dashboard statistics
- Overdue task tracking

## Technologies
- Node.js
- Express.js
- PostgreSQL
- pg
- bcryptjs
- jsonwebtoken
- Postman

## Installation

1. Clone the repository.
2. Install dependencies:

   npm install

3. Create a PostgreSQL database named task_management.
4. Run the SQL commands to create the users, projects, and tasks tables.
5. Create a .env file using these variables:

   PORT=3000
   DB_USER=postgres
   DB_HOST=localhost
   DB_NAME=task_management
   DB_PASSWORD=your_password
   DB_PORT=5432
   JWT_SECRET=your_secret_key

6. Start the server:

   npm run dev

## API Endpoints

### Authentication
- POST /api/auth/register
- POST /api/auth/login

### Projects
- POST /api/projects
- GET /api/projects
- PUT /api/projects/:id
- DELETE /api/projects/:id

### Tasks
- POST /api/tasks
- GET /api/tasks
- GET /api/tasks/:id
- PUT /api/tasks/:id
- DELETE /api/tasks/:id

### Dashboard
- GET /api/dashboard

## Task Search Examples

- /api/tasks?status=pending
- /api/tasks?search=Express
- /api/tasks?page=1&limit=5
- /api/tasks?sortBy=title&order=asc

## Security
Protected project and task endpoints require a JWT Bearer token.
Never commit your .env file.

## Author
Aqsa Khalid
