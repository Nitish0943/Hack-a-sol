# BACKEND.md — KrishiSetu Backend Architecture & API Specification

**Project:** KrishiSetu **Tagline:** Every Farmer Deserves to Know What They Are Owed. **Document Type:** Backend Development Specification **Version:** 1.0 **Purpose:** Implement a complete backend and **API** layer that connects every frontend page defined in `**FRONTEND**.md` and satisfies the requirements in `**PRD**.md`.

---

# 1. Backend Objectives

Build a secure, modular, scalable backend that supports all KrishiSetu modules.

The backend must:

## Support farmer, officer, and admin accounts.

## Provide secure authentication and role-based authorization. ## Manage farmer profiles, land details, crops, and documents. ## Store and retrieve government schemes and policy rules. ## Calculate scheme eligibility using deterministic rules. ## Calculate estimated loans, subsidies, and financial benefits. ## Maintain a consolidated Farmer Financial Digital Twin. ## Track applications through their complete lifecycle. ## Identify potential discrepancies in benefit and payment records. ## Manage grievances and officer responses. ## Support tenant farmers and cultivator verification workflows. ## Provide an IVR-compatible API layer. ## Maintain audit logs for important actions. ## Provide structured APIs for every frontend route.

**Important:** All demo records must be clearly marked as synthetic. The application must never claim to have verified actual government or bank payments unless an authorized integration provides that information.

# 2. Technology Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js App Router, TypeScript |
| Backend API | Next.js Route Handlers |
| Database | Supabase PostgreSQL |
| Authentication | Supabase Auth |
| File storage | Supabase Storage |
| Validation | Zod |
| API communication | REST APIs |
| Data fetching | TanStack Query |
| ORM / Database access | Supabase JS or SQL functions |
| AI explanations | Gemini API |
| Telephony | Exotel or compatible IVR provider |
| Deployment | Vercel + Supabase |

Use the existing project stack wherever possible. Do not introduce unnecessary backend frameworks or duplicate services.

# 3. System Architecture

## 3.1 High-level architecture

```text
    **KRISHISETU** **PLATFORM**
    |
    Next.js Frontend Application
    |
    ---------------------------------------
    |                 |                   |
    Farmer Portal     Officer Portal      Admin Portal
    |                 |                   |
    ---------------------------------------
    |
    **API** Layer
    Next.js Route Handlers
    |
    ---------------------------------------
    |          |           |              |
    Auth/**RBAC**   Services   Validation     Audit Logs
    |          |           |              |
    ---------------------------------------
    |
    Business Logic Layer
    |
    -----------------------------------------------
    |             |             |                 |
 Eligibility   Calculator   Digital Twin      Integrity Engine
 Engine        Engine       Service           Service
    |             |             |                 |
    -----------------------------------------------
    |
    Supabase PostgreSQL
    |
    ---------------------------------------
    |                 |                   |
    Supabase Auth    Supabase Storage      Database
    |                 |                   |
    ---------------------------------------
    |
    External Services
    |
    Gemini / **IVR** / Notifications
```

## 3.2 Backend design principles

- Keep **API** routes thin.
- Put business logic inside reusable service modules.
- Keep database operations separate from frontend components.
- Validate every incoming request.
- Enforce authorization on the server.
- Use PostgreSQL transactions for multi-step financial or application updates.
- Use database constraints to prevent invalid data.
- Maintain audit records for important changes.
- Keep demo and production data distinguishable.
- Never expose Supabase service-role credentials to the frontend.

# 4. Recommended Project Structure

```text src/ ├── app/ │   └── api/ │       └── v1/ │           ├── auth/ │           ├── farmers/ │           ├── schemes/ │           ├── eligibility/ │           ├── calculator/ │           ├── benefits/ │           ├── applications/ │           ├── grievances/ │           ├── discrepancies/ │           ├── cultivator-verification/ │           ├── officers/ │           ├── admin/ │           ├── notifications/ │           ├── ivr/ │           ├── reports/ │           └── health/ │ ├── lib/ │   ├── supabase/ │   │   ├── client.ts │   │   ├── server.ts │   │   └── middleware.ts │   ├── auth/ │   │   ├── get-current-user.ts │   │   ├── require-role.ts │   │   └── permissions.ts │   ├── validations/ │   ├── constants/ │   └── utils/ │ ├── services/ │   ├── farmer.service.ts │   ├── scheme.service.ts │   ├── eligibility.service.ts │   ├── calculator.service.ts │   ├── benefit.service.ts │   ├── application.service.ts │   ├── grievance.service.ts │   ├── integrity.service.ts │   ├── cultivator.service.ts │   ├── officer.service.ts │   ├── notification.service.ts │   ├── ivr.service.ts │   └── report.service.ts │ ├── engines/ │   ├── eligibility.engine.ts │   ├── subsidy-calculator.engine.ts │   ├── loan-calculator.engine.ts │   ├── benefit-integrity.engine.ts │   └── policy-rule.engine.ts │ ├── types/ │   ├── api.types.ts │   ├── farmer.types.ts │   ├── scheme.types.ts │   ├── application.types.ts │   ├── benefit.types.ts │   ├── grievance.types.ts │   └── database.types.ts │ └── middleware.ts

supabase/ ├── migrations/ ├── seed.sql ├── config.toml └── functions/ ```

Adapt the structure to the existing repository. Do not duplicate existing utilities or create a second **API** architecture.

# 5. Authentication & Authorization

## 5.1 Supported roles

```typescript type UserRole = *farmer* | *officer* | *admin*; ```

## 5.2 Authentication flow

## User enters their mobile number.

## Backend initiates Supabase phone authentication or a configured demo OTP flow. ## User verifies the OTP. ## Backend retrieves the authenticated Supabase user. ## Backend retrieves the corresponding application profile. ## Backend checks the user's role. ## User is redirected to the appropriate dashboard.

Demo **OTP** must be enabled only through an explicit development configuration. Do not implement a hardcoded **OTP** that bypasses production authentication.

## 5.3 API endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/v1/auth/send-otp` | Initiate OTP |
| POST | `/api/v1/auth/verify-otp` | Verify OTP |
| POST | `/api/v1/auth/logout` | Logout |
| GET | `/api/v1/auth/me` | Current user |
| PATCH | `/api/v1/auth/profile` | Update basic profile |

## 5.4 Role permissions

