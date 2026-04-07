const c = document.getElementById('g');
const x = c.getContext('2d');
let w, h, camX = 0;

// TEKLİ RESİM YÜKLEME
const marioImg = new Image();
marioImg.src = 'mario.png'; // Kaydettiğin isimle aynı olmalı

const conf = { grav: 1.2, frict: 0.85, jump: -25, speed: 2.5 };
const p = { x: 100, y: 0, vx: 0, vy: 0, w: 50, h: 50, g: 0, d: 1 };

const resize = () => { w = c.width = window.innerWidth; h = c.height = window.innerHeight; };
window.onresize = resize; resize();

const loop = () => {
    // Hareket Mantığı
    const keys = window.keys || {l:0, r:0, u:0};
    if(keys.l) { p.vx -= conf.speed; p.d = -1; } 
    else if(keys.r) { p.vx += conf.speed; p.d = 1; } 
    else p.vx *= conf.frict;

    if(keys.u && p.g) { p.vy = conf.jump; p.g = 0; }
    p.vy += conf.grav; p.x += p.vx; p.y += p.vy;

    // Basit Zemin (H-100 piksellik yer)
    p.g = 0;
    if (p.y > h - 100) { p.y = h - 100; p.vy = 0; p.g = 1; }

    camX += (p.x - camX - w/4) * 0.1;

    // ÇİZİM
    x.fillStyle = '#5c94fc'; x.fillRect(0,0,w,h); // Gökyüzü
    
    // Zemini çiz
    x.fillStyle = '#8b4513';
    x.fillRect(0 - camX, h - 50, 100000, 50);

    // MARIO ÇİZİMİ
    x.save();
    // Sağa/Sola bakma efekti
    x.translate(p.x - camX + (p.d === -1 ? p.w : 0), p.y);
    if (p.d === -1) x.scale(-1, 1);
    
    // Tek resim olduğu için kırpma (crop) yapmadan direkt çiziyoruz
    x.drawImage(marioImg, 0, 0, p.w, p.h);
    x.restore();

    requestAnimationFrame(loop);
};

// KONTROLLER
window.keys = {l:0, r:0, u:0};
window.onkeydown = e => { 
    if(e.key=='ArrowLeft') keys.l=1; 
    if(e.key=='ArrowRight') keys.r=1; 
    if(e.key=='ArrowUp' || e.key==' ') keys.u=1; 
};
window.onkeyup = e => { 
    if(e.key=='ArrowLeft') keys.l=0; 
    if(e.key=='ArrowRight') keys.r=0; 
    if(e.key=='ArrowUp' || e.key==' ') keys.u=0; 
};

loop();
