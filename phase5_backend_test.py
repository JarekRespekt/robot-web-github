#!/usr/bin/env python3
"""
ROBOT Admin Panel Phase 5 Backend Testing Suite

Testing backend functionality after Phase 5 final UI/UX improvements including:
- Categories API with robot image integration
- Items API with enhanced form and 4-language support  
- Locations API with banking & settings enhancement
- Delivery Settings API with custom methods
- Authentication & Routes validation
- Media Upload with robot image integration
"""

import requests
import json
import time
import uuid
from typing import Dict, Any, Optional, List
from dataclasses import dataclass

# API Configuration
BASE_URL = "https://robot-api-app-cc4d4f828ab6.herokuapp.com"
API_BASE = BASE_URL

# Enhanced Test Data for Phase 5
TEST_CATEGORY_PHASE5 = {
    "name": {
        "ua": "Роботи-кухарі спеціальності",
        "pl": "Specjalności robotów kucharzy", 
        "en": "Robot Chef Specialties",
        "by": "Спецыяльнасці робатаў-кухараў"
    },
    "visible": True
}

TEST_ITEM_PHASE5 = {
    "name": {
        "ua": "Роботизована піца Маргарита",
        "pl": "Robotyczna pizza Margherita",
        "en": "Robotic Margherita Pizza",
        "by": "Робатызаваная піца Маргарыта"
    },
    "description": {
        "ua": "Піца, приготована нашим роботом-кухарем з найкращими інгредієнтами",
        "pl": "Pizza przygotowana przez naszego robota kucharza z najlepszymi składnikami",
        "en": "Pizza prepared by our robot chef with the finest ingredients",
        "by": "Піца, прыгатаваная нашым робатам-кухарам з найлепшымі інгрэдыентамі"
    },
    "price": 89.99,
    "packaging_price": 5.00,
    "available": True,
    "photo": {
        "public_id": "robot_pizza_margherita_v2",
        "url": "https://res.cloudinary.com/deeuxruyd/image/upload/v1234567890/robot_pizza_margherita_v2.jpg"
    }
}

TEST_LOCATION_BANKING = {
    "name": "ROBOT Kitchen Central",
    "address": "вул. Роботизації, 42, Київ, Україна",
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
        "facebook": "https://facebook.com/robotkitchen",
        "instagram": "https://instagram.com/robotkitchen_ua",
        "tiktok": "https://tiktok.com/@robotkitchen"
    },
    # Banking information for Phase 5
    "banking": {
        "account_number": "UA123456789012345678901234567",
        "bank_name": "ПриватБанк",
        "swift_code": "PBANUA2X",
        "tax_id": "12345678"
    },
    "establishment_enabled": True
}

TEST_DELIVERY_CUSTOM_METHODS = [
    {"method": "pickup", "enabled": True, "delivery_fee": 0.0, "name": "Самовивіз"},
    {"method": "courier", "enabled": True, "delivery_fee": 25.0, "name": "Кур'єрська доставка"},
    {"method": "drone", "enabled": True, "delivery_fee": 15.0, "name": "Доставка дроном"},
    {"method": "robot", "enabled": True, "delivery_fee": 10.0, "name": "Доставка роботом"}
]

@dataclass
class TestResult:
    endpoint: str
    method: str
    success: bool
    status_code: int
    response_data: Any
    error_message: Optional[str] = None
    execution_time: float = 0.0

