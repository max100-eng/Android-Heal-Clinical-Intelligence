
export enum ImageType {
  ECG = "ECG",
  RX = "RX",
  TC = "TC",
  RMN = "RMN",
  ECO = "ECO",
  RETINA = "Retina",
  DERMATOSCOPY = "Dermatoscopy",
  URINALYSIS = "Urinalysis",
  TOXICOLOGY = "Toxicology",
  NUCLEAR_MEDICINE = "NuclearMedicine",
}

export interface DifferentialDiagnosis {
  condition: string;
  probability: "High" | "Moderate" | "Low";
  reasoning: string;
}

export interface AnalysisResult {
  modalityDetected: string;
  clinicalFindings: string;
  differentialDiagnoses: DifferentialDiagnosis[];
  suggestedFollowUp: string;
  confidenceScore: number;
  urgentAlert: boolean;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}
