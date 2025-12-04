// script.js

document.addEventListener("DOMContentLoaded", function () {
  // =======================
  // NAVBAR SCROLL EFFECT
  // =======================
  const navbar = document.querySelector(".tors-navbar");
  if (navbar) {
    window.addEventListener("scroll", function () {
      if (window.scrollY > 10) {
        navbar.classList.add("scrolled");
      } else {
        navbar.classList.remove("scrolled");
      }
    });
  }

  // =======================
  // SMOOTH SCROLL ANCLAS
  // =======================
  const internalLinks = document.querySelectorAll('a[href^="#"]');
  internalLinks.forEach(function (link) {
    link.addEventListener("click", function (e) {
      const targetId = this.getAttribute("href");
      if (!targetId || targetId === "#") return;

      const targetEl = document.querySelector(targetId);
      if (!targetEl) return;

      e.preventDefault();
      const offset = navbar ? navbar.offsetHeight : 0;
      const top =
        targetEl.getBoundingClientRect().top + window.scrollY - offset;

      window.scrollTo({
        top: top,
        behavior: "smooth",
      });
    });
  });

  // =======================
  // SONIDO UI PARA BOTONES (WAV)
  // =======================
  // Usa un WAV que ya tienes en /track/
  let uiSound = null;
  try {
    uiSound = new Audio("track/mixkit-cool-guitar.wav");
  } catch (e) {
    uiSound = null;
  }

  if (uiSound) {
    const uiButtons = document.querySelectorAll(".ui-sound");
    uiButtons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        uiSound.currentTime = 0;
        uiSound.play().catch(function () {
          // navegador bloquea → no truena nada
        });
      });
    });
  }

  // =======================
  // PLAYLIST "LISTEN TO OUR WORK"
  // (tarjetas tipo Sony: .track-card y .tors-track-card)
  // =======================
  const trackCards = Array.from(
    document.querySelectorAll(".track-card, .tors-track-card")
  );

  const tracks = trackCards.map(function (card) {
    return {
      card: card,
      audio: card.querySelector("audio"),
      playBtn:
        card.querySelector(".track-play") ||
        card.querySelector(".tors-track-play-btn"),
      wave:
        card.querySelector(".track-wave") ||
        card.querySelector(".tors-track-wave"),
    };
  });

  let currentIndex = -1;

  function stopCurrent() {
    if (currentIndex < 0) return;

    const item = tracks[currentIndex];
    if (!item) return;

    if (item.audio && !item.audio.paused) {
      item.audio.pause();
      item.audio.currentTime = 0;
    }

    if (item.card) {
      item.card.classList.remove("playing", "is-playing");
    }

    if (item.playBtn) {
      item.playBtn.innerHTML = '<i class="bi bi-play-fill"></i>';
    }

    currentIndex = -1;
  }

  function playTrack(index) {
    const item = tracks[index];
    if (!item || !item.audio) return;

    // si ya está sonando → pausar
    if (currentIndex === index && !item.audio.paused) {
      stopCurrent();
      return;
    }

    // parar cualquier otro
    stopCurrent();

    item.audio
      .play()
      .then(function () {
        currentIndex = index;

        if (item.card) {
          item.card.classList.add("playing", "is-playing");
        }
        if (item.playBtn) {
          item.playBtn.innerHTML = '<i class="bi bi-pause-fill"></i>';
        }
      })
      .catch(function () {
        // por si el navegador bloquea la reproducción
      });

    item.audio.onended = function () {
      if (item.card) {
        item.card.classList.remove("playing", "is-playing");
      }
      if (item.playBtn) {
        item.playBtn.innerHTML = '<i class="bi bi-play-fill"></i>';
      }
      currentIndex = -1;
    };
  }

  // eventos botón play
  tracks.forEach(function (item, index) {
    if (!item.playBtn) return;

    item.playBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      playTrack(index);
    });
  });

  // eventos click en tarjeta completa
  tracks.forEach(function (item, index) {
    if (!item.card) return;

    item.card.addEventListener("click", function (e) {
      const target = e.target;
      if (
        target.closest &&
        (target.closest(".track-play") ||
          target.closest(".tors-track-play-btn"))
      ) {
        return;
      }
      playTrack(index);
    });
  });

  // =======================
  // BEFORE / AFTER PLAYER
  // =======================
  const demoAudio = document.getElementById("baDemoAudio");
  const finalAudio = document.getElementById("baFinalAudio");
  const playBtn = document.querySelector(".tors-ba-play");
  const toggleLabels = document.querySelectorAll(
    ".tors-ba-toggle .toggle-label"
  );
  const thumb = document.querySelector(".toggle-thumb");
  const currentLabel = document.getElementById("baCurrentLabel");

  if (
    demoAudio &&
    finalAudio &&
    playBtn &&
    toggleLabels.length &&
    thumb &&
    currentLabel
  ) {
    let mode = "demo"; // "demo" | "final"
    let isPlaying = false;

    function getCurrentAudio() {
      return mode === "demo" ? demoAudio : finalAudio;
    }

    function stopAll() {
      [demoAudio, finalAudio].forEach((aud) => {
        aud.pause();
        aud.currentTime = 0;
      });
      isPlaying = false;
      playBtn.innerHTML = '<i class="bi bi-play-fill me-2"></i>Play';
    }

    function updateMode(newMode) {
      if (mode === newMode) return;
      mode = newMode;

      // labels activos
      toggleLabels.forEach((lbl) => {
        if (lbl.getAttribute("data-mode") === mode) {
          lbl.classList.add("active");
        } else {
          lbl.classList.remove("active");
        }
      });

      // thumb
      if (mode === "demo") {
        thumb.style.transform = "translateX(0)";
        currentLabel.textContent = "Demo";
      } else {
        thumb.style.transform = "translateX(38px)";
        currentLabel.textContent = "Final";
      }

      // al cambiar, detenemos ambos
      stopAll();
    }

    // click en labels "Demo" y "Final"
    toggleLabels.forEach((lbl) => {
      lbl.addEventListener("click", () => {
        const selected = lbl.getAttribute("data-mode");
        if (selected) {
          updateMode(selected);
        }
      });
    });

    // botón Play / Pause
    playBtn.addEventListener("click", () => {
      const audio = getCurrentAudio();
      if (!audio) return;

      if (!isPlaying) {
        const other = mode === "demo" ? finalAudio : demoAudio;
        other.pause();
        other.currentTime = 0;

        audio
          .play()
          .then(() => {
            isPlaying = true;
            playBtn.innerHTML =
              '<i class="bi bi-pause-fill me-2"></i>Pause';
          })
          .catch(() => {
            // si el navegador bloquea, no truena
          });
      } else {
        audio.pause();
        isPlaying = false;
        playBtn.innerHTML = '<i class="bi bi-play-fill me-2"></i>Play';
      }

      audio.onended = () => {
        isPlaying = false;
        playBtn.innerHTML =
          '<i class="bi bi-play-fill me-2"></i>Play';
      };
    });
  }
});
