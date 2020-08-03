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
    picked: null,
  },
  {
    question: "What is 27*14?",
    choices: ["485", "634", "408", "528"],
    correctAnswer: 2,
    picked: null,
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
    picked: null,
  },
  {
    question: "What is the longest river?",
    choices: ["Nile", "Amazon", "Mississippi", "Yangtze"],
    correctAnswer: 0,
    picked: null,
  },
  {
    question: "What is the busiest tube station in the London?",
    choices: ["Waterloo", "Baker Street", "Kings Cross", "Victoria"],
    correctAnswer: 0,
    picked: null,
  }
];

var currentQuestion = 0;
var correctAnswers = 0;
var quizOver = false;

$(document).ready(function() {
  // Display the first question
  displayCurrentQuestion();
  // On clicking next, display the next question
  $(this)
    .find(".nextBtn")
    .on("click", function() {
      if (!quizOver) {
        const correctAnswer = questions[currentQuestion].correctAnswer;
        const pickedOption = $("input[type='radio']:checked");
        const correctOption = $(`input[type='radio'][value='${correctAnswer}']`);
        console.log(correctOption);
        const value = pickedOption.val();

        if (value == undefined) {
          displayAlert($(".quizMessage"), "Please select an answer");
          // $(document)
          //   .find(".quizMessage")
          //   .text("Please select an answer");
          // $(document)
          //   .find(".quizMessage")
          //   .show();
        } else {
          // TODO: Remove any message -> not sure if this is efficient to call this each time....
          // $(document)
          //   .find(".quizMessage")
          //   .hide();
          const card = pickedOption.parent().parent();
          const correctCard = correctOption.parent().parent();
          if (value == correctAnswer) {
            card.removeClass(["border-danger"]).addClass(["border", "border-success"]);
            correctAnswers++;
          } else {
            card.addClass(["border", "border-danger"]);
            correctCard.addClass(["border", "border-success"]);
          }

          
          setTimeout(() => {
            currentQuestion++; // Since we have already displayed the first question on DOM ready
            if (currentQuestion < questions.length) {
              displayCurrentQuestion();
            } else {
              displayScore();
              //                    $(document).find(".nextButton").toggle();
              //                    $(document).find(".playAgainButton").toggle();
              // Change the text in the next button to ask if user wants to play again
              $(document)
                .find(".nextButton")
                .text("Play Again?");
              quizOver = true;
            }
          }, 5000);
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

    $(this).find(".previousBtn").on("click", () => {
      currentQuestion--;
      displayCurrentQuestion();
    });
});

// This displays the current question AND the choices
function displayCurrentQuestion() {
  var question = questions[currentQuestion].question;
  var questionClass = $(document).find(".question > span");
  var choiceList = $(document).find(".choiceList");
  var numChoices = questions[currentQuestion].choices.length;

  // Set the questionClass text to the current question
  $(questionClass).text(question);

  // Remove all current <li> elements (if any)
  $(choiceList)
    .find("div")
    .remove();

  var choice;
  for (let i = 0; i < numChoices; i++) {
    choice = questions[currentQuestion].choices[i];
    $(
      `<div class="form-check">
        <label class="form-check-label" for="${'choice'+i}">
        <div class="card">
          <div class="card-body">
            <input class="" type="radio" name="choice" id="${'choice'+i}" value="${i}" />
            ${choice}
          </div>
        </div>
        </label>
      </div>`
    ).appendTo(choiceList);
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


function displayAlert(parent, msg, type="danger") {
  const alert = $(
    `<div class="alert alert-${type}" role="alert">
      ${msg}
    </div>`
  );
  console.log("displaying", alert, "in", parent);
  alert.prependTo(parent);
  setTimeout(_ => alert.remove(), 3500);
}