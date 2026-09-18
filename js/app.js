/**
 * Boda Real Gustavo & Kamilah - Experiencia Interactiva Estilo Luis XV
 * Control maestro de animaciones, portal 3D, música (Bridgerton / Spotify), RSVP, calendario y efectos
 */

document.addEventListener('DOMContentLoaded', () => {
    initPortal();
    initVideoPlayer();
    initAudioSystem();
    initCountdown();
    initCalendarActions();
    initVenueMap();
    initRSVP();
    initBankCopy();
    initGuestbook();
    initParticles();
});

/* ==========================================================================
   1. PORTAL IMPERIAL & REVELACIÓN 3D
   ========================================================================== */
function initPortal() {
    const portalStage = document.getElementById('portal-stage');
    const medallionBtn = document.getElementById('portal-medallion-btn');
    const doorsContainer = document.querySelector('.portal-doors-container');
    const mainExp = document.getElementById('main-experience');

    if (!portalStage || !medallionBtn) return;

    let hasOpened = false;

    function triggerPortalOpen() {
        if (hasOpened) return;
        hasOpened = true;

        // 1. Sonido solemne de apertura de portón
        if (window.royalAudio) {
            window.royalAudio.playDoorOpenSound();
        }

        // 2. Iniciar la banda sonora oficial de inmediato
        playRoyalSoundtrack();

        // 3. Abrir puertas 3D lentamente con presencia y volumen majestuoso
        portalStage.classList.add('animating-open');
        if (mainExp) {
            mainExp.classList.add('revealed');
        }

        // 4. Retirar el portal suavemente al finalizar la apertura completa de 2.8s
        setTimeout(() => {
            portalStage.classList.add('doors-opened');
        }, 2900);
    }

    medallionBtn.addEventListener('click', triggerPortalOpen);
    medallionBtn.addEventListener('touchend', (e) => {
        e.preventDefault();
        triggerPortalOpen();
    });

    if (doorsContainer) {
        doorsContainer.addEventListener('click', () => {
            triggerPortalOpen();
        });
    }

    // Accesibilidad teclado
    medallionBtn.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            triggerPortalOpen();
        }
    });
}

/* ==========================================================================
   2. SISTEMA DE AUDIO (SPOTIFY BRIDGERTON + SYNTH FALLBACK)
   ========================================================================== */
let isAudioPlaying = false;

function initAudioSystem() {
    const musicBtn = document.getElementById('btn-toggle-music');
    const bgAudio = document.getElementById('royal-audio-stream');
    const widgetPlayBtn = document.getElementById('spotify-quick-play');

    if (musicBtn) {
        musicBtn.addEventListener('click', () => {
            toggleRoyalAudio();
        });
    }

    if (widgetPlayBtn) {
        widgetPlayBtn.addEventListener('click', () => {
            toggleRoyalAudio();
        });
    }

    if (bgAudio) {
        bgAudio.addEventListener('ended', () => {
            bgAudio.currentTime = 0;
            bgAudio.play().catch(() => {});
        });
    }
}

function playRoyalSoundtrack() {
    const bgAudio = document.getElementById('royal-audio-stream');
    if (bgAudio) {
        bgAudio.volume = 0.65;
        bgAudio.play().then(() => {
            isAudioPlaying = true;
            updateMusicUI(true);
        }).catch(() => {
            // Si el navegador bloquea la reproducción de stream o no hay red, usar sintetizador Web Audio
            if (window.royalAudio) {
                window.royalAudio.startRoyalMusic();
                isAudioPlaying = true;
                updateMusicUI(true);
            }
        });
    } else if (window.royalAudio) {
        window.royalAudio.startRoyalMusic();
        isAudioPlaying = true;
        updateMusicUI(true);
    }
}

