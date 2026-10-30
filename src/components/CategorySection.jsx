export default function CategorySection() {
  return (
    <section className="category-section">
      <img 
        src="/category section copy.png" 
        alt="Category Section" 
        className="category-section__img"
      />

      {/* Transparent Clickable Overlays for the 4 Category Links at the bottom */}
      <div className="category-section__links">
        <a href="#everyday-juttis" className="category-section__link" aria-label="Everyday Juttis" />
        <a href="#statement-juttis" className="category-section__link" aria-label="Statement Juttis" />
        <a href="#festive-juttis" className="category-section__link" aria-label="Festive Juttis" />
        <a href="#all-juttis" className="category-section__link" aria-label="All Juttis" />
      </div>
    </section>
  );
}
