/**
 * Hand-maintained until a Supabase project is connected.
 *
 * Regenerate against a live project with:
 *   npm run db:types
 *
 * That command emits the authoritative definitions (including enums, views,
 * foreign-key relationships and every column) and should replace this file
 * wholesale. Do not hand-edit after that point.
 *
 * `Relationships` is not optional: postgrest-js uses it to type nested
 * selects. Omitting it makes every `.from()` resolve to `never`.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type UserRole = 'admin' | 'facilitator' | 'parent' | 'student' | 'applicant'
export type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused'
export type FeeStatus = 'pending' | 'partially_paid' | 'paid' | 'waived' | 'overdue'
export type PaymentMethod =
  | 'cash'
  | 'bank_transfer'
  | 'card'
  | 'mobile_money'
  | 'cheque'
  | 'waiver'
export type ApplicationStatus =
  | 'draft'
  | 'submitted'
  | 'under_review'
  | 'interview'
  | 'accepted'
  | 'rejected'
  | 'withdrawn'
export type StudentStatus =
  | 'active'
  | 'graduated'
  | 'withdrawn'
  | 'transferred'
  | 'deceased'

export type Relationship = {
  foreignKeyName: string
  columns: string[]
  isOneToOne?: boolean
  referencedRelation: string
  referencedColumns: string[]
}

type Table<Row, Insert = Partial<Row>, Relationships extends Relationship[] = []> = {
  Row: Row
  Insert: Insert
  Update: Partial<Row>
  Relationships: Relationships
}

type Profile = {
  id: string
  email: string
  role: UserRole
  first_name: string
  last_name: string
  phone: string | null
  avatar_url: string | null
  date_of_birth: string | null
  address: string | null
  staff_id: string | null
  student_id: string | null
  is_active: boolean
  last_seen_at: string | null
  created_at: string
  updated_at: string
}

type Student = {
  id: string
  profile_id: string
  admission_number: string
  status: StudentStatus
  class_id: string | null
  admission_date: string | null
  graduated_on: string | null
  guardian_notes: string | null
  created_at: string
  updated_at: string
}

type Staff = {
  id: string
  profile_id: string
  staff_number: string
  employment_type: string
  status: string
  hired_on: string | null
  qualification: string | null
  specialization: string | null
  created_at: string
  updated_at: string
}

type Guardianship = {
  guardian_id: string
  student_id: string
  relationship: string
  is_primary: boolean
  created_at: string
}

type Enrolment = {
  id: string
  student_id: string
  class_id: string
  enrolled_on: string
  left_on: string | null
  is_current: boolean
  created_at: string
}

type Class = {
  id: string
  name: string
  level: number
  stream: string | null
  session_id: string
  homeroom_staff_id: string | null
  capacity: number | null
  created_at: string
  updated_at: string
}

type AcademicSession = {
  id: string
  name: string
  starts_on: string
  ends_on: string
  is_current: boolean
  created_at: string
}

type Term = {
  id: string
  session_id: string
  name: string
  sequence: number
  starts_on: string
  ends_on: string
  created_at: string
}

type Invoice = {
  id: string
  invoice_number: string
  student_id: string
  session_id: string
  term_id: string | null
  currency: string
  total_amount: number
  discount: number
  amount_paid: number
  status: FeeStatus
  due_on: string | null
  issued_at: string
  created_at: string
  updated_at: string
}

type Payment = {
  id: string
  receipt_number: string
  invoice_id: string
  student_id: string
  amount: number
  currency: string
  method: PaymentMethod
  reference: string | null
  paid_at: string
  received_by: string
  note: string | null
  created_at: string
}

type Application = {
  id: string
  applicant_id: string
  status: ApplicationStatus
  class_applying: string
  guardian_name: string
  guardian_phone: string
  previous_school: string | null
  statement: string
  documents: string[]
  reviewer_id: string | null
  decision_note: string | null
  submitted_at: string
  decided_at: string | null
  created_at: string
  updated_at: string
}

type AttendanceRecord = {
  id: string
  student_id: string
  class_id: string
  term_id: string
  taken_on: string
  status: AttendanceStatus
  note: string | null
  recorded_by: string
  created_at: string
}

type Announcement = {
  id: string
  title: string
  body: string
  audience: string
  class_id: string | null
  is_pinned: boolean
  publish_at: string
  expires_at: string | null
  created_by: string
  created_at: string
  updated_at: string
}

type Complaint = {
  id: string
  submitted_by: string | null
  is_anonymous: boolean
  category: string
  subject: string
  body: string
  status: string
  assigned_to: string | null
  resolution: string | null
  resolved_at: string | null
  created_at: string
  updated_at: string
}

type AnonymousReport = {
  id: string
  reference_code: string
  contact_token_hash: string | null
  category: string
  body: string
  incident_date: string | null
  severity: string
  status: string
  assigned_to: string | null
  outcome: string | null
  submitted_at: string
  closed_at: string | null
}

type DisciplineRecord = {
  id: string
  student_id: string
  incident_date: string
  category: string
  severity: string
  description: string
  action_taken: string | null
  status: string
  reported_by: string
  reviewed_by: string | null
  parent_notified_at: string | null
  resolution: string | null
  created_at: string
  updated_at: string
}

type Resource = {
  id: string
  title: string
  description: string | null
  subject_id: string | null
  class_id: string | null
  file_path: string
  mime_type: string
  size_bytes: number
  visibility: string
  uploaded_by: string
  created_at: string
  updated_at: string
}

export type Database = {
  public: {
    Tables: {
      profiles: Table<
        Profile,
        {
          id: string
          email: string
          role: UserRole
          first_name: string
          last_name: string
          phone?: string | null
          avatar_url?: string | null
          date_of_birth?: string | null
          address?: string | null
          staff_id?: string | null
          student_id?: string | null
          is_active?: boolean
          last_seen_at?: string | null
          created_at?: string
          updated_at?: string
        }
      >
      students: Table<
        Student,
        {
          id?: string
          profile_id: string
          admission_number: string
          status?: StudentStatus
          class_id?: string | null
          admission_date?: string | null
          graduated_on?: string | null
          guardian_notes?: string | null
          created_at?: string
          updated_at?: string
        },
        [
          {
            foreignKeyName: 'students_class_fkey'
            columns: ['class_id']
            isOneToOne: false
            referencedRelation: 'classes'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'students_profile_id_fkey'
            columns: ['profile_id']
            isOneToOne: true
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      >
      staff: Table<
        Staff,
        {
          id?: string
          profile_id: string
          staff_number: string
          employment_type?: string
          status?: string
          hired_on?: string | null
          qualification?: string | null
          specialization?: string | null
          created_at?: string
          updated_at?: string
        },
        [
          {
            foreignKeyName: 'staff_profile_id_fkey'
            columns: ['profile_id']
            isOneToOne: true
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      >
      classes: Table<
        Class,
        {
          id?: string
          name: string
          level: number
          stream?: string | null
          session_id: string
          homeroom_staff_id?: string | null
          capacity?: number | null
          created_at?: string
          updated_at?: string
        },
        [
          {
            foreignKeyName: 'classes_homeroom_staff_id_fkey'
            columns: ['homeroom_staff_id']
            isOneToOne: false
            referencedRelation: 'staff'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'classes_session_id_fkey'
            columns: ['session_id']
            isOneToOne: false
            referencedRelation: 'academic_sessions'
            referencedColumns: ['id']
          },
        ]
      >
      academic_sessions: Table<
        AcademicSession,
        { id?: string; name: string; starts_on: string; ends_on: string; is_current?: boolean; created_at?: string }
      >
      guardianships: Table<
        Guardianship,
        {
          guardian_id: string
          student_id: string
          relationship?: string
          is_primary?: boolean
          created_at?: string
        },
        [
          {
            foreignKeyName: 'guardianships_student_id_fkey'
            columns: ['student_id']
            isOneToOne: false
            referencedRelation: 'students'
            referencedColumns: ['id']
          },
        ]
      >
      enrollments: Table<
        Enrolment,
        {
          id?: string
          student_id: string
          class_id: string
          enrolled_on?: string
          left_on?: string | null
          is_current?: boolean
          created_at?: string
        },
        [
          {
            foreignKeyName: 'enrollments_student_id_fkey'
            columns: ['student_id']
            isOneToOne: false
            referencedRelation: 'students'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'enrollments_class_id_fkey'
            columns: ['class_id']
            isOneToOne: false
            referencedRelation: 'classes'
            referencedColumns: ['id']
          },
        ]
      >
      terms: Table<Term, { id?: string; session_id: string; name: string; sequence: number; starts_on: string; ends_on: string; created_at?: string }>
      invoices: Table<
        Invoice,
        {
          id?: string
          invoice_number: string
          student_id: string
          session_id: string
          term_id?: string | null
          currency?: string
          total_amount: number
          discount?: number
          amount_paid?: number
          status?: FeeStatus
          due_on?: string | null
          issued_at?: string
          created_at?: string
          updated_at?: string
        },
        [
          {
            foreignKeyName: 'invoices_student_id_fkey'
            columns: ['student_id']
            isOneToOne: false
            referencedRelation: 'students'
            referencedColumns: ['id']
          },
        ]
      >
      payments: Table<
        Payment,
        {
          id?: string
          receipt_number: string
          invoice_id: string
          student_id: string
          amount: number
          currency?: string
          method: PaymentMethod
          reference?: string | null
          paid_at?: string
          received_by: string
          note?: string | null
          created_at?: string
        }
      >
      applications: Table<
        Application,
        {
          id?: string
          applicant_id: string
          status?: ApplicationStatus
          class_applying: string
          guardian_name: string
          guardian_phone: string
          previous_school?: string | null
          statement: string
          documents?: string[]
          reviewer_id?: string | null
          decision_note?: string | null
          submitted_at?: string
          decided_at?: string | null
          created_at?: string
          updated_at?: string
        },
        [
          {
            foreignKeyName: 'applications_applicant_id_fkey'
            columns: ['applicant_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      >
      attendance_records: Table<
        AttendanceRecord,
        {
          id?: string
          student_id: string
          class_id: string
          term_id: string
          taken_on: string
          status: AttendanceStatus
          note?: string | null
          recorded_by: string
          created_at?: string
        }
      >
      announcements: Table<
        Announcement,
        {
          id?: string
          title: string
          body: string
          audience?: string
          class_id?: string | null
          is_pinned?: boolean
          publish_at?: string
          expires_at?: string | null
          created_by: string
          created_at?: string
          updated_at?: string
        }
      >
      complaints: Table<
        Complaint,
        {
          id?: string
          submitted_by?: string | null
          is_anonymous?: boolean
          category: string
          subject: string
          body: string
          status?: string
          assigned_to?: string | null
          resolution?: string | null
          resolved_at?: string | null
          created_at?: string
          updated_at?: string
        }
      >
      anonymous_reports: Table<
        AnonymousReport,
        {
          id?: string
          reference_code: string
          contact_token_hash?: string | null
          category: string
          body: string
          incident_date?: string | null
          severity?: string
          status?: string
          assigned_to?: string | null
          outcome?: string | null
          submitted_at?: string
          closed_at?: string | null
        }
      >
      discipline_records: Table<
        DisciplineRecord,
        {
          id?: string
          student_id: string
          incident_date: string
          category: string
          severity?: string
          description: string
          action_taken?: string | null
          status?: string
          reported_by: string
          reviewed_by?: string | null
          parent_notified_at?: string | null
          resolution?: string | null
          created_at?: string
          updated_at?: string
        }
      >
      resources: Table<
        Resource,
        {
          id?: string
          title: string
          description?: string | null
          subject_id?: string | null
          class_id?: string | null
          file_path: string
          mime_type: string
          size_bytes: number
          visibility?: string
          uploaded_by: string
          created_at?: string
          updated_at?: string
        }
      >
    }
    Views: Record<never, never>
    Functions: {
      submit_anonymous_report: {
        Args: {
          p_reference_code: string
          p_contact_token_hash: string | null
          p_category: string
          p_body: string
          p_incident_date: string | null
        }
        Returns: string
      }
      fee_summary: {
        Args: Record<PropertyKey, never>
        Returns: {
          currency: string
          billed: number
          collected: number
          outstanding: number
          invoice_count: number
          overdue_count: number
        }[]
      }
      enrol_applicant: {
        Args: { p_application_id: string; p_class_id: string }
        Returns: string
      }
      attendance_rate: {
        Args: { p_student: string; p_term: string }
        Returns: {
          total: number
          present: number
          late: number
          absent: number
          excused: number
          rate_pct: number | null
        }[]
      }
    }
    Enums: {
      user_role: UserRole
      attendance_status: AttendanceStatus
      fee_status: FeeStatus
      payment_method: PaymentMethod
      application_status: ApplicationStatus
      student_status: StudentStatus
    }
    CompositeTypes: Record<never, never>
  }
}

export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row']
