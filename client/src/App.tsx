import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import DashboardLayout from "./components/DashboardLayout";
import LandingPage from "./pages/LandingPage";
import Home from "./pages/Home";
import Exhibitions from "./pages/Exhibitions";
import Bookings from "./pages/Bookings";
import Payments from "./pages/Payments";
import ExhibitionMap from "./pages/ExhibitionMap";
import ROICalculator from "./pages/ROICalculator";
import Analytics from "./pages/Analytics";
import Notifications from "./pages/Notifications";
import Marketplace from "./pages/Marketplace";
import Portfolio from "./pages/Portfolio";
import DigitalTwin from "./pages/DigitalTwin";
import LiveEconomy from "./pages/LiveEconomy";
import AIAdvisor from "./pages/AIAdvisor";
import FinancialCenter from "./pages/FinancialCenter";
import DocumentVault from "./pages/DocumentVault";
import InvestorProfile from "./pages/InvestorProfile";
import Communications from "./pages/Communications";
import DealRoom from "./pages/DealRoom";
import Contracts from "./pages/Contracts";
import InvestorLogin from "./pages/InvestorLogin";
import CRMDashboard from "./pages/CRMDashboard";

function DashboardRouter() {
  return (
    <DashboardLayout>
        <Switch>
          <Route path="/dashboard" component={Home} />
          {/* Core Operations */}
          <Route path="/exhibitions" component={Exhibitions} />
          <Route path="/bookings" component={Bookings} />
          <Route path="/contracts" component={Contracts} />
          <Route path="/payments" component={Payments} />
          {/* Investment Intelligence */}
          <Route path="/marketplace" component={Marketplace} />
          <Route path="/deal-room" component={DealRoom} />
          <Route path="/portfolio" component={Portfolio} />
          {/* Analytics & AI */}
          <Route path="/analytics" component={Analytics} />
          <Route path="/digital-twin" component={DigitalTwin} />
          <Route path="/live-economy" component={LiveEconomy} />
          <Route path="/ai-advisor" component={AIAdvisor} />
          <Route path="/roi-calculator" component={ROICalculator} />
          {/* CRM Integration */}
          <Route path="/crm" component={CRMDashboard} />
          {/* Management */}
          <Route path="/financial-center" component={FinancialCenter} />
          <Route path="/documents" component={DocumentVault} />
          <Route path="/communications" component={Communications} />
          <Route path="/map" component={ExhibitionMap} />
          <Route path="/notifications" component={Notifications} />
          <Route path="/profile" component={InvestorProfile} />
          <Route path="/404" component={NotFound} />
          <Route component={NotFound} />
        </Switch>
    </DashboardLayout>
  );
}

function Router() {
  return (
    <Switch>
      {/* Public Pages */}
      <Route path="/" component={LandingPage} />
      <Route path="/investor-login" component={InvestorLogin} />
      {/* Dashboard & all internal routes */}
      <Route path="/dashboard" component={DashboardRouter} />
      <Route path="/exhibitions" component={DashboardRouter} />
      <Route path="/bookings" component={DashboardRouter} />
      <Route path="/contracts" component={DashboardRouter} />
      <Route path="/payments" component={DashboardRouter} />
      <Route path="/marketplace" component={DashboardRouter} />
      <Route path="/deal-room" component={DashboardRouter} />
      <Route path="/portfolio" component={DashboardRouter} />
      <Route path="/analytics" component={DashboardRouter} />
      <Route path="/digital-twin" component={DashboardRouter} />
      <Route path="/live-economy" component={DashboardRouter} />
      <Route path="/ai-advisor" component={DashboardRouter} />
      <Route path="/roi-calculator" component={DashboardRouter} />
      <Route path="/financial-center" component={DashboardRouter} />
      <Route path="/documents" component={DashboardRouter} />
      <Route path="/communications" component={DashboardRouter} />
      <Route path="/map" component={DashboardRouter} />
      <Route path="/notifications" component={DashboardRouter} />
      <Route path="/crm" component={DashboardRouter} />
      <Route path="/profile" component={DashboardRouter} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark" switchable>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
