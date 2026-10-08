/*
code: game eye anime
by: 𝑨𝒉𝒎𝒆𝒅 𝑨𝒃𝒅𝒆𝒍𝒃𝒂𝒔𝒆𝒕
*/

const MAX_ROUNDS = 10;

const NAMES = [
  "ايرين","نيزوكو","سوكونا","موازن","كيلوا","غون","ايتاتشي","ساسكي","دابي","اوبيتو",
  "نوبارا","ليفاي","يوتا","فريدا","شيده","ياماتو","نامي","ايمو","انيا","جينبي",
  "بوروتو","شانكس","لاو","لوفي","زورو","اكازا","ميكاسا","رين","دوما","كانيكي",
  "غوجو","ساي","نيجي","انمي","ساكورا","اوريتشمارو","ماهيتو","جيرايا","روبين",
  "سانجي","ميهوك","كايدو","مايكي","كورابيكا","شيغاراكي","تينغن","تانجيرو",
  "ميدوريا","كونان","الكيورا","شوتو","غاتارو","بارو","غارا","باكوغو","ماكيما",
  "توجا","باين","كوراما"
];

const EYE_IMAGE = "https://i.ibb.co/jkK3Fyzp/image-1791397256316.jpg"; // صورة افتراضية أو يمكن جلبها من الـ API
const FOOTER = "> *𝙱𝚈┇𝑨𝒉𝒎𝒆𝒅 𝑨𝒃𝒅𝒆𝒍𝒃𝒂𝒔𝒆𝒕*";

const deco = (title, content) => `*❐═━━━═╊⊰🍷⊱╉═━━━═❐*
 ┇↫ \`${title}\`
${content}
> °•╾━═━═━═━╼╾━═━═━═━╼•°
${FOOTER}`;

const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);

const getPrize = (rank) => {
  if (rank === 0) return { xp: 500, cookies: 10, emoji: "🥇" };
  if (rank === 1) return { xp: 300, cookies: 5, emoji: "🥈" };
  return { xp: 100, cookies: 2, emoji: "🥉" };
};

const handler = async (m, { conn, command }) => {
  const chatId = m.chat;
  if (!global.gameEye) global.gameEye = {};

  // أمر إلغاء اللعبة
  if (command === 'الغاء_عين' || command === 'إلغاء_عين') {
    const g = global.gameEye[chatId];
    if (!g?.current && (!g || g.round === 0)) {
      await m.react("⚠️");
      return m.reply(deco("عـــيـــن الـــأنـــمـــي", "> ❌ لا توجد لعبة عين قائمة لإلغائها."));
    }
    if (g?.current?.timer) {
      clearTimeout(g.current.timer);
    }
    delete global.gameEye[chatId];
    await m.react("🛑");
    return conn.sendMessage(chatId, {
      text: deco("عـــيـــن الـــأنـــمـــي", "> 🛑 تم إلغاء لعبة عين الأنمي بنجاح.")
    }, { quoted: m });
  }

  const g = global.gameEye[chatId];
  if (g?.current) {
    return; // لو في جولة شغالة بالفعل
  }

  if (!g || g.round >= MAX_ROUNDS) {
    if (g && Object.keys(g.scores).length > 0) {
      const sorted = Object.entries(g.scores).sort((a,b) => b[1] - a[1]);
      const ranking = sorted.map(([id, score], i) => {
        const prize = getPrize(i);
        if (global.db?.users[id]) {
          global.db.users[id].xp = (global.db.users[id].xp || 0) + prize.xp;
          global.db.users[id].cookies = (global.db.users[id].cookies || 0) + prize.cookies;
        }
        return `${prize.emoji} @${id.split('@')[0]} ┇ *${score}* نقاط`;
      }).join('\n');

      const winner = sorted[0][0];

      await conn.sendMessage(chatId, {
        text: deco("نــهــايــة تــحــدي الــعــيــون", `> 🏆 الفائز: @${winner.split("@")[0]}\n\n${ranking}\n\n> 🎁 *جواز وپوكات تفاعلية*`),
        mentions: sorted.map(s => s[0])
      }, { quoted: m });
    }
    global.gameEye[chatId] = { round: 0, scores: {}, current: null };
  }

  const g2 = global.gameEye[chatId];
  g2.round++;
  
  try {
    const data = await fetch("https://raw.githubusercontent.com/fjfilhfjjg-boop/Pomni-AI/refs/heads/main/%D8%B9%D9%8A%D9%86.md").then(r => r.json());
    const char = data[Math.floor(Math.random() * data.length)];
    
    const wrong = shuffle([...NAMES]).filter(n => n.toLowerCase() !== char.name.toLowerCase()).slice(0, 3);
    const opts = shuffle([char.name, ...wrong]);
    
    const buttons = opts.map((opt, i) => ({
      name: "quick_reply",
      params: {
        display_text: `〔 ${i + 1} 〕 ${opt}`.substring(0, 20),
        id: `eye_${opt}`
      }
    }));

    buttons.push({
      name: "quick_reply",
      params: {
        display_text: "🛑 إلغاء",
        id: "eye_cancel_game"
      }
    });

    const caption = `> 🎮 الجولة: \`${g2.round}/${MAX_ROUNDS}\`\n\n> 👁️ خمن صاحب العين من الشخصيات بالأسفل:\n\n*⏳ 30 ثانية للإجابة*`;

    const imgUrl = char.img || EYE_IMAGE;

    const msg = await conn.sendButton(chatId, {
      imageUrl: imgUrl,
      bodyText: deco("عـــيـــن الـــأنـــمـــي", caption),
      footerText: FOOTER,
      buttons: buttons,
      mentions: [m.sender],
      interactiveConfig: {
        buttons_limits: 1
      },
      options: {
        linkPreview: false
      }
    }, m);
    
    g2.current = {
      answer: char.name.trim().toLowerCase(),
      displayAnswer: char.name,
      img: imgUrl,
      caption,
      buttons,
      id: msg?.key?.id,
      timer: setTimeout(async () => {
        if (global.gameEye[chatId]?.current) {
          const ans = global.gameEye[chatId].current.displayAnswer;
          global.gameEye[chatId].current = null;
          
          await conn.sendMessage(chatId, {
            text: deco("عـــيـــن الـــأنـــمـــي", `> ⏰ انتهى الوقت! الإجابة الصحيحة:\n> *${ans}*`)
          });
          
          if (g2.round >= MAX_ROUNDS) {
            handler(m, { conn, command: 'عين' });
          } else {
            setTimeout(() => handler(m, { conn, command: 'عين' }), 1500);
          }
        }
      }, 30000)
    };
  } catch (e) {
    console.error(e);
    m.reply(deco("عـــيـــن الـــأنـــمـــي", "> ❌ حدث خطأ أثناء جلب البيانات."));
  }
};

