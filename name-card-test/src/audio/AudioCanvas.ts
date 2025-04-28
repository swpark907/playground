export interface VisualizationOptions {
  type?: 'circular' | 'bar' | 'line' | 'neonClock'; // 시각화 유형 (neonClock 추가)
  lineWidth?: number;     // 선 두께
  lineColor?: string;     // 선 색상
  fillCircle?: boolean;   // 원형 채우기 여부
  startColor?: string;    // 그라데이션 시작 색상
  endColor?: string;      // 그라데이션 끝 색상
  rotationSpeed?: number; // 회전 속도
  minHeight?: number;     // 최소 높이 비율
  frequencyRange?: number; // 주파수 응답 범위
  pulseSpeed?: number;    // 맥박 효과 속도 (0-10)
  particleEffect?: boolean; // 파티클 효과 활성화 여부
  glowIntensity?: number; // 빛 효과 강도 (0-1)
  currentTime?: number;   // 현재 재생 시간 (초)
  totalDuration?: number; // 총 재생 시간 (초)
  maintainAspectRatio?: boolean; // 원형 시각화에서 가로세로 비율 유지
}

/**
 * 시각화 포인트 인터페이스
 * 원형 시각화에 사용되는 점의 좌표와 각도 정보를 담고 있음
 */
interface Point {
  x: number;
  y: number;
  angle: number;
}

// 기본 시각화 옵션
export const defaultVisualizationOptions: VisualizationOptions = {
  type: 'circular',
  lineWidth: 2,
  lineColor: 'rgba(255, 255, 255, 0.8)',
  fillCircle: true,
  startColor: 'rgba(255, 0, 128, 0.7)',
  endColor: 'rgba(0, 128, 255, 0.7)',
  rotationSpeed: 0.5,
  minHeight: 0.05,
  frequencyRange: 1.0,
  pulseSpeed: 5,
  particleEffect: false,
  glowIntensity: 0.5,
};

export class AudioCanvas {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private audioData: Uint8Array | null = null;
  public options: VisualizationOptions;
  private animationId: number | null = null;
  private running: boolean = false;
  private radiusFactor: number = 1.0; // 반지름 크기 조절 계수
  private particles: Array<{x: number, y: number, size: number, speed: number, life: number, color: string}> = [];
  private lastPulseTime: number = 0;
  private animationFrameId: number | null = null;
  private outerPoints: Point[] = [];
  private innerPoints: Point[] = [];
  private dynamicRadius: number = 0;

  /**
   * AudioCanvas 생성자
   * @param canvasId Canvas 요소의 ID
   * @param options 시각화 옵션
   */
  constructor(canvasId: string, options: Partial<VisualizationOptions> = {}) {
    const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
    if (!canvas) {
      throw new Error(`Canvas 요소를 찾을 수 없습니다: ${canvasId}`);
    }
    
    this.canvas = canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Canvas 2D 컨텍스트를 생성할 수 없습니다.');
    }
    
    this.ctx = ctx;
    this.options = { ...defaultVisualizationOptions, ...options };
    
