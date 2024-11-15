/// <reference types="@workadventure/iframe-api-typings" />

export default {
    run: async (metadata: any) => {
        await WA.onInit();
        await WA.players.configureTracking({ players: true });

        let botName: string;
        let isChatHandlerRegistered = false;

        // Map to store conversation_id per user
        let userConversations: { [key: string]: string } = {};

        async function handleChatMessage(message: string, userUuid: string) {
            const url = 'https://api-production-db6f.up.railway.app/v1/chat-messages';
            const apiKey = 'app-w0Ps4KAkUptJAYYY7DbleqQc'; // Replace with your actual API key

            const requestData = {
                inputs: {},
                query: message,
                response_mode: "streaming",
                conversation_id: userConversations[userUuid] || "", // Use existing conversation_id or blank
                user: userUuid,
                files: []
            };

            try {
                console.log(`Handling chat message for bot: ${botName}, message: ${message}`);
                WA.chat.startTyping({ scope: "bubble" });

                const response = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'Authorization': apiKey,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(requestData)
                });

                if (!response.ok) {
                    throw new Error(`Failed to handle chat message: ${response.statusText}`);
                }

                const reader = response.body?.getReader();
                const decoder = new TextDecoder();
                let fullMessage = "";

                while (true) {
                    const { done, value } = await reader?.read()!;
                    if (done) break;
                    const chunk = decoder.decode(value, { stream: true });

                    const lines = chunk.split('\n');
                    for (const line of lines) {
                        if (line.trim()) {
                            const jsonString = line.startsWith("data: ") ? line.slice(6) : line;
                            try {
                                const data = JSON.parse(jsonString);
                                if (data.answer) {
                                    fullMessage += data.answer;
                                }
                                // Store conversation_id and message_id
                                if (data.conversation_id) {
                                    userConversations[userUuid] = data.conversation_id;
                                }
                            } catch (error) {
                                console.error("Error parsing chunk:", error);
                            }
                        }
                    }
                }

                console.log("Custom AI text response:", fullMessage.trim());

                WA.chat.sendChatMessage(fullMessage.trim(), { scope: "bubble" });
                WA.chat.stopTyping({ scope: "bubble" });
                console.log("Chat message handled successfully.");
            } catch (e) {
                console.error("Failed to handle chat message:", e);
            }
        }

        async function initializeBot() {
            try {
                console.log("Initializing bot with metadata:", metadata);
                const hashParameters = WA.room.hashParameters;
                botName = hashParameters.model || 'kos';
                console.log(botName + " is ready!");
                console.log("Bot initialized successfully.");
            } catch (e) {
                console.error("Failed to initialize bot:", e);
            }
        }

        async function onParticipantJoin(user: any) {
            try {
                console.log(`User ${user.name} with UUID ${user.uuid} joined the proximity meeting.`);
                console.log("Participant join handled successfully.");
            } catch (e) {
                console.error("Failed to handle participant join:", e);
            }
        }

        try {
            await initializeBot();

            WA.player.proximityMeeting.onJoin().subscribe(async (user) => {
                await onParticipantJoin(user);
            });

            if (!isChatHandlerRegistered) {
                WA.chat.onChatMessage(
                    async (message, event) => {
                        if (!event.author) {
                            console.log("Received message with no author, ignoring.");
                            return;
                        }
                        console.log(`Received message from ${event.author.name}: ${message}`);
                        await handleChatMessage(message, event.author.uuid);
                    },
                    { scope: "bubble" }
                );
                isChatHandlerRegistered = true;
            }

            console.log("Bot initialized!");
        } catch (e) {
            console.error("Failed to run bot:", e);
        }
    }
};

