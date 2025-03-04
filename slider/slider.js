/**
 * 텍스트 슬라이더 - 웹플로우 사용자를 위한 간편 설정
 * 
 * 사용자 설정 영역 - 아래 값들을 필요에 따라 수정하세요
 */

const SLIDER_CONFIG = {
  // 슬라이더에 표시할 텍스트 배열
  contents: ["편안함을", "안락함을", "행복함을", "즐거움을"],
  
  // 슬라이드 변경 간격 (밀리초)
  interval: 2000,
  
  // 애니메이션 속도 (밀리초)
  animationSpeed: 500,
  
  // 슬라이더 텍스트 스타일
  textStyle: {
    fontSize: "",          // 텍스트 크기 (비워두면 prefix와 동일한 크기 사용)
  },
  
  // 슬라이더 선택자 (변경 필요 없음)
  selector: '.slider',
  
  // 슬라이더 컨테이너 선택자 (변경 필요 없음)
  containerSelector: '.slider-container',
  
  // prefix 선택자 (변경 필요 없음)
  prefixSelector: '.prefix',

  // 텍스트의 타입이 대문자인지 소문자인지
  isUpperCase: "capitalize", // "uppercase" | "none" | "capitalize" | "lowercase"| "initial" | "inherit"
  
  // 슬라이더 컨테이너 추가 여백 (px)
  containerPadding: 20
};

// 슬라이더 초기화 및 실행 (이 아래 코드는 수정하지 않아도 됩니다)
(function() {
  // DOM 요소 참조 및 유효성 검사를 위한 함수
  function initializeElements() {
    const elements = {
      slider: document.querySelector(SLIDER_CONFIG.selector),
      sliderContainer: document.querySelector(SLIDER_CONFIG.containerSelector),
      prefix: document.querySelector(SLIDER_CONFIG.prefixSelector)
    };
    
    if (!elements.slider || !elements.sliderContainer || !elements.prefix) {
      throw new Error('필요한 요소를 찾을 수 없습니다.');
    }
    
    // 슬라이더 ul에 width: 100% 적용
    elements.slider.style.width = '100%';
    
    return elements;
  }
  
  // prefix 스타일 정보 가져오기
  function getPrefixStyles(prefix) {
    const prefixStyles = window.getComputedStyle(prefix);
    const styles = {
      fontSize: prefixStyles.fontSize,
      lineHeight: prefixStyles.lineHeight
    };
    
    console.log('Prefix 스타일:', styles);
    return styles;
  }
  
  // 콘텐츠의 최대 너비 계산
  function calculateMaxContentWidth(contents, prefixStyles) {
    // 임시 요소를 생성하여 최대 너비 계산
    const tempDiv = document.createElement('div');
    tempDiv.style.position = 'absolute';
    tempDiv.style.visibility = 'hidden';
    tempDiv.style.whiteSpace = 'nowrap';
    
    // prefix의 스타일을 기본으로 적용
    tempDiv.style.fontSize = prefixStyles.fontSize;
    tempDiv.style.lineHeight = prefixStyles.lineHeight;

    // 사용자 정의 스타일 적용
    if (SLIDER_CONFIG.textStyle.fontSize) {
      tempDiv.style.fontSize = SLIDER_CONFIG.textStyle.fontSize;
    }
    
    document.body.appendChild(tempDiv);
    
    // 각 콘텐츠의 너비 계산
    let maxWidth = 0;
    contents.forEach(content => {
      tempDiv.textContent = content;
      const width = tempDiv.getBoundingClientRect().width;
      if (width > maxWidth) {
        maxWidth = width;
      }
    });
    
    // 임시 요소 제거
    document.body.removeChild(tempDiv);
    
    console.log('최대 너비:', maxWidth);
    return maxWidth;
  }
  
  // 슬라이더 아이템 생성
  function createSliderItems(elements, prefixStyles) {
    const { slider, sliderContainer, prefix } = elements;
    
    // 기존 내용 제거
    slider.innerHTML = '';
    
    // 최대 너비 계산
    const maxWidth = calculateMaxContentWidth(SLIDER_CONFIG.contents, prefixStyles);
    
    // 슬라이더 컨테이너 스타일 설정
    sliderContainer.style.display = 'inline-block';
    
    // 각 콘텐츠에 대해 슬라이더 아이템 생성
    SLIDER_CONFIG.contents.forEach((content, index) => {
      const sliderItem = document.createElement('li');
      sliderItem.className = 'slider-item';
      sliderItem.textContent = content;
      sliderItem.style.textTransform = SLIDER_CONFIG.isUpperCase;
      
      // prefix의 스타일을 기본으로 적용
      sliderItem.style.lineHeight = prefixStyles.lineHeight;
      
      // 사용자 정의 스타일 적용 (설정된 경우에만)
      if (SLIDER_CONFIG.textStyle.fontSize) {
        sliderItem.style.fontSize = SLIDER_CONFIG.textStyle.fontSize;
      }
      
      // 첫 번째 아이템만 활성화
      if (index === 0) {
        sliderItem.classList.add('active');
      }
      
      // 슬라이더에 아이템 추가
      slider.appendChild(sliderItem);
    });
    
    // prefix와 slider의 높이 정렬
    const prefixHeight = prefix.offsetHeight;
    sliderContainer.style.height = prefixHeight + 'px';
    
    // 애니메이션 속도 설정
    const sliderItems = slider.querySelectorAll('.slider-item');
    sliderItems.forEach(item => {
      item.style.transition = `all ${SLIDER_CONFIG.animationSpeed / 1000}s ease`;
    });
  }
  
  // 슬라이더 애니메이션 함수
  function animateSlider(slider) {
    let currentIndex = 0;
    
    return setInterval(() => {
      // 현재 활성화된 아이템 비활성화
      const currentItem = slider.querySelector('.slider-item.active');
      if (!currentItem) return;
      
      currentItem.classList.remove('active');
      currentItem.classList.add('slide-out');
      
      // 다음 인덱스 계산
      currentIndex = (currentIndex + 1) % SLIDER_CONFIG.contents.length;
      
      // 다음 아이템 활성화
      const nextItem = slider.querySelectorAll('.slider-item')[currentIndex];
      if (nextItem) {
        nextItem.classList.add('active');
      }
      
      // 애니메이션 종료 후 클래스 제거
      setTimeout(() => {
        currentItem.classList.remove('slide-out');
      }, SLIDER_CONFIG.animationSpeed);
    }, SLIDER_CONFIG.interval);
  }
  
  // 슬라이더 초기화 함수
  function initSlider() {
    try {
      const elements = initializeElements();
      const prefixStyles = getPrefixStyles(elements.prefix);
      
      createSliderItems(elements, prefixStyles);
      
      // 약간의 지연 후 애니메이션 시작 (너비 계산이 완료되도록)
      setTimeout(() => animateSlider(elements.slider), 100);
    } catch (error) {
      console.error('슬라이더 초기화 오류:', error);
    }
  }
  
  // DOM이 로드된 후 슬라이더 초기화
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSlider);
  } else {
    initSlider();
  }
})();

