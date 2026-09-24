-- Seed initial product data into products table idempotently

INSERT INTO products (name, description, price, image_url, category, stock_quantity, rating)
VALUES
(
  'Wireless Noise-Canceling Headphones',
  'Premium over-ear headphones with high-fidelity sound, active noise cancellation, and up to 30 hours of battery life.',
  199.99,
  'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80',
  'Electronics',
  45,
  4.8
),
(
  'Smartwatch Fitness Tracker',
  'Sleek smartwatch featuring heart rate monitoring, sleep tracking, GPS, and multi-sport mode tracking with 7-day battery.',
  129.50,
  'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80',
  'Electronics',
  30,
  4.6
),
(
  'Minimalist Leather Backpack',
  'Handcrafted genuine leather backpack with padded laptop compartment, water-resistant lining, and ergonomic straps.',
  89.99,
  'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&auto=format&fit=crop&q=80',
  'Fashion',
  60,
  4.7
),
(
  'Ergonomic Mechanical Keyboard',
  'Custom mechanical keyboard with tactile RGB switches, hot-swappable sockets, and durable PBT keycaps.',
  114.00,
  'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&auto=format&fit=crop&q=80',
  'Electronics',
  25,
  4.9
),
(
  'Stainless Steel Insulated Tumbler',
  'Double-wall vacuum insulated 32oz water bottle that keeps beverages cold for 24 hours or hot for 12 hours.',
  24.99,
  'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600&auto=format&fit=crop&q=80',
  'Home & Kitchen',
  100,
  4.5
),
(
  'Ultra HD Action Camera 4K',
  'Waterproof 4K action camera with wide-angle lens, electronic image stabilization, and dual screen display.',
  149.99,
  'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&auto=format&fit=crop&q=80',
  'Electronics',
  20,
  4.4
),
(
  'Classic Denim Jacket',
  'Timeless cotton denim jacket featuring button closure, dual chest pockets, and comfortable relaxed fit.',
  59.95,
  'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=600&auto=format&fit=crop&q=80',
  'Fashion',
  40,
  4.6
),
(
  'Aromatherapy Essential Oil Diffuser',
  'Ultrasonic diffuser with 7-color LED mood lights, auto shut-off safety switch, and whisper-quiet operation.',
  34.50,
  'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=600&auto=format&fit=crop&q=80',
  'Home & Kitchen',
  50,
  4.3
)
ON CONFLICT DO NOTHING;
