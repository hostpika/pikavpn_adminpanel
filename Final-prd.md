# Product Requirements Document (PRD) - Updated v2
## Flutter VPN Application

---

## 1. PROJECT OVERVIEW

### 1.1 Product Name
**SuperVPN - Secure & Fast VPN**

### 1.2 Product Vision
A free-to-use, premium-upgradable VPN application built with Flutter that provides secure internet access through OpenVPN protocol, supporting both VPN Gate public servers and Namecheap VPN premium servers with integrated monetization through AdMob and Facebook Audience Network. **All critical configurations are backend-controlled for maximum flexibility.**

### 1.3 Target Platforms
- Android (Primary)
- iOS (Secondary)

### 1.4 Core Technology Stack
- **Framework**: Flutter 3.x+
- **VPN Protocol**: OpenVPN
- **Flutter Package**: `openvpn_flutter: ^1.3.4`
- **Backend API**: `https://tynybite.vercel.app`
- **Authentication**: Email/Password (Optional for free users, Required for premium)
- **Ad Networks**: Google AdMob + Facebook Audience Network (Backend Controlled)
- **State Management**: GetX / Provider / Riverpod
- **HTTP Client**: `http` or `dio` package

---

## 2. AUTHENTICATION & USER MANAGEMENT

### 2.1 User Types

**Anonymous Users** (Free Access):
- **No sign-up required** to use free VPN servers
- Can browse all server lists (free and premium)
- Can connect to **free VPN Gate servers** without authentication
- See premium servers as "locked" with upgrade prompt
- Ad-supported experience
- **Must sign up to access premium servers**

**Authenticated Free Users**:
- Email/password registration (optional)
- Same access as anonymous users (free VPN Gate servers)
- Ad-supported experience
- Can purchase premium subscription
- Account data synced across devices

**Premium Users** (Subscription Required):
- **Must be authenticated** (registration required)
- Access to all Namecheap premium servers
- Ad-free experience (if configured)
- Kill switch and advanced features
- Priority support
- Can manage subscription

### 2.2 Authentication Flow

#### App Launch Flow (No Sign-Up Required)

```
1. User installs and opens app
   ↓
2. Splash screen (2 seconds)
   ├─ Fetch app config
   ├─ Fetch ad config
   ├─ Fetch server list
   └─ Fetch pricing plans
   ↓
3. Onboarding screens (3 slides)
   ↓
4. VPN Permission Screen
   ├─ "Grant VPN Permission" button
   └─ "Skip for now" option
   ↓
5. Navigate to Home Screen (ANONYMOUS USER)
   ├─ User can immediately use free VPN
   ├─ "Sign Up" button in profile/settings (optional)
   └─ "Upgrade to Premium" button visible
   ↓
6. User can connect to free servers WITHOUT login
```

#### Optional Sign Up Flow

```
1. User taps "Sign Up" button (in profile or when accessing premium)
   ↓
2. Sign Up / Login Screen
   ├─ "Sign Up" tab (default)
   │  ├─ Email field
   │  ├─ Password field
   │  ├─ Confirm Password field
   │  └─ "Create Account" button
   └─ "Login" tab
      ├─ Email field
      ├─ Password field
      └─ "Login" button
   ↓
3. POST /api/auth/register
   Body: { email, password }
   ↓
4. Backend creates user account
   ↓
5. Backend returns JWT token
   ↓
6. App stores token securely
   ↓
7. User remains on current screen with authenticated status
   ↓
8. GET /api/subscription/status (check if premium)
   ↓
9. Update UI based on subscription status
```

#### Login Flow

```
1. User enters email & password
   ↓
2. POST /api/auth/login
   Body: { email, password }
   ↓
3. Backend validates credentials
   ↓
4. Backend returns JWT token
   ↓
5. App stores token securely
   ↓
6. GET /api/subscription/status (check if premium)
   ↓
7. Update UI with authenticated + subscription status
```

#### Premium Upgrade Flow (Requires Authentication)

```
1. User taps "Upgrade to Premium" OR tries to connect to premium server
   ↓
2. Check if user is logged in
   ├─ NOT LOGGED IN → Show authentication dialog
   │   ├─ "Sign up to unlock premium servers"
   │   ├─ [Sign Up] button → Navigate to Sign Up
   │   ├─ [Login] button → Navigate to Login
   │   └─ [Cancel] button → Return
   └─ LOGGED IN → Continue to pricing
   ↓
3. GET /api/pricing?action=list
   ↓
4. Show pricing screen with available plans
   ↓
5. User selects a plan
   ↓
6. Trigger in-app purchase (Google Play / App Store)
   ↓
7. User completes purchase
   ↓
8. App receives purchase token
   ↓
9. POST /api/subscription/verify
   Body: {
     platform: "android" | "ios",
     purchaseToken: "...",
     productId: "premium_monthly",
     userId: "user_email_or_uid"
   }
   ↓
10. Backend validates with Google/Apple
   ↓
11. Backend updates user to premium status
   ↓
12. GET /api/subscription/status (refresh)
   ↓
13. App updates UI
    ├─ Hide ads (if configured)
    ├─ Unlock premium servers
    └─ Enable premium features
   ↓
14. Show "Welcome to Premium!" screen
```

### 2.3 Authentication API Integration

**Register New User** (Optional):
```dart
Future<AuthResponse> registerUser(String email, String password) async {
  try {
    final response = await http.post(
      Uri.parse('${ApiConstants.baseUrl}/api/auth/register'),
      headers: {'Content-Type': 'application/json'},
      body: json.encode({
        'email': email,
        'password': password,
      }),
    );
    
    if (response.statusCode == 200 || response.statusCode == 201) {
      final data = json.decode(response.body);
      // Store token securely
      await SecureStorage.saveToken(data['token']);
      return AuthResponse.fromJson(data);
    } else {
      throw AuthException('Registration failed: ${response.body}');
    }
  } catch (e) {
    throw AuthException('Network error: $e');
  }
}
```

