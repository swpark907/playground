// Seoul 소개 명함 JavaScript

document.addEventListener('DOMContentLoaded', function() {
    const businessCard = document.querySelector('.business-card');
    const slideTrack = document.getElementById('slideTrack');
    const textItems = document.querySelectorAll('.text-item');
    const scrollHint = document.querySelector('.scroll-hint');
    const finalBusinessCard = document.querySelector('.final-business-card');
    const keywords = document.querySelectorAll('.keyword');
    
    let currentPosition = 0;
    let animationSpeed = 0.5;
    let imageWidth = 0;
    let totalImages = 15;
    let animationId;
    let currentTextIndex = 0;
    let scrollTimeout;
    let keywordAnimationStarted = false;

    // 미묘한 필터와 간격 변형 패턴들
    const imageVariations = [
        { filter: 'none', opacity: 1, marginRight: '0px' },
        { filter: 'brightness(0.95)', opacity: 0.9, marginRight: '5px' },
        { filter: 'contrast(1.05)', opacity: 0.85, marginRight: '0px' },
        { filter: 'brightness(1.05)', opacity: 0.95, marginRight: '3px' },
        { filter: 'contrast(0.95)', opacity: 0.8, marginRight: '0px' },
        { filter: 'brightness(0.9)', opacity: 0.9, marginRight: '7px' },
        { filter: 'none', opacity: 0.75, marginRight: '0px' },
        { filter: 'brightness(1.1)', opacity: 1, marginRight: '2px' },
        { filter: 'contrast(1.1)', opacity: 0.88, marginRight: '0px' },
        { filter: 'brightness(0.85)', opacity: 0.85, marginRight: '4px' },
        { filter: 'none', opacity: 0.92, marginRight: '0px' },
        { filter: 'contrast(0.9)', opacity: 0.9, marginRight: '6px' },
        { filter: 'brightness(0.98)', opacity: 0.95, marginRight: '0px' },
        { filter: 'brightness(1.08)', opacity: 0.88, marginRight: '1px' },
        { filter: 'contrast(1.02)', opacity: 0.9, marginRight: '0px' }
    ];

    // 이미지들을 동적으로 생성
    function createImages() {
        for (let i = 0; i < totalImages; i++) {
            const img = document.createElement('img');
            img.src = 'city.png';
            img.alt = 'City';
            img.className = 'slide-image';
            
            const variation = imageVariations[i % imageVariations.length];
            img.style.filter = variation.filter;
            img.style.opacity = variation.opacity;
            img.style.marginRight = variation.marginRight;
            
            slideTrack.appendChild(img);
        }
        
        const firstImg = slideTrack.querySelector('.slide-image');
        firstImg.onload = function() {
            const computedStyle = getComputedStyle(this);
            imageWidth = this.offsetWidth + parseInt(computedStyle.marginRight);
            startAnimation();
        };
    }

    // 무한 스크롤 애니메이션
    function animate() {
        currentPosition -= animationSpeed;
        
        if (Math.abs(currentPosition) >= imageWidth) {
            currentPosition = 0;
        }
        
        slideTrack.style.transform = `translateX(${currentPosition}px)`;
        
        if (!document.hidden) {
            animationId = requestAnimationFrame(animate);
        }
    }

    function startAnimation() {
        if (animationId) {
            cancelAnimationFrame(animationId);
        }
        animate();
    }

    function stopAnimation() {
        if (animationId) {
            cancelAnimationFrame(animationId);
            animationId = null;
        }
    }

    // 키워드 순차 애니메이션
    function animateKeywords() {
        if (keywordAnimationStarted) return;
        keywordAnimationStarted = true;

        // 명함 요소들 순차 애니메이션
        const cardCenter = document.querySelector('.card-center');
        const addressLine = document.querySelector('.address-line');
        const mainTitle = document.querySelector('.main-title');
        const subtitle = document.querySelector('.subtitle');
        const contactItems = document.querySelectorAll('.contact-item');

        // 1. 중앙선 늘어나기 (더 늦게, 더 눈에 띄게)
        setTimeout(() => {
            cardCenter.classList.add('show');
        }, 800); // 0.1초 → 0.8초로 증가

        // 2. 상단 주소 정보
        setTimeout(() => {
            addressLine.classList.add('show');
        }, 1400); // 중앙선 후 0.6초

        // 3. 메인 타이틀 (SEOUL)
        setTimeout(() => {
            mainTitle.classList.add('show');
        }, 1800); // 주소 후 0.4초

        // 4. 서브타이틀 (TOURISM CENTER)
        setTimeout(() => {
            subtitle.classList.add('show');
        }, 2200); // 타이틀 후 0.4초

        // 5. 연락처 항목들 (하나씩 순차적으로)
        contactItems.forEach((item, index) => {
            setTimeout(() => {
                item.classList.add('show');
            }, 2600 + (index * 200)); // 부제목 후 0.4초부터 시작
        });

        // 6. 배경 키워드들
        keywords.forEach((keyword, index) => {
            setTimeout(() => {
                keyword.classList.add('show');
            }, 2600 + (contactItems.length * 200) + 500 + (index * 400));
        });
    }

    // 3D 텍스트 효과 제어 (일직선 버전)
    function update3DText(scrollProgress) {
        const totalTexts = textItems.length;
        const seoulItem = textItems[0]; // SEOUL (첫 번째)
        const animatedTexts = Array.from(textItems).slice(1); // 나머지 4개
        const textSectionSize = 0.8 / animatedTexts.length; // 4개 텍스트를 위한 섹션 크기
        const finalCardStart = 0.9; // 최종 명함은 90% 지점부터 시작 (더 늦게)
        
        // SEOUL은 처음에만 표시 (스크롤 시작 전까지)
        if (scrollProgress < 0.05) { // 스크롤 5% 전까지만 SEOUL 표시
            seoulItem.classList.add('active');
            seoulItem.style.transform = 'translateZ(0px) scale(1)';
            seoulItem.style.opacity = '1';
        } else {
            // 스크롤이 시작되면 SEOUL 숨기기
            seoulItem.classList.remove('active');
            seoulItem.style.transform = 'translateZ(800px) scale(4)';
            seoulItem.style.opacity = '0';
        }
        
        // 최종 명함 표시 여부 확인
        if (scrollProgress >= finalCardStart) {
            // 모든 애니메이션 텍스트 숨기기
            animatedTexts.forEach(item => {
                item.style.transform = 'translateZ(800px) scale(4)';
                item.style.opacity = '0';
            });
            
            // 최종 명함 표시
            finalBusinessCard.classList.add('active');
            
            // 키워드 애니메이션 시작 (더 긴 딜레이)
            setTimeout(() => {
                animateKeywords();
            }, 1500); // 0.5초 → 1.5초로 증가
            
            return;
        } else {
            // 최종 명함 숨기기
            finalBusinessCard.classList.remove('active');
            keywordAnimationStarted = false;
            
            // 모든 애니메이션 리셋
            const cardCenter = document.querySelector('.card-center');
            const mainTitle = document.querySelector('.main-title');
            const subtitle = document.querySelector('.subtitle');
            const contactItems = document.querySelectorAll('.contact-item');
            const addressLine = document.querySelector('.address-line');
            
            cardCenter.classList.remove('show');
            mainTitle.classList.remove('show');
            subtitle.classList.remove('show');
            contactItems.forEach(item => item.classList.remove('show'));
            addressLine.classList.remove('show');
            keywords.forEach(keyword => keyword.classList.remove('show'));
        }
        
        // 애니메이션 텍스트들 처리 (SMART, DYNAMIC, TRADITION, FUTURE)
        // 스크롤 5% 이후부터 시작하도록 조정
        const adjustedProgress = Math.max(0, (scrollProgress - 0.05) / (finalCardStart - 0.05));
        const currentIndex = Math.floor(adjustedProgress / (1 / animatedTexts.length));
        const localProgress = (adjustedProgress % (1 / animatedTexts.length)) / (1 / animatedTexts.length);

        animatedTexts.forEach((item, index) => {
            item.classList.remove('active', 'zoom-in', 'zoom-out');
            
            if (index < currentIndex) {
                // 이미 지나간 텍스트들 - 완전히 사라진 상태
                item.style.transform = 'translateZ(800px) scale(4)';
                item.style.opacity = '0';
            } else if (index === currentIndex && adjustedProgress > 0) {
                // 현재 활성 텍스트 (일직선 효과)
                if (localProgress < 0.3) {
                    // 등장 단계 - 멀리서 가까워짐
                    const t = localProgress / 0.3;
                    const z = -2000 + (2000 * t);
                    const scale = 0.1 + (0.9 * t);
                    const opacity = t;
                    
                    item.style.transform = `translateZ(${z}px) scale(${scale})`;
                    item.style.opacity = opacity;
                } else if (localProgress < 0.65) {
                    // 정면 단계 - 정면에서 안정 (더 오래 유지)
                    item.classList.add('active');
                    item.style.transform = 'translateZ(0px) scale(1)';
                    item.style.opacity = '1';
                } else {
                    // 확대 단계 - 적당히 가까워진 후 사라짐 (너무 가까워지지 않게)
                    const t = (localProgress - 0.65) / 0.35;
                    const z = 0 + (600 * t); // 1500 → 600으로 줄임
                    const scale = 1 + (2.5 * t); // 7 → 2.5로 줄임
                    const opacity = 1 - (t * 1.2); // 더 빨리 사라지게
                    
                    item.style.transform = `translateZ(${z}px) scale(${scale})`;
                    item.style.opacity = Math.max(0, opacity);
                }
            } else if (index === currentIndex + 1 && adjustedProgress > 0) {
                // 다음 텍스트 - 준비 상태
                if (localProgress > 0.75) {
                    const t = (localProgress - 0.75) / 0.25;
                    const z = -2000 + (1200 * t);
                    const scale = 0.1 + (0.4 * t);
                    const opacity = t * 0.6;
                    
                    item.style.transform = `translateZ(${z}px) scale(${scale})`;
                    item.style.opacity = opacity;
                } else {
                    // 대기 상태
                    item.style.transform = 'translateZ(-2000px) scale(0.1)';
                    item.style.opacity = '0';
                }
            } else {
                // 아직 나오지 않은 텍스트들 - 대기 상태
                item.style.transform = 'translateZ(-2000px) scale(0.1)';
                item.style.opacity = '0';
            }
        });
    }

    // 스크롤 인터랙션
    function handleScroll() {
        const scrollY = window.scrollY;
        const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
        const scrollProgress = Math.min(scrollY / maxScroll, 1);
        
        // 3D 텍스트 효과 업데이트
        update3DText(scrollProgress);
        
        // 스크롤이 시작되면 힌트 숨기기
        if (scrollY > 50) {
            scrollHint.style.opacity = '0';
            scrollHint.style.transform = 'translateX(-50%) translateY(20px)';
        } else {
            scrollHint.style.opacity = '1';
            scrollHint.style.transform = 'translateX(-50%) translateY(0)';
        }
        
        // 슬라이드 속도 조정
        const speedVariation = [0.3, 0.5, 0.4, 0.6, 0.7, 0.1]; // 최종 명함에서는 매우 느리게 (0.2 → 0.1)
        const sectionIndex = Math.min(Math.floor(scrollProgress * 6), 5);
        animationSpeed = speedVariation[sectionIndex] || 0.5;
    }

    // 카드 호버 효과
    businessCard.addEventListener('mouseenter', function() {
        this.style.transform = 'scale(1.02)';
        this.style.transition = 'transform 0.3s ease';
        animationSpeed *= 1.5;
    });

    businessCard.addEventListener('mouseleave', function() {
        this.style.transform = 'scale(1)';
        const speedVariation = [0.3, 0.5, 0.4, 0.6, 0.7, 0.1]; // 최종 명함에서는 매우 느리게
        const sectionIndex = Math.min(Math.floor((window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 6), 5);
        animationSpeed = speedVariation[sectionIndex] || 0.5;
    });

    // 페이지 로드 시 카드 등장 애니메이션
    setTimeout(() => {
        businessCard.style.opacity = '0';
        businessCard.style.transform = 'translateY(50px)';
        businessCard.style.transition = 'all 0.8s ease';
        
        requestAnimationFrame(() => {
            businessCard.style.opacity = '1';
            businessCard.style.transform = 'translateY(0)';
        });
    }, 100);

    // 키보드 네비게이션
    document.addEventListener('keydown', function(e) {
        const totalSections = textItems.length + 1; // 텍스트 + 최종 명함
        const currentIndex = Math.floor((window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * totalSections);
        
        if (e.key === 'ArrowDown' && currentIndex < totalSections - 1) {
            const targetScroll = ((currentIndex + 1) / totalSections) * (document.documentElement.scrollHeight - window.innerHeight);
            window.scrollTo({ top: targetScroll, behavior: 'smooth' });
        } else if (e.key === 'ArrowUp' && currentIndex > 0) {
            const targetScroll = ((currentIndex - 1) / totalSections) * (document.documentElement.scrollHeight - window.innerHeight);
            window.scrollTo({ top: targetScroll, behavior: 'smooth' });
        }
    });

    // 스크롤 이벤트 리스너 (성능 최적화)
    let ticking = false;
    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(() => {
                handleScroll();
                ticking = false;
            });
            ticking = true;
        }
    });

    // 성능 최적화
    document.addEventListener('visibilitychange', function() {
        if (document.hidden) {
            stopAnimation();
        } else {
            startAnimation();
        }
    });

    // 윈도우 리사이즈 대응
    window.addEventListener('resize', function() {
        const firstImg = slideTrack.querySelector('.slide-image');
        if (firstImg) {
            const computedStyle = getComputedStyle(firstImg);
            imageWidth = firstImg.offsetWidth + parseInt(computedStyle.marginRight);
        }
    });

    // 초기화
    createImages();
    handleScroll(); // 초기 상태 설정
    
    console.log('Seoul 최종 명함이 로드되었습니다.');
}); 