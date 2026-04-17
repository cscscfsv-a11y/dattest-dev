import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Save,
  Loader2,
  Brain,
  Sparkles,
  ChevronDown,
  ChevronUp,
  BookOpen,
  Activity,
  Pill,
  BarChart2,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AIField } from '@/components/AIField';
import { ROUTE_PATHS, DIAGNOSIS_OPTIONS } from '@/lib/index';
import { useAIAssistant } from '@/hooks/useAI';
import { springPresets } from '@/lib/motion';
import { toast } from 'sonner'; // Opcional: para notificaciones de error

// Cliente de Supabase
import { supabase } from '@/lib/supabaseClient';

interface SectionProps {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

function Section({ title, icon: Icon, children, defaultOpen = true }: SectionProps) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <Card className="border-border/60">
      <button
        className="w-full flex items-center gap-3 px-5 py-4 hover:bg-muted/30 transition-colors"
        onClick={() => setOpen((v) => !v)}
      >
        <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
          <Icon className="w-3.5 h-3.5 text-primary" />
        </div>
        <span className="font-semibold text-foreground flex-1 text-left text-sm">{title}</span>
        {open ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
      </button>
      {open && <CardContent className="pb-5 border-t border-border/40 pt-4 space-y-4">{children}</CardContent>}
    </Card>
  );
}

