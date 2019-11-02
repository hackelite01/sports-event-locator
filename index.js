function handleClicks() {
  formListener();
  navListner();     
  sportsSelection();
  handleNext();

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
    .then(jsonResponse => displayEventsList(jsonResponse))
    .catch(error => alert(`There was a problem: ${error}. Please try again`))

    $(".js-loc-next").addClass("hidden");
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

// Google maps interactions
// click event and show info

function displayEventsList(jsonData) {
  let events = jsonData.events;
  // Clear results list
  $(".events-list").html("");
  // Display returned events on map
  for (let i = 0; i < events.length; i++) {
    console.log(`no events: ${jsonData.meta.total}`)
    $(".events-list").append(`<li class="event">${jsonData.events[i].title}</li>`)
  }
  $(".results-list").removeClass("hidden");
  $(".nav-bar").removeClass("hidden");
  $(".intro").addClass("hidden");
  $(".sport-selection").addClass("hidden");
  $(".js-submit").addClass("hidden");

}

function handleNext() {
  $(".js-loc-next").on("click", function() {
    $(".location-selection").addClass("hidden");
    $(".sport-selection").removeClass("hidden");
    $(".js-submit").removeClass("hidden");
  })
}

$(handleClicks);