const navToggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelector('.nav-links');
function setMenu(open) {
 if (!navToggle || !navLinks) return;
 navToggle.classList.toggle('open', open);
 navLinks.classList.toggle('open', open);
 navToggle.setAttribute('aria-expanded', String(open));
 navToggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
}
navToggle?.addEventListener('click', () => setMenu(!navLinks.classList.contains('open')));
navLinks?.querySelectorAll('a').forEach(link => link.addEventListener('click', () => setMenu(false)));
document.addEventListener('keydown', event => {
 if (event.key === 'Escape' && navToggle?.classList.contains('open')) { setMenu(false); navToggle.focus(); }
});
document.addEventListener('click', event => { if (!event.target.closest('.navbar')) setMenu(false); });
window.matchMedia('(max-width: 768px)').addEventListener('change', () => setMenu(false));
if (document.querySelector('.carousel-slide')) {
const slides = document.querySelectorAll('.carousel-slide');
const dots = document.querySelectorAll('.dot');
let current = 0;
let timer;

function goTo(index) {
    slides[current].classList.remove('active');
    dots[current].classList.remove('active');
    current = (index + slides.length) % slides.length;
    slides[current].classList.add('active');
    dots[current].classList.add('active');
}

function autoPlay() {
    timer = setInterval(() => goTo(current + 1), 4000);
}

document.querySelector('.next')?.addEventListener('click', () => { clearInterval(timer); goTo(current + 1); autoPlay(); });
document.querySelector('.prev')?.addEventListener('click', () => { clearInterval(timer); goTo(current - 1); autoPlay(); });
dots.forEach((dot, i) => dot.addEventListener('click', () => { clearInterval(timer); goTo(i); autoPlay(); }));

autoPlay();

}
