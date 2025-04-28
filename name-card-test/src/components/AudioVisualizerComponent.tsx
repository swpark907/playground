import React, { useRef, useEffect, useState } from 'react';
import { AudioVisualizer } from '../features/AudioVisualizer';
import { AudioCanvas, VisualizationMode, VisualizationOptions } from '../features/AudioCanvas';

/**
 * 오디오 시각화 컴포넌트 Props
 */
interface AudioVisualizerComponentProps {
  width?: string | number;  // 캔버스 너비
  height?: string | number; // 캔버스 높이
  initialOptions?: VisualizationOptions; // 초기 시각화 옵션
}

/**
 * 오디오 시각화 컴포넌트
 * 파일 업로드, 재생 제어 및 시각화 모드 변경 기능을 제공합니다.
 */
const AudioVisualizerComponent: React.FC<AudioVisualizerComponentProps> = ({
  width = '100%',
  height = '400px', // 높이를 400px로 변경하여 정사각형에 가깝게 설정
  initialOptions,
}) => {
  // 참조 및 상태 관리
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [visualizer] = useState<AudioVisualizer>(() => new AudioVisualizer());
  const [audioCanvas, setAudioCanvas] = useState<AudioCanvas | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isFileLoaded, setIsFileLoaded] = useState<boolean>(false);
  const [fileName, setFileName] = useState<string>('');
  const [visualizationMode, setVisualizationMode] = useState<VisualizationMode>(
    initialOptions?.mode || VisualizationMode.CIRCULAR // 기본값을 CIRCULAR로 변경
  );
  const [isLooping, setIsLooping] = useState<boolean>(false);

  // 캔버스 초기화
  useEffect(() => {
    // Canvas 요소가 없으면 종료
    if (!canvasRef.current) return;

    // AudioCanvas 인스턴스 생성
    const newAudioCanvas = new AudioCanvas(
      canvasRef.current,
      visualizer,
      { 
        mode: VisualizationMode.CIRCULAR, // 명시적으로 원형 모드 설정
        ...initialOptions 
      }
    );

    setAudioCanvas(newAudioCanvas);
    
    // 시각화 시작 (오디오가 없어도 빈 원형 표시)
    newAudioCanvas.start();

    // 컴포넌트 언마운트 시 리소스 정리
    return () => {
      newAudioCanvas.destroy();
      visualizer.destroy();
    };
  }, [visualizer, initialOptions]);

  // 시각화 모드 변경 시 AudioCanvas 옵션 업데이트
  useEffect(() => {
    if (audioCanvas) {
      audioCanvas.updateOptions({ mode: visualizationMode });
    }
  }, [visualizationMode, audioCanvas]);

  // 컴포넌트 마운트 시 사용자 상호작용 이벤트 리스너 추가
  useEffect(() => {
    const activateAudio = () => {
      visualizer.resume();
    };
    
    // 모든 사용자 상호작용에서 AudioContext 활성화 시도
    window.addEventListener('click', activateAudio);
    window.addEventListener('touchstart', activateAudio);
    window.addEventListener('keydown', activateAudio);
    
    return () => {
      window.removeEventListener('click', activateAudio);
      window.removeEventListener('touchstart', activateAudio);
      window.removeEventListener('keydown', activateAudio);
    };
  }, [visualizer]);

  // 오디오 종료 이벤트 핸들러
  useEffect(() => {
    const handleAudioEnded = () => {
      setIsPlaying(false);
      if (isLooping) {
        // 반복 재생이 활성화되어 있으면 다시 재생
        visualizer.playAudio();
        setIsPlaying(true);
      }
    };

    window.addEventListener('audioEnded', handleAudioEnded);
    return () => {
      window.removeEventListener('audioEnded', handleAudioEnded);
    };
  }, [visualizer, isLooping]);

  // 파일 업로드 핸들러
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      // 이전에 재생 중이었다면 중지
      if (isPlaying) {
        visualizer.stopAudio();
        if (audioCanvas) {
          audioCanvas.stop();
          audioCanvas.start(); // 시각화는 계속 유지
        }
        setIsPlaying(false);
      }

      // AudioContext 상태 로깅
      console.log('AudioContext 상태 확인 중...');
      const audioContextState = visualizer.getAudioContextState?.() || '알 수 없음';
      console.log('현재 AudioContext 상태:', audioContextState);

      // AudioContext 활성화 시도
      console.log('AudioContext 활성화 시도 중...');
      try {
        await visualizer.resume();
        console.log('AudioContext 활성화 성공!');
      } catch (resumeError) {
        console.error('AudioContext 활성화 실패 상세 정보:', resumeError);
      }
      
      // 파일 정보 로깅
      console.log('로드할 파일 정보:', {
        name: file.name,
        type: file.type,
        size: `${(file.size / 1024).toFixed(2)} KB`
      });
      
      // 오디오 파일 로드
      console.log('오디오 파일 로드 시도 중...');
      await visualizer.loadAudioFile(file);
      console.log('오디오 파일 로드 성공!');
      setIsFileLoaded(true);
      setFileName(file.name);
    } catch (error) {
      console.error('오디오 파일 로드 중 오류 (상세):', error);
      
      // 자세한 오류 출력
      if (error instanceof Error) {
        console.error('오류 이름:', error.name);
        console.error('오류 메시지:', error.message);
        console.error('오류 스택:', error.stack);
        alert(`오디오 파일을 로드할 수 없습니다: ${error.name} - ${error.message}`);
      } else {
        console.error('알 수 없는 오류 형식:', error);
        alert('오디오 파일을 로드할 수 없습니다.');
      }
    }
  };

  // 재생/정지 토글 핸들러
  const togglePlayback = () => {
    if (!isFileLoaded) return;

    if (isPlaying) {
      // 재생 중이면 정지
      visualizer.stopAudio();
      setIsPlaying(false);
    } else {
      // 정지 중이면 재생
      visualizer.resume(); // 브라우저의 AudioContext 제약 해결
      visualizer.playAudio();
      setIsPlaying(true);
    }
  };

  // 시각화 모드 변경 핸들러
  const handleModeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const mode = event.target.value as VisualizationMode;
    setVisualizationMode(mode);
  };

  // 반복 재생 토글 핸들러
  const handleLoopToggle = (event: React.ChangeEvent<HTMLInputElement>) => {
    const loop = event.target.checked;
    setIsLooping(loop);
    visualizer.toggleLoop();
  };

  return (
    <div className="audio-visualizer-container">
      <div className="controls">
        <input
          type="file"
          accept="audio/*"
          onChange={handleFileUpload}
          id="audio-upload"
          className="audio-upload"
        />
        <label htmlFor="audio-upload" className="upload-btn">
          오디오 파일 선택
        </label>

        {isFileLoaded && (
          <>
            <button onClick={togglePlayback} className="playback-btn">
              {isPlaying ? '정지' : '재생'}
            </button>
            <span className="file-name">{fileName}</span>
            <div className="loop-control">
              <input
                type="checkbox"
                id="loop-toggle"
                checked={isLooping}
                onChange={handleLoopToggle}
                className="loop-checkbox"
              />
              <label htmlFor="loop-toggle" className="loop-label">
                반복 재생
              </label>
            </div>
          </>
        )}

        <select value={visualizationMode} onChange={handleModeChange} className="mode-select">
          <option value={VisualizationMode.CIRCULAR}>원형</option>
          <option value={VisualizationMode.BAR_SPECTRUM}>막대 스펙트럼</option>
          <option value={VisualizationMode.WAVEFORM}>파형</option>
        </select>
      </div>

      <div className="canvas-container" style={{ width, height }}>
        <canvas 
          ref={canvasRef} 
          style={{ width: '100%', height: '100%', background: '#000' }}
        />
      </div>
    </div>
  );
};

export default AudioVisualizerComponent; 