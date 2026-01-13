# API Documentation - Soma Vitalis

Base URL: `https://app.somavitalis.com.br`

## Authentication

Most endpoints require a Bearer Token.
**Header:** `Authorization: Bearer <your_token>`

## Error Handling

Standard error response format:
```json
{
  "error": "Error message description",
  "code": "OPTIONAL_ERROR_CODE"
}
```

---

## 1. Authentication Endpoints

### Register User
Create a new user account.

- **URL:** `/api/auth/register`
- **Method:** `POST`
- **Headers:** `Content-Type: application/json`
- **Body:**
  ```json
  {
    "name": "User Name",
    "email": "user@example.com",
    "password": "Password123" // Must have 1 uppercase, 1 lowercase, 1 number, min 8 chars
  }
  ```
- **Success Response (201):**
  ```json
  {
    "token": "eyJhbGciOi...",
    "user": {
      "id": 1,
      "email": "user@example.com",
      "name": "User Name",
      "created_at": "2024-01-01T00:00:00.000Z"
    }
  }
  ```

### Login
Authenticate a user and get a token.

- **URL:** `/api/auth/login`
- **Method:** `POST`
- **Body:**
  ```json
  {
    "email": "user@example.com",
    "password": "Password123"
  }
  ```
- **Success Response (200):**
  ```json
  {
    "token": "eyJhbGciOi...",
    "user": {
      "id": 1,
      "email": "user@example.com",
      "name": "User Name"
    }
  }
  ```

### Get Current User Profile
Get details of the currently authenticated user.

- **URL:** `/api/auth/me`
- **Method:** `GET`
- **Headers:** `Authorization: Bearer <token>`
- **Success Response (200):**
  ```json
  {
    "id": 1,
    "email": "user@example.com",
    "name": "User Name",
    "created_at": "..."
  }
  ```

---

## 2. Assessment Endpoints

All assessment endpoints require Authentication (`Authorization: Bearer <token>`).

### Create Assessment
Initialize a new assessment draft.

- **URL:** `/api/assessments`
- **Method:** `POST`
- **Body:**
  ```json
  {
    "contactInfo": {
      "name": "Contact Name",
      "email": "contact@company.com",
      "role": "CEO",
      "companyName": "Company Ltd",
      "employees": 50,
      "industry": "Tech",
      "clientType": "b2b", // Enum: 'b2b', 'b2c', 'b2b-b2c'
      "maturityLevel": "3", // Enum: '1'-'5' (Self-assessed)
      "description": "Optional description"
    }
  }
  ```
- **Success Response (201):**
  ```json
  {
    "id": 1,
    "userId": 1,
    "status": "in_progress",
    "contactInfo": { ... },
    ...
  }
  ```

### Get Assessment Details
Get the current state of a specific assessment.

- **URL:** `/api/assessments/:id`
- **Method:** `GET`
- **Success Response (200):**
  Returns the full assessment object including `contactInfo`, `economicProfile`, `maturityAnswers`, status, etc.

### Update Contact Info
Update the contact information section.

- **URL:** `/api/assessments/:id/contact-info`
- **Method:** `PATCH`
- **Body:** Same structure as Create Assessment `contactInfo`.
  ```json
  {
    "contactInfo": { ... }
  }
  ```

### Update Economic Profile
Update the economic profile answers.

- **URL:** `/api/assessments/:id/economic-profile`
- **Method:** `PATCH`
- **Body:**
  ```json
  {
    "economicProfile": {
      "responses": {
        "questionId_1": { "notApplicable": false, "values": { "2024": "1000", "2023": "900" } },
        "questionId_2": { "notApplicable": true }
        // ... must contain all 8 questions required by schema logic
      }
    }
  }
  ```

### Update Maturity Answers
Save answers for the maturity questionnaire.

- **URL:** `/api/assessments/:id/maturity-answers`
- **Method:** `PATCH`
- **Body:**
  ```json
  {
    "maturityAnswers": {
      "1": 5,
      "2": 3,
      // ... Keys are question IDs (1-45), values are scores (0-5)
    }
  }
  ```

### Calculate Results
Finalize the assessment and calculate scores.
**Constraint:** Must have all sections completed (`contactInfo`, `economicProfile`, `maturityAnswers` with 45 questions).

- **URL:** `/api/assessments/:id/calculate`
- **Method:** `POST`
- **Body:** `{}` (empty)
- **Success Response (200):**
  Returns the assessment with `results` populated and status `completed`.

### Get Results
Get only the results of a completed assessment.

- **URL:** `/api/assessments/:id/results`
- **Method:** `GET`
- **Success Response (200):**
  ```json
  {
    "id": 1,
    "companyName": "Company Ltd",
    "completedAt": "2024-01-01...",
    "results": {
       // Calculated scores and categorization
    }
  }
  ```
