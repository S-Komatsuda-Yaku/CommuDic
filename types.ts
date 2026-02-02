
export interface PersonalityScores {
  sociability: number;
  logic: number;
  curiosity: number;
  cooperation: number;
  action: number;
}

export interface AnalysisResult {
  catchphrase: string;
  summary: string;
  scores: PersonalityScores;
  
  // 業務適性セクション
  businessAptitude: {
    workStyle: string;
    strengths: string[];
    suitableRoles: string[];
  };
  
  // 人/コミュニティセクション
  personCommunity: {
    socialStyle: string;
    values: string[];
    interactionTips: string;
    optimalPlace: string;
  };

  type: string;
}

export interface FileData {
  base64: string;
  mimeType: string;
  fileName: string;
}

export interface AnalysisInput {
  text?: string;
  url?: string;
  files: FileData[];
}
