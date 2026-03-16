// ============================================
// ROUTES
// ============================================
export const ROUTE_PATHS = {
  HOME: '/',
  PATIENTS: '/pacientes',
  PATIENT_DETAIL: '/pacientes/:id',
  PATIENT_NEW: '/pacientes/nuevo',
  CLINICAL_HISTORY: '/historial/:id',
  SESSIONS: '/sesiones',
  SESSION_NEW: '/sesiones/nueva',
  DOCUMENTS: '/documentos',
  SETTINGS: '/configuracion',
};

// ============================================
// TYPES
// ============================================

export type PatientStatus = 'activo' | 'inactivo' | 'alta' | 'seguimiento';
export type SessionStatus = 'programada' | 'completada' | 'cancelada' | 'pendiente';
export type DocumentType = 'evaluacion' | 'consentimiento' | 'informe' | 'receta' | 'otro';
export type DiagnosisCategory = 'ansiedad' | 'depresion' | 'trauma' | 'trastorno_personalidad' | 'otro';

export interface Patient {
  id: string;
  nombre: string;
  apellido: string;
  fechaNacimiento: string;
  genero: 'masculino' | 'femenino' | 'otro';
  telefono: string;
  email: string;
  direccion: string;
  estado: PatientStatus;
  fechaRegistro: string;
  ultimaSesion?: string;
  proximaSesion?: string;
  totalSesiones: number;
  diagnosticoPrincipal?: string;
  motivoConsulta: string;
  avatarUrl?: string;
  seguroMedico?: string;
  contactoEmergencia?: string;
  notas?: string;
}

export interface Session {
  id: string;
  pacienteId: string;
  pacienteNombre: string;
  fecha: string;
  hora: string;
  duracion: number; // minutos
  tipo: 'individual' | 'grupal' | 'familiar';
  estado: SessionStatus;
  notas?: string;
  objetivos?: string[];
  progreso?: string;
  tareas?: string;
  modalidad: 'presencial' | 'virtual';
}

export interface ClinicalRecord {
  id: string;
  pacienteId: string;
  fechaCreacion: string;
  fechaActualizacion: string;
  anamnesis: string;
  diagnostico: string;
  codigoDSM?: string;
  planTratamiento: string;
  evolucion: string;
  medicacion?: string;
  antecedentes: string;
  historialFamiliar?: string;
  observaciones?: string;
  escalas?: EvaluationScale[];
}

export interface EvaluationScale {
  nombre: string;
  fecha: string;
  puntaje: number;
  interpretacion: string;
  notas?: string;
}

export interface Document {
  id: string;
  pacienteId: string;
  nombre: string;
  tipo: DocumentType;
  fecha: string;
  tamaño: string;
  url?: string;
  descripcion?: string;
  generadoPorIA: boolean;
}

export interface DashboardStats {
  totalPacientes: number;
  pacientesActivos: number;
  sesionesHoy: number;
  sesionesEstaSemana: number;
  nuevosEsteMes: number;
  tasaAsistencia: number;
}

// ============================================
// CONSTANTS
// ============================================

export const STATUS_LABELS: Record<PatientStatus, string> = {
  activo: 'Activo',
  inactivo: 'Inactivo',
  alta: 'Alta médica',
  seguimiento: 'Seguimiento',
};

export const STATUS_COLORS: Record<PatientStatus, string> = {
  activo: 'bg-success/15 text-success',
  inactivo: 'bg-muted text-muted-foreground',
  alta: 'bg-accent/15 text-accent-foreground',
  seguimiento: 'bg-warning/15 text-warning',
};

export const SESSION_STATUS_LABELS: Record<SessionStatus, string> = {
  programada: 'Programada',
  completada: 'Completada',
  cancelada: 'Cancelada',
  pendiente: 'Pendiente',
};

export const SESSION_STATUS_COLORS: Record<SessionStatus, string> = {
  programada: 'bg-primary/15 text-primary',
  completada: 'bg-success/15 text-success',
  cancelada: 'bg-destructive/15 text-destructive',
  pendiente: 'bg-warning/15 text-warning',
};

export const DOC_TYPE_LABELS: Record<DocumentType, string> = {
  evaluacion: 'Evaluación',
  consentimiento: 'Consentimiento',
  informe: 'Informe',
  receta: 'Receta',
  otro: 'Otro',
};

export const DIAGNOSIS_OPTIONS = [
  'F40 - Trastornos fóbicos de ansiedad',
  'F41 - Otros trastornos de ansiedad',
  'F32 - Episodio depresivo',
  'F33 - Trastorno depresivo recurrente',
  'F43 - Reacciones a estrés grave y trastornos de adaptación',
  'F44 - Trastornos disociativos',
  'F60 - Trastornos de personalidad',
  'F90 - Trastornos hipercinéticos',
  'F91 - Trastornos del comportamiento',
  'F50 - Trastornos de la conducta alimentaria',
  'F70 - Retraso mental leve',
  'F84 - Trastornos generalizados del desarrollo',
];

export const SCALES = [
  'Beck Anxiety Inventory (BAI)',
  'Beck Depression Inventory (BDI-II)',
  'PHQ-9 - Patient Health Questionnaire',
  'GAD-7 - Generalized Anxiety Disorder',
  'DASS-21',
  'PCL-5 - PTSD Checklist',
  'SCL-90-R',
  'MMPI-2',
  'Escala de Hamilton para Ansiedad',
  'Escala de Hamilton para Depresión',
];
