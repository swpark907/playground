import { Link } from "react-router-dom";
import { cardData } from "../constants/cardData";
import { CATEGORY_PATH_MAP, CardCategory } from "../constants/categoryPaths";


function CardList() {
  const cards = cardData;

  return (
    <div>
      <div className="card-grid">
        {cards.map((card) => (
          <div key={card.id}>
            <Link to={CATEGORY_PATH_MAP[card.cardCategory as CardCategory]}>
              <h3>{card.name}</h3>
              <p>{card.company}</p>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}

export default CardList;
