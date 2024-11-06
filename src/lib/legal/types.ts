export interface LegalDocument {
  id: string;
  type: 'terms' | 'privacy' | 'rights';
  content: string;
  version: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface LegalAcceptance {
  id: string;
  userId: string;
  documentId: string;
  version: number;
  acceptedAt: Date;
}