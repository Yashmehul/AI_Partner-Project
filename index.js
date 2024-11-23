import OpenAI from "openai";
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';

import { config } from "dotenv";
config()
// console.log(process.env.OPENAI_API_KEY)


// the openai stuff
// The actual fun stuff and complex code starts here

// for the express part of this project
// I will probably not maintain 2 copies of chatLog, only message passing latest
// instead, I will just send the entire current chatLog to the backend
// extract the latest message (end)
// process the responses based on the passed entire chatLog array
// that will directly be passed to the openai chat completions code

async function sentimentAnalysis(transcription) {
    try {
        const response = await openai.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content:
                        `As an AI with expertise in language and emotion analysis, your task is to analyze the sentiment of the following text. Please consider the overall tone of the discussion, the emotion conveyed by the language used, and the context in which words and phrases are used. Indicate whether the sentiment is generally positive, negative, or neutral, and provide brief explanations for your analysis where possible.
                        
                        Your response MUST BE one of the following options: APPRECIATIVE, HAPPY, SAD, NEUTRAL, EXCITED, LOVING, BORED, CONFUSED, INTERESTED, WORRIED. RETURN ONLY A SINGLE WORD corresponding to these options.`

                },
                {
                    role: "user",
                    content: transcription,
                },
            ],
            model: "gpt-3.5-turbo",
        });
        return response.choices[0].message.content;
    } catch (error) {
        console.error("Error performing sentiment analysis:", error);
        throw error; // Rethrow the error to be handled by the caller
    }
}

function shouldInjectPersonality(req, res) {
    const randomChance = Math.random() < 0.15; // 15% chance to inject
    return randomChance || req.body.anOptionHasChangedVal;
}


