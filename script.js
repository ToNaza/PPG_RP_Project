// 1. Инициализация Canvas
const canvas = document.getElementById('flash-bg');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Массив для хранения активных вспышек (был пропущен)
const flashes = [];

// Находим элементы управления
const bgMusic = document.getElementById('bg-music');
const muteBtn = document.getElementById('mute-btn');
const muteImg = document.getElementById('mute-img');
const volumeSlider = document.getElementById('volume-slider');

// Изначально звук ПОЛНОСТЬЮ выключен
let isGlobalMuted = true;

const iconVolumeOn = './media/sound-loud-svgrepo-com.svg';
const iconVolumeOff = './media/sound-off-filled-svgrepo-com.svg';

// Задаем базовый тихий уровень для музыки
bgMusic.volume = 0.1;

// Единственный обработчик для первой кнопки (Включение / Выключение)
muteBtn.addEventListener('click', () => {
  isGlobalMuted = !isGlobalMuted;
  
  if (isGlobalMuted) {
    bgMusic.pause();
    muteBtn.classList.add('muted-active');
    muteImg.src = iconVolumeOff;
  } else {
    muteBtn.classList.remove('muted-active');
    muteImg.src = iconVolumeOn;
    
    // Подхватываем текущее значение ползунка и запускаем
    bgMusic.volume = volumeSlider.value;
    bgMusic.play().catch(err => console.log("Браузер заблокировал старт:", err));
  }
});

// Ползунок громкости фоновой музыки
volumeSlider.addEventListener('input', (e) => {
  const currentVolume = e.target.value;
  bgMusic.volume = currentVolume;
  
  // Если пользователь двигает ползунок, но общий мут включен — не воспроизводим
  if (bgMusic.paused && !isGlobalMuted && currentVolume > 0) {
    bgMusic.play().catch(err => console.log(err));
  }
});

// Массив звуков вспышек
const flashSounds = ['./audio/boom1.mp3', './audio/boom2.mp3', './audio/boom3.mp3'];

class Flash {
  constructor() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.maxRadius = Math.random() * 80 + 20;
    this.progress = 0;
    this.speed = Math.random() * 0.015 + 0.01; 

    // Воспроизводим взрыв, только если пользователь включил звук кнопкой
    if (!isGlobalMuted) {
      this.playSound();
    }
  }

  playSound() {
    try {
      const randomTrack = flashSounds[Math.floor(Math.random() * flashSounds.length)];
      const audio = new Audio(randomTrack);
      audio.volume = 0.5; 
      audio.play().catch(() => {
        // Защита от случайных системных блокировок браузера
      });
    } catch (e) {
      console.error(e);
    }
  }

  update() {
    if (this.progress < 0.25) {
      this.progress += this.speed;
    } else {
      this.progress += this.speed / 6; 
    }
  }

  draw() {
    ctx.beginPath();
    let gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.maxRadius);
    let color = '';
    let alpha = 1;

    if (this.progress < 0.1) {
      color = '255, 255, 255';
    } else if (this.progress < 0.25) {
      color = '255, 0, 0';
    } else {
      color = '0, 0, 0';
      alpha = 1 - (this.progress - 0.25) / 0.75;
    }

    gradient.addColorStop(0, `rgba(${color}, ${alpha})`);
    gradient.addColorStop(1, `rgba(${color}, 0)`);
    ctx.fillStyle = gradient;
    ctx.arc(this.x, this.y, this.maxRadius, 0, Math.PI * 2);
    ctx.fill();
  }
}

// Генерация вспышек в массиве
function spawnFlash() {
  flashes.push(new Flash());
  let nextSpawn = Math.random() * 3500 + 2500;
  setTimeout(spawnFlash, nextSpawn);
}
spawnFlash();

// Цикл отрисовки кадров
function animate() {
  // Очищаем слой, сохраняя прозрачность для CSS-градиента body
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let i = flashes.length - 1; i >= 0; i--) {
    flashes[i].update();
    flashes[i].draw();

    if (flashes[i].progress >= 1) {
      flashes.splice(i, 1);
    }
  }

  requestAnimationFrame(animate);
}
animate();





