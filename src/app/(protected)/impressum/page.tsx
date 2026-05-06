import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Impressum — Eventig',
};

export default function ImpressumPage() {
  return (
    <article className="max-w-3xl mx-auto px-4 py-10 space-y-6 text-foreground [&_h1]:text-3xl [&_h1]:font-bold [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:mt-8 [&_h2]:mb-2 [&_a]:text-primary [&_a]:underline [&_a:hover]:opacity-80">
      <h1>Impressum</h1>

      <h2>Angaben gemäß § 5 DDG</h2>
      <p>
        Sebastian Kappler<br />
        Robert-Stolz-Straße 1<br />
        40789 Monheim am Rhein<br />
        Deutschland
      </p>

      <h2>Kontakt</h2>
      <p>
        E-Mail:{' '}
        <a href="mailto:sebastiankappler@gmx.de">sebastiankappler@gmx.de</a>
      </p>

      <h2>Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV</h2>
      <p>
        Sebastian Kappler<br />
        Anschrift wie oben
      </p>

      <h2>Haftungsausschluss</h2>
      <p>
        Diese Seite ist ein privates Hobbyprojekt und dient ausschließlich
        nicht-kommerziellen Zwecken. Die angezeigten Veranstaltungsdaten werden
        automatisiert von öffentlichen Quellen aggregiert. Es wird keine Gewähr
        für Aktualität, Richtigkeit und Vollständigkeit der Inhalte
        übernommen. Für die Inhalte verlinkter externer Seiten sind
        ausschließlich deren Betreiber verantwortlich.
      </p>

      <h2>Online-Streitbeilegung</h2>
      <p>
        Die Europäische Kommission stellt eine Plattform zur
        Online-Streitbeilegung (OS) bereit:{' '}
        <a
          href="https://ec.europa.eu/consumers/odr/"
          target="_blank"
          rel="noopener noreferrer"
        >
          https://ec.europa.eu/consumers/odr/
        </a>
        . Zur Teilnahme an einem Streitbeilegungsverfahren vor einer
        Verbraucherschlichtungsstelle bin ich nicht verpflichtet und nicht
        bereit.
      </p>
    </article>
  );
}
