import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Datenschutzerklärung — Eventig',
};

export default function DatenschutzPage() {
  return (
    <article className="max-w-3xl mx-auto px-4 py-10 space-y-4 text-foreground [&_h1]:text-3xl [&_h1]:font-bold [&_h1]:mb-6 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:mt-8 [&_h2]:mb-2 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-1 [&_a]:text-primary [&_a]:underline [&_a:hover]:opacity-80 [&_code]:bg-muted [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-sm">
      <h1>Datenschutzerklärung</h1>

      <p>
        Diese Erklärung informiert dich gemäß Art. 13 DSGVO über die
        Verarbeitung personenbezogener Daten beim Besuch und der Nutzung von{' '}
        <strong>eventig.app</strong> (im Folgenden „die Anwendung").
      </p>

      <h2>1. Verantwortlicher</h2>
      <p>
        Sebastian Kappler<br />
        Robert-Stolz-Straße 1<br />
        40789 Monheim am Rhein<br />
        Deutschland<br />
        E-Mail:{' '}
        <a href="mailto:sebastiankappler@gmx.de">sebastiankappler@gmx.de</a>
      </p>
      <p>
        Die Anwendung ist ein nicht-kommerzielles Hobbyprojekt. Es ist kein
        Datenschutzbeauftragter bestellt, da die gesetzlichen Voraussetzungen
        hierfür nicht erfüllt sind (Art. 37 DSGVO, § 38 BDSG).
      </p>

      <h2>2. Zugriff auf die Anwendung (Server-Logs &amp; Hosting)</h2>
      <p>
        Beim Aufruf der Seite werden technisch notwendige Informationen
        verarbeitet, die dein Browser automatisch übermittelt:
      </p>
      <ul>
        <li>IP-Adresse (gekürzt durch den vorgelagerten Cloudflare-Proxy)</li>
        <li>Datum und Uhrzeit des Zugriffs</li>
        <li>Aufgerufene URL und HTTP-Statuscode</li>
        <li>User-Agent und Referrer</li>
      </ul>
      <p>
        Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse
        am stabilen und sicheren Betrieb). Diese Daten werden nicht mit anderen
        Datenquellen zusammengeführt und nach spätestens 14 Tagen gelöscht oder
        anonymisiert.
      </p>
      <p>
        Die Anwendung wird auf privater Infrastruktur in Deutschland gehostet.
        Eingehender Traffic wird über{' '}
        <strong>Cloudflare, Inc.</strong> (101 Townsend St, San Francisco, CA
        94107, USA) per Cloudflare-Tunnel zum Server geroutet. Cloudflare ist
        nach dem EU-US Data Privacy Framework zertifiziert
        (Angemessenheitsbeschluss der EU-Kommission vom 10.07.2023). Es besteht
        ein Auftragsverarbeitungsvertrag.
      </p>

      <h2>3. Cookies</h2>
      <p>
        Es werden nur technisch notwendige Cookies eingesetzt — kein Tracking,
        kein Analytics, keine Werbung:
      </p>
      <ul>
        <li>
          <strong>NextAuth-Session-Cookie</strong> (httpOnly, SameSite=Lax) —
          enthält ein verschlüsseltes JSON-Web-Token mit deinen
          Anmeldeinformationen. Wird nur gesetzt, wenn du dich aktiv mit Google
          anmeldest. Lebensdauer: 7 Tage. Rechtsgrundlage: Art. 6 Abs. 1 lit.
          b DSGVO (Vertragserfüllung) bzw. § 25 Abs. 2 Nr. 2 TDDDG (technisch
          notwendig).
        </li>
      </ul>

      <h2>4. Anmeldung mit Google („Sign in with Google")</h2>
      <p>
        Die Anmeldung ist <strong>optional</strong>. Du brauchst dich nur
        anzumelden, wenn du Veranstaltungen in deinen Google-Kalender
        übernehmen oder bewerten möchtest.
      </p>
      <p>
        Beim Klick auf „Mit Google anmelden" wirst du zu Google weitergeleitet
        und gibst dort deine Einwilligung in den Datenaustausch
        (OAuth-Consent-Screen). Anschließend erhalten wir von Google folgende
        Informationen:
      </p>
      <ul>
        <li>Deine Google-E-Mail-Adresse</li>
        <li>Deinen bei Google hinterlegten Namen</li>
        <li>Die URL deines Google-Profilbilds</li>
        <li>Eine eindeutige Google-User-ID</li>
        <li>
          Ein OAuth-Access-Token und Refresh-Token mit dem Scope{' '}
          <code>calendar.events</code>
        </li>
      </ul>
      <p>
        Diese Daten werden in einem httpOnly-Cookie auf deinem Endgerät
        gespeichert (verschlüsseltes JSON-Web-Token, 7 Tage gültig). Die
        Tokens werden serverseitig nicht persistiert; sie liegen
        ausschließlich im Cookie und werden nur dann gelesen, wenn du den
        Kalender-Export auslöst.
      </p>
      <p>
        Anbieter des Login-Dienstes ist <strong>Google Ireland Limited</strong>{' '}
        (Gordon House, Barrow Street, Dublin 4, Irland), für Nutzer außerhalb
        der EU{' '}
        <strong>Google LLC</strong>. Datenschutzhinweise von Google:{' '}
        <a
          href="https://policies.google.com/privacy"
          target="_blank"
          rel="noopener noreferrer"
        >
          policies.google.com/privacy
        </a>
        .
      </p>
      <p>
        Rechtsgrundlage für die Anmeldung ist deine Einwilligung (Art. 6 Abs. 1
        lit. a DSGVO i.V.m. Art. 49 Abs. 1 lit. a DSGVO für die mögliche
        Drittlandübermittlung). Du kannst die Einwilligung jederzeit über die
        Funktion „Abmelden" sowie über{' '}
        <a
          href="https://myaccount.google.com/permissions"
          target="_blank"
          rel="noopener noreferrer"
        >
          myaccount.google.com/permissions
        </a>{' '}
        widerrufen.
      </p>

      <h2>5. Export von Veranstaltungen in deinen Google-Kalender</h2>
      <p>
        Wenn du im angemeldeten Zustand „Add to Google Calendar" auslöst,
        überträgt dein Browser einen Eintrag (Titel, Beschreibung, Ort, Start-
        und Endzeit der gewählten Veranstaltung) direkt an die Google
        Calendar API unter{' '}
        <code>https://www.googleapis.com/calendar/v3/calendars/primary/events</code>
        . Die Übertragung erfolgt clientseitig mit dem oben beschriebenen
        Access-Token. Auf unserem Server entstehen dabei keine
        personenbezogenen Daten.
      </p>

      <h2>6. Bewertung von Veranstaltungen</h2>
      <p>
        Im angemeldeten Zustand kannst du Veranstaltungen mit 1–5 Sternen
        bewerten. Wir speichern in einer Postgres-Datenbank:
      </p>
      <ul>
        <li>Deine Google-E-Mail-Adresse</li>
        <li>Die ID der bewerteten Veranstaltung</li>
        <li>Den Bewertungswert (1–5)</li>
        <li>Den Zeitpunkt der Bewertung</li>
      </ul>
      <p>
        Anderen Nutzern wird ausschließlich der berechnete Durchschnitt mit
        Anzahl der Bewertungen angezeigt — niemals deine E-Mail-Adresse oder
        deine Einzelbewertung.
      </p>
      <p>
        Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO (Bereitstellung der
        gewünschten Bewertungsfunktion). Die Daten werden gespeichert, solange
        dein Konto verknüpft ist; auf Anfrage per E-Mail werden sie umgehend
        gelöscht.
      </p>

      <h2>7. Veranstaltungsdaten</h2>
      <p>
        Die in der Anwendung angezeigten Events werden aus öffentlich
        verfügbaren Quellen automatisiert aggregiert. Es werden dabei keine
        personenbezogenen Daten von Nutzern dieser Anwendung verarbeitet.
      </p>

      <h2>8. Empfänger</h2>
      <p>Personenbezogene Daten werden weitergegeben an:</p>
      <ul>
        <li>
          <strong>Google Ireland Limited / Google LLC</strong> — bei Nutzung
          der Login-Funktion und beim Kalender-Export. Drittlandübermittlung
          USA (EU-US Data Privacy Framework).
        </li>
        <li>
          <strong>Cloudflare, Inc.</strong> — als Auftragsverarbeiter für
          Reverse-Proxy/CDN. Drittlandübermittlung USA (EU-US Data Privacy
          Framework).
        </li>
      </ul>
      <p>
        Eine Weitergabe an weitere Dritte findet nicht statt. Es findet kein
        Profiling und keine automatisierte Entscheidungsfindung im Sinne von
        Art. 22 DSGVO statt.
      </p>

      <h2>9. Deine Rechte</h2>
      <p>Du hast jederzeit das Recht:</p>
      <ul>
        <li>auf Auskunft über deine bei uns gespeicherten Daten (Art. 15 DSGVO)</li>
        <li>auf Berichtigung unrichtiger Daten (Art. 16 DSGVO)</li>
        <li>auf Löschung („Recht auf Vergessenwerden", Art. 17 DSGVO)</li>
        <li>auf Einschränkung der Verarbeitung (Art. 18 DSGVO)</li>
        <li>auf Datenübertragbarkeit (Art. 20 DSGVO)</li>
        <li>
          auf Widerspruch gegen Verarbeitungen aufgrund berechtigten
          Interesses (Art. 21 DSGVO)
        </li>
        <li>
          auf Widerruf einer erteilten Einwilligung mit Wirkung für die
          Zukunft (Art. 7 Abs. 3 DSGVO)
        </li>
      </ul>
      <p>
        Wende dich für die Wahrnehmung deiner Rechte formlos per E-Mail an{' '}
        <a href="mailto:sebastiankappler@gmx.de">sebastiankappler@gmx.de</a>.
      </p>
      <p>
        Daneben hast du das Recht auf Beschwerde bei einer
        Datenschutz-Aufsichtsbehörde, insbesondere bei der für mich
        zuständigen{' '}
        <strong>
          Landesbeauftragten für Datenschutz und Informationsfreiheit
          Nordrhein-Westfalen
        </strong>{' '}
        (Kavalleriestraße 2–4, 40213 Düsseldorf,{' '}
        <a
          href="https://www.ldi.nrw.de"
          target="_blank"
          rel="noopener noreferrer"
        >
          ldi.nrw.de
        </a>
        ).
      </p>

      <h2>10. Stand und Änderungen</h2>
      <p>
        Stand dieser Erklärung: {new Date().toLocaleDateString('de-DE', {
          year: 'numeric',
          month: 'long',
        })}
        . Änderungen werden auf dieser Seite veröffentlicht.
      </p>
    </article>
  );
}
