function handleClicks() {
  formListener();
  navListner();     
  sportsSelection();
  handleNext();
  clearInput();
  setDefaultDate();
}

function clearInput() {
  $("#state").on("click", function() {
    $(this).val("");
  })
}
//Set Starting date to "today"
function setDefaultDate() {
  let today = new Date().toISOString().slice(0, 10)
  $("#date-start").val(`${today}`)
}

function formListener() {
  $("form").on("click", ".js-submit", function(event) {
    event.preventDefault();

    // Display Navigation and Map on form submit
    $(".navbar").removeClass("hidden")
    $(".map").removeClass("hidden")

    // Get state slection from form  
    let state = $("#state").val();
    //Get selected sports from form
    let sports = selectedSports();
    // Get no events to displayed per page
    let eventCount = $("#no-events").val();
    // Get user selected selected date range
    let dateStart = $("#date-start").val();
    let dateEnd = $("#date-end").val();

    // Build url for API
    url = buildQuery(sports, state, eventCount, dateStart, dateEnd);

    fetch(url)
    .then(response => response.json())
    .then(jsonResponse => displayEvents(jsonResponse, state))
    .catch(error => alert(`There was a problem: ${error}. Please try again`))
    
    $(".js-loc-next").addClass("hidden");
    $(".location-selection").addClass("hidden");
    $(".search-options").addClass("hidden");
    $(".js-submit").val("Update")
  })
}

function navListner() {
  $(".nav-list").on("click", "li", function() {

    let selection = $(this).html();

    if (selection === "Location") {
      $(".location-selection").toggleClass("hidden");
      $(".sport-selection").addClass("hidden");
      $(".search-options").addClass("hidden");

      $("#nav-loc").toggleClass("selected");
      $("#nav-sport").removeClass("selected");
      $("#nav-settings").removeClass("selected");

      $(".js-submit").removeClass("hidden")
    } else if (selection === "Sports") {
      $(".sport-selection").toggleClass("hidden");
      $(".location-selection").addClass("hidden");
      $(".search-options").addClass("hidden");
      
      $("#nav-loc").removeClass("selected");
      $("#nav-sport").toggleClass("selected");
      $("#nav-settings").removeClass("selected");

      $(".js-submit").removeClass("hidden")
    } else if (selection === "Settings") {
      $(".search-options").toggleClass("hidden");
      $(".location-selection").addClass("hidden");
      $(".sport-selection").addClass("hidden");
      
      $("#nav-loc").removeClass("selected");
      $("#nav-sport").removeClass("selected");
      $("#nav-settings").toggleClass("selected");

      $(".js-submit").removeClass("hidden")
    }
  })
}

function buildQuery(sports, state, perPage, dateStart, dateEnd) {

  // Base url for event endpoint
  str = "https://api.seatgeek.com/2/events?client_id=MTkyNTE5NzR8MTU3MjU1NzY5Mi40MQ"
  // Add each sport to str
  sports.forEach(sport => str += `&taxonomies.name=${sport}`); 
  // Add each venue to str
  str += `&venue.state=${state}&per_page=${perPage}`

  if (dateStart) {
    str += `&datetime_local.gte=${dateStart}`
  }

  if (dateEnd) {
    str += `&datetime_local.lte=${dateEnd}`
  }

  return str
}

function sportsSelection() {
  $("form").on("click", ".sport", function() {
    $(this).toggleClass("selected");

    if ($(".sport.selected").length === 0) {
      $(".js-submit").addClass("hidden");
    } else {
        $(".js-submit").removeClass("hidden");
    }
  })
}

function selectedSports() {
  let sports = [];

  $(".sport.selected").each( function() {
  sports.push($(this).attr("id"));
  });
  
  return sports;
}

function displayEvents(jsonData, state) {
  let events = jsonData.events;

  // Check if there are events for given sports, in selected state 
  if (events.length > 0) {
    
    if ($("#display-map").is(":checked")) {
      displayEventsMap(state, events);
    } else {
      $(".map").addClass("hidden");
    }

    if ($("#display-list").is(":checked")) {
      // Clear results list
      $(".results-list").html(`<h3>Sports Events in ${state}</h3>
                                <ul class="events-list"></ul>
                              `);
      displayEventsList(state, events);
    } else {
      $(".results-list").addClass("hidden");
    }

  } else { 
    $(".events-list").html(`<p>No available events in ${state}, during selected time period.</p>`);
    $(".map").addClass("hidden");
  }

  // Show nav/options menu and hide other controls
  $(".nav-bar").removeClass("hidden");
  $(".intro").addClass("hidden");
  $(".sport-selection").addClass("hidden");
  $(".js-submit").addClass("hidden");
}

// Display list of events
function displayEventsList(state, events) {

  for (let i = 0; i < events.length; i++) {
    let date = events[i].datetime_local.split("T");
    let eventType = events[i].taxonomies[1].name.split("_").join(" ");
    $(".events-list").append(`<li class="event">
                                <div class="event-left">
                                  <div class="event-date">${date[0]}</div>
                                  <div class="event-type">${eventType}</div> 
                                </div>
                                <div class="event-right"><div class="event-name">${events[i].title}</div>
                                                          <div class="event-venue">${events[i].venue.name}</div>
                                                        </div>
                              </li>`)
  }

  $(".results-list").removeClass("hidden");
}

function displayEventsMap(state, events) {
   // Set map options
  let options = {
    zoom: 7, 
  };
  let map = new google.maps.Map(document.getElementById('map'), options);
  let geocoder = new google.maps.Geocoder();
  //Center map on selected State
  geocoder.geocode( { 'address': state }, function(results) {
    map.setCenter(results[0].geometry.location);
  });

  //Place event Markers
  for (let i = 0; i < events.length; i++) {
    let locLat = events[i].venue.location.lat;
    let locLng = events[i].venue.location.lon;
    let eventDescription = `<div>
        <h4 class="event-name">${events[i].title}<h4>
        <h5 class="venue-name">${events[i].venue.name}<h5>
        <h6 class="venue-address">${events[i].venue.address}, ${events[i].venue.display_location}</h6>
        </div>`;

    let infowindow = new google.maps.InfoWindow({
      content: eventDescription
    });    

    let marker = new google.maps.Marker({position: {lat: locLat, lng: locLng}, map: map, title: `${events[i].title}`});
    
    
    marker.addListener("click", function() {
      infowindow.open(map, marker);
    })
  }
}

function handleNext() {
  $(".js-loc-next").on("click", function() {
    let state = $("#state").val();

    if (state.length !== 2) {
      alert("Please enter 2 digit state code. eg. FL or NY etc");
    } else {
      $(".location-selection").addClass("hidden");
      $(".sport-selection").removeClass("hidden");
      }
    })
  }

$(handleClicks);