| Module | Farmer | Officer | Admin |
|---|---|---|---|
| Own profile | Read/Update | Read assigned records | Manage |
| Schemes | Read | Read | Manage |
| Eligibility | Own records | Read assigned records | Read |
| Applications | Own applications | Review assigned | Manage |
| Benefits | Own records | Read assigned records | Manage |
| Discrepancies | Own alerts | Review assigned alerts | Manage |
| Grievances | Create/View own | Resolve assigned | Manage |
| Cultivator verification | Submit evidence | Verify assigned | Manage |
| Reports | Own summaries | Department summaries | All permitted reports |
| Users | No | Limited assigned access | Manage |

Enforce permissions on the server and through Supabase Row Level Security (**RLS**). Hiding a button in the frontend is not authorization.

# 6. Database Architecture

Use PostgreSQL with **UUID** primary keys, foreign keys, indexes, timestamps, and appropriate constraints.

## 6.1 `profiles`

Stores application user information.

| Column | Type |
|---|---|
| id | UUID, primary key, references auth.users |
| farmer_id | VARCHAR, unique, nullable |
| full_name | VARCHAR |
| mobile_number | VARCHAR |
| email | VARCHAR, nullable |
| role | ENUM: farmer, officer, admin |
| preferred_language | VARCHAR |
| state | VARCHAR |
| district | VARCHAR |
| block | VARCHAR |
| village | VARCHAR |
| pincode | VARCHAR, nullable |
| is_active | BOOLEAN |
| created_at | TIMESTAMPTZ |
| updated_at | TIMESTAMPTZ |

Generate a unique Farmer ID for farmer accounts. Never use a mobile number as the primary key.

## 6.2 `farmer_land_records`

| Column | Type |
|---|---|
| id | UUID |
| farmer_id | UUID, references profiles.id |
| survey_number | VARCHAR, nullable |
| village | VARCHAR |
| land_area_acres | DECIMAL |
| ownership_type | VARCHAR |
| cultivator_type | VARCHAR |
| irrigation_type | VARCHAR |
| verification_status | VARCHAR |
| created_at | TIMESTAMPTZ |

Ownership and cultivation must be represented separately.

## 6.3 `farmer_crops`

| Column | Type |
|---|---|
| id | UUID |
| farmer_id | UUID |
| land_record_id | UUID |
| crop_name | VARCHAR |
| crop_season | VARCHAR |
| cultivated_area_acres | DECIMAL |
| sowing_year | INTEGER |
| irrigation_type | VARCHAR |
| created_at | TIMESTAMPTZ |

## 6.4 `farmer_documents`

| Column | Type |
|---|---|
| id | UUID |
| farmer_id | UUID |
| document_type | VARCHAR |
| storage_path | TEXT |
| verification_status | VARCHAR |
| uploaded_at | TIMESTAMPTZ |
| verified_by | UUID, nullable |

Store document metadata in PostgreSQL and files in private Supabase Storage buckets.

Do not store Aadhaar numbers, bank account numbers, or other sensitive identifiers unless a legitimate requirement, legal basis, and appropriate security controls exist. The **MVP** should avoid collecting them.

## 6.5 `schemes`

| Column | Type |
|---|---|
| id | UUID |
| name | VARCHAR |
| short_description | TEXT |
| full_description | TEXT |
| scheme_level | VARCHAR |
| department | VARCHAR |
| state | VARCHAR |
| category | VARCHAR |
| benefit_type | VARCHAR |
| benefit_amount | DECIMAL, nullable |
| application_url | TEXT, nullable |
| official_source_url | TEXT, nullable |
| eligibility_summary | TEXT |
| required_documents | JSONB |
| status | VARCHAR |
| is_demo | BOOLEAN |
| created_at | TIMESTAMPTZ |
| updated_at | TIMESTAMPTZ |

## 6.6 `scheme_policy_versions`

Stores versioned policy rules.

| Column | Type |
|---|---|
| id | UUID |
| scheme_id | UUID |
| version | VARCHAR |
| effective_from | DATE |
| effective_until | DATE, nullable |
| rules_json | JSONB |
| calculation_config | JSONB |
| source_url | TEXT |
| verification_status | VARCHAR |
| created_by | UUID |
| created_at | TIMESTAMPTZ |

Eligibility calculations must use the applicable policy version and retain that version with the result.

## 6.7 `eligibility_results`

| Column | Type |
|---|---|
| id | UUID |
| farmer_id | UUID |
| scheme_id | UUID |
| policy_version_id | UUID |
| eligibility_status | VARCHAR |
| estimated_benefit | DECIMAL, nullable |
| passed_rules | JSONB |
| failed_rules | JSONB |
| missing_information | JSONB |
| explanation | TEXT |
| calculated_at | TIMESTAMPTZ |
| is_demo | BOOLEAN |

Statuses:

- `eligible`
- `not_eligible`
- `needs_information`
- `under_review`

Do not treat an eligibility calculation as an official government approval.

## 6.8 `loan_calculations`

| Column | Type |
|---|---|
| id | UUID |
| farmer_id | UUID |
| scheme_id | UUID, nullable |
| principal_amount | DECIMAL |
| annual_interest_rate | DECIMAL |
| applicable_subvention_rate | DECIMAL |
| tenure_months | INTEGER |
| estimated_interest | DECIMAL |
| estimated_total_repayment | DECIMAL |
| assumptions | JSONB |
| calculated_at | TIMESTAMPTZ |
| is_demo | BOOLEAN |

## 6.9 `benefit_records`

This table powers the Farmer Financial Digital Twin.

| Column | Type |
|---|---|
| id | UUID |
| farmer_id | UUID |
| scheme_id | UUID |
| application_id | UUID, nullable |
| expected_amount | DECIMAL |
| approved_amount | DECIMAL, nullable |
| sanctioned_amount | DECIMAL, nullable |
| disbursed_amount | DECIMAL, nullable |
| received_amount | DECIMAL, nullable |
| status | VARCHAR |
| verification_status | VARCHAR |
| data_source | VARCHAR |
| source_reference | VARCHAR, nullable |
| financial_year | VARCHAR |
| is_demo | BOOLEAN |
| created_at | TIMESTAMPTZ |
| updated_at | TIMESTAMPTZ |

Allowed benefit statuses:

- `potential`
- `applied`
- `approved`
- `sanctioned`
- `partially_disbursed`
- `disbursed`
- `received`
- `under_review`
- `rejected`

Verification statuses:

- `unverified`
- `self_reported`
- `document_supported`
- `officer_verified`
- `externally_verified`

Never automatically change a record to `received` based only on a calculated amount.

## 6.10 `applications`

