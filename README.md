# MediBook

A full-stack healthcare appointment management platform that connects patients, doctors, and hospitals. Built with Spring Boot and React, MediBook handles the complete lifecycle of a medical appointment — from discovery and booking through payment, communication, and post-visit review.

---

## Features

### User Roles

The platform supports three distinct account types, each with a tailored experience:

- **Patient** — Book appointments, manage health records, pay online, communicate with doctors, and leave reviews.
- **Doctor** — Manage availability schedules, accept or reschedule appointments, respond to patient messages and reviews, and track earnings.
- **Hospital** — Maintain a hospital profile and a roster of attached doctors.

---

### Authentication and Authorization

- JWT-based stateless authentication with refresh token support.
- Role-based access control enforced at the API level via Spring Security.
- Passwords hashed with BCrypt.

---

### Doctor Discovery

- Browse all registered doctors with speciality, degree, experience, and consultation fee displayed on each card.
- Fuzzy search across seven fields: doctor name, speciality, degree, hospital name, city, and more.
- Average star rating displayed on each doctor card, calculated from verified patient reviews.

---

### Appointment Management

Full appointment lifecycle support:

- Patients book a time slot with a doctor of their choice.
- Appointments move through statuses: `PENDING` → `CONFIRMED` → `COMPLETED` (or `CANCELLED` / `RESCHEDULED`).
- Doctors and patients can cancel or reschedule, with ownership checks enforced on the backend.
- Dashboard view shows upcoming and past appointments with status badges and action buttons.

---

### Payments

- Stripe integration for online consultation fee payment at the time of booking.
- PaymentIntent flow on the backend with a demo/fallback mode when Stripe keys are not configured.
- Payment status (`PAID` / `UNPAID`) tracked per appointment and displayed in dashboards.

---

### Real-time Messaging

- Patients and doctors can exchange messages within a dedicated communication center.
- Conversation threads are scoped per patient-doctor pair.
- Automated system messages are sent at key appointment lifecycle events: booking confirmation, cancellation, reschedule, and completion.
- Unread message count shown in the navigation bar with a live badge.
- Client polls for new messages every five seconds.

---

### Notifications

- In-app notification system with a bell icon in the navigation bar.
- Notifications are generated on: appointment confirmation, cancellation, reschedule, completion, new messages, and new reviews.
- Unread count badge updates every 30 seconds.
- Users can mark individual or all notifications as read.

---

### Appointment Reminders

- Scheduled background job (runs every hour) automatically sends 24-hour and 48-hour reminders for upcoming appointments.
- Email reminders via SMTP (Gmail or any provider), with a demo mode when email is disabled.

---

### Ratings and Reviews

- Patients can leave a star rating (1–5) and a written review after a completed appointment.
- Only one review is permitted per completed appointment.
- Doctors can post a written response to any review.
- Optional hospital feedback collected alongside the doctor review.
- Average ratings aggregated and displayed on the doctor listing page.

---

### Doctor Schedule Management

- Doctors configure their available working hours per day of the week.
- Default schedule creation with a single click, or manual per-day customization.
- Schedules determine the time slots available for patient booking.

---

### Doctor Profile and Settings

- Doctors can update their speciality, degree, years of experience, and consultation fees directly from their profile page.
- Doctors can toggle between freelance status and hospital-attached status.

---

### Medical History

- Patients maintain a medical history record accessible from their profile.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend framework | Spring Boot 3.2 |
| Language | Java 17 |
| Database | PostgreSQL |
| ORM | Spring Data JPA / Hibernate |
| Security | Spring Security, JWT (JJWT 0.11) |
| Payments | Stripe Java SDK 24.18 |
| Email | Spring Mail (SMTP) |
| WebSocket | Spring WebSocket (STOMP) |
| Frontend framework | React 19 |
| Language | TypeScript |
| Build tool | Vite |
| Styling | Tailwind CSS |
| HTTP client | Axios |
| State management | TanStack React Query |
| Routing | React Router 7 |
| UI icons | Lucide React |
| Notifications | react-hot-toast |

---

## Prerequisites

Before running MediBook locally, make sure you have the following installed:

- Java 17 or higher
- Maven 3.8+
- Node.js 18+ and npm
- PostgreSQL 14+

---

## Running Locally

### 1. Clone the repository

```bash
git clone https://github.com/your-username/MediBook.git
cd MediBook
```