**Login User**:
```dart
Future<AuthResponse> loginUser(String email, String password) async {
  try {
    final response = await http.post(
      Uri.parse('${ApiConstants.baseUrl}/api/auth/login'),
      headers: {'Content-Type': 'application/json'},
      body: json.encode({
        'email': email,
        'password': password,
      }),
    );
    
    if (response.statusCode == 200) {
      final data = json.decode(response.body);
      await SecureStorage.saveToken(data['token']);
      return AuthResponse.fromJson(data);
    } else {
      throw AuthException('Login failed: ${response.body}');
    }
  } catch (e) {
    throw AuthException('Network error: $e');
  }
}
```

**Verify Token**:
```dart
Future<bool> verifyToken() async {
  try {
    final token = await SecureStorage.getToken();
    if (token == null) return false;
    
    final response = await http.get(
      Uri.parse('${ApiConstants.baseUrl}/api/auth/verify'),
      headers: {
        'Authorization': 'Bearer $token',
        'Content-Type': 'application/json',
      },
    );
    
    return response.statusCode == 200;
  } catch (e) {
    return false;
  }
}
```

---

## 3. BACKEND-CONTROLLED CONFIGURATION SYSTEM

### 3.1 App Configuration (Fetched from Backend)

**Endpoint**: `GET /api/config?type=app`

**Current Response**:
```json
{
  "maintenanceMode": false,
  "minAppVersion": "1.0.0",
  "killSwitchEnabled": true,
  "smartConnectEnabled": true,
  "uiTexts": {
    "welcomeMessage": "Welcome to VPN Admin Hub",
    "maintenanceMessage": "We're currently under maintenance. Please check back soon."
  }
}
```

**Recommended Extended Response**:
```json
{
  "maintenanceMode": false,
  "minAppVersion": "1.0.0",
  "forceUpdate": false,
  "updateUrl": "https://play.google.com/store/apps/details?id=com.yourapp.vpn",
  "killSwitchEnabled": true,
  "smartConnectEnabled": true,
  "autoReconnectEnabled": true,
  "serverRefreshInterval": 3600,
  "connectionTimeout": 30,
  "authRequired": false,
  "features": {
    "speedTest": true,
    "ipTest": true,
    "connectionHistory": true,
    "splitTunneling": false,
    "darkMode": true,
    "anonymousAccess": true
  },
  "uiTexts": {
    "welcomeMessage": "Welcome to SuperVPN",
    "maintenanceMessage": "We're currently under maintenance. Please check back soon.",
    "premiumCTA": "Unlock Premium Features",
    "connectionSuccessMessage": "You are now protected",
    "signUpCTA": "Sign up for premium access",
    "premiumRequiredMessage": "Premium subscription required for this server"
  },
  "supportEmail": "support@supervpn.com",
  "privacyPolicyUrl": "https://supervpn.com/privacy",
  "termsOfServiceUrl": "https://supervpn.com/terms"
}
```

**Usage in App**:
```dart
class AppConfigService {
  AppConfig? _config;
  
  Future<AppConfig> fetchAppConfig() async {
    final response = await http.get(
      Uri.parse('${ApiConstants.baseUrl}/api/config?type=app'),
    );
    
    if (response.statusCode == 200) {
      _config = AppConfig.fromJson(json.decode(response.body));
      
      // Check maintenance mode
      if (_config!.maintenanceMode) {
        // Show maintenance screen
        navigateToMaintenance();
      }
      
      // Check app version
      final currentVersion = await getAppVersion();
      if (isVersionOutdated(currentVersion, _config!.minAppVersion)) {
        if (_config!.forceUpdate) {
          // Force user to update
          showForceUpdateDialog();
        } else {
          // Optional update prompt
          showUpdatePrompt();
        }
      }
      
      return _config!;
    } else {
      throw Exception('Failed to load app config');
    }
  }
  
  AppConfig get config => _config ?? AppConfig.defaultConfig();
}
```

### 3.2 Ad Configuration (Backend Controlled)

**Endpoint**: `GET /api/config?type=ads`

**Current Response**:
```json
{
  "enabled": false,
  "adMobAppId": "",
  "bannerAdUnitId": "",
  "interstitialAdUnitId": "",
  "rewardedAdUnitId": "",
  "showInterstitialFrequency": 3
}
```

**Recommended Extended Response**:
```json
{
  "enabled": true,
  "provider": "admob",
  "admob": {
    "android": {
      "appId": "ca-app-pub-XXXXXXXXXXXXXXXX~XXXXXXXXXX",
      "bannerAdUnitId": "ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX",
      "interstitialAdUnitId": "ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX",
      "rewardedAdUnitId": "ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX",
      "appOpenAdUnitId": "ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX",
      "nativeAdUnitId": "ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX"
    },
    "ios": {
      "appId": "ca-app-pub-XXXXXXXXXXXXXXXX~XXXXXXXXXX",
      "bannerAdUnitId": "ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX",
      "interstitialAdUnitId": "ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX",
      "rewardedAdUnitId": "ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX",
      "appOpenAdUnitId": "ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX",
      "nativeAdUnitId": "ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX"
    }
  },
  "facebook": {
    "enabled": false,
    "android": {
      "placementIds": {
        "banner": "",
        "interstitial": "",
        "native": ""
      }
    },
    "ios": {
      "placementIds": {
        "banner": "",
        "interstitial": "",
        "native": ""
      }
    }
  },
  "adFrequency": {
    "showBannerOnHome": true,
    "showBannerOnServerList": true,
    "interstitialMinInterval": 180,
    "interstitialConnectionFrequency": 5,
    "appOpenMinInterval": 14400,
    "rewardedAdReward": {
      "type": "premium_access",
      "durationMinutes": 60
    }
  },
  "adPlacements": {
    "homeScreen": {
      "banner": true,
      "showWhenConnected": false
    },
    "serverListScreen": {
      "banner": true,
      "nativeAdFrequency": 8
    },
    "afterConnection": {
      "interstitial": true,
      "frequency": 5
    }
  }
}
```

