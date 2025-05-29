# 🗺️ 마라우더의 지도 명함 (Marauder's Map Business Card)

해리포터의 마라우더의 지도를 모티브로 한 인터랙티브 명함입니다.

## ✨ 특징

### 🎨 디자인
- **양피지 질감**: 오래된 마법의 양피지 느낌
- **마라우더의 지도 스타일**: 원작의 디자인을 충실히 재현
- **고풍스러운 폰트**: Cinzel, Cinzel Decorative, Uncial Antiqua 사용
- **마법적 색상**: 갈색, 세피아 톤의 따뜻한 색감
- **3D 효과**: 미묘한 원근감과 그림자 효과

### 🎯 인터랙티브 기능
- **마우스 추적**: 마우스 움직임을 실시간으로 추적
- **지연된 발자국**: 1초 딜레이로 과거 위치에 발자국 생성
- **방향성 발자국**: 발가락이 마우스 방향을 향하도록 회전
- **마법 입자**: 황금색 마법 입자들이 천천히 떨어짐
- **호버 효과**: 마우스 오버 시 마법적 글로우 효과
- **터치 지원**: 모바일 기기에서도 동일한 인터랙션

### 📱 반응형 디자인
- 다양한 화면 크기에 최적화
- 모바일 터치 이벤트 지원
- 비율 유지하며 크기 조절

## 🛠️ 기술 스택

- **HTML5**: 시맨틱 마크업
- **CSS3**: 
  - Flexbox 레이아웃
  - CSS Grid
  - 고급 애니메이션
  - 복잡한 그라데이션과 그림자
- **JavaScript (ES6+)**:
  - 마우스/터치 이벤트 처리
  - 실시간 위치 추적
  - 동적 DOM 조작
  - 타이머 기반 애니메이션

## 📁 파일 구조

```
marauders-map-card/
├── index.html          # 메인 HTML 파일
├── style.css           # 스타일시트
├── script.js           # JavaScript 로직
└── README.md           # 프로젝트 설명
```

## 🎮 사용법

1. 웹 브라우저에서 `index.html` 파일을 열기
2. 마우스를 명함 위에서 움직이기
3. 1초 후 과거 위치에 발자국이 나타나는 것을 관찰
4. 호버 효과와 마법 입자들 감상하기

## 🎨 디자인 요소

### 마라우더의 지도 원작 요소
- **제작자 서명**: "Messrs Moony, Wormtail, Padfoot, and Prongs"
- **부제**: "Purveyors of Aids to Magical Mischief-Makers"
- **활성화 주문**: "I solemnly swear that I am up to no good"
- **비활성화 주문**: "Mischief managed"

### 명함 정보
- **이름**: Jinwoo Lee
- **직책**: Frontend Developer
- **슬로건**: "코드로 마법을 만드는 개발자"
- **연락처**: 
  - Owl Post (이메일)
  - Floo Network (전화)
  - Magical Repository (GitHub)

## 🔧 커스터마이징

### 개인 정보 수정
`index.html`에서 다음 부분을 수정하세요:

```html
<h2 class="wizard-name">Your Name</h2>
<p class="wizard-title">Your Title</p>
<p class="wizard-house">"Your Motto"</p>
```

### 연락처 정보 수정
```html
<span class="contact-value">your.email@example.com</span>
<span class="contact-value">+82-10-0000-0000</span>
<span class="contact-value">github.com/yourusername</span>
```

### 색상 테마 변경
`style.css`에서 CSS 변수를 수정하여 색상을 변경할 수 있습니다.

## 🌟 특별한 기능들

### 고급 마우스 추적
- 0.25초마다 마우스 위치 기록
- 1초 딜레이로 과거 위치에 발자국 생성
- 발자국 방향이 마우스 움직임 방향을 따름

### 마법 입자 시스템
- 4가지 크기의 황금색 입자
- 랜덤한 위치와 타이밍
- 자연스러운 낙하 애니메이션

### 양피지 질감 효과
- 다층 그라데이션으로 실제 양피지 느낌 구현
- 미묘한 호흡 애니메이션
- 오래된 얼룩과 섬유 질감

## 🎯 브라우저 호환성

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## 📄 라이선스

이 프로젝트는 개인적/교육적 용도로 자유롭게 사용할 수 있습니다.
해리포터 관련 요소들은 J.K. Rowling과 Warner Bros.의 저작권입니다.

## 🎉 즐거운 사용 되세요!

"I solemnly swear that I am up to no good" 🪄 