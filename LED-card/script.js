class LEDCard {
    constructor() {
        this.mouseX = 0;
        this.mouseY = 0;
        this.isAnimating = false;
        this.letters = [];
        this.letterTimers = new Map(); // 각 글자별 타이머 관리
        this.letterStates = new Map(); // 각 글자의 이전 상태 추적
        
        this.init();
        this.bindEvents();
        this.startAnimation();
    }
    
    init() {
        // 모든 텍스트 요소를 찾아서 각 글자를 span으로 감싸기
        const textElements = document.querySelectorAll('.led-text');
        
        textElements.forEach(element => {
            this.wrapLettersInSpans(element);
        });
        
        // 모든 span 요소들을 수집
        this.letters = document.querySelectorAll('.led-text span');
        
        // 커서 요소 생성
        this.createCursor();
    }
    
    wrapLettersInSpans(element) {
        const text = element.textContent;
        element.innerHTML = '';
        
        for (let i = 0; i < text.length; i++) {
            const span = document.createElement('span');
            span.textContent = text[i];
            
            // 공백 처리
            if (text[i] === ' ') {
                span.innerHTML = '&nbsp;';
                span.style.marginRight = '0.3em';
            }
            
            element.appendChild(span);
        }
    }
    
    createCursor() {
        this.cursor = document.createElement('div');
        this.cursor.className = 'custom-cursor';
        this.cursor.style.cssText = `
            position: fixed;
            width: 20px;
            height: 20px;
            background: radial-gradient(circle, rgba(0, 255, 255, 0.8) 0%, transparent 70%);
            border-radius: 50%;
            pointer-events: none;
            z-index: 9999;
            transform: translate(-50%, -50%);
            transition: opacity 0.3s ease;
        `;
        document.body.appendChild(this.cursor);
    }
    
    bindEvents() {
        // 마우스 이동 이벤트
        document.addEventListener('mousemove', (e) => {
            this.mouseX = e.clientX;
            this.mouseY = e.clientY;
            
            // 커서 위치 업데이트
            if (this.cursor) {
                this.cursor.style.left = this.mouseX + 'px';
                this.cursor.style.top = this.mouseY + 'px';
            }
        });
        
        // 마우스가 화면을 벗어날 때
        document.addEventListener('mouseleave', () => {
            if (this.cursor) {
                this.cursor.style.opacity = '0';
            }
        });
        
        // 마우스가 화면에 들어올 때
        document.addEventListener('mouseenter', () => {
            if (this.cursor) {
                this.cursor.style.opacity = '1';
            }
        });
        
        // 카드 3D 효과 (회전 강도 줄임)
        const card = document.querySelector('.card');
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            
            const rotateX = (e.clientY - centerY) / 30; // 10에서 30으로 변경
            const rotateY = (e.clientX - centerX) / 30; // 10에서 30으로 변경
            
            card.style.transform = `rotateX(${-rotateX}deg) rotateY(${rotateY}deg)`;
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'rotateX(0deg) rotateY(0deg)';
        });
    }
    
    calculateDistance(element) {
        const rect = element.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        const deltaX = this.mouseX - centerX;
        const deltaY = this.mouseY - centerY;
        
        return Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    }
    
    getGlowLevel(distance) {
        // 거리에 따른 빛의 강도 계산 (0-4 레벨)
        const maxDistance = 200; // 300에서 200으로 줄임
        const normalizedDistance = Math.min(distance / maxDistance, 1);
        
        if (normalizedDistance < 0.15) return 4; // 가장 밝음
        if (normalizedDistance < 0.35) return 3;
        if (normalizedDistance < 0.55) return 2;
        if (normalizedDistance < 0.75) return 1;
        return 0; // 기본 상태
    }
    
    updateGlowEffects() {
        this.letters.forEach(letter => {
            const distance = this.calculateDistance(letter);
            const glowLevel = this.getGlowLevel(distance);
            const previousLevel = this.letterStates.get(letter) || 0;
            
            // 기존 타이머가 있다면 취소
            if (this.letterTimers.has(letter)) {
                clearTimeout(this.letterTimers.get(letter));
                this.letterTimers.delete(letter);
            }
            
            // 기존 glow 클래스 제거
            letter.classList.remove('glow-1', 'glow-2', 'glow-3', 'glow-4');
            
            // 새로운 glow 클래스 추가
            if (glowLevel > 0) {
                letter.classList.add(`glow-${glowLevel}`);
                
                // 인라인 스타일 초기화 (CSS 클래스가 적용되도록)
                letter.style.textShadow = '';
                letter.style.filter = '';
                letter.style.opacity = '';
                letter.style.transform = '';
                
                // 추가적인 동적 효과 (더 선명하게)
                if (glowLevel === 4) {
                    const intensity = Math.max(0, 1 - (distance / 80));
                    letter.style.textShadow = `
                        0 0 ${8 + intensity * 8}px currentColor,
                        0 0 ${16 + intensity * 12}px currentColor,
                        0 0 ${24 + intensity * 16}px currentColor,
                        0 0 ${32 + intensity * 20}px currentColor,
                        0 0 ${40 + intensity * 24}px currentColor
                    `;
                    letter.style.filter = `drop-shadow(0 0 ${12 + intensity * 18}px currentColor)`;
                    letter.style.opacity = '1';
                }
            }
            
            // 밝은 상태에서 어두운 상태로 변하거나, 처음부터 어두운 상태일 때
            if (glowLevel === 0 && previousLevel > 0) {
                // 밝은 상태에서 어두운 상태로 변할 때 2초 후 페이드
                const timer = setTimeout(() => {
                    this.fadeToDefault(letter);
                    this.letterTimers.delete(letter);
                }, 2000);
                
                this.letterTimers.set(letter, timer);
            } else if (glowLevel === 0 && previousLevel === 0) {
                // 계속 어두운 상태일 때는 즉시 기본 상태 적용
                this.fadeToDefault(letter);
            }
            
            // 현재 상태 저장
            this.letterStates.set(letter, glowLevel);
        });
    }
    
    fadeToDefault(letter) {
        // 부드러운 전환을 위한 transition 추가
        letter.style.transition = 'all 1.5s ease-out';
        
        // 기본 상태로 복귀 (CSS 기본값과 동일하게)
        letter.style.textShadow = '0 0 1px currentColor';
        letter.style.filter = 'none';
        letter.style.opacity = '0.9';
        letter.style.transform = 'scale(1)';
        
        // 모든 glow 클래스 제거
        letter.classList.remove('glow-1', 'glow-2', 'glow-3', 'glow-4');
        
        // 1.5초 후 transition 제거 (다음 상호작용을 위해)
        setTimeout(() => {
            letter.style.transition = 'all 0.1s ease';
        }, 1500);
    }
    
    animate() {
        this.updateGlowEffects();
        
        if (this.isAnimating) {
            requestAnimationFrame(() => this.animate());
        }
    }
    
    startAnimation() {
        this.isAnimating = true;
        this.animate();
    }
    
    stopAnimation() {
        this.isAnimating = false;
    }
}

