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

const about = document.querySelector("#about");
about.setAttribute("style", "margin-top: " + $(window).height() + "px");
console.log($(window).height());