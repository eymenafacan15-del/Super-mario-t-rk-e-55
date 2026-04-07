/**
 * MARIO JS SPRITE ENGINE
 * Senin yüklediğin resimlerden (spritesheet) parçalar kesip çizer.
 */
const c = document.getElementById('g');
const x = c.getContext('2d');
let w, h, camX = 0, frame = 0, score = 0, lives = 3;

// --- RESİM YÜKLEME SİSTEMİ ---
// GitHub'a yüklediğin resimlerin tam adlarını buraya yazıyoruz.
const img = {
    mario: new Image(),
    enemies: new Image()
};

// Bu satırlar resimlerin yüklendiğini kontrol eder.
img.mario.src = 'mario_sprites.png';
img.enemies.src = 'enemy_sprites.png';

// Resimler yüklenene kadar oyunun başlamasını engelleriz.
let imgsLoaded = 0;
const checkLoaded = () => {
    imgsLoaded++;
    if(imgsLoaded === 2) { initWorld(); loop(); }
};
img.mario.onload = checkLoaded;
img.enemies.onload = checkLoaded;

// FİZİK VE KONTROLLER (Mega Hız Deneyimi)
const conf = { grav: 1.1, frict: 0.85, jump: -26, speed: 2.2 };
const p = { x: 100, y: 0, vx: 0, vy: 0, w: 48, h: 48, g: 0, d: 1 };
const objs = [], enemies = [];

const resize = () => { w = c.width = window.innerWidth; h = c.height = window.innerHeight; };
window.onresize = resize; resize();

// HAVADA DURAN HARİTA TASARIMI
const initWorld = () => {
    objs.push({x: 0, y: h-60, w: 100000, h: 60, t: 'ground'}); // Dev Zemin

    for(let i=1; i<200; i++) {
        let ox = i * 450 + Math.random() * 200;
        let oy = h - 250 - Math.random() * 300; // Eşyalar havada
        let ow = 120 + Math.random() * 150;
        
        objs.push({x: ox, y: oy, w: ow, h: 40, t: 'block'});

        // Canavar Üretimi (SMB3 Tarzı)
        if(Math.random() > 0.3) {
            enemies.push({
                x: ox + 20, y: oy - 50, w: 40, h: 40,
                vx: 3 + Math.random() * 5,
                startX: ox, range: ow - 40, dead: false
            });
        }
    }
};

// --- SPRITE DRAWING ENGINE (Resim Kesme Motoru) ---

/**
 * mario_sprites.png dosyasından doğru kareyi kesip çizer.
 */
const drawMarioSprite = () => {
    x.save();
    x.translate(p.x - camX + (p.d === -1 ? p.w : 0), p.y);
    if(p.d === -1) x.scale(-1, 1);
    
    // Resmin içindeki tek bir Mario karesinin boyutu (Yaklaşık 16x32 piksel)
    // Bu değerleri resmin orijinal çözünürlüğüne göre hassas ayarlamak gerekebilir.
    const sw = 16, sh = 32;
    // Çizilecek kare (Yürüme animasyonu için kareyi değiştiririz)
    let sx = 0, sy = 0; 

    if(!p.g) { // Zıplama karesi
        sx = sw * 4; // 5. kare
    } else if(Math.abs(p.vx) > 0.1) { // Yürüme animasyonu
        sx = sw * (Math.floor(frame / 6) % 3 + 1); // 2, 3, 4. kareler arasında döner
    } else { // Durma karesi
        sx = 0;
    }

    // drawImage(resim, sx, sy, sw, sh, dx, dy, dw, dh)
    // Kaynak resimden (sx,sy) koordinatından (sw,sh) boyutunda bir parça kes,
    // Ekranda (dx,dy) koordinatına (dw,dh) boyutunda çiz.
    x.drawImage(img.mario, sx, sy, sw, sh, 0, 0, p.w, p.h);
    
    x.restore();
};

/**
 * enemy_sprites.png dosyasından canavar/blok parçası kesip çizer.
 */
