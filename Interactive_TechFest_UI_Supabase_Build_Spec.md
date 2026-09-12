# Interactive TechFest — UI + Supabase Build Specification

## 1. Project Goal

Build an original college technical-fest platform inspired by the **interaction philosophy** of game UI redesigns such as the supplied Among Us Behance reference, combined with the event architecture previously analyzed from ANVESHAN 2026.

**Do not copy Among Us or ANVESHAN branding, artwork, posters, text, or source code.**

The target experience is:

> **A game-like interactive event world on the surface, with a real registration platform underneath.**

The platform must contain:
- Interactive homepage
- All events
- Event detail pages
- Native registration
- Authentication
- Team creation
- Member management
- Payment-ready architecture
- Participant dashboard
- QR pass/check-in
- Admin dashboard
- Results and certificates

**Google Forms must NOT be used.**

---

# 2. Core User Journey

Normal event website:

```text
Home → Events → Event → Google Form
```

Our website:

```text
Interactive Event World
        ↓
Explore Event
        ↓
Interact with Event Terminal
        ↓
Inspect Event
        ↓
Accept Mission / Register
        ↓
Native Registration
        ↓
Team Creation
        ↓
Member Verification
        ↓
Review
        ↓
Payment if required
        ↓
Registration Confirmed
        ↓
QR Pass
        ↓
Participant Dashboard
```

---

# 3. UI CONCEPT

Use:

```text
Game UI
+
Tech Fest
+
Sci-Fi Mission Control
+
Interactive Event World
```

The website should feel like a small interactive game lobby, not a generic college website or SaaS dashboard.

It should be:
- immersive
- playful
- modern
- futuristic
- interactive
- memorable
- responsive
- usable

The Behance reference can inspire:
- tactile controls
- panels
- game-like transitions
- interactive objects
- contextual controls
- character/hand interaction
- animated navigation

Do NOT copy:
- Among Us characters
- Among Us logo
- exact screens
- exact artwork
- exact typography
- exact UI assets
- exact color palette

Create a completely original visual identity.

---

# 4. Recommended Theme

Use a fictional **Tech Mission Control / Event Command Center**.

Concept:

```text
                  FEST LOGO
                  TECH FEST 2026

             ┌───────────────────┐
             │   EVENT TERMINAL  │
             │                   │
             │   05 MISSIONS     │
             │                   │
             │      ENTER        │
             └───────────────────┘

        [ EVENTS ]       [ PROFILE ]
        [ TEAM ]         [ CONTACT ]
```

The homepage should feel like an environment containing interactive objects.

---

# 5. Required Routes

```text
/
 /events
 /events/:slug
 /register/:eventSlug
 /login
 /signup
 /dashboard
 /dashboard/registrations
 /dashboard/team
 /dashboard/profile
 /contact
 /about
 /schedule
 /results
 /admin
 /admin/events
 /admin/registrations
 /admin/teams
 /admin/payments
 /admin/checkin
 /admin/results
 /admin/certificates
 /admin/announcements
```

---

# 6. Homepage

## Header

Desktop:

```text
[LOGO]  EVENTS  SCHEDULE  ABOUT  TEAM  CONTACT  [PROFILE]
```

Mobile:

```text
[LOGO]                              [☰]
```

Hamburger menu should animate open/close.

## Hero

Display:

```text
FEST NAME
2026

TAGLINE

[ EXPLORE MISSIONS ]
```

Use original theme-specific wording.

## Interactive environment

Possible objects:

```text
┌──────────────┐
│ EVENT BOARD  │
└──────────────┘

┌──────────┐          ┌──────────┐
│ PROFILE  │          │ REGISTER │
└──────────┘          └──────────┘

             ┌────────────┐
             │   CORE     │
             │  TERMINAL  │
             └────────────┘

┌──────────┐          ┌──────────┐
│ SCHEDULE │          │ CONTACT  │
└──────────┘          └──────────┘
```

Every object should be interactive.

Hover:
- highlight
- tooltip
- micro-animation

Click:
- physical feedback
- transition
- open destination

---

# 7. Events Page

Route:

```text
/events
```

The page should feel like an **EVENT MISSION SELECTOR**, not a standard card grid.

Concept:

