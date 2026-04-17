import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Calendar, 
  Video, 
  MapPin, 
  ChevronRight, 
  User, 
  Loader2, 
  FileEdit, 
  UserCircle, 
  ClipboardList 
} from 'lucide-react';

// UI Components
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Helpers & Config
import { ROUTE_PATHS, SESSION_STATUS_COLORS, SESSION_STATUS_LABELS } from '@/lib/index';
import type { SessionStatus } from '@/lib/index';
import { staggerContainer, staggerItem } from '@/lib/motion';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabaseClient';

export default function Sessions() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<'todas' | SessionStatus>('todas');
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. CARGA DE DATOS DESDE SUPABASE
  useEffect(() => {
    async function fetchSessions() {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('sesiones')
          .select(`
            *,
            pacientes (
              id,
              nombre,
              apellido
            )
          `)
          .order('fecha', { ascending: false })
          .order('hora', { ascending: false });

        if (error) throw error;
        setSessions(data || []);
      } catch (err) {
        console.error('Error cargando sesiones:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchSessions();
  }, []);

  // 2. LÓGICA DE FILTRADO Y AGRUPACIÓN (No tocamos el diseño de grupos)
  const filtered = sessions.filter((s) => tab === 'todas' || s.estado === tab);

  const grouped = filtered.reduce<Record<string, typeof filtered>>((acc, s) => {
    if (!acc[s.fecha]) acc[s.fecha] = [];
    acc[s.fecha].push(s);
    return acc;
  }, {});

  const sortedDates = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground italic">Cargando agenda clínica...</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-[900px] space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Sesiones</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {sessions.length} sesiones en total
          </p>
        </div>
        <Button className="gap-2" onClick={() => navigate(ROUTE_PATHS.SESSION_NEW)}>
          <Plus className="w-4 h-4" />
          Nueva sesión
        </Button>
      </div>

      {/* Filtros de Pestañas */}
      <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
        <TabsList>
          <TabsTrigger value="todas" className="text-xs">Todas</TabsTrigger>
          <TabsTrigger value="programada" className="text-xs">Programadas</TabsTrigger>
          <TabsTrigger value="completada" className="text-xs">Completadas</TabsTrigger>
          <TabsTrigger value="cancelada" className="text-xs">Canceladas</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Lista de Sesiones agrupadas por Fecha */}
      {sortedDates.length === 0 ? (
        <Card className="border-border/60">
          <CardContent className="py-16 text-center text-muted-foreground">
            <Calendar className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="font-medium">No se encontraron sesiones</p>
          </CardContent>
        </Card>
      ) : (
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
          {sortedDates.map((date) => {
            const dateObj = new Date(date + 'T00:00:00');
            const todayStr = new Date().toLocaleDateString('en-CA'); // Formato YYYY-MM-DD
            const isToday = date === todayStr;

            return (
              <motion.div key={date} variants={staggerItem}>
                {/* DISEÑO DE GRUPO: HOY / FECHA + SEPARADOR (No se toca) */}
                <div className="flex items-center gap-3 mb-3">
                  <div className={cn(
                    'px-3 py-1 rounded-full text-xs font-semibold',
                    isToday ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'
                  )}>
                    {isToday ? 'Hoy' : dateObj.toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' })}
                  </div>
                  <Separator className="flex-1" />
                  <span className="text-xs text-muted-foreground">{grouped[date].length} sesión(es)</span>
                </div>

                <div className="space-y-3">
                  {grouped[date].map((session) => (
                    /* MENÚ DROPDOWN FLOTANTE AL PRESIONAR LA SESIÓN */
                    <DropdownMenu key={session.id}>
                      <DropdownMenuTrigger asChild>
                        <Card className="border-border/60 hover:shadow-sm transition-all cursor-pointer active:scale-[0.99]">
                          <CardContent className="p-4">
                            <div className="flex items-center gap-4">
                              {/* Hora */}
                              <div className="text-center min-w-[52px]">
                                <p className="font-bold text-lg text-foreground">{session.hora}</p>
                                <p className="text-[10px] text-muted-foreground">{session.duracion}min</p>
                              </div>

                              <Separator orientation="vertical" className="h-12" />

                              {/* Paciente */}
                              <Avatar className="w-10 h-10 shrink-0">
                                <AvatarFallback className="bg-primary/15 text-primary text-sm font-bold uppercase">
                                  {(session.pacientes?.nombre?.[0] || '') + (session.pacientes?.apellido?.[0] || '')}
                                </AvatarFallback>
                              </Avatar>

                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-foreground">
                                  {session.pacientes?.nombre} {session.pacientes?.apellido}
                                </p>
                                <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                                  <span className="flex items-center gap-1">
                                    {session.modalidad === 'virtual' ? <Video className="w-3 h-3" /> : <MapPin className="w-3 h-3" />}
                                    <span className="capitalize">{session.modalidad}</span>
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <User className="w-3 h-3" />
                                    {session.tipo}
                                  </span>
                                </div>
                              </div>

                              {/* Estado y Chevron */}
                              <div className="flex items-center gap-2 shrink-0">
                                <Badge className={cn('text-[10px] border-0', SESSION_STATUS_COLORS[session.estado as SessionStatus])}>
                                  {SESSION_STATUS_LABELS[session.estado as SessionStatus]}
                                </Badge>
                                <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </DropdownMenuTrigger>

                      {/* CONTENIDO DEL MENÚ FLOTANTE */}
                      <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuLabel>Acciones de Sesión</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          className="gap-2 cursor-pointer" 
                          onClick={() => navigate(`/sessions/history/${session.id}`)}
                        >
                          <FileEdit className="w-4 h-4 text-primary" />
                          <span>Agregar historia</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="gap-2 cursor-pointer" 
                          onClick={() => navigate(ROUTE_PATHS.PATIENT_DETAIL.replace(':id', session.pacientes?.id))}
                        >
                          <UserCircle className="w-4 h-4 text-muted-foreground" />
                          <span>Ver Expediente</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="gap-2 cursor-pointer"
                          onClick={() => navigate(ROUTE_PATHS.CLINICAL_HISTORY.replace(':id', session.pacientes?.id))}
                        >
                          <ClipboardList className="w-4 h-4 text-muted-foreground" />
                          <span>Historia Clínica General</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </div>
  );
}