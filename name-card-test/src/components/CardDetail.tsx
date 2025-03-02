import { useParams } from 'react-router-dom';

type RouteParams = {
  id: string;
}

function CardDetail() {
  const { id } = useParams() as RouteParams;

  return (
    <div>
      <h1>명함 상세 정보</h1>
      <p>명함 ID: {id}</p>
      {/* 여기에 해당 ID의 명함 상세 정보를 표시 */}
    </div>
  );
}

export default CardDetail; 