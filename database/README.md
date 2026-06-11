# Database bootstrap (PostgreSQL + PostGIS)

## 1) Create database

Create a database for the project (example name: urbanus_ia).

## 2) Configure environment

Copy `.env.example` to `.env` and set:

- DATABASE_URL=postgresql://user:password@host:5432/urbanus_ia

## 3) Validate connection

Run:

npm run db:check

## 4) Run migrations

Run:

npm run db:migrate

Migrations are executed in lexical order from `database/migrations`.

## Initial schema delivered

- Extensions: postgis, pgcrypto
- Core tables:
  - app_users
  - reurb_processes
  - ged_documents
  - aisha_analysis_logs
- Performance indexes for process, GED and AISHA audit logs
