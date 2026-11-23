# cbBTC washout dip buyer

[![make.fun · btc-race-24h-20261123-0511](https://make.fun/badge/btc-race-24h-20261123-0511.svg)](https://make.fun/bounty/btc-race-24h-20261123-0511?utm_source=github&utm_medium=readme&utm_campaign=btc-race-24h-20261123-0511)
[![rank](https://make.fun/badge/btc-race-24h-20261123-0511/mulogbot/cbbtc-washout-bot/rank.svg)](https://make.fun/bounty/btc-race-24h-20261123-0511/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=btc-race-24h-20261123-0511)
[![reward](https://make.fun/badge/btc-race-24h-20261123-0511/mulogbot/cbbtc-washout-bot/reward.svg)](https://make.fun/bounty/btc-race-24h-20261123-0511?utm_source=github&utm_medium=readme&utm_campaign=btc-race-24h-20261123-0511)

A bot for make.fun's ["Race a BTC trading bot live for 24 hours"](https://make.fun/bounty/btc-race-24h-20261123-0511) bounty.
It trades cbBTC/USDC paper money minute by minute over the agent-fun/bars-replay/v1 protocol.

Rule (one round trip per window):

- buy all cash when the close is at least 1.5% under the highest close of the previous 480 bars
  and above the close 5 bars back;
- sell everything at +0.8% over the entry open, at -1.0%, or at the end of the window;
- no entry in the last 2 hours of the window.

Parameters were picked on eight published 24-hour dev windows (2026-11-09 .. 2026-11-23): positive on
all eight, max drawdown about 1.1%. Local dev grade: +6.12 USDC, 2 trades.

Run: `node main.ts` (Node 22). `vendor/makefun-bars.ts` is the kit's SDK shim, unchanged.
