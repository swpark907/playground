import { AudioVisualizer } from './AudioVisualizer';

/**
 * 시각화 모드를 정의하는 열거형
 */
export enum VisualizationMode {
  BAR_SPECTRUM = 'barSpectrum',    // 막대 형태의 주파수 스펙트럼
  WAVEFORM = 'waveform',           // 파형 그래프
  CIRCULAR = 'circular',           // 원형 시각화
}

/**
 * 시각화 스타일 옵션을 정의하는 인터페이스
 */
export interface VisualizationOptions {
  mode?: VisualizationMode;       // 시각화 모드
  barWidth?: number;              // BAR_SPECTRUM 모드에서 막대 너비
  barSpacing?: number;            // BAR_SPECTRUM 모드에서 막대 간격
  barColor?: string | CanvasGradient | CanvasPattern;  // 막대 색상
  lineColor?: string | CanvasGradient | CanvasPattern; // 선 색상
  lineWidth?: number;             // 선 두께
  backgroundColor?: string;       // 배경 색상
  useGradient?: boolean;          // 그라데이션 사용 여부
  responsive?: boolean;           // 반응형 Canvas 여부
  colorPalette?: string[];        // 색상 팔레트
  pulseEffect?: boolean;          // 펄스 효과 사용 여부
  rotationSpeed?: number;         // 회전 속도 (0~1)
  glowEffect?: boolean;           // 글로우 효과 사용 여부
  bassMultiplier?: number;        // 저주파 증폭 계수
}

/**
 * AudioVisualizer 클래스를 사용하여 Canvas에 오디오 시각화를 그리는 클래스
 */
export class AudioCanvas {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D | null = null;
  private audioVisualizer: AudioVisualizer;
  private animationId: number | null = null;
  private isActive: boolean = false;
  private options: Required<VisualizationOptions>;

  // 기본 옵션 설정
  private defaultOptions: Required<VisualizationOptions> = {
    mode: VisualizationMode.CIRCULAR,
    barWidth: 4,
    barSpacing: 1,
    barColor: '#00ff99',
    lineColor: '#ffffff',
    lineWidth: 2,
    backgroundColor: '#000000',
    useGradient: true,
    responsive: true,
    colorPalette: ['#00ff99', '#33ccff', '#ff3377', '#ffcc33', '#cc66ff'],
    pulseEffect: true,
    rotationSpeed: 0.5,
    glowEffect: true,
    bassMultiplier: 1.5
  };

  /**
   * AudioCanvas 생성자
   * @param canvas HTML Canvas 요소
   * @param audioVisualizer AudioVisualizer 인스턴스
   * @param options 시각화 옵션 (선택 사항)
   */
  constructor(
    canvas: HTMLCanvasElement,
    audioVisualizer: AudioVisualizer,
    options?: VisualizationOptions
  ) {
    this.canvas = canvas;
    this.audioVisualizer = audioVisualizer;
    
    // 옵션 병합 (사용자 옵션 + 기본 옵션)
    this.options = { ...this.defaultOptions, ...options };
    
    // Canvas 컨텍스트 가져오기
    this.ctx = this.canvas.getContext('2d');
    
    if (!this.ctx) {
      throw new Error('Canvas 컨텍스트를 가져올 수 없습니다.');
    }
    
    // 반응형 Canvas인 경우 리사이즈 이벤트 리스너 등록
    if (this.options.responsive) {
      this.setupResponsiveCanvas();
    }
    
    // Canvas 초기화
    this.initCanvas();
  }

