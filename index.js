let questions = [];

function loadQuestions(filename) {
  return new Promise((resolve, reject) => {
    $.getJSON(filename).done(resolve).fail(reject);
  });
}

var currentQuestion = 0;
var correctAnswers = 0;
var quizOver = false;
let duration;
let beatTimer = false;

$(document).ready(async function () {
  $(".questionsCard").hide();
  $(".resultCard").hide();

  try {
    const test = await loadQuestions("questions.json");
    questions = test.questions.map((q) => ({ ...q, picked: null }));
    duration = test.duration;
  } catch {
    return;
  }

  $(".welcomeCard #duration").text(duration);
  $(".welcomeCard #numQuestions").text(questions.length);
  $(".welcomeCard button").on("click", startQuiz);
});

function startQuiz() {
  $(".welcomeCard").hide();
  const questionsCard = $(".questionsCard");
  questionsCard.show();
  // Display the first question
  displayCurrentQuestion();
  startTimer();
  // On clicking next, display the next question
  questionsCard.find(".nextBtn").on("click", onNextBtnClick);
  questionsCard.find(".previousBtn").on("click", onPrevBtnClick);
  questionsCard
    .find(".resultBtnContainer button")
    .on("click", displayResultCard);
}

function onNextBtnClick() {
  if (!quizOver) {
    if (questions[currentQuestion].picked == null) {
      const correctAnswer = questions[currentQuestion].correctAnswer;
      const pickedOption = $("input[type='radio']:checked");
      const correctOption = $(`input[type='radio'][value='${correctAnswer}']`);

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
            beatTimer = true;
            quizOver = true;
            displayResultCard();
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
    currentQuestion++;
    displayCurrentQuestion();
  }
}

function onPrevBtnClick() {
  currentQuestion--;
  displayCurrentQuestion();
}

function displayResultCard() {
  $(".questionsCard").hide();
  const resultCard = $(".resultCard");
  resultCard.show();
  // Display alert if user timed out
  if (!beatTimer) {
    $(`<div class="alert alert-warning">
  Time is up
  </div>`).prependTo(resultCard.find(".card-body"));
  }
  resultCard.find("#correct").text(correctAnswers);
  resultCard.find("#total").text(questions.length);
  resultCard
    .find("#attempted")
    .text(questions.filter((q) => q.picked != null).length);
  resultCard
    .find("#score")
    .text(Math.round((correctAnswers / questions.length) * 100) + "%");
  resultCard.find("button").on("click", () => {
    resultCard.hide();
    const questionsCard = $(".questionsCard");
    questionsCard.show();
    questionsCard.find(".nextBtn").off().on("click", onNextBtnClick);
    questionsCard.find(".previousBtn").off().on("click", onPrevBtnClick);
    displayCurrentQuestion();
  });
}

// This displays the current question AND the choices
function displayCurrentQuestion() {
  currentQuestion =
    currentQuestion >= questions.length
      ? questions.length - 1
      : currentQuestion;

  var question = questions[currentQuestion].question;
  const picked = questions[currentQuestion].picked;
  var questionClass = $(document).find(".question > span");
  var choiceList = $(document).find(".choiceList");
  var numChoices = questions[currentQuestion].choices.length;

  // Set the questionClass text to the current question
  $(questionClass).text(question);
  const questionImages = $(".questionImages");
  questionImages.empty();
  const images = questions[currentQuestion].images || [];
  if (images.length) {
    for (let i = 0; i < images.length; i++) {
      $(
        `<img src="${images[i]}" class="rounded mx-auto d-block" alt="question attachment" />`
      ).appendTo(questionImages);
    }
  }

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
  if (picked != null || quizOver) {
    choiceList.find("input[type='radio']").attr("disabled", true);
  }

  $(".questionsCard .nextBtn").attr(
    "disabled",
    quizOver && currentQuestion === questions.length - 1
  );

  if (quizOver) {
    $(".resultBtnContainer").css("display", "flex");
  }
}

function startTimer() {
  let now = new Date();
  now.setMinutes(now.getMinutes() + duration);
  const endTime = now.getTime();

  const ticker = setInterval(() => {
    if (quizOver) {
      clearInterval(ticker);
    }
    now = Date.now();
    const distance = endTime - now;
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);
    const timer = $(".questionsCard .timer");
    timer.text(`${minutes}m ${seconds}s`);
    if (minutes === 0 && seconds < 50) {
      timer.removeClass("bg-dark").addClass("bg-danger");
      timer.animate(
        {
          opacity: 0.8,
        },
        {
          complete: function () {
            $(this).animate({
              opacity: 1,
            });
          },
        }
      );
    }
    if (distance < 0) {
      beatTimer = false;
      quizOver = true;
      clearInterval(ticker);
      displayResultCard();
    }
  }, 1000);
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
