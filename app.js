/**
 * ============================================================================
 * PIP'S DREAM PORTFOLIO — INTERACTIVE MASTER APPLICATION SCRIPT
 * Complete interactions for haX.baby hackathon:
 *  - Eye-tracking & head tilt puppet physics
 *  - Sparkle cursor trail (+2 pts)
 *  - Hit counter odometer (+1 pt)
 *  - Live dream guestbook (+2 pts)
 *  - Responsive chaos playroom mode (+5 pts)
 *  - Click sounds + mandatory mute toggle (+3 pts)
 *  - Secret Easter Egg with canvas confetti shower
 * ============================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
  const audio = window.pipAudio;

  // ==========================================================================
  // 1. Mandatory Hackathon Mute Toggle & Sound HUD
  // ==========================================================================
  const muteBtn = document.getElementById('muteToggleBtn');
  const muteIcon = document.getElementById('muteIcon');
  const muteText = document.getElementById('muteText');

  function updateMuteUI() {
    if (audio.isMuted) {
      muteIcon.textContent = '🔇';
      muteText.textContent = 'Muted';
      muteBtn.classList.remove('active');
      muteBtn.setAttribute('aria-pressed', 'true');
    } else {
      muteIcon.textContent = '🔊';
      muteText.textContent = 'Sound On';
      muteBtn.classList.add('active');
      muteBtn.setAttribute('aria-pressed', 'false');
    }
  }

  if (muteBtn) {
    updateMuteUI();
    muteBtn.addEventListener('click', () => {
      const isMuted = audio.toggleMute();
      updateMuteUI();
      if (!isMuted) {
        audio.playBubbleClick();
      }
    });
  }

  // Attach sound to interactive buttons across the site
  document.querySelectorAll('button, .nav-link, .btn-primary, .btn-secondary').forEach(elem => {
    elem.addEventListener('click', (e) => {
      // Don't double sound on blocks or chimes
      if (!elem.classList.contains('wood-block') && !elem.classList.contains('chime-key')) {
        audio.playBubbleClick();
      }
    });
  });

  // ==========================================================================
  // 2. Day / Midnight Mood Shift & Vintage Night Lamp Toggle
  // ==========================================================================
  const themeToggleBtn = document.getElementById('themeToggleBtn');
  const themeIcon = document.getElementById('themeIcon');
  const themeText = document.getElementById('themeText');
  const lampStatusText = document.getElementById('lampStatusText');
  const lampPullCord = document.getElementById('lampPullCord');
  const lampPullBtn = document.getElementById('lampPullBtn');
  const lampApparatus = document.getElementById('lampApparatus');

  const savedTheme = localStorage.getItem('pip_portfolio_theme') || 'twilight';
  document.documentElement.setAttribute('data-theme', savedTheme);
  updateThemeUI(savedTheme);

  function toggleThemeMode(fromLamp = false) {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'midnight' ? 'twilight' : 'midnight';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('pip_portfolio_theme', next);

    if (lampPullCord) {
      lampPullCord.classList.remove('pulling');
      void lampPullCord.offsetWidth; // trigger reflow
      lampPullCord.classList.add('pulling');
      setTimeout(() => lampPullCord.classList.remove('pulling'), 450);
    }

    if (audio.playLampClick) {
      audio.playLampClick();
    } else {
      audio.playChime('E5', 1.2);
    }

    updateThemeUI(next);
  }

  function updateThemeUI(theme) {
    const isMidnight = theme === 'midnight';
    if (themeIcon) themeIcon.textContent = isMidnight ? '🌙' : '☀️';
    if (themeText) themeText.textContent = isMidnight ? 'Midnight' : 'Twilight';
    if (themeToggleBtn) {
      themeToggleBtn.classList.toggle('active', isMidnight);
      themeToggleBtn.setAttribute('aria-pressed', String(isMidnight));
    }
    if (lampStatusText) {
      lampStatusText.textContent = isMidnight ? 'Midnight Mode Active · Lamp Glowing' : 'Twilight Mode Active · Lamp Inactive';
    }
    const statusChip = document.getElementById('lampStatusChip');
    if (statusChip) {
      statusChip.style.borderColor = isMidnight ? 'var(--accent-gold)' : 'var(--border-soft)';
    }
  }

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => toggleThemeMode(false));
  }
  if (lampPullBtn) {
    lampPullBtn.addEventListener('click', () => toggleThemeMode(true));
  }
  if (lampPullCord) {
    lampPullCord.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleThemeMode(true);
    });
  }
  if (lampApparatus) {
    lampApparatus.addEventListener('click', () => toggleThemeMode(true));
  }

  // ==========================================================================
  // 3. Responsive Chaos / Playroom Mode (+5 pts Bonus)
  // ==========================================================================
  const chaosToggleBtn = document.getElementById('chaosToggleBtn');
  if (chaosToggleBtn) {
    chaosToggleBtn.addEventListener('click', () => {
      document.body.classList.toggle('chaos-mode');
      const isActive = document.body.classList.contains('chaos-mode');
      chaosToggleBtn.classList.toggle('active', isActive);
      audio.playChime('C6', 1.0);
    });
  }

  // ==========================================================================
  // 4. Interactive Eye-Tracking & Head Tilt
  // ==========================================================================
  const characterStage = document.getElementById('characterStage');
  const pipPuppet = document.getElementById('pipPuppet');
  const pupils = document.querySelectorAll('.eye-pupil');

  function handlePointerMove(clientX, clientY) {
    if (!characterStage || !pupils.length) return;

    const rect = characterStage.getBoundingClientRect();
    const stageCenterX = rect.left + rect.width / 2;
    const stageCenterY = rect.top + rect.height / 2;

    const deltaX = clientX - stageCenterX;
    const deltaY = clientY - stageCenterY;
    const distance = Math.hypot(deltaX, deltaY);
    const angle = Math.atan2(deltaY, deltaX);

    // Bounded pupil offset (max 7px in any direction)
    const pupilMove = Math.min(7, distance / 25);
    const pupilX = Math.cos(angle) * pupilMove;
    const pupilY = Math.sin(angle) * pupilMove;

    pupils.forEach(pupil => {
      pupil.style.transform = `translate(${pupilX}px, ${pupilY}px)`;
    });

    // Subtle 3D perspective head tilt
    if (pipPuppet) {
      const tiltX = Math.max(-12, Math.min(12, -deltaY / 25));
      const tiltY = Math.max(-15, Math.min(15, deltaX / 25));
      pipPuppet.style.transform = `rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;
    }

    // Sparkle Cursor Trail (+2 pts Side Quest)
    createSparkle(clientX, clientY);
  }

  window.addEventListener('mousemove', (e) => {
    handlePointerMove(e.clientX, e.clientY);
  });

  window.addEventListener('touchmove', (e) => {
    if (e.touches.length > 0) {
      handlePointerMove(e.touches[0].clientX, e.touches[0].clientY);
    }
  }, { passive: true });

  // Reset head tilt when mouse leaves
  window.addEventListener('mouseleave', () => {
    if (pipPuppet) pipPuppet.style.transform = 'rotateX(0deg) rotateY(0deg)';
    pupils.forEach(pupil => pupil.style.transform = 'translate(0px, 0px)');
  });

  // Sparkle Trail Generator
  let lastSparkleTime = 0;
  function createSparkle(x, y) {
    const now = Date.now();
    if (now - lastSparkleTime < 50) return; // throttle
    lastSparkleTime = now;

    const sparkle = document.createElement('div');
    sparkle.className = 'sparkle-particle';
    const glyphs = ['✨', '⭐', '✦', '˚˳⊹', '⋆'];
    sparkle.textContent = glyphs[Math.floor(Math.random() * glyphs.length)];
    sparkle.style.left = `${x + (Math.random() * 14 - 7)}px`;
    sparkle.style.top = `${y + (Math.random() * 14 - 7)}px`;
    sparkle.style.color = Math.random() > 0.5 ? '#f59e0b' : '#a34063';
    document.body.appendChild(sparkle);

    setTimeout(() => sparkle.remove(), 750);
  }

  // ==========================================================================
  // 5. Project 1: The Lullaby Lab & Music Box Controls
  // ==========================================================================
  const toggleLullabyBtn = document.getElementById('toggleLullabyBtn');
  const windingKey = document.getElementById('windingKey');
  const lullabyStatus = document.getElementById('lullabyStatus');
  const visualizerCanvas = document.getElementById('audioVisualizer');
  let visualizerCtx = visualizerCanvas ? visualizerCanvas.getContext('2d') : null;

  let currentMelody = 0;

  function updateLullabyUI(playing) {
    if (!toggleLullabyBtn) return;
    if (playing) {
      toggleLullabyBtn.innerHTML = '<span>⏸ Pause Lullaby</span>';
      if (lullabyStatus) lullabyStatus.textContent = 'Now Playing: ' + audio.melodies[currentMelody].title;
      if (windingKey) windingKey.classList.add('winding');
    } else {
      toggleLullabyBtn.innerHTML = '<span>▶ Play Bedtime Lullaby</span>';
      if (lullabyStatus) lullabyStatus.textContent = 'Wind the key or press play to begin.';
      if (windingKey) windingKey.classList.remove('winding');
    }
  }

  if (toggleLullabyBtn) {
    toggleLullabyBtn.addEventListener('click', () => {
      const playing = audio.toggleLullaby(currentMelody);
      updateLullabyUI(playing);
    });
  }

  if (windingKey) {
    windingKey.addEventListener('click', () => {
      audio.playWindingRatchet();
      if (!audio.isPlayingLullaby) {
        audio.startLullaby(currentMelody);
        updateLullabyUI(true);
      }
    });
  }

  // Melody Selectors
  document.querySelectorAll('.melody-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.melody-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentMelody = parseInt(btn.dataset.melody, 10) || 0;
      audio.startLullaby(currentMelody);
      updateLullabyUI(true);
    });
  });

  // Playable Chime Keys
  document.querySelectorAll('.chime-key').forEach(key => {
    key.addEventListener('click', () => {
      const note = key.dataset.note;
      audio.playChime(note, 1.4);
      key.style.transform = 'translateY(3px)';
      setTimeout(() => { key.style.transform = ''; }, 120);
    });
  });
  // Play chimes using keyboard keys 1–6
  document.addEventListener('keydown', (event) => {
    if (event.repeat || event.ctrlKey || event.altKey || event.metaKey) return;
    if (/INPUT|TEXTAREA|SELECT/.test(event.target.tagName) || event.target.isContentEditable) return;

    const index = Number(event.key) - 1;
    if (index < 0 || index > 5 || !/^[1-6]$/.test(event.key)) return;

    const key = document.querySelectorAll('.chime-key')[index];
    if (!key) return;

    key.click();
    key.classList.add('keyboard-glow');
    setTimeout(() => key.classList.remove('keyboard-glow'), 180);
  });

  // Real-time Canvas Waveform Visualizer
  function drawVisualizer() {
    requestAnimationFrame(drawVisualizer);
    if (!visualizerCtx || !visualizerCanvas) return;

    const width = visualizerCanvas.width = visualizerCanvas.offsetWidth;
    const height = visualizerCanvas.height = visualizerCanvas.offsetHeight;

    visualizerCtx.clearRect(0, 0, width, height);

    if (audio.analyser && audio.isPlayingLullaby) {
      const bufferLength = audio.analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      audio.analyser.getByteFrequencyData(dataArray);

      const barWidth = (width / bufferLength) * 2;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * height * 0.85;
        const gradient = visualizerCtx.createLinearGradient(0, height, 0, height - barHeight);
        gradient.addColorStop(0, '#a34063');
        gradient.addColorStop(1, '#fbbf24');

        visualizerCtx.fillStyle = gradient;
        visualizerCtx.beginPath();
        visualizerCtx.roundRect(x, height - barHeight, barWidth - 2, barHeight, 4);
        visualizerCtx.fill();

        x += barWidth;
      }
    } else {
      // Gentle idle wave
      visualizerCtx.strokeStyle = 'rgba(163, 64, 99, 0.25)';
      visualizerCtx.lineWidth = 2;
      visualizerCtx.beginPath();
      const mid = height / 2;
      for (let x = 0; x < width; x += 10) {
        const y = mid + Math.sin((x * 0.05) + (Date.now() * 0.002)) * 6;
        if (x === 0) visualizerCtx.moveTo(x, y);
        else visualizerCtx.lineTo(x, y);
      }
      visualizerCtx.stroke();
    }
  }
  drawVisualizer();

  // ==========================================================================
  // 6. Project 2: Nightlight Collection (Dynamic Lighting & Theme Shift)
  // ==========================================================================
  const lampCards = document.querySelectorAll('.lamp-card');
  lampCards.forEach(card => {
    card.addEventListener('click', () => {
      lampCards.forEach(c => c.classList.remove('active-lamp'));
      card.classList.add('active-lamp');

      const lampType = card.dataset.lamp;
      if (lampType === 'crescent') {
        toggleThemeMode(true);
      } else if (lampType === 'firefly') {
        document.body.style.setProperty('--ambient-brightness', '0.94');
        audio.playChime('E5', 1.0);
        toggleThemeMode(true);
      } else if (lampType === 'mushroom') {
        document.body.style.setProperty('--ambient-brightness', '1.05');
        audio.playChime('A5', 1.0);
        toggleThemeMode(true);
      }
    });
  });

  // ==========================================================================
  // 7. Project 3: Vintage Celestial Dream Atlas & Rooftop Chart
  // ==========================================================================
  const mapModal = document.getElementById('mapInfoModal');
  const mapStopTitle = document.getElementById('mapStopTitle');
  const mapStopDesc = document.getElementById('mapStopDesc');
  const dossierIcon = document.getElementById('dossierIcon');
  const dossierCoords = document.getElementById('dossierCoords');
  const dossierRecipient = document.getElementById('dossierRecipient');
  const dossierCreatures = document.getElementById('dossierCreatures');
  const dossierSleepLevel = document.getElementById('dossierSleepLevel');
  const dossierCargo = document.getElementById('dossierCargo');
  const dossierStatus = document.getElementById('dossierDeliveryStatus');
  const compassNeedle = document.getElementById('compassNeedle');
  const pipCloudFlyer = document.getElementById('pipCloudFlyer');
  const deliverToStationBtn = document.getElementById('deliverToStationBtn');
  const simFlightBtn = document.getElementById('simFlightBtn');

  const atlasWaypoints = {
    stop1: {
      title: 'Station 01: Midnight Nursery Atelier',
      icon: '🏰',
      coords: 'LAT 12° 24′ N · ALT 180 FT',
      recipient: 'Pip\'s Workshop & Stardust Kettles',
      creatures: 'All Town Little Ones',
      sleepLevel: '98.4% (Deep Snooze)',
      cargo: '12x Bottled Starlight, 4x Lullaby Jars',
      desc: '“This is where my brass kettles whistle! Before evening flight, I check every corked jar for leaks. One drop of lavender dew spilled on the rug, and the attic mice slept for 14 hours straight!”',
      x: 120, y: 210, angle: -45
    },
    stop2: {
      title: 'Station 02: Fluffy Bunny Burrows',
      icon: '🐇',
      coords: 'LAT 34° 12′ N · ALT 40 FT',
      recipient: 'The Clover Hollow Warrens',
      creatures: '8 Baby Cottontails',
      sleepLevel: '94.2% (Dozing in Moss)',
      cargo: '8x Crisp Golden Carrot Dreams',
      desc: '“Baby bunnies dream fast! Their little noses twitch while sleeping. I leave jars of dandelion fluff right by the tunnel entrance so the breeze carries sweet carrot lullabies underground.”',
      x: 280, y: 150, angle: 25
    },
    stop3: {
      title: 'Station 03: Kitten Crib High Attic',
      icon: '🐱',
      coords: 'LAT 48° 35′ N · ALT 195 FT',
      recipient: 'The Cobblestone Chimney Rooftops',
      creatures: 'Barnaby & Luna (Calico Kittens)',
      sleepLevel: '96.8% (Purring Rhythm)',
      cargo: '6x Floating Golden Yarn Clouds, 2x Warm Cream Jars',
      desc: '“Chimneys are the coziest spots in town! Calico kittens love the warmth of brick. When I glide past their window, I tap a five-note chime on the roof tiles. They start purring before they even close their eyes.”',
      x: 430, y: 120, angle: 55
    },
    stop4: {
      title: 'Station 04: Whispering Pine Hollow',
      icon: '🌲',
      coords: 'LAT 22° 50′ N · ALT 90 FT',
      recipient: 'The Deep Evergreen Glade',
      creatures: 'Sleeping Bear Cubs & Hedgehogs',
      sleepLevel: '99.1% (Heavy Slumber)',
      cargo: '10x Blackberry Honey Mist, 14x Firefly Orbs',
      desc: '“The Sleepy Pines have the tallest trees! Forest creatures sleep on pine needle quilts. I hang little firefly lanterns from the branches so the bear cubs feel safe from the dark shadows.”',
      x: 570, y: 200, angle: 110
    },
    stop5: {
      title: 'Station 05: The Cloud Nest Observatory',
      icon: '🦉',
      coords: 'LAT 70° 08′ N · ALT 310 FT',
      recipient: 'The High Cumulus Roost',
      creatures: 'Fledgling Owlets & Night Sparrows',
      sleepLevel: '91.5% (Pre-Flight Nap)',
      cargo: '4x Feather-Soft Wind Lullabies',
      desc: '“Perched right on top of the silver cumulus clouds! The little owlets are learning night flight, but they get so sleepy. I leave a music box playing Starlight Waltz right between their downy wings.”',
      x: 710, y: 130, angle: 65
    },
    stop6: {
      title: 'Station 06: Cape Snooze & Starlight Lighthouse',
      icon: '⚓',
      coords: 'LAT 62° 44′ N · ALT 240 FT',
      recipient: 'The Velvet Ocean Slumber Beacon',
      creatures: 'Sleepy Dream-Ships & Travelers',
      sleepLevel: '99.9% (Oceanic Drift)',
      cargo: '1x Golden Slumber Beam, 20x Foam Blankets',
      desc: '“Where the land ends and the ocean of sleep begins! The lighthouse turns with a soft humming light that guides tired minds safely into dreamland without tossing or turning.”',
      x: 800, y: 240, angle: 135
    }
  };

  let activeAtlasStop = 'stop1';

  function selectAtlasStop(stopKey, playSound = true) {
    const data = atlasWaypoints[stopKey];
    if (!data) return;
    activeAtlasStop = stopKey;

    document.querySelectorAll('.map-waypoint').forEach(pt => {
      pt.classList.toggle('active', pt.dataset.stop === stopKey);
    });

    // Animate compass needle rotation
    if (compassNeedle) {
      compassNeedle.style.transform = `rotate(${data.angle}deg)`;
      if (playSound && audio.playCompassTick) audio.playCompassTick();
    }

    // Move Pip on Cloud Flyer smoothly
    if (pipCloudFlyer) {
      pipCloudFlyer.style.transform = `translate(${data.x}px, ${data.y}px)`;
      pipCloudFlyer.classList.add('flying');
      setTimeout(() => pipCloudFlyer.classList.remove('flying'), 1200);
    }

    // Populate Dossier
    if (mapStopTitle) mapStopTitle.textContent = data.title;
    if (mapStopDesc) mapStopDesc.textContent = data.desc;
    if (dossierIcon) dossierIcon.textContent = data.icon;
    if (dossierCoords) dossierCoords.textContent = data.coords;
    if (dossierRecipient) dossierRecipient.textContent = data.recipient;
    if (dossierCreatures) dossierCreatures.textContent = data.creatures;
    if (dossierSleepLevel) dossierSleepLevel.textContent = data.sleepLevel;
    if (dossierCargo) dossierCargo.textContent = data.cargo;
    if (dossierStatus) dossierStatus.textContent = '● Ready for Bedtime Drop';

    if (mapModal) mapModal.classList.add('visible');
    if (playSound) audio.playChime('G5', 1.1);
  }

  document.querySelectorAll('.map-waypoint').forEach(point => {
    point.addEventListener('click', () => {
      selectAtlasStop(point.dataset.stop, true);
    });
  });

  // Deliver to Station button
  if (deliverToStationBtn) {
    deliverToStationBtn.addEventListener('click', () => {
      incrementHitCounter(1);
      audio.playChime('C6', 1.2);
      if (dossierStatus) {
        dossierStatus.textContent = '✓ Dream Delivered to ' + (atlasWaypoints[activeAtlasStop]?.recipient || 'Station') + '!';
        dossierStatus.style.color = '#f59e0b';
      }
    });
  }

  // Simulate Full Flight Route across all 6 stops
  let isSimulating = false;
  if (simFlightBtn) {
    simFlightBtn.addEventListener('click', () => {
      if (isSimulating) return;
      isSimulating = true;
      simFlightBtn.disabled = true;
      simFlightBtn.innerHTML = '<span>🚀 Flight En Route...</span>';

      const stopKeys = ['stop1', 'stop2', 'stop3', 'stop4', 'stop5', 'stop6', 'stop1'];
      let idx = 0;

      function stepFlight() {
        if (idx < stopKeys.length) {
          selectAtlasStop(stopKeys[idx], true);
          incrementHitCounter(1);
          idx++;
          setTimeout(stepFlight, 1500);
        } else {
          isSimulating = false;
          simFlightBtn.disabled = false;
          simFlightBtn.innerHTML = '<span>▶ Simulate Full Flight Route</span>';
          audio.playSecretCelebration();
        }
      }
      stepFlight();
    });
  }

  // Atlas Filter Buttons
  document.querySelectorAll('.atlas-filter').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.atlas-filter').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const cat = btn.dataset.filter;

      document.querySelectorAll('.map-waypoint').forEach(wp => {
        if (cat === 'all' || wp.dataset.cat === cat) {
          wp.style.display = '';
        } else {
          wp.style.display = 'none';
        }
      });
    });
  });

  // Initialize first stop
  selectAtlasStop('stop1', false);

  // ==========================================================================
  // 8. Project 4: Playable Nursery Blocks
  // ==========================================================================


  // ==========================================================================
  // 9. Section 3: Vintage 3D Flipping Storybook (Recited by Pip)
  // ==========================================================================
  const storyChapters = [
    {
      chapNum: "Chapter I",
      title: "The Attic Cradle & Constellation Silk",
      leftFolio: "Midnight Nursery Archives · Dispatch #001",
      rightFolio: "Recited by Pip the Skull Baby",
      leftContent: `
        <h3 class="page-chapter-lead">Found in <em>Constellation Silk</em></h3>
        <p class="page-body-narrative">
          <span class="drop-cap">I</span> don't know where the stardust carried me from, but one frosty winter midnight, the attic mice heard a tiny giggle echoing from the highest timber beams of Midnight Nursery.
        </p>
        <p class="page-body-narrative">
          There I was! Swaddled in an antique wicker basket lined with constellation silk, wearing my starry nightcap with a little pink bow.
        </p>
        <div class="pip-margin-note">
          “Pip's Note: The mice thought I was a spooky crypt ghost until I sneezed and asked for warm oat milk!”
        </div>
      `,
      rightContent: `
        <p class="page-body-narrative">
          Most skeleton folk dwell in chilly crypts and love cobwebs. But I was born with two warm glowing amber pinpricks in my eye sockets and a crooked smile that couldn't stop grinning.
        </p>
        <p class="page-body-narrative">
          When the oak floorboards creaked, I clapped! When the wind howled outside, I hummed! From my very first breath, I decreed the First Law of Midnight Nursery: <em>Nobody should ever have to sleep in silence.</em>
        </p>
        <span class="pip-seal-badge">★ ATELIER RECORDED · 1892</span>
      `
      ,
      mobileStory: `
        <h3 class="page-chapter-lead">The Attic Cradle</h3>
        <p class="page-body-narrative">Pip was born in a dusty attic beneath glowing stars. With amber eyes and a crooked smile, he listened to the wind. Every night, he hummed to the darkness, promising that no lonely soul would ever sleep without a dream.</p>
      `},
    {
      chapNum: "Chapter II",
      title: "The Village of Restless Sleepers",
      leftFolio: "Midnight Nursery Archives · Dispatch #002",
      rightFolio: "Recited by Pip the Skull Baby",
      leftContent: `
        <h3 class="page-chapter-lead">The Restless <em>Midnight Town</em></h3>
        <p class="page-body-narrative">
          <span class="drop-cap">E</span>very evening as twilight turned indigo, I would climb onto the nursery windowsill and peer down at the chimney tops of town.
        </p>
        <p class="page-body-narrative">
          Through open bedroom casements, I could hear sad little whimpers. Baby bunnies were twitching in their clover nests; sleepy calico kittens were having thorny nightmares of loud thunderstorms.
        </p>
        <div class="pip-margin-note">
          “A nightmare is just a dream that forgot its blanket. It only needs someone gentle to tuck it in.”
        </div>
      `,
      rightContent: `
        <p class="page-body-narrative">
          My heart felt so heavy. Why should nighttime be frightening? Night is supposed to be the world's softest velvet hug!
        </p>
        <p class="page-body-narrative">
          I realized that nobody was watching over the bedtime realm. The adult dreamweavers were too busy crafting complicated adult thoughts like taxes and clock-watching. Little creatures needed someone who understood yawns.
        </p>
        <span class="pip-seal-badge">★ THE FIRST CALLING</span>
      `
      ,
      mobileStory: `
        <h3 class="page-chapter-lead">The Sleepless Village</h3>
        <p class="page-body-narrative">Beyond the attic lay a village where nobody could sleep peacefully. Children chased disappearing dreams, grown-ups tossed beneath tangled blankets, and even the cats looked exhausted. Pip set off beneath the moon to discover why the village had forgotten how to dream.</p>
      `},
    {
      chapNum: "Chapter III",
      title: "The Secret Recipe in Brass Kettles",
      leftFolio: "Midnight Nursery Archives · Dispatch #003",
      rightFolio: "Recited by Pip the Skull Baby",
      leftContent: `
        <h3 class="page-chapter-lead">Brewing <em>Bedtime Mist</em></h3>
        <p class="page-body-narrative">
          <span class="drop-cap">I</span> had to stack three wooden playroom blocks to reach the attic's giant antique brass kettles!
        </p>
        <p class="page-body-narrative">
          I gathered dried chamomile heads from the pantry, three spoons of lavender dew, crushed peppermint fog, and three sparkling droplets of condensed starlight from the skylight.
        </p>
        <div class="pip-margin-note">
          “Secret recipe tip: Stir clockwise for sweet dreams, counter-clockwise only if baking lullaby bread!”
        </div>
      `,
      rightContent: `
        <p class="page-body-narrative">
          The kettles bubbled and began to whistle in pure pentatonic chimes—C5, E5, G5! Soon, puffs of pastel strawberry-scented steam rose from our chimney.
        </p>
        <p class="page-body-narrative">
          I corked the glowing vapor into little glass apothecary jars. Whenever I uncorked a test jar near a fretful creature, their eyelids fluttered, their breathing slowed, and a sweet smile spread across their sleepy face.
        </p>
        <span class="pip-seal-badge">★ RECIPE CERTIFIED #48</span>
      `
      ,
      mobileStory: `
        <h3 class="page-chapter-lead">The Brass Kettles</h3>
        <p class="page-body-narrative">Pip discovered ancient brass kettles bubbling with dream magic. He mixed moonlight, stardust, sleepy petals, and one wiggly cloud. The mixture exploded into glittering bubbles! His kitchen became a magnificent mess, but he had created something wonderful: dreams made for every sleeping heart.</p>
      `},
    {
      chapNum: "Chapter IV",
      title: "The Legendary Council Exam",
      leftFolio: "Midnight Nursery Archives · Dispatch #004",
      rightFolio: "Recited by Pip the Skull Baby",
      leftContent: `
        <h3 class="page-chapter-lead">The Knot of <em>Nightmares</em></h3>
        <p class="page-body-narrative">
          <span class="drop-cap">W</span>ord quickly reached the High Council of Slumber Weavers: an unauthorized skull baby was distributing bottled dreams!
        </p>
        <p class="page-body-narrative">
          Three ancient Grand Elder Owls swooped through our skylight. “Engineering dreams requires iron logic and strict discipline!” they hooted. To test me, they conjured the Knot of Nightmares—a fearsome shadow storm of sharp brambles.
        </p>
        <div class="pip-margin-note">
          “The Elders expected me to cast a battle spell. But monsters are usually just very tired.”
        </div>
      `,
      rightContent: `
        <p class="page-body-narrative">
          I didn't run away or summon shields. I just crawled over with my softest patchwork blanket, wrapped it around the trembling shadow-beast, and wound up my little wooden music box.
        </p>
        <p class="page-body-narrative">
          As the five-note lullaby echoed, the fearsome shadow yawned, curled up like a sleepy kitten, and dissolved into floating pink stardust. The Grand Elders' beaks dropped wide open!
        </p>
        <span class="pip-seal-badge">★ TRIAL PASSED · 100%</span>
      `
      ,
      mobileStory: `
        <h3 class="page-chapter-lead">The Dream Council</h3>
        <p class="page-body-narrative">The Dream Council tested Pip's magic. He stumbled over enchanted books, spilled dream powder, and summoned twelve snoring frogs! Everyone giggled, but Pip refused to quit. He discovered that true dream magic came from kindness, courage, and never giving up.</p>
      `},
    {
      chapNum: "Chapter V",
      title: "The Golden Wrench & First Solo Flight",
      leftFolio: "Midnight Nursery Archives · Dispatch #005",
      rightFolio: "Recited by Pip the Skull Baby",
      leftContent: `
        <h3 class="page-chapter-lead">The <em>Official</em> Inducted Engineer</h3>
        <p class="page-body-narrative">
          <span class="drop-cap">T</span>he Elder Weavers wiped liquid amber tears from their feathers. The High Chancellor knelt down and pinned the Golden Crescent Insignia to my starry nightcap.
        </p>
        <p class="page-body-narrative">
          They handed me the ceremonial brass wrench and the keys to the cloud docks. “From this midnight forth,” the Chancellor proclaimed, “you are officially Pip, Junior Dream Engineer of Midnight Nursery!”
        </p>
        <div class="pip-margin-note">
          “My nightcap bow tilted with pride. I was only six months old, but I had a whole town to tuck in!”
        </div>
      `,
      rightContent: `
        <p class="page-body-narrative">
          That very evening when the nursery clocks chimed 17:17, I climbed aboard my gentle cumulus cloud, strapped my porcelain crescent lantern to the bow, and took my first solo flight across the chimneys.
        </p>
        <p class="page-body-narrative">
          The chimney tops were quiet, the stars were sparkling like friendly fireflies, and I knew I had found my life's true craft: building the dreams the whole world falls asleep inside.
        </p>
        <span class="pip-seal-badge">★ OFFICIAL LICENSE #007</span>
      `
      ,
      mobileStory: `
        <h3 class="page-chapter-lead">The Golden Wrench</h3>
        <p class="page-body-narrative">Pip repaired the ancient dream-delivery machine with his golden wrench. Its wings rattled, its engine sneezed, and his first flight nearly ended in a chimney! Still, he soared above the rooftops, delivering sweet dreams to every home beneath the stars.</p>
      `},
    {
      chapNum: "Chapter VI",
      title: "Tonight's Mission & Bedtime Whisper",
      leftFolio: "Midnight Nursery Archives · Epilogue",
      rightFolio: "Recited by Pip the Skull Baby",
      leftContent: `
        <h3 class="page-chapter-lead">Tonight's <em>Bedtime Whisper</em></h3>
        <p class="page-body-narrative">
          <span class="drop-cap">A</span>nd that, sleepy traveler, is the true tale of how a gentle skull baby earned his wings!
        </p>
        <p class="page-body-narrative">
          Every single night, I still climb onto my cloud with freshly boiled starlight jars, warm marshmallow clouds, and sweet pentatonic music boxes.
        </p>
        <div class="pip-margin-note">
          “Look out your window tonight—if you see a glowing golden light bobbing past the moon, wave hello to me!”
        </div>
      `,
      rightContent: `
        <p class="page-body-narrative">
          Your dream is next on tonight's manifest. I packed extra lavender mist, two purring kitten clouds, and a soft breeze that warms your toes.
        </p>
        <p class="page-body-narrative">
          Close your eyes now. Pull your covers snug. Breathe in deep... and let yourself drift into the sky. Sweet, beautiful dreams!
        </p>
        <div style="margin-top: 14px;">
          <button id="bookLullabyBtn" class="btn-primary" type="button" style="font-size:0.88rem; padding:8px 16px;">
            <span>▶ Play Pip's Bedtime Lullaby</span>
          </button>
        </div>
        <span class="pip-seal-badge">★ REST PEACEFULLY TONIGHT</span>
      `
      ,
      mobileStory: `
        <h3 class="page-chapter-lead">Tonight's Mission</h3>
        <p class="page-body-narrative">Every night, Pip gathers forgotten dreams, repairs broken wishes, and tucks tiny stars into sleepy hearts. "Close your eyes, little star," he whispers. "I'll guard your dreams until morning." Then Pip smiles, knowing tomorrow will bring another magical adventure.</p>
        <button id="bookLullabyBtn" class="btn-primary" type="button" style="font-size:0.88rem; padding:8px 16px;"><span>▶ Play Pip's Bedtime Lullaby</span></button>
      `}
  ];

  let currentBookPage = 0;
  const leftChapNum = document.getElementById('leftChapNum');
  const leftPageNum = document.getElementById('leftPageNum');
  const leftPageContent = document.getElementById('leftPageContent');
  const rightChapNum = document.getElementById('rightChapNum');
  const rightPageNum = document.getElementById('rightPageNum');
  const rightPageContent = document.getElementById('rightPageContent');
  const bookPageIndicator = document.getElementById('bookPageIndicator');
  const flippingLeaf = document.getElementById('flippingLeaf');
  const pageDogEar = document.getElementById('pageDogEar');
  const prevPageBtn = document.getElementById('prevPageBtn');
  const nextPageBtn = document.getElementById('nextPageBtn');
  const bookTurnPrev = document.getElementById('bookTurnPrev');
  const bookTurnNext = document.getElementById('bookTurnNext');

  function renderBookChapter(index, direction = null) {
    if (index < 0) index = 0;
    if (index >= storyChapters.length) index = storyChapters.length - 1;
    currentBookPage = index;

    const data = storyChapters[index];
    if (!data) return;

    if (direction && flippingLeaf) {
      if (audio.playPageFlip) audio.playPageFlip();
      flippingLeaf.className = 'book-page-leaf-flipping ' + (direction === 'forward' ? 'turn-forward' : 'turn-backward');
      setTimeout(() => {
        applyPageDOM(data, index);
      }, 350);
      setTimeout(() => {
        flippingLeaf.className = 'book-page-leaf-flipping';
      }, 760);
    } else {
      applyPageDOM(data, index);
    }
  }

  function applyPageDOM(data, index) {
    const mobileView = window.matchMedia('(max-width: 768px)').matches;

    if (leftChapNum) leftChapNum.textContent = data.chapNum;
    if (leftPageNum) leftPageNum.textContent = `Page ${index * 2 + 1}`;
    if (leftPageContent) leftPageContent.innerHTML = mobileView ? '' : data.leftContent;

    if (rightChapNum) rightChapNum.textContent = mobileView
      ? data.chapNum
      : 'Dispatch #' + String(index + 1).padStart(3, '0');
    if (rightPageNum) rightPageNum.textContent = mobileView
      ? `Chapter ${index + 1} of ${storyChapters.length}`
      : `Page ${index * 2 + 2}`;
    if (rightPageContent) {
      rightPageContent.innerHTML = mobileView && data.mobileStory
        ? data.mobileStory
        : data.rightContent;
    }

    if (bookPageIndicator) {
      bookPageIndicator.textContent = `Chapter ${index + 1} of ${storyChapters.length}`;
    }

    document.querySelectorAll('.ribbon-tab').forEach((tab, i) => {
      tab.classList.toggle('active', i === index);
    });
    const dots = document.querySelectorAll('#bookProgressDots .dot');
    dots.forEach((dot, i) => dot.classList.toggle('active', i === index));

    const bookLullabyBtn = document.getElementById('bookLullabyBtn');
    if (bookLullabyBtn && !bookLullabyBtn.dataset.wired) {
      bookLullabyBtn.dataset.wired = 'true';
      bookLullabyBtn.addEventListener('click', () => {
        audio.startLullaby(0);
        updateLullabyUI(true);
      });
    }
  }

  // Keep the story appropriate when the viewport changes between desktop and mobile.
  let storybookResizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(storybookResizeTimer);
    storybookResizeTimer = setTimeout(() => renderBookChapter(currentBookPage), 120);
  });

  function turnBookPage(dir) {
    if (dir === 'next' && currentBookPage < storyChapters.length - 1) {
      renderBookChapter(currentBookPage + 1, 'forward');
    } else if (dir === 'prev' && currentBookPage > 0) {
      renderBookChapter(currentBookPage - 1, 'backward');
    }
  }

  if (nextPageBtn) nextPageBtn.addEventListener('click', () => turnBookPage('next'));
  if (prevPageBtn) prevPageBtn.addEventListener('click', () => turnBookPage('prev'));
  if (bookTurnNext) bookTurnNext.addEventListener('click', () => turnBookPage('next'));
  if (bookTurnPrev) bookTurnPrev.addEventListener('click', () => turnBookPage('prev'));
  if (pageDogEar) pageDogEar.addEventListener('click', () => turnBookPage('next'));

  // Ribbon tabs click
  document.querySelectorAll('.ribbon-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      const targetPage = parseInt(tab.dataset.page, 10) || 0;
      if (targetPage !== currentBookPage) {
        renderBookChapter(targetPage, targetPage > currentBookPage ? 'forward' : 'backward');
      }
    });
  });

  // Initial render of first chapter
  renderBookChapter(0);

  // ==========================================================================
  // 10. Side Quest: Vintage Mechanical Tumbling Drum Odometer (+1 pt)
  // ==========================================================================
  const drumRack = document.getElementById('odometerDrumRack');
  let dreamCount = parseInt(localStorage.getItem('pip_delivered_dreams') || '1248', 10);
  const DIGIT_HEIGHT = 54; // px

  function setupMechanicalOdometer() {
    if (!drumRack) return;
    drumRack.innerHTML = '';

    for (let col = 0; col < 6; col++) {
      const column = document.createElement('div');
      column.className = 'drum-column';
      column.id = `drumCol_${col}`;

      const strip = document.createElement('div');
      strip.className = 'drum-strip';
      strip.id = `drumStrip_${col}`;

      // 0 through 9 plus repeat 0
      for (let digit = 0; digit <= 10; digit++) {
        const digElem = document.createElement('div');
        digElem.className = 'drum-digit';
        digElem.textContent = String(digit % 10);
        strip.appendChild(digElem);
      }

      column.appendChild(strip);
      drumRack.appendChild(column);
    }
  }

  function updateOdometerDisplay(animateSound = true) {
    const formatted = String(dreamCount).padStart(6, '0');
    formatted.split('').forEach((char, col) => {
      const strip = document.getElementById(`drumStrip_${col}`);
      if (strip) {
        const val = parseInt(char, 10);
        strip.style.transform = `translateY(-${val * DIGIT_HEIGHT}px)`;
      }
    });

    if (animateSound && audio.playMechanicalClick) {
      audio.playMechanicalClick();
    }
  }

  function incrementHitCounter(amount = 1, showSparkles = true) {
    dreamCount += amount;
    localStorage.setItem('pip_delivered_dreams', String(dreamCount));
    updateOdometerDisplay(true);

    if (showSparkles) {
      const rack = document.getElementById('odometerDrumRack');
      if (rack) {
        rack.style.boxShadow = '0 0 20px #fbbf24';
        setTimeout(() => { rack.style.boxShadow = ''; }, 300);
      }
    }
  }

  setupMechanicalOdometer();
  updateOdometerDisplay(false);

  // Attach all .deliver-dream-trigger elements across the site
  document.querySelectorAll('.deliver-dream-trigger').forEach(btn => {
    btn.addEventListener('click', () => {
      const amount = parseInt(btn.dataset.amount, 10) || 1;
      incrementHitCounter(amount);
      audio.playChime('C6', 1.0);
    });
  });

  // Ambient Heartbeat Ticker: delivers 1 dream every 14 seconds globally
  setInterval(() => {
    incrementHitCounter(1, false);
  }, 14000);

  // ==========================================================================
  // 10. Side Quest: Live Dream Guestbook (+2 pts)
  // ==========================================================================
  const guestbookForm = document.getElementById('guestbookForm');
  const guestNameInput = document.getElementById('guestName');
  const guestWishInput = document.getElementById('guestWish');
  const wishesFeed = document.getElementById('wishesFeed');

  const defaultWishes = [
    { name: 'Luna the Baby Ghost', text: 'Thank you Pip for the warm marshmallow dream! I slept for 9 hours! 👻', time: 'Just now' },
    { name: 'Barnaby the Little Owl', text: 'The Starlight Waltz lullaby is the prettiest tune in the whole forest. 🦉', time: '1 hour ago' },
    { name: 'haX Builder #42', text: 'Pip, your portfolio made my heart melt. Good luck in the hackathon! 💖', time: 'Today' }
  ];

  let storedWishes = JSON.parse(localStorage.getItem('pip_guestbook_wishes') || 'null');
  if (!storedWishes || !storedWishes.length) {
    storedWishes = defaultWishes;
    localStorage.setItem('pip_guestbook_wishes', JSON.stringify(storedWishes));
  }

  function renderWishes() {
    if (!wishesFeed) return;
    wishesFeed.innerHTML = '';
    storedWishes.forEach(wish => {
      const item = document.createElement('div');
      item.className = 'wish-item';
      item.innerHTML = `
        <div class="wish-header">
          <span class="wish-author">${escapeHTML(wish.name)}</span>
          <span class="wish-time">${escapeHTML(wish.time)}</span>
        </div>
        <p class="wish-text">${escapeHTML(wish.text)}</p>
      `;
      wishesFeed.appendChild(item);
    });
  }

  function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, tag => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
    }[tag] || tag));
  }

  renderWishes();

  if (guestbookForm) {
    guestbookForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = (guestNameInput.value || '').trim();
      const wish = (guestWishInput.value || '').trim();
      if (!name || !wish) return;

      const newWish = { name, text: wish, time: 'Just now' };
      storedWishes.unshift(newWish);
      localStorage.setItem('pip_guestbook_wishes', JSON.stringify(storedWishes));
      renderWishes();

      guestNameInput.value = '';
      guestWishInput.value = '';

      audio.playSecretCelebration();
      incrementHitCounter(1);
    });
  }

  // ==========================================================================
  // 11. Hidden Easter Egg: Nightcap Bow Click Trigger
  // ==========================================================================
  const secretBow = document.getElementById('secretEasterEgg');
  let bowClicks = 0;

  if (secretBow) {
    secretBow.addEventListener('click', (e) => {
      e.stopPropagation();
      bowClicks++;
      audio.playChime('C6', 0.8);

      if (bowClicks >= 3) {
        bowClicks = 0;
        triggerConfettiCelebration(e.clientX, e.clientY);
        audio.playSecretCelebration();

        // Baby giggle notification
        const banner = document.createElement('div');
        banner.style.cssText = `
          position: fixed; top: 80px; left: 50%; transform: translateX(-50%);
          background: #a34063; color: #fff; padding: 14px 28px;
          border-radius: 999px; font-family: 'Fredoka', sans-serif; font-weight: 700;
          box-shadow: 0 12px 30px rgba(163,64,99,0.4); z-index: 10000; animation: slideUp 0.3s ease;
        `;
        banner.innerHTML = '🎉 EASTER EGG FOUND! Pip giggles and grants you 100 Sweet Dreams! ✨';
        document.body.appendChild(banner);
        setTimeout(() => banner.remove(), 4000);

        incrementHitCounter(100);
      }
    });
  }

  // Lightweight HTML5 Canvas Confetti Engine
  function triggerConfettiCelebration(originX, originY) {
    const canvas = document.createElement('canvas');
    canvas.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:99999;';
    document.body.appendChild(canvas);
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = [];
    const colors = ['#f472b6', '#fbbf24', '#a34063', '#fff8f1', '#60a5fa'];

    for (let i = 0; i < 90; i++) {
      particles.push({
        x: originX || canvas.width / 2,
        y: originY || canvas.height / 2,
        vx: (Math.random() - 0.5) * 16,
        vy: (Math.random() - 0.8) * 18,
        size: Math.random() * 8 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        vr: (Math.random() - 0.5) * 15,
        opacity: 1
      });
    }

    let frame = 0;
    function render() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let alive = false;

      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.4; // gravity
        p.rotation += p.vr;
        p.opacity -= 0.012;

        if (p.opacity > 0) {
          alive = true;
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate((p.rotation * Math.PI) / 180);
          ctx.fillStyle = p.color;
          ctx.globalAlpha = Math.max(0, p.opacity);
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
          ctx.restore();
        }
      });

      if (alive && frame < 180) {
        frame++;
        requestAnimationFrame(render);
      } else {
        canvas.remove();
      }
    }
    render();
  }
});

/* 🎨 PIP'S SCRIBBLE STUDIO */

