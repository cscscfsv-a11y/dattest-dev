/**
 * Busca diagnósticos en la API de la NLM y traduce el resultado al español.
 */
export async function fetchDiagnosisFromAPI(query: string): Promise<string | null> {
  try {
    // 1. Consulta a la base de datos médica (NLM - ICD10)
    const res = await fetch(
      `https://clinicaltables.nlm.nih.gov/api/icd10cm/v3/search?sf=code,name&terms=${encodeURIComponent(query)}`
    );
    const data = await res.json();

    if (data && data[3] && data[3].length > 0) {
      const [code, descriptionEn] = data[3][0];

      // 2. Traducción automática de la descripción técnica al español
      try {
        const resTranslate = await fetch(
          `https://api.mymemory.translated.net/get?q=${encodeURIComponent(descriptionEn)}&langpair=en|es`
        );
        const dataTranslate = await resTranslate.json();
        const descriptionEs = dataTranslate.responseData.translatedText || descriptionEn;
        
        return `${code} - ${descriptionEs}`;
      } catch (error) {
        // Si falla la traducción, devuelve el término original
        return `${code} - ${descriptionEn}`;
      }
    }
    return null;
  } catch (err) {
    console.error("Error consultando API:", err);
    return null;
  }
}