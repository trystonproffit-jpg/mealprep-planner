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
      className="mt-6 grid gap-3 rounded-xl border-2 border-amber-700 bg-amber-50 p-4 md:grid-cols-[1fr_1fr_auto]"
    >
      <input
        type="text"
        value={newItemName}
        onChange={(event) => setNewItemName(event.target.value)}
        placeholder="Item name"
        className="rounded-lg border-2 border-amber-700 bg-white p-2 outline-none focus:border-orange-500"
      />

      <input
        type="text"
        value={newItemQuantity}
        onChange={(event) => setNewItemQuantity(event.target.value)}
        placeholder="Quantity, optional"
        className="rounded-lg border-2 border-amber-700 bg-white p-2 outline-none focus:border-orange-500"
      />

      <button
        type="submit"
        className="rounded-xl border-2 border-amber-900 bg-amber-700 px-4 py-2 font-bold text-amber-50 hover:bg-amber-800"
      >
        Add Item
      </button>
    </form>
  );
}

export default GroceryItemForm;