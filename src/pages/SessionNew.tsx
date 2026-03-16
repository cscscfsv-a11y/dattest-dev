import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Save,
  Loader2,
  User,
  Calendar,
  Clock,
  Target,
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
import { MOCK_PATIENTS } from '@/data/index';
import { ROUTE_PATHS } from '@/lib/index';
import { springPresets } from '@/lib/motion';

export default function SessionNew() {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    pacienteId: '',
    fecha: '2026-03-15',
    hora: '09:00',
    duracion: '60',
    tipo: 'individual',
    modalidad: 'presencial',
    notas: '',
    objetivos: '',
    tareas: '',
  });

  const selectedPatient = MOCK_PATIENTS.find((p) => p.id === form.pacienteId);

  function update(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSave() {
    if (!form.pacienteId) return;
    setSaving(true);
    await new Promise((res) => setTimeout(res, 900));
    setSaving(false);
    navigate(ROUTE_PATHS.SESSIONS);
  }

  return (
    <div className="p-6 max-w-[700px] space-y-5">
      {/* Header */}
      <div>
        <Button
          variant="ghost"
          size="sm"
          className="gap-2 text-muted-foreground mb-3 -ml-2"
          onClick={() => navigate(ROUTE_PATHS.SESSIONS)}
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a Sesiones
        </Button>
        <h1 className="text-2xl font-bold text-foreground">Nueva Sesión</h1>
        <p className="text-muted-foreground text-sm mt-1">Registra una sesión clínica</p>
      </div>

      {/* Patient selection */}
      <Card className="border-border/60">
        <CardContent className="p-5 space-y-4">
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <User className="w-4 h-4 text-primary" /> Paciente
          </h3>
          <div className="space-y-1.5">
            <Label>Seleccionar paciente</Label>
            <Select value={form.pacienteId} onValueChange={(v) => update('pacienteId', v)}>
              <SelectTrigger>
                <SelectValue placeholder="Buscar paciente..." />
              </SelectTrigger>
              <SelectContent>
                {MOCK_PATIENTS.filter((p) => p.estado === 'activo' || p.estado === 'seguimiento').map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.nombre} {p.apellido} · {p.diagnosticoPrincipal?.split('-')[0].trim()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedPatient && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={springPresets.snappy}
              className="p-3 bg-primary/5 border border-primary/20 rounded-xl text-sm"
            >
              <p className="font-medium text-foreground">{selectedPatient.nombre} {selectedPatient.apellido}</p>
              <p className="text-muted-foreground text-xs mt-0.5">{selectedPatient.diagnosticoPrincipal}</p>
              <p className="text-muted-foreground text-xs">{selectedPatient.totalSesiones} sesiones previas</p>
            </motion.div>
          )}
        </CardContent>
      </Card>

      {/* Date & time */}
      <Card className="border-border/60">
        <CardContent className="p-5 space-y-4">
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <Calendar className="w-4 h-4 text-primary" /> Fecha y Hora
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Fecha</Label>
              <Input
                type="date"
                value={form.fecha}
                onChange={(e) => update('fecha', e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Hora</Label>
              <Input
                type="time"
                value={form.hora}
                onChange={(e) => update('hora', e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Duración (minutos)</Label>
              <Select value={form.duracion} onValueChange={(v) => update('duracion', v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30 minutos</SelectItem>
                  <SelectItem value="45">45 minutos</SelectItem>
                  <SelectItem value="60">60 minutos</SelectItem>
                  <SelectItem value="90">90 minutos</SelectItem>
                  <SelectItem value="120">120 minutos</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Modalidad</Label>
              <Select value={form.modalidad} onValueChange={(v) => update('modalidad', v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="presencial">Presencial</SelectItem>
                  <SelectItem value="virtual">Virtual</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Tipo de sesión</Label>
            <Select value={form.tipo} onValueChange={(v) => update('tipo', v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="individual">Individual</SelectItem>
                <SelectItem value="grupal">Grupal</SelectItem>
                <SelectItem value="familiar">Familiar</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Notes */}
      <Card className="border-border/60">
        <CardContent className="p-5 space-y-4">
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <Brain className="w-4 h-4 text-primary" /> Notas de Sesión
            <span className="ml-auto">
              <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full flex items-center gap-1">
                <Sparkles className="w-3 h-3" />IA disponible
              </span>
            </span>
          </h3>

          <AIField
            label="Notas de la sesión"
            fieldKey="notaSesion"
            value={form.notas}
            onChange={(v) => update('notas', v)}
            context={{ diagnostico: selectedPatient?.diagnosticoPrincipal, tipoConsulta: 'default' }}
            rows={5}
            placeholder="Describe el contenido de la sesión, estado del paciente, técnicas utilizadas..."
          />

          <AIField
            label="Objetivos trabajados"
            fieldKey="objetivos"
            value={form.objetivos}
            onChange={(v) => update('objetivos', v)}
            context={{ diagnostico: selectedPatient?.diagnosticoPrincipal }}
            rows={3}
            placeholder="Objetivos específicos trabajados en esta sesión..."
          />

          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Tareas para casa</Label>
            <Input
              value={form.tareas}
              onChange={(e) => update('tareas', e.target.value)}
              placeholder="Asignaciones para el paciente hasta la próxima sesión..."
            />
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <Button variant="outline" onClick={() => navigate(ROUTE_PATHS.SESSIONS)}>
          Cancelar
        </Button>
        <Button
          onClick={handleSave}
          disabled={saving || !form.pacienteId}
          className="gap-2 min-w-[120px]"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? 'Guardando...' : 'Guardar sesión'}
        </Button>
      </div>
    </div>
  );
}
