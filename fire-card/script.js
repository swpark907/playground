class FireCard {
    constructor() {
        this.card = document.getElementById('businessCard');
        this.fireContent = document.getElementById('fireContent');
        this.isMouseOver = false;
        this.isTouching = false;
        this.touchTimeout = null;
        this.animationId = null;
        this.currentMouseX = 0;
        this.currentMouseY = 0;
        this.targetMouseX = 0;
        this.targetMouseY = 0;
        this.smoothingFactor = 0.15;
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.startAnimationLoop();
    }
    
    setupEventListeners() {
        // 마우스 이벤트
        this.card.addEventListener('mouseenter', this.handleMouseEnter.bind(this));
        this.card.addEventListener('mouseleave', this.handleMouseLeave.bind(this));
        this.card.addEventListener('mousemove', this.handleMouseMove.bind(this));
        
        // 터치 이벤트
        this.card.addEventListener('touchstart', this.handleTouchStart.bind(this));
        this.card.addEventListener('touchmove', this.handleTouchMove.bind(this));
        this.card.addEventListener('touchend', this.handleTouchEnd.bind(this));
        
        // 터치 이벤트 기본 동작 방지
        this.card.addEventListener('touchstart', (e) => e.preventDefault());
        this.card.addEventListener('touchmove', (e) => e.preventDefault());
    }
    
    handleMouseEnter(e) {
        this.isMouseOver = true;
        this.card.classList.add('burning');
        this.updateMousePosition(e);
    }
    
    handleMouseLeave(e) {
        this.isMouseOver = false;
        this.card.classList.remove('burning');
    }
    
    handleMouseMove(e) {
        if (this.isMouseOver) {
            this.updateMousePosition(e);
        }
    }
    
    handleTouchStart(e) {
        this.isTouching = true;
        this.card.classList.add('touch-burning');
        this.updateTouchPosition(e.touches[0]);
        
        // 기존 타임아웃 클리어
        if (this.touchTimeout) {
            clearTimeout(this.touchTimeout);
        }
    }
    
    handleTouchMove(e) {
        if (this.isTouching) {
            this.updateTouchPosition(e.touches[0]);
        }
    }
    
    handleTouchEnd(e) {
        this.isTouching = false;
        
        // 2초 후에 효과 제거
        this.touchTimeout = setTimeout(() => {
            this.card.classList.remove('touch-burning');
        }, 2000);
    }
    
    updateMousePosition(e) {
        const rect = this.card.getBoundingClientRect();
        this.targetMouseX = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
        this.targetMouseY = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
    }
    
    updateTouchPosition(touch) {
        const rect = this.card.getBoundingClientRect();
        const touchX = Math.max(0, Math.min(100, ((touch.clientX - rect.left) / rect.width) * 100));
        const touchY = Math.max(0, Math.min(100, ((touch.clientY - rect.top) / rect.height) * 100));
        
        this.card.style.setProperty('--touch-x', `${touchX}%`);
        this.card.style.setProperty('--touch-y', `${touchY}%`);
    }
    
    startAnimationLoop() {
        const animate = () => {
            if (this.isMouseOver) {
                // 부드러운 마우스 추적을 위한 보간
                this.currentMouseX += (this.targetMouseX - this.currentMouseX) * this.smoothingFactor;
                this.currentMouseY += (this.targetMouseY - this.currentMouseY) * this.smoothingFactor;
                
                this.card.style.setProperty('--mouse-x', `${this.currentMouseX}%`);
                this.card.style.setProperty('--mouse-y', `${this.currentMouseY}%`);
            }
            
            this.animationId = requestAnimationFrame(animate);
        };
        
        animate();
    }
    
    // 성능 최적화를 위한 디바운스 함수
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
    
    // 메모리 정리
    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        
        if (this.touchTimeout) {
            clearTimeout(this.touchTimeout);
        }
        
        // 이벤트 리스너 제거
        this.card.removeEventListener('mouseenter', this.handleMouseEnter);
        this.card.removeEventListener('mouseleave', this.handleMouseLeave);
        this.card.removeEventListener('mousemove', this.handleMouseMove);
        this.card.removeEventListener('touchstart', this.handleTouchStart);
        this.card.removeEventListener('touchmove', this.handleTouchMove);
        this.card.removeEventListener('touchend', this.handleTouchEnd);
    }
}

