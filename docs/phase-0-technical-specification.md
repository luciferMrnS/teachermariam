# Phase 0 — Technical Specification

**Source document:** `C:\Users\USER\Documents\Comprehensive School Management Platform Project Proposal V2.pdf`
(3 pages, 9 modules, plus the proposal's own 4-phase roadmap.)

**Status:** DRAFT FOR REVIEW — not approved. No production code has been written against it.

**How to read this:** every requirement is numbered and testable. Anything I could not
derive from the proposal is marked `[ASSUMPTION]` and cross-referenced in §K. Nothing
marked `[ASSUMPTION]` is decided. Items marked `[BLOCKER]` change the architecture and
need your answer before Phase 1.

---

## A. Functional Requirements

### Module 1 — Online School System (Central Hub)

| ID | Requirement | Testable assertion |
|---|---|---|
| FR-1.1 | A visitor authenticates with email + password | Given valid credentials, a session is created and the user lands on their role portal |
| FR-1.2 | Every account holds exactly one of 5 roles | Given any account, `role` ∈ {admin, facilitator, parent, student, applicant}; no other value is accepted |
| FR-1.3 | Each role sees a distinct dashboard | Given a user of role R, `/R` renders R's widgets and no widget belonging to another role |
| FR-1.4 | Global announcement board | An announcement with `audience='all'` is visible to every authenticated user |
| FR-1.5 | Targeted announcements | An announcement with `audience='parents'` is invisible to a student querying the board directly |
| FR-1.6 | Academic calendar | Term start/end dates and events appear on a calendar view for all authenticated users |
| FR-1.7 | System-wide analytics | An admin dashboard shows enrolment, attendance, fee-collection and complaint metrics for a selected session |
| FR-1.8 | RBAC enforced server-side | A student requesting `/admin/students` over HTTP receives 403/redirect; hiding the nav link is not the control |
| FR-1.9 | Mobile-responsive | Every portal is usable at 360px width; navigation is reachable without horizontal scroll |

### Module 2 — Parents Portal

| ID | Requirement | Testable assertion |
|---|---|---|
| FR-2.1 | Linked children only | A parent sees exactly the students in their guardianship rows, and no others |
| FR-2.2 | Attendance tracking | For a linked child the parent sees per-day status: present, late, absent, excused |
| FR-2.3 | Attendance rate | The parent sees a term attendance percentage computed as (present+late)/recorded days |
| FR-2.4 | Continuous assessment scores | The parent sees each CA score per subject per term |
| FR-2.5 | Termly report | The parent can open a per-term report per child, showing subject scores and position |
| FR-2.6 | School circulars | The parent can read announcements targeted at parents |
| FR-2.7 | Homework assignments | The parent can see assignments set for their child's class, with due dates |
| FR-2.8 | Event schedules | The parent can view calendar events for the current session |
| FR-2.9 | Fee balance | The parent sees outstanding vs paid for each linked child |
| FR-2.10 | Payment history | The parent sees every payment recorded against their child |
| FR-2.11 | Declare payment | The parent declares a bank transfer they have made for a child's invoice, giving the unique payment reference, amount, date and uploading proof; the invoice remains unpaid until staff confirm it |
| FR-2.12 | Download receipt | The parent can download a receipt for each completed payment |
| FR-2.13 | Submit complaint | The parent can raise a named complaint and see its status |
| FR-2.14 | Submit anonymous feedback | The parent can submit to the anonymous channel and later check status by token |

### Module 3 — Student Portal & Interactive Learning Hub

| ID | Requirement | Testable assertion |
|---|---|---|
| FR-3.1 | View learning materials | A student sees materials published to their class/subject |
| FR-3.2 | Download permitted materials | A student downloads a material where `allow_download=true` |
| FR-3.3 | Watch instructional video | A student can play a stored video resource in-browser |
| FR-3.4 | Read lesson notes and e-books | A student can open PDF/document materials |
| FR-3.5 | Post academic question | A student can post a question scoped to a class and/or subject and lesson |
| FR-3.6 | Answers from facilitator | A facilitator answers a question in their subject; the student sees the answer |
| FR-3.7 | Answers from peers | A student can answer another student's question, subject to moderation `[Q-06]` |
| FR-3.8 | Assignment submission | A student submits work against an assignment before or after the due date, with the lateness recorded |
| FR-3.9 | Personalised gradebook | A student sees their own scores per subject/term only — never another student's |
| FR-3.10 | Announcements | A student sees announcements targeted to students |
| FR-3.11 | Attendance | A student sees their own attendance record and rate |
| FR-3.12 | Academic progress | A student sees their term position and subject-wise performance |
| FR-3.13 | Practical learning content | A student can open step-by-step practical guides and project demonstrations |

### Module 4 — Facilitator / Teacher Portal

| ID | Requirement | Testable assertion |
|---|---|---|
| FR-4.1 | Scoped to assigned classes | A facilitator sees only the classes/subjects assigned to them, not the whole school |
| FR-4.2 | Upload video lecture | A facilitator uploads an MP4/WebM to a class/subject and a student can play it |
| FR-4.3 | Upload audio guide | A facilitator uploads an audio file and a student can stream it |
| FR-4.4 | Upload PDF lesson notes | A facilitator uploads a PDF and a student can read/download it |
| FR-4.5 | Upload reference materials | A facilitator attaches supporting documents to a lesson |
| FR-4.6 | Create practical guide | A facilitator creates an ordered, step-by-step practical guide |
| FR-4.7 | Project demonstration | A facilitator publishes a project demonstration with instructions and media |
| FR-4.8 | Create assignment | A facilitator creates an assignment with instructions, due date and max score |
| FR-4.9 | Review submissions | A facilitator lists and opens submissions for their assignment |
| FR-4.10 | Grade students | A facilitator enters a score and feedback per submission; the student sees it |
| FR-4.11 | Answer questions | A facilitator answers questions in their assigned subjects |
| FR-4.12 | Moderate questions | A facilitator approves/hides peer answers and flags questions |
| FR-4.13 | Record attendance | A facilitator marks present/late/absent/excused for a class on a date, idempotently |
| FR-4.14 | View student academic info | A facilitator sees grades/attendance for students in their assigned classes only |
| FR-4.15 | Upload is class-scoped | A facilitator cannot attach a material to a class they do not teach `[tested negatively]` |

### Module 5 — Registration Portal

| ID | Requirement | Testable assertion |
|---|---|---|
| FR-5.1 | Digital application form | An applicant completes and submits an application without staff involvement |
| FR-5.2 | Admin-defined form fields | An administrator can add, remove, reorder and relabel form fields, and reorder them into sections; the published public form changes accordingly |
| FR-5.3 | Upload birth certificate | Applicant uploads a birth-certificate file; staff can view and verify it |
| FR-5.4 | Upload previous transcript | Applicant uploads a transcript; staff can view and verify it |
| FR-5.5 | Upload passport photograph | Applicant uploads a passport photo, size/type validated |
| FR-5.6 | Registration ID generation | On approval the system generates a unique, non-guessable registration ID |
| FR-5.7 | Track application status | The applicant sees current status and any decision note |
| FR-5.8 | Verification workflow | An administrator moves an application pending → under review → accepted/rejected, each transition recorded with actor + timestamp |
| FR-5.9 | Documents gate approval | An application cannot be approved while a required document is missing or unverified |
| FR-5.10 | Returning-student enrolment | An existing student can be re-enrolled into the next session `[Q-07]` |
| FR-5.11 | Duplicate prevention | The same guardian email + child cannot create two active applications for the same session |
| FR-5.12 | Dynamic validation | Server-side validation is generated from the field definition (required, min/max, pattern, select options), never trusted from the client |
| FR-5.13 | Supported field types | text, long text, number, date, single-select, multi-select, checkbox, file upload |
| FR-5.14 | Form versioning | An application stores the form version it was submitted under, so editing the form later never corrupts or silently reinterprets an existing application |
| FR-5.15 | Only administrators edit forms | A facilitator, parent, student or applicant cannot modify the form definition `[tested negatively]` |
| FR-5.16 | Published form is public | The active form definition is readable without an account; draft/unpublished versions are not |
| FR-5.17 | Field deletion is non-destructive | Removing a field from the form stops it being asked of new applicants; it does not erase the value already given by past applicants |

### Module 6 — Fee Payment Portal

| ID | Requirement | Testable assertion |
|---|---|---|
| FR-6.1 | Fee structures | An admin defines fee structures per class/session with itemised line items |
| FR-6.2 | Invoice generation | Invoices are generated per student per term with totals, discount and due date |
| FR-6.3 | Bank transfer details | A parent sees the school's account number, bank and a unique payment reference for an invoice |
| FR-6.4 | Payment declaration | A parent declares a transfer they have made, giving amount, date, reference and uploading proof (bank slip/PDF/image) |
| FR-6.5 | Declaration is not settlement | A declared payment appears as *pending* and does **not** reduce the balance until an administrator confirms it |
| FR-6.6 | Duplicate protection | A confirmed payment cannot be confirmed twice, and cannot exceed the invoice balance without an explicit override reason |
| FR-6.7 | Receipt generation | On confirmation the system generates a receipt with a unique receipt number; the parent is notified and may download it |
| FR-6.8 | Downloadable history | The parent downloads receipts and a payment-history statement |
| FR-6.9 | Balance tracking | Outstanding and paid update as soon as an administrator confirms; the delay is bounded by the confirmation workflow, not by any gateway |
| FR-6.10 | Reconciliation | An admin matches confirmed payments against the bank statement and flags declarations that are pending, unmatched or overpaid |
| FR-6.11 | Financial reporting | An admin exports collection reports by class, term and method |
| FR-6.12 | Money precision | All amounts are `numeric`, never float; currency code travels with every amount |
| FR-6.13 | No cross-currency arithmetic | Amounts in different currencies are never summed; totals are per-currency |
| FR-6.14 | Immutable payments | A confirmed payment cannot be edited or deleted; corrections are reversal + new payment, both audited |
| FR-6.15 | Other payment channels | An admin can record cash or other offline payments, distinguishable from bank-transfer declarations |
| FR-6.16 | Partial payments | A parent may pay in instalments; the invoice tracks paid vs balance and only settles at full payment |
| FR-6.17 | Proof is private | Payment proof is visible to the parent who uploaded it and to administrators only, via a private bucket |

#### ⚠ Approved deviation from the proposal (2026-09-25)

The proposal specifies *"Direct bank account payment gateway integration (supports bank
transfers, debit cards, and USSD)"*. The product owner has chosen **bank transfer with manual
administrator confirmation only**.