| Column | Type |
|---|---|
| id | UUID |
| application_number | VARCHAR, unique |
| farmer_id | UUID |
| scheme_id | UUID |
| eligibility_result_id | UUID, nullable |
| status | VARCHAR |
| submitted_at | TIMESTAMPTZ |
| reviewed_by | UUID, nullable |
| reviewed_at | TIMESTAMPTZ, nullable |
| remarks | TEXT, nullable |
| is_demo | BOOLEAN |
| created_at | TIMESTAMPTZ |
| updated_at | TIMESTAMPTZ |

Application statuses:

- `draft`
- `submitted`
- `under_review`
- `documents_required`
- `approved`
- `rejected`
- `sanctioned`
- `disbursed`
- `closed`

## 6.11 `application_documents`

| Column | Type |
|---|---|
| id | UUID |
| application_id | UUID |
| document_id | UUID |
| created_at | TIMESTAMPTZ |

## 6.12 `application_status_history`

| Column | Type |
|---|---|
| id | UUID |
| application_id | UUID |
| previous_status | VARCHAR, nullable |
| new_status | VARCHAR |
| changed_by | UUID |
| remarks | TEXT, nullable |
| created_at | TIMESTAMPTZ |

## 6.13 `discrepancy_alerts`

| Column | Type |
|---|---|
| id | UUID |
| farmer_id | UUID |
| benefit_record_id | UUID |
| scheme_id | UUID |
| discrepancy_type | VARCHAR |
| expected_amount | DECIMAL, nullable |
| recorded_amount | DECIMAL, nullable |
| difference_amount | DECIMAL, nullable |
| explanation | TEXT |
| severity | VARCHAR |
| status | VARCHAR |
| assigned_officer_id | UUID, nullable |
| resolution_note | TEXT, nullable |
| is_demo | BOOLEAN |
| created_at | TIMESTAMPTZ |
| resolved_at | TIMESTAMPTZ, nullable |

Discrepancy types:

- `amount_mismatch`
- `partial_disbursement`
- `missing_disbursement_record`
- `duplicate_record`
- `status_mismatch`
- `cultivator_mismatch`
- `document_mismatch`

Alert statuses:

- `open`
- `under_review`
- `awaiting_information`
- `resolved`
- `dismissed`

## 6.14 `grievances`

| Column | Type |
|---|---|
| id | UUID |
| grievance_number | VARCHAR, unique |
| farmer_id | UUID |
| scheme_id | UUID, nullable |
| application_id | UUID, nullable |
| category | VARCHAR |
| subject | VARCHAR |
| description | TEXT |
| priority | VARCHAR |
| status | VARCHAR |
| assigned_officer_id | UUID, nullable |
| resolution_note | TEXT, nullable |
| is_demo | BOOLEAN |
| created_at | TIMESTAMPTZ |
| updated_at | TIMESTAMPTZ |
| resolved_at | TIMESTAMPTZ, nullable |

Grievance statuses:

- `submitted`
- `acknowledged`
- `assigned`
- `under_review`
- `awaiting_farmer`
- `resolved`
- `reopened`
- `closed`

## 6.15 `grievance_history`

Stores all grievance updates, comments, and status transitions.

## 6.16 `cultivator_verifications`

| Column | Type |
|---|---|
| id | UUID |
| farmer_id | UUID |
| land_record_id | UUID, nullable |
| cultivator_type | VARCHAR |
| evidence_document_ids | JSONB |
| verification_status | VARCHAR |
| assigned_officer_id | UUID, nullable |
| officer_remarks | TEXT, nullable |
| submitted_at | TIMESTAMPTZ |
| verified_at | TIMESTAMPTZ, nullable |

Verification statuses:

- `pending`
- `under_review`
- `verified`
- `rejected`
- `additional_evidence_required`

## 6.17 `notifications`

| Column | Type |
|---|---|
| id | UUID |
| user_id | UUID |
| title | VARCHAR |
| message | TEXT |
| notification_type | VARCHAR |
| reference_type | VARCHAR, nullable |
| reference_id | UUID, nullable |
| is_read | BOOLEAN |
| created_at | TIMESTAMPTZ |

## 6.18 `officer_assignments`

Stores officer-to-district, block, farmer, application, grievance, and discrepancy assignments as appropriate.

## 6.19 `audit_logs`

| Column | Type |
|---|---|
| id | UUID |
| actor_id | UUID |
| action | VARCHAR |
| entity_type | VARCHAR |
| entity_id | UUID, nullable |
| old_values | JSONB, nullable |
| new_values | JSONB, nullable |
| ip_address | INET, nullable |
| created_at | TIMESTAMPTZ |

Do not log OTPs, passwords, access tokens, or unnecessary sensitive information.

# 7. API Standards

Base **URL**:

```text /api/v1 ```

All APIs should return consistent **JSON** responses.

## 7.1 Success response

```json
{
    *success*: true,
    *message*: *Farmer profile retrieved successfully*,
    *data*: {},
    *meta*: null
}
```

## 7.2 Error response

```json
{
    *success*: false,
    *message*: *Validation failed*,
    *error*: {
    *code*: *VALIDATION_ERROR*,
    *details*: []
    }
}
```

## 7.3 HTTP status codes

| Code | Meaning |
|---|---|
| 200 | Successful request |
| 201 | Resource created |
| 400 | Invalid request |
| 401 | Authentication required |
| 403 | Permission denied |
| 404 | Resource not found |
| 409 | Conflict |
| 422 | Business rule validation failed |
| 429 | Rate limit exceeded |
| 500 | Internal server error |

## 7.4 Pagination

Use:

```text ?page=1&limit=20&search=&status= ```

Paginated response:

```json
{
    *success*: true,
    *data*: [],
    *meta*: {
    *page*: 1,
    *limit*: 20,
    *total*: **100**,
    *totalPages*: 5
    }
}
```

# 8. Complete API Endpoint Catalogue

All routes below must be implemented or explicitly documented as deferred. Protect private endpoints with authentication and role checks.

## 8.1 Authentication APIs

| Method | Endpoint | Access |
|---|---|---|
| POST | `/auth/demo-login` | Development only; seeded role account |
| POST | `/auth/send-otp` | Public |
| POST | `/auth/verify-otp` | Public |
| POST | `/auth/logout` | Authenticated |
| GET | `/auth/me` | Authenticated |
| PATCH | `/auth/profile` | Authenticated |

`/auth/demo-login` accepts `{"role":"farmer"}`, `{"role":"officer"}` or `{"role":"admin"}` and is available only when `DEMO_LOGIN_ENABLED=true` outside production. It is intended for demonstration environments and must not be used as production authentication.

