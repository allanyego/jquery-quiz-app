// Import stylesheets
import "./style.css";

/**
 * Created with JetBrains WebStorm.
 * User: pwanwu
 * Date: 18/09/2013
 * Time: 17:41
 * To change this template use File | Settings | File Templates.
 */

var questions = [
  {
    question: "What is the population of Brazil?",
    choices: ["145 million", "199 million", "182 million", "205 million"],
    correctAnswer: 1,
    picked: null
  },
  {
    question: "What is 27*14?",
    choices: ["485", "634", "408", "528"],
    correctAnswer: 2,
    picked: null
  },
  {
    question: "What is the busiest train station in the world?",
    choices: [
      "Grand Central, NY",
      "Shibuya, Tokyo",
      "Beijing Central, Chine",
      "Gard du Nord, Paris"
    ],
    correctAnswer: 1,
    picked: null
  },
  {
    question: "What is the longest river?",
    choices: ["Nile", "Amazon", "Mississippi", "Yangtze"],
    correctAnswer: 0,
    picked: null
  },
  {
    question: "What is the busiest tube station in the London?",
    choices: ["Waterloo", "Baker Street", "Kings Cross", "Victoria"],
    correctAnswer: 0,
    picked: null
  }
];

function loadQuestions() {
  return new Promise((resolve, reject) => {
    $.getJSON({
      url: "test.json"
    }).done(data => {
      console.log(JSON.parse(data))
      resolve(data)
    }).fail((xhr, status, error) => {
      console.log(xhr.)
      console.log(error)
    })
  });
}

var currentQuestion = 0;
var correctAnswers = 0;
var quizOver = false;

$(document).ready(function() {
  loadQuestions().then(res => {
    console.log(res);
  }).catch(err => {
    console.error("ERROR", err);
    console.log(err.responseText);
  });
  // Display the first question
  displayCurrentQuestion();
  // On clicking next, display the next question
  $(this)
    .find(".nextBtn")
    .on("click", function() {
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
                $(document)
                  .find(".nextButton")
                  .text("Play Again?");
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
        $(document)
          .find(".nextButton")
          .text("Next Question");
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
  $(choiceList)
    .find("div")
    .remove();

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
            <input class="" type="radio" name="choice" id="${"choice" +
              i}" value="${i}" ${picked && picked == i && "checked"}/>
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
  $(document)
    .find(".quizContainer > .result")
    .show();
}

function hideScore() {
  $(document)
    .find(".result")
    .hide();
}

function displayAlert(parent, msg, type = "danger") {
  const alert = $(
    `<div class="alert alert-${type}" role="alert">
      ${msg}
    </div>`
  );
  alert.prependTo(parent);
  setTimeout(_ => alert.remove(), 3500);
}