Consequently **descoped**: debit-card payment, USSD payment, gateway webhook settlement, and
gateway-native automated reconciliation.

**What this costs us, stated plainly:**
- Payment settlement depends on a human confirming. Balance is accurate only up to the school's confirmation turnaround.
- FR-6.9 "real-time balance" is now bounded by staff action, not by an event.
- Parents cannot self-serve payment; they must upload proof and wait.
- Reconciliation becomes a bank-statement matching exercise rather than an automated comparison.
- No card data is ever handled, so **PCI scope is eliminated** and there is no gateway, no webhook signature verification, and no third-party payment dependency or per-transaction fee.

**What we gain:** zero transaction fees, no merchant account, no payment-vendor outage risk,
works in low-connectivity settings, and materially less to build and secure.

**Mitigation designed in:** each invoice carries a unique payment reference so a bank statement
row can be matched to a specific invoice without asking the parent to write down anything.
This preserves most of the automation benefit at none of the cost. A bank-statement CSV import
to assist matching is offered as an optional addition `[see Q-24]`.

**This deviation is recorded as approved, not overlooked. It should be reflected in any
proposal or funder-facing document submitted onward.**

### Module 7 — General Feedback & Complaint Box (Named)

| ID | Requirement | Testable assertion |
|---|---|---|
| FR-7.1 | Named submission | A complaint records the submitter's identity and is visible to them |
| FR-7.2 | Categories | Every complaint is exactly one of Academic, Financial, Disciplinary |
| FR-7.3 | Status lifecycle | Status moves Pending → In Review → Resolved; no other transitions permitted |
| FR-7.4 | Assignment | An admin assigns a complaint to a staff member and sees the queue |
| FR-7.5 | Resolution | A resolver records a resolution note, and the submitter can read it |
| FR-7.6 | Submitter tracking | The submitter sees current status and every update on their complaint |
| FR-7.7 | Comments thread | Staff and submitter can exchange updates without editing prior entries |
| FR-7.8 | Submitted-at is trustworthy | The submitter cannot alter the recorded creation timestamp |

### Module 8 — Anonymous Feedback Portal

| ID | Requirement | Testable assertion |
|---|---|---|
| FR-8.1 | No identity captured | No column, cookie, IP, user-agent or auth identity is stored with a report |
| FR-8.2 | Anonymous access | An unauthenticated visitor can submit without creating an account |
| FR-8.3 | Metadata stripped | No EXIF/IP/user-agent survives into storage or the audit trail |
| FR-8.4 | Restricted routing | Read access derives from membership of the report's oversight committee, never from the `admin` role and never from `assigned_to`; an admin not appointed to the committee is denied `[Q-03 = C]` |
| FR-8.4a | Auditable appointment | Every committee membership records who appointed it and when, and deactivation is recorded rather than deleted, so authorisation can be proved retrospectively |
| FR-8.4b | No accidental promotion | Being an administrator grants no read access to anonymous reports; committee appointment is a separate, explicit act |
| FR-8.5 | Token issuance | Each submission returns a high-entropy tracking token; only its SHA-256 hash is stored |
| FR-8.6 | Status check by token | Presenting the token returns that report's status and any response |
| FR-8.7 | Token unguessable | Tokens are ≥256 bits of CSPRNG entropy; no sequential or derivable component |
| FR-8.8 | No token → no access | A wrong or absent token returns no data and reveals nothing about report existence |
| FR-8.9 | Rate limited | Submission and status-check are rate limited per IP and globally |
| FR-8.10 | Optional response channel | A reporter may optionally supply an email; the committee's response is then retrievable without the token. The email is stored separately from the report body and is visible only to the committee |
| FR-8.11 | Chain of custody | Every status change to a report is written to an append-only audit log |
| FR-8.12 | Contact detail is segregated | A supplied email lives in a separate table from the report body, is never returned to the reporter, and is never joined into any student/parent record |
| FR-8.13 | Contact is opt-in and informed | The form states plainly that supplying an email makes the submission attributable to that mailbox, and requires an explicit tick — silence must mean anonymity |
| FR-8.14 | Committee-only contact access | Only oversight-committee members can read or act on a supplied contact address; other administrators cannot, including via the API |
| FR-8.15 | Contact retention | A supplied contact address is purged on a defined schedule once the case is closed, because it is the only re-identifying data the system holds |

### Module 9 — Student Discipline & Penalty System

