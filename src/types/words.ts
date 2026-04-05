export type DailyWord = {
  label: string;
  value: string;
};

export type DailyWordsData = {
  date: string;
  topic: string;
  words: DailyWord[];
};