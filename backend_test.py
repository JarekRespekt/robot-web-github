#!/usr/bin/env python3
"""
ROBOT Admin Panel Backend API Testing Suite

This script tests all backend API endpoints for the ROBOT Admin Panel
including authentication, categories, items, locations, and media APIs.
"""

import requests
import json
import time
import uuid
from typing import Dict, Any, Optional, List
from dataclasses import dataclass

# API Configuration
BASE_URL = "https://robot-api-app-cc4d4f828ab6.herokuapp.com"
API_BASE = BASE_URL  # API endpoints are at root level, not under /api

# Test Data
TEST_TELEGRAM_USER = {
    "id": 123456789,
    "first_name": "Test",
    "last_name": "Admin",
    "username": "testadmin",
    "auth_date": int(time.time()),
    "hash": "test_hash_value"
}

TEST_CATEGORY = {
    "name": {
        "ua": "Тестова категорія",
        "pl": "Kategoria testowa", 
        "en": "Test Category",
        "by": "Тэставая катэгорыя"
    },
    "visible": True
}

TEST_ITEM = {
    "name": {
        "ua": "Тестовий товар",
        "pl": "Produkt testowy",
        "en": "Test Item",
        "by": "Тэставы тавар"
    },
    "description": {
        "ua": "Опис тестового товару",
        "pl": "Opis produktu testowego", 
        "en": "Test item description",
        "by": "Апісанне тэставага тавару"
    },
    "price": 25.99,
    "packaging_price": 2.50,
    "available": True
}

TEST_LOCATION_UPDATE = {
    "name": "Test Restaurant Location",
    "address": "123 Test Street, Test City",
    "phone": "+380123456789",
    "hours": {
        "mon": {"open": "09:00", "close": "22:00"},
        "tue": {"open": "09:00", "close": "22:00"},
        "wed": {"open": "09:00", "close": "22:00"},
        "thu": {"open": "09:00", "close": "22:00"},
        "fri": {"open": "09:00", "close": "23:00"},
        "sat": {"open": "10:00", "close": "23:00"},
        "sun": {"open": "10:00", "close": "21:00"}
    },
    "socials": {
        "facebook": "https://facebook.com/testrestaurant",
        "instagram": "https://instagram.com/testrestaurant"
    }
}

TEST_DELIVERY_SETTINGS = {
    "delivery_settings": [
        {"method": "pickup", "enabled": True, "delivery_fee": 0.0},
        {"method": "courier", "enabled": True, "delivery_fee": 5.0},
        {"method": "self", "enabled": False, "delivery_fee": 0.0}
    ]
}

@dataclass
class TestResult:
    endpoint: str
    method: str
    success: bool
    status_code: int
    response_data: Any
    error_message: Optional[str] = None
    execution_time: float = 0.0

