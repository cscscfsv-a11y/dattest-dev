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
  Globe,
  Wand2,
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
import { supabase } from "@/lib/supabaseClient";

export default function PatientNew() {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [searching, setSearching] = useState(false); 
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

  // --- LÓGICA DE BÚSQUEDA REAL EN BIBLIOTECA MÉDICA (CIE-10) ---
  async function handleInternetSearch() {
    const termToSearch = form.diagnosticoPreliminar || form.motivoConsulta;
    if (!termToSearch) return;
    
    setSearching(true);
    try {
      // Usamos la API de Clinical Tables de la NLM (National Library of Medicine)
      // Es una fuente real y gratuita de términos médicos CIE-10 (ICD-10)
      const response = await fetch(
        `https://clinicaltables.nlm.nih.gov/api/icd10cm/v3/search?terms=${encodeURIComponent(termToSearch)}&maxList=1`
      );
      const data = await response.json();

      // El formato de respuesta es [conteo, códigos, null, descripciones]
      if (data && data[3] && data[3][0]) {
        const code = data[1][0];
        const description = data[3][0];
        update('diagnosticoPreliminar', `${code} - ${description}`);
      } else {
        alert("No se encontró un término técnico exacto. Intente con palabras más descriptivas.");
      }
    } catch (error) {
      console.error("Error buscando sugerencias:", error);
    } finally {
      setSearching(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    const { error } = await supabase.from("pacientes").insert({
      nombre: form.nombre,
      apellido: form.apellido,
      fechaNacimiento: form.fechaNacimiento,
      genero: form.genero,
      telefono: form.telefono,
      email: form.email,
      direccion: form.direccion,
      seguroMedico: form.seguroMedico,
      contactoEmergencia: form.contactoEmergencia,
      motivoConsulta: form.motivoConsulta,
      diagnosticoPreliminar: form.diagnosticoPreliminar,
      notas: form.notas,
      estado: "activo", 
      created_at: new Date().toISOString(),
    });

    setSaving(false);

    if (error) {
      console.error("Error al guardar:", error.message);
      alert("Error al registrar: " + error.message);
    } else {
      alert("Paciente registrado correctamente");
      navigate(ROUTE_PATHS.PATIENTS);
    }
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
                  <SelectItem value="otro">Otro</SelectItem>
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
              <Label>Teléfono</Label>
              <Input value={form.telefono} onChange={(e) => update('telefono', e.target.value)} placeholder="555-000-0000" />
            </div>
            <div className="space-y-1.5">
              <Label>Correo electrónico</Label>
              <Input type="email" value={form.email} onChange={(e) => update('email', e.target.value)} />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label>Dirección</Label>
              <Input value={form.direccion} onChange={(e) => update('direccion', e.target.value)} placeholder="Calle, Colonia, Ciudad" />
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
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  value={form.diagnosticoPreliminar}
                  onChange={(e) => update('diagnosticoPreliminar', e.target.value)}
                  placeholder="Escriba o busque términos..."
                  list="diagnosis-list"
                />
                <datalist id="diagnosis-list">
                  {DIAGNOSIS_OPTIONS.map((d) => (
                    <option key={d} value={d} />
                  ))}
                </datalist>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleInternetSearch}
                disabled={searching}
                className="gap-2 border-primary/20 text-primary hover:bg-primary/5 shrink-0"
              >
                {searching ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Wand2 className="w-3.5 h-3.5" />}
                Sugerir
              </Button>
            </div>
          </div>

          <AIField
            label={<>Motivo de consulta <span className="text-destructive">*</span></> as unknown as string}
            fieldKey="anamnesis"
            value={form.motivoConsulta}
            onChange={(v) => update('motivoConsulta', v)}
            context={{ diagnostico: form.diagnosticoPreliminar }}
            rows={4}
            placeholder="Describe síntomas principales..."
          />

          <div className="space-y-1.5">
            <Label>Notas iniciales del terapeuta</Label>
            <Textarea
              value={form.notas}
              onChange={(e) => update('notas', e.target.value)}
              placeholder="Observaciones iniciales..."
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