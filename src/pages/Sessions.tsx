import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Calendar, Clock, Video, MapPin, Filter, ChevronRight, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MOCK_SESSIONS } from '@/data/index';
import { ROUTE_PATHS, SESSION_STATUS_COLORS, SESSION_STATUS_LABELS } from '@/lib/index';
import type { SessionStatus } from '@/lib/index';
import { staggerContainer, staggerItem } from '@/lib/motion';
import { cn } from '@/lib/utils';

export default function Sessions() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<'todas' | SessionStatus>('todas');

  const filtered = MOCK_SESSIONS.filter((s) => tab === 'todas' || s.estado === tab);

  // Group by date
  const grouped = filtered.reduce<Record<string, typeof filtered>>((acc, s) => {
    if (!acc[s.fecha]) acc[s.fecha] = [];
    acc[s.fecha].push(s);
    return acc;
  }, {});

  const sortedDates = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

  return (
    <div className="p-6 max-w-[900px] space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Sesiones</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {MOCK_SESSIONS.length} sesiones registradas
          </p>
        </div>
        <Button className="gap-2" onClick={() => navigate(ROUTE_PATHS.SESSION_NEW)}>
          <Plus className="w-4 h-4" />
          Nueva sesión
        </Button>
      </div>

      {/* Filter tabs */}
      <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
        <TabsList>
          <TabsTrigger value="todas" className="text-xs">Todas ({MOCK_SESSIONS.length})</TabsTrigger>
          <TabsTrigger value="programada" className="text-xs">
            Programadas ({MOCK_SESSIONS.filter((s) => s.estado === 'programada').length})
          </TabsTrigger>
          <TabsTrigger value="completada" className="text-xs">
            Completadas ({MOCK_SESSIONS.filter((s) => s.estado === 'completada').length})
          </TabsTrigger>
          <TabsTrigger value="cancelada" className="text-xs">
            Canceladas ({MOCK_SESSIONS.filter((s) => s.estado === 'cancelada').length})
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Sessions by date */}
      {sortedDates.length === 0 ? (
        <Card className="border-border/60">
          <CardContent className="py-16 text-center text-muted-foreground">
            <Calendar className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="font-medium">No hay sesiones</p>
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
            const isToday = date === '2026-03-15';
            return (
              <motion.div key={date} variants={staggerItem}>
                {/* Date header */}
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
                    <Card
                      key={session.id}
                      className="border-border/60 hover:shadow-sm transition-all cursor-pointer"
                      onClick={() => navigate(ROUTE_PATHS.PATIENT_DETAIL.replace(':id', session.pacienteId))}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                          {/* Time */}
                          <div className="text-center min-w-[52px]">
                            <p className="font-bold text-lg text-foreground">{session.hora}</p>
                            <p className="text-[10px] text-muted-foreground">{session.duracion}min</p>
                          </div>

                          <Separator orientation="vertical" className="h-12" />

                          {/* Patient */}
                          <Avatar className="w-10 h-10 shrink-0">
                            <AvatarFallback className="bg-primary/15 text-primary text-sm font-bold">
                              {session.pacienteNombre.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                            </AvatarFallback>
                          </Avatar>

                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-foreground">{session.pacienteNombre}</p>
                            <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                {session.modalidad === 'virtual'
                                  ? <Video className="w-3 h-3" />
                                  : <MapPin className="w-3 h-3" />}
                                {session.modalidad === 'virtual' ? 'Virtual' : 'Presencial'}
                              </span>
                              <span className="flex items-center gap-1">
                                <User className="w-3 h-3" />
                                {session.tipo}
                              </span>
                            </div>
                            {session.notas && (
                              <p className="text-xs text-muted-foreground mt-1.5 line-clamp-1">{session.notas}</p>
                            )}
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <Badge className={cn('text-[10px] border-0', SESSION_STATUS_COLORS[session.estado])}>
                              {SESSION_STATUS_LABELS[session.estado]}
                            </Badge>
                            <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
                          </div>
                        </div>

                        {/* Objectives */}
                        {session.objetivos && session.objetivos.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-border/40">
                            <p className="text-[11px] text-muted-foreground uppercase tracking-wide font-medium mb-1.5">Objetivos de la sesión</p>
                            <div className="flex flex-wrap gap-1.5">
                              {session.objetivos.map((obj, i) => (
                                <Badge key={i} variant="secondary" className="text-[10px] font-normal">{obj}</Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
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
