

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

        $(".shuffleMe").sort(function (a, b) {
            a = parseFloat($(".years", a).text()); // get the value of .score element inside a
            b = parseFloat($(".years", b).text()); // get the value of .score element inside b
            return b - a;                          // sort descendently
        }).appendTo(".work-gallery");

