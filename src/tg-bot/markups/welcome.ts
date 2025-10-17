export const welcomeMessageMarkup = async (userName: string) => {
  return {
    message: `Hi @${userName}, Welcome to Tiktok script bot.\n\n Automate a tiktok account`,
    keyboard: [
      [
        {
          text: 'Login',
          callback_data: JSON.stringify({
            command: '/login',
            language: 'tiktok',
          }),
        },
      ],
      [
        {
          text: 'Close',
          callback_data: JSON.stringify({
            command: '/close',
            language: 'tiktok',
          }),
        },
      ],
      // [
      //   {
      //     text: 'Logout',
      //     callback_data: JSON.stringify({
      //       command: '/logout',
      //       language: 'tiktok',
      //     }),
      //   },
      // ],
    ],
  };
};
