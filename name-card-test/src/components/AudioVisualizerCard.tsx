import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { AudioCanvas, VisualizationOptions } from '../audio/AudioCanvas';
import '../styles/AudioVisualizerCard.css';
import { AudioVisualizer } from '../audio/AudioVisualizer';
import { VisualizationType } from '../audio/AudioCanvas';

// 카드 정보 인터페이스
export interface CardInfo {
  company: string;
  name: string;
  position?: string;
  email: string;
  phone: string;
  address: string;
  website?: string;
  logoUrl?: string;
}

// 컴포넌트 프롭스 인터페이스
export interface AudioVisualizerCardProps {
  cardInfo: CardInfo;
  width?: string;
  height?: string;
  cardStyle?: 'light' | 'dark';
  visualizerOptions?: Partial<VisualizationOptions>;
  audioFile?: File | null;
  showVisualizer?: boolean;
  onVisualizerTypeChange?: (type: 'circular' | 'bar' | 'line' | 'neonClock') => void;
  visualizerType?: 'circular' | 'bar' | 'line' | 'neonClock';
  defaultExpanded?: boolean;
  className?: string;
  isDarkMode?: boolean;
}

const AudioVisualizerCard: React.FC<AudioVisualizerCardProps> = ({
  cardInfo,
  width = '500px',
  height = '300px',
  cardStyle = 'dark',
  visualizerOptions = {},
  audioFile = null,
  showVisualizer = true,
  onVisualizerTypeChange,
  visualizerType: externalVisualizerType,
  defaultExpanded = false,
  className = '',
  isDarkMode = false,
}) => {
  // 상태 및 참조 설정
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const audioCanvasRef = useRef<AudioCanvas | null>(null);
  const audioSourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const startTimeRef = useRef<number>(0);
  const resizeTimeoutRef = useRef<number | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioLoaded, setAudioLoaded] = useState(false);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const [visualizationType, setVisualizationType] = useState<'circular' | 'bar' | 'line' | 'neonClock'>(
    externalVisualizerType || (visualizerOptions.type as any) || 'circular'
  );
  const [effectsEnabled, setEffectsEnabled] = useState({
    particles: visualizerOptions.particleEffect || false,
    glow: visualizerOptions.glowIntensity ? visualizerOptions.glowIntensity > 0 : false,
    pulse: visualizerOptions.pulseSpeed ? visualizerOptions.pulseSpeed > 0 : true,
  });
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [volume, setVolume] = useState(1.0);
  const [canvasReady, setCanvasReady] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // 외부에서 visualizerType이 변경되면 내부 상태도 업데이트
  useEffect(() => {
    if (externalVisualizerType && externalVisualizerType !== visualizationType) {
      setVisualizationType(externalVisualizerType);
    }
  }, [externalVisualizerType, visualizationType]);

  // 캔버스 크기 재조정 함수
  const adjustCanvasResolution = useCallback(() => {
    const canvas = canvasRef.current;
    const container = canvasContainerRef.current;
    if (!canvas || !container) return;
    
    // 고해상도 디스플레이 지원
    const dpr = window.devicePixelRatio || 1;
    
    // 컨테이너 크기 가져오기
    const rect = container.getBoundingClientRect();
    
    // 캔버스 크기 설정 (컨테이너에 맞춤)
    canvas.width = Math.floor(rect.width * dpr);
    canvas.height = Math.floor(rect.height * dpr);
    
    // 캔버스 스타일 크기 설정 (컨테이너에 맞춤)
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;
    
    // 컨텍스트 가져오기
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // 컨텍스트 스케일 조정 (고해상도 디스플레이 지원)
    ctx.scale(dpr, dpr);
    
    // 캔버스를 표시
    setCanvasReady(true);
    
    // AudioCanvas 인스턴스가 있으면 크기 업데이트
    if (audioCanvasRef.current) {
      requestAnimationFrame(() => {
        audioCanvasRef.current?.updateCanvasSize();
      });
    }
  }, []);

  // 리사이즈 핸들러
  const handleResize = useCallback(() => {
    if (resizeTimeoutRef.current) {
      cancelAnimationFrame(resizeTimeoutRef.current);
    }
    
    resizeTimeoutRef.current = requestAnimationFrame(() => {
      adjustCanvasResolution();
    });
  }, [adjustCanvasResolution]);

  // 카드 크기 변경 감지 및 캔버스 크기 조정
  useEffect(() => {
    if (!canvasContainerRef.current || !cardRef.current) return;
    
    // ResizeObserver 설정 (카드 크기 변경 감지)
    const resizeObserver = new ResizeObserver(() => {
      handleResize();
    });
    
    // 카드와 컨테이너 모두 관찰
    resizeObserver.observe(cardRef.current);
    resizeObserver.observe(canvasContainerRef.current);
    
    // 초기 캔버스 설정
    adjustCanvasResolution();
    
    // 이벤트 리스너 등록 (창 크기 변경 감지)
    window.addEventListener('resize', handleResize);
    
    // isExpanded 상태가 변경될 때 캔버스 크기 재조정 (0.3초 뒤 - 트랜지션 완료 후)
    if (isExpanded !== undefined) {
      const timeoutId = setTimeout(() => {
        handleResize();
      }, 300);
      
      return () => {
        clearTimeout(timeoutId);
      };
    }
    
    // 정리 함수
    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', handleResize);
      if (resizeTimeoutRef.current) {
        cancelAnimationFrame(resizeTimeoutRef.current);
      }
    };
  }, [isExpanded, adjustCanvasResolution, handleResize]);

  // 오디오 컨텍스트 초기화
  useEffect(() => {
    let audioContext: AudioContext | null = null;
    let analyser: AnalyserNode | null = null;
    let cleanupFunction: (() => void) | null = null;

    const setupAudioVisualizer = async () => {
      try {
        if (!canvasRef.current || !audioRef.current) return;
        
        // 오디오 컨텍스트 초기화
        audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        analyser = audioContext.createAnalyser();
        
        // FFT 크기 설정 (더 높은 해상도를 위해 값 증가)
        analyser.fftSize = 2048;
        
        // 오디오 요소의 소스 노드 생성
        const source = audioContext.createMediaElementSource(audioRef.current);
        
        // 볼륨 컨트롤을 위한 게인 노드 생성
        const gainNode = audioContext.createGain();
        gainNode.gain.value = volume;
        
        // 노드 연결: 소스 -> 게인 -> 분석기 -> 출력
        source.connect(gainNode);
        gainNode.connect(analyser);
        analyser.connect(audioContext.destination);
        
        // 캔버스 크기 설정 - 고해상도를 위한 적절한 크기 계산
        if (canvasContainerRef.current) {
          const containerRect = canvasContainerRef.current.getBoundingClientRect();
          const dpr = window.devicePixelRatio || 1;
          
          canvasRef.current.width = Math.floor(containerRect.width * dpr);
          canvasRef.current.height = Math.floor(containerRect.height * dpr);
          
          // CSS 크기 설정 (실제 표시 크기)
          canvasRef.current.style.width = `${containerRect.width}px`;
          canvasRef.current.style.height = `${containerRect.height}px`;
        }
        
        // 시각화 객체 초기화 (원형 유지 옵션 활성화)
        audioCanvasRef.current = new AudioCanvas(canvasRef.current.id, {
          ...visualizerOptions,
          type: visualizationType,
          particleEffect: effectsEnabled.particles,
          glowIntensity: effectsEnabled.glow ? 0.7 : 0,
          pulseSpeed: effectsEnabled.pulse ? 5 : 0,
          maintainAspectRatio: true // 원형 비율 유지
        });
        
        // 시각화 시작
        audioCanvasRef.current.start();
        
        // 클린업 함수 저장
        cleanupFunction = () => {
          if (audioCanvasRef.current) {
            audioCanvasRef.current.stop();
            audioCanvasRef.current = null;
          }
          
          if (audioContext) {
            if (audioContext.state !== 'closed') {
              audioContext.close();
            }
            audioContext = null;
            analyser = null;
          }
        };
        
        // 로딩 완료
        setLoading(false);
      } catch (error) {
        console.error('오디오 시각화 초기화 오류:', error);
        setLoading(false);
      }
    };

    // 오디오 소스가 있고 플레이중인 경우에만 시각화 초기화
    if (audioFile && isPlaying) {
      setLoading(true);
      // 이미 진행 중인 시각화가 있으면 정리
      if (cleanupFunction) {
        cleanupFunction();
        cleanupFunction = null;
      }
      
      // 새 시각화 설정
      setupAudioVisualizer();
    }

    // 컴포넌트 언마운트 시 정리
    return () => {
      if (cleanupFunction) {
        cleanupFunction();
      }
      
      // 리사이즈 옵저버 정리
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
        resizeObserverRef.current = null;
      }
      
      // 타임아웃 정리
      if (resizeTimeoutRef.current) {
        window.clearTimeout(resizeTimeoutRef.current);
        resizeTimeoutRef.current = null;
      }
    };
  }, [audioFile, isPlaying, visualizationType, volume, visualizerOptions, effectsEnabled]);

  // 리사이즈 옵저버 설정
  useEffect(() => {
    if (!canvasContainerRef.current || !canvasRef.current) return;
    
    const updateCanvasSize = () => {
      if (!canvasRef.current || !canvasContainerRef.current || !audioCanvasRef.current) return;
      
      // 캔버스 컨테이너의 현재 크기 가져오기
      const containerRect = canvasContainerRef.current.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      
      // 캔버스 크기 조정
      const newWidth = Math.floor(containerRect.width * dpr);
      const newHeight = Math.floor(containerRect.height * dpr);
      
      // 실제 크기가 변경된 경우에만 업데이트
      if (canvasRef.current.width !== newWidth || canvasRef.current.height !== newHeight) {
        // 캔버스 물리적 크기 설정
        canvasRef.current.width = newWidth;
        canvasRef.current.height = newHeight;
        
        // CSS 크기 설정
        canvasRef.current.style.width = `${containerRect.width}px`;
        canvasRef.current.style.height = `${containerRect.height}px`;
        
        // 시각화 객체에 크기 변경 알림
        if (audioCanvasRef.current.updateCanvasSize) {
          audioCanvasRef.current.updateCanvasSize();
        }
      }
    };
    
    // 디바운스된 리사이즈 핸들러
    const handleResize = () => {
      // 이전 타임아웃 취소
      if (resizeTimeoutRef.current) {
        window.clearTimeout(resizeTimeoutRef.current);
      }
      
      // 리사이즈 중 캔버스 투명도 감소 (깜빡임 줄이기)
      if (canvasRef.current) {
        canvasRef.current.style.opacity = '0.3';
      }
      
      // 디바운스 타임아웃 설정 (100ms)
      resizeTimeoutRef.current = window.setTimeout(() => {
        updateCanvasSize();
        
        // 업데이트 완료 후 캔버스 투명도 복원
        if (canvasRef.current) {
          canvasRef.current.style.opacity = '1';
        }
      }, 100);
    };
    
    // ResizeObserver 설정
    resizeObserverRef.current = new ResizeObserver(handleResize);
    resizeObserverRef.current.observe(canvasContainerRef.current);
    
    // 초기 크기 설정
    updateCanvasSize();
    
    return () => {
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
      }
    };
  }, [isExpanded]);

  // 시각화 유형 변경 처리
  useEffect(() => {
    if (audioCanvasRef.current && visualizationType) {
      audioCanvasRef.current.setVisualizationType(visualizationType);
    }
  }, [visualizationType]);

  // 볼륨 변경 처리
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  // 오디오 소스 변경 처리
  useEffect(() => {
    // 오디오 소스가 변경되면 재생 상태 초기화
    setIsPlaying(false);
    
    if (audioRef.current && audioFile) {
      audioRef.current.src = URL.createObjectURL(audioFile);
      audioRef.current.load();
    }
  }, [audioFile]);

  // 오디오 재생/일시정지 토글
  const togglePlay = () => {
    if (!audioRef.current || !audioFile) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      // 모바일 디바이스에서 재생을 위한 오디오 컨텍스트 활성화
      if (window.AudioContext) {
        const tempContext = new AudioContext();
        tempContext.resume().then(() => {
          tempContext.close();
        });
      }
      
      audioRef.current.play().catch(err => {
        console.error('오디오 재생 오류:', err);
      });
    }
    
    setIsPlaying(!isPlaying);
  };

  // 파일 선택 처리
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      
      // 파일이 오디오인지 확인
      if (!file.type.startsWith('audio/')) {
        alert('오디오 파일을 선택해주세요.');
        return;
      }
      
      // 부모에게 파일 전달
      if (onFileSelect) {
        onFileSelect(file);
      }
    }
  };

  // 카드 확대/축소 토글
  const toggleExpand = () => {
    // 확대/축소 전 캔버스 상태 유지
    if (canvasRef.current) {
      // 렌더링 최적화를 위한 설정
      canvasRef.current.style.willChange = 'transform, opacity';
      canvasRef.current.style.transform = 'translateZ(0)';
    }
    
    // 상태 변경
    setIsExpanded(prev => !prev);
    
    // 확대/축소 애니메이션과 동시에 처리 (더 부드러운 전환)
    requestAnimationFrame(() => {
      // 0.3초 후 (transition 완료 후) 크기 재조정
      setTimeout(() => {
        adjustCanvasResolution();
      }, 300);
    });
  };

  // 카드 클래스 계산
  const cardClassNames = useMemo(() => {
    return [
      'audio-visualizer-card',
      isExpanded ? 'expanded' : '',
      isDarkMode ? 'dark-mode' : 'light-mode',
      className
    ].filter(Boolean).join(' ');
  }, [isExpanded, isDarkMode, className]);

  return (
    <div className={cardClassNames}>
      {/* 확장 모드용 오버레이 배경 */}
      {isExpanded && <div className="overlay-backdrop" onClick={toggleExpand} />}
      
      <div className={`card-content ${isExpanded ? 'expanded' : ''}`}>
        {/* 카드 헤더 - 상단 왼쪽에 회사 및 개인 정보 배치 */}
        <div className="card-header">
          <div className="company-info">
            <h2 className="company-name">{cardInfo.company}</h2>
            <h3 className="person-name">{cardInfo.name}</h3>
            {cardInfo.position && <p className="position">{cardInfo.position}</p>}
          </div>
        </div>
        
        {/* 캔버스 컨테이너 */}
        <div 
          ref={canvasContainerRef} 
          className="canvas-container"
        >
          <canvas 
            ref={canvasRef} 
            className="visualizer-canvas"
          />
        </div>
        
        {/* 카드 오버레이 (컨트롤) */}
        <div className="card-overlay">
          {loading ? (
            <div className="loading-indicator">로딩 중...</div>
          ) : (
            <>
              {/* 컨트롤 버튼 */}
              <div className="controls-container">
                <button
                  className={`control-button play-button ${isPlaying ? 'playing' : ''}`}
                  onClick={togglePlay}
                  disabled={!audioFile}
                  title={isPlaying ? "일시정지" : "재생"}
                >
                  {isPlaying ? "❚❚" : "▶"}
                </button>
                
                <label className="control-button upload-button" title="오디오 업로드">
                  <input
                    type="file"
                    accept="audio/*"
                    onChange={handleFileSelect}
                    className="file-input"
                  />
                  <span>🔊</span>
                </label>
                
                <button
                  className="control-button expand-button"
                  onClick={toggleExpand}
                  title={isExpanded ? "축소" : "확장"}
                >
                  {isExpanded ? "↙" : "↗"}
                </button>
              </div>
              
              {/* 볼륨 컨트롤 */}
              <div className="volume-control">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={volume}
                  onChange={(e) => setVolume(parseFloat(e.target.value))}
                  className="volume-slider"
                  title={`볼륨: ${Math.round(volume * 100)}%`}
                />
              </div>
            </>
          )}
        </div>
        
        {/* 카드 푸터 - 하단 오른쪽에 연락처 정보 배치 */}
        <div className="card-footer">
          <div className="contact-info">
            <p className="email">{cardInfo.email}</p>
            <p className="phone">{cardInfo.phone}</p>
            <p className="address">{cardInfo.address}</p>
            {cardInfo.website && <p className="website">{cardInfo.website}</p>}
          </div>
        </div>
      </div>
      
      {/* 오디오 요소 */}
      <audio ref={audioRef} style={{ display: 'none' }} />
    </div>
  );
};

export default AudioVisualizerCard; 