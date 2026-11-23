# FRONTEND.md

# KrishiSetu – Frontend Development Specification

**Project:** KrishiSetu **Product:** Agricultural Policy, Loan & Subsidy Transparency Platform **Version:** 1.0 **Target:** 30-hour Hackathon **MVP** **Frontend Stack:** Next.js + TypeScript + Tailwind **CSS** + Shadcn/ui **Backend:** Supabase **Primary Language:** Hindi and English **Initial Region:** Chhattisgarh, India

---

# 1. Purpose of This Document

This document defines the complete frontend implementation requirements for KrishiSetu.

It specifies:

- All pages to develop.
- Page layouts and components.
- Data displayed on each page.
- Data collected through forms.
- User interactions.
- Navigation structure.
- Role-based page access.
- Loading, empty and error states.
- Integration requirements with backend APIs.

The development team must use this document as the frontend source of truth.

Do not create random pages or disconnected UI components. Every page must support a defined user journey and connect to the same farmer, scheme, application and benefit data.

# 2. Frontend Design Direction

## 2.1 Design Concept

Build a modern, trustworthy and farmer-friendly government service platform.

The UI should feel:

- Simple and accessible.
- Professional and reliable.
- Modern but not overly complicated.
- Suitable for rural and semi-urban users.
- Mobile-first.
- Easy to understand for users with limited digital literacy.

## 2.2 Visual Design

### Suggested color palette

| Purpose | Color |
|---|---|
| Primary | Deep Green |
| Secondary | Forest Green |
| Accent | Warm Yellow |
| Background | Off White |
| Cards | White |
| Text | Dark Charcoal |
| Success | Green |
| Warning | Amber |
| Error | Red |
| Information | Blue |

Suggested color values:

- Primary: `#**166534**`
- Secondary: `#**15803D**`
- Accent: `#**EAB308**`
- Background: `#**F8FAF5**`
- Surface: `#**FFFFFF**`
- Text: `#**1F2937**`

Use these as initial design tokens. Maintain consistent colors throughout the application.

## 2.3 Typography

- Use a clean, readable sans-serif font.
- Support Hindi/Devanagari text.
- Use large text for important financial figures.
- Use clear labels instead of complex government terminology.
- Maintain sufficient contrast and readable font sizes.

## 2.4 Responsive Design

The application must support:

- Desktop: Full sidebar and content layout.
- Tablet: Collapsible sidebar.
- Mobile: Bottom navigation or mobile drawer.
- Small screens: Single-column forms and cards.

# 3. Application User Roles

The frontend must support three user roles.

## Role 1: Farmer

Access:
- Farmer dashboard.
- Profile.
- Government schemes.
- Eligibility checker.
- Loan and subsidy calculator.
- Financial Digital Twin.
- Application tracking.
- Grievances.
- Notifications.
- **IVR** support information.

## Role 2: Government Officer

Access:
- Officer dashboard.
- Farmer records.
- Applications.
- Discrepancy alerts.
- Grievances.
- Cultivator verification.
- Reports.

## Role 3: Administrator

Access:
- Admin dashboard.
- Scheme management.
- Policy management.
- User and role management.
- Audit logs.
- System settings.

# 4. Public Pages

## Page 1: Landing Page

**Route:** `/`

### Purpose

Introduce KrishiSetu and help farmers register or log in.

### UI Components

## Navbar.

## KrishiSetu logo. ## Language selector. ## Login button. ## Register button. ## Hero section. ## Product introduction. ## Key feature cards. ## How it works section. ## IVR assistance section. ## Government scheme information section. ## Footer.

### Hero Content

Headline:

*Know Your Benefits. Track Every Rupee.*

Subheading:

"Discover government schemes, understand your agricultural benefits, track applications and access assistance through your phone."

Primary **CTA**:
- Get Started

Secondary **CTA**:
- Explore Features

### Feature Cards

- Smart Scheme Discovery.
- Eligibility Checker.
- Loan & Subsidy Calculator.
- Financial Digital Twin.
- Application Tracking.
- **IVR** Assistance.

### Data Displayed

- Product information.
- Supported languages.
- Supported regions.
- Featured schemes from the public scheme database.

