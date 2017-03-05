(function($) {

	skel.breakpoints({
		xxlarge: '(max-width: 1920px)',
		xlarge: '(max-width: 1680px)',
		large: '(max-width: 1280px)',
		medium: '(max-width: 1000px)',
		small: '(max-width: 736px)',
		xsmall: '(max-width: 480px)',
	});

	$(function() {

		var	$window = $(window),
			$body = $('body'),
			$header = $('#header'),
			$all = $body.add($header);

		// Disable animations/transitions until the page has loaded.
			$body.addClass('is-loading');

			$window.on('load', function() {
				window.setTimeout(function() {
					$body.removeClass('is-loading');
				}, 500);
			});	
			
		// Mobile navigation bar
			$('#overlay').click(function(){
				if($('#overlay').hasClass('menu-spin')){
					$('#overlay').removeClass('menu-spin');
					$('#header nav').removeClass('show-nav');
					$('#header nav').css({'z-index': '-2'});

				}else{
					$('#overlay').addClass('menu-spin');
					$('#header nav').css({'display': 'block'});
					$('#header nav').addClass('show-nav');
				}
			});


		// Display navigation after resize window
			$window.resize(function(){
				if($window.width() > 736){
					$('#header nav').css({'display': 'block'});
				} else {
					$('#header nav').css({'display': 'none'});

				}
			});

		// Load website
			$window.on('load', function(){
				
			// Get current time and set greeting message
				var time = new Date();

			// Use CORS Anywhere to set the CORS headers
				$.ajaxPrefilter( function (options) {
					if (options.crossDomain && jQuery.support.cors) {
						var http = (window.location.protocol === 'http:' ? 'http:' : 'https:');
						options.url = http + '//cors-anywhere.herokuapp.com/' + options.url;
					}
				});

			// Get today's bing wallpaper as background image
				var base = 'https://www.bing.com',
				    json_url = '/HPImageArchive.aspx?format=js&idx=0&n=1&mkt=en-US';
				
				$.getJSON(base + json_url, function(json){
					var img_url = base + json.images[0].url;
					$('#intro').css({
						"background-image": "url(" + img_url + ")",
						"background-repeat": "no-repeat",
						"background-size": "cover"
					});
				});

				$('#copyright').html('&copy; ' + time.getFullYear());
			});

		// Get all suitable buses/skytrains between current and destination

			$("#submit").click(function(){

				var t1 = 'http://api.translink.ca/rttiapi/v1/stops?apikey=Kwqwi28lOEd4VGhOV1G7&lat=';
				var	t2 = '&long=';
				var add = $('#destination').val();
				var google = 'https://maps.googleapis.com/maps/api/geocode/json?address=';
				var googleapi = 'Vancouver,+CANADA&key=AIzaSyAKaJIupFu06_xES1fWII_bzCgtW1Iwcb8';

				var startstops = getStartStops(t1, t2);
				var destinationstops = getDestinationStops(t1, t2, google, googleapi, add);

				var set1 = new Set();
				var set2 = new Set();

				for(var res in startstops){
					var temp = res.Routes.split(", ");
					for(var r in temp){
						set1.add(r);
					}
				}

				for(var res in destinationstops){
					var temp = res.Routes.split(", ");
					for(var r in temp){
						set2.add(r);
					}
				}

				Array.prototype.getDuplicates = function(arr2) {
					var dup = {};
					for (var i in this){
						if(arr2.indexOf(this[i]) > -1){
							dup.push(this[i]);
						}
					}
					return dup;
				}

				return set1.getDuplicates(set2);
			});

		// Get the schedule for a specific bus
			$("#busList").on('click', 'tr', function(e){
				e.preventDefault();
				var bus = $(this).attr('value');

				var trans3 = 'http://api.translink.ca/rttiapi/v1/buses?apikey=Kwqwi28lOEd4VGhOV1G7&stopNo=';
				var trans4 = '&routeNo=';
			})	
		
		// Get all stops near start location

			function getStartStops(trans1, trans2){
				if (navigator.geolocation) {
					navigator.geolocation.getCurrentPosition(getLocation);
				} else {
					toastr.warning("Get Geolocation infomation failed.");
				}
				function getLocation(location){
					lati = location.coords.latitude.toFixed(6);
					long = location.coords.longitude.toFixed(6);
					
					var transurl = trans1 + lati + trans2 + long;

					$.ajax({
						url: transurl,
						dataType: 'json',
						async: false,
						success: function(res){
							return res;
						}
					});		
				}
			}
		
		// Get all stops near destination

			function getDestinationStops(trans1, trans2, google, googleapi, add){
				$.ajax({
					url: google + add + googleapi,
					dataType: 'json',
					async: false,
					success:function(res1){
						var lati = res1.results[0].geometry.location.lat;
						var long = res1.results[0].geometry.location.lng;
						var transurl2 = trans1 + lati.toFixed(6) + trans2 + long.toFixed(6);
						$.ajax({
							url: transurl2,
							dataType: 'json',
							async : false,
							success: function(res2){
								return res2;
								//alert(res2);
							}
						});
					}
				});		
			}

		// Touch mode.
			skel.on('change', function() {

				if (skel.vars.mobile || skel.breakpoint('small').active)
					$body.addClass('is-touch');
				else
					$body.removeClass('is-touch');

			});

		// Fix: IE flexbox fix.
			if (skel.vars.IEVersion <= 11
			&&	skel.vars.IEVersion >= 10) {

				var $main = $('.main.fullscreen'),
					IEResizeTimeout;

				$window.on('resize.ie-flexbox-fix', function() {
					clearTimeout(IEResizeTimeout);
					IEResizeTimeout = setTimeout(function() {
						var wh = $window.height();
						$main.each(function() {
							var $this = $(this);
							$this.css('height', '');
							if ($this.height() <= wh)
								$this.css('height', (wh - 50) + 'px');
						});
					});
				})
				.triggerHandler('resize.ie-flexbox-fix');
			}

		// Prioritize "important" elements on small.
			skel.on('+small -small', function() {
				$.prioritize(
					'.important\\28 small\\29',
					skel.breakpoint('small').active
				);
			});

		// Section transitions.
			if (skel.canUse('transition')) {

				var on = function() {

					// Generic sections.
						$('.main.style1')
							.scrollex({
								mode:		'middle',
								delay:		100,
								initialize:	function() { $(this).addClass('inactive'); },
								terminate:	function() { $(this).removeClass('inactive'); },
								enter:		function() { $(this).removeClass('inactive'); },
								leave:		function() { $(this).addClass('inactive'); }
							});

						$('.main.style2')
							.scrollex({
								mode:		'middle',
								delay:		100,
								initialize:	function() { $(this).addClass('inactive'); },
								terminate:	function() { $(this).removeClass('inactive'); },
								enter:		function() { $(this).removeClass('inactive'); },
								leave:		function() { $(this).addClass('inactive'); }
							});

				};

				var off = function() {

					// Generic sections.
						$('.main.style1')
							.unscrollex();

						$('.main.style2')
							.unscrollex();

				};

				skel.on('change', function() {

					if (skel.breakpoint('small').active)
						(off)();
					else
						(on)();
				});

			}

		// Events.
			var resizeTimeout, resizeScrollTimeout;

			$window
				.resize(function() {

					// Disable animations/transitions.
					$body.addClass('is-resizing');
					window.clearTimeout(resizeTimeout);
					resizeTimeout = window.setTimeout(function() {

						// Update scrolly links.
							$('a[href^="#"]').scrolly({
								speed: 1500,
								offset: $header.outerHeight() - 1
							});

						// Re-enable animations/transitions.
							window.setTimeout(function() {
								$body.removeClass('is-resizing');
								$window.trigger('scroll');
							}, 0);

					}, 100);

				})
				.load(function() {
					$window.trigger('resize');
				});
	});
})(jQuery);