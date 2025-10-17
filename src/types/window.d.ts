export {}; // keep file a module

declare global {
  interface Window {
    chrome?: {
      runtime?: any;
      webstore?: any;
      // add more properties you plan to use
    };
  }
}