### Data Collected

No farmer personal data on the landing page.

---

## Page 2: Login Page

**Route:** `/login`

### Purpose

Authenticate farmers, officers and administrators.

### UI Components

- Mobile number input.
- Send **OTP** button.
- **OTP** input.
- Verify button.
- Resend **OTP**.
- Language selector.
- Help/support link.
- Demo login option for hackathon.

### Data Collected

| Field | Type | Required |
|---|---|---|
| Mobile number | Phone | Yes |
| OTP | Numeric | Yes |

### Interactions

## User enters mobile number.

## Selects Send OTP. ## Enters received OTP. ## System verifies authentication. ## User is redirected based on role.

### Demo Requirements

Provide a clearly labelled demo authentication path for judges. Never collect real banking credentials or use a fixed production **OTP**.

---

## Page 3: Farmer Registration

**Route:** `/register`

### Purpose

Create a new farmer account.

### Form Sections

**A. Personal Information**

| Field | Type | Required |
|---|---|---|
| Full name | Text | Yes |
| Mobile number | Phone | Yes |
| Age/date of birth | Date or age | Optional |
| Gender | Select | Optional |
| Preferred language | Select | Yes |

**B. Location Information**

| Field | Type | Required |
|---|---|---|
| State | Select | Yes |
| District | Select | Yes |
| Block | Select | Yes |
| Village | Select | Yes |
| PIN code | Text | Optional |

**C. Farmer Information**

| Field | Type | Required |
|---|---|---|
| Farmer category | Select | Yes |
| Farmer ID, if available | Text | No |
| Cultivator status | Select | Yes |
| Landholding area | Number | Yes |

### Cultivator Status Options

- Landowner.
- Tenant farmer.
- Sharecropper.
- Joint landholder.
- Land mutation pending.
- Other.

### Interactions

- Validate required fields.
- Allow location selection.
- Save farmer profile.
- Generate unique KrishiSetu Farmer ID.
- Redirect to profile completion.

---

# 5. Farmer Portal Pages

All farmer pages must use a shared authenticated layout.

## Farmer Layout

**Route prefix:** `/farmer`

### Sidebar Navigation

## Dashboard.

## My Profile. ## Find Schemes. ## Eligibility Checker. ## Loan & Subsidy Calculator. ## My Benefits. ## Application Tracking. ## Grievances. ## Notifications. ## IVR Support. ## Settings.

### Shared Header

Display:

- KrishiSetu logo.
- Page title.
- Language selector.
- Notification icon.
- Farmer name.
- Farmer profile menu.

---

## Page 4: Farmer Dashboard

**Route:** `/farmer/dashboard`

### Purpose

Provide a complete overview of the farmer's government benefit situation.

### Sections

**A. Welcome Section**

Display:
- Farmer name.
- Farmer ID.
- Village and district.
- Profile completion percentage.
- Current date.

**B. Financial Overview Cards**

Display:

| Card | Data |
|---|---|
| Potential Benefits | Estimated potentially available benefits |
| Applications | Total recorded applications |
| Sanctioned Amount | Total recorded sanctioned amount |
| Received Amount | Confirmed recorded receipts |
| Pending Actions | Outstanding farmer tasks |

Never merge potential, sanctioned and received amounts into one financial total.

**C. Recommended Schemes**

Each card shows:
- Scheme name.
- Benefit type.
- Eligibility result.
- Short description.
- View details button.

**D. Application Overview**

Display:
- Application name.
- Reference number.
- Current status.
- Submission date.
- View details.

**E. Recent Activities**

Display:
- Profile updates.
- Scheme discoveries.
- Application status changes.
- Grievance updates.

**F. Quick Actions**

Buttons:
- Find Schemes.
- Calculate Benefits.
- Track Application.
- Raise Grievance.

### Data Required

- Farmer profile.
- Eligibility results.
- Benefit ledger.
- Applications.
- Notifications.
- Recent activity records.

---

## Page 5: My Profile

**Route:** `/farmer/profile`

### Purpose

Allow farmers to view and update their personal and agricultural information.

### Sections

**A. Personal Details**

