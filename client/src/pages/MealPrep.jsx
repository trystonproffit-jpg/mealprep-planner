import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { RotateCcw } from "lucide-react";

import FarmPageLayout from "../components/FarmPageLayout";
import GameButton from "../components/GameButton";
import MealPrepDayCard from "../components/MealPrepDayCard";
import SectionHeader from "../components/SectionHeader";
import WoodPanel from "../components/WoodPanel";
import { apiUrl } from "../api";

const days = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const mealTypes = ["breakfast", "lunch", "dinner"];

function makeBoardKey(day, mealType) {
  return `${day.toLowerCase()}-${mealType}`;
}

function formatMealType(mealType) {
  return mealType.charAt(0).toUpperCase() + mealType.slice(1);
}

function readJsonOrThrow(response, fallbackMessage) {
  if (response.ok) {
    return response.json();
  }

  return response.text().then((text) => {
    console.error("Backend error response:", text);
    throw new Error(fallbackMessage);
  });
}

function MealPrep() {
  const navigate = useNavigate();

  const [mealPrepBoards, setMealPrepBoards] = useState({});
  const [selectedMealType, setSelectedMealType] = useState("breakfast");
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(apiUrl("/meal-prep"), {
      credentials: "include",
    })
      .then((response) =>
        readJsonOrThrow(response, "Failed to load meal prep.")
      )
      .then((data) => {
        const loadedBoards = {};

        data.forEach((board) => {
          loadedBoards[makeBoardKey(board.day, board.meal_type)] = board;
        });

        setMealPrepBoards(loadedBoards);
      })
      .catch((error) => {
        setError(error.message);
      });
  }, []);

  function handleClearMealPrep() {
    const confirmed = window.confirm("Clear the whole meal prep week?");

    if (!confirmed) {
      return;
    }

    setError("");

    fetch(apiUrl("/meal-prep"), {
      method: "DELETE",
      credentials: "include",
    })
      .then((response) => {
        if (response.ok) {
          setMealPrepBoards({});
          return;
        }

        return response.text().then((text) => {
          console.error("Clear meal prep backend error:", text);
          throw new Error("Failed to clear meal prep.");
        });
      })
      .catch((error) => {
        setError(error.message);
      });
  }

  return (
    <FarmPageLayout maxWidth="max-w-[96rem]">
      <div className="farm-panel p-5 md:p-8">
        <SectionHeader
          eyebrow="Weekly Boards"
          title="Meal Prep"
          description="Choose breakfast, lunch, or dinner, then open each day board to add entrees, sides, and other saved recipes."
          action={
            <GameButton
              type="button"
              variant="danger"
              onClick={handleClearMealPrep}
              className="inline-flex items-center gap-2 px-4 py-3"
            >
              <RotateCcw
                size={18}
                strokeWidth={2.8}
                aria-hidden="true"
              />
              Clear Meal Prep
            </GameButton>
          }
        />

        {error ? (
          <p className="farm-error mt-6">
            {error}
          </p>
        ) : null}

        <div className="mt-7 flex flex-wrap justify-center gap-3">
          {mealTypes.map((mealType) => (
            <button
              key={mealType}
              type="button"
              onClick={() => setSelectedMealType(mealType)}
              className={
                selectedMealType === mealType
                  ? "farm-button-primary px-5 py-3"
                  : "farm-button-secondary px-5 py-3"
              }
            >
              {formatMealType(mealType)}
            </button>
          ))}
        </div>

        <WoodPanel className="farm-scrollbar mt-8 overflow-x-auto p-4 pb-5 md:p-5 md:pb-6">
          <div className="grid min-w-[98rem] grid-cols-7 gap-4">
            {days.map((day) => {
              const board = mealPrepBoards[makeBoardKey(day, selectedMealType)];

              return (
                <MealPrepDayCard
                  key={day}
                  day={day}
                  mealType={selectedMealType}
                  board={board}
                  onOpenBoard={() =>
                    navigate(`/meal-prep/${day.toLowerCase()}/${selectedMealType}`)
                  }
                />
              );
            })}
          </div>
        </WoodPanel>
      </div>
    </FarmPageLayout>
  );
}

export default MealPrep;
