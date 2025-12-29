# Nougram - Usage Guide

## Quick Start

Welcome to **Nougram** - Your creative agency quote management platform!

---

## 🔐 Login

1. Open the application
2. You'll see the login screen with the Nougram logo
3. **Demo Access**: Enter any email and password to continue
4. Click "Sign In" and you'll be redirected to the Dashboard

---

## 📊 Dashboard

The Dashboard provides an overview of your agency's performance:

### Key Metrics (KPIs)
- **Total Revenue**: Sum of all project values
- **Average Margin**: Profitability across quotes
- **Active Projects**: Projects in draft or sent status
- **Win Rate**: Percentage of won vs. total sent quotes

### Filters
- Click the "Filters" section to expand
- Filter by date range, status, or client
- Apply filters to update all dashboard data
- Clear filters to reset

### Charts
- **Revenue Trend**: Line chart showing monthly revenue
- **Projects by Status**: Bar chart of project distribution

### Top Clients
- Table showing highest-revenue clients
- Includes project count per client

### AI Advisor
- AI-powered insights about your business
- Suggestions for improving win rate and margins

---

## 📁 Projects Page

Manage all your quotes and projects:

### Status Filters
Click any status card to filter projects:
- **All Projects**: Show everything
- **Draft**: Work in progress
- **Sent**: Awaiting client response
- **Won**: Accepted by client
- **Lost**: Declined by client

### Projects Table
Each row shows:
- Project name and ID
- Client name and email
- Status badge (color-coded)
- Total value and currency
- Margin percentage (color-coded by profitability)
- Creation date
- Action buttons

### Actions
- **Eye icon**: View project details
- **Pencil icon**: Edit project
- **Trash icon**: Delete project

### Create New Quote
Click the "New Quote" button (top right) to start creating a quote

---

## ➕ Create Quote Page

Build a comprehensive project quote:

### Step 1: Project Information

Fill in the basic details:
- **Project Name** (required): e.g., "Website Redesign for Tech Corp"
- **Client Name** (required): e.g., "Tech Corp Solutions"
- **Client Email** (optional): Contact email
- **Currency**: Select from USD, EUR, GBP, etc.
- **Include Taxes**: Toggle to add 20% tax

### Step 2: Add Services

1. Click "Add Service" button
2. Select a service from the dropdown (includes hourly rate)
3. Enter number of hours
4. Subtotal calculates automatically
5. Add multiple services as needed
6. Remove services with the trash icon

### Step 3: Review Summary

The right sidebar shows:
- **Subtotal**: Sum of all services
- **Taxes**: If enabled (20%)
- **Total**: Final amount
- **Estimated Margin**: Visual indicator
  - 🟢 Green (40%+): Excellent
  - 🟡 Yellow (30-39%): Good
  - 🔴 Red (<30%): Low

### Low Margin Warning
If margin is below 30%, you'll see a yellow warning suggesting rate adjustments

### Save Quote
- Click "Create Quote" when ready
- Form validates required fields
- Redirects to Projects page on success

---

## ⚙️ Settings

Configure your agency operations across 6 sections:

### 1. Costs
- Define hourly cost rates for roles
- Used for margin calculations
- Mark rates as active/inactive
- Categories: Development, Design, Management, etc.

**Example**: Senior Developer costs $90/hr

### 2. Services
- Manage your service catalog
- Set default hourly rates for each service
- Organize by category
- Used when creating quotes

**Example**: UI/UX Design charges $120/hr by default

### 3. Team
- Add team members
- Assign roles and costs
- Manage contact information
- Link members to cost rates

**Example**: Sarah Johnson - Senior Developer role

### 4. Currency
- Select default currency for new quotes
- Choose from 6 global currencies
- Visual cards show symbol and code

**Default**: USD ($)

### 5. Taxes
- Configure available tax rates
- Set a default tax rate
- Name and percentage for each
- Apply when creating quotes

**Example**: Standard VAT (20%) as default

### 6. Users & Roles
- Manage platform users
- Assign roles: Admin, Manager, Member
- Control access permissions
- Invite new users

**Roles**:
- Admin: Full access
- Manager: Create and manage quotes
- Member: View only

---

## 💡 Tips & Tricks