Display and collect:
- Full name.
- Mobile number.
- Age/date of birth, if provided.
- Gender, if provided.
- Preferred language.

**B. Location Details**

- State.
- District.
- Block.
- Village.
- **PIN** code.

**C. Agricultural Details**

- Total landholding.
- Cultivated land area.
- Crop types.
- Farming season.
- Irrigation type.
- Farming category.

**D. Cultivator Information**

- Landowner/tenant/sharecropper.
- Land record status.
- Cultivation declaration.
- Verification status.

**E. Documents**

- Land record.
- Cultivation evidence.
- Farmer ID document, where appropriate.
- Other scheme-specific supporting documents.

### Actions

- Edit profile.
- Save changes.
- Upload document.
- Remove or replace an uploaded document.
- Submit cultivator verification request.

### Display

Show a profile completion progress bar and missing information.

---

## Page 6: Government Scheme Directory

**Route:** `/farmer/schemes`

### Purpose

Allow farmers to explore available government agricultural schemes.

### UI Components

- Search bar.
- Scheme category filters.
- State filter.
- Eligibility filter.
- Scheme cards.
- Sort options.

### Filters

- Central schemes.
- Chhattisgarh schemes.
- Loan schemes.
- Subsidy schemes.
- Insurance schemes.
- Income support.
- Equipment support.

### Scheme Card Data

Each card must display:

- Scheme name.
- Scheme department.
- Scheme category.
- Short description.
- Benefit information.
- Eligibility status, if available.
- Last updated date.
- View Details button.

### Search Data Collected

- Search query.
- Selected filters.

### Scheme Details Route

`/farmer/schemes/[schemeId]`

Display:

## Scheme title.

## Description. ## Department. ## Scheme benefits. ## Eligibility requirements. ## Required documents. ## Application process. ## Official application link. ## Policy source. ## Last updated date. ## Check My Eligibility button. ## Save Scheme button.

### Important

All scheme information must be linked to a source and policy version. Do not invent scheme rules or show unverified rates as official.

---

## Page 7: Eligibility Checker

**Route:** `/farmer/eligibility`

### Purpose

Determine whether the farmer's available profile information matches scheme eligibility rules.

### UI Components

- Scheme selector.
- Farmer profile summary.
- Eligibility result.
- Condition breakdown.
- Missing information.
- Recommended next steps.

### Data Used

- Farmer location.
- Landholding.
- Cultivator status.
- Crop.
- Farmer category.
- Scheme eligibility rules.
- Other applicable scheme conditions.

### Result Statuses

**Potentially Eligible**
- Display matching conditions.
- Show next steps.

**Not Eligible Based on Available Information**
- Display unmet criteria.
- Explain the reason.

**Additional Verification Required**
- Show documents or verification needed.

**Incomplete Information**
- Show missing profile fields.

### Actions

- Update profile.
- Upload documents.
- View scheme.
- Proceed to official application.

### Data Collected

- Selected scheme.
- Additional scheme-specific answers.
- Documents, if required.

### Result Page

`/farmer/eligibility/[resultId]`

Display:
- Scheme name.
- Evaluation date.
- Result status.
- Conditions checked.
- Conditions satisfied.
- Conditions not satisfied.
- Missing information.
- Policy version and source.

---

## Page 8: Loan & Subsidy Calculator

**Route:** `/farmer/calculator`

### Purpose

Estimate possible agricultural credit and subsidy benefits using configured policy rules.

### Calculator Categories

## KCC information and calculator.

## Interest support. ## Equipment subsidy. ## Irrigation subsidy. ## Other configured agricultural subsidies.

### Form Fields

| Field | Type |
|---|---|
| Scheme/category | Select |
| Crop type | Select |
| Cultivated area | Number |
| Loan amount | Number, when applicable |
| Equipment type | Select, when applicable |
| Financial year | Select |
| State | From farmer profile |

### Result Display

- Input summary.
- Applicable policy rule.
- Estimated benefit.
- Farmer contribution.
- Interest calculation, where relevant.
- Calculation breakdown.
- Policy reference.
- Disclaimer.

### Actions

- Calculate.
- Recalculate.
- Save calculation.
- Download estimate.
- View related scheme.