| ID | Requirement | Testable assertion |
|---|---|---|
| FR-9.1 | Offence logging | A staff member logs an offence against a student with date, category and narrative |
| FR-9.2 | Severity classification | Every offence is exactly one of minor, moderate, severe |
| FR-9.3 | Automated parent notification | Logging an offence triggers a parent notification by the configured channel(s) |
| FR-9.4 | Configurable penalty matrix | An admin maps offence category + severity → penalty type; changing the matrix affects new records only |
| FR-9.5 | Detention scheduling | A detention penalty carries a date/time, location and supervising staff |
| FR-9.6 | Community service | A community-service penalty carries a task, due date and completion state |
| FR-9.7 | Suspension tracking | A suspension carries start/end dates and blocks the student from portal access while active `[Q-08]` |
| FR-9.8 | Historical log | A student profile shows every past offence and penalty, ordered by date |
| FR-9.9 | Staff attribution | Each offence records the reporting staff member; that record is immutable after review |
| FR-9.10 | Appeal path | A parent can contest an offence `[Q-09]` — not stated in the proposal |

---

## B. User Stories

### Administrator
- US-A1: As an administrator, I can enrol an approved applicant into a class so that they become an active student with a registration ID.
- US-A2: As an administrator, I can define fee structures per class and generate term invoices in bulk so that billing is consistent.
- US-A3: As an administrator, I can confirm, reject and reconcile bank-transfer declarations against the bank statement so that I can detect missing, duplicate or over-credited money.
- US-A4: As an administrator, I can view system-wide analytics (enrolment, attendance, collections, complaints) so that I can report to stakeholders.
- US-A5: As an administrator, I can publish announcements targeted by role or class so that only the intended audience sees them.
- US-A6: As an administrator, I can configure the offence→penalty matrix so that discipline is applied consistently.
- US-A7: As an administrator, I can assign and resolve complaints so that they do not go stale.
- US-A8: As an administrator, I can deactivate a staff or student account without deleting their history.
- US-A9: As an administrator, I can read the audit log so that I can investigate a disputed action.

### Facilitator / Teacher
- US-T1: As a facilitator, I see only my assigned classes so that I am not distracted by unrelated data.
- US-T2: As a facilitator, I can upload a video lecture and audio guide so that students can study asynchronously.
- US-T3: As a facilitator, I can upload PDF lesson notes and reference materials so that students have written references.
- US-T4: As a facilitator, I can build a step-by-step practical guide so that kinesthetic learners can follow along.
- US-T5: As a facilitator, I can publish a project demonstration so that students can see the expected outcome.
- US-T6: As a facilitator, I can set an assignment with a due date so that students have a clear deadline.
- US-T7: As a facilitator, I can review and grade submissions with written feedback so that students know what to improve.
- US-T8: As a facilitator, I can record attendance quickly for a whole class so that register time is short.
- US-T9: As a facilitator, I can answer and moderate student questions so that the Q&A channel stays useful and safe.
- US-T10: As a facilitator, I can log an offence and see the penalty the matrix assigns, so discipline is consistent.

### Parent
- US-P1: As a parent, I can see all my linked children in one place so that I do not juggle accounts.
- US-P2: As a parent, I can check my child's daily attendance so that I know if they missed a day.
- US-P3: As a parent, I can see continuous assessment scores so that I can intervene before the terminal exam.
- US-P4: As a parent, I can open a termly report so that I understand overall progress.
- US-P5: As a parent, I can read circulars and see events so that I am informed.
- US-P6: As a parent, I can see what homework is set so that I can support my child.
- US-P7: As a parent, I can see the exact fee balance and pay it so that my child is not disadvantaged.
- US-P8: As a parent, I can download a receipt for every payment so that I have proof.
- US-P9: As a parent, I can raise a named complaint and follow its status so that I get a response.
- US-P10: As a parent, I can submit feedback anonymously when I fear retaliation.

### Student
- US-S1: As a student, I can watch a lesson video and download the notes so that I can revise offline.
- US-S2: As a student, I can ask a question about a specific lesson and get an answer so that I am not stuck.
- US-S3: As a student, I can help a classmate by answering, subject to moderation.
- US-S4: As a student, I can submit my assignment and see whether it was received so that I know I met the deadline.
- US-S5: As a student, I can see my gradebook so that I can track my own progress.
- US-S6: As a student, I can follow practical guides step by step so that I can practise hands-on.
- US-S7: As a student, I can report a concern anonymously so that I am safe.

### Applicant
- US-AP1: As an applicant, I can complete the application form at my own pace so that I am not blocked by office hours.
- US-AP2: As an applicant, I can upload my documents and passport photo so that I do not have to visit the school.
- US-AP3: As an applicant, I get a registration ID when accepted so that I have a permanent reference.
- US-AP4: As an applicant, I can check my application status so that I know whether to follow up.

---

## C. Permission Matrix

Legend: **C**reate · **R**ead · **U**pdate · **D**elete · **A**pprove · **Up**load · **Dn**ownload · **G**rade · **P**ay · **V**iew · **M**oderate · **Rs**olve · **M**anage

Scope notes that constrain the whole matrix:
- Facilitator rights are **scoped to assigned classes/subjects**, not school-wide.
- Parent rights are **scoped to linked children**.
- Student rights are **scoped to self**.
- No role may edit or delete a financial record after it is recorded.

### Identity & people
| Entity | Admin | Facilitator | Parent | Student | Applicant |
|---|---|---|---|---|---|
| Students | C R U D | R (assigned) | R (own children) | R (self) | — |
| Parents/Guardians | C R U D | R (assigned) | R (self) | — | — |
| Staff | C R U D M | R (self) | — | — | — |
| Enrolments | C R U D A | R | R (own children) | — | — |
| User permissions | C R U D M | — | — | — | — |

### Academics
| Entity | Admin | Facilitator | Parent | Student | Applicant |
|---|---|---|---|---|---|
| Sessions / Terms | C R U D M | R | R | R | R |
| Classes | C R U D M | R (assigned) | R | R | — |
| Subjects | C R U D M | R (assigned) | R | R | — |
| Class-subject assignment | C R U D M | R (own) | — | — | — |
| Attendance | C R | C R U (assigned) | R (own children) | R (self) | — |
| Assessments | C R U D M | C R U D (assigned) | R | R | — |
| CA scores / Grades | C R | C G (assigned) | R (own children) | R (self) | — |
| Term reports | C R M | R (assigned) | R (own children) | R (self) | — |

### Learning content
| Entity | Admin | Facilitator | Parent | Student | Applicant |
|---|---|---|---|---|---|
| Assignments | C R U D M | C R U D (assigned) | R (own children) | R V | — |
| Submissions | C R | C R G (assigned) | R (own children) | C R (own) | — |
| Learning materials | C R U D M | C Up Dn U D (assigned) | R V | R V Dn | — |
| Practical guides | C R U D M | C R U D (assigned) | R V | R V | — |
| Questions | R M | R A M (assigned) | R | C R (own) | — |
| Answers | R M | C R M (assigned) | R | C R (own) | — |

### Communication & calendar
| Entity | Admin | Facilitator | Parent | Student | Applicant |
|---|---|---|---|---|---|
| Announcements / circulars | C R U D M | C R U (assigned) | R | R | R |
| Events / calendar | C R U D M | C R U (assigned) | R | R | R |
| Notifications | R | R (own) | R (own) | R (own) | R (own) |

### Registration
| Entity | Admin | Facilitator | Parent | Student | Applicant |
|---|---|---|---|---|---|
| Applications | C R U D A | R | R (own children) | — | C R U (own) |
| Application documents | R V A D | — | R (own) | — | C Up Dn (own) |
| Registration ID | C A | — | R (own) | R (self) | R (own) |

