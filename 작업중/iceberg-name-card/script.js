// DOM이 로드된 후 실행
document.addEventListener('DOMContentLoaded', function() {
    // 모든 애니메이션 요소 선택
    const lines = document.querySelectorAll('.line');
    
    // 초기 페이지 로드 시 상단 요소들 애니메이션
    function initializeTopSection() {
        const topLines = document.querySelectorAll('.surface-section .line');
        
        topLines.forEach((line, index) => {
            const delay = parseInt(line.dataset.delay) || 0;
            
            setTimeout(() => {
                line.classList.add('visible');
            }, delay + 500); // 페이지 로드 후 0.5초 대기
        });
    }
    
    // 스크롤 기반 애니메이션 관리
    function handleScrollAnimations() {
        const windowHeight = window.innerHeight;
        const scrollY = window.scrollY;
        
        // 수면 아래 요소들 처리
        const underwaterLines = document.querySelectorAll('.underwater-section .line');
        
        underwaterLines.forEach((line, index) => {
            const rect = line.getBoundingClientRect();
            const elementTop = rect.top + scrollY;
            const elementHeight = rect.height;
            const triggerPoint = windowHeight * 0.8; // 화면 하단 20% 지점에서 트리거
            
            // 요소가 트리거 포인트에 도달했을 때
            if (rect.top <= triggerPoint && rect.bottom >= 0) {
                const delay = parseInt(line.dataset.delay) || 0;
                
                setTimeout(() => {
                    line.classList.add('visible');
                }, delay);
            }
        });
    }
    
    // 스크롤 진행도에 따른 배경 효과
    function updateScrollEffects() {
        const scrollPercent = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);
        const body = document.body;
        
        // 스크롤이 진행됨에 따라 배경 색상이 더 어두워지도록
        const baseGradient = `
            linear-gradient(
                to bottom,
                #87CEEB 0%,
                #4682B4 30%,
                #2E5984 ${50 + scrollPercent * 10}%,
                #1B3A57 ${80 + scrollPercent * 5}%,
                #0F1C2E 100%
            )
        `;
        
        body.style.background = baseGradient;
    }
    
    // 부드러운 스크롤을 위한 이징 함수
    function easeInOutQuad(t) {
        return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    }
    
    // 스크롤 다운 버튼 클릭 이벤트
    function setupScrollDownButton() {
        const scrollIndicator = document.querySelector('.scroll-indicator');
        
        if (scrollIndicator) {
            scrollIndicator.addEventListener('click', function() {
                const targetSection = document.querySelector('.underwater-section');
                const targetPosition = targetSection.offsetTop - 100;
                
                // 부드러운 스크롤 애니메이션
                const startPosition = window.scrollY;
                const distance = targetPosition - startPosition;
                const duration = 1000; // 1초
                let start = null;
                
                function animateScroll(timestamp) {
                    if (!start) start = timestamp;
                    const progress = timestamp - start;
                    const progressPercent = Math.min(progress / duration, 1);
                    
                    const easedProgress = easeInOutQuad(progressPercent);
                    window.scrollTo(0, startPosition + distance * easedProgress);
                    
                    if (progress < duration) {
                        requestAnimationFrame(animateScroll);
                    }
                }
                
                requestAnimationFrame(animateScroll);
            });
        }
    }
    
    // 스크롤 성능 최적화를 위한 쓰로틀링
    let ticking = false;
    
    function requestTick() {
        if (!ticking) {
            requestAnimationFrame(function() {
                handleScrollAnimations();
                updateScrollEffects();
                ticking = false;
            });
            ticking = true;
        }
    }
    
    // 시차 효과 (패럴랙스)
    function updateParallax() {
        const scrolled = window.scrollY;
        const parallaxElements = document.querySelectorAll('.container');
        
        parallaxElements.forEach(element => {
            const speed = 0.5;
            const yPos = -(scrolled * speed);
            element.style.transform = `translateY(${yPos}px)`;
        });
    }
    
    // 텍스트 타이핑 효과 (선택적)
    function typeWriter(element, text, speed = 100) {
        let i = 0;
        element.innerHTML = '';
        
        function typing() {
            if (i < text.length) {
                element.innerHTML += text.charAt(i);
                i++;
                setTimeout(typing, speed);
            }
        }
        
        typing();
    }
    
    // 이벤트 리스너 등록
    window.addEventListener('scroll', requestTick);
    window.addEventListener('resize', function() {
        requestTick();
    });
    
    // 초기화 함수들 실행
    initializeTopSection();
    setupScrollDownButton();
    
    // 페이지 로드 완료 후 추가 효과
    window.addEventListener('load', function() {
        // 로딩 완료 후 전체 컨테이너 페이드인
        const container = document.querySelector('.container');
        container.style.opacity = '0';
        container.style.transition = 'opacity 1s ease-in-out';
        
        setTimeout(() => {
            container.style.opacity = '1';
        }, 100);
        
        // 초기 스크롤 체크
        requestTick();
    });
    
    // 디버깅을 위한 스크롤 위치 표시 (개발 시에만 사용)
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        const debugInfo = document.createElement('div');
        debugInfo.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            background: rgba(0, 0, 0, 0.7);
            color: white;
            padding: 10px;
            border-radius: 5px;
            font-size: 12px;
            z-index: 9999;
            font-family: monospace;
        `;
        document.body.appendChild(debugInfo);
        
        window.addEventListener('scroll', function() {
            const scrollPercent = Math.round((window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100);
            debugInfo.innerHTML = `
                Scroll: ${window.scrollY}px<br>
                Progress: ${scrollPercent}%<br>
                Window H: ${window.innerHeight}px
            `;
        });
    }
}); 