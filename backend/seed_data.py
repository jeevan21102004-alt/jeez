"""Seed data for CalAI: 200+ foods, 30 days of sample logs, demo user profile."""
from __future__ import annotations

import random
from datetime import date, timedelta

from sqlalchemy.orm import Session

from backend.models.exercise_log import ExerciseLog
from backend.models.food_database import FoodItem
from backend.models.food_log import FoodLog, WaterLog, WeightLog
from backend.models.user import UserProfile

# ---------------------------------------------------------------------------
# 200+ common foods with real-world nutrition per 100g
# ---------------------------------------------------------------------------

FOODS = [
    # ── Fruits ──────────────────────────────────────────────
    ("Apple", "", "Fruits", 52, 0.3, 14, 0.2, 2.4, 10.4, 1),
    ("Banana", "", "Fruits", 89, 1.1, 23, 0.3, 2.6, 12.2, 1),
    ("Orange", "", "Fruits", 47, 0.9, 12, 0.1, 2.4, 9.4, 0),
    ("Strawberries", "", "Fruits", 32, 0.7, 7.7, 0.3, 2.0, 4.9, 1),
    ("Blueberries", "", "Fruits", 57, 0.7, 14, 0.3, 2.4, 10, 1),
    ("Grapes", "", "Fruits", 69, 0.7, 18, 0.2, 0.9, 16, 2),
    ("Watermelon", "", "Fruits", 30, 0.6, 7.6, 0.2, 0.4, 6.2, 1),
    ("Mango", "", "Fruits", 60, 0.8, 15, 0.4, 1.6, 13.7, 1),
    ("Pineapple", "", "Fruits", 50, 0.5, 13, 0.1, 1.4, 9.9, 1),
    ("Avocado", "", "Fruits", 160, 2.0, 8.5, 14.7, 6.7, 0.7, 7),
    ("Peach", "", "Fruits", 39, 0.9, 9.5, 0.3, 1.5, 8.4, 0),
    ("Pear", "", "Fruits", 57, 0.4, 15, 0.1, 3.1, 9.8, 1),
    ("Kiwi", "", "Fruits", 61, 1.1, 15, 0.5, 3.0, 9.0, 3),
    ("Papaya", "", "Fruits", 43, 0.5, 11, 0.3, 1.7, 7.8, 8),
    ("Pomegranate", "", "Fruits", 83, 1.7, 19, 1.2, 4.0, 13.7, 3),
    ("Cherries", "", "Fruits", 50, 1.0, 12, 0.3, 1.6, 8.5, 0),

    # ── Vegetables ──────────────────────────────────────────
    ("Broccoli", "", "Vegetables", 34, 2.8, 7, 0.4, 2.6, 1.7, 33),
    ("Spinach", "", "Vegetables", 23, 2.9, 3.6, 0.4, 2.2, 0.4, 79),
    ("Carrot", "", "Vegetables", 41, 0.9, 10, 0.2, 2.8, 4.7, 69),
    ("Tomato", "", "Vegetables", 18, 0.9, 3.9, 0.2, 1.2, 2.6, 5),
    ("Cucumber", "", "Vegetables", 15, 0.7, 3.6, 0.1, 0.5, 1.7, 2),
    ("Bell Pepper", "", "Vegetables", 31, 1.0, 6, 0.3, 2.1, 4.2, 4),
    ("Sweet Potato", "", "Vegetables", 86, 1.6, 20, 0.1, 3.0, 4.2, 55),
    ("Cauliflower", "", "Vegetables", 25, 1.9, 5, 0.3, 2.0, 1.9, 30),
    ("Kale", "", "Vegetables", 49, 4.3, 9, 0.9, 3.6, 2.3, 38),
    ("Zucchini", "", "Vegetables", 17, 1.2, 3.1, 0.3, 1.0, 2.5, 8),
    ("Asparagus", "", "Vegetables", 20, 2.2, 3.9, 0.1, 2.1, 1.9, 2),
    ("Green Beans", "", "Vegetables", 31, 1.8, 7, 0.1, 3.4, 1.4, 6),
    ("Mushrooms", "", "Vegetables", 22, 3.1, 3.3, 0.3, 1.0, 2.0, 5),
    ("Onion", "", "Vegetables", 40, 1.1, 9.3, 0.1, 1.7, 4.2, 4),
    ("Corn", "", "Vegetables", 86, 3.2, 19, 1.2, 2.7, 6.3, 15),
    ("Lettuce (Romaine)", "", "Vegetables", 17, 1.2, 3.3, 0.3, 2.1, 1.2, 8),
    ("Cabbage", "", "Vegetables", 25, 1.3, 5.8, 0.1, 2.5, 3.2, 18),

    # ── Grains & Bread ─────────────────────────────────────
    ("White Rice (cooked)", "", "Grains", 130, 2.7, 28, 0.3, 0.4, 0.1, 1),
    ("Brown Rice (cooked)", "", "Grains", 111, 2.6, 23, 0.9, 1.8, 0.4, 5),
    ("Oatmeal (cooked)", "", "Grains", 68, 2.5, 12, 1.4, 1.7, 0.3, 2),
    ("Whole Wheat Bread", "", "Grains", 247, 13, 41, 3.4, 7.0, 5.6, 400),
    ("White Bread", "", "Grains", 265, 9, 49, 3.2, 2.7, 5.0, 491),
    ("Pasta (cooked)", "", "Grains", 131, 5, 25, 1.1, 1.8, 0.6, 1),
    ("Quinoa (cooked)", "", "Grains", 120, 4.4, 21, 1.9, 2.8, 0.9, 7),
    ("Tortilla (flour)", "", "Grains", 312, 8.2, 52, 8.0, 2.1, 1.6, 536),
    ("Granola", "", "Grains", 471, 10, 64, 20, 5.3, 24, 26),
    ("Pancakes", "", "Grains", 227, 6.4, 28, 10, 1, 7.5, 439),
    ("Bagel", "", "Grains", 257, 10, 50, 1.6, 2.3, 5.2, 450),
    ("Corn Flakes", "", "Grains", 357, 7, 84, 0.4, 3.3, 8, 729),
    ("Couscous (cooked)", "", "Grains", 112, 3.8, 23, 0.2, 1.4, 0.3, 5),

    # ── Protein – Meat ─────────────────────────────────────
    ("Chicken Breast (grilled)", "", "Protein", 165, 31, 0, 3.6, 0, 0, 74),
    ("Chicken Thigh (grilled)", "", "Protein", 209, 26, 0, 10.9, 0, 0, 84),
    ("Turkey Breast", "", "Protein", 135, 30, 0, 0.7, 0, 0, 46),
    ("Beef Steak (sirloin)", "", "Protein", 271, 26, 0, 18, 0, 0, 54),
    ("Ground Beef (90% lean)", "", "Protein", 176, 20, 0, 10, 0, 0, 66),
    ("Pork Chop", "", "Protein", 231, 25, 0, 14, 0, 0, 55),
    ("Lamb Leg", "", "Protein", 258, 25, 0, 17, 0, 0, 59),
    ("Bacon", "", "Protein", 541, 37, 1.4, 42, 0, 0, 1717),
    ("Sausage (pork)", "", "Protein", 301, 18, 1, 25, 0, 1, 749),
    ("Ham", "", "Protein", 145, 21, 1.5, 5.5, 0, 0, 1203),

    # ── Protein – Seafood ──────────────────────────────────
    ("Salmon (baked)", "", "Protein", 208, 20, 0, 13, 0, 0, 59),
    ("Tuna (canned)", "", "Protein", 116, 26, 0, 0.8, 0, 0, 338),
    ("Shrimp", "", "Protein", 99, 24, 0.2, 0.3, 0, 0, 111),
    ("Tilapia", "", "Protein", 128, 26, 0, 2.7, 0, 0, 56),
    ("Cod", "", "Protein", 82, 18, 0, 0.7, 0, 0, 54),
    ("Sardines (canned)", "", "Protein", 208, 25, 0, 11, 0, 0, 505),
    ("Crab", "", "Protein", 97, 19, 0, 1.5, 0, 0, 332),
    ("Lobster", "", "Protein", 89, 19, 0, 0.9, 0, 0, 486),

    # ── Protein – Plant ────────────────────────────────────
    ("Tofu (firm)", "", "Protein", 76, 8, 1.9, 4.8, 0.3, 0.6, 7),
    ("Tempeh", "", "Protein", 193, 19, 9.4, 11, 0, 0, 9),
    ("Lentils (cooked)", "", "Protein", 116, 9, 20, 0.4, 7.9, 1.8, 2),
    ("Black Beans (cooked)", "", "Protein", 132, 8.9, 24, 0.5, 8.7, 0.3, 1),
    ("Chickpeas (cooked)", "", "Protein", 164, 8.9, 27, 2.6, 7.6, 4.8, 7),
    ("Edamame", "", "Protein", 121, 12, 8.9, 5.2, 5.2, 2.2, 6),
    ("Peanut Butter", "", "Protein", 588, 25, 20, 50, 6, 9.4, 459),
    ("Almonds", "", "Protein", 579, 21, 22, 50, 12.5, 4.4, 1),
    ("Walnuts", "", "Protein", 654, 15, 14, 65, 6.7, 2.6, 2),
    ("Pumpkin Seeds", "", "Protein", 559, 30, 11, 49, 6.0, 1.4, 7),

    # ── Dairy ──────────────────────────────────────────────
    ("Whole Milk", "", "Dairy", 61, 3.2, 4.8, 3.3, 0, 5.1, 43),
    ("Skim Milk", "", "Dairy", 34, 3.4, 5, 0.1, 0, 5.1, 42),
    ("Greek Yogurt (plain)", "", "Dairy", 59, 10, 3.6, 0.4, 0, 3.2, 36),
    ("Yogurt (plain)", "", "Dairy", 63, 5.3, 7.0, 1.6, 0, 7.0, 46),
    ("Cheddar Cheese", "", "Dairy", 403, 25, 1.3, 33, 0, 0.3, 621),
    ("Mozzarella", "", "Dairy", 280, 28, 3.1, 17, 0, 1.0, 627),
    ("Parmesan", "", "Dairy", 431, 38, 4.1, 29, 0, 0.9, 1529),
    ("Cottage Cheese", "", "Dairy", 98, 11, 3.4, 4.3, 0, 2.7, 364),
    ("Cream Cheese", "", "Dairy", 342, 6, 4, 34, 0, 3.8, 321),
    ("Butter", "", "Dairy", 717, 0.9, 0.1, 81, 0, 0.1, 11),
    ("Egg (whole, boiled)", "", "Dairy", 155, 13, 1.1, 11, 0, 1.1, 124),
    ("Egg White", "", "Dairy", 52, 11, 0.7, 0.2, 0, 0.7, 166),
    ("Whey Protein Powder", "", "Dairy", 380, 75, 8, 5, 0, 4, 200),

    # ── Snacks ─────────────────────────────────────────────
    ("Potato Chips", "", "Snacks", 536, 7, 53, 35, 4.8, 0.3, 525),
    ("Popcorn (air-popped)", "", "Snacks", 387, 13, 78, 4.5, 14.5, 0.9, 8),
    ("Dark Chocolate (70%)", "", "Snacks", 598, 7.8, 46, 43, 11, 24, 20),
    ("Milk Chocolate", "", "Snacks", 535, 7.6, 60, 30, 3.4, 52, 79),
    ("Trail Mix", "", "Snacks", 462, 14, 44, 29, 3.5, 29, 65),
    ("Protein Bar", "Generic", "Snacks", 350, 20, 40, 12, 5, 15, 250),
    ("Rice Cake", "", "Snacks", 387, 8, 82, 2.8, 1.3, 0.3, 272),
    ("Pretzels", "", "Snacks", 381, 10, 79, 3.5, 2.8, 2.3, 1357),
    ("Crackers (whole wheat)", "", "Snacks", 427, 10, 65, 15, 5.5, 6, 659),
    ("Hummus", "", "Snacks", 166, 7.9, 14, 9.6, 6, 0.3, 379),
    ("Guacamole", "", "Snacks", 160, 2, 9, 15, 7, 0.7, 375),
    ("Granola Bar", "", "Snacks", 471, 7, 65, 21, 3.5, 28, 198),
    ("Dried Cranberries", "", "Snacks", 308, 0.1, 83, 1.4, 5.7, 73, 3),
    ("Beef Jerky", "", "Snacks", 410, 33, 11, 26, 1.8, 9, 2081),

    # ── Beverages ──────────────────────────────────────────
    ("Orange Juice", "", "Beverages", 45, 0.7, 10, 0.2, 0.2, 8.4, 1),
    ("Apple Juice", "", "Beverages", 46, 0.1, 11, 0.1, 0.2, 9.6, 4),
    ("Coca-Cola", "", "Beverages", 42, 0, 11, 0, 0, 10.6, 4),
    ("Coffee (black)", "", "Beverages", 2, 0.3, 0, 0, 0, 0, 2),
    ("Green Tea", "", "Beverages", 1, 0.2, 0.3, 0, 0, 0, 1),
    ("Protein Shake", "Generic", "Beverages", 120, 24, 5, 2, 1, 3, 150),
    ("Coconut Water", "", "Beverages", 19, 0.7, 3.7, 0.2, 1.1, 2.6, 105),
    ("Sports Drink", "Generic", "Beverages", 26, 0, 6.4, 0, 0, 5.9, 41),
    ("Smoothie (fruit)", "Generic", "Beverages", 55, 0.8, 13, 0.3, 0.5, 11, 6),
    ("Almond Milk", "", "Beverages", 17, 0.6, 0.6, 1.5, 0, 0, 72),
    ("Oat Milk", "", "Beverages", 48, 1, 7, 1.5, 0.8, 4, 42),
    ("Lemonade", "", "Beverages", 40, 0.1, 10, 0, 0, 9.6, 3),

    # ── Fast Food / Prepared ───────────────────────────────
    ("Pizza (cheese slice)", "Generic", "Fast Food", 266, 11, 33, 10, 2.3, 3.6, 598),
    ("Burger (beef patty)", "Generic", "Fast Food", 295, 17, 24, 14, 1.3, 5, 495),
    ("French Fries", "Generic", "Fast Food", 312, 3.4, 41, 15, 3.8, 0.3, 210),
    ("Hot Dog", "Generic", "Fast Food", 290, 10, 24, 17, 0.8, 4.1, 810),
    ("Chicken Nuggets", "Generic", "Fast Food", 296, 15, 18, 18, 1, 0.5, 564),
    ("Burrito (chicken)", "Generic", "Fast Food", 188, 11, 22, 6.5, 2, 1.5, 495),
    ("Fried Rice", "Generic", "Fast Food", 163, 3.5, 23, 6, 0.8, 0.5, 490),
    ("Ramen (instant)", "Generic", "Fast Food", 436, 10, 55, 19, 2, 2, 1731),
    ("Mac and Cheese", "Generic", "Fast Food", 164, 7, 18, 7, 1, 3, 485),
    ("Fish and Chips", "Generic", "Fast Food", 233, 12, 20, 12, 1, 0.5, 329),
    ("Grilled Cheese Sandwich", "Generic", "Fast Food", 349, 14, 28, 20, 1.6, 4.8, 674),
    ("Caesar Salad", "Generic", "Fast Food", 127, 5, 6, 10, 1.5, 1.5, 298),
    ("Chicken Caesar Wrap", "Generic", "Fast Food", 193, 14, 17, 8, 1.3, 2, 530),
    ("Sushi (California Roll)", "Generic", "Fast Food", 145, 3, 28, 2.2, 0.6, 3.6, 350),

    # ── International Cuisine ──────────────────────────────
    ("Butter Chicken", "Generic", "International", 150, 15, 6, 8, 0.5, 2, 380),
    ("Chicken Tikka Masala", "Generic", "International", 128, 13, 6.5, 5.5, 1, 2.5, 340),
    ("Naan Bread", "", "International", 262, 9, 46, 5, 2, 3.6, 418),
    ("Dal (lentil curry)", "", "International", 90, 5, 13, 2.2, 3.5, 1, 310),
    ("Biryani (chicken)", "Generic", "International", 183, 10, 25, 5, 0.8, 1, 325),
    ("Pad Thai", "Generic", "International", 170, 9, 21, 6, 1, 6, 530),
    ("Kung Pao Chicken", "Generic", "International", 155, 15, 8, 7.5, 1.2, 3, 620),
    ("Falafel", "", "International", 333, 13, 32, 18, 0, 0, 294),
    ("Gyros (lamb)", "Generic", "International", 217, 14, 15, 12, 1, 2, 480),
    ("Tacos (beef)", "Generic", "International", 210, 12, 16, 11, 1.8, 2, 420),
    ("Enchiladas (cheese)", "Generic", "International", 168, 8, 16, 8, 1.5, 2, 500),
    ("Pho (beef)", "Generic", "International", 48, 4, 4, 1.5, 0.3, 1, 365),
    ("Miso Soup", "", "International", 40, 3.3, 5, 1.0, 0.5, 1.5, 850),
    ("Fried Chicken", "Generic", "International", 260, 19, 10, 16, 0.5, 0, 680),

    # ── Breakfast Items ────────────────────────────────────
    ("Omelette (3 egg)", "Generic", "Breakfast", 154, 11, 0.6, 12, 0, 0.4, 155),
    ("French Toast", "Generic", "Breakfast", 229, 8, 24, 11, 0.9, 6, 401),
    ("Waffles", "Generic", "Breakfast", 291, 8, 33, 14, 0, 6.5, 511),
    ("Cereal (with milk)", "Generic", "Breakfast", 160, 5, 30, 2, 2, 12, 250),
    ("Acai Bowl", "Generic", "Breakfast", 211, 4, 34, 7, 5, 18, 10),
    ("Smoothie Bowl", "Generic", "Breakfast", 180, 5, 36, 3, 4, 20, 30),
    ("Toast with PB", "Generic", "Breakfast", 317, 11, 33, 17, 3.2, 7, 370),
    ("Overnight Oats", "Generic", "Breakfast", 190, 7, 30, 5, 4, 8, 50),
    ("Scrambled Eggs", "Generic", "Breakfast", 149, 10, 1.6, 11, 0, 1.4, 145),
    ("Breakfast Burrito", "Generic", "Breakfast", 220, 11, 22, 10, 1, 1.5, 530),

    # ── Desserts ───────────────────────────────────────────
    ("Ice Cream (vanilla)", "", "Desserts", 207, 3.5, 24, 11, 0.7, 21, 80),
    ("Brownie", "Generic", "Desserts", 405, 5, 51, 21, 2, 36, 256),
    ("Cheesecake", "Generic", "Desserts", 321, 5.5, 26, 22, 0.4, 20, 274),
    ("Apple Pie", "Generic", "Desserts", 237, 2, 34, 11, 1.6, 15, 181),
    ("Donut (glazed)", "Generic", "Desserts", 426, 5, 49, 23, 1.7, 22, 395),
    ("Cookie (chocolate chip)", "Generic", "Desserts", 488, 5.4, 64, 24, 2.4, 35, 348),
    ("Muffin (blueberry)", "Generic", "Desserts", 377, 5, 56, 15, 1.5, 30, 393),
    ("Tiramisu", "Generic", "Desserts", 283, 5.8, 28, 16, 0, 20, 79),
    ("Frozen Yogurt", "", "Desserts", 159, 4, 30, 2.6, 0, 22, 81),
    ("Banana Split", "Generic", "Desserts", 190, 3, 30, 6, 1.5, 22, 45),

    # ── Sauces & Condiments ────────────────────────────────
    ("Ketchup", "", "Condiments", 112, 1.7, 26, 0.1, 0.3, 22, 907),
    ("Mayonnaise", "", "Condiments", 680, 1, 0.6, 75, 0, 0.6, 635),
    ("Mustard", "", "Condiments", 66, 4, 5.3, 3.6, 3.2, 2.6, 1135),
    ("Soy Sauce", "", "Condiments", 53, 8.1, 4.9, 0.1, 0.8, 0.4, 5493),
    ("Hot Sauce", "", "Condiments", 11, 0.8, 1.8, 0.4, 0.5, 1, 2643),
    ("Olive Oil", "", "Condiments", 884, 0, 0, 100, 0, 0, 2),
    ("Honey", "", "Condiments", 304, 0.3, 82, 0, 0.2, 82, 4),
    ("Maple Syrup", "", "Condiments", 260, 0, 67, 0.1, 0, 60, 12),
    ("Ranch Dressing", "", "Condiments", 464, 1, 6, 48, 0, 3, 710),
    ("BBQ Sauce", "", "Condiments", 172, 0.8, 41, 0.6, 0.9, 33, 1027),

    # ── Supplements ────────────────────────────────────────
    ("Creatine Monohydrate", "", "Supplements", 0, 0, 0, 0, 0, 0, 0),
    ("BCAA Powder", "", "Supplements", 0, 0, 0, 0, 0, 0, 0),
    ("Fish Oil Capsule", "", "Supplements", 900, 0, 0, 100, 0, 0, 0),
    ("Multivitamin", "", "Supplements", 5, 0, 1, 0, 0, 0, 5),
]