// 추가 시각 효과를 위한 불꽃 파티클 시스템
class FireParticles {
    constructor() {
        this.particles = [];
        this.canvas = null;
        this.ctx = null;
        this.animationId = null;
        
        this.createCanvas();
        this.startAnimation();
    }
    
    createCanvas() {
        this.canvas = document.createElement('canvas');
        this.canvas.style.position = 'fixed';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';
        this.canvas.style.pointerEvents = 'none';
        this.canvas.style.zIndex = '0';
        this.canvas.style.opacity = '0.8';
        
        document.body.appendChild(this.canvas);
        this.ctx = this.canvas.getContext('2d');
        
        this.resizeCanvas();
        window.addEventListener('resize', this.resizeCanvas.bind(this));
        
        // 파티클 생성
        this.createParticles();
    }
    
    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }
    
    createParticles() {
        const particleCount = 40;
        
        for (let i = 0; i < particleCount; i++) {
            this.particles.push({
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
                size: Math.random() * 2.5 + 0.8, // 더 작고 뚜렷한 크기
                speedX: (Math.random() - 0.5) * 0.4,
                speedY: Math.random() * 1.2 + 0.3,
                opacity: Math.random() * 0.4 + 0.7, // 더 높은 기본 투명도
                hue: Math.random() * 40 + 0, // 0-40도 (더 빨간색 위주)
                life: Math.random() * 120 + 80,
                brightness: Math.random() * 0.3 + 0.8, // 밝기 변수 추가
                flicker: Math.random() * 0.2 + 0.1 // 깜빡임 효과
            });
        }
    }
    
    updateParticles() {
        this.particles.forEach(particle => {
            particle.x += particle.speedX;
            particle.y -= particle.speedY; // 위로 올라감
            particle.life -= 1;
            
            // 생명력에 따른 투명도 계산 (더 뚜렷하게)
            const lifeRatio = particle.life / 120;
            particle.opacity = Math.max(0.1, lifeRatio * 0.9 + 0.1);
            
            // 깜빡임 효과 추가
            particle.brightness += (Math.random() - 0.5) * particle.flicker;
            particle.brightness = Math.max(0.5, Math.min(1.2, particle.brightness));
            
            // 파티클이 죽으면 아래에서 다시 생성
            if (particle.life <= 0) {
                particle.y = window.innerHeight + 10;
                particle.x = Math.random() * window.innerWidth;
                particle.life = Math.random() * 120 + 80;
                particle.hue = Math.random() * 40 + 0;
                particle.brightness = Math.random() * 0.3 + 0.8;
                particle.flicker = Math.random() * 0.2 + 0.1;
            }
            
            // 화면 밖으로 나가면 반대편에서 다시 시작
            if (particle.x > window.innerWidth) {
                particle.x = -10;
            } else if (particle.x < -10) {
                particle.x = window.innerWidth;
            }
        });
    }
    
    drawParticles() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.particles.forEach(particle => {
            this.ctx.save();
            this.ctx.translate(particle.x, particle.y);
            this.ctx.globalAlpha = particle.opacity;
            
            // 불씨/불똥 모양 그리기 (더 뚜렷하고 선명하게)
            const coreSize = particle.size * 0.6;
            const glowSize = particle.size * 1.8;
            
            // 외부 글로우 (불똥 효과)
            const outerGlow = this.ctx.createRadialGradient(0, 0, 0, 0, 0, glowSize);
            outerGlow.addColorStop(0, `hsla(${particle.hue}, 100%, ${70 * particle.brightness}%, 0.8)`);
            outerGlow.addColorStop(0.3, `hsla(${particle.hue + 15}, 100%, ${60 * particle.brightness}%, 0.6)`);
            outerGlow.addColorStop(0.7, `hsla(${particle.hue + 25}, 100%, ${40 * particle.brightness}%, 0.3)`);
            outerGlow.addColorStop(1, `hsla(${particle.hue + 35}, 100%, 20%, 0)`);
            
            this.ctx.fillStyle = outerGlow;
            this.ctx.beginPath();
            this.ctx.arc(0, 0, glowSize, 0, Math.PI * 2);
            this.ctx.fill();
            
            // 중간 레이어 (불씨 본체)
            const midGlow = this.ctx.createRadialGradient(0, 0, 0, 0, 0, particle.size);
            midGlow.addColorStop(0, `hsla(${particle.hue}, 100%, ${85 * particle.brightness}%, 1)`);
            midGlow.addColorStop(0.4, `hsla(${particle.hue + 10}, 100%, ${75 * particle.brightness}%, 0.9)`);
            midGlow.addColorStop(0.8, `hsla(${particle.hue + 20}, 100%, ${50 * particle.brightness}%, 0.7)`);
            midGlow.addColorStop(1, `hsla(${particle.hue + 30}, 100%, 30%, 0.2)`);
            
            this.ctx.fillStyle = midGlow;
            this.ctx.beginPath();
            this.ctx.arc(0, 0, particle.size, 0, Math.PI * 2);
            this.ctx.fill();
            
            // 핵심 불씨 (가장 밝은 중심부)
            const core = this.ctx.createRadialGradient(0, 0, 0, 0, 0, coreSize);
            core.addColorStop(0, `hsla(${Math.max(0, particle.hue - 10)}, 100%, ${95 * particle.brightness}%, 1)`);
            core.addColorStop(0.6, `hsla(${particle.hue}, 100%, ${80 * particle.brightness}%, 0.9)`);
            core.addColorStop(1, `hsla(${particle.hue + 15}, 100%, ${60 * particle.brightness}%, 0.5)`);
            
            this.ctx.fillStyle = core;
            this.ctx.beginPath();
            this.ctx.arc(0, 0, coreSize, 0, Math.PI * 2);
            this.ctx.fill();
            
            // 불똥 스파크 효과 (작은 점들)
            if (Math.random() < 0.3) {
                const sparkCount = Math.floor(Math.random() * 3) + 1;
                for (let i = 0; i < sparkCount; i++) {
                    const sparkAngle = Math.random() * Math.PI * 2;
                    const sparkDistance = particle.size * (1.5 + Math.random() * 1);
                    const sparkX = Math.cos(sparkAngle) * sparkDistance;
                    const sparkY = Math.sin(sparkAngle) * sparkDistance;
                    const sparkSize = Math.random() * 0.8 + 0.2;
                    
                    this.ctx.fillStyle = `hsla(${particle.hue + Math.random() * 20}, 100%, ${80 * particle.brightness}%, ${particle.opacity * 0.8})`;
                    this.ctx.beginPath();
                    this.ctx.arc(sparkX, sparkY, sparkSize, 0, Math.PI * 2);
                    this.ctx.fill();
                }
            }
            
            this.ctx.restore();
        });
    }
    
    startAnimation() {
        const animate = () => {
            this.updateParticles();
            this.drawParticles();
            this.animationId = requestAnimationFrame(animate);
        };
        
        animate();
    }
    
    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        
        if (this.canvas) {
            document.body.removeChild(this.canvas);
        }
        
        window.removeEventListener('resize', this.resizeCanvas);
    }
}

// DOM이 로드되면 초기화
document.addEventListener('DOMContentLoaded', () => {
    const fireCard = new FireCard();
    const fireParticles = new FireParticles();
    
    // 페이지 언로드 시 정리
    window.addEventListener('beforeunload', () => {
        fireCard.destroy();
        fireParticles.destroy();
    });
    
    // 개발자 콘솔에 메시지 출력
    console.log('🔥 불꽃 명함이 활성화되었습니다!');
    console.log('마우스나 터치로 명함을 태워보세요.');
}); 