# Product Requirements Document (PRD)

## KrishiSetu – Agricultural Policy, Loan & Subsidy Transparency Platform

**Version:** 1.0 **Product Type:** Web Application + **IVR**-Based Farmer Assistance Platform **Target Market:** India, initially focused on Chhattisgarh **Development Timeline:** 30-hour Hackathon **MVP** **Primary Users:** Farmers, Government Officers, Administrators

---

# 1. Product Overview

## 1.1 Product Name

**KrishiSetu**

**Tagline:** Every Farmer Deserves to Know What They Are Owed.

## 1.2 Product Vision

KrishiSetu is a farmer-centric agricultural policy, loan and subsidy transparency platform that helps farmers discover government schemes, understand their potential eligibility, calculate agricultural benefits, track applications and payments, and raise grievances.

The platform combines a web-based farmer portal, a financial benefit tracking system, a policy integrity engine, and an **IVR** telephone interface to make agricultural support information accessible to farmers, including those with limited digital literacy.

## 1.3 Problem Statement

Indian farmers often face difficulties understanding and accessing government agricultural schemes, loans and subsidies.

Major challenges include:

- Lack of awareness about available government schemes.
- Confusing eligibility requirements.
- Difficulty understanding loan and subsidy calculations.
- Lack of transparency in application and payment status.
- Difficulty identifying delayed or potentially incorrect benefit amounts.
- Limited access to digital platforms among rural farmers.
- Complicated grievance submission processes.
- Exclusion risks for tenant farmers and sharecroppers.

Existing systems provide scheme information and application services, but farmers may still struggle to understand their overall benefit situation across different schemes.

## 1.4 Proposed Solution

KrishiSetu provides a unified platform with five major capabilities:

1. **Smart Scheme Discovery:** Find government schemes based on farmer profiles.
2. **Eligibility and Benefit Calculator:** Understand potential eligibility and estimated financial benefits.
3. **Farmer Financial Digital Twin:** Track potential, applied, approved, sanctioned, disbursed and received benefits separately.
4. **Policy-to-Payment Integrity Engine:** Identify discrepancies in available records and generate explainable alerts.
5. **Voice-Based **IVR** Access:** Allow farmers to access important information through ordinary phone calls.

---

# 2. Product Objectives

The primary objectives are:

- Simplify government scheme discovery.
- Improve awareness of agricultural loans and subsidies.
- Provide transparent benefit calculations.
- Maintain a consolidated farmer benefit history.
- Identify possible payment and application discrepancies.
- Simplify grievance generation and tracking.
- Make platform services accessible through **IVR**.
- Help government officers review applications and grievances efficiently.

## 2.1 Success Metrics

| Metric | MVP Target |
|---|---:|
| Farmer registration | Successful end-to-end flow |
| Scheme database | 5–7 schemes |
| Eligibility checks | At least 5 working rule sets |
| Benefit calculator | At least 2 working calculation types |
| Financial Digital Twin | Complete sample farmer ledger |
| Integrity engine | At least 3 discrepancy scenarios |
| Grievance system | Complete complaint generation flow |
| IVR | Working DTMF-based call flow |
| Officer dashboard | Working review and status update |
| End-to-end demo | One complete farmer journey |

Targets are prototype goals, not claims of real-world deployment performance.

---

# 3. Target Users and User Roles

## 3.1 Farmer

The primary user of KrishiSetu.

Needs:
- Register and manage a farmer profile.
- Discover relevant government schemes.
- Check potential eligibility.
- Calculate loan and subsidy benefits.
- Track applications and payments.
- Raise complaints.
- Access information through **IVR**.

## 3.2 Government Officer

Responsible for reviewing farmer requests and complaints.

Needs:
- View registered farmers.
- Review applications and verification requests.
- Investigate discrepancy alerts.
- Review grievances.
- Update case status.
- Generate reports.

## 3.3 Administrator

Responsible for managing platform information.

Needs:
- Manage schemes and policy rules.
- Manage user roles.
- Update financial-year policy versions.
- Manage scheme data.
- Review audit logs.
- Monitor system activity.

