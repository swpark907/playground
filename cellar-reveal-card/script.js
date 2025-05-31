document.addEventListener('DOMContentLoaded', function() {
    const wineSlots = document.querySelectorAll('.wine-slot');
    const cardInner = document.querySelector('.card-inner');
    let removedBottles = 0;
    const totalBottles = wineSlots.length;
    
    wineSlots.forEach(slot => {
        const wineBottle = slot.querySelector('.wine-bottle');
        let isRevealed = false;
        
        // 와인 슬롯 클릭 이벤트
        slot.addEventListener('click', function(e) {
            e.preventDefault();
            
            if (!isRevealed) {
                revealCard(slot, wineBottle);
                isRevealed = true;
                removedBottles++;
                
                // 모든 와인병이 제거되었는지 확인
                if (removedBottles === totalBottles) {
                    setTimeout(() => {
                        flipToBusinessCard();
                    }, 1200); // 마지막 와인병이 사라진 후 0.2초 대기
                }
            }
        });
    });
    
    function revealCard(slot, wineBottle) {
        // 와인병이 사라지는 애니메이션 시작
        wineBottle.classList.add('bottle-disappearing');
        
        // 1초 후 와인병 완전히 숨기기
        setTimeout(() => {
            wineBottle.style.display = 'none';
            
            // 슬롯의 호버 효과 비활성화
            slot.style.cursor = 'default';
            slot.style.pointerEvents = 'none';
        }, 1000);
    }
    
    function flipToBusinessCard() {
        // 카드 전체를 뒤집기
        cardInner.classList.add('flipped');
    }
    
    // 키보드 접근성 추가
    wineSlots.forEach((slot, index) => {
        slot.setAttribute('tabindex', '0');
        slot.setAttribute('role', 'button');
        slot.setAttribute('aria-label', `와인 슬롯 ${index + 1} - 클릭하여 와인병 제거`);
        
        slot.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.click();
            }
        });
    });
    
    // 미묘하게 다른 레드 와인 색상들 (모두 와인색 계열)
    function getWineColor() {
        const wineColors = [
            // 클래식 레드 와인
            'radial-gradient(circle at 30% 30%, #722F37 0%, #8B0000 20%, #A52A2A 40%, #B22222 60%, #8B0000 80%, #654321 100%)',
            // 진한 레드 와인
            'radial-gradient(circle at 30% 30%, #800020 0%, #8B0000 20%, #A0522D 40%, #B22222 60%, #8B1538 80%, #654321 100%)',
            // 부르고뉴 와인
            'radial-gradient(circle at 30% 30%, #722F37 0%, #800020 20%, #A52A2A 40%, #CD5C5C 60%, #8B0000 80%, #654321 100%)',
            // 메를로 와인
            'radial-gradient(circle at 30% 30%, #6B2737 0%, #8B0000 20%, #B22222 40%, #A52A2A 60%, #800020 80%, #654321 100%)',
            // 카베르네 와인
            'radial-gradient(circle at 30% 30%, #722F37 0%, #8B1538 20%, #A52A2A 40%, #B22222 60%, #8B0000 80%, #5D4037 100%)',
            // 피노 누아
            'radial-gradient(circle at 30% 30%, #7A2E37 0%, #8B0000 20%, #CD5C5C 40%, #B22222 60%, #A0522D 80%, #654321 100%)',
            // 시라 와인
            'radial-gradient(circle at 30% 30%, #722F37 0%, #800020 20%, #8B0000 40%, #A52A2A 60%, #B22222 80%, #654321 100%)',
            // 말벡 와인
            'radial-gradient(circle at 30% 30%, #6B1F37 0%, #8B0000 20%, #A52A2A 40%, #B22222 60%, #800020 80%, #654321 100%)',
            // 템프라니요 와인
            'radial-gradient(circle at 30% 30%, #722F37 0%, #8B1538 20%, #B22222 40%, #A52A2A 60%, #8B0000 80%, #654321 100%)'
        ];
        return wineColors[Math.floor(Math.random() * wineColors.length)];
    }
    
    // 각 와인병 바닥에 와인 색상 적용
    const bottleBottoms = document.querySelectorAll('.bottle-bottom');
    bottleBottoms.forEach(bottom => {
        bottom.style.background = `
            radial-gradient(circle at center, 
                rgba(0, 0, 0, 0.4) 0%, 
                rgba(0, 0, 0, 0.2) 30%, 
                transparent 35%),
            ${getWineColor()}
        `;
    });
    
    // 배경 이미지가 로드되지 않을 경우를 대비한 폴백
    const wineRackBg = document.querySelector('.wine-rack-background');
    
    // 여러 경로로 이미지 로딩 시도
    const imagePaths = [
        'assets/wine-rack.png',
        './assets/wine-rack.png',
        'wine-rack.png'
    ];
    
    let imageLoaded = false;
    
    function tryLoadImage(index) {
        if (index >= imagePaths.length) {
            console.log('모든 이미지 경로 시도 완료. CSS 폴백 패턴을 사용합니다.');
            return;
        }
        
        const img = new Image();
        img.onload = function() {
            console.log(`와인 랙 배경 이미지가 성공적으로 로드되었습니다: ${imagePaths[index]}`);
            wineRackBg.style.backgroundImage = `url('${imagePaths[index]}')`;
            imageLoaded = true;
        };
        img.onerror = function() {
            console.log(`이미지 로드 실패: ${imagePaths[index]}`);
            tryLoadImage(index + 1);
        };
        img.src = imagePaths[index];
    }
    
    // 이미지 로딩 시작
    tryLoadImage(0);
    
    // 2초 후에도 이미지가 로드되지 않으면 CSS 패턴 사용
    setTimeout(() => {
        if (!imageLoaded) {
            console.log('이미지 로딩 타임아웃. CSS 다이아몬드 패턴을 사용합니다.');
            wineRackBg.style.backgroundImage = `
                linear-gradient(45deg, transparent 40%, rgba(139, 69, 19, 0.8) 45%, rgba(139, 69, 19, 0.8) 55%, transparent 60%),
                linear-gradient(-45deg, transparent 40%, rgba(139, 69, 19, 0.8) 45%, rgba(139, 69, 19, 0.8) 55%, transparent 60%),
                linear-gradient(135deg, #8B4513, #A0522D)
            `;
            wineRackBg.style.backgroundSize = '150px 150px, 150px 150px, cover';
        }
    }, 2000);
}); 