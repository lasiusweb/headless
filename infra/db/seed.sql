-- Seed data for KN Biosciences database

-- Insert sample segments
INSERT INTO segments (name, slug, description) VALUES
('Agriculture', 'agriculture', 'Products for farming and crop cultivation'),
('Aquaculture', 'aquaculture', 'Products for fish and aquatic farming'),
('Animal Husbandry', 'animal-husbandry', 'Products for livestock care'),
('Horticulture', 'horticulture', 'Products for garden and ornamental plants'),
('Plant Protection', 'plant-protection', 'Pesticides and protective solutions'),
('Soil Health', 'soil-health', 'Soil enhancement and nutrition products'),
('Seeds & Planting Material', 'seeds-planting', 'Quality seeds and planting materials'),
('Biofertilizers', 'biofertilizers', 'Organic and bio-based fertilizers'),
('Micro Nutrients', 'micro-nutrients', 'Trace elements and micro nutrients'),
('Growth Regulators', 'growth-regulators', 'Plant growth regulators and hormones');

-- Insert sample categories
INSERT INTO categories (name, slug, description) VALUES
('Fertilizers', 'fertilizers', 'Nutrient supplements for plants'),
('Pesticides', 'pesticides', 'Crop protection chemicals'),
('Herbicides', 'herbicides', 'Weed control solutions'),
('Seeds', 'seeds', 'Quality seeds for various crops'),
('Bio Products', 'bio-products', 'Biological pest control and organic solutions'),
('Growth Enhancers', 'growth-enhancers', 'Products to boost plant growth'),
('Soil Conditioners', 'soil-conditioners', 'Products to improve soil health'),
('Irrigation Equipment', 'irrigation-equipment', 'Equipment for water management');

-- Insert sample crops
INSERT INTO crops (name, slug, description) VALUES
('Rice', 'rice', 'Common cereal grain'),
('Wheat', 'wheat', 'Staple food crop'),
('Corn', 'corn', 'Cereal grain also known as maize'),
('Soybean', 'soybean', 'Legume used for oil and protein'),
('Cotton', 'cotton', 'Fiber crop'),
('Sugarcane', 'sugarcane', 'Sugar producing grass'),
('Tomato', 'tomato', 'Popular vegetable crop'),
('Potato', 'potato', 'Starchy tuber crop'),
('Onion', 'onion', 'Pungent bulb crop'),
('Chili', 'chili', 'Spicy fruit crop');

-- Insert sample problems
INSERT INTO problems (name, slug, description) VALUES
('Powdery Mildew', 'powdery-mildew', 'Fungal disease affecting leaves'),
('Aphids', 'aphids', 'Small sap-sucking insects'),
('White Flies', 'white-flies', 'Small winged insects'),
('Root Rot', 'root-rot', 'Fungal infection of roots'),
('Leaf Spot', 'leaf-spot', 'Fungal or bacterial leaf disease'),
('Bacterial Blight', 'bacterial-blight', 'Bacterial infection causing blight'),
('Nematodes', 'nematodes', 'Microscopic roundworms'),
('Thrips', 'thrips', 'Tiny insects that damage plants'),
('Mealybugs', 'mealybugs', 'Sap-sucking insects covered in wax'),
('Spider Mites', 'spider-mites', 'Tiny arachnids that feed on plants');

-- Insert sample warehouses
INSERT INTO warehouses (name, code, address, is_active) VALUES
('Main Warehouse Mumbai', 'MUM001', '{"address_line1": "123 Industrial Estate", "city": "Mumbai", "state": "Maharashtra", "pincode": "400001", "country": "India"}', true),
('Regional Warehouse Bangalore', 'BLR001', '{"address_line1": "456 Tech Park", "city": "Bangalore", "state": "Karnataka", "pincode": "560001", "country": "India"}', true),
('Branch Warehouse Chennai', 'CHE001', '{"address_line1": "789 Manufacturing Hub", "city": "Chennai", "state": "Tamil Nadu", "pincode": "600001", "country": "India"}', true);

-- Insert sample pricing tiers
INSERT INTO pricing_tiers (role, min_quantity, discount_percent, is_active) VALUES
('dealer', 10, 40.00, true),  -- 40% off for dealers with 10+ units
('distributor', 50, 45.00, true);  -- 45% off for distributors with 50+ units

-- Insert sample shipping carriers
INSERT INTO shipping_carriers (name, code, carrier_type, api_base_url, is_active) VALUES
('Delhivery', 'delhivery', 'api', 'https://track.delhivery.com', true),
('VRL Logistics', 'vrl', 'manual_lr', NULL, true),
('TCI Express', 'tci', 'api', 'https://api.tciexpress.com', true);

-- Insert sample coupons
INSERT INTO coupons (code, description, discount_type, discount_value, minimum_order_amount, usage_limit, expires_at, is_active) VALUES
('WELCOME10', 'Welcome discount for new customers', 'percentage', 10.00, 1000.00, 100, '2026-12-31', true),
('SEASON20', 'Seasonal discount', 'percentage', 20.00, 2000.00, 50, '2026-06-30', true),
('FREESHIP500', 'Free shipping on orders above ₹500', 'fixed_amount', 100.00, 500.00, 200, '2026-12-31', true);