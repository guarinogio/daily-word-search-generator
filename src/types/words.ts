export type DailyWord = {
  label: string;
  value: string;
};

export type DailyWordsData = {
  id: string;
  date: string;
  topic: string;
  hash: string;
  words: DailyWord[];
};
