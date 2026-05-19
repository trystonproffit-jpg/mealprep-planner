import { Plus } from "lucide-react";

import GameButton from "./GameButton";

function GroceryItemForm({
  newItemName,
  setNewItemName,
  newItemQuantity,
  setNewItemQuantity,
  onAddItem,
}) {
  return (
    <form
      onSubmit={onAddItem}
      className="mt-6 grid gap-3 rounded-xl border-3 border-[#d3a95f] bg-[var(--farm-paper)] p-4 md:grid-cols-[1fr_1fr_auto]"
    >
      <input
        type="text"
        value={newItemName}
        onChange={(event) => setNewItemName(event.target.value)}
        placeholder="Item name"
        className="farm-input"
      />

      <input
        type="text"
        value={newItemQuantity}
        onChange={(event) => setNewItemQuantity(event.target.value)}
        placeholder="Quantity, optional"
        className="farm-input"
      />

      <GameButton
        type="submit"
        className="inline-flex min-h-12 items-center justify-center gap-2 px-4 py-3"
      >
        <Plus
          size={18}
          strokeWidth={2.8}
          aria-hidden="true"
        />
        Add Item
      </GameButton>
    </form>
  );
}

export default GroceryItemForm;