### Fees
| Entity | Admin | Facilitator | Parent | Student | Applicant |
|---|---|---|---|---|---|
| Fee structures / items | C R U D M | R | R | R | — |
| Invoices | C R U D A M | R | R (own children) | R (self) | — |
| Payment declarations | C R M (confirm/reject) | — | P R Dn (own) | — | — |
| Payments (confirmed) | R V | — | R (own children) | — | — |
| Receipts | R V M | R | R Dn (own) | R (own) | — |
| Bank reconciliation | C R M | — | R (own) | — | — |
| *(payments update/delete)* | **Nobody** | — | — | — | — |

### Complaints, anonymous feedback, discipline
| Entity | Admin | Facilitator | Parent | Student | Applicant |
|---|---|---|---|---|---|
| Complaints (named) | C R U Rs M | C R Rs (assigned) | C R (own) | C R (own) | C R (own) |
| Anonymous reports | R M **iff member of that report's committee** | none | none | none | none |
| Anonymous report contacts (opt-in email) | R **iff member of that report's committee** | none | none | none | none |

**Rule (Q-03 = C, decided 2026-09-25).** Read access derives from **committee membership**, never
from the `admin` role and never from `assigned_to`. Concretely:
- An administrator who is **not** appointed to the oversight committee is **denied**. This is
  the security value of the feature and is the first negative test written.
- `assigned_to` is **workload tracking only**. It confers no access, so "assign it to me so I
  can see it" is not a backdoor.
- Committee membership is **orthogonal to role** — a user can be an admin *and* a committee
  member; the two are independent facts.
- A reporter reads their own report by **token only**, never by role.
- **No exception is built.** The break-glass path is deferred (no named holder yet) — see below.
  Until it is resolved the rule is absolute, which is the safe direction to fail.
| Discipline records | C R U D M | C R (assigned) | R (own child) | R (self) | — |
| Penalties | C R U D M | C R (assigned) | R (own child) | R (self) | — |
| Penalty matrix | C R U D M | R | — | — | — |
| Audit log | R | — | — | — | — |

---

## D. Database Plan

### Entities

Identity & people
- `profiles` — 1:1 with `auth.users`. The only place role and personal identity live.
- `staff` — 1:1 with `profiles`. staff_number, employment_type, qualification.
- `students` — 1:1 with `profiles`. admission/registration number, status.
- `guardianships` — M:N parent↔student. Makes "linked children" a query, not a guess.

Academic structure
- `academic_sessions` — e.g. 2025/2026; exactly one `is_current`.
- `terms` — per session; name, sequence, start/end dates.
- `subjects`
- `classes` — per session; level, stream, capacity, optional homeroom staff.
- `class_subjects` — M:N class × subject × staff. **This is the backbone of facilitator scoping.**
- `enrollments` — student in class per session, with status.

Academic records
- `attendance_records` — student, class, date, status. Unique on (class, student, date).
- `assessments` — class, subject, term, type, max_score, weight.
- `grades` — assessment × student score, feedback. Terminal + CA both modelled here.
- `term_reports` — one per student per term; a frozen snapshot so a published report does not silently change.

Learning content
- `assignments` — class, subject, title, instructions, due_at, max_score, author.
- `submissions` — assignment × student; file path or text; submitted_at; status.
- `learning_materials` — class/subject; material_type (lesson_note, ebook, video, audio, reference, practical_guide, demonstration); storage path; allow_download.
- `practical_guide_steps` — ordered steps for a material of type practical_guide. Split out only because "step-by-step" is an explicit proposal requirement.

Q&A
- `questions` — author, class, subject, lesson reference, body, status (open/answered/closed/flagged).
- `answers` — question, author, body, is_accepted, moderation status.

Communication
- `announcements` — audience, class, publish_at, expires_at, pinned. Serves "circulars".
- `events` — academic calendar entries; start/end, type, audience, class.
- `notifications` — recipient, type, payload, read_at.

Registration
- `application_form_definitions` — admin-defined form: name, version, status (draft/published/retired), field schema as JSONB, published_at. **Approved (Q-05): the form is dynamic.**
- `applications` — applicant, session, form_version_id (the version submitted under), answers as JSONB, status, decision note, reviewer. Storing `form_version_id` is what satisfies FR-5.14.
- `application_documents` — application, doc_type (birth_certificate, transcript, passport_photo), path, verified_by, verified_at.

Fees
- `fee_structures` — session, class, name.
- `fee_items` — structure, label, amount, currency.
- `invoices` — student, session, term, currency, totals, discount, status, due_on, **payment_reference** (unique, printed on the bank transfer).
- `invoice_items` — invoice, label, amount. Needed for per-item discounts and auditability.
- `payment_declarations` — invoice, student, amount, transfer_date, bank_reference, proof path, declared_at, status (pending/confirmed/rejected). **Parent-initiated, not settlement.**
- `payments` — invoice, student, amount, currency, method, status, paid_at, confirmed_by, declaration_id. **Admin-confirmed, immutable once confirmed.**
- `receipts` — payment, receipt_number, issued_at, document path.

Complaints
- `complaints` — submitter, category, subject, body, status, assigned_to, resolution.
- `complaint_updates` — complaint, author, body. Append-only thread.

Anonymous feedback — oversight committee (Q-03 = C)
- `oversight_committees` — id, name, purpose, is_active, created_at. A named body, e.g. "Safeguarding & Anonymous Feedback Oversight".
- `oversight_committee_members` — committee_id, profile_id, member_role (chair/secretary/member), appointed_on, appointed_by, is_active, deactivated_on. PK (committee_id, profile_id). **Appointments are dated and reversible so authorisation can be proved after the fact** — the reason this is not a boolean.

Anonymous feedback
- `anonymous_reports` — reference_code, oversight_committee_id (FK, not null), contact_token_hash, category, body, status, assigned_to, outcome. **No identity columns of any kind.** `assigned_to` is workload tracking and confers no access.
- `anonymous_report_contacts` — report_id, email, notified_at, purged_at. **Separate table, committee-only, purgeable.** This is the only re-identifying data the subsystem holds (FR-8.12).
- `report_audit_log` — report, action, actor, note, at. Append-only chain of custody.

Discipline
- `discipline_records` — student, date, category, severity, description, reported_by, status.
- `penalties` — record, type, detail, scheduled_for, due_on, status, assigned_by.
- `penalty_matrix` — offence_category, severity, penalty_type. Admin-editable.

System
- `audit_log` — actor, action, entity, entity_id, before, after, ip, at. Append-only.

**Deliberately excluded** (your instruction: do not create tables merely because they sound useful):
`messages` (direct DMs — not in the proposal), `likes`/`reactions`, `sessions`/`refresh_tokens`
(Supabase Auth owns these).

**Excluded but now arguable — do not build until a decision exists:**
- `roles` / `permissions` tables. Your role model is fixed at five. This stays excluded unless
  Q-18 asks for Registrar/Bursar sub-roles *or* Q-03 selects a design that implies capabilities.
  Note the committee membership table proposed under Q-03 is **not** a permissions table and does
  not change the role model — it is a group of people, orthogonal to what job they do.
- `notifications_outbox`. Only justified if the discipline-notice channel (Q-02 follow-on) is
  email/SMS rather than in-app only. With Q-01/Q-02 decided there is no payment notification
  need justifying it any more — payment notices are a by-product of manual confirmation.

### Relationships