```text
                    EVENT MAP

       ┌───────────────┐
       │    CHAKAVA    │
       │    CULTURE    │
       └───────────────┘

      ┌─────────────────────┐
      │      ML MANIA       │
      │       AI / ML       │
      └─────────────────────┘

       ┌───────────────┐
       │  SAMBHASHINI  │
       │    CULTURE    │
       └───────────────┘

       ┌───────────────┐
       │ SPIKE SHOWDOWN│
       │    GAMING     │
       └───────────────┘

       ┌───────────────┐
       │   LOGIC LAMP  │
       │    CODING     │
       └───────────────┘
```

Final composition can be different.

---

# 8. Event Cards

Each event displays:

```text
Poster / illustration
EVENT NAME
CATEGORY
DATE
TEAM SIZE
PRIZE POOL
REGISTRATION STATUS
[ INSPECT ]
```

Example:

```text
┌──────────────────────────────┐
│          EVENT ART           │
│                              │
│          ML MANIA            │
│       MACHINE LEARNING       │
│                              │
│       22–24 JAN              │
│       TEAM: 3–4              │
│       PRIZE: ₹10,000         │
│                              │
│       ● REGISTRATION OPEN    │
│                              │
│          [ INSPECT ]         │
└──────────────────────────────┘
```

Registration status must come from Supabase, not hard-coded frontend text.

---

# 9. Event Detail Page

Route example:

```text
/events/mlmania
```

Structure:

```text
← BACK TO EVENTS

┌──────────────────────────────────┐
│          EVENT POSTER            │
└──────────────────────────────────┘

ML MANIA
Machine Learning Arena

DATE
22–24 JAN 2026

TEAM SIZE
3–4

PRIZE POOL
₹10,000

STATUS
● REGISTRATION OPEN

──────────────────────────────────

ABOUT THE EVENT

Description

──────────────────────────────────

EVENT ROUNDS

ROUND 0
...

ROUND 1
...

ROUND 2
...

──────────────────────────────────

[RULEBOOK]

──────────────────────────────────

COORDINATORS

[ PERSON ] [ PERSON ]

──────────────────────────────────

       [ ACCEPT MISSION ]
```

All event content must be loaded from Supabase.

---

# 10. Signature Registration Interaction

Registration should feel like operating a machine.

Concept:

```text
        ┌─────────────────────────┐
        │     REGISTRATION        │
        │       TERMINAL          │
        │                         │
        │           ✋            │
        │                         │
        │      ACCEPT MISSION     │
        └─────────────────────────┘
```

Possible animation:

```text
Idle
 ↓
Hover
 ↓
Hand/cursor approaches
 ↓
Terminal activates
 ↓
Button depresses
 ↓
Screen powers on
 ↓
Registration wizard opens
```

Use Framer Motion/CSS or an appropriate React animation system.

Keep animations performant.

---

# 11. Native Registration

**NO Google Forms.**

Registration must communicate with our own backend:

```text
Interactive UI
      ↓
Registration Terminal
      ↓
Supabase / Backend
      ↓
Database
      ↓
Registration ID
      ↓
Payment
      ↓
Confirmation
```

---

# 12. Registration Wizard

Use a reusable component:

```text
RegistrationWizard
```

Steps:

```text
1. Eligibility
2. Team
3. Members
4. Documents
5. Review
6. Payment
7. Confirmation
```

The wizard must dynamically skip irrelevant steps.

---

# 13. Step 1 — Authentication

If unauthenticated:

```text
REGISTER
 ↓
LOGIN / SIGN UP
```

Use:

```text
Supabase Auth
```

Primary:
- Email/password

Optional:
- Google OAuth

Do not store passwords in our own database.

---

# 14. Step 2 — Participant Type

```text
SELECT PARTICIPANT TYPE

┌──────────────────────┐
│ COLLEGE PARTICIPANT │
└──────────────────────┘

┌──────────────────────┐
│ EXTERNAL PARTICIPANT│
└──────────────────────┘
```

Eligibility and pricing must be controlled by backend/event configuration.

---

# 15. Step 3 — Team Creation

For team events:

```text
CREATE TEAM

TEAM NAME
[____________________]

TEAM LEADER
[CURRENT USER]

[ + ADD MEMBER ]

MEMBERS

1. Current User
2. __________
3. __________
4. __________

[ CONTINUE ]
```

