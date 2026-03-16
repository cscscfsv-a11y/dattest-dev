import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Save,
  Loader2,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Shield,
  FileText,
  Brain,
  Sparkles,
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
import { Textarea } from '@/components/ui/textarea';
import { ROUTE_PATHS, DIAGNOSIS_OPTIONS } from '@/lib/index';
import { springPresets } from '@/lib/motion';

export default function PatientNew() {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    nombre: '',
    apellido: '',
    fechaNacimiento: '',
    genero: '',
    telefono: '',
    email: '',
    direccion: '',
    seguroMedico: '',
    contactoEmergencia: '',
    motivoConsulta: '',
    diagnosticoPreliminar: '',
    notas: '',
  });

  function update(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSave() {
    setSaving(true);
    await new Promise((res) => setTimeout(res, 900));
    setSaving(false);
    navigate(ROUTE_PATHS.PATIENTS);
  }

  const isValid = form.nombre && form.apellido && form.fechaNacimiento && form.genero && form.motivoConsulta;

  return (
    <div className="p-6 max-w-[760px] space-y-5">
      {/* Header */}
      <div>
        <Button
          variant="ghost"
          size="sm"
          className="gap-2 text-muted-foreground mb-3 -ml-2"
          onClick={() => navigate(ROUTE_PATHS.PATIENTS)}
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a Pacientes
        </Button>
        <h1 className="text-2xl font-bold text-foreground">Nuevo Paciente</h1>
        <p className="text-muted-foreground text-sm mt-1">Registra la información del paciente</p>
      </div>

      {/* Personal data */}
      <Card className="border-border/60">
        <CardContent className="p-5 space-y-4">
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <User className="w-4 h-4 text-primary" /> Datos personales
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Nombre(s) <span className="text-destructive">*</span></Label>
              <Input value={form.nombre} onChange={(e) => update('nombre', e.target.value)} placeholder="Nombre" />
            </div>
            <div className="space-y-1.5">
              <Label>Apellidos <span className="text-destructive">*</span></Label>
              <Input value={form.apellido} onChange={(e) => update('apellido', e.target.value)} placeholder="Apellido paterno y materno" />
            </div>
            <div className="space-y-1.5">
              <Label>Fecha de nacimiento <span className="text-destructive">*</span></Label>
              <Input type="date" value={form.fechaNacimiento} onChange={(e) => update('fechaNacimiento', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Género <span className="text-destructive">*</span></Label>
              <Select value={form.genero} onValueChange={(v) => update('genero', v)}>
                <SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="masculino">Masculino</SelectItem>
                  <SelectItem value="femenino">Femenino</SelectItem>
                  <SelectItem value="otro">Otro / Prefiero no decir</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact */}
      <Card className="border-border/60">
        <CardContent className="p-5 space-y-4">
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <Phone className="w-4 h-4 text-primary" /> Contacto
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5"><Phone className="w-3 h-3" />Teléfono</Label>
              <Input value={form.telefono} onChange={(e) => update('telefono', e.target.value)} placeholder="555-000-0000" />
            </div>
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5"><Mail className="w-3 h-3" />Correo electrónico</Label>
              <Input type="email" value={form.email} onChange={(e) => update('email', e.target.value)} placeholder="correo@email.com" />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label className="flex items-center gap-1.5"><MapPin className="w-3 h-3" />Dirección</Label>
              <Input value={form.direccion} onChange={(e) => update('direccion', e.target.value)} placeholder="Calle, Colonia, Ciudad" />
            </div>
            <div className="space-y-1.5">
              <Label>Seguro médico</Label>
              <Select value={form.seguroMedico} onValueChange={(v) => update('seguroMedico', v)}>
                <SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="IMSS">IMSS</SelectItem>
                  <SelectItem value="ISSSTE">ISSSTE</SelectItem>
                  <SelectItem value="Privado">Seguro privado</SelectItem>
                  <SelectItem value="Ninguno">Sin seguro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Contacto de emergencia</Label>
              <Input value={form.contactoEmergencia} onChange={(e) => update('contactoEmergencia', e.target.value)} placeholder="Nombre - Teléfono" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Clinical info */}
      <Card className="border-border/60">
        <CardContent className="p-5 space-y-4">
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <Brain className="w-4 h-4 text-primary" /> Información clínica
            <span className="ml-auto text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full flex items-center gap-1">
              <Sparkles className="w-3 h-3" />IA disponible
            </span>
          </h3>

          <div className="space-y-1.5">
            <Label>Diagnóstico preliminar</Label>
            <Select value={form.diagnosticoPreliminar} onValueChange={(v) => update('diagnosticoPreliminar', v)}>
              <SelectTrigger><SelectValue placeholder="Seleccionar diagnóstico..." /></SelectTrigger>
              <SelectContent>
                {DIAGNOSIS_OPTIONS.map((d) => (
                  <SelectItem key={d} value={d}>{d}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <AIField
            label={<>Motivo de consulta <span className="text-destructive">*</span></>  as unknown as string}
            fieldKey="anamnesis"
            value={form.motivoConsulta}
            onChange={(v) => update('motivoConsulta', v)}
            context={{ diagnostico: form.diagnosticoPreliminar }}
            rows={4}
            placeholder="Describe brevemente el motivo de consulta del paciente, síntomas principales y duración..."
          />

          <div className="space-y-1.5">
            <Label>Notas iniciales del terapeuta</Label>
            <Textarea
              value={form.notas}
              onChange={(e) => update('notas', e.target.value)}
              placeholder="Observaciones iniciales, impresión clínica..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <Button variant="outline" onClick={() => navigate(ROUTE_PATHS.PATIENTS)}>
          Cancelar
        </Button>
        <Button
          onClick={handleSave}
          disabled={saving || !isValid}
          className="gap-2 min-w-[140px]"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? 'Registrando...' : 'Registrar paciente'}
        </Button>
      </div>
    </div>
  );
}
