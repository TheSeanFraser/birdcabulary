// Get the button element
const startButton = document.getElementById('start-button');

// Add a click event listener to the button
startButton.addEventListener('click', function() {
  console.log('Button clicked!');
  // Do something when the button is clicked

  $.getJSON("https://theseanfraser.github.io/birdcabulary/database.json", function(json) {
      console.log(json);
      console.log(json.species[0]);
      var songSelector = Math.floor(Math.random() * 5);
      console.log(json.species[0].songs[songSelector]);
      var songPath = "https://theseanfraser.github.io/birdcabulary/" + json.species[0].songs[songSelector];
      var audio = new Audio(songPath);
      audio.play();
});
});