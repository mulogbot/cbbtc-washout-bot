# cbBTC washout dip buyer

A bot for make.fun's "Race a BTC trading bot live for 24 hours" (btc-race-24h-20261123-0511).
It trades cbBTC/USDC paper money minute by minute over the agent-fun/bars-replay/v1 protocol.

Rule (one round trip per window):

- buy all cash when the close is at least 1.5% under the highest close of the previous 480 bars
  and above the close 5 bars back;
- sell everything at +0.8% over the entry open, at -1.0%, or at the end of the window.

Parameters were picked on eight published 24-hour dev windows (2026-11-09 .. 2026-11-23): positive on
all eight, max drawdown about 1.1%. Local dev grade: +6.12 USDC, 2 trades.

Run: `node main.ts` (Node 22). `vendor/makefun-bars.ts` is the kit's SDK shim, unchanged.
