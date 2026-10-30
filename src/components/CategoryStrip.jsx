import juttiImg from '../assets/jutti_signature.png';
import heelsImg from '../assets/heels_strappy.png';
import juttiEmbImg from '../assets/jutti_embroidered.png';
import juttiEveryImg from '../assets/jutti_everyday.png';

const categories = [
  { id: 'juttis',   img: juttiImg,    title: 'JUTTIS',    desc: 'Handcrafted with love.',    cta: 'SHOP JUTTIS →' },
  { id: 'heels',    img: heelsImg,    title: 'HEELS',     desc: 'Grace in every step.',       cta: 'SHOP HEELS →' },
  { id: 'sneakers', img: juttiEveryImg, title: 'SNEAKERS', desc: 'Effortless everyday style.', cta: 'SHOP SNEAKERS →' },
  { id: 'sandals',  img: juttiEmbImg, title: 'SANDALS',   desc: 'Summer ready, always.',      cta: 'SHOP SANDALS →' },
];

export default function CategoryStrip() {
  return (
    <section className="cat-strip" id="categories">
      {categories.map((cat, i) => (
        <a key={cat.id} href={`#${cat.id}`} className="cat-card">
          <div className="cat-card__img-wrap">
            <img src={cat.img} alt={cat.title} className="cat-card__img" />
          </div>
          <div className="cat-card__body">
            <h3 className="cat-card__title">{cat.title}</h3>
            <p className="cat-card__desc">{cat.desc}</p>
            <span className="cat-card__cta">{cat.cta}</span>
          </div>
          {i < categories.length - 1 && <div className="cat-sep" />}
        </a>
      ))}
    </section>
  );
}
