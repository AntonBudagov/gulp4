(function(mainApp) {
'use strict';

/*
--------------------------------------------------------------------------------
owl Carsuel
--------------------------------------------------------------------------------
*/

const sliderOne = {
  nav : true,
  slideSpeed : 300,
  paginationSpeed : 400,
  items: 1,
  dots: false,
  // animateOut: 'slideOutDown',
  animateOut: 'fadeOut'
};

$('#sliderOne').owlCarousel(sliderOne)
/*
--------------------------------------------------------------------------------
modal
--------------------------------------------------------------------------------
*/

$('.modal').modal();

})(window);