---

# 4. Functional Requirements

## Module 1: Farmer Registration and Login

**Priority:** P0 – Must Have

### Features

- Mobile number registration.
- **OTP**-based authentication or demo **OTP** for prototype.
- Farmer name and contact details.
- State, district, block and village selection.
- Preferred language selection.
- Unique Farmer ID generation.
- Secure login and logout.
- Profile editing.

### User Flow

## Farmer opens the platform.

## Enters mobile number. ## Completes OTP verification. ## Enters personal information. ## Selects location. ## Selects preferred language. ## Submits registration. ## System generates Farmer ID. ## Farmer is redirected to the dashboard.

### Acceptance Criteria

- Farmer can register successfully.
- Duplicate mobile registrations are handled.
- Farmer receives a unique ID.
- Profile data persists after login.
- Unauthorized users cannot access another farmer's profile.

## Module 2: Farmer Profile Management

**Priority:** P0 – Must Have

### Features

- Landholding information.
- Total cultivated area.
- Land ownership status.
- Landowner, tenant farmer or sharecropper classification.
- Crop details.
- Farming season.
- Irrigation information.
- Farming category.
- Document uploads.
- Profile completion indicator.

### Acceptance Criteria

- Farmer can add and update agricultural details.
- Documents can be uploaded securely.
- Cultivator status is stored.
- Incomplete profiles are clearly identified.

## Module 3: Farmer Dashboard

**Priority:** P0 – Must Have

### Features

- Personalized welcome section.
- Farmer profile summary.
- Potential benefits overview.
- Available scheme recommendations.
- Application summary.
- Payment summary.
- Pending actions.
- Recent notifications.
- Quick access to all modules.
- **IVR** support information.

### Acceptance Criteria

- Dashboard displays data from the logged-in farmer's profile.
- Financial figures are separated by their actual status.
- Pending actions are visible.
- Dashboard works on mobile and desktop.

## Module 4: Government Scheme Directory

**Priority:** P0 – Must Have

### Features

- Central government agricultural schemes.
- Chhattisgarh state agricultural schemes.
- Scheme search and filtering.
- Scheme categories.
- Scheme description.
- Department information.
- Eligibility requirements.
- Benefit details.
- Required documents.
- Application instructions.
- Official application links.
- Policy source and last-updated date.

### Initial Scheme Categories

- Farmer income support.
- Agricultural credit.
- Crop insurance.
- Equipment subsidy.
- Irrigation support.
- Seeds and agricultural inputs.

### Acceptance Criteria

- At least 5–7 schemes are available.
- Each scheme has structured information.
- Each scheme shows its source.
- Farmers can open detailed scheme information.
- Outdated or unverified scheme information is clearly labelled.

## Module 5: Smart Eligibility Engine

**Priority:** P0 – Must Have

### Features

- Profile-based eligibility checks.
- Location-based conditions.
- Landholding conditions.
- Crop-based conditions.
- Farmer-category conditions.
- Income and other criteria where applicable.
- Required-document checks.
- Missing-information detection.
- Explainable eligibility results.

### Eligibility Statuses

- Potentially eligible.
- Not eligible based on available information.
- Additional verification required.
- Incomplete information.

### User Flow

## Farmer selects a scheme.

## System retrieves the farmer profile. ## Eligibility rules are evaluated. ## System identifies matching conditions. ## System identifies missing conditions or documents. ## Result is displayed with an explanation. ## Farmer receives recommended next steps.

### Acceptance Criteria

- Eligibility is determined by deterministic rules.
- Each result has an explanation.
- Missing information is identified.
- The system does not represent its result as an official government approval.

## Module 6: Loan and Subsidy Calculator

**Priority:** P0 – Must Have

### Features

- Kisan Credit Card information.
- Configured interest-support calculations.
- Agricultural equipment subsidy estimates.
- Irrigation subsidy estimates.
- Farmer contribution calculations.
- Estimated repayment calculations where applicable.
- Calculation breakdown.
- Policy reference.
- Save and view previous calculations.

### User Flow

