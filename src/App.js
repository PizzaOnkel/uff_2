import React from 'react';
import { translations } from './translations/translations';
import { AuthProvider } from './contexts/AuthContext';
import AdminDashboard from './pages/AdminDashboard';
import AdminDashboard2 from './pages/AdminDashboard2';
import HomePage from './pages/HomePage';
import InfoPage from './pages/InfoPage';
import NavigationPage from './pages/NavigationPage';
import AdminPanelPage from './pages/AdminPanelPage';
import ManagePlayersPage from './pages/ManagePlayersPage';
import ManageRanksPage from './pages/ManageRanksPage';
import ManageTroopStrengthsPage from './pages/ManageTroopStrengthsPage';
import ManageNormsPage from './pages/ManageNormsPage';
import ManageChestMappingPage from './pages/ManageChestMappingPage';
import AdminRegistrationPage from './pages/AdminRegistrationPage';
import ManageAdminRequestsPage from './pages/ManageAdminRequestsPage';
import ManageAdministratorsPage from './pages/ManageAdministratorsPage';
import CreatePeriodPage from './pages/CreatePeriodPage';
import UploadResultsPage from './pages/UploadResultsPage';
import ContactFormPage from './pages/ContactFormPage';
import EmailTestPage from './pages/EmailTestPage';
import ComingSoonPage from './pages/ComingSoonPage';
import AdminLoginPage from './pages/AdminLoginPage';
import CurrentTotalEventPage from './pages/CurrentTotalEventPage';
import TopTen from './pages/TopTen';
import TopTenCategory from './pages/TopTenCategory';
import AdminDebugPage from './pages/AdminDebugPage';

// ...existing code...

