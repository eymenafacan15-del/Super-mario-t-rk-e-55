// --- 1. YENİ DEĞİŞKENLER VE RESİMLER ---
img.hammerBrother = new Image();
img.hammerBrother.src = 'hammer_brother.png'; // Hammer Brother görselin
img.hammerObj = new Image();
img.hammerObj.src = 'hammer.png'; // Çekiç görselin

const hammerProjectiles = []; // Havada uçan çekiçler

// --- 2. HAMMER BROTHER OLUŞTURMA FONKSİYONU ---
const spawnHammerBrother = (x, y) => {
    enemies.push({
        x: x, y: y, w: 48, h: 60,
        type: 'hammer_bro',
        vx: 1.5,
        startX: x, 
        range: 80, // Dar bir alanda gidip gelirler
        jumpTimer: 0,
        shootTimer: 0,
        dead: false
    });
};

// --- 3. ÇEKİÇ FIRLATMA FONKSİYONU ---
const throwHammer = (ex, ey, direction) => {
    hammerProjectiles.push({
        x: ex, y: ey,
        vx: direction * 4, 
        vy: -14, // Yukarı kavisli fırlatma
        w: 24, h: 24,
        angle: 0 // Çekicin dönme açısı
    });
};

const updateEnemies = () => {
    enemies.forEach(e => {
        if (e.dead) return;

        // --- HAMMER BRO MANTIĞI ---
        if (e.type === 'hammer_bro') {
            e.x += e.vx;
            if (e.x > e.startX + e.range || e.x < e.startX) e.vx *= -1;

            // Arada bir zıplama
            e.jumpTimer++;
            if (e.jumpTimer > 120 && Math.random() > 0.98) {
                // Eğer platformdaysa zıplar (basit yerçekimi p.vy mantığı eklenebilir)
                e.jumpTimer = 0;
            }

            // Çekiç Atma Zamanlaması
            e.shootTimer++;
            if (e.shootTimer > 80) { // Yaklaşık her 1.5 saniyede bir
                let dir = (p.x < e.x) ? -1 : 1; // Mario'nun olduğu yöne at
                throwHammer(e.x, e.y, dir);
                e.shootTimer = 0;
            }
        }
        // ... (Diğer düşmanların hareket kodları) ...
    });
};

const drawProjectiles = () => {
    hammerProjectiles.forEach((h, index) => {
        h.vy += 0.6; // Yerçekimi çekici aşağı çeker
        h.x += h.vx;
        h.y += h.vy;
        h.angle += 0.3; // Dönme animasyonu

        // Çizim
        x.save();
        x.translate(h.x - camX + h.w/2, h.y + h.h/2);
        x.rotate(h.angle);
        x.drawImage(img.hammerObj, -h.w/2, -h.h/2, h.w, h.h);
        x.restore();

        // Mario ile çarpışma (Ölüm)
        if (p.x < h.x + h.w && p.x + p.w > h.x && p.y < h.y + h.h && p.y + p.h > h.y) {
            location.reload(); // Öldün!
        }

        // Ekran dışına çıkarsa sil
        if (h.y > window.innerHeight) hammerProjectiles.splice(index, 1);
    });
};

// --- 4. ANA DÖNGÜDE (LOOP) ÇAĞIR ---
// loop fonksiyonunun içine şunları ekle:
// updateEnemies();
// drawProjectiles();
