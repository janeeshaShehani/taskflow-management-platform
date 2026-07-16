# 🚀 TaskFlow - Project & Team Task Management Platform

A full-stack Project and Team Task Management Platform built with **Next.js, Node.js, Express, Prisma, and PostgreSQL**. The system allows administrators, project managers, and team members to collaborate efficiently through role-based access control, project management, task assignment, notifications, and activity tracking.

---

## 📖 Project Overview

TaskFlow is designed to simplify project and task management by providing a centralized platform for administrators, project managers, and team members.

The system includes:

- Secure Authentication
- Role-Based Access Control (RBAC)
- Project Management
- Project Member Management
- Task Management
- Notifications
- Activity Logs
- Responsive Dashboard

---
# 👥 User Roles

### Administrator

- Manage users
- Manage projects
- Manage project members
- View dashboard
- Monitor activities

### Project Manager

- Manage assigned projects
- Add project members
- Create and assign tasks
- Update project information

### Team Member

- View assigned projects
- View assigned tasks
- Update task status
- Receive notifications

---
# ✨ Features

## Authentication

- JWT Authentication
- Secure Login
- Protected Routes
- Password Hashing

---

## User Management

- Create Users
- Edit Users
- Activate / Deactivate Users
- Delete Users
- Search Users
- Filter Users

---

## Project Management

- Create Projects
- Edit Projects
- Delete Projects
- Search Projects
- Filter Projects
- Project Status Management

---

## Project Members

- Add Members
- Remove Members
- View Members

---
## Task Management

- Create Tasks
- Edit Tasks
- Delete Tasks
- Assign Tasks
- Update Status
- Priority Management
- Due Dates

---

## Notifications

- Task Assignment Notifications
- Unread Notification Counter

---

## Activity Logs

- User Activities
- Project Activities
- Task Activities

---

## Dashboard

- User Statistics
- Project Statistics
- Task Statistics
- Recent Activities

---

## Responsive Design

- Desktop
- Tablet
- Mobile

---

# 🛠 Technology Stack

## Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS
- React Query
- React Hook Form
- Zod
- Lucide Icons

## Backend

- Node.js
- Express.js
- TypeScript
- Prisma ORM
- JWT
- Bcrypt

## Database

- PostgreSQL

## Development Tools

- Git
- GitHub
- Postman
- VS Code

# 📂 Project Structure

```
taskflow-management-platform/
│
├── frontend/
│   ├── src/
│   ├── public/
│   └── .env.example
│
├── backend/
│   ├── prisma/
│   ├── src/
│   └── .env.example
│
├── docs/
│   ├── diagrams/
│   ├── postman/
│   └── feature-completion-report.md
│
├── .github/
│   └── workflows/
│
└── README.md
```
---

# ⚙️ Installation

## Clone Repository

```bash
git clone https://github.com/janeeshaShehani/taskflow-management-platform.git

cd taskflow-management-platform
```

---

## Backend Setup

```bash
cd backend

npm install
```

Create `.env`

```env
DATABASE_URL=your_database_url
JWT_SECRET=your_secret
JWT_EXPIRES_IN=7d
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

Generate Prisma Client

```bash
npx prisma generate
```

Run migrations

```bash
npx prisma migrate dev
```

Start Backend

```bash
npm run dev
```

---

## Frontend Setup

```bash
cd frontend

npm install
```

Create `.env.local`

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

Run Frontend

```bash
npm run dev
```

---

Application

```
http://localhost:3000
```

Backend API

```
http://localhost:5000
```

---

# 🔗 REST API

## Authentication

| Method | Endpoint |
|---------|----------|
| POST | /api/auth/login |

---

## Users

| Method | Endpoint |
|---------|----------|
| GET | /api/users |
| POST | /api/users |
| PATCH | /api/users/:id |
| DELETE | /api/users/:id |

---

## Projects

| Method | Endpoint |
|---------|----------|
| GET | /api/projects |
| POST | /api/projects |
| PATCH | /api/projects/:id |
| DELETE | /api/projects/:id |

---

## Project Members

| Method | Endpoint |
|---------|----------|
| GET | /api/projects/:id/members |
| POST | /api/projects/:id/members |
| DELETE | /api/projects/:id/members/:userId |

---

## Tasks

| Method | Endpoint |
|---------|----------|
| GET | /api/tasks |
| POST | /api/tasks |
| PATCH | /api/tasks/:id |
| DELETE | /api/tasks/:id |

---

## Notifications

| Method | Endpoint |
|---------|----------|
| GET | /api/notifications |
| PATCH | /api/notifications/read |

---

## Activity

| Method | Endpoint |
|---------|----------|
| GET | /api/activity |


---

# 📬 API Documentation

The Postman collection is available in:

```
docs/postman/TaskFlow.postman_collection.json
```

---

# 📋 Feature Completion Report

Available in:

```
docs/feature-completion-report.md
```

---

# 🔄 CI/CD Workflow

GitHub Actions is used for basic Continuous Integration.

The workflow automatically:

- Checks out the repository
- Installs backend dependencies
- Generates Prisma Client
- Builds the backend
- Installs frontend dependencies
- Builds the frontend

This validates the project on every push and pull request.

---

# 🤖 AI Tools Used

The following AI tools were used during development:

- ChatGPT
  - Debugging
  - Code explanations
  - Documentation
  - README preparation
  - Responsive UI improvements
  - Diagram planning

- Google Gemini
  - Alternative implementation suggestions

- Claude
  - Reviewing implementation ideas and troubleshooting

- Perplexity
  - Technical research

All AI-generated suggestions were reviewed, tested, and adapted before being integrated into the project.

---

# 🌐 Live Deployment

A live deployment is **not currently available**.

The application can be run locally by following the setup instructions provided above.

---

# 📸 Screenshots

Add screenshots in the `docs/screenshots` folder.

Example:

```
docs/screenshots/

login.png
dashboard.png
users.png
projects.png
tasks.png
notifications.png
activity.png
mobile responsive view.png
```

Example usage:

```markdown
## Dashboard

![Dashboard](docs/screenshots/dashboard.png)
```

---

| Role                | Email                  | Password      |
| ------------------- | ---------------------- | ------------- |
| **Administrator**   | `admin@taskflow.com`   | `Admin@123`   |
| **Project Manager** | `manager@taskflow.com` | `Manager@123` |
| **Team Member**     | `member@taskflow.com`  | `Member@123`  |

---

## 👨‍💻 Developer

Janeesha Shehani

University of Kelaniya

BSc (Hons) Computer Science

Linkedin    : www.linkedin.com/in/janeesha-divyanjalee-b3a841355

GitHub      : https://github.com/janeeshaShehani