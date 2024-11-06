export interface ContentRating {
  rating: string;
  descriptors: string[];
  restrictions: string[];
  categories: {
    violence: 'none' | 'mild' | 'moderate' | 'intense';
    language: 'none' | 'mild' | 'moderate' | 'frequent';
    gambling: 'none' | 'simulated' | 'real';
    socialInteraction: 'none' | 'moderated' | 'unmoderated';
  };
}

export interface AgeRating {
  ESRB?: string;
  PEGI?: string;
  USK?: string;
  CERO?: string;
  minimumAge: number;
}