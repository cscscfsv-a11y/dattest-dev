import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Filter, Plus, Grid3X3, List, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PatientCard } from '@/components/PatientCard';
import { MOCK_PATIENTS } from '@/data/index';
import { ROUTE_PATHS, STATUS_LABELS } from '@/lib/index';
import type { PatientStatus } from '@/lib/index';
import { staggerContainer } from '@/lib/motion';

type ViewMode = 'grid' | 'list';

export default function Patients() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<PatientStatus | 'todos'>('todos');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  const filtered = MOCK_PATIENTS.filter((p) => {
    const matchSearch =
      !search ||
      `${p.nombre} ${p.apellido}`.toLowerCase().includes(search.toLowerCase()) ||
      p.email.toLowerCase().includes(search.toLowerCase()) ||
      (p.diagnosticoPrincipal || '').toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'todos' || p.estado === statusFilter;
    return matchSearch && matchStatus;
  });

  const statusCounts: Record<string, number> = MOCK_PATIENTS.reduce(
    (acc, p) => {
      acc[p.estado] = (acc[p.estado] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  return (
    <div className="p-6 space-y-6 max-w-[1400px]">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Pacientes</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {MOCK_PATIENTS.length} pacientes en total · {statusCounts['activo'] || 0} activos
          </p>
        </div>
        <Button className="gap-2" onClick={() => navigate(ROUTE_PATHS.PATIENT_NEW)}>
          <Plus className="w-4 h-4" />
          Nuevo paciente
        </Button>
      </div>

      {/* Status quick filter */}
      <div className="flex flex-wrap gap-2">
        {(['todos', 'activo', 'seguimiento', 'inactivo', 'alta'] as const).map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              statusFilter === s
                ? 'bg-primary text-white shadow-sm'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            {s === 'todos' ? 'Todos' : STATUS_LABELS[s as PatientStatus]}
            <span className="ml-1.5 opacity-70">
              {s === 'todos' ? MOCK_PATIENTS.length : (statusCounts[s] || 0)}
            </span>
          </button>
        ))}
      </div>

      {/* Search & filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre, email o diagnóstico..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-9"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as PatientStatus | 'todos')}>
          <SelectTrigger className="w-[160px]">
            <Filter className="w-3.5 h-3.5 mr-2 text-muted-foreground" />
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
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 transition-colors ${viewMode === 'grid' ? 'bg-primary text-white' : 'text-muted-foreground hover:bg-muted'}`}
          >
            <Grid3X3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 transition-colors ${viewMode === 'list' ? 'bg-primary text-white' : 'text-muted-foreground hover:bg-muted'}`}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Results count */}
      {search && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>{filtered.length} resultados para "{search}"</span>
          <Badge variant="secondary" className="text-xs">{filtered.length}</Badge>
        </div>
      )}

      {/* Patients grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium">No se encontraron pacientes</p>
          <p className="text-sm mt-1">Prueba con otro término de búsqueda</p>
        </div>
      ) : (
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className={
            viewMode === 'grid'
              ? 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4'
              : 'flex flex-col gap-3'
          }
        >
          {filtered.map((patient) => (
            <PatientCard key={patient.id} patient={patient} />
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
