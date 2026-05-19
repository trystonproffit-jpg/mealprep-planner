function SectionHeader({ eyebrow, title, description, action }) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
      <div>
        {eyebrow ? (
          <p className="font-game text-sm font-black uppercase text-[var(--farm-green-dark)]">
            {eyebrow}
          </p>
        ) : null}

        <h2 className="font-game mt-2 text-4xl font-black leading-tight text-[var(--farm-ink)] md:text-5xl">
          {title}
        </h2>

        {description ? (
          <p className="mt-3 max-w-2xl text-lg font-bold text-[var(--farm-muted)]">
            {description}
          </p>
        ) : null}
      </div>

      {action ? (
        <div className="shrink-0">
          {action}
        </div>
      ) : null}
    </div>
  );
}

export default SectionHeader;