class RobotApiTester:
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
        print(f"{status} {result.method} {result.endpoint} ({result.status_code}) - {result.execution_time:.2f}s")
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
    
    def test_authentication(self):
        """Test authentication endpoints"""
        print("\n🔐 Testing Authentication...")
        
        # Test Telegram login verification
        result = self.make_request("POST", "/auth/telegram/verify", TEST_TELEGRAM_USER)
        self.log_result(result)
        
        if result.success and result.response_data:
            # Extract token if login successful
            if isinstance(result.response_data, dict) and 'token' in result.response_data:
                self.auth_token = result.response_data['token']
                print(f"   🔑 Auth token obtained: {self.auth_token[:20]}...")
        
        # Test /me endpoint (requires auth)
        result = self.make_request("GET", "/me")
        self.log_result(result)
        
        # Test auth middleware on protected route
        old_token = self.auth_token
        self.auth_token = "invalid_token"
        result = self.make_request("GET", "/me", expect_success=False)
        self.log_result(result)
        self.auth_token = old_token
        
        # Test logout
        result = self.make_request("POST", "/auth/logout")
        self.log_result(result)
    
    def test_categories_api(self):
        """Test categories CRUD operations"""
        print("\n📁 Testing Categories API...")
        
        # GET /categories - retrieve all categories
        result = self.make_request("GET", "/categories")
        self.log_result(result)
        
        # POST /categories - create new category
        result = self.make_request("POST", "/categories", TEST_CATEGORY)
        self.log_result(result)
        
        if result.success and result.response_data:
            if isinstance(result.response_data, dict) and 'id' in result.response_data:
                self.created_category_id = result.response_data['id']
                print(f"   📝 Created category ID: {self.created_category_id}")
        
        # PUT /categories/{id} - update category
        if self.created_category_id:
            update_data = {
                "name": {
                    "ua": "Оновлена категорія",
                    "pl": "Zaktualizowana kategoria",
                    "en": "Updated Category"
                },
                "visible": False
            }
            result = self.make_request("PUT", f"/categories/{self.created_category_id}", update_data)
            self.log_result(result)
        
        # PATCH /categories/reorder - test reorder functionality
        if self.created_category_id:
            reorder_data = [
                {"id": self.created_category_id, "order": 1}
            ]
            result = self.make_request("PATCH", "/categories/reorder", reorder_data)
            self.log_result(result)
        
        # DELETE /categories/{id} - delete category (save for last)
        # We'll delete this after testing items
    
    def test_items_api(self):
        """Test items CRUD operations"""
        print("\n🍽️ Testing Items API...")
        
        # GET /items - retrieve all items
        result = self.make_request("GET", "/items")
        self.log_result(result)
        
        # GET /items with category filter
        if self.created_category_id:
            result = self.make_request("GET", f"/items?categoryId={self.created_category_id}")
            self.log_result(result)
        
        # POST /items - create new item
        if self.created_category_id:
            item_data = {**TEST_ITEM, "category_id": self.created_category_id}
            result = self.make_request("POST", "/items", item_data)
            self.log_result(result)
            
            if result.success and result.response_data:
                if isinstance(result.response_data, dict) and 'id' in result.response_data:
                    self.created_item_id = result.response_data['id']
                    print(f"   🍕 Created item ID: {self.created_item_id}")
        
        # PUT /items/{id} - update item
        if self.created_item_id:
            update_data = {
                "name": {
                    "ua": "Оновлений товар",
                    "pl": "Zaktualizowany produkt",
                    "en": "Updated Item"
                },
                "price": 29.99
            }
            result = self.make_request("PUT", f"/items/{self.created_item_id}", update_data)
            self.log_result(result)
        
        # PATCH /items/{id}/availability - toggle availability
        if self.created_item_id:
            availability_data = {"available": False}
            result = self.make_request("PATCH", f"/items/{self.created_item_id}/availability", availability_data)
            self.log_result(result)
        
        # DELETE /items/{id} - delete item
        if self.created_item_id:
            result = self.make_request("DELETE", f"/items/{self.created_item_id}")
            self.log_result(result)
    
    def test_locations_api(self):
        """Test locations API"""
        print("\n📍 Testing Locations API...")
        
        # GET /locations - retrieve all locations
        result = self.make_request("GET", "/locations")
        self.log_result(result)
        
        # Try to get a location ID from the response
        if result.success and result.response_data:
            if isinstance(result.response_data, list) and len(result.response_data) > 0:
                self.location_id = result.response_data[0].get('id')
                print(f"   🏪 Using location ID: {self.location_id}")
        
        # PUT /locations/{id} - update location details
        if self.location_id:
            result = self.make_request("PUT", f"/locations/{self.location_id}", TEST_LOCATION_UPDATE)
            self.log_result(result)
        
        # PUT /locations/{id}/delivery-settings - update delivery methods
        if self.location_id:
            delivery_data = TEST_DELIVERY_SETTINGS["delivery_settings"]  # Send array directly
            result = self.make_request("PUT", f"/locations/{self.location_id}/delivery-settings", delivery_data)
            self.log_result(result)
    
    def test_media_api(self):
        """Test media API"""
        print("\n🖼️ Testing Media API...")
        
        # POST /media/sign-upload - test Cloudinary signature generation
        result = self.make_request("POST", "/media/sign-upload", {})
        self.log_result(result)
    
    def test_error_handling(self):
        """Test error handling and validation"""
        print("\n⚠️ Testing Error Handling...")
        
        # Test invalid category creation (missing required fields)
        invalid_category = {"visible": True}  # Missing name
        result = self.make_request("POST", "/categories", invalid_category, expect_success=False)
        self.log_result(result)
        
        # Test invalid item creation (invalid category_id)
        invalid_item = {**TEST_ITEM, "category_id": "invalid-uuid"}
        result = self.make_request("POST", "/items", invalid_item, expect_success=False)
        self.log_result(result)
        
        # Test non-existent resource access
        result = self.make_request("GET", "/categories/non-existent-id", expect_success=False)
        self.log_result(result)
        
        # Test malformed JSON (this will be caught by the request library)
        try:
            response = self.session.post(
                f"{API_BASE}/categories",
                data="invalid json",
                headers={"Content-Type": "application/json", "Authorization": f"Bearer {self.auth_token}"},
                timeout=30
            )
            result = TestResult(
                endpoint="/categories",
                method="POST",
                success=response.status_code >= 400,
                status_code=response.status_code,
                response_data=response.text,
                error_message="Malformed JSON test"
            )
            self.log_result(result)
        except Exception as e:
            result = TestResult(
                endpoint="/categories",
                method="POST", 
                success=True,  # Exception is expected
                status_code=0,
                response_data=None,
                error_message=f"Expected error: {str(e)}"
            )
            self.log_result(result)
    
    def cleanup(self):
        """Clean up test data"""
        print("\n🧹 Cleaning up test data...")
        
        # Delete created category (this should also cascade delete items)
        if self.created_category_id:
            result = self.make_request("DELETE", f"/categories/{self.created_category_id}")
            self.log_result(result)
    
    def run_all_tests(self):
        """Run all test suites"""
        print("🤖 Starting ROBOT Admin Panel Backend API Tests")
        print(f"🌐 Testing API at: {API_BASE}")
        
        start_time = time.time()
        
        try:
            self.test_authentication()
            self.test_categories_api()
            self.test_items_api()
            self.test_locations_api()
            self.test_media_api()
            self.test_error_handling()
        finally:
            self.cleanup()
        
        total_time = time.time() - start_time
        
        # Print summary
        print(f"\n📊 Test Summary")
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
    tester = RobotApiTester()
    passed, failed = tester.run_all_tests()
    
    # Exit with error code if tests failed
    if failed > 0:
        exit(1)
    else:
        print(f"\n🎉 All tests passed!")
        exit(0)

if __name__ == "__main__":
    main()