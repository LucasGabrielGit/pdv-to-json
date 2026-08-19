/**
 * Google AdSense configuration.
 *
 * Replace the values below with your own from the AdSense dashboard:
 *   - PUBLISHER_ID  → your "ca-pub-XXXXXXXXXXXXXXXX" ID
 *   - SLOT_ID       → the ad unit slot ID for each placement
 *
 * Docs: https://support.google.com/adsense/answer/9190028
 */

export const ADS_CONFIG = {
  /** Your AdSense publisher ID — format: ca-pub-XXXXXXXXXXXXXXXX */
  PUBLISHER_ID: "ca-pub-6240733470750177",

  slots: {
    /** Ad shown between the input and output sections inside the main card */
    betweenIO: "XXXXXXXXXX",
  },

  /** Set to false to globally disable ads (e.g. in development) */
  enabled: false,
} as const;
