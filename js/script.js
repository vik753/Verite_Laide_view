//= ============Header Menu===============

console.log('Hello 333');
var scroll = new SmoothScroll('a[href*="#"]');
var deviceWidth = null;

//=====mobile menu main page===============

var topMobMenuOpen = $('.svg-icon__mobIco-open');
var navTopMobMenu = $('.nav-topMenu');
var navTopMobMenuClose = $('.svg-icon__mobIco');

topMobMenuOpen.on('click', mobTopMenuOpen);
navTopMobMenuClose.on('click', mobTopMenuClose);

function mobTopMenuOpen() {
  topMobMenuOpen.css({
    display: 'none'
  });
  navTopMobMenu.css({
    display: 'block',
    animation: 'bounceInDown 1s'
  });
}

function mobTopMenuClose() {
  // console.log('click');
  navTopMobMenu.css({
    animation: 'bounceOutUp 1s'
  });
  setTimeout(() => {
    navTopMobMenu.css({
      display: 'none'
    });
    topMobMenuOpen.css({
      display: 'block'
    });
  }, 900)
}

//= =======Google-Maps==============
var map
const cnt = {
  lat: 45.462941,
  lng: 9.207026
}

function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    center: cnt,
    zoom: 15
  });
  const marker = new google.maps.Marker({
    position: cnt,
    map: map,
    title: '"Vérité Laide" photostudio',
    icon: 'img/VeriteLaideGmapIco.png'
  });
  const infoWindow = new google.maps.InfoWindow({
    content: '"Vérité Laide" photostudio, Piazza Cinque Giornate, 3, 20100 Milano MI, Italy'
  });
  marker.addListener('click', function() {
    infoWindow.open(map, marker)
  });
}


//= =======================Animation========

jQuery(document).ready(function() {

  //=======mainPage animation===============

  jQuery('.container-pageCover').addClass("hidden").viewportChecker({
    classToRemove: 'hidden',
    classToAdd: 'visible animated bounceInLeft', // Class to add to the elements when they are visible
    offset: 10,
    removeClassAfterAnimation: true,
  });

  jQuery('.fashion-figure__figcaption_title').addClass("hidden").viewportChecker({
    classToRemove: 'hidden',
    classToAdd: 'visible animated fadeIn', // Class to add to the elements when they are visible
    offset: 100,
    removeClassAfterAnimation: true,
  });

  jQuery('.fashion-figure__figcaption_text').addClass("hidden").viewportChecker({
    classToRemove: 'hidden',
    classToAdd: 'visible animated fadeIn', // Class to add to the elements when they are visible
    offset: 100,
    removeClassAfterAnimation: true,
  });

  jQuery('.portrait-figure__figcaption_title').addClass("hidden").viewportChecker({
    classToRemove: 'hidden',
    classToAdd: 'visible animated fadeIn', // Class to add to the elements when they are visible
    offset: 100,
    removeClassAfterAnimation: true,
  });

  jQuery('.portrait-figure__figcaption_text').addClass("hidden").viewportChecker({
    classToRemove: 'hidden',
    classToAdd: 'visible animated fadeIn', // Class to add to the elements when they are visible
    offset: 100,
    removeClassAfterAnimation: true,
  });

 jQuery('.events-figure__figcaption_title').addClass("hidden").viewportChecker({
    classToRemove: 'hidden',
    classToAdd: 'visible animated fadeIn', // Class to add to the elements when they are visible
    offset: 100,
    removeClassAfterAnimation: true,
  });

  jQuery('.events-figure__figcaption_text').addClass("hidden").viewportChecker({
    classToRemove: 'hidden',
    classToAdd: 'visible animated fadeIn', // Class to add to the elements when they are visible
    offset: 100,
    removeClassAfterAnimation: true,
  });

  jQuery('.contact-form').addClass("hidden").viewportChecker({
    classToRemove: 'hidden',
    classToAdd: 'visible animated lightSpeedIn', // Class to add to the elements when they are visible
    offset: 10,
    removeClassAfterAnimation: true,
  });

  //=======portfolioPage animation===============

  jQuery('.portfolioPage-header').addClass("hidden").viewportChecker({
    classToRemove: 'hidden',
    classToAdd: 'visible animated lightSpeedIn', // Class to add to the elements when they are visible
    offset: 10,
    removeClassAfterAnimation: true,
  });


  jQuery('.portfolioPage-slider__container').addClass("hidden").viewportChecker({
    classToRemove: 'hidden',
    classToAdd: 'visible animated fadeInDown',
    offset: 10,
    removeClassAfterAnimation: true,
  });


  jQuery('.galleryBlock__nav').addClass("hidden").viewportChecker({
    classToRemove: 'hidden',
    classToAdd: 'visible animated lightSpeedIn',
    offset: 10,
    removeClassAfterAnimation: true,
  });

  jQuery('.portfolio__gallery').addClass("hidden").viewportChecker({
    classToRemove: 'hidden',
    classToAdd: 'visible animated bounceInUp',
    //offset: 10,
    removeClassAfterAnimation: true,
  });

  jQuery('.portfolio__img').addClass("hidden").viewportChecker({
    classToRemove: 'hidden',
    classToAdd: 'visible animated bounceInUp',
    //offset: 10,
    removeClassAfterAnimation: true,
  });

  jQuery('.portfolioPage-footer').addClass("hidden").viewportChecker({
    classToRemove: 'hidden',
    classToAdd: 'visible animated bounceIn',
    offset: 80,
    removeClassAfterAnimation: true,
  });

});



// ============Portfolio-galary=====================
let $portfolioGallery = $('.portfolio__gallery');

$('.portfolio__gallery').imagesLoaded(function() {
  $portfolioGallery.isotope({
    itemSelector: '.portfolio__img',
    horizontalOrder: true,
    layoutMode: 'masonry',
    filter: '.portfolio__img', // start filter
    masonry: {
      gutter: '.gutter-sizer'
    }
  });
});

$('.galleryBlock__btn').click(function() {
  $('.portfolio__img').removeClass('hidden animated');
  //$('.portfolio__img').addClass('visible');
  const $this = $(this)
  const filter = '.' + $this.data('filter')
  $portfolioGallery.isotope({
    filter: filter
  });
});

// ===================SlickSlider===============

$(document).ready(function() {
  $('.portfolioPage__slider').slick({
    infinite: true,
    speed: 1200,
    dots: true,
    arrows: false,
    autoplay: true
  });
});



/* $(document).click(function (e){
  console.log(e.target);
}) */

//= ======================Check wieport width

window.onload = function() {
  deviceWidth = (window.innerWidth || document.documentElement.clientWidth);
  console.log(deviceWidth >= 1300);
};

window.addEventListener('resize', function(event) {
  deviceWidth = (window.innerWidth || document.documentElement.clientWidth);
  console.log(deviceWidth >= 1300);
}, false);


