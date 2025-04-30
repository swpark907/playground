// AudioVisualizer 클래스 - 오디오 시각화 담당
class AudioVisualizer {
    constructor(canvas, options = {}) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.audioContext = null;
        this.analyzer = null;
        this.audioSource = null;
        this.isPlaying = false;
        this.dataArray = null;
        this.bufferLength = 0;
        this.animationId = null;
        this.options = {
            circleRadius: canvas.width / 2 - 10,
            centerX: canvas.width / 2,
            centerY: canvas.height / 2,
            barWidth: 2,
            barGap: 1,
            barColor: '#ff00ff',
            circleColor: 'rgba(255, 0, 255, 0.2)',
            pulseSpeed: 0.05,
            ...options
        };
        
        // 원형 비율 유지
        this.maintainAspectRatio();
        
        // ResizeObserver 설정
        this.setupResizeObserver();
    }
    
    // 오디오 컨텍스트 초기화
    initAudio() {
        if (this.audioContext) return;
        
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.analyzer = this.audioContext.createAnalyser();
            this.analyzer.fftSize = 512;
            this.bufferLength = this.analyzer.frequencyBinCount;
            this.dataArray = new Uint8Array(this.bufferLength);
            this.analyzer.connect(this.audioContext.destination);
        } catch (e) {
            console.error('AudioContext 초기화 오류:', e);
            alert('브라우저가 Web Audio API를 지원하지 않습니다.');
        }
    }
    
    // 오디오 소스 설정
    setAudioSource(audioElement) {
        this.initAudio();
        
        if (this.audioSource) {
            this.audioSource.disconnect();
        }
        
        this.audioSource = this.audioContext.createMediaElementSource(audioElement);
        this.audioSource.connect(this.analyzer);
    }
    
    // 애니메이션 시작
    start() {
        if (!this.analyzer) return;
        this.isPlaying = true;
        this.animate();
    }
    
    // 애니메이션 정지
    stop() {
        this.isPlaying = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        this.clearCanvas();
    }
    
    // 캔버스 초기화
    clearCanvas() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawBaseCircle();
    }
    
    // 기본 원 그리기
    drawBaseCircle() {
        this.ctx.beginPath();
        this.ctx.arc(
            this.options.centerX,
            this.options.centerY,
            this.options.circleRadius,
            0,
            2 * Math.PI
        );
        this.ctx.strokeStyle = this.options.circleColor;
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
    }
    
    // 오디오 데이터 유효성 검사
    validateAudioData(data) {
        return data.every(val => !isNaN(val) && isFinite(val) && val >= 0);
    }
    
    // 애니메이션 루프
    animate() {
        if (!this.isPlaying) return;
        
        this.animationId = requestAnimationFrame(this.animate.bind(this));
        this.analyzer.getByteFrequencyData(this.dataArray);
        
        // 데이터 유효성 검사
        if (!this.validateAudioData(this.dataArray)) {
            console.warn('유효하지 않은 오디오 데이터가 감지되었습니다.');
            return;
        }
        
        this.clearCanvas();
        this.drawVisualization();
        this.drawGlowEffect();
    }
    
    // 오디오 시각화 그리기
    drawVisualization() {
        const { centerX, centerY, circleRadius, barWidth, barGap } = this.options;
        
        // 바의 개수 결정 (데이터 배열 길이와 가용 공간에 맞춤)
        const totalBars = Math.min(
            this.bufferLength,
            Math.floor(2 * Math.PI * circleRadius / (barWidth + barGap))
        );
        
        // 각 막대 사이의 각도 계산
        const angleStep = (2 * Math.PI) / totalBars;
        
        // 각 주파수 바를 그림
        for (let i = 0; i < totalBars; i++) {
            // 현재 바의 높이 계산 (음량에 따른 크기)
            const barHeight = (this.dataArray[i] / 255) * circleRadius * 0.5;
            
            // 현재 바의 각도 계산
            const angle = i * angleStep;
            
            // 바의 시작점 (내부)
            const x1 = centerX + (circleRadius - 5) * Math.cos(angle);
            const y1 = centerY + (circleRadius - 5) * Math.sin(angle);
            
            // 바의 끝점 (외부)
            const x2 = centerX + (circleRadius + barHeight) * Math.cos(angle);
            const y2 = centerY + (circleRadius + barHeight) * Math.sin(angle);
            
            // 그라데이션 색상 생성
            const gradient = this.ctx.createLinearGradient(x1, y1, x2, y2);
            gradient.addColorStop(0, 'rgba(255, 0, 255, 0.5)');
            gradient.addColorStop(1, 'rgba(0, 255, 255, 0.8)');
            
            // 바 그리기
            this.ctx.beginPath();
            this.ctx.moveTo(x1, y1);
            this.ctx.lineTo(x2, y2);
            this.ctx.lineWidth = barWidth;
            this.ctx.strokeStyle = gradient;
            this.ctx.stroke();
        }
    }
    
    // 글로우 효과 그리기
    drawGlowEffect() {
        const { centerX, centerY, circleRadius } = this.options;
        
        // 전체 데이터 평균 계산
        const averageVolume = Array.from(this.dataArray).reduce((a, b) => a + b, 0) / this.bufferLength;
        
        // 평균 볼륨에 따른 글로우 강도 조절
        const glowSize = (averageVolume / 255) * 20;
        
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, circleRadius, 0, 2 * Math.PI);
        this.ctx.shadowBlur = 10 + glowSize;
        this.ctx.shadowColor = '#ff00ff';
        this.ctx.strokeStyle = 'rgba(255, 0, 255, 0.8)';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
        this.ctx.shadowBlur = 0;
    }
    
    // 원형 비율 유지
    maintainAspectRatio() {
        const container = this.canvas.parentElement;
        const size = Math.min(container.offsetWidth, container.offsetHeight);
        
        this.canvas.width = size;
        this.canvas.height = size;
        
        // 옵션 업데이트
        this.options.centerX = size / 2;
        this.options.centerY = size / 2;
        this.options.circleRadius = (size / 2) - 10;
        
        this.clearCanvas();
    }
    
    // 리사이즈 옵저버 설정
    setupResizeObserver() {
        const ro = new ResizeObserver(entries => {
            for (const entry of entries) {
                if (entry.target === this.canvas.parentElement) {
                    this.maintainAspectRatio();
                }
            }
        });
        
        ro.observe(this.canvas.parentElement);
    }
}

