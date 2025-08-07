// 설정 관리 시스템
class CardSettings {
    constructor() {
        this.root = document.documentElement;
        this.businessCard = document.getElementById('businessCard');
        this.hoverOverlay = document.getElementById('hoverOverlay');
        this.pieces = [];
        this.isScattered = false;
        this.isAnimating = false; // 애니메이션 진행 상태 추적
        this.floatingAnimations = [];
        
        this.init();
    }
    
    init() {
        console.log('🎯 명함 시스템 초기화');
    }
    
    // CSS 변수 값 가져오기
    getCSSVar(name) {
        return getComputedStyle(this.root).getPropertyValue(name).trim();
    }
    
    // 현재 설정값들 가져오기
    getCurrentSettings() {
        const cardWidth = parseFloat(this.getCSSVar('--card-width'));
        const cardHeight = parseFloat(this.getCSSVar('--card-height'));
        const gridCols = parseInt(this.getCSSVar('--grid-cols'));
        const gridRows = parseInt(this.getCSSVar('--grid-rows'));
        const pieceWidth = cardWidth / gridCols;
        const pieceHeight = cardHeight / gridRows;
        
        return { cardWidth, cardHeight, gridCols, gridRows, pieceWidth, pieceHeight };
    }
    
    // 명함을 조각으로 쪼개기
    createPieces() {
        if (this.pieces.length > 0) return; // 이미 조각이 있으면 스킵
        
        const cardContent = this.businessCard.querySelector('.card-content');
        if (!cardContent) return;
        
        // 복제 전에 원본 내용이 보이는 상태로 만들기
        cardContent.style.opacity = '1';
        cardContent.style.display = 'block';
        cardContent.style.visibility = 'visible';
        
        const { cardWidth, cardHeight, gridCols, gridRows, pieceWidth, pieceHeight } = this.getCurrentSettings();
        
        // 조각들 생성
        for (let row = 0; row < gridRows; row++) {
            for (let col = 0; col < gridCols; col++) {
                const piece = document.createElement('div');
                piece.classList.add('card-piece');
                
                // 조각 위치와 크기 설정
                piece.style.position = 'absolute';
                piece.style.left = `${col * pieceWidth}px`;
                piece.style.top = `${row * pieceHeight}px`;
                piece.style.width = `${pieceWidth}px`;
                piece.style.height = `${pieceHeight}px`;
                piece.style.overflow = 'hidden';
                
                // 배경 그라데이션 설정
                const offsetX = -col * pieceWidth;
                const offsetY = -row * pieceHeight;
                piece.style.background = this.getCSSVar('--card-gradient');
                piece.style.backgroundSize = `${cardWidth}px ${cardHeight}px`;
                piece.style.backgroundPosition = `${offsetX}px ${offsetY}px`;
                
                // 내용 복제
                const clonedContent = cardContent.cloneNode(true);
                clonedContent.style.position = 'absolute';
                clonedContent.style.left = '0';
                clonedContent.style.top = '125px';
                clonedContent.style.width = `${cardWidth}px`;
                clonedContent.style.height = `${cardHeight}px`;
                clonedContent.style.pointerEvents = 'none';
                clonedContent.style.display = 'block';
                clonedContent.style.visibility = 'visible';
                clonedContent.style.opacity = '1';
                clonedContent.style.zIndex = '1';
                
                // 원본과 동일한 위치를 유지하면서 조각에 맞게 이동
                clonedContent.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
                
                // 복제된 내용의 모든 하위 요소들도 확실히 보이게 설정
                const allElements = clonedContent.querySelectorAll('*');
                allElements.forEach(el => {
                    el.style.opacity = '1';
                    el.style.visibility = 'visible';
                    el.style.display = el.style.display === 'none' ? 'block' : el.style.display || 'block';
                });
                
                piece.appendChild(clonedContent);
                this.businessCard.appendChild(piece);
                this.pieces.push(piece);
            }
        }
        
        console.log(`✅ ${this.pieces.length}개 조각 생성 완료`);
    }
    