```
profiles 1─1 staff          profiles 1─1 students
profiles 1─* enrollments?  no — students carry enrolment
guardianships  *──* students      (parent ↔ child, via profile ids)

academic_sessions 1─* terms
academic_sessions 1─* classes
classes *──* subjects   via class_subjects  ──* staff   (teaching assignment)
students 1─* enrollments *─1 classes

attendance_records  → students, classes, terms
assessments         → classes, subjects, terms
grades              → assessments, students
term_reports        → students, terms            (frozen snapshot)

assignments         → classes, subjects, staff(author)
submissions         → assignments, students        (unique: assignment × student)
learning_materials  → classes, subjects, staff(author)
practical_guide_steps → learning_materials         (ordered)

questions           → students(author), classes, subjects
answers             → questions, profiles(author)

applications        → profiles(applicant), academic_sessions, application_form_definitions
application_documents → applications, profiles(verifier)

fee_structures → academic_sessions, classes
fee_items      → fee_structures
invoices       → students, academic_sessions, terms
invoice_items  → invoices
payment_declarations → invoices, students
payments       → invoices, students, payment_declarations, profiles(confirmed_by)
receipts       → payments

complaints        → profiles(submitter, assignee)
complaint_updates → complaints, profiles(author)

oversight_committees     (no FK to profiles)
oversight_committee_members → oversight_committees, profiles
anonymous_reports  → oversight_committees   (no FK to profiles — by design)
anonymous_report_contacts → anonymous_reports   (committee-only)
report_audit_log  → anonymous_reports

discipline_records → students, profiles(reporter)
penalties         → discipline_records, profiles(assigned_by)
penalty_matrix    → (config, no FK)

audit_log → profiles(actor)
```

### Conventions
- `uuid` PKs, `timestamptz` in UTC, `date` for calendar dates.
- Money: `numeric(12,2)` **plus** an ISO 4217 `char(3)` on every monetary row. Never summed across currencies.
- RLS enabled on every table. Every helper is `security definer` with a pinned `search_path`.
- Deletes cascade only where the child is meaningless without the parent; otherwise `restrict`.

---

## E. Application Architecture

```
Browser (responsive web)
   │
   ▼
Next.js 16 App Router  ── deployed on Vercel (or equivalent)  [Q-10]
   │  Server Components by default; 'use client' only for interactivity
   │
   ├── src/proxy.ts            session refresh + optimistic redirects (NOT authz)
   ├── src/lib/dal/*           data access layer: role checks, DTO mapping
   ├── src/app/*/page.tsx      role-scoped portals
   ├── src/app/api/*           Route Handlers for privileged operations
   │
   ▼
Supabase
   ├── Auth        email/password, PKCE, email confirmation
   ├── Postgres    all business data + RLS as the real authorisation boundary
   ├── Storage     private buckets, RLS policies, signed URLs
   └── (Realtime)  [deferred — see Q-11]
   │
   ▼
Third parties  [remaining external dependencies]
    ├── Transactional email / SMS provider              Q-02 follow-on (discipline notices)
    └── Video transcoding or external video host        Q-12

    ── REMOVED 2026-09-25 (Q-01) ──
    Payment gateway. Bank transfer is executed by the parent through their own
    banking app; the system only records and confirms. No third-party payment
    dependency, no merchant account, no PCI scope. This is why the diagram above
    no longer contains a payment provider.
```

**Why Server Components + DAL rather than a separate API tier:** the browser never talks to
Supabase with the anon key for privileged reads. Every read passes through server code that
applies role checks and returns narrow DTOs. RLS remains the backstop, not the primary control,
so a mistake in application code is a 500 rather than a data breach.

**Why Route Handlers for privileged operations:** anything needing a service-role key
(anonymous report submission, receipt generation, bank-statement import) is isolated in a
handler that no browser can call directly with elevated rights. Note the payment webhook case
disappeared with Q-01 — there is no external party to receive a callback from, which removes an
entire class of signature-verification and replay attack surface.

---

## F. Navigation Architecture

### Administrator
Overview · Students · Parents · Staff · Classes & Subjects · Enrolments · Academics (sessions/terms) · Attendance · Assessments & Grades · Term Reports · Learning Materials · Assignments · Q&A Moderation · Applications & Verification · Fee Structures · Invoices · Payments & Reconciliation · Receipts · Complaints · Anonymous Reports (committee) · Discipline & Penalties · Announcements · Calendar · Reports · Users & Permissions · Settings · Audit Log

### Facilitator / Teacher
My Classes · My Classes → Attendance · My Classes → Assignments → Submissions & Grading · My Classes → Materials (notes/video/audio/reference) · Practical Guides · Q&A (moderation queue) · Students (assigned only) · Discipline (log offence) · Complaints (assigned) · Announcements · Calendar

### Parent
Overview · My Children · My Children → Attendance · My Children → Results (CA + term report) · Assignments · Circulars · Events · Fees (balance, pay, history) · Receipts · Complaints · Anonymous Feedback

### Student
Overview · My Materials (notes, video, e-books) · Practical Guides · Assignments → Submit · My Grades · My Attendance · Q&A → Ask a Question · Announcements · Report a Concern (anonymous)

### Applicant
Apply · My Application (status) · My Documents · Upload Documents · Announcements

**Rule:** navigation is derived from one permission source shared with the DAL and the UI. A
nav item that a user cannot use is not rendered; if they request the URL anyway, the server
refuses. Both layers use the same permission constants.

---

## G. Security Model

**Authentication.** Supabase Auth, email + password, PKCE for OAuth/email links. Email
confirmation required before portal access. Session in `httpOnly`, `Secure`, `SameSite=Lax`
cookies via `@supabase/ssr`.

**Password security.** Minimum 12 characters (not 8 — length beats composition rules).
No complexity rules that produce `Password1!`. Check against a breached-password list. No
user-visible password hint. Rate-limit and lock out on repeated failure. Argon2id is
Supabase's default; no custom hashing in application code.

**Session management.** Rotating refresh tokens, server-side revocation. `getClaims()`
(not `getSession()`) for identity decisions. `src/proxy.ts` refreshes only; it is explicitly
not an authorization boundary. Sessions expire; long-lived admin sessions are re-verified.

**RBAC.** Three layers that must all agree: (1) UI nav visibility, (2) DAL role guard on every
read/write, (3) Postgres RLS as the final backstop. A single permission vocabulary in
`src/lib/rbac.ts`. No role can grant itself permissions.

**Data isolation.** Students see self only. Parents see linked children only, resolved through
`guardianships` — never by a client-supplied child id. Facilitators see assigned
classes/subjects only, resolved through `class_subjects`. Every helper function is
`security definer` with `set search_path = public` to avoid policy recursion.

**File access control.** Private buckets only. No public URLs. Downloads are short-lived
signed URLs minted server-side *after* an authorization check. Upload paths are
folder-scoped to the uploader so ownership is a path property, not a trusted column.
MIME type and size validated on upload; filenames never trusted as supplied; no SVG.

**Audit logs.** Append-only `audit_log` + `report_audit_log`. Recorded: authentication events,
role changes, money movement, discipline records, report triage, document verification.
Audit tables are `insert`-only for the service role and never exposed to non-admin reads of
raw before/after payloads.

**Payment security (revised by Q-01/Q-02, 2026-09-25).** No card data is ever accepted, stored
or transmitted, so the system is **out of PCI-DSS scope** — this is a deliberate architectural
consequence of dropping the gateway, not an oversight. What replaces gateway-level controls:
- Payment **proof** files (bank slips) are private-bucket, parent-scoped, never publicly
  addressable, and are deleted under a retention rule once the invoice is settled and the
  dispute window has passed.
- A `payment_declaration` is a claim and carries no authority. Only an admin-confirmed
  `payment` moves a balance. There is no code path — including any admin path — by which a
  declaration alone can credit an invoice.
- Confirmation is a privileged action. It is written to `audit_log` with actor, amount,
  invoice, and the declaration being resolved, and a confirmed payment is immutable (FR-6.14).
  Corrections are reversal + new payment, never an edit.
- Concurrency: two admins confirming simultaneously must not double-credit. Enforced with a
  conditional update on invoice balance plus a uniqueness constraint, not by hope.