**Usage in App**:
```dart
class AdService {
  AdConfig? _adConfig;
  
  Future<void> initializeAds() async {
    // Fetch ad config from backend
    _adConfig = await fetchAdConfig();
    
    if (!_adConfig!.enabled) {
      print('Ads are disabled by backend');
      return;
    }
    
    // Initialize AdMob with fetched IDs
    if (_adConfig!.provider == 'admob') {
      await MobileAds.instance.initialize();
      print('AdMob initialized with App ID: ${_adConfig!.admob.android.appId}');
    }
    
    // Initialize Facebook if enabled
    if (_adConfig!.facebook.enabled) {
      await FacebookAudienceNetwork.init(
        testingId: "YOUR_TESTING_ID",
      );
    }
  }
  
  Future<AdConfig> fetchAdConfig() async {
    final response = await http.get(
      Uri.parse('${ApiConstants.baseUrl}/api/config?type=ads'),
    );
    
    if (response.statusCode == 200) {
      return AdConfig.fromJson(json.decode(response.body));
    } else {
      // Return default config with ads disabled
      return AdConfig.defaultDisabled();
    }
  }
  
  void loadBannerAd(String placement) {
    if (_adConfig == null || !_adConfig!.enabled) return;
    
    final adUnitId = Platform.isAndroid
        ? _adConfig!.admob.android.bannerAdUnitId
        : _adConfig!.admob.ios.bannerAdUnitId;
    
    if (adUnitId.isEmpty) {
      print('Banner ad unit ID not configured');
      return;
    }
    
    // Load banner ad with fetched ID
    _bannerAd = BannerAd(
      adUnitId: adUnitId,
      size: AdSize.banner,
      request: AdRequest(),
      listener: BannerAdListener(
        onAdLoaded: (_) => print('Banner ad loaded'),
        onAdFailedToLoad: (ad, error) {
          print('Banner ad failed: $error');
          ad.dispose();
        },
      ),
    )..load();
  }
  
  bool shouldShowInterstitial(int connectionCount) {
    if (_adConfig == null || !_adConfig!.enabled) return false;
    
    final frequency = _adConfig!.adFrequency.interstitialConnectionFrequency;
    return connectionCount % frequency == 0;
  }
  
  bool get adsEnabled => _adConfig?.enabled ?? false;
  AdConfig get config => _adConfig ?? AdConfig.defaultDisabled();
}
```

### 3.3 Pricing Configuration (Backend Controlled)

**Endpoint**: `GET /api/pricing?action=list`

**Current Response**: `[]` (Empty array)

**Recommended Response**:
```json
[
  {
    "id": "premium_monthly",
    "name": "Monthly Premium",
    "description": "All premium features for 1 month",
    "price": 4.99,
    "currency": "USD",
    "duration": "monthly",
    "features": [
      "Access to all premium servers",
      "Ad-free experience",
      "Kill switch protection",
      "Priority support",
      "Unlimited data"
    ],
    "googlePlayProductId": "premium_monthly",
    "appStoreProductId": "com.yourapp.vpn.premium.monthly",
    "active": true,
    "isFeatured": false
  },
  {
    "id": "premium_yearly",
    "name": "Yearly Premium",
    "description": "Best value! Save 50%",
    "price": 29.99,
    "currency": "USD",
    "duration": "yearly",
    "savings": "50%",
    "features": [
      "All monthly features",
      "Save $30 per year",
      "Priority support"
    ],
    "googlePlayProductId": "premium_yearly",
    "appStoreProductId": "com.yourapp.vpn.premium.yearly",
    "active": true,
    "isFeatured": true,
    "badge": "Best Value"
  },
  {
    "id": "premium_lifetime",
    "name": "Lifetime Premium",
    "description": "One-time payment, forever access",
    "price": 49.99,
    "currency": "USD",
    "duration": "lifetime",
    "features": [
      "All premium features",
      "Lifetime access",
      "Early access to new features",
      "Priority support"
    ],
    "googlePlayProductId": "premium_lifetime",
    "appStoreProductId": "com.yourapp.vpn.premium.lifetime",
    "active": true,
    "isFeatured": false
  }
]
```

**Usage in App**:
```dart
class PricingService {
  Future<List<PricingPlan>> fetchPricingPlans() async {
    final response = await http.get(
      Uri.parse('${ApiConstants.baseUrl}/api/pricing?action=list'),
    );
    
    if (response.statusCode == 200) {
      final List<dynamic> data = json.decode(response.body);
      
      if (data.isEmpty) {
        print('No pricing plans configured');
        return [];
      }
      
      return data
          .map((plan) => PricingPlan.fromJson(plan))
          .where((plan) => plan.active)
          .toList();
    } else {
      throw Exception('Failed to load pricing plans');
    }
  }
  
  Widget buildPricingScreen() {
    return FutureBuilder<List<PricingPlan>>(
      future: fetchPricingPlans(),
      builder: (context, snapshot) {
        if (snapshot.hasData) {
          final plans = snapshot.data!;
          
          if (plans.isEmpty) {
            return Center(
              child: Text('Premium plans coming soon!'),
            );
          }
          
          return ListView.builder(
            itemCount: plans.length,
            itemBuilder: (context, index) {
              final plan = plans[index];
              return PricingCard(
                plan: plan,
                isFeatured: plan.isFeatured,
                onTap: () => purchasePlan(plan),
              );
            },
          );
        } else if (snapshot.hasError) {
          return ErrorWidget(snapshot.error);
        } else {
          return LoadingIndicator();
        }
      },
    );
  }
}
```