## 8.2 Farmer APIs

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/farmers/me` | Get own farmer profile |
| PATCH | `/farmers/me` | Update own profile |
| GET | `/farmers/me/dashboard` | Dashboard summary |
| GET | `/farmers/me/land` | List land records |
| POST | `/farmers/me/land` | Add land record |
| GET | `/farmers/me/land/:id` | Get land record |
| PATCH | `/farmers/me/land/:id` | Update land record |
| DELETE | `/farmers/me/land/:id` | Remove unreferenced land record |
| GET | `/farmers/me/crops` | List crops |
| POST | `/farmers/me/crops` | Add crop |
| PATCH | `/farmers/me/crops/:id` | Update crop |
| DELETE | `/farmers/me/crops/:id` | Delete crop |
| GET | `/farmers/me/documents` | List documents |
| POST | `/farmers/me/documents/upload-url` | Request secure upload |
| POST | `/farmers/me/documents/complete` | Register uploaded document |
| DELETE | `/farmers/me/documents/:id` | Delete permitted document |

All farmer routes must derive the farmer identity from the authenticated session. Never trust a client-supplied farmer ID to authorize access.

## 8.3 Scheme APIs

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/schemes` | List schemes |
| GET | `/schemes/:id` | Scheme details |
| GET | `/schemes/categories` | Scheme categories |
| GET | `/schemes/featured` | Featured schemes |
| GET | `/schemes/:id/policy` | Current policy details |
| GET | `/schemes/:id/eligibility-rules` | Eligibility rule summary |

Query parameters:

```text ?search=equipment&category=agriculture&level=state&page=1&limit=10 ```

Admin scheme management:

| Method | Endpoint |
|---|---|
| POST | `/admin/schemes` |
| PATCH | `/admin/schemes/:id` |
| DELETE | `/admin/schemes/:id` |
| POST | `/admin/schemes/:id/publish` |
| POST | `/admin/schemes/:id/policy-versions` |

Do not hardcode unverified government scheme rates or eligibility conditions. Each policy record must have its source and verification status.

## 8.4 Eligibility APIs

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/eligibility/check` | Calculate eligibility |
| GET | `/eligibility/results` | List own results |
| GET | `/eligibility/results/:id` | Result details |
| POST | `/eligibility/results/:id/recalculate` | Recalculate using applicable rules |

Request:

```json
{
    *schemeId*: *uuid*,
    *farmerInputs*: {
    *landAreaAcres*: 2.5,
    *crop*: *Paddy*,
    *cultivatorType*: *owner*,
    *irrigationType*: *irrigated*,
    *district*: *Raipur*
    }
}
```

Response:

```json
{
    *success*: true,
    *data*: {
    *resultId*: *uuid*,
    *eligibilityStatus*: *needs_information*,
    *estimatedBenefit*: null,
    *passedRules*: [
    {
    *rule*: *district_coverage*,
    *passed*: true,
    *explanation*: "The district matches the configured scheme coverage.*
    }
    ],
    *failedRules*: [],
    *missingInformation*: [
    *Required land document*
    ],
    *policyVersion*: *1.0*,
    *isOfficialApproval": false
    }
}
```

Eligibility logic must be deterministic and versioned. AI must not make eligibility decisions.

## 8.5 Loan and subsidy calculator APIs

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/calculator/loan` | Calculate loan estimates |
| POST | `/calculator/subsidy` | Calculate subsidy estimates |
| POST | `/calculator/equipment` | Equipment subsidy estimate |
| POST | `/calculator/irrigation` | Irrigation subsidy estimate |
| GET | `/calculator/history` | Calculation history |
| GET | `/calculator/history/:id` | Calculation details |

Example loan request:

```json
{
    *principalAmount*: **100000**,
    *annualInterestRate*: 7,
    *applicableSubventionRate*: 3,
    *tenureMonths*: 12,
    *calculationType*: *simple_interest*
}
```

Example response:

```json
{
    *success*: true,
    *data*: {
    *principalAmount*: **100000**,
    *annualInterestRate*: 7,
    *applicableSubventionRate*: 3,
    *estimatedInterest*: **4000**,
    *estimatedTotalRepayment*: **104000**,
    *assumptions*: [
    *Illustrative simple-interest calculation*,
    "Subvention is assumed to apply to the full principal for the configured period*
    ],
    *isOfficialQuote": false
    }
}
```

Use the configured calculation method and policy rules. The example is illustrative, not a statement of any current government lending rate. Clearly distinguish estimated interest from any benefit that may be conditional on repayment or other requirements.

## 8.6 Financial Digital Twin APIs

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/benefits/summary` | Financial overview |
| GET | `/benefits` | List benefit records |
| GET | `/benefits/:id` | Benefit details |
| GET | `/benefits/timeline` | Financial timeline |
| GET | `/benefits/by-scheme` | Scheme-wise breakdown |
| GET | `/benefits/ledger` | Consolidated benefit ledger |
| POST | `/benefits/:id/report-discrepancy` | Report an issue |

Example summary:

```json
{
    *success*: true,
    *data*: {
    *potentialAmount*: **25000**,
    *appliedAmount*: **10000**,
    *approvedAmount*: **8000**,
    *sanctionedAmount*: **8000**,
    *disbursedAmount*: **5000**,
    *receivedAmount*: **5000**,
    *pendingAmount*: **3000**,
    *currency*: *INR*,
    *verificationStatus*: *partially_verified*,
    *isDemo*: true
    }
}
```

These figures are example demo values. Define the exact aggregation rules so amounts at different lifecycle stages are not added together and double-counted.

## 8.7 Application APIs

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/applications` | Create draft |
| GET | `/applications` | List own applications |
| GET | `/applications/:id` | Application details |
| PATCH | `/applications/:id` | Update draft |
| POST | `/applications/:id/submit` | Submit application |
| POST | `/applications/:id/documents` | Attach document |
| GET | `/applications/:id/history` | Status history |
| POST | `/applications/:id/withdraw` | Withdraw if allowed |

Officer application APIs:

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/officer/applications` | Assigned application list |
| GET | `/officer/applications/:id` | Application details |
| POST | `/officer/applications/:id/review` | Review application |
| POST | `/officer/applications/:id/request-documents` | Request documents |
| POST | `/officer/applications/:id/approve` | Record approval |
| POST | `/officer/applications/:id/reject` | Record rejection |
| POST | `/officer/applications/:id/record-sanction` | Record sanction |
| POST | `/officer/applications/:id/record-disbursement` | Record disbursement |

Every status change must create an `application_status_history` record and an audit log.

Do not permit arbitrary transitions. Validate allowed transitions in backend business logic.

## 8.8 Grievance APIs

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/grievances` | Create grievance |
| GET | `/grievances` | List own grievances |
| GET | `/grievances/:id` | Grievance details |
| GET | `/grievances/:id/history` | Grievance timeline |
| POST | `/grievances/:id/comments` | Add comment |
| POST | `/grievances/:id/reopen` | Reopen grievance |

