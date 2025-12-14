document.addEventListener("DOMContentLoaded", () => {
  const preventDefault = (event) => event.preventDefault();
  document.addEventListener("contextmenu", preventDefault);
  document.addEventListener("selectstart", preventDefault);
  document.addEventListener("dragstart", preventDefault);

  const envelope = document.querySelector(".letter__envelope");
  const letterModal = document.querySelector(".letter__modal");
  const letterBody = document.getElementById("letterBody");
  const sealButton = document.querySelector(".letter__seal");
  const closeButton = document.querySelector(".letter__close");
  const backdrop = document.querySelector(".letter__backdrop");
  const yesButton = document.querySelector('[data-action="yes"]');
  const noButton = document.querySelector('[data-action="no"]');
  const confirmText = document.querySelector(".question__confirm");
  const audio = document.getElementById("bg-audio");
  const audioToggle = document.querySelector(".audio-toggle");
  const gardenScene = document.querySelector('[data-role="garden"]');
  let noConfirmShown = false;

  if (window.emailjs) {
    emailjs.init("YOUR_PUBLIC_KEY");
  }

  const updateAudioToggle = () => {
    if (!audio || !audioToggle) return;
    const icon = audioToggle.querySelector(".audio-toggle__icon");
    const text = audioToggle.querySelector(".audio-toggle__text");
    const isMuted = audio.muted;
    audioToggle.setAttribute("aria-pressed", String(!isMuted));
    if (icon) icon.textContent = isMuted ? "🔇" : "🔊";
    if (text) text.textContent = isMuted ? "Sound off" : "Sound on";
  };

  const tryPlayAudio = () => {
    if (!audio || audio.dataset.played === "true" || audio.muted) return;
    audio.dataset.played = "true";
    audio.play().catch(() => {
      audio.dataset.played = "false";
    });
  };

  const releaseNotLoadedState = () => {
    if (document.body && document.body.classList.contains("not-loaded")) {
      document.body.classList.remove("not-loaded");
    }
  };

  const triggerGardenBloom = () => {
    if (!gardenScene) return;
    const flowers = gardenScene.querySelector(".flowers");
    if (!flowers) return;
    const clone = flowers.cloneNode(true);
    if (flowers.id) {
      clone.id = flowers.id;
    }
    flowers.replaceWith(clone);
  };

  const initGarden = () => {
    if (!gardenScene) {
      releaseNotLoadedState();
      return;
    }

    const startBloom = () => {
      triggerGardenBloom();
      releaseNotLoadedState();
    };

    setTimeout(startBloom, 500);

    gardenScene.addEventListener("click", () => {
      triggerGardenBloom();
    });
  };

  const openLetter = () => {
    if (!envelope || !letterModal || !letterBody || !sealButton) return;
    if (letterModal.classList.contains("is-visible")) return;
    envelope.classList.add("is-open");
    sealButton.classList.add("is-gone");
    letterModal.classList.add("is-visible");
    letterModal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
    requestAnimationFrame(() => {
      letterBody.classList.add("is-visible");
    });
    tryPlayAudio();
  };

  const closeLetter = () => {
    if (!letterModal) return;
    letterModal.classList.remove("is-visible");
    letterModal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
    letterBody?.classList.remove("is-visible");
    envelope?.classList.remove("is-open");
    sealButton?.classList.remove("is-gone");
  };

  if (sealButton) {
    sealButton.addEventListener("click", openLetter);
  }

  if (closeButton) {
    closeButton.addEventListener("click", closeLetter);
  }

  if (backdrop) {
    backdrop.addEventListener("click", closeLetter);
  }

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && letterModal?.classList.contains("is-visible")) {
      closeLetter();
    }
  });

  if (audioToggle && audio) {
    audioToggle.addEventListener("click", () => {
      audio.muted = !audio.muted;
      updateAudioToggle();
      if (!audio.muted) {
        tryPlayAudio();
      }
    });
    updateAudioToggle();
  }

  initGarden();

  const setConfirmMessage = (message) => {
    if (confirmText) {
      confirmText.textContent = message;
    }
  };

  const launchPetals = () => {
    const petalLayer = document.createElement("div");
    petalLayer.className = "petal-layer";
    document.body.appendChild(petalLayer);

    const petalCount = 40;
    for (let i = 0; i < petalCount; i += 1) {
      const petal = document.createElement("span");
      petal.className = "petal";
      petal.style.left = `${Math.random() * 100}vw`;
      petal.style.animationDelay = `${Math.random() * 1.5}s`;
      petal.style.animationDuration = `${4 + Math.random() * 2}s`;
      petalLayer.appendChild(petal);
    }

    setTimeout(() => {
      petalLayer.remove();
    }, 6000);
  };

  const sendSuccessEmail = () => {
    if (!window.emailjs) return Promise.resolve();

    const templateParams = {
      responder: "Kevin Roy Maglaqui",
      response: "She said yes!",
      time: new Date().toLocaleString(),
    };

    return emailjs
      .send("YOUR_SERVICE_ID", "YOUR_TEMPLATE_ID", templateParams)
      .catch(() => {
        console.warn("EmailJS send failed. Ensure IDs are set correctly.");
      });
  };

  if (yesButton) {
    yesButton.addEventListener("click", () => {
      launchPetals();
      setConfirmMessage("Yay! I can't wait for our story to begin.");
      sendSuccessEmail();
    });
  }

  if (noButton) {
    noButton.addEventListener("click", () => {
      if (!noConfirmShown) {
        setConfirmMessage("Are you sure?");
        noConfirmShown = true;
        return;
      }

      setConfirmMessage("Okay, I'll still be here, patient and hopeful.");
    });
  }
});
