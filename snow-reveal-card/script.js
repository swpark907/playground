class SnowRevealCard {
    constructor() {
        this.canvas = document.getElementById('snowCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.isDrawing = false;
        this.brushSize = 50;
        this.baseSnowTexture = null; // 기본 눈 텍스처 저장용
        this.lastPos = null; // 이전 마우스 위치 저장
        this.currentPos = null; // 현재 마우스 위치
        this.drawingAnimationId = null; // 그리기 애니메이션 ID
        this.snowflakesContainer = null; // 눈송이 컨테이너
        
        this.init();
    }
    
    init() {
        this.setupCanvas();
        this.createSnowTexture();
        this.setupSnowflakes();
        this.bindEvents();
    }
    
    setupCanvas() {
        const rect = this.canvas.getBoundingClientRect();
        this.canvas.width = 890;
        this.canvas.height = 510;
        
        // 고해상도 디스플레이 대응
        const dpr = window.devicePixelRatio || 1;
        this.canvas.style.width = '890px';
        this.canvas.style.height = '510px';
    }
    
    createSnowTexture() {
        // 눈 텍스처 생성
        const gradient = this.ctx.createLinearGradient(0, 0, 890, 510);
        gradient.addColorStop(0, '#f8f9fa');
        gradient.addColorStop(0.3, '#e9ecef');
        gradient.addColorStop(0.7, '#dee2e6');
        gradient.addColorStop(1, '#ced4da');
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, 890, 510);
        
        // 눈 질감 추가
        this.addSnowNoise();
        this.addSnowFlakes();
        
        // 기본 텍스처를 저장 (애니메이션에서 복원용)
        this.baseSnowTexture = this.ctx.getImageData(0, 0, 890, 510);
    }
    
    setupSnowflakes() {
        this.snowflakesContainer = document.querySelector('.snowflakes-container');
        
        // 30개의 눈송이 생성
        for (let i = 0; i < 30; i++) {
            this.createSnowflake();
        }
        
        // 주기적으로 새로운 눈송이 생성
        setInterval(() => {
            this.createSnowflake();
        }, 800);
    }
    
    createSnowflake() {
        const snowflake = document.createElement('div');
        snowflake.className = 'snowflake';
        snowflake.innerHTML = '❄';
        
        // 랜덤 위치 설정
        snowflake.style.left = Math.random() * 100 + '%';
        
        // 랜덤 크기 클래스
        const sizeClass = 'size-' + (Math.floor(Math.random() * 4) + 1);
        snowflake.classList.add(sizeClass);
        
        // 랜덤 움직임 패턴
        const driftClass = 'drift-' + (Math.floor(Math.random() * 3) + 1);
        snowflake.classList.add(driftClass);
        
        // 랜덤 지연 시간
        snowflake.style.animationDelay = Math.random() * 2 + 's';
        
        // 컨테이너에 추가
        this.snowflakesContainer.appendChild(snowflake);
        
        // 애니메이션 완료 후 제거
        const duration = parseInt(snowflake.style.animationDuration) || 10;
        setTimeout(() => {
            if (snowflake.parentNode) {
                snowflake.parentNode.removeChild(snowflake);
            }
        }, (duration + 2) * 1000);
    }
    
    addSnowNoise() {
        const imageData = this.ctx.getImageData(0, 0, 890, 510);
        const data = imageData.data;
        
        for (let i = 0; i < data.length; i += 4) {
            const noise = Math.random() * 30 - 15;
            data[i] = Math.min(255, Math.max(0, data[i] + noise));     // R
            data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise)); // G
            data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise + 5)); // B (약간 푸른빛)
        }
        
        this.ctx.putImageData(imageData, 0, 0);
    }
    
    addSnowFlakes() {
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        
        for (let i = 0; i < 200; i++) {
            const x = Math.random() * 890;
            const y = Math.random() * 510;
            const size = Math.random() * 3 + 1;
            
            this.ctx.beginPath();
            this.ctx.arc(x, y, size, 0, Math.PI * 2);
            this.ctx.fill();
        }
        
        // 더 큰 눈송이들
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        for (let i = 0; i < 50; i++) {
            const x = Math.random() * 890;
            const y = Math.random() * 510;
            const size = Math.random() * 6 + 3;
            
            this.ctx.beginPath();
            this.ctx.arc(x, y, size, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }
    
    bindEvents() {
        // 마우스 이벤트
        this.canvas.addEventListener('mousedown', (e) => this.startDrawing(e));
        this.canvas.addEventListener('mousemove', (e) => this.updateMousePos(e));
        this.canvas.addEventListener('mouseup', () => this.stopDrawing());
        this.canvas.addEventListener('mouseout', () => this.stopDrawing());
        
        // 터치 이벤트 (모바일)
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.startDrawing(e.touches[0]);
        });
        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            this.updateMousePos(e.touches[0]);
        });
        this.canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.stopDrawing();
        });
        
        // 윈도우 리사이즈 대응
        window.addEventListener('resize', () => this.handleResize());
    }
    
    getMousePos(e) {
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;
        
        return {
            x: (e.clientX - rect.left) * scaleX,
            y: (e.clientY - rect.top) * scaleY
        };
    }
    
    updateMousePos(e) {
        this.currentPos = this.getMousePos(e);
    }
    
    startDrawing(e) {
        this.isDrawing = true;
        this.currentPos = this.getMousePos(e);
        this.lastPos = this.currentPos;
        
        // 첫 번째 점 그리기
        this.drawBrush(this.currentPos.x, this.currentPos.y);
        this.baseSnowTexture = this.ctx.getImageData(0, 0, 890, 510);
        
        // 실시간 그리기 시작
        this.startDrawingAnimation();
    }
    
    startDrawingAnimation() {
        const drawFrame = () => {
            if (!this.isDrawing) return;
            
            if (this.currentPos && this.lastPos) {
                // 현재 위치와 이전 위치가 다르면 선 그리기
                const distance = Math.sqrt(
                    Math.pow(this.currentPos.x - this.lastPos.x, 2) + 
                    Math.pow(this.currentPos.y - this.lastPos.y, 2)
                );
                
                if (distance > 1) { // 1px 이상 움직였을 때만
                    this.drawLine(this.lastPos.x, this.lastPos.y, this.currentPos.x, this.currentPos.y);
                    this.lastPos = { ...this.currentPos };
                    this.baseSnowTexture = this.ctx.getImageData(0, 0, 890, 510);
                }
            }
            
            this.drawingAnimationId = requestAnimationFrame(drawFrame);
        };
        
        this.drawingAnimationId = requestAnimationFrame(drawFrame);
    }
    
    draw(e) {
        // 이 함수는 이제 사용하지 않음 - startDrawingAnimation이 대체
    }
    
    drawLine(x1, y1, x2, y2) {
        // 두 점 사이의 거리 계산
        const distance = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
        
        // 매우 촘촘한 간격 (1px 간격)
        const steps = Math.max(1, Math.ceil(distance));
        
        for (let i = 0; i <= steps; i++) {
            const t = i / steps;
            const x = x1 + (x2 - x1) * t;
            const y = y1 + (y2 - y1) * t;
            this.drawBrush(x, y);
        }
    }
    
    drawBrush(x, y) {
        // 눈 지우기 효과 - 더 부드러운 브러시를 위해 여러 레이어
        this.ctx.globalCompositeOperation = 'destination-out';
        
        // 메인 브러시
        this.ctx.globalAlpha = 0.8;
        this.ctx.beginPath();
        this.ctx.arc(x, y, this.brushSize, 0, Math.PI * 2);
        this.ctx.fill();
        
        // 부드러운 가장자리를 위한 추가 효과 (더 큰 반경, 더 투명)
        this.ctx.globalAlpha = 0.4;
        this.ctx.beginPath();
        this.ctx.arc(x, y, this.brushSize * 1.3, 0, Math.PI * 2);
        this.ctx.fill();
        
        // 가장 바깥쪽 부드러운 효과
        this.ctx.globalAlpha = 0.2;
        this.ctx.beginPath();
        this.ctx.arc(x, y, this.brushSize * 1.6, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.globalAlpha = 1;
        this.ctx.globalCompositeOperation = 'source-over';
    }
    
    addSparkleEffect(x, y) {
        // 반짝이는 효과는 일시적이므로 기본 텍스처에 저장하지 않음
        const tempImageData = this.ctx.getImageData(0, 0, 890, 510);
        
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        
        for (let i = 0; i < 5; i++) {
            const sparkleX = x + (Math.random() - 0.1) * this.brushSize;
            const sparkleY = y + (Math.random() - 0.1) * this.brushSize;
            const size = Math.random() * 2 + 1;
            
            this.ctx.beginPath();
            this.ctx.arc(sparkleX, sparkleY, size, 0, Math.PI * 2);
            this.ctx.fill();
        }
        
        // 잠시 후 반짝임 제거
        setTimeout(() => {
            this.ctx.putImageData(tempImageData, 0, 0);
            this.baseSnowTexture = tempImageData;
        }, 100);
    }
    
    stopDrawing() {
        this.isDrawing = false;
        this.lastPos = null;
        this.currentPos = null;
        
        if (this.drawingAnimationId) {
            cancelAnimationFrame(this.drawingAnimationId);
            this.drawingAnimationId = null;
        }
    }
    
    handleResize() {
        // 리사이즈 시 캔버스 재설정
        clearTimeout(this.resizeTimeout);
        this.resizeTimeout = setTimeout(() => {
            this.setupCanvas();
            this.createSnowTexture();
        }, 250);
    }
    
    // 눈 다시 덮기 (리셋 기능)
    reset() {
        this.ctx.clearRect(0, 0, 890, 510);
        this.createSnowTexture();
    }
}

// DOM 로드 완료 후 초기화
document.addEventListener('DOMContentLoaded', () => {
    const snowCard = new SnowRevealCard();
    
    // 디버그용 리셋 기능 (더블클릭)
    document.addEventListener('dblclick', () => {
        snowCard.reset();
    });
    
    // 인스트럭션 페이드아웃
    const instruction = document.querySelector('.instruction');
    let interactionStarted = false;
    
    document.addEventListener('mousedown', () => {
        if (!interactionStarted) {
            interactionStarted = true;
            instruction.style.transition = 'opacity 1s ease-out';
            instruction.style.opacity = '0.3';
        }
    });
    
    document.addEventListener('touchstart', () => {
        if (!interactionStarted) {
            interactionStarted = true;
            instruction.style.transition = 'opacity 1s ease-out';
            instruction.style.opacity = '0.3';
        }
    });
}); 