# Meal templates: (food_name, meal_type, serving_size, serving_unit)
MEAL_TEMPLATES = {
    "Breakfast": [
        ("Oatmeal (cooked)", 250, "g"),
        ("Banana", 120, "g"),
        ("Egg (whole, boiled)", 100, "g"),
        ("Greek Yogurt (plain)", 150, "g"),
        ("Toast with PB", 80, "g"),
        ("Scrambled Eggs", 150, "g"),
        ("Overnight Oats", 200, "g"),
        ("Acai Bowl", 300, "g"),
        ("Pancakes", 150, "g"),
        ("Cereal (with milk)", 250, "g"),
        ("French Toast", 120, "g"),
        ("Waffles", 100, "g"),
        ("Omelette (3 egg)", 200, "g"),
        ("Smoothie Bowl", 280, "g"),
        ("Breakfast Burrito", 200, "g"),
    ],
    "Lunch": [
        ("Chicken Breast (grilled)", 150, "g"),
        ("White Rice (cooked)", 200, "g"),
        ("Caesar Salad", 250, "g"),
        ("Burrito (chicken)", 300, "g"),
        ("Chicken Caesar Wrap", 200, "g"),
        ("Sushi (California Roll)", 200, "g"),
        ("Pasta (cooked)", 250, "g"),
        ("Burger (beef patty)", 200, "g"),
        ("Pad Thai", 250, "g"),
        ("Dal (lentil curry)", 200, "g"),
        ("Grilled Cheese Sandwich", 150, "g"),
        ("Pho (beef)", 400, "g"),
    ],
    "Dinner": [
        ("Salmon (baked)", 180, "g"),
        ("Brown Rice (cooked)", 200, "g"),
        ("Beef Steak (sirloin)", 200, "g"),
        ("Sweet Potato", 200, "g"),
        ("Butter Chicken", 250, "g"),
        ("Naan Bread", 80, "g"),
        ("Biryani (chicken)", 300, "g"),
        ("Fried Rice", 250, "g"),
        ("Chicken Tikka Masala", 250, "g"),
        ("Pizza (cheese slice)", 200, "g"),
        ("Mac and Cheese", 250, "g"),
        ("Fish and Chips", 250, "g"),
        ("Kung Pao Chicken", 250, "g"),
        ("Tacos (beef)", 200, "g"),
    ],
    "Snacks": [
        ("Apple", 150, "g"),
        ("Protein Bar", 60, "g"),
        ("Almonds", 30, "g"),
        ("Dark Chocolate (70%)", 30, "g"),
        ("Hummus", 60, "g"),
        ("Trail Mix", 40, "g"),
        ("Greek Yogurt (plain)", 150, "g"),
        ("Blueberries", 100, "g"),
        ("Protein Shake", 300, "ml"),
        ("Granola Bar", 35, "g"),
        ("Rice Cake", 30, "g"),
        ("Beef Jerky", 28, "g"),
        ("Popcorn (air-popped)", 25, "g"),
        ("Strawberries", 150, "g"),
    ],
}

