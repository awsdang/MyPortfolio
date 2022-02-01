

/*------------------
	Isotope Filter
--------------------*/
var $container = $('.work-gallery');
	$container.imagesLoaded().progress( function() {
		$container.isotope();
	});

$('.work-filter a').on('click', function(){
	$(".work-filter a").removeClass("active");
	$(this).addClass("active");
	var selector = $(this).attr('data-filter');
	$container.imagesLoaded().progress( function() {
		$container.isotope({
			filter: selector,
		});
	});
	return false;
});
