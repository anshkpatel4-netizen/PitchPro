(() => {
  const quotes = [
    ["Some people want it to happen, some wish it would happen, others make it happen.", "Michael Jordan"],
    ["You miss 100% of the shots you don't take.", "Wayne Gretzky"],
    ["It always seems impossible until it's done.", "Nelson Mandela"],
    ["A champion is defined not by their wins but by how they can recover when they fall.", "Serena Williams"],
    ["The more difficult the victory, the greater the happiness in winning.", "Pelé"],
    ["You can't put a limit on anything. The more you dream, the farther you get.", "Michael Phelps"],
    ["I am building a fire, and every day I train, I add more fuel.", "Mia Hamm"]
  ];

  const card = document.createElement('aside');
  card.className = 'pp-quote-card';
  if (document.querySelector('.dashboard')) card.classList.add('pp-dashboard-quote');
  card.setAttribute('aria-label', 'Motivational quote');
  card.innerHTML = '<p class="pp-quote-text"></p><cite class="pp-quote-author"></cite>';
  document.body.appendChild(card);

  const text = card.querySelector('.pp-quote-text');
  const author = card.querySelector('.pp-quote-author');
  let index = Math.floor(Math.random() * quotes.length);

  const render = () => {
    text.textContent = `“${quotes[index][0]}”`;
    author.textContent = `— ${quotes[index][1]}`;
    card.classList.remove('pp-quote-change');
    void card.offsetWidth;
    card.classList.add('pp-quote-change');
  };

  render();
  window.setInterval(() => {
    index = (index + 1) % quotes.length;
    render();
  }, 9000);
})();
