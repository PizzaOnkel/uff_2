export default function LanguageSelector({ language, setLanguage, t }) {
  const langs = [
    { code: 'de', flag: '🇩🇪', title: 'Deutsch' },
    { code: 'en', flag: '🇬🇧', title: 'English' },
    { code: 'fr', flag: '🇫🇷', title: 'Français' },
    { code: 'es', flag: '🇪🇸', title: 'Español' },
    { code: 'it', flag: '🇮🇹', title: 'Italiano' },
    { code: 'ru', flag: '🇷🇺', title: 'Русский' },
  ];
  return (
    <div className="mb-10 flex flex-col items-center">
      <p className="text-lg text-gray-300 mb-4">{t.chooseLanguage}</p>
      <div className="flex space-x-3">
        {langs.map(l => (
          <button
            key={l.code}
            onClick={() => setLanguage(l.code)}
            className={`p-3 rounded-lg transition-all duration-200 ${language === l.code ? 'bg-blue-700 shadow-md' : 'bg-gray-700 hover:bg-gray-600'} text-2xl`}
            title={l.title}
          >
            {l.flag}
          </button>
        ))}
      </div>
    </div>
  );
}