# Election System Frontend

A modern, responsive, and secure frontend application for the College / Campus Election Management System. Built with **React 19**, **Vite**, **React Router v7**, **Bootstrap 5**, and **Axios**.

## Features

- **Role-Based Access Control (RBAC):**
  - **Admin:** Manage elections, candidate approvals, student registers, supervisors, and review live election results.
  - **Candidate:** View election status, eligibility requirements, submit applications, and monitor application progress.
  - **Student:** View candidate lists, cast secure votes in active elections, and review personal vote history.
  - **Supervisor:** Real-time vote verification, election monitoring, and candidate management.
- **Client-Side Routing:** Powered by React Router with protected role-based layouts.
- **RESTful API Client:** Centralized Axios instance with request token injection and 401 session expiration handling.
- **Responsive UI:** Clean, intuitive UI built with Bootstrap 5 and React Icons.

---

## Tech Stack

- **Framework:** [React 19](https://react.dev/)
- **Build Tool:** [Vite](https://vite.dev/)
- **Routing:** [React Router v7](https://reactrouter.com/)
- **Styling:** Bootstrap 5 & Custom CSS
- **Icons:** React Icons
- **HTTP Client:** Axios

---

## Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/k-karthikraja20/electionfrontend.git
   cd electionfrontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure Environment Variables:
   Create a `.env` file in the root directory (refer to `.env.example`):
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```
   *For production, replace with your deployed backend API URL.*

4. Start development server:
   ```bash
   npm run dev
   ```

5. Build for production:
   ```bash
   npm run build
   ```

---

## Deployment on Vercel

- **Framework Preset:** Vite
- **Root Directory:** `./`
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Environment Variables:**
  - `VITE_API_URL`: Your deployed backend API URL (e.g. `https://your-election-backend.vercel.app/api` or `https://your-backend.onrender.com/api`)
- SPA routing rewrites are configured in `vercel.json`.