// Собираем ВСЕ кнопки, которые должны издавать звук и гнуться:
// Главное меню + кнопки выбора фракций из модалки
const interactiveElements = document.querySelectorAll('.menu-btn, #var_muso, #var_zril, #var_anco');

// Пути к картинкам (применяются только если внутри кнопки ЕСТЬ тег .btn-img)
const imgOffPath = './media/btnoff.png';
const imgOnPath = './media/btnon.png';

interactiveElements.forEach(element => {
  const imgElement = element.querySelector('.btn-img');
  
  // --- 1. АУДИО-ЭФФЕКТЫ (Наложение звуков) ---

  // Наведение (Ховер)
  element.addEventListener('mouseenter', () => {
    // Меняем картинку, только если она вообще есть в этой кнопке
    if (imgElement) imgElement.src = imgOnPath;
    
    const hoverSoundPath = element.getAttribute('data-hover-sound');
    if (hoverSoundPath) {
      const tempHoverAudio = new Audio(hoverSoundPath);
      tempHoverAudio.volume = 0.9;
      tempHoverAudio.play().catch(err => console.log("Блокировка ховера:", err));
    }
  });
  
  // Нажатие (Клик)
  element.addEventListener('click', () => {
    const clickSoundPath = element.getAttribute('data-click-sound');
    if (clickSoundPath) {
      const tempClickAudio = new Audio(clickSoundPath);
      tempClickAudio.volume = 0.7;
      tempClickAudio.play().catch(err => console.log("Блокировка клика:", err));
    }
  });


  // --- 2. ЭФФЕКТ 3D-НАКЛОНА (Для всех перечисленных элементов) ---

  element.addEventListener('mousemove', (e) => {
    const rect = element.getBoundingClientRect();
    
    // Координаты курсора относительно центра элемента
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    
    // Расчет градусов наклона
    const degX = -(y / (rect.height / 2)) * 10; // макс 10° вверх/вниз
    const degY = (x / (rect.width / 2)) * 15;   // макс 15° влево/вправо
    
    // Применяем трансформацию
    element.style.transform = `perspective(500px) rotateX(${degX}deg) rotateY(${degY}deg) scale(1.03)`;
  });

  // Уход мыши — возвращаем в исходное положение
  element.addEventListener('mouseleave', () => {
    if (imgElement) imgElement.src = imgOffPath;
    element.style.transform = 'perspective(500px) rotateX(0deg) rotateY(0deg) scale(1)';
  });
});



const startGameBtn = document.getElementById('startgame');
const infoOpenBtn = document.getElementById('info_open');
const blackWindow = document.getElementById('black_window');
const gmmModal = document.getElementById('gmm');
const immModal = document.getElementById('imm');

// --- 1. ЛОГИКА ОТКРЫТИЯ ---

// Открытие фракций (через вспышку)
startGameBtn.addEventListener('click', () => {
    blackWindow.classList.remove('animate-flash-open', 'animate-flash-close');
    blackWindow.classList.add('animate-flash-open');

    setTimeout(() => {
        gmmModal.style.display = 'block';
    }, 160); 
});

// Открытие инфо (через ту же вспышку)
infoOpenBtn.addEventListener('click', () => {
    blackWindow.classList.remove('animate-flash-open', 'animate-flash-close');
    blackWindow.classList.add('animate-flash-open');

    setTimeout(() => {
        immModal.style.display = 'block';
    }, 160); 
});


// --- 2. ЛОГИКА ЗАКРЫТИЯ (При клике на фон) ---

// Закрытие фракций
gmmModal.addEventListener('click', (e) => {
    if (e.target.id !== 'gmm') return; 
    
    blackWindow.classList.remove('animate-flash-open', 'animate-flash-close');
    blackWindow.classList.add('animate-flash-close');

    setTimeout(() => {
        gmmModal.style.display = 'none';
    }, 150);
});

// Закрытие инфо
immModal.addEventListener('click', (e) => {
    if (e.target.id !== 'imm') return; 
    
    blackWindow.classList.remove('animate-flash-open', 'animate-flash-close');
    blackWindow.classList.add('animate-flash-close');

    setTimeout(() => {
        immModal.style.display = 'none';
    }, 150);
});


