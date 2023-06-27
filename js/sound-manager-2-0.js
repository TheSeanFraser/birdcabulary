// Get the button element
const startButton = document.getElementById('start-button');
const mcButtons = document.getElementById('mcButtons');
const citationElement = document.getElementById('citation');
const audioElement = document.getElementById('audio');
const responseElement = document.getElementById('response');
const prevCorrectElement = document.getElementById('prevCorrect');
const promptElement = document.getElementById('prompt');
// Vars for selector section
const familyChecksElement = document.getElementById('family_response');
const selectorPageElement = document.getElementById('selector_page');

var audio = new Audio();

var citationsJSON = {};
var curSpecies = "";
var curSound = "";
var curCitation = "";
var curScore = 0;
var totalSongs = 0;

var birdFamiliesJSON = {};
var listOfSelectedSpecies = [];

var song_bool = false;
var call_bool = false;



function getCitationsJSON(){
    // Get the citations
  $.getJSON("citations.json", function(json) {
      citationsJSON = json;
  });

}

getCitationsJSON();


// Populate bird families checkboxes
function getBirdFamilies(){
    // Get the database file and select a species and sound
  $.getJSON("families.json", function(json) {
      for (var key in json){
        var newDiv = document.createElement('div');
        // newDiv.innerHTML = key;
        var checkbox = document.createElement('input');
        checkbox.type = "checkbox";
        checkbox.name = key;
        checkbox.id = key;
        checkbox.value = true;
        checkbox.className = "family_box"
        newDiv.appendChild(checkbox);
       
        var label = document.createElement('label');
        label.htmlFor = key;
        label.innerHTML = key;
        newDiv.appendChild(label);

        familyChecksElement.appendChild(newDiv);
      }

      birdFamiliesJSON = json;
      
  });

}

getBirdFamilies();

// Start the next part of the game
function getNextSetup(){
  // Stop current audio if playing
  audio.pause();

  var speciesIndexList = [];

  // Get the database file and select a species and sound
  $.getJSON("database.json", function(json) {
      // Clear buttons first
      mcButtons.innerHTML="";

      // Pick species from the preselected list of families
      var selected_species_index = Math.floor(Math.random() * listOfSelectedSpecies.length);
      console.log("sel species: "+ selected_species_index);

      // Match the species to the index in the database
      var curSpeciesIndex = 0;
      for(var i = 0; i < json.species.length; i++){
        if(json.species[i].name == listOfSelectedSpecies[selected_species_index]){
          curSpeciesIndex = i
        }
      }

      // Add current species index to the index list for the MC buttons
      speciesIndexList.push(curSpeciesIndex);

      // Get species name
      curSpecies = json.species[curSpeciesIndex].name;

      // Get and play a random song for the species
      // TODO: add call selection
      var songSelector = Math.floor(Math.random() * json.species[curSpeciesIndex].songs.length);
      curSound =  json.species[curSpeciesIndex].songs[songSelector];

      // Get and set the citation for the current sound
      citationStr = citationsJSON[curSound];
      citationElement.innerHTML = citationStr;

      // Select 3 extra random species for buttons
      while (speciesIndexList.length < 4){
        // Pick species from the preselected list of families
        var rand_species = Math.floor(Math.random() * listOfSelectedSpecies.length);
        console.log("sel species: "+ selected_species_index);

        // Match the species to the index in the database
        var newSpeciesIndex = 0;
        for(var i = 0; i < json.species.length; i++){
          if(json.species[i].name == listOfSelectedSpecies[rand_species]){
            newSpeciesIndex = i
          }
        }
        // If the species isn't already in the list, add it
        if(speciesIndexList.indexOf(newSpeciesIndex) === -1) speciesIndexList.push(newSpeciesIndex);
      }

      //Set the buttons up, need list of species first
      var speciesList = [];
      for (var i = 0; i < speciesIndexList.length; i++){
        curIndex = speciesIndexList[i];
        curName = json.species[curIndex].name;
        speciesList.push(curName);
      }
      speciesList = speciesList.sort((a, b) => 0.5 - Math.random());
      setButtons(mcButtons,speciesList);

      // Play the sound
      var songPath = "https://theseanfraser.github.io/birdcabulary/sounds/" + curSound + ".mp3";
      audio.src = songPath;
      audio.load();
      audio.play();
  });
}

// Create the buttons based on the species list
function setButtons(btnGroup, btnList){
   $.each(btnList, function(k, v){
    var btn = $("<button>", {
      class: "mc-button",
      id: v,
      onclick: "mcButtonSelected(this.id)"
    }).html(v).appendTo(btnGroup);
  });
}

// This button starts everything
startButton.addEventListener('click', function() {
  // Build list of sound types and species
  // Set the sound type flags
  var sound_type_matches = document.querySelectorAll(".sound_type_box:checked");
  for(var i = 0; i < sound_type_matches.length; i++){
    var cur_sound_type = sound_type_matches[i].name;
    // console.log(sound_type_matches[i].name);
    if(cur_sound_type == "Songs"){
      song_bool = true;
    } else if (cur_sound_type == "Calls"){
      call_bool = true;
    }

  }

  // Build the list of selected families from the checkboxes
  var family_matches = document.querySelectorAll('.family_box:checked');
  var selected_families = [];
  for(var i = 0; i < family_matches.length; i++){
    selected_families.push(family_matches[i].name);
  }

 

  // Build the list of species from the selected families
  for(var f = 0; f < selected_families.length; f++){
    for(var i =0; i < birdFamiliesJSON[selected_families[f]].length; i++){
      listOfSelectedSpecies.push(birdFamiliesJSON[selected_families[f]][i]);
    }
  }

  // Print the list of selected species for debugging
  console.log(listOfSelectedSpecies);


  console.log('Start button clicked!');

  // start the quiz with the first setup
  if(selected_families.length != 0){
    if(song_bool == true || call_bool == true){
      selectorPageElement.remove();
      startButton.remove();
      getNextSetup();
    }
  }
  
});

// onClick for MC Buttons to determine answer 
function mcButtonSelected(id){
  if (id == curSpecies){
    curScore++;
    totalSongs++;
    responseElement.innerHTML = "Correct! " + curScore + '/' + totalSongs;
    
  }
  else{
    totalSongs++;
    responseElement.innerHTML = "Incorrect! " + curScore + '/' + totalSongs;
  }

  prevCorrectElement.innerHTML = "Previous answer: " + curSpecies;
  // Continue to next sound
  getNextSetup();
}

