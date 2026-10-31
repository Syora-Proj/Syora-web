/**
 * SYORA — shared facet controls (inline dropdowns + filter drawer)
 *
 * One definition of the filter controls (category / size / colour / price /
 * availability) used by BOTH the inline toolbar dropdowns and the filter drawer, so
 * the two can never disagree about what a filter is or how it behaves.
 */
import { colourHex } from './colours';
import Check from '../components/Check';

export function facetGroups({ facets, filters, onChange }) {
  const toggleIn = (group, value) => {
    const list = filters[group];
    onChange({ ...filters, [group]: list.includes(value) ? list.filter((x) => x !== value) : [...list, value] });
  };

  return [
    facets.category.length > 0 && {
      id: 'category', title: 'Category', count: filters.category.length,
      body: (
        <ul className="fd-list">
          {facets.category.map((v) => (
            <li key={v}><Check label={v} checked={filters.category.includes(v)} onChange={() => toggleIn('category', v)} /></li>
          ))}
        </ul>
      ),
    },
    facets.size.length > 0 && {
      id: 'size', title: 'Size', count: filters.size.length,
      body: (
        <ul className="fd-sizes">
          {facets.size.map((v) => (
            <li key={v}>
              <button
                type="button"
                className={`fd-size${filters.size.includes(v) ? ' is-on' : ''}`}
                aria-pressed={filters.size.includes(v)}
                onClick={() => toggleIn('size', v)}
              >{v}</button>
            </li>
          ))}
        </ul>
      ),
    },
    facets.colour.length > 0 && {
      id: 'colour', title: 'Colour', count: filters.colour.length,
      body: (
        <ul className="fd-list">
          {facets.colour.map((v) => (
            <li key={v}>
              <Check
                label={v}
                checked={filters.colour.includes(v)}
                onChange={() => toggleIn('colour', v)}
                swatch={colourHex(v)}
              />
            </li>
          ))}
        </ul>
      ),
    },
    facets.price.length > 0 && {
      id: 'price', title: 'Price', count: filters.price.length,
      body: (
        <ul className="fd-list">
          {facets.price.map((b) => (
            <li key={b.id}><Check label={b.label} checked={filters.price.includes(b.id)} onChange={() => toggleIn('price', b.id)} /></li>
          ))}
        </ul>
      ),
    },
    facets.availability && {
      id: 'availability', title: 'Availability', count: filters.inStockOnly ? 1 : 0,
      body: (
        <ul className="fd-list">
          <li><Check label="In stock only" checked={filters.inStockOnly} onChange={() => onChange({ ...filters, inStockOnly: !filters.inStockOnly })} /></li>
        </ul>
      ),
    },
  ].filter(Boolean);
}