### 3.4 Server List (Backend Controlled)

**Endpoint**: `GET /api/servers?action=list`

**Recommended Response**:
```json
{
  "servers": [
    {
      "id": "vpngate_us_001",
      "name": "US East 1",
      "country": "United States",
      "countryCode": "US",
      "city": "New York",
      "premium": false,
      "active": true,
      "protocol": "openvpn",
      "serverType": "vpngate",
      "loadPercentage": 23,
      "latency": 45,
      "bandwidth": "100 Mbps",
      "features": ["P2P", "Streaming"]
    },
    {
      "id": "namecheap_au_001",
      "name": "Australia - Melbourne",
      "country": "Australia",
      "countryCode": "AU",
      "city": "Melbourne",
      "premium": true,
      "active": true,
      "protocol": "openvpn",
      "serverType": "namecheap",
      "serverHost": "mel-b01.vpn.wlvpn.com",
      "serverPort": 443,
      "loadPercentage": 15,
      "latency": 28,
      "bandwidth": "1 Gbps",
      "features": ["P2P", "Streaming", "Gaming"]
    }
  ],
  "lastUpdated": "2024-11-24T12:37:22Z"
}
```

---

## 4. MODULAR ARCHITECTURE PRINCIPLES

### 4.1 Configuration-Driven Features

**All major features should be controlled via backend config**:

1. **Feature Toggles**:
   - Enable/disable kill switch
   - Enable/disable smart connect
   - Enable/disable speed test
   - Enable/disable connection history
   - Enable/disable split tunneling
   - **Enable/disable anonymous access**

2. **Ad Controls**:
   - Enable/disable ads globally
   - Control ad placement
   - Set ad frequency
   - Switch between ad providers

3. **UI Customization**:
   - Welcome messages
   - Error messages
   - CTA button text
   - Support links

4. **Premium Features**:
   - Define pricing plans remotely
   - Add/remove features
   - Change pricing
   - Enable free trials

### 4.2 Configuration Caching Strategy

```dart
class ConfigurationManager {
  static const String APP_CONFIG_KEY = 'app_config_cache';
  static const String AD_CONFIG_KEY = 'ad_config_cache';
  static const String PRICING_CONFIG_KEY = 'pricing_config_cache';
  static const Duration CACHE_DURATION = Duration(hours: 6);
  
  AppConfig? _appConfig;
  AdConfig? _adConfig;
  List<PricingPlan>? _pricingPlans;
  
  // Load all configs on app start
  Future<void> initialize() async {
    await Future.wait([
      loadAppConfig(),
      loadAdConfig(),
      loadPricingConfig(),
    ]);
  }
  
  Future<void> loadAppConfig() async {
    try {
      // Try cache first
      _appConfig = await loadFromCache<AppConfig>(APP_CONFIG_KEY);
      
      // Fetch fresh config in background
      final freshConfig = await fetchAppConfig();
      
      if (freshConfig != _appConfig) {
        _appConfig = freshConfig;
        await saveToCache(APP_CONFIG_KEY, freshConfig);
        notifyListeners();
      }
    } catch (e) {
      print('Failed to load app config: $e');
      // Use default if cache and network fail
      _appConfig ??= AppConfig.defaultConfig();
    }
  }
  
  Future<AppConfig> fetchAppConfig() async {
    final response = await http.get(
      Uri.parse('${ApiConstants.baseUrl}/api/config?type=app'),
    );
    
    if (response.statusCode == 200) {
      return AppConfig.fromJson(json.decode(response.body));
    } else {
      throw Exception('Failed to fetch app config');
    }
  }
  
  // Getters with fallback to defaults
  AppConfig get appConfig => _appConfig ?? AppConfig.defaultConfig();
  AdConfig get adConfig => _adConfig ?? AdConfig.defaultDisabled();
  List<PricingPlan> get pricingPlans => _pricingPlans ?? [];
  
  // Force refresh all configs
  Future<void> refreshAllConfigs() async {
    await initialize();
  }
}
```

### 4.3 Remote Feature Flags

**Backend Control Panel Features**:

```
Admin Dashboard:
├── App Configuration
│   ├── Maintenance Mode (ON/OFF)
│   ├── Force Update (ON/OFF)
│   ├── Min App Version (text input)
│   ├── Kill Switch (ON/OFF)
│   ├── Smart Connect (ON/OFF)
│   ├── Anonymous Access (ON/OFF)
│   └── UI Text Editor
│
├── Ad Configuration
│   ├── Ads Enabled (ON/OFF)
│   ├── AdMob App IDs (Android/iOS)
│   ├── Ad Unit IDs (Banner, Interstitial, Rewarded, etc.)
│   ├── Facebook Placement IDs
│   ├── Ad Frequency Settings
│   └── Ad Placement Controls
│
├── Pricing Configuration
│   ├── Add New Plan
│   ├── Edit Existing Plans
│   ├── Enable/Disable Plans
│   ├── Set Featured Plan
│   └── Update Prices
│
└── Server Management
    ├── Add New Server
    ├── Enable/Disable Servers
    ├── Mark as Premium/Free
    └── Update Server Load
```

