const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

let isDrawing = false;
let lastX = 0;
let lastY = 0;

const generateBtn = document.getElementById("generateBtn");
const suggestionsDiv = document.getElementById("suggestions");
const editorDiv = document.getElementById("editor");
const cropBtn = document.getElementById("cropBtn");
const sizeSelect = document.getElementById("sizeSelect");
const downloadBtn = document.getElementById("downloadBtn");

const initDrawing = (e) => {
  if (!isDrawing) return;
  ctx.beginPath();
  ctx.moveTo(lastX, lastY);
  ctx.lineTo(e.offsetX, e.offsetY);
  ctx.stroke();
  lastX = e.offsetX;
  lastY = e.offsetY;
};

const startDrawing = (e) => {
  isDrawing = true;
  lastX = e.offsetX;
  lastY = e.offsetY;
};

const stopDrawing = () => {
  isDrawing = false;
  ctx.beginPath();
};

canvas.addEventListener("mousedown", startDrawing);
canvas.addEventListener("mousemove", initDrawing);
canvas.addEventListener("mouseup", stopDrawing);
canvas.addEventListener("mouseout", stopDrawing);

// Генерация иконок через API
generateBtn.addEventListener("click", async () => {
  const imageData = canvas.toDataURL("image/png");

  try {
    const response = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: {
        "Authorization": "Bearer r8_auoeg43dCKqUMbRC9gSDxvy6L2l6lnz268T2L",  // замените YOUR_API_KEY на ваш ключ API
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        version: "a123b456",  // укажите версию модели (например, Stable Diffusion)
        input: { image: imageData },
      }),
    });

    const result = await response.json();

    if (result.status === "succeeded") {
      const suggestions = result.predictions.map((prediction, index) => {
        return `<div class="suggestion">
          <img src="${prediction.output}" alt="Иконка ${index + 1}" onclick="selectIcon('${prediction.output}')">
          <p>Вариант ${index + 1}</p>
        </div>`;
      }).join("");

      suggestionsDiv.innerHTML = suggestions;
      suggestionsDiv.style.display = "block";
    } else {
      alert("Ошибка генерации. Попробуйте снова.");
    }
  } catch (error) {
    alert("Ошибка подключения к серверу.");
  }
});

let selectedIcon = null;

function selectIcon(iconData) {
  selectedIcon = iconData;
  suggestionsDiv.style.display = "none";
  editorDiv.style.display = "block";
  const img = new Image();
  img.src = iconData;
  img.onload = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  };
}

cropBtn.addEventListener("click", () => {
  // Обрезка: просто пример, с возможностью изменения области
  const width = canvas.width / 2;
  const height = canvas.height / 2;
  const imageData = ctx.getImageData(0, 0, width, height);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.putImageData(imageData, 0, 0);
});

downloadBtn.addEventListener("click", () => {
  const size = parseInt(sizeSelect.value);
  const img = canvas.toDataURL("image/png");

  const a = document.createElement("a");
  a.href = img;
  a.download = `icon_${size}.png`;
  a.click();
});