## Farmer selects a loan or subsidy category.

## Enters relevant agricultural information. ## System loads the applicable policy rules. ## Calculator processes the input. ## System displays estimated benefit. ## System explains the calculation. ## Farmer saves the estimate.

### Acceptance Criteria

- Calculations use configured policy rules.
- Calculation formulas are visible.
- Financial-year and state conditions are considered.
- Estimates are not confused with sanctioned benefits.

## Module 7: Farmer Financial Digital Twin

**Priority:** P0 – Must Have – Core **USP**

### Features

Maintain a consolidated benefit ledger for every farmer.

Each benefit must have a separate status:

## Potentially eligible.

## Applied. ## Approved. ## Sanctioned. ## Disbursed. ## Received. ## Rejected or cancelled, where applicable. ## Not verified.

### Additional Features

- Total potential benefits.
- Total applications.
- Total approved amount.
- Total sanctioned amount.
- Total recorded disbursement.
- Total confirmed received amount.
- Benefit-wise history.
- Expected versus recorded comparison.
- Pending payment indicators.
- Discrepancy notifications.
- Downloadable benefit statement.

### Acceptance Criteria

- Every benefit is linked to a farmer and scheme.
- Each status is stored independently.
- Historical changes are maintained.
- Unverified amounts are never presented as confirmed receipts.
- Dashboard totals are calculated from the underlying ledger.

## Module 8: Application Tracking

**Priority:** P1 – Should Have

### Features

- Application reference number.
- Scheme selection.
- Application submission date.
- Current application status.
- Document verification status.
- Approval and rejection status.
- Recorded rejection reason.
- Pending action information.
- Application history.
- Status notifications.

### Acceptance Criteria

- Farmer can view their recorded application status.
- Status changes are reflected in the timeline.
- Officer updates are recorded.
- External application statuses are not fabricated or presented as live government data.

## Module 9: Policy-to-Payment Integrity Engine

**Priority:** P0 – Must Have – Core **USP**

### Features

- Versioned scheme policy rules.
- Financial-year-based calculations.
- Expected benefit calculation.
- Sanction amount comparison.
- Disbursement record comparison.
- Duplicate-looking record detection.
- Missing payment record alerts.
- Delayed application alerts.
- Missing document alerts.
- Explainable discrepancy reports.
- Officer verification workflow.

### Example

If the configured rules calculate an estimated benefit of ₹12,**000** and an uploaded sanction record shows ₹8,**000**:

- System identifies a ₹4,**000** difference.
- System creates a discrepancy alert.
- System shows the calculation and supporting policy rule.
- Officer reviews the case.
- Officer records the verification outcome.

### Acceptance Criteria

- Every discrepancy is explainable.
- Each alert references the relevant policy version.
- Alerts are marked pending, verified or dismissed.
- System does not automatically accuse a person or declare fraud.
- Human verification is required for resolution.

## Module 10: Grievance Management

**Priority:** P1 – Should Have

### Features

- Payment not received complaint.
- Application delayed complaint.
- Incorrect subsidy amount complaint.
- Application rejection complaint.
- Eligibility complaint.
- Land-record or cultivator complaint.
- Bank or **KCC** complaint.
- Complaint description generation.
- Supporting document uploads.
- Unique complaint reference number.
- Complaint status tracking.
- Downloadable complaint summary.

### User Flow

## Farmer selects complaint category.

## Selects related scheme. ## System retrieves relevant records. ## Farmer describes the problem. ## System generates a complaint draft. ## Farmer reviews and confirms. ## Complaint reference is generated. ## Complaint is routed to an available authorized workflow or official grievance channel.

### Acceptance Criteria

- Complaint is linked to the farmer.
- Complaint has a unique reference number.
- Complaint history is maintained.
- Farmer can track its status.
- AI-generated text is reviewed by the farmer before submission.

## Module 11: Cultivator Identity Bridge

**Priority:** P1 – Should Have – Differentiator

### Features

