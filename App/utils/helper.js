// Credit: https://strapi.io/blog/how-to-create-a-chat-bot-assistant-using-next-js-tailwind-css-and-strapi?utm_source=dev.to&utm_medium=post&utm_campaign=blog

const baseUrl = process.env.NEXT_PUBLIC_CHATBOT_BASE_URL;

export const createMarkup = (text) => {
  return {__html: text};
}

// Display the first message sent by the bot to the user
export const tranformInterchanges = (interchanges, initial = false) => {
  let initialText = initial ? `<b>Welcome to Fokus, I'm Foxy and glad to have you here 🥰.</b> <br/>
 Tell me what you would like to know: <br/> <br/> `: ''
  
  interchanges?.data.map((e, i) => {
      initialText += `<b>${(i+1)}</b>. ${e.attributes.question} <br /> <br />`
  })
  return initialText
}

// Scan user's question to find proper response
export const searchInterchange = (interchanges, question) => {
  let result = interchanges.data.find(e => e.attributes.question.toLowerCase().includes(question.toLowerCase()))

  if (result) return result.attributes.answer
  
  return `Sorry I don't understand your question, please try again 😔.<br><br>
  Here are the options again: <br/> <br/>
  ${tranformInterchanges(interchanges)}
  `
}

// Show bot typing
export const showBotTyping = async (setInterchange, prevState, setAllow) => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  setInterchange([...prevState, {
    owner: false,
    text: '<b>Foxy</b> is typing.'
  }])
  await new Promise(resolve => setTimeout(resolve, 1000));
  setInterchange([...prevState, {
    owner: false,
    text: '<b>Foxy</b> is typing..'
  }])
  await new Promise(resolve => setTimeout(resolve, 1000));
  setInterchange([...prevState, {
    owner: false,
    text: '<b>Foxy</b> is typing...'
  }])
  await new Promise(resolve => setTimeout(resolve, 1000));
  setAllow(true)
}

// Send the user question to the bot and then update the chat with the bot response
export const getBotAnswer = async (interchanges, setInterchange, question, prevState, setAllow) => {
  await showBotTyping(setInterchange, prevState, setAllow)
  setInterchange([...prevState, {
    owner: false,
    text: searchInterchange(interchanges, question)
  }])
}

// Bring the current message sent by either the bot or the user into view
export const scrollDown = () => {
  document.getElementById('scrollTo').scrollIntoView({behavior: "smooth", block: 'nearest', inline: 'start'});
}

export const fetchQuery = async (path, params = null) => {
  let url
  if (params !== null) {
    url = `${baseUrl}/${path}/${params}`
  } else {
    url = `${baseUrl}/${path}`
  }
  const response = await fetch(`http://${url}`)
  const data = await response.json()
  return data
}