### Data Stored

- Farmer ID.
- Calculator type.
- Input values.
- Calculated result.
- Policy version.
- Calculation date.

---

## Page 9: My Benefits – Financial Digital Twin

**Route:** `/farmer/benefits`

### Purpose

Provide a consolidated view of all farmer benefits and financial records.

This is the primary product differentiator.

### Overview Cards

- Potential Benefits.
- Applied Amount.
- Approved Amount.
- Sanctioned Amount.
- Disbursed Amount.
- Confirmed Received Amount.

### Benefit Status Filters

- All.
- Potentially Eligible.
- Applied.
- Approved.
- Sanctioned.
- Disbursed.
- Received.
- Verification Required.

### Benefit Cards

Each benefit card must show:

- Scheme name.
- Scheme category.
- Expected/estimated amount.
- Applied amount, if recorded.
- Approved amount, if recorded.
- Sanctioned amount, if recorded.
- Disbursed amount, if recorded.
- Received amount, if verified.
- Current status.
- Last updated date.

### Benefit Detail Route

`/farmer/benefits/[benefitId]`

Display:

## Scheme details.

## Farmer benefit information. ## Amount breakdown. ## Benefit timeline. ## Supporting records. ## Discrepancy alerts. ## Recommended action. ## Related application. ## Raise Grievance button.

### Timeline Statuses

- Eligibility identified.
- Application submitted.
- Application approved.
- Amount sanctioned.
- Amount disbursed.
- Amount received/verified.

### Data Requirements

- Benefit ledger.
- Application records.
- Sanction records.
- Transaction records.
- Verification records.

### Important UI Rule

Clearly distinguish:

- Estimated amounts.
- Farmer-reported amounts.
- Officer-verified amounts.
- System-recorded amounts.
- Confirmed receipts.

---

## Page 10: Application Tracking

**Route:** `/farmer/applications`

### Purpose

Track applications submitted through available official channels and recorded in KrishiSetu.

### Main Page

Display:

- Total applications.
- Under review.
- Approved.
- Rejected.
- Completed.

### Application Table

| Column | Data |
|---|---|
| Scheme | Scheme name |
| Reference | Application number |
| Submitted | Submission date |
| Status | Current status |
| Last Updated | Latest update |
| Action | View Details |

### Add Application Form

Fields:

- Scheme.
- Application reference number.
- Submission date.
- Application channel.
- Current known status.
- Supporting document.
- Optional remarks.

### Application Detail Page

`/farmer/applications/[applicationId]`

Display:

- Scheme information.
- Reference number.
- Submission date.
- Current status.
- Document status.
- Application timeline.
- Rejection reason, if available.
- Pending action.
- Supporting documents.
- Related benefit record.

### Actions

- Add application.
- Update permitted farmer-entered information.
- Upload supporting document.
- View status history.
- Raise grievance.

---

## Page 11: Grievances

**Route:** `/farmer/grievances`

### Purpose

Allow farmers to create and track complaints related to agricultural benefits.

### Grievance Categories

- Payment not received.
- Incorrect subsidy amount.
- Application delayed.
- Application rejected.
- Eligibility issue.
- Land or cultivator verification issue.
- **KCC** or bank-related issue.
- Other.

### Main Page

Display:
- Total grievances.
- Submitted.
- Under review.
- Resolved.
- Rejected/closed.

### Create Grievance Page

**Route:** `/farmer/grievances/new`

Fields:

| Field | Type |
|---|---|
| Complaint category | Select |
| Related scheme | Select |
| Application reference | Select/input |
| Description | Textarea |
| Supporting documents | File upload |
| Preferred contact method | Select |

### AI-Assisted Description

The system may generate a complaint draft using available farmer information.

Display:
- Generated description.
- Edit option.
- Preview.
- Confirm and submit button.

The farmer must review the complaint before submission.

### Grievance Detail Page

`/farmer/grievances/[grievanceId]`

Display:

- Complaint reference.
- Category.
- Description.
- Submission date.
- Current status.
- Related application.
- Uploaded documents.
- Officer remarks, where authorized.
- Status timeline.

### Actions

