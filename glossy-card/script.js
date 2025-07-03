class GlossyCard {
    constructor() {
        this.init();
        this.bindEvents();
    }
    
    init() {
        // 모든 텍스트 요소를 찾아서 각 글자를 span으로 감싸기 (애니메이션용)
        const textElements = document.querySelectorAll('.glossy-text');
        
        textElements.forEach(element => {
            this.wrapLettersInSpans(element);
        });
        
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
                span.style.marginRight = '0.2em';
            }
            
            element.appendChild(span);
        }
    }
    
    createCursor() {
        this.cursor = document.createElement('div');
        this.cursor.className = 'custom-cursor';
        document.body.appendChild(this.cursor);
    }
    
    bindEvents() {
        // 마우스 이동 이벤트
        document.addEventListener('mousemove', (e) => {
            // 커서 위치 업데이트
            if (this.cursor) {
                this.cursor.style.left = e.clientX + 'px';
                this.cursor.style.top = e.clientY + 'px';
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
        
        // 카드 관련 이벤트
        const card = document.querySelector('.glossy-card');
        if (card) {
            // 클릭 이벤트 (뒤집기)
            card.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                // 3D 효과 초기화 후 뒤집기
                card.style.transform = '';
                card.classList.toggle('flipped');
            });
            
            // 마우스 엔터 시 반짝 효과
            card.addEventListener('mouseenter', () => {
                this.addShimmerEffect();
            });
            
            // 마우스 리브 시 반짝 효과 및 3D 효과 리셋
            card.addEventListener('mouseleave', () => {
                this.addShimmerEffect();
                // 뒤집힌 상태가 아닐 때만 3D 효과 리셋
                if (!card.classList.contains('flipped')) {
                    card.style.transform = '';
                }
            });
            
            // 카드 3D 효과 (뒤집힌 상태가 아닐 때만)
            card.addEventListener('mousemove', (e) => {
                // 뒤집힌 상태에서는 3D 효과 비활성화
                if (card.classList.contains('flipped')) return;
                
                const rect = card.getBoundingClientRect();
                const centerX = rect.left + rect.width / 2;
                const centerY = rect.top + rect.height / 2;
                
                const rotateX = (e.clientY - centerY) / 40;
                const rotateY = (e.clientX - centerX) / 40;
                
                // 3D 효과는 인라인 스타일로, 뒤집기는 클래스로 분리
                card.style.transform = `rotateX(${-rotateX}deg) rotateY(${rotateY}deg)`;
            });
        }
    }
    
    addShimmerEffect() {
        const textElements = document.querySelectorAll('.glossy-text');
        textElements.forEach(element => {
            element.classList.add('shimmer');
            setTimeout(() => {
                element.classList.remove('shimmer');
            }, 600);
        });
    }
    
    // 기존 복잡한 애니메이션 로직 제거됨 - 단순한 CSS 기반 효과로 대체
}

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', () => {
    new GlossyCard();
    
    // 부드러운 등장 애니메이션
    setTimeout(() => {
        const card = document.querySelector('.glossy-card');
        if (card) {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px) rotateX(10deg)';
            card.style.transition = 'opacity 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94), transform 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
            
            requestAnimationFrame(() => {
                card.style.opacity = '1';
                card.style.transform = '';
                
                // 등장 애니메이션 완료 후 뒤집기 transition 복원
                setTimeout(() => {
                    card.style.transition = 'transform 0.8s cubic-bezier(0.4, 0.0, 0.2, 1)';
                }, 1200);
            });
        }
    }, 100);
    
    // 미묘한 자동 광택 애니메이션 (선택사항)
    addSubtleShineAnimation();
});

// 미묘한 자동 광택 효과 (주기적으로 반짝임)
function addSubtleShineAnimation() {
    setInterval(() => {
        const textElements = document.querySelectorAll('.glossy-text');
        const randomElement = textElements[Math.floor(Math.random() * textElements.length)];
        
        if (randomElement && !document.querySelector('.glossy-card:hover')) {
            randomElement.classList.add('shimmer');
            setTimeout(() => {
                randomElement.classList.remove('shimmer');
            }, 600);
        }
    }, 3000); // 3초마다 랜덤하게 반짝임
}