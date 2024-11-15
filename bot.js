const P = {
  run: async (d) => {
    await WA.onInit(), await WA.players.configureTracking({ players: !0 });
    let n, c = !1, l = {};
    async function u(e, o) {
      var h;
      const y = "https://api-production-db6f.up.railway.app/v1/chat-messages", m = "app-w0Ps4KAkUptJAYYY7DbleqQc", f = {
        inputs: {},
        query: e,
        response_mode: "streaming",
        conversation_id: l[o] || "",
        // Use existing conversation_id or blank
        user: o,
        files: []
      };
      try {
        console.log(`Handling chat message for bot: ${n}, message: ${e}`), WA.chat.startTyping({ scope: "bubble" });
        const a = await fetch(y, {
          method: "POST",
          headers: {
            Authorization: m,
            "Content-Type": "application/json"
          },
          body: JSON.stringify(f)
        });
        if (!a.ok)
          throw new Error(`Failed to handle chat message: ${a.statusText}`);
        const i = (h = a.body) == null ? void 0 : h.getReader(), b = new TextDecoder();
        let r = "";
        for (; ; ) {
          const { done: w, value: A } = await (i == null ? void 0 : i.read());
          if (w) break;
          const W = b.decode(A, { stream: !0 }).split(`
`);
          for (const s of W)
            if (s.trim()) {
              const k = s.startsWith("data: ") ? s.slice(6) : s;
              try {
                const t = JSON.parse(k);
                t.answer && (r += t.answer), t.conversation_id && (l[o] = t.conversation_id);
              } catch (t) {
                console.error("Error parsing chunk:", t);
              }
            }
        }
        console.log("Custom AI text response:", r.trim()), WA.chat.sendChatMessage(r.trim(), { scope: "bubble" }), WA.chat.stopTyping({ scope: "bubble" }), console.log("Chat message handled successfully.");
      } catch (a) {
        console.error("Failed to handle chat message:", a);
      }
    }
    async function g() {
      try {
        console.log("Initializing bot with metadata:", d), n = WA.room.hashParameters.model || "kos", console.log(n + " is ready!"), console.log("Bot initialized successfully.");
      } catch (e) {
        console.error("Failed to initialize bot:", e);
      }
    }
    async function p(e) {
      try {
        console.log(`User ${e.name} with UUID ${e.uuid} joined the proximity meeting.`), console.log("Participant join handled successfully.");
      } catch (o) {
        console.error("Failed to handle participant join:", o);
      }
    }
    try {
      await g(), WA.player.proximityMeeting.onJoin().subscribe(async (e) => {
        await p(e);
      }), c || (WA.chat.onChatMessage(
        async (e, o) => {
          if (!o.author) {
            console.log("Received message with no author, ignoring.");
            return;
          }
          console.log(`Received message from ${o.author.name}: ${e}`), await u(e, o.author.uuid);
        },
        { scope: "bubble" }
      ), c = !0), console.log("Bot initialized!");
    } catch (e) {
      console.error("Failed to run bot:", e);
    }
  }
};
export {
  P as default
};
