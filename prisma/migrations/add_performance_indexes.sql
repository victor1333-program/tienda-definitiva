-- Performance optimization indexes for the Lovilike e-commerce platform

-- User indexes for authentication and user management
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);

-- Product indexes for catalog and search
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(featured);
CREATE INDEX IF NOT EXISTS idx_products_top_selling ON products(top_selling);
CREATE INDEX IF NOT EXISTS idx_products_brand ON products(brand);
CREATE INDEX IF NOT EXISTS idx_products_supplier ON products(supplier);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at);
CREATE INDEX IF NOT EXISTS idx_products_updated_at ON products(updated_at);
CREATE INDEX IF NOT EXISTS idx_products_base_price ON products(base_price);
CREATE INDEX IF NOT EXISTS idx_products_stock ON products(stock);

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_products_active_featured ON products(is_active, featured);
CREATE INDEX IF NOT EXISTS idx_products_active_brand ON products(is_active, brand);
CREATE INDEX IF NOT EXISTS idx_products_active_price ON products(is_active, base_price);

-- Full-text search on product names and descriptions
CREATE INDEX IF NOT EXISTS idx_products_name_search ON products USING gin(to_tsvector('spanish', name));
CREATE INDEX IF NOT EXISTS idx_products_description_search ON products USING gin(to_tsvector('spanish', description));

-- Category indexes
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_is_active ON categories(is_active);
CREATE INDEX IF NOT EXISTS idx_categories_sort_order ON categories(sort_order);
CREATE INDEX IF NOT EXISTS idx_categories_category_type ON categories(category_type);

-- Product-Category relationship indexes
CREATE INDEX IF NOT EXISTS idx_product_categories_product_id ON product_categories(product_id);
CREATE INDEX IF NOT EXISTS idx_product_categories_category_id ON product_categories(category_id);
CREATE INDEX IF NOT EXISTS idx_product_categories_is_primary ON product_categories(is_primary);

-- Order indexes for order management and reporting
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_orders_updated_at ON orders(updated_at);
CREATE INDEX IF NOT EXISTS idx_orders_total_amount ON orders(total_amount);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);

-- Composite indexes for orders
CREATE INDEX IF NOT EXISTS idx_orders_user_status ON orders(user_id, status);
CREATE INDEX IF NOT EXISTS idx_orders_status_date ON orders(status, created_at);
CREATE INDEX IF NOT EXISTS idx_orders_user_date ON orders(user_id, created_at);

-- Order items indexes
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);
CREATE INDEX IF NOT EXISTS idx_order_items_variant_id ON order_items(variant_id);

-- Product variants indexes
CREATE INDEX IF NOT EXISTS idx_product_variants_product_id ON product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_product_variants_sku ON product_variants(sku);
CREATE INDEX IF NOT EXISTS idx_product_variants_is_active ON product_variants(is_active);

-- Address indexes
CREATE INDEX IF NOT EXISTS idx_addresses_user_id ON addresses(user_id);
CREATE INDEX IF NOT EXISTS idx_addresses_is_default ON addresses(is_default);

-- Session indexes for authentication
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires);

-- Account indexes for OAuth
CREATE INDEX IF NOT EXISTS idx_accounts_user_id ON accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_accounts_provider ON accounts(provider);

-- Financial transaction indexes
CREATE INDEX IF NOT EXISTS idx_financial_transactions_user_id ON financial_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_financial_transactions_type ON financial_transactions(type);
CREATE INDEX IF NOT EXISTS idx_financial_transactions_status ON financial_transactions(status);
CREATE INDEX IF NOT EXISTS idx_financial_transactions_created_at ON financial_transactions(created_at);

-- Notification indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);

-- Supplier indexes
CREATE INDEX IF NOT EXISTS idx_suppliers_is_active ON suppliers(is_active);
CREATE INDEX IF NOT EXISTS idx_suppliers_created_at ON suppliers(created_at);

-- Product-Supplier relationship indexes
CREATE INDEX IF NOT EXISTS idx_product_suppliers_product_id ON product_suppliers(product_id);
CREATE INDEX IF NOT EXISTS idx_product_suppliers_supplier_id ON product_suppliers(supplier_id);
CREATE INDEX IF NOT EXISTS idx_product_suppliers_is_primary ON product_suppliers(is_primary);

-- Workshop process indexes for production management
CREATE INDEX IF NOT EXISTS idx_workshop_processes_product_id ON workshop_processes(product_id);
CREATE INDEX IF NOT EXISTS idx_workshop_processes_is_active ON workshop_processes(is_active);
CREATE INDEX IF NOT EXISTS idx_workshop_processes_order_index ON workshop_processes(order_index);

-- Material movement indexes for inventory
CREATE INDEX IF NOT EXISTS idx_material_movements_user_id ON material_movements(user_id);
CREATE INDEX IF NOT EXISTS idx_material_movements_movement_type ON material_movements(movement_type);
CREATE INDEX IF NOT EXISTS idx_material_movements_created_at ON material_movements(created_at);

-- Brand stock movement indexes
CREATE INDEX IF NOT EXISTS idx_brand_stock_movements_user_id ON brand_stock_movements(user_id);
CREATE INDEX IF NOT EXISTS idx_brand_stock_movements_brand ON brand_stock_movements(brand);
CREATE INDEX IF NOT EXISTS idx_brand_stock_movements_movement_type ON brand_stock_movements(movement_type);
CREATE INDEX IF NOT EXISTS idx_brand_stock_movements_created_at ON brand_stock_movements(created_at);

