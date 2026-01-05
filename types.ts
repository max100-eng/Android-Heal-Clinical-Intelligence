
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
  EMG = "EMG",
  SPIROMETRY = "Spirometry",
  EEG = "EEG",
  HOLTER = "Holter",
}

export interface PatientHealthContext {
  heartRateBpm?: number;
  respiratoryRate?: number;
  oxygenSaturation?: number;
  activityLevel?: string;
  stepsCount?: number;
  lastSync?: string;
}

export interface DifferentialDiagnosis {
  condition: string;
  probability: "High" | "Moderate" | "Low";
  reasoning: string;
}

export interface UrinalysisParam {
  name: string;
  value: string;
  status: "Normal" | "Abnormal" | "Trace";
}

export interface RXOverlay {
  label: string;
  x: number; // 0-1000
  y: number; // 0-1000
  width?: number; // 0-1000
  height?: number; // 0-1000
  type: "box" | "point";
}

export interface AnalysisResult {
  modalityDetected: string;
  clinicalFindings: string;
  differentialDiagnoses: DifferentialDiagnosis[];
  suggestedFollowUp: string;
  confidenceScore: number;
  urgentAlert: boolean;
  urinalysisData?: UrinalysisParam[];
  rxOverlays?: RXOverlay[];
  healthCorrelation?: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}