Event configuration determines minimum and maximum team size.

For individual events, skip team creation.

---

# 16. Step 4 — Add Members

Member fields:

```text
Name
Email
Phone
College
```

Optional:
```text
Student ID
```

The number of fields must be generated from the event's database configuration.

---

# 17. Step 5 — Verification

Possible:

```text
Member Email
     ↓
OTP / verification
     ↓
✓ VERIFIED
```

Admin should be able to configure whether verification is required.

---

# 18. Step 6 — Documents

If required:

```text
DOCUMENT CHECK

College ID
[ UPLOAD ]

Other document
[ UPLOAD ]
```

Use Supabase Storage.

Security:
- file size limits
- MIME validation
- authenticated upload
- private storage for sensitive files
- signed URLs
- server-side validation

---

# 19. Step 7 — Review

```text
┌─────────────────────────────────┐
│       REGISTRATION DOSSIER      │
├─────────────────────────────────┤
│ EVENT: ML MANIA                 │
│ TEAM: CODE WARRIORS             │
│                                 │
│ LEADER                          │
│ Sandip Patil                    │
│                                 │
│ MEMBERS                         │
│ Member 1                        │
│ Member 2                        │
│ Member 3                        │
│                                 │
│ FEE: ₹500                       │
│                                 │
│ [ EDIT ]      [ CONFIRM ]       │
└─────────────────────────────────┘
```

Fee must be calculated server-side.

---

# 20. Step 8 — Payment

Use a payment abstraction so the provider can be changed later.

Recommended first provider for India:

```text
Razorpay
```

Flow:

```text
Registration
 ↓
Create payment order
 ↓
Payment gateway
 ↓
Webhook
 ↓
Server verifies payment
 ↓
Registration marked PAID
```

Never trust a frontend-only payment success callback.

---

# 21. Step 9 — Confirmation

Successful registration:

```text
╔══════════════════════════════════╗
║                                  ║
║       MISSION ACCEPTED           ║
║                                  ║
║               ✓                  ║
║                                  ║
║       REG-26-MLM-8F21            ║
║                                  ║
║          [ QR CODE ]             ║
║                                  ║
║       ML MANIA                   ║
║       CODE WARRIORS              ║
║                                  ║
║ [ VIEW PASS ] [ DASHBOARD ]      ║
╚══════════════════════════════════╝
```

Generate a unique registration number.

---

# 22. QR Pass

Generate a QR code for every confirmed registration.

QR should contain an opaque registration identifier, not sensitive participant data.

Example:

```text
REG-26-MLM-8F21
```

Check-in:

```text
Scan QR
 ↓
Backend validation
 ↓
Registration found
 ↓
Check-in status updated
```

---

# 23. Participant Dashboard

Route:

```text
/dashboard
```

Example:

```text
PLAYER PROFILE

REGISTERED MISSIONS

┌────────────────────────────┐
│ ML MANIA                   │
│ CODE WARRIORS              │
│ ✓ CONFIRMED                │
│                            │
│ [ PASS ] [ TEAM ]          │
└────────────────────────────┘

┌────────────────────────────┐
│ LOGIC LAMP                 │
│ BYTE FORCE                 │
│ ✓ CONFIRMED                │
└────────────────────────────┘
```

Dashboard features:
- registrations
- team
- payment status
- event schedule
- venue
- QR pass
- announcements
- results
- certificates
- profile

---

# 24. Schedule

Route:

```text
/schedule
```

Use a timeline:

```text
DAY 1

09:00  Registration
10:00  ML Mania
12:00  Opening
14:00  Logic Lamp

DAY 2
...
```

---

# 25. Organizing Committee

Route:

```text
/team
```

Use an interactive profile carousel.

Each member:

```text
PHOTO
NAME
ROLE
SOCIAL
```

Navigation:

```text
‹   01 / 07   ›
```

Create original design rather than copying ANVESHAN.

---

# 26. Contact

Route:

```text
/contact
```

Include:
- email
- phone
- location
- Instagram
- LinkedIn
- FAQ

Can use an interactive communications terminal.

---

# 27. Supabase Backend

**Supabase is feasible and recommended for the first version.**

Use:

