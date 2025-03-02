import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import CardList from "./components/CardList";
import "./App.css";
import CardDetail from "./components/CardDetail";
import AudioVisualCard from "./components/AudioVisualCard";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<CardList />} />
        <Route path="/card/:id" element={<CardDetail />} />
        <Route
          path="/audio-visual-card"
          element={
            <AudioVisualCard
              cardInfo={{
                name: "홍길동",
                title: "테크 주식회사",
                company: "테크 주식회사",
                contact: "010-1234-5678",
              }}
            />
          }
        />
        {/* <Route path="/design-card" element={<DesignCard />} />
        <Route path="/development-card" element={<DevelopmentCard />} />
        <Route path="/marketing-card" element={<MarketingCard />} />
        <Route path="/consulting-card" element={<ConsultingCard />} /> */}
      </Routes>
    </Router>
  );
}

export default App;
