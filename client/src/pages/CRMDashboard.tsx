import { trpc } from "@/lib/trpc";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  Link2, Users, Handshake, Building2, RefreshCw, CheckCircle2,
  XCircle, Clock, ArrowUpRight, Activity, Zap, BarChart3,
  Phone, Mail, Globe, AlertTriangle, Loader2
} from "lucide-react";
import { useState } from "react";

export default function CRMDashboard() {
  const { t, isRTL } = useLanguage();
  const [activeTab, setActiveTab] = useState("overview");

  // Queries
  const statusQuery = trpc.hubspotCRM.status.useQuery(undefined, { retry: 1 });
  const crmStatsQuery = trpc.hubspotCRM.crmStats.useQuery(undefined, { retry: 1 });
  const contactsQuery = trpc.hubspotCRM.contacts.useQuery(undefined, { retry: 1, enabled: activeTab === "contacts" || activeTab === "overview" });
  const dealsQuery = trpc.hubspotCRM.deals.useQuery(undefined, { retry: 1, enabled: activeTab === "deals" || activeTab === "overview" });
  const companiesQuery = trpc.hubspotCRM.companies.useQuery(undefined, { retry: 1, enabled: activeTab === "companies" });
  const syncLogsQuery = trpc.hubspotCRM.syncLogs.useQuery(undefined, { retry: 1, enabled: activeTab === "sync-log" });

  // Mutations
  const bulkSyncLeads = trpc.hubspotCRM.bulkSyncLeads.useMutation({
    onSuccess: (data) => {
      toast.success(isRTL ? `تم مزامنة ${data.synced} من ${data.total} مستثمر` : `Synced ${data.synced} of ${data.total} leads`);
      syncLogsQuery.refetch();
      statusQuery.refetch();
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  const bulkSyncBookings = trpc.hubspotCRM.bulkSyncBookings.useMutation({
    onSuccess: (data) => {
      toast.success(isRTL ? `تم مزامنة ${data.synced} من ${data.total} حجز` : `Synced ${data.synced} of ${data.total} bookings`);
      syncLogsQuery.refetch();
      statusQuery.refetch();
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  const isConnected = statusQuery.data?.connection?.connected;
  const syncStats = statusQuery.data?.syncStats;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Link2 className="h-6 w-6 text-amber-500" />
            {isRTL ? "لوحة إدارة علاقات العملاء" : "CRM Dashboard"}
          </h1>
          <p className="text-muted-foreground mt-1">
            {isRTL ? "مزامنة تلقائية مع HubSpot CRM — جهات الاتصال والصفقات والشركات" : "Auto-sync with HubSpot CRM — Contacts, Deals & Companies"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isConnected ? (
            <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 gap-1">
              <CheckCircle2 className="h-3 w-3" />
              {isRTL ? "متصل" : "Connected"}
            </Badge>
          ) : (
            <Badge variant="destructive" className="gap-1">
              <XCircle className="h-3 w-3" />
              {isRTL ? "غير متصل" : "Disconnected"}
            </Badge>
          )}
        </div>
      </div>

      {/* Connection Warning */}
      {!isConnected && !statusQuery.isLoading && (
        <Card className="border-amber-500/30 bg-amber-500/5">
          <CardContent className="flex items-center gap-3 py-4">
            <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0" />
            <div>
              <p className="font-medium text-amber-400">
                {isRTL ? "HubSpot غير متصل" : "HubSpot Not Connected"}
              </p>
              <p className="text-sm text-muted-foreground">
                {isRTL
                  ? "يرجى إضافة HUBSPOT_ACCESS_TOKEN في إعدادات المشروع لتفعيل المزامنة التلقائية"
                  : "Please add HUBSPOT_ACCESS_TOKEN in project settings to enable auto-sync"}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatsCard
          icon={<Users className="h-5 w-5" />}
          label={isRTL ? "جهات الاتصال" : "Contacts"}
          value={crmStatsQuery.data?.totalContacts ?? "—"}
          color="text-blue-400"
          bgColor="bg-blue-500/10"
          loading={crmStatsQuery.isLoading}
        />
        <StatsCard
          icon={<Handshake className="h-5 w-5" />}
          label={isRTL ? "الصفقات" : "Deals"}
          value={crmStatsQuery.data?.totalDeals ?? "—"}
          color="text-emerald-400"
          bgColor="bg-emerald-500/10"
          loading={crmStatsQuery.isLoading}
        />
        <StatsCard
          icon={<Building2 className="h-5 w-5" />}
          label={isRTL ? "الشركات" : "Companies"}
          value={crmStatsQuery.data?.totalCompanies ?? "—"}
          color="text-purple-400"
          bgColor="bg-purple-500/10"
          loading={crmStatsQuery.isLoading}
        />
        <StatsCard
          icon={<Activity className="h-5 w-5" />}
          label={isRTL ? "عمليات المزامنة" : "Sync Operations"}
          value={syncStats?.total ?? "—"}
          color="text-amber-400"
          bgColor="bg-amber-500/10"
          loading={statusQuery.isLoading}
        />
      </div>

      {/* Sync Status Mini Cards */}
      {syncStats && syncStats.total > 0 && (
        <div className="grid grid-cols-3 gap-3">
          <div className="flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <div>
              <p className="text-xs text-muted-foreground">{isRTL ? "ناجحة" : "Success"}</p>
              <p className="text-lg font-bold text-emerald-400">{syncStats.success}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/5 p-3">
            <XCircle className="h-4 w-4 text-red-400" />
            <div>
              <p className="text-xs text-muted-foreground">{isRTL ? "فاشلة" : "Failed"}</p>
              <p className="text-lg font-bold text-red-400">{syncStats.failed}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-yellow-500/20 bg-yellow-500/5 p-3">
            <Clock className="h-4 w-4 text-yellow-400" />
            <div>
              <p className="text-xs text-muted-foreground">{isRTL ? "معلقة" : "Pending"}</p>
              <p className="text-lg font-bold text-yellow-400">{syncStats.pending}</p>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Sync Actions */}
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Zap className="h-4 w-4 text-amber-500" />
            {isRTL ? "إجراءات المزامنة" : "Sync Actions"}
          </CardTitle>
          <CardDescription>
            {isRTL ? "مزامنة البيانات يدوياً مع HubSpot CRM" : "Manually sync data with HubSpot CRM"}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button
            onClick={() => bulkSyncLeads.mutate()}
            disabled={bulkSyncLeads.isPending || !isConnected}
            className="bg-blue-600 hover:bg-blue-700 gap-2"
          >
            {bulkSyncLeads.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Users className="h-4 w-4" />}
            {isRTL ? "مزامنة المستثمرين" : "Sync Investor Leads"}
          </Button>
          <Button
            onClick={() => bulkSyncBookings.mutate()}
            disabled={bulkSyncBookings.isPending || !isConnected}
            className="bg-emerald-600 hover:bg-emerald-700 gap-2"
          >
            {bulkSyncBookings.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Handshake className="h-4 w-4" />}
            {isRTL ? "مزامنة الحجوزات" : "Sync Bookings"}
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              statusQuery.refetch();
              crmStatsQuery.refetch();
              contactsQuery.refetch();
              dealsQuery.refetch();
            }}
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            {isRTL ? "تحديث" : "Refresh"}
          </Button>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full justify-start bg-background border border-border/50 overflow-x-auto">
          <TabsTrigger value="overview" className="gap-1.5">
            <BarChart3 className="h-3.5 w-3.5" />
            {isRTL ? "نظرة عامة" : "Overview"}
          </TabsTrigger>
          <TabsTrigger value="contacts" className="gap-1.5">
            <Users className="h-3.5 w-3.5" />
            {isRTL ? "جهات الاتصال" : "Contacts"}
          </TabsTrigger>
          <TabsTrigger value="deals" className="gap-1.5">
            <Handshake className="h-3.5 w-3.5" />
            {isRTL ? "الصفقات" : "Deals"}
          </TabsTrigger>
          <TabsTrigger value="companies" className="gap-1.5">
            <Building2 className="h-3.5 w-3.5" />
            {isRTL ? "الشركات" : "Companies"}
          </TabsTrigger>
          <TabsTrigger value="sync-log" className="gap-1.5">
            <Activity className="h-3.5 w-3.5" />
            {isRTL ? "سجل المزامنة" : "Sync Log"}
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4 mt-4">
          <div className="grid md:grid-cols-2 gap-4">
            {/* Recent Contacts */}
            <Card className="border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Users className="h-4 w-4 text-blue-400" />
                  {isRTL ? "آخر جهات الاتصال" : "Recent Contacts"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {contactsQuery.isLoading ? (
                  <div className="flex items-center justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
                ) : contactsQuery.data?.results?.length ? (
                  <div className="space-y-3">
                    {contactsQuery.data.results.slice(0, 5).map((contact: any) => (
                      <div key={contact.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="h-9 w-9 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400 text-sm font-bold shrink-0">
                          {(contact.properties?.firstname?.[0] || contact.properties?.email?.[0] || "?").toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium truncate">
                            {[contact.properties?.firstname, contact.properties?.lastname].filter(Boolean).join(" ") || contact.properties?.email || "—"}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            {contact.properties?.email && (
                              <span className="flex items-center gap-1 truncate"><Mail className="h-3 w-3" />{contact.properties.email}</span>
                            )}
                            {contact.properties?.phone && (
                              <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{contact.properties.phone}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-6">{isRTL ? "لا توجد جهات اتصال" : "No contacts found"}</p>
                )}
              </CardContent>
            </Card>

            {/* Recent Deals */}
            <Card className="border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Handshake className="h-4 w-4 text-emerald-400" />
                  {isRTL ? "آخر الصفقات" : "Recent Deals"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {dealsQuery.isLoading ? (
                  <div className="flex items-center justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
                ) : dealsQuery.data?.results?.length ? (
                  <div className="space-y-3">
                    {dealsQuery.data.results.slice(0, 5).map((deal: any) => (
                      <div key={deal.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="h-9 w-9 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0">
                          <Handshake className="h-4 w-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium truncate">{deal.properties?.dealname || "—"}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            {deal.properties?.amount && (
                              <span className="text-emerald-400 font-medium">{Number(deal.properties.amount).toLocaleString()} SAR</span>
                            )}
                            <Badge variant="outline" className="text-[10px] h-4 px-1">
                              {deal.properties?.dealstage || "—"}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-6">{isRTL ? "لا توجد صفقات" : "No deals found"}</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Contacts Tab */}
        <TabsContent value="contacts" className="mt-4">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-400" />
                {isRTL ? "جهات الاتصال في HubSpot" : "HubSpot Contacts"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {contactsQuery.isLoading ? (
                <div className="flex items-center justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
              ) : contactsQuery.data?.results?.length ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border/50">
                        <th className={`py-3 px-3 ${isRTL ? "text-right" : "text-left"} text-muted-foreground font-medium`}>{isRTL ? "الاسم" : "Name"}</th>
                        <th className={`py-3 px-3 ${isRTL ? "text-right" : "text-left"} text-muted-foreground font-medium`}>{isRTL ? "البريد" : "Email"}</th>
                        <th className={`py-3 px-3 ${isRTL ? "text-right" : "text-left"} text-muted-foreground font-medium`}>{isRTL ? "الهاتف" : "Phone"}</th>
                        <th className={`py-3 px-3 ${isRTL ? "text-right" : "text-left"} text-muted-foreground font-medium`}>{isRTL ? "الشركة" : "Company"}</th>
                        <th className={`py-3 px-3 ${isRTL ? "text-right" : "text-left"} text-muted-foreground font-medium`}>{isRTL ? "المدينة" : "City"}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {contactsQuery.data.results.map((contact: any) => (
                        <tr key={contact.id} className="border-b border-border/30 hover:bg-muted/30 transition-colors">
                          <td className="py-3 px-3 font-medium">
                            {[contact.properties?.firstname, contact.properties?.lastname].filter(Boolean).join(" ") || "—"}
                          </td>
                          <td className="py-3 px-3 text-muted-foreground">{contact.properties?.email || "—"}</td>
                          <td className="py-3 px-3 text-muted-foreground" dir="ltr">{contact.properties?.phone || "—"}</td>
                          <td className="py-3 px-3 text-muted-foreground">{contact.properties?.company || "—"}</td>
                          <td className="py-3 px-3 text-muted-foreground">{contact.properties?.city || "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <EmptyState icon={<Users className="h-12 w-12" />} title={isRTL ? "لا توجد جهات اتصال" : "No Contacts"} description={isRTL ? "قم بمزامنة المستثمرين لإنشاء جهات اتصال في HubSpot" : "Sync investor leads to create contacts in HubSpot"} />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Deals Tab */}
        <TabsContent value="deals" className="mt-4">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Handshake className="h-5 w-5 text-emerald-400" />
                {isRTL ? "الصفقات في HubSpot" : "HubSpot Deals"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {dealsQuery.isLoading ? (
                <div className="flex items-center justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
              ) : dealsQuery.data?.results?.length ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border/50">
                        <th className={`py-3 px-3 ${isRTL ? "text-right" : "text-left"} text-muted-foreground font-medium`}>{isRTL ? "اسم الصفقة" : "Deal Name"}</th>
                        <th className={`py-3 px-3 ${isRTL ? "text-right" : "text-left"} text-muted-foreground font-medium`}>{isRTL ? "المبلغ" : "Amount"}</th>
                        <th className={`py-3 px-3 ${isRTL ? "text-right" : "text-left"} text-muted-foreground font-medium`}>{isRTL ? "المرحلة" : "Stage"}</th>
                        <th className={`py-3 px-3 ${isRTL ? "text-right" : "text-left"} text-muted-foreground font-medium`}>{isRTL ? "النوع" : "Type"}</th>
                        <th className={`py-3 px-3 ${isRTL ? "text-right" : "text-left"} text-muted-foreground font-medium`}>{isRTL ? "تاريخ الإغلاق" : "Close Date"}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dealsQuery.data.results.map((deal: any) => (
                        <tr key={deal.id} className="border-b border-border/30 hover:bg-muted/30 transition-colors">
                          <td className="py-3 px-3 font-medium">{deal.properties?.dealname || "—"}</td>
                          <td className="py-3 px-3 text-emerald-400 font-medium">
                            {deal.properties?.amount ? `${Number(deal.properties.amount).toLocaleString()} SAR` : "—"}
                          </td>
                          <td className="py-3 px-3">
                            <DealStageBadge stage={deal.properties?.dealstage} />
                          </td>
                          <td className="py-3 px-3 text-muted-foreground">{deal.properties?.dealtype || "—"}</td>
                          <td className="py-3 px-3 text-muted-foreground">
                            {deal.properties?.closedate ? new Date(deal.properties.closedate).toLocaleDateString() : "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <EmptyState icon={<Handshake className="h-12 w-12" />} title={isRTL ? "لا توجد صفقات" : "No Deals"} description={isRTL ? "قم بمزامنة الحجوزات لإنشاء صفقات في HubSpot" : "Sync bookings to create deals in HubSpot"} />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Companies Tab */}
        <TabsContent value="companies" className="mt-4">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-purple-400" />
                {isRTL ? "الشركات في HubSpot" : "HubSpot Companies"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {companiesQuery.isLoading ? (
                <div className="flex items-center justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
              ) : companiesQuery.data?.results?.length ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border/50">
                        <th className={`py-3 px-3 ${isRTL ? "text-right" : "text-left"} text-muted-foreground font-medium`}>{isRTL ? "اسم الشركة" : "Company"}</th>
                        <th className={`py-3 px-3 ${isRTL ? "text-right" : "text-left"} text-muted-foreground font-medium`}>{isRTL ? "النطاق" : "Domain"}</th>
                        <th className={`py-3 px-3 ${isRTL ? "text-right" : "text-left"} text-muted-foreground font-medium`}>{isRTL ? "الهاتف" : "Phone"}</th>
                        <th className={`py-3 px-3 ${isRTL ? "text-right" : "text-left"} text-muted-foreground font-medium`}>{isRTL ? "القطاع" : "Industry"}</th>
                        <th className={`py-3 px-3 ${isRTL ? "text-right" : "text-left"} text-muted-foreground font-medium`}>{isRTL ? "المدينة" : "City"}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {companiesQuery.data.results.map((company: any) => (
                        <tr key={company.id} className="border-b border-border/30 hover:bg-muted/30 transition-colors">
                          <td className="py-3 px-3 font-medium">{company.properties?.name || "—"}</td>
                          <td className="py-3 px-3 text-muted-foreground">
                            {company.properties?.domain ? (
                              <span className="flex items-center gap-1"><Globe className="h-3 w-3" />{company.properties.domain}</span>
                            ) : "—"}
                          </td>
                          <td className="py-3 px-3 text-muted-foreground" dir="ltr">{company.properties?.phone || "—"}</td>
                          <td className="py-3 px-3 text-muted-foreground">{company.properties?.industry || "—"}</td>
                          <td className="py-3 px-3 text-muted-foreground">{company.properties?.city || "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <EmptyState icon={<Building2 className="h-12 w-12" />} title={isRTL ? "لا توجد شركات" : "No Companies"} description={isRTL ? "سيتم إنشاء الشركات تلقائياً عند المزامنة" : "Companies will be created automatically during sync"} />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sync Log Tab */}
        <TabsContent value="sync-log" className="mt-4">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-amber-400" />
                {isRTL ? "سجل المزامنة" : "Sync Log"}
              </CardTitle>
              <CardDescription>
                {isRTL ? "تتبع جميع عمليات المزامنة مع HubSpot" : "Track all sync operations with HubSpot"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {syncLogsQuery.isLoading ? (
                <div className="flex items-center justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
              ) : syncLogsQuery.data?.length ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border/50">
                        <th className={`py-3 px-3 ${isRTL ? "text-right" : "text-left"} text-muted-foreground font-medium`}>{isRTL ? "النوع" : "Entity"}</th>
                        <th className={`py-3 px-3 ${isRTL ? "text-right" : "text-left"} text-muted-foreground font-medium`}>{isRTL ? "الكائن" : "Object"}</th>
                        <th className={`py-3 px-3 ${isRTL ? "text-right" : "text-left"} text-muted-foreground font-medium`}>{isRTL ? "الإجراء" : "Action"}</th>
                        <th className={`py-3 px-3 ${isRTL ? "text-right" : "text-left"} text-muted-foreground font-medium`}>{isRTL ? "الحالة" : "Status"}</th>
                        <th className={`py-3 px-3 ${isRTL ? "text-right" : "text-left"} text-muted-foreground font-medium`}>HubSpot ID</th>
                        <th className={`py-3 px-3 ${isRTL ? "text-right" : "text-left"} text-muted-foreground font-medium`}>{isRTL ? "التاريخ" : "Date"}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {syncLogsQuery.data.map((log: any) => (
                        <tr key={log.id} className="border-b border-border/30 hover:bg-muted/30 transition-colors">
                          <td className="py-3 px-3">
                            <Badge variant="outline" className="text-xs">{log.entityType}</Badge>
                          </td>
                          <td className="py-3 px-3 text-muted-foreground">{log.hubspotObjectType}</td>
                          <td className="py-3 px-3">
                            <Badge variant="secondary" className="text-xs">{log.action}</Badge>
                          </td>
                          <td className="py-3 px-3">
                            <SyncStatusBadge status={log.status} />
                          </td>
                          <td className="py-3 px-3 text-muted-foreground font-mono text-xs">{log.hubspotObjectId || "—"}</td>
                          <td className="py-3 px-3 text-muted-foreground text-xs">
                            {new Date(log.syncedAt).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <EmptyState icon={<Activity className="h-12 w-12" />} title={isRTL ? "لا توجد سجلات" : "No Sync Logs"} description={isRTL ? "ستظهر السجلات هنا بعد أول عملية مزامنة" : "Logs will appear here after the first sync operation"} />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ============================================================
// Sub-components
// ============================================================

function StatsCard({ icon, label, value, color, bgColor, loading }: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color: string;
  bgColor: string;
  loading?: boolean;
}) {
  return (
    <Card className="border-border/50">
      <CardContent className="flex items-center gap-3 py-4">
        <div className={`h-10 w-10 rounded-lg ${bgColor} flex items-center justify-center ${color} shrink-0`}>
          {icon}
        </div>
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground mt-1" />
          ) : (
            <p className="text-xl font-bold">{value}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function DealStageBadge({ stage }: { stage?: string }) {
  const stageMap: Record<string, { label: string; className: string }> = {
    appointmentscheduled: { label: "Scheduled", className: "bg-blue-500/10 text-blue-400 border-blue-500/30" },
    qualifiedtobuy: { label: "Qualified", className: "bg-cyan-500/10 text-cyan-400 border-cyan-500/30" },
    presentationscheduled: { label: "Presentation", className: "bg-purple-500/10 text-purple-400 border-purple-500/30" },
    decisionmakerboughtin: { label: "Decision", className: "bg-amber-500/10 text-amber-400 border-amber-500/30" },
    contractsent: { label: "Contract", className: "bg-orange-500/10 text-orange-400 border-orange-500/30" },
    closedwon: { label: "Won", className: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" },
    closedlost: { label: "Lost", className: "bg-red-500/10 text-red-400 border-red-500/30" },
  };
  const info = stageMap[stage || ""] || { label: stage || "—", className: "bg-muted text-muted-foreground" };
  return <Badge variant="outline" className={`text-[10px] ${info.className}`}>{info.label}</Badge>;
}

function SyncStatusBadge({ status }: { status: string }) {
  if (status === "success") return <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 text-[10px]"><CheckCircle2 className="h-3 w-3 mr-1" />Success</Badge>;
  if (status === "failed") return <Badge variant="destructive" className="text-[10px]"><XCircle className="h-3 w-3 mr-1" />Failed</Badge>;
  return <Badge variant="secondary" className="text-[10px]"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
}

function EmptyState({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
      <div className="mb-4 opacity-30">{icon}</div>
      <p className="font-medium text-foreground">{title}</p>
      <p className="text-sm mt-1">{description}</p>
    </div>
  );
}
