# Close-Scale Epic Features Tracker

This document tracks the progress of the 10 core epics for the Close-Scale CRM project, detailing the sub-features, their descriptions, and current completion status.

| Epic | Sub-Feature | Description | Status |
| :--- | :--- | :--- | :--- |
| **Epic 1: User Account Management** | Auth & JWT Configuration | Secure login and session management via JWT. | ✅ Completed |
| | Assign Roles (incl. departments) | Distinguishes Sales Manager permissions from PM permissions. | ✅ Completed |
| | User Account Management | Admin ability to view, create, edit, and deactivate users. | ✅ Completed |
| | Reset Password | Password recovery mechanism. | ❌ Not Started |
| **Epic 2: Contact & Organization Management** | Manage and Create Contact | Core foundational entity for leads, deals, and activities. | ❌ Not Started |
| | Manage Organization | Ties deals to organization entities, not just individuals. | ❌ Not Started |
| | Filter and Search Contacts | Improves usability as contact volume grows. | ❌ Not Started |
| **Epic 3: Lead Management** | Manage and Create Leads | Entry point into the sales pipeline. | ❌ Not Started |
| | Assign Leads | Essential for assigning lead ownership (Manager to Rep). | ❌ Not Started |
| | View All Leads | Basic operational lead list view. | ❌ Not Started |
| | Track Lead & Contact Info | Core interaction history logging (calls, meetings, notes). | ❌ Not Started |
| | Record Budget & Timeline Estimate | Agreement step between Sales Manager and Project Manager. | ❌ Not Started |
| | Customize Lead Stages & Status | Qualification workflow tuning. | ❌ Not Started |
| **Epic 4: Deal Management** | Manage and Create Deals | Central sales opportunity entity (created from lead). | ❌ Not Started |
| | Update Deal Status | Refine deal pipeline states (Qualified -> Contract Signed). | ❌ Not Started |
| | Manage Deal Information | Basic CRUD operations on deal details. | ❌ Not Started |
| | Assign Deals | Hand off won deal to project delivery (to Project Manager). | ❌ Not Started |
| | Upload Signed Confirmation | Record that deal negotiations concluded (PDF). | ❌ Not Started |
| **Epic 5: Activity & Task Management** | View Upcoming Activities | Secondary visibility for scheduled tasks. | ❌ Not Started |
| | Schedule Tasks & Notifications | Proactive task reminders and notifications. | ❌ Not Started |
| **Epic 6: Reporting & Dashboards** | Generate Dashboards | Executive oversight for CEO/Directors (leads, deals, revenue). | 🚧 In Progress (Frontend stub only) |
| | Generate Reports | Advanced reporting and CSV/PDF exports. | ❌ Not Started |
| **Epic 7: Project Management** | Create Project from Won Deal | Allocates delivery project post-sale. | ❌ Not Started |
| | Update Project Status | Delivery phase execution tracking (Kick-off -> Closing). | ❌ Not Started |
| | Assign Team Members | Resource staffing and progress tracking. | ❌ Not Started |
| **Epic 8: Communication & Collaboration** | Email Integration | Keeps customer email communication linked in CRM. | ❌ Not Started |
| | In-built Messaging | Internal user-to-user chat within the CRM. | ❌ Not Started |
| **Epic 9: Document Storage** | Upload & Store Documents | Dependency for confirmation certificate PDF storage. | 🚧 In Progress (Backend API built, Frontend UI missing) |
| | Document Access Control | Restricts sensitive document downloads per role. | ✅ Completed (Backend rules in place) |
| | User Document Storage | Internal docs storage. | ❌ Not Started |
| **Epic 10: Data Management & Audit** | Add Custom Fields | Flexible custom data fields for records. | ❌ Not Started |
| | Audit Logs | System activity logging. | ❌ Not Started |
| | Import / Export Data | Bulk data migration and backup (CSV, Excel). | ❌ Not Started |