- Submit grievance.
- View complaint.
- Download complaint summary.
- Add requested information.
- Track status.

---

## Page 12: Notifications

**Route:** `/farmer/notifications`

### Purpose

Show important updates related to the farmer account.

### Notification Categories

- Application updates.
- Payment updates.
- Scheme updates.
- Missing documents.
- Grievance updates.
- Profile verification.
- General announcements.

### Each Notification Shows

- Title.
- Message.
- Date and time.
- Category.
- Read/unread status.
- Related record link.

### Actions

- Mark as read.
- Mark all as read.
- Open related application or benefit.
- Notification preferences.

---

## Page 13: IVR Support

**Route:** `/farmer/ivr`

### Purpose

Explain how farmers can access KrishiSetu through a phone call.

### UI Components

- **IVR** introduction.
- Phone number or demo-call entry point.
- Supported languages.
- Keypad menu explanation.
- Available services.
- How to use **IVR** instructions.

### Menu Display

| Key | Service |
|---|---|
| 1 | Scheme information |
| 2 | Eligibility information |
| 3 | Loan and subsidy information |
| 4 | Application status (SMS OTP) |
| 5 | Benefit and payment records (SMS OTP) |
| 6 | Register grievance (SMS OTP and confirmation) |
| 7 | Request officer callback (SMS OTP and confirmation) |
| 9 | Repeat menu |
| 0 | End call |

### Optional Demo Mode

Provide a simulated **IVR** interface with keypad buttons for judges when a live telephony integration is unavailable.

Do not present a simulated call as a real phone connection.
In the browser simulator, only policy-query keys are simulated; private account
actions remain exclusive to a configured phone call and are never represented
as completed by the simulator.

---

## Page 14: Farmer Settings

**Route:** `/farmer/settings`

### Sections

- Account information.
- Language preferences.
- Notification preferences.
- Consent settings.
- Privacy information.
- Logout.

### Data Collected

- Preferred language.
- Notification preferences.
- Consent choices.

---

# 6. Government Officer Portal

**Route prefix:** `/officer`

Use a separate dashboard layout with role-based access.

## Officer Layout

### Sidebar

## Overview.

## Farmers. ## Applications. ## Discrepancy Alerts. ## Grievances. ## Cultivator Verification. ## Reports. ## Settings.

---

## Page 15: Officer Dashboard

**Route:** `/officer/dashboard`

### Overview Cards

- Total registered farmers.
- Total applications.
- Pending reviews.
- Discrepancy alerts.
- Open grievances.
- Verification requests.

### Charts

- Applications by status.
- Scheme-wise applications.
- District-wise registrations.
- Grievance status.
- Discrepancy categories.

### Recent Activity

Display:
- New grievances.
- Newly flagged discrepancies.
- Pending verification requests.
- Recent officer actions.

### Filters

- State.
- District.
- Block.
- Scheme.
- Date range.
- Status.

---

## Page 16: Farmer Management

**Route:** `/officer/farmers`

### Table Columns

- Farmer ID.
- Farmer name.
- Village.
- District.
- Cultivator status.
- Profile verification.
- Application count.
- Action.

### Farmer Detail

`/officer/farmers/[farmerId]`

Display:
- Personal details, as permitted.
- Location.
- Agricultural profile.
- Land and cultivator information.
- Documents.
- Applications.
- Benefit ledger.
- Grievances.
- Verification history.

### Actions

- View profile.
- Review documents.
- Add remarks.
- Update authorized verification status.

---

## Page 17: Application Management

**Route:** `/officer/applications`

### Display

- Application reference.
- Farmer.
- Scheme.
- Submission date.
- Current status.
- Pending days, if known.
- Action.

### Application Detail

`/officer/applications/[applicationId]`

Display:
- Application information.
- Farmer information.
- Supporting documents.
- Recorded status history.
- Related benefit.
- Pending verification.

### Actions

- Review application.
- Request more information.
- Add officer remarks.
- Update review status.
- Record decision.

Only authorized officers can update official review statuses.

---

## Page 18: Discrepancy Alerts

**Route:** `/officer/discrepancies`

### Purpose