// ParticleSystem 클래스 - 파티클 효과 담당
class ParticleSystem {
    constructor(container, audioVisualizer, options = {}) {
        this.container = container;
        this.audioVisualizer = audioVisualizer;
        this.particles = [];
        this.options = {
            particleCount: 30,
            minSize: 2,
            maxSize: 6,
            minSpeed: 0.5,
            maxSpeed: 2,
            color: '#ff00ff',
            ...options
        };
        
        this.createParticles();
        this.animationId = null;
    }
    
    // 파티클 생성
    createParticles() {
        for (let i = 0; i < this.options.particleCount; i++) {
            const particle = document.createElement('div');
            particle.classList.add('particle');
            
            // 랜덤 속성 설정
            const size = Math.random() * (this.options.maxSize - this.options.minSize) + this.options.minSize;
            const x = Math.random() * 100;
            const y = Math.random() * 100;
            const speed = Math.random() * (this.options.maxSpeed - this.options.minSpeed) + this.options.minSpeed;
            const angle = Math.random() * Math.PI * 2;
            
            // 스타일 설정
            particle.style.width = `${size}px`;
            particle.style.height = `${size}px`;
            particle.style.left = `${x}%`;
            particle.style.top = `${y}%`;
            particle.style.backgroundColor = this.options.color;
            particle.style.opacity = Math.random() * 0.5 + 0.2;
            
            // 파티클 데이터 저장
            const particleData = {
                element: particle,
                x,
                y,
                speed,
                angle,
                size
            };
            
            this.particles.push(particleData);
            this.container.appendChild(particle);
        }
    }
    
    // 파티클 애니메이션 시작
    start() {
        this.animate();
    }
    
