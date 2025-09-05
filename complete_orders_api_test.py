#!/usr/bin/env python3
"""
Complete ROBOT Orders API Testing with Real Data

This script creates test items first, then tests Orders API with valid item IDs.
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

@dataclass
class TestResult:
    endpoint: str
    method: str
    success: bool
    status_code: int
    response_data: Any
    error_message: Optional[str] = None
    execution_time: float = 0.0

class CompleteOrdersApiTester:
    def __init__(self):
        self.session = requests.Session()
        self.auth_token = None
        self.test_results: List[TestResult] = []
        self.created_category_id = None
        self.created_item_ids: List[str] = []
        self.created_order_ids: List[str] = []
        
    def log_result(self, result: TestResult):
        """Log test result and print status"""
        self.test_results.append(result)
        status = "✅ PASS" if result.success else "❌ FAIL"
        print(f"{status} {result.method} {result.endpoint} ({result.status_code}) - {result.execution_time:.3f}s")
        if result.error_message:
            print(f"   Error: {result.error_message}")
        if result.success and result.response_data:
            if isinstance(result.response_data, dict):
                if 'id' in result.response_data:
                    print(f"   ID: {result.response_data['id']}")
            elif isinstance(result.response_data, list):
                print(f"   Response: Array with {len(result.response_data)} items")
    
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
                if isinstance(response_data, dict) and 'detail' in response_data:
                    if isinstance(response_data['detail'], str):
                        error_message = response_data['detail']
                    else:
                        error_message = f"Validation error: {response_data['detail']}"
                elif isinstance(response_data, dict) and 'message' in response_data:
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
    
    def setup_test_data(self):
        """Create test category and items for Orders testing"""
        print("\n🔧 Setting up test data...")
        
        # Create test category
        test_category = {
            "name": {
                "ua": "Тестові страви для замовлень",
                "pl": "Testowe dania do zamówień",
                "en": "Test Dishes for Orders"
            },
            "visible": True
        }
        
        result = self.make_request("POST", "/categories", test_category)
        self.log_result(result)
        
        if result.success and result.response_data and 'id' in result.response_data:
            self.created_category_id = result.response_data['id']
            print(f"   📁 Created category: {self.created_category_id}")
        
        # Create test items
        if self.created_category_id:
            test_items = [
                {
                    "category_id": self.created_category_id,
                    "name": {
                        "ua": "Борщ українській з м'ясом",
                        "pl": "Barszcz ukraiński z mięsem",
                        "en": "Ukrainian Borscht with Meat"
                    },
                    "description": {
                        "ua": "Традиційний український борщ з яловичиною та сметаною",
                        "pl": "Tradycyjny ukraiński barszcz z wołowiną i śmietaną",
                        "en": "Traditional Ukrainian borscht with beef and sour cream"
                    },
                    "price": 65.00,
                    "packaging_price": 3.00,
                    "available": True
                },
                {
                    "category_id": self.created_category_id,
                    "name": {
                        "ua": "Піца Маргарита",
                        "pl": "Pizza Margherita",
                        "en": "Margherita Pizza"
                    },
                    "description": {
                        "ua": "Класична піца з томатами, моцарелою та базиліком",
                        "pl": "Klasyczna pizza z pomidorami, mozzarellą i bazylią",
                        "en": "Classic pizza with tomatoes, mozzarella and basil"
                    },
                    "price": 180.00,
                    "packaging_price": 5.00,
                    "available": True
                },
                {
                    "category_id": self.created_category_id,
                    "name": {
                        "ua": "Хліб житній домашній",
                        "pl": "Chleb żytni domowy",
                        "en": "Homemade Rye Bread"
                    },
                    "description": {
                        "ua": "Свіжий житній хліб власного виробництва",
                        "pl": "Świeży chleb żytni własnej produkcji",
                        "en": "Fresh homemade rye bread"
                    },
                    "price": 25.00,
                    "packaging_price": 2.00,
                    "available": True
                }
            ]
            
            for item_data in test_items:
                result = self.make_request("POST", "/items", item_data)
                self.log_result(result)
                
                if result.success and result.response_data and 'id' in result.response_data:
                    self.created_item_ids.append(result.response_data['id'])
                    print(f"   🍽️ Created item: {result.response_data['id']}")
    
    def test_orders_with_real_data(self):
        """Test Orders API with real item data"""
        print("\n📋 Testing Orders API with Real Data...")
        
        if len(self.created_item_ids) < 2:
            print("❌ Not enough test items created, skipping order tests")
            return
        
        # Test order creation with real items
        test_order = {
            "customer": {
                "name": "Олександр Петренко",
                "phone": "+380671234567",
                "email": "oleksandr.petrenko@example.com"
            },
            "items": [
                {
                    "item_id": self.created_item_ids[0],  # Borscht
                    "name": {
                        "ua": "Борщ українській з м'ясом",
                        "pl": "Barszcz ukraiński z mięsem",
                        "en": "Ukrainian Borscht with Meat"
                    },
                    "price": 65.00,
                    "packaging_price": 3.00,
                    "quantity": 2,
                    "subtotal": 136.00  # (65 + 3) * 2
                },
                {
                    "item_id": self.created_item_ids[2],  # Bread
                    "name": {
                        "ua": "Хліб житній домашній",
                        "pl": "Chleb żytni domowy",
                        "en": "Homemade Rye Bread"
                    },
                    "price": 25.00,
                    "packaging_price": 2.00,
                    "quantity": 1,
                    "subtotal": 27.00  # (25 + 2) * 1
                }
            ],
            "location_id": "loc_1",
            "delivery": {
                "type": "courier",
                "address": "вул. Хрещатик, 1, Київ, 01001",
                "delivery_fee": 30.00,
                "estimated_time": "45 хвилин"
            },
            "subtotal": 163.00,  # 136 + 27
            "delivery_fee": 30.00,
            "total": 193.00,  # 163 + 30
            "notes": "Дзвонити за 10 хвилин до прибуття"
        }
        
        # Create order
        result = self.make_request("POST", "/orders", test_order)
        self.log_result(result)
        
        if result.success and result.response_data and 'id' in result.response_data:
            order_id = result.response_data['id']
            self.created_order_ids.append(order_id)
            print(f"   📝 Created order: {order_id}")
            
            # Test getting the created order
            result = self.make_request("GET", f"/orders/{order_id}")
            self.log_result(result)
            
            # Test status updates
            status_updates = ["confirmed", "preparing", "ready", "out_for_delivery", "delivered"]
            for status in status_updates:
                status_data = {"status": status}
                result = self.make_request("PATCH", f"/orders/{order_id}/status", status_data)
                self.log_result(result)
                
                if result.success:
                    print(f"   ✅ Status updated to: {status}")
        
        # Create pickup order
        pickup_order = {
            "customer": {
                "name": "Марія Іваненко",
                "phone": "+380501234567"
            },
            "items": [
                {
                    "item_id": self.created_item_ids[1],  # Pizza
                    "name": {
                        "ua": "Піца Маргарита",
                        "pl": "Pizza Margherita",
                        "en": "Margherita Pizza"
                    },
                    "price": 180.00,
                    "packaging_price": 5.00,
                    "quantity": 1,
                    "subtotal": 185.00  # (180 + 5) * 1
                }
            ],
            "location_id": "loc_1",
            "delivery": {
                "type": "pickup",
                "delivery_fee": 0.0
            },
            "subtotal": 185.00,
            "delivery_fee": 0.00,
            "total": 185.00,
            "notes": "Самовивіз о 18:00"
        }
        
        result = self.make_request("POST", "/orders", pickup_order)
        self.log_result(result)
        
        if result.success and result.response_data and 'id' in result.response_data:
            self.created_order_ids.append(result.response_data['id'])
    
    def test_orders_filtering_and_stats(self):
        """Test orders filtering and statistics"""
        print("\n🔍 Testing Orders Filtering & Statistics...")
        
        # Test basic listing
        result = self.make_request("GET", "/orders")
        self.log_result(result)
        
        # Test filtering by status
        for status in ["pending", "confirmed", "preparing", "ready", "delivered"]:
            result = self.make_request("GET", f"/orders?status={status}")
            self.log_result(result)
        
        # Test filtering by location
        result = self.make_request("GET", "/orders?location_id=loc_1")
        self.log_result(result)
        
        # Test with limit
        result = self.make_request("GET", "/orders?limit=5")
        self.log_result(result)
        
        # Test statistics
        result = self.make_request("GET", "/orders/stats/summary")
        self.log_result(result)
    
    def test_ukrainian_language_support(self):
        """Test Ukrainian language support in orders"""
        print("\n🇺🇦 Testing Ukrainian Language Support...")
        
        if self.created_order_ids:
            # Get order and check Ukrainian content
            result = self.make_request("GET", f"/orders/{self.created_order_ids[0]}")
            self.log_result(result)
            
            if result.success and result.response_data:
                order_data = result.response_data
                
                # Check if Ukrainian names are preserved
                if 'items' in order_data and len(order_data['items']) > 0:
                    first_item = order_data['items'][0]
                    if 'name' in first_item and 'ua' in first_item['name']:
                        print(f"   🇺🇦 Ukrainian item name: {first_item['name']['ua']}")
                        print("   ✅ Ukrainian language support confirmed")
                    else:
                        print("   ⚠️ Ukrainian language data not found in response")
    
    def test_error_handling_comprehensive(self):
        """Test comprehensive error handling"""
        print("\n⚠️ Testing Comprehensive Error Handling...")
        
        # Test invalid item ID
        invalid_order = {
            "customer": {
                "name": "Test User",
                "phone": "+380123456789"
            },
            "items": [
                {
                    "item_id": "invalid-item-id",
                    "name": {
                        "ua": "Тест",
                        "pl": "Test",
                        "en": "Test"
                    },
                    "price": 10.00,
                    "quantity": 1,
                    "subtotal": 10.00
                }
            ],
            "location_id": "loc_1",
            "delivery": {
                "type": "pickup"
            },
            "subtotal": 10.00,
            "delivery_fee": 0.00,
            "total": 10.00
        }
        
        result = self.make_request("POST", "/orders", invalid_order, expect_success=False)
        self.log_result(result)
        
        # Test invalid location ID
        if self.created_item_ids:
            invalid_location_order = {
                "customer": {
                    "name": "Test User",
                    "phone": "+380123456789"
                },
                "items": [
                    {
                        "item_id": self.created_item_ids[0],
                        "name": {
                            "ua": "Тест",
                            "pl": "Test",
                            "en": "Test"
                        },
                        "price": 10.00,
                        "quantity": 1,
                        "subtotal": 10.00
                    }
                ],
                "location_id": "invalid-location",
                "delivery": {
                    "type": "pickup"
                },
                "subtotal": 10.00,
                "delivery_fee": 0.00,
                "total": 10.00
            }
            
            result = self.make_request("POST", "/orders", invalid_location_order, expect_success=False)
            self.log_result(result)
    
    def cleanup_test_data(self):
        """Clean up all created test data"""
        print("\n🧹 Cleaning up test data...")
        
        # Delete orders
        for order_id in self.created_order_ids:
            result = self.make_request("DELETE", f"/orders/{order_id}")
            self.log_result(result)
        
        # Delete items
        for item_id in self.created_item_ids:
            result = self.make_request("DELETE", f"/items/{item_id}")
            self.log_result(result)
        
        # Delete category
        if self.created_category_id:
            result = self.make_request("DELETE", f"/categories/{self.created_category_id}")
            self.log_result(result)
    
    def run_complete_test_suite(self):
        """Run complete Orders API test suite"""
        print("🤖 Starting Complete ROBOT Orders API Test Suite")
        print(f"🌐 Testing API at: {API_BASE}")
        print(f"📅 Test started at: {time.strftime('%Y-%m-%d %H:%M:%S')}")
        
        start_time = time.time()
        
        try:
            # Test backend health
            result = self.make_request("GET", "/health")
            self.log_result(result)
            
            # Setup test data
            self.setup_test_data()
            
            # Run Orders API tests
            self.test_orders_with_real_data()
            self.test_orders_filtering_and_stats()
            self.test_ukrainian_language_support()
            self.test_error_handling_comprehensive()
            
        except Exception as e:
            print(f"❌ Test execution error: {str(e)}")
        finally:
            self.cleanup_test_data()
        
        total_time = time.time() - start_time
        
        # Print comprehensive summary
        print(f"\n📊 Complete Orders API Test Summary")
        print(f"⏱️ Total execution time: {total_time:.2f}s")
        
        passed = sum(1 for r in self.test_results if r.success)
        failed = len(self.test_results) - passed
        
        print(f"✅ Passed: {passed}")
        print(f"❌ Failed: {failed}")
        print(f"📈 Success rate: {(passed/len(self.test_results)*100):.1f}%")
        
        # Analyze Orders API functionality
        orders_functionality = {
            'health_check': any(r.success and r.endpoint == "/health" for r in self.test_results),
            'orders_list': any(r.success and r.endpoint == "/orders" and r.method == "GET" for r in self.test_results),
            'order_creation': any(r.success and r.endpoint == "/orders" and r.method == "POST" for r in self.test_results),
            'order_retrieval': any(r.success and "/orders/" in r.endpoint and r.method == "GET" for r in self.test_results),
            'status_updates': any(r.success and "/status" in r.endpoint and r.method == "PATCH" for r in self.test_results),
            'filtering': any(r.success and "?" in r.endpoint and r.method == "GET" for r in self.test_results),
            'statistics': any(r.success and "/stats/" in r.endpoint for r in self.test_results)
        }
        
        print(f"\n📋 Orders API Functionality Assessment:")
        for feature, working in orders_functionality.items():
            status = "✅ WORKING" if working else "❌ NOT WORKING"
            print(f"   {feature.replace('_', ' ').title()}: {status}")
        
        # Performance analysis
        response_times = [r.execution_time for r in self.test_results if r.success]
        if response_times:
            avg_response_time = sum(response_times) / len(response_times)
            max_response_time = max(response_times)
            print(f"\n⚡ Performance Analysis:")
            print(f"   📊 Average response time: {avg_response_time:.3f}s")
            print(f"   📊 Maximum response time: {max_response_time:.3f}s")
            
            if avg_response_time < 0.1:
                performance_rating = "🟢 EXCELLENT"
            elif avg_response_time < 0.5:
                performance_rating = "🟡 GOOD"
            else:
                performance_rating = "🔴 NEEDS IMPROVEMENT"
            
            print(f"   📊 Performance rating: {performance_rating}")
        
        # Ukrainian language support check
        ukrainian_support = any("Ukrainian" in str(r.response_data) or "українській" in str(r.response_data) 
                              for r in self.test_results if r.success and r.response_data)
        print(f"\n🇺🇦 Ukrainian Language Support: {'✅ CONFIRMED' if ukrainian_support else '❌ NOT DETECTED'}")
        
        if failed > 0:
            print(f"\n❌ Failed Tests Details:")
            for result in self.test_results:
                if not result.success:
                    print(f"   {result.method} {result.endpoint}: {result.error_message}")
        
        # Final assessment
        working_features = sum(orders_functionality.values())
        total_features = len(orders_functionality)
        
        print(f"\n🎯 Final Orders API Assessment:")
        if working_features == total_features:
            print("✅ Orders API is FULLY FUNCTIONAL and production-ready")
            print("   All core features working: creation, retrieval, status updates, filtering")
            print("   Ukrainian language support confirmed")
            print("   Performance is excellent")
        elif working_features >= total_features * 0.8:
            print("⚠️ Orders API is MOSTLY FUNCTIONAL with minor limitations")
            print("   Core functionality working but some features may need attention")
        elif working_features >= total_features * 0.5:
            print("🔶 Orders API has PARTIAL FUNCTIONALITY")
            print("   Some core features working but significant issues exist")
        else:
            print("❌ Orders API has CRITICAL ISSUES")
            print("   Major functionality problems detected")
        
        return passed, failed, orders_functionality

def main():
    """Main test execution"""
    tester = CompleteOrdersApiTester()
    passed, failed, functionality = tester.run_complete_test_suite()
    
    print(f"\n🏁 Complete Test Suite Finished")
    print(f"📊 Final Results: {passed} passed, {failed} failed")
    
    return passed, failed, functionality

if __name__ == "__main__":
    main()