```text
Supabase
├── PostgreSQL
├── Auth
├── Storage
├── Row Level Security
├── Edge Functions
└── Realtime where useful
```

---

# 28. Database — profiles

```text
id UUID PRIMARY KEY
full_name TEXT
email TEXT
phone TEXT
college TEXT
college_type TEXT
avatar_url TEXT
role TEXT
is_verified BOOLEAN
created_at TIMESTAMP
updated_at TIMESTAMP
```

Roles:

```text
participant
admin
super_admin
coordinator
```

---

# 29. Database — events

```text
id UUID PRIMARY KEY
slug TEXT UNIQUE
name TEXT
short_description TEXT
description TEXT
category TEXT
poster_url TEXT
rulebook_url TEXT
venue TEXT
event_date_start TIMESTAMP
event_date_end TIMESTAMP

team_based BOOLEAN
min_team_size INTEGER
max_team_size INTEGER

registration_fee_internal NUMERIC
registration_fee_external NUMERIC

max_teams INTEGER

registration_open BOOLEAN
registration_start TIMESTAMP
registration_end TIMESTAMP

created_at TIMESTAMP
updated_at TIMESTAMP
```

---

# 30. Database — event_rounds

```text
id UUID PRIMARY KEY
event_id UUID
round_number INTEGER
name TEXT
description TEXT
date TIMESTAMP
duration_minutes INTEGER
location TEXT
rules TEXT
```

This supports events with different numbers of rounds.

---

# 31. Database — teams

```text
id UUID PRIMARY KEY
event_id UUID
team_name TEXT
leader_id UUID
status TEXT
created_at TIMESTAMP
updated_at TIMESTAMP
```

Status:

```text
draft
pending
confirmed
cancelled
disqualified
```

---

# 32. Database — team_members

```text
id UUID PRIMARY KEY
team_id UUID
user_id UUID
role TEXT
verification_status TEXT
joined_at TIMESTAMP
```

Roles:

```text
leader
member
```

---

# 33. Database — registrations

```text
id UUID PRIMARY KEY
registration_number TEXT UNIQUE
event_id UUID
team_id UUID
user_id UUID
participant_type TEXT
status TEXT
payment_status TEXT
amount NUMERIC
created_at TIMESTAMP
updated_at TIMESTAMP
```

Status:

```text
draft
pending
confirmed
cancelled
rejected
disqualified
```

Payment status:

```text
not_required
pending
paid
failed
refunded
```

---

# 34. Database — payments

```text
id UUID PRIMARY KEY
registration_id UUID
provider TEXT
order_id TEXT
payment_id TEXT
amount NUMERIC
currency TEXT
status TEXT
signature_verified BOOLEAN
created_at TIMESTAMP
updated_at TIMESTAMP
```

Never trust payment status directly from browser input.

---

# 35. Database — documents

```text
id UUID PRIMARY KEY
user_id UUID
registration_id UUID
document_type TEXT
storage_path TEXT
status TEXT
created_at TIMESTAMP
```

---

# 36. Database — check-ins

```text
id UUID PRIMARY KEY
registration_id UUID
checked_in_by UUID
checked_in_at TIMESTAMP
location TEXT
```

Prevent duplicate check-ins.

---

# 37. Database — coordinators

```text
id UUID PRIMARY KEY
event_id UUID
name TEXT
phone TEXT
email TEXT
photo_url TEXT
role TEXT
```

---

# 38. Database — announcements

```text
id UUID PRIMARY KEY
event_id UUID NULL
title TEXT
message TEXT
priority TEXT
published BOOLEAN
created_at TIMESTAMP
```

---

# 39. Database — results

```text
id UUID PRIMARY KEY
event_id UUID
team_id UUID
position INTEGER
score NUMERIC
remarks TEXT
published BOOLEAN
```

---

# 40. Database — certificates

```text
id UUID PRIMARY KEY
registration_id UUID
certificate_type TEXT
certificate_number TEXT UNIQUE
file_url TEXT
issued_at TIMESTAMP
```

Types:

```text
participant
winner
runner_up
volunteer
organizer
```

---

# 41. Supabase RLS

RLS is mandatory.

Participants can:
- read/update own profile
- read own teams
- read own registrations
- read own payments
- read own documents

Participants must NOT:
- read other users
- modify other registrations
- modify payment status
- modify event configuration
- access admin data

