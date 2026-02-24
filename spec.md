# Specification

## Summary
**Goal:** Build Phase 1 of ERPVerse — a multi-tenant ERP foundation covering authentication via Internet Identity, company setup, hierarchical role infrastructure, and staff management dashboards.

**Planned changes:**

### Backend (Motoko — single actor)
- Multi-tenant company data model storing: company name, tax number, sector, address, phone, email, authorized person name, employee count, and founding year; each company uniquely identified and scoped to its owner's Internet Identity principal
- Hierarchical role system per company with built-in roles: Company Owner, Company Manager (Technical/Administrative), Company Administrator (Technical/Administrative), and Company Staff; support for custom roles per company
- Staff profile model linked to Internet Identity principal, with auto-generated unique 12-character alphanumeric employee code on registration
- Backend functions for owners and managers to add/remove staff by employee code and assign/update roles according to their own role level

### Frontend
- Landing page with two distinct portals: Company Owner Portal and Staff Portal, both using Internet Identity for authentication
- Company Setup screen (shown to new owners on first login) with all required company fields, validated before submission, redirecting to Company Owner Dashboard on success
- Staff Registration screen (shown to new staff on first login) displaying the generated 12-character employee code prominently after registration
- Company Owner Dashboard showing company info and navigation to staff management (add/remove staff, assign roles)
- Staff Dashboard listing all companies the staff member belongs to with their role in each, and navigation into each company panel
- Turkish (default) and English language support throughout, with TR/EN toggle in the header for instant language switching
- Professional dark navy and slate color palette with gold/amber accents, sidebar navigation on dashboards, card-based panels, and enterprise-grade layout

**User-visible outcome:** Users can authenticate via Internet Identity as either a company owner or staff member. Owners can register their company, manage staff, and assign roles. Staff can complete their profile, view their employee code, and see all companies and roles they belong to. The entire interface is available in Turkish and English with a professional corporate ERP visual style.
