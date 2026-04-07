const c = document.getElementById('g');
const x = c.getContext('2d');
let w, h, camX = 0, frame = 0;

// --- BOZULMAZ GÖMÜLÜ TEXTURE'LAR (Base64) ---
const img = {
    mario: new Image(),
    ground: new Image(),
    enemy: new Image()
};

// Küçük ama etkili pixel art verileri (İnternet gerektirmez)
img.mario.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAASUlEQVRYR+2XwREAMAQC8vunNAt4YIsZSO7nSOnS6noD8v8mYI7fALIDZAfIDpAdIDtAdpYp8Pk9IDtAdIDsLFMgX6DqS6v6FpA9u9IDmSOfvHAAAAAASUVORK5CYII=';
img.ground.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAALUlEQVRYR+3isQ0AAAjDMCX/f2mewYI6S9rSOf6t6vMBgEBAQEBAQEBAQEAgUBy86AD9mY9mAAAAAElFTkSuQmCC';
img.enemy.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAARElEQVRYR+2XMQ4AIAjE3v9Pd3ExmrgYCOmUtoYpXdZ7A/L/JuCO3wCyA2QHyA6QHSA7QHaWKeD7PSA7QHaA7CxTIF+g6kuL+haZ3ZzS5pD6YAAAAABJRU5ErkJggg==';

// FİZİK AYARLARI (HIZLANDIRILMIŞ)
const conf = { 
    grav: 1.2, 
    frict: 0.85, 
    jump: -26,    // Yüksek zıplama
    speed: 2.2,   // Atik hareket
    maxSpeed: 12 
};

const keys = { l: 0, r: 0, u: 0 };
const p = { x: 100, y: 0, vx: 0, vy: 0, w: 48, h: 48, g: 0, d: 1 };
const objs = [], enemies = [];

const resize = () => { w = c.width = window.innerWidth; h = c.height = window.innerHeight; };
window.onresize = resize; resize();

// HAVADA DURAN HARİTA TASARIMI
const init = () => {
    // Ana zemin
    objs.push({x: 0, y: h-60, w: 100000, h: 60, t: 'ground'});

    for(let i=1; i<250; i++) {
        let ox = i * 420 + Math.random() * 150;
        let oy = h - 200 - Math.random() * 350; // Nesneler havada uçuşuyor
        let ow = 120 + Math.random() * 100;
        
        objs.push({x: ox, y: oy, w: ow, h: 35, t: 'block'});

        if(Math.random() > 0.4) {
            enemies.push({
                x: ox + 10, y: oy - 50, w: 40, h: 40,
                vx: 3 + Math.random() * 5,
                startX: ox, range: ow - 40, dead: false
            });
        }
    }
};

const loop = () => {
    frame++;
    // Hareket Kontrolü
    if(keys.l) { p.vx -= conf.speed; p.d = -1; }
    else if(keys.r) { p.vx += conf.speed; p.d = 1; }
    else p.vx *= conf.frict;

    // Hız Sınırı (Kontrolsüz hızlanmayı engeller)
    if(p.vx > conf.maxSpeed) p.vx = conf.maxSpeed;
    if(p.vx < -conf.maxSpeed) p.vx = -conf.maxSpeed;

    if(keys.u && p.g) { p.vy = conf.jump; p.g = 0; }
    p.vy += conf.grav;
    p.x += p.vx; p.y += p.vy;

    // Platform Çarpışması (Havada asılı kalma mekaniği)
    p.g = 0;
    objs.forEach(o => {
        if(p.x < o.x + o.w && p.x + p.w > o.x && p.y + p.h > o.y && p.y + p.h < o.y + o.h + p.vy && p.vy >= 0) {
            p.y = o.y - p.h; p.vy = 0; p.g = 1;
        }
    });

    // Düşme ve Ölüm
    if(p.y > h + 100) { p.x = Math.max(100, p.x - 500); p.y = 0; p.vx = 0; }
    
    // Smooth Kamera Takibi
    camX += (p.x - camX - w/4) * 0.12;

    // --- ÇİZİM EKRANI ---
    x.fillStyle = '#5c94fc'; x.fillRect(0,0,w,h); // Gökyüzü

    // Blokları Çiz (Texture ile)
    objs.forEach(o => {
        x.drawImage(img.ground, o.x - camX, o.y, o.w, o.h);
        // Üstüne ince bir hat çizerek belirginleştir
        x.fillStyle = 'rgba(0,0,0,0.2)';
        x.fillRect(o.x - camX, o.y + o.h - 5, o.w, 5);
    });

    // Düşmanları Çiz ve Güncelle
    enemies.forEach(e => {
        if(!e.dead) {
            e.x += e.vx;
            if(e.x > e.startX + e.range || e.x < e.startX) e.vx *= -1;
            x.drawImage(img.enemy, e.x - camX, e.y, e.w, e.h);
            
            // Oyuncuyla Çarpışma
            if(p.x < e.x + e.w && p.x + p.w > e.x && p.y < e.y + e.h && p.y + p.h > e.y) {
                if(p.vy > 5) { e.dead = true; p.vy = -18; } 
                else { p.x -= 400; p.vx = 0; }
            }
        }
    });

    // Mario Çizimi (Yön ve Zıplama Efektiyle)
    x.save();
    x.translate(p.x - camX + (p.d === -1 ? p.w : 0), p.y);
    if(p.d === -1) x.scale(-1, 1);
    
    // Zıplarken Mario biraz uzasın (Strech efekti)
    let stretch = !p.g ? Math.sin(frame * 0.1) * 5 : 0;
    x.drawImage(img.mario, 0, 0 - stretch, p.w, p.h + stretch);
    x.restore();

    requestAnimationFrame(loop);
};

// KLAVYE VE TAHTA KONTROLLERİ
window.onkeydown = e => { if(e.key=='ArrowLeft')keys.l=1; if(e.key=='ArrowRight')keys.r=1; if(e.key==' '||e.key=='ArrowUp')keys.u=1; };
window.onkeyup = e => { if(e.key=='ArrowLeft')keys.l=0; if(e.key=='ArrowRight')keys.r=0; if(e.key==' '||e.key=='ArrowUp')keys.u=0; };

c.addEventListener('touchstart', e => { 
    let tx = e.touches[0].clientX; 
    let ty = e.touches[0].clientY;
    if(ty < h/2) keys.u=1; else if(tx < w/2) keys.l=1; else keys.r=1; 
});
c.addEventListener('touchend', () => { keys.l=0; keys.r=0; keys.u=0; });

init(); loop();