### Maximizing Profitability
1. Monitor your average margin on Dashboard
2. Use the low margin warning when creating quotes
3. Review services with consistently low margins
4. Adjust hourly rates in Settings → Services

### Efficient Quote Creation
1. Set up services in Settings first
2. Use consistent naming for clients
3. Save draft quotes and refine later
4. Include taxes early to avoid surprises

### Project Management
1. Update status as projects progress
2. Use filters to focus on specific stages
3. Track win rate to improve proposals
4. Archive old projects to keep lists clean

### Team Collaboration
1. Add all team members with accurate costs
2. Assign appropriate roles and permissions
3. Use realistic cost rates for margin accuracy
4. Keep team information updated

---

## 🎯 Common Workflows

### Creating Your First Quote

1. Go to **Projects** page
2. Click **"New Quote"** button
3. Enter project details:
   - Name: "Website Redesign"
   - Client: "ABC Company"
   - Currency: USD
4. Add services:
   - UI/UX Design: 40 hours
   - Frontend Development: 80 hours
   - Project Management: 20 hours
5. Review margin (should be green ✓)
6. Click **"Create Quote"**
7. Share with client!

### Analyzing Performance

1. Go to **Dashboard**
2. Check **Total Revenue** KPI
3. Review **Win Rate** trend
4. Expand **Filters** for specific date range
5. Examine **Revenue Trend** chart
6. Read **AI Advisor** insights
7. Identify top-performing services

### Setting Up Your Agency

1. Go to **Settings** → **Costs**
   - Add hourly cost rates for your team
2. Go to **Settings** → **Services**
   - Add all services you offer
   - Set competitive hourly rates
3. Go to **Settings** → **Team**
   - Add team members
   - Link to cost rates
4. Go to **Settings** → **Currency**
   - Select your default
5. Go to **Settings** → **Taxes**
   - Configure local tax rate
6. Go to **Settings** → **Users**
   - Invite team members
   - Assign appropriate roles

---

## 📊 Understanding Margin Calculations

### How Margin is Calculated

```
Subtotal = Sum of (Hours × Hourly Rate) for all services
Cost = Sum of (Hours × Hourly Rate × 0.60) for all services
Margin = ((Subtotal - Cost) / Subtotal) × 100
```

### Assumptions
- **Cost Rate**: 60% of billing rate (industry average)
- **Target Margin**: 30-40% is healthy for agencies

### Example
- Service: UI/UX Design
- Hours: 40
- Rate: $120/hr
- Subtotal: $4,800
- Cost (60%): $2,880
- Profit: $1,920
- Margin: 40% ✓ (Excellent!)

---

## 🎨 Visual Indicators

### Status Colors
- 🔵 **Blue (Sent)**: Awaiting client response
- 🟢 **Green (Won)**: Client accepted
- 🔴 **Red (Lost)**: Client declined
- ⚪ **Grey (Draft)**: Work in progress

### Margin Colors
- 🟢 **Green (40%+)**: Excellent profitability
- 🟡 **Yellow (30-39%)**: Good profitability
- 🔴 **Red (<30%)**: Below target

### Trends
- 📈 **Up Arrow**: Positive trend
- 📉 **Down Arrow**: Negative trend

---

## 🔒 Data Privacy

This is a demo application with mock data:
- No real data is stored
- All projects are examples
- Safe to experiment and test
- No external API calls

---

## 🆘 Troubleshooting

### Can't create a quote?
- Ensure Project Name is filled
- Ensure Client Name is filled
- Add at least one service
- Enter hours for all services

### Margin showing 0%?
- Add services with hours and rates
- Check that services have hourly rates set

### Filters not working?
- Click "Apply Filters" button after selecting
- Use "Clear" to reset filters

---

## 🚀 Next Steps

1. **Explore** all pages and features
2. **Create** a test quote
3. **Review** the dashboard metrics
4. **Configure** settings for your agency
5. **Customize** services and rates

---

## 💬 Support

For questions or feedback about Nougram design system:
- Review the **DESIGN_SYSTEM.md** for technical details
- Check component specifications
- Refer to Material Design 3 guidelines

---

**Happy Quoting! 🎉**

Built with Material Design 3 for modern, efficient agency operations.
