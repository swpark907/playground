# 🎴 흩어지는 명함 효과

animejs를 사용하여 만든 인터랙티브한 명함 흩어지는 효과입니다.

## ✨ 주요 기능

- **그리드 분할**: 명함을 격자로 분할하여 세밀한 효과 구현
- **마우스 인터랙션**: 마우스 오버 시 격자들이 랜덤하게 흩어지는 애니메이션
- **부드러운 복귀**: 마우스를 떼면 원래 모양으로 부드럽게 복귀
- **로딩 애니메이션**: 페이지 로딩 시 격자들이 중앙에서부터 나타나는 효과
- **키보드 단축키**: 스페이스바로 언제든 리셋 가능
- **터치 지원**: 모바일 디바이스에서도 터치로 작동
- **실시간 커스터마이징**: 크기, 그리드, 애니메이션 범위 조절 가능
- **CSS 변수 기반**: 색상, 텍스트, 위치 등을 코드로 쉽게 수정 가능

## 🎯 사용법

1. **기본 인터랙션**
   - 명함 위에 마우스를 올리면 격자들이 흩어집니다
   - 마우스를 떼면 자동으로 원래 모양으로 돌아갑니다

2. **리셋 기능**
   - 하단의 "리셋" 버튼 클릭
   - 스페이스바 키 누르기

3. **실시간 커스터마이징**
   - 오른쪽 패널에서 명함 크기, 그리드 설정, 흩어지는 범위 조절
   - 슬라이더를 움직이면 즉시 반영됩니다

4. **모바일**
   - 명함을 터치하면 흩어지는 효과가 나타납니다
   - 2초 후 자동으로 리셋됩니다

## 🛠️ 기술 스택

- **HTML5**: 기본 구조
- **CSS3**: CSS 변수 기반 스타일링 및 그리드 레이아웃
- **JavaScript**: 동적 그리드 생성 및 이벤트 처리
- **Anime.js**: 부드러운 애니메이션 효과

## 📋 파일 구조

```
scattered-business-card/
├── index.html          # 메인 HTML 파일
├── style.css           # 스타일시트
├── script.js           # JavaScript 로직
└── README.md           # 프로젝트 설명
```

## 🎨 커스터마이징

### CSS 변수로 직접 수정하기

`style.css`의 `:root` 섹션에서 다음 변수들을 수정할 수 있습니다:

```css
:root {
    /* 명함 크기 */
    --card-width: 400px;
    --card-height: 250px;
    --card-border-radius: 15px;
    
    /* 명함 색상 */
    --card-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
    --card-shadow: 0 15px 35px rgba(0,0,0,0.3);
    
    /* 명함 텍스트 */
    --card-content: 'JOHN DOE\A Senior Web Developer\A \A 📧 john@example.com\A 📞 +82-10-1234-5678\A 🌐 www.johndoe.com';
    --card-text-color: white;
    --card-text-size: 14px;
    --card-text-line-height: 1.6;
    --card-text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
    
    /* 그리드 설정 */
    --grid-cols: 16;
    --grid-rows: 10;
    
    /* 애니메이션 설정 */
    --scatter-range: 0.3;
    --scatter-duration: 800ms;
    --gather-duration: 1000ms;
    --float-range: 30px;
}
```

### 실시간 컨트롤 패널

- **명함 크기**: 너비와 높이를 300-600px, 200-400px 범위에서 조절
- **그리드 설정**: 8-24열, 6-16행으로 조각 개수 조절
- **흩어지는 범위**: 화면 대비 20-50% 범위에서 조절

### 텍스트 내용 변경하기

CSS 변수 `--card-content`에서 `\A`는 줄바꿈을 의미합니다:

```css
--card-content: '홍길동\A 프론트엔드 개발자\A \A 📧 gildong@example.com\A 📞 010-1234-5678';
```

### 색상 테마 변경하기

그라데이션을 변경하여 다양한 테마를 만들 수 있습니다:

```css
/* 바다 테마 */
--card-gradient: linear-gradient(135deg, #00c6ff 0%, #0072ff 100%);

/* 석양 테마 */
--card-gradient: linear-gradient(135deg, #ff7e5f 0%, #feb47b 100%);

/* 단색 */
--card-gradient: #2c3e50;
```

## 🚀 실행 방법

1. 모든 파일을 웹 서버에 업로드하거나
2. `index.html` 파일을 브라우저에서 직접 열어주세요

## 📱 브라우저 지원

- Chrome (권장)
- Firefox
- Safari
- Edge
- 모바일 브라우저

## 🔧 개발자 도구

브라우저 콘솔에서 다음 명령어를 사용할 수 있습니다:

```javascript
cardUtils.scatter()      // 강제로 흩어뜨리기
cardUtils.gather()       // 강제로 모으기
cardUtils.reset()        // 즉시 리셋
cardUtils.resetToDefault() // 기본값으로 리셋
cardUtils.pieceCount()   // 조각 개수 확인
cardUtils.isScattered()  // 흩어진 상태 확인
```

---

💡 **팁**: CSS 변수를 수정하면 실시간으로 효과가 반영됩니다. 다양한 색상과 크기로 실험해보세요! 