# Food nutrition lookup (name -> (cal, protein, carbs, fats) per 100g)
FOOD_NUTRITION = {}
for f in FOODS:
    FOOD_NUTRITION[f[0]] = {
        "calories": f[3],
        "protein_g": f[4],
        "carbs_g": f[5],
        "fats_g": f[6],
    }

EXERCISES_CARDIO = [
    ("Running", 30, 9.8),
    ("Running", 45, 9.8),
    ("Walking", 30, 3.5),
    ("Walking", 45, 3.5),
    ("Cycling", 30, 7.5),
    ("Cycling", 45, 7.5),
    ("HIIT", 20, 10.5),
    ("HIIT", 30, 10.5),
    ("Yoga", 45, 2.8),
    ("Yoga", 60, 2.8),
    ("Swimming", 30, 8.0),
    ("Jump Rope", 15, 11.0),
    ("Rowing", 30, 7.0),
    ("Elliptical", 30, 5.0),
    ("Stair Climbing", 20, 9.0),
]

EXERCISES_STRENGTH = [
    ("Bench Press", 4, 10, 60),
    ("Squats", 4, 12, 80),
    ("Deadlift", 3, 8, 100),
    ("Overhead Press", 3, 10, 40),
    ("Barbell Row", 4, 10, 50),
    ("Bicep Curls", 3, 12, 15),
    ("Tricep Dips", 3, 12, 0),
    ("Leg Press", 4, 12, 120),
    ("Lat Pulldown", 3, 10, 50),
    ("Lunges", 3, 12, 30),
    ("Plank", 3, 1, 0),
    ("Pull-ups", 3, 8, 0),
    ("Cable Flyes", 3, 12, 15),
    ("Calf Raises", 4, 15, 60),
]


