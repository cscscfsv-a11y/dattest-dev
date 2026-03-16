import { useState, useCallback } from 'react';

export interface AISuggestion {
  field: string;
  value: string;
}

const AI_TEMPLATES: Record<string, Record<string, string>> = {
  anamnesis: {
    ansiedad: 'INFORME DE ANAMNESIS:\nPaciente presenta sintomatología clínicamente significativa compatible con Trastorno de Ansiedad Generalizada. Refiere rumiación cognitiva persistente, tensión psicofísica y alteraciones en la arquitectura del sueño de [X] tiempo de evolución. Se observa hipervigilancia y labilidad emocional reactiva. No se reportan indicadores de riesgo autolítico o heteroagresivo. El impacto funcional se evidencia en la esfera laboral y personal.',
    depresion: 'INFORME DE ANAMNESIS:\nEl paciente manifiesta un estado de ánimo predominantemente hipotímico, acompañado de anhedonia marcada y abulia. Reporta fatiga crónica no explicada por causas orgánicas y distorsiones cognitivas de tipo autodesvalorización y desesperanza. El cuadro clínico sugiere un episodio depresivo de severidad [X] con afectación del ritmo circadiano y apetito. Requiere intervención centrada en activación conductual y monitoreo de seguridad.',
    trauma: 'INFORME DE ANAMNESIS:\nPaciente acude por sintomatología de estrés postraumático secundaria a [evento]. Describe re-experimentación intrusiva (flashbacks), alteraciones del sueño y estado de hiperactivación autonómica persistente. Se identifica evitación conductual de estímulos asociados al trauma y embotamiento afectivo. El inicio de los síntomas prodrómicos se sitúa en [fecha].',
  },
  planTratamiento: {
    ansiedad: 'PLAN DE INTERVENCIÓN PSICOTERAPÉUTICA (TCC):\n\nFase I (Estabilización): Psicoeducación sobre el ciclo de la ansiedad. Entrenamiento en técnicas de desactivación fisiológica (Respiración diafragmática y Relajación de Jacobson).\n\nFase II (Procesamiento): Reestructuración cognitiva dirigida a pensamientos automáticos deformados. Exposición gradual in vivo/imaginaria a estímulos fóbicos.\n\nFase III (Consolidación): Prevención de recaídas mediante el fortalecimiento de la autoeficacia y cierre de proceso.',
    depresion: 'PLAN DE INTERVENCIÓN PSICOTERAPÉUTICA (Activación Conductual):\n\nFase I (Evaluación/Monitoreo): Registro de actividades y estado de ánimo. Identificación de conductas de evitación y reforzadores naturales.\n\nFase II (Activación): Programación de actividades graduadas por jerarquía de dificultad. Reestructuración de esquemas de pensamiento disfuncionales.\n\nFase III (Mantenimiento): Planificación de estrategias de afrontamiento para situaciones de vulnerabilidad futura.',
    trauma: 'PLAN DE INTERVENCIÓN PSICOTERAPÉUTICA (TPC/EMDR):\n\nFase I (Contención): Establecimiento de un lugar seguro y técnicas de "grounding". Psicoeducación sobre la neurobiología del trauma.\n\nFase II (Procesamiento): Exposición prolongada o procesamiento mediante desensibilización ocular. Trabajo sobre creencias de culpa y seguridad.\n\nFase III (Integración): Re-significación de la experiencia traumática e integración en la narrativa vital del paciente.',
  },
  notaSesion: {
    default: 'NOTA CLÍNICA DE SESIÓN:\nESTADO MENTAL: Paciente se presenta orientado en tiempo, espacio y persona. Cooperativo, con discurso coherente y fluido.\nMOTIVO DE SESIÓN: El paciente reporta [estado/evento semanal].\nINTERVENCIÓN: Se aplicó técnica de [técnica] enfocada en [objetivo]. Se trabajó el reconocimiento de disparadores emocionales.\nALIANZA TERAPÉUTICA: Satisfactoria, se observa insight progresivo.\nPLAN: Continuar con autorregistro y próxima sesión programada para [fecha].',
    progreso: 'NOTA CLÍNICA DE SEGUIMIENTO:\nEVOLUCIÓN: Se evidencia avance en los objetivos terapéuticos establecidos. Los resultados de la escala [Escala] indican una disminución del puntaje de [X] a [Y], situándose en rango [Rango].\nOBSERVACIONES: El paciente reporta mayor capacidad de regulación emocional ante situaciones de estrés laboral.\nAJUSTES: Se mantiene el plan actual con énfasis en [foco].',
  },
  evolucion: {
    positiva: 'INFORME DE EVOLUCIÓN CLÍNICA:\nLa evolución del paciente se califica como favorable y progresiva. Se observa una remisión significativa de la sintomatología inicial, validada por herramientas psicométricas ([escala]: [puntaje inicial] → [puntaje actual]). El funcionamiento global en esferas sociales y laborales muestra una recuperación notable. La adherencia terapéutica ha sido óptima durante todo el proceso.',
    moderada: 'INFORME DE EVOLUCIÓN CLÍNICA:\nLa evolución clínica se presenta con avances graduales y periodos de fluctuación sintomática. Se identifica una mejoría parcial en la regulación emocional, aunque persisten indicadores de vulnerabilidad en situaciones de alta demanda. Se recomienda mantener el proceso psicoterapéutico con ajustes en la frecuencia de las sesiones para consolidar los logros alcanzados.',
  },
};

