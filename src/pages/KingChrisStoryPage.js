import React from 'react';

export default function KingChrisStoryPage({ t, setCurrentPage }) {
  return (
    <div className="flex min-h-screen bg-gray-900 text-gray-100">
      {/* Sidebar - Links */}
      <div className="w-64 bg-gray-800/80 border-r border-gray-700 p-6 flex flex-col justify-center items-center sticky top-0 h-screen overflow-y-auto">
        <div className="flex flex-col items-center gap-4">
          <button
            onClick={() => setCurrentPage('projectKingChris')}
            className="px-6 py-2 rounded-lg bg-blue-900/30 hover:bg-blue-800/40 border border-blue-800 transition-all duration-200 text-blue-300 hover:text-blue-200 text-sm"
          >
            ← {t.backToAlbum || "Zurück zum Album"}
          </button>
          
          <div className="border-t border-b border-gray-700 py-4 flex flex-col items-center gap-4">
            <button
              onClick={() => setCurrentPage('projects')}
              className="px-4 py-2 rounded-lg bg-gray-700/30 hover:bg-gray-600/40 border border-gray-600 transition-all duration-200 text-gray-300 hover:text-gray-200 text-sm"
            >
              📁 Projekte
            </button>
            
            <button
              onClick={() => setCurrentPage('artistProfile')}
              className="px-4 py-2 rounded-lg bg-gray-700/30 hover:bg-gray-600/40 border border-gray-600 transition-all duration-200 text-gray-300 hover:text-gray-200 text-sm"
            >
              👤 Künstler
            </button>
            
            <button
              onClick={() => setCurrentPage('home')}
              className="px-4 py-2 rounded-lg bg-gray-700/30 hover:bg-gray-600/40 border border-gray-600 transition-all duration-200 text-gray-300 hover:text-gray-200 text-sm"
            >
              🏠 Startseite
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4 md:p-8 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
            The Story Of King Chris
          </h1>
          <p className="text-xl text-purple-300 mb-2">Rise of a Champion</p>
          <p className="text-gray-400 mb-8">📅 2025</p>

          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6 md:p-8">
            <div className="prose prose-invert prose-lg max-w-none">
              <p className="text-lg leading-relaxed text-gray-200 whitespace-pre-wrap">
{t.kingChrisDescription || `Als Chris noch ein kleiner Junge war, er war anders als alle Anderen.
Er hatte einen kleinen Sprachfehler, er hat gestottert. Deswegen wurde er in der Schule immer gehänselt.
Er wurde geschubst, verprügelt und er hat sich nie gewehrt, weil er Angst hatte.
Er hatte keine Freunde, weil er ein Außenseiter war. Sein einziger Freund war sein Hund Chuck.
Chuck war sein liebster Freund. Wenn er aus der Schule kam, wartete Chuck schon immer auf ihn.
Sie spielten den ganzen Nachmittag und währenddessen war die Welt in Ordnung.
Sein Schulweg war sehr weit. Seine Eltern waren arm, konnten sich nichts leisten.
Sie hatten kein Auto, er hatte kein Fahrrad und seine Schuhe fielen fast auseinander.
In der Schule stand er immer allein in der Pause und in der Klasse saß er immer ganz hinten, ganz allein.
Seine Eltern hatten einen kleinen, sehr alten Fernseher. Man konnte kaum was darauf erkennen.
Manchmal, nachts, wenn ein Profiboxkampf im TV lief, schlich er sich heimlich aus seinem Zimmer und
schaute durch das kleine Fenster in der Wohnzimmertür den Boxkampf. Er musste ganz leise und
vorsichtig sein, dass es niemand bemerkte. Er fieberte mit den Boxern, wenn sie rundenlang
auf sich einprügelten. Ja, Boxen hat ihm schon sehr gefallen. Er liebte es, wenn die Kämpfer in den Ring
stiegen und bejubelt wurden. Er stellte sich dann immer vor, wie es wäre, wenn er so ein großartiger Boxer wäre und selbst bejubelt und anerkannt werden würde.
Irgendwann hat er mal den Wunsch geäußert ein Boxtraining zu besuchen, aber seine Eltern lachten ihn aus.
Er wäre zu weich zum Kämpfen. Er solle einen bodenständigen Beruf erlernen. Vielleicht Autos reparieren oder
eine Tischlerlehre beginnen. Irgendetwas Handwerkliches.
Eines Tages aber, nach der Schule, ging er nicht gleich nach Hause, Chuck wartete diesmal vergeblich.
Er fasste sich ein Herz und ging in die große Boxschule in der Stadt.
Als er die Halle betrat, starrten ihn alle an und musterten ihn von oben bis unten und es durchfuhr
ihn ein frostiges Gefühl. Aber gleichzeitig war er auch neugierig. Er meldete sich trotzdem zum Training an.
Der Trainer, selbst einmal eine große Legende, fragte ihn ob er das wirklich will, weil er so klein und schmächtig war. Aber ja, er wollte das. Er träumte heimlich davon ein großer Kämpfer zu werden.
Ab jetzt kam er regelmäßig nach der Schule nicht nach Hause und seine Eltern machten sich Sorgen.
Chris hatte immer eine plausible Ausrede. Er treffe sich mit Freunden in der Stadt wo sie Spiele spielten.
Er wusste, dass er gelogen hatte, aber seine Eltern glaubten ihm und eigentlich waren sie froh darüber, dass
er ein paar Freunde gefunden hätte.
Seine ersten Trainings waren Schattenboxen und den Sandsack bearbeiten, Gewichte heben und die Spuckeimer leeren. Das alles störte ihn nicht. Er legte sich ins Zeug bei allem was er tat. Er tat es mit Ehrfurcht, aber auch mit Freude.
Eines Tages bestritt er seinen ersten Kampf. Er war aufgeregt, hatte sogar Angst und sein Körper,
voller Adrenalin, zitterte sichtbar wie verrückt.
Dann die Ringglocke... erste Runde, einen Haken und direkt zu Boden.
In diesem Moment fragte er sich, ob es das alles wert sei. Sein Trainer rief ihm zu: "Steh auf Junge, steh auf
und bring zu Ende was du angefangen hast." Er stand auf, kämpfte weiter und verlor den Kampf durch KO.
Sein Gesicht gezeichnet von diesen Runden im Ring, ging er nach Hause. Er schlich sich in sein Zimmer, aber die Mutter hörte ihn, ging hinterher und sah ihn an. Sie fragte was passiert sei und Chris erzählte ihr, dass er sich in der Boxhalle in der Stadt angemeldet, seinen ersten Kampf hatte und diesen verlor.
Die Mutter sagte ihm: "Wir haben es dir doch gleich gesagt, du bist zu weich für diesen Sport."
Chris wollte nicht weich sein. Er wollte ein Kämpfer werden, genau so einer wie die, die er nachts heimlich
im TV sah und die er bewunderte.
Er wollte nicht mehr geschubst und verprügelt werden, nur weil er stotterte. Er wollte nicht mehr allein sein
sondern Freunde haben. Dies alles waren die Gründe, warum er durchhielt und weitermachte.
Er gab alles, er trainierte hart. Jeden Tag kam er schweißgebadet nach Hause und fiel müde und geschafft ins Bett, nur um am nächsten Tag wieder zur Schule zu gehen und nach der Schule zu trainieren.
Die Schubsereien und Prügeleien in der Schule haben aufgehört. Er setzte sich zur Wehr, hatte nun keine Angst
mehr vor Schmerzen.
Chris wuchs heran, wurde ein junger Mann und immer noch trainierte er jeden Tag. Bestritt hin und wieder ein paar Kämpfe. Verloren hat er seit seinem ersten Kampf nicht mehr.
Langsam wurde aus dem kleinen, unscheinbaren, stotternden Chris ein junger Mann.
Er hatte Freunde, die ihn unterstützten wenn er einen Kampf bestritt und er hatte eine sehr hübsche Freundin. Seine Eltern, die anfangs noch skeptisch waren, hatte er durch seine Ausdauer und seinen Ehrgeiz überzeugt.
Sie standen jetzt hinter ihm und unterstützten sein Hobby ebenfalls, soweit sie konnten.
Mittlerweile war Chris in der Weltrangliste der Champions immer weiter nach oben gestiegen und stand
jetzt auf Platz 10. Er hatte es in die TOP-10 geschafft. Seinen Namen kannte inzwischen jeder und auch die Jungs
aus der Schule, die ihn als Kind regelmäßig geschubst und verprügelt hatten, respektierten ihn und das machte ihn sehr stolz. Stolz aber nicht überheblich. Immer noch war sein Körper voller Adrenalin wenn er einen Kampf bestritt, aber sein Körper zitterte nicht mehr so offensichtlich.
Die Abende verbrachte er nun nicht mehr allein in seinem Zimmer sondern in Clubs mit seinen Freunden.
Chuck war inzwischen gestorben. Er war alt und Chris vermisste ihn jeden Tag. Schließlich hatten sie die meiste
Zeit zusammen verbracht und Chris konnte mit ihm über seine Sorgen und Ängste reden.
Eines Tages klingelte es an Chris' Tür. Ein Mann stand draußen, es regnete, aber Chris war immer schon misstrauisch Fremden gegenüber, deshalb bat er den Fremden am Anfang nicht ins Haus.
Der Fremde, einer der vielen Manager des amtierenden Champions, stellte sich vor und unterbreitete Chris ein Angebot. Chris hörte zu und bat ihn nach einiger Zeit dann doch ins Haus.
Der Mann sagte ihm, dass der Champion einen Gegner suche für seine Titelpflichtverteidigung und dass keiner der anderen in den TOP 10 bereit war oder sich in der Lage fühlte, diesen Titelkampf zu bestreiten.
Jetzt wäre Chris an der Reihe.
Chris wusste nicht was er antworten sollte. Auf der einen Seite war es genau das, was er wollte und woraufhin
er all die ganzen Jahre gearbeitet hatte, andererseits, war er wirklich schon so weit und bereit für einen
Titelkampf???
Er rief seinen Trainer an. Der konnte nicht glauben was er da hörte. "Das ist deine Chance mein Junge! Nutze sie. Denn das ist es doch, was du wirklich wolltest!"
Chris sagte: "Ich willige nur ein, wenn du mich trainierst." Sein Trainer war einverstanden.
Chris fragte den Mann wie lange er Zeit hätte um sich vorzubereiten.
"30 Tage, inkl. heute"
Das waren 29 Tage Vorbereitungszeit, denn der heutige Tag hatte nur noch 2 Stunden. Es war bereits 10 PM.
Chris sagte zu.
Am nächsten Morgen, 05 AM, ging es los. Der Lauf zur Trainingshalle. Es waren 7 Meilen. 7 lange Meilen, die jeden Tag länger zu werden schienen. Aber Chris hatte ein Ziel vor Augen.
Ab jetzt hieß es härter zu trainieren als je zuvor. Der Champ war in 38 Kämpfen ungeschlagen, also musste Chris alles geben. Er musste all seinen Mut, all seine Liebe, all seine Kraft und all seinen Respekt in sein Training legen, nur so konnte er es schaffen. Nur so konnte er Champion werden.
Jeden Abend ging er mit schmerzendem Körper ins Bett und jeden Morgen stand er mit schmerzverzerrtem Gesicht wieder auf.
Sein Körper wollte eigentlich nicht aufstehen, aber Chris schrie sich selber an:
"Los Junge, steh wieder auf. Du weißt warum wir das machen!"
Jeden Tag trainierte er hart und härter. Sein Trainer feuerte ihn an: "Los Junge, du schaffst das!"
"Noch drei, noch zwei, noch eins"... dann kurze Pause und wieder von vorne. "Los Junge, lauf um dein Leben. Das ist deine Chance!"
Joggen, Berg auf, Berg ab, Schwimmen, Gewichte stemmen, Seilspringen, Klimmzüge. Keine Pause, unermüdlich. Und seine Fans, die er mittlerweile hatte, begleiteten ihn beim Training.
"Chris, Chris, Chris" feuerten sie ihn immer wieder an, wenn er glaubte am Ende seiner Kräfte zu sein.
"Du bist bereit Junge" sagte sein Trainer 2 Tage vor dem Kampf. "Jetzt mach Pause und erhol dich,
damit du bei Kräften bist wenn der große Tag gekommen ist. Dein großer Tag."
Chris war heilfroh als sein Trainer diese Worte sagte, denn er war fertig. Wirklich fertig und er brauchte diese Pause dringend.
Die nächsten zwei Tage stand Chris früh auf, half seiner Mutter in der Küche und dem Vater auf dem Feld. Sie unterhielten sich lange, denn das hatten sie eine sehr lange Zeit nicht getan. Chris hatte viel zu sagen und er war dankbar seinen Eltern gegenüber dafür, dass sie ihn in den letzten Jahren so sehr unterstützt hatten. Sie hatten zwar nicht viel zu geben, aber Chris gab alles doppelt und mehrfach zurück.
Dann endlich war es soweit. Der Tag des Kampfes, der sein Leben für immer verändern könnte.
Chris machte den ganzen Tag noch paar leichte Übungen, dehnte seinen Körper, aber er ließ es ruhig angehen.
Der Tag näherte sich langsam dem Ende, die Lichter der Laternen erhellten langsam die Straßen, die er entlang ging.
Der Weg zur Arena, wo der Kampf stattfinden sollte, schien schier unendlich zu sein.
In der Arena angekommen, empfing ihn schon aufgeregt sein Trainer: "Junge, wo warst du so lange? Du bist spät dran!" "Keine Zeit mehr um dich aufzuwärmen!"
Chris war ruhig und gelassen. So weit hatte er es schon gebracht. Nichts auf der Welt war bis jetzt bedeutungsvoller. Alles was jetzt noch kommt, kann nur ein Bonus sein.
Chris zieht sich um, setzt seine Boxhandschuhe auf und trommelt ein paar Schläge gegen die Wand. Dann der Ringsprecher...
Chris hört seinen Namen... es geht los. Ein kurzes Gebet, er schaut nach oben und sagt: "Das ist für dich Chuck!"
Der Gang zum Ring, begleitet durch Fangesang und Fangeschrei seiner Anhänger "Chris, Chris, Chris", aber auch durch Buhrufe der Anhänger des Champions: "Geh nach Hause du Lusche!" "Du kannst nicht gewinnen!"
"Der Champ ist der Champ!"
Chris steht im Ring, dann kommt der Champion in den Ring. Sein Gang wird ebenfalls begleitet von Fangesang und Fangeschrei. Viel lauter als bei ihm. Seine Fans schreien sich die Kehle aus dem Hals, aber sie sind nicht zu hören. Sie werden übertönt.
Chris steht dem Champion gegenüber, jetzt spürt er wieder diese Angst, die er in seinem allerersten Kampf verspürte.
Eigentlich würde er jetzt lieber nach Hause gehen. "Jetzt bist du dran" sprach der Champ.
Chris geht in seine Ecke, sein Trainer klopft ihm auf die Schulter und sagt: 
"Niemand hat es mehr verdient als du. Du wirst das schaffen, also hol dir den Gürtel!"
Der Gong ertönt, die erste Runde... von insgesamt 15 Runden.
Der Champ legt sofort los, will zeigen wer hier das Sagen hat und sich Respekt verschaffen.
Respekt hat Chris sowieso. Dann ein Schlag, direkt ans Kinn. Chris war nicht konzentriert genug. Er geht zu Boden.
"Steh auf Junge, steh jetzt wieder auf!"  Genau dieselben Worte, die er in seinem allerersten Kampf von seinem Trainer zu hören bekam. War das ein Zeichen? Schließlich hatte er diesen Kampf verloren. Es war seine einzige Niederlage.
Wird er jetzt wieder verlieren, weil er dieselben Worte hörte als er am Boden lag?
Chris steht auf, wieder eine harte Schlagserie die ihn trifft. Diesmal bleibt Chris stehen.
Die Ringglocke... kurze Pause... Die braucht Chris auch um sich zu sammeln.
"Chris, wo bist du gerade? Jedenfalls nicht hier! Du musst dich konzentrieren. Jetzt geh da rein und
gib alles. Gib all deine Wut, gib all dein Herz und all deine Liebe."
Runde 2
Runde 3
Die nächste Runde und die nächste Runde und die nächste...
Chris findet immer besser in den Kampf. Er ist von Runde zu Runde konzentrierter und seine Aufregung legt sich langsam.
Jeder der beiden Boxer muss harte Treffer einstecken, aber Chris kann auch austeilen. Der Champ landet die besseren Treffer und kann mehr einstecken als Chris.
14 Runden sind vollbracht. Beide Boxer sind gezeichnet. Chris kann sich kaum noch auf den Beinen halten.
Die Arme schmerzen, er kann sie kaum noch hochhalten.
Der Gong ertönt ein letztes Mal. 15. Runde...
Der Champ legt wieder sofort los. Chris hält schmerzend die Deckung hoch. Hier ein Schlag, da ein Schlag. Jeder steckt ein, jeder teilt aus.
Dann kann Chris einen Treffer landen, bisher sein bester Treffer in diesem Fight. Der Champ geht zu Boden.
"9 - 8 - 7 - 6 - 5 - 4 - 3 - 2"  Der Champ steht wieder, wackelt aber auf den Beinen.
Chris landet erneut einen Treffer, direkt ans Kinn. Wieder geht der Champ zu Boden. Bisher musste der Champ noch nie zweimal zu Boden gehen.
Das kannte er nur von seinen Gegnern.
"9 - 8 - 7 - 6 - 5 - 4 - 3 - 2 - 1..." - Aus! Der Kampf ist vorbei. Chris hat seinen ersten Titelkampf direkt gewonnen. Die Halle jubelt. Die Fans des Gegners sind verstummt.
"King Chris, King Chris, King Chris!" hallt es durch die Arena... Seine Fans sind laut wie nie zuvor. Unendlicher Jubel. Sein Trainer stürmt auf ihn zu, hebt ihn hoch: "Du hast es geschafft. Du hast es wirklich geschafft!" Chris ist der neue Champion.
"Ladies and Gentlemen, the new heavyweight Champion of the world... Chris!"
"King Chris, King Chris, King Chris!" hallt es erneut durch die Arena...
Jetzt ist Chris angekommen. Jetzt ist er der Champion, den andere Kinder heimlich nachts im TV sehen können und den sie bestaunen und bewundern können, genau wie er damals, als er noch klein und unscheinbar war. Und den sie sich als Vorbild nehmen können, wenn sie einen Traum verfolgen.
Chris geht nach Hause. Seine Freundin wartet bereits auf ihn. Er legt sich ins Bett, schaut nach oben und sagt:
"Das ist für dich Chuck!"`}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
