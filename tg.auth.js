const { TelegramClient } = require('telegram');
const { StringSession } = require('telegram/sessions');
const input = require('input');

const apiId = 25017832;
const apiHash = '1f530897bf18923b1e86b6457b313933';
const stringSession = new StringSession(''); // fill this later with the value from session.save()

(async () => {
  const client = new TelegramClient(stringSession, apiId, apiHash, {
    connectionRetries: 5,
  });

  await client.start({
    phoneNumber: async () => await input.text('Введите ваш номер телефона:'),
    password: async () => await input.text('Введите ваш пароль (2FA):'),
    phoneCode: async () => await input.text('Введите код из Telegram:'),
    onError: (err) => console.log(err),
  });

  console.log('Вы успешно аутентифицировались!');
  console.log('Сохраненная сессия:', client.session.save());

  // Сохранение сессии в файл
  const fs = require('fs');
  fs.writeFileSync('tg.session.txt', client.session.save());

  process.exit(0);
})();
