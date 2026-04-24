export type Word = {
  id: string;
  word: string;
  description: string;
  crossword_indices: number[];
  created_at: string;
};

export type Database = {
  public: {
    Tables: {
      words: {
        Row: Word;
        Insert: Omit<Word, "id" | "created_at">;
        Update: Partial<Omit<Word, "id" | "created_at">>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

export type SortColumn =
  | "word"
  | "description"
  | "crossword_indices"
  | "length";

export type SortDir = "asc" | "desc";
