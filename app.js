(function() {

    const tahta = document.getElementById('rotator') || document.getElementById('tahtaAlani');
    const objeKatmani = document.getElementById('objectsLayer') || document.getElementById('objeler');
    const zemin = document.querySelector('.stage') || document.querySelector('.balance-area');
    const sonrakiAgirlik = document.getElementById('nextWeight') || document.getElementById('siradaki');
    const egimYazi = document.getElementById('angleText') || document.getElementById('egim');
    const gecmisListe = document.getElementById('historyList') || document.getElementById('gecmisListe');
    const solToplam = document.getElementById('leftTotal') || document.getElementById('solToplam');
    const sagToplam = document.getElementById('rightTotal') || document.getElementById('sagToplam');

    const TAHTA_UZUNLUK = 400;
    const YARISI = TAHTA_UZUNLUK / 2;
    const MAX_ACI = 30;
    const TORK_KATSAYI = 2000;
    const KALINLIK = 12;
    const TIK_BOSLUK = 24;

    let onizlemePoz = 0;
    let onizlemeObje = null;
    let sonEklenen = null;

    const temizleBtn = document.getElementById('clearBtn') || document.getElementById('temizleBtn');
    const durdurBtn = document.getElementById('pauseBtn') || document.getElementById('duraklatBtn');

    let durum = yukleDurum() || {
        aciDeg: 0,
        objeler: [],
        sonraki: rastgele(1, 10),
        duraklatildi: false
    };

    if (typeof durum.sonraki !== 'number') durum.sonraki = rastgele(1, 10);

    renderHepsi();

    zemin.addEventListener('click', e => {
        if (durum.duraklatildi) return;

        const { along, off } = pozisyonHesapla(e.clientX, e.clientY);
        if (Math.abs(off) > TIK_BOSLUK) return;
        if (along < -YARISI || along > YARISI) return;

        const yeniAgirlik = durum.sonraki;
        const id = idUret();
        const konum = Math.max(-YARISI, Math.min(YARISI, along));

        durum.objeler.push({ id, mesafe: konum, agirlik: yeniAgirlik });
        sonEklenen = id;
        durum.sonraki = rastgele(1, 10);

        sesCal(yeniAgirlik);
        renderHepsi();
    });

    zemin.addEventListener('mousemove', e => {
        if (durum.duraklatildi) { onizlemeKaldir(); return; }
        onizlemePoz = pozisyonHesapla(e.clientX, e.clientY).along;
        onizlemePoz = Math.max(-YARISI, Math.min(YARISI, onizlemePoz));
        onizlemeHazirla();
        onizlemeGuncelle();
    });

    zemin.addEventListener('mouseleave', onizlemeKaldir);

    if (temizleBtn) {
        temizleBtn.onclick = () => {
            onizlemeKaldir();
            durum = { aciDeg: 0, objeler: [], sonraki: rastgele(1, 10), duraklatildi: durum.duraklatildi };
            kaydetDurum();
            renderHepsi();
        };
    }

    if (durdurBtn) {
        durdurBtn.onclick = () => {
            durum.duraklatildi = !durum.duraklatildi;
            duraklatUI();
            kaydetDurum();
        };
        duraklatUI();
    }

    if (gecmisListe) {
        gecmisListe.addEventListener('click', e => {
            const btn = e.target;
            if (btn && btn.classList.contains('rm')) {
                const id = btn.dataset.id;
                durum.objeler = durum.objeler.filter(o => o.id !== id);
                renderHepsi();
            }
        });
    }

    function renderHepsi() {
        const { solTork, sagTork, solAg, sagAg } = torkHesapla(durum.objeler);
        const fark = sagTork - solTork;
        let hedefAci = (fark / TORK_KATSAYI) * 180 / Math.PI;
        hedefAci = Math.max(-MAX_ACI, Math.min(MAX_ACI, hedefAci));

        durum.aciDeg = hedefAci;
        solToplam.textContent = solAg.toFixed(0);
        sagToplam.textContent = sagAg.toFixed(0);
        sonrakiAgirlik.textContent = durum.sonraki;
        egimYazi.textContent = durum.aciDeg.toFixed(1);

        tahta.style.transform = `rotate(${durum.aciDeg}deg)`;

        objeKatmani.innerHTML = '';

        durum.objeler.forEach(o => {
            const d = document.createElement('div');
            d.className = 'obj';
            d.textContent = o.agirlik;
            d.style.background = renkHesapla(o.agirlik);

            const poz = `translate(calc(${YARISI}px + ${o.mesafe}px), -50%) translateX(-50%)`;
            if (o.id === sonEklenen) {
                d.style.transition = 'transform .4s cubic-bezier(.2,.7,.2,1)';
                d.style.transform = poz + ' translateY(-40px)';
                requestAnimationFrame(() => {
                    d.style.transform = poz;
                });
            } else {
                d.style.transform = poz;
            }

            objeKatmani.appendChild(d);
        });

        sonEklenen = null;
        gecmisRender();
        kaydetDurum();
    }

    function gecmisRender() {
        if (!gecmisListe) return;
        gecmisListe.innerHTML = '';
        durum.objeler.slice(-50).forEach(o => {
            const li = document.createElement('li');
            li.className = 'history-item';
            const rozet = document.createElement('span');
            rozet.className = 'badge';
            rozet.textContent = `${o.agirlik}kg`;
            rozet.style.background = renkHesapla(o.agirlik);
            const aciklama = document.createElement('span');
            aciklama.className = 'desc';

            const px = Math.abs(Math.round(o.mesafe));
            const yon = o.mesafe === 0 ? 'üzerine' : o.mesafe > 0 ? 'sağına' : 'soluna';
            aciklama.textContent = `Pivotun ${px}px ${yon} ${o.agirlik} kg eklendi`;

            const silBtn = document.createElement('button');
            silBtn.className = 'rm';
            silBtn.dataset.id = o.id;
            silBtn.textContent = '×';

            li.append(rozet, aciklama, silBtn);
            gecmisListe.appendChild(li);
        });
    }

    function torkHesapla(objeler) {
        let solT = 0, sagT = 0, solA = 0, sagA = 0;
        objeler.forEach(o => {
            const t = Math.abs(o.mesafe) * o.agirlik;
            if (o.mesafe < 0) { solT += t; solA += o.agirlik; }
            else if (o.mesafe > 0) { sagT += t; sagA += o.agirlik; }
        });
        return { solTork: solT, sagTork: sagT, solAg: solA, sagAg: sagA };
    }

    function pozisyonHesapla(x, y) {
        const rect = tahta.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const vx = x - cx;
        const vy = y - cy;
        const aci = durum.aciDeg * Math.PI / 180;
        const ax = Math.cos(aci), ay = Math.sin(aci);
        const px = -Math.sin(aci), py = Math.cos(aci);
        const along = vx * ax + vy * ay;
        const off = vx * px + vy * py;
        return { along, off };
    }

    function renkHesapla(a) {
        const oran = Math.max(0, Math.min(1, (a - 1) / 9));
        const hue = 45 - 45 * oran;
        return `hsl(${hue} 90% ${55 - 5 * oran}%)`;
    }

    function rastgele(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    function idUret() {
        return Date.now().toString(36) + Math.random().toString(16).slice(2);
    }

    function sesCal(guc) {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const bas = 160, aralik = 140;
        const vol = 0.1 + Math.min(0.2, guc * 0.02);
        const simdi = ctx.currentTime;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(bas + aralik, simdi);
        osc.frequency.exponentialRampToValueAtTime(60, simdi + 0.18);
        gain.gain.setValueAtTime(0.001, simdi);
        gain.gain.exponentialRampToValueAtTime(vol, simdi + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.001, simdi + 0.3);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(simdi);
        osc.stop(simdi + 0.3);
    }

    function onizlemeHazirla() {
        if (!onizlemeObje) {
            onizlemeObje = document.createElement('div');
            onizlemeObje.className = 'obj preview';
        }
        if (!onizlemeObje.parentNode) objeKatmani.appendChild(onizlemeObje);
    }

    function onizlemeGuncelle() {
        if (!onizlemeObje) return;
        const w = durum.sonraki;
        onizlemeObje.textContent = w;
        onizlemeObje.style.background = renkHesapla(w);
        onizlemeObje.style.transform = `translate(calc(${YARISI}px + ${onizlemePoz}px), -50%) translateX(-50%) translateY(-40px)`;
    }

    function onizlemeKaldir() {
        if (onizlemeObje && onizlemeObje.parentNode)
            onizlemeObje.parentNode.removeChild(onizlemeObje);
        onizlemeObje = null;
    }

    function duraklatUI() {
        if (!durdurBtn) return;
        if (durum.duraklatildi) {
            durdurBtn.textContent = 'Başlat';
            durdurBtn.classList.add('paused');
        } else {
            durdurBtn.textContent = 'Durdur';
            durdurBtn.classList.remove('paused');
        }
    }

    function kaydetDurum() {
        try {
            localStorage.setItem('tahta_durum', JSON.stringify(durum));
        } catch {}
    }

    function yukleDurum() {
        try {
            const raw = localStorage.getItem('tahta_durum');
            return raw ? JSON.parse(raw) : null;
        } catch {
            return null;
        }
    }

})();