class AppContent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      currentPage: 'home',
      language: 'de',
    };
  }

  setCurrentPage = (page) => {
    this.setState({ currentPage: page });
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
      case 'info':
        return <InfoPage t={t} setCurrentPage={this.setCurrentPage} />;
      case 'navigation':
        return <NavigationPage t={t} setCurrentPage={this.setCurrentPage} />;
      case 'adminDashboard':
        return <AdminDashboard setCurrentPage={this.setCurrentPage} />;
      case 'adminDashboard2':
        return <AdminDashboard2 setCurrentPage={this.setCurrentPage} />;
      case 'adminPanel':
        return <AdminPanelPage t={t} setCurrentPage={this.setCurrentPage} />;
      case 'managePlayers':
        return <ManagePlayersPage setCurrentPage={this.setCurrentPage} />;
      case 'manageRanks':
        return <ManageRanksPage setCurrentPage={this.setCurrentPage} />;
      case 'manageTroopStrengths':
        return <ManageTroopStrengthsPage t={t} setCurrentPage={this.setCurrentPage} />;
      case 'manageNorms':
        return <ManageNormsPage t={t} setCurrentPage={this.setCurrentPage} />;
      case 'manageChestMapping':
        return <ManageChestMappingPage t={t} setCurrentPage={this.setCurrentPage} />;
      case 'adminRegistration':
        return <AdminRegistrationPage t={t} setCurrentPage={this.setCurrentPage} />;
      case 'manageAdminRequests':
        return <ManageAdminRequestsPage t={t} setCurrentPage={this.setCurrentPage} />;
      case 'manageAdministrators':
        return <ManageAdministratorsPage t={t} setCurrentPage={this.setCurrentPage} />;
      case 'createPeriod':
        return <CreatePeriodPage t={t} setCurrentPage={this.setCurrentPage} />;
      case 'uploadResults':
        return <UploadResultsPage setCurrentPage={this.setCurrentPage} />;
      case 'contactForm':
        return <ContactFormPage t={t} setCurrentPage={this.setCurrentPage} />;
      case 'emailTest':
        return <EmailTestPage t={t} setCurrentPage={this.setCurrentPage} />;
      case 'adminLogin':
        return <AdminLoginPage setCurrentPage={this.setCurrentPage} />;
      case 'adminDebug':
        return <AdminDebugPage t={t} setCurrentPage={this.setCurrentPage} />;
      case 'currentTotalEvent':
        return <CurrentTotalEventPage t={t} setCurrentPage={this.setCurrentPage} />;
      case 'standardsEvaluation':
        return <ComingSoonPage t={t} setCurrentPage={this.setCurrentPage} title={t.standardsEvaluationTitle} backPage="navigation" />;
      case 'eventArchive':
        return <ComingSoonPage t={t} setCurrentPage={this.setCurrentPage} title={t.eventArchiveTitle} backPage="navigation" />;
      case 'topTen':
        return <TopTen t={t} setCurrentPage={this.setCurrentPage} />;
      case 'topTenArena':
        return <TopTenCategory setCurrentPage={this.setCurrentPage} category="Arena Total" categoryInfo={{ label: 'Arena Chests', icon: '⚔️', color: '#7C3AED' }} />;
      case 'topTenCommon':
        return <TopTenCategory setCurrentPage={this.setCurrentPage} category="Common Total" categoryInfo={{ label: 'Common Chests', icon: '📦', color: '#10B981' }} />;
      case 'topTenRare':
        return <TopTenCategory setCurrentPage={this.setCurrentPage} category="Rare Total" categoryInfo={{ label: 'Rare Chests', icon: '💎', color: '#3B82F6' }} />;
      case 'topTenEpic':
        return <TopTenCategory setCurrentPage={this.setCurrentPage} category="Epic Total" categoryInfo={{ label: 'Epic Chests', icon: '👑', color: '#8B5CF6' }} />;
      case 'topTenTartaros':
        return <TopTenCategory setCurrentPage={this.setCurrentPage} category="Tartaros Total" categoryInfo={{ label: 'Tartaros Chests', icon: '🔥', color: '#DC2626' }} />;
      case 'topTenElven':
        return <TopTenCategory setCurrentPage={this.setCurrentPage} category="Elven Total" categoryInfo={{ label: 'Elven Chests', icon: '🧝', color: '#059669' }} />;
      case 'topTenCursed':
        return <TopTenCategory setCurrentPage={this.setCurrentPage} category="Cursed Total" categoryInfo={{ label: 'Cursed Chests', icon: '🌙', color: '#6B46C1' }} />;
      case 'topTenBank':
        return <TopTenCategory setCurrentPage={this.setCurrentPage} category="Bank Total" categoryInfo={{ label: 'Bank Chests', icon: '💰', color: '#D97706' }} />;
      case 'topTenRunic':
        return <TopTenCategory setCurrentPage={this.setCurrentPage} category="Runic Total" categoryInfo={{ label: 'Runic Chests', icon: '🔮', color: '#F97316' }} />;
      case 'topTenHeroic':
        return <TopTenCategory setCurrentPage={this.setCurrentPage} category="Heroic Total" categoryInfo={{ label: 'Heroic Chests', icon: '🏆', color: '#EF4444' }} />;
      case 'topTenVota':
        return <TopTenCategory setCurrentPage={this.setCurrentPage} category="VotA Total" categoryInfo={{ label: 'Vault of the Ancients', icon: '🏛️', color: '#8B5CF6' }} />;
      case 'topTenRota':
        return <TopTenCategory setCurrentPage={this.setCurrentPage} category="ROTA Total" categoryInfo={{ label: 'Rise of the Ancients', icon: '🌟', color: '#EC4899' }} />;
      case 'topTenEas':
        return <TopTenCategory setCurrentPage={this.setCurrentPage} category="EAs Total" categoryInfo={{ label: 'Epic Ancient Squad', icon: '⚡', color: '#F59E0B' }} />;
      case 'topTenUnion':
        return <TopTenCategory setCurrentPage={this.setCurrentPage} category="Union Total" categoryInfo={{ label: 'Union Chests', icon: '🤝', color: '#6366F1' }} />;
      case 'topTenJormungandr':
        return <TopTenCategory setCurrentPage={this.setCurrentPage} category="Jormungandr Total" categoryInfo={{ label: 'Jormungandr Chests', icon: '🐉', color: '#059669' }} />;
      case 'hallOfChampions':
        return <ComingSoonPage t={t} setCurrentPage={this.setCurrentPage} title={t.hallOfChampionsTitle} backPage="navigation" />;
      case 'currentTotalEventAdmin':
        return <ComingSoonPage t={t} setCurrentPage={this.setCurrentPage} title={t.currentTotalEventTitle} backPage="adminPanel" />;
      case 'eventArchiveAdmin':
        return <ComingSoonPage t={t} setCurrentPage={this.setCurrentPage} title={t.eventArchiveTitle} backPage="adminPanel" />;
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