(() => {
  const canvas = document.getElementById("scribbleCanvas");
  if (!canvas || canvas.dataset.ready) return;
  canvas.dataset.ready = "true";

  const ctx = canvas.getContext("2d");
  const color = document.getElementById("scribbleColor");
  const size = document.getElementById("scribbleSize");
  const eraser = document.getElementById("scribbleEraser");
  const clear = document.getElementById("scribbleClear");
  const save = document.getElementById("scribbleSave");
  const hint = document.getElementById("scribbleHint");

  let drawing = false;
  let eraseMode = false;
  let lastX = 0;
  let lastY = 0;

  function resizeCanvas() {
    const rect = canvas.getBoundingClientRect();
    const old = document.createElement("canvas");
    old.width = canvas.width;
    old.height = canvas.height;
    old.getContext("2d").drawImage(canvas, 0, 0);

    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (old.width && old.height) {
      ctx.drawImage(old, 0, 0, old.width, old.height,
        0, 0, rect.width, rect.height);
    }
  }

  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);

  function position(e) {
    const rect = canvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  canvas.addEventListener("pointerdown", e => {
    e.preventDefault();
    drawing = true;
    canvas.setPointerCapture(e.pointerId);

    const p = position(e);
    lastX = p.x;
    lastY = p.y;

    ctx.beginPath();
    ctx.arc(lastX, lastY, Math.max(1, size.value / 2), 0, Math.PI * 2);
    ctx.fillStyle = eraseMode ? "#fffdf8" : color.value;
    ctx.shadowColor = color.value;
    ctx.shadowBlur = eraseMode ? 0 : 14;
    ctx.fill();
    ctx.shadowBlur = 0;
    hint.style.display = "none";
  });

  canvas.addEventListener("pointermove", e => {
    if (!drawing) return;
    e.preventDefault();

    const p = position(e);
    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(p.x, p.y);
    ctx.lineWidth = size.value;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = eraseMode ? "#fffdf8" : color.value;
    ctx.shadowColor = color.value;
    ctx.shadowBlur = eraseMode ? 0 : 14;
    ctx.stroke();
    ctx.shadowBlur = 0;

    lastX = p.x;
    lastY = p.y;
  });

  function stopDrawing() {
    drawing = false;
    ctx.beginPath();
  }

  canvas.addEventListener("pointerup", stopDrawing);
  canvas.addEventListener("pointercancel", stopDrawing);
  canvas.addEventListener("lostpointercapture", stopDrawing);

  eraser.addEventListener("click", () => {
    eraseMode = !eraseMode;
    eraser.textContent = eraseMode ? "🖍️ Use crayon" : "🧽 Eraser";
    canvas.style.cursor = eraseMode ? "cell" : "crosshair";
  });

  clear.addEventListener("click", () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    hint.style.display = "block";
    eraseMode = false;
    eraser.textContent = "🧽 Eraser";
    canvas.style.cursor = "crosshair";
  });

  save.addEventListener("click", () => {
    const art = document.createElement("canvas");
    art.width = canvas.width;
    art.height = canvas.height;
    const artCtx = art.getContext("2d");
    artCtx.fillStyle = "#fffdf8";
    artCtx.fillRect(0, 0, art.width, art.height);
    artCtx.drawImage(canvas, 0, 0);

    const link = document.createElement("a");
    link.download = "pips-tiny-masterpiece.png";
    link.href = art.toDataURL("image/png");
    link.click();
  });
})();

