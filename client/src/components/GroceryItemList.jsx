function GroceryItemList({
  items,
  onTogglePurchased,
  onDeleteItem,
  onUncheckAll,
}) {
  return (
    <div className="mt-8">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-2xl font-black text-amber-900">
          Items
        </h3>

        {items && items.length > 0 ? (
          <button
            type="button"
            onClick={onUncheckAll}
            className="rounded-lg border-2 border-amber-800 bg-amber-100 px-3 py-1 text-sm font-bold text-amber-800 hover:bg-amber-200"
          >
            Uncheck All
          </button>
        ) : null}
      </div>

      {items && items.length > 0 ? (
        <ul className="mt-4 space-y-2">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex items-center justify-between gap-3 rounded-lg bg-amber-50 p-3 font-bold text-amber-800"
            >
              <label className="flex flex-1 items-center gap-3">
                <input
                  type="checkbox"
                  checked={item.purchased}
                  onChange={() => onTogglePurchased(item)}
                  className="h-5 w-5 accent-amber-700"
                />

                <span className={item.purchased ? "text-amber-500 line-through" : ""}>
                  {item.quantity ? `${item.quantity} ` : ""}
                  {item.name}
                </span>
              </label>

              <button
                type="button"
                onClick={() => onDeleteItem(item.id)}
                className="rounded-lg border-2 border-red-800 bg-red-100 px-3 py-1 text-sm font-bold text-red-800 hover:bg-red-200"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-4 rounded-xl border-4 border-dashed border-amber-700 bg-amber-50 p-4 text-amber-700">
          No items in this list yet.
        </p>
      )}
    </div>
  );
}

export default GroceryItemList;