export function useAIAssistant() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastGenerated, setLastGenerated] = useState<string | null>(null);

  const generateSuggestion = useCallback(
    async (
      field: string,
      context: { diagnostico?: string; tipoConsulta?: string; currentValue?: string } = {}
    ): Promise<string> => {
      setIsGenerating(true);
      // Simular procesamiento de IA con retardo
      await new Promise((res) => setTimeout(res, 1200 + Math.random() * 800));

      const { diagnostico = '', tipoConsulta = 'default', currentValue = '' } = context;
      const diagLower = diagnostico.toLowerCase();
      let suggestion = '';

      // Si hay texto existente, la IA lo "detalla" y "amplía" profesionalmente
      if (currentValue && currentValue.length > 5) {
        suggestion = `DETALLE CLÍNICO AMPLIADO:\n${currentValue}\n\n[LA IA HA DETALLADO EL TEXTO ANTERIOR]: Se observa una correlación significativa entre lo reportado por el paciente y los indicadores clínicos de ${diagnostico || 'la condición actual'}. Se profundiza en la narrativa vital del paciente, identificando esquemas cognitivos subyacentes y patrones conductuales de evitación. El discurso mantiene coherencia y relevancia clínica, permitiendo una intervención focalizada en [objetivo terapéutico].`;
      } else {
        // Si no hay texto, usa la plantilla estándar según el diagnóstico
        if (field === 'anamnesis') {
          if (diagLower.includes('ansiedad') || diagLower.includes('f41') || diagLower.includes('f40')) {
            suggestion = AI_TEMPLATES.anamnesis.ansiedad;
          } else if (diagLower.includes('depresiv') || diagLower.includes('f32') || diagLower.includes('f33')) {
            suggestion = AI_TEMPLATES.anamnesis.depresion;
          } else if (diagLower.includes('trauma') || diagLower.includes('tept') || diagLower.includes('f43')) {
            suggestion = AI_TEMPLATES.anamnesis.trauma;
          } else {
            suggestion = AI_TEMPLATES.anamnesis.ansiedad;
          }
        } else if (field === 'planTratamiento') {
          if (diagLower.includes('ansiedad') || diagLower.includes('f41') || diagLower.includes('f40')) {
            suggestion = AI_TEMPLATES.planTratamiento.ansiedad;
          } else if (diagLower.includes('depresiv') || diagLower.includes('f32') || diagLower.includes('f33')) {
            suggestion = AI_TEMPLATES.planTratamiento.depresion;
          } else {
            suggestion = AI_TEMPLATES.planTratamiento.trauma;
          }
        } else if (field === 'notaSesion') {
          suggestion =
            tipoConsulta === 'progreso'
              ? AI_TEMPLATES.notaSesion.progreso
              : AI_TEMPLATES.notaSesion.default;
        } else if (field === 'evolucion') {
          suggestion = AI_TEMPLATES.evolucion.positiva;
        } else {
          suggestion = `Sugerencia generada por IA para el campo "${field}". Complete con información específica del paciente.`;
        }
      }

      setIsGenerating(false);
      setLastGenerated(field);
      return suggestion;
    },
    []
  );

  const generateFullRecord = useCallback(
    async (context: {
      diagnostico: string;
      motivoConsulta: string;
    }): Promise<Record<string, string>> => {
      setIsGenerating(true);
      await new Promise((res) => setTimeout(res, 1400));

      const diagLower = context.diagnostico.toLowerCase();
      let type = 'ansiedad';
      if (diagLower.includes('depresiv')) type = 'depresion';
      if (diagLower.includes('trauma') || diagLower.includes('tept')) type = 'trauma';

      const result: Record<string, string> = {
        anamnesis:
          AI_TEMPLATES.anamnesis[type] || AI_TEMPLATES.anamnesis.ansiedad,
        planTratamiento:
          AI_TEMPLATES.planTratamiento[type] || AI_TEMPLATES.planTratamiento.ansiedad,
        evolucion: AI_TEMPLATES.evolucion.positiva,
      };

      setIsGenerating(false);
      setLastGenerated('full');
      return result;
    },
    []
  );

  return { isGenerating, lastGenerated, generateSuggestion, generateFullRecord };
}
