# 🧵 Zipper Business Card

패션 디자이너를 위한 인터랙티브 지퍼 명함 프로젝트입니다. 실제 지퍼를 연상시키는 인터페이스로 사용자가 드래그하여 명함의 확장 콘텐츠를 열어볼 수 있습니다.

## ✨ 주요 기능

### 🎨 디자인 특징
- **네온 지퍼 효과**: 형광색(#ccff00) 지퍼가 실제처럼 중앙에서 갈라지며 열립니다
- **코드 패턴**: 지퍼 위에 코드스러운 문자열 패턴(`{}`, `[]`, `:::` 등)이 애니메이션됩니다
- **고급스러운 다크 테마**: 남색 계열 그라디언트 배경으로 고급스러운 느낌을 연출합니다
- **3D 지퍼 핸들**: 입체감 있는 지퍼 손잡이 디자인

### 🎯 인터랙션
- **드래그 열기**: 지퍼를 아래로 드래그하여 포트폴리오 섹션을 펼칠 수 있습니다
- **클릭 토글**: 간단한 클릭으로도 지퍼를 열고 닫을 수 있습니다
- **점진적 애니메이션**: 드래그 거리에 따라 지퍼가 점진적으로 벌어집니다
- **부드러운 트랜지션**: `cubic-bezier` 함수를 사용한 자연스러운 애니메이션

### 📱 반응형 & 접근성
- **모바일 터치 지원**: 터치 드래그 제스처 완벽 지원
- **키보드 네비게이션**: Tab, Enter, Space 키로 조작 가능
- **스크린 리더 지원**: ARIA 라벨과 시맨틱 HTML 사용
- **햅틱 피드백**: 모바일에서 진동 피드백 제공

### ⚡ 성능 최적화
- **Intersection Observer**: 스크롤 성능 최적화
- **will-change 관리**: GPU 가속 최적화
- **이미지 레이지 로딩**: 성능 향상을 위한 지연 로딩
- **디바운스/스로틀**: 이벤트 처리 최적화

## 🚀 사용 방법

### 기본 사용법
1. 지퍼 영역을 마우스로 아래로 드래그하거나 클릭합니다
2. 명함이 확장되면서 포트폴리오 섹션이 나타납니다
3. 다시 지퍼를 클릭하면 명함이 접힙니다

### 키보드 사용법
- `Tab`: 지퍼로 포커스 이동
- `Enter` 또는 `Space`: 지퍼 열기/닫기

## 📁 파일 구조

```
zipper-card/
├── index.html          # 메인 HTML 파일
├── style.css           # 스타일시트
├── script.js           # JavaScript 로직
└── README.md          # 프로젝트 문서
```

## 🎨 커스터마이징

### 색상 변경
```css
/* CSS에서 주요 색상 변수들 */
--neon-color: #ccff00;        /* 형광 지퍼 색상 */
--background-start: #0a0f1c;  /* 배경 그라디언트 시작 */
--background-end: #141e30;    /* 배경 그라디언트 끝 */
--card-background: #101526;   /* 카드 배경 */
```

### 명함 정보 수정
```html
<!-- HTML에서 명함 정보 섹션 -->
<h1 class="logo">YOUR BRAND</h1>
<h2 class="designer-name">Your Name</h2>
<address class="contact">
  <p>📍 Your Address</p>
  <p>📞 <a href="tel:+1234567890">Your Phone</a></p>
  <p>✉️ <a href="mailto:your@email.com">your@email.com</a></p>
</address>
```

### 포트폴리오 항목 추가
```html
<article class="article" role="article">
  <img src="your-image.jpg" alt="프로젝트 설명" loading="lazy" />
  <h4>프로젝트 제목</h4>
  <p><time datetime="2024-01-01">2024.01.01</time></p>
</article>
```

## 🔧 개발자 옵션

### 애니메이션 속도 조정
```javascript
// script.js에서 임계값 수정
this.OPEN_THRESHOLD = 80;        // 열림 임계값 (픽셀)
this.MAX_DRAG_DISTANCE = 150;    // 최대 드래그 거리
```

### CSS 트랜지션 시간 변경
```css
.card {
  transition: height 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}
```

## 🌐 브라우저 지원

- ✅ Chrome 60+
- ✅ Firefox 55+
- ✅ Safari 12+
- ✅ Edge 79+
- ✅ iOS Safari 12+
- ✅ Android Chrome 60+

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.

## 🙏 크레딧

- **폰트**: Helvetica Neue, Courier Prime (Google Fonts)
- **이미지**: Unsplash (고품질 무료 이미지)
- **아이콘**: Unicode 이모지

---

Made with ❤️ for creative professionals 