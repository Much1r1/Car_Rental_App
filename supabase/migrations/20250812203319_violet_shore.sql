/*
  # Sample Data for Car Rental & Auto Shop

  1. Sample Data
    - Demo profiles for different user roles
    - Sample cars with various brands and models
    - Sample spare parts across different categories
    - Demo bookings and reviews

  2. Testing
    - Provides realistic data for testing all features
    - Covers different scenarios and edge cases
*/

-- Insert sample profiles
INSERT INTO profiles (id, name, phone, role, avatar_url) VALUES
  (gen_random_uuid(), 'John Customer', '+254712345678', 'customer', 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=400'),
  (gen_random_uuid(), 'Admin User', '+254723456789', 'admin', 'https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?auto=compress&cs=tinysrgb&w=400'),
  (gen_random_uuid(), 'Shop Manager', '+254734567890', 'shop_manager', 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=400');

-- Insert sample cars
INSERT INTO cars (brand, model, year, price_per_day, location, status, image_url, description, features, license_plate) VALUES
  ('Toyota', 'Camry', 2022, 50.00, 'Nairobi CBD', 'available', 'https://images.pexels.com/photos/116675/pexels-photo-116675.jpeg?auto=compress&cs=tinysrgb&w=800', 'Comfortable sedan perfect for city driving', ARRAY['AC', 'GPS', 'Bluetooth', 'Backup Camera'], 'KCA001A'),
  ('Honda', 'CR-V', 2023, 75.00, 'Westlands', 'available', 'https://images.pexels.com/photos/1545743/pexels-photo-1545743.jpeg?auto=compress&cs=tinysrgb&w=800', 'Spacious SUV ideal for family trips', ARRAY['AC', 'GPS', 'Sunroof', '4WD'], 'KCB002B'),
  ('BMW', '3 Series', 2021, 120.00, 'Karen', 'available', 'https://images.pexels.com/photos/244206/pexels-photo-244206.jpeg?auto=compress&cs=tinysrgb&w=800', 'Luxury sedan with premium features', ARRAY['Leather Seats', 'Premium Sound', 'Navigation', 'Heated Seats'], 'KCC003C'),
  ('Nissan', 'X-Trail', 2022, 80.00, 'Kilimani', 'booked', 'https://images.pexels.com/photos/1164778/pexels-photo-1164778.jpeg?auto=compress&cs=tinysrgb&w=800', 'Reliable SUV for adventure trips', ARRAY['AC', 'GPS', '4WD', 'Roof Rails'], 'KCD004D'),
  ('Mercedes-Benz', 'C-Class', 2023, 150.00, 'Upperhill', 'available', 'https://images.pexels.com/photos/210019/pexels-photo-210019.jpeg?auto=compress&cs=tinysrgb&w=800', 'Executive luxury vehicle', ARRAY['Premium Interior', 'Advanced Safety', 'Wireless Charging', 'Ambient Lighting'], 'KCE005E'),
  ('Subaru', 'Forester', 2021, 65.00, 'Parklands', 'available', 'https://images.pexels.com/photos/1592384/pexels-photo-1592384.jpeg?auto=compress&cs=tinysrgb&w=800', 'All-wheel drive SUV for all terrains', ARRAY['AWD', 'Safety Features', 'Cargo Space', 'Hill Assist'], 'KCF006F');

-- Insert sample spare parts
INSERT INTO spare_parts (name, category, price, stock, image_url, description, brand, part_number) VALUES
  ('Brake Pads', 'Brakes', 45.00, 50, 'https://images.pexels.com/photos/4489734/pexels-photo-4489734.jpeg?auto=compress&cs=tinysrgb&w=400', 'High-quality ceramic brake pads', 'Brembo', 'BP001'),
  ('Oil Filter', 'Engine', 15.00, 100, 'https://images.pexels.com/photos/4489736/pexels-photo-4489736.jpeg?auto=compress&cs=tinysrgb&w=400', 'Premium oil filter for engine protection', 'Mann Filter', 'OF002'),
  ('Air Filter', 'Engine', 25.00, 75, 'https://images.pexels.com/photos/4489735/pexels-photo-4489735.jpeg?auto=compress&cs=tinysrgb&w=400', 'High-flow air filter for better performance', 'K&N', 'AF003'),
  ('Spark Plugs', 'Engine', 35.00, 80, 'https://images.pexels.com/photos/4489737/pexels-photo-4489737.jpeg?auto=compress&cs=tinysrgb&w=400', 'Iridium spark plugs for optimal ignition', 'NGK', 'SP004'),
  ('Headlight Bulbs', 'Lighting', 20.00, 60, 'https://images.pexels.com/photos/4489738/pexels-photo-4489738.jpeg?auto=compress&cs=tinysrgb&w=400', 'LED headlight bulbs for better visibility', 'Philips', 'HB005'),
  ('Wiper Blades', 'Exterior', 18.00, 40, 'https://images.pexels.com/photos/4489739/pexels-photo-4489739.jpeg?auto=compress&cs=tinysrgb&w=400', 'All-season wiper blades', 'Bosch', 'WB006'),
  ('Battery', 'Electrical', 120.00, 20, 'https://images.pexels.com/photos/4489740/pexels-photo-4489740.jpeg?auto=compress&cs=tinysrgb&w=400', '12V automotive battery with long life', 'Optima', 'BT007'),
  ('Tire Set', 'Tires', 300.00, 15, 'https://images.pexels.com/photos/4489741/pexels-photo-4489741.jpeg?auto=compress&cs=tinysrgb&w=400', 'All-season tire set (4 pieces)', 'Michelin', 'TS008');

-- Insert sample GPS tracking data
INSERT INTO gps_tracking (car_id, latitude, longitude, speed) 
SELECT 
  id,
  -1.2921 + (random() * 0.1 - 0.05), -- Around Nairobi coordinates
  36.8219 + (random() * 0.1 - 0.05),
  random() * 60 -- Random speed 0-60 km/h
FROM cars 
WHERE status = 'booked';

-- Insert sample reviews
INSERT INTO reviews (user_id, car_id, rating, comment)
SELECT 
  (SELECT id FROM profiles WHERE role = 'customer' LIMIT 1),
  c.id,
  4 + (random() * 1)::integer, -- Random rating 4-5
  CASE 
    WHEN random() < 0.5 THEN 'Great car, smooth ride and excellent condition!'
    ELSE 'Very satisfied with the rental experience. Highly recommended!'
  END
FROM cars c
WHERE random() < 0.7; -- 70% of cars have reviews

-- Functions for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updating timestamps
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cars_updated_at BEFORE UPDATE ON cars
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_spare_parts_updated_at BEFORE UPDATE ON spare_parts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();