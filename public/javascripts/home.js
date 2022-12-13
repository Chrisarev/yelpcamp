let aniBottom = document.querySelectorAll('.aniBottom'); 
function elementInViewport2(el) {
    var top = el.offsetTop;
    var left = el.offsetLeft;
    var width = el.offsetWidth;
    var height = el.offsetHeight;
    while(el.offsetParent) {
      el = el.offsetParent;
      top += el.offsetTop;
      left += el.offsetLeft;
    }
    return (
      top < (window.pageYOffset + window.innerHeight) &&
      left < (window.pageXOffset + window.innerWidth) &&
      (top + height) > window.pageYOffset &&
      (left + width) > window.pageXOffset
    );
  }

function animateIfScrolled() {
  for(let i =0;i<aniBottom.length; i++)
  if(elementInViewport2(aniBottom[i])){
    aniBottom[i].classList.add("animateFromBottom");
    aniBottom[i].classList.remove("animateFadeOut");
  }else{
    aniBottom[i].classList.add("animateFadeOut");
    aniBottom[i].classList.remove("animateFromBottom");
  }
}

window.addEventListener("scroll", function(){
  animateIfScrolled();
})