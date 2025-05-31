# 카카오톡 스타일 명함 💬

카카오톡 채팅 UI를 모티브로 한 정적인 웹 명함입니다.

## 📁 프로젝트 구조

```
kakao-chat-card/
├── index.html          # 메인 HTML 파일
├── style.css           # 스타일시트
├── images/             # 이미지 폴더 (필요시 사용)
└── README.md           # 프로젝트 설명서
```

## 🎨 디자인 특징

- **크기**: 정확히 890×510px
- **스타일**: 카카오톡 채팅창과 유사한 UI
- **구성요소**:
  - 프로필 사진 및 정보 (상단)
  - 말풍선 형태의 정보 카드들
  - 카카오톡 스타일의 시간 표시
  - 읽음 표시

## 🚀 사용법

1. 웹 브라우저에서 `index.html` 파일을 열어주세요.
2. 명함이 890×510px 크기로 표시됩니다.

## ✏️ 커스터마이징

### 개인 정보 수정
`index.html` 파일에서 다음 부분을 수정하세요:

- **이름**: `<div class="name">김개발</div>`
- **상태 메시지**: `<div class="status">열정적인 개발자입니다 🚀</div>`
- **직업**: `<strong>직업:</strong> Frontend Developer`
- **연락처**: `<strong>연락처:</strong> 010-1234-5678`
- **블로그**: `<strong>블로그:</strong> mwangmoong.tistory.com`

### 프로필 이미지 변경
현재는 base64로 인코딩된 기본 아바타를 사용하고 있습니다.
실제 프로필 이미지를 사용하려면:

1. `images/` 폴더에 프로필 이미지를 저장
2. `index.html`에서 `src` 속성을 변경:
   ```html
   <img src="images/profile.png" alt="프로필 이미지">
   ```

### 색상 변경
`style.css` 파일에서 다음 색상들을 수정할 수 있습니다:

- **배경색**: `.business-card { background-color: #f7f7f7; }`
- **말풍선 색**: `.bubble-content { background-color: #ECECEC; }`
- **헤더 배경**: `.chat-header { background-color: #ffffff; }`

## 📱 반응형 지원

920px 이하의 화면에서는 자동으로 반응형으로 조정됩니다.

## 🎯 활용 방법

- 개인 포트폴리오 사이트에 삽입
- 명함 인쇄용 (890×510px 비율 유지)
- 소셜 미디어 프로필 이미지
- 이메일 서명용 이미지

---

**제작**: 카카오톡 UI 모티브 명함 템플릿 