handler.before = async (m, { conn }) => {
  const g = global.gameEye?.[m.chat];
  if (!g?.current) return;
  
  const cur = g.current;

  let buttonId = m.selectedButtonId || m.selectedId || m.buttonId || "";

  if (!buttonId && m.message) {
    const msg = m.message;
    buttonId = msg?.buttonsResponseMessage?.selectedButtonId ||
               msg?.templateButtonReplyMessage?.selectedId ||
               msg?.interactiveResponseMessage?.nativeFlowResponseMessage?.paramsJson || "";
  }

  if (buttonId && !buttonId.includes("eye_") && !buttonId.includes("eye_cancel_game")) {
    try {
      const parsed = JSON.parse(buttonId);
      buttonId = parsed?.id || parsed?.button_id || parsed?.selectedId || "";
    } catch {}
  }

  if (buttonId === "eye_cancel_game" || buttonId === "eye_cancel") {
    clearTimeout(cur.timer);
    delete global.gameEye[m.chat];

    await m.react("🛑");
    return conn.sendMessage(m.chat, {
      text: deco("عـــيـــن الـــأنـــمـــي", "> 🛑 تم إلغاء لعبة عين الأنمي.")
    }, { quoted: m });
  }

  let userSelection = "";
  if (buttonId && buttonId.startsWith('eye_')) {
    userSelection = buttonId.replace('eye_', '').trim().toLowerCase();
  } else if (m.text) {
    userSelection = m.text.trim().toLowerCase();
  } else {
    return;
  }

  if (userSelection !== cur.answer) {
    await m.react("❌");
    return;
  }

  clearTimeout(cur.timer);
  g.current = null;
  
  g.scores[m.sender] = (g.scores[m.sender] || 0) + 1;

  if (global.db?.users?.[m.sender]) {
    global.db.users[m.sender].xp = (global.db.users[m.sender].xp || 0) + 100;
    global.db.users[m.sender].cookies = (global.db.users[m.sender].cookies || 0) + 2;
  }

  await m.react("🍷");

  await conn.sendMessage(m.chat, {
    text: deco("عـــيـــن الـــأنـــمـــي", `> 🎯 إجابة صحيحة بواسطة: @${m.sender.split('@')[0]}\n> 📜 الإجابة: *${cur.displayAnswer}*\n\n> ⭐ +1 نقطة 🎁 +100 XP`),
    mentions: [m.sender]
  }, { quoted: m });

  if (g.round >= MAX_ROUNDS) {
    handler(m, { conn, command: 'عين' });
  } else {
    setTimeout(() => handler(m, { conn, command: 'عين' }), 1500);
  }
  
  return true;
};

handler.help = ['عين', 'الغاء_عين'];
handler.tags = ['games'];
handler.command = ['عين', 'eye', 'الغاء_عين', 'إلغاء_عين'];
handler.usage = ['عين'];
handler.category = 'general';
handler.usePrefix = true;

export default handler;