Admin access must be role-controlled.

---

# 42. Supabase Storage

Buckets:

```text
event-posters
rulebooks
avatars
participant-documents
certificates
```

Recommended:

```text
event-posters → public
rulebooks → public/controlled
avatars → public/controlled
participant-documents → PRIVATE
certificates → controlled/private
```

---

# 43. Edge Functions

Use Edge Functions/server-side functions for:

```text
create-registration
create-payment-order
verify-payment
generate-registration-id
generate-qr
send-confirmation
admin-checkin
issue-certificate
```

Sensitive business logic must not live only in React.

---

# 44. Capacity

When:

```text
confirmed teams >= max_teams
```

show:

```text
REGISTRATION FULL
```

Optionally support:

```text
WAITLIST
```

---

# 45. Duplicate Protection

Backend should prevent accidental duplicate registration.

Logical rule:

```text
one active registration per user/event
```

unless an event explicitly allows multiple teams.

Use database constraints where possible.

---

# 46. Admin Dashboard

Keep the same visual language but optimize for productivity.

```text
EVENT COMMAND CENTER

TOTAL EVENTS       05
REGISTRATIONS      286
PARTICIPANTS       1,024
REVENUE            ₹142,500
CHECKED IN         642
```

Event metrics:

```text
ML MANIA           72/100
LOGIC LAMP         45/60
SPIKE SHOWDOWN     98/100
CHAKAVA             51/80
SAMBHASHINI         39/50
```

---

# 47. Admin Features

Admin can:

```text
Create event
Edit event
Delete/draft event
Publish
Unpublish
Open registration
Close registration
Set capacity
Set fees
Set team size
Add rounds
Upload poster
Upload rulebook
Add coordinators
```

Registration management:

```text
Search
Filter
Sort
View participant
View team
View payment
Approve
Reject
Cancel
Export CSV
```

---

# 48. Admin Check-in

```text
SCAN QR

       [ CAMERA ]

          ↓

VALID REGISTRATION

Name
Team
Event

[ CHECK IN ]
```

Already checked in:

```text
ALREADY CHECKED IN
10:42 AM
```

Invalid:

```text
INVALID PASS
```

---

# 49. Results

Admin:

```text
Select event
 ↓
Select team
 ↓
Enter score
 ↓
Assign rank
 ↓
Publish
```

Participants see published results in dashboard.

---

# 50. Notifications

Support:

```text
Registration confirmation
Payment confirmation
Event reminder
Schedule update
Venue change
Round result
Certificate available
```

Start with email.

Future:
- WhatsApp
- SMS
- push notifications

---

# 51. Responsive Design

Support:

```text
Desktop
Laptop
Tablet
Mobile
```

Do not simply shrink desktop.

Desktop can use an interactive room.

Mobile can use a vertical mission map.

---

# 52. Animation

Use animation for:

```text
Page transitions
Hover
Terminal activation
Registration progression
Panel opening
Event selection
Success confirmation
QR scan
```

Do not animate everything.

Prioritize:
- meaningful interaction
- performance
- accessibility

---

# 53. Sound

Optional sound:

```text
button click
terminal activation
success
error
QR scan
```

Default:

```text
Muted
```

Provide:

```text
Sound ON/OFF
```

---

# 54. Accessibility

Include:
- keyboard navigation
- focus states
- semantic HTML
- alt text
- readable contrast
- reduced-motion mode
- accessible labels
- screen-reader labels
- form validation

Add:

```text
Settings → Reduce Animations
```

---

# 55. Loading Screen

Optional short branded loading:

```text
INITIALIZING EVENT SYSTEM...

██████████████░░░

SYSTEM READY
```

Do not force a long animation on every route.

---

# 56. 404

In-theme:

```text
SIGNAL LOST

The requested mission could not be found.

[ RETURN TO COMMAND CENTER ]
```

---

# 57. Empty States

Events:

```text
NO ACTIVE MISSIONS

There are currently no events available.

[ EXPLORE HOME ]
```

Dashboard:

```text
NO REGISTRATIONS

You haven't accepted a mission yet.

[ EXPLORE EVENTS ]
```

---

# 58. Data-Driven UI

**Critical requirement: events must NOT be hard-coded in React.**

Architecture:

