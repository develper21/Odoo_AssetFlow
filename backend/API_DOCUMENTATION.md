# 📡 AssetFlow API Documentation

## Base URL

```
http://localhost:5000/api/v1
```

## Authentication

AssetFlow uses **JWT (JSON Web Token)** for authentication. Tokens can be provided via:

1. **Authorization Header**: `Authorization: Bearer <token>`
2. **HTTP-Only Cookie**: Automatically set on login

### Token Lifecycle

- Tokens are issued on successful login or signup
- Default expiration: 7 days (configurable via `JWT_EXPIRE`)
- Tokens are sent as HTTP-only cookies and in the response body
- On logout, the cookie is cleared

---

## 🔐 Auth Endpoints

### Register User

```
POST /auth/signup
```

**Auth Required**: No
**Rate Limited**: Yes (auth limiter)

**Request Body**:
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@company.com",
  "password": "SecurePass@123",
  "confirmPassword": "SecurePass@123",
  "department": "665a1b2c3d4e5f6789012345"
}
```

**Success Response** (`201 Created`):
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "_id": "665a1b2c3d4e5f6789012346",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@company.com",
      "role": "employee",
      "department": "665a1b2c3d4e5f6789012345",
      "isActive": true,
      "createdAt": "2026-07-12T08:30:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error Responses**:
- `400 Bad Request` — Validation errors (missing fields, weak password)
- `409 Conflict` — Email already registered
- `429 Too Many Requests` — Rate limit exceeded

---

### Login User

```
POST /auth/login
```

**Auth Required**: No
**Rate Limited**: Yes (auth limiter)

**Request Body**:
```json
{
  "email": "admin@assetflow.com",
  "password": "Admin@123"
}
```

**Success Response** (`200 OK`):
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "_id": "665a1b2c3d4e5f6789012340",
      "firstName": "System",
      "lastName": "Admin",
      "email": "admin@assetflow.com",
      "role": "admin",
      "isActive": true
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error Responses**:
- `400 Bad Request` — Missing email or password
- `401 Unauthorized` — Invalid credentials
- `403 Forbidden` — Account deactivated
- `429 Too Many Requests` — Rate limit exceeded

---

### Logout User

```
POST /auth/logout
```

**Auth Required**: Yes

**Success Response** (`200 OK`):
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

### Forgot Password

```
POST /auth/forgot-password
```

**Auth Required**: No
**Rate Limited**: Yes (auth limiter)

**Request Body**:
```json
{
  "email": "john.doe@company.com"
}
```

**Success Response** (`200 OK`):
```json
{
  "success": true,
  "message": "Password reset email sent"
}
```

**Error Responses**:
- `400 Bad Request` — Missing or invalid email
- `404 Not Found` — No user found with that email
- `429 Too Many Requests` — Rate limit exceeded

---

### Reset Password

```
PUT /auth/reset-password/:token
```

**Auth Required**: No

**URL Parameters**:
- `token` — Password reset token from email

**Request Body**:
```json
{
  "password": "NewSecure@456",
  "confirmPassword": "NewSecure@456"
}
```

**Success Response** (`200 OK`):
```json
{
  "success": true,
  "message": "Password reset successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error Responses**:
- `400 Bad Request` — Invalid or expired token, validation errors

---

### Get Current User

```
GET /auth/me
```

**Auth Required**: Yes

**Success Response** (`200 OK`):
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "665a1b2c3d4e5f6789012346",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@company.com",
      "role": "employee",
      "department": {
        "_id": "665a1b2c3d4e5f6789012345",
        "name": "Engineering"
      },
      "isActive": true,
      "createdAt": "2026-07-12T08:30:00.000Z"
    }
  }
}
```

**Error Responses**:
- `401 Unauthorized` — Not logged in or invalid token

---

## 🏢 Department Endpoints

### Create Department

```
POST /departments
```

**Auth Required**: Yes
**Role Required**: `admin`

**Request Body**:
```json
{
  "name": "Engineering",
  "description": "Software engineering and development team",
  "headOfDepartment": "665a1b2c3d4e5f6789012346"
}
```

**Success Response** (`201 Created`):
```json
{
  "success": true,
  "message": "Department created successfully",
  "data": {
    "department": {
      "_id": "665a1b2c3d4e5f6789012345",
      "name": "Engineering",
      "description": "Software engineering and development team",
      "headOfDepartment": "665a1b2c3d4e5f6789012346",
      "isActive": true,
      "employeeCount": 0,
      "createdAt": "2026-07-12T08:30:00.000Z",
      "updatedAt": "2026-07-12T08:30:00.000Z"
    }
  }
}
```

**Error Responses**:
- `400 Bad Request` — Validation errors
- `401 Unauthorized` — Not authenticated
- `403 Forbidden` — Not authorized (not admin)
- `409 Conflict` — Department name already exists

---

### List All Departments

```
GET /departments
```

**Auth Required**: Yes
**Role Required**: Any authenticated user

**Query Parameters**:
- `page` (default: 1) — Page number
- `limit` (default: 10) — Results per page
- `search` — Search by name
- `isActive` — Filter by active status

**Success Response** (`200 OK`):
```json
{
  "success": true,
  "count": 3,
  "pagination": {
    "page": 1,
    "limit": 10,
    "totalPages": 1,
    "totalResults": 3
  },
  "data": {
    "departments": [
      {
        "_id": "665a1b2c3d4e5f6789012345",
        "name": "Engineering",
        "description": "Software engineering and development team",
        "headOfDepartment": {
          "_id": "665a1b2c3d4e5f6789012346",
          "firstName": "Jane",
          "lastName": "Smith"
        },
        "isActive": true,
        "employeeCount": 12,
        "createdAt": "2026-07-12T08:30:00.000Z"
      },
      {
        "_id": "665a1b2c3d4e5f6789012347",
        "name": "Human Resources",
        "description": "HR and people operations",
        "isActive": true,
        "employeeCount": 5,
        "createdAt": "2026-07-12T09:00:00.000Z"
      },
      {
        "_id": "665a1b2c3d4e5f6789012348",
        "name": "Marketing",
        "description": "Marketing and communications",
        "isActive": true,
        "employeeCount": 8,
        "createdAt": "2026-07-12T09:15:00.000Z"
      }
    ]
  }
}
```

---

### Get Department by ID

```
GET /departments/:id
```

**Auth Required**: Yes
**Role Required**: Any authenticated user

**Success Response** (`200 OK`):
```json
{
  "success": true,
  "data": {
    "department": {
      "_id": "665a1b2c3d4e5f6789012345",
      "name": "Engineering",
      "description": "Software engineering and development team",
      "headOfDepartment": {
        "_id": "665a1b2c3d4e5f6789012346",
        "firstName": "Jane",
        "lastName": "Smith",
        "email": "jane.smith@company.com"
      },
      "isActive": true,
      "employeeCount": 12,
      "createdAt": "2026-07-12T08:30:00.000Z",
      "updatedAt": "2026-07-12T08:30:00.000Z"
    }
  }
}
```

**Error Responses**:
- `404 Not Found` — Department not found

---

### Update Department

```
PUT /departments/:id
```

**Auth Required**: Yes
**Role Required**: `admin`

**Request Body**:
```json
{
  "name": "Engineering & DevOps",
  "description": "Software engineering, development, and DevOps team"
}
```

**Success Response** (`200 OK`):
```json
{
  "success": true,
  "message": "Department updated successfully",
  "data": {
    "department": {
      "_id": "665a1b2c3d4e5f6789012345",
      "name": "Engineering & DevOps",
      "description": "Software engineering, development, and DevOps team",
      "isActive": true,
      "updatedAt": "2026-07-12T10:00:00.000Z"
    }
  }
}
```

---

### Activate Department

```
PATCH /departments/:id/activate
```

**Auth Required**: Yes
**Role Required**: `admin`

**Success Response** (`200 OK`):
```json
{
  "success": true,
  "message": "Department activated successfully",
  "data": {
    "department": {
      "_id": "665a1b2c3d4e5f6789012345",
      "name": "Engineering",
      "isActive": true
    }
  }
}
```

---

### Deactivate Department

```
PATCH /departments/:id/deactivate
```

**Auth Required**: Yes
**Role Required**: `admin`

**Success Response** (`200 OK`):
```json
{
  "success": true,
  "message": "Department deactivated successfully",
  "data": {
    "department": {
      "_id": "665a1b2c3d4e5f6789012345",
      "name": "Engineering",
      "isActive": false
    }
  }
}
```

---

## 📦 Asset Category Endpoints

### Create Category

```
POST /asset-categories
```

**Auth Required**: Yes
**Role Required**: `admin`

**Request Body**:
```json
{
  "name": "Laptops",
  "description": "Portable computing devices including laptops and notebooks",
  "depreciationRate": 25
}
```

**Success Response** (`201 Created`):
```json
{
  "success": true,
  "message": "Asset category created successfully",
  "data": {
    "category": {
      "_id": "665a1b2c3d4e5f6789012350",
      "name": "Laptops",
      "description": "Portable computing devices including laptops and notebooks",
      "depreciationRate": 25,
      "isActive": true,
      "assetCount": 0,
      "createdAt": "2026-07-12T08:30:00.000Z"
    }
  }
}
```

**Error Responses**:
- `400 Bad Request` — Validation errors
- `403 Forbidden` — Not authorized
- `409 Conflict` — Category name already exists

---

### List All Categories

```
GET /asset-categories
```

**Auth Required**: Yes
**Role Required**: Any authenticated user

**Query Parameters**:
- `page` (default: 1) — Page number
- `limit` (default: 10) — Results per page
- `search` — Search by name
- `isActive` — Filter by active status

**Success Response** (`200 OK`):
```json
{
  "success": true,
  "count": 4,
  "pagination": {
    "page": 1,
    "limit": 10,
    "totalPages": 1,
    "totalResults": 4
  },
  "data": {
    "categories": [
      {
        "_id": "665a1b2c3d4e5f6789012350",
        "name": "Laptops",
        "description": "Portable computing devices",
        "depreciationRate": 25,
        "isActive": true,
        "assetCount": 45
      },
      {
        "_id": "665a1b2c3d4e5f6789012351",
        "name": "Office Furniture",
        "description": "Desks, chairs, and office equipment",
        "depreciationRate": 10,
        "isActive": true,
        "assetCount": 120
      },
      {
        "_id": "665a1b2c3d4e5f6789012352",
        "name": "Monitors",
        "description": "Display monitors and screens",
        "depreciationRate": 20,
        "isActive": true,
        "assetCount": 60
      },
      {
        "_id": "665a1b2c3d4e5f6789012353",
        "name": "Vehicles",
        "description": "Company vehicles and fleet",
        "depreciationRate": 15,
        "isActive": true,
        "assetCount": 8
      }
    ]
  }
}
```

---

### Get Category by ID

```
GET /asset-categories/:id
```

**Auth Required**: Yes
**Role Required**: Any authenticated user

**Success Response** (`200 OK`):
```json
{
  "success": true,
  "data": {
    "category": {
      "_id": "665a1b2c3d4e5f6789012350",
      "name": "Laptops",
      "description": "Portable computing devices including laptops and notebooks",
      "depreciationRate": 25,
      "isActive": true,
      "assetCount": 45,
      "createdAt": "2026-07-12T08:30:00.000Z",
      "updatedAt": "2026-07-12T08:30:00.000Z"
    }
  }
}
```

---

### Update Category

```
PUT /asset-categories/:id
```

**Auth Required**: Yes
**Role Required**: `admin`

**Request Body**:
```json
{
  "name": "Laptops & Tablets",
  "description": "Portable computing devices including laptops, notebooks, and tablets",
  "depreciationRate": 30
}
```

**Success Response** (`200 OK`):
```json
{
  "success": true,
  "message": "Category updated successfully",
  "data": {
    "category": {
      "_id": "665a1b2c3d4e5f6789012350",
      "name": "Laptops & Tablets",
      "description": "Portable computing devices including laptops, notebooks, and tablets",
      "depreciationRate": 30,
      "isActive": true,
      "updatedAt": "2026-07-12T10:00:00.000Z"
    }
  }
}
```

---

### Activate Category

```
PATCH /asset-categories/:id/activate
```

**Auth Required**: Yes
**Role Required**: `admin`

**Success Response** (`200 OK`):
```json
{
  "success": true,
  "message": "Category activated successfully",
  "data": {
    "category": {
      "_id": "665a1b2c3d4e5f6789012350",
      "name": "Laptops",
      "isActive": true
    }
  }
}
```

---

### Deactivate Category

```
PATCH /asset-categories/:id/deactivate
```

**Auth Required**: Yes
**Role Required**: `admin`

**Success Response** (`200 OK`):
```json
{
  "success": true,
  "message": "Category deactivated successfully",
  "data": {
    "category": {
      "_id": "665a1b2c3d4e5f6789012350",
      "name": "Laptops",
      "isActive": false
    }
  }
}
```

---

## 👥 Employee Endpoints

### List All Employees

```
GET /employees
```

**Auth Required**: Yes
**Role Required**: `admin`, `asset_manager`

**Query Parameters**:
- `page` (default: 1) — Page number
- `limit` (default: 10) — Results per page
- `search` — Search by name or email
- `department` — Filter by department ID
- `role` — Filter by role
- `isActive` — Filter by active status

**Success Response** (`200 OK`):
```json
{
  "success": true,
  "count": 2,
  "pagination": {
    "page": 1,
    "limit": 10,
    "totalPages": 1,
    "totalResults": 2
  },
  "data": {
    "employees": [
      {
        "_id": "665a1b2c3d4e5f6789012346",
        "firstName": "John",
        "lastName": "Doe",
        "email": "john.doe@company.com",
        "role": "employee",
        "department": {
          "_id": "665a1b2c3d4e5f6789012345",
          "name": "Engineering"
        },
        "isActive": true,
        "createdAt": "2026-07-12T08:30:00.000Z"
      },
      {
        "_id": "665a1b2c3d4e5f6789012347",
        "firstName": "Jane",
        "lastName": "Smith",
        "email": "jane.smith@company.com",
        "role": "department_head",
        "department": {
          "_id": "665a1b2c3d4e5f6789012345",
          "name": "Engineering"
        },
        "isActive": true,
        "createdAt": "2026-07-12T08:45:00.000Z"
      }
    ]
  }
}
```

---

### Get Employee by ID

```
GET /employees/:id
```

**Auth Required**: Yes
**Role Required**: `admin`, `asset_manager`

**Success Response** (`200 OK`):
```json
{
  "success": true,
  "data": {
    "employee": {
      "_id": "665a1b2c3d4e5f6789012346",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@company.com",
      "role": "employee",
      "department": {
        "_id": "665a1b2c3d4e5f6789012345",
        "name": "Engineering"
      },
      "isActive": true,
      "createdAt": "2026-07-12T08:30:00.000Z",
      "updatedAt": "2026-07-12T08:30:00.000Z"
    }
  }
}
```

**Error Responses**:
- `404 Not Found` — Employee not found

---

### Update Employee

```
PUT /employees/:id
```

**Auth Required**: Yes
**Role Required**: `admin`

**Request Body**:
```json
{
  "firstName": "Jonathan",
  "department": "665a1b2c3d4e5f6789012348"
}
```

**Success Response** (`200 OK`):
```json
{
  "success": true,
  "message": "Employee updated successfully",
  "data": {
    "employee": {
      "_id": "665a1b2c3d4e5f6789012346",
      "firstName": "Jonathan",
      "lastName": "Doe",
      "email": "john.doe@company.com",
      "role": "employee",
      "department": {
        "_id": "665a1b2c3d4e5f6789012348",
        "name": "Marketing"
      },
      "isActive": true,
      "updatedAt": "2026-07-12T10:00:00.000Z"
    }
  }
}
```

---

### Promote Employee

```
PATCH /employees/:id/promote
```

**Auth Required**: Yes
**Role Required**: `admin`

**Request Body**:
```json
{
  "role": "department_head"
}
```

**Success Response** (`200 OK`):
```json
{
  "success": true,
  "message": "Employee promoted successfully",
  "data": {
    "employee": {
      "_id": "665a1b2c3d4e5f6789012346",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@company.com",
      "role": "department_head",
      "updatedAt": "2026-07-12T10:30:00.000Z"
    }
  }
}
```

**Error Responses**:
- `400 Bad Request` — Invalid role or validation errors
- `404 Not Found` — Employee not found

---

### Deactivate Employee

```
PATCH /employees/:id/deactivate
```

**Auth Required**: Yes
**Role Required**: `admin`

**Success Response** (`200 OK`):
```json
{
  "success": true,
  "message": "Employee deactivated successfully",
  "data": {
    "employee": {
      "_id": "665a1b2c3d4e5f6789012346",
      "firstName": "John",
      "lastName": "Doe",
      "isActive": false
    }
  }
}
```

---

## 📊 Dashboard Endpoints

### Get Dashboard Statistics

```
GET /dashboard/stats
```

**Auth Required**: Yes
**Role Required**: Any authenticated user

**Success Response** (`200 OK`):
```json
{
  "success": true,
  "data": {
    "stats": {
      "totalEmployees": 47,
      "activeEmployees": 42,
      "totalDepartments": 6,
      "activeDepartments": 5,
      "totalCategories": 8,
      "activeCategories": 7,
      "roleDistribution": {
        "admin": 2,
        "asset_manager": 3,
        "department_head": 6,
        "employee": 36
      }
    }
  }
}
```

---

## ❌ Error Response Format

All error responses follow a consistent format:

```json
{
  "success": false,
  "error": {
    "message": "Human-readable error message",
    "statusCode": 400
  }
}
```

### Validation Error Format:
```json
{
  "success": false,
  "error": {
    "message": "Validation failed",
    "statusCode": 400,
    "errors": [
      {
        "field": "email",
        "message": "Please provide a valid email address"
      },
      {
        "field": "password",
        "message": "Password must be at least 8 characters long"
      }
    ]
  }
}
```

### Common HTTP Status Codes

| Code | Description |
|---|---|
| `200` | Success |
| `201` | Resource created |
| `400` | Bad request / Validation error |
| `401` | Unauthorized (not logged in) |
| `403` | Forbidden (insufficient permissions) |
| `404` | Resource not found |
| `409` | Conflict (duplicate resource) |
| `429` | Too many requests (rate limited) |
| `429` | Too many requests (rate limited) |
| `500` | Internal server error |

---

## 💻 Sprint 2 — Asset Registry Endpoints

### Register Asset

```
POST /assets
```

**Auth Required**: Yes
**Role Required**: `admin` or `asset_manager`

**Request Body**:
```json
{
  "name": "MacBook Pro 16",
  "serialNumber": "MAC-PRO-001",
  "category": "665a1b2c3d4e5f6789012350",
  "acquisitionDate": "2024-02-10T00:00:00.000Z",
  "acquisitionCost": 2499.00,
  "condition": "new",
  "location": "Office A, Desk 13",
  "isBookable": false,
  "description": "M3 Pro MacBook Pro 16 inch Space Grey"
}
```

**Success Response** (`201 Created`):
```json
{
  "success": true,
  "message": "Asset registered successfully",
  "data": {
    "asset": {
      "_id": "665a2b3c4d5e6f7890123401",
      "name": "MacBook Pro 16",
      "assetTag": "AF-0002",
      "serialNumber": "MAC-PRO-001",
      "category": "665a1b2c3d4e5f6789012350",
      "status": "available",
      "currentHolder": null,
      "currentHolderType": null,
      "acquisitionDate": "2024-02-10T00:00:00.000Z",
      "acquisitionCost": 2499.00,
      "condition": "new",
      "location": "Office A, Desk 13",
      "isBookable": false,
      "description": "M3 Pro MacBook Pro 16 inch Space Grey",
      "documents": [],
      "createdBy": "665a1b2c3d4e5f6789012340",
      "createdAt": "2026-07-12T09:00:00.000Z",
      "updatedAt": "2026-07-12T09:00:00.000Z"
    }
  }
}
```

---

### List Assets

```
GET /assets
```

**Auth Required**: Yes
**Role Required**: Any authenticated user

**Query Parameters**:
- `page` (default: 1) — Page number
- `limit` (default: 10) — Results per page
- `search` — Search by name, tag, serial number, or location
- `category` — Filter by category ID
- `status` — Filter by status (`available`, `allocated`, `retired`, etc.)
- `location` — Filter by location
- `department` — Filter by department ID (resolves holder department)

**Success Response** (`200 OK`):
```json
{
  "success": true,
  "message": "Assets retrieved successfully",
  "data": {
    "assets": [
      {
        "_id": "665a2b3c4d5e6f7890123401",
        "name": "MacBook Pro 16",
        "assetTag": "AF-0002",
        "serialNumber": "MAC-PRO-001",
        "category": {
          "_id": "665a1b2c3d4e5f6789012350",
          "name": "Laptops",
          "code": "LAP"
        },
        "status": "allocated",
        "currentHolder": "665a1b2c3d4e5f6789012346",
        "currentHolderType": "User",
        "location": "Office A, Desk 13",
        "createdAt": "2026-07-12T09:00:00.000Z"
      }
    ]
  },
  "meta": {
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 1,
      "pages": 1
    }
  }
}
```

---

### Get Asset Details & History

```
GET /assets/:id
```

**Auth Required**: Yes
**Role Required**: Any authenticated user

**Success Response** (`200 OK`):
```json
{
  "success": true,
  "message": "Asset details retrieved successfully",
  "data": {
    "asset": {
      "_id": "665a2b3c4d5e6f7890123401",
      "name": "MacBook Pro 16",
      "assetTag": "AF-0002",
      "serialNumber": "MAC-PRO-001",
      "category": {
        "_id": "665a1b2c3d4e5f6789012350",
        "name": "Laptops",
        "code": "LAP"
      },
      "status": "allocated",
      "currentHolder": {
        "_id": "665a1b2c3d4e5f6789012346",
        "firstName": "John",
        "lastName": "Doe",
        "email": "john.doe@company.com"
      },
      "currentHolderType": "User",
      "location": "Office A, Desk 13",
      "history": {
        "allocations": [
          {
            "_id": "665a2b3c4d5e6f7890123402",
            "asset": "665a2b3c4d5e6f7890123401",
            "allocateToType": "User",
            "allocatedTo": {
              "_id": "665a1b2c3d4e5f6789012346",
              "firstName": "John",
              "lastName": "Doe"
            },
            "allocatedBy": {
              "_id": "665a1b2c3d4e5f6789012340",
              "firstName": "System",
              "lastName": "Admin"
            },
            "allocatedDate": "2026-07-12T09:05:00.000Z",
            "expectedReturnDate": "2026-10-12T09:05:00.000Z",
            "status": "active",
            "checkOutCondition": "new"
          }
        ],
        "transfers": []
      }
    }
  }
}
```

---

### Update Asset

```
PUT /assets/:id
```

**Auth Required**: Yes
**Role Required**: `admin` or `asset_manager`

**Request Body**:
```json
{
  "name": "MacBook Pro 16 (Upgraded)",
  "location": "Office A, Desk 14",
  "condition": "good"
}
```

**Success Response** (`200 OK`):
```json
{
  "success": true,
  "message": "Asset details updated successfully",
  "data": {
    "asset": {
      "_id": "665a2b3c4d5e6f7890123401",
      "name": "MacBook Pro 16 (Upgraded)",
      "location": "Office A, Desk 14",
      "condition": "good",
      "updatedAt": "2026-07-12T09:30:00.000Z"
    }
  }
}
```

---

### Retire Asset

```
DELETE /assets/:id
```

**Auth Required**: Yes
**Role Required**: `admin` or `asset_manager`

**Success Response** (`200 OK`):
```json
{
  "success": true,
  "message": "Asset retired successfully",
  "data": {
    "asset": {
      "_id": "665a2b3c4d5e6f7890123401",
      "assetTag": "AF-0002",
      "status": "retired"
    }
  }
}
```

---

### Get Asset Metrics Summary

```
GET /assets/summary
```

**Auth Required**: Yes
**Role Required**: `admin` or `asset_manager`

**Success Response** (`200 OK`):
```json
{
  "success": true,
  "message": "Asset summary metrics retrieved successfully",
  "data": {
    "summary": {
      "totalAssets": 6,
      "availableAssets": 5,
      "allocatedAssets": 1,
      "retiredAssets": 0,
      "overdueAllocations": 0,
      "recentlyAddedAssets": [
        {
          "_id": "665a2b3c4d5e6f7890123401",
          "name": "MacBook Pro 16",
          "assetTag": "AF-0002",
          "status": "allocated"
        }
      ]
    }
  }
}
```

---

## 📋 Sprint 2 — Allocation Endpoints

### Checkout / Allocate Asset

```
POST /allocations/checkout
```

**Auth Required**: Yes
**Role Required**: `admin` or `asset_manager`

**Request Body**:
```json
{
  "asset": "665a2b3c4d5e6f7890123401",
  "allocateToType": "User",
  "allocatedTo": "665a1b2c3d4e5f6789012346",
  "checkOutCondition": "new",
  "expectedReturnDate": "2026-10-12T09:05:00.000Z"
}
```

**Success Response** (`201 Created`):
```json
{
  "success": true,
  "message": "Asset checked out successfully",
  "data": {
    "allocation": {
      "_id": "665a2b3c4d5e6f7890123402",
      "asset": "665a2b3c4d5e6f7890123401",
      "allocateToType": "User",
      "allocatedTo": "665a1b2c3d4e5f6789012346",
      "allocatedBy": "665a1b2c3d4e5f6789012340",
      "allocatedDate": "2026-07-12T09:05:00.000Z",
      "expectedReturnDate": "2026-10-12T09:05:00.000Z",
      "status": "active",
      "checkOutCondition": "new"
    }
  }
}
```

**Error Response** (`409 Conflict`):
```json
{
  "success": false,
  "message": "Asset is currently not available for allocation (Status: allocated)"
}
```

---

### Check-in / Return Asset

```
POST /allocations/check-in/:id
```

**Auth Required**: Yes
**Role Required**: `admin` or `asset_manager`

**URL Parameters**:
- `id` — The checkout Allocation document ID

**Request Body**:
```json
{
  "checkInCondition": "good",
  "checkInNotes": "Returned on schedule. Some light scratches on bottom."
}
```

**Success Response** (`200 OK`):
```json
{
  "success": true,
  "message": "Asset checked in successfully",
  "data": {
    "allocation": {
      "_id": "665a2b3c4d5e6f7890123402",
      "asset": "665a2b3c4d5e6f7890123401",
      "status": "returned",
      "actualReturnDate": "2026-07-12T10:30:00.000Z",
      "checkInCondition": "good",
      "checkInNotes": "Returned on schedule. Some light scratches on bottom."
    }
  }
}
```

---

### List Overdue Allocations

```
GET /allocations/overdue
```

**Auth Required**: Yes
**Role Required**: `admin` or `asset_manager`

**Success Response** (`200 OK`):
```json
{
  "success": true,
  "message": "Overdue allocations retrieved successfully",
  "data": {
    "allocations": [
      {
        "_id": "665a2b3c4d5e6f7890123405",
        "asset": {
          "_id": "665a2b3c4d5e6f7890123401",
          "name": "Lenovo Thinkpad",
          "assetTag": "AF-0003"
        },
        "allocatedTo": {
          "_id": "665a1b2c3d4e5f6789012346",
          "firstName": "John",
          "lastName": "Doe"
        },
        "expectedReturnDate": "2026-07-01T09:00:00.000Z"
      }
    ],
    "total": 1,
    "page": 1,
    "limit": 10
  }
}
```

---

## 📋 Sprint 2 — Transfer Endpoints

### Request Transfer

```
POST /transfers/request
```

**Auth Required**: Yes
**Role Required**: Any authenticated user (e.g. employee)

**Request Body**:
```json
{
  "asset": "665a2b3c4d5e6f7890123401",
  "toUser": "665a1b2c3d4e5f6789012347",
  "requestReason": "Project change. Target developer needs high spec macOS device."
}
```

**Success Response** (`201 Created`):
```json
{
  "success": true,
  "message": "Transfer request submitted successfully",
  "data": {
    "transfer": {
      "_id": "665a2b3c4d5e6f7890123409",
      "asset": "665a2b3c4d5e6f7890123401",
      "requestedBy": "665a1b2c3d4e5f6789012346",
      "toUser": "665a1b2c3d4e5f6789012347",
      "requestReason": "Project change. Target developer needs high spec macOS device.",
      "status": "pending"
    }
  }
}
```

---

### Approve Transfer Request

```
PATCH /transfers/:id/approve
```

**Auth Required**: Yes
**Role Required**: `admin`, `asset_manager`, or `department_head`

*Note: The approver cannot be the same user who requested the transfer (Self-approval is blocked).*

**Success Response** (`200 OK`):
```json
{
  "success": true,
  "message": "Transfer request approved successfully",
  "data": {
    "transfer": {
      "_id": "665a2b3c4d5e6f7890123409",
      "status": "approved",
      "actionedBy": "665a1b2c3d4e5f6789012340",
      "actionedAt": "2026-07-12T11:00:00.000Z"
    }
  }
}
```

---

### Reject Transfer Request

```
PATCH /transfers/:id/reject
```

**Auth Required**: Yes
**Role Required**: `admin`, `asset_manager`, or `department_head`

**Request Body**:
```json
{
  "rejectionReason": "Asset is scheduled for quarterly maintenance next week."
}
```

**Success Response** (`200 OK`):
```json
{
  "success": true,
  "message": "Transfer request rejected successfully",
  "data": {
    "transfer": {
      "_id": "665a2b3c4d5e6f7890123409",
      "status": "rejected",
      "actionedBy": "665a1b2c3d4e5f6789012340",
      "actionedAt": "2026-07-12T11:15:00.000Z",
      "rejectionReason": "Asset is scheduled for quarterly maintenance next week."
    }
  }
}
```

---

## 💻 Sprint 3 — Resource Booking Endpoints

### Create Booking Request

```
POST /bookings
```

**Auth Required**: Yes
**Role Required**: Any authenticated user

**Request Body**:
```json
{
  "resource": "665a2b3c4d5e6f7890123405",
  "startDateTime": "2026-07-14T10:00:00.000Z",
  "endDateTime": "2026-07-14T12:00:00.000Z",
  "purpose": "Project sync meeting",
  "notes": "Requires white board and display adapter."
}
```

**Success Response** (`201 Created`):
```json
{
  "success": true,
  "message": "Booking reserved successfully",
  "data": {
    "booking": {
      "_id": "665a3c4d5e6f789012345001",
      "resource": "665a2b3c4d5e6f7890123405",
      "bookedBy": "665a1b2c3d4e5f6789012346",
      "startDateTime": "2026-07-14T10:00:00.000Z",
      "endDateTime": "2026-07-14T12:00:00.000Z",
      "purpose": "Project sync meeting",
      "notes": "Requires white board and display adapter.",
      "status": "upcoming",
      "createdAt": "2026-07-12T09:00:00.000Z",
      "updatedAt": "2026-07-12T09:00:00.000Z"
    }
  }
}
```

**Error Response** (`409 Conflict`):
```json
{
  "success": false,
  "message": "Overlapping reservation exists for this resource during the requested timeframe"
}
```

---

### Reschedule Booking

```
PUT /bookings/:id/reschedule
```

**Auth Required**: Yes
**Role Required**: Any authenticated user (creator or admin/manager)

**Request Body**:
```json
{
  "startDateTime": "2026-07-15T10:00:00.000Z",
  "endDateTime": "2026-07-15T12:00:00.000Z"
}
```

**Success Response** (`200 OK`):
```json
{
  "success": true,
  "message": "Booking rescheduled successfully",
  "data": {
    "booking": {
      "_id": "665a3c4d5e6f789012345001",
      "startDateTime": "2026-07-15T10:00:00.000Z",
      "endDateTime": "2026-07-15T12:00:00.000Z",
      "status": "upcoming"
    }
  }
}
```

---

### Cancel Booking

```
POST /bookings/:id/cancel
```

**Auth Required**: Yes
**Role Required**: Any authenticated user (creator or admin/manager)

**Success Response** (`200 OK`):
```json
{
  "success": true,
  "message": "Booking cancelled successfully",
  "data": {
    "booking": {
      "_id": "665a3c4d5e6f789012345001",
      "status": "cancelled"
    }
  }
}
```

---

### Get Resource Booking History

```
GET /bookings/resource/:resourceId
```

**Auth Required**: Yes
**Role Required**: Any authenticated user

**Success Response** (`200 OK`):
```json
{
  "success": true,
  "message": "Resource booking history retrieved successfully",
  "data": {
    "history": [
      {
        "_id": "665a3c4d5e6f789012345001",
        "bookedBy": {
          "_id": "665a1b2c3d4e5f6789012346",
          "firstName": "John",
          "lastName": "Doe"
        },
        "startDateTime": "2026-07-15T10:00:00.000Z",
        "endDateTime": "2026-07-15T12:00:00.000Z",
        "purpose": "Project sync meeting"
      }
    ]
  }
}
```

---

## 💻 Sprint 3 — Maintenance Workflow Endpoints

### Raise Maintenance Request

```
POST /maintenance
```

**Auth Required**: Yes
**Role Required**: Any authenticated user

**Request Body**:
```json
{
  "asset": "665a2b3c4d5e6f7890123401",
  "issueDescription": "Battery swelling and performance degradation under load",
  "priority": "high"
}
```

**Success Response** (`201 Created`):
```json
{
  "success": true,
  "message": "Maintenance request raised successfully",
  "data": {
    "request": {
      "_id": "665a3c4d5e6f789012345020",
      "asset": "665a2b3c4d5e6f7890123401",
      "raisedBy": "665a1b2c3d4e5f6789012346",
      "issueDescription": "Battery swelling and performance degradation under load",
      "priority": "high",
      "status": "pending"
    }
  }
}
```

---

### Update Maintenance Status (Workflow Transitions)

```
PATCH /maintenance/:id/status
```

**Auth Required**: Yes
**Role Required**: `admin`, `asset_manager` (for approvals, assignment); technician/admin (for starting work, resolution)

#### Example 1: Approve Request (Manager only)
**Request Body**:
```json
{
  "status": "approved"
}
```

#### Example 2: Assign Technician (Manager only)
**Request Body**:
```json
{
  "status": "technician_assigned",
  "technician": "665a1b2c3d4e5f6789012340"
}
```

#### Example 3: Start Repair Work (Technician or Manager)
**Request Body**:
```json
{
  "status": "in_progress"
}
```

#### Example 4: Resolve Request (Technician or Manager)
**Request Body**:
```json
{
  "status": "resolved",
  "notes": "Replaced battery with genuine Apple replacement part. Tested performance, working fine."
}
```

**Success Response** (`200 OK`):
```json
{
  "success": true,
  "message": "Maintenance request status updated to resolved successfully",
  "data": {
    "request": {
      "_id": "665a3c4d5e6f789012345020",
      "status": "resolved",
      "technician": "665a1b2c3d4e5f6789012340",
      "notes": "Replaced battery with genuine Apple replacement part. Tested performance, working fine."
    }
  }
}
```

---

## 💻 Sprint 3 — Notification Endpoints

### Get My Notifications

```
GET /notifications
```

**Auth Required**: Yes
**Role Required**: Any authenticated user

**Query Parameters**:
- `page` (default: 1)
- `limit` (default: 10)
- `read` — Filter by read status (`true` / `false`)

**Success Response** (`200 OK`):
```json
{
  "success": true,
  "message": "Notifications retrieved successfully",
  "data": {
    "notifications": [
      {
        "_id": "665a3c4d5e6f789012345050",
        "title": "Maintenance Request Resolved",
        "message": "Your maintenance request for asset MacBook Pro 16 has been resolved.",
        "type": "maintenance_resolved",
        "read": false,
        "createdAt": "2026-07-12T10:45:00.000Z"
      }
    ]
  },
  "meta": {
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 1,
      "pages": 1
    }
  }
}
```

---

### Mark Notification as Read

```
PATCH /notifications/:id/read
```

**Auth Required**: Yes
**Role Required**: Any authenticated user (owner only)

**Success Response** (`200 OK`):
```json
{
  "success": true,
  "message": "Notification marked as read successfully",
  "data": {
    "notification": {
      "_id": "665a3c4d5e6f789012345050",
      "read": true
    }
  }
}
```

---

### Mark All Notifications as Read

```
PATCH /notifications/read-all
```

**Auth Required**: Yes
**Role Required**: Any authenticated user

**Success Response** (`200 OK`):
```json
{
  "success": true,
  "message": "All notifications marked as read successfully",
  "data": {
    "modifiedCount": 7
  }
}
```

---

## 💻 Sprint 3 — Activity Log Endpoints

### Get Activity Logs

```
GET /activity-logs
```

**Auth Required**: Yes
**Role Required**: `admin` or `asset_manager`

**Query Parameters**:
- `page` (default: 1)
- `limit` (default: 10)
- `user` — Filter by user ID
- `action` — Filter by action type (e.g. `CREATE_BOOKING`)

**Success Response** (`200 OK`):
```json
{
  "success": true,
  "message": "Activity logs retrieved successfully",
  "data": {
    "logs": [
      {
        "_id": "665a3c4d5e6f789012345090",
        "user": {
          "_id": "665a1b2c3d4e5f6789012340",
          "firstName": "System",
          "lastName": "Admin",
          "role": "admin"
        },
        "action": "UPDATE_MAINTENANCE_STATUS",
        "targetType": "MaintenanceRequest",
        "targetId": "665a3c4d5e6f789012345020",
        "description": "Transitioned maintenance request for asset AF-0002 from 'in_progress' to 'resolved'",
        "createdAt": "2026-07-12T10:45:00.000Z"
      }
    ]
  },
  "meta": {
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 1,
      "pages": 1
    }
  }
}
```

---

## 📋 Sprint 4 — Audit Endpoints

### Create Audit Cycle

```
POST /audits
```

**Auth Required**: Yes
**Role Required**: `admin` or `asset_manager`

**Request Body**:
```json
{
  "name": "Q3 Laptop Verification",
  "location": "Office A",
  "startDate": "2026-07-12T00:00:00.000Z",
  "endDate": "2026-07-19T23:59:59.000Z",
  "auditors": [
    "665a1b2c3d4e5f6789012340"
  ]
}
```

**Success Response** (`201 Created`):
```json
{
  "success": true,
  "message": "Audit cycle created successfully in draft status",
  "data": {
    "cycle": {
      "_id": "665a4d5e6f78901234567001",
      "name": "Q3 Laptop Verification",
      "location": "Office A",
      "startDate": "2026-07-12T00:00:00.000Z",
      "endDate": "2026-07-19T23:59:59.000Z",
      "auditors": ["665a1b2c3d4e5f6789012340"],
      "status": "draft"
    },
    "itemsCount": 4
  }
}
```

---

### Start Audit Cycle

```
POST /audits/:id/start
```

**Auth Required**: Yes
**Role Required**: `admin` or `asset_manager`

**Success Response** (`200 OK`):
```json
{
  "success": true,
  "message": "Audit cycle started successfully and is now active",
  "data": {
    "cycle": {
      "_id": "665a4d5e6f78901234567001",
      "status": "active"
    }
  }
}
```

---

### Verify Scoped Asset (Auditor)

```
POST /audits/:id/verify/:assetId
```

**Auth Required**: Yes
**Role Required**: Must be an assigned auditor for the cycle, or `admin`

**Request Body**:
```json
{
  "status": "missing",
  "notes": "Desk was cleared. Employee claims they returned it, but no check-in logged."
}
```

**Success Response** (`200 OK`):
```json
{
  "success": true,
  "message": "Asset verification status recorded successfully",
  "data": {
    "item": {
      "_id": "665a4d5e6f78901234567005",
      "auditCycle": "665a4d5e6f78901234567001",
      "asset": "665a2b3c4d5e6f7890123401",
      "status": "missing",
      "notes": "Desk was cleared. Employee claims they returned it, but no check-in logged.",
      "verifiedBy": "665a1b2c3d4e5f6789012340",
      "verifiedAt": "2026-07-12T10:50:00.000Z"
    }
  }
}
```

---

### Get Cycle Discrepancies

```
GET /audits/:id/discrepancies
```

**Auth Required**: Yes
**Role Required**: Any authenticated user

**Success Response** (`200 OK`):
```json
{
  "success": true,
  "message": "Audit discrepancy report retrieved successfully",
  "data": {
    "discrepancies": [
      {
        "_id": "665a4d5e6f78901234567005",
        "asset": {
          "_id": "665a2b3c4d5e6f7890123401",
          "name": "MacBook Pro 16",
          "assetTag": "AF-0002",
          "location": "Office A"
        },
        "status": "missing",
        "notes": "Desk was cleared."
      }
    ]
  }
}
```

---

### Close Audit Cycle

```
POST /audits/:id/close
```

**Auth Required**: Yes
**Role Required**: `admin` or `asset_manager`

*Note: Triggers status updates. Confirmed missing assets automatically transition to `lost`.*

**Success Response** (`200 OK`):
```json
{
  "success": true,
  "message": "Audit cycle closed and locked successfully",
  "data": {
    "cycle": {
      "_id": "665a4d5e6f78901234567001",
      "status": "closed",
      "closedBy": "665a1b2c3d4e5f6789012340",
      "closedAt": "2026-07-12T11:00:00.000Z"
    }
  }
}
```

---

## 📋 Sprint 4 — Reporting Endpoints

### Get Asset Utilization Trends

```
GET /reports/utilization
```

**Auth Required**: Yes
**Role Required**: `admin` or `asset_manager`

**Query Parameters**:
- `format` — Return format (`json` or `csv`). If `csv`, returns a CSV file download.
- `startDate` / `endDate` — Date filters.

**Success Response** (`200 OK`):
```json
{
  "success": true,
  "message": "Report compiled successfully",
  "data": [
    {
      "_id": {
        "year": 2026,
        "month": 7
      },
      "totalAllocations": 3,
      "activeAllocations": 1
    }
  ]
}
```

---

### Get Most-Used vs Idle Assets

```
GET /reports/usage-comparison
```

**Auth Required**: Yes
**Role Required**: `admin` or `asset_manager`

**Success Response** (`200 OK`):
```json
{
  "success": true,
  "message": "Usage comparison report compiled successfully",
  "data": {
    "mostUsed": [
      {
        "_id": "665a2b3c4d5e6f7890123401",
        "name": "MacBook Pro 16",
        "assetTag": "AF-0002",
        "status": "allocated",
        "checkoutCount": 2
      }
    ],
    "idle": [
      {
        "_id": "665a2b3c4d5e6f7890123404",
        "name": "Dell UltraSharp 27\"",
        "assetTag": "AF-0004",
        "condition": "new",
        "location": "Conference Room B",
        "allocationCount": 0
      }
    ]
  }
}
```

---

### Get Maintenance Frequency

```
GET /reports/maintenance-frequency
```

**Auth Required**: Yes
**Role Required**: `admin` or `asset_manager`

**Success Response** (`200 OK`):
```json
{
  "success": true,
  "message": "Report compiled successfully",
  "data": [
    {
      "_id": "665a2b3c4d5e6f7890123401",
      "name": "MacBook Pro 16",
      "assetTag": "AF-0002",
      "maintenanceCount": 1,
      "resolvedCount": 1
    }
  ]
}
```

---

### Get Bookings Heatmap

```
GET /reports/bookings-heatmap
```

**Auth Required**: Yes
**Role Required**: `admin` or `asset_manager`

**Success Response** (`200 OK`):
```json
{
  "success": true,
  "message": "Report compiled successfully",
  "data": [
    {
      "bookingCount": 2,
      "dayOfWeek": 2,
      "hourOfDay": 10
    }
  ]
}
```