export default function ClinicalHistory() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { generateFullRecord, isGenerating } = useAIAssistant();

  // Estados
  const [patient, setPatient] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [record, setRecord] = useState({
    diagnostico: '',
    codigoDSM: '',
    anamnesis: '',
    antecedentes: '',
    historialFamiliar: '',
    planTratamiento: '',
    evolucion: '',
    medicacion: '',
    observaciones: '',
  });

  // 1. Cargar datos iniciales
  useEffect(() => {
    async function loadData() {
      if (!id) return;
      setLoading(true);
      try {
        const { data: patientData } = await supabase.from('pacientes').select('*').eq('id', id).single();

        if (patientData) {
          setPatient(patientData);
          // Cargamos solo de la tabla principal (lo más reciente)
          const { data: recordData } = await supabase.from('clinical_records').select('*').eq('patient_id', id).single();

          if (recordData) {
            setRecord({
              diagnostico: recordData.diagnostico || '',
              codigoDSM: recordData.codigoDSM || '',
              anamnesis: recordData.anamnesis || '',
              antecedentes: recordData.antecedentes || '',
              historialFamiliar: recordData.historialFamiliar || '',
              planTratamiento: recordData.planTratamiento || '',
              evolucion: recordData.evolucion || '',
              medicacion: recordData.medicacion || '',
              observaciones: recordData.observaciones || '',
            });
          } else {
            // Pre-llenado básico si no hay registro previo
            setRecord(prev => ({
              ...prev,
              diagnostico: patientData.diagnosticoprincipal || patientData.diagnosticoPreliminar || '',
              anamnesis: patientData.motivoConsulta || ''
            }));
          }
        }
      } catch (err) {
        console.error("Error al cargar datos:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id]);

  function update(field: string, value: string) {
    setRecord((r) => ({ ...r, [field]: value }));
    setSaved(false);
  }

  // 2. Lógica de Guardado Doble con Manejo de Errores
  async function handleSave() {
    if (!id) return;
    setSaving(true);
    setSaved(false);
    
    try {
      const timestamp = new Date().toISOString();

      // OPERACIÓN 1: Actualizar tabla de edición rápida (clinical_records)
      const { error: errorPrincipal } = await supabase
        .from('clinical_records')
        .upsert({
          patient_id: id,
          ...record,
          updated_at: timestamp,
        });

      if (errorPrincipal) throw new Error("Error en tabla principal: " + errorPrincipal.message);

      // OPERACIÓN 2: Agregar nueva fila a tabla de historial (clinical_record_history)
      const { error: errorHistorial } = await supabase
        .from('clinical_record_history')
        .insert([{
          patient_id: id,
          ...record,
          created_at: timestamp,
        }]);

      if (errorHistorial) throw new Error("Error en tabla historial: " + errorHistorial.message);

      // Si llegamos aquí, ambos guardaron bien
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      console.error("Fallo el guardado:", err.message);
      alert("No se pudo guardar la información: " + err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleGenerateFull() {
    if (!patient) return;
    const result = await generateFullRecord({
      diagnostico: record.diagnostico || patient.diagnosticoprincipal || patient.diagnosticoPreliminar || '',
      motivoConsulta: patient.motivoConsulta || '',
    });
    setRecord((r) => ({ ...r, ...result }));
  }

  if (loading) return <div className="p-20 text-center"><Loader2 className="w-10 h-10 animate-spin mx-auto text-primary" /></div>;
  if (!patient) return <div className="p-10 text-center"><AlertCircle className="mx-auto mb-4" /> Paciente no encontrado</div>;

  const aiContext = { 
    diagnostico: record.diagnostico || patient.diagnosticoprincipal || patient.diagnosticoPreliminar,
    motivoConsulta: patient.motivoConsulta 
  };

  return (
    <div className="p-6 max-w-[900px] space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <Button
            variant="ghost" size="sm" className="gap-2 text-muted-foreground mb-3 -ml-2"
            onClick={() => navigate(ROUTE_PATHS.PATIENT_DETAIL.replace(':id', patient.id))}
          >
            <ArrowLeft className="w-4 h-4" />
            {patient.nombre} {patient.apellido}
          </Button>
          <h1 className="text-2xl font-bold text-foreground font-title">Historia Clínica</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {patient.nombre} {patient.apellido} — {patient.email}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline" className="gap-2 border-primary/30 text-primary hover:bg-primary/5"
            onClick={handleGenerateFull} disabled={isGenerating}
          >
            {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Brain className="w-4 h-4" />}
            {isGenerating ? 'Generando...' : 'Completar con IA'}
          </Button>

          <Button onClick={handleSave} disabled={saving} className="gap-2 shadow-sm">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <Sparkles className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            {saving ? 'Guardando...' : saved ? '¡Versionado!' : 'Guardar'}
          </Button>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={springPresets.gentle}
        className="flex items-center gap-3 p-3.5 bg-primary/5 border border-primary/20 rounded-xl text-sm"
      >
        <Sparkles className="w-4 h-4 text-primary shrink-0" />
        <p className="text-foreground">
          <span className="font-medium text-primary">Asistente IA activo.</span> Generando para <b>{patient.nombre}</b>.
        </p>
      </motion.div>

      {/* Secciones del Formulario */}
      <Section title="Diagnóstico" icon={BookOpen}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Diagnóstico principal (CIE-10)</Label>
            <Select value={record.diagnostico} onValueChange={(v) => update('diagnostico', v)}>
              <SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
              <SelectContent>
                {DIAGNOSIS_OPTIONS.map((d) => (<SelectItem key={d} value={d}>{d}</SelectItem>))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Código DSM-5</Label>
            <Input value={record.codigoDSM} onChange={(e) => update('codigoDSM', e.target.value)} placeholder="Ej: 300.02" />
          </div>
        </div>
      </Section>

      <Section title="Anamnesis" icon={BookOpen}>
        <AIField label="Historia del problema actual" fieldKey="anamnesis" value={record.anamnesis} onChange={(v) => update('anamnesis', v)} context={aiContext} rows={6} />
      </Section>

      <Section title="Antecedentes" icon={Activity}>
        <AIField label="Antecedentes personales" fieldKey="antecedentes" value={record.antecedentes} onChange={(v) => update('antecedentes', v)} context={aiContext} rows={4} />
        <AIField label="Historia familiar" fieldKey="historialFamiliar" value={record.historialFamiliar} onChange={(v) => update('historialFamiliar', v)} context={aiContext} rows={3} />
      </Section>

      <Section title="Plan de Tratamiento" icon={Brain}>
        <AIField label="Plan terapéutico" fieldKey="planTratamiento" value={record.planTratamiento} onChange={(v) => update('planTratamiento', v)} context={aiContext} rows={7} />
      </Section>

      <Section title="Evolución y Progreso" icon={Activity}>
        <AIField label="Evolución clínica" fieldKey="evolucion" value={record.evolucion} onChange={(v) => update('evolucion', v)} context={aiContext} rows={4} />
      </Section>

      <Section title="Medicación" icon={Pill} defaultOpen={false}>
        <div className="space-y-1.5">
          <Label className="text-sm font-medium">Medicación actual</Label>
          <Input value={record.medicacion} onChange={(e) => update('medicacion', e.target.value)} placeholder="Ej: Sertralina 50mg" />
        </div>
      </Section>

      {/* Save Bar Flotante */}
      <div className="sticky bottom-6 flex justify-end">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border/60 rounded-2xl px-4 py-3 shadow-lg flex items-center gap-3">
          <p className="text-sm text-muted-foreground">{saved ? '✅ Guardado y versionado' : 'Cambios sin guardar'}</p>
          <Button onClick={handleSave} disabled={saving} size="sm" className="gap-2 shadow-sm">
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            Guardar Historia
          </Button>
        </motion.div>
      </div>
    </div>
  );
}