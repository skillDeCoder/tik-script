export const menuMarkup = async () => {
  return {
    message: `Choose an option:`,

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
