# Invoice PDF Generator

A scalable and secure proof-of-concept web app that enables users to generate and manage invoice PDFs asynchronously with real-time updates and secure downloads.

## Overview

This project is built to demonstrate a reliable and responsive PDF invoice generation service. The core challenge tackled here is designing an architecture that handles intensive background tasks (PDF creation) without blocking the user experience. It ensures real-time responsiveness, security, and stability.

## Tech Stack

- **Frontend**: React / Next.js + Tailwind CSS  
- **Backend**: Node.js + Express.js  
- **Database**: MongoDB  
- **PDF Generation**: `pdf-lib` 
- **Real-time Updates**: WebSockets / Socket.IO  

---

## Features

### User Authentication
- Secure sign-up and login system
- Auth-protected dashboard access

### Invoice Dashboard
- Create invoices using a simple, user-friendly form
- Line items include description and price
- Immediately visible in dashboard upon creation

### Asynchronous PDF Generation
- PDF creation is offloaded to the backend (non-blocking)
- UI displays invoice with `Processing...` status instantly
- Real-time updates when invoice is ready

### Real-time Status Updates
- Uses WebSockets to notify the frontend as soon as PDF generation is complete
- Status auto-updates to `Ready` without refreshing

### Secure Downloads
- Download links appear only for the authenticated user who created the invoice
- Ensures private access to user-specific files

---

## Screenshots
> _Coming soon_

---

## Local Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/Avishi2511/invoice-pdf-generator.git
   cd invoice-pdf-generator
