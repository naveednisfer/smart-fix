# SmartFix - Property Maintenance & Services App

A cross-platform mobile app built with React Native and Expo for booking property maintenance services in the Middle East (UAE, Saudi Arabia, Qatar, etc.).

## 🚀 Features

- **User Authentication**: Email/password registration and login
- **Service Booking**: Book various property services (AC repair, plumbing, electrical, cleaning, painting)
- **Booking Management**: View upcoming and past bookings
- **Real-time Data**: All data stored in Supabase backend
- **Modern UI**: Clean, intuitive interface with smooth navigation

## 🛠 Tech Stack

- **Frontend**: React Native with Expo
- **Backend**: Supabase (Database + Authentication)
- **Navigation**: React Navigation v6
- **State Management**: React Hooks
- **Platform**: Cross-platform (iOS & Android)

## 📱 Screens

1. **Login Screen** - User authentication
2. **Register Screen** - New user registration
3. **Home Screen** - Browse available services
4. **Booking Screen** - Create new service bookings
5. **My Bookings Screen** - View booking history

## 🗄 Database Schema

### Tables Required in Supabase

#### 1. `services` table
```sql
CREATE TABLE services (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 2. `bookings` table
```sql
CREATE TABLE bookings (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  service VARCHAR(100) NOT NULL,
  date DATE NOT NULL,
  time TIME NOT NULL,
  address TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 3. Row Level Security (RLS) Policies

```sql
-- Enable RLS
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;

-- Bookings policies
CREATE POLICY "Users can view their own bookings" ON bookings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own bookings" ON bookings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Services policies (public read access)
CREATE POLICY "Anyone can view services" ON services
  FOR SELECT USING (true);
```

## 🚀 Setup Instructions

### 1. Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Expo CLI (`npm install -g @expo/cli`)
- Supabase account

### 2. Clone and Install
```bash
git clone <your-repo-url>
cd SmartFix
npm install
```

### 3. Supabase Setup
1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Go to Settings > API to get your project URL and anon key
3. Update `supabase.js` with your credentials:

```javascript
const SUPABASE_URL = 'https://your-project-id.supabase.co';
const SUPABASE_ANON_KEY = 'your-anon-key';
```

4. Run the SQL commands above in your Supabase SQL editor to create tables and policies

### 4. Insert Sample Services
```sql
INSERT INTO services (name, description) VALUES
('AC Repair', 'Air conditioning repair and maintenance services'),
('Plumbing', 'Plumbing services and repairs'),
('Electrical', 'Electrical work and repairs'),
('Cleaning', 'House and office cleaning services'),
('Painting', 'Interior and exterior painting services');
```

### 5. Run the App
```bash
npx expo start
```

Then scan the QR code with Expo Go app on your phone, or press 'i' for iOS simulator or 'a' for Android emulator.

## 📁 Project Structure

```
SmartFix/
├── App.js                 # Main app component with navigation
├── supabase.js           # Supabase client configuration
├── screens/
│   ├── LoginScreen.js    # User login
│   ├── RegisterScreen.js # User registration
│   ├── HomeScreen.js     # Services listing
│   ├── BookingScreen.js  # Create bookings
│   └── MyBookingsScreen.js # View bookings
├── assets/               # Images and icons
└── package.json          # Dependencies
```

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the root directory:
```
EXPO_PUBLIC_SUPABASE_URL=your-supabase-url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

Then update `supabase.js`:
```javascript
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
```

## 🎨 Customization

### Colors
The app uses a consistent color scheme:
- Primary: `#007AFF` (Blue)
- Background: `#f8f9fa` (Light Gray)
- Text: `#333` (Dark Gray)
- Error: `#dc3545` (Red)

### Styling
All components use StyleSheet for consistent styling across platforms.

## 🔒 Security Features

- Row Level Security (RLS) enabled on all tables
- User authentication required for booking operations
- Input validation on all forms
- Secure password requirements

## 🚀 Deployment

### Expo Build
```bash
# Build for iOS
expo build:ios

# Build for Android
expo build:android
```

### App Store Deployment
1. Configure app.json with your app details
2. Build the app using Expo EAS Build
3. Submit to App Store/Google Play Store

## 🔮 Future Enhancements

- [ ] Push notifications for booking updates
- [ ] Payment integration (Stripe)
- [ ] WhatsApp integration for service providers
- [ ] Real-time chat with service providers
- [ ] Photo upload for service requests
- [ ] Service provider ratings and reviews
- [ ] Multi-language support (Arabic/English)
- [ ] Offline mode support

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support, email support@smartfix.com or create an issue in the repository.

---

**Built with ❤️ for the Middle East property maintenance market** 