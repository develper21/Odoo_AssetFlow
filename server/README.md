# 🏢 AssetFlow Backend

> Enterprise Asset Management System — Backend API

AssetFlow is a comprehensive enterprise asset management platform built for organizations to track, manage, and optimize their physical and digital assets across departments.

## 🛠 Tech Stack

| Technology | Purpose |
|---|---|
| **Node.js 18+** | Runtime environment |
| **Express.js** | Web framework |
| **MongoDB Atlas** | Cloud database |
| **Mongoose** | ODM for MongoDB |
| **JWT** | Authentication & authorization |
| **bcryptjs** | Password hashing |
| **express-validator** | Request validation |
| **nodemailer** | Email service |
| **winston** | Logging |
| **helmet** | Security headers |
| **express-rate-limit** | Rate limiting |

## 📋 Prerequisites

- **Node.js** >= 18.0.0
- **MongoDB Atlas** account (or local MongoDB)
- **npm** >= 9.0.0

## 🚀 Installation

```bash
# Clone the repository
git clone <repository-url>

# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
# Edit .env with your values

# Seed default admin user
npm run seed:admin

# Start development server
npm run dev
```

## ⚙️ Environment Variables

| Variable | Description | Default |
|---|---|---|
| `NODE_ENV` | Environment mode | `development` |
| `PORT` | Server port | `5000` |
| `MONGODB_URI` | MongoDB connection string | — |
| `JWT_SECRET` | JWT signing secret | — |
| `JWT_EXPIRE` | JWT expiration time | `7d` |
| `JWT_COOKIE_EXPIRE` | Cookie expiration (days) | `7` |
| `CLIENT_URL` | Frontend URL for CORS | `http://localhost:3000` |
| `SMTP_HOST` | Email SMTP host | — |
| `SMTP_PORT` | Email SMTP port | `587` |
| `SMTP_USER` | Email SMTP username | — |
| `SMTP_PASS` | Email SMTP password | — |
| `FROM_EMAIL` | Sender email address | — |
| `FROM_NAME` | Sender name | `AssetFlow` |

## 📁 Folder Structure

```
backend/
├── postman/
│   └── AssetFlow.postman_collection.json
├── src/
│   ├── config/
│   │   ├── index.js          # Centralized config
│   │   └── db.js              # MongoDB connection
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── department.controller.js
│   │   ├── assetCategory.controller.js
│   │   ├── employee.controller.js
│   │   └── dashboard.controller.js
│   ├── middlewares/
│   │   ├── auth.js            # protect & authorize
│   │   ├── asyncHandler.js
│   │   ├── errorHandler.js
│   │   ├── rateLimiter.js
│   │   └── validate.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Department.js
│   │   └── AssetCategory.js
│   ├── routes/
│   │   ├── index.js           # Central router
│   │   ├── auth.routes.js
│   │   ├── department.routes.js
│   │   ├── assetCategory.routes.js
│   │   ├── employee.routes.js
│   │   └── dashboard.routes.js
│   ├── seeds/
│   │   └── adminSeed.js
│   ├── utils/
│   │   ├── errors/
│   │   │   └── AppError.js
│   │   ├── logger.js
│   │   └── sendEmail.js
│   ├── validators/
│   │   ├── auth.validator.js
│   │   ├── department.validator.js
│   │   ├── assetCategory.validator.js
│   │   └── employee.validator.js
│   ├── app.js                 # Express app setup
│   └── server.js              # Entry point
├── .env.example
├── .gitignore
├── package.json
├── API_DOCUMENTATION.md
└── README.md
```

## 📡 API Endpoints

Base URL: `http://localhost:5000/api/v1`

### Authentication

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `POST` | `/auth/signup` | Register a new user | No |
| `POST` | `/auth/login` | Login user | No |
| `POST` | `/auth/logout` | Logout user | Yes |
| `POST` | `/auth/forgot-password` | Request password reset | No |
| `PUT` | `/auth/reset-password/:token` | Reset password | No |
| `GET` | `/auth/me` | Get current user profile | Yes |

### Departments

| Method | Endpoint | Description | Auth | Role |
|---|---|---|---|---|
| `POST` | `/departments` | Create department | Yes | Admin |
| `GET` | `/departments` | List all departments | Yes | Any |
| `GET` | `/departments/:id` | Get department by ID | Yes | Any |
| `PUT` | `/departments/:id` | Update department | Yes | Admin |
| `PATCH` | `/departments/:id/activate` | Activate department | Yes | Admin |
| `PATCH` | `/departments/:id/deactivate` | Deactivate department | Yes | Admin |

### Asset Categories

| Method | Endpoint | Description | Auth | Role |
|---|---|---|---|---|
| `POST` | `/asset-categories` | Create category | Yes | Admin |
| `GET` | `/asset-categories` | List all categories | Yes | Any |
| `GET` | `/asset-categories/:id` | Get category by ID | Yes | Any |
| `PUT` | `/asset-categories/:id` | Update category | Yes | Admin |
| `PATCH` | `/asset-categories/:id/activate` | Activate category | Yes | Admin |
| `PATCH` | `/asset-categories/:id/deactivate` | Deactivate category | Yes | Admin |

### Employees

| Method | Endpoint | Description | Auth | Role |
|---|---|---|---|---|
| `GET` | `/employees` | List all employees | Yes | Admin, Asset Manager |
| `GET` | `/employees/:id` | Get employee by ID | Yes | Admin, Asset Manager |
| `PUT` | `/employees/:id` | Update employee | Yes | Admin |
| `PATCH` | `/employees/:id/promote` | Promote employee | Yes | Admin |
| `PATCH` | `/employees/:id/deactivate` | Deactivate employee | Yes | Admin |

### Dashboard

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `GET` | `/dashboard/stats` | Get dashboard statistics | Yes |

### Health Check

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | API health check |

## 📜 Available Scripts

| Script | Description |
|---|---|
| `npm start` | Start production server |
| `npm run dev` | Start development server with nodemon |
| `npm run seed:admin` | Seed default admin user |
| `npm test` | Run tests |
| `npm run lint` | Run ESLint |

## 🗺 Sprint Roadmap

| Sprint | Focus | Status |
|---|---|---|
| **Sprint 1** | Auth, RBAC, Departments, Categories, Employees, Dashboard | ✅ Current |
| **Sprint 2** | Asset CRUD, Assignment, Lifecycle Management | 🔜 Planned |
| **Sprint 3** | Booking System, Maintenance Scheduling, Notifications | 🔜 Planned |
| **Sprint 4** | Audit Logs, Reports, Analytics, Export | 🔜 Planned |

## 🔑 Default Admin Credentials

| Field | Value |
|---|---|
| Email | `admin@assetflow.com` |
| Password | `Admin@123` |

> ⚠️ **Important**: Change the default admin password immediately after first login in production.

## 📄 License

This project is licensed under the MIT License.
