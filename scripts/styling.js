//Document Object Declarations
const photography = document.querySelector('#photography');
const videography = document.querySelector('#videography');
const background = document.querySelector('#home-wrapper');

//Event Listeners
photography.addEventListener('mouseover', photographyView);
videography.addEventListener('mouseover', videographyView);
photography.addEventListener('mouseout', defaultView);
videography.addEventListener('mouseout', defaultView);

//Functions
function defaultView(){
    background.style.backgroundImage = 'url("images/website/main.jpg")';
}

function photographyView(){
    background.style.backgroundImage = 'url("images/website/back.jpg")';
}

function videographyView(){
    background.style.backgroundImage = 'url("images/website/gas.jpg")';
}

//TODO add a timer between each crossfade