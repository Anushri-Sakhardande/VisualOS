const scroller = document.querySelectorAll(".carousel");

if(!window.matchMedia("(prefers-reduced-motion:reduce)").matches){
    addAnimation();
}

function addAnimation(){
    scroller.forEach(scroller=>{
        scroller.setAttribute("data-animated",true);
    });

    document.addEventListener("DOMContentLoaded", () => {
        const scrollerInner = document.querySelector(".innerCarousel");
        if (scrollerInner) {
            const scrollerContent = Array.from(scrollerInner.children);
            scrollerContent.forEach(item => {
                const duplicatedItem = item.cloneNode(true);
                scrollerInner.appendChild(duplicatedItem);
            });
        } else {
            console.error("innerCarousel element not found.");
        }
    });
}