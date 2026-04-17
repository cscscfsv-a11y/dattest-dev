import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export function usePatients() {
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPatients = async () => {
      const { data, error } = await supabase
        .from("pacientes")
        .select("*");
      if (!error) setPatients(data || []);
      setLoading(false);
    };
    fetchPatients();
  }, []);

  return { patients, loading };
}
