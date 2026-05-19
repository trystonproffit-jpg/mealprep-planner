function FarmPageLayout({ children, maxWidth = "max-w-6xl" }) {
  return (
    <main className="farm-background">
      <section className={`farm-page-shell ${maxWidth}`}>
        {children}
      </section>
    </main>
  );
}

export default FarmPageLayout;
