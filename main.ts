// Eight-hour washout dip buyer for cbBTC/USDC (agent-fun/bars-replay/v1).
//
// One round trip per window:
//   - entry: the close sits at least 1.5% under the highest close of the previous 480 bars,
//     and above the close 5 bars back (the drop has started to turn);
//   - exit: +0.8% over the entry open (take profit), -1.0% (stop), or the end of the window;
//   - no entry in the last 120 minutes of the 24-hour window (a late entry rarely reaches its
//     target and pays the forced sale at the end).
// The first 480 bars only build history: starting earlier on a partial lookback lost about 15 USDC
// on two of the eight dev windows it was tested on (buying the first leg of a long fall).
// Whole cash in, whole position out. Deterministic: no clock, no randomness.

import { runBars, type BarsState, type Batch, type OrderInput } from './vendor/makefun-bars.ts';

const SYMBOL = 'CBBTC';
const LOOKBACK = 480;
const DIP = 0.015;
const TURN = 5;
const TAKE = 0.008;
const STOP = 0.01;
const ROUND_TRIPS = 1;
const WINDOW_MINUTES = 1440;
const NO_ENTRY_LAST_MINUTES = 120;
const BUY_SLIP_BPS = 100;
const SELL_SLIP_BPS = 10_000;

const closes: number[] = [];
const hiQ: number[] = []; // indices into closes, values decreasing (rolling max); head at hiHead
let hiHead = 0;
let entry: number | null = null;
let startT: number | null = null; // close time of the first bar seen
let trips = 0;
let buys = 0;
let sells = 0;

function rollingHigh(i: number): number {
  const j = i - 1;
  while (hiQ.length > hiHead && closes[hiQ[hiQ.length - 1]] <= closes[j]) hiQ.pop();
  hiQ.push(j);
  while (hiQ[hiHead] < i - LOOKBACK) hiHead++;
  return closes[hiQ[hiHead]];
}

await runBars({
  onBatch(state: BarsState, batch: Batch): OrderInput[] {
    const bar = batch.bars.find((b) => b.symbol === SYMBOL);
    const pos = state.positions.get(SYMBOL);
    const held = pos !== undefined && pos.qty > 0n;
    if (bar === undefined) return [];
    if (startT === null) startT = bar.t;
    const minute = Math.floor((bar.t - startT) / 60_000);
    const o = Number(bar.o);
    const c = Number(bar.c);
    const i = closes.length;
    const hi = i >= 1 ? rollingHigh(i) : c;
    closes.push(c);

    if (held && entry === null) entry = o; // filled at this bar's open
    if (!held && entry !== null) {
      entry = null; // position closed
      trips++;
    }

    if (held && entry !== null) {
      const r = c / entry - 1;
      if (r >= TAKE || r <= -STOP) {
        sells++;
        return [{ side: 'sell', client_id: `wash-s${sells}`, symbol: SYMBOL, qty: pos!.qty, max_slippage_bps: SELL_SLIP_BPS }];
      }
      return [];
    }

    if (trips >= ROUND_TRIPS || i < LOOKBACK || minute >= WINDOW_MINUTES - NO_ENTRY_LAST_MINUTES) return [];
    if (c <= hi * (1 - DIP) && c > closes[closes.length - 1 - TURN]) {
      const cash = state.cash;
      if (cash < BigInt(state.hello.fees.min_notional_quote_units)) return [];
      buys++;
      return [{ side: 'buy', client_id: `wash-b${buys}`, symbol: SYMBOL, notional_quote_units: cash, max_slippage_bps: BUY_SLIP_BPS }];
    }
    return [];
  },
});