function toggleRoyalAudio() {
    const bgAudio = document.getElementById('royal-audio-stream');
    if (isAudioPlaying) {
        if (bgAudio && !bgAudio.paused) {
            bgAudio.pause();
        }
        if (window.royalAudio) {
            window.royalAudio.stopRoyalMusic();
        }
        isAudioPlaying = false;
        updateMusicUI(false);
    } else {
        playRoyalSoundtrack();
    }
}

function updateMusicUI(isPlaying) {
    const musicBtn = document.getElementById('btn-toggle-music');
    const widgetPlayBtn = document.getElementById('spotify-quick-play');
    
    if (musicBtn) {
        musicBtn.style.opacity = isPlaying ? '1' : '0.5';
        musicBtn.style.boxShadow = isPlaying ? 'var(--gold-glow)' : 'none';
        musicBtn.setAttribute('aria-label', isPlaying ? 'Pausar música real' : 'Reproducir música real');
    }

    if (widgetPlayBtn) {
        widgetPlayBtn.innerHTML = isPlaying 
            ? `<svg viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg><span>Pausar</span>`
            : `<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg><span>Escuchar</span>`;
    }
}

/* ==========================================================================
   3. REPRODUCTOR DE VIDEO CINEMATOGRÁFICO ("NUESTRA HISTORIA")
   ========================================================================== */
function initVideoPlayer() {
    const videoContainer = document.getElementById('royal-video-container');
    const realVideo = document.getElementById('royal-wedding-video');
    const playOverlay = document.getElementById('video-play-overlay');
    const playBtn = document.getElementById('btn-play-pause');
    const progressFill = document.getElementById('video-progress-fill');
    const progressBar = document.getElementById('video-progress-bar');
    const timeTag = document.getElementById('video-time-tag');

    if (!videoContainer) return;

    let isPlaying = false;
    let simCurrentTime = 0;
    let simTotalDuration = 180;
    let simInterval = null;

    // Verificar si el video real tiene duración cargada
    if (realVideo) {
        realVideo.addEventListener('loadedmetadata', () => {
            updateRealProgress();
        });

        realVideo.addEventListener('timeupdate', () => {
            updateRealProgress();
        });

        realVideo.addEventListener('ended', () => {
            isPlaying = false;
            videoContainer.classList.remove('is-playing');
            if (playOverlay) playOverlay.style.display = 'flex';
            // Reanudar música de fondo al terminar el video
            playRoyalSoundtrack();
        });
    }

    function togglePlay() {
        if (realVideo && realVideo.duration && !isNaN(realVideo.duration)) {
            // Video real HTML5 cargado
            if (realVideo.paused) {
                // Pausar música ambiental para escuchar el video
                if (isAudioPlaying) {
                    toggleRoyalAudio();
                }
                realVideo.play().then(() => {
                    isPlaying = true;
                    videoContainer.classList.add('is-playing');
                    if (playOverlay) playOverlay.style.display = 'none';
                }).catch(() => {
                    fallbackSimulatedPlay();
                });
            } else {
                realVideo.pause();
                isPlaying = false;
                videoContainer.classList.remove('is-playing');
                if (playOverlay) playOverlay.style.display = 'flex';
            }
        } else {
            // Modo simulación visual
            fallbackSimulatedPlay();
        }
    }

    function fallbackSimulatedPlay() {
        isPlaying = !isPlaying;
        if (isPlaying) {
            videoContainer.classList.add('is-playing');
            if (playOverlay) playOverlay.style.display = 'none';
            if (window.royalAudio) window.royalAudio.playChime();

            simInterval = setInterval(() => {
                simCurrentTime = (simCurrentTime + 1) % simTotalDuration;
                const percent = (simCurrentTime / simTotalDuration) * 100;
                if (progressFill) progressFill.style.width = `${percent}%`;

                const curMin = Math.floor(simCurrentTime / 60);
                const curSec = (simCurrentTime % 60).toString().padStart(2, '0');
                const totMin = Math.floor(simTotalDuration / 60);
                const totSec = (simTotalDuration % 60).toString().padStart(2, '0');

                if (timeTag) {
                    timeTag.textContent = `${curMin}:${curSec} / ${totMin}:${totSec}`;
                }
            }, 1000);
        } else {
            videoContainer.classList.remove('is-playing');
            if (playOverlay) playOverlay.style.display = 'flex';
            clearInterval(simInterval);
        }
    }

    function updateRealProgress() {
        if (!realVideo || !realVideo.duration) return;
        const cur = realVideo.currentTime;
        const dur = realVideo.duration;
        const percent = (cur / dur) * 100;

        if (progressFill) progressFill.style.width = `${percent}%`;

        const curMin = Math.floor(cur / 60);
        const curSec = Math.floor(cur % 60).toString().padStart(2, '0');
        const totMin = Math.floor(dur / 60);
        const totSec = Math.floor(dur % 60).toString().padStart(2, '0');

        if (timeTag) {
            timeTag.textContent = `${curMin}:${curSec} / ${totMin}:${totSec}`;
        }
    }

    if (playOverlay) playOverlay.addEventListener('click', togglePlay);
    if (playBtn) playBtn.addEventListener('click', togglePlay);

    if (progressBar) {
        progressBar.addEventListener('click', (e) => {
            const rect = progressBar.getBoundingClientRect();
            const clickPos = (e.clientX - rect.left) / rect.width;
            if (realVideo && realVideo.duration) {
                realVideo.currentTime = clickPos * realVideo.duration;
                updateRealProgress();
            } else {
                simCurrentTime = Math.floor(clickPos * simTotalDuration);
            }
        });
    }
}

