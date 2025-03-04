// typed animation

// Typed Animation Settings
const TYPED_ANIMATION_CONFIG = {
  // 여기에서 설정을 변경하세요
  texts: ["안녕하세요", "저는 프론트엔드 개발자입니다", "만나서 반가워요"], // 표시할 텍스트 목록
  typingSpeed: 100,         // 타이핑 속도 (ms)
  deleteSpeed: 100,         // 삭제 속도 (ms)
  delayAfterTyping: 1000,   // 타이핑 후 대기 시간 (ms)
  delayAfterDelete: 500,    // 삭제 후 대기 시간 (ms)
  cursorSettings: {
    width: "2px",           // 커서 너비
    height: "4rem",         // 커서 높이
    color: "white",         // 커서 색상
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
  let state = "type";
  let timeoutId = null;

  // 타이핑될 텍스트를 표시할 요소 생성
  const typedContent = document.createElement("div");
  typedContent.className = "typed-content";
  container.appendChild(typedContent);

  // 커서 요소 생성
  const cursor = document.createElement("div");
  cursor.className = "cursor";
  cursor.style.backgroundColor = TYPED_ANIMATION_CONFIG.cursorSettings.color;
  cursor.style.width = TYPED_ANIMATION_CONFIG.cursorSettings.width;
  cursor.style.height = TYPED_ANIMATION_CONFIG.cursorSettings.height;
  container.appendChild(cursor);

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
        state = "type";
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
        state = "delete";
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

  // 커서 깜빡임 설정
  setInterval(() => {
    cursor.style.opacity = cursor.style.opacity === "0" ? "1" : "0";
  }, TYPED_ANIMATION_CONFIG.cursorSettings.blinkSpeed);

  // 애니메이션 시작
  typeText();
}

// 페이지 로드 시 애니메이션 초기화
document.addEventListener('DOMContentLoaded', initTypedAnimation);
// initTypedAnimation();
