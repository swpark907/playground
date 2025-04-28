// typed animation

// Typed Animation Settings
const TYPED_ANIMATION_CONFIG = {
  // 여기에서 설정을 변경하세요
  texts: ["안녕하세요", "뫙뭉 블로그입니다", "환영합니다"], // 표시할 텍스트 목록
  typingSpeed: 100,         // 타이핑 속도 (ms)
  deleteSpeed: 100,         // 삭제 속도 (ms)
  delayAfterTyping: 1000,   // 타이핑 후 대기 시간 (ms)
  delayAfterDelete: 500,    // 삭제 후 대기 시간 (ms)
  cursorSettings: {
    cursorOn: true,
    blinkSpeed: 500         // 커서 깜빡임 속도 (ms)
  }
};

// Webflow 요소 선택자 설정
const TYPED_ANIMATION_SELECTORS = {
  container: ".typed-container"  // 타이핑 애니메이션이 들어갈 컨테이너의 클래스명
};

// 아래 코드는 수정하지 마세요
function initTypedAnimation() {
  const container = document.querySelector(TYPED_ANIMATION_SELECTORS.container);
  if (!container) {
    console.error(`${TYPED_ANIMATION_SELECTORS.container} 요소를 찾을 수 없습니다.`);
    return;
  }

  let index = 0;
  let contentCount = 0;
  let timeoutId = null;

  // 타이핑될 텍스트를 표시할 요소 생성
  const typedContent = document.createElement("div");
  typedContent.className = "typed-content";
  container.appendChild(typedContent);

  
  function deleteText() {
    if (timeoutId){
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      if (index > 0) {
        typedContent.textContent = typedContent.textContent.slice(0, -1);
        index--;
        deleteText();
      } else {
        setTimeout(() => {
          typeText();
        }, TYPED_ANIMATION_CONFIG.delayAfterDelete);
      }
    }, TYPED_ANIMATION_CONFIG.deleteSpeed);
  }

  function typeText() {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      if (index < TYPED_ANIMATION_CONFIG.texts[contentCount].length) {
        typedContent.textContent += TYPED_ANIMATION_CONFIG.texts[contentCount][index];
        index++;
        typeText();
      } else {
        setTimeout(() => {
          deleteText();
        }, TYPED_ANIMATION_CONFIG.delayAfterTyping);
        if (contentCount < TYPED_ANIMATION_CONFIG.texts.length - 1) {
          contentCount++;
        } else {
          contentCount = 0;
        }
      }
    }, TYPED_ANIMATION_CONFIG.typingSpeed);
  }

  // 커서 요소 생성 및 깜빡임 애니메이션 설정

  if (TYPED_ANIMATION_CONFIG.cursorSettings.cursorOn) {
    const cursor = document.createElement("div");
    cursor.className = "cursor";
    container.appendChild(cursor);

    setInterval(() => {
      cursor.style.opacity = cursor.style.opacity === "0" ? "1" : "0";  
    }, TYPED_ANIMATION_CONFIG.cursorSettings.blinkSpeed);
  }

  // 애니메이션 시작
  typeText();
}

// 페이지 로드 시 애니메이션 초기화
document.addEventListener('DOMContentLoaded', initTypedAnimation);
// initTypedAnimation();