    // 흩어지기
    scatter() {
        if (this.isScattered || this.isAnimating) return; // 애니메이션 진행 중에는 차단
        
        this.isAnimating = true; // 애니메이션 시작
        this.isScattered = true;
        
        // 조각들 생성
        this.createPieces();
        
        // 원본 명함 내용 숨기기
        const cardContent = this.businessCard.querySelector('.card-content');
        if (cardContent) {
            cardContent.style.opacity = '0';
        }
        
        // 조각들을 body로 이동
        this.pieces.forEach(piece => {
            const rect = piece.getBoundingClientRect();
            document.body.appendChild(piece);
            piece.style.position = 'fixed';
            piece.style.left = `${rect.left}px`;
            piece.style.top = `${rect.top}px`;
            piece.style.zIndex = '1000';
            piece.style.pointerEvents = 'none';
        });
        
        // 원본 명함 숨기기
        setTimeout(() => {
            this.businessCard.classList.add('scattered');
        }, 50);
        
        // 빠른 흩어짐
        const scatterRange = parseFloat(this.getCSSVar('--scatter-range'));
        const maxX = window.innerWidth * scatterRange;
        const maxY = window.innerHeight * scatterRange;
        
        anime({
            targets: this.pieces,
            translateX: () => anime.random(-maxX, maxX),
            translateY: () => anime.random(-maxY, maxY),
            rotate: () => anime.random(-45, 45),
            scale: () => anime.random(0.8, 1.2),
            duration: 300,
            easing: 'easeOutQuart',
            delay: anime.stagger(3),
            complete: () => {
                this.isAnimating = false; // 흩어짐 애니메이션 완료
                this.startFloating();
            }
        });
    }
    
    // 부유 효과 시작
    startFloating() {
        this.pieces.forEach(piece => {
            const animation = anime({
                targets: piece,
                translateX: `+=${anime.random(-30, 30)}`,
                translateY: `+=${anime.random(-30, 30)}`,
                rotate: `+=${anime.random(-10, 10)}`,
                duration: anime.random(2000, 4000),
                easing: 'easeInOutSine',
                direction: 'alternate',
                loop: true
            });
            this.floatingAnimations.push(animation);
        });
    }
    
    // 부유 효과 정지
    stopFloating() {
        this.floatingAnimations.forEach(animation => animation.pause());
        this.floatingAnimations = [];
    }
    
    // 다시 조합
    gather() {
        if (!this.isScattered || this.isAnimating) return; // 애니메이션 진행 중에는 차단
        
        this.isAnimating = true; // 애니메이션 시작
        this.isScattered = false;
        
        // 부유 효과 정지
        this.stopFloating();
        
        // 조각들을 원래 위치로
        anime({
            targets: this.pieces,
            translateX: 0,
            translateY: 0,
            rotate: 0,
            scale: 1,
            opacity: 1,
            duration: 300,
            easing: 'easeOutBack',
            delay: anime.stagger(1),
            update: (anim) => {
                // 80% 진행 시 원본 명함 페이드인
                if (anim.progress > 80 && this.businessCard.classList.contains('scattered')) {
                    this.businessCard.classList.remove('scattered');
                    this.businessCard.style.opacity = '0';
                    anime({
                        targets: this.businessCard,
                        opacity: 1,
                        duration: 100,
                        easing: 'easeOutQuart'
                    });
                }
            },
            complete: () => {
                // 정리
                setTimeout(() => {
                    this.pieces.forEach(piece => {
                        if (piece.parentNode === document.body) {
                            piece.remove();
                        }
                    });
                    this.pieces = [];
                    
                    // 원본 명함 내용 복원
                    const cardContent = this.businessCard.querySelector('.card-content');
                    if (cardContent) {
                        cardContent.style.opacity = '1';
                    }
                    
                    this.businessCard.style.opacity = '';
                    this.isAnimating = false; // 조합 애니메이션 완료
                    
                    console.log('✅ 조합 완료');
                }, 200);
            }
        });
    }
}

// 초기화
const cardSettings = new CardSettings();

// 이벤트 설정
document.addEventListener('DOMContentLoaded', () => {
    cardSettings.hoverOverlay.addEventListener('mouseenter', () => cardSettings.scatter());
    cardSettings.hoverOverlay.addEventListener('mouseleave', () => cardSettings.gather());
    
    // 터치 지원
    cardSettings.hoverOverlay.addEventListener('touchstart', (e) => {
        e.preventDefault();
        cardSettings.scatter();
        setTimeout(() => cardSettings.gather(), 2000);
    });
    
    console.log('🎯 명함 효과 준비 완료!');
}); 