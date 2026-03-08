# Brainstorming Design - Social Calendar

<response>
<text>

## Idée 1 : "Editorial Precision" — Approche Swiss/International Style revisité

**Mouvement de design :** Typographie internationale (Swiss Style) modernisée avec des touches de brutalisme doux.

**Principes fondamentaux :**
1. La typographie comme architecture — les titres massifs structurent la page comme des poutres portantes
2. Grille asymétrique rigoureuse — contenu décalé, jamais centré par défaut
3. Contraste maximal entre les éléments — grands vs petits, gras vs léger, couleur vs monochrome

**Philosophie des couleurs :** Un fond blanc cassé (crème) avec du corail/rouge (#E8564A) comme couleur d'action unique. Le navy (#1A2B4A) pour le texte. Pas de dégradés — couleurs plates et franches. Le rouge est réservé exclusivement aux CTA et aux éléments interactifs.

**Paradigme de mise en page :** Grille asymétrique à 2 colonnes avec des blocs de contenu décalés. Les images débordent de la grille. Les sections alternent entre pleine largeur et contenu contraint.

**Éléments signature :**
- Titres surdimensionnés (clamp 3rem-5rem) avec un mot en couleur corail
- Lignes horizontales fines comme séparateurs structurels
- Cartes avec bordure gauche colorée au lieu de bordures complètes

**Philosophie d'interaction :** Transitions nettes et rapides (200ms). Pas de bounce, pas de spring. Les éléments apparaissent par translation verticale simple. Les hovers changent la couleur de fond instantanément.

**Animation :** Fade-in + translateY(20px) au scroll. Durée 400ms, ease-out. Les images glissent depuis le côté. Pas d'animation décorative — chaque mouvement a un but informatif.

**Système typographique :** Titre : Space Grotesk (700, 600) — géométrique, moderne, distinctif. Corps : DM Sans (400, 500) — lisible, chaleureux. Hiérarchie stricte : H1 5rem, H2 3rem, H3 1.5rem, body 1.125rem.

</text>
<probability>0.08</probability>
</response>

<response>
<text>

## Idée 2 : "Warm SaaS" — Approche Friendly Tech avec profondeur

**Mouvement de design :** Néo-corporate chaleureux, inspiré de Linear/Notion mais avec une palette plus chaude et organique.

**Principes fondamentaux :**
1. Chaleur et accessibilité — le design doit rassurer, pas impressionner
2. Profondeur subtile — ombres douces, superpositions de couches, glassmorphism léger
3. Mouvement naturel — animations fluides qui imitent le monde physique

**Philosophie des couleurs :** Fond blanc pur avec des sections en gris très clair (#F8F9FC). Le corail (#E8564A) comme couleur primaire chaude, le navy (#1A2B4A) pour l'autorité. Des touches de bleu clair (#EEF3FF) pour les zones de contenu secondaires. Le corail évoque l'énergie et la créativité sans l'agressivité du rouge pur.

**Paradigme de mise en page :** Layout fluide avec des sections pleine largeur alternant entre fond blanc et fond gris clair. Contenu centré avec max-width 1200px. Les images de features sont présentées dans des "fenêtres" avec ombre portée et coins arrondis, comme des screenshots flottants.

**Éléments signature :**
- Badges/pills colorés avec fond semi-transparent (comme "Reels", "Stories", "Carousels")
- Cartes testimonials avec fond navy foncé et texte blanc, étoiles dorées
- Icônes de réseaux sociaux flottantes avec micro-animations de rotation/bounce

**Philosophie d'interaction :** Transitions spring douces (framer-motion). Les boutons ont un léger scale(1.02) au hover. Les cartes s'élèvent avec une ombre plus prononcée. Tout est fluide et organique.

**Animation :** Stagger animations pour les listes (chaque élément apparaît 100ms après le précédent). Les sections entrent avec un fade + scale(0.95 → 1). Les compteurs s'animent de 0 à la valeur finale. Parallax léger sur le hero.

**Système typographique :** Titre : Outfit (700, 800) — moderne, arrondi, amical. Corps : Plus Jakarta Sans (400, 500, 600) — professionnel mais chaleureux. Hiérarchie : H1 clamp(2.5rem, 5vw, 4rem), H2 2.25rem, body 1rem avec line-height 1.7.

</text>
<probability>0.06</probability>
</response>

<response>
<text>

## Idée 3 : "Dark Command Center" — Approche Dashboard-First

**Mouvement de design :** Dark UI premium inspiré de Vercel/Raycast avec des accents néon.

**Principes fondamentaux :**
1. Le produit est le héros — montrer l'interface, pas des illustrations abstraites
2. Contraste dramatique — fond sombre avec des éclats de couleur stratégiques
3. Densité d'information — montrer la puissance sans submerger

**Philosophie des couleurs :** Fond noir profond (#0A0A0F) avec des surfaces en gris très foncé (#1A1A2E). Le corail (#E8564A) comme accent lumineux qui "brille" sur le fond sombre. Des halos de lumière colorée derrière les éléments clés. Texte blanc (#F5F5F5) avec des niveaux de gris pour la hiérarchie.

**Paradigme de mise en page :** Full-bleed avec des sections qui respirent. Le hero occupe 100vh avec le produit au centre. Les features sont présentées dans des "fenêtres" terminales avec des bordures subtiles. Les sections de contenu utilisent des grilles bento asymétriques.

**Éléments signature :**
- Halos de lumière colorée (radial-gradient) derrière les images produit
- Bordures avec gradient subtil (border-image)
- Effet de grain/noise sur le fond pour ajouter de la texture

**Philosophie d'interaction :** Effets de glow au hover. Les boutons ont un halo lumineux qui s'intensifie. Les cartes révèlent un gradient de bordure au survol. Cursor spotlight effect sur les sections clés.

**Animation :** Entrées dramatiques avec blur(10px → 0) + translateY. Les éléments "émergent" de l'obscurité. Particules flottantes subtiles en arrière-plan. Les compteurs utilisent un effet de "scramble" de chiffres.

**Système typographique :** Titre : Satoshi (700, 900) — géométrique, tech, premium. Corps : General Sans (400, 500) — moderne et lisible sur fond sombre. Hiérarchie : H1 clamp(3rem, 6vw, 5rem), H2 2.5rem, body 1.0625rem avec letter-spacing légèrement augmenté.

</text>
<probability>0.04</probability>
</response>