```text
Supabase events table
        ↓
Database query
        ↓
React components
        ↓
UI
```

Adding an event through admin should automatically update:
- event catalogue
- event details
- search/filter
- registration
- dashboard
- admin

No frontend code changes should be required.

---

# 59. Data-Driven Registration

Registration UI reads from event configuration:

```text
teamBased
minTeamSize
maxTeamSize
fee
registrationOpen
capacity
requiredDocuments
```

Therefore:

```text
Event A → 2 members
Event B → 3–4 members
Event C → individual
```

can all use one registration engine.

---

# 60. Suggested Frontend Structure

```text
src/
├── components/
│   ├── ui/
│   ├── Terminal/
│   ├── EventCard/
│   ├── EventMap/
│   ├── Registration/
│   ├── QRPass/
│   ├── Navigation/
│   ├── Team/
│   └── Dashboard/
│
├── pages/
│   ├── Home
│   ├── Events
│   ├── EventDetails
│   ├── Register
│   ├── Login
│   ├── Signup
│   ├── Dashboard
│   ├── Contact
│   └── Admin
│
├── lib/
│   ├── supabase
│   ├── auth
│   ├── payments
│   └── validation
│
├── hooks/
├── services/
├── types/
└── utils/
```

---

# 61. Design System

Create reusable:

```text
Typography
Buttons
Cards
Panels
Inputs
Badges
Status indicators
Modals
Tooltips
Terminal controls
Navigation
Forms
Tables
```

Use design tokens/CSS variables.

Example:

```text
--background
--surface
--surface-elevated
--text
--text-muted
--accent
--success
--warning
--danger
--border
```

Do not hard-code colors across components.

---

# 62. UI States

Every important component must support:

```text
default
hover
active
focus
disabled
loading
success
error
empty
```

Examples:

```text
Loading registration...
Processing payment...
Registration opening soon
This event is full.
Your team is already registered.
Payment could not be verified.
```

---

# 63. Error Handling

Never expose raw database/provider errors.

Use user-friendly messages:

```text
Something went wrong.
Please try again.

This event is full.

This registration window has closed.

Your team is already registered.

Payment could not be verified.

This invitation has expired.
```

---

# 64. Security

Mandatory:

```text
Supabase RLS
Server-side validation
Protected admin routes
Role-based access
Payment verification
Private documents
Rate limiting where needed
No secret keys in frontend
Environment variables
Input validation
Duplicate prevention
Audit logging
```

---

# 65. Environment Variables

Frontend:

```text
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
```

Server secrets must NEVER be exposed to the browser.

Payment secrets belong in server/Supabase/Vercel environment configuration.

Example:

```text
RAZORPAY_KEY_ID
RAZORPAY_KEY_SECRET
```

---

# 66. Admin Security

Never use:

```text
localStorage.role = "admin"
```

Admin authorization must be verified using:

```text
Supabase Auth
+
database role
+
RLS
```

---

# 67. Initial Event Data

Use the five ANVESHAN reference events only as temporary examples/schema validation:

```text
CHAKAVA
Category: Cultural / Team

ML MANIA
Category: AI / ML / Technical

SAMBHASHINI
Category: Cultural / Language

SPIKE SHOWDOWN
Category: Gaming / Esports

LOGIC LAMP
Category: Coding / Technical
```

These should eventually be replaced by our original event names/content.

Do not copy ANVESHAN branding, posters, contact information, or rulebook text.

---

# 68. Event Content Schema

Every event supports:

```text
name
slug
category
shortDescription
description
poster
date
startTime
endTime
venue
teamBased
minTeamSize
maxTeamSize
prizePool
internalFee
externalFee
capacity
registrationStatus
rounds
rules
rulebook
coordinators
```

---

# 69. Development Phases

## Phase 1 — UI

```text
Design system
Homepage
Navigation
Events
Event details
Animations
```

## Phase 2 — Supabase

```text
Database
Auth
Profiles
Events
Storage
RLS
```

## Phase 3 — Registration

```text
Registration engine
Teams
Members
Verification
Documents
```

## Phase 4 — Payment

```text
Payment integration
Webhook verification
Confirmation
QR
```

## Phase 5 — Dashboard

```text
Participant dashboard
Pass
Team
Payments
Notifications
```

