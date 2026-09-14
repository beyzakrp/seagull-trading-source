"use client";

import { useState } from "react";

const menuContent: Record<string, Array<{ name: string; detail: string; price: string }>> = {
  Breakfast: [
    { name: "Adriatic Morning", detail: "Eggs, local cheese, tomato, olives", price: "€12" },
    { name: "Fig & Honey Bowl", detail: "Yoghurt, seasonal fruit, granola", price: "€8" },
    { name: "Boka Toast", detail: "Sourdough, avocado, herbs", price: "€9" },
  ],
  Mains: [
    { name: "Bay Catch", detail: "Daily fish, greens, lemon butter", price: "€24" },
    { name: "Njeguši Plate", detail: "Prosciutto, cheese, warm bread", price: "€16" },
    { name: "Garden Risotto", detail: "Seasonal vegetables, herbs", price: "€18" },
  ],
  Drinks: [
    { name: "Coastal Spritz", detail: "Citrus, herbs, sparkling wine", price: "€10" },
    { name: "Mountain Lemonade", detail: "Fresh lemon, mint, soda", price: "€6" },
    { name: "Local Selection", detail: "Ask for today’s Montenegrin wine", price: "€8" },
  ],
};

export function PhoneMenu() {
  const [menuCategory, setMenuCategory] = useState("Mains");

  return (
    <div className="phone" aria-label="Interactive QR menu preview">
      <div className="phone-speaker" />
      <div className="phone-menu">
        <p>BAY HOUSE · KOTOR</p>
        <div className="phone-title"><span>MENU</span><b>☼</b></div>
        <div className="menu-tabs">
          {Object.keys(menuContent).map((category) => (
            <button
              key={category}
              type="button"
              className={menuCategory === category ? "active" : ""}
              aria-pressed={menuCategory === category}
              onClick={() => setMenuCategory(category)}
            >{category}</button>
          ))}
        </div>
        <div className="menu-items" aria-live="polite">
          {menuContent[menuCategory].map((item) => (
            <div className="menu-item" key={item.name}>
              <div><strong>{item.name}</strong><small>{item.detail}</small></div>
              <b>{item.price}</b>
            </div>
          ))}
        </div>
        <div className="menu-language"><span>EN</span><i>ME</i><i>TR</i></div>
      </div>
    </div>
  );
}