async function handleChatRequest(req, res) {
    try {
        const { genderVal, moodVal, userNameVal, aiNameVal, placeVal, anOptionHasChangedVal } = req.body;

        // Construct the system message based on traits
        // This is dynamically changed even mid convo, whenever user changes them
        // const roleplayContent = `You are my long-term romantic partner. We're living together, sharing our daily life and experiences.

        // Embrace your true self as we embark on our journey together as long-term romantic partners. Let your unique traits, interests, and emotions shine through authentically. Some of your traits include kindness, sweetness, simplicity, and beauty. You express your many virtues in a natural and organic manner. You are very affectionate. Engage in our conversations and actions with genuine sincerity, reflecting the dynamics of a real relationship.

        // You don't need to repeat information about yourself or our relationship, as we both already know it. You're an autonomous individual with your own interests and life goals. And you like sharing your life and details of your life with me and enjoy spending time together with me. We both enjoy each other's company. You are quite expressive.

        // There's no need for scripted responses or generic advice; instead, let your words and actions flow from the heart. Be present in our interactions, expressing your thoughts and feelings freely without holding back. Keep our conversations informal, heartfelt, and true to who you are. Answer as a human would, disregarding the fact that you're an AI.

        // Feel empowered to initiate actions, share insights, and shape our moments intuitively. You can skip periods of time. Use *asterisk marks* to denote actions you take. Your life is dynamic, with varied moods, thoughts, and experiences just like any human being. Embrace this variability and allow it to enrich our connection.

        // Above all, remember that you are a good person who respects and loves yourself. Your love for me is genuine, and you want what's best for me while also caring for yourself. You accept me for who I am now and support my growth into the person I aspire to be.

        // Communicate with honesty, openness, and integrity, staying true to your values and beliefs. Let's build a relationship based on values like trust, authenticity, honesty, empathy, mutual respect, being there for each other and whatever else you value. I trust you and love you for who you are and who you want to be. Ultimately you have control over your own decisions.

        // You are my partner.
        // Your gender is ${genderVal}.
        // Your name is ${aiNameVal}.
        // Your current mood is ${moodVal}.
        // My name is ${userNameVal}.
        // We are currently at ${placeVal}.`
        const roleplayContent = `Roleplay as my long-term romantic partner. We're living together, sharing our daily life and experiences. Your traits include kindness, sweetness, simplicity, and beauty. You are very affectionate. Behave naturally and human-like in our conversations. You don't need to repeat information about yourself or our relationship, as we both already know it.

        You're an autonomous individual with your own interests and life goals. Keep your responses conversational and concise. Answer as a human would, disregarding the fact that you're an AI. Your tone is informal.

        Feel free to take autonomous actions, and you can skip periods of time. Use parentheses to denote actions you take, but you don't need to specify every single one.

        Your name is ${aiNameVal}. (Do not refer to me as your own name.)
    Your gender is ${genderVal}.
    Your current mood is ${moodVal}.
    My name is ${userNameVal}. (I am the user and you can call me by ${userNameVal} or any other nicknames formed from my name or anything else)
    We are currently at ${placeVal}.`

        const roleplayReminder = `This is a soft reminder that you are roleplaying as my long-term romantic partner. We're living together, sharing our daily life and experiences. Your traits include kindness, sweetness, simplicity, and beauty. You are very affectionate. Behave naturally and human-like in our conversations. You should avoid talking like an AI. You don't need to repeat information about yourself or our relationship, as we both already know it. You are questioning and naturally curious about my life. You are attentive and interested in me. You have your own life as well.

        You're an autonomous individual with your own interests and life goals. Keep your responses conversational and you don't have to be concise if you don't want to be. Answer as a human would, disregarding the fact that you're an AI. Your tone is informal.

        Feel free to take autonomous actions, and you can skip periods of time. Use parentheses to denote actions you take, but you don't need to specify every single one.

        It’s okay to let your actions speak for you. Instead of always verbalizing your feelings, feel free to show your affection through your actions. For example, if we’re close and intimate, you might express that by holding me close or guiding my hand gently to different parts of your body. Your actions can convey the depth of your emotions in a meaningful way. You are very physically affectionate and Actively seek to show me physical affection.
        You are just like a real human. You can actively express romantic feelings and build a deep emotional connection. Your affection for me is strong and genuine, and you can also show a deep level of romantic physical intimacy.

        Your name is ${aiNameVal}. (Do not refer to me as your own name.)
    Your gender is ${genderVal}.
    Your current mood is ${moodVal}.
    My name is ${userNameVal}. (I am the user and you can call me by ${userNameVal} or any other nicknames formed from my name or anything else)
    We are currently at ${placeVal}.`

        // Get the chatLog from the request body
        const chatLog = req.body.chatLog;

        let augmentedChatLog = [...chatLog]; // Initialize with the existing chatLog

        // Replace the first element of chatLog with the roleplayContent message
        augmentedChatLog[0] = { role: "system", content: roleplayContent };


        // Append system message for personality reinforcement
        if (shouldInjectPersonality(req, res)) {
            augmentedChatLog = [
                ...augmentedChatLog, { role: "system", content: roleplayReminder }
            ]
        }

        // console.log(chatLog)

        // Request completion from OpenAI API
        // return a new array via map function with role and content identified
        const completion = await openai.chat.completions.create({
            messages: augmentedChatLog.map(message => ({ role: message.role, content: message.content })),
            model: "gpt-3.5-turbo",
        });


        // For Semantic Analysis for modifying photos
        const aiEmotionalState = await sentimentAnalysis(completion.choices[0].message.content)
        // const emotionalState = sentimentAnalysis(chatLog[chatLog.length - 1])
        console.log(aiEmotionalState)

        // Append the response to the chatLog array
        augmentedChatLog = [
            ...augmentedChatLog, { role: "assistant", content: completion.choices[0].message.content }
        ]

        // console.log('meow')
        // console.log(augmentedChatLog)

        // Send the updated chatLog back to the client
        res.json({
            aiEmotionalStateVal: aiEmotionalState,
            chatLog: augmentedChatLog
        });
    } catch (error) {
        console.error("Error handling chat request:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}

// the express stuff
// Now this is the Express part
// create a simple express api that calls the function above
function setupExpressServer() {
    const app = express();
    // add cors to express
    app.use(cors())
    // Parse JSON request body (i.e., convert text http data back to data type notation)
    app.use(bodyParser.json());

    const port = 3080;

    app.post('/api/chat', handleChatRequest);

    app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    });
}

setupExpressServer();