- The unique `payment_reference` printed on each invoice is a **confidentiality-limited**
  identifier, not a secret. It must not be guessable *and* the declaration must still require
  proof, so that knowing a reference alone cannot credit an account.

**Anonymous subsystem — the sharpest edge in the system.** The requirement is that a reporter
can be certain nobody can trace the report to them, including from within the school's own
administration. That is only true if read access is narrower than the `admin` role. Three rules
follow and are non-negotiable regardless of the Q-03 outcome:
1. No identity column, IP, user-agent, or auth identity may reach `anonymous_reports` (FR-8.1).
2. Reporter access is by high-entropy token only (FR-8.5–8.8), never by role.
3. The opt-in contact is the single re-identifying datum, held in its own table, restricted to
   the committee, and purged on close (FR-8.12–8.15).

**Rate limiting.** Application level on: sign-in attempts, anonymous report submission, token
status checks, complaint submission, Q&A posting, uploads. Layered with provider-level
protection at the edge. In-memory limiting is **not** sufficient across serverless instances —
see `[DECISION]` in §K.

**Input validation.** Zod at every boundary: server actions, Route Handlers, and any client
form. PostgREST filter metacharacters escaped in search inputs. File type/size validated
server-side regardless of client checks. No string interpolation of user input into SQL.

**Encryption.** TLS in transit. Supabase encrypts at rest. Field-level encryption is **not**
proposed for PII — RLS isolation plus encryption at rest is the intended posture. Document
files are private with signed URLs.

**Secure secrets management.** Only two public env vars reach the browser
(`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`). Any service-role key is
server-only, never prefixed `NEXT_PUBLIC_`, never logged. Secrets live in the host's env
store; `.env.local` is gitignored; a committed secret is treated as compromised and rotated.

**Backup & recovery.** Supabase managed PITR (7-day minimum) + daily logical dumps retained
off-platform. Storage objects included in the backup scope. Documented RPO/RTO — **needs your
input on acceptable data loss** (`[Q-13]`). Restore rehearsed at least once before go-live, not
just configured.

**Data protection.** Student records are minors' data. Consent from guardian for photo/video
capture. Retention policy for expelled/graduated students. Right-to-erasure conflicts with
financial and audit retention — needs a documented policy, not an ad-hoc decision (`[Q-14]`).

---

## H. Testing Strategy

No test exists in the current codebase. This is the gap I am most concerned about.

**Unit tests** — pure logic: grading calculations, attendance rate, fee balance arithmetic,
per-currency grouping, validation schemas, permission matrix. Fast, no I/O.

**Integration tests** — DAL functions against a real Postgres instance (local Supabase or a
throwaway project). Assert both the happy path and that RLS blocks the forbidden path. This is
where the security model is actually proven.

**RLS/security tests** — a dedicated suite that logs in as each of the five roles and attempts
every forbidden action, asserting denial. Explicit negative cases:
- Student requesting another student's grades → denied
- Parent requesting an unlinked child → denied
- Facilitator attaching a material to a class they do not teach → denied
- Applicant editing an application after review → denied
- Anyone forging a role in a client payload → ignored
- Anonymous token guessing → no data, no existence disclosure
- Webhook replay → no double credit

**End-to-end tests** — Playwright over the critical journeys: apply → approve → enrol → invoice
→ pay → receipt; student submits assignment → facilitator grades → student sees grade;
anonymous report → committee triages → requester checks by token; offence logged → parent
notified.

**Payment tests** — the interesting cases are no longer gateway timeouts and duplicate webhooks
but the human ones, which need testing *because* a human is the control:
- a declaration is confirmed **twice** by two different staff members (double-credit) — must be
  rejected;
- a confirmation **exceeds** the outstanding balance — must require an explicit override reason;
- a declaration is confirmed against the **wrong** invoice — the unique payment reference must
  make the mismatch visible rather than silently crediting;
- a rejected declaration leaves the balance **unchanged** and the parent sees why;
- a confirmed payment cannot then be edited or deleted (FR-6.14);
- receipt numbering is unique and gapless under concurrent confirmation;
- reconciliation is provable against a fixture bank statement, including rows that match nothing.

These are the tests that protect the fee ledger now that no signed webhook does.

**UAT** — scripted scripts per role with real staff, students and parents, run against staging
before go-live. Your Phase 4 in the proposal's own roadmap is QA; this formalises it.

**Performance** — roster at 1,000 students; attendance marking for 60 students in one screen;
analytics queries within agreed latency.

**Accessibility** — keyboard navigation, focus management in the mobile drawer, contrast,
screen-reader labels on icon-only controls, form error association.

**CI gate** — `typecheck`, `lint`, unit, integration and RLS suites must all pass before any
merge. No exceptions for "looks like it works".

---

## I. Development Roadmap

Mapped onto the proposal's own 4 phases, split into reviewable increments. **Each row is a
phase I will build, test, then stop for your approval.**

| # | Increment | Covers | Depends on |
|---|---|---|---|
| 0 | Discovery & spec | This document | Proposal |
| 1 | Foundation | Schema, RLS, auth, portal shell, design system, CI, test harness | Q-01…Q-14 answers |
| 2 | Identity & people | Staff, students, guardianships, enrolments, admin CRUD | 1 |
| 3 | Academics | Sessions, terms, subjects, classes, class_subjects, teaching assignment | 2 |
| 4 | Attendance | Recording, student view, parent view, rate calculation | 3 |
| 5 | Assessment & gradebook | Assessments, CA scores, terminal grades, term reports, position | 3, grading scale |
| 6 | Registration | Application form, documents, verification, registration ID | 2, storage, Q-05 |
| 7 | Learning materials | Upload (note/video/audio/reference), student browse, signed downloads | 3, storage, Q-12 |
| 8 | Practical guides | Step-by-step guides, demonstrations | 7 |
| 9 | Assignments & submissions | Create, submit, review, grade | 5, 7 |
| 10 | Q&A | Ask, answer, peer answers, moderation queue | 3, 7 |
| 11 | Announcements & calendar | Circulars, targeted audiences, events | 1 |
| 12 | Fee structures & invoicing | Structures, bulk invoice generation, balances | 2, currency |
| 13 | **Payments** | Bank-transfer declarations, manual confirmation, receipts, history, reconciliation | 12 |
| 14 | Complaints | Named tickets, categories, status, assignment, resolution | 1 |
| 15 | Anonymous feedback | Stripped submission, opt-in contact, token tracking, committee routing | 1. **Pre-launch gate: break-glass deferral** |
| 16 | Discipline & penalties | Offences, severity, penalty matrix, detention/community/suspension | 2, Q-09, Q-10 |
| 17 | Notifications | In-app first, then external channels | Q-02 |
| 18 | Analytics & reporting | Admin dashboards, financial reports, exports | 12, all domains |
| 19 | Hardening & accessibility | Full RLS suite, E2E, perf, a11y, pen-test fixes | all |
| 20 | UAT & deployment | Staging, UAT scripts, training, go-live, backup rehearsal | 19 |