## Phase 6 — Admin

```text
Events
Registrations
Teams
Payments
Check-in
Results
```

## Phase 7 — Finishing

```text
Certificates
Announcements
Analytics
Accessibility
Performance
```

---

# 70. MVP Requirements

The first working version must have:

```text
✓ Interactive homepage
✓ Event catalogue
✓ Event detail pages
✓ Supabase database
✓ Supabase authentication
✓ Native registration
✓ Team creation
✓ Member addition
✓ Registration status
✓ Confirmation
✓ Participant dashboard
✓ Admin event management
```

Payment can initially be test-mode/mock while UI and backend are being developed.

---

# 71. Definition of Done

A participant must be able to:

```text
Open website
 ↓
Explore interactive world
 ↓
See all events
 ↓
Open an event
 ↓
Read details/rules
 ↓
Activate registration
 ↓
Sign up/login
 ↓
Create team
 ↓
Add members
 ↓
Verify members where required
 ↓
Upload documents
 ↓
Review registration
 ↓
Pay if required
 ↓
Receive confirmed registration
 ↓
Get registration ID
 ↓
Get QR pass
 ↓
Open dashboard
 ↓
View event/team/payment status
 ↓
Attend event
 ↓
Scan QR
 ↓
View result
 ↓
Receive certificate
```

Admin must be able to:

```text
Login
 ↓
Create/manage events
 ↓
Manage registrations
 ↓
Manage teams
 ↓
View payments
 ↓
Scan/check-in participants
 ↓
Publish results
 ↓
Generate certificates
 ↓
Send announcements
 ↓
Export data
```

---

# 72. Final UX Principle

> **Do not make the user feel like they are filling out a website form. Make them feel like they are entering an event.**

Normal:

```text
Register Now → Form → Submit
```

Our platform:

```text
Find Mission
 ↓
Inspect Mission
 ↓
Activate Registration Terminal
 ↓
Build Team
 ↓
Verify Members
 ↓
Accept Mission
 ↓
Payment
 ↓
Mission Accepted
 ↓
Receive Pass
```

---

# 73. Final Architecture

```text
                         USER
                          │
                          ▼
                 ┌─────────────────┐
                 │   INTERACTIVE   │
                 │   EVENT WORLD   │
                 └────────┬────────┘
                          │
             ┌────────────┼────────────┐
             ▼            ▼            ▼
          EVENTS       PROFILE      REGISTER
             │                         │
             ▼                         ▼
        EVENT WORLD              REGISTRATION
             │                    TERMINAL
             │                         │
             └────────────┬────────────┘
                          ▼
                    BACKEND / SUPABASE
                          │
              ┌───────────┼───────────┐
              ▼           ▼           ▼
            USERS       EVENTS      TEAMS
                                      │
                                      ▼
                                REGISTRATIONS
                                      │
                              ┌───────┴───────┐
                              ▼               ▼
                          PAYMENTS         CHECK-IN
                              │               │
                              └───────┬───────┘
                                      ▼
                              PARTICIPANT
                               DASHBOARD
                                      │
                                      ▼
                               QR / PASS /
                               CERTIFICATE
```

---

# 74. AI Builder Instructions

When given this file, the AI building the project must:

1. Understand the complete architecture before coding.
2. Do not generate a generic event website.
3. Build the interactive world first.
4. Use Supabase as the backend.
5. Never use Google Forms.
6. Build native registration.
7. Use Supabase Auth.
8. Use PostgreSQL tables for users, events, teams, registrations, payments, check-ins and results.
9. Use RLS.
10. Use Supabase Storage.
11. Use Edge Functions for sensitive operations.
12. Keep payment logic server-side.
13. Make the registration wizard reusable.
14. Make event team sizes and fees configurable.
15. Make the admin dashboard functional.
16. Make every important UI state.
17. Make it responsive.
18. Keep animations performant.
19. Do not copy Among Us or ANVESHAN assets/branding.
20. Create original visual identity.
21. Do not invent hidden functionality from reference websites.
22. Prioritize usability over excessive animation.
23. Treat this document as the product/build specification, not merely visual inspiration.

**Core objective:**

> Build a production-structured interactive tech-fest platform where exploring and registering for events feels like interacting with a game world, while Supabase provides the real backend infrastructure.
