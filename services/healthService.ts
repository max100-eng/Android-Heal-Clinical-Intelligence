
import { PatientHealthContext } from "../types";

export const fetchHealthData = async (): Promise<PatientHealthContext> => {
  // Simular latencia de consulta a sensores locales o API biométrica
  await new Promise(resolve => setTimeout(resolve, 1500));

  // Lógica agnóstica para obtención de datos de biosensores
  const isNative = (window as any).Capacitor?.isNative;

  if (isNative) {
     console.log("Sistema Nativo Detectado: Sincronizando biosensores corporales...");
  }

  // Retorno de datos biométricos ilustrativos/simulados
  return {
    heartRateBpm: 72 + Math.floor(Math.random() * 15),
    respiratoryRate: 14 + Math.floor(Math.random() * 4),
    oxygenSaturation: 97 + Math.floor(Math.random() * 3),
    activityLevel: "Moderado (Activo 45m hoy)",
    stepsCount: 5420 + Math.floor(Math.random() * 1000),
    lastSync: new Date().toISOString()
  };
};
