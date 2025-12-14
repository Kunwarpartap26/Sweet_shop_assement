
Sweet Shop Management System

TDD Kata Assessment

📌 Project Overview

This project is a full-stack Sweet Shop Management System developed as part of a Test-Driven Development (TDD) assessment.
The goal of this assessment is to evaluate backend API design, database integration, authentication, inventory management, frontend integration, testing practices, Git workflow, and responsible AI usage.

The system allows users to:

Register and log in

View available sweets

Purchase sweets (inventory decreases)

Search sweets

Perform admin-only inventory management (add, update, delete, restock)

🧱 System Architecture

Backend: FastAPI (RESTful API)

Frontend: React (SPA)

Database: SQLite (persistent)

Authentication: JWT (JSON Web Tokens)

Testing: Pytest (TDD – Red / Green / Refactor)

Frontend–Backend Integration: Axios service layer

🛠 Technologies Used
Backend

Python 3

FastAPI

SQLAlchemy ORM

SQLite

JWT Authentication

Passlib / bcrypt

Pytest

Uvicorn

Frontend

React

Vite

JavaScript (ES6+)

Axios

Tailwind CSS

Tooling & Workflow

Git & GitHub

GitHub Codespaces

VS Code

GitHub Copilot

ChatGPT

✨ Features
Authentication

User registration

User login

JWT-secured protected routes

Sweets Management

View all sweets

Search sweets by name, category, or price

Add sweets (Admin only)

Update sweets (Admin only)

Delete sweets (Admin only)

Inventory Management

Purchase sweets (quantity decreases)

Purchase disabled when quantity reaches zero

Restock sweets (Admin only)

🧪 Testing & TDD

This project follows Test-Driven Development (TDD) practices:

Tests written before implementation

Clear Red → Green → Refactor cycle

Focus on meaningful backend test coverage

Test Coverage Includes

Authentication flows

Sweets CRUD operations

Inventory purchase logic

Inventory restock logic

Admin vs non-admin access control

Test Report
pytest -q
13 passed, warnings only

🚀 Running the Project Locally
Backend Setup
cd backend
source .venv/bin/activate
uvicorn app.main:app --reload


Backend URLs:

http://127.0.0.1:8000

http://127.0.0.1:8000/docs

Frontend Setup
cd frontend
npm install
npm run dev


Frontend URL:

http://localhost:5173

When run locally, all features work correctly, including authentication and inventory actions.

🌐 Notes on GitHub Codespaces

When running inside GitHub Codespaces, browser access to backend services requires using the public forwarded port URL instead of localhost.

If this configuration is not updated, the frontend may show a “Network Error” even though:

Backend APIs are working

Tests are passing

Local execution works correctly

This is a Codespaces networking limitation, not an application bug.

🤖 My AI Usage

AI tools were used responsibly as development assistants, not as replacements for engineering judgment.

Tools Used

ChatGPT

GitHub Copilot

How AI Was Used

ChatGPT was used for:

Discussing API design

Reasoning about TDD strategy

Debugging backend logic and test failures

GitHub Copilot was used for:

Generating boilerplate code

Autocompleting repetitive sections

Assisting with two remaining backend tests

My Contribution

Designed the complete backend and frontend architecture

Implemented the majority of backend logic and tests using a structured TDD approach

Solved frontend–backend integration issues using systematic debugging

Diagnosed and documented environment-specific issues (Codespaces networking)

Reviewed, modified, and validated all AI-assisted code manually

Reflection

AI tools significantly improved development speed, but correctness, debugging, and integration required careful human reasoning and structured problem solving.

☁️ Deployment (Optional / Reference)

Live deployment was optional for this assessment and not required for evaluation.

AWS EC2 Hosting (Reference)

This application is compatible with an AWS EC2-based deployment, similar to a previous project completed using Amazon EC2:

Backend hosted on EC2 (Amazon Linux 2) using Uvicorn/Gunicorn

Frontend served via Nginx or static build on EC2

Security groups configured for HTTP/HTTPS

Environment variables used for secrets and configuration

The assessment focuses on local execution, TDD, and clean architecture rather than deployment.
Screenshots 
<img width="295" height="56" alt="image" src="https://github.com/user-attachments/assets/36952c61-38ea-48c3-91ad-eaadfb10711b" />
registration page 
<img width="1306" height="949" alt="image" src="https://github.com/user-attachments/assets/789b38b6-62f7-4cc1-824a-2768578b2ca7" />
connection was establised b/w frontend and backend succufully 


