const c = document.getElementById('g');
const x = c.getContext('2d');
let w, h, camX = 0, frame = 0, score = 0;

// --- DOKULAR (BASE64 - ASLA BOZULMAZ) ---
const img = {
    mario: new Image(),
    brick: new Image(),
    turtle: new Image(), // Kaplumbağa
    hammer: new Image()  // Çekiç atan
};
img.mario.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAASUlEQVRYR+2XwREAMAQC8vunNAt4YIsZSO7nSOnS6noD8v8mYI7fALIDZAfIDpAdIDtAdpYp8Pk9IDtAdIDsLFMgX6DqS6v6FpA9u9IDmSOfvHAAAAAASUVORK5CYII=';
img.brick.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAALUlEQVRYR+3isQ0AAAjDMCX/f2mewYI6S9rSOf6t6vMBgEBAQEBAQEBAQEAgUBy86AD9mY9mAAAAAElFTkSuQmCC';
img.turtle.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAWElEQVRYR+2X0QoAIAhD7f8/unNgeYmSInofY6u09Ybk/03AHr8BZAOwA7IDZAOyA2RnOQXOnwdkB2QHyM5yCswX6PVp1fQtkB3AAnL0SAd8m7TzBvP6V88uM3t9ogOYI59ZjwAAAABJRU5ErkJggg==';

// OYUNCU AYARLARI
const conf = { grav: 1.1, frict: 0.85, jump: -25, speed: 2.0 };
const p = { x: 100, y: 0, vx: 0, vy: 0, w: 45, h: 45, g: 0, d: 1 };
const objs = [], enemies = [], projectiles = [];

const resize = () => { w = c.width = window.innerWidth; h = c.height = window.innerHeight; };
window.onresize = resize; resize();

// DÜNYA VE ÇEŞİTLİ CANAVAR ÜRETİMİ
const init = () => {
    objs.push({x: 0, y: h-60, w: 50000, h: 60, t: 'ground'}); // Yer

    for(let i=1; i<150; i++) {
        let ox = i * 500;
        let oy = h - 250 - Math.random() * 200;
        objs.push({x: ox, y: oy, w: 150, h: 40, t: 'brick'});

        // CANAVAR ÇEŞİTLERİ
        let r = Math.random();
        if(r > 0.7) { 
            // 1. ÇEKİÇ ATAN (Hammer Bro)
            enemies.push({ x: ox + 50, y: oy - 60, w: 50, h: 60, type: 'hammerer', lastShot: 0, vx: 1, startX: ox, range: 100 });
        } else if(r > 0.4) {
            // 2. ZIPLAYAN KAPLUMBAĞA (Koopa)
            enemies.push({ x: ox + 20, y: oy - 50, w: 40, h: 40, type: 'turtle', vy: 0, vx: 2, startX: ox, range: 110 });
        }
    }
};

const loop = () => {
    frame++;
    // Mario Fizik
    const keys = window.keys || {l:0, r:0, u:0}; // Kontrollerden gelen veri
    if(keys.l) { p.vx -= conf.speed; p.d = -1; } else if(keys.r) { p.vx += conf.speed; p.d = 1; } else p.vx *= conf.frict;
    if(keys.u && p.g) { p.vy = conf.jump; p.g = 0; }
    p.vy += conf.grav; p.x += p.vx; p.y += p.vy;

    // Platform Çarpışma
    p.g = 0;
    objs.forEach(o => {
        if(p.x < o.x + o.w && p.x + p.w > o.x && p.y + p.h > o.y && p.y + p.h < o.y + o.h + p.vy && p.vy >= 0) {
            p.y = o.y - p.h; p.vy = 0; p.g = 1;
        }
    });

    // CANAVAR MANTIĞI VE SALDIRILAR
    enemies.forEach((e, idx) => {
        if(e.dead) return;
        
        // Hareket devriyesi
        e.x += e.vx;
        if(e.x > e.startX + e.range || e.x < e.startX) e.vx *= -1;

        // TİP 1: Hammerer (Bize çekiç fırlatır)
        if(e.type === 'hammerer') {
            if(frame - e.lastShot > 100) { // Her 100 karede bir atış
                projectiles.push({ x: e.x, y: e.y, vx: (p.x < e.x ? -5 : 5), vy: -15, w: 15, h: 15 });
                e.lastShot = frame;
            }
        }

        // TİP 2: Turtle (Zıplayarak gelir)
        if(e.type === 'turtle' && frame % 60 === 0) {
            e.vy = -10; // Küçük zıplamalar
        }
        if(e.type === 'turtle') { e.vy += 0.5; e.y += e.vy; }

        // Mario ile çarpışma
        if(p.x < e.x + e.w && p.x + p.w > e.x && p.y < e.y + e.h && p.y + p.h > e.y) {
            if(p.vy > 5) { e.dead = true; p.vy = -15; score += 500; } 
            else { p.x -= 300; score -= 100; } // Hasar alıp geri fırlar
        }
    });

    // ÇEKİÇLERİN HAREKETİ (Mermi sistemi)
    projectiles.forEach((m, mIdx) => {
        m.vy += 0.8; m.x += m.vx; m.y += m.vy;
        // Mario'ya çekiç çarparsa
        if(p.x < m.x + m.w && p.x + p.w > m.x && p.y < m.y + m.h && p.y + p.h > m.y) {
            p.x -= 200; p.y -= 10; projectiles.splice(mIdx, 1);
        }
        if(m.y > h) projectiles.splice(mIdx, 1);
    });

    camX += (p.x - camX - w/4) * 0.1;

    // --- ÇİZİM ---
    x.fillStyle = '#5c94fc'; x.fillRect(0,0,w,h); // Arkaplan

    objs.forEach(o => x.drawImage(img.brick, o.x - camX, o.y, o.w, o.h));

    enemies.forEach(e => {
        if(e.dead) return;
        x.fillStyle = e.type === 'hammerer' ? '#f1c40f' : '#2ecc71';
        x.fillRect(e.x - camX, e.y, e.w, e.h); // Canavar gövdesi
        x.fillStyle = 'white'; x.fillRect(e.x - camX + 5, e.y + 5, 10, 10); // Göz
    });

    projectiles.forEach(m => {
        x.fillStyle = 'black';
        x.beginPath(); x.arc(m.x - camX, m.y, m.w/2, 0, Math.PI*2); x.fill(); // Çekiçler (Gülle gibi)
    });

    x.save();
    x.translate(p.x - camX + (p.d === -1 ? p.w : 0), p.y);
    if(p.d === -1) x.scale(-1, 1);
    x.drawImage(img.mario, 0, 0, p.w, p.h);
    x.restore();

    requestAnimationFrame(loop);
};

// KONTROLLER
window.keys = {l:0, r:0, u:0};
window.onkeydown = e => { if(e.key=='ArrowLeft')keys.l=1; if(e.key=='ArrowRight')keys.r=1; if(e.key==' '||e.key=='ArrowUp')keys.u=1; };
window.onkeyup = e => { if(e.key=='ArrowLeft')keys.l=0; if(e.key=='ArrowRight')keys.r=0; if(e.key==' '||e.key=='ArrowUp')keys.u=0; };
c.addEventListener('touchstart', e => { let tx = e.touches[0].clientX; if(tx < w/3) keys.l=1; else if(tx > w*2/3) keys.r=1; else keys.u=1; });
c.addEventListener('touchend', () => { keys.l=0; keys.r=0; keys.u=0; });

init(); loop();
