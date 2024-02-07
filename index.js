"use strict";

function handleClicks() {
    formListener();
    navListener();
    eventsSelection(); // Renamed from sportsSelection
    handleNext();
    clearInput();
    initDatePickers();
}

// Clear sample text on text input click
function clearInput() {
    $("#zipcode").on("click", function () {
        $(this).val("");
    })
}

// Load date pickers
function initDatePickers() {
    $("#date-start").datepicker();
    $("#date-end").datepicker();
}

function formListener() {
    $("form").on("submit", function (event) {
        event.preventDefault();

        // Display Navigation and Map on form submit
        $(".navbar").removeClass("hidden");

        // Get zipcode selection from form  
        let zipcode = $("#zipcode").val();
        // Get selected events from form
        let events = selectedEvents(); // Renamed from selectedSports
        // Get no events to displayed per page
        let eventCount = $("#no-events").val();
        // Get user selected selected date range
        let dateStart = $("#date-start").val();
        let dateEnd = $("#date-end").val();

        // Input validation before API calling
        if (zipcode && events.length > 0) {

            // Build url for API
            let url = buildQuery(events, zipcode, eventCount, dateStart, dateEnd);
            // Fetch data from url  
            fetch(url)
                .then(response => {
                    if (response.ok) {
                        return response.json();
                    }
                    throw new Error(response.status)
                })
                .then(jsonResponse => displayEvents(jsonResponse, zipcode))
                .catch(error => {
                    alert(`There was a problem. ${error}. Please try again`);
                });

            //Hide options after data has been displayed
            $(".js-loc-next").addClass("hidden");
            $(".location-selection").addClass("hidden");
            $(".search-options").addClass("hidden");
            $(".js-submit").val("Update")

        } else {
            if (!zipcode) { // Display location selection if no location entered
                alert("Please enter a valid zipcode.");

                $(".location-selection").removeClass("hidden");
                $("#nav-loc").addClass("selected");

                $(".event-selection").addClass("hidden"); // Renamed from sport-selection
                $("#nav-event").removeClass("selected"); // Renamed from nav-sport

                $(".search-options").addClass("hidden");
                $("#nav-settings").removeClass("selected");
            } else { // Display events selection if no event selected
                alert(`Please select at least one event to search`);

                $(".event-selection").removeClass("hidden"); // Renamed from sport-selection
                $("#nav-event").addClass("selected"); // Renamed from nav-sport

                $(".location-selection").addClass("hidden");
                $("#nav-loc").removeClass("selected");

                $(".search-options").addClass("hidden");
                $("#nav-settings").removeClass("selected");
            }
        }
    })
}

function navListener() {
    $(".nav-list").on("click", "li", function () {

        let selection = $(this).attr('id');
        // Toggle selected menu and hide others 
        if (selection === "nav-loc") {
            $(".location-selection").toggleClass("hidden");
            $(".event-selection").addClass("hidden"); // Renamed from sport-selection
            $(".search-options").addClass("hidden");

            $(this).toggleClass("selected");
            $("#nav-event").removeClass("selected"); // Renamed from nav-sport
            $("#nav-filters").removeClass("selected");

            $(".js-submit").removeClass("hidden");
        } else if (selection === "nav-event") { // Renamed from nav-sport
            $(".event-selection").toggleClass("hidden"); // Renamed from sport-selection
            $(".location-selection").addClass("hidden");
            $(".search-options").addClass("hidden");

            $("#nav-loc").removeClass("selected");
            $(this).toggleClass("selected");
            $("#nav-filters").removeClass("selected");

            $(".js-submit").removeClass("hidden");
        } else if (selection === "nav-filters") {
            $(".search-options").toggleClass("hidden");
            $(".location-selection").addClass("hidden");
            $(".event-selection").addClass("hidden"); // Renamed from sport-selection

            $("#nav-loc").removeClass("selected");
            $("#nav-event").removeClass("selected"); // Renamed from nav-sport
            $(this).toggleClass("selected");

            $(".js-submit").removeClass("hidden");
        }
    })
}

function buildQuery(events, zipcode, perPage, dateStart, dateEnd) {
    // Base url for event endpoint
    let urlStr = `https://maps.googleapis.com/maps/api/geocode/json?address=${zipcode}&key=AIzaSyDidD3i6ksEApaIp2muKG8ZGMU2WboPU7U`; // Use Google Maps Geocoding API

    return urlStr;
}

// Handle selection of each event
function eventsSelection() {
    $("form").on("click", ".event", function () { // Renamed from sport
        $(this).toggleClass("selected");

        if ($(".event.selected").length === 0) { // Renamed from sport.selected
            $(".js-submit").addClass("hidden");
        } else {
            $(".js-submit").removeClass("hidden");
        }
    })
}

// Get array of all events selected in the list
function selectedEvents() { // Renamed from selectedSports
    let events = [];

    $(".event.selected").each(function () { // Renamed from sport.selected
        events.push($(this).attr("id"));
    });

    return events;
}

function displayEvents(jsonData, zipcode) {
    let events = jsonData.results; // Response from Geocoding API

    if (events.length > 0) {
        displayEventsMap(zipcode, events);
    } else {
        alert("No locations found for the provided zipcode.");
    }
}

function displayEventsMap(zipcode, results) {
    let options = {
        zoom: 10,
        center: results[0].geometry.location
    };
    let map = new google.maps.Map(document.getElementById('map'), options);

    let marker = new google.maps.Marker({
        position: results[0].geometry.location,
        map: map,
        title: 'Location' // Adjust as needed
    });
}

// Function to handle next click in initial intro
function handleNext() {
    $(".js-loc-next").on("click", function () {
        let zipcode = $("#zipcode").val();
        if (!zipcode || zipcode.length !== 6) {
            alert("Please enter a valid 6-digit zipcode.");
        } else {
            $(".intro").addClass("hidden");
        }
    })
}

$(handleClicks);
