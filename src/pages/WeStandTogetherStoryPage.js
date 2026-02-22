import React from 'react';

export default function WeStandTogetherStoryPage({ t, setCurrentPage }) {
  return (
    <div className="flex min-h-screen bg-gray-900 text-gray-100">
      {/* Sidebar - Links */}
      <div className="w-64 bg-gray-800/80 border-r border-gray-700 p-6 flex flex-col justify-center items-center sticky top-0 h-screen overflow-y-auto">
        <div className="flex flex-col items-center gap-4">
          <button
            onClick={() => setCurrentPage('projectWeStandTogether')}
            className="px-6 py-2 rounded-lg bg-blue-900/30 hover:bg-blue-800/40 border border-blue-800 transition-all duration-200 text-blue-300 hover:text-blue-200 text-sm"
          >
            ← {t.backToAlbum || "Zurück zum Album"}
          </button>
          
          <div className="border-t border-b border-gray-700 py-4 flex flex-col items-center gap-4">
            <button
              onClick={() => setCurrentPage('projects')}
              className="px-4 py-2 rounded-lg bg-gray-700/30 hover:bg-gray-600/40 border border-gray-600 transition-all duration-200 text-gray-300 hover:text-gray-200 text-sm"
            >
              📁 {t.projectsButtonText || "Projekte"}
            </button>
            
            <button
              onClick={() => setCurrentPage('artistProfile')}
              className="px-4 py-2 rounded-lg bg-gray-700/30 hover:bg-gray-600/40 border border-gray-600 transition-all duration-200 text-gray-300 hover:text-gray-200 text-sm"
            >
              👤 {t.artistButtonText || "Künstler"}
            </button>
            
            <button
              onClick={() => setCurrentPage('home')}
              className="px-4 py-2 rounded-lg bg-gray-700/30 hover:bg-gray-600/40 border border-gray-600 transition-all duration-200 text-gray-300 hover:text-gray-200 text-sm"
            >
              🏠 {t.homeButtonText || "Startseite"}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4 md:p-8 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-green-600">
            We Stand Together
          </h1>
          <p className="text-xl text-green-300 mb-2">The Story of Brian Wright - A Tribute to All Soldiers</p>
          <p className="text-gray-400 mb-8">📅 2001</p>

          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6 md:p-8">
            <div className="prose prose-invert prose-lg max-w-none">
              <p className="text-lg leading-relaxed text-gray-200 whitespace-pre-wrap">
{`Wir sind in Amerika, zur Zeit kurz nach dem 9/11 - 2001

Der junge Brian Wright, 18 Jahre, gerade frisch verliebt, in seine wunscherschöne junge Freundin, Marian, die er aus der Schule kennt, aber die erst vor kurzem zusammengefunden haben. Jeden Freitagabend, lassen sie den Alltag hinter sich, gehen ins Kino, in die Disco, sie gehen ins Restaurant, sie haben Spaß. Sie liebt ihn abgöttisch und er sie auch. 

Sie können nicht von einander lassen. Jeden Tag treffen Sie sich und unternehmen gemeinsam etwas. Sie können sich keinen Tag ohne den anderen mehr vorstellen. 

Doch dann, eines Tages, vollkommen unerwartet, bekommt er einen Brief. Ein Brief von der Army. Seine Einberufung zur Armee und gleichzeitig die Einberufung an die Kriegsfront. Es ist wie ein Schock für ihn. Wie soll er es seiner geliebten Marian erkären, dass er sich ja freiwillig zur Army gemeldet hat. Doch jetzt, kommt es so unerwartet und plötzich.

Dann der Tag an dem er berufen wird.

Lange Abschiedsumarmungen und Küsse. Sie will ihn nicht gehenlassen, doch sie weiß auch, dass es so sein muss und so sein wird. Tränen fließen durch ihr beider Gesicht. Er steigt in den Zug, sie läuft und winkt ihm nach. Die ersten Tage, keine Nachrichten von ihm. Er ist an der Front und kann nicht schreiben oder telefonieren. Die Ungewissheit zerstört sie fast. Sie hält es kaum noch aus. 

Dann der erste Brief. Es geht ihm gut. Sie ist erleichtert. Tage und Wochen vergehen. Jeden Tag ein Brief von ihm oder ein kurzes Telefonat. Dann, eine ganze lange Zeit lang NICHTS. Kein Telefonat, kein Brief. Es frisst sie auf, sie weint jeden Tag. Diese Ungewissheit, ob es ihren Liebsten gut geht, ob er noch lebt. Die Tage vergehen, Sie kann an nichts anderes mehr denken als dass, wann sie sich endlich wiedersehen. Weitere Tage gehen ins Land. Immer noch keine Nachricht. 

Dann irgendwann... ein Klopfen am Fenster. Sie schaut hinaus, sieht aber nichts. Sie geht zur Tür, macht sie auf und da steht er. Unverletzt und Gesund und munter. Sie fallen sich in die Arme, Sie weinen vor Glück. und in diesem Moment, versprechen Sie sich beide, sich niemals wieder voneinander zu trennen. 

Brian geht auf die Knie und er holt einen Ring aus der Tasche. Willst du meine Frau werden? fragt er. Und sie .... sie kann es nicht glauben, sie fällt fast in Ohnmacht, aber JA, sie sagt "JA ich will."`}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
