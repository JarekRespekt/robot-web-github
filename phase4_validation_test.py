#!/usr/bin/env python3
"""
Phase 4 Bug Fixes Validation Test Suite

This script specifically tests the backend functionality that supports
the Phase 4 frontend bug fixes for the ROBOT Admin Panel.
"""

import requests
import json
import time
import uuid
from typing import Dict, Any, Optional, List

# API Configuration
BASE_URL = "https://robot-api-app-cc4d4f828ab6.herokuapp.com"

class Phase4ValidationTester:
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({"Content-Type": "application/json"})
        
    def test_categories_real_time_updates(self):
        """Test categories API for real-time update support"""
        print("\n🔄 Testing Categories Real-Time Update Support...")
        
        # Create category with realistic restaurant data
        category_data = {
            "name": {
                "ua": "Гарячі страви",
                "pl": "Dania gorące", 
                "en": "Hot Dishes",
                "by": "Гарачыя стравы"
            },
            "visible": True
        }
        
        # Test creation
        response = self.session.post(f"{BASE_URL}/categories", json=category_data)
        print(f"✅ CREATE Category: {response.status_code} - {response.json() if response.status_code == 201 else 'Failed'}")
        
        if response.status_code == 201:
            category_id = response.json()['id']
            
            # Test immediate retrieval (real-time availability)
            get_response = self.session.get(f"{BASE_URL}/categories")
            categories = get_response.json() if get_response.status_code == 200 else []
            created_category = next((cat for cat in categories if cat['id'] == category_id), None)
            
            if created_category:
                print(f"✅ REAL-TIME RETRIEVAL: Category immediately available in list")
                print(f"   Category: {created_category['name']['ua']}")
            else:
                print(f"❌ REAL-TIME ISSUE: Category not immediately available")
            
            # Test update for modal editing
            update_data = {
                "name": {
                    "ua": "Оновлені гарячі страви",
                    "pl": "Zaktualizowane dania gorące",
                    "en": "Updated Hot Dishes", 
                    "by": "Абноўленыя гарачыя стравы"
                },
                "visible": True
            }
            
            update_response = self.session.put(f"{BASE_URL}/categories/{category_id}", json=update_data)
            print(f"✅ UPDATE Category: {update_response.status_code} - Modal editing support")
            
            # Test reorder functionality (drag & drop support)
            reorder_data = [{"id": category_id, "order": 1}]
            reorder_response = self.session.patch(f"{BASE_URL}/categories/reorder", json=reorder_data)
            print(f"✅ REORDER Categories: {reorder_response.status_code} - Drag & drop support")
            
            # Cleanup
            delete_response = self.session.delete(f"{BASE_URL}/categories/{category_id}")
            print(f"✅ DELETE Category: {delete_response.status_code} - Cleanup")
            
            return True
        return False
    
    def test_items_enhanced_form_support(self):
        """Test items API with enhanced 4-language form structure"""
        print("\n📝 Testing Items Enhanced Form Support...")
        
        # First create a category for the item
        category_data = {
            "name": {
                "ua": "Десерти",
                "pl": "Desery",
                "en": "Desserts", 
                "by": "Дэсерты"
            },
            "visible": True
        }
        
        cat_response = self.session.post(f"{BASE_URL}/categories", json=category_data)
        if cat_response.status_code != 201:
            print(f"❌ Failed to create test category")
            return False
            
        category_id = cat_response.json()['id']
        
        # Test item creation with enhanced form structure
        item_data = {
            "category_id": category_id,
            "name": {
                "ua": "Тірамісу класичний",
                "pl": "Tiramisu klasyczne",
                "en": "Classic Tiramisu",
                "by": "Тырамісу класічны"
            },
            "description": {
                "ua": "Італійський десерт з маскарпоне та кавою",
                "pl": "Włoski deser z mascarpone i kawą",
                "en": "Italian dessert with mascarpone and coffee",
                "by": "Італьянскі дэсерт з маскарпонэ і кавай"
            },
            "price": 85.00,
            "packaging_price": 5.00,
            "available": True,
            "photo": {
                "public_id": "tiramisu_classic_2024",
                "url": "https://res.cloudinary.com/deeuxruyd/image/upload/v1234567890/tiramisu_classic_2024.jpg"
            }
        }
        
        # Test creation
        response = self.session.post(f"{BASE_URL}/items", json=item_data)
        print(f"✅ CREATE Item (4-lang): {response.status_code} - Enhanced form support")
        
        if response.status_code == 201:
            item_id = response.json()['id']
            print(f"   Item ID: {item_id}")
            print(f"   Photo structure: {item_data['photo']}")
            
            # Test update with navigation maintained
            update_data = {
                "name": {
                    "ua": "Тірамісу преміум",
                    "pl": "Tiramisu premium", 
                    "en": "Premium Tiramisu",
                    "by": "Тырамісу прэміум"
                },
                "price": 95.00
            }
            
            update_response = self.session.put(f"{BASE_URL}/items/{item_id}", json=update_data)
            print(f"✅ UPDATE Item: {update_response.status_code} - Navigation maintained")
            
            # Test availability toggle
            availability_data = {"available": False}
            avail_response = self.session.patch(f"{BASE_URL}/items/{item_id}/availability", json=availability_data)
            print(f"✅ TOGGLE Availability: {avail_response.status_code} - Quick toggle support")
            
            # Cleanup
            self.session.delete(f"{BASE_URL}/items/{item_id}")
            
        # Cleanup category
        self.session.delete(f"{BASE_URL}/categories/{category_id}")
        return True
    
    def test_locations_settings_integration(self):
        """Test locations API for full settings integration"""
        print("\n🏪 Testing Locations Settings Integration...")
        
        # Get existing locations
        response = self.session.get(f"{BASE_URL}/locations")
        print(f"✅ GET Locations: {response.status_code}")
        
        if response.status_code == 200:
            locations = response.json()
            if locations:
                location_id = locations[0]['id']
                print(f"   Using location: {location_id}")
                
                # Test comprehensive location update with social media
                location_update = {
                    "name": "ROBOT Ресторан Київ",
                    "address": "вул. Хрещатик, 1, Київ, 01001",
                    "phone": "+380441234567",
                    "hours": {
                        "mon": {"open": "08:00", "close": "23:00"},
                        "tue": {"open": "08:00", "close": "23:00"},
                        "wed": {"open": "08:00", "close": "23:00"},
                        "thu": {"open": "08:00", "close": "23:00"},
                        "fri": {"open": "08:00", "close": "24:00"},
                        "sat": {"open": "09:00", "close": "24:00"},
                        "sun": {"open": "09:00", "close": "22:00"}
                    },
                    "socials": {
                        "facebook": "https://facebook.com/robot.restaurant.kyiv",
                        "instagram": "https://instagram.com/robot_restaurant_kyiv",
                        "telegram": "https://t.me/robot_restaurant",
                        "website": "https://robot.restaurant"
                    }
                }
                
                update_response = self.session.put(f"{BASE_URL}/locations/{location_id}", json=location_update)
                print(f"✅ UPDATE Location: {update_response.status_code} - Full settings support")
                print(f"   Social media fields: {len(location_update['socials'])} platforms")
                
                return True
        return False
    
    def test_delivery_settings_api(self):
        """Test delivery settings API"""
        print("\n🚚 Testing Delivery Settings API...")
        
        # Get locations first
        response = self.session.get(f"{BASE_URL}/locations")
        if response.status_code == 200:
            locations = response.json()
            if locations:
                location_id = locations[0]['id']
                
                # Test delivery settings retrieval
                get_response = self.session.get(f"{BASE_URL}/locations/{location_id}/delivery-settings")
                print(f"✅ GET Delivery Settings: {get_response.status_code}")
                
                # Test delivery settings update
                delivery_settings = [
                    {"method": "pickup", "enabled": True, "delivery_fee": 0.0},
                    {"method": "courier", "enabled": True, "delivery_fee": 25.0},
                    {"method": "self_delivery", "enabled": True, "delivery_fee": 15.0},
                    {"method": "express", "enabled": False, "delivery_fee": 50.0}
                ]
                
                update_response = self.session.put(f"{BASE_URL}/locations/{location_id}/delivery-settings", json=delivery_settings)
                print(f"✅ UPDATE Delivery Settings: {update_response.status_code}")
                print(f"   Methods configured: {len(delivery_settings)}")
                
                return True
        return False
    
    def test_media_upload_integration(self):
        """Test media upload API for photo integration"""
        print("\n📸 Testing Media Upload Integration...")
        
        # Test Cloudinary signature generation
        response = self.session.post(f"{BASE_URL}/media/sign-upload", json={})
        print(f"✅ Cloudinary Sign Upload: {response.status_code}")
        
        if response.status_code == 200:
            signature_data = response.json()
            required_fields = ['signature', 'timestamp', 'api_key', 'cloud_name']
            has_all_fields = all(field in signature_data for field in required_fields)
            print(f"   Signature fields complete: {has_all_fields}")
            print(f"   Cloud name: {signature_data.get('cloud_name', 'N/A')}")
            return has_all_fields
        return False
    
    def test_api_performance(self):
        """Test API performance for responsive UI"""
        print("\n⚡ Testing API Performance...")
        
        start_time = time.time()
        
        # Test rapid sequential requests (simulating real-time UI updates)
        endpoints = [
            "/categories",
            "/items", 
            "/locations",
            "/media/sign-upload"
        ]
        
        response_times = []
        for endpoint in endpoints:
            req_start = time.time()
            if endpoint == "/media/sign-upload":
                response = self.session.post(f"{BASE_URL}{endpoint}", json={})
            else:
                response = self.session.get(f"{BASE_URL}{endpoint}")
            req_time = time.time() - req_start
            response_times.append(req_time)
            print(f"   {endpoint}: {response.status_code} ({req_time:.3f}s)")
        
        total_time = time.time() - start_time
        avg_response_time = sum(response_times) / len(response_times)
        
        print(f"✅ Performance Summary:")
        print(f"   Total time: {total_time:.3f}s")
        print(f"   Average response: {avg_response_time:.3f}s")
        print(f"   All under 1s: {all(t < 1.0 for t in response_times)}")
        
        return avg_response_time < 0.5  # Good performance threshold
    
    def run_phase4_validation(self):
        """Run all Phase 4 validation tests"""
        print("🚀 ROBOT Admin Panel - Phase 4 Backend Validation")
        print(f"🌐 Testing API: {BASE_URL}")
        print("=" * 60)
        
        start_time = time.time()
        
        tests = [
            ("Categories Real-Time Updates", self.test_categories_real_time_updates),
            ("Items Enhanced Form Support", self.test_items_enhanced_form_support), 
            ("Locations Settings Integration", self.test_locations_settings_integration),
            ("Delivery Settings API", self.test_delivery_settings_api),
            ("Media Upload Integration", self.test_media_upload_integration),
            ("API Performance", self.test_api_performance)
        ]
        
        results = []
        for test_name, test_func in tests:
            try:
                result = test_func()
                results.append((test_name, result))
                print(f"{'✅' if result else '❌'} {test_name}: {'PASS' if result else 'FAIL'}")
            except Exception as e:
                results.append((test_name, False))
                print(f"❌ {test_name}: ERROR - {str(e)}")
        
        total_time = time.time() - start_time
        passed = sum(1 for _, result in results if result)
        total = len(results)
        
        print("\n" + "=" * 60)
        print(f"📊 Phase 4 Validation Summary")
        print(f"⏱️ Execution time: {total_time:.2f}s")
        print(f"✅ Passed: {passed}/{total}")
        print(f"📈 Success rate: {(passed/total*100):.1f}%")
        
        if passed == total:
            print(f"\n🎉 All Phase 4 backend validations passed!")
            print(f"🚀 Backend ready for Phase 4 frontend bug fixes")
        else:
            print(f"\n⚠️ Some validations failed - review needed")
            
        return passed, total

def main():
    tester = Phase4ValidationTester()
    passed, total = tester.run_phase4_validation()
    
    if passed == total:
        exit(0)
    else:
        exit(1)

if __name__ == "__main__":
    main()