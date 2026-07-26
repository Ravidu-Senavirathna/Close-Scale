# Epics & Features Breakdown
**Close-Scale (Altrium CRM)**

This document breaks down the project into core Epics and their associated Features based on the defined project scope and MoSCoW prioritization.

---

## Epic 1: User Account Management
*Handles authentication, user creation, and role-based access control (RBAC).*

*   **F1.1: Authentication (Must)**
    *   JWT-based login system (djangorestframework-simplejwt).
    *   Refresh token mechanics.
*   **F1.2: User RBAC (Must)**
    *   Roles: Sales Representative, Manager (Sales), Manager (Projects), CEO/Directors, Administrator.
    *   Permissions matrix to ensure data privacy and access control across endpoints.
*   **F1.3: User CRUD Operations (Should)**
    *   Create, view, edit, and deactivate user accounts (Administrator only).
*   **F1.4: Password Management (Could)**
    *   Password reset mechanism.

---

## Epic 2: Contact & Organization Management
*Manages external entities (individuals and companies) that the CRM tracks.*

*   **F2.1: Contact Management (Must)**
    *   Create, read, update, and delete individual contact records.
*   **F2.2: Organization Management (Must)**
    *   Create and manage Organization entities.
    *   Link individual contacts to an Organization.
*   **F2.3: Contact Filtering & Search (Should)**
    *   Search contacts by name, email, or organization.
*   **F2.4: Custom Fields (Could)**
    *   Add flexible custom data fields to contacts/organizations.

---

## Epic 3: Lead Management
*Tracks potential sales opportunities prior to qualification.*

*   **F3.1: Lead Creation & Management (Must)**
    *   Create Leads (linked to a Contact).
*   **F3.2: Lead Assignment (Must)**
    *   Manager (Sales) assigns a Lead to a specific Sales Representative.
*   **F3.3: Lead List View (Must)**
    *   View all Leads (filtered by user role/assignment).
*   **F3.4: Budget & Timeline Estimation (Must)**
    *   Record budget and timeline estimates on the Lead during the negotiation phase between Sales and Project Managers.
*   **F3.5: Customizable Lead Stages (Should)**
    *   Tune qualification workflows and statuses.

---

## Epic 4: Deal Management
*Handles the sales pipeline from qualification to closing.*

*   **F4.1: Deal Creation (Must)**
    *   Convert/Create a Deal from an existing Lead.
*   **F4.2: Deal Information Management (Must)**
    *   Basic CRUD operations on Deal details.
*   **F4.3: Pipeline Status Tracking (Must)**
    *   Track stages: `Qualified` -> `Demo Scheduled` -> `Demo Completed` -> `Proposal Made` -> `Negotiation` -> `Contract Signed`.
*   **F4.4: Deal Handover (Must)**
    *   Manager (Sales) assigns won Deals to a Manager (Projects).
*   **F4.5: Confirmation Certificate (Must)**
    *   Upload and link a signed PDF certificate to record concluded deal negotiations.

---

## Epic 5: Activity & Task Management
*Logs all interactions and schedules future tasks.*

*   **F5.1: Interaction Logging (Must)**
    *   Track call logs, meeting notes, emails, and general notes linked to Leads and Contacts.
*   **F5.2: Upcoming Activities View (Should)**
    *   Visibility into scheduled future tasks.
*   **F5.3: Notifications & Reminders (Could)**
    *   Proactive reminders for follow-up tasks.

---

## Epic 6: Reporting & Dashboards
*Provides high-level analytics for executives.*

*   **F6.1: Executive Dashboard (Should)**
    *   High-level overview displaying `total leads`, `total deals`, `total projects completed`, and `total revenue` for CEO/Directors.
*   **F6.2: Advanced Reporting (Could)**
    *   Detailed pipeline reports and exportable analytics (PDF/CSV).

---

## Epic 7: Project Management (Post-Deal Delivery)
*Tracks the execution phase after a deal is won.*

*   **F7.1: Project Creation (Should)**
    *   Automatically or manually allocate a delivery Project from a Won Deal.
*   **F7.2: Project Status Tracking (Could)**
    *   Track execution phases: `Kick-Off` -> `Planning` -> `Implementation` -> `Review` -> `Closing`.
*   **F7.3: Team Assignment & Tracking (Could)**
    *   Assign team members and track progress on the project.

---

## Epic 8: Communication & Collaboration
*Integrates communication tools directly into the CRM.*

*   **F8.1: Email Integration (Should)**
    *   Send and receive customer emails linked directly in the CRM (Gmail API integration planned for Sprint 2).
*   **F8.2: Internal Messaging (Could)**
    *   In-built user-to-user chat functionality.
*   *(Note: Google Meet API scheduling has been excluded from scope).*

---

## Epic 9: Document Storage
*Manages files attached to CRM records.*

*   **F9.1: Document Upload & Storage (Must)**
    *   Local filesystem file management via Docker volumes.
    *   Dependency for Deal Confirmation PDF certificates.
*   **F9.2: Document Access Control (Should)**
    *   Restrict sensitive document downloads based on user roles.
*   **F9.3: Internal User Document Storage (Could)**
    *   General storage for internal user/system docs.

---

## Epic 10: Data Management & Audit
*System-wide utilities for data integrity and migration.*

*   **F10.1: Audit Logs (Could)**
    *   System activity logging for security and oversight.
*   **F10.2: Data Import / Export (Could)**
    *   Bulk data migration via CSV or Excel formats.
