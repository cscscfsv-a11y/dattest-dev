import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Search, Filter, Plus, Grid3X3, List, X, 
  Activity, Clock, AlertCircle, CheckCircle, Brain 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PatientCard } from '@/components/PatientCard';
import { ROUTE_PATHS, STATUS_LABELS, STATUS_COLORS } from '@/lib/index';
import type { PatientStatus } from '@/lib/index';
import { staggerContainer, staggerItem } from '@/lib/motion';

import { usePatients } from "@/pages/usePatients";
import { supabase } from "@/lib/supabaseClient";
import { cn } from '@/lib/utils'; // Asegúrate de tener esta utilidad

type ViewMode = 'grid' | 'list';

export default function Patients() {
  const navigate = useNavigate();
  const { patients, loading } = usePatients();
  const [sessions, setSessions] = useState<any[]>([]);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<PatientStatus | 'todos'>('todos');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  useEffect(() => {
    async function getSessions() {
      const { data } = await supabase.from('sesiones').select('paciente_id, estado');
      if (data) setSessions(data);
    }
    getSessions();
  }, []);

  const processedPatients = useMemo(() => {
    return patients.map(p => {
      const pSessions = sessions.filter(s => s.paciente_id === p.id);
      const total = pSessions.length;
      const canceled = pSessions.filter(s => s.estado === 'cancelada').length;
      
      let autoStatus: PatientStatus = p.estado;
      if (total >= 2) autoStatus = 'activo';
      if (canceled >= 1) autoStatus = 'seguimiento';
      if (canceled >= 3 || (total === 0 && p.estado !== 'alta')) autoStatus = 'inactivo';

      return { ...p, autoStatus };
    });
  }, [patients, sessions]);

  const statusCounts = useMemo(() => {
    return processedPatients.reduce((acc, p) => {
      acc[p.autoStatus] = (acc[p.autoStatus] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }, [processedPatients]);

  const filtered = processedPatients.filter((p) => {
    const matchSearch = !search || `${p.nombre} ${p.apellido}`.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "todos" || p.autoStatus === statusFilter;
    return matchSearch && matchStatus;
  });

  // Lógica de Toggle para los filtros superiores
  const handleToggleFilter = (id: PatientStatus) => {
    if (statusFilter === id) {
      setStatusFilter('todos'); // Si ya está seleccionado, vuelve a mostrar todos
    } else {
      setStatusFilter(id); // Si no, selecciona el nuevo
    }
  };

  if (loading) return <p className="text-center py-20 italic">Sincronizando...</p>;

  return (
    <div className="p-6 space-y-6 max-w-[1400px]">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground font-title">Directorio de Pacientes</h1>
          <p className="text-sm text-muted-foreground mt-1">{patients.length} registros en total</p>
        </div>
        <Button className="gap-2" onClick={() => navigate(ROUTE_PATHS.PATIENT_NEW)}>
          <Plus className="w-4 h-4" /> Nuevo paciente
        </Button>
      </div>

      {/* TARJETAS RESUMEN CON LÓGICA DE TOGGLE */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { id: 'activo', icon: Activity, color: 'text-emerald-500', bg: 'bg-emerald-50' },
          { id: 'seguimiento', icon: Clock, color: 'text-blue-500', bg: 'bg-blue-50' },
          { id: 'inactivo', icon: AlertCircle, color: 'text-amber-500', bg: 'bg-amber-50' },
          { id: 'alta', icon: CheckCircle, color: 'text-purple-500', bg: 'bg-purple-50' },
        ].map((item) => (
          <Card 
            key={item.id} 
            className={cn(
              "border-none shadow-none cursor-pointer transition-all duration-200 hover:scale-[1.02]",
              item.bg,
              statusFilter === item.id ? "ring-2 ring-primary ring-offset-2 scale-[1.02]" : "opacity-70 hover:opacity-100"
            )}
            onClick={() => handleToggleFilter(item.id as PatientStatus)}
          >
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">{STATUS_LABELS[item.id as PatientStatus]}</p>
                <p className={cn("text-2xl font-bold", item.color)}>{statusCounts[item.id] || 0}</p>
              </div>
              <item.icon className={cn("w-8 h-8 opacity-20", item.color)} />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Control Bar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar paciente..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-muted/20 border-none"
          />
        </div>
        <div className="flex border border-border rounded-lg overflow-hidden">
          <button onClick={() => setViewMode('grid')} className={cn("p-2", viewMode === 'grid' ? 'bg-primary text-white' : 'text-muted-foreground')}><Grid3X3 className="w-4 h-4" /></button>
          <button onClick={() => setViewMode('list')} className={cn("p-2", viewMode === 'list' ? 'bg-primary text-white' : 'text-muted-foreground')}><List className="w-4 h-4" /></button>
        </div>
      </div>

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4' : 'flex flex-col gap-3'}
      >
        {filtered.map((p) => (
          <motion.div key={p.id} variants={staggerItem} className="relative group">
            <PatientCard patient={{...p, estado: p.autoStatus}} />
            
            {/* BOTÓN CEREBRO: Posicionado a la izquierda del menú de 3 puntos (que suele estar a la derecha) */}
            <Button 
              size="icon" 
              variant="secondary" 
              className="absolute top-3 right-12 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity rounded-full shadow-sm z-10 bg-white/80 hover:bg-primary hover:text-white"
              onClick={(e) => {
                e.stopPropagation(); // Evita clics accidentales en la tarjeta
                navigate(`/mental-status/${p.id}`);
              }}
            >
              <Brain className="w-3.5 h-3.5" />
            </Button>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}