---

## 5. UPDATED API INTEGRATION

### 5.1 Complete API Service

```dart
class VPNApiService {
  static const String baseUrl = 'https://tynybite.vercel.app';
  
  // ==================== AUTH (OPTIONAL) ====================
  
  Future<AuthResponse> register(String email, String password) async {
    final response = await http.post(
      Uri.parse('$baseUrl/api/auth/register'),
      headers: {'Content-Type': 'application/json'},
      body: json.encode({'email': email, 'password': password}),
    );
    
    if (response.statusCode == 200 || response.statusCode == 201) {
      return AuthResponse.fromJson(json.decode(response.body));
    } else {
      throw ApiException('Registration failed', response.statusCode);
    }
  }
  
  Future<AuthResponse> login(String email, String password) async {
    final response = await http.post(
      Uri.parse('$baseUrl/api/auth/login'),
      headers: {'Content-Type': 'application/json'},
      body: json.encode({'email': email, 'password': password}),
    );
    
    if (response.statusCode == 200) {
      return AuthResponse.fromJson(json.decode(response.body));
    } else {
      throw ApiException('Login failed', response.statusCode);
    }
  }
  
  Future<bool> verifyToken(String token) async {
    final response = await http.get(
      Uri.parse('$baseUrl/api/auth/verify'),
      headers: {
        'Authorization': 'Bearer $token',
        'Content-Type': 'application/json',
      },
    );
    
    return response.statusCode == 200;
  }
  
  // ==================== SERVERS ====================
  
  Future<ServerListResponse> getServerList() async {
    final response = await http.get(
      Uri.parse('$baseUrl/api/servers?action=list'),
    );
    
    if (response.statusCode == 200) {
      return ServerListResponse.fromJson(json.decode(response.body));
    } else {
      throw ApiException('Failed to load servers', response.statusCode);
    }
  }
  
  // ==================== OVPN CONFIG ====================
  
  Future<String> getOVPNConfig(String serverId, {bool isPremium = false}) async {
    // For free servers, no authentication required
    if (!isPremium) {
      final response = await http.get(
        Uri.parse('$baseUrl/api/ovpn/get?serverId=$serverId'),
        headers: {'Content-Type': 'application/json'},
      );
      
      if (response.statusCode == 200) {
        return response.body; // OVPN file content
      } else {
        throw ApiException('Failed to fetch OVPN config', response.statusCode);
      }
    }
    
    // For premium servers, authentication required
    final token = await SecureStorage.getToken();
    
    if (token == null) {
      throw AuthException('Authentication required for premium servers');
    }
    
    final response = await http.get(
      Uri.parse('$baseUrl/api/ovpn/get?serverId=$serverId'),
      headers: {
        'Authorization': 'Bearer $token',
        'Content-Type': 'application/json',
      },
    );
    
    if (response.statusCode == 200) {
      return response.body; // OVPN file content
    } else if (response.statusCode == 403) {
      throw PremiumRequiredException('Premium subscription required');
    } else if (response.statusCode == 401) {
      throw AuthException('Token expired or invalid');
    } else {
      throw ApiException('Failed to fetch OVPN config', response.statusCode);
    }
  }
  
  // ==================== SUBSCRIPTION ====================
  
  Future<List<PricingPlan>> getPricingPlans() async {
    final response = await http.get(
      Uri.parse('$baseUrl/api/pricing?action=list'),
    );
    
    if (response.statusCode == 200) {
      final List<dynamic> data = json.decode(response.body);
      return data.map((plan) => PricingPlan.fromJson(plan)).toList();
    } else {
      throw ApiException('Failed to load pricing', response.statusCode);
    }
  }
  
  Future<SubscriptionStatus> getSubscriptionStatus() async {
    final token = await SecureStorage.getToken();
    
    if (token == null) {
      // Return free user status if not authenticated
      return SubscriptionStatus(isPremium: false);
    }
    
    final response = await http.get(
      Uri.parse('$baseUrl/api/subscription/status'),
      headers: {
        'Authorization': 'Bearer $token',
        'Content-Type': 'application/json',
      },
    );
    
    if (response.statusCode == 200) {
      return SubscriptionStatus.fromJson(json.decode(response.body));
    } else {
      throw ApiException('Failed to get subscription status', response.statusCode);
    }
  }
  
  Future<VerificationResponse> verifySubscription({
    required String platform,
    required String purchaseToken,
    required String productId,
  }) async {
    final token = await SecureStorage.getToken();
    
    if (token == null) {
      throw AuthException('Authentication required to verify subscription');
    }
    
    final response = await http.post(
      Uri.parse('$baseUrl/api/subscription/verify'),
      headers: {
        'Authorization': 'Bearer $token',
        'Content-Type': 'application/json',
      },
      body: json.encode({
        'platform': platform,
        'purchaseToken': purchaseToken,
        'productId': productId,
      }),
    );
    
    if (response.statusCode == 200) {
      return VerificationResponse.fromJson(json.decode(response.body));
    } else {
      throw ApiException('Verification failed', response.statusCode);
    }
  }
  
  // ==================== CONFIGURATION ====================
  
  Future<AppConfig> getAppConfig() async {
    final response = await http.get(
      Uri.parse('$baseUrl/api/config?type=app'),
    );
    
    if (response.statusCode == 200) {
      return AppConfig.fromJson(json.decode(response.body));
    } else {
      throw ApiException('Failed to load app config', response.statusCode);
    }
  }
  
  Future<AdConfig> getAdConfig() async {
    final response = await http.get(
      Uri.parse('$baseUrl/api/config?type=ads'),
    );
    
    if (response.statusCode == 200) {
      return AdConfig.fromJson(json.decode(response.body));
    } else {
      throw ApiException('Failed to load ad config', response.statusCode);
    }
  }
}
```