Officer APIs:

| Method | Endpoint |
|---|---|
| GET | `/officer/grievances` |
| GET | `/officer/grievances/:id` |
| POST | `/officer/grievances/:id/assign` |
| POST | `/officer/grievances/:id/update-status` |
| POST | `/officer/grievances/:id/respond` |
| POST | `/officer/grievances/:id/resolve` |

AI-assisted grievance drafting:

```text **POST** /api/v1/grievances/draft ```

Request:

```json
{
    *category*: *payment_delay*,
    *schemeName*: *Example Scheme*,
    *description*: "My application is approved but I have not received the payment.*
}
```

Response:

```json
{
    *success*: true,
    *data*: {
    *suggestedSubject*: *Request for clarification regarding payment status*,
    *suggestedDescription*: *..."
    }
}
```

AI may improve wording but must not invent facts, dates, application IDs, or payment history. The farmer must review and submit the grievance.

## 8.9 Discrepancy and Integrity Engine APIs

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/discrepancies` | Farmer's alerts |
| GET | `/discrepancies/:id` | Alert details |
| POST | `/discrepancies/:id/report` | Report additional information |
| GET | `/officer/discrepancies` | Officer alert queue |
| GET | `/officer/discrepancies/:id` | Review alert |
| POST | `/officer/discrepancies/:id/assign` | Assign alert |
| POST | `/officer/discrepancies/:id/review` | Start review |
| POST | `/officer/discrepancies/:id/resolve` | Resolve alert |
| POST | `/officer/discrepancies/:id/dismiss` | Dismiss false alert |
| POST | `/admin/integrity/run` | Run integrity checks |

### Integrity engine logic

The engine compares configured expected benefit values with available recorded data.

Example:

```typescript
interface IntegrityInput {
    expectedAmount: number;
    sanctionedAmount: number | null;
    disbursedAmount: number | null;
    receivedAmount: number | null;
    verificationStatus: string;
}

interface IntegrityResult {
    discrepancyDetected: boolean;
    discrepancyType: string | null;
    differenceAmount: number | null;
    explanation: string;
    requiresHumanReview: boolean;
}
```

Required **MVP** scenarios:

**Scenario 1: Partial disbursement**

- Expected: ₹10,**000**
- Recorded disbursement: ₹6,**000**
- Potential difference: ₹4,**000**
- Flag for review.

**Scenario 2: Missing disbursement record**

- Sanctioned: ₹8,**000**
- Disbursement record: unavailable
- Flag as missing information, not proof of non-payment.

**Scenario 3: Status mismatch**

- Application marked sanctioned.
- Benefit record has no corresponding sanction amount.
- Flag for officer review.

These are synthetic test scenarios, not real allegations.

Never label an alert as fraud solely because two amounts differ. Use *potential discrepancy* and require human review.

## 8.10 Cultivator Identity Bridge APIs

| Method | Endpoint |
|---|---|
| POST | `/cultivator-verification` |
| GET | `/cultivator-verification` |
| GET | `/cultivator-verification/:id` |
| POST | `/cultivator-verification/:id/documents` |
| GET | `/officer/verifications` |
| GET | `/officer/verifications/:id` |
| POST | `/officer/verifications/:id/assign` |
| POST | `/officer/verifications/:id/approve` |
| POST | `/officer/verifications/:id/reject` |
| POST | `/officer/verifications/:id/request-evidence` |

Support:

- Owner cultivator
- Tenant farmer
- Sharecropper
- Joint landholder
- Mutation pending
- Other configured cultivator relationships

Verification decisions must be made by an authorized officer or authorized external process. A submitted document alone does not establish official land ownership.

## 8.11 Notification APIs

| Method | Endpoint |
|---|---|
| GET | `/notifications` |
| PATCH | `/notifications/:id/read` |
| POST | `/notifications/read-all` |
| DELETE | `/notifications/:id` |

Notification triggers:

- Application submitted
- Application status changed
- New document requested
- Grievance acknowledged
- Grievance resolved
- Discrepancy detected
- Cultivator verification updated

Use an internal notification record even if **SMS** delivery is deferred.

## 8.12 IVR APIs

The **IVR** service must access the same farmer and scheme data as the web application.

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/ivr/incoming` | Incoming call event |
| POST | `/ivr/identify-farmer` | Identify registered mobile |
| POST | `/ivr/menu` | Retrieve menu options |
| POST | `/ivr/input` | Process DTMF input |
| GET | `/ivr/schemes` | Scheme information |
| GET | `/ivr/application-status` | Application status |
| GET | `/ivr/benefit-status` | Benefit summary |
| POST | `/ivr/grievance` | Create grievance |

Example menu request:

```json
{
    *callId*: *demo-call-**001***,
    *mobileNumber*: *DEMO_MOBILE*,
    *language*: *hi*,
    *digit*: *3*
}
```

Example response:

```json
{
    *success*: true,
    *data*: {
    *nextAction*: *application_status*,
    *message*: *Your application status is under review.*,
    *language*: *hi*,
    *isDemo*: true
    }
}
```

Security requirements:

- Validate telephony provider webhook signatures.
- Do not expose personal farmer data to unauthenticated callers.
- Add a suitable verification step before sharing account-specific information.
- Rate-limit repeated attempts.
- Do not trust caller ID alone as identity verification.

For the hackathon, implement a simulated **IVR** flow if a real provider is not configured. Clearly label the simulation.

## 8.13 Officer APIs

| Method | Endpoint |
|---|---|
| GET | `/officer/dashboard` |
| GET | `/officer/farmers` |
| GET | `/officer/farmers/:id` |
| GET | `/officer/applications` |
| GET | `/officer/grievances` |
| GET | `/officer/discrepancies` |
| GET | `/officer/verifications` |
| GET | `/officer/reports/summary` |

Officer access must be restricted to assigned or authorized jurisdictional records.

## 8.14 Admin APIs

