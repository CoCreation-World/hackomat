(function(s,n){typeof exports=="object"&&typeof module<"u"?module.exports=n():typeof define=="function"&&define.amd?define(n):(s=typeof globalThis<"u"?globalThis:s||self,s.MyBot=n())})(this,function(){"use strict";return{run:async n=>{await WA.onInit(),await WA.players.configureTracking({players:!0});let r,d=!1,h={};async function p(e,o){var u;const m="https://api-production-db6f.up.railway.app/v1/chat-messages",y="app-w0Ps4KAkUptJAYYY7DbleqQc",b={inputs:{},query:e,response_mode:"streaming",conversation_id:h[o]||"",user:o,files:[]};try{console.log(`Handling chat message for bot: ${r}, message: ${e}`),WA.chat.startTyping({scope:"bubble"});const a=await fetch(m,{method:"POST",headers:{Authorization:y,"Content-Type":"application/json"},body:JSON.stringify(b)});if(!a.ok)throw new Error(`Failed to handle chat message: ${a.statusText}`);const c=(u=a.body)==null?void 0:u.getReader(),w=new TextDecoder;let l="";for(;;){const{done:A,value:T}=await(c==null?void 0:c.read());if(A)break;const W=w.decode(T,{stream:!0}).split(`
`);for(const i of W)if(i.trim()){const k=i.startsWith("data: ")?i.slice(6):i;try{const t=JSON.parse(k);t.answer&&(l+=t.answer),t.conversation_id&&(h[o]=t.conversation_id)}catch(t){console.error("Error parsing chunk:",t)}}}console.log("Custom AI text response:",l.trim()),WA.chat.sendChatMessage(l.trim(),{scope:"bubble"}),WA.chat.stopTyping({scope:"bubble"}),console.log("Chat message handled successfully.")}catch(a){console.error("Failed to handle chat message:",a)}}async function g(){try{console.log("Initializing bot with metadata:",n),r=WA.room.hashParameters.model||"kos",console.log(r+" is ready!"),console.log("Bot initialized successfully.")}catch(e){console.error("Failed to initialize bot:",e)}}async function f(e){try{console.log(`User ${e.name} with UUID ${e.uuid} joined the proximity meeting.`),console.log("Participant join handled successfully.")}catch(o){console.error("Failed to handle participant join:",o)}}try{await g(),WA.player.proximityMeeting.onJoin().subscribe(async e=>{await f(e)}),d||(WA.chat.onChatMessage(async(e,o)=>{if(!o.author){console.log("Received message with no author, ignoring.");return}console.log(`Received message from ${o.author.name}: ${e}`),await p(e,o.author.uuid)},{scope:"bubble"}),d=!0),console.log("Bot initialized!")}catch(e){console.error("Failed to run bot:",e)}}}});
