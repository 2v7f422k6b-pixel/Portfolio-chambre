(() => {
  const names = ['Chaton de fête', 'Cinnamoroll', 'Gloomy Bear', 'Usahana', 'My Sweet Piano',
    'Monchhichi lapin', 'Hello Kitty cerises', 'Chaton fraise', 'Snoopy', 'Princesse Clown',
    'Pucca', 'Kappa', 'Rebelle', 'Bulle', 'Belle'];
  const english = ['Party kitten', 'Cinnamoroll', 'Gloomy Bear', 'Usahana', 'My Sweet Piano',
    'Bunny Monchhichi', 'Cherry Hello Kitty', 'Strawberry kitten', 'Snoopy', 'Clown Princess',
    'Pucca', 'Kappa', 'Buttercup', 'Bubbles', 'Blossom'];
  const art = number => 'assets/room-gachapon/collection/' + number + '.webp';
  const figures = names.map((fr, i) => {
    const number = 7545 + i;
    return {id: 'charm-gacha-' + number, fr, en: english[i], image: art(number), worn: art(number + '-worn')};
  });
  const colors = [[7566,7561], [7567,7560], [7568,7562], [7569,7563], [7570,7564]]
    .map(([closed, half]) => ({closed: art(closed), half: art(half)}));
  window.NanaGacha = {figures, colors, clearHalf: art(7565)};
})();
