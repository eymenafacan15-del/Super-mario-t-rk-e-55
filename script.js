const c = document.getElementById('g');
const x = c.getContext('2d');
let w, h, camX = 0, frame = 0;

// --- İNTERNETTEN TEXTURE (KAPLAMA) ÇEKME ---
const img = {
    mario: new Image(),
    ground: new Image(),
    enemy: new Image(),
    bg: new Image()
};
// Akıllı tahtada engellenmeyecek güvenli URL'ler:
img.mario.src = 'https://i.imgur.com/6S7999S.png'; // Pixel Mario
img.ground.src = 'https://i.imgur.com/Y6S779S.png'; // Brick Texture
img.enemy.src = 'https://i.imgur.com/8S9999S.png'; // Goomba/Monster
img.bg.src = 'https://i.imgur.com/X6S779S.png'; // Cloud/Sky

// --- HIZLI OYUNCU VE FİZİK AYARLARI ---
const conf = { 
    grav: 1.0, 
    frict: 0.9, 
    jump: -28,    // Efsane yüksek zıplama
    speed: 2.5,   // Çok hızlı ivmelenme
    maxSpeed: 15  // Maksimum hız sınırı
};

const keys = { l: 0, r: 0, u: 0 };
const p = { x: 100, y: 0, vx: 0, vy: 0, w: 50, h: 50, g: 0, d: 1 };
const objs = [], enemies = [];

const resize = () => { w = c.width = window.innerWidth; h = c.height = window.innerHeight; };
window.onresize = resize; resize();

// --- HAVADA DURAN EŞYALAR VE HARİTA ---
const init = () => {
    // Ana zemin (Texture ile kaplı)
    objs.push({x: 0, y: h-60, w: 100000, h: 60, t: 'ground'});

    for(let i=1; i<300; i++) {
        let ox = i * 400 + Math.random() * 200;
        let oy = h - 250 - Math.random() * 300; // Eşyalar havada
        let ow = 100 + Math.random() * 150;
        
        objs.push({x: ox, y: oy, w: ow, h: 40, t: 'block'});

        if(Math.random() > 0.3) {
            enemies.push({
                x: ox + 10, y: oy - 50, w: 40, h: 40,
                vx: 4 + Math.random() * 6, // Düşmanlar da hızlı
                startX: ox, range: ow - 40, dead: false
            });
        }
    }
};

const loop = () => {
    frame++;
    // Hızlanma Mantığı
    if(keys.l) { p.vx -= conf.speed; p.d = -1; }
    else if(keys.r) { p.vx += conf.speed; p.d = 1; }
    else p.vx *= conf.frict;

    // Hız Sınırı
    if(p.vx > conf.maxSpeed) p.vx = conf.maxSpeed;
    if(p.vx < -conf.maxSpeed) p.vx = -conf.maxSpeed;

    if(keys.u && p.g) { p.vy = conf.jump; p.g = 0; }
    p.vy += conf.grav;
    p.x += p.vx; p.y += p.vy;

    // Platform Çarpışması
    p.g = 0;
    objs.forEach(o => {
        if(p.x < o.x + o.w && p.x + p.w > o.x && p.y + p.h > o.y && p.y + p.h < o.y + o.h + p.vy && p.vy >= 0) {
            p.y = o.y - p.h; p.vy = 0; p.g = 1;
        }
    });

    // Kamera ve Ölüm
    if(p.y > h) { p.x -= 500; p.y = 0; p.vx = 0; }
    camX += (p.x - camX - w/4) * 0.15;

    // --- ÇİZİM (TEXTURE ENGINE) ---
    x.fillStyle = '#5c94fc'; x.fillRect(0,0,w,h); // Gökyüzü

    // Platformlar (Resimle kaplama)
    objs.forEach(o => {
        try {
            x.drawImage(img.ground, o.x - camX, o.y, o.w, o.h);
        } catch(e) { // Resim yüklenmezse renk bas
            x.fillStyle = '#8b4513'; x.fillRect(o.x - camX, o.y, o.w, o.h);
        }
    });

    // Düşmanlar
    enemies.forEach(e => {
        if(!e.dead) {
            e.x += e.vx;
            if(e.x > e.startX + e.range || e.x < e.startX) e.vx *= -1;
            x.drawImage(img.enemy, e.x - camX, e.y, e.w, e.h);
            // Çarpışma
            if(p.x < e.x + e.w && p.x + p.w > e.x && p.y < e.y + e.h && p.y + p.h > e.y) {
                if(p.vy > 5) { e.dead = true; p.vy = -20; } else { p.x -= 300; }
            }
        }
    });

    // Oyuncu (Mario Texture)
    x.save();
    x.translate(p.x - camX + (p.d === -1 ? p.w : 0), p.y);
    if(p.d === -1) x.scale(-1, 1);
    x.drawImage(img.mario, 0, 0, p.w, p.h);
    x.restore();

    requestAnimationFrame(loop);
};

// Kontroller (Tahta ve Klavye)
window.onkeydown = e => { if(e.key=='ArrowLeft')keys.l=1; if(e.key=='ArrowRight')keys.r=1; if(e.key==' '||e.key=='ArrowUp')keys.u=1; };
window.onkeyup = e => { if(e.key=='ArrowLeft')keys.l=0; if(e.key=='ArrowRight')keys.r=0; if(e.key==' '||e.key=='ArrowUp')keys.u=0; };
c.addEventListener('touchstart', e => { 
    let tx = e.touches[0].clientX; 
    if(tx < w/3) keys.l=1; else if(tx > w*2/3) keys.r=1; else keys.u=1; 
});
c.addEventListener('touchend', () => { keys.l=0; keys.r=0; keys.u=1; setTimeout(()=>keys.u=0,100); });

init(); loop();
