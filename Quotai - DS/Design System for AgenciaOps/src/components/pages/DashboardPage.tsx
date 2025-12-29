import { useState } from 'react';
import { DollarSign, TrendingUp, Users, FolderKanban, Filter, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import { KPICard } from '../KPICard';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { mockProjects } from '../../lib/mock-data';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

export function DashboardPage() {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [dateRange, setDateRange] = useState('last-30-days');

  // Calculate KPIs
  const totalRevenue = mockProjects.reduce((sum, p) => sum + p.total, 0);
  const avgMargin = mockProjects.reduce((sum, p) => sum + p.margin, 0) / mockProjects.length;
  const activeProjects = mockProjects.filter(p => ['draft', 'sent'].includes(p.status)).length;
  const wonRate = (mockProjects.filter(p => p.status === 'won').length / mockProjects.length) * 100;

  // Chart data
  const revenueByMonth = [
    { month: 'Jul', revenue: 45000 },
    { month: 'Aug', revenue: 52000 },
    { month: 'Sep', revenue: 48000 },
    { month: 'Oct', revenue: 61000 },
    { month: 'Nov', revenue: 58000 },
    { month: 'Dec', revenue: 67000 }
  ];

  const projectsByStatus = [
    { status: 'Draft', count: mockProjects.filter(p => p.status === 'draft').length },
    { status: 'Sent', count: mockProjects.filter(p => p.status === 'sent').length },
    { status: 'Won', count: mockProjects.filter(p => p.status === 'won').length },
    { status: 'Lost', count: mockProjects.filter(p => p.status === 'lost').length }
  ];

  // Top clients
  const topClients = [
    { name: 'Retail Giants Inc', revenue: 150000, projects: 1 },
    { name: 'Startup Innovations', revenue: 102000, projects: 1 },
    { name: 'Enterprise Solutions', revenue: 81600, projects: 1 },
    { name: 'Tech Corp Solutions', revenue: 54000, projects: 1 }
  ];

  return (
    <div className="space-y-6">
      {/* Filters Section */}
      <div className="bg-white rounded-xl border border-grey-200 overflow-hidden" style={{ boxShadow: 'var(--elevation-2)' }}>
        <button
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          className="w-full px-6 py-4 flex items-center justify-between hover:bg-grey-50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-grey-600" />
            <h3>Filters</h3>
            <span className="px-2 py-0.5 rounded-full bg-primary-100 text-primary-700 text-xs">
              1 active
            </span>
          </div>
          {isFilterOpen ? <ChevronUp className="w-5 h-5 text-grey-600" /> : <ChevronDown className="w-5 h-5 text-grey-600" />}
        </button>
        
        {isFilterOpen && (
          <div className="px-6 py-4 border-t border-grey-200 bg-grey-50">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="date-range" className="text-grey-700">Date Range</Label>
                <Select value={dateRange} onValueChange={setDateRange}>
                  <SelectTrigger id="date-range" className="mt-2 bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="last-7-days">Last 7 days</SelectItem>
                    <SelectItem value="last-30-days">Last 30 days</SelectItem>
                    <SelectItem value="last-90-days">Last 90 days</SelectItem>
                    <SelectItem value="this-year">This year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="status" className="text-grey-700">Status</Label>
                <Select defaultValue="all">
                  <SelectTrigger id="status" className="mt-2 bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="sent">Sent</SelectItem>
                    <SelectItem value="won">Won</SelectItem>
                    <SelectItem value="lost">Lost</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="client" className="text-grey-700">Client</Label>
                <Input
                  id="client"
                  placeholder="Search client..."
                  className="mt-2 bg-white"
                />
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              <Button className="bg-primary-500 hover:bg-primary-700 text-white">
                Apply Filters
              </Button>
              <Button variant="outline" className="border-grey-300">
                Clear
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="Total Revenue"
          value={`$${(totalRevenue / 1000).toFixed(0)}K`}
          description="From 8 projects"
          icon={DollarSign}
          change={{ value: 12.5, trend: 'up' }}
        />
        <KPICard
          title="Average Margin"
          value={`${avgMargin.toFixed(1)}%`}
          description="Across all quotes"
          icon={TrendingUp}
          change={{ value: 3.2, trend: 'up' }}
        />
        <KPICard
          title="Active Projects"
          value={activeProjects}
          description="In progress or sent"
          icon={FolderKanban}
        />
        <KPICard
          title="Win Rate"
          value={`${wonRate.toFixed(0)}%`}
          description="Of sent quotes"
          icon={Users}
          change={{ value: 5.0, trend: 'up' }}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-white rounded-xl border border-grey-200 p-6" style={{ boxShadow: 'var(--elevation-2)' }}>
          <div className="mb-6">
            <h3>Revenue Trend</h3>
            <p className="text-grey-600 mt-1">Monthly revenue over the last 6 months</p>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueByMonth}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--grey-200)" />
              <XAxis dataKey="month" stroke="var(--grey-600)" />
              <YAxis stroke="var(--grey-600)" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid var(--grey-200)',
                  borderRadius: '8px'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="revenue" 
                stroke="var(--primary-500)" 
                strokeWidth={2}
                dot={{ fill: 'var(--primary-500)' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Projects by Status */}
        <div className="bg-white rounded-xl border border-grey-200 p-6" style={{ boxShadow: 'var(--elevation-2)' }}>
          <div className="mb-6">
            <h3>Projects by Status</h3>
            <p className="text-grey-600 mt-1">Distribution of current projects</p>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={projectsByStatus}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--grey-200)" />
              <XAxis dataKey="status" stroke="var(--grey-600)" />
              <YAxis stroke="var(--grey-600)" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid var(--grey-200)',
                  borderRadius: '8px'
                }}
              />
              <Bar dataKey="count" fill="var(--primary-500)" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Clients Table */}
      <div className="bg-white rounded-xl border border-grey-200 overflow-hidden" style={{ boxShadow: 'var(--elevation-2)' }}>
        <div className="px-6 py-4 border-b border-grey-200">
          <h3>Top Clients</h3>
          <p className="text-grey-600 mt-1">Clients by total revenue</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-grey-50">
              <tr>
                <th className="px-6 py-4 text-left text-grey-700">Client</th>
                <th className="px-6 py-4 text-left text-grey-700">Revenue</th>
                <th className="px-6 py-4 text-left text-grey-700">Projects</th>
              </tr>
            </thead>
            <tbody>
              {topClients.map((client, index) => (
                <tr key={index} className="border-t border-grey-200 hover:bg-grey-50 transition-colors">
                  <td className="px-6 py-4 text-grey-900">{client.name}</td>
                  <td className="px-6 py-4 text-grey-900">${client.revenue.toLocaleString()}</td>
                  <td className="px-6 py-4 text-grey-900">{client.projects}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* AI Advisor */}
      <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-xl border border-primary-200 p-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-primary-500 rounded-lg">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-primary-900 mb-2">AI Advisor Insights</h3>
            <p className="text-primary-800 mb-4">
              Your win rate has increased by 5% this month. Consider focusing on similar project types
              to maintain this trend. Projects with margins above 35% are converting at a 75% higher rate.
            </p>
            <Button className="bg-primary-500 hover:bg-primary-700 text-white">
              View Full Report
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
