import { useState, useEffect } from 'react'; // Agregado useEffect
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
import { ROUTE_PATHS } from '@/lib/index';
import { springPresets } from '@/lib/motion';

// IMPORTAR CLIENTE SUPABASE
import { supabase } from '@/lib/SupabaseClient';

export default function SessionNew() {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [loadingPatients, setLoadingPatients] = useState(true);
  const [patients, setPatients] = useState<any[]>([]);

  const [form, setForm] = useState({
    paciente_id: '',
    fecha: new Date().toISOString().split('T')[0], // Fecha de hoy por defecto
    hora: '09:00',
    duracion: '60',
    tipo: 'individual',
    modalidad: 'presencial',
    notas: '',
    objetivos: '',
    tareas: '',
  });

  // 1. CARGAR PACIENTES DESDE SUPABASE
  useEffect(() => {
    async function fetchPatients() {
      const { data, error } = await supabase
        .from('pacientes')
        .select('id, nombre, apellido, diagnosticoprincipal, totalsesiones')
        .order('nombre');

      if (data) setPatients(data);
      setLoadingPatients(false);
    }
    fetchPatients();
  }, []);

  const selectedPatient = patients.find((p) => p.id === form.paciente_id);

  function update(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  // 2. GUARDAR SESIÓN EN SUPABASE
  async function handleSave() {
    if (!form.paciente_id) return;
    setSaving(true);
    
    try {
      // Convertimos los objetivos (texto) en un array para el SQL
      const objetivosArray = form.objetivos
        .split(',')
        .map(obj => obj.trim())
        .filter(obj => obj !== '');

      const { error } = await supabase
        .from('sesiones')
        .insert([{
          paciente_id: form.paciente_id,
          fecha: form.fecha,
          hora: form.hora,
          duracion: parseInt(form.duracion),
          tipo: form.tipo,
          modalidad: form.modalidad,
          notas: form.notas,
          objetivos: objetivosArray,
          // tareas: form.tareas // Si tienes esta columna en la tabla sesiones
        }]);

      if (error) throw error;
      navigate(ROUTE_PATHS.SESSIONS);
    } catch (err) {
      console.error('Error guardando sesión:', err);
      alert('Error al guardar la sesión');
    } finally {
      setSaving(false);
    }
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
            <Select 
              value={form.paciente_id} 
              onValueChange={(v) => update('paciente_id', v)}
              disabled={loadingPatients}
            >
              <SelectTrigger>
                <SelectValue placeholder={loadingPatients ? "Cargando..." : "Buscar paciente..."} />
              </SelectTrigger>
              <SelectContent>
                {patients.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.nombre} {p.apellido}
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
              <p className="text-muted-foreground text-xs mt-0.5">{selectedPatient.diagnosticoprincipal || 'Sin diagnóstico'}</p>
              <p className="text-muted-foreground text-xs">{selectedPatient.totalsesiones || 0} sesiones previas</p>
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
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30 minutos</SelectItem>
                  <SelectItem value="45">45 minutos</SelectItem>
                  <SelectItem value="60">60 minutos</SelectItem>
                  <SelectItem value="90">90 minutos</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Modalidad</Label>
              <Select value={form.modalidad} onValueChange={(v) => update('modalidad', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
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
              <SelectTrigger><SelectValue /></SelectTrigger>
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
            context={{ diagnostico: selectedPatient?.diagnosticoprincipal, tipoConsulta: 'default' }}
            rows={5}
            placeholder="Describe el contenido de la sesión..."
          />

          <AIField
            label="Objetivos trabajados"
            fieldKey="objetivos"
            value={form.objetivos}
            onChange={(v) => update('objetivos', v)}
            context={{ diagnostico: selectedPatient?.diagnosticoprincipal }}
            rows={3}
            placeholder="Objetivos (separa por comas para verlos como etiquetas)..."
          />

          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Tareas para casa</Label>
            <Input
              value={form.tareas}
              onChange={(e) => update('tareas', e.target.value)}
              placeholder="Asignaciones para el paciente..."
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
          disabled={saving || !form.paciente_id}
          className="gap-2 min-w-[120px]"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? 'Guardando...' : 'Guardar sesión'}
        </Button>
      </div>
    </div>
  );
}