---

## 6. USER FLOWS (UPDATED)

### 6.1 First-Time Anonymous User Flow

```
1. Install app from Play Store/App Store
   ↓
2. Launch app
   ↓
3. Splash screen (2 seconds)
   ├─ Fetch app config (maintenance check)
   ├─ Fetch ad config
   ├─ Fetch server list
   └─ Fetch pricing plans
   ↓
4. Onboarding screens (3 slides)
   ├─ Slide 1: "Secure Your Privacy"
   ├─ Slide 2: "Access Global Content"
   └─ Slide 3: "Fast & Free Forever"
   ↓
5. VPN Permission Screen
   ├─ "Grant VPN Permission" button
   └─ Skip button (takes to home)
   ↓
6. Navigate to Home screen (ANONYMOUS USER)
   ├─ Large "Connect" button
   ├─ Server selector (shows last used or "Select Server")
   ├─ Banner ad (if ads enabled)
   ├─ "Sign Up" link in top-right (optional)
   └─ "Upgrade to Premium" banner/button
   ↓
7. USER CAN IMMEDIATELY USE FREE VPN
   ├─ Tap Connect → Auto-select free server OR show server list
   ├─ Connect to any FREE server without authentication
   └─ Premium servers show lock icon + "Sign up to unlock"
```

### 6.2 VPN Connection Flow (Anonymous User - Free Server)

```
1. Anonymous user taps "Connect" button
   ↓
2. Check if server selected
   ├─ No? → Auto-select best free server OR show server list
   └─ Yes? → Continue
   ↓
3. Check server type
   ├─ Premium? → Show "Premium Required" dialog
   │   ├─ "Sign up and upgrade to access premium servers"
   │   ├─ [Sign Up] button → Navigate to registration
   │   └─ [Browse Free Servers] button → Show free server list
   └─ Free? → Continue without authentication
   ↓
4. GET /api/ovpn/get?serverId=<ID> (NO AUTH HEADER)
   ↓
5. Receive OVPN config (free server, no auth required)
   ↓
6. Connect using OpenVPN engine
   ↓
7. Show "Connecting..." state
   ↓
8. Connection established
   ↓
9. Show "Connected" state with stats
   ├─ Hide banner ad (if configured)
   ├─ Start connection timer
   └─ Show data usage stats
   ↓
10. After N connections, show interstitial ad (if configured)
```

### 6.3 Premium Server Access Flow (Requires Authentication)

```
1. User tries to connect to premium server
   ↓
2. Check if user is authenticated
   ├─ NOT AUTHENTICATED → Show authentication dialog
   │   ├─ Title: "Premium Server Requires Account"
   │   ├─ Message: "Sign up to unlock premium servers with faster speeds"
   │   ├─ [Sign Up] button → Navigate to registration
   │   ├─ [Login] button → Navigate to login (if user has account)
   │   └─ [Cancel] button → Return to server list
   └─ AUTHENTICATED → Check subscription status
   ↓
3. Check if user has premium subscription
   ├─ NOT PREMIUM → Show upgrade dialog
   │   ├─ "Premium Subscription Required"
   │   ├─ Show plan options
   │   ├─ [Upgrade Now] → Navigate to pricing screen
   │   └─ [Cancel] → Return
   └─ IS PREMIUM → Continue
   ↓
4. GET /api/ovpn/get?serverId=<ID> (WITH AUTH HEADER)
   ↓
5. Receive premium OVPN config
   ↓
6. Connect using OpenVPN engine
   ↓
7. Connection established
   ↓
8. Show "Connected" state (no ads if premium + ad-free enabled)
```

### 6.4 Premium Upgrade Flow (Requires Authentication)

```
1. User taps "Upgrade to Premium" OR tries premium server
   ↓
2. Check if user is logged in
   ├─ NOT LOGGED IN → Show authentication requirement
   │   ├─ "Create an account to unlock premium"
   │   ├─ [Sign Up] button → Navigate to Sign Up
   │   ├─ [Login] button → Navigate to Login
   │   └─ [Cancel] button → Return
   └─ LOGGED IN → Continue to pricing
   ↓
3. GET /api/pricing?action=list
   ↓
4. Show pricing screen with available plans
   ├─ Monthly: $4.99
   ├─ Yearly: $29.99 (Best Value badge)
   └─ Lifetime: $49.99
   ↓
5. User selects a plan
   ↓
6. Trigger in-app purchase (Google Play / App Store)
   ↓
7. User completes purchase
   ↓
8. App receives purchase token
   ↓
9. POST /api/subscription/verify
   Body: {
     platform: "android",
     purchaseToken: "...",
     productId: "premium_monthly"
   }
   ↓
10. Backend validates purchase with Google/Apple
   ↓
11. Backend updates user to premium status
   ↓
12. GET /api/subscription/status (refresh)
   ↓
13. App updates UI
    ├─ Hide ads (if configured)
    ├─ Unlock premium servers
    ├─ Enable premium features (kill switch, etc.)
    └─ Update profile badge to "Premium"
   ↓
14. Show "Welcome to Premium!" screen with confetti animation
```

---

## 7. DATA MODELS

### 7.1 Authentication Models

```dart
class AuthResponse {
  final String token;
  final String userId;
  final String email;
  final bool isPremium;
  
  AuthResponse({
    required this.token,
    required this.userId,
    required this.email,
    required this.isPremium,
  });
  
  factory AuthResponse.fromJson(Map<String, dynamic> json) {
    return AuthResponse(
      token: json['token'],
      userId: json['userId'],
      email: json['email'],
      isPremium: json['isPremium'] ?? false,
    );
  }
}
```

