// Get the button element
const startButton = document.getElementById('start-button');
const mcButtons = document.getElementById('mcButtons');
const citationElement = document.getElementById('citation');
const audioElement = document.getElementById('audio');
const responseElement = document.getElementById('response');

var audio = new Audio();

var citationList = "";
var curSpecies = "";
var curSound = "";
var curCitation = "";
var curScore = 0;
var totalSongs = 0;



// To get citation list, it must be done asynchronously
async function getCitations(){
  // Get citation list
  const url = "https://theseanfraser.github.io/birdcabulary/warbler-citations-list.txt"
  let response = await fetch(url);
  let citationsFromWeb = await response.text();
  return citationsFromWeb;
}

async function callGetCitations() {
    citationList = await this.getCitations();         
}

callGetCitations();

function getNextSetup(){
  // Stop current audio if playing
  audio.pause();
  totalSongs++;

  // Get the database file and select a species and sound
  $.getJSON("database.json", function(json) {
      console.log(json);
      // Clear buttons first
      mcButtons.innerHTML="";

      // Select random species
      var speciesSelector = Math.floor(Math.random() * json.species.length);

      // Get species name
      curSpecies = json.species[speciesSelector].name;
      console.log("Current species: " + curSpecies);

      // Get and play a random song for the species
      var songSelector = Math.floor(Math.random() * json.species[speciesSelector].songs.length);
      curSound =  json.species[speciesSelector].songs[songSelector];
      console.log("Current sound: " + curSound);

      // Get and set the citation for the current sound
      // console.log(citationList);
      citationElement.innerHTML = "Current sound's citation: " + curSound;

      // Set the buttons up, need list of species first
      var speciesList = [];
      for (var i = 0; i < json.species.length; i++){
        curName = json.species[i].name;
        speciesList.push(curName);
      }
      setButtons(mcButtons,speciesList)

      // Play the sound
      var songPath = "https://theseanfraser.github.io/birdcabulary/sounds/" + curSound;
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

// Add a click event listener to the button
// This button starts everything
startButton.addEventListener('click', function() {
  console.log('Start button clicked!');

  // start the quiz with the first setup
  getNextSetup();
});

// onClick for MC Buttons to determine answer 
function mcButtonSelected(id){
  if (id == curSpecies){
    console.log("CORRECT!");
    responseElement.innerHTML = "Correct!";
    curScore++;
  }
  else{
    console.log("INCORRECT!");
    responseElement.innerHTML = "Incorrect!";
  }

  // Continue to next sound
  getNextSetup();
}

