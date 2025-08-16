CAR RENTAL APP "RIDEX"

A cross-platform car rental and spare parts management app built with Expo (React Native) and Supabase.  
The app allows customers to browse available cars, make bookings, order spare parts, and leave reviews, while admins and managers can manage fleet availability and orders.

FEATURES
- Authentication (Supabase Auth with persisted sessions)
- Car management (available, booked, maintenance, out of service)
- Spare parts shop & orders
- Booking system with pricing calculation
- User reviews for cars and spare parts
- Role-based access: customer, admin, shop manager
- Cross-platform (iOS, Android, Web with Expo)

TECH STACK
- Expo (React Native)
- Supabase (Database, Auth, API)
- AsyncStorage (session storage)
- react-native-url-polyfill (polyfills for Supabase)
- TypeScript for types & models

SETUP AND INSTALLATION

1. Clone the repo
git clone https://github.com/Much1r1/Car_Rental_App.git

2. Install dependencies
npm install

3. Run the app

npx expo start


AUTHENTICATION

Supabase handles sign up, sign in, and session persistence using `AsyncStorage`.
To use secure storage instead of AsyncStorage (recommended for production), swap in Expo SecureStore.

DATABASE SCHEMA

Profiles

* `id` (uuid, PK)
* `name`
* `phone`
* `role` (`customer | admin | shop_manager`)
* `avatar_url`

Cars

* `id`
* `brand`, `model`, `year`
* `price_per_day`
* `status` (`available | booked | maintenance | out_of_service`)

Bookings

* `id`, `car_id`, `user_id`
* `start_date`, `end_date`
* `total_price`
* `status` (`pending | confirmed | active | completed | cancelled`)

Spare Parts

* `id`, `name`, `category`, `price`, `stock`

Orders

* `id`, `user_id`, `spare_part_id`, `quantity`, `status`

Reviews

* `id`, `user_id`, `car_id?`, `spare_part_id?`, `rating`, `comment`

DEPLOYMENT

* Expo Go for testing locally
* EAS Build for publishing to iOS/Android
* Web build with Expo Router (`expo export`)