| Method | Endpoint |
|---|---|
| GET | `/admin/dashboard` |
| GET | `/admin/users` |
| GET | `/admin/users/:id` |
| PATCH | `/admin/users/:id` |
| POST | `/admin/users/:id/deactivate` |
| GET | `/admin/schemes` |
| POST | `/admin/schemes` |
| PATCH | `/admin/schemes/:id` |
| POST | `/admin/schemes/:id/policy-versions` |
| GET | `/admin/policies` |
| PATCH | `/admin/policies/:id` |
| GET | `/admin/audit-logs` |
| GET | `/admin/settings` |
| PATCH | `/admin/settings` |

All admin operations must be audited.

## 8.15 Reports APIs

| Method | Endpoint |
|---|---|
| GET | `/reports/farmer-summary` |
| GET | `/reports/benefits` |
| GET | `/reports/applications` |
| GET | `/reports/grievances` |
| GET | `/reports/discrepancies` |
| GET | `/reports/export` |

Apply role and jurisdiction filters to every report. Do not allow farmers to request unrestricted reports.

## 8.16 Health API

```text **GET** /api/v1/health ```

Example:

```json
{
    *success*: true,
    *data*: {
    *api*: *operational*,
    *database*: *connected*,
    *environment*: *development*
    }
}
```

Do not expose secrets, database connection strings, or internal infrastructure details.

# 9. Business Logic Engines

Keep these engines independent of **API** route handlers.

## 9.1 Eligibility Engine

Responsibilities:

- Load farmer information.
- Load the applicable scheme policy version.
- Evaluate configured eligibility rules.
- Return passed and failed conditions.
- Identify missing information.
- Calculate an estimate only when supported by the policy.
- Save the result and policy version.

Example:

```typescript
type RuleResult = {
    ruleId: string;
    passed: boolean | null;
    explanation: string;
};

type EligibilityOutput = {
    status: *eligible* | *not_eligible* | *needs_information*;
    rules: RuleResult[];
    missingInformation: string[];
    policyVersion: string;
};
```

A null rule result means the system cannot determine the outcome from available data. Do not interpret missing data as failure.

## 9.2 Loan Calculator Engine

Responsibilities:

- Validate principal.
- Validate interest rate.
- Validate tenure.
- Apply the configured interest method.
- Calculate repayment estimates.
- Show assumptions and exclusions.
- Store calculation history.

Support simple interest and other explicitly configured methods. Do not silently change the calculation method.

## 9.3 Subsidy Calculator Engine

Responsibilities:

- Read the applicable subsidy policy.
- Apply configured percentages or fixed amounts.
- Apply eligible cost limits.
- Apply maximum subsidy caps.
- Return estimated benefit.
- Explain the calculation.

Example:

```typescript
function calculateSubsidy(
    eligibleCost: number,
    subsidyPercentage: number,
    maximumSubsidy: number
): number {
    return Math.min(
    eligibleCost * subsidyPercentage / **100**,
    maximumSubsidy
    );
}
```

Use only verified policy configuration for real-world claims. Seeded demo rules must be identified as illustrative.

## 9.4 Financial Digital Twin Engine

Aggregate benefit records into:

- Potential
- Applied
- Approved
- Sanctioned
- Disbursed
- Received
- Pending review

Avoid adding amounts from multiple stages of the same benefit as if they were separate payments.

Each value must show its data source and verification status.

## 9.5 Policy-to-Payment Integrity Engine

Responsibilities:

## Load benefit and application records.

## Compare applicable expected values with recorded values. ## Check for missing or inconsistent records. ## Generate potential discrepancy alerts. ## Explain the reason. ## Assign an appropriate severity. ## Require human review. ## Save the policy version and inputs used.

The engine must not automatically accuse a farmer, officer, department, or bank of fraud.

# 10. Frontend Integration Contract

All frontend pages must communicate through a centralized service layer.

Example:

```text src/ ├── services/ │   ├── api-client.ts │   ├── auth.api.ts │   ├── farmer.api.ts │   ├── scheme.api.ts │   ├── eligibility.api.ts │   ├── calculator.api.ts │   ├── benefits.api.ts │   ├── applications.api.ts │   ├── grievances.api.ts │   ├── discrepancies.api.ts │   ├── cultivator.api.ts │   ├── officer.api.ts │   ├── admin.api.ts │   └── notifications.api.ts ```

Example **API** client:

```typescript const API_BASE_URL = */api/v1*;

export async function apiRequest<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
    *Content-Type*: *application/json*,
    ...options.headers,
    },
    });

  const result = await response.json();

    if (!response.ok || !result.success) {
    throw new Error(
    result.message || *Something went wrong*
    );
    }

return result.data as T; } ```

Adapt this client to the actual Supabase session strategy, including secure cookie handling where appropriate. Do not manually store long-lived authentication tokens in local storage.

Example service:

```typescript
export const farmerApi = {
    getProfile: () =>
    apiRequest(*/farmers/me*),

    updateProfile: (payload: unknown) =>
    apiRequest(*/farmers/me*, {
    method: *PATCH*,
    body: **JSON**.stringify(payload),
    }),

    getDashboard: () =>
    apiRequest(*/farmers/me/dashboard*),
};
```

Replace `unknown` with validated, shared TypeScript request types before production use.

## Frontend integration rules

- Frontend pages must not directly query database tables.
- Use **API** service functions.
- Use TanStack Query for fetching, caching, and mutations where appropriate.
- Use Zod for client-side forms and backend request validation.
- Provide loading, error, empty, and success states.
- Invalidate relevant queries after mutations.
- Use shared response types.
- Do not hardcode mock records inside individual page components.
- Keep all demo records in a dedicated seed or demo-data layer.

# 11. Environment Variables

Create `.env.example`.

```env NEXT_PUBLIC_SUPABASE_URL= NEXT_PUBLIC_SUPABASE_ANON_KEY=

SUPABASE_SERVICE_ROLE_KEY=

GEMINI_API_KEY=

IVR_PROVIDER= IVR_API_KEY= IVR_API_SECRET= IVR_WEBHOOK_SECRET=

NEXT_PUBLIC_APP_URL=[http://localhost:**3000**](http://localhost:**3000**) ```

Rules:

- Never commit `.env`.
- Never expose `SUPABASE_SERVICE_ROLE_KEY` to client code.
- Never expose Gemini or **IVR** secrets to the browser.
- Use the Supabase publishable/anonymous key with **RLS** for ordinary client-side access where appropriate.
- Keep privileged operations on the server.
- Validate required environment variables at startup.

# 12. Supabase Security & RLS

Enable **RLS** on all user-related tables.

Minimum security requirements:

## Farmers can access only their own profile and records.

