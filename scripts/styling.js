const navbar = document.querySelector("#nav-wrapper");
const logo = document.querySelector("#logo");
const navtoggle = document.querySelector(".navbar-toggler");
const nav = document.querySelector(".navbar-nav");
window.addEventListener("scroll", (event) => {
    let scrollval = $(window).scrollTop();
    let navopacityadj = -200 / (scrollval + 14.2857) + 1;
    let navitemopacityadj = -400 / (scrollval + 14.2857) + 1;

    navbar.setAttribute("style", "background-color: rgba(60, 100, 77, " + navopacityadj + ");"); //133, 143, 130,
    logo.setAttribute("style", "background-color: rgba(241, 241, 241, " + navitemopacityadj + ");"); //221, 222, 224,
    // if(scrollval > 300){
    //     logo.setAttribute("style", "width: " + 150 - (0.05 * scrollval) + " px;");
    //     console.log(150 - (0.1 * scrollval));
    // }
    navtoggle.setAttribute("style", "background-color: rgba(241, 241, 241, " + navitemopacityadj + ");");
    nav.setAttribute("style", "background-color: rgba(241, 241, 241, " + navitemopacityadj + ");");

    // console.log(scrollval);
    // console.log(-200 / ((scrollval + 14.2857)) + 1);
})