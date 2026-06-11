# DecodeLabs — Intern Registry

A full-stack web application for managing intern registrations, development tracks, and team profiles. Built with **Django REST Framework** on the backend and a **vanilla HTML/CSS/JavaScript** frontend.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation & Setup](#installation--setup)
- [Running the Application](#running-the-application)
- [API Endpoints](#api-endpoints)
- [Running Tests](#running-tests)
- [Screenshots](#screenshots)
- [License](#license)

---

## Features

- **Full CRUD Operations** — Create, Read, Update, and Delete intern records
- **RESTful API** — Django REST Framework with ModelViewSet for clean API design
- **Search & Filter** — Search interns by name or email, filter by development track (Frontend, Backend, Full Stack)
- **Sorting** — Sort by newest, oldest, name (A-Z / Z-A), or development track
- **Dark Mode** — Toggle between light and dark themes, with system preference detection
- **Statistics Dashboard** — Real-time counters for total interns and per-track breakdowns
- **Mock Fallback Mode** — Frontend works standalone with mock data when the backend is offline
- **Form Validation** — Client-side and server-side validation with duplicate email detection
- **Responsive Design** — Mobile-friendly layout with modern CSS Grid
- **Animated UI** — Smooth transitions, counter animations, staggered card reveals, and micro-interactions
- **Accessibility** — ARIA labels, roles, keyboard navigation (Escape to close modals), and live regions
- **Custom Modals** — Styled confirmation dialogs for delete operations and registration forms

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
decodelabs-internship/
├── backend/                    # Django backend
│   ├── api/                    # Main API app
│   │   ├── models.py           # Intern model definition
│   │   ├── serializers.py      # DRF serializers with email validation
│   │   ├── views.py            # InternViewSet with search/filter/ordering
│   │   ├── urls.py             # API router configuration
│   │   ├── tests.py            # Comprehensive API test suite
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
│   └── app.js                  # Application logic (CRUD, search, theming)
└── README.md                   # This file
```

---

## Prerequisites

- **Python 3.10+** — [Download Python](https://www.python.org/downloads/)
- **pip** — Python package manager (included with Python)
- A modern web browser (Chrome, Firefox, Edge, Safari)

---

## Installation & Setup

### 1. Clone the repository

```bash
git clone https://github.com/Daddy113/Decodelabs-internship.git
cd Decodelabs-internship
```

### 2. Create a virtual environment

```bash
python -m venv venv
```

**Activate the virtual environment:**

- **Windows:**
  ```bash
  venv\Scripts\activate
  ```
- **macOS / Linux:**
  ```bash
  source venv/bin/activate
  ```

### 3. Install backend dependencies

```bash
pip install django djangorestframework django-cors-headers
```

### 4. Run database migrations

```bash
cd backend
python manage.py migrate
```

### 5. (Optional) Create a superuser for Django Admin

```bash
python manage.py createsuperuser
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
# Using Python's built-in HTTP server
cd frontend
python -m http.server 5500
```

Then navigate to `http://localhost:5500` in your browser.

> **Note:** The frontend automatically detects the backend's availability. If the API is unreachable, it seamlessly switches to a mock data mode so you can still explore the UI.

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
| `ordering`  | `/api/interns/?ordering=name`      | Sort by `name`, `created_at`, or `role` |
| `role`      | `/api/interns/?role=Frontend`      | Filter by development track     |

### Sample Request

```bash
curl -X POST http://127.0.0.1:8000/api/interns/ \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Doe",
    "email": "jane@decodelabs.tech",
    "role": "Full Stack",
    "bio": "Passionate about bridging frontend and backend development."
  }'
```

---

## Running Tests

The project includes a comprehensive test suite covering CRUD operations, search, filtering, ordering, and edge cases.

```bash
cd backend
python manage.py test api
```

**Test coverage includes:**
- Create intern (success and duplicate email)
- List all interns
- Update intern (PUT)
- Partial update (PATCH)
- Delete intern
- Search by name and email
- Filter by role
- Ordering by name
- Edge cases (empty name, bio max length)

---

## Screenshots

### Light Mode
> Register and manage interns with a clean, warm-toned interface.

### Dark Mode
> Switch to dark mode for comfortable viewing in low-light environments.

---

## License

This project is part of the **DecodeLabs Full Stack Developer Program — Batch 2026**.

---

<p align="center">
  <strong>DECODELABS</strong> // PROJECT 4 — Full-Stack Integration<br>
  Powered by Django & SQLite
</p>

