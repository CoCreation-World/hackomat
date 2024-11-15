const S = {
  run: async (b) => {
    await WA.onInit(), await WA.players.configureTracking({ players: !0 });
    let p, y = !1, f = {};
    console.log(`Initializing bot with key${WA.room.hashParameters.key}`);
    async function w(e, o) {
      var g;
      const t = "https://api-production-db6f.up.railway.app/v1/chat-messages", m = `Bearer ${WA.room.hashParameters.key}`, u = {
        inputs: {},
        query: e,
        response_mode: "streaming",
        conversation_id: f[o] || "",
        // Use existing conversation_id or blank
        user: o,
        files: []
      };
      try {
        console.log(`Handling chat message for bot: ${p}, message: ${e}`), WA.chat.startTyping({ scope: "bubble" });
        const s = await fetch(t, {
          method: "POST",
          headers: {
            Authorization: m,
            "Content-Type": "application/json"
          },
          body: JSON.stringify(u)
        });
        if (!s.ok)
          throw new Error(`Failed to handle chat message: ${s.statusText}`);
        const r = (g = s.body) == null ? void 0 : g.getReader(), a = new TextDecoder();
        let i = "";
        for (; ; ) {
          const { done: c, value: h } = await (r == null ? void 0 : r.read());
          if (c) break;
          const G = a.decode(h, { stream: !0 }).split(`
`);
          for (const d of G)
            if (d.trim()) {
              const k = d.startsWith("data: ") ? d.slice(6) : d;
              try {
                const l = JSON.parse(k);
                l.answer && (i += l.answer), l.conversation_id && (f[o] = l.conversation_id);
              } catch (l) {
                console.error("Error parsing chunk:", l);
              }
            }
        }
        console.log("Custom AI text response:", i.trim()), WA.chat.sendChatMessage(i.trim(), { scope: "bubble" }), WA.chat.stopTyping({ scope: "bubble" }), console.log("Chat message handled successfully.");
      } catch (s) {
        console.error("Failed to handle chat message:", s);
      }
    }
    async function A() {
      try {
        console.log("Initializing bot with metadata:", b), p = WA.room.hashParameters.model || "kos", console.log(p + " is ready!"), console.log("Bot initialized successfully.");
      } catch (e) {
        console.error("Failed to initialize bot:", e);
      }
    }
    async function W(e) {
      try {
        console.log(`User ${e.name} with UUID ${e.uuid} joined the proximity meeting.`), console.log("Participant join handled successfully.");
      } catch (o) {
        console.error("Failed to handle participant join:", o);
      }
    }
    try {
      await A(), WA.player.proximityMeeting.onJoin().subscribe(async (e) => {
        await W(e);
      }), y || (WA.chat.onChatMessage(
        async (e, o) => {
          if (!o.author) {
            console.log("Received message with no author, ignoring.");
            return;
          }
          console.log(`Received message from ${o.author.name}: ${e}`), await w(e, o.author.uuid);
        },
        { scope: "bubble" }
      ), y = !0), console.log("Bot initialized!");
    } catch (e) {
      console.error("Failed to run bot:", e);
    }
    WA.onInit().then(() => {
      console.log("Initializing grouping..."), WA.state.onVariableChange("grouping").subscribe(() => {
        U();
      });
    }).catch((e) => console.error("Error during WA.onInit:", e));
    async function U() {
      try {
        const e = Number(WA.state.grouping);
        console.log("Current grouping state:", e), await C(e);
      } catch (e) {
        console.error("Error in updateGrouping:", e);
      }
    }
    async function C(e) {
      e === 1 ? (WA.event.broadcast("ping", "start"), console.log("ping start"), await I()) : e === 0 ? (WA.event.broadcast("ping", "stop"), n = [], console.log("Cleared UUIDs array"), ["Purple", "Blue", "Red", "Green", "Yellow", "Orange"].forEach((t) => {
        WA.state[t] = [], console.log(`Cleared group ${t}`);
      })) : console.warn("Unknown grouping state:", e);
    }
    let n = [];
    async function I() {
      n = [];
      const e = WA.event.on("pong").subscribe((o) => {
        const t = o.data;
        n.includes(t) || n.push(t);
      });
      try {
        await new Promise((o) => {
          setTimeout(() => {
            o();
          }, 3e3);
        });
      } finally {
        e.unsubscribe(), P();
      }
    }
    async function P() {
      const e = ["Purple", "Blue", "Red", "Green", "Yellow", "Orange"], o = {
        Purple: [],
        Blue: [],
        Red: [],
        Green: [],
        Yellow: [],
        Orange: []
      }, t = WA.player.uuid;
      console.log("My UUID:", t), n = n.filter((a) => a !== t), n.sort(() => Math.random() - 0.5);
      const u = Math.min(e.length, Math.floor(n.length / 2)), g = Math.floor(n.length / u), s = n.length % u;
      let r = 0;
      e.slice(0, u).forEach((a, i) => {
        const c = i < s ? 1 : 0, h = g + c;
        o[a] = n.slice(r, r + h), r += h;
      }), console.log("Formed groups:", o), Object.keys(o).forEach((a) => {
        o[a].forEach((c) => {
          console.log(`UUID ${c} is in group ${a}`), WA.event.broadcast(c, a);
        });
      }), $();
    }
    function $() {
      ["Blue", "Green", "Orange", "Red", "Yellow", "Purple"].forEach((o) => {
        const t = Math.floor(1e3 + Math.random() * 9e3).toString();
        WA.state[`code${o}`] = t, console.log(`Generated code for ${o}: ${t}`);
      });
    }
  }
};
export {
  S as default
};