- Landowner identification.
- Tenant farmer classification.
- Sharecropper classification.
- Joint landholding classification.
- Mutation-pending classification.
- Cultivation declaration.
- Supporting document uploads.
- **FPO** or cooperative verification information.
- Officer verification.
- Verification status tracking.

### Acceptance Criteria

- Actual cultivator status is recorded separately from land ownership.
- Supporting evidence can be submitted.
- Officer decisions are auditable.
- The system does not override official land records or scheme eligibility rules.

## Module 12: Government Officer Dashboard

**Priority:** P1 – Should Have

### Features

- Secure officer login.
- Farmer directory.
- Scheme-wise application statistics.
- Pending application overview.
- Discrepancy alerts.
- Grievance management.
- Cultivator verification requests.
- Case review.
- Status updates.
- District-level reports.
- Data export.

### Acceptance Criteria

- Only authorized officers can access the dashboard.
- Officers can view permitted records.
- Status changes are recorded with timestamps.
- Important actions are included in audit logs.

## Module 13: IVR Telephone Assistance

**Priority:** P0 – Must Have – Accessibility **USP**

### Features

- Incoming call handling.
- Hindi and English language selection.
- Registered mobile number identification.
- Configured identity verification.
- **DTMF** keypad navigation.
- Personalized scheme information.
- Loan and subsidy information.
- Application status.
- Payment status.
- Complaint registration.
- Complaint reference playback.
- **SMS** confirmation.

### IVR Menu

| Key | Service |
|---|---|
| 1 | Government scheme information |
| 2 | Loan and subsidy information |
| 3 | Application status |
| 4 | Payment status |
| 5 | Register a complaint |
| 9 | Repeat menu |

### Acceptance Criteria

- Calls reach the configured **IVR** system.
- Farmer can select a language.
- Keypad inputs trigger the correct backend action.
- The system reads available farmer information.
- Unverified information is communicated as unverified.
- Failed calls or invalid selections have a fallback.

### MVP Implementation

Use recorded prompts and **DTMF**-based interaction first. Natural-language voice AI, speech recognition and Chhattisgarhi speech support are optional extensions.

## Module 14: Notification System

**Priority:** P2 – Nice to Have

### Features

- Registration acknowledgement.
- Application updates.
- Missing document reminders.
- Payment status updates.
- Grievance updates.
- Scheme deadline reminders.
- **SMS** integration.
- **IVR** notification support where configured.

## Module 15: Security and Administration

**Priority:** P0 – Must Have

### Features

- Role-based access control.
- Farmer data isolation.
- Secure authentication.
- Consent management.
- Protected document access.
- Input validation.
- Audit logs.
- Scheme policy version management.
- Secure **API** endpoints.
- Environment variable management.
- Error handling.

---

# 5. End-to-End User Journey

## Primary Farmer Journey

## Farmer opens KrishiSetu.

## Registers using mobile number. ## Selects preferred language. ## Completes farmer profile. ## Adds location, landholding and crop details. ## Identifies cultivator status. ## Opens personalized dashboard. ## Discovers available government schemes. ## Checks potential eligibility. ## Calculates loan and subsidy estimates. ## Views the Financial Digital Twin. ## Adds an existing application reference or supporting record. ## Tracks application and payment status. ## System detects possible discrepancies. ## Farmer generates a grievance. ## Officer reviews the grievance. ## Officer records the resolution. ## Farmer receives an update. ## Farmer can also call IVR to hear the updated status.

## Primary Officer Journey

## Officer logs into the dashboard.

## Opens pending applications and discrepancy alerts. ## Selects a farmer record. ## Reviews documents and policy calculations. ## Reviews grievance details. ## Requests additional information or updates the case. ## Records the outcome. ## System maintains an audit trail. ## Farmer receives a notification.

---

# 6. IVR User Journey

## Farmer calls the KrishiSetu telephone number.

## System plays a welcome message. ## Farmer selects Hindi or English. ## System identifies the registered mobile number. ## Farmer completes the configured verification process. ## System reads the main menu. ## Farmer selects a service using keypad input. ## Backend retrieves the relevant information. ## IVR reads the result. ## Farmer can repeat the information, receive an SMS where configured, or end the call.

