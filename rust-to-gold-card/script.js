// DOM 요소 선택
const businessCard = document.getElementById('businessCard');

// 애니메이션 상태 추적
let isTransforming = false;

// 명함 클릭 이벤트 리스너
businessCard.addEventListener('click', function() {
    // 이미 애니메이션이 진행 중이면 리셋
    if (isTransforming) {
        resetTransformation();
        return;
    }
    
    // 애니메이션 시작
    startTransformation();
});

// 변환 애니메이션 시작 함수
function startTransformation() {
    isTransforming = true;
    
    // 변환 클래스 추가
    businessCard.classList.add('transforming');
    
    // 10초 후 애니메이션 완료 처리
    setTimeout(() => {
        completeTransformation();
    }, 10000);
}

// 변환 완료 처리 함수
function completeTransformation() {
    isTransforming = false;
    // 애니메이션이 완료되면 클릭으로 리셋 가능
}

// 리셋 함수
function resetTransformation() {
    // 변환 클래스 제거
    businessCard.classList.remove('transforming');
    isTransforming = false;
}

// 키보드 이벤트 (스페이스바로도 실행 가능)
document.addEventListener('keydown', function(event) {
    if (event.code === 'Space') {
        event.preventDefault();
        if (isTransforming) {
            resetTransformation();
        } else {
            startTransformation();
        }
    }
});

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', function() {
    console.log('Rust to Gold 명함이 준비되었습니다!');
    console.log('명함을 클릭하거나 스페이스바를 눌러 변화를 확인해보세요.');
}); 