# Social Calendar — Brainstorm Design V2 : Style Notion/Tally

## Approche choisie : "Document-Native Minimalism"

Inspiré directement de Notion et Tally, ce design adopte une esthétique ultra-épurée où le contenu respire et où l'interface produit est la star. Le site ressemble davantage à un document bien structuré qu'à une landing page traditionnelle.

### Design Movement
Minimalisme documentaire — Le site se lit comme un document Notion : titres bold, paragraphes aérés, illustrations légères, et l'interface produit présentée dans des cadres de fenêtre réalistes.

### Core Principles
1. **Espace blanc radical** — Chaque section respire avec des marges généreuses (py-24 à py-32). Le vide est un élément de design.
2. **Typographie comme architecture** — Les titres sont l'élément visuel principal. Très grands (4xl-6xl), très bold, en noir pur.
3. **Produit au centre** — Les screenshots d'interface sont présentés dans des cadres de fenêtre macOS avec ombre douce.
4. **Simplicité intentionnelle** — Pas de gradients, pas de couleurs flashy, pas de décorations inutiles.

### Color Philosophy
- **Noir (#1A1A1A)** — Texte principal, CTA primaire, autorité
- **Blanc (#FFFFFF)** — Fond principal, pureté
- **Gris clair (#F7F7F5)** — Sections alternées, fond de cartes (ton Notion)
- **Gris moyen (#9B9B9B)** — Texte secondaire, descriptions
- **Accent corail (#E8564A)** — Touches très ponctuelles (badge, highlight)
- **Accent bleu (#2383E2)** — Liens, éléments interactifs (ton Notion)

### Layout Paradigm
Centré et étroit (max-w-4xl pour le contenu, max-w-6xl pour les screenshots). Sections empilées verticalement avec beaucoup d'espace entre elles. Pas de grilles complexes — une colonne principale avec des variations ponctuelles en 2 colonnes.

### Signature Elements
1. **Cadres de fenêtre macOS** — Les screenshots produit sont encadrés dans des fenêtres avec les 3 dots (rouge, jaune, vert)
2. **Badges discrets** — Petits badges arrondis avec fond gris clair et texte noir
3. **Bordures fines** — Cartes avec border-1 gris très clair, pas d'ombres lourdes

### Interaction Philosophy
Subtile et fonctionnelle. Hover léger sur les cartes (translate-y -2px), transitions de 200ms. Pas d'animations spectaculaires — le contenu parle de lui-même.

### Animation
- Fade-in au scroll avec délai stagger léger
- Pas de parallax
- Transitions hover douces (opacity, translate)
- Pas d'animations de chargement complexes

### Typography System
- **Titres** : Inter (800 weight) — Grand, bold, noir pur
- **Corps** : Inter (400 weight) — Lisible, gris foncé
- **Accents** : Inter (600 weight) — Semi-bold pour les sous-titres
- Tailles : H1 = 4xl-5xl, H2 = 3xl-4xl, H3 = xl-2xl, body = base-lg
