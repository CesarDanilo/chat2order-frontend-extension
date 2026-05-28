function getConversationText() {
  const messages = document.querySelectorAll("[data-pre-plain-text]");

  const text = Array.from(messages).map((msg) => msg.textContent);

  return text;
}

chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  if (request.type === "IMPORT_CONVERSATION") {
    const conversation = getConversationText();
    sendResponse({ conversation });
  }
});
