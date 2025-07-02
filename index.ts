import express, { Request, Response } from "express";
import { Order,orderPlace } from "./types";

const orderbook: {
  ask: Order[],
  bids: Order[]
} = {
  ask: [],
  bids: []
};

const app = express();
app.use(express.json());

app.post("/sell", (req,res) => {
  const parsed = orderPlace.safeParse(req.body);

  if (!parsed.success) {
    console.log(" wrong order format");
     res.status(400).json({ error: parsed.error.errors });
     return;
  }

  const order = parsed.data;
  orderbook.ask.push(order);
  console.log(" Sell order placed:");
  showCurrentStatus();

  res.status(201).json({ message: "Sell order added to book" });
});

app.post("/buy", (req: Request, res: Response) => {
  const parsed = orderPlace.safeParse(req.body);

  if (!parsed.success) {
    console.log("❌ wrong order format");
     res.status(400).json({ error: parsed.error.errors });
     return;
  }

  const order = parsed.data;
  buy(order);
  res.status(201).json({ message: "Buy order processed" });
});

function buy(order: Order) {
  orderbook.ask.sort((a, b) => a.price - b.price);

  let quantityToBuy = order.quantity;
  const updatedAsks: Order[] = [];

  for (let ask of orderbook.ask) {
    if (quantityToBuy <= 0) break;

    if (ask.price <= order.price) {
      const tradeQty = Math.min(ask.quantity, quantityToBuy);
      console.log(`🛒 Matched ${tradeQty} units at ₹${ask.price}`);

      quantityToBuy -= tradeQty;

      if (ask.quantity > tradeQty) {
        ask.quantity -= tradeQty;
        updatedAsks.push(ask);
      }
      // else skip (remove filled ask)
    } else {
      updatedAsks.push(ask);
    }
  }

  if (quantityToBuy > 0) {
    console.log(`⚠️ Could not fulfill ${quantityToBuy} units due to lack of matching asks.`);
  }

  orderbook.ask = updatedAsks;
  showCurrentStatus();
}

function showCurrentStatus() {
  console.log("\n📈 Current Orderbook Status:");
  console.log("ASKS:");
  console.table(
    orderbook.ask.map((o) => ({
      price: o.price,
      quantity: o.quantity,
      market: o.market
    }))
  );

  console.log("BIDS:");
  console.table(
    orderbook.bids.map((o) => ({
      price: o.price,
      quantity: o.quantity,
      market: o.market
    }))
  );
}

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