/* ==========================================================================
   4. CONTADOR REGRESIVO DE ÉPOCA (11 DE MARZO DE 2027)
   ========================================================================== */
function initCountdown() {
    // 11 de Marzo de 2027 a las 16:00 (Grabado oficial del sello)
    const targetDate = new Date('2027-03-11T16:00:00').getTime();

    const daysEl = document.getElementById('count-days');
    const hoursEl = document.getElementById('count-hours');
    const minsEl = document.getElementById('count-mins');
    const secsEl = document.getElementById('count-secs');

    if (!daysEl) return;

    function updateCountdown() {
        const now = new Date().getTime();
        const diff = targetDate - now;

        if (diff <= 0) {
            daysEl.textContent = '00';
            hoursEl.textContent = '00';
            minsEl.textContent = '00';
            secsEl.textContent = '00';
            return;
        }

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        daysEl.textContent = days.toString().padStart(2, '0');
        hoursEl.textContent = hours.toString().padStart(2, '0');
        minsEl.textContent = minutes.toString().padStart(2, '0');
        secsEl.textContent = seconds.toString().padStart(2, '0');
    }

    updateCountdown();
    setInterval(updateCountdown, 1000);
}

/* ==========================================================================
   5. CALENDARIO (.ICS & GOOGLE CALENDAR)
   ========================================================================== */