  /**
   * Canvas 초기화 함수
   * - Canvas 크기 설정
   * - 배경색 설정
   */
  private initCanvas(): void {
    if (!this.ctx) return;
    
    // Canvas가 화면상의 실제 크기와 일치하도록 설정
    if (this.options.responsive) {
      const displayWidth = this.canvas.clientWidth;
      const displayHeight = this.canvas.clientHeight;
      
      // 현재 Canvas 크기가 표시 크기와 다른 경우에만 업데이트
      if (this.canvas.width !== displayWidth || this.canvas.height !== displayHeight) {
        this.canvas.width = displayWidth;
        this.canvas.height = displayHeight;
      }
    }
    
    // 배경색 설정
    this.ctx.fillStyle = this.options.backgroundColor;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  /**
   * 반응형 Canvas 설정
   * - 윈도우 리사이즈 이벤트에 반응하여 Canvas 크기 조정
   */
  private setupResponsiveCanvas(): void {
    // 디바운스 타이머를 위한 변수
    let resizeTimer: number | null = null;
    
    // 리사이즈 이벤트 핸들러
    const handleResize = () => {
      // 이전 타이머 제거 (디바운싱)
      if (resizeTimer) {
        window.clearTimeout(resizeTimer);
      }
      
      // 새 타이머 설정 (200ms 후에 실행)
      resizeTimer = window.setTimeout(() => {
        this.initCanvas();
        if (this.isActive) {
          // 이미 시각화가 활성화된 경우, 캔버스 사이즈 변경 후 한 번 그리기
          this.drawVisualization();
        }
      }, 200);
    };
    
    // 리사이즈 이벤트 리스너 등록
    window.addEventListener('resize', handleResize);
  }

  /**
   * 그라데이션 색상 생성
   * @param ctx Canvas 컨텍스트
   * @param frequencyOrAmplitude 주파수 또는 진폭 값 (0-255)
   * @returns Canvas 그라데이션 객체
   */
  private createGradient(ctx: CanvasRenderingContext2D, frequencyOrAmplitude: number): CanvasGradient {
    // 값의 강도에 따라 색상이 변하는 그라데이션 생성
    const value = frequencyOrAmplitude / 255; // 0~1 사이 값으로 정규화
    const height = this.canvas.height;
    
    const gradient = ctx.createLinearGradient(0, height, 0, 0);
    
    // 낮은 값은 파란색, 중간 값은 초록색, 높은 값은 빨간색으로 설정
    gradient.addColorStop(0, `hsl(240, ${Math.min(100, 50 + value * 50)}%, ${Math.min(80, 30 + value * 50)}%)`);
    gradient.addColorStop(0.5, `hsl(120, ${Math.min(100, 50 + value * 50)}%, ${Math.min(80, 40 + value * 40)}%)`);
    gradient.addColorStop(1, `hsl(${Math.max(0, 60 - value * 60)}, ${Math.min(100, 70 + value * 30)}%, ${Math.min(80, 50 + value * 30)}%)`);
    
    return gradient;
  }

  /**
   * 시각화 시작
   * - 애니메이션 프레임을 사용하여 지속적인 시각화 수행
   */
  public start(): void {
    if (this.isActive) return; // 이미 실행 중이면 중복 실행 방지
    
    this.isActive = true;
    
    // 애니메이션 프레임 요청 시작
    const animate = () => {
      this.drawVisualization();
      
      // 다음 프레임 요청 (브라우저가 적절한 시간에 함수 호출)
      if (this.isActive) {
        this.animationId = requestAnimationFrame(animate);
      }
    };
    
    // 첫 애니메이션 프레임 요청
    this.animationId = requestAnimationFrame(animate);
  }

  /**
   * 시각화 정지
   * - 애니메이션 프레임 요청 취소
   */
  public stop(): void {
    this.isActive = false;
    
    // 애니메이션 프레임 요청 취소
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  /**
   * 시각화 옵션 업데이트
   * @param options 새로운 시각화 옵션
   */
  public updateOptions(options: VisualizationOptions): void {
    this.options = { ...this.options, ...options };
    
    // 옵션 변경 후 Canvas 초기화
    this.initCanvas();
    
    // 활성화 상태면 바로 적용
    if (this.isActive) {
      this.drawVisualization();
    }
  }

  /**
   * 선택된 모드에 따라 적절한 시각화 방법 호출
   */
  private drawVisualization(): void {
    if (!this.ctx) return;
    
    // Canvas 초기화 (이전 프레임 지우기)
    this.initCanvas();
    
    // 선택된 모드에 따라 적절한 그리기 함수 호출
    switch (this.options.mode) {
      case VisualizationMode.BAR_SPECTRUM:
        this.drawBarSpectrum();
        break;
      case VisualizationMode.WAVEFORM:
        this.drawWaveform();
        break;
      case VisualizationMode.CIRCULAR:
        this.drawCircular();
        break;
      default:
        this.drawBarSpectrum(); // 기본값: 막대 스펙트럼
    }
  }

  /**
   * 막대 형태의 주파수 스펙트럼 그리기
   * - 주파수별로 막대 높이가 변화하는 시각화
   */
  private drawBarSpectrum(): void {
    if (!this.ctx) return;
    
    // 주파수 데이터 가져오기
    const frequencyData = this.audioVisualizer.getFrequencyData();
    const bufferLength = this.audioVisualizer.getBufferLength();
    
    // 데이터가 없으면 리턴
    if (frequencyData.length === 0 || bufferLength === 0) {
      console.warn('주파수 데이터가 없습니다.');
      return;
    }
    
    // Canvas 초기화
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.fillStyle = this.options.backgroundColor;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    const width = this.canvas.width;
    const height = this.canvas.height;
    
    // 하나의 막대 너비 + 간격 계산
    const barWidth = this.options.barWidth;
    const barSpacing = this.options.barSpacing;
    const totalBarWidth = barWidth + barSpacing;
    
    // 화면에 표시할 막대 수 계산 (Canvas 너비에 맞게)
    const barsToShow = Math.min(bufferLength, Math.floor(width / totalBarWidth));
    
    // 데이터 단계 계산 (주파수 데이터를 줄여서 사용)
    const step = Math.ceil(bufferLength / barsToShow);
    
    // X 좌표 시작점 (중앙 정렬)
    let x = (width - (barsToShow * totalBarWidth)) / 2;
    
    // 각 주파수 막대 그리기
    for (let i = 0; i < barsToShow; i++) {
      // 해당 주파수 인덱스
      const dataIndex = Math.min(i * step, frequencyData.length - 1);
      
      // 해당 주파수의 볼륨 (0-255)
      const value = frequencyData[dataIndex];
      
      // 볼륨에 비례하는 막대 높이 계산 (최소 높이 1픽셀)
      const barHeight = Math.max(1, (value / 255) * height);
      
      // 그라데이션 사용 여부에 따라 색상 설정
      if (this.options.useGradient) {
        this.ctx.fillStyle = this.createGradient(this.ctx, value);
      } else {
        this.ctx.fillStyle = this.options.barColor;
      }
      
      // 막대 그리기 (아래에서부터 위로)
      this.ctx.fillRect(x, height - barHeight, barWidth, barHeight);
      
      // 다음 막대 위치로 이동
      x += totalBarWidth;
    }
  }

  /**
   * 파형 그래프 그리기
   * - 시간 도메인 데이터를 사용한 파형 시각화
   */
  private drawWaveform(): void {
    if (!this.ctx) return;
    
    // 시간 도메인 데이터 가져오기 (파형 데이터)
    const timeData = this.audioVisualizer.getTimeData();
    const bufferLength = this.audioVisualizer.getBufferLength();
    
    const width = this.canvas.width;
    const height = this.canvas.height;
    const center = height / 2; // 중앙선 위치
    
    // 경로 그리기 시작
    this.ctx.beginPath();
    
    // 선 스타일 설정
    this.ctx.lineWidth = this.options.lineWidth;
    this.ctx.strokeStyle = this.options.lineColor;
    
    // 슬라이스 너비 계산 (전체 데이터를 Canvas 너비에 맞게 조정)
    const sliceWidth = width / bufferLength;
    
    // 파형 그리기
    for (let i = 0; i < bufferLength; i++) {
      // 데이터 값 (0-255)을 -1에서 1 사이로 정규화
      const value = (timeData[i] / 128.0) - 1.0;
      
      // Y 좌표 계산 (값이 -1에서 1 사이이므로 중앙에서 위아래로 움직임)
      const y = center + (value * center);
      
      // X 좌표 계산
      const x = i * sliceWidth;
      
      // 첫 점이면 이동, 아니면 선 연결
      if (i === 0) {
        this.ctx.moveTo(x, y);
      } else {
        this.ctx.lineTo(x, y);
      }
    }
    
    // 실제로 선 그리기
    this.ctx.stroke();
  }

  /**
   * 원형 시각화 그리기
   * - NCS 스타일의 원형 오디오 스펙트럼 시각화
   */
  private drawCircular(): void {
    if (!this.ctx) return;
    
    // 주파수 데이터 가져오기
    const frequencyData = this.audioVisualizer.getFrequencyData();
    const bufferLength = this.audioVisualizer.getBufferLength();
    
    const width = this.canvas.width;
    const height = this.canvas.height;
    
    // 중심점 계산
    const centerX = width / 2;
    const centerY = height / 2;
    
    // 최대 반경 (Canvas의 크기에 맞춰 조정)
    const maxRadius = Math.min(width, height) * 0.4;
    
    // 배경 그리기
    this.ctx.fillStyle = this.options.backgroundColor;
    this.ctx.fillRect(0, 0, width, height);
    
    // 배경에 그라데이션 효과 추가
    if (this.options.glowEffect) {
      const bgGradient = this.ctx.createRadialGradient(
        centerX, centerY, 0,
        centerX, centerY, maxRadius * 2
      );
      bgGradient.addColorStop(0, 'rgba(0, 255, 153, 0.05)');
      bgGradient.addColorStop(0.5, 'rgba(0, 0, 0, 0)');
      bgGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
      this.ctx.fillStyle = bgGradient;
      this.ctx.fillRect(0, 0, width, height);
    }
    
    // 데이터가 없거나 유효하지 않을 경우 기본 원형만 그리기
    if (frequencyData.length === 0 || bufferLength === 0) {
      this.drawCircularBase(centerX, centerY, maxRadius);
      return;
    }

    // 회전 각도 오프셋 (천천히 회전하는 효과)
    const rotationSpeed = this.options.rotationSpeed * 0.0002;
    const rotationAngle = (Date.now() * rotationSpeed) % (Math.PI * 2);
    
    // 펄스 효과 (시간에 따라 확장/수축하는 효과)
    const pulseEffect = this.options.pulseEffect 
      ? 1 + Math.sin(Date.now() * 0.002) * 0.1
      : 1;

    // 저주파 분석을 위한 주파수 밴드 분할
    const bassFrequencies = this.getFrequencyBand(frequencyData, 0, 60);
    const bassAmplitude = this.getAverageAmplitude(bassFrequencies) * this.options.bassMultiplier;
    
    // 배경 원 그리기 
    this.drawCircularRings(centerX, centerY, maxRadius, pulseEffect, bassAmplitude);
    
    // 성능 최적화를 위한 데이터 샘플링 (360도 원을 만들기 위해 샘플 수를 360개로 설정)
    const samplesToUse = 360;
    
    // 주파수 데이터 리샘플링 (주파수 밴드를 더 고르게 분포)
    const resampledData = this.resampleFrequencyData(frequencyData, samplesToUse);
    
    // 원 하나당 각도 계산 (완전한 원을 만들기 위해 2π를 균등하게 나눔)
    const angleStep = (2 * Math.PI) / samplesToUse;
    
    // 색상 팔레트 
    const { colorPalette } = this.options;
    
    // 주파수 바 그리기
    for (let i = 0; i < samplesToUse; i++) {
      // 리샘플링된 데이터 사용
      const value = resampledData[i];
      
      // 각도 계산 (회전 효과 적용)
      const angle = (i * angleStep + rotationAngle) % (Math.PI * 2);
      
      // 색상 계산 (주파수 범위에 따라 다른 색상 사용)
      const colorIndex = Math.floor((i / samplesToUse) * colorPalette.length);
      const baseColor = colorPalette[colorIndex % colorPalette.length];
      
      // 주파수 값에 따라 반경 설정
      const minRadius = maxRadius * 0.3 * pulseEffect; // 최소 반경
      // 주파수 반응성을 향상시키기 위해 제곱 함수 사용 (낮은 값은 약하게, 높은 값은 강하게)
      const valueRadius = Math.pow(value / 255, 1.5) * (maxRadius - minRadius) * 0.8;
      const radius = minRadius + valueRadius;
      
      // 시작점과 끝점 계산
      const startX = centerX + Math.cos(angle) * minRadius;
      const startY = centerY + Math.sin(angle) * minRadius;
      const endX = centerX + Math.cos(angle) * radius;
      const endY = centerY + Math.sin(angle) * radius;
      
      // NaN 또는 Infinity 값 검사
      if (!isFinite(startX) || !isFinite(startY) || !isFinite(endX) || !isFinite(endY)) {
        continue; // 유효하지 않은 값이 있으면 이 반복을 건너뜀
      }
      
      // 그라데이션 설정
      try {
        if (this.options.useGradient) {
          const gradient = this.ctx.createLinearGradient(startX, startY, endX, endY);
          const intensity = value / 255;
          const alpha = 0.3 + intensity * 0.7; // 투명도 조절
          
          // 글로우 효과
          if (this.options.glowEffect && value > 180) {
            this.drawGlowEffect(endX, endY, value, baseColor);
          }
          
          gradient.addColorStop(0, `rgba(255, 255, 255, ${alpha * 0.5})`);
          gradient.addColorStop(1, this.adjustColorAlpha(baseColor, alpha));
          this.ctx.strokeStyle = gradient;
        } else {
          this.ctx.strokeStyle = this.options.lineColor;
        }
      } catch (error) {
        // 그라데이션 생성 실패 시 기본 색상 사용
        this.ctx.strokeStyle = this.options.lineColor;
      }
      
      // 선 두께 설정 (주파수 값과 위치에 따라 동적으로 변경)
      const positionFactor = 1 + Math.sin(angle * 5) * 0.2; // 위치에 따른 변화
      this.ctx.lineWidth = Math.max(1, ((value / 255) * 4 * positionFactor));
      
      // 선 그리기
      this.ctx.beginPath();
      this.ctx.moveTo(startX, startY);
      this.ctx.lineTo(endX, endY);
      this.ctx.stroke();
      
      // 끝점에 작은 원 그리기 (장식용)
      if (value > 120) { // 일정 값 이상일 때만 표시
        this.ctx.beginPath();
        this.ctx.fillStyle = this.adjustColorAlpha(baseColor, value / 255);
        // 값에 따라 크기 변경
        const dotSize = 1 + (value / 255) * 3;
        this.ctx.arc(endX, endY, dotSize, 0, 2 * Math.PI);
        this.ctx.fill();
      }
    }
    
    // 중앙 원 그리기 (베이스에 따라 펄싱)
    this.drawCircularCenter(centerX, centerY, maxRadius, bassAmplitude);
  }

  /**
   * 주파수 데이터를 더 고르게 리샘플링
   */
  private resampleFrequencyData(data: Uint8Array, targetLength: number): number[] {
    const result = new Array(targetLength).fill(0);
    const sourceLength = data.length;
    
    // 로그 스케일로 주파수 분포 (저주파에 더 많은 샘플 할당)
    for (let i = 0; i < targetLength; i++) {
      // 로그 스케일 인덱스 계산 (저주파를 더 세밀하게)
      const position = Math.pow(i / targetLength, 1.4) * sourceLength;
      const index = Math.min(Math.floor(position), sourceLength - 1);
      
      // 인접 샘플 간 선형 보간
      const nextIndex = Math.min(index + 1, sourceLength - 1);
      const fraction = position - index;
      
      // 선형 보간 적용
      result[i] = data[index] * (1 - fraction) + data[nextIndex] * fraction;
      
      // 양쪽 끝 부분에서 값 감소 (자연스러운 연결을 위해)
      const edgeFade = Math.min(i, targetLength - i) / (targetLength * 0.1);
      const fadeMultiplier = Math.min(1, edgeFade);
      result[i] *= fadeMultiplier;
    }
    
    // 결과 스무딩 (급격한 변화 방지)
    return this.smoothArray(result, 3);
  }
  
  /**
   * 배열 값 스무딩 (이동 평균)
   */
  private smoothArray(array: number[], windowSize: number): number[] {
    const result = [...array];
    const halfWindow = Math.floor(windowSize / 2);
    
    for (let i = 0; i < array.length; i++) {
      let sum = 0;
      let count = 0;
      
      for (let j = -halfWindow; j <= halfWindow; j++) {
        const index = (i + j + array.length) % array.length; // 순환 인덱스
        sum += array[index];
        count++;
      }
      
      result[i] = sum / count;
    }
    
    return result;
  }
  
  /**
   * 특정 주파수 대역 추출
   */
  private getFrequencyBand(data: Uint8Array, minFreq: number, maxFreq: number): number[] {
    // 주파수 해상도 계산 (Hz 단위)
    const sampleRate = 44100; // 표준 샘플링 레이트
    const frequencyResolution = sampleRate / (data.length * 2);
    
    // 주파수 인덱스 범위 계산
    const minIndex = Math.floor(minFreq / frequencyResolution);
    const maxIndex = Math.ceil(maxFreq / frequencyResolution);
    
    // 범위 제한
    const start = Math.max(0, minIndex);
    const end = Math.min(data.length - 1, maxIndex);
    
    // 해당 대역의 데이터 추출
    return Array.from(data.slice(start, end + 1));
  }
  
  /**
   * 평균 진폭 계산
   */
  private getAverageAmplitude(data: number[]): number {
    if (data.length === 0) return 0;
    
    const sum = data.reduce((acc, val) => acc + val, 0);
    return sum / data.length / 255; // 0-1 범위로 정규화
  }
  
  /**
   * 색상에 알파값 적용
   */
  private adjustColorAlpha(color: string, alpha: number): string {
    // 이미 rgba 형식이면 알파값만 수정
    if (color.startsWith('rgba')) {
      return color.replace(/[\d\.]+\)$/, `${alpha})`);
    }
    
    // hex 또는 rgb 형식이면 rgba로 변환
    if (color.startsWith('#')) {
      const r = parseInt(color.substring(1, 3), 16);
      const g = parseInt(color.substring(3, 5), 16);
      const b = parseInt(color.substring(5, 7), 16);
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
    
    if (color.startsWith('rgb(')) {
      return color.replace('rgb(', 'rgba(').replace(')', `, ${alpha})`);
    }
    
    return color;
  }
  
  /**
   * 글로우 효과 그리기
   */
  private drawGlowEffect(x: number, y: number, value: number, color: string): void {
    if (!this.ctx) return;
    
    const intensity = value / 255;
    const glowSize = 10 * intensity;
    
    // 글로우 효과 (외부 발광)
    const glowGradient = this.ctx.createRadialGradient(
      x, y, 0,
      x, y, glowSize
    );
    
    glowGradient.addColorStop(0, this.adjustColorAlpha(color, 0.8 * intensity));
    glowGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    
    this.ctx.save();
    this.ctx.globalCompositeOperation = 'lighter';
    this.ctx.fillStyle = glowGradient;
    this.ctx.beginPath();
    this.ctx.arc(x, y, glowSize, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.restore();
  }
  
  /**
   * 배경 원 그리기
   */
  private drawCircularRings(centerX: number, centerY: number, maxRadius: number, pulseEffect: number, bassAmplitude: number): void {
    if (!this.ctx) return;
    
    // 외부 원 그리기 (장식용)
    this.ctx.beginPath();
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    this.ctx.lineWidth = 2;
    // 베이스에 반응하는 원 크기
    const outerRadius = (maxRadius + 20) * (1 + bassAmplitude * 0.2);
    this.ctx.arc(centerX, centerY, outerRadius * pulseEffect, 0, 2 * Math.PI);
    this.ctx.stroke();

    // 내부 원 그리기 (기준선)
    this.ctx.beginPath();
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    this.ctx.lineWidth = 1;
    this.ctx.arc(centerX, centerY, maxRadius * 0.3 * pulseEffect, 0, 2 * Math.PI);
    this.ctx.stroke();
    
    // 추가 장식 원 그리기
    for (let i = 1; i <= 3; i++) {
      const radius = maxRadius * (0.3 + 0.25 * i) * pulseEffect;
      const opacity = 0.05 + (i * 0.03);
      
      this.ctx.beginPath();
      this.ctx.strokeStyle = `rgba(0, 255, 153, ${opacity})`;
      this.ctx.lineWidth = 0.5;
      this.ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
      this.ctx.stroke();
    }
  }
  
  /**
   * 원형 시각화의 중앙 원 그리기
   */
  private drawCircularCenter(centerX: number, centerY: number, maxRadius: number, bassAmplitude: number = 0): void {
    if (!this.ctx) return;
    
    // 베이스에 반응하는 원 크기
    const pulseFactor = 1 + bassAmplitude * 0.5;
    const centerCircleRadius = maxRadius * 0.15 * pulseFactor;
    
    try {
      // 중앙 발광 효과
      const centerGlow = this.ctx.createRadialGradient(
        centerX, centerY, 0,
        centerX, centerY, centerCircleRadius * 2
      );
      centerGlow.addColorStop(0, 'rgba(0, 255, 153, 0.4)');
      centerGlow.addColorStop(0.5, 'rgba(0, 255, 153, 0.1)');
      centerGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
      
      this.ctx.beginPath();
      this.ctx.fillStyle = centerGlow;
      this.ctx.arc(centerX, centerY, centerCircleRadius * 2, 0, 2 * Math.PI);
      this.ctx.fill();
      
      // 중앙 원
      this.ctx.beginPath();
      const centerGradient = this.ctx.createRadialGradient(
        centerX, centerY, 0,
        centerX, centerY, centerCircleRadius
      );
      centerGradient.addColorStop(0, 'rgba(0, 255, 153, 0.9)');
      centerGradient.addColorStop(1, 'rgba(0, 255, 153, 0.1)');
      this.ctx.fillStyle = centerGradient;
      this.ctx.arc(centerX, centerY, centerCircleRadius, 0, 2 * Math.PI);
      this.ctx.fill();
      
      // 내부 밝은 중앙점
      this.ctx.beginPath();
      this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      this.ctx.arc(centerX, centerY, centerCircleRadius * 0.2, 0, 2 * Math.PI);
      this.ctx.fill();
      
    } catch (error) {
      // 그라데이션 생성 실패 시 단색으로 대체
      this.ctx.beginPath();
      this.ctx.fillStyle = 'rgba(0, 255, 153, 0.5)';
      this.ctx.arc(centerX, centerY, centerCircleRadius, 0, 2 * Math.PI);
      this.ctx.fill();
    }
  }
  
  /**
   * 데이터가 없을 때 기본 원형 그리기
   */
  private drawCircularBase(centerX: number, centerY: number, maxRadius: number): void {
    if (!this.ctx) return;
    
    // 배경에 그라데이션 효과 추가
    if (this.options.glowEffect) {
      const bgGradient = this.ctx.createRadialGradient(
        centerX, centerY, 0,
        centerX, centerY, maxRadius * 2
      );
      bgGradient.addColorStop(0, 'rgba(0, 255, 153, 0.05)');
      bgGradient.addColorStop(0.5, 'rgba(0, 0, 0, 0)');
      bgGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
      this.ctx.fillStyle = bgGradient;
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
    
    // 외부 원 그리기
    this.ctx.beginPath();
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    this.ctx.lineWidth = 2;
    this.ctx.arc(centerX, centerY, maxRadius + 20, 0, 2 * Math.PI);
    this.ctx.stroke();
    
    // 내부 원 그리기
    this.ctx.beginPath();
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    this.ctx.lineWidth = 1;
    this.ctx.arc(centerX, centerY, maxRadius * 0.3, 0, 2 * Math.PI);
    this.ctx.stroke();
    
    // 추가 장식 원 그리기 (정적 상태)
    for (let i = 1; i <= 3; i++) {
      const radius = maxRadius * (0.3 + 0.25 * i);
      const opacity = 0.05 + (i * 0.03);
      
      this.ctx.beginPath();
      this.ctx.strokeStyle = `rgba(0, 255, 153, ${opacity})`;
      this.ctx.lineWidth = 0.5;
      this.ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
      this.ctx.stroke();
    }
    
    // 중앙 원 그리기
    this.drawCircularCenter(centerX, centerY, maxRadius);
    
    // 360도 전체에 간단한 패턴으로 장식 (더 균일하게)
    for (let i = 0; i < 36; i++) {
      const angle = (i / 36) * Math.PI * 2;
      const startX = centerX + Math.cos(angle) * (maxRadius * 0.3);
      const startY = centerY + Math.sin(angle) * (maxRadius * 0.3);
      
      // 랜덤하지만 일관된 길이의 선 (시드 기반)
      const lengthVariation = (Math.sin(i * 7.5) + 1) * 0.2; // 0.8-1.2 범위
      const endX = centerX + Math.cos(angle) * (maxRadius * 0.6 * (0.8 + lengthVariation));
      const endY = centerY + Math.sin(angle) * (maxRadius * 0.6 * (0.8 + lengthVariation));
      
      // 색상 변화 추가 (위치에 따라)
      const colorIndex = i % this.options.colorPalette.length;
      const color = this.options.colorPalette[colorIndex];
      
      this.ctx.beginPath();
      this.ctx.strokeStyle = this.adjustColorAlpha(color, 0.3);
      this.ctx.lineWidth = 1;
      this.ctx.moveTo(startX, startY);
      this.ctx.lineTo(endX, endY);
      this.ctx.stroke();
      
      // 끝에 작은 원 추가
      if (i % 3 === 0) {
        this.ctx.beginPath();
        this.ctx.fillStyle = this.adjustColorAlpha(color, 0.4);
        this.ctx.arc(endX, endY, 2, 0, 2 * Math.PI);
        this.ctx.fill();
      }
    }
  }

  /**
   * 리소스 정리 함수
   * - 애니메이션 정지 및 이벤트 리스너 제거
   */
  public destroy(): void {
    // 애니메이션 정지
    this.stop();
    
    // 이벤트 리스너 정리 등 필요한 정리 작업
    window.removeEventListener('resize', this.setupResponsiveCanvas);
  }
} 