### 7.2 Configuration Models

```dart
class AppConfig {
  final bool maintenanceMode;
  final String minAppVersion;
  final bool forceUpdate;
  final String updateUrl;
  final bool killSwitchEnabled;
  final bool smartConnectEnabled;
  final bool autoReconnectEnabled;
  final bool authRequired;
  final int serverRefreshInterval;
  final int connectionTimeout;
  final Map<String, bool> features;
  final Map<String, String> uiTexts;
  final String supportEmail;
  final String privacyPolicyUrl;
  final String termsOfServiceUrl;
  
  AppConfig({
    required this.maintenanceMode,
    required this.minAppVersion,
    this.forceUpdate = false,
    this.updateUrl = '',
    required this.killSwitchEnabled,
    required this.smartConnectEnabled,
    this.autoReconnectEnabled = true,
    this.authRequired = false,
    this.serverRefreshInterval = 3600,
    this.connectionTimeout = 30,
    required this.features,
    required this.uiTexts,
    this.supportEmail = '',
    this.privacyPolicyUrl = '',
    this.termsOfServiceUrl = '',
  });
  
  factory AppConfig.fromJson(Map<String, dynamic> json) {
    return AppConfig(
      maintenanceMode: json['maintenanceMode'] ?? false,
      minAppVersion: json['minAppVersion'] ?? '1.0.0',
      forceUpdate: json['forceUpdate'] ?? false,
      updateUrl: json['updateUrl'] ?? '',
      killSwitchEnabled: json['killSwitchEnabled'] ?? true,
      smartConnectEnabled: json['smartConnectEnabled'] ?? true,
      autoReconnectEnabled: json['autoReconnectEnabled'] ?? true,
      authRequired: json['authRequired'] ?? false,
      serverRefreshInterval: json['serverRefreshInterval'] ?? 3600,
      connectionTimeout: json['connectionTimeout'] ?? 30,
      features: Map<String, bool>.from(json['features'] ?? {}),
      uiTexts: Map<String, String>.from(json['uiTexts'] ?? {}),
      supportEmail: json['supportEmail'] ?? '',
      privacyPolicyUrl: json['privacyPolicyUrl'] ?? '',
      termsOfServiceUrl: json['termsOfServiceUrl'] ?? '',
    );
  }
  
  static AppConfig defaultConfig() {
    return AppConfig(
      maintenanceMode: false,
      minAppVersion: '1.0.0',
      killSwitchEnabled: true,
      smartConnectEnabled: true,
      authRequired: false,
      features: {
        'speedTest': true,
        'ipTest': true,
        'connectionHistory': true,
        'splitTunneling': false,
        'darkMode': true,
        'anonymousAccess': true,
      },
      uiTexts: {
        'welcomeMessage': 'Welcome to SuperVPN',
        'premiumCTA': 'Upgrade to Premium',
        'signUpCTA': 'Sign up for premium access',
      },
    );
  }
  
  bool get anonymousAccessEnabled => 
      features['anonymousAccess'] ?? true;
}

class AdConfig {
  final bool enabled;
  final String provider;
  final AdMobConfig admob;
  final FacebookConfig facebook;
  final AdFrequency adFrequency;
  final Map<String, AdPlacement> adPlacements;
  
  AdConfig({
    required this.enabled,
    this.provider = 'admob',
    required this.admob,
    required this.facebook,
    required this.adFrequency,
    required this.adPlacements,
  });
  
  factory AdConfig.fromJson(Map<String, dynamic> json) {
    return AdConfig(
      enabled: json['enabled'] ?? false,
      provider: json['provider'] ?? 'admob',
      admob: AdMobConfig.fromJson(json['admob'] ?? {}),
      facebook: FacebookConfig.fromJson(json['facebook'] ?? {}),
      adFrequency: AdFrequency.fromJson(json['adFrequency'] ?? {}),
      adPlacements: (json['adPlacements'] as Map<String, dynamic>? ?? {})
          .map((key, value) => MapEntry(key, AdPlacement.fromJson(value))),
    );
  }
  
  static AdConfig defaultDisabled() {
    return AdConfig(
      enabled: false,
      admob: AdMobConfig.empty(),
      facebook: FacebookConfig.empty(),
      adFrequency: AdFrequency.defaults(),
      adPlacements: {},
    );
  }
}
```

### 7.3 Subscription Models

```dart
class PricingPlan {
  final String id;
  final String name;
  final String description;
  final double price;
  final String currency;
  final String duration;
  final String? savings;
  final List<String> features;
  final String googlePlayProductId;
  final String appStoreProductId;
  final bool active;
  final bool isFeatured;
  final String? badge;
  
  PricingPlan({
    required this.id,
    required this.name,
    required this.description,
    required this.price,
    required this.currency,
    required this.duration,
    this.savings,
    required this.features,
    required this.googlePlayProductId,
    required this.appStoreProductId,
    required this.active,
    this.isFeatured = false,
    this.badge,
  });
  
  factory PricingPlan.fromJson(Map<String, dynamic> json) {
    return PricingPlan(
      id: json['id'],
      name: json['name'],
      description: json['description'],
      price: (json['price'] as num).toDouble(),
      currency: json['currency'] ?? 'USD',
      duration: json['duration'],
      savings: json['savings'],
      features: List<String>.from(json['features'] ?? []),
      googlePlayProductId: json['googlePlayProductId'],
      appStoreProductId: json['appStoreProductId'],
      active: json['active'] ?? true,
      isFeatured: json['isFeatured'] ?? false,
      badge: json['badge'],
    );
  }
}

class SubscriptionStatus {
  final bool isPremium;
  final String? plan;
  final DateTime? expiresAt;
  final bool autoRenew;
  
  SubscriptionStatus({
    required this.isPremium,
    this.plan,
    this.expiresAt,
    this.autoRenew = false,
  });
  
  factory SubscriptionStatus.fromJson(Map<String, dynamic> json) {
    return SubscriptionStatus(
      isPremium: json['isPremium'] ?? false,
      plan: json['plan'],
      expiresAt: json['expiresAt'] != null 
          ? DateTime.parse(json['expiresAt']) 
          : null,
      autoRenew: json['autoRenew'] ?? false,
    );
  }
}
```