function initCalendarActions() {
    const btnIcs = document.getElementById('btn-calendar-ics');
    const btnGoogle = document.getElementById('btn-calendar-google');

    const eventDetails = {
        title: "Boda Real Gustavo & Kamilah",
        description: "Enlace matrimonial de Gustavo & Kamilah. Experiencia estilo Luis XV. Enlace de mapas: https://maps.app.goo.gl/oZcz7QiSqYajz8KaA",
        location: "Casa de Retiro Santa María de Los Altos",
        start: "20270311T160000",
        end: "20270312T040000"
    };


    if (btnGoogle) {
        btnGoogle.addEventListener('click', (e) => {
            e.preventDefault();
            const gCalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(eventDetails.title)}&dates=${eventDetails.start}/${eventDetails.end}&details=${encodeURIComponent(eventDetails.description)}&location=${encodeURIComponent(eventDetails.location)}`;
            window.open(gCalUrl, '_blank');
        });
    }

    if (btnIcs) {
        btnIcs.addEventListener('click', (e) => {
            e.preventDefault();
            const icsContent = [
                "BEGIN:VCALENDAR",
                "VERSION:2.0",
                "PRODID:-//Boda Gustavo y Kamilah//ES",
                "BEGIN:VEVENT",
                `UID:boda-gustavo-kamilah-2026`,
                `DTSTAMP:${eventDetails.start}Z`,
                `DTSTART:${eventDetails.start}`,
                `DTEND:${eventDetails.end}`,
                `SUMMARY:${eventDetails.title}`,
                `DESCRIPTION:${eventDetails.description}`,
                `LOCATION:${eventDetails.location}`,
                "STATUS:CONFIRMED",
                "END:VEVENT",
                "END:VCALENDAR"
            ].join("\r\n");

            const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
            const link = document.createElement('a');
            link.href = window.URL.createObjectURL(blob);
            link.setAttribute('download', 'Boda-Gustavo-y-Kamilah.ics');
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        });
    }
}

/* ==========================================================================
   6. MAPA & LOCALIZACIÓN EXACTA (CASA DE RETIRO SANTA MARÍA DE LOS ALTOS)
   ========================================================================== */
function initVenueMap() {
    const tabVintage = document.getElementById('tab-map-vintage');
    const tabLive = document.getElementById('tab-map-live');
    const imgVintage = document.getElementById('venue-vintage-img');
    const frameLive = document.getElementById('venue-live-frame');

    if (tabVintage && tabLive && imgVintage && frameLive) {
        tabVintage.addEventListener('click', () => {
            tabVintage.classList.add('active');
            tabLive.classList.remove('active');
            imgVintage.style.display = 'block';
            frameLive.style.display = 'none';
            if (window.royalAudio) window.royalAudio.playChime();
        });

        tabLive.addEventListener('click', () => {
            tabLive.classList.add('active');
            tabVintage.classList.remove('active');
            imgVintage.style.display = 'none';
            frameLive.style.display = 'block';
            if (window.royalAudio) window.royalAudio.playChime();
        });
    }

    const btnNavGoogle = document.getElementById('btn-nav-google');
    const btnNavWaze = document.getElementById('btn-nav-waze');

    const exactMapsUrl = "https://maps.app.goo.gl/oZcz7QiSqYajz8KaA";
    const coords = "10.3818345,-66.9404536";

    if (btnNavGoogle) {
        btnNavGoogle.addEventListener('click', (e) => {
            // Permitir navegación natural del enlace <a>
        });
    }

    if (btnNavWaze) {
        btnNavWaze.addEventListener('click', (e) => {
            // Permitir navegación natural del enlace <a>
        });
    }
}

/* ==========================================================================
   7. RSVP CON SELLO DE LACRE & NOTIFICACIÓN POR WHATSAPP
   ========================================================================== */
function initRSVP() {
    const rsvpForm = document.getElementById('royal-rsvp-form');
    const sealBtn = document.getElementById('btn-wax-seal');
    const modalBackdrop = document.getElementById('rsvp-success-modal');
    const modalCloseBtn = document.getElementById('btn-modal-close');
    const modalWhatsappBtn = document.getElementById('btn-modal-whatsapp');

    // Menú de banquete
    const menuItems = document.querySelectorAll('.menu-choice-item');
    menuItems.forEach(item => {
        item.addEventListener('click', () => {
            menuItems.forEach(m => m.classList.remove('selected'));
            item.classList.add('selected');
            const radio = item.querySelector('input[type="radio"]');
            if (radio) radio.checked = true;
            if (window.royalAudio) window.royalAudio.playChime();
        });
    });

    if (!rsvpForm || !sealBtn) return;

    rsvpForm.addEventListener('submit', (e) => {
        e.preventDefault();

        // Sonido de sellado de lacre y animación de estampado
        sealBtn.classList.add('stamping');
        if (window.royalAudio) window.royalAudio.playWaxSealSound();

        const formData = new FormData(rsvpForm);
        const guestData = {
            name: formData.get('guestName'),
            attending: formData.get('attendance'),
            guestsCount: formData.get('guestCount') || 1,
            banquet: formData.get('banquetMenu') || 'Solomillo Real',
            dietary: formData.get('dietaryReq') || 'Ninguna',
            song: formData.get('partySong') || '',
            blessing: formData.get('blessingMessage') || '',
            date: new Date().toISOString()
        };

        // Guardar localmente
        try {
            const list = JSON.parse(localStorage.getItem('gk_wedding_rsvps') || '[]');
            list.push(guestData);
            localStorage.setItem('gk_wedding_rsvps', JSON.stringify(list));
        } catch (err) {
            console.warn(err);
        }

        setTimeout(() => {
            sealBtn.classList.remove('stamping');
            if (modalBackdrop) {
                modalBackdrop.classList.add('active');
            }

            // Enlace de WhatsApp preformateado para Gustavo & Kamilah
            if (modalWhatsappBtn) {
                modalWhatsappBtn.onclick = () => {
                    const text = `👑 *Confirmación Real - Boda Gustavo & Kamilah*\n\n` +
                        `✨ *Invitado(s):* ${guestData.name}\n` +
                        `💌 *Asistencia:* ${guestData.attending === 'yes' ? 'Con honor confirmo mi asistencia' : 'Brindaré en la distancia'}\n` +
                        `👥 *Pases:* ${guestData.guestsCount}\n` +
                        `🍽️ *Menú:* ${guestData.banquet}\n` +
                        `🌱 *Restricciones:* ${guestData.dietary}\n` +
                        `🎶 *Canción:* ${guestData.song}\n` +
                        `✍️ *Mensaje:* "${guestData.blessing}"\n\n` +
                        `_¡Nos vemos en nuestra celebración imperial!_`;
                    
                    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
                    window.open(waUrl, '_blank');
                };
            }
        }, 700);
    });

    if (modalCloseBtn && modalBackdrop) {
        modalCloseBtn.addEventListener('click', () => {
            modalBackdrop.classList.remove('active');
        });
    }
}

/* ==========================================================================
   8. COPIA DE DATOS BANCARIOS & HASHTAG
   ========================================================================== */
function initBankCopy() {
    const copyBtns = document.querySelectorAll('.btn-copy-account');
    copyBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetId = btn.getAttribute('data-target');
            const targetEl = document.getElementById(targetId);
            if (!targetEl) return;

            const textToCopy = targetEl.textContent.trim();
            navigator.clipboard.writeText(textToCopy).then(() => {
                const originalText = btn.textContent;
                btn.textContent = '¡Copiado!';
                if (window.royalAudio) window.royalAudio.playChime();
                setTimeout(() => {
                    btn.textContent = originalText;
                }, 2000);
            });
        });
    });

    // Copia de Hashtags
    const copyHashtagBtn = document.getElementById('btn-copy-hashtag');
    if (copyHashtagBtn) {
        copyHashtagBtn.addEventListener('click', () => {
            navigator.clipboard.writeText('#BodaGustavoyKamilah').then(() => {
                copyHashtagBtn.textContent = '¡Hashtag Copiado!';
                if (window.royalAudio) window.royalAudio.playChime();
                setTimeout(() => {
                    copyHashtagBtn.textContent = 'Copiar Hashtag';
                }, 2000);
            });
        });
    }
}

/* ==========================================================================
   9. MURO DE BUENOS DESEOS (GUESTBOOK)
   ========================================================================== */
function initGuestbook() {
    const form = document.getElementById('guestbook-form');
    const input = document.getElementById('guestbook-input');
    const authorInput = document.getElementById('guestbook-author');
    const list = document.getElementById('guestbook-list');

    if (!form || !list) return;

    const defaultWishes = [
        { author: "Familia Valmont", text: "Brindamos por Gustavo & Kamilah, que el amor y la dicha colmen cada día de sus vidas. ¡Felicidades!" },
        { author: "Duc & Duchesse de Beaumont", text: "Una unión bendecida por la nobleza del alma. ¡Viva los novios Gustavo & Kamilah!" }
    ];

    let stored = [];
    try {
        stored = JSON.parse(localStorage.getItem('gk_wedding_wishes') || '[]');
    } catch (e) {
        stored = [];
    }

    const allWishes = [...defaultWishes, ...stored];

    function renderWishes() {
        list.innerHTML = '';
        allWishes.slice().reverse().forEach(w => {
            const item = document.createElement('div');
            item.className = 'guestbook-msg-item';
            item.innerHTML = `<div>"${escapeHtml(w.text)}"</div><div class="guestbook-msg-author">— ${escapeHtml(w.author)}</div>`;
            list.appendChild(item);
        });
    }

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const text = input.value.trim();
        const author = authorInput.value.trim() || 'Invitado de Honor';
        if (!text) return;

        const newWish = { author, text };
        allWishes.push(newWish);
        stored.push(newWish);
        try {
            localStorage.setItem('gk_wedding_wishes', JSON.stringify(stored));
        } catch (e) {}

        input.value = '';
        authorInput.value = '';
        renderWishes();
        if (window.royalAudio) window.royalAudio.playChime();
    });

    renderWishes();
}

function escapeHtml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/* ==========================================================================
   10. PÉTALOS DE ROSA & POLVO DE ORO
   ========================================================================== */
let particlesActive = true;
function initParticles() {
    const canvas = document.getElementById('particles-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    window.addEventListener('resize', () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    });

    const particles = [];
    const count = 38;

    for (let i = 0; i < count; i++) {
        particles.push({
            x: Math.random() * width,
            y: Math.random() * height,
            size: Math.random() * 8 + 4,
            speedY: Math.random() * 1.2 + 0.6,
            speedX: Math.random() * 0.8 - 0.4,
            rotation: Math.random() * 360,
            rotSpeed: (Math.random() - 0.5) * 1.5,
            isPetal: i % 2 === 0,
            color: i % 2 === 0 
                ? (Math.random() > 0.4 ? 'rgba(235, 175, 185, 0.55)' : 'rgba(215, 75, 95, 0.45)')
                : 'rgba(231, 200, 106, 0.7)'
        });
    }

    function animate() {
        if (particlesActive) {
            ctx.clearRect(0, 0, width, height);

            particles.forEach(p => {
                p.y += p.speedY;
                p.x += Math.sin(p.y * 0.01) * 0.6 + p.speedX;
                p.rotation += p.rotSpeed;

                if (p.y > height + 20) {
                    p.y = -20;
                    p.x = Math.random() * width;
                }

                ctx.save();
                ctx.translate(p.x, p.y);
                ctx.rotate((p.rotation * Math.PI) / 180);

                if (p.isPetal) {
                    ctx.beginPath();
                    ctx.moveTo(0, 0);
                    ctx.bezierCurveTo(p.size, -p.size, p.size * 1.5, p.size, 0, p.size * 1.8);
                    ctx.bezierCurveTo(-p.size * 1.5, p.size, -p.size, -p.size, 0, 0);
                    ctx.fillStyle = p.color;
                    ctx.fill();
                } else {
                    ctx.beginPath();
                    ctx.arc(0, 0, p.size * 0.35, 0, Math.PI * 2);
                    ctx.fillStyle = p.color;
                    ctx.shadowColor = '#d4af37';
                    ctx.shadowBlur = 8;
                    ctx.fill();
                }

                ctx.restore();
            });
        } else {
            ctx.clearRect(0, 0, width, height);
        }

        requestAnimationFrame(animate);
    }

    animate();

    const petalsBtn = document.getElementById('btn-toggle-petals');
    if (petalsBtn) {
        petalsBtn.addEventListener('click', () => {
            particlesActive = !particlesActive;
            petalsBtn.style.opacity = particlesActive ? '1' : '0.4';
            if (window.royalAudio) window.royalAudio.playChime();
        });
    }
}
