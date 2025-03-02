// typed animation

let index = 0; // 현재 컨텐트의 글자 위치
let contentCount = 0; // 현재 컨텐트가 컨텐츠 안에서 몇번째 컨텐트인지
let state = "type"; // type, delete
let maxContentCount = 0;
let contents = ["Hello World", "I'm frontend developer", "Nice to meet you"];
let typedSpeed = 100;
let typedDelay = 0;
let cursorSpeed = 500;
let deleteDelay = 1000;
let cursorOpacity = 1;
let cursorAnimationName = "blink"; // 애니메이션 이름 (none, blink)
let cursorAnimationDuration = "0.3s"; // 애니메이션 지속 시간
let cursorAnimationTimingFunction = "infinite"; // 애니메이션 타이밍 함수
let cursorAnimationDelay = "0s"; // 애니메이션 지연 시간

const container = document.querySelector(".container");
const typedContent = document.createElement("div");
typedContent.className = "typed-content";
container.appendChild(typedContent);

function typeText() {
  setTimeout(() => {
    let maxContentCount = contents.length;
    if (index < contents[contentCount].length) {
      console.log(typedContent.textContent, index);
      typedContent.textContent += contents[contentCount][index];
      index++;
    } else {
      // deleteText(contents);
      state = "delete";
      if (contentCount < maxContentCount - 1) {
        contentCount++;
      } else {
        contentCount = 0;
      }
    }
  }, typedDelay);
}

function deleteText() {
  // console.log('삭제 시작')
  setTimeout(() => {
    if (index > 0) {
      typedContent.textContent = typedContent.textContent.slice(0, -1);
      index--;
    } else {
      state = "type";
    }
  }, deleteDelay);

  // typedContent.textContent = "";
  // index = 0;
}

setInterval(() => {
  if (state === "type") {
    typeText(contents);
  } else if (state === "delete") {
    deleteText(contents);
  }
}, typedSpeed);

const cursor = document.createElement("div");
cursor.className = "cursor";
container.appendChild(cursor);
cursor.style.backgroundColor = "white";
cursor.style.width = "2px";
cursor.style.height = "4rem";

setInterval(() => {
  cursorOpacity = cursorOpacity === 0 ? 1 : 0;
  cursor.style.opacity = cursorOpacity;
  cursor.style.animation =
    cursorOpacity === 0
      ? "none"
      : `${cursorAnimationName} ${cursorAnimationDuration} ${cursorAnimationTimingFunction} ${cursorAnimationDelay}`;
}, cursorSpeed);

typeText(contents);
