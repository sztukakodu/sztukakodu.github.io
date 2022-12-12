// Set the date we're counting down to
var countDownDate = getNextIssueDate().getTime();

// Update the count down every 1 second
var x = setInterval(function() {

  // Get today's date and time
  var now = new Date().getTime();

  // Find the distance between now and the count down date
  var distance = countDownDate - now;

  // Time calculations for days, hours, minutes and seconds
  var days = Math.floor(distance / (1000 * 60 * 60 * 24));
  var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
  var seconds = Math.floor((distance % (1000 * 60)) / 1000);

  document.getElementById("hero__timer").innerHTML = "za " + days + " dni, " + hours + " godzin, "  + minutes + " minut i " + seconds + " sekund ";
  // document.getElementById("hero__timer").innerHTML = days + ":" + hours + ":"  + minutes + ":" + seconds;

  // If the count down is finished, write some text
  if (distance < 0) {
    countDownDate = getNextIssueDate().getTime();
  }
}, 1000);

function getNextIssueDate() {
  const today = new Date();
  const nextMonday = new Date(today.setDate(today.getDate() + ((7 - today.getDay() + 1) % 7 || 7)));
  nextMonday.setHours(12, 0, 0);
  return nextMonday;
}