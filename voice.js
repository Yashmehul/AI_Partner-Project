// Function to convert text to speech
function textToSpeech(textBlock) {
    // Check if the browser supports speech synthesis
    if ('speechSynthesis' in window) {
        // Create a new SpeechSynthesisUtterance object with the text block
        var utterance = new SpeechSynthesisUtterance(textBlock);

        // Optionally, you can customize the speech synthesis settings here
        // For example:
        // utterance.lang = 'en-US'; // Set the language
        // utterance.rate = 1.0; // Set the speaking rate
        // utterance.volume = 1.0; // Set the volume

        // Use the speech synthesis API to speak the text block
        window.speechSynthesis.speak(utterance);
    } else {
        // Speech synthesis not supported, handle error or provide fallback
        console.error('Speech synthesis not supported');
    }
}

// Example usage with a text block
var textBlock = `
    This is a sample text block that will be converted to speech.
    You can include multiple paragraphs, line breaks, and special characters.
    Just pass the entire text block to the textToSpeech function.
`;

textToSpeech(textBlock);