/* 🧱 PIP'S FRESH BUILDING BLOCK GAME */
(() => {
  const area = document.getElementById("blocksBuildingArea");
  if (!area || area.dataset.ready) return;
  area.dataset.ready = "true";

  const message = document.getElementById("buildingBlocksMessage");
  const babyLaugh = new Audio("sounds/baby-laugh.mp3");
  babyLaugh.volume = 0.7;
  const palette = document.querySelector("#blocksSandbox .blocks-palette");
  const selectedColor = { value: "#ffabc8" };
  let selected = null;
  let count = 0;

  const say = text => {
    if (message) message.textContent = text;
  };

  function selectBlock(block) {
    if (selected) selected.style.outline = "";
    selected = block;
    selected.style.outline = "3px dashed #9b5675";
    selected.style.zIndex = 5;
    say("Block selected! Drag me around! ♡");
  }

  function makeBlock(letter, color, x, y) {
    const block = document.createElement("div");
    block.className = "building-block";
    block.textContent = letter;
    block.dataset.color = color;
    block.style.setProperty("--block-color", color);
    block.style.left = x + "px";
    block.style.top = y + "px";
    area.appendChild(block);

    block.addEventListener("pointerdown", e => {
      e.preventDefault();
      selectBlock(block);
      const bounds = area.getBoundingClientRect();
      const startX = e.clientX - block.getBoundingClientRect().left;
      const startY = e.clientY - block.getBoundingClientRect().top;
      block.setPointerCapture(e.pointerId);

      const move = ev => {
        const maxX = area.clientWidth - block.offsetWidth;
        const maxY = area.clientHeight - block.offsetHeight - 20;
        block.style.left = Math.max(0, Math.min(maxX,
          ev.clientX - bounds.left - startX)) + "px";
        block.style.top = Math.max(0, Math.min(maxY,
          ev.clientY - bounds.top - startY)) + "px";
      };

      const stop = () => {
        block.removeEventListener("pointermove", move);
        block.removeEventListener("pointerup", stop);
        block.removeEventListener("pointercancel", stop);
      };

      block.addEventListener("pointermove", move);
      block.addEventListener("pointerup", stop);
      block.addEventListener("pointercancel", stop);
    });

    block.addEventListener("click", () => selectBlock(block));
    return block;
  }

  const startingBlocks = [...area.querySelectorAll(".building-block")];
  startingBlocks.forEach((block, i) => {
    const color = block.dataset.color || "#ffabc8";
    block.style.setProperty("--block-color", color);
    block.style.left = (15 + i * 60) + "px";
    block.style.top = "20px";

    // Recreate the block with working drag controls.
    const letter = block.textContent;
    block.remove();
    makeBlock(letter, color, 15 + i * 60, 20);
  });

  palette?.querySelectorAll(".building-color").forEach(button => {
    button.addEventListener("click", () => {
      selectedColor.value = button.dataset.color;
      if (selected) {
        selected.dataset.color = selectedColor.value;
        selected.style.setProperty("--block-color", selectedColor.value);
      }
      say("Crayon color changed! 🎨");
    });
  });

  document.getElementById("addBuildingBlock")?.addEventListener("click", () => {
    const letters = ["♥", "★", "☁", "H", "A", "X", "☾"];
    const x = 10 + Math.random() * Math.max(0, area.clientWidth - 75);
    const y = 10 + Math.random() * Math.max(0, area.clientHeight - 100);

    const colors = [
      "#ffabc8", // Baby pink
      "#a9d9ff", // Sky blue
      "#ffe08a", // Butter yellow
      "#cbb8ff", // Lavender
      "#bde8b5", // Mint green
      "#ffcba4", // Peach
      "#f5b9e7"  // Cotton candy
    ];

    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    selectBlock(makeBlock(
      letters[count++ % letters.length],
      randomColor,
      x,
      y
    ));

    say("New block! Build something silly! 🧸");
  });

  document.getElementById("rotateBuildingBlock")?.addEventListener("click", () => {
    if (!selected) return say("Pick a block first! 🧸");
    const angle = Number(selected.dataset.angle || 0) + 15;
    selected.dataset.angle = angle;
    selected.style.transform = `rotate(${angle}deg)`;
  });


  document.getElementById("knockBuildingBlocks")?.addEventListener("click", () => {
    babyLaugh.pause();
    babyLaugh.currentTime = 0;

    babyLaugh.play().catch(err => {
      console.error("Baby laugh playback failed:", err);
    });

    area.querySelectorAll(".building-block").forEach(block => {
      block.style.left = Math.random() * Math.max(0,
        area.clientWidth - block.offsetWidth) + "px";
      block.style.top = Math.random() * Math.max(0,
        area.clientHeight - block.offsetHeight - 20) + "px";
      block.style.transform = `rotate(${Math.random() * 50 - 25}deg)`;
      block.dataset.angle = "0";
    });

    say("OOPSIE!! BLOCK BONK! 💥😂");
  });


  document.getElementById("resetBuildingBlocks")?.addEventListener("click", () => {
    area.querySelectorAll(".building-block").forEach(block => block.remove());
    selected = null;
    count = 0;
    ["H", "A", "X", "★", "☾"].forEach((letter, i) => {
      const colors = ["#ffabc8", "#a9d9ff", "#ffe08a", "#cbb8ff", "#bde8b5"];
      makeBlock(letter, colors[i], 15 + i * 60, 20);
    });
    say("Fresh blocks! Build something silly! ♡");
  });
})();