    // 파티클 초기화
    this.setupParticles();
  }

  /**
   * 오디오 데이터 설정
   * @param data 오디오 주파수 데이터
   */
  public setAudioData(data: Uint8Array): void {
    this.audioData = data;
  }

  /**
   * 시각화 시작
   */
  public start(): void {
    if (this.running) return;
    
    this.running = true;
    this.animationId = requestAnimationFrame(this.update.bind(this));
  }

  /**
   * 시각화 중지
   */
  public stop(): void {
    this.running = false;
    
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  /**
   * 파티클 설정 초기화
   */
  private setupParticles(): void {
    if (!this.options.particleEffect) return;
    this.particles = [];
    
    // 초기 파티클 생성
    for (let i = 0; i < 20; i++) {
      this.addParticle(
        Math.random() * this.canvas.width, 
        Math.random() * this.canvas.height
      );
    }
  }

  /**
   * 새 파티클 추가
   */
  private addParticle(x: number, y: number): void {
    if (!this.options.particleEffect) return;
    
    const colors = ['rgba(255,255,255,0.7)', 'rgba(173,216,230,0.7)', 'rgba(255,182,193,0.7)'];
    
    this.particles.push({
      x,
      y,
      size: Math.random() * 3 + 1,
      speed: Math.random() * 3 + 1,
      life: Math.random() * 100 + 100,
      color: colors[Math.floor(Math.random() * colors.length)]
    });
  }

  /**
   * 파티클 상태 업데이트
   */
  private updateParticles(): void {
    if (!this.options.particleEffect) return;
    
    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      // 파티클 움직임 업데이트
      p.y -= p.speed;
      p.life--;
      
      // 생명주기가 끝나면 파티클 제거
      if (p.life <= 0) {
        this.particles.splice(i, 1);
        i--;
      }
    }
    
    // 랜덤하게 새 파티클 추가
    if (Math.random() < 0.1 && this.audioData && this.audioData.length > 0) {
      const angle = Math.random() * Math.PI * 2;
      const radius = this.canvas.height / 4 * Math.random() + this.canvas.height / 4;
      const x = this.canvas.width / 2 + Math.cos(angle) * radius;
      const y = this.canvas.height / 2 + Math.sin(angle) * radius;
      this.addParticle(x, y);
    }
  }

  /**
   * 파티클 그리기
   */
  private drawParticles(): void {
    if (!this.options.particleEffect) return;
    
    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      const opacity = p.life / 200; // 시간이 지날수록 투명해짐
      
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      this.ctx.fillStyle = p.color.replace(')', `,${opacity})`);
      this.ctx.fill();
    }
  }

  /**
   * 맥박 효과 업데이트
   */
  private updatePulseEffect(timestamp: number): void {
    if (!this.options.pulseSpeed) return;
    
    const pulseInterval = 1000 / this.options.pulseSpeed;
    if (timestamp - this.lastPulseTime > pulseInterval) {
      this.lastPulseTime = timestamp;
      
      // 맥박 효과를 위해 반지름을 일시적으로 키움
      if (this.radiusFactor < 1.05) {
        this.radiusFactor += 0.01;
      } else {
        this.radiusFactor = 1;
      }
    } else {
      // 서서히 정상 크기로 돌아감
      if (this.radiusFactor > 1) {
        this.radiusFactor *= 0.99;
      }
    }
  }

  /**
   * 업데이트 함수 (애니메이션 프레임마다 호출)
   */
  public update(timestamp: number): void {
    if (!this.canvas || !this.ctx) return;
    
    // 캔버스 크기 변경 감지
    const { width, height } = this.canvas;
    if (width !== this.canvas.width || height !== this.canvas.height) {
      this.updateCanvasSize();
    }
    
    // 캔버스 초기화 (전체 지우기)
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // 이펙트 업데이트
    this.updateParticles();
    this.updatePulseEffect(timestamp);
    
    // 중앙에 시각화 그리기 (변환 행렬 저장)
    this.ctx.save();
    
    // 캔버스 중앙 기준으로 그리기
    const dpr = window.devicePixelRatio || 1;
    const centerX = this.canvas.width / (2 * dpr);
    const centerY = this.canvas.height / (2 * dpr);
    
    // 선택된 시각화 유형에 따라 그리기
    switch (this.options.type) {
      case 'circular':
        this.drawCircularVisualization();
        break;
      case 'bar':
        this.drawBarVisualization();
        break;
      case 'line':
        this.drawLineVisualization();
        break;
      case 'neonClock':
        this.drawNeonClockVisualization();
        break;
      default:
        this.drawCircularVisualization();
    }
    
    // 파티클 그리기
    this.drawParticles();
    
    // 변환 행렬 복원
    this.ctx.restore();
    
    // 다음 프레임 요청 (깜빡임 방지를 위해 사용자 화면 주사율에 맞춤)
    if (this.running) {
      this.animationId = window.requestAnimationFrame(this.update.bind(this));
    }
  }

  /**
   * 원형 시각화 그리기
   */
  private drawCircularVisualization(): void {
    const { width, height } = this.ctx.canvas;
    const centerX = width / 2;
    const centerY = height / 2;
    
    // 항상 원형을 유지하기 위해 최소 차원에 맞춰 반지름 결정
    let radius;
    if (this.options.maintainAspectRatio) {
      radius = Math.min(width, height) * 0.4; // 40%로 고정
    } else {
      radius = (width + height) * 0.2; // 기존 방식
    }
    
    // 디바이스 픽셀 비율 고려
    const dpr = window.devicePixelRatio || 1;
    radius = radius / dpr;
    
    // 오디오 데이터가 없는 경우 기본 원 그리기
    if (!this.audioData || !this.audioData.length) {
      this.ctx.beginPath();
      this.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
      this.ctx.lineWidth = 3;
      this.ctx.stroke();
      return;
    }
    
    // 회전 오프셋 (부드러운 회전 효과)
    const rotationOffset = this.options.rotationSpeed 
      ? (performance.now() / 1000) * this.options.rotationSpeed 
      : 0;
    
    // 전체 오디오 데이터에서 평균 진폭 계산
    let totalAmplitude = 0;
    let lowFreqAmplitude = 0;
    let midFreqAmplitude = 0;
    let highFreqAmplitude = 0;
    
    // 주파수 범위 나누기 (저, 중, 고)
    const lowFreqEnd = Math.floor(this.audioData.length * 0.1); // 저주파 영역 (0-10%)
    const midFreqEnd = Math.floor(this.audioData.length * 0.5); // 중주파 영역 (10-50%)
    // 나머지는 고주파 (50-100%)
    
    // 각 주파수 범위별 평균 진폭 계산
    let lowCount = 0, midCount = 0, highCount = 0;
    
    for (let i = 0; i < this.audioData.length; i++) {
      const value = this.audioData[i] / 255.0;
      
      totalAmplitude += value;
      
      if (i < lowFreqEnd) {
        lowFreqAmplitude += value;
        lowCount++;
      } else if (i < midFreqEnd) {
        midFreqAmplitude += value;
        midCount++;
      } else {
        highFreqAmplitude += value;
        highCount++;
      }
    }
    
    // 평균 진폭 계산
    totalAmplitude /= this.audioData.length;
    lowFreqAmplitude = lowCount > 0 ? lowFreqAmplitude / lowCount : 0;
    midFreqAmplitude = midCount > 0 ? midFreqAmplitude / midCount : 0;
    highFreqAmplitude = highCount > 0 ? highFreqAmplitude / highCount : 0;
    
    // 저주파는 기본 반지름에 영향을 미치지만 과도한 변화 제한
    const basePulse = lowFreqAmplitude * (this.options.frequencyRange || 1.0) * 0.7;
    // 최대 크기 제한 추가 (30% 이상 커지지 않도록)
    const limitedBasePulse = Math.min(basePulse, 0.3);
    const dynamicRadius = radius * (1 + limitedBasePulse);
    
    // 시간에 따른 값 (더 자연스러운 움직임을 위한 값)
    const time = performance.now() / 1000;
    
    // 부드러운 곡선을 위한 점 배열 (외부 테두리)
    const outerPoints: [number, number][] = [];
    // 내부 테두리용 점 배열 (이중 테두리 효과를 위해)
    const innerPoints: [number, number][] = [];
    
    // 데이터 포인트 계산 및 스무딩
    const numSamples = 360; // 360도에 맞게 샘플 수 조정
    for (let i = 0; i < numSamples; i++) {
      const angle = (i / numSamples) * Math.PI * 2 + rotationOffset;
      
      // 주파수에 따른 변화량 (0-360도를 주파수 범위에 맵핑)
      const frequencyIndex = Math.floor((i / numSamples) * this.audioData.length);
      let frequencyValue = 0;
      
      if (frequencyIndex < this.audioData.length) {
        frequencyValue = this.audioData[frequencyIndex] / 255.0;
      }
      
      // 주파수 영향력 조정 (각 지점의 파동 진폭 강화)
      frequencyValue *= 0.7;
      
      // 중주파와 고주파를 사용하여 파동 효과 강화
      const waveEffect = midFreqAmplitude * 0.4 * Math.sin(i * 0.2 + time * 2) + 
                        highFreqAmplitude * 0.35 * Math.sin(i * 0.4 + time * 3);
      
      // 외부 테두리 반지름
      const outerRadius = dynamicRadius * (1 + waveEffect + frequencyValue * 0.8);
      // 내부 테두리 반지름 (더 작게)
      const innerRadius = dynamicRadius * 0.92 * (1 + waveEffect * 0.7 + frequencyValue * 0.6);
      
      // 좌표 계산 (외부)
      const outerX = centerX + Math.cos(angle) * outerRadius;
      const outerY = centerY + Math.sin(angle) * outerRadius;
      
      // 좌표 계산 (내부)
      const innerX = centerX + Math.cos(angle) * innerRadius;
      const innerY = centerY + Math.sin(angle) * innerRadius;
      
      outerPoints.push([outerX, outerY]);
      innerPoints.push([innerX, innerY]);
    }
    
    // 배경 오버레이 그리기 (중앙 부분을 반투명하게)
    this.ctx.beginPath();
    this.ctx.arc(centerX, centerY, dynamicRadius * 0.85, 0, Math.PI * 2);
    
    // 중앙 영역 반투명 그라데이션
    const centerGradient = this.ctx.createRadialGradient(
      centerX, centerY, 0,
      centerX, centerY, dynamicRadius * 0.85
    );
    
    centerGradient.addColorStop(0, 'rgba(10, 10, 20, 0.1)'); // 중앙 거의 투명
    centerGradient.addColorStop(0.7, 'rgba(10, 10, 20, 0.2)'); // 약간 어두운 배경
    centerGradient.addColorStop(1, 'rgba(10, 10, 20, 0.3)'); // 테두리 근처 약간 더 진한 배경
    
    this.ctx.fillStyle = centerGradient;
    this.ctx.fill();
    
    // 글로우 효과 설정 (테두리에 집중)
    this.ctx.save();
    
    // 오디오 볼륨에 따라 글로우 강도 증가
    const glowIntensity = (this.options.glowIntensity || 0.5) + totalAmplitude * 0.5;
    this.ctx.shadowBlur = 15 * glowIntensity;
    this.ctx.shadowColor = 'rgba(255, 255, 255, 0.8)';
    
    // 외부 테두리 그리기
    this.ctx.beginPath();
    this.ctx.moveTo(outerPoints[0][0], outerPoints[0][1]);
    
    for (let i = 0; i < outerPoints.length; i++) {
      const current = outerPoints[i];
      const next = outerPoints[(i + 1) % outerPoints.length];
      const next2 = outerPoints[(i + 2) % outerPoints.length];
      
      const cp1x = (current[0] + next[0]) / 2;
      const cp1y = (current[1] + next[1]) / 2;
      
      const cp2x = (next[0] + next2[0]) / 2;
      const cp2y = (next[1] + next2[1]) / 2;
      
      this.ctx.quadraticCurveTo(current[0], current[1], cp1x, cp1y);
    }
    
    this.ctx.closePath();
    
    // 주파수 데이터에 따라 선 색상 변경
    const hue1 = (time * 10) % 360; // 시간에 따라 색상 변화
    const hue2 = (hue1 + 60 + totalAmplitude * 120) % 360; // 오디오에 따라 색상 변화
    
    // 테두리 색상 설정 (진폭에 따라 색상과 두께 변화)
    const lineWidth = 3 + totalAmplitude * 5; // 볼륨에 따라 선 두께 2-8px
    this.ctx.lineWidth = lineWidth;
    
    // 선형 그라데이션 생성
    const lineGradient = this.ctx.createLinearGradient(
      centerX - dynamicRadius, centerY - dynamicRadius,
      centerX + dynamicRadius, centerY + dynamicRadius
    );
    
    lineGradient.addColorStop(0, `hsla(${hue1}, 100%, 60%, 0.8)`);
    lineGradient.addColorStop(0.5, `hsla(${(hue1 + 30) % 360}, 100%, 70%, 0.9)`);
    lineGradient.addColorStop(1, `hsla(${hue2}, 100%, 60%, 0.8)`);
    
    this.ctx.strokeStyle = lineGradient;
    this.ctx.stroke();
    
    // 내부 테두리 그리기 (더 얇고, 다른 색상)
    this.ctx.beginPath();
    this.ctx.moveTo(innerPoints[0][0], innerPoints[0][1]);
    
    for (let i = 0; i < innerPoints.length; i++) {
      const current = innerPoints[i];
      const next = innerPoints[(i + 1) % innerPoints.length];
      const next2 = innerPoints[(i + 2) % innerPoints.length];
      
      const cp1x = (current[0] + next[0]) / 2;
      const cp1y = (current[1] + next[1]) / 2;
      
      const cp2x = (next[0] + next2[0]) / 2;
      const cp2y = (next[1] + next2[1]) / 2;
      
      this.ctx.quadraticCurveTo(current[0], current[1], cp1x, cp1y);
    }
    
    this.ctx.closePath();
    
    // 내부 테두리 색상 (외부와 반대 색상)
    const innerLineGradient = this.ctx.createLinearGradient(
      centerX - dynamicRadius, centerY - dynamicRadius,
      centerX + dynamicRadius, centerY + dynamicRadius
    );
    
    innerLineGradient.addColorStop(0, `hsla(${hue2}, 100%, 70%, 0.7)`);
    innerLineGradient.addColorStop(0.5, `hsla(${(hue2 + 30) % 360}, 100%, 80%, 0.8)`);
    innerLineGradient.addColorStop(1, `hsla(${hue1}, 100%, 70%, 0.7)`);
    
    this.ctx.lineWidth = lineWidth * 0.6; // 내부 선은 더 얇게
    this.ctx.strokeStyle = innerLineGradient;
    this.ctx.stroke();
    
    // 원형 선 사이의 그라데이션 영역 (선택적)
    if (this.options.fillCircle) {
      // 외부와 내부 테두리 사이의 영역만 채우기
      this.ctx.globalCompositeOperation = 'source-atop';
      
      const ringGradient = this.ctx.createRadialGradient(
        centerX, centerY, dynamicRadius * 0.9,
        centerX, centerY, dynamicRadius * 1.1
      );
      
      // 미묘한 그라데이션 효과
      const intensity = 0.4 + totalAmplitude * 0.2;
      ringGradient.addColorStop(0, `hsla(${hue1}, 100%, 50%, ${intensity * 0.3})`);
      ringGradient.addColorStop(0.5, `hsla(${(hue1 + hue2) / 2 % 360}, 100%, 60%, ${intensity * 0.1})`);
      ringGradient.addColorStop(1, `hsla(${hue2}, 100%, 50%, ${intensity * 0.3})`);
      
      this.ctx.fillStyle = ringGradient;
      
      // 두 테두리 사이 영역 채우기
      this.ctx.beginPath();
      // 외부 테두리
      for (let i = 0; i < outerPoints.length; i++) {
        const current = outerPoints[i];
        const next = outerPoints[(i + 1) % outerPoints.length];
        const cp = [(current[0] + next[0]) / 2, (current[1] + next[1]) / 2];
        if (i === 0) this.ctx.moveTo(current[0], current[1]);
        else this.ctx.quadraticCurveTo(current[0], current[1], cp[0], cp[1]);
      }
      
      // 내부 테두리 (반대 방향)
      for (let i = innerPoints.length - 1; i >= 0; i--) {
        const current = innerPoints[i];
        const next = innerPoints[(i - 1 + innerPoints.length) % innerPoints.length];
        const cp = [(current[0] + next[0]) / 2, (current[1] + next[1]) / 2];
        if (i === innerPoints.length - 1) this.ctx.lineTo(current[0], current[1]);
        else this.ctx.quadraticCurveTo(current[0], current[1], cp[0], cp[1]);
      }
      
      this.ctx.closePath();
      this.ctx.fill();
      
      // 합성 모드 복원
      this.ctx.globalCompositeOperation = 'source-over';
    }
    
    this.ctx.restore();
  }

  /**
   * 막대 그래프 시각화 그리기
   */
  private drawBarVisualization(): void {
    if (!this.audioData || !this.audioData.length) return;
    
    const barWidth = 5;
    const barSpacing = 2;
    const barCount = Math.floor(this.canvas.width / (barWidth + barSpacing));
    const barHeightMultiplier = this.canvas.height * 0.8;
    
    for (let i = 0; i < barCount; i++) {
      // 데이터 인덱스 계산
      const dataIndex = Math.floor((i / barCount) * this.audioData.length);
      
      // 안전하게 오디오 데이터 접근
      let value = 0;
      if (dataIndex < this.audioData.length) {
        value = this.audioData[dataIndex] / 255.0;
        // NaN 및 무한 값 방지
        if (isNaN(value) || !isFinite(value)) {
          value = 0;
        }
      }
      
      // 높이 및 좌표 계산
      const barHeight = value * barHeightMultiplier;
      const x = i * (barWidth + barSpacing);
      const y = this.canvas.height - barHeight;
      
      // 막대 그리기
      this.ctx.fillStyle = this.options.lineColor || 'rgba(255, 255, 255, 0.8)';
      this.ctx.fillRect(x, y, barWidth, barHeight);
    }
  }

  /**
   * 선 그래프 시각화 그리기
   */
  private drawLineVisualization(): void {
    if (!this.audioData || !this.audioData.length) return;
    
    const width = this.canvas.width;
    const height = this.canvas.height;
    const center = height / 2;
    const step = width / this.audioData.length;
    
    this.ctx.beginPath();
    this.ctx.moveTo(0, center);
    
    for (let i = 0; i < this.audioData.length; i++) {
      // 안전하게 오디오 데이터 접근
      let value = 0;
      if (i < this.audioData.length) {
        value = this.audioData[i] / 255.0;
        // NaN 및 무한 값 방지
        if (isNaN(value) || !isFinite(value)) {
          value = 0;
        }
      }
      
      // 높이 및 좌표 계산
      const y = center - (value * center);
      const x = i * step;
      
      this.ctx.lineTo(x, y);
    }
    
    this.ctx.strokeStyle = this.options.lineColor || 'rgba(255, 255, 255, 0.8)';
    this.ctx.lineWidth = this.options.lineWidth || 2;
    this.ctx.stroke();
  }

  /**
   * 시간을 mm:ss 형식으로 포맷팅
   */
  private formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  /**
   * 네온 클락 시각화 그리기 (원형+막대 조합)
   */
  private drawNeonClockVisualization(): void {
    const centerX = this.canvas.width / 2;
    const centerY = this.canvas.height / 2;
    const outerRadius = Math.min(this.canvas.width, this.canvas.height) * 0.45;
    const innerRadius = outerRadius * 0.6; // 내부 흰색 원의 크기
    
    // 기본 배경 (검은색)
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // 1. 외부 원 그리기 (네온 효과 적용)
    this.ctx.save();
    
    // 네온 글로우 효과
    const glowIntensity = this.options.glowIntensity || 0.7;
    this.ctx.shadowBlur = 20 * glowIntensity;
    this.ctx.shadowColor = 'rgba(255, 255, 255, 0.8)';
    
    this.ctx.beginPath();
    this.ctx.arc(centerX, centerY, outerRadius, 0, Math.PI * 2);
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
    this.ctx.lineWidth = 2;
    this.ctx.stroke();
    
    this.ctx.restore();
    
    // 2. 오디오 데이터에 따른 막대형 시각화
    if (this.audioData && this.audioData.length > 0) {
      const barCount = 100; // 막대 개수
      const angleStep = (Math.PI * 2) / barCount;
      const barWidth = 3; // 막대 두께
      
      // 주파수 범위 별 색상 정의 (저, 중, 고음역대)
      const lowColor = 'hsl(240, 100%, 65%)'; // 파란색 계열
      const midColor = 'hsl(195, 100%, 65%)'; // 하늘색 계열
      const highColor = 'hsl(280, 100%, 65%)'; // 보라색 계열
      
      // 밝은 네온 효과를 위한 글로우
      this.ctx.save();
      this.ctx.shadowBlur = 15;
      this.ctx.lineCap = 'round';
      
      for (let i = 0; i < barCount; i++) {
        const angle = i * angleStep;
        
        // 주파수 데이터 인덱스 계산
        const dataIndex = Math.floor((i / barCount) * this.audioData.length);
        let value = 0;
        
        if (dataIndex < this.audioData.length) {
          value = this.audioData[dataIndex] / 255.0;
        }
        
        // 음역대에 따른 색상 결정
        let barColor;
        if (i < barCount * 0.33) {
          barColor = lowColor;
          this.ctx.shadowColor = 'rgba(0, 50, 255, 0.8)';
        } else if (i < barCount * 0.66) {
          barColor = midColor;
          this.ctx.shadowColor = 'rgba(0, 200, 255, 0.8)';
        } else {
          barColor = highColor;
          this.ctx.shadowColor = 'rgba(150, 0, 255, 0.8)';
        }
        
        // 막대 높이 계산 (최소 높이 적용)
        const minHeight = outerRadius * 0.05;
        const heightRange = outerRadius - innerRadius - 10; // 10px 간격 유지
        const barHeight = minHeight + (value * heightRange);
        
        // 내부 -> 외부 방향으로 막대 그리기
        const innerX = centerX + Math.cos(angle) * innerRadius;
        const innerY = centerY + Math.sin(angle) * innerRadius;
        
        const outerX = centerX + Math.cos(angle) * (innerRadius + barHeight);
        const outerY = centerY + Math.sin(angle) * (innerRadius + barHeight);
        
        this.ctx.beginPath();
        this.ctx.moveTo(innerX, innerY);
        this.ctx.lineTo(outerX, outerY);
        this.ctx.strokeStyle = barColor;
        this.ctx.lineWidth = barWidth;
        this.ctx.stroke();
      }
      
      this.ctx.restore();
    }
    
    // 3. 내부 원 그리기 (시간 표시)
    this.ctx.save();
    
    // 내부 원 배경 (약간 투명한 검은색)
    this.ctx.beginPath();
    this.ctx.arc(centerX, centerY, innerRadius, 0, Math.PI * 2);
    this.ctx.fillStyle = 'rgba(20, 20, 25, 0.7)';
    this.ctx.fill();
    
    // 내부 원 테두리 (흰색)
    this.ctx.beginPath();
    this.ctx.arc(centerX, centerY, innerRadius, 0, Math.PI * 2);
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
    this.ctx.lineWidth = 2;
    this.ctx.stroke();
    
    // 4. 진행도 타이머 효과 그리기
    if (this.options.currentTime !== undefined && this.options.totalDuration) {
      // 진행률 계산 (0-1 사이 값)
      const progress = Math.min(this.options.currentTime / this.options.totalDuration, 1);
      
      if (progress > 0) {
        // 12시 방향부터 시계방향으로 호 그리기
        this.ctx.beginPath();
        // -PI/2는 12시 방향 (시작점)
        this.ctx.arc(centerX, centerY, innerRadius, -Math.PI / 2, -Math.PI / 2 + (Math.PI * 2 * progress));
        
        // 진행도에 따른 그라데이션 색상
        let progressColor;
        if (progress < 0.33) {
          progressColor = 'rgba(0, 150, 255, 0.7)'; // 파란색
        } else if (progress < 0.66) {
          progressColor = 'rgba(0, 255, 200, 0.7)'; // 청록색
        } else {
          progressColor = 'rgba(180, 100, 255, 0.7)'; // 보라색
        }
        
        this.ctx.strokeStyle = progressColor;
        this.ctx.lineWidth = 4;
        this.ctx.stroke();
      }
    }
    
    // 5. 시간 텍스트 표시
    let timeText = '00:00';
    if (this.options.currentTime !== undefined) {
      timeText = this.formatTime(this.options.currentTime);
    }
    
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    this.ctx.font = 'bold 32px sans-serif';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText(timeText, centerX, centerY);
    
    this.ctx.restore();
  }

  /**
   * 캔버스 크기를 업데이트하는 메소드
   * 화면 크기가 변경될 때 캔버스 크기와 관련 값들을 재설정
   */
  public updateCanvasSize(): void {
    if (!this.canvas) return;
    
    // 현재 컨텍스트 상태 저장
    const ctx = this.ctx;
    if (!ctx) return;
    
    // 디바이스 픽셀 비율 가져오기
    const dpr = window.devicePixelRatio || 1;
    
    // 캔버스 요소의 크기 가져오기
    const rect = this.canvas.getBoundingClientRect();
    
    // 캔버스 물리적 크기 설정 (고해상도)
    this.canvas.width = Math.floor(rect.width * dpr);
    this.canvas.height = Math.floor(rect.height * dpr);
    
    // 컨텍스트 스케일 조정 (고해상도)
    ctx.scale(dpr, dpr);
    
    // 시각화 관련 파라미터 재계산
    this.calculateVisualizationParameters();
  }
  
  /**
   * 시각화 관련 파라미터들을 계산하는 메소드
   * 캔버스 크기 변경 시 호출됨
   */
  private calculateVisualizationParameters(): void {
    // 원형 시각화를 위한 중심점 재계산 (항상 캔버스 정중앙)
    const dpr = window.devicePixelRatio || 1;
    const centerX = this.canvas.width / (2 * dpr);
    const centerY = this.canvas.height / (2 * dpr);
    
    // 항상 원형을 유지하기 위해 최소 차원 사용
    const minDim = Math.min(this.canvas.width, this.canvas.height) / dpr;
    this.dynamicRadius = minDim * 0.4; // 최소 차원의 40%를 기본 반경으로
    
    // 원형 시각화를 위한 내부/외부 포인트 초기화
    this.outerPoints = [];
    this.innerPoints = [];
    
    // 원형 시각화 포인트 생성 (정밀도 향상)
    const numPoints = 180; // 더 많은 포인트로 부드러움 향상
    for (let i = 0; i < numPoints; i++) {
      const angle = (i / numPoints) * Math.PI * 2;
      this.outerPoints.push({
        x: centerX + Math.cos(angle) * this.dynamicRadius,
        y: centerY + Math.sin(angle) * this.dynamicRadius,
        angle
      });
      this.innerPoints.push({
        x: centerX + Math.cos(angle) * (this.dynamicRadius * 0.9),
        y: centerY + Math.sin(angle) * (this.dynamicRadius * 0.9),
        angle
      });
    }
    
    // 파티클 효과가 활성화된 경우 파티클 위치 재조정
    if (this.options.particleEffect) {
      this.particles = this.particles.map(particle => {
        // 중심에서 파티클까지의 방향은 유지하되 새 캔버스 크기에 맞게 위치 조정
        const angle = Math.atan2(particle.y - centerY, particle.x - centerX);
        const dist = Math.random() * this.dynamicRadius;
        return {
          ...particle,
          x: centerX + Math.cos(angle) * dist,
          y: centerY + Math.sin(angle) * dist
        };
      });
    }
  }
} 