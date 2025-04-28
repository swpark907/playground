import React, { useState, useRef, useCallback } from 'react';
import AudioVisualizerCard, { CardInfo } from './AudioVisualizerCard';
import { VisualizationOptions } from '../audio/AudioCanvas';
import '../styles/AudioCardDemo.css';

const AudioCardDemo: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [visualizerMode, setVisualizerMode] = useState<'circular' | 'bar' | 'line' | 'neonClock'>('circular');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [cardStyle, setCardStyle] = useState<'light' | 'dark'>('dark');

  // 기본 카드 정보
  const demoCardInfo: CardInfo = {
    company: 'CREATIVE SOUND',
    name: '홍길동',
    position: '음향 디자이너',
    email: 'sound@example.com',
    phone: '010-1234-5678',
    address: '서울특별시 강남구 테헤란로 123',
    website: 'www.creativesound.com',
    logoUrl: '/music-card.svg'
  };

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setFile(files[0]);
    }
  }, []);

  const handleSelectFile = useCallback(() => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, []);

  const handleVisualizerChange = useCallback((type: 'circular' | 'bar' | 'line' | 'neonClock') => {
    setVisualizerMode(type);
  }, []);

  const handleStyleChange = useCallback(() => {
    setCardStyle(prev => prev === 'dark' ? 'light' : 'dark');
  }, []);

  return (
    <div className={`audio-card-demo ${cardStyle}`}>
      <h1>음악 카드 데모</h1>
      
      <div className="demo-controls">
        <input 
          type="file" 
          ref={fileInputRef}
          onChange={handleFileChange} 
          accept="audio/*" 
          style={{ display: 'none' }}
        />
        
        <button onClick={handleSelectFile} className="file-button">
          음악 파일 선택
        </button>
        
        <button onClick={handleStyleChange} className="style-button">
          {cardStyle === 'dark' ? '라이트 모드' : '다크 모드'}
        </button>
        
        <div className="visualizer-selector">
          <p>시각화 모드:</p>
          <div className="button-group">
            <button 
              onClick={() => handleVisualizerChange('circular')}
              className={visualizerMode === 'circular' ? 'active' : ''}
            >
              원형
            </button>
            <button 
              onClick={() => handleVisualizerChange('bar')}
              className={visualizerMode === 'bar' ? 'active' : ''}
            >
              막대
            </button>
            <button 
              onClick={() => handleVisualizerChange('line')}
              className={visualizerMode === 'line' ? 'active' : ''}
            >
              선
            </button>
            <button 
              onClick={() => handleVisualizerChange('neonClock')}
              className={visualizerMode === 'neonClock' ? 'active' : ''}
            >
              네온시계
            </button>
          </div>
        </div>
      </div>
      
      <div className="card-container">
        <AudioVisualizerCard 
          cardInfo={demoCardInfo}
          audioFile={file}
          visualizerOptions={{
            type: visualizerMode as any,
            glowIntensity: 0.8,
            rotationSpeed: 0.3,
            fillCircle: true
          }}
          showVisualizer={true}
          cardStyle={cardStyle}
          onVisualizerTypeChange={handleVisualizerChange}
          visualizerType={visualizerMode}
        />
      </div>
      
      <div className="instructions">
        <h3>사용 방법</h3>
        <ul>
          <li>상단의 <strong>음악 파일 선택</strong> 버튼을 클릭하여 오디오 파일을 선택하세요.</li>
          <li>위의 <strong>시각화 모드</strong> 버튼으로 다양한 시각화 효과를 선택할 수 있습니다.</li>
          <li>카드 위에 마우스를 올리면 볼륨 조절과 효과 변경 컨트롤이 나타납니다.</li>
          <li>좌측 상단의 확장 버튼을 클릭하면 카드를 확대하여 볼 수 있습니다.</li>
          <li><strong>네온시계</strong> 모드는 음악 재생 타이머가 포함된 네온 스타일 시각화를 보여줍니다.</li>
        </ul>
      </div>
    </div>
  );
};

export default AudioCardDemo; 