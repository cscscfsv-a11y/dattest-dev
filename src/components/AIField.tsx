import { useState } from 'react';
import { Sparkles, Loader2, RotateCcw, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { useAIAssistant } from '@/hooks/useAI';

interface AIFieldProps {
  label: string | React.ReactNode;
  fieldKey: string;
  value: string;
  onChange: (val: string) => void;
  context?: { diagnostico?: string; tipoConsulta?: string; currentValue?: string };
  placeholder?: string;
  rows?: number;
  className?: string;
}

export function AIField({
  label,
  fieldKey,
  value,
  onChange,
  context = {},
  placeholder = 'Escriba aquí o use la IA para generar contenido...',
  rows = 4,
  className,
}: AIFieldProps) {
  const { isGenerating, generateSuggestion } = useAIAssistant();
  const [previousValue, setPreviousValue] = useState('');
  const [aiGenerated, setAIGenerated] = useState(false);

  async function handleGenerate() {
    setPreviousValue(value);
    // Pasamos el valor actual del textarea a la IA para que sirva de referencia
    const suggestion = await generateSuggestion(fieldKey, { ...context, currentValue: value });
    onChange(suggestion);
    setAIGenerated(true);
  }

  function handleUndo() {
    onChange(previousValue);
    setAIGenerated(false);
  }

  return (
    <div className={cn('space-y-1.5', className)}>
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-foreground">{label}</label>
        <div className="flex items-center gap-1.5">
          {aiGenerated && value && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-xs text-muted-foreground gap-1"
                    onClick={handleUndo}
                  >
                    <RotateCcw className="w-3 h-3" />
                    Deshacer
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Restaurar texto anterior</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className={cn(
                    'h-7 px-2.5 gap-1.5 text-xs border-primary/30 text-primary hover:bg-primary/10',
                    isGenerating && 'opacity-75 cursor-not-allowed'
                  )}
                  onClick={handleGenerate}
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Sparkles className="w-3.5 h-3.5" />
                  )}
                  {isGenerating ? 'Generando...' : value ? 'Detallar con IA' : 'Generar con IA'}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {value 
                  ? 'Tomar el texto actual como referencia y detallarlo profesionalmente' 
                  : 'Generar informe clínico profesional desde cero'}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      <div className="relative">
        <Textarea
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            if (aiGenerated) setAIGenerated(false);
          }}
          placeholder={placeholder}
          rows={rows}
          className={cn(
            'resize-y text-sm leading-relaxed',
            aiGenerated && 'border-primary/40 bg-primary/[0.03]'
          )}
        />
        {aiGenerated && value && (
          <div className="absolute bottom-2 right-2">
            <Badge className="text-[9px] h-4 px-1.5 bg-primary/15 text-primary border-0 gap-1.5 shadow-sm">
              <FileText className="w-2.5 h-2.5" />
              FORMATO CLÍNICO IA
            </Badge>
          </div>
        )}
      </div>
    </div>
  );
}
