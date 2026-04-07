const c = document.getElementById('g');
const x = c.getContext('2d');
let w, h, camX = 0, frame = 0, score = 0;

// --- RESİM YÜKLEME ---
const img = {
    mario: new Image(), goomba: new Image(), 
    koopa: new Image(), bullet: new Image()
};

img.mario.src = 'mario.png';
img.goomba.src = 'goomba.png';
img.koopa.src = 'koopa.png';
img.bullet.src = 'bullet.png';

const conf = { grav: 1.2, frict: 0.85, jump: -26, speed: 2.2 };
const p = { x: 100, y: 0, vx: 0, vy: 0, w: 45, h: 45, g: 0, d: 1 };
const objs = [], enemies = [];

const resize = () => { w = c.width = window.innerWidth; h = c.height = window.innerHeight; };
window.onresize = resize; resize();

// DÜNYAYI OLUŞTUR
const init = () => {
    objs.push({x: 0, y: h-60, w: 100000, h: 60, t: 'ground'}); // Zemin

    for(let i=1; i<100; i++) {
        let ox = i * 600;
        let oy = h - 200 - Math.random() * 200;
        let ow = 200;
        objs.push({x: ox, y: oy, w: ow, h: 40, t: 'block'});

        // Rastgele düşman tipi seç
        let type = ['goomba', 'koopa', 'bullet'][Math.floor(Math.random() * 3)];
        enemies.push({
            x: ox + 50, y: oy - 50, w: 40, h: 40,
            vx: type === 'bullet' ? 8 : 3, // Bullet Bill daha hızlı
            startX: ox, range: ow - 40,
            type: type, dead: false
        });
    }
};

const drawEntity = (e, image) => {
    if(e.dead) return;
    x.save();
    // Düşman sola gidiyorsa resmi ters çevir (Bullet ve Koopa için)
    if(e.vx < 0) {
        x.translate(e.x - camX + e.w, e.y);
        x.scale(-1, 1);
        x.drawImage(image, 0, 0, e.w, e.h);
    } else {
        x.drawImage(image, e.x - camX, e.y, e.w, e.h);
    }
    x.restore();
};

const loop = () => {
    frame++;
    const keys = window.keys || {l:0, r:0, u:0};

    // Mario Hareket
    if(keys.l) { p.vx -= conf.speed; p.d = -1; } 
    else if(keys.r) { p.vx += conf.speed; p.d = 1; } 
    else p.vx *= conf.frict;
    if(keys.u && p.g) { p.vy = conf.jump; p.g = 0; }
    p.vy += conf.grav; p.x += p.vx; p.y += p.vy;

    // Platform Çarpışma
    p.g = 0;
    objs.forEach(o => {
        if(p.x < o.x + o.w && p.x + p.w > o.x && p.y + p.h > o.y && p.y + p.h < o.y + o.h + p.vy && p.vy >= 0) {
            p.y = o.y - p.h; p.vy = 0; p.g = 1;
        }
    });

    // Düşman Hareket ve Çarpışma
    enemies.forEach(e => {
        if(e.dead) return;
        
        e.x += e.vx;
        // Bullet Bill ekran dışına kadar gider, diğerleri blok üzerinde döner
        if(e.type !== 'bullet') {
            if(e.x > e.startX + e.range || e.x < e.startX) e.vx *= -1;
        }

        // Mario Çarpışma
        if(p.x < e.x + e.w && p.x + p.w > e.x && p.y < e.y + e.h && p.y + p.h > e.y) {
            if(p.vy > 5) { // Üstüne zıplama
                e.dead = true; p.vy = -15; score += 100;
            } else { // Ölüm/Hasar
                p.x = 100; p.y = 0; score = Math.max(0, score - 50);
            }
        }
    });

    camX += (p.x - camX - w/4) * 0.1;
    x.fillStyle = '#5c94fc'; x.fillRect(0,0,w,h);

    // Bloklar
    objs.forEach(o => {
        x.fillStyle = o.t === 'ground' ? '#70483c' : '#ff9472';
        x.fillRect(o.x - camX, o.y, o.w, o.h);
    });

    // Düşmanları Çiz
    enemies.forEach(e => {
        if(e.type === 'goomba') drawEntity(e, img.goomba);
        if(e.type === 'koopa') drawEntity(e, img.koopa);
        if(e.type === 'bullet') drawEntity(e, img.bullet);
    });

    // Mario Çiz
    x.save();
    x.translate(p.x - camX + (p.d === -1 ? p.w : 0), p.y);
    if(p.d === -1) x.scale(-1, 1);
    x.drawImage(img.mario, 0, 0, p.w, p.h);
    x.restore();

    x.fillStyle = "white"; x.font = "20px Arial";
    x.fillText(`SKOR: ${score}`, 20, 40);
    requestAnimationFrame(loop);
};

window.keys = {l:0, r:0, u:0};
window.onkeydown = e => { if(e.key=='ArrowLeft')keys.l=1; if(e.key=='ArrowRight')keys.r=1; if(e.key==' '||e.key=='ArrowUp')keys.u=1; };
window.onkeyup = e => { if(e.key=='ArrowLeft')keys.l=0; if(e.key=='ArrowRight')keys.r=0; if(e.key==' '||e.key=='ArrowUp')keys.u=0; };

init(); loop();
