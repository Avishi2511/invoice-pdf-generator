# Frontend Architecture & Webpage Plan

This document outlines the frontend structure for the Invoice PDF Generator application. The frontend will be built using **React (with Next.js)** for the framework and **Tailwind CSS** for styling, ensuring a modern, responsive, and maintainable user interface.

---

## 1. Landing Page (Public)

The landing page is the first point of contact for new visitors. Its goal is to clearly communicate the app's value and guide users toward signing up.

### 1.1. Purpose
- Introduce the core features of the invoice generator.
- Build trust and encourage user registration.
- Provide clear navigation to authentication pages.

### 1.2. Components
- **Navbar (Public)**:
    - **Logo**: Application logo.
    - **Nav Links**: "Features", "Pricing" (optional), "Login", and a primary "Sign Up" button.
- **Hero Section**:
    - **Headline**: A compelling title like "Effortless Invoicing, Instant PDFs."
    - **Subheading**: A brief description of the service.
    - **Call-to-Action (CTA)**: A prominent "Get Started for Free" button that links to the signup page.
- **Features Section**:
    - A grid or list layout showcasing key benefits.
    - **Feature 1: Async PDF Generation**: Icon and text explaining that the UI remains fast while PDFs are created in the background.
    - **Feature 2: Secure & Private**: Icon and text highlighting data security and user-specific access.
    - **Feature 3: Simple Interface**: Icon and text emphasizing the easy-to-use invoice creation form.
- **Footer**:
    - Links to "Terms of Service," "Privacy Policy," and contact information.
    - Copyright notice.

---

## 2. Authentication Pages

These pages handle user registration and login, forming the gateway to the application's core functionality.

### 2.1. Signup Page (`/signup`)
- **Purpose**: To enable new users to create an account securely.
- **Components**:
    - **Signup Form**:
        - **Email Input**: Standard email field with validation.
        - **Password Input**: Password field with requirements (e.g., minimum length) and a confirmation field.
        - **Submit Button**: "Create Account".
    - **Form Validation**: Real-time feedback on input errors (e.g., "Invalid email format," "Passwords do not match").
    - **Navigation Link**: A link for existing users: "Already have an account? **Log In**".

### 2.2. Login Page (`/login`)
- **Purpose**: To allow registered users to access their accounts.
- **Components**:
    - **Login Form**:
        - **Email Input**.
        - **Password Input**.
        - **Submit Button**: "Log In".
    - **Forgot Password Link**: (Future Scope) A link to a password reset flow.
    - **Navigation Link**: A link for new users: "Don't have an account? **Sign Up**".

---

## 3. Dashboard (`/dashboard`)

The dashboard is the central hub for authenticated users. It is a protected route, accessible only after logging in.

### 3.1. Purpose
- Provide a summary of the user's invoices.
- Allow users to create new invoices.
- Display the real-time status of invoice generation.

### 3.2. Components
- **Main Layout**:
    - **Authenticated Navbar/Sidebar**:
        - **Logo**.
        - **Navigation Links**: "Dashboard", "Account".
        - **User Profile Dropdown**: Shows user email and a "Logout" button.
- **Invoice Creation Form**:
    - A prominent form or a "Create New Invoice" button that opens a modal.
    - **Client Information**: Fields for client name, email, and address.
    - **Line Items (Dynamic)**:
        - A list where users can add/remove items.
        - Each item has fields for **Description**, **Quantity**, and **Price**.
        - The total for each line item is calculated automatically.
    - **Invoice Summary**: Auto-calculated **Subtotal**, **Tax** (optional), and **Grand Total**.
    - **Generate PDF Button**: The primary action button. Clicking this sends the data to the backend and triggers the async PDF generation process.
- **Invoice List**:
    - A table or card-based list displaying all invoices created by the user.
    - **Columns/Data Points**: Invoice ID, Client Name, Total Amount, Date, and **Status**.
    - **Real-time Status**:
        - The `Status` field is critical. It will initially show **"Processing..."** with a spinner icon.
        - This status will automatically update to **"Ready"** in real-time (via WebSockets or polling) once the backend has finished generating the PDF.
    - **Actions**:
        - A **"Download"** button appears next to each invoice once its status is "Ready".
        - A "Delete" icon to remove an invoice.

---

## 4. Account Page (`/account`)

A protected page where users can manage their profile and settings.

### 4.1. Purpose
- Allow users to view their account details.
- Provide options for changing passwords or deleting their account.

### 4.2. Components
- **Profile Information**:
    - Displays the user's registered email address.
- **Change Password Form**:
    - Fields for "Current Password," "New Password," and "Confirm New Password."
- **Danger Zone**:
    - A clearly marked section for destructive actions.
    - **Delete Account Button**: A button that, after confirmation, permanently deletes the user's account and all associated data.
