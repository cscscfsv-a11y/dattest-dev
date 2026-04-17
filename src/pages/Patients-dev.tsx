import { useState, useMemo, useEffect } from 'react'; // Añadido useMemo y useEffect
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Search, Filter, Plus, Grid3X3, List, X, 
  Activity, Clock, AlertCircle, CheckCircle, Brain // Nuevos iconos
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card'; // Añadido Card
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
import { supabase } from "@/lib/supabaseClient"; // Importar supabase

type ViewMode = 'grid' | 'list';

export default function Patients() {
  const navigate = useNavigate();
  const { patients, loading } = usePatients();
  const [sessions, setSessions] = useState<any[]>([]); // Para calcular estados

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<PatientStatus | 'todos'>('todos');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  // Cargar sesiones para la lógica de estados automáticos
  useEffect(() => {
    async function getSessions() {
      const { data } = await supabase.from('sesiones').select('paciente_id, estado');
      if (data) setSessions(data);
    }
    getSessions();
  }, []);

  // LÓGICA DE ESTADOS AUTOMÁTICOS
  const processedPatients = useMemo(() => {
    return patients.map(p => {
      const pSessions = sessions.filter(s => s.paciente_id === p.id);
      const total = pSessions.length;
      const canceled = pSessions.filter(s => s.estado === 'cancelada').length;
      
      let autoStatus: PatientStatus = p.estado;

      if (total >= 2) autoStatus = 'activo';
      if (canceled >= 1) autoStatus = 'seguimiento';
      if (canceled >= 3 || (total === 0 && p.estado !== 'alta')) autoStatus = 'inactivo';
      // 'alta' se mantiene si viene de la DB (observación)

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
    const matchSearch =
      !search ||
      `${p.nombre} ${p.apellido}`.toLowerCase().includes(search.toLowerCase()) ||
      (p.email || "").toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "todos" || p.autoStatus === statusFilter;
    return matchSearch && matchStatus;
  });

  if (loading) {
    return <p className="text-center py-20 italic">Sincronizando pacientes...</p>;
  }

  return (
    <div className="p-6 space-y-6 max-w-[1400px]">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground font-title">Directorio de Pacientes</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {patients.length} registros gestionados automáticamente
          </p>
        </div>
        <Button className="gap-2" onClick={() => navigate(ROUTE_PATHS.PATIENT_NEW)}>
          <Plus className="w-4 h-4" />
          Nuevo paciente
        </Button>
      </div>

      {/* TARJETAS RESUMEN INTERACTIVAS (NUEVO) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { id: 'activo', icon: Activity, color: 'text-emerald-500', bg: 'bg-emerald-50' },
          { id: 'seguimiento', icon: Clock, color: 'text-blue-500', bg: 'bg-blue-50' },
          { id: 'inactivo', icon: AlertCircle, color: 'text-amber-500', bg: 'bg-amber-50' },
          { id: 'alta', icon: CheckCircle, color: 'text-purple-500', bg: 'bg-purple-50' },
        ].map((item) => (
          <Card 
            key={item.id} 
            className={`${item.bg} border-none shadow-none cursor-pointer hover:ring-2 ring-primary/20 transition-all`}
            onClick={() => setStatusFilter(item.id as any)}
          >
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">{item.id}</p>
                <p className={`text-2xl font-bold ${item.color}`}>{statusCounts[item.id] || 0}</p>
              </div>
              <item.icon className={`w-8 h-8 opacity-20 ${item.color}`} />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Control Bar (Search & Filter) */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-9 bg-muted/20 border-none shadow-none"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
          <SelectTrigger className="w-[160px] bg-muted/20 border-none">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos los estados</SelectItem>
            <SelectItem value="activo">Activo</SelectItem>
            <SelectItem value="seguimiento">Seguimiento</SelectItem>
            <SelectItem value="inactivo">Inactivo</SelectItem>
            <SelectItem value="alta">Alta médica</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex border border-border rounded-lg overflow-hidden">
          <button onClick={() => setViewMode('grid')} className={`p-2 ${viewMode === 'grid' ? 'bg-primary text-white' : 'text-muted-foreground'}`}><Grid3X3 className="w-4 h-4" /></button>
          <button onClick={() => setViewMode('list')} className={`p-2 ${viewMode === 'list' ? 'bg-primary text-white' : 'text-muted-foreground'}`}><List className="w-4 h-4" /></button>
        </div>
      </div>

      {/* Results count */}
      {search && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>{filtered.length} resultados encontrados</span>
        </div>
      )}

      {/* Patients grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground border-2 border-dashed rounded-2xl">
          <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium">No se encontraron pacientes</p>
        </div>
      ) : (
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4' : 'flex flex-col gap-3'}
        >
          {filtered.map((p) => (
            <motion.div key={p.id} variants={staggerItem} className="relative group">
              {/* Le pasamos el estado calculado al componente de la tarjeta */}
              <PatientCard patient={{...p, estado: p.autoStatus}} />
              
              {/* BOTÓN FLOTANTE PARA EXAMEN MENTAL */}
              <Button 
                size="icon" 
                variant="secondary" 
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity rounded-full shadow-md z-10"
                onClick={() => navigate(`/mental-status/${p.id}`)}
              >
                <Brain className="w-4 h-4 text-primary" />
              </Button>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}

function Users({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  );
}