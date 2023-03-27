// Get the button element
const startButton = document.getElementById('start-button');
const mcButtons = document.getElementById('mcButtons');
const citationElement = document.getElementById('citation');
const audioElement = document.getElementById('audio');
const responseElement = document.getElementById('response');
const prevCorrectElement = document.getElementById('prevCorrect');

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

function searchStringInArray (str, strArray) {
    for (var j=0; j<strArray.length; j++) {
        if (strArray[j].match(str)) return j;
    }
    return -1;
}

function getNextSetup(){
  // Stop current audio if playing
  audio.pause();

  var speciesNumList = [];

  // Get the database file and select a species and sound
  $.getJSON("database.json", function(json) {
      console.log(json);
      // Clear buttons first
      mcButtons.innerHTML="";

      // Select random species
      var speciesSelector = Math.floor(Math.random() * json.species.length);
      speciesNumList.push(speciesSelector);

      // Get species name
      curSpecies = json.species[speciesSelector].name;
      console.log("Current species: " + curSpecies);

      // Get and play a random song for the species
      var songSelector = Math.floor(Math.random() * json.species[speciesSelector].songs.length);
      curSound =  json.species[speciesSelector].songs[songSelector];
      console.log("Current sound: " + curSound);

      // Get and set the citation for the current sound
      // console.log(citationList);
      
      var matches = citationList.filter(s => s.includes(curSound.slice(0, -4)));
      citationElement.innerHTML = "Current sound's citation: " + matches;

      // Select 3 extra random species for buttons
      while (speciesNumList.length < 4){
        var r = Math.floor(Math.random() * json.species.length)
        if(speciesNumList.indexOf(r) === -1) speciesNumList.push(r);
      }
      console.log(speciesNumList);

      // var speciesList = [];
      // for (var i = 0; i < json.species.length; i++){
      //   curName = json.species[i].name;
      //   speciesList.push(curName);
      // }

      //Set the buttons up, need list of species first
      var speciesList = [];
      for (var i = 0; i < speciesNumList.length; i++){
        curIndex = speciesNumList[i];
        curName = json.species[curIndex].name;
        speciesList.push(curName);
      }
      speciesList = speciesList.sort((a, b) => 0.5 - Math.random());
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
  startButton.remove();
  citationList = citationList.split('\n');
  // start the quiz with the first setup
  getNextSetup();
});

// onClick for MC Buttons to determine answer 
function mcButtonSelected(id){
  if (id == curSpecies){
    curScore++;
    totalSongs++;
    console.log("CORRECT!");
    responseElement.innerHTML = "Correct! " + curScore + '/' + totalSongs;
    
  }
  else{
    totalSongs++;
    console.log("INCORRECT!");
    responseElement.innerHTML = "Incorrect! " + curScore + '/' + totalSongs;
  }

  prevCorrectElement.innerHTML = "Previous answer: " + curSpecies;
  // Continue to next sound
  getNextSetup();
}

