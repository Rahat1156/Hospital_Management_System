# 🏥 Hospital Management System (HMS)

A full-stack, multi-tenant hospital management platform built using **Next.js + Laravel + PostgreSQL**, designed to handle real-world hospital workflows with an integrated real-time alert system.

---

## 💡 About This Project

This project is a **complete full-stack implementation**, not just a concept or design.

It includes:

* A working **Next.js frontend (PWA-style UI)**
* A structured **Laravel backend API**
* A relational **PostgreSQL database**
* Modular system design based on real hospital workflows

---

## 🧠 What I Built

Instead of building isolated features, I implemented a **connected system where each module interacts with others**:

* Patient → Appointment → Prescription → Pharmacy → Billing → History
* Lab → Result → Alert → Doctor & Patient
* Emergency → SOS → Ambulance → ER Notification

👉 This reflects **real hospital flow**, not just CRUD operations.

---

## ⚙️ Tech Stack

* **Frontend:** Next.js (App Router, TypeScript)
* **Backend:** Laravel (REST API)
* **Database:** PostgreSQL
* **Architecture:** Decoupled frontend & backend
* **API Communication:** JSON REST APIs

---

## 📁 Project Structure

```bash
backend/   # Laravel backend (API, business logic, database)
bsms/      # Next.js frontend (UI, pages, components)
```

---

## 🔧 Key Backend Implementation

* REST API using Laravel routes
* Controller-based modular structure
* Database migrations for schema
* Role-based logic (Admin, Doctor, etc.)
* API endpoints for:

  * Patients
  * Appointments
  * Billing
  * Prescriptions

---

## 🎨 Frontend Implementation

* Next.js App Router structure
* Component-based UI system
* API integration via fetch/axios
* Dynamic pages for dashboard and modules
* Clean separation of UI and logic

---

## 🔗 System Flow Example

```text
Patient registers → gets MRN
        ↓
Books appointment
        ↓
Doctor creates prescription
        ↓
Prescription sent to pharmacy
        ↓
Medicine dispensed → billing updated
        ↓
Patient history stored
```

---

## ⚡ Key Feature Highlight

### Real-Time Alert Logic (Concept + Partial Implementation)

* Lab results trigger alerts
* Appointment reminders
* Emergency SOS flow

---

## 🚀 How to Run the Project

### Backend (Laravel)

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
php artisan serve
```

---

### Frontend (Next.js)

```bash
cd bsms
npm install
npm run dev
```

---

## ⚠️ Notes

* PostgreSQL must be running
* Update `.env` with correct DB credentials
* Backend must run before frontend

---

## 🧠 What This Project Demonstrates

* Full-stack system integration
* API design and frontend consumption
* Database-driven application
* Real-world workflow modeling
* Separation of concerns (frontend vs backend)