    // 파티클 애니메이션 정지
    stop() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }
    
    // 파티클 애니메이션 루프
    animate() {
        this.animationId = requestAnimationFrame(this.animate.bind(this));
        
        // 오디오 데이터 가져오기 (없으면 기본값)
        let averageVolume = 50;
        if (this.audioVisualizer && this.audioVisualizer.dataArray) {
            // 유효성 검사 후 평균값 계산
            const validData = Array.from(this.audioVisualizer.dataArray)
                .filter(val => !isNaN(val) && isFinite(val) && val >= 0);
            
            if (validData.length > 0) {
                averageVolume = validData.reduce((a, b) => a + b, 0) / validData.length;
            }
        }
        
        // 볼륨에 따른 움직임 강도 조절
        const intensityFactor = (averageVolume / 255) * 2 + 0.5;
        
        // 각 파티클 업데이트
        this.particles.forEach(particle => {
            // 위치 업데이트
            particle.x += Math.cos(particle.angle) * particle.speed * intensityFactor;
            particle.y += Math.sin(particle.angle) * particle.speed * intensityFactor;
            
            // 화면 경계 처리
            if (particle.x < -10) particle.x = 110;
            if (particle.x > 110) particle.x = -10;
            if (particle.y < -10) particle.y = 110;
            if (particle.y > 110) particle.y = -10;
            
            // 볼륨에 따른 크기 및 투명도 변경
            const sizeChange = (averageVolume / 255) * particle.size * 0.5;
            const newSize = particle.size + sizeChange;
            const opacity = (averageVolume / 255) * 0.5 + 0.2;
            
            // 스타일 적용
            particle.element.style.left = `${particle.x}%`;
            particle.element.style.top = `${particle.y}%`;
            particle.element.style.width = `${newSize}px`;
            particle.element.style.height = `${newSize}px`;
            particle.element.style.opacity = opacity;
        });
    }
}

// AudioPlayer 클래스 - 오디오 재생 및 컨트롤 담당
class AudioPlayer {
    constructor(visualizer, particleSystem) {
        this.audio = new Audio();
        this.visualizer = visualizer;
        this.particleSystem = particleSystem;
        this.isInitialized = false;
        
        // DOM 요소
        this.playPauseBtn = document.getElementById('play-pause');
        this.volumeControl = document.getElementById('volume');
        this.audioUpload = document.getElementById('audio-upload');
        this.fileNameDisplay = document.getElementById('file-name');
        
        // 이벤트 리스너 설정
        this.setupEventListeners();
    }
    
    // 이벤트 리스너 설정
    setupEventListeners() {
        // 오디오 파일 업로드
        this.audioUpload.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            // 파일명 표시
            this.fileNameDisplay.textContent = file.name;
            
            // 이전 오디오 정지
            this.stop();
            
            // 새 오디오 설정
            const fileURL = URL.createObjectURL(file);
            this.audio.src = fileURL;
            
            // 비주얼라이저 소스 설정
            if (!this.isInitialized) {
                this.visualizer.setAudioSource(this.audio);
                this.isInitialized = true;
            }
            
            // 재생
            this.play();
        });
        
        // 재생/일시정지 버튼
        this.playPauseBtn.addEventListener('click', () => {
            if (this.audio.paused) {
                this.play();
            } else {
                this.pause();
            }
        });
        
        // 볼륨 조절
        this.volumeControl.addEventListener('input', (e) => {
            this.audio.volume = e.target.value;
        });
        
        // 오디오 종료 시 처리
        this.audio.addEventListener('ended', () => {
            this.visualizer.stop();
            this.particleSystem.stop();
            this.playPauseBtn.textContent = '재생';
        });
    }
    
    // 재생
    play() {
        if (!this.audio.src) return;
        
        // 오디오 컨텍스트 재개 (자동 재생 정책 대응)
        if (this.visualizer.audioContext.state === 'suspended') {
            this.visualizer.audioContext.resume();
        }
        
        this.audio.play().then(() => {
            this.visualizer.start();
            this.particleSystem.start();
            this.playPauseBtn.textContent = '일시정지';
        }).catch(err => {
            console.error('재생 실패:', err);
        });
    }
    
    // 일시정지
    pause() {
        this.audio.pause();
        this.visualizer.stop();
        this.particleSystem.stop();
        this.playPauseBtn.textContent = '재생';
    }
    
    // 정지
    stop() {
        this.audio.pause();
        this.audio.currentTime = 0;
        this.visualizer.stop();
        this.particleSystem.stop();
        this.playPauseBtn.textContent = '재생';
    }
}

// 애플리케이션 초기화
document.addEventListener('DOMContentLoaded', () => {
    // 캔버스 및 컨테이너 요소
    const canvas = document.getElementById('visualizer');
    const particlesContainer = document.getElementById('particles');
    
    // 오디오 시각화 초기화
    const visualizer = new AudioVisualizer(canvas, {
        barWidth: 2,
        barGap: 1,
        barColor: '#ff00ff',
        circleColor: 'rgba(255, 0, 255, 0.2)'
    });
    
    // 파티클 시스템 초기화
    const particleSystem = new ParticleSystem(particlesContainer, visualizer, {
        particleCount: 30,
        minSize: 2,
        maxSize: 6,
        color: '#ff00ff'
    });
    
    // 오디오 플레이어 초기화
    const audioPlayer = new AudioPlayer(visualizer, particleSystem);
}); 