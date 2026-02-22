import React from 'react';
import { translations } from './translations/translations';
import { AuthProvider } from './contexts/AuthContext';
import HomePage from './pages/HomePage';
import ArtistProfilePage from './pages/ArtistProfilePage';
import ProjectsPage from './pages/ProjectsPage';
import ProjectWeStandTogetherPage from './pages/ProjectWeStandTogetherPage';
import ProjectKingChrisPage from './pages/ProjectKingChrisPage';
import KingChrisStoryPage from './pages/KingChrisStoryPage';
import WeStandTogetherStoryPage from './pages/WeStandTogetherStoryPage';

// ...existing code...

class AppContent extends React.Component {
  constructor(props) {
    super(props);
    
    // URL-Parameter auslesen für Direktlinks
    const urlParams = new URLSearchParams(window.location.search);
    const pageParam = urlParams.get('page');
    const hashParam = window.location.hash.replace('#', '');
    const initialPage = pageParam || hashParam || 'home';
    
    this.state = {
      currentPage: initialPage,
      language: 'de',
    };
  }

  setCurrentPage = (page) => {
    this.setState({ currentPage: page });
    // URL aktualisieren für Direktlinks
    if (page !== 'home') {
      window.history.pushState({}, '', `?page=${page}`);
    } else {
      window.history.pushState({}, '', window.location.pathname);
    }
  };

  setLanguage = (lang) => {
    this.setState({ language: lang });
  };

  render() {
    const { currentPage, language } = this.state;
    const t = translations[language];
    switch (currentPage) {
      case 'home':
        return <HomePage t={t} language={language} setLanguage={this.setLanguage} setCurrentPage={this.setCurrentPage} />;
      case 'artistProfile':
        return <ArtistProfilePage t={t} language={language} setCurrentPage={this.setCurrentPage} />;
      case 'projects':
        return <ProjectsPage t={t} language={language} setCurrentPage={this.setCurrentPage} />;
      case 'projectWeStandTogether':
        return <ProjectWeStandTogetherPage t={t} setCurrentPage={this.setCurrentPage} />;
      case 'weStandTogetherStory':
        return <WeStandTogetherStoryPage t={t} setCurrentPage={this.setCurrentPage} />;
      case 'projectKingChris':
        return <ProjectKingChrisPage t={t} setCurrentPage={this.setCurrentPage} />;
      case 'kingChrisStory':
        return <KingChrisStoryPage t={t} setCurrentPage={this.setCurrentPage} />;
      case 'uffMusik':
        const UFF_Musik = require('./pages/UFF_Musik').default;
        return <UFF_Musik t={t} setCurrentPage={this.setCurrentPage} />;
      case 'musikShop':
        const MusikShopPage = require('./pages/MusikShopPage').default;
        return <MusikShopPage t={t} setCurrentPage={this.setCurrentPage} />;
      case 'musikShopKingChris':
        const MusikShop_King_Chris_Page = require('./pages/MusikShop_King_Chris_Page').default;
        return <MusikShop_King_Chris_Page t={t} setCurrentPage={this.setCurrentPage} />;
      case 'musikShopPOFriendsGoesCountry':
        const MusikShop_PO_Friends_Goes_Country_Page = require('./pages/MusikShop_PO_Friends_Goes_Country_Page').default;
        return <MusikShop_PO_Friends_Goes_Country_Page t={t} setCurrentPage={this.setCurrentPage} />;
      case 'musikShopLoveBeyondTheSilence':
        const MusikShop_Love_Beyond_The_Silence_Page = require('./pages/MusikShop_Love_Beyond_The_Silence_Page').default;
        return <MusikShop_Love_Beyond_The_Silence_Page t={t} setCurrentPage={this.setCurrentPage} />;
      case 'musikShopWeStandTogether':
        const MusikShop_We_Stand_Together_Page = require('./pages/MusikShop_We_Stand_Together_Page').default;
        return <MusikShop_We_Stand_Together_Page t={t} setCurrentPage={this.setCurrentPage} />;
      case 'musikShopPrinceOElyria':
        const MusikShop_Prince_o_Elyria_Page = require('./pages/MusikShop_Prince_o_Elyria_Page').default;
        return <MusikShop_Prince_o_Elyria_Page t={t} setCurrentPage={this.setCurrentPage} />;
      case 'musikShopTheAstronaut':
        const MusikShop_The_Astronaut_Page = require('./pages/MusikShop_The_Astronaut_Page').default;
        return <MusikShop_The_Astronaut_Page t={t} setCurrentPage={this.setCurrentPage} />;
      default:
        return <HomePage t={t} language={language} setLanguage={this.setLanguage} setCurrentPage={this.setCurrentPage} />;
    }
  }
}


function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
