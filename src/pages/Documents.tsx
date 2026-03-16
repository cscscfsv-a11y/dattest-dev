import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Search,
  FileText,
  Download,
  Trash2,
  Sparkles,
  Filter,
  Upload,
  Brain,
  Eye,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { MOCK_DOCUMENTS, MOCK_PATIENTS } from '@/data/index';
import { ROUTE_PATHS, DOC_TYPE_LABELS } from '@/lib/index';
import type { DocumentType } from '@/lib/index';
import { staggerContainer, staggerItem } from '@/lib/motion';
import { cn } from '@/lib/utils';

export default function Documents() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<DocumentType | 'todos'>('todos');

  const docs = MOCK_DOCUMENTS.filter((d) => {
    const patient = MOCK_PATIENTS.find((p) => p.id === d.pacienteId);
    const patientName = patient ? `${patient.nombre} ${patient.apellido}` : '';
    const matchSearch =
      !search ||
      d.nombre.toLowerCase().includes(search.toLowerCase()) ||
      patientName.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === 'todos' || d.tipo === typeFilter;
    return matchSearch && matchType;
  });

  const aiGenCount = MOCK_DOCUMENTS.filter((d) => d.generadoPorIA).length;

  return (
    <div className="p-6 space-y-6 max-w-[1200px]">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Documentos</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {MOCK_DOCUMENTS.length} documentos · {aiGenCount} generados por IA
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Upload className="w-4 h-4" />
            Subir
          </Button>
          <Button className="gap-2">
            <Brain className="w-4 h-4" />
            Generar con IA
          </Button>
        </div>
      </div>

      {/* Stats */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 sm:grid-cols-4 gap-4"
      >
        {[
          { label: 'Total', value: MOCK_DOCUMENTS.length, color: 'bg-primary/10 text-primary' },
          { label: 'Evaluaciones', value: MOCK_DOCUMENTS.filter((d) => d.tipo === 'evaluacion').length, color: 'bg-accent/10 text-accent-foreground' },
          { label: 'Consentimientos', value: MOCK_DOCUMENTS.filter((d) => d.tipo === 'consentimiento').length, color: 'bg-success/10 text-success' },
          { label: 'Generados por IA', value: aiGenCount, color: 'bg-warning/10 text-warning' },
        ].map((stat) => (
          <motion.div key={stat.label} variants={staggerItem}>
            <Card className="border-border/60">
              <CardContent className="p-4 flex items-center gap-3">
                <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold shrink-0', stat.color)}>
                  {stat.value}
                </div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar documentos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as DocumentType | 'todos')}>
          <SelectTrigger className="w-[160px]">
            <Filter className="w-3.5 h-3.5 mr-2 text-muted-foreground" />
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos los tipos</SelectItem>
            <SelectItem value="evaluacion">Evaluación</SelectItem>
            <SelectItem value="consentimiento">Consentimiento</SelectItem>
            <SelectItem value="informe">Informe</SelectItem>
            <SelectItem value="receta">Receta</SelectItem>
            <SelectItem value="otro">Otro</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Card className="border-border/60">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="text-xs font-semibold">Documento</TableHead>
              <TableHead className="text-xs font-semibold">Paciente</TableHead>
              <TableHead className="text-xs font-semibold">Tipo</TableHead>
              <TableHead className="text-xs font-semibold">Fecha</TableHead>
              <TableHead className="text-xs font-semibold">Tamaño</TableHead>
              <TableHead className="text-xs font-semibold">Origen</TableHead>
              <TableHead className="text-right text-xs font-semibold">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {docs.map((doc) => {
              const patient = MOCK_PATIENTS.find((p) => p.id === doc.pacienteId);
              return (
                <TableRow key={doc.id} className="hover:bg-muted/30">
                  <TableCell>
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <FileText className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground line-clamp-1 max-w-[200px]">{doc.nombre}</p>
                        {doc.descripcion && (
                          <p className="text-[11px] text-muted-foreground line-clamp-1">{doc.descripcion}</p>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {patient ? (
                      <button
                        className="text-sm text-primary hover:underline"
                        onClick={() => navigate(ROUTE_PATHS.PATIENT_DETAIL.replace(':id', patient.id))}
                      >
                        {patient.nombre} {patient.apellido.split(' ')[0]}
                      </button>
                    ) : '—'}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="text-[10px]">
                      {DOC_TYPE_LABELS[doc.tipo]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(doc.fecha + 'T00:00:00').toLocaleDateString('es-MX')}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{doc.tamaño}</TableCell>
                  <TableCell>
                    {doc.generadoPorIA ? (
                      <Badge className="text-[10px] h-5 bg-primary/15 text-primary border-0 gap-1">
                        <Sparkles className="w-3 h-3" />IA
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="text-[10px] h-5">Manual</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" className="w-7 h-7">
                        <Eye className="w-3.5 h-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="w-7 h-7">
                        <Download className="w-3.5 h-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="w-7 h-7 text-destructive hover:text-destructive">
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