// 페이지 로드 완료 후 LED 카드 초기화
document.addEventListener('DOMContentLoaded', () => {
    new LEDCard();
    
    // 추가적인 시각 효과들
    addParticleEffect();
    addTypingEffect();
});

// 파티클 효과 추가
function addParticleEffect() {
    const particleContainer = document.createElement('div');
    particleContainer.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 1;
    `;
    document.body.appendChild(particleContainer);
    
    // 파티클 생성
    for (let i = 0; i < 50; i++) {
        createParticle(particleContainer);
    }
}

function createParticle(container) {
    const particle = document.createElement('div');
    particle.style.cssText = `
        position: absolute;
        width: 2px;
        height: 2px;
        background: rgba(0, 255, 255, 0.3);
        border-radius: 50%;
        animation: float ${5 + Math.random() * 10}s linear infinite;
    `;
    
    particle.style.left = Math.random() * 100 + '%';
    particle.style.top = Math.random() * 100 + '%';
    particle.style.animationDelay = Math.random() * 10 + 's';
    
    container.appendChild(particle);
    
    // CSS 애니메이션 추가
    if (!document.querySelector('#particle-styles')) {
        const style = document.createElement('style');
        style.id = 'particle-styles';
        style.textContent = `
            @keyframes float {
                0% { transform: translateY(0px) rotate(0deg); opacity: 0; }
                10% { opacity: 1; }
                90% { opacity: 1; }
                100% { transform: translateY(-100vh) rotate(360deg); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }
}

// 타이핑 효과 (선택적)
function addTypingEffect() {
    const mainText = document.querySelector('#mainText');
    const originalText = mainText.textContent;
    
    // 초기에는 텍스트 숨기기
    setTimeout(() => {
        mainText.style.opacity = '0';
        setTimeout(() => {
            mainText.style.opacity = '1';
            mainText.style.animation = 'fadeInUp 1s ease-out';
        }, 500);
    }, 100);
    
    // 페이드인 애니메이션 추가
    if (!document.querySelector('#typing-styles')) {
        const style = document.createElement('style');
        style.id = 'typing-styles';
        style.textContent = `
            @keyframes fadeInUp {
                from {
                    opacity: 0;
                    transform: translateY(30px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
        `;
        document.head.appendChild(style);
    }
}