(() => {
  const names = ['Écureuil', 'Cinnamoroll', 'Gloomy Bear', 'Usahana', 'My Sweet Piano',
    'Monchhichi', 'Hello Kitty cerise', 'Mofusand fraise', 'Snoopy', 'Princesse Clown',
    'Pucca', 'Smiski', 'Rebelle', 'Bulle', 'Belle'];
  const english = ['Squirrel', 'Cinnamoroll', 'Gloomy Bear', 'Usahana', 'My Sweet Piano',
    'Monchhichi', 'Cherry Hello Kitty', 'Strawberry Mofusand', 'Snoopy', 'Clown Princess',
    'Pucca', 'Smiski', 'Buttercup', 'Bubbles', 'Blossom'];
  // Unspecified variants use wording that does not assume a character's gender.
  const feminine = new Set(['Usahana', 'My Sweet Piano', 'Hello Kitty cerise', 'Princesse Clown', 'Pucca', 'Rebelle', 'Bulle', 'Belle']);
  const unspecified = new Set(['Monchhichi', 'Mofusand fraise', 'Smiski']);
  const art = number => 'assets/room-gachapon/collection/' + number + '.webp';
  const figures = names.map((fr, i) => {
    const number = 7545 + i;
    const agreement = unspecified.has(fr) ? null : feminine.has(fr) ? 'f' : 'm';
    return {agreement, id: 'charm-gacha-' + number, fr, en: english[i], image: art(number), worn: art(number + '-worn')};
  });
  const colors = [[7566,7561,25], [7567,7560,28], [7568,7562,27], [7569,7563,29], [7570,7564,26]]
    .map(([closed, half, tray]) => ({tray, closed: art(closed), half: art(half)}));
  window.NanaGacha = {figures, colors, clearHalf: art(7565)};
})();
