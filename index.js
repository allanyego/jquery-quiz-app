let questions = [];

function loadQuestions(filename) {
  return new Promise((resolve, reject) => {
    $.getJSON(filename).done(resolve).fail(reject);
  });
}

var currentQuestion = 0;
var correctAnswers = 0;
var quizOver = false;

$(document).ready(async function () {
  try {
    questions = await loadQuestions("questions.json");
  } catch {
    return;
  }
  questions = questions.map((q) => ({ ...q, picked: null }));

  // Display the first question
  displayCurrentQuestion();
  // On clicking next, display the next question
  $(this)
    .find(".nextBtn")
    .on("click", function () {
      if (!quizOver) {
        if (questions[currentQuestion].picked == null) {
          const correctAnswer = questions[currentQuestion].correctAnswer;
          const pickedOption = $("input[type='radio']:checked");
          const correctOption = $(
            `input[type='radio'][value='${correctAnswer}']`
          );

          const value = pickedOption.val();

          if (value == undefined) {
            displayAlert(
              $(".quizMessage"),
              "Please select an answer before proceeding!"
            );
          } else {
            const nextBtn = $(".nextBtn");
            const btnText = nextBtn.text();
            nextBtn.attr("disabled", true).text("Moving...");

            const card = pickedOption.parent().parent();
            const correctCard = correctOption.parent().parent();
            if (value == correctAnswer) {
              card
                .removeClass(["border-danger"])
                .addClass(["border", "border-success"]);
              correctAnswers++;
            } else {
              card.addClass(["border", "border-danger"]);
              correctCard.addClass(["border", "border-success"]);
            }
            questions[currentQuestion].picked = Number(value);

            setTimeout(() => {
              currentQuestion++; // Since we have already displayed the first question on DOM ready
              if (currentQuestion < questions.length) {
                displayCurrentQuestion();
              } else {
                displayScore();
                // Change the text in the next button to ask if user wants to play again
                $(document).find(".nextButton").text("Play Again?");
                quizOver = true;
              }
              nextBtn.attr("disabled", false);
              nextBtn.text(btnText);
            }, 3500);
          }
        } else {
          currentQuestion++;
          displayCurrentQuestion();
        }
      } else {
        // quiz is over and clicked the next button (which now displays 'Play Again?'
        quizOver = false;
        $(document).find(".nextButton").text("Next Question");
        resetQuiz();
        displayCurrentQuestion();
        hideScore();
      }
    });

  $(this)
    .find(".previousBtn")
    .on("click", () => {
      currentQuestion--;
      displayCurrentQuestion();
    });
});

// This displays the current question AND the choices
function displayCurrentQuestion() {
  var question = questions[currentQuestion].question;
  const picked = questions[currentQuestion].picked;
  var questionClass = $(document).find(".question > span");
  var choiceList = $(document).find(".choiceList");
  var numChoices = questions[currentQuestion].choices.length;

  // Set the questionClass text to the current question
  $(questionClass).text(question);

  // Remove all current <li> elements (if any)
  $(choiceList).find("div").remove();

  // Disabled/hide buttons appropriately
  $(".previousBtn").attr("disabled", currentQuestion == 0);

  var choice;
  let borderClass;
  let correctAnswer = questions[currentQuestion].correctAnswer;

  for (let i = 0; i < numChoices; i++) {
    choice = questions[currentQuestion].choices[i];
    if (picked != null) {
      if ((picked == i && correctAnswer == i) || correctAnswer == i) {
        borderClass = "border border-success";
      } else if (picked == i && correctAnswer != i) {
        borderClass = "border border-danger";
      } else {
        borderClass = "";
      }
    }

    $(
      `<div class="form-check">
        <label class="form-check-label" for="${"choice" + i}">
        <div class="card ${borderClass} ${correctAnswer}">
          <div class="card-body">
            <input class="" type="radio" name="choice" id="${
              "choice" + i
            }" value="${i}" ${picked && picked == i && "checked"}/>
            ${choice}
          </div>
        </div>
        </label>
      </div>`
    ).appendTo(choiceList);
  }

  // Disable inputs if already engaged
  if (picked != null) {
    choiceList.find("input[type='radio']").attr("disabled", true);
  }
}

function resetQuiz() {
  currentQuestion = 0;
  correctAnswers = 0;
  hideScore();
}

function displayScore() {
  $(document)
    .find(".quizContainer > .result")
    .text("You scored: " + correctAnswers + " out of: " + questions.length);
  $(document).find(".quizContainer > .result").show();
}

function hideScore() {
  $(document).find(".result").hide();
}

function displayAlert(parent, msg, type = "danger") {
  const alert = $(
    `<div class="alert alert-${type}" role="alert">
      ${msg}
    </div>`
  );
  alert.prependTo(parent);
  setTimeout((_) => alert.remove(), 3500);
}
