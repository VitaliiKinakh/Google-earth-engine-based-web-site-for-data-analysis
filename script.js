// Wrap our code in a self-executing anonymous function to isolate scope.
(function() {
  // The client ID from the Google Developers Console.
  var CLIENT_ID = 'YOUR-CLIENT-ID';

  // The Google Map. hhhh
  var map;

  // The Drawing Manager for the Google Map.
  var drawingManager;

  // The Google Map feature for the currently drawn polygon, if any.
  var currentPolygon;

  // The Earth Engine image on the map.
  var image;
  
  //Feature collection of countries
  var countries;
  
  // The Earth Engine Images
  var imageCO2EQ;
  var imageCO2;
  var imageN20;
  var imageCH4;
  
  
  // The scale to use for reduce regions.
  var REDUCTION_SCALE = 2000;
  
  // Frag for first time
  var frag = false;

  // Variable for changing map]
  var change = true;
  
  // Function for choose layer
	var chooseLayer = function(image, maxVal){
		var eeMapConfig = image.getMap({'min': 0, 'max': maxVal});
		var eeTileSource = new ee.layers.EarthEngineTileSource(
			'https://earthengine.googleapis.com/map',
			eeMapConfig.mapid, eeMapConfig.token);
		var overlay = new ee.layers.ImageOverlay(eeTileSource);
		 drawingManager.setMap(map);
		// Show the EE map on the Google Map.
		map.overlayMapTypes.push(overlay);
		clearPolygon();
	}
	
  // Clears the current polygon and cancels any outstanding analysis.
  var clearPolygon = function() {
    if (currentPolygon) {
      currentPolygon.setMap(null);
      currentPolygon = undefined;
    }
    $('.polygon-details .result').empty();
    $('.polygon-details').addClass('hidden');
    drawingManager.setOptions(
        {drawingMode: google.maps.drawing.OverlayType.POLYGON});
  };
	 
  // Sets the current polygon and kicks off an EE analysis mean.
  var setPolygon = function(newPolygon) {
    clearPolygon();
    currentPolygon = newPolygon;
    $('.polygon-details').removeClass('hidden');
    drawingManager.setOptions({drawingMode: null});
    var eePolygon = ee.Geometry.Polygon(getCoordinates(currentPolygon));
    var mean = image.reduceRegion(
        ee.Reducer.mean(), eePolygon, REDUCTION_SCALE);
    $('.polygon-details .result').text('Loading...');
    mean.getInfo(function(data, error) {
      // Ensure that the polygon hasn't changed since we sent the request.
      if (currentPolygon != newPolygon) return;
      $('.polygon-details .result').text(
          JSON.stringify(data || error, null, ' '));
    });
  };
  
  // Sets the current polygon and kicks off an EE analysis max.
  var setPolygonMax = function(newPolygon) {
    clearPolygon();
    currentPolygon = newPolygon;
    $('.polygon-details').removeClass('hidden');
    drawingManager.setOptions({drawingMode: null});
    var eePolygon = ee.Geometry.Polygon(getCoordinates(currentPolygon));
    var max = image.reduceRegion(
        ee.Reducer.max(), eePolygon, REDUCTION_SCALE);
    $('.polygon-details .result').text('Loading...');
    max.getInfo(function(data, error) {
      // Ensure that the polygon hasn't changed since we sent the request.
      if (currentPolygon != newPolygon) return;
      $('.polygon-details .result').text(
          JSON.stringify(data || error, null, ' '));
    });
  };
  
  //Sets the current polygon and kicks off an EE analysis min.
   var setPolygonMin = function(newPolygon) {
    clearPolygon();
    currentPolygon = newPolygon;
    $('.polygon-details').removeClass('hidden');
    drawingManager.setOptions({drawingMode: null});
    var eePolygon = ee.Geometry.Polygon(getCoordinates(currentPolygon));
    var min = image.reduceRegion(
        ee.Reducer.min(), eePolygon, REDUCTION_SCALE);
    $('.polygon-details .result').text('Loading...');
    min.getInfo(function(data, error) {
      // Ensure that the polygon hasn't changed since we sent the request.
      if (currentPolygon != newPolygon) return;
      $('.polygon-details .result').text(
          JSON.stringify(data || error, null, ' '));
    });
  };
  
  //Sets the current polygon and kicks off an EE analysis total emmision.
  var setPolygonTotal = function(newPolygon) {
    clearPolygon();
    currentPolygon = newPolygon;
    $('.polygon-details').removeClass('hidden');
    drawingManager.setOptions({drawingMode: null});
    var eePolygon = ee.Geometry.Polygon(getCoordinates(currentPolygon));
    var sum = image.reduceRegion(
        ee.Reducer.sum(), eePolygon, REDUCTION_SCALE);
	//var totalEmission = mean.multiply(numberOfCells);
    $('.polygon-details .result').text('Loading...');
    sum.getInfo(function(data, error) {
      // Ensure that the polygon hasn't changed since we sent the request.
      if (currentPolygon != newPolygon) return;
      $('.polygon-details .result').text(
          JSON.stringify(data || error, null, ' '));
    });
  };
	// Range functions - less range
	$(document).on('input', '#lessRange', function() {
		var value;
		// Change input value - change value in paragrapth
		if($("#sel option:checked").val() == "co2eq")
		{
			value = 25.056106567382812 * $(this).val() / 100;
		}else
		if($("#sel option:checked").val() == "co2")
		{
			value = 24.881305694580078 * $(this).val() / 100;
		}
		if($("#sel option:checked").val() == "ch4")
		{
			value = 0.056132908910512924 * $(this).val() / 100; 
		}
		if($("#sel option:checked").val() == "n2o")
		{
			value = 0.0002815246407408267 * $(this).val() / 100; 
		}
		$('#lessP').html( "Less than " + String(value));
	});
	
	// More range
	$(document).on('input', '#moreRange', function() {
		var value;
		// Change input value - change value in paragrapth
		if($("#sel option:checked").val() == "co2eq")
		{
			value = 25.056106567382812 * $(this).val() / 100;
		}else
		if($("#sel option:checked").val() == "co2")
		{
			value = 24.881305694580078 * $(this).val() / 100;
		}
		if($("#sel option:checked").val() == "ch4")
		{
			value = 0.056132908910512924 * $(this).val() / 100; 
		}
		if($("#sel option:checked").val() == "n2o")
		{
			value = 0.0002815246407408267 * $(this).val() / 100; 
		}
		$('#moreP').html( "More than "+ String(value) );
	});
	
	// Try it function - changes map - get more and less values
	$(document).on('click', '#rangeButton', function()
	{
		// If LESS more than MORE - alert
		if($("#lessRange").val()  < $("#moreRange").val())
		{
			alert("ERROR! MORE RANGE can't be more than LESS RANGE");
			return;
		}else
		{
			// Main change function
			// Select image for analysis
			var filteredImage; // image for filtering less than - more than
			var lValue; // less value
			var mValue; // more value
			if($("#sel option:checked").val() == "co2eq")
			{
				// check for first time
				if(frag){
					map.overlayMapTypes.clear();
					mValue = $("#moreRange").val() * 25.056106567382812 / 100;
					lValue = $("#lessRange").val() * 25.056106567382812 / 100;
					// Select greater values
					filteredImage = imageCO2EQ.gt(mValue);
					// Mask image
					filteredImage = imageCO2EQ.mask(filteredImage);
					// Select less values
					filteredImage = filteredImage.lt(lValue);
					// Mask image
					filteredImage = imageCO2EQ.mask(filteredImage);
					// Show it
					image = filteredImage;
					chooseLayer(image, 5);
					frag = true;
				}
			}else 
			if($("#sel option:checked").val() == "co2")
			{
				map.overlayMapTypes.clear();
				mValue = $("#moreRange").val() * 24.881305694580078 / 100;
				lValue = $("#lessRange").val() * 24.881305694580078 / 100;
				// Select greater values
				filteredImage = imageCO2.gt(mValue);
				// Mask image
				filteredImage = imageCO2.mask(filteredImage);
				// Select less values
				filteredImage = filteredImage.lt(lValue);
				// Mask image
				filteredImage = imageCO2.mask(filteredImage);
				// Show it
				image = filteredImage;
				chooseLayer(image, 5);
				frag = true;
			}else 
			if($("#sel option:checked").val() == "ch4")
			{
				map.overlayMapTypes.clear();
				mValue = $("#moreRange").val() * 0.056132908910512924 / 100;
				lValue = $("#lessRange").val() * 0.056132908910512924 / 100;
				// Select greater values
				filteredImage = imageCH4.gt(mValue);
				// Mask image
				filteredImage = imageCH4.mask(filteredImage);
				// Select less values
				filteredImage = filteredImage.lt(lValue);
				// Mask image
				filteredImage = imageCH4.mask(filteredImage);
				// Show it
				image = filteredImage;
				chooseLayer(image, 0.005);
				frag = true;
			}else 
			if($("#sel option:checked").val() == "n2o")
			{
				map.overlayMapTypes.clear();
				mValue = $("#moreRange").val() * 0.0002815246407408267 / 100;
				lValue = $("#lessRange").val() * 0.0002815246407408267 / 100;
				// Select greater values
				filteredImage = imageN20.gt(mValue);
				// Mask image
				filteredImage = imageN20.mask(filteredImage);
				// Select less values
				filteredImage = filteredImage.lt(lValue);
				// Mask image
				filteredImage = imageN20.mask(filteredImage);
				// Show it
				image = filteredImage;
				chooseLayer(image, 0.0001);
				frag = true;
			}
		}
		clearPolygon();
	});

	
  // Extract an array of coordinates for the given polygon.
  var getCoordinates = function(polygon) {
    var points = currentPolygon.getPath().getArray();
    return points.map(function(point) {
      return [point.lng(), point.lat()];
    });
  };

  // Runs a simple EE analysis and output the results to the web page.
    var loadMap = function() {
    // Create the base Google Map.
    map = new google.maps.Map($('.map').get(0), {
      center: { lat: 52., lng: 19.2},
      zoom: 6,
      streetViewControl: false
    });
	
    ee.initialize();
	
	//Initialize feature collection.
	countries = ee.FeatureCollection('ft:1tdSwUL7MVpOauSgRzqVTOwdfy17KDbw-1d9omPw');
	var poland = countries.filter(ee.Filter.eq('Country', 'Poland')).geometry();
	//Initialize images.
	imageCO2EQ = ee.Image('users/kingvetik/1A_4B_CO2EQ_new').clip(poland);
	imageCO2 = ee.Image('users/kingvetik/1A_4B_CO2_new').clip(poland);
	imageCH4 = ee.Image('users/kingvetik/1A4B_CH4_new').clip(poland);
	imageN20 = ee.Image('users/kingvetik/1A_4B_N2O_new').clip(poland);
	// Rename bands.
	imageCO2EQ = imageCO2EQ.rename(["CO2EQ"]);
	imageCO2 = imageCO2.rename(["CO2"]);
	imageCH4 = imageCH4.rename(["CH4"]);
	imageN20= imageN20.rename(["N2O"]);
	image = imageCO2EQ;
	
	var eeMapConfig = image.getMap({'min': 0, 'max': 5});
	var eeTileSource = new ee.layers.EarthEngineTileSource(
		'https://earthengine.googleapis.com/map',
		eeMapConfig.mapid, eeMapConfig.token);
	var overlay = new ee.layers.ImageOverlay(eeTileSource);

    // Create a Google Maps Drawing Manager for drawing polygons.
    drawingManager = new google.maps.drawing.DrawingManager({
      drawingMode: google.maps.drawing.OverlayType.POLYGON,
      drawingControl: false,
      polygonOptions: {
        fillColor: '#ff0000',
        strokeColor: '#ff0000'
      }
    });
	
	$("#alg").change(function(){
		var str = "";
		$("#alg option:selected").each(function(){
			str += $(this).text();
		});
		$("#a").text(str);
	});
	
	//  select function - change text
	$("#sel").change(function() {
    var str = "";
    $( "#sel option:selected" ).each(function() {
      str += $(this).text();
    });
    $("#s").text(str);
	});
    // Respond when a new polygon is drawn.
    google.maps.event.addListener(drawingManager, 'overlaycomplete',
        function(event) {
			var v = $("#alg option:checked").val();
			if(v === "mean")
			{
				clearPolygon();
				setPolygon(event.overlay);
			}else 
			if(v === "min")
			{
				clearPolygon();
				setPolygonMin(event.overlay);
			}else 
			if(v === "max")
			{
				clearPolygon();
				setPolygonMax(event.overlay);
			}else
			if(v === "total")
			{
				clearPolygon();
				setPolygonTotal(event.overlay);
			}
        });

    // Clear the current polygon when the user clicks the "Draw new" button.
    $('.polygon-details .draw-new').click(clearPolygon);

    drawingManager.setMap(map);

    // Show the EE map on the Google Map.
    map.overlayMapTypes.push(overlay);
  };

  $(document).ready(function() {
    // Shows a button prompting the user to log in.
    var onImmediateFailed = function() {
      $('.g-sign-in').removeClass('hidden');
      $('.output').text('Please log in to use the app.');
      $('.g-sign-in .button').click(function() {
        ee.data.authenticateViaPopup(function() {
          // If the login succeeds, hide the login button and run the analysis.
          $('.g-sign-in').addClass('hidden');
          loadMap();
        });
      });
    };

    // Attempt to authenticate using existing credentials.
    ee.data.authenticate(CLIENT_ID, loadMap, null, null, onImmediateFailed);
  });
})();

