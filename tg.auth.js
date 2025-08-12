const { TelegramClient } = require("telegram");
const { StringSession } = require("telegram/sessions");
const input = require("input");

const apiId = 787431;
const apiHash = "f6b80c57a460491366607993b8d706ff";
const stringSession = new StringSession(""); // fill this later with the value from session.save()

(async () => {
    const client = new TelegramClient(stringSession, apiId, apiHash, {
      connectionRetries: 5,
    });

    await client.start({
      phoneNumber: async () => await input.text("Введите ваш номер телефона:"),
      password: async () => await input.text("Введите ваш пароль (2FA):"),
      phoneCode: async () => await input.text("Введите код из Telegram:"),
      onError: (err) => console.log(err),
    });

    console.log("Вы успешно аутентифицировались!");
    console.log("Сохраненная сессия:", client.session.save());

    // Сохранение сессии в файл
    const fs = require("fs");
    fs.writeFileSync("tg.session.txt", client.session.save());

    process.exit(0);
  })();
