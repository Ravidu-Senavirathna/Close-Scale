# Close-Scale Features Tracker

This document tracks the progress of the project based strictly on the features defined in `Epics and Features.md`.

| Epic | Feature Code | Feature Name | Description | Status |
| :--- | :--- | :--- | :--- | :--- |
| **Epic 1: User Account Management** | F1.1 | Authentication | JWT-based login system and refresh token mechanics. | ✅ Completed |
| | F1.2 | User RBAC | Roles: Sales Rep, Manager (Sales/Projects), CEO/Directors, Admin. | ✅ Completed |
| | F1.3 | User CRUD Operations | Create, view, edit, and deactivate user accounts (Admin only). | ✅ Completed |
| | F1.4 | Password Management | Password reset mechanism. | ❌ Not Started |
| **Epic 2: Contact & Organization Management** | F2.1 | Contact Management | Create, read, update, and delete individual contact records. | ❌ Not Started |
| | F2.2 | Organization Management | Create and manage Organization entities; link contacts. | ❌ Not Started |
| | F2.3 | Contact Filtering & Search | Search contacts by name, email, or organization. | ❌ Not Started |
| | F2.4 | Custom Fields | Add flexible custom data fields to contacts/organizations. | ❌ Not Started |
| **Epic 3: Lead Management** | F3.1 | Lead Creation & Management | Create Leads (linked to a Contact). | ❌ Not Started |
| | F3.2 | Lead Assignment | Manager (Sales) assigns a Lead to a specific Sales Representative. | ❌ Not Started |
| | F3.3 | Lead List View | View all Leads (filtered by user role/assignment). | ❌ Not Started |
| | F3.4 | Budget & Timeline Estimation | Record budget and timeline estimates on the Lead during negotiation. | ❌ Not Started |
| | F3.5 | Customizable Lead Stages | Tune qualification workflows and statuses. | ❌ Not Started |
| **Epic 4: Deal Management** | F4.1 | Deal Creation | Convert/Create a Deal from an existing Lead. | ❌ Not Started |
| | F4.2 | Deal Information Management | Basic CRUD operations on Deal details. | ❌ Not Started |
| | F4.3 | Pipeline Status Tracking | Track stages: Qualified -> Demo Scheduled -> ... -> Contract Signed. | ❌ Not Started |
| | F4.4 | Deal Handover | Manager (Sales) assigns won Deals to a Manager (Projects). | ❌ Not Started |
| | F4.5 | Confirmation Certificate | Upload and link a signed PDF certificate to record concluded deals. | ❌ Not Started |
| **Epic 5: Activity & Task Management** | F5.1 | Interaction Logging | Track call logs, meeting notes, emails, and general notes. | ❌ Not Started |
| | F5.2 | Upcoming Activities View | Visibility into scheduled future tasks. | ❌ Not Started |
| | F5.3 | Notifications & Reminders | Proactive reminders for follow-up tasks. | ❌ Not Started |
| **Epic 6: Reporting & Dashboards** | F6.1 | Executive Dashboard | High-level overview (total leads, deals, projects, revenue). | 🚧 In Progress (Frontend stub) |
| | F6.2 | Advanced Reporting | Detailed pipeline reports and exportable analytics (PDF/CSV). | ❌ Not Started |
| **Epic 7: Project Management** | F7.1 | Project Creation | Automatically or manually allocate a delivery Project from a Won Deal. | ❌ Not Started |
| | F7.2 | Project Status Tracking | Track execution phases: Kick-Off -> ... -> Closing. | ❌ Not Started |
| | F7.3 | Team Assignment & Tracking | Assign team members and track progress on the project. | ❌ Not Started |
| **Epic 8: Communication & Collaboration** | F8.1 | Email Integration | Send and receive customer emails linked directly in the CRM. | ❌ Not Started |
| | F8.2 | Internal Messaging | In-built user-to-user chat functionality. | ❌ Not Started |
| **Epic 9: Document Storage** | F9.1 | Document Upload & Storage | Local filesystem file management via Docker volumes. | 🚧 In Progress (Backend API built, Frontend UI missing) |
| | F9.2 | Document Access Control | Restrict sensitive document downloads based on user roles. | ✅ Completed (Backend rules in place) |
| | F9.3 | Internal User Document Storage | General storage for internal user/system docs. | ❌ Not Started |
| **Epic 10: Data Management & Audit** | F10.1 | Audit Logs | System activity logging for security and oversight. | ❌ Not Started |
| | F10.2 | Data Import / Export | Bulk data migration via CSV or Excel formats. | ❌ Not Started |
