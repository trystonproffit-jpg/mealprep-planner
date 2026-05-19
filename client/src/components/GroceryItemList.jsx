import { useState } from "react";
import { Check, CheckSquare, Pencil, RotateCcw, Trash2 } from "lucide-react";

import GameButton from "./GameButton";

function GroceryItemList({
  items,
  onTogglePurchased,
  onDeleteItem,
  onUncheckAll,
}) {
  const [isEditingItems, setIsEditingItems] = useState(false);

  return (
    <div className="mt-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="font-game text-3xl font-black text-[var(--farm-ink)]">
          Items
        </h3>

        {items && items.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            <GameButton
              type="button"
              variant="secondary"
              onClick={() => setIsEditingItems(!isEditingItems)}
              className="inline-flex items-center gap-2 px-3 py-2 text-sm"
            >
              {isEditingItems ? (
                <Check
                  size={16}
                  strokeWidth={2.8}
                  aria-hidden="true"
                />
              ) : (
                <Pencil
                  size={16}
                  strokeWidth={2.8}
                  aria-hidden="true"
                />
              )}
              {isEditingItems ? "Done" : "Edit Items"}
            </GameButton>

            {!isEditingItems ? (
              <GameButton
                type="button"
                variant="secondary"
                onClick={onUncheckAll}
                className="inline-flex items-center gap-2 px-3 py-2 text-sm"
              >
                <RotateCcw
                  size={16}
                  strokeWidth={2.8}
                  aria-hidden="true"
                />
                Uncheck All
              </GameButton>
            ) : null}
          </div>
        ) : null}
      </div>

      {items && items.length > 0 ? (
        <ul className="mt-4 space-y-3">
          {items.map((item) => (
            <li
              key={item.id}
              className="rounded-xl border-2 border-[#d3a95f] bg-[var(--farm-paper-light)] p-3 font-bold text-[var(--farm-ink)]"
            >
              {isEditingItems ? (
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className={item.purchased ? "text-[var(--farm-muted)] line-through" : ""}>
                      {item.quantity ? `${item.quantity} ` : ""}
                      {item.name}
                    </p>
                  </div>

                  <GameButton
                    type="button"
                    variant="danger"
                    onClick={() => onDeleteItem(item.id)}
                    className="inline-flex min-h-11 items-center justify-center gap-2 px-3 py-2 text-sm sm:min-h-0"
                  >
                    <Trash2
                      size={16}
                      strokeWidth={2.8}
                      aria-hidden="true"
                    />
                    Delete
                  </GameButton>
                </div>
              ) : (
                <label className="flex min-h-12 cursor-pointer items-center gap-3">
                  <input
                    type="checkbox"
                    checked={item.purchased}
                    onChange={() => onTogglePurchased(item)}
                    className="h-6 w-6 shrink-0 accent-[var(--farm-green)]"
                  />

                  <span className={item.purchased ? "text-[var(--farm-muted)] line-through" : ""}>
                    {item.quantity ? `${item.quantity} ` : ""}
                    {item.name}
                  </span>
                </label>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <div className="mt-4 rounded-xl border-3 border-dashed border-[#d3a95f] bg-[var(--farm-paper-light)] p-5 text-center">
          <CheckSquare
            size={34}
            strokeWidth={2.5}
            className="mx-auto text-[var(--farm-green-dark)]"
            aria-hidden="true"
          />

          <p className="font-game mt-2 text-xl font-black text-[var(--farm-ink)]">
            No items in this list yet.
          </p>
        </div>
      )}
    </div>
  );
}

export default GroceryItemList;
