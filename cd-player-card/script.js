// 트랙 정보 데이터
const tracks = [
  {
    id: 1,
    title: 'ARTIST',
    content: `
      <h2>문달러</h2>
      <p>인디 포크 | 싱어송라이터</p>
      <p>어쿠스틱 기타와 진솔한 이야기</p>
    `
  },
  {
    id: 2,
    title: 'DISCOGRAPHY',
    content: `
      <h3>주요 작품</h3>
      <ul>
        <li>'별이 빛나는 밤' EP (2023)</li>
        <li>'창문 너머' 싱글 (2022)</li>
        <li>'첫 번째 봄' 앨범 (2021)</li>
        <li>'서울의 밤' 디지털 싱글 (2020)</li>
      </ul>
    `
  },
  {
    id: 3,
    title: 'SOUND',
    content: `
      <h3>음악 특징</h3>
      <p>도시적 감성 포크</p>
      <p>어쿠스틱 기반 미니멀리즘</p>
      <p>서정적 가사</p>
      <p>몽환적 보컬 톤</p>
    `
  },
  {
    id: 4,
    title: 'CONTACT',
    content: `
      <h3>연결</h3>
      <p>📧 moondollar@indie.kr</p>
      <p>🎵 soundcloud.com/moondollar</p>
      <p>📱 인스타그램: @moon_dollar</p>
      <p>🔗 유튜브: MoonDollar Official</p>
    `
  }
];

// DOM 요소 가져오기
const playBtn = document.getElementById('play-btn');
const pauseBtn = document.getElementById('pause-btn');
const prevBtn = document.getElementById('prev-btn');
const ejectBtn = document.getElementById('eject-btn');
const trackInfo = document.getElementById('track-info');
const trackContent = document.getElementById('track-content');
const cdDisc = document.querySelector('.cd-disc');
const eqVisualizer = document.querySelector('.eq-visualizer');

// 플레이어 상태
let currentTrackIndex = 0;
let isPlaying = false;
let isInserted = false;
let ejectVisible = false;

// CD 삽입 함수
function insertCD() {
  if (!isInserted) {
    trackInfo.textContent = 'LOADING...';
    trackInfo.setAttribute('data-text', 'LOADING...');
    
    // CD 삽입 애니메이션 시작
    cdDisc.style.opacity = '1';
    
    // CD 삽입 애니메이션 후 재생 시작
    setTimeout(() => {
      cdDisc.classList.add('cd-inserted');
      
      setTimeout(() => {
        isInserted = true;
        startPlayback();
      }, 1200); // CD 삽입 완료 후 재생 시작
    }, 100);
  }
}

// CD 재생 시작 함수
function startPlayback() {
  const track = tracks[currentTrackIndex];
  
  // 트랙 정보 업데이트 (글리치 효과용 data-text 추가)
  const trackText = `TRACK ${String(track.id).padStart(2, '0')} - ${track.title}`;
  trackInfo.textContent = trackText;
  trackInfo.setAttribute('data-text', trackText);
  
  // 트랙 내용 페이드 아웃/인 효과
  trackContent.innerHTML = '';
  setTimeout(() => {
    trackContent.innerHTML = `
      <div class="fade-in">
        ${track.content}
      </div>
    `;
  }, 300);
  
  // CD 디스크 회전 시작
  cdDisc.classList.add('cd-rotating');
  
  // EQ 바 활성화
  eqVisualizer.classList.add('active');
  
  // 재생 상태 업데이트
  isPlaying = true;
  
  // 일시정지 중 재생 시, Eject 버튼 숨김
  if (ejectVisible) {
    ejectBtn.classList.add('hidden');
    ejectVisible = false;
  }
}

// 트랙 재생 함수
function playTrack(index) {
  if (!isInserted) {
    insertCD();
    return;
  }
  
  if (index < 0) {
    currentTrackIndex = tracks.length - 1;
  } else if (index >= tracks.length) {
    currentTrackIndex = 0;
  } else {
    currentTrackIndex = index;
  }
  
  // 이미 재생 중이면 그냥 재생 계속
  if (isPlaying) {
    startPlayback();
  } else {
    startPlayback();
  }
}

// 트랙 일시정지 함수
function pauseTrack() {
  if (isPlaying && isInserted) {
    // CD 디스크 회전 정지
    cdDisc.classList.remove('cd-rotating');
    
    // EQ 바 비활성화
    eqVisualizer.classList.remove('active');
    
    // 재생 상태 업데이트
    isPlaying = false;
    
    // Eject 버튼 표시
    ejectBtn.classList.remove('hidden');
    ejectVisible = true;
  }
}

// CD 꺼내기 함수
function ejectCD() {
  if (isInserted && !isPlaying) {
    // CD 디스크 꺼내기 애니메이션
    cdDisc.classList.remove('cd-inserted');
    
    // 트랙 정보 초기화
    setTimeout(() => {
      trackInfo.textContent = 'INSERT CD';
      trackInfo.setAttribute('data-text', 'INSERT CD');
      trackContent.innerHTML = '<p class="fade-in">CD를 삽입해주세요. ▶️ 버튼을 눌러 시작하세요.</p>';
      
      // 상태 초기화
      isInserted = false;
      currentTrackIndex = 0;
      
      // Eject 버튼 숨김
      ejectBtn.classList.add('hidden');
      ejectVisible = false;
    }, 1000);
  }
}

// 이벤트 리스너 추가
playBtn.addEventListener('click', () => {
  if (!isInserted) {
    insertCD();
  } else if (!isPlaying) {
    playTrack(currentTrackIndex);
  } else {
    playTrack(currentTrackIndex + 1);
  }
  
  // 버튼 소리 효과
  playButtonSound();
});

pauseBtn.addEventListener('click', () => {
  pauseTrack();
  playButtonSound();
});

prevBtn.addEventListener('click', () => {
  playTrack(currentTrackIndex - 1);
  playButtonSound();
});

ejectBtn.addEventListener('click', () => {
  ejectCD();
  playButtonSound();
});

// 효과음 추가 (선택 사항)
function playButtonSound() {
  const audio = new Audio();
  audio.src = 'data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA/+M4wAAAAAAAAAAAAEluZm8AAAAPAAAAAwAAAbAAOTk5OTk5OTk5OTk5OTk5OTk5OTk5OTk5Ol1dXV1dXV1dXV1dXV1dXV1dXV1dXV1dXZiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJj///////////////////////////////////////////8AAAAATGF2YzU4LjEzAAAAAAAAAAAAAAAAJAYHQ//MsAAAAAAAAAAAAAAAAAAAAP/jOMAAAANIAAAAAExBTUUzLjEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV/+MYxAAAAANIAAAAAFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV/+MYxBYAAANIAAAAAFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV';
  audio.volume = 0.2;
  audio.play();
}

// 버튼 클릭 시 효과음 추가
playBtn.addEventListener('mousedown', playButtonSound);
pauseBtn.addEventListener('mousedown', playButtonSound);
prevBtn.addEventListener('mousedown', playButtonSound);
ejectBtn.addEventListener('mousedown', playButtonSound);

// 페이지 로드 시 초기화
window.addEventListener('load', () => {
  trackContent.innerHTML = '<p class="fade-in">CD를 삽입해주세요. ▶️ 버튼을 눌러 시작하세요.</p>';
  
  // 데이터 속성 설정 (글리치 효과용)
  trackInfo.setAttribute('data-text', trackInfo.textContent);
});