const drawEnemySprite = (e) => {
    // SMB3 canavarlarını kullanıyoruz.
    // Goomba karesi (Örnek: 10,120 koordinatından 16x16 kes)
    const sx = 10, sy = 120, sw = 16, sh = 16;
    x.drawImage(img.enemies, sx, sy, sw, sh, e.x - camX, e.y, e.w, e.h);
};

const drawBlockSprite = (o) => {
    // SMB3 Tuğla karesi (Örnek: 10,10 koordinatından 16x16 kes)
    const sx = 10, sy = 10, sw = 16, sh = 16;
    x.drawImage(img.enemies, sx, sy, sw, sh, o.x - camX, o.y, o.w, o.h);
};

// OYUN DÖNGÜSÜ (GAME LOOP)
const loop = () => {
    frame++;
    // Mario Fizik
    if(window.keys?.l) { p.vx -= conf.speed; p.d = -1; }
    else if(window.keys?.r) { p.vx += conf.speed; p.d = 1; }
    else p.vx *= conf.frict;
    if(window.keys?.u && p.g) { p.vy = conf.jump; p.g = 0; }
    p.vy += conf.grav; p.x += p.vx; p.y += p.vy;

    // Platform Çarpışma
    p.g = 0;
    objs.forEach(o => {
        if(p.x < o.x + o.w && p.x + p.w > o.x && p.y + p.h > o.y && p.y + p.h < o.y + o.h + p.vy && p.vy >= 0) {
            p.y = o.y - p.h; p.vy = 0; p.g = 1;
        }
    });

    // Canavar Mantığı
    enemies.forEach(e => {
        if(e.dead) return;
        e.x += e.vx;
        if(e.x > e.startX + e.range || e.x < e.startX) e.vx *= -1;
        if(p.x < e.x + e.w && p.x + p.w > e.x && p.y < e.y + e.h && p.y + p.h > e.y) {
            if(p.vy > 5) { e.dead = true; p.vy = -18; score += 200; } 
            else { lives--; p.x -= 300; if(lives <= 0) location.reload(); }
        }
    });

    camX += (p.x - camX - w/4) * 0.1;
    if(p.y > h+100) { lives--; p.x -= 500; p.y = 0; if(lives <= 0) location.reload(); }

    // --- ÇİZİM ---
    x.fillStyle = '#5c94fc'; x.fillRect(0,0,w,h); // Arkaplan

    // Platformlar (Sprite ile)
    objs.forEach(o => {
        if(o.t === 'block') drawBlockSprite(o);
        else { // Zemin (SMB3 çimen karesini kes)
            const sx=100, sy=100, sw=16, sh=16;
            x.drawImage(img.enemies, sx, sy, sw, sh, o.x - camX, o.y, o.w, o.h);
        }
    });

    // Canavarlar (Sprite ile)
    enemies.forEach(e => { if(!e.dead) drawEnemySprite(e); });

    // Mario (Yüksek Kaliteli Sprite Animasyonlu)
    drawMarioSprite();

    // UI
    x.fillStyle = "white"; x.font = "bold 20px Arial";
    x.fillText(`PUAN: ${score}  CAN: ${lives}`, 25, 40);

    requestAnimationFrame(loop);
};

// KONTROLLER
window.keys = {l:0, r:0, u:0};
window.onkeydown = e => { if(e.key=='ArrowLeft')keys.l=1; if(e.key=='ArrowRight')keys.r=1; if(e.key==' '||e.key=='ArrowUp')keys.u=1; };
window.onkeyup = e => { if(e.key=='ArrowLeft')keys.l=0; if(e.key=='ArrowRight')keys.r=0; if(e.key==' '||e.key=='ArrowUp')keys.u=0; };
c.addEventListener('touchstart', e => { let tx=e.touches[0].clientX; if(tx<w/3)keys.l=1; else if(tx>w*2/3)keys.r=1; else keys.u=1; });
c.addEventListener('touchend', () => { keys.l=0; keys.r=0; keys.u=0; });

// initWorld ve loop, resim yüklenince checkLoaded içinde çağrılır.
</script>
