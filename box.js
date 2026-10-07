import axios from "axios";
import FormData from "form-data";
import fs from "fs";
import path from "path";
import os from "os";

const handler = async (m, { conn }) => {
  try {
    const quoted = m.quoted;

    if (!quoted) {
      return m.reply(
`*╼֪ׄ╾╼ׁ֪╾ִ╼⌬⛩️⌬ ╼֪ׄ╾╼ׁ֪╾ִ╼֪╾*

*❍━━━══━━❪🍷❫━━══━━━❍*

╭⌁ 📂┊رد على صـورة أو فـيـديـو أو صـوت أو مـلـف
╰⌁ ⚡┊ثم اكتب: \`بوكس\`

> *⦂'𝔠𝔯𝔢𝔞𝔱𝔢\` ⥃ ╵𝑨𝒉𝒎𝒆𝒅 𝑨𝒃𝒅𝒆𝒍𝒃𝒂𝒔𝒆𝒕╷*`
      );
    }

    try {
      await conn.sendMessage(m.chat, {
        react: { text: "📤", key: m.key }
      });
    } catch {}

    await m.reply(
`⎔⋅•━╌ ━╃ ⌬『🍷』⌬ ╄━╌━•⋅⎔
*⏳ جـاري رفـع الـمـلـف...*
╰⌁ 📦┊انـتـظـر قـلـيـلًا

> *⦂'𝔠𝔯𝔢𝔞𝔱𝔢\` ⥃ ╵𝑨𝒉𝒎𝒆𝒅 𝑨𝒃𝒅𝒆𝒍𝒃𝒂𝒔𝒆𝒕╷*`
    );

    const buffer = await quoted.download();

    if (!buffer) throw new Error("فشل تحميل الملف.");

    const ext =
      quoted.mtype === "imageMessage" ? ".jpg" :
      quoted.mtype === "videoMessage" ? ".mp4" :
      quoted.mtype === "audioMessage" ? ".mp3" :
      quoted.mtype === "stickerMessage" ? ".webp" :
      ".bin";

    const filePath = path.join(
      os.tmpdir(),
      `catbox_${Date.now()}${ext}`
    );

    fs.writeFileSync(filePath, buffer);

    const form = new FormData();
    form.append("reqtype", "fileupload");
    form.append("fileToUpload", fs.createReadStream(filePath));

    const response = await axios.post(
      "https://catbox.moe/user/api.php",
      form,
      {
        headers: form.getHeaders(),
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
        timeout: 120000
      }
    );

    try {
      fs.unlinkSync(filePath);
    } catch {}

    const url = String(response.data || "").trim();

    if (!url.startsWith("http")) {
      try {
        await conn.sendMessage(m.chat, {
          react: { text: "❌", key: m.key }
        });
      } catch {}

      return m.reply(
`*❍━━━══━━❪❌❫━━══━━━❍*

*فـشـل رفـع الـمـلـف* 📛
╰⌁ ${url || "استجابة غير معروفة"}

> *⦂'𝔠𝔯𝔢𝔞𝔱𝔢\` ⥃ ╵𝑨𝒉𝒎𝒆𝒅 𝑨𝒃𝒅𝒆𝒍𝒃𝒂𝒔𝒆𝒕╷*`
      );
    }

    try {
      await conn.sendMessage(m.chat, {
        react: { text: "✅", key: m.key }
      });
    } catch {}

    return m.reply(
`*╼֪ׄ╾╼ׁ֪╾ִ╼⌬⛩️⌬ ╼֪ׄ╾╼ׁ֪╾ִ╼֪╾*

*❍━━━══━━❪🍷❫━━══━━━❍*

╭⌁ ✅┊تـم الـرفـع بـنـجـاح
╰⌁ 🔗┊${url}

> *⦂'𝔠𝔯𝔢𝔞𝔱𝔢\` ⥃ ╵𝑨𝒉𝒎𝒆𝒅 𝑨𝒃𝒅𝒆𝒍𝒃𝒂𝒔𝒆𝒕╷*`
    );

  } catch (error) {
    console.error("Catbox Upload Error:", error);

    try {
      await conn.sendMessage(m.chat, {
        react: { text: "❌", key: m.key }
      });
    } catch {}

    return m.reply(
`⎔⋅•━╌ ━╃ ⌬『🍷』⌬ ╄━╌━•⋅⎔
*❌ حـدث خـطـأ أثـنـاء الـرفـع*
╰⌁ 📛┊${error?.message || "خـطـأ غـيـر مـعـروف"}

> *⦂'𝔠𝔯𝔢𝔞𝔱𝔢\` ⥃ ╵𝑨𝒉𝒎𝒆𝒅 𝑨𝒃𝒅𝒆𝒍𝒃𝒂𝒔𝒆𝒕╷*`
    );
  }
};

handler.usage = ["بوكس"];
handler.command = ["بوكس"];
handler.category = "tools";

handler.usePrefix = true;
export default handler;