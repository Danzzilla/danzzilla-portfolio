let sectionToggle = document.getElementById("section-toggle");
let experienceSection = document.getElementById("experience");
let projectSection = document.getElementById("projects");

sectionToggle.addEventListener("change", function(){
    if(this.checked){
        experienceSection.classList.add("d-none");
        projectSection.classList.remove("d-none");
    }else{
        projectSection.classList.add("d-none");
        experienceSection.classList.remove("d-none");
    }
});