---

## 8. BACKEND RECOMMENDATIONS

### 8.1 Required Backend Changes

**Update `/api/ovpn/get` endpoint**:
- Allow unauthenticated requests for FREE servers (premium: false)
- Require authentication ONLY for PREMIUM servers (premium: true)
- Return 403 with "Premium subscription required" if user tries premium without subscription

```javascript
// Example backend logic
app.get('/api/ovpn/get', async (req, res) => {
  const { serverId } = req.query;
  const server = await getServerById(serverId);
  
  if (!server) {
    return res.status(404).json({ error: 'Server not found' });
  }
  
  // Free servers - no auth required
  if (!server.premium) {
    const ovpnConfig = await getOVPNConfig(serverId);
    return res.status(200).send(ovpnConfig);
  }
  
  // Premium servers - auth required
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ error: 'Authentication required for premium servers' });
  }
  
  const user = await verifyToken(token);
  
  if (!user) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
  
  if (!user.isPremium) {
    return res.status(403).json({ error: 'Premium subscription required' });
  }
  
  const ovpnConfig = await getOVPNConfig(serverId);
  return res.status(200).send(ovpnConfig);
});
```

**Update User Schema** (for authenticated users only):
```json
{
  "uid": "user_unique_id",
  "email": "user@example.com",
  "passwordHash": "bcrypt_hash",
  "createdAt": "2024-11-24T12:00:00Z",
  "isPremium": false,
  "subscriptionType": null,
  "subscriptionExpiresAt": null,
  "purchasePlatform": null,
  "purchaseToken": null,
  "lastLoginAt": "2024-11-24T12:00:00Z"
}
```

**Update `/api/config?type=app`** to include:
```json
{
  "authRequired": false,
  "features": {
    "anonymousAccess": true,
    ...
  }
}
```

**Update `/api/pricing?action=list`** to return actual plans

**Update `/api/config?type=ads`** to include full config

**Add JWT-based authentication middleware** (only for premium features)

**Add Google Play / App Store purchase validation**

---

## 9. SECURITY CONSIDERATIONS

### 9.1 Token Management

```dart
class SecureStorage {
  static const _storage = FlutterSecureStorage();
  
  static Future<void> saveToken(String token) async {
    await _storage.write(key: 'auth_token', value: token);
  }
  
  static Future<String?> getToken() async {
    return await _storage.read(key: 'auth_token');
  }
  
  static Future<void> deleteToken() async {
    await _storage.delete(key: 'auth_token');
  }
  
  static Future<bool> isAuthenticated() async {
    final token = await getToken();
    return token != null && token.isNotEmpty;
  }
}
```

### 9.2 API Request Interceptor

```dart
class AuthInterceptor extends Interceptor {
  @override
  Future<void> onRequest(
    RequestOptions options,
    RequestInterceptorHandler handler,
  ) async {
    final token = await SecureStorage.getToken();
    
    // Only add auth header if token exists (for premium features)
    if (token != null) {
      options.headers['Authorization'] = 'Bearer $token';
    }
    
    handler.next(options);
  }
  
  @override
  void onError(DioError err, ErrorInterceptorHandler handler) {
    if (err.response?.statusCode == 401) {
      // Token expired - show login prompt
      handleTokenExpired();
    } else if (err.response?.statusCode == 403) {
      // Premium required - show upgrade prompt
      handlePremiumRequired();
    }
    
    handler.next(err);
  }
}
```

---

## SUMMARY OF KEY CHANGES

### ✅ Anonymous Access (Updated)
- **Anonymous users CAN use free VPN servers** without sign-up
- Anonymous users can browse all servers (premium shown as locked)
- Anonymous users see ads (if enabled)
- **Sign-up ONLY required for premium server access**

### ✅ Authentication Flow (Updated)
- Registration is **optional** for free users
- Registration is **required** for premium users
- JWT token-based authentication for premium features only
- Free servers accessible without authentication

### ✅ API Changes Required
- `/api/ovpn/get` must allow unauthenticated requests for free servers
- Premium servers require authentication + subscription
- Backend validates server type before requiring auth

### ✅ Fully Backend-Controlled
- **App Config**: Feature toggles, maintenance mode, anonymous access
- **Ad Config**: All ad IDs fetched from backend
- **Pricing Config**: Plans fetched from backend
- **Server List**: Free/Premium flags managed from backend

### ✅ Modular Architecture
- Configuration manager handles all backend configs
- Local caching with remote refresh
- Graceful fallbacks if backend unavailable
- No hardcoded IDs or settings in app

### ✅ User Experience
- **Frictionless onboarding** - no sign-up barrier
- **Progressive authentication** - only when needed
- **Clear value proposition** - users understand why sign-up is required
- **Smooth upgrade path** - from anonymous → free account → premium

This updated PRD ensures maximum user acquisition (no sign-up barrier) while maintaining premium monetization potential! 🚀