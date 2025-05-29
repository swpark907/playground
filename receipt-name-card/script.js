document.addEventListener('DOMContentLoaded', function() {
    const printBtn = document.getElementById('printBtn');
    const status = document.getElementById('status');
    const receipt = document.getElementById('receipt');
    const portfolioBtn = document.getElementById('portfolioBtn');
    const receiptLines = document.querySelectorAll('.receipt-line');
    const printer = document.querySelector('.printer');
    const qrSection = document.querySelector('.qr-section');

    let isPrinting = false;

    // 초기 상태 설정
    function initializeReceipt() {
        console.log('Initializing receipt...');
        const receiptContainer = document.querySelector('.receipt-container');
        
        // 모든 클래스 제거
        receiptLines.forEach((line, index) => {
            line.classList.remove('visible');
            // 모든 인라인 스타일 제거
            line.removeAttribute('style');
        });
        
        // 버튼과 상태 초기화
        portfolioBtn.classList.remove('visible');
        portfolioBtn.removeAttribute('style'); // 인라인 스타일 제거
        
        // 영수증과 컨테이너 초기화
        receipt.classList.remove('printing');
        receiptContainer.classList.remove('printing');
        
        // CSS 변수 리셋
        receiptContainer.style.removeProperty('--dynamic-height');
        
        // 프린터 상태 초기화
        printer.classList.remove('status-printing');
        status.textContent = 'READY';
        
        // QR 코드 스타일 초기화
        qrSection.removeAttribute('style');
        
        console.log('Receipt initialized successfully');
    }

    // 프린팅 상태 텍스트 애니메이션
    function animatePrintingStatus() {
        const statuses = ['PRINTING', 'PRINTING.', 'PRINTING..', 'PRINTING...'];
        let index = 0;
        
        const interval = setInterval(() => {
            status.textContent = statuses[index];
            index = (index + 1) % statuses.length;
        }, 300);

        return interval;
    }

    // 영수증 출력 애니메이션 - 순수 위치 변경만
    function printReceiptLines() {
        const printingInterval = animatePrintingStatus();
        const receiptContainer = document.querySelector('.receipt-container');
        
        // 실제 영수증 높이 동적 계산
        const dynamicHeight = calculateReceiptHeight();
        console.log('동적으로 계산된 영수증 높이:', dynamicHeight + 'px');
        
        // 동적 높이 적용
        receiptContainer.style.setProperty('--dynamic-height', dynamicHeight + 'px');
        
        receipt.classList.add('printing');
        receiptContainer.classList.add('printing');
        printer.classList.add('status-printing');

        // 종이가 나오기 시작
        setTimeout(() => {
            console.log('Paper feeding started...');
        }, 500);

        // 출력 완료
        setTimeout(() => {
            clearInterval(printingInterval);
            status.textContent = 'PRINTING...';

            // 모든 라인을 즉시 표시 (어떤 효과도 없음)
            receiptLines.forEach((line, index) => {
                line.classList.add('visible');
            });

            // 완료 처리
            setTimeout(() => {
                portfolioBtn.classList.add('visible');
                status.textContent = 'COMPLETED';
                printer.classList.remove('status-printing');
                isPrinting = false;
                printBtn.disabled = false;
                printBtn.textContent = 'PRINT AGAIN';
                console.log('Printing completed');
            }, 500);
        }, 1000);
    }

    // 프린터 버튼 클릭 이벤트
    printBtn.addEventListener('click', function() {
        if (isPrinting) return;

        isPrinting = true;
        printBtn.disabled = true;
        
        // 재출력인 경우 초기화
        if (printBtn.textContent === 'PRINT AGAIN') {
            console.log('Print Again clicked - reinitializing...');
            initializeReceipt();
            printBtn.textContent = 'PRINT RECEIPT';
            
            // 초기화 후 잠시 대기 (애니메이션 완료 기다림)
            setTimeout(() => {
                printReceiptLines();
            }, 100);
        } else {
            // 첫 번째 프린팅
            printReceiptLines();
        }
    });

    // QR코드 클릭 이벤트
    qrSection.addEventListener('click', function() {
        // 포트폴리오 버튼과 동일한 동작
        const cafeUrl = 'https://www.instagram.com/cafe_barista_kim'; // 예시 URL
        
        // QR코드 클릭 효과
        qrSection.style.transform = 'scale(0.95)';
        setTimeout(() => {
            qrSection.style.transform = 'scale(1)';
            qrSection.style.transition = 'transform 0.2s ease';
            // window.open(cafeUrl, '_blank'); // 실제 구현시 주석 해제
            alert('QR코드를 스캔하세요! 📱\n' + cafeUrl);
        }, 150);
    });

    // 포트폴리오 버튼 클릭 이벤트
    portfolioBtn.addEventListener('click', function() {
        // 실제 구현에서는 카페 웹사이트로 이동
        const cafeUrl = 'https://www.instagram.com/cafe_barista_kim'; // 예시 URL
        
        // 버튼 클릭 효과
        portfolioBtn.style.transform = 'scale(0.95)';
        setTimeout(() => {
            portfolioBtn.style.transform = 'scale(1)';
            // window.open(cafeUrl, '_blank'); // 실제 구현시 주석 해제
            alert('우리 카페에 놀러오세요! ☕\n' + cafeUrl);
        }, 150);
    });

    // 키보드 단축키 (스페이스바로 프린트)
    document.addEventListener('keydown', function(e) {
        if (e.code === 'Space' && !isPrinting) {
            e.preventDefault();
            printBtn.click();
        }
    });

    // 프린터 LED 깜빡임 제어
    function controlPrinterLED() {
        const led = document.querySelector('.printer-light');
        
        if (printer.classList.contains('status-printing')) {
            led.style.animationDuration = '0.3s';
            led.style.background = '#ff6b00';
            led.style.boxShadow = '0 0 10px #ff6b00';
        } else {
            led.style.animationDuration = '2s';
            led.style.background = '#00ff00';
            led.style.boxShadow = '0 0 10px #00ff00';
        }
    }

    // 상태 변화 감지 및 LED 제어
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                controlPrinterLED();
            }
        });
    });

    observer.observe(printer, { 
        attributes: true, 
        attributeFilter: ['class'] 
    });

    // 페이지 로드 완료 후 초기화
    initializeReceipt();
    status.textContent = 'READY';

    // 부드러운 로딩 효과
    setTimeout(() => {
        const container = document.querySelector('.container');
        container.style.opacity = '1';
        container.style.transform = 'translateY(0)';
        container.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
    }, 100);

    // 영수증 높이 동적 계산 함수
    function calculateReceiptHeight() {
        // 임시로 receipt를 보이게 해서 실제 높이 측정
        const tempTransform = receipt.style.transform;
        receipt.style.transform = 'translateY(0)';
        receipt.style.visibility = 'hidden'; // 화면에는 안보이게
        
        const actualHeight = receipt.scrollHeight + 40; // 여백 포함
        
        // 원래 상태로 복구
        receipt.style.transform = tempTransform;
        receipt.style.visibility = 'visible';
        
        return actualHeight;
    }
}); 