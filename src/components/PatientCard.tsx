import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CalendarDays, Phone, Clock, MoreVertical, FileText } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { STATUS_LABELS, STATUS_COLORS, ROUTE_PATHS } from '@/lib/index';
import type { Patient } from '@/lib/index';
import { staggerItem } from '@/lib/motion';

interface PatientCardProps {
  patient: Patient;
}

function getInitials(nombre: string, apellido: string) {
  return `${nombre[0]}${apellido[0]}`.toUpperCase();
}

function getAge(fechaNacimiento: string): number {
  const today = new Date(2026, 2, 15);
  const birth = new Date(fechaNacimiento);
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

export function PatientCard({ patient }: PatientCardProps) {
  const navigate = useNavigate();

  return (
    <motion.div
      variants={staggerItem}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      className="bg-card border border-border/60 rounded-2xl p-5 hover:shadow-md transition-shadow duration-200 cursor-pointer"
      onClick={() => navigate(ROUTE_PATHS.PATIENT_DETAIL.replace(':id', patient.id))}
    >
      <div className="flex items-start gap-3">
        <Avatar className="w-11 h-11 shrink-0">
          <AvatarFallback className="bg-primary/15 text-primary font-bold text-sm">
            {getInitials(patient.nombre, patient.apellido)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-semibold text-foreground text-sm leading-tight">
                {patient.nombre} {patient.apellido}
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                {getAge(patient.fechaNacimiento)} años · {patient.genero}
              </p>
            </div>
            <div className="flex items-center gap-1.5">
              <Badge className={cn('text-[10px] h-5 border-0 font-medium', STATUS_COLORS[patient.estado])}>
                {STATUS_LABELS[patient.estado]}
              </Badge>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-6 h-6"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreVertical className="w-3.5 h-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={(e) => {
                    e.stopPropagation();
                    navigate(ROUTE_PATHS.PATIENT_DETAIL.replace(':id', patient.id));
                  }}>
                    Ver perfil
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={(e) => {
                    e.stopPropagation();
                    navigate(ROUTE_PATHS.CLINICAL_HISTORY.replace(':id', patient.id));
                  }}>
                    Historia clínica
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                    Agendar sesión
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {patient.diagnosticoPrincipal && (
            <p className="text-xs text-muted-foreground mt-2 line-clamp-1 bg-muted/50 rounded-lg px-2 py-1">
              {patient.diagnosticoPrincipal}
            </p>
          )}

          <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {patient.totalSesiones} sesiones
            </span>
            {patient.proximaSesion && (
              <span className="flex items-center gap-1">
                <CalendarDays className="w-3 h-3" />
                {new Date(patient.proximaSesion + 'T00:00:00').toLocaleDateString('es-MX', {
                  day: 'numeric',
                  month: 'short',
                })}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 mt-4 pt-3 border-t border-border/40">
        <Button
          variant="ghost"
          size="sm"
          className="flex-1 h-7 text-xs gap-1.5 text-muted-foreground hover:text-foreground"
          onClick={(e) => {
            e.stopPropagation();
            navigate(ROUTE_PATHS.CLINICAL_HISTORY.replace(':id', patient.id));
          }}
        >
          <FileText className="w-3.5 h-3.5" />
          Historia
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="flex-1 h-7 text-xs gap-1.5 text-muted-foreground hover:text-foreground"
          onClick={(e) => e.stopPropagation()}
        >
          <Phone className="w-3.5 h-3.5" />
          Contactar
        </Button>
      </div>
    </motion.div>
  );
}