---

# 7. Application Navigation and Information Architecture

## Farmer Portal

- Home
- My Profile
- Find Government Schemes
- Eligibility Checker
- Loan and Subsidy Calculator
- My Benefits
- Application Tracking
- Grievances
- Notifications
- **IVR** Support
- Settings

## Officer Portal

- Overview Dashboard
- Farmers
- Applications
- Discrepancy Alerts
- Grievances
- Cultivator Verification
- Reports
- Settings

## Admin Portal

- Scheme Management
- Policy Rule Management
- Financial-Year Management
- User and Role Management
- Audit Logs
- Platform Configuration

---

# 8. Technical Architecture

## 8.1 Recommended Technology Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js |
| Language | TypeScript |
| Styling | Tailwind CSS |
| UI Components | Shadcn/ui |
| Backend | Supabase |
| Database | PostgreSQL |
| Authentication | Supabase Auth |
| File Storage | Supabase Storage |
| AI Explanation | Gemini API |
| IVR | Exotel or compatible telephony provider |
| Speech Services | BHASHINI, subject to availability |
| Hosting | Vercel |

## 8.2 Architecture Flow

Farmer Web App / **IVR** ↓ Backend **API** and Authentication ↓ Business Logic Services ↓ Eligibility Engine / Calculator / Integrity Engine ↓ Supabase PostgreSQL Database ↓ Notifications / Officer Dashboard / Farmer Dashboard

### Important Architecture Rule

All channels must use the same backend.

The web application and **IVR** must not maintain separate farmer profiles or benefit records.

AI should explain verified data and help draft complaints. Eligibility decisions and financial calculations must use deterministic business rules.

---

# 9. Core Database Entities

The initial database should include:

| Table | Purpose |
|---|---|
| users | Authentication and role information |
| farmers | Farmer profile and unique Farmer ID |
| farmer_land | Landholding and cultivator details |
| farmer_crops | Crop and farming-season records |
| documents | Farmer document metadata |
| schemes | Scheme directory |
| scheme_rules | Eligibility and benefit rules |
| policy_versions | Financial-year and policy history |
| eligibility_results | Farmer-specific eligibility results |
| benefit_calculations | Loan and subsidy estimates |
| benefit_ledger | Farmer financial benefit records |
| applications | Application references and status |
| transactions | Recorded disbursement and receipt events |
| discrepancies | Integrity engine alerts |
| grievances | Farmer complaints |
| grievance_updates | Complaint history |
| cultivator_verifications | Cultivator evidence and review |
| notifications | SMS and platform notifications |
| officer_actions | Officer activity and audit trail |
| ivr_sessions | IVR call and keypad interaction history |

---

# 10. MVP Scope – 30-Hour Hackathon

The following scope is mandatory for the prototype.

| Feature | Priority | Estimated Time |
|---|---|---:|
| Farmer Registration | P0 | 1 hour |
| Farmer Profile | P0 | 1.5 hours |
| Farmer Dashboard | P0 | 1 hour |
| Scheme Directory | P0 | 2 hours |
| Eligibility Engine | P0 | 2 hours |
| Loan/Subsidy Calculator | P0 | 1.5 hours |
| Financial Digital Twin | P0 | 3 hours |
| Application Tracking | P1 | 1.5 hours |
| Integrity Engine | P0 | 2 hours |
| Grievance Management | P1 | 1.5 hours |
| Cultivator Identity Bridge | P1 | 1 hour |
| Officer Dashboard | P1 | 2 hours |
| IVR Integration | P0 | 3 hours |
| Notifications | P2 | 1 hour |
| Security and Testing | P0 | 1 hour |

The estimates are implementation targets, not guaranteed durations. Integrations and debugging may require additional time.

## Features to Defer

Do not attempt to build these during the initial 30-hour **MVP**:

- Full AgriStack integration.
- Live government database access.
- Direct bank account integration.
- Aadhaar authentication integration.
- Complete all-India scheme database.
- Fully conversational AI voice agent.
- Native Android application.
- Blockchain-based verification.
- Machine-learning-based fraud prediction.
- Automatic government grievance submission without an authorized integration.

