// Navbar Scroll //

const navbar = document.querySelector("#nav-wrapper");
const logo = document.querySelector("#logo");
const navtoggle = document.querySelector(".navbar-toggler");
const nav = document.querySelector(".navbar-nav");
window.addEventListener("scroll", (event) => {
    let scrollval = $(window).scrollTop();
    let navopacityadj = -200 / (scrollval + 14.2857) + 1.2;
    let navitemopacityadj = -400 / (scrollval + 14.2857) + 1.2;

    if(navopacityadj < 1){
        navbar.setAttribute("style",
            "background-color: rgba(60, 100, 77, " + navopacityadj + ");"); //133, 143, 130,
    }

    if(navitemopacityadj < 1){
        logo.setAttribute("style",
            "background-color: rgba(241, 241, 241, " + navitemopacityadj + ");"); //221, 222, 224,
        navtoggle.setAttribute("style",
            "background-color: rgba(241, 241, 241, " + navitemopacityadj + ");");
        nav.setAttribute("style",
            "background-color: rgba(241, 241, 241, " + navitemopacityadj + ");");
    }
})

// screen size adjustments //

const portfolio = document.querySelector("#portfolio");
portfolio.setAttribute("style", "margin-top: " + ($(window).height() - 134) + "px");

// carousel //

const carouselContainer = document.querySelector('.mycarousel-container');
const carouselControlsContainer = document.querySelector('.mycarousel-controls');
const carouselControls = ['previous', 'next'];
const carouselItems = document.querySelectorAll('.mycarousel-item');

class Carousel{

    constructor(container, items, controls) {
        this.carouselContainer = container;
        this.carouselControls = controls;
        this.carouselArray = [...items];
    }

    updateCarousel(){
        this.carouselArray.forEach(el => {
            el.classList.remove('mycarousel-item-1');
            el.classList.remove('mycarousel-item-2');
            el.classList.remove('mycarousel-item-3');
            el.classList.remove('mycarousel-item-4');
            el.classList.remove('mycarousel-item-5');
        });

        this.carouselArray.slice(0, 5).forEach((el, i) => {
            el.classList.add(`mycarousel-item-${i+1}`);
        })
    }

    setCurrentState(direction){
        if(direction.className === 'mycarousel-controls-previous'){
            this.carouselArray.unshift(this.carouselArray.pop());
        }
        else{
            this.carouselArray.push(this.carouselArray.shift());
        }
        this.updateCarousel();
    }

    setControls(){
        this.carouselControls.forEach(control => {
            carouselControlsContainer.appendChild(document.createElement('button')).className
                = `mycarousel-controls-${control}`;
        });
    }

    useControls(){
        const triggers = [...carouselControlsContainer.childNodes];
        triggers.forEach(control => {
            control.addEventListener('click', e => {
               e.preventDefault();
               this.setCurrentState(control);
            });
        });
    }
}

const carousel = new Carousel(carouselContainer, carouselItems, carouselControls);
carousel.setControls();
carousel.useControls();
let carouselInterval = setInterval(function(){
    document.querySelector('.mycarousel-controls-next').click();}, 5000);

document.querySelector('.mycarousel-controls-previous').addEventListener('click', () => {
    clearInterval(carouselInterval);
    setTimeout(function(){
        carouselInterval = setInterval(function(){
            document.querySelector('.mycarousel-controls-next').click();}, 5000);
    }, 10000);
})