-- Zakeke system indexes for customization
CREATE INDEX IF NOT EXISTS idx_product_sides_product_id ON product_sides(product_id);
CREATE INDEX IF NOT EXISTS idx_product_sides_is_active ON product_sides(is_active);

CREATE INDEX IF NOT EXISTS idx_print_areas_side_id ON print_areas(side_id);
CREATE INDEX IF NOT EXISTS idx_print_areas_is_active ON print_areas(is_active);

CREATE INDEX IF NOT EXISTS idx_design_elements_area_id ON design_elements(area_id);
CREATE INDEX IF NOT EXISTS idx_design_elements_element_type ON design_elements(element_type);

CREATE INDEX IF NOT EXISTS idx_zakeke_templates_is_active ON zakeke_templates(is_active);
CREATE INDEX IF NOT EXISTS idx_zakeke_templates_created_by ON zakeke_templates(created_by);
CREATE INDEX IF NOT EXISTS idx_zakeke_templates_category ON zakeke_templates(category);

CREATE INDEX IF NOT EXISTS idx_customer_designs_user_id ON customer_designs(user_id);
CREATE INDEX IF NOT EXISTS idx_customer_designs_product_id ON customer_designs(product_id);
CREATE INDEX IF NOT EXISTS idx_customer_designs_status ON customer_designs(status);
CREATE INDEX IF NOT EXISTS idx_customer_designs_created_at ON customer_designs(created_at);

-- LoviBox subscription indexes
CREATE INDEX IF NOT EXISTS idx_lovibox_subscriptions_customer_id ON lovibox_subscriptions(customer_id);
CREATE INDEX IF NOT EXISTS idx_lovibox_subscriptions_status ON lovibox_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_lovibox_subscriptions_plan_type ON lovibox_subscriptions(plan_type);
CREATE INDEX IF NOT EXISTS idx_lovibox_subscriptions_next_delivery ON lovibox_subscriptions(next_delivery);

CREATE INDEX IF NOT EXISTS idx_lovibox_deliveries_subscription_id ON lovibox_deliveries(subscription_id);
CREATE INDEX IF NOT EXISTS idx_lovibox_deliveries_status ON lovibox_deliveries(status);
CREATE INDEX IF NOT EXISTS idx_lovibox_deliveries_scheduled_date ON lovibox_deliveries(scheduled_date);

CREATE INDEX IF NOT EXISTS idx_lovibox_templates_is_active ON lovibox_templates(is_active);
CREATE INDEX IF NOT EXISTS idx_lovibox_templates_created_by ON lovibox_templates(created_by);
CREATE INDEX IF NOT EXISTS idx_lovibox_templates_category ON lovibox_templates(category);

-- User subscription indexes
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON user_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_plan_name ON user_subscriptions(plan_name);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_expires_at ON user_subscriptions(expires_at);

-- Menu system indexes
CREATE INDEX IF NOT EXISTS idx_menu_items_menu_id ON menu_items(menu_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_parent_id ON menu_items(parent_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_is_active ON menu_items(is_active);
CREATE INDEX IF NOT EXISTS idx_menu_items_sort_order ON menu_items(sort_order);

CREATE INDEX IF NOT EXISTS idx_menus_is_active ON menus(is_active);
CREATE INDEX IF NOT EXISTS idx_menus_location ON menus(location);

-- Page system indexes
CREATE INDEX IF NOT EXISTS idx_pages_slug ON pages(slug);
CREATE INDEX IF NOT EXISTS idx_pages_is_published ON pages(is_published);
CREATE INDEX IF NOT EXISTS idx_pages_created_at ON pages(created_at);

-- Discount system indexes
CREATE INDEX IF NOT EXISTS idx_discounts_code ON discounts(code);
CREATE INDEX IF NOT EXISTS idx_discounts_is_active ON discounts(is_active);
CREATE INDEX IF NOT EXISTS idx_discounts_valid_from ON discounts(valid_from);
CREATE INDEX IF NOT EXISTS idx_discounts_valid_until ON discounts(valid_until);

-- Composite index for checking valid discounts
CREATE INDEX IF NOT EXISTS idx_discounts_valid_active ON discounts(is_active, valid_from, valid_until);

-- Order discount usage indexes
CREATE INDEX IF NOT EXISTS idx_order_discounts_order_id ON order_discounts(order_id);
CREATE INDEX IF NOT EXISTS idx_order_discounts_discount_id ON order_discounts(discount_id);

-- Performance hints and comments
COMMENT ON INDEX idx_products_name_search IS 'Full-text search index for product names in Spanish';
COMMENT ON INDEX idx_products_description_search IS 'Full-text search index for product descriptions in Spanish';
COMMENT ON INDEX idx_orders_status_date IS 'Composite index for order status filtering with date sorting';
COMMENT ON INDEX idx_products_active_featured IS 'Composite index for featured product queries';

-- Analyze tables to update statistics after creating indexes
ANALYZE users;
ANALYZE products;
ANALYZE categories;
ANALYZE orders;
ANALYZE order_items;
ANALYZE product_variants;
ANALYZE product_categories;
ANALYZE notifications;
ANALYZE financial_transactions;