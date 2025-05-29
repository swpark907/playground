class FrozenCard {
    constructor() {
        this.card = document.getElementById('businessCard');
        this.frozenContent = document.getElementById('frozenContent');
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
        this.card.classList.add('frozen');
        this.updateMousePosition(e);
    }
    
    handleMouseLeave(e) {
        this.isMouseOver = false;
        this.card.classList.remove('frozen');
    }
    
    handleMouseMove(e) {
        if (this.isMouseOver) {
            this.updateMousePosition(e);
        }
    }
    
    handleTouchStart(e) {
        this.isTouching = true;
        this.card.classList.add('touch-frozen');
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
            this.card.classList.remove('touch-frozen');
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

// 추가 시각 효과를 위한 파티클 시스템
class IceParticles {
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
        this.canvas.style.opacity = '0.3';
        
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
        const particleCount = 50;
        
        for (let i = 0; i < particleCount; i++) {
            this.particles.push({
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
                size: Math.random() * 3 + 1,
                speedX: (Math.random() - 0.5) * 0.5,
                speedY: Math.random() * 0.5 + 0.1,
                opacity: Math.random() * 0.5 + 0.2,
                rotation: Math.random() * 360
            });
        }
    }
    
    updateParticles() {
        this.particles.forEach(particle => {
            particle.x += particle.speedX;
            particle.y += particle.speedY;
            particle.rotation += 1;
            
            // 화면 밖으로 나가면 위쪽에서 다시 시작
            if (particle.y > window.innerHeight) {
                particle.y = -10;
                particle.x = Math.random() * window.innerWidth;
            }
            
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
            this.ctx.rotate(particle.rotation * Math.PI / 180);
            this.ctx.globalAlpha = particle.opacity;
            
            // 얼음 결정 모양 그리기
            this.ctx.strokeStyle = '#64c8ff';
            this.ctx.lineWidth = 1;
            this.ctx.beginPath();
            
            // 6각형 얼음 결정
            for (let i = 0; i < 6; i++) {
                const angle = (i * 60) * Math.PI / 180;
                const x = Math.cos(angle) * particle.size;
                const y = Math.sin(angle) * particle.size;
                
                if (i === 0) {
                    this.ctx.moveTo(x, y);
                } else {
                    this.ctx.lineTo(x, y);
                }
            }
            
            this.ctx.closePath();
            this.ctx.stroke();
            
            // 중심선 그리기
            for (let i = 0; i < 3; i++) {
                const angle = (i * 60) * Math.PI / 180;
                this.ctx.beginPath();
                this.ctx.moveTo(0, 0);
                this.ctx.lineTo(Math.cos(angle) * particle.size, Math.sin(angle) * particle.size);
                this.ctx.stroke();
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
    const frozenCard = new FrozenCard();
    const iceParticles = new IceParticles();
    
    // 페이지 언로드 시 정리
    window.addEventListener('beforeunload', () => {
        frozenCard.destroy();
        iceParticles.destroy();
    });
    
    // 개발자 콘솔에 메시지 출력
    console.log('🧊 냉기 명함이 활성화되었습니다!');
    console.log('마우스나 터치로 명함을 얼려보세요.');
}); 