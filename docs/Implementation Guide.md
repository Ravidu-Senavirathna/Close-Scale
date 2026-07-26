# Implementation Guide & Architecture (Completed Features)

This document outlines the technical implementation for the features that have already been built in the Close-Scale project. It maps the completed business requirements to the technology stack (React + TypeScript on the frontend, Django + DRF on the backend).

---

## Epic 1: User Account Management

### F1.1: Authentication
*   **Backend:** Uses `djangorestframework-simplejwt` for JWT-based auth. Endpoints `/api/auth/token/` (login) and `/api/auth/token/refresh/` are fully active.
*   **Frontend:** `AuthContext.tsx` handles global authentication state. `axiosClient.ts` uses an interceptor to automatically attach the Bearer token to requests and silently refresh it on a 401 response. A split-panel `LoginPage.tsx` is built for user sign-in.
*   *(Note: Google SSO via django-allauth was explicitly removed from the architecture).*

### F1.2: User RBAC (Role-Based Access Control)
*   **Backend:** Custom `User` model (`users.models.User`) extending `AbstractUser` with `role` and `department` fields. Custom permission classes in `users/permissions.py` (e.g., `IsSalesManager`, `IsAdminUser`) are applied to DRF Views to secure endpoints based on the logged-in user's role.
*   **Frontend:** `PrivateRoute.tsx` guards routes based on the `allowedRoles` prop compared against the `currentUser.role` fetched from the backend on session restore.

### F1.3: User CRUD Operations (Backend)
*   **Backend:** `users/views.py` provides RESTful endpoints (`GET`, `POST`, `PATCH`) for administrators to manage users (create, list, update, deactivate). A custom `/api/users/me/` endpoint returns the current session profile to hydrate the frontend context.

---

## Epic 9: Document Storage

### F9.1: Document Upload and Access
*   **Backend:** `api/models.py` defines a `Document` model with fields for file storage, metadata, and generic foreign key placeholders (for future links to Deals/Contacts). 
*   **Storage Mechanism:** Files are saved to a local Docker volume (`/app/media`) to ensure persistence across container restarts. `api/views.py` provides endpoints for uploading, listing, downloading, and deleting documents, with upload size and MIME-type validation handled by `DocumentUploadSerializer`.
*   **Security:** Documents are served via Django views to enforce DRF permission checks before allowing a download, ensuring only authorized users can access sensitive files like PDF certificates.
