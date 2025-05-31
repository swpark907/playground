document.addEventListener('DOMContentLoaded', function() {
    const symbols = document.querySelectorAll('.symbol');
    const description = document.getElementById('description');
    
    // 현재 활성화된 기호를 추적
    let activeSymbol = null;
    
    symbols.forEach(symbol => {
        symbol.addEventListener('click', function() {
            // 이전에 활성화된 기호가 있다면 비활성화
            if (activeSymbol) {
                activeSymbol.classList.remove('active');
            }
            
            // 현재 클릭된 기호를 활성화
            this.classList.add('active');
            activeSymbol = this;
            
            // 설명 텍스트 변경 (페이드 효과와 함께)
            const newDescription = this.getAttribute('data-description');
            
            // 페이드 아웃
            description.classList.add('fade-out');
            
            // 텍스트 변경 후 페이드 인
            setTimeout(() => {
                description.textContent = newDescription;
                description.classList.remove('fade-out');
                description.classList.add('fade-in');
                
                // fade-in 클래스는 애니메이션 완료 후 제거
                setTimeout(() => {
                    description.classList.remove('fade-in');
                }, 400);
            }, 200);
        });
        
        // 호버 효과 개선 (활성화된 기호가 아닐 때만)
        symbol.addEventListener('mouseenter', function() {
            if (!this.classList.contains('active')) {
                this.style.transform = 'scale(1.1)';
            }
        });
        
        symbol.addEventListener('mouseleave', function() {
            if (!this.classList.contains('active')) {
                this.style.transform = 'scale(1)';
            }
        });
    });
    
    // 키보드 접근성 추가
    symbols.forEach((symbol, index) => {
        symbol.setAttribute('tabindex', '0');
        symbol.setAttribute('role', 'button');
        symbol.setAttribute('aria-label', `기호 ${symbol.textContent}: ${symbol.getAttribute('data-description')}`);
        
        symbol.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.click();
            }
        });
    });
    
    // 초기 상태 설정
    description.classList.add('fade-in');
}); 