---

# 11. Demo Data and Data Integrity

The prototype should use a small, controlled set of sample farmer profiles and scheme records.

### Example Demo Scenario

Farmer: Ramesh Kumar Location: Chhattisgarh Cultivated Area: 2 acres Crop: Paddy Cultivator Type: Landowner

Sample records:

- One potentially eligible government scheme.
- One application under review.
- One recorded approved benefit.
- One unverified payment.
- One sanction amount mismatch.
- One grievance submitted.
- One officer review and resolution.

All simulated data must be visibly labelled as demonstration data.

Never claim that a government application was actually submitted, a payment was received, or an officer approved a case unless that event is backed by a real authorized source.

---

# 12. Non-Functional Requirements

## Performance

- Responsive interface on mobile and desktop.
- Fast dashboard loading.
- Efficient database queries.
- Loading states for all major actions.

## Usability

- Simple language.
- Hindi and English interface.
- Large buttons and readable text.
- Minimal steps for important tasks.
- Mobile-first design.
- Clear status labels and explanations.

## Security

- Role-based authorization.
- Secure farmer data access.
- Protected file storage.
- Input validation.
- Secure **API** configuration.
- Audit trail for officer actions.
- No collection of banking passwords, **UPI** PINs or unnecessary sensitive information.

## Reliability

- Proper error messages.
- Safe handling of incomplete information.
- Persistent records.
- Consistent status history.
- Fallback behavior for **IVR** failures.

---

# 13. Testing and Acceptance Plan

The product is considered **MVP**-ready when the following tests pass:

### Farmer Tests

- Register a new farmer.
- Log in again.
- Update profile details.
- Upload a document.
- Discover schemes.
- Check eligibility.
- Calculate a benefit.
- View the Financial Digital Twin.
- Track an application.
- Generate a grievance.

### Integrity Engine Tests

- Detect an amount mismatch.
- Detect a missing payment record.
- Detect an incomplete application.
- Display the correct policy version.
- Allow an officer to review and resolve an alert.

### IVR Tests

- Receive a test call.
- Select a language.
- Enter keypad options.
- Retrieve a farmer's application status.
- Retrieve payment status.
- Generate a complaint reference.

### Officer Tests

- Log in as an officer.
- View permitted farmer records.
- Review discrepancy alerts.
- Update a complaint.
- Verify that changes appear in the farmer portal.

### Security Tests

- Prevent one farmer from viewing another farmer's records.
- Prevent unauthorized officer access.
- Verify document access restrictions.
- Validate required fields.
- Check audit logs.

---

# 14. Product Differentiation and Unique Selling Propositions

## USP 1: Farmer Financial Digital Twin

A consolidated financial view that separates potential benefits from actual application, sanction, disbursement and receipt records.

## USP 2: Policy-to-Payment Integrity Engine

A rule-based engine that compares expected and recorded benefits and identifies possible discrepancies with explanations and policy references.

## USP 3: Cultivator Identity Bridge

A workflow that records the actual cultivator separately from the landowner and supports evidence-based verification for tenant farmers and sharecroppers.

## USP 4: IVR-Based Agricultural Assistance

A telephone-based interface that makes important farmer information accessible without requiring a smartphone or advanced digital literacy.

---

# 15. Final Product Definition

KrishiSetu is not simply a government scheme search portal.

It is a farmer-centric transparency platform that connects:

- Farmer identity and agricultural profile.
- Government scheme discovery.
- Eligibility assessment.
- Loan and subsidy calculations.
- Financial benefit tracking.
- Policy integrity verification.
- Grievance management.
- Government officer review.
- **IVR**-based access.

**The ultimate goal is to help every farmer understand what benefits they may qualify for, what has happened to their applications, what payments have been recorded, and what steps they can take when something appears wrong.**

**Core Demo Story:** Register → Discover → Check Eligibility → Calculate → Track Benefits → Detect Discrepancy → Raise Grievance → Officer Resolution → **IVR** Update.