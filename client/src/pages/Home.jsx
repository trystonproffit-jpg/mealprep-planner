import { BookOpen, CalendarDays, ClipboardList } from "lucide-react";

import FarmPageLayout from "../components/FarmPageLayout";
import PageCard from "../components/PageCard";
import SectionHeader from "../components/SectionHeader";

function Home({ user }) {
  const navigationCards = [
    {
      to: "/recipes",
      eyebrow: "Recipes",
      title: "Recipes",
      description: "Save recipes and organize them into cozy custom groups.",
      Icon: BookOpen,
    },
    {
      to: "/meal-prep",
      eyebrow: "Weekly Plan",
      title: "Meal Prep",
      description: "Assign recipes to breakfast, lunch, and dinner for the week.",
      Icon: CalendarDays,
    },
    {
      to: "/grocery-lists",
      eyebrow: "Grocery Lists",
      title: "Grocery Lists",
      description: "Build shopping lists manually or from recipe ingredients.",
      Icon: ClipboardList,
    },
  ];

  return (
    <FarmPageLayout>
      <div className="farm-panel p-5 md:p-8">
        <SectionHeader
          eyebrow="Farm Kitchen"
          title={`Welcome back, ${user.username}.`}
          description="Plan recipes, organize your weekly meals, and build grocery lists from your favorite meals."
        />

        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {navigationCards.map(({ to, eyebrow, title, description, Icon }) => (
            <PageCard
              key={to}
              to={to}
              className="block p-5 md:p-6"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-xl border-3 border-[var(--farm-wood)] bg-[var(--farm-panel)] text-[var(--farm-green-dark)] shadow-[3px_3px_0_rgba(74,42,22,0.28)]">
                <Icon
                  size={30}
                  strokeWidth={2.6}
                  aria-hidden="true"
                />
              </div>

              <p className="font-game mt-5 text-sm font-black uppercase text-[var(--farm-green-dark)]">
                {eyebrow}
              </p>

              <h3 className="font-game mt-2 text-3xl font-black text-[var(--farm-ink)]">
                {title}
              </h3>

              <p className="mt-3 font-bold leading-relaxed text-[var(--farm-muted)]">
                {description}
              </p>
            </PageCard>
          ))}
        </div>

        <div className="mt-8 rounded-2xl border-3 border-[var(--farm-wood)] bg-[var(--farm-paper-light)] p-5 shadow-[4px_4px_0_rgba(74,42,22,0.28)]">
          <p className="font-game text-xl font-black text-[var(--farm-ink)]">
            Today&apos;s prep starts here.
          </p>

          <p className="mt-2 max-w-3xl font-bold text-[var(--farm-muted)]">
            Choose a section above to open your recipe book, set the weekly
            meal board, or check your grocery list before shopping.
          </p>
        </div>
      </div>
    </FarmPageLayout>
  );
}

export default Home;
