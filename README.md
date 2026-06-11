# DecodeLabs -- Project 4: Frontend and Backend Integration

A full-stack web application integrating the frontend interface with the backend API for the DecodeLabs Intern Registry. Built with **Django REST Framework** on the backend and **vanilla HTML/CSS/JavaScript** on the frontend, demonstrating end-to-end data flow.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation and Setup](#installation-and-setup)
- [Running the Application](#running-the-application)
- [API Endpoints](#api-endpoints)
- [Running Tests](#running-tests)
- [License](#license)

---

## Features

- **Full-Stack Integration** -- Frontend communicates with backend via RESTful API using Fetch API
- **Asynchronous Requests** -- Modern async/await pattern for non-blocking API calls
- **Dynamic Data Rendering** -- UI updates in real-time from API responses with DOM manipulation
- **Error Handling** -- try/catch blocks with graceful degradation and user-friendly error messages
- **CORS Configuration** -- Cross-origin requests properly configured between frontend and backend
- **Mock Fallback Mode** -- Frontend automatically detects backend availability and falls back to mock data
- **Full CRUD Operations** -- Create, Read, Update, and Delete interns through the UI
- **Search, Filter, and Sort** -- Client-side and server-side search, filtering by role, and sorting
- **Dark Mode** -- Theme toggle with system preference detection and localStorage persistence
- **Statistics Dashboard** -- Animated counters showing intern counts by development track
- **Form Validation** -- Both client-side and server-side validation with duplicate email detection
- **Responsive Design** -- Mobile-first layout with CSS Grid and Flexbox
- **Accessibility** -- ARIA labels, roles, keyboard navigation, and live regions
- **Comprehensive Tests** -- 12 automated API tests covering all endpoints and edge cases

---

## Tech Stack

| Layer      | Technology                          |
|------------|-------------------------------------|
| Backend    | Python 3, Django 5.2, Django REST Framework |
| Database   | SQLite3                             |
| Frontend   | HTML5, CSS3 (Vanilla), JavaScript (ES6+) |
| Fonts      | Google Fonts (Montserrat, Roboto, Share Tech Mono) |
| CORS       | django-cors-headers                 |

---

## Project Structure

```
Decodelabs-internship/
├── backend/                    # Django backend
│   ├── api/                    # Main API app
│   │   ├── models.py           # Intern model definition
│   │   ├── serializers.py      # DRF serializers with email validation
│   │   ├── views.py            # InternViewSet with search/filter/ordering
│   │   ├── urls.py             # API router configuration
│   │   ├── tests.py            # Comprehensive API test suite (12 tests)
│   │   └── admin.py            # Django admin registration
│   ├── backend_project/        # Django project configuration
│   │   ├── settings.py         # Project settings (CORS, apps, middleware)
│   │   ├── urls.py             # Root URL configuration
│   │   ├── wsgi.py             # WSGI entry point
│   │   └── asgi.py             # ASGI entry point
│   ├── manage.py               # Django management script
│   └── db.sqlite3              # SQLite database file
├── frontend/                   # Frontend application
│   ├── index.html              # Main HTML page
│   ├── styles.css              # Complete stylesheet (dark mode, animations)
│   └── app.js                  # Application logic (CRUD, API integration, theming)
└── README.md                   # This file
```

---

## Prerequisites

- **Python 3.10+** -- [Download Python](https://www.python.org/downloads/)
- **pip** -- Python package manager (included with Python)
- A modern web browser (Chrome, Firefox, Edge, Safari)

---

## Installation and Setup

### 1. Clone the repository

```bash
git clone https://github.com/Daddy113/Decodelabs-internship.git
cd Decodelabs-internship
```

### 2. Create a virtual environment

```bash
python -m venv venv
```

Activate it:

- **Windows:** `venv\Scripts\activate`
- **macOS/Linux:** `source venv/bin/activate`

### 3. Install backend dependencies

```bash
pip install django djangorestframework django-cors-headers
```

### 4. Run database migrations

```bash
cd backend
python manage.py migrate
```

---

## Running the Application

### Start the Backend Server

```bash
cd backend
python manage.py runserver
```

The API will be available at: `http://127.0.0.1:8000/api/interns/`

### Start the Frontend

Open `frontend/index.html` in your browser, or use a local server:

```bash
cd frontend
python -m http.server 5500
```

Then navigate to `http://localhost:5500` in your browser.

The frontend automatically detects the backend's availability. If the API is unreachable, it switches to mock data mode.

---

## API Endpoints

| Method   | Endpoint                     | Description                          |
|----------|------------------------------|--------------------------------------|
| `GET`    | `/api/interns/`              | List all interns (newest first)      |
| `POST`   | `/api/interns/`              | Register a new intern                |
| `GET`    | `/api/interns/{id}/`         | Retrieve a specific intern           |
| `PUT`    | `/api/interns/{id}/`         | Full update of an intern record      |
| `PATCH`  | `/api/interns/{id}/`         | Partial update of an intern record   |
| `DELETE` | `/api/interns/{id}/`         | Remove an intern record              |

### Query Parameters

| Parameter   | Example                            | Description                     |
|-------------|------------------------------------|---------------------------------|
| `search`    | `/api/interns/?search=alice`       | Search by name or email         |
| `ordering`  | `/api/interns/?ordering=name`      | Sort by name, created_at, or role |
| `role`      | `/api/interns/?role=Frontend`      | Filter by development track     |

---

## Running Tests

```bash
cd backend
python manage.py test api
```

Test coverage includes: CRUD operations, search, filtering, ordering, duplicate email rejection, and edge cases.

---

## Key Skills Demonstrated

- API integration between frontend and backend
- Asynchronous requests with async/await and Fetch API
- Full-stack data flow (Input-Process-Output)
- Error handling and graceful degradation
- CORS configuration and cross-origin communication
- Dynamic DOM manipulation from API responses

---

## License

This project is part of the **DecodeLabs Full Stack Developer Program -- Batch 2026**.

---

<p align="center">
  <strong>DECODELABS</strong> // PROJECT 4 -- Frontend and Backend Integration<br>
  Batch 2026
</p>
