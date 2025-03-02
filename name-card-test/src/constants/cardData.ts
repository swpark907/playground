import { CardCategory } from "./categoryPaths";

export const cardData: Card[] = [
  {
    id: 1,
    name: "홍길동",
    company: "테크 주식회사",
    cardCategory: "audio-visual",
  },
];

export interface Card {
  id: number;
  name: string;
  company: string;
  cardCategory: CardCategory;
}