## Farmers can access only their own applications, benefits, grievances, documents, and eligibility results. ## Officers can access only records permitted by their assignments and jurisdiction. ## Admin-only tables and operations must be protected. ## Users cannot update their own role. ## Farmers cannot directly modify officer verification results. ## Farmers cannot change sanctioned or disbursed amounts. ## Users cannot modify audit logs. ## Private documents must use signed URLs or authorized server access. ## All privileged operations must validate role and ownership.

Create reusable authorization functions or database policies instead of repeating inconsistent checks.

# 13. Seed Data & Demo Environment

Create:

```text supabase/seed.sql ```

Seed:

- 10 demo farmers
- 3 demo officers
- 1 demo admin
- 5–7 scheme records
- 3–5 policy configurations
- 10–15 application records
- 10 benefit records
- 3 discrepancy scenarios
- 5 grievance records
- Cultivator verification examples
- Notification examples

Use synthetic names, phone numbers, application references, and financial records.

Set `is_demo = true` on all demo records.

Create a development-only seed command and ensure it cannot accidentally overwrite production data.

Use a consistent demo dataset across the farmer, officer, and admin portals. A change in application status should be reflected in all related views.

# 14. Required End-to-End Workflows

## Workflow A: Farmer registration

## Farmer enters mobile number.

## OTP is sent or demo OTP is issued. ## OTP is verified. ## Profile is created or retrieved. ## Farmer ID is generated. ## Farmer completes location and language details. ## Dashboard becomes available.

## Workflow B: Scheme discovery and eligibility

## Farmer opens scheme directory.

## Frontend requests scheme list. ## Farmer opens a scheme. ## Frontend fetches scheme details. ## Farmer runs eligibility check. ## Backend loads policy version. ## Eligibility engine evaluates rules. ## Result and explanation are saved. ## Frontend displays result and missing information.

## Workflow C: Loan/subsidy calculation

## Farmer enters calculation details.

## Frontend validates input. ## Backend validates input again. ## Calculator loads configured assumptions. ## Calculator computes estimated benefit or repayment. ## Calculation is stored. ## Frontend displays amount and assumptions.

## Workflow D: Application submission

## Farmer selects a scheme.

## Farmer creates application draft. ## Farmer uploads required documents. ## Backend validates document references. ## Farmer submits application. ## Backend assigns application number. ## Status changes to `submitted`. ## History and audit logs are created. ## Notification is generated.

## Workflow E: Officer application review

## Officer logs in.

## Backend loads assigned applications. ## Officer opens an application. ## Officer reviews farmer details and documents. ## Officer requests missing information or records a decision. ## Application status is updated. ## Status history and audit logs are created. ## Farmer receives a notification.

## Workflow F: Integrity monitoring

## Integrity engine loads relevant benefit records.

## It evaluates configured consistency checks. ## It identifies potential mismatches. ## Alert is created with its explanation. ## Officer reviews the alert. ## Officer records resolution or dismissal. ## Audit trail is preserved. ## Farmer sees the permitted status and explanation.

## Workflow G: Grievance management

## Farmer submits grievance.

## Backend creates unique grievance number. ## Grievance is assigned or placed in an officer queue. ## Officer reviews the grievance. ## Officer adds comments or requests information. ## Farmer receives updates. ## Officer resolves the grievance. ## Full history remains available.

## Workflow H: IVR interaction

## Provider sends an incoming-call webhook.

## Backend validates the provider request. ## Caller is identified through a secure verification process. ## Backend returns language menu. ## Caller selects an option using DTMF. ## IVR service requests data from shared backend services. ## A response is returned in the configured language. ## Grievance actions require suitable confirmation.

# 15. Validation Requirements

Use Zod schemas for every incoming request.

Example:

```typescript import { z } from *zod*;

export const farmerProfileSchema = z.object({
    fullName: z.string().min(2).max(**100**),
    preferredLanguage: z.enum([*hi*, *en*]),
    state: z.string().min(2),
    district: z.string().min(2),
    block: z.string().min(2),
    village: z.string().min(2),
});
```

Additional validation:

- Reject negative land areas.
- Reject invalid financial amounts.
- Restrict accepted document formats and file sizes.
- Validate **UUID** parameters.
- Validate application status transitions.
- Prevent duplicate submissions using idempotency keys where needed.
- Sanitize text before displaying it.
- Validate all enum values against server-side definitions.

# 16. Performance & Reliability

- Add database indexes to frequently queried foreign keys and status fields.
- Use pagination for lists.
- Avoid N+1 queries.
- Select only required columns.
- Use database transactions for multi-table workflows.
- Add request timeouts and sensible error handling.
- Rate-limit **OTP** and **IVR** endpoints.
- Use idempotency protection for critical creation operations.
- Do not run expensive integrity checks on every dashboard request.
- Cache public scheme directory data where safe.
- Avoid caching private farmer data across users.

# 17. Testing Strategy

Use Vitest or the existing project testing framework.

## Unit tests

- Eligibility rule evaluation.
- Missing-information handling.
- Loan calculations.
- Subsidy calculations.
- Benefit aggregation.
- Discrepancy detection.
- Application status transitions.
- Authorization checks.

## API tests

- Authentication required.
- Invalid request rejection.
- Unauthorized role rejection.
- Farmer ownership enforcement.
- Correct pagination.
- Correct database persistence.
- Correct error response format.

## Integration tests

Test the following complete flows:

## Farmer registration and profile completion.

## Scheme listing and eligibility checking. ## Loan and subsidy calculations. ## Application creation and submission. ## Officer review and status update. ## Digital Twin benefit aggregation. ## Discrepancy generation and resolution. ## Grievance submission and resolution. ## Cultivator verification. ## IVR menu and status retrieval.

## Security tests

- Farmer cannot read another farmer's records.
- Farmer cannot approve their own application.
- Farmer cannot alter disbursement amounts.
- Officer cannot access unauthorized jurisdiction records.
- Non-admin cannot change user roles.
- Public endpoints cannot expose private information.
- Service-role secrets are never returned in **API** responses.

# 18. Frontend Page-to-Backend Mapping

Use this as the integration checklist against `**FRONTEND**.md`.

