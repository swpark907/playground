class DoubleExposure {
    constructor() {
        this.canvas = document.getElementById('exposureCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.topLayer = document.getElementById('topLayer');
        this.scrollHint = document.querySelector('.scroll-hint');
        this.loadingScreen = document.getElementById('loadingScreen');
        this.exposureContainer = document.querySelector('.exposure-container');
        
        this.playerImage = new Image();
        this.cityImage = new Image();
        this.playerMask = new Image();
        
        this.isDragging = false;
        this.lastY = 0;
        this.exposureProgress = 0;
        this.expansionProgress = 0; // 확장 진행도
        
        this.init();
    }
    
    init() {
        // 이미지 로드
        this.playerImage.crossOrigin = 'anonymous';
        this.cityImage.crossOrigin = 'anonymous';
        this.playerMask.crossOrigin = 'anonymous';
        
        this.playerImage.src = 'player.png';
        this.cityImage.src = 'city.jpg';
        this.playerMask.src = 'player.png'; // 마스크용
        
        // 모든 이미지가 로드되면 캔버스 설정
        Promise.all([
            this.loadImage(this.playerImage),
            this.loadImage(this.cityImage),
            this.loadImage(this.playerMask)
        ]).then(() => {
            this.setupCanvas();
            this.createDoubleExposure();
            this.setupEventListeners();
            
            // 로딩 화면 숨기기
            setTimeout(() => {
                this.loadingScreen.classList.add('fade-out');
                setTimeout(() => {
                    this.loadingScreen.style.display = 'none';
                }, 500);
            }, 1000);
        }).catch((error) => {
            console.error('이미지 로드 중 오류 발생:', error);
            this.loadingScreen.querySelector('.loading-text').textContent = '이미지 로드 중 오류가 발생했습니다.';
        });
    }
    
    loadImage(img) {
        return new Promise((resolve) => {
            img.onload = resolve;
        });
    }
    
    setupCanvas() {
        // 카드 컨테이너 크기 (500x890)
        const cardWidth = 500;
        const cardHeight = 890;
        
        // 이미지가 카드의 98% 크기로 맞춰지도록 설정 (더 크게)
        const targetWidth = cardWidth * 1.1;
        const targetHeight = cardHeight * 1.1;
        
        // 원본 이미지 비율 유지하면서 크기 조정
        const aspectRatio = this.playerImage.width / this.playerImage.height;
        let canvasWidth, canvasHeight;
        
        if (targetWidth / targetHeight > aspectRatio) {
            // 높이에 맞춰서 조정
            canvasHeight = targetHeight;
            canvasWidth = targetHeight * aspectRatio;
        } else {
            // 너비에 맞춰서 조정
            canvasWidth = targetWidth;
            canvasHeight = targetWidth / aspectRatio;
        }
        
        this.canvas.width = canvasWidth;
        this.canvas.height = canvasHeight;
        
        // 상단 레이어 이미지 크기도 동일하게 조정
        const playerImg = this.topLayer.querySelector('.player-image');
        playerImg.style.width = `${canvasWidth}px`;
        playerImg.style.height = `${canvasHeight}px`;
    }
    
    createDoubleExposure() {
        const { width, height } = this.canvas;
        
        // 캔버스 초기화
        this.ctx.clearRect(0, 0, width, height);
        
        // 임시 캔버스들 생성
        const cityCanvas = document.createElement('canvas');
        const cityCtx = cityCanvas.getContext('2d');
        cityCanvas.width = width;
        cityCanvas.height = height;
        
        const maskCanvas = document.createElement('canvas');
        const maskCtx = maskCanvas.getContext('2d');
        maskCanvas.width = width;
        maskCanvas.height = height;
        
        const resultCanvas = document.createElement('canvas');
        const resultCtx = resultCanvas.getContext('2d');
        resultCanvas.width = width;
        resultCanvas.height = height;
        
        // 1. 도시 이미지를 배경으로 그리기
        cityCtx.drawImage(this.cityImage, 0, 0, width, height);
        
        // 2. 농구선수 마스크 생성 (흑백 변환)
        maskCtx.drawImage(this.playerMask, 0, 0, width, height);
        
        // 마스크를 흑백으로 변환
        const maskImageData = maskCtx.getImageData(0, 0, width, height);
        const maskData = maskImageData.data;
        
        for (let i = 0; i < maskData.length; i += 4) {
            const r = maskData[i];
            const g = maskData[i + 1];
            const b = maskData[i + 2];
            const a = maskData[i + 3];
            
            // 알파값이 있는 부분만 마스크로 사용
            if (a > 0) {
                const gray = (r + g + b) / 3;
                maskData[i] = gray;     // R
                maskData[i + 1] = gray; // G
                maskData[i + 2] = gray; // B
                maskData[i + 3] = 255;  // A (불투명)
            } else {
                maskData[i + 3] = 0;    // A (투명)
            }
        }
        
        maskCtx.putImageData(maskImageData, 0, 0);
        
        // 3. 이중 노출 효과 생성
        // 도시 이미지를 먼저 그리기
        resultCtx.drawImage(cityCanvas, 0, 0);
        
        // 농구선수 마스크를 사용하여 도시 이미지를 마스킹
        resultCtx.globalCompositeOperation = 'destination-in';
        resultCtx.drawImage(maskCanvas, 0, 0);
        
        // 4. 추가적인 블렌딩 효과
        resultCtx.globalCompositeOperation = 'multiply';
        resultCtx.globalAlpha = 0.8;
        resultCtx.drawImage(maskCanvas, 0, 0);
        
        // 5. 최종 결과를 메인 캔버스에 그리기
        this.ctx.globalCompositeOperation = 'source-over';
        this.ctx.globalAlpha = 1.0;
        this.ctx.drawImage(resultCanvas, 0, 0);
        
        // 6. 추가적인 색상 조정
        this.ctx.globalCompositeOperation = 'overlay';
        this.ctx.globalAlpha = 0.3;
        this.ctx.drawImage(maskCanvas, 0, 0);
        
        // 원래 상태로 복원
        this.ctx.globalCompositeOperation = 'source-over';
        this.ctx.globalAlpha = 1.0;
    }
    
    setupEventListeners() {
        // 스크롤 이벤트
        window.addEventListener('scroll', (e) => {
            this.handleScroll();
        });
        
        // 마우스 드래그 이벤트
        document.addEventListener('mousedown', (e) => {
            this.isDragging = true;
            this.lastY = e.clientY;
        });
        
        document.addEventListener('mousemove', (e) => {
            if (this.isDragging) {
                const deltaY = e.clientY - this.lastY;
                this.updateExposure(deltaY * 0.01);
                this.lastY = e.clientY;
            }
        });
        
        document.addEventListener('mouseup', () => {
            this.isDragging = false;
        });
        
        // 터치 이벤트 (모바일)
        document.addEventListener('touchstart', (e) => {
            this.isDragging = true;
            this.lastY = e.touches[0].clientY;
        });
        
        document.addEventListener('touchmove', (e) => {
            if (this.isDragging) {
                const deltaY = e.touches[0].clientY - this.lastY;
                this.updateExposure(deltaY * 0.005);
                this.lastY = e.touches[0].clientY;
                e.preventDefault();
            }
        });
        
        document.addEventListener('touchend', () => {
            this.isDragging = false;
        });
        
        // 윈도우 리사이즈 이벤트
        window.addEventListener('resize', () => {
            this.setupCanvas();
            this.createDoubleExposure();
        });
    }
    
    handleScroll() {
        const scrollY = window.scrollY;
        const maxScroll = window.innerHeight;
        const exposureProgress = Math.min(scrollY / maxScroll, 1);
        
        // 이중 노출 효과가 완료된 후 확장 효과 시작
        if (exposureProgress >= 1) {
            const extraScroll = scrollY - maxScroll;
            const expansionMaxScroll = window.innerHeight * 0.5; // 추가 스크롤 범위
            this.expansionProgress = Math.min(extraScroll / expansionMaxScroll, 1);
            console.log('Extra scroll:', extraScroll, 'Expansion progress:', this.expansionProgress); // 디버깅용
        } else {
            this.expansionProgress = 0;
        }
        
        this.updateExposure(exposureProgress - this.exposureProgress);
        this.updateExpansion();
    }
    
    updateExposure(delta) {
        this.exposureProgress = Math.max(0, Math.min(1, this.exposureProgress + delta));
        
        // 상단 레이어 높이 조절 (위에서부터 줄어듦)
        const remainingHeight = 1 - this.exposureProgress;
        this.topLayer.style.clipPath = `inset(0 0 ${this.exposureProgress * 100}% 0)`;
        
        // 캔버스는 항상 보이도록 설정
        this.canvas.style.opacity = 1;
        
        // 스크롤 힌트 업데이트
        if (this.exposureProgress > 0.1) {
            this.scrollHint.classList.add('fade-out');
        } else {
            this.scrollHint.classList.remove('fade-out');
        }
        
        // 확장 효과 힌트
        if (this.expansionProgress > 0.1) {
            this.scrollHint.querySelector('.hint-text').textContent = '계속 스크롤하여 카드를 확장하세요';
            this.scrollHint.classList.remove('fade-out');
        }
        
        // 추가적인 시각적 효과
        if (this.exposureProgress > 0.3) {
            const brightness = 1 + this.exposureProgress * 0.4;
            const contrast = 1 + this.exposureProgress * 0.3;
            const saturation = 1 + this.exposureProgress * 0.2;
            this.canvas.style.filter = `brightness(${brightness}) contrast(${contrast}) saturate(${saturation})`;
        } else {
            this.canvas.style.filter = 'none';
        }
        
        // 농구선수 이미지에도 효과 적용
        const playerImg = this.topLayer.querySelector('.player-image');
        if (this.exposureProgress > 0.5) {
            playerImg.style.filter = `grayscale(1) contrast(1.2) blur(${this.exposureProgress * 2}px)`;
        } else {
            playerImg.style.filter = 'grayscale(1) contrast(1.2)';
        }
    }
    
    updateExpansion() {
        if (this.expansionProgress > 0) {
            // 카드 가로 확장 (500px -> 1500px)
            const baseWidth = 500;
            const expandedWidth = 1500;
            const currentWidth = baseWidth + (expandedWidth - baseWidth) * this.expansionProgress;
            
            this.exposureContainer.style.width = `${currentWidth}px`;
            
            // 높이도 약간 조정 (890px -> 950px)
            const baseHeight = 890;
            const expandedHeight = 890;
            const currentHeight = baseHeight + (expandedHeight - baseHeight) * this.expansionProgress;
            
            this.exposureContainer.style.height = `${currentHeight}px`;
            
            // 패널들 나타나기
            const leftPanel = document.querySelector('.left-panel');
            const rightPanel = document.querySelector('.right-panel');
            
            if (leftPanel && rightPanel) {
                leftPanel.style.opacity = this.expansionProgress;
                rightPanel.style.opacity = this.expansionProgress;
            }
            
            // 이미지 크기도 확장에 맞춰 조정
            this.setupCanvas();
            this.createDoubleExposure();
            
            console.log('Expansion progress:', this.expansionProgress, 'Width:', currentWidth); // 디버깅용
        }
    }
}

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', () => {
    new DoubleExposure();
}); 