Review potential inconsistencies detected by the Policy-to-Payment Integrity Engine.

### Alert Cards

Display:

- Alert ID.
- Farmer ID.
- Farmer name.
- Scheme.
- Discrepancy category.
- Expected amount.
- Recorded amount.
- Difference.
- Severity.
- Created date.
- Review status.

### Filters

- Pending.
- Under Review.
- Verified.
- Dismissed.
- Scheme.
- District.
- Alert type.

### Detail Page

`/officer/discrepancies/[alertId]`

Display:

## Farmer profile.

## Related scheme. ## Policy version. ## Calculation breakdown. ## Recorded amount. ## Difference. ## Supporting records. ## Alert explanation. ## Previous review history.

### Actions

- Mark under review.
- Request additional evidence.
- Mark verified.
- Dismiss alert.
- Add remarks.

Every decision must be logged.

---

## Page 19: Grievance Management

**Route:** `/officer/grievances`

### Table Columns

- Complaint reference.
- Farmer.
- Complaint category.
- Scheme.
- Submitted date.
- Priority.
- Status.
- Action.

### Grievance Detail

`/officer/grievances/[grievanceId]`

Display:
- Complaint description.
- Farmer information.
- Related application.
- Documents.
- Status timeline.
- Previous remarks.

### Actions

- Assign/review case.
- Add remarks.
- Request additional documents.
- Update status.
- Record resolution.

---

## Page 20: Cultivator Verification

**Route:** `/officer/verifications`

### Display

- Farmer ID.
- Farmer name.
- Cultivator type.
- Village.
- Evidence submitted.
- Verification status.
- Submission date.

### Verification Detail

`/officer/verifications/[verificationId]`

Display:
- Farmer profile.
- Declared cultivator status.
- Submitted evidence.
- Land record information where available.
- Previous review history.

### Actions

- Request more information.
- Mark verified.
- Reject with reason.
- Add remarks.

---

## Page 21: Reports

**Route:** `/officer/reports`

### Reports

- Farmer registration statistics.
- Scheme-wise applications.
- Application status distribution.
- Benefit distribution records.
- Discrepancy statistics.
- Grievance resolution statistics.
- Cultivator verification statistics.

### Actions

- Filter report.
- View charts.
- Export **CSV**.

Reports must only use records the officer is authorized to access.

---

# 7. Administrator Portal

**Route prefix:** `/admin`

## Page 22: Admin Dashboard

**Route:** `/admin/dashboard`

Display:
- Total users.
- Total farmers.
- Total officers.
- Active schemes.
- Policy versions.
- Open discrepancies.
- Platform activity.

## Page 23: Scheme Management

**Route:** `/admin/schemes`

Actions:
- Create scheme.
- Edit scheme.
- Archive scheme.
- Update source.
- Update scheme category.
- Manage application links.
- Set state applicability.
- Set effective dates.

## Page 24: Policy Rule Management

**Route:** `/admin/policies`

Actions:
- Create policy version.
- Add eligibility conditions.
- Configure calculation rules.
- Set financial year.
- Set state and category conditions.
- Activate/deactivate a policy.
- View version history.

Policy changes must preserve old versions for historical calculations.

## Page 25: User and Role Management

**Route:** `/admin/users`

Display:
- User ID.
- Name.
- Role.
- Account status.
- Creation date.

Actions:
- Assign authorized roles.
- Activate/deactivate accounts.
- View access history.

## Page 26: Audit Logs

**Route:** `/admin/audit-logs`

Display:
- User.
- Action.
- Entity affected.
- Timestamp.
- Previous value.
- New value, where appropriate.

---

# 8. Shared UI Components

Build reusable components instead of duplicating page layouts.

## Layout Components

- `PublicLayout`
- `FarmerLayout`
- `OfficerLayout`
- `AdminLayout`
- `Sidebar`
- `Header`
- `MobileNavigation`
- `Breadcrumbs`

## Dashboard Components

- `StatCard`
- `RecentActivity`
- `NotificationPanel`
- `QuickActionCard`
- `StatusBadge`
- `DataTable`
- `EmptyState`
- `LoadingSkeleton`

## Farmer Components