| Frontend page | Backend API |
|---|---|
| `/login` | `/auth/send-otp`, `/auth/verify-otp` |
| `/register` | `/auth/profile`, `/farmers/me` |
| `/farmer/dashboard` | `/farmers/me/dashboard` |
| `/farmer/profile` | `/farmers/me`, `/farmers/me/land`, `/farmers/me/crops` |
| `/farmer/schemes` | `/schemes` |
| `/farmer/schemes/[schemeId]` | `/schemes/:id` |
| `/farmer/eligibility` | `/eligibility/results` |
| `/farmer/eligibility/[resultId]` | `/eligibility/results/:id` |
| `/farmer/calculator` | `/calculator/loan`, `/calculator/subsidy` |
| `/farmer/benefits` | `/benefits/summary`, `/benefits` |
| `/farmer/benefits/[benefitId]` | `/benefits/:id` |
| `/farmer/applications` | `/applications` |
| `/farmer/applications/[applicationId]` | `/applications/:id`, `/applications/:id/history` |
| `/farmer/grievances` | `/grievances` |
| `/farmer/grievances/new` | `/grievances` |
| `/farmer/grievances/[grievanceId]` | `/grievances/:id`, `/grievances/:id/history` |
| `/farmer/notifications` | `/notifications` |
| `/farmer/ivr` | `/ivr/menu`, `/ivr/input` |
| `/farmer/settings` | `/auth/profile` |
| `/officer/dashboard` | `/officer/dashboard` |
| `/officer/farmers` | `/officer/farmers` |
| `/officer/farmers/[farmerId]` | `/officer/farmers/:id` |
| `/officer/applications` | `/officer/applications` |
| `/officer/applications/[applicationId]` | `/officer/applications/:id` |
| `/officer/discrepancies` | `/officer/discrepancies` |
| `/officer/discrepancies/[alertId]` | `/officer/discrepancies/:id` |
| `/officer/grievances` | `/officer/grievances` |
| `/officer/grievances/[grievanceId]` | `/officer/grievances/:id` |
| `/officer/verifications` | `/officer/verifications` |
| `/officer/verifications/[verificationId]` | `/officer/verifications/:id` |
| `/officer/reports` | `/officer/reports/summary` |
| `/admin/dashboard` | `/admin/dashboard` |
| `/admin/schemes` | `/admin/schemes` |
| `/admin/policies` | `/admin/policies` |
| `/admin/users` | `/admin/users` |
| `/admin/audit-logs` | `/admin/audit-logs` |
| `/admin/settings` | `/admin/settings` |

# 19. Development Phases

Build in this order to reduce integration problems.

### Phase 1 — Backend foundation

- Configure Supabase.
- Create database migrations.
- Generate database TypeScript types.
- Configure authentication.
- Implement authorization helpers.
- Implement standard **API** response utilities.
- Add health endpoint.

### Phase 2 — Farmer and scheme modules

- Farmer profile APIs.
- Land and crop APIs.
- Document upload.
- Scheme directory.
- Policy version management.

### Phase 3 — Business engines

- Eligibility engine.
- Loan calculator.
- Subsidy calculator.
- Financial Digital Twin.
- Integrity engine.

### Phase 4 — Application workflows

- Application APIs.
- Application history.
- Officer review APIs.
- Grievance APIs.
- Notification service.

### Phase 5 — Officer and admin portals

- Officer dashboard APIs.
- Farmer management.
- Discrepancy review.
- Cultivator verification.
- Admin scheme and policy management.
- Audit logs and reports.

### Phase 6 — IVR and integration

- **IVR** menu APIs.
- **DTMF** processing.
- Language support.
- Provider webhook integration if configured.
- Frontend service integration.

### Phase 7 — Testing and final integration

- Unit tests.
- **API** tests.
- **RLS** tests.
- End-to-end tests.
- Production build.
- Full frontend/backend integration.

# 20. Acceptance Criteria

The backend is ready for frontend integration when:

- [ ] Supabase is configured.
- [ ] All required database migrations run successfully.
- [ ] Authentication works.
- [ ] Farmer, officer, and admin roles work.
- [ ] **RLS** policies are enabled and tested.
- [ ] Farmer profile **CRUD** works.
- [ ] Land and crop APIs work.
- [ ] Scheme APIs return seeded records.
- [ ] Eligibility engine produces explainable results.
- [ ] Loan and subsidy calculators return correct test results.
- [ ] Digital Twin aggregates records correctly.
- [ ] Application submission and status tracking work.
- [ ] Officer review workflow works.
- [ ] Discrepancy engine detects all three demo scenarios.
- [ ] Grievance workflow works.
- [ ] Cultivator verification workflow works.
- [ ] Notifications work.
- [ ] **IVR** simulation works.
- [ ] Admin can manage schemes and policies.
- [ ] Audit logs capture important actions.
- [ ] All frontend routes have documented **API** mappings.
- [ ] No page depends on hardcoded component-level mock data.
- [ ] TypeScript checks pass.
- [ ] Lint passes.
- [ ] Production build succeeds.
- [ ] End-to-end tests pass.

# 21. Mandatory AI Coding Agent Instructions

You are a senior backend engineer working on KrishiSetu.

Before writing code:

## Read `PRD.md`.

## Read `FRONTEND.md`. ## Read `BACKEND.md`. ## Read `AGENTS.md` or `agent.md`. ## Inspect the existing project structure. ## Identify already implemented components and services. ## Prepare a task breakdown before making changes.

While developing:

- Follow the existing project architecture.
- Do not redesign the frontend.
- Do not break existing working features.
- Implement reusable service functions.
- Keep business logic out of **API** route handlers.
- Use shared TypeScript types.
- Validate every **API** request.
- Implement role-based access and **RLS**.
- Keep demo records clearly marked.
- Never invent real government data or claim external verification.
- Do not return fake success responses.
- Do not leave critical **API** endpoints as empty placeholders.
- Test every module before marking it complete.

## Mandatory AGENT.md / AGENTS.md update

After every completed task:

## Update `AGENTS.md` or `agent.md` (use the existing project file; do not create duplicates).

## Record completed work. ## Record created or modified API endpoints. ## Record database migrations and schema changes. ## Record tests executed and their results. ## Record known issues. ## Record pending tasks. ## Write the exact next task to execute.

Maintain this file as the project's development progress log.

## Final deliverables

At completion, provide:

## Complete backend implementation.

## Database migrations.
## Supabase RLS policies.
## Seed/demo data.
## API endpoint documentation.
## Shared TypeScript types.
## Business logic engines.
## Frontend API service integration.
## Test results.
## Updated `AGENTS.md` or `agent.md`.
## Updated README with setup instructions.
12. `.env.example` without real secrets.
## List of any deferred integrations or unfinished endpoints.

**Final objective:** Every page in `**FRONTEND**.md` must be connected to a real backend service or an explicitly labelled demo adapter. The farmer, officer, and admin portals must share the same database and consistent business logic. The application must be ready for an end-to-end hackathon demonstration without pretending that unavailable government or bank integrations are live.