### 2. Set up the database

Create a PostgreSQL database named `medibook`:

```bash
psql -U postgres -c "CREATE DATABASE medibook;"
```

The schema is managed by Hibernate (`ddl-auto=update`) and will be created automatically on first startup.

### 3. Configure the backend

Open `backend/src/main/resources/application.properties`. The defaults work for a standard local PostgreSQL installation:

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/medibook
spring.datasource.username=postgres
spring.datasource.password=postgres
```

All sensitive values can be overridden with environment variables (see the table below). For development, the defaults are sufficient.

| Environment variable | Purpose | Default |
|---|---|---|
| `SPRING_DATASOURCE_URL` | JDBC connection string | `jdbc:postgresql://localhost:5432/medibook` |
| `SPRING_DATASOURCE_USERNAME` | Database username | `postgres` |
| `SPRING_DATASOURCE_PASSWORD` | Database password | `postgres` |
| `STRIPE_SECRET_KEY` | Stripe secret key | `sk_test_placeholder` (demo mode) |
| `STRIPE_PUBLISHABLE_KEY` | Stripe publishable key | `pk_test_placeholder` (demo mode) |
| `MEDIBOOK_EMAIL_ENABLED` | Enable real email sending | `false` (demo mode) |
| `MAIL_HOST` | SMTP host | `smtp.gmail.com` |
| `MAIL_USERNAME` | SMTP username | — |
| `MAIL_PASSWORD` | SMTP password | — |

When `STRIPE_SECRET_KEY` is left as the placeholder, payments run in demo mode (no real charges). When `MEDIBOOK_EMAIL_ENABLED` is `false`, email reminders are logged to the console instead of being sent.

### 4. Build and run the backend

```bash
cd backend
mvn clean package -DskipTests
java -jar target/backend-0.0.1-SNAPSHOT.jar
```

The API will be available at `http://localhost:8080`.

### 5. Install frontend dependencies

```bash
cd frontend
npm install
```

### 6. Run the frontend development server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`.

---

## Project Structure

```
MediBook/
├── backend/
│   └── src/main/java/com/medibook/backend/
│       ├── config/          # Security and WebSocket configuration
│       ├── controller/      # REST API controllers
│       ├── model/           # JPA entities
│       ├── repository/      # Spring Data JPA repositories
│       ├── service/         # Business logic
│       ├── security/        # JWT filter and user details
│       ├── payload/         # Request and response DTOs
│       └── exception/       # Global exception handling
└── frontend/
    └── src/
        ├── api/             # Axios instance configuration
        ├── components/      # Shared UI components
        ├── context/         # Auth and WebSocket React contexts
        ├── pages/           # Page-level components
        └── layouts/         # Layout wrappers
```

---

## API Overview

All endpoints are prefixed with `/api`.

| Area | Endpoints |
|---|---|
| Authentication | `POST /auth/signup`, `POST /auth/signin` |
| Profile | `GET /profile/me` |
| Doctors | `GET /doctors`, `GET /doctors/search`, `PUT /doctors/update-profile` |
| Hospitals | `GET /hospitals` |
| Appointments | `GET /appointments/my-appointments`, `POST /appointments`, `PUT /appointments/{id}/confirm`, `PUT /appointments/{id}/cancel`, `PUT /appointments/{id}/reschedule` |
| Schedules | `GET /schedules/my-schedules`, `POST /schedules`, `POST /schedules/create-default`, `DELETE /schedules/{id}` |
| Payments | `POST /payments/create-intent` |
| Messages | `GET /messages/conversations`, `POST /messages/conversations`, `GET /messages/conversations/{id}/messages`, `POST /messages/conversations/{id}/send` |
| Notifications | `GET /notifications`, `GET /notifications/unread-count`, `PUT /notifications/{id}/read` |
| Reviews | `POST /reviews`, `GET /reviews/doctor/{id}`, `PUT /reviews/{id}/response` |
| Medical History | `GET /medical-history`, `POST /medical-history` |

---

## Deployment

The project includes Dockerfiles for both services.

```bash
# Build backend image
docker build -t medibook-backend ./backend

# Build frontend image
docker build -t medibook-frontend ./frontend
```

Pass the environment variables listed in the configuration section when running the containers. The frontend Nginx configuration is in `frontend/nginx.conf`.
