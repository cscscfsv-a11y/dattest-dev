import { useState } from 'react';
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
  Plus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AIField } from '@/components/AIField';
import { MOCK_PATIENTS, MOCK_CLINICAL_RECORDS } from '@/data/index';
import { ROUTE_PATHS, DIAGNOSIS_OPTIONS, SCALES } from '@/lib/index';
import { useAIAssistant } from '@/hooks/useAI';
import { springPresets } from '@/lib/motion';
import { cn } from '@/lib/utils';

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
      {open && (
        <CardContent className="pb-5 border-t border-border/40 pt-4 space-y-4">
          {children}
        </CardContent>
      )}
    </Card>
  );
}

export default function ClinicalHistory() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { generateFullRecord, isGenerating } = useAIAssistant();

  const patient = MOCK_PATIENTS.find((p) => p.id === id);
  const existingRecord = id ? MOCK_CLINICAL_RECORDS[id] : null;

  const [record, setRecord] = useState({
    diagnostico: existingRecord?.diagnostico || '',
    codigoDSM: existingRecord?.codigoDSM || '',
    anamnesis: existingRecord?.anamnesis || '',
    antecedentes: existingRecord?.antecedentes || '',
    historialFamiliar: existingRecord?.historialFamiliar || '',
    planTratamiento: existingRecord?.planTratamiento || '',
    evolucion: existingRecord?.evolucion || '',
    medicacion: existingRecord?.medicacion || '',
    observaciones: existingRecord?.observaciones || '',
  });

  const [scales] = useState(existingRecord?.escalas || []);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  function update(field: string, value: string) {
    setRecord((r) => ({ ...r, [field]: value }));
    setSaved(false);
  }

  async function handleGenerateFull() {
    if (!patient) return;
    const result = await generateFullRecord({
      diagnostico: record.diagnostico || patient.diagnosticoPrincipal || '',
      motivoConsulta: patient.motivoConsulta,
    });
    setRecord((r) => ({ ...r, ...result }));
  }

  async function handleSave() {
    setSaving(true);
    await new Promise((res) => setTimeout(res, 900));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  if (!patient) {
    return (
      <div className="p-6 text-center">
        <AlertCircle className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
        <p className="text-muted-foreground">Paciente no encontrado</p>
      </div>
    );
  }

  const aiContext = { diagnostico: record.diagnostico || patient.diagnosticoPrincipal || '' };

  return (
    <div className="p-6 max-w-[900px] space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <Button
            variant="ghost"
            size="sm"
            className="gap-2 text-muted-foreground mb-3 -ml-2"
            onClick={() => navigate(ROUTE_PATHS.PATIENT_DETAIL.replace(':id', patient.id))}
          >
            <ArrowLeft className="w-4 h-4" />
            {patient.nombre} {patient.apellido}
          </Button>
          <h1 className="text-2xl font-bold text-foreground">Historia Clínica</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {patient.nombre} {patient.apellido}
            {existingRecord && ` · Actualizado: ${new Date(existingRecord.fechaActualizacion + 'T00:00:00').toLocaleDateString('es-MX')}`}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* AI Full generate */}
          <Button
            variant="outline"
            className="gap-2 border-primary/30 text-primary hover:bg-primary/5"
            onClick={handleGenerateFull}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Brain className="w-4 h-4" />
            )}
            {isGenerating ? 'Generando...' : 'Completar con IA'}
          </Button>

          <Button onClick={handleSave} disabled={saving} className="gap-2">
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : saved ? (
              <Sparkles className="w-4 h-4" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {saving ? 'Guardando...' : saved ? '¡Guardado!' : 'Guardar'}
          </Button>
        </div>
      </div>

      {/* AI tip banner */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={springPresets.gentle}
        className="flex items-center gap-3 p-3.5 bg-primary/5 border border-primary/20 rounded-xl text-sm"
      >
        <Sparkles className="w-4 h-4 text-primary shrink-0" />
        <p className="text-foreground">
          <span className="font-medium text-primary">Asistente IA activo.</span>{' '}
          Usa el botón <span className="font-medium">"Generar con IA"</span> en cada campo para obtener sugerencias basadas en el diagnóstico del paciente.
        </p>
      </motion.div>

      {/* Diagnosis */}
      <Section title="Diagnóstico" icon={BookOpen} defaultOpen>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Diagnóstico principal (CIE-10)</Label>
            <Select value={record.diagnostico} onValueChange={(v) => update('diagnostico', v)}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar diagnóstico..." />
              </SelectTrigger>
              <SelectContent>
                {DIAGNOSIS_OPTIONS.map((d) => (
                  <SelectItem key={d} value={d}>{d}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Código DSM-5</Label>
            <Input
              value={record.codigoDSM}
              onChange={(e) => update('codigoDSM', e.target.value)}
              placeholder="Ej: DSM-5: 300.02"
            />
          </div>
        </div>
      </Section>

      {/* Anamnesis */}
      <Section title="Anamnesis" icon={BookOpen}>
        <AIField
          label="Historia del problema actual"
          fieldKey="anamnesis"
          value={record.anamnesis}
          onChange={(v) => update('anamnesis', v)}
          context={aiContext}
          rows={6}
          placeholder="Describa el motivo de consulta, inicio y evolución del problema, factores precipitantes y mantenedores..."
        />
      </Section>

      {/* Antecedentes */}
      <Section title="Antecedentes" icon={Activity}>
        <AIField
          label="Antecedentes personales"
          fieldKey="antecedentes"
          value={record.antecedentes}
          onChange={(v) => update('antecedentes', v)}
          context={aiContext}
          rows={4}
          placeholder="Antecedentes psiquiátricos, médicos, tratamientos previos..."
        />
        <AIField
          label="Historia familiar"
          fieldKey="historialFamiliar"
          value={record.historialFamiliar}
          onChange={(v) => update('historialFamiliar', v)}
          context={aiContext}
          rows={3}
          placeholder="Antecedentes psiquiátricos en familia, historia de violencia, factores hereditarios..."
        />
      </Section>

      {/* Plan tratamiento */}
      <Section title="Plan de Tratamiento" icon={Brain}>
        <AIField
          label="Plan terapéutico"
          fieldKey="planTratamiento"
          value={record.planTratamiento}
          onChange={(v) => update('planTratamiento', v)}
          context={aiContext}
          rows={7}
          placeholder="Describe las fases del tratamiento, técnicas a utilizar, objetivos terapéuticos..."
        />
      </Section>

      {/* Evolución */}
      <Section title="Evolución y Progreso" icon={Activity}>
        <AIField
          label="Evolución clínica"
          fieldKey="evolucion"
          value={record.evolucion}
          onChange={(v) => update('evolucion', v)}
          context={aiContext}
          rows={4}
          placeholder="Describa la evolución del paciente, cambios observados, respuesta al tratamiento..."
        />
      </Section>

      {/* Medication */}
      <Section title="Medicación" icon={Pill} defaultOpen={false}>
        <div className="space-y-1.5">
          <Label className="text-sm font-medium">Medicación actual</Label>
          <Input
            value={record.medicacion}
            onChange={(e) => update('medicacion', e.target.value)}
            placeholder="Ej: Sertralina 50mg/día (prescrita por psiquiatría)"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm font-medium">Observaciones</Label>
          <AIField
            label=""
            fieldKey="observaciones"
            value={record.observaciones}
            onChange={(v) => update('observaciones', v)}
            context={aiContext}
            rows={3}
            placeholder="Observaciones clínicas adicionales..."
          />
        </div>
      </Section>

      {/* Scales */}
      <Section title="Escalas de Evaluación" icon={BarChart2} defaultOpen={false}>
        <div className="flex justify-between items-center mb-3">
          <p className="text-sm text-muted-foreground">Escalas aplicadas</p>
          <Button variant="outline" size="sm" className="gap-2 text-xs">
            <Plus className="w-3.5 h-3.5" />
            Agregar escala
          </Button>
        </div>
        {scales.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">No hay escalas registradas</p>
        ) : (
          <div className="space-y-3">
            {scales.map((scale, i) => (
              <div key={i} className="flex items-center gap-4 p-3 bg-muted/40 rounded-xl text-sm">
                <div className="flex-1">
                  <p className="font-medium text-foreground">{scale.nombre}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {new Date(scale.fecha + 'T00:00:00').toLocaleDateString('es-MX')}
                    {scale.notas && ` · ${scale.notas}`}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xl font-bold text-primary">{scale.puntaje}</p>
                  <p className="text-[10px] text-muted-foreground">pts</p>
                </div>
                <Badge variant="secondary" className="text-[10px] text-right shrink-0">
                  {scale.interpretacion}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </Section>

      {/* Save bar */}
      <div className="sticky bottom-6 flex justify-end">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-border/60 rounded-2xl px-4 py-3 shadow-lg flex items-center gap-3"
        >
          <p className="text-sm text-muted-foreground">
            {saved ? '✅ Historia clínica guardada' : 'Cambios sin guardar'}
          </p>
          <Button onClick={handleSave} disabled={saving} size="sm" className="gap-2">
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            {saving ? 'Guardando...' : 'Guardar cambios'}
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
