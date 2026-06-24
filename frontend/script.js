const navToggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelector('.nav-links');

navToggle.addEventListener('click', () => {
    navToggle.classList.toggle('open');
    navLinks.classList.toggle('open');
});

navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
        navToggle.classList.remove('open');
        navLinks.classList.remove('open');
    });
});

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

document.querySelector('.next').addEventListener('click', () => { clearInterval(timer); goTo(current + 1); autoPlay(); });
document.querySelector('.prev').addEventListener('click', () => { clearInterval(timer); goTo(current - 1); autoPlay(); });
dots.forEach((dot, i) => dot.addEventListener('click', () => { clearInterval(timer); goTo(i); autoPlay(); }));

autoPlay();
