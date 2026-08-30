/* ==========================================================================
   MGM DABHA - Interactive Spin Wheel Gamification Engine (spin-wheel.js)
   ========================================================================== */

function openSpinWheelModal() {
    let modal = document.getElementById('spin-wheel-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'spin-wheel-modal';
        modal.className = 'lightbox-modal active';
        modal.innerHTML = `
            <div style="background:var(--card-bg); padding:35px; border-radius:24px; text-align:center; max-width:440px; position:relative; box-shadow:0 20px 50px rgba(0,0,0,0.5);">
                <span onclick="closeSpinWheelModal()" style="position:absolute; top:15px; right:20px; font-size:1.8rem; cursor:pointer; color:gray;">&times;</span>
                <h2 style="color:var(--primary); font-size:1.6rem; margin-bottom:4px;"><i class="fas fa-gift" style="color:var(--secondary);"></i> Spin & Win Daily Coupon!</h2>
                <p style="font-size:0.85rem; color:gray; margin-bottom:20px;">Try your luck and win instant discount codes for your order.</p>

                <div style="position:relative; width:260px; height:260px; margin:0 auto 20px;">
                    <canvas id="wheel-canvas" width="260" height="260" style="width:100%; height:100%; border-radius:50%; border:4px solid var(--secondary); box-shadow:0 10px 30px rgba(255,107,0,0.3);"></canvas>
                    <div style="position:absolute; top:-12px; left:50%; transform:translateX(-50%); width:0; height:0; border-left:12px solid transparent; border-right:12px solid transparent; border-top:20px solid var(--primary); z-index:10;"></div>
                </div>

                <button id="btn-spin-now" onclick="spinWheelAction()" class="btn btn-secondary" style="width:100%; font-size:1.1rem;"><i class="fas fa-redo"></i> SPIN NOW</button>
                <div id="spin-result-box" style="margin-top:15px; font-size:1rem; font-weight:700; color:var(--primary);"></div>
            </div>
        `;
        document.body.appendChild(modal);
        drawWheelCanvas();
    } else {
        modal.classList.add('active');
    }
}

function closeSpinWheelModal() {
    const modal = document.getElementById('spin-wheel-modal');
    if (modal) modal.classList.remove('active');
}

const slices = [
    { label: 'FLAT 10% OFF', code: 'SPIN10', color: '#FF6B00' },
    { label: 'FREE BEVERAGE', code: 'FREEBEV', color: '#7B0000' },
    { label: 'FLAT 20% OFF', code: 'SPIN20', color: '#2ECC71' },
    { label: 'FREE DELIVERY', code: 'FREEDEL', color: '#3498DB' },
    { label: '50 BONUS PTS', code: 'PTS50', color: '#9B59B6' },
    { label: 'FLAT ₹50 OFF', code: 'SAVE50', color: '#F4C542' }
];

let currentAngle = 0;

function drawWheelCanvas() {
    const canvas = document.getElementById('wheel-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const numSlices = slices.length;
    const sliceAngle = (2 * Math.PI) / numSlices;

    ctx.clearRect(0, 0, 260, 260);
    ctx.save();
    ctx.translate(130, 130);
    ctx.rotate(currentAngle);

    for (let i = 0; i < numSlices; i++) {
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.arc(0, 0, 125, i * sliceAngle, (i + 1) * sliceAngle);
        ctx.fillStyle = slices[i].color;
        ctx.fill();
        ctx.stroke();

        ctx.save();
        ctx.rotate(i * sliceAngle + sliceAngle / 2);
        ctx.textAlign = 'right';
        ctx.fillStyle = '#FFF';
        ctx.font = 'bold 11px Poppins';
        ctx.fillText(slices[i].label, 115, 4);
        ctx.restore();
    }
    ctx.restore();
}

function spinWheelAction() {
    const btn = document.getElementById('btn-spin-now');
    if (btn) btn.disabled = true;

    const spins = 5 + Math.random() * 5;
    const totalRotation = spins * 2 * Math.PI;
    const startAngle = currentAngle;
    const startTime = performance.now();
    const duration = 3000;

    function animateWheel(now) {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeOut = 1 - Math.pow(1 - progress, 3);
        currentAngle = startAngle + totalRotation * easeOut;
        drawWheelCanvas();

        if (progress < 1) {
            requestAnimationFrame(animateWheel);
        } else {
            const wonSlice = slices[0];
            const resultBox = document.getElementById('spin-result-box');
            if (resultBox) {
                resultBox.innerHTML = `🎉 Congratulations! You won <span style="color:var(--secondary);">${wonSlice.label}</span>! Coupon Code: <span style="background:rgba(255,107,0,0.1); padding:4px 10px; border-radius:10px;">${wonSlice.code}</span>`;
            }
            if (typeof confetti === 'function') {
                confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
            }
            if (btn) btn.disabled = false;
        }
    }
    requestAnimationFrame(animateWheel);
}
