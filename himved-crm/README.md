# 🌿 Himved Herbals CRM

A complete, simple, fast, and user-friendly web-based CRM system for Ayurvedic company "Himved Herbals".

## ✨ Features

### User Roles
- **Admin (Owner)**: Full access to all features, agents, leads, and reports
- **Agents**: Can only see and manage their assigned leads

### Lead Management
- Add single leads with validation (10-digit Indian phone numbers)
- Bulk upload leads via paste or CSV
- Auto-detect duplicates and invalid numbers
- Auto-assign names if not provided (Lead #XXXX)
- Categories: Psoriasis, Sexual Wellness
- Products dynamically change based on category
- Source tracking (Website, Facebook, Instagram, Google Ads, Referral, Other)

### Pipeline System (Kanban Board)
- Drag & drop leads between stages
- 7 stages: New → Attempted → Connected → Interested → Follow-up → Converted → Closed
- Auto-save on stage change
- Visual color-coded columns

### Call & Follow-up System
- Call statuses: Not Picked, Picked, Busy, Interested, Not Interested
- Add remarks to every call
- Auto-timestamps for all activities
- Automation rules:
  - Not picked/Busy → Auto-create follow-up for next day
  - Interested → Move to "Interested" stage
  - Not Interested → Move to "Closed" stage

### Follow-up Management
- Today's follow-ups view
- Overdue follow-ups (highlighted in red)
- Upcoming follow-ups
- Mark as done or reschedule options

### WhatsApp Integration
- One-click WhatsApp button on every lead
- Pre-filled message: "Hi, this is Himved Herbals"
- Opens chat directly in WhatsApp Web/App

### Activity Timeline
- Complete history of each lead
- Call logs with remarks
- Status changes with user tracking
- Follow-up scheduling history

### Dashboard
**Admin Dashboard:**
- Total leads count
- Total conversions
- Total revenue (₹)
- Today's follow-ups
- Agent performance cards
- Recent activity feed

**Agent Dashboard:**
- Personal lead stats
- Pending follow-ups
- Assigned leads

### Agent Management (Admin Only)
- Add/Edit/Delete agents
- Activate/Deactivate agents
- Track leads handled and conversions per agent
- Login credentials management

### Reports (Admin Only)
- Filter by agent
- Filter by date range
- Conversion rate calculation
- Revenue reports
- Status breakdown

### UI/UX Features
- Clean Ayurvedic green theme
- Mobile-responsive design
- Large buttons for easy tapping
- Toast notifications
- Loading states
- Empty state messages
- Search and filters
- Delete confirmations

## 🚀 Quick Start

### Option 1: Open Directly in Browser
1. Navigate to the `himved-crm` folder
2. Open `index.html` in any modern web browser (Chrome, Firefox, Edge, Safari)
3. That's it! The CRM will work immediately.

### Option 2: Use a Local Server (Recommended)
```bash
# Using Python 3
cd himved-crm
python3 -m http.server 8000

# Then open http://localhost:8000 in your browser
```

```bash
# Using Node.js (if you have http-server installed)
npx http-server himved-crm -p 8000

# Then open http://localhost:8000 in your browser
```

## 🔐 Default Login Credentials

**Admin Account:**
- Login ID: `admin`
- Password: `admin123`

⚠️ **Important**: Change the default password after first login!

## 📁 File Structure

```
himved-crm/
├── index.html      # Main HTML file
├── style.css       # All styles (Ayurvedic green theme)
├── script.js       # Complete application logic
└── README.md       # This file
```

## 💾 Data Storage

- All data is stored in **browser's LocalStorage**
- Data persists even after closing the browser
- No backend server required
- Session management uses SessionStorage

### Stored Data:
- `himved_leads`: All lead information
- `himved_agents`: All agent accounts
- `himved_user`: Current logged-in user session

## 📱 Mobile Responsive

The CRM is fully responsive and works great on:
- Desktop computers
- Tablets
- Mobile phones

On mobile devices:
- Sidebar becomes a slide-in menu
- Tables become scrollable
- Buttons are touch-friendly
- Layout adjusts automatically

## 🎯 How to Use

### For Admin:

1. **Login** with admin credentials
2. **Add Agents**: Go to Agents section → Add Agent
3. **Add Leads**: 
   - Single lead: Click "+ Add Lead"
   - Bulk upload: Click "📤 Bulk Upload" → Paste numbers
4. **Assign Leads**: While adding/editing leads, select an agent
5. **Monitor Performance**: Check Dashboard and Reports
6. **Drag & Drop**: Move leads through pipeline stages

### For Agents:

1. **Login** with your credentials (given by admin)
2. **View Dashboard**: See your stats and tasks
3. **Check Follow-ups**: Go to Follow-ups section
4. **Make Calls**: Click on any lead → Make a call → Add remark
5. **Update Status**: Drag leads in Pipeline or use call system
6. **WhatsApp**: Click WhatsApp button to chat with leads

## 🔧 Customization

### Change Products
Edit the `PRODUCTS` object in `script.js`:
```javascript
const PRODUCTS = {
    'Psoriasis': ['Product 1', 'Product 2', ...],
    'Sexual Wellness': ['Product A', 'Product B', ...]
};
```

### Change Colors
Edit CSS variables in `style.css`:
```css
:root {
    --primary-color: #2d6a4f;     /* Main green */
    --primary-light: #40916c;     /* Lighter green */
    --primary-dark: #1b4332;      /* Darker green */
    --secondary-color: #52b788;   /* Accent green */
}
```

### Change Pipeline Stages
Edit the `STAGES` array in `script.js`:
```javascript
const STAGES = ['New', 'Attempted', 'Connected', ...];
```

## 🛡️ Security Notes

⚠️ This is a **client-side only** CRM using LocalStorage. For production use with sensitive data:

1. Add a proper backend (Node.js + Express + Database)
2. Implement secure authentication (JWT, OAuth)
3. Use HTTPS for all connections
4. Add role-based access control on server side
5. Regular data backups

## 🐛 Troubleshooting

**Data not saving?**
- Check if browser allows LocalStorage
- Try a different browser
- Clear cache and reload

**Can't login?**
- Default credentials: admin / admin123
- Check if account is active (admin can activate)
- Clear sessionStorage and try again

**Layout issues?**
- Clear browser cache
- Use latest version of Chrome/Firefox
- Check browser console for errors

## 📊 Browser Compatibility

Tested and working on:
- ✅ Google Chrome (recommended)
- ✅ Mozilla Firefox
- ✅ Microsoft Edge
- ✅ Safari
- ✅ Opera

## 🎨 Theme

The CRM uses an Ayurvedic green theme representing:
- 🌿 Natural and herbal products
- 🍃 Trust and wellness
- 💚 Growth and prosperity

## 📞 Support

For issues or feature requests, check the code comments or modify as needed. The code is well-structured and commented for easy customization.

---

**Made with ❤️ for Himved Herbals**

*Simple • Fast • User-Friendly*
