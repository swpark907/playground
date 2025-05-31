// start 버튼 클릭 시 식물 생성
document.querySelector("#start").addEventListener("click", () => {
  const plant = new Plant(100, 300);
  plant.createStem();
  plant.growStem();
});

// 식물이 자라날 canvas 생성
// 왜 캔버스가 생성이 안되지?

const canvas = document.createElement("canvas");
document.body.appendChild(canvas);
// width, height는 화면 전체 크기
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
document.querySelector("#stem").appendChild(canvas);

// 캔버스 컨텍스트 가져오기
const ctx = canvas.getContext("2d");

// 캔버스 컨텍스트 설정
ctx.fillStyle = "green";
ctx.fillRect(0, 0, canvas.width, canvas.height);

// 식물 클래스

class Plant {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.stem = null;
    this.leaves = [];
  }

  createStem() {
    const stem = document.createElementNS("http://www.w3.org/2000/svg", "path");
    stem.setAttribute(
      "d",
      "M" +
        this.x +
        "," +
        this.y +
        " Q" +
        (this.x + 50) +
        "," +
        (this.y - 100) +
        " " +
        (this.x + 100) +
        "," +
        this.y
    );
    stem.setAttribute("stroke", "green");
    stem.setAttribute("stroke-width", "4");
    stem.setAttribute("fill", "none");
    document.querySelector("#stem").appendChild(stem);
    this.stem = stem;
  }

  growStem() {
    const path = this.stem.getAttribute("d");
    const points = path.split(" ").map((p) => p.split(",").map(Number));

    // 줄기 끝에서 오른쪽으로 자라나기
    const newPoint = [
      points[points.length - 1][0] + 1,
      points[points.length - 1][1],
    ];
    points.push(newPoint);

    // 줄기 모양 업데이트
    this.stem.setAttribute("d", this.createPath(points));
  }

  createPath(points) {
    return points.map((p) => p.join(",")).join(" ");
  }
}