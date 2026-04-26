
function getColors() {
  const wd  = WARDROBE[S.char];
  const top = wd.tops[S.equipped.tops]       || wd.tops[0];
  const bot = wd.bottoms[S.equipped.bottoms] || wd.bottoms[0];
  const hair= wd.hair[S.equipped.hair]       || wd.hair[0];
  const hat = wd.hats[S.equipped.hats]       || wd.hats[0];
  const acc = wd.acc[S.equipped.acc]         || wd.acc[0];
  return { top, bot, hair, hat, acc, skin: '#ffe0c8' };
}

function drawChar(bounce = false) {
  const cv  = document.getElementById('cv');
  const ctx = cv.getContext('2d');
  ctx.clearRect(0, 0, 96, 120);

  // ── SPRITE-BASED RENDERING ──────────────────────────────────
  const hairIndex = (S.equipped.hair || 0) + 1;
  const outfitIndex = (S.equipped.tops || 0) + 1;
  
  const spriteImg = new Image();
  spriteImg.src = `assets/sprites/girl_hair${hairIndex}_outfit${outfitIndex}.png`;
  spriteImg.onload = () => {
    ctx.clearRect(0, 0, 96, 120);
    ctx.drawImage(spriteImg, 0, 0, 96, 120);
  };
}
