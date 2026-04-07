const c = document.getElementById('g');
const x = c.getContext('2d');
let w, h, camX = 0, frame = 0;

// --- RESİM YÜKLEME ---
const img = {
    mario: new Image(),
    sprites: new Image()
};

// GitHub'daki dosya isimlerinle birebir aynı olmalı
img.mario.src = 'mario_sprites.png';
img.sprites.src = 'enemy_sprites.png';

const conf = { grav: 1.2, frict: 0.85, jump: -26, speed: 2.2 };
const p = { x: 100, y: 0, vx: 0, vy: 0, w: 50, h: 50, g: 0, d: 1 };
const objs = [], enemies = [];

const resize = () => { w = c.width = window.innerWidth; h = c.height = window.innerHeight; };
window.onresize = resize; resize();

// DÜNYA OLUŞTURMA
const init = () => {
    // ANA ZEMİN (Görünmüyorsa koordinatları buradan kontrol et)
    objs.push({x: 0, y: h-60, w: 100000, h: 60, t: 'ground'});

    for(let i=1; i<100; i++) {
        let ox = i * 500;
        let oy = h - 250 - Math.random() * 200;
        objs.push({x: ox, y: oy, w: 150, h: 40, t: 'block'});
    }
};

// ÇİZİM FONKSİYONLARI
const drawBlock = (o) => {
    if (img.sprites.complete && img.sprites.naturalWidth !== 0) {
        // Spritesheet'ten zemin/blok parçasını kes (Koordinatları resmine göre dene: 0,0,16,16 gibi)
        x.drawImage(img.sprites, 0, 0, 16, 16, o.x - camX, o.y, o.w, o.h);
    } else {
        // RESİM YÜKLENMEZSE YEDEK OLARAK KAHVERENGİ ÇİZ
        x.fillStyle = '#8b4513';
        x.fillRect(o.x - camX, o.y, o.w, o.h);
        x.strokeStyle = 'white';
        x.strokeRect(o.x - camX, o.y, o.w, o.h);
    }
};

const drawMario = () => {
    if (img.mario.complete && img.mario.naturalWidth !== 0) {
        x.save();
        x.translate(p.x - camX + (p.d === -1 ? p.w : 0), p.y);
        if(p.d === -1) x.scale(-1, 1);
        // Mario spritesheet'inden ilk kareyi kes
        x.drawImage(img.mario, 0, 0, 16, 32, 0, 0, p.w, p.h);
        x.restore();
    } else {
        // YEDEK MARIO (KIRMIZI KARE)
        x.fillStyle = 'red';
        x.fillRect(p.x - camX, p.y, p.w, p.h);
    }
};

const loop = () => {
    frame++;
    const keys = window.keys || {l:0, r:0, u:0};
    if(keys.l) { p.vx -= conf.speed; p.d = -1; } else if(keys.r) { p.vx += conf.speed; p.d = 1; } else p.vx *= conf.frict;
    if(keys.u && p.g) { p.vy = conf.jump; p.g = 0; }
    p.vy += conf.grav; p.x += p.vx; p.y += p.vy;

    p.g = 0;
    objs.forEach(o => {
        if(p.x < o.x + o.w && p.x + p.w > o.x && p.y + p.h > o.y && p.y + p.h < o.y + o.h + p.vy && p.vy >= 0) {
            p.y = o.y - p.h; p.vy = 0; p.g = 1;
        }
    });

    if(p.y > h) { p.x = 100; p.y = 0; p.vx = 0; }
    camX += (p.x - camX - w/4) * 0.1;

    x.fillStyle = '#5c94fc'; x.fillRect(0,0,w,h); // Arkaplan mavisi
    objs.forEach(o => drawBlock(o));
    drawMario();

    requestAnimationFrame(loop);
};

// KONTROLLER
window.keys = {l:0, r:0, u:0};
window.onkeydown = e => { if(e.key=='ArrowLeft')keys.l=1; if(e.key=='ArrowRight')keys.r=1; if(e.key==' '||e.key=='ArrowUp')keys.u=1; };
window.onkeyup = e => { if(e.key=='ArrowLeft')keys.l=0; if(e.key=='ArrowRight')keys.r=0; if(e.key==' '||e.key=='ArrowUp')keys.u=0; };

init(); loop();