- `FarmerProfileCard`
- `SchemeCard`
- `SchemeFilters`
- `EligibilityResultCard`
- `BenefitCard`
- `BenefitTimeline`
- `ApplicationCard`
- `GrievanceCard`
- `DocumentUploader`
- `FarmerSummary`

## Officer Components

- `OfficerStatCard`
- `DiscrepancyAlertCard`
- `ReviewPanel`
- `OfficerActionForm`
- `VerificationStatus`
- `OfficerRemarks`

## Form Components

- `PhoneInput`
- `OTPInput`
- `LocationSelector`
- `LanguageSelector`
- `CropSelector`
- `FarmerCategorySelector`
- `CultivatorStatusSelector`
- `FileUpload`
- `DateInput`
- `CurrencyInput`

---

# 9. Frontend Data Contracts

The frontend must use typed TypeScript interfaces for backend communication.

Suggested initial types:

```typescript type UserRole = *farmer* | *officer* | *admin*;

type EligibilityStatus =
    | *potentially_eligible*
    | *not_eligible*
    | *verification_required*
    | *incomplete_information*;

type BenefitStatus =
    | *potentially_eligible*
    | *applied*
    | *approved*
    | *sanctioned*
    | *disbursed*
    | *received*
    | *rejected*
    | *not_verified*;

type ApplicationStatus =
    | *submitted*
    | *under_review*
    | *documents_required*
    | *approved*
    | *rejected*
    | *completed*;

type GrievanceStatus =
    | *submitted*
    | *under_review*
    | *information_required*
    | *resolved*
    | *closed*;

interface Farmer {
    id: string;
    farmerId: string;
    fullName: string;
    mobileNumber: string;
    preferredLanguage: string;
    state: string;
    district: string;
    block: string;
    village: string;
    cultivatorStatus: string;
    cultivatedArea: number;
    crops: string[];
}

interface Scheme {
    id: string;
    name: string;
    department: string;
    category: string;
    description: string;
    state: string[];
    eligibilitySummary: string;
    requiredDocuments: string[];
    benefitDescription: string;
    officialUrl?: string;
    policyVersion: string;
    lastUpdated: string;
}

interface BenefitRecord {
    id: string;
    farmerId: string;
    schemeId: string;
    estimatedAmount?: number;
    appliedAmount?: number;
    approvedAmount?: number;
    sanctionedAmount?: number;
    disbursedAmount?: number;
    receivedAmount?: number;
    status: BenefitStatus;
    verificationStatus: string;
    updatedAt: string;
}

interface Application {
    id: string;
    farmerId: string;
    schemeId: string;
    referenceNumber: string;
    submittedAt: string;
    status: ApplicationStatus;
    remarks?: string;
}

interface Grievance {
    id: string;
    farmerId: string;
    referenceNumber: string;
    category: string;
    description: string;
    status: GrievanceStatus;
    createdAt: string;
}
```

Extend these interfaces based on the actual Supabase schema. Avoid using `any` for application data.

---

# 10. Frontend Routing Structure

Implement the following route structure:

```text
/
├── login
├── register
│
├── farmer
│   ├── dashboard
│   ├── profile
│   ├── schemes
│   │   └── [schemeId]
│   ├── eligibility
│   │   └── [resultId]
│   ├── calculator
│   ├── benefits
│   │   └── [benefitId]
│   ├── applications
│   │   └── [applicationId]
│   ├── grievances
│   │   ├── new
│   │   └── [grievanceId]
│   ├── notifications
│   ├── ivr
│   └── settings
│
├── officer
│   ├── dashboard
│   ├── farmers
│   │   └── [farmerId]
│   ├── applications
│   │   └── [applicationId]
│   ├── discrepancies
│   │   └── [alertId]
│   ├── grievances
│   │   └── [grievanceId]
│   ├── verifications
│   │   └── [verificationId]
│   └── reports
│
└── admin
    ├── dashboard
    ├── schemes
    ├── policies
    ├── users
    ├── audit-logs
    └── settings
```

Use Next.js App Router conventions and protected route layouts.

---

# 11. Frontend State and Interaction Requirements

Use:

- React state for local interactions.
- React Hook Form for forms.
- Zod for validation.
- TanStack Query or an equivalent approach for server state.
- Supabase client for authentication and authorized data access.

### Every form must support

- Required-field validation.
- Clear error messages.
- Loading state.
- Successful submission feedback.
- Duplicate submission prevention.
- Proper mobile layout.

### Every data page must support

- Loading state.
- Error state.
- Empty state.
- Refresh/retry.
- Pagination where needed.
- Search/filter where appropriate.

### Important

Do not hardcode dashboard totals or status values when backend records are available.

Do not use mock data as a fallback that silently appears to be real. Demo data must be explicitly labelled.

---

# 12. Internationalization

Support:

- English.
- Hindi.

Prepare the frontend for Chhattisgarhi language support as a future extension.

Requirements:

- Language selector in the shared header.
- Store preferred language in farmer profile.
- Translate labels and navigation.
- Support Devanagari font rendering.
- Keep numbers and currency formatting readable.
- Ensure **IVR** language selection matches the platform preference where possible.

---

# 13. Frontend Development Priority

The development team must implement pages in the following order.

## Phase 1 – Foundation

## Landing page.

## Login. ## Farmer registration. ## Farmer layout. ## Farmer profile. ## Farmer dashboard.

## Phase 2 – Core Features

## Scheme directory.

## Scheme detail. ## Eligibility checker. ## Loan and subsidy calculator. ## Financial Digital Twin. ## Application tracking.

## Phase 3 – Differentiators

## Policy discrepancy detail.

## Grievance creation and tracking. ## Cultivator verification. ## IVR support page.

## Phase 4 – Officer Portal

## Officer dashboard.

## Farmer management. ## Application management. ## Discrepancy management. ## Grievance management. ## Reports.

## Phase 5 – Admin and Polish

## Admin dashboard.

## Scheme management. ## Policy management. ## User management. ## Audit logs. ## Responsive and accessibility testing.

---

# 14. Frontend Acceptance Criteria

The frontend is complete when:

- All required routes exist.
- Navigation works correctly.
- Farmer and officer layouts are separate.
- All forms collect the specified data.
- All major pages display backend data.
- Role-based route protection works.
- Dashboard figures come from real records or clearly labelled demo records.
- Scheme details include source information.
- Eligibility results show explanations.
- Calculator results show calculation details.
- Benefit statuses remain separate.
- Grievances can be created and tracked.
- Officer review actions update the relevant records.
- **IVR** menu information is accessible.
- Mobile and desktop layouts work.
- Loading, error and empty states are implemented.
- No primary **CTA** is decorative or non-functional.

---

# 15. Development Rules for AI Coding Agents

## Read `AGENTS.md` or `agent.md` before modifying the project.

## Read this `FRONTEND.md` before building any frontend page. ## Inspect the existing repository before making changes. ## Preserve existing working functionality. ## Do not redesign completed pages without a requirement. ## Build reusable components. ## Use TypeScript and strict typing. ## Do not duplicate business logic in the frontend. ## Eligibility and financial calculations must be handled by backend business logic. ## Never expose Supabase service-role keys in the browser. ## Use role-based access control. ## Use real API/database integration wherever available. ## Label all synthetic data clearly. ## Validate every form. ## Test every major user journey. ## Update `AGENTS.md` or `agent.md` after every completed task. ## Record completed pages, pending pages, bugs and test results. ## Do not mark a feature complete until it has been tested.

# 16. Definition of Done

A frontend feature is complete only when:

- Its page has been implemented.
- Its UI matches the design system.
- Required data is displayed.
- Required inputs are collected.
- Backend integration works or the demo limitation is explicitly documented.
- Form validation works.
- Loading, empty and error states work.
- Mobile responsiveness is verified.
- Navigation and actions work.
- Relevant tests pass.
- Project documentation is updated.

**Final Frontend Goal:**

Deliver a complete, responsive and functional KrishiSetu frontend where a farmer can register, manage their agricultural profile, discover schemes, check eligibility, calculate benefits, track financial records, raise grievances and access **IVR** assistance, while authorized officers can review applications, discrepancies and complaints through a separate dashboard.