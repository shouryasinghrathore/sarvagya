import bot from './assets/bot.svg';
import user from './assets/user.svg';

const form = document.querySelector('form');
const chatContainer = document.querySelector('#chat_container');

let loadInterval;


function loader(element) {
  element.textContent = ''; //ensures its empty at the start

  loadInterval = setInterval(() => {
    element.textContent += '.';

    if (element.textContent === '....') { //we can also use .length > 3 here
      element.textContent = '';
    }
  }, 300);
}

//~~~ Writes letter by letter text response from the bot ~~~//
function typeText(element, text) {
  let index = 0;

  let interval = setInterval(() => {
    if (index < text.length) {
      element.innerHTML += text.charAt(index);
      index++;
    } else {
      clearInterval(interval); //otherwise stop the typing
    }
  }, 20)
}


function generateUniqueId() {
  const timestamp = Date.now();
  const randomNumber = Math.random();
  const hexadecimalString = randomNumber.toString(16);

  return `id-${timestamp}-${hexadecimalString}`;
}


function chatStripe(isAi, value, uniqueId) {
  return (
    `
      <div class="wrapper ${isAi && 'ai'}">
     
        <div class= "chat">
          <div class= "profile">
            <img 
              src=${isAi ? bot : user}
              alt="${isAi ? 'bot' : 'user'}"
            />          
          </div>
          <div class="message" id=${uniqueId}>
            ${value}
          </div>
        </div>
      </div>
    `
  )
}

//~~~ Trigger AI response ~~~//
const handleSubmit = async (e) => {
  e.preventDefault(); //prevent page from reloading

  //get data we typed in the form
  const data = new FormData(form);

  // users chat stripe
  // "false" because it's us not the bot
  chatContainer.innerHTML += chatStripe(false, data.get('prompt'));

  form.reset(); //clear the form

  // bot chat stripe
  const uniqueId = generateUniqueId();
  chatContainer.innerHTML += chatStripe(true, " ", uniqueId);

  // keep scrolling down
  chatContainer.scrollTop = chatContainer.scrollHeight;

  //fetch the newly created <div>
  const messageDiv = document.getElementById(uniqueId);

  //start the loading dots animation
  loader(messageDiv);


  const response = await fetch('https://chatbot-sbhu.onrender.com', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prompt: data.get('prompt')
    })
  })

  clearInterval(loadInterval); //stop the loading dots animation
  messageDiv.innerHTML = " "; //clear the message div. We are not sure at which point in the loading dots animation the response will come back. Could be at 1 dot, 2 dots, etc.

  if (response.ok) {
    const data = await response.json(); //get the response from the BE server
    const parsedData = data.bot.trim(); //remove any spaces at the start or end of the string

    console.log({ parsedData })

    typeText(messageDiv, parsedData); //start typing the response
  } else {
    const err = await response.text();

    messageDiv.innerHTML = "Something went wrong. Please try again."

    alert(err);
  }
}

// Call event listener
form.addEventListener('submit', handleSubmit);
// click enter key to submit. 'keyup' is when we press and release the enter key
form.addEventListener('keyup', (e) => {
  if (e.keyCode === 13) {
    handleSubmit(e);
  }
});