**Sequencing note (updated 2026-09-25):** with Q-01/Q-02 decided as bank transfer + manual
confirmation, payments (#13) are **no longer the highest-risk item** — there is no third-party
dependency, no webhook to secure, and no merchant account. The remaining risk is operational:
the confirmation workflow must be fast enough that parents are not left waiting on an unpaid
balance, and its audit trail is now the thing standing between a disputed fee and a defensible
answer. It remains late in the sequence only because invoicing (#12) must exist first.

**Gating (updated):** increments 1–12, 13, 14, 16, 18 are now unblocked by external providers.
**15 is blocked** on Q-03. **17 is blocked** on Q-02's follow-on: with no gateway, the
"automated notification dispatch" for discipline (FR-9.3) is a separate channel decision that
Q-02 did not cover.

---

## J. Decision Log

Approved by the product owner. Each of these changes the architecture and was decided
deliberately, not by omission.

| Date | ID | Decision | Consequence recorded |
|---|---|---|---|
| 2026-09-25 | Q-01 | Payments: **bank transfer only, manual admin confirmation**. No gateway, no card, no USSD. | Deviates from the proposal's "gateway integration". PCI scope eliminated, no transaction fees, no third-party dependency. Settlement now depends on staff action. See deviation note in Module 6. |
| 2026-09-25 | Q-02 | Payment confirmation is **manual**. | Split `payment_declarations` (parent claim) from `payments` (settled fact). Only `payments` moves balances. The confirmation audit trail carries the integrity burden a signed webhook would have. |
| 2026-09-25 | Q-03 | Anonymous oversight committee is a **first-class group** (option C): `oversight_committees` + `oversight_committee_members`, with `anonymous_reports.oversight_committee_id`. | Read access is narrower than `admin`. Membership is orthogonal to role, dated, reversible and auditable. `assigned_to` confers no access. Rejected: a profile boolean (no appointment history), a sixth role (breaks one-role-per-user for admin-also-member), and assignment-based access (backdoor). |
| 2026-09-25 | Q-04 | Anonymous reports: **optional opt-in email**, stored separately, committee-only, purgeable on close. | System is pseudonymous, not anonymous, when an email is supplied. Form must state this plainly (FR-8.13). New `anonymous_report_contacts` table. |
| 2026-09-25 | Q-05 | Application forms are a **dynamic admin-defined builder**. | New `application_form_definitions` with JSONB schema and versioning. Applications pin a version. Permanent maintenance surface; higher test burden. |
| 2026-09-25 | — | **Break-glass path deferred**, not designed. No named safeguarding lead or board contact exists yet. | Access rule is absolute (committee only) in the meantime, which is the safe direction to fail. Logged as a **pre-launch gate on increment 15**. No speculative `emergency_access` table built. Later implementable as a time-boxed membership row. |
| 2026-09-25 | — | Record this deviation in onward-facing documents. | The proposal's Module 6 overstates payment capability relative to what will be built. |
| earlier | — | Supabase (Postgres/Auth/RLS/Storage) as backend. | Committed. |
| earlier | — | Schema to be **rebuilt from the proposal**, not retrofitted. | Existing `src/` code predates the proposal and is not an implementation of it. |

---

## K. Open Questions — Your Decisions Required

Ordered by how much they change the architecture.

### BLOCKERS — needed before I can finalise the schema

**Schema blockers: NONE outstanding.** Q-01, Q-02, Q-03, Q-04 and Q-05 are all decided, so every
table in §D is now specified. What remains open are **policy** questions (below) that change
column values and validation, not the shape of the schema — plus one deferred item that is a
launch gate rather than a blocker.

**✅ Q-01 · Payment gateway — DECIDED 2026-09-25.** *Bank transfer only, manual administrator
confirmation. No payment gateway, no card, no USSD, no webhook.* See the approved-deviation
note under Module 6 for what this costs and what it saves. **Consequence:** increment 13 is no
longer externally blocked — no merchant account or provider needed. The new risk is
*operational*: settlement depends on staff confirming, so the confirmation workflow and its
audit trail carry the integrity burden that a signed webhook would otherwise carry.

**✅ Q-02 · Payment confirmation model — DECIDED 2026-09-25.** *Manual confirmation.* This is
why `payment_declarations` and `payments` are now separate tables: a declaration is a claim by
a parent, a payment is a settled fact recorded by staff. Only the latter moves money.

**✅ Q-03 · Anonymous oversight committee — DECIDED 2026-09-25 · Option C.**
*First-class committee group: `oversight_committees` + `oversight_committee_members`, with
`anonymous_reports.oversight_committee_id`.* Consequences, all now specified:
- Read access derives from committee membership **only** — never from `admin`, never from
  `assigned_to`. The negative test "admin not on the committee is denied" is written (FR-8.4).
- Membership is **orthogonal to role**; an admin can be both admin and committee member.
- Appointments are **dated and reversible**, never deleted, so authorisation is provable after
  the fact (FR-8.4a). This is the specific weakness of the rejected boolean option.
- `assigned_to` is demoted to workload tracking, removing the "assign it to me" backdoor.
- **The break-glass exception is deferred, not designed** (see below). It is a narrow exception to
  the rule above, not a redesign, so the data model holds either way and no schema work is blocked.

*Rejected alternatives, recorded so the reasoning survives:* a `profiles` boolean (no appointment
or deactivation history, and a second committee would force another boolean); a sixth role
(one-role-per-user breaks for the admin-who-is-also-a-member case, forcing roles to become
many-to-many, and it models a committee as a job); assignment-based access (does not match
"designated committee" and creates a backdoor).

*Two governance questions deferred to configurable defaults (changeable later without a
migration):* whether the Head of School receives automatic access (**default: appointed to the
committee like anyone else — no automatic access**), and minimum committee membership
(**default: enforced minimum of 2**, so one person cannot unilaterally read and delete reports).

#### Options considered (archived for the record)

*Why this was not a one-line decision.* Two constraints collide. (a) A committee is a **group**,
but the role model gives each user exactly **one** role, and a committee member is normally
*also* an administrator. (b) The confidentiality guarantee rests on read access being **narrower
than `admin`** — if administrators can read anonymous reports by default, the head of school is
not protected from a report about them and the feature protects nobody. That is a safety
property, not a tidiness concern.

| Option | Design | Verdict |
|---|---|---|
| **A** | `is_oversight_member` boolean on `profiles` | Rejected — records no appointment or deactivation history. For a body handling abuse/safeguarding reports, "prove who was authorised, and when" is exactly what you would need. A second committee would force another boolean. |
| **B** | Sixth role, e.g. `oversight_committee` | Rejected — one-role-per-user breaks for the admin-who-is-also-a-member case, forcing roles to become many-to-many. Also models a committee as a *job*, which it is not. |
| **C** | `oversight_committees` + `oversight_committee_members`; `anonymous_reports.oversight_committee_id` FK | **Chosen.** Only option where "admin not on the committee is denied" is expressible, and that denial is the entire security value of Module 8. |
| **D** | Reuse `assigned_to`; no committee concept | Rejected — does not match "designated committee". Access would depend on who happened to be assigned, creating a backdoor. |

*Implementation notes carried forward:* the RLS helper must be `security definer` with a pinned
`search_path`, because it reads `oversight_committee_members`, which itself carries RLS. Same
pattern as the existing helpers, and easy to get wrong.

Deliberately **not** bundled: generic sub-roles (Registrar, Bursar). That is Q-18, a larger change
to the whole permission model, and pre-building it would be guessing.

#### DEFERRED — the break-glass path

**Deferred by product-owner decision, 2026-09-25. Not an oversight and not forgotten.**

*Position at time of deferral:* the product owner has no named safeguarding lead, board chair or
governing-body contact yet, and will revisit. No role is invented and **no mechanism is built** —
pre-emptively creating an `emergency_access` table would violate the standing instruction not to
build tables speculatively.

*Consequence accepted for now:* the access rule is **committee membership only, with no
exception**. A report concerning a committee member has no defined route out of the committee.

**This is a launch gate for Module 8, not a blocker for Phase 0 or Phase 1.** Module 8 is
increment 15, late in the roadmap, so deferring costs nothing today. But it must be resolved
**before the anonymous module is exposed to real reporters** — a reporter who discloses abuse and
watches nothing happen is worse off than one who never filed. Concretely: do not let increment 15
go to production while this is open.

*Why the deferral is low-cost.* Because Q-03 = C was chosen, a break-glass grant can later be
represented as a **time-boxed, dated `oversight_committee_members` row** (`is_active = false`
after expiry, `appointed_by` naming the granter) plus an audit entry — rather than an entirely
separate access system. The committee model absorbs it. The parts that are *not* free are the
policy ones: mandatory written reason, auto-expiry, and notifying the committee. Those still need
a decision, and still need a named holder.

*Also unresolved, and not solvable in software:* if the entire senior group is the subject of a
report, the escalation path leads outside the school. No access-control mechanism fixes that; it
requires a human relationship already in place. Worth raising with the board before launch.

**✅ Q-04 · Anonymous response channel — DECIDED 2026-09-25.** *Opt-in email, stored separately,
committee-only, purgeable on close.* Note this makes the system **pseudonymous rather than
anonymous** when an email is given. The proposal's phrase "completely stripped metadata
ensuring sender anonymity" therefore holds strictly only for reporters who leave the box
unticked. FR-8.13 requires the form to say so in plain words — consent copy that misdescribes
the guarantee would make the system dishonest, not just non-compliant.

**✅ Q-05 · "Customizable digital application forms" — DECIDED 2026-09-25.** *Dynamic builder.*
This is the most expensive of the four and I want to be explicit that it is a permanent
maintenance surface, not a one-off. Accepted design:
- `application_form_definitions` holds field schema in JSONB, with a version per publication.
- Applications pin the version they were submitted under, so editing the form can never
  reinterpret an existing application (FR-5.14).
- Validation is generated server-side from the definition; the client is never trusted.
- Field deletion stops a question being asked; it does not erase answers already given.
- Field types are a fixed, validated enum (FR-5.13) — **not** arbitrary HTML. Admin-authored
  markup would be a stored-XSS vector and is explicitly out of scope.
- Testing burden is higher than a static form: every field type needs its own validation tests.
  Budgeted in increment 6.

### Needed before the relevant increment

**Q-06 · Peer answers.** Proposal says answers "from facilitators or peers". Should student
answers require moderator approval before appearing? *Recommendation: yes — post-moderated,
avoids misinformation reaching other students.*

**Q-07 · Returning-student enrolment.** Proposal says "prospective *and returning* students".
Re-enrolment of existing students into a new session — is this a fee + approval flow, or a
one-click admin roll-over?

**Q-08 · Suspension effect.** Should an active suspension actually block portal login? This is
a real enforcement decision with privacy implications if applied wrongly.

**Q-09 · Appeals.** Not in the proposal. Is there a formal appeal route for parents contesting
an offence? If yes it is a workflow, not a field.

**Q-10 · Discipline notification channel.** "Automated notification dispatch to parents" — SMS,
email, in-app, or all? SMS has per-message cost and needs a Nigerian short-code/long-code.

**Q-11 · "Mobile-ready".** Responsive web only, or native Android/iOS apps? Native roughly
triples the work and cost. *Recommendation: responsive web + installable PWA, revisit native
only if demanded.*

**Q-12 · Video hosting.** "Pre-recorded video lectures" — self-host in Supabase Storage, or
YouTube/Vimeo embed? Self-hosting large video is expensive (bandwidth + storage) and needs
transcoding; embedding is nearly free but students need a third-party account or we use
unlisted videos. *Recommendation: embed for v1, self-host later if budget allows.*

**Q-13 · Backup targets.** Acceptable data loss (RPO) and acceptable downtime (RTO)? Determines
PITR retention and whether we need cross-region replicas.

**Q-14 · Data retention & compliance.** Country of operation, and whether NDPA/GDPR/equivalent
applies. Determines retention windows and whether minors' data needs a guardian-consent flow.

### Smaller items, batched

**Q-15** Grading scale: percentage, letter, or position? How many terms per session? →
*needed before increment 5.*
**Q-16** Class levels: confirm the exact year groups (e.g. Primary 1–6, JSS 1–3, SSS 1–3) and
session naming → *before increment 3.*
**Q-17** Currency: confirm NGN, and whether any other currency is ever invoiced.
**Q-18** Sub-roles: do you need Registrar, Bursar/Accountant, Head of Department, Discipline
Committee as distinct roles, or is "Administrator" sufficient for v1? *Recommendation: add
Bursar before payments go live; fees and discipline are the two areas where least privilege
matters most.*
**Q-19** Existing data: is there current student/staff/financial data to migrate?
**Q-20** Expected scale: number of students, staff, concurrent users → *affects Supabase plan
and whether realtime is needed.*
**Q-21** Rate limiting: use Supabase's edge/CDN protection, or an external service? In-memory
limiting does not work across serverless instances. *Recommendation: Supabase/edge-level for
v1, dedicated service if abuse appears.*
**Q-22** Deployment target: Vercel, or self-hosted/cloud-agnostic? *Recommendation: Vercel for
speed; confirm it is acceptable for your data-residency needs.*
**Q-23** Does the anonymous channel accept submissions from **non-registered visitors**, or only
existing students/parents/staff? The proposal says "students, parents, and staff" — the role list
you gave me is ambiguous. *Recommendation: registered users only, to reduce abuse and legal
exposure.*

**Q-24** *(new)* **Bank-statement import for reconciliation.** With manual confirmation, matching
declarations to bank credits is manual. Should the admin be able to upload a bank statement CSV
that the system matches against outstanding declarations and flags what it cannot pair?
- *Option A:* No import — reconciliation is a human reading two screens. Zero build cost, highest error rate.
- *Option B:* CSV import with best-effort auto-matching on the unique payment reference, surfacing unmatched rows for manual handling. Modest build, removes most of the typing.
*My recommendation:* **B.** The unique payment reference exists precisely to make this reliable,
and without it manual reconciliation at any real volume will eventually mis-credit a student.
*Saying no now is fine, but I would treat it as the most likely source of fee disputes later.*

---

## L. Known Limitations of This Document

- Derived from a 3-page proposal that is high-level. Many domain rules are unstated
  (grading scale, term structure, penalty specifics, fee structure) and are listed as questions
  rather than invented.
- No user research, no stakeholder interviews, no wireframes. Your proposal's Phase 1 calls for
  wireframing and workflow approval — **that is still ahead of us and I have not done it.**
- The current codebase in `src/` was built before the proposal was located, against invented
  assumptions. It is **not** an implementation of this document. It needs to be discarded or
  reworked per your earlier "rebuilt from the proposal" decision.
- The existing SQL has never been executed against Postgres, so nothing in it is verified.
- **The anonymous subsystem's data model and RLS are settled** (Q-03 = C). The **break-glass
  exception is deferred by decision**, not outstanding by neglect — no named safeguarding lead
  exists yet. The accepted consequence is that a report about a committee member has no defined
  route out of the committee. Recorded as a **pre-launch gate on increment 15**, not a Phase 0/1
  blocker. Because the committee model was chosen, that exception can later be added as a
  time-boxed membership row rather than a new access system — which is why the deferral is cheap,
  but it is **not** free and must not be forgotten at launch.
- The dynamic application form builder (Q-05) is decided, but its **field-type whitelist is a
  design proposal (FR-5.13), not a validated decision** — it is the first thing to break under
  real admin use and it should be reviewed with wireframes.
- No schema has been generated from this document. Everything in §D is a written plan; nothing
  in it is proven to compile or to enforce.
- Section C (permission matrix) has not been independently re-derived from the role definitions;
  it was written alongside them. It should be treated as a checklist to verify in Phase 1 rather
  than a finished artifact.
