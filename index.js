function handleClicks() {
  formListener();
  navListner();     
  sportsSelection();
  handleNext();
  clearInput()
}

function clearInput() {
  $("#state").on("click", function() {
    $(this).val("");
  })
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
    // Build url for API
    url = buildQuery(sports, state);

    fetch(url)
    .then(response => response.json())
    .then(jsonResponse => displayEvents(jsonResponse, state))
    .catch(error => alert(`There was a problem: ${error}. Please try again`))
    $(".js-loc-next").addClass("hidden");
    $(".location-selection").addClass("hidden");
    $(".js-submit").val("Update")
  })
}

function navListner() {
  $(".nav-list").on("click", "li", function() {

    let selection = $(this).html();

    if (selection === "Location") {
      $(".location-selection").toggleClass("hidden");
      $(".sport-selection").addClass("hidden");
      $(".js-submit").removeClass("hidden");
      $(".nav-sport").removeClass("selected");
      $(".nav-loc").addClass("selected");
    } else if (selection === "Sports") {
      $(".sport-selection").toggleClass("hidden");
      $(".location-selection").addClass("hidden");
      $(".js-submit").removeClass("hidden");
      $(".nav-loc").removeClass("selected");
      $(".nav-sport").addClass("selected");
    }
  })
}

function buildQuery(sports, state) {
  // Base url for event endpoint
  str = "https://api.seatgeek.com/2/events?client_id=MTkyNTE5NzR8MTU3MjU1NzY5Mi40MQ"
  // Add each sport to str
  sports.forEach(sport => str += `&taxonomies.name=${sport}`); 
  // Add each venue to str
  str += `&venue.state=${state}`
  return str
}

function sportsSelection() {
  $("form").on("click", ".sport", function() {
    $(this).toggleClass("selected");
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
  // Clear results list
  $(".events-list").html(`<h3>Sports Events in ${state}</h3>`);
  
  displayEventsList(state, events);
  displayEventsMap(state, events);

  // Show nav/options menu and hide other controls
  $(".nav-bar").removeClass("hidden");
  $(".intro").addClass("hidden");
  $(".sport-selection").addClass("hidden");
  $(".js-submit").addClass("hidden");
}

// Display list of events
function displayEventsList(state, events) {

  for (let i = 0; i < events.length; i++) {
    let date = events[i].datetime_local.split("T")
    $(".events-list").append(`<li class="event">${date[0]} | ${events[i].taxonomies[1].name} <br> ${events[i].title} <br> ${events[i].venue.name} </li><hr>`)
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
      $(".js-submit").removeClass("hidden");
      }
    })
  }

$(handleClicks);