def _lookup_food(food_name: str):
    """Get nutrition data for a food per 100g."""
    return FOOD_NUTRITION.get(food_name, {"calories": 200, "protein_g": 10, "carbs_g": 25, "fats_g": 8})


def seed_database(db: Session) -> None:
    """Seed the database with foods, a demo user, and 30 days of sample data."""

    # ── Check if already seeded ─────────────────────────────
    existing = db.query(FoodItem).count()
    if existing > 10:
        return  # Already seeded

    # ── 1. Seed Food Database ───────────────────────────────
    for name, brand, cat, cal, prot, carbs, fats, fiber, sugar, sodium in FOODS:
        item = FoodItem(
            name=name,
            brand=brand,
            category=cat,
            calories=cal,
            protein_g=prot,
            carbs_g=carbs,
            fats_g=fats,
            fiber_g=fiber,
            sugar_g=sugar,
            sodium_mg=sodium,
            serving_size=100,
            serving_unit="g",
        )
        db.add(item)

    # ── 2. Create demo user if needed ───────────────────────
    user = db.query(UserProfile).first()
    if not user:
        user = UserProfile(
            name="Jeevan",
            age=22,
            gender="Male",
            height_cm=175,
            weight_kg=78,
            target_weight_kg=72,
            timeline_weeks=16,
            goal="Lose Weight",
            activity_level="Moderately Active",
            calorie_goal=2050,
            protein_g=180,
            carbs_g=179,
            fats_g=68,
            water_goal_glasses=8,
        )
        db.add(user)

    # ── 3. Generate 30 days of food logs ────────────────────
    today = date.today()
    random.seed(42)  # Reproducible data

    for day_offset in range(30, 0, -1):
        log_date = today - timedelta(days=day_offset)

        # 2–3 breakfast items
        for _ in range(random.randint(1, 2)):
            food_name, serving, unit = random.choice(MEAL_TEMPLATES["Breakfast"])
            nutr = _lookup_food(food_name)
            scale = serving / 100
            db.add(FoodLog(
                meal_type="Breakfast",
                food_name=food_name,
                serving_size=serving,
                serving_unit=unit,
                calories=round(nutr["calories"] * scale, 1),
                protein_g=round(nutr["protein_g"] * scale, 1),
                carbs_g=round(nutr["carbs_g"] * scale, 1),
                fats_g=round(nutr["fats_g"] * scale, 1),
                favorite=random.random() > 0.8,
                consumed_on=log_date,
            ))

        # 1–2 lunch items
        for _ in range(random.randint(1, 2)):
            food_name, serving, unit = random.choice(MEAL_TEMPLATES["Lunch"])
            nutr = _lookup_food(food_name)
            scale = serving / 100
            db.add(FoodLog(
                meal_type="Lunch",
                food_name=food_name,
                serving_size=serving,
                serving_unit=unit,
                calories=round(nutr["calories"] * scale, 1),
                protein_g=round(nutr["protein_g"] * scale, 1),
                carbs_g=round(nutr["carbs_g"] * scale, 1),
                fats_g=round(nutr["fats_g"] * scale, 1),
                favorite=random.random() > 0.85,
                consumed_on=log_date,
            ))

        # 1–2 dinner items
        for _ in range(random.randint(1, 2)):
            food_name, serving, unit = random.choice(MEAL_TEMPLATES["Dinner"])
            nutr = _lookup_food(food_name)
            scale = serving / 100
            db.add(FoodLog(
                meal_type="Dinner",
                food_name=food_name,
                serving_size=serving,
                serving_unit=unit,
                calories=round(nutr["calories"] * scale, 1),
                protein_g=round(nutr["protein_g"] * scale, 1),
                carbs_g=round(nutr["carbs_g"] * scale, 1),
                fats_g=round(nutr["fats_g"] * scale, 1),
                favorite=random.random() > 0.9,
                consumed_on=log_date,
            ))

        # 0–2 snacks
        for _ in range(random.randint(0, 2)):
            food_name, serving, unit = random.choice(MEAL_TEMPLATES["Snacks"])
            nutr = _lookup_food(food_name)
            scale = serving / 100
            db.add(FoodLog(
                meal_type="Snacks",
                food_name=food_name,
                serving_size=serving,
                serving_unit=unit,
                calories=round(nutr["calories"] * scale, 1),
                protein_g=round(nutr["protein_g"] * scale, 1),
                carbs_g=round(nutr["carbs_g"] * scale, 1),
                fats_g=round(nutr["fats_g"] * scale, 1),
                favorite=False,
                consumed_on=log_date,
            ))

    # ── 4. Generate exercise logs (4-5 days/week) ───────────
    user_weight = 78.0
    for day_offset in range(30, 0, -1):
        if random.random() < 0.35:  # ~65% of days have exercise
            continue
        log_date = today - timedelta(days=day_offset)

        if random.random() < 0.6:
            # Cardio
            name, dur, met = random.choice(EXERCISES_CARDIO)
            cals = round((met * 3.5 * user_weight / 200) * dur, 1)
            db.add(ExerciseLog(
                exercise_type="cardio",
                name=name,
                duration_min=dur,
                calories_burned=cals,
                met=met,
                logged_on=log_date,
            ))
        else:
            # Strength
            name, sets, reps, weight = random.choice(EXERCISES_STRENGTH)
            est_min = sets * 3
            cals = max(50, est_min * 6)
            db.add(ExerciseLog(
                exercise_type="strength",
                name=name,
                sets=sets,
                reps=reps,
                weight_kg=weight,
                duration_min=est_min,
                calories_burned=float(cals),
                logged_on=log_date,
            ))

    # ── 5. Generate weight logs (weekly) ────────────────────
    weight = 78.0
    for week in range(4, 0, -1):
        log_date = today - timedelta(weeks=week)
        weight -= round(random.uniform(0.1, 0.5), 1)
        db.add(WeightLog(weight_kg=round(weight, 1), logged_on=log_date))

    # Also log today's weight
    db.add(WeightLog(weight_kg=round(weight - 0.2, 1), logged_on=today))

    # ── 6. Generate water logs (daily) ──────────────────────
    for day_offset in range(30, 0, -1):
        log_date = today - timedelta(days=day_offset)
        glasses = random.randint(4, 10)
        db.add(WaterLog(glasses=glasses, logged_on=log_date))

    db.commit()