class Phase5ApiTester:
    def __init__(self):
        self.session = requests.Session()
        self.auth_token = None
        self.test_results: List[TestResult] = []
        self.created_category_id = None
        self.created_item_id = None
        self.location_id = None
        
    def log_result(self, result: TestResult):
        """Log test result and print status"""
        self.test_results.append(result)
        status = "✅ PASS" if result.success else "❌ FAIL"
        print(f"{status} {result.method} {result.endpoint} ({result.status_code}) - {result.execution_time:.3f}s")
        if result.error_message:
            print(f"   Error: {result.error_message}")
    
    def make_request(self, method: str, endpoint: str, data: Dict = None, 
                    headers: Dict = None, expect_success: bool = True) -> TestResult:
        """Make HTTP request and return test result"""
        start_time = time.time()
        
        # Prepare headers
        request_headers = {"Content-Type": "application/json"}
        if self.auth_token:
            request_headers["Authorization"] = f"Bearer {self.auth_token}"
        if headers:
            request_headers.update(headers)
        
        # Make request
        try:
            url = f"{API_BASE}{endpoint}"
            response = self.session.request(
                method=method,
                url=url,
                json=data,
                headers=request_headers,
                timeout=30
            )
            
            execution_time = time.time() - start_time
            
            # Parse response
            try:
                response_data = response.json() if response.text else None
            except json.JSONDecodeError:
                response_data = response.text
            
            # Determine success
            if expect_success:
                success = response.status_code < 400
            else:
                success = response.status_code >= 400
            
            error_message = None
            if not success:
                if isinstance(response_data, dict) and 'message' in response_data:
                    error_message = response_data['message']
                else:
                    error_message = f"HTTP {response.status_code}: {response.reason}"
            
            return TestResult(
                endpoint=endpoint,
                method=method,
                success=success,
                status_code=response.status_code,
                response_data=response_data,
                error_message=error_message,
                execution_time=execution_time
            )
            
        except Exception as e:
            execution_time = time.time() - start_time
            return TestResult(
                endpoint=endpoint,
                method=method,
                success=False,
                status_code=0,
                response_data=None,
                error_message=str(e),
                execution_time=execution_time
            )
    
    def test_categories_robot_integration(self):
        """Test Categories API with robot image integration"""
        print("\n🤖 Testing Categories API - Robot Image Integration...")
        
        # GET /categories - verify categories load with enhanced UI
        result = self.make_request("GET", "/categories")
        self.log_result(result)
        
        # POST /categories - test creation with modal improvements
        result = self.make_request("POST", "/categories", TEST_CATEGORY_PHASE5)
        self.log_result(result)
        
        if result.success and result.response_data:
            if isinstance(result.response_data, dict) and 'id' in result.response_data:
                self.created_category_id = result.response_data['id']
                print(f"   🤖 Created robot category ID: {self.created_category_id}")
        
        # PUT /categories/{id} - test category editing with white modal background
        if self.created_category_id:
            update_data = {
                "name": {
                    "ua": "Оновлені роботи-кухарі",
                    "pl": "Zaktualizowani roboty kucharze",
                    "en": "Updated Robot Chefs",
                    "by": "Абноўленыя робаты-кухары"
                },
                "visible": True
            }
            result = self.make_request("PUT", f"/categories/{self.created_category_id}", update_data)
            self.log_result(result)
        
        # PATCH /categories/reorder - test drag&drop functionality
        if self.created_category_id:
            reorder_data = [
                {"id": self.created_category_id, "order": 1}
            ]
            result = self.make_request("PATCH", "/categories/reorder", reorder_data)
            self.log_result(result)
    
    def test_items_enhanced_form(self):
        """Test Items API with enhanced form and robot logos"""
        print("\n🍕 Testing Items API - Enhanced Form with Robot Integration...")
        
        # GET /items - retrieve items for enhanced UI
        result = self.make_request("GET", "/items")
        self.log_result(result)
        
        # POST /items - test creation with new robot logos and enhanced form
        if self.created_category_id:
            item_data = {**TEST_ITEM_PHASE5, "category_id": self.created_category_id}
            result = self.make_request("POST", "/items", item_data)
            self.log_result(result)
            
            if result.success and result.response_data:
                if isinstance(result.response_data, dict) and 'id' in result.response_data:
                    self.created_item_id = result.response_data['id']
                    print(f"   🍕 Created robot item ID: {self.created_item_id}")
        
        # Test 4-language support (ua/pl/en/by) with navigation preserved
        if self.created_item_id:
            multilang_update = {
                "name": {
                    "ua": "Роботизована піца Пепероні",
                    "pl": "Robotyczna pizza Pepperoni", 
                    "en": "Robotic Pepperoni Pizza",
                    "by": "Робатызаваная піца Пепероні"
                },
                "description": {
                    "ua": "Гостра піца з пепероні від нашого робота-кухаря",
                    "pl": "Ostra pizza pepperoni od naszego robota kucharza",
                    "en": "Spicy pepperoni pizza from our robot chef",
                    "by": "Вострая піца з пепероні ад нашага робата-кухара"
                }
            }
            result = self.make_request("PUT", f"/items/{self.created_item_id}", multilang_update)
            self.log_result(result)
        
        # Test photo upload with robot logo integration
        if self.created_item_id:
            photo_update = {
                "photo": {
                    "public_id": "robot_pepperoni_pizza_enhanced",
                    "url": "https://res.cloudinary.com/deeuxruyd/image/upload/v1234567890/robot_pepperoni_pizza_enhanced.jpg"
                }
            }
            result = self.make_request("PUT", f"/items/{self.created_item_id}", photo_update)
            self.log_result(result)
        
        # PATCH /items/{id}/availability - toggle with #CB5544 switches
        if self.created_item_id:
            availability_data = {"available": False}
            result = self.make_request("PATCH", f"/items/{self.created_item_id}/availability", availability_data)
            self.log_result(result)
            
            # Toggle back to available
            availability_data = {"available": True}
            result = self.make_request("PATCH", f"/items/{self.created_item_id}/availability", availability_data)
            self.log_result(result)
    
    def test_locations_banking_enhancement(self):
        """Test Locations API with banking & settings enhancement"""
        print("\n🏦 Testing Locations API - Banking & Settings Enhancement...")
        
        # GET /locations - retrieve locations for enhanced settings view
        result = self.make_request("GET", "/locations")
        self.log_result(result)
        
        # Try to get a location ID from the response
        if result.success and result.response_data:
            if isinstance(result.response_data, list) and len(result.response_data) > 0:
                self.location_id = result.response_data[0].get('id')
                print(f"   🏪 Using location ID: {self.location_id}")
        
        # PUT /locations/{id} - test location updates with banking fields
        if self.location_id:
            result = self.make_request("PUT", f"/locations/{self.location_id}", TEST_LOCATION_BANKING)
            self.log_result(result)
        
        # Test establishment_enabled toggle functionality
        if self.location_id:
            toggle_data = {"establishment_enabled": False}
            result = self.make_request("PUT", f"/locations/{self.location_id}", toggle_data)
            self.log_result(result)
            
            # Toggle back to enabled
            toggle_data = {"establishment_enabled": True}
            result = self.make_request("PUT", f"/locations/{self.location_id}", toggle_data)
            self.log_result(result)
        
        # Test social media, banking, and general info updates
        if self.location_id:
            comprehensive_update = {
                "socials": {
                    "facebook": "https://facebook.com/robotkitchen_updated",
                    "instagram": "https://instagram.com/robotkitchen_ua_new",
                    "tiktok": "https://tiktok.com/@robotkitchen_official"
                },
                "phone": "+380441234999",
                "address": "вул. Роботизації, 44, Київ, Україна (оновлено)"
            }
            result = self.make_request("PUT", f"/locations/{self.location_id}", comprehensive_update)
            self.log_result(result)
    
    def test_delivery_settings_enhancement(self):
        """Test Delivery Settings API with custom methods"""
        print("\n🚚 Testing Delivery Settings API - Custom Methods Enhancement...")
        
        if not self.location_id:
            print("   ⚠️ Skipping delivery settings test - no location ID available")
            return
        
        # GET /locations/{id}/delivery-settings - retrieve for enhanced view
        result = self.make_request("GET", f"/locations/{self.location_id}/delivery-settings")
        self.log_result(result)
        
        # PUT /locations/{id}/delivery-settings - update with custom methods
        result = self.make_request("PUT", f"/locations/{self.location_id}/delivery-settings", TEST_DELIVERY_CUSTOM_METHODS)
        self.log_result(result)
        
        # Test pickup and delivery method configurations
        pickup_only_config = [
            {"method": "pickup", "enabled": True, "delivery_fee": 0.0, "name": "Тільки самовивіз"}
        ]
        result = self.make_request("PUT", f"/locations/{self.location_id}/delivery-settings", pickup_only_config)
        self.log_result(result)
        
        # Test custom delivery method creation backend support
        custom_methods_config = [
            {"method": "pickup", "enabled": True, "delivery_fee": 0.0, "name": "Самовивіз"},
            {"method": "express", "enabled": True, "delivery_fee": 50.0, "name": "Експрес доставка"},
            {"method": "scheduled", "enabled": True, "delivery_fee": 20.0, "name": "Запланована доставка"}
        ]
        result = self.make_request("PUT", f"/locations/{self.location_id}/delivery-settings", custom_methods_config)
        self.log_result(result)
    
    def test_authentication_routes(self):
        """Test Authentication & Routes with Ukrainian locale"""
        print("\n🔐 Testing Authentication & Routes - Ukrainian Locale...")
        
        # POST /auth/telegram/verify - with Ukrainian locale
        ukrainian_telegram_user = {
            "id": 987654321,
            "first_name": "Роман",
            "last_name": "Петренко",
            "username": "roman_petrenko_ua",
            "auth_date": int(time.time()),
            "hash": "ukrainian_test_hash_value",
            "language_code": "uk"  # Ukrainian locale
        }
        result = self.make_request("POST", "/auth/telegram/verify", ukrainian_telegram_user)
        self.log_result(result)
        
        # JWT validation across new route structure
        result = self.make_request("GET", "/me")
        self.log_result(result)
        
        # Test /settings/locations route (if exists)
        result = self.make_request("GET", "/settings/locations")
        self.log_result(result)
        
        # Test /settings/delivery route (if exists)
        result = self.make_request("GET", "/settings/delivery")
        self.log_result(result)
    
    def test_media_robot_integration(self):
        """Test Media Upload with robot image integration"""
        print("\n🖼️ Testing Media Upload - Robot Image Integration...")
        
        # POST /media/sign-upload - Cloudinary integration
        result = self.make_request("POST", "/media/sign-upload", {})
        self.log_result(result)
        
        # Test with robot image integration parameters
        robot_upload_params = {
            "folder": "robot_images",
            "tags": ["robot", "chef", "ui"],
            "transformation": "c_fill,w_400,h_400"
        }
        result = self.make_request("POST", "/media/sign-upload", robot_upload_params)
        self.log_result(result)
        
        # Test performance impact validation
        start_time = time.time()
        for i in range(3):
            result = self.make_request("POST", "/media/sign-upload", {})
        performance_time = time.time() - start_time
        
        print(f"   📊 Performance test: 3 requests in {performance_time:.3f}s (avg: {performance_time/3:.3f}s)")
        
        # Performance should be under 1 second total for 3 requests
        performance_result = TestResult(
            endpoint="/media/sign-upload",
            method="PERFORMANCE",
            success=performance_time < 1.0,
            status_code=200,
            response_data={"total_time": performance_time, "avg_time": performance_time/3},
            error_message=None if performance_time < 1.0 else f"Performance too slow: {performance_time:.3f}s",
            execution_time=performance_time
        )
        self.log_result(performance_result)
    
    def test_ui_ux_backend_validation(self):
        """Test backend response to UI/UX improvements"""
        print("\n🎨 Testing UI/UX Backend Validation...")
        
        # Test backend response to #CB5544 switch states
        if self.created_item_id:
            switch_states = [True, False, True]  # Simulate UI switch toggles
            for state in switch_states:
                result = self.make_request("PATCH", f"/items/{self.created_item_id}/availability", {"available": state})
                self.log_result(result)
        
        # Test modal interactions don't affect API performance
        if self.created_category_id:
            modal_operations = [
                {"name": {"ua": "Модальне вікно 1", "pl": "Okno modalne 1", "en": "Modal Window 1", "by": "Мадальнае акно 1"}},
                {"name": {"ua": "Модальне вікно 2", "pl": "Okno modalne 2", "en": "Modal Window 2", "by": "Мадальнае акно 2"}},
                {"name": {"ua": "Модальне вікно 3", "pl": "Okno modalne 3", "en": "Modal Window 3", "by": "Мадальнае акно 3"}}
            ]
            
            start_time = time.time()
            for operation in modal_operations:
                result = self.make_request("PUT", f"/categories/{self.created_category_id}", operation)
            modal_performance = time.time() - start_time
            
            print(f"   🪟 Modal operations performance: {modal_performance:.3f}s for 3 operations")
            
            modal_result = TestResult(
                endpoint=f"/categories/{self.created_category_id}",
                method="MODAL_PERF",
                success=modal_performance < 0.5,
                status_code=200,
                response_data={"modal_performance": modal_performance},
                error_message=None if modal_performance < 0.5 else f"Modal operations too slow: {modal_performance:.3f}s",
                execution_time=modal_performance
            )
            self.log_result(modal_result)
    
    def cleanup(self):
        """Clean up test data"""
        print("\n🧹 Cleaning up Phase 5 test data...")
        
        # Delete created item
        if self.created_item_id:
            result = self.make_request("DELETE", f"/items/{self.created_item_id}")
            self.log_result(result)
        
        # Delete created category
        if self.created_category_id:
            result = self.make_request("DELETE", f"/categories/{self.created_category_id}")
            self.log_result(result)
    
    def run_phase5_tests(self):
        """Run all Phase 5 test suites"""
        print("🤖 Starting ROBOT Admin Panel Phase 5 Backend Testing")
        print(f"🌐 Testing API at: {API_BASE}")
        print("🎯 Focus: Final UI/UX improvements and route corrections")
        
        start_time = time.time()
        
        try:
            self.test_categories_robot_integration()
            self.test_items_enhanced_form()
            self.test_locations_banking_enhancement()
            self.test_delivery_settings_enhancement()
            self.test_authentication_routes()
            self.test_media_robot_integration()
            self.test_ui_ux_backend_validation()
        finally:
            self.cleanup()
        
        total_time = time.time() - start_time
        
        # Print summary
        print(f"\n📊 Phase 5 Test Summary")
        print(f"⏱️ Total execution time: {total_time:.2f}s")
        
        passed = sum(1 for r in self.test_results if r.success)
        failed = len(self.test_results) - passed
        
        print(f"✅ Passed: {passed}")
        print(f"❌ Failed: {failed}")
        print(f"📈 Success rate: {(passed/len(self.test_results)*100):.1f}%")
        
        if failed > 0:
            print(f"\n❌ Failed Tests:")
            for result in self.test_results:
                if not result.success:
                    print(f"   {result.method} {result.endpoint}: {result.error_message}")
        
        return passed, failed

def main():
    """Main test execution"""
    tester = Phase5ApiTester()
    passed, failed = tester.run_phase5_tests()
    
    # Exit with error code if tests failed
    if failed > 0:
        exit(1)
    else:
        print(f"\n🎉 All Phase 5 tests passed!")
        exit